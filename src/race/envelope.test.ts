import { describe, expect, it } from 'vitest';
import { BIN, BINS, strengths, type Envelope } from './envelope';

describe('strengths', () => {
  it('measures grip and braking over 60 to 160 km/h, the band the comparison names', () => {
    // A value equal to the speed itself, so the mean says which speeds it read.
    const bySpeed = Float32Array.from({ length: BINS }, (_, b) => (b + 0.5) * BIN);
    const e = { lateral: bySpeed, braking: bySpeed, accel: bySpeed } as unknown as Envelope;
    const s = strengths(e);
    // Every 2 m/s from 60 km/h (16.7 m/s) up to 160 km/h (44.4 m/s): 16.7 ... 42.7.
    const from = 60 / 3.6;
    const expected = from + 13;
    expect(s.braking).toBeCloseTo(expected, 3);
    expect(s.grip).toBeCloseTo(expected, 3);
  });
});
