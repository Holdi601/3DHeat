/**
 * How long a thing stays on screen after its data ends.
 *
 * Where the data says when things end - a row whose event is `despawn`,
 * `removed`, `left`... (War Thunder's converter ends every unit that is gone
 * with one) - that is the rule: a thing ends at its end row, and one without
 * an end row is there until the recording ends, however long the gaps
 * between its rows (an enemy only sent while seen, a wreck refreshed every
 * few seconds).
 *
 * Elsewhere a thing is held after its last row only a short gap scaled to
 * its own sample rate - three of its usual intervals, a quarter of a second
 * at least and three seconds at most - so a vehicle that is gone disappears
 * when its data does, and one whose next sample is merely late does not
 * blink. Never longer than the viewer's own lifetime setting.
 */

import type { Dataset } from '../state/types';
import { personRows } from './flight';
import { positionRows } from '../figures/motion';

/** Seconds a thing is held past its last sample: bounds and how many of its intervals. */
export const MIN_HOLD = 0.25;
export const MAX_HOLD = 3;
export const HOLD_INTERVALS = 3;

/** Event labels that end a thing then and there. */
export const REMOVED_EVENT = /^(removed?|despawn(ed)?|deleted?|left|leave|left_?area|disconnect(ed)?|gone|end_of_life|eol)$/i;

export interface Ends {
  /** Per person, seconds held past its last row with no row after it; Infinity: until the next row, whenever (the data says when things end). */
  hold: Float32Array;
  /** Per person, the time of its end row; Infinity for none. */
  end: Float64Array;
  /** Whether the data says when things end. */
  explicit: boolean;
}

const cache = new WeakMap<Dataset, Ends>();

/** The middle of some intervals (sorts them). */
function median(v: number[]): number {
  if (!v.length) return NaN;
  v.sort((a, b) => a - b);
  const m = v.length >> 1;
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

/** The hold for a thing sampled every `interval` seconds (NaN: one sample, never repeated). */
export function holdFor(interval: number): number {
  if (!Number.isFinite(interval) || interval <= 0) return MAX_HOLD;
  return Math.min(MAX_HOLD, Math.max(MIN_HOLD, HOLD_INTERVALS * interval));
}

/** How long a person is shown past a row of it with nothing after: `hold`, capped by the viewer's lifetime unless the data says when things end. */
export function holdLimit(e: Ends, p: number, lifetime: number): number {
  const h = e.hold[p];
  return h === Infinity ? Infinity : Math.min(lifetime, h);
}

/** Per person, when it ends and how long it is held (`Ends`). Worked out once a dataset. */
export function endsOf(d: Dataset): Ends {
  const hit = cache.get(d);
  if (hit) return hit;
  const persons = Math.max(1, d.personLabels.length);
  const hold = new Float32Array(persons).fill(MAX_HOLD);
  const end = new Float64Array(persons).fill(Infinity);
  const idx = personRows(d);
  const time = d.time;
  const ev = d.attrs.find((a) => a.kind === 'category' && a.categories && /^events?$/i.test(a.name.trim()));
  // An ACMI LeftArea carries its text after its kind: "LeftArea: Viper 1 has left".
  const removed = ev ? ev.categories!.map((c) => REMOVED_EVENT.test(c.trim()) || REMOVED_EVENT.test(c.split(': ')[0].trim())) : null;
  const explicit = !!removed && removed.some((v) => v);
  if (idx && time) {
    const { own, ids } = positionRows(d);
    const evIds = ev ? (ev.data as Uint32Array) : null;
    const gaps: number[] = [];
    for (let p = 0; p < persons; p++) {
      const a = idx.start[p];
      const b = idx.start[p + 1];
      if (b <= a) continue;
      const last = idx.rows[b - 1];
      if (removed && evIds && removed[evIds[last]]) {
        end[p] = time[last];
        hold[p] = 0;
        continue;
      }
      if (explicit) {
        hold[p] = Infinity;
        continue;
      }
      gaps.length = 0;
      let prev = NaN;
      // At most a few hundred intervals: the median of a long track settles long before its end.
      const stride = Math.max(1, Math.floor((b - a) / 400));
      for (let k = a; k < b; k += stride) {
        const r = idx.rows[k];
        if (own && ids && !own[ids[r]]) continue;
        const tr = time[r];
        if (Number.isFinite(prev) && tr > prev) gaps.push((tr - prev) / stride);
        prev = tr;
      }
      hold[p] = holdFor(median(gaps));
    }
  }
  const out = { hold, end, explicit };
  cache.set(d, out);
  return out;
}

/**
 * How long a track drawn from position keys alone is held past its last key
 * at `lastKey`: to its end row where it has one, until the next row where the
 * data says when things end, else its hold.
 */
export function holdAfterKeys(e: Ends, p: number, lastKey: number): number {
  if (Number.isFinite(e.end[p])) return Math.max(0, e.end[p] - lastKey);
  return e.hold[p];
}
