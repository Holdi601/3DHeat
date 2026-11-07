/**
 * Occlusion and relief, on geometry built for the purpose.
 *
 * The real map is a bad instrument for this. A datapoint standing on terrain is
 * about a metre above it, so viewed from below it is only a metre *behind* it —
 * the same margin as a point standing on the ground viewed from above, which
 * must not be suppressed. No bias can separate those two, and a test built on
 * that case measures the bias rather than the feature.
 *
 * So: a wall, a known distance in front of a known blob of data. Half the data
 * behind it, half beside it. Then the answer is arithmetic — the half behind the
 * wall must go, the half beside it must stay.
 *
 *   node tools/probe-occlusion.mjs [url]
 */
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:5273/?backend=webgl2';
// WebGPU needs the full Chromium channel and the Vulkan path; forcing
// ANGLE/SwiftShader for WebGL suppresses exactly that, so the two flag sets are
// mutually exclusive and picked from the URL.
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
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
page.on('console', (m) => {
  if (m.type() === 'error') console.log('  console error:', m.text());
});
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);

/**
 * A flat dataset and a wall standing in front of its left half.
 *
 * Geometry, in world units: data on the plane y=0 spanning x -1000..1000, the
 * camera looking down -Z from z=+3000, and a wall at z=+1000 covering x<0. So
 * every point with x<0 is behind the wall and every point with x>0 is not.
 */
const built = await page.evaluate(async () => {
  const rows = 40_000;
  const px = new Float32Array(rows);
  const py = new Float32Array(rows);
  const pz = new Float32Array(rows);
  for (let i = 0; i < rows; i++) {
    // Two blobs, one either side of x=0, both well clear of the wall's edges.
    const left = i % 2 === 0;
    px[i] = (left ? -1 : 1) * (200 + Math.random() * 600);
    py[i] = (Math.random() - 0.5) * 100;
    pz[i] = (Math.random() - 0.5) * 400;
  }
  const dataset = {
    id: 'occlusion-probe',
    name: 'occlusion probe',
    count: rows,
    px,
    py,
    pz,
    time: null,
    epochMs: null,
    lifetime: null,
    maxLifetimeGap: 0,
    yaw: null,
    pitch: null,
    personId: null,
    teamId: null,
    personLabels: [],
    teamLabels: [],
    personTeam: null,
    personSlot: null,
    teamSizes: null,
    attrs: [],
    warnings: [],
    bounds: { minX: -1000, minY: -50, minZ: -200, maxX: 1000, maxY: 50, maxZ: 200 },
    timeRange: [0, 0],
    timeSorted: true,
  };

  // The wall: two triangles at z = +1000 covering x in [-1200, -50].
  const quad = (x0, x1, y0, y1, z) => {
    const v = [];
    const n = [0, 0, 1];
    for (const [x, y] of [
      [x0, y0],
      [x1, y0],
      [x1, y1],
      [x0, y0],
      [x1, y1],
      [x0, y1],
    ]) {
      v.push(x, y, z, ...n);
    }
    return v;
  };
  const vertices = new Float32Array(quad(-1200, -50, -600, 600, 1000));
  const indices = new Uint32Array([0, 1, 2, 3, 4, 5]);

  const s = globalThis.__3dheat.useStore.getState();
  s.setDataset(dataset);
  s.setMode('heat-simple');
  s.patchTimeline({ mode: 'all', playing: false });
  // The terrain cutoff off for this section: it is a separate control, tested on
  // its own below, and leaving it at its default would mix the two.
  s.patchHeat({ radius: 40, groundProjected: false, occlusion: 0, hideBehindGround: false });
  // The wall is a *structure*, and that is the whole point of this probe.
  //
  // It used to be `ground`, and the test passed for months while occlusion by a
  // building did not work at all. Structures are drawn translucent, so they draw
  // with depth writes off — a shell that wrote depth would hide the shells behind
  // it and the ground under it — which left them out of the depth texture the
  // heat pass samples. Only the traced terrain was in there. So heat behind a
  // hillside was hidden, heat behind a warehouse or a cliff mesh came through at
  // full strength, and the probe could not tell because its wall was terrain.
  //
  // Ground occlusion is still covered: the relief section below puts a dome of
  // terrain in front of the same data.
  s.setLevel({
    kind: 'model',
    name: 'wall',
    vertices,
    indices: new Uint32Array(0),
    structureIndices: indices,
    triangles: 0,
    structureTriangles: 2,
    sourceTriangles: 2,
    partNames: ['structure:wall'],
    partClasses: ['structure'],
    partReasons: ['probe'],
    bounds: { minX: -1200, minY: -600, minZ: 1000, maxX: -50, maxY: 600, maxZ: 1000 },
    opacity: 1,
    desaturate: 1,
    brightness: 0.9,
    wireframe: false,
    structureOpacity: 0.25,
    showStructureWire: false,
  });

  return { rows };
});

// The camera has to be placed *after* the engine has seen the new dataset:
// loading one frames the view on its bounds, which would otherwise overwrite
// whatever was set here and quietly invalidate the whole test.
await page.waitForTimeout(1500);
const placed = await page.evaluate(() => {
  const engine = globalThis.__3dheat_engine;
  engine.camera.position.set(0, 0, 3000);
  engine.camera.setOrientationDegrees(0, 0);
  engine.camera.moved = true;
  return {
    at: [engine.camera.position.x, engine.camera.position.y, engine.camera.position.z],
  };
});
console.log(`built ${built.rows} points, half behind a wall; camera at ${placed.at.join(', ')}\n`);
await page.waitForTimeout(3000);

/**
 * The current frame as RGBA, whichever backend drew it.
 *
 * Headless Chromium renders WebGPU correctly but never composites its canvas, so
 * `drawImage(canvas)` returns nothing there — every measurement reads zero and
 * looks like a broken feature. The WebGPU backend exposes `captureFrame()` for
 * exactly this, running the composite a second time into an offscreen target.
 */
const READ_FRAME = `
  async (w, h) => {
    const engine = globalThis.__3dheat_engine;
    if (engine.live.backend === 'webgpu') {
      const shot = await engine.captureFrame();
      if (!shot) return null;
      return { data: Array.from(shot.rgba), width: shot.width, height: shot.height };
    }
    const scratch = document.createElement('canvas');
    scratch.width = w;
    scratch.height = h;
    const ctx = scratch.getContext('2d');
    ctx.drawImage(engine.canvas, 0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h);
    return { data: Array.from(img.data), width: w, height: h };
  }
`;
async function halves(label) {
  const frame = await page.evaluate(`(${READ_FRAME})(400, 250)`);
  if (!frame) throw new Error('could not read the frame');
  const { data, width, height } = frame;
  let left = 0;
  let right = 0;
  let wall = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      const r = data[o];
      const g = data[o + 1];
      const b = data[o + 2];
      // Heat is anything warm *or* blown out to white; grey is level, and
      // (22,23,26) is the background. Counting only "warm" pixels made the
      // measurement non-monotonic: as heat dims, white-hot pixels turn orange
      // and *enter* the warm set, so removing heat could raise the total.
      const warm = r > b + 12;
      const white = r > 180 && g > 180 && b > 180;
      if (warm || white) {
        const lum = r + g + b;
        if (x < width / 2) left += lum;
        else right += lum;
      } else if (r > 40 && Math.abs(r - g) < 12) {
        wall++;
      }
    }
  }
  console.log(
    `${label.padEnd(22)} behind the wall ${String(left).padStart(8)}   ` +
      `in the open ${String(right).padStart(8)}   ratio ${(left / Math.max(1, right)).toFixed(2)}` +
      `   wall px ${wall}`,
  );
  return { left, right, wall };
}

const set = async (patch) => {
  await page.evaluate((p) => globalThis.__3dheat.useStore.getState().patchHeat(p), patch);
  await page.waitForTimeout(2200);
};

await set({ response: 'linear', saturation: 30, occlusion: 0 });
const off = await halves('occlusion 0');
await set({ occlusion: 0.5 });
const half = await halves('occlusion 0.5');
await set({ occlusion: 0.8 });
const strong = await halves('occlusion 0.8');
await set({ occlusion: 1 });
const full = await halves('occlusion 1');

// And with the shell hidden. The geometry is still there, so it still occludes:
// "show structure faces" is a display toggle, and hiding a wall you are standing
// behind should not make the room behind it light up.
await page.evaluate(() =>
  globalThis.__3dheat.useStore.getState().patchLevel({ showStructureFaces: false }),
);
await page.waitForTimeout(2200);
const hidden = await halves('faces hidden');
await page.evaluate(() =>
  globalThis.__3dheat.useStore.getState().patchLevel({ showStructureFaces: true }),
);
await page.waitForTimeout(1200);

const pct = (a, b) => (a > 0 ? (1 - b / a) * 100 : 0);
console.log(
  `\nbehind the wall: -${pct(off.left, half.left).toFixed(0)}% at 0.5, ` +
    `-${pct(off.left, strong.left).toFixed(0)}% at 0.8, ` +
    `-${pct(off.left, full.left).toFixed(0)}% at 1.0`,
);
console.log(
  `in the open:     -${pct(off.right, half.right).toFixed(0)}% at 0.5, ` +
    `-${pct(off.right, strong.right).toFixed(0)}% at 0.8, ` +
    `-${pct(off.right, full.right).toFixed(0)}% at 1.0`,
);

// ------------------------------------------------- the terrain cutoff
//
// The dimmer and the cutoff answer different questions, and the point of this
// section is that they cannot be substituted for one another. Same data, same
// camera, same wall in the same place — once as terrain and once as a structure.
//
// What it has to show: behind terrain, the cutoff removes the heat and the dimmer
// is not involved; behind a structure, the cutoff does nothing and the dimmer is
// the only thing that acts. Without the second half a cutoff that simply deleted
// everything occluded would pass.
console.log('');
const WALL_QUAD = `
  (kind) => {
    const v = [];
    for (const [x, y] of [[-1200,-600],[-50,-600],[-50,600],[-1200,-600],[-50,600],[-1200,600]]) {
      v.push(x, y, 1000, 0, 0, 1);
    }
    const vertices = new Float32Array(v);
    const tri = new Uint32Array([0, 1, 2, 3, 4, 5]);
    const ground = kind === 'ground';
    globalThis.__3dheat.useStore.getState().setLevel({
      kind: 'model',
      name: kind + ' wall',
      vertices,
      indices: ground ? tri : new Uint32Array(0),
      structureIndices: ground ? new Uint32Array(0) : tri,
      triangles: ground ? 2 : 0,
      structureTriangles: ground ? 0 : 2,
      sourceTriangles: 2,
      partNames: [kind + ':wall'],
      partClasses: [kind],
      partReasons: ['probe'],
      bounds: { minX: -1200, minY: -600, minZ: 1000, maxX: -50, maxY: 600, maxZ: 1000 },
      opacity: 1,
      desaturate: 1,
      brightness: 0.9,
      wireframe: false,
      structureOpacity: 0.25,
      showStructureWire: false,
      // Flat, or the ground pass shades a vertical quad by its slope and the
      // pixel test below stops finding a wall at all.
      relief: { slope: 0, contourSpacing: 0, contourStrength: 0, elevationRange: 0 },
    });
  }
`;
// Setting a level reframes the camera on its bounds, so it has to go back
// afterwards — the first version of this measured a view of the wall edge-on and
// reported that nothing was ever occluded.
const useWall = async (kind) => {
  await page.evaluate(`(${WALL_QUAD})(${JSON.stringify(kind)})`);
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    const engine = globalThis.__3dheat_engine;
    engine.camera.position.set(0, 0, 3000);
    engine.camera.setOrientationDegrees(0, 0);
    engine.camera.moved = true;
  });
  await page.waitForTimeout(2400);
};

await useWall('ground');
await set({ occlusion: 0, hideBehindGround: false });
const terrainOpen = await halves('terrain, no cutoff');
await set({ hideBehindGround: true });
const terrainCut = await halves('terrain, cutoff');

await useWall('structure');
await set({ occlusion: 0, hideBehindGround: false });
const wallOpen = await halves('wall, no cutoff');
await set({ hideBehindGround: true });
const wallCut = await halves('wall, cutoff');

console.log(
  `\ncutoff behind terrain:   -${pct(terrainOpen.left, terrainCut.left).toFixed(0)}%` +
    `   in the open -${pct(terrainOpen.right, terrainCut.right).toFixed(0)}%`,
);
console.log(
  `cutoff behind a wall:    -${pct(wallOpen.left, wallCut.left).toFixed(0)}%` +
    `   in the open -${pct(wallOpen.right, wallCut.right).toFixed(0)}%`,
);

// ------------------------------------------------------------------ relief
// A tilted ground plane, so slope shading and contours both have something to
// work on, measured as local contrast the way probe-depth does.
console.log('');
const relief = await page.evaluate(async () => {
  const n = 64;
  const size = 4000;
  const vertices = [];
  const indices = [];
  for (let j = 0; j <= n; j++) {
    for (let i = 0; i <= n; i++) {
      const x = -size / 2 + (size * i) / n;
      const z = -size / 2 + (size * j) / n;
      // A dome plus ripples: gentle slopes and a few steep ones.
      const h =
        Math.sin((i / n) * Math.PI) * Math.sin((j / n) * Math.PI) * 600 +
        Math.sin((i / n) * Math.PI * 6) * 60;
      // Real normals from the height field, not a flat (0,1,0): slope shading
      // reads the normal, so flat normals make it measure nothing.
      const dx =
        (Math.cos((i / n) * Math.PI) * Math.sin((j / n) * Math.PI) * 600 * Math.PI +
          Math.cos((i / n) * Math.PI * 6) * 60 * Math.PI * 6) /
        (size / n);
      const dz = (Math.sin((i / n) * Math.PI) * Math.cos((j / n) * Math.PI) * 600 * Math.PI) / (size / n);
      const len = Math.hypot(-dx, 1, -dz) || 1;
      vertices.push(x, h, z, -dx / len, 1 / len, -dz / len);
    }
  }
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const a = j * (n + 1) + i;
      indices.push(a, a + 1, a + n + 1, a + 1, a + n + 2, a + n + 1);
    }
  }
  const s = globalThis.__3dheat.useStore.getState();
  s.setLevel({
    kind: 'model',
    name: 'terrain',
    vertices: new Float32Array(vertices),
    indices: new Uint32Array(indices),
    triangles: indices.length / 3,
    sourceTriangles: indices.length / 3,
    partNames: ['ground:terrain'],
    partClasses: ['ground'],
    partReasons: ['probe'],
    bounds: { minX: -size / 2, minY: -60, minZ: -size / 2, maxX: size / 2, maxY: 660, maxZ: size / 2 },
    opacity: 1,
    desaturate: 1,
    brightness: 0.9,
    wireframe: false,
  });
  // Both depth controls off, and stated rather than inherited. This section
  // measures the *ground's* shading, and heat sits on top of the pixels it
  // reads: leaving the terrain cutoff on from the section above removed the heat
  // behind the dome, which turned those pixels back into countable ground and
  // moved the contrast and spread of every reading here.
  s.patchHeat({ occlusion: 0, hideBehindGround: false });
  const engine = globalThis.__3dheat_engine;
  engine.applyPreset('Iso NE');
  engine.frameDataset(true);
  return { triangles: indices.length / 3 };
});
console.log(`ground: ${relief.triangles} triangles of dome and ripple`);
await page.waitForTimeout(3000);

async function groundContrast(label) {
  const frame = await page.evaluate(`(${READ_FRAME})(480, 300)`);
  if (!frame) throw new Error('could not read the frame');
  const { data, width, height } = frame;
  const at = (x, y) => (y * width + x) * 4;
  // Just above the (22, 23, 26) background: slope shading *darkens* steep
  // ground, so a high threshold throws away exactly the pixels being measured.
  const grey = (o) =>
    data[o] > 27 && Math.abs(data[o] - data[o + 1]) < 10 && Math.abs(data[o + 1] - data[o + 2]) < 12;
  let pixels = 0;
  let contrast = 0;
  let sum = 0;
  let sumSq = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const o = at(x, y);
      if (!grey(o)) continue;
      pixels++;
      sum += data[o];
      sumSq += data[o] * data[o];
      const r = at(x + 1, y);
      if (grey(r)) contrast += Math.abs(data[o] - data[r]);
    }
  }
  const stats = {
    pixels,
    contrast: pixels ? +(contrast / pixels).toFixed(2) : 0,
    // Spread of ground values. Slope shading and the elevation ramp are
    // *large-scale* cues — they darken a whole hillside — so they widen the
    // distribution without raising adjacent-pixel contrast, which is what
    // contours do. Two cues, two measurements.
    spread: pixels ? +Math.sqrt(sumSq / pixels - (sum / pixels) ** 2).toFixed(2) : 0,
  };
  console.log(
    `${label.padEnd(22)} ground px ${String(stats.pixels).padStart(6)}  ` +
      `local contrast ${String(stats.contrast).padStart(6)}  spread ${String(stats.spread).padStart(6)}`,
  );
  return stats;
}
const setRelief = async (patch) => {
  await page.evaluate((p) => globalThis.__3dheat.useStore.getState().patchLevel({ relief: p }), patch);
  await page.waitForTimeout(2400);
};

await setRelief({ slope: 0, contourSpacing: 0, contourStrength: 0, elevationRange: 0 });
const flat = await groundContrast('flat (the old look)');
await setRelief({ slope: 0.55, contourSpacing: 0, contourStrength: 0, elevationRange: 0 });
const sloped = await groundContrast('slope only');
await setRelief({ slope: 0, contourSpacing: 40, contourStrength: 0.6, elevationRange: 0 });
const contoured = await groundContrast('contours only');
await setRelief(undefined);
const full2 = await groundContrast('defaults');

// -------------------------------------------------------------- flat normals
// A field of welded cubes, which is what an exported level actually is: eight
// vertices per box, no normals in the file, so the viewer's derived normal at
// each corner is the average of the three faces meeting there and points
// diagonally outward. Shading from that rounds every corner off and a row of
// boxes reads as a heap of foil. Measured as how much the value drifts *within*
// a face — steps between faces are excluded, since those are the thing we want.
console.log('');
const cubes = await page.evaluate(async () => {
  const vertices = [];
  const indices = [];
  const CORNERS = [
    [-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1],
    [-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1],
  ];
  const FACES = [
    [0, 1, 2], [0, 2, 3], [4, 6, 5], [4, 7, 6], // bottom, top
    [0, 5, 1], [0, 4, 5], [1, 5, 6], [1, 6, 2], // -Z, +X
    [2, 6, 7], [2, 7, 3], [3, 7, 4], [3, 4, 0], // +Z, -X
  ];
  const half = 140;
  for (let gz = 0; gz < 4; gz++) {
    for (let gx = 0; gx < 4; gx++) {
      const base = vertices.length / 6;
      const cx = (gx - 1.5) * 520;
      const cz = (gz - 1.5) * 520;
      for (const [x, y, z] of CORNERS) {
        // The averaged normal at a welded cube corner: it points along the
        // diagonal, which is what makes the corner look rounded.
        const inv = 1 / Math.sqrt(3);
        vertices.push(cx + x * half, half + y * half, cz + z * half, x * inv, y * inv, z * inv);
      }
      for (const f of FACES) indices.push(base + f[0], base + f[1], base + f[2]);
    }
  }
  const s = globalThis.__3dheat.useStore.getState();
  s.setLevel({
    kind: 'model',
    name: 'cubes',
    vertices: new Float32Array(vertices),
    // No ground at all, so every non-background pixel belongs to a box.
    indices: new Uint32Array(0),
    structureIndices: new Uint32Array(indices),
    triangles: 0,
    structureTriangles: indices.length / 3,
    sourceTriangles: 0,
    partNames: ['structure:cubes'],
    partClasses: ['structure'],
    partReasons: ['probe'],
    bounds: { minX: -1200, minY: 0, minZ: -1200, maxX: 1200, maxY: 280, maxZ: 1200 },
    opacity: 1,
    desaturate: 1,
    brightness: 0.9,
    wireframe: false,
    structureOpacity: 1,
    structureTint: [1, 1, 1],
    showStructureFaces: true,
    showStructureWire: false,
  });
  const engine = globalThis.__3dheat_engine;
  engine.applyPreset('Iso NE');
  engine.frameDataset(true);
  return { triangles: indices.length / 3 };
});
console.log(`structures: ${cubes.triangles} triangles of welded cube`);
await page.waitForTimeout(3000);

async function faceDrift(label) {
  const frame = await page.evaluate(`(${READ_FRAME})(480, 300)`);
  if (!frame) throw new Error('could not read the frame');
  const { data, width, height } = frame;
  const at = (x, y) => (y * width + x) * 4;
  const lit = (o) => data[o] > 30;
  let pairs = 0;
  let drift = 0;
  let covered = 0;
  let sum = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 2; x++) {
      const o = at(x, y);
      if (lit(o)) {
        covered++;
        sum += data[o];
      }
      const r = at(x + 1, y);
      if (!lit(o) || !lit(r)) continue;
      const d = Math.abs(data[o] - data[r]);
      // A jump this large is a face boundary or a silhouette, which is the thing
      // being asked for. Everything below it is one face shading unevenly.
      if (d >= 20) continue;
      pairs++;
      drift += d;
    }
  }
  const stats = {
    drift: pairs ? +(drift / pairs).toFixed(3) : 0,
    pairs,
    covered,
    // Guards the orientation: the cross product's sign follows the winding and
    // the screen-space handedness, so getting it wrong turns every lit face
    // into an unlit one and the boxes go black without disappearing.
    mean: covered ? +(sum / covered).toFixed(1) : 0,
  };
  console.log(
    `${label.padEnd(22)} within-face drift ${String(stats.drift).padStart(6)}  ` +
      `over ${String(stats.pairs).padStart(6)} pairs, ${stats.covered} lit px at mean ${stats.mean}`,
  );
  return stats;
}

await page.evaluate(() =>
  globalThis.__3dheat.useStore.getState().patchLevel({ flatStructures: false }),
);
await page.waitForTimeout(2400);
const smoothCubes = await faceDrift('welded (the old look)');
await page.evaluate(() =>
  globalThis.__3dheat.useStore.getState().patchLevel({ flatStructures: true }),
);
await page.waitForTimeout(2400);
const flatCubes = await faceDrift('face normals');

const checks = [
  ['heat behind a structure is suppressed', pct(off.left, full.left) > 80],
  ['and stays suppressed with the shell hidden', pct(off.left, hidden.left) > 80],
  ['heat in the open is untouched', Math.abs(pct(off.right, full.right)) < 12],
  [
    // Non-increasing, with real movement by the default position. The thresholds
    // are loose on purpose: this counts *warm pixels*, which is a blunt proxy —
    // dimming the field moves its outskirts below the warm test rather than
    // scaling a number — so it is good for "does the control do something" and
    // bad for "by how much". The exact ladder, read from the heat field itself
    // and per surface, is probe-layers.mjs.
    //
    // Equality at the top is expected: 1.0 is the one position that hides
    // outright, everything below it keeps a visibility floor.
    'strength dials it monotonically',
    half.left < off.left * 0.95 &&
      strong.left < half.left * 0.5 &&
      full.left <= strong.left,
  ],
  [
    // The dimmer is at 0 throughout this group, so anything that moves is the
    // cutoff and nothing else.
    'the cutoff removes heat behind terrain',
    pct(terrainOpen.left, terrainCut.left) > 80,
  ],
  [
    // The half of the pair that stops the check being satisfied by a cutoff that
    // deletes everything occluded, which is what the old single control did at
    // its top end.
    'and leaves heat behind a wall to the dimmer',
    Math.abs(pct(wallOpen.left, wallCut.left)) < 20,
  ],
  [
    'the cutoff does not touch heat in the open',
    Math.abs(pct(terrainOpen.right, terrainCut.right)) < 12 &&
      Math.abs(pct(wallOpen.right, wallCut.right)) < 12,
  ],
  ['slope shading widens the value spread', sloped.spread > flat.spread * 1.15],
  ['contours add relief', contoured.contrast > flat.contrast * 1.5],
  ['the defaults do both', full2.contrast > flat.contrast * 1.5 && full2.spread > flat.spread * 1.15],
  ['face normals stop a box shading like a balloon', flatCubes.drift < smoothCubes.drift * 0.5],
  [
    'without losing the boxes or turning them inside out',
    Math.abs(flatCubes.covered - smoothCubes.covered) < smoothCubes.covered * 0.05 &&
      flatCubes.mean > smoothCubes.mean * 0.75,
  ],
];
console.log('');
for (const [name, pass] of checks) console.log(`  ${pass ? 'ok  ' : 'FAIL'} ${name}`);
await browser.close();
process.exit(checks.every(([, p]) => p) ? 0 : 1);








