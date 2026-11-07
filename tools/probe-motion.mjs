/**
 * Why does moving the camera turn a smooth field into scattered bubbles?
 *
 * The reported symptom is that a still frame looks right and any camera
 * translation shows a sparse scatter of over-bright blobs. The mechanism is not
 * in doubt: a camera move invalidates the screen-space accumulation, so a moving
 * frame is a *single* stochastic estimate rather than the merged result of
 * hundreds, and with the sprite budget at its floor that estimate is one row in
 * a couple of hundred, each weighted up by the same factor and clamped to a
 * minimum pixel size. Isolated bright dots is the correct rendering of that.
 *
 * The question this answers is *why the budget is at its floor*, which is the
 * part that determines the fix. The controller sees only total frame time and
 * has no idea which pass spent it — `gpuMs` is null on both backends — so if the
 * level geometry costs more than the whole frame budget, the controller will cut
 * sprites to nothing chasing a target it can never reach, and destroy the heat
 * for no gain at all.
 *
 * So: sweep the sprite budget with the real level loaded and see whether frame
 * time responds. If it barely moves, the heat is not the cost and the starvation
 * is self-inflicted.
 *
 *   node tools/probe-motion.mjs [url]
 *   HEAT3D_GLB=path\to\level.glb node tools/probe-motion.mjs
 */
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:5273/?backend=webgl2';
const wantWebgpu = /backend=webgpu/.test(url);

function newestGlb() {
  const dir = resolve('exporters/unreal/.out');
  try {
    const files = readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith('.glb'))
      .map((f) => ({ f: join(dir, f), t: statSync(join(dir, f)).mtimeMs }))
      .sort((a, b) => b.t - a.t);
    return files[0]?.f ?? null;
  } catch {
    return null;
  }
}
const glb = process.env.HEAT3D_GLB ?? newestGlb();

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
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40_000 });

const ROWS = 14_000_000;
console.log(`${(ROWS / 1e6).toFixed(0)}M rows, level: ${glb ? glb.split(/[\\/]/).pop() : 'none'}\n`);

// Rows spread over a map, so the scene matches the report: everything in the
// window, no time filtering, a wide field of data under a big level.
await page.evaluate((rows) => {
  const px = new Float32Array(rows);
  const py = new Float32Array(rows);
  const pz = new Float32Array(rows);
  for (let i = 0; i < rows; i++) {
    px[i] = (Math.random() - 0.5) * 6000;
    py[i] = Math.random() * 120;
    pz[i] = (Math.random() - 0.5) * 6000;
  }
  const s = globalThis.__3dheat.useStore.getState();
  s.setDataset({
    id: 'motion', name: 'motion probe', count: rows, px, py, pz,
    time: null, epochMs: null, lifetime: null, maxLifetimeGap: 0,
    yaw: null, pitch: null, personId: null, teamId: null,
    personLabels: [], teamLabels: [], personTeam: null, personSlot: null,
    teamSizes: null, attrs: [], warnings: [],
    bounds: { minX: -3000, minY: 0, minZ: -3000, maxX: 3000, maxY: 120, maxZ: 3000 },
    timeRange: [0, 0], timeSorted: true,
  });
  s.setMode('heat-simple');
  s.patchTimeline({ mode: 'all', playing: false });
  s.patchHeat({ radius: 1, centerIntensity: 1, response: 'log', saturation: 4 });
}, ROWS);
await page.waitForTimeout(4000);

if (glb) {
  const loaded = await page.evaluate(async (path) => {
    const response = await fetch(path);
    const bytes = await response.arrayBuffer();
    const file = new File([bytes], path.split('/').pop(), { type: 'model/gltf-binary' });
    const { modelLoader } = await import('/src/data/modelLoader.ts');
    const { LOD_TARGETS, IMPORT_DEFAULT_LOD } = await import('/src/data/simplify.ts');
    const m = await modelLoader.load(file, LOD_TARGETS[IMPORT_DEFAULT_LOD]);
    const s = globalThis.__3dheat.useStore.getState();
    s.setLevel({
      kind: 'model', name: 'export',
      vertices: m.vertices, indices: m.indices,
      structureIndices: m.structureIndices, structureEdges: m.structureEdges,
      waterIndices: m.waterIndices, triangles: m.triangles,
      structureTriangles: m.structureTriangles, waterTriangles: m.waterTriangles,
      sourceTriangles: m.sourceTriangles,
      sourceStructureTriangles: m.sourceStructureTriangles,
      partNames: m.partNames, partClasses: m.partClasses, partReasons: m.partReasons,
      bounds: m.bounds, relief: { lowY: m.groundBand.minY, highY: m.groundBand.maxY },
      opacity: 1, desaturate: 1, brightness: 1,
      showStructureWire: true, showStructureFaces: true,
      structureWireOpacity: 0.5, structureOpacity: 0.15,
      groundWireOpacity: 0.2,
    });
    return { tris: m.triangles, structure: m.structureTriangles };
  }, `/${glb.replace(/\\/g, '/').replace(/^.*?3DHeat\//, '')}`);
  console.log(`level: ${loaded.tris.toLocaleString()} triangles (${loaded.structure.toLocaleString()} structure)\n`);
  await page.evaluate(() => globalThis.__3dheat_engine.frameDataset(true));
  await page.waitForTimeout(3000);
}

// The pose both comparison shots are taken from. Recorded once, after framing,
// looking down into the field rather than across it so there is heat on screen.
await page.evaluate(() => {
  const eng = globalThis.__3dheat_engine;
  const b = globalThis.__3dheat.useStore.getState().dataset.bounds;
  eng.camera.position.set(0, (b.maxY - b.minY) * 4 + 400, Math.max(b.maxZ - b.minZ, 1) * 0.35);
  eng.camera.setOrientationDegrees(0, -38);
  eng.camera.moved = true;
  const c = eng.camera;
  globalThis.__probePose = {
    x: c.position.x, y: c.position.y, z: c.position.z,
    yaw: c.yawDegrees, pitch: c.pitchDegrees,
  };
});
await page.waitForTimeout(1500);

/** Median smoothed frame time over a couple of seconds of forced rendering. */
const timeFrames = async (moving) =>
  page.evaluate(async (isMoving) => {
    const eng = globalThis.__3dheat_engine;
    const samples = [];
    // Forty frames, twelve of them warm-up. Enough to median out jitter without
    // making the sweep's high-budget rows take minutes each in software.
    for (let i = 0; i < 40; i++) {
      if (isMoving) {
        // A translation every frame, which is what invalidates accumulation.
        eng.camera.position.x += 0.35;
        eng.camera.moved = true;
      }
      eng.invalidate(2);
      await new Promise((r) => requestAnimationFrame(r));
      if (i > 11) samples.push(eng.live.frameMs);
    }
    samples.sort((a, b) => a - b);
    return {
      ms: samples[Math.floor(samples.length / 2)],
      splats: eng.live.splats,
      candidates: eng.live.candidates,
      converge: eng.live.convergeFrames,
      heatRes: eng.live.heatScale,
    };
  }, moving);

const setBudget = async (n) => {
  await page.evaluate((v) => {
    const s = globalThis.__3dheat.useStore.getState();
    s.patchBudget({ adaptive: false, progressive: true, splatsPerFrame: v, heatScale: 1 });
  }, n);
  await page.waitForTimeout(700);
};

// ------------------------------------------- does frame time follow the budget?
console.log('moving the camera, sprite budget swept by hand:');
console.log('  budget    frame     splats  converge');
const rows = [];
for (const b of [64 * 1024, 256 * 1024, 1024 * 1024, 4 * 1024 * 1024, 16 * 1024 * 1024]) {
  await setBudget(b);
  const r = await timeFrames(true);
  rows.push({ budget: b, ...r });
  console.log(
    `  ${(b / 1024 / 1024).toFixed(2).padStart(6)}M  ${r.ms.toFixed(1).padStart(6)}ms  ` +
      `${(r.splats / 1e6).toFixed(2).padStart(6)}M  ${String(r.converge).padStart(6)}`,
  );
}

// --------------------------------------- and what does the adaptive controller do?
//
// The question the fix turns on. Left to itself, does the controller settle at the
// floor — giving up all but one row in a couple of hundred to save nothing — or
// does it work out that sprites are free here and hold the budget up?
// A picture of it, moving, for the eye rather than the arithmetic. Two shots from
// the same viewpoint: one starved the way the old controller left it, one as the
// controller now settles.
/**
 * A frame captured while the camera is moving.
 *
 * Through `engine.captureFrame` rather than `page.screenshot`, which times out
 * here: the probe drives frames continuously so the page never reaches the idle
 * state Playwright waits for. Reading the engine's own frame is also the more
 * honest capture — it is the buffer the renderer just produced, mid-motion,
 * rather than whatever the compositor had when the screenshot landed.
 */
const shotMoving = async (name) => {
  const dataUrl = await page.evaluate(async () => {
    const eng = globalThis.__3dheat_engine;
    // Back to the recorded pose first. Without this the shots are not
    // comparable: the probe nudges the camera every frame to keep accumulation
    // invalidated, and by the second capture it had translated 140 units and left
    // the data behind — two pictures of different places, presented as before
    // and after.
    const p = globalThis.__probePose;
    eng.camera.position.set(p.x, p.y, p.z);
    eng.camera.setOrientationDegrees(p.yaw, p.pitch);
    // Six frames is enough: the point is a frame captured *while* the camera is
    // moving, and each one is a complete fresh estimate.
    for (let i = 0; i < 6; i++) {
      eng.camera.position.x += 0.35;
      eng.camera.moved = true;
      eng.invalidate(2);
      await new Promise((r) => requestAnimationFrame(r));
    }
    eng.camera.position.x += 0.35;
    eng.camera.moved = true;
    // Retried, and reported on rather than silently null. A capture depends on a
    // frame actually rendering, and the heat targets are reallocated whenever the
    // resolution changes — which is exactly what a climb does on its way up.
    let shot = null;
    for (let attempt = 0; attempt < 3 && !shot; attempt++) {
      eng.invalidate(4);
      shot = await eng.captureFrame();
    }
    if (!shot) {
      return {
        failed: true,
        backend: eng.live.backend,
        hasCapture: typeof eng.captureFrame === 'function',
        heatRes: eng.live.heatScale,
        frameMs: eng.live.frameMs,
      };
    }
    const c = document.createElement('canvas');
    c.width = shot.width;
    c.height = shot.height;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(shot.width, shot.height);
    img.data.set(shot.rgba);
    ctx.putImageData(img, 0, 0);
    return { url: c.toDataURL('image/png') };
  });
  if (!dataUrl || dataUrl.failed) {
    console.log(
      `  (no frame read back: backend ${dataUrl?.backend}, capture ${dataUrl?.hasCapture}, ` +
        `heat res ${((dataUrl?.heatRes ?? 0) * 100).toFixed(0)}%, frame ${dataUrl?.frameMs?.toFixed(0)}ms)`,
    );
    return;
  }
  writeFileSync(name, Buffer.from(dataUrl.url.split(',')[1], 'base64'));
};

if (process.env.HEAT3D_SHOTS) {
  await page.evaluate(() =>
    globalThis.__3dheat.useStore
      .getState()
      .patchBudget({ adaptive: false, splatsPerFrame: 64 * 1024, heatScale: 0.25 }),
  );
  await page.waitForTimeout(600);
  await shotMoving(`${process.env.HEAT3D_SHOTS}/motion-starved.png`);
  console.log(`\nshot at the floor (the reported symptom): motion-starved.png`);
}

console.log('\nadaptive controller, left to settle while the camera moves:');
await page.evaluate(() => {
  const s = globalThis.__3dheat.useStore.getState();
  s.patchBudget({ adaptive: true, progressive: true, heatScale: 1 });
});
await page.waitForTimeout(500);
/**
 * Let the loop settle, moving throughout, and report where it lands.
 *
 * Frame-counted with a wall-clock cap rather than by running a fixed number of
 * timing rounds. The climb is a factor of 1.6 per frame, so it settles in about
 * forty frames — but each of those frames is drawing more than the last, and once
 * it reaches the top it is rasterising fourteen million sprites in software.
 * Measured the naive way, this section took longer than everything else in the
 * probe put together, and the slowness *was the fix working*.
 */
const adaptive = await page.evaluate(async () => {
  const eng = globalThis.__3dheat_engine;
  const started = performance.now();
  let settledFor = 0;
  let last = 0;
  // A floor on the number of frames as well as a stability test. The first
  // version broke out after seven frames because the budget starts at the floor
  // and *stays* there while the controller spends its patience — so "the budget
  // has stopped changing" was true before anything had happened, and the probe
  // reported the pre-fix behaviour as the post-fix result.
  // Enough frames for the climb, which now steps once every fourteen updates so
  // the frame time can respond: about seventeen steps from the floor to the
  // ceiling, so a few hundred frames.
  const MIN_FRAMES = 55;
  for (let i = 0; i < 420 && performance.now() - started < 240_000; i++) {
    eng.camera.position.x += 0.35;
    eng.camera.moved = true;
    eng.invalidate(2);
    await new Promise((r) => requestAnimationFrame(r));
    if (Math.abs(eng.live.budget - last) < last * 0.01) settledFor++;
    else settledFor = 0;
    last = eng.live.budget;
    if (i >= MIN_FRAMES && settledFor >= 10) break;
  }
  return {
    ms: eng.live.frameMs,
    splats: eng.live.splats,
    candidates: eng.live.candidates,
    converge: eng.live.convergeFrames,
    heatRes: eng.live.heatScale,
  };
});
console.log(
  `  budget ${(adaptive.splats / 1e6).toFixed(2)}M sprites · ` +
    `converge ${adaptive.converge} frame(s) · heat res ${(adaptive.heatRes * 100).toFixed(0)}% · ` +
    `frame ${adaptive.ms.toFixed(1)}ms`,
);
const verdict =
  adaptive.converge <= 1
    ? 'a moving frame now draws every candidate row — identical to a still one'
    : `a moving frame still shows one row in ${adaptive.converge}`;
console.log(`  → ${verdict}`);

if (process.env.HEAT3D_SHOTS) {
  await shotMoving(`${process.env.HEAT3D_SHOTS}/motion-adaptive.png`);
  console.log(`  shot as it now settles: motion-adaptive.png`);
}

// ------------------------------------------------- and what does the level cost?
await page.evaluate(() =>
  globalThis.__3dheat.useStore.getState().patchBudget({ adaptive: false }),
);
await setBudget(64 * 1024);
const withLevel = await timeFrames(true);
await page.evaluate(() => globalThis.__3dheat.useStore.getState().setLevel(null));
await page.waitForTimeout(1200);
const noLevel = await timeFrames(true);
console.log(
  `\nat the floor budget: ${withLevel.ms.toFixed(1)}ms with the level, ` +
    `${noLevel.ms.toFixed(1)}ms without it`,
);

// ------------------------------------------------------------------ the verdict
console.log('');
const floor = rows[0];
const top = rows[rows.length - 1];
const grew = top.ms / Math.max(0.001, floor.ms);
const rowsGrew = top.splats / Math.max(1, floor.splats);
console.log(
  `Raising the budget ${rowsGrew.toFixed(0)}x changed the frame ${grew.toFixed(2)}x ` +
    `(${floor.ms.toFixed(1)}ms → ${top.ms.toFixed(1)}ms).`,
);
if (grew < rowsGrew * 0.25) {
  console.log(
    `\nThe heat pass is not what the frame is spending its time on, so cutting sprites\n` +
      `buys almost nothing — and the adaptive controller, which can only see the total,\n` +
      `cuts them to the floor anyway trying to reach a target the geometry alone blows.\n` +
      `That is why a moving frame shows one row in ${floor.converge} instead of a field.`,
  );
} else {
  console.log(
    `\nThe heat pass does dominate the frame, so the budget floor is doing its job and\n` +
      `the fix has to be in how a sparse sample is drawn, not in how many are drawn.`,
  );
}

await browser.close();
