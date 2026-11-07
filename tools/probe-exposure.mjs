/**
 * How hot is the picture while the camera moves, versus once it settles, versus
 * the saturation point the ramp is scaled by?
 *
 * "Rotate a little and the heat is completely different; sit still and it cools
 * down" has two candidate causes and they need different fixes:
 *
 *   - the settled field sits far below the saturation point  => exposure is wrong,
 *     the ramp's top is calibrated for a peak the converged image never reaches
 *   - the moving field sits far above it                     => a single frame is
 *     a high-variance cluster sample and its peaks overshoot
 *
 * Both can be true at once. This prints the numbers so the fix is not a guess.
 *
 *   node tools/probe-exposure.mjs [url]
 */
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:5273/?backend=webgl2';
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (e) => console.log('pageerror:', e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);

/**
 * Percentiles of the accumulated field over a grid of probe points.
 *
 * Percentiles rather than the maximum: the maximum of a noisy field is itself a
 * biased statistic, which is exactly the effect under investigation, so the
 * distribution is what matters.
 */
const field = () =>
  page.evaluate(async () => {
    const eng = globalThis.__3dheat_engine;
    const W = eng.canvas.width;
    const H = eng.canvas.height;
    const vals = [];
    for (let x = 0.08; x <= 0.92; x += 0.025) {
      for (let y = 0.08; y <= 0.92; y += 0.035) {
        const v = await eng.probeHeat(Math.round(W * x), Math.round(H * y), 1);
        if (v !== null) vals.push(Math.abs(v));
      }
    }
    vals.sort((a, b) => a - b);
    const at = (p) => (vals.length ? vals[Math.min(vals.length - 1, Math.floor(p * vals.length))] : 0);
    const nonZero = vals.filter((v) => v > 1e-6);
    return {
      n: vals.length,
      covered: (nonZero.length / Math.max(1, vals.length)) * 100,
      p50: at(0.5),
      p90: at(0.9),
      p99: at(0.99),
      max: vals.length ? vals[vals.length - 1] : 0,
      saturation: globalThis.__3dheat.useStore.getState().heat.saturation,
      accum: eng.live.accumFrames,
      mode: eng.live.accumMode,
      splats: eng.live.splats,
      candidates: eng.live.candidates,
    };
  });

const show = (label, f) => {
  const t = (v) => (v / Math.max(1e-9, f.saturation)).toFixed(3);
  console.log(
    `${label.padEnd(22)} covered ${f.covered.toFixed(0).padStart(3)}%  ` +
      `p50 ${f.p50.toFixed(0).padStart(7)} (t=${t(f.p50)})  ` +
      `p90 ${f.p90.toFixed(0).padStart(7)} (t=${t(f.p90)})  ` +
      `p99 ${f.p99.toFixed(0).padStart(8)} (t=${t(f.p99)})  ` +
      `max ${f.max.toFixed(0).padStart(8)} (t=${t(f.max)})  ` +
      `sat ${f.saturation.toFixed(0)}  accum ${f.accum}  weight ${(f.candidates / Math.max(1, f.splats)).toFixed(1)}x`,
  );
};

/**
 * Hold `camera.moved` true without changing the pose.
 *
 * That is the controlled version of "while the user is dragging": every frame
 * takes the reset path and shows one single-sample estimate, but the projection is
 * identical to the settled reading, so the only difference is the accumulation.
 * Actually rotating confounds the two — a different pose puts the data on
 * different pixels, and at 4% screen coverage that alone moves a percentile by
 * more than the effect being measured.
 */
async function pinMoving(on) {
  await page.evaluate((on) => {
    const eng = globalThis.__3dheat_engine;
    if (on) {
      if (!globalThis.__pin) {
        globalThis.__pin = setInterval(() => {
          eng.camera.moved = true;
        }, 4);
      }
    } else if (globalThis.__pin) {
      clearInterval(globalThis.__pin);
      globalThis.__pin = undefined;
    }
  }, on);
}

for (const rows of [500_000, 4_000_000, 20_000_000]) {
  console.log(`\n=== ${(rows / 1e6).toFixed(1)}M rows, defaults straight off the loader`);
  await page.evaluate((rows) => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setLevel(null);
    s.setDataset(
      globalThis.__3dheat.generateSynthetic({ ...globalThis.__3dheat.DEFAULT_SYNTH, rows }),
    );
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all', playing: false });
    s.patchBudget({ adaptive: true, progressive: true });
    // Flattened and top-down so the data fills the frame: a percentile over a
    // sparsely covered frame is mostly measuring the empty part.
    s.patchHeat({ groundProjected: true });
  }, rows);
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    const eng = globalThis.__3dheat_engine;
    eng.applyPreset('Top');
    eng.frameDataset(true);
  });
  await page.waitForTimeout(4000);
  const settled = await field();
  show('settled', settled);

  await pinMoving(true);
  await page.waitForTimeout(1200);
  const moving = await field();
  show('as if dragging', moving);
  await pinMoving(false);

  await page.waitForTimeout(4000);
  const again = await field();
  show('settled again', again);

  const ratio = (a, b) => (b > 1e-9 ? (a / b).toFixed(2) : 'n/a');
  console.log(
    `  -> dragging / settled: p99 ${ratio(moving.p99, settled.p99)}x, ` +
      `max ${ratio(moving.max, settled.max)}x; ` +
      `settled repeatability: p99 ${ratio(again.p99, settled.p99)}x`,
  );

  // And what the metered exposure makes of the same field.
  const metered = await page.evaluate(async () => {
    const r = await globalThis.__3dheat_engine.autoExpose();
    await new Promise((res) => setTimeout(res, 1200));
    return r;
  });
  if (metered && metered.saturation !== null) {
    const after = await field();
    show('after auto-expose', after);
    console.log(
      `  -> metered ${(metered.coverage * 100).toFixed(1)}% lit, ` +
        `reference ${metered.reference.toFixed(0)}, saturation ${settled.saturation.toFixed(0)} -> ${metered.saturation.toFixed(0)}`,
    );
  } else {
    console.log('  -> auto-expose found nothing to meter');
  }
}

await browser.close();
