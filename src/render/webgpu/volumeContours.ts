/**
 * Where the volumes cut the level, in WebGPU (`render/volumeContours.ts`): one
 * fullscreen draw over the scene's depth inside the composite pass, blended
 * over the picture. Two small uniform buffers, written each frame it draws.
 */

import { VOLUME_BLOCK_BYTES } from '../../volumes/gpu';
import { GPU_DEPTH_CLEAR } from '../depth';
import type { FrameParams } from '../types';
import { invert4, volumeContourWgsl, type VolumeContourDraw } from '../volumeContours';

/** color[8] vec4, inv mat4, view vec4. */
const CONTOUR_BYTES = (8 * 4 + 16 + 4) * 4;

export class GpuVolumeContours {
  private readonly pipeline: GPURenderPipeline;
  private readonly volumes: GPUBuffer;
  private readonly uniforms: GPUBuffer;
  private group: GPUBindGroup | null = null;
  private groupDepth: GPUTextureView | null = null;
  private readonly staging = new Float32Array(CONTOUR_BYTES / 4);
  private readonly inv = new Float32Array(16);

  constructor(
    private readonly device: GPUDevice,
    format: GPUTextureFormat,
  ) {
    const module = device.createShaderModule({ label: 'volume contours', code: volumeContourWgsl() });
    this.pipeline = device.createRenderPipeline({
      label: 'volume contours',
      layout: 'auto',
      vertex: { module, entryPoint: 'vsContour' },
      fragment: {
        module,
        entryPoint: 'fsContour',
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
    });
    this.volumes = device.createBuffer({ label: 'volume contours: volumes', size: VOLUME_BLOCK_BYTES, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.uniforms = device.createBuffer({ label: 'volume contours', size: CONTOUR_BYTES, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  }

  /** Writes what the draw needs; call before the pass. */
  prepare(params: FrameParams, c: VolumeContourDraw, depth: GPUTextureView, width: number, height: number): void {
    this.device.queue.writeBuffer(this.volumes, 0, c.block.buffer, c.block.byteOffset, VOLUME_BLOCK_BYTES);
    const u = this.staging;
    u.set(c.colors, 0);
    u.set(invert4(params.viewProj, this.inv), 32);
    u[48] = width;
    u[49] = height;
    u[50] = GPU_DEPTH_CLEAR;
    u[51] = 0;
    this.device.queue.writeBuffer(this.uniforms, 0, u);
    if (this.groupDepth !== depth || !this.group) {
      this.group = this.device.createBindGroup({
        label: 'volume contours',
        layout: this.pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.volumes } },
          { binding: 1, resource: { buffer: this.uniforms } },
          { binding: 2, resource: depth },
        ],
      });
      this.groupDepth = depth;
    }
  }

  draw(pass: GPURenderPassEncoder): void {
    if (!this.group) return;
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.group);
    pass.draw(3);
  }

  dispose(): void {
    this.volumes.destroy();
    this.uniforms.destroy();
  }
}
