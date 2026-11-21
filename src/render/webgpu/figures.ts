/**
 * Instanced figures for the WebGPU renderer: each figure mesh uploaded once
 * (keyed by its id), each frame's instances in one buffer, one instanced draw
 * a mesh, in the scene pass where the CPU-placed figure triangles were - the
 * same blending, the same depth writes, the same scene uniforms.
 */

import { GPU_DEPTH_TEST } from '../depth';
import type { FigureBatch, FigureMesh } from '../../figures/instances';
import { INSTANCE_STRIDE, MESH_STRIDE } from '../../figures/instances';
import { figureWgsl, seeThrough } from '../figureShaders';
import { markResident, nextToUpload, playbackStarting, setMeshUploader, uploadsWaiting } from '../../figures/residency';

/** Figure mesh bytes written in one frame at most; see `meshFor`. */
const MESH_BYTES_PER_FRAME = 2 * 1024 * 1024;
/** The same while playback starts (`playbackStarting`): only what a frame draws, and less of it. */
const MESH_BYTES_STARTING = 512 * 1024;

/** A mesh part way to the GPU: its buffer, and how far it is written. */
interface MeshUpload {
  mesh: FigureMesh;
  buf: GPUBuffer;
  at: number;
  see: boolean;
}

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
      depthStencil: { format: depthFormat, depthWriteEnabled, depthCompare: GPU_DEPTH_TEST },
    });
    this.pipeline = pipeline(1, true);
    this.seePipeline = pipeline(2, false);
    setMeshUploader(true);
  }

  /** Mesh bytes written this frame (`pump` starts the count); see `meshFor`. */
  private uploadedBytes = 0;
  /** This frame's budget for them (`pump`). */
  private budget = MESH_BYTES_PER_FRAME;
  /** Meshes part way to the GPU, by id: written a slice a frame, drawn once whole. */
  private readonly partial = new Map<number, MeshUpload>();

  /**
   * A mesh's vertex buffer, made on first use and written a few megabytes a
   * frame at most, null until it is whole: the frame the GPU tracks became
   * ready wrote every figure of the catalogue at once, a tenth of a second
   * without a frame, and one ship's model is tens of megabytes. A mesh not
   * whole yet is drawn from the frame it is. Meshes asked for ahead of their
   * first draw (`figures/residency.ts`) take what a frame's draws leave.
   */
  private meshFor(mesh: FigureMesh): MeshGpu | null {
    const m = this.meshes.get(mesh.id);
    if (m) return m;
    let u = this.partial.get(mesh.id);
    if (!u) {
      if (this.uploadedBytes >= this.budget) return null;
      const buf = this.device.createBuffer({ label: `figure mesh ${mesh.id}`, size: Math.max(16, mesh.data.byteLength), usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
      u = { mesh, buf, at: 0, see: false };
      this.partial.set(mesh.id, u);
    }
    return this.write(u);
  }

  /** Writes what this frame's budget allows of an upload; the mesh once it is whole, else null. */
  private write(u: MeshUpload): MeshGpu | null {
    const d = u.mesh.data;
    const room = this.budget - this.uploadedBytes;
    if (room <= 0) return null;
    // Whole vertices, so the see-through test reads each one once.
    const V = MESH_STRIDE * 4;
    const n = Math.min(d.byteLength - u.at, Math.max(V, Math.floor(room / V) * V));
    if (n > 0) {
      this.device.queue.writeBuffer(u.buf, u.at, d.buffer, d.byteOffset + u.at, n);
      u.see ||= seeThrough(d.subarray(u.at / 4, (u.at + n) / 4));
      u.at += n;
      this.uploadedBytes += n;
    }
    if (u.at < d.byteLength) return null;
    this.partial.delete(u.mesh.id);
    const m: MeshGpu = { buf: u.buf, count: u.mesh.count, see: u.see, used: this.frame };
    this.meshes.set(u.mesh.id, m);
    markResident(u.mesh.id, true);
    return m;
  }

  /** Whether meshes are on their way (`pump` carries them on). */
  get uploading(): boolean {
    return this.partial.size > 0 || uploadsWaiting() > 0;
  }

  /**
   * A frame's start: the budget counted afresh, uploads under way carried on, then meshes asked for ahead of their
   * draw (`makeResident`) started, while the budget lasts.
   */
  pump(): void {
    this.uploadedBytes = 0;
    // While playback starts the meshes asked for ahead wait; the frame's own draws take a smaller slice.
    const starting = playbackStarting();
    this.budget = starting ? MESH_BYTES_STARTING : MESH_BYTES_PER_FRAME;
    for (const u of this.partial.values()) {
      if (this.uploadedBytes >= this.budget) return;
      this.write(u);
    }
    if (starting) return;
    while (this.uploadedBytes < this.budget) {
      const mesh = nextToUpload();
      if (!mesh) return;
      this.meshFor(mesh);
    }
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
        markResident(id, false);
      }
    }
  }

  dispose(): void {
    setMeshUploader(false);
    for (const m of this.meshes.values()) m.buf.destroy();
    this.meshes.clear();
    for (const u of this.partial.values()) u.buf.destroy();
    this.partial.clear();
    this.instances?.destroy();
    this.instances = null;
  }
}
