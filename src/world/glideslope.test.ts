import { describe, expect, it } from 'vitest';
import { bearingTo, destination, glideslopeDeviation, glideslopes, NM } from './glideslope';
import { parseRunways, type Runway } from './runways';

const RWY: Runway = { airport: 'TEST', le: [36.2, -115.05], he: [36.2, -115.0], leIdent: '09', heIdent: '27', width: 45, surface: 'ASP', leElevation: 570, heElevation: NaN };

describe('glideslopes', () => {
  it('measures bearings and walks along them', () => {
    expect(bearingTo([0, 0], [1, 0])).toBeCloseTo(0, 6);
    expect(bearingTo([0, 0], [0, 1])).toBeCloseTo(90, 6);
    const p = destination([36, -115], 270, 10 * NM);
    expect(bearingTo([36, -115], p)).toBeCloseTo(270, 1);
  });

  it('draws 3° paths onto both ends, from the threshold out', () => {
    const [g09, g27] = glideslopes(RWY, { ground: () => 600 });
    expect(g09.ident).toBe('09');
    expect(g09.course).toBeCloseTo(90, 0);
    expect(g09.elevation).toBe(570);
    expect(g27.elevation).toBe(600);
    const at10 = g09.path[g09.path.length - 1];
    expect(at10.nm).toBeCloseTo(10, 6);
    // West of the 09 threshold, about 3185 ft above it at 10 NM.
    expect(at10.lon).toBeLessThan(RWY.le[1]);
    expect(at10.h - 570 - 15).toBeCloseTo(Math.tan((3 * Math.PI) / 180) * 10 * NM, 3);
    expect(g09.upper[4].h).toBeGreaterThan(g09.path[4].h);
    expect(g09.lower[4].h).toBeLessThan(g09.path[4].h);
  });

  it('tells how far off the slope an aircraft is', () => {
    const [g09] = glideslopes(RWY);
    const on = g09.path[10];
    expect(glideslopeDeviation(g09, on.lat, on.lon, on.h - 15)!.degrees).toBeCloseTo(0, 2);
    expect(glideslopeDeviation(g09, on.lat, on.lon, on.h + 200)!.degrees).toBeGreaterThan(0.5);
    // Past the threshold (over the runway, east of it): none.
    expect(glideslopeDeviation(g09, 36.2, -115.02, 700)).toBeNull();
  });

  it('keeps the ends\' elevations from the list', () => {
    const csv = 'id,airport_ref,airport_ident,length_ft,width_ft,surface,lighted,closed,le_ident,le_latitude_deg,le_longitude_deg,le_elevation_ft,le_heading_degT,le_displaced_threshold_ft,he_ident,he_latitude_deg,he_longitude_deg,he_elevation_ft\n1,1,KXYZ,9000,150,ASP,1,0,03,36.0,-115.0,1870,30,,21,36.02,-114.99,\n';
    const [r] = parseRunways(csv);
    expect(r.leElevation).toBeCloseTo(570, 0);
    expect(Number.isNaN(r.heElevation!)).toBe(true);
  });
});
