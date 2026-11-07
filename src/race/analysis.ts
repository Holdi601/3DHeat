/**
 * Where a lap loses or gains time against another, why, and what to do.
 *
 * Implements docs/race-analytics.md. Each corner is judged whole: from the
 * first braking for it to the first braking for the next one. What a lap gives
 * away on the way in it can win back on the way out and down the straight -
 * braking early to get the car turned and on the power sooner is often the
 * faster way through - so a corner's verdict is its net time. How that time
 * moved inside the corner (to the apex, after it, and the straight's share
 * from the exit speed and from the car's pull) explains it; the driven lines
 * and the cars' measured limits say why; and the advice follows whichever of
 * the two laps came out ahead.
 */

import { list, num, t } from '../i18n';
import { align, type AlignedLap, type Alignment } from './align';
import { at, carKey, envelope, flatOut, grounded, onGround, type Envelope } from './envelope';
import { lapsMirrored } from './handedness';
import {
  controlEvents,
  describeEvent,
  FAULTS,
  groundAt,
  measureTyres,
  slipScale,
  summarise,
  type CarTyres,
  type ControlEvent,
  type ControlSummary,
} from './control';
import { deriveChannels } from './derive';
import { lapNames, type Ground, type LapTrace } from './lap';
import {
  character,
  cornerType,
  cornerWindow,
  insideOf,
  lineFor,
  lineMetrics,
  radiusAt,
  type CornerType,
  type CornerWindow,
  type LineMetrics,
} from './line';
import { compareProfiles, describeProfile, profile, type CarProfile } from './profile';
import { curvature, findCorners, smooth, type Corner } from './segments';

export type Phase = 'braking' | 'entry' | 'exit' | 'straight';

export type FindingKind =
  // A lap that came out behind.
  | 'too-fast-in'
  | 'too-slow-in'
  | 'brakes-early'
  | 'brakes-gently'
  | 'locks'
  | 'coasts'
  | 'lifts'
  | 'overslows'
  | 'tight-line'
  | 'understeer'
  | 'slower-arrival'
  | 'late-throttle'
  | 'hesitant-exit'
  | 'wheelspin'
  | 'oversteer'
  | 'wide-exit'
  | 'scrubs'
  | 'slower-exit'
  | 'lifts-on-straight'
  | 'slower-start'
  | 'incident'
  // Rally: the car turned less (or too far) on the way in, a longer flight.
  | 'rotation'
  | 'jump'
  // The car rather than the driver, when laps in different cars are compared.
  | 'car-grip'
  | 'car-power'
  | 'car-braking'
  // A lap that came out ahead, or level by a different way through.
  | 'slow-in-fast-out'
  | 'fast-in'
  | 'faster'
  | 'even';

export interface Finding {
  lapId: string;
  againstId: string;
  /** 1-based corner number; 0 for the run to the first corner. */
  corner: number;
  /** Where the deciding difference is. */
  phase: Phase;
  kind: FindingKind;
  /**
   * Of a pattern - too fast in, too slow in - the cause found inside it, as
   * the finding it would be on its own: the entry's cause of a slow entry, the
   * exit's of a fast one, or `too-fast-in` itself when that lap braked later
   * than the other - the late brake is then the root. What the statistics
   * count it as.
   */
  cause?: FindingKind;
  /**
   * Seconds lost over the corner, braking zone to braking zone; negative when
   * this lap gained them.
   */
  cost: number;
  /** Of a loss, what the car explains: its grip, its brakes, its pull. */
  carCost: number;
  /** Of it, lost (or gained) down the straight after, from the exit speed. */
  carried: number;
  /** The trade-off: time up to where the lead turned, and after it. */
  toApex: number;
  fromApex: number;
  /** Grid index range where the cause is, for the "why" map and the camera. */
  from: number;
  to: number;
  title: string;
  /** The title without the corner and the cost: what happened, to say inside another sentence. */
  what?: string;
  /** The verdict, one line. */
  evidence: string;
  /** The measurements behind it, one line each. */
  details: string[];
  tip: string;
  /** Which shape of line suits this lap's car here, and what it drove. */
  line: string;
  /**
   * When the laps are in different cars: what of this corner the cars decide -
   * the grip, the pull, the top speed, a rear that lets go - and how to make
   * the most of this one. Empty in the same car.
   */
  cars?: string;
  /** How sure: tyre data, the car's envelope, or only the comparison. */
  basis: 'tyres' | 'envelope' | 'comparison';
  /** Whether driving differently fixes it, it is the car, or the situation. */
  source: 'driver' | 'car' | 'context';
  outcome: 'loss' | 'gain' | 'even';
}

/**
 * A corner's share of the lap: first braking for it to first braking for the
 * next. Bends with no flat-out stretch between them - a double apex, a
 * chicane - are one segment, driven as one.
 */
export interface Segment {
  /** Its first corner's number, and all of them. */
  corner: number;
  corners: number[];
  /** "T7", or "T11-T12" for a complex. */
  label: string;
  /** A complex that turns both ways: no single line shape to speak of. */
  mixed: boolean;
  start: number;
  end: number;
  /** On a circuit, the last corner's straight runs on across the line: this range too. */
  wrap?: [number, number];
  window: CornerWindow;
  type: CornerType;
  /** Metres at full throttle before the corner and after it, on the reference. */
  before: number;
  after: number;
}

export interface CornerMetrics {
  /** First braking (or lift, when it never braked); -1 if taken flat. */
  brakeOn: number;
  brakeOff: number;
  lifted: boolean;
  /** Speed where the braking starts, m/s. */
  brakeSpeed: number;
  /** Metres from the brake to the slowest point. */
  brakeMetres: number;
  peakBrake: number;
  peakDecel: number;
  minSpeed: number;
  minSpeedAt: number;
  throttleOn: number;
  fullThrottle: number;
  coastMetres: number;
  trailMetres: number;
  throttleDips: number;
  peakLat: number;
  gearAtApex: number;
  /** Tyre data, when the lap has it (NaN otherwise). */
  lockSlip: number;
  spinSlip: number;
  /** Front minus rear slip angle through the middle: + understeer, - oversteer. */
  balance: number;
  /** Fraction of the straight after it at full throttle, from its own full throttle. */
  straightFull: number;
  /** The longest lift on that straight, grid indices; -1 if none. */
  liftFrom: number;
  liftTo: number;
  /**
   * The most speed lost with the throttle down after the corner, m/s, and
   * where: a slide, a kerb, a second apex taken too tight. 0 if none.
   */
  scrub: number;
  scrubFrom: number;
  scrubTo: number;
  /**
   * How far the car was turned into the corner on the way in: the largest
   * drift angle from the braking to just past the slowest point, radians, on
   * the ground. NaN when the lap has no drift angle.
   */
  entryDrift: number;
  /** Where the handbrake came on, up to just past the slowest point; -1 if it did not. */
  handbrakeAt: number;
  /** Seconds in the air over the segment, and its longest flight (grid indices; -1 if none). */
  airSeconds: number;
  airFrom: number;
  airTo: number;
}

/** One lap against another through one corner. */
export interface CornerResult {
  corner: number;
  againstId: string;
  /** Seconds this lap took longer over the corner (negative: shorter). */
  net: number;
  toApex: number;
  fromApex: number;
  /** Where the lead turned, or the later slowest point. */
  split: number;
  /** Apex to where both were flat out, and that point on. */
  exit: number;
  straight: number;
  /**
   * Of the straight: what the speed where both were flat explains (this lap's
   * own car, from the other's speed), and what the cars' pull from the same
   * speed does; the rest is how the straight was driven.
   */
  byExit: number;
  byPower: number;
  /** straight - byExit - byPower: a lift, speed scrubbed, the line. */
  driven: number;
  /** Whether this lap lifted on the straight where the other stayed flat, or the other did. */
  lifted: boolean;
  otherLifted: boolean;
  /** Of a loss, what the car explains, by what. */
  carCost: number;
  car: CarPart;
}

export interface CarPart {
  power: number;
  grip: number;
  brakes: number;
}

export interface CarComparison {
  a: string;
  b: string;
  labelA: string;
  labelB: string;
  profiles: [CarProfile, CarProfile];
  /** A sentence each: what the car is, against the other. */
  summary: [string, string];
  /** The differences, biggest first; then how to drive each. */
  points: string[];
  driving: string[];
  /** Both of those, in order. */
  advice: string[];
}

export interface Analysis {
  alignment: Alignment;
  corners: Corner[];
  segments: Segment[];
  /** lapId -> per-corner metrics, in corner order. */
  metrics: Map<string, CornerMetrics[]>;
  /** lapId -> per-corner driven line (null where it cannot be measured). */
  lines: Map<string, (LineMetrics | null)[]>;
  /** lapId -> per-corner comparison against its comparison lap. */
  results: Map<string, CornerResult[]>;
  /** lapId -> time lost (+) or gained (-) before the first corner, when that is its own thing. */
  start: Map<string, number>;
  /**
   * lapId -> seconds through each segment (NaN where the lap does not cover
   * it), and before the first one when that is its own stretch (0 on a flying
   * lap, where it belongs to the last corner): which lap was quickest where,
   * and the best of them all put together.
   */
  segmentTimes: Map<string, { corners: number[]; start: number }>;
  findings: Finding[];
  /** carKey -> what that car has shown it can do. */
  envelopes: Map<string, Envelope>;
  /** carKey -> what kind of car it is: grip, pull, top speed, how easily its rear lets go. */
  profiles: Map<string, CarProfile>;
  /** carKey -> its name, and what its laps show it is, in words. */
  carNames: Map<string, string>;
  carWords: Map<string, string[]>;
  cars: CarComparison[];
  /** lapId -> what the text calls it. */
  names: Map<string, string>;
  /**
   * Performance class -> the lap its laps are compared against: its fastest
   * complete lap (the reference, in the reference's class). A lap is judged
   * against the best of its own class - a C-class car against an S2 lap says
   * nothing about the driving.
   */
  classBest: Map<string, string>;
  /** lapId -> its locks, spins, slides and pushes, each judged against the lap it is compared with there. */
  control: Map<string, ControlEvent[]>;
  controlSummary: Map<string, ControlSummary>;
  /** carKey -> where its tyres give their best and stop giving more. */
  tyres: Map<string, CarTyres>;
  /** Whether the laps' world is left-handed, so drawn mirrored; null if they cannot tell. */
  mirrored: boolean | null;
  /** lapId -> seconds gained (-) or lost (+) per metre against the reference, smoothed. */
  where: Map<string, Float32Array>;
  /** lapId -> cost density placed at causes, seconds per metre, on the grid. */
  why: Map<string, Float32Array>;
}

/** Closer than this over a whole corner is a draw. */
const EVEN = 0.03;
/** Each side of a trade-off has to be at least this big to count as one. */
const TRADE = 0.04;
/** A draw is still worth showing when the two laps got there this differently. */
const SHOW_EVEN = 0.1;
const METRES = 5; // an event must be this much earlier or later to count
const KMH = 3.6;

function finite(v: number): boolean {
  return Number.isFinite(v);
}

function argFirst(from: number, to: number, test: (i: number) => boolean): number {
  for (let i = from; i <= to; i++) if (test(i)) return i;
  return -1;
}

function argLast(from: number, to: number, test: (i: number) => boolean): number {
  for (let i = to; i >= from; i--) if (test(i)) return i;
  return -1;
}

/** Channels a lap may lack, as NaN-filled stand-ins so rules can test them. */
function channel(lap: AlignedLap, name: string): Float32Array {
  return lap.channels[name] ?? new Float32Array(lap.channels.time.length).fill(Number.NaN);
}

function drivenWheels(lap: LapTrace): string[] {
  const d = lap.car.drivetrain;
  if (d === 'FWD') return ['FL', 'FR'];
  if (d === 'AWD') return ['FL', 'FR', 'RL', 'RR'];
  return ['RL', 'RR'];
}

/**
 * A lap's slowest point through a corner in [lo, hi]: the lowest dip in its
 * speed, or the apex when it never slowed there.
 */
function slowest(lap: AlignedLap, lo: number, hi: number, apex: number): number {
  const v = lap.channels.speed;
  const a = Math.max(lo, lap.first);
  const b = Math.min(hi, lap.last);
  let best = -1;
  for (let i = a; i <= b; i++) {
    if (!finite(v[i])) continue;
    // A dip: nothing slower within 6 m either side - looking past the ends
    // of the stretch, so the previous corner's exit still accelerating into
    // it is not mistaken for this corner's slowest point.
    let dip = true;
    for (let j = i - 3; j <= i + 3 && dip; j++) if (j !== i && v[j] < v[i]) dip = false;
    if (dip && (best < 0 || v[i] < v[best])) best = i;
  }
  // Never slowed here: a kink taken flat, placed at the corner's apex.
  return best >= 0 ? best : Math.max(a, Math.min(b, apex));
}

/** A lap's fastest point in [lo, hi]; lo when it has none. */
function fastest(lap: AlignedLap, lo: number, hi: number): number {
  const v = lap.channels.speed;
  let best = lo;
  for (let i = Math.max(lo, lap.first); i <= Math.min(hi, lap.last); i++) {
    if (finite(v[i]) && !(v[best] >= v[i])) best = i;
  }
  return best;
}

/**
 * Where a lap began to slow for a corner: back from its slowest point through
 * the braking or the lift that led to it, over blips of full throttle, until
 * it had its foot down for 10 m. A throttle picked up again in the last 30 m
 * before the slowest point is still this corner's; a lap that was flat out all
 * the way to it starts the corner there. A lap that never had its foot down
 * since the corner before starts at its fastest point in between.
 */
function entryOf(lap: AlignedLap, minAt: number, floor: number): number {
  const lo = Math.max(floor, lap.first);
  if (!('throttle' in lap.channels)) return fastest(lap, lo, minAt);
  const brake = channel(lap, 'brake');
  const throttle = channel(lap, 'throttle');
  const off = (j: number) => brake[j] > 0.1 || !(throttle[j] >= 0.95);
  const hold = 5;
  let i = minAt;
  for (let skip = 0; i > lo && !off(i) && skip < 15; skip++) i--;
  if (!off(i)) return minAt;
  while (i > lo) {
    if (off(i - 1)) {
      i--;
      continue;
    }
    let k = i - 1;
    let run = 0;
    while (k >= lo && !off(k) && run < hold) {
      k--;
      run++;
    }
    if (run >= hold) return i;
    i = k;
  }
  return fastest(lap, lo, minAt);
}

/** What one lap did through one corner's segment. */
export function cornerMetrics(
  lap: AlignedLap,
  seg: Segment,
  minAt: number,
  step: number,
): CornerMetrics {
  const c = lap.channels;
  const speed = c.speed;
  const throttle = channel(lap, 'throttle');
  const brake = channel(lap, 'brake');
  const steer = channel(lap, 'steer');
  const latAcc = channel(lap, 'latAcc');
  const longAcc = channel(lap, 'longAcc');
  const gear = channel(lap, 'gear');
  const pedals = 'throttle' in c || 'brake' in c;
  const lo = Math.max(lap.first, seg.start);
  const hi = Math.max(lo, Math.min(lap.last, seg.end));
  const m = Math.max(lo, Math.min(hi, minAt));

  // A dab of the left foot with the power still on - to settle the car or
  // move its weight forward and turn it, as rally drivers do - is not where
  // the braking began: a brake counts once the throttle comes off under it, or
  // it lasts 15 m. With nothing else, the first dab is all the braking there was.
  const dabs = argFirst(lo, m, (i) => brake[i] > 0.1);
  let brakeOn = -1;
  for (let i = dabs; i >= 0 && i <= m; i++) {
    if (!(brake[i] > 0.1)) continue;
    let j = i;
    let powered = true;
    while (j <= m && brake[j] > 0.1) {
      if (!(throttle[j] >= 0.5)) powered = false;
      j++;
    }
    if (!powered || (j - i) * step >= 15) {
      brakeOn = i;
      break;
    }
    i = j;
  }
  let lifted = false;
  if (brakeOn < 0) {
    brakeOn = argFirst(lo, m, (i) => throttle[i] < 0.8);
    lifted = brakeOn >= 0;
  }
  if (brakeOn < 0) brakeOn = dabs;
  if (brakeOn < 0 && !pedals) {
    const entry = entryOf(lap, m, lo);
    brakeOn = entry < m ? entry : -1;
  }
  const brakeOff =
    brakeOn >= 0 && !lifted
      ? Math.max(
          brakeOn,
          argLast(brakeOn, Math.min(hi, m + Math.round(30 / step)), (i) => brake[i] > 0.1),
        )
      : -1;
  let peakBrake = 0;
  let peakDecel = 0;
  let trail = 0;
  let lockSlip = Number.NaN;
  const hasSlip = 'slipRatio.FL' in c;
  if (brakeOff >= 0) {
    for (let i = brakeOn; i <= brakeOff; i++) {
      if (finite(brake[i])) peakBrake = Math.max(peakBrake, brake[i]);
      if (finite(longAcc[i]) && Math.abs(longAcc[i]) < 45)
        peakDecel = Math.max(peakDecel, -longAcc[i]);
      if (brake[i] > 0.05 && Math.abs(steer[i]) > 0.1) trail += step;
      if (hasSlip) {
        const worst = Math.min(
          c['slipRatio.FL'][i],
          c['slipRatio.FR'][i],
          c['slipRatio.RL'][i],
          c['slipRatio.RR'][i],
        );
        if (finite(worst)) lockSlip = Math.max(Number.isNaN(lockSlip) ? 0 : lockSlip, -worst);
      }
    }
  }
  let throttleOn = pedals
    ? argFirst(Math.min(m, brakeOff >= 0 ? brakeOff : m), hi, (i) => throttle[i] > 0.15 && !(brake[i] > 0.1))
    : m;
  if (throttleOn < 0) throttleOn = m;
  const hold = Math.max(1, Math.round(10 / step));
  let fullThrottle = pedals
    ? argFirst(throttleOn, hi, (i) => {
        for (let j = i; j < Math.min(hi, i + hold); j++) if (!(throttle[j] >= 0.95)) return false;
        return true;
      })
    : m;
  if (fullThrottle < 0) fullThrottle = hi;
  let coast = 0;
  const coastFrom = brakeOff >= 0 ? brakeOff : brakeOn >= 0 ? brakeOn : m;
  for (let i = coastFrom; i < throttleOn; i++)
    if (brake[i] < 0.05 && throttle[i] < 0.05) coast += step;
  let dips = 0;
  let runningMax = 0;
  for (let i = throttleOn; i <= fullThrottle; i++) {
    runningMax = Math.max(runningMax, throttle[i]);
    if (runningMax - throttle[i] > 0.25) {
      dips++;
      runningMax = throttle[i];
    }
  }
  // Grip used: from the brake release to full throttle, and at least 20 m
  // either side of the slowest point.
  let peakLat = 0;
  const m20 = Math.round(20 / step);
  const latFrom = Math.max(lo, Math.min(m, brakeOff >= 0 ? brakeOff : m) - m20);
  const latTo = Math.min(hi, Math.max(fullThrottle, m + m20));
  for (let i = latFrom; i <= latTo; i++) {
    if (finite(latAcc[i]) && Math.abs(latAcc[i]) < 45)
      peakLat = Math.max(peakLat, Math.abs(latAcc[i]));
  }
  let spinSlip = Number.NaN;
  let balance = Number.NaN;
  if (hasSlip) {
    const driven = drivenWheels(lap.lap);
    for (let i = throttleOn; i <= fullThrottle; i++) {
      for (const w of driven) {
        const v = c[`slipRatio.${w}`][i];
        if (finite(v)) spinSlip = Math.max(Number.isNaN(spinSlip) ? 0 : spinSlip, v);
      }
    }
    if ('slipAngle.FL' in c) {
      let sum = 0;
      let n = 0;
      for (let i = brakeOff >= 0 ? brakeOff : m; i <= throttleOn; i++) {
        const front = (Math.abs(c['slipAngle.FL'][i]) + Math.abs(c['slipAngle.FR'][i])) / 2;
        const rear = (Math.abs(c['slipAngle.RL'][i]) + Math.abs(c['slipAngle.RR'][i])) / 2;
        if (finite(front) && finite(rear)) {
          sum += front - rear;
          n++;
        }
      }
      balance = n ? sum / n : Number.NaN;
    }
  }
  // The straight after: how much of it at full throttle, and its longest lift.
  let full = 0;
  let total = 0;
  let liftFrom = -1;
  let liftTo = -1;
  const ranges: [number, number][] = [[fullThrottle, hi]];
  if (seg.wrap) ranges.push([Math.max(lap.first, seg.wrap[0]), Math.min(lap.last, seg.wrap[1])]);
  for (const [a, b] of ranges) {
    let run = -1;
    for (let i = a; i <= b + 1; i++) {
      const off = i <= b && pedals && !(throttle[i] >= 0.95);
      if (i <= b) {
        total++;
        if (!off) full++;
      }
      if (off && run < 0) run = i;
      if (!off && run >= 0) {
        if (i - 1 - run > liftTo - liftFrom) {
          liftFrom = run;
          liftTo = i - 1;
        }
        run = -1;
      }
    }
  }
  // Speed lost with the throttle down: from each high point, the lowest before
  // the throttle comes off or the speed recovers.
  // In the air and just after landing the speed falls for reasons of its own.
  const settled = grounded(c, c.time.length);
  let scrub = 0;
  let scrubFrom = -1;
  let scrubTo = -1;
  if (pedals) {
    let top = -1;
    for (let i = throttleOn; i <= hi; i++) {
      const down = throttle[i] >= 0.9 && !(brake[i] > 0.1) && settled[i] === 1;
      if (!down) {
        top = -1;
        continue;
      }
      if (top < 0 || speed[i] >= speed[top]) top = i;
      else if (speed[top] - speed[i] > scrub) {
        scrub = speed[top] - speed[i];
        scrubFrom = top;
        scrubTo = i;
      }
    }
  }
  // Rally: the car turned into the corner, the handbrake, the air.
  const beta = c.bodySlip;
  let entryDrift = Number.NaN;
  if (beta) {
    entryDrift = 0;
    for (let i = brakeOn >= 0 ? brakeOn : lo; i <= Math.min(hi, m + Math.round(5 / step)); i++)
      if (settled[i] && finite(beta[i])) entryDrift = Math.max(entryDrift, Math.abs(beta[i]));
  }
  const handbrake = c.handbrake;
  const handbrakeAt = handbrake ? argFirst(lo, Math.min(hi, m + Math.round(10 / step)), (i) => handbrake[i] > 0.2) : -1;
  const air = c.airborne;
  let airSeconds = 0;
  let airFrom = -1;
  let airTo = -1;
  if (air) {
    for (let i = lo; i <= hi; i++) {
      if (!(air[i] > 0.5)) continue;
      let j = i;
      while (j < hi && air[j + 1] > 0.5) j++;
      const flight = c.time[Math.min(hi, j + 1)] - c.time[i];
      if (finite(flight)) {
        airSeconds += flight;
        if (airFrom < 0 || flight > c.time[Math.min(hi, airTo + 1)] - c.time[airFrom]) {
          airFrom = i;
          airTo = j;
        }
      }
      i = j;
    }
  }
  return {
    brakeOn,
    brakeOff,
    lifted,
    brakeSpeed: brakeOn >= 0 ? speed[brakeOn] : speed[m],
    brakeMetres: brakeOn >= 0 ? (m - brakeOn) * step : 0,
    peakBrake,
    peakDecel,
    minSpeed: speed[m],
    minSpeedAt: m,
    throttleOn,
    fullThrottle,
    coastMetres: coast,
    trailMetres: trail,
    throttleDips: dips,
    peakLat,
    gearAtApex: gear[m],
    lockSlip,
    spinSlip,
    balance,
    straightFull: total ? full / total : 1,
    liftFrom,
    liftTo,
    scrub,
    scrubFrom,
    scrubTo,
    entryDrift,
    handbrakeAt,
    airSeconds,
    airFrom,
    airTo,
  };
}

/** Time one lap took more than another between grid indices, on the shared axis. */
function relative(lap: AlignedLap, other: AlignedLap) {
  const first = Math.max(lap.first, other.first);
  const last = Math.min(lap.last, other.last);
  const at = (i: number) => {
    const k = Math.max(first, Math.min(last, i));
    const v = lap.channels.delta[k] - other.channels.delta[k];
    return finite(v) ? v : 0;
  };
  return { first, last, at, span: (a: number, b: number) => at(b) - at(a) };
}

interface Pair {
  lap: AlignedLap;
  other: AlignedLap;
  mine: CornerMetrics;
  theirs: CornerMetrics;
  lineMine: LineMetrics | null;
  lineTheirs: LineMetrics | null;
  seg: Segment;
  car?: Envelope;
  otherCar?: Envelope;
  /** What kind of car each is. */
  profile?: CarProfile;
  otherProfile?: CarProfile;
  sameCar: boolean;
  step: number;
  /** The run across the line that continues this corner's straight, on a flying lap. */
  wrap?: [number, number];
  /** This lap's car-control faults in this corner that the other lap did not share. */
  faults: ControlEvent[];
  /** Where this car's tyres give their best and stop giving more. */
  tyres?: CarTyres;
  /** The ground this lap was on at its slowest point: the car's capabilities there are this ground's. */
  ground: Ground;
  /** Both laps through the corner before, for what was decided there. */
  before?: { label: string; mine: CornerMetrics; theirs: CornerMetrics };
}

/**
 * The time account of one corner: the net, where within it the lead turned,
 * and the straight's share from exit speed and from the car's pull.
 */
export function compareCorner(p: Pair): CornerResult {
  const { lap, other, mine, theirs, seg, car, step } = p;
  const rel = relative(lap, other);
  const start = Math.max(seg.start, rel.first);
  const end = Math.min(seg.end, rel.last);
  const wrap = p.wrap ? rel.span(Math.max(rel.first, p.wrap[0]), p.wrap[1]) : 0;
  const net = rel.span(start, end) + wrap;
  const r0 = rel.at(start);
  const rEnd = r0 + net;
  // Where the lead turned: the biggest swing inside the corner that the lap
  // then gave back, or won back.
  const firstBrake = Math.min(
    ...[mine.brakeOn, theirs.brakeOn, mine.minSpeedAt, theirs.minSpeedAt].filter((i) => i >= 0),
  );
  const wFrom = Math.max(start, firstBrake);
  const wTo = Math.min(end, Math.max(mine.fullThrottle, theirs.fullThrottle, mine.minSpeedAt, theirs.minSpeedAt));
  let hiI = wFrom;
  let loI = wFrom;
  for (let i = wFrom; i <= wTo; i++) {
    if (rel.at(i) > rel.at(hiI)) hiI = i;
    if (rel.at(i) < rel.at(loI)) loI = i;
  }
  const lostThenWon = Math.min(rel.at(hiI) - r0, rel.at(hiI) - rEnd);
  const wonThenLost = Math.min(r0 - rel.at(loI), rEnd - rel.at(loI));
  let split = Math.max(mine.minSpeedAt, theirs.minSpeedAt);
  if (lostThenWon > TRADE || wonThenLost > TRADE) split = lostThenWon >= wonThenLost ? hiI : loI;
  split = Math.max(start, Math.min(end, split));
  const toApex = rel.at(split) - r0;
  const fromApex = net - toApex;
  // Where both are flat out, the straight begins.
  const flatAt = Math.max(split, Math.min(end, Math.max(mine.fullThrottle, theirs.fullThrottle)));
  const exit = rel.at(flatAt) - rel.at(split);
  const straight = fromApex - exit;
  // What the speed where both were flat explains: see exitShare.
  const ranges: [number, number][] = [[flatAt, end]];
  if (p.wrap) ranges.push([Math.max(rel.first, p.wrap[0]), p.wrap[1]]);
  const metres = ranges.reduce((s, [a, b]) => s + (b - a) * step, 0);
  let byExit = exitShare(lap, other, ranges, step, car);
  if (!finite(byExit)) byExit = straight;
  const lifted = mine.straightFull < Math.min(0.9, theirs.straightFull - 0.05);
  const otherLifted = theirs.straightFull < Math.min(0.9, mine.straightFull - 0.05);
  const scrubbed = Math.abs(mine.scrub - theirs.scrub) > 1;
  // The exit speed explains at most what the straight cost - unless a lift or
  // speed scrubbed at full throttle took some of it back, which is then said.
  // Otherwise, when the measurement says more, the other car made some of it
  // back from equal speed, which is not this exit's.
  const clamp = (v: number, a: number, b: number) => Math.max(Math.min(a, b), Math.min(Math.max(a, b), v));
  if (!(lifted || otherLifted || scrubbed)) byExit = clamp(byExit, 0, straight);
  // A few hundredths of model error should not flip a sign.
  if (Math.sign(byExit) !== Math.sign(straight) && Math.abs(byExit) < 0.02) byExit = 0;
  // The two cars from the same speed, flat out as their envelopes say they
  // accelerate. What is left after exit speed and car is how the straight was
  // driven: a lift, speed scrubbed at full throttle.
  let byPower = 0;
  if (!p.sameCar && car && p.otherCar && metres > 0) {
    const v = other.channels.speed[flatAt];
    const power = flatOut(car, v, metres) - flatOut(p.otherCar, v, metres);
    if (finite(power)) byPower = clamp(power, 0, straight - byExit);
  }
  const part = net > 0 ? carShare(p, net, lifted ? 0 : byPower) : { power: 0, grip: 0, brakes: 0 };
  const carCost = Math.min(Math.max(0, net), part.power + part.grip + part.brakes);
  return {
    corner: seg.corner,
    againstId: other.lap.id,
    net,
    toApex,
    fromApex,
    split,
    exit,
    straight,
    byExit,
    byPower,
    driven: straight - byExit - byPower,
    lifted,
    otherLifted,
    carCost,
    car: part,
  };
}

/** A lap's speed and time over `ranges`, joined end to end. */
function stretch(lap: AlignedLap, ranges: [number, number][]): { v: number[]; t: number[] } {
  const v: number[] = [];
  const t: number[] = [];
  let clock = 0;
  for (const [a, b] of ranges) {
    for (let i = a; i <= b; i++) {
      // Across the join of two ranges - the line, on a circuit - no time passes.
      if (i > a) clock += lap.channels.time[i] - lap.channels.time[i - 1];
      v.push(lap.channels.speed[i]);
      t.push(clock);
    }
  }
  return { v, t };
}

/**
 * Of the time a lap lost (+) or gained (-) down a straight, what the speed at
 * its start explains.
 *
 * Measured, not modelled: the slower of the two cars passes through the
 * faster one's starting speed a little way down the straight, and from there
 * on its own trace is what it would have done had it started at that speed -
 * with its own gearing, drag and the road's slope in it. So the slower car's
 * trace, shifted back to where it reached the other's speed, is its time from
 * the faster start; the difference is the exit speed's cost. When the slower
 * car never gets there on this straight, its own acceleration is put back as
 * power instead (fromSpeed).
 */
function exitShare(
  lap: AlignedLap,
  other: AlignedLap,
  ranges: [number, number][],
  step: number,
  car?: Envelope,
): number {
  const mine = stretch(lap, ranges);
  const theirs = stretch(other, ranges);
  const n = mine.v.length;
  if (n < 3 || !finite(mine.v[0]) || !finite(theirs.v[0])) return Number.NaN;
  const slowerIsMine = mine.v[0] < theirs.v[0];
  const slow = slowerIsMine ? mine : theirs;
  const target = slowerIsMine ? theirs.v[0] : mine.v[0];
  let j = -1;
  for (let i = 1; i < n; i++) {
    if (slow.v[i] >= target) {
      j = i;
      break;
    }
  }
  if (j < 0 || j > n - 3) {
    if (!slowerIsMine) return Number.NaN;
    const own = mine.t[n - 1];
    return own - fromSpeed(lap, ranges, target, step, car);
  }
  // Where exactly it reached that speed, between samples j - 1 and j.
  const f = (target - slow.v[j - 1]) / Math.max(1e-6, slow.v[j] - slow.v[j - 1]);
  const at = j - 1 + f;
  const tAt = slow.t[j - 1] + f * (slow.t[j] - slow.t[j - 1]);
  const vEnd = Math.max(1, slow.v[n - 1]);
  // From the faster start: the rest of its own trace, then the metres it
  // would have had left at the speed it ended with.
  const fromFaster = slow.t[n - 1] - tAt + (at * step) / vEnd;
  const lost = slow.t[n - 1] - fromFaster;
  return slowerIsMine ? lost : -lost;
}

/**
 * Seconds a lap would have taken over `ranges` had it started them at `v0`.
 * Its own acceleration along this very stretch - turning, slope, gearing and
 * all - is put back as power (a·v held), so from a lower speed it accelerates
 * harder and from a higher one less, as a power-limited car does; never harder
 * than the car has shown it can at that speed.
 */
function fromSpeed(
  lap: AlignedLap,
  ranges: [number, number][],
  v0: number,
  step: number,
  env?: Envelope,
): number {
  const v = lap.channels.speed;
  let u = Math.max(1, v0);
  let t = 0;
  for (const [a, b] of ranges) {
    for (let i = a; i < b; i++) {
      const v1 = v[i];
      const v2 = v[i + 1];
      if (!finite(v1) || !finite(v2) || !finite(u)) return Number.NaN;
      const acc = (v2 * v2 - v1 * v1) / (2 * step);
      let next = acc;
      if (acc > 0) {
        const cap = env ? at(env.accel, u) : Number.NaN;
        next = Math.min((acc * (v1 + v2)) / 2 / u, finite(cap) ? Math.max(cap, acc) : 2 * acc);
      }
      const w = Math.sqrt(Math.max(1, u * u + 2 * next * step));
      t += (2 * step) / (u + w);
      u = w;
    }
  }
  return t;
}

/**
 * What of a loss the car explains, in seconds: its weaker pull down the
 * straight, a lower grip limit where it was at it, weaker brakes where it
 * braked as hard as it can.
 */
function carShare(p: Pair, net: number, byPower: number): CarPart {
  const { mine, theirs, car, otherCar, sameCar } = p;
  const part: CarPart = { power: 0, grip: 0, brakes: 0 };
  if (sameCar || !car || !otherCar) return part;
  part.power = Math.max(0, Math.min(net, byPower));
  let share = part.power;
  // Grip: the speed a radius allows grows with the square root of grip, so of
  // the lower minimum speed not explained by a tighter radius, the grip ratio
  // explains its share - when the car was at its limit.
  const gripMine = at(car.lateral, mine.minSpeed);
  const gripTheirs = at(otherCar.lateral, mine.minSpeed);
  const middle = middleSplit(p);
  if (
    middle &&
    finite(gripMine) &&
    Math.max(middle.latMine, mine.peakLat) >= 0.9 * gripMine &&
    gripTheirs > 1.05 * gripMine
  ) {
    const explained = Math.log(Math.sqrt(gripTheirs / gripMine)) / Math.log(theirs.minSpeed / mine.minSpeed);
    const share0 = Math.max(0, Math.min(1 - middle.byRadius, explained));
    part.grip = share0 * Math.max(0, net - share);
    share += part.grip;
  }
  // Brakes: from speed u down to v at deceleration a, ending at the same
  // point, costs (1/a1 - 1/a2)(u - v)^2 / 2u against a car that brakes at a2 -
  // but only if this lap braked about as hard as its car can, on average over
  // the zone, rather than just touching that peak.
  const aMine = at(car.braking, mine.brakeSpeed);
  const aTheirs = at(otherCar.braking, mine.brakeSpeed);
  const u = mine.brakeSpeed;
  const v = mine.minSpeed;
  const average = mine.brakeMetres > 0 ? (u * u - v * v) / (2 * mine.brakeMetres) : 0;
  if (
    mine.brakeOn >= 0 &&
    !mine.lifted &&
    finite(aMine) &&
    finite(aTheirs) &&
    aTheirs > 1.05 * aMine &&
    average >= 0.8 * aMine &&
    u > v
  ) {
    part.brakes = Math.max(0, Math.min(net - share, ((1 / aMine - 1 / aTheirs) * (u - v) ** 2) / (2 * u)));
  }
  return part;
}

// ---------------------------------------------------------------- the words


/** A driven line in words: its shape and its apex, as what a lap "drove". */
function shapeWords(l: LineMetrics): string {
  return t('race.shape', { shape: l.shape, apex: l.apex });
}

/** Everything the text needs about one pair through one corner. */
interface Facts {
  me: string;
  them: string;
  t: string;
  next: string;
  step: number;
  /** Metres this lap braked earlier (negative: later). NaN when either went flat. */
  earlier: number;
  flatLater: number;
  throttleLater: number;
  /** How much longer than the other it took from its own slowest point to throttle, and to full. */
  throttleWait: number;
  flatWait: number;
  /** Metres further inside at turn-in, at the tightest point and where both were flat. */
  inTurnIn: number;
  inApex: number;
  inExit: number;
  metres: number;
}

function facts(p: Pair, r: CornerResult, names: Map<string, string>, next: string): Facts {
  const { mine, theirs, lineMine, lineTheirs, seg, step } = p;
  const at = (i: number) => insideOf(p.lap, p.other, i, seg.window);
  const turnIn =
    lineMine && lineTheirs ? Math.min(lineMine.turnIn, lineTheirs.turnIn) : seg.window.from;
  const apex =
    lineMine && lineTheirs
      ? Math.round((lineMine.tightest + lineTheirs.tightest) / 2)
      : Math.round((mine.minSpeedAt + theirs.minSpeedAt) / 2);
  const flatAt = Math.max(r.split, Math.min(seg.end, Math.max(mine.fullThrottle, theirs.fullThrottle)));
  return {
    me: names.get(p.lap.lap.id)!,
    them: names.get(p.other.lap.id)!,
    t: seg.label,
    next,
    step,
    earlier:
      mine.brakeOn >= 0 && theirs.brakeOn >= 0 ? (theirs.brakeOn - mine.brakeOn) * step : Number.NaN,
    flatLater: (mine.fullThrottle - theirs.fullThrottle) * step,
    throttleLater: (mine.throttleOn - theirs.throttleOn) * step,
    throttleWait:
      (mine.throttleOn - mine.minSpeedAt - (theirs.throttleOn - theirs.minSpeedAt)) * step,
    flatWait:
      (mine.fullThrottle - mine.minSpeedAt - (theirs.fullThrottle - theirs.minSpeedAt)) * step,
    inTurnIn: at(turnIn),
    inApex: at(apex),
    inExit: at(flatAt),
    metres: (seg.end - flatAt) * step + (p.wrap ? (p.wrap[1] - p.wrap[0]) * step : 0),
  };
}

/** The measurements, one line each, naming both laps every time. */
function detailLines(p: Pair, r: CornerResult, f: Facts): string[] {
  const { mine, theirs, lineMine, lineTheirs } = p;
  const m = (i: number) => num(Math.round(i * f.step));
  const out: string[] = [];
  if (mine.brakeOn >= 0 || theirs.brakeOn >= 0) {
    const part = (name: string, c: CornerMetrics) =>
      c.brakeOn >= 0
        ? t('race.detail.brakePart', { name, lifted: c.lifted ? 'yes' : 'no', at: m(c.brakeOn), speed: num(c.brakeSpeed * KMH) })
        : t('race.detail.brakeFlat', { name });
    const gap = finite(f.earlier) && Math.abs(f.earlier) >= METRES ? num(Math.abs(f.earlier)) : 'none';
    out.push(
      t('race.detail.braking', { mine: part(f.me, mine), theirs: part(f.them, theirs), me: f.me, gap, dir: f.earlier > 0 ? 'earlier' : 'later' }),
    );
  }
  out.push(
    t('race.detail.slowest', {
      me: f.me,
      them: f.them,
      vMine: num(mine.minSpeed * KMH),
      atMine: m(mine.minSpeedAt),
      vTheirs: num(theirs.minSpeed * KMH),
      atTheirs: m(theirs.minSpeedAt),
    }),
  );
  out.push(
    t('race.detail.flat', {
      me: f.me,
      them: f.them,
      mine: m(mine.fullThrottle),
      theirs: m(theirs.fullThrottle),
      gap: Math.abs(f.flatLater) >= METRES ? num(Math.abs(f.flatLater)) : 'none',
      dir: f.flatLater > 0 ? 'later' : 'sooner',
    }),
  );
  if (lineMine && lineTheirs) {
    const side = (v: number, where: string) =>
      finite(v) && Math.abs(v) >= 1
        ? t('race.detail.offset', { metres: num(Math.abs(v), 1), side: v > 0 ? 'inside' : 'outside', them: f.them, where })
        : null;
    const offsets = [side(f.inTurnIn, 'turnIn'), side(f.inApex, 'apex'), side(f.inExit, 'flat')].filter((s): s is string => !!s);
    const turn = (lineTheirs.turnIn - lineMine.turnIn) * f.step;
    out.push(
      t('race.detail.line', {
        me: f.me,
        them: f.them,
        turn: Math.abs(turn) >= 8 ? num(Math.abs(turn)) : 'none',
        turnDir: turn > 0 ? 'earlier' : 'later',
        rMine: num(lineMine.radiusMin),
        rTheirs: num(lineTheirs.radiusMin),
        offsets: offsets.length ? list(offsets, 'unit') : 'none',
        shapeMine: shapeWords(lineMine),
        shapeTheirs: shapeWords(lineTheirs),
      }),
    );
  }
  if (f.metres > 20 && Math.abs(r.straight) >= 0.01) {
    const flatAt = Math.max(r.split, Math.min(p.seg.end, Math.max(mine.fullThrottle, theirs.fullThrottle)));
    const vMine = p.lap.channels.speed[flatAt];
    const vTheirs = p.other.channels.speed[flatAt];
    // Each part, signed the way the straight went: parts that went the
    // other way are said as won back.
    const sign = r.straight >= 0 ? 1 : -1;
    // The rest belongs to whichever lap it went against.
    const owner = r.driven > 0 ? { who: f.me, m: mine, lift: r.lifted } : { who: f.them, m: theirs, lift: r.otherLifted };
    const otherM = r.driven > 0 ? theirs : mine;
    const parts: [number, string][] = [
      [r.byExit, t('race.detail.what.start')],
      [r.byPower, p.sameCar ? '' : t('race.detail.what.pull', { name: r.byPower > 0 ? f.them : f.me })],
      [
        r.driven,
        owner.lift
          ? t('race.detail.what.lift', { name: owner.who })
          : owner.m.scrub > otherM.scrub + 1
            ? t('race.detail.what.scrub', { name: owner.who })
            : t('race.detail.what.driven'),
      ],
    ];
    const along = parts
      .filter(([v, w]) => w && Math.abs(v) >= 0.02 && Math.sign(v) === sign)
      .map(([v, w]) => t('race.detail.partFrom', { s: num(Math.abs(v), 2), what: w }));
    const against = parts
      .filter(([v, w]) => w && Math.abs(v) >= 0.02 && Math.sign(v) !== sign)
      .map(([v, w]) => t('race.detail.partBack', { s: num(Math.abs(v), 2), what: w }));
    const said = [...along, ...against];
    out.push(
      t('race.detail.straight', {
        next: f.next,
        metres: num(f.metres),
        me: f.me,
        them: f.them,
        vMine: num(vMine * KMH),
        vTheirs: num(vTheirs * KMH),
        dir: r.straight >= 0 ? 'lost' : 'gained',
        s: num(Math.abs(r.straight), 2),
        parts: said.length ? list(said, 'unit') : 'none',
      }),
    );
  }
  if (r.carCost >= 0.02) {
    const parts = [
      r.car.power >= 0.01 ? t('race.detail.carPull', { s: num(r.car.power, 2) }) : '',
      r.car.grip >= 0.01 ? t('race.detail.carGrip', { s: num(r.car.grip, 2) }) : '',
      r.car.brakes >= 0.01 ? t('race.detail.carBrakes', { s: num(r.car.brakes, 2) }) : '',
    ].filter(Boolean);
    out.push(
      t('race.detail.car', { car: num(r.carCost, 2), net: num(Math.abs(r.net), 2), me: f.me, them: f.them, parts: list(parts, 'unit') }),
    );
  }
  return out;
}

/** What the corner's time did: the verdict line. */
function verdict(r: CornerResult, f: Facts): string {
  const values = {
    corner: f.t,
    next: f.next,
    me: f.me,
    them: f.them,
    dir: r.net > 0 ? 'lost' : 'gained',
    net: num(Math.abs(r.net), 2),
    toApex: num(Math.abs(r.toApex), 2),
    fromApex: num(Math.abs(r.fromApex), 2),
  };
  if (Math.abs(r.toApex) >= TRADE && Math.abs(r.fromApex) >= TRADE && Math.sign(r.toApex) !== Math.sign(r.fromApex)) {
    return t('race.verdict.trade', { ...values, lead: r.toApex > 0 ? 'behind' : 'ahead', after: r.fromApex > 0 ? 'lost' : 'wonBack' });
  }
  return t('race.verdict.plain', values);
}

/** The shape of line that suits this lap's car here, and what it drove. */
function lineText(p: Pair, f: Facts): string {
  const { mine, seg, car, lineMine } = p;
  const vExit = p.lap.channels.speed[Math.min(seg.end, mine.fullThrottle)];
  const advice = lineFor(
    seg.type,
    character(car, mine.minSpeed, vExit, p.lap.lap.car.drivetrain, p.ground),
    mine.minSpeed,
    p.ground,
  );
  const lead = t('race.lineText.lead', { type: seg.type, corner: f.t, before: num(seg.before), after: num(seg.after) });
  if (!lineMine) return `${lead} ${advice.text}`;
  // Where on the turn the car was slowest says as much about the line as its
  // shape: slowest before the middle and flat from there is slow in, fast out
  // however round the path.
  const speed = speedApex(mine, lineMine, p.step);
  const exitFirst = lineMine.apex === 'late' || speed === 'early';
  const miss =
    advice.apex === 'late' && !exitFirst && (lineMine.apex === 'early' || speed === 'late')
      ? speed === 'late'
        ? 'slowLate'
        : 'earlyApex'
      : advice.shape === 'V' && lineMine.shape === 'U' && !exitFirst
        ? 'round'
        : advice.shape === 'U' && lineMine.shape === 'V'
          ? 'square'
          : 'fits';
  const drove = t('race.lineText.drove', {
    me: f.me,
    shape: shapeWords(lineMine),
    speed,
    before: num(Math.round((lineMine.middle - mine.minSpeedAt) * p.step)),
    past: num(Math.round((mine.minSpeedAt - lineMine.middle) * p.step)),
    miss,
  });
  return `${lead} ${advice.text} ${drove}`;
}

/**
 * Where on the turn a lap was slowest, against the half-way point of its own
 * heading change: early (slow in, fast out), late (fast in, still slowing past
 * the middle) or about the middle.
 */
export function speedApex(m: CornerMetrics, l: LineMetrics, step: number): 'early' | 'middle' | 'late' {
  const d = (m.minSpeedAt - l.middle) * step;
  if (d < -15) return 'early';
  if (d > 15) return 'late';
  return 'middle';
}

// ---------------------------------------------------------------- the rules

interface Cause {
  kind: FindingKind;
  phase: Phase;
  /** What happened, without the corner it happened in. */
  what: string;
  tip: string;
  from: number;
  to: number;
  basis: Finding['basis'];
  source: Finding['source'];
}

/** A cause's title: the corner, and what happened in it. */
function titled(f: Facts, what: string): string {
  return t('race.title.corner', { corner: f.t, what });
}

/**
 * Why a lap was slower through the middle, in the terms of v^2 = a R: the part
 * of the lower minimum speed that the smaller radius explains, and the part
 * that less lateral acceleration does - and of that, whether the car was at
 * its limit.
 */
export interface MiddleSplit {
  radiusMine: number;
  radiusTheirs: number;
  /** Lateral acceleration used at the slowest point, m/s², from v^2 / R. */
  latMine: number;
  latTheirs: number;
  /** Share of the speed difference the radius explains, 0..1. */
  byRadius: number;
}

export function middleSplit(p: Pair): MiddleSplit | null {
  const { mine, theirs, step } = p;
  if (!(mine.minSpeed < theirs.minSpeed - 0.5)) return null;
  const rMine = radiusAt(p.lap, mine.minSpeedAt, step);
  const rTheirs = radiusAt(p.other, theirs.minSpeedAt, step);
  if (!finite(rMine) || !finite(rTheirs) || rMine <= 0 || rTheirs <= 0) return null;
  const total = Math.log(theirs.minSpeed / mine.minSpeed);
  const byRadius = Math.max(0, Math.min(1, (0.5 * Math.log(rTheirs / rMine)) / total));
  return {
    radiusMine: rMine,
    radiusTheirs: rTheirs,
    latMine: mine.minSpeed ** 2 / rMine,
    latTheirs: theirs.minSpeed ** 2 / rTheirs,
    byRadius,
  };
}

const FAULT_KIND: Record<string, FindingKind> = {
  lock: 'locks',
  wheelspin: 'wheelspin',
  oversteer: 'oversteer',
  spin: 'incident',
  understeer: 'understeer',
  hit: 'incident',
  crash: 'incident',
};

const struck = (e: ControlEvent) => e.kind === 'hit' || e.kind === 'crash';

/** A car-control fault as the cause of a corner's loss. */
function faultCause(p: Pair, f: Facts, e: ControlEvent): Cause {
  const said = describeEvent(e, f.me, f.them, p.lap.lap, p.step);
  const phase: Phase = struck(e)
    ? e.from > p.mine.minSpeedAt
      ? 'exit'
      : 'entry'
    : e.kind === 'lock'
      ? 'braking'
      : e.kind === 'wheelspin' || e.pedal === 'throttle'
        ? 'exit'
        : 'entry';
  // A lock that came with an early brake point: one story - the locked wheels
  // stop worse, so the lap needed the longer zone.
  const early =
    e.kind === 'lock' && finite(f.earlier) && f.earlier > METRES
      ? ` ${t('race.cause.lockEarly', { me: f.me, them: f.them, metres: num(f.earlier) })}`
      : '';
  const cost = e.cost >= 0.02 ? ` ${t(struck(e) ? 'race.cause.costRecovered' : 'race.cause.cost40', { s: num(e.cost, 2) })}` : '';
  return {
    kind: FAULT_KIND[e.kind] ?? 'overslows',
    phase,
    what: said.what,
    tip: `${said.tip}${cost}${early}`,
    from: e.from,
    to: e.to,
    basis: e.kind === 'oversteer' || e.kind === 'spin' ? 'comparison' : 'tyres',
    source: 'driver',
  };
}

/** Why a lap came out of a corner's first half behind. */
function entryCause(p: Pair, f: Facts): Cause {
  const { mine, theirs, car, otherCar, sameCar, step } = p;
  const hasTyres = !Number.isNaN(mine.lockSlip);
  const around = (i: number, m: number) =>
    [i - Math.round(m / step), i + Math.round(m / step)] as [number, number];
  const decelOwn = car && finite(mine.brakeSpeed) ? at(car.braking, mine.brakeSpeed) : Number.NaN;
  const decelRef = otherCar && finite(mine.brakeSpeed) ? at(otherCar.braking, mine.brakeSpeed) : Number.NaN;
  const gripOwn = car ? at(car.lateral, mine.minSpeed) : Number.NaN;
  const gripRef = otherCar ? at(otherCar.lateral, mine.minSpeed) : Number.NaN;
  const slowerMiddle = mine.minSpeed < theirs.minSpeed - 0.5;
  const zone = [Math.max(0, mine.brakeOn), mine.brakeOff >= 0 ? mine.brakeOff : mine.minSpeedAt] as [number, number];
  const v = (x: number) => num(x * KMH);
  const m = (i: number) => num(Math.round(i * step));
  const who = { me: f.me, them: f.them };
  // A near-stop: far below even what this car's grip allows where the other
  // car went through (speed on a radius grows with the root of grip).
  const expected =
    !sameCar && finite(gripOwn) && finite(gripRef) && gripRef > gripOwn
      ? theirs.minSpeed * Math.sqrt(gripOwn / gripRef)
      : theirs.minSpeed;
  // A hit or a crash on the way in is the story, whatever else happened.
  const impact = p.faults.find((e) => struck(e) && e.from <= mine.minSpeedAt + Math.round(10 / step));
  if (impact) return faultCause(p, f, impact);
  if (mine.minSpeed < 0.6 * expected && theirs.minSpeed > 8) {
    const [from, to] = around(mine.minSpeedAt, 30);
    return {
      kind: 'incident',
      phase: 'entry',
      what: t('race.cause.nearStop', { ...who, mine: v(mine.minSpeed), theirs: v(theirs.minSpeed) }),
      tip: t('race.cause.nearStopTip', { ...who, mine: v(mine.minSpeed), theirs: v(theirs.minSpeed), at: m(mine.minSpeedAt) }),
      from,
      to,
      basis: 'comparison',
      source: 'driver',
    };
  }
  // Car control first: a fault in this half that the other lap did not make.
  const entryFault = p.faults.find(
    (e) =>
      e.from <= mine.minSpeedAt + Math.round(10 / step) &&
      (e.kind === 'lock' ||
        e.kind === 'understeer' ||
        e.kind === 'spin' ||
        (e.kind === 'oversteer' && e.pedal !== 'throttle')),
  );
  if (entryFault) return faultCause(p, f, entryFault);
  const flight = jumpCause(p, f);
  if (flight && flight.phase === 'entry') return flight;
  if (mine.lifted && (theirs.brakeOn < 0 || (theirs.lifted && theirs.brakeOn > mine.brakeOn + METRES / step))) {
    const flat = theirs.brakeOn < 0 ? 'yes' : 'no';
    return {
      kind: 'lifts',
      phase: 'braking',
      what: t('race.cause.lifted', { ...who, flat }),
      tip: t('race.cause.liftedTip', { ...who, flat, at: m(mine.brakeOn), theirsAt: m(theirs.brakeOn), diff: v(theirs.minSpeed - mine.minSpeed) }),
      from: mine.brakeOn,
      to: mine.minSpeedAt,
      basis: 'comparison',
      source: 'driver',
    };
  }
  if (!mine.lifted && mine.brakeOn >= 0 && (theirs.brakeOn < 0 || theirs.lifted) && mine.minSpeed < theirs.minSpeed - 0.5) {
    const flat = theirs.brakeOn < 0 ? 'yes' : 'no';
    return {
      kind: 'overslows',
      phase: 'braking',
      what: t('race.cause.brakedForLift', { ...who, flat }),
      tip: t('race.cause.brakedForLiftTip', { ...who, flat, at: m(mine.brakeOn), mine: v(mine.minSpeed), theirs: v(theirs.minSpeed) }),
      from: mine.brakeOn,
      to: mine.minSpeedAt,
      basis: 'comparison',
      source: 'driver',
    };
  }
  // Braking gently makes a lap brake early: the cause, when the other lap
  // braked clearly harder and this car had grip to spare.
  const ground = mine.brakeOn >= 0 ? groundAt(p.lap.channels, p.lap.lap, mine.brakeOn) : 'tarmac';
  const brakes = p.tyres?.[ground].braking;
  const roomToBrake =
    hasTyres && brakes?.measured
      ? mine.lockSlip / slipScale(p.lap.lap, ground).ratio < 0.6 * brakes.best
      : finite(decelOwn) && mine.peakDecel > 0 && mine.peakDecel < 0.85 * decelOwn;
  if (
    !mine.lifted &&
    mine.brakeOn >= 0 &&
    roomToBrake &&
    mine.peakBrake < 0.95 &&
    theirs.peakDecel > 1.15 * mine.peakDecel
  ) {
    return {
      kind: 'brakes-gently',
      phase: 'braking',
      what: t('race.cause.brakedGently', who),
      tip: hasTyres
        ? t('race.cause.brakedGentlyTyres')
        : t('race.cause.brakedGentlyTip', { ...who, peak: num(mine.peakDecel, 1), own: num(decelOwn, 1) }),
      from: zone[0],
      to: zone[1],
      basis: hasTyres ? 'tyres' : 'envelope',
      source: 'driver',
    };
  }
  if (finite(f.earlier) && f.earlier > METRES) {
    // A car with weaker brakes has to brake earlier: only more than its own
    // stopping distance needs is the driver's.
    const needed =
      finite(decelOwn) && decelOwn > 1
        ? Math.max(0, mine.brakeSpeed ** 2 - mine.minSpeed ** 2) / (2 * decelOwn)
        : Number.NaN;
    // In the same car the other lap's braking point says it all; in another,
    // what this car needs to get down to its speed by where the corner needs it.
    const toCorner = (Math.max(mine.minSpeedAt, theirs.minSpeedAt) - mine.brakeOn) * step;
    const spare = sameCar || !finite(needed) ? f.earlier : toCorner - needed;
    const weaker = !sameCar && finite(decelRef) && finite(decelOwn) && decelRef > 1.05 * decelOwn;
    if (weaker && !(spare > 10)) {
      return {
        kind: 'car-braking',
        phase: 'braking',
        what: t('race.cause.carBrakes', who),
        tip: t('race.cause.carBrakesTip', { ...who, own: num(decelOwn, 1), speed: v(mine.brakeSpeed), theirs: num(decelRef, 1) }),
        from: zone[0],
        to: zone[1],
        basis: 'envelope',
        source: 'car',
      };
    }
    return {
      kind: 'brakes-early',
      phase: 'braking',
      what: t('race.cause.brakedEarly', { ...who, metres: num(f.earlier) }),
      tip:
        !sameCar && finite(needed)
          ? t('race.cause.brakedEarlyTipCar', {
              ...who,
              metres: num(Math.min(f.earlier, Math.max(METRES, spare))),
              decel: num(decelOwn, 1),
              from: v(mine.brakeSpeed),
              to: v(mine.minSpeed),
              needed: num(needed),
              used: num(toCorner),
            })
          : t('race.cause.brakedEarlyTip', { metres: num(Math.min(f.earlier, Math.max(METRES, spare))) }),
      from: mine.brakeOn,
      to: theirs.brakeOn,
      basis: finite(needed) ? 'envelope' : 'comparison',
      source: 'driver',
    };
  }
  if (mine.coastMetres > 10 && mine.coastMetres > theirs.coastMetres + 5) {
    return {
      kind: 'coasts',
      phase: 'entry',
      what: t('race.cause.coasted', { ...who, metres: num(mine.coastMetres) }),
      tip: t('race.cause.coastedTip', { ...who, mine: num(mine.coastMetres), theirs: num(theirs.coastMetres) }),
      from: mine.brakeOff >= 0 ? mine.brakeOff : mine.minSpeedAt,
      to: mine.throttleOn,
      basis: 'comparison',
      source: 'driver',
    };
  }
  const middle = middleSplit(p);
  if (slowerMiddle && middle) {
    const [from, to] = around(mine.minSpeedAt, 20);
    const diff = v(theirs.minSpeed - mine.minSpeed);
    if (middle.byRadius >= 0.5) {
      return {
        kind: 'tight-line',
        phase: 'entry',
        what: t('race.cause.tightLine', { ...who, diff }),
        tip: t('race.cause.tightLineTip', {
          ...who,
          diff,
          rMine: num(middle.radiusMine),
          rTheirs: num(middle.radiusTheirs),
          share: num(middle.byRadius * 100),
        }),
        from,
        to,
        basis: 'comparison',
        source: 'driver',
      };
    }
    // Less lateral acceleration on a similar radius: at the car's limit, or
    // not. A car sliding through it is past its limit, whatever the path's
    // curve says: the speed over the radius is what it kept, not what the
    // tyres were asked for.
    const limit = finite(gripOwn) ? gripOwn : Number.NaN;
    const slid = finite(mine.entryDrift) && mine.entryDrift > SLIDING[p.ground];
    const atLimit = slid || (finite(limit) && Math.max(middle.latMine, mine.peakLat) >= 0.9 * limit);
    if (atLimit && !sameCar && finite(gripRef) && finite(gripOwn) && gripRef > 1.05 * gripOwn) {
      return {
        kind: 'car-grip',
        phase: 'entry',
        what: t('race.cause.carGrip', who),
        tip: t('race.cause.carGripTip', {
          ...who,
          slid: slid ? 'yes' : 'no',
          drift: deg(mine.entryDrift),
          lat: num(middle.latMine, 1),
          own: num(gripOwn, 1),
          speed: v(mine.minSpeed),
          theirs: num(gripRef, 1),
        }),
        from,
        to,
        basis: 'envelope',
        source: 'car',
      };
    }
    if (slid && (!finite(theirs.entryDrift) || theirs.entryDrift < mine.entryDrift - ROTATION_GAP / 2)) {
      // Sideways through the middle: past the grip, not short of it.
      const pr = p.profile;
      const op = p.otherProfile;
      const loose = !sameCar && !!pr && !!op && finite(pr.rearSlides) && finite(op.rearSlides) && pr.rearSlides >= op.rearSlides + 1;
      return {
        kind: 'oversteer',
        phase: 'entry',
        what: t('race.cause.sideways', { ...who, diff }),
        tip: `${t('race.cause.sidewaysTip', { ...who, drift: deg(mine.entryDrift), theirs: finite(theirs.entryDrift) ? deg(theirs.entryDrift) : 'none' })}${
          loose ? ` ${t('race.cause.sidewaysLoose', { ...who, mine: num(pr!.rearSlides, 1), theirs: num(op!.rearSlides, 1) })}` : ''
        }`,
        from,
        to,
        basis: 'comparison',
        source: loose ? 'car' : 'driver',
      };
    }
    // In another car: what this one holds, against what the other holds,
    // allows on the other's line. Within a km/h of it, the gap is the car.
    const pr = p.profile;
    const op = p.otherProfile;
    if (!sameCar && pr && op && finite(pr.grip) && finite(op.grip) && pr.grip < 0.96 * op.grip) {
      const can = theirs.minSpeed * Math.sqrt(pr.grip / op.grip);
      if (mine.minSpeed >= can - 1) {
        return {
          kind: 'car-grip',
          phase: 'entry',
          what: t('race.cause.carGrip', who),
          tip: t('race.cause.carGripProfileTip', {
            ...who,
            mine: num(pr.grip, 1),
            theirs: num(op.grip, 1),
            can: v(can),
            carried: v(theirs.minSpeed),
            own: v(mine.minSpeed),
          }),
          from,
          to,
          basis: 'envelope',
          source: 'car',
        };
      }
    }
    // Grip to spare - though in a car whose rear lets go before its grip is
    // used up, only some of it is there to take.
    const early =
      pr && finite(pr.letsGo) && finite(pr.grip) && pr.letsGo < 0.85 && middle.latMine >= 0.8 * pr.letsGo * pr.grip
        ? ` ${t('race.cause.spareLetsGo', { from: num(pr.letsGo * pr.grip, 1), slides: num(pr.rearSlides, 1) })}`
        : '';
    return {
      kind: 'overslows',
      phase: 'entry',
      what: t('race.cause.slowMiddle', { ...who, diff }),
      tip: `${t('race.cause.spareTip', {
        ...who,
        mine: num(middle.latMine, 1),
        theirs: num(middle.latTheirs, 1),
        limit: finite(limit) ? num(limit, 1) : 'none',
      })}${early}`,
      from,
      to,
      basis: finite(limit) ? 'envelope' : 'comparison',
      source: 'driver',
    };
  }
  if (mine.brakeSpeed < theirs.brakeSpeed - 1 && !(finite(f.earlier) && f.earlier > METRES)) {
    // A longer flight in the corner before lands slower, and a car short of
    // power does not win it back before the next braking zone.
    const b = p.before;
    const landed = !!b && b.mine.airFrom >= 0 && b.mine.airSeconds >= b.theirs.airSeconds + 0.2;
    return {
      kind: 'slower-arrival',
      phase: 'braking',
      what: t('race.cause.slowerArrival', { ...who, diff: v(theirs.brakeSpeed - mine.brakeSpeed) }),
      tip: landed
        ? t('race.cause.slowerArrivalFlight', { mine: v(mine.brakeSpeed), theirs: v(theirs.brakeSpeed), at: m(b!.mine.airFrom), corner: b!.label })
        : t('race.cause.slowerArrivalTip', { mine: v(mine.brakeSpeed), theirs: v(theirs.brakeSpeed) }),
      from: Math.max(0, Math.min(mine.brakeOn, theirs.brakeOn)),
      to: Math.max(mine.brakeOn, theirs.brakeOn),
      basis: 'comparison',
      source: sameCar ? 'driver' : 'car',
    };
  }
  const [from, to] = around(mine.minSpeedAt, 20);
  return {
    kind: 'overslows',
    phase: 'entry',
    what: t('race.cause.slowerToApex', who),
    tip: t('race.cause.slowerToApexTip'),
    from,
    to,
    basis: 'comparison',
    source: 'driver',
  };
}

const deg = (rad: number) => t('race.unit.deg', { v: num((rad * 180) / Math.PI) });
/** Drift past this is sliding, for every car alike: see profile.ts. */
const SLIDING: Record<Ground, number> = { tarmac: (10 * Math.PI) / 180, loose: (20 * Math.PI) / 180 };
/** Drift angle on the way in that counts as having turned the car, and the gap that counts as a difference. */
const ROTATED = (12 * Math.PI) / 180;
const ROTATION_GAP = (8 * Math.PI) / 180;

/**
 * On loose ground a corner is driven by turning the car on the way in - a
 * lift, a dab of the left-foot brake, a flick, the handbrake in a hairpin -
 * so that it points at the exit before the apex and the power goes down
 * early. A lap that turned it clearly less than the other and got on the power
 * later did not; one that turned it clearly more and still got on the power
 * later turned it too far and had to wait for it. See docs/race-analytics.md,
 * "Rally".
 */
function rotationCause(p: Pair, f: Facts): Cause | null {
  const { mine, theirs, step } = p;
  if (p.ground !== 'loose' || !finite(mine.entryDrift) || !finite(theirs.entryDrift)) return null;
  const later = f.throttleLater > METRES ? f.throttleLater : f.flatLater > METRES ? f.flatLater : 0;
  if (!later) return null;
  const what = f.throttleLater > METRES ? 'power' : 'flat';
  const from = mine.brakeOn >= 0 ? mine.brakeOn : Math.max(0, mine.minSpeedAt - Math.round(30 / step));
  const to = Math.max(mine.throttleOn, mine.minSpeedAt);
  const m = (i: number) => num(Math.round(i * step));
  if (theirs.entryDrift >= ROTATED && theirs.entryDrift >= mine.entryDrift + ROTATION_GAP) {
    const how = theirs.handbrakeAt >= 0 && mine.handbrakeAt < 0 ? 'handbrake' : mine.minSpeed < 15 ? 'tight' : 'none';
    return {
      kind: 'rotation',
      phase: 'entry',
      what: t('race.cause.rotationLess', { me: f.me }),
      tip: t('race.cause.rotationLessTip', {
        me: f.me,
        them: f.them,
        theirs: deg(theirs.entryDrift),
        mine: deg(mine.entryDrift),
        what,
        later: num(later),
        how,
        at: m(theirs.handbrakeAt),
      }),
      from,
      to,
      basis: 'comparison',
      source: 'driver',
    };
  }
  if (mine.entryDrift >= ROTATED && mine.entryDrift >= theirs.entryDrift + ROTATION_GAP + ROTATION_GAP / 2) {
    return {
      kind: 'rotation',
      phase: 'entry',
      what: t('race.cause.rotationMore', { me: f.me }),
      tip: t('race.cause.rotationMoreTip', {
        them: f.them,
        mine: deg(mine.entryDrift),
        theirs: deg(theirs.entryDrift),
        what,
        later: num(later),
        handbrake: mine.handbrakeAt >= 0 ? 'yes' : 'no',
      }),
      from,
      to,
      basis: 'comparison',
      source: 'driver',
    };
  }
  return null;
}

/**
 * A longer flight than the other lap's, and the time it cost from just before
 * it to 40 m after the landing: in the air the car can neither turn, brake nor
 * drive, and the landing takes speed. Null when it was not longer, or cost
 * nothing.
 */
function jumpCause(p: Pair, f: Facts): (Cause & { cost: number }) | null {
  const { mine, theirs, step } = p;
  if (mine.airFrom < 0 || !(mine.airSeconds >= theirs.airSeconds + 0.2)) return null;
  const rel = relative(p.lap, p.other);
  const from = Math.max(rel.first, mine.airFrom - Math.round(10 / step));
  const to = Math.min(rel.last, p.seg.end, mine.airTo + Math.round(40 / step));
  const cost = rel.span(from, to);
  if (!(cost >= 0.03)) return null;
  const before = mine.airFrom < mine.minSpeedAt;
  return {
    kind: 'jump',
    phase: before ? 'entry' : 'straight',
    what: t('race.cause.jump', { me: f.me, them: f.them, mine: num(mine.airSeconds, 1), theirs: num(theirs.airSeconds, 1) }),
    tip: t('race.cause.jumpTip', {
      them: f.them,
      from: num(Math.round(mine.airFrom * step)),
      to: num(Math.round(mine.airTo * step)),
      longer: num(mine.airSeconds - theirs.airSeconds, 1),
      s: num(Math.abs(cost), 2),
      before: before ? 'yes' : 'no',
    }),
    from,
    to,
    basis: 'comparison',
    source: 'driver',
    cost,
  };
}

/** Why a lap came out of a corner's second half behind. */
function exitCause(p: Pair, r: CornerResult, f: Facts): Cause {
  const { mine, theirs, car, otherCar, sameCar, step } = p;
  const m = (i: number) => num(Math.round(i * step));
  const who = { me: f.me, them: f.them };
  const gear =
    finite(mine.gearAtApex) && finite(theirs.gearAtApex) && mine.gearAtApex !== theirs.gearAtApex
      ? ` ${t('race.cause.gear', { mine: mine.gearAtApex, them: f.them, theirs: theirs.gearAtApex })}`
      : '';
  const exitRange = [mine.minSpeedAt, Math.max(mine.fullThrottle, mine.minSpeedAt + 1)] as [number, number];
  const exitFault = p.faults.find(
    (e) =>
      e.to >= mine.minSpeedAt - Math.round(10 / step) &&
      (e.kind === 'wheelspin' || e.kind === 'spin' || e.kind === 'oversteer' || struck(e)),
  );
  if (exitFault) {
    const cause = faultCause(p, f, exitFault);
    return { ...cause, tip: `${cause.tip}${gear}` };
  }
  if (mine.scrub > theirs.scrub + 1 && mine.scrubFrom >= 0) {
    const values = { ...who, from: m(mine.scrubFrom), to: m(mine.scrubTo), mine: num(mine.scrub * KMH), theirs: num(theirs.scrub * KMH) };
    return {
      kind: 'scrubs',
      phase: 'exit',
      what: t('race.cause.scrub', values),
      tip: t(mine.scrub > 7 ? 'race.cause.scrubContactTip' : 'race.cause.scrubTip', values),
      from: mine.scrubFrom,
      to: mine.scrubTo,
      basis: 'comparison',
      source: 'driver',
    };
  }
  const rotation = rotationCause(p, f);
  if (rotation) return { ...rotation, tip: `${rotation.tip}${gear}` };
  if (f.throttleWait > METRES && f.throttleLater > METRES) {
    return {
      kind: 'late-throttle',
      phase: 'exit',
      what: t('race.cause.latePower', { ...who, metres: num(f.throttleLater) }),
      tip: `${t('race.cause.latePowerTip', { ...who, at: m(theirs.throttleOn), next: f.next })}${gear}`,
      from: theirs.throttleOn,
      to: mine.throttleOn,
      basis: 'comparison',
      source: 'driver',
    };
  }
  if (mine.throttleDips > theirs.throttleDips) {
    return {
      kind: 'hesitant-exit',
      phase: 'exit',
      what: t('race.cause.hesitant', who),
      tip: `${t('race.cause.hesitantTip', { lifts: mine.throttleDips })}${gear}`,
      from: mine.throttleOn,
      to: mine.fullThrottle,
      basis: 'comparison',
      source: 'driver',
    };
  }
  if (f.inExit < -1.5 && f.flatWait > METRES) {
    return {
      kind: 'wide-exit',
      phase: 'exit',
      what: t('race.cause.wide', { ...who, metres: num(Math.abs(f.inExit), 1) }),
      tip: `${t('race.cause.wideTip', { ...who, metres: num(f.flatWait) })}${gear}`,
      from: exitRange[0],
      to: exitRange[1],
      basis: 'comparison',
      source: 'driver',
    };
  }
  if (f.flatWait > METRES && f.flatLater > METRES) {
    const accOwn = car ? at(car.accel, mine.minSpeed) : Number.NaN;
    return {
      kind: 'late-throttle',
      phase: 'exit',
      what: t('race.cause.lateFull', { ...who, metres: num(f.flatLater) }),
      tip: `${t('race.cause.lateFullTip', { ...who, acc: finite(accOwn) ? num(accOwn, 1) : 'none' })}${gear}`,
      from: theirs.fullThrottle,
      to: mine.fullThrottle,
      basis: finite(accOwn) ? 'envelope' : 'comparison',
      source: 'driver',
    };
  }
  const accOwn = car ? at(car.accel, mine.minSpeed) : Number.NaN;
  const accRef = otherCar ? at(otherCar.accel, mine.minSpeed) : Number.NaN;
  if (!sameCar && finite(accOwn) && finite(accRef) && accOwn < 0.95 * accRef && r.byPower > 0) {
    return {
      kind: 'car-power',
      phase: 'exit',
      what: t('race.cause.carDrive', who),
      tip: t('race.cause.carDriveTip', { ...who, mine: num(accOwn, 1), speed: num(mine.minSpeed * KMH), theirs: num(accRef, 1) }),
      from: exitRange[0],
      to: exitRange[1],
      basis: 'envelope',
      source: 'car',
    };
  }
  return {
    kind: 'slower-exit',
    phase: 'exit',
    what: t('race.cause.slowerExit', who),
    tip: `${t('race.cause.slowerExitTip')}${gear}`,
    from: exitRange[0],
    to: exitRange[1],
    basis: 'comparison',
    source: 'driver',
  };
}

/** A second cause worth saying: speed scrubbed or a lift on the straight after. */
function alsoLine(p: Pair, r: CornerResult, f: Facts, main: FindingKind): string {
  const { mine, theirs, step } = p;
  if (!(r.driven > 0.04)) return '';
  if (main !== 'scrubs' && mine.scrub > theirs.scrub + 1 && mine.scrubFrom >= 0) {
    return ` ${t('race.also.scrub', {
      me: f.me,
      lost: num(mine.scrub * KMH),
      from: num(Math.round(mine.scrubFrom * step)),
      to: num(Math.round(mine.scrubTo * step)),
      s: num(Math.abs(r.driven), 2),
      contact: mine.scrub > 7 ? 'yes' : 'no',
    })}`;
  }
  if (main !== 'lifts-on-straight' && r.lifted && mine.liftFrom >= 0) {
    return ` ${t('race.also.lift', { at: num(Math.round(mine.liftFrom * step)), s: num(Math.abs(r.driven), 2) })}`;
  }
  return '';
}

/**
 * What of a corner the cars decide, when the laps are in different ones, and
 * how to make the most of this one: the speed its grip allows through the
 * middle on the other's line, a rear that let go, the other's stronger pull
 * and higher top speed down the straight after, its stronger brakes. A car
 * that cannot turn as well will not match a better-turning one through a
 * corner by braking later; the time it can win is elsewhere, and this says
 * where.
 */
function carNote(p: Pair, r: CornerResult, f: Facts): string {
  const { profile: me, otherProfile: them, mine, theirs, seg, step } = p;
  if (p.sameCar || !me || !them) return '';
  const out: string[] = [];
  const pct = (x: number) => num(Math.abs(x - 1) * 100);
  const v = (x: number) => num(x * KMH);
  const who = { me: f.me, them: f.them };
  const pullsMore = finite(me.pull.mid) && finite(them.pull.mid) && me.pull.mid > 1.05 * them.pull.mid;
  // Through the middle: the speed this car's grip allows on the other's line.
  const can = finite(me.grip) && finite(them.grip) ? theirs.minSpeed * Math.sqrt(me.grip / them.grip) : Number.NaN;
  // Far below what any grip explains is a spin, a hit, a missed corner: not the car's.
  if (me.grip < 0.96 * them.grip && theirs.minSpeed > mine.minSpeed + 0.5 && mine.minSpeed > 0.7 * can) {
    const car = theirs.minSpeed - Math.max(mine.minSpeed, can);
    const left = can - mine.minSpeed;
    const values = { ...who, carried: v(theirs.minSpeed), less: pct(them.grip / me.grip), can: v(can), car: v(car), left: v(left), own: v(mine.minSpeed) };
    out.push(t(left > 1 ? 'race.carNote.middleLeft' : 'race.carNote.middleCar', values));
    out.push(
      seg.type === 'onto-straight' || seg.type === 'both' || pullsMore
        ? t('race.carNote.winAfter', { ...who, pull: pullsMore ? 'yes' : 'no' })
        : t('race.carNote.loseLittle'),
    );
  }
  // A rear that let go here, in a car that lets it go more easily.
  const slid =
    p.faults.some((e) => e.kind === 'oversteer' || e.kind === 'spin') ||
    (finite(mine.entryDrift) && mine.entryDrift > SLIDING[p.ground]);
  if (slid && finite(me.rearSlides) && finite(them.rearSlides) && me.rearSlides >= them.rearSlides + 1 && me.rearSlides >= 1.5 * them.rearSlides) {
    out.push(
      `${t('race.carNote.rear', { ...who, mine: num(me.rearSlides, 1), theirs: num(them.rearSlides, 1) })} ${t(
        finite(me.onPower) && me.onPower >= 0.6 ? 'race.carNote.rearPower' : 'race.carNote.rearEntry',
      )}`,
    );
  }
  // The straight after: the other's pull from the same speed, and where this car stopped gaining.
  if (r.byPower >= 0.03 && finite(me.pull.mid) && finite(them.pull.mid)) {
    out.push(t('race.carNote.pull', { ...who, s: num(r.byPower, 2), next: f.next, theirs: num(them.pull.mid, 1), mine: num(me.pull.mid, 1) }));
  }
  const top = (lap: AlignedLap) => {
    let x = 0;
    for (let i = Math.max(lap.first, Math.max(mine.fullThrottle, theirs.fullThrottle)); i <= Math.min(lap.last, seg.end); i++) {
      if (finite(lap.channels.speed[i])) x = Math.max(x, lap.channels.speed[i]);
    }
    return x;
  };
  const myTop = top(p.lap);
  const theirTop = top(p.other);
  if (finite(me.topsOut) && myTop >= 0.98 * me.topsOut && theirTop > myTop + 1.5 && (seg.end - mine.fullThrottle) * step > 150) {
    out.push(t('race.carNote.top', { ...who, mine: v(myTop), theirs: v(theirTop), next: f.next, corner: f.t }));
  }
  // Braking: the other's stronger brakes behind an earlier braking point.
  if (finite(me.braking) && finite(them.braking) && them.braking > 1.05 * me.braking && finite(f.earlier) && f.earlier > METRES) {
    out.push(t('race.carNote.brakes', { ...who, more: pct(them.braking / me.braking), theirs: num(them.braking, 1), mine: num(me.braking, 1) }));
  }
  return out.join(' ');
}

/**
 * One lap against another through one corner, in words. `mirror` is the other
 * lap's side of the same corner - a gain is said through what the other did.
 */
function cornerFinding(
  p: Pair,
  r: CornerResult,
  names: Map<string, string>,
  next: string,
  mirror?: () => Finding | null,
): Finding | null {
  const found = cornerFindingOnly(p, r, names, next, mirror);
  if (!found || found.cars !== undefined) return found;
  const note = found.outcome === 'loss' ? carNote(p, r, facts(p, r, names, next)) : '';
  return note ? { ...found, cars: note } : found;
}

function cornerFindingOnly(
  p: Pair,
  r: CornerResult,
  names: Map<string, string>,
  next: string,
  mirror?: () => Finding | null,
): Finding | null {
  const f = facts(p, r, names, next);
  const { mine, theirs, seg, step } = p;
  const details = detailLines(p, r, f);
  const line = lineText(p, f);
  const trade =
    Math.abs(r.toApex) >= TRADE &&
    Math.abs(r.fromApex) >= TRADE &&
    Math.sign(r.toApex) !== Math.sign(r.fromApex);
  const swing = Math.min(Math.abs(r.toApex), Math.abs(r.fromApex));
  const corner = [
    Math.max(0, Math.min(...[mine.brakeOn, theirs.brakeOn, mine.minSpeedAt].filter((i) => i >= 0))),
    Math.max(mine.fullThrottle, theirs.fullThrottle),
  ] as [number, number];
  const base = {
    lapId: p.lap.lap.id,
    againstId: p.other.lap.id,
    corner: seg.corner,
    cost: r.net,
    carCost: r.carCost,
    carried: r.byExit,
    toApex: r.toApex,
    fromApex: r.fromApex,
    evidence: verdict(r, f),
    details,
    line,
  };
  const s2 = (v: number) => num(Math.abs(v), 2);
  const net = s2(r.net);
  // A title: the corner and what happened; with what it cost, for a loss.
  const plain = (what: string) => ({ what, title: titled(f, what) });
  const costed = (what: string) => ({ what, title: t('race.title.cornerCost', { corner: f.t, what, cost: net }) });
  const later = finite(f.earlier) && f.earlier < -METRES;
  const laterBy = later ? num(Math.abs(f.earlier)) : 'none';
  // --- Level: only worth saying when they got there differently.
  if (Math.abs(r.net) < EVEN) {
    if (!trade || swing < SHOW_EVEN) return null;
    const slowIn = r.toApex > 0 ? f.me : f.them;
    const fastIn = r.toApex > 0 ? f.them : f.me;
    return {
      ...base,
      kind: 'even',
      phase: 'exit',
      from: corner[0],
      to: corner[1],
      ...plain(t('race.finding.even', { slowIn, fastIn })),
      tip: [
        t('race.finding.evenTip', { fastIn, s: s2(swing), next: f.next, later: fastIn === f.me ? laterBy : 'none' }),
        Math.abs(r.byPower) >= 0.02 ? t('race.finding.evenPull', { s: s2(r.byPower), name: r.byPower > 0 ? f.them : f.me }) : '',
        seg.type === 'onto-straight' || seg.type === 'both' ? t('race.finding.evenStraight', { slowIn }) : '',
      ]
        .filter(Boolean)
        .join(' '),
      basis: 'comparison',
      source: 'driver',
      outcome: 'even',
    };
  }
  // --- Ahead: say how, so it can be kept.
  if (r.net < 0) {
    if (trade && r.toApex > 0) {
      return {
        ...base,
        kind: 'slow-in-fast-out',
        phase: 'exit',
        from: corner[0],
        to: corner[1],
        ...plain(t('race.finding.slowInFastOut', { me: f.me, s: net })),
        tip: t('race.finding.slowInFastOutTip', {
          me: f.me,
          toApex: s2(r.toApex),
          fromApex: s2(r.fromApex),
          earlier: finite(f.earlier) && f.earlier > METRES ? num(f.earlier) : 'none',
          flat: f.flatLater < -METRES ? num(Math.abs(f.flatLater)) : 'none',
          pull: Math.abs(r.byPower) >= 0.02 ? s2(r.byPower) : 'none',
          pullName: r.byPower < 0 ? f.me : f.them,
          pullDir: r.byPower < 0 ? 'stronger' : 'weaker',
        }),
        basis: 'comparison',
        source: 'driver',
        outcome: 'gain',
      };
    }
    if (trade && r.toApex < 0) {
      return {
        ...base,
        kind: 'fast-in',
        phase: 'entry',
        from: corner[0],
        to: corner[1],
        ...plain(t('race.finding.faster', { me: f.me, s: net, where: 'in' })),
        tip: t('race.finding.fastInTip', { me: f.me, toApex: s2(r.toApex), fromApex: s2(r.fromApex), later: laterBy }),
        basis: 'comparison',
        source: 'driver',
        outcome: 'gain',
      };
    }
    // Say it through the other lap's mistake, when it has one.
    const theirs0 = mirror?.();
    if (theirs0 && theirs0.outcome === 'loss') {
      return {
        ...base,
        kind: 'faster',
        phase: theirs0.phase,
        from: theirs0.from,
        to: theirs0.to,
        ...plain(t('race.finding.fasterBecause', { me: f.me, s: net, cause: theirs0.what ?? theirs0.title })),
        tip: t('race.finding.forThem', { them: f.them, text: theirs0.tip }),
        cars: theirs0.cars ? t('race.finding.forThem', { them: f.them, text: theirs0.cars }) : undefined,
        basis: theirs0.basis,
        source: theirs0.source === 'car' ? 'car' : 'driver',
        outcome: 'gain',
      };
    }
    const where = Math.abs(r.toApex) >= Math.abs(r.fromApex) ? 'in' : 'out';
    return {
      ...base,
      kind: 'faster',
      phase: where === 'in' ? 'entry' : 'exit',
      from: corner[0],
      to: corner[1],
      ...plain(t('race.finding.faster', { me: f.me, s: net, where })),
      tip:
        where === 'in'
          ? t('race.finding.fasterInTip', {
              later: laterBy,
              more: mine.minSpeed > theirs.minSpeed + 0.5 ? num((mine.minSpeed - theirs.minSpeed) * KMH) : 'none',
            })
          : t('race.finding.fasterOutTip', {
              me: f.me,
              flat: f.flatLater < -METRES ? num(Math.abs(f.flatLater)) : 'none',
              pull: r.byPower < -0.02 ? s2(r.byPower) : 'none',
            }),
      basis: 'comparison',
      source: r.byPower < 0 && Math.abs(r.byPower) > 0.6 * Math.abs(r.net) ? 'car' : 'driver',
      outcome: 'gain',
    };
  }
  // --- Behind, and a hit or a crash explains much of it: that is the story,
  // whatever the cars.
  const hit = p.faults.filter(struck).reduce<ControlEvent | null>((w, e) => (!w || e.cost > w.cost ? e : w), null);
  if (hit && hit.cost >= Math.max(0.05, 0.4 * r.net)) {
    const cause = faultCause(p, f, hit);
    return {
      ...base,
      kind: cause.kind,
      phase: cause.phase,
      from: cause.from,
      to: cause.to,
      ...costed(cause.what),
      tip: cause.tip,
      basis: cause.basis,
      source: 'driver',
      outcome: 'loss',
    };
  }
  // --- Behind: the car first, when it explains most of it.
  if (r.carCost >= 0.6 * r.net) {
    const { power, grip, brakes } = r.car;
    const biggest = power >= grip && power >= brakes ? 'power' : grip >= brakes ? 'grip' : 'brakes';
    const driver = r.net - r.carCost;
    const rest =
      driver >= EVEN
        ? ` ${t('race.finding.carRest', { s: s2(driver), cause: (r.toApex >= r.fromApex ? entryCause(p, f) : exitCause(p, r, f)).what })}`
        : '';
    const what = {
      power: {
        kind: 'car-power' as const,
        phase: 'straight' as const,
        tip: t('race.finding.carPowerTip', { me: f.me, them: f.them }),
        range: [Math.max(mine.fullThrottle, theirs.fullThrottle), seg.end] as [number, number],
      },
      grip: {
        kind: 'car-grip' as const,
        phase: 'entry' as const,
        tip: t('race.finding.carGripTip', { me: f.me, them: f.them }),
        range: [mine.minSpeedAt - Math.round(20 / step), mine.minSpeedAt + Math.round(20 / step)] as [number, number],
      },
      brakes: {
        kind: 'car-braking' as const,
        phase: 'braking' as const,
        tip: t('race.finding.carBrakesTip', { me: f.me }),
        range: [Math.max(0, mine.brakeOn), mine.brakeOff >= 0 ? mine.brakeOff : mine.minSpeedAt] as [number, number],
      },
    }[biggest];
    return {
      ...base,
      kind: what.kind,
      phase: what.phase,
      from: what.range[0],
      to: what.range[1],
      ...plain(t('race.finding.car', { me: f.me, part: biggest, car: s2(r.carCost), net })),
      tip: `${what.tip}${rest}`,
      basis: 'envelope',
      source: 'car',
      outcome: 'loss',
    };
  }
  // --- Behind, and one car-control fault explains much of it: that is the
  // root cause, whatever pattern the time made around it.
  const worst = p.faults.reduce<ControlEvent | null>((w, e) => (!w || e.cost > w.cost ? e : w), null);
  if (worst && worst.cost >= Math.max(0.05, 0.4 * r.net)) {
    const cause = faultCause(p, f, worst);
    const shape = trade
      ? r.toApex < 0
        ? ` ${t('race.finding.shapeUp', { me: f.me, s: s2(r.toApex) })}`
        : ` ${t('race.finding.shapeDown', { me: f.me, down: s2(r.toApex), back: s2(r.fromApex) })}`
      : '';
    return {
      ...base,
      kind: cause.kind,
      phase: cause.phase,
      from: cause.from,
      to: cause.to,
      ...costed(cause.what),
      tip: `${cause.tip}${shape}`,
      basis: cause.basis,
      source: 'driver',
      outcome: 'loss',
    };
  }
  // --- Behind, and a longer flight explains much of it.
  const flight = jumpCause(p, f);
  if (flight && flight.cost >= Math.max(0.05, 0.4 * r.net)) {
    return {
      ...base,
      kind: flight.kind,
      phase: flight.phase,
      from: flight.from,
      to: flight.to,
      ...costed(flight.what),
      tip: flight.tip,
      basis: flight.basis,
      source: 'driver',
      outcome: 'loss',
    };
  }
  // --- Behind: the pattern first, then the cause inside it.
  if (trade && r.toApex < 0) {
    // Won the entry, lost more on the exit: overdriven.
    const exit = exitCause(p, r, f);
    return {
      ...base,
      kind: 'too-fast-in',
      cause: later ? 'too-fast-in' : exit.kind,
      phase: 'exit',
      from: corner[0],
      to: corner[1],
      ...plain(t('race.finding.tooFastIn', { me: f.me, s: net })),
      tip: `${t('race.finding.tooFastInTip', {
        me: f.me,
        them: f.them,
        toApex: s2(r.toApex),
        fromApex: s2(r.fromApex),
        later: laterBy,
        cause: exit.what,
        brakedAt: finite(f.earlier) && f.earlier < 0 ? num(Math.round(theirs.brakeOn * step)) : 'none',
        flatAt: num(Math.round(theirs.fullThrottle * step)),
      })} ${exit.tip}${alsoLine(p, r, f, exit.kind)}`,
      basis: exit.basis,
      source: 'driver',
      outcome: 'loss',
    };
  }
  if (trade && r.toApex > 0) {
    // Lost the entry, and the exit gave back less.
    const entry = entryCause(p, f);
    return {
      ...base,
      kind: 'too-slow-in',
      cause: entry.kind,
      phase: entry.phase,
      from: entry.from,
      to: entry.to,
      ...plain(t('race.finding.tooSlowIn', { me: f.me, s: net })),
      tip: `${t('race.finding.tooSlowInTip', { me: f.me, toApex: s2(r.toApex), fromApex: s2(r.fromApex), cause: entry.what })} ${entry.tip}${alsoLine(p, r, f, entry.kind)}`,
      basis: entry.basis,
      source: entry.source,
      outcome: 'loss',
    };
  }
  // No trade: whichever half lost it, and inside the second half, whether the
  // straight's loss is the exit's, the car's pull or a lift.
  if (r.lifted && r.driven > 0.5 * r.net) {
    const what = t('race.finding.notFlat', { me: f.me });
    return {
      ...base,
      kind: 'lifts-on-straight',
      phase: 'straight',
      from: mine.liftFrom >= 0 ? mine.liftFrom : mine.fullThrottle,
      to: mine.liftFrom >= 0 ? mine.liftTo : seg.end,
      what,
      title: t('race.title.after', { corner: f.t, what }),
      tip: t('race.finding.notFlatTip', {
        them: f.them,
        mine: num(mine.straightFull * 100),
        theirs: num(theirs.straightFull * 100),
        off: mine.liftFrom >= 0 ? num((mine.liftTo - mine.liftFrom + 1) * step) : 'none',
        at: num(Math.round(mine.liftFrom * step)),
      }),
      basis: 'comparison',
      source: 'driver',
      outcome: 'loss',
    };
  }
  if (r.byPower > 0.6 * r.net && r.straight > 0.5 * r.net) {
    // The pull at 160 km/h, which the tip names.
    const accOwn = p.car ? at(p.car.accel, 160 / KMH) : Number.NaN;
    const accRef = p.otherCar ? at(p.otherCar.accel, 160 / KMH) : Number.NaN;
    const what = t('race.finding.pullStraight', { me: f.me });
    return {
      ...base,
      kind: 'car-power',
      phase: 'straight',
      from: Math.max(mine.fullThrottle, theirs.fullThrottle),
      to: seg.end,
      what,
      title: t('race.title.after', { corner: f.t, what }),
      tip: t('race.finding.pullStraightTip', {
        me: f.me,
        them: f.them,
        acc: finite(accOwn) && finite(accRef) ? num(accOwn, 1) : 'none',
        ref: num(accRef, 1),
      }),
      basis: finite(accOwn) ? 'envelope' : 'comparison',
      source: 'car',
      outcome: 'loss',
    };
  }
  let cause = r.toApex >= r.fromApex ? entryCause(p, f) : exitCause(p, r, f);
  // Slower out only because slower through the middle: one mistake, and its
  // cause is the middle's.
  if ((cause.kind === 'slower-exit' || cause.kind === 'car-power') && mine.minSpeed < theirs.minSpeed - 1) {
    cause = entryCause(p, f);
  }
  return {
    ...base,
    kind: cause.kind,
    phase: cause.phase,
    from: cause.from,
    to: cause.to,
    ...costed(cause.what),
    tip: `${cause.tip}${alsoLine(p, r, f, cause.kind)}`,
    basis: cause.basis,
    source: cause.source,
    outcome: 'loss',
  };
}

// ---------------------------------------------------------------- the rest

/**
 * Time lost per metre against the lap it is compared with there (`against`),
 * smoothed, for the "where" map; against the reference where there is none.
 */
function whereMap(lap: AlignedLap, step: number, against: (i: number) => AlignedLap | null): Float32Array {
  const delta = lap.channels.delta;
  const out = new Float32Array(delta.length).fill(Number.NaN);
  for (let i = lap.first + 1; i <= lap.last; i++) {
    const other = against(i);
    const theirs = other ? other.channels.delta[i] - other.channels.delta[i - 1] : 0;
    out[i] = (delta[i] - delta[i - 1] - (finite(theirs) ? theirs : 0)) / step;
  }
  return smooth(out, Math.max(1, Math.round(10 / step)));
}

/** A lap's performance class, '' when the game gives none. */
export function classOf(lap: LapTrace): string {
  return lap.car.class ?? '';
}

/** Each loss spread over where its cause is, for the "why" map. */
function whyMap(findings: Finding[], lap: AlignedLap, step: number): Float32Array {
  const out = new Float32Array(lap.channels.time.length);
  for (const f of findings) {
    if (f.lapId !== lap.lap.id || f.outcome !== 'loss' || f.cost <= 0) continue;
    const a = Math.max(0, Math.min(f.from, f.to));
    const b = Math.min(out.length - 1, Math.max(f.from, f.to, a + 1));
    const per = f.cost / ((b - a + 1) * step);
    for (let i = a; i <= b; i++) out[i] += per;
  }
  return out;
}

function compareCars(profiles: Map<string, CarProfile>, carNames: Map<string, string>): CarComparison[] {
  const keys = [...profiles.keys()];
  const out: CarComparison[] = [];
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const a = profiles.get(keys[i])!;
      const b = profiles.get(keys[j])!;
      const [na, nb] = [carNames.get(keys[i])!, carNames.get(keys[j])!];
      const verdict = compareProfiles(a, b, na, nb);
      out.push({
        a: keys[i],
        b: keys[j],
        labelA: na,
        labelB: nb,
        profiles: [a, b],
        summary: verdict.summary,
        points: verdict.points,
        driving: verdict.driving,
        advice: [...verdict.points, ...verdict.driving],
      });
    }
  }
  return out;
}

/** Whether the reference path comes back to where it started. */
function isCircuit(ref: AlignedLap): boolean {
  const { x, z } = ref.channels;
  return Math.hypot(x[ref.last] - x[ref.first], z[ref.last] - z[ref.first]) < 50;
}

/** A standing start, or a lap that began at the start of a race against one at speed. */
function isStart(lap: AlignedLap, ref: AlignedLap): boolean {
  const from = Math.max(lap.first, ref.first);
  const mine = lap.channels.speed[from];
  const theirs = ref.channels.speed[from];
  return theirs < 5 || mine < 5 || mine < 0.6 * theirs;
}

/** The run from the line to the first corner, when it is not the last corner's straight. */
function startFinding(
  lap: AlignedLap,
  other: AlignedLap,
  firstStart: number,
  cost: number,
  sameCar: boolean,
  names: Map<string, string>,
): Finding | null {
  if (!(Math.abs(cost) > EVEN)) return null;
  const from = Math.max(lap.first, other.first);
  const mine = lap.channels.speed[from];
  const theirs = other.channels.speed[from];
  const standing = theirs < 5 || mine < 5;
  const raceStart = !standing && mine < 0.6 * theirs;
  const me = names.get(lap.lap.id)!;
  const them = names.get(other.lap.id)!;
  const gained = cost < 0;
  const what = t('race.start.what', { me, dir: gained ? 'gained' : 'lost', s: num(Math.abs(cost), 2) });
  return {
    lapId: lap.lap.id,
    againstId: other.lap.id,
    corner: 0,
    phase: 'straight',
    kind: gained ? 'faster' : 'slower-start',
    cost,
    carCost: !gained && !sameCar && !raceStart ? cost : 0,
    carried: 0,
    toApex: 0,
    fromApex: cost,
    from,
    to: firstStart,
    what,
    title: t('race.start.title', { stretch: standing ? 'launch' : raceStart ? 'race' : 'first', what }),
    evidence: standing
      ? t('race.start.standing', { me, them, mine: num(lap.channels.speed[firstStart] * KMH), theirs: num(other.channels.speed[firstStart] * KMH) })
      : t('race.start.flying', { me, them, mine: num(mine * KMH), theirs: num(theirs * KMH) }),
    details: [],
    tip: gained
      ? ''
      : standing && !sameCar
        ? t('race.start.tipCar', { me, them })
        : standing
          ? t('race.start.tipLaunch')
        : raceStart
          ? t('race.start.tipRace', { me, them })
          : t('race.start.tipFlying'),
    line: '',
    basis: 'comparison',
    source: raceStart ? 'context' : sameCar ? 'driver' : 'car',
    outcome: gained ? 'gain' : 'loss',
  };
}

/**
 * The segments: each corner from the first braking for it by any lap, to the
 * first braking for the next. Corners own the road half-way to the apexes
 * either side. A lap's entry to a corner is where it last had its foot down
 * before it - or, when it never did since the corner before, its fastest point
 * between the two. Consecutive corners the reference never drives flat out
 * between (less than 40 m) are merged into one complex.
 */
function buildSegments(
  alignment: Alignment,
  corners: Corner[],
  kappa: Float32Array,
  circuit: boolean,
  step: number,
): Segment[] {
  const ref = alignment.laps.find((l) => l.lap === alignment.reference)!;
  const nC = corners.length;
  if (!nC) return [];
  const mids = corners.map((c, k) => (k < nC - 1 ? Math.floor((c.apex + corners[k + 1].apex) / 2) : ref.last));
  const los = corners.map((_, k) => (k ? mids[k - 1] + 1 : ref.first));
  const windows = corners.map((c, k) => cornerWindow(kappa, c, los[k], mids[k], step));
  const slowAt = (lap: AlignedLap, k: number) =>
    slowest(
      lap,
      Math.max(los[k], windows[k].from - Math.round(15 / step)),
      Math.min(mids[k], windows[k].to + Math.round(10 / step)),
      corners[k].apex,
    );
  const mins = new Map(alignment.laps.map((lap) => [lap.lap.id, corners.map((_, k) => slowAt(lap, k))]));
  const starts: number[] = [];
  corners.forEach((c, k) => {
    let s = c.apex;
    for (const lap of alignment.laps) {
      const m = mins.get(lap.lap.id)!;
      s = Math.min(s, entryOf(lap, m[k], k ? m[k - 1] : lap.first));
    }
    s = Math.max(k ? starts[k - 1] + 1 : ref.first, s - 2);
    starts.push(Math.min(s, c.apex));
  });
  // Flat out between two corners, on the reference: from its full throttle
  // after one to the first braking for the next.
  const throttle = ref.channels.throttle;
  const refMin = mins.get(ref.lap.id)!;
  const flatBetween = (k: number) => {
    const end = k < nC - 1 ? starts[k + 1] : ref.last;
    if (!throttle) return (end - refMin[k]) * step;
    let i = refMin[k];
    while (i < end && !(throttle[i] >= 0.95)) i++;
    return (end - i) * step;
  };
  // A complex is two or three bends driven as one - a chicane, a double apex,
  // an S. A twisty stage driven without ever being flat is not one long
  // complex: past three bends a new one starts.
  const groups: number[][] = [[0]];
  for (let k = 1; k < nC; k++) {
    const group = groups[groups.length - 1];
    if (flatBetween(k - 1) < 40 && group.length < 3) group.push(k);
    else groups.push([k]);
  }
  return groups.map((g, n) => {
    const a = g[0];
    const z = g[g.length - 1];
    const last = n === groups.length - 1;
    const directions = new Set(g.map((k) => corners[k].direction));
    return {
      corner: corners[a].number,
      corners: g.map((k) => corners[k].number),
      label:
        g.length > 1
          ? t('race.corner.range', { from: t('race.corner.one', { n: corners[a].number }), to: t('race.corner.one', { n: corners[z].number }) })
          : t('race.corner.one', { n: corners[a].number }),
      mixed: directions.size > 1,
      start: starts[a],
      end: last ? ref.last : starts[groups[n + 1][0]],
      wrap: circuit && last ? ([ref.first, starts[0]] as [number, number]) : undefined,
      window: { from: windows[a].from, to: windows[z].to, inside: windows[a].inside },
      type: 'link' as CornerType,
      before: 0,
      after: 0,
    };
  });
}

/**
 * Analyse laps against a reference - the fastest complete lap unless given.
 * Every other lap is compared with the reference corner by corner; the
 * reference itself with whichever other lap was quickest through each corner.
 */
export function analyse(laps: LapTrace[], referenceId?: string): Analysis {
  if (laps.length === 0) throw new Error('no laps to analyse');
  // Drift angle, wheel slip from wheel speeds, the air: what every game's
  // laps imply, under one set of names.
  for (const lap of laps) deriveChannels(lap);
  const reference =
    laps.find((l) => l.id === referenceId) ??
    laps.filter((l) => l.complete).sort((a, b) => a.seconds - b.seconds)[0] ??
    laps[0];
  const alignment = align(reference, laps);
  const step = alignment.grid[1] - alignment.grid[0];
  const mirrored = lapsMirrored(laps);
  const corners = findCorners(alignment, mirrored);
  const ref = alignment.laps.find((l) => l.lap === reference)!;
  const circuit = corners.length > 0 && isCircuit(ref);
  const names = lapNames(laps);
  const kappa = smooth(curvature(alignment), Math.max(1, Math.round(10 / step)));

  const groups = new Map<string, LapTrace[]>();
  for (const lap of laps) {
    const key = carKey(lap);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(lap);
  }
  const envelopes = new Map<string, Envelope>();
  for (const [key, group] of groups) envelopes.set(key, envelope(group));
  const profiles = new Map<string, CarProfile>();
  for (const [key, group] of groups) profiles.set(key, profile(key, group, envelopes.get(key)!));
  // The car, not the lap: without the lap time or number that tells its laps apart.
  const carNames = new Map<string, string>();
  for (const [key, group] of groups) carNames.set(key, names.get(group[0].id)!.replace(/ \(\d.*\)$| #\d+$/, ''));

  const segments = buildSegments(alignment, corners, kappa, circuit, step);
  const nS = segments.length;
  const mins = new Map<string, number[]>();
  for (const lap of alignment.laps) {
    mins.set(
      lap.lap.id,
      segments.map((seg) => {
        const apex = corners
          .filter((c) => seg.corners.includes(c.number))
          .reduce((s, c) => (c.apexSpeed < s.apexSpeed ? c : s)).apex;
        return slowest(
          lap,
          Math.max(seg.start, seg.window.from - Math.round(15 / step)),
          Math.min(seg.end, seg.window.to + Math.round(10 / step)),
          apex,
        );
      }),
    );
  }

  // --- What each lap did in each, and the line it drove.
  const metrics = new Map<string, CornerMetrics[]>();
  const lines = new Map<string, (LineMetrics | null)[]>();
  for (const lap of alignment.laps) {
    const m = mins.get(lap.lap.id)!;
    metrics.set(lap.lap.id, segments.map((seg, k) => cornerMetrics(lap, seg, m[k], step)));
    lines.set(lap.lap.id, segments.map((seg) => (seg.mixed ? null : lineMetrics(lap, seg.window, step))));
  }
  // What each corner leads onto, measured on the reference.
  const refM = metrics.get(reference.id)!;
  segments.forEach((seg, k) => {
    const wrapLen = seg.wrap ? (seg.wrap[1] - seg.wrap[0]) * step : 0;
    seg.after = Math.max(0, (seg.end - refM[k].fullThrottle) * step + wrapLen);
    const prev = k ? segments[k - 1] : circuit ? segments[nS - 1] : null;
    seg.before = prev ? prev.after : Math.max(0, (seg.start - ref.first) * step);
    seg.type = cornerType(seg.before, seg.after);
  });

  // --- Who each lap is compared with in each segment: the best lap of its
  // class (the reference, in the reference's class), or for that lap itself
  // whoever of its class was quickest through it - of every lap, when it is
  // alone in its class.
  const classBest = new Map<string, AlignedLap>();
  for (const l of alignment.laps) {
    const c = classOf(l.lap);
    const had = classBest.get(c);
    const better = !had || (l.lap.complete && (!had.lap.complete || l.lap.seconds < had.lap.seconds));
    if (better) classBest.set(c, l);
  }
  classBest.set(classOf(reference), ref);
  const opponents = new Map<string, (AlignedLap | null)[]>();
  for (const lap of alignment.laps) {
    const own = classBest.get(classOf(lap.lap))!;
    const mates = alignment.laps.filter((l) => l !== lap && classOf(l.lap) === classOf(lap.lap));
    const others = mates.length ? mates : alignment.laps.filter((l) => l !== lap);
    opponents.set(
      lap.lap.id,
      segments.map((seg) => {
        if (!others.length) return null;
        if (lap !== own) return own;
        let best = others[0];
        let time = Number.POSITIVE_INFINITY;
        for (const o of others) {
          const rel = relative(lap, o);
          const t = -(rel.span(Math.max(rel.first, seg.start), Math.min(rel.last, seg.end)));
          if (t < time) {
            time = t;
            best = o;
          }
        }
        return best;
      }),
    );
  }
  // The segment a grid index belongs to: the run across the line on a circuit
  // is the last one's.
  const segmentAt = (i: number): number => {
    if (!nS) return -1;
    if (i < segments[0].start) return circuit ? nS - 1 : -1;
    let k = 0;
    while (k < nS - 1 && segments[k + 1].start <= i) k++;
    return k;
  };
  const cornerAt = (i: number): [number, string] => {
    const k = segmentAt(i);
    return k >= 0 ? [segments[k].corner, segments[k].label] : [0, ''];
  };

  // --- Car control: every lap's locks, spins, slides and pushes, against
  // the lap it is compared with where each happened.
  const tyres = new Map<string, CarTyres>();
  for (const [key, group] of groups) tyres.set(key, measureTyres(group, envelopes.get(key)));
  const controlAgainst = (lap: AlignedLap, pick: (k: number) => AlignedLap | null) =>
    controlEvents(lap, {
      step,
      mirrored: mirrored ?? true,
      against: (i) => {
        const other = pick(segmentAt(i));
        if (!other) return null;
        const rel = relative(lap, other);
        return { other, rel: rel.at };
      },
      car: envelopes.get(carKey(lap.lap)),
      tyres: tyres.get(carKey(lap.lap))!,
      otherTyres: (other) => tyres.get(carKey(other.lap))!,
      cornerAt,
    });
  const control = new Map<string, ControlEvent[]>();
  const controlSummary = new Map<string, ControlSummary>();
  for (const lap of alignment.laps) {
    const mine = opponents.get(lap.lap.id)!;
    const events = controlAgainst(lap, (k) => (k >= 0 ? mine[k] : (mine[0] ?? null)));
    control.set(lap.lap.id, events);
    controlSummary.set(lap.lap.id, summarise(lap, events));
  }
  /** A lap's faults in a segment that the other lap did not share, and that cost time. */
  const faultsIn = (events: ControlEvent[], k: number) =>
    events.filter(
      (e) => FAULTS.has(e.kind) && !e.shared && e.cost >= 0.02 && segmentAt(e.from) === k,
    );

  // --- Each lap against its comparison lap, corner by corner.
  const results = new Map<string, CornerResult[]>();
  const start = new Map<string, number>();
  const findings: Finding[] = [];
  const pairOf = (lap: AlignedLap, other: AlignedLap, k: number, faults: ControlEvent[] = []): Pair => {
    const mine = metrics.get(lap.lap.id)![k];
    const theirs = metrics.get(other.lap.id)![k];
    // What each car can do here is what it does on the ground it was on.
    const ground = groundAt(lap.channels, lap.lap, mine.minSpeedAt);
    const otherGround = groundAt(other.channels, other.lap, theirs.minSpeedAt);
    return {
      // On a circuit a flying lap's run from the line continues the last
      // corner's straight; a standing or race start keeps it apart.
      wrap: segments[k].wrap && !isStart(lap, other) ? segments[k].wrap : undefined,
      lap,
      other,
      mine,
      theirs,
      lineMine: lines.get(lap.lap.id)![k],
      lineTheirs: lines.get(other.lap.id)![k],
      seg: segments[k],
      car: onGround(envelopes.get(carKey(lap.lap)), ground),
      otherCar: onGround(envelopes.get(carKey(other.lap)), otherGround),
      profile: profiles.get(carKey(lap.lap)),
      otherProfile: profiles.get(carKey(other.lap)),
      sameCar: carKey(lap.lap) === carKey(other.lap),
      step,
      faults,
      tyres: tyres.get(carKey(lap.lap)),
      ground,
      before: k
        ? { label: segments[k - 1].label, mine: metrics.get(lap.lap.id)![k - 1], theirs: metrics.get(other.lap.id)![k - 1] }
        : undefined,
    };
  };
  const mirroredEvents = new Map<string, ControlEvent[]>();
  for (const lap of alignment.laps) {
    const others = alignment.laps.filter((l) => l !== lap);
    const list: CornerResult[] = [];
    const events = control.get(lap.lap.id)!;
    segments.forEach((_, k) => {
      if (!others.length) return;
      const other = opponents.get(lap.lap.id)![k]!;
      const p = pairOf(lap, other, k, faultsIn(events, k));
      const r = compareCorner(p);
      list.push(r);
      const next = segments[k + 1] ?? (circuit ? segments[0] : null);
      const nextLabel = next ? next.label : t('race.text.finish');
      const mirror = () => {
        // The other lap's side of this corner, its faults judged against this lap.
        const key = `${other.lap.id}|${lap.lap.id}`;
        if (!mirroredEvents.has(key)) mirroredEvents.set(key, controlAgainst(other, () => lap));
        const theirs = mirroredEvents.get(key)!;
        const q = pairOf(other, lap, k, faultsIn(theirs, k));
        return cornerFinding(q, compareCorner(q), names, nextLabel);
      };
      const f = cornerFinding(p, r, names, nextLabel, mirror);
      if (f) findings.push(f);
    });
    results.set(lap.lap.id, list);
    // Before the first corner: the last corner's straight on a flying lap,
    // its own thing on a standing or race start and on a sprint.
    const other = opponents.get(lap.lap.id)![0] ?? others[0];
    if (!other || !nS) {
      start.set(lap.lap.id, 0);
      continue;
    }
    const flying = circuit && !isStart(lap, other);
    const rel = relative(lap, other);
    const before = flying ? 0 : rel.span(rel.first, segments[0].start);
    start.set(lap.lap.id, before);
    if (!flying) {
      const f = startFinding(lap, other, segments[0].start, before, carKey(lap.lap) === carKey(other.lap), names);
      if (f) findings.push(f);
    }
  }
  // Every lap's own time through every segment.
  const segmentTimes = new Map<string, { corners: number[]; start: number }>();
  for (const lap of alignment.laps) {
    const t = lap.channels.time;
    const span = (a: number, z: number) =>
      a >= lap.first && z <= lap.last && a <= z ? t[z] - t[a] : Number.NaN;
    const flying = circuit && !isStart(lap, ref);
    segmentTimes.set(lap.lap.id, {
      corners: segments.map(
        (seg) => span(seg.start, seg.end) + (seg.wrap ? (flying ? span(seg.wrap[0], seg.wrap[1]) : 0) : 0),
      ),
      start: nS && !flying ? span(Math.max(lap.first, ref.first), segments[0].start) : 0,
    });
  }
  // Losses first, costliest first; then gains and draws.
  const order = { loss: 0, gain: 1, even: 2 } as const;
  findings.sort((a, b) => order[a.outcome] - order[b.outcome] || (a.outcome === 'loss' ? b.cost - a.cost : a.cost - b.cost));

  const where = new Map<string, Float32Array>();
  const why = new Map<string, Float32Array>();
  for (const lap of alignment.laps) {
    const mine = opponents.get(lap.lap.id)!;
    where.set(lap.lap.id, whereMap(lap, step, (i) => mine[Math.max(0, segmentAt(i))] ?? null));
    why.set(lap.lap.id, whyMap(findings, lap, step));
  }
  return {
    alignment,
    corners,
    segments,
    metrics,
    lines,
    results,
    start,
    segmentTimes,
    findings,
    envelopes,
    profiles,
    carNames,
    carWords: new Map([...profiles].map(([key, pr]) => [key, describeProfile(pr, carNames.get(key)!)])),
    cars: groups.size > 1 ? compareCars(profiles, carNames) : [],
    names,
    classBest: new Map([...classBest].map(([c, l]) => [c, l.lap.id])),
    control,
    controlSummary,
    tyres,
    mirrored,
    where,
    why,
  };
}
