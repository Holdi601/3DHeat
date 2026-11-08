import { describe, expect, it } from 'vitest';
import { latLonLabel, latLonLines, latLonStep, mgrsLabel, mgrsLines, mgrsStep } from './geoGrid';
import { toUtm } from './mgrs';

describe('grids', () => {
  it('picks round spacings for the span seen', () => {
    expect(latLonStep(40)).toBe(5);
    expect(latLonStep(1)).toBe(1 / 12);
    expect(latLonStep(0.001)).toBe(1 / 60);
    expect(mgrsStep(50000)).toBe(1000);
    expect(mgrsStep(900000)).toBe(100000);
  });

  it('lays latitude and longitude lines over a box', () => {
    const lines = latLonLines({ south: 46.9, north: 47.6, west: 7.8, east: 8.3 }, 0.25, 4);
    const lat = lines.filter((l) => l.kind === 'lat').map((l) => l.value);
    const lon = lines.filter((l) => l.kind === 'lon').map((l) => l.value);
    expect(lat).toEqual([47, 47.25, 47.5]);
    expect(lon).toEqual([8, 8.25]);
    expect(lines[0].pts).toHaveLength(5);
  });

  it('lays the UTM grid of the zone, its lines at constant easting and northing', () => {
    const g = mgrsLines(47.2, 8.1, 5000, 1000);
    expect(g.zone).toBe(32);
    const e = g.lines.find((l) => l.kind === 'easting')!;
    for (const [la, lo] of e.pts) expect(toUtm(la, lo, 32).easting).toBeCloseTo(e.value, 3);
    const n = g.lines.find((l) => l.kind === 'northing')!;
    for (const [la, lo] of n.pts) expect(toUtm(la, lo, 32).northing).toBeCloseTo(n.value, 3);
  });

  it('labels the lines', () => {
    expect(latLonLabel('lat', 47.5)).toBe('47°30\'N');
    expect(latLonLabel('lon', -8)).toBe('8°W');
    expect(mgrsLabel(4504000, 1000)).toBe('04');
    expect(mgrsLabel(580000, 10000)).toBe('80');
  });
});
