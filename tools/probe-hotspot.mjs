/**
 * Where is the telemetry densest, in world coordinates?
 *
 * "The building people play in is missing" is only actionable once you can say
 * *where*. This ingests the real movement parquet with the viewer's own ingest
 * path, buckets the points into a coarse grid, and prints the densest cells in
 * Unreal centimetres — which is the input to asking the editor what actors are
 * standing there and why the exporter dropped them.
 *
 *   node tools/probe-hotspot.mjs [parquet]
 */
import { chromium } from 'playwright';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REPO = resolve(import.meta.dirname, '..');
const url = 'http://127.0.0.1:5273/?backend=webgl2';

function findParquet() {
  const dir = join(REPO, 'TestData');
  if (!existsSync(dir)) return null;
  const found = readdirSync(dir)
    .filter((f) => /\.parquet$/i.test(f))
    .map((f) => ({ f: join(dir, f), size: statSync(join(dir, f)).size }))
    .filter((e) => e.size > 1e7)
    .sort((a, b) => b.size - a.size);
  return found.length ? found[0].f : null;
}

const parquet = process.argv[2] ?? findParquet();
if (!parquet) {
  console.error('no sizeable parquet in TestData');
  process.exit(2);
}
console.log(`telemetry: ${parquet}`);

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40_000 });

const rel = '/' + parquet.replace(REPO, '').replace(/\\/g, '/').replace(/^\//, '');
const out = await page.evaluate(async (path) => {
  const response = await fetch(path);
  if (!response.ok) return { error: `fetch ${response.status}` };
  const bytes = await response.arrayBuffer();
  const file = new File([bytes], path.split('/').pop());
  // The real ingest path, column mapping and all: `previewSource` then `autoMap`
  // then `ingestFiles`, exactly as the level panel does it. Guessing at a
  // one-argument `ingestFiles` was the first attempt and there is no such
  // function — the mapping is a required input, because which column is X is not
  // something the loader can assume.
  const { previewSource } = await import('/src/data/sourcePreview.ts');
  const { autoMap } = await import('/src/data/automap.ts');
  const { ingestFiles } = await import('/src/data/ingestFiles.ts');
  const p = await previewSource(file);
  const mapping = autoMap({
    columns: p.columns,
    rows: p.rows,
    numeric: p.numeric,
    logicalTypes: p.logicalTypes,
  });
  const result = await ingestFiles({
    files: [file],
    mapping,
    columns: p.columns,
    name: 'hotspot',
  });
  // The shape of what comes back has moved before; unwrap defensively and say
  // what was actually there rather than "no dataset".
  const d = result?.dataset ?? result;
  if (!d || !d.count) {
    return { error: `unexpected ingest result: ${Object.keys(result ?? {}).join(', ') || typeof result}` };
  }

  // A 64 x 64 grid over the data's own footprint. Coarse enough that a building
  // lands in one or two cells on a map a few kilometres across.
  const N = 64;
  const b = d.bounds;
  const spanX = Math.max(1e-6, b.maxX - b.minX);
  const spanZ = Math.max(1e-6, b.maxZ - b.minZ);
  const cells = new Float64Array(N * N);
  for (let i = 0; i < d.count; i++) {
    const gx = Math.min(N - 1, Math.floor(((d.px[i] - b.minX) / spanX) * N));
    const gz = Math.min(N - 1, Math.floor(((d.pz[i] - b.minZ) / spanZ) * N));
    cells[gz * N + gx]++;
  }
  const ranked = [];
  for (let k = 0; k < cells.length; k++) {
    if (cells[k] <= 0) continue;
    const gx = k % N;
    const gz = Math.floor(k / N);
    ranked.push({
      count: cells[k],
      // Viewer space is Y-up with Unreal's Z mapped to Y, so the viewer's Z is
      // Unreal's Y. Reported in Unreal terms, which is what the editor wants.
      unrealX: Math.round(b.minX + (spanX * (gx + 0.5)) / N),
      unrealY: Math.round(b.minZ + (spanZ * (gz + 0.5)) / N),
    });
  }
  ranked.sort((a, b2) => b2.count - a.count);
  return {
    rows: d.count,
    bounds: b,
    cellMetres: Math.round(spanX / N / 100),
    top: ranked.slice(0, 12),
  };
}, rel);

if (out.error) {
  console.error(out.error);
  await browser.close();
  process.exit(1);
}
console.log(`${out.rows.toLocaleString()} rows, ${out.cellMetres}m cells\n`);
console.log('densest cells, in Unreal centimetres:');
for (const c of out.top) {
  console.log(
    `  ${String(c.count).padStart(8)} rows at X=${String(c.unrealX).padStart(8)} Y=${String(c.unrealY).padStart(8)}`,
  );
}
await browser.close();
