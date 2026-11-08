import { describe, expect, it } from 'vitest';
import { relativeValue, velocityOf, type RelativeInput } from './relative';

const base: RelativeInput = { east: 0, north: 1000, up: 0, heading: 0, course: 0, va: null, vb: null };

describe('relative values', () => {
  it('range, bearing and the height between', () => {
    const c = { ...base, east: 300, north: 400, up: -120 };
    expect(relativeValue('range', c)).toBeCloseTo(Math.hypot(300, 400, 120), 6);
    expect(relativeValue('bearing', c)).toBeCloseTo((Math.atan2(300, 400) * 180) / Math.PI, 6);
    expect(relativeValue('altDiff', c)).toBe(-120);
    expect(relativeValue('bearing', { ...base, east: -1, north: 0 })).toBeCloseTo(270, 6);
  });

  it('bearing off the nose, right positive', () => {
    expect(relativeValue('relBearing', { ...base, east: 1000, north: 0, heading: 0 })).toBeCloseTo(90, 6);
    expect(relativeValue('relBearing', { ...base, east: 0, north: 1000, heading: 90 })).toBeCloseTo(-90, 6);
    expect(relativeValue('relBearing', { ...base, heading: NaN })).toBeNaN();
  });

  it('aspect: astern 0, head on 180', () => {
    // B ahead of A to the north, flying north: A sits on its tail.
    expect(relativeValue('aspect', { ...base, course: 0 })).toBeCloseTo(0, 6);
    // B flying south at A: head on.
    expect(relativeValue('aspect', { ...base, course: 180 })).toBeCloseTo(180, 6);
    expect(relativeValue('aspect', { ...base, course: 90 })).toBeCloseTo(90, 6);
  });

  it('closure and line-of-sight rate', () => {
    // Head on at 200 and 150 m/s: closing at 350.
    const c = { ...base, va: velocityOf(200, 0, 0), vb: velocityOf(150, 180, 0) };
    expect(relativeValue('closure', c)).toBeCloseTo(350, 6);
    expect(relativeValue('losRate', c)).toBeCloseTo(0, 6);
    // B crossing at 100 m/s, 1000 m off: the line turns 0.1 rad/s.
    const x = { ...base, va: velocityOf(0, 0, 0), vb: velocityOf(100, 90, 0) };
    expect(relativeValue('closure', x)).toBeCloseTo(0, 6);
    expect(relativeValue('losRate', x)).toBeCloseTo((0.1 * 180) / Math.PI, 6);
    expect(relativeValue('closure', base)).toBeNaN();
  });
});
