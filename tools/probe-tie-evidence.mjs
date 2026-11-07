/**
 * The rows the *app* thinks are simultaneous, for a name that is not a bot.
 *
 * Python says one export holds 15 names in two places at once; the app's own
 * detection says 2,543. One of the two is wrong about what it is looking at, and
 * the only way to tell is to print the values the app actually holds — time,
 * position, session and category ids — for a pair it marked.
 *
 *   node tools/probe-tie-evidence.mjs [path-under-TestData]
 */
import { chromium } from 'playwright';
import { localSample } from './local-data.mjs';

const target =
  process.argv[2] ?? localSample('secondary', 1);
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.goto('http://127.0.0.1:5273/?backend=webgl2', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40000 });

const out = await page.evaluate(async (target) => {
  const { previewSource } = await import('/src/data/sourcePreview.ts');
  const { autoMap } = await import('/src/data/automap.ts');
  const { ingestFiles } = await import('/src/data/ingestFiles.ts');
  const bytes = await (await fetch('/' + target)).arrayBuffer();
  const file = new File([bytes], target.split('/').pop());
  const p = await previewSource(file);
  const mapping = autoMap({
    columns: p.columns,
    rows: p.rows,
    numeric: p.numeric,
    logicalTypes: p.logicalTypes,
    fileCount: 1,
  });
  const ds = (await ingestFiles({ files: [file], mapping, columns: p.columns, name: 'e' })).dataset;

  const { time, px, py, pz, personId, sessionId, count } = ds;
  const cats = ds.attrs.filter((a) => a.kind === 'category');

  // Repeat the detection here so the evidence can be captured alongside it.
  const last = new Int32Array(ds.personLabels.length).fill(-1);
  const found = [];
  let ties = 0;
  let tiesDisplaced = 0;
  let minPositiveGap = Infinity;
  for (let i = 0; i < count; i++) {
    const pi = personId[i];
    const prev = last[pi];
    last[pi] = i;
    if (prev < 0) continue;
    if (sessionId && sessionId[prev] !== sessionId[i]) continue;
    const gap = time[i] - time[prev];
    if (gap > 0 && gap < minPositiveGap) minPositiveGap = gap;
    if (gap !== 0) continue;
    ties++;
    const d = Math.hypot(px[i] - px[prev], py[i] - py[prev], pz[i] - pz[prev]);
    if (d === 0) continue;
    tiesDisplaced++;
    const label = ds.personLabels[pi] || '(blank)';
    if (found.length < 4 && !label.toLowerCase().startsWith('bp_')) {
      found.push({
        name: label,
        rows: [prev, i],
        time: [time[prev], time[i]],
        gapExactlyZero: time[prev] === time[i],
        session: sessionId ? [sessionId[prev], sessionId[i]] : null,
        pos: [
          [px[prev], py[prev], pz[prev]],
          [px[i], py[i], pz[i]],
        ],
        distance_m: +(d / 100).toFixed(1),
        categories: cats.map((c) => ({
          name: c.name,
          values: [c.categories[c.data[prev]], c.categories[c.data[i]]],
        })),
      });
    }
  }

  // How many instants does the column actually distinguish? A 10-second sample
  // rate over this span should give thousands.
  const distinct = new Set();
  for (let i = 0; i < count; i++) {
    distinct.add(time[i]);
    if (distinct.size > 20000) break;
  }
  const firstTimes = Array.from(time.subarray(0, 10));
  const sorted = [...distinct].sort((a, b) => a - b).slice(0, 8);

  return {
    rows: count,
    distinctTimeValues: distinct.size > 20000 ? '>20000' : distinct.size,
    firstTimes,
    lowestInstants: sorted,
    previewRawTime: null,
    epochMs: ds.epochMs,
    timeRange: ds.timeRange,
    timeSpan_s: ds.timeRange[1] - ds.timeRange[0],
    // What a float32 can still tell apart at this magnitude. If the smallest
    // real gap is below it, distinct instants collapse into one.
    float32StepAtRange: Math.abs(ds.timeRange[1]) * 2 ** -23,
    smallestNonZeroGapSeen: minPositiveGap,
    ties,
    tiesDisplaced,
    evidence: found,
  };
}, target);

console.log(JSON.stringify(out, null, 1));
await browser.close();
