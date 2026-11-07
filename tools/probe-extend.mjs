/**
 * Why does extending a cumulative window add nothing?
 *
 * The engine reports the right increment and the right mode, and the field does
 * not move. This reads the renderer's own account of what the heat pass did —
 * draw calls issued, sprites submitted, and the GL error afterwards — because a
 * rejected draw is silent and looks exactly like having no data.
 *
 *   node tools/probe-extend.mjs
 */
import { chromium } from 'playwright';

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (e) => console.log('pageerror:', e.message));
page.on('console', (m) => {
  if (m.type() === 'error') console.log('console:', m.text());
});
await page.goto('http://127.0.0.1:5273/?backend=webgl2', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2600);

await page.evaluate(async () => {
  const s = globalThis.__3dheat.useStore.getState();
  s.setLevel(null);
  const ds = globalThis.__3dheat.generateSynthetic({
    ...globalThis.__3dheat.DEFAULT_SYNTH,
    rows: 3_000_000,
  });
  s.setDataset(ds);
  s.setMode('heat-simple');
  const eng = globalThis.__3dheat_engine;
  eng.applyPreset('Top');
  eng.frameDataset(true);
  s.patchBudget({ adaptive: false, progressive: true, splatsPerFrame: 128 * 1024 });
  s.patchHeat({ groundProjected: true });
  const [lo, hi] = ds.timeRange;
  s.patchTimeline({ mode: 'play', window: 'cumulative', loop: false, speed: (hi - lo) / 25 });
  s.seek(lo);
  await new Promise((r) => setTimeout(r, 1000));
  globalThis.__3dheat.useStore.getState().setPlaying(true);
});

const NAMES = {
  0: 'NO_ERROR',
  1280: 'INVALID_ENUM',
  1281: 'INVALID_VALUE',
  1282: 'INVALID_OPERATION',
  1285: 'OUT_OF_MEMORY',
  1286: 'INVALID_FRAMEBUFFER_OPERATION',
};

for (let i = 0; i < 12; i++) {
  await page.waitForTimeout(300);
  const s = await page.evaluate(async () => {
    const eng = globalThis.__3dheat_engine;
    const d = eng.renderer.heatDebug;
    const raw = await eng.renderer.readHeatField(20000);
    let sum = 0;
    if (raw) for (const v of raw) sum += v;
    const cc = document.createElement('canvas');
    cc.width = 200; cc.height = 125;
    const cx = cc.getContext('2d');
    cx.drawImage(eng.canvas, 0, 0, cc.width, cc.height);
    const px = cx.getImageData(0, 0, cc.width, cc.height).data;
    let nonBg = 0;
    for (let k = 0; k < px.length; k += 4) {
      if (Math.abs(px[k]-22)>10 || Math.abs(px[k+1]-23)>10 || Math.abs(px[k+2]-26)>10) nonBg++;
    }
    const cov = (nonBg / (px.length/4)) * 100;
    return {
      mode: d.mode,
      draws: d.draws,
      sprites: d.sprites,
      error: d.error,
      drawError: d.drawError, minRow: d.minRow, maxRow: d.maxRow, blockStart: d.blockStart, weight: d.weight, cov, uploadError: d.uploadError,
      sum,
      playhead: eng.live.playhead,
      candidates: eng.live.candidates,
      gain: eng.live.accumMode,
    };
  });
  console.log(
    `t=${(i * 0.3).toFixed(1)}  mode ${String(s.mode).padEnd(7)} draws ${String(s.draws).padStart(3)}  ` +
      `sprites ${String(s.sprites).padStart(7)}  err ${NAMES[s.error] ?? s.error} drawErr ${NAMES[s.drawError] ?? s.drawError}  ` +
      `sum ${s.sum.toFixed(0).padStart(9)}  head ${s.playhead.toFixed(0).padStart(5)}  ` +
      `cand ${String(s.candidates).padStart(6)}  cov ${s.cov.toFixed(2)}%  rows ${s.minRow}..${s.maxRow} blk ${s.blockStart} upErr ${NAMES[s.uploadError] ?? s.uploadError} w ${s.weight.toFixed(3)}`,
  );
}

await browser.close();









