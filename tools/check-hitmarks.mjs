/**
 * Rendered check of hit marks (src/figures/hitmarks.ts): a shot that struck
 * a unit is marked on it from the moment of the hit, in its outcome's colour
 * (a critical hit blue, the killing shot magenta ringed in white), the
 * pointer over the mark finds that hit, and the mark is gone once its time
 * has passed. On both track paths (CPU figures, GPU tracks) and, with
 * --webgpu, on both backends.
 *
 * Synthetic data only: two tanks standing apart; the blue one hits the red
 * one at 20 s (a critical hit) and kills it at 40 s. Starts its own dev
 * server on port 5299 and renders in software (SwiftShader).
 *
 *   node tools/check-hitmarks.mjs                 WebGL2
 *   node tools/check-hitmarks.mjs --webgpu        also WebGPU
 *   --url=http://127.0.0.1:5299/   against a server already running
 *   --port=<n>                     its own server on another port
 *   --shot=<dir>                   save the frames looked at
 *
 * The pure half (the window, the fade, the colours) is
 * src/figures/hitmarks.test.ts.
 */
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const argv = process.argv.slice(2);
const opt = (name) => argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? null;
const PORT = Number(opt('port') ?? 5299);
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
  console.log(`  ${pass === null ? 'info' : pass ? 'ok  ' : 'FAIL'} hit marks / ${setting}: ${detail}`);
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

/** Two tanks 40 m apart, facing +x, sampled twice a second for a minute; the blue one hits the red one at 20 s and 40 s. */
async function loadTanks(page) {
  return page.evaluate(() => {
    // ev: 0 position, 1 shot, 2 hit_critical, 3 death.
    const rows = [];
    for (let p = 0; p < 2; p++) for (let t = 0; t <= 60; t += 0.5) rows.push({ p, t, ev: 0 });
    rows.push({ p: 0, t: 20, ev: 1 }, { p: 1, t: 20.05, ev: 2 }, { p: 0, t: 40, ev: 1 }, { p: 1, t: 40.1, ev: 3 });
    rows.sort((a, b) => a.t - b.t || a.ev - b.ev);
    const n = rows.length;
    const X = [-20, 20];
    const cat = (name, vals, of) => ({ name, kind: 'category', data: Uint32Array.from(rows, of), min: 0, max: vals.length - 1, categories: vals });
    const num = (name, of) => ({ name, kind: 'number', data: Float32Array.from(rows, of), min: 0, max: 1 });
    const shot = (r) => r.ev === 1;
    const s = globalThis.__3dheat.useStore.getState();
    s.setLevel?.(null);
    s.setDataset({
      id: 'visual-hitmarks', name: 'hit mark check', count: n,
      px: Float32Array.from(rows, (r) => X[r.p]), py: new Float32Array(n), pz: new Float32Array(n),
      time: Float32Array.from(rows, (r) => r.t), epochMs: null, lifetime: null, maxLifetimeGap: 0, personShared: null,
      yaw: Float32Array.from(rows, () => Math.PI / 2), pitch: new Float32Array(n),
      personId: Uint32Array.from(rows, (r) => r.p), teamId: Uint16Array.from(rows, (r) => r.p),
      personLabels: ['blue tank', 'red tank'], teamLabels: ['blue', 'red'],
      sessionId: null, sessionLabels: [], sessionRows: null, sessionStart: null, sessionEnd: null,
      personTeam: Uint16Array.of(0, 1), personSlot: null, teamSizes: Uint32Array.of(1, 1),
      attrs: [
        cat('kind', ['tank'], () => 0),
        cat('event', ['position', 'shot', 'hit_critical', 'death'], (r) => r.ev),
        cat('player', ['blue tank', 'red tank'], (r) => r.p),
        cat('Vehicle', ['tank-blue', 'tank-red'], (r) => r.p),
        cat('other', ['', 'red tank', 'blue tank'], (r) => (shot(r) ? 1 : r.ev >= 2 ? 2 : 0)),
        cat('otherVehicle', ['', 'tank-red'], (r) => (shot(r) ? 1 : 0)),
        // On the red tank's roof, a little forward of its middle, on the side towards the camera.
        num('hitLocalX', (r) => (shot(r) ? 0.5 : NaN)),
        num('hitLocalY', (r) => (shot(r) ? 2.2 : NaN)),
        num('hitLocalZ', (r) => (shot(r) ? 0.8 : NaN)),
      ],
      warnings: [],
      bounds: { minX: -30, minY: 0, minZ: -10, maxX: 30, maxY: 4, maxZ: 10 },
      timeRange: [0, 60], timeSorted: true,
    });
    s.setMode('team');
    s.patchTimeline({ mode: 'play', window: 'cumulative', playing: false, speed: 1 });
    s.patchTeam({ trailSeconds: 0, figureScale: 1, showLookDirection: false, fires: false, weapons: false, hitMarks: true, hitMarkSeconds: 10 });
    if (globalThis.__3dheat.useStore.getState().showGrid) s.toggle('showGrid');
    globalThis.__3dheat_replay.getState().setDropLines?.(false);
  });
}

/**
 * At playhead `t`, round the red tank: how many pixels are near each colour
 * asked for, and what the pointer over the mark finds.
 */
async function look(page, t, want, height = 30) {
  return page.evaluate(async ({ t, want, height }) => {
    const eng = globalThis.__3dheat_engine;
    const st = globalThis.__3dheat.useStore;
    st.getState().seek(t);
    eng.placeCamera({ x: 20, y: height, z: height * 0.8 }, { x: 20, y: 0, z: 0 });
    for (let i = 0; i < 12; i++) {
      eng.invalidate(2);
      await new Promise((r) => requestAnimationFrame(() => r()));
    }
    const f = await eng.captureFrame();
    if (!f) return null;
    const sx = f.width / eng.canvas.clientWidth;
    const p = eng.project(20, 1, 0);
    if (!p) return null;
    const r = 70;
    const counts = want.map(() => 0);
    for (let y = Math.max(0, Math.floor((p.y - r) * sx)); y <= Math.min(f.height - 1, Math.ceil((p.y + r) * sx)); y++) {
      for (let x = Math.max(0, Math.floor((p.x - r) * sx)); x <= Math.min(f.width - 1, Math.ceil((p.x + r) * sx)); x++) {
        const i = (y * f.width + x) * 4;
        const px = [f.rgba[i], f.rgba[i + 1], f.rgba[i + 2]];
        want.forEach((w, k) => {
          // Hue near: the colour's channels in the same order and spread, whatever the light.
          const m = Math.max(...px);
          if (m < 60) return;
          // White: bright in every channel (a grey ground is the same hue, not as bright).
          if (w[0] === w[1] && w[1] === w[2]) {
            if (Math.min(...px) > 200) counts[k]++;
            return;
          }
          const a = px.map((v) => v / m);
          const b = w.map((v) => v / Math.max(...w));
          if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < 0.35) counts[k]++;
        });
      }
    }
    // The pointer over the mark: where the hit point is drawn.
    const dr = eng.hitMarkLayer?.drawn;
    let found = -1;
    if (dr && dr.count > 0) {
      const s = eng.toScreen(dr.xyz[0], dr.xyz[1], dr.xyz[2]);
      if (s) found = eng.hitMarkAt(s[0], s[1]);
    }
    return { counts, drawn: dr ? dr.count : -1, found };
  }, { t, want, height });
}

// The outcome colours of src/vehicle/scene.ts.
const CRITICAL = [0.15, 0.55, 1.0];
const KILL = [1.0, 0.17, 0.84];
const WHITE = [1, 1, 1];

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
      const before = await look(page, 19, [CRITICAL, KILL]);
      const hit = await look(page, 21, [CRITICAL, KILL]);
      if (opt('shot')) await page.screenshot({ path: `${opt('shot')}/hitmarks-${backend}-${path}-critical.png` });
      const gone = await look(page, 32, [CRITICAL, KILL]);
      const kill = await look(page, 41, [KILL, WHITE]);
      if (opt('shot')) await page.screenshot({ path: `${opt('shot')}/hitmarks-${backend}-${path}-kill.png` });
      if (!before || !hit || !gone || !kill) {
        report(name, false, 'nothing drawn to read');
        continue;
      }
      report(`${name}, critical hit`, before.counts[0] === 0 && before.drawn === 0 && hit.drawn === 1 && hit.counts[0] >= 6 && hit.counts[1] === 0,
        `before ${before.drawn} marks, ${before.counts[0]} blue px; at 21 s ${hit.drawn} mark, ${hit.counts[0]} critical-blue px, ${hit.counts[1]} magenta px`);
      report(`${name}, pointer`, hit.found >= 0, `the pointer over the mark finds hit ${hit.found}`);
      report(`${name}, gone after 10 s`, gone.drawn === 0 && gone.counts[0] === 0, `at 32 s ${gone.drawn} marks, ${gone.counts[0]} blue px`);
      report(`${name}, killing shot`, kill.drawn === 1 && kill.counts[0] >= 4 && kill.counts[1] >= 4, `at 41 s ${kill.drawn} mark, ${kill.counts[0]} magenta px, ${kill.counts[1]} white px`);
    } finally {
      await browser.close();
    }
  }
}

const failed = results.filter((r) => r === false).length;
console.log(failed ? `${failed} failed` : 'all passed');
process.exit(failed ? 1 : 0);
