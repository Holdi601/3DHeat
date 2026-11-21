import { describe, expect, it } from 'vitest';
import { bootstrap, normalQuantile, rateInterval, wilson } from './ci';

describe('rate intervals', () => {
  it('normal quantiles', () => {
    expect(normalQuantile(0.975)).toBeCloseTo(1.959964, 5);
    expect(normalQuantile(0.5)).toBeCloseTo(0, 8);
    expect(normalQuantile(0.005)).toBeCloseTo(-2.575829, 5);
  });

  it('Wilson: the textbook values, inside 0..1, sensible at the ends', () => {
    const [a, b] = wilson(5, 10)!;
    expect(a).toBeCloseTo(0.2366, 4);
    expect(b).toBeCloseTo(0.7634, 4);
    const [z0, z1] = wilson(0, 10)!;
    expect(z0).toBe(0);
    expect(z1).toBeCloseTo(0.2775, 4);
    const [o0, o1] = wilson(10, 10)!;
    expect(o0).toBeCloseTo(0.7225, 4);
    expect(o1).toBe(1);
    // Wider at a higher level, narrower with more rows.
    expect(wilson(50, 100, 0.99)![0]).toBeLessThan(wilson(50, 100, 0.95)![0]);
    expect(wilson(500, 1000)![1] - wilson(500, 1000)![0]).toBeLessThan(wilson(50, 100)![1] - wilson(50, 100)![0]);
    expect(wilson(1, 0)).toBeNull();
  });

  it('bootstrap: the binomial percentiles, exactly', () => {
    // Binomial(10, 0.5): P(X <= 1) = 0.0107, P(X <= 2) = 0.0547; P(X <= 7) = 0.9453, P(X <= 8) = 0.9893.
    expect(bootstrap(5, 10)).toEqual([0.2, 0.8]);
    expect(bootstrap(0, 10)).toEqual([0, 0]);
    expect(bootstrap(10, 10)).toEqual([1, 1]);
    // Large n: the normal limit, close to Wilson there.
    const [a, b] = bootstrap(5000, 10000)!;
    expect(a).toBeCloseTo(0.4902, 3);
    expect(b).toBeCloseTo(0.5098, 3);
    // Mid-sized n by the pmf walk: about the normal width too.
    const [c, d] = bootstrap(300, 1000)!;
    expect(c).toBeCloseTo(0.3 - 1.96 * Math.sqrt(0.21 / 1000), 2);
    expect(d).toBeCloseTo(0.3 + 1.96 * Math.sqrt(0.21 / 1000), 2);
  });

  it('weighted rows: the interval of the rows actually read', () => {
    expect(rateInterval('wilson', 40, 100, 0.95, 2)).toEqual(wilson(20, 50, 0.95));
    expect(rateInterval('bootstrap', 40, 100, 0.95, 2)).toEqual(bootstrap(20, 50, 0.95));
  });
});
