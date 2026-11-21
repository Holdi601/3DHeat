/**
 * The layout's spawn markers on WebGPU (`../spawnMarks.ts`): the instances
 * uploaded when they are a new array, then one instanced draw of the lines
 * to their owners (where asked) and one of the markers, over the finished
 * picture without depth.
 */

import type { FrameParams } from '../types';
import { SPAWN_INSTANCE_FLOATS, SPAWN_UNIFORM_FLOATS, spawnUniforms, spawnWgsl } from '../spawnMarks';

type SpawnDraw = NonNullable<FrameParams['spawnMarks']>;

export class GpuSpawnMarks {
  private readonly marks: GPURenderPipeline;
  private readonly lines: GPURenderPipeline;
  private readonly uniform: GPUBuffer;
  private readonly group: GPUBindGroup;
  private readonly u = new Float32Array(SPAWN_UNIFORM_FLOATS);
  private buffer: GPUBuffer | null = null;
  private data: Float32Array | null = null;

  constructor(
    private readonly device: GPUDevice,
    format: GPUTextureFormat,
  ) {
    const module = device.createShaderModule({ label: 'spawn marks', code: spawnWgsl() });
    const layout = device.createBindGroupLayout({
      label: 'spawn marks',
      entries: [{ binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } }],
    });
    const pipelineLayout = device.createPipelineLayout({ bindGroupLayouts: [layout] });
    const buffers: GPUVertexBufferLayout[] = [
      {
        arrayStride: SPAWN_INSTANCE_FLOATS * 4,
        stepMode: 'instance',
        attributes: [
          { shaderLocation: 0, offset: 0, format: 'float32x4' },
          { shaderLocation: 1, offset: 16, format: 'float32x4' },
          { shaderLocation: 2, offset: 32, format: 'float32x4' },
        ],
      },
    ];
    const blend: GPUBlendState = {
      color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
      alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
    };
    const make = (label: string, vs: string, fs: string) =>
      device.createRenderPipeline({
        label,
        layout: pipelineLayout,
        vertex: { module, entryPoint: vs, buffers },
        fragment: { module, entryPoint: fs, targets: [{ format, blend }] },
        primitive: { topology: 'triangle-list' },
      });
    this.marks = make('spawn marks', 'vsMark', 'fsMark');
    this.lines = make('spawn lines', 'vsLine', 'fsLine');
    this.uniform = device.createBuffer({ label: 'spawn marks', size: SPAWN_UNIFORM_FLOATS * 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.group = device.createBindGroup({ layout, entries: [{ binding: 0, resource: { buffer: this.uniform } }] });
  }

  /** Uploads what the draw needs; call before the pass that draws (`draw`). */
  prepare(params: FrameParams, s: SpawnDraw): void {
    if (!s.count) return;
    if (this.data !== s.data || !this.buffer) {
      const bytes = s.count * SPAWN_INSTANCE_FLOATS * 4;
      if (!this.buffer || this.buffer.size < bytes) {
        this.buffer?.destroy();
        this.buffer = this.device.createBuffer({ label: 'spawn marks', size: Math.max(bytes, 256), usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
      }
      this.device.queue.writeBuffer(this.buffer, 0, s.data.buffer, s.data.byteOffset, bytes);
      this.data = s.data;
    }
    this.device.queue.writeBuffer(this.uniform, 0, spawnUniforms(this.u, params.viewProj, params.width, params.height, params.cameraPos));
  }

  draw(pass: GPURenderPassEncoder, s: SpawnDraw): void {
    if (!s.count || !this.buffer) return;
    pass.setBindGroup(0, this.group);
    pass.setVertexBuffer(0, this.buffer);
    if (s.lines) {
      pass.setPipeline(this.lines);
      pass.draw(6, s.count);
    }
    pass.setPipeline(this.marks);
    pass.draw(6, s.count);
  }

  dispose(): void {
    this.buffer?.destroy();
    this.uniform.destroy();
  }
}
