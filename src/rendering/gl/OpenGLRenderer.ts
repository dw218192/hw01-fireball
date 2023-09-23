import {vec2, mat4, vec3, vec4} from 'gl-matrix';
import Drawable from './Drawable';
import Camera from '../../Camera';
import {gl} from '../../globals';
import ShaderProgram from './ShaderProgram';

// In this file, `gl` is accessible because it is imported above
class OpenGLRenderer {
  constructor(public canvas: HTMLCanvasElement) {
  }

  setClearColor(r: number, g: number, b: number, a: number) {
    gl.clearColor(r, g, b, a);
  }

  setSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  render(drawables: Array<Drawable>, prog: ShaderProgram, data : [string, number|vec2|vec3|vec4|mat4][]) {
    for (let d of data) {
      const uniformName = d[0];
      const uniformValue = d[1];
      
      if (typeof uniformValue === 'number') {
          prog.setFloat(uniformName, uniformValue);
      } else if (uniformValue instanceof Float32Array) {
          switch (uniformValue.length) {
              case 2:
                  prog.setVec2(uniformName, uniformValue);
                  break;
              case 3:
                  prog.setVec3(uniformName, uniformValue);
                  break;
              case 4:
                  prog.setVec4(uniformName, uniformValue);
                  break;
              case 16:
                  prog.setMat4(uniformName, uniformValue);
                  break;
              default:
                  console.error(`unhandled uniform ${uniformName} of length ${uniformValue.length}`);
                  break;
          }
      } else if (Array.isArray(uniformValue)) {
        switch (uniformValue.length) {
            case 2: // Assuming vec2 is represented as Array of length 2
                prog.setVec2(uniformName, uniformValue);
                break;
            case 3: // Assuming vec3 is represented as Array of length 3
                prog.setVec3(uniformName, uniformValue);
                break;
            case 4: // Assuming vec4 is represented as Array of length 4
                prog.setVec4(uniformName, uniformValue);
                break;
            case 16: // Assuming mat4 is represented as Array of length 16
                prog.setMat4(uniformName, uniformValue);
                break;
            default:
                console.error(`unhandled uniform ${uniformName}`);
                break;
        }
      } else {
          console.error(`unhandled uniform ${uniformName}`);
      }
    }
    for (let drawable of drawables) {
      prog.draw(drawable);
    }
  }
};

export default OpenGLRenderer;
