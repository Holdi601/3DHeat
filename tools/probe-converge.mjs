/**
 * How much of the sampling budget is spent on rows that are not on screen?
 *
 * The sampler is purely temporal: `candidateRange` turns the time window into one
 * contiguous run of rows and `planFrame` spreads the frame's budget evenly over
 * it. Nothing in that path knows where the camera is looking, so flying into a
 * building samples the whole map and lets the vertex shader throw away whatever
 * misses — and the convergence counter, which is `candidateRows / submitted`,
 * counts those thrown-away rows as work still to do.
 *
 * This measures the gap between the two: what fraction of the candidate rows can
 * actually land on screen, and how many frames convergence takes anyway. The
 * ratio is what a spatial index would be worth, and it is worth measuring before
 * building one, because the answer depends entirely on how much of the map is in
 * frame — at map scale there is nothing to win.
 *
 *   node tools/probe-converge.mjs [url]
 */
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:5273/?backend=webgl2';
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
const page = await browser.newPage({ viewport: { width: 1200, height: 700 } });
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40_000 });

const ROWS = 4_000_000;
/** Eight kilometres, in the metres the exporter writes. */
const MAP = 8000;

/**
 * A map-shaped field rather than the synthetic generator's output.
 *
 * The generator makes a compact cloud, and inside a compact cloud even a close
 * camera still has most of the data in frame — the first run of this probe read
 * 59% in view at what it called maximum zoom, which measured the shape of the
 * test data and nothing else. Real telemetry covers a map: uniform over
 * kilometres, and a doorway is a millionth of it.
 */
await page.evaluate(({ rows, map }) => {
  const px = new Float32Array(rows);
  const py = new Float32Array(rows);
  const pz = new Float32Array(rows);
  const time = new Float32Array(rows);
  for (let i = 0; i < rows; i++) {
    px[i] = (Math.random() - 0.5) * map;
    py[i] = Math.random() * 200;
    pz[i] = (Math.random() - 0.5) * map;
    // Ascending, so the time window is one contiguous run of rows exactly as it
    // is for a real load.
    time[i] = (i / rows) * 1800;
  }
  const s = globalThis.__3dheat.useStore.getState();
  s.setDataset({
    id: 'converge', name: 'converge probe', count: rows, px, py, pz,
    time, epochMs: null, lifetime: null, maxLifetimeGap: 0,
    yaw: null, pitch: null, personId: null, teamId: null,
    personLabels: [], teamLabels: [], personTeam: null, personSlot: null,
    teamSizes: null, attrs: [], warnings: [],
    bounds: { minX: -map / 2, minY: 0, minZ: -map / 2, maxX: map / 2, maxY: 200, maxZ: map / 2 },
    timeRange: [0, 1800], timeSorted: true,
  });
  s.setMode('heat-simple');
  s.patchTimeline({ mode: 'all', playing: false });
  s.patchHeat({ radius: 12, groundProjected: false, occlusion: 0, hideBehindGround: false,
    cullNear: 0, cullFar: 0, response: 'linear', saturation: 200 });
  // A fixed budget, and a modest one: the adaptive controller would otherwise
  // change the number being measured while it is being measured, and under load
  // it settles far below a million.
  s.patchBudget({ adaptive: false, progressive: true, splatsPerFrame: 256 * 1024 });
}, { rows: ROWS, map: MAP });
await page.waitForTimeout(3000);

/**
 * Fraction of rows whose centre falls inside the clip volume.
 *
 * The honest denominator for "was this row worth submitting". A row outside it
 * contributes nothing to the picture no matter how large the sprite radius is —
 * bar a rim of sprites straddling the edge, which is why the reading is a
 * fraction rather than a count of wasted rows.
 */
const inViewFraction = () =>
  page.evaluate(() => {
    const st = globalThis.__3dheat.useStore.getState();
    const d = st.dataset;
    const eng = globalThis.__3dheat_engine;
    const cam = eng.camera.camera;
    cam.updateMatrixWorld();
    const m = cam.projectionMatrix.clone().multiply(cam.matrixWorldInverse).elements;
    const eye = eng.camera.position;
    // The same bounds the shader applies. Zero means off, exactly as the panel
    // reads it.
    const near = st.heat.cullNear > 0 ? st.heat.cullNear : 0;
    const far = st.heat.cullFar > 0 ? st.heat.cullFar : Infinity;
    let frustum = 0;
    let both = 0;
    const stride = 8;
    let tested = 0;
    for (let i = 0; i < d.count; i += stride) {
      tested++;
      const x = d.px[i];
      const y = d.py[i];
      const z = d.pz[i];
      const cw = m[3] * x + m[7] * y + m[11] * z + m[15];
      if (cw <= 0) continue;
      const cx = m[0] * x + m[4] * y + m[8] * z + m[12];
      const cy = m[1] * x + m[5] * y + m[9] * z + m[13];
      const cz = m[2] * x + m[6] * y + m[10] * z + m[14];
      if (!(Math.abs(cx) <= cw && Math.abs(cy) <= cw && cz >= -cw && cz <= cw)) continue;
      frustum++;
      const dist = Math.hypot(x - eye.x, y - eye.y, z - eye.z);
      if (dist >= near && dist <= far) both++;
    }
    return { frustum: frustum / tested, both: both / tested };
  });

/** Frames and wall time to reach `converged`, plus what the engine thinks it is doing. */
const converge = async () => {
  // Nudge the camera so accumulation restarts from scratch, then let it settle.
  await page.evaluate(() => (globalThis.__3dheat_engine.camera.moved = true));
  const t0 = Date.now();
  const out = await page.evaluate(async () => {
    const eng = globalThis.__3dheat_engine;
    const start = performance.now();
    let frames = 0;
    while (!eng.live.converged && performance.now() - start < 60_000) {
      await new Promise((r) => requestAnimationFrame(r));
      frames++;
    }
    return {
      frames,
      ms: performance.now() - start,
      candidates: eng.live.candidates,
      splats: eng.live.splats,
      convergeFrames: eng.live.convergeFrames,
      frameMs: eng.live.frameMs,
    };
  });
  return { ...out, wall: Date.now() - t0 };
};

const pct = (v) => `${(v * 100).toFixed(v < 0.01 ? 3 : 2)}%`;

const report = async (label) => {
  await page.waitForTimeout(600);
  const f = await inViewFraction();
  const c = await converge();
  console.log(
    `${label.padEnd(30)} frustum ${pct(f.frustum).padStart(8)}  ` +
      `+ cull ${pct(f.both).padStart(8)}  ` +
      `converge ${String(c.convergeFrames).padStart(3)}f / ${(c.ms / 1000).toFixed(1)}s  ` +
      `frame ${c.frameMs.toFixed(0)}ms`,
  );
  return { ...f, ...c };
};

// ---------------------------------------------------------------- whole map
await page.evaluate(() => globalThis.__3dheat_engine.frameDataset(true));
const wide = await report('framed on the whole map');

/**
 * Stand on the ground looking across `span` metres, optionally with a far cull
 * set to the distance actually being looked at.
 */
const standAt = async (span, cull) => {
  await page.evaluate(({ s, c }) => {
    const eng = globalThis.__3dheat_engine;
    eng.camera.position.set(0, 30, s * 0.9);
    eng.camera.setOrientationDegrees(0, -6);
    eng.camera.moved = true;
    globalThis.__3dheat.useStore.getState().patchHeat({ cullFar: c });
  }, { s: span, c: cull ?? 0 });
  await page.waitForTimeout(1200);
  return report(`across ${span}m${cull ? `, cull ${cull}m` : ', no cull'}`);
};

const results = [];
for (const span of [2000, 500, 120, 40]) {
  results.push(await standAt(span, 0));
  results.push(await standAt(span, span * 2.5));
}

// ------------------------------------------------------------------ the verdict
console.log('');
const tight = results[results.length - 1];
console.log(
  `The frustum on its own is a long cone: at the tightest view it still contains\n` +
    `${pct(results[results.length - 2].frustum)} of the map, because it keeps widening all the way to the far plane.\n` +
    `Frustum culling alone is therefore worth little here — which was not the guess\n` +
    `going in.\n` +
    `\nThe distance bound is where the work is. With a far cull set to what is being\n` +
    `looked at, ${pct(tight.both)} of the ${(tight.candidates / 1e6).toFixed(1)}M candidate rows can contribute — and the sampler\n` +
    `spreads its budget over all of them regardless, so about ${(1 / Math.max(1e-9, tight.both)).toFixed(0)}x of every frame's\n` +
    `vertex work is spent on rows the shader is about to discard, with convergence\n` +
    `counting them as outstanding: ${tight.convergeFrames} frames instead of ` +
    `${Math.max(1, Math.ceil(tight.convergeFrames * tight.both))}.`,
);
console.log(
  `\nFramed on the whole map ${pct(wide.frustum)} is in view, so there is nothing to win there —\n` +
    `which is the point: this pays exactly when you are looking at a small part.`,
);

await browser.close();
