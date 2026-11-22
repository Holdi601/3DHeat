/**
 * The native viewport (Stage 5) against the web engine, in the same app, on the same load.
 *
 *   node native/tools/probe-native-viewport.mjs --dir <rowceiling folder> --rows 10,100
 *        [--exe <3dheat-app.exe>] [--out <folder>] [--seconds 8]
 *        [--cases exposure,heat,teams,filter,window,split,figures,cubes,overlays,lines,directions,rate,structures|none]
 *        [--backends webgpu,native] [--matches 1000] [--units 20]
 *   node native/tools/probe-native-viewport.mjs --cases tracks,tracks-cpu --matches 1000 --units 20
 *
 * For each load, starts the built app twice - the web engine (WebGPU in the app's
 * WebView2), then the native viewport (Settings > Native viewport) - picks the
 * row-ceiling tables (`tools/probe-row-ceiling.mjs`; synthetic) the way a person
 * picks files, so the core builds the dataset, and then:
 *
 *   parity   per case (plain heat, team colours, a filter, a time window, a column split): the
 *            converged heat field of each, compared as `tools/probe-heat-binning.mjs`
 *            compares its two paths - p50/p90/p99 of the lit texels within 1 %,
 *            SSIM >= 0.99 - and the composited pictures (mean and 99th percentile of
 *            the per-pixel difference, pixels off by more than 8/255); both written
 *            as PNG to --out. The box replay (figures, cubes) has no heat: its pictures
 *            alone, within 1/255 on average and 1 % of pixels. overlays: synthetic capture
 *            zones (on the ground and over the picture), spawn marks with their lines and three
 *            range shells (two spheres, a cone) put into every frame's parameters, over the
 *            plain heat: the pictures, as the box replay. lines: line heat (each person's route).
 *            directions: 90 degree wedges by movement with the direction field's arrows and
 *            streamlines (held still) over them. rate: the column split as a rate map. These three
 *            gate as the heat cases, the field and the picture. structures: a synthetic model
 *            level (ground under the rows, a lake, a grid of see-through walls with their edges)
 *            with occlusion on, so the walls dim the heat behind them through the peeled
 *            layers, and the cut behind the ground reads the structure depth
 *   tracks   GPU tracks: a synthetic load built in the page, --matches overlaid matches of --units
 *            units each (made up: circles on an empty map, 2 minutes of samples a unit), the box
 *            replay with figures at the middle of the recording, placed by the GPU (`gpuTracks/`)
 *            on both backends; the pictures, as the box replay. tracks-cpu: the same load with
 *            the GPU tracks off (`?gputracks=0`), every unit placed on the CPU - compared with the
 *            GPU path's picture of the same backend (reported, not gated: the CPU path picks its
 *            figures' detail by its own rules). Without --dir (only tracks cases) no files load,
 *            and the frames below are taken on the synthetic load, the GPU tracks on
 *   exposure the first auto-exposure after each load (the first and three loads of the same
 *            files again, the same view): every one within 1 % of the web's first - a meter
 *            that read the field before all rows were drawn, or before the frame it meant,
 *            exposes differently while the converged fields still agree
 *   frames   camera orbit with the timeline playing: the page's frame intervals, and
 *            for the native viewport its own present intervals (p50 / p99 / max, the
 *            no-frame-drops rule: judged by p99 and max)
 *   load     until every row is on the GPU
 *
 * Exits 1 when a parity gate fails. Windows (WebView2's DevTools port). Needs the
 * real GPU: check nothing else is using it (a game) before running.
 */
import { spawn } from 'node:child_process';
import { existsSync, linkSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { deflateSync } from 'node:zlib';
import { chromium } from 'playwright';

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
};
const target = process.env.CARGO_TARGET_DIR ?? resolve(import.meta.dirname, '..', 'target');
const exe = arg('exe', join(target, 'release', '3dheat-app.exe'));
const dir = arg('dir', null);
const out = resolve(arg('out', join(process.env.TEMP ?? '.', 'heat3d-native-viewport')));
const secs = Number(arg('seconds', 8));
const cases = String(arg('cases', 'exposure,heat,teams,filter,window,split,figures,cubes,overlays,lines,directions,rate,structures')).split(',').filter((c) => c && c !== 'none');
const backends = String(arg('backends', 'webgpu,native')).split(',');
const PORT = Number(arg('port', 9336));
const matches = Number(arg('matches', 1000));
const unitsPerMatch = Number(arg('units', 20));
const TRACK_CASES = ['tracks', 'tracks-cpu'];
const fileCases = cases.filter((c) => !TRACK_CASES.includes(c));
const loads = fileCases.length ? String(arg('rows', '10')).split(',').map((r) => Number(r) * 1e6) : [0];
const PER_FILE = 10_000_000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
if (!dir && fileCases.length) throw new Error('--dir is required (unless only tracks cases run)');
mkdirSync(out, { recursive: true });

function files(rows) {
  const base = join(dir, `wide-${PER_FILE}-8.parquet`);
  if (!existsSync(base)) throw new Error(`no ${base}: run tools/probe-row-ceiling.mjs --dir ${dir} first`);
  const list = [];
  for (let i = 0; i < Math.ceil(rows / PER_FILE); i++) {
    const p = i === 0 ? base : join(dir, `wide-${PER_FILE}-8-${i}.parquet`);
    if (!existsSync(p)) linkSync(base, p);
    list.push(p);
  }
  return list;
}

// ---------------------------------------------------------------- images

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function png(width, height, rgba) {
  const chunk = (type, data) => {
    const b = Buffer.alloc(12 + data.length);
    b.writeUInt32BE(data.length, 0);
    b.write(type, 4, 'ascii');
    data.copy(b, 8);
    b.writeUInt32BE(crc32(b.subarray(4, 8 + data.length)), 8 + data.length);
    return b;
  };
  const head = Buffer.alloc(13);
  head.writeUInt32BE(width, 0);
  head.writeUInt32BE(height, 4);
  head[8] = 8;
  head[9] = 6;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) Buffer.from(rgba.buffer, rgba.byteOffset + y * width * 4, width * 4).copy(raw, y * (width * 4 + 1) + 1);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', head), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const quantile = (s, p) => (s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : 0);

function ssim(a, b, w, h, range) {
  // Mean SSIM over 8x8 windows, values scaled by `range`.
  const C1 = (0.01 * range) ** 2;
  const C2 = (0.03 * range) ** 2;
  let sum = 0;
  let n = 0;
  for (let y = 0; y + 8 <= h; y += 8)
    for (let x = 0; x + 8 <= w; x += 8) {
      let ma = 0, mb = 0;
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
        ma += a[(y + j) * w + x + i];
        mb += b[(y + j) * w + x + i];
      }
      ma /= 64;
      mb /= 64;
      let va = 0, vb = 0, cv = 0;
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
        const da = a[(y + j) * w + x + i] - ma;
        const db = b[(y + j) * w + x + i] - mb;
        va += da * da;
        vb += db * db;
        cv += da * db;
      }
      va /= 63;
      vb /= 63;
      cv /= 63;
      sum += ((2 * ma * mb + C1) * (2 * cv + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2));
      n++;
    }
  return n ? sum / n : 1;
}

/** As `tools/probe-heat-binning.mjs` compares the heat paths: density channel, lit texels. */
function compareFields(ref, got, w, h, ch) {
  const a = new Float32Array(w * h);
  const b = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    a[i] = ref[i * ch];
    b[i] = got[i * ch];
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
  return { p50: q(0.5), p90: q(0.9), p99: q(0.99), total: rel(ta, tb), ssim: ssim(a, b, w, h, Math.max(1e-30, quantile(lit, 0.9))), lit: lit.length };
}

function comparePictures(a, b) {
  if (!a || !b || a.width !== b.width || a.height !== b.height) return null;
  const d = [];
  let off = 0;
  for (let i = 0; i < a.rgba.length; i += 4) {
    const m = Math.max(Math.abs(a.rgba[i] - b.rgba[i]), Math.abs(a.rgba[i + 1] - b.rgba[i + 1]), Math.abs(a.rgba[i + 2] - b.rgba[i + 2]));
    d.push(m);
    if (m > 8) off++;
  }
  const mean = d.reduce((x, y) => x + y, 0) / d.length;
  d.sort((x, y) => x - y);
  return { mean, p99: quantile(d, 0.99), max: d[d.length - 1], offShare: off / d.length };
}

// ---------------------------------------------------------------- GPU tracks

/**
 * In the page: the synthetic load of `matches` x `units` units (once), the box replay at its middle
 * with every unit a figure, placed by the GPU (`tracks`) or the CPU (`tracks-cpu`, `?gputracks=0`);
 * the picture once converged. The dart threshold is pinned (`dartPx`, which the engine steers by
 * frame time) so both backends pick the same detail. The GPU path is on again when it returns.
 */
async function tracksCase({ c, matches, units }) {
  const useStore = await globalThis.__heat3dNative.store();
  const eng = globalThis.__3dheat_engine;
  const raf = () => new Promise((r) => requestAnimationFrame(r));
  const st = () => useStore.getState();
  const P = matches * units;
  const SAMPLES = 25;
  const DT = 5;
  if (globalThis.__probeTracksLoaded !== P) {
    // Circles on an empty 4 km map, a sample every 5 s for 2 minutes, time-major (sorted by time).
    let seed = 7;
    const rnd = () => {
      seed = (seed + 0x6d2b79f5) >>> 0;
      let t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const unit = Array.from({ length: P }, () => {
      const R = 80 + 400 * rnd();
      return { cx: (rnd() - 0.5) * 3000, cz: (rnd() - 0.5) * 3000, R, w: (15 + 25 * rnd()) / R, ph: rnd() * 2 * Math.PI, y: 200 + 600 * rnd() };
    });
    const n = P * SAMPLES;
    const px = new Float32Array(n), py = new Float32Array(n), pz = new Float32Array(n), time = new Float32Array(n), yaw = new Float32Array(n);
    const personId = new Uint32Array(n), teamId = new Uint16Array(n);
    let i = 0;
    for (let k = 0; k < SAMPLES; k++)
      for (let p = 0; p < P; p++, i++) {
        const u = unit[p];
        const t = k * DT;
        const a = u.ph + u.w * t;
        px[i] = u.cx + u.R * Math.sin(a);
        py[i] = u.y;
        pz[i] = u.cz - u.R * Math.cos(a);
        time[i] = t;
        yaw[i] = a;
        personId[i] = p;
        teamId[i] = p % units < units / 2 ? 0 : 1;
      }
    st().setLevel?.(null);
    st().setDataset({
      id: `probe-tracks-${P}`, name: 'probe tracks', count: n,
      px, py, pz, time, epochMs: null, lifetime: null, maxLifetimeGap: 0, personShared: null,
      yaw, pitch: new Float32Array(n), personId, teamId,
      personLabels: Array.from({ length: P }, (_, p) => `m${Math.floor(p / units)}u${p % units}`), teamLabels: ['blue', 'red'],
      sessionId: null, sessionLabels: [], sessionRows: null, sessionStart: null, sessionEnd: null,
      personTeam: Uint16Array.from({ length: P }, (_, p) => (p % units < units / 2 ? 0 : 1)), personSlot: null, teamSizes: Uint32Array.of(P / 2, P / 2),
      attrs: [{ name: 'kind', kind: 'category', data: new Uint32Array(n), min: 0, max: 0, categories: ['aircraft'] }], warnings: [],
      bounds: { minX: -2000, minY: 150, minZ: -2000, maxX: 2000, maxY: 850, maxZ: 2000 },
      timeRange: [0, (SAMPLES - 1) * DT], timeSorted: true,
    });
    globalThis.__probeTracksLoaded = P;
  }
  const url = new URL(location.href);
  if (c === 'tracks-cpu') url.searchParams.set('gputracks', '0');
  else url.searchParams.delete('gputracks');
  history.replaceState(null, '', url.href);
  st().setMode('team');
  st().patchTeam({ figures: true, showRawSamples: false, trailSeconds: 0, farMode: 'figure', figureScale: 1 });
  st().patchTimeline({ mode: 'play', window: 'cumulative', playing: false });
  st().patchBudget({ adaptive: false, exact: true, heatScale: 1 });
  st().seek(((SAMPLES - 1) * DT) / 2);
  const rd = eng.renderer;
  const own = Object.prototype.hasOwnProperty.call(rd, 'render');
  const orig = rd.render;
  rd.render = function (p) {
    return orig.call(this, p.gpuTracks ? { ...p, gpuTracks: { ...p.gpuTracks, dartPx: 2 } } : p);
  };
  // The store built and over to the GPU (both backends), then still frames.
  const t0 = performance.now();
  if (c === 'tracks') while (performance.now() - t0 < 120_000 && (!eng.gpuTracksInfo() || rd.uploadsPending)) await raf();
  const readyMs = performance.now() - t0;
  for (let i = 0; i < 30; i++) await raf();
  // The same view in every case, once the load has settled (a new load frames itself).
  eng.camera.setOrientationDegrees(30, -40);
  eng.frameDataset(true);
  for (let i = 0; i < 8; i++) {
    eng.camera.moved = true;
    eng.invalidate(2);
    await raf();
  }
  for (let i = 0; i < 120; i++) await raf();
  const info = eng.gpuTracksInfo();
  const cap = await eng.captureFrame();
  if (own) rd.render = orig;
  else delete rd.render;
  url.searchParams.delete('gputracks');
  history.replaceState(null, '', url.href);
  return {
    field: null,
    w: eng.canvas.width,
    h: eng.canvas.height,
    picture: cap ? { width: cap.width, height: cap.height, rgba: Array.from(cap.rgba) } : null,
    info: c === 'tracks' ? info : null,
    gpu: c === 'tracks' ? !!info : false,
    readyMs,
  };
}

// ---------------------------------------------------------------- one run

async function run(rows, backend) {
  const picked = rows > 0 ? files(rows) : [];
  const app = spawn(exe, [], {
    // A WebView2 profile of the probe's own: another app started meanwhile (another probe) shares
    // the default one, and its browser process took this run's page down with it.
    env: { ...process.env, WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${PORT}`, WEBVIEW2_USER_DATA_FOLDER: join(out, `webview2-${PORT}`) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  app.stdout.on('data', (d) => (log += d));
  app.stderr.on('data', (d) => (log += d));
  let browser;
  try {
    for (const until = Date.now() + 120_000; !browser && Date.now() < until; ) {
      try {
        browser = await chromium.connectOverCDP(`http://127.0.0.1:${PORT}`);
      } catch {
        await sleep(200);
      }
    }
    if (!browser) throw new Error(`no DevTools port: ${log}`);
    let page;
    for (let i = 0; i < 300 && !page; i++) {
      page = browser.contexts().flatMap((c) => c.pages()).find((p) => /tauri\.localhost|127\.0\.0\.1/.test(p.url()));
      if (!page) await sleep(100);
    }
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('crash', () => console.error(`${backend}: the page crashed`));
    browser.on('disconnected', () => console.error(`${backend}: the browser went away (app alive: ${app.exitCode === null})`));
    await page.waitForFunction(() => !!globalThis.__3dheat_engine?.live?.backend && globalThis.__3dheat_engine.live.backend !== 'none', null, { timeout: 60_000 });
    // The setting, then the page again so the engine starts with it.
    await page.evaluate((on) => localStorage.setItem('heat3d.nativeViewport', on ? 'on' : 'off'), backend === 'native');
    await page.reload();
    await page.waitForFunction(() => !!globalThis.__heat3dNative && !!globalThis.__3dheat_engine?.live?.backend && globalThis.__3dheat_engine.live.backend !== 'none', null, { timeout: 60_000 });
    const got = await page.evaluate(() => globalThis.__3dheat_engine.live.backend);
    if (got !== backend) throw new Error(`asked for ${backend}, the app runs ${got}: ${log.slice(-2000)}`);
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.id = '__probe_files';
      input.style.display = 'none';
      document.body.appendChild(input);
    });
    const cdp = await page.context().newCDPSession(page);
    const { root } = await cdp.send('DOM.getDocument');
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#__probe_files' });
    await cdp.send('DOM.setFileInputFiles', { nodeId, files: picked });
    const extra = Array.from({ length: 8 }, (_, i) => `m${i}`);
    const mapping = {
      x: 'x', y: 'y', z: 'z', time: 'time', personId: 'player', teamId: 'team', extra: ['m0'], onDemand: extra.slice(1),
      extraNumeric: Object.fromEntries(extra.map((c) => [c, true])),
      axes: { up: 'z', flipX: false, flipY: false, flipZ: false, scale: 1 },
    };
    const loadOnce = () =>
      page.evaluate(async (m) => {
        const useStore = await globalThis.__heat3dNative.store();
        const t0 = performance.now();
        const files = [...document.getElementById('__probe_files').files];
        const eng = globalThis.__3dheat_engine;
        const metered = eng.exposuresMetered ?? 0;
        const r = await globalThis.__heat3dNative.loadFiles(files, 1, m, true);
        const until = performance.now() + 600_000;
        await new Promise((res) => setTimeout(res, 300));
        // The native renderer counts the rows it planned at once: its `dataPending` says when they are on the GPU.
        while (performance.now() < until && (eng.live.residentRows + eng.live.droppedRows < r.rows || eng.renderer.dataPending)) await new Promise((res) => setTimeout(res, 20));
        const loadMs = performance.now() - t0;
        // The first auto-exposure of this load (metered a few frames after the rows are all drawn).
        for (const end = performance.now() + 30_000; (eng.exposuresMetered ?? 0) === metered && performance.now() < end; ) await new Promise((res) => setTimeout(res, 20));
        const exposure = (eng.exposuresMetered ?? 0) > metered ? useStore.getState().heat.saturation : null;
        return { rows: r.rows, loadMs, resident: eng.live.residentRows, dropped: eng.live.droppedRows, exposure };
      }, mapping);
    const load = picked.length ? await loadOnce() : { rows: 0, loadMs: 0, resident: 0, dropped: 0, exposure: null };
    // The same files again, three times: the meter must not catch a load still arriving (a snapshot
    // of the last load's rows) nor a frame other than the one it meant.
    const exposures = [load.exposure];
    if (cases.includes('exposure') && picked.length) for (let i = 0; i < 3; i++) exposures.push((await loadOnce()).exposure);

    // Parity: converged fields and pictures, case by case, the same steps in both runs.
    const parity = {};
    // The tracks cases last: they replace the load with their own.
    const order = [...fileCases.filter((c) => c !== 'exposure'), ...TRACK_CASES.filter((c) => cases.includes(c))];
    for (const c of order) {
      if (TRACK_CASES.includes(c)) {
        parity[c] = await page.evaluate(tracksCase, { c, matches, units: unitsPerMatch });
        continue;
      }
      parity[c] = await page.evaluate(async (c) => {
        const useStore = await globalThis.__heat3dNative.store();
        const eng = globalThis.__3dheat_engine;
        const st = useStore.getState();
        const raf = () => new Promise((r) => requestAnimationFrame(r));
        const base = JSON.parse(JSON.stringify({ heat: st.heat, budget: st.budget, mode: st.mode, timeline: st.timeline, team: st.team }));
        st.patchBudget({ adaptive: false, exact: true, heatScale: 1 });
        eng.camera.setOrientationDegrees(30, -40);
        eng.frameDataset(true);
        if (c === 'teams') st.setMode('heat-teams');
        if (c === 'filter') {
          // The first measure, middle half of its range: a filter column from the core.
          const a = st.dataset.attrs.find((x) => x.kind === 'number') ?? null;
          if (a) st.setFilters([{ kind: 'range', column: a.name, min: a.min + (a.max - a.min) * 0.25, max: a.min + (a.max - a.min) * 0.75 }]);
        }
        if (c === 'lines') st.setMode('heat-lines');
        if (c === 'structures') {
          // A synthetic level in display space: the ground just under the rows, a lake in one corner,
          // and a 4 x 4 grid of walls (two crossing quads each) as tall as the rows' height span.
          const b = eng.toDisplay(eng.dataset.bounds);
          const y0 = b.minY - (b.maxY - b.minY) * 0.02, y1 = b.maxY;
          const v = [], ground = [], structure = [], edges = [], water = [];
          const vert = (x, y, z, nx, ny, nz) => (v.push(x, y, z, nx, ny, nz), v.length / 6 - 1);
          const quad = (a, bb, cc, d, tri, edge) => {
            tri.push(a, bb, cc, a, cc, d);
            edge?.push(a, bb, bb, cc, cc, d, d, a);
          };
          const sx = b.maxX - b.minX, sz = b.maxZ - b.minZ;
          quad(vert(b.minX, y0, b.minZ, 0, 1, 0), vert(b.maxX, y0, b.minZ, 0, 1, 0), vert(b.maxX, y0, b.maxZ, 0, 1, 0), vert(b.minX, y0, b.maxZ, 0, 1, 0), ground);
          const wy = y0 + (b.maxY - b.minY) * 0.001;
          quad(vert(b.minX, wy, b.minZ, 0, 1, 0), vert(b.minX + sx * 0.2, wy, b.minZ, 0, 1, 0), vert(b.minX + sx * 0.2, wy, b.minZ + sz * 0.2, 0, 1, 0), vert(b.minX, wy, b.minZ + sz * 0.2, 0, 1, 0), water);
          for (let i = 0; i < 4; i++)
            for (let k = 0; k < 4; k++) {
              const cx = b.minX + sx * (0.125 + i * 0.25), cz = b.minZ + sz * (0.125 + k * 0.25), hx = sx * 0.08, hz = sz * 0.08;
              quad(vert(cx - hx, y0, cz, 0, 0, 1), vert(cx + hx, y0, cz, 0, 0, 1), vert(cx + hx, y1, cz, 0, 0, 1), vert(cx - hx, y1, cz, 0, 0, 1), structure, edges);
              quad(vert(cx, y0, cz - hz, 1, 0, 0), vert(cx, y0, cz + hz, 1, 0, 0), vert(cx, y1, cz + hz, 1, 0, 0), vert(cx, y1, cz - hz, 1, 0, 0), structure, edges);
            }
          st.setLevel({
            kind: 'model', name: 'probe level', vertices: new Float32Array(v), indices: new Uint32Array(ground),
            structureIndices: new Uint32Array(structure), structureEdges: new Uint32Array(edges), waterIndices: new Uint32Array(water),
            triangles: (ground.length + structure.length + water.length) / 3, structureTriangles: structure.length / 3, waterTriangles: water.length / 3,
            sourceTriangles: (ground.length + structure.length + water.length) / 3,
            bounds: { minX: b.minX, maxX: b.maxX, minY: y0, maxY: y1, minZ: b.minZ, maxZ: b.maxZ },
            opacity: 1, desaturate: 0, brightness: 1, wireframe: false,
            structureOpacity: 0.25, structureWireOpacity: 0.6, showStructureFaces: true, showStructureWire: true, showWater: true,
          });
          st.patchHeat({ occlusion: 0.85, occlusionFloor: 0.1, hideBehindGround: true });
        }
        if (c === 'directions') st.patchHeat({ wedgeOpening: 90, wedgeSoftness: 0.2, dirField: 'both', dirFieldAnimate: false });
        if (c === 'split' || c === 'rate') {
          // The difference split by the first measure's range: lower half against upper half.
          const a = st.dataset.attrs.find((x) => x.kind === 'number') ?? null;
          if (a) {
            const mid = a.min + (a.max - a.min) / 2;
            st.setSplit({ kind: 'range', column: a.name, positive: [a.min, mid], negative: [mid, a.max] });
            st.setMode('heat-difference');
            if (c === 'rate') st.patchHeat({ splitRate: true });
          }
        }
        if (c === 'figures' || c === 'cubes') {
          // The box replay at the middle of the recording: each unit as its figure, or as a cube.
          const t = st.dataset.time;
          let lo = Infinity, hi = -Infinity;
          for (let i = 0; i < t.length; i += 997) { lo = Math.min(lo, t[i]); hi = Math.max(hi, t[i]); }
          st.patchTeam({ figures: c === 'figures', showRawSamples: false });
          st.patchTimeline({ mode: 'play' });
          st.setMode('team');
          st.seek(lo + (hi - lo) * 0.5);
        }
        let unwrap = null;
        if (c === 'overlays') {
          // Synthetic overlays in every frame's parameters, the same for both backends: three capture
          // zones (the first owned, the second being taken, the third neutral) and six spawn marks.
          const b = eng.toDisplay(eng.dataset.bounds);
          const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2, y = b.minY;
          const span = Math.min(b.maxX - b.minX, b.maxZ - b.minZ);
          const r = span * 0.08, n = 48, verts = [];
          const zones = [[cx - span * 0.25, cz], [cx, cz + span * 0.2], [cx + span * 0.25, cz - span * 0.1]];
          // Each zone: the fill, the capture band, the owner's band, the dark rim (`zoneShaders.ts` parts 3, 2, 1, 0).
          const rings = [[3, 0, 0.8], [2, 0.8, 0.88], [1, 0.88, 0.96], [0, 0.96, 1]];
          zones.forEach(([mx, mz], zi) => {
            for (const [part, r0, r1] of rings)
              for (let k = 0; k < n; k++) {
                const a0 = (k / n) * 2 * Math.PI, a1 = ((k + 1) / n) * 2 * Math.PI;
                const pt = (a, rr) => [mx + Math.sin(a) * r * rr, y, mz + Math.cos(a) * r * rr];
                const quad = [[a0, r0], [a1, r0], [a1, r1], [a0, r0], [a1, r1], [a0, r1]];
                for (const [a, rr] of quad) verts.push(...pt(a, rr), mx, y, mz, part, a / (2 * Math.PI), zi, r);
              }
          });
          const state = new Float32Array(32 * 8);
          state.set([0.2, 0.45, 1, 1, 1, 0.3, 0.2, 0], 0);
          state.set([1, 0.3, 0.2, 1, 0.2, 0.45, 1, 0.6], 8);
          state.set([0.6, 0.6, 0.6, 0, 1, 0.3, 0.2, 0.25], 16);
          const zoneDraw = { verts: new Float32Array(verts), count: verts.length / 10, state, ground: true, xray: 0.35 };
          const sp = [];
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * 2 * Math.PI;
            const x = cx + Math.cos(a) * span * 0.3, z = cz + Math.sin(a) * span * 0.3;
            // xyz, heading; rgb, flags (1 vehicle, 2 idle, glyph above); the owner's xyz, whether there is one.
            sp.push(x, y, z, i % 2 ? a : -1000, i < 3 ? 0.2 : 1, 0.45, i < 3 ? 1 : 0.2, (i % 3 === 0 ? 1 : 0) | (i === 5 ? 2 : 0) | ((i % 4) << 2), cx, y, cz, i < 4 ? 1 : 0);
          }
          const spawnDraw = { data: new Float32Array(sp), count: 6, lines: true };
          const rd = eng.renderer;
          const own = Object.prototype.hasOwnProperty.call(rd, 'render');
          const orig = rd.render;
          // Shells (`ranges/shells.ts` SHELL_FLOATS): middle relative to the origin, radius; colour; forward,
          // cone cosine (-2 none); target heights, elevation sines; band, view slot, class, line of sight;
          // least and best range, frustum tangents. No views: the row-ceiling load has no level.
          const shell = (o, x, z, rad, rgb, cone) => [x - o[0], y + rad * 0.2 - o[1], z - o[2], rad, ...rgb, 0.8, 1, 0, 0, cone ? 0.85 : -2, -1e6, 1e6, -1, 1, 2, -1, 0, 0, rad * 0.3, rad * 0.6, 0, 0];
          rd.render = function (p) {
            const o = p.origin;
            const shells = new Float32Array([
              ...shell(o, cx - span * 0.25, cz, r * 1.6, [1, 0.35, 0.2], false),
              ...shell(o, cx + span * 0.25, cz - span * 0.1, r * 2.2, [0.2, 0.5, 1], false),
              ...shell(o, cx, cz + span * 0.2, r * 3, [1, 0.85, 0.2], true),
            ]);
            const ranges = { shells, count: 3, coneStart: 2, opacity: 0.6, faces: true, lines: true, los: false, ground: false, views: [null, null, null, null], facesPerFrame: 2, bias: 1 };
            return orig.call(this, { ...p, objectiveZones: zoneDraw, spawnMarks: spawnDraw, ranges });
          };
          unwrap = () => {
            if (own) rd.render = orig;
            else delete rd.render;
          };
        }
        if (c === 'window') {
          const t = st.dataset.time;
          let lo = Infinity, hi = -Infinity;
          for (let i = 0; i < t.length; i += 997) { lo = Math.min(lo, t[i]); hi = Math.max(hi, t[i]); }
          st.patchTimeline({ mode: 'play', window: 'fixed', windowSeconds: (hi - lo) * 0.2 });
          st.seek(lo + (hi - lo) * 0.5);
        }
        // The bearings worked out (`DirectionController`), and every row's per-row data on the GPU
        // (the wedges' bearings, line heat's segment starts) before the camera
        // moves: the exposure's follower meters once it comes to rest, and must meter all of it.
        for (const end = performance.now() + 120_000; performance.now() < end; ) {
          await raf();
          eng.invalidate(2);
          if (c === 'directions' && !eng.directions?.data) continue;
          if (!eng.renderer.uploadsPending) break;
        }
        for (let i = 0; i < 8; i++) {
          eng.camera.moved = true;
          eng.invalidate(2);
          await raf();
        }
        // Converged: still frames until the field stops changing.
        for (let i = 0; i < 90; i++) await raf();
        // And the exposure at rest: it follows the view with a glide once metered, and a backend
        // whose readback lands a few frames later must not be caught mid-glide.
        for (let i = 0, still = 0, last = NaN; i < 600 && still < 30; i++) {
          await raf();
          const s = eng.shownSaturation ?? useStore.getState().heat.saturation;
          still = s === last ? still + 1 : 0;
          last = s;
        }
        const f = c === 'figures' || c === 'cubes' || c === 'overlays' ? null : await eng.renderer.readHeatField(0, true);
        const cap = await eng.captureFrame();
        const out = {
          field: f ? Array.from(f) : null,
          w: eng.canvas.width || Math.round(eng.canvas.clientWidth * devicePixelRatio),
          h: eng.canvas.height || Math.round(eng.canvas.clientHeight * devicePixelRatio),
          picture: cap ? { width: cap.width, height: cap.height, rgba: Array.from(cap.rgba) } : null,
          binned: eng.renderer.heatBinned ?? eng.renderer.binned ?? null,
          // Rows with a bearing (the wedges and the field have something to turn), routes drawn.
          dirRows: c === 'directions' && eng.directions?.data ? eng.directions.data.angles.reduce((n, a) => n + (a !== 255 ? 1 : 0), 0) : null,
          segments: c === 'lines' ? (eng.live.lines?.segments ?? null) : null,
          saturation: eng.shownSaturation ?? useStore.getState().heat.saturation,
          // The heat under the cursor at the hottest texel (`probeHeat`, the readout's one texel).
          cursor: await (async () => {
            if (!f) return null;
            const w = eng.canvas.width || 1, h = eng.canvas.height || 1, ch = Math.max(1, Math.round(f.length / (w * h)));
            let best = 0;
            for (let i = 0; i < w * h; i++) if (f[i * ch] > f[best * ch]) best = i;
            return eng.renderer.probeHeat((best % w) + 0.5, Math.floor(best / w) + 0.5, 1);
          })(),
        };
        st.patchHeat(base.heat);
        st.patchBudget(base.budget);
        st.setMode(base.mode);
        st.patchTimeline({ mode: base.timeline.mode, window: base.timeline.window, windowSeconds: base.timeline.windowSeconds });
        if (c === 'filter') st.setFilters([]);
        if (c === 'split' || c === 'rate') st.setSplit({ kind: 'teams' });
        if (c === 'structures') st.setLevel(null);
        st.patchTeam(base.team);
        unwrap?.();
        return out;
      }, c);
    }

    // Frames: orbit with the timeline playing, adaptive as a person has it.
    const frames = await page.evaluate(async (secs) => {
      const useStore = await globalThis.__heat3dNative.store();
      const eng = globalThis.__3dheat_engine;
      const st = useStore.getState();
      st.patchBudget({ adaptive: true, exact: true, targetFps: 60, heatScale: 1 });
      await globalThis.__heat3dNative.play(true);
      if (eng.renderer.times) await eng.renderer.times();
      const dts = [];
      let last = performance.now();
      const until = last + secs * 1000;
      while (performance.now() < until) {
        eng.camera.setOrientationDegrees(eng.camera.yawDegrees + 0.3, eng.camera.pitchDegrees);
        await new Promise((r) => requestAnimationFrame(r));
        const now = performance.now();
        dts.push(now - last);
        last = now;
      }
      await globalThis.__heat3dNative.play(false);
      const native = eng.renderer.times ? await eng.renderer.times() : null;
      const stats = (a) => {
        const s = a.slice(30).sort((x, y) => x - y);
        const q = (p) => s[Math.min(s.length - 1, Math.floor(s.length * p))];
        return s.length ? { n: s.length, p50: q(0.5), p99: q(0.99), max: s[s.length - 1], over25: s.filter((x) => x > 25).length } : null;
      };
      return { page: stats(dts), present: native ? stats(native.intervals) : null, cpu: native ? stats(native.cpu) : null, splats: eng.live.splats };
    }, secs);
    return { backend, rows, load, exposures, parity, frames, errors: errors.slice(0, 5), log: log.slice(-1500) };
  } catch (e) {
    // The app's own output says why a page went away (a crash, a panic in the viewport).
    throw new Error(`${backend} ${rows / 1e6}M: ${e.message}
app log:
${log.slice(-3000)}`);
  } finally {
    await browser?.close().catch(() => {});
    app.kill();
    await sleep(2500);
  }
}

// ---------------------------------------------------------------- main

let failed = 0;
const f1 = (v) => (v === null || v === undefined ? '-' : v.toFixed(1));
const pct = (v) => `${(v * 100).toFixed(2)}%`;
const summary = [];
for (const rows of loads) {
  const web = backends.includes('webgpu') ? await run(rows, 'webgpu') : null;
  const nat = backends.includes('native') ? await run(rows, 'native') : null;
  const m = rows > 0 ? `${rows / 1e6}M` : `${matches}x${unitsPerMatch}`;
  for (const r of [web, nat].filter(Boolean)) {
    const fr = r.frames;
    console.log(
      `${m} ${r.backend}: load ${(r.load.loadMs / 1000).toFixed(1)} s (${r.load.resident} resident, ${r.load.dropped} dropped); page frames p50 ${f1(fr.page?.p50)} p99 ${f1(fr.page?.p99)} max ${f1(fr.page?.max)} ms` +
        (fr.present ? `; native presents p50 ${f1(fr.present.p50)} p99 ${f1(fr.present.p99)} max ${f1(fr.present.max)} ms (${fr.present.over25} over 25 ms of ${fr.present.n}), encode p99 ${f1(fr.cpu?.p99)} ms` : '') +
        (r.errors.length ? `; errors: ${r.errors.join(' | ')}` : ''),
    );
  }
  if (!(web && nat) && cases.includes('exposure')) {
    const r = web ?? nat;
    console.log(`  ${m} exposure (${r.backend} alone): first auto-exposure ${r.exposures.map((v) => (v === null ? 'none' : v.toPrecision(5))).join(' ')}`);
  }
  if (web && nat && cases.includes('exposure')) {
    // Each native load's first exposure against the web's first (the web's own repeats as a control).
    const ref = web.exposures[0];
    const off = (v) => (ref && v ? Math.abs(v / ref - 1) : Infinity);
    const worst = Math.max(...nat.exposures.map(off));
    const bad = !(worst <= 0.01);
    if (bad) failed++;
    const list = (a) => a.map((v) => (v === null ? 'none' : v.toPrecision(5))).join(' ');
    console.log(`  ${bad ? 'FAIL' : 'ok  '} ${m} exposure: first auto-exposure web ${list(web.exposures)}; native ${list(nat.exposures)}; worst ${pct(worst)}`);
    summary.push({ rows, case: 'exposure', web: web.exposures, native: nat.exposures, worst });
  }
  for (const r of [web, nat].filter(Boolean)) {
    // The CPU path against the GPU path on the same backend: reported only.
    const g = r.parity.tracks;
    const cp = r.parity['tracks-cpu'];
    if (g) console.log(`  ${r.backend} tracks: ${g.gpu ? 'GPU tracks' : 'NOT on the GPU'} ${JSON.stringify(g.info)}, ready in ${(g.readyMs / 1000).toFixed(1)} s`);
    if (g?.picture && cp?.picture) {
      const pic = comparePictures({ ...g.picture, rgba: Uint8Array.from(g.picture.rgba) }, { ...cp.picture, rgba: Uint8Array.from(cp.picture.rgba) });
      writeFileSync(join(out, `${m}-tracks-cpu-${r.backend}.png`), png(cp.picture.width, cp.picture.height, Uint8Array.from(cp.picture.rgba)));
      console.log(`  info ${m} ${r.backend} GPU tracks vs CPU placing: ` + (pic ? `picture mean ${pic.mean.toFixed(2)}/255, p99 ${pic.p99}, ${pct(pic.offShare)} off by > 8` : 'no picture'));
      summary.push({ rows, case: 'tracks-cpu', backend: r.backend, picture: pic });
    }
  }
  for (const c of web && nat ? cases.filter((c) => c !== 'exposure' && c !== 'tracks-cpu') : []) {
    const a = web.parity[c];
    const b = nat.parity[c];
    if (a.picture) writeFileSync(join(out, `${m}-${c}-web.png`), png(a.picture.width, a.picture.height, Uint8Array.from(a.picture.rgba)));
    if (b.picture) writeFileSync(join(out, `${m}-${c}-native.png`), png(b.picture.width, b.picture.height, Uint8Array.from(b.picture.rgba)));
    const pic = comparePictures(
      a.picture && { ...a.picture, rgba: Uint8Array.from(a.picture.rgba) },
      b.picture && { ...b.picture, rgba: Uint8Array.from(b.picture.rgba) },
    );
    if (c === 'figures' || c === 'cubes' || c === 'overlays' || c === 'tracks') {
      // No heat in the box replay: the pictures alone, within a pixel's rounding at the figures' edges.
      // The overlays: their pictures over the heat, compared the same way.
      const bad = !pic || pic.mean > 1 || pic.offShare > 0.01;
      if (bad) failed++;
      console.log(`  ${bad ? 'FAIL' : 'ok  '} ${m} ${c}: ` + (pic ? `picture mean ${pic.mean.toFixed(2)}/255, p99 ${pic.p99}, ${pct(pic.offShare)} off by > 8` : 'no picture'));
      summary.push({ rows, case: c, picture: pic });
      continue;
    }
    if (!a.field || !b.field || a.field.length !== b.field.length) {
      console.log(`  FAIL ${m} ${c}: fields ${a.field?.length ?? 'none'} vs ${b.field?.length ?? 'none'} values`);
      failed++;
      continue;
    }
    const ch = Math.max(1, Math.round(a.field.length / (a.w * a.h)));
    const v = compareFields(a.field, b.field, a.w, a.h, ch);
    const bad = v.lit === 0 || v.p50.err > 0.01 || v.p90.err > 0.01 || v.p99.err > 0.01 || v.ssim < 0.99;
    if (bad) failed++;
    console.log(
      `  ${bad ? 'FAIL' : 'ok  '} ${m} ${c}: field p50 ${pct(v.p50.err)} p90 ${pct(v.p90.err)} p99 ${pct(v.p99.err)} total ${pct(v.total)} ssim ${v.ssim.toFixed(4)} (${v.lit} texels, binned web ${a.binned} native ${b.binned}, exposure web ${a.saturation?.toPrecision(4)} native ${b.saturation?.toPrecision(4)}, cursor web ${a.cursor?.toPrecision(4)} native ${b.cursor?.toPrecision(4)}${a.dirRows !== null && a.dirRows !== undefined ? `, rows with a bearing ${a.dirRows}` : ''}${a.segments !== null && a.segments !== undefined ? `, segments ${a.segments}` : ''})` +
        (pic ? `; picture mean ${pic.mean.toFixed(2)}/255, p99 ${pic.p99}, ${pct(pic.offShare)} off by > 8` : '; no picture'),
    );
    summary.push({ rows, case: c, field: v, picture: pic });
  }
  summary.push({ rows, web: web && { load: web.load, frames: web.frames }, native: nat && { load: nat.load, frames: nat.frames } });
}
writeFileSync(join(out, 'result.json'), JSON.stringify(summary, null, 1));
console.log(`pictures and result.json in ${out}`);
if (failed) {
  console.log(`${failed} parity check(s) failed`);
  process.exitCode = 1;
}
