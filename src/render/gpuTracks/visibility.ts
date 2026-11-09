/**
 * Which GPU tracks are shown: the team toggles and the filters, decided once
 * per track on the CPU (at the row standing for it - its first key's) and
 * handed to the GPU as one bit a track, re-sent only when they change. The
 * place pass skips a track whose bit is clear, so hiding a team or a match
 * among thousands costs nothing per frame.
 *
 * Also the quick tests picking needs: whether a track is there at a time
 * (its first and last key), and whether a ray comes near the box its keys
 * span - so a click tests a handful of tracks, not every one.
 */

import type { Dataset, FilterSpec } from '../../state/types';
import { keyTime, trackFloats, TRACK_U32, type GpuTrackStore } from './store';

/** The row a track is judged by. */
export function trackRowOf(s: GpuTrackStore, i: number): number {
  if (s.trackRow) return s.trackRow[i];
  if (s.keyRow) return s.keyRow[s.trackData[i * TRACK_U32]] ?? -1;
  return -1;
}

const cache = new WeakMap<GpuTrackStore, { team: Record<number, boolean>; filters: FilterSpec[]; bits: Uint32Array | null }>();

/**
 * One bit a track, set when shown; null when every track is. Remembered for
 * the same store, team toggles and filters (the store's state objects are
 * replaced on change, so the same objects mean nothing changed).
 */
export function trackVisibility(s: GpuTrackStore, d: Dataset, team: Record<number, boolean>, filters: FilterSpec[]): Uint32Array | null {
  const hit = cache.get(s);
  if (hit && hit.team === team && hit.filters === filters) return hit.bits;
  const personTeam = d.personTeam;
  const hiddenTeam = new Set(Object.entries(team).filter(([, v]) => v === false).map(([k]) => Number(k)));
  let allowedTeams: Set<number> | null = null;
  let allowedPersons: Set<number> | null = null;
  const tests: ((row: number) => boolean)[] = [];
  for (const f of filters) {
    if (f.kind === 'teams') allowedTeams = new Set(f.allowed);
    else if (f.kind === 'persons') allowedPersons = new Set(f.allowed);
    else {
      const a = d.attrs.find((x) => x.name === f.column);
      if (!a) continue;
      if (f.kind === 'categories' && a.kind === 'category') {
        if (a.categories && f.allowed.length === a.categories.length) continue;
        const ok = new Uint8Array(Math.max(1, a.categories?.length ?? 0));
        for (const v of f.allowed) if (v < ok.length) ok[v] = 1;
        const data = a.data as Uint32Array;
        tests.push((r) => ok[data[r]] === 1);
      } else if (f.kind === 'range' && a.kind !== 'category') {
        if (f.min <= a.min && f.max >= a.max) continue;
        const data = a.data as Float32Array;
        tests.push((r) => data[r] >= f.min && data[r] <= f.max);
      }
    }
  }
  let bits: Uint32Array | null = null;
  if (hiddenTeam.size || allowedTeams || allowedPersons || tests.length) {
    bits = new Uint32Array(Math.max(1, Math.ceil(s.tracks / 32)));
    for (let i = 0; i < s.tracks; i++) {
      const p = s.personOf[i];
      if (allowedPersons && !allowedPersons.has(p)) continue;
      if (personTeam) {
        const t = personTeam[p];
        if (hiddenTeam.has(t) || (allowedTeams && !allowedTeams.has(t))) continue;
      }
      const row = trackRowOf(s, i);
      if (row >= 0 && !tests.every((f) => f(row))) continue;
      bits[i >>> 5] |= 1 << (i & 31);
    }
  }
  cache.set(s, { team, filters, bits });
  return bits;
}

/** Whether track `i` is shown by `bits` (null: all are). */
export function isShown(bits: Uint32Array | null, i: number): boolean {
  return !bits || ((bits[i >>> 5] >>> (i & 31)) & 1) === 1;
}

/** The time of a track's first and last key. */
export function trackTimes(s: GpuTrackStore, i: number): [number, number] {
  const b = i * TRACK_U32;
  const first = s.trackData[b];
  const n = s.trackData[b + 1];
  return [keyTime(s, b, first), keyTime(s, b, first + Math.max(0, n - 1))];
}

/**
 * Whether a ray (origin `o`, unit direction `d`) passes within reach of the
 * box track `i`'s keys span: `fixed` plus `perDistance` times how far the box
 * is (a figure kept some pixels big grows with distance).
 */
export function rayNearTrack(s: GpuTrackStore, i: number, o: ArrayLike<number>, d: ArrayLike<number>, fixed: number, perDistance: number): boolean {
  const b = i * TRACK_U32;
  const f32 = trackFloats(s.trackData);
  const size = 65535 * f32[b + 11];
  const cx = f32[b + 8] + size / 2 - o[0];
  const cy = f32[b + 9] + size / 2 - o[1];
  const cz = f32[b + 10] + size / 2 - o[2];
  const margin = fixed + perDistance * (Math.hypot(cx, cy, cz) + size);
  let lo = 0;
  let hi = Infinity;
  for (let c = 0; c < 3; c++) {
    const min = f32[b + 8 + c] - margin;
    const max = f32[b + 8 + c] + size + margin;
    if (Math.abs(d[c]) < 1e-12) {
      if (o[c] < min || o[c] > max) return false;
      continue;
    }
    const a = (min - o[c]) / d[c];
    const e = (max - o[c]) / d[c];
    lo = Math.max(lo, Math.min(a, e));
    hi = Math.min(hi, Math.max(a, e));
    if (lo > hi) return false;
  }
  return true;
}

/** An ACMI flag's spans in a store (Visible 0, Disabled 1): the tracks it is on for a while, and from when to when (seconds, pairs). */
interface FlagSpans {
  tracks: Int32Array;
  spans: Float64Array[];
}

const spanCache = new WeakMap<GpuTrackStore, Map<string, FlagSpans | null>>();

/**
 * The spans a flag column is on for a track: from a key whose row says so to
 * the next that does not. Worked out once a store, and only where the column
 * is ever on - every other load costs nothing.
 */
function flagSpans(s: GpuTrackStore, d: Dataset, name: string, on: (v: number) => boolean): FlagSpans | null {
  let per = spanCache.get(s);
  if (!per) spanCache.set(s, (per = new Map()));
  if (per.has(name)) return per.get(name)!;
  let out: FlagSpans | null = null;
  const a = d.attrs.find((x) => x.kind === 'number' && x.name === name);
  if (a && s.keyRow && (on(a.min) || on(a.max) || !Number.isFinite(a.min))) {
    const v = a.data as Float32Array;
    const T = s.trackData;
    const tracks: number[] = [];
    const spans: Float64Array[] = [];
    for (let i = 0; i < s.tracks; i++) {
      const b = i * TRACK_U32;
      const first = T[b];
      const end = first + T[b + 1];
      let list: number[] | null = null;
      let from = NaN;
      for (let k = first; k < end; k++) {
        const r = s.keyRow[k];
        const hit = r >= 0 && on(v[r]);
        if (hit && Number.isNaN(from)) from = keyTime(s, b, k);
        else if (!hit && !Number.isNaN(from)) {
          (list ??= []).push(from, keyTime(s, b, k));
          from = NaN;
        }
      }
      if (!Number.isNaN(from)) (list ??= []).push(from, Infinity);
      if (list) {
        tracks.push(i);
        spans.push(Float64Array.from(list));
      }
    }
    if (tracks.length) out = { tracks: Int32Array.from(tracks), spans };
  }
  per.set(name, out);
  return out;
}

/** The tracks of `f` whose flag is on at `t`, as "i,i,...," ('' for none). */
function onAt(f: FlagSpans | null, t: number): string {
  if (!f) return '';
  let key = '';
  for (let j = 0; j < f.tracks.length; j++) {
    const sp = f.spans[j];
    for (let k = 0; k < sp.length; k += 2) {
      if (t < sp[k]) break;
      if (t < sp[k + 1]) {
        key += `${f.tracks[j]},`;
        break;
      }
    }
  }
  return key;
}

/** Words of shown bits in a store's visibility; the greyed bits (`withHidden`) follow as many again. */
export function visWords(s: GpuTrackStore): number {
  return Math.max(1, Math.ceil(s.tracks / 32));
}

/** Whether track `i` is greyed (ACMI Disabled: out of combat, not destroyed) in `bits` from `withHidden`. */
export function isGreyed(bits: Uint32Array | null, words: number, i: number): boolean {
  return !!bits && bits.length > words && ((bits[words + (i >>> 5)] >>> (i & 31)) & 1) === 1;
}

const hiddenNow = new WeakMap<GpuTrackStore, { base: Uint32Array | null; key: string; bits: Uint32Array | null }>();

/**
 * `base` (`trackVisibility`) with what the recording says now: the tracks it
 * hides at `t` (Visible 0) cleared, and the ones out of combat (Disabled 1)
 * set in a second run of words after the first (`visWords`), which the place
 * pass draws greyed. A new array only when either set changes, so the GPU is
 * sent the bits again only then (the renderers compare by identity).
 */
export function withHidden(s: GpuTrackStore, d: Dataset, base: Uint32Array | null, t: number): Uint32Array | null {
  const hide = flagSpans(s, d, 'Visible', (v) => v < 0.5);
  const grey = flagSpans(s, d, 'Disabled', (v) => v >= 0.5);
  if (!hide && !grey) return base;
  const h = onAt(hide, t);
  const g = onAt(grey, t);
  if (!h && !g) return base;
  const key = `${h}|${g}`;
  const c = hiddenNow.get(s);
  if (c && c.base === base && c.key === key) return c.bits;
  const words = visWords(s);
  const bits = new Uint32Array(g ? 2 * words : words);
  if (base) bits.set(base.subarray(0, words));
  else bits.fill(0xffffffff, 0, words);
  for (const i of h.split(',')) {
    if (!i) continue;
    const n = Number(i);
    bits[n >>> 5] &= ~(1 << (n & 31));
  }
  for (const i of g.split(',')) {
    if (!i) continue;
    const n = Number(i);
    bits[words + (n >>> 5)] |= 1 << (n & 31);
  }
  hiddenNow.set(s, { base, key, bits });
  return bits;
}
