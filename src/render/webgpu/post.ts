/**
 * The tactical display's screen pass in WebGPU (`post/tacticalPost.ts`): the
 * composite draws into `src` instead of the canvas, then glow (down, blur
 * across, blur down) and the final pass into the canvas.
 */

import { POST_BLOCK_BYTES, POST_FLOATS, POST_WGSL, glowDivisor, packPostUniforms, passVec } from '../post/tacticalPost';
import type { FrameParams, PostDraw } from '../types';

const GLOW_FORMAT: GPUTextureFormat = 'rgba16float';
const PASSES = 4;

export class GpuPost {
  private readonly layout: GPUBindGroupLayout;
  private readonly down: GPURenderPipeline;
  private readonly blur: GPURenderPipeline;
  private readonly final: GPURenderPipeline;
  private readonly uniforms: GPUBuffer;
  private readonly sampler: GPUSampler;
  private readonly block = new Float32Array(POST_FLOATS);
  private src: GPUTexture | null = null;
  private glowA: GPUTexture | null = null;
  private glowB: GPUTexture | null = null;
  private w = 0;
  private h = 0;
  private gw = 0;
  private gh = 0;
  private groups: GPUBindGroup[] = [];
  private groupDepth: GPUTextureView | null = null;

  constructor(
    private readonly device: GPUDevice,
    canvasFormat: GPUTextureFormat,
  ) {
    const module = device.createShaderModule({ label: 'post', code: POST_WGSL });
    const F = GPUShaderStage.FRAGMENT;
    this.layout = device.createBindGroupLayout({
      label: 'post',
      entries: [
        { binding: 0, visibility: F, buffer: { type: 'uniform' } },
        { binding: 1, visibility: F, texture: { sampleType: 'float' } },
        { binding: 2, visibility: F, texture: { sampleType: 'depth' } },
        { binding: 3, visibility: F, texture: { sampleType: 'float' } },
        { binding: 4, visibility: F, sampler: { type: 'filtering' } },
      ],
    });
    const layout = device.createPipelineLayout({ label: 'post', bindGroupLayouts: [this.layout] });
    const pipe = (entryPoint: string, format: GPUTextureFormat) =>
      device.createRenderPipeline({
        label: `post-${entryPoint}`,
        layout,
        vertex: { module, entryPoint: 'vsPost' },
        fragment: { module, entryPoint, targets: [{ format }] },
        primitive: { topology: 'triangle-list' },
      });
    this.down = pipe('fsDown', GLOW_FORMAT);
    this.blur = pipe('fsBlur', GLOW_FORMAT);
    this.final = pipe('fsFinal', canvasFormat);
    this.uniforms = device.createBuffer({ label: 'post-uniforms', size: POST_BLOCK_BYTES * PASSES, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear', addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge' });
    this.canvasFormat = canvasFormat;
  }

  private readonly canvasFormat: GPUTextureFormat;

  private texture(w: number, h: number, format: GPUTextureFormat, label: string): GPUTexture {
    return this.device.createTexture({ label, size: [w, h], format, usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING });
  }

  /** The view the composite draws into this frame, sized to the canvas. */
  begin(width: number, height: number, quality: PostDraw['quality']): GPUTextureView {
    const div = glowDivisor(quality);
    const gw = Math.max(1, Math.ceil(width / div));
    const gh = Math.max(1, Math.ceil(height / div));
    if (!this.src || this.w !== width || this.h !== height) {
      this.src?.destroy();
      this.src = this.texture(width, height, this.canvasFormat, 'post-src');
      this.w = width;
      this.h = height;
      this.groups = [];
    }
    if (!this.glowA || this.gw !== gw || this.gh !== gh) {
      this.glowA?.destroy();
      this.glowB?.destroy();
      this.glowA = this.texture(gw, gh, GLOW_FORMAT, 'post-glowA');
      this.glowB = this.texture(gw, gh, GLOW_FORMAT, 'post-glowB');
      this.gw = gw;
      this.gh = gh;
      this.groups = [];
    }
    return this.src.createView();
  }

  /** Bind groups per pass: down reads src, blur across reads A, blur down reads B, final reads src with glow A. */
  private bindGroups(depth: GPUTextureView): GPUBindGroup[] {
    if (this.groups.length && this.groupDepth === depth) return this.groups;
    const src = this.src!.createView();
    const a = this.glowA!.createView();
    const b = this.glowB!.createView();
    const reads: Array<[GPUTextureView, GPUTextureView]> = [
      [src, b],
      [a, src],
      [b, src],
      [src, a],
    ];
    this.groups = reads.map(([s, g], i) =>
      this.device.createBindGroup({
        layout: this.layout,
        entries: [
          { binding: 0, resource: { buffer: this.uniforms, offset: i * POST_BLOCK_BYTES, size: POST_FLOATS * 4 } },
          { binding: 1, resource: s },
          { binding: 2, resource: depth },
          { binding: 3, resource: g },
          { binding: 4, resource: this.sampler },
        ],
      }),
    );
    this.groupDepth = depth;
    return this.groups;
  }

  private pass(encoder: GPUCommandEncoder, pipeline: GPURenderPipeline, group: GPUBindGroup, view: GPUTextureView): void {
    const pass = encoder.beginRenderPass({
      label: 'post',
      colorAttachments: [{ view, clearValue: { r: 0, g: 0, b: 0, a: 1 }, loadOp: 'clear', storeOp: 'store' }],
    });
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, group);
    pass.draw(3);
    pass.end();
  }

  /** Glow, then the final pass into `target`. */
  run(encoder: GPUCommandEncoder, params: FrameParams, post: PostDraw, depth: GPUTextureView, clear: readonly [number, number, number], target: GPUTextureView): void {
    if (!this.src || !this.glowA || !this.glowB) return;
    packPostUniforms(params, post, this.w, this.h, clear, this.block);
    const extras: Array<[number, number, number, number]> = [
      passVec('down', glowDivisor(post.quality)),
      passVec('blur', 1 / this.gw, 0),
      passVec('blur', 0, 1 / this.gh),
      passVec('final'),
    ];
    for (let i = 0; i < PASSES; i++) {
      this.block.set(extras[i], 40);
      this.device.queue.writeBuffer(this.uniforms, i * POST_BLOCK_BYTES, this.block);
    }
    const groups = this.bindGroups(depth);
    if (post.quality > 0 && post.bloom > 0) {
      this.pass(encoder, this.down, groups[0], this.glowA.createView());
      this.pass(encoder, this.blur, groups[1], this.glowB.createView());
      this.pass(encoder, this.blur, groups[2], this.glowA.createView());
    }
    this.finalInto(encoder, depth, target);
  }

  /** The final pass alone, again: into a capture's texture. */
  finalInto(encoder: GPUCommandEncoder, depth: GPUTextureView, target: GPUTextureView): void {
    this.pass(encoder, this.final, this.bindGroups(depth)[3], target);
  }

  dispose(): void {
    this.src?.destroy();
    this.glowA?.destroy();
    this.glowB?.destroy();
    this.uniforms.destroy();
  }
}
