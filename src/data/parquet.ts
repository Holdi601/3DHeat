import { parquetMetadataAsync, parquetRead, parquetReadObjects } from 'hyparquet';
import type { AsyncBuffer, FileMetaData } from 'hyparquet';

/**
 * Parquet ingest.
 *
 * Uses hyparquet's `onChunk` callback rather than its row-object API. Row objects
 * would allocate one JavaScript object per row — at tens of millions of rows that
 * allocation is the whole cost. `onChunk` hands over one decoded column chunk at
 * a time, which is already the layout we want, so values go straight into their
 * destination typed array with no intermediate objects at all.
 *
 * Only the mapped columns are requested, so an unmapped 40-column file costs
 * nothing for the 34 columns nobody asked for — the real advantage of Parquet
 * over CSV here.
 */

export function asyncBufferFromFile(file: File): AsyncBuffer {
  return {
    byteLength: file.size,
    slice: (start: number, end?: number) =>
      file.slice(start, end ?? file.size).arrayBuffer(),
  };
}

export interface ParquetPreview {
  columns: string[];
  rows: string[][];
  numRows: number;
  fileBytes: number;
  numeric: boolean[];
  metadata: FileMetaData;
  file: AsyncBuffer;
  /** Columns whose statistics show one value (or none) in every row group. */
  constant: string[];
}

export async function previewParquet(file: File): Promise<ParquetPreview> {
  const buf = asyncBufferFromFile(file);
  const metadata = await parquetMetadataAsync(buf);
  const numRows = Number(metadata.num_rows);

  const sample = (await parquetReadObjects({
    file: buf,
    metadata,
    rowStart: 0,
    rowEnd: Math.min(50, numRows),
  })) as Array<Record<string, unknown>>;

  const columns = sample.length > 0 ? Object.keys(sample[0]) : leafColumnNames(metadata);
  const rows = sample.map((r) => columns.map((c) => displayValue(r[c])));
  const numeric = columns.map((c) => {
    let seen = 0;
    let numbers = 0;
    for (const r of sample) {
      const v = r[c];
      if (v === null || v === undefined || v === '') continue;
      seen++;
      if (typeof v === 'number' || typeof v === 'bigint' || v instanceof Date) numbers++;
      // Digits as text past float32's whole numbers (16,777,216) are ids, not measures: WoWs ship numbers would
      // round to another ship's ("4179572528" read as 4179572480), so the column stays text.
      else if (typeof v === 'string' && Number.isFinite(Number(v)) && !(Number.isInteger(Number(v)) && Math.abs(Number(v)) > 16777216)) numbers++;
    }
    // Empty in the sample (a column only some rows fill, its first rows null):
    // the schema's type says, so a number column is not taken for text.
    if (seen === 0) {
      const el = metadata.schema.find((e) => e.name === c);
      return !!el && ['FLOAT', 'DOUBLE', 'INT32', 'INT64'].includes(String(el.type)) && (!el.converted_type || /^U?INT_/.test(String(el.converted_type)));
    }
    return numbers / seen > 0.9;
  });

  return { columns, rows, numRows, fileBytes: file.size, numeric, metadata, file: buf, constant: constantColumns(metadata) };
}

/**
 * Top-level columns whose row-group statistics show a single value, or only
 * nulls, throughout. A column without statistics in any group is not listed.
 */
export function constantColumns(metadata: FileMetaData): string[] {
  const seen = new Map<string, string | null>();
  const varies = new Set<string>();
  for (const group of metadata.row_groups) {
    for (const chunk of group.columns) {
      const md = chunk.meta_data;
      if (!md || md.path_in_schema.length !== 1) continue;
      const name = md.path_in_schema[0];
      if (varies.has(name)) continue;
      const st = md.statistics;
      const nulls = st?.null_count;
      let one: string | null;
      if (nulls !== undefined && BigInt(nulls) === BigInt(md.num_values)) one = null;
      else {
        const lo = st?.min_value ?? st?.min;
        const hi = st?.max_value ?? st?.max;
        if (lo === undefined || hi === undefined || displayValue(lo) !== displayValue(hi)) {
          varies.add(name);
          continue;
        }
        one = displayValue(lo);
      }
      if (!seen.has(name) || seen.get(name) === null) seen.set(name, one);
      else if (one !== null && seen.get(name) !== one) varies.add(name);
    }
  }
  return [...seen.keys()].filter((c) => !varies.has(c));
}

/** Column names straight from the schema, for a file with zero rows. */
function leafColumnNames(metadata: FileMetaData): string[] {
  const out: string[] = [];
  // schema[0] is the synthetic root; leaves have no children.
  for (let i = 1; i < metadata.schema.length; i++) {
    const el = metadata.schema[i];
    if (!el.num_children) out.push(el.name);
  }
  return out;
}

export function displayValue(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'bigint') return v.toString();
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

/**
 * Coerce a decoded Parquet value into a number.
 *
 * Timestamps arrive as Date or BigInt depending on the logical type, and INT64
 * columns always arrive as BigInt. All three need to become a plain number
 * before they can go into a Float32Array.
 */
export function toNumber(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'bigint') return Number(v);
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

export interface ColumnRequest {
  name: string;
  /**
   * Destination for numeric columns.
   *
   * Float64 is allowed so that an absolute timestamp can be read without being
   * rounded to the nearest 131 seconds on the way in — see `numeric64` in
   * `ingestParquet`. Positions and ordinary measures stay float32.
   */
  numbers?: Float32Array | Float64Array;
  /** Destination for dictionary-encoded columns, paired with `intern`. */
  ids?: Uint32Array;
  intern?: (s: string) => number;
}

/**
 * Read the requested columns into caller-provided typed arrays.
 *
 * Row count comes from the footer, so the destinations are allocated once at the
 * right size — no growable buffers and no reallocation, unlike the CSV path where
 * the count isn't known until the end.
 */
export async function readParquetColumns(
  file: AsyncBuffer,
  metadata: FileMetaData,
  requests: ColumnRequest[],
  numRows: number,
  onProgress?: (fraction: number) => void,
): Promise<void> {
  if (requests.length === 0) return;
  // A multimap: one source column can be mapped to more than one role.
  const byName = new Map<string, ColumnRequest[]>();
  for (const r of requests) {
    const list = byName.get(r.name);
    if (list) list.push(r);
    else byName.set(r.name, [r]);
  }
  // Column chunks arrive per column per row group, so progress is measured in
  // (rows x columns) cells rather than rows.
  const totalCells = numRows * requests.length;
  let cells = 0;
  let lastReport = 0;

  await parquetRead({
    file,
    metadata,
    columns: requests.map((r) => r.name),
    // No onComplete: assembling rows is exactly the work being avoided here.
    onChunk: (chunk) => {
      const reqs = byName.get(chunk.columnName);
      if (!reqs) return;
      const data = chunk.columnData as ArrayLike<unknown>;
      const start = chunk.rowStart;
      // Chunks may overhang the requested range at either end.
      const count = Math.min(data.length, numRows - start);
      if (count <= 0) return;

      for (const req of reqs) {
        if (req.numbers) {
          const out = req.numbers;
          for (let i = 0; i < count; i++) out[start + i] = toNumber(data[i]);
        } else if (req.ids && req.intern) {
          const out = req.ids;
          const intern = req.intern;
          for (let i = 0; i < count; i++) {
            const v = data[i];
            out[start + i] = intern(v === null || v === undefined ? '' : displayValue(v));
          }
        }
        cells += count;
      }
      if (onProgress && cells - lastReport > 1_000_000) {
        lastReport = cells;
        onProgress(Math.min(1, cells / Math.max(1, totalCells)));
      }
    },
  });
}
