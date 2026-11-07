import type { Bounds } from '../state/types';
import type { WorldTile } from '../world/tileSet';
import { buildSurfaceIndex, finish, raycastSurface, type Ray, type SurfaceHit, type SurfaceIndex, type TriangleSet } from './pick';

/**
 * Clicking on the streamed world tiles (src/world/tileSet): the nearest tile
 * triangle a ray meets, the way `raycastSurface` answers it for a level.
 *
 * Tiles come and go as the camera moves, a few hundred of them at a time, so
 * there is no one index over all of them to rebuild on every change. Each tile
 * gets its own surface index the first time a ray comes near it, kept with the
 * tile object itself (a tile is never changed in place, so the object is the
 * key), and dropped with it. A ray only looks at the tiles whose box it
 * crosses, nearest box first, and stops once its hit is nearer than the next
 * box - so a click indexes the handful of tiles between the eye and the
 * ground, not the whole set.
 */

const indexes = new WeakMap<WorldTile, SurfaceIndex>();

/**
 * A tile's surface index, built on the spot the first time and kept for the
 * tile's life. A tile is small (tens of thousands of triangles at most), so
 * building it whole costs a few milliseconds - unlike a level's, it needs no
 * slicing between frames.
 */
export function tileSurfaceIndex(tile: WorldTile): SurfaceIndex {
  let index = indexes.get(tile);
  if (!index) {
    const sets: TriangleSet[] = [
      { name: 'ground', indices: tile.indices },
      { name: 'structure', indices: tile.structureIndices },
      { name: 'water', indices: tile.waterIndices },
    ];
    index = finish(buildSurfaceIndex(tile.vertices, sets));
    indexes.set(tile, index);
  }
  return index;
}

/** Whether a tile already has its index; for tests. */
export function tileIndexed(tile: WorldTile): boolean {
  return indexes.has(tile);
}

export interface TileHit extends SurfaceHit {
  tile: WorldTile;
  /** The set hit, by name: what the pick card calls it. */
  cls: 'ground' | 'structure' | 'water';
}

/**
 * Where the ray enters a box, as a distance along it (0 when it starts
 * inside), or -1 when it misses or the box lies wholly past `maxT`.
 *
 * The box is padded a little: a tile's box is exactly its vertices' extent,
 * and a ray grazing flat ground must not be clipped off by rounding.
 */
export function rayBoxEntry(ray: Ray, b: Bounds, maxT = Infinity): number {
  const pad = 1e-3 + Math.max(b.maxX - b.minX, b.maxY - b.minY, b.maxZ - b.minZ) * 1e-6;
  let lo = 0;
  let hi = maxT;
  const axis = (o: number, d: number, min: number, max: number) => {
    if (Math.abs(d) < 1e-15) {
      if (o < min - pad || o > max + pad) hi = -1;
      return;
    }
    let a = (min - pad - o) / d;
    let c = (max + pad - o) / d;
    if (a > c) [a, c] = [c, a];
    if (a > lo) lo = a;
    if (c < hi) hi = c;
  };
  axis(ray.origin.x, ray.dir.x, b.minX, b.maxX);
  axis(ray.origin.y, ray.dir.y, b.minY, b.maxY);
  axis(ray.origin.z, ray.dir.z, b.minZ, b.maxZ);
  return hi >= lo && hi >= 0 ? lo : -1;
}

/**
 * The nearest tile triangle the ray meets before `maxT`, or null.
 *
 * `accept`, as for a level, passes over hits on what the view is not drawing
 * (the slice, the distance cull): the tiles are drawn with the level's look,
 * so they are cut by the same rules.
 */
export function raycastTiles(
  tiles: readonly WorldTile[],
  ray: Ray,
  maxT = Infinity,
  accept: ((x: number, y: number, z: number) => boolean) | null = null,
): TileHit | null {
  const near: { tile: WorldTile; entry: number }[] = [];
  for (const tile of tiles) {
    const entry = rayBoxEntry(ray, tile.bounds, maxT);
    if (entry >= 0) near.push({ tile, entry });
  }
  near.sort((a, b) => a.entry - b.entry);
  let best: TileHit | null = null;
  let bestT = maxT;
  for (const { tile, entry } of near) {
    // Every box from here on starts past the hit in hand: nothing in it is nearer.
    if (entry >= bestT) break;
    const index = tileSurfaceIndex(tile);
    const hit = raycastSurface(index, tile.vertices, ray, bestT, accept);
    if (hit && hit.t < bestT) {
      bestT = hit.t;
      best = { ...hit, tile, cls: index.sets[hit.set].name as TileHit['cls'] };
    }
  }
  return best;
}
