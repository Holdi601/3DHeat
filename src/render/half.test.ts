import { describe, expect, it } from 'vitest';
import { floatToHalf, halfToFloat } from './half';

describe('binary16 conversion', () => {
  it('encodes the exact values every table lists', () => {
    expect(floatToHalf(0)).toBe(0x0000);
    expect(floatToHalf(1)).toBe(0x3c00);
    expect(floatToHalf(-1)).toBe(0xbc00);
    expect(floatToHalf(0.5)).toBe(0x3800);
    expect(floatToHalf(2)).toBe(0x4000);
    expect(floatToHalf(-2)).toBe(0xc000);
    expect(floatToHalf(65504)).toBe(0x7bff); // largest finite binary16
  });

  it('round-trips exactly for values the format can hold', () => {
    for (const v of [0, 0.5, 0.25, 1, -1, 2, 1024, -0.125, 6.103515625e-5]) {
      expect(halfToFloat(floatToHalf(v))).toBe(v);
    }
  });

  it('round-trips a 0..1 ramp within half-float precision', () => {
    // This is the actual use: a 256-entry curve LUT on [0, 1]. Binary16 has 10
    // fraction bits, so the worst case near 1.0 is about 1/2048.
    for (let i = 0; i <= 256; i++) {
      const v = i / 256;
      expect(halfToFloat(floatToHalf(v))).toBeCloseTo(v, 3);
    }
  });

  it('keeps the sign of negative zero', () => {
    expect(floatToHalf(-0)).toBe(0x8000);
  });

  it('saturates rather than wrapping past the format range', () => {
    expect(floatToHalf(70000)).toBe(0x7c00);
    expect(floatToHalf(-70000)).toBe(0xfc00);
    expect(halfToFloat(floatToHalf(1e30))).toBe(Infinity);
  });

  it('handles the non-finite cases', () => {
    expect(floatToHalf(Infinity)).toBe(0x7c00);
    expect(floatToHalf(-Infinity)).toBe(0xfc00);
    expect(Number.isNaN(halfToFloat(floatToHalf(NaN)))).toBe(true);
  });

  it('flushes tiny magnitudes toward zero without going negative', () => {
    // Subnormals: the encoded value must stay inside the fraction field.
    for (const v of [1e-9, 1e-7, 3e-5]) {
      const h = floatToHalf(v);
      expect(h & 0x7c00).toBe(0);
      expect(halfToFloat(h)).toBeGreaterThanOrEqual(0);
      expect(halfToFloat(h)).toBeLessThan(6.2e-5);
    }
  });

  it('carries into the exponent when the fraction rounds up', () => {
    // The step below 1.0 is 1/2048, so 2047/2048 is exact and needs no carry.
    expect(floatToHalf(2047 / 2048)).toBe(0x3bff);
    expect(halfToFloat(0x3bff)).toBe(2047 / 2048);
    // 4095/4096 sits between that and 1.0, closer to 1.0 — rounding it up has to
    // increment the exponent rather than overflow the fraction field into it.
    expect(floatToHalf(4095 / 4096)).toBe(0x3c00);
    expect(halfToFloat(floatToHalf(4095 / 4096))).toBe(1);
    // Same carry one binade up.
    expect(floatToHalf(2 - 1 / 2048)).toBe(0x4000);
  });

  it('never produces a value outside 16 bits', () => {
    for (let i = -100; i <= 100; i++) {
      const h = floatToHalf(i * 0.37);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThanOrEqual(0xffff);
      expect(Number.isInteger(h)).toBe(true);
    }
  });
});
