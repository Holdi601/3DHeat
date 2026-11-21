import type { ColumnMapping } from '../state/types';
import { SERIES_CAMPAIGN, SERIES_START, SOURCE_COLUMN } from './builder';
import { feedsCanonical, isCanonical } from './canonical';
import { parseValueColumn } from './cost';
import { END_REASON, MATCH_WON, ROUND_NUMBER, ROUND_WON, WINNER } from './outcome';

/**
 * Columns read from the files when something first needs them, not at load.
 *
 * A tab holds about fifteen gigabytes of arrays, whatever the machine has, and
 * every column kept for filtering is four bytes a row of it: on a load of
 * hundreds of millions of rows the measures nobody is looking at are most of
 * the tab. A column on demand costs nothing until a filter or a panel asks for
 * it; then it is read again from the files - only that column, which Parquet
 * makes cheap - and put in the dataset's row order.
 *
 * Putting it in that order is the whole difficulty. A dataset row is not a file
 * row: the pre-filter, the stride and the rows without a position decide which
 * file rows were kept, and the time sort decides where each one went. So the
 * load leaves a row map behind (`ColumnSource`), in the column worker and not
 * the page, and the column worker answers a request with a column in the
 * dataset's order. The map is small where the data allows it:
 *
 *   - which file rows a file kept: nothing when it kept all of them, the rows
 *     without a position when only those were dropped, a stride, or (under a
 *     pre-filter, whose loads are small by design) the selected rows;
 *   - where the sort put them: nothing for an unsorted load, one byte a row
 *     (two past 255 files) saying which file each row came from when every file
 *     was in time order on its own - a stable sort then keeps each file's rows
 *     in their order - and the full permutation otherwise.
 *
 * Only Parquet sources: a text file has no column to read alone.
 */

/** Which of one file's rows a dataset kept, in file order. */
export interface BlockRows {
  /** Index into the load's files. */
  file: number;
  /** Rows the file read: the pre-filter's selection, or every row. */
  read: number;
  /** File row of each read row, under a pre-filter; null when every row was read. */
  sel: Uint32Array | null;
  /** One read row in `step` was considered. */
  step: number;
  /** Read rows (multiples of `step`) dropped for having no position, ascending. */
  drop: Uint32Array | null;
  /** Rows kept. */
  rows: number;
}

/** Where the time sort put each block's rows. */
export type RowMerge =
  /** Not sorted: the blocks one after another. */
  | { kind: 'concat' }
  /** Each block in its own order; `block[i]` is the block dataset row `i` came from. */
  | { kind: 'runs'; block: Uint8Array | Uint16Array }
  /** Dataset row `i` is row `order[i]` of the blocks one after another. */
  | { kind: 'order'; order: Uint32Array };

/** What the column worker needs to read a column again. */
export interface ColumnSource {
  files: File[];
  mapping: ColumnMapping;
  blocks: BlockRows[];
  merge: RowMerge;
  rows: number;
  /** The columns the load left to be read on demand, with how each is held. */
  deferred: Array<{ name: string; kind: 'number' | 'category' }>;
  /** Columns loaded at once that the worker could read again after an eviction. */
  refetchable: Array<{ name: string; kind: 'number' | 'category' }>;
}

/** Bytes the row map holds. */
export function rowMapBytes(src: Pick<ColumnSource, 'blocks' | 'merge'>): number {
  let b = 0;
  for (const k of src.blocks) b += (k.sel?.byteLength ?? 0) + (k.drop?.byteLength ?? 0);
  if (src.merge.kind === 'runs') b += src.merge.block.byteLength;
  if (src.merge.kind === 'order') b += src.merge.order.byteLength;
  return b;
}

/** Every buffer of a source, for a transfer list. */
export function sourceBuffers(src: Pick<ColumnSource, 'blocks' | 'merge'>): ArrayBuffer[] {
  const out = new Set<ArrayBuffer>();
  for (const k of src.blocks) {
    if (k.sel) out.add(k.sel.buffer as ArrayBuffer);
    if (k.drop) out.add(k.drop.buffer as ArrayBuffer);
  }
  if (src.merge.kind === 'runs') out.add(src.merge.block.buffer as ArrayBuffer);
  if (src.merge.kind === 'order') out.add(src.merge.order.buffer as ArrayBuffer);
  return [...out];
}

/**
 * The kept rows of a block, as the parser decided them: read rows
 * `0, step, 2*step, ...` less `drop`, each at file row `sel[i]` (or `i`).
 * `fn(k, fileRow, readRow)` once per kept row, `k` ascending.
 */
export function forEachKept(b: BlockRows, fn: (k: number, fileRow: number, readRow: number) => void): void {
  const drop = b.drop;
  let d = 0;
  let k = 0;
  for (let i = 0; i < b.read && k < b.rows; i += b.step) {
    if (drop && d < drop.length && drop[d] === i) {
      d++;
      continue;
    }
    fn(k++, b.sel ? b.sel[i] : i, i);
  }
}

/**
 * The block-row description a parser hands back: `keep` marks the read rows
 * kept (stride and position checks already applied).
 */
export function describeKept(read: number, step: number, keep: Uint8Array, kept: number, sel: Uint32Array | null): Omit<BlockRows, 'file'> {
  let dropped = 0;
  for (let i = 0; i < read; i += step) if (!keep[i]) dropped++;
  let drop: Uint32Array | null = null;
  if (dropped > 0) {
    drop = new Uint32Array(dropped);
    let d = 0;
    for (let i = 0; i < read; i += step) if (!keep[i]) drop[d++] = i;
  }
  return { read, sel, step, drop, rows: kept };
}

/**
 * The merge for a sort: `order` the sort's permutation (null: none),
 * `starts` each block's first row before it, `time` the rows' sort keys before it.
 */
export function mergeOf(order: Uint32Array | null, starts: readonly number[], time: Float32Array | null, n: number): RowMerge {
  if (!order || !time) return { kind: 'concat' };
  const B = starts.length;
  // Each block in time order on its own, so the stable sort kept its rows in order.
  let runs = B <= 65_535;
  for (let b = 0; b < B && runs; b++) {
    const end = b + 1 < B ? starts[b + 1] : n;
    for (let i = starts[b] + 1; i < end; i++) {
      if (time[i] < time[i - 1]) {
        runs = false;
        break;
      }
    }
  }
  if (!runs) return { kind: 'order', order };
  const block = B <= 255 ? new Uint8Array(n) : new Uint16Array(n);
  const of = B <= 255 ? new Uint8Array(n) : new Uint16Array(n);
  for (let b = 0; b < B; b++) of.fill(b, starts[b], b + 1 < B ? starts[b + 1] : n);
  for (let i = 0; i < n; i++) block[i] = of[order[i]];
  return { kind: 'runs', block };
}

/**
 * One column in dataset order from each block's kept values (`values[b]`, in
 * block order). `out` is the dataset-sized destination.
 */
export function assemble<T extends Float32Array | Uint32Array>(merge: RowMerge, blocks: readonly BlockRows[], values: readonly T[], out: T): T {
  const n = out.length;
  if (merge.kind === 'concat') {
    let at = 0;
    for (let b = 0; b < blocks.length; b++) {
      out.set(values[b].subarray(0, blocks[b].rows), at);
      at += blocks[b].rows;
    }
    return out;
  }
  if (merge.kind === 'runs') {
    const cursor = new Uint32Array(blocks.length);
    const of = merge.block;
    for (let i = 0; i < n; i++) {
      const b = of[i];
      out[i] = values[b][cursor[b]++];
    }
    return out;
  }
  // The blocks one after another, then the permutation.
  const starts = new Float64Array(blocks.length + 1);
  for (let b = 0; b < blocks.length; b++) starts[b + 1] = starts[b] + blocks[b].rows;
  const order = merge.order;
  let b = 0;
  // Gathered block by block in row order would be a pass per block; instead a
  // search per row, by the block of the previous one first (sorted loads move
  // between few blocks at a time).
  for (let i = 0; i < n; i++) {
    const r = order[i];
    if (r < starts[b] || r >= starts[b + 1]) {
      let lo = 0;
      let hi = blocks.length - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (starts[mid] <= r) lo = mid;
        else hi = mid - 1;
      }
      b = lo;
    }
    out[i] = values[b][r - starts[b]];
  }
  return out;
}

/**
 * Whether a column may wait to be read until it is needed.
 *
 * Not when the load itself reads it: the columns the load adds (event type,
 * player or AI, vehicle class), the economy, the outcome and the campaign
 * series are worked out from the columns they name while the load builds the
 * dataset, and a column that is not there then is not there for them at all.
 */
export function onDemandEligible(name: string): boolean {
  const n = name.trim();
  if (name === SOURCE_COLUMN || name === SERIES_CAMPAIGN || name === SERIES_START) return false;
  if (n === 'pawn' || n === 'entity') return false;
  if (isCanonical(n) || feedsCanonical(n)) return false;
  // The economy's columns, and anything named like one (`costs/columns.ts`).
  if (parseValueColumn(n) || /^(cost|earn|net)_/i.test(n)) return false;
  if (WINNER.test(n) || END_REASON.test(n) || ROUND_WON.test(n) || MATCH_WON.test(n) || ROUND_NUMBER.test(n)) return false;
  return true;
}

/** The mapping with its on-demand columns cut to the eligible ones that are not also kept. */
export function onDemandOf(m: Pick<ColumnMapping, 'extra' | 'onDemand'>): string[] {
  return (m.onDemand ?? []).filter((c, i, all) => all.indexOf(c) === i && !m.extra.includes(c) && onDemandEligible(c));
}

/** What the LRU knows of one column. */
export interface LruEntry {
  name: string;
  bytes: number;
  lastUsed: number;
}

/**
 * The columns to evict, least recently used first, until `need` bytes more fit
 * under `budget` with `used` held now. Never a pinned one. May not free enough;
 * the caller decides what to do then.
 */
export function chooseEvictions(entries: readonly LruEntry[], pinned: ReadonlySet<string>, used: number, need: number, budget: number): string[] {
  if (used + need <= budget) return [];
  const out: string[] = [];
  let free = used + need - budget;
  for (const e of [...entries].sort((a, b) => a.lastUsed - b.lastUsed)) {
    if (free <= 0) break;
    if (pinned.has(e.name)) continue;
    out.push(e.name);
    free -= e.bytes;
  }
  return out;
}
