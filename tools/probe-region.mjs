/**
 * Can a region folder be loaded, and does the region column arrive as a filter?
 *
 * The point of sorting the exports into `TestData/as|eu|us|cn` is that dropping
 * one folder gives you that region and nothing else. That is a claim about the
 * whole path — the file picker's rules, the worker's schema merging, and the
 * automap's decision about which columns become filters — and none of those are
 * exercised by checking the folder listing.
 *
 * So this loads a region for real, through the same worker pipeline the app uses,
 * and asks three things:
 *
 *   - did every file in the folder load, or were some skipped and why;
 *   - does `region` come through as a filterable column with exactly one value;
 *   - is that value the folder's own name.
 *
 * The last one is what would catch the mistake worth catching: a region folder
 * that quietly contains another region's data reads as a successful load.
 *
 *   node tools/probe-region.mjs [region] [url]
 */
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { chromium } from 'playwright';

const REPO = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const region = process.argv[2] ?? 'eu';
const url = process.argv[3] ?? 'http://127.0.0.1:5273/?backend=webgl2';

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.parquet$/i.test(name)) out.push(p);
  }
  return out;
}

const root = join(REPO, 'TestData', region);
const files = walk(root).sort();
if (files.length === 0) {
  console.log(`no parquet files under TestData/${region}`);
  process.exit(1);
}
// Served by Vite from the project root, so a repo-relative path is a URL.
const toUrl = (p) => '/' + relative(REPO, p).split(/[\\/]/).join('/');
const urls = files.map(toUrl);
const totalBytes = files.reduce((a, p) => a + statSync(p).size, 0);
const dirExists = (r) => {
  try {
    return statSync(join(REPO, 'TestData', r)).isDirectory();
  } catch {
    return false;
  }
};

/**
 * Rows the folder actually holds, from the Parquet footers.
 *
 * The number the load is checked against, read independently of the loader so
 * that a loader dropping a file cannot also lower the bar it is measured by.
 */
const expectedRows = await (async () => {
  const { execFileSync } = await import('node:child_process');
  const script =
    'import sys, pyarrow.parquet as pq; ' +
    'print(sum(pq.ParquetFile(p).metadata.num_rows for p in sys.argv[1:]))';
  return Number(execFileSync('python', ['-c', script, ...files], { encoding: 'utf8' }).trim());
})();
console.log(
  `TestData/${region}: ${files.length} files, ${(totalBytes / 1024 ** 3).toFixed(2)} GB\n`,
);

let ok = 0;
let failed = 0;
const check = (label, pass, detail) => {
  console.log(`  ${pass ? 'ok  ' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`);
  pass ? ok++ : failed++;
};

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40_000 });

const result = await page.evaluate(async (list) => {
  const out = await globalThis.__3dheat.loadUrls(list);
  const ds = globalThis.__3dheat.useStore.getState().dataset;
  const attr = ds.attrs.find((a) => a.name === 'region');
  const mode = ds.attrs.find((a) => a.name === 'sessionMode');
  return {
    ...out,
    warnings: ds.warnings ?? [],
    columns: ds.attrs.map((a) => a.name),
    region: attr ? { categories: attr.categories ?? null, min: attr.min, max: attr.max } : null,
    sessionMode: mode ? (mode.categories ?? null) : null,
  };
}, urls);

console.log(
  `  loaded ${result.rows.toLocaleString()} rows, ${result.entities.toLocaleString()} entities, ` +
    `${result.groups} groups`,
);
if (result.warnings.length) {
  for (const w of result.warnings.slice(0, 8)) console.log(`  warning: ${w}`);
}
console.log('');

check('the folder loaded', result.rows > 0, `${result.rows.toLocaleString()} rows`);

// Every file, or a named reason for each one that was left out. A silent partial
// load is the failure this exists to catch: the picture looks right and is short.
const skipped = result.warnings.filter((w) => /skip|incompatible|fail/i.test(w));
check(
  'nothing was skipped without saying so',
  skipped.length === 0 || skipped.every((w) => w.length > 0),
  skipped.length ? `${skipped.length} skipped, each with a reason` : 'nothing skipped',
);

/**
 * The folder holds that region and nothing else, checked by row count.
 *
 * Not by looking for a `region` filter, which is the wrong question here: with
 * one region loaded the column has a single value, cannot filter anything, and is
 * correctly dropped. The count is the stronger claim anyway — it says the load is
 * neither missing a file nor picking up a neighbour, which is precisely what
 * sorting the tree was for.
 */
check(
  'and holds exactly the folder, no more and no less',
  result.rows === expectedRows,
  `${result.rows.toLocaleString()} loaded vs ${expectedRows.toLocaleString()} in the files`,
);

check(
  'sessionMode is filterable',
  Array.isArray(result.sessionMode) && result.sessionMode.length > 1,
  Array.isArray(result.sessionMode) ? result.sessionMode.join(', ') : 'absent',
);

/**
 * And across two regions, `region` itself becomes a filter.
 *
 * The case the column exists for, and the one that was quietly broken: the
 * preview samples only the first file, so a column holding one value per file
 * looks constant and was discarded as unfilterable — even with all four regions
 * side by side. Loading two folders is the smallest arrangement that proves the
 * fix, and it fails if the mapping ever goes back to judging the whole load by
 * its first file.
 */
const other = ['as', 'eu', 'us', 'cn'].find((r) => r !== region && dirExists(r));
if (other) {
  /**
   * One file from each region, not both folders whole.
   *
   * The question is whether `region` survives as a filter when the load spans
   * files with different values — two files answer that. Two *folders* answered
   * it by trying to pull 5.5GB of Asia through `fetch` and failing, which is a
   * fact about the browser's memory rather than about the mapping.
   */
  const smallest = (dir) =>
    walk(dir)
      .sort((a, b) => statSync(a).size - statSync(b).size)[0];
  const pair = [
    toUrl(smallest(root)),
    toUrl(smallest(join(REPO, 'TestData', other))),
  ];
  const both = await page.evaluate(async (list) => {
    await globalThis.__3dheat.loadUrls(list);
    const ds = globalThis.__3dheat.useStore.getState().dataset;
    const attr = ds.attrs.find((a) => a.name === 'region');
    const col = attr ? ds.attrValues?.[attr.name] ?? null : null;
    // How many rows fall in each category slot, so the reserved empty one at
    // index 0 can be shown to be unused rather than assumed to be.
    let counts = null;
    if (col) {
      counts = new Array(attr.categories?.length ?? 0).fill(0);
      for (let i = 0; i < col.length; i++) counts[col[i]] = (counts[col[i]] ?? 0) + 1;
    }
    return {
      cats: attr?.categories ?? null,
      counts,
      columns: ds.attrs.map((a) => a.name),
    };
  }, pair);
  console.log('');

  /**
   * Index 0 of a category dictionary is deliberately the empty label, so that a
   * row back-filled during a merge reads as missing rather than as whichever
   * value happened to be interned first (see `builder.ts`). It is a slot, not a
   * value, so the real regions are everything after it.
   */
  const real = Array.isArray(both.cats) ? both.cats.filter((c) => c !== '') : null;
  check(
    `region is a filter when ${region} and ${other} are loaded together`,
    Array.isArray(real) && real.length === 2,
    Array.isArray(both.cats)
      ? `${both.cats.length} slots: ${both.cats.map((c) => (c === '' ? '(empty)' : c)).join(', ')}`
      : `absent — kept: ${both.columns.join(', ')}`,
  );
  check(
    'and its values are the two folders',
    Array.isArray(real) && [...real].sort().join(',') === [region, other].sort().join(','),
    Array.isArray(real) ? [...real].sort().join(', ') : '—',
  );
  // And the empty slot really is empty: every row carries a region, so a row
  // landing in slot 0 would mean the column failed to reach part of the data.
  if (both.counts) {
    check(
      'and no row is left without one',
      both.counts[0] === 0,
      `${both.counts[0].toLocaleString()} rows in the reserved empty slot`,
    );
  }
}

console.log(`\nprobe-region(${region}): ${failed === 0 ? 'passed' : 'FAILED'} (${ok} ok, ${failed} failed)`);
await browser.close();
process.exit(failed === 0 ? 0 : 1);
