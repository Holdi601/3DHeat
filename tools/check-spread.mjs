/**
 * Is the geometry spread over the map, or bunched in the middle?
 *
 * "The trees are only in the centre and to the right" is a claim about
 * *distribution*, and a triangle total cannot answer it. This buckets each part's
 * triangles into a coarse grid and reports how many cells hold any, plus the
 * share held by the busiest quarter — so a budget that was all spent in the first
 * few tiles visited shows up as a number instead of needing a screenshot from the
 * right angle.
 *
 *   node tools/check-spread.mjs [url]
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

const glb = process.env.HEAT3D_GLB ?? newestGlb();
if (!glb) {
  console.error('no .glb in exporters/unreal/.out');
  process.exit(2);
}

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40_000 });

const out = await page.evaluate(async (path) => {
  const response = await fetch(path);
  const bytes = await response.arrayBuffer();
  const file = new File([bytes], path.split('/').pop(), { type: 'model/gltf-binary' });
  const { modelLoader } = await import('/src/data/modelLoader.ts');
  const { LOD_TARGETS, IMPORT_DEFAULT_LOD } = await import('/src/data/simplify.ts');
  const m = await modelLoader.load(file, LOD_TARGETS[IMPORT_DEFAULT_LOD]);

  const N = 16;
  const b = m.bounds;
  const spanX = Math.max(1e-6, b.maxX - b.minX);
  const spanZ = Math.max(1e-6, b.maxZ - b.minZ);

  const grid = (idx) => {
    const cells = new Float64Array(N * N);
    if (!idx) return cells;
    const v = m.vertices;
    for (let i = 0; i < idx.length; i += 3) {
      const o = idx[i] * 6;
      const gx = Math.min(N - 1, Math.max(0, Math.floor(((v[o] - b.minX) / spanX) * N)));
      const gz = Math.min(N - 1, Math.max(0, Math.floor(((v[o + 2] - b.minZ) / spanZ) * N)));
      cells[gz * N + gx]++;
    }
    return cells;
  };

  const summarise = (cells) => {
    const total = cells.reduce((a, c) => a + c, 0);
    const occupied = cells.filter((c) => c > 0).length;
    const sorted = Array.from(cells).sort((a, c) => c - a);
    const topQuarter = sorted.slice(0, Math.ceil(cells.length / 4)).reduce((a, c) => a + c, 0);
    return {
      total,
      occupied,
      cells: cells.length,
      // What share of everything sits in the busiest quarter of the map. Even
      // spread is 0.25; everything in one corner approaches 1.
      concentration: total > 0 ? topQuarter / total : 0,
    };
  };

  return {
    cellMetres: Math.round(spanX / N / 100),
    ground: summarise(grid(m.indices)),
    structure: summarise(grid(m.structureIndices)),
    water: summarise(grid(m.waterIndices)),
  };
}, glb);

console.log(`${glb}, ${out.cellMetres}m cells\n`);
for (const [name, s] of Object.entries(out)) {
  if (name === 'cellMetres') continue;
  console.log(
    `  ${name.padEnd(10)} ${String(s.total).padStart(8)} triangles in ${String(s.occupied).padStart(3)}/${s.cells} cells, ` +
      `busiest quarter holds ${(s.concentration * 100).toFixed(0)}%`,
  );
}
await browser.close();
