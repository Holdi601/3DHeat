import { parquetMetadataAsync, parquetScan } from 'hyparquet';
import type { AsyncBuffer, DecodedArray, FileMetaData, ParquetQueryFilter, ParquetScan } from 'hyparquet';
import { asyncBufferFromFile, displayValue, toNumber, type ColumnRequest } from './parquet';
import { detectFormat } from './sourcePreview';
import type { SourceBlock } from './builder';

/**
 * Row filters applied while a file is read, before anything is kept.
 *
 * A filter set in the filter panel acts on rows that are already resident: the
 * whole selection has been decoded, sorted and uploaded, and the filter only
 * hides most of it. For mass analysis that is the wrong order. Ten thousand
 * matches of which only the kills and deaths matter is a few million rows, but
 * the same matches in full are billions, and no browser tab holds those. A row
 * filter here decides per row *during* the read, so a row that fails it never
 * reaches an array, the builder or the GPU.
 *
 * Parquet makes most of this nearly free:
 *   - row-group statistics (min/max per column chunk) and page indexes let whole
 *     groups be skipped without decoding them (`parquetScan`'s pruning filter);
 *   - column projection means the filter columns are read first, alone, and the
 *     mapped columns only for the groups that kept at least one row.
 *
 * Clauses combine with AND; a set clause keeps a row when its value is any of
 * the listed ones. An empty set or a range with no bounds is no clause at all,
 * so unticking every value never silently loads nothing.
 */

export type RowFilterClause =
  /** Keep rows whose value, written the way the preview shows it, is one of `values`. `''` stands for empty. */
  | { column: string; kind: 'set'; values: string[] }
  /** Keep rows whose numeric value lies in [min, max]; a null bound is open. Unreadable values fail. */
  | { column: string; kind: 'range'; min: number | null; max: number | null };

/** The clauses that actually restrict something. */
export function activeClauses(clauses: readonly RowFilterClause[] | null | undefined): RowFilterClause[] {
  if (!clauses) return [];
  return clauses.filter((c) =>
    c.kind === 'set' ? c.values.length > 0 : c.min !== null || c.max !== null,
  );
}

/** Every column a filter reads, once each. */
export function filterColumns(clauses: readonly RowFilterClause[]): string[] {
  return [...new Set(clauses.map((c) => c.column))];
}

export type ValueTest = (v: unknown) => boolean;

/**
 * Progress at most every `ms`, and always the last one.
 *
 * Per range would be a message per row group per file, thousands for a mass
 * load, and each one re-renders the load panel on the main thread: that showed
 * as 117 ms frames while 200 matches loaded.
 */
function throttle(fn: ((f: number) => void) | undefined, ms = 120): ((f: number) => void) | undefined {
  if (!fn) return undefined;
  let last = -Infinity;
  return (f) => {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (f < 1 && now - last < ms) return;
    last = now;
    fn(f);
  };
}

/** A per-value test for one clause. `null` and `undefined` count as the empty value. */
export function compileClause(c: RowFilterClause): ValueTest {
  if (c.kind === 'set') {
    const set = new Set(c.values);
    const empty = set.has('');
    return (v) => {
      if (v === null || v === undefined) return empty;
      if (typeof v === 'string') return set.has(v);
      return set.has(displayValue(v));
    };
  }
  const lo = c.min ?? Number.NEGATIVE_INFINITY;
  const hi = c.max ?? Number.POSITIVE_INFINITY;
  return (v) => {
    if (v === null || v === undefined) return false;
    const x = typeof v === 'number' ? v : toNumber(v);
    return x >= lo && x <= hi;
  };
}

/** The whole filter as one row test over named values: for tests and the CSV path's bookkeeping. */
export function compileFilter(clauses: readonly RowFilterClause[]): (row: Record<string, unknown>) => boolean {
  const tests = activeClauses(clauses).map((c) => ({ column: c.column, test: compileClause(c) }));
  return (row) => tests.every((t) => t.test(row[t.column]));
}

interface LeafInfo {
  type: string | undefined;
  logical: string | null;
}

function leaves(metadata: FileMetaData): Map<string, LeafInfo> {
  const out = new Map<string, LeafInfo>();
  for (let i = 1; i < metadata.schema.length; i++) {
    const el = metadata.schema[i];
    if (el.num_children) continue;
    const logical = (el.logical_type as { type?: string } | undefined)?.type ?? (el.converted_type ? String(el.converted_type) : null);
    out.set(el.name, { type: el.type ? String(el.type) : undefined, logical });
  }
  return out;
}

const NUMERIC_TYPES = new Set(['INT32', 'INT64', 'FLOAT', 'DOUBLE']);

/**
 * The part of the filter Parquet's statistics can decide, as hyparquet's query
 * filter.
 *
 * Only the cases where the comparison the statistics make is the comparison the
 * row test makes:
 *   - a set over a text column, by the strings themselves (empty excluded: an
 *     empty value is a null, which the statistics count apart);
 *   - a set of numbers over a plain numeric column, as the span from the
 *     smallest to the largest — wider than the set, never narrower;
 *   - a range over a plain numeric column.
 * Dates and decimals are left to the row test: their statistics are encoded
 * values the row test never sees. Pruning is only ever a skip of work, so
 * leaving a clause out costs time and never a wrong row.
 */
export function pruningFilter(clauses: readonly RowFilterClause[], metadata: FileMetaData): ParquetQueryFilter | undefined {
  const info = leaves(metadata);
  const parts: ParquetQueryFilter[] = [];
  for (const c of clauses) {
    const leaf = info.get(c.column);
    if (!leaf) continue;
    const plainNumber = NUMERIC_TYPES.has(leaf.type ?? '') && (!leaf.logical || /^U?INT/i.test(leaf.logical) || /INTEGER/i.test(leaf.logical));
    if (c.kind === 'set') {
      if (leaf.type === 'BYTE_ARRAY' && /STRING|UTF8|ENUM/i.test(leaf.logical ?? '') && !c.values.includes('')) {
        parts.push({ [c.column]: { $in: [...c.values] } });
      } else if (plainNumber) {
        const nums = c.values.map(Number);
        if (nums.length && nums.every(Number.isFinite)) {
          parts.push({ [c.column]: { $gte: Math.min(...nums), $lte: Math.max(...nums) } });
        }
      }
    } else if (plainNumber) {
      const op: { $gte?: number; $lte?: number } = {};
      if (c.min !== null) op.$gte = c.min;
      if (c.max !== null) op.$lte = c.max;
      parts.push({ [c.column]: op });
    }
  }
  if (parts.length === 0) return undefined;
  return parts.length === 1 ? parts[0] : { $and: parts };
}

/** Which rows of one file pass, and how much reading it took to know. */
export interface RowSelection {
  /** Rows kept. */
  count: number;
  /** Rows in the file. */
  rows: number;
  /** One byte a row, 1 where the row passed. Only the scanned ranges are written. */
  keep: Uint8Array;
  /** Physical row ranges the statistics could not rule out, with the rows each kept. */
  ranges: Array<{ rowStart: number; rowEnd: number; kept: number }>;
  /** Rows the statistics ruled out without decoding. */
  rowsSkipped: number;
  groups: number;
  groupsSkipped: number;
  /** The scan, kept open so the mapped columns are read from the same plan. */
  scan: ParquetScan | null;
}

/**
 * Decide the rows of one Parquet file: prune by statistics, then read only the
 * filter columns and test them.
 *
 * `readColumns` are the columns the caller will read afterwards from the
 * returned scan; the filter's own are added.
 */
export async function selectRows(
  buf: AsyncBuffer,
  metadata: FileMetaData,
  clauses: readonly RowFilterClause[],
  readColumns: readonly string[],
  progressFn?: (fraction: number) => void,
): Promise<RowSelection> {
  const onProgress = throttle(progressFn);
  const rows = Number(metadata.num_rows);
  const groups = metadata.row_groups.length;
  const active = activeClauses(clauses);
  const info = leaves(metadata);
  const empty = (): RowSelection => ({
    count: 0,
    rows,
    keep: new Uint8Array(0),
    ranges: [],
    rowsSkipped: rows,
    groups,
    groupsSkipped: groups,
    scan: null,
  });

  // A clause over a column the file does not have sees an empty value in every
  // row: either all rows pass it or none do, and none needs no reading at all.
  const tests: Array<{ column: string; test: ValueTest }> = [];
  for (const c of active) {
    const test = compileClause(c);
    if (!info.has(c.column)) {
      if (!test(null)) return empty();
      continue;
    }
    tests.push({ column: c.column, test });
  }

  const present = readColumns.filter((c) => info.has(c));
  const columns = [...new Set([...present, ...tests.map((t) => t.column)])];
  const scan = await parquetScan({
    file: buf,
    metadata,
    columns,
    pruningFilter: pruningFilter(active.filter((c) => info.has(c.column)), metadata),
    usePageIndex: true,
  });

  const keep = new Uint8Array(rows);
  const ranges: RowSelection['ranges'] = [];
  let count = 0;
  let scanned = 0;
  const groupsSeen = new Set<number>();
  const groupStarts = groupStartsOf(metadata);
  for (let r = 0; r < scan.ranges.length; r++) {
    const { rowStart, rowEnd } = scan.ranges[r];
    groupsSeen.add(groupOf(groupStarts, rowStart));
    const local = keep.subarray(rowStart, rowEnd);
    local.fill(1);
    for (const { column, test } of tests) {
      const data = (await scan.readColumn({ column, rowStart, rowEnd })) as ArrayLike<unknown>;
      const len = Math.min(local.length, data.length);
      for (let i = 0; i < len; i++) if (local[i] && !test(data[i])) local[i] = 0;
      // A short chunk is rows the decoder did not return; they cannot pass.
      for (let i = len; i < local.length; i++) local[i] = 0;
    }
    let kept = 0;
    for (let i = 0; i < local.length; i++) kept += local[i];
    ranges.push({ rowStart, rowEnd, kept });
    count += kept;
    scanned += rowEnd - rowStart;
    onProgress?.((r + 1) / scan.ranges.length);
  }
  return {
    count,
    rows,
    keep,
    ranges,
    rowsSkipped: rows - scanned,
    groups,
    groupsSkipped: groups - groupsSeen.size,
    scan,
  };
}

function groupStartsOf(metadata: FileMetaData): number[] {
  const out: number[] = [];
  let at = 0;
  for (const g of metadata.row_groups) {
    out.push(at);
    at += Number(g.num_rows);
  }
  return out;
}

function groupOf(starts: number[], row: number): number {
  let lo = 0;
  let hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid] <= row) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/**
 * Read the requested columns for the selected rows only, packed: the k-th kept
 * row of the file lands at index k of every destination.
 *
 * Ranges that kept nothing are not read at all, which is where the saving on
 * a sparse filter comes from — "kills only" leaves most row groups of a match
 * without a single kill.
 */
export async function readSelectedColumns(
  sel: RowSelection,
  requests: ColumnRequest[],
  progressFn?: (fraction: number) => void,
): Promise<void> {
  if (!sel.scan || requests.length === 0 || sel.count === 0) return;
  const onProgress = throttle(progressFn);
  const byName = new Map<string, ColumnRequest[]>();
  for (const r of requests) {
    const list = byName.get(r.name);
    if (list) list.push(r);
    else byName.set(r.name, [r]);
  }
  const busy = sel.ranges.filter((r) => r.kept > 0);
  let at = 0;
  for (let r = 0; r < busy.length; r++) {
    const { rowStart, rowEnd, kept } = busy[r];
    const keep = sel.keep.subarray(rowStart, rowEnd);
    for (const [name, reqs] of byName) {
      const data = (await sel.scan.readColumn({ column: name, rowStart, rowEnd })) as DecodedArray;
      for (const req of reqs) copyKept(data as ArrayLike<unknown>, keep, req, at);
    }
    at += kept;
    onProgress?.((r + 1) / busy.length);
  }
}

function copyKept(data: ArrayLike<unknown>, keep: Uint8Array, req: ColumnRequest, at: number): void {
  const len = Math.min(keep.length, data.length);
  let k = at;
  if (req.numbers) {
    const out = req.numbers;
    for (let i = 0; i < len; i++) if (keep[i]) out[k++] = toNumber(data[i]);
  } else if (req.ids && req.intern) {
    const out = req.ids;
    const intern = req.intern;
    for (let i = 0; i < len; i++) {
      if (!keep[i]) continue;
      const v = data[i];
      out[k++] = intern(v === null || v === undefined ? '' : displayValue(v));
    }
  }
}

/** How many rows of a selection pass a filter, read from the filter columns alone. */
export interface MatchCount {
  /** Rows that passed in the files read. */
  matched: number;
  /** Rows in the files read. */
  scannedRows: number;
  scannedFiles: number;
  files: number;
  /** Rows the statistics ruled out without decoding, in the files read. */
  rowsSkipped: number;
  groups: number;
  groupsSkipped: number;
  /** Every file was read, so `matched` is the answer and not a sample. */
  exact: boolean;
  /** Text files have no footer to count from and are not counted. */
  uncounted: number;
}

/**
 * Count the rows a filter keeps, reading only its columns.
 *
 * Stops after `timeMs` and reports a sample, because the panel asks this on
 * every change of the filter: a thousand files are counted within the budget
 * and ten thousand are extrapolated from the first ones, said as an estimate.
 */
export async function countMatches(
  files: File[],
  clauses: readonly RowFilterClause[],
  timeMs = 1500,
  now: () => number = () => performance.now(),
): Promise<MatchCount> {
  const start = now();
  const out: MatchCount = {
    matched: 0,
    scannedRows: 0,
    scannedFiles: 0,
    files: files.length,
    rowsSkipped: 0,
    groups: 0,
    groupsSkipped: 0,
    exact: true,
    uncounted: 0,
  };
  for (const file of files) {
    if (detectFormat(file.name) !== 'parquet' || file.size === 0) {
      out.uncounted++;
      out.exact = false;
      continue;
    }
    if (out.scannedFiles > 0 && now() - start > timeMs) {
      out.exact = false;
      break;
    }
    try {
      const buf = asyncBufferFromFile(file);
      const metadata = await parquetMetadataAsync(buf);
      const sel = await selectRows(buf, metadata, clauses, []);
      out.matched += sel.count;
      out.scannedRows += sel.rows;
      out.rowsSkipped += sel.rowsSkipped;
      out.groups += sel.groups;
      out.groupsSkipped += sel.groupsSkipped;
      out.scannedFiles++;
    } catch {
      out.uncounted++;
      out.exact = false;
    }
  }
  return out;
}

/** Rows a filter is expected to keep out of `totalRows`, from a count that may be a sample. */
export function expectedMatches(count: MatchCount, totalRows: number): number {
  if (count.exact) return count.matched;
  if (count.scannedRows <= 0) return totalRows;
  return Math.ceil((count.matched / count.scannedRows) * totalRows);
}

/** A file the row filter emptied: nothing to keep, which is not a failure. */
export function emptySourceBlock(filtered: NonNullable<SourceBlock['filtered']>): SourceBlock {
  const none = new Float32Array(0);
  return {
    rows: 0,
    px: none,
    py: none,
    pz: none,
    time: null,
    timeIsAbsolute: false,
    yaw: null,
    pitch: null,
    personIds: null,
    personLabels: [],
    teamIds: null,
    teamLabels: [],
    sessionIds: null,
    sessionLabels: [],
    attrs: [],
    rejected: 0,
    filtered,
  };
}
