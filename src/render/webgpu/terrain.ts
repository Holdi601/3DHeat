import { TERRAIN_WGSL } from './shaders';
import { nodeGrid } from '../../world/terrainLod';
import { INSTANCE_FLOATS, UPLOADS_PER_FRAME, type TerrainFrame, type TerrainStream } from '../../world/terrainStream';

/**
 * A tiled terrain's ground on WebGPU (src/world/terrainStream.ts): the tiles'
 * 16-bit heights and their classes in two texture arrays, one layer a tile, a
 * fixed number of layers (`capacity`); one 32 x 32 grid; one instanced draw of
 * it per frame with a node per instance. A frame writes the tiles that arrived
 * (a few at most) and the instance list; nothing is read back.
 */

/** Tile layers held, at most (WebGPU's default limit on array layers). */
const MAX_LAYERS = 256;

export class GpuTerrain {
  readonly pipeline: GPURenderPipeline;
  private readonly grid: GPUBuffer;
  private readonly gridIndex: GPUBuffer;
  private readonly gridCount: number;
  private instanceBuf: GPUBuffer | null = null;
  private instanceCap = 0;
  private heights: GPUTexture | null = null;
  private classes: GPUTexture | null = null;
  private readonly uniform: GPUBuffer;
  private group2: GPUBindGroup | null = null;
  private stream: TerrainStream | null = null;
  private side = 0;
  readonly capacity: number;

  constructor(
    private readonly device: GPUDevice,
    format: GPUTextureFormat,
    depthFormat: GPUTextureFormat,
    depthCompare: GPUCompareFunction,
    blend: GPUBlendState,
  ) {
    this.capacity = Math.min(MAX_LAYERS, device.limits.maxTextureArrayLayers);
    const module = device.createShaderModule({ label: 'terrain', code: TERRAIN_WGSL });
    this.pipeline = device.createRenderPipeline({
      label: 'terrain',
      layout: 'auto',
      vertex: {
        module,
        entryPoint: 'vsTerrain',
        buffers: [
          { arrayStride: 12, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }] },
          {
            arrayStride: INSTANCE_FLOATS * 4,
            stepMode: 'instance',
            attributes: [
              { shaderLocation: 5, offset: 0, format: 'float32x4' },
              { shaderLocation: 6, offset: 16, format: 'float32x4' },
              { shaderLocation: 7, offset: 32, format: 'float32x4' },
            ],
          },
        ],
      },
      fragment: { module, entryPoint: 'fsMesh', targets: [{ format, blend }] },
      primitive: { topology: 'triangle-list' },
      depthStencil: { format: depthFormat, depthWriteEnabled: true, depthCompare },
    });
    const g = nodeGrid();
    this.grid = device.createBuffer({ label: 'terrain grid', size: g.vertices.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
    device.queue.writeBuffer(this.grid, 0, g.vertices as unknown as BufferSource);
    const idx = g.indices instanceof Uint16Array && g.indices.length % 2 ? Uint16Array.from([...g.indices, 0]) : g.indices;
    this.gridIndex = device.createBuffer({ label: 'terrain grid index', size: idx.byteLength, usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST });
    device.queue.writeBuffer(this.gridIndex, 0, idx as unknown as BufferSource);
    this.gridCount = g.indices.length;
    this.uniform = device.createBuffer({ label: 'terrain uniforms', size: 16 * 16 + 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  }

  /** GPU bytes held for tiles. */
  get bytes(): number {
    return this.heights ? this.capacity * this.side * this.side * 3 : 0;
  }

  /** Takes `stream` on (its tiles go up again from the start), and writes the tiles that arrived. */
  prepare(stream: TerrainStream): void {
    if (stream !== this.stream) {
      this.stream = stream;
      this.side = stream.side;
      this.heights?.destroy();
      this.classes?.destroy();
      const size = [stream.side, stream.side, this.capacity];
      const usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST;
      this.heights = this.device.createTexture({ label: 'terrain heights', size, format: 'r16uint', usage });
      this.classes = this.device.createTexture({ label: 'terrain classes', size, format: 'r8uint', usage });
      const u = new Float32Array(16 * 4 + 4);
      u.set(stream.palette.subarray(0, 64), 0);
      u[64] = stream.side;
      this.device.queue.writeBuffer(this.uniform, 0, u);
      this.group2 = this.device.createBindGroup({
        label: 'terrain tiles',
        layout: this.pipeline.getBindGroupLayout(2),
        entries: [
          { binding: 0, resource: this.heights.createView({ dimension: '2d-array' }) },
          { binding: 1, resource: this.classes.createView({ dimension: '2d-array' }) },
          { binding: 2, resource: { buffer: this.uniform } },
        ],
      });
      stream.attach(this.capacity);
    }
    const side = this.side;
    for (const up of stream.takeUploads(UPLOADS_PER_FRAME)) {
      this.device.queue.writeTexture({ texture: this.heights!, origin: [0, 0, up.slot] }, up.heights as unknown as BufferSource, { bytesPerRow: side * 2, rowsPerImage: side }, [side, side, 1]);
      this.device.queue.writeTexture({ texture: this.classes!, origin: [0, 0, up.slot] }, up.classes as unknown as BufferSource, { bytesPerRow: side, rowsPerImage: side }, [side, side, 1]);
    }
  }

  /**
   * Draws the nodes in `frame`. `group0` is the scene's uniform slot for the
   * ground; `atlas` the fragment stage's texture group (nothing textured).
   */
  draw(pass: GPURenderPassEncoder, frame: TerrainFrame, group0: GPUBindGroup, atlas: GPUBindGroup): void {
    if (!frame.count || !this.group2) return;
    const bytes = frame.count * INSTANCE_FLOATS * 4;
    if (!this.instanceBuf || this.instanceCap < bytes) {
      this.instanceBuf?.destroy();
      this.instanceCap = Math.max(bytes, 64 * 1024);
      this.instanceBuf = this.device.createBuffer({ label: 'terrain nodes', size: this.instanceCap, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
    }
    this.device.queue.writeBuffer(this.instanceBuf, 0, frame.instances as unknown as BufferSource, 0, frame.count * INSTANCE_FLOATS);
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, group0);
    pass.setBindGroup(1, atlas);
    pass.setBindGroup(2, this.group2);
    pass.setVertexBuffer(0, this.grid);
    pass.setVertexBuffer(1, this.instanceBuf);
    pass.setIndexBuffer(this.gridIndex, 'uint16');
    pass.drawIndexed(this.gridCount, frame.count);
  }

  destroy(): void {
    this.heights?.destroy();
    this.classes?.destroy();
    this.instanceBuf?.destroy();
    this.grid.destroy();
    this.gridIndex.destroy();
    this.uniform.destroy();
    this.stream = null;
  }
}
