import {vec2, vec3, vec4, mat4} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';

var activeProgram: WebGLProgram = -1;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, sources: Array<string>) {
    let res = gl.createShader(type);
    if(res === null) {
      throw "Shader creation failed";
    }

    this.shader = res;
    let source = '';
  
    for (const src of sources) {
      // Read the contents of each file and append it to the source string
      source += src + '\n';
    }
  
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);
  
    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;
  attrCol: number;
  attrUV: number;

  unifModel: WebGLUniformLocation;
  unifModelInvTr: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;
  unifColor: WebGLUniformLocation;
  unifTime: WebGLUniformLocation;

  constructor(shaders: Array<Shader>) {
    let res = gl.createProgram();
    if (res === null) {
      throw "ShaderProgram creation failed";
    }
    this.prog = res;

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrNor = gl.getAttribLocation(this.prog, "vs_Nor");
    this.attrCol = gl.getAttribLocation(this.prog, "vs_Col");
    this.attrUV = gl.getAttribLocation(this.prog, "vs_UV");
  }

  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      activeProgram = this.prog;
    }
  }

  setMat4(name: string, mat: mat4) {
    this.use();
    let loc = gl.getUniformLocation(this.prog, name);
    if (loc !== null) {
      gl.uniformMatrix4fv(loc, false, mat);
    }
  }

  setVec4(name: string, vec: vec4) {
    this.use();
    let loc = gl.getUniformLocation(this.prog, name);
    if (loc !== null) {
      gl.uniform4fv(loc, vec);
    }
  }

  setVec3(name: string, vec: vec3) {
    this.use();
    let loc = gl.getUniformLocation(this.prog, name);
    if (loc !== null) {
      gl.uniform3fv(loc, vec);
    }
  }
  
  setVec2(name: string, vec: vec2) {
    this.use();
    let loc = gl.getUniformLocation(this.prog, name);
    if (loc !== null) {
      gl.uniform2fv(loc, vec);
    }
  }

  setFloat(name: string, val: number) {
    this.use();
    let loc = gl.getUniformLocation(this.prog, name);
    if (loc !== null) {
      gl.uniform1f(loc, val);
    }
  }

  setTexture(name: string, tex: number) {
    this.use();
    let loc = gl.getUniformLocation(this.prog, name);
    if (loc !== null) {
      gl.uniform1i(loc, tex);
    }
  }

  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
    }

    if (this.attrNor != -1 && d.bindNor()) {
      gl.enableVertexAttribArray(this.attrNor);
      gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
    }

    if (this.attrUV != -1 && d.bindUV()) {
      gl.enableVertexAttribArray(this.attrUV);
      gl.vertexAttribPointer(this.attrUV, 2, gl.FLOAT, false, 0, 0);
    }

    d.bindIdx();
    gl.drawElements(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrNor != -1) gl.disableVertexAttribArray(this.attrNor);
  }
};

export default ShaderProgram;
