/**
 * Does the GPU budget get ignored, or does residency just take its time?
 *
 * The smoke check waits up to 30s for `resident + dropped` to reach the row
 * count and then reports "budget was ignored" if nothing was dropped — which is
 * also what a machine too busy to finish deciding within 30s looks like. This
 * prints the progression so the two are distinguishable.
 *
 *   node tools/probe-residency.mjs
 */
import { chromium } from 'playwright';
import { localSample } from './local-data.mjs';

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.goto('http://127.0.0.1:5273/?backend=webgl2', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40000 });

const throttled = process.argv.includes('--throttled');

const out = await page.evaluate(async ({ throttled, sample }) => {
  const s = globalThis.__3dheat.useStore.getState();
  if (throttled) {
    // A real dataset first, because the radius below is a fraction of the world
    // extent: without one the fallback extent is 1000 and the sprites stay
    // cheap, which is not the state the smoke run is in by this point.
    const { previewSource } = await import('/src/data/sourcePreview.ts');
    const { autoMap } = await import('/src/data/automap.ts');
    const { ingestFiles } = await import('/src/data/ingestFiles.ts');
    const path = sample;
    const bytes = await (await fetch('/' + path)).arrayBuffer();
    const f = new File([bytes], 'movement.parquet');
    const pv = await previewSource(f);
    const m = autoMap({
      columns: pv.columns,
      rows: pv.rows,
      numeric: pv.numeric,
      logicalTypes: pv.logicalTypes,
      fileCount: 1,
    });
    const real = (await ingestFiles({ files: [f], mapping: m, columns: pv.columns, name: 'r' }))
      .dataset;
    s.setDataset(real);
    await new Promise((r) => setTimeout(r, 1000));

    // And the step immediately before the failing one: ten million synthetic
    // rows made fully resident under a two-gigabyte budget. If the engine
    // decides there is nothing to do when the next dataset has the same shape,
    // the residency counters never move and the budget looks ignored.
    s.patchBudget({ gpuBudgetBytes: 2 * 1024 ** 3 });
    const warm = globalThis.__3dheat.generateSynthetic({
      ...globalThis.__3dheat.DEFAULT_SYNTH,
      rows: 10_000_000,
    });
    s.setDataset(warm);
    const liveWarm = globalThis.__3dheat_engine.live;
    const warmUntil = performance.now() + 30_000;
    while (performance.now() < warmUntil) {
      await new Promise((r) => requestAnimationFrame(r));
      if (liveWarm.residentRows + liveWarm.droppedRows >= warm.count) break;
    }
    // The state the preceding smoke step leaves behind: adaptive control on and
    // a sprite radius a twenty-fifth of the world, which on software rendering
    // puts frames near a tenth of a second each.
    s.patchBudget({ adaptive: true, targetFps: 60, splatsPerFrame: 32 * 1024 * 1024 });
    const extent = s.dataset ? s.dataset.bounds.maxX - s.dataset.bounds.minX : 1000;
    s.patchHeat({ radius: extent / 25 });
    await new Promise((r) => setTimeout(r, 3000));
  }
  s.patchBudget({ gpuBudgetBytes: 40 * 1024 * 1024 });
  const ds = globalThis.__3dheat.generateSynthetic({
    ...globalThis.__3dheat.DEFAULT_SYNTH,
    rows: 10_000_000,
  });
  s.setDataset(ds);
  const live = globalThis.__3dheat_engine.live;
  const trace = [];
  const t0 = performance.now();
  const until = t0 + 60_000;
  let settled = null;
  while (performance.now() < until) {
    await new Promise((r) => requestAnimationFrame(r));
    const at = performance.now() - t0;
    if (trace.length === 0 || at - trace[trace.length - 1].ms > 2000) {
      trace.push({
        ms: Math.round(at),
        resident: live.residentRows,
        dropped: live.droppedRows,
        gpuMB: +(live.gpuBytes / 1048576).toFixed(1),
      });
    }
    if (live.residentRows + live.droppedRows >= ds.count) {
      settled = Math.round(at);
      break;
    }
  }
  return {
    rows: ds.count,
    budgetMB: 40,
    settledAfterMs: settled,
    resident: live.residentRows,
    dropped: live.droppedRows,
    gpuMB: +(live.gpuBytes / 1048576).toFixed(1),
    trace,
  };
}, { throttled, sample: localSample('reload', 0) });

console.log(JSON.stringify(out, null, 1));
await browser.close();

