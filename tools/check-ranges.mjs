/**
 * Rendered check of the engagement ranges (`src/ranges/`): a rifleman named
 * by the data (shots with an AK-47: 300 m best, 600 m most) stands on open
 * ground with a house 45 m east of him. With the ranges on and him selected:
 * - shells are drawn (the picture changes where they are);
 * - with the line of sight on, the shell behind the house is cut, the one to
 *   the north is not; turned off, the shell behind the house is back;
 * - the ground in front of the house is shaded, the ground behind it is not;
 * - two frames of the paused replay are the same (no flicker);
 * - while he walks, the frame times with the ranges on (p99, max) are compared
 *   with those without (`--gpu`: Edge on this machine's graphics card; in
 *   software they are reported only).
 *
 * Synthetic data and level only. Starts its own dev server (default port 5273).
 *
 *   node tools/check-ranges.mjs [--webgpu] [--gpu] [--port=<n>] [--url=<base>] [--shot=<dir>]
 *
 * The pure half (catalogue, shells, the views' plan and their geometry) is
 * src/ranges/ranges.test.ts.
 */
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const argv = process.argv.slice(2);
const opt = (name) => argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? null;
const PORT = Number(opt('port') ?? 5273);
const GPU = argv.includes('--gpu');
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
  console.log(`  ${pass === null ? 'info' : pass ? 'ok  ' : 'FAIL'} ranges / ${setting}: ${detail}`);
}

async function open(backend) {
  const browser = GPU
    ? await chromium.launch({ channel: 'msedge', headless: false, args: ['--enable-unsafe-webgpu'] })
    : await chromium.launch({
        ...(backend === 'webgpu' ? { channel: 'chromium' } : {}),
        args:
          backend === 'webgpu'
            ? ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--disable-vulkan-surface', '--use-webgpu-adapter=swiftshader', '--ignore-gpu-blocklist']
            : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
      });
  const page = await browser.newPage({ viewport: { width: 900, height: 560 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('  pageerror:', e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' || /WGSL|shader|GL_INVALID/i.test(m.text())) console.log('  console:', m.text().slice(0, 300));
  });
  await page.routeWebSocket(/./, () => {});
  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {
      // A private context has the defaults anyway.
    }
  });
  await page.goto(`${base}?backend=${backend}&gputracks=0`, { waitUntil: 'domcontentloaded', timeout: 180_000 });
  await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine && globalThis.__3dheat), null, { timeout: 180_000 });
  await page.waitForTimeout(1500);
  return { browser, page };
}

/** The rifleman (walking 20 m north and back over a minute), 24 more riflemen in a ring, the ground and the house. */
async function load(page) {
  await page.evaluate(() => {
    const rows = [];
    for (let t = 0; t <= 60; t += 0.5) {
      rows.push({ p: 0, t, x: 0, z: -10 + 20 * Math.abs(((t / 30) % 2) - 1), ev: t % 5 === 0 ? 1 : 0 });
      for (let k = 1; k <= 24; k++) {
        const a = (k / 24) * Math.PI * 2 + t * 0.01;
        rows.push({ p: k, t, x: Math.cos(a) * 250, z: Math.sin(a) * 250, ev: t % 5 === 0 ? 1 : 0 });
      }
    }
    const n = rows.length;
    const names = Array.from({ length: 25 }, (_, i) => (i ? `rifleman ${i}` : 'blue'));
    const cat = (name, vals, of) => ({ name, kind: 'category', data: Uint32Array.from(rows, of), min: 0, max: vals.length - 1, categories: vals });
    const s = globalThis.__3dheat.useStore.getState();
    s.setDataset({
      id: 'visual-ranges', name: 'range check', count: n,
      px: Float32Array.from(rows, (r) => r.x), py: new Float32Array(n), pz: Float32Array.from(rows, (r) => r.z),
      time: Float32Array.from(rows, (r) => r.t), epochMs: null, lifetime: null, maxLifetimeGap: 0, personShared: null,
      yaw: new Float32Array(n), pitch: new Float32Array(n),
      personId: Uint32Array.from(rows, (r) => r.p), teamId: Uint16Array.from(rows, (r) => (r.p ? 1 : 0)),
      personLabels: names, teamLabels: ['blue', 'red'],
      sessionId: null, sessionLabels: [], sessionRows: null, sessionStart: null, sessionEnd: null,
      personTeam: Uint16Array.from(names, (_, i) => (i ? 1 : 0)), personSlot: null, teamSizes: Uint32Array.of(1, 24),
      attrs: [
        cat('kind', ['soldier'], () => 0),
        cat('player', names, (r) => r.p),
        cat('event', ['position', 'shot'], (r) => r.ev),
        cat('weapon', ['', 'ak47'], (r) => r.ev),
      ],
      warnings: [],
      bounds: { minX: -260, minY: 0, minZ: -260, maxX: 260, maxY: 2, maxZ: 260 },
      timeRange: [0, 60], timeSorted: true,
    });
    // Ground 2 km square in 40 m quads, and a house 10 m deep, 120 m wide, 30 m high, 45 m east.
    const v = [];
    const idx = [];
    const G = 50;
    for (let j = 0; j <= G; j++) for (let i = 0; i <= G; i++) v.push(-1000 + i * 40, 0, -1000 + j * 40, 0, 1, 0);
    for (let j = 0; j < G; j++)
      for (let i = 0; i < G; i++) {
        const a = j * (G + 1) + i;
        idx.push(a, a + 1, a + G + 2, a, a + G + 2, a + G + 1);
      }
    const box = (x0, x1, y0, y1, z0, z1) => {
      const c = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
      const b = v.length / 6;
      for (const p of c) v.push(...p, 0, 1, 0);
      for (const [a, bb, cc, d] of [[0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7], [1, 5, 6, 2], [3, 2, 6, 7], [4, 5, 1, 0]]) idx.push(b + a, b + bb, b + cc, b + a, b + cc, b + d);
    };
    box(45, 55, 0, 30, -60, 60);
    s.setLevel({
      kind: 'model', name: 'range check', vertices: new Float32Array(v), indices: new Uint32Array(idx),
      triangles: idx.length / 3, sourceTriangles: idx.length / 3, partNames: ['ground:all'], partClasses: ['ground'], partReasons: ['check'],
      bounds: { minX: -1000, minY: 0, minZ: -1000, maxX: 1000, maxY: 30, maxZ: 1000 },
      opacity: 1, desaturate: 1, brightness: 0.9, wireframe: false,
    });
    s.setMode('team');
    s.patchTimeline({ mode: 'play', window: 'cumulative', playing: false, speed: 1 });
    s.patchTeam({ trailSeconds: 0, figureScale: 1, showLookDirection: false });
    if (s.showGrid) s.toggle('showGrid');
    const r = globalThis.__3dheat_replay.getState();
    r.setDropLines?.(false);
    r.select('blue');
  });
  await page.waitForTimeout(2500);
}

/** A frame at playhead 30 s from a fixed camera, after enough frames for the views to be taken. */
async function frame(page, ranges) {
  return page.evaluate(async (ranges) => {
    const eng = globalThis.__3dheat_engine;
    globalThis.__3dheat_replay.getState().setRanges(ranges);
    globalThis.__3dheat_replay.getState().select('blue');
    globalThis.__3dheat.useStore.getState().seek(30);
    eng.placeCamera({ x: -500, y: 650, z: 500 }, { x: 150, y: 0, z: 0 });
    for (let i = 0; i < 20; i++) {
      eng.invalidate(2);
      await new Promise((r) => requestAnimationFrame(() => r()));
    }
    const f = await eng.captureFrame();
    const sx = f.width / eng.canvas.clientWidth;
    const pts = { behind: [600, 2, 0], north: [0, 2, -600], groundFront: [25, 0, 0], groundBehind: [200, 0, 0] };
    const at = {};
    for (const [k, p] of Object.entries(pts)) {
      const q = eng.project(p[0], p[1], p[2]);
      at[k] = q ? [Math.round(q.x * sx), Math.round(q.y * sx)] : null;
    }
    const info = (await import('/src/ranges/layer.ts')).useRangeInfo.getState();
    const idx = (await import('/src/ui/replay/units.ts')).unitsOf(globalThis.__3dheat.useStore.getState().dataset);
    return { w: f.width, h: f.height, rgba: Array.from(f.rgba), at, info: { shown: info.units.map((u) => [u.person, u.weapons.map((w) => w.weapon.id)]), keys: idx.units.slice(0, 3).map((u) => u.key), sel: globalThis.__3dheat_replay.getState().selected } };
  }, ranges);
}

/** How much a picture differs from another around a point (sum of channel differences in a 9 px box). */
function diffAt(a, b, p, r = 4) {
  if (!p) return -1;
  let s = 0;
  for (let y = p[1] - r; y <= p[1] + r; y++)
    for (let x = p[0] - r; x <= p[0] + r; x++) {
      if (x < 0 || y < 0 || x >= a.w || y >= a.h) continue;
      const i = (y * a.w + x) * 4;
      s += Math.abs(a.rgba[i] - b.rgba[i]) + Math.abs(a.rgba[i + 1] - b.rgba[i + 1]) + Math.abs(a.rgba[i + 2] - b.rgba[i + 2]);
    }
  return s;
}
function diffAll(a, b) {
  let n = 0;
  for (let i = 0; i < a.rgba.length; i += 4) if (Math.abs(a.rgba[i] - b.rgba[i]) + Math.abs(a.rgba[i + 1] - b.rgba[i + 1]) + Math.abs(a.rgba[i + 2] - b.rgba[i + 2]) > 6) n++;
  return n;
}

async function frameTimes(page, on) {
  const faces = Number(opt('faces') ?? 3);
  await page.evaluate(async (faces) => ((await import('/src/ranges/layer.ts')).rangeTuning.facesPerFrame = faces), faces);
  return page.evaluate(async (on) => {
    const st = globalThis.__3dheat.useStore;
    const rp = globalThis.__3dheat_replay.getState();
    rp.setRanges({ on: false });
    st.getState().seek(5);
    st.getState().patchTimeline({ playing: true, speed: 1 });
    const gaps = [];
    let last = performance.now();
    let switched = false;
    await new Promise((res) => {
      const tick = () => {
        const now = performance.now();
        gaps.push(now - last);
        last = now;
        if (!switched && gaps.length > 60) {
          switched = true;
          if (on) rp.setRanges({ on: true, units: 'all', maxUnits: 25, los: true, ground: true });
        }
        if (gaps.length < 660) requestAnimationFrame(tick);
        else res();
      };
      requestAnimationFrame(tick);
    });
    st.getState().patchTimeline({ playing: false });
    const g = gaps.slice(70);
    g.slow = g.map((v, i) => [v, i]).filter(([v]) => v > 25).map(([v, i]) => `${i}:${v.toFixed(0)}`).join(' ');
    return { g, slow: g.slow };
  }, on);
}
const stats = (g) => {
  const s = [...g].sort((a, b) => a - b);
  return { median: s[s.length >> 1], p99: s[Math.floor(s.length * 0.99)], max: s[s.length - 1] };
};
const fmt = (s) => `median ${s.median.toFixed(1)} ms, p99 ${s.p99.toFixed(1)} ms, max ${s.max.toFixed(1)} ms`;

for (const backend of backends) {
  const { browser, page } = await open(backend);
  try {
    await load(page);
    const off = await frame(page, { on: false });
    const los = await frame(page, { on: true, units: 'selected', los: true, ground: true, opacity: 0.8, style: 'both' });
    const again = await frame(page, { on: true, units: 'selected', los: true, ground: true, opacity: 0.8, style: 'both' });
    const nolos = await frame(page, { on: true, units: 'selected', los: false, ground: false, opacity: 0.8, style: 'both' });
    const noground = await frame(page, { on: true, units: 'selected', los: true, ground: false, opacity: 0.8, style: 'both' });
    if (opt('shot')) {
      for (const [name, r] of [['los', { los: true, ground: true }], ['nolos', { los: false, ground: false }], ['inside', { los: true, ground: true }]]) {
        await frame(page, { on: true, units: 'selected', opacity: 0.8, style: 'both', ...r });
        if (name === 'inside') {
          // From inside the shells, at the rifleman's side, looking past the house.
          await page.evaluate(async () => {
            const eng = globalThis.__3dheat_engine;
            eng.placeCamera({ x: -60, y: 40, z: -120 }, { x: 200, y: 0, z: 0 });
            for (let i = 0; i < 10; i++) {
              eng.invalidate(2);
              await new Promise((r) => requestAnimationFrame(() => r()));
            }
          });
        }
        const hide = await page.addStyleTag({ content: '* { visibility: hidden !important } canvas { visibility: visible !important }' });
        await page.locator('canvas').first().screenshot({ path: `${opt('shot')}/ranges-${backend}-${name}.png` });
        await hide.evaluate((e) => e.remove());
      }
    }
    if (argv.includes('--debug')) console.log('  debug', JSON.stringify(los.info), JSON.stringify(los.at));
    const drawn = diffAll(off, los);
    report(`${backend} shells drawn`, drawn > 2000, `${drawn} pixels change with the ranges on`);
    const behindCut = diffAt(off, los, los.at.behind), behindOpen = diffAt(off, nolos, nolos.at.behind), north = diffAt(off, los, los.at.north);
    report(`${backend} line of sight cuts the shell behind the house`, behindOpen > 300 && behindCut < behindOpen * 0.35 && north > 300, `behind: cut ${behindCut}, uncut ${behindOpen}; north (open) ${north}`);
    const gf = diffAt(noground, los, los.at.groundFront), gb = diffAt(noground, los, los.at.groundBehind);
    report(`${backend} ground seen is shaded, ground hidden is not`, gf > 300 && gb < gf * 0.35, `in front of the house ${gf}, behind it ${gb}`);
    const flicker = diffAll(los, again);
    report(`${backend} no flicker (same paused frame twice)`, flicker < 20, `${flicker} pixels differ`);
    if (argv.includes('--quick')) continue;
    const f0 = await frameTimes(page, false);
    const f1 = await frameTimes(page, true);
    const t0 = stats(f0.g);
    const t1 = stats(f1.g);
    if (f1.slow) report(`${backend} slow frames with the ranges on`, null, f1.slow);
    report(`${backend} frame times, 25 walking units, ranges off`, null, fmt(t0));
    report(`${backend} frame times, ranges on for all 25 (4 views)`, GPU ? t1.p99 <= Math.max(t0.p99 * 1.25, 17.5) && t1.max < 50 : null, fmt(t1));
  } finally {
    await browser.close();
  }
}

const failed = results.filter((r) => r === false).length;
console.log(failed ? `${failed} failed` : 'all passed');
process.exit(failed ? 1 : 0);
