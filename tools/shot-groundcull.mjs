/**
 * The terrain cutoff, on the real map, from inside a building.
 *
 * The probe proves the mechanism on a wall built for the purpose: heat behind
 * terrain goes, heat behind a wall stays for the dimmer to handle. What it cannot
 * show is whether that is the right thing to do on a map a few kilometres across
 * with millions of datapoints on it, which is a judgement about a picture.
 *
 * So this reproduces the view the complaint came from — a camera at head height
 * inside a building, looking out across the map — and shoots it with the cutoff
 * off and on. The number beside each shot is how much of the frame's heat sits
 * above the horizon line, which is the band that was drowning the interior.
 *
 *   node tools/shot-groundcull.mjs [outDir] [url]
 */
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REPO = resolve(import.meta.dirname, '..');
const OUT = join(REPO, 'exporters/unreal/.out');
const shotDir = process.argv[2] ?? join(REPO, 'tools/.smoke');
const url = process.argv[3] ?? 'http://127.0.0.1:5273/?backend=webgl2';
mkdirSync(shotDir, { recursive: true });

/**
 * Where to stand, in Unreal centimetres.
 *
 * The busiest multi-floor cell `find-buildings.mjs` reports: 87,416 datapoints
 * across five stood-on storeys. Somewhere people were inside something, which is
 * the case the cutoff is for.
 */
const AT = (process.env.HEAT3D_AIM ?? '-33474,62526').split(',').map(Number);

function newest(dir, ext, minSize = 0) {
  if (!existsSync(dir)) return null;
  const found = readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(ext))
    .map((f) => ({ f: join(dir, f), size: statSync(join(dir, f)).size }))
    .filter((e) => e.size >= minSize)
    .sort((a, b) => b.size - a.size);
  return found.length ? found[0].f : null;
}

const glb = newest(OUT, '.glb', 1e7);
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
const page = await browser.newPage({ viewport: { width: 1400, height: 800 } });
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40_000 });

const rel = (p) => '/' + p.replace(REPO, '').replace(/\\/g, '/').replace(/^\//, '');

const info = await page.evaluate(
  async ({ glbPath, parquetPath, at }) => {
    const { modelLoader } = await import('/src/data/modelLoader.ts');
    const { LOD_TARGETS, IMPORT_DEFAULT_LOD } = await import('/src/data/simplify.ts');
    const { previewSource } = await import('/src/data/sourcePreview.ts');
    const { autoMap } = await import('/src/data/automap.ts');
    const { ingestFiles } = await import('/src/data/ingestFiles.ts');

    const gbytes = await (await fetch(glbPath)).arrayBuffer();
    const m = await modelLoader.load(
      new File([gbytes], 'level.glb', { type: 'model/gltf-binary' }),
      LOD_TARGETS[IMPORT_DEFAULT_LOD],
    );
    const s = globalThis.__3dheat.useStore.getState();
    s.setLevel({
      kind: 'model',
      name: 'export',
      vertices: m.vertices,
      indices: m.indices,
      structureIndices: m.structureIndices,
      structureEdges: m.structureEdges,
      waterIndices: m.waterIndices,
      triangles: m.triangles,
      structureTriangles: m.structureTriangles,
      waterTriangles: m.waterTriangles,
      sourceTriangles: m.sourceTriangles,
      sourceStructureTriangles: m.sourceStructureTriangles,
      partNames: m.partNames,
      partClasses: m.partClasses,
      partReasons: m.partReasons,
      bounds: m.bounds,
      relief: { lowY: m.groundBand.minY, highY: m.groundBand.maxY },
      opacity: 1,
      desaturate: 1,
      brightness: 1,
      wireframe: false,
    });

    const pbytes = await (await fetch(parquetPath)).arrayBuffer();
    const pfile = new File([pbytes], parquetPath.split('/').pop());
    const p = await previewSource(pfile);
    const mapping = autoMap({
      columns: p.columns,
      rows: p.rows,
      numeric: p.numeric,
      logicalTypes: p.logicalTypes,
    });
    const ds = await ingestFiles({ files: [pfile], mapping, columns: p.columns, name: 'cull' });
    const d = ds?.dataset ?? ds;
    globalThis.__3dheat.useStore.getState().setDataset(d);
    globalThis.__3dheat.useStore.getState().patchTimeline({ mode: 'all', playing: false });

    // The local ground height, so the camera stands on the terrain rather than
    // inside it or in the air above it.
    const v = m.vertices;
    const idx = m.indices;
    let top = -Infinity;
    if (idx) {
      for (let i = 0; i < idx.length; i++) {
        const o = idx[i] * 6;
        if (Math.abs(v[o] - at[0]) > 4000 || Math.abs(v[o + 2] - at[1]) > 4000) continue;
        if (v[o + 1] > top) top = v[o + 1];
      }
    }
    return { rows: d.count, groundY: Number.isFinite(top) ? top : 0 };
  },
  { glbPath: rel(glb), parquetPath: rel(parquet), at: AT },
);
console.log(`${info.rows.toLocaleString()} rows; ground at ${(info.groundY / 100).toFixed(0)}m\n`);

await page.waitForTimeout(2000);
await page.evaluate(
  ({ at, groundY }) => {
    const engine = globalThis.__3dheat_engine;
    // Head height, looking level and out across the map: the horizon has to be
    // in frame, because the horizon is the problem.
    engine.camera.position.set(at[0], groundY + 180, at[1]);
    engine.camera.setOrientationDegrees(35, -2);
    engine.camera.moved = true;
    globalThis.__3dheat.useStore.getState().patchHeat({
      radius: 1000,
      response: 'saturating',
      occlusion: 0.33,
      groundProjected: false,
    });
    // Every row in one frame, and the frame-rate governor off.
    //
    // The default budget draws 66,000 sprites a frame and lets the field
    // converge over the next two hundred, which under software rendering never
    // finishes inside any patience. Worse, it makes the measurement a race: the
    // first shot lands on a half-built field and the second on a fuller one, so
    // *whatever* changed between them reads as an increase. Measured that way,
    // turning the cutoff on appeared to make the frame nine times brighter.
    globalThis.__3dheat.useStore.getState().patchBudget({
      splatsPerFrame: 20_000_000,
      adaptive: false,
      progressive: false,
    });
  },
  { at: AT, groundY: info.groundY },
);
await page.waitForTimeout(3500);

/**
 * Shoot, and measure how much of the frame's heat is above the skyline.
 *
 * The skyline is found per column as the topmost pixel that is not background,
 * which is where the terrain ends. Heat above it is heat from beyond the visible
 * world, and it was the brightest thing on screen.
 */
async function shot(name) {
  const png = await page.evaluate(async () => {
    const engine = globalThis.__3dheat_engine;
    if (engine.live.backend === 'webgpu') {
      const s = await engine.captureFrame();
      if (!s) return null;
      const c = document.createElement('canvas');
      c.width = s.width;
      c.height = s.height;
      const ctx = c.getContext('2d');
      const img = ctx.createImageData(s.width, s.height);
      img.data.set(s.rgba);
      ctx.putImageData(img, 0, 0);
      return c.toDataURL('image/png');
    }
    return engine.canvas.toDataURL('image/png');
  });
  if (!png) {
    console.log(`  ${name}: no frame`);
    return null;
  }
  writeFileSync(join(shotDir, `${name}.png`), Buffer.from(png.split(',')[1], 'base64'));

  const measured = await page.evaluate(`(async () => {
    const engine = globalThis.__3dheat_engine;
    const w = 480, h = 270;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    if (engine.live.backend === 'webgpu') {
      const s = await engine.captureFrame();
      const t = document.createElement('canvas');
      t.width = s.width; t.height = s.height;
      const tc = t.getContext('2d');
      const img = tc.createImageData(s.width, s.height);
      img.data.set(s.rgba);
      tc.putImageData(img, 0, 0);
      ctx.drawImage(t, 0, 0, w, h);
    } else {
      ctx.drawImage(engine.canvas, 0, 0, w, h);
    }
    const d = ctx.getImageData(0, 0, w, h).data;
    const warm = (o) => d[o] > d[o + 2] + 12 || (d[o] > 180 && d[o + 1] > 180 && d[o + 2] > 180);
    const lit = (o) => d[o] > 34 || d[o + 1] > 34 || d[o + 2] > 34;
    // Per column, the first row from the top that is neither background nor heat:
    // that is the terrain's edge against the sky. The complaint is about the band
    // just under it — where kilometres of distant ground compress into a few
    // pixels — so that band is measured on its own, against everything nearer.
    const BAND = 18;
    let above = 0, band = 0, near = 0;
    for (let x = 0; x < w; x++) {
      let sky = h;
      for (let y = 0; y < h; y++) {
        const o = (y * w + x) * 4;
        if (lit(o) && !warm(o)) { sky = y; break; }
      }
      for (let y = 0; y < h; y++) {
        const o = (y * w + x) * 4;
        if (!warm(o)) continue;
        const lum = d[o] + d[o + 1] + d[o + 2];
        if (y < sky) above += lum;
        else if (y < sky + BAND) band += lum;
        else near += lum;
      }
    }
    return { above, band, near };
  })()`);
  console.log(
    `  ${name.padEnd(24)} sky ${String(measured.above).padStart(8)}   ` +
      `horizon band ${String(measured.band).padStart(9)}   ` +
      `nearer ground ${String(measured.near).padStart(9)}   ` +
      `band:near ${(measured.band / Math.max(1, measured.near)).toFixed(3)}`,
  );
  return measured;
}

/**
 * Change a setting and wait for the field to finish converging.
 *
 * Not a fixed delay, and the difference is the whole measurement. Only 66,000 of
 * 14 million sprites are drawn per frame, so the field accumulates over dozens of
 * frames and *any* fixed wait compares a half-built field against a more-built
 * one. Measured with a three-second wait, turning the cutoff on appeared to make
 * the frame nine times brighter — which is the accumulation, not the setting.
 * Changing the cutoff also resets the accumulation, so both shots have to wait.
 */
const set = async (patch) => {
  await page.evaluate((p) => globalThis.__3dheat.useStore.getState().patchHeat(p), patch);
  await page.waitForTimeout(300);
  await page.waitForFunction(() => globalThis.__3dheat_engine.live.converged === true, null, {
    timeout: 120_000,
  });
  // A couple of composites past convergence, so the canvas holds the final field
  // rather than the one from the frame convergence was reached on.
  await page.waitForTimeout(600);
};

await set({ hideBehindGround: false, cullFar: 0 });
const before = await shot('groundcull-off');
await set({ hideBehindGround: true });
const after = await shot('groundcull-on');
// And back, because a difference between two shots is only the setting's if the
// same setting reproduces the same shot. Every wrong reading this tool produced
// before the budget was pinned was the field still filling in.
await set({ hideBehindGround: false });
const again = await shot('groundcull-off-again');
// Then the other tool for the same complaint, because it is largely a different
// problem. The cutoff answers "is this point behind something", and a point three
// kilometres away across open ground is behind nothing — it is simply far, and
// kilometres of distant ground land in a handful of pixels at grazing incidence,
// which is what builds the band. That is a distance question and there is already
// a control for it.
await set({ hideBehindGround: true, cullFar: 40_000 });
const farCulled = await shot('groundcull-on-plus-far');

const ratio = (m) => m.band / Math.max(1, m.near);
if (before && again) {
  const drift = Math.abs(1 - ratio(again) / Math.max(1e-9, ratio(before))) * 100;
  console.log(`\nrepeat of the first shot differs by ${drift.toFixed(1)}%`);
}
if (before && after && farCulled) {
  console.log(
    `band against nearer ground:  ${ratio(before).toFixed(3)} with neither  ->  ` +
      `${ratio(after).toFixed(3)} with the cutoff  ->  ` +
      `${ratio(farCulled).toFixed(3)} with the cutoff and a 400m far cull`,
  );
}
await browser.close();
