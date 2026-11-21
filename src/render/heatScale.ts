/**
 * What the heat's colours mean in numbers, for the legend (ui/HeatLegend.tsx).
 *
 * The heat at a place is the sum of the sprites over it, each weighing the
 * sprite ramp at its distance (`spriteRamp`). Rows spread evenly at ρ per
 * square metre add up to ρ times one sprite's mass, `r² · 2π∫ramp(s)·s ds`, so
 * a heat value divided by that mass reads as rows per area, smoothed over the
 * sprite - the same at any zoom where the heat is zoom-invariant. Under a
 * difference with each side scaled to its own rows or matches (`sideScales`,
 * `matchScales`) the numbers are per side's share or per match.
 *
 * Computed when a setting changes, from a few hundred ramp samples: nothing
 * here runs on the frame path, and nothing reads the GPU.
 */

import type { HeatResponse } from '../state/store';
import { spriteRamp, type SpriteKernel } from './heatStack';

/** One sprite's heat over its disc per unit of radius²: 2π∫₀¹ ramp(s)·s ds. */
export function spriteMass(k: SpriteKernel, steps = 256): number {
  let sum = 0;
  for (let i = 0; i < steps; i++) {
    const s = (i + 0.5) / steps;
    sum += spriteRamp(s, k) * s;
  }
  return (2 * Math.PI * sum) / steps;
}

/** The share of the saturation point a ramp position stands for: the inverse of the composite's response curve. */
export function responseInverse(t: number, response: HeatResponse): number {
  const x = Math.min(1, Math.max(0, t));
  if (response === 'saturating') return x >= 1 ? Infinity : -Math.log(1 - x);
  if (response === 'log') return (Math.pow(2, 3 * x) - 1) / 7;
  return x;
}

/** Where a heat value lands on the colour ramp, 0..1, before the floor: the composite's response curve. */
export function responseOf(k: number, response: HeatResponse): number {
  const x = Math.max(0, k);
  const t = response === 'saturating' ? 1 - Math.exp(-x) : response === 'log' ? Math.log2(1 + x * 7) / 3 : x;
  return Math.min(1, t);
}

/** How the legend's numbers are counted. */
export type ScaleUnit =
  /** Rows per area. */
  | 'rows'
  /** Under a difference scaled to each side's rows: per cent of the side's rows, per area. */
  | 'share'
  /** Under a difference scaled to each side's matches: rows per area in one match. */
  | 'match'
  /** Line heat and weighted heat: the heat's own units. */
  | 'heat';

export interface ScaleTick {
  /** Where on the colour bar, 0..1 (after the floor). */
  pos: number;
  /** The heat there, in the saturation point's units. */
  heat: number;
  /** The same in the legend's unit (per `area`), or NaN for `heat`. */
  value: number;
  /** The top of a saturating ramp is never reached: this tick is "or more". */
  orMore: boolean;
}

export interface HeatScale {
  unit: ScaleUnit;
  /** Square metres the values are counted per. */
  area: number;
  ticks: ScaleTick[];
}

export interface ScaleInput {
  saturation: number;
  response: HeatResponse;
  floor: number;
  kernel: SpriteKernel;
  /** Line heat or a value weight: no rows-per-area reading. */
  rawHeat: boolean;
  /** Difference normalised to shares of each side: rows on both sides; to matches: matches on both sides. */
  shares: { per: 'rows' | 'matches'; positive: number; negative: number } | null;
}

/** The legend's ticks: none, the middle and the top of the ramp. */
export function heatScale(o: ScaleInput): HeatScale {
  const mass = spriteMass(o.kernel) * o.kernel.radius * o.kernel.radius;
  // Per square kilometre for sprites tens of metres wide and more, per 100 m² below (a room's scale).
  const area = o.kernel.radius >= 30 ? 1e6 : 100;
  let unit: ScaleUnit = o.rawHeat || !(mass > 0) ? 'heat' : 'rows';
  // Each side was weighed by (P + N) / 2 over its own count (sideScales): undo the half-total to read per side.
  let per = 1;
  if (unit === 'rows' && o.shares && o.shares.positive > 0 && o.shares.negative > 0) {
    const half = (o.shares.positive + o.shares.negative) / 2;
    if (o.shares.per === 'rows') {
      unit = 'share';
      per = 100 / half;
    } else {
      unit = 'match';
      per = 1 / half;
    }
  }
  const top = o.response === 'saturating' ? 0.95 : 1;
  const ticks = [0, 0.5, top].map((t): ScaleTick => {
    const heat = responseInverse(t, o.response) * o.saturation;
    const pos = t > 0 && o.floor > 0 ? o.floor + (1 - o.floor) * t : t;
    return { pos, heat, value: unit === 'heat' ? NaN : (heat / mass) * area * per, orMore: t === top && o.response === 'saturating' };
  });
  return { unit, area, ticks };
}
