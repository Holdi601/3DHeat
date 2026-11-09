import type { Msg } from '../data/msg';
import { dataToWorld } from '../render/pose';
import type { AxisMapping, Bounds, GeoReference } from '../state/types';
import {
  COLOUR,
  collect,
  fill,
  fillRings,
  groundColour,
  OPENFREEMAP_TILEJSON,
  SEA_FLOOR,
  TerrainGrid,
  type Layer,
  type Limits,
  type WorldLabel,
} from './backdrop';
import type { FetchMode } from './cache';
import { BUILDING_STRIDE, type DcsGround, type TileVerdict } from './dcsGround';
import { fromDcs, toDcs } from './dcsProjection';
import { clipLine, drapePolygon, extrudeBuilding, MeshBuilder, ribbon, type BuiltMesh } from './mesh';
import { decodeTile, inflateIfGzip } from './mvt';
import { OURAIRPORTS_RUNWAYS, parseRunways, runwaysIn, type Runway } from './runways';
import { decodeTerrarium, TERRARIUM_URL } from './terrarium';
import { dataOfEastNorth, frameSense, latToMy, lonToMx, mercatorToPlane, metresPerPixel, myToLat, tileBox } from './tiles';

/**
 * One tile of the streamed world backdrop: the square of the earth that Web
 * Mercator tile (z, x, y) covers, as a mesh in the viewer's world - terrain
 * on a regular grid with a skirt round its edge, land cover and the sea
 * painted on it, the map's roads, railways, airfields, runways, lakes and
 * buildings on top, and optionally the satellite picture of the square.
 *
 * Every source is read at the deepest zoom it has up to the tile's own, and a
 * deeper tile reads its ancestor's square and clips: terrain from Mapterhorn
 * (zoom 12 everywhere, deeper where a country's own survey is in it; the
 * AWS Terrain Tiles as the fallback), map features from OpenFreeMap (zoom
 * 14, the only zoom with buildings), imagery from EOX Sentinel-2 cloudless
 * 2016 (zoom 14, about 10 m). See docs/world-backdrop.md for the terms.
 */

/** Mapterhorn: Terrarium-encoded heights in 512 px lossless WebP, no key. */
export const MAPTERHORN_URL = 'https://tiles.mapterhorn.com/{z}/{x}/{y}.webp';
/** EOX Sentinel-2 cloudless 2016 (CC BY 4.0), Web Mercator: z, then row, then column. */
export const EOX_URL = 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg';

/**
 * National orthophotos, public and keyless, finer than the satellite mosaic:
 * the USGS National Map's imagery (USDA NAIP and others; public domain) over
 * the United States, IGN's BD ORTHO over France (Licence Ouverte 2.0). Used
 * for a map tile wholly inside the country, from zoom 13, at two zooms deeper
 * than the tile (16 of their tiles laid into one picture); EOX elsewhere. See
 * docs/world-backdrop.md for the terms.
 */
export const USGS_URL = 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}';
export const IGN_URL =
  'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg';
const ORTHO_FROM = 13;
const ORTHO_DEEPER = 2;

/** Rough outlines (latitude, longitude) of where each orthophoto exists; a tile must lie wholly inside. */
const ORTHO: Array<{ id: 'usgs' | 'ign'; url: string; maxZoom: number; outline: Array<[number, number]> }> = [
  {
    id: 'usgs',
    url: USGS_URL,
    maxZoom: 16,
    // The contiguous United States, inside the borders.
    outline: [
      [48.9, -124.6], [48.9, -95.2], [46.2, -84.6], [45.0, -74.8], [45.2, -67.8], [41.3, -70.0], [35.2, -75.5], [30.4, -81.4],
      [25.2, -80.4], [29.6, -94.0], [26.1, -97.2], [29.6, -103.0], [31.8, -106.5], [31.4, -111.1], [32.7, -117.1], [40.3, -124.4],
    ],
  },
  {
    id: 'ign',
    url: IGN_URL,
    maxZoom: 17,
    // Metropolitan France, inside the coast and the borders (England and the Channel Islands outside).
    outline: [
      [51.05, 2.55], [50.15, 1.55], [49.7, 0.1], [49.65, -1.3], [49.7, -1.95], [48.65, -1.6], [48.85, -3.2], [48.4, -4.8],
      [47.3, -2.6], [46.2, -1.2], [43.4, -1.7], [42.5, 1.7], [42.4, 3.2], [43.5, 4.6], [43.1, 6.4], [43.7, 7.5], [45.9, 6.9],
      [46.4, 6.1], [47.5, 7.6], [49.0, 8.2], [49.5, 6.4], [50.1, 4.2], [51.05, 2.55],
    ],
  },
];

function inside(lat: number, lon: number, poly: Array<[number, number]>): boolean {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ay, ax] = poly[i];
    const [by, bx] = poly[j];
    if (ay > lat !== by > lat && lon < ((bx - ax) * (lat - ay)) / (by - ay) + ax) c = !c;
  }
  return c;
}

/** The orthophoto covering a whole tile, if any. */
export function orthoFor(box: { south: number; north: number; west: number; east: number }): (typeof ORTHO)[number] | null {
  for (const o of ORTHO) {
    const corners: Array<[number, number]> = [
      [box.south, box.west],
      [box.south, box.east],
      [box.north, box.west],
      [box.north, box.east],
    ];
    if (corners.every(([la, lo]) => inside(la, lo, o.outline))) return o;
  }
  return null;
}

/** Deepest zoom asked of each source; deeper tiles read their ancestor's square. */
const TERRAIN_MAX = 14;
const TERRAIN_GLOBAL = 12;
/**
 * Terrain is read two zooms coarser than the tile: a 512 px height tile then
 * covers sixteen map tiles at 128 px each, still two pixels to a grid cell,
 * and sixteen tiles share one download.
 */
const TERRAIN_COARSER = 2;
const VECTOR_MAX = 14;
const IMAGERY_MAX = 14;
/** Grid vertices along a tile's side. */
const GRID = 65;
/** Buildings one tile may carry, in triangles. */
const TILE_STRUCTURE_BUDGET = 120_000;

export interface TileRequest {
  z: number;
  x: number;
  y: number;
  geo: GeoReference;
  axes: AxisMapping | null;
  imagery: boolean;
  runways: boolean;
}

export interface TileIo {
  fetch(url: string, mode?: FetchMode): Promise<{ bytes: ArrayBuffer | null; cached: boolean; missing?: boolean }>;
  decodeImage(bytes: ArrayBuffer, type: string): Promise<{ width: number; height: number; rgba: Uint8ClampedArray }>;
  /** The picture as a bitmap to hand to the renderer; null where bitmaps cannot be made (tests). */
  bitmap(bytes: ArrayBuffer, type: string): Promise<ImageBitmap | null>;
  /**
   * Pictures laid out n by n (row by row, null for a missing one, drawn as
   * nothing) as one bitmap; null where bitmaps cannot be made (tests).
   */
  mosaic(parts: Array<ArrayBuffer | null>, n: number, type: string): Promise<ImageBitmap | null>;
  /** A DCS theatre's own ground, for the hybrid backdrop (src/world/dcsGround); absent otherwise. */
  dcs?: DcsGround | null;
}

export interface BuiltTile {
  key: string;
  mesh: BuiltMesh;
  uvs: Float32Array | null;
  image: ImageBitmap | null;
  labels: WorldLabel[];
  /** Which sources it was built from, for the credits. */
  sources: Array<'mapterhorn' | 'terrarium' | 'openfreemap' | 'eox' | 'usgs' | 'ign' | 'ourairports'>;
  /** Bytes downloaded (not from the cache) for it. */
  downloaded: number;
  notes: Msg[];
  /** How the tile met the game's ground, where a DCS ground was given and reaches it. */
  dcs?: TileVerdict & { shift: number };
}

const key = (z: number, x: number, y: number) => `${z}/${x}/${y}`;

/** The template of OpenFreeMap's current build, asked for once per worker. */
let vectorTemplate: Promise<string | null> | null = null;
/** OurAirports' list, read once per worker. */
let runwayList: Promise<Runway[]> | null = null;

export async function buildTile(req: TileRequest, io: TileIo): Promise<BuiltTile> {
  const { z, x, y, geo } = req;
  const n = 2 ** z;
  // The tile's own pixel space: 256 px across it at its zoom.
  const S = 256 * n;
  const px0 = x * 256;
  const py0 = y * 256;
  const box = tileBox(x, y, z);
  const centreLat = (box.north + box.south) / 2;
  const mpp = metresPerPixel(centreLat, z);
  const sources: BuiltTile['sources'] = [];
  let downloaded = 0;
  const get = async (url: string) => {
    const f = await io.fetch(url);
    if (!f.cached) downloaded += f.bytes?.byteLength ?? 0;
    return f;
  };

  // ---- terrain: Mapterhorn at the deepest zoom it has, else its ancestors, else Terrarium
  const heights = new Float32Array(GRID * GRID);
  const dx = 256 / (GRID - 1);
  let terrain: { data: Float32Array; size: number; z: number; x: number; y: number } | null = null;
  for (let zt = Math.max(0, Math.min(z - TERRAIN_COARSER, TERRAIN_MAX)); zt >= 0 && !terrain; zt--) {
    // Past zoom 12 only the first zoom tried is worth it: deeper data is a country's survey or nothing.
    if (zt > TERRAIN_GLOBAL && zt < Math.min(z - TERRAIN_COARSER, TERRAIN_MAX)) continue;
    const k = z - zt;
    const tx = x >> k;
    const ty = y >> k;
    try {
      const f = await get(fill(MAPTERHORN_URL, zt, tx, ty));
      if (!f.bytes) continue;
      const img = await io.decodeImage(f.bytes, 'image/webp');
      terrain = { data: decodeTerrarium(img.rgba), size: img.width, z: zt, x: tx, y: ty };
      sources.push('mapterhorn');
    } catch {
      // The service unreachable: the AWS Terrain Tiles at the same square.
      try {
        const zz = Math.min(zt, 15);
        const f = await get(fill(TERRARIUM_URL, zz, x >> (z - zz), y >> (z - zz)));
        if (f.bytes) {
          const img = await io.decodeImage(f.bytes, 'image/png');
          terrain = { data: decodeTerrarium(img.rgba), size: img.width, z: zz, x: x >> (z - zz), y: y >> (z - zz) };
          sources.push('terrarium');
        }
      } catch {
        // No terrain at all: sea level.
      }
      break;
    }
  }
  if (terrain) {
    const t = terrain;
    // Tile pixels to the terrain image's pixels.
    const scale = (t.size / 256) * 2 ** (t.z - z);
    const ox = t.x * t.size;
    const oy = t.y * t.size;
    const w = t.size;
    for (let j = 0; j < GRID; j++) {
      for (let i = 0; i < GRID; i++) {
        const sx = Math.max(0, Math.min(w - 1.001, (px0 + i * dx) * scale - ox - 0.5));
        const sy = Math.max(0, Math.min(w - 1.001, (py0 + j * dx) * scale - oy - 0.5));
        const a = Math.floor(sx);
        const b = Math.floor(sy);
        const u = sx - a;
        const v = sy - b;
        const d = t.data;
        heights[j * GRID + i] =
          d[b * w + a] * (1 - u) * (1 - v) + d[b * w + a + 1] * u * (1 - v) + d[(b + 1) * w + a] * (1 - u) * v + d[(b + 1) * w + a + 1] * u * v;
      }
    }
  }
  // ---- the game's own ground: its heights where it reaches, the real world moved onto it or left out
  if (io.dcs && !io.dcs.shifts) {
    try {
      runwayList ??= io.fetch(OURAIRPORTS_RUNWAYS).then((f) => (f.bytes ? parseRunways(new TextDecoder().decode(f.bytes)) : []));
      io.dcs.shifts = io.dcs.findShifts(await runwayList);
    } catch {
      runwayList = null;
      io.dcs.shifts = [];
    }
  }
  const game = io.dcs ? io.dcs.forTile(px0, py0, dx, GRID, S, heights, dx * mpp) : null;
  const realWorld = !game || game.verdict.agree;
  if (game) for (let k = 0; k < heights.length; k++) if (game.covered[k]) heights[k] = game.heights[k];
  const grid = new TerrainGrid(px0, py0, GRID, GRID, dx, dx, heights);
  const plane = mercatorToPlane(geo);
  const [smx, smy] = game?.shift ?? [0, 0];
  const toPlane = smx || smy ? (mx: number, my: number) => plane(mx + smx, my + smy) : plane;
  const layer: Layer = {
    limits: { full: z >= 9 } as Limits,
    mx0: x / n,
    my0: y / n,
    mx1: (x + 1) / n,
    my1: (y + 1) / n,
    z,
    S,
    grid,
    mpp,
    cellMetres: dx * mpp,
    diag: Math.SQRT2 * 256 * mpp,
    project: (px, py) => toPlane(px / S, py / S),
    regions: [[px0, py0, px0 + 256, py0 + 256]],
    hole: null,
    sea: null,
  };

  // ---- map features
  let features: ReturnType<typeof collect> | null = null;
  if (realWorld) try {
    vectorTemplate ??= io
      .fetch(OPENFREEMAP_TILEJSON, 'network-first')
      .then((f) => (f.bytes ? ((JSON.parse(new TextDecoder().decode(f.bytes)) as { tiles?: string[] }).tiles?.[0] ?? null) : null))
      .catch(() => null);
    const tpl = await vectorTemplate;
    if (tpl) {
      const zv = Math.min(z, VECTOR_MAX);
      const k = z - zv;
      const f = await get(fill(tpl, zv, x >> k, y >> k));
      if (f.bytes) {
        features = collect(layer, [{ z: zv, x: x >> k, y: y >> k, layers: decodeTile(await inflateIfGzip(new Uint8Array(f.bytes))) }], { buildingsDropped: 0 });
        sources.push('openfreemap');
      }
    } else vectorTemplate = null;
  } catch {
    features = null;
  }

  // ---- imagery
  let image: ImageBitmap | null = null;
  let imageRect: { z: number; x: number; y: number; n: number } | null = null;
  // A national orthophoto where one covers the whole tile, up to a metre a
  // pixel: several of its tiles laid into one picture for this tile.
  const ortho = req.imagery && realWorld && z >= ORTHO_FROM ? orthoFor(box) : null;
  if (ortho) {
    const zf = Math.min(z + ORTHO_DEEPER, ortho.maxZoom);
    const n = 2 ** (zf - z);
    try {
      const parts = await Promise.all(
        Array.from({ length: n * n }, async (_, i) => {
          const f = await get(fill(ortho.url, zf, x * n + (i % n), y * n + Math.floor(i / n)));
          return f.bytes && f.bytes.byteLength > 0 ? f.bytes : null;
        }),
      );
      if (parts.every((p) => p)) {
        image = await io.mosaic(parts, n, 'image/jpeg');
        if (image) {
          imageRect = { z: zf, x: x * n, y: y * n, n };
          sources.push(ortho.id);
        }
      }
    } catch {
      image = null;
    }
  }
  if (req.imagery && realWorld && !image) {
    const zi = Math.min(z, IMAGERY_MAX);
    const k = z - zi;
    try {
      const f = await get(fill(EOX_URL, zi, x >> k, y >> k));
      // Any picture, however small: a uniform square of open sea is a few hundred bytes.
      if (f.bytes && f.bytes.byteLength > 0) {
        image = await io.bitmap(f.bytes, 'image/jpeg');
        imageRect = { z: zi, x: x >> k, y: y >> k, n: 1 };
        sources.push('eox');
      }
    } catch {
      image = null;
    }
  }

  // ---- the mesh: grid, cover, sea, skirt
  const mb = new MeshBuilder(layer.project);
  if (imageRect) {
    mb.withUvs();
    const r = imageRect;
    const k = 2 ** (r.z - z) / 256;
    mb.uvOf = (px, py) => [(px * k - r.x) / r.n, (py * k - r.y) / r.n];
  }
  mb.begin('ground', 'terrain');
  for (let j = 0; j < GRID; j++) for (let i = 0; i < GRID; i++) mb.vertexAt(px0 + i * dx, py0 + j * dx, heights[j * GRID + i], groundColour(heights[j * GRID + i]));
  // Where the real world is left out, the game's ground in its own class colours.
  if (game && !realWorld) for (let k = 0; k < GRID * GRID; k++) if (game.covered[k]) mb.setColour(k, [game.colours[k * 3], game.colours[k * 3 + 1], game.colours[k * 3 + 2]]);
  if (features) {
    features.cover.sort((a, b) => a.rank - b.rank);
    for (const c of features.cover) {
      fillRings(grid, c.rings, (i, j) => {
        const k = j * GRID + i;
        mb.setColour(k, c.colour);
        if (c.sea && heights[k] < 2) {
          heights[k] = SEA_FLOOR;
          mb.setHeight(k, SEA_FLOOR);
        }
      });
    }
  }
  for (let j = 0; j + 1 < GRID; j++) {
    for (let i = 0; i + 1 < GRID; i++) {
      const a = j * GRID + i;
      mb.tri('ground', a, a + 1, a + GRID + 1);
      mb.tri('ground', a, a + GRID + 1, a + GRID);
    }
  }
  // A skirt hanging from the edge, so a neighbour at another level of detail
  // never shows the sky through the seam between them.
  const skirt = Math.max(20, layer.cellMetres * 0.5);
  const ring: number[] = [];
  for (let i = 0; i < GRID; i++) ring.push(i);
  for (let j = 1; j < GRID; j++) ring.push(j * GRID + GRID - 1);
  for (let i = GRID - 2; i >= 0; i--) ring.push((GRID - 1) * GRID + i);
  for (let j = GRID - 2; j >= 0; j--) ring.push(j * GRID);
  let prev: [number, number] | null = null;
  const skirtFirst = mb.vertexCount;
  for (const k of [...ring, ring[0]]) {
    const i = k % GRID;
    const j = Math.floor(k / GRID);
    const px = px0 + i * dx;
    const py = py0 + j * dx;
    // The edge's own colour, and (below) lit as flat ground: a skirt seen
    // edge-on at a seam then reads as the ground beside it, not as a dark wall.
    const c = mb.colourOf(k);
    const top = mb.vertexAt(px, py, heights[k], c);
    const bottom = mb.vertexAt(px, py, heights[k] - skirt, c);
    if (prev) {
      for (const [a, b, c] of [
        [prev[0], top, bottom],
        [prev[0], bottom, prev[1]],
        [prev[0], bottom, top],
        [prev[0], prev[1], bottom],
      ])
        mb.tri('ground', a, b, c);
    }
    prev = [top, bottom];
  }
  const skirtEnd = mb.vertexCount;
  mb.terrainVertices = mb.vertexCount;
  mb.uvOf = null;

  // ---- features on top
  const at = (px: number, py: number) => grid.at(px, py);
  const lift = Math.max(0.5, layer.cellMetres * 0.04);
  const step = dx;
  const labels: WorldLabel[] = [];
  const toWorld = (e: number, nn: number, h: number) => dataToWorld(dataOfEastNorth(geo, e, nn, h), req.axes);
  if (features) {
    const f = features;
    mb.begin('water', 'water');
    for (const w of f.water) {
      if (w.flat === 0) continue; // the open sea is the terrain
      let level = w.flat;
      if (level === -Infinity) {
        level = Infinity;
        for (let i = 0; i < w.outer.length; i += 2) level = Math.min(level, at(w.outer[i], w.outer[i + 1]));
      }
      const lv = level;
      if (lv !== null) drapePolygon(mb, 'water', w.outer, w.holes, Infinity, () => lv + Math.min(lift * 0.6, 2), COLOUR.water);
      else drapePolygon(mb, 'water', w.outer, w.holes, step, (px, py) => at(px, py) + lift * 0.6, COLOUR.water);
    }
    mb.begin('ground', 'transportation');
    for (const r of f.roads) ribbon(mb, 'ground', r.line, r.half, step, at, lift, r.colour);
    mb.begin('ground', 'railway');
    for (const r of f.rails) ribbon(mb, 'ground', r.line, r.half, step, at, lift * 1.1, r.colour);
    mb.begin('ground', 'aeroway');
    for (const p of f.airPolys) drapePolygon(mb, 'ground', p.outer, p.holes, step, (px, py) => at(px, py) + lift * 1.3, p.colour);
    for (const r of f.airLines) ribbon(mb, 'ground', r.line, r.half, step, at, lift * 1.6, r.colour);
    for (const p of f.places) {
      const [e, nn] = layer.project(p.x, p.y);
      const w = toWorld(e, nn, at(p.x, p.y) + 30);
      labels.push({ text: p.text, kind: p.kind, x: w.x, y: w.y, z: w.z });
    }
  }

  // ---- runways as surveyed, with markings
  if (req.runways && realWorld && z >= 11) {
    try {
      runwayList ??= io
        .fetch(OURAIRPORTS_RUNWAYS)
        .then((f) => (f.bytes ? parseRunways(new TextDecoder().decode(f.bytes)) : []))
        .catch(() => {
          runwayList = null;
          return [];
        });
      const list = runwaysIn(await runwayList, box);
      if (list.length) {
        mb.begin('ground', 'runway');
        sources.push('ourairports');
      }
      for (const r of list) drawRunway(mb, r, S, layer, at, lift);
    } catch {
      // Runways as the map draws them.
    }
  }

  // ---- buildings, largest first, within the tile's share; where the game's level carries its own, those instead
  const gameTown = game && io.dcs?.buildings.length ? io.dcs : null;
  const onGame = (px: number, py: number) => {
    const i = Math.max(0, Math.min(GRID - 1, Math.round((px - px0) / dx)));
    const j = Math.max(0, Math.min(GRID - 1, Math.round((py - py0) / dx)));
    return game!.covered[j * GRID + i] === 1;
  };
  if (gameTown && z >= GAME_BUILDINGS_ZOOM) drawGameBuildings(mb, gameTown, box, S, px0, py0, smx, smy, at);
  if (features?.buildings.length) {
    mb.begin('structure', 'building');
    features.buildings.sort((a, b) => b.area - a.area);
    for (const bd of features.buildings) {
      if (mb.triangles('structure') > TILE_STRUCTURE_BUDGET) break;
      if (gameTown && onGame(bd.rings[0].ring[0], bd.rings[0].ring[1])) continue;
      let base = Infinity;
      const outer = bd.rings[0].ring;
      for (let i = 0; i < outer.length; i += 2) base = Math.min(base, at(outer[i], outer[i + 1]));
      extrudeBuilding(mb, bd.rings, base, bd.minHeight, bd.height, COLOUR.building);
    }
  }

  const uvs = mb.takeUvs();
  const mesh = mb.finish(req.axes, { toData: (e, nn, h) => dataOfEastNorth(geo, e, nn, h), sense: frameSense(geo) });
  // Skirts lit as the ground they hang from (world up; heights are always world Y).
  for (let i = skirtFirst; i < skirtEnd; i++) mesh.vertices.set([0, 1, 0], i * 6 + 3);
  const dcs = game ? { ...game.verdict, shift: Math.hypot(smx, smy) * 40_075_016 * Math.cos((centreLat * Math.PI) / 180) } : undefined;
  return { key: key(z, x, y), mesh, uvs, image, labels, sources, downloaded, notes: [], ...(dcs ? { dcs } : {}) };
}

/** The game's buildings show from this zoom on (a tile about 10 km across). */
const GAME_BUILDINGS_ZOOM = 12;
/** Per kind (heat3d_ext_dcs buildings.KINDS): house, block, industrial, airfield, tower, other. */
const GAME_BUILDING_RGB: Array<[number, number, number]> = [
  [0.88, 0.82, 0.74],
  [0.84, 0.83, 0.81],
  [0.76, 0.76, 0.74],
  [0.72, 0.76, 0.72],
  [0.82, 0.78, 0.72],
  [0.86, 0.81, 0.75],
];

/**
 * The game's buildings whose middle lies in the tile, as boxes standing on
 * the drawn ground: from the lower of their own base and the ground under
 * their corners, to their top. The real layer is moved by (smx, smy) onto
 * the game's; these are the game's already, so they are moved back first.
 */
function drawGameBuildings(
  mb: MeshBuilder,
  dcs: DcsGround,
  box: { south: number; north: number; west: number; east: number },
  S: number,
  px0: number,
  py0: number,
  smx: number,
  smy: number,
  at: (x: number, y: number) => number,
): void {
  const corners = [
    toDcs(dcs.proj, box.south, box.west),
    toDcs(dcs.proj, box.south, box.east),
    toDcs(dcs.proj, box.north, box.west),
    toDcs(dcs.proj, box.north, box.east),
  ];
  const pad = 200;
  const ids = dcs.buildingsIn(
    Math.min(...corners.map((c) => c.x)) - pad,
    Math.min(...corners.map((c) => c.z)) - pad,
    Math.max(...corners.map((c) => c.x)) + pad,
    Math.max(...corners.map((c) => c.z)) + pad,
  );
  if (!ids.length) return;
  const B = dcs.buildings;
  const toPx = (x: number, z: number): [number, number] => {
    const [lat, lon] = fromDcs(dcs.proj, x, z);
    return [(lonToMx(lon) - smx) * S, (latToMy(lat) - smy) * S];
  };
  mb.begin('structure', 'building');
  // Largest first, as the mapped ones, so a full tile keeps its big buildings.
  ids.sort((a, b) => B[b * BUILDING_STRIDE + 4] * B[b * BUILDING_STRIDE + 5] - B[a * BUILDING_STRIDE + 4] * B[a * BUILDING_STRIDE + 5]);
  for (const i of ids) {
    if (mb.triangles('structure') > TILE_STRUCTURE_BUDGET) break;
    const o = i * BUILDING_STRIDE;
    const [x, z, base, height, hx, hz, heading, kind] = B.subarray(o, o + BUILDING_STRIDE);
    const [mx, my] = toPx(x, z);
    if (mx < px0 || mx >= px0 + 256 || my < py0 || my >= py0 + 256) continue;
    const ux = Math.cos(heading);
    const uz = Math.sin(heading);
    const ring: number[] = [];
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ]) {
      ring.push(...toPx(x + ux * sx * hx - uz * sz * hz, z + uz * sx * hx + ux * sz * hz));
    }
    // Clockwise on screen (the tile's y runs south), as extrudeBuilding wants.
    let area = 0;
    for (let k = 0; k < 4; k++) area += ring[k * 2] * ring[((k + 1) % 4) * 2 + 1] - ring[((k + 1) % 4) * 2] * ring[k * 2 + 1];
    if (area < 0) for (const [a, b] of [[2, 6], [3, 7]]) [ring[a], ring[b]] = [ring[b], ring[a]];
    let ground = base;
    for (let k = 0; k < 4; k++) ground = Math.min(ground, at(ring[k * 2], ring[k * 2 + 1]));
    extrudeBuilding(mb, [{ ring, cut: new Uint8Array(4) }], ground, 0, base + height - ground, GAME_BUILDING_RGB[kind] ?? GAME_BUILDING_RGB[5]);
  }
}

/** A runway from threshold to threshold, with side stripes, a dashed centre line and threshold bars. */
function drawRunway(mb: MeshBuilder, r: Runway, S: number, layer: Layer, at: (x: number, y: number) => number, lift: number): void {
  const [x0, y0, x1, y1] = layer.regions[0];
  const line = [lonToMx(r.le[1]) * S, latToMy(r.le[0]) * S, lonToMx(r.he[1]) * S, latToMy(r.he[0]) * S];
  const half = r.width / 2 / layer.mpp;
  const step = layer.grid.dx;
  for (const part of clipLine(line, x0, y0, x1, y1)) ribbon(mb, 'ground', part, half, step, at, lift * 2, COLOUR.surveyed);
  const len = Math.hypot(line[2] - line[0], line[3] - line[1]);
  if (!(len > 0)) return;
  const ux = (line[2] - line[0]) / len;
  const uy = (line[3] - line[1]) / len;
  const stripe = 0.9 / layer.mpp;
  const mark = (pts: number[], hw: number) => {
    for (const part of clipLine(pts, x0, y0, x1, y1)) ribbon(mb, 'ground', part, hw, step, at, lift * 2.3, COLOUR.marking);
  };
  for (const side of [-1, 1]) {
    const ox = -uy * (half - stripe) * side;
    const oy = ux * (half - stripe) * side;
    mark([line[0] + ox, line[1] + oy, line[2] + ox, line[3] + oy], stripe);
  }
  const dash = 30 / layer.mpp;
  for (let d = dash * 2; d + dash < len - dash * 2; d += dash * 2) mark([line[0] + ux * d, line[1] + uy * d, line[0] + ux * (d + dash), line[1] + uy * (d + dash)], stripe * 0.6);
  const bar = 6 / layer.mpp;
  for (const end of [0, 1]) {
    const bx = end ? line[2] - ux * bar * 2 : line[0] + ux * bar;
    const by = end ? line[3] - uy * bar * 2 : line[1] + uy * bar;
    const w = half - stripe * 3;
    mark([bx - uy * w, by + ux * w, bx + uy * w, by - ux * w], bar / 2);
  }
}

/** A tile's world box. */
export function tileWorldBounds(mesh: BuiltMesh): Bounds {
  return mesh.bounds;
}

/** The latitude of a tile row's top edge, for the streamer's distances. */
export function rowLat(y: number, z: number): number {
  return myToLat(y / 2 ** z);
}
