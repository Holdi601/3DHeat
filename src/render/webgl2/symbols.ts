/**
 * The far-off glyphs on WebGL2 (`symbols/shaders.ts`): the atlas uploaded
 * once, one instanced quad draw from an instance VAO - the GPU tracks'
 * transform feedback rows (a glyph where the scale is negative), or the CPU
 * path's few.
 */

import { INSTANCE_STRIDE } from '../../figures/instances';
import { ATLAS_HEIGHT, ATLAS_WIDTH, symbolAtlas } from '../symbols/atlas';
import { symbolGlslFs, symbolGlslVs } from '../symbols/shaders';
import type { SymbolParams } from '../types';
import { compileProgram, UniformCache } from './glutil';

export class GlSymbols {
  private readonly prog: WebGLProgram;
  private readonly U: UniformCache;
  private atlas: WebGLTexture | null = null;
  private failed = false;
  private readonly buf: WebGLBuffer;
  private readonly vao: WebGLVertexArrayObject;
  private room = 0;

  constructor(private readonly gl: WebGL2RenderingContext) {
    this.prog = compileProgram(gl, symbolGlslVs(), symbolGlslFs(), 'glyphs');
    this.U = new UniformCache(gl, this.prog);
    this.buf = gl.createBuffer()!;
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    for (let k = 0; k < 4; k++) {
      gl.enableVertexAttribArray(4 + k);
      gl.vertexAttribPointer(4 + k, 4, gl.FLOAT, false, INSTANCE_STRIDE * 4, k * 16);
      gl.vertexAttribDivisor(4 + k, 1);
    }
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  private ready(): boolean {
    if (this.atlas) return true;
    if (this.failed) return false;
    const pixels = symbolAtlas();
    if (!pixels) {
      this.failed = true;
      return false;
    }
    const gl = this.gl;
    this.atlas = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.atlas);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, ATLAS_WIDTH, ATLAS_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return true;
  }

  /** `count` instances from `vao` (instance attributes at 4-7); `sign` -1 for the tracks' rows, whose glyph sizes are negative. */
  drawFrom(vao: WebGLVertexArrayObject, count: number, sign: number, p: SymbolParams, viewProj: Float32Array, camera: ArrayLike<number>, w: number, h: number): void {
    if (!count || !this.ready()) return;
    const gl = this.gl;
    gl.useProgram(this.prog);
    const U = this.U;
    U.mat4('uViewProj', viewProj);
    gl.uniform4f(U.loc('uView'), w, h, p.style, p.mode);
    gl.uniform4f(U.loc('uOpt'), p.ticks ? 1 : 0, sign, 0, 0);
    gl.uniform4f(U.loc('uCam'), camera[0], camera[1], camera[2], 0);
    gl.uniform4fv(U.loc('uSides'), p.sides.subarray(0, 64));
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.atlas);
    U.i1('uAtlas', 0);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const depth = gl.isEnabled(gl.DEPTH_TEST);
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.bindVertexArray(vao);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, count);
    gl.bindVertexArray(null);
    gl.depthMask(true);
    if (depth) gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
  }

  /** Glyphs placed on the CPU. */
  draw(p: SymbolParams, viewProj: Float32Array, camera: ArrayLike<number>, w: number, h: number): void {
    const g = p.cpu;
    if (!g || !g.count) return;
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    const floats = g.count * INSTANCE_STRIDE;
    if (floats > this.room) {
      this.room = Math.max(floats * 2, 1024 * INSTANCE_STRIDE);
      gl.bufferData(gl.ARRAY_BUFFER, this.room * 4, gl.DYNAMIC_DRAW);
    }
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, g.data, 0, floats);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    this.drawFrom(this.vao, g.count, 1, p, viewProj, camera, w, h);
  }

  dispose(): void {
    const gl = this.gl;
    gl.deleteProgram(this.prog);
    gl.deleteBuffer(this.buf);
    gl.deleteVertexArray(this.vao);
    if (this.atlas) gl.deleteTexture(this.atlas);
  }
}
