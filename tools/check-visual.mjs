/**
 * Visual checks on rendered frames: the bugs a user would otherwise find by looking.
 *
 * Three properties, each over every setting it can depend on:
 *
 * 1. Zoom: a place reads the same heat, and the same colour, from far and near.
 * 2. Flicker: small camera moves, and playback under a still camera, change the
 *    heat at fixed world points smoothly - no frame-to-frame sparkle.
 * 3. Jitter: a unit moves smoothly frame to frame in every replay path (CPU
 *    figures, GPU tracks) and stays put on screen under every follow camera,
 *    far from the origin over a long recording, as a DCS theatre is.
 * 4. Frame time: a still view holds its exposure, heat resolution and sprite
 *    budget and redraws nothing; flying, zooming, changing the radius, playing
 *    back and loading a dataset of ten million rows mid-flight drop no frame,
 *    and playback moves the exposure only gently.
 *    Frame times are judged on a real GPU only (--gpu); in software they are
 *    reported.
 *
 * Synthetic data only, generated here, so the run needs no files. Starts its own
 * dev server on port 5285 and renders in software (SwiftShader), so it puts no
 * load on the GPU. WebGPU, also in software, with --webgpu.
 *
 *   npm run check:visual                     all three, WebGL2
 *   npm run check:visual -- --webgpu         also on WebGPU
 *   npm run check:visual -- --only=jitter    one property (zoom | flicker | jitter | frametime)
 *   npm run check:visual -- --only=frametime --webgpu --gpu   frame times on this machine's GPU (Edge)
 *   npm run check:visual -- --url=http://127.0.0.1:5285/   against a server already running
 *   --setting=<regex>   only the heat settings whose name matches
 *   --follow=<mode>     only one follow view in the jitter check (null for the still camera)
 *   --full-res          hold the heat at full resolution (the adaptive budget otherwise lowers it)
 *   --verbose           the readings behind each line; --shot=<dir> and --dump=<dir> save frames
 *
 * Software rendering is slow: the whole run takes the better part of an hour.
 *
 * The pure half - the shaders' weighting, the exposure follower, track
 * evaluation and the follow rig - is src/render/visualChecks.test.ts.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright';

const argv = process.argv.slice(2);
const opt = (name) => argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? null;
const PORT = 5285;
const only = opt('only');
const backends = argv.includes('--webgpu') || process.env.CHECK_WEBGPU === '1' ? ['webgl2', 'webgpu'] : ['webgl2'];
const want = (p) => !only || only === p;
const verbose = argv.includes('--verbose');

// ------------------------------------------------------------------ server

let server = null;
let base = opt('url');
if (!base) {
  base = `http://127.0.0.1:${PORT}/`;
  server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  server.stdout.on('data', (b) => (log += b));
  server.stderr.on('data', (b) => (log += b));
  const until = Date.now() + 60_000;
  for (;;) {
    try {
      if ((await fetch(base)).ok) break;
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
const stop = () => {
  if (server && server.exitCode === null) server.kill();
};
process.on('exit', stop);

// ------------------------------------------------------------------ results

const results = [];
/** One line of the summary: a property, a setting, pass or fail, and the numbers behind it. */
function report(property, setting, pass, detail) {
  results.push({ property, setting, pass, detail });
  console.log(`  ${pass === null ? 'info' : pass ? 'ok  ' : 'FAIL'} ${property} / ${setting}: ${detail}`);
}

async function open(backend, query = '', gpu = false) {
  // The real GPU through Edge, shown, so the display's refresh paces it as it
  // does for a user; only the frame time check asks for it.
  const browser = gpu
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
    if (m.type() === 'error' || /context lost/i.test(m.text())) console.log('  console:', m.text().slice(0, 200));
  });
  page.on('crash', () => console.log('  the page crashed'));
  // Other work edits the sources while this runs, and the dev server's hot
  // reload would restart the page mid-check. Its socket goes nowhere instead.
  await page.routeWebSocket(/./, () => {});
  // Settings persist in local storage; every run starts from the defaults.
  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {
      // A private context may refuse; the defaults are what it has anyway.
    }
  });
  await page.goto(`${base}?backend=${backend}${query}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine && globalThis.__3dheat), null, { timeout: 60_000 });
  await page.waitForTimeout(1500);
  const got = await page.evaluate(() => ({ backend: globalThis.__3dheat_engine.live.backend, precision: globalThis.__3dheat_engine.renderer?.heatPrecision }));
  if (got.backend !== backend) console.log(`  note: asked for ${backend}, running ${got.backend}`);
  if (!query) console.log(`  heat target ${got.precision}`);
  // Page-side helpers, shared by every check below.
  await page.evaluate(() => {
    const eng = globalThis.__3dheat_engine;
    const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
    const frames = async (n) => {
      for (let i = 0; i < n; i++) {
        eng.invalidate(2);
        await frame();
      }
    };
    globalThis.__vc = {
      frame,
      /** Render `n` frames, forcing each one to draw. */
      frames,
      /** Wait for the heat to converge and the exposure to stop moving. */
      async settle(maxFrames = 400) {
        const st = globalThis.__3dheat.useStore;
        let still = 0;
        let last = st.getState().heat.saturation;
        eng.invalidate(2);
        for (let i = 0; i < maxFrames; i++) {
          await frame();
          const sat = st.getState().heat.saturation;
          // A glide is drawn without being written to the store until it lands.
          still = eng.live.converged && sat === last && eng.follower?.from == null ? still + 1 : 0;
          last = sat;
          // Longer than the follower's settle frames plus its glide, so a
          // pending re-exposure has happened before the reading is taken. A
          // converged frame that changed nothing is not redrawn, so these are cheap.
          if (still >= 40) return true;
        }
        return false;
      },
      /** Heat (in saturation units) and colour at world points, averaged. */
      async sample(points, withScene = false, patch = 1) {
        const px = [];
        for (const [x, y, z] of points) {
          const p = eng.project(x, y, z);
          if (p && p.x >= 0 && p.y >= 0 && p.x < eng.canvas.clientWidth && p.y < eng.canvas.clientHeight) px.push(p);
        }
        let heat = 0;
        let nHeat = 0;
        for (const p of px) {
          const h = await eng.probeHeat(p.x, p.y);
          if (h !== null && Number.isFinite(h)) {
            heat += Math.abs(h);
            nHeat++;
          }
        }
        const colour = async () => {
          const f = await eng.captureFrame();
          const rgb = [0, 0, 0];
          if (f) {
            const sx = f.width / eng.canvas.clientWidth;
            const sy = f.height / eng.canvas.clientHeight;
            // A 3 x 3 patch about each point, so a point drifting across a pixel
            // boundary as the camera moves does not read as a change of colour.
            // One pixel for the zoom: from far away a patch spans the blob's slope.
            const n = (2 * patch + 1) ** 2;
            for (const p of px) {
              for (let dy = -patch; dy <= patch; dy++) {
                for (let dx = -patch; dx <= patch; dx++) {
                  const y = Math.max(0, Math.min(f.height - 1, Math.floor(p.y * sy) + dy));
                  const x = Math.max(0, Math.min(f.width - 1, Math.floor(p.x * sx) + dx));
                  const i = (y * f.width + x) * 4;
                  for (let c = 0; c < 3; c++) rgb[c] += f.rgba[i + c] / (n * px.length);
                }
              }
            }
          }
          return rgb;
        };
        const rgb = await colour();
        // The scene alone behind the heat: what the colour is blended over.
        let bg = null;
        if (withScene) {
          const st = globalThis.__3dheat.useStore;
          const sat = st.getState().heat.saturation;
          st.getState().patchHeat({ saturation: sat * 1e6 });
          await frames(3);
          bg = await colour();
          st.getState().patchHeat({ saturation: sat });
          await frames(3);
        }
        return { bg, heat: nHeat ? heat / nHeat : null, rgb, sat: globalThis.__3dheat.useStore.getState().heat.saturation, n: px.length, splats: eng.live.splats, candidates: eng.live.candidates };
      },
    };
  });
  return { browser, page };
}

// ------------------------------------------------------------------ heat data

/**
 * A dense heat blob: points scattered about the origin, a quarter of them (the
 * other side, for the difference) spread four times wider. Each point drawn
 * independently, so the field is smooth at every scale the views look at.
 *
 * With `routes`, for line heat: many short walks of a few 3 m steps over a flat
 * square instead, so the routes are dense, short and cheap to draw.
 */
async function loadBlob(page, routes) {
  await page.evaluate(({ routes, base, fixedRes }) => {
    let seed = 12345;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const gauss = () => Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());
    const P = routes ? 180000 : 3000;
    const S = routes ? 6 : 200;
    const walk = new Float64Array(P * 2);
    for (let p = 0; p < P; p++) {
      // Wide enough that a view from 20 km, at a quarter of the heat
      // resolution, still has several texels of it around the probe.
      walk[p * 2] = (rnd() - 0.5) * 1200;
      walk[p * 2 + 1] = (rnd() - 0.5) * 1200;
    }
    const n = P * S;
    const px = new Float32Array(n);
    const py = new Float32Array(n);
    const pz = new Float32Array(n);
    const time = new Float32Array(n);
    const personId = new Uint32Array(n);
    const teamId = new Uint16Array(n);
    const personTeam = new Uint16Array(P);
    for (let p = 0; p < P; p++) personTeam[p] = p % 4 === 0 ? 1 : 0;
    for (let k = 0; k < S; k++) {
      for (let p = 0; p < P; p++) {
        const r = k * P + p;
        if (routes) {
          const a = rnd() * 2 * Math.PI;
          walk[p * 2] += 3 * Math.cos(a);
          walk[p * 2 + 1] += 3 * Math.sin(a);
          px[r] = walk[p * 2];
          pz[r] = walk[p * 2 + 1];
        } else {
          const sigma = personTeam[p] ? 600 : 150;
          px[r] = gauss() * sigma;
          pz[r] = gauss() * sigma;
        }
        time[r] = k;
        personId[r] = p;
        teamId[r] = personTeam[p];
      }
    }
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (let r = 0; r < n; r++) {
      minX = Math.min(minX, px[r]);
      maxX = Math.max(maxX, px[r]);
      minZ = Math.min(minZ, pz[r]);
      maxZ = Math.max(maxZ, pz[r]);
    }
    const teamSizes = Uint32Array.of(personTeam.filter((t) => t === 0).length, personTeam.filter((t) => t === 1).length);
    const s = globalThis.__3dheat.useStore.getState();
    s.setLevel?.(null);
    s.setDataset({
      id: 'visual-blob', name: 'visual check blob', count: n, px, py, pz,
      time, epochMs: null, lifetime: null, maxLifetimeGap: 0, personShared: null,
      yaw: null, pitch: null, personId, teamId,
      personLabels: Array.from({ length: P }, (_, p) => `p${p}`), teamLabels: ['near', 'wide'],
      sessionId: null, sessionLabels: [], sessionRows: null, sessionStart: null, sessionEnd: null,
      personTeam, personSlot: null, teamSizes, attrs: [], warnings: [],
      bounds: { minX, minY: 0, minZ, maxX, maxY: 1, maxZ },
      timeRange: [0, S - 1], timeSorted: true,
    });
    if (globalThis.__3dheat.useStore.getState().showGrid) s.toggle('showGrid');
    s.setMode('heat-simple');
    s.patchTimeline({ mode: 'all', playing: false });
    s.patchHeat({ ...base, followExposure: false });
    if (fixedRes) s.patchBudget({ adaptive: false, heatScale: 1 });
  }, { routes, base: HEAT_BASE, fixedRes: argv.includes('--full-res') });
  await page.waitForTimeout(2500);
  // Exposed once, from a middle view, then held: the ramp's middle, where a
  // change in heat shows as a change in colour.
  const sat = await page.evaluate(async () => {
    const eng = globalThis.__3dheat_engine;
    eng.placeCamera({ x: 0, y: 600, z: 0.6 }, { x: 0, y: 0, z: 0 });
    await globalThis.__vc.settle();
    const r = await eng.autoExpose();
    return r?.saturation ? r.saturation * 1.6 : 30;
  });
  if (verbose) {
    console.log(`  exposure from the middle view: ${sat}`);
    if (opt('shot')) await page.screenshot({ path: `${opt('shot')}/blob-${routes ? 'routes' : 'points'}.png` });
  }
  HEAT_BASE.saturation = sat;
  await page.evaluate((sat) => globalThis.__3dheat.useStore.getState().patchHeat({ saturation: sat }), sat);
}

/** The heat settings every check starts from: the defaults, with a sprite big enough to be smooth. */
const HEAT_BASE = { radius: 16, followExposure: false, zoomInvariant: true, response: 'saturating', saturation: 30 };
const ALL = { mode: 'all', playing: false };

/** Every setting the heat's look depends on, one at a time against the base. */
const HEAT_SETTINGS = [
  { name: 'simple, fixed exposure', mode: 'heat-simple', heat: {}, timeline: ALL },
  { name: 'simple, follow exposure', mode: 'heat-simple', heat: { followExposure: true }, timeline: ALL, follow: true },
  { name: 'simple, linear response', mode: 'heat-simple', heat: { response: 'linear' }, timeline: ALL },
  { name: 'simple, log response', mode: 'heat-simple', heat: { response: 'log' }, timeline: ALL },
  { name: 'simple, floor 0.2', mode: 'heat-simple', heat: { floor: 0.2 }, timeline: ALL },
  { name: 'simple, ground projected', mode: 'heat-simple', heat: { groundProjected: true }, timeline: ALL },
  { name: 'play, cumulative', mode: 'heat-simple', heat: {}, timeline: { mode: 'play', window: 'cumulative', playing: false }, seek: 150, play: [100, 4 / 60] },
  { name: 'play, fixed window', mode: 'heat-simple', heat: {}, timeline: { mode: 'play', window: 'fixed', windowSeconds: 60, playing: false }, seek: 150 },
  { name: 'play, lifetime', mode: 'heat-simple', heat: {}, timeline: { mode: 'play', window: 'lifetime', playing: false }, seek: 150 },
  { name: 'difference', mode: 'heat-difference', heat: {}, timeline: ALL },
  { name: 'difference, shares', mode: 'heat-difference', heat: { splitShares: true }, timeline: ALL },
  { name: 'teams', mode: 'heat-teams', heat: {}, timeline: ALL },
  { name: 'lines', mode: 'heat-lines', heat: {}, timeline: ALL },
  // Playback on the walks: on the scattered blob every person jumps hundreds of
  // metres a sample, so a window or a lifetime there changes by the data's own
  // teleporting, not by anything the renderer does.
  { name: 'walks, play fixed window', mode: 'heat-simple', heat: {}, timeline: { mode: 'play', window: 'fixed', windowSeconds: 2, playing: false }, routes: true, play: [2, 1 / 60] },
  { name: 'walks, play lifetime', mode: 'heat-simple', heat: {}, timeline: { mode: 'play', window: 'lifetime', playing: false }, routes: true, play: [2, 1 / 60] },
  { name: 'lines, follow exposure', mode: 'heat-lines', heat: { followExposure: true }, timeline: ALL, follow: true },
];

async function applyHeat(page, cfg, extra = {}) {
  await page.evaluate(
    ({ cfg, base, extra }) => {
      const s = globalThis.__3dheat.useStore.getState();
      s.setMode(cfg.mode);
      s.patchHeat({ ...base, ...cfg.heat, ...extra });
      s.patchTimeline(cfg.timeline);
      if (cfg.seek !== undefined) s.seek(cfg.seek);
    },
    { cfg, base: HEAT_BASE, extra },
  );
}

/** Straight down at `height` over (cx, cz). */
const above = (page, height, cx = 0, cz = 0) =>
  page.evaluate(({ h, cx, cz }) => globalThis.__3dheat_engine.placeCamera({ x: cx, y: h, z: cz + 1e-3 * h }, { x: cx, y: 0, z: cz }), { h: height, cx, cz });

/**
 * World points around the blob's middle: a 5 x 5 grid 15 m apart. Wide enough
 * that the far views average more than one pixel's worth of rows, near enough
 * the middle that the blob is flat across it.
 */
const PROBE = [];
for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) PROBE.push([i * 15, 0, j * 15]);

const rgbDiff = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])));
const pct = (v) => `${(v * 100).toFixed(1)}%`;

// ------------------------------------------------------------------ 1. zoom

/**
 * Sprites of 16 m are clamped up to a pixel from about 8 km and down to 96
 * pixels below about 80 m, so this spans both clamps and the range between.
 */
const HEIGHTS = [55, 150, 600, 2500, 9000, 20000];
/** Follow exposure re-meters what is on screen; the same content is what it must leave alone. */
const FOLLOW_HEIGHTS = [55, 150, 600];
const ZOOM_HEAT = 0.08;
const ZOOM_RGB = 8;

async function checkZoom(page, backend, pick) {
  const settings = [
    ...HEAT_SETTINGS,
    { name: 'control: zoom invariance off', mode: 'heat-simple', heat: { zoomInvariant: false }, timeline: ALL, control: true },
    { name: 'control: lines, zoom invariance off', mode: 'heat-lines', heat: { zoomInvariant: false }, timeline: ALL, control: true },
  // The walks are there for playback; the zoom of a window is checked on the blob.
  ].filter((c) => pick(c) && !(c.routes && c.mode !== 'heat-lines'));
  for (const cfg of settings) {
    await applyHeat(page, cfg);
    const heights = cfg.follow ? FOLLOW_HEIGHTS : HEIGHTS;
    const got = [];
    for (const h of heights) {
      await above(page, h);
      await page.evaluate(() => globalThis.__vc.settle());
      got.push(await page.evaluate((pts) => globalThis.__vc.sample(pts, true, 0), PROBE));
      if (opt('shot') && verbose) await page.screenshot({ path: `${opt('shot')}/zoom-${cfg.name.replace(/\W+/g, '_')}-${h}.png` });
    }
    const heats = got.map((g) => g.heat).filter((v) => v !== null && v > 0);
    const spread = heats.length ? Math.max(...heats) / Math.min(...heats) - 1 : NaN;
    // The colour is blended over the scene, and the scene behind the blob does
    // change with height (the ground fades out far away). What the heat itself
    // changed is what is left over after that.
    let rgb = 0;
    for (const g of got) rgb = Math.max(rgb, rgbDiff(g.rgb, got[0].rgb) - rgbDiff(g.bg, got[0].bg));
    // Teams mode accumulates colour, not one heat value, and may read no heat; the colour still has to hold.
    const heatOk = cfg.mode === 'heat-teams' ? !heats.length || spread <= ZOOM_HEAT : heats.length === got.length && spread <= ZOOM_HEAT;
    const ok = heatOk && rgb <= ZOOM_RGB;
    let detail = `heat spread ${heats.length ? pct(spread) : 'n/a'} over ${heights.join('/')} m, colour ${Math.max(0, rgb).toFixed(0)}/255 beyond the scene's change`;
    if (verbose) detail += ` [heat ${got.map((g) => (g.heat ?? NaN).toFixed(2)).join(' ')}; sat ${got.map((g) => g.sat.toFixed(1)).join(' ')}; rgb ${got.map((g) => g.rgb.map((v) => v.toFixed(0)).join(',')).join(' ')}; n ${got.map((g) => g.n).join(" ")}; scene ${got.map((g) => g.bg.map((v) => v.toFixed(0)).join(',')).join(' ')}; drawn ${got.map((g) => `${g.splats}/${g.candidates}`).join(' ')}]`;
    if (cfg.control) report('zoom', `${backend} ${cfg.name}`, null, `${detail} (must differ: ${ok ? 'NOT DETECTED' : 'detected'})`);
    else report('zoom', `${backend} ${cfg.name}`, ok, detail);
  }
}

// ------------------------------------------------------------------ 2. flicker

// The heat is read one texel at a time from a target the adaptive budget may
// have lowered to a quarter resolution, so it is the noisier of the two.
const FLICKER_HEAT = 0.05;
const FLICKER_RGB = 6;

/**
 * Sparkle at the probe points over a run of frames: the largest departure of a
 * frame from the average of its neighbours. A steady change - the view sliding
 * over a gradient, the exposure gliding - leaves it near zero; a value that
 * jumps and comes back does not.
 */
function sparkle(series) {
  let heat = 0;
  let rgb = 0;
  const mean = series.reduce((a, s) => a + (s.heat ?? 0), 0) / series.length || 1;
  for (let k = 1; k < series.length - 1; k++) {
    const [a, b, c] = [series[k - 1], series[k], series[k + 1]];
    if (a.heat !== null && b.heat !== null && c.heat !== null) heat = Math.max(heat, Math.abs(b.heat - (a.heat + c.heat) / 2) / mean);
    rgb = Math.max(rgb, ...b.rgb.map((v, i) => Math.abs(v - (a.rgb[i] + c.rgb[i]) / 2)));
  }
  return { heat, rgb };
}

/** One small camera move a frame, oblique over the blob, sampling the same world points each frame. */
async function moveSeries(page, kind, pump, frames = 24) {
  return page.evaluate(
    async ({ kind, frames, pts, pump }) => {
      const eng = globalThis.__3dheat_engine;
      const vc = globalThis.__vc;
      let az = 0.6;
      let dist = 420;
      const place = (dx) =>
        eng.placeCamera({ x: dx + Math.sin(az) * dist * 0.7, y: dist * 0.7, z: Math.cos(az) * dist * 0.7 }, { x: dx, y: 0, z: 0 });
      place(0);
      await vc.settle();
      const out = [];
      let dx = 0;
      for (let k = 0; k < frames; k++) {
        if (kind === 'pan') dx += 0.6;
        if (kind === 'orbit') az += 0.004;
        if (kind === 'dolly') dist *= 0.99;
        place(dx);
        if (pump) {
          const st = globalThis.__3dheat.useStore.getState();
          st.patchHeat({ saturation: st.heat.saturation * (k % 2 ? pump : 1 / pump) });
        }
        await vc.frames(2);
        out.push(await vc.sample(pts));
      }
      return out;
    },
    { kind, frames, pts: PROBE, pump: pump ?? 0 },
  );
}

/** Playback under a still camera: the playhead stepped a sixtieth of a second at 4x per frame. */
async function playSeries(page, [from, step], frames = 30) {
  return page.evaluate(
    async ({ frames, pts, from, step }) => {
      const eng = globalThis.__3dheat_engine;
      const vc = globalThis.__vc;
      const st = globalThis.__3dheat.useStore;
      eng.placeCamera({ x: 0, y: 300, z: 250 }, { x: 0, y: 0, z: 0 });
      st.getState().seek(from);
      await vc.settle();
      const out = [];
      for (let k = 1; k <= frames; k++) {
        st.getState().seek(from + k * step);
        await vc.frames(2);
        out.push(await vc.sample(pts));
      }
      return out;
    },
    { frames, pts: PROBE, from, step },
  );
}

async function checkFlicker(page, backend, pick) {
  const settings = [
    ...HEAT_SETTINGS,
    // Exposure pumping 5% up and down every frame: a flicker the check must see.
    // (A starved sprite budget is no control: a moving frame raises it to
    // draw every row, see tools/probe-flicker.mjs.)
    { name: 'control: exposure pumping 5%', mode: 'heat-simple', heat: {}, timeline: ALL, control: true, pump: 1.05 },
  ].filter(pick);
  for (const cfg of settings) {
    await applyHeat(page, cfg);
    await page.evaluate((b) => {
      const s = globalThis.__3dheat.useStore.getState();
      if (b) s.patchBudget(b);
      else s.patchBudget({ splatsPerFrame: 4_000_000, adaptive: true });
    }, cfg.budget ?? null);
    const kinds = cfg.play ? (cfg.routes ? ['play'] : ['pan', 'orbit', 'dolly', 'play']) : ['pan', 'orbit', 'dolly'];
    for (const kind of kinds) {
      const series = kind === 'play' ? await playSeries(page, cfg.play) : await moveSeries(page, kind, cfg.pump);
      const sp = sparkle(series);
      const sat = series.map((s) => s.sat);
      const satMove = Math.max(...sat) / Math.min(...sat) - 1;
      // A run that read no heat at all would pass by having nothing to flicker.
      const lit = series.every((x) => x.heat !== null && x.heat > 0);
      const ok = lit && sp.heat <= FLICKER_HEAT && sp.rgb <= FLICKER_RGB;
      const detail = `${lit ? '' : 'NO HEAT READ, '}heat ${pct(sp.heat)}, colour ${sp.rgb.toFixed(1)}/255${satMove > 1e-6 ? `, exposure moved ${pct(satMove)}` : ''}`;
      if (cfg.control) report('flicker', `${backend} ${cfg.name}, ${kind}`, null, `${detail} (must flicker: ${ok ? 'NOT DETECTED' : 'detected'})`);
      else report('flicker', `${backend} ${cfg.name}, ${kind}`, ok, detail);
    }
  }
  await page.evaluate(() => globalThis.__3dheat.useStore.getState().patchBudget({ splatsPerFrame: 4_000_000, adaptive: true }));

  // Follow exposure under small moves with pauses: nudge, rest long enough for
  // it to meter, nudge again. The same place must keep its scale.
  for (const mode of ['heat-simple', 'heat-lines'].filter((m) => pick({ mode: m }))) {
    await applyHeat(page, { mode, heat: { followExposure: true }, timeline: ALL });
    const sat = await page.evaluate(async () => {
      const eng = globalThis.__3dheat_engine;
      const vc = globalThis.__vc;
      const st = globalThis.__3dheat.useStore;
      eng.placeCamera({ x: 0, y: 160, z: 120 }, { x: 0, y: 0, z: 0 });
      await vc.settle();
      const out = [st.getState().heat.saturation];
      for (let k = 0; k < 8; k++) {
        for (let i = 0; i < 4; i++) {
          eng.camera.position.x += 0.8 * (k % 2 ? -1 : 1);
          eng.camera.moved = true;
          await vc.frames(1);
        }
        await vc.frames(30);
        out.push(st.getState().heat.saturation);
      }
      return out;
    });
    const move = Math.max(...sat) / Math.min(...sat) - 1;
    report('flicker', `${backend} ${mode} follow exposure, nudge and rest`, move < 0.01, `exposure moved ${pct(move)} over 8 nudges`);
  }
}

// ------------------------------------------------------------------ 3. jitter

/**
 * Four aircraft circling far from the origin, as a DCS theatre puts them, sampled
 * about five times a second at irregular intervals over five hours. Unit 0 is
 * the one followed: 250 m/s on a 3 km circle.
 */
async function loadFlight(page, far = true) {
  return page.evaluate((far) => {
    let seed = 99;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const CX = far ? 700_000 : 0;
    const CZ = far ? -650_000 : 0;
    const HOURS = 5;
    const rows = [];
    const units = [
      { v: 250, R: 3000, ox: 0, oz: 0, y: 5000 },
      { v: 200, R: 2500, ox: 400, oz: 300, y: 4000 },
      { v: 150, R: 4000, ox: -800, oz: 200, y: 6000 },
      { v: 220, R: 3500, ox: 300, oz: -900, y: 3000 },
    ];
    units.forEach((u, p) => {
      for (let t = 0; t <= HOURS * 3600; t += 0.2 * (0.6 + 0.8 * rnd())) {
        const tt = Math.fround(t);
        const a = (u.v * tt) / u.R;
        rows.push({ p, t: tt, x: CX + u.ox + u.R * Math.sin(a), y: u.y, z: CZ + u.oz - u.R * Math.cos(a), yaw: a });
      }
    });
    rows.sort((a, b) => a.t - b.t);
    const n = rows.length;
    const kinds = { name: 'kind', kind: 'category', data: new Uint32Array(n), min: 0, max: 0, categories: ['aircraft'] };
    const s = globalThis.__3dheat.useStore.getState();
    s.setLevel?.(null);
    s.setDataset({
      id: `visual-flight-${CX}`, name: 'visual check flight', count: n,
      px: Float32Array.from(rows, (r) => r.x), py: Float32Array.from(rows, (r) => r.y), pz: Float32Array.from(rows, (r) => r.z),
      time: Float32Array.from(rows, (r) => r.t), epochMs: null, lifetime: null, maxLifetimeGap: 0, personShared: null,
      yaw: Float32Array.from(rows, (r) => r.yaw), pitch: new Float32Array(n),
      personId: Uint32Array.from(rows, (r) => r.p), teamId: Uint16Array.from(rows, (r) => r.p % 2),
      personLabels: units.map((_, p) => `u${p}`), teamLabels: ['blue', 'red'],
      sessionId: null, sessionLabels: [], sessionRows: null, sessionStart: null, sessionEnd: null,
      personTeam: Uint16Array.from(units, (_, p) => p % 2), personSlot: null, teamSizes: Uint32Array.of(2, 2),
      attrs: [kinds], warnings: [],
      bounds: { minX: CX - 5000, minY: 2900, minZ: CZ - 5000, maxX: CX + 5000, maxY: 6100, maxZ: CZ + 5000 },
      timeRange: [rows[0].t, rows[n - 1].t], timeSorted: true,
    });
    s.setMode('team');
    s.patchTimeline({ mode: 'play', window: 'cumulative', playing: false, speed: 1 });
    // Big figures, so the drawn one is a solid block of pixels whose centre can be measured.
    s.patchTeam({ trailSeconds: 0, figureScale: 2, showLookDirection: false });
    if (globalThis.__3dheat.useStore.getState().showGrid) s.toggle('showGrid');
    globalThis.__3dheat_replay.getState().setDropLines?.(false);
    return { end: rows[n - 1].t, CX, CZ };
  }, far);
}

/**
 * Step the playhead a sixtieth of a second a frame and record, per frame: the
 * followed unit as the engine placed it (when the CPU has it), where its true
 * position lands on screen, where its figure was actually drawn (the centroid
 * of the pixels that differ from the empty background around it), and the
 * camera.
 */
async function flySeries(page, follow, start, frames, flight) {
  return page.evaluate(
    async ({ follow, start, frames, flight, wantCrops }) => {
      const eng = globalThis.__3dheat_engine;
      const vc = globalThis.__vc;
      const st = globalThis.__3dheat.useStore;
      const rp = globalThis.__3dheat_replay;
      const truth = (t) => {
        const a = (250 * t) / 3000;
        return [flight.CX + 3000 * Math.sin(a), 5000, flight.CZ - 3000 * Math.cos(a)];
      };
      if (follow) rp.setState({ follow: 0, followMode: follow, followDistance: 60, targetPerson: 1 });
      else rp.setState({ follow: null });
      st.getState().seek(start - 2);
      await vc.frames(3);
      if (!follow) {
        // The heatmap's figures under a still camera, a few hundred metres off.
        const [x, y, z] = truth(start + 0.75);
        eng.placeCamera({ x: x - 250, y: y + 150, z: z + 250 }, { x, y, z });
      }
      const out = [];
      const crops = wantCrops ? [] : null;
      // Two seconds to settle any easing, then the run.
      for (let k = -120; k < frames; k++) {
        const t = start + k / 60;
        st.getState().seek(t);
        await vc.frames(1);
        // Captured during the warm-up too: a capture forces extra frames, and
        // anything eased per frame has to have settled into that rhythm.
        if (k < 0) {
          await eng.captureFrame();
          continue;
        }
        const u = eng.liveTracks.find((x) => x.person === 0);
        const placed = u ? eng.project(u.x, u.y, u.z) : null;
        const tp = eng.project(...truth(t));
        let centroid = null;
        const f = await eng.captureFrame();
        if (f && tp) {
          // The background, from the frame's corners.
          const bg = [0, 0, 0];
          for (const [cx, cy] of [[2, 2], [f.width - 3, 2], [2, f.height - 3], [f.width - 3, f.height - 3]]) {
            const i = (cy * f.width + cx) * 4;
            for (let c = 0; c < 3; c++) bg[c] += f.rgba[i + c] / 4;
          }
          const sx = f.width / eng.canvas.clientWidth;
          const r = 200;
          const x0 = Math.max(0, Math.floor((tp.x - r) * sx)), x1 = Math.min(f.width - 1, Math.ceil((tp.x + r) * sx));
          const y0 = Math.max(0, Math.floor((tp.y - r) * sx)), y1 = Math.min(f.height - 1, Math.ceil((tp.y + r) * sx));
          const lit = (x, y) => {
            if (x < 0 || y < 0 || x >= f.width || y >= f.height) return 0;
            const i = (y * f.width + x) * 4;
            const d = Math.abs(f.rgba[i] - bg[0]) + Math.abs(f.rgba[i + 1] - bg[1]) + Math.abs(f.rgba[i + 2] - bg[2]);
            // On or off, not weighted by colour: the shading of a turning figure
            // must not move its centre.
            return d > 40 ? 1 : 0;
          };
          // The figure's body only: a pixel counts when its four neighbours are
          // lit too, which drops one-pixel lines (the label's stalk, look lines)
          // whose aliasing would move the centroid more than any jitter.
          let sw = 0, swx = 0, swy = 0;
          for (let y = y0; y <= y1; y++) {
            for (let x = x0; x <= x1; x++) {
              const d = lit(x, y);
              if (d && lit(x - 1, y) && lit(x + 1, y) && lit(x, y - 1) && lit(x, y + 1)) {
                sw += d;
                swx += d * x;
                swy += d * y;
              }
            }
          }
          if (sw > 0) centroid = [swx / sw / sx, swy / sw / sx];
          if (crops && k < 6) {
            const cv = document.createElement('canvas');
            cv.width = x1 - x0 + 1;
            cv.height = y1 - y0 + 1;
            const img = cv.getContext('2d').createImageData(cv.width, cv.height);
            for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) for (let c = 0; c < 4; c++) img.data[((y - y0) * cv.width + (x - x0)) * 4 + c] = c === 3 ? 255 : f.rgba[(y * f.width + x) * 4 + c];
            cv.getContext('2d').putImageData(img, 0, 0);
            crops.push(cv.toDataURL('image/png'));
          }
        }
        const c = eng.camera;
        out.push({
          u: u ? [u.x, u.y, u.z] : null,
          placed: placed ? [placed.x, placed.y] : null,
          c: centroid,
          cam: [c.position.x, c.position.y, c.position.z],
          ang: [c.yaw, c.pitch, c.roll ?? 0],
        });
      }
      const fov = st.getState().camera.fov;
      return { out, crops, focal: eng.canvas.clientHeight / (2 * Math.tan((fov * Math.PI) / 360)) };
    },
    { follow, start, frames, flight, wantCrops: !!opt('dump') },
  );
}

/** Largest second difference of a vector series, skipping gaps. */
function second(series) {
  let worst = 0;
  for (let k = 2; k < series.length; k++) {
    const [a, b, c] = [series[k - 2], series[k - 1], series[k]];
    if (!a || !b || !c) continue;
    worst = Math.max(worst, Math.hypot(...a.map((v, i) => c[i] - 2 * b[i] + v)));
  }
  return worst;
}

/**
 * How unevenly a point moves along the test circle, as a fraction of one
 * frame's travel: its second difference less the circle's own (v^2/R h^2).
 */
function pathJitter(series) {
  const h = 1 / 60;
  const expect2 = ((250 * 250) / 3000) * h * h;
  let worst = 0;
  for (let k = 2; k < series.length; k++) {
    const [a, b, c] = [series[k - 2], series[k - 1], series[k]];
    if (!a || !b || !c) continue;
    const d2 = Math.hypot(c[0] - 2 * b[0] + a[0], c[1] - 2 * b[1] + a[1], c[2] - 2 * b[2] + a[2]);
    worst = Math.max(worst, Math.abs(d2 - expect2) / (250 * h));
  }
  return worst;
}

const JITTER_WORLD = 0.01;
const JITTER_PX = 0.5;
const JITTER_STILL_PX = 2.5;

async function checkJitter(backend) {
  for (const path of ['cpu', 'gpu']) {
    const { browser, page } = await open(backend, `&gputracks=${path === 'gpu' ? 1 : 0}`);
    try {
      // Far from the origin as a DCS theatre, then the same flight at the
      // origin as the control: what only the far one shows is the distance.
      for (const far of [true, false]) {
      const flight = await loadFlight(page, far);
      await page.waitForTimeout(2500);
      const info = await page.evaluate(() => globalThis.__3dheat_engine.gpuTracksInfo());
      if (path === 'gpu' && !info) {
        report('jitter', `${backend} gpu tracks`, null, 'GPU tracks not active on this backend; skipped');
        break;
      }
      const modes = far ? [null, 'chase', 'orbit', 'fixed', 'satellite', 'cockpit', 'padlock'] : [null, 'chase'];
      for (const follow of modes.filter((f) => !opt('follow') || String(f) === opt('follow'))) {
        const name = `${backend} ${path === 'gpu' ? 'GPU tracks' : 'CPU figures'}, ${follow ? `follow ${follow}` : 'still camera'}${far ? '' : ', control at the origin'}`;
        // Late in the recording, where a long track's times are largest.
        const { out: s, focal, crops } = await flySeries(page, follow, flight.end - 40, 90, flight);
        if (crops) crops.forEach((u, i) => fs.writeFileSync(`${opt('dump')}/${path}-${follow ?? 'still'}-${i}.png`, Buffer.from(u.split(',')[1], 'base64')));
        if (opt('shot')) await page.screenshot({ path: `${opt('shot')}/${path}-${follow ?? 'still'}.png` });
        if (opt('dump')) fs.writeFileSync(`${opt('dump')}/${path}-${follow ?? 'still'}.json`, JSON.stringify(s));
        const parts = [];
        let ok = true;
        // The unit as the engine placed it, where the CPU has it.
        if (s.some((f) => f.u)) {
          const world = pathJitter(s.map((f) => f.u));
          ok &&= world <= JITTER_WORLD;
          parts.push(`unit ${pct(world)} of a frame's travel`);
        }
        if (follow === 'cockpit' || follow === 'padlock') {
          // The unit is the camera here: the view itself has to move smoothly.
          const pos = pathJitter(s.map((f) => f.cam));
          const turn = second(s.map((f) => f.ang)) * focal;
          ok &&= pos <= JITTER_WORLD && turn <= JITTER_PX;
          parts.push(`eye ${pct(pos)} of a frame's travel, view turns unevenly by ${turn.toFixed(2)} px`);
        } else {
          const drawn = s.filter((f) => f.c).length;
          const pixels = second(s.map((f) => f.c));
          // A figure crossing a still view turns and changes shape, which moves
          // its silhouette's centre by itself: about 1.6 px at the origin, so
          // the still view is held to what that leaves room for.
          ok &&= pixels <= (follow ? JITTER_PX : JITTER_STILL_PX) && drawn > s.length * 0.8;
          parts.push(`drawn figure ${pixels.toFixed(2)} px (${drawn}/${s.length} frames)`);
          if (s.some((f) => f.placed)) parts.push(`placed ${second(s.map((f) => f.placed)).toFixed(2)} px`);
        }
        report('jitter', name, far ? ok : null, parts.join(', '));
      }
      }
    } finally {
      await browser.close();
    }
  }
}

// ------------------------------------------------------------------ 4. frame time

/**
 * On a real GPU, no frame past 20 ms, at the 99th percentile or at all. The
 * display paces frames at 16.7 ms and a dropped one shows as 33; what lies
 * between is the browser's timer jitter, not a frame lost.
 */
const FRAME_P99_MS = 20;
const FRAME_MAX_MS = 20;
/**
 * Fastest the exposure may move in playback, in natural-log units a second: the
 * follower's glide across a factor of three, at its steepest. A jump is far past it.
 */
const EXPOSURE_RATE = 1.5;

const quantile = (xs, q) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.min(s.length - 1, Math.floor(q * s.length))] : NaN;
};

async function checkFrameTime(backend) {
  const gpu = argv.includes('--gpu');
  const { browser, page } = await open(backend, '', gpu);
  try {
    await loadBlob(page, false);
    await page.evaluate(() => {
      const s = globalThis.__3dheat.useStore.getState();
      s.patchHeat({ followExposure: true, radius: 16 });
      s.patchBudget({ adaptive: true });
    });
    // A still view, after it has settled: nothing it controls may move, and
    // no frame may draw anything new.
    const still = await page.evaluate(async () => {
      const eng = globalThis.__3dheat_engine;
      eng.placeCamera({ x: 300, y: 500, z: 400 }, { x: 0, y: 0, z: 0 });
      await globalThis.__vc.settle();
      const rows = [];
      for (let i = 0; i < 150; i++) {
        await globalThis.__vc.frame();
        rows.push([eng.live.heatScale, eng.live.budget, eng.shownSaturation, eng.live.accumMode]);
      }
      return rows;
    });
    const distinct = (i) => new Set(still.map((r) => r[i])).size;
    const drew = still.filter((r) => r[3] !== 'skip').length;
    report('frametime', `${backend} still view`, distinct(0) === 1 && distinct(1) === 1 && distinct(2) === 1 && drew === 0,
      `over ${still.length} frames: ${distinct(0)} heat scale(s), ${distinct(1)} budget(s), ${distinct(2)} exposure(s), ${drew} frame(s) redrawn`);

    // Flying and zooming in and out, with the radius stepping up under it.
    const motion = await page.evaluate(async () => {
      const eng = globalThis.__3dheat_engine;
      const st = globalThis.__3dheat.useStore;
      const dts = [];
      const why = [];
      let last = performance.now();
      const t0 = last;
      const radii = [16, 40, 118, 200, 400];
      for (;;) {
        await globalThis.__vc.frame();
        const now = performance.now();
        dts.push(now - last);
        const l = eng.live;
        const gpu = Object.entries(eng.renderer.gpuPassMs ?? {}).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(' ');
        why.push(`${(now - last).toFixed(1)} ms at radius ${st.getState().heat.radius}, scale ${l.heatScale}, ${l.splats} sprites, ${l.accumMode}; GPU ms ${gpu || '-'}`);
        last = now;
        const t = (now - t0) / 1000;
        if (t > 5) break;
        const r = radii[Math.min(radii.length - 1, Math.floor(t))];
        if (st.getState().heat.radius !== r) st.getState().patchHeat({ radius: r });
        const d = 700 * (1.1 + Math.sin(t * 1.3));
        eng.placeCamera({ x: d * Math.cos(t * 0.7), y: d * 0.7 + 30, z: d * Math.sin(t * 0.7) }, { x: 0, y: 0, z: 0 });
      }
      return { dts: dts.slice(3), why: why.slice(3) };
    });
    if (verbose) {
      const worst = motion.dts.map((d, i) => [d, i]).sort((a, b) => b[0] - a[0]).slice(0, 6);
      for (const [, i] of worst) console.log(`    slow frame ${i}: ${motion.why[i]} (before: ${motion.why[i - 1] ?? '-'})`);
    }

    // Playback under a still camera: frames on time, exposure moving gently.
    const play = await page.evaluate(async () => {
      const eng = globalThis.__3dheat_engine;
      const s = globalThis.__3dheat.useStore.getState();
      s.patchHeat({ radius: 16 });
      eng.placeCamera({ x: 300, y: 500, z: 400 }, { x: 0, y: 0, z: 0 });
      await globalThis.__vc.settle();
      s.patchTimeline({ mode: 'play', window: 'cumulative', playing: true, speed: 20 });
      const rows = [];
      let last = performance.now();
      const t0 = last;
      while (last - t0 < 3000) {
        await globalThis.__vc.frame();
        const now = performance.now();
        rows.push([now - last, eng.shownSaturation]);
        last = now;
      }
      s.patchTimeline({ playing: false });
      return rows.slice(3);
    });
    let rate = 0;
    for (let i = 1; i < play.length; i++) {
      rate = Math.max(rate, Math.abs(Math.log(play[i][1] / play[i - 1][1])) / Math.max(1e-3, play[i][0] / 1000));
    }
    report('frametime', `${backend} playback exposure`, rate <= EXPOSURE_RATE, `fastest change ${rate.toFixed(2)}/s (limit ${EXPOSURE_RATE})`);

    // A dataset of ten million rows set while the camera flies: it arrives a
    // slice a frame, so no frame may stall for it. Built before the clock
    // starts; building it is the test's work, not the viewer's.
    const load = await page.evaluate(async () => {
      const eng = globalThis.__3dheat_engine;
      const st = globalThis.__3dheat.useStore;
      const n = 10_000_000;
      const P = 5000;
      const px = new Float32Array(n);
      const py = new Float32Array(n);
      const pz = new Float32Array(n);
      const time = new Float32Array(n);
      const personId = new Uint32Array(n);
      for (let i = 0; i < n; i++) {
        const p = i % P;
        const k = (i - p) / P;
        px[i] = Math.cos(p) * 400 + Math.sin(k * 0.01 + p) * 150;
        pz[i] = Math.sin(p * 1.7) * 400 + Math.cos(k * 0.013 + p) * 150;
        py[i] = 1;
        time[i] = k;
        personId[i] = p;
      }
      const ds = {
        id: 'frametime-load', name: 'frametime-load', count: n, px, py, pz, time,
        epochMs: null, lifetime: null, maxLifetimeGap: 0, personShared: null, yaw: null, pitch: null,
        personId, teamId: new Uint16Array(n), personLabels: Array.from({ length: P }, (_, p) => 'p' + p), teamLabels: ['a'],
        sessionId: null, sessionLabels: [], sessionRows: null, sessionStart: null, sessionEnd: null,
        personTeam: new Uint16Array(P), personSlot: null, teamSizes: Uint32Array.of(P), attrs: [], warnings: [],
        bounds: { minX: -560, minY: 0, minZ: -560, maxX: 560, maxY: 2, maxZ: 560 }, timeRange: [0, n / P - 1], timeSorted: true,
      };
      st.getState().patchHeat({ radius: 16 });
      const dts = [];
      let last = performance.now();
      const t0 = last;
      let set = false;
      let setAt = -1;
      for (;;) {
        await globalThis.__vc.frame();
        const now = performance.now();
        dts.push(now - last);
        last = now;
        const t = (now - t0) / 1000;
        if (t > 4) break;
        if (!set && t > 0.5) {
          set = true;
          setAt = dts.length - 3;
          st.getState().setDataset(ds);
        }
        const d = 900 + 300 * Math.sin(t);
        eng.placeCamera({ x: d * Math.cos(t * 0.5), y: d * 0.6, z: d * Math.sin(t * 0.5) }, { x: 0, y: 0, z: 0 });
      }
      return { dts: dts.slice(3), setAt };
    });
    if (verbose) {
      const worst = load.dts.map((d, i) => [d, i]).sort((a, b) => b[0] - a[0]).slice(0, 4);
      console.log(`    load: set on frame ${load.setAt}; slowest ${worst.map(([d, i]) => `${d.toFixed(1)} ms at ${i}`).join(', ')}`);
    }

    for (const [name, dts] of [['motion', motion.dts], ['playback', play.map((r) => r[0])], ['dataset load in flight', load.dts]]) {
      const p50 = quantile(dts, 0.5);
      const p99 = quantile(dts, 0.99);
      const max = Math.max(...dts);
      const detail = `${dts.length} frames: p50 ${p50.toFixed(1)} ms, p99 ${p99.toFixed(1)} ms, max ${max.toFixed(1)} ms`;
      if (gpu) report('frametime', `${backend} ${name}`, p99 <= FRAME_P99_MS && max <= FRAME_MAX_MS, `${detail} (limits ${FRAME_P99_MS.toFixed(1)} / ${FRAME_MAX_MS})`);
      else report('frametime', `${backend} ${name}`, null, `${detail} (software rendering: reported, not judged)`);
    }
  } finally {
    await browser.close();
  }
}

// ------------------------------------------------------------------ run

try {
  for (const backend of backends) {
    console.log(`\n${backend}`);
    if (want('zoom') || want('flicker')) {
      const { browser, page } = await open(backend);
      try {
        // Point heat on the blob, then line heat on its own routes.
        for (const routes of [false, true]) {
          const pick = (cfg) => (cfg.routes ?? cfg.mode === 'heat-lines') === routes && (!opt('setting') || cfg.name === undefined || new RegExp(opt('setting')).test(cfg.name));
          await loadBlob(page, routes);
          if (want('zoom')) await checkZoom(page, backend, pick);
          if (want('flicker')) await checkFlicker(page, backend, pick);
        }
      } finally {
        await browser.close();
      }
    }
    if (want('jitter')) await checkJitter(backend);
    if (want('frametime')) await checkFrameTime(backend);
  }
} finally {
  stop();
}

console.log('\nsummary');
for (const property of ['zoom', 'flicker', 'jitter', 'frametime']) {
  const mine = results.filter((r) => r.property === property && r.pass !== null);
  if (!mine.length) continue;
  const failed = mine.filter((r) => !r.pass);
  console.log(`  ${property.padEnd(8)} ${failed.length ? 'FAIL' : 'pass'}  ${mine.length - failed.length}/${mine.length} settings${failed.length ? ` - failing: ${failed.map((r) => r.setting).join('; ')}` : ''}`);
}
const controls = results.filter((r) => r.pass === null && /NOT DETECTED/.test(r.detail));
if (controls.length) console.log(`  controls not detected (the check has no teeth there): ${controls.map((r) => r.setting).join('; ')}`);
const anyFail = results.some((r) => r.pass === false);
process.exit(anyFail ? 1 : 0);
