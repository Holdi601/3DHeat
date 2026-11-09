/**
 * Instanced figures for the WebGPU renderer: each figure mesh uploaded once
 * (keyed by its id), each frame's instances in one buffer, one instanced draw
 * a mesh, in the scene pass where the CPU-placed figure triangles were - the
 * same blending, the same depth writes, the same scene uniforms.
 */

import type { FigureBatch, FigureMesh } from '../../figures/instances';
import { INSTANCE_STRIDE, MESH_STRIDE } from '../../figures/instances';
import { figureWgsl, seeThrough } from '../figureShaders';

/** Figure mesh bytes written in one frame at most; see `meshFor`. */
const MESH_BYTES_PER_FRAME = 2 * 1024 * 1024;

interface MeshGpu {
  buf: GPUBuffer;
  count: number;
  /** Whether any of it is see-through (a propeller's disc, a canopy): drawn again in the see-through pass. */
  see: boolean;
  used: number;
}

/** A see-through draw recorded in the solid pass, to be drawn again after everything solid. */
interface SeeDraw {
  m: MeshGpu;
  instances: GPUBuffer;
  /** Byte offset of the run in `instances`. */
  offset: number;
  group: GPUBindGroup;
  /** Instance count, or with `args` the byte offset of its indirect arguments. */
  count: number;
  args: GPUBuffer | null;
}

export class GpuFigures {
  /** The solid parts, writing depth. Its bind group layout is the see-through pipeline's too. */
  readonly pipeline: GPURenderPipeline;
  /** The see-through parts, after everything solid, not writing depth (`SEE_THROUGH_BELOW`). */
  private readonly seePipeline: GPURenderPipeline;
  private readonly seeDraws: SeeDraw[] = [];
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
    // One layout for both, so a bind group made for `pipeline` serves the see-through pass too.
    const layout = device.createPipelineLayout({
      bindGroupLayouts: [
        device.createBindGroupLayout({
          label: 'figures',
          entries: [{ binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } }],
        }),
      ],
    });
    const pipeline = (alphaPass: number, depthWriteEnabled: boolean): GPURenderPipeline => device.createRenderPipeline({
      label: alphaPass === 2 ? 'figures see-through' : 'figures',
      layout,
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
      fragment: { module, entryPoint: 'fsFigure', constants: { alphaPass }, targets: [{ format: colorFormat, blend }] },
      primitive: { topology: 'triangle-list' },
      depthStencil: { format: depthFormat, depthWriteEnabled, depthCompare: 'less-equal' },
    });
    this.pipeline = pipeline(1, true);
    this.seePipeline = pipeline(2, false);
  }

  /** Mesh bytes written this frame, and the frame they count for; see `meshFor`. */
  private uploadedBytes = 0;
  private uploadedFrame = -1;

  /**
   * A mesh's vertex buffer, made on first use - a few megabytes of them a
   * frame at most, null past that: the frame the GPU tracks became ready wrote
   * every figure of the catalogue at once, a tenth of a second without a frame.
   * A mesh not made yet is drawn from the next frame.
   */
  private meshFor(mesh: FigureMesh): MeshGpu | null {
    let m = this.meshes.get(mesh.id);
    if (m) return m;
    if (this.uploadedFrame !== this.frame) {
      this.uploadedFrame = this.frame;
      this.uploadedBytes = 0;
    }
    if (this.uploadedBytes > 0 && this.uploadedBytes + mesh.data.byteLength > MESH_BYTES_PER_FRAME) return null;
    this.uploadedBytes += mesh.data.byteLength;
    const buf = this.device.createBuffer({ label: `figure mesh ${mesh.id}`, size: Math.max(16, mesh.data.byteLength), usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
    this.device.queue.writeBuffer(buf, 0, mesh.data.buffer, mesh.data.byteOffset, mesh.data.byteLength);
    m = { buf, count: mesh.count, see: seeThrough(mesh.data), used: 0 };
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
      if (!m) continue;
      m.used = this.frame;
      pass.setVertexBuffer(0, m.buf);
      pass.setVertexBuffer(1, instances, first[i] * INSTANCE_STRIDE * 4);
      pass.drawIndirect(args, i * 16);
      if (m.see) this.seeDraws.push({ m, instances, offset: first[i] * INSTANCE_STRIDE * 4, group: bindGroup, count: i * 16, args });
    }
  }

  /**
   * The see-through parts (propeller discs) of what `draw` and `drawIndirect` drew
   * this frame, from the same instances: after everything solid, not writing depth.
   */
  drawSeeThrough(pass: GPURenderPassEncoder): void {
    if (!this.seeDraws.length) return;
    pass.setPipeline(this.seePipeline);
    for (const d of this.seeDraws) {
      pass.setBindGroup(0, d.group);
      pass.setVertexBuffer(0, d.m.buf);
      pass.setVertexBuffer(1, d.instances, d.offset);
      if (d.args) pass.drawIndirect(d.args, d.count);
      else pass.draw(d.m.count, d.count);
    }
    this.seeDraws.length = 0;
  }

  /**
   * Records the draws into `pass`; the bind group carries the scene uniforms (viewProj, camera, fade).
   * With `origin`, the batches' absolute positions are moved relative to it, for scene uniforms
   * relative to the same point (FrameParams.viewProjRel).
   */
  draw(pass: GPURenderPassEncoder, batches: FigureBatch[], bindGroup: GPUBindGroup, origin: ArrayLike<number> | null = null): void {
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
    // Two 32-bit numbers this close subtract exactly, so nothing more is lost here.
    if (origin) {
      for (let i = 0; i < need; i += INSTANCE_STRIDE) {
        this.staging[i] -= origin[0];
        this.staging[i + 1] -= origin[1];
        this.staging[i + 2] -= origin[2];
      }
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
      if (!m) {
        first += b.count;
        continue;
      }
      m.used = this.frame;
      pass.setVertexBuffer(0, m.buf);
      pass.setVertexBuffer(1, this.instances, first * INSTANCE_STRIDE * 4);
      pass.draw(m.count, b.count);
      if (m.see) this.seeDraws.push({ m, instances: this.instances, offset: first * INSTANCE_STRIDE * 4, group: bindGroup, count: b.count, args: null });
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
