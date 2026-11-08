/**
 * The vehicle heatmap's scene: one vehicle's figure, large, with the hits on
 * it painted as heat on its surface, and over it, as lines, the hits'
 * points, the ways the shots came in and the destroyed modules. Triangles
 * and lines in the renderer's vertex layout (xyz, rgba), like the race and
 * board scenes, so both renderers draw it as they draw those.
 *
 * The figure stands at the origin, x forward, y up, z right, its lowest
 * point on the ground grid (an aircraft too, so it can be walked round).
 */

import { lapColor, VertexBuffer, type Rgb, type Vec3 } from '../race/geometry';
import { CATALOG } from '../figures/catalog';
import { TemplateCache, type Template } from '../figures/kit';
import { figureFor, figureForClass } from '../figures/match';
import type { VehicleHit, VehicleInfo } from './hits';
import { weaponOf } from './hits';
import { autoSaturation, heatMeshOf, paint, rampOfLut, snapHits, splatHeat, type HeatMesh, type Ramp } from './surface';
import { personRegions, regionCentres, regionHeat, regionOf, type Region } from './regions';

export type ColourBy = 'none' | 'weapon' | 'shooter' | 'match';

export interface VehicleLook {
  /** Gaussian radius on the surface, m; 0 picks one from the vehicle's size. */
  radius: number;
  /** Stops brighter (+) or darker (-) than the automatic exposure. */
  exposure: number;
  showPoints: boolean;
  showArrows: boolean;
  colourBy: ColourBy;
}

/** The figure a vehicle is drawn as: by its id and name, else by its kind, else a generic one of its domain. */
export function figureOfVehicle(v: Pick<VehicleInfo, 'id' | 'name' | 'kind'>): string {
  if (v.id === 'soldier' || v.kind === 'person') return 'soldier';
  const f = figureFor([v.id, v.name].filter(Boolean), v.kind ? [v.kind] : []);
  if (f && CATALOG[f]) return f;
  const k = v.kind.toLowerCase();
  const generic = /heli/.test(k)
    ? 'transport-helicopter'
    : /aircraft|plane|fighter|bomber|attacker/.test(k)
      ? 'multirole-jet'
      : /ship|boat|destroyer|cruiser|frigate/.test(k)
        ? 'destroyer'
        : 'mbt';
  return figureForClass(generic) ?? figureForClass('mbt') ?? 'mbt';
}

const templates = new TemplateCache();

export function templateOfFigure(name: string): Template | null {
  const e = CATALOG[name];
  return e ? templates.get(name, e.build) : null;
}

/** The figure's size: its longest side, m. */
export function sizeOf(t: { min: Vec3; max: Vec3 }): number {
  return Math.max(t.max[0] - t.min[0], t.max[1] - t.min[1], t.max[2] - t.min[2], 0.1);
}

/** The radius the heat spreads by when none is set: a fiftieth of the vehicle, 5 cm to 3 m. */
export function autoRadius(size: number): number {
  return Math.max(0.05, Math.min(3, size * 0.02));
}

/** Whether a hit point is near enough the figure to be its (a point the game sent in another frame lies tens of metres off). */
export function onFigure(p: Vec3, t: { min: Vec3; max: Vec3 }): boolean {
  const pad = sizeOf(t) * 0.25;
  for (let k = 0; k < 3; k++) if (p[k] < t.min[k] - pad || p[k] > t.max[k] + pad) return false;
  return true;
}

export interface HeatResult {
  mesh: HeatMesh;
  heat: Float32Array;
  /** The heat that fills the ramp, before the exposure. */
  auto: number;
  /** Hits drawn, hits left off (too far from the figure, or no point and no region). */
  drawn: number;
  off: number;
  /** For region data: hits per region, and where each region is. */
  regions: Map<Region, number> | null;
  centres: Map<Region, Vec3> | null;
}

/** The heat of `hits` on a figure's mesh: splatted at their points, or by region for hits that name one. */
export function heatOf(mesh: HeatMesh, hits: VehicleHit[], radius: number, tags: Uint8Array | null): HeatResult {
  const placed: { p: Vec3; dir: Vec3 | null; weight: number }[] = [];
  const counts = new Map<Region, number>();
  let off = 0;
  for (const h of hits) {
    if (h.local) {
      if (onFigure(h.local, mesh)) placed.push({ p: h.local, dir: h.dir, weight: 1 });
      else off++;
    } else if (h.region && tags) {
      const r = regionOf(h.region);
      if (r) counts.set(r, (counts.get(r) ?? 0) + 1);
      else off++;
    } else off++;
  }
  let heat: Float32Array;
  let regions: Map<Region, number> | null = null;
  let centres: Map<Region, Vec3> | null = null;
  if (counts.size && tags) {
    heat = regionHeat(tags, counts);
    regions = counts;
    centres = regionCentres(mesh, tags);
  } else {
    heat = splatHeat(mesh, snapHits(mesh, placed, Math.max(radius * 4, sizeOf(mesh) * 0.08)), radius);
  }
  // Region heat fills the ramp at the most-hit region; splats at a high percentile.
  const auto = regions ? Math.max(1, ...regions.values()) : autoSaturation(heat, mesh.count);
  return { mesh, heat, auto, drawn: placed.length + [...counts.values()].reduce((a, b) => a + b, 0), off, regions, centres };
}

/** Category colours for the points and arrows, in the order the categories are first seen. */
export function categoryColours(hits: VehicleHit[], by: ColourBy): { of: (h: VehicleHit) => Rgb; legend: [string, Rgb][] } {
  if (by === 'none') return { of: () => [0.95, 0.95, 0.95], legend: [] };
  const key = (h: VehicleHit) => (by === 'weapon' ? weaponOf(h) : by === 'shooter' ? h.shooter : h.match) || '?';
  const counts = new Map<string, number>();
  for (const h of hits) counts.set(key(h), (counts.get(key(h)) ?? 0) + 1);
  // The most frequent get their own colours; the rest share grey.
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k]) => k);
  const colours = new Map(top.map((k, i) => [k, lapColor(i, top.length)] as const));
  const grey: Rgb = [0.6, 0.6, 0.6];
  return { of: (h) => colours.get(key(h)) ?? grey, legend: top.map((k) => [k, colours.get(k)!]) };
}

export interface VehicleFrame {
  tris: VertexBuffer;
  lines: VertexBuffer;
}

/** What the scene is built from. */
export interface VehicleInput {
  figure: string;
  hits: VehicleHit[];
  look: VehicleLook;
  lut: Uint8Array;
  /** Changes when the colour ramp does. */
  lutKey: number;
}

/**
 * The scene, rebuilt only in the parts that changed: the fine mesh once per
 * figure, the heat when the hits or the radius change, the colours when the
 * exposure or the ramp do, the lines when the hits or what they show do.
 */
export class VehicleScene {
  private readonly frame: VehicleFrame = { tris: new VertexBuffer(), lines: new VertexBuffer() };
  private readonly meshes = new Map<string, HeatMesh>();
  private readonly tags = new Map<string, Uint8Array | null>();
  private heatKey: unknown[] = [];
  private paintKey: unknown[] = [];
  private lineKey: unknown[] = [];
  result: HeatResult | null = null;
  /** The figure's lift onto the grid. */
  lift = 0;

  mesh(figure: string): HeatMesh | null {
    let m = this.meshes.get(figure);
    if (!m) {
      const t = templateOfFigure(figure);
      if (!t) return null;
      m = heatMeshOf(t);
      this.meshes.set(figure, m);
      this.tags.set(figure, CATALOG[figure]?.domain === 'person' ? personRegions(m) : null);
    }
    return m;
  }

  /** The figure's box as drawn (lifted onto the grid). */
  bounds(figure: string): { minX: number; minY: number; minZ: number; maxX: number; maxY: number; maxZ: number } | null {
    const m = this.mesh(figure);
    if (!m) return null;
    const lift = -m.min[1];
    return { minX: m.min[0], minY: 0, minZ: m.min[2], maxX: m.max[0], maxY: m.max[1] + lift, maxZ: m.max[2] };
  }

  /** The scene for `input`; the second value says whether anything was rebuilt. */
  build(input: VehicleInput): [VehicleFrame, boolean] {
    const mesh = this.mesh(input.figure);
    const { tris, lines } = this.frame;
    if (!mesh) {
      const changed = tris.count > 0 || lines.count > 0;
      tris.reset();
      lines.reset();
      this.result = null;
      return [this.frame, changed];
    }
    const lift = -mesh.min[1];
    this.lift = lift;
    const radius = input.look.radius > 0 ? input.look.radius : autoRadius(sizeOf(mesh));
    let changed = false;
    const hk = [mesh, input.hits, radius];
    if (!same(hk, this.heatKey)) {
      this.heatKey = hk;
      this.result = heatOf(mesh, input.hits, radius, this.tags.get(input.figure) ?? null);
      this.paintKey = [];
      changed = true;
    }
    const result = this.result!;
    const saturation = result.auto * Math.pow(2, -input.look.exposure);
    const pk = [result, saturation, input.lutKey];
    if (!same(pk, this.paintKey)) {
      this.paintKey = pk;
      tris.reset();
      paint(mesh, result.heat, saturation, rampOfLut(input.lut), tris, [0, lift, 0]);
      changed = true;
    }
    const lk = [mesh, input.hits, input.look.showPoints, input.look.showArrows, input.look.colourBy, result];
    if (!same(lk, this.lineKey)) {
      this.lineKey = lk;
      lines.reset();
      drawOverlay(lines, mesh, input.hits, input.look, radius, lift);
      changed = true;
    }
    return [this.frame, changed];
  }
}

function same(a: unknown[], b: unknown[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** Points as small crosses, and shots as arrows coming in to where they hit. */
function drawOverlay(lines: VertexBuffer, mesh: HeatMesh, hits: VehicleHit[], look: VehicleLook, radius: number, lift: number): void {
  const size = sizeOf(mesh);
  const colours = categoryColours(hits, look.colourBy);
  const arm = Math.max(0.02, radius * 0.5);
  const len = size * 0.12;
  // Not every arrow of thousands: a fair share of them, spread over the set.
  const step = Math.max(1, Math.ceil(hits.length / 1500));
  for (let i = 0; i < hits.length; i++) {
    const h = hits[i];
    if (!h.local || !onFigure(h.local, mesh)) continue;
    const p: Vec3 = [h.local[0], h.local[1] + lift, h.local[2]];
    const col = colours.of(h);
    if (look.showPoints) {
      lines.line([p[0] - arm, p[1], p[2]], [p[0] + arm, p[1], p[2]], col, 0.9);
      lines.line([p[0], p[1] - arm, p[2]], [p[0], p[1] + arm, p[2]], col, 0.9);
      lines.line([p[0], p[1], p[2] - arm], [p[0], p[1], p[2] + arm], col, 0.9);
    }
    if (look.showArrows && h.dir && i % step === 0) arrow(lines, p, h.dir, len, col);
  }
}

/** An arrow along `dir` ending at `p`: where the shot came in from. */
function arrow(lines: VertexBuffer, p: Vec3, dir: Vec3, len: number, col: Rgb): void {
  const a: Vec3 = [p[0] - dir[0] * len, p[1] - dir[1] * len, p[2] - dir[2] * len];
  lines.line(a, p, col, 0.75);
  // Two barbs, across the arrow in the plane with the up axis (or forward when the arrow is upright).
  const side: Vec3 = Math.abs(dir[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
  const cx = dir[1] * side[2] - dir[2] * side[1], cy = dir[2] * side[0] - dir[0] * side[2], cz = dir[0] * side[1] - dir[1] * side[0];
  const cl = Math.hypot(cx, cy, cz) || 1;
  const b = len * 0.18;
  for (const s of [-1, 1]) {
    lines.line(p, [p[0] - dir[0] * b + (cx / cl) * b * 0.5 * s, p[1] - dir[1] * b + (cy / cl) * b * 0.5 * s, p[2] - dir[2] * b + (cz / cl) * b * 0.5 * s], col, 0.75);
  }
}

export type { Ramp };
