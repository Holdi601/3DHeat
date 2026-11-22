/**
 * Heat tiles into the heat target (Stage 6, `render/heatTiles/`): each visible
 * tile one quad on the ground, its counts as density, added like the splat
 * (blend one/one) so exposure, curve and colour map apply as to rows. Tiles
 * live in a texture array (one layer each), reused least recently drawn;
 * at most UPLOADS_PER_FRAME new layers a frame, so a burst of arriving tiles
 * never stalls a frame - the rest come on the next ones (`uploadsPending`).
 *
 * With the draw's `kernel` each cell is drawn as the rows' sprite would draw
 * its rows (all at the cell's centre): the quad grows by the sprite's reach,
 * and a pixel adds up the cells of this tile within the sprite's radius, each
 * by the sprite's ramp - a convolution, seamless across tiles because the
 * blend adds each tile's part. The radius is the rows' (the pixel clamp at the
 * pixel's depth) but never under `KERNEL_MIN_CELLS` cells, its heat kept.
 *
 * Team colours (`components` 4) come from a second array of half-float RGBA
 * layers: per cell the heat and the group colour sums the splat writes
 * (heat, a, b, L), scaled to 1 per tile (`amp`). Heat alone into a team
 * colour target is drawn neutral (L at `TEAM_LIGHTNESS`).
 */

import { TEAM_LIGHTNESS } from '../colors';
import { holeTexels, KERNEL_MIN_CELLS, type HeatTileDraw } from '../heatTiles/source';
import { TILE } from '../heatTiles/tileFormat';
import { CURVE_LUT_SIZE } from '../../state/curve';

export const TILE_LAYERS = 192;
/** Half-float RGBA layers (512 KB each), made the first time team colours draw. */
export const TILE_LAYERS_RGBA = 160;
export const TILE_UPLOADS_PER_FRAME = 6;
export const TILE_INST_FLOATS = 16;
/** Cells each way a pixel reads at most (the LOD keeps the sprite within `KERNEL_CELLS`). */
const KERNEL_TAPS = 5;

export const HEAT_TILES_WGSL = /* wgsl */ `
override FOUR: bool = false;
struct U {
  viewProj: mat4x4<f32>,
  ground: f32, scale: f32, kernelOn: f32, perspective: f32,
  radius: f32, minPx: f32, maxPx: f32, pxPerUnit: f32,
  centre: f32, edge: f32, falloff: f32, smoothRamp: f32,
  keepMass: f32, neutralL: f32, useCurve: f32, holeW: f32,
};
// hole: the cells (texel units, min / max) where rows draw instead, weighing u.holeW.
struct Inst { rect: vec4<f32>, uv: vec4<f32>, k: f32, layer: f32, cell: f32, reach: f32, hole: vec4<f32> };
@group(0) @binding(0) var<uniform> u: U;
@group(0) @binding(1) var<storage, read> inst: array<Inst>;
@group(0) @binding(2) var tiles: texture_2d_array<f32>;
// The ramp's curve as the rows' splat reads it (centre at 0, rim at the end), linear between entries.
@group(0) @binding(3) var<storage, read> curve: array<f32, ${CURVE_LUT_SIZE}>;
struct VOut {
  @builtin(position) pos: vec4<f32>,
  @location(0) uv: vec2<f32>,
  @location(1) @interpolate(flat) layer: i32,
  @location(2) @interpolate(flat) k: f32,
  @location(3) depth: f32,
  @location(4) @interpolate(flat) span: vec4<i32>,
  @location(5) @interpolate(flat) cell: f32,
  @location(6) @interpolate(flat) hole: vec4<f32>,
};
@vertex fn vs(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> VOut {
  var corners = array<vec2<f32>, 6>(vec2(0.0, 0.0), vec2(1.0, 0.0), vec2(0.0, 1.0), vec2(0.0, 1.0), vec2(1.0, 0.0), vec2(1.0, 1.0));
  let c = corners[vi];
  let t = inst[ii];
  // The quad grown by the sprite's reach; the texture coordinates run on past the tile's edge.
  let lo = t.rect.xy - vec2<f32>(t.reach);
  let hi = t.rect.zw + vec2<f32>(t.reach);
  let w = mix(lo, hi, c);
  let f = (w - t.rect.xy) / max(t.rect.zw - t.rect.xy, vec2<f32>(1e-20));
  var o: VOut;
  o.pos = u.viewProj * vec4<f32>(w.x, u.ground, w.y, 1.0);
  o.uv = mix(t.uv.xy, t.uv.zw, f);
  o.layer = i32(t.layer);
  o.k = t.k * u.scale;
  o.depth = o.pos.w;
  // The cells this draw owns: [span.xy, span.zw).
  let a = min(t.uv.xy, t.uv.zw) * ${TILE}.0;
  let b = max(t.uv.xy, t.uv.zw) * ${TILE}.0;
  o.span = vec4<i32>(vec2<i32>(round(a)), vec2<i32>(round(b)));
  o.cell = t.cell;
  o.hole = t.hole;
  return o;
}
fn cell(p: vec2<i32>, layer: i32, hole: vec4<f32>) -> vec4<f32> {
  let v = textureLoad(tiles, clamp(p, vec2<i32>(0), vec2<i32>(${TILE - 1})), layer, 0);
  let c = vec2<f32>(p) + 0.5;
  let w = select(1.0, u.holeW, all(c >= hole.xy) && all(c < hole.zw));
  if (FOUR) { return v * w; }
  return vec4<f32>(v.r * w, 0.0, 0.0, 0.0);
}
fn ramp(d: f32) -> f32 {
  var t: f32;
  if (u.useCurve > 0.5) {
    let f = clamp(d, 0.0, 1.0) * ${CURVE_LUT_SIZE - 1}.0;
    let i = u32(floor(f));
    t = mix(curve[i], curve[min(i + 1u, ${CURVE_LUT_SIZE - 1}u)], f - floor(f));
  } else {
    t = pow(1.0 - d, u.falloff);
    if (u.smoothRamp > 0.5) { t = smoothstep(0.0, 1.0, t); }
  }
  return mix(u.edge, u.centre, t);
}
fn shade(v: vec4<f32>) -> vec4<f32> {
  if (FOUR) { return v; }
  // Heat alone: neutral in a team colour target (u.neutralL is 0 for a one-channel one).
  return vec4<f32>(v.r, 0.0, 0.0, v.r * u.neutralL);
}
@fragment fn fs(i: VOut) -> @location(0) vec4<f32> {
  let p = i.uv * ${TILE}.0;
  if (u.kernelOn < 0.5) {
    // Bilinear by hand: r32float is not filterable everywhere.
    let pb = p - 0.5;
    let b = floor(pb);
    let f = pb - b;
    let q = vec2<i32>(b);
    let v = mix(mix(cell(q, i.layer, i.hole), cell(q + vec2<i32>(1, 0), i.layer, i.hole), f.x),
                mix(cell(q + vec2<i32>(0, 1), i.layer, i.hole), cell(q + vec2<i32>(1, 1), i.layer, i.hole), f.x), f.y);
    return shade(v * i.k);
  }
  // The rows' sprite radius at this depth (their pixel clamp), never under KERNEL_MIN_CELLS cells.
  let w = select(1.0, max(i.depth, 1e-6), u.perspective > 0.5);
  var px = u.radius * u.pxPerUnit / w;
  px = max(u.minPx, select(px, min(px, u.maxPx), u.maxPx > 0.0));
  let rW = px * w / max(u.pxPerUnit, 1e-20);
  let rEff = max(rW, ${KERNEL_MIN_CELLS} * i.cell);
  let kept = select(rW, u.radius, u.keepMass > 0.5) / rEff;
  let rTex = rEff / max(i.cell, 1e-20);
  let n = min(i32(ceil(rTex)), ${KERNEL_TAPS});
  let base = vec2<i32>(floor(p));
  var acc = vec4<f32>(0.0);
  for (var dy = -n; dy <= n; dy++) {
    for (var dx = -n; dx <= n; dx++) {
      let q = base + vec2<i32>(dx, dy);
      if (any(q < i.span.xy) || any(q >= i.span.zw)) { continue; }
      let d = length(p - (vec2<f32>(q) + 0.5)) / rTex;
      if (d >= 1.0) { continue; }
      acc += cell(q, i.layer, i.hole) * ramp(d);
    }
  }
  return shade(acc * (i.k * kept * kept));
}
`;

/** One texture array of tile layers: heat (r32float) or team colours (rgba16float). */
class Bank {
  readonly tex: GPUTexture;
  readonly view: GPUTextureView;
  readonly layerOf = new Map<string, { layer: number; used: number; data: ArrayBufferView }>();
  readonly free: number[] = [];
  bind: GPUBindGroup | null = null;
  bindInst: GPUBuffer | null = null;
  bindFormat: GPUTextureFormat | null = null;

  constructor(
    private readonly device: GPUDevice,
    readonly four: boolean,
    layers: number,
  ) {
    this.tex = device.createTexture({
      label: four ? 'heat tiles rgba' : 'heat tiles',
      size: { width: TILE, height: TILE, depthOrArrayLayers: layers },
      format: four ? 'rgba16float' : 'r32float',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });
    this.view = this.tex.createView({ dimension: '2d-array' });
    for (let i = layers - 1; i >= 0; i--) this.free.push(i);
  }

  /** A layer for `key`, uploading `data` when new; null while over this frame's uploads. */
  layerFor(key: string, data: ArrayBufferView, frame: number, budget: { left: number }): number | null {
    const hit = this.layerOf.get(key);
    if (hit && hit.data === data) {
      hit.used = frame;
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
      for (const [k, v] of this.layerOf) if (v.used < old && v.used < frame) [oldK, old] = [k, v.used];
      if (!oldK) return null;
      layer = this.layerOf.get(oldK)!.layer;
      this.layerOf.delete(oldK);
    }
    budget.left--;
    this.device.queue.writeTexture(
      { texture: this.tex, origin: { x: 0, y: 0, z: layer } },
      data as unknown as BufferSource,
      { bytesPerRow: TILE * (this.four ? 8 : 4), rowsPerImage: TILE },
      { width: TILE, height: TILE, depthOrArrayLayers: 1 },
    );
    this.layerOf.set(key, { layer, used: frame, data });
    return layer;
  }

  destroy(): void {
    this.tex.destroy();
  }
}

export class GpuHeatTiles {
  private readonly uniform: GPUBuffer;
  private inst: GPUBuffer;
  private instCap = 256;
  private readonly module: GPUShaderModule;
  private readonly pipelines = new Map<string, GPURenderPipeline>();
  private readonly heat: Bank;
  private rgba: Bank | null = null;
  private frame = 0;
  private readonly curve: GPUBuffer;
  private curveKey = '';

  constructor(private readonly device: GPUDevice) {
    this.heat = new Bank(device, false, TILE_LAYERS);
    this.curve = device.createBuffer({
      label: 'heat tiles curve',
      size: CURVE_LUT_SIZE * 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    this.uniform = device.createBuffer({
      label: 'heat tiles uniform',
      size: 128,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.inst = this.makeInst(this.instCap);
    this.module = device.createShaderModule({
      label: 'heat tiles',
      code: HEAT_TILES_WGSL,
    });
  }

  private makeInst(n: number): GPUBuffer {
    return this.device.createBuffer({
      label: 'heat tile instances',
      size: n * TILE_INST_FLOATS * 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
  }

  private pipeline(format: GPUTextureFormat, four: boolean): GPURenderPipeline {
    const key = `${format}|${four}`;
    let p = this.pipelines.get(key);
    if (!p) {
      p = this.device.createRenderPipeline({
        label: `heat tiles ${key}`,
        layout: 'auto',
        vertex: { module: this.module, entryPoint: 'vs' },
        fragment: {
          module: this.module,
          entryPoint: 'fs',
          constants: { FOUR: four ? 1 : 0 },
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
      this.pipelines.set(key, p);
    }
    return p;
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
    const four = d.components === 4;
    const bank = four ? (this.rgba ??= new Bank(this.device, true, TILE_LAYERS_RGBA)) : this.heat;
    const budget = { left: TILE_UPLOADS_PER_FRAME };
    const data = new Float32Array(d.tiles.length * TILE_INST_FLOATS);
    let n = 0;
    for (const t of d.tiles) {
      const texels = four ? t.rgba : t.counts;
      if (!texels) continue;
      const layer = bank.layerFor(t.key, texels, this.frame, budget);
      if (layer === null) {
        d.uploadsPending = true;
        continue;
      }
      const o = n * TILE_INST_FLOATS;
      data.set(t.rect, o);
      data.set(t.uv, o + 4);
      // With the kernel a cell's count is its rows' heat; without, density. Team colour layers are scaled to 1.
      data[o + 8] = (d.kernel ? 1 : t.perCount) * (four ? t.amp : 1);
      data[o + 9] = layer;
      data[o + 10] = t.cell;
      data[o + 11] = d.kernel ? t.reach : 0;
      data.set(holeTexels(t, d.hole), o + 12);
      n++;
    }
    if (n === 0) return;
    if (n > this.instCap) {
      this.inst.destroy();
      while (this.instCap < n) this.instCap *= 2;
      this.inst = this.makeInst(this.instCap);
    }
    this.device.queue.writeBuffer(this.inst, 0, data as unknown as BufferSource, 0, n * TILE_INST_FLOATS);
    const u = new Float32Array(32);
    u.set(viewProj.subarray(0, 16), 0);
    u[16] = d.ground;
    u[17] = d.scale;
    const k = d.kernel;
    if (k) {
      u.set([1, k.perspective ? 1 : 0, k.radius, k.minPx, k.maxPx, k.pxPerUnit, k.centre, k.edge, Math.max(0.01, k.falloff), k.smoothRamp ? 1 : 0, k.keepMass ? 1 : 0], 18);
      if (k.curve && k.curve.length === CURVE_LUT_SIZE) {
        u[30] = 1;
        if (k.curveKey !== this.curveKey) {
          this.curveKey = k.curveKey ?? '';
          this.device.queue.writeBuffer(this.curve, 0, k.curve as unknown as BufferSource);
        }
      }
    }
    u[29] = format.startsWith('rgba') ? TEAM_LIGHTNESS : 0;
    u[31] = d.hole ? d.holeWeight : 1;
    this.device.queue.writeBuffer(this.uniform, 0, u as unknown as BufferSource);
    const pipeline = this.pipeline(format, four);
    if (!bank.bind || bank.bindFormat !== format || bank.bindInst !== this.inst) {
      bank.bind = this.device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.uniform } },
          { binding: 1, resource: { buffer: this.inst } },
          { binding: 2, resource: bank.view },
          { binding: 3, resource: { buffer: this.curve } },
        ],
      });
      bank.bindFormat = format;
      bank.bindInst = this.inst;
    }
    const pass = encoder.beginRenderPass({
      label: 'heat tiles',
      colorAttachments: [{ view: target, loadOp: 'load', storeOp: 'store' }],
    });
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bank.bind);
    pass.draw(6, n);
    pass.end();
  }

  destroy(): void {
    this.heat.destroy();
    this.rgba?.destroy();
    this.uniform.destroy();
    this.inst.destroy();
    this.curve.destroy();
  }
}
