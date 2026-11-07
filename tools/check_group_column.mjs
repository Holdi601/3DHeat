/**
 * Which column does the viewer actually colour by?
 *
 * Teams mode divides the hue circle by `dataset.teamLabels.length` and indexes it
 * with `dataset.teamId` — that is, by whatever column the automap chose as the
 * *group*. Nothing in the mode knows about `spawnTeam` or `realTeam` by name.
 *
 * So before judging a derivation by the picture it produced, this asks the
 * mapping what it picked. If the group is `Name`, twenty-five thousand hues are
 * being drawn and the picture says nothing about the spawn columns at all.
 *
 *   node tools/check_group_column.mjs <parquet file> [more...]
 */
import { readFileSync } from 'node:fs';
import { previewSource } from '../src/data/sourcePreview.ts';
import { autoMap, MAX_AUTO_FILTER_COLUMNS } from '../src/data/automap.ts';

const paths = process.argv.slice(2);
if (paths.length === 0) {
  console.log('usage: node tools/check_group_column.mjs <parquet file> [more...]');
  process.exit(2);
}

for (const path of paths) {
  const file = new File([readFileSync(path)], path.split(/[\\/]/).pop());
  const p = await previewSource(file);
  const m = autoMap({
    columns: p.columns,
    rows: p.rows,
    numeric: p.numeric,
    logicalTypes: p.logicalTypes,
    fileCount: paths.length,
  });
  console.log(`\n${path}`);
  console.log(`  columns: ${p.columns.join(', ')}`);
  console.log(`  group  (teamId)  -> ${m.teamId ?? '(none)'}`);
  console.log(`  person (personId)-> ${m.personId ?? '(none)'}`);
  console.log(`  session          -> ${m.sessionId ?? '(none)'}`);
  console.log(`  filters (max ${MAX_AUTO_FILTER_COLUMNS}) -> ${m.extra.join(', ') || '(none)'}`);
}
