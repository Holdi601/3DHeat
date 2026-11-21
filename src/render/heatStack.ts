/**
 * Heat read on the CPU: what makes up the heat at a spot, and how that spot
 * stands against the rest of what is on screen.
 *
 * Two readings, both from the rows the frame draws (`DrawnRows`) and neither a
 * GPU readback, so nothing here waits on the frame or holds one up:
 *
 * - the stack: every drawn row whose sprite covers a pixel - its sprite's
 *   centre within the sprite's radius of the pixel's ray - with what each one
 *   adds there, by the same ramp, weight and sign the shader uses. Its sum is
 *   the heat at that pixel, in the units of the saturation point.
 * - the field: the drawn rows binned into cells two sprite radii across, so a
 *   place's heat can be compared with every other place in view (a percentile,
 *   a ratio to the median and to the hottest), and the hottest - and in a
 *   signed mode the most negative - places named with their values.
 *
 * Both are generators that yield between slices of rows, run a few
 * milliseconds at a time off the frame path (see `runSliced` users).
 */

import type { Dataset } from '../state/types';
import { evalCurve, type CurvePoint } from '../state/curve';
import { filterColumnData } from './filterTables';
import { rowDrawn, rowSign, type DrawnRows, type Ray } from './pick';

/** How one sprite weighs: the heat shape settings the shader is given. */
export interface SpriteKernel {
  /** Sprite radius, world units. */
  radius: number;
  /** Pixel clamps on the sprite's radius, CSS pixels. */
  minPx: number;
  maxPx: number;
  /** A clamped sprite keeps the heat its true size adds (HeatSettings.zoomInvariant). */
  zoomInvariant: boolean;
  center: number;
  edge: number;
  falloff: number;
  smooth: boolean;
  /** The curve editor's ramp, when it is used instead of the falloff. */
  curve: CurvePoint[] | null;
}

/** A row's weight: the value column the heat is weighed by, and its scale (render/valueWeight.ts). */
export interface RowWeight {
  data: ArrayLike<number>;
  scale: number;
}

/** The frame's drawn rows and sprite, as `Engine.heatReading` hands them over. */
export interface HeatReading {
  dataset: Dataset;
  drawn: DrawnRows;
  kernel: SpriteKernel;
  weight: RowWeight | null;
  /** The view mode (ViewMode). */
  mode: string;
}

/** The ramp across a sprite, centre (d = 0) to rim (d = 1); 0 outside. */
export function spriteRamp(d: number, k: SpriteKernel): number {
  if (!(d <= 1)) return 0;
  let t: number;
  if (k.curve && k.curve.length) t = evalCurve(k.curve, d);
  else {
    t = Math.pow(Math.max(0, 1 - d), k.falloff);
    if (k.smooth) t = t * t * (3 - 2 * t);
  }
  return k.edge + (k.center - k.edge) * t;
}

/**
 * The radius a sprite is drawn at, `perPixel` world units to the pixel where
 * it stands, and what each of its pixels is scaled by: a sprite the clamps
 * grow or shrink keeps the heat of its true size when `zoomInvariant`.
 */
export function drawnRadius(k: SpriteKernel, perPixel: number): { radius: number; scale: number } {
  let r = k.radius;
  if (k.minPx > 0) r = Math.max(r, k.minPx * perPixel);
  if (k.maxPx > 0) r = Math.min(r, k.maxPx * perPixel);
  r = Math.max(r, 1e-9);
  const scale = k.zoomInvariant ? (k.radius / r) ** 2 : 1;
  return { radius: r, scale };
}

/** The rows under a pixel, strongest first, and what they add up to. */
export interface HeatStack {
  /** Rows in the stack (all of them up to `MAX_STACK_ROWS`). */
  rows: Int32Array;
  /** What each adds to the pixel, same order. */
  contrib: Float32Array;
  /** Rows counted, including any past the list's cap. */
  count: number;
  /** The heat at the pixel: the sum of every contribution. */
  total: number;
  /** The positive and the negative parts of `total` (difference modes). */
  positive: number;
  negative: number;
  /** More rows than the list keeps. */
  truncated: boolean;
}

/** The longest list a stack keeps; the count and the sum go on past it. */
export const MAX_STACK_ROWS = 250_000;

/**
 * The stack under a pixel: the drawn rows whose sprites cover the click's ray.
 * `perPixel(t)` is one CSS pixel's size `t` along the ray, as the pick has it.
 * Yields its progress, 0..1, every `sliceRows` rows.
 */
export function* heatStackAlongRay(
  ds: Dataset,
  drawn: DrawnRows,
  ray: Ray,
  perPixel: (t: number) => number,
  k: SpriteKernel,
  weight: RowWeight | null,
  sliceRows = 262_144,
): Generator<number, HeatStack, void> {
  const filters = drawn.filters.map((f) => ({ f, data: filterColumnData(ds, f.column) }));
  const split = drawn.splitColumn ? filterColumnData(ds, drawn.splitColumn) : null;
  const { px, py, pz } = ds;
  const gy = drawn.groundY;
  const { x: ox, y: oy, z: oz } = ray.origin;
  const { x: dx, y: dy, z: dz } = ray.dir;
  // The widest a sprite can be drawn at t: its radius, or the maximum clamp there.
  const a = perPixel(0);
  const b = perPixel(1) - a;
  const reach = (t: number) => Math.max(k.radius, k.minPx * (a + b * t));
  let rows = new Int32Array(1024);
  let contrib = new Float32Array(1024);
  let n = 0;
  let count = 0;
  let positive = 0;
  let negative = 0;
  const span = Math.max(1, drawn.rowHi - drawn.rowLo);
  for (let i = drawn.rowLo; i < drawn.rowHi; i++) {
    if ((i - drawn.rowLo) % sliceRows === sliceRows - 1) yield (i - drawn.rowLo) / span;
    const vx = px[i] - ox;
    const vy = (gy ?? py[i]) - oy;
    const vz = pz[i] - oz;
    const t = vx * dx + vy * dy + vz * dz;
    if (!(t > 0)) continue;
    const perp2 = vx * vx + vy * vy + vz * vz - t * t;
    const far = reach(t);
    if (perp2 > far * far) continue;
    const { radius, scale } = drawnRadius(k, a + b * t);
    if (perp2 > radius * radius) continue;
    if (!rowDrawn(ds, i, drawn, filters, split)) continue;
    const sign = rowSign(ds, i, drawn, split);
    if (sign === 0) continue;
    const w = weight ? weight.data[i] * weight.scale : 1;
    const c = spriteRamp(Math.sqrt(Math.max(0, perp2)) / radius, k) * scale * w * sign;
    if (c === 0 || c !== c) continue;
    count++;
    if (c > 0) positive += c;
    else negative += c;
    if (n < MAX_STACK_ROWS) {
      if (n === rows.length) {
        const r2 = new Int32Array(Math.min(MAX_STACK_ROWS, n * 2));
        r2.set(rows);
        rows = r2;
        const c2 = new Float32Array(r2.length);
        c2.set(contrib);
        contrib = c2;
      }
      rows[n] = i;
      contrib[n] = c;
      n++;
    }
  }
  // Strongest first: the rows that make the spot what it is.
  const order = Array.from({ length: n }, (_, j) => j).sort((p, q) => Math.abs(contrib[q]) - Math.abs(contrib[p]) || rows[p] - rows[q]);
  const outRows = new Int32Array(n);
  const outContrib = new Float32Array(n);
  order.forEach((j, o) => {
    outRows[o] = rows[j];
    outContrib[o] = contrib[j];
  });
  return {
    rows: outRows,
    contrib: outContrib,
    count,
    total: positive + negative,
    positive,
    negative,
    truncated: count > n,
  };
}

// ------------------------------------------------------------------- field

/** The drawn rows binned into places: cells of `cell` world units. */
export interface HeatField {
  cell: number;
  /** Binned on the ground plane (flattened heat): cells are columns. */
  flat: boolean;
  /** Cells holding anything. */
  n: number;
  /** Per cell: the summed weight (signed), the row count, and the rows' mean position. */
  value: Float64Array;
  count: Float64Array;
  cx: Float64Array;
  cy: Float64Array;
  cz: Float64Array;
  /** Per cell and group (teams mode only, `groups` of them): the summed weight. */
  groups: number;
  byGroup: Float64Array | null;
  /** The cell key → index. */
  index: Map<number, number>;
  /** Rows binned. */
  rows: number;
  /** Any negative weight: a signed field (difference). */
  signed: boolean;
}

const OFF = 1 << 16;
const SPAN = 1 << 17;

function cellKey(ix: number, iy: number, iz: number): number {
  const cx = Math.max(0, Math.min(SPAN - 1, ix + OFF));
  const cy = Math.max(0, Math.min(SPAN - 1, iy + OFF));
  const cz = Math.max(0, Math.min(SPAN - 1, iz + OFF));
  return (cx * SPAN + cy) * SPAN + cz;
}

/** The cell a world point falls in, or -1 for none. */
export function fieldCellAt(f: HeatField, x: number, y: number, z: number): number {
  const iy = f.flat ? 0 : Math.floor(y / f.cell);
  return f.index.get(cellKey(Math.floor(x / f.cell), iy, Math.floor(z / f.cell))) ?? -1;
}

/**
 * Bin the drawn rows. `groups` > 0 also keeps each group's share per cell
 * (teams mode). Yields progress, 0..1.
 */
export function* buildHeatField(
  ds: Dataset,
  drawn: DrawnRows,
  cell: number,
  weight: RowWeight | null,
  groups = 0,
  sliceRows = 262_144,
): Generator<number, HeatField, void> {
  const filters = drawn.filters.map((f) => ({ f, data: filterColumnData(ds, f.column) }));
  const split = drawn.splitColumn ? filterColumnData(ds, drawn.splitColumn) : null;
  const flat = drawn.groundY !== null;
  const size = Math.max(1e-6, cell);
  const index = new Map<number, number>();
  let cap = 4096;
  let value = new Float64Array(cap);
  let count = new Float64Array(cap);
  let cx = new Float64Array(cap);
  let cy = new Float64Array(cap);
  let cz = new Float64Array(cap);
  const g = groups > 0 && groups <= 32 && ds.teamId ? groups : 0;
  let byGroup = g ? new Float64Array(cap * g) : null;
  let n = 0;
  let rows = 0;
  let signed = false;
  const grow = (a: Float64Array, k = 1) => {
    const b = new Float64Array(cap * 2 * k);
    b.set(a);
    return b;
  };
  const span = Math.max(1, drawn.rowHi - drawn.rowLo);
  for (let i = drawn.rowLo; i < drawn.rowHi; i++) {
    if ((i - drawn.rowLo) % sliceRows === sliceRows - 1) yield (i - drawn.rowLo) / span;
    if (!rowDrawn(ds, i, drawn, filters, split)) continue;
    const sign = rowSign(ds, i, drawn, split);
    if (sign === 0) continue;
    const w = (weight ? weight.data[i] * weight.scale : 1) * sign;
    if (w === 0 || w !== w) continue;
    if (w < 0) signed = true;
    const x = ds.px[i];
    const y = drawn.groundY ?? ds.py[i];
    const z = ds.pz[i];
    const key = cellKey(Math.floor(x / size), flat ? 0 : Math.floor(y / size), Math.floor(z / size));
    let c = index.get(key);
    if (c === undefined) {
      if (n === cap) {
        value = grow(value);
        count = grow(count);
        cx = grow(cx);
        cy = grow(cy);
        cz = grow(cz);
        if (byGroup) byGroup = grow(byGroup, g);
        cap *= 2;
      }
      c = n++;
      index.set(key, c);
    }
    value[c] += w;
    count[c] += 1;
    cx[c] += x;
    cy[c] += y;
    cz[c] += z;
    if (byGroup && ds.teamId) {
      const team = ds.teamId[i];
      if (team < g) byGroup[c * g + team] += Math.abs(w);
    }
    rows++;
  }
  for (let c = 0; c < n; c++) {
    cx[c] /= count[c];
    cy[c] /= count[c];
    cz[c] /= count[c];
  }
  return { cell: size, flat, n, value, count, cx, cy, cz, groups: g, byGroup, index, rows, signed };
}

/** Projects a world point to CSS pixels, null when it is behind the camera. */
export type Project = (x: number, y: number, z: number) => { x: number; y: number } | null;

/** The cells whose centre is on screen. */
export function visibleCells(f: HeatField, project: Project, width: number, height: number): Int32Array {
  const out: number[] = [];
  for (let c = 0; c < f.n; c++) {
    const p = project(f.cx[c], f.cy[c], f.cz[c]);
    if (p && p.x >= 0 && p.y >= 0 && p.x <= width && p.y <= height) out.push(c);
  }
  return Int32Array.from(out);
}

/** Where a value stands among the places in view. */
export interface RelativeHeat {
  /** Share of the places in view (on the same side, when signed) that are cooler, 0..1. */
  percentile: number;
  /** The value over the median place's (same side). */
  ofMedian: number;
  /** The value over the hottest place's (same side). */
  ofPeak: number;
  /** The places compared with. */
  places: number;
}

/** Sorted magnitudes of the visible cells' values, one list per side. */
export interface VisibleSpread {
  positive: Float64Array;
  negative: Float64Array;
}

export function visibleSpread(f: HeatField, cells: Int32Array): VisibleSpread {
  const pos: number[] = [];
  const neg: number[] = [];
  for (const c of cells) {
    const v = f.value[c];
    if (v > 0) pos.push(v);
    else if (v < 0) neg.push(-v);
  }
  const p = Float64Array.from(pos).sort();
  const n = Float64Array.from(neg).sort();
  return { positive: p, negative: n };
}

/** How `value` stands against the spread; null when no place on its side is in view. */
export function relativeHeat(value: number, spread: VisibleSpread): RelativeHeat | null {
  const list = value < 0 ? spread.negative : spread.positive;
  const v = Math.abs(value);
  if (!list.length || v === 0) return null;
  // Places strictly cooler, plus half the ties: a spot among equals sits mid-way.
  let lo = 0;
  let hi = list.length;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (list[m] < v) lo = m + 1;
    else hi = m;
  }
  let eq = lo;
  while (eq < list.length && list[eq] === v) eq++;
  const below = lo + (eq - lo) / 2;
  const median = list[list.length >> 1];
  const peak = list[list.length - 1];
  return {
    percentile: list.length > 1 ? below / list.length : 1,
    ofMedian: median > 0 ? v / median : 0,
    ofPeak: peak > 0 ? v / peak : 0,
    places: list.length,
  };
}

/** A place worth a label. */
export interface HeatLabel {
  cell: number;
  x: number;
  y: number;
  z: number;
  value: number;
  rows: number;
  /** 1 for the hottest, counted per side. */
  rank: number;
  side: 1 | -1;
  /** Teams mode: the group holding the largest share here, and that share. */
  group: number;
  share: number;
}

/**
 * The `k` hottest places in view - and, for a signed field, the `k` most
 * negative - kept at least `spacing` cells apart so one hot spot does not take
 * every label.
 */
export function pickHeatLabels(f: HeatField, cells: Int32Array, k: number, spacing = 3): HeatLabel[] {
  const out: HeatLabel[] = [];
  const take = (side: 1 | -1) => {
    const list = Array.from(cells).filter((c) => f.value[c] * side > 0);
    list.sort((a, b) => f.value[b] * side - f.value[a] * side);
    const kept: number[] = [];
    const min2 = (spacing * f.cell) ** 2;
    for (const c of list) {
      if (kept.length >= k) break;
      let near = false;
      for (const o of kept) {
        const ddx = f.cx[c] - f.cx[o];
        const ddy = f.flat ? 0 : f.cy[c] - f.cy[o];
        const ddz = f.cz[c] - f.cz[o];
        if (ddx * ddx + ddy * ddy + ddz * ddz < min2) {
          near = true;
          break;
        }
      }
      if (near) continue;
      kept.push(c);
      let group = -1;
      let share = 0;
      if (f.byGroup && f.groups > 0) {
        let sum = 0;
        let best = 0;
        for (let j = 0; j < f.groups; j++) {
          const v = f.byGroup[c * f.groups + j];
          sum += v;
          if (v > best) {
            best = v;
            group = j;
          }
        }
        share = sum > 0 ? best / sum : 0;
      }
      out.push({ cell: c, x: f.cx[c], y: f.cy[c], z: f.cz[c], value: f.value[c], rows: f.count[c], rank: kept.length, side, group, share });
    }
  };
  take(1);
  if (f.signed) take(-1);
  return out;
}
