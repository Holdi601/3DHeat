import { describe, expect, it } from 'vitest';
import { VertexBuffer } from '../race/geometry';
import type { Dataset } from '../state/types';
import { OUTCOMES, type Outcome } from '../vehicle/hits';
import { OUTCOME_COLOURS } from '../vehicle/scene';
import { HitMarkLayer, lastAtOrBefore, type HitMarks, type MarkPose, type MarkView } from './hitmarks';

/** Marks on units standing at x = 10 * person, facing +x: [time, person, outcome, killing, session]. */
function marks(list: [number, number, Outcome, boolean, number][]): HitMarks {
  const n = list.length;
  return {
    count: n,
    time: Float64Array.from(list, (m) => m[0]),
    person: Int32Array.from(list, (m) => m[1]),
    session: Int32Array.from(list, (m) => m[4]),
    local: new Float32Array(n * 3).fill(0.5),
    outcome: Uint8Array.from(list, (m) => OUTCOMES.indexOf(m[2])),
    kill: Uint8Array.from(list, (m) => (m[3] ? 1 : 0)),
    body: new Uint8Array(n),
    turret: new Float32Array(n * 3).fill(NaN),
    hit: Int32Array.from(list, (_, i) => 100 + i),
    row: new Int32Array(n).fill(-1),
    vehicle: new Int32Array(n),
    vehicles: [{ figure: '', marks: [], done: true }],
  };
}

function view(t: number, seconds: number, session = -1): MarkView {
  return {
    t,
    seconds,
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

  it('draws the hits in the window only, newest first, in their outcome colours', () => {
    const m = marks([
      [1, 0, 'damage', false, -1],
      [8, 1, 'critical', false, -1],
      [9, 2, 'nodamage', false, -1],
      [12, 1, 'hit', false, -1],
    ]);
    const layer = new HitMarkLayer();
    const out = new VertexBuffer();
    expect(layer.build(m, view(10, 5), out)).toBe(2);
    // Newest first: the one at 9 s, then 8 s; the one at 12 s is still to come, the one at 1 s long gone.
    expect(Array.from(layer.drawn.hit.subarray(0, 2))).toEqual([102, 101]);
    const c = colours(out);
    expect(c.has(key(OUTCOME_COLOURS.critical))).toBe(true);
    expect(c.has(key(OUTCOME_COLOURS.nodamage))).toBe(true);
    expect(c.has(key(OUTCOME_COLOURS.damage))).toBe(false);
    // On the unit: unit 2 stands at x = 20, the point half a metre forward, brought out towards the eye a little.
    expect(layer.drawn.xyz[0]).toBeGreaterThan(20.3);
    expect(layer.drawn.xyz[0]).toBeLessThan(20.7);
  });

  it('fades a mark at the end of its time, keeps it the whole match, and rings the killing shot', () => {
    const m = marks([[0, 0, 'kill', true, -1]]);
    const layer = new HitMarkLayer();
    const out = new VertexBuffer();
    layer.build(m, view(1, 10), out);
    const fresh = colours(out).get(key(OUTCOME_COLOURS.kill))!;
    // White ring round it.
    expect([...colours(out).keys()].some((k) => k.startsWith('1.60'))).toBe(true);
    out.reset();
    layer.build(m, view(9.5, 10), out);
    const old = colours(out).get(key(OUTCOME_COLOURS.kill))!;
    expect(old).toBeLessThan(fresh);
    out.reset();
    expect(layer.build(m, view(11, 10), out)).toBe(0);
    out.reset();
    expect(layer.build(m, view(500, Infinity), out)).toBe(1);
    expect(colours(out).get(key(OUTCOME_COLOURS.kill))).toBe(1);
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
});
