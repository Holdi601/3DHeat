/**
 * Does the field cool as frames accumulate, and does it depend on precision?
 *
 * The suspicion: the running mean adds each frame's estimate at `1/n` weight, so
 * as `n` grows the per-sprite contributions shrink relative to the running total.
 * In a half-float target they eventually fall below the representable step at that
 * magnitude and vanish — while the decay multiply still applies in full. That
 * would cool exactly the *large* values and leave sparse ones alone, which is the
 * reported symptom: hot areas glow while moving and cool once still.
 *
 * Run against both precisions. If f32 holds and f16 decays, that is the bug.
 *
 *   node tools/probe-precision.mjs [backend]
 */
import { chromium } from 'playwright';

const backend = process.argv[2] ?? 'webgl2';
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

/** Watch a fixed pixel while accumulation proceeds, at one precision. */
async function run(precision) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', (e) => console.log('pageerror:', e.message));
  await page.goto(`http://127.0.0.1:5273/?backend=${backend}&heat=${precision}`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(2600);

  const setup = await page.evaluate(async () => {
    const s = globalThis.__3dheat.useStore.getState();
    s.setLevel(null);
    s.setDataset(
      globalThis.__3dheat.generateSynthetic({
        ...globalThis.__3dheat.DEFAULT_SYNTH,
        rows: 6_000_000,
      }),
    );
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all', playing: false });
    // A small per-frame budget forces a long accumulation, which is when the
    // per-frame weight becomes small enough for rounding to bite.
    s.patchBudget({ adaptive: false, progressive: true, splatsPerFrame: 128 * 1024 });
    const eng = globalThis.__3dheat_engine;
    eng.applyPreset('Top');
    eng.frameDataset(true);
    await new Promise((r) => setTimeout(r, 1200));
    // Dense sprites so the hot areas are genuinely hot. Re-read the state: `s` is
    // a snapshot taken before the dataset was set.
    const b = globalThis.__3dheat.useStore.getState().dataset.bounds;
    s.patchHeat({
      groundProjected: true,
      radius: Math.max(b.maxX - b.minX, b.maxZ - b.minZ) / 40,
      centerIntensity: 2,
      maxPixelRadius: 512,
    });
    await new Promise((r) => setTimeout(r, 1500));
    return { format: globalThis.__3dheat_engine.live.backend };
  });

  console.log(`\n=== ${backend}, heat=${precision} (${setup.format})`);
  const series = [];
  for (let i = 0; i < 16; i++) {
    await page.waitForTimeout(500);
    const s = await page.evaluate(async () => {
      const eng = globalThis.__3dheat_engine;
      const st = globalThis.__3dheat.useStore.getState();
      // The half-float path scales the field into the range the format handles;
      // undo it here so both precisions are reported in the same units.
      const gain =
        eng.renderer.heatPrecision === 'f16' ? 2048 / Math.max(1e-6, st.heat.saturation) : 1;
      const raw = await eng.renderer.readHeatField(60000);
      const lit = [];
      if (raw) for (const v of raw) if (v > 1e-4 * gain) lit.push(v / gain);
      lit.sort((a, b) => a - b);
      const at = (p) => (lit.length ? lit[Math.min(lit.length - 1, Math.floor(p * lit.length))] : 0);

      // What the eye actually gets, which is the claim that matters.
      let luma = 0;
      let bright = 0;
      const c = document.createElement('canvas');
      c.width = 240;
      c.height = 150;
      const ctx = c.getContext('2d');
      ctx.drawImage(eng.canvas, 0, 0, c.width, c.height);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      const n = c.width * c.height;
      let sum = 0;
      for (let i = 0; i < n; i++) {
        const o = i * 4;
        sum += 0.2126 * d[o] + 0.7152 * d[o + 1] + 0.0722 * d[o + 2];
        if (d[o] > 90 || d[o + 1] > 90) bright++;
      }
      luma = sum / n;
      bright = (bright / n) * 100;

      return {
        accum: eng.live.accumFrames,
        converge: eng.live.convergeFrames,
        lit: lit.length,
        gain,
        sat: st.heat.saturation,
        luma,
        bright,
        // The whole distribution: the claim is that only the top end moves.
        p10: at(0.1),
        p50: at(0.5),
        p90: at(0.9),
        p99: at(0.99),
        max: lit.length ? lit[lit.length - 1] : 0,
      };
    });
    series.push(s);
    console.log(
      `  accum ${String(s.accum).padStart(4)}/${String(s.converge).padStart(4)}  ` +
        `p50 ${s.p50.toFixed(1).padStart(9)}  p90 ${s.p90.toFixed(1).padStart(9)}  ` +
        `p99 ${s.p99.toFixed(1).padStart(10)}  max ${s.max.toFixed(1).padStart(10)}  ` +
        `gain ${s.gain.toFixed(4)}  sat ${s.sat.toFixed(0).padStart(7)}  ` +
        `luma ${s.luma.toFixed(2).padStart(6)}  bright ${s.bright.toFixed(2).padStart(5)}%`,
    );
  }

  const first = series[1] ?? series[0];
  const last = series[series.length - 1];
  const rel = (a, b) => (b > 1e-9 ? (a / b).toFixed(3) : 'n/a');
  console.log(
    `  -> across ${first.accum} -> ${last.accum} merged frames:  ` +
      `p10 ${rel(last.p10, first.p10)}x  p50 ${rel(last.p50, first.p50)}x  ` +
      `p90 ${rel(last.p90, first.p90)}x  p99 ${rel(last.p99, first.p99)}x  ` +
      `max ${rel(last.max, first.max)}x`,
  );
  await page.close();
}

await run('f32');
await run('f16');
await browser.close();
