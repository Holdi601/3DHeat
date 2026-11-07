import { msg, type Msg } from '../data/msg';
import type { LevelCredit } from '../render/level';
import type { AxisMapping, Bounds, GeoReference } from '../state/types';
import { clipLine, clipRing, drapePolygon, extrudeBuilding, MeshBuilder, ribbon, area2, type BuiltMesh, type Rgb } from './mesh';
import { decodeTile, GEOM_LINE, GEOM_POLYGON, inflateIfGzip, polygonsOf, type MvtLayer } from './mvt';
import { decodeTerrarium, TERRARIUM_URL, TILE_SIZE } from './terrarium';
import {
  boxCentre,
  geoBoxOf,
  latToMy,
  lonToMx,
  mercatorToPlane,
  metresPerPixel,
  pickZoom,
  tileCount,
  tileRange,
  tilesOf,
  type GeoBox,
  type TileRange,
} from './tiles';

/**
 * The world backdrop: the real place under a recording, built from open data
 * on demand - terrain from elevation tiles, and buildings, roads, water and
 * airfields from OpenStreetMap vector tiles - as a level in the recording's
 * own metres.
 *
 * Sources, their terms and the credit the view must carry are in
 * docs/world-backdrop.md. In short: elevation from the AWS Terrain Tiles
 * (Terrarium PNG, no key), map features from OpenFreeMap's OpenMapTiles
 * vector tiles (no key; ODbL data, so nothing built here is ever shipped).
 */

/** The vector tiles' TileJSON: says the current build's tile URL. */
export const OPENFREEMAP_TILEJSON = 'https://tiles.openfreemap.org/planet';

/** Credits a backdrop carries, shown on the canvas while it is the level. */
export type WorldCredit = LevelCredit;

/** Deepest elevation zoom asked for: about 30 m a pixel at mid latitudes, the resolution of the data under it. */
const TERRAIN_MAX_ZOOM = 12;
/** Most elevation tiles one backdrop downloads (about 80 kB each). */
const TERRAIN_MAX_TILES = 36;
/** Most terrain vertices; the grid is thinned to fit. */
const TERRAIN_MAX_VERTICES = 400_000;
/** Deepest vector zoom OpenFreeMap serves, and the only one with buildings. */
const VECTOR_MAX_ZOOM = 14;
/** Below this the vector tiles hold little worth draping; a larger area has terrain only. */
const VECTOR_MIN_ZOOM = 8;
/**
 * Most vector tiles one backdrop downloads. OpenFreeMap allows an app to
 * download an area for offline use if it is at most 3,000 tiles or 50 MB, with
 * at most 4 requests in parallel; this stays far inside that.
 */
const VECTOR_MAX_TILES = 300;
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
} satisfies Record<string, Rgb>;

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
  geo: GeoReference;
  /** The dataset's world bounds. */
  bounds: Bounds;
  /** The load's axis mapping, which the backdrop goes through like the data did. */
  axes: AxisMapping | null;
  /** Metres added round the data on every side; by default a quarter of its extent, 2 to 30 km. */
  margin?: number;
}

/** How the builder reaches the outside world: swapped in tests. */
export interface BackdropIo {
  /** A URL's bytes, null when the server has no such tile. */
  fetch(url: string, preferNetwork?: boolean): Promise<{ bytes: ArrayBuffer | null; cached: boolean }>;
  /** A PNG's RGBA pixels. */
  decodePng(bytes: ArrayBuffer): Promise<{ width: number; height: number; rgba: Uint8ClampedArray }>;
  progress(label: Msg, fraction: number | null): void;
}

export interface BackdropStats {
  box: GeoBox;
  terrainZoom: number;
  terrainTiles: number;
  /** Metres between terrain vertices, roughly. */
  terrainSpacing: number;
  vectorZoom: number | null;
  vectorTiles: number;
  downloaded: number;
  fromCache: number;
  bytes: number;
  buildings: number;
  buildingsDropped: number;
  roads: number;
}

export interface BackdropResult {
  mesh: BuiltMesh;
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

/** One building waiting for the budget: rings in terrain pixels, heights in metres. */
interface Building {
  rings: Array<{ ring: number[]; cut: Uint8Array }>;
  area: number;
  height: number;
  minHeight: number;
}

export async function buildBackdrop(req: BackdropRequest, io: BackdropIo): Promise<BackdropResult> {
  const { geo } = req;
  const extent = Math.max(req.bounds.maxX - req.bounds.minX, req.bounds.maxZ - req.bounds.minZ, req.bounds.maxY - req.bounds.minY, 1);
  const margin = req.margin ?? Math.max(2000, Math.min(30000, extent * 0.25));
  const box = geoBoxOf(geo, req.bounds, req.axes, margin);
  const centre = boxCentre(box);
  const notes: Msg[] = [];
  const stats: BackdropStats = {
    box,
    terrainZoom: 0,
    terrainTiles: 0,
    terrainSpacing: 0,
    vectorZoom: null,
    vectorTiles: 0,
    downloaded: 0,
    fromCache: 0,
    bytes: 0,
    buildings: 0,
    buildingsDropped: 0,
    roads: 0,
  };
  const count = (f: { bytes: ArrayBuffer | null; cached: boolean }) => {
    if (f.cached) stats.fromCache++;
    else stats.downloaded++;
    stats.bytes += f.bytes?.byteLength ?? 0;
  };

  // ---- terrain
  const zT = pickZoom(box, TERRAIN_MAX_ZOOM, TERRAIN_MAX_TILES, 1);
  const rT = tileRange(box, zT);
  stats.terrainZoom = zT;
  stats.terrainTiles = tileCount(rT);
  const mosaic = new Mosaic(rT);
  const tiles = tilesOf(rT);
  let done = 0;
  let got = 0;
  io.progress(msg('heat.world.progress.terrain', { done: { int: 0 }, total: { int: tiles.length } }), 0);
  await eachLimited(tiles, PARALLEL, async (t) => {
    const f = await io.fetch(fill(TERRARIUM_URL, t.z, t.x, t.y));
    count(f);
    if (f.bytes) {
      const img = await io.decodePng(f.bytes);
      if (img.width === TILE_SIZE && img.height === TILE_SIZE) {
        mosaic.put(t.x, t.y, decodeTerrarium(img.rgba));
        got++;
      }
    }
    done++;
    io.progress(msg('heat.world.progress.terrain', { done: { int: done }, total: { int: tiles.length } }), (done / tiles.length) * 0.4);
  });
  if (got === 0) notes.push(msg('heat.world.note.noTerrain'));

  // Terrain pixels: global pixels at the terrain's zoom.
  const S = TILE_SIZE * 2 ** zT;
  const px0 = lonToMx(box.west) * S;
  const px1 = lonToMx(box.east) * S;
  const py0 = latToMy(box.north) * S;
  const py1 = latToMy(box.south) * S;
  const g = gridFor(px1 - px0, py1 - py0, TERRAIN_MAX_VERTICES);
  const heights = new Float32Array(g.cols * g.rows);
  for (let j = 0; j < g.rows; j++) for (let i = 0; i < g.cols; i++) heights[j * g.cols + i] = mosaic.sample(px0 + i * g.dx, py0 + j * g.dy);
  const grid = new TerrainGrid(px0, py0, g.cols, g.rows, g.dx, g.dy, heights);
  const mpp = metresPerPixel(centre.lat, zT);
  const cellMetres = Math.max(g.dx, g.dy) * mpp;
  stats.terrainSpacing = cellMetres;
  const toPlane = mercatorToPlane(geo);
  const mb = new MeshBuilder((px, py) => toPlane(px / S, py / S));

  io.progress(msg('heat.world.progress.mesh'), 0.45);
  mb.begin('ground', 'terrain');
  for (let j = 0; j < g.rows; j++) for (let i = 0; i < g.cols; i++) mb.vertexAt(px0 + i * g.dx, py0 + j * g.dy, heights[j * g.cols + i], COLOUR.terrain);
  mb.terrainVertices = g.cols * g.rows;
  for (let j = 0; j + 1 < g.rows; j++) {
    for (let i = 0; i + 1 < g.cols; i++) {
      const a = j * g.cols + i;
      mb.tri('ground', a, a + 1, a + g.cols + 1);
      mb.tri('ground', a, a + g.cols + 1, a + g.cols);
    }
  }
  const credits: WorldCredit[] = ['terrarium'];

  // ---- map features
  const diag = Math.hypot((px1 - px0) * mpp, (py1 - py0) * mpp);
  let zV: number | null = pickZoom(box, VECTOR_MAX_ZOOM, VECTOR_MAX_TILES, VECTOR_MIN_ZOOM - 1);
  if (zV < VECTOR_MIN_ZOOM) {
    zV = null;
    notes.push(msg('heat.world.note.tooLargeForMap'));
  }
  const layers: Array<{ x: number; y: number; z: number; layers: Map<string, MvtLayer> }> = [];
  if (zV !== null) {
    let template: string | null = null;
    try {
      const f = await io.fetch(OPENFREEMAP_TILEJSON, true);
      if (f.bytes) {
        const j = JSON.parse(new TextDecoder().decode(f.bytes)) as { tiles?: string[] };
        template = j.tiles?.[0] ?? null;
      }
    } catch {
      template = null;
    }
    if (!template) notes.push(msg('heat.world.note.noMap'));
    else {
      const rV = tileRange(box, zV);
      const vt = tilesOf(rV);
      stats.vectorZoom = zV;
      stats.vectorTiles = vt.length;
      let vdone = 0;
      let failed = 0;
      await eachLimited(vt, PARALLEL, async (t) => {
        try {
          const f = await io.fetch(fill(template!, t.z, t.x, t.y));
          count(f);
          if (f.bytes) layers.push({ ...t, layers: decodeTile(await inflateIfGzip(new Uint8Array(f.bytes))) });
        } catch {
          failed++;
        }
        vdone++;
        io.progress(msg('heat.world.progress.map', { done: { int: vdone }, total: { int: vt.length } }), 0.45 + (vdone / vt.length) * 0.4);
      });
      if (failed) notes.push(msg('heat.world.note.mapTilesFailed', { failed: { int: failed }, total: { int: vt.length } }));
      if (layers.length) credits.unshift('openfreemap');
    }
  }

  io.progress(msg('heat.world.progress.mesh'), 0.88);
  const lift = Math.max(0.5, cellMetres * 0.04);
  const metresToPx = 1 / mpp;
  const step = Math.min(g.dx, g.dy);
  // Thin at a distance: a road narrower than this would vanish between pixels.
  const minRoad = diag / 5000;
  const maxRank = diag > 150_000 ? 1 : diag > 60_000 ? 2 : 4;
  const minBuilding = diag > 80_000 ? 150 : diag > 30_000 ? 60 : 20;
  const at = (x: number, y: number) => grid.at(x, y);

  const water: Array<{ outer: number[]; holes: number[][]; flat: number | null }> = [];
  const roads: Array<{ line: number[]; half: number; colour: Rgb }> = [];
  const rails: Array<{ line: number[]; half: number; colour: Rgb }> = [];
  const airPolys: Array<{ outer: number[]; holes: number[][]; colour: Rgb }> = [];
  const airLines: Array<{ line: number[]; half: number; colour: Rgb }> = [];
  const buildings: Building[] = [];

  for (const tile of layers) {
    const n = 2 ** tile.z;
    // The tile in terrain pixels, clipped to the box.
    const tx0 = (tile.x / n) * S;
    const ty0 = (tile.y / n) * S;
    const span = S / n;
    const cx0 = Math.max(tx0, px0);
    const cy0 = Math.max(ty0, py0);
    const cx1 = Math.min(tx0 + span, px1);
    const cy1 = Math.min(ty0 + span, py1);
    if (cx0 >= cx1 || cy0 >= cy1) continue;
    const toPx = (layer: MvtLayer, part: number[]) => {
      const k = span / layer.extent;
      const out = new Array<number>(part.length);
      for (let i = 0; i < part.length; i += 2) {
        out[i] = tx0 + part[i] * k;
        out[i + 1] = ty0 + part[i + 1] * k;
      }
      return out;
    };
    const polys = (layer: MvtLayer, parts: number[][]) =>
      polygonsOf(parts)
        .map(({ outer, holes }) => {
          const o = clipRing(toPx(layer, outer), cx0, cy0, cx1, cy1);
          const hs = holes.map((h) => clipRing(toPx(layer, h), cx0, cy0, cx1, cy1)).filter((h) => h.ring.length >= 6);
          return { outer: o, holes: hs };
        })
        .filter((p) => p.outer.ring.length >= 6 && area2(p.outer.ring) > 0);
    const lines = (layer: MvtLayer, parts: number[][]) => parts.flatMap((p) => clipLine(toPx(layer, p), cx0, cy0, cx1, cy1));

    const w = tile.layers.get('water');
    if (w) {
      for (const f of w.features) {
        if (f.type !== GEOM_POLYGON || f.props.brunnel === 'tunnel') continue;
        const cls = String(f.props.class ?? '');
        for (const p of polys(w, f.parts)) {
          const flat = cls === 'ocean' ? 0 : cls === 'lake' || cls === 'pond' || cls === 'dock' || cls === 'swimming_pool' ? -Infinity : null;
          water.push({ outer: p.outer.ring, holes: p.holes.map((h) => h.ring), flat });
        }
      }
    }
    const tr = tile.layers.get('transportation');
    if (tr) {
      for (const f of tr.features) {
        if (f.type !== GEOM_LINE || f.props.brunnel === 'tunnel') continue;
        const style = ROAD_WIDTH[String(f.props.class ?? '')];
        if (!style || style.rank > maxRank) continue;
        const half = (Math.max(style.width, minRoad) / 2) * metresToPx;
        const into = f.props.class === 'rail' ? rails : roads;
        for (const line of lines(tr, f.parts)) into.push({ line, half, colour: style.colour });
      }
    }
    const aw = tile.layers.get('aeroway');
    if (aw) {
      for (const f of aw.features) {
        const cls = String(f.props.class ?? '');
        if (f.type === GEOM_POLYGON && (cls === 'runway' || cls === 'taxiway' || cls === 'apron' || cls === 'helipad')) {
          const colour = cls === 'runway' ? COLOUR.runway : cls === 'apron' ? COLOUR.apron : COLOUR.taxiway;
          for (const p of polys(aw, f.parts)) airPolys.push({ outer: p.outer.ring, holes: p.holes.map((h) => h.ring), colour });
        } else if (f.type === GEOM_LINE && (cls === 'runway' || cls === 'taxiway')) {
          const width = cls === 'runway' ? 45 : 18;
          const colour = cls === 'runway' ? COLOUR.runway : COLOUR.taxiway;
          for (const line of lines(aw, f.parts)) airLines.push({ line, half: (Math.max(width, minRoad) / 2) * metresToPx, colour });
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
          buildings.push({
            rings: [p.outer, ...p.holes],
            area,
            height: Number.isFinite(height) && height > 0 ? height : 6,
            minHeight: Number.isFinite(minHeight) && minHeight > 0 ? minHeight : 0,
          });
        }
      }
    }
  }

  // Water first, lowest; then roads, rails and airfields, each a little higher
  // than the last, so where they cross the later one shows.
  mb.begin('water', 'water');
  for (const wpoly of water) {
    let flat = wpoly.flat;
    if (flat === -Infinity) {
      // A lake lies at its lowest shore.
      flat = Infinity;
      for (let i = 0; i < wpoly.outer.length; i += 2) flat = Math.min(flat, at(wpoly.outer[i], wpoly.outer[i + 1]));
    }
    const level = flat;
    if (level !== null) drapePolygon(mb, 'water', wpoly.outer, wpoly.holes, Infinity, () => level + lift * 0.6, COLOUR.water);
    else drapePolygon(mb, 'water', wpoly.outer, wpoly.holes, step, (x, y) => at(x, y) + lift * 0.6, COLOUR.water);
  }
  mb.begin('ground', 'transportation');
  for (const r of roads) {
    if (mb.totalTriangles > MAX_TRIANGLES - STRUCTURE_BUDGET) break;
    ribbon(mb, 'ground', r.line, r.half, step, at, lift, r.colour);
    stats.roads++;
  }
  mb.begin('ground', 'railway');
  for (const r of rails) {
    if (mb.totalTriangles > MAX_TRIANGLES - STRUCTURE_BUDGET) break;
    ribbon(mb, 'ground', r.line, r.half, step, at, lift * 1.1, r.colour);
  }
  mb.begin('ground', 'aeroway');
  for (const p of airPolys) drapePolygon(mb, 'ground', p.outer, p.holes, step, (x, y) => at(x, y) + lift * 1.3, p.colour);
  for (const r of airLines) ribbon(mb, 'ground', r.line, r.half, step, at, lift * 1.6, r.colour);

  // Buildings, largest first, while the budget lasts.
  buildings.sort((a, b) => b.area - a.area);
  mb.begin('structure', 'building');
  for (const bd of buildings) {
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
  if (stats.buildingsDropped > 0) notes.push(msg('heat.world.note.buildingsDropped', { count: { int: stats.buildingsDropped }, min: { int: minBuilding } }));

  io.progress(msg('heat.world.progress.finish'), 0.95);
  return { mesh: mb.finish(req.axes), credits, stats, notes };
}
