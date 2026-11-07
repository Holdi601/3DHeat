/**
 * Find a headless configuration whose WebGPU canvas is actually composited.
 *
 * Separate from `probe-webgpu.mjs`, which only asks whether an adapter exists.
 * An adapter is not enough: headless Chromium will happily render WebGPU
 * correctly and then never present the canvas, so reading the canvas returns
 * transparent black no matter what was drawn. That distinction decides whether
 * the smoke suite can screenshot the canvas or has to go through the renderer's
 * own `captureFrame()` readback.
 *
 *   node tools/probe-present.mjs [url]
 */
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:5273/?backend=webgpu';

/** Flag sets worth trying, cheapest and most likely first. */
const CONFIGS = [
  {
    name: 'chromium channel, vulkan swiftshader',
    opts: {
      channel: 'chromium',
      args: [
        '--enable-unsafe-webgpu',
        '--enable-features=Vulkan',
        '--disable-vulkan-surface',
        '--use-webgpu-adapter=swiftshader',
        '--ignore-gpu-blocklist',
      ],
    },
  },
  {
    name: 'chromium channel, vulkan swiftshader, headless=old',
    opts: {
      channel: 'chromium',
      args: [
        '--headless=old',
        '--enable-unsafe-webgpu',
        '--enable-features=Vulkan',
        '--disable-vulkan-surface',
        '--use-webgpu-adapter=swiftshader',
        '--ignore-gpu-blocklist',
      ],
    },
  },
  {
    name: 'chromium channel, no adapter override',
    opts: {
      channel: 'chromium',
      args: ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--ignore-gpu-blocklist'],
    },
  },
  {
    name: 'default build (expected to have no adapter at all)',
    opts: { args: ['--enable-unsafe-webgpu'] },
  },
];

for (const cfg of CONFIGS) {
  let browser;
  try {
    browser = await chromium.launch(cfg.opts);
  } catch (e) {
    console.log(`${cfg.name}: launch failed — ${e.message.split('\n')[0]}`);
    continue;
  }
  try {
    const page = await browser.newPage({ viewport: { width: 640, height: 400 } });
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Wait for a backend rather than a fixed delay: adapter acquisition is async.
    let backend = 'none';
    const deadline = Date.now() + 12000;
    while (Date.now() < deadline) {
      backend =
        (await page.evaluate(() => globalThis.__3dheat?.useStore.getState().stats.backend)) ??
        'none';
      if (backend && backend !== 'none') break;
      await page.waitForTimeout(200);
    }

    if (backend === 'none') {
      console.log(`${cfg.name}: no backend`);
      continue;
    }

    await page.evaluate(() => globalThis.__3dheat.load(200_000));
    await page.waitForTimeout(2000);

    // Two readings of the same frame: through the compositor, and through the
    // renderer's own readback. Disagreement is the whole point of this probe.
    const composited = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      const t = document.createElement('canvas');
      t.width = 64;
      t.height = 40;
      const ctx = t.getContext('2d');
      ctx.drawImage(c, 0, 0, t.width, t.height);
      const d = ctx.getImageData(0, 0, t.width, t.height).data;
      let nonZero = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] || d[i + 1] || d[i + 2]) nonZero++;
      }
      return (nonZero / (d.length / 4)) * 100;
    });

    const captured = await page.evaluate(async () => {
      const eng = globalThis.__3dheat_engine;
      if (!eng.captureFrame) return null;
      const f = await eng.captureFrame();
      if (!f) return null;
      let nonZero = 0;
      const n = f.width * f.height;
      for (let i = 0; i < n; i++) {
        const o = i * 4;
        if (f.rgba[o] || f.rgba[o + 1] || f.rgba[o + 2]) nonZero++;
      }
      return (nonZero / n) * 100;
    });

    console.log(
      `${cfg.name}: backend ${backend}, composited ${composited.toFixed(1)}% non-black, ` +
        `readback ${captured === null ? 'unavailable' : `${captured.toFixed(1)}%`}`,
    );
    if (composited < 1 && captured !== null && captured > 1) {
      console.log('   -> renders but does not present; the suite must use captureFrame()');
    } else if (composited > 1) {
      console.log('   -> presents the canvas; screenshots are usable');
    }
  } catch (e) {
    console.log(`${cfg.name}: failed — ${e.message.split('\n')[0]}`);
  } finally {
    await browser.close();
  }
}
