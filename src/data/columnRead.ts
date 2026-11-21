import { parquetMetadataAsync } from 'hyparquet';
import { MAX_GROUPS } from '../render/types';
import type { AttributeColumn } from '../state/types';
import { assemble, forEachKept, type ColumnSource } from './columnSource';
import { Dictionary } from './growable';
import { msg, MsgError } from './msg';
import { asyncBufferFromFile, readParquetColumns } from './parquet';

/**
 * One column read again from the files, in the dataset's row order: what the
 * column worker answers (`columnWorker.ts`), and what the eager load would have
 * built - the same values, the same categories in the same order, and the same
 * zeros for a file that lacks the column (`DatasetBuilder.append`).
 */
export async function readColumn(
  src: ColumnSource,
  name: string,
  kind: 'number' | 'category',
  onProgress?: (fraction: number) => void,
): Promise<AttributeColumn> {
  const B = src.blocks.length;
  const values: Array<Float32Array | Uint32Array> = [];
  // Index 0 is the empty label, as the builder reserves it: rows of a file
  // without the column read as missing, not as the first category.
  const dict = new Dictionary();
  dict.intern('');
  for (let b = 0; b < B; b++) {
    const blk = src.blocks[b];
    const file = src.files[blk.file];
    const kept = kind === 'number' ? new Float32Array(blk.rows) : new Uint32Array(blk.rows);
    values.push(kept);
    const buf = asyncBufferFromFile(file);
    const metadata = await parquetMetadataAsync(buf);
    const total = Number(metadata.num_rows);
    const has = metadata.schema.some((el, i) => i > 0 && !el.num_children && el.name === name);
    if (has && blk.rows > 0) {
      const report = onProgress ? (f: number) => onProgress((b + f) / B) : undefined;
      if (kind === 'number') {
        const all = new Float32Array(total);
        await readParquetColumns(buf, metadata, [{ name, numbers: all }], total, report);
        const out = kept as Float32Array;
        forEachKept(blk, (k, row) => {
          out[k] = all[row];
        });
      } else {
        // The file's own dictionary first, then its labels in the order the
        // load met them - over the rows it read, kept or not - which is the
        // order the builder's remap gives them.
        const local = new Dictionary();
        const ids = new Uint32Array(total);
        await readParquetColumns(buf, metadata, [{ name, ids, intern: (s) => local.intern(s) }], total, report);
        const remap = new Int32Array(local.size).fill(-1);
        const visit = (row: number) => {
          const id = ids[row];
          if (remap[id] < 0) remap[id] = dict.intern(local.labels[id]);
        };
        if (blk.sel) for (let i = 0; i < blk.read; i++) visit(blk.sel[i]);
        else for (let i = 0; i < blk.read; i++) visit(i);
        const out = kept as Uint32Array;
        forEachKept(blk, (k, row) => {
          out[k] = remap[ids[row]];
        });
      }
    }
    onProgress?.((b + 1) / B);
  }
  if (kind === 'category' && dict.size > MAX_GROUPS) {
    throw new MsgError(msg('data.columns.tooMany', { column: name, count: dict.size, max: { int: MAX_GROUPS } }));
  }
  if (kind === 'number') {
    const out = assemble(src.merge, src.blocks, values as Float32Array[], new Float32Array(src.rows));
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < out.length; i++) {
      const v = out[i];
      if (Number.isFinite(v)) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    return { name, kind, data: out, min: Number.isFinite(min) ? min : 0, max: Number.isFinite(max) ? max : 0 };
  }
  const out = assemble(src.merge, src.blocks, values as Uint32Array[], new Uint32Array(src.rows));
  return { name, kind, data: out, min: 0, max: Math.max(0, dict.size - 1), categories: dict.labels };
}
