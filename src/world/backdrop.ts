import { msg, type Msg } from '../data/msg';
import { dataToWorld } from '../render/pose';
import type { LevelCredit } from '../render/level';
import type { AxisMapping, Bounds, GeoReference } from '../state/types';
import type { FetchMode } from './cache';
import { clipLine, clipRing, drapePolygon, extrudeBuilding, MeshBuilder, ribbon, area2, type BuiltMesh, type Project, type Rgb } from './mesh';
import { decodeTile, GEOM_LINE, GEOM_POLYGON, inflateIfGzip, polygonsOf, type MvtLayer } from './mvt';
import { parseRunways, runwaysIn, OURAIRPORTS_RUNWAYS } from './runways';
import { decodeTerrarium, TERRARIUM_URL, TILE_SIZE } from './terrarium';
import {
  boxCentre,
  dataOfEastNorth,
  frameSense,
  geoBoxOf,
  latToMy,
  lonToMx,
  mercatorToPlane,
  metresPerPixel,
  mxToLon,
  myToLat,
  pickZoom,
  tileRange,
  tilesOf,
  unionBox,
  type GeoBox,
  type TileRange,
} from './tiles';

/**
 * The world backdrop: the real place under a recording, or a part of a
 * game's real-world theatre, built from open data on demand - terrain from
 * elevation tiles, and buildings, roads, water and airfields from
 * OpenStreetMap vector tiles - as a level in the data's own metres.
 *
 * Two levels of detail. The detailed area (under the data, or a sub-area of a
 * theatre the user picked) gets fine terrain and every map layer. A theatre
 * round it gets coarse terrain, the sea and lakes and the main roads only,
 * with a hole where the detailed area is: the hole is snapped to the coarse
 * grid's lines and closed with a thin wall, so the two meet without overlap
 * or a crack.
 *
 * Sources, their terms and the credit the view must carry are in
 * docs/world-backdrop.md. In short: elevation from the AWS Terrain Tiles
 * (Terrarium PNG, no key), map features from OpenFreeMap's OpenMapTiles
 * vector tiles (no key; ODbL data, so nothing built here is ever shipped),
 * runways from OurAirports (public domain).
 */

/** The vector tiles' TileJSON: says the current build's tile URL. */
export const OPENFREEMAP_TILEJSON = 'https://tiles.openfreemap.org/planet';

/** Credits a backdrop carries, shown on the canvas while it is the level. */
export type WorldCredit = LevelCredit;

/** How deep and how wide one layer of the backdrop may go. */
interface Limits {
  terrainMaxZoom: number;
  /** Most elevation tiles (about 80 kB each). */
  terrainMaxTiles: number;
  /** Most terrain vertices; the grid is thinned to fit. */
  terrainMaxVertices: number;
  vectorMaxZoom: number;
  /** Below this the vector tiles hold little worth draping; the layer has terrain only. */
  vectorMinZoom: number;
  vectorMaxTiles: number;
  /** Map layers drawn: everything, or the sea, lakes and main roads only. */
  full: boolean;
}

/**
 * Under a recording: about 30 m terrain (zoom 12) in at most 36 tiles, and
 * vector tiles at zoom 14 (the only zoom with buildings) when the box needs
 * at most 300 of them, else at the deepest zoom that does, down to 8.
 */
const DATA_LIMITS: Limits = {
  terrainMaxZoom: 12,
  terrainMaxTiles: 36,
  terrainMaxVertices: 400_000,
  vectorMaxZoom: 14,
  vectorMinZoom: 8,
  vectorMaxTiles: 300,
  full: true,
};

/** A sub-area of a theatre, up to a few hundred kilometres: more tiles, the same zooms. */
const AREA_LIMITS: Limits = {
  terrainMaxZoom: 12,
  terrainMaxTiles: 100,
  terrainMaxVertices: 500_000,
  vectorMaxZoom: 14,
  vectorMinZoom: 8,
  vectorMaxTiles: 1500,
  full: true,
};

/** A whole theatre round the detailed area: coarse terrain, the sea, lakes and main roads. */
const CONTEXT_LIMITS: Limits = {
  terrainMaxZoom: 10,
  terrainMaxTiles: 64,
  terrainMaxVertices: 250_000,
  vectorMaxZoom: 9,
  vectorMinZoom: 4,
  vectorMaxTiles: 64,
  full: false,
};

/**
 * Vector tiles one build may download; past this it takes only tiles already
 * in the cache, and says so. OpenFreeMap's terms allow an app to download an
 * area for offline use if each download is at most 3,000 tiles or 50 MB, with
 * at most 4 requests in parallel: one build is one such download, well inside
 * both. A larger area comes in chunks, one per build, centre first, each
 * adding to the cache.
 */
export const DOWNLOAD_MAX_TILES = 1000;
export const DOWNLOAD_MAX_BYTES = 40 * 1024 * 1024;
/** Requests in flight at once, per source (OpenFreeMap's limit is 4). */
const PARALLEL = 4;
/** The whole backdrop's triangle budget, and the buildings' share of it. */
const MAX_TRIANGLES = 3_000_000;
const STRUCTURE_BUDGET = 1_500_000;

const COLOUR = {
  terrain: [0.74, 0.74, 0.71],
  major: [1, 0.98, 0.93],
  road: [0.95, 0.95, 0.93],
  minor: [0.88, 0.88, 0.86],
  track: [0.82, 0.79, 0.72],
  rail: [0.5, 0.5, 0.53],
  runway: [0.36, 0.37, 0.4],
  taxiway: [0.47, 0.48, 0.51],
  apron: [0.6, 0.61, 0.63],
  water: [0.55, 0.68, 0.8],
  building: [0.9, 0.9, 0.9],
  surveyed: [0.3, 0.31, 0.34],
  marking: [0.97, 0.97, 0.95],
} satisfies Record<string, Rgb>;

/**
 * What covers the ground, as the terrain's own colour: OpenMapTiles
 * `landcover` (natural cover) and `landuse` (what people made of it) classes.
 * Painted on the terrain's vertices rather than draped as shapes, so it costs
 * no triangles and reads from any height, at the terrain's resolution.
 */
const COVER: Record<string, Rgb> = {
  wood: [0.42, 0.55, 0.36],
  forest: [0.42, 0.55, 0.36],
  grass: [0.66, 0.74, 0.52],
  park: [0.62, 0.74, 0.52],
  farmland: [0.82, 0.8, 0.62],
  wetland: [0.58, 0.68, 0.62],
  sand: [0.87, 0.83, 0.67],
  beach: [0.87, 0.83, 0.67],
  rock: [0.64, 0.62, 0.6],
  ice: [0.94, 0.96, 0.98],
  glacier: [0.94, 0.96, 0.98],
  residential: [0.8, 0.74, 0.72],
  suburb: [0.8, 0.74, 0.72],
  neighbourhood: [0.8, 0.74, 0.72],
  industrial: [0.74, 0.7, 0.76],
  commercial: [0.76, 0.71, 0.75],
  retail: [0.76, 0.71, 0.75],
  railway: [0.72, 0.7, 0.72],
  quarry: [0.7, 0.68, 0.66],
  military: [0.74, 0.66, 0.62],
  cemetery: [0.6, 0.7, 0.56],
  pitch: [0.62, 0.76, 0.54],
  stadium: [0.62, 0.76, 0.54],
  playground: [0.62, 0.76, 0.54],
};

/**
 * The bare ground's colour by height, before anything covers it: a quiet
 * hypsometric tint, lowland grey-green to upland brown to snow, so relief
 * reads from altitude even where the map has no cover.
 */
function groundColour(h: number): Rgb {
  // Below sea level is not water by itself (the Caspian lowland is -28 m):
  // the sea comes from the map's water, painted over this.
  const stops: Array<[number, Rgb]> = [
    [0, [0.72, 0.74, 0.64]],
    [600, [0.7, 0.7, 0.6]],
    [1600, [0.66, 0.62, 0.55]],
    [2800, [0.7, 0.68, 0.66]],
    [3600, [0.93, 0.94, 0.95]],
  ];
  if (h <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (h <= stops[i][0]) {
      const [h0, a] = stops[i - 1];
      const [h1, b] = stops[i];
      const f = (h - h0) / (h1 - h0);
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
    }
  }
  return stops[stops.length - 1][1];
}

/** A name on the map: a town, an airfield. World coordinates, like the mesh. */
export interface WorldLabel {
  text: string;
  kind: 'city' | 'town' | 'village' | 'airfield';
  x: number;
  y: number;
  z: number;
}

/** Where the sea floor is drawn, metres: just under the water's flat surface. */
const SEA_FLOOR = -15;

/** The OpenMapTiles `place` classes kept, and what they are called here. */
const PLACE_KIND: Record<string, WorldLabel['kind']> = {
  city: 'city',
  town: 'town',
  village: 'village',
};

/** Road widths in metres by OpenMapTiles `transportation` class; classes not listed are left out. */
const ROAD_WIDTH: Record<string, { width: number; colour: Rgb; rank: number }> = {
  motorway: { width: 16, colour: COLOUR.major, rank: 0 },
  trunk: { width: 14, colour: COLOUR.major, rank: 0 },
  primary: { width: 11, colour: COLOUR.road, rank: 1 },
  secondary: { width: 9, colour: COLOUR.road, rank: 1 },
  tertiary: { width: 8, colour: COLOUR.road, rank: 2 },
  raceway: { width: 10, colour: COLOUR.road, rank: 2 },
  busway: { width: 6, colour: COLOUR.minor, rank: 3 },
  minor: { width: 6, colour: COLOUR.minor, rank: 3 },
  service: { width: 4, colour: COLOUR.minor, rank: 4 },
  track: { width: 3, colour: COLOUR.track, rank: 4 },
  rail: { width: 3, colour: COLOUR.rail, rank: 2 },
};

export interface BackdropRequest {
  /** The plane the backdrop is built on: the data's, or a theatre's. */
  geo: GeoReference;
  /** The dataset's world bounds: the detailed area is the earth under them. */
  bounds?: Bounds;
  /** The load's axis mapping, which the backdrop goes through like the data did. */
  axes: AxisMapping | null;
  /** Metres added round the data on every side; by default a quarter of its extent, 2 to 30 km. */
  margin?: number;
  /** The detailed area as a box on the earth, instead of the data's. */
  box?: GeoBox;
  /** A larger box built coarsely round the detailed area: a whole theatre. */
  context?: GeoBox;
  /** Runways from OurAirports in the detailed area, ends and widths as surveyed. */
  runways?: boolean;
}

/** How the builder reaches the outside world: swapped in tests. */
export interface BackdropIo {
  /** A URL's bytes, null when the server has no such tile (or, cache-only, when the cache has none). */
  fetch(url: string, mode?: FetchMode): Promise<{ bytes: ArrayBuffer | null; cached: boolean; missing?: boolean }>;
  /** A PNG's RGBA pixels. */
  decodePng(bytes: ArrayBuffer): Promise<{ width: number; height: number; rgba: Uint8ClampedArray }>;
  progress(label: Msg, fraction: number | null): void;
}

export interface BackdropStats {
  /** The detailed area, or the theatre when it has none. */
  box: GeoBox;
  terrainZoom: number;
  terrainTiles: number;
  /** Metres between terrain vertices in the detailed area, roughly. */
  terrainSpacing: number;
  vectorZoom: number | null;
  vectorTiles: number;
  /** The coarse theatre round it, when one was asked for. */
  context: { box: GeoBox; terrainZoom: number; terrainSpacing: number; vectorZoom: number | null } | null;
  downloaded: number;
  fromCache: number;
  /** Vector tiles left out because this build's download allowance was spent. */
  deferred: number;
  bytes: number;
  buildings: number;
  buildingsDropped: number;
  roads: number;
  runways: number;
}

export interface BackdropResult {
  mesh: BuiltMesh;
  /** Towns and airfields by name, for the view to write over the ground. */
  labels: WorldLabel[];
  credits: WorldCredit[];
  stats: BackdropStats;
  /** What went less than fully, said on the main thread. */
  notes: Msg[];
}

/** Runs `fn` over `items` with at most `limit` at once. */
async function eachLimited<T>(items: T[], limit: number, fn: (item: T, i: number) => Promise<void>): Promise<void> {
  let next = 0;
  const run = async () => {
    while (next < items.length) {
      const i = next++;
      await fn(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
}

const fill = (template: string, z: number, x: number, y: number) =>
  template.replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y));

/**
 * Heights over a box on a regular grid of terrain pixels, and the height
 * anywhere on it the way the mesh will show it: each cell is two triangles
 * split along the same diagonal as the mesh, so a road draped at these heights
 * lies on the terrain rather than through it.
 */
export class TerrainGrid {
  constructor(
    readonly x0: number,
    readonly y0: number,
    readonly cols: number,
    readonly rows: number,
    readonly dx: number,
    readonly dy: number,
    readonly h: Float32Array,
  ) {}

  /** The height at a terrain pixel, clamped to the grid. */
  at(px: number, py: number): number {
    let gx = (px - this.x0) / this.dx;
    let gy = (py - this.y0) / this.dy;
    gx = Math.max(0, Math.min(this.cols - 1.000001, gx));
    gy = Math.max(0, Math.min(this.rows - 1.000001, gy));
    const i = Math.floor(gx);
    const j = Math.floor(gy);
    const u = gx - i;
    const v = gy - j;
    const c = this.cols;
    const h00 = this.h[j * c + i];
    const h10 = this.h[j * c + i + 1];
    const h01 = this.h[(j + 1) * c + i];
    const h11 = this.h[(j + 1) * c + i + 1];
    // Diagonal from (0,0) to (1,1): triangles (00, 10, 11) and (00, 11, 01).
    return u >= v ? h00 + u * (h10 - h00) + v * (h11 - h10) : h00 + v * (h01 - h00) + u * (h11 - h01);
  }
}

/** A mosaic of decoded elevation tiles, read bilinearly at pixel centres. */
class Mosaic {
  readonly w: number;
  readonly hgt: number;
  readonly data: Float32Array;
  constructor(readonly range: TileRange) {
    this.w = (range.x1 - range.x0 + 1) * TILE_SIZE;
    this.hgt = (range.y1 - range.y0 + 1) * TILE_SIZE;
    this.data = new Float32Array(this.w * this.hgt);
  }
  put(tx: number, ty: number, heights: Float32Array): void {
    const ox = (tx - this.range.x0) * TILE_SIZE;
    const oy = (ty - this.range.y0) * TILE_SIZE;
    for (let r = 0; r < TILE_SIZE; r++) this.data.set(heights.subarray(r * TILE_SIZE, (r + 1) * TILE_SIZE), (oy + r) * this.w + ox);
  }
  /** Height at a global pixel position of the mosaic's zoom. */
  sample(px: number, py: number): number {
    const x = Math.max(0, Math.min(this.w - 1, px - this.range.x0 * TILE_SIZE - 0.5));
    const y = Math.max(0, Math.min(this.hgt - 1, py - this.range.y0 * TILE_SIZE - 0.5));
    const i = Math.min(this.w - 2, Math.floor(x));
    const j = Math.min(this.hgt - 2, Math.floor(y));
    const u = x - i;
    const v = y - j;
    const d = this.data;
    const w = this.w;
    const a = d[j * w + i];
    const b = d[j * w + i + 1];
    const c = d[(j + 1) * w + i];
    const e = d[(j + 1) * w + i + 1];
    return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + e * u * v;
  }
}

/** Grid spacing (in pixels) and size for a box, under a vertex cap. */
export function gridFor(width: number, height: number, maxVertices: number): { cols: number; rows: number; dx: number; dy: number } {
  let step = 1;
  while ((Math.ceil(width / step) + 1) * (Math.ceil(height / step) + 1) > maxVertices) step *= 1.25;
  const cols = Math.max(2, Math.ceil(width / step) + 1);
  const rows = Math.max(2, Math.ceil(height / step) + 1);
  return { cols, rows, dx: width / (cols - 1), dy: height / (rows - 1) };
}

/** A rectangle in a layer's terrain pixels: x0, y0, x1, y1. */
type Rect = [number, number, number, number];

/**
 * One level of detail: a box, its terrain zoom and grid, and the rectangles
 * its map features are clipped to (the whole box, or for the coarse theatre
 * the four strips round the detailed area's hole).
 */
interface Layer {
  limits: Limits;
  /** The box in normalised Web Mercator. */
  mx0: number;
  my0: number;
  mx1: number;
  my1: number;
  z: number;
  /** Terrain pixels across the world at this zoom. */
  S: number;
  grid: TerrainGrid;
  mpp: number;
  cellMetres: number;
  /** Ground metres across the box's diagonal. */
  diag: number;
  project: Project;
  regions: Rect[];
  /** Grid cells left out for the detailed area: columns i0..i1-1, rows j0..j1-1. */
  hole: { i0: number; i1: number; j0: number; j1: number } | null;
  /** Grid vertices under the open sea, by the map: cells wholly at sea get no ground triangles. */
  sea: Uint8Array | null;
}

const boxOfMercator = (mx0: number, my0: number, mx1: number, my1: number): GeoBox => ({
  west: mxToLon(mx0),
  east: mxToLon(mx1),
  north: myToLat(my0),
  south: myToLat(my1),
});

/** One building waiting for the budget: rings in terrain pixels, heights in metres. */
interface Building {
  rings: Array<{ ring: number[]; cut: Uint8Array }>;
  area: number;
  height: number;
  minHeight: number;
}

/** What a layer's map tiles gave, in its terrain pixels, before any of it is drawn. */
interface Features {
  water: Array<{ outer: number[]; holes: number[][]; flat: number | null }>;
  roads: Array<{ line: number[]; half: number; colour: Rgb }>;
  rails: Array<{ line: number[]; half: number; colour: Rgb }>;
  airPolys: Array<{ outer: number[]; holes: number[][]; colour: Rgb }>;
  airLines: Array<{ line: number[]; half: number; colour: Rgb }>;
  buildings: Building[];
  minBuilding: number;
  /** Ground cover polygons, painted onto the terrain: landcover first, landuse over it, water last. */
  cover: Array<{ rings: number[][]; colour: Rgb; rank: number; sea?: boolean }>;
  /** Named points, in terrain pixels. */
  places: Array<{ text: string; kind: WorldLabel['kind']; x: number; y: number }>;
}

export async function buildBackdrop(req: BackdropRequest, io: BackdropIo): Promise<BackdropResult> {
  const { geo } = req;
  const notes: Msg[] = [];
  let detailBox: GeoBox | null = req.box ?? null;
  let detailLimits = AREA_LIMITS;
  if (!detailBox && req.bounds) {
    const b = req.bounds;
    const extent = Math.max(b.maxX - b.minX, b.maxZ - b.minZ, b.maxY - b.minY, 1);
    const margin = req.margin ?? Math.max(2000, Math.min(30000, extent * 0.25));
    detailBox = geoBoxOf(geo, b, req.axes, margin);
    detailLimits = DATA_LIMITS;
  }
  const contextBox = req.context ? (detailBox ? unionBox(req.context, detailBox) : req.context) : null;
  if (!detailBox && !contextBox) throw new Error('a world backdrop needs an area');

  const stats: BackdropStats = {
    box: detailBox ?? contextBox!,
    terrainZoom: 0,
    terrainTiles: 0,
    terrainSpacing: 0,
    vectorZoom: null,
    vectorTiles: 0,
    context: null,
    downloaded: 0,
    fromCache: 0,
    deferred: 0,
    bytes: 0,
    buildings: 0,
    buildingsDropped: 0,
    roads: 0,
    runways: 0,
  };
  const count = (f: { bytes: ArrayBuffer | null; cached: boolean; missing?: boolean }) => {
    if (f.missing) return;
    if (f.cached) stats.fromCache++;
    else stats.downloaded++;
    stats.bytes += f.bytes?.byteLength ?? 0;
  };

  // ---- terrain: the coarse theatre first, then the detailed area in its hole
  const terrainSteps = (contextBox ? 1 : 0) + (detailBox ? 1 : 0);
  let terrainStep = 0;
  let gotAny = false;
  const terrainOf = async (box: GeoBox, lim: Limits) => {
    const z = pickZoom(box, lim.terrainMaxZoom, lim.terrainMaxTiles, 1);
    const range = tileRange(box, z);
    const mosaic = new Mosaic(range);
    const tiles = tilesOf(range);
    const base = (terrainStep / terrainSteps) * 0.4;
    const span = 0.4 / terrainSteps;
    terrainStep++;
    let done = 0;
    io.progress(msg('heat.world.progress.terrain', { done: { int: 0 }, total: { int: tiles.length } }), base);
    await eachLimited(tiles, PARALLEL, async (t) => {
      const f = await io.fetch(fill(TERRARIUM_URL, t.z, t.x, t.y));
      count(f);
      if (f.bytes) {
        const img = await io.decodePng(f.bytes);
        if (img.width === TILE_SIZE && img.height === TILE_SIZE) {
          mosaic.put(t.x, t.y, decodeTerrarium(img.rgba));
          gotAny = true;
        }
      }
      done++;
      io.progress(msg('heat.world.progress.terrain', { done: { int: done }, total: { int: tiles.length } }), base + (done / tiles.length) * span);
    });
    return { z, tiles: tiles.length, mosaic };
  };

  const toPlane = mercatorToPlane(geo);
  const layerOf = (lim: Limits, z: number, mosaic: Mosaic, mx0: number, my0: number, mx1: number, my1: number, grid?: ReturnType<typeof gridFor>): Layer => {
    const S = TILE_SIZE * 2 ** z;
    const px0 = mx0 * S;
    const py0 = my0 * S;
    const g = grid ?? gridFor((mx1 - mx0) * S, (my1 - my0) * S, lim.terrainMaxVertices);
    const heights = new Float32Array(g.cols * g.rows);
    for (let j = 0; j < g.rows; j++) for (let i = 0; i < g.cols; i++) heights[j * g.cols + i] = mosaic.sample(px0 + i * g.dx, py0 + j * g.dy);
    const centreLat = myToLat((my0 + my1) / 2);
    const mpp = metresPerPixel(centreLat, z);
    return {
      limits: lim,
      mx0,
      my0,
      mx1,
      my1,
      z,
      S,
      grid: new TerrainGrid(px0, py0, g.cols, g.rows, g.dx, g.dy, heights),
      mpp,
      cellMetres: Math.max(g.dx, g.dy) * mpp,
      diag: Math.hypot((mx1 - mx0) * S * mpp, (my1 - my0) * S * mpp),
      project: (px, py) => toPlane(px / S, py / S),
      regions: [[px0, py0, mx1 * S, my1 * S]],
      hole: null,
      sea: null,
    };
  };

  let context: Layer | null = null;
  let detail: Layer | null = null;
  if (contextBox) {
    const t = await terrainOf(contextBox, CONTEXT_LIMITS);
    context = layerOf(CONTEXT_LIMITS, t.z, t.mosaic, lonToMx(contextBox.west), latToMy(contextBox.north), lonToMx(contextBox.east), latToMy(contextBox.south));
    if (detailBox) {
      // The detailed area's hole, widened to whole coarse cells so the two
      // grids share their edge lines.
      const g = context.grid;
      const S = context.S;
      const ci = (mx: number) => (mx * S - g.x0) / g.dx;
      const cj = (my: number) => (my * S - g.y0) / g.dy;
      let i0 = Math.max(0, Math.floor(ci(lonToMx(detailBox.west)) + 1e-9));
      let i1 = Math.min(g.cols - 1, Math.ceil(ci(lonToMx(detailBox.east)) - 1e-9));
      let j0 = Math.max(0, Math.floor(cj(latToMy(detailBox.north)) + 1e-9));
      let j1 = Math.min(g.rows - 1, Math.ceil(cj(latToMy(detailBox.south)) - 1e-9));
      // At least one cell, however small the detailed area.
      if (i1 <= i0) {
        i1 = Math.min(g.cols - 1, i0 + 1);
        i0 = i1 - 1;
      }
      if (j1 <= j0) {
        j1 = Math.min(g.rows - 1, j0 + 1);
        j0 = j1 - 1;
      }
      context.hole = { i0, i1, j0, j1 };
      const hx0 = g.x0 + i0 * g.dx;
      const hx1 = g.x0 + i1 * g.dx;
      const hy0 = g.y0 + j0 * g.dy;
      const hy1 = g.y0 + j1 * g.dy;
      const [cx0, cy0, cx1, cy1] = context.regions[0];
      context.regions = (
        [
          [cx0, cy0, cx1, hy0],
          [cx0, hy1, cx1, cy1],
          [cx0, hy0, hx0, hy1],
          [hx1, hy0, cx1, hy1],
        ] as Rect[]
      ).filter((r) => r[2] - r[0] > 1e-9 && r[3] - r[1] > 1e-9);
      detailBox = boxOfMercator(hx0 / S, hy0 / S, hx1 / S, hy1 / S);
      stats.box = detailBox;
    }
  }
  if (detailBox) {
    const t = await terrainOf(detailBox, detailLimits);
    stats.terrainZoom = t.z;
    stats.terrainTiles = t.tiles;
    // In the mercator of the hole itself, not through degrees, so the edges meet exactly.
    const mx0 = context?.hole ? (context.grid.x0 + context.hole.i0 * context.grid.dx) / context.S : lonToMx(detailBox.west);
    const mx1 = context?.hole ? (context.grid.x0 + context.hole.i1 * context.grid.dx) / context.S : lonToMx(detailBox.east);
    const my0 = context?.hole ? (context.grid.y0 + context.hole.j0 * context.grid.dy) / context.S : latToMy(detailBox.north);
    const my1 = context?.hole ? (context.grid.y0 + context.hole.j1 * context.grid.dy) / context.S : latToMy(detailBox.south);
    detail = layerOf(detailLimits, t.z, t.mosaic, mx0, my0, mx1, my1);
    stats.terrainSpacing = detail.cellMetres;
  }
  if (context) stats.context = { box: contextBox!, terrainZoom: context.z, terrainSpacing: context.cellMetres, vectorZoom: null };
  if (!detail && context) {
    stats.terrainZoom = context.z;
    stats.terrainSpacing = context.cellMetres;
  }
  if (!gotAny) notes.push(msg('heat.world.note.noTerrain'));

  // ---- the terrain mesh: every grid vertex first (they are the relief band), then the triangles
  io.progress(msg('heat.world.progress.mesh'), 0.42);
  const mb = new MeshBuilder(context?.project ?? detail!.project);
  mb.begin('ground', 'terrain');
  const gridVertices = (layer: Layer) => {
    const g = layer.grid;
    mb.project = layer.project;
    const first = mb.vertexCount;
    for (let j = 0; j < g.rows; j++) {
      for (let i = 0; i < g.cols; i++) {
        const h = g.h[j * g.cols + i];
        mb.vertexAt(g.x0 + i * g.dx, g.y0 + j * g.dy, h, groundColour(h));
      }
    }
    return first;
  };
  const gridTriangles = (layer: Layer, first: number) => {
    const g = layer.grid;
    const hole = layer.hole;
    const sea = layer.sea;
    for (let j = 0; j + 1 < g.rows; j++) {
      for (let i = 0; i + 1 < g.cols; i++) {
        if (hole && i >= hole.i0 && i < hole.i1 && j >= hole.j0 && j < hole.j1) continue;
        const k = j * g.cols + i;
        // Open sea: the water surface alone. A floor under it would fight the
        // surface for depth far off (a few metres apart, hundreds of
        // kilometres away) and draw as stripes.
        if (sea && sea[k] && sea[k + 1] && sea[k + g.cols] && sea[k + g.cols + 1]) continue;
        const a = first + k;
        mb.tri('ground', a, a + 1, a + g.cols + 1);
        mb.tri('ground', a, a + g.cols + 1, a + g.cols);
      }
    }
  };
  const firstContext = context ? gridVertices(context) : 0;
  const firstDetail = detail ? gridVertices(detail) : 0;
  mb.terrainVertices = mb.vertexCount;
  const credits: WorldCredit[] = ['terrarium'];

  // ---- map features
  let template: string | null | undefined;
  const tileTemplate = async (): Promise<string | null> => {
    if (template !== undefined) return template;
    try {
      const f = await io.fetch(OPENFREEMAP_TILEJSON, 'network-first');
      template = f.bytes ? ((JSON.parse(new TextDecoder().decode(f.bytes)) as { tiles?: string[] }).tiles?.[0] ?? null) : null;
    } catch {
      template = null;
    }
    if (!template) notes.push(msg('heat.world.note.noMap'));
    return template;
  };
  // This build's download allowance, shared by both layers.
  let netTiles = 0;
  let netBytes = 0;
  const vectorLayers: Array<{ layer: Layer; tiles: Array<{ x: number; y: number; z: number; layers: Map<string, MvtLayer> }> }> = [];
  const order = [context, detail].filter((l): l is Layer => !!l);
  const vectorBox = (l: Layer): GeoBox => boxOfMercator(l.mx0, l.my0, l.mx1, l.my1);
  let mapStep = 0;
  for (const layer of order) {
    const box = vectorBox(layer);
    const lim = layer.limits;
    const zV = pickZoom(box, lim.vectorMaxZoom, lim.vectorMaxTiles, lim.vectorMinZoom - 1);
    const base = 0.45 + (mapStep / order.length) * 0.4;
    const span = 0.4 / order.length;
    mapStep++;
    if (zV < lim.vectorMinZoom) {
      if (lim.full) notes.push(msg('heat.world.note.tooLargeForMap'));
      continue;
    }
    const tpl = await tileTemplate();
    if (!tpl) break;
    const range = tileRange(box, zV);
    // Centre first, so a build that runs out of allowance fills the middle.
    const cx = (range.x0 + range.x1) / 2;
    const cy = (range.y0 + range.y1) / 2;
    const vt = tilesOf(range).sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy));
    if (layer === detail) {
      stats.vectorZoom = zV;
      stats.vectorTiles = vt.length;
    } else if (stats.context) stats.context.vectorZoom = zV;
    const got: Array<{ x: number; y: number; z: number; layers: Map<string, MvtLayer> }> = [];
    let vdone = 0;
    let failed = 0;
    await eachLimited(vt, PARALLEL, async (t) => {
      try {
        const spent = netTiles >= DOWNLOAD_MAX_TILES || netBytes >= DOWNLOAD_MAX_BYTES;
        const f = await io.fetch(fill(tpl, t.z, t.x, t.y), spent ? 'cache-only' : 'cache-first');
        count(f);
        if (f.missing) stats.deferred++;
        else if (!f.cached) {
          netTiles++;
          netBytes += f.bytes?.byteLength ?? 0;
        }
        if (f.bytes) got.push({ ...t, layers: decodeTile(await inflateIfGzip(new Uint8Array(f.bytes))) });
      } catch {
        failed++;
      }
      vdone++;
      io.progress(msg('heat.world.progress.map', { done: { int: vdone }, total: { int: vt.length } }), base + (vdone / vt.length) * span);
    });
    if (failed) notes.push(msg('heat.world.note.mapTilesFailed', { failed: { int: failed }, total: { int: vt.length } }));
    if (got.length) vectorLayers.push({ layer, tiles: got });
  }
  if (stats.deferred) notes.push(msg('heat.world.note.deferred', { count: { int: stats.deferred }, max: { int: DOWNLOAD_MAX_TILES } }));
  if (vectorLayers.length) credits.unshift('openfreemap');

  io.progress(msg('heat.world.progress.mesh'), 0.88);
  const collected = vectorLayers.map(({ layer, tiles }) => ({ layer, f: collect(layer, tiles, stats) }));

  // ---- what covers the ground, painted onto the terrain grids
  for (const { layer, f } of collected) {
    const first = layer === context ? firstContext : firstDetail;
    const g = layer.grid;
    f.cover.sort((a, b) => a.rank - b.rank);
    for (const c of f.cover) {
      fillRings(g, c.rings, (i, j) => {
        const k = j * g.cols + i;
        mb.setColour(first + k, c.colour);
        // The sea floor flattened just under the surface: the depths say
        // nothing from above, and their contour lines would show through
        // the water as stripes.
        if (c.sea) {
          layer.sea ??= new Uint8Array(g.cols * g.rows);
          layer.sea[k] = 1;
          if (g.h[k] < 0) {
            g.h[k] = SEA_FLOOR;
            mb.setHeight(first + k, SEA_FLOOR);
          }
        }
      });
    }
  }
  // The ground's triangles, now the sea is known.
  mb.begin('ground', 'terrain');
  if (context) gridTriangles(context, firstContext);
  if (detail) gridTriangles(detail, firstDetail);

  if (context && detail) {
    // A wall along the hole's edge (once the sea floor is flattened), from the
    // detailed ground up or down to the coarse ground there: the two grids
    // sample the heights differently, and without it the seam would show the
    // sky through a crack. Both faces, as either side may be the one in view.
    const g = detail.grid;
    const k = context.S / detail.S;
    mb.project = detail.project;
    const edges: Array<[number, number]> = [];
    for (let i = 0; i < g.cols; i++) edges.push([i, 0]);
    for (let j = 1; j < g.rows; j++) edges.push([g.cols - 1, j]);
    for (let i = g.cols - 2; i >= 0; i--) edges.push([i, g.rows - 1]);
    for (let j = g.rows - 2; j >= 0; j--) edges.push([0, j]);
    let prev: [number, number] | null = null;
    for (const [i, j] of [...edges, edges[0]]) {
      const px = g.x0 + i * g.dx;
      const py = g.y0 + j * g.dy;
      const top = mb.vertexAt(px, py, g.h[j * g.cols + i], COLOUR.terrain);
      const bottom = mb.vertexAt(px, py, context.grid.at(px * k, py * k), COLOUR.terrain);
      if (prev) {
        mb.tri('ground', prev[0], top, bottom);
        mb.tri('ground', prev[0], bottom, prev[1]);
        mb.tri('ground', prev[0], bottom, top);
        mb.tri('ground', prev[0], prev[1], bottom);
      }
      prev = [top, bottom];
    }
  }

  // ---- names: towns from the map's places, airfields from its aerodrome labels
  const labels: WorldLabel[] = [];
  const toWorld = (e: number, n: number, h: number) => dataToWorld(dataOfEastNorth(geo, e, n, h), req.axes);
  for (const { layer, f } of collected) {
    for (const p of f.places) {
      // One label per name: the detailed layer and the theatre can both carry a town.
      const [e, n] = layer.project(p.x, p.y);
      if (labels.some((l) => l.text === p.text && l.kind === p.kind)) continue;
      const w = toWorld(e, n, layer.grid.at(p.x, p.y) + 30);
      labels.push({ text: p.text, kind: p.kind, x: w.x, y: w.y, z: w.z });
    }
  }

  // Water first, lowest; then roads, rails and airfields, each a little higher
  // than the last, so where they cross the later one shows.
  const lift = (l: Layer) => Math.max(0.5, l.cellMetres * 0.04);
  const step = (l: Layer) => Math.min(l.grid.dx, l.grid.dy);
  mb.begin('water', 'water');
  for (const { layer, f } of collected) {
    mb.project = layer.project;
    const at = (x: number, y: number) => layer.grid.at(x, y);
    // The sea and lakes are flat; a coarse grid's lift would float them over the shore.
    const flatLift = Math.min(lift(layer) * 0.6, 2);
    for (const wpoly of f.water) {
      let flat = wpoly.flat;
      if (flat === -Infinity) {
        // A lake lies at its lowest shore.
        flat = Infinity;
        for (let i = 0; i < wpoly.outer.length; i += 2) flat = Math.min(flat, at(wpoly.outer[i], wpoly.outer[i + 1]));
      }
      const level = flat;
      if (level !== null) drapePolygon(mb, 'water', wpoly.outer, wpoly.holes, Infinity, () => level + flatLift, COLOUR.water);
      else drapePolygon(mb, 'water', wpoly.outer, wpoly.holes, step(layer), (x, y) => at(x, y) + lift(layer) * 0.6, COLOUR.water);
    }
  }
  mb.begin('ground', 'transportation');
  for (const { layer, f } of collected) {
    mb.project = layer.project;
    const at = (x: number, y: number) => layer.grid.at(x, y);
    for (const r of f.roads) {
      if (mb.totalTriangles > MAX_TRIANGLES - STRUCTURE_BUDGET) break;
      ribbon(mb, 'ground', r.line, r.half, step(layer), at, lift(layer), r.colour);
      stats.roads++;
    }
  }
  mb.begin('ground', 'railway');
  for (const { layer, f } of collected) {
    mb.project = layer.project;
    const at = (x: number, y: number) => layer.grid.at(x, y);
    for (const r of f.rails) {
      if (mb.totalTriangles > MAX_TRIANGLES - STRUCTURE_BUDGET) break;
      ribbon(mb, 'ground', r.line, r.half, step(layer), at, lift(layer) * 1.1, r.colour);
    }
  }
  mb.begin('ground', 'aeroway');
  for (const { layer, f } of collected) {
    mb.project = layer.project;
    const at = (x: number, y: number) => layer.grid.at(x, y);
    for (const p of f.airPolys) drapePolygon(mb, 'ground', p.outer, p.holes, step(layer), (x, y) => at(x, y) + lift(layer) * 1.3, p.colour);
    for (const r of f.airLines) ribbon(mb, 'ground', r.line, r.half, step(layer), at, lift(layer) * 1.6, r.colour);
  }

  // ---- runways as surveyed, over whatever the map drew for them
  if (req.runways && detail) {
    try {
      io.progress(msg('heat.world.progress.runways'), 0.9);
      const f = await io.fetch(OURAIRPORTS_RUNWAYS);
      count(f);
      if (f.bytes) {
        const layer = detail;
        mb.project = layer.project;
        mb.begin('ground', 'runway');
        const at = (x: number, y: number) => layer.grid.at(x, y);
        const S = layer.S;
        const [x0, y0, x1, y1] = layer.regions[0];
        for (const r of runwaysIn(parseRunways(new TextDecoder().decode(f.bytes)), vectorBox(layer))) {
          const line = [lonToMx(r.le[1]) * S, latToMy(r.le[0]) * S, lonToMx(r.he[1]) * S, latToMy(r.he[0]) * S];
          const half = (Math.max(r.width, layer.diag / 5000) / 2) / layer.mpp;
          for (const part of clipLine(line, x0, y0, x1, y1)) ribbon(mb, 'ground', part, half, step(layer), at, lift(layer) * 2, COLOUR.surveyed);
          // Markings: the side stripes, a dashed centre line and the threshold bars.
          const len = Math.hypot(line[2] - line[0], line[3] - line[1]);
          if (len > 0) {
            const ux = (line[2] - line[0]) / len;
            const uy = (line[3] - line[1]) / len;
            const stripe = Math.max(1, (layer.diag / 20000)) / layer.mpp / 2;
            const mLift = lift(layer) * 2.3;
            const mark = (pts: number[], hw: number) => {
              for (const part of clipLine(pts, x0, y0, x1, y1)) ribbon(mb, 'ground', part, hw, step(layer), at, mLift, COLOUR.marking);
            };
            for (const side of [-1, 1]) {
              const ox = -uy * (half - stripe) * side;
              const oy = ux * (half - stripe) * side;
              mark([line[0] + ox, line[1] + oy, line[2] + ox, line[3] + oy], stripe);
            }
            const dash = 30 / layer.mpp;
            for (let d = dash * 2; d + dash < len - dash * 2; d += dash * 2) {
              mark([line[0] + ux * d, line[1] + uy * d, line[0] + ux * (d + dash), line[1] + uy * (d + dash)], stripe * 0.6);
            }
            const bar = 6 / layer.mpp;
            for (const end of [0, 1]) {
              const bx = end ? line[2] - ux * bar * 2 : line[0] + ux * bar;
              const by = end ? line[3] - uy * bar * 2 : line[1] + uy * bar;
              mark([bx - uy * (half - stripe * 3), by + ux * (half - stripe * 3), bx + uy * (half - stripe * 3), by - ux * (half - stripe * 3)], bar / 2);
            }
          }
          stats.runways++;
        }
        if (stats.runways) credits.push('ourairports');
      }
    } catch {
      notes.push(msg('heat.world.note.noRunways'));
    }
  }

  // Buildings, largest first, while the budget lasts.
  mb.begin('structure', 'building');
  let minBuilding = 0;
  for (const { layer, f } of collected) {
    mb.project = layer.project;
    const at = (x: number, y: number) => layer.grid.at(x, y);
    minBuilding = Math.max(minBuilding, f.minBuilding);
    f.buildings.sort((a, b) => b.area - a.area);
    for (const bd of f.buildings) {
      if (mb.triangles('structure') > STRUCTURE_BUDGET || mb.totalTriangles > MAX_TRIANGLES) {
        stats.buildingsDropped++;
        continue;
      }
      let base = Infinity;
      const outer = bd.rings[0].ring;
      for (let i = 0; i < outer.length; i += 2) base = Math.min(base, at(outer[i], outer[i + 1]));
      extrudeBuilding(mb, bd.rings, base, bd.minHeight, bd.height, COLOUR.building);
      stats.buildings++;
    }
  }
  if (stats.buildingsDropped > 0) notes.push(msg('heat.world.note.buildingsDropped', { count: { int: stats.buildingsDropped }, min: { int: minBuilding } }));

  io.progress(msg('heat.world.progress.finish'), 0.95);
  return { labels, mesh: mb.finish(req.axes, { toData: (e, n, h) => dataOfEastNorth(geo, e, n, h), sense: frameSense(geo) }), credits, stats, notes };
}

/** A layer's map features from its decoded tiles, clipped to its regions, in its terrain pixels. */
function collect(layer: Layer, tiles: Array<{ x: number; y: number; z: number; layers: Map<string, MvtLayer> }>, stats: BackdropStats): Features {
  const S = layer.S;
  const mpp = layer.mpp;
  const metresToPx = 1 / mpp;
  const diag = layer.diag;
  const full = layer.limits.full;
  // Thin at a distance: a road narrower than this would vanish between pixels.
  const minRoad = diag / 5000;
  const maxRank = !full ? 0 : diag > 150_000 ? 1 : diag > 60_000 ? 2 : 4;
  const minBuilding = diag > 80_000 ? 150 : diag > 30_000 ? 60 : 20;
  const out: Features = { water: [], roads: [], rails: [], airPolys: [], airLines: [], buildings: [], minBuilding, cover: [], places: [] };

  for (const tile of tiles) {
    const n = 2 ** tile.z;
    const tx0 = (tile.x / n) * S;
    const ty0 = (tile.y / n) * S;
    const span = S / n;
    for (const [rx0, ry0, rx1, ry1] of layer.regions) {
      // The tile in terrain pixels, clipped to this region.
      const cx0 = Math.max(tx0, rx0);
      const cy0 = Math.max(ty0, ry0);
      const cx1 = Math.min(tx0 + span, rx1);
      const cy1 = Math.min(ty0 + span, ry1);
      if (cx0 >= cx1 || cy0 >= cy1) continue;
      const toPx = (l: MvtLayer, part: number[]) => {
        const k = span / l.extent;
        const o = new Array<number>(part.length);
        for (let i = 0; i < part.length; i += 2) {
          o[i] = tx0 + part[i] * k;
          o[i + 1] = ty0 + part[i + 1] * k;
        }
        return o;
      };
      const polys = (l: MvtLayer, parts: number[][]) =>
        polygonsOf(parts)
          .map(({ outer, holes }) => {
            const o = clipRing(toPx(l, outer), cx0, cy0, cx1, cy1);
            const hs = holes.map((h) => clipRing(toPx(l, h), cx0, cy0, cx1, cy1)).filter((h) => h.ring.length >= 6);
            return { outer: o, holes: hs };
          })
          .filter((p) => p.outer.ring.length >= 6 && area2(p.outer.ring) > 0);
      const lines = (l: MvtLayer, parts: number[][]) => parts.flatMap((p) => clipLine(toPx(l, p), cx0, cy0, cx1, cy1));

      const w = tile.layers.get('water');
      if (w) {
        for (const f of w.features) {
          if (f.type !== GEOM_POLYGON || f.props.brunnel === 'tunnel') continue;
          const cls = String(f.props.class ?? '');
          const flat = cls === 'ocean' ? 0 : cls === 'lake' || cls === 'pond' || cls === 'dock' || cls === 'swimming_pool' ? -Infinity : null;
          // The coarse theatre has no draped rivers: at kilometres a cell they would only be noise.
          if (!full && flat === null) continue;
          for (const p of polys(w, f.parts)) out.water.push({ outer: p.outer.ring, holes: p.holes.map((h) => h.ring), flat });
        }
      }
      const tr = tile.layers.get('transportation');
      if (tr) {
        for (const f of tr.features) {
          if (f.type !== GEOM_LINE || f.props.brunnel === 'tunnel') continue;
          const style = ROAD_WIDTH[String(f.props.class ?? '')];
          if (!style || style.rank > maxRank) continue;
          if (!full && f.props.class === 'rail') continue;
          const half = (Math.max(style.width, minRoad) / 2) * metresToPx;
          const into = f.props.class === 'rail' ? out.rails : out.roads;
          for (const line of lines(tr, f.parts)) into.push({ line, half, colour: style.colour });
        }
      }
      for (const [name, rank] of [
        ['landcover', 0],
        ['landuse', 1],
      ] as const) {
        const lc = tile.layers.get(name);
        if (!lc) continue;
        for (const f of lc.features) {
          if (f.type !== GEOM_POLYGON) continue;
          const colour = COVER[String(f.props.class ?? '')] ?? COVER[String(f.props.subclass ?? '')];
          if (!colour) continue;
          for (const p of polys(lc, f.parts)) out.cover.push({ rings: [p.outer.ring, ...p.holes.map((h) => h.ring)], colour, rank });
        }
      }
      // Water paints the ground too, under the flat water surface, so the
      // shore reads even where the surface and the terrain disagree.
      if (w) {
        for (const f of w.features) {
          if (f.type !== GEOM_POLYGON || f.props.brunnel === 'tunnel') continue;
          const sea = f.props.class === 'ocean';
          for (const p of polys(w, f.parts)) out.cover.push({ rings: [p.outer.ring, ...p.holes.map((h) => h.ring)], colour: COLOUR.water, rank: 2, sea });
        }
      }
      const pointIn = (x: number, y: number) => x >= cx0 && x < cx1 && y >= cy0 && y < cy1;
      const pl = tile.layers.get('place');
      if (pl) {
        for (const f of pl.features) {
          const kind = PLACE_KIND[String(f.props.class ?? '')];
          const text = String(f.props['name:latin'] ?? f.props.name ?? '');
          if (!kind || !text || f.parts.length === 0) continue;
          const [x, y] = toPx(pl, f.parts[0].slice(0, 2));
          if (pointIn(x, y)) out.places.push({ text, kind, x, y });
        }
      }
      const al = tile.layers.get('aerodrome_label');
      if (al) {
        for (const f of al.features) {
          const name = String(f.props['name:latin'] ?? f.props.name ?? '');
          const code = String(f.props.icao ?? f.props.iata ?? '');
          const text = name && code ? `${name} (${code})` : name || code;
          if (!text || f.parts.length === 0) continue;
          const [x, y] = toPx(al, f.parts[0].slice(0, 2));
          if (pointIn(x, y)) out.places.push({ text, kind: 'airfield', x, y });
        }
      }
      if (!full) continue;
      const aw = tile.layers.get('aeroway');
      if (aw) {
        for (const f of aw.features) {
          const cls = String(f.props.class ?? '');
          if (f.type === GEOM_POLYGON && (cls === 'runway' || cls === 'taxiway' || cls === 'apron' || cls === 'helipad')) {
            const colour = cls === 'runway' ? COLOUR.runway : cls === 'apron' ? COLOUR.apron : COLOUR.taxiway;
            for (const p of polys(aw, f.parts)) out.airPolys.push({ outer: p.outer.ring, holes: p.holes.map((h) => h.ring), colour });
          } else if (f.type === GEOM_LINE && (cls === 'runway' || cls === 'taxiway')) {
            const width = cls === 'runway' ? 45 : 18;
            const colour = cls === 'runway' ? COLOUR.runway : COLOUR.taxiway;
            for (const line of lines(aw, f.parts)) out.airLines.push({ line, half: (Math.max(width, minRoad) / 2) * metresToPx, colour });
          }
        }
      }
      const b = tile.layers.get('building');
      if (b) {
        for (const f of b.features) {
          if (f.type !== GEOM_POLYGON || f.props.hide_3d === true) continue;
          const height = Number(f.props.render_height ?? 6);
          const minHeight = Number(f.props.render_min_height ?? 0);
          for (const p of polys(b, f.parts)) {
            const area = (area2(p.outer.ring) / 2) * mpp * mpp;
            if (area < minBuilding) {
              stats.buildingsDropped++;
              continue;
            }
            out.buildings.push({
              rings: [p.outer, ...p.holes],
              area,
              height: Number.isFinite(height) && height > 0 ? height : 6,
              minHeight: Number.isFinite(minHeight) && minHeight > 0 ? minHeight : 0,
            });
          }
        }
      }
    }
  }
  return out;
}

/** The middle of the box a result covers, for naming it. */
export function resultCentre(r: BackdropResult): { lat: number; lon: number } {
  return boxCentre(r.stats.box);
}

/**
 * Calls `fn` for every grid vertex inside a polygon (outer ring and holes, in
 * the grid's own pixels, even-odd): a scanline fill along the grid's rows.
 */
export function fillRings(g: TerrainGrid, rings: number[][], fn: (i: number, j: number) => void): void {
  let minY = Infinity;
  let maxY = -Infinity;
  for (const r of rings) {
    for (let k = 1; k < r.length; k += 2) {
      if (r[k] < minY) minY = r[k];
      if (r[k] > maxY) maxY = r[k];
    }
  }
  const j0 = Math.max(0, Math.ceil((minY - g.y0) / g.dy));
  const j1 = Math.min(g.rows - 1, Math.floor((maxY - g.y0) / g.dy));
  const xs: number[] = [];
  for (let j = j0; j <= j1; j++) {
    const y = g.y0 + j * g.dy;
    xs.length = 0;
    for (const r of rings) {
      const n = r.length;
      for (let k = 0; k < n; k += 2) {
        const ax = r[k];
        const ay = r[k + 1];
        const bx = r[(k + 2) % n];
        const by = r[(k + 3) % n];
        // Half-open on y, so a vertex on the row counts once.
        if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + ((y - ay) * (bx - ax)) / (by - ay));
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const i0 = Math.max(0, Math.ceil((xs[k] - g.x0) / g.dx));
      const i1 = Math.min(g.cols - 1, Math.floor((xs[k + 1] - g.x0) / g.dx));
      for (let i = i0; i <= i1; i++) fn(i, j);
    }
  }
}
