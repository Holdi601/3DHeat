/**
 * The difference split as a rate: per place, the share of the rows on either
 * side that are on the + side, against that share over everything shown - a
 * win-rate map when + is the rounds won and − the rounds lost
 * (docs/win-rate.md).
 *
 * The heat pass writes three sums into the four-channel target team heat
 * uses (a sprite's heat `v` at the pixel, the row on + or −):
 *
 *   R = Σ |v|          every row's heat
 *   P = Σ |v| on +     the + side's
 *   S = Σ v² / w       the squares, w the pass's weight (sample weight times frame gain)
 *
 * and the composite reads, after undoing the frame gain:
 *
 *   rate  = P / R                     the kernel-weighted share of + (Nadaraya-Watson)
 *   n     = R² / S                    the rows it rests on (Kish's effective sample size)
 *   p     = (rate n + m r0) / (n + m) pulled toward the overall share r0 by m rows,
 *                                     as the breakdown pulls small counts (`breakdown/metrics.ts`)
 *   shown where n reaches the minimum, faded in from half of it; coloured by
 *   p - r0 over the span: warm above r0, cool below, transparent at r0.
 *
 * `n` divides out every factor common to the rows at a pixel - the frame gain,
 * the sampling weight, a clamped sprite's area weight (`zoomInvariant`) - so it
 * counts rows near the place at any zoom and at any sampling density, and the
 * squares' division by w is what makes a frame of every k-th row, weighted k,
 * add up to the same n as the whole once merged. Nothing is read back: the
 * overall share comes from the CPU's side counts (`splitSideCounts`).
 *
 * This module is the arithmetic both backends' shaders run, for the tests.
 */

/** The composite's settings for a rate map: `HeatUniforms.rate`. */
export interface RateParams {
  /** The + side's share of every row on either side shown, 0..1. */
  overall: number;
  /** Rows of the overall share a place starts from (the pull toward it). */
  prior: number;
  /** Rows a place needs before it is coloured; faded in from half of it. */
  minSamples: number;
  /** Share above or below the overall one that takes the full colour, 0..1. */
  span: number;
}

/** What one row adds to the three sums at a pixel: its heat there `v` (signed by its side), the pass's weight `w`. */
export function rateSplat(v: number, w: number, positive: boolean): [number, number, number] {
  const a = Math.abs(v);
  return [a, positive ? a : 0, (a * a) / Math.max(w, 1e-20)];
}

export interface RateTexel {
  /** Ramp position, 0..1. */
  t: number;
  /** Which ramp: 0 the positive (above the overall share), 1 the negative. */
  row: 0 | 1;
  /** Multiplies the ramp's alpha: 0 below half the minimum, 1 from the minimum on. */
  fade: number;
  /** The rows the place rests on, and its pulled share. */
  n: number;
  p: number;
}

/** The composite of one pixel, from the accumulated sums and one over the frame gain. */
export function rateComposite(R: number, P: number, S: number, invGain: number, r: RateParams, floor = 0): RateTexel {
  const rr = Math.max(R * invGain, 0);
  const pp = Math.max(P * invGain, 0);
  const ss = Math.max(S * invGain, 1e-30);
  const n = (rr * rr) / ss;
  const raw = pp / Math.max(rr, 1e-30);
  const m = Math.max(r.prior, 0);
  const p = (raw * n + m * r.overall) / Math.max(n + m, 1e-30);
  const d = p - r.overall;
  let t = Math.min(Math.abs(d) / Math.max(r.span, 1e-6), 1);
  const min = Math.max(r.minSamples, 0);
  const fade = min > 0 ? smoothstep(min * 0.5, min, n) : rr > 1e-12 ? 1 : 0;
  if (floor > 0 && fade > 0) t = floor + (1 - floor) * t;
  return { t, row: d < 0 ? 1 : 0, fade, n, p };
}

function smoothstep(e0: number, e1: number, x: number): number {
  const k = Math.min(Math.max((x - e0) / Math.max(e1 - e0, 1e-12), 0), 1);
  return k * k * (3 - 2 * k);
}

/**
 * The overall share as the composite gets it: + over both sides, held to
 * steps of a tenth of a per cent so a playing window's slowly drifting counts
 * do not shift the colours every frame. 0.5 with no rows on either side.
 */
export function overallShare(positive: number, negative: number): number {
  const total = positive + negative;
  if (!(total > 0)) return 0.5;
  return Math.round((positive / total) * 1000) / 1000;
}
