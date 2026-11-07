import { describe, expect, it } from 'vitest';
import { DEFAULT_EXPOSURE, autoExposure } from './exposure';

/** A field that is mostly empty with a lit region, like every real heat frame. */
function field(empty: number, lit: number[]): Float32Array {
  const out = new Float32Array(empty + lit.length);
  for (let i = 0; i < lit.length; i++) out[empty + i] = lit[i];
  return out;
}

describe('autoExposure', () => {
  it('places the reference percentile near the top of the ramp', () => {
    // 100 lit values from 1 to 100. The 98th percentile is 99.
    const lit = Array.from({ length: 100 }, (_, i) => i + 1);
    const r = autoExposure(field(0, lit));
    expect(r.saturation).not.toBeNull();
    // reference / target, so the reference lands at `target` on the ramp.
    expect(r.reference / r.saturation!).toBeCloseTo(DEFAULT_EXPOSURE.target, 3);
  });

  it('ignores the empty majority', () => {
    // The same lit values buried in a mostly empty frame must meter identically:
    // averaging in the empty part is what leaves a heatmap sitting at the bottom
    // of its own ramp.
    const lit = Array.from({ length: 100 }, (_, i) => i + 1);
    const dense = autoExposure(field(0, lit));
    const sparse = autoExposure(field(100_000, lit));
    expect(sparse.saturation).toBeCloseTo(dense.saturation!, 6);
    expect(sparse.coverage).toBeCloseTo(100 / 100_100, 6);
    expect(dense.coverage).toBeCloseTo(1, 6);
  });

  it('is not dragged around by a single freak pixel', () => {
    const lit = Array.from({ length: 500 }, () => 10);
    const withSpike = [...lit, 1e6];
    const a = autoExposure(field(1000, lit));
    const b = autoExposure(field(1000, withSpike));
    // One outlier in 500 must not move the exposure much; metering the maximum
    // instead would darken the whole image by five orders of magnitude.
    expect(b.saturation! / a.saturation!).toBeLessThan(1.5);
  });

  it('reports nothing to meter on an empty field', () => {
    expect(autoExposure(field(5000, [])).saturation).toBeNull();
    expect(autoExposure(new Float32Array(0)).saturation).toBeNull();
    expect(autoExposure(null).saturation).toBeNull();
  });

  it('treats values below epsilon as empty', () => {
    const r = autoExposure(field(0, [1e-9, 1e-9, 1e-9]));
    expect(r.saturation).toBeNull();
    expect(r.lit).toBe(0);
  });

  it('scales with the field, so twice the density needs twice the saturation', () => {
    const lit = Array.from({ length: 200 }, (_, i) => i + 1);
    const single = autoExposure(field(500, lit));
    const doubled = autoExposure(field(500, lit.map((v) => v * 2)));
    expect(doubled.saturation! / single.saturation!).toBeCloseTo(2, 4);
  });

  it('survives non-finite samples', () => {
    const out = new Float32Array([NaN, Infinity, -Infinity, 5, 6, 7, 8]);
    const r = autoExposure(out);
    expect(r.saturation).not.toBeNull();
    expect(Number.isFinite(r.saturation!)).toBe(true);
    // Infinity must not become the reference.
    expect(r.saturation!).toBeLessThan(100);
  });

  it('honours a custom percentile and target', () => {
    const lit = Array.from({ length: 100 }, (_, i) => i + 1);
    const low = autoExposure(field(0, lit), { percentile: 0.5, target: 0.5 });
    // Median of 1..100 is about 51, placed at half the ramp.
    expect(low.saturation!).toBeGreaterThan(95);
    expect(low.saturation!).toBeLessThan(110);
  });

  it('never returns a zero or negative saturation', () => {
    for (const vals of [[0.001], [1e-3, 1e-3], [0.5, 0.5, 0.5]]) {
      const r = autoExposure(field(10, vals));
      if (r.saturation !== null) expect(r.saturation).toBeGreaterThan(0);
    }
  });

  it('puts a realistic clustered field into the upper half of the ramp', () => {
    // Roughly what telemetry looks like: a long tail of low density with a small
    // dense core. The whole point is that the core does not end up invisible.
    const lit: number[] = [];
    for (let i = 0; i < 9000; i++) lit.push(1 + Math.random() * 5);
    for (let i = 0; i < 1000; i++) lit.push(40 + Math.random() * 60);
    const r = autoExposure(field(90_000, lit));
    const t = (v: number) => v / r.saturation!;
    // The dense core should land in the top half rather than the bottom quarter.
    expect(t(90)).toBeGreaterThan(0.5);
    // And the sparse tail should stay near the bottom, not wash out to white.
    expect(t(3)).toBeLessThan(0.15);
  });
});
