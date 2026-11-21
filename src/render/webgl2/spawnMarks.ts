/**
 * The layout's spawn markers on WebGL2 (`../spawnMarks.ts`): the instances
 * uploaded when they are a new array, then the lines to their owners (where
 * asked) and the markers, each one instanced draw over the finished picture
 * without depth.
 */

import type { FrameParams } from '../types';
import { SPAWN_INSTANCE_FLOATS, spawnGlslFs, spawnGlslVs } from '../spawnMarks';
import { compileProgram, UniformCache } from './glutil';

type SpawnDraw = NonNullable<FrameParams['spawnMarks']>;

export class GlSpawnMarks {
  private readonly marks: WebGLProgram;
  private readonly lines: WebGLProgram;
  private readonly um: UniformCache;
  private readonly ul: UniformCache;
  private readonly vao: WebGLVertexArrayObject;
  private readonly buf: WebGLBuffer;
  private capacity = 0;
  private data: Float32Array | null = null;

  constructor(private readonly gl: WebGL2RenderingContext) {
    this.marks = compileProgram(gl, spawnGlslVs(false), spawnGlslFs(false), 'spawn marks');
    this.lines = compileProgram(gl, spawnGlslVs(true), spawnGlslFs(true), 'spawn lines');
    this.um = new UniformCache(gl, this.marks);
    this.ul = new UniformCache(gl, this.lines);
    this.vao = gl.createVertexArray()!;
    this.buf = gl.createBuffer()!;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    const stride = SPAWN_INSTANCE_FLOATS * 4;
    for (let i = 0; i < 3; i++) {
      gl.enableVertexAttribArray(i);
      gl.vertexAttribPointer(i, 4, gl.FLOAT, false, stride, i * 16);
      gl.vertexAttribDivisor(i, 1);
    }
    gl.bindVertexArray(null);
  }

  draw(params: FrameParams, s: SpawnDraw): void {
    const gl = this.gl;
    if (!s.count) return;
    if (this.data !== s.data) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
      const n = s.count * SPAWN_INSTANCE_FLOATS;
      if (this.capacity < n) {
        this.capacity = n;
        gl.bufferData(gl.ARRAY_BUFFER, s.data.subarray(0, n), gl.STATIC_DRAW);
      } else gl.bufferSubData(gl.ARRAY_BUFFER, 0, s.data, 0, n);
      this.data = s.data;
    }
    const ratio = globalThis.devicePixelRatio || 1;
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindVertexArray(this.vao);
    const pass = (prog: WebGLProgram, u: UniformCache) => {
      gl.useProgram(prog);
      u.mat4('uViewProj', params.viewProj);
      u.f4('uView', params.width, params.height, ratio, 0);
      u.f4('uCam', params.cameraPos[0], params.cameraPos[1], params.cameraPos[2], 0);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, s.count);
    };
    if (s.lines) pass(this.lines, this.ul);
    pass(this.marks, this.um);
    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
  }

  dispose(): void {
    this.gl.deleteBuffer(this.buf);
    this.gl.deleteVertexArray(this.vao);
    this.gl.deleteProgram(this.marks);
    this.gl.deleteProgram(this.lines);
  }
}
