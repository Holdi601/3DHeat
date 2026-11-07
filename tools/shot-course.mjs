/**
 * Screenshot a textured course, the way the level panel would show it.
 *
 * The texture path has four places to go wrong that no unit test sees: the
 * atlas has to be packed in the worker, decoded asynchronously, uploaded with a
 * mip chain, and sampled with UVs that survived compaction. Any one failing
 * gives a grey ground, which looks exactly like "this level has no texture".
 * So this loads a real exported course through the real import, waits for the
 * atlas, and photographs it - and reports whether the ground came out coloured.
 *
 *   node tools/shot-course.mjs <glb path under the repo> [outDir] [url]
 *
 * The url picks the backend: add ?backend=webgpu to check that one, which also
 * needs SMOKE_WEBGPU=1 for the flags that expose an adapter.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REPO = resolve(import.meta.dirname, '..');
const glb = process.argv[2];
if (!glb) {
  console.error('usage: node tools/shot-course.mjs <glb under the repo> [outDir] [url]');
  process.exit(2);
}
const shotDir = process.argv[3] ?? join(REPO, 'tools/.smoke');
const url = process.argv[4] ?? 'http://127.0.0.1:5273/?backend=webgl2';
mkdirSync(shotDir, { recursive: true });
const webgpu = /backend=webgpu/.test(url);

const browser = await chromium.launch({
  channel: webgpu ? 'chromium' : undefined,
  args: webgpu
    ? ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-webgpu-adapter=swiftshader']
    : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
// A page that runs out of memory loading a large course dies without an error
// anyone awaits; without this the tool waits on it for ever.
page.on('crash', () => {
  console.error('FAIL: the page crashed (out of memory?)');
  process.exit(1);
});
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);

const path = '/' + glb.replace(/\\/g, '/').replace(/^\//, '');
const info = await page.evaluate(async (path) => {
  const response = await fetch(path);
  const bytes = await response.arrayBuffer();
  const file = new File([bytes], path.split('/').pop(), { type: 'model/gltf-binary' });
  const { modelLoader } = await import('/src/data/modelLoader.ts');
  const m = await modelLoader.load(file, Infinity);
  const s = globalThis.__3dheat.useStore.getState();
  s.setLevel({
    kind: 'model',
    name: 'course',
    vertices: m.vertices,
    colours: m.colours,
    uvs: m.uvs,
    atlas: m.atlas,
    showTexture: true,
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
    desaturate: 0,
    brightness: 1.0,
    wireframe: false,
    structureOpacity: 1,
    structureWireOpacity: 0,
    groundWireOpacity: 0,
    structureTint: [0.8, 0.85, 0.9],
    showStructureFaces: true,
    showStructureWire: false,
    structureTexture: true,
    flatStructures: false,
  });
  s.toggle('showGrid');
  return {
    triangles: m.triangles,
    uvs: m.uvs ? m.uvs.length / 2 : 0,
    atlasBytes: m.atlas ? m.atlas.size : 0,
    bounds: m.bounds,
    parts: m.partNames,
  };
}, path);

console.log(
  `${path}: ${info.triangles.toLocaleString()} triangles, ${info.uvs.toLocaleString()} UVs, ` +
    `atlas ${(info.atlasBytes / 1e6).toFixed(1)} MB, ${info.parts.length} parts`,
);
// Decoding and mip-building a large atlas takes a moment on a software GPU.
await page.waitForTimeout(6000);

async function shot(name, target, distance, pitchDeg, yawDeg) {
  await page.evaluate(
    ({ target, distance, pitchDeg, yawDeg }) => {
      const engine = globalThis.__3dheat_engine;
      const yaw = (yawDeg * Math.PI) / 180;
      const pitch = (pitchDeg * Math.PI) / 180;
      const dir = [-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)];
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
  await page.waitForTimeout(2500);
  const shotData = await page.evaluate(async () => {
    const engine = globalThis.__3dheat_engine;
    let width, height, rgba;
    if (engine.live.backend === 'webgpu') {
      const d = await engine.captureFrame();
      if (!d) return null;
      ({ width, height } = d);
      rgba = d.rgba;
    } else {
      const c = engine.canvas;
      const probe = document.createElement('canvas');
      probe.width = c.width;
      probe.height = c.height;
      const ctx = probe.getContext('2d');
      ctx.drawImage(c, 0, 0);
      width = c.width;
      height = c.height;
      rgba = ctx.getImageData(0, 0, width, height).data;
    }
    // How coloured is the frame? A grey ground has R=G=B; the baked texture
    // is green, with grey asphalt through it.
    // Of the pixels that show anything: a sprint's corridor is a thin ribbon
    // across a mostly empty frame, and counted against the whole frame a fully
    // textured one reads as bare.
    let green = 0;
    let samples = 0;
    for (let i = 0; i < rgba.length; i += 4 * 97) {
      if (rgba[i] < 30 && rgba[i + 1] < 30 && rgba[i + 2] < 35) continue; // background
      samples++;
      if (rgba[i + 1] > rgba[i] + 12 && rgba[i + 1] > rgba[i + 2] + 12) green++;
    }
    samples = Math.max(samples, 1);
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(width, height);
    img.data.set(rgba);
    ctx.putImageData(img, 0, 0);
    return { png: c.toDataURL('image/png'), green: green / samples };
  });
  if (!shotData) {
    console.log(`  ${name}: no frame`);
    return null;
  }
  const file = join(shotDir, `${name}.png`);
  writeFileSync(file, Buffer.from(shotData.png.split(',')[1], 'base64'));
  console.log(`  ${name}: ${(shotData.green * 100).toFixed(0)}% of pixels green  -> ${file}`);
  return shotData.green;
}

const b = info.bounds;
const centre = [(b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2, (b.minZ + b.maxZ) / 2];
const span = Math.max(b.maxX - b.minX, b.maxZ - b.minZ);
const tag = webgpu ? 'webgpu' : 'webgl2';
const overview = await shot(`course-${tag}-overview`, centre, span * 0.9, -55, 20);
await shot(`course-${tag}-mid`, centre, span * 0.35, -35, 40);
await shot(`course-${tag}-low`, [centre[0] - span * 0.12, centre[1], centre[2] + span * 0.05], span * 0.1, -18, 120);
// Close-ups of particular places, in the file's own coordinates:
//   SHOTS='[{"name":"kerb","target":[x,y,z],"distance":25,"pitch":-30,"yaw":0}]'
for (const extra of JSON.parse(process.env.SHOTS ?? '[]')) {
  await shot(`course-${tag}-${extra.name}`, extra.target, extra.distance, extra.pitch, extra.yaw);
}

await browser.close();
if (errors.length) {
  console.log('errors:');
  for (const e of errors.slice(0, 10)) console.log('  ', e);
}
if (overview === null || overview < 0.05) {
  console.log('FAIL: the ground did not come out textured');
  process.exit(1);
}
console.log('ok');
