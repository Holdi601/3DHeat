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
import { keyTime, TRACK_U32, type GpuTrackStore } from './store';

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
  const f32 = new Float32Array(s.trackData.buffer, s.trackData.byteOffset, s.trackData.length);
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
    let a = (min - o[c]) / d[c];
    let e = (max - o[c]) / d[c];
    if (a > e) [a, e] = [e, a];
    lo = Math.max(lo, a);
    hi = Math.min(hi, e);
    if (lo > hi) return false;
  }
  return true;
}
