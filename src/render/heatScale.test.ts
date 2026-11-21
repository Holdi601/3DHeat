import { describe, expect, it } from 'vitest';
import { heatScale, responseInverse, responseOf, spriteMass } from './heatScale';
import type { SpriteKernel } from './heatStack';

const kernel = (o: Partial<SpriteKernel> = {}): SpriteKernel => ({
  radius: 100,
  minPx: 0,
  maxPx: 0,
  zoomInvariant: true,
  center: 1,
  edge: 0,
  falloff: 1,
  smooth: false,
  curve: null,
  ...o,
});

describe('the heat scale', () => {
  it("weighs a sprite by its ramp over the disc", () => {
    // A flat ramp: the disc's area per r², pi. A linear cone: pi / 3.
    expect(spriteMass(kernel({ center: 1, edge: 1 }))).toBeCloseTo(Math.PI, 3);
    expect(spriteMass(kernel())).toBeCloseTo(Math.PI / 3, 3);
  });

  it('undoes the composite response', () => {
    for (const r of ['linear', 'saturating', 'log'] as const) {
      for (const t of [0, 0.2, 0.5, 0.9]) expect(responseOf(responseInverse(t, r), r)).toBeCloseTo(t, 6);
    }
    expect(responseInverse(1, 'saturating')).toBe(Infinity);
  });

  it('reads heat as rows per area', () => {
    // Rows spread evenly at 1 per 1,000 m² under a flat sprite of radius 100 m:
    // each place gathers pi * 100² / 1000 = 31.4 heat. Saturation there on a linear ramp.
    const sat = (Math.PI * 100 * 100) / 1000;
    const s = heatScale({ saturation: sat, response: 'linear', floor: 0, kernel: kernel({ edge: 1 }), rawHeat: false, shares: null });
    expect(s.unit).toBe('rows');
    expect(s.area).toBe(1e6);
    expect(s.ticks.map((k) => k.pos)).toEqual([0, 0.5, 1]);
    // 1 per 1,000 m² is 1,000 per km².
    expect(s.ticks[2].value).toBeCloseTo(1000, 6);
    expect(s.ticks[1].value).toBeCloseTo(500, 6);
  });

  it('says a saturating top as "or more", and puts ticks after the floor', () => {
    const s = heatScale({ saturation: 10, response: 'saturating', floor: 0.2, kernel: kernel(), rawHeat: false, shares: null });
    expect(s.ticks[2].orMore).toBe(true);
    expect(s.ticks[2].heat).toBeCloseTo(-Math.log(0.05) * 10, 6);
    expect(s.ticks[1].pos).toBeCloseTo(0.6, 6);
  });

  it('per side under shares, per match under matches, raw heat for lines', () => {
    const base = { saturation: 10, response: 'linear' as const, floor: 0, kernel: kernel(), rawHeat: false };
    const rows = heatScale({ ...base, shares: null }).ticks[2].value;
    const share = heatScale({ ...base, shares: { per: 'rows', positive: 300, negative: 100 } });
    expect(share.unit).toBe('share');
    // Each side weighed by 200 / its rows: per cent of a side's rows is the plain reading * 100 / 200.
    expect(share.ticks[2].value).toBeCloseTo((rows * 100) / 200, 6);
    const match = heatScale({ ...base, shares: { per: 'matches', positive: 6, negative: 2 } });
    expect(match.unit).toBe('match');
    expect(match.ticks[2].value).toBeCloseTo(rows / 4, 6);
    const lines = heatScale({ ...base, rawHeat: true, shares: null });
    expect(lines.unit).toBe('heat');
    expect(Number.isNaN(lines.ticks[2].value)).toBe(true);
  });
});
