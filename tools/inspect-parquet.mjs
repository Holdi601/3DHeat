/**
 * Print the schema and a few rows of a parquet file.
 *
 *   node tools/inspect-parquet.mjs <file> [rows]
 */
import { parquetMetadataAsync, parquetReadObjects, parquetSchema } from 'hyparquet';
import { readFile } from 'node:fs/promises';

const path = process.argv[2];
const nRows = Number(process.argv[3] ?? 5);
if (!path) {
  console.error('usage: node tools/inspect-parquet.mjs <file> [rows]');
  process.exit(1);
}

// Small files here, so read whole and expose the AsyncBuffer shape directly.
const bytes = await readFile(path);
const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
const file = { byteLength: ab.byteLength, slice: (s, e) => ab.slice(s, e ?? ab.byteLength) };
const metadata = await parquetMetadataAsync(file);
console.log(`rows: ${metadata.num_rows}`);
console.log(`row groups: ${metadata.row_groups.length}`);
console.log(`created by: ${metadata.created_by ?? '?'}`);

const tree = parquetSchema(metadata);
console.log('\nschema:');
const walk = (node, depth) => {
  for (const child of node.children ?? []) {
    const el = child.element;
    const type = el.type ?? '(group)';
    const logical = el.logical_type ? ` <${JSON.stringify(el.logical_type)}>` : '';
    const conv = el.converted_type ? ` (${el.converted_type})` : '';
    console.log(
      `${'  '.repeat(depth + 1)}${el.name}: ${type}${conv}${logical} ${el.repetition_type ?? ''}`,
    );
    walk(child, depth + 1);
  }
};
walk(tree, 0);

const rows = await parquetReadObjects({
  file,
  metadata,
  rowStart: 0,
  rowEnd: Math.min(nRows, Number(metadata.num_rows)),
});
console.log('\nrows:');
for (const r of rows) {
  const out = {};
  for (const [k, v] of Object.entries(r)) {
    out[k] = typeof v === 'bigint' ? `${v}n` : v instanceof Date ? v.toISOString() : v;
  }
  console.log(JSON.stringify(out));
}
