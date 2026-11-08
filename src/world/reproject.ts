import { dataToWorld, worldToData } from '../render/pose';
import type { Bounds, GeoPlacement } from '../state/types';
import { accumulateNormals, handedness } from './mesh';
import { dataOfEastNorth, eastNorthOf, frameSense, heightOf, planeForward, planeInverse, type GeoBox } from './tiles';

/**
 * A world backdrop moved from the plane it was built on to another: a theatre
 * built round its own reference, then a recording loaded whose reference is
 * somewhere else (a Tacview file names its own), or whose axes differ.
 *
 * Both planes touch the same ellipsoid, so a point's east and north on one
 * are a smooth function of its east and north on the other: nearly a turn and
 * a shift, bent slightly with distance. That function is computed exactly on
 * a grid over the backdrop (through latitude and longitude) and read
 * bilinearly between: with 256 cells a side the reading is within a metre or
 * two even over a whole theatre two thousand kilometres across, and a few
 * million vertices move in well under a second. Heights stay: both planes
 * carry altitude above sea level.
 */

/** Whether two placements put the same east, north and height at the same world point. */
export function samePlacement(a: GeoPlacement, b: GeoPlacement): boolean {
  const ga = a.geo;
  const gb = b.geo;
  if (ga.lat0 !== gb.lat0 || ga.lon0 !== gb.lon0 || ga.projection !== gb.projection || (ga.north ?? 'y') !== (gb.north ?? 'y') || ga.theatre !== gb.theatre) return false;
  const aa = a.axes;
  const ab = b.axes;
  if (!aa || !ab) return !aa && !ab;
  return aa.up === ab.up && !!aa.flipX === !!ab.flipX && !!aa.flipY === !!ab.flipY && !!aa.flipZ === !!ab.flipZ && (aa.scale || 1) === (ab.scale || 1);
}

const CELLS = 256;

export interface Reprojected {
  vertices: Float32Array;
  /** The index arrays, their winding turned when the move mirrors the world; the same arrays otherwise. */
  indices: Uint32Array[];
  bounds: Bounds;
  /** A world height range (the relief band) said again in the new placement. */
  band: (lowY: number, highY: number) => { lowY: number; highY: number };
  /** Any other world point of the backdrop (a label), moved the same way. */
  move: (x: number, y: number, z: number) => { x: number; y: number; z: number };
}

/**
 * Interleaved position+normal vertices moved from one placement to another,
 * normals rebuilt from the faces of `indices` (every index array that draws
 * them).
 */
export function reproject(vertices: Float32Array, indices: Uint32Array[], from: GeoPlacement, to: GeoPlacement): Reprojected {
  const n = vertices.length / 6;
  // East and north on the old plane, and the box they span.
  const en = new Float64Array(n * 2);
  const hs = new Float64Array(n);
  let minE = Infinity;
  let maxE = -Infinity;
  let minN = Infinity;
  let maxN = -Infinity;
  for (let i = 0; i < n; i++) {
    const d = worldToData({ x: vertices[i * 6], y: vertices[i * 6 + 1], z: vertices[i * 6 + 2] }, from.axes);
    const [e, nn] = eastNorthOf(from.geo, d);
    en[i * 2] = e;
    en[i * 2 + 1] = nn;
    hs[i] = heightOf(from.geo, d);
    if (e < minE) minE = e;
    if (e > maxE) maxE = e;
    if (nn < minN) minN = nn;
    if (nn > maxN) maxN = nn;
  }
  if (!(maxE >= minE)) {
    minE = maxE = minN = maxN = 0;
  }
  const spanE = Math.max(1, maxE - minE);
  const spanN = Math.max(1, maxN - minN);
  // The exact move at every grid node.
  const inv = planeInverse(from.geo);
  const fwd = planeForward(to.geo);
  const k = CELLS + 1;
  const ge = new Float64Array(k * k);
  const gn = new Float64Array(k * k);
  for (let j = 0; j < k; j++) {
    for (let i = 0; i < k; i++) {
      const [lat, lon] = inv(minE + (spanE * i) / CELLS, minN + (spanN * j) / CELLS);
      const [e, nn] = fwd(lat, lon);
      ge[j * k + i] = e;
      gn[j * k + i] = nn;
    }
  }
  const at = (e: number, nn: number, h: number) => {
    const fx = Math.min(CELLS - 1e-9, Math.max(0, ((e - minE) / spanE) * CELLS));
    const fy = Math.min(CELLS - 1e-9, Math.max(0, ((nn - minN) / spanN) * CELLS));
    const i = Math.floor(fx);
    const j = Math.floor(fy);
    const u = fx - i;
    const w = fy - j;
    const a = j * k + i;
    const lerp = (g: Float64Array) => g[a] * (1 - u) * (1 - w) + g[a + 1] * u * (1 - w) + g[a + k] * (1 - u) * w + g[a + k + 1] * u * w;
    return dataToWorld(dataOfEastNorth(to.geo, lerp(ge), lerp(gn), h), to.axes);
  };
  const out = new Float32Array(vertices.length);
  const bounds: Bounds = { minX: Infinity, minY: Infinity, minZ: Infinity, maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity };
  for (let v = 0; v < n; v++) {
    const p = at(en[v * 2], en[v * 2 + 1], hs[v]);
    out[v * 6] = p.x;
    out[v * 6 + 1] = p.y;
    out[v * 6 + 2] = p.z;
    if (p.x < bounds.minX) bounds.minX = p.x;
    if (p.x > bounds.maxX) bounds.maxX = p.x;
    if (p.y < bounds.minY) bounds.minY = p.y;
    if (p.y > bounds.maxY) bounds.maxY = p.y;
    if (p.z < bounds.minZ) bounds.minZ = p.z;
    if (p.z > bounds.maxZ) bounds.maxZ = p.z;
  }
  // A move between a mirrored and an unmirrored world turns every triangle over.
  const sense = (p: GeoPlacement) => handedness(p.axes) * frameSense(p.geo);
  const flip = sense(from) !== sense(to);
  const idx = indices.map((a) => {
    if (!flip) return a;
    const b = a.slice();
    for (let i = 0; i + 2 < b.length; i += 3) {
      const t = b[i + 1];
      b[i + 1] = b[i + 2];
      b[i + 2] = t;
    }
    return b;
  });
  for (const a of idx) accumulateNormals(out, a);
  for (let i = 0; i < n; i++) {
    const o = i * 6 + 3;
    const l = Math.hypot(out[o], out[o + 1], out[o + 2]);
    if (l > 0) {
      out[o] /= l;
      out[o + 1] /= l;
      out[o + 2] /= l;
    } else out[o + 1] = 1;
  }
  const heightToY = (h: number) => dataToWorld(dataOfEastNorth(to.geo, 0, 0, h), to.axes).y;
  const yToHeight = (y: number) => heightOf(from.geo, worldToData({ x: 0, y, z: 0 }, from.axes));
  return {
    vertices: out,
    indices: idx,
    bounds,
    move: (x, y, z) => {
      const d = worldToData({ x, y, z }, from.axes);
      const [e, nn] = eastNorthOf(from.geo, d);
      return at(e, nn, heightOf(from.geo, d));
    },
    band: (lowY, highY) => {
      const a = heightToY(yToHeight(lowY));
      const b = heightToY(yToHeight(highY));
      return { lowY: Math.min(a, b), highY: Math.max(a, b) };
    },
  };
}

/** One world point moved exactly from one placement to another (through latitude and longitude); heights stay. */
export function movePoint(p: { x: number; y: number; z: number }, from: GeoPlacement, to: GeoPlacement): { x: number; y: number; z: number } {
  const d = worldToData(p, from.axes);
  const [e, n] = eastNorthOf(from.geo, d);
  const [lat, lon] = planeInverse(from.geo)(e, n);
  const [e2, n2] = planeForward(to.geo)(lat, lon);
  return dataToWorld(dataOfEastNorth(to.geo, e2, n2, heightOf(from.geo, d)), to.axes);
}

/**
 * The world box a streamed theatre's level stands for: the theatre's box and
 * 1,500 km round it (the streamer's reach), from 100 m below the sea to 4 km
 * up, on the placement given. The level itself has no triangles (its ground
 * comes as tiles), so this is what the camera's far plane and the framing go
 * by; it is worked out again, never moved, when the level is put on another
 * placement, since an empty mesh moved has no box at all.
 */
export function streamBounds(placement: GeoPlacement, box: GeoBox): { bounds: Bounds; band: { minY: number; maxY: number } } {
  const fwd = planeForward(placement.geo);
  const pts = [
    [box.south, box.west],
    [box.north, box.east],
  ].map(([la, lo]) => fwd(la, lo));
  const reach = 1_500_000;
  const lo = dataToWorld(dataOfEastNorth(placement.geo, Math.min(pts[0][0], pts[1][0]) - reach, Math.min(pts[0][1], pts[1][1]) - reach, -100), placement.axes);
  const hi = dataToWorld(dataOfEastNorth(placement.geo, Math.max(pts[0][0], pts[1][0]) + reach, Math.max(pts[0][1], pts[1][1]) + reach, 4000), placement.axes);
  const bounds = {
    minX: Math.min(lo.x, hi.x),
    maxX: Math.max(lo.x, hi.x),
    minY: Math.min(lo.y, hi.y),
    maxY: Math.max(lo.y, hi.y),
    minZ: Math.min(lo.z, hi.z),
    maxZ: Math.max(lo.z, hi.z),
  };
  return { bounds, band: { minY: bounds.minY, maxY: bounds.maxY } };
}
