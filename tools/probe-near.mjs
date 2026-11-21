/**
 * Does the near plane leave what is right in front of the camera alone, and does
 * the depth buffer still tell two surfaces apart far off?
 *
 * Reverse-Z (src/render/depth.ts) is what lets the near plane sit centimetres
 * from the eye: a classic 24-bit buffer needed it metres out on a large map, and
 * that cut the ground and walls the camera flew along. So, on a level the size of
 * a big game map (60 km across):
 *
 *   1. a wall half a metre in front of the camera must be drawn;
 *   2. two walls 20 km away, one metre apart, must not fight: the nearer one
 *      wins every pixel, and none of the further one's shade shows through.
 *
 * Software rendering (SwiftShader), so it puts no load on the GPU.
 *
 *   node tools/probe-near.mjs [url]
 *   node tools/probe-near.mjs "http://127.0.0.1:5273/?backend=webgl2&depth=classic"   the fallback layout
 *
 * The classic layout (WebGL2 without EXT_clip_control) fails both, by design of
 * the buffer: its near plane is far / 10^5 (1.8 m here), and even so the far
 * walls fight. That is the picture reverse-Z replaced; the run shows it.
 */
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:5273/?backend=webgl2';
const wantWebgpu = /backend=webgpu/.test(url);
const browser = await chromium.launch({
  ...(wantWebgpu ? { channel: 'chromium' } : {}),
  args: wantWebgpu
    ? ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--disable-vulkan-surface', '--use-webgpu-adapter=swiftshader', '--ignore-gpu-blocklist']
    : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1000, height: 640 } });
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
// Other work edits the sources meanwhile; a hot reload would restart the page mid-probe.
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

const HALF = 30_000;
/** The level: the ground, the near wall, the far wall and, when `back`, the wall a metre behind it. */
async function build(back) {
  await page.evaluate(
    ([HALF, back]) => {
      const h = globalThis.__3dheat;
      const v = [];
      const idx = [];
      const quad = (corners, n) => {
        const base = v.length / 6;
        for (const c of corners) v.push(...c, ...n);
        idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
      };
      // The ground, 60 km across.
      quad([[-HALF, 0, -HALF], [HALF, 0, -HALF], [HALF, 0, HALF], [-HALF, 0, HALF]], [0, 1, 0]);
      // Half a metre ahead of a camera at (0, 1.5, 0) looking down -Z: a wall across the middle of the view.
      quad([[-0.2, 1.3, -0.5], [0.2, 1.3, -0.5], [0.2, 1.7, -0.5], [-0.2, 1.7, -0.5]], [0, 0, 1]);
      // 20 km ahead, and a metre behind it one facing up - another shade, which must never show.
      quad([[-3000, 0, -20_000], [3000, 0, -20_000], [3000, 3000, -20_000], [-3000, 3000, -20_000]], [0, 0, 1]);
      if (back) quad([[-3000, 0, -20_001], [3000, 0, -20_001], [3000, 3000, -20_001], [-3000, 3000, -20_001]], [0, 1, 0]);
      h.useStore.getState().setLevel({
        kind: 'model',
        name: 'near probe',
        vertices: new Float32Array(v),
        indices: new Uint32Array(idx),
        structureIndices: new Uint32Array(0),
        triangles: idx.length / 3,
        structureTriangles: 0,
        sourceTriangles: idx.length / 3,
        partNames: ['ground:probe'],
        partClasses: ['ground'],
        partReasons: ['probe'],
        bounds: { minX: -HALF, minY: 0, minZ: -HALF, maxX: HALF, maxY: 3000, maxZ: HALF },
        opacity: 1,
        desaturate: 1,
        brightness: 0.9,
        wireframe: false,
        structureOpacity: 0.25,
        showStructureWire: false,
      });
    },
    [HALF, back],
  );
  await page.waitForTimeout(2000);
}
await page.evaluate(() => {
  const h = globalThis.__3dheat;
  h.load(20_000);
  h.useStore.getState().setMode('heat-simple');
  h.useStore.getState().patchHeat({ intensity: 0 });
});
await page.waitForTimeout(1500);
await build(true);

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
async function look(pos, yaw, pitch) {
  await page.evaluate(
    ([pos, yaw, pitch]) => {
      const e = globalThis.__3dheat_engine;
      e.camera.position.set(pos[0], pos[1], pos[2]);
      e.camera.setOrientationDegrees(yaw, pitch);
      e.camera.moved = true;
    },
    [pos, yaw, pitch],
  );
  await page.waitForTimeout(1500);
  const frame = await page.evaluate(`(${READ_FRAME})()`);
  const info = await page.evaluate(() => ({ near: globalThis.__3dheat_engine.viewNear, reverse: globalThis.__3dheat_engine.renderer?.reverseZ }));
  return { frame, ...info };
}
/** Distinct greys in a box around the centre of the frame, as a histogram of luminance. */
function centre(frame, frac) {
  const { data, width, height } = frame;
  const hist = new Map();
  const x0 = Math.round(width * (0.5 - frac)), x1 = Math.round(width * (0.5 + frac));
  const y0 = Math.round(height * (0.5 - frac)), y1 = Math.round(height * (0.5 + frac));
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      const o = (y * width + x) * 4;
      const l = Math.round((data[o] + data[o + 1] + data[o + 2]) / 3);
      hist.set(l, (hist.get(l) ?? 0) + 1);
    }
  return [...hist.entries()].sort((a, b) => b[1] - a[1]);
}

let fail = 0;
const check = (ok, what) => {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) fail++;
};

// 1. The wall half a metre ahead fills the middle of the frame, a different grey from the ground and sky behind it.
const open = await look([0.6, 1.5, 0], 0, 0);
const near = await look([0, 1.5, 0], 0, 0);
const a = centre(open.frame, 0.04);
const b = centre(near.frame, 0.04);
const changed = b[0][0] !== a[0][0];
console.log(`near plane ${near.near.toFixed(3)} (reverse-Z ${near.reverse}); centre grey without the wall ${a[0][0]}, with it ${b[0][0]}`);
check(changed, 'a wall 0.5 m in front of the camera is drawn, not clipped');

// 2. The pair 20 km off: the same picture with and without the wall behind.
const both = await look([0, 1500, 0], 0, 0);
await build(false);
const alone = await look([0, 1500, 0], 0, 0);
let differ = 0;
let seen = 0;
{
  const { width, height } = both.frame;
  for (let y = Math.round(height * 0.3); y < height * 0.7; y++)
    for (let x = Math.round(width * 0.3); x < width * 0.7; x++) {
      const o = (y * width + x) * 4;
      seen++;
      if (Math.abs(both.frame.data[o] - alone.frame.data[o]) + Math.abs(both.frame.data[o + 1] - alone.frame.data[o + 1]) > 6) differ++;
    }
}
console.log(`20 km off: ${differ} of ${seen} pixels show the wall a metre behind`);
check(differ / seen < 0.001, 'two walls a metre apart 20 km away do not fight for depth');

await browser.close();
process.exit(fail ? 1 : 0);
