import {mat4, vec2, vec3, vec4} from 'gl-matrix';
const Stats = require('stats-js');
import * as DAT from 'dat.gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Drawable from './rendering/gl/Drawable';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  'Reset' : resetControls,
  'Debug Noise': false,
  'Shell Pass': true,
  radiationFactor1 : 20.0,
  radiationFactor2 : 1.90,
  shellSteps : 30,
  mainNoiseFreq : 1.0,
  subNoiseFreq : 10.0,
};

let icosphere: Icosphere;
let square: Square;
let rotAngle: number = 0;
let lastTime: number = 0;

let coreRadius : number = 1.0;
let shellRadius : number = coreRadius * 1.5;

function resetControls(gui : DAT.GUI) {
  controls.radiationFactor1 = 20.0;
  controls.radiationFactor2 = 1.90;
  controls.shellSteps = 30;
  controls.mainNoiseFreq = 1.0;
  controls.subNoiseFreq = 10.0;
  controls['Shell Pass'] = true;
  controls['Debug Noise'] = false;
}

function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), coreRadius, 5);
  icosphere.create();

  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();

  gui.add(controls, 'Reset').onFinishChange(function() { gui.updateDisplay(); });
  gui.add(controls, 'Debug Noise');
  gui.add(controls, 'radiationFactor1', 4.5, 20.0).step(0.1);
  gui.add(controls, 'radiationFactor2', 0.01, 1.90).step(0.01);
  gui.add(controls, 'shellSteps', 30, 100).step(1);
  gui.add(controls, 'mainNoiseFreq', 1.0, 10.0).step(0.1);
  gui.add(controls, 'subNoiseFreq', 1.0, 20.0).step(0.1);
  gui.add(controls, 'Shell Pass');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


  let header : string = '#version 300 es\nprecision highp float;\n' + 
  require('./shaders/defines.glsl')
  let pass1_prog = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, [header, require('./shaders/perlin.glsl'), require('./shaders/fireball-vert.glsl')]),
    new Shader(gl.FRAGMENT_SHADER, [header, require('./shaders/perlin.glsl'), require('./shaders/fireball-frag.glsl')]),
  ]);
  let pass2_prog = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, [header, require('./shaders/fireball-vert-pass2.glsl')]),
    new Shader(gl.FRAGMENT_SHADER, [header, require('./shaders/perlin.glsl'), require('./shaders/fireball-frag-pass2.glsl')]),
  ]);
  let noise_debug_prog = new ShaderProgram([
      new Shader(gl.VERTEX_SHADER, [header, require('./shaders/noise-vert.glsl')]),
      new Shader(gl.FRAGMENT_SHADER, [header, require('./shaders/perlin.glsl'), require('./shaders/noise-frag.glsl')]),
  ]);

  // This function will be called every frame
  function tick(timeStamp : number) {
    // log
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

    let t = timeStamp / 1000.0;
    let dt = (timeStamp - lastTime) / 1000.0;
    if (!controls['Debug Noise']) {
      rotAngle += 30 * dt;
      let model : mat4 = mat4.create();
      model = mat4.rotateY(model, model, rotAngle * Math.PI / 180.0);
      renderer.render(
        [icosphere],
        pass1_prog,
        [
          ['u_Time', t],
          ['u_Model', model],
          ['u_View', camera.viewMatrix],
          ['u_Proj', camera.projectionMatrix],
          ['u_Radius', coreRadius],
          ['u_CameraPos', camera.controls.eye],
          ['u_Far', camera.far],
          ['u_Near', camera.near],

          ['u_MainNoiseFreq', controls.mainNoiseFreq],
          ['u_SubNoiseFreq', controls.subNoiseFreq],
        ]
      );

      if (controls['Shell Pass']) {
        renderer.render(
          [square],
          pass2_prog,
          [
            ['u_Time', t],
            ['u_Model', mat4.create()],
            ['u_View', camera.viewMatrix],
            ['u_Proj', camera.projectionMatrix],
            ['u_Radius', shellRadius],
            ['u_Radiation', 22.9 - controls.radiationFactor1],
            ['u_RadiationPower', 2.0 - controls.radiationFactor2],
            ['u_Steps', controls.shellSteps],
            ['u_CameraPos', camera.controls.eye],
            ['u_Far', camera.far],
            ['u_Near', camera.near],
          ]
        )
      }
    } else {
      renderer.render(
        [square],
        noise_debug_prog,
        [['u_Time', t]],
      );
    }
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    lastTime = timeStamp;
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  requestAnimationFrame(tick);
}

main();
