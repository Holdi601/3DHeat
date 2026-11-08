/**
 * A loaded recording made into another: some of its tracks moved in time
 * (Tacview's time shift - two flights flown on different days side by side,
 * two recordings of one fight lined up), or cut to a span of time (trim).
 *
 * The rows go back into a block and through the same builder a load uses, so
 * everything a dataset keeps about its rows - time order, each track's
 * lifetimes, the sessions' spans - is worked out afresh rather than patched.
 * The data's placement (axis mapping, place on the earth, size of a unit)
 * carries over.
 */

import { DatasetBuilder, type BlockAttr, type SourceBlock } from './builder';
import { say } from './msg';
import type { Dataset } from '../state/types';

/** What a reshaped dataset was made from, for undoing and showing it. */
export interface Reshape {
  /** The dataset as loaded. */
  original: Dataset;
  /** Seconds each shifted group was moved, by its name (a unit's key or a recording's label). */
  shifts: Record<string, number>;
  /** The span kept, in the file's own seconds (`sourceSeconds`), after the shifts; null when nothing was cut. */
  trim: [number, number] | null;
}

const made = new WeakMap<Dataset, Reshape>();

/** How a dataset was reshaped; null for one as loaded. */
export function reshapeOf(d: Dataset): Reshape | null {
  return made.get(d) ?? null;
}

/** A row's time as the file had it: seconds from the epoch when there is one, else from the file's own zero. */
export function sourceSeconds(d: Dataset, t: number): number {
  return d.epochMs !== null ? d.epochMs / 1000 + t : (d.timeOrigin ?? 0) + t;
}

/**
 * The rows `keep` (ascending) of a dataset as a new one, each row's time
 * moved by `shift(row)` seconds.
 */
export function rebuild(d: Dataset, keep: Uint32Array | null, shift: ((row: number) => number) | null): Dataset {
  const rows = keep ?? Uint32Array.from({ length: d.count }, (_, i) => i);
  const n = rows.length;
  const f32 = (src: Float32Array) => {
    const out = new Float32Array(n);
    for (let k = 0; k < n; k++) out[k] = src[rows[k]];
    return out;
  };
  const u32 = (src: ArrayLike<number>) => {
    const out = new Uint32Array(n);
    for (let k = 0; k < n; k++) out[k] = src[rows[k]];
    return out;
  };
  let time: Float64Array | null = null;
  if (d.time) {
    time = new Float64Array(n);
    for (let k = 0; k < n; k++) {
      const r = rows[k];
      time[k] = sourceSeconds(d, d.time[r]) + (shift ? shift(r) : 0);
    }
  }
  const attrs: BlockAttr[] = d.attrs.map((a) =>
    a.kind === 'number'
      ? { name: a.name, kind: 'number', data: f32(a.data as Float32Array) }
      : { name: a.name, kind: 'category', data: u32(a.data as Uint32Array), categories: a.categories ?? [] },
  );
  const block: SourceBlock = {
    rows: n,
    px: f32(d.px),
    py: f32(d.py),
    pz: f32(d.pz),
    time,
    timeIsAbsolute: d.epochMs !== null,
    yaw: d.yaw ? f32(d.yaw) : null,
    pitch: d.pitch ? f32(d.pitch) : null,
    personIds: d.personId ? u32(d.personId) : null,
    personLabels: d.personLabels,
    teamIds: d.teamId ? u32(d.teamId) : null,
    teamLabels: d.teamLabels,
    sessionIds: d.sessionId ? u32(d.sessionId) : null,
    sessionLabels: d.sessionLabels,
    attrs,
    rejected: 0,
  };
  const b = new DatasetBuilder(n);
  b.append(block);
  const out = b.finish(d.said ? say(d.said.name) : d.name);
  out.axes = d.axes;
  out.geo = d.geo;
  out.entitySize = d.entitySize;
  out.roleColumns = d.roleColumns;
  out.said = d.said;
  return out;
}

/** The dataset as loaded, and what has been done to it so far. */
function base(d: Dataset): Reshape {
  return made.get(d) ?? { original: d, shifts: {}, trim: null };
}

/** The rows of `group` in a dataset: a unit's tracks (persons) or a recording's (session) rows. */
export interface ShiftGroup {
  /** Shown and remembered by this: a unit's key, a recording's label. */
  name: string;
  persons?: number[];
  session?: number;
}

/** Rows a group names, of the dataset as loaded. */
function inGroup(d: Dataset, g: ShiftGroup): (row: number) => boolean {
  if (g.persons) {
    const set = new Set(g.persons);
    return (row) => !!d.personId && set.has(d.personId[row]);
  }
  if (g.session !== undefined) return (row) => !!d.sessionId && d.sessionId[row] === g.session;
  return () => false;
}

/**
 * The recording with each group moved to its shift in seconds (replacing any
 * earlier shift of that group), the trim kept. Groups are of the dataset as
 * loaded: persons and sessions by its numbering. `trim` is in the file's own
 * seconds (`sourceSeconds`), which do not change with a reshape.
 */
export function applyReshape(d: Dataset, groups: ShiftGroup[], shifts: Record<string, number>, trim: [number, number] | null): Dataset {
  const was = base(d);
  const o = was.original;
  const tests = groups.filter((g) => shifts[g.name]).map((g) => ({ test: inGroup(o, g), s: shifts[g.name] }));
  const shift = tests.length
    ? (row: number) => {
        for (const x of tests) if (x.test(row)) return x.s;
        return 0;
      }
    : null;
  let keep: Uint32Array | null = null;
  if (trim && o.time) {
    const list: number[] = [];
    for (let r = 0; r < o.count; r++) {
      // Trimmed on the time the row is shown at: after its shift.
      const t = sourceSeconds(o, o.time[r]) + (shift ? shift(r) : 0);
      if (t >= trim[0] && t <= trim[1]) list.push(r);
    }
    keep = Uint32Array.from(list);
  }
  if (!tests.length && !keep) return o;
  if (keep && keep.length === 0) return d;
  const out = rebuild(o, keep, shift);
  const kept: Record<string, number> = {};
  for (const g of groups) if (shifts[g.name]) kept[g.name] = shifts[g.name];
  made.set(out, { original: o, shifts: kept, trim });
  return out;
}

/**
 * Shifts that line recordings up: each session's start onto the first's.
 * Seconds per session label.
 */
export function alignStarts(d: Dataset): Record<string, number> {
  const o = base(d).original;
  const out: Record<string, number> = {};
  if (!o.sessionStart || o.sessionLabels.length < 2) return out;
  const first = Math.min(...Array.from(o.sessionStart));
  o.sessionLabels.forEach((label, i) => {
    const s = first - o.sessionStart![i];
    if (Math.abs(s) > 1e-6) out[label] = s;
  });
  return out;
}
