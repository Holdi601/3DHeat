import { describe, expect, it } from 'vitest';
import { dms, formatLatLon, fromUtm, mgrsBand, toMgrs, toUtm, utmZone } from './mgrs';

// Reference values from PROJ (utm, WGS84).
const CASES: [number, number, number, number, number][] = [
  [40.689247, -74.044502, 18, 580735.64, 4504700.38],
  [51.5, -0.12, 30, 699889.81, 5709362.29],
  [36.2, -115.03, 11, 677112.67, 4007930.45],
  [-33.8568, 151.2153, 56, 334900.57, 6252288.75],
  [60.5, 5.5, 32, 307793.02, 6712209.07],
  [78.2, 15.6, 33, 513696.95, 8680760.05],
  [0, 0, 31, 166021.44, 0],
  [41.95, 41.8, 37, 732080.76, 4648017.24],
];

describe('UTM and MGRS', () => {
  it('projects to UTM as PROJ does', () => {
    for (const [lat, lon, zone, e, n] of CASES) {
      const u = toUtm(lat, lon);
      expect(u.zone).toBe(zone);
      expect(u.easting).toBeCloseTo(e, 1);
      expect(u.northing).toBeCloseTo(n, 1);
    }
  });
  it('comes back from UTM', () => {
    for (const [lat, lon] of CASES) {
      const [la, lo] = fromUtm(toUtm(lat, lon));
      expect(la).toBeCloseTo(lat, 7);
      expect(lo).toBeCloseTo(lon, 7);
    }
  });
  it('picks zones with the Norway and Svalbard exceptions', () => {
    expect(utmZone(60, 5)).toBe(32);
    expect(utmZone(78, 8)).toBe(31);
    expect(utmZone(78, 10)).toBe(33);
    expect(utmZone(10, 179.9)).toBe(60);
  });
  it('writes MGRS references', () => {
    expect(toMgrs(40.689247, -74.044502)).toBe('18T WL 80735 04700');
    expect(toMgrs(40.689247, -74.044502, 3)).toBe('18T WL 807 047');
    expect(toMgrs(-33.8568, 151.2153)).toMatch(/^56H LH 34900 52288$/);
    expect(mgrsBand(-80)).toBe('C');
    expect(mgrsBand(83.9)).toBe('X');
    expect(toMgrs(85, 0)).toBe('');
  });
  it('writes degrees, minutes and seconds', () => {
    expect(dms(40.689247, 'N', 'S')).toBe('40°41\'21.3"N');
    expect(dms(-74.044502, 'E', 'W')).toBe('74°02\'40.2"W');
    expect(dms(10.99999999, 'N', 'S')).toBe('11°00\'00.0"N');
    expect(formatLatLon(-1.5, 2.25)).toBe('1°30\'00.0"S 2°15\'00.0"E');
  });
});
