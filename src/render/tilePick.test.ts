import { describe, expect, it } from 'vitest';
import type { WorldTile } from '../world/tileSet';
import type { Ray } from './pick';
import { rayBoxEntry, raycastTiles, tileIndexed, tileSurfaceIndex } from './tilePick';

/**
 * A tile: a flat square of ground at height `y` over [x0, x0 + size] x
 * [z0, z0 + size], optionally with a water square in its middle quarter and a
 * box-topped building (a roof at y + 20 over [x0 + 1, x0 + 3]^2).
 */
function tile(id: string, x0: number, z0: number, size: number, y: number, extras: { water?: boolean; building?: boolean } = {}): WorldTile {
  const v: number[] = [];
  const quad = (xa: number, za: number, xb: number, zb: number, h: number) => {
    const base = v.length / 6;
    for (const [x, z] of [[xa, za], [xb, za], [xb, zb], [xa, zb]]) v.push(x, h, z, 0, 1, 0);
    return [base, base + 1, base + 2, base, base + 2, base + 3];
  };
  const ground = quad(x0, z0, x0 + size, z0 + size, y);
  const water = extras.water ? quad(x0 + size * 0.25, z0 + size * 0.25, x0 + size * 0.75, z0 + size * 0.75, y + 0.5) : [];
  const roof = extras.building ? quad(x0 + 1, z0 + 1, x0 + 3, z0 + 3, y + 20) : [];
  const vertices = new Float32Array(v);
  return {
    id,
    vertices,
    colours: new Float32Array((v.length / 6) * 3),
    uvs: null,
    image: null,
    indices: new Uint32Array(ground),
    structureIndices: new Uint32Array(roof),
    structureEdges: new Uint32Array(0),
    waterIndices: new Uint32Array(water),
    bounds: {
      minX: x0,
      minY: y,
      minZ: z0,
      maxX: x0 + size,
      maxY: y + (extras.building ? 20 : extras.water ? 0.5 : 0),
      maxZ: z0 + size,
    },
  };
}

const down = (x: number, z: number, from = 1000): Ray => ({ origin: { x, y: from, z }, dir: { x: 0, y: -1, z: 0 } });

describe('picking the world tiles', () => {
  it('names the set hit: ground, water or building', () => {
    const a = tile('a', 0, 0, 100, 0, { water: true, building: true });
    const b = tile('b', 100, 0, 100, 5);
    const tiles = [a, b];
    const g = raycastTiles(tiles, down(10, 80))!;
    expect(g.tile).toBe(a);
    expect(g.cls).toBe('ground');
    expect(g.point.y).toBeCloseTo(0);
    const w = raycastTiles(tiles, down(50, 50))!;
    expect(w.cls).toBe('water');
    expect(w.point.y).toBeCloseTo(0.5);
    const s = raycastTiles(tiles, down(2, 2))!;
    expect(s.cls).toBe('structure');
    expect(s.point.y).toBeCloseTo(20);
    const other = raycastTiles(tiles, down(150, 50))!;
    expect(other.tile).toBe(b);
    expect(other.point).toEqual({ x: 150, y: 5, z: 50 });
    expect(raycastTiles(tiles, down(250, 50))).toBeNull();
  });

  it('indexes only the tiles the ray reaches before its hit, once each', () => {
    // An upper tile over a lower one (a coarse tile still standing in for its
    // children would overlap like this), and one off to the side.
    const upper = tile('upper', 0, 0, 100, 50);
    const lower = tile('lower', 0, 0, 100, 0);
    const aside = tile('aside', 500, 500, 100, 0);
    const hit = raycastTiles([lower, aside, upper], down(30, 30))!;
    expect(hit.tile).toBe(upper);
    expect(tileIndexed(upper)).toBe(true);
    // The lower tile's box starts past the hit, the other one is not on the ray at all.
    expect(tileIndexed(lower)).toBe(false);
    expect(tileIndexed(aside)).toBe(false);
    // Kept with the tile: asked again, the same index.
    expect(tileSurfaceIndex(upper)).toBe(tileSurfaceIndex(upper));
  });

  it('gives way to a nearer hit on the level, and to what the view does not draw', () => {
    const a = tile('a', 0, 0, 100, 0);
    // A level surface met 500 along the ray, above the tile at 1000.
    expect(raycastTiles([a], down(10, 10), 500)).toBeNull();
    expect(raycastTiles([a], down(10, 10), 1500)?.t).toBeCloseTo(1000);
    // Sliced away below y = 1: the ray goes through.
    expect(raycastTiles([a], down(10, 10), Infinity, (_x, y) => y > 1)).toBeNull();
  });

  it('meets a box from outside and from within, and misses it past the end', () => {
    const b = { minX: 0, minY: 0, minZ: 0, maxX: 10, maxY: 1, maxZ: 10 };
    expect(rayBoxEntry(down(5, 5, 100), b)).toBeCloseTo(99, 2);
    expect(rayBoxEntry(down(5, 5, 0.5), b)).toBe(0);
    expect(rayBoxEntry(down(20, 5, 100), b)).toBe(-1);
    expect(rayBoxEntry(down(5, 5, 100), b, 50)).toBe(-1);
    // A flat box, grazed horizontally at its own height.
    const flat = { minX: 0, minY: 0, minZ: 0, maxX: 10, maxY: 0, maxZ: 10 };
    expect(rayBoxEntry({ origin: { x: -5, y: 0, z: 5 }, dir: { x: 1, y: 0, z: 0 } }, flat)).toBeCloseTo(5, 2);
  });
});
