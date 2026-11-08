/**
 * What the replay's charts are drawn from: scales with round ticks, the span
 * a value is shown over, a series cut to the points a chart can show, and the
 * pairs of a value-against-value chart.
 */

import { convertTo, type ValueKind } from '../../units/format';
import { longUnitMetres, type UnitPrefs } from '../../units/units';

/** Round tick values from `lo` to `hi`, about `count` of them (1, 2, 2.5 or 5 times a power of ten apart). */
export function niceTicks(lo: number, hi: number, count = 5): number[] {
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo)
    return Number.isFinite(lo) ? [lo] : [];
  const raw = (hi - lo) / Math.max(1, count);
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? 10 * p;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step)
    out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  return out;
}

/**
 * Ticks round in the unit the values are shown in (`units/format.ts`), at
 * their SI values: an altitude axis in feet ticks at 1000 ft, not 1000 m.
 * A distance axis ticks in the long unit (km, mi, NM) from one of it up.
 */
export function unitTicks(lo: number, hi: number, count: number, kind: ValueKind | null, units: UnitPrefs): number[] {
  if (!kind) return niceTicks(lo, hi, count);
  const long = kind === 'distance' && Math.max(Math.abs(lo), Math.abs(hi)) >= longUnitMetres(units.distance);
  const b = convertTo(kind, 0, units, long);
  const a = convertTo(kind, 1, units, long) - b;
  if (!(Math.abs(a) > 0) || !Number.isFinite(a)) return niceTicks(lo, hi, count);
  // Every conversion is a scale and an offset: ticks in the shown unit, back to SI.
  return niceTicks(lo * a + b, hi * a + b, count).map((d) => (d - b) / a);
}

/** The largest 1, 2 or 5 times a power of ten not above `max`: a scale bar's length. */
export function niceLength(max: number): number {
  if (!(max > 0)) return 0;
  const p = Math.pow(10, Math.floor(Math.log10(max)));
  for (const m of [5, 2, 1]) if (m * p <= max) return m * p;
  return p;
}

/** The smallest span a scale shows, by kind, so a steady value does not show its noise as a mountain range. */
export const MIN_SPAN: Record<string, number> = {
  altitude: 50,
  speed: 10,
  vspeed: 5,
  angle: 5,
  heading: 20,
  rate: 5,
  g: 1,
  mach: 0.05,
  ratio: 0.1,
  distance: 100,
};

/** The span of several value arrays together, at least `min` wide, padded a twentieth each side. */
export function spanOf(arrays: ArrayLike<number>[], min: number, pad = 0.05): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (const a of arrays)
    for (let i = 0; i < a.length; i++) {
      const v = a[i];
      if (!Number.isFinite(v)) continue;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
  if (!Number.isFinite(lo)) return [0, 1];
  if (hi - lo < min) {
    const mid = (lo + hi) / 2;
    lo = mid - min / 2;
    hi = mid + min / 2;
  }
  const p = (hi - lo) * pad;
  return [lo - p, hi + p];
}

/**
 * The span of values with the rarest `q` at each end left out, at least `min`
 * wide and padded: one spike (a spawn, a glitch) does not flatten the rest.
 */
export function robustSpanOf(
  arrays: ArrayLike<number>[],
  min: number,
  q = 0.002,
  pad = 0.05,
): [number, number] {
  const all: number[] = [];
  for (const a of arrays)
    for (let i = 0; i < a.length; i++) if (Number.isFinite(a[i])) all.push(a[i]);
  if (all.length < 50) return spanOf(arrays, min, pad);
  all.sort((a, b) => a - b);
  const lo = all[Math.floor(q * (all.length - 1))];
  const hi = all[Math.ceil((1 - q) * (all.length - 1))];
  return spanOf([[lo, hi]], min, pad);
}

/** The first index of ascending `x` at or after `v`. */
function lowerBound(x: ArrayLike<number>, v: number): number {
  let lo = 0;
  let hi = x.length;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (x[m] < v) lo = m + 1;
    else hi = m;
  }
  return lo;
}

/**
 * An SVG path of y over x (ascending) scaled into a w x h box, of the part
 * within `xs` and a sample either side, at most about two points a pixel;
 * the pen lifts at a missing value and across a gap of more than `gap` in x
 * (a respawn).
 */
export function linePath(
  x: ArrayLike<number>,
  y: ArrayLike<number>,
  w: number,
  h: number,
  xs: [number, number],
  ys: [number, number],
  gap = 10,
): string {
  const out: string[] = [];
  const sx = w / Math.max(1e-12, xs[1] - xs[0]);
  const sy = h / Math.max(1e-12, ys[1] - ys[0]);
  const from = Math.max(0, lowerBound(x, xs[0]) - 1);
  const to = Math.min(x.length, lowerBound(x, xs[1]) + 1);
  const step = Math.max(1, Math.floor((to - from) / (w * 2)));
  let pen = false;
  let prevX = NaN;
  for (let i = from; i < to; i += step) {
    const v = y[i];
    const u = x[i];
    if (
      !Number.isFinite(v) ||
      !Number.isFinite(u) ||
      (Number.isFinite(prevX) && Math.abs(u - prevX) > gap)
    )
      pen = false;
    prevX = u;
    if (!Number.isFinite(v) || !Number.isFinite(u)) continue;
    out.push(
      `${pen ? 'L' : 'M'}${((u - xs[0]) * sx).toFixed(1)},${(h - (v - ys[0]) * sy).toFixed(1)}`,
    );
    pen = true;
  }
  return out.join('');
}

/**
 * A value-against-value path: each sample's (x, y), at most `max` points, the
 * pen lifting where either is missing or time jumps more than `gap` seconds.
 * `from`/`to` limit it to a time window.
 */
export function xyPath(
  t: ArrayLike<number>,
  x: ArrayLike<number>,
  y: ArrayLike<number>,
  w: number,
  h: number,
  xs: [number, number],
  ys: [number, number],
  from = -Infinity,
  to = Infinity,
  max = 2000,
  gap = 10,
): string {
  const out: string[] = [];
  const sx = w / Math.max(1e-12, xs[1] - xs[0]);
  const sy = h / Math.max(1e-12, ys[1] - ys[0]);
  let lo = 0;
  while (lo < t.length && t[lo] < from) lo++;
  let hi = t.length;
  while (hi > lo && t[hi - 1] > to) hi--;
  const step = Math.max(1, Math.floor((hi - lo) / max));
  let pen = false;
  let prev = NaN;
  for (let i = lo; i < hi; i += step) {
    const a = x[i];
    const b = y[i];
    if (!Number.isFinite(a) || !Number.isFinite(b) || (Number.isFinite(prev) && t[i] - prev > gap))
      pen = false;
    prev = t[i];
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    out.push(
      `${pen ? 'L' : 'M'}${((a - xs[0]) * sx).toFixed(1)},${(h - (b - ys[0]) * sy).toFixed(1)}`,
    );
    pen = true;
  }
  return out.join('');
}

/** A time span zoomed by `f` (below 1 in) about `at`, kept within `whole`. */
export function zoomSpan(
  span: [number, number],
  whole: [number, number],
  at: number,
  f: number,
): [number, number] {
  const w = Math.max(
    (whole[1] - whole[0]) / 2000,
    Math.min(whole[1] - whole[0], (span[1] - span[0]) * f),
  );
  const u = (at - span[0]) / Math.max(1e-12, span[1] - span[0]);
  let lo = at - u * w;
  let hi = lo + w;
  if (lo < whole[0]) {
    lo = whole[0];
    hi = lo + w;
  }
  if (hi > whole[1]) {
    hi = whole[1];
    lo = hi - w;
  }
  return [lo, hi];
}

/** Colours of the units on a chart, in order. */
export const CHART_COLORS = [
  '#6fb6ff',
  '#ffd166',
  '#7ee0a1',
  '#ff8fa3',
  '#c49bff',
  '#ffb070',
  '#5fd4d4',
  '#e0e0e0',
];

/**
 * The distance travelled up to each sample: through the air (3D) or over the
 * ground, metres. A jump across a gap of more than `gap` seconds (a respawn)
 * adds nothing.
 */
export function cumulativeDistance(
  t: ArrayLike<number>,
  x: ArrayLike<number>,
  y: ArrayLike<number>,
  z: ArrayLike<number>,
  ground: boolean,
  gap = 10,
): Float64Array {
  const out = new Float64Array(t.length);
  for (let i = 1; i < t.length; i++) {
    const dx = x[i] - x[i - 1];
    const dy = ground ? 0 : y[i] - y[i - 1];
    const dz = z[i] - z[i - 1];
    const d = Math.hypot(dx, dy, dz);
    out[i] = out[i - 1] + (t[i] - t[i - 1] > gap || !Number.isFinite(d) ? 0 : d);
  }
  return out;
}

/** A series' value at a time, between the samples either side; the ends held. */
export function interpolateAt(t: ArrayLike<number>, v: ArrayLike<number>, time: number): number {
  const n = t.length;
  if (!n) return NaN;
  if (time <= t[0]) return v[0];
  if (time >= t[n - 1]) return v[n - 1];
  const i = Math.max(0, lowerBound(t, time) - 1);
  const f = (time - t[i]) / Math.max(1e-12, t[i + 1] - t[i]);
  return v[i] + (v[i + 1] - v[i]) * f;
}

/** The time at which an ascending series first reaches a value (the inverse of `interpolateAt`). */
export function timeAtValue(t: ArrayLike<number>, v: ArrayLike<number>, value: number): number {
  const n = t.length;
  if (!n) return NaN;
  const i = lowerBound(v, value);
  if (i <= 0) return t[0];
  if (i >= n) return t[n - 1];
  const f = (value - v[i - 1]) / Math.max(1e-12, v[i] - v[i - 1]);
  return t[i - 1] + (t[i] - t[i - 1]) * f;
}
