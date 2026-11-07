import { describe, expect, it } from 'vitest';
import { aeroAngles, bodyAxes, casOf, flightSeries, G0, isa, loadFactor, machOf, segmentsOf, valueAt, windowSlope } from './flight';
import type { Dataset } from '../state/types';

/** A dataset of one person's samples, positions in metres (x east, y up, z south). */
function track(samples: { t: number; x: number; y: number; z: number; heading?: number; pitch?: number; roll?: number }[], extra: Record<string, number[]> = {}): Dataset {
  const n = samples.length;
  const attrs = [];
  if (samples[0].roll !== undefined) {
    attrs.push({ name: 'heading', kind: 'number', data: Float32Array.from(samples.map((s) => s.heading!)), min: 0, max: 360 });
    attrs.push({ name: 'pitch', kind: 'number', data: Float32Array.from(samples.map((s) => s.pitch!)), min: -90, max: 90 });
    attrs.push({ name: 'roll', kind: 'number', data: Float32Array.from(samples.map((s) => s.roll!)), min: -180, max: 180 });
  }
  for (const [name, v] of Object.entries(extra)) attrs.push({ name, kind: 'number', data: Float32Array.from(v), min: 0, max: 1 });
  return {
    count: n,
    px: Float32Array.from(samples.map((s) => s.x)),
    py: Float32Array.from(samples.map((s) => s.y)),
    pz: Float32Array.from(samples.map((s) => s.z)),
    time: Float32Array.from(samples.map((s) => s.t)),
    personId: new Uint32Array(n),
    personLabels: ['a'],
    attrs,
    timeSorted: true,
    yaw: null,
    pitch: null,
    sessionId: null,
  } as unknown as Dataset;
}

describe('flight data', () => {
  it('has the ISA atmosphere', () => {
    expect(isa(0).T).toBeCloseTo(288.15);
    expect(isa(0).p).toBeCloseTo(101325, 0);
    expect(isa(0).rho).toBeCloseTo(1.225, 3);
    expect(isa(0).a).toBeCloseTo(340.3, 1);
    expect(isa(11000).T).toBeCloseTo(216.65);
    expect(isa(11000).p).toBeCloseTo(22632, -1);
    expect(machOf(295.07, 11000)).toBeCloseTo(1, 2);
  });

  it('estimates calibrated airspeed from true airspeed', () => {
    // At sea level CAS is TAS.
    expect(casOf(150, 0)).toBeCloseTo(150, 1);
    // 250 m/s TAS at 10 km: equivalent airspeed 145 m/s, CAS a little above it for compressibility.
    const eas = 250 * Math.sqrt(isa(10000).rho / 1.225);
    expect(casOf(250, 10000)).toBeGreaterThan(eas);
    expect(casOf(250, 10000)).toBeLessThan(eas * 1.08);
    // Supersonic at sea level stays continuous.
    expect(casOf(400, 0)).toBeCloseTo(400, -1);
  });

  it('takes slopes over a window, not frame to frame, and never across a gap', () => {
    const t = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 20, 20.25, 20.5];
    const v = t.map((x) => (x < 10 ? 3 * x : 1000 - 2 * x));
    const s = windowSlope(t, v, 0.5, segmentsOf(t, 5));
    for (let i = 0; i < 7; i++) expect(s[i]).toBeCloseTo(3);
    for (let i = 7; i < 10; i++) expect(s[i]).toBeCloseTo(-2);
    // A jitter of the sample at one frame moves the slope a little, not by its frame-to-frame jump.
    const w = t.slice(0, 7).map((x) => 3 * x);
    w[3] += 0.3;
    const j = windowSlope(t.slice(0, 7), w, 0.5);
    expect(Math.abs(j[3] - 3)).toBeLessThan(0.05);
    expect(Math.abs(j[2] - 3)).toBeLessThan(0.5);
  });

  it('builds body axes from heading, pitch and roll', () => {
    const a = bodyAxes(Math.PI / 2, 0, 0);
    expect(a.fwd[0]).toBeCloseTo(1);
    expect(a.right[1]).toBeCloseTo(-1);
    expect(a.up[2]).toBeCloseTo(1);
    // Rolled right 90°: the right wing points down, the top to the right.
    const r = bodyAxes(0, 0, Math.PI / 2);
    expect(r.right[2]).toBeCloseTo(-1);
    expect(r.up[0]).toBeCloseTo(1);
  });

  it('reads angle of attack and sideslip off the velocity', () => {
    const axes = bodyAxes(0, (5 * Math.PI) / 180, 0);
    // Flying level north with the nose 5° up: 5° angle of attack.
    const { aoa, aos } = aeroAngles([0, 100, 0], axes);
    expect((aoa * 180) / Math.PI).toBeCloseTo(5);
    expect(aos).toBeCloseTo(0);
    const side = aeroAngles([10, 100, 0], bodyAxes(0, 0, 0));
    expect((side.aos * 180) / Math.PI).toBeCloseTo(5.71, 1);
  });

  it('gives 1 g in level flight and the turn load in a banked turn', () => {
    expect(loadFactor([0, 0, 0], [0, 0, 1], [100, 0, 0])).toBeCloseTo(1);
    // A level 60° bank turn: 2 g. Centripetal g·tan60 toward the turn.
    const bank = Math.PI / 3;
    const axes = bodyAxes(0, 0, bank);
    const a: [number, number, number] = [G0 * Math.tan(bank), 0, 0];
    expect(loadFactor(a, axes.up, [0, 100, 0])).toBeCloseTo(2);
    expect(loadFactor(a, null, [0, 100, 0])).toBeCloseTo(2);
  });

  it('derives speed, climb, turn rate and G for a level turn without spikes', () => {
    // A circle of radius 1000 m at 200 m/s, flown clockwise (a right turn), sampled at 4 Hz with jitter.
    const R = 1000;
    const V = 200;
    const w = V / R;
    const bank = Math.atan((V * V) / R / G0);
    const samples = [];
    for (let i = 0; i < 400; i++) {
      const t = i * 0.25 + (i % 3 === 1 ? 0.02 : 0);
      const th = w * t;
      // East sin, north cos: heading = th, clockwise.
      const east = R * Math.sin(th);
      const north = R * Math.cos(th) - R;
      samples.push({ t, x: east + (i % 2 ? 0.2 : -0.2), y: 3000, z: -north, heading: ((th * 180) / Math.PI + 90) % 360, pitch: 0, roll: (bank * 180) / Math.PI });
    }
    const s = flightSeries(track(samples), 0)!;
    const mid = (id: string) => s.values[id].slice(20, 380);
    const range = (a: Float64Array) => [Math.min(...a), Math.max(...a)];
    const [vLo, vHi] = range(mid('tas'));
    expect(vLo).toBeGreaterThan(V * 0.98);
    expect(vHi).toBeLessThan(V * 1.02);
    const [tLo, tHi] = range(mid('turnRate'));
    const want = (w * 180) / Math.PI;
    expect(tLo).toBeGreaterThan(want * 0.95);
    expect(tHi).toBeLessThan(want * 1.05);
    const [gLo, gHi] = range(mid('g'));
    const gWant = 1 / Math.cos(bank);
    expect(gLo).toBeGreaterThan(gWant * 0.95);
    expect(gHi).toBeLessThan(gWant * 1.05);
    const [rLo, rHi] = range(mid('turnRadius'));
    expect(rLo).toBeGreaterThan(R * 0.95);
    expect(rHi).toBeLessThan(R * 1.05);
    expect(Math.abs(valueAt(s, 'vs', 30))).toBeLessThan(1);
    expect(valueAt(s, 'alt', 30)).toBeCloseTo(3000);
    expect(valueAt(s, 'mach', 30)).toBeCloseTo(V / isa(3000).a, 2);
    expect(s.source.ias).toBe('estimate');
    expect(s.rollSign).toBe(1);
    // A recording that counts roll the other way is found out by its turns.
    const mirrored = flightSeries(track(samples.map((p) => ({ ...p, roll: -p.roll }))), 0)!;
    expect(mirrored.rollSign).toBe(-1);
    expect(valueAt(mirrored, 'g', 30)).toBeCloseTo(valueAt(s, 'g', 30), 3);
  });

  it('prefers what the recording says', () => {
    const samples = Array.from({ length: 20 }, (_, i) => ({ t: i, x: i * 100, y: 1000, z: 0 }));
    const d = track(samples, { IAS: samples.map(() => 123), AOA: samples.map(() => 4), FuelWeight: samples.map(() => 1000), FuelWeight2: samples.map(() => 500) });
    const s = flightSeries(d, 0)!;
    expect(valueAt(s, 'ias', 5)).toBeCloseTo(123);
    expect(s.source.ias).toBe('data');
    expect(valueAt(s, 'aoa', 5)).toBeCloseTo(4);
    expect(valueAt(s, 'fuel', 5)).toBeCloseTo(1500);
    expect(valueAt(s, 'tas', 5)).toBeCloseTo(100);
    // Heading between 350 and 10 is 0, not 180.
    const h = flightSeries(track([{ t: 0, x: 0, y: 0, z: 0 }, { t: 1, x: 1, y: 0, z: 0 }], { HDG: [350, 10] }), 0)!;
    expect(valueAt(h, 'heading', 0.5)).toBeCloseTo(0);
  });
});
