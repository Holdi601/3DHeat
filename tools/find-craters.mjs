/**
 * Where does the exported terrain dip, and is anything standing in the dip?
 *
 * A compound is usually built into excavated ground, so the traced terrain has a
 * bowl where the building is. When the heat draws wall outlines and corridors
 * inside an empty bowl, that bowl is the address of a building the export lost —
 * and unlike a screenshot, it is findable from the mesh.
 *
 * Buckets the ground into a grid, compares each cell to the median of its
 * neighbourhood, and prints the deepest dips in Unreal centimetres along with how
 * much structure geometry is standing in each. A deep dip with no structures in
 * it is a missing building.
 *
 *   node tools/find-craters.mjs [url]
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
  const m = await modelLoader.load(file, Infinity);

  // 96 cells across a 4km map is about 42m per cell — a compound is a few
  // cells, a valley is dozens, so the neighbourhood comparison separates them.
  const N = 96;
  const b = m.bounds;
  const spanX = Math.max(1e-6, b.maxX - b.minX);
  const spanZ = Math.max(1e-6, b.maxZ - b.minZ);
  const sum = new Float64Array(N * N);
  const count = new Float64Array(N * N);
  const v = m.vertices;
  const gi = m.indices;
  for (let i = 0; i < gi.length; i += 3) {
    const o = gi[i] * 6;
    const gx = Math.min(N - 1, Math.max(0, Math.floor(((v[o] - b.minX) / spanX) * N)));
    const gz = Math.min(N - 1, Math.max(0, Math.floor(((v[o + 2] - b.minZ) / spanZ) * N)));
    sum[gz * N + gx] += v[o + 1];
    count[gz * N + gx]++;
  }
  const mean = new Float64Array(N * N).fill(NaN);
  for (let k = 0; k < mean.length; k++) if (count[k] > 0) mean[k] = sum[k] / count[k];

  // Structures per cell, so a dip can be told from a dip with a building in it.
  const struct = new Float64Array(N * N);
  const si = m.structureIndices;
  if (si) {
    for (let i = 0; i < si.length; i += 3) {
      const o = si[i] * 6;
      const gx = Math.min(N - 1, Math.max(0, Math.floor(((v[o] - b.minX) / spanX) * N)));
      const gz = Math.min(N - 1, Math.max(0, Math.floor(((v[o + 2] - b.minZ) / spanZ) * N)));
      struct[gz * N + gx]++;
    }
  }

  const RING = 4;
  const found = [];
  for (let gz = RING; gz < N - RING; gz++) {
    for (let gx = RING; gx < N - RING; gx++) {
      const k = gz * N + gx;
      if (!Number.isFinite(mean[k])) continue;
      // Median of the ring around it, not the mean: a mean is dragged down by
      // the dip's own shoulder and reports every hillside as a crater.
      const ring = [];
      for (let dz = -RING; dz <= RING; dz++) {
        for (let dx = -RING; dx <= RING; dx++) {
          if (Math.max(Math.abs(dz), Math.abs(dx)) !== RING) continue;
          const h = mean[(gz + dz) * N + (gx + dx)];
          if (Number.isFinite(h)) ring.push(h);
        }
      }
      if (ring.length < 8) continue;
      ring.sort((a, c) => a - c);
      const surround = ring[Math.floor(ring.length / 2)];
      const drop = surround - mean[k];
      if (drop < 400) continue; // 4m; below that it is terrain, not excavation
      found.push({
        unrealX: Math.round(b.minX + (spanX * (gx + 0.5)) / N),
        unrealY: Math.round(b.minZ + (spanZ * (gz + 0.5)) / N),
        dropM: Math.round(drop / 100),
        structures: struct[k],
      });
    }
  }
  found.sort((a, c) => c.dropM - a.dropM);
  return { cellMetres: Math.round(spanX / N / 100), craters: found.slice(0, 20) };
}, glb);

console.log(`${glb}, ${out.cellMetres}m cells\n`);
console.log('deepest dips in the terrain, with structure triangles standing in them:');
for (const c of out.craters) {
  console.log(
    `  ${String(c.dropM).padStart(4)}m deep at X=${String(c.unrealX).padStart(8)} ` +
      `Y=${String(c.unrealY).padStart(8)}   structures ${c.structures}`,
  );
}
await browser.close();
