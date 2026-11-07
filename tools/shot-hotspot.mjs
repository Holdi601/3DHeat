/**
 * Is there geometry where the telemetry actually is?
 *
 * `shot-level.mjs` photographs the densest cluster of *structures*, which is a
 * fine test of whether shapes are shaped correctly and a useless one for "is the
 * building people play in present" — once the rocks moved to the ground part and
 * the trees kept their canopies, the densest structure cell became a wood.
 *
 * This aims at the densest cluster of *data* instead. The coordinates come from
 * `probe-hotspot.mjs`, which ingests the real movement parquet and buckets it, so
 * these are the places a movement heatmap is actually read. For each it counts
 * the triangles of each part class within a box, and then photographs the first
 * one — so "the building is missing" becomes a number rather than an impression.
 *
 *   node tools/shot-hotspot.mjs [outDir] [url]
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
 * Unreal centimetres, from probe-hotspot.mjs over TestData/movementso.parquet.
 *
 * The exporter maps Unreal (x, y, z) to viewer (x, z, y), so the viewer's X and Z
 * are Unreal's X and Y unchanged and these need no conversion.
 */
const DEFAULT_HOTSPOTS = [
  { name: 'densest', x: -29964, z: 61834, rows: 131976 },
  { name: 'second', x: 40972, z: -59626, rows: 125570 },
  { name: 'third', x: 46884, z: -65699, rows: 92866 },
  { name: 'fourth', x: -59521, z: -71772, rows: 85781 },
];

/**
 * `HEAT3D_AT="x,z;x,z"` aims at somewhere else, in Unreal centimetres.
 *
 * The built-up parts of a map are not the same places as the busiest telemetry —
 * `find-craters.mjs` turns up excavated compounds with thirteen thousand actor
 * descriptors in them and no data on top, and those are the places to check when
 * the complaint is "the buildings are missing".
 */
const HOTSPOTS = process.env.HEAT3D_AT
  ? process.env.HEAT3D_AT.split(';').map((pair, i) => {
      const [x, z] = pair.split(',').map(Number);
      return { name: `at${i + 1}`, x, z, rows: 0 };
    })
  : DEFAULT_HOTSPOTS;
/** Half-width of the box counted around each hotspot, in centimetres. */
const BOX = 15000;

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
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40_000 });

const info = await page.evaluate(
  async ({ path, hotspots, box }) => {
    const response = await fetch(path);
    const bytes = await response.arrayBuffer();
    const file = new File([bytes], path.split('/').pop(), { type: 'model/gltf-binary' });
    const { modelLoader } = await import('/src/data/modelLoader.ts');
    const { LOD_TARGETS, IMPORT_DEFAULT_LOD } = await import('/src/data/simplify.ts');
    const m = await modelLoader.load(file, LOD_TARGETS[IMPORT_DEFAULT_LOD]);
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
      brightness: 0.9,
      wireframe: false,
      groundWireOpacity: 0.3,
      structureOpacity: 0.35,
      structureWireOpacity: 0.5,
      showStructureWire: false,
      structureTint: [0.35, 0.85, 1],
      showStructureFaces: true,
    });

    /** Triangles of one index set whose first vertex falls inside the box. */
    const countIn = (idx, hx, hz) => {
      if (!idx) return 0;
      const v = m.vertices;
      let n = 0;
      for (let i = 0; i < idx.length; i += 3) {
        const o = idx[i] * 6;
        if (Math.abs(v[o] - hx) <= box && Math.abs(v[o + 2] - hz) <= box) n++;
      }
      return n;
    };

    /**
     * Mean ground height near a hotspot, for aiming the camera.
     *
     * Not the middle of the level's ground band — that is a single number for a
     * map with 1,700m of vertical range, so a camera aimed at it starts inside a
     * hill and photographs the inside of the terrain. Which is what the first run
     * of this tool produced: four shots of flat grey.
     */
    const groundNear = (hx, hz) => {
      const v = m.vertices;
      const idx = m.indices;
      let sum = 0;
      let n = 0;
      for (let i = 0; i < idx.length; i += 3) {
        const o = idx[i] * 6;
        if (Math.abs(v[o] - hx) <= box && Math.abs(v[o + 2] - hz) <= box) {
          sum += v[o + 1];
          n++;
        }
      }
      return n > 0 ? sum / n : 0;
    };

    return {
      totals: {
        ground: m.triangles,
        structure: m.structureTriangles,
        water: m.waterTriangles,
      },
      bounds: m.bounds,
      groundBand: m.groundBand,
      at: hotspots.map((h) => ({
        name: h.name,
        rows: h.rows,
        ground: countIn(m.indices, h.x, h.z),
        structure: countIn(m.structureIndices, h.x, h.z),
        water: countIn(m.waterIndices, h.x, h.z),
        groundY: groundNear(h.x, h.z),
      })),
    };
  },
  { path: glb, hotspots: HOTSPOTS, box: BOX },
);

console.log(
  `${glb}: ${info.totals.ground} ground + ${info.totals.structure} structure + ` +
    `${info.totals.water} water triangles`,
);
console.log(`\ntriangles within ${BOX / 100}m of each telemetry hotspot:`);
for (const a of info.at) {
  console.log(
    `  ${a.name.padEnd(8)} (${a.rows.toLocaleString()} rows)  ` +
      `structure ${String(a.structure).padStart(7)}  ground ${String(a.ground).padStart(7)}  ` +
      `water ${String(a.water).padStart(6)}`,
  );
}

async function shot(name, target, distance, pitchDeg, yawDeg = 35) {
  await page.evaluate(
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
  await page.waitForTimeout(2400);
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
    return;
  }
  writeFileSync(join(shotDir, `${name}.png`), Buffer.from(png.split(',')[1], 'base64'));
  console.log(`  wrote ${join(shotDir, `${name}.png`)}`);
}

console.log('');
for (const h of HOTSPOTS.slice(0, 2)) {
  const y = info.at.find((a) => a.name === h.name)?.groundY ?? 0;
  await shot(`hotspot-${h.name}-over`, [h.x, y + 1500, h.z], 18000, -35);
  await shot(`hotspot-${h.name}-eye`, [h.x, y + 800, h.z], 6000, -10);
}

await browser.close();
