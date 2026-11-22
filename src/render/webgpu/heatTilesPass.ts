/**
 * Heat tiles into the heat target (Stage 6, `render/heatTiles/`): each visible
 * tile one quad on the ground, its counts as density, added like the splat
 * (blend one/one) so exposure, curve and colour map apply as to rows. Tiles
 * live in a texture array (one layer each), reused least recently drawn;
 * at most UPLOADS_PER_FRAME new layers a frame, so a burst of arriving tiles
 * never stalls a frame - the rest come on the next ones (`uploadsPending`).
 */

import type { HeatTileDraw } from '../heatTiles/source';
import { TILE } from '../heatTiles/tileFormat';

const LAYERS = 192;
const UPLOADS_PER_FRAME = 6;
const INST_FLOATS = 12;

const WGSL = /* wgsl */ `
struct U { viewProj: mat4x4<f32>, ground: f32, scale: f32, p0: f32, p1: f32 };
struct Inst { rect: vec4<f32>, uv: vec4<f32>, k: f32, layer: f32, q0: f32, q1: f32 };
@group(0) @binding(0) var<uniform> u: U;
@group(0) @binding(1) var<storage, read> inst: array<Inst>;
@group(0) @binding(2) var tiles: texture_2d_array<f32>;
struct VOut {
  @builtin(position) pos: vec4<f32>,
  @location(0) uv: vec2<f32>,
  @location(1) @interpolate(flat) layer: i32,
  @location(2) @interpolate(flat) k: f32,
};
@vertex fn vs(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> VOut {
  var corners = array<vec2<f32>, 6>(vec2(0.0, 0.0), vec2(1.0, 0.0), vec2(0.0, 1.0), vec2(0.0, 1.0), vec2(1.0, 0.0), vec2(1.0, 1.0));
  let c = corners[vi];
  let t = inst[ii];
  var o: VOut;
  o.pos = u.viewProj * vec4<f32>(mix(t.rect.x, t.rect.z, c.x), u.ground, mix(t.rect.y, t.rect.w, c.y), 1.0);
  o.uv = vec2<f32>(mix(t.uv.x, t.uv.z, c.x), mix(t.uv.y, t.uv.w, c.y));
  o.layer = i32(t.layer);
  o.k = t.k * u.scale;
  return o;
}
fn cell(p: vec2<i32>, layer: i32) -> f32 {
  return textureLoad(tiles, clamp(p, vec2<i32>(0), vec2<i32>(${TILE - 1})), layer, 0).r;
}
@fragment fn fs(i: VOut) -> @location(0) vec4<f32> {
  // Bilinear by hand: r32float is not filterable everywhere.
  let p = i.uv * ${TILE}.0 - 0.5;
  let b = floor(p);
  let f = p - b;
  let q = vec2<i32>(b);
  let v = mix(mix(cell(q, i.layer), cell(q + vec2<i32>(1, 0), i.layer), f.x),
              mix(cell(q + vec2<i32>(0, 1), i.layer), cell(q + vec2<i32>(1, 1), i.layer), f.x), f.y);
  return vec4<f32>(v * i.k, 0.0, 0.0, 0.0);
}
`;

export class GpuHeatTiles {
  private readonly tex: GPUTexture;
  private readonly view: GPUTextureView;
  private readonly uniform: GPUBuffer;
  private inst: GPUBuffer;
  private instCap = 256;
  private readonly module: GPUShaderModule;
  private readonly pipelines = new Map<GPUTextureFormat, GPURenderPipeline>();
  private readonly layerOf = new Map<string, { layer: number; used: number; counts: Float32Array }>();
  private free: number[] = [];
  private frame = 0;
  private bind: GPUBindGroup | null = null;
  private bindFormat: GPUTextureFormat | null = null;

  constructor(private readonly device: GPUDevice) {
    this.tex = device.createTexture({
      label: 'heat tiles',
      size: { width: TILE, height: TILE, depthOrArrayLayers: LAYERS },
      format: 'r32float',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });
    this.view = this.tex.createView({ dimension: '2d-array' });
    this.uniform = device.createBuffer({
      label: 'heat tiles uniform',
      size: 80,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.inst = this.makeInst(this.instCap);
    this.module = device.createShaderModule({
      label: 'heat tiles',
      code: WGSL,
    });
    for (let i = LAYERS - 1; i >= 0; i--) this.free.push(i);
  }

  private makeInst(n: number): GPUBuffer {
    return this.device.createBuffer({
      label: 'heat tile instances',
      size: n * INST_FLOATS * 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
  }

  private pipeline(format: GPUTextureFormat): GPURenderPipeline {
    let p = this.pipelines.get(format);
    if (!p) {
      p = this.device.createRenderPipeline({
        label: `heat tiles ${format}`,
        layout: 'auto',
        vertex: { module: this.module, entryPoint: 'vs' },
        fragment: {
          module: this.module,
          entryPoint: 'fs',
          targets: [
            {
              format,
              blend: {
                color: { srcFactor: 'one', dstFactor: 'one', operation: 'add' },
                alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' },
              },
            },
          ],
        },
        primitive: { topology: 'triangle-list' },
      });
      this.pipelines.set(format, p);
    }
    return p;
  }

  /** A layer for `key`, uploading its counts when new; null while over this frame's uploads. */
  private layerFor(key: string, counts: Float32Array, budget: { left: number }): number | null {
    const hit = this.layerOf.get(key);
    if (hit && hit.counts === counts) {
      hit.used = this.frame;
      return hit.layer;
    }
    if (budget.left <= 0) return null;
    let layer: number;
    if (hit) layer = hit.layer;
    else if (this.free.length > 0) layer = this.free.pop()!;
    else {
      // The least recently drawn, not drawn this frame.
      let oldK = '';
      let old = Infinity;
      for (const [k, v] of this.layerOf) if (v.used < old && v.used < this.frame) [oldK, old] = [k, v.used];
      if (!oldK) return null;
      layer = this.layerOf.get(oldK)!.layer;
      this.layerOf.delete(oldK);
    }
    budget.left--;
    this.device.queue.writeTexture(
      { texture: this.tex, origin: { x: 0, y: 0, z: layer } },
      counts as unknown as BufferSource,
      { bytesPerRow: TILE * 4, rowsPerImage: TILE },
      { width: TILE, height: TILE, depthOrArrayLayers: 1 },
    );
    this.layerOf.set(key, { layer, used: this.frame, counts });
    return layer;
  }

  /** Draws `d` into `target`; sets `d.uploadsPending` when tiles waited for their upload. */
  draw(
    encoder: GPUCommandEncoder,
    target: GPUTextureView,
    format: GPUTextureFormat,
    d: HeatTileDraw & { uploadsPending?: boolean },
    viewProj: Float32Array,
  ): void {
    this.frame++;
    d.uploadsPending = false;
    if (d.tiles.length === 0 || d.scale === 0) return;
    const budget = { left: UPLOADS_PER_FRAME };
    const data = new Float32Array(d.tiles.length * INST_FLOATS);
    let n = 0;
    for (const t of d.tiles) {
      const layer = this.layerFor(t.key, t.counts, budget);
      if (layer === null) {
        d.uploadsPending = true;
        continue;
      }
      const o = n * INST_FLOATS;
      data.set(t.rect, o);
      data.set(t.uv, o + 4);
      data[o + 8] = t.perCount;
      data[o + 9] = layer;
      n++;
    }
    if (n === 0) return;
    if (n > this.instCap) {
      this.inst.destroy();
      while (this.instCap < n) this.instCap *= 2;
      this.inst = this.makeInst(this.instCap);
      this.bind = null;
    }
    this.device.queue.writeBuffer(this.inst, 0, data as unknown as BufferSource, 0, n * INST_FLOATS);
    const u = new Float32Array(20);
    u.set(viewProj.subarray(0, 16), 0);
    u[16] = d.ground;
    u[17] = d.scale;
    this.device.queue.writeBuffer(this.uniform, 0, u as unknown as BufferSource);
    const pipeline = this.pipeline(format);
    if (!this.bind || this.bindFormat !== format) {
      this.bind = this.device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.uniform } },
          { binding: 1, resource: { buffer: this.inst } },
          { binding: 2, resource: this.view },
        ],
      });
      this.bindFormat = format;
    }
    const pass = encoder.beginRenderPass({
      label: 'heat tiles',
      colorAttachments: [{ view: target, loadOp: 'load', storeOp: 'store' }],
    });
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, this.bind);
    pass.draw(6, n);
    pass.end();
  }

  destroy(): void {
    this.tex.destroy();
    this.uniform.destroy();
    this.inst.destroy();
  }
}
