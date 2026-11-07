/**
 * Where is there a lot of data and no geometry?
 *
 * That is the complaint, stated as a measurement, and it should have been the
 * first tool written. Every earlier attempt picked a place to look — the densest
 * telemetry cell, the densest structure cell, the deepest hole in the terrain —
 * and each of those is a different place from "a building is missing here". Two of
 * them turned out to be river valleys.
 *
 * So: grid the real telemetry, grid the export's structure triangles, and rank
 * cells by how much heat sits on how little geometry.
 *
 * What that list is *not* is the address of a missing building, and reading it
 * that way cost several rounds of work. Its top answer on the test level was tens
 * of thousands of datapoints over a handful of structure triangles; probing that
 * spot in the editor found millions of triangles of vegetation and no building
 * at all.
 * Heavy traffic over little geometry is the signature of open ground, which is
 * where people walk most freely. Use `find-buildings.mjs` for the other
 * question: it ranks cells by how much *vertical* extent players used, which
 * vegetation cannot fake.
 *
 *   node tools/find-gaps.mjs [url]
 */
import { chromium } from 'playwright';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REPO = resolve(import.meta.dirname, '..');
const OUT = join(REPO, 'exporters/unreal/.out');
const url = process.argv[2] ?? 'http://127.0.0.1:5273/?backend=webgl2';

function newest(dir, ext, minSize = 0) {
  if (!existsSync(dir)) return null;
  const found = readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(ext))
    .map((f) => ({ f: join(dir, f), size: statSync(join(dir, f)).size }))
    .filter((e) => e.size >= minSize)
    .sort((a, b) => b.size - a.size);
  return found.length ? found[0].f : null;
}

const glb = newest(OUT, '.glb');
const parquet = newest(join(REPO, 'TestData'), '.parquet', 1e7);
if (!glb || !parquet) {
  console.error(`need both a .glb (${glb}) and a parquet (${parquet})`);
  process.exit(2);
}
console.log(`level:     ${glb}`);
console.log(`telemetry: ${parquet}\n`);

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40_000 });

const rel = (p) => '/' + p.replace(REPO, '').replace(/\\/g, '/').replace(/^\//, '');

const out = await page.evaluate(
  async ({ glbPath, parquetPath }) => {
    const { modelLoader } = await import('/src/data/modelLoader.ts');
    const { previewSource } = await import('/src/data/sourcePreview.ts');
    const { autoMap } = await import('/src/data/automap.ts');
    const { ingestFiles } = await import('/src/data/ingestFiles.ts');

    const gbytes = await (await fetch(glbPath)).arrayBuffer();
    const m = await modelLoader.load(
      new File([gbytes], 'level.glb', { type: 'model/gltf-binary' }),
      Infinity,
    );

    const pbytes = await (await fetch(parquetPath)).arrayBuffer();
    const pfile = new File([pbytes], parquetPath.split('/').pop());
    const p = await previewSource(pfile);
    const mapping = autoMap({
      columns: p.columns,
      rows: p.rows,
      numeric: p.numeric,
      logicalTypes: p.logicalTypes,
    });
    const ds = await ingestFiles({ files: [pfile], mapping, columns: p.columns, name: 'gaps' });
    const d = ds?.dataset ?? ds;

    // The level's own footprint is the grid, so both sets share coordinates.
    const N = 64;
    const b = m.bounds;
    const spanX = Math.max(1e-6, b.maxX - b.minX);
    const spanZ = Math.max(1e-6, b.maxZ - b.minZ);
    const cell = (x, z) => {
      const gx = Math.floor(((x - b.minX) / spanX) * N);
      const gz = Math.floor(((z - b.minZ) / spanZ) * N);
      if (gx < 0 || gz < 0 || gx >= N || gz >= N) return -1;
      return gz * N + gx;
    };

    const heat = new Float64Array(N * N);
    for (let i = 0; i < d.count; i++) {
      const k = cell(d.px[i], d.pz[i]);
      if (k >= 0) heat[k]++;
    }

    const tally = (idx) => {
      const cells = new Float64Array(N * N);
      if (!idx) return cells;
      const v = m.vertices;
      for (let i = 0; i < idx.length; i += 3) {
        const o = idx[i] * 6;
        const k = cell(v[o], v[o + 2]);
        if (k >= 0) cells[k]++;
      }
      return cells;
    };
    const struct = tally(m.structureIndices);
    const ground = tally(m.indices);

    const rows = [];
    for (let k = 0; k < heat.length; k++) {
      if (heat[k] < 5000) continue; // only cells with real traffic
      // On land, and not at the shoreline. Without this the list is entirely
      // cells beyond the island — aircraft tracks and parachute descents over
      // open sea, which have no geometry because there is nothing there. Some of
      // them are outside the level's own bounds.
      if (ground[k] < 2000) continue;
      rows.push({
        unrealX: Math.round(b.minX + (spanX * ((k % N) + 0.5)) / N),
        unrealY: Math.round(b.minZ + (spanZ * (Math.floor(k / N) + 0.5)) / N),
        rows: heat[k],
        structure: struct[k],
        ground: ground[k],
        // Datapoints per structure triangle. High means a lot of movement over
        // very little geometry, which is the signature being hunted.
        ratio: struct[k] > 0 ? heat[k] / struct[k] : Infinity,
      });
    }
    rows.sort((a, c) => c.ratio - a.ratio);
    return {
      cellMetres: Math.round(spanX / N / 100),
      totalRows: d.count,
      busy: rows.length,
      worst: rows.slice(0, 15),
    };
  },
  { glbPath: rel(glb), parquetPath: rel(parquet) },
);

console.log(
  `${out.totalRows.toLocaleString()} rows, ${out.cellMetres}m cells, ` +
    `${out.busy} cells with over 5,000 datapoints\n`,
);
console.log('busy cells with the least geometry under them:');
for (const r of out.worst) {
  console.log(
    `  ${String(r.rows).padStart(7)} rows / ${String(r.structure).padStart(6)} structure tris ` +
      `= ${r.ratio === Infinity ? 'no geometry at all' : r.ratio.toFixed(1).padStart(7)}   ` +
      `at X=${String(r.unrealX).padStart(8)} Y=${String(r.unrealY).padStart(8)}`,
  );
}
await browser.close();
