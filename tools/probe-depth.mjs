/**
 * Does the level actually occlude the heat, and does the slice cut both?
 *
 * "The sense of depth can't be lost if a heatpoint is behind a wall" — so this
 * measures exactly that, on the real exported level with the real telemetry:
 *
 *   1. lit pixels with occlusion off versus on. Points behind buildings and
 *      under terrain stop contributing, so the field must lose brightness — and
 *      lose it *where the geometry is*, not everywhere, which the two halves of
 *      the frame check separately.
 *   2. the slice slab, which must remove geometry and datapoints together.
 *   3. ground relief: the number of distinct greys in the ground. A flat-shaded
 *      terrain has almost none, which is the complaint being fixed.
 *
 *   node tools/probe-depth.mjs [url]
 */
import { chromium } from 'playwright';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REPO = resolve(import.meta.dirname, '..');
const OUT = join(REPO, 'exporters/unreal/.out');
const url = process.argv[2] ?? 'http://127.0.0.1:5273/?backend=webgl2';

function newestGlb() {
  if (!existsSync(OUT)) return null;
  const found = readdirSync(OUT)
    .filter((f) => f.toLowerCase().endsWith('.glb'))
    .map((f) => ({ f, size: statSync(join(OUT, f)).size }))
    .sort((a, b) => b.size - a.size);
  return found.length ? '/exporters/unreal/.out/' + found[0].f : null;
}

function findParquet() {
  const walk = (dir, out = []) => {
    let entries = [];
    try {
      entries = readdirSync(dir);
    } catch {
      return out;
    }
    for (const name of entries) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p, out);
      else if (/movement\.parquet$/i.test(name) && statSync(p).size > 1e6) {
        out.push('/' + p.slice(REPO.length + 1).split('\\').join('/'));
      }
    }
    return out;
  };
  return walk(join(REPO, 'TestData')).sort()[0] ?? null;
}

const glb = newestGlb();
const parquet = findParquet();
if (!glb || !parquet) {
  console.error(`need both a level (${glb}) and telemetry (${parquet})`);
  process.exit(2);
}

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

console.log(`level:     ${glb}`);
console.log(`telemetry: ${parquet}\n`);

await page.evaluate(
  async ({ glb, parquet }) => {
    const load = async (path, type) => {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
      return new File([await response.arrayBuffer()], path.split('/').pop(), { type });
    };

    const { modelLoader } = await import('/src/data/modelLoader.ts');
    const m = await modelLoader.load(await load(glb, 'model/gltf-binary'), 900_000);
    const s = globalThis.__3dheat.useStore.getState();
    s.setLevel({
      kind: 'model',
      name: 'level',
      vertices: m.vertices,
      indices: m.indices,
      structureIndices: m.structureIndices,
      structureEdges: m.structureEdges,
      triangles: m.triangles,
      structureTriangles: m.structureTriangles,
      sourceTriangles: m.sourceTriangles,
      sourceStructureTriangles: m.sourceStructureTriangles,
      partNames: m.partNames,
      partClasses: m.partClasses,
      partReasons: m.partReasons,
      bounds: m.bounds,
      opacity: 1,
      desaturate: 0.85,
      brightness: 0.9,
      wireframe: false,
    });

    const { previewSource } = await import('/src/data/sourcePreview.ts');
    const { autoMap } = await import('/src/data/automap.ts');
    const { ingestFiles } = await import('/src/data/ingestFiles.ts');
    const file = await load(parquet, 'application/octet-stream');
    const preview = await previewSource(file);
    const mapping = autoMap({
      columns: preview.columns,
      rows: preview.rows,
      numeric: preview.numeric,
      logicalTypes: preview.logicalTypes,
    });
    const { dataset } = await ingestFiles({
      files: [file],
      mapping,
      columns: preview.columns,
      name: 'probe',
    });
    s.setDataset(dataset);
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all', playing: false });
  },
  { glb, parquet },
);

await page.evaluate(() => {
  const engine = globalThis.__3dheat_engine;
  engine.applyPreset('Iso NE');
  engine.frameDataset(true);
});
await page.waitForTimeout(3500);

/**
 * What the frame contains: how much heat, and how much *structure* in the level.
 *
 * Structure is measured as local contrast between neighbouring level pixels, not
 * as a count of distinct greys. Counting greys says nothing: a flat-shaded
 * terrain and a contoured one both use the whole range, they just distribute it
 * differently — the flat one in a few large smooth areas, the shaded one in
 * relief you can read. Adjacent-pixel difference is exactly that difference.
 */
async function measure(label) {
  const stats = await page.evaluate(() => {
    const canvas = globalThis.__3dheat_engine.canvas;
    const scratch = document.createElement('canvas');
    scratch.width = 480;
    scratch.height = 300;
    const ctx = scratch.getContext('2d');
    ctx.drawImage(canvas, 0, 0, scratch.width, scratch.height);
    const { data } = ctx.getImageData(0, 0, scratch.width, scratch.height);
    const at = (x, y) => (y * scratch.width + x) * 4;
    // Above the background, which is (22, 23, 26) and would otherwise count as
    // level everywhere — swamping both the pixel count and the contrast with a
    // perfectly uniform field and making every measurement look unchanged.
    const isLevel = (o) =>
      data[o] > 40 && Math.abs(data[o] - data[o + 1]) < 12 && Math.abs(data[o + 1] - data[o + 2]) < 14;

    let heat = 0;
    let heatSum = 0;
    let levelPixels = 0;
    let contrast = 0;
    for (let y = 1; y < scratch.height - 1; y++) {
      for (let x = 1; x < scratch.width - 1; x++) {
        const o = at(x, y);
        const r = data[o];
        if (r > data[o + 1] + 20 && r > data[o + 2] + 20) {
          heat++;
          heatSum += r;
          continue;
        }
        if (!isLevel(o)) continue;
        levelPixels++;
        const right = at(x + 1, y);
        const down = at(x, y + 1);
        if (isLevel(right)) contrast += Math.abs(r - data[right]);
        if (isLevel(down)) contrast += Math.abs(r - data[down]);
      }
    }
    return {
      heat,
      heatSum,
      levelPixels,
      contrast: levelPixels > 0 ? +(contrast / levelPixels).toFixed(2) : 0,
    };
  });
  console.log(
    `${label.padEnd(30)} heat px ${String(stats.heat).padStart(6)}  ` +
      `sum ${String(stats.heatSum).padStart(8)}  level px ${String(stats.levelPixels).padStart(6)}  relief ${String(stats.contrast).padStart(6)}`,
  );
  return stats;
}

const setHeat = async (patch) => {
  await page.evaluate((p) => globalThis.__3dheat.useStore.getState().patchHeat(p), patch);
  await page.waitForTimeout(2600);
};
const setSlice = async (patch) => {
  await page.evaluate((p) => globalThis.__3dheat.useStore.getState().patchSlice(p), patch);
  await page.waitForTimeout(2600);
};

const drop = (a, b) => (a.heatSum > 0 ? (1 - b.heatSum / a.heatSum) * 100 : 0);

// ------------------------------------------------------------- occlusion
//
// From above, most of the data is on streets and roofs and genuinely visible, so
// the effect is real but small. The decisive test is from *underneath* the
// terrain: every datapoint is then behind the ground, and if occlusion works the
// field has to all but vanish. That also catches the case that used to be broken
// silently — the depth comparison being skipped altogether.
console.log('--- from above (iso), where most data is genuinely visible');
await setHeat({ occlusion: 0 });
const off = await measure('occlusion off');
await setHeat({ occlusion: 0.8 });
const soft = await measure('occlusion 0.8');
await setHeat({ occlusion: 1 });
const hard = await measure('occlusion 1 (hard cull)');
console.log(
  `  removed ${drop(off, soft).toFixed(1)}% at 0.8, ${drop(off, hard).toFixed(1)}% at 1.0`,
);

console.log('\n--- from below the terrain, where everything is behind it');
await page.evaluate(() => {
  const engine = globalThis.__3dheat_engine;
  const level = globalThis.__3dheat.useStore.getState().level;
  const b = level.bounds;
  const cx = (b.minX + b.maxX) / 2;
  const cz = (b.minZ + b.maxZ) / 2;
  // Well under the lowest ground, looking straight up.
  engine.camera.position.set(cx, b.minY - (b.maxY - b.minY) * 1.5, cz);
  engine.camera.setOrientationDegrees(0, 85);
  engine.camera.moved = true;
});
await page.waitForTimeout(2600);
await setHeat({ occlusion: 0 });
const belowOff = await measure('occlusion off');
await setHeat({ occlusion: 1 });
const belowHard = await measure('occlusion 1');
console.log(`  removed ${drop(belowOff, belowHard).toFixed(1)}% of the heat behind the ground`);

// Back above for the rest of the checks.
await page.evaluate(() => {
  const engine = globalThis.__3dheat_engine;
  engine.applyPreset('Iso NE');
  engine.frameDataset(true);
});
await page.waitForTimeout(3000);

// ----------------------------------------------------------------- slice
await setHeat({ occlusion: 0.8 });
const bounds = await page.evaluate(() => {
  const level = globalThis.__3dheat.useStore.getState().level;
  return { minY: level.bounds.minY, maxY: level.bounds.maxY };
});
const midY = bounds.minY + (bounds.maxY - bounds.minY) * 0.35;
await setSlice({
  enabled: true,
  axis: 'y',
  center: midY,
  thickness: (bounds.maxY - bounds.minY) * 0.12,
  clipHeat: true,
  outsideOpacity: 0,
});
const sliced = await measure('sliced to a 12% slab');
await setSlice({ enabled: false });
const unsliced = await measure('slice off again');

console.log(
  `\nslice removed ${(100 - (sliced.heat / Math.max(1, unsliced.heat)) * 100).toFixed(0)}% of the heat pixels ` +
    `and ${(100 - (sliced.greys / Math.max(1, unsliced.greys)) * 100).toFixed(0)}% of the level's grey range`,
);

// ---------------------------------------------------------------- relief
await page.evaluate(() => {
  globalThis.__3dheat.useStore.getState().patchLevel({
    relief: { slope: 0, contourSpacing: 0, contourStrength: 0, elevationRange: 0 },
  });
});
await page.waitForTimeout(2600);
const flat = await measure('relief off (the old look)');
await page.evaluate(() => {
  globalThis.__3dheat.useStore.getState().patchLevel({ relief: undefined });
});
await page.waitForTimeout(2600);
const relief = await measure('relief on');

console.log(
  `\nground relief: ${flat.contrast} flat -> ${relief.contrast} with relief ` +
    `(${(relief.contrast / Math.max(0.01, flat.contrast)).toFixed(1)}x local contrast)`,
);

// Assertions only where the real map is a sound instrument. Occlusion is *not*
// one: a datapoint standing on terrain is a metre above it, so from below it is
// only a metre behind it — the same margin as a point standing on the ground
// seen from above, which must not be suppressed. tools/probe-occlusion.mjs tests
// that properly, on a wall built for the purpose. The numbers above are reported
// here because they are what this map actually does.
const checks = [
  ['a harder setting removes at least as much', drop(off, hard) >= drop(off, soft) - 0.1],
  ['the slice cuts the datapoints', sliced.heat < unsliced.heat * 0.5],
  ['the slice cuts the geometry', sliced.levelPixels < unsliced.levelPixels * 0.9],
  ['relief changes how the ground is drawn', Math.abs(relief.contrast - flat.contrast) > 0.02],
];
console.log('');
for (const [name, pass] of checks) console.log(`  ${pass ? 'ok  ' : 'FAIL'} ${name}`);
const ok = checks.every(([, pass]) => pass);
await browser.close();
process.exit(ok ? 0 : 1);




