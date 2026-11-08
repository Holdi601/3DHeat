import { describe, expect, it } from 'vitest';
import { MAX_SPEED, PLAYBACK_SPEEDS, parseSpeed, speedDigits, speedOptions } from './playbackSpeed';

describe('parseSpeed', () => {
  it('reads plain, comma and x-marked speeds', () => {
    expect(parseSpeed('0.3')).toBe(0.3);
    expect(parseSpeed(' 12 ')).toBe(12);
    expect(parseSpeed('0,3')).toBe(0.3);
    expect(parseSpeed('12x')).toBe(12);
    expect(parseSpeed('×4')).toBe(4);
    expect(parseSpeed('.5')).toBe(0.5);
    expect(parseSpeed('0.01')).toBe(0.01);
    expect(parseSpeed(String(MAX_SPEED))).toBe(MAX_SPEED);
  });

  it('keeps four significant figures', () => {
    expect(parseSpeed('0.333333')).toBe(0.3333);
  });

  it('refuses what is not a speed', () => {
    for (const s of ['', 'abc', '0', '-2', '0.0001', String(MAX_SPEED + 1), '1e3', '1/4', '2..5', 'NaN', 'Infinity']) {
      expect(parseSpeed(s), s).toBeNull();
    }
  });
});

describe('speed menu', () => {
  it('runs from a hundredth to 256x and beyond, slowest first', () => {
    expect(PLAYBACK_SPEEDS.slice(0, 7)).toEqual([0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1]);
    expect(PLAYBACK_SPEEDS).toContain(256);
    expect([...PLAYBACK_SPEEDS].sort((a, b) => a - b)).toEqual(PLAYBACK_SPEEDS);
  });

  it('adds a typed speed in its place', () => {
    expect(speedOptions(4)).toBe(PLAYBACK_SPEEDS);
    const o = speedOptions(0.3);
    expect(o).toHaveLength(PLAYBACK_SPEEDS.length + 1);
    expect(o[o.indexOf(0.3) - 1]).toBe(0.25);
    expect(o[o.indexOf(0.3) + 1]).toBe(0.5);
  });

  it('shows as many decimals as a speed has', () => {
    expect(speedDigits(16)).toBe(0);
    expect(speedDigits(0.5)).toBe(1);
    expect(speedDigits(0.25)).toBe(2);
    expect(speedDigits(0.01)).toBe(2);
    expect(speedDigits(0.125)).toBe(3);
  });
});
