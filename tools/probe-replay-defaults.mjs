/**
 * Which drawing path does box replay take straight after a load?
 *
 * `buildCubes` draws one cube per person who is live at the playhead — a few
 * hundred on this data. `buildRawSamples` draws up to 65,536 rows sampled from
 * the whole dataset, ignoring who is live, and is chosen whenever the timeline
 * is showing everything or "show every sample" is on. Those two produce very
 * different pictures and very different cube counts, and the HUD calls both
 * "Cubes", so the number alone does not say which one ran.
 *
 *   node tools/probe-replay-defaults.mjs [file...]
 */
import { chromium } from 'playwright';
import { localSample } from './local-data.mjs';

const files = process.argv.slice(2);
const targets = files.length
  ? files
  : [localSample('primary', 0)];

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.goto('http://127.0.0.1:5273/?backend=webgl2', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40000 });

const out = await page.evaluate(async (targets) => {
  const { previewSource } = await import('/src/data/sourcePreview.ts');
  const { autoMap } = await import('/src/data/automap.ts');
  const { ingestFiles } = await import('/src/data/ingestFiles.ts');

  const loaded = [];
  for (const t of targets) {
    const bytes = await (await fetch('/' + t)).arrayBuffer();
    loaded.push(new File([bytes], t.split('/').pop()));
  }
  const p = await previewSource(loaded[0]);
  const mapping = autoMap({
    columns: p.columns,
    rows: p.rows,
    numeric: p.numeric,
    logicalTypes: p.logicalTypes,
    fileCount: loaded.length,
  });
  const ds = (await ingestFiles({ files: loaded, mapping, columns: p.columns, name: 'defaults' }))
    .dataset;

  const s = globalThis.__3dheat.useStore.getState();
  s.setDataset(ds);
  await new Promise((r) => setTimeout(r, 1500));
  globalThis.__3dheat.useStore.getState().setMode('team');

  const settle = async (frames = 40) => {
    for (let i = 0; i < frames; i++) await new Promise((r) => requestAnimationFrame(r));
  };
  await settle();

  const read = () => {
    const st = globalThis.__3dheat.useStore.getState();
    const live = globalThis.__3dheat_engine.live;
    return {
      timelineMode: st.timeline.mode,
      window: st.timeline.window,
      windowSeconds: st.timeline.windowSeconds,
      defaultLifetime: st.timeline.defaultLifetime,
      showRawSamples: st.team.showRawSamples,
      interpolate: st.team.interpolate,
      trailSeconds: st.team.trailSeconds,
      session: st.team.session,
      // `mode: 'all'` means the playhead is irrelevant and every sample is fair
      // game, which is what sends the draw down the raw-sample path.
      drawsEverySample: st.timeline.mode === 'all' || st.team.showRawSamples,
      cubes: live.cubes,
      rowsInWindow: live.rowsInWindow ?? null,
    };
  };

  const onLoad = read();

  // And the same view once the timeline is actually windowing time.
  const st = globalThis.__3dheat.useStore.getState();
  st.patchTimeline({ mode: 'play' });
  st.seek(ds.time[ds.count >> 1]);
  await settle();
  const windowed = read();

  return {
    rows: ds.count,
    persons: ds.personLabels.length,
    timeRange: ds.timeRange,
    onLoad,
    windowed,
  };
}, targets);

console.log(JSON.stringify(out, null, 1));
await browser.close();
