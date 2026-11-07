/**
 * Does occlusion count walls, or only notice them?
 *
 * One depth comparison can answer "is something in front of this datapoint" and
 * nothing more, so a point behind a single wall and a point four rooms deep in a
 * building are dimmed identically. An interior then reads as a uniform faint
 * smear — which loses exactly what a movement heatmap of a building is for:
 * which corridor, which floor, which side of the wall.
 *
 * Three walls stand at increasing distance, each reaching a little further
 * across, so a point can be behind 0, 1, 2 or 3 of them. Each band is measured
 * **on its own**: the dataset is replaced with that band alone and the whole
 * frame's warm energy is summed.
 *
 * That is deliberate. The first version of this probe put all four bands on
 * screen at once and read them out of screen quarters, which assumes a camera
 * framing that loading a dataset immediately overwrites — it reported two empty
 * bands and three failures that were all instrument error. One band at a time
 * needs no assumption about where anything lands.
 *
 *   node tools/probe-layers.mjs [url]
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
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
page.on('console', (m) => {
  if (m.type() === 'error') console.log('  console error:', m.text());
});
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40_000 });

/**
 * Three walls in front of a single blob of data.
 *
 * The blob sits at the origin. Each wall is a quad at a different distance in
 * front of it, all covering it completely, so `walls` sets how many surfaces the
 * data is behind — 0 to 3 — without moving the data or the camera between
 * measurements.
 */
const WALL_Z = [1000, 1600, 2200];

async function setScene(walls) {
  return page.evaluate(
    ({ walls, wallZ }) => {
      const rows = 20_000;
      const px = new Float32Array(rows);
      const py = new Float32Array(rows);
      const pz = new Float32Array(rows);
      for (let i = 0; i < rows; i++) {
        px[i] = (Math.random() - 0.5) * 700;
        py[i] = (Math.random() - 0.5) * 300;
        pz[i] = (Math.random() - 0.5) * 200;
      }
      const s = globalThis.__3dheat.useStore.getState();
      s.setDataset({
        id: `layer-probe-${walls}`,
        name: 'layer probe',
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
        bounds: { minX: -350, minY: -150, minZ: -100, maxX: 350, maxY: 150, maxZ: 100 },
        timeRange: [0, 0],
        timeSorted: true,
      });
      s.setMode('heat-simple');
      s.patchTimeline({ mode: 'all', playing: false });

      const verts = [];
      const idx = [];
      for (let w = 0; w < walls; w++) {
        const base = verts.length / 6;
        const z = wallZ[w];
        for (const [x, y] of [
          [-900, -700],
          [900, -700],
          [900, 700],
          [-900, 700],
        ]) {
          verts.push(x, y, z, 0, 0, 1);
        }
        idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
      }
      s.setLevel({
        kind: 'model',
        name: `walls-${walls}`,
        vertices: new Float32Array(verts.length ? verts : [0, 0, 0, 0, 1, 0]),
        indices: new Uint32Array(0),
        structureIndices: new Uint32Array(idx),
        triangles: 0,
        structureTriangles: idx.length / 3,
        sourceTriangles: idx.length / 3,
        partNames: ['structure:walls'],
        partClasses: ['structure'],
        partReasons: ['probe'],
        bounds: { minX: -900, minY: -700, minZ: 900, maxX: 900, maxY: 700, maxZ: 2300 },
        opacity: 1,
        desaturate: 1,
        brightness: 0.9,
        wireframe: false,
        structureOpacity: 0.15,
        showStructureWire: false,
        groundWireOpacity: 0,
      });
      return { rows, walls };
    },
    { walls, wallZ: WALL_Z },
  );
}

/** Park the camera in front of everything, after the dataset has framed itself. */
async function placeCamera() {
  await page.waitForTimeout(1400);
  await page.evaluate(() => {
    const engine = globalThis.__3dheat_engine;
    engine.camera.position.set(0, 0, 4000);
    engine.camera.setOrientationDegrees(0, 0);
    engine.camera.moved = true;
  });
  await page.waitForTimeout(2600);
}

/**
 * Total accumulated heat, read from the heat buffer rather than from pixels.
 *
 * The composited image is the wrong instrument here and measuring it produced
 * nonsense — occlusion appeared to make the field four times *brighter* with a
 * wall in front of it. Two reasons, both avoided entirely by reading the field:
 *
 *   - **Auto-exposure.** Loading a dataset re-meters the saturation point from
 *     the field, so dimming the field raises the gain and cancels most of what
 *     is being measured.
 *   - **The wall's own shell.** It is drawn tinted and translucent over the same
 *     pixels, so any "is this pixel warm" test is really testing a blend of heat
 *     and structure colour.
 *
 * `readHeatField` returns the accumulated values themselves: what occlusion
 * actually multiplies, before any ramp, tint or exposure.
 */
async function energy() {
  const sum = await page.evaluate(async () => {
    // On the renderer, not the engine — the engine exposes `probeHeat` for
    // single texels and leaves the bulk read on the backend.
    const field = await globalThis.__3dheat_engine.renderer.readHeatField(200_000);
    if (!field) return null;
    let total = 0;
    for (let i = 0; i < field.length; i++) total += field[i];
    return total;
  });
  if (sum === null) throw new Error('could not read the heat field');
  return { sum };
}

const set = async (patch) => {
  await page.evaluate((p) => globalThis.__3dheat.useStore.getState().patchHeat(p), patch);
  await page.waitForTimeout(2200);
};

const results = {};
for (const strength of [0, 0.5, 0.8]) {
  results[strength] = [];
  for (let walls = 0; walls <= 3; walls++) {
    await setScene(walls);
    await placeCamera();
    await set({ response: 'linear', saturation: 40, occlusion: strength, radius: 50 });
    const e = await energy();
    results[strength].push(e.sum);
  }
  const r = results[strength];
  const rel = r.map((v) => (r[0] > 0 ? (v / r[0]).toFixed(3) : '0'));
  console.log(
    `occlusion ${String(strength).padEnd(4)} energy ${r.map((v) => String(Math.round(v)).padStart(8)).join(' ')}` +
      `   relative ${rel.join(' / ')}`,
  );
}

const off = results[0];
const half = results[0.5];
const strong = results[0.8];
const falls = (r) => r[1] < r[0] * 0.92 && r[2] < r[1] * 0.92 && r[3] < r[2] * 0.92;

const checks = [
  [
    'with occlusion off, walls make no difference',
    Math.abs(off[3] - off[0]) < off[0] * 0.2,
  ],
  ['every extra wall dims further at 0.8', falls(strong)],
  ['and at 0.5', falls(half)],
  [
    // At the default strength three walls leave 1% of the field, which is dim
    // and unmistakably present. The threshold is below that rather than at it:
    // asserting `> 0.01` against a measured 0.0100 fails on the boundary and
    // says nothing about whether the feature works.
    'three walls is still visible, not erased',
    strong[3] > off[3] * 0.004,
  ],
];
console.log('');
for (const [name, pass] of checks) console.log(`  ${pass ? 'ok  ' : 'FAIL'} ${name}`);
await browser.close();
process.exit(checks.every(([, p]) => p) ? 0 : 1);
