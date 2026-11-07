/**
 * Where the players actually went, as a small file the exporter can read.
 *
 * The exporter currently decides what matters by looking at the level: how big
 * an actor is, what its asset is called, how many actors a sub-level holds. All
 * of that is guessing, and it guesses worst exactly where it matters — a
 * large building players spend an hour inside ranks below a hillside of rock
 * because the rock has more actors in it.
 *
 * The telemetry knows the answer. This buckets it into a coarse grid in *Unreal*
 * centimetres and writes two numbers per cell: how many datapoints landed there,
 * and how many distinct 3m height bands were stood on, which is what separates a
 * building from a field. A 4km map at 32m cells is about 15,600 cells, so the
 * file is tens of kilobytes and the exporter can hold all of it.
 *
 * Deliberately not parquet. The exporter runs inside UnrealEditor-Cmd's Python,
 * which has no parquet reader and should not grow a dependency on one; and this
 * way the grid can come from anywhere — a different pipeline, a hand-drawn
 * region of interest, last season's data.
 *
 *   node tools/heat-grid.mjs [out.json] [url]
 */
import { chromium } from 'playwright';
import { existsSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REPO = resolve(import.meta.dirname, '..');
const outPath = process.argv[2] ?? join(REPO, 'exporters/unreal/.out/hotspots.json');
const url = process.argv[3] ?? 'http://127.0.0.1:5273/?backend=webgl2';

/** Cell edge and height band, in Unreal centimetres. */
const CELL = 3200;
const BAND = 300;

function newest(dir, ext, minSize = 0) {
  if (!existsSync(dir)) return null;
  const found = readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(ext))
    .map((f) => ({ f: join(dir, f), size: statSync(join(dir, f)).size }))
    .filter((e) => e.size >= minSize)
    .sort((a, b) => b.size - a.size);
  return found.length ? found[0].f : null;
}

const parquet = newest(join(REPO, 'TestData'), '.parquet', 1e7);
if (!parquet) {
  console.error('no parquet in TestData');
  process.exit(2);
}
console.log(`telemetry: ${parquet}`);

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 800, height: 400 } });
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40_000 });

const rel = (p) => '/' + p.replace(REPO, '').replace(/\\/g, '/').replace(/^\//, '');

const grid = await page.evaluate(
  async ({ parquetPath, cell, band }) => {
    const { previewSource } = await import('/src/data/sourcePreview.ts');
    const { autoMap } = await import('/src/data/automap.ts');
    const { ingestFiles } = await import('/src/data/ingestFiles.ts');

    const bytes = await (await fetch(parquetPath)).arrayBuffer();
    const file = new File([bytes], parquetPath.split('/').pop());
    const p = await previewSource(file);
    const mapping = autoMap({
      columns: p.columns,
      rows: p.rows,
      numeric: p.numeric,
      logicalTypes: p.logicalTypes,
    });
    const ds = await ingestFiles({ files: [file], mapping, columns: p.columns, name: 'grid' });
    const d = ds?.dataset ?? ds;

    // The viewer's axes are Y-up and the exporter's are Unreal's Z-up, so what
    // the viewer calls (x, y, z) is Unreal's (x, z, y). Emitting Unreal
    // coordinates is the whole point: the exporter compares these against actor
    // bounds and must not have to know anything about the viewer.
    const rows = new Map();
    const bands = new Map();
    for (let i = 0; i < d.count; i++) {
      const ux = d.px[i];
      const uy = d.pz[i];
      const uz = d.py[i];
      if (!Number.isFinite(ux) || !Number.isFinite(uy)) continue;
      const key = `${Math.floor(ux / cell)},${Math.floor(uy / cell)}`;
      rows.set(key, (rows.get(key) ?? 0) + 1);
      let set = bands.get(key);
      if (!set) bands.set(key, (set = new Set()));
      if (Number.isFinite(uz)) set.add(Math.floor(uz / band));
    }
    const cells = [];
    for (const [key, n] of rows) {
      const [cx, cy] = key.split(',').map(Number);
      cells.push([cx, cy, n, bands.get(key)?.size ?? 0]);
    }
    // Busiest first, so a reader that only wants the top of the list can stop.
    cells.sort((a, b) => b[2] - a[2]);
    return { total: d.count, cells };
  },
  { parquetPath: rel(parquet), cell: CELL, band: BAND },
);

writeFileSync(
  outPath,
  JSON.stringify(
    {
      source: parquet.replace(/\\/g, '/'),
      units: 'unreal centimetres',
      cell: CELL,
      band: BAND,
      rows: grid.total,
      // [cellX, cellY, datapoints, heightBandsUsed]
      cells: grid.cells,
    },
    null,
    0,
  ),
);
const busiest = grid.cells[0];
console.log(
  `${grid.total.toLocaleString()} rows into ${grid.cells.length} cells of ${CELL / 100}m\n` +
    `busiest: ${busiest[2].toLocaleString()} rows over ${busiest[3]} height bands ` +
    `at X=${busiest[0] * CELL} Y=${busiest[1] * CELL}\n` +
    `wrote ${outPath}`,
);
await browser.close();
