/**
 * The vehicle heatmap's scene: one vehicle's figure, large, with every hit
 * as a mark where it struck - a small disc on the surface, coloured by what
 * it did (or by weapon, shooter, match, the game's code), the killing shot
 * ringed - the heat the hits make on the surface under them, a penetration's
 * path from where the shell went in to where it ended, and the ways the
 * shots came in. Triangles and lines in the renderer's vertex layout (xyz,
 * rgba), like the race and board scenes, so both renderers draw it as they
 * draw those.
 *
 * The figure stands at the origin, x forward, y up, z right, its lowest
 * point on the ground grid (an aircraft too, so it can be walked round).
 */

import { lapColor, VertexBuffer, type Rgb, type Vec3 } from '../race/geometry';
import { CATALOG } from '../figures/catalog';
import { TemplateCache, type Template } from '../figures/kit';
import { figureFor, figureForClass } from '../figures/match';
import type { Outcome, VehicleHit, VehicleInfo } from './hits';
import { weaponOf } from './hits';
import { autoSaturation, heatMeshOf, paint, rampOfLut, snapHits, splatHeat, type HeatMesh, type Ramp } from './surface';
import { personRegions, regionCentres, regionHeat, regionOf, REGIONS, type Region } from './regions';

export type ColourBy = 'outcome' | 'none' | 'weapon' | 'shooter' | 'match' | 'code';

export interface VehicleLook {
  /** Gaussian radius on the surface, m; 0 picks one from the vehicle's size. */
  radius: number;
  /** Stops brighter (+) or darker (-) than the automatic exposure. */
  exposure: number;
  showPoints: boolean;
  showHeat: boolean;
  showArrows: boolean;
  colourBy: ColourBy;
}

/** The outcome colours: cool and bright, apart from the heat ramp's reds and yellows. */
export const OUTCOME_COLOURS: Record<Outcome, Rgb> = {
  kill: [1.0, 0.17, 0.84],
  module: [0.62, 0.42, 1.0],
  critical: [0.15, 0.55, 1.0],
  severe: [0.2, 0.85, 1.0],
  damage: [0.25, 0.95, 0.55],
  nodamage: [0.27, 0.31, 0.4],
  hit: [0.95, 0.95, 0.95],
};

/** The figure a vehicle is drawn as: by its id and name, else by its kind, else a generic one of its domain. */
export function figureOfVehicle(v: Pick<VehicleInfo, 'id' | 'name' | 'kind'>): string {
  if (v.id === 'soldier' || v.kind === 'person') return 'soldier';
  const types = v.kind ? [v.kind] : [];
  const f = figureFor([v.id, v.name, ...[v.id, v.name].map(bareName)].filter(Boolean), types);
  // A figure found by the name; one found only by the type is a class's, chosen below more closely.
  if (f && CATALOG[f] && f !== figureFor([], types)) return f;
  const k = v.kind.toLowerCase();
  // A ship's own class where there is a figure of it.
  for (const cls of ['battleship', 'cruiser', 'carrier', 'submarine', 'destroyer']) {
    if (k.includes(cls)) {
      const g = figureForClass(cls);
      if (g) return g;
    }
  }
  if (f && CATALOG[f]) return f;
  const generic = /heli/.test(k)
    ? 'transport-helicopter'
    : /aircraft|plane|fighter|bomber|attacker/.test(k)
      ? 'multirole-jet'
      : /ship|boat|destroyer|cruiser|frigate|battleship|carrier|submarine/.test(k)
        ? 'destroyer'
        : 'mbt';
  return figureForClass(generic) ?? figureForClass('mbt') ?? 'mbt';
}

/**
 * A game's vehicle id without its nation and index: World of Tanks'
 * "usa:A83_T110E4" is the T110E4, World of Warships' "PASB018_Iowa_1944"
 * the Iowa 1944.
 */
export function bareName(id: string): string {
  return id
    .replace(/^[a-z]+:/i, '')
    .replace(/^[A-Z]{1,5}\d+[_-]/, '')
    .replace(/[_-]/g, ' ')
    .trim();
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

/** The radius the heat spreads by when none is set: tight, so each hit reads as a spot - an eightieth of the vehicle, 3 cm to 1.5 m. */
export function autoRadius(size: number): number {
  return Math.max(0.03, Math.min(1.5, size * 0.0125));
}

/** A mark's radius: a hundred-and-tenth of the vehicle, 2 cm to 0.9 m. */
export function markRadius(size: number): number {
  return Math.max(0.02, Math.min(0.9, size * 0.009));
}

/** Whether a hit point is near enough the figure to be its (a stray point lies tens of metres off). */
export function onFigure(p: Vec3, t: { min: Vec3; max: Vec3 }): boolean {
  const pad = sizeOf(t) * 0.1;
  for (let k = 0; k < 3; k++) if (p[k] < t.min[k] - pad || p[k] > t.max[k] + pad) return false;
  return true;
}

/** A hit as drawn: where on the surface (figure frame, before the lift), the surface's normal there. */
export interface Mark {
  hit: VehicleHit;
  p: Vec3;
  n: Vec3 | null;
}

export interface HeatResult {
  mesh: HeatMesh;
  heat: Float32Array;
  /** The heat that fills the ramp, before the exposure. */
  auto: number;
  /** Hits drawn, hits left off (too far from the figure, or no point and no region). */
  drawn: number;
  off: number;
  /** The hits with a point, as placed on the surface. */
  marks: Mark[];
  /** For hits that name only a body region: hits per region, and where each region is. */
  regions: Map<Region, number> | null;
  centres: Map<Region, Vec3> | null;
}

/** The heat of `hits` on a figure's mesh: splatted where they struck, or by region for hits that only name one. */
export function heatOf(mesh: HeatMesh, hits: VehicleHit[], radius: number, tags: Uint8Array | null): HeatResult {
  const placed: { p: Vec3; dir: Vec3 | null; weight: number; tag?: number }[] = [];
  const placedHits: VehicleHit[] = [];
  const counts = new Map<Region, number>();
  let off = 0;
  for (const h of hits) {
    if (h.local) {
      if (!onFigure(h.local, mesh)) {
        off++;
        continue;
      }
      const r = h.region && tags ? regionOf(h.region) : null;
      placed.push({ p: h.local, dir: h.dir, weight: 1, tag: r ? REGIONS.indexOf(r) : undefined });
      placedHits.push(h);
    } else if (h.region && tags) {
      const r = regionOf(h.region);
      if (r) counts.set(r, (counts.get(r) ?? 0) + 1);
      else off++;
    } else off++;
  }
  const splats = snapHits(mesh, placed, Math.max(radius * 4, sizeOf(mesh) * 0.08), tags);
  // A point too far from the figure to be put on it is no mark: the figure is not the game's model there, or the
  // point is not on the vehicle. It is counted off the figure.
  const marks: Mark[] = [];
  splats.forEach((s, i) => {
    if (s.n) marks.push({ hit: placedHits[i], p: s.p, n: s.n });
    else off++;
  });
  let heat: Float32Array;
  let regions: Map<Region, number> | null = null;
  let centres: Map<Region, Vec3> | null = null;
  if (counts.size && tags && !placed.length) {
    heat = regionHeat(tags, counts);
    regions = counts;
    centres = regionCentres(mesh, tags);
  } else {
    heat = splatHeat(mesh, splats, radius);
  }
  // Region heat fills the ramp at the most-hit region; splats at a high percentile.
  const auto = regions ? Math.max(1, ...regions.values()) : autoSaturation(heat, mesh.count);
  return { mesh, heat, auto, drawn: marks.length + [...counts.values()].reduce((a, b) => a + b, 0), off, marks, regions, centres };
}

/** The key a hit is coloured by. */
export function colourKey(h: VehicleHit, by: ColourBy): string {
  switch (by) {
    case 'weapon':
      return weaponOf(h) || '?';
    case 'shooter':
      return h.shooter || '?';
    case 'match':
      return h.match || '?';
    case 'code':
      return h.code || '?';
    default:
      return h.outcome;
  }
}

/** Colours for the marks and arrows, and the legend: outcomes their own, other keys the most frequent first. */
export function categoryColours(hits: VehicleHit[], by: ColourBy): { of: (h: VehicleHit) => Rgb; legend: [string, Rgb][] } {
  if (by === 'none') return { of: () => [0.95, 0.95, 0.95], legend: [] };
  if (by === 'outcome') {
    const seen = new Set(hits.map((h) => h.outcome));
    return { of: (h) => OUTCOME_COLOURS[h.outcome], legend: (Object.keys(OUTCOME_COLOURS) as Outcome[]).filter((o) => seen.has(o)).map((o) => [o, OUTCOME_COLOURS[o]]) };
  }
  const counts = new Map<string, number>();
  for (const h of hits) counts.set(colourKey(h, by), (counts.get(colourKey(h, by)) ?? 0) + 1);
  // The most frequent get their own colours; the rest share grey.
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k]) => k);
  const colours = new Map(top.map((k, i) => [k, lapColor(i, top.length)] as const));
  const grey: Rgb = [0.6, 0.6, 0.6];
  return { of: (h) => colours.get(colourKey(h, by)) ?? grey, legend: top.map((k) => [k, colours.get(k)!]) };
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
  selected: VehicleHit | null;
}

/**
 * The scene, rebuilt only in the parts that changed: the fine mesh once per
 * figure, the heat when the hits or the radius change, the colours when the
 * exposure or the ramp do, the marks and lines when the hits or what they
 * show do.
 */
export class VehicleScene {
  private readonly frame: VehicleFrame = { tris: new VertexBuffer(), lines: new VertexBuffer() };
  private readonly surface = new VertexBuffer();
  private readonly meshes = new Map<string, HeatMesh>();
  private readonly tags = new Map<string, Uint8Array | null>();
  private heatKey: unknown[] = [];
  private paintKey: unknown[] = [];
  private markKey: unknown[] = [];
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
    const pk = [result, saturation, input.lutKey, input.look.showHeat];
    if (!same(pk, this.paintKey)) {
      this.paintKey = pk;
      this.surface.reset();
      paint(mesh, input.look.showHeat ? result.heat : ZERO(mesh.count), saturation, rampOfLut(input.lut), this.surface, [0, lift, 0]);
      this.markKey = [];
      changed = true;
    }
    const mk = [result, input.look.showPoints, input.look.showArrows, input.look.colourBy, input.selected, this.surface.count];
    if (!same(mk, this.markKey)) {
      this.markKey = mk;
      // The surface, then the marks on it.
      tris.reset();
      if (tris.data.length < this.surface.data.length) tris.data = new Float32Array(this.surface.data.length);
      tris.data.set(this.surface.data.subarray(0, this.surface.count * 7));
      tris.count = this.surface.count;
      lines.reset();
      drawMarks(tris, lines, result, input.look, mesh, lift, input.selected);
      changed = true;
    }
    return [this.frame, changed];
  }

  /**
   * The hit drawn nearest a point on the screen, within `px` pixels, or null:
   * `project` takes a world point to screen pixels (null behind the eye).
   */
  pick(project: (x: number, y: number, z: number) => [number, number] | null, at: [number, number], px = 14): VehicleHit | null {
    const r = this.result;
    if (!r) return null;
    let best: VehicleHit | null = null;
    let bestD = px;
    for (const m of r.marks) {
      const s = project(m.p[0], m.p[1] + this.lift, m.p[2]);
      if (!s) continue;
      const d = Math.hypot(s[0] - at[0], s[1] - at[1]);
      if (d < bestD) {
        bestD = d;
        best = m.hit;
      }
    }
    return best;
  }
}

const zeros = new Map<number, Float32Array>();
function ZERO(n: number): Float32Array {
  let z = zeros.get(n);
  if (!z) zeros.set(n, (z = new Float32Array(n)));
  return z;
}

function same(a: unknown[], b: unknown[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** Two unit vectors across `n`. */
function across(n: Vec3): [Vec3, Vec3] {
  const t: Vec3 = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  let a: Vec3 = [n[1] * t[2] - n[2] * t[1], n[2] * t[0] - n[0] * t[2], n[0] * t[1] - n[1] * t[0]];
  const la = Math.hypot(...a) || 1;
  a = [a[0] / la, a[1] / la, a[2] / la];
  const b: Vec3 = [n[1] * a[2] - n[2] * a[1], n[2] * a[0] - n[0] * a[2], n[0] * a[1] - n[1] * a[0]];
  return [a, b];
}

/**
 * Each hit as a disc on the surface, a dark rim round it so it reads over
 * the heat, sized by the damage it did where that is known; the killing
 * shot and the selected hit ringed; a penetration's path entry to exit; the
 * shots' ways in as arrows.
 */
function drawMarks(tris: VertexBuffer, lines: VertexBuffer, result: HeatResult, look: VehicleLook, mesh: HeatMesh, lift: number, selected: VehicleHit | null): void {
  const size = sizeOf(mesh);
  const hits = result.marks.map((m) => m.hit);
  const colours = categoryColours(hits, look.colourBy);
  const r0 = markRadius(size);
  const len = size * 0.12;
  let maxDamage = 0;
  for (const h of hits) if (h.damage !== null && h.damage > maxDamage) maxDamage = h.damage;
  const step = Math.max(1, Math.ceil(result.marks.length / 1500));
  const segs = 10;
  // Killing shots are ringed while they stand out; among dozens the rings only cover each other.
  const fewKills = hits.filter((h) => h.killingShot).length <= 12;
  const rim: Rgb = [0.08, 0.08, 0.1];
  for (let i = 0; i < result.marks.length; i++) {
    const m = result.marks[i];
    const h = m.hit;
    const col = colours.of(h);
    // Just off the surface, along its normal (or towards where the shot came from).
    const n: Vec3 = m.n ?? (h.dir ? [-h.dir[0], -h.dir[1], -h.dir[2]] : [0, 1, 0]);
    const c: Vec3 = [m.p[0] + n[0] * r0 * 0.15, m.p[1] + lift + n[1] * r0 * 0.15, m.p[2] + n[2] * r0 * 0.15];
    const [a, b] = across(n);
    const k = h.damage !== null && maxDamage > 0 ? 0.7 + 0.8 * Math.sqrt(h.damage / maxDamage) : 1;
    const r = r0 * k * (h.killingShot ? 1.4 : 1);
    if (look.showPoints) {
      for (let s = 0; s < segs; s++) {
        const t0 = (s / segs) * Math.PI * 2, t1 = ((s + 1) / segs) * Math.PI * 2;
        const p0: Vec3 = [c[0] + (a[0] * Math.cos(t0) + b[0] * Math.sin(t0)) * r, c[1] + (a[1] * Math.cos(t0) + b[1] * Math.sin(t0)) * r, c[2] + (a[2] * Math.cos(t0) + b[2] * Math.sin(t0)) * r];
        const p1: Vec3 = [c[0] + (a[0] * Math.cos(t1) + b[0] * Math.sin(t1)) * r, c[1] + (a[1] * Math.cos(t1) + b[1] * Math.sin(t1)) * r, c[2] + (a[2] * Math.cos(t1) + b[2] * Math.sin(t1)) * r];
        tris.triangle(c, p0, p1, col, 1);
        lines.line(p0, p1, rim, 0.9);
      }
      if ((h.killingShot && fewKills) || h === selected) {
        const rr = r * (h === selected ? 2.6 : 2);
        const ring: Rgb = h === selected ? [1, 1, 1] : OUTCOME_COLOURS.kill;
        for (let s = 0; s < 24; s++) {
          const t0 = (s / 24) * Math.PI * 2, t1 = ((s + 1) / 24) * Math.PI * 2;
          lines.line(
            [c[0] + (a[0] * Math.cos(t0) + b[0] * Math.sin(t0)) * rr, c[1] + (a[1] * Math.cos(t0) + b[1] * Math.sin(t0)) * rr, c[2] + (a[2] * Math.cos(t0) + b[2] * Math.sin(t0)) * rr],
            [c[0] + (a[0] * Math.cos(t1) + b[0] * Math.sin(t1)) * rr, c[1] + (a[1] * Math.cos(t1) + b[1] * Math.sin(t1)) * rr, c[2] + (a[2] * Math.cos(t1) + b[2] * Math.sin(t1)) * rr],
            ring,
            1,
          );
        }
      }
      // A shell's path through the vehicle, from where it went in to where it ended.
      if (h.exit) {
        const e: Vec3 = [h.exit[0], h.exit[1] + lift, h.exit[2]];
        lines.line(c, e, col, 0.95);
        lines.line([e[0] - r * 0.6, e[1], e[2]], [e[0] + r * 0.6, e[1], e[2]], col, 0.95);
        lines.line([e[0], e[1] - r * 0.6, e[2]], [e[0], e[1] + r * 0.6, e[2]], col, 0.95);
      }
    }
    if (look.showArrows && h.dir && i % step === 0) arrow(lines, c, h.dir, len, col);
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
