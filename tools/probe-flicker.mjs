/**
 * Does a moving camera show the sampling grain, on the settings a page loads with?
 *
 * The last thing to remain of this after two rounds of fixing it, and the reason
 * it kept coming back: both earlier fixes were *conditional*. Raising the budget
 * by hand works until the page is reloaded, because none of the render settings
 * are persisted and the store returns to a 4M sprite budget with the adaptive
 * controller on. Teaching that controller to climb out of its floor works too —
 * measured, it reached full exactness on a 14M-row load — but it is a feedback
 * loop chasing a frame-time target, so on a heavier level it settles lower,
 * hunts, and the grain comes and goes with it.
 *
 * So this probe deliberately touches nothing. It loads a dataset larger than the
 * default budget, moves the camera, and asks whether the frame drew all of it.
 * A pass means the property holds for someone who just opened the page, which is
 * the only version of "fixed" that survives a reload.
 *
 * The measurements are of the engine's own accounting rather than of pixels:
 * `splats >= candidates` on a frame that reset its accumulation is exactly the
 * condition under which no grain can exist, and it is not a threshold anyone has
 * to calibrate.
 *
 *   node tools/probe-flicker.mjs [url]
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
const page = await browser.newPage({ viewport: { width: 900, height: 560 } });
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40_000 });

let ok = 0;
let failed = 0;
const check = (label, pass, detail) => {
  console.log(`  ${pass ? 'ok  ' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`);
  pass ? ok++ : failed++;
};

const defaults = await page.evaluate(() => {
  const b = globalThis.__3dheat.useStore.getState().budget;
  return { splatsPerFrame: b.splatsPerFrame, adaptive: b.adaptive, progressive: b.progressive };
});
console.log(
  `defaults: ${(defaults.splatsPerFrame / 1e6).toFixed(1)}M sprites, ` +
    `adaptive ${defaults.adaptive}, progressive ${defaults.progressive}\n`,
);

/**
 * A dataset comfortably larger than the default budget.
 *
 * That relationship is the whole point: with rows under the default nothing can
 * flicker and the probe would pass without testing anything. Read from the store
 * rather than hard-coded so it stays true if the default changes.
 */
const rows = Math.round(defaults.splatsPerFrame * 3.5);
await page.evaluate((n) => {
  const px = new Float32Array(n);
  const py = new Float32Array(n);
  const pz = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    px[i] = (Math.random() - 0.5) * 6000;
    py[i] = Math.random() * 120;
    pz[i] = (Math.random() - 0.5) * 6000;
  }
  const s = globalThis.__3dheat.useStore.getState();
  s.setDataset({
    id: 'flicker', name: 'flicker probe', count: n, px, py, pz,
    time: null, epochMs: null, lifetime: null, maxLifetimeGap: 0,
    yaw: null, pitch: null, personId: null, teamId: null,
    personLabels: [], teamLabels: [], personTeam: null, personSlot: null,
    teamSizes: null, attrs: [], warnings: [],
    bounds: { minX: -3000, minY: 0, minZ: -3000, maxX: 3000, maxY: 120, maxZ: 3000 },
    timeRange: [0, 0], timeSorted: true,
  });
  s.setMode('heat-simple');
  s.patchTimeline({ mode: 'all', playing: false });
  // Only the heat's appearance, never the budget: the budget is what is on trial.
  s.patchHeat({ radius: 8, response: 'log', saturation: 40, centerIntensity: 2 });
}, rows);
await page.waitForTimeout(4000);
await page.evaluate(() => globalThis.__3dheat_engine.frameDataset(true));
await page.waitForTimeout(2500);

console.log(`${(rows / 1e6).toFixed(1)}M rows against a ${(defaults.splatsPerFrame / 1e6).toFixed(1)}M default budget\n`);

/** Translate the camera for `frames` frames, sampling what each one drew. */
const fly = async (frames) =>
  page.evaluate(async (n) => {
    const eng = globalThis.__3dheat_engine;
    const seen = [];
    for (let i = 0; i < n; i++) {
      eng.camera.position.x += 3;
      eng.camera.moved = true;
      eng.invalidate(2);
      await new Promise((r) => requestAnimationFrame(r));
      seen.push({
        splats: eng.live.splats,
        candidates: eng.live.candidates,
        converge: eng.live.convergeFrames,
        frameMs: eng.live.frameMs,
      });
    }
    return seen;
  }, frames);

const moving = await fly(24);
// The first couple of frames are the settling of whatever came before; the
// property is about the steady state of a moving camera.
const steady = moving.slice(4);
const exact = steady.filter((f) => f.candidates > 0 && f.splats >= f.candidates).length;
const worst = steady.reduce((a, f) => Math.max(a, f.converge), 0);

console.log(
  `  moving: splats ${(steady[0].splats / 1e6).toFixed(2)}M of ${(steady[0].candidates / 1e6).toFixed(2)}M ` +
    `candidates, converge ${worst}, frame ${steady[steady.length - 1].frameMs.toFixed(0)}ms`,
);

check('every frame of a camera move draws every candidate row',
  exact === steady.length, `${exact} of ${steady.length} frames exact`);
check('and no frame reports outstanding work', worst <= 1, `worst convergeFrames ${worst}`);

// It has to hold *while continuously moving*, not just on the first frame after
// a stop — a controller that recovers over a second still glitters for a second.
const longer = await fly(60);
const late = longer.slice(30);
check('it still holds after a second of continuous movement',
  late.every((f) => f.splats >= f.candidates), `${late.filter((f) => f.splats >= f.candidates).length} of ${late.length}`);

// And the settings must be as they were: this fix works by raising the budget for
// one frame, not by rewriting what the user chose.
const after = await page.evaluate(() => {
  const b = globalThis.__3dheat.useStore.getState().budget;
  return { splatsPerFrame: b.splatsPerFrame, adaptive: b.adaptive };
});
check('without changing the configured budget',
  after.splatsPerFrame === defaults.splatsPerFrame && after.adaptive === defaults.adaptive,
  `${(after.splatsPerFrame / 1e6).toFixed(1)}M, adaptive ${after.adaptive}`);

// Standing still must still converge and hold, which is what the accumulation is
// for. A fix that made every frame exact but broke the still picture would pass
// everything above.
const still = await page.evaluate(async () => {
  const eng = globalThis.__3dheat_engine;
  eng.camera.moved = true;
  for (let i = 0; i < 40; i++) {
    eng.invalidate(2);
    await new Promise((r) => requestAnimationFrame(r));
  }
  return { converged: eng.live.converged, splats: eng.live.splats, candidates: eng.live.candidates };
});
check('a still camera is converged', still.converged, `${still.converged}`);

// Above the draw plan's ceiling the promise cannot be kept, and the honest
// behaviour is to say so rather than to silently drop chunks.
const huge = await page.evaluate(async () => {
  const s = globalThis.__3dheat.useStore.getState();
  const eng = globalThis.__3dheat_engine;
  // Pretend a window far larger than any plan can hold, without allocating it:
  // the cap is applied to the row count, so a small dataset with a big budget
  // request exercises the same branch.
  s.patchBudget({ splatsPerFrame: 512 * 1024 * 1024 });
  eng.camera.moved = true;
  eng.invalidate(2);
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => requestAnimationFrame(r));
  const out = { budget: eng.live.budget, splats: eng.live.splats };
  s.patchBudget({ splatsPerFrame: 4_000_000 });
  return out;
});
check('an absurd budget request is capped rather than honoured',
  huge.budget <= 16_384 * 4096, `${(huge.budget / 1e6).toFixed(0)}M`);

console.log(`\nprobe-flicker: ${failed === 0 ? 'passed' : 'FAILED'} (${ok} ok, ${failed} failed)`);
await browser.close();
process.exit(failed === 0 ? 0 : 1);
