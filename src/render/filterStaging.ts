/**
 * Filter columns on their way to the GPU, a slice a frame, and the filters the
 * heat draws meanwhile.
 *
 * A filter needs its column on the GPU for every chunk before the heat can test
 * it. Uploaded all in the frame the filter was applied, that was a frame of
 * hundreds of milliseconds at 200 million rows. Here the uploads run for a few
 * milliseconds a frame instead, and until every chunk's column is there the
 * heat keeps drawing the previous filters - the last set that was complete. It
 * changes to the new set in one frame, so the picture never builds up from a
 * mix of chunks filtered one way and chunks filtered the other.
 *
 * Shared by both renderers; what a column is on the GPU (a texture, a buffer)
 * and how a slice is written are theirs (`StageOps`).
 */
import type { ActiveFilter } from './types';

/** What a renderer does for the stager. Rows are a chunk's own, from 0. */
export interface StageOps<T> {
  /** Chunks drawn now. */
  chunkCount(): number;
  chunkRows(chunk: number): number;
  /** Whether the chunk's column is on the GPU already. */
  resident(chunk: number, column: string): boolean;
  /** The column's rows in the dataset, or null when it has none (nothing to upload). */
  source(column: string): ArrayLike<number> | null;
  /** Take the column's bytes from the GPU budget; false when they do not fit. */
  reserve(chunk: number, column: string): boolean;
  /** Make the GPU resource, written later. */
  allocate(chunk: number, column: string): T;
  /** Write rows [from, to) of the chunk's column. */
  write(res: T, chunk: number, src: ArrayLike<number>, from: number, to: number): void;
  /** The column is all there: the renderer keeps it as resident. */
  land(chunk: number, column: string, res: T): void;
  /** Given up: free the resource, if made, and the reserved bytes. */
  discard(chunk: number, column: string, res: T | null): void;
}

interface Fill<T> {
  chunk: number;
  column: string;
  res: T | null;
  /** Rows written so far. */
  cursor: number;
  rows: number;
}

/** Milliseconds a frame for filter uploads. */
export const FILTER_UPLOAD_MS = 3;

/** Whether two filter lists select the same rows. */
export function sameFilters(a: readonly ActiveFilter[], b: readonly ActiveFilter[]): boolean {
  return a.length === b.length && a.every((f, i) => f.key === b[i].key);
}

export class FilterStaging<T> {
  /** The filters the heat draws: the last set whose columns were all on the GPU. */
  private shown: ActiveFilter[] = [];
  private fills = new Map<string, Fill<T>>();
  /** Columns the requested filters need: never evicted to make room for others. */
  readonly columns = new Set<string>();
  /** Chunk columns that did not fit the budget for this request: drawn without that filter, as before. */
  private noRoom = new Set<string>();
  private requestKey = '';
  private chunksSeen = -1;
  /** Whether the heat is still drawing older filters than the ones asked for. */
  pending = false;

  /** Whether a column is in use - asked for, or drawn meanwhile - and so must not be evicted for room. */
  keeps(column: string): boolean {
    return this.columns.has(column) || this.shown.some((f) => f.column === column);
  }

  /** A new dataset: nothing staged, nothing shown. */
  reset(ops: StageOps<T> | null): void {
    if (ops) for (const f of this.fills.values()) ops.discard(f.chunk, f.column, f.res);
    this.fills.clear();
    this.shown = [];
    this.columns.clear();
    this.noRoom.clear();
    this.requestKey = '';
    this.chunksSeen = -1;
    this.pending = false;
  }

  /**
   * The filters this frame draws, given the ones asked for, after this frame's
   * share of uploads (`budgetMs`).
   */
  choose(requested: ActiveFilter[], ops: StageOps<T>, budgetMs = FILTER_UPLOAD_MS, now: () => number = () => performance.now()): ActiveFilter[] {
    const key = requested.map((f) => f.key).join(';');
    const chunks = ops.chunkCount();
    if (key === this.requestKey && chunks === this.chunksSeen && this.fills.size === 0) {
      this.pending = false;
      return (this.shown = requested);
    }
    if (key !== this.requestKey) {
      this.requestKey = key;
      this.noRoom.clear();
      this.columns.clear();
      for (const f of requested) this.columns.add(f.column);
      // Columns no longer asked for stop where they are.
      for (const [k, f] of this.fills) {
        if (this.columns.has(f.column)) continue;
        ops.discard(f.chunk, f.column, f.res);
        this.fills.delete(k);
      }
    }
    this.chunksSeen = chunks;
    if (requested.length === 0 || this.queue(requested, ops)) {
      this.pending = false;
      return (this.shown = requested);
    }
    this.flush(ops, now() + budgetMs, now);
    if (this.fills.size === 0) {
      this.pending = false;
      return (this.shown = requested);
    }
    this.pending = true;
    return this.shown;
  }

  /** Queue what is missing; true when nothing is. */
  private queue(requested: ActiveFilter[], ops: StageOps<T>): boolean {
    const chunks = ops.chunkCount();
    for (const f of requested) {
      if (!ops.source(f.column)) continue;
      for (let c = 0; c < chunks; c++) {
        const k = `${c}:${f.column}`;
        if (this.fills.has(k) || this.noRoom.has(k) || ops.resident(c, f.column)) continue;
        if (!ops.reserve(c, f.column)) {
          this.noRoom.add(k);
          continue;
        }
        this.fills.set(k, { chunk: c, column: f.column, res: null, cursor: 0, rows: ops.chunkRows(c) });
      }
    }
    return this.fills.size === 0;
  }

  /**
   * Write slices until `until`. A resource is made at most once a frame, ahead of
   * the rows that fill it, as the renderers' row upload does.
   */
  private flush(ops: StageOps<T>, until: number, now: () => number): void {
    let made = false;
    for (const [k, f] of this.fills) {
      if (now() >= until) return;
      if (!f.res) {
        if (made) return;
        f.res = ops.allocate(f.chunk, f.column);
        made = true;
        continue;
      }
      const src = ops.source(f.column);
      if (!src) {
        ops.discard(f.chunk, f.column, f.res);
        this.fills.delete(k);
        continue;
      }
      while (f.cursor < f.rows && now() < until) {
        const to = Math.min(f.rows, f.cursor + FILTER_SLICE_ROWS);
        ops.write(f.res, f.chunk, src, f.cursor, to);
        f.cursor = to;
      }
      if (f.cursor < f.rows) return;
      ops.land(f.chunk, f.column, f.res);
      this.fills.delete(k);
    }
  }

  /**
   * Finish one chunk's column now, when a pass needs it this frame - a chunk that
   * landed while a filter was on. Returns whether it was staged.
   */
  finishNow(chunk: number, column: string, ops: StageOps<T>): boolean {
    const k = `${chunk}:${column}`;
    const f = this.fills.get(k);
    if (!f) return false;
    const src = ops.source(column);
    this.fills.delete(k);
    if (!src) {
      ops.discard(chunk, column, f.res);
      return true;
    }
    f.res ??= ops.allocate(chunk, column);
    if (f.cursor < f.rows) ops.write(f.res, chunk, src, f.cursor, f.rows);
    ops.land(chunk, column, f.res);
    return true;
  }
}

/** Rows written between checks of the clock: 32 rows of the WebGL2 row textures. */
export const FILTER_SLICE_ROWS = 32 * 8192;
