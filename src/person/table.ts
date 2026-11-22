/**
 * Only the rows and columns a person-hit load uses, read from a Parquet table
 * with the row prefilter (`data/rowFilter.ts`): the rows of a few events, the
 * columns asked for that the file has. Nothing else is decoded into rows.
 */

import { parquetMetadataAsync } from 'hyparquet';
import { asyncBufferFromFile, type ColumnRequest } from '../data/parquet';
import { readSelectedColumns, selectRows, type RowFilterClause } from '../data/rowFilter';
import { Dict } from './types';

export interface TextCol {
  ids: Uint32Array;
  dict: string[];
}

/** The rows read, in file order; a column the file does not have is missing. */
export interface TableColumns {
  rows: number;
  time: Float64Array;
  num: Partial<Record<string, Float32Array>>;
  txt: Partial<Record<string, TextCol>>;
}

export type TableMeta = Awaited<ReturnType<typeof parquetMetadataAsync>>;

export async function tableMeta(table: File): Promise<{ meta: TableMeta; available: Set<string> }> {
  const meta = await parquetMetadataAsync(asyncBufferFromFile(table));
  return { meta, available: new Set(meta.schema.slice(1).map((e) => e.name)) };
}

export async function readTable(table: File, meta: TableMeta, available: Set<string>, clauses: RowFilterClause[], numbers: string[], texts: string[], timeColumn = 'time'): Promise<TableColumns> {
  const buf = asyncBufferFromFile(table);
  const nums = numbers.filter((c) => available.has(c));
  const txts = texts.filter((c) => available.has(c));
  const sel = await selectRows(buf, meta, clauses, [timeColumn, ...nums, ...txts]);
  const count = sel.count;
  const time = new Float64Array(count);
  const requests: ColumnRequest[] = [{ name: timeColumn, numbers: time }];
  const num: TableColumns['num'] = {};
  const txt: TableColumns['txt'] = {};
  for (const c of nums) requests.push({ name: c, numbers: (num[c] = new Float32Array(count)) });
  for (const c of txts) {
    const d = new Dict();
    const ids = new Uint32Array(count);
    txt[c] = { ids, dict: d.list };
    requests.push({ name: c, ids, intern: (s) => d.code(s) });
  }
  if (count > 0) await readSelectedColumns(sel, requests);
  return { rows: count, time, num, txt };
}

/** Made-up columns for tests: rows of plain objects. */
export function columnsOf(rows: Record<string, unknown>[], timeColumn = 'time'): TableColumns {
  const n = rows.length;
  const time = new Float64Array(n);
  const num: TableColumns['num'] = {};
  const txt: TableColumns['txt'] = {};
  const names = new Set<string>();
  for (const r of rows) for (const k of Object.keys(r)) names.add(k);
  for (const k of names) {
    if (k === timeColumn) continue;
    const isText = rows.some((r) => typeof r[k] === 'string');
    if (isText) {
      const d = new Dict();
      const ids = new Uint32Array(n);
      rows.forEach((r, i) => (ids[i] = d.code(r[k] == null ? '' : String(r[k]))));
      txt[k] = { ids, dict: d.list };
    } else {
      const a = new Float32Array(n);
      rows.forEach((r, i) => (a[i] = typeof r[k] === 'number' ? (r[k] as number) : typeof r[k] === 'boolean' ? (r[k] ? 1 : 0) : NaN));
      num[k] = a;
    }
  }
  rows.forEach((r, i) => (time[i] = Number(r[timeColumn] ?? 0)));
  return { rows: n, time, num, txt };
}
