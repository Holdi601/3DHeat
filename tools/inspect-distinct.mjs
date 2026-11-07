/**
 * Distinct-value counts for chosen columns of a parquet file.
 *
 * The question this answers is "is this column a group or an id?", which decides
 * whether it can be mapped as the group axis: every group needs a row in the UI
 * list and a texel in the sign table the shader reads, so past `MAX_GROUPS` the
 * load keeps the rows and drops the grouping. A schema dump cannot tell you —
 * `Session`, `Name` and a victim flag are all just STRING — and finding out by
 * loading 650MB takes minutes.
 *
 *   node tools/inspect-distinct.mjs <file> [col,col,...]
 *
 * With no column list, every non-numeric column is counted.
 */
import { parquetMetadataAsync, parquetReadObjects, parquetSchema } from 'hyparquet';
import { readFile } from 'node:fs/promises';

const path = process.argv[2];
if (!path) {
  console.error('usage: node tools/inspect-distinct.mjs <file> [col,col,...]');
  process.exit(1);
}

const bytes = await readFile(path);
const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
const file = { byteLength: ab.byteLength, slice: (s, e) => ab.slice(s, e ?? ab.byteLength) };
const metadata = await parquetMetadataAsync(file);
const rowCount = Number(metadata.num_rows);

const asked = (process.argv[3] ?? '').split(',').filter(Boolean);
const columns = asked.length
  ? asked
  : (parquetSchema(metadata).children ?? [])
      .filter((c) => !/^(DOUBLE|FLOAT|INT32|INT64)$/.test(c.element.type ?? '') || c.element.converted_type)
      .map((c) => c.element.name);

console.log(`${path}: ${rowCount.toLocaleString()} rows\n`);
for (const c of columns) {
  const seen = new Set();
  let rows;
  try {
    // One column at a time: reading them together would hold the whole file
    // decoded in memory, and these are hundreds of megabytes.
    rows = await parquetReadObjects({ file, metadata, columns: [c] });
  } catch (err) {
    console.log(`  ${c.padEnd(18)} unreadable — ${err.message}`);
    continue;
  }
  for (const r of rows) {
    const v = r[c];
    seen.add(v instanceof Date ? v.getTime() : v);
  }
  const perValue = rowCount / Math.max(1, seen.size);
  console.log(
    `  ${c.padEnd(18)} ${seen.size.toLocaleString().padStart(9)} distinct  ` +
      `${perValue.toFixed(1).padStart(10)} rows each  ` +
      (seen.size <= 4096 ? 'groupable' : 'id — too many to group by'),
  );
}
