/**
 * What do the group labels look like once a numeric column becomes the group?
 *
 * Teams mode indexes the hue circle by `dataset.teamId`, which is a *dictionary
 * index*, not the value in the file. So "unassigned is 0" is a fact about the
 * parquet column and says nothing about which slice of the circle it lands on —
 * and giving unassigned rows a hue of their own is what makes every AI row read
 * as a team. To mark it neutral, the label has to be findable.
 *
 *   node tools/check_team_labels.mjs <parquet file>
 */
import { readFileSync } from 'node:fs';
import { previewSource } from '../src/data/sourcePreview.ts';
import { autoMap } from '../src/data/automap.ts';
import { ingestFiles } from '../src/data/ingestFiles.ts';

const path = process.argv[2];
const file = () => new File([readFileSync(path)], path.split(/[\\/]/).pop());
const p = await previewSource(file());
const mapping = autoMap({
  columns: p.columns,
  rows: p.rows,
  numeric: p.numeric,
  logicalTypes: p.logicalTypes,
});
const { dataset } = await ingestFiles({
  files: [file()],
  mapping,
  columns: p.columns,
  name: 'labels',
});
const labels = dataset.teamLabels;
console.log(`group column: ${mapping.teamId}`);
console.log(`${labels.length} labels, types: ${new Set(labels.map((l) => typeof l)).size} distinct`);
console.log(`first 12: ${JSON.stringify(labels.slice(0, 12))}`);
console.log(`index of "0": ${labels.indexOf('0')}`);
console.log(`index of 0 (number): ${labels.indexOf(0)}`);
// How many rows sit on that index, since that is the "everything is green" mass.
const zero = labels.indexOf('0') >= 0 ? labels.indexOf('0') : labels.indexOf(0);
if (zero >= 0 && dataset.teamId) {
  let n = 0;
  for (let i = 0; i < dataset.count; i++) if (dataset.teamId[i] === zero) n++;
  console.log(
    `rows on the unassigned label: ${n.toLocaleString()} of ${dataset.count.toLocaleString()}` +
      ` (${((n / dataset.count) * 100).toFixed(1)}%)`,
  );
}
