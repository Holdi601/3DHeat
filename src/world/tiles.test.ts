import { describe, expect, it } from 'vitest';
import { tangentPlane } from '../data/acmi';
import { dataToWorld } from '../render/pose';
import type { AxisMapping, GeoReference } from '../state/types';
import {
  fromTangentPlane,
  geoBoxOf,
  latToMy,
  lonToMx,
  mercatorToPlane,
  metresPerPixel,
  myToLat,
  mxToLon,
  pickZoom,
  tileBox,
  tileCount,
  tileOf,
  tileRange,
} from './tiles';

describe('tile maths', () => {
  it('numbers tiles the way the slippy-map convention does', () => {
    // Zoom 0 is one tile; the equator and the prime meridian meet at the middle of zoom 1.
    expect(tileOf(0, 0, 0)).toEqual({ x: 0, y: 0 });
    expect(tileOf(1, 1, 1)).toEqual({ x: 1, y: 0 });
    expect(tileOf(-1, -1, 1)).toEqual({ x: 0, y: 1 });
    // Known tiles: Berlin, Brandenburg Gate, at zoom 10 and 14.
    expect(tileOf(52.5163, 13.3777, 10)).toEqual({ x: 550, y: 335 });
    expect(tileOf(52.5163, 13.3777, 14)).toEqual({ x: 8800, y: 5373 });
    // The test recording's reference point.
    expect(tileOf(43, 42, 12)).toEqual({ x: 2525, y: 1505 });
  });

  it('goes from latitude and longitude to tiles and back', () => {
    for (const [lat, lon] of [
      [43, 42],
      [-33.86, 151.21],
      [64.1, -21.9],
      [0, 0],
    ]) {
      expect(myToLat(latToMy(lat))).toBeCloseTo(lat, 9);
      expect(mxToLon(lonToMx(lon))).toBeCloseTo(lon, 9);
      const z = 13;
      const t = tileOf(lat, lon, z);
      const b = tileBox(t.x, t.y, z);
      expect(lat).toBeGreaterThanOrEqual(b.south);
      expect(lat).toBeLessThanOrEqual(b.north);
      expect(lon).toBeGreaterThanOrEqual(b.west);
      expect(lon).toBeLessThanOrEqual(b.east);
    }
  });

  it('picks the deepest zoom under a tile cap', () => {
    const box = { south: 42.9, west: 41.9, north: 43.1, east: 42.1 };
    const z = pickZoom(box, 14, 36);
    expect(tileCount(tileRange(box, z))).toBeLessThanOrEqual(36);
    expect(tileCount(tileRange(box, z + 1))).toBeGreaterThan(36);
    // A pixel at zoom 12 is about 28 m at 43 degrees north.
    expect(metresPerPixel(43, 12)).toBeCloseTo(27.96, 1);
  });

  it('puts a tile corner where the tangent plane puts its latitude and longitude', () => {
    const geo: GeoReference = { lat0: 43, lon0: 42, projection: 'tangent-plane' };
    const toPlane = mercatorToPlane(geo);
    const fwd = tangentPlane(43, 42);
    const z = 12;
    const t = tileOf(43.05, 42.07, z);
    const corner = tileBox(t.x, t.y, z);
    const [e, n] = toPlane(t.x / 2 ** z, t.y / 2 ** z);
    const [e2, n2] = fwd(corner.north, corner.west);
    expect(e).toBeCloseTo(e2, 6);
    expect(n).toBeCloseTo(n2, 6);
    // 0.07 degrees east of the reference at 43 N is about 5.7 km; 0.05 north about 5.6 km.
    const [ec, nc] = fwd(43.05, 42.07);
    expect(ec).toBeGreaterThan(5600);
    expect(ec).toBeLessThan(5750);
    expect(nc).toBeGreaterThan(5500);
    expect(nc).toBeLessThan(5600);
  });

  it('inverts the tangent plane to below a millimetre', () => {
    const fwd = tangentPlane(43, 42);
    const inv = fromTangentPlane(43, 42);
    for (const [e, n] of [
      [0, 0],
      [12_000, -3_000],
      [-80_000, 150_000],
    ]) {
      const [lat, lon] = inv(e, n);
      const [e2, n2] = fwd(lat, lon);
      expect(Math.abs(e2 - e)).toBeLessThan(1e-3);
      expect(Math.abs(n2 - n)).toBeLessThan(1e-3);
    }
  });

  it('finds the box of the earth under a dataset through its axis mapping', () => {
    const geo: GeoReference = { lat0: 43, lon0: 42, projection: 'tangent-plane' };
    // The ACMI mapping: Z up, north flipped into world -Z.
    const axes: AxisMapping = { up: 'z', flipX: false, flipY: true, flipZ: false, scale: 1 };
    const a = dataToWorld({ x: -6000, y: -1500, z: 0 }, axes);
    const b = dataToWorld({ x: 5000, y: 1200, z: 4500 }, axes);
    const bounds = {
      minX: Math.min(a.x, b.x),
      maxX: Math.max(a.x, b.x),
      minY: Math.min(a.y, b.y),
      maxY: Math.max(a.y, b.y),
      minZ: Math.min(a.z, b.z),
      maxZ: Math.max(a.z, b.z),
    };
    const box = geoBoxOf(geo, bounds, axes, 1000);
    const fwd = tangentPlane(43, 42);
    const [w] = fwd(43, box.west);
    const [e] = fwd(43, box.east);
    const [, s] = fwd(box.south, 42);
    const [, n] = fwd(box.north, 42);
    expect(w).toBeCloseTo(-7000, -1);
    expect(e).toBeCloseTo(6000, -1);
    expect(s).toBeCloseTo(-2500, -1);
    expect(n).toBeCloseTo(2200, -1);
  });
});
