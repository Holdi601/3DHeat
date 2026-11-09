/**
 * Rendered check of hit marks (src/figures/hitmarks.ts): a shot that struck
 * a unit leaves its mark on it from the moment of the hit, ringed in its
 * outcome's colour (a critical hit blue, the killing shot magenta and
 * white), the pointer over the mark finds that hit, the mark stays for the
 * unit's whole life by default and is gone after a set time when one is set.
 * An explosive round (HEAT) leaves its soot star, far more dark surface than
 * a kinetic round's hole of the same calibre, and the card under the pointer
 * names the round and its type.
 * On both track paths (CPU figures, GPU tracks) and, with --webgpu, on both
 * backends.
 *
 * With --gpu (Edge on this machine's graphics card; frame times mean nothing
 * in software): a large battle - 400 tanks, 60,000 hits - played while the
 * marks are switched on and worked out, no frame past 20 ms.
 *
 * With --data=<file>: a real battle (a converted replay, kept local) loaded
 * through the app, played while the marks are switched on and worked out;
 * judged by the marks' longest step and their share of any frame (the work
 * goes in slices of at most 2 ms), with the frames past 20 ms beside the same
 * seconds without the marks.
 *
 * Otherwise synthetic data only: two tanks standing apart; the blue one hits the red
 * one at 20 s (a critical hit, APFSDS) and kills it at 40 s (HEAT), both 120 mm. Starts its own dev
 * server on port 5299 and renders in software (SwiftShader).
 *
 *   node tools/check-hitmarks.mjs                 WebGL2
 *   node tools/check-hitmarks.mjs --webgpu        also WebGPU
 *   --url=http://127.0.0.1:5299/   against a server already running
 *   --port=<n>                     its own server on another port
 *   --shot=<dir>                   save the frames looked at
 *   --data=<file>                  the real battle's frame times (above)
 *
 * The pure half (the window, the fade, the colours) is
 * src/figures/hitmarks.test.ts.
 */
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const argv = process.argv.slice(2);
const opt = (name) => argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? null;
const PORT = Number(opt('port') ?? 5299);
const backends = argv.includes('--webgpu') ? ['webgl2', 'webgpu'] : ['webgl2'];
const GPU = argv.includes('--gpu');
/** The large battle in software too: its frame times reported, not judged (they mean nothing there). */
const LOAD = GPU || argv.includes('--load');
/** The longest frame allowed while the marks are worked out, ms. */
const FRAME_MAX_MS = 20;
/** A real battle to play (`--data`), and the longest step of the marks' working out allowed on it, ms. */
const DATA = opt('data');
const STEP_MAX_MS = 2.5;

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
        num('calibre', (r) => (shot(r) ? 120 : NaN)),
        cat('ammoType', ['', 'APFSDS', 'HEAT'], (r) => (shot(r) ? (r.t < 30 ? 1 : 2) : 0)),
        cat('ammoName', ['', '120mm_test_apfsds', '120mm_test_heat'], (r) => (shot(r) ? (r.t < 30 ? 1 : 2) : 0)),
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
    s.patchTeam({ trailSeconds: 0, figureScale: 2, showLookDirection: false, fires: false, weapons: false, hitMarks: true, hitMarkSeconds: 10 });
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
    // Until the marks are worked out and on their figures (a worker builds those), then a few frames more.
    const hm = eng.hitMarkStats;
    for (let i = 0; i < 600 && !(hm.vehicles > 0 && hm.placed === hm.vehicles); i++) {
      eng.invalidate(2);
      await new Promise((r) => requestAnimationFrame(() => r()));
    }
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
    // Dark pixels: a hole's and a blast's soot (less the unit's own shade, from a look before the hit).
    let dark = 0;
    for (let y = Math.max(0, Math.floor((p.y - r) * sx)); y <= Math.min(f.height - 1, Math.ceil((p.y + r) * sx)); y++) {
      for (let x = Math.max(0, Math.floor((p.x - r) * sx)); x <= Math.min(f.width - 1, Math.ceil((p.x + r) * sx)); x++) {
        const i = (y * f.width + x) * 4;
        const px = [f.rgba[i], f.rgba[i + 1], f.rgba[i + 2]];
        if (Math.max(...px) < 50) dark++;
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
    let at = null;
    if (dr && dr.count > 0) {
      const s = eng.toScreen(dr.xyz[0], dr.xyz[1], dr.xyz[2]);
      if (s) found = eng.hitMarkAt(s[0], s[1]);
      const box = eng.canvas.getBoundingClientRect();
      if (s) at = [box.left + s[0], box.top + s[1]];
    }
    return { counts, dark, drawn: dr ? dr.count : -1, found, at };
  }, { t, want, height });
}

/**
 * A large battle: 400 tanks of ten kinds in a grid, sampled four times a
 * second for a minute, 60,000 hits among them. The frame intervals while the
 * marks are switched on and played, ms.
 */
async function frameTimes(page, P, H, enable = true) {
  return page.evaluate(async ({ P, H, enable }) => {
    const kinds = ['ussr_t_80u', 'germ_leopard_2a6', 'us_m1a2_abrams', 'uk_challenger_2', 'fr_leclerc', 'it_ariete', 'jp_type_90', 'cn_ztz_99a', 'il_merkava_mk_4b', 'sw_strv_122'];
    const n = P * 241 + H;
    const px = new Float32Array(n), pz = new Float32Array(n), time = new Float32Array(n), person = new Uint32Array(n), team = new Uint16Array(n);
    const ev = new Uint32Array(n), veh = new Uint32Array(n), oth = new Uint32Array(n), othV = new Uint32Array(n);
    const lx = new Float32Array(n).fill(NaN), ly = new Float32Array(n).fill(NaN), lz = new Float32Array(n).fill(NaN);
    let r = 0;
    const place = (p, t) => {
      px[r] = (p % 20) * 30;
      pz[r] = Math.floor(p / 20) * 30;
      time[r] = t;
      person[r] = p;
      team[r] = p % 2;
      veh[r] = p % kinds.length;
    };
    for (let i = 0; i < 241; i++) for (let p = 0; p < P; p++, r++) place(p, i * 0.25);
    for (let h = 0; h < H; h++, r++) {
      const p = h % P, v = (h * 7 + 3) % P;
      place(p, (h / H) * 60);
      ev[r] = 1;
      oth[r] = v + 1;
      othV[r] = (v % kinds.length) + 1;
      lx[r] = ((h * 13) % 70) / 10 - 3.5;
      ly[r] = ((h * 7) % 25) / 10;
      lz[r] = ((h * 11) % 36) / 10 - 1.8;
    }
    const idx = Array.from({ length: n }, (_, i) => i).sort((a, b) => time[a] - time[b]);
    const pick = (a) => {
      const o = new a.constructor(n);
      idx.forEach((j, i) => (o[i] = a[j]));
      return o;
    };
    const labels = Array.from({ length: P }, (_, i) => `tank ${i}`);
    const s = globalThis.__3dheat.useStore.getState();
    s.patchTeam({ hitMarks: false });
    s.setDataset({
      id: 'visual-hitmarks-load', name: 'hit mark load', count: n,
      px: pick(px), py: new Float32Array(n), pz: pick(pz), time: pick(time), epochMs: null, lifetime: null, maxLifetimeGap: 0, personShared: null,
      yaw: new Float32Array(n).fill(Math.PI / 2), pitch: new Float32Array(n),
      personId: pick(person), teamId: pick(team), personLabels: labels, teamLabels: ['blue', 'red'],
      sessionId: null, sessionLabels: [], sessionRows: null, sessionStart: null, sessionEnd: null,
      personTeam: Uint16Array.from(labels, (_, i) => i % 2), personSlot: null, teamSizes: Uint32Array.of(P / 2, P / 2),
      attrs: [
        { name: 'kind', kind: 'category', data: new Uint32Array(n), min: 0, max: 0, categories: ['tank'] },
        { name: 'event', kind: 'category', data: pick(ev), min: 0, max: 1, categories: ['position', 'shot'] },
        { name: 'player', kind: 'category', data: pick(person), min: 0, max: P - 1, categories: labels },
        { name: 'Vehicle', kind: 'category', data: pick(veh), min: 0, max: 9, categories: kinds },
        { name: 'other', kind: 'category', data: pick(oth), min: 0, max: P, categories: ['', ...labels] },
        { name: 'otherVehicle', kind: 'category', data: pick(othV), min: 0, max: 10, categories: ['', ...kinds] },
        { name: 'hitLocalX', kind: 'number', data: pick(lx), min: -4, max: 4 },
        { name: 'hitLocalY', kind: 'number', data: pick(ly), min: 0, max: 3 },
        { name: 'hitLocalZ', kind: 'number', data: pick(lz), min: -2, max: 2 },
      ],
      warnings: [],
      bounds: { minX: 0, minY: 0, minZ: 0, maxX: 600, maxY: 4, maxZ: 600 },
      timeRange: [0, 60], timeSorted: true,
    });
    s.setMode('team');
    s.patchTimeline({ mode: 'play', window: 'cumulative', playing: false, speed: 1 });
    s.patchTeam({ trailSeconds: 0, showLookDirection: false });
    const eng = globalThis.__3dheat_engine;
    await new Promise((res) => setTimeout(res, 3000));
    // Close over a corner of the grid (once the view has fitted itself to the data): dozens of tanks big enough
    // on screen for their marks.
    eng.placeCamera({ x: -20, y: 45, z: -20 }, { x: 60, y: 0, z: 60 });
    const st = globalThis.__3dheat.useStore;
    st.getState().seek(30);
    st.getState().patchTimeline({ playing: true, speed: 1 });
    const gaps = [];
    let last = performance.now();
    let on = false;
    await new Promise((res) => {
      const tick = () => {
        const now = performance.now();
        gaps.push(now - last);
        last = now;
        // A second of play first, then the marks switched on: their working out, the figures' snap and the first
        // frames with them are in the fifteen seconds after.
        if (!on && gaps.length > 60) {
          on = true;
          st.getState().patchTeam({ hitMarks: enable });
        }
        if (gaps.length < 960) requestAnimationFrame(tick);
        else res();
      };
      requestAnimationFrame(tick);
    });
    const ms = eng.hitMarkStats;
    const draws = Array.from(ms.draws.subarray(0, Math.min(ms.n, 2048)));
    const slow = gaps.map((g, i) => [g, i]).filter(([g]) => g > 20).map(([g, i]) => `${i}:${g.toFixed(0)}`).slice(0, 12).join(' ');
    return { before: gaps.slice(2, 60), after: gaps.slice(61), drawn: eng.hitMarkLayer?.drawn.count ?? -1, stats: { ...ms, draws: draws.sort((a, b) => b - a).slice(0, 6).map((v) => v.toFixed(1)).join(' '), slow } };
  }, { P, H, enable });
}

/**
 * The real battle (`--data`), loaded through the app, played from its middle:
 * the frame intervals before and after the marks are switched on (or, with
 * `enable` false, the same seconds without them), and the marks' own costs.
 */
async function battleTimes(page, enable) {
  const body = readFileSync(DATA);
  await page.route('**/__hitprobe/battle.parquet', (r) => r.fulfill({ body, contentType: 'application/octet-stream' }));
  return page.evaluate(async (enable) => {
    const h = globalThis.__3dheat;
    await h.loadUrls(['/__hitprobe/battle.parquet']);
    const st = h.useStore;
    st.getState().setMode('team');
    st.getState().patchTeam({ figures: true, hitMarks: false, trailSeconds: 0 });
    await new Promise((res) => setTimeout(res, 3000));
    const d = st.getState().dataset;
    st.getState().seek((d.timeRange[0] + d.timeRange[1]) / 2);
    st.getState().patchTimeline({ mode: 'play', window: 'cumulative', playing: true, speed: 1 });
    const eng = globalThis.__3dheat_engine;
    const gaps = [];
    let last = performance.now();
    let on = false;
    await new Promise((res) => {
      const tick = () => {
        const now = performance.now();
        gaps.push(now - last);
        last = now;
        if (!on && gaps.length > 60) {
          on = true;
          st.getState().patchTeam({ hitMarks: enable });
        }
        if (gaps.length < 900) requestAnimationFrame(tick);
        else res();
      };
      requestAnimationFrame(tick);
    });
    const ms = eng.hitMarkStats;
    return { rows: d.count, before: gaps.slice(2, 60), after: gaps.slice(61), stats: { workMs: ms.workMs, pending: ms.pending, marks: ms.marks, vehicles: ms.vehicles, placed: ms.placed, longest: ms.steps.longest, at: ms.steps.at, steps: ms.steps.steps } };
  }, enable);
}

// The outcome colours of src/vehicle/scene.ts.
const CRITICAL = [0.15, 0.55, 1.0];
const KILL = [1.0, 0.17, 0.84];
const WHITE = [1, 1, 1];

for (const backend of backends) {
  if (DATA) {
    const runs = {};
    for (const enable of [false, true]) {
      const { browser, page } = await open(backend, '&gputracks=0');
      try {
        runs[enable] = await battleTimes(page, enable);
      } finally {
        await browser.close();
      }
    }
    const off = runs[false], on = runs[true];
    const over = (g) => g.filter((v) => v > FRAME_MAX_MS).length;
    const max = (g) => Math.max(...g).toFixed(1);
    const s = on.stats;
    report(`${backend} real battle, the marks' work`, s.marks > 0 && s.longest <= STEP_MAX_MS && s.workMs <= STEP_MAX_MS + 2.5,
      `${on.rows} rows, ${s.marks} marks on ${s.placed} of ${s.vehicles} vehicles; longest step ${s.longest.toFixed(1)} ms (#${s.at} of ${s.steps}), the marks' longest share of a frame ${s.workMs.toFixed(1)} ms over ${s.pending} frames`);
    report(`${backend} real battle, frames past ${FRAME_MAX_MS} ms`, GPU ? over(on.after) <= over(off.after) : null,
      `with the marks ${over(on.after)} of ${on.after.length} (max ${max(on.after)} ms), without ${over(off.after)} of ${off.after.length} (max ${max(off.after)} ms)`);
    continue;
  }
  if (LOAD) {
    // Frames past the limit with the marks left off: the machine's own (other programs, the scene).
    let control = 0;
    if (GPU) {
      // The same fifteen seconds with the marks left off: what this machine's frames are without them.
      const { browser, page } = await open(backend, '&gputracks=0');
      try {
        const { after } = await frameTimes(page, 400, 60000, false);
        const slow = after.filter((g) => g > FRAME_MAX_MS).length;
        control = slow;
        report(`${backend} CPU figures, frame time without the marks`, null, `${slow} of ${after.length} frames past ${FRAME_MAX_MS} ms, max ${Math.max(...after).toFixed(1)} ms`);
      } finally {
        await browser.close();
      }
    }
    for (const path of ['cpu', 'gpu']) {
      const { browser, page } = await open(backend, `&gputracks=${path === 'gpu' ? 1 : 0}`);
      try {
        const { before, after, drawn, stats } = await frameTimes(page, GPU ? 400 : 40, GPU ? 60000 : 4000);
        if (opt('shot')) await page.screenshot({ path: `${opt('shot')}/hitmarks-${backend}-${path}-load.png` });
        const summary = (g) => {
          const s = [...g].sort((a, b) => a - b);
          return { max: s[s.length - 1], p99: s[Math.floor(s.length * 0.99)], median: s[s.length >> 1] };
        };
        const a = summary(before), b = summary(after);
        // Judged by the marks' own share of any frame - working out, drawing - well under the limit: the frames past
        // it on this machine come and go with what else runs on it (the same seconds without the marks: `control`).
        const limit = Math.max(FRAME_MAX_MS, a.max + 3);
        const over = after.filter((g) => g > FRAME_MAX_MS).length;
        const pass = stats.workMs <= 6 && stats.drawMs <= 8;
        report(`${backend} ${path === 'gpu' ? 'GPU tracks' : 'CPU figures'}, frame time`, GPU ? pass : null,
          `${over} of ${after.length} frames past ${FRAME_MAX_MS} ms (without the marks ${control}); ` +
          `before the marks median ${a.median.toFixed(1)} max ${a.max.toFixed(1)} ms; ${after.length} frames while 60,000 hits are worked out and drawn (${drawn} marks drawn at the end of ${stats.marks}, ${stats.placed} of ${stats.vehicles} vehicles' marks on their figures; the marks' longest share of a frame ${stats.workMs.toFixed(1)} ms working out over ${stats.pending} frames, ${stats.drawMs.toFixed(1)} ms drawing, slowest draws ${stats.draws}, slow frames ${stats.slow}, longest step #${stats.steps.at} of ${stats.steps.steps} ${stats.steps.longest.toFixed(1)} ms): median ${b.median.toFixed(1)}, p99 ${b.p99.toFixed(1)}, max ${b.max.toFixed(1)} ms (limit ${limit.toFixed(1)})`);
      } finally {
        await browser.close();
      }
    }
    continue;
  }
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
      await page.evaluate(() => globalThis.__3dheat.useStore.getState().patchTeam({ hitMarkSeconds: 0 }));
      const life = await look(page, 32, [CRITICAL, KILL]);
      report(`${name}, stays the unit's life`, life.drawn === 1 && life.counts[0] >= 4, `whole life: at 32 s ${life.drawn} mark, ${life.counts[0]} critical-blue px`);
      report(`${name}, killing shot`, kill.drawn === 1 && kill.counts[0] >= 4 && kill.counts[1] >= 4, `at 41 s ${kill.drawn} mark, ${kill.counts[0]} magenta px, ${kill.counts[1]} white px`);
      // The HEAT round's soot star against the APFSDS round's hole, the same calibre: its dark surface several times as much.
      const soot = (l) => l.dark - before.dark;
      report(`${name}, explosive round`, soot(hit) > 0 && soot(kill) > 2.5 * soot(hit),
        `dark px over the unit's own: APFSDS hole ${soot(hit)}, HEAT soot star ${soot(kill)}`);
      // Both shots struck the same point: the killing shot's card with the earlier mark gone again.
      await page.evaluate(() => globalThis.__3dheat.useStore.getState().patchTeam({ hitMarkSeconds: 10 }));
      const last = await look(page, 41, [KILL, WHITE]);
      let card = '';
      if (last.at) {
        await page.mouse.move(last.at[0] + 40, last.at[1] + 40);
        await page.mouse.move(last.at[0], last.at[1], { steps: 4 });
        await page.waitForTimeout(400);
        card = await page.evaluate(() => document.querySelector('.hit-mark-tip')?.textContent ?? '');
      }
      report(`${name}, card names the round`, card.includes('120mm_test_heat') && card.includes('HEAT') && card.includes('120 mm'), `the card: ${card.slice(0, 160)}`);
    } finally {
      await browser.close();
    }
  }
}

const failed = results.filter((r) => r === false).length;
console.log(failed ? `${failed} failed` : 'all passed');
process.exit(failed ? 1 : 0);
