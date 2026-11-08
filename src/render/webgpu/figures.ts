/**
 * Instanced figures for the WebGPU renderer: each figure mesh uploaded once
 * (keyed by its id), each frame's instances in one buffer, one instanced draw
 * a mesh, in the scene pass where the CPU-placed figure triangles were - the
 * same blending, the same depth writes, the same scene uniforms.
 */

import type { FigureBatch, FigureMesh } from '../../figures/instances';
import { INSTANCE_STRIDE, MESH_STRIDE } from '../../figures/instances';
import { figureWgsl } from '../figureShaders';

interface MeshGpu {
  buf: GPUBuffer;
  count: number;
  used: number;
}

export class GpuFigures {
  readonly pipeline: GPURenderPipeline;
  private readonly meshes = new Map<number, MeshGpu>();
  private instances: GPUBuffer | null = null;
  private staging = new Float32Array(0);
  private frame = 0;

  constructor(
    private readonly device: GPUDevice,
    colorFormat: GPUTextureFormat,
    depthFormat: GPUTextureFormat,
    blend: GPUBlendState,
  ) {
    const module = device.createShaderModule({ label: 'figures', code: figureWgsl() });
    const M = MESH_STRIDE * 4;
    const I = INSTANCE_STRIDE * 4;
    this.pipeline = device.createRenderPipeline({
      label: 'figures',
      layout: 'auto',
      vertex: {
        module,
        entryPoint: 'vsFigure',
        buffers: [
          {
            arrayStride: M,
            attributes: [
              { shaderLocation: 0, offset: 0, format: 'float32x3' },
              { shaderLocation: 1, offset: 12, format: 'float32x4' },
              { shaderLocation: 2, offset: 28, format: 'float32x4' },
              { shaderLocation: 3, offset: 44, format: 'float32' },
              // How each vertex moves: turret and gun (`figures/instances.ts`).
              { shaderLocation: 8, offset: 48, format: 'float32x4' },
              { shaderLocation: 9, offset: 64, format: 'float32x4' },
              { shaderLocation: 10, offset: 80, format: 'float32x4' },
            ],
          },
          {
            arrayStride: I,
            stepMode: 'instance',
            attributes: [
              { shaderLocation: 4, offset: 0, format: 'float32x4' },
              { shaderLocation: 5, offset: 16, format: 'float32x4' },
              { shaderLocation: 6, offset: 32, format: 'float32x4' },
              { shaderLocation: 7, offset: 48, format: 'float32x4' },
            ],
          },
        ],
      },
      fragment: { module, entryPoint: 'fsFigure', targets: [{ format: colorFormat, blend }] },
      primitive: { topology: 'triangle-list' },
      depthStencil: { format: depthFormat, depthWriteEnabled: true, depthCompare: 'less-equal' },
    });
  }

  private meshFor(mesh: FigureMesh): MeshGpu {
    let m = this.meshes.get(mesh.id);
    if (m) return m;
    const buf = this.device.createBuffer({ label: `figure mesh ${mesh.id}`, size: Math.max(16, mesh.data.byteLength), usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
    this.device.queue.writeBuffer(buf, 0, mesh.data.buffer, mesh.data.byteOffset, mesh.data.byteLength);
    m = { buf, count: mesh.count, used: 0 };
    this.meshes.set(mesh.id, m);
    return m;
  }

  /**
   * Draws instances the GPU wrote itself: mesh `m`'s run starts at instance
   * `first[m]` of `instances`, and its count is in `args` (indirect draw
   * arguments, 16 bytes a mesh).
   */
  drawIndirect(pass: GPURenderPassEncoder, meshes: FigureMesh[], instances: GPUBuffer, first: Uint32Array, room: Uint32Array, args: GPUBuffer, bindGroup: GPUBindGroup): void {
    this.frame++;
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, bindGroup);
    for (let i = 0; i < meshes.length; i++) {
      if (!room[i]) continue;
      const m = this.meshFor(meshes[i]);
      m.used = this.frame;
      pass.setVertexBuffer(0, m.buf);
      pass.setVertexBuffer(1, instances, first[i] * INSTANCE_STRIDE * 4);
      pass.drawIndirect(args, i * 16);
    }
  }

  /** Records the draws into `pass`; the bind group carries the scene uniforms (viewProj, camera, fade). */
  draw(pass: GPURenderPassEncoder, batches: FigureBatch[], bindGroup: GPUBindGroup): void {
    this.frame++;
    let total = 0;
    for (const b of batches) total += b.count;
    if (!total) return;
    const need = total * INSTANCE_STRIDE;
    if (this.staging.length < need) this.staging = new Float32Array(Math.max(need, this.staging.length * 2));
    let o = 0;
    for (const b of batches) {
      this.staging.set(b.data.subarray(0, b.count * INSTANCE_STRIDE), o);
      o += b.count * INSTANCE_STRIDE;
    }
    if (!this.instances || this.instances.size < need * 4) {
      this.instances?.destroy();
      this.instances = this.device.createBuffer({ label: 'figure instances', size: Math.max(need * 4 * 2, 1024 * INSTANCE_STRIDE * 4), usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
    }
    this.device.queue.writeBuffer(this.instances, 0, this.staging.buffer, 0, need * 4);
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, bindGroup);
    let first = 0;
    for (const b of batches) {
      if (!b.count) continue;
      const m = this.meshFor(b.mesh);
      m.used = this.frame;
      pass.setVertexBuffer(0, m.buf);
      pass.setVertexBuffer(1, this.instances, first * INSTANCE_STRIDE * 4);
      pass.draw(m.count, b.count);
      first += b.count;
    }
    if (this.frame % 600 === 0) {
      for (const [id, m] of this.meshes) {
        if (this.frame - m.used < 600) continue;
        m.buf.destroy();
        this.meshes.delete(id);
      }
    }
  }

  dispose(): void {
    for (const m of this.meshes.values()) m.buf.destroy();
    this.meshes.clear();
    this.instances?.destroy();
    this.instances = null;
  }
}
