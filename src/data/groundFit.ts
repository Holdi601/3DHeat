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

const AIR_OR_OTHER = /aircraft|airplane|plane|fighter|bomber|attacker|heli|drone|uav|jet|glider|bomb|rocket|missile|shell|projectile|effect|weapon|camera|parachute|^air$/i;
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
