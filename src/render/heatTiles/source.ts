/**
 * Heat from a tile pyramid instead of rows (Stage 6): what the engine draws
 * when the data is too large to load or lives on a session's host. The host
 * builds the pyramid once per filter hash; this asks for the tiles the view
 * needs, coarse first, then finer about the camera, within a byte budget per
 * second, and keeps the decoded ones in a bounded cache. A tile not here yet
 * is drawn from its nearest ancestor that is.
 */

import { selectTiles, tileWorldRect, type LodView, type PyramidFrame, type TilePlacement, type TileRef } from './lod';
import { decodeTile, tileId, tileKey, tileOf, TILE, type DecodedTile } from './tileFormat';

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
  /** World X / Z rectangle drawn. */
  rect: [number, number, number, number];
  /** The part of the tile's texture over `rect` (an ancestor drawn for a missing tile). */
  uv: [number, number, number, number];
  /** 1 / a cell's world area: counts to density. */
  perCount: number;
  estimate: boolean;
}

export interface HeatTileDraw {
  tiles: HeatTileDrawTile[];
  ground: number;
  /** Changes whenever anything drawn changes. */
  version: number;
  /** Heat per unit density (the engine's kernel area times the frame's weight); set by the engine. */
  scale: number;
}

export interface HeatTileOptions {
  /** Bytes per second the source may ask for. */
  bytesPerSecond?: number;
  /** Decoded tiles kept (256 KB each). */
  maxCached?: number;
  maxTiles?: number;
  /** A cell this many pixels before a finer level is wanted. */
  cellPx?: number;
}

interface Cached {
  tile: DecodedTile;
  used: number;
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
  };
  private readonly cache = new Map<string, Cached>();
  private readonly empty = new Set<string>();
  private readonly wanted: TileRef[] = [];
  private inFlight = 0;
  private tokens: number;
  private lastRefill = performance.now();
  private clock = 0;
  private disposed = false;
  private polling: ReturnType<typeof setTimeout> | null = null;
  private pumpTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly opts: Required<HeatTileOptions>;

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

  /** What to draw for this view; asks for what is missing. */
  frame(view: LodView): HeatTileDraw | null {
    const info = this.info;
    if (!info || !info.key || info.size <= 0) return null;
    const readable = info.complete ? info.leafLevel : info.estimateLevels - 1;
    if (readable < 0)
      return {
        tiles: [],
        ground: this.placement.ground,
        version: this.version,
        scale: 0,
      };
    const frame: PyramidFrame = { ...info, leafLevel: readable };
    const want = selectTiles(frame, this.placement, {
      ...view,
      cellPx: this.opts.cellPx,
      maxTiles: this.opts.maxTiles,
    });
    const tiles: HeatTileDrawTile[] = [];
    this.wanted.length = 0;
    const now = ++this.clock;
    for (const t of want) {
      const k = tileKey(t.level, t.x, t.y);
      if (this.empty.has(k)) continue;
      const hit = this.cache.get(k);
      if (hit) {
        hit.used = now;
        tiles.push(this.drawOf(info, t, hit.tile, [0, 0, 1, 1]));
        continue;
      }
      this.wanted.push(t);
      // Meanwhile: the nearest ancestor we have, the part over this tile.
      for (let l = t.level - 1; l >= 0; l--) {
        const d = t.level - l;
        const ax = t.x >> d;
        const ay = t.y >> d;
        const ak = tileKey(l, ax, ay);
        if (this.empty.has(ak)) break;
        const a = this.cache.get(ak);
        if (!a) continue;
        a.used = now;
        const f = 1 / (1 << d);
        const ou = (t.x - (ax << d)) * f;
        const ov = (t.y - (ay << d)) * f;
        tiles.push(this.drawOf(info, t, a.tile, [ou, ov, ou + f, ov + f]));
        break;
      }
    }
    if (this.wanted.length > 0) this.pump();
    return {
      tiles,
      ground: this.placement.ground,
      version: this.version,
      scale: 0,
    };
  }

  private drawOf(info: PyramidInfo, t: TileRef, tile: DecodedTile, uv: [number, number, number, number]): HeatTileDrawTile {
    const cell = info.size / (1 << tile.level) / TILE;
    const area = Math.abs(cell * cell * this.placement.sx * this.placement.sz);
    // The data's v grows along world Z by sz; texture rows grow along v. A flip is the rect's.
    const rect = tileWorldRect(info, this.placement, t);
    let [u0, v0, u1, v1] = uv;
    if (this.placement.sx < 0) [u0, u1] = [u1, u0];
    if (this.placement.sz < 0) [v0, v1] = [v1, v0];
    return {
      key: tileKey(tile.level, tile.x, tile.y),
      counts: tile.counts,
      rect,
      uv: [u0, v0, u1, v1],
      perCount: area > 0 ? 1 / area : 0,
      estimate: tile.estimate,
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
    const ids = this.wanted.slice(0, 64).map((t) => tileId(t.level, t.x, t.y));
    if (ids.length === 0) return;
    this.wanted.length = 0;
    const budget = Math.floor(Math.min(this.tokens, 4 << 20));
    this.inFlight++;
    this.stats.requests++;
    const key = info.key;
    this.transport
      .read(key, ids, budget)
      .then((batch) => {
        if (this.disposed || this.info?.key !== key) return;
        let got = 0;
        for (const t of batch.tiles) {
          got += t.bytes.length;
          const tile = decodeTile(t.bytes);
          this.cache.set(tileKey(tile.level, tile.x, tile.y), {
            tile,
            used: this.clock,
          });
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
