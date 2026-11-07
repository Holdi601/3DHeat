/**
 * Screenshots of the race tab with the demo laps, on either backend.
 *
 * Loads the demo laps, frames them, and takes a picture of the overview, of a
 * mistake lined up and replayed, and of the cause map - failing on any console
 * error and on a canvas without the laps' colours in it.
 *
 *   node tools/shot-race.mjs [url]            WebGL2 (SwiftShader)
 *   SHOT_WEBGPU=1 node tools/shot-race.mjs    WebGPU (SwiftShader adapter)
 *   RACE_LAPS="a.json;b.json" node tools/shot-race.mjs   real laps instead of the demo
 *   RACE_LEVEL=exporters/.../course.glb ...                and the course under them
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const webgpu = process.env.SHOT_WEBGPU === '1';
const url = process.argv[2] ?? `http://127.0.0.1:5273/?backend=${webgpu ? 'webgpu' : 'webgl2'}`;
const OUT = 'tools/.shots';
mkdirSync(OUT, { recursive: true });
const tag = (webgpu ? 'webgpu' : 'webgl2') + (process.env.RACE_TAG ? `-${process.env.RACE_TAG}` : '');

const browser = await chromium.launch({
  ...(webgpu ? { channel: 'chromium' } : {}),
  args: webgpu
    ? ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--disable-vulkan-surface', '--use-webgpu-adapter=swiftshader', '--ignore-gpu-blocklist']
    : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));

await page.goto(url);
await page.waitForFunction(() => !!window.__3dheat_engine, null, { timeout: 60000 });
// The course, through the real model import - as the level panel loads one.
const level = process.env.RACE_LEVEL;
if (level) {
  const path = '/' + level.replace(/\\/g, '/').replace(/^\//, '');
  const triangles = await page.evaluate(async (path) => {
    const bytes = await (await fetch(path)).arrayBuffer();
    const file = new File([bytes], path.split('/').pop(), { type: 'model/gltf-binary' });
    const { modelLoader } = await import('/src/data/modelLoader.ts');
    const m = await modelLoader.load(file, Infinity);
    globalThis.__3dheat.useStore.getState().setLevel({
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
    return m.triangles;
  }, path);
  console.log(`course: ${triangles.toLocaleString()} triangles`);
  await page.waitForTimeout(6000);
}
await page.getByRole('tab', { name: 'Race analysis' }).click();

const laps = (process.env.RACE_LAPS ?? '').split(';').filter(Boolean);
if (laps.length) {
  await page.locator('input[type=file][accept*=json]').setInputFiles(laps);
} else {
  await page.getByRole('button', { name: 'Demo laps' }).click();
}
await page.waitForTimeout(800);
// Not by clicking the canvas: that takes the pointer for the fly camera, and
// every later click lands on the canvas instead of the sidebar.
await page.keyboard.press('KeyF');
await page.waitForTimeout(1500);

/** Share of canvas pixels that are strongly coloured - the laps, maps and cars. */
async function colourShare() {
  const shot = await page.evaluate(async () => {
    const f = await window.__3dheat_engine.captureFrame();
    if (!f) return null;
    let coloured = 0;
    let total = 0;
    for (let i = 0; i < f.rgba.length; i += 4 * 7) {
      const r = f.rgba[i];
      const g = f.rgba[i + 1];
      const b = f.rgba[i + 2];
      total++;
      if (Math.max(r, g, b) - Math.min(r, g, b) > 60) coloured++;
    }
    return coloured / total;
  });
  return shot;
}

const results = [];
await page.screenshot({ path: `${OUT}/race-${tag}-overview.png` });
results.push(['overview', await colourShare()]);

// Looking along the charts: hovering puts every car, and its inputs, at the
// pointer; the wheel then walks the replay along the lap from there.
{
  const plot = page.locator('.race-charts svg.plot');
  const box = await plot.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.42, box.y + box.height * 0.5);
    await page.waitForTimeout(700);
    const hud = await page.locator('.hud-cursor').textContent();
    await page.screenshot({ path: `${OUT}/race-${tag}-hover.png` });
    results.push(['hover', await colourShare()]);
    console.log(`hover: ${hud}`);
    const before = await page.locator('.race-transport .clock').textContent();
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(300);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(700);
    const after = await page.locator('.race-transport .clock').textContent();
    console.log(`wheel: ${before} -> ${after}`);
    if (before === after) errors.push('the wheel did not move the replay');
    await page.keyboard.down('Control');
    await page.mouse.wheel(0, -300);
    await page.mouse.wheel(0, -300);
    await page.keyboard.up('Control');
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/race-${tag}-zoom.png` });
    if (!(await page.getByRole('button', { name: 'Whole lap' }).count())) errors.push('Ctrl+wheel did not zoom');
    await page.getByRole('button', { name: 'Whole lap' }).click();
    await page.mouse.move(box.x + box.width * 0.5, box.y - 200);
  }
}

// Every value on the cards, and the graph picker open.
{
  await page.getByRole('button', { name: '⋯' }).first().click();
  await page.getByRole('button', { name: /^Graphs \(/ }).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/race-${tag}-values.png` });
  const offered = await page.locator('.graph-picker label.check, .graph-picker .picker-wheels').count();
  console.log(`graph picker: ${offered} channels offered`);
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: '⋯' }).first().click();
}

// The biggest mistake, lined up and replayed.
const first = page.locator('button.finding').first();
if (await first.count()) {
  await first.click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/race-${tag}-finding.png` });
  results.push(['finding', await colourShare()]);
}

// The cause map, with the replay paused.
await page.keyboard.press('KeyK');
await page.getByRole('button', { name: 'Cause map' }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/race-${tag}-why.png` });
results.push(['why', await colourShare()]);

// Chase camera on the second lap.
const chase = page.locator('.lap-row button[title^="Chase"]').nth(1);
if (await chase.count()) {
  await chase.click();
  await page.keyboard.press('KeyK');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/race-${tag}-chase.png` });
  results.push(['chase', await colourShare()]);
}

for (const [name, share] of results) console.log(`${name}: coloured ${share === null ? 'n/a' : (share * 100).toFixed(2) + '%'}`);
console.log(errors.length ? `console errors:\n${errors.join('\n')}` : 'no console errors');
await browser.close();
process.exit(errors.length || results.some(([, s]) => s !== null && s < 0.002) ? 1 : 0);
