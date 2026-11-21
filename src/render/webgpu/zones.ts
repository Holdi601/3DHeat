/**
 * The capture zones' discs in WebGPU (`zoneShaders.ts`): the vertices
 * uploaded when they are a new array, the zones' state written into a small
 * uniform buffer a frame. On the ground in the scene pass (depth tested, not
 * written), or without depth (`xray`): over the finished picture, or in the
 * scene under the units (`FrameParams.objectivesUnder`).
 */

/** Where a draw goes: on the ground, through it under the units, or over the picture. */
export type ZoneSlot = 'ground' | 'under' | 'top';

import { GPU_DEPTH_TEST } from '../depth';
import type { FrameParams } from '../types';
import { MAX_ZONES, ZONE_MIN_PX, ZONE_UNIFORM_BYTES, ZONE_VERTEX_FLOATS, ZONE_WGSL } from '../zoneShaders';

type ZoneDraw = NonNullable<FrameParams['objectiveZones']>;

interface Slot {
  pipeline: GPURenderPipeline;
  uniforms: GPUBuffer;
  group: GPUBindGroup;
}

export class GpuZones {
  private buffer: GPUBuffer | null = null;
  private data: Float32Array | null = null;
  private readonly slots: Record<ZoneSlot, Slot>;
  private readonly staging = new Float32Array(ZONE_UNIFORM_BYTES / 4);

  constructor(
    private readonly device: GPUDevice,
    sceneFormat: GPUTextureFormat,
    depthFormat: GPUTextureFormat,
    canvasFormat: GPUTextureFormat,
  ) {
    const module = device.createShaderModule({ label: 'zones', code: ZONE_WGSL });
    const make = (label: string, format: GPUTextureFormat, depth: GPUCompareFunction | null): Slot => {
      const pipeline = device.createRenderPipeline({
        label,
        layout: 'auto',
        vertex: {
          module,
          entryPoint: 'vsZone',
          buffers: [
            {
              arrayStride: ZONE_VERTEX_FLOATS * 4,
              attributes: [
                { shaderLocation: 0, offset: 0, format: 'float32x3' },
                { shaderLocation: 1, offset: 12, format: 'float32x3' },
                { shaderLocation: 2, offset: 24, format: 'float32x4' },
              ],
            },
          ],
        },
        fragment: {
          module,
          entryPoint: 'fsZone',
          targets: [
            {
              format,
              blend: {
                color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
                alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
              },
            },
          ],
        },
        primitive: { topology: 'triangle-list' },
        // In the scene pass the depth attachment is there either way; under the units it is not tested.
        ...(depth ? { depthStencil: { format: depthFormat, depthWriteEnabled: false, depthCompare: depth } } : {}),
      });
      const uniforms = device.createBuffer({ label: `${label} uniforms`, size: ZONE_UNIFORM_BYTES, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
      const group = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: uniforms } }] });
      return { pipeline, uniforms, group };
    };
    this.slots = {
      ground: make('zones on the ground', sceneFormat, GPU_DEPTH_TEST),
      under: make('zones under the units', sceneFormat, 'always'),
      top: make('zones over the picture', canvasFormat, null),
    };
  }

  /** Uploads what the draw needs; call before the pass that draws (`draw`). */
  prepare(params: FrameParams, z: ZoneDraw, slot: ZoneSlot): void {
    if (!z.count) return;
    if (this.data !== z.verts || !this.buffer) {
      const bytes = z.count * ZONE_VERTEX_FLOATS * 4;
      if (!this.buffer || this.buffer.size < bytes) {
        this.buffer?.destroy();
        this.buffer = this.device.createBuffer({ label: 'zones', size: bytes, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
      }
      this.device.queue.writeBuffer(this.buffer, 0, z.verts.buffer, z.verts.byteOffset, bytes);
      this.data = z.verts;
    }
    const u = this.staging;
    u.set(params.viewProj, 0);
    u[16] = (params.proj[5] * params.height) / 2;
    u[17] = ZONE_MIN_PX * (globalThis.devicePixelRatio || 1);
    u[18] = slot === 'ground' ? 0 : z.xray;
    u[19] = 0;
    u.set(z.state.subarray(0, MAX_ZONES * 8), 20);
    this.device.queue.writeBuffer(this.slots[slot].uniforms, 0, u);
  }

  draw(pass: GPURenderPassEncoder, z: ZoneDraw, slot: ZoneSlot): void {
    if (!z.count || !this.buffer) return;
    const s = this.slots[slot];
    pass.setPipeline(s.pipeline);
    pass.setBindGroup(0, s.group);
    pass.setVertexBuffer(0, this.buffer);
    pass.draw(z.count);
  }

  dispose(): void {
    this.buffer?.destroy();
    for (const s of Object.values(this.slots)) s.uniforms.destroy();
  }
}
