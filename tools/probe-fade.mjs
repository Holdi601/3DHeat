/**
 * "Move the camera and the heat looks right; stand still and it fades to grey."
 *
 * Holds the camera *perfectly* still — no nudging, no input — and watches both
 * the raw accumulated field and the composited pixels for several seconds, in
 * every mode combination that could explain it.
 *
 * The distinction being measured:
 *   - raw heat decaying toward zero      => the accumulation is losing energy
 *   - raw heat steady, colour going grey => the ramp is being fed differently
 *   - both steady, only the peak falling => converging on the truth, and the
 *     moving frame was the misleading one
 *
 *   node tools/probe-fade.mjs [url]
 */
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:5273/?backend=webgl2';
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (e) => console.log('pageerror:', e.message));
page.on('console', (m) => {
  if (m.type() === 'error') console.log('console error:', m.text());
});
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);

/**
 * Sample the frame.
 *
 * Reports the accumulated field at its own hottest point, and the composited
 * colour at that same point, so "the heat went away" and "the colour went grey"
 * can be told apart.
 */
const sample = () =>
  page.evaluate(async () => {
    const eng = globalThis.__3dheat_engine;
    const l = eng.live;
    const W = eng.canvas.width;
    const H = eng.canvas.height;

    // Find the hottest sampled point in the raw field, and remember where.
    let peak = 0;
    let hot = 0;
    let px = Math.round(W / 2);
    let py = Math.round(H / 2);
    for (let x = 0.2; x <= 0.8; x += 0.06) {
      for (let y = 0.2; y <= 0.8; y += 0.06) {
        const cx = Math.round(W * x);
        const cy = Math.round(H * y);
        const v = await eng.probeHeat(cx, cy, l.accumFrames);
        if (v !== null && Math.abs(v) > 1e-6) hot++;
        if (v !== null && Math.abs(v) > Math.abs(peak)) {
          peak = v;
          px = cx;
          py = cy;
        }
      }
    }

    // Composited pixels: mean luma over the frame, the count of lit pixels, and
    // the actual colour at the hottest point.
    let rgba = null;
    let n = 0;
    let sw = 0;
    let sh = 0;
    if (l.backend === 'webgpu') {
      const shot = eng.captureFrame ? await eng.captureFrame() : null;
      if (shot) {
        rgba = shot.rgba;
        n = shot.width * shot.height;
        sw = shot.width;
        sh = shot.height;
      }
    } else {
      const c = document.createElement('canvas');
      c.width = 320;
      c.height = 200;
      const ctx = c.getContext('2d');
      ctx.drawImage(eng.canvas, 0, 0, c.width, c.height);
      rgba = ctx.getImageData(0, 0, c.width, c.height).data;
      n = c.width * c.height;
      sw = c.width;
      sh = c.height;
    }

    let luma = 0;
    let lit = 0;
    let warm = 0;
    let cool = 0;
    let at = [0, 0, 0];
    if (rgba) {
      let sum = 0;
      for (let i = 0; i < n; i++) {
        const o = i * 4;
        const r = rgba[o];
        const g = rgba[o + 1];
        const b = rgba[o + 2];
        sum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
        // Background is about (22,23,26); anything clearly above it is content.
        if (r > 40 || g > 40 || b > 45) lit++;
        if (r > g + 25 && r > b + 25) warm++;
        else if (b > r + 25 || g > r + 25) cool++;
      }
      luma = sum / n;
      lit = (lit / n) * 100;
      warm = (warm / n) * 100;
      cool = (cool / n) * 100;
      const sx = Math.min(sw - 1, Math.round((px / W) * sw));
      const sy = Math.min(sh - 1, Math.round((py / H) * sh));
      const o = (sy * sw + sx) * 4;
      at = [rgba[o], rgba[o + 1], rgba[o + 2]];
    }

    return {
      peak,
      hot,
      luma,
      lit,
      warm,
      cool,
      at,
      accum: l.accumFrames,
      converge: l.convergeFrames,
      converged: l.converged,
      splats: l.splats,
      candidates: l.candidates,
      budget: l.budget,
      heatScale: l.heatScale,
      frames: l.frames,
    };
  });

const row = (tag, s) =>
  console.log(
    `${tag.padEnd(10)} peak ${s.peak.toFixed(1).padStart(10)}  hot ${String(s.hot).padStart(3)}` +
      `  luma ${s.luma.toFixed(2).padStart(6)}  lit ${s.lit.toFixed(2).padStart(5)}%` +
      `  warm ${s.warm.toFixed(2).padStart(5)}%  cool ${s.cool.toFixed(2).padStart(5)}%` +
      `  rgb(${String(s.at[0]).padStart(3)},${String(s.at[1]).padStart(3)},${String(s.at[2]).padStart(3)})` +
      `  accum ${String(s.accum).padStart(3)}/${String(s.converge).padStart(4)}` +
      `  splat ${(s.splats / 1e3).toFixed(0).padStart(5)}k  res ${(s.heatScale * 100).toFixed(0)}%`,
  );

/** Set up, hold utterly still, and watch. */
async function watch(label, setup, seconds = 6) {
  console.log(`\n=== ${label}`);
  await page.evaluate(setup);
  await page.waitForTimeout(1200);
  // Frame the data once, then never touch the camera again.
  await page.evaluate(() => {
    const eng = globalThis.__3dheat_engine;
    eng.applyPreset('Top');
    eng.frameDataset(true);
  });
  await page.waitForTimeout(1200);
  for (let i = 0; i < seconds * 2; i++) {
    await page.waitForTimeout(500);
    row(`t=${(i * 0.5).toFixed(1)}s`, await sample());
  }
}

const synth = (rows) => `() => {
  const s = globalThis.__3dheat.useStore.getState();
  s.setLevel(null);
  s.setDataset(globalThis.__3dheat.generateSynthetic({
    ...globalThis.__3dheat.DEFAULT_SYNTH, rows: ${rows},
  }));
}`;

// Defaults, simple heat. The baseline: if this fades, everything else is noise.
await watch(
  'heat-simple, 3M rows, default settings',
  new Function(`return ${synth(3_000_000)}`)(),
);

await watch('heat-simple, same data, saturation response OFF (linear)', () => {
  globalThis.__3dheat.useStore.getState().patchHeat({ response: 'linear' });
});

await watch('heat-simple, progressive accumulation OFF', () => {
  globalThis.__3dheat.useStore.getState().patchBudget({ progressive: false });
});

await watch('heat-simple, adaptive budget OFF, big fixed budget', () => {
  const s = globalThis.__3dheat.useStore.getState();
  s.patchBudget({ progressive: true, adaptive: false, splatsPerFrame: 8 * 1024 * 1024 });
  s.patchHeat({ response: 'saturating' });
});

// Difference mode: if the two sides cancel once converged, this is where it shows.
await watch('heat-difference, default team split', () => {
  const s = globalThis.__3dheat.useStore.getState();
  s.patchBudget({ adaptive: true });
  s.setMode('heat-difference');
});

await watch('heat-simple again, small dataset (200k)', () => {
  const s = globalThis.__3dheat.useStore.getState();
  s.setMode('heat-simple');
  s.setDataset(
    globalThis.__3dheat.generateSynthetic({
      ...globalThis.__3dheat.DEFAULT_SYNTH,
      rows: 200_000,
    }),
  );
});

await browser.close();
