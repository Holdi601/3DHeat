/**
 * Heat from a tile pyramid instead of rows (Stage 6): what the engine draws
 * when the data is too large to load or lives on a session's host. The host
 * builds the pyramid once per filter hash; this asks for the tiles the view
 * needs, coarse first, then finer about the camera, within a byte budget per
 * second, and keeps the decoded ones in a bounded cache. A tile not here yet
 * is drawn from its nearest ancestor that is.
 */

import { groundRect, kernelRadius, rectDepths, selectTiles, tileWorldRect, type LodView, type PyramidFrame, type SpriteSize, type TilePlacement, type TileRef } from './lod';
import { decodeTile, tileId, tileKey, tileOf, TILE, type ChannelWeights, type DecodedTile } from './tileFormat';

export interface PyramidInfo extends PyramidFrame {
  key: string;
  complete: boolean;
  /** While building: levels 0..estimateLevels-1 readable (estimates). */
  estimateLevels: number;
  levelMax: number[];
  rowsCounted: number;
  fraction: number;
  how: string;
  error: string;
  /** The split column's value of each channel (one empty name without a split). */
  channelNames?: string[];
  /** The last channel holds the split's rows of any other value (or none); its name is empty. */
  otherChannel?: boolean;
}

export interface TileBatch {
  tiles: { id: bigint; bytes: Uint8Array; estimate: boolean }[];
  empty: bigint[];
  pending: bigint[];
  deferred: bigint[];
}

/** How the source reaches the host (the core's protocol, `heatTileTransport`). */
export interface TileTransport {
  query(): Promise<PyramidInfo>;
  read(key: string, ids: bigint[], budgetBytes: number): Promise<TileBatch>;
}

export interface HeatTileDrawTile {
  key: string;
  counts: Float32Array;
  /** Four-component weights: (heat, a, b, L) as half floats, times `amp` (tileFormat.ts `DecodedTile.rgba`). */
  rgba: Uint16Array | null;
  amp: number;
  /** World X / Z rectangle drawn. */
  rect: [number, number, number, number];
  /** The part of the tile's texture over `rect` (an ancestor drawn for a missing tile). */
  uv: [number, number, number, number];
  /** 1 / a cell's world area: counts to density. */
  perCount: number;
  /** A drawn cell's world size. */
  cell: number;
  /** How far past `rect` the tile's cells reach when drawn with the kernel (world units; 0 without one). */
  reach: number;
  estimate: boolean;
  /** The level whose cells are drawn. */
  level: number;
}

export interface HeatTileDraw {
  tiles: HeatTileDrawTile[];
  ground: number;
  /** Changes whenever anything drawn changes. */
  version: number;
  /**
   * Heat per count (the frame's weight), or per unit density without
   * `kernel` (times the kernel's area); set by the engine.
   */
  scale: number;
  /**
   * The sprite the cells are drawn with, as the rows' splat draws one (a
   * cell's count at its centre, spread by the sprite's ramp): heat that looks
   * like the rows' at any zoom where the cells are finer than the sprite.
   * Null draws the cells as density, bilinear.
   */
  kernel: TileKernel | null;
  /** 4: the tiles carry (heat, a, b, L) for team colours (`rgba`); 1: heat only. */
  components: 1 | 4;
  /** Tiles still being weighed anew (the channel weights changed): draw again soon. */
  weighing: boolean;
  /**
   * Where rows draw instead (`rowWindow.ts`): world X / Z min, max; the cells
   * whose centre lies inside weigh `holeWeight` (0 once the rows have faded in).
   * Set by the engine each frame.
   */
  hole: [number, number, number, number] | null;
  holeWeight: number;
  /** The pyramid's key, and the weights its channels are drawn with: the native viewport decodes the tiles itself. */
  pyramid: string;
  weights: ChannelWeights | null;
}

/**
 * The rows that stand in for the tiles in part of the view (`rowWindow.ts`),
 * as the engine fades between them: `dataset` is the store's rows of `rect`.
 */
export interface TileRowWindow {
  /** World X / Z min, max: leaf cells' edges. */
  rect: [number, number, number, number];
  dataset: object;
  /** Fading the rows in, or out again. */
  dir: 'in' | 'out';
  /** When the fade began (performance.now()); -1 until the rows are on the GPU. */
  t0: number;
  /** The fade is over (the engine sets it). */
  done: boolean;
}

/** How long a fade between tiles and rows takes. */
export const ROW_FADE_MS = 300;

const NO_HOLE = [1e9, 1e9, -1e9, -1e9];

/** The hole over a drawn tile in its texture's cells (min, max; empty when none): what the passes test cell centres against. */
export function holeTexels(t: Pick<HeatTileDrawTile, 'rect' | 'uv'>, hole: readonly number[] | null): number[] {
  if (!hole) return NO_HOLE;
  const [x0, z0, x1, z1] = t.rect;
  const [u0, v0, u1, v1] = t.uv;
  const tu = (x: number) => (u0 + ((x - x0) / (x1 - x0 || 1)) * (u1 - u0)) * TILE;
  const tv = (z: number) => (v0 + ((z - z0) / (z1 - z0 || 1)) * (v1 - v0)) * TILE;
  const a = tu(hole[0]);
  const b = tu(hole[2]);
  const c = tv(hole[1]);
  const d = tv(hole[3]);
  return [Math.min(a, b), Math.min(c, d), Math.max(a, b), Math.max(c, d)];
}

/** The rows' sprite for the tile draw (`webgpu/heatTilesPass.ts`). */
export interface TileKernel extends SpriteSize {
  pxPerUnit: number;
  perspective: boolean;
  centre: number;
  edge: number;
  falloff: number;
  smoothRamp: boolean;
  /** Keep each sprite's heat when the pixel clamp resizes it (the rows' `zoomInvariant`). */
  keepMass: boolean;
  /** The ramp's custom curve (`state/curve.ts` LUT, centre first) in place of falloff/smooth; null: none. */
  curve?: Float32Array | null;
  /** Changes when `curve`'s values do (the LUT is reused in place). */
  curveKey?: string;
}

/** A drawn cell's sprite at least this many cells wide: past the leaf, cells are smooth blobs, not dots. */
export const KERNEL_MIN_CELLS = 1.25;

export interface HeatTileOptions {
  /** Bytes per second the source may ask for. */
  bytesPerSecond?: number;
  /** Decoded tiles kept (256 KB each). */
  maxCached?: number;
  maxTiles?: number;
  /** A cell this many pixels before a finer level is wanted. */
  cellPx?: number;
  decoder?: TileDecoder;
}

/** Tiles decoded off the main thread where workers exist (the page), in place otherwise (tests). */
export type TileDecoder = (tiles: Uint8Array[], weights: ChannelWeights | null) => Promise<(DecodedTile | null)[]>;

function workerDecoder(): TileDecoder {
  if (typeof Worker === 'undefined') return async (tiles, weights) => tiles.map((b) => decodeTile(b, weights));
  const worker = new Worker(new URL('./decodeWorker.ts', import.meta.url), { type: 'module' });
  const waiting = new Map<number, (t: (DecodedTile | null)[]) => void>();
  let seq = 0;
  worker.onmessage = (e: MessageEvent<{ seq: number; tiles: (DecodedTile | null)[] }>) => {
    waiting.get(e.data.seq)?.(e.data.tiles);
    waiting.delete(e.data.seq);
  };
  return (tiles, weights) =>
    new Promise((resolve) => {
      const n = ++seq;
      waiting.set(n, resolve);
      // Copied, not transferred: the bytes may be views into a larger reply, or kept to weigh again.
      worker.postMessage({ seq: n, tiles: tiles.map((b) => b.slice()), weights });
    });
}

interface Cached {
  tile: DecodedTile;
  used: number;
  /** A split tile's bytes, to weigh its channels again when the weights change. */
  bytes: Uint8Array | null;
  /** The weights `tile` was decoded with ('' summed). */
  wkey: string;
}

export class HeatTileSource {
  info: PyramidInfo | null = null;
  version = 0;
  /** Bytes received, tiles decoded: for the readout and the probes. */
  stats = {
    bytes: 0,
    tiles: 0,
    requests: 0,
    firstTileMs: -1,
    startedAt: performance.now(),
    /** The finest level the last frame drew (-1: none). */
    drawnLevel: -1,
    /**
     * With a kernel: the fewest cells per sprite radius among the tiles the last
     * frame drew (where each is nearest the eye); Infinity without. Under
     * `KERNEL_CELLS` the cells are coarser than the sprite: rows would show more.
     */
    radiusCells: Infinity,
    /** The ground the last frame showed (world X / Z min, max), within the pyramid's square; null: to the horizon. */
    viewRect: null as [number, number, number, number] | null,
  };
  /** Rows drawn in part of the view instead of tiles (`rowWindow.ts`); null: tiles alone. */
  window: TileRowWindow | null = null;
  private readonly cache = new Map<string, Cached>();
  private readonly empty = new Set<string>();
  private readonly wanted: TileRef[] = [];
  private inFlight = 0;
  /** Tiles asked for and not answered yet: never asked twice at once. */
  private readonly asked = new Set<string>();
  private tokens: number;
  private lastRefill = performance.now();
  private clock = 0;
  private disposed = false;
  private polling: ReturnType<typeof setTimeout> | null = null;
  private pumpTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly opts: Required<Omit<HeatTileOptions, 'decoder'>>;
  private readonly decode: TileDecoder;
  private weights: ChannelWeights | null = null;
  private weighing = false;
  private readonly stale: string[] = [];

  constructor(
    private readonly transport: TileTransport,
    readonly placement: TilePlacement,
    options: HeatTileOptions = {},
    private readonly onChange: () => void = () => {},
  ) {
    this.opts = {
      bytesPerSecond: 16e6,
      maxCached: 384,
      maxTiles: 160,
      cellPx: 1.5,
      ...options,
    };
    this.tokens = this.opts.bytesPerSecond * 0.5;
    this.decode = options.decoder ?? workerDecoder();
  }

  /**
   * How the channels of a split pyramid are drawn (null: summed). Tiles
   * decoded with other weights are weighed again in the decoder a batch at a
   * time and drawn with their old weights meanwhile (not at all when the
   * component count changed).
   */
  setChannelWeights(w: ChannelWeights | null): void {
    if ((w?.key ?? '') === (this.weights?.key ?? '')) return;
    this.weights = w;
    this.bump();
  }

  /** Asks the host for the pyramid and keeps asking while it builds. */
  start(): void {
    void this.poll();
  }

  dispose(): void {
    this.disposed = true;
    if (this.polling) clearTimeout(this.polling);
    if (this.pumpTimer) clearTimeout(this.pumpTimer);
    this.cache.clear();
  }

  private async poll(): Promise<void> {
    if (this.disposed) return;
    let next: PyramidInfo;
    try {
      next = await this.transport.query();
    } catch (err) {
      this.info = {
        ...(this.info ?? {
          key: '',
          x0: 0,
          y0: 0,
          size: 1,
          leafLevel: 0,
          complete: false,
          estimateLevels: 0,
          levelMax: [],
          rowsCounted: 0,
          fraction: 0,
          how: '',
        }),
        error: String(err),
      } as PyramidInfo;
      this.onChange();
      return;
    }
    if (this.disposed) return;
    const prev = this.info;
    this.info = next;
    // The estimate replaced by the real thing (or another key): drop what was drawn from the estimate.
    if (!prev || prev.key !== next.key || (next.complete && !prev.complete)) {
      if (prev && prev.key === next.key) {
        for (const [k, c] of this.cache) if (c.tile.estimate) this.cache.delete(k);
      } else {
        this.cache.clear();
      }
      this.empty.clear();
      this.bump();
    } else if (next.estimateLevels !== prev.estimateLevels) {
      this.bump();
    }
    if (!next.complete && !next.error) this.polling = setTimeout(() => void this.poll(), 150);
  }

  private bump(): void {
    this.version++;
    this.onChange();
  }

  /** What to draw for this view; asks for what is missing. With `kernel` the tiles are drawn as the rows' sprites (see `HeatTileDraw.kernel`). */
  frame(view: LodView, kernel: TileKernel | null = null): HeatTileDraw | null {
    const info = this.info;
    if (!info || !info.key || info.size <= 0) return null;
    const readable = info.complete ? info.leafLevel : info.estimateLevels - 1;
    if (readable < 0)
      return {
        tiles: [],
        ground: this.placement.ground,
        version: this.version,
        scale: 0,
        kernel,
        components: this.weights?.components ?? 1,
        weighing: false,
        hole: null,
        holeWeight: 1,
        pyramid: info.key,
        weights: this.weights,
      };
    const frame: PyramidFrame = { ...info, leafLevel: readable };
    const ground = groundRect(view.viewProj, this.placement.ground);
    const square = tileWorldRect(info, this.placement, { level: 0, x: 0, y: 0 });
    this.stats.viewRect = ground && [Math.max(ground[0], square[0]), Math.max(ground[1], square[1]), Math.min(ground[2], square[2]), Math.min(ground[3], square[3])];
    const lod: LodView = {
      ...view,
      cellPx: this.opts.cellPx,
      maxTiles: this.opts.maxTiles,
      kernel: kernel ?? undefined,
    };
    const want = selectTiles(frame, this.placement, lod);
    const tiles: HeatTileDrawTile[] = [];
    this.wanted.length = 0;
    this.stale.length = 0;
    this.stats.radiusCells = Infinity;
    const now = ++this.clock;
    const wkey = this.weights?.key ?? '';
    const components = this.weights?.components ?? 1;
    /** Whether a cached tile can be drawn now; queues it to be weighed anew when its weights are old. */
    const usable = (k: string, c: Cached): boolean => {
      if (c.wkey !== wkey && c.bytes) this.stale.push(k);
      return !c.tile.rgba === (components === 1);
    };
    for (const t of want) {
      const k = tileKey(t.level, t.x, t.y);
      if (this.empty.has(k)) continue;
      const hit = this.cache.get(k);
      if (hit) {
        hit.used = now;
        if (usable(k, hit)) {
          tiles.push(this.drawOf(info, t, hit.tile, [0, 0, 1, 1], lod, kernel));
          continue;
        }
      }
      if (!hit && !this.asked.has(k)) this.wanted.push(t);
      // Meanwhile: the nearest ancestor we have, the part over this tile.
      for (let l = t.level - 1; l >= 0; l--) {
        const d = t.level - l;
        const ax = t.x >> d;
        const ay = t.y >> d;
        const ak = tileKey(l, ax, ay);
        if (this.empty.has(ak)) break;
        const a = this.cache.get(ak);
        if (!a || !usable(ak, a)) continue;
        a.used = now;
        const f = 1 / (1 << d);
        const ou = (t.x - (ax << d)) * f;
        const ov = (t.y - (ay << d)) * f;
        tiles.push(this.drawOf(info, t, a.tile, [ou, ov, ou + f, ov + f], lod, kernel));
        break;
      }
    }
    if (this.wanted.length > 0) this.pump();
    if (this.stale.length > 0) this.weigh();
    let finest = -1;
    for (const d of tiles) finest = Math.max(finest, d.level);
    this.stats.drawnLevel = finest;
    return {
      tiles,
      ground: this.placement.ground,
      version: this.version,
      scale: 0,
      kernel,
      components,
      weighing: this.stale.length > 0,
      hole: null,
      holeWeight: 1,
      pyramid: info.key,
      weights: this.weights,
    };
  }

  /**
   * About how many rows lie in `rect` (world X / Z min, max): the finest level
   * whose tiles over it are all here, each tile's rows by the share of it the
   * rectangle covers. Null when not even the root is here.
   */
  rowsIn(rect: readonly number[]): number | null {
    const info = this.info;
    if (!info || !info.key) return null;
    const top = info.complete ? info.leafLevel : info.estimateLevels - 1;
    for (let l = top; l >= 0; l--) {
      const side = 1 << l;
      const s = info.size / side;
      // The tiles over the rectangle in data (u, v): back from world by the placement.
      const u = [rect[0] / this.placement.sx, rect[2] / this.placement.sx].sort((a, b) => a - b);
      const v = [rect[1] / this.placement.sz, rect[3] / this.placement.sz].sort((a, b) => a - b);
      const tx0 = Math.max(0, Math.floor((u[0] - info.x0) / s));
      const tx1 = Math.min(side - 1, Math.floor((u[1] - info.x0) / s));
      const ty0 = Math.max(0, Math.floor((v[0] - info.y0) / s));
      const ty1 = Math.min(side - 1, Math.floor((v[1] - info.y0) / s));
      if ((tx1 - tx0 + 1) * (ty1 - ty0 + 1) > 256) continue;
      let sum = 0;
      let all = true;
      for (let ty = ty0; ty <= ty1 && all; ty++) {
        for (let tx = tx0; tx <= tx1; tx++) {
          const k = tileKey(l, tx, ty);
          if (this.empty.has(k)) continue;
          const c = this.cache.get(k);
          if (!c) {
            all = false;
            break;
          }
          const ou = Math.max(0, Math.min(u[1], info.x0 + (tx + 1) * s) - Math.max(u[0], info.x0 + tx * s));
          const ov = Math.max(0, Math.min(v[1], info.y0 + (ty + 1) * s) - Math.max(v[0], info.y0 + ty * s));
          sum += (c.tile.rows * ou * ov) / (s * s);
        }
      }
      if (all) return sum;
    }
    return null;
  }

  /** Weighs a batch of the tiles the last frame found with old weights. */
  private weigh(): void {
    if (this.weighing || this.disposed) return;
    const keys = [...new Set(this.stale)].slice(0, 24);
    const entries = keys.map((k) => this.cache.get(k)).filter((c): c is Cached => !!c?.bytes);
    if (entries.length === 0) return;
    const weights = this.weights;
    const key = this.info?.key;
    this.weighing = true;
    void this.decode(
      entries.map((c) => c.bytes!),
      weights,
    )
      .then((tiles) => {
        if (this.disposed || this.info?.key !== key) return;
        tiles.forEach((tile, i) => {
          if (!tile) return;
          entries[i].tile = tile;
          entries[i].wkey = weights?.key ?? '';
        });
        this.bump();
      })
      .catch(() => {})
      .finally(() => {
        this.weighing = false;
      });
  }

  private drawOf(info: PyramidInfo, t: TileRef, tile: DecodedTile, uv: [number, number, number, number], view: LodView, kernel: TileKernel | null): HeatTileDrawTile {
    const cell = info.size / (1 << tile.level) / TILE;
    const area = Math.abs(cell * cell * this.placement.sx * this.placement.sz);
    const cellWorld = Math.sqrt(area);
    // The data's v grows along world Z by sz; texture rows grow along v. A flip is the rect's.
    const rect = tileWorldRect(info, this.placement, t);
    let [u0, v0, u1, v1] = uv;
    if (this.placement.sx < 0) [u0, u1] = [u1, u0];
    if (this.placement.sz < 0) [v0, v1] = [v1, v0];
    let reach = 0;
    if (kernel) {
      // The widest sprite over the tile: the clamp to a least pixel radius widens it with distance.
      const [near, far] = rectDepths(rect, this.placement.ground, view);
      const rNear = kernelRadius(kernel, kernel.pxPerUnit, kernel.perspective, near);
      reach = Math.max(rNear, kernelRadius(kernel, kernel.pxPerUnit, kernel.perspective, far), KERNEL_MIN_CELLS * cellWorld);
      if (cellWorld > 0) this.stats.radiusCells = Math.min(this.stats.radiusCells, rNear / cellWorld);
    }
    return {
      key: tileKey(tile.level, tile.x, tile.y),
      counts: tile.counts,
      rgba: tile.rgba ?? null,
      amp: tile.amp ?? 1,
      rect,
      uv: [u0, v0, u1, v1],
      perCount: area > 0 ? 1 / area : 0,
      cell: cellWorld,
      reach,
      estimate: tile.estimate,
      level: tile.level,
    };
  }

  /** Requests what the last frame lacked, coarse first, within the byte budget. */
  private pump(): void {
    const info = this.info;
    if (!info || this.disposed || this.inFlight >= 2 || this.pumpTimer) return;
    const now = performance.now();
    this.tokens = Math.min(this.opts.bytesPerSecond * 0.5, this.tokens + ((now - this.lastRefill) / 1000) * this.opts.bytesPerSecond);
    this.lastRefill = now;
    if (this.tokens < 64 * 1024) {
      // Over the budget: wait for it to refill.
      this.pumpTimer = setTimeout(
        () => {
          this.pumpTimer = null;
          this.pump();
        },
        Math.ceil(((64 * 1024 - this.tokens) / this.opts.bytesPerSecond) * 1000),
      );
      return;
    }
    const take = this.wanted.slice(0, 64);
    const keys = take.map((t) => tileKey(t.level, t.x, t.y));
    for (const k of keys) this.asked.add(k);
    const ids = take.map((t) => tileId(t.level, t.x, t.y));
    if (ids.length === 0) return;
    this.wanted.length = 0;
    const budget = Math.floor(Math.min(this.tokens, 4 << 20));
    this.inFlight++;
    this.stats.requests++;
    const key = info.key;
    this.transport
      .read(key, ids, budget)
      .then(async (batch) => {
        if (this.disposed || this.info?.key !== key) return;
        let got = 0;
        for (const t of batch.tiles) got += t.bytes.length;
        const weights = this.weights;
        const decoded = await this.decode(
          batch.tiles.map((t) => t.bytes),
          weights,
        );
        if (this.disposed || this.info?.key !== key) return;
        for (let i = 0; i < decoded.length; i++) {
          const tile = decoded[i];
          if (!tile) continue;
          // A split tile keeps its bytes (a copy: they may be a view into the reply) to be weighed again.
          const bytes = tile.channels > 1 ? batch.tiles[i].bytes.slice() : null;
          this.cache.set(tileKey(tile.level, tile.x, tile.y), { tile, used: this.clock, bytes, wkey: weights?.key ?? '' });
          this.stats.tiles++;
        }
        for (const id of batch.empty) {
          const t = tileOf(id);
          this.empty.add(tileKey(t.level, t.x, t.y));
        }
        this.tokens -= got;
        this.stats.bytes += got;
        if (this.stats.firstTileMs < 0 && batch.tiles.length > 0) this.stats.firstTileMs = performance.now() - this.stats.startedAt;
        this.evict();
        if (batch.tiles.length > 0 || batch.empty.length > 0) this.bump();
        // Over the reply's budget: another frame asks for them again.
        else if (batch.deferred.length > 0) this.onChange();
      })
      .catch(() => {})
      .finally(() => {
        this.inFlight--;
        for (const k of keys) this.asked.delete(k);
      });
  }

  private evict(): void {
    const over = this.cache.size - this.opts.maxCached;
    if (over <= 0) return;
    const byAge = [...this.cache.entries()].sort((a, b) => a[1].used - b[1].used);
    for (let i = 0; i < over; i++) this.cache.delete(byAge[i][0]);
  }

  cachedTiles(): number {
    return this.cache.size;
  }
}
