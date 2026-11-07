import { describe, expect, it } from 'vitest';
import { CATALOG } from './catalog';
import { extent } from './kit';
import { atmosphere, FigureReplay, sweepFor } from './replay';
import { SWING_MACH, SWING_PANELS } from './specs/swing';
import { swingSpan } from './air';
import type { AttributeColumn, Dataset } from '../state/types';

describe('swing wings', () => {
  it('offers every swing-wing figure spread and swept, at the published spans', () => {
    expect(Object.keys(SWING_PANELS).length).toBeGreaterThanOrEqual(18);
    for (const [name, s] of Object.entries(SWING_PANELS)) {
      expect(CATALOG[name], name).toBeDefined();
      expect(SWING_MACH.has(name), name).toBe(true);
      for (const [state, [sweep, span]] of [['spread', s.spread], ['swept', s.swept]] as const) {
        expect(Math.abs(swingSpan(s, sweep) / span - 1), `${name}@${state}`).toBeLessThan(0.02);
        // The built figure's width is its span: the wing tips are its widest part.
        const w = extent(CATALOG[`${name}@${state}`].build()).width;
        expect(Math.abs(w / span - 1), `${name}@${state} ${w.toFixed(2)} m`).toBeLessThan(0.03);
      }
      // Its own sweep lies between the two, and so does its span.
      const own = extent(CATALOG[name].build()).width;
      expect(own, name).toBeLessThan(s.spread[1] * 1.01);
      expect(own, name).toBeGreaterThan(s.swept[1] * 0.99);
    }
  });

  it('picks the sweep from the Mach, holding a state near its threshold', () => {
    const at: [number, number] = [0.4, 0.8];
    expect(sweepFor(0.25, at, null)).toBe('spread');
    expect(sweepFor(0.6, at, null)).toBe('mid');
    expect(sweepFor(1.2, at, null)).toBe('swept');
    expect(sweepFor(NaN, at, 'swept')).toBeNull();
    expect(sweepFor(0.41, at, 'spread')).toBe('spread');
    expect(sweepFor(0.79, at, 'swept')).toBe('swept');
    expect(sweepFor(0.45, at, 'spread')).toBe('mid');
    expect(atmosphere(0).sound).toBeCloseTo(340.3, 0);
    expect(atmosphere(11000).sound).toBeCloseTo(295.1, 0);
  });
});

describe('swing wings in replay', () => {
  /** One aircraft, `n` samples a second apart moving `step` metres each, with optional extra numeric columns. */
  const dataset = (step: number, cols: Record<string, number[]> = {}, time = true): Dataset => {
    const n = 4;
    const name: AttributeColumn = { name: 'Name', kind: 'category', data: new Uint32Array(n), min: 0, max: 0, categories: ['F-14B'] };
    const extra = Object.entries(cols).map(([k, v]): AttributeColumn => ({ name: k, kind: 'number' as AttributeColumn['kind'], data: Float32Array.from(v), min: 0, max: 1 }));
    return {
      count: n,
      px: Float32Array.from({ length: n }, (_, i) => i * step),
      py: new Float32Array(n).fill(3000),
      pz: new Float32Array(n),
      time: time ? Float32Array.from({ length: n }, (_, i) => i) : null,
      personId: new Uint32Array(n),
      sessionId: null,
      yaw: new Float32Array(n),
      attrs: [name, ...extra],
    } as unknown as Dataset;
  };
  const walk = (d: Dataset) => {
    const fr = new FigureReplay();
    const kind = fr.kindOf(d, 0)!;
    expect(kind).toBe('f-14b');
    return [0, 1, 2, 3].map((r) => fr.sweptKind(d, r, kind));
  };

  it('spreads a slow track and sweeps a fast one, from the speed between samples', () => {
    expect(walk(dataset(70)).at(-1)).toBe('f-14b@spread');
    expect(walk(dataset(200)).at(-1)).toBe('f-14b');
    expect(walk(dataset(320)).at(-1)).toBe('f-14b@swept');
  });

  it('takes the data own Mach, TAS or IAS before the speed between samples', () => {
    expect(walk(dataset(320, { Mach: [0.3, 0.3, 0.3, 0.3] }))).toEqual(['f-14b@spread', 'f-14b@spread', 'f-14b@spread', 'f-14b@spread']);
    expect(walk(dataset(0, { TAS: [300, 300, 300, 300] }, false))[0]).toBe('f-14b@swept');
    // 200 m/s indicated at 10 km is about 350 m/s true, Mach 1.17.
    expect(walk(dataset(0, { IAS: [200, 200, 200, 200], Altitude: [10000, 10000, 10000, 10000] }, false))[0]).toBe('f-14b@swept');
    expect(walk(dataset(0, { 'Speed (km/h)': [300, 300, 300, 300] }, false))[0]).toBe('f-14b@spread');
  });

  it('keeps the usual sweep when the data says nothing about speed', () => {
    expect(walk(dataset(320, {}, false))).toEqual(['f-14b', 'f-14b', 'f-14b', 'f-14b']);
  });

  it('leaves figures without a swing wing as they are', () => {
    expect(new FigureReplay().sweptKind(dataset(320), 1, 'f-16c')).toBe('f-16c');
  });
});
