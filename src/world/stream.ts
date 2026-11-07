import type { LevelCredit } from '../render/level';
import { worldToData } from '../render/pose';
import type { GeoPlacement } from '../state/types';
import type { WorldLabel } from './backdrop';
import type { StreamWorkerRequest, StreamWorkerResponse } from './streamWorker';
import type { BuiltTile, TileRequest } from './tileBuild';
import { worldTiles, type WorldTile } from './tileSet';
import { eastNorthOf, heightOf, MAX_LAT, planeInverse, tileBox, tileOf } from './tiles';

/**
 * The streamed world backdrop: a quadtree of Web Mercator tiles round the
 * camera, each built as its own mesh (src/world/tileBuild) and drawn together
 * (src/world/tileSet). A tile is split into its four children while the
 * camera is nearer than `SPLIT` times its width, so the detail falls off
 * with distance the way it falls off on screen, and seams between levels
 * are hidden by each tile's skirt. Nothing is bound to a theatre's box: the
 * roots cover 1,500 km round the camera wherever it is.
 *
 * Coarse tiles are asked for before fine ones, so the view fills at once and
 * sharpens; while a tile's children are loading, the tile itself stands in
 * for them. Built tiles are kept (up to a memory budget, least recently
 * drawn dropped first); the downloads under them stay in the browser's tile
 * cache (src/world/cache), so flying back over an area costs nothing.
 */

/** A tile is split while the camera is nearer than this many times its width. */
export const SPLIT = 1.4;
/** Root zoom, and the deepest zoom built. */
export const ROOT_ZOOM = 5;
export const MAX_ZOOM = 15;
/** How far round the camera the roots reach, metres. */
const ROOT_RANGE = 1_500_000;
/** Builds asked of the worker at once; it works on four of them. */
const IN_FLIGHT = 8;
/** Memory kept for built tiles, bytes of mesh; least recently drawn dropped first. */
const KEEP_BYTES = 600 * 1024 * 1024;

export interface StreamOptions {
  placement: GeoPlacement;
  imagery: boolean;
  runways: boolean;
}

export interface TileNode {
  z: number;
  x: number;
  y: number;
}

const keyOf = (t: TileNode) => `${t.z}/${t.x}/${t.y}`;

/** Ground metres between a point and the nearest point of a tile, and the tile's width. */
function tileReach(lat: number, lon: number, t: TileNode): { d: number; size: number } {
  const b = tileBox(t.x, t.y, t.z);
  const cl = Math.max(b.south, Math.min(b.north, lat));
  const cn = Math.max(b.west, Math.min(b.east, lon));
  const k = 111_320 * Math.cos((((b.north + b.south) / 2) * Math.PI) / 180);
  const dy = (cl - lat) * 110_574;
  const dx = (cn - lon) * 111_320 * Math.cos((lat * Math.PI) / 180);
  return { d: Math.hypot(dx, dy), size: (b.east - b.west) * k };
}

/**
 * The tiles wanted for a camera above (lat, lon) at `height` metres: every
 * node of the quadtree down to the leaves, coarse first, nearest first.
 * `split` lists the nodes that are split (drawn as their children).
 */
export function selectTiles(lat: number, lon: number, height: number): { nodes: TileNode[]; split: Set<string> } {
  const nodes: TileNode[] = [];
  const split = new Set<string>();
  const dLat = ROOT_RANGE / 110_574;
  const dLon = ROOT_RANGE / (111_320 * Math.max(0.05, Math.cos((lat * Math.PI) / 180)));
  const nw = tileOf(Math.min(MAX_LAT, lat + dLat), lon - Math.min(179, dLon), ROOT_ZOOM);
  const se = tileOf(Math.max(-MAX_LAT, lat - dLat), lon + Math.min(179, dLon), ROOT_ZOOM);
  const n = 2 ** ROOT_ZOOM;
  const visit = (t: TileNode) => {
    nodes.push(t);
    if (t.z >= MAX_ZOOM) return;
    const { d, size } = tileReach(lat, lon, t);
    if (Math.hypot(d, Math.max(0, height)) < size * SPLIT) {
      split.add(keyOf(t));
      for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) visit({ z: t.z + 1, x: t.x * 2 + i, y: t.y * 2 + j });
    }
  };
  for (let y = nw.y; y <= se.y; y++) for (let x = nw.x; x <= se.x; x++) visit({ z: ROOT_ZOOM, x: ((x % n) + n) % n, y });
  const pri = (t: TileNode) => t.z * 1e9 + tileReach(lat, lon, t).d;
  nodes.sort((a, b) => pri(a) - pri(b));
  return { nodes, split };
}

/**
 * What to draw: each leaf when it is built; where a split tile's children are
 * not all built yet, the tile itself if it is (else what of its children is).
 */
export function renderSet(roots: TileNode[], split: Set<string>, has: (key: string) => boolean): string[] {
  const out: string[] = [];
  const walk = (t: TileNode): string[] | null => {
    const k = keyOf(t);
    if (!split.has(k)) return has(k) ? [k] : null;
    const kids: Array<string[] | null> = [];
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) kids.push(walk({ z: t.z + 1, x: t.x * 2 + i, y: t.y * 2 + j }));
    if (kids.every((c) => c)) return kids.flat() as string[];
    if (has(k)) return [k];
    const some = kids.filter((c): c is string[] => !!c).flat();
    return some.length ? some : null;
  };
  for (const r of roots) out.push(...(walk(r) ?? []));
  return out;
}

interface Entry {
  tile: WorldTile;
  labels: WorldLabel[];
  sources: BuiltTile['sources'];
  bytes: number;
  used: number;
}

const SOURCE_CREDIT: Record<BuiltTile['sources'][number], LevelCredit> = {
  mapterhorn: 'mapterhorn',
  terrarium: 'terrarium',
  openfreemap: 'openfreemap',
  eox: 'eox',
  ourairports: 'ourairports',
};

export class WorldStreamer {
  private worker: Worker | null = null;
  private opts: StreamOptions | null = null;
  private built = new Map<string, Entry>();
  private pending = new Map<string, number>();
  /** Tiles whose build failed, and the update it failed at: not asked for again for a while. */
  private failed = new Map<string, number>();
  private byId = new Map<number, string>();
  private nextId = 1;
  private frame = 0;
  private lastWanted: { nodes: TileNode[]; split: Set<string> } | null = null;
  /** Place names of the tiles drawn now, and a counter bumped when they change. */
  labels: WorldLabel[] = [];
  labelsVersion = 0;
  /** The sources the drawn tiles came from. */
  credits: LevelCredit[] = [];
  /** Counts for the panel. */
  stats = { drawn: 0, kept: 0, loading: 0, bytes: 0, downloaded: 0 };
  /** Called when the drawn set, its credits or its counts change. */
  onChange: (() => void) | null = null;

  get running(): boolean {
    return this.opts !== null;
  }

  /** Starts, or starts again with other options (tiles built for other options are dropped). */
  start(opts: StreamOptions): void {
    if (this.opts && sameOptions(this.opts, opts)) return;
    this.stop();
    this.opts = opts;
    this.worker = new Worker(new URL('./streamWorker.ts', import.meta.url), { type: 'module' });
    this.worker.onmessage = (ev: MessageEvent<StreamWorkerResponse>) => this.received(ev.data);
  }

  stop(): void {
    this.worker?.terminate();
    this.worker = null;
    this.opts = null;
    this.built.clear();
    this.pending.clear();
    this.failed.clear();
    this.byId.clear();
    this.lastWanted = null;
    this.labels = [];
    this.labelsVersion++;
    this.credits = [];
    worldTiles.clear();
  }

  /** The camera moved (or did not): choose tiles, ask for the missing ones, publish the set to draw. */
  update(camera: { x: number; y: number; z: number }): void {
    const opts = this.opts;
    if (!opts || !this.worker) return;
    this.frame++;
    const { geo, axes } = opts.placement;
    const d = worldToData(camera, axes);
    const [e, n] = eastNorthOf(geo, d);
    const [lat, lon] = planeInverse(geo)(e, n);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    const wanted = selectTiles(lat, lon, heightOf(geo, d));
    this.lastWanted = wanted;
    const want = new Set(wanted.nodes.map(keyOf));
    // Drop queued builds no longer wanted.
    const drop: number[] = [];
    for (const [k, id] of this.pending) {
      if (!want.has(k)) {
        drop.push(id);
        this.pending.delete(k);
        this.byId.delete(id);
      }
    }
    if (drop.length) this.worker.postMessage({ kind: 'drop', ids: drop } satisfies StreamWorkerRequest);
    // Ask for the missing ones, coarse and near first.
    for (const t of wanted.nodes) {
      if (this.pending.size >= IN_FLIGHT) break;
      const k = keyOf(t);
      if (this.built.has(k) || this.pending.has(k)) continue;
      const f = this.failed.get(k);
      if (f !== undefined && this.frame - f < 240) continue;
      const id = this.nextId++;
      this.pending.set(k, id);
      this.byId.set(id, k);
      const req: TileRequest = { ...t, geo, axes, imagery: opts.imagery, runways: opts.runways };
      this.worker.postMessage({ kind: 'build', id, req } satisfies StreamWorkerRequest);
    }
    this.publish();
  }

  private received(m: StreamWorkerResponse): void {
    const k = this.byId.get(m.id);
    this.byId.delete(m.id);
    if (k === undefined) return;
    this.pending.delete(k);
    if (m.kind === 'error') {
      // Not asked for again for a minute or so, rather than in a loop.
      console.warn(`world tile ${k}: ${m.message}`);
      this.failed.set(k, this.frame);
      return;
    }
    const t = m.tile;
    const mesh = t.mesh;
    const tile: WorldTile = {
      id: `${t.key}#${m.id}`,
      vertices: mesh.vertices,
      colours: mesh.colours,
      uvs: t.uvs,
      image: t.image,
      indices: mesh.indices,
      structureIndices: mesh.structureIndices,
      structureEdges: mesh.structureEdges,
      waterIndices: mesh.waterIndices,
      bounds: mesh.bounds,
    };
    const bytes =
      mesh.vertices.byteLength +
      mesh.colours.byteLength +
      (t.uvs?.byteLength ?? 0) +
      mesh.indices.byteLength +
      mesh.structureIndices.byteLength +
      mesh.structureEdges.byteLength +
      mesh.waterIndices.byteLength +
      (t.image ? t.image.width * t.image.height * 4 : 0);
    this.built.set(k, { tile, labels: t.labels, sources: t.sources, bytes, used: this.frame });
    this.stats.downloaded += t.downloaded;
    this.publish();
  }

  private publish(): void {
    const wanted = this.lastWanted;
    if (!wanted) return;
    const roots = wanted.nodes.filter((t) => t.z === ROOT_ZOOM);
    const keys = renderSet(roots, wanted.split, (k) => this.built.has(k));
    const drawn: WorldTile[] = [];
    const labels: WorldLabel[] = [];
    const sources = new Set<LevelCredit>();
    const seen = new Set<string>();
    for (const k of keys) {
      const e = this.built.get(k)!;
      e.used = this.frame;
      drawn.push(e.tile);
      for (const s of e.sources) sources.add(SOURCE_CREDIT[s]);
      for (const l of e.labels) {
        const id = `${l.kind}:${l.text}`;
        if (seen.has(id)) continue;
        seen.add(id);
        labels.push(l);
      }
    }
    const before = worldTiles.version;
    worldTiles.replace(drawn);
    if (worldTiles.version !== before) {
      this.labels = labels;
      this.labelsVersion++;
    }
    this.evict(new Set(keys));
    const order: LevelCredit[] = ['eox', 'openfreemap', 'mapterhorn', 'terrarium', 'ourairports'];
    const credits = order.filter((c) => sources.has(c));
    const changed = credits.join() !== this.credits.join() || worldTiles.version !== before;
    this.credits = credits;
    let bytes = 0;
    for (const e of this.built.values()) bytes += e.bytes;
    this.stats = { ...this.stats, drawn: drawn.length, kept: this.built.size, loading: this.pending.size, bytes };
    if (changed) this.onChange?.();
  }

  /** Drops the least recently drawn tiles past the memory budget; never one drawn now or still wanted. */
  private evict(drawn: Set<string>): void {
    let total = 0;
    for (const e of this.built.values()) total += e.bytes;
    if (total <= KEEP_BYTES) return;
    const want = new Set(this.lastWanted?.nodes.map(keyOf) ?? []);
    const old = [...this.built.entries()].filter(([k]) => !drawn.has(k) && !want.has(k)).sort((a, b) => a[1].used - b[1].used);
    for (const [k, e] of old) {
      if (total <= KEEP_BYTES) break;
      this.built.delete(k);
      total -= e.bytes;
    }
  }
}

function sameOptions(a: StreamOptions, b: StreamOptions): boolean {
  const ga = a.placement.geo;
  const gb = b.placement.geo;
  return (
    a.imagery === b.imagery &&
    a.runways === b.runways &&
    ga.lat0 === gb.lat0 &&
    ga.lon0 === gb.lon0 &&
    ga.projection === gb.projection &&
    ga.north === gb.north &&
    ga.theatre === gb.theatre &&
    JSON.stringify(a.placement.axes) === JSON.stringify(b.placement.axes)
  );
}

/** The one streamer. */
export const worldStreamer = new WorldStreamer();
