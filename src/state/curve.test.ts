import { describe, expect, it } from 'vitest';
import {
  CURVE_PRESETS,
  bakeCurveLut,
  curvePoint,
  curveSignature,
  evalCurve,
  normaliseCurve,
  type CurvePoint,
} from './curve';

/** Straight line from (0,1) to (1,0), handles aligned with the line. */
const LINEAR = CURVE_PRESETS.Linear;

describe('evalCurve', () => {
  it('reproduces a straight ramp', () => {
    for (const x of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
      expect(evalCurve(LINEAR, x)).toBeCloseTo(1 - x, 3);
    }
  });

  it('pins the endpoints', () => {
    for (const preset of Object.values(CURVE_PRESETS)) {
      expect(evalCurve(preset, 0)).toBeCloseTo(preset[0].y, 6);
      expect(evalCurve(preset, 1)).toBeCloseTo(preset[preset.length - 1].y, 6);
    }
  });

  it('clamps outside the domain rather than extrapolating', () => {
    expect(evalCurve(LINEAR, -5)).toBeCloseTo(1, 6);
    expect(evalCurve(LINEAR, 5)).toBeCloseTo(0, 6);
  });

  it('stays inside the unit box for every preset', () => {
    for (const [name, preset] of Object.entries(CURVE_PRESETS)) {
      for (let i = 0; i <= 64; i++) {
        const y = evalCurve(preset, i / 64);
        expect(y, `${name} at x=${i / 64}`).toBeGreaterThanOrEqual(0);
        expect(y, `${name} at x=${i / 64}`).toBeLessThanOrEqual(1);
      }
    }
  });

  it('makes Smooth an S-curve: flatter at the ends than in the middle', () => {
    const at = (x: number) => evalCurve(CURVE_PRESETS.Smooth, x);
    // Near the ends the curve barely moves; through the middle it moves fast.
    const endSlope = Math.abs(at(0.05) - at(0));
    const midSlope = Math.abs(at(0.55) - at(0.5));
    expect(midSlope).toBeGreaterThan(endSlope * 2);
    // And it still passes through the halfway point.
    expect(at(0.5)).toBeCloseTo(0.5, 2);
  });

  it('makes Tight fall away faster than linear', () => {
    expect(evalCurve(CURVE_PRESETS.Tight, 0.25)).toBeLessThan(0.75);
    expect(evalCurve(CURVE_PRESETS.Tight, 0.5)).toBeLessThan(0.5);
  });

  it('makes Plateau hold near full intensity longer than linear', () => {
    expect(evalCurve(CURVE_PRESETS.Plateau, 0.4)).toBeGreaterThan(0.6);
  });

  it('gives Ring its peak away from the centre', () => {
    const ring = CURVE_PRESETS.Ring;
    let bestX = 0;
    let best = -1;
    for (let i = 0; i <= 200; i++) {
      const x = i / 200;
      const y = evalCurve(ring, x);
      if (y > best) {
        best = y;
        bestX = x;
      }
    }
    expect(bestX).toBeGreaterThan(0.3);
    expect(bestX).toBeLessThan(0.9);
    expect(evalCurve(ring, 0)).toBeLessThan(best);
    expect(evalCurve(ring, 1)).toBeLessThan(best);
  });

  it('is monotonic in x for a monotonic curve, whatever the handles do', () => {
    // Handles dragged far past the segment must not fold the curve back: a
    // non-monotonic x would make the solved t ambiguous and the bake unstable.
    const wild: CurvePoint[] = [
      { x: 0, y: 1, inX: 0, inY: 0, outX: 8, outY: -0.2 },
      { x: 1, y: 0, inX: -9, inY: 0.4, outX: 0, outY: 0 },
    ];
    let prev = Infinity;
    for (let i = 0; i <= 128; i++) {
      const y = evalCurve(wild, i / 128);
      expect(Number.isFinite(y)).toBe(true);
      expect(y).toBeLessThanOrEqual(prev + 1e-6);
      prev = y;
    }
  });

  it('handles a segment of zero width without dividing by zero', () => {
    const stacked: CurvePoint[] = [
      curvePoint(0, 1, 0.2, 0),
      curvePoint(0.5, 0.5, 0.2, 0),
      curvePoint(0.5, 0.2, 0.2, 0),
      curvePoint(1, 0, 0.2, 0),
    ];
    for (let i = 0; i <= 64; i++) {
      expect(Number.isFinite(evalCurve(stacked, i / 64))).toBe(true);
    }
  });

  it('walks the right segment on a multi-point curve', () => {
    const steps: CurvePoint[] = [
      curvePoint(0, 1, 0.01, 0),
      curvePoint(0.5, 1, 0.01, 0),
      curvePoint(0.5001, 0, 0.01, 0),
      curvePoint(1, 0, 0.01, 0),
    ];
    expect(evalCurve(steps, 0.25)).toBeGreaterThan(0.9);
    expect(evalCurve(steps, 0.75)).toBeLessThan(0.1);
  });
});

describe('normaliseCurve', () => {
  it('sorts by x and pins the endpoints', () => {
    const out = normaliseCurve([curvePoint(0.7, 0.2), curvePoint(0.2, 0.9), curvePoint(0.4, 0.5)]);
    expect(out.map((p) => p.x)).toEqual([0, 0.4, 1]);
    expect(out.map((p) => p.y)).toEqual([0.9, 0.5, 0.2]);
  });

  it('clamps values into the unit box', () => {
    const out = normaliseCurve([curvePoint(-3, 4), curvePoint(9, -2)]);
    expect(out[0]).toMatchObject({ x: 0, y: 1 });
    expect(out[1]).toMatchObject({ x: 1, y: 0 });
  });

  it('recovers from an empty curve', () => {
    expect(normaliseCurve([]).length).toBeGreaterThanOrEqual(2);
  });

  it('extends a single point into a flat line', () => {
    const out = normaliseCurve([curvePoint(0.5, 0.3)]);
    expect(out).toHaveLength(2);
    expect(evalCurve(out, 0)).toBeCloseTo(0.3, 6);
    expect(evalCurve(out, 1)).toBeCloseTo(0.3, 6);
  });

  it('drops points with non-finite coordinates', () => {
    const out = normaliseCurve([
      curvePoint(0, 1),
      { x: NaN, y: 0.5, inX: 0, inY: 0, outX: 0, outY: 0 },
      curvePoint(1, 0),
    ]);
    expect(out).toHaveLength(2);
  });

  it('repairs non-finite handles rather than dropping the point', () => {
    const out = normaliseCurve([
      { x: 0, y: 1, inX: NaN, inY: 0, outX: Infinity, outY: 0 },
      curvePoint(1, 0),
    ]);
    expect(out).toHaveLength(2);
    for (let i = 0; i <= 32; i++) expect(Number.isFinite(evalCurve(out, i / 32))).toBe(true);
  });
});

describe('bakeCurveLut', () => {
  it('samples the curve across the whole domain', () => {
    const lut = bakeCurveLut(LINEAR, 65);
    expect(lut[0]).toBeCloseTo(1, 4);
    expect(lut[32]).toBeCloseTo(0.5, 2);
    expect(lut[64]).toBeCloseTo(0, 4);
  });

  it('reuses the buffer it is handed', () => {
    const buf = new Float32Array(64);
    expect(bakeCurveLut(LINEAR, 64, buf)).toBe(buf);
    // A size mismatch must allocate rather than write out of bounds.
    expect(bakeCurveLut(LINEAR, 32, buf)).not.toBe(buf);
  });

  it('produces only finite values in range for every preset', () => {
    for (const [name, preset] of Object.entries(CURVE_PRESETS)) {
      for (const v of bakeCurveLut(preset)) {
        expect(Number.isFinite(v), name).toBe(true);
        expect(v >= 0 && v <= 1, `${name}: ${v}`).toBe(true);
      }
    }
  });
});

describe('curveSignature', () => {
  it('changes when the curve changes and not otherwise', () => {
    const a = normaliseCurve(LINEAR.map((p) => ({ ...p })));
    const b = normaliseCurve(LINEAR.map((p) => ({ ...p })));
    expect(curveSignature(a)).toBe(curveSignature(b));
    b[0].y = 0.9;
    expect(curveSignature(a)).not.toBe(curveSignature(b));
  });

  it('notices a handle move, not just a point move', () => {
    const a = LINEAR.map((p) => ({ ...p }));
    const b = LINEAR.map((p) => ({ ...p }));
    b[0].outY -= 0.3;
    expect(curveSignature(a)).not.toBe(curveSignature(b));
  });
});
