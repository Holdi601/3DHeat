import type { HeightGrid } from '../data/groundFit';
import { worldTiles, type WorldTile } from './tileSet';
import {
  decodeTile,
  inflate,
  type TerrainIndex,
  type TerrainReader,
  type TerrainTileData,
} from './terrainFormat';
import { morphRange, NODE_CELLS, nodeSize, selectNodes, type LodGrid, type LodNode } from './terrainLod';
import { RECORD_BYTES, waterTile } from './terrainObjects';
import type { ObjectsWorkerRequest } from './terrainObjectsWorker';

/**
 * A tiled terrain (`terrainFormat.ts`) being drawn: which tiles are wanted,
 * loaded, on the GPU; the nodes to draw this frame (`terrainLod.ts`); the
 * placed objects round the camera as world tiles (`tileSet.ts`); and heights
 * for whoever asks (the ground check, a click on the ground).
 *
 * Coarse first: a tile is fetched only when the node above it wants to split,
 * so the top level (one tile) shows the whole map at once and the detail
 * follows the camera. Every tile is one range request, inflated by the
 * browser, never parsed into floats on the page's thread: the GPU takes the
 * 16-bit samples as they are. The GPU holds a fixed number of tile layers
 * (`capacity`, from the renderer); when they are full the tile drawn longest
 * ago gives its layer up. The CPU keeps tiles up to `CPU_BYTES`, least
 * recently used dropped first, which on a 30 km island is the whole pyramid.
 *
 * Nothing here reads anything back from the GPU, and no frame waits for a
 * tile: a node whose children are not there yet is drawn itself.
 */

/** Floats a drawn node takes in the instance buffer. */
export const INSTANCE_FLOATS = 12;
/** Range requests in flight at once. */
const IN_FLIGHT = 6;
/** Bytes of tiles kept on the CPU. */
const CPU_BYTES = 192 * 1024 * 1024;
/** Tiles handed to the GPU a frame, at most. */
export const UPLOADS_PER_FRAME = 8;
/** Placed objects: the cells within this far of the camera (more when it is high), and at most this many boxes. */
const OBJECT_REACH = 2500;
const OBJECT_REACH_MAX = 6000;
const OBJECT_BOXES = 300_000;

interface TileEntry {
  key: number;
  level: number;
  tx: number;
  tz: number;
  data: TerrainTileData | null;
  loading: boolean;
  failed: boolean;
  /** GPU layer, -1 when none. */
  slot: number;
  /** On the GPU (its upload has been taken). */
  uploaded: boolean;
  /** Frame it was last drawn in. */
  used: number;
  /** Per node of the tile: min, max height. */
  nodeHeights: Float32Array | null;
}

export interface TerrainUpload {
  slot: number;
  heights: Uint16Array;
  classes: Uint8Array;
}

export interface TerrainFrame {
  /** INSTANCE_FLOATS per node: origin x, origin z, spacing, skirt depth; layer, texel x, texel z, 0; base, step, morph start, morph end. */
  instances: Float32Array;
  count: number;
}

export class TerrainStream {
  readonly grid: LodGrid;
  readonly side: number;
  readonly apron: number;
  /** Nodes a tile a side. */
  private readonly per: number;
  private readonly tiles = new Map<number, TileEntry>();
  private cpuBytes = 0;
  private inFlight = 0;
  private wantQueue: TileEntry[] = [];
  private slots: (TileEntry | null)[] = [];
  private pending: TileEntry[] = [];
  private frameNo = 0;
  private instances = new Float32Array(INSTANCE_FLOATS * 256);
  private disposed = false;
  /** The ground classes' colours, sRGB 0..1, 16 slots. */
  readonly palette: Float32Array;
  /** Called when something new can be drawn (a tile arrived, objects built). */
  onChange: (() => void) | null = null;
  /** Bumped when the drawn set changes for a reason the camera does not show. */
  version = 0;
  readonly stats = { fetched: 0, bytes: 0, uploads: 0, evicted: 0, failed: 0, firstDraw: 0, objectCells: 0, boxes: 0 };
  private readonly started = performance.now();

  constructor(
    readonly index: TerrainIndex,
    private readonly reader: TerrainReader,
    readonly name: string,
  ) {
    this.side = index.side;
    this.apron = index.apron;
    this.per = index.tile / NODE_CELLS;
    this.grid = {
      origin: index.origin,
      spacing: index.spacing,
      levels: index.levels.length,
      cells: index.levels[0].cells,
      extent: index.extent,
    };
    this.palette = new Float32Array(64);
    index.classes.colours.slice(0, 16).forEach((c, i) => this.palette.set([c[0] / 255, c[1] / 255, c[2] / 255, 1], i * 4));
    this.objects = new ObjectCells(this);
  }

  private readonly objects: ObjectCells;

  /** The GPU's layers for tiles: set by the renderer that draws this terrain; every tile goes up again. */
  attach(capacity: number): void {
    this.slots = new Array(capacity).fill(null);
    this.pending = [];
    for (const t of this.tiles.values()) {
      t.slot = -1;
      t.uploaded = false;
    }
    // The top level's tiles are wanted from the start.
    const top = this.grid.levels - 1;
    const n = this.index.levels[top].tiles;
    for (let tz = 0; tz < n; tz++) for (let tx = 0; tx < n; tx++) this.want(this.entry(top, tx, tz));
    for (const t of this.tiles.values()) if (t.data) this.place(t);
  }

  get capacity(): number {
    return this.slots.length;
  }

  dispose(): void {
    this.disposed = true;
    this.objects.dispose();
    this.tiles.clear();
    this.wantQueue = [];
    this.pending = [];
  }

  private keyOf(level: number, tx: number, tz: number): number {
    return (level * 4096 + tz) * 4096 + tx;
  }

  private entry(level: number, tx: number, tz: number): TileEntry {
    const key = this.keyOf(level, tx, tz);
    let t = this.tiles.get(key);
    if (!t) {
      t = { key, level, tx, tz, data: null, loading: false, failed: false, slot: -1, uploaded: false, used: -1, nodeHeights: null };
      this.tiles.set(key, t);
    }
    return t;
  }

  private tileOfNode(n: LodNode): TileEntry {
    return this.entry(n.level, Math.floor(n.nx / this.per), Math.floor(n.nz / this.per));
  }

  /** A node's height range: from its own samples once its tile is loaded, else the tile's from the index. */
  private nodeHeights(n: LodNode): [number, number] {
    const t = this.tiles.get(this.keyOf(n.level, Math.floor(n.nx / this.per), Math.floor(n.nz / this.per)));
    if (t?.nodeHeights) {
      const k = ((n.nz % this.per) * this.per + (n.nx % this.per)) * 2;
      return [t.nodeHeights[k], t.nodeHeights[k + 1]];
    }
    const lv = this.index.levels[n.level];
    const e = lv.index[Math.floor(n.nz / this.per) * lv.tiles + Math.floor(n.nx / this.per)];
    return e ? [e[4], e[5]] : [this.index.heights.min, this.index.heights.max];
  }

  private want(t: TileEntry): void {
    if (t.data || t.loading || t.failed || this.disposed) return;
    if (!this.wantQueue.includes(t)) this.wantQueue.push(t);
  }

  /** Starts the wanted fetches: coarse levels first, then nearest the camera. */
  private pump(camera: ArrayLike<number>): void {
    if (this.inFlight >= IN_FLIGHT || !this.wantQueue.length) return;
    const size = (l: number) => this.index.tile * this.index.levels[l].spacing;
    const dist = (t: TileEntry) => {
      const s = size(t.level);
      const cx = this.grid.origin[0] + (t.tx + 0.5) * s;
      const cz = this.grid.origin[1] + (t.tz + 0.5) * s;
      return Math.hypot(cx - camera[0], cz - camera[2]);
    };
    this.wantQueue.sort((a, b) => b.level - a.level || dist(a) - dist(b));
    while (this.inFlight < IN_FLIGHT && this.wantQueue.length) void this.fetchTile(this.wantQueue.shift()!);
  }

  private async fetchTile(t: TileEntry): Promise<void> {
    if (t.data || t.loading) return;
    const e = this.index.levels[t.level].index[t.tz * this.index.levels[t.level].tiles + t.tx];
    if (!e) {
      t.failed = true;
      return;
    }
    t.loading = true;
    this.inFlight++;
    try {
      const buf = await this.reader.range(e[0], e[1]);
      const raw = this.index.codec === 'zlib' ? await inflate(buf) : new Uint8Array(buf);
      if (this.disposed) return;
      t.data = decodeTile(raw, this.side, e[2], e[3]);
      t.nodeHeights = this.heightsOfNodes(t.data);
      this.cpuBytes += t.data.heights.byteLength + t.data.classes.byteLength;
      this.stats.fetched++;
      this.stats.bytes += e[1];
      this.trimCpu();
      this.place(t);
      this.version++;
      this.onChange?.();
    } catch {
      t.failed = true;
      this.stats.failed++;
    } finally {
      t.loading = false;
      this.inFlight--;
      for (const w of this.waiters.splice(0)) w();
    }
  }

  private waiters: (() => void)[] = [];

  /** Min and max of each node's samples (with its skirt's edge), from a loaded tile. */
  private heightsOfNodes(d: TerrainTileData): Float32Array {
    const out = new Float32Array(this.per * this.per * 2);
    for (let nz = 0; nz < this.per; nz++) {
      for (let nx = 0; nx < this.per; nx++) {
        let lo = 65535, hi = 0;
        for (let j = 0; j <= NODE_CELLS; j++) {
          const row = (nz * NODE_CELLS + j + this.apron) * this.side + nx * NODE_CELLS + this.apron;
          for (let i = 0; i <= NODE_CELLS; i++) {
            const v = d.heights[row + i];
            if (v < lo) lo = v;
            if (v > hi) hi = v;
          }
        }
        out[(nz * this.per + nx) * 2] = d.base + lo * d.step;
        out[(nz * this.per + nx) * 2 + 1] = d.base + hi * d.step;
      }
    }
    return out;
  }

  /** Drops the tiles not on the GPU, least recently drawn first, past the CPU budget. */
  private trimCpu(): void {
    if (this.cpuBytes <= CPU_BYTES) return;
    const top = this.grid.levels - 1;
    const drop = [...this.tiles.values()].filter((t) => t.data && t.slot < 0 && t.level < top).sort((a, b) => a.used - b.used);
    for (const t of drop) {
      if (this.cpuBytes <= CPU_BYTES * 0.9) break;
      this.cpuBytes -= t.data!.heights.byteLength + t.data!.classes.byteLength;
      t.data = null;
      t.nodeHeights = null;
    }
  }

  /** A loaded tile into a GPU layer: a free one, else the one drawn longest ago and not in the last two frames. */
  private place(t: TileEntry): void {
    if (t.slot >= 0 || !t.data || !this.slots.length) return;
    let slot = this.slots.indexOf(null);
    if (slot < 0) {
      let oldest: TileEntry | null = null;
      for (const s of this.slots) if (s && s.used < this.frameNo - 1 && s.level < this.grid.levels - 1 && (!oldest || s.used < oldest.used)) oldest = s;
      if (!oldest) return;
      slot = oldest.slot;
      oldest.slot = -1;
      oldest.uploaded = false;
      this.stats.evicted++;
    }
    this.slots[slot] = t;
    t.slot = slot;
    t.uploaded = false;
    this.pending.push(t);
  }

  /** Tiles to write into the GPU's layers before this frame's draw; they count as there from the next selection on. */
  takeUploads(max = UPLOADS_PER_FRAME): TerrainUpload[] {
    const out: TerrainUpload[] = [];
    while (out.length < max && this.pending.length) {
      const t = this.pending.shift()!;
      if (t.slot < 0 || !t.data || this.slots[t.slot] !== t) continue;
      t.uploaded = true;
      out.push({ slot: t.slot, heights: t.data.heights, classes: t.data.classes });
      this.stats.uploads++;
    }
    if (this.pending.length) this.onChange?.();
    return out;
  }

  /** Whether uploads are waiting (the frame after this one has more to show). */
  get uploading(): boolean {
    return this.pending.length > 0;
  }

  /**
   * The nodes to draw for this camera, as instances, and the tiles they want
   * asked for. `outside` culls a box against the view.
   */
  frame(
    camera: ArrayLike<number>,
    outside?: (minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number) => boolean,
  ): TerrainFrame {
    this.frameNo++;
    if (!this.slots.length) return { instances: this.instances, count: 0 };
    const cam: [number, number, number] = [camera[0], camera[1], camera[2]];
    const choice = selectNodes(this.grid, {
      camera: cam,
      heights: (n) => this.nodeHeights(n),
      ready: (n) => {
        const t = this.tileOfNode(n);
        return t.uploaded;
      },
      outside,
    });
    for (const n of choice.wanted) {
      for (let k = 0; k < 4; k++) this.want(this.tileOfNode({ level: n.level - 1, nx: n.nx * 2 + (k & 1), nz: n.nz * 2 + (k >> 1) }));
    }
    this.pump(cam);
    const need = choice.nodes.length * INSTANCE_FLOATS;
    if (this.instances.length < need) this.instances = new Float32Array(Math.max(need, this.instances.length * 2));
    const out = this.instances;
    let i = 0;
    for (const n of choice.nodes) {
      const t = this.tileOfNode(n);
      t.used = this.frameNo;
      const d = t.data!;
      const s = nodeSize(this.grid, n.level);
      const spacing = s / NODE_CELLS;
      const [m0, m1] = morphRange(this.grid, n.level);
      const [lo, hi] = this.nodeHeights(n);
      out[i++] = this.grid.origin[0] + n.nx * s;
      out[i++] = this.grid.origin[1] + n.nz * s;
      out[i++] = spacing;
      // Deep enough for the steepest step between two levels, never less than a few metres.
      out[i++] = Math.max(4, Math.min(hi - lo, spacing * 3) + 2);
      out[i++] = t.slot;
      out[i++] = (n.nx % this.per) * NODE_CELLS + this.apron;
      out[i++] = (n.nz % this.per) * NODE_CELLS + this.apron;
      out[i++] = n.level;
      out[i++] = d.base;
      out[i++] = d.step;
      out[i++] = m0;
      out[i++] = m1;
    }
    if (!this.stats.firstDraw && choice.nodes.length) this.stats.firstDraw = performance.now() - this.started;
    this.objects.update(cam);
    return { instances: out, count: choice.nodes.length };
  }

  /** Tiles on the GPU, loaded, wanted. */
  get counts(): { gpu: number; cpu: number; wanted: number; inFlight: number; cpuBytes: number; gpuBytes: number } {
    let gpu = 0, cpu = 0;
    for (const t of this.tiles.values()) {
      if (t.uploaded) gpu++;
      if (t.data) cpu++;
    }
    return { gpu, cpu, wanted: this.wantQueue.length, inFlight: this.inFlight, cpuBytes: this.cpuBytes, gpuBytes: this.slots.length * this.side * this.side * 3 };
  }

  // ------------------------------------------------------------- heights

  /** The finest loaded height at (x, z), between its four samples; NaN where no level is loaded there. */
  heightAt(x: number, z: number, finest = 0): number {
    for (let l = finest; l < this.grid.levels; l++) {
      const h = this.heightAtLevel(x, z, l);
      if (!Number.isNaN(h)) return h;
    }
    return NaN;
  }

  private heightAtLevel(x: number, z: number, l: number): number {
    const lv = this.index.levels[l];
    const fx = (x - this.grid.origin[0]) / lv.spacing;
    const fz = (z - this.grid.origin[1]) / lv.spacing;
    if (!(fx >= 0 && fz >= 0 && fx <= lv.cells && fz <= lv.cells)) return NaN;
    const T = this.index.tile;
    const tx = Math.min(lv.tiles - 1, Math.floor(fx / T));
    const tz = Math.min(lv.tiles - 1, Math.floor(fz / T));
    const t = this.tiles.get(this.keyOf(l, tx, tz));
    if (!t?.data) return NaN;
    const d = t.data;
    const lx = fx - tx * T + this.apron;
    const lz = fz - tz * T + this.apron;
    const i0 = Math.min(Math.floor(lx), this.side - 2);
    const j0 = Math.min(Math.floor(lz), this.side - 2);
    const ax = lx - i0, az = lz - j0;
    const at = (i: number, j: number) => d.base + d.heights[j * this.side + i] * d.step;
    // The triangle the GPU draws: cells split from (i, j) to (i + 1, j + 1).
    const h00 = at(i0, j0), h11 = at(i0 + 1, j0 + 1);
    if (ax >= az) {
      const h10 = at(i0 + 1, j0);
      return h00 + (h10 - h00) * ax + (h11 - h10) * az;
    }
    const h01 = at(i0, j0 + 1);
    return h00 + (h11 - h01) * ax + (h01 - h00) * az;
  }

  /** Loads every tile of `level` over an area (at most `maxTiles`, else a coarser level); resolves with the level loaded. */
  async loadArea(minX: number, minZ: number, maxX: number, maxZ: number, level = 0, maxTiles = 1200): Promise<number> {
    let l = level;
    const span = (lv: number) => {
      const s = this.index.tile * this.index.levels[lv].spacing;
      const n = this.index.levels[lv].tiles;
      const c = (v: number, o: number) => Math.max(0, Math.min(n - 1, Math.floor((v - o) / s)));
      return [c(minX, this.grid.origin[0]), c(minZ, this.grid.origin[1]), c(maxX, this.grid.origin[0]), c(maxZ, this.grid.origin[1])];
    };
    while (l < this.grid.levels - 1) {
      const [a, b, c, d] = span(l);
      if ((c - a + 1) * (d - b + 1) <= maxTiles) break;
      l++;
    }
    const [a, b, c, d] = span(l);
    const todo: TileEntry[] = [];
    for (let tz = b; tz <= d; tz++) for (let tx = a; tx <= c; tx++) todo.push(this.entry(l, tx, tz));
    for (const t of todo) {
      while (this.inFlight >= IN_FLIGHT) await new Promise<void>((r) => this.waiters.push(r));
      if (this.disposed) return l;
      if (!t.data && !t.loading && !t.failed) void this.fetchTile(t);
    }
    while (todo.some((t) => t.loading)) await new Promise<void>((r) => this.waiters.push(r));
    return l;
  }

  /** Heights over an area as the ground check's grid (`groundFit.ts`): `cell` apart, or wider past `maxCells`. */
  async heightGrid(area: { minX: number; maxX: number; minZ: number; maxZ: number }, cell: number, maxCells = 4_000_000): Promise<HeightGrid | null> {
    const w = area.maxX - area.minX;
    const dz = area.maxZ - area.minZ;
    if (!(w > 0) || !(dz > 0)) return null;
    const size = Math.max(cell, Math.sqrt((w * dz) / maxCells));
    let level = 0;
    while (level < this.grid.levels - 1 && this.index.levels[level + 1].spacing <= size) level++;
    const got = await this.loadArea(area.minX, area.minZ, area.maxX, area.maxZ, level);
    const nx = Math.ceil(w / size) + 1;
    const nz = Math.ceil(dz / size) + 1;
    const h = new Float32Array(nx * nz);
    let until = performance.now() + 6;
    for (let j = 0; j < nz; j++) {
      // A few milliseconds at a time between frames.
      if (performance.now() > until) {
        await new Promise((r) => setTimeout(r, 0));
        until = performance.now() + 6;
      }
      for (let i = 0; i < nx; i++) h[j * nx + i] = this.heightAt(area.minX + i * size, area.minZ + j * size, got);
    }
    return { minX: area.minX, minZ: area.minZ, cell: size, nx, nz, h };
  }

  /**
   * Where a ray first meets the loaded ground: marched in steps of the finest
   * loaded spacing, refined by halving. Null when it does not within `far`.
   */
  raycast(origin: ArrayLike<number>, dir: ArrayLike<number>, far = 1e5): { t: number; point: [number, number, number] } | null {
    const step0 = this.index.spacing;
    // Only where the ray is over the terrain's box.
    const [x0, z0, x1, z1] = this.index.extent;
    let enter = 0;
    let leave = far;
    for (const [o, d, lo, hi] of [[origin[0], dir[0], x0, x1], [origin[2], dir[2], z0, z1]] as const) {
      if (Math.abs(d) < 1e-12) {
        if (o < lo || o > hi) return null;
        continue;
      }
      const a = (lo - o) / d, b = (hi - o) / d;
      enter = Math.max(enter, Math.min(a, b));
      leave = Math.min(leave, Math.max(a, b));
    }
    if (enter > leave) return null;
    let t = enter;
    let prev = t;
    let prevAbove = true;
    let first = true;
    while (t <= leave) {
      const x = origin[0] + dir[0] * t, y = origin[1] + dir[1] * t, z = origin[2] + dir[2] * t;
      const g = this.heightAt(x, z);
      const above = Number.isNaN(g) || y >= g;
      if (!first && prevAbove && !above) {
        let a = prev, b = t;
        for (let k = 0; k < 24; k++) {
          const m = (a + b) / 2;
          const gm = this.heightAt(origin[0] + dir[0] * m, origin[2] + dir[2] * m);
          if (Number.isNaN(gm) || origin[1] + dir[1] * m >= gm) a = m;
          else b = m;
        }
        return { t: b, point: [origin[0] + dir[0] * b, origin[1] + dir[1] * b, origin[2] + dir[2] * b] };
      }
      first = false;
      prevAbove = above;
      prev = t;
      // Steps grow with the distance (the ground there is drawn coarser too), never past 1/200 of it.
      t += Math.max(step0 * 0.5, t * 0.005);
    }
    return null;
  }

  // ------------------------------------------------------------- objects

  /** For `ObjectCells`. */
  readRange(offset: number, length: number): Promise<ArrayBuffer> {
    return this.reader.range(offset, length);
  }

  get gone(): boolean {
    return this.disposed;
  }

  /** Something new to draw. */
  changed(): void {
    this.version++;
    this.onChange?.();
  }
}

/**
 * The placed objects round the camera: the cells within reach (and within the
 * box budget, nearest first) read and built into world tiles in a worker, the
 * rest let go; the sea as one more tile.
 */
let streams = 0;

class ObjectCells {
  /** This stream's tiles' prefix: two streams of one map never take each other's. */
  private readonly prefix = `terrain:${++streams}:`;
  private worker: Worker | null = null;
  private readonly built = new Map<string, WorldTile>();
  private readonly loading = new Set<string>();
  private lastAt: [number, number, number] | null = null;
  private readonly water: WorldTile | null;
  private published = '';

  constructor(private readonly s: TerrainStream) {
    const ix = s.index;
    this.water = ix.water ? waterTile(`${this.prefix}water`, ix.extent, ix.water.y) : null;
    this.publish();
  }

  dispose(): void {
    this.worker?.terminate();
    this.worker = null;
    this.built.clear();
    // Only what this stream put there: the next level's may be in already.
    if (worldTiles.tiles.some((t) => t.id.startsWith(this.prefix))) worldTiles.clear();
  }

  private ensureWorker(): Worker | null {
    if (this.worker || typeof Worker === 'undefined' || !this.s.index.instances) return this.worker;
    this.worker = new Worker(new URL('./terrainObjectsWorker.ts', import.meta.url), { type: 'module' });
    this.worker.postMessage({ kind: 'models', models: this.s.index.instances.models } satisfies ObjectsWorkerRequest);
    this.worker.onmessage = (e: MessageEvent<WorldTile>) => {
      const tile = e.data;
      this.loading.delete(tile.id);
      if (this.s.gone || !this.wanted.has(tile.id)) return;
      this.built.set(tile.id, tile);
      this.publish();
    };
    return this.worker;
  }

  private wanted = new Set<string>();

  update(cam: [number, number, number]): void {
    const inst = this.s.index.instances;
    if (!inst) return;
    // Every 50 m the camera moves, not every frame.
    if (this.lastAt && Math.hypot(cam[0] - this.lastAt[0], cam[1] - this.lastAt[1], cam[2] - this.lastAt[2]) < 50) return;
    this.lastAt = cam;
    const ground = this.s.heightAt(cam[0], cam[2]);
    const above = Number.isNaN(ground) ? 0 : Math.max(0, cam[1] - ground);
    const reach = Math.min(OBJECT_REACH_MAX, Math.max(OBJECT_REACH, above * 2));
    const cells = inst.index
      .map(([cx, cz, off, count]) => {
        const x = inst.origin[0] + (cx + 0.5) * inst.cell;
        const z = inst.origin[1] + (cz + 0.5) * inst.cell;
        const d = Math.max(0, Math.hypot(x - cam[0], z - cam[2]) - inst.cell * 0.71);
        return { id: `${this.prefix}obj:${cx},${cz}`, off, count, d };
      })
      .filter((c) => c.d <= reach)
      .sort((a, b) => a.d - b.d);
    const next = new Set<string>();
    let boxes = 0;
    for (const c of cells) {
      if (boxes + c.count > OBJECT_BOXES && next.size) break;
      boxes += c.count;
      next.add(c.id);
      if (!this.built.has(c.id) && !this.loading.has(c.id)) void this.load(c.id, c.off, c.count);
    }
    this.wanted = next;
    let dropped = false;
    for (const id of [...this.built.keys()]) {
      if (!next.has(id)) {
        this.built.delete(id);
        dropped = true;
      }
    }
    if (dropped) this.publish();
  }

  private async load(id: string, off: number, count: number): Promise<void> {
    const w = this.ensureWorker();
    if (!w) return;
    this.loading.add(id);
    try {
      const buf = await this.s.readRange(off, count * RECORD_BYTES);
      if (this.s.gone || !this.wanted.has(id)) {
        this.loading.delete(id);
        return;
      }
      w.postMessage({ kind: 'build', id, records: buf, count } satisfies ObjectsWorkerRequest, [buf]);
    } catch {
      this.loading.delete(id);
    }
  }

  private publish(): void {
    const tiles = [...(this.water ? [this.water] : []), ...this.built.values()];
    const key = tiles.map((t) => t.id).join('|');
    if (key === this.published) return;
    this.published = key;
    worldTiles.replace(tiles);
    this.s.stats.objectCells = this.built.size;
    this.s.stats.boxes = [...this.built.values()].reduce((n, t) => n + t.structureIndices.length / 36, 0);
    this.s.changed();
  }
}
