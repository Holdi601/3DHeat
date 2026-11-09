/**
 * Tacview's Visible flag (ACMI 2.2) per person on the CPU: when the recording
 * hides an object without ending it (Visible 0), for the lists that leave it
 * out meanwhile. Worked out once a dataset, and only where the column ever
 * hides anything.
 */

import type { Dataset } from '../state/types';
import { personRows } from './flight';

const cache = new WeakMap<Dataset, Map<number, Float64Array> | null>();

/** Per person hidden for a while, from when to when (seconds, pairs; the last may run to Infinity); null for none. */
export function hiddenSpans(d: Dataset): Map<number, Float64Array> | null {
  if (cache.has(d)) return cache.get(d)!;
  let out: Map<number, Float64Array> | null = null;
  const a = d.attrs.find((x) => x.kind === 'number' && x.name === 'Visible');
  const idx = a && d.time && !(a.min >= 0.5) ? personRows(d) : null;
  if (a && idx && d.time) {
    const v = a.data as Float32Array;
    const time = d.time;
    for (let p = 0; p + 1 < idx.start.length; p++) {
      let list: number[] | null = null;
      let from = NaN;
      for (let k = idx.start[p]; k < idx.start[p + 1]; k++) {
        const r = idx.rows[k];
        const hidden = v[r] < 0.5;
        if (hidden && Number.isNaN(from)) from = time[r];
        else if (!hidden && !Number.isNaN(from)) {
          (list ??= []).push(from, time[r]);
          from = NaN;
        }
      }
      if (!Number.isNaN(from)) (list ??= []).push(from, Infinity);
      if (list) (out ??= new Map()).set(p, Float64Array.from(list));
    }
  }
  cache.set(d, out);
  return out;
}

/** Whether the recording hides person `p` at `t` (Visible 0). */
export function hiddenAt(d: Dataset, p: number, t: number): boolean {
  const sp = hiddenSpans(d)?.get(p);
  if (!sp) return false;
  for (let k = 0; k < sp.length; k += 2) {
    if (t < sp[k]) return false;
    if (t < sp[k + 1]) return true;
  }
  return false;
}
