/**
 * Ground units on the level's ground: each match's vehicles and ships
 * measured against the loaded level, and a match whose ground units all sit
 * the same few metres under (or over) it lifted onto it.
 *
 * Why: War Thunder sends a ground unit's place packed in 64 bits, its height
 * from an offset the converter measures on each replay. Where that
 * measurement went wrong (heat3d-wt-replay before the fix: three noisy
 * pairs were enough), every tank of the match sits metres under the
 * terrain - the follow camera ends inside the hill and the level vanishes.
 * Such an error is one number per match: every ground unit off by the same
 * height (the spread between them a few centimetres), unlike a unit that
 * really drives on a bridge or sinks into a river.
 *
 * Only a match whose ground units sit off by more than `MIN_SHIFT` metres,
 * all of them alike (the middle 80% within `MAX_SPREAD`), on enough samples,
 * is moved, and only its ground units and ships: aircraft fly by positions
 * sent another way. What was moved is told (`GroundFix`), never silently.
 */

import type { Dataset } from '../state/types';

/** A match moved onto the level. */
export interface GroundFix {
  /** Session index, -1 when the data has no sessions. */
  session: number;
  label: string;
  /** Metres added to its ground units' heights. */
  metres: number;
  /** The middle 80%'s spread of their height above the level before, metres. */
  spread: number;
  samples: number;
}

/** What each match's ground units measured, moved or not. */
export interface GroundCheck {
  session: number;
  label: string;
  /** The median height above the level's ground, metres; NaN with no samples. */
  median: number;
  spread: number;
  samples: number;
}

/** Off by less than this (metres): left as it is - a tank's origin lies on its tracks or a little above. */
export const MIN_SHIFT = 2.5;
/** Spread (p10 to p90, metres) beyond which the offset is not one number for the match: left as it is. */
export const MAX_SPREAD = 3;
/** Samples a match needs before it is judged. */
export const MIN_SAMPLES = 200;
/** Samples taken per match at most. */
const SAMPLES = 4000;
/** Cells of the height grid at most. */
const MAX_CELLS = 1 << 22;

/** The level's ground heights over an area: the mean height of the ground's corners in each cell, NaN where none lies. */
export interface HeightGrid {
  minX: number;
  minZ: number;
  cell: number;
  nx: number;
  nz: number;
  h: Float32Array;
}

/** Rows a step goes through before it yields. */
const STEP = 1 << 16;

/**
 * The height grid of a level's ground triangles (`vertices` position+normal,
 * six floats a corner) over `[minX, maxX] x [minZ, maxZ]`, cells `cell` wide or
 * wider where the area would need more than `MAX_CELLS`.
 */
export function* heightGridSteps(
  vertices: Float32Array,
  indices: Uint32Array,
  area: { minX: number; maxX: number; minZ: number; maxZ: number },
  cell: number,
): Generator<void, HeightGrid | null, void> {
  const w = area.maxX - area.minX;
  const dz = area.maxZ - area.minZ;
  if (!(w > 0) || !(dz > 0) || !indices.length) return null;
  const size = Math.max(cell, Math.sqrt((w * dz) / MAX_CELLS));
  const nx = Math.ceil(w / size) + 1;
  const nz = Math.ceil(dz / size) + 1;
  const sum = new Float64Array(nx * nz);
  const n = new Uint16Array(nx * nz);
  const seen = new Uint8Array(vertices.length / 6);
  for (let i = 0; i < indices.length; i++) {
    if ((i & (STEP - 1)) === STEP - 1) yield;
    const v = indices[i];
    if (seen[v]) continue;
    seen[v] = 1;
    const x = vertices[v * 6];
    const z = vertices[v * 6 + 2];
    const cx = Math.round((x - area.minX) / size);
    const cz = Math.round((z - area.minZ) / size);
    if (cx < 0 || cz < 0 || cx >= nx || cz >= nz) continue;
    const c = cz * nx + cx;
    if (n[c] === 65535) continue;
    sum[c] += vertices[v * 6 + 1];
    n[c]++;
  }
  const h = new Float32Array(nx * nz);
  for (let c = 0; c < h.length; c++) h[c] = n[c] ? sum[c] / n[c] : NaN;
  return { minX: area.minX, minZ: area.minZ, cell: size, nx, nz, h };
}

/** The grid's ground height at a point: its cell's, NaN outside the grid or where no corner lies in the cell. */
export function heightAt(g: HeightGrid, x: number, z: number): number {
  const cx = Math.round((x - g.minX) / g.cell);
  const cz = Math.round((z - g.minZ) / g.cell);
  if (cx < 0 || cz < 0 || cx >= g.nx || cz >= g.nz) return NaN;
  return g.h[cz * g.nx + cx];
}

/**
 * The level's drawn ground surface over an area, sampled at the middle of each
 * cell `cell` wide (or wider where the area would need more than `MAX_CELLS`):
 * the height of the ground triangle over that point, the highest where two
 * overlap; NaN where none lies. Exact on the surface the renderer draws, unlike
 * `heightGridSteps`' mean of the corners in a cell, which is what a unit is to
 * be put on: a slope's corners average to a height the triangle between them
 * does not have.
 */
export function* surfaceGridSteps(
  vertices: Float32Array,
  indices: Uint32Array,
  area: { minX: number; maxX: number; minZ: number; maxZ: number },
  cell: number,
): Generator<void, HeightGrid | null, void> {
  const w = area.maxX - area.minX;
  const dz = area.maxZ - area.minZ;
  if (!(w > 0) || !(dz > 0) || !indices.length) return null;
  const size = Math.max(cell, Math.sqrt((w * dz) / MAX_CELLS));
  const nx = Math.ceil(w / size) + 1;
  const nz = Math.ceil(dz / size) + 1;
  const h = new Float32Array(nx * nz).fill(NaN);
  for (let i = 0; i + 2 < indices.length; i += 3) {
    if ((i & (STEP - 1)) < 3) yield;
    const a = indices[i] * 6;
    const b = indices[i + 1] * 6;
    const c = indices[i + 2] * 6;
    const ax = vertices[a], ay = vertices[a + 1], az = vertices[a + 2];
    const bx = vertices[b], by = vertices[b + 1], bz = vertices[b + 2];
    const cx = vertices[c], cy = vertices[c + 1], cz = vertices[c + 2];
    const det = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz);
    if (!det) continue;
    const x0 = Math.max(0, Math.ceil((Math.min(ax, bx, cx) - area.minX) / size));
    const x1 = Math.min(nx - 1, Math.floor((Math.max(ax, bx, cx) - area.minX) / size));
    const z0 = Math.max(0, Math.ceil((Math.min(az, bz, cz) - area.minZ) / size));
    const z1 = Math.min(nz - 1, Math.floor((Math.max(az, bz, cz) - area.minZ) / size));
    for (let gz = z0; gz <= z1; gz++) {
      const z = area.minZ + gz * size;
      for (let gx = x0; gx <= x1; gx++) {
        const x = area.minX + gx * size;
        const l1 = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / det;
        const l2 = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / det;
        const l3 = 1 - l1 - l2;
        if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue;
        const y = l1 * ay + l2 * by + l3 * cy;
        const k = gz * nx + gx;
        if (!(h[k] >= y)) h[k] = y;
      }
    }
  }
  return { minX: area.minX, minZ: area.minZ, cell: size, nx, nz, h };
}

/** The surface's height at a point, between the four nearest samples; NaN where any is missing. */
export function surfaceAt(g: HeightGrid, x: number, z: number): number {
  const fx = (x - g.minX) / g.cell;
  const fz = (z - g.minZ) / g.cell;
  const x0 = Math.floor(fx);
  const z0 = Math.floor(fz);
  if (x0 < 0 || z0 < 0 || x0 + 1 >= g.nx || z0 + 1 >= g.nz) return NaN;
  const tx = fx - x0;
  const tz = fz - z0;
  const i = z0 * g.nx + x0;
  const h00 = g.h[i], h10 = g.h[i + 1], h01 = g.h[i + g.nx], h11 = g.h[i + g.nx + 1];
  return (h00 * (1 - tx) + h10 * tx) * (1 - tz) + (h01 * (1 - tx) + h11 * tx) * tz;
}

/** Metres under the ground a vehicle or ship is put back on it from: a little deeper is a unit in a tunnel or a data error, left as it is. */
export const SNAP_UNDER = 6;
/** Metres above the ground it is put down on it from: higher is a bridge, a deck or a roof, left where it is. */
export const SNAP_OVER = 2.5;

/**
 * Metres off below which a row is left as it is: a vehicle's origin a hand
 * above its tracks is not worth moving every row of a load for (a moved
 * height is a new dataset and a new upload).
 */
export const SNAP_MIN = 0.3;

/** What putting the ground units on the drawn ground did. */
export interface GroundSnap {
  /** Rows moved. */
  rows: number;
  /** The farthest a row was moved, metres. */
  most: number;
}

/**
 * The heights of `d` with its ground units' rows on the level's drawn ground
 * `g` where they were within `SNAP_UNDER` under or `SNAP_OVER` over it: a
 * vehicle sinking a metre into a slope or hovering over it because the level's
 * ground and the recording's are not the same to the metre. Rows further off
 * (a bridge, a tunnel) and every other row are left as they were. Null when
 * nothing was `SNAP_MIN` or more off.
 */
export function* snappedHeightsSteps(d: Dataset, g: HeightGrid, k: number, ground: Uint8Array): Generator<void, { py: Float32Array; snap: GroundSnap } | null, void> {
  let py: Float32Array | null = null;
  let rows = 0;
  let most = 0;
  for (let r = 0; r < d.count; r++) {
    if ((r & (STEP - 1)) === STEP - 1) yield;
    if (!d.personId || !ground[d.personId[r]]) continue;
    const h = surfaceAt(g, d.px[r], d.pz[r]);
    if (!Number.isFinite(h)) continue;
    const off = (d.py[r] - h) / k;
    if (off < -SNAP_UNDER || off > SNAP_OVER || Math.abs(off) < SNAP_MIN) continue;
    py ??= d.py.slice();
    py[r] = h;
    rows++;
    most = Math.max(most, Math.abs(off));
  }
  return py ? { py, snap: { rows, most } } : null;
}

/** Rows a session needs before its rows at height 0 say it was recorded without heights. */
export const FLAT_MIN_ROWS = MIN_SAMPLES;
/** The share of a session's rows at height 0 that says so: a few events with a place of their own may carry one. */
export const FLAT_SHARE = 0.99;
/**
 * The share at height 0 that says so when every other row's height is a whole number of metres: OCAP's original
 * layout keeps no height for people and a vehicle's height above the ground rounded to the metre (a parked car 0 or
 * 1, a helicopter 204), so a recording with many vehicles has a tenth or more of its rows off 0.
 */
export const FLAT_SHARE_WHOLE = 0.5;

/**
 * The sessions recorded without heights: (nearly) every row at height 0,
 * exactly - what a reader fills in where the file has none (OCAP recordings
 * of Arma 3 in the original layout keep east and north only) - on
 * `FLAT_MIN_ROWS` rows or more; or most rows at 0 and every other at a whole
 * number of metres (the same layout's vehicles: their height above the
 * ground). Nothing says where their units were above sea level, so those rows
 * go on the level's ground (`groundedHeightsSteps`).
 */
export function* heightlessSessionsSteps(d: Dataset): Generator<void, number[], void> {
  const sessions = d.sessionId && d.sessionLabels.length ? d.sessionLabels.length : 1;
  const zero = new Uint32Array(sessions);
  const rows = new Uint32Array(sessions);
  const fraction = new Uint32Array(sessions);
  for (let r = 0; r < d.count; r++) {
    if ((r & (STEP - 1)) === STEP - 1) yield;
    const y = d.py[r];
    if (!Number.isFinite(y)) continue;
    const s = d.sessionId ? d.sessionId[r] : 0;
    if (y === 0) zero[s]++;
    else if (y !== Math.round(y)) fraction[s]++;
    rows[s]++;
  }
  const out: number[] = [];
  for (let s = 0; s < sessions; s++)
    if (rows[s] >= FLAT_MIN_ROWS && (zero[s] >= FLAT_SHARE * rows[s] || (zero[s] >= FLAT_SHARE_WHOLE * rows[s] && fraction[s] === 0))) out.push(s);
  return out;
}

/** A session recorded without heights, put on the level's ground. */
export interface GroundedSession {
  /** Session index, -1 when the data has no sessions. */
  session: number;
  label: string;
  /** Rows put on the ground. */
  rows: number;
}

/**
 * The heights of `d` with the rows at height 0 of `sessions`
 * (`heightlessSessionsSteps`) on the level's drawn ground `g` - every unit,
 * aircraft too: the recording does not say how high anything was. In a
 * session whose other heights are all whole metres (OCAP's original layout)
 * those are heights above the ground: such a row goes that far above the
 * drawn ground (a helicopter 204 m over the hill it flies over; a rounded
 * -1 on it). Never under 0: over the sea a boat keeps its height over the sea
 * instead of sinking to the sea floor. Rows off the level, and rows with a
 * height of their own (not whole metres), stay as they were. Null when no
 * row moved.
 */
export function* groundedHeightsSteps(
  d: Dataset,
  g: HeightGrid,
  sessions: readonly number[],
): Generator<void, { py: Float32Array; grounded: GroundedSession[] } | null, void> {
  const want = new Set(sessions);
  // The sessions with a height of their own somewhere: their rows off 0 keep it.
  const own = new Set<number>();
  for (let r = 0; r < d.count; r++) {
    if ((r & (STEP - 1)) === STEP - 1) yield;
    const y = d.py[r];
    if (y !== 0 && Number.isFinite(y) && y !== Math.round(y)) own.add(d.sessionId ? d.sessionId[r] : 0);
  }
  const moved = new Map<number, number>();
  let py: Float32Array | null = null;
  for (let r = 0; r < d.count; r++) {
    if ((r & (STEP - 1)) === STEP - 1) yield;
    const s = d.sessionId ? d.sessionId[r] : 0;
    const y = d.py[r];
    if (!want.has(s) || !Number.isFinite(y) || (y !== 0 && own.has(s))) continue;
    const h = surfaceAt(g, d.px[r], d.pz[r]);
    if (!Number.isFinite(h) || !(h > 0)) continue;
    py ??= d.py.slice();
    py[r] = h + Math.max(0, y);
    moved.set(s, (moved.get(s) ?? 0) + 1);
  }
  if (!py) return null;
  const grounded = [...moved].map(([s, rows]) => ({
    session: d.sessionId ? s : -1,
    label: d.sessionId ? (d.sessionLabels[s] ?? '') : (d.name ?? ''),
    rows,
  }));
  return { py, grounded };
}

// Tacview's types are tags joined by `+`: a parachuting pilot is `Ground+Light+Human+Air+Parachutist`, in the air.
const AIR_OR_OTHER = /aircraft|airplane|plane|fighter|bomber|attacker|heli|drone|uav|jet|glider|bomb|rocket|missile|shell|projectile|effect|weapon|camera|parachut|(^|\+)air(\+|$)/i;
const DRIVES_OR_SAILS = /tank|spaa|apc|ifv|ground|vehicle|truck|car\b|artillery|atgm|howitzer|spg|armou?r|ship|boat|destroyer|cruiser|frigate|battleship|submarine|naval|carrier|corvette|barge/i;

/** Per person, 1 where its first row's `kind` (else `type`) says it drives or sails; null when the data has no such column. */
export function groundPersons(d: Dataset): Uint8Array | null {
  const col =
    d.attrs.find((a) => a.kind === 'category' && /^kind$/i.test(a.name.trim())) ?? d.attrs.find((a) => a.kind === 'category' && /^type$/i.test(a.name.trim()));
  if (!col?.categories || !d.personId) return null;
  const ground = col.categories.map((c) => (c && DRIVES_OR_SAILS.test(c) && !AIR_OR_OTHER.test(c) ? 1 : 0));
  if (!ground.includes(1)) return null;
  const ids = col.data as Uint32Array;
  const out = new Uint8Array(d.personLabels.length);
  const done = new Uint8Array(d.personLabels.length);
  for (let r = 0; r < d.count; r++) {
    const p = d.personId[r];
    if (done[p]) continue;
    done[p] = 1;
    out[p] = ground[ids[r]];
  }
  return out;
}

/** Quantile `q` (0..1) of sorted `v`. */
function quantile(v: Float64Array | number[], q: number): number {
  if (!v.length) return NaN;
  return v[Math.min(v.length - 1, Math.max(0, Math.floor(q * (v.length - 1))))];
}

/**
 * Each match's ground units against the grid: the median height above it and
 * the spread, in metres (`k` data units a metre), from up to `SAMPLES` rows
 * spread over the match.
 */
export function* groundChecksSteps(d: Dataset, g: HeightGrid, k: number, ground: Uint8Array): Generator<void, GroundCheck[], void> {
  const sessions = d.sessionId && d.sessionLabels.length ? d.sessionLabels.length : 1;
  const rows: number[][] = Array.from({ length: sessions }, () => []);
  const counts = new Uint32Array(sessions);
  for (let r = 0; r < d.count; r++) {
    if ((r & (STEP - 1)) === STEP - 1) yield;
    if (!d.personId || !ground[d.personId[r]]) continue;
    counts[d.sessionId ? d.sessionId[r] : 0]++;
  }
  const every = Array.from(counts, (c) => Math.max(1, Math.floor(c / SAMPLES)));
  const seen = new Uint32Array(sessions);
  for (let r = 0; r < d.count; r++) {
    if ((r & (STEP - 1)) === STEP - 1) yield;
    if (!d.personId || !ground[d.personId[r]]) continue;
    const s = d.sessionId ? d.sessionId[r] : 0;
    if (seen[s]++ % every[s]) continue;
    rows[s].push(r);
  }
  const out: GroundCheck[] = [];
  for (let s = 0; s < sessions; s++) {
    yield;
    const agl: number[] = [];
    for (const r of rows[s]) {
      const h = heightAt(g, d.px[r], d.pz[r]);
      if (Number.isFinite(h) && Number.isFinite(d.py[r])) agl.push((d.py[r] - h) / k);
    }
    agl.sort((a, b) => a - b);
    out.push({
      session: d.sessionId ? s : -1,
      label: d.sessionId ? (d.sessionLabels[s] ?? '') : (d.name ?? ''),
      median: quantile(agl, 0.5),
      spread: quantile(agl, 0.9) - quantile(agl, 0.1),
      samples: agl.length,
    });
  }
  return out;
}

/** The checks that say a match is off by one height: the shift to put it on the level. */
export function fixesOf(checks: readonly GroundCheck[]): GroundFix[] {
  return checks
    .filter((c) => c.samples >= MIN_SAMPLES && Math.abs(c.median) > MIN_SHIFT && c.spread < MAX_SPREAD)
    .map((c) => ({ session: c.session, label: c.label, metres: -c.median, spread: c.spread, samples: c.samples }));
}

/**
 * The heights of `d` with the fixes made: a new array, the ground units' rows
 * of each fixed match moved, every other row as it was.
 */
export function* fixedHeightsSteps(d: Dataset, fixes: readonly GroundFix[], k: number, ground: Uint8Array): Generator<void, Float32Array, void> {
  const py = d.py.slice();
  const by = new Float32Array(d.sessionId ? d.sessionLabels.length : 1);
  for (const f of fixes) by[Math.max(0, f.session)] = f.metres * k;
  for (let r = 0; r < d.count; r++) {
    if ((r & (STEP - 1)) === STEP - 1) yield;
    if (!d.personId || !ground[d.personId[r]]) continue;
    const dy = by[d.sessionId ? d.sessionId[r] : 0];
    if (dy) py[r] += dy;
  }
  return py;
}

/** Runs a generator to its end. */
export function drainSteps<T>(g: Generator<void, T, void>): T {
  for (;;) {
    const r = g.next();
    if (r.done) return r.value;
  }
}
