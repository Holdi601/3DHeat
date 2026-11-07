/**
 * Does the cube count move from frame to frame?
 *
 * "Flashing in and out" is a per-frame effect, so it has to be measured per
 * frame. Earlier probes stepped the playhead in seconds and found the drawn set
 * stable, which rules out the data but not the drawing. This samples `live.cubes`
 * every frame, at rest and while the camera flies.
 *
 *   node tools/probe-cube-flicker.mjs [file...]
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
  const ds = (await ingestFiles({ files: loaded, mapping, columns: p.columns, name: 'flick' }))
    .dataset;

  const s = globalThis.__3dheat.useStore.getState();
  s.setDataset(ds);
  await new Promise((r) => setTimeout(r, 1500));
  globalThis.__3dheat.useStore.getState().setMode('team');
  for (let i = 0; i < 40; i++) await new Promise((r) => requestAnimationFrame(r));

  const sample = async (frames) => {
    const counts = [];
    for (let i = 0; i < frames; i++) {
      await new Promise((r) => requestAnimationFrame(r));
      counts.push(globalThis.__3dheat_engine.live.cubes);
    }
    let changes = 0;
    for (let i = 1; i < counts.length; i++) if (counts[i] !== counts[i - 1]) changes++;
    return {
      frames: counts.length,
      min: Math.min(...counts),
      max: Math.max(...counts),
      framesWhereItChanged: changes,
      zeroFrames: counts.filter((c) => c === 0).length,
      first12: counts.slice(0, 12),
    };
  };

  const still = await sample(60);

  // Now fly, which is the state the screenshots were taken in.
  const canvas = document.querySelector('canvas');
  const fly = () => {
    canvas.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'w', code: 'KeyW', bubbles: true }),
    );
  };
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w', code: 'KeyW', bubbles: true }));
  fly();
  const moving = await sample(60);
  window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w', code: 'KeyW', bubbles: true }));

  // And with the timeline actually playing.
  globalThis.__3dheat.useStore.getState().patchTimeline({ mode: 'play', playing: true });
  globalThis.__3dheat.useStore.getState().seek(ds.time[ds.count >> 1]);
  for (let i = 0; i < 20; i++) await new Promise((r) => requestAnimationFrame(r));
  const playing = await sample(60);

  return { rows: ds.count, still, moving, playing };
}, targets);

console.log(JSON.stringify(out, null, 1));
await browser.close();
