import { tangentPlane } from '../data/acmi';
import { DCS_PROJECTIONS, fromDcs, toDcs } from './dcsProjection';
import { worldToData } from '../render/pose';
import type { AxisMapping, Bounds, GeoReference } from '../state/types';

/**
 * Tile maths for the world backdrop: Web Mercator tiles, the box of the earth a
 * dataset covers, and the tangent plane its positions are in.
 *
 * Positions inside the backdrop builder are kept as normalised Web Mercator,
 * `mx` east and `my` south, both 0..1 over the whole world, which is what tile
 * numbers and tile pixels are fractions of. They become metres only at the
 * end, through the dataset's own projection (`tangentPlane`, the one the ACMI
 * reader uses), so the backdrop and the data meet in the same numbers.
 */

/** Latitude where Web Mercator stops, degrees. */
export const MAX_LAT = 85.0511287798066;

/** A box on the earth, degrees. */
export interface GeoBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

/** Tiles from `x0` to `x1` and `y0` to `y1`, inclusive, at zoom `z`. */
export interface TileRange {
  z: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export function lonToMx(lon: number): number {
  return (lon + 180) / 360;
}

export function latToMy(lat: number): number {
  const l = Math.max(-MAX_LAT, Math.min(MAX_LAT, lat)) * (Math.PI / 180);
  return 0.5 - Math.log(Math.tan(Math.PI / 4 + l / 2)) / (2 * Math.PI);
}

export function mxToLon(mx: number): number {
  return mx * 360 - 180;
}

export function myToLat(my: number): number {
  return (Math.atan(Math.sinh(Math.PI * (1 - 2 * my))) * 180) / Math.PI;
}

/** The tile holding a point at zoom `z`. */
export function tileOf(lat: number, lon: number, z: number): { x: number; y: number } {
  const n = 2 ** z;
  const clamp = (v: number) => Math.max(0, Math.min(n - 1, Math.floor(v)));
  return { x: clamp(lonToMx(lon) * n), y: clamp(latToMy(lat) * n) };
}

/** A tile's box in degrees. */
export function tileBox(x: number, y: number, z: number): GeoBox {
  const n = 2 ** z;
  return { west: mxToLon(x / n), east: mxToLon((x + 1) / n), north: myToLat(y / n), south: myToLat((y + 1) / n) };
}

/** The tiles covering a box at zoom `z`. */
export function tileRange(box: GeoBox, z: number): TileRange {
  const nw = tileOf(box.north, box.west, z);
  const se = tileOf(box.south, box.east, z);
  return { z, x0: nw.x, x1: se.x, y0: nw.y, y1: se.y };
}

export function tileCount(r: TileRange): number {
  return (r.x1 - r.x0 + 1) * (r.y1 - r.y0 + 1);
}

/** Every tile of a range, rows north to south. */
export function tilesOf(r: TileRange): Array<{ x: number; y: number; z: number }> {
  const out: Array<{ x: number; y: number; z: number }> = [];
  for (let y = r.y0; y <= r.y1; y++) for (let x = r.x0; x <= r.x1; x++) out.push({ x, y, z: r.z });
  return out;
}

/**
 * The deepest zoom, at most `maxZoom`, at which the box takes no more than
 * `maxTiles` tiles; `minZoom` when even that takes more (the caller decides
 * whether that is acceptable).
 */
export function pickZoom(box: GeoBox, maxZoom: number, maxTiles: number, minZoom = 0): number {
  for (let z = maxZoom; z > minZoom; z--) if (tileCount(tileRange(box, z)) <= maxTiles) return z;
  return minZoom;
}

/** Metres a tile pixel covers on the ground at a latitude and zoom (256 px tiles). */
export function metresPerPixel(lat: number, z: number): number {
  return (40075016.686 * Math.cos((lat * Math.PI) / 180)) / (256 * 2 ** z);
}

/**
 * The inverse of `tangentPlane`: the latitude and longitude of east and north
 * metres on the plane at (lat0, lon0), on the ellipsoid's surface.
 *
 * Newton's method on the forward projection, started from the spherical guess:
 * three steps take it below a millimetre anywhere a recording could reach.
 */
export function fromTangentPlane(lat0: number, lon0: number): (e: number, n: number) => [number, number] {
  const fwd = tangentPlane(lat0, lon0);
  const R = 6371008.8;
  const rad = Math.PI / 180;
  return (e, n) => {
    let lat = lat0 + n / (R * rad);
    let lon = lon0 + e / (R * rad * Math.max(1e-6, Math.cos(lat0 * rad)));
    for (let i = 0; i < 4; i++) {
      const [e0, n0] = fwd(lat, lon);
      const d = 1e-4;
      const [eLat, nLat] = fwd(lat + d, lon);
      const [eLon, nLon] = fwd(lat, lon + d);
      // Jacobian of (e, n) over (lat, lon), by finite differences.
      const a = (eLat - e0) / d;
      const b = (eLon - e0) / d;
      const c = (nLat - n0) / d;
      const dd = (nLon - n0) / d;
      const det = a * dd - b * c;
      if (!det) break;
      const re = e - e0;
      const rn = n - n0;
      lat += (dd * re - b * rn) / det;
      lon += (-c * re + a * rn) / det;
      if (Math.abs(re) + Math.abs(rn) < 1e-4) break;
    }
    return [lat, lon];
  };
}

/**
 * A data-frame point's east and north metres on its projection's plane: x
 * and y or z on a tangent plane, by which axis the reference says is north;
 * DCS's z and x.
 */
export function eastNorthOf(geo: GeoReference, d: { x: number; y: number; z: number }): [number, number] {
  if (geo.projection === 'dcs-tm') return [d.z, d.x];
  return geo.north === 'z' ? [d.x, d.z] : [d.x, d.y];
}

/** East, north and height metres as a data-frame point: the inverse of `eastNorthOf`. */
export function dataOfEastNorth(geo: GeoReference, e: number, n: number, h: number): { x: number; y: number; z: number } {
  if (geo.projection === 'dcs-tm') return { x: n, y: h, z: e };
  return geo.north === 'z' ? { x: e, y: h, z: n } : { x: e, y: n, z: h };
}

/** The height of a data-frame point. */
export function heightOf(geo: GeoReference, d: { x: number; y: number; z: number }): number {
  if (geo.projection === 'dcs-tm') return d.y;
  return geo.north === 'z' ? d.y : d.z;
}

/** +1 when east, north, height go into the data's frame without a mirror, -1 when they are mirrored. */
export function frameSense(geo: GeoReference): number {
  // DCS's (north, height, east) is a turn of (east, north, height); (east, height, north) a mirror.
  if (geo.projection === 'dcs-tm') return 1;
  return geo.north === 'z' ? -1 : 1;
}

/** Whether the viewer knows the projection a reference names. */
export function knownProjection(geo: GeoReference): boolean {
  return geo.projection === 'tangent-plane' || (geo.projection === 'dcs-tm' && !!geo.theatre && !!DCS_PROJECTIONS[geo.theatre]);
}

/** Latitude and longitude to the reference's east and north metres. */
export function planeForward(geo: GeoReference): (lat: number, lon: number) => [number, number] {
  if (geo.projection === 'dcs-tm') {
    const proj = DCS_PROJECTIONS[geo.theatre ?? ''];
    if (!proj) throw new Error(`unknown DCS theatre ${geo.theatre}`);
    return (lat, lon) => {
      const p = toDcs(proj, lat, lon);
      return [p.z, p.x];
    };
  }
  const fwd = tangentPlane(geo.lat0, geo.lon0);
  return (lat, lon) => {
    const [e, n] = fwd(lat, lon);
    return [e, n];
  };
}

/** The reference's east and north metres to latitude and longitude. */
export function planeInverse(geo: GeoReference): (e: number, n: number) => [number, number] {
  if (geo.projection === 'dcs-tm') {
    const proj = DCS_PROJECTIONS[geo.theatre ?? ''];
    if (!proj) throw new Error(`unknown DCS theatre ${geo.theatre}`);
    return (e, n) => fromDcs(proj, n, e);
  }
  return fromTangentPlane(geo.lat0, geo.lon0);
}

/** The smallest box holding both. */
export function unionBox(a: GeoBox, b: GeoBox): GeoBox {
  return { south: Math.min(a.south, b.south), west: Math.min(a.west, b.west), north: Math.max(a.north, b.north), east: Math.max(a.east, b.east) };
}

/** A box of `km` kilometres on a side round a point. */
export function boxAround(lat: number, lon: number, km: number): GeoBox {
  const dLat = (km * 500) / 111_320;
  const dLon = dLat / Math.max(0.05, Math.cos((lat * Math.PI) / 180));
  return { south: Math.max(-MAX_LAT, lat - dLat), north: Math.min(MAX_LAT, lat + dLat), west: lon - dLon, east: lon + dLon };
}

/**
 * The box of the earth under a dataset's extent, `margin` metres wider on
 * every side.
 *
 * `bounds` is the world box (after the load's axis mapping); its corners are
 * taken back to the data's own east and north metres through `axes`, and from
 * there to latitude and longitude. Every corner of the box is converted, and
 * every edge's middle, so a box far from the reference, whose meridians lean,
 * is still covered.
 */
export function geoBoxOf(geo: GeoReference, bounds: Bounds, axes: AxisMapping | null | undefined, margin: number): GeoBox {
  let minE = Infinity;
  let maxE = -Infinity;
  let minN = Infinity;
  let maxN = -Infinity;
  for (const x of [bounds.minX, bounds.maxX]) {
    for (const y of [bounds.minY, bounds.maxY]) {
      for (const z of [bounds.minZ, bounds.maxZ]) {
        const [e, n] = eastNorthOf(geo, worldToData({ x, y, z }, axes));
        minE = Math.min(minE, e);
        maxE = Math.max(maxE, e);
        minN = Math.min(minN, n);
        maxN = Math.max(maxN, n);
      }
    }
  }
  minE -= margin;
  maxE += margin;
  minN -= margin;
  maxN += margin;
  const inv = planeInverse(geo);
  const box: GeoBox = { south: Infinity, west: Infinity, north: -Infinity, east: -Infinity };
  const midE = (minE + maxE) / 2;
  const midN = (minN + maxN) / 2;
  for (const [e, n] of [
    [minE, minN],
    [maxE, minN],
    [minE, maxN],
    [maxE, maxN],
    [midE, minN],
    [midE, maxN],
    [minE, midN],
    [maxE, midN],
  ]) {
    const [lat, lon] = inv(e, n);
    box.south = Math.min(box.south, lat);
    box.north = Math.max(box.north, lat);
    box.west = Math.min(box.west, lon);
    box.east = Math.max(box.east, lon);
  }
  box.south = Math.max(-MAX_LAT, box.south);
  box.north = Math.min(MAX_LAT, box.north);
  return box;
}

/**
 * Normalised Web Mercator to the dataset's east and north metres. Heights are
 * not touched: a recording's altitude is height above sea level, not above the
 * tangent plane, so the plane's fall-away with distance is left out here just
 * as the ACMI reader leaves it out of the data.
 */
export function mercatorToPlane(geo: GeoReference): (mx: number, my: number) => [number, number] {
  const fwd = planeForward(geo);
  return (mx, my) => fwd(myToLat(my), mxToLon(mx));
}

/** The middle of a box, degrees. */
export function boxCentre(box: GeoBox): { lat: number; lon: number } {
  return { lat: (box.south + box.north) / 2, lon: (box.west + box.east) / 2 };
}
