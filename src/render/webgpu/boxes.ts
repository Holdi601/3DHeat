import { BOX_WGSL, PEEL_BOX_WGSL } from './shaders';
import { boxOutsideFrustum } from '../worldTiles';
import { BOX_FLOATS, unitCube, type TerrainBoxes } from '../../world/terrainObjects';

/**
 * A tiled terrain's placed objects on WebGPU (src/world/terrainObjects.ts):
 * one unit cube, an instance buffer per cell of the map (48 bytes an object),
 * one draw per cell in view in each pass the level's structures go through.
 * New cells are written a megabyte a frame at most; nothing is read back.
 *
 * The pipelines are the structure passes' own, with the cube's vertex stage:
 * `shell` the see-through faces (no depth write), `solid` faces that write
 * depth, `depth` the depth-only seal and structure-depth target, `peel` the
 * depth-peel layers.
 */

/** Instance bytes written a frame, at most (one cell always). */
const UPLOAD_BYTES = 1024 * 1024;

export interface BoxCell {
  src: TerrainBoxes;
  buffer: GPUBuffer;
}

export class GpuBoxes {
  readonly shell: GPURenderPipeline;
  readonly solid: GPURenderPipeline;
  readonly depth: GPURenderPipeline;
  readonly peel: GPURenderPipeline;
  private readonly cube: GPUBuffer;
  private readonly cubeIndex: GPUBuffer;
  private readonly held = new Map<string, BoxCell>();
  private queue: TerrainBoxes[] = [];
  private version = -1;
  private source: object | null = null;
  bytes = 0;

  constructor(
    private readonly device: GPUDevice,
    format: GPUTextureFormat,
    depthFormat: GPUTextureFormat,
    compare: GPUCompareFunction,
    blend: GPUBlendState,
  ) {
    const mesh = device.createShaderModule({ label: 'boxes', code: BOX_WGSL });
    const peel = device.createShaderModule({ label: 'boxes peel', code: PEEL_BOX_WGSL });
    const instance: GPUVertexBufferLayout = {
      arrayStride: BOX_FLOATS * 4,
      stepMode: 'instance',
      attributes: [
        { shaderLocation: 5, offset: 0, format: 'float32x4' },
        { shaderLocation: 6, offset: 16, format: 'float32x4' },
        { shaderLocation: 7, offset: 32, format: 'float32x4' },
      ],
    };
    const corner: GPUVertexBufferLayout = {
      arrayStride: 24,
      attributes: [
        { shaderLocation: 0, offset: 0, format: 'float32x3' },
        { shaderLocation: 1, offset: 12, format: 'float32x3' },
      ],
    };
    const make = (label: string, depthWrite: boolean, colourWrite: boolean) =>
      device.createRenderPipeline({
        label: `boxes ${label}`,
        layout: 'auto',
        vertex: { module: mesh, entryPoint: 'vsBox', buffers: [corner, instance] },
        fragment: { module: mesh, entryPoint: 'fsMesh', targets: [{ format, blend, writeMask: colourWrite ? GPUColorWrite.ALL : 0 }] },
        primitive: { topology: 'triangle-list' },
        depthStencil: { format: depthFormat, depthWriteEnabled: depthWrite, depthCompare: compare },
      });
    this.shell = make('shell', false, true);
    this.solid = make('solid', true, true);
    this.depth = make('depth', true, false);
    this.peel = device.createRenderPipeline({
      label: 'boxes peel',
      layout: 'auto',
      vertex: {
        module: peel,
        entryPoint: 'vsPeelBox',
        buffers: [{ arrayStride: 24, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }] }, instance],
      },
      fragment: { module: peel, entryPoint: 'fsPeel', targets: [] },
      primitive: { topology: 'triangle-list' },
      depthStencil: { format: depthFormat, depthWriteEnabled: true, depthCompare: compare },
    });
    const c = unitCube();
    this.cube = device.createBuffer({ label: 'box cube', size: c.vertices.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
    device.queue.writeBuffer(this.cube, 0, c.vertices as unknown as BufferSource);
    this.cubeIndex = device.createBuffer({ label: 'box cube index', size: c.indices.byteLength, usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST });
    device.queue.writeBuffer(this.cubeIndex, 0, c.indices as unknown as BufferSource);
  }

  /**
   * Takes on the sets of `owner` (a terrain stream) at `version`: the cells gone
   * freed at once, the new ones queued and written a megabyte a frame.
   */
  sync(owner: object, sets: readonly TerrainBoxes[], version: number): void {
    if (owner !== this.source) {
      this.clear();
      this.source = owner;
    }
    if (version !== this.version) {
      this.version = version;
      const want = new Map(sets.map((s) => [s.id, s]));
      for (const [id, h] of this.held) {
        if (want.get(id) !== h.src) {
          h.buffer.destroy();
          this.bytes -= h.buffer.size;
          this.held.delete(id);
        }
      }
      this.queue = sets.filter((s) => !this.held.has(s.id) && s.count > 0);
    }
    let written = 0;
    while (this.queue.length && (written === 0 || written < UPLOAD_BYTES)) {
      const s = this.queue.shift()!;
      const buffer = this.device.createBuffer({ label: `boxes ${s.id}`, size: Math.max(16, s.instances.byteLength), usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
      this.device.queue.writeBuffer(buffer, 0, s.instances as unknown as BufferSource);
      this.held.set(s.id, { src: s, buffer });
      this.bytes += buffer.size;
      written += s.instances.byteLength;
    }
  }

  /** Whether more cells wait to be written (another frame is wanted). */
  get pending(): boolean {
    return this.queue.length > 0;
  }

  /** The cells in view this frame. */
  inView(planes: Float32Array): BoxCell[] {
    const out: BoxCell[] = [];
    for (const h of this.held.values()) if (!boxOutsideFrustum(planes, h.src.bounds)) out.push(h);
    return out;
  }

  /** Draws `cells` with the pipeline and bind groups already set. */
  draw(pass: GPURenderPassEncoder, cells: readonly BoxCell[]): void {
    if (!cells.length) return;
    pass.setVertexBuffer(0, this.cube);
    pass.setIndexBuffer(this.cubeIndex, 'uint16');
    for (const h of cells) {
      pass.setVertexBuffer(1, h.buffer);
      pass.drawIndexed(36, h.src.count);
    }
  }

  clear(): void {
    for (const h of this.held.values()) h.buffer.destroy();
    this.held.clear();
    this.queue = [];
    this.bytes = 0;
    this.version = -1;
    this.source = null;
  }

  destroy(): void {
    this.clear();
    this.cube.destroy();
    this.cubeIndex.destroy();
  }
}
