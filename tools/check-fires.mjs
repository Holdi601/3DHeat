/**
 * Rendered check of fires: a unit the data says is on fire (a fire_on row,
 * until its fire_off) is drawn with flames - bright orange - on it from the
 * moment it catches fire until it is out, none before or after; a unit that
 * never burns has none; far off a small glow; the Fires toggle turns them
 * off. On both track paths (CPU figures, GPU tracks) and, with --webgpu, on
 * both backends.
 *
 * Synthetic data only: two tanks standing apart, the blue one burning from
 * 10 s to 40 s at a point on its rear deck. Starts its own dev server on port
 * 5298 and renders in software (SwiftShader).
 *
 *   node tools/check-fires.mjs                 WebGL2
 *   node tools/check-fires.mjs --webgpu        also WebGPU
 *   --url=http://127.0.0.1:5298/   against a server already running
 *   --port=<n>                     its own server on another port
 *   --shot=<dir>                   save the frames looked at
 *
 * The pure half (the fire spans, the flames' geometry) is
 * src/data/fires.test.ts.
 */
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const argv = process.argv.slice(2);
const opt = (name) => argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? null;
const PORT = Number(opt('port') ?? 5298);
const backends = argv.includes('--webgpu') ? ['webgl2', 'webgpu'] : ['webgl2'];

let server = null;
let base = opt('url');
if (!base) {
  base = `http://127.0.0.1:${PORT}/`;
  server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], { stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  server.stdout.on('data', (b) => (log += b));
  server.stderr.on('data', (b) => (log += b));
  const until = Date.now() + 60_000;
  for (;;) {
    try {
      if ((await fetch(base)).ok) {
        // Another server already on the port answers too: this one must still be running.
        await new Promise((r) => setTimeout(r, 1000));
        if (server.exitCode === null) break;
        console.log(`port ${PORT} is taken by another server; pass --port`);
        process.exit(2);
      }
    } catch {
      // Not up yet.
    }
    if (Date.now() > until || server.exitCode !== null) {
      console.log(`dev server on ${PORT} did not start:\n${log}`);
      process.exit(2);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
}
process.on('exit', () => {
  if (server && server.exitCode === null) server.kill();
});

const results = [];
function report(setting, pass, detail) {
  results.push(pass);
  console.log(`  ${pass === null ? 'info' : pass ? 'ok  ' : 'FAIL'} fires / ${setting}: ${detail}`);
}

async function open(backend, query) {
  const browser = await chromium.launch({
    ...(backend === 'webgpu' ? { channel: 'chromium' } : {}),
    args:
      backend === 'webgpu'
        ? ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--disable-vulkan-surface', '--use-webgpu-adapter=swiftshader', '--ignore-gpu-blocklist']
        : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 900, height: 560 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('  pageerror:', e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') console.log('  console:', m.text().slice(0, 200));
  });
  // Other work edits the sources meanwhile: no hot reload mid-check.
  await page.routeWebSocket(/./, () => {});
  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {
      // The defaults are what a private context has anyway.
    }
  });
  await page.goto(`${base}?backend=${backend}${query}`, { waitUntil: 'domcontentloaded', timeout: 180_000 });
  await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine && globalThis.__3dheat), null, { timeout: 180_000 });
  await page.waitForTimeout(1500);
  return { browser, page };
}

/** Two tanks 40 m apart, sampled twice a second for a minute; the blue one burns from 10 s to 40 s. */
async function loadTanks(page) {
  return page.evaluate(() => {
    const rows = [];
    for (let p = 0; p < 2; p++) {
      for (let t = 0; t <= 60; t += 0.5) rows.push({ p, t, ev: 0 });
    }
    rows.push({ p: 0, t: 10, ev: 1 }, { p: 0, t: 40, ev: 2 });
    rows.sort((a, b) => a.t - b.t || a.ev - b.ev);
    const n = rows.length;
    const X = [-20, 20];
    const s = globalThis.__3dheat.useStore.getState();
    s.setLevel?.(null);
    s.setDataset({
      id: 'visual-fires', name: 'fire check', count: n,
      px: Float32Array.from(rows, (r) => X[r.p]), py: new Float32Array(n), pz: new Float32Array(n),
      time: Float32Array.from(rows, (r) => r.t), epochMs: null, lifetime: null, maxLifetimeGap: 0, personShared: null,
      yaw: Float32Array.from(rows, () => Math.PI / 2), pitch: new Float32Array(n),
      personId: Uint32Array.from(rows, (r) => r.p), teamId: Uint16Array.from(rows, (r) => r.p),
      personLabels: ['blue tank', 'red tank'], teamLabels: ['blue', 'red'],
      sessionId: null, sessionLabels: [], sessionRows: null, sessionStart: null, sessionEnd: null,
      personTeam: Uint16Array.of(0, 1), personSlot: null, teamSizes: Uint32Array.of(1, 1),
      attrs: [
        { name: 'kind', kind: 'category', data: new Uint32Array(n), min: 0, max: 0, categories: ['tank'] },
        { name: 'event', kind: 'category', data: Uint32Array.from(rows, (r) => r.ev), min: 0, max: 2, categories: ['position', 'fire_on', 'fire_off'] },
        { name: 'fireId', kind: 'category', data: Uint32Array.from(rows, (r) => (r.ev ? 1 : 0)), min: 0, max: 1, categories: ['', '1:2'] },
        { name: 'fireLocalX', kind: 'number', data: Float32Array.from(rows, (r) => (r.ev ? -2 : NaN)), min: -2, max: -2 },
        { name: 'fireLocalY', kind: 'number', data: Float32Array.from(rows, (r) => (r.ev ? 1.5 : NaN)), min: 1.5, max: 1.5 },
        { name: 'fireLocalZ', kind: 'number', data: Float32Array.from(rows, (r) => (r.ev ? 0 : NaN)), min: 0, max: 0 },
      ],
      warnings: [],
      bounds: { minX: -30, minY: 0, minZ: -10, maxX: 30, maxY: 4, maxZ: 10 },
      timeRange: [0, 60], timeSorted: true,
    });
    s.setMode('team');
    s.patchTimeline({ mode: 'play', window: 'cumulative', playing: false, speed: 1 });
    s.patchTeam({ trailSeconds: 0, figureScale: 1, showLookDirection: false, fires: true });
    if (globalThis.__3dheat.useStore.getState().showGrid) s.toggle('showGrid');
    globalThis.__3dheat_replay.getState().setDropLines?.(false);
  });
}

/** At playhead `t`: per tank, how many flame-coloured pixels (bright orange to yellow) are drawn on and above it. */
async function flames(page, t, height = 40) {
  return page.evaluate(async ({ t, height }) => {
    const eng = globalThis.__3dheat_engine;
    const st = globalThis.__3dheat.useStore;
    st.getState().seek(t);
    eng.placeCamera({ x: 0, y: height * 0.5, z: height }, { x: 0, y: 2, z: 0 });
    for (let i = 0; i < 12; i++) {
      eng.invalidate(2);
      await new Promise((r) => requestAnimationFrame(() => r()));
    }
    const f = await eng.captureFrame();
    if (!f) return null;
    const sx = f.width / eng.canvas.clientWidth;
    return [-20, 20].map((x) => {
      const p = eng.project(x, 3, 0);
      if (!p) return null;
      const r = height > 100 ? 14 : 70;
      let n = 0;
      for (let y = Math.max(0, Math.floor((p.y - r) * sx)); y <= Math.min(f.height - 1, Math.ceil((p.y + r) * sx)); y++) {
        for (let xx = Math.max(0, Math.floor((p.x - r) * sx)); xx <= Math.min(f.width - 1, Math.ceil((p.x + r) * sx)); xx++) {
          const i = (y * f.width + xx) * 4;
          const R = f.rgba[i], G = f.rgba[i + 1], B = f.rgba[i + 2];
          if (R > 190 && G > 60 && G < 235 && B < 0.55 * G && R > G + 25) n++;
        }
      }
      return n;
    });
  }, { t, height });
}

for (const backend of backends) {
  for (const path of ['cpu', 'gpu']) {
    const { browser, page } = await open(backend, `&gputracks=${path === 'gpu' ? 1 : 0}`);
    try {
      await loadTanks(page);
      await page.waitForTimeout(2500);
      const info = await page.evaluate(() => globalThis.__3dheat_engine.gpuTracksInfo());
      const name = `${backend} ${path === 'gpu' ? 'GPU tracks' : 'CPU figures'}`;
      if (path === 'gpu' && !info) {
        report(name, null, 'GPU tracks not active on this backend; skipped');
        continue;
      }
      const shot = async (what) => opt('shot') && (await page.screenshot({ path: `${opt('shot')}/fires-${backend}-${path}-${what}.png` }));
      const before = await flames(page, 5);
      await shot('before');
      const during = await flames(page, 20);
      await shot('burning');
      const after = await flames(page, 50);
      await shot('out');
      if (!before || !during || !after) {
        report(name, false, 'no frame to read');
        continue;
      }
      const ok = before[0] < 15 && during[0] > 30 && after[0] < 15 && during[1] < 15;
      report(name, ok, `blue tank flame pixels before ${before[0]}, burning ${during[0]}, out ${after[0]}; red tank (never burns) ${during[1]}`);
      const far = await flames(page, 20, 700);
      await shot('glow');
      report(`${name}, far off`, !!far && far[0] > 0 && far[1] === 0, `glow pixels blue ${far?.[0]}, red ${far?.[1]}`);
      await page.evaluate(() => globalThis.__3dheat.useStore.getState().patchTeam({ fires: false }));
      const offed = await flames(page, 20);
      report(`${name}, toggle off`, !!offed && offed[0] < 15, `flame pixels with Fires off ${offed?.[0]}`);
    } finally {
      await browser.close();
    }
  }
}

const failed = results.filter((r) => r === false).length;
console.log(failed ? `${failed} failed` : 'all passed');
process.exit(failed ? 1 : 0);
