/** Reading a run of rows of a Parquet file, column by column, as plain arrays over just those rows. */

import { parquetRead } from 'hyparquet';
import type { FileMetaData } from 'hyparquet';
import type { Columns } from './scan';

export function asyncBuffer(file: File) {
  return { byteLength: file.size, slice: (s: number, e?: number) => file.slice(s, e ?? file.size).arrayBuffer() };
}

/** The columns of rows [rowStart, rowEnd) that the file has, each one array over just those rows. */
export async function readColumns(file: File, metadata: FileMetaData, names: string[], rowStart: number, rowEnd: number): Promise<Columns> {
  const have = new Set(metadata.schema.slice(1).filter((e) => !e.num_children).map((e) => e.name));
  const want = names.filter((n) => have.has(n));
  const n = rowEnd - rowStart;
  const parts = new Map<string, { data: ArrayLike<unknown>; start: number }[]>();
  await parquetRead({
    file: asyncBuffer(file),
    metadata,
    columns: want,
    rowStart,
    rowEnd,
    onChunk: (c) => {
      let l = parts.get(c.columnName);
      if (!l) parts.set(c.columnName, (l = []));
      l.push({ data: c.columnData as ArrayLike<unknown>, start: c.rowStart });
    },
  });
  const out: Columns = {};
  for (const name of want) {
    const l = parts.get(name) ?? [];
    // One chunk over the whole run: the run of it, no copy.
    if (l.length === 1 && l[0].start <= rowStart && l[0].start + l[0].data.length >= rowEnd) {
      const d = l[0].data;
      const a = rowStart - l[0].start;
      out[name] = ArrayBuffer.isView(d) ? (d as unknown as Float64Array).subarray(a, a + n) : a === 0 && d.length === n ? d : Array.prototype.slice.call(d, a, a + n);
      continue;
    }
    const typed = l.length > 0 && ArrayBuffer.isView(l[0].data) && l.every((p) => p.data.constructor === l[0].data.constructor);
    const dst: { [i: number]: unknown; length: number } = typed ? new (l[0].data.constructor as Float64ArrayConstructor)(n) : new Array<unknown>(n);
    for (const p of l) {
      const from = Math.max(rowStart, p.start);
      const to = Math.min(rowEnd, p.start + p.data.length);
      for (let r = from; r < to; r++) dst[r - rowStart] = p.data[r - p.start];
    }
    out[name] = dst as ArrayLike<unknown>;
  }
  return out;
}
