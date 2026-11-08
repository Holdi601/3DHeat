/**
 * A dataset placed on the earth (`Dataset.geo`), both ways: a point of the
 * viewer's world as latitude, longitude and height, and a place on the earth
 * as a point of the world - through the load's axis mapping and the
 * reference's projection, as the world backdrop is placed.
 */

import { dataToWorld, worldToData } from '../render/pose';
import type { AxisMapping, GeoReference } from '../state/types';
import { dataOfEastNorth, eastNorthOf, heightOf, knownProjection, planeForward, planeInverse } from './tiles';

export interface GeoFrame {
  geo: GeoReference;
  /** A world point (data units) as [latitude, longitude, height in metres]. */
  latLon(x: number, y: number, z: number): [number, number, number];
  /** A place as a world point. */
  world(lat: number, lon: number, h: number): { x: number; y: number; z: number };
}

const cache = new WeakMap<object, GeoFrame | null>();

/** The frame of a dataset on the earth; null when it is not placed or its projection is unknown. */
export function geoFrame(d: { geo?: GeoReference; axes?: AxisMapping }): GeoFrame | null {
  if (cache.has(d)) return cache.get(d)!;
  const geo = d.geo;
  let out: GeoFrame | null = null;
  if (geo && knownProjection(geo)) {
    const inv = planeInverse(geo);
    const fwd = planeForward(geo);
    const axes = d.axes ?? null;
    out = {
      geo,
      latLon(x, y, z) {
        const p = worldToData({ x, y, z }, axes);
        const [e, n] = eastNorthOf(geo, p);
        const [lat, lon] = inv(e, n);
        return [lat, lon, heightOf(geo, p)];
      },
      world(lat, lon, h) {
        const [e, n] = fwd(lat, lon);
        return dataToWorld(dataOfEastNorth(geo, e, n, h), axes);
      },
    };
  }
  cache.set(d, out);
  return out;
}
