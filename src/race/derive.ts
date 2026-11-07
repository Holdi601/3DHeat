/**
 * What a lap's own channels imply, for games that do not send it.
 *
 * The car-control analysis needs the same few quantities from every game - how
 * far the car points away from where it is going, whether a wheel is locked or
 * spinning, whether the car is in the air - and games send them in very
 * different forms: Forza sends slip per wheel and the car's velocity in its own
 * frame; a rally game sends a world velocity, the car's axes and each wheel's
 * speed; others send only a heading. So each is derived here from whatever the
 * lap has, once, under its canonical name, and the analysis reads only those.
 *
 * Nothing already present is overwritten: a game's own value always wins over
 * a derived one.
 */

import type { LapTrace } from './lap';
import { WHEELS } from './schema';

function wrap(a: number): number {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

function median(values: number[]): number {
  if (!values.length) return Number.NaN;
  const s = values.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

/**
 * The direction of travel at each sample, from positions a few metres apart:
 * `atan2(dx, dz)`.
 */
export function courseOf(lap: LapTrace): Float32Array {
  const { x, z } = lap.channels;
  const n = lap.count;
  const out = new Float32Array(n);
  let last = 0;
  for (let i = 0; i < n; i++) {
    let a = i;
    let b = i;
    while (a > 0 && Math.hypot(x[i] - x[a], z[i] - z[a]) < 2) a--;
    while (b < n - 1 && Math.hypot(x[b] - x[i], z[b] - z[i]) < 2) b++;
    const dx = x[b] - x[a];
    const dz = z[b] - z[a];
    if (Math.hypot(dx, dz) > 0.2) last = Math.atan2(dx, dz);
    out[i] = last;
  }
  return out;
}

/**
 * The car's heading from the game's yaw, fitted to the direction of travel
 * (sign and offset) and trusted only if it then agrees with it at speed; null
 * otherwise. Every game has its own zero and its own sense of rotation.
 */
export function headingOf(lap: LapTrace, course: Float32Array): Float32Array | null {
  const yaw = lap.channels.yaw;
  const speed = lap.channels.speed;
  if (!yaw) return null;
  let best: { sign: number; offset: number; spread: number } | null = null;
  for (const sign of [1, -1]) {
    let cx = 0;
    let cz = 0;
    let count = 0;
    for (let i = 0; i < lap.count; i++) {
      if (!(speed?.[i] > 10) || !Number.isFinite(yaw[i])) continue;
      const d = course[i] - sign * yaw[i];
      cx += Math.cos(d);
      cz += Math.sin(d);
      count++;
    }
    if (count < 20) continue;
    const r = Math.hypot(cx, cz) / count;
    if (!best || 1 - r < best.spread) best = { sign, offset: Math.atan2(cz, cx), spread: 1 - r };
  }
  if (!best || best.spread > 0.05) return null;
  const out = new Float32Array(lap.count);
  for (let i = 0; i < lap.count; i++) out[i] = wrap(best.sign * yaw[i] + best.offset);
  return out;
}

/**
 * The drift angle: between where the car points and where it goes, signed as
 * the game's lateral velocity is. From the car-frame velocity when the game
 * sends it; otherwise heading against the direction of travel, at speed.
 */
function bodySlip(lap: LapTrace): Float32Array | null {
  const { latVel, longVel, speed } = lap.channels;
  const n = lap.count;
  if (latVel && longVel) {
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      // Below walking pace the angle means nothing: a car stopped sideways.
      const v = Math.hypot(latVel[i], longVel[i]);
      out[i] = v > 3 ? Math.atan2(latVel[i], Math.abs(longVel[i])) : 0;
    }
    return out;
  }
  const course = courseOf(lap);
  const heading = headingOf(lap, course);
  if (!heading) return null;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = speed && speed[i] > 3 ? wrap(course[i] - heading[i]) : 0;
  return out;
}

/** Yaw rate from the heading, where the game sends a heading but no rate. */
function yawRate(lap: LapTrace): Float32Array | null {
  const { yaw, time } = lap.channels;
  if (!yaw || !time) return null;
  const n = lap.count;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - 1);
    const b = Math.min(n - 1, i + 1);
    const dt = time[b] - time[a];
    out[i] = dt > 0 ? wrap(yaw[b] - yaw[a]) / dt : 0;
  }
  return out;
}

/**
 * In the air: every wheel off the ground, fully extended, or carrying nothing.
 * A jump's landing and the air before it are no place to judge grip, and a
 * rally stage has plenty of both.
 */
function airborne(lap: LapTrace): Float32Array | null {
  const c = lap.channels;
  const n = lap.count;
  const contact = WHEELS.map((w) => c[`groundContact.${w}`]);
  const travel = WHEELS.map((w) => c[`suspension.${w}`]);
  const load = WHEELS.map((w) => c[`wheelLoad.${w}`]);
  let test: ((i: number) => boolean) | null = null;
  if (contact.every(Boolean)) test = (i) => contact.every((v) => !(v![i] > 0.5));
  else if (load.every(Boolean)) {
    const typical = load.map((v) => median(Array.from(v!).filter(Number.isFinite)));
    test = (i) => load.every((v, k) => !(v![i] > 0.05 * typical[k]));
  } else if (travel.every(Boolean)) test = (i) => travel.every((v) => !(v![i] > 0.02));
  if (!test) return null;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = test(i) ? 1 : 0;
  // One stray sample is not a flight.
  for (let i = 1; i < n - 1; i++) if (out[i] && !out[i - 1] && !out[i + 1]) out[i] = 0;
  return out;
}

/**
 * Each wheel's slip ratio from its rotation and the car's speed, where the game
 * sends wheel speeds but no slip: `(ω r - v) / v`. The rolling radius comes
 * from the lap itself - the median of `v / ω` wherever the car coasts in a
 * straight line, when no wheel is being driven or braked hard.
 */
function slipFromWheels(lap: LapTrace): Record<string, Float32Array> | null {
  const c = lap.channels;
  const n = lap.count;
  const speed = c.speed;
  if (!speed) return null;
  const surface = WHEELS.map((w) => c[`wheelSurfaceSpeed.${w}`]);
  const omega = WHEELS.map((w) => c[`wheelSpeed.${w}`]);
  if (!surface.every(Boolean) && !omega.every(Boolean)) return null;
  const throttle = c.throttle;
  const brake = c.brake;
  const longAcc = c.longAcc;
  const air = c.airborne;
  const rolling = (i: number) =>
    speed[i] > 10 &&
    !(air?.[i] > 0.5) &&
    (!throttle || throttle[i] < 0.3) &&
    (!brake || brake[i] < 0.05) &&
    (!longAcc || Math.abs(longAcc[i]) < 3);
  const out: Record<string, Float32Array> = {};
  WHEELS.forEach((w, k) => {
    let wheel = surface[k];
    if (!wheel) {
      const o = omega[k]!;
      const ratios: number[] = [];
      for (let i = 0; i < n; i++) if (rolling(i) && Math.abs(o[i]) > 1) ratios.push(speed[i] / Math.abs(o[i]));
      // Too little coasting to trust: every sample at speed.
      if (ratios.length < 20) {
        for (let i = 0; i < n; i++) if (speed[i] > 10 && Math.abs(o[i]) > 1) ratios.push(speed[i] / Math.abs(o[i]));
      }
      const radius = median(ratios);
      if (!(radius > 0.1 && radius < 1)) return;
      wheel = new Float32Array(n);
      for (let i = 0; i < n; i++) wheel[i] = Math.abs(o[i]) * radius;
    }
    const slip = new Float32Array(n);
    for (let i = 0; i < n; i++) slip[i] = speed[i] > 3 ? (Math.abs(wheel[i]) - speed[i]) / speed[i] : 0;
    out[`slipRatio.${w}`] = slip;
  });
  return Object.keys(out).length === 4 ? out : null;
}

/**
 * Loose ground under the car, sample by sample, where the game says: Forza
 * rumbles the tyres on gravel, dirt and grass (and on a kerb, for a moment -
 * so it counts only when it lasts a third of a second). 1 loose, 0 sealed.
 */
function looseGround(lap: LapTrace): Float32Array | null {
  const c = lap.channels;
  const rumble = WHEELS.map((w) => c[`surfaceRumble.${w}`]);
  if (!rumble.every(Boolean)) return null;
  const time = c.time;
  const n = lap.count;
  const raw = new Uint8Array(n);
  let any = 0;
  for (let i = 0; i < n; i++) {
    let wheels = 0;
    for (const r of rumble) if (r![i] > 0.001) wheels++;
    // Most of the car on it, not one wheel over a kerb.
    raw[i] = wheels >= 2 ? 1 : 0;
    any += raw[i];
  }
  if (!any) return null;
  const out = new Float32Array(n);
  let start = -1;
  for (let i = 0; i <= n; i++) {
    if (i < n && raw[i]) {
      if (start < 0) start = i;
      continue;
    }
    if (start >= 0 && time[i - 1] - time[start] >= 0.33) for (let k = start; k < i; k++) out[k] = 1;
    start = -1;
  }
  // Bridge short gaps: a smooth patch on a gravel road is still the gravel road.
  let gapFrom = -1;
  for (let i = 1; i < n; i++) {
    if (!out[i] && out[i - 1]) gapFrom = i;
    if (out[i] && gapFrom >= 0) {
      if (time[i] - time[gapFrom] < 1) for (let k = gapFrom; k < i; k++) out[k] = 1;
      gapFrom = -1;
    }
  }
  return out;
}

/**
 * Add what the lap implies and does not carry. Idempotent: run it as often as
 * a lap passes by.
 */
export function deriveChannels(lap: LapTrace): LapTrace {
  const c = lap.channels;
  if (!c.loose) {
    const l = looseGround(lap);
    if (l) c.loose = l;
  }
  if (!c.airborne) {
    const a = airborne(lap);
    if (a) c.airborne = a;
  }
  if (!c.yawRate) {
    const r = yawRate(lap);
    if (r) c.yawRate = r;
  }
  if (!c.bodySlip && c.x && c.z) {
    const b = bodySlip(lap);
    if (b) c.bodySlip = b;
  }
  if (!('slipRatio.FL' in c)) {
    const s = slipFromWheels(lap);
    if (s) {
      Object.assign(c, s);
      lap.meta = { ...lap.meta, slip: 'physical' };
    }
  }
  return lap;
}
