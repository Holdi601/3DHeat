import { describe, expect, it } from 'vitest';
import { deriveChannels } from './derive';
import { envelope } from './envelope';
import type { LapTrace } from './lap';
import { compareProfiles, profile } from './profile';
import { DEMO_CARS, syntheticLap } from './synthetic';

const [GRIP, POWER] = DEMO_CARS;

function measured(lap: LapTrace) {
  deriveChannels(lap);
  return profile(String(lap.car.ordinal), [lap], envelope([lap]));
}

/** 40 s at 60 Hz: up to 50 m/s flat out, then held there - on a straight, or round a long bend. */
function topSpeedRun(bend: boolean): LapTrace {
  const n = 60 * 40;
  const c: Record<string, Float32Array> = {};
  for (const name of ['time', 'x', 'y', 'z', 'speed', 'latAcc', 'longAcc', 'throttle', 'brake']) c[name] = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / 60;
    c.time[i] = t;
    c.speed[i] = Math.min(50, 10 + 2 * t);
    c.longAcc[i] = t < 20 ? 2 : 0;
    c.latAcc[i] = bend && t > 18 ? 15 : 0;
    c.throttle[i] = 1;
    c.z[i] = 40 * t;
  }
  return { id: 'run', label: '', source: 'test', game: 'test', car: { ordinal: 1 }, seconds: 40, complete: true, channels: c, count: n };
}

describe('car profile', () => {
  it('tells the grippy car from the powerful one', () => {
    const grip = measured(syntheticLap(GRIP, {}, 'g'));
    const power = measured(syntheticLap(POWER, {}, 'p'));
    // Grip held for half a second: the model's own limits.
    expect(grip.grip).toBeCloseTo(GRIP.grip, 0);
    expect(power.grip).toBeCloseTo(POWER.grip, 0);
    expect(power.pull.mid).toBeGreaterThan(1.05 * grip.pull.mid);
    const said = compareProfiles(grip, power, 'Grip car', 'Power car');
    expect(said.summary[0]).toMatch(/^Grip car holds more grip.*but pulls less/);
    expect(said.summary[1]).toMatch(/^Power car accelerates better.*but cannot turn as hard/);
    expect(said.driving.join(' ')).toMatch(/In Grip car.*"U" line.*in Power car.*"V" line/);
  });

  it('counts a rear that had to be caught, and says so', () => {
    const stable = syntheticLap(GRIP, {}, 'stable');
    const loose = syntheticLap(GRIP, {}, 'loose');
    for (const lap of [stable, loose]) {
      deriveChannels(lap);
      // The model drives on rails: no drift, until it is given some.
      lap.channels.bodySlip ??= new Float32Array(lap.count);
    }
    // Three times in the corners: 0.4 rad of drift, the wheel turned the other way.
    const { bodySlip, steer, latAcc, speed } = loose.channels;
    // In the middle of the first three corners at the limit.
    let caught = 0;
    for (let i = 1; i < loose.count && caught < 3; i++) {
      if (!(Math.abs(latAcc[i]) > 0.9 * GRIP.grip && speed[i] > 10) || Math.abs(latAcc[i - 1]) > 0.9 * GRIP.grip) continue;
      let end = i;
      while (end + 1 < loose.count && Math.abs(latAcc[end + 1]) > 0.9 * GRIP.grip) end++;
      const mid = Math.round((i + end) / 2);
      for (let k = mid - 10; k < mid + 10; k++) {
        bodySlip[k] = 0.4;
        steer[k] = -steer[k];
      }
      caught++;
      i = end;
    }
    expect(caught).toBe(3);
    const a = profile('loose', [loose], envelope([loose]));
    const b = profile('stable', [stable], envelope([stable]));
    expect(a.rearSlides).toBe(3);
    expect(b.rearSlides).toBe(0);
    const said = compareProfiles(a, b, 'Loose car', 'Stable car');
    expect(said.summary[0]).toMatch(/loses the rear far more easily/);
    expect(said.summary[1]).toMatch(/is more stable/);
    expect(said.points.join(' ')).toMatch(/Loose car loses the rear more easily: .*3\.0 times a lap against 0\.0/);
  });

  it('tops out where it stops gaining on a straight, not round a bend taken flat', () => {
    const straight = topSpeedRun(false);
    const bend = topSpeedRun(true);
    expect(profile('s', [straight], envelope([straight])).topsOut).toBeCloseTo(50, 0);
    expect(profile('b', [bend], envelope([bend])).topsOut).toBeNaN();
  });
});
