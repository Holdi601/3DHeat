import { describe, expect, it } from 'vitest';
import { deflateSync } from 'node:zlib';
import { blobReader, decodeTile, inflate, parseTerrainIndex, urlReader, type TerrainIndex } from './terrainFormat';
import { boxDistance, lodRange, morphRange, nodeGrid, nodeRect, nodeSize, NODE_CELLS, selectNodes, type LodGrid, type LodNode } from './terrainLod';
import { TerrainStream } from './terrainStream';
import { objectsTile, RECORD_BYTES, waterTile } from './terrainObjects';
import { classify, linkLayouts, type CatalogItem } from '../data/catalogIndex';

/**
 * A made-up tiled terrain, written the way the extractors write one
 * (heat3d-arma3-maps terrain.py): heights from `f(x, z)` on a grid of `cells`
 * cells (a power of two times 128) `spacing` apart, every level by taking
 * every second sample, tiles of 128 cells with two samples of apron.
 */
function synthetic(f: (x: number, z: number) => number, cells = 512, spacing = 10, codec: 'raw' | 'zlib' = 'raw') {
  const T = 128;
  const A = 2;
  const side = T + 1 + 2 * A;
  const origin: [number, number] = [0, -cells * spacing];
  const levels: TerrainIndex['levels'] = [];
  const parts: Uint8Array[] = [];
  let offset = 0;
  for (let l = 0; (cells >> l) >= T; l++) {
    const c = cells >> l;
    const s = spacing * 2 ** l;
    const n = c / T;
    const index: number[][] = [];
    for (let tz = 0; tz < n; tz++) {
      for (let tx = 0; tx < n; tx++) {
        const h = new Float64Array(side * side);
        for (let b = 0; b < side; b++) {
          for (let a = 0; a < side; a++) {
            const i = Math.min(c, Math.max(0, tx * T + a - A));
            const j = Math.min(c, Math.max(0, tz * T + b - A));
            h[b * side + a] = f(origin[0] + i * s, origin[1] + j * s);
          }
        }
        let lo = Infinity, hi = -Infinity;
        for (const v of h) {
          lo = Math.min(lo, v);
          hi = Math.max(hi, v);
        }
        const step = hi > lo ? (hi - lo) / 65535 : 1;
        const raw = new Uint8Array(side * side * 3);
        const dv = new DataView(raw.buffer);
        for (let k = 0; k < side * side; k++) {
          dv.setUint16(k * 2, Math.round((h[k] - lo) / step), true);
          raw[side * side * 2 + k] = h[k] < 0 ? 5 : 0;
        }
        const blob = codec === 'zlib' ? new Uint8Array(deflateSync(raw)) : raw;
        parts.push(blob);
        index.push([offset, blob.byteLength, lo, step, lo, hi]);
        offset += blob.byteLength;
      }
    }
    levels.push({ spacing: s, cells: c, tiles: n, index });
  }
  const bin = new Uint8Array(offset);
  let at = 0;
  for (const p of parts) {
    bin.set(p, at);
    at += p.byteLength;
  }
  const index = parseTerrainIndex({
    format: '3dheat-terrain', version: 1, origin, spacing, samples: [cells + 1, cells + 1],
    extent: [origin[0], origin[1], origin[0] + cells * spacing, origin[1] + cells * spacing],
    heights: { min: -50, max: 400 }, tile: T, apron: A, side, codec,
    classes: { names: ['low', 'sea floor'], colours: [[118, 132, 82], [58, 92, 112]] },
    levels, water: { y: 0 }, instances: null, bin: 'W.terrain.bin', bytes: offset,
  });
  return { index, bin };
}

const hill = (x: number, z: number) => 120 * Math.exp(-((x - 2000) ** 2 + (z + 3000) ** 2) / 1.5e6) + 0.02 * x - 10;

/** Drives a stream as a renderer would: every upload taken, a frame per call. */
async function settle(s: TerrainStream, cam: [number, number, number], rounds = 40) {
  for (let r = 0; r < rounds; r++) {
    s.frame(cam);
    s.takeUploads(1000);
    await new Promise((res) => setTimeout(res, 0));
    await new Promise((res) => setTimeout(res, 0));
  }
  return s.frame(cam);
}

describe('terrain format', () => {
  it('reads the index and refuses what is not one', () => {
    const { index } = synthetic(hill);
    expect(index.levels.map((l) => l.spacing)).toEqual([10, 20, 40]);
    expect(() => parseTerrainIndex({ format: 'x' })).toThrow();
    expect(() => parseTerrainIndex({ ...index, version: 2 })).toThrow(/newer/);
    expect(() => parseTerrainIndex({ ...index, side: 130 })).toThrow();
    expect(() => parseTerrainIndex({ ...index, bin: '../x.bin' })).toThrow();
  });

  it('inflates a zlib tile and decodes it', async () => {
    const { index, bin } = synthetic(hill, 128, 10, 'zlib');
    const e = index.levels[0].index[0];
    const raw = await inflate(bin.slice(e[0], e[0] + e[1]).buffer);
    const d = decodeTile(raw, index.side, e[2], e[3]);
    // Sample (a, b) of the tile is grid sample (a - 2, b - 2), clamped.
    expect(d.base + d.heights[(2 + 7) * index.side + 2 + 5] * d.step).toBeCloseTo(hill(50, -1280 + 70), 1);
  });

  it('reads byte ranges from a blob, and from a server that ignores the range', async () => {
    const data = Uint8Array.from({ length: 100 }, (_, i) => i);
    expect([...new Uint8Array(await blobReader(new Blob([data])).range(10, 3))]).toEqual([10, 11, 12]);
    let calls = 0;
    const fake = (async (_url: string, init?: RequestInit) => {
      calls++;
      expect((init?.headers as Record<string, string>).Range).toBe('bytes=10-12');
      return new Response(data, { status: 200 });
    }) as typeof fetch;
    const r = urlReader('/x', fake);
    expect([...new Uint8Array(await r.range(10, 3))]).toEqual([10, 11, 12]);
    expect([...new Uint8Array(await r.range(50, 2))]).toEqual([50, 51]);
    expect(calls).toBe(1);
  });
});

describe('terrain level of detail', () => {
  const g: LodGrid = { origin: [0, -5120], spacing: 10, levels: 3, cells: 512, extent: [0, -5120, 5120, 0] };

  it('draws the whole map from the top level when far, and finer near the camera', () => {
    const all = { heights: () => [0, 100] as [number, number], ready: () => true };
    const far = selectNodes(g, { camera: [2560, 1e6, -2560], ...all });
    expect(far.nodes.every((n) => n.level === 2)).toBe(true);
    expect(far.nodes.length).toBe(16);
    const near = selectNodes(g, { camera: [2560, 50, -2560], ...all });
    expect(near.nodes.some((n) => n.level === 0)).toBe(true);
    // The nodes tile the map exactly: no gap, no overlap.
    const area = near.nodes.reduce((a, n) => a + nodeSize(g, n.level) ** 2, 0);
    expect(area).toBeCloseTo(5120 * 5120, 0);
  });

  it('keeps neighbours within one level and morphs only the finer one where they meet', () => {
    const q = { camera: [1000, 30, -4000] as [number, number, number], heights: () => [0, 100] as [number, number], ready: () => true };
    const { nodes } = selectNodes(g, q);
    const rects = nodes.map((n) => ({ n, r: nodeRect(g, n) }));
    let pairs = 0;
    for (const a of rects) {
      for (const b of rects) {
        if (a === b || a.n.level !== b.n.level + 1) continue;
        const touch = a.r[0] <= b.r[2] && b.r[0] <= a.r[2] && a.r[1] <= b.r[3] && b.r[1] <= a.r[3];
        if (!touch) continue;
        // On the shared edge: the coarse node unmorphed, the fine one fully morphed.
        const x = Math.max(a.r[0], b.r[0]);
        const z = Math.max(a.r[1], b.r[1]);
        const d = Math.hypot(x - q.camera[0], 50 - q.camera[1], z - q.camera[2]);
        const [fs, fe] = morphRange(g, b.n.level);
        const [cs] = morphRange(g, a.n.level);
        expect(d).toBeGreaterThanOrEqual(fe - 1e-6);
        expect(d).toBeLessThanOrEqual(cs + 1e-6);
        expect(fs).toBeLessThan(fe);
        pairs++;
      }
      for (const b of rects) expect(Math.abs(a.n.level - b.n.level) <= 1 || !touches(a.r, b.r)).toBe(true);
    }
    expect(pairs).toBeGreaterThan(4);
  });

  it('draws a node itself while its children are not there, and asks for them', () => {
    const q = { camera: [2560, 50, -2560] as [number, number, number], heights: () => [0, 10] as [number, number], ready: (n: LodNode) => n.level > 0 };
    const { nodes, wanted } = selectNodes(g, q);
    expect(nodes.every((n) => n.level >= 1)).toBe(true);
    expect(wanted.length).toBeGreaterThan(0);
    expect(wanted.every((n) => n.level === 1)).toBe(true);
  });

  it('builds the node grid with its skirt', () => {
    const { vertices, indices } = nodeGrid(4);
    expect(vertices.length / 3).toBe(25 + 16);
    expect(indices.length).toBe(4 * 4 * 6 + 16 * 6);
    expect(Math.max(...indices)).toBe(25 + 16 - 1);
    expect(NODE_CELLS).toBe(32);
    expect(lodRange(g, 1)).toBe(2 * lodRange(g, 0));
    expect(boxDistance([0, 0, 0], 1, 1, 1, 2, 2, 2)).toBeCloseTo(Math.sqrt(3));
  });
});

function touches(a: number[], b: number[]) {
  return a[0] <= b[2] && b[0] <= a[2] && a[1] <= b[3] && b[1] <= a[3];
}

describe('terrain stream', () => {
  it('loads coarse first, then finer round the camera, and heights match the grid', async () => {
    const { index, bin } = synthetic(hill);
    const s = new TerrainStream(index, blobReader(new Blob([bin])), 'W');
    s.attach(64);
    const cam: [number, number, number] = [2000, 150, -3000];
    const f = await settle(s, cam);
    expect(f.count).toBeGreaterThan(0);
    const levels = new Set<number>();
    for (let i = 0; i < f.count; i++) levels.add(f.instances[i * 12 + 7]);
    expect(levels.has(0)).toBe(true);
    // On a sample and between samples: the drawn triangle's height.
    expect(s.heightAt(2000, -3000)).toBeCloseTo(hill(2000, -3000), 1);
    const mid = s.heightAt(2005, -2995);
    expect(Math.abs(mid - hill(2005, -2995))).toBeLessThan(0.5);
    expect(Number.isNaN(s.heightAt(-100, 0))).toBe(true);
    // A ray straight down meets the ground there.
    const hit = s.raycast([2000, 500, -3000], [0, -1, 0]);
    expect(hit?.point[1]).toBeCloseTo(hill(2000, -3000), 0);
    // A slanted one: on the ground where it meets it.
    const d = [0.6, -0.3, 0.2];
    const len = Math.hypot(...d);
    const hit2 = s.raycast([1500, 400, -3500], d.map((v) => v / len));
    expect(hit2).not.toBeNull();
    expect(Math.abs(hit2!.point[1] - s.heightAt(hit2!.point[0], hit2!.point[2]))).toBeLessThan(0.1);
    s.dispose();
  });

  it('holds no more tiles on the GPU than its layers, never giving up one still drawn', async () => {
    const { index, bin } = synthetic(hill, 1024, 5);
    const s = new TerrainStream(index, blobReader(new Blob([bin])), 'W');
    s.attach(8);
    const path: [number, number, number][] = [[500, 60, -500], [4500, 60, -4500], [500, 60, -4500], [2500, 60, -2500]];
    for (const cam of path) {
      const f = await settle(s, cam, 25);
      const layers = new Set<number>();
      for (let i = 0; i < f.count; i++) layers.add(f.instances[i * 12 + 4]);
      expect(layers.size).toBeLessThanOrEqual(8);
      expect(s.counts.gpu).toBeLessThanOrEqual(8);
    }
    expect(s.stats.evicted).toBeGreaterThan(0);
    s.dispose();
  });

  it('makes the ground check grid from its samples', async () => {
    const { index, bin } = synthetic(hill);
    const s = new TerrainStream(index, blobReader(new Blob([bin])), 'W');
    s.attach(16);
    const g = await s.heightGrid({ minX: 1000, maxX: 1200, minZ: -3100, maxZ: -2900 }, 5);
    expect(g).not.toBeNull();
    expect(g!.cell).toBe(5);
    const k = 10 * g!.nx + 20;
    expect(g!.h[k]).toBeCloseTo(hill(1000 + 20 * 5, -3100 + 10 * 5), 0);
    s.dispose();
  });
});

describe('terrain objects', () => {
  it('builds each record as its model box, turned, tipped and scaled', () => {
    const buf = new ArrayBuffer(RECORD_BYTES * 2);
    const dv = new DataView(buf);
    const put = (r: number, x: number, y: number, z: number, yaw: number, model: number, ux: number, uz: number, scale: number) => {
      const o = r * RECORD_BYTES;
      dv.setFloat32(o, x, true);
      dv.setFloat32(o + 4, y, true);
      dv.setFloat32(o + 8, z, true);
      dv.setUint16(o + 12, Math.round((yaw / 360) * 65536) % 65536, true);
      dv.setUint16(o + 14, model, true);
      dv.setInt8(o + 16, ux);
      dv.setInt8(o + 17, uz);
      dv.setUint16(o + 18, scale * 4096, true);
    };
    put(0, 100, 10, -200, 90, 0, 0, 0, 1);
    put(1, 0, 0, 0, 0, 0, 0, 0, 2);
    const tile = objectsTile('t', buf, 2, [{ box: [-1, 0, -2, 1, 3, 2] }]);
    expect(tile.structureIndices.length).toBe(72);
    expect(tile.structureEdges.length).toBe(48);
    // Turned 90 degrees about +y: x' = z, z' = -x; corner 0 (-1, 0, -2) goes to (-2, 0, 1).
    expect([tile.vertices[0], tile.vertices[1], tile.vertices[2]].map((v) => Math.round(v * 1000) / 1000)).toEqual([98, 10, -199]);
    // Scaled twice: corner 7 (1, 3, 2) of the second box.
    const v7 = (8 + 7) * 6;
    expect([tile.vertices[v7], tile.vertices[v7 + 1], tile.vertices[v7 + 2]]).toEqual([2, 6, 4]);
    expect(tile.bounds.maxY).toBe(13);
  });

  it('tips a box onto its up axis', () => {
    const buf = new ArrayBuffer(RECORD_BYTES);
    const dv = new DataView(buf);
    dv.setInt8(16, 127); // up = +x: the box lies on its side
    dv.setUint16(18, 4096, true);
    const tile = objectsTile('t', buf, 1, [{ box: [0, 0, 0, 0, 1, 0] }]);
    // Corner 2 is (0, 1, 0): turned onto +x.
    expect(tile.vertices[2 * 6]).toBeCloseTo(1, 3);
    expect(tile.vertices[2 * 6 + 1]).toBeCloseTo(0, 3);
  });

  it('covers the extent with the sea', () => {
    const w = waterTile('w', [0, -100, 50, 0], 0);
    expect(w.waterIndices.length).toBe(6);
    expect(w.bounds).toEqual({ minX: 0, minY: 0, minZ: -100, maxX: 50, maxY: 0, maxZ: 0 });
  });
});

describe('tiled terrains in the levels folder', () => {
  const item = (path: string): CatalogItem => ({ path, ...classify(path)!, bytes: 1, mtime: 0, sha256: null, extractor: null, gameBuild: null });

  it('links a terrain to its level, and makes one a level by itself', () => {
    expect(classify('arma3/Altis.terrain.json')).toEqual({ game: 'arma3', kind: 'terrain', name: 'Altis' });
    expect(classify('arma3/Altis.terrain.bin')).toBeNull();
    const linked = linkLayouts([item('arma3/Altis.glb'), item('arma3/Altis.terrain.json'), item('arma3/Altis.layouts.json'), item('dcs/Big.terrain.json')]);
    const altis = linked.find((i) => i.path === 'arma3/Altis.glb')!;
    expect(altis.terrain).toBe('arma3/Altis.terrain.json');
    expect(altis.layouts).toBe('arma3/Altis.layouts.json');
    const big = linked.find((i) => i.path === 'dcs/Big.terrain.json')!;
    expect(big.kind).toBe('level');
    expect(big.terrain).toBe('dcs/Big.terrain.json');
  });
});
