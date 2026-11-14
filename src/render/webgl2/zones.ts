/**
 * The capture zones' discs in WebGL2 (`zoneShaders.ts`): the vertices
 * uploaded when they are a new array, the zones' state as uniforms every
 * draw. On the ground among the see-through triangles, or over the finished
 * picture without depth (`xray`).
 */

import type { FrameParams } from '../types';
import { MAX_ZONES, ZONE_GLSL_FS, ZONE_GLSL_VS, ZONE_MIN_PX, ZONE_VERTEX_FLOATS } from '../zoneShaders';
import { compileProgram, UniformCache } from './glutil';

type ZoneDraw = NonNullable<FrameParams['objectiveZones']>;

export class GlZones {
  private readonly prog: WebGLProgram;
  private readonly u: UniformCache;
  private readonly vao: WebGLVertexArrayObject;
  private readonly buf: WebGLBuffer;
  private capacity = 0;
  private data: Float32Array | null = null;

  constructor(private readonly gl: WebGL2RenderingContext) {
    this.prog = compileProgram(gl, ZONE_GLSL_VS, ZONE_GLSL_FS, 'zones');
    this.u = new UniformCache(gl, this.prog);
    this.vao = gl.createVertexArray()!;
    this.buf = gl.createBuffer()!;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    const stride = ZONE_VERTEX_FLOATS * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 12);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, stride, 24);
    gl.bindVertexArray(null);
  }

  /** `ground`: depth tested, not written; otherwise over everything at `z.xray` of their alpha. */
  draw(params: FrameParams, z: ZoneDraw, ground: boolean): void {
    const gl = this.gl;
    if (!z.count) return;
    if (this.data !== z.verts) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
      const n = z.count * ZONE_VERTEX_FLOATS;
      if (this.capacity < n) {
        this.capacity = n;
        gl.bufferData(gl.ARRAY_BUFFER, z.verts.subarray(0, n), gl.STATIC_DRAW);
      } else gl.bufferSubData(gl.ARRAY_BUFFER, 0, z.verts, 0, n);
      this.data = z.verts;
    }
    gl.useProgram(this.prog);
    this.u.mat4('uViewProj', params.viewProj);
    this.u.f2('uScale', (params.proj[5] * params.height) / 2, ZONE_MIN_PX * (globalThis.devicePixelRatio || 1));
    this.u.f1('uXray', ground ? 0 : z.xray);
    const loc = this.u.loc('uZones[0]');
    if (loc) gl.uniform4fv(loc, z.state, 0, MAX_ZONES * 8);
    if (ground) gl.depthMask(false);
    else gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, z.count);
    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
  }

  dispose(): void {
    this.gl.deleteBuffer(this.buf);
    this.gl.deleteVertexArray(this.vao);
    this.gl.deleteProgram(this.prog);
  }
}
