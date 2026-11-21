/**
 * What a note is about, kept by stable keys - never by an index into this
 * load's arrays alone - so a note made today finds its thing again when the
 * same data is loaded tomorrow, and says so when it does not:
 *
 *   data       the data's fingerprint (`dataKey`: its size, extent, time span
 *              and a sample of its rows) and its name
 *   row        that fingerprint, the row, and the row's own signature (who,
 *              which match, when, where): a row index that no longer carries
 *              the signature is looked for by it
 *   event      the same, with the event's kind
 *   unit       the unit's key (`ui/replay/units.ts`: the player column's value),
 *              and its name as a fallback
 *   match      the match's id (the match column's value or the session label)
 *   round      the round's session label
 *   time       a time range, with the match it is in by label
 *   place      a world point, or a volume (its id, and its shape kept)
 *   heat       a heat spot: the point, and the pick card's numbers as they were
 *   insight    a finding's id (stable for the same data and scope), with its words and place kept
 *   view       a saved view: its id, and the view itself kept
 *   plan       a tactics plan: its title, and the plan itself kept
 *
 * `resolveAnchor` says where an anchor is on the loaded data - a point, a
 * time, a unit, a match - or why it is not there.
 */

import type { Dataset } from '../state/types';
import { eventRows } from '../ui/replay/replayData';
import { unitsOf } from '../ui/replay/units';
import { matchesOf } from '../match/matches';
import type { Volume } from '../volumes/volume';
import { personRows } from '../data/flight';

export type Vec3 = { x: number; y: number; z: number };

/** The data an anchor was made on. */
export interface DataRef {
  key: string;
  name: string;
}

/** A row as it reads, to find it again when its index moved. */
export interface RowSig {
  person: string | null;
  session: string | null;
  t: number | null;
  x: number;
  y: number;
  z: number;
}

export type Anchor =
  | { kind: 'data'; data: DataRef }
  | { kind: 'row'; data: DataRef; row: number; sig: RowSig }
  | { kind: 'event'; data: DataRef; row: number; sig: RowSig; event: string }
  | { kind: 'unit'; data?: DataRef; key: string; name: string; t?: number | null }
  | { kind: 'match'; data?: DataRef; id: string }
  | { kind: 'round'; data?: DataRef; session: string }
  | { kind: 'time'; data?: DataRef; from: number; to: number; session?: string | null }
  | { kind: 'place'; data?: DataRef; point: Vec3; t?: number | null; volume?: { id: string; name: string; shape: Volume } }
  | {
      kind: 'heat';
      data?: DataRef;
      point: Vec3;
      t?: number | null;
      /** The pick card's numbers when the note was made: the pixel's heat, the place's cell, and the place against the view. */
      heat: { value: number; place: number | null; rows: number | null; percentile: number | null; places: number | null; ofMedian: number | null; ofPeak: number | null; mode: string };
    }
  | { kind: 'insight'; data?: DataRef; id: string; insightKind: string; text: string; place: Vec3 | null; time: { from: number; to: number } | null; filters: unknown[] }
  | { kind: 'view'; id: string; name: string; view: unknown }
  | { kind: 'plan'; title: string; game: string; level: string; plan: unknown };

export type AnchorKind = Anchor['kind'];

export const ANCHOR_KINDS: AnchorKind[] = ['data', 'row', 'event', 'unit', 'match', 'round', 'time', 'place', 'heat', 'insight', 'view', 'plan'];

// ---------------------------------------------------------------- the data's fingerprint

const keyCache = new WeakMap<Dataset, string>();

/** FNV-1a, two lanes, over 32-bit words. */
function mixer() {
  let a = 0x811c9dc5;
  let b = 0x01000193 ^ 0x5bd1e995;
  const f = new Float32Array(1);
  const u = new Uint32Array(f.buffer);
  return {
    word(w: number) {
      a = Math.imul(a ^ (w >>> 0), 0x01000193) >>> 0;
      b = Math.imul(b ^ ((w >>> 16) | (w << 16)), 0x01000193 ^ 0x2c1b3c6d) >>> 0;
    },
    float(v: number) {
      f[0] = v;
      this.word(u[0]);
    },
    text(s: string) {
      for (let i = 0; i < s.length; i++) this.word(s.charCodeAt(i));
      this.word(0xffff);
    },
    hex: () => a.toString(16).padStart(8, '0') + b.toString(16).padStart(8, '0'),
  };
}

/**
 * The data's fingerprint: its row count, its extent and time span, its
 * groups, and up to 4,096 rows spread over it (position, time, who). The same
 * file loaded again gives the same key; a different file, or the same one cut
 * differently, another. Not its name: a file renamed is the same data.
 */
export function dataKey(d: Dataset): string {
  const hit = keyCache.get(d);
  if (hit) return hit;
  const h = mixer();
  h.word(d.count);
  const b = d.bounds;
  for (const v of [b.minX, b.minY, b.minZ, b.maxX, b.maxY, b.maxZ, d.timeRange[0], d.timeRange[1]]) h.float(v);
  for (const l of d.teamLabels) h.text(l);
  h.word(d.personLabels.length);
  h.word(d.sessionLabels.length);
  const n = Math.min(d.count, 4096);
  for (let i = 0; i < n; i++) {
    const r = n < d.count ? Math.floor((i * (d.count - 1)) / Math.max(1, n - 1)) : i;
    h.float(d.px[r]);
    h.float(d.py[r]);
    h.float(d.pz[r]);
    if (d.time) h.float(d.time[r]);
    if (d.personId) h.text(d.personLabels[d.personId[r]] ?? '');
  }
  const key = `d${h.hex()}`;
  keyCache.set(d, key);
  return key;
}

export function dataRef(d: Dataset): DataRef {
  return { key: dataKey(d), name: d.name };
}

// ---------------------------------------------------------------- making anchors

export function rowSig(d: Dataset, row: number): RowSig {
  return {
    person: d.personId ? (d.personLabels[d.personId[row]] ?? null) : null,
    session: d.sessionId ? (d.sessionLabels[d.sessionId[row]] ?? null) : null,
    t: d.time ? d.time[row] : null,
    x: d.px[row],
    y: d.py[row],
    z: d.pz[row],
  };
}

/** A row of the data, or one of its events when the row is one. */
export function rowAnchor(d: Dataset, row: number): Anchor {
  const ev = eventRows(d);
  if (ev) {
    const i = lowerIndex(ev.rows, row);
    if (i >= 0) return { kind: 'event', data: dataRef(d), row, sig: rowSig(d, row), event: ev.texts[i] ? `${ev.labels[i]}: ${ev.texts[i]}` : ev.labels[i] };
  }
  return { kind: 'row', data: dataRef(d), row, sig: rowSig(d, row) };
}

/** The event list's index of `row`, or -1 (the rows are in time order, not row order: a scan). */
function lowerIndex(rows: Uint32Array, row: number): number {
  return rows.indexOf(row);
}

// ---------------------------------------------------------------- resolving

export interface Resolved {
  ok: boolean;
  /** Why not (a message key under `notes.unresolved.`), when not. */
  reason?: 'otherData' | 'noData' | 'noRow' | 'noUnit' | 'noMatch' | 'noRound' | 'noInsight';
  /** Found by its signature at another index: the data changed around it. */
  moved?: boolean;
  /** Where it is in the world. */
  point?: Vec3;
  /** When: one moment, or a range. */
  time?: number;
  range?: [number, number];
  row?: number;
  unit?: string;
  session?: number;
  /** The match's entry index (`match/matches.ts`). */
  match?: number;
}

const near = (a: number, b: number, eps: number) => Math.abs(a - b) <= eps;

/** Whether `row` of `d` reads as `sig`. */
export function rowMatches(d: Dataset, row: number, sig: RowSig): boolean {
  if (row < 0 || row >= d.count) return false;
  const s = rowSig(d, row);
  const eps = 1e-3 * Math.max(1, Math.abs(sig.x), Math.abs(sig.y), Math.abs(sig.z));
  if (!near(s.x, sig.x, eps) || !near(s.y, sig.y, eps) || !near(s.z, sig.z, eps)) return false;
  if (sig.t !== null && (s.t === null || !near(s.t, sig.t, 1e-3 * Math.max(1, Math.abs(sig.t))))) return false;
  return s.person === sig.person && s.session === sig.session;
}

/** The row reading as `sig`, looked for over the person's rows (all rows without a person); -1 when none. */
export function findRow(d: Dataset, sig: RowSig): number {
  const person = sig.person !== null && d.personId ? d.personLabels.indexOf(sig.person) : -1;
  if (sig.person !== null && d.personId && person < 0) return -1;
  const idx = person >= 0 ? personRows(d) : null;
  if (idx) {
    for (let k = idx.start[person]; k < idx.start[person + 1]; k++) if (rowMatches(d, idx.rows[k], sig)) return idx.rows[k];
    return -1;
  }
  for (let r = 0; r < d.count; r++) if (rowMatches(d, r, sig)) return r;
  return -1;
}

const rowPoint = (d: Dataset, r: number): Vec3 => ({ x: d.px[r], y: d.py[r], z: d.pz[r] });

/** Where a unit is at `t` (its row nearest in time), or at its first row: by the per-person row index. */
function unitPoint(d: Dataset, persons: number[], t: number | null | undefined): Vec3 | undefined {
  const idx = personRows(d);
  if (!idx) return undefined;
  let best = -1;
  let bestDt = Infinity;
  for (const p of persons) {
    const lo0 = idx.start[p];
    const hi0 = idx.start[p + 1];
    if (hi0 <= lo0) continue;
    if (t === null || t === undefined || !d.time) {
      if (best < 0) best = idx.rows[lo0];
      continue;
    }
    let lo = lo0;
    let hi = hi0 - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (d.time[idx.rows[mid]] < t) lo = mid + 1;
      else hi = mid;
    }
    for (const k of [lo - 1, lo]) {
      if (k < lo0 || k >= hi0) continue;
      const dt = Math.abs(d.time[idx.rows[k]] - t);
      if (dt < bestDt) {
        bestDt = dt;
        best = idx.rows[k];
      }
    }
  }
  return best >= 0 ? rowPoint(d, best) : undefined;
}

/**
 * Where the anchor is on `d`. Anchors kept with what they point at (a view,
 * a plan, a place, a heat spot) always resolve; those that name things in the
 * data resolve when the data has them - a row only on the same data.
 */
export function resolveAnchor(d: Dataset | null, a: Anchor, findings?: ReadonlyMap<string, { place: Vec3 | null }>): Resolved {
  switch (a.kind) {
    case 'view':
    case 'plan':
      return { ok: true };
    case 'place':
      return { ok: true, point: a.point, ...(a.t !== null && a.t !== undefined ? { time: a.t } : {}) };
    case 'heat':
      return { ok: true, point: a.point, ...(a.t !== null && a.t !== undefined ? { time: a.t } : {}) };
    case 'insight': {
      const base: Resolved = { ok: true, ...(a.place ? { point: a.place } : {}), ...(a.time ? { range: [a.time.from, a.time.to] as [number, number] } : {}) };
      if (findings && !findings.has(a.id)) return { ...base, ok: !!a.place, reason: 'noInsight' };
      return base;
    }
  }
  if (!d) return { ok: false, reason: 'noData' };
  switch (a.kind) {
    case 'data':
      return a.data.key === dataKey(d) ? { ok: true } : { ok: false, reason: 'otherData' };
    case 'row':
    case 'event': {
      const same = a.data.key === dataKey(d);
      let row = same && rowMatches(d, a.row, a.sig) ? a.row : -1;
      let moved = false;
      if (row < 0) {
        row = findRow(d, a.sig);
        moved = row >= 0;
      }
      if (row < 0) return { ok: false, reason: same ? 'noRow' : 'otherData' };
      const session = d.sessionId ? d.sessionId[row] : undefined;
      return { ok: true, moved, row, point: rowPoint(d, row), ...(d.time ? { time: d.time[row] } : {}), ...(session !== undefined ? { session } : {}) };
    }
    case 'unit': {
      const idx = unitsOf(d);
      const u = idx.byKey.get(a.key) ?? idx.units.find((x) => x.name === a.name);
      if (!u) return { ok: false, reason: 'noUnit' };
      const point = unitPoint(d, u.persons, a.t);
      return { ok: true, unit: u.key, ...(point ? { point } : {}), ...(a.t !== null && a.t !== undefined ? { time: a.t } : {}) };
    }
    case 'match': {
      const set = matchesOf(d);
      const e = set.entries.find((x) => x.id === a.id);
      if (!e) return { ok: false, reason: 'noMatch' };
      return { ok: true, match: e.index, range: [e.start, e.end] };
    }
    case 'round': {
      const s = d.sessionLabels.indexOf(a.session);
      if (s < 0) return { ok: false, reason: 'noRound' };
      return { ok: true, session: s, ...(d.sessionStart && d.sessionEnd ? { range: [d.sessionStart[s], d.sessionEnd[s]] as [number, number] } : {}) };
    }
    case 'time': {
      const s = a.session ? d.sessionLabels.indexOf(a.session) : -1;
      if (a.session && s < 0) return { ok: false, reason: 'noRound' };
      return { ok: true, range: [a.from, a.to], ...(s >= 0 ? { session: s } : {}) };
    }
  }
}

/** Whether an anchor names things of the data (and so can fail to be found on other data). */
export function anchorNeedsData(a: Anchor): boolean {
  return !(a.kind === 'view' || a.kind === 'plan' || a.kind === 'place' || a.kind === 'heat' || a.kind === 'insight');
}

/** The anchor's one-line description, in parts the panel puts into words. */
export function anchorSubject(a: Anchor): string {
  switch (a.kind) {
    case 'data':
      return a.data.name;
    case 'row':
      return [a.sig.person, a.sig.t !== null ? `${a.sig.t.toFixed(1)} s` : null].filter(Boolean).join(' · ') || `#${a.row}`;
    case 'event':
      return [a.event, a.sig.person, a.sig.t !== null ? `${a.sig.t.toFixed(1)} s` : null].filter(Boolean).join(' · ');
    case 'unit':
      return a.name;
    case 'match':
      return a.id;
    case 'round':
      return a.session;
    case 'time':
      return `${a.from.toFixed(1)}–${a.to.toFixed(1)} s${a.session ? ` · ${a.session}` : ''}`;
    case 'place':
      return a.volume ? a.volume.name : `${a.point.x.toFixed(0)}, ${a.point.y.toFixed(0)}, ${a.point.z.toFixed(0)}`;
    case 'heat':
      return `${a.point.x.toFixed(0)}, ${a.point.y.toFixed(0)}, ${a.point.z.toFixed(0)}`;
    case 'insight':
      return a.text;
    case 'view':
      return a.name;
    case 'plan':
      return a.title;
  }
}

/** A key per anchor for "the same thing": badges in lists look notes up by it. */
export function anchorKey(a: Anchor): string | null {
  switch (a.kind) {
    case 'unit':
      return `unit:${a.key}`;
    case 'match':
      return `match:${a.id}`;
    case 'round':
      return `round:${a.session}`;
    case 'event':
    case 'row':
      return `row:${a.data.key}:${a.row}`;
    case 'insight':
      return `insight:${a.id}`;
    case 'view':
      return `view:${a.id}`;
    default:
      return null;
  }
}

/** An anchor from JSON, its parts checked; null when it is not one. */
export function readAnchor(v: unknown): Anchor | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const num = (x: unknown) => typeof x === 'number' && Number.isFinite(x);
  const vec = (x: unknown): x is Vec3 => !!x && typeof x === 'object' && num((x as Vec3).x) && num((x as Vec3).y) && num((x as Vec3).z);
  const data = (x: unknown): x is DataRef => !!x && typeof x === 'object' && typeof (x as DataRef).key === 'string' && typeof (x as DataRef).name === 'string';
  const sig = (x: unknown): x is RowSig => !!x && typeof x === 'object' && num((x as RowSig).x) && num((x as RowSig).y) && num((x as RowSig).z);
  const optData = o.data === undefined || data(o.data);
  switch (o.kind) {
    case 'data':
      return data(o.data) ? (o as Anchor) : null;
    case 'row':
      return data(o.data) && num(o.row) && sig(o.sig) ? (o as Anchor) : null;
    case 'event':
      return data(o.data) && num(o.row) && sig(o.sig) && typeof o.event === 'string' ? (o as Anchor) : null;
    case 'unit':
      return optData && typeof o.key === 'string' && typeof o.name === 'string' ? (o as Anchor) : null;
    case 'match':
      return optData && typeof o.id === 'string' ? (o as Anchor) : null;
    case 'round':
      return optData && typeof o.session === 'string' ? (o as Anchor) : null;
    case 'time':
      return optData && num(o.from) && num(o.to) ? (o as Anchor) : null;
    case 'place':
      return optData && vec(o.point) ? (o as Anchor) : null;
    case 'heat':
      return optData && vec(o.point) && !!o.heat && typeof o.heat === 'object' ? (o as Anchor) : null;
    case 'insight':
      return optData && typeof o.id === 'string' && typeof o.text === 'string' ? ({ ...o, place: vec(o.place) ? o.place : null, filters: Array.isArray(o.filters) ? o.filters : [] } as Anchor) : null;
    case 'view':
      return typeof o.id === 'string' && typeof o.name === 'string' && !!o.view ? (o as Anchor) : null;
    case 'plan':
      return typeof o.title === 'string' && !!o.plan ? ({ game: '', level: '', ...o } as Anchor) : null;
  }
  return null;
}
