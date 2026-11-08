/**
 * The far-off glyphs on WebGPU (`symbols/shaders.ts`): the atlas uploaded
 * once, one instanced quad draw from an instance buffer - the GPU tracks'
 * own glyph run with its indirect count, or the CPU path's few.
 */

import { INSTANCE_STRIDE } from '../../figures/instances';
import { ATLAS_HEIGHT, ATLAS_WIDTH, symbolAtlas } from '../symbols/atlas';
import { SYMBOL_BLEND, SYMBOL_UNIFORM_FLOATS, symbolWgsl } from '../symbols/shaders';
import type { SymbolParams } from '../types';

export class GpuSymbols {
  private readonly pipeline: GPURenderPipeline;
  private readonly uniform: GPUBuffer;
  private readonly u = new Float32Array(SYMBOL_UNIFORM_FLOATS);
  private readonly uCpu = new Float32Array(SYMBOL_UNIFORM_FLOATS);
  private readonly uniformCpu: GPUBuffer;
  private group: GPUBindGroup | null = null;
  private groupCpu: GPUBindGroup | null = null;
  private atlas: GPUTexture | null = null;
  private instances: GPUBuffer | null = null;

  constructor(
    private readonly device: GPUDevice,
    colorFormat: GPUTextureFormat,
    depthFormat: GPUTextureFormat,
  ) {
    const module = device.createShaderModule({ label: 'glyphs', code: symbolWgsl() });
    this.pipeline = device.createRenderPipeline({
      label: 'glyphs',
      layout: 'auto',
      vertex: {
        module,
        entryPoint: 'vsGlyph',
        buffers: [
          {
            arrayStride: INSTANCE_STRIDE * 4,
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
      fragment: { module, entryPoint: 'fsGlyph', targets: [{ format: colorFormat, blend: SYMBOL_BLEND }] },
      primitive: { topology: 'triangle-list' },
      depthStencil: { format: depthFormat, depthWriteEnabled: false, depthCompare: 'always' },
    });
    this.uniform = device.createBuffer({ label: 'glyph uniforms', size: SYMBOL_UNIFORM_FLOATS * 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.uniformCpu = device.createBuffer({ label: 'glyph uniforms (cpu)', size: SYMBOL_UNIFORM_FLOATS * 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  }

  private groups(): boolean {
    if (this.group) return true;
    const pixels = symbolAtlas();
    if (!pixels) return false;
    const dev = this.device;
    this.atlas = dev.createTexture({ label: 'glyph atlas', size: [ATLAS_WIDTH, ATLAS_HEIGHT], format: 'rgba8unorm', usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST });
    dev.queue.writeTexture({ texture: this.atlas }, pixels, { bytesPerRow: ATLAS_WIDTH * 4 }, [ATLAS_WIDTH, ATLAS_HEIGHT]);
    const sampler = dev.createSampler({ magFilter: 'linear', minFilter: 'linear' });
    const make = (buf: GPUBuffer) =>
      dev.createBindGroup({
        layout: this.pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: buf } },
          { binding: 1, resource: this.atlas!.createView() },
          { binding: 2, resource: sampler },
        ],
      });
    this.group = make(this.uniform);
    this.groupCpu = make(this.uniformCpu);
    return true;
  }

  private write(out: Float32Array, buf: GPUBuffer, p: SymbolParams, viewProj: Float32Array, camera: ArrayLike<number>, w: number, h: number): void {
    out.set(viewProj, 0);
    out[16] = w;
    out[17] = h;
    out[18] = p.style;
    out[19] = p.mode;
    out[20] = p.ticks ? 1 : 0;
    out[21] = 1;
    out[24] = camera[0];
    out[25] = camera[1];
    out[26] = camera[2];
    out.set(p.sides.subarray(0, 64), 28);
    this.device.queue.writeBuffer(buf, 0, out);
  }

  /** The GPU tracks' glyph run: `count` in `args` at `argsOffset` (6 vertices an instance). */
  drawIndirect(pass: GPURenderPassEncoder, p: SymbolParams, viewProj: Float32Array, camera: ArrayLike<number>, w: number, h: number, instances: GPUBuffer, firstInstance: number, args: GPUBuffer, argsOffset: number): void {
    if (!this.groups()) return;
    this.write(this.u, this.uniform, p, viewProj, camera, w, h);
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.group!);
    pass.setVertexBuffer(0, instances, firstInstance * INSTANCE_STRIDE * 4);
    pass.drawIndirect(args, argsOffset);
  }

  /** Glyphs placed on the CPU. */
  draw(pass: GPURenderPassEncoder, p: SymbolParams, viewProj: Float32Array, camera: ArrayLike<number>, w: number, h: number): void {
    const g = p.cpu;
    if (!g || !g.count || !this.groups()) return;
    const bytes = g.count * INSTANCE_STRIDE * 4;
    if (!this.instances || this.instances.size < bytes) {
      this.instances?.destroy();
      this.instances = this.device.createBuffer({ label: 'glyph instances', size: Math.max(bytes * 2, 4096), usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
    }
    this.device.queue.writeBuffer(this.instances, 0, g.data.buffer, g.data.byteOffset, bytes);
    this.write(this.uCpu, this.uniformCpu, p, viewProj, camera, w, h);
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.groupCpu!);
    pass.setVertexBuffer(0, this.instances);
    pass.draw(6, g.count);
  }

  dispose(): void {
    this.uniform.destroy();
    this.uniformCpu.destroy();
    this.atlas?.destroy();
    this.instances?.destroy();
  }
}
