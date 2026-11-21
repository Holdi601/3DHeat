/**
 * The two heat paths of the WebGPU renderer side by side: splatting and
 * compute binning (src/render/webgpu/heatBin.ts).
 *
 *   node tools/probe-heat-binning.mjs --parity
 *       Converges a synthetic load with each path, in every mode binning
 *       takes, and compares the heat fields: p50, p90 and p99 of the texels
 *       the splat lit, the total, and SSIM of the fields as displayed. Exits 1
 *       when any case drifts past the gates (1% on the percentiles, SSIM 0.99).
 *
 *   node tools/probe-heat-binning.mjs --perf 20,100 [--backend webgpu|webgl2] [--paths splat,bin]
 *       Frame times under camera motion, zoom, radius change and playback, at
 *       each row count (millions, generated in the page), with the heat pass's
 *       GPU time and the sprites a moving frame drew.
 *
 *   node tools/probe-heat-binning.mjs --perf 300 --dir E:/data/rowceiling
 *       The same from Parquet files of `tools/probe-row-ceiling.mjs` (the
 *       in-page generator cannot hold 300M rows).
 *
 * Needs the dev server on 5273 and a real GPU (full Chromium channel).
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
};
const parity = process.argv.includes('--parity');
const perf = arg('perf', null);
const backend = arg('backend', 'webgpu');
const dir = arg('dir', null);
const paths = arg('paths', backend === 'webgpu' ? 'splat,bin' : 'splat').split(',');
const width = Number(arg('width', parity ? 1280 : 1920));
const height = Number(arg('height', parity ? 800 : 1080));
const secs = Number(arg('seconds', 4));

async function open() {
  const browser = await chromium.launch({
    channel: 'chromium',
    headless: true,
    args: ['--enable-unsafe-webgpu', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=d3d11', '--js-flags=--max-old-space-size=16000'],
  });
  const page = await browser.newPage({ viewport: { width, height } });
  // No hot reload: an edit elsewhere in the tree would reload the page mid-run.
  await page.routeWebSocket(/./, () => {});
  page.on('pageerror', (e) => console.log('pageerror:', e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') console.log(m.type(), m.text().slice(0, 300));
  });
  await page.goto(`http://127.0.0.1:5273/?backend=${backend}&gpuprof`, { waitUntil: 'domcontentloaded', timeout: 180_000 });
  await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine?.live?.backend && globalThis.__3dheat_engine.live.backend !== 'none'), null, { timeout: 60_000 });
  await page.waitForTimeout(3000);
  return { browser, page };
}

/** Load `rows` synthetic rows in the page, or from Parquet copies in `dir`. */
async function load(page, rows) {
  if (dir) {
    const files = readdirSync(dir).filter((f) => f.endsWith('.parquet')).sort().slice(0, Math.ceil(rows / 10e6)).map((f) => join(dir, f));
    await page.evaluate(() => {
      const i = document.createElement('input');
      i.type = 'file';
      i.multiple = true;
      i.id = 'probe-files';
      i.style.display = 'none';
      document.body.appendChild(i);
    });
    await page.setInputFiles('#probe-files', files);
    return page.evaluate(async () => {
      const { loader } = await import('/src/data/loader.ts');
      const { emptyColumnMapping } = await import('/src/state/types.ts');
      const files = [...document.getElementById('probe-files').files];
      const m = { ...emptyColumnMapping(), x: 'x', y: 'y', z: 'z', time: 'time', personId: 'player', teamId: 'team' };
      m.axes = { ...m.axes, up: 'z' };
      const H = globalThis.__3dheat;
      H.useStore.getState().patchBudget({ gpuBudgetBytes: 13 * 1024 ** 3 });
      const ram = H.useStore.getState().budgets.ram;
      const ds = await loader.ingest(files, m, [], 'probe', 1, files.length * 10_000_000, () => {}, { threads: 4, ram });
      H.useStore.getState().setDataset(ds);
      const live = globalThis.__3dheat_engine.live;
      const until = performance.now() + 600_000;
      while (performance.now() < until && live.residentRows + live.droppedRows < ds.count) await new Promise((r) => setTimeout(r, 200));
      globalThis.__3dheat_engine.frameDataset(true);
      return { rows: ds.count, resident: live.residentRows };
    });
  }
  return page.evaluate(async (rows) => {
    const H = globalThis.__3dheat;
    const s = H.useStore.getState();
    s.patchBudget({ gpuBudgetBytes: 13 * 1024 ** 3 });
    const ds = H.generateSynthetic({ ...H.DEFAULT_SYNTH, rows });
    s.setDataset(ds);
    const live = globalThis.__3dheat_engine.live;
    const until = performance.now() + 300_000;
    while (performance.now() < until && live.residentRows + live.droppedRows < ds.count) await new Promise((r) => requestAnimationFrame(r));
    globalThis.__3dheat_engine.frameDataset(true);
    await new Promise((r) => setTimeout(r, 1000));
    return { rows: ds.count, resident: live.residentRows };
  }, rows);
}

// ---------------------------------------------------------------- parity

function quantile(sorted, q) {
  return sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] : 0;
}

/** Mean SSIM over 8x8 windows (stride 4) that hold any heat, of `t = v / (v + k)`: the field as the ramp shows it. */
function ssim(a, b, w, h, k) {
  const map = (v) => {
    const x = Math.abs(v);
    return x / (x + k);
  };
  const C1 = 0.01 ** 2;
  const C2 = 0.03 ** 2;
  let sum = 0;
  let n = 0;
  for (let y = 0; y + 8 <= h; y += 4) {
    for (let x = 0; x + 8 <= w; x += 4) {
      let ma = 0, mb = 0, any = false;
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
        const p = (y + j) * w + x + i;
        const va = map(a[p]);
        const vb = map(b[p]);
        if (va > 0 || vb > 0) any = true;
        ma += va;
        mb += vb;
      }
      if (!any) continue;
      ma /= 64;
      mb /= 64;
      let sa = 0, sb = 0, sab = 0;
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
        const p = (y + j) * w + x + i;
        const da = map(a[p]) - ma;
        const db = map(b[p]) - mb;
        sa += da * da;
        sb += db * db;
        sab += da * db;
      }
      sa /= 63;
      sb /= 63;
      sab /= 63;
      sum += ((2 * ma * mb + C1) * (2 * sab + C2)) / ((ma * ma + mb * mb + C1) * (sa + sb + C2));
      n++;
    }
  }
  return n ? sum / n : 1;
}

function compare(ref, got, w, h, ch) {
  // Channel 0, the density, in every mode; the group colour sums too where there are four.
  const out = {};
  for (let c = 0; c < ch; c++) {
    const a = new Float32Array(w * h);
    const b = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      a[i] = ref[i * ch + c];
      b[i] = got[i * ch + c];
    }
    const lit = [];
    const litB = [];
    let ta = 0, tb = 0;
    for (let i = 0; i < a.length; i++) {
      ta += a[i];
      tb += b[i];
      if (a[i] !== 0) {
        lit.push(Math.abs(a[i]));
        litB.push(Math.abs(b[i]));
      }
    }
    lit.sort((x, y) => x - y);
    litB.sort((x, y) => x - y);
    const rel = (x, y) => (x === 0 && y === 0 ? 0 : Math.abs(y - x) / Math.max(1e-30, Math.abs(x)));
    const q = (p) => ({ ref: quantile(lit, p), got: quantile(litB, p), err: rel(quantile(lit, p), quantile(litB, p)) });
    const p90 = quantile(lit, 0.9);
    out[c] = { p50: q(0.5), p90: q(0.9), p99: q(0.99), total: rel(ta, tb), ssim: ssim(a, b, w, h, Math.max(1e-30, p90)), lit: lit.length };
  }
  return out;
}

const CASES = [
  { name: 'heat, perspective', setup: {} },
  { name: 'heat, orthographic', setup: { camera: { projection: 'orthographic' } } },
  { name: 'heat, radius 30 (list + fold)', setup: { heat: { radius: 30 } } },
  { name: 'heat, radius 2', setup: { heat: { radius: 2 } } },
  { name: 'heat, radius 150 (list)', setup: { heat: { radius: 150 } } },
  // Radii the clamps hold: every sprite at the floor, or at the ceiling.
  { name: 'heat, min clamp 3 px', setup: { heat: { radius: 0.5, minPixelRadius: 3 } } },
  { name: 'heat, max clamp 1.5 px', setup: { heat: { radius: 30, maxPixelRadius: 1.5 } } },
  { name: 'heat, not zoom invariant', setup: { heat: { radius: 0.5, minPixelRadius: 2, zoomInvariant: false } } },
  { name: 'heat, hard disc, linear', setup: { heat: { edgeIntensity: 0.4, falloff: 1, smoothRamp: false } } },
  { name: 'heat, curve ramp', setup: { heat: { useCurve: true } } },
  { name: 'heat, ground projected', setup: { heat: { groundProjected: true } } },
  { name: 'heat, half resolution', setup: { budget: { heatScale: 0.5 } } },
  { name: 'team colours', setup: { mode: 'heat-teams' } },
  { name: 'difference', setup: { mode: 'heat-difference', split: true } },
  { name: 'difference, one side', setup: { mode: 'heat-difference', split: [[0, 1, 2, 3, 4, 5, 6, 7], []] } },
  { name: 'difference, orthographic', setup: { mode: 'heat-difference', split: true, camera: { projection: 'orthographic' } } },
  { name: 'difference, sides normalised', setup: { mode: 'heat-difference', split: true, heat: { splitShares: true } } },
  { name: 'heat, behind a wall', setup: { wall: true } },
  { name: 'team colours, behind a wall', setup: { wall: true, mode: 'heat-teams' } },
  { name: 'heat, behind a wall, radius 30', setup: { wall: true, heat: { radius: 30 } } },
  { name: 'heat, fixed window', setup: { window: 'fixed' } },
  { name: 'heat, lifetime fade', setup: { window: 'lifetime' } },
];

async function runParity() {
  const { browser, page } = await open();
  const rows = Number(arg('rows', 4)) * 1e6;
  const loaded = await load(page, rows);
  await page.waitForFunction(() => globalThis.__3dheat_engine.renderer.heatBin?.ready, null, { timeout: 60_000 });
  console.log(`parity: ${loaded.rows} synthetic rows, ${width}x${height}, ${backend}`);
  let failed = 0;
  const only = arg('only', null);
  for (const c of CASES.filter((c) => !only || c.name.includes(only))) {
    const r = await page.evaluate(async (setup) => {
      const H = globalThis.__3dheat;
      const eng = globalThis.__3dheat_engine;
      const st = H.useStore.getState();
      const raf = () => new Promise((r) => requestAnimationFrame(r));
      const base = JSON.parse(JSON.stringify({ heat: st.heat, budget: st.budget, camera: st.camera, mode: st.mode, timeline: st.timeline }));
      st.patchBudget({ adaptive: false, exact: true, heatScale: 1, ...(setup.budget ?? {}) });
      if (setup.heat) st.patchHeat(setup.heat);
      if (setup.camera) st.patchCamera(setup.camera);
      if (setup.mode) st.setMode(setup.mode);
      if (setup.split) st.setTeamSplit(...(Array.isArray(setup.split) ? setup.split : [[0, 1, 2, 3], [4, 5, 6, 7]]));
      if (setup.window) {
        const t = st.dataset.time;
        let lo = Infinity, hi = -Infinity;
        for (let i = 0; i < t.length; i += 997) { lo = Math.min(lo, t[i]); hi = Math.max(hi, t[i]); }
        st.patchTimeline({ mode: 'play', window: setup.window, windowSeconds: (hi - lo) * 0.2, fadeOut: 0.5, defaultLifetime: 2 });
        st.seek(lo + (hi - lo) * 0.5);
      }
      if (setup.wall) {
        // Two walls crossing in the middle of the data, structures: what is behind them dims.
        const b = st.dataset.bounds;
        const x = (b.minX + b.maxX) / 2;
        const z = (b.minZ + b.maxZ) / 2;
        const lo = b.minY - 20;
        const hi = b.maxY + 1500;
        const walls = [
          [[x, lo, b.minZ], [x, lo, b.maxZ], [x, hi, b.maxZ], [x, hi, b.minZ], [1, 0, 0]],
          [[b.minX, lo, z], [b.maxX, lo, z], [b.maxX, hi, z], [b.minX, hi, z], [0, 0, 1]],
        ];
        const v = [];
        for (const w of walls) for (const k of [0, 1, 2, 0, 2, 3]) v.push(...w[k], ...w[4]);
        st.setLevel({
          kind: 'model', name: 'walls', vertices: new Float32Array(v), indices: new Uint32Array(0), structureIndices: new Uint32Array(Array.from({ length: 12 }, (_, i) => i)),
          triangles: 0, structureTriangles: 4, sourceTriangles: 4, partNames: ['structure:walls'], partClasses: ['structure'], partReasons: ['probe'],
          bounds: { minX: b.minX, minY: lo, minZ: b.minZ, maxX: b.maxX, maxY: hi, maxZ: b.maxZ },
          opacity: 1, desaturate: 1, brightness: 0.9, wireframe: false, structureOpacity: 0.25, showStructureWire: false,
        });
        await new Promise((r) => setTimeout(r, 1500));
      }
      if (setup.camera || setup.wall) {
        eng.frameDataset(true);
      }
      const field = async (mode) => {
        eng.renderer.heatBinMode = mode;
        for (let i = 0; i < 6; i++) {
          eng.camera.moved = true;
          eng.invalidate(2);
          await raf();
        }
        for (let i = 0; i < 20; i++) await raf();
        const f = await eng.renderer.readHeatField(0, true);
        return { f: Array.from(f), binned: eng.renderer.heatBinned, w: eng.renderer.heatWidth, h: eng.renderer.heatHeight };
      };
      const splat = await field('off');
      const bin = await field('on');
      const counts = await eng.renderer.heatBin?.readListCounts(64);
      eng.renderer.heatBinMode = 'auto';
      st.patchHeat(base.heat);
      st.patchBudget(base.budget);
      st.patchCamera(base.camera);
      st.setMode(base.mode);
      st.patchTimeline({ mode: base.timeline.mode, window: base.timeline.window, windowSeconds: base.timeline.windowSeconds, fadeOut: base.timeline.fadeOut });
      if (setup.wall) {
        st.setLevel(null);
        await new Promise((r) => setTimeout(r, 500));
      }
      if (setup.camera || setup.wall) eng.frameDataset(true);
      return { splat, bin, counts };
    }, c.setup);
    const { w, h } = r.splat;
    const ch = r.splat.f.length / (w * h);
    if (!r.bin.binned || r.bin.w !== w || r.bin.h !== h) {
      console.log(`  ${c.name}: NOT BINNED (${r.bin.binned}, ${r.bin.w}x${r.bin.h} vs ${w}x${h})`);
      failed++;
      continue;
    }
    const m = compare(r.splat.f, r.bin.f, w, h, ch);
    const f = (v) => (v * 100).toFixed(2) + '%';
    for (const [k, v] of Object.entries(m)) {
      if (k !== '0' && v.lit === 0) continue;
      const bad = (k === '0' && v.lit === 0) || v.p50.err > 0.01 || v.p90.err > 0.01 || v.p99.err > 0.01 || v.ssim < 0.99;
      if (bad) failed++;
      console.log(
        `  ${bad ? 'FAIL' : 'ok  '} ${c.name}${ch > 1 ? ` [ch ${k}]` : ''}: p50 ${f(v.p50.err)} p90 ${f(v.p90.err)} p99 ${f(v.p99.err)} total ${f(v.total)} ssim ${v.ssim.toFixed(4)}` +
          ` (${v.lit} texels, p99 ${v.p99.ref.toPrecision(4)} vs ${v.p99.got.toPrecision(4)})` +
          (r.counts && k === '0' ? `, listed ${r.counts.listed}, overflow ${r.counts.overflow}` : ''),
      );
    }
  }
  await browser.close();
  if (failed) {
    console.log(`${failed} parity check(s) failed`);
    process.exitCode = 1;
  }
}

// ---------------------------------------------------------------- perf

async function runPerf() {
  for (const n of perf.split(',').map(Number)) {
    const { browser, page } = await open();
    try {
      // 0: no data, the browser's own pacing on this machine, for reference.
      const loaded = n > 0 ? await load(page, n * 1e6) : { rows: 1 };
      for (const path of paths) {
        const r = await page.evaluate(async ({ path, secs }) => {
          const H = globalThis.__3dheat;
          const eng = globalThis.__3dheat_engine;
          const st = H.useStore.getState();
          const raf = () => new Promise((r) => requestAnimationFrame(r));
          if (eng.renderer.heatBinMode !== undefined) eng.renderer.heatBinMode = path === 'bin' ? 'auto' : 'off';
          st.patchBudget({ adaptive: true, exact: true, targetFps: 60, heatScale: 1 });
          // The engine's own frame, timed: what the CPU spends, apart from the
          // browser's pacing (which on a loaded machine drops frames by itself).
          if (!eng.__timed) {
            const orig = eng.frame.bind(eng);
            eng.__cpu = [];
            eng.frame = (now) => {
              const t = performance.now();
              orig(now);
              eng.__cpu.push(performance.now() - t);
            };
            eng.__timed = true;
          }
          const PASSES = ['tracks', 'scene', 'structdepth', 'peel', 'heat', 'composite'];
          const run = async (step) => {
            for (let i = 0; i < 60; i++) {
              step(i);
              await raf();
            }
            const dts = [];
            const heat = [];
            const sprites = [];
            let binned = 0;
            let drew = 0;
            const gpu = [];
            eng.__cpu.length = 0;
            const spikes = [];
            let last = performance.now();
            const until = last + secs * 1000;
            for (let i = 60; performance.now() < until; i++) {
              const t0 = performance.now();
              step(i);
              await raf();
              const now = performance.now();
              dts.push(now - last);
              if (now - last > 20 && spikes.length < 6) spikes.push(`${(now - last).toFixed(0)}ms@${i}(step ${(t0 - last).toFixed(0)})`);
              last = now;
              if (eng.lastFrameDrew) drew++;
              const pm = eng.renderer.gpuPassMs ?? {};
              const g = pm.heatLast;
              if (g !== undefined) heat.push(g);
              gpu.push(PASSES.reduce((a, n) => a + (pm[`${n}Last`] ?? 0), 0));
              sprites.push(eng.live.splats);
              if (eng.renderer.heatBinned) binned++;
            }
            dts.sort((a, b) => a - b);
            heat.sort((a, b) => a - b);
            gpu.sort((a, b) => a - b);
            const cpu = eng.__cpu.slice(60).sort((a, b) => a - b);
            const q = (a, p) => (a.length ? a[Math.min(a.length - 1, Math.floor(p * a.length))] : null);
            return { p50: q(dts, 0.5), p99: q(dts, 0.99), max: dts[dts.length - 1], heat50: q(heat, 0.5), heat99: q(heat, 0.99), gpu99: q(gpu, 0.99), gpuMax: gpu[gpu.length - 1], cpu99: q(cpu, 0.99), cpuMax: cpu[cpu.length - 1], sprites: sprites.reduce((a, b) => a + b, 0) / sprites.length, frames: dts.length, binned, drew, spikes: spikes.join(' ') };
          };
          const out = {};
          out.orbit = await run(() => {
            eng.camera.setOrientationDegrees(eng.camera.yawDegrees + 0.3, eng.camera.pitchDegrees);
          });
          out.zoom = await run((i) => {
            const f = eng.camera.forward(eng.camera.position.clone());
            const step = (Math.floor(i / 90) % 2 ? -1 : 1) * eng.camera.position.length() * 0.004;
            eng.camera.position.addScaledVector(f, step);
            eng.camera.moved = true;
            eng.invalidate(2);
          });
          const r0 = st.heat.radius;
          out.radius = await run((i) => {
            st.patchHeat({ radius: r0 * (1 + 0.5 * Math.sin(i / 20)) });
          });
          st.patchHeat({ radius: r0 });
          if (!st.dataset) return out;
          // A window that slides as it plays, so every frame draws.
          const t = st.dataset.time;
          let lo = Infinity, hi = -Infinity;
          for (let i = 0; i < t.length; i += 9973) { lo = Math.min(lo, t[i]); hi = Math.max(hi, t[i]); }
          const tl = { ...st.timeline };
          st.patchTimeline({ mode: 'play', window: 'fixed', windowSeconds: (hi - lo) * 0.5, speed: (hi - lo) / 30, loop: true });
          st.seek(lo + (hi - lo) * 0.5);
          st.patchTimeline({ playing: true });
          out.playback = await run(() => {});
          st.patchTimeline({ playing: false, mode: tl.mode, window: tl.window, windowSeconds: tl.windowSeconds, speed: tl.speed, loop: tl.loop });
          return out;
        }, { path, secs });
        const f = (v) => (v === null || v === undefined ? '-' : v.toFixed(1));
        for (const [k, v] of Object.entries(r)) {
          console.log(
            `${n}M ${backend} ${path} ${k}: frames p50 ${f(v.p50)} p99 ${f(v.p99)} max ${f(v.max)} ms, heat GPU p50 ${f(v.heat50)} p99 ${f(v.heat99)}, ` +
              `GPU frame p99 ${f(v.gpu99)} max ${f(v.gpuMax)}, CPU frame p99 ${f(v.cpu99)} max ${f(v.cpuMax)} ms, ` +
              `${(v.sprites / 1e6).toFixed(2)}M sprites a frame (${((100 * v.sprites) / loaded.rows).toFixed(1)}%), drew ${v.drew} binned ${v.binned}/${v.frames}${v.spikes ? ` spikes ${v.spikes}` : ''}`,
          );
        }
      }
    } finally {
      await browser.close();
    }
  }
}

if (parity) await runParity();
else if (perf) await runPerf();
else console.log('give --parity or --perf <millions,...>');
