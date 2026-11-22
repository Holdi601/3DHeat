import { describe, expect, it } from 'vitest';
import { cutAtLine, readLaps } from './adapters';
import { matchCar } from './carMatch';
import type { CarPack } from './carPack';

/** A circle of `radius` metres driven `laps` times at 30 m/s, sampled 10 times a second, from (0, 0) heading +x. */
function circle(laps: number, radius = 100, offset = 0) {
  const time: number[] = [];
  const x: number[] = [];
  const y: number[] = [];
  const z: number[] = [];
  const n = Math.round((laps * 2 * Math.PI * radius) / 30 / 0.1);
  for (let i = 0; i <= n; i++) {
    const a = (i * 0.1 * 30) / radius + offset;
    time.push(i * 0.1);
    x.push(radius * Math.sin(a));
    y.push(0);
    z.push(radius * (1 - Math.cos(a)));
  }
  return { time, x, y, z };
}

function lap(complete: boolean, laps: number, offset = 0) {
  return { format: 'heat3d-lap', version: 1, lap: { complete, seconds: (laps * 2 * Math.PI * 100) / 30 }, channels: circle(laps, 100, offset) };
}

describe('heat3d-session files', () => {
  it('reads every lap of a session, with the session-wide track, layout and car', () => {
    const doc = {
      format: 'heat3d-session',
      version: 1,
      game: 'assetto-corsa',
      track: 'ks_nurburgring',
      layout: 'layout_gp_a',
      car: { name: 'bmw_z4_gt3' },
      laps: [lap(true, 1), lap(true, 1)],
    };
    const laps = readLaps(JSON.stringify(doc), 'session.json');
    expect(laps).toHaveLength(2);
    expect(laps[0].game).toBe('assetto-corsa');
    // The layout is a course of its own.
    expect(laps[0].track).toBe('ks_nurburgring layout_gp_a');
    expect(laps[1].car.name).toBe('bmw_z4_gt3');
    // An AC car's folder name is its id, for the car file.
    expect(laps[1].car.id).toBe('bmw_z4_gt3');
    expect(laps[0].source).toBe('session.json #1');
  });

  it("cuts the other cars' runs into laps where they pass the session's line", () => {
    const other = circle(2.6, 100, -0.3);
    const doc = {
      format: 'heat3d-session',
      version: 1,
      game: 'assetto-corsa-competizione',
      track: 'monza',
      laps: [lap(true, 1)],
      others: [{ id: '7', channels: other }],
    };
    const laps = readLaps(JSON.stringify(doc), 's.json');
    const theirs = laps.filter((l) => l.car.name === '#7');
    // In before the line (part), two whole laps, and the part after.
    expect(theirs.filter((l) => l.complete)).toHaveLength(2);
    expect(theirs.filter((l) => !l.complete).length).toBeGreaterThanOrEqual(1);
    const whole = theirs.find((l) => l.complete)!;
    expect(whole.seconds).toBeCloseTo((2 * Math.PI * 100) / 30, 0);
    expect(whole.track).toBe('monza');
  });

  it('keeps the other cars as whole runs when the session has no complete lap', () => {
    const doc = { format: 'heat3d-session', game: 'assetto-corsa', laps: [lap(false, 0.5)], others: [{ id: 3, channels: circle(1.5) }] };
    const laps = readLaps(JSON.stringify(doc), 's.json');
    expect(laps).toHaveLength(2);
    expect(laps[1].complete).toBe(false);
  });

  it('a pass the wrong way round is no crossing', () => {
    const c = circle(2);
    const back = { time: Float32Array.from(c.time), x: Float32Array.from(c.x.slice().reverse()), z: Float32Array.from(c.z.slice().reverse()) };
    expect(cutAtLine(back, { x: 0, z: 0, dx: 1, dz: 0 }).every((p) => !p.complete)).toBe(true);
  });

  it("an AC car matches the car file's car of the same folder exactly", () => {
    const pack = {
      game: 'assetto-corsa',
      source: 'test',
      data: new ArrayBuffer(0),
      cars: [
        { key: 'ktm_xbow_r', ordinals: [], make: 'KTM', model: 'X-Bow R', year: 2014, height: 1.2, length: 3.7, wheels: [], lights: [], vertexAt: 0, vertices: 0, faceAt: 0, faces: 0 },
        { key: 'bmw_z4', ordinals: [], make: 'BMW', model: 'Z4', year: 2010, height: 1.3, length: 4.2, wheels: [], lights: [], vertexAt: 0, vertices: 0, faceAt: 0, faces: 0 },
      ],
    } as unknown as CarPack;
    const m = matchCar({ id: 'ktm_xbow_r', name: 'ktm_xbow_r' }, 'assetto-corsa', [pack]);
    expect(m.kind).toBe('exact');
    expect(m.car?.key).toBe('ktm_xbow_r');
  });
});
