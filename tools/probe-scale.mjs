/**
 * Does the internal heat-buffer resolution change the accumulated field?
 *
 * It must not. Resolution is a performance knob the throttle turns on its own —
 * down while the camera moves, back up once it settles — so if the field depends
 * on it, the picture changes when you move and changes back when you stop, and
 * only where sprites overlap. Which is exactly the reported symptom: the hot areas
 * glow while moving and cool when still, while the sparse areas look the same.
 *
 * Everything else is pinned: same camera, same sprite radius, adaptive off. The
 * only variable is `heatScale`.
 *
 *   node tools/probe-scale.mjs [url]
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

/** Percentiles of the field, read in one bulk transfer. */
const field = () =>
  page.evaluate(async () => {
    const eng = globalThis.__3dheat_engine;
    const raw = await eng.renderer.readHeatField(60000);
    const lit = [];
    if (raw) for (const v of raw) if (v > 1e-4) lit.push(v);
    lit.sort((a, b) => a - b);
    const at = (p) => (lit.length ? lit[Math.min(lit.length - 1, Math.floor(p * lit.length))] : 0);
    return {
      lit: lit.length,
      total: raw ? raw.length : 0,
      p50: at(0.5),
      p90: at(0.9),
      p99: at(0.99),
      max: lit.length ? lit[lit.length - 1] : 0,
      heatScale: eng.live.heatScale,
      accum: eng.live.accumFrames,
      splats: eng.live.splats,
    };
  });

async function sweep(label, setup) {
  console.log(`\n=== ${label}`);
  await page.evaluate(setup);
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const eng = globalThis.__3dheat_engine;
    eng.applyPreset('Top');
    eng.frameDataset(true);
  });
  await page.waitForTimeout(1500);

  const rows = [];
  for (const scale of [1, 0.75, 0.5, 0.25]) {
    await page.evaluate((s) => globalThis.__3dheat.useStore.getState().patchBudget({ heatScale: s }), scale);
    // Long enough to fully re-converge at the new resolution.
    await page.waitForTimeout(3000);
    const f = await field();
    rows.push({ scale, f });
    console.log(
      `  res ${(scale * 100).toFixed(0).padStart(3)}% (actual ${(f.heatScale * 100).toFixed(0)}%)  ` +
        `lit ${String(f.lit).padStart(6)}/${String(f.total).padStart(6)}  ` +
        `p50 ${f.p50.toFixed(1).padStart(9)}  p90 ${f.p90.toFixed(1).padStart(9)}  ` +
        `p99 ${f.p99.toFixed(1).padStart(10)}  max ${f.max.toFixed(1).padStart(10)}  accum ${f.accum}`,
    );
  }
  const base = rows[0].f;
  for (const r of rows.slice(1)) {
    const rel = (a, b) => (b > 1e-9 ? (a / b).toFixed(3) : 'n/a');
    console.log(
      `  -> ${(r.scale * 100).toFixed(0)}% vs 100%:  p50 ${rel(r.f.p50, base.p50)}x  ` +
        `p90 ${rel(r.f.p90, base.p90)}x  p99 ${rel(r.f.p99, base.p99)}x  max ${rel(r.f.max, base.max)}x`,
    );
  }
}

const load = (rows, patch) => `() => {
  const s = globalThis.__3dheat.useStore.getState();
  s.setLevel(null);
  s.setDataset(globalThis.__3dheat.generateSynthetic({
    ...globalThis.__3dheat.DEFAULT_SYNTH, rows: ${rows},
  }));
  s.setMode('heat-simple');
  s.patchTimeline({ mode: 'all', playing: false });
  s.patchBudget({ adaptive: false, progressive: true, splatsPerFrame: 4 * 1024 * 1024 });
  s.patchHeat(${JSON.stringify(patch)});
}`;

// Default clamps: min 1 px, max 96 px.
await sweep(
  '2M rows, default pixel clamps (min 1, max 96)',
  new Function(`return ${load(2_000_000, { groundProjected: true })}`)(),
);

// Clamps taken out of play entirely. If the resolution dependence disappears
// here, the clamps are the cause — they are expressed in heat-buffer pixels, and
// the heat buffer changes size under the throttle.
await sweep(
  '2M rows, clamps effectively disabled (min 0, max 100000)',
  new Function(
    `return ${load(2_000_000, { groundProjected: true, minPixelRadius: 0, maxPixelRadius: 100000 })}`,
  )(),
);

// A large sprite, so the max clamp definitely bites at full resolution.
await sweep(
  '2M rows, large sprites so max 96 px clamps at full res',
  new Function(
    `return ${load(2_000_000, { groundProjected: true, minPixelRadius: 1, maxPixelRadius: 96 })}`,
  )(),
);
await page.evaluate(() => {
  const s = globalThis.__3dheat.useStore.getState();
  const b = s.dataset.bounds;
  s.patchHeat({ radius: Math.max(b.maxX - b.minX, b.maxZ - b.minZ) / 12 });
});
await sweep('  (same, after enlarging the radius)', () => {});

await browser.close();
