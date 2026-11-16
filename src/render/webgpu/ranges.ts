/**
 * The engagement ranges in WebGPU (`ranges/`), as `webgl2/ranges.ts`: the
 * units' views taken from the level into a depth array before the scene pass
 * (a few faces a frame), the ground they see shaded and the shells drawn in
 * it, cut by them. Nothing is read back.
 */

import type { Bounds } from '../../state/types';
import type { FrameParams, RangeDraw } from '../types';
import { SHELL_FLOATS, shellMesh } from '../../ranges/shells';
import { SHELL_UNIFORM_BYTES, SHELL_WGSL } from '../../ranges/shellShaders';
import { CAPTURE_UNIFORM_STRIDE, CAPTURE_WGSL, FACES, GROUND_UNIFORM_BYTES, GROUND_WGSL, MAX_VIEWS, VIEW_FACE, VIEW_LAYERS } from '../../ranges/viewshedShaders';
import { ViewshedPlan } from '../../ranges/viewshed';
import { boxNear } from '../webgl2/ranges';

/** What a level mesh needs to be drawn into a view: positions (24-byte stride) and index sets (uint32). */
export interface GpuRangeMesh {
  vertexBuffer: GPUBuffer;
  groundBuffer: GPUBuffer | null;
  structBuffer: GPUBuffer | null;
  groundCount: number;
  structCount: number;
  bounds: Bounds | null;
}

const VIEW_FORMAT: GPUTextureFormat = 'depth32float';

export class GpuRanges {
  private readonly shellPipe: GPURenderPipeline;
  private readonly groundPipe: GPURenderPipeline;
  private readonly capturePipe: GPURenderPipeline;
  private readonly meshBuf: GPUBuffer;
  private instBuf: GPUBuffer | null = null;
  private readonly sphere: number;
  private readonly cone: number;
  private readonly depth: GPUTexture;
  private readonly layerViews: GPUTextureView[];
  private readonly shellU: GPUBuffer;
  private readonly groundU: GPUBuffer;
  private readonly captureU: GPUBuffer;
  private shellGroup: GPUBindGroup | null = null;
  private readonly groundGroup: GPUBindGroup;
  private readonly captureGroups: GPUBindGroup[];
  readonly plan = new ViewshedPlan();
  private readonly shellStage = new Float32Array(SHELL_UNIFORM_BYTES / 4);
  private readonly groundStage = new Float32Array(GROUND_UNIFORM_BYTES / 4);
  private readonly views = new Float32Array(MAX_VIEWS * 6 * 4);
  private groundOn = false;

  constructor(
    private readonly device: GPUDevice,
    sceneFormat: GPUTextureFormat,
    depthFormat: GPUTextureFormat,
  ) {
    const shellModule = device.createShaderModule({ label: 'range shells', code: SHELL_WGSL });
    const groundModule = device.createShaderModule({ label: 'range ground', code: GROUND_WGSL });
    const captureModule = device.createShaderModule({ label: 'range views', code: CAPTURE_WGSL });
    const instAttrs: GPUVertexAttribute[] = Array.from({ length: 6 }, (_, i) => ({ shaderLocation: 1 + i, offset: i * 16, format: 'float32x4' as GPUVertexFormat }));
    this.shellPipe = device.createRenderPipeline({
      label: 'range shells',
      layout: 'auto',
      vertex: {
        module: shellModule,
        entryPoint: 'vsShell',
        buffers: [
          { arrayStride: 16, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x4' }] },
          { arrayStride: SHELL_FLOATS * 4, stepMode: 'instance', attributes: instAttrs },
        ],
      },
      fragment: {
        module: shellModule,
        entryPoint: 'fsShell',
        targets: [
          {
            format: sceneFormat,
            blend: {
              color: { srcFactor: 'src-alpha', dstFactor: 'one', operation: 'add' },
              alpha: { srcFactor: 'zero', dstFactor: 'one', operation: 'add' },
            },
          },
        ],
      },
      primitive: { topology: 'triangle-list', cullMode: 'none' },
      depthStencil: { format: depthFormat, depthWriteEnabled: false, depthCompare: 'less-equal' },
    });
    const pos: GPUVertexBufferLayout = { arrayStride: 24, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }] };
    this.groundPipe = device.createRenderPipeline({
      label: 'range ground',
      layout: 'auto',
      vertex: { module: groundModule, entryPoint: 'vsGround', buffers: [pos] },
      fragment: {
        module: groundModule,
        entryPoint: 'fsGround',
        targets: [
          {
            format: sceneFormat,
            blend: {
              color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
              alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
            },
          },
        ],
      },
      primitive: { topology: 'triangle-list', cullMode: 'none' },
      depthStencil: { format: depthFormat, depthWriteEnabled: false, depthCompare: 'less-equal', depthBias: -4, depthBiasSlopeScale: -1 },
    });
    this.capturePipe = device.createRenderPipeline({
      label: 'range views',
      layout: 'auto',
      vertex: { module: captureModule, entryPoint: 'vsCapture', buffers: [pos] },
      fragment: { module: captureModule, entryPoint: 'fsCapture', targets: [] },
      primitive: { topology: 'triangle-list', cullMode: 'none' },
      depthStencil: { format: VIEW_FORMAT, depthWriteEnabled: true, depthCompare: 'less' },
    });

    const mesh = shellMesh();
    this.sphere = mesh.sphere;
    this.cone = mesh.cone;
    this.meshBuf = device.createBuffer({ label: 'range shell mesh', size: mesh.data.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
    device.queue.writeBuffer(this.meshBuf, 0, mesh.data);

    this.depth = device.createTexture({
      label: 'range views',
      size: [VIEW_FACE, VIEW_FACE, VIEW_LAYERS],
      format: VIEW_FORMAT,
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });
    this.layerViews = Array.from({ length: VIEW_LAYERS }, (_, i) => this.depth.createView({ dimension: '2d', baseArrayLayer: i, arrayLayerCount: 1 }));
    const arrayView = this.depth.createView({ dimension: '2d-array' });
    this.shellU = device.createBuffer({ label: 'range shells uniforms', size: SHELL_UNIFORM_BYTES, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.groundU = device.createBuffer({ label: 'range ground uniforms', size: GROUND_UNIFORM_BYTES, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.captureU = device.createBuffer({ label: 'range views uniforms', size: VIEW_LAYERS * CAPTURE_UNIFORM_STRIDE, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.shellGroup = device.createBindGroup({
      layout: this.shellPipe.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.shellU } },
        { binding: 1, resource: arrayView },
      ],
    });
    this.groundGroup = device.createBindGroup({
      layout: this.groundPipe.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.groundU } },
        { binding: 1, resource: arrayView },
      ],
    });
    this.captureGroups = Array.from({ length: VIEW_LAYERS }, (_, i) =>
      device.createBindGroup({ layout: this.capturePipe.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: this.captureU, offset: i * CAPTURE_UNIFORM_STRIDE, size: 64 } }] }),
    );
  }

  get pending(): boolean {
    return this.plan.pending;
  }

  private static drawMesh(pass: GPURenderPassEncoder, m: GpuRangeMesh): void {
    pass.setVertexBuffer(0, m.vertexBuffer);
    if (m.groundBuffer && m.groundCount) {
      pass.setIndexBuffer(m.groundBuffer, 'uint32');
      pass.drawIndexed(m.groundCount);
    }
    if (m.structBuffer && m.structCount) {
      pass.setIndexBuffer(m.structBuffer, 'uint32');
      pass.drawIndexed(m.structCount);
    }
  }

  /** Take this frame's faces from the level `meshes` (every mesh), each in a pass of its own before the scene's. */
  takeViews(encoder: GPUCommandEncoder, r: RangeDraw, meshes: readonly GpuRangeMesh[], level: unknown): void {
    const todo = r.los || r.ground ? this.plan.plan(r.views, level, r.facesPerFrame) : [];
    for (const layer of todo) {
      const v = r.views[Math.floor(layer / 6)]!;
      const [a, rt, up] = FACES[layer % 6];
      const near = Math.max(1e-3, v.far * 1e-5);
      this.device.queue.writeBuffer(this.captureU, layer * CAPTURE_UNIFORM_STRIDE, new Float32Array([v.eye[0], v.eye[1], v.eye[2], v.far, a[0], a[1], a[2], near, rt[0], rt[1], rt[2], 0, up[0], up[1], up[2], 0]));
      const pass = encoder.beginRenderPass({
        label: 'range view',
        colorAttachments: [],
        depthStencilAttachment: { view: this.layerViews[layer], depthClearValue: 1, depthLoadOp: 'clear', depthStoreOp: 'store' },
      });
      pass.setPipeline(this.capturePipe);
      pass.setBindGroup(0, this.captureGroups[layer]);
      for (const m of meshes) if (boxNear(m.bounds, v.eye, v.far)) GpuRanges.drawMesh(pass, m);
      pass.end();
    }
  }

  /** Writes this frame's uniforms and instances; before the scene pass. */
  prepare(params: FrameParams, r: RangeDraw): void {
    const o = params.origin;
    this.plan.uniforms(r.views, o, this.views);
    const s = this.shellStage;
    s.set(params.viewProjRel, 0);
    s.set([params.cameraPos[0] - o[0], params.cameraPos[1] - o[1], params.cameraPos[2] - o[2], r.opacity], 16);
    s.set([r.faces ? 1 : 0, r.lines ? 1 : 0, r.los ? 1 : 0, 0], 20);
    s.set(this.views, 24);
    s.set([VIEW_FACE, r.bias, 0, 0], 24 + MAX_VIEWS * 24);
    this.device.queue.writeBuffer(this.shellU, 0, s);
    if (r.count) {
      const bytes = r.count * SHELL_FLOATS * 4;
      if (!this.instBuf || this.instBuf.size < bytes) {
        this.instBuf?.destroy();
        this.instBuf = this.device.createBuffer({ label: 'range shells', size: Math.max(bytes, 64 * SHELL_FLOATS * 4) * 2, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
      }
      this.device.queue.writeBuffer(this.instBuf, 0, r.shells.buffer, r.shells.byteOffset, bytes);
    }
    this.groundOn = false;
    if (r.ground) {
      const g = this.groundStage;
      g.fill(0);
      g.set(params.viewProj, 0);
      let n = 0;
      r.views.forEach((v, i) => {
        if (!v) return;
        n = i + 1;
        g.set([v.band[0], v.band[1], v.band[2], r.opacity], 20 + MAX_VIEWS * 24 + 4 + i * 4);
        g.set([v.colour[0], v.colour[1], v.colour[2], 1], 20 + MAX_VIEWS * 24 + 4 + MAX_VIEWS * 4 + i * 4);
      });
      g.set([o[0], o[1], o[2], n], 16);
      g.set(this.views, 20);
      g.set([VIEW_FACE, r.bias, 0, 0], 20 + MAX_VIEWS * 24);
      this.device.queue.writeBuffer(this.groundU, 0, g);
      this.groundOn = n > 0;
    }
  }

  drawGround(pass: GPURenderPassEncoder, r: RangeDraw, meshes: readonly GpuRangeMesh[]): void {
    if (!this.groundOn) return;
    const near = meshes.filter((m) => r.views.some((v) => v && boxNear(m.bounds, v.eye, v.band[2])));
    if (!near.length) return;
    pass.setPipeline(this.groundPipe);
    pass.setBindGroup(0, this.groundGroup);
    for (const m of near) GpuRanges.drawMesh(pass, m);
  }

  drawShells(pass: GPURenderPassEncoder, r: RangeDraw): void {
    if (!r.count || !this.instBuf || !this.shellGroup) return;
    pass.setPipeline(this.shellPipe);
    pass.setBindGroup(0, this.shellGroup);
    pass.setVertexBuffer(0, this.meshBuf);
    pass.setVertexBuffer(1, this.instBuf);
    pass.draw(this.sphere, r.count, 0, 0);
    if (r.coneStart < r.count) pass.draw(this.cone, r.count - r.coneStart, this.sphere, r.coneStart);
  }

  dispose(): void {
    this.depth.destroy();
    this.meshBuf.destroy();
    this.instBuf?.destroy();
    this.shellU.destroy();
    this.groundU.destroy();
    this.captureU.destroy();
    this.shellGroup = null;
  }
}
