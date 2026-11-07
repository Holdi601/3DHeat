/**
 * Car control: where a lap locked a wheel, spun one, let the car step out or
 * wash wide - measured the same way for every game, and judged against the
 * lap it is compared with.
 *
 * Three things make that game- and surface-proof:
 *
 * - **Where grip ends is measured, not assumed.** A game's slip numbers do not
 *   say where a tyre stops giving more: Forza's are "normalised" yet a car's
 *   brakes hold their best from 0.7 to 1.6 of it; a physical slip ratio peaks
 *   near 10% on tarmac and far higher on gravel. So each car's own driving is
 *   binned - the force it made against the slip it ran - and a lock, a spin or
 *   a push is slip past the point where that force falls away.
 * - **The ground is known per sample** where the game says (Forza's surface
 *   rumble, a rally game's stage), and curves, drift angles and thresholds are
 *   kept apart for tarmac and for loose ground.
 * - **Every event is laid against the other lap over the same metres.** On
 *   gravel, on snow, in a drift-heavy arcade racer, sliding is how the corner
 *   is driven; a slide both laps share is technique, not a mistake. What it
 *   cost is the time this lap lost over the event and the recovery after it.
 *
 * See docs/race-analytics.md, "Car control".
 */

import { num, t } from '../i18n';
import type { AlignedLap } from './align';
import { at, BIN, BINS, grounded, onGround, type Envelope } from './envelope';
import { disciplineOf, groundAt, surfaceOf, type Ground, type LapTrace, type Surface } from './lap';
import { impacts, type Impact } from './impacts';
import { WHEELS, type Wheel } from './schema';

export type ControlKind =
  | 'lock'
  | 'wheelspin'
  | 'oversteer'
  | 'spin'
  | 'understeer'
  | 'abs'
  | 'tc'
  | 'handbrake'
  | 'airborne'
  | 'hit'
  | 'crash';

/** Whether an event is something to fix, or only what the car and the driver did. */
export const FAULTS: ReadonlySet<ControlKind> = new Set(['lock', 'wheelspin', 'oversteer', 'spin', 'understeer', 'hit', 'crash']);

/** Every kind, in the order a summary lists them. */
export const CONTROL_KINDS: ControlKind[] = ['lock', 'wheelspin', 'oversteer', 'spin', 'understeer', 'hit', 'crash', 'abs', 'tc', 'handbrake', 'airborne'];

export { groundAt, type Ground };

export interface ControlEvent {
  lapId: string;
  kind: ControlKind;
  /** Grid indices on the shared axis. */
  from: number;
  to: number;
  /** How long it lasted, s. */
  seconds: number;
  /** The wheels it happened to, for a lock or a spin. */
  wheels: Wheel[];
  /**
   * How far it went: slip as a multiple of the nominal peak (a lock negative),
   * or for a slide the drift angle in radians.
   */
  peak: number;
  /** The threshold it crossed, in the same units. */
  limit: number;
  /**
   * What those are: slip or slip angle as multiples of the nominal peak, a
   * drift angle (rad), how much faster than its path the car rotated (rad/s),
   * or steering as a multiple of what the path needed.
   */
  measure: Measure;
  /** The driver steered against the turn to hold it: a slide being caught. */
  countersteer: boolean;
  /** What the pedals were doing as it began. */
  pedal: 'braking' | 'throttle' | 'lifted' | 'coasting';
  /** The ground it happened on. */
  ground: Ground;
  /** Speed as it began, and the least during it, m/s. */
  speed: number;
  slowest: number;
  /** The corner it belongs to: its number and its label ("T7"), 0 and "" if none. */
  corner: number;
  label: string;
  /** The lap it is judged against, and that lap's peak over the same metres (same units). */
  againstId: string;
  otherPeak: number;
  /** The other lap did about the same there (80% of it or more): technique, not a mistake. */
  shared: boolean;
  /** Seconds lost against the other lap over it and the 40 m after it; 0 if none. */
  cost: number;
  /**
   * Speed given away to the car's own limit during it, m/s (NaN when unknown);
   * for a hit or a crash, the speed the impact took.
   */
  speedLost: number;
  /** A hit or a crash: the impact as the lap's own samples show it. */
  impact?: Impact;
}

/** A lap's car control, summed. */
export interface ControlSummary {
  lapId: string;
  /**
   * What the detection could see with: per-wheel slip and slip angle, the drift
   * angle - and, without those, the steering (pushes, against the path) and
   * the yaw rate with the lateral acceleration (slides). Hits need none of it.
   */
  basis: { slip: boolean; slipAngle: boolean; drift: boolean; steer: boolean; yaw: boolean };
  /** The ground it was driven on: tarmac, loose, or some of each. */
  surface: 'tarmac' | 'loose' | 'mixed';
  counts: Record<ControlKind, number>;
  seconds: Record<ControlKind, number>;
  /** Time lost to faults the other lap did not make. */
  cost: number;
  maxDrift: number;
}

/**
 * Where a tyre's force peaks, by surface, when nothing better is known: slip
 * ratio (a fraction) and slip angle (radians). Loose surfaces peak at higher
 * slip - the tyre pushes against the gravel it piles up. Sources: see
 * docs/race-analytics.md, "Car control".
 */
export const PEAK: Record<Surface, { ratio: number; angle: number }> = {
  tarmac: { ratio: 0.12, angle: (8 * Math.PI) / 180 },
  mixed: { ratio: 0.18, angle: (12 * Math.PI) / 180 },
  loose: { ratio: 0.25, angle: (15 * Math.PI) / 180 },
  snow: { ratio: 0.25, angle: (15 * Math.PI) / 180 },
  ice: { ratio: 0.1, angle: (6 * Math.PI) / 180 },
};

/**
 * The least drift angle that counts as the car sliding, by surface, radians.
 * A car at the limit on tarmac runs a few degrees; on gravel and snow far more
 * is the fast way through. A car that runs more as a matter of course has its
 * own, higher threshold - see `Curves.drift`.
 */
export const DRIFT: Record<Surface, number> = {
  tarmac: (7 * Math.PI) / 180,
  mixed: (10 * Math.PI) / 180,
  loose: (15 * Math.PI) / 180,
  snow: (15 * Math.PI) / 180,
  ice: (10 * Math.PI) / 180,
};

/** Past this drift angle the car is spinning, whatever the surface. */
export const SPIN = (60 * Math.PI) / 180;

/** Events shorter than these are noise: a kerb, a bump, one sample. */
const MIN_SECONDS: Record<ControlKind, number> = {
  lock: 0.1,
  wheelspin: 0.15,
  oversteer: 0.2,
  spin: 0.1,
  understeer: 0.25,
  abs: 0.2,
  tc: 0.2,
  handbrake: 0.1,
  airborne: 0.15,
  hit: 0,
  crash: 0,
};

function finite(v: number): boolean {
  return Number.isFinite(v);
}

/** The surface family of a lap's loose ground: its own, or gravel. */
function looseSurface(lap: LapTrace): Surface {
  const s = surfaceOf(lap);
  return s === 'tarmac' ? 'loose' : s;
}

/**
 * What 1 of a lap's slip channels is, as a multiple of the tyre's nominal
 * peak on that ground: divide by these to read "about 1 is the peak" in every
 * game.
 */
export function slipScale(lap: LapTrace, ground: Ground = 'tarmac'): { ratio: number; angle: number } {
  const peak = PEAK[ground === 'tarmac' ? 'tarmac' : looseSurface(lap)];
  switch (lap.meta?.slip) {
    case 'peak':
      return { ratio: 1, angle: 1 };
    case 'scaled':
      // Divided by a tarmac peak already: on other ground, by the rest.
      return { ratio: peak.ratio / PEAK.tarmac.ratio, angle: peak.angle / PEAK.tarmac.angle };
    case 'index':
      // A 0..1 sliding measure: half of it counts as the peak.
      return { ratio: 0.5, angle: 0.5 };
    case 'physical':
    default:
      return peak;
  }
}

/**
 * Where a car's tyres stop giving more, measured from its own driving: the
 * force it made binned against the slip it ran, and the limit the slip past
 * the best where the force has fallen by 8%. A curve that never falls in the
 * data has no limit: running past its "peak" costs nothing in that game, and
 * slip alone flags nothing there.
 */
export interface TyreCurve {
  /** Slip, as a multiple of the nominal peak, where the force is best. */
  best: number;
  /** Past this, the force has fallen 8% from its best. Infinity: it never does. */
  limit: number;
  samples: number;
  /** Measured from the laps, or the nominal value for want of data. */
  measured: boolean;
}

export interface Curves {
  braking: TyreCurve;
  traction: TyreCurve;
  front: TyreCurve;
  rear: TyreCurve;
  /**
   * The drift angle this car runs as a matter of course at the limit on this
   * ground - the upper quartile of it wherever it corners at 60% of its
   * hardest or more - radians; NaN when too little is known.
   */
  drift: number;
  /**
   * How much steering this car uses per unit of path curvature while it
   * corners well inside its grip, per 5 m/s speed band (games and cars steer
   * less at speed) - its own steering ratio and wheelbase in one number, for
   * telling from the steering alone when it pushes wide. NaN where unseen.
   */
  steerGain: Float32Array;
}

export interface CarTyres {
  tarmac: Curves;
  loose: Curves;
}

/** With too little data: past one and a half times the nominal peak. */
const NOMINAL: TyreCurve = { best: 1, limit: 1.5, samples: 0, measured: false };
const NOMINAL_CURVES: Curves = {
  braking: NOMINAL,
  traction: NOMINAL,
  front: NOMINAL,
  rear: NOMINAL,
  drift: Number.NaN,
  steerGain: new Float32Array(BINS).fill(Number.NaN),
};
export const NOMINAL_TYRES: CarTyres = { tarmac: NOMINAL_CURVES, loose: NOMINAL_CURVES };
const MIN_SAMPLES = 150;

function percentile(values: number[], p: number): number {
  const s = values.slice().sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.round(p * (s.length - 1))))];
}

/** The best and the limit of force `y` against slip `x`. */
export function tyreCurve(x: number[], y: number[]): TyreCurve {
  const n = x.length;
  if (n < MIN_SAMPLES) return NOMINAL;
  const order = x.map((_, i) => i).sort((a, b) => x[a] - x[b]);
  const bins = Math.max(6, Math.min(14, Math.floor(n / 40)));
  const edges: number[] = [];
  const force: number[] = [];
  for (let k = 0; k < bins; k++) {
    const idx = order.slice(Math.floor((k * n) / bins), Math.floor(((k + 1) * n) / bins));
    if (!idx.length) continue;
    edges.push(x[idx[0]]);
    // The upper quartile: what the tyre gave when the driver asked for it.
    force.push(percentile(idx.map((i) => y[i]), 0.75));
  }
  const m = force.length;
  const smooth = force.map((_, k) => {
    let s = 0;
    let c = 0;
    for (let j = Math.max(0, k - 1); j <= Math.min(m - 1, k + 1); j++) {
      s += force[j];
      c++;
    }
    return s / c;
  });
  let top = 0;
  for (let k = 1; k < m; k++) if (smooth[k] > smooth[top]) top = k;
  let limit = Number.POSITIVE_INFINITY;
  for (let k = top + 1; k < m; k++) {
    if (smooth[k] < 0.92 * smooth[top]) {
      limit = edges[k];
      break;
    }
  }
  return { best: edges[top], limit, samples: n, measured: true };
}

function drivenWheels(lap: LapTrace): Wheel[] | null {
  const d = lap.car.drivetrain;
  if (d === 'FWD') return ['FL', 'FR'];
  if (d === 'RWD') return ['RL', 'RR'];
  if (d === 'AWD') return ['FL', 'FR', 'RL', 'RR'];
  return null;
}

interface Samples {
  bx: number[];
  by: number[];
  tx: number[];
  ty: number[];
  fx: number[];
  fy: number[];
  rx: number[];
  ry: number[];
  drift: number[];
  /** Steering per curvature, by speed band. */
  gain: number[][];
}

function samples(): Samples {
  return { bx: [], by: [], tx: [], ty: [], fx: [], fy: [], rx: [], ry: [], drift: [], gain: Array.from({ length: BINS }, () => []) };
}

function curvesFrom(s: Samples, fallback: Samples | null): Curves {
  const pick = (x: number[], y: number[], fx?: number[], fy?: number[]) =>
    x.length >= MIN_SAMPLES || !fx ? tyreCurve(x, y) : tyreCurve(fx, fy!);
  return {
    braking: pick(s.bx, s.by, fallback?.bx, fallback?.by),
    traction: pick(s.tx, s.ty, fallback?.tx, fallback?.ty),
    front: pick(s.fx, s.fy, fallback?.fx, fallback?.fy),
    rear: pick(s.rx, s.ry, fallback?.rx, fallback?.ry),
    drift: s.drift.length >= 100 ? percentile(s.drift, 0.75) : Number.NaN,
    steerGain: Float32Array.from({ length: BINS }, (_, k) => {
      const own = s.gain[k];
      const other = fallback?.gain[k] ?? [];
      const use = own.length >= 25 ? own : other.length >= 25 ? other : null;
      return use ? percentile(use, 0.5) : Number.NaN;
    }),
  };
}

/**
 * The curvature the car was following at each sample, 1/m, unsigned: from its
 * yaw rate over its speed where the game sends one (exact at any sample rate),
 * else from its path, a few metres either side.
 */
export function pathCurvature(c: Record<string, Float32Array>, n: number): Float32Array {
  const out = new Float32Array(n);
  const { yawRate, speed, x, z } = c;
  if (yawRate && speed) {
    for (let i = 0; i < n; i++) out[i] = speed[i] > 3 ? Math.abs(yawRate[i]) / speed[i] : 0;
    return out;
  }
  if (!x || !z) return out;
  for (let i = 0; i < n; i++) {
    let a = i;
    let b = i;
    while (a > 0 && Math.hypot(x[i] - x[a], z[i] - z[a]) < 5) a--;
    while (b < n - 1 && Math.hypot(x[b] - x[i], z[b] - z[i]) < 5) b++;
    if (a === i || b === i) continue;
    let d = Math.atan2(x[b] - x[i], z[b] - z[i]) - Math.atan2(x[i] - x[a], z[i] - z[a]);
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    const s = Math.hypot(x[b] - x[i], z[b] - z[i]) + Math.hypot(x[i] - x[a], z[i] - z[a]);
    out[i] = s > 0 ? Math.abs(d) / (s / 2) : 0;
  }
  return out;
}

/** A car's tyre curves and drift habit from every loaded lap of it, by ground. */
export function measureTyres(laps: LapTrace[], car?: Envelope): CarTyres {
  const by: Record<Ground, Samples> = { tarmac: samples(), loose: samples() };
  const all = samples();
  for (const lap of laps) {
    const c = lap.channels;
    const { speed, longAcc, latAcc } = c;
    if (!speed || !longAcc || !latAcc) continue;
    const ratio = WHEELS.map((w) => c[`slipRatio.${w}`]);
    const angle = WHEELS.map((w) => c[`slipAngle.${w}`]);
    const beta = c.bodySlip;
    const steer = c.steer;
    const kappa = pathCurvature(c, lap.count);
    const brake = c.brake;
    const throttle = c.throttle;
    const handbrake = c.handbrake;
    const settled = grounded(c, lap.count);
    // How hard the car corners, on each kind of ground apart: on a stage over
    // tarmac and gravel the gravel is never "cornering" against the tarmac.
    const lats: Record<Ground, number[]> = { tarmac: [], loose: [] };
    for (let i = 0; i < lap.count; i++)
      if (settled[i] && Math.abs(latAcc[i]) < 45) lats[groundAt(c, lap, i)].push(Math.abs(latAcc[i]));
    const anyGround = [...lats.tarmac, ...lats.loose];
    const hardestOf = (g: Ground) => percentile(lats[g].length >= 50 ? lats[g] : anyGround, 0.99) || 0;
    const hard: Record<Ground, number> = { tarmac: hardestOf('tarmac'), loose: hardestOf('loose') };
    const driven = (drivenWheels(lap) ?? WHEELS.slice()).map((w) => WHEELS.indexOf(w));
    for (let i = 0; i < lap.count; i++) {
      if (!(speed[i] > 10) || !settled[i] || Math.abs(longAcc[i]) > 45 || Math.abs(latAcc[i]) > 45) continue;
      const ground = groundAt(c, lap, i);
      const hardest = hard[ground];
      const straight = Math.abs(latAcc[i]) < 0.3 * hardest;
      const env = onGround(car, ground);
      const scale = slipScale(lap, ground);
      const into = [by[ground], all];
      const push = (key: Exclude<keyof Samples, 'gain'>, v: number) => into.forEach((s) => s[key].push(v));
      if (ratio.every(Boolean)) {
        if ((brake?.[i] ?? 0) > 0.3 && !((handbrake?.[i] ?? 0) > 0.2) && straight) {
          push('bx', Math.abs(ratio.reduce((s, r) => s + r![i], 0) / 4) / scale.ratio);
          push('by', -longAcc[i]);
        }
        if ((throttle?.[i] ?? 0) > 0.8 && !((brake?.[i] ?? 0) > 0.05) && straight && env) {
          const can = at(env.accel, speed[i]);
          if (can > 0.5) {
            push('tx', Math.max(...driven.map((k) => ratio[k]![i])) / scale.ratio);
            push('ty', longAcc[i] / can);
          }
        }
      }
      const cornering = Math.abs(latAcc[i]) > 0.6 * hardest;
      if (angle.every(Boolean) && env && Math.abs(latAcc[i]) > 0.3 * hardest) {
        const grip = at(env.lateral, speed[i]);
        if (grip > 1) {
          push('fx', Math.max(Math.abs(angle[0]![i]), Math.abs(angle[1]![i])) / scale.angle);
          push('fy', Math.abs(latAcc[i]) / grip);
          push('rx', Math.max(Math.abs(angle[2]![i]), Math.abs(angle[3]![i])) / scale.angle);
          push('ry', Math.abs(latAcc[i]) / grip);
        }
      }
      if (beta && cornering) push('drift', Math.abs(beta[i]));
      // The steering the path needs while the tyres are well inside their
      // grip: the car's own steering per unit of curvature.
      const k = kappa[i];
      // Cornering firmly but well inside the grip: the car's own steering for
      // a curve, understeer gradient included, before the tyres give up.
      const light = Math.abs(latAcc[i]) > 0.3 * hardest && Math.abs(latAcc[i]) < 0.6 * hardest;
      if (steer && light && Math.abs(k) > 1 / 400 && Math.abs(steer[i]) > 0.02) {
        const band = Math.min(BINS - 1, Math.floor(speed[i] / BIN));
        into.forEach((s) => s.gain[band].push(Math.abs(steer[i]) / Math.abs(k)));
      }
    }
  }
  return { tarmac: curvesFrom(by.tarmac, all), loose: curvesFrom(by.loose, all) };
}

/** Runs of consecutive grid points passing `test`, gaps of up to `gap` points bridged. */
function runs(first: number, last: number, test: (i: number) => boolean, gap = 2): [number, number][] {
  const out: [number, number][] = [];
  let start = -1;
  let end = -1;
  for (let i = first; i <= last; i++) {
    if (test(i)) {
      if (start < 0) start = i;
      else if (i - end > gap + 1) {
        out.push([start, end]);
        start = i;
      }
      end = i;
    }
  }
  if (start >= 0) out.push([start, end]);
  return out;
}

/**
 * Which way the car was really turning at each grid point: +1 right, -1 left,
 * 0 straight. From the path's own curvature and whether the lap's world is
 * mirrored (see handedness.ts): in this viewer a growing `atan2(dx, dz)` is a
 * left turn, in a mirrored world a right one.
 */
export function turnDirection(lap: AlignedLap, step: number, mirrored: boolean): Int8Array {
  const { x, z } = lap.channels;
  const n = x.length;
  const out = new Int8Array(n);
  const k = Math.max(2, Math.round(6 / step));
  for (let i = Math.max(lap.first + k, k); i <= Math.min(lap.last - k, n - 1 - k); i++) {
    const h1 = Math.atan2(x[i] - x[i - k], z[i] - z[i - k]);
    const h2 = Math.atan2(x[i + k] - x[i], z[i + k] - z[i]);
    let d = h2 - h1;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    // Tighter than 600 m of radius counts as turning.
    if (Math.abs(d) / (2 * k * step) < 1 / 600) continue;
    out[i] = d > 0 === mirrored ? 1 : -1;
  }
  return out;
}

/** What an event's `peak` and `limit` are measured in. */
export type Measure = 'slip' | 'slipAngle' | 'drift' | 'attitude' | 'steer' | 'impact' | 'none';

interface Detected {
  kind: ControlKind;
  from: number;
  to: number;
  wheels: Wheel[];
  peak: number;
  limit: number;
  countersteer: boolean;
  ground: Ground;
  measure: Measure;
  impact?: Impact;
}

/**
 * One lap's events, before they are laid against another lap. `tyres` sets
 * where a lock, a spin, a push and a slide begin; `peaksOnly` reports how far
 * the lap went wherever it went at all, for measuring the other lap.
 */
export function detect(
  lap: AlignedLap,
  step: number,
  mirrored: boolean,
  tyres: CarTyres = NOMINAL_TYRES,
  peaksOnly = false,
): Detected[] {
  const c = lap.channels;
  const trace = lap.lap;
  const time = c.time;
  const speed = c.speed;
  const brake = c.brake;
  const throttle = c.throttle;
  const handbrake = c.handbrake;
  const steer = c.steer;
  const beta = c.bodySlip;
  const lo = lap.first;
  const hi = lap.last;
  const ground = (i: number) => groundAt(c, trace, i);
  const curves = (i: number) => tyres[ground(i)];
  const scale = { tarmac: slipScale(trace, 'tarmac'), loose: slipScale(trace, 'loose') };
  // In the air, and the moment after landing: wheels spun up in the air and
  // a suspension bottoming out say nothing about the driving.
  const settled = grounded(c, c.time.length);
  const moving = (i: number) => speed[i] > 5 && settled[i] === 1;
  const out: Detected[] = [];
  const seconds = (a: number, b: number) => (finite(time[b] - time[a]) ? time[b] - time[a] : 0);
  const keep = (kind: ControlKind, [a, b]: [number, number], rest: Omit<Detected, 'kind' | 'from' | 'to' | 'ground' | 'measure'> & { measure?: Measure }) => {
    // A run a single grid point long still lasted the time to cross it.
    if (!peaksOnly && seconds(Math.max(lo, a - 1), Math.min(hi, b + 1)) / 2 + seconds(a, b) / 2 < MIN_SECONDS[kind]) return;
    out.push({ kind, from: a, to: b, ground: ground(a), measure: 'none', ...rest });
  };
  const limitOf = (curve: TyreCurve) => (peaksOnly ? 0 : curve.limit);

  // Slip ratio, as a multiple of the nominal peak, per wheel.
  const ratio = WHEELS.map((w) => c[`slipRatio.${w}`]);
  if (ratio.every(Boolean)) {
    const norm = (k: number, i: number) => ratio[k]![i] / scale[ground(i)].ratio;
    const handbraking = (i: number) => (handbrake?.[i] ?? 0) > 0.2;
    // Locked: a wheel past where this car's brakes stop giving more, while
    // braking - the handbrake locking the rears on purpose is its own event.
    const lockAt = (i: number) => limitOf(curves(i).braking);
    for (const run of runs(lo, hi, (i) => moving(i) && (brake?.[i] ?? 0) > 0.05 && !handbraking(i) && WHEELS.some((_, k) => norm(k, i) < -lockAt(i)))) {
      const wheels = WHEELS.filter((_, k) => {
        for (let i = run[0]; i <= run[1]; i++) if (norm(k, i) < -lockAt(i)) return true;
        return false;
      });
      let peak = 0;
      for (let i = run[0]; i <= run[1]; i++) for (let k = 0; k < 4; k++) peak = Math.min(peak, norm(k, i));
      keep('lock', run, { wheels, peak, limit: -lockAt(run[0]), countersteer: false, measure: 'slip' });
    }
    // Spinning: a driven wheel past where the tyres stop pulling harder, on
    // the throttle. With the drivetrain unknown, any wheel.
    const driven = drivenWheels(trace) ?? WHEELS.slice();
    const dk = driven.map((w) => WHEELS.indexOf(w));
    const spinAt = (i: number) => limitOf(curves(i).traction);
    for (const run of runs(lo, hi, (i) => moving(i) && (throttle?.[i] ?? 1) > 0.2 && dk.some((k) => norm(k, i) > spinAt(i)))) {
      const wheels = driven.filter((_, j) => {
        for (let i = run[0]; i <= run[1]; i++) if (norm(dk[j], i) > spinAt(i)) return true;
        return false;
      });
      let peak = 0;
      for (let i = run[0]; i <= run[1]; i++) for (const k of dk) peak = Math.max(peak, norm(k, i));
      keep('wheelspin', run, { wheels, peak, limit: spinAt(run[0]), countersteer: false, measure: 'slip' });
    }
  }

  // The balance: front against rear slip angle, as multiples of the nominal peak.
  const angle = WHEELS.map((w) => c[`slipAngle.${w}`]);
  const hasAngles = angle.every(Boolean);
  const axle = (i: number, front: boolean) => {
    const [a, b] = front ? [0, 1] : [2, 3];
    return Math.max(Math.abs(angle[a]![i]), Math.abs(angle[b]![i])) / scale[ground(i)].angle;
  };

  // Which way the car turns, and whether the wheel points the other way.
  const turn = turnDirection(lap, step, mirrored);
  const against = (i: number) => !!steer && turn[i] !== 0 && Math.abs(steer[i]) > 0.05 && Math.sign(steer[i]) === -turn[i];

  // Sliding: a drift angle past what the surface allows at the limit - and
  // past half again what this car runs as a matter of course there - or, with
  // slip angles, the rear past where its grip falls away and past the front.
  const driftAt = (i: number) => {
    if (peaksOnly) return 0;
    const g = ground(i);
    const habit = curves(i).drift;
    const floor = DRIFT[g === 'tarmac' ? 'tarmac' : looseSurface(trace)];
    return finite(habit) ? Math.max(floor, 1.5 * habit) : floor;
  };
  const sliding = (i: number) => {
    if (!moving(i)) return false;
    const b = beta ? Math.abs(beta[i]) : 0;
    if (beta && b > driftAt(i)) return true;
    return hasAngles && axle(i, false) > limitOf(curves(i).rear) && axle(i, false) > axle(i, true) + 0.25;
  };
  for (const run of runs(lo, hi, sliding)) {
    let peak = 0;
    let caught = false;
    for (let i = run[0]; i <= run[1]; i++) {
      if (beta) peak = Math.max(peak, Math.abs(beta[i]));
      if (against(i)) caught = true;
    }
    // With no drift angle the rear's slip angle found it: say so in its units.
    if (!beta) {
      for (let i = run[0]; i <= run[1]; i++) peak = Math.max(peak, axle(i, false));
      keep('oversteer', run, { wheels: ['RL', 'RR'], peak, limit: limitOf(curves(run[0]).rear), countersteer: caught, measure: 'slipAngle' });
      continue;
    }
    keep(peak > SPIN ? 'spin' : 'oversteer', run, { wheels: ['RL', 'RR'], peak, limit: driftAt(run[0]), countersteer: caught, measure: 'drift' });
  }

  // Without slip angles: steering beyond what the path needs, measured against
  // the car's own steering per unit of curvature well inside its grip - the
  // deficit of wheel angle against the Ackermann angle that Milliken and the
  // loggers' understeer channels use, with the car's ratio taken from its
  // own driving.
  const latAcc = c.latAcc;
  const kappa = pathCurvature(c, c.time.length);
  let hardest = 0;
  if (latAcc) {
    const lats: number[] = [];
    for (let i = lo; i <= hi; i++) if (Math.abs(latAcc[i]) < 45) lats.push(Math.abs(latAcc[i]));
    hardest = lats.length ? percentile(lats, 0.99) : 0;
  }
  const steerExcess = (i: number) => {
    const gain = at(curves(i).steerGain, speed[i]);
    if (!steer || !finite(gain) || !(kappa[i] > 1 / 300)) return 0;
    return Math.abs(steer[i]) / (gain * kappa[i]);
  };
  if (!hasAngles && steer && !peaksOnly) {
    for (const run of runs(lo, hi, (i) => moving(i) && speed[i] > 12 && !sliding(i) && !against(i) && (!latAcc || Math.abs(latAcc[i]) > 0.5 * hardest) && steerExcess(i) > 1.6)) {
      let peak = 0;
      for (let i = run[0]; i <= run[1]; i++) peak = Math.max(peak, steerExcess(i));
      keep('understeer', run, { wheels: ['FL', 'FR'], peak, limit: 1.6, countersteer: false, measure: 'steer' });
    }
  } else if (!hasAngles && steer && peaksOnly) {
    for (const run of runs(lo, hi, (i) => moving(i) && steerExcess(i) > 0)) {
      let peak = 0;
      for (let i = run[0]; i <= run[1]; i++) peak = Math.max(peak, steerExcess(i));
      keep('understeer', run, { wheels: ['FL', 'FR'], peak, limit: 0, countersteer: false, measure: 'steer' });
    }
  }
  // Without a drift angle: the car rotating faster than its path - yaw rate
  // beyond lateral acceleration over speed, the "attitude velocity" - with
  // the steering against the turn.
  const yawRate = c.yawRate;
  if (!beta && yawRate && latAcc) {
    const attitude = (i: number) => (speed[i] > 8 ? Math.abs(yawRate[i]) - Math.abs(latAcc[i]) / speed[i] : 0);
    for (const run of runs(lo, hi, (i) => moving(i) && (peaksOnly ? attitude(i) > 0 : attitude(i) > 0.2 && against(i)))) {
      let peak = 0;
      for (let i = run[0]; i <= run[1]; i++) peak = Math.max(peak, attitude(i));
      keep('oversteer', run, { wheels: ['RL', 'RR'], peak, limit: peaksOnly ? 0 : 0.2, countersteer: true, measure: 'attitude' });
    }
  }

  // Washing wide: the front past where its grip falls away, and well past the rear.
  if (hasAngles) {
    const washAt = (i: number) => limitOf(curves(i).front);
    for (const run of runs(lo, hi, (i) => moving(i) && !sliding(i) && axle(i, true) > washAt(i) && axle(i, true) > axle(i, false) + 0.3)) {
      let peak = 0;
      for (let i = run[0]; i <= run[1]; i++) peak = Math.max(peak, axle(i, true));
      keep('understeer', run, { wheels: ['FL', 'FR'], peak, limit: washAt(run[0]), countersteer: false, measure: 'slipAngle' });
    }
  }

  // What the aids and the driver did on purpose, and the air.
  const flag = (name: string, kind: ControlKind, test: (v: number) => boolean) => {
    const v = c[name];
    if (!v) return;
    for (const run of runs(lo, hi, (i) => test(v[i]))) keep(kind, run, { wheels: [], peak: 0, limit: 0, countersteer: false });
  };
  flag('absActive', 'abs', (v) => v > 0.5);
  flag('tcActive', 'tc', (v) => v > 0.5);
  flag('handbrake', 'handbrake', (v) => v > 0.2);
  flag('airborne', 'airborne', (v) => v > 0.5);

  // Hits and crashes, found in the lap's own samples and placed on the grid
  // by the time: the peak is the speed each took.
  if (time) {
    for (const hit of impacts(trace)) {
      const a = gridAtTime(time, lo, hi, hit.time);
      if (a < 0) continue;
      const b = Math.max(a, gridAtTime(time, lo, hi, trace.channels.time[hit.to]));
      out.push({
        kind: hit.kind,
        from: a,
        to: b,
        wheels: [],
        peak: hit.before - hit.after,
        limit: 0,
        countersteer: false,
        ground: ground(a),
        measure: 'impact',
        impact: hit,
      });
    }
  }
  return out;
}

/** The first grid index in [lo, hi] the lap reaches at lap time `t`; -1 outside. */
function gridAtTime(time: Float32Array, lo: number, hi: number, t: number): number {
  if (!(t >= time[lo]) || !(t <= time[hi])) return -1;
  let a = lo;
  let b = hi;
  while (a < b) {
    const m = (a + b) >> 1;
    if (time[m] < t) a = m + 1;
    else b = m;
  }
  return a;
}

function pedalAt(lap: AlignedLap, i: number): ControlEvent['pedal'] {
  const brake = lap.channels.brake?.[i] ?? 0;
  const throttle = lap.channels.throttle?.[i];
  if (brake > 0.1) return 'braking';
  if (throttle === undefined) return 'coasting';
  if (throttle > 0.3) return 'throttle';
  // The throttle came off just before: a lift.
  for (let k = Math.max(lap.first, i - 8); k < i; k++) if ((lap.channels.throttle?.[k] ?? 0) > 0.5) return 'lifted';
  return 'coasting';
}

/** How far the other lap went over the same metres, in the event's units. */
function otherPeak(
  other: AlignedLap,
  kind: ControlKind,
  measure: Measure,
  a: number,
  b: number,
  step: number,
  mirrored: boolean,
  tyres: CarTyres,
): number {
  const pad = Math.round(8 / step);
  const lo = Math.max(other.first, a - pad);
  const hi = Math.min(other.last, b + pad);
  if (hi < lo) return 0;
  const events = detect({ ...other, first: lo, last: hi }, step, mirrored, tyres, true);
  let peak = 0;
  for (const e of events) {
    const family = (k: ControlKind) => (k === 'spin' ? 'oversteer' : k === 'crash' ? 'hit' : k);
    const same = family(e.kind) === family(kind);
    if (same && e.measure === measure) peak = kind === 'lock' ? Math.min(peak, e.peak) : Math.max(peak, e.peak);
  }
  return peak;
}

export interface ControlContext {
  step: number;
  mirrored: boolean;
  /**
   * The lap an event at grid index `i` is judged against, and the relative
   * time (this lap minus it) along the axis.
   */
  against: (i: number) => { other: AlignedLap; rel: (j: number) => number } | null;
  car?: Envelope;
  /** This lap's car's measured tyre curves, and another lap's. */
  tyres: CarTyres;
  otherTyres?: (other: AlignedLap) => CarTyres;
  /** grid index -> [corner number, label], for naming where an event was. */
  cornerAt: (i: number) => [number, string];
}

/**
 * A lap's events, each laid against the other lap: shared or not, and what it
 * cost - the time lost from just before it to 40 m after it, when this lap did
 * more of it than the other.
 */
export function controlEvents(lap: AlignedLap, ctx: ControlContext): ControlEvent[] {
  const { step, mirrored, car } = ctx;
  const time = lap.channels.time;
  const speed = lap.channels.speed;
  const longAcc = lap.channels.longAcc;
  const out: ControlEvent[] = [];
  for (const d of detect(lap, step, mirrored, ctx.tyres)) {
    const pair = ctx.against(d.from);
    if (!pair) continue;
    const { other, rel } = pair;
    // The other lap's own curves, for measures that need its steering ratio.
    const theirs = otherPeak(other, d.kind, d.measure, d.from, d.to, step, mirrored, ctx.otherTyres?.(other) ?? ctx.tyres);
    const mine = Math.abs(d.peak);
    const shared = FAULTS.has(d.kind) ? Math.abs(theirs) >= 0.8 * mine && mine > 0 : true;
    // A hit's cost runs on until the car has its speed back: the metres to
    // regain it at the car's own pull.
    const reach = d.impact ? recovery(d.impact, car) : 40;
    const a = Math.max(lap.first, other.first, d.from - Math.round(5 / step));
    const b = Math.min(lap.last, other.last, d.to + Math.round(reach / step));
    const lost = rel(b) - rel(a);
    let slowest = speed[d.from];
    for (let i = d.from; i <= d.to; i++) slowest = Math.min(slowest, speed[i]);
    // Speed given away against what the car does at its limit here: for a
    // spin, its full-throttle acceleration; for a lock, its braking.
    let speedLost = d.impact ? d.impact.before - d.impact.after : Number.NaN;
    if (car && longAcc && (d.kind === 'wheelspin' || d.kind === 'lock')) {
      speedLost = 0;
      for (let i = d.from; i < d.to; i++) {
        const dt = time[i + 1] - time[i];
        if (!(dt > 0)) continue;
        const env = onGround(car, d.ground);
        const can = d.kind === 'wheelspin' ? at(env.accel, speed[i]) : at(env.braking, speed[i]);
        if (!finite(can)) continue;
        speedLost += d.kind === 'wheelspin' ? Math.max(0, can - longAcc[i]) * dt : Math.max(0, can + longAcc[i]) * dt;
      }
    }
    const [corner, label] = ctx.cornerAt(d.from);
    out.push({
      lapId: lap.lap.id,
      kind: d.kind,
      from: d.from,
      to: d.to,
      seconds: time[d.to] - time[d.from],
      wheels: d.wheels,
      peak: d.peak,
      limit: d.limit,
      measure: d.measure,
      countersteer: d.countersteer,
      pedal: pedalAt(lap, d.from),
      ground: d.ground,
      speed: speed[d.from],
      slowest,
      corner,
      label,
      againstId: other.lap.id,
      otherPeak: theirs,
      shared,
      cost: FAULTS.has(d.kind) && !shared && finite(lost) ? Math.max(0, lost) : 0,
      speedLost,
      impact: d.impact,
    });
  }
  return out;
}

/** Metres for a car to win back the speed an impact took, 40 to 400. */
function recovery(hit: Impact, car: Envelope | undefined): number {
  const mid = (hit.before + hit.after) / 2;
  const pull = car ? at(car.accel, mid) : Number.NaN;
  const a = finite(pull) && pull > 0.5 ? pull : 5;
  return Math.max(40, Math.min(400, (hit.before ** 2 - hit.after ** 2) / (2 * a)));
}

const KMH = 3.6;
const DEG = 180 / Math.PI;

/** Which wheels, as a word a message picks its phrase by. */
function whichWheels(wheels: Wheel[]): string {
  const front = wheels.filter((w) => w[0] === 'F').length;
  const rear = wheels.filter((w) => w[0] === 'R').length;
  if (front && rear) return wheels.length === 4 ? 'all' : 'frontRear';
  if (front) return front === 2 ? 'front' : wheels[0] === 'FL' ? 'fl' : 'fr';
  return rear === 2 ? 'rear' : wheels[0] === 'RL' ? 'rl' : 'rr';
}

/**
 * What a lap's car control was told from, as the first sentence of the hint
 * under it. Without tyre slip or a drift angle - an FH Companion lap file on
 * its own - locks and wheelspin cannot be told, but pushes still are from the
 * steering, slides from the yaw rate where the game sends one, and hits from
 * the speed: it says which.
 */
export function describeBasis(basis: ControlSummary['basis']): string {
  const { slip, slipAngle, drift, steer, yaw } = basis;
  if (slip && slipAngle && drift) return t('race.ui.control.basis.slipAngleDrift');
  if (slip && slipAngle) return t('race.ui.control.basis.slipAngle');
  if (slip && drift) return t('race.ui.control.basis.slipDrift');
  if (slip) return t('race.ui.control.basis.slip');
  if (drift) return t('race.ui.control.basis.drift');
  return t('race.ui.control.basis.motion', { found: steer && yaw ? 'steerYaw' : steer ? 'steer' : yaw ? 'yaw' : 'none' });
}

/**
 * A fault in words: what happened, where, how far, what it cost, and what to
 * do - naming the lap and the one it is judged against. `what` is the title
 * without the corner it was in.
 */
export function describeEvent(
  e: ControlEvent,
  me: string,
  them: string,
  lap: LapTrace,
  step: number,
): { title: string; what: string; tip: string } {
  const at = { from: num(Math.round(e.from * step)), to: num(Math.round(e.to * step)), speed: num(e.speed * KMH) };
  const seconds = num(e.seconds, 2);
  const lost = finite(e.speedLost) && e.speedLost > 0.5 ? num(e.speedLost * KMH) : 'none';
  const loose = e.ground === 'loose';
  const rally = disciplineOf(lap) === 'rally';
  const said = (what: string, tip: string) => ({ what, title: e.label ? t('race.title.corner', { corner: e.label, what }) : what, tip });
  switch (e.kind) {
    case 'lock': {
      const front = e.wheels.some((w) => w[0] === 'F');
      const rear = e.wheels.some((w) => w[0] === 'R');
      const tip =
        front && !rear
          ? t('race.event.lock.tipFront')
          : rear && !front
            ? t('race.event.lock.tipRear')
            : loose
              ? t('race.event.lock.tipLoose')
              : t('race.event.lock.tip');
      return said(
        t('race.event.lock.title', { me, wheels: whichWheels(e.wheels), seconds }),
        `${t('race.event.lock.detail', { ...at, them, peak: num(e.peak, 2), theirs: num(e.otherPeak, 2), limit: num(e.limit, 2), lost })} ${tip}`,
      );
    }
    case 'wheelspin': {
      return said(
        t('race.event.wheelspin.title', { me, wheels: whichWheels(e.wheels), seconds }),
        `${t('race.event.wheelspin.detail', { ...at, them, peak: num(e.peak, 2), theirs: num(e.otherPeak, 2), limit: num(e.limit, 2), lost })} ${t(loose ? 'race.event.wheelspin.tipLoose' : 'race.event.wheelspin.tip')}`,
      );
    }
    case 'oversteer':
    case 'spin': {
      // How far, in what this game let it be measured by.
      const amount = (v: number) =>
        e.measure === 'attitude'
          ? t('race.unit.degPerSecond', { v: num(Math.abs(v) * DEG) })
          : e.measure === 'slipAngle'
            ? num(Math.abs(v), 2)
            : t('race.unit.deg', { v: num(Math.abs(v) * DEG) });
      const angle = amount(e.peak);
      const theirs = amount(e.otherPeak);
      const pedal = e.pedal === 'coasting' ? 'none' : e.pedal;
      if (e.kind === 'spin') {
        return said(
          t('race.event.spin.title', { me, angle }),
          t('race.event.spin.tip', { ...at, slowest: num(e.slowest * KMH), pedal }),
        );
      }
      const technique = rally || loose ? ` ${t('race.event.oversteer.technique', { them, theirs })}` : '';
      return said(
        t('race.event.oversteer.title', { me, angle, seconds }),
        `${t('race.event.oversteer.tip', { ...at, me, them, angle, theirs, measure: e.measure, pedal, caught: e.countersteer ? 'yes' : 'no' })}${technique}${arcadeNote(e, lap)}`,
      );
    }
    case 'understeer': {
      const how =
        e.measure === 'steer'
          ? t('race.event.understeer.steer', { ...at, me, them, peak: num(e.peak, 1), theirs: num(e.otherPeak, 1) })
          : t('race.event.understeer.slip', { ...at, them, peak: num(e.peak, 2), theirs: num(e.otherPeak, 2), limit: num(e.limit, 2) });
      return said(
        t('race.event.understeer.title', { me, seconds }),
        `${how} ${t('race.event.understeer.tip')}${loose ? ` ${t('race.event.understeer.tipLoose')}` : ''}`,
      );
    }
    case 'hit':
    case 'crash': {
      const hit = e.impact!;
      const tip =
        hit.direction === 'side'
          ? t('race.event.hit.tipSide')
          : hit.direction === 'rear'
            ? t('race.event.hit.tipRear')
            : e.kind === 'crash'
              ? t('race.event.hit.tipCrash')
              : t('race.event.hit.tipFront');
      return said(
        t('race.event.hit.title', { me, kind: e.kind, direction: hit.direction, lost: num((hit.before - hit.after) * KMH) }),
        `${t('race.event.hit.detail', {
          from: at.from,
          to: at.to,
          before: num(hit.before * KMH),
          after: num(hit.after * KMH),
          seconds: num(Math.max(0.01, e.seconds), 2),
          g: Number.isFinite(hit.peak) ? num(hit.peak / 9.81, 1) : 'none',
          grip: num(hit.grip / 9.81, 1),
        })} ${tip}${e.shared ? ` ${t('race.event.hit.shared', { them })}` : ''}`,
      );
    }
    default:
      return said(t('race.event.other', { kind: e.kind }), '');
  }
}

/**
 * Trackmania's own physics: below about 400 km/h (300 on dirt, grass and
 * plastic) a slide gives less drive than gripping, so it only costs speed;
 * above, a speedslide at the right angle out-accelerates driving straight.
 * Sources: the speed-drift trainer plugin's constants; the speedslide write-up.
 */
function arcadeNote(e: ControlEvent, lap: LapTrace): string {
  if (!/trackmania/i.test(lap.game)) return '';
  const kmh = e.speed * KMH;
  const floor = e.ground === 'loose' ? 300 : 400;
  return ` ${t(kmh < floor ? 'race.event.arcade.slow' : 'race.event.arcade.fast', { floor: num(floor) })}`;
}

/** A lap's events, summed. */
export function summarise(lap: AlignedLap, events: ControlEvent[]): ControlSummary {
  const kinds = CONTROL_KINDS;
  const counts = Object.fromEntries(kinds.map((k) => [k, 0])) as Record<ControlKind, number>;
  const seconds = Object.fromEntries(kinds.map((k) => [k, 0])) as Record<ControlKind, number>;
  for (const e of events) {
    counts[e.kind]++;
    seconds[e.kind] += e.seconds;
  }
  // Faults that overlap - a lock and the slide it starts - are one loss: the
  // costliest of each cluster, not their sum.
  let cost = 0;
  const costly = events.filter((e) => e.cost > 0).sort((a, b) => a.from - b.from);
  let clusterEnd = -1;
  let clusterCost = 0;
  const reach = 20;
  for (const e of costly) {
    if (e.from > clusterEnd) {
      cost += clusterCost;
      clusterCost = 0;
    }
    clusterCost = Math.max(clusterCost, e.cost);
    clusterEnd = Math.max(clusterEnd, e.to + reach);
  }
  cost += clusterCost;
  const c = lap.channels;
  let maxDrift = 0;
  let loose = 0;
  let total = 0;
  for (let i = lap.first; i <= lap.last; i++) {
    if (c.bodySlip && Math.abs(c.bodySlip[i]) > maxDrift && !(c.airborne?.[i] > 0.5)) maxDrift = Math.abs(c.bodySlip[i]);
    total++;
    if (groundAt(c, lap.lap, i) === 'loose') loose++;
  }
  const share = total ? loose / total : 0;
  return {
    lapId: lap.lap.id,
    basis: {
      slip: 'slipRatio.FL' in c,
      slipAngle: 'slipAngle.FL' in c,
      drift: !!c.bodySlip,
      steer: !!c.steer,
      yaw: !!c.yawRate && !!c.latAcc,
    },
    surface: share > 0.8 ? 'loose' : share < 0.2 ? 'tarmac' : 'mixed',
    counts,
    seconds,
    cost,
    maxDrift,
  };
}
