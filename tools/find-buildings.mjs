/**
 * Where did players walk around inside something with more than one floor?
 *
 * `find-gaps.mjs` ranks cells by traffic over geometry, and I trusted it for
 * several rounds to mean "a building is missing here". It does not. Its top
 * answer on the test level was tens of thousands of datapoints over a handful of
 * structure triangles, and probing that spot in the editor found millions of
 * triangles of vegetation. Heavy traffic over little geometry is the signature
 * of *open ground* — which is exactly where people walk freely — so the tool was
 * working and the question was wrong.
 *
 * A building has a signature no meadow can fake: at one horizontal spot, players
 * stand at many different heights. Floors, stairs, catwalks, galleries. On open
 * terrain the datapoints form a thin sheet a couple of metres thick following the
 * ground; inside a three-storey warehouse they fill fifteen metres of it.
 *
 * So this measures, per cell, how many distinct height bands the telemetry
 * occupies, and how many the export's structure triangles occupy. Cells where
 * players used six floors and the geometry has none are missing buildings, named
 * by measurement, and vegetation cannot appear on the list.
 *
 *   node tools/find-buildings.mjs [url]
 */
import { chromium } from 'playwright';
import { join, resolve } from 'node:path';
import { pickGlb, pickParquet } from './pick.mjs';

const REPO = resolve(import.meta.dirname, '..');
const OUT = join(REPO, 'exporters/unreal/.out');
const url = process.argv[2] ?? 'http://127.0.0.1:5273/?backend=webgl2';

const glb = pickGlb(OUT);
const parquet = pickParquet(join(REPO, 'TestData'));
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
    const ds = await ingestFiles({ files: [pfile], mapping, columns: p.columns, name: 'blds' });
    const d = ds?.dataset ?? ds;

    // 32m cells: about the footprint of one building, so a cell is mostly inside
    // or mostly outside rather than averaging the two.
    const b = m.bounds;
    const CELL = 3200;
    const BAND = 300; // 3m — one storey
    const nx = Math.max(1, Math.ceil((b.maxX - b.minX) / CELL));
    const nz = Math.max(1, Math.ceil((b.maxZ - b.minZ) / CELL));
    const cell = (x, z) => {
      const gx = Math.floor((x - b.minX) / CELL);
      const gz = Math.floor((z - b.minZ) / CELL);
      if (gx < 0 || gz < 0 || gx >= nx || gz >= nz) return -1;
      return gz * nx + gx;
    };

    // A floor has to be *stood on*, and its height measured from the ground
    // beneath it rather than from anything else.
    //
    // Two artefacts had to be measured away before this list meant anything, and
    // each one filled the whole top of it:
    //
    //  * **Parachutes.** Counting every occupied band ranked open sea first: a
    //    descent from hundreds of metres up touches well over a hundred 3m bands,
    //    which outscores any building ever built. A floor is a band where traffic
    //    *accumulates*, because people walk along it; a descent leaves a handful
    //    in each band it passes through.
    //  * **Hillsides.** Measuring bands from the lowest datapoint in the cell
    //    ranked a jungle slope above every building on the map — over 32m of
    //    ground a slope drops tens of metres, so walking across it fills a dozen
    //    bands. Probing the top answer in the editor found millions of triangles
    //    of vegetation and no building at all, which is the second time this
    //    tool sent me to a forest.
    //
    // So height is measured against a ground heightfield built from the export's
    // own ground part. On a slope every datapoint is then a metre or two above
    // ground and fills one band; inside a three-storey building they fill three,
    // whatever the terrain is doing underneath.
    const FLOOR_ROWS = 40; // datapoints in a 3m band before it counts as a floor
    const MAX_STOREYS = 14; // ~42m: taller than that is aircraft, not a building
    const GCELL = 600; // 6m ground-height grid
    const gnx = Math.max(1, Math.ceil((b.maxX - b.minX) / GCELL));
    const gnz = Math.max(1, Math.ceil((b.maxZ - b.minZ) / GCELL));
    const height = new Float32Array(gnx * gnz).fill(NaN);
    {
      const v = m.vertices;
      const idx = m.indices;
      if (idx) {
        for (let i = 0; i < idx.length; i++) {
          const o = idx[i] * 6;
          const gx = Math.floor((v[o] - b.minX) / GCELL);
          const gz = Math.floor((v[o + 2] - b.minZ) / GCELL);
          if (gx < 0 || gz < 0 || gx >= gnx || gz >= gnz) continue;
          const k = gz * gnx + gx;
          // The top surface: a cliff face contributes many heights to one cell
          // and the walkable one is the highest.
          if (!(v[o + 1] <= height[k])) height[k] = v[o + 1];
        }
      }
    }
    const groundAt = (x, z) => {
      const gx = Math.floor((x - b.minX) / GCELL);
      const gz = Math.floor((z - b.minZ) / GCELL);
      if (gx < 0 || gz < 0 || gx >= gnx || gz >= gnz) return NaN;
      return height[gz * gnx + gx];
    };

    const counts = new Float64Array(nx * nz);
    for (let i = 0; i < d.count; i++) {
      const k = cell(d.px[i], d.pz[i]);
      if (k >= 0) counts[k]++;
    }
    // Per cell, how many datapoints sit in each band above the ground.
    const bandRows = new Map();
    for (let i = 0; i < d.count; i++) {
      const k = cell(d.px[i], d.pz[i]);
      if (k < 0) continue;
      const g = groundAt(d.px[i], d.pz[i]);
      if (!Number.isFinite(g)) continue;
      const band = Math.floor((d.py[i] - g) / BAND);
      if (band < 0 || band > MAX_STOREYS) continue;
      let tally = bandRows.get(k);
      if (!tally) bandRows.set(k, (tally = new Map()));
      tally.set(band, (tally.get(band) ?? 0) + 1);
    }
    // A floor holds a *share* of the cell's traffic, not a fixed number of rows.
    //
    // `FLOOR_ROWS` alone is the third artefact this tool has had to measure away,
    // and it is the subtlest: an absolute threshold means a cell's floor count
    // rises with its traffic. In a cell with 16,000 rows, forty of them in a band
    // is a quarter of one percent — which a parachute descent, a stairwell, or a
    // vehicle on a slope supplies without anybody standing anywhere. That is why
    // the top of this list came back as twenty-odd cells all reporting four or
    // five storeys and all among the busiest on the map: the count was measuring
    // traffic, not floors.
    //
    // A real floor is walked along, so it takes a real fraction of whatever
    // traffic the cell sees. Both tests apply: the fraction rejects the busy
    // cells, the absolute count still rejects the quiet ones.
    const FLOOR_SHARE = 0.04;
    const bands = new Map();
    for (const [k, tally] of bandRows) {
      const set = new Set();
      const need = Math.max(FLOOR_ROWS, counts[k] * FLOOR_SHARE);
      for (const [band, n] of tally) if (n >= need) set.add(band);
      bands.set(k, set);
    }

    // The same measure over the export's structure triangles.
    // Ground triangles per cell, to tell land from open sea. Without it the list
    // is aircraft tracks and parachute descents, which have no geometry under
    // them because there is nothing there.
    const groundCount = new Float64Array(nx * nz);
    // …and how many height bands the *ground* part occupies, which distinguishes
    // the two ways a building can be absent from the structures.
    //
    // A building's walls classified as landscape are still exported; they are
    // just drawn as opaque grey ground instead of translucent structure, so the
    // heat inside them is hidden and the result looks from the viewport exactly
    // like a building that was never exported at all. The two need telling apart
    // before anything is changed, because the fixes are in different places: one
    // is the classifier, the other is a budget or a filter. Terrain proper fills
    // one band per cell; a three-storey building fills three whichever part it
    // ended up in.
    const groundBands = new Map();
    {
      const v = m.vertices;
      const idx = m.indices;
      if (idx) {
        for (let i = 0; i < idx.length; i += 3) {
          const o = idx[i] * 6;
          const k = cell(v[o], v[o + 2]);
          if (k < 0) continue;
          groundCount[k]++;
          const g = groundAt(v[o], v[o + 2]);
          if (!Number.isFinite(g)) continue;
          const band = Math.floor((v[o + 1] - g) / BAND);
          if (band < 1 || band > MAX_STOREYS) continue;
          let set = groundBands.get(k);
          if (!set) groundBands.set(k, (set = new Set()));
          set.add(band);
        }
      }
    }

    // The same measure over the export's structure triangles, against the same
    // ground, so the two columns are comparable.
    const geomBands = new Map();
    const geomCount = new Float64Array(nx * nz);
    const v = m.vertices;
    const idx = m.structureIndices;
    if (idx) {
      for (let i = 0; i < idx.length; i += 3) {
        const o = idx[i] * 6;
        const k = cell(v[o], v[o + 2]);
        if (k < 0) continue;
        geomCount[k]++;
        const g = groundAt(v[o], v[o + 2]);
        if (!Number.isFinite(g)) continue;
        const band = Math.floor((v[o + 1] - g) / BAND);
        if (band < 0 || band > MAX_STOREYS) continue;
        let set = geomBands.get(k);
        if (!set) geomBands.set(k, (set = new Set()));
        set.add(band);
      }
    }

    const rows = [];
    for (const [k, set] of bands) {
      // Enough traffic to be a place, on land, and enough vertical use to be a
      // structure.
      if (counts[k] < 800) continue;
      if (groundCount[k] < 40) continue;
      const storeys = set.size;
      if (storeys < 3) continue; // under 9m of stood-on height: call it ground
      rows.push({
        unrealX: Math.round(b.minX + CELL * ((k % nx) + 0.5)),
        unrealY: Math.round(b.minZ + CELL * (Math.floor(k / nx) + 0.5)),
        rows: counts[k],
        storeys,
        geomStoreys: geomBands.get(k)?.size ?? 0,
        structure: geomCount[k],
        ground: groundCount[k],
        groundStoreys: groundBands.get(k)?.size ?? 0,
      });
    }
    // Worst first: most vertical use by players, least by the geometry.
    rows.sort((a, c) => c.storeys - c.geomStoreys - (a.storeys - a.geomStoreys));
    const withNone = rows.filter((r) => r.structure === 0).length;
    return {
      cellMetres: CELL / 100,
      totalRows: d.count,
      candidates: rows.length,
      withNoGeometry: withNone,
      worst: rows.slice(0, 20),
    };
  },
  { glbPath: rel(glb), parquetPath: rel(parquet) },
);

console.log(
  `${out.totalRows.toLocaleString()} rows, ${out.cellMetres}m cells, ` +
    `${out.candidates} cells where players stood on 3+ floors ` +
    `(${out.withNoGeometry} with no structure geometry at all)\n`,
);
console.log('players used many floors, the export has few:');
for (const r of out.worst) {
  console.log(
    `  ${String(r.rows).padStart(7)} rows over ${String(r.storeys).padStart(3)} storeys ` +
      `vs ${String(r.geomStoreys).padStart(3)} in geometry ` +
      `(${String(r.structure).padStart(6)} tris)` +
      // The distinguishing column. Ground standing several storeys tall in a cell
      // is a building that was exported into the wrong part, not one that is
      // absent — see `groundBands`.
      `  ground ${String(r.groundStoreys).padStart(2)} storeys/${String(r.ground).padStart(6)} tris` +
      `   at X=${String(r.unrealX).padStart(8)} Y=${String(r.unrealY).padStart(8)}`,
  );
}
const misfiled = out.worst.filter((r) => r.structure === 0 && r.groundStoreys >= 3);
if (misfiled.length) {
  console.log(
    `\n${misfiled.length} of these have ground geometry standing 3+ storeys tall: the building\n` +
      `was exported, but classified as landscape — drawn opaque grey instead of\n` +
      `translucent, which hides the heat inside it and looks identical to missing.`,
  );
}
await browser.close();
