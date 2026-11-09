import { describe, expect, it } from 'vitest';
import { VertexBuffer, type Vec3 } from '../race/geometry';
import type { Dataset } from '../state/types';
import { explosiveAmmo, OUTCOMES, type Outcome } from '../vehicle/hits';
import { OUTCOME_COLOURS } from '../vehicle/scene';
import { finish, newKit } from './kit';
import { HitMarkLayer, holeRadius, indexByUnit, lastAtOrBefore, Look, lookOf, type HitMarks, type MarkPose, type MarkView } from './hitmarks';
import { fitScale, snapToFigure, SNAP_STRIDE } from './snap';

/** Marks on units standing at x = 10 * person, facing +x, on their roofs: [time, person, outcome, killing, session]. */
function marks(list: [number, number, Outcome, boolean, number][]): HitMarks {
  const n = list.length;
  const normal = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) normal[i * 3 + 1] = 1;
  const m: HitMarks = {
    count: n,
    time: Float64Array.from(list, (m) => m[0]),
    person: Int32Array.from(list, (m) => m[1]),
    session: Int32Array.from(list, (m) => m[4]),
    local: new Float32Array(n * 3).fill(0.5),
    normal,
    dir: new Float32Array(n * 3).fill(NaN),
    calibre: new Float32Array(n).fill(120),
    outcome: Uint8Array.from(list, (m) => OUTCOMES.indexOf(m[2])),
    explosive: new Uint8Array(n),
    kill: Uint8Array.from(list, (m) => (m[3] ? 1 : 0)),
    body: new Uint8Array(n),
    look: Uint8Array.from(list, (m) => lookOf(m[2], 1)),
    turret: new Float32Array(n * 3).fill(NaN),
    yawHit: new Float32Array(n).fill(NaN),
    hit: Int32Array.from(list, (_, i) => 100 + i),
    row: new Int32Array(n).fill(-1),
    vehicle: new Int32Array(n),
    vehicles: [{ figure: '', marks: [], done: true, asked: true }],
    persons: new Int32Array(0),
    start: new Int32Array(1),
    marks: new Int32Array(0),
    largest: new Float32Array(0),
    scale: 1,
    scaleAsked: true,
  };
  indexByUnit(m);
  return m;
}

function view(t: number, seconds: number, session = -1, float = false): MarkView {
  return {
    t,
    seconds,
    float,
    session,
    eye: [0, 50, 200],
    pixelSize: () => 0.001,
    units: 1,
    dataset: { attrs: [], count: 0 } as unknown as Dataset,
    poseOf: (p: number, _b: number, o: MarkPose) => {
      if (p < 0) return false;
      o.x = 10 * p;
      o.y = 0;
      o.z = 0;
      o.f[0] = 1;
      o.f[1] = 0;
      o.f[2] = 0;
      o.u[0] = 0;
      o.u[1] = 1;
      o.u[2] = 0;
      o.row = -1;
      return true;
    },
  };
}

/** The distinct colours of a buffer's vertices, r g b rounded, with the most opaque alpha of each. */
function colours(b: VertexBuffer): Map<string, number> {
  const out = new Map<string, number>();
  for (let i = 0; i < b.count; i++) {
    const o = i * 7;
    const k = [b.data[o + 3], b.data[o + 4], b.data[o + 5]].map((v) => v.toFixed(2)).join(',');
    out.set(k, Math.max(out.get(k) ?? 0, b.data[o + 6]));
  }
  return out;
}

const key = (c: readonly number[]) => c.map((v) => v.toFixed(2)).join(',');

describe('hit marks', () => {
  it('finds the last mark at or before a time', () => {
    const t = Float64Array.of(1, 2, 2, 5);
    expect(lastAtOrBefore(t, 4, 0.5)).toBe(-1);
    expect(lastAtOrBefore(t, 4, 2)).toBe(2);
    expect(lastAtOrBefore(t, 4, 9)).toBe(3);
  });

  it('looks like what the hit did', () => {
    expect(lookOf('damage', 1)).toBe(Look.Hole);
    expect(lookOf('kill', NaN)).toBe(Look.Hole);
    expect(lookOf('nodamage', 0.9)).toBe(Look.Splash);
    expect(lookOf('nodamage', 0.2)).toBe(Look.Gouge);
    expect(lookOf('nodamage', NaN)).toBe(Look.Splash);
    expect(lookOf('hit', 1)).toBe(Look.Bullet);
    // An explosive round's blast, whatever it did; armour piercing ones, filled or not, by what they did.
    expect(lookOf('nodamage', 0.2, true)).toBe(Look.Scorch);
    expect(lookOf('kill', 1, explosiveAmmo('HEAT-FS'))).toBe(Look.Scorch);
    for (const e of ['explosive', 'HE', 'HESH', 'HEAT', 'SAPHEI', 'ATGM']) expect(explosiveAmmo(e)).toBe(true);
    for (const k of ['kinetic', 'APFSDS', 'APDS', 'APHE', 'APCBC', 'HVAP', '', null]) expect(explosiveAmmo(k)).toBe(false);
    // Sized by the calibre: a 120 mm hole is ten times a 12 mm one.
    expect(holeRadius(120, 0) / holeRadius(12, 0)).toBeCloseTo(10, 5);
    expect(holeRadius(NaN, 1)).toBeLessThan(holeRadius(NaN, 0));
  });

  it("draws an explosive round's blast wider than a kinetic round's splash of the same calibre", () => {
    const m = marks([
      [1, 0, 'nodamage', false, -1],
      [1, 1, 'nodamage', false, -1],
    ]);
    m.explosive[1] = 1;
    m.look[1] = Look.Scorch;
    const layer = new HitMarkLayer();
    const out = new VertexBuffer();
    expect(layer.build(m, view(10, Infinity), out)).toBe(2);
    expect(Array.from(layer.drawn.hit.subarray(0, 2))).toEqual([100, 101]);
    expect(layer.drawn.radius[1]).toBeGreaterThan(layer.drawn.radius[0] * 1.8);
    expect(colours(out).has(key(OUTCOME_COLOURS.nodamage))).toBe(true);
  });

  it('leaves the hits on the unit for as long as it is there, newest first, ringed in their outcome colours', () => {
    const m = marks([
      [1, 0, 'damage', false, -1],
      [8, 1, 'critical', false, -1],
      [9, 2, 'nodamage', false, -1],
      [12, 1, 'hit', false, -1],
    ]);
    const layer = new HitMarkLayer();
    const out = new VertexBuffer();
    expect(layer.build(m, view(10, Infinity), out)).toBe(3);
    // The nearest unit's first (unit 0, then 1, then 2); the one at 12 s is still to come.
    expect(Array.from(layer.drawn.hit.subarray(0, 3))).toEqual([100, 101, 102]);
    const c = colours(out);
    expect(c.has(key(OUTCOME_COLOURS.critical))).toBe(true);
    expect(c.has(key(OUTCOME_COLOURS.damage))).toBe(true);
    // On the roof of unit 2 (x = 20, half a metre up), a little above it.
    expect(layer.drawn.xyz[6]).toBeCloseTo(20.5, 3);
    expect(layer.drawn.xyz[7]).toBeGreaterThan(0.5);
    expect(layer.drawn.xyz[7]).toBeLessThan(0.6);
    // In a 5 s window only the two newest.
    out.reset();
    expect(layer.build(m, view(10, 5), out)).toBe(2);
  });

  it('fades a mark at the end of a set time, and draws the floating marker of a fresh killing shot', () => {
    const m = marks([[0, 0, 'kill', true, -1]]);
    const layer = new HitMarkLayer();
    const out = new VertexBuffer();
    layer.build(m, view(1, 10), out);
    const fresh = colours(out).get(key(OUTCOME_COLOURS.kill))!;
    out.reset();
    layer.build(m, view(9.5, 10), out);
    expect(colours(out).get(key(OUTCOME_COLOURS.kill))!).toBeLessThan(fresh);
    out.reset();
    expect(layer.build(m, view(11, 10), out)).toBe(0);
    out.reset();
    layer.build(m, view(1, Infinity, -1, true), out);
    // The floating marker's white ring round the killing shot.
    expect([...colours(out).keys()].some((k) => k.startsWith('1.60'))).toBe(true);
  });

  it('keeps to the round shown and to units that are drawn', () => {
    const m = marks([
      [1, 0, 'hit', false, 0],
      [2, 1, 'hit', false, 1],
      [3, -1, 'hit', false, 1],
    ]);
    const layer = new HitMarkLayer();
    const out = new VertexBuffer();
    expect(layer.build(m, view(5, 10, 1), out)).toBe(1);
    expect(layer.drawn.hit[0]).toBe(101);
    out.reset();
    expect(layer.build(m, view(5, 10), out)).toBe(2);
  });

  it('puts a point onto the nearest surface of the figure, turned to it', () => {
    // A box 4 m long, 2 m high, 2 m wide.
    const k = newKit();
    const c: Vec3[] = [];
    for (const x of [-2, 2]) for (const y of [0, 2]) for (const z of [-1, 1]) c.push([x, y, z]);
    const quad = (a: number, b: number, cc: number, d: number) => {
      for (const i of [a, b, cc, a, cc, d]) k.team.vn(c[i], [0, 0, 0], [1, 1, 1]);
    };
    quad(0, 1, 3, 2);
    quad(4, 6, 7, 5);
    quad(0, 4, 5, 1);
    quad(2, 3, 7, 6);
    quad(1, 5, 7, 3);
    quad(0, 2, 6, 4);
    const t = finish(k, 'ground');
    // Above the roof, and off the right side with the shot going left.
    const out = snapToFigure(t, Float32Array.of(0.5, 2.4, 0.2, 0.3, 1, 1.5), Float32Array.of(NaN, NaN), Float32Array.of(NaN, NaN, NaN, 0, 0, -1));
    expect(out[1]).toBeCloseTo(2, 5);
    expect(out[4]).toBeCloseTo(1, 5);
    expect(out[SNAP_STRIDE + 2]).toBeCloseTo(1, 5);
    expect(out[SNAP_STRIDE + 5]).toBeCloseTo(1, 5);
    // Just inside the right side near the front, the shot coming from ahead: on the front, not the nearer side.
    const front = snapToFigure(t, Float32Array.of(1.5, 1, 0.9), Float32Array.of(NaN), Float32Array.of(-1, 0, 0));
    expect(front[0]).toBeCloseTo(2, 5);
    expect(front[2]).toBeCloseTo(0.9, 5);
    expect(front[3]).toBeCloseTo(1, 5);
    // Points on the front, the sides and the roof, sent 1.6 times too far out: the scale found brings them back.
    const pts: number[] = [];
    const dir: number[] = [];
    for (let i = 0; i < 30; i++) {
      const a = (i % 7) / 7 - 0.4, b = (i % 5) / 5;
      const [p, d] = [
        [[2, 0.2 + b * 1.6, a * 2], [-1, 0, 0]],
        [[a * 3.5, 0.2 + b * 1.6, 1], [0, 0, -1]],
        [[a * 3.5, 2, a * 1.5], [0, -1, 0]],
      ][i % 3];
      pts.push(...p.map((v) => v * 1.6));
      dir.push(...d);
    }
    const scale = fitScale([{ t, pts: Float32Array.from(pts), dir: Float32Array.from(dir) }]);
    expect(scale).toBeGreaterThan(0.6);
    expect(scale).toBeLessThan(0.65);
    // In the figure's metres already: left as they are.
    expect(fitScale([{ t, pts: Float32Array.from(pts, (v) => v / 1.6), dir: Float32Array.from(dir) }])).toBe(1);
  });
});
