/**
 * Laps from a simple vehicle model, for tests and the demo.
 *
 * A closed circuit of four straights and four right-handers, laid out the way
 * Forza keeps its world (left-handed, so it comes out mirrored in this viewer
 * until an axis is inverted, exactly like a real lap), and a car with a
 * grip, a braking and a power limit. The quickest lap is found the way a lap
 * simulator does it - each corner's grip-limited speed, an acceleration pass
 * forwards and a braking pass backwards - and driver faults are deviations
 * from it: braking early or gently, a late throttle, a lift, a slow corner.
 */

import { t } from '../i18n';
import type { LapTrace } from './lap';

export interface SyntheticCar {
  /** What the lap list calls it: for the demo cars, in the user's language when the laps are made. */
  name: string;
  ordinal: number;
  /** Lateral grip, m/s². */
  grip: number;
  /** Braking, m/s². */
  braking: number;
  /** Traction-limited acceleration, m/s². */
  traction: number;
  /** Power over mass, W/kg: acceleration above the traction limit is power / v. */
  power: number;
  /** Aerodynamic drag, 1/m: deceleration k·v². */
  drag: number;
}

export const DEMO_CARS: SyntheticCar[] = [
  {
    get name() {
      return t('race.ui.demo.gripCar');
    },
    ordinal: 9001,
    grip: 16,
    braking: 13,
    traction: 9,
    power: 230,
    drag: 0.0009,
  },
  {
    get name() {
      return t('race.ui.demo.powerCar');
    },
    ordinal: 9002,
    grip: 12,
    braking: 11,
    traction: 7,
    power: 380,
    drag: 0.0006,
  },
];

/** Driver faults: each names a corner (1-based) or a stretch of the lap. */
export interface Faults {
  /** Brake this many metres before the car needs to, then hold the corner speed. */
  brakeEarly?: { corner: number; metres: number };
  /** Brake at this fraction of the car's braking. */
  brakeGently?: { corner: number; factor: number };
  /** Stay at corner speed this many metres after the corner before accelerating. */
  lateThrottle?: { corner: number; metres: number };
  /** Take the corner at this fraction of the speed the grip allows. */
  overslow?: { corner: number; factor: number };
  /**
   * Slow in, fast out: the first half of the corner at `entry` times the speed
   * the grip allows, the second half at `exit` times it - a late apex, whose
   * tighter entry and opening exit trade speed in for speed out.
   */
  lateApex?: { corner: number; entry: number; exit: number };
  /** Off the throttle for `metres` from `at` metres into the lap. */
  lift?: { at: number; metres: number };
  /** Drive this many metres to the side of the line (left positive). */
  offset?: number;
  /**
   * Also make up per-wheel channels - tyre temperature, suspension travel and
   * slip - from the load the model puts on each corner, so the demo shows what
   * a car with a richer recorder looks like.
   */
  wheels?: boolean;
}

interface Piece {
  kind: 'straight' | 'arc';
  length: number;
  radius: number;
}

// Four straights and four right-handers of different radii; the straights'
// lengths close the loop (see the derivation in the tests).
const A = 500;
const B = 250;
const R = [40, 20, 60, 30];
const C = A + R[0] - R[1] - R[2] + R[3];
const D = R[0] + B + R[1] - R[2] - R[3];

function pieces(): Piece[] {
  const arc = (r: number): Piece => ({
    kind: 'arc',
    length: (Math.PI / 2) * r,
    radius: r,
  });
  const straight = (l: number): Piece => ({
    kind: 'straight',
    length: l,
    radius: Infinity,
  });
  return [
    straight(A),
    arc(R[0]),
    straight(B),
    arc(R[1]),
    straight(C),
    arc(R[2]),
    straight(D),
    arc(R[3]),
  ];
}

interface Track {
  x: Float64Array;
  z: Float64Array;
  /** Heading, radians. */
  heading: Float64Array;
  /** 1/m, negative for right-handers. */
  curvature: Float64Array;
  /** Corner number at each metre, 0 on straights. */
  corner: Int32Array;
  /** Corner start and end, metres. */
  corners: { start: number; end: number; radius: number }[];
  length: number;
}

/** The circuit at one-metre spacing. */
export function demoTrack(): Track {
  const list = pieces();
  const total = list.reduce((s, p) => s + p.length, 0);
  const length = Math.round(total);
  const x = new Float64Array(length + 1);
  const z = new Float64Array(length + 1);
  const heading = new Float64Array(length + 1);
  const curvature = new Float64Array(length + 1);
  const corner = new Int32Array(length + 1);
  const corners: Track['corners'] = [];
  const starts: number[] = [];
  let at = 0;
  for (const p of list) {
    starts.push(at);
    if (p.kind === 'arc') corners.push({ start: at, end: at + p.length, radius: p.radius });
    at += p.length;
  }
  // Curvature over [a, b]: each piece's share of it, so every arc turns
  // exactly its quarter circle however it falls on the metre grid.
  const turn = (a: number, b: number) => {
    let sum = 0;
    list.forEach((p, i) => {
      if (p.kind !== 'arc') return;
      const overlap = Math.min(b, starts[i] + p.length) - Math.max(a, starts[i]);
      if (overlap > 0) sum -= overlap / p.radius;
    });
    return sum;
  };
  let px = 0;
  let pz = 0;
  let h = 0;
  for (let i = 0; i <= length; i++) {
    x[i] = px;
    z[i] = pz;
    heading[i] = h;
    const k = turn(i - 0.5, i + 0.5);
    curvature[i] = k;
    const c = corners.findIndex((cn) => i >= cn.start && i <= cn.end);
    corner[i] = c + 1;
    // One metre on, in two halves for the heading change within it.
    const dh = turn(i, Math.min(total, i + 1));
    px += Math.cos(h + dh / 2);
    pz += Math.sin(h + dh / 2);
    h += dh;
  }
  return { x, z, heading, curvature, corner, corners, length };
}

function accel(car: SyntheticCar, v: number): number {
  return Math.min(car.traction, car.power / Math.max(v, 1)) - car.drag * v * v;
}

/** A demo lap's names, said again in the language now picked: they are the viewer's words, not a game's. */
export function renameDemoLap(lap: LapTrace): void {
  if (lap.game !== 'demo') return;
  const car = DEMO_CARS.find((c) => c.ordinal === lap.car.ordinal);
  if (car) lap.car.name = car.name;
  lap.source = t('race.ui.demo.source');
  lap.track = t('race.ui.demo.circuit');
}

/** One flying lap of `car` around the demo circuit, with `faults`. */
export function syntheticLap(car: SyntheticCar, faults: Faults = {}, id = 'synthetic'): LapTrace {
  const track = demoTrack();
  const n = track.length + 1;
  // Speed caps: corner speeds, with the faults that change them.
  const cap = new Float64Array(n).fill(90);
  const brake = new Float64Array(n).fill(car.braking);
  const coast = new Uint8Array(n);
  track.corners.forEach((c, k) => {
    let v = Math.sqrt(car.grip * c.radius);
    if (faults.overslow?.corner === k + 1) v *= faults.overslow.factor;
    let from = Math.floor(c.start);
    let to = Math.ceil(c.end);
    if (faults.brakeEarly?.corner === k + 1) from -= faults.brakeEarly.metres;
    if (faults.lateThrottle?.corner === k + 1) to += faults.lateThrottle.metres;
    const late = faults.lateApex?.corner === k + 1 ? faults.lateApex : null;
    const middle = (c.start + c.end) / 2;
    for (let i = Math.max(0, from); i <= Math.min(n - 1, to); i++) {
      const scale = late ? (i < middle ? late.entry : late.exit) : 1;
      cap[i] = Math.min(cap[i], v * scale);
    }
    if (faults.brakeGently?.corner === k + 1) {
      for (let i = Math.max(0, from - 250); i < from; i++)
        brake[i] = car.braking * faults.brakeGently.factor;
    }
  });
  if (faults.lift) {
    for (let i = faults.lift.at; i < Math.min(n, faults.lift.at + faults.lift.metres); i++)
      coast[i] = 1;
  }
  // Forward and backward passes, twice round so the lap starts at the speed it
  // ends with - a flying lap.
  const v = new Float64Array(n);
  v[0] = cap[0];
  for (let round = 0; round < 2; round++) {
    for (let i = 1; i < n; i++) {
      const a = coast[i - 1] ? -0.6 - car.drag * v[i - 1] ** 2 : accel(car, v[i - 1]);
      v[i] = Math.min(cap[i], Math.sqrt(Math.max(1, v[i - 1] ** 2 + 2 * a)));
    }
    for (let i = n - 2; i >= 0; i--) v[i] = Math.min(v[i], Math.sqrt(v[i + 1] ** 2 + 2 * brake[i]));
    v[0] = v[n - 1];
  }
  // Channels.
  const ch = (): Float32Array => new Float32Array(n);
  const channels: Record<string, Float32Array> = {
    time: ch(),
    distance: ch(),
    x: ch(),
    y: ch(),
    z: ch(),
    speed: ch(),
    throttle: ch(),
    brake: ch(),
    steer: ch(),
    latAcc: ch(),
    longAcc: ch(),
    gear: ch(),
  };
  const offset = faults.offset ?? 0;
  let time = 0;
  for (let i = 0; i < n; i++) {
    if (i > 0) time += 2 / (v[i - 1] + v[i]);
    const next = Math.min(n - 1, i + 1);
    const along = i < n - 1 ? (v[next] ** 2 - v[i] ** 2) / 2 : channels.longAcc[i - 1];
    const h = track.heading[i];
    channels.time[i] = time;
    channels.distance[i] = i;
    // Left of the direction of travel is +90°.
    channels.x[i] = track.x[i] - Math.sin(h) * offset;
    channels.z[i] = track.z[i] + Math.cos(h) * offset;
    channels.speed[i] = v[i];
    channels.longAcc[i] = along;
    channels.latAcc[i] = v[i] * v[i] * track.curvature[i];
    // Positive steering is to the right, as every adapter delivers it; the
    // corners are right-handers in this left-handed, Forza-like world.
    channels.steer[i] = Math.max(-1, Math.min(1, -track.curvature[i] * 12));
    const braking = along < -1.5 && !coast[i];
    channels.brake[i] = braking ? Math.min(1, -along / car.braking) : 0;
    channels.throttle[i] = coast[i] || braking ? 0 : along > 0.05 ? 1 : 0.35;
    channels.gear[i] = Math.min(6, 1 + Math.floor(v[i] / 13));
  }
  if (faults.wheels) addWheels(channels, car, n);
  return {
    id,
    label: '',
    source: t('race.ui.demo.source'),
    game: 'demo',
    track: t('race.ui.demo.circuit'),
    car: { ordinal: car.ordinal, name: car.name, drivetrain: 'RWD' },
    seconds: time,
    complete: true,
    channels,
    count: n,
  };
}

/**
 * Per-wheel channels from the model's accelerations: the outside of a turn
 * compresses and heats, braking slips the tyres towards -1 at the car's limit,
 * a traction-limited launch slips the driven rears towards +1.
 */
function addWheels(ch: Record<string, Float32Array>, car: SyntheticCar, n: number): void {
  const wheels = ['FL', 'FR', 'RL', 'RR'] as const;
  const make = (name: string) => {
    for (const w of wheels) ch[`${name}.${w}`] = new Float32Array(n);
  };
  make('tireTemp');
  make('suspension');
  make('slipRatio');
  make('brakeTemp');
  make('tireWear');
  make('wheelLoad');
  // What a richer sim sends besides: the aids acting, the brake bias, the
  // engine speed - drawn as lamps, a level and a graph without any code
  // knowing these laps.
  const scalar = (name: string) => (ch[name] = new Float32Array(n));
  scalar('absActive');
  scalar('tcActive');
  scalar('brakeBias');
  scalar('rpm');
  const temp = [70, 70, 70, 70];
  const disc = [250, 250, 250, 250];
  const wear = [0, 0, 0, 0];
  for (let i = 0; i < n; i++) {
    const lat = ch.latAcc[i] / car.grip; // -1..1, sign by turn direction
    const lon = ch.longAcc[i];
    const dt = i > 0 ? ch.time[i] - ch.time[i - 1] : 0;
    const brake = lon < 0 ? Math.min(1, -lon / car.braking) : 0;
    const drive = lon > 0 ? Math.min(1, lon / car.traction) : 0;
    wheels.forEach((w, k) => {
      const right = w.endsWith('R') ? 1 : -1;
      const front = w.startsWith('F');
      // Load: lateral transfer to the outside, longitudinal to the front under
      // braking and the rear under power.
      const load =
        0.5 +
        0.32 * lat * right +
        (front ? 0.18 * brake - 0.1 * drive : -0.12 * brake + 0.12 * drive);
      ch[`suspension.${w}`][i] = Math.max(0, Math.min(1, load));
      // Tyres heat with work and cool towards 70 degrees.
      const work =
        Math.abs(lat) * (0.6 + load) + brake * (front ? 1.2 : 0.6) + (front ? 0 : drive * 0.8);
      temp[k] += dt * (work * 9 - (temp[k] - 70) * 0.05);
      ch[`tireTemp.${w}`][i] = temp[k];
      ch[`slipRatio.${w}`][i] =
        -brake * (front ? 0.85 : 0.7) + (front ? 0 : drive * (ch.speed[i] < 25 ? 0.95 : 0.4));
      // Discs heat under braking and cool in the air; tyres wear with work.
      disc[k] +=
        dt * (brake * (front ? 900 : 550) - (disc[k] - 150) * 0.06 * (1 + ch.speed[i] / 40));
      ch[`brakeTemp.${w}`][i] = disc[k];
      wear[k] += dt * work * 0.0004;
      ch[`tireWear.${w}`][i] = Math.min(1, wear[k]);
      ch[`wheelLoad.${w}`][i] = Math.max(0, load) * 7000 + 800;
    });
    ch.absActive[i] = brake > 0.97 ? 1 : 0;
    ch.tcActive[i] = drive > 0.97 && ch.speed[i] < 25 ? 1 : 0;
    ch.brakeBias[i] = 0.57;
    // Rising through each gear's band, as `gear` is derived from speed.
    ch.rpm[i] = 2000 + 5500 * ((ch.speed[i] % 13) / 13);
  }
}

// ---------------------------------------------------------------- rally

/** A rally car on gravel: far less grip and braking than on tarmac. */
export const GRAVEL_CAR: SyntheticCar = {
  name: 'Rally car',
  ordinal: 9101,
  grip: 7.5,
  braking: 7,
  traction: 5,
  power: 180,
  drag: 0.0007,
};

/** The same car on tarmac. */
export const TARMAC_CAR: SyntheticCar = { ...GRAVEL_CAR, grip: 12, braking: 11, traction: 7 };

/** How a stage run was driven, and what went wrong in it. */
export interface StageFaults {
  /**
   * The drift angle the car is turned to on the way into each corner,
   * radians: on gravel the slide is how a corner is driven (default 22°), on
   * tarmac a few degrees.
   */
  drift?: number;
  /**
   * At this corner the car is turned only to `drift` on the way in, and so
   * waits `metres` past the corner for the power: it was not pointing at the
   * exit.
   */
  underRotate?: { corner: number; drift: number; metres: number };
  /** A longer flight over the crest, metres in the air, and the speed the landing takes, m/s. */
  longJump?: { metres: number; landingLoss: number };
  /** Dabs of the left-foot brake with the throttle held, this many metres before each corner's braking. */
  dabs?: number;
  /** The tight bends of the twisty layout, never flat between them, in place of the open one. */
  twisty?: boolean;
}

interface StagePiece {
  length: number;
  /** 1/m, signed by which way it turns; 0 on a straight. */
  curvature: number;
}

const DEGREE = Math.PI / 180;

/** The open stage has four bends of each kind and a crest after the second; the twisty one five bends a short squirt apart. */
function stagePieces(twisty: boolean): StagePiece[] {
  const straight = (length: number): StagePiece => ({ length, curvature: 0 });
  const bend = (radius: number, degrees: number, left: boolean): StagePiece => ({
    length: radius * degrees * DEGREE,
    curvature: (left ? 1 : -1) / radius,
  });
  if (twisty) {
    return [
      straight(250),
      bend(20, 80, true),
      straight(60),
      bend(24, 80, false),
      straight(60),
      bend(20, 80, true),
      straight(60),
      bend(24, 80, false),
      straight(60),
      bend(20, 80, true),
      straight(300),
    ];
  }
  return [
    straight(250),
    bend(30, 90, true),
    straight(180),
    bend(45, 90, false),
    straight(260),
    bend(25, 120, true),
    straight(260),
    bend(60, 60, false),
    straight(300),
  ];
}

/** Where the crest is on the open stage, metres from the start (110 m into the straight after the second bend), and its usual flight. */
const CREST = { at: 250 + 47 + 180 + 71 + 110, flight: 15 };

/**
 * One run of `car` down a short gravel stage (or tarmac, with the tarmac car
 * and a small drift), recorded the way the rally recorders write it: the
 * velocity on the car's own axes, the air flagged.
 */
export function syntheticStage(car: SyntheticCar, faults: StageFaults = {}, id = 'stage'): LapTrace {
  const list = stagePieces(!!faults.twisty);
  const total = Math.round(list.reduce((s, p) => s + p.length, 0));
  const n = total + 1;
  // Per metre: curvature, and where each bend runs.
  const curvature = new Float64Array(n);
  const bends: { start: number; end: number; radius: number }[] = [];
  let at = 0;
  for (const p of list) {
    if (p.curvature) bends.push({ start: at, end: at + p.length, radius: 1 / Math.abs(p.curvature) });
    for (let i = Math.ceil(at); i < Math.min(n, at + p.length); i++) curvature[i] = p.curvature;
    at += p.length;
  }
  // Speed caps: each bend at its grip limit, held past its end by a late throttle.
  const cap = new Float64Array(n).fill(60);
  bends.forEach((b, k) => {
    const v = Math.sqrt(car.grip * b.radius);
    const late = faults.underRotate?.corner === k + 1 ? faults.underRotate.metres : 0;
    for (let i = Math.floor(b.start); i <= Math.min(n - 1, Math.ceil(b.end) + late); i++) cap[i] = Math.min(cap[i], v);
  });
  const jump = faults.twisty ? null : { from: CREST.at, to: CREST.at + (faults.longJump?.metres ?? CREST.flight) };
  const flying = (i: number) => !!jump && i >= jump.from && i < jump.to;
  // Forward from a rolling start, the landing taking its speed; then back for the braking.
  const v = new Float64Array(n);
  v[0] = Math.min(20, cap[0]);
  for (let i = 1; i < n; i++) {
    const a = flying(i - 1) ? -car.drag * v[i - 1] ** 2 : accel(car, v[i - 1]);
    v[i] = Math.min(cap[i], Math.sqrt(Math.max(1, v[i - 1] ** 2 + 2 * a)));
    if (jump && i === jump.to) v[i] = Math.max(1, v[i] - (faults.longJump?.landingLoss ?? 0));
  }
  for (let i = n - 2; i >= 0; i--) {
    if (jump && i + 1 === jump.to) continue;
    v[i] = Math.min(v[i], Math.sqrt(v[i + 1] ** 2 + 2 * car.braking));
  }
  // The drift angle: turned in over the 15 m before the bend, most of it a
  // third of the way round, a little left at its end.
  const habit = faults.drift ?? 22 * DEGREE;
  const beta = new Float64Array(n);
  bends.forEach((b, k) => {
    const peak = faults.underRotate?.corner === k + 1 ? faults.underRotate.drift : habit;
    const sign = curvature[Math.floor((b.start + b.end) / 2)] > 0 ? 1 : -1;
    const third = b.start + (b.end - b.start) / 3;
    for (let i = Math.max(0, Math.floor(b.start - 15)); i <= Math.min(n - 1, Math.ceil(b.end)); i++) {
      const f =
        i < b.start
          ? (0.5 * (i - (b.start - 15))) / 15
          : i < third
            ? 0.5 + (0.5 * (i - b.start)) / (third - b.start)
            : 1 - (0.8 * (i - third)) / (b.end - third);
      beta[i] = sign * peak * Math.max(0, f);
    }
  });
  const ch = (): Float32Array => new Float32Array(n);
  const channels: Record<string, Float32Array> = {
    time: ch(),
    distance: ch(),
    x: ch(),
    y: ch(),
    z: ch(),
    speed: ch(),
    throttle: ch(),
    brake: ch(),
    steer: ch(),
    latAcc: ch(),
    longAcc: ch(),
    gear: ch(),
    latVel: ch(),
    longVel: ch(),
    airborne: ch(),
  };
  let t = 0;
  let x = 0;
  let z = 0;
  let h = 0;
  for (let i = 0; i < n; i++) {
    if (i > 0) t += 2 / (v[i - 1] + v[i]);
    const along = i < n - 1 ? (v[i + 1] ** 2 - v[i] ** 2) / 2 : channels.longAcc[i - 1];
    channels.time[i] = t;
    channels.distance[i] = i;
    channels.x[i] = x;
    channels.z[i] = z;
    channels.speed[i] = v[i];
    channels.latVel[i] = v[i] * Math.sin(beta[i]);
    channels.longVel[i] = v[i] * Math.cos(beta[i]);
    const air = flying(i);
    channels.airborne[i] = air ? 1 : 0;
    // In the air nothing pushes sideways or back; the landing jolts both.
    const landing = !!jump && (i === jump.to || i === jump.to + 1);
    channels.longAcc[i] = air ? -car.drag * v[i] ** 2 : landing ? -25 : along;
    channels.latAcc[i] = air ? 0 : landing ? 20 : v[i] * v[i] * curvature[i];
    channels.steer[i] = Math.max(-1, Math.min(1, -curvature[i] * 12));
    const braking = along < -1.5 && !air;
    channels.brake[i] = braking ? Math.min(1, -along / car.braking) : 0;
    channels.throttle[i] = braking ? 0 : air || along > 0.05 ? 1 : 0.35;
    channels.gear[i] = Math.min(6, 1 + Math.floor(v[i] / 11));
    // One metre on.
    x += Math.cos(h + curvature[i] / 2);
    z += Math.sin(h + curvature[i] / 2);
    h += curvature[i];
  }
  // Left-foot dabs: a short touch of the brake with the throttle still down.
  if (faults.dabs) {
    for (let i = 1; i < n; i++) {
      if (!(channels.brake[i] > 0.1) || channels.brake[i - 1] > 0.1) continue;
      for (let k = i - faults.dabs; k < i - faults.dabs + 4; k++) {
        if (k <= 0 || channels.brake[k] > 0.1) continue;
        channels.brake[k] = 0.4;
        channels.throttle[k] = 1;
      }
    }
  }
  return {
    id,
    label: '',
    source: 'demo',
    game: 'ea-sports-wrc',
    track: 'Demo stage',
    car: { ordinal: car.ordinal, name: car.name, drivetrain: 'AWD' },
    seconds: t,
    complete: true,
    channels,
    count: n,
    meta: { discipline: 'rally' },
  };
}
