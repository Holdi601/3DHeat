/**
 * Does the canvas keep showing the last frame once the engine stops drawing?
 *
 * The engine deliberately skips work when a converged view has not changed. That
 * is only safe if the canvas *retains* what was last drawn. A WebGL context made
 * without `preserveDrawingBuffer` is explicitly allowed to have its drawing buffer
 * cleared after compositing — so "stop drawing" can mean "the picture disappears",
 * which is what a user sees as the heat fading out when they stop moving.
 *
 * Every earlier probe read pixels with `drawImage` or the renderer's own readback,
 * both of which bypass the compositor and therefore cannot see this. This one uses
 * Playwright screenshots, which go through the compositor and show what is on
 * screen.
 *
 *   node tools/probe-present.mjs [url]
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const url = process.argv[2] ?? 'http://127.0.0.1:5273/?backend=webgl2';
mkdirSync('tools/.smoke', { recursive: true });

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (e) => console.log('pageerror:', e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);

await page.evaluate(() => {
  const s = globalThis.__3dheat.useStore.getState();
  s.setLevel(null);
  s.setDataset(
    globalThis.__3dheat.generateSynthetic({
      ...globalThis.__3dheat.DEFAULT_SYNTH,
      rows: 2_000_000,
    }),
  );
  s.setMode('heat-simple');
  s.patchTimeline({ mode: 'all', playing: false });
  // A generous fixed budget so it converges in one frame and settles into the
  // skip path quickly, which is the state being tested.
  s.patchBudget({ adaptive: false, progressive: true, splatsPerFrame: 8 * 1024 * 1024 });
});
await page.waitForTimeout(1200);
await page.evaluate(() => {
  const eng = globalThis.__3dheat_engine;
  eng.applyPreset('Top');
  eng.frameDataset(true);
});
await page.waitForTimeout(2000);

/** Screenshot the canvas through the compositor. */
async function shot(label) {
  const png = await page.locator('canvas').screenshot();
  writeFileSync(`tools/.smoke/retain-${label}.png`, png);
  return png;
}

/** Mean luma of a PNG, decoded in the browser so no image library is needed. */
async function luma(png) {
  const b64 = png.toString('base64');
  return page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = 240;
    c.height = 150;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, c.width, c.height);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let sum = 0;
    let lit = 0;
    const n = c.width * c.height;
    for (let i = 0; i < n; i++) {
      const o = i * 4;
      sum += 0.2126 * d[o] + 0.7152 * d[o + 1] + 0.0722 * d[o + 2];
      if (d[o] > 40 || d[o + 1] > 40 || d[o + 2] > 45) lit++;
    }
    return { luma: sum / n, lit: (lit / n) * 100 };
  }, b64);
}

const attrs = await page.evaluate(() => {
  const eng = globalThis.__3dheat_engine;
  const c = eng.canvas;
  const gl = c.getContext('webgl2');
  const a = gl?.getContextAttributes?.();
  return {
    backend: eng.live.backend,
    preserveDrawingBuffer: a?.preserveDrawingBuffer ?? null,
    alpha: a?.alpha ?? null,
    antialias: a?.antialias ?? null,
  };
});
console.log('context:', attrs);

console.log('\n--- while the camera is being moved every frame');
for (let i = 0; i < 4; i++) {
  await page.evaluate(() => {
    const c = globalThis.__3dheat_engine.camera;
    c.setOrientationDegrees(c.yawDegrees + 0.4, c.pitchDegrees);
  });
  await page.waitForTimeout(220);
  const s = await luma(await shot(`moving-${i}`));
  const mode = await page.evaluate(() => globalThis.__3dheat_engine.live.accumMode);
  console.log(`  moving ${i}  luma ${s.luma.toFixed(2)}  lit ${s.lit.toFixed(2)}%  mode ${mode}`);
}

console.log('\n--- now perfectly still, watching what the compositor shows');
for (let i = 0; i < 14; i++) {
  await page.waitForTimeout(700);
  const s = await luma(await shot(`still-${i}`));
  const live = await page.evaluate(() => {
    const l = globalThis.__3dheat_engine.live;
    return { mode: l.accumMode, frames: l.frames, accum: l.accumFrames };
  });
  console.log(
    `  still ${String(i).padStart(2)}  luma ${s.luma.toFixed(2)}  lit ${s.lit.toFixed(2)}%` +
      `  mode ${String(live.mode).padEnd(5)} frames ${live.frames} accum ${live.accum}`,
  );
}

await browser.close();
