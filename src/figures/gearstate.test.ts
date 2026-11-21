import { describe, expect, it } from 'vitest';
import type { Dataset } from '../state/types';
import { gearColumns, gearUpKeys } from './gearstate';
import { gearUpPitch, NO_PITCH, spinPitch, articulate, GEAR_UP_BELOW } from './instances';

/** A flight of one aircraft: taxi, take-off roll, climb, cruise, approach, landing; one sample a second. */
function flight(gear?: number[]): Dataset {
  const y: number[] = [];
  const x: number[] = [];
  let at = 0;
  const leg = (n: number, v: number, h0: number, h1: number) => {
    for (let i = 0; i < n; i++) {
      at += v;
      x.push(at);
      y.push(h0 + ((h1 - h0) * i) / Math.max(1, n - 1));
    }
  };
  leg(5, 5, 100, 100); // taxi at the airfield, 100 m above the sea
  leg(5, 60, 100, 100); // take-off roll
  leg(5, 80, 110, 250); // climb out, slow and low
  leg(10, 220, 600, 3000); // climb and cruise
  leg(5, 70, 300, 120); // approach
  leg(3, 30, 100, 100); // roll-out
  const n = x.length;
  const attrs = gear ? [{ name: 'LandingGear', kind: 'number', data: Float32Array.from(gear) }] : [];
  return { px: Float32Array.from(x), py: Float32Array.from(y), pz: new Float32Array(n), time: Float32Array.from(x.map((_, i) => i)), count: n, attrs } as unknown as Dataset;
}

describe('landing gear', () => {
  it('is down on the ground and when slow and low, up in flight, without a gear column', () => {
    const d = flight();
    const rows = Int32Array.from({ length: d.count }, (_, i) => i);
    const up = new Uint8Array(d.count);
    gearUpKeys(d, gearColumns(d)!, rows, 1, false, up, 0);
    // (The samples at the joins of the legs take the speed of both.)
    expect([...up.subarray(0, 14)].every((u) => u === 0)).toBe(true);
    expect([...up.subarray(15, 25)].every((u) => u === 1)).toBe(true);
    expect([...up.subarray(26)].every((u) => u === 0)).toBe(true);
  });

  it("follows the data's gear column where there is one", () => {
    const g = new Array(33).fill(1);
    g[20] = 0;
    const d = flight(g);
    const rows = Int32Array.from({ length: d.count }, (_, i) => i);
    const up = new Uint8Array(d.count);
    gearUpKeys(d, gearColumns(d)!, rows, 1, false, up, 0);
    expect(up.reduce((s, u) => s + u, 0)).toBe(1);
    expect(up[20]).toBe(1);
  });

  it('folds a gear part into its pivot while up, and leaves the other slots as they were', () => {
    expect(gearUpPitch(NO_PITCH)).toBeLessThan(GEAR_UP_BELOW);
    expect(gearUpPitch(spinPitch(0.5))).toBeLessThan(GEAR_UP_BELOW);
    expect(gearUpPitch(0.2)).toBe(0.2);
    // A mesh vertex of a gear joint (kind 5, pivot 1, 2, 3), as `meshOf` writes it.
    const m = new Float32Array(24);
    m[12] = 5;
    m.set([1, 2, 3], 13);
    const out = [0, 0, 0];
    articulate(m, 0, 5, 5, 5, 0, gearUpPitch(NO_PITCH), true, out);
    expect(out).toEqual([1, 2, 3]);
    articulate(m, 0, 5, 5, 5, 0, NO_PITCH, true, out);
    expect(out).toEqual([5, 5, 5]);
  });
});
