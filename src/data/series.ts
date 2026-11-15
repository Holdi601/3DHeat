/**
 * A campaign round's sessions played as one series (`Dataset.series`, made
 * by `DatasetBuilder`): which session a moment of the series' clock is in,
 * its real date, and each session's standing at its start.
 */

import type { Dataset } from '../state/types';

export interface SeriesPlace {
  /** The session's index in the series (0-based), or of the next one during a break. */
  index: number;
  /** Sessions in the series. */
  of: number;
  /** Between two sessions (the cut gap), before `index`. */
  inBreak: boolean;
  /** The real time (Unix seconds) at this moment; during a break, the next session's start. */
  real: number;
}

/** Where a moment of the series' clock falls. Null for a dataset that is no series. */
export function seriesAt(d: Pick<Dataset, 'series'>, t: number): SeriesPlace | null {
  const s = d.series?.sessions;
  if (!s?.length) return null;
  let lo = 0;
  let hi = s.length - 1;
  // The last session begun by `t`.
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (s[mid].start <= t) lo = mid;
    else hi = mid - 1;
  }
  const cur = s[lo];
  if (t < cur.start) return { index: 0, of: s.length, inBreak: false, real: cur.realStart };
  if (t <= cur.end || lo === s.length - 1) return { index: lo, of: s.length, inBreak: false, real: cur.realStart + Math.min(t, cur.end) - cur.start };
  const next = s[lo + 1];
  return { index: lo + 1, of: s.length, inBreak: true, real: next.realStart };
}

/** A real time as `YYYY-MM-DD HH:MM` UTC. */
export function realDate(unix: number): string {
  return Number.isFinite(unix) ? new Date(unix * 1000).toISOString().slice(0, 16).replace('T', ' ') : '';
}

export interface SeriesStanding {
  /** The session's index in the series. */
  index: number;
  start: number;
  end: number;
  realStart: number;
  /** Contested places each side held at its start (NaN where the data does not say). */
  red: number;
  blue: number;
  /** Places taken since the session before (capture rows marked between missions). */
  taken: number;
}

const standing = new WeakMap<object, SeriesStanding[]>();

/**
 * Each session's standing at its start: the converter's `heldRed` and
 * `heldBlue` (the same on all of a session's rows) and its capture rows
 * marked `between missions`. One pass over the rows, kept per dataset.
 */
export function seriesStanding(d: Dataset): SeriesStanding[] {
  const s = d.series?.sessions;
  if (!s?.length || !d.sessionId) return [];
  const hit = standing.get(d);
  if (hit) return hit;
  const at = new Map<number, number>();
  s.forEach((x, i) => at.set(x.session, i));
  const red = new Float64Array(s.length).fill(NaN);
  const blue = new Float64Array(s.length).fill(NaN);
  const taken = new Uint32Array(s.length);
  const num = (name: string) => {
    const a = d.attrs.find((x) => x.name === name && x.kind !== 'category');
    return a ? (a.data as Float32Array) : null;
  };
  const hr = num('heldRed');
  const hb = num('heldBlue');
  const inf = d.attrs.find((x) => x.name === 'Inferred' && x.kind === 'category');
  const between = inf?.categories ? inf.categories.indexOf('between missions') : -1;
  for (let i = 0; i < d.count; i++) {
    const k = at.get(d.sessionId[i]);
    if (k === undefined) continue;
    if (hr && Number.isNaN(red[k]) && Number.isFinite(hr[i])) red[k] = hr[i];
    if (hb && Number.isNaN(blue[k]) && Number.isFinite(hb[i])) blue[k] = hb[i];
    if (between >= 0 && (inf!.data as Uint32Array)[i] === between) taken[k]++;
  }
  const out = s.map((x, i) => ({ index: i, start: x.start, end: x.end, realStart: x.realStart, red: red[i], blue: blue[i], taken: taken[i] }));
  standing.set(d, out);
  return out;
}
