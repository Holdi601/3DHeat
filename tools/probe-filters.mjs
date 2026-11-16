/**
 * Do many filters apply at once, and what does changing them cost?
 *
 * Filters used to be capped at four shader slots; the rest were ignored. Now
 * every active filter is folded into one pass bit a row (WebGL2: a pass byte
 * per chunk built on the GPU; WebGPU: a loop over one filter table). This loads
 * a synthetic dataset with ten category columns of two values each and two
 * numeric columns, then:
 *
 *   1. correctness - allows value 0 on k category columns, k = 0..10, and
 *      compares the mean heat against 1 / 2^k of the unfiltered mean. With a
 *      cap of four, k = 8 would read 1/16 rather than 1/256;
 *   2. "everything" filters - every value ticked is no filter: same heat as none;
 *   3. cost - toggles one filter every few frames with ten active, and reports
 *      the frame intervals (p50 / p99 / max) against a steady baseline, and the
 *      interval of the frame each change landed in.
 *
 *   node tools/probe-filters.mjs [url] [rows]
 *   PROBE_GPU=1 node tools/probe-filters.mjs ...   real GPU (d3d11), not SwiftShader
 */
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:5273/?backend=webgl2';
const ROWS = Number(process.argv[3] ?? 10_000_000);
const wantWebgpu = /backend=webgpu/.test(url);
const realGpu = process.env.PROBE_GPU === '1';

const args = realGpu
  ? ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-webgpu', '--disable-gpu-vsync', '--disable-frame-rate-limit']
  : wantWebgpu
    ? ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--disable-vulkan-surface', '--use-webgpu-adapter=swiftshader', '--ignore-gpu-blocklist']
    : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const browser = await chromium.launch({ ...(wantWebgpu || realGpu ? { channel: 'chromium' } : {}), args });
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
page.on('console', (m) => {
  if (m.type() === 'error') console.log('  console:', m.text());
});
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180_000 });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 60_000 });
const gpuName = await page.evaluate(() => {
  const gl = document.createElement('canvas').getContext('webgl2');
  const ext = gl?.getExtension('WEBGL_debug_renderer_info');
  return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown';
});
const backend = await page.evaluate(() => globalThis.__3dheat_engine.renderer.kind);
console.log(`${(ROWS / 1e6).toFixed(1)}M rows, ${backend}, ${gpuName}\n`);

const COLS = 10;
await page.evaluate(
  ({ rows, cols }) => {
    const px = new Float32Array(rows);
    const py = new Float32Array(rows);
    const pz = new Float32Array(rows);
    const attrs = [];
    for (let i = 0; i < rows; i++) {
      px[i] = (Math.random() - 0.5) * 2000;
      py[i] = Math.random() * 20;
      pz[i] = (Math.random() - 0.5) * 2000;
    }
    for (let c = 0; c < cols; c++) {
      const data = new Float32Array(rows);
      for (let i = 0; i < rows; i++) data[i] = Math.random() < 0.5 ? 0 : 1;
      attrs.push({ name: `cat${c}`, kind: 'category', data, min: 0, max: 1, categories: ['a', 'b'] });
    }
    for (let c = 0; c < 2; c++) {
      const data = new Float32Array(rows);
      for (let i = 0; i < rows; i++) data[i] = Math.random() * 100;
      attrs.push({ name: `num${c}`, kind: 'number', data, min: 0, max: 100 });
    }
    const s = globalThis.__3dheat.useStore.getState();
    s.setDataset({
      id: 'filters', name: 'filter probe', count: rows, px, py, pz,
      time: null, epochMs: null, lifetime: null, maxLifetimeGap: 0,
      yaw: null, pitch: null, personId: null, teamId: null,
      personLabels: [], teamLabels: [], personTeam: null, personSlot: null,
      teamSizes: null, attrs, warnings: [],
      bounds: { minX: -1000, minY: 0, minZ: -1000, maxX: 1000, maxY: 20, maxZ: 1000 },
      timeRange: [0, 0], timeSorted: true,
    });
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all', playing: false });
    s.patchHeat({ radius: 8, centerIntensity: 1, response: 'linear' });
  },
  { rows: ROWS, cols: COLS },
);
await page.waitForTimeout(6000);
await page.evaluate(() => {
  const eng = globalThis.__3dheat_engine;
  eng.applyPreset('Top');
  eng.frameDataset(true);
});
await page.waitForTimeout(3000);

const setFilters = (specs) => page.evaluate((f) => globalThis.__3dheat.useStore.getState().setFilters(f), specs);
const meanHeat = () =>
  page.evaluate(async () => {
    // Null while another read (auto-exposure) is in flight: try again.
    let raw = null;
    for (let i = 0; i < 50 && !raw; i++) {
      raw = await globalThis.__3dheat_engine.renderer.readHeatField(200000);
      if (!raw) await new Promise((r) => setTimeout(r, 50));
    }
    if (!raw) return NaN;
    let sum = 0;
    for (const v of raw) sum += v;
    return sum / raw.length;
  });
const settle = async () => {
  // Converged, not a single stochastic estimate.
  await page.waitForTimeout(2500);
  const a = await meanHeat();
  await page.waitForTimeout(500);
  const b = await meanHeat();
  return (a + b) / 2;
};
const only0 = (k) => Array.from({ length: k }, (_, c) => ({ kind: 'categories', column: `cat${c}`, allowed: [0] }));

console.log('1. correctness: value 0 on k columns');
await setFilters([]);
const base = await settle();
let bad = 0;
for (const k of [1, 2, 4, 5, 6, 8, 10]) {
  await setFilters(only0(k));
  const m = await settle();
  const ratio = base > 0 ? m / base : NaN;
  const want = 1 / 2 ** k;
  const ok = Math.abs(Math.log2(ratio / want)) < 0.5;
  if (!ok) bad++;
  console.log(`   k=${String(k).padStart(2)}  heat ${ratio.toExponential(2)}  expected ${want.toExponential(2)}  ${ok ? 'ok' : 'WRONG'}`);
}
// Ranges on top of ten category filters: about a quarter of what is left.
await setFilters([...only0(6), { kind: 'range', column: 'num0', min: 0, max: 50 }, { kind: 'range', column: 'num1', min: 50, max: 100 }]);
{
  const m = await settle();
  const ratio = m / base;
  const want = 1 / 2 ** 8;
  const ok = Math.abs(Math.log2(ratio / want)) < 0.5;
  if (!ok) bad++;
  console.log(`   6 categories + 2 ranges  heat ${ratio.toExponential(2)}  expected ${want.toExponential(2)}  ${ok ? 'ok' : 'WRONG'}`);
}

console.log('\n2. every value ticked is no filter');
await setFilters(Array.from({ length: COLS }, (_, c) => ({ kind: 'categories', column: `cat${c}`, allowed: [0, 1] })));
{
  const m = await settle();
  const ok = Math.abs(Math.log2(m / base)) < 0.2;
  if (!ok) bad++;
  console.log(`   heat ${(m / base).toFixed(3)} of unfiltered  ${ok ? 'ok' : 'WRONG'}`);
}

console.log('\n3. cost of toggling with ten filters active');
const timing = await page.evaluate(
  async ({ cols }) => {
    const s = globalThis.__3dheat.useStore.getState();
    const spec = (c, allowed) => ({ kind: 'categories', column: `cat${c}`, allowed });
    const all = Array.from({ length: cols }, (_, c) => spec(c, [0]));
    s.setFilters(all);
    await new Promise((r) => setTimeout(r, 1500));
    const record = (frames, onFrame) =>
      new Promise((resolve) => {
        const dts = [];
        const changed = [];
        let last = performance.now();
        let n = 0;
        const tick = (now) => {
          dts.push(now - last);
          last = now;
          if (onFrame && onFrame(n)) changed.push(dts.length);
          if (++n < frames) requestAnimationFrame(tick);
          else resolve({ dts, changed });
        };
        requestAnimationFrame(tick);
      });
    const steady = await record(300, null);
    let flip = false;
    const toggling = await record(600, (n) => {
      if (n % 6 !== 0) return false;
      flip = !flip;
      // A single toggle, then All, then None on another column: the three a user does.
      const which = (n / 6) % cols;
      const next = all.slice();
      next[which] = spec(which, flip ? [1] : [0]);
      if (n % 18 === 0) next[(which + 1) % cols] = spec((which + 1) % cols, [0, 1]);
      s.setFilters(next);
      return true;
    });
    return { steady: steady.dts.slice(5), toggling: toggling.dts.slice(5), changed: toggling.changed.map((i) => toggling.dts[i]).filter((v) => v !== undefined) };
  },
  { cols: COLS },
);
const stats = (xs) => {
  const v = [...xs].sort((a, b) => a - b);
  const at = (p) => v[Math.min(v.length - 1, Math.floor(p * v.length))];
  return `p50 ${at(0.5).toFixed(1)}  p99 ${at(0.99).toFixed(1)}  max ${v[v.length - 1].toFixed(1)} ms`;
};
console.log(`   steady       ${stats(timing.steady)}`);
console.log(`   toggling     ${stats(timing.toggling)}`);
console.log(`   change frame ${stats(timing.changed)}`);

console.log(bad === 0 ? '\nall checks ok' : `\n${bad} check(s) WRONG`);
await browser.close();
process.exit(bad === 0 ? 0 : 1);
