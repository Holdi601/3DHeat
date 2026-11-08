/**
 * The driven line through a corner, and which shape of line suits a car there.
 *
 * Positions alone say a lot about a line: where the car started to turn, how
 * tight it turned and where, whether it turned more on the way in or on the
 * way out (an early or a late apex), whether it went round on one radius (a
 * "U") or braked straight, rotated in a short tight middle and drove out
 * straight again (a "V"), and how far inside or outside another lap it ran.
 * What suits a car depends on the corner (what follows it) and on how much the
 * car can accelerate against how hard it can turn at those speeds. See
 * docs/race-analytics.md, "Lines".
 */

import { num, t } from '../i18n';
import type { AlignedLap } from './align';
import { at, BIN, BINS, type Envelope } from './envelope';
import type { Ground } from './lap';
import { smooth, type Corner } from './segments';
import { speedArg } from '../state/unitsStore';

/** The stretch of the reference where a corner turns, grid indices. */
export interface CornerWindow {
  from: number;
  to: number;
  /**
   * +1 when the corner turns towards positive `lateral`, -1 otherwise: the
   * sign that makes an offset "inside".
   */
  inside: 1 | -1;
}

/**
 * Where the reference turns through a corner: out from its tightest point
 * while the curvature stays above a sixth of the peak, and a little beyond.
 */
export function cornerWindow(
  curvature: Float32Array,
  corner: Corner,
  lo: number,
  hi: number,
  step: number,
): CornerWindow {
  const reach = Math.round(40 / step);
  let peak = Math.max(lo, Math.min(hi, corner.apex));
  for (let i = Math.max(lo, corner.apex - reach); i <= Math.min(hi, corner.apex + reach); i++) {
    if (Math.abs(curvature[i]) > Math.abs(curvature[peak])) peak = i;
  }
  const k = Math.abs(curvature[peak]);
  const sign = curvature[peak] >= 0 ? 1 : -1;
  let from = peak;
  while (from > lo && sign * curvature[from - 1] > k / 6) from--;
  let to = peak;
  while (to < hi && sign * curvature[to + 1] > k / 6) to++;
  const pad = Math.round(10 / step);
  return { from: Math.max(lo, from - pad), to: Math.min(hi, to + pad), inside: sign as 1 | -1 };
}

export interface LineMetrics {
  /** Heading change through the corner, radians, positive. */
  angle: number;
  /** Metres driven through the window. */
  length: number;
  /** Tightest radius, m, over about 15 m. */
  radiusMin: number;
  /** Where it turned tightest, grid index. */
  tightest: number;
  /** Where it began to turn (a fifth of its tightest curvature), grid index. */
  turnIn: number;
  /** Where it stopped turning, grid index. */
  trackOut: number;
  /** Where it had turned half the corner: the line's own middle, grid index. */
  middle: number;
  /** Average radius over the first and the second half of the turn, m. */
  radiusIn: number;
  radiusOut: number;
  /** Tightest radius over the average radius while turning: low for a "V". */
  concentration: number;
  shape: 'V' | 'U' | 'between';
  apex: 'early' | 'middle' | 'late';
}

function unwrap(prev: number, next: number): number {
  let d = next - prev;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return prev + d;
}

/** The line one lap drove through a corner window. */
export function lineMetrics(lap: AlignedLap, win: CornerWindow, step: number): LineMetrics | null {
  const from = Math.max(win.from, lap.first + 3);
  const to = Math.min(win.to, lap.last - 3);
  if (to - from < 6) return null;
  const x = smooth(lap.channels.x, 2);
  const z = smooth(lap.channels.z, 2);
  const h = 2;
  const n = to - from + 1;
  const theta = new Float64Array(n);
  const len = new Float64Array(n);
  for (let k = 0; k < n; k++) {
    const i = from + k;
    const a = Math.atan2(z[i + h] - z[i - h], x[i + h] - x[i - h]);
    theta[k] = k ? unwrap(theta[k - 1], a) : a;
    if (k) len[k] = len[k - 1] + Math.hypot(x[i] - x[i - 1], z[i] - z[i - 1]);
  }
  if (!Number.isFinite(theta[n - 1]) || !Number.isFinite(len[n - 1])) return null;
  const total = theta[n - 1] - theta[0];
  const dir = total >= 0 ? 1 : -1;
  const angle = Math.abs(total);
  // Curvature over +-8 m of the lap's own path.
  const r = Math.max(2, Math.round(8 / step));
  const kappa = new Float64Array(n);
  let kMax = 0;
  let tightest = from;
  for (let k = 0; k < n; k++) {
    const a = Math.max(0, k - r);
    const b = Math.min(n - 1, k + r);
    const ds = len[b] - len[a];
    kappa[k] = ds > 0 ? (dir * (theta[b] - theta[a])) / ds : 0;
    if (kappa[k] > kMax) {
      kMax = kappa[k];
      tightest = from + k;
    }
  }
  let t0 = 0;
  while (t0 < n - 1 && kappa[t0] < kMax / 5) t0++;
  let t1 = n - 1;
  while (t1 > t0 && kappa[t1] < kMax / 5) t1--;
  // The half-way point of the turn itself.
  const turned = dir * (theta[t1] - theta[t0]);
  let m = t0;
  while (m < t1 && dir * (theta[m] - theta[t0]) < turned / 2) m++;
  const half = Math.max(1e-3, turned / 2);
  const radiusIn = (len[m] - len[t0]) / half;
  const radiusOut = (len[t1] - len[m]) / half;
  const radiusMin = kMax > 0 ? 1 / kMax : Number.POSITIVE_INFINITY;
  const mean = turned > 1e-3 ? (len[t1] - len[t0]) / turned : Number.POSITIVE_INFINITY;
  const concentration = Number.isFinite(mean) && mean > 0 ? radiusMin / mean : 1;
  const ratio = radiusOut / Math.max(1e-3, radiusIn);
  return {
    angle,
    length: len[n - 1],
    radiusMin,
    tightest,
    turnIn: from + t0,
    trackOut: from + t1,
    middle: from + m,
    radiusIn,
    radiusOut,
    concentration,
    shape: concentration < 0.55 ? 'V' : concentration > 0.75 ? 'U' : 'between',
    apex: ratio > 1.25 ? 'late' : ratio < 0.8 ? 'early' : 'middle',
  };
}

/**
 * The radius a lap was turning on at grid index `i`, m, over +-8 m of its own
 * path; infinite where it drove straight.
 */
export function radiusAt(lap: AlignedLap, i: number, step: number): number {
  const r = Math.max(2, Math.round(8 / step));
  const a = Math.max(lap.first + 2, i - r);
  const b = Math.min(lap.last - 2, i + r);
  if (b - a < 4) return Number.NaN;
  const { x, z } = lap.channels;
  const heading = (k: number) => Math.atan2(z[k + 2] - z[k - 2], x[k + 2] - x[k - 2]);
  let turn = heading(b) - heading(a);
  while (turn > Math.PI) turn -= 2 * Math.PI;
  while (turn < -Math.PI) turn += 2 * Math.PI;
  let length = 0;
  for (let k = a + 1; k <= b; k++) length += Math.hypot(x[k] - x[k - 1], z[k] - z[k - 1]);
  return Math.abs(turn) > 1e-4 ? length / Math.abs(turn) : Number.POSITIVE_INFINITY;
}

/**
 * How far `lap` is inside `other` at grid index `i`, metres: positive nearer
 * the inside of the corner.
 */
export function insideOf(lap: AlignedLap, other: AlignedLap, i: number, win: CornerWindow): number {
  return win.inside * (lap.channels.lateral[i] - other.channels.lateral[i]);
}

/** What a corner leads onto, which decides what matters in it. */
export type CornerType = 'onto-straight' | 'after-straight' | 'both' | 'link';

export function cornerType(before: number, after: number): CornerType {
  if (before >= 200 && after >= 120) return 'both';
  if (after >= 200 || (after >= 120 && after >= before)) return 'onto-straight';
  if (before >= 200) return 'after-straight';
  return 'link';
}

export interface CarCharacter {
  /** Full-throttle acceleration over lateral grip, at the corner's speeds. */
  powerToGrip: number;
  /** Grip at high speed over grip at low speed; above 1.15 downforce is working. */
  aero: number;
  drivetrain?: string;
}

function mean(values: Float32Array, lo: number, hi: number): number {
  let sum = 0;
  let n = 0;
  for (let b = 0; b < BINS; b++) {
    const v = (b + 0.5) * BIN;
    if (v >= lo && v <= hi && Number.isFinite(values[b])) {
      sum += values[b];
      n++;
    }
  }
  return n ? sum / n : Number.NaN;
}

/**
 * A car's character at a corner taken at `vMin`, left at `vExit` (m/s). On
 * loose ground downforce is not judged: the fast and slow stretches of a
 * stage are different roads, and gravel's grip changes from one to the next
 * by more than any wing adds.
 */
export function character(
  e: Envelope | undefined,
  vMin: number,
  vExit: number,
  drivetrain?: string,
  ground: Ground = 'tarmac',
): CarCharacter {
  if (!e) return { powerToGrip: Number.NaN, aero: Number.NaN, drivetrain };
  const grip = at(e.lateral, vMin);
  const pull = at(e.accel, vExit);
  const slow = mean(e.lateral, 15, 30);
  const fast = mean(e.lateral, 42, 70);
  return {
    powerToGrip: grip > 0 ? pull / grip : Number.NaN,
    aero: slow > 0 && ground === 'tarmac' ? fast / slow : Number.NaN,
    drivetrain,
  };
}

export interface LineAdvice {
  shape: 'V' | 'U';
  apex: 'late' | 'middle';
  /** One sentence: the line, and why for this car here. */
  text: string;
}


/**
 * The shape of line that suits a car at a corner.
 *
 * Onto a straight, the exit is paid for all the way down it: a late apex. How
 * the car gets there depends on its power against its grip at these speeds. A
 * car that accelerates hard for its grip gains most by getting straight early
 * - brake in a straight line, rotate in a short, tight middle, drive out
 * straight (the "V"). One that accelerates weakly cannot win back speed it
 * scrubs - a wide, round line that keeps the minimum speed up (the "U"). The
 * faster the corner, the weaker any car's acceleration against its grip, so
 * fast corners want the round line in every car; downforce adds to that. At
 * the end of a straight the braking zone is what counts, and a corner between
 * corners is driven for the one that matters after it.
 *
 * On loose ground the same lines are driven by turning the car on the way in
 * rather than steering it round - weight moved onto the front with a lift or
 * the left-foot brake, a flick, the handbrake in a hairpin - so it points at
 * the exit before the apex and the power goes down early.
 */
export function lineFor(type: CornerType, car: CarCharacter, vMin: number, ground: Ground = 'tarmac'): LineAdvice {
  const p = car.powerToGrip;
  const aero = car.aero >= 1.15 && vMin >= 40;
  const power = Number.isFinite(p) && p >= 0.45 && !aero;
  const momentum = aero || (Number.isFinite(p) && p <= 0.25);
  // Its power for its grip, said in the sentence where it is known.
  const ratio = Number.isFinite(p) ? num(p, 2) : 'none';
  const exitMatters = type === 'onto-straight' || type === 'both';
  const loose = ground === 'loose';
  const turnIt = loose ? ` ${t('race.line.looseTurn')}` : '';
  const drive0 = !exitMatters
    ? ''
    : car.drivetrain === 'FWD'
      ? ` ${t(loose ? 'race.line.fwdLoose' : 'race.line.fwd')}`
      : car.drivetrain === 'RWD' && Number.isFinite(p) && p >= 0.35
        ? ` ${t('race.line.rwdPower')}`
        : car.drivetrain === 'AWD'
          ? ` ${t('race.line.awd')}`
          : '';
  const drive = `${turnIt}${drive0}`;
  if (type === 'after-straight') {
    return {
      shape: power ? 'V' : 'U',
      apex: 'middle',
      text: `${t('race.line.afterStraight', { power: power ? 'yes' : 'no' })}${drive}`,
    };
  }
  if (type === 'both') {
    return {
      shape: momentum ? 'U' : 'V',
      apex: 'late',
      text: `${t(momentum ? 'race.line.bothMomentum' : 'race.line.bothPower', { ratio })}${drive}`,
    };
  }
  if (type === 'link') {
    return {
      shape: momentum ? 'U' : 'V',
      apex: 'middle',
      text: `${t('race.line.link')}${drive}`,
    };
  }
  if (momentum) {
    return {
      shape: 'U',
      apex: 'late',
      text: `${aero ? t('race.line.fastAero', { speed: speedArg(vMin), ratio }) : t('race.line.momentum', { ratio })}${drive}`,
    };
  }
  if (power) {
    return {
      shape: 'V',
      apex: 'late',
      text: `${t('race.line.power', { ratio })}${drive}`,
    };
  }
  return {
    shape: 'U',
    apex: 'late',
    text: `${t('race.line.ontoStraight', { ratio })}${drive}`,
  };
}
