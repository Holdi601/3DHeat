import { describe, expect, it } from 'vitest';
import { msg } from '../data/msg';
import type { AxisMapping, GeoReference } from '../state/types';
import { buildBackdrop, OPENFREEMAP_TILEJSON, type BackdropIo } from './backdrop';
import { GEOM_LINE, GEOM_POLYGON } from './mvt';
import { bytes, commands, double, feature, layer, str } from './mvtWriter';

const GEO: GeoReference = { lat0: 43, lon0: 42, projection: 'tangent-plane' };
const AXES: AxisMapping = { up: 'z', flipX: false, flipY: true, flipZ: false, scale: 1 };

/**
 * A world of our own: the ground a slope rising 1 m per zoom-12 pixel
 * eastwards, and every vector tile one building in its middle and
 * one road across it.
 */
function fakeIo(urls: string[]): BackdropIo {
  const tile = new Uint8Array([
    ...bytes(3, layer('building', [feature(1, GEOM_POLYGON, [0, 0], commands([[1900, 1900, 2200, 1900, 2200, 2200, 1900, 2200]], true))], ['render_height'], [double(3, 30)])),
    ...bytes(3, layer('transportation', [feature(2, GEOM_LINE, [0, 0], commands([[0, 2048, 4096, 2048]], false))], ['class'], [str(1, 'primary')])),
  ]);
  return {
    async fetch(url) {
      urls.push(url);
      if (url === OPENFREEMAP_TILEJSON) {
        const json = JSON.stringify({ tiles: ['https://tiles.example/v1/{z}/{x}/{y}.pbf'] });
        return { bytes: new TextEncoder().encode(json).buffer as ArrayBuffer, cached: false };
      }
      if (url.endsWith('.pbf')) return { bytes: tile.slice().buffer, cached: true };
      // The tile's column, for the slope to run on across tiles.
      return { bytes: Float64Array.of(Number(url.split('/').at(-2))).buffer, cached: false };
    },
    async decodePng(bytes) {
      const column = new Float64Array(bytes)[0];
      const rgba = new Uint8ClampedArray(256 * 256 * 4);
      for (let y = 0; y < 256; y++) {
        for (let x = 0; x < 256; x++) {
          const v = 500 + (column - 2525) * 256 + x + 32768;
          rgba.set([Math.floor(v / 256), v % 256, 0, 255], (y * 256 + x) * 4);
        }
      }
      return { width: 256, height: 256, rgba };
    },
    progress() {},
  };
}

describe('the world backdrop', () => {
  it('builds terrain, roads and buildings for a box round the data, in its metres', async () => {
    const urls: string[] = [];
    const r = await buildBackdrop(
      // 2 km of data round the reference, 1 km up; the ACMI world mapping.
      { geo: GEO, bounds: { minX: -1000, maxX: 1000, minY: 0, maxY: 1000, minZ: -1000, maxZ: 1000 }, axes: AXES, margin: 500 },
      fakeIo(urls),
    );
    const m = r.mesh;
    // The box is the data plus the margin, so about 3 km across.
    expect(m.bounds.minX).toBeLessThan(-1400);
    expect(m.bounds.maxX).toBeGreaterThan(1400);
    expect(m.bounds.maxX).toBeLessThan(1600);
    expect(m.bounds.minZ).toBeLessThan(-1400);
    expect(m.bounds.maxZ).toBeGreaterThan(1400);
    // Terrain rises eastwards, at about one metre per zoom-12 pixel (28 m).
    expect(m.groundBand.maxY - m.groundBand.minY).toBeGreaterThan(80);
    expect(m.groundBand.maxY - m.groundBand.minY).toBeLessThan(140);
    expect(r.stats.terrainZoom).toBe(12);
    // Every zoom-14 vector tile gave its building and its road.
    expect(r.stats.vectorZoom).toBe(14);
    expect(r.stats.buildings).toBeGreaterThan(0);
    expect(r.stats.roads).toBeGreaterThan(0);
    expect(m.structureIndices.length).toBeGreaterThan(0);
    expect(m.partNames).toEqual(['terrain', 'water', 'transportation', 'railway', 'aeroway', 'building']);
    // Buildings stand on the ground: their lowest point is no lower than the terrain's.
    let lowest = Infinity;
    for (let i = 0; i < m.structureIndices.length; i++) lowest = Math.min(lowest, m.vertices[m.structureIndices[i] * 6 + 1]);
    expect(lowest).toBeGreaterThanOrEqual(m.groundBand.minY - 1e-3);
    expect(r.credits).toEqual(['openfreemap', 'terrarium']);
    expect(urls.some((u) => u.includes('elevation-tiles-prod/terrarium/12/'))).toBe(true);
    expect(r.stats.fromCache).toBe(r.stats.vectorTiles);
  });

  it('builds terrain alone when the map cannot be reached', async () => {
    const io = fakeIo([]);
    const inner = io.fetch;
    io.fetch = async (url, p) => {
      if (url === OPENFREEMAP_TILEJSON) throw new Error('offline');
      return inner(url, p);
    };
    const r = await buildBackdrop({ geo: GEO, bounds: { minX: -100, maxX: 100, minY: 0, maxY: 0, minZ: -100, maxZ: 100 }, axes: AXES }, io);
    expect(r.mesh.indices.length).toBeGreaterThan(0);
    expect(r.mesh.structureIndices.length).toBe(0);
    expect(r.credits).toEqual(['terrarium']);
    expect(r.notes).toContainEqual(msg('heat.world.note.noMap'));
  });
});
