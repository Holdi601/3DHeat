/**
 * Where does a large load actually spend its time, phase by phase?
 *
 * "It freezes at sorting" is a report about a progress label, and the label is
 * the problem as much as the timing: `ingestFiles` emits one line — "Sorting by
 * time" — and then calls `builder.finish()`, which sorts, permutes nine or ten
 * columns, scans for bounds, builds the roster, summarises sessions and computes
 * per-row lifetimes. All of that happens under that one label with no further
 * update, so a minute of honest work and a genuine hang look identical.
 *
 * This times every label the worker emits and reports the gaps, so the question
 * "is it stuck or is it working" has an answer with numbers in it. It also runs
 * with a wall-clock ceiling, so a real hang ends the probe rather than the probe.
 *
 *   node tools/probe-ingest-phases.mjs [region] [url]
 */
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { chromium } from 'playwright';

const REPO = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const region = process.argv[2] ?? 'us';
const url = process.argv[3] ?? 'http://127.0.0.1:5273/?backend=webgl2';
/** A real hang has to end the probe, not the other way round. */
const CEILING_MS = 8 * 60 * 1000;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.parquet$/i.test(name)) out.push(p);
  }
  return out;
}

const files = walk(join(REPO, 'TestData', region)).sort();
const urls = files.map((p) => '/' + relative(REPO, p).split(/[\\/]/).join('/'));
const mb = files.reduce((a, p) => a + statSync(p).size, 0) / 1024 ** 2;
console.log(`TestData/${region}: ${files.length} files, ${mb.toFixed(0)} MB\n`);

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
page.on('crash', () => console.log('  !! the page crashed (out of memory is the usual cause)'));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40_000 });

// Progress lines are pushed onto the page and drained here, so a phase that runs
// long is visible while it runs rather than only in the final list.
await page.evaluate(() => {
  globalThis.__phases = [];
});
const drain = async () => {
  const rows = await page.evaluate(() => {
    const out = globalThis.__phases ?? [];
    globalThis.__phases = [];
    return out;
  });
  for (const r of rows) console.log(`  ${(r.t / 1000).toFixed(1).padStart(7)}s  ${r.label}`);
  return rows;
};

const started = Date.now();
const run = page.evaluate(async (list) => {
  const { loader } = await import('/src/data/loader.ts');
  const { autoMap } = await import('/src/data/automap.ts');
  const t0 = performance.now();
  const note = (label) => globalThis.__phases.push({ t: performance.now() - t0, label });

  const blobs = [];
  for (const u of list) {
    const res = await fetch(u);
    blobs.push(new File([await res.blob()], u.split('/').pop()));
  }
  note(`fetched ${blobs.length} files`);

  const preview = await loader.preview(blobs[0]);
  const mapping = autoMap({
    columns: preview.columns,
    rows: preview.rows,
    numeric: preview.numeric,
    logicalTypes: preview.logicalTypes,
    fileCount: blobs.length,
  });
  const size = await loader.measure(blobs);
  note(`measured ${size.rows.toLocaleString()} rows`);

  let last = '';
  const ds = await loader.ingest(
    blobs,
    mapping,
    preview.columns,
    'phase probe',
    1,
    size.rows,
    (p) => {
      // Only label *changes*, or the per-file byte progress drowns everything.
      const bare = p.label.replace(/^\[\d+\/\d+\]\s*/, '');
      if (bare !== last) {
        last = bare;
        note(`${bare} (${p.rows.toLocaleString()} rows so far)`);
      }
    },
  );
  note(`done: ${ds.count.toLocaleString()} rows`);
  return { rows: ds.count, ms: performance.now() - t0, warnings: ds.warnings ?? [] };
}, urls);

let result = null;
let timedOut = false;
const poll = (async () => {
  while (result === null && !timedOut) {
    await new Promise((r) => setTimeout(r, 1500));
    await drain().catch(() => {});
  }
})();

try {
  result = await Promise.race([
    run,
    new Promise((_r, reject) =>
      setTimeout(() => {
        timedOut = true;
        reject(new Error(`no completion within ${CEILING_MS / 1000}s`));
      }, CEILING_MS),
    ),
  ]);
} catch (err) {
  timedOut = true;
  await poll;
  await drain().catch(() => {});
  console.log(`\nFAILED — ${err.message}`);
  console.log('The last line above is the phase it stopped in.');
  await browser.close();
  process.exit(1);
}
timedOut = true;
await poll;
await drain().catch(() => {});

console.log(
  `\nloaded ${result.rows.toLocaleString()} rows in ${(result.ms / 1000).toFixed(1)}s ` +
    `(wall ${((Date.now() - started) / 1000).toFixed(1)}s)`,
);
for (const w of result.warnings.slice(0, 4)) console.log(`  warning: ${w}`);
await browser.close();
