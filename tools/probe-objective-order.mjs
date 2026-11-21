/**
 * Do the units stay on top of the objectives in the replay?
 *
 * A capture zone's disc lies a couple of metres over the ground and its bands
 * also show through the ground; drawn after the units, the disc covered their
 * lower half and the bands all of them, so units sank into the objectives. Now
 * every objective mark is drawn in the scene before the units
 * (`FrameParams.objectivesUnder`), and a unit's pixels must read the same with
 * the objectives on as with them off.
 *
 * Synthetic data in the replay, and one zone over all of it, so every unit
 * stands inside it. Four frames: objectives off and on, each with the units
 * and without. A unit's pixels are its insides (a pixel and its four
 * neighbours all differ between off-with-units and off-without), and none of
 * them may change when the objectives come on.
 *
 * Software rendering (SwiftShader). `--old` hands the renderer no
 * `objectivesUnder`, the order before the fix, to show what the probe catches.
 *
 *   node tools/probe-objective-order.mjs [url] [--old]
 */
import { chromium } from 'playwright';

const url = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? 'http://127.0.0.1:5273/?backend=webgl2';
const wantWebgpu = /backend=webgpu/.test(url);
const browser = await chromium.launch({
  ...(wantWebgpu ? { channel: 'chromium' } : {}),
  args: wantWebgpu
    ? ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--disable-vulkan-surface', '--use-webgpu-adapter=swiftshader', '--ignore-gpu-blocklist']
    : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1000, height: 640 } });
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.routeWebSocket(/./, () => {});
await page.addInitScript(() => {
  try {
    localStorage.clear();
  } catch {
    // Defaults either way.
  }
});
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);

const info = await page.evaluate(async () => {
  const h = globalThis.__3dheat;
  h.load(4_000);
  const s = h.useStore.getState();
  s.setMode('team');
  // No trails: they are see-through lines, and blend with whatever is under them by design.
  s.patchTeam({ trailSeconds: 0, showLookDirection: false });
  await new Promise((r) => setTimeout(r, 1500));
  const d = h.useStore.getState().dataset;
  const b = d.bounds;
  const c = [(b.minX + b.maxX) / 2, b.minY, (b.minZ + b.maxZ) / 2];
  const r = Math.max(b.maxX - b.minX, b.maxZ - b.minZ);
  const { useObjectivesStore } = await import('/src/state/objectivesStore.ts');
  useObjectivesStore.getState().addLite([
    {
      match: 'probe',
      objectives: [
        { type: 'capture_zone', layer: 'zones', team: null, name: 'A', letter: 'A', shape: 'cylinder', position: c, radius: r, height: 50, size: null, heading: 0, points: [], used: null, ownerAtStart: 1, site: '', active: [] },
      ],
    },
  ]);
  const t0 = d.timeRange[0];
  const t1 = d.timeRange[1];
  h.useStore.getState().patchTimeline({ playing: false, playhead: t0 + (t1 - t0) * 0.5, seekNonce: Date.now() });
  // Units big enough to have insides at this distance.
  h.useStore.getState().patchTeam({ cubeSize: r / 60 });
  return { teams: d.teamLabels.length, c, r };
});
await page.waitForTimeout(2000);
// The data framed, looking down at 35 degrees.
await page.evaluate((info) => {
  const e = globalThis.__3dheat_engine;
  e.frameDataset(true);
  e.camera.setOrientationDegrees(0, -35);
  e.camera.moved = true;
}, info);
await page.waitForTimeout(2500);
if (process.argv.includes('--old')) {
  await page.evaluate(() => {
    const r = globalThis.__3dheat_engine.renderer;
    const draw = r.render.bind(r);
    r.render = (p) => draw({ ...p, objectivesUnder: null });
  });
}

const READ_FRAME = `
  async () => {
    const engine = globalThis.__3dheat_engine;
    if (engine.live.backend === 'webgpu') {
      const shot = await engine.captureFrame();
      return shot ? { data: Array.from(shot.rgba), width: shot.width, height: shot.height } : null;
    }
    const c = document.createElement('canvas');
    c.width = engine.canvas.width;
    c.height = engine.canvas.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(engine.canvas, 0, 0);
    const img = ctx.getImageData(0, 0, c.width, c.height);
    return { data: Array.from(img.data), width: c.width, height: c.height };
  }
`;
async function frame(objectives, groups) {
  await page.evaluate(
    async ([objectives, groups, n]) => {
      const { useObjectivesStore } = await import('/src/state/objectivesStore.ts');
      useObjectivesStore.getState().setOn(objectives);
      const s = globalThis.__3dheat.useStore.getState();
      for (let i = 0; i < n; i++) s.toggleTeam(i, groups);
      globalThis.__3dheat_engine.invalidate?.(4);
    },
    [objectives, groups, info.teams],
  );
  await page.waitForTimeout(2500);
  return page.evaluate(`(${READ_FRAME})()`);
}

const off = await frame(false, true);
const bare = await frame(false, false);
const on = await frame(true, true);
const zoneOnly = await frame(true, false);
let units = 0;
let covered = 0;
let zone = 0;
const { width, height } = off;
const d = (a, b, i) => Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]);
// A unit's own pixels, not its edges: a pixel and its four neighbours all differ from the empty frame.
const unit = (x, y) => x > 0 && y > 0 && x < width - 1 && y < height - 1 && d(off, bare, (y * width + x) * 4) > 24;
for (let y = 0; y < height; y++)
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    if (d(on, off, i) > 9 && d(zoneOnly, bare, i) > 9) zone++;
    if (!(unit(x, y) && unit(x - 1, y) && unit(x + 1, y) && unit(x, y - 1) && unit(x, y + 1))) continue;
    units++;
    if (d(on, off, i) > 9) covered++;
  }
console.log(`zone pixels ${zone}, unit pixels ${units}, of them changed by the zone ${covered} (${((100 * covered) / Math.max(1, units)).toFixed(1)}%)`);
const ok = zone > 1000 && units > 50 && covered / units < 0.005;
console.log(`  ${ok ? 'ok  ' : 'FAIL'} the units are drawn over the objectives, not under them`);
await browser.close();
process.exit(ok ? 0 : 1);
