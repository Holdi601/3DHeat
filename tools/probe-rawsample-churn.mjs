/**
 * Does the raw-sample scatter keep the same rows from frame to frame?
 *
 * `buildRawSamples` decimates by a stride computed from how many rows are in
 * range: `step = floor(rows / take)`. If that range grows — a cumulative window
 * with the playhead moving — the stride changes, and a different one-in-N subset
 * is chosen. Every cube would then be replaced by a different cube, every frame,
 * which is what "flashing in and out" looks like from the outside.
 *
 * This measures the overlap between consecutive draws.
 *
 *   node tools/probe-rawsample-churn.mjs [file]
 */
import { chromium } from 'playwright';
import { localSample } from './local-data.mjs';

const target =
  process.argv[2] ?? localSample('primary', 0);

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
  const { TrackCursor, CUBE_STRIDE } = await import('/src/data/tracks.ts');

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
  const ds = (await ingestFiles({ files: [file], mapping, columns: p.columns, name: 'churn' }))
    .dataset;

  const all = () => true;
  const key = (data, i) =>
    `${data[i * CUBE_STRIDE].toFixed(1)},${data[i * CUBE_STRIDE + 1].toFixed(1)},${data[i * CUBE_STRIDE + 2].toFixed(1)}`;

  const run = (label, spans) => {
    const cursor = new TrackCursor(ds);
    const steps = [];
    let previous = null;
    for (const { t, span } of spans) {
      cursor.update(t);
      const { data, count } = cursor.buildRawSamples(t, span, all);
      const now = new Set();
      for (let i = 0; i < count; i++) now.add(key(data, i));
      let kept = 0;
      if (previous) for (const k of now) if (previous.has(k)) kept++;
      steps.push({
        t: +t.toFixed(1),
        cubes: count,
        keptFromPreviousPct: previous ? +((100 * kept) / Math.max(1, now.size)).toFixed(1) : null,
      });
      previous = now;
    }
    return { label, steps };
  };

  const [lo, hi] = ds.timeRange;
  // A playhead moving through the data, one second of playback apart.
  const moving = [];
  for (let k = 0; k < 6; k++) moving.push({ t: lo + (hi - lo) * (0.5 + k * 0.002), span: Infinity });
  // The same instants with a fixed thirty-second window instead.
  const fixed = moving.map((m) => ({ t: m.t, span: 30 }));
  // And a still playhead, to separate "the data moved" from "the choice moved".
  const still = moving.map(() => ({ t: moving[0].t, span: Infinity }));

  return {
    rows: ds.count,
    cumulativeMovingPlayhead: run('cumulative, playhead moving', moving),
    fixedWindow: run('30s window, playhead moving', fixed),
    stillPlayhead: run('cumulative, playhead still', still),
  };
}, target);

console.log(JSON.stringify(out, null, 1));
await browser.close();
