import { describe, expect, it } from 'vitest';
import { impacts, struckMask } from './impacts';
import type { LapTrace } from './lap';

/**
 * A straight run at 60 Hz: 50 m/s cornering back and forth at about 15 m/s²,
 * with `edit` changing it - a wall, a jump.
 */
function run(edit: (c: Record<string, Float32Array>, at: (t: number) => number) => void = () => {}): LapTrace {
  const n = 60 * 40;
  const c: Record<string, Float32Array> = {};
  for (const name of ['time', 'x', 'y', 'z', 'speed', 'latAcc', 'longAcc']) c[name] = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / 60;
    c.time[i] = t;
    c.speed[i] = 50;
    c.latAcc[i] = 15 * Math.sin(t / 2);
    c.longAcc[i] = 2 * Math.cos(t / 3);
    c.z[i] = 50 * t;
  }
  edit(c, (t) => Math.round(t * 60));
  return { id: 'run', label: '', source: 'test', game: 'test', car: {}, seconds: 40, complete: true, channels: c, count: n };
}

describe('impacts', () => {
  it('finds nothing in driving at the limit', () => {
    expect(impacts(run())).toEqual([]);
  });

  it('finds a wall head-on as a crash, and a scrape along a side as a hit', () => {
    const lap = run((c, at) => {
      // Head-on at 20 s: 180 down to 70 km/h, a spike decaying over 0.3 s.
      for (let i = at(20); i < c.time.length; i++) c.speed[i] = 70 / 3.6;
      for (let k = 0; k < 18; k++) c.longAcc[at(20) + k] = -190 * Math.exp(-k / 5);
      for (let i = at(20) + 1; i < c.time.length; i++) c.speed[i] = Math.min(50, 70 / 3.6 + (c.time[i] - 20) * 4);
      // Along a side at 30 s: 6 km/h gone, 70 m/s² sideways.
      for (let k = 0; k < 10; k++) c.latAcc[at(30) + k] = 70 * Math.exp(-k / 4);
      for (let i = at(30); i < at(31); i++) c.speed[i] = Math.min(c.speed[i], 50 - 6 / 3.6);
    });
    const found = impacts(lap);
    expect(found.map((h) => [h.kind, h.direction])).toEqual([
      ['crash', 'front'],
      ['hit', 'side'],
    ]);
    expect(found[0].time).toBeCloseTo(20, 1);
    expect((found[0].before - found[0].after) * 3.6).toBeGreaterThan(100);
    // The car's own limits are measured without it.
    const mask = struckMask(lap);
    expect(mask[Math.round(20.5 * 60)]).toBe(1);
    expect(mask[Math.round(10 * 60)]).toBe(0);
  });

  it('takes no landing for a hit, and no rewind', () => {
    const lap = run((c, at) => {
      c.airborne = new Float32Array(c.time.length);
      for (let i = at(15); i < at(16); i++) c.airborne[i] = 1;
      for (let k = 0; k < 10; k++) c.longAcc[at(16) + k] = -120 * Math.exp(-k / 3);
      // A rewind at 25 s: the speed jumps with no force at all.
      for (let i = at(25); i < at(26); i++) c.speed[i] = 20;
    });
    expect(impacts(lap)).toEqual([]);
  });
});
