/**
 * The lean overlay's work on one piece of a file (a job: a run of rows, most
 * often one row group), in two passes over the same rows.
 *
 * Pass 1 reads where everything is and when, and counts: per unit (one
 * tracked thing of one match - a "track" value within a "match" value) its
 * samples, the box and time span they lie in, how many keys it would keep at
 * each tolerance of `KEY_LEVELS`, the rows it spans in the file, and what it
 * is (its first own row's name and type columns); per match its first time;
 * and every death, as a marker.
 *
 * Pass 2 reads the same rows again, with the attitude, and writes each unit's
 * kept samples straight as GPU keys (`gpuTracks/store.ts`): x, y, z and t in
 * 16 bits of the span of each `CHUNK_KEYS` keys of its run, and the attitude
 * as four signed bytes. Nothing in between is kept but the rows of the chunk
 * each unit is in: no dataset, no copy of a column.
 *
 * A sample that only holds a moving unit's last position (a late update) is
 * not its own position in either pass (`gpuTracks/store.ts`, `heldSamples`).
 *
 * Which samples are kept is decided while streaming, by the test
 * `gpuTracks/store.ts` uses: a sample is left out while the last kept key,
 * moved on at its velocity, comes within the tolerance of it (and is less
 * than `MAX_GAP` seconds back); the velocity at a kept key is the three-point
 * estimate from its raw neighbours; the last sample is always kept; a sample
 * within a millisecond of the last kept one is a double. Both passes run the
 * same code on the same values, so pass 2 keeps exactly what pass 1 counted -
 * which is what lets the keys be laid out before they are written.
 *
 * Pure functions over decoded columns: the workers decode, these count and
 * encode, the tests call them directly.
 */


import { CHUNK_KEYS, CHUNK_SHIFT, CHUNK_U32, encodeChunk } from '../../render/gpuTracks/chunks';

/** Tolerances, metres: 0 keeps every sample (doubles aside); the rest thin the tracks when they would not fit. */
export const KEY_LEVELS = [0, 0.25, 0.5, 1, 2, 5, 10, 25] as const;
/** Most seconds between two keys when samples are left out. */
export const MAX_GAP = 4;
/** 16-bit steps a coordinate or the time spans within a track. */
export const STEPS = 65535;
/** Two samples closer than this in time are one. */
const DOUBLE = 1e-3;
/**
 * A coordinate past this is a recorder's garbage, not a place (a million
 * kilometres in metres; DCS writes the odd missile at 1e20 m): such a sample
 * is no position, so it neither stretches the bounds nor ruins its track's keys.
 */
const FAR = 1e9;

function placed(x: number, y: number, z: number): boolean {
  return Math.abs(x) < FAR && Math.abs(y) < FAR && Math.abs(z) < FAR;
}

/** Event labels whose rows are positions of the thing itself (as `figures/motion.ts`). */
const POSITION_EVENT = /^(position|pos|move|moved|sample|state|tick|update|spawn|spawned|alive)?$/i;
const POSITION_LIKE = /^(position|pos|move|sample|state|tick)$/i;
/** Event labels whose rows are somewhere else: what was fired, where it struck. */
const ELSEWHERE_EVENT = /^(shot|shots|tracer|impact|impacts|torpedo|explosion|flak|projectile|bullet|shell|weapon_fire|fire|fired)$/i;
/** Event labels of a thing's end: where it died is a marker. */
const DEATH_EVENT = /^(death|dead|died|killed|destroyed)$/i;

export interface LeanAxes {
  up: 'y' | 'z';
  flipX: boolean;
  flipY: boolean;
  flipZ: boolean;
  scale: number;
}

/** Which columns play which part, and how to read them: the same for every job of a load. */
export interface LeanSpec {
  time: string;
  /** Seconds a unit of the time column is. */
  timeScale: number;
  x: string;
  y: string | null;
  z: string | null;
  axes: LeanAxes;
  /** What one tracked thing is (a life, a track id); rows with it empty are no unit's. */
  track: string;
  /** Which match a row is of; null: the file is one. */
  match: string | null;
  event: string | null;
  team: string | null;
  look: 'vector' | 'yawPitch' | 'none';
  dirX: string | null;
  dirY: string | null;
  dirZ: string | null;
  yaw: string | null;
  pitch: string | null;
  /** Radians a unit of the yaw and pitch columns is. */
  angleScale: number;
  /** Degrees, right wing down; null for none. */
  roll: string | null;
  /** Columns that say what a unit is and whose it is, read at its first own row. */
  meta: string[];
  /** Data units a metre. */
  units: number;
}

export type Columns = Record<string, ArrayLike<unknown> | undefined>;

/** The columns pass 1 or pass 2 reads. */
export function specColumns(s: LeanSpec, pass: 1 | 2): string[] {
  const c = [s.time, s.x, s.y, s.z, s.track, s.match, s.event];
  if (pass === 1) c.push(s.team, ...s.meta);
  else if (s.look === 'vector') c.push(s.dirX, s.dirY, s.dirZ, s.roll);
  else if (s.look === 'yawPitch') c.push(s.yaw, s.pitch, s.roll);
  return [...new Set(c.filter((x): x is string => !!x))];
}

function toNum(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'bigint') return Number(v);
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string' && v !== '') return Number(v);
  return NaN;
}

function toText(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

/** A numeric column as numbers, typed arrays as they are. */
function numbers(a: ArrayLike<unknown> | undefined, n: number): ArrayLike<number> | null {
  if (!a) return null;
  if (ArrayBuffer.isView(a) && !(a instanceof BigInt64Array) && !(a instanceof BigUint64Array)) return a as unknown as ArrayLike<number>;
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) out[i] = toNum(a[i]);
  return out;
}

/** The rows of a job in the form both passes work from: world positions, seconds, units and own rows. */
export interface Prepared {
  n: number;
  t: Float64Array;
  x: Float64Array;
  y: Float64Array;
  z: Float64Array;
  /** Local unit of each row, -1 for none. */
  unit: Int32Array;
  /** Local match of each row, -1 when its time is unknown. */
  group: Int32Array;
  /** 1: the row is a position of its unit's own (finite, in time). */
  own: Uint8Array;
  /** 1: the row is a death. */
  death: Uint8Array;
  units: number;
  track: string[];
  match: string[];
  groups: string[];
}

/**
 * Units, matches, positions and times of a job's rows. Units are numbered in
 * the order their first row comes, so both passes number them alike.
 */
export function prepare(cols: Columns, n: number, s: LeanSpec): Prepared {
  const tc = numbers(cols[s.time], n);
  const xc = numbers(cols[s.x], n);
  const yc = s.y ? numbers(cols[s.y], n) : null;
  const zc = s.z ? numbers(cols[s.z], n) : null;
  const tr = cols[s.track];
  const mc = s.match ? cols[s.match] : undefined;
  const ev = s.event ? cols[s.event] : undefined;
  const t = new Float64Array(n);
  const x = new Float64Array(n);
  const y = new Float64Array(n);
  const z = new Float64Array(n);
  const unit = new Int32Array(n).fill(-1);
  const group = new Int32Array(n).fill(-1);
  const own = new Uint8Array(n);
  const death = new Uint8Array(n);
  const sc = s.axes.scale || 1;
  const fx = (s.axes.flipX ? -1 : 1) * sc;
  const fy = (s.axes.flipY ? -1 : 1) * sc;
  const fz = (s.axes.flipZ ? -1 : 1) * sc;
  const zUp = s.axes.up === 'z';
  // Own rows by the event column: its position rows when it has them, else whatever was not fired.
  let ownOf: (label: string) => boolean = () => true;
  const deathOf = new Map<string, boolean>();
  if (ev) {
    const labels = new Set<string>();
    for (let i = 0; i < n; i++) labels.add(toText(ev[i]).trim());
    const positions = [...labels].some((l) => POSITION_LIKE.test(l));
    const memo = new Map<string, boolean>();
    for (const l of labels) {
      memo.set(l, positions ? POSITION_EVENT.test(l) : !ELSEWHERE_EVENT.test(l));
      deathOf.set(l, DEATH_EVENT.test(l));
    }
    ownOf = (l) => memo.get(l) ?? false;
  }
  const groups: string[] = [];
  const groupIdx = new Map<string, number>();
  const track: string[] = [];
  const match: string[] = [];
  const perGroup: Map<string, number>[] = [];
  let lastM: unknown = undefined;
  let lastG = -1;
  for (let i = 0; i < n; i++) {
    const tv = tc ? tc[i] * s.timeScale : NaN;
    t[i] = tv;
    if (!Number.isFinite(tv)) continue;
    const mv = mc ? mc[i] : '';
    if (mv !== lastM || lastG < 0) {
      const m = toText(mv);
      let g = groupIdx.get(m);
      if (g === undefined) {
        g = groups.length;
        groups.push(m);
        groupIdx.set(m, g);
        perGroup.push(new Map());
      }
      lastM = mv;
      lastG = g;
    }
    group[i] = lastG;
    const rx = xc ? xc[i] : NaN;
    const ry = yc ? yc[i] : 0;
    const rz = zc ? zc[i] : 0;
    x[i] = rx * fx;
    if (zUp) {
      y[i] = rz * fz;
      z[i] = ry * fy;
    } else {
      y[i] = ry * fy;
      z[i] = rz * fz;
    }
    const e = ev ? toText(ev[i]).trim() : '';
    if (ev && deathOf.get(e)) death[i] = 1;
    const k = tr ? toText(tr[i]) : '';
    if (k === '') continue;
    const units = perGroup[lastG];
    let u = units.get(k);
    if (u === undefined) {
      u = track.length;
      track.push(k);
      match.push(groups[lastG]);
      units.set(k, u);
    }
    unit[i] = u;
    if (ownOf(e) && placed(x[i], y[i], z[i])) own[i] = 1;
  }
  return { n, t, x, y, z, unit, group, own, death, units: track.length, track, match, groups };
}

/**
 * The streaming thinner: per unit and tolerance level, the last kept row, the
 * row before it (while its velocity waits for the row after), the velocity at
 * it, and the last row left out by the tolerance (kept if nothing follows).
 */
class Thinner {
  readonly kept: Int32Array;
  readonly before: Int32Array;
  readonly skipped: Int32Array;
  readonly v: Float64Array;
  readonly count: Uint32Array;
  readonly prev: Int32Array;
  private readonly tol: Float64Array;

  constructor(
    readonly units: number,
    readonly levels: number[],
    unitsPerMetre: number,
    private readonly p: Prepared,
  ) {
    const L = levels.length;
    this.kept = new Int32Array(units * L).fill(-1);
    this.before = new Int32Array(units * L).fill(-1);
    this.skipped = new Int32Array(units * L).fill(-1);
    this.v = new Float64Array(units * L * 3);
    this.count = new Uint32Array(units * L);
    this.prev = new Int32Array(units).fill(-1);
    this.tol = Float64Array.from(levels, (l) => KEY_LEVELS[l] * unitsPerMetre);
  }

  /** Row `i` of unit `u` comes; `keep(u, l, i)` for each level that keeps it. */
  push(u: number, i: number, keep: (u: number, l: number, i: number) => void): void {
    const { t, x, y, z } = this.p;
    const L = this.levels.length;
    const prev = this.prev[u];
    for (let l = 0; l < L; l++) {
      const s = u * L + l;
      const k = this.kept[s];
      if (k >= 0) {
        // The kept row's velocity waited for this one: its three-point estimate.
        const b = this.before[s];
        if (b >= 0) {
          const h = t[i] - t[b];
          const o = s * 3;
          if (h > 1e-6) {
            this.v[o] = (x[i] - x[b]) / h;
            this.v[o + 1] = (y[i] - y[b]) / h;
            this.v[o + 2] = (z[i] - z[b]) / h;
          } else this.v[o] = this.v[o + 1] = this.v[o + 2] = 0;
          this.before[s] = -1;
        }
        const dt = t[i] - t[k];
        if (dt < DOUBLE) {
          this.skipped[s] = -1;
          continue;
        }
        const tol = this.tol[l];
        if (tol > 0 && dt < MAX_GAP) {
          const o = s * 3;
          const ex = x[i] - (x[k] + this.v[o] * dt);
          const ey = y[i] - (y[k] + this.v[o + 1] * dt);
          const ez = z[i] - (z[k] + this.v[o + 2] * dt);
          if (ex * ex + ey * ey + ez * ez <= tol * tol) {
            this.skipped[s] = i;
            continue;
          }
        }
      }
      this.kept[s] = i;
      this.before[s] = prev >= 0 ? prev : i;
      this.skipped[s] = -1;
      this.count[s]++;
      keep(u, l, i);
    }
    this.prev[u] = i;
  }

  /** The end of the job: a unit's last row, left out by the tolerance, is kept after all. */
  finish(keep: (u: number, l: number, i: number) => void): void {
    const L = this.levels.length;
    for (let u = 0; u < this.units; u++) {
      for (let l = 0; l < L; l++) {
        const s = u * L + l;
        const i = this.skipped[s];
        if (i < 0) continue;
        this.skipped[s] = -1;
        this.count[s]++;
        keep(u, l, i);
      }
    }
  }
}

/** A death: where and when, which match, whose team. */
export interface Markers {
  count: number;
  /** x, y, z a marker. */
  pos: Float32Array;
  /** Seconds, as in the file (times the time scale). */
  t: Float64Array;
  /** Local match. */
  group: Uint32Array;
  /** Team label of the one who died ('' unknown). */
  team: string[];
}

export interface Pass1Result {
  rows: number;
  units: number;
  track: string[];
  match: string[];
  /** File rows a unit's rows span: first and last, from the job's first row `rowBase`. */
  firstRow: Float64Array;
  lastRow: Float64Array;
  /** Own samples. */
  samples: Uint32Array;
  /** Per unit: min x, y, z, max x, y, z, first and last time of its own samples. */
  box: Float64Array;
  /** Per unit: the time of its first death row, Infinity for none (a wreck from then on, `data/deaths.ts`). */
  death: Float64Array;
  /** Per unit and level of `levels`, keys kept. */
  keys: Uint32Array;
  levels: number[];
  /** Per meta column, per unit: its value at the unit's first own row. */
  meta: string[][];
  /** Team label per unit, at its first own row. */
  team: string[];
  groups: string[];
  /** Per match: the first time of any of its rows, and its rows. */
  groupStart: Float64Array;
  groupRows: Uint32Array;
  markers: Markers;
}

export const BOX = 8;

/**
 * Own samples that only hold a moving unit's last position no longer own: a
 * run at one place under `MAX_GAP` seconds, the unit moving into it at a
 * metre a second or more and out of it at about that speed over the whole
 * run, its first sample kept. Both passes alike.
 */
function dropHeld(p: Prepared, unitsPerMetre: number): void {
  const { t, x, y, z, unit, own, n } = p;
  const U = p.units;
  const last = new Int32Array(U).fill(-1);
  const from = new Int32Array(U).fill(-1);
  const pre = new Int32Array(U).fill(-1);
  const next = new Int32Array(n).fill(-1);
  const dist = (a: number, b: number) => Math.hypot(x[b] - x[a], y[b] - y[a], z[b] - z[a]);
  for (let i = 0; i < n; i++) {
    const u = unit[i];
    if (u < 0 || !own[i]) continue;
    const l = last[u];
    if (l >= 0 && t[i] < t[l]) continue;
    if (l >= 0 && x[i] === x[l] && y[i] === y[l] && z[i] === z[l]) {
      next[l] = i;
      last[u] = i;
      continue;
    }
    const f = from[u];
    const b = pre[u];
    if (f >= 0 && l !== f && b >= 0 && t[i] - t[f] < MAX_GAP) {
      const vIn = dist(b, f) / Math.max(1e-3, t[f] - t[b]);
      const vOut = dist(l, i) / Math.max(1e-3, t[i] - t[f]);
      if (vIn > unitsPerMetre && Math.abs(vOut - vIn) < 0.3 * vIn) for (let j = next[f]; j >= 0; j = next[j]) own[j] = 0;
    }
    pre[u] = l;
    from[u] = i;
    last[u] = i;
  }
}

/** Pass 1 of a job: counts, spans, keys at each level, what each unit is, deaths. */
export function scanPass1(cols: Columns, n: number, s: LeanSpec, rowBase: number, levels: number[]): Pass1Result {
  const p = prepare(cols, n, s);
  dropHeld(p, s.units);
  const U = p.units;
  const box = new Float64Array(U * BOX);
  for (let u = 0; u < U; u++) {
    box.fill(Infinity, u * BOX, u * BOX + 3);
    box.fill(-Infinity, u * BOX + 3, u * BOX + 6);
    box[u * BOX + 6] = Infinity;
    box[u * BOX + 7] = -Infinity;
  }
  const firstRow = new Float64Array(U).fill(-1);
  const lastRow = new Float64Array(U).fill(-1);
  const death = new Float64Array(U).fill(Infinity);
  const firstOwn = new Int32Array(U).fill(-1);
  const samples = new Uint32Array(U);
  const G = p.groups.length;
  const groupStart = new Float64Array(G).fill(Infinity);
  const groupRows = new Uint32Array(G);
  const th = new Thinner(U, levels, s.units, p);
  const none = () => {};
  const mPos: number[] = [];
  const mT: number[] = [];
  const mG: number[] = [];
  const mRow: number[] = [];
  const { t, x, y, z } = p;
  for (let i = 0; i < n; i++) {
    const g = p.group[i];
    if (g < 0) continue;
    groupRows[g]++;
    if (t[i] < groupStart[g]) groupStart[g] = t[i];
    if (p.death[i] && placed(x[i], y[i], z[i])) {
      mPos.push(x[i], y[i], z[i]);
      mT.push(t[i]);
      mG.push(g);
      mRow.push(i);
    }
    const u = p.unit[i];
    if (u < 0) continue;
    if (firstRow[u] < 0) firstRow[u] = rowBase + i;
    lastRow[u] = rowBase + i;
    if (p.death[i] && t[i] < death[u]) death[u] = t[i];
    if (!p.own[i]) continue;
    // Out of time order within the job: left out, so a track's keys only go forwards.
    const pr = th.prev[u];
    if (pr >= 0 && t[i] < t[pr]) continue;
    if (firstOwn[u] < 0) firstOwn[u] = i;
    samples[u]++;
    const o = u * BOX;
    if (x[i] < box[o]) box[o] = x[i];
    if (y[i] < box[o + 1]) box[o + 1] = y[i];
    if (z[i] < box[o + 2]) box[o + 2] = z[i];
    if (x[i] > box[o + 3]) box[o + 3] = x[i];
    if (y[i] > box[o + 4]) box[o + 4] = y[i];
    if (z[i] > box[o + 5]) box[o + 5] = z[i];
    if (t[i] < box[o + 6]) box[o + 6] = t[i];
    if (t[i] > box[o + 7]) box[o + 7] = t[i];
    th.push(u, i, none);
  }
  th.finish(none);
  const text = (name: string | null, row: number) => {
    const c = name ? cols[name] : undefined;
    return c && row >= 0 ? toText(c[row]) : '';
  };
  const meta = s.meta.map((m) => Array.from(firstOwn, (r) => text(m, r)));
  const team = Array.from(firstOwn, (r) => text(s.team, r));
  // A death's team: the row's own team column.
  const markerTeam = mRow.map((r) => text(s.team, r));
  return {
    rows: n,
    units: U,
    track: p.track,
    match: p.match,
    firstRow,
    lastRow,
    samples,
    box,
    death,
    keys: th.count,
    levels: [...levels],
    meta,
    team,
    groups: p.groups,
    groupStart,
    groupRows,
    markers: { count: mT.length, pos: Float32Array.from(mPos), t: Float64Array.from(mT), group: Uint32Array.from(mG), team: markerTeam },
  };
}

/** Per local unit of a job: its span (x0, y0, z0, position step, first time in file seconds, time step). */
export const SPAN = 6;

export interface Pass2Result {
  /** Per local unit, where its run starts in `keysA`/`keysB` (keys), and how many it wrote. */
  offset: Uint32Array;
  used: Uint32Array;
  /** Two a key: x | y << 16, z | t << 16, in 16 bits of the span of its chunk of the run. */
  keysA: Uint32Array;
  /** The chunk spans, `CHUNK_U32` each (`gpuTracks/chunks.ts`), times from the unit's base; per unit, its first. */
  spans: Float32Array;
  chunkOff: Uint32Array;
  /** One a key: the attitude, snorm8 x4; empty without one. */
  keysB: Uint32Array;
}

/**
 * The attitude of a heading, pitch and roll as x y z w: `figures/kit`'s
 * `poseFrame` then `figures/motion`'s `quatOfFrame`, worked through without
 * the arrays (pass 2 does it for every key).
 */
export function quatOfAttitude(yaw: number, pitch: number, roll: number, out: number[]): void {
  const s = Math.sin(yaw), c = Math.cos(yaw);
  // Heading: forward, right, up.
  let fx = s, fy = 0, fz = c;
  const rx0 = -c, ry0 = 0, rz0 = s;
  let ux = 0, uy = 1, uz = 0;
  if (pitch) {
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const f2x = fx * cp + ux * sp, f2y = fy * cp + uy * sp, f2z = fz * cp + uz * sp;
    ux = ux * cp - fx * sp;
    uy = uy * cp - fy * sp;
    uz = uz * cp - fz * sp;
    fx = f2x;
    fy = f2y;
    fz = f2z;
  }
  let rx = rx0, ry = ry0, rz = rz0;
  if (roll) {
    const cr = Math.cos(roll), sr = Math.sin(roll);
    rx = rx0 * cr - ux * sr;
    ry = ry0 * cr - uy * sr;
    rz = rz0 * cr - uz * sr;
    const u2x = ux * cr + rx0 * sr, u2y = uy * cr + ry0 * sr, u2z = uz * cr + rz0 * sr;
    ux = u2x;
    uy = u2y;
    uz = u2z;
  }
  // Columns: local x -> f, local y -> u, local z -> r.
  const m00 = fx, m01 = ux, m02 = rx;
  const m10 = fy, m11 = uy, m12 = ry;
  const m20 = fz, m21 = uz, m22 = rz;
  const tr = m00 + m11 + m22;
  if (tr > 0) {
    const k = Math.sqrt(tr + 1) * 2;
    out[3] = 0.25 * k;
    out[0] = (m21 - m12) / k;
    out[1] = (m02 - m20) / k;
    out[2] = (m10 - m01) / k;
  } else if (m00 > m11 && m00 > m22) {
    const k = Math.sqrt(1 + m00 - m11 - m22) * 2;
    out[3] = (m21 - m12) / k;
    out[0] = 0.25 * k;
    out[1] = (m01 + m10) / k;
    out[2] = (m02 + m20) / k;
  } else if (m11 > m22) {
    const k = Math.sqrt(1 + m11 - m00 - m22) * 2;
    out[3] = (m02 - m20) / k;
    out[0] = (m01 + m10) / k;
    out[1] = 0.25 * k;
    out[2] = (m12 + m21) / k;
  } else {
    const k = Math.sqrt(1 + m22 - m00 - m11) * 2;
    out[3] = (m10 - m01) / k;
    out[0] = (m02 + m20) / k;
    out[1] = (m12 + m21) / k;
    out[2] = 0.25 * k;
  }
}

function packQuat(q: ArrayLike<number>): number {
  const b = (v: number) => (Math.round(Math.max(-1, Math.min(1, v)) * 127) & 0xff) >>> 0;
  return (b(q[0]) | (b(q[1]) << 8) | (b(q[2]) << 16) | (b(q[3]) << 24)) >>> 0;
}

const s8 = (v: number) => ((v & 0xff) << 24) >> 24;

/**
 * Pass 2 of a job: each unit's kept rows as keys, a span each `CHUNK_KEYS`
 * of its run, at tolerance level `level` (an index into `KEY_LEVELS`), times
 * from each unit's `base` (seconds of the file). `alloc` is what pass 1
 * counted at that level for each unit: the room its run is given.
 */
export function scanPass2(cols: Columns, n: number, s: LeanSpec, base: Float64Array, alloc: Uint32Array, level: number): Pass2Result {
  const p = prepare(cols, n, s);
  dropHeld(p, s.units);
  const U = p.units;
  if (alloc.length !== U) throw new Error(`lean overlay: pass 2 saw ${U} units where pass 1 saw ${alloc.length}`);
  const offset = new Uint32Array(U + 1);
  const chunkOff = new Uint32Array(U + 1);
  for (let u = 0; u < U; u++) {
    offset[u + 1] = offset[u] + alloc[u];
    chunkOff[u + 1] = chunkOff[u] + Math.ceil(alloc[u] / CHUNK_KEYS);
  }
  const total = offset[U];
  const keysA = new Uint32Array(total * 2);
  const spans = new Float32Array(chunkOff[U] * CHUNK_U32);
  const attitude = s.look !== 'none';
  const keysB = new Uint32Array(attitude ? total : 0);
  const used = new Uint32Array(U);
  // The rows of the chunk each unit is filling, and a chunk's keys as numbers.
  const pend = new Int32Array(U * CHUNK_KEYS);
  const buf = new Float64Array(CHUNK_KEYS * 4);
  // The attitude: yaw and pitch (radians, as the generic loader reads them) and roll (degrees).
  let yawAt: ((i: number) => number) | null = null;
  let pitchAt: (i: number) => number = () => 0;
  if (s.look === 'vector') {
    const dx = numbers(cols[s.dirX!], n);
    const dy = numbers(cols[s.dirY!], n);
    const dz = numbers(cols[s.dirZ!], n);
    if (dx && dy && dz) {
      const fx = s.axes.flipX ? -1 : 1;
      const fy = s.axes.flipY ? -1 : 1;
      const fz = s.axes.flipZ ? -1 : 1;
      const zUp = s.axes.up === 'z';
      const w = (i: number): [number, number, number] => [
        (dx[i] || 0) * fx,
        zUp ? (dz[i] || 0) * fz : (dy[i] || 0) * fy,
        zUp ? (dy[i] || 0) * fy : (dz[i] || 0) * fz,
      ];
      yawAt = (i) => {
        const [wx, , wz] = w(i);
        return Math.fround(Math.atan2(wx, -wz));
      };
      pitchAt = (i) => {
        const [wx, wy, wz] = w(i);
        return Math.fround(Math.atan2(wy, Math.hypot(wx, wz)));
      };
    }
  } else if (s.look === 'yawPitch') {
    const yc = numbers(cols[s.yaw!], n);
    const pc = s.pitch ? numbers(cols[s.pitch], n) : null;
    if (yc) {
      yawAt = (i) => Math.fround((yc[i] || 0) * s.angleScale);
      if (pc) pitchAt = (i) => Math.fround((pc[i] || 0) * s.angleScale);
    }
  }
  const roll = s.roll ? numbers(cols[s.roll], n) : null;
  const q = [0, 0, 0, 1];
  const { t, x, y, z } = p;
  /** Unit `u`'s chunk that ends before its key `end` (from its run's start): written. */
  const flush = (u: number, end: number) => {
    const c0 = ((end - 1) >> CHUNK_SHIFT) << CHUNK_SHIFT;
    const m = end - c0;
    for (let k = 0; k < m; k++) {
      const i = pend[u * CHUNK_KEYS + k];
      buf[k * 4] = x[i];
      buf[k * 4 + 1] = y[i];
      buf[k * 4 + 2] = z[i];
      buf[k * 4 + 3] = t[i] - base[u];
    }
    encodeChunk(buf, m, keysA, offset[u] + c0, spans, (chunkOff[u] + (c0 >> CHUNK_SHIFT)) * CHUNK_U32);
  };
  const emit = (u: number, _l: number, i: number) => {
    if (used[u] >= alloc[u]) return;
    const k = used[u]++;
    const key = offset[u] + k;
    pend[u * CHUNK_KEYS + (k & (CHUNK_KEYS - 1))] = i;
    if (((k + 1) & (CHUNK_KEYS - 1)) === 0) flush(u, k + 1);
    if (!attitude) return;
    if (yawAt) {
      const rv = roll ? Math.fround(roll[i]) : NaN;
      const rl = (rv * Math.PI) / 180;
      quatOfAttitude(Math.PI - yawAt(i), pitchAt(i) || 0, Number.isFinite(rl) ? rl : 0, q);
    } else {
      q[0] = q[1] = q[2] = 0;
      q[3] = 1;
    }
    // The same hemisphere as the key before, so a slerp takes the short arc.
    if (used[u] > 1) {
      const pb = keysB[key - 1];
      if (s8(pb) * q[0] + s8(pb >>> 8) * q[1] + s8(pb >>> 16) * q[2] + s8(pb >>> 24) * q[3] < 0) for (let c = 0; c < 4; c++) q[c] = -q[c];
    }
    keysB[key] = packQuat(q);
  };
  const th = new Thinner(U, [level], s.units, p);
  for (let i = 0; i < n; i++) {
    const u = p.unit[i];
    if (u < 0 || !p.own[i]) continue;
    const pr = th.prev[u];
    if (pr >= 0 && t[i] < t[pr]) continue;
    th.push(u, i, emit);
  }
  th.finish(emit);
  for (let u = 0; u < U; u++) if (used[u] & (CHUNK_KEYS - 1)) flush(u, used[u]);
  return { offset, used, keysA, keysB, spans, chunkOff };
}
