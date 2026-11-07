/**
 * Screenshot an exported level, close enough to judge whether a house is a house.
 *
 * Numbers from the exporter say how many triangles survived; they say nothing
 * about whether the survivors are the right ones. This loads the .glb through
 * the same import the level panel uses — same decimation preset, same defaults —
 * and takes shots from a few distances, so a picture from here is a picture of
 * what somebody opening the app would actually see.
 *
 *   node tools/shot-level.mjs [outDir] [url]
 */
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REPO = resolve(import.meta.dirname, '..');
const OUT = join(REPO, 'exporters/unreal/.out');
const shotDir = process.argv[2] ?? join(REPO, 'tools/.smoke');
const url = process.argv[3] ?? 'http://127.0.0.1:5273/?backend=webgl2';
mkdirSync(shotDir, { recursive: true });

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
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);

const info = await page.evaluate(async (path) => {
  const response = await fetch(path);
  const bytes = await response.arrayBuffer();
  const file = new File([bytes], path.split('/').pop(), { type: 'model/gltf-binary' });
  const { modelLoader } = await import('/src/data/modelLoader.ts');
  const { LOD_TARGETS, IMPORT_DEFAULT_LOD } = await import('/src/data/simplify.ts');
  // The preset the level panel actually applies, imported from the same constant
  // the panel uses.
  //
  // Not `Infinity`, and not this tool's own idea of a sensible preset either.
  // Using Infinity is how three rounds of exporter work were signed off on
  // screenshots nobody could reproduce: the panel defaulted to a preset that
  // decimated the same file ninefold, so every picture taken during development
  // showed geometry the user never saw, and the exporter was blamed twice for
  // it. Hard-coding a guess at the panel's default has the same failure one step
  // removed — so the constant is shared, and if the panel's default changes this
  // tool changes with it.
  const m = await modelLoader.load(file, LOD_TARGETS[IMPORT_DEFAULT_LOD]);
  const preset = IMPORT_DEFAULT_LOD;
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
    brightness: 1.0,
    wireframe: false,
    // Solid structures: the question is whether the shapes are right, and a 25%
    // shell hides exactly that.
    structureOpacity: 1,
    structureWireOpacity: 0,
    groundWireOpacity: 0.3,
    structureTint: [0.8, 0.85, 0.9],
    showStructureFaces: true,
    showStructureWire: true,
  });
  s.toggle('showGrid');
  return {
    ground: m.triangles,
    structures: m.structureTriangles,
    water: m.waterTriangles,
    preset,
    sourceTotal: m.sourceTriangles + m.sourceStructureTriangles,
    bounds: m.bounds,
    groundBand: m.groundBand,
  };
}, glb);

console.log(
  `${glb}: ${info.ground} ground + ${info.structures} structure + ${info.water} water triangles ` +
    `(from ${info.sourceTotal}, viewer preset '${info.preset}')`,
);
const b = info.bounds;
const cx = (b.minX + b.maxX) / 2;
const cz = (b.minZ + b.maxZ) / 2;
const width = b.maxX - b.minX;

/** Look at a point from a given distance and elevation. */
async function shot(name, target, distance, pitchDeg, yawDeg = 35) {
  // distance 0 means "leave the camera where it is", for a shot already framed.
  if (distance > 0) await page.evaluate(
    ({ target, distance, pitchDeg, yawDeg }) => {
      const engine = globalThis.__3dheat_engine;
      const yaw = (yawDeg * Math.PI) / 180;
      const pitch = (pitchDeg * Math.PI) / 180;
      const dir = [
        -Math.sin(yaw) * Math.cos(pitch),
        Math.sin(pitch),
        -Math.cos(yaw) * Math.cos(pitch),
      ];
      engine.camera.position.set(
        target[0] - dir[0] * distance,
        target[1] - dir[1] * distance,
        target[2] - dir[2] * distance,
      );
      engine.camera.setOrientationDegrees(yawDeg, pitchDeg);
      engine.camera.moved = true;
    },
    { target, distance, pitchDeg, yawDeg },
  );
  await page.waitForTimeout(2200);
  const png = await page.evaluate(async () => {
    const engine = globalThis.__3dheat_engine;
    if (engine.live.backend === 'webgpu') {
      const shotData = await engine.captureFrame();
      if (!shotData) return null;
      const c = document.createElement('canvas');
      c.width = shotData.width;
      c.height = shotData.height;
      const ctx = c.getContext('2d');
      const img = ctx.createImageData(shotData.width, shotData.height);
      img.data.set(shotData.rgba);
      ctx.putImageData(img, 0, 0);
      return c.toDataURL('image/png');
    }
    return engine.canvas.toDataURL('image/png');
  });
  if (!png) {
    console.log(`  ${name}: no frame`);
    return;
  }
  const file = join(shotDir, `${name}.png`);
  writeFileSync(file, Buffer.from(png.split(',')[1], 'base64'));
  console.log(`  wrote ${file}`);
}

/**
 * Where the structures actually are.
 *
 * Aiming at the middle of the bounds is how the first attempt at this ended up
 * photographing a hillside of trees while the buildings sat somewhere else
 * entirely. A histogram over the structure triangles finds the densest cell, and
 * the ratio between that cell and the whole tells you whether the export has
 * buildings at all or just scenery.
 */
const dense = await page.evaluate(() => {
  const level = globalThis.__3dheat.useStore.getState().level;
  const idx = level.structureIndices;
  const v = level.vertices;
  const b = level.bounds;
  const N = 24;
  const cells = new Float64Array(N * N);
  const sumY = new Float64Array(N * N);
  const spanX = Math.max(1e-6, b.maxX - b.minX);
  const spanZ = Math.max(1e-6, b.maxZ - b.minZ);
  for (let i = 0; i < idx.length; i += 3) {
    const o = idx[i] * 6;
    const gx = Math.min(N - 1, Math.floor(((v[o] - b.minX) / spanX) * N));
    const gz = Math.min(N - 1, Math.floor(((v[o + 2] - b.minZ) / spanZ) * N));
    const k = gz * N + gx;
    cells[k]++;
    sumY[k] += v[o + 1];
  }
  let best = 0;
  for (let k = 1; k < cells.length; k++) if (cells[k] > cells[best]) best = k;
  const gx = best % N;
  const gz = Math.floor(best / N);
  const total = idx.length / 3;
  return {
    x: b.minX + (spanX * (gx + 0.5)) / N,
    z: b.minZ + (spanZ * (gz + 0.5)) / N,
    y: cells[best] > 0 ? sumY[best] / cells[best] : 0,
    triangles: cells[best],
    share: total > 0 ? cells[best] / total : 0,
    cellMetres: spanX / N / 100,
    occupied: cells.filter((c) => c > 0).length,
    cells: N * N,
  };
});
console.log(
  `  densest structure cell: ${dense.triangles} triangles ` +
    `(${(dense.share * 100).toFixed(1)}% of all structures) in a ${dense.cellMetres.toFixed(0)}m cell; ` +
    `${dense.occupied} of ${dense.cells} cells hold any`,
);

/**
 * And a place named on the command line, in Unreal coordinates.
 *
 * `HEAT3D_AIM=-34625,59807` photographs that spot. The densest-cell and
 * centre-of-map cameras below both answer "where is there geometry", and the
 * question that actually keeps being asked is the opposite one: `find-gaps.mjs`
 * names the cell with the most telemetry and the least geometry, and that is the
 * address of whatever is missing. Being able to point a camera straight at it
 * turns "the buildings are still missing" from a matter of opinion into a
 * before-and-after picture of one known location.
 *
 * The height comes from the geometry near the spot rather than the middle of the
 * ground band: a camera placed at the band's midpoint is underground wherever
 * the terrain is above average, and every early shot from this tool was of the
 * inside of a hill.
 */
const aimArg = process.env.HEAT3D_AIM;
let aim = null;
if (aimArg) {
  const [ax, ay] = aimArg.split(',').map(Number);
  if (Number.isFinite(ax) && Number.isFinite(ay)) {
    aim = await page.evaluate(
      ({ ax, ay }) => {
        const level = globalThis.__3dheat.useStore.getState().level;
        const v = level.vertices;
        const R = 5000; // 50m
        let sum = 0;
        let n = 0;
        let top = -Infinity;
        const scan = (idx) => {
          if (!idx) return;
          for (let i = 0; i < idx.length; i += 3) {
            const o = idx[i] * 6;
            if (Math.abs(v[o] - ax) > R || Math.abs(v[o + 2] - ay) > R) continue;
            sum += v[o + 1];
            n++;
            if (v[o + 1] > top) top = v[o + 1];
          }
        };
        scan(level.structureIndices);
        const structuresNear = n;
        scan(level.indices);
        return {
          x: ax,
          z: ay,
          y: n > 0 ? sum / n : 0,
          top: Number.isFinite(top) ? top : 0,
          structuresNear,
          verticesNear: n,
        };
      },
      { ax, ay },
    );
    console.log(
      `  aim X=${aim.x} Y=${aim.z}: ${aim.structuresNear} structure triangles within 50m, ` +
        `terrain around ${(aim.y / 100).toFixed(0)}m, tallest ${(aim.top / 100).toFixed(0)}m`,
    );
  }
}

const groundY = (info.groundBand.minY + info.groundBand.maxY) / 2;
// Framed the way the viewer frames a dataset, so the whole level is in shot and
// inside the far plane.
await page.evaluate((bounds) => {
  const engine = globalThis.__3dheat_engine;
  engine.camera.frame(bounds, 60, false);
  engine.camera.moved = true;
}, info.bounds);
await page.waitForTimeout(2500);
await shot('level-far', [cx, groundY, cz], 0, 0, 0);
await shot('level-dense-over', [dense.x, dense.y, dense.z], 40000, -50);
await shot('level-dense-mid', [dense.x, dense.y, dense.z], 12000, -28);
await shot('level-dense-close', [dense.x, dense.y, dense.z], 4000, -12);

/**
 * And the same views in the look the viewer actually ships.
 *
 * The shots above are deliberately unflattering — opaque, unlit by the Fresnel
 * rim, no edges — because that is how you see whether a shape is a shape. But
 * judging the export by them alone confuses "the geometry is wrong" with "the
 * shading is loud", and those need different fixes.
 */
await page.evaluate(() => {
  globalThis.__3dheat.useStore.getState().patchLevel({
    structureOpacity: 0.35,
    structureWireOpacity: 0.5,
    showStructureWire: false,
    structureTint: [0.35, 0.85, 1],
  });
});
await shot('level-app-over', [dense.x, dense.y, dense.z], 40000, -50);
await shot('level-app-mid', [dense.x, dense.y, dense.z], 12000, -28);

/**
 * And the middle of the map, at town scale.
 *
 * The densest-cell camera above is the right instrument for "is the geometry
 * shaped correctly" and the wrong one for "are the buildings there": once the
 * rocks moved to the ground part and the trees kept their canopies, the densest
 * *structure* cell became a wood, and every shot of it was a shot of trees. The
 * built-up area of a map is near its centre far more often than not.
 */
await shot('level-town', [cx, groundY, cz], 30000, -35);
await shot('level-town-close', [cx, groundY, cz], 9000, -20);

if (aim) {
  // Back to the unflattering look for these: the question at a named gap is
  // whether a building is there at all.
  await page.evaluate(() => {
    globalThis.__3dheat.useStore.getState().patchLevel({
      structureOpacity: 1,
      structureWireOpacity: 0,
      showStructureWire: true,
      structureTint: [0.8, 0.85, 0.9],
    });
  });
  await shot('level-aim-over', [aim.x, aim.y, aim.z], 20000, -45);
  await shot('level-aim-mid', [aim.x, aim.y, aim.z], 7000, -22);
  await shot('level-aim-close', [aim.x, aim.y, aim.z], 2500, -8);
}

await browser.close();

