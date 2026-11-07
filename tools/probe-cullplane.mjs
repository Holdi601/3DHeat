/**
 * Is the far cull a plane or a sphere?
 *
 * Arithmetic, not appearance. A row of datapoints all at the same depth in front
 * of the camera but spread sideways is the whole test: measured along the view
 * axis they are all the same distance away and either all survive or all go;
 * measured from the eye the outer ones are further — 3,000 units out at 4,000
 * deep is 5,000 from the eye — so a sphere clips the ends off the row and leaves
 * the middle. The two cuts are distinguishable in one frame and cannot be
 * confused for one another.
 *
 * Worth a probe of its own because the wrong one is not obviously wrong: a sphere
 * looks like a plane until you notice the cut sliding as you turn, which is the
 * kind of thing that goes unnoticed for months.
 *
 *   node tools/probe-cullplane.mjs [url]
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
const page = await browser.newPage({ viewport: { width: 1000, height: 400 } });
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40_000 });

/**
 * One clump at a time, at a known depth and a known sideways offset.
 *
 * One at a time on purpose. The first version put five in a row and counted
 * warm pixels in five vertical bands, which measured the projection rather than
 * the cull: at this depth the clumps compress into the middle of the frame and
 * two of them share a band, so the centre band read half the luminance of its
 * neighbours and two bands read zero. Total heat for a single clump depends on
 * nothing but whether it was drawn.
 *
 * The arithmetic: 4,000 deep and 3,000 to the side is 5,000 from the eye. A far
 * bound of 4,500 therefore keeps it under a plane and drops it under a sphere,
 * while the clump straight ahead is 4,000 away by either measure and survives
 * both. Nothing about that depends on the field of view.
 */
const useClump = async (offsetX) => {
  await page.evaluate(async (x) => {
    const rows = 20_000;
    const px = new Float32Array(rows);
    const py = new Float32Array(rows);
    const pz = new Float32Array(rows);
    for (let i = 0; i < rows; i++) {
      px[i] = x + (Math.random() - 0.5) * 260;
      py[i] = (Math.random() - 0.5) * 260;
      pz[i] = -4000 + (Math.random() - 0.5) * 60;
    }
    const s = globalThis.__3dheat.useStore.getState();
    s.setDataset({
      id: 'cullplane' + x, name: 'cull plane probe', count: rows, px, py, pz,
      time: null, epochMs: null, lifetime: null, maxLifetimeGap: 0,
      yaw: null, pitch: null, personId: null, teamId: null,
      personLabels: [], teamLabels: [], personTeam: null, personSlot: null,
      teamSizes: null, attrs: [], warnings: [],
      bounds: { minX: x - 200, minY: -200, minZ: -4100, maxX: x + 200, maxY: 200, maxZ: -3900 },
      timeRange: [0, 0], timeSorted: true,
    });
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all', playing: false });
    s.patchHeat({
      radius: 200, groundProjected: false, occlusion: 0, hideBehindGround: false,
      response: 'linear', saturation: 40, cullNear: 0, cullFar: 0, cullPlanar: true,
    });
    // Every row every frame, so nothing here measures convergence.
    s.patchBudget({ splatsPerFrame: 20_000_000, adaptive: false, progressive: false });
  }, offsetX);
  await page.waitForTimeout(1200);
  // After the dataset, because loading one frames the view on its bounds.
  await page.evaluate(() => {
    const engine = globalThis.__3dheat_engine;
    engine.camera.position.set(0, 0, 0);
    engine.camera.setOrientationDegrees(0, 0);
    engine.camera.moved = true;
  });
  await page.waitForTimeout(2400);
};
const READ = `
  async () => {
    const engine = globalThis.__3dheat_engine;
    const w = 500, h = 200;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    if (engine.live.backend === 'webgpu') {
      const s = await engine.captureFrame();
      if (!s) return null;
      const t = document.createElement('canvas');
      t.width = s.width; t.height = s.height;
      const tc = t.getContext('2d');
      const img = tc.createImageData(s.width, s.height);
      img.data.set(s.rgba);
      tc.putImageData(img, 0, 0);
      ctx.drawImage(t, 0, 0, w, h);
    } else {
      ctx.drawImage(engine.canvas, 0, 0, w, h);
    }
    const d = ctx.getImageData(0, 0, w, h).data;
    let heat = 0;
    for (let i = 0; i < d.length; i += 4) {
      const warm = d[i] > d[i + 2] + 12 || (d[i] > 180 && d[i + 1] > 180 && d[i + 2] > 180);
      if (warm) heat += d[i] + d[i + 1] + d[i + 2];
    }
    return heat;
  }
`;
/**
 * Wait until the accumulated field has stopped changing.
 *
 * Needed before *every* read, not just after a change, and WebGPU is where that
 * showed: the baseline read came back 4.5x the others because the field had been
 * summing for several frames, while changing a cull bound resets it and the next
 * read landed on a single frame's worth. The cull was behaving identically on
 * both backends; only the baseline was inflated.
 */
const settle = async () => {
  await page.waitForFunction(() => globalThis.__3dheat_engine.live.converged === true, null, {
    timeout: 60_000,
  });
  await page.waitForTimeout(500);
};
const set = async (patch) => {
  await page.evaluate((p) => globalThis.__3dheat.useStore.getState().patchHeat(p), patch);
  await page.waitForTimeout(400);
  await settle();
};
async function heat(label) {
  await settle();
  const v = await page.evaluate(`(${READ})()`);
  if (v === null) throw new Error('could not read the frame');
  console.log(`  ${label.padEnd(34)} heat ${String(v).padStart(9)}`);
  return v;
}

/** No cull, then a plane, then a sphere, for one clump. */
async function measure(offsetX) {
  await useClump(offsetX);
  console.log(`clump ${offsetX} to the side, 4000 deep (${Math.hypot(offsetX, 4000).toFixed(0)} from the eye)`);
  const none = await heat('no cull');
  await set({ cullPlanar: true, cullFar: 4500 });
  const plane = await heat('plane at 4500');
  await set({ cullPlanar: false, cullFar: 4500 });
  const sphere = await heat('sphere at 4500');
  await set({ cullFar: 0, cullPlanar: true });
  return { none, plane, sphere };
}

const ahead = await measure(0);
const beside = await measure(3000);
const frac = (a, b) => (a > 0 ? b / a : 0);

// The off-axis clump against the on-axis one, both measured with the same cull.
//
// Not against the same clump with no cull, which is what the first version did
// and which compares two different things: the two backends composite the
// uncalled field at different brightness at these settings — WebGL2 read 78,588
// and WebGPU 361,244 for the same scene — so a ratio taken across that reads as
// the cull removing four fifths of the heat on one backend and nothing on the
// other. Both clumps sit at the same depth, so under a plane they belong at the
// same level as each other whatever that level is, and under a sphere they do
// not. That is the property being tested and it needs no baseline.
const planeRatio = frac(ahead.plane, beside.plane);
const sphereRatio = frac(ahead.sphere, beside.sphere);
console.log(
  `\noff-axis against straight-ahead:  plane ${(planeRatio * 100).toFixed(0)}%  ` +
    `sphere ${(sphereRatio * 100).toFixed(0)}%`,
);

// ------------------------------------------------- and the level, not just the heat
//
// A receding ground plane, so there is geometry on both sides of the bound. With
// the level left whole the plane removes the datapoints and leaves the building
// standing in front of them, which hides what the plane was moved there to show,
// so "cut the level too" is the setting that makes the control useful. Measured
// as how many pixels of level survive.
console.log('');
const groundPixels = async (label) => {
  const n = await page.evaluate(`(async () => {
    const engine = globalThis.__3dheat_engine;
    const w = 500, h = 200;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    if (engine.live.backend === 'webgpu') {
      const s = await engine.captureFrame();
      if (!s) return null;
      const t = document.createElement('canvas');
      t.width = s.width; t.height = s.height;
      const tc = t.getContext('2d');
      const img = tc.createImageData(s.width, s.height);
      img.data.set(s.rgba);
      tc.putImageData(img, 0, 0);
      ctx.drawImage(t, 0, 0, w, h);
    } else {
      ctx.drawImage(engine.canvas, 0, 0, w, h);
    }
    const d = ctx.getImageData(0, 0, w, h).data;
    // Grey and above the background: that is level, not heat and not empty.
    let px = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] > 30 && Math.abs(d[i] - d[i + 1]) < 12 && Math.abs(d[i + 1] - d[i + 2]) < 14) px++;
    }
    return px;
  })()`);
  console.log(`  ${label.padEnd(34)} level px ${String(n).padStart(8)}`);
  return n;
};

await page.evaluate(() => {
  // A strip of ground running away from the camera, from 1,000 to 12,000 out.
  const verts = [];
  const idx = [];
  const rows = 40;
  for (let j = 0; j <= rows; j++) {
    const z = -1000 - (11000 * j) / rows;
    for (const x of [-4000, 4000]) verts.push(x, -400, z, 0, 1, 0);
  }
  for (let j = 0; j < rows; j++) {
    const a = j * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const s = globalThis.__3dheat.useStore.getState();
  s.setLevel({
    kind: 'model',
    name: 'strip',
    vertices: new Float32Array(verts),
    indices: new Uint32Array(idx),
    triangles: idx.length / 3,
    sourceTriangles: idx.length / 3,
    partNames: ['ground:strip'],
    partClasses: ['ground'],
    partReasons: ['probe'],
    bounds: { minX: -4000, minY: -400, minZ: -12000, maxX: 4000, maxY: -400, maxZ: -1000 },
    opacity: 1,
    desaturate: 1,
    brightness: 0.9,
    wireframe: false,
    relief: { slope: 0, contourSpacing: 0, contourStrength: 0, elevationRange: 0 },
  });
});
await page.waitForTimeout(1200);
// Looking *down* at the strip, not along it.
//
// At eye level a ground plane is seen edge-on and everything past the cut
// compresses into a few pixels near the horizon: the first version of this
// measured a 6% change and read it as the cull not working, when the cull was
// removing two thirds of the strip's *area* and almost none of its pixels.
await page.evaluate(() => {
  const engine = globalThis.__3dheat_engine;
  engine.camera.position.set(0, 2000, 0);
  engine.camera.setOrientationDegrees(0, -35);
  engine.camera.moved = true;
});
await set({ cullFar: 0, cullPlanar: true, cullGeometry: true });
const levelWhole = await groundPixels('no cull');
await set({ cullFar: 4500 });
const levelCut = await groundPixels('plane at 4500, level cut');
await set({ cullFar: 2500 });
const levelCutNear = await groundPixels('plane at 2500, level cut');
await set({ cullFar: 4500, cullGeometry: false });
const levelKept = await groundPixels('plane at 4500, level whole');

const checks = [
  [
    // Thresholds on the absolute fraction are a trap here: a ground plane
    // receding from the camera puts most of its *pixels* in its nearest few
    // metres, so a cut that removes three quarters of its area removes a fifth
    // of its pixels. Two bounds and a monotonic comparison say the same thing
    // without depending on the projection at all.
    'the plane cuts the level when asked',
    levelWhole > 2000 && levelCut < levelWhole * 0.9 && levelCutNear < levelCut * 0.9,
  ],
  [
    // The setting has to be a setting: reading density through a level you can
    // see is what the bounds did before this existed.
    'and leaves it alone when not',
    Math.abs(levelKept - levelWhole) < levelWhole * 0.02,
  ],
  ['both clumps are drawn', ahead.none > 1000 && beside.none > 1000],
  ['the far bound leaves the clump straight ahead alone', ahead.plane > 1000 && ahead.sphere > 1000],
  [
    // The point of the plane: same depth, same treatment, wherever it sits in
    // the frame.
    'the plane treats a clump 3000 off-axis the same as one straight ahead',
    planeRatio > 0.8 && planeRatio < 1.25,
  ],
  [
    // 3,000 out at 4,000 deep is 5,000 from the eye, past a 4,500 bound.
    'the sphere drops it instead',
    sphereRatio < 0.15,
  ],
];
console.log('');
for (const [name, pass] of checks) console.log(`  ${pass ? 'ok  ' : 'FAIL'} ${name}`);
await browser.close();
process.exit(checks.every(([, p]) => p) ? 0 : 1);
