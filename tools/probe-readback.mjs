/**
 * Does repeated GPU readback take the page down?
 *
 * The WebGPU smoke run failed intermittently — roughly two runs in three — with
 * "Execution context was destroyed, most likely because of a navigation" around
 * the tests that read the heat target back to the CPU. Nothing navigates, so that
 * message means the renderer process died. The suspects are all readback:
 * `probeHeat` (one texel, called in an 81-point grid), `captureFrame` (the whole
 * canvas), and `readHeatField` (the whole heat target, megabytes).
 *
 * This isolates them. Each is hammered on its own with a crash listener attached,
 * so a death is reported against one call site instead of against whichever smoke
 * test happened to be running.
 *
 *   node tools/probe-readback.mjs [url] [rounds]
 */
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:5273/?backend=webgpu&heat=f16';
const rounds = Number(process.argv[3] ?? 6);
const wantWebgpu = /backend=webgpu/.test(url);

const browser = await chromium.launch({
  ...(wantWebgpu ? { channel: 'chromium' } : {}),
  args: wantWebgpu
    ? [
        '--enable-unsafe-webgpu',
        '--enable-features=Vulkan',
        '--disable-vulkan-surface',
        '--use-webgpu-adapter=swiftshader',
        '--ignore-gpu-blocklist',
      ]
    : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

let dead = null;
page.on('crash', () => {
  dead = 'renderer process crashed';
});
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
page.on('console', (m) => {
  if (m.type() === 'error') console.log('  console error:', m.text());
});

await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);

await page.evaluate(() => {
  const s = globalThis.__3dheat.useStore.getState();
  s.setLevel(null);
  s.setDataset(globalThis.__3dheat.generateSynthetic(globalThis.__3dheat.DEFAULT_SYNTH));
  s.setMode('heat-simple');
  s.patchTimeline({ mode: 'all', playing: false });
});
await page.waitForTimeout(2500);

const backend = await page.evaluate(() => globalThis.__3dheat_engineLive.backend);
const heap = () =>
  page.evaluate(() => {
    const m = performance.memory;
    return m ? Math.round(m.usedJSHeapSize / 1e6) : -1;
  });
console.log(`probe-readback: ${backend}, ${rounds} rounds\n`);

/** Run one readback pattern `rounds` times, reporting the round it dies on. */
async function hammer(name, fn) {
  if (dead) {
    console.log(`  skip ${name} — page already ${dead}`);
    return;
  }
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < rounds; i++) {
    try {
      const r = await page.evaluate(fn);
      const mb = await heap();
      console.log(`  ${name} round ${i + 1}: ${JSON.stringify(r)} heap ${mb}MB`);
    } catch (e) {
      const why = dead ?? 'evaluate threw';
      console.log(`  ${name} DIED on round ${i + 1} (${why}): ${e.message.split('\n')[0]}`);
      return;
    }
  }
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  console.log(`  ${name}: survived ${rounds} rounds in ${(ms / 1000).toFixed(1)}s`);
}

// One texel at a time, over a grid — the pattern the accumulation-buffer test uses.
await hammer('probeHeat x81', async () => {
  const eng = globalThis.__3dheat_engine;
  const W = eng.canvas.width;
  const H = eng.canvas.height;
  let best = 0;
  let n = 0;
  for (let x = 0.3; x <= 0.7; x += 0.05) {
    for (let y = 0.3; y <= 0.7; y += 0.05) {
      const v = await eng.probeHeat(Math.round(W * x), Math.round(H * y), 1);
      n++;
      if (v !== null && v > best) best = v;
    }
  }
  return { calls: n, best: Math.round(best) };
});

// The whole heat target, megabytes per call.
await hammer('readHeatField', async () => {
  const raw = await globalThis.__3dheat_engine.renderer.readHeatField(40000);
  if (!raw) return { samples: 0 };
  let max = 0;
  for (const v of raw) if (v > max) max = v;
  return { samples: raw.length, max: Math.round(max) };
});

// The exposure path: read the field, set the saturation, wait for the redraw.
await hammer('autoExpose', async () => {
  const m = await globalThis.__3dheat_engine.autoExpose();
  await new Promise((r) => setTimeout(r, 400));
  return { saturation: m?.saturation === null || !m ? null : Math.round(m.saturation) };
});

// The full canvas, as the WebGPU brightness reading does.
await hammer('captureFrame', async () => {
  const shot = await globalThis.__3dheat_engine.captureFrame();
  return shot ? { w: shot.width, h: shot.height } : { shot: null };
});

// And all of them interleaved, which is what the smoke run actually does.
await hammer('mixed', async () => {
  const eng = globalThis.__3dheat_engine;
  const out = {};
  out.probe = Math.round((await eng.probeHeat(640, 400, 1)) ?? -1);
  const raw = await eng.renderer.readHeatField(40000);
  out.samples = raw ? raw.length : 0;
  const m = await eng.autoExpose();
  out.sat = m?.saturation == null ? null : Math.round(m.saturation);
  const shot = await eng.captureFrame();
  out.shot = shot ? shot.width : null;
  return out;
});

console.log(dead ? `\nresult: page ${dead}` : '\nresult: page survived every pattern');
await browser.close();
process.exit(dead ? 1 : 0);
