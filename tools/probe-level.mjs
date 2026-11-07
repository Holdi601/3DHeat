/**
 * Does an exported level actually work in the viewer, with real telemetry on it?
 *
 * The exporter's own report says what it wrote; this says whether the thing it
 * wrote is usable. Three questions, in increasing order of how much they matter:
 *
 *   1. does it parse, simplify and draw;
 *   2. do the ground and the structures come out as separate parts;
 *   3. **does it line up with the telemetry** — the level and the datapoints
 *      come from the same game, so the data's footprint should sit inside the
 *      level's. This is the check that catches a wrong axis convention or a
 *      scale applied once too often, and it is the one nobody notices by
 *      looking at a heatmap: the picture is plausible, the positions are wrong.
 *
 *   node tools/probe-level.mjs [glb-url-path] [url]
 */
import { chromium } from 'playwright';
import { readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REPO = resolve(import.meta.dirname, '..');
const OUT_DIR = join(REPO, 'exporters/unreal/.out');

/** Newest export, so `node tools/probe-level.mjs` needs no arguments. */
function newestExport() {
  if (!existsSync(OUT_DIR)) return null;
  const found = readdirSync(OUT_DIR)
    .filter((f) => f.toLowerCase().endsWith('.glb'))
    .map((f) => ({ f, t: statSync(join(OUT_DIR, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  return found.length ? '/exporters/unreal/.out/' + found[0].f : null;
}

const glbPath = process.argv[2] ?? newestExport();
const url = process.argv[3] ?? 'http://127.0.0.1:5273/?backend=webgl2';
if (!glbPath) {
  console.error('no .glb found in exporters/unreal/.out — pass one as the first argument');
  process.exit(2);
}

/** A real parquet from the same game, if it is there. */
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

const parquet = findParquet();
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
await page.waitForTimeout
  ? await page.waitForTimeout(2500)
  : null;

console.log(`level:    ${glbPath}`);
console.log(`telemetry: ${parquet ?? '(none in TestData)'}\n`);

// ------------------------------------------------------------------- load it
const level = await page.evaluate(async (path) => {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  const bytes = await response.arrayBuffer();
  const file = new File([bytes], path.split('/').pop(), { type: 'model/gltf-binary' });

  const { modelLoader } = await import('/src/data/modelLoader.ts');
  const t0 = performance.now();
  const m = await modelLoader.load(file, 900_000);
  const ms = performance.now() - t0;

  const s = globalThis.__3dheat.useStore.getState();
  s.setLevel({
    kind: 'model',
    name: file.name,
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
  return {
    megabytes: +(bytes.byteLength / 1e6).toFixed(1),
    loadMs: Math.round(ms),
    triangles: m.triangles,
    structureTriangles: m.structureTriangles,
    sourceTriangles: m.sourceTriangles,
    sourceStructureTriangles: m.sourceStructureTriangles,
    deviation: m.error,
    parts: (m.partNames ?? []).map((n, i) => `${n} -> ${m.partClasses?.[i]}`),
    bounds: m.bounds,
  };
}, glbPath);

console.log(`parsed ${level.megabytes} MB in ${level.loadMs}ms`);
console.log(
  `  ground     ${level.sourceTriangles} -> ${level.triangles} triangles` +
    (level.deviation ? `, deviation ${(level.deviation * 100).toFixed(2)}%` : ''),
);
console.log(
  `  structures ${level.sourceStructureTriangles ?? 0} -> ${level.structureTriangles ?? 0} triangles`,
);
for (const p of level.parts) console.log(`  part ${p}`);
const b = level.bounds;
console.log(
  `  bounds x ${b.minX.toFixed(0)}..${b.maxX.toFixed(0)}  ` +
    `y ${b.minY.toFixed(0)}..${b.maxY.toFixed(0)}  z ${b.minZ.toFixed(0)}..${b.maxZ.toFixed(0)}`,
);

// --------------------------------------------------- and the telemetry on it
if (parquet) {
  const data = await page.evaluate(async (path) => {
    const response = await fetch(path);
    const bytes = await response.arrayBuffer();
    const file = new File([bytes], path.split('/').pop(), {
      type: 'application/octet-stream',
    });

    const { previewSource } = await import('/src/data/sourcePreview.ts');
    const { autoMap } = await import('/src/data/automap.ts');
    const { ingestFiles } = await import('/src/data/ingestFiles.ts');
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
    const s = globalThis.__3dheat.useStore.getState();
    s.setDataset(dataset);
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all', playing: false });
    return { count: dataset.count, bounds: dataset.bounds, mapping };
  }, parquet);

  const d = data.bounds;
  console.log(`\ntelemetry: ${data.count.toLocaleString()} rows`);
  console.log(
    `  bounds x ${d.minX.toFixed(0)}..${d.maxX.toFixed(0)}  ` +
      `y ${d.minY.toFixed(0)}..${d.maxY.toFixed(0)}  z ${d.minZ.toFixed(0)}..${d.maxZ.toFixed(0)}`,
  );

  // Overlap on the ground plane, as a fraction of the data's own footprint.
  const overlap = (a0, a1, b0, b1) =>
    Math.max(0, Math.min(a1, b1) - Math.max(a0, b0)) / Math.max(1e-9, a1 - a0);
  const ox = overlap(d.minX, d.maxX, b.minX, b.maxX);
  const oz = overlap(d.minZ, d.maxZ, b.minZ, b.maxZ);
  console.log(
    `\nalignment: ${(ox * 100).toFixed(0)}% of the data's X span and ` +
      `${(oz * 100).toFixed(0)}% of its Z span fall inside the level`,
  );
  if (ox < 0.5 || oz < 0.5) {
    console.log(
      '  -> the level and the telemetry do not share a coordinate system. Check the\n' +
        '     exporter --scale against the dataset axis mapping (up axis, unit scale).',
    );
  }
}

// ------------------------------------------------------------ does it render
await page.evaluate(() => {
  const engine = globalThis.__3dheat_engine;
  engine.applyPreset('Iso NE');
  engine.frameDataset(true);
});
await page.waitForTimeout(3000);

const frame = await page.evaluate(() => {
  const canvas = globalThis.__3dheat_engine.canvas;
  const scratch = document.createElement('canvas');
  scratch.width = 320;
  scratch.height = 200;
  const ctx = scratch.getContext('2d');
  ctx.drawImage(canvas, 0, 0, scratch.width, scratch.height);
  const { data } = ctx.getImageData(0, 0, scratch.width, scratch.height);
  let background = 0;
  let warm = 0;
  let grey = 0;
  const total = scratch.width * scratch.height;
  for (let i = 0; i < total; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const bl = data[i * 4 + 2];
    if (r < 26 && g < 30 && bl < 34) background++;
    else if (r > g + 24 && r > bl + 24) warm++;
    else grey++;
  }
  return {
    covered: +(((total - background) / total) * 100).toFixed(1),
    heat: +((warm / total) * 100).toFixed(1),
    level: +((grey / total) * 100).toFixed(1),
    fps: globalThis.__3dheat.useStore.getState().stats.fps,
  };
});

console.log(
  `\nframe: ${frame.covered}% covered — ${frame.level}% level, ${frame.heat}% heat, ${frame.fps.toFixed(0)} fps`,
);

const ok = frame.covered > 10 && frame.level > 3;
console.log(ok ? '\nresult: the level draws with the data on it' : '\nresult: nothing usable on screen');
await browser.close();
process.exit(ok ? 0 : 1);

