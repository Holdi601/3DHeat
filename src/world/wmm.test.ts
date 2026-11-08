import { describe, expect, it } from 'vitest';
import { decimalYear, declination, magneticField, magneticHeading } from './wmm';

describe('World Magnetic Model 2025', () => {
  // The model's own test values (WMM2025 report); heights in km there.
  const cases: [number, number, number, number, number, number][] = [
    [80, 0, 0, 2025.0, 1.2815, 83.2106],
    [0, 120, 0, 2025.0, -0.1583, -14.9306],
    [-80, 240, 0, 2025.0, 68.7754, -72.005],
    [80, 0, 100, 2027.5, 2.1605, 83.2852],
    [0, 120, 100, 2027.5, -0.2259, -14.8084],
    [-80, 240, 100, 2027.5, 67.9316, -72.1023],
  ];
  it('matches the published test values', () => {
    for (const [lat, lon, km, year, d, i] of cases) {
      const f = magneticField(lat, lon, km * 1000, year);
      expect(f.declination).toBeCloseTo(d, 2);
      expect(f.inclination).toBeCloseTo(i, 2);
    }
  });
  it('gives the declination of a few places', () => {
    expect(declination(51.5, -0.12, 0, Date.UTC(2026, 6, 2))).toBeCloseTo(1.165, 1);
    expect(declination(36.2, -115.03, 1000, Date.UTC(2026, 0, 1))).toBeCloseTo(11.01, 1);
  });
  it('turns a true heading into a magnetic one', () => {
    expect(magneticHeading(10, 12)).toBeCloseTo(358);
    expect(magneticHeading(350, -15)).toBeCloseTo(5);
  });
  it('writes a date as a decimal year', () => {
    expect(decimalYear(Date.UTC(2026, 0, 1))).toBe(2026);
    expect(decimalYear(Date.UTC(2026, 6, 2, 12))).toBeCloseTo(2026.5, 2);
  });
});
