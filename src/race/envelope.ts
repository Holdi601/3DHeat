/**
 * What a car can do, measured from its own driving.
 *
 * The analysis only tells a lap to brake harder, carry more speed or accelerate
 * earlier when the car has shown it can - so each car's limits are taken from
 * every lap of it that is loaded: the grip it pulled at each speed, the hardest
 * it braked, how hard it accelerated at full throttle. See
 * docs/race-analytics.md, section 4.
 */

import { grounded, struckMask } from './impacts';
import { groundAt, type Ground, type LapTrace } from './lap';

export { grounded };

/** Speed bins, m/s wide. */
export const BIN = 5;
export const BINS = 24; // up to 120 m/s

/** m/s to km/h. */
const KMH = 3.6;

/**
 * Accelerations beyond this are collisions and kerb strikes, not grip. Hits
 * themselves are left out by `struckMask`; this is the backstop, above what
 * any car with downforce holds (FH Companion's race cars hold 60 m/s²
 * sideways).
 */
const PLAUSIBLE = 80;

/** How long grip has to be held to count, s: see `heldAbs`. */
export const HOLD = 0.5;

export interface Envelope {
  /**
   * Grip: 95th percentile per speed bin of |lateral acceleration| held for
   * half a second (`heldAbs`), m/s². NaN where unseen.
   */
  lateral: Float32Array;
  /** Braking: 95th percentile deceleration per speed bin, m/s², positive. */
  braking: Float32Array;
  /** Acceleration at full throttle: 90th percentile per speed bin, m/s². */
  accel: Float32Array;
  /**
   * Speed above which full-throttle acceleration falls off with speed (power
   * limited) rather than holding flat (traction limited), m/s. NaN if unclear.
   */
  crossover: number;
  laps: number;
  /**
   * The same on each kind of ground, where the laps drove a fair share of
   * both: a car holds far less on gravel than on tarmac, and a stage that runs
   * over both has no one grip, braking or pull. Absent on one kind of ground.
   */
  ground?: Partial<Record<Ground, Envelope>>;
}

/** The envelope for one kind of ground: its own, where the laps drove enough of both. */
export function onGround(e: Envelope, ground: Ground): Envelope;
export function onGround(e: Envelope | undefined, ground: Ground): Envelope | undefined;
export function onGround(e: Envelope | undefined, ground: Ground): Envelope | undefined {
  return e?.ground?.[ground] ?? e;
}

function percentile(values: number[], p: number): number {
  if (!values.length) return Number.NaN;
  const sorted = values.slice().sort((a, b) => a - b);
  const at = Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))));
  return sorted[at];
}

/**
 * The mean of |values| over a centred window `seconds` long, by time: what the
 * car held, rather than what it touched. A kerb, a slide snapping back, a car
 * being caught all spike the lateral acceleration for a moment, and a car
 * that does that often would otherwise look grippier than it is.
 */
export function heldAbs(time: Float32Array, values: Float32Array, seconds: number): Float32Array {
  const n = values.length;
  const sum = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) sum[i + 1] = sum[i] + (Number.isFinite(values[i]) ? Math.abs(values[i]) : 0);
  const out = new Float32Array(n);
  let lo = 0;
  let hi = 0;
  for (let i = 0; i < n; i++) {
    while (lo < i && time[i] - time[lo] > seconds / 2) lo++;
    if (hi < i) hi = i;
    while (hi + 1 < n && time[hi + 1] - time[i] <= seconds / 2) hi++;
    out[i] = (sum[hi + 1] - sum[lo]) / (hi - lo + 1);
  }
  return out;
}

/**
 * The middle of each sample and its two neighbours: a single-sample spike -
 * a kerb, a bump, a wall - is not something the car can do, and at five-metre
 * spacing one sample is a long way.
 */
function median3(values: Float32Array | undefined): Float32Array | undefined {
  if (!values) return undefined;
  const out = new Float32Array(values.length);
  for (let i = 0; i < values.length; i++) {
    const a = values[Math.max(0, i - 1)];
    const b = values[i];
    const c = values[Math.min(values.length - 1, i + 1)];
    out[i] = Math.max(Math.min(a, b), Math.min(Math.max(a, b), c));
  }
  return out;
}

/**
 * What the car did on `only` that kind of ground, or on all of it - and then,
 * where the laps drove a fifth or more of their samples on each kind, on each
 * kind apart as well (see `Envelope.ground`).
 */
export function envelope(laps: LapTrace[], only?: Ground): Envelope {
  const lat: number[][] = Array.from({ length: BINS }, () => []);
  const brk: number[][] = Array.from({ length: BINS }, () => []);
  const acc: number[][] = Array.from({ length: BINS }, () => []);
  const share: Record<Ground, number> = { tarmac: 0, loose: 0 };
  for (const lap of laps) {
    const { speed, throttle, brake, time } = lap.channels;
    const latAcc = lap.channels.latAcc && time ? heldAbs(time, lap.channels.latAcc, HOLD) : undefined;
    const longAcc = median3(lap.channels.longAcc);
    if (!speed) continue;
    const settled = grounded(lap.channels, lap.count);
    // A hit is no measure of the car: from just before it until it recovers.
    const struck = struckMask(lap);
    for (let i = 0; i < speed.length; i++) {
      if (!settled[i] || struck[i]) continue;
      const ground = groundAt(lap.channels, lap, i);
      share[ground]++;
      if (only && ground !== only) continue;
      const bin = Math.min(BINS - 1, Math.floor(speed[i] / BIN));
      if (latAcc && latAcc[i] < PLAUSIBLE) lat[bin].push(latAcc[i]);
      if (longAcc && Math.abs(longAcc[i]) < PLAUSIBLE) {
        if (brake && brake[i] > 0.3) brk[bin].push(-longAcc[i]);
        if (throttle && throttle[i] > 0.95 && (!brake || brake[i] < 0.05))
          acc[bin].push(longAcc[i]);
      }
    }
  }
  // What counts as cornering: a third of the hardest the car turned at all.
  const cornering = 0.33 * percentile(lat.flat(), 0.99);
  const lateral = new Float32Array(BINS);
  const braking = new Float32Array(BINS);
  const accel = new Float32Array(BINS);
  for (let b = 0; b < BINS; b++) {
    // Too few samples in a bin says nothing about the car.
    // Grip only from cornering: a speed the car only ever reached on a
    // straight has nothing but near-zero lateral samples, and their 95th
    // percentile says nothing about how hard the car can turn at that speed.
    const turning = lat[b].filter((v) => v >= cornering);
    lateral[b] = turning.length >= 6 ? percentile(turning, 0.95) : Number.NaN;
    braking[b] = brk[b].length >= 4 ? percentile(brk[b], 0.95) : Number.NaN;
    accel[b] = acc[b].length >= 4 ? percentile(acc[b], 0.9) : Number.NaN;
  }
  const total = share.tarmac + share.loose;
  const both = !only && total > 0 && Math.min(share.tarmac, share.loose) >= 0.2 * total;
  return {
    lateral,
    braking,
    accel,
    crossover: crossover(accel),
    laps: laps.length,
    ground: both ? { tarmac: envelope(laps, 'tarmac'), loose: envelope(laps, 'loose') } : undefined,
  };
}

/**
 * Where acceleration stops being flat and starts falling as 1/v.
 *
 * Power-limited acceleration times speed is constant (a = P / (m v)); in the
 * traction-limited region it is not, it grows with speed. The crossover is the
 * first bin whose a·v is within 15% of the highest a·v seen.
 */
function crossover(accel: Float32Array): number {
  let best = 0;
  for (let b = 1; b < BINS; b++) {
    const v = (b + 0.5) * BIN;
    if (Number.isFinite(accel[b])) best = Math.max(best, accel[b] * v);
  }
  if (best <= 0) return Number.NaN;
  for (let b = 1; b < BINS; b++) {
    const v = (b + 0.5) * BIN;
    if (Number.isFinite(accel[b]) && accel[b] * v >= 0.85 * best) return v;
  }
  return Number.NaN;
}

/** An envelope's value at a speed, interpolating across unseen bins. */
export function at(values: Float32Array, speed: number): number {
  const f = Math.max(0, Math.min(BINS - 1, speed / BIN - 0.5));
  const i = Math.floor(f);
  const a = values[i];
  const b = values[Math.min(BINS - 1, i + 1)];
  if (Number.isFinite(a) && Number.isFinite(b)) return a + (b - a) * (f - i);
  if (Number.isFinite(a)) return a;
  if (Number.isFinite(b)) return b;
  // Nearest seen bin.
  for (let r = 1; r < BINS; r++) {
    for (const j of [i - r, i + r])
      if (j >= 0 && j < BINS && Number.isFinite(values[j])) return values[j];
  }
  return Number.NaN;
}

/**
 * Seconds to cover `metres` flat out from `speed`, accelerating as the
 * envelope says the car does. Used to tell how much of a straight's loss the
 * exit speed explains when the cars differ. NaN when the car's acceleration
 * was never seen.
 */
export function flatOut(e: Envelope, speed: number, metres: number): number {
  if (!Number.isFinite(speed) || !(metres > 0)) return Number.NaN;
  let v = Math.max(1, speed);
  let t = 0;
  for (let s = 0; s < metres; s++) {
    const a = at(e.accel, v);
    if (!Number.isFinite(a)) return Number.NaN;
    const next = Math.sqrt(Math.max(1, v * v + 2 * a));
    t += 2 / (v + next);
    v = next;
  }
  return t;
}

/** A car's identity for grouping laps: model and tune. */
export function carKey(lap: LapTrace): string {
  return `${lap.car.ordinal ?? lap.car.name ?? 'car'}/${lap.car.pi ?? ''}`;
}

/**
 * Summary strengths, for telling two cars apart: grip across 60-160 km/h,
 * braking across the same, and acceleration at 150-200 km/h (where power shows).
 */
export function strengths(e: Envelope): {
  grip: number;
  braking: number;
  power: number;
  traction: number;
} {
  const mean = (values: Float32Array, from: number, to: number) => {
    let sum = 0;
    let n = 0;
    for (let v = from; v <= to; v += 2) {
      const x = at(values, v);
      if (Number.isFinite(x)) {
        sum += x;
        n++;
      }
    }
    return n ? sum / n : Number.NaN;
  };
  return {
    // In km/h, so the band the comparison names is the band it measures.
    grip: mean(e.lateral, 60 / KMH, 160 / KMH),
    braking: mean(e.braking, 60 / KMH, 160 / KMH),
    power: mean(e.accel, 42, 56),
    traction: mean(e.accel, 5, 15),
  };
}
