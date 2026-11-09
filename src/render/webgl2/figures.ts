/**
 * Instanced figures for the WebGL2 renderer: each figure mesh uploaded once
 * (keyed by its id), each frame's instances in one buffer, one instanced draw
 * a mesh. Drawn where the CPU-placed figure triangles were, with the same
 * blending and depth writes.
 */

import type { FigureBatch } from '../../figures/instances';
import { INSTANCE_STRIDE, MESH_STRIDE } from '../../figures/instances';
import { figureGlslFs, figureGlslVs } from '../figureShaders';
import { compileProgram, UniformCache } from './glutil';

interface MeshGl {
  buf: WebGLBuffer;
  vao: WebGLVertexArrayObject;
  count: number;
  /** The frame it was last drawn, to free meshes nobody draws any more. */
  used: number;
}

export class GlFigures {
  private readonly prog: WebGLProgram;
  private readonly u: UniformCache;
  private readonly meshes = new Map<number, MeshGl>();
  private readonly instances: WebGLBuffer;
  private capacity = 0;
  private staging = new Float32Array(0);
  private frame = 0;

  constructor(private readonly gl: WebGL2RenderingContext) {
    this.prog = compileProgram(gl, figureGlslVs(), figureGlslFs(), 'figures');
    this.u = new UniformCache(gl, this.prog);
    const b = gl.createBuffer();
    if (!b) throw new Error('createBuffer failed (figure instances)');
    this.instances = b;
  }

  private meshFor(batch: FigureBatch): MeshGl {
    const gl = this.gl;
    let m = this.meshes.get(batch.mesh.id);
    if (m) return m;
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, batch.mesh.data, gl.STATIC_DRAW);
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    const S = MESH_STRIDE * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, S, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, S, 12);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, S, 28);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, S, 44);
    // How each vertex moves: turret and gun (`figures/instances.ts`).
    for (let k = 0; k < 3; k++) {
      gl.enableVertexAttribArray(8 + k);
      gl.vertexAttribPointer(8 + k, 4, gl.FLOAT, false, S, 48 + k * 16);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instances);
    for (let k = 0; k < 4; k++) {
      gl.enableVertexAttribArray(4 + k);
      gl.vertexAttribDivisor(4 + k, 1);
    }
    gl.bindVertexArray(null);
    m = { buf, vao, count: batch.mesh.count, used: 0 };
    this.meshes.set(batch.mesh.id, m);
    return m;
  }

  /**
   * Draws `batches`. With `origin`, their positions are absolute and are moved
   * relative to it here, for a `viewProj` relative to the same point (see
   * FrameParams.viewProjRel); without, they already are.
   */
  draw(batches: FigureBatch[], viewProj: Float32Array, cameraPos: ArrayLike<number>, origin: ArrayLike<number> | null = null): void {
    const gl = this.gl;
    this.frame++;
    let total = 0;
    for (const b of batches) total += b.count;
    if (!total) return;
    // Every batch's instances in one upload.
    const need = total * INSTANCE_STRIDE;
    if (this.staging.length < need) this.staging = new Float32Array(Math.max(need, this.staging.length * 2));
    let o = 0;
    for (const b of batches) {
      this.staging.set(b.data.subarray(0, b.count * INSTANCE_STRIDE), o);
      o += b.count * INSTANCE_STRIDE;
    }
    // Two 32-bit numbers this close subtract exactly, so nothing more is lost here.
    if (origin) {
      for (let i = 0; i < need; i += INSTANCE_STRIDE) {
        this.staging[i] -= origin[0];
        this.staging[i + 1] -= origin[1];
        this.staging[i + 2] -= origin[2];
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instances);
    if (this.capacity < need) {
      this.capacity = Math.max(need, this.capacity * 2, 1024 * INSTANCE_STRIDE);
      gl.bufferData(gl.ARRAY_BUFFER, this.capacity * 4, gl.DYNAMIC_DRAW);
    }
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.staging, 0, need);

    gl.useProgram(this.prog);
    gl.uniformMatrix4fv(this.u.loc('uViewProj'), false, viewProj);
    this.u.f3('uCameraPos', cameraPos[0], cameraPos[1], cameraPos[2]);
    this.u.f1('uFadeStart', 1e9);
    this.u.f1('uFadeEnd', 1e9 + 1);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(true);
    const S = INSTANCE_STRIDE * 4;
    let first = 0;
    for (const b of batches) {
      if (!b.count) continue;
      const m = this.meshFor(b);
      m.used = this.frame;
      gl.bindVertexArray(m.vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.instances);
      // The instance attributes point at this batch's run of the buffer.
      for (let k = 0; k < 4; k++) gl.vertexAttribPointer(4 + k, 4, gl.FLOAT, false, S, first * S + k * 16);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, m.count, b.count);
      first += b.count;
    }
    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
    // Meshes not drawn for a while (another dataset's figures) are let go.
    if (this.frame % 600 === 0) {
      for (const [id, m] of this.meshes) {
        if (this.frame - m.used < 600) continue;
        gl.deleteBuffer(m.buf);
        gl.deleteVertexArray(m.vao);
        this.meshes.delete(id);
      }
    }
  }

  dispose(): void {
    const gl = this.gl;
    for (const m of this.meshes.values()) {
      gl.deleteBuffer(m.buf);
      gl.deleteVertexArray(m.vao);
    }
    this.meshes.clear();
    gl.deleteBuffer(this.instances);
    gl.deleteProgram(this.prog);
  }
}
