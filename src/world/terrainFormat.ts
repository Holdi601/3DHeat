/**
 * The tiled terrain format ("3dheat-terrain" version 1): a big level's ground
 * as a height pyramid in tiles, read a tile at a time.
 *
 * Two files beside each other in the levels folder, written by an extractor
 * (the first: heat3d-arma3-maps, `terrain.py`, which documents the bytes):
 *
 *   `<Level>.terrain.json`  the index: frame, spacing, the levels and each
 *                           tile's byte range and height encoding, the ground
 *                           classes' colours, placed objects per square cell
 *   `<Level>.terrain.bin`   the tiles, each one zlib stream: side x side uint16
 *                           heights (base + value x step, rows running +z),
 *                           then side x side uint8 classes
 *
 * Level 0 is the finest; each level above takes every second sample of the one
 * below, so a coarse sample is exactly the fine one under it and the levels
 * meet without cracks. A tile is 128 x 128 cells with two samples of apron
 * round it (133 a side), so slopes at its edges need no neighbour.
 *
 * Not tied to one game: any height grid with placed objects is written this
 * way, in the level's frame (metres, x, y up, z).
 */

export const TERRAIN_FORMAT = '3dheat-terrain';

export interface TerrainLevelInfo {
  spacing: number;
  /** Cells a side at this level (128 x 2^n). */
  cells: number;
  /** Tiles a side. */
  tiles: number;
  /** Per tile, row-major (tz * tiles + tx): byte offset, byte length, height base, height step, min, max. */
  index: number[][];
}

export interface TerrainModel {
  path?: string;
  /** Box in the model's frame turned to the level's: x right, y up, z back. lo xyz, hi xyz. */
  box: [number, number, number, number, number, number];
}

export interface TerrainInstances {
  /** Square cell size, metres. */
  cell: number;
  cells: [number, number];
  origin: [number, number];
  record: number;
  models: TerrainModel[];
  /** cx, cz, byte offset, record count. */
  index: [number, number, number, number][];
  count: number;
}

export interface TerrainIndex {
  format: typeof TERRAIN_FORMAT;
  version: 1;
  game?: string;
  level?: string;
  name?: string;
  source?: string;
  /** Level-frame (x, z) of sample (0, 0). */
  origin: [number, number];
  spacing: number;
  /** The real grid's samples along x and z (before the padding). */
  samples: [number, number];
  /** minX, minZ, maxX, maxZ of the real grid. */
  extent: [number, number, number, number];
  heights: { min: number; max: number };
  tile: number;
  apron: number;
  side: number;
  codec: 'zlib' | 'raw';
  classes: { names: string[]; colours: [number, number, number][] };
  levels: TerrainLevelInfo[];
  water: { y: number } | null;
  instances: TerrainInstances | null;
  bin: string;
  bytes: number;
}

/** The index, checked; throws with what is wrong. */
export function parseTerrainIndex(doc: unknown): TerrainIndex {
  const d = doc as Partial<TerrainIndex> | null;
  if (!d || d.format !== TERRAIN_FORMAT) throw new Error('not a 3dheat-terrain index');
  if (d.version !== 1) throw new Error(`terrain format version ${String(d.version)} is newer than this viewer reads`);
  const nums = (v: unknown, n: number) => Array.isArray(v) && v.length === n && v.every((x) => Number.isFinite(x));
  if (!nums(d.origin, 2) || !nums(d.samples, 2) || !nums(d.extent, 4)) throw new Error('terrain index without its frame');
  if (!(Number(d.spacing) > 0) || !(Number(d.tile) > 0) || d.side !== d.tile! + 1 + 2 * (d.apron ?? -1)) throw new Error('terrain index with a bad tile size');
  if (!Array.isArray(d.levels) || !d.levels.length) throw new Error('terrain index without levels');
  d.levels.forEach((lv, l) => {
    if (!(lv.spacing > 0) || lv.cells !== lv.tiles * d.tile! || lv.index?.length !== lv.tiles * lv.tiles) throw new Error(`terrain level ${l} is not whole`);
    if (l > 0 && Math.abs(lv.spacing - d.levels![l - 1].spacing * 2) > 1e-6 * lv.spacing) throw new Error(`terrain level ${l} is not twice the one below`);
  });
  if (d.codec !== 'zlib' && d.codec !== 'raw') throw new Error(`terrain tiles in ${String(d.codec)}`);
  if (typeof d.bin !== 'string' || /[\\/]/.test(d.bin)) throw new Error('terrain index without its .bin');
  return {
    ...(d as TerrainIndex),
    classes: d.classes && Array.isArray(d.classes.colours) ? d.classes : { names: [], colours: [] },
    water: d.water && Number.isFinite(d.water.y) ? d.water : null,
    instances: d.instances && Array.isArray(d.instances.index) && Array.isArray(d.instances.models) ? d.instances : null,
  };
}

/** Reads byte ranges of the `.bin`. */
export interface TerrainReader {
  range(offset: number, length: number): Promise<ArrayBuffer>;
}

/** A `.bin` picked or dropped: its slices. */
export function blobReader(blob: Blob): TerrainReader {
  return { range: (o, n) => blob.slice(o, o + n).arrayBuffer() };
}

/**
 * A `.bin` behind a URL, by range requests. A server that ignores the range
 * (answers 200 with the whole file) is read once and sliced after.
 */
export function urlReader(url: string, fetcher: typeof fetch = (...a) => fetch(...a)): TerrainReader {
  let whole: Promise<ArrayBuffer> | null = null;
  return {
    async range(o, n) {
      if (whole) return (await whole).slice(o, o + n);
      const r = await fetcher(url, { headers: { Range: `bytes=${o}-${o + n - 1}` } });
      if (r.status === 206) return r.arrayBuffer();
      if (r.status !== 200) throw new Error(`terrain tiles: ${r.status}`);
      whole ??= r.arrayBuffer();
      return (await whole).slice(o, o + n);
    },
  };
}

/** A zlib stream's bytes (the browser's own inflater, off the page's thread). */
export async function inflate(data: ArrayBuffer): Promise<Uint8Array> {
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** One tile's samples: quantised heights and classes, `side` x `side`, rows running +z. */
export interface TerrainTileData {
  heights: Uint16Array;
  classes: Uint8Array;
  base: number;
  step: number;
}

/** A tile's raw (inflated) bytes as its arrays. */
export function decodeTile(raw: Uint8Array, side: number, base: number, step: number): TerrainTileData {
  const n = side * side;
  if (raw.byteLength < n * 3) throw new Error('terrain tile too short');
  const heights = new Uint16Array(n);
  const dv = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
  for (let i = 0; i < n; i++) heights[i] = dv.getUint16(i * 2, true);
  return { heights, classes: raw.slice(n * 2, n * 3), base, step };
}
