/**
 * The GPU tracks drawn from the core's keys (Stage 5, `heat3d_core::tracks`), in the native app:
 * a load the core builds from a synthetic Parquet file, held by the page every `--step`-th row
 * (`heat3d.nativePageRows`), drawn natively four ways, each a fresh load of the same file:
 *
 *   ref       the page holds every row, its own keys (`?coretracks=0`): the picture every row gives
 *   core      the page holds every step-th row, the viewport draws the core's keys over every row
 *   thin      the page holds every step-th row and its keys are drawn (what the app did before)
 *   corefull  every row on the page, the core's keys anyway (`?coretracks=1`): core keys = page keys
 *
 * Gates: core and corefull pictures equal ref (mean <= 1/255, <= 1 % pixels > 8/255, the tracks probe's); the core
 * store holds every sample's key (keys = ref's). Reported: thin vs ref (what thinning cost), the
 * store's build (page and core), frames with orbit + playback (page and native presents,
 * p50/p99/max) for ref and core, units the page has no row of (drawn from the core's keys only).
 *
 *   node native/tools/probe-core-tracks.mjs --matches 1000 --units 20 --samples 40 --step 3
 *        [--seconds 10] [--variants ref,core,thin,corefull] [--data <folder>] [--exe ...] [--out ...]
 *        [--make-only 1] (the file only)
 *
 * The units circle with a zigzag across their path (a period of four samples), so a curve through
 * every step-th sample visibly misses it. Rows are time-major, as a recording's. Windows, the real
 * GPU (check nothing else uses it), release app with `dist` in `<target>/release/web`.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { deflateSync } from 'node:zlib';
import { chromium } from 'playwright';
import { ParquetWriter, fileWriter } from 'hyparquet-writer';

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
};
const target = process.env.CARGO_TARGET_DIR ?? resolve(import.meta.dirname, '..', 'target');
const exe = arg('exe', join(target, 'release', '3dheat-app.exe'));
const out = resolve(arg('out', join(process.env.TEMP ?? '.', 'heat3d-core-tracks')));
const data = resolve(arg('data', out));
const matches = Number(arg('matches', 1000));
const units = Number(arg('units', 20));
const S = Number(arg('samples', 40));
const step = Number(arg('step', 3));
const secs = Number(arg('seconds', 10));
const variants = String(arg('variants', 'ref,core,thin,corefull')).split(',');
const PORT = Number(arg('port', 9451));
const DT = 0.4;
const P = matches * units;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(out, { recursive: true });
mkdirSync(data, { recursive: true });

// ---------------------------------------------------------------- the file

function makeFile() {
  const file = join(data, `coretracks-${P}x${S}.parquet`);
  if (existsSync(file)) return file;
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
  const names = Array.from({ length: P }, (_, p) => `m${Math.floor(p / units)}u${p % units}`);
  const teams = Array.from({ length: P }, (_, p) => (p % units < units / 2 ? 'blue' : 'red'));
  const w = new ParquetWriter({
    writer: fileWriter(file),
    schema: [
      { name: 'root', num_children: 7 },
      ...[['x', 'FLOAT'], ['y', 'FLOAT'], ['z', 'FLOAT'], ['time', 'DOUBLE'], ['yaw', 'FLOAT']].map(([name, type]) => ({ name, type, repetition_type: 'REQUIRED' })),
      { name: 'player', type: 'BYTE_ARRAY', converted_type: 'UTF8', repetition_type: 'REQUIRED' },
      { name: 'team', type: 'BYTE_ARRAY', converted_type: 'UTF8', repetition_type: 'REQUIRED' },
    ],
    kvMetadata: [],
    statistics: true,
  });
  const n = P * S;
  const G = 1 << 20;
  for (let at = 0; at < n; at += G) {
    const m = Math.min(G, n - at);
    const x = new Float32Array(m), y = new Float32Array(m), z = new Float32Array(m), t = new Float64Array(m), yaw = new Float32Array(m);
    const pl = new Array(m), tm = new Array(m);
    for (let i = 0; i < m; i++) {
      const r = at + i;
      const k = Math.floor(r / P);
      const p = r % P;
      const u = unit[p];
      const tt = k * DT;
      const a = u.ph + u.w * tt;
      // A zigzag across the path, 25 m, a period of four samples.
      const zig = 25 * Math.sin((2 * Math.PI * tt) / (4 * DT) + 0.7);
      x[i] = u.cx + (u.R + zig) * Math.sin(a);
      // The file is z-up: y is the ground's other axis, z the height.
      y[i] = u.cz - (u.R + zig) * Math.cos(a);
      z[i] = u.y;
      t[i] = tt;
      yaw[i] = (a * 180) / Math.PI;
      pl[i] = names[p];
      tm[i] = teams[p];
    }
    w.write({ columnData: [{ name: 'x', data: x }, { name: 'y', data: y }, { name: 'z', data: z }, { name: 'time', data: t }, { name: 'yaw', data: yaw }, { name: 'player', data: pl }, { name: 'team', data: tm }], rowGroupSize: m });
  }
  w.finish();
  return file;
}

// ---------------------------------------------------------------- pictures

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function png(width, height, rgba) {
  const crc = (buf) => {
    let c = 0xffffffff;
    for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, d) => {
    const b = Buffer.alloc(12 + d.length);
    b.writeUInt32BE(d.length, 0);
    b.write(type, 4, 'ascii');
    d.copy(b, 8);
    b.writeUInt32BE(crc(b.subarray(4, 8 + d.length)), 8 + d.length);
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

function compare(a, b) {
  if (!a || !b || a.width !== b.width || a.height !== b.height) return null;
  let sum = 0, off = 0;
  const n = a.rgba.length / 4;
  for (let i = 0; i < a.rgba.length; i += 4) {
    const m = Math.max(Math.abs(a.rgba[i] - b.rgba[i]), Math.abs(a.rgba[i + 1] - b.rgba[i + 1]), Math.abs(a.rgba[i + 2] - b.rgba[i + 2]));
    sum += m;
    if (m > 8) off++;
  }
  return { mean: sum / n, offShare: off / n };
}

// ---------------------------------------------------------------- in the page

/** One load of the file as variant `v`, its picture at the middle of the recording, its store, frames. */
async function variantInPage({ v, rows, step, mid, secs, frames }) {
  const useStore = await globalThis.__heat3dNative.store();
  const eng = globalThis.__3dheat_engine;
  const raf = () => new Promise((r) => requestAnimationFrame(r));
  const st = () => useStore.getState();
  const thinned = v === 'core' || v === 'thin';
  if (thinned) localStorage.setItem('heat3d.nativePageRows', String(Math.ceil(rows / step)));
  else localStorage.removeItem('heat3d.nativePageRows');
  const url = new URL(location.href);
  url.searchParams.set('gputracks', '1');
  if (v === 'core') url.searchParams.delete('coretracks');
  else url.searchParams.set('coretracks', v === 'corefull' ? '1' : '0');
  history.replaceState(null, '', url.href);
  const files = [...document.getElementById('__probe_files').files];
  const mapping = { x: 'x', y: 'y', z: 'z', time: 'time', personId: 'player', teamId: 'team', yaw: 'yaw', axes: { up: 'z', flipX: false, flipY: false, flipZ: false, scale: 1 } };
  const t0 = performance.now();
  const r = await globalThis.__heat3dNative.loadFiles(files, 1, mapping, true);
  const loadMs = performance.now() - t0;
  st().setMode('team');
  st().patchTeam({ figures: true, showRawSamples: false, trailSeconds: 0, farMode: 'figure', figureScale: 1 });
  st().patchTimeline({ mode: 'play', window: 'cumulative', playing: false });
  st().patchBudget({ adaptive: false, exact: true, heatScale: 1 });
  st().seek(mid);
  const rd = eng.renderer;
  const own = Object.prototype.hasOwnProperty.call(rd, 'render');
  const orig = rd.render;
  // The dart threshold and triangle budget pinned (as the tracks probe): the same detail each run.
  rd.render = function (p) {
    const g = p.gpuTracks;
    return orig.call(this, g ? { ...p, gpuTracks: { ...g, dartPx: 2, triangleBudget: 1e12 } } : p);
  };
  const t1 = performance.now();
  while (performance.now() - t1 < 300_000 && (!eng.gpuTracksInfo() || rd.uploadsPending || rd.snap?.tracksReady !== rd.tracks?.id)) await raf();
  const readyMs = performance.now() - t1;
  for (let i = 0; i < 30; i++) await raf();
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
  let fr = null;
  if (frames) {
    st().patchBudget({ adaptive: true, exact: true, targetFps: 60, heatScale: 1 });
    await globalThis.__heat3dNative.play(true);
    if (rd.times) await rd.times();
    const dts = [];
    let last = performance.now();
    const until = last + secs * 1000;
    while (performance.now() < until) {
      eng.camera.setOrientationDegrees(eng.camera.yawDegrees + 0.3, eng.camera.pitchDegrees);
      await raf();
      const now = performance.now();
      dts.push(now - last);
      last = now;
    }
    await globalThis.__heat3dNative.play(false);
    const native = rd.times ? await rd.times() : null;
    const stats = (a) => {
      const s = a.slice(30).sort((x, y) => x - y);
      const q = (p) => s[Math.min(s.length - 1, Math.floor(s.length * p))];
      return s.length ? { n: s.length, p50: q(0.5), p99: q(0.99), max: s[s.length - 1], over25: s.filter((x) => x > 25).length } : null;
    };
    fr = { page: stats(dts), present: native ? stats(native.intervals) : null };
  }
  if (own) rd.render = orig;
  else delete rd.render;
  localStorage.removeItem('heat3d.nativePageRows');
  return {
    v,
    rows: r.rows,
    pageStep: eng.dataset?.native?.pageStep ?? null,
    loadMs,
    readyMs,
    info,
    core: rd.tracks?.coreInfo && rd.tracks.core ? rd.tracks.coreInfo : null,
    tracksBytes: rd.snap?.tracksBytes ?? null,
    picture: cap ? { width: cap.width, height: cap.height, rgba: Array.from(cap.rgba) } : null,
    frames: fr,
  };
}

// ---------------------------------------------------------------- main

const games = spawnSync('powershell', ['-NoProfile', '-Command', "Get-Process | ? { $_.Path -match 'steamapps\\\\common|C:\\\\Games\\\\|Wargaming|World_of_|Riot Games|Epic Games|EA Games|Ubisoft|Battle.net|GOG Galaxy\\\\Games' -and $_.Path -notmatch 'steamwebhelper|Launcher|launcher|Steam\\.exe|EpicGamesLauncher|RiotClient|wgc|ErrorMonitor' } | % { $_.Path }"], { encoding: 'utf8' }).stdout.trim();
if (games) console.log(`NOTE a game runs (${games}): frame times do not count`);
const t0 = Date.now();
const file = makeFile();
console.log(`file ${file} (${P} units x ${S} samples = ${(P * S) / 1e6}M rows) ready in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
if (arg('make-only', null) !== null) process.exit(0);

// The DevTools port must be ours: another app on it (another probe) would be driven instead.
if (await fetch(`http://127.0.0.1:${PORT}/json/version`).then(() => true, () => false)) throw new Error(`port ${PORT} is taken (another app's DevTools): pass --port`);
// A fresh WebView2 profile each run: a kept one serves the viewer it cached (its service worker), not this build's.
const profile = join(out, `webview2-${PORT}-${Date.now()}`);
const vlog = join(out, 'viewport.log');
rmSync(vlog, { force: true });
const app = spawn(exe, [], {
  env: { ...process.env, WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${PORT}`, WEBVIEW2_USER_DATA_FOLDER: profile, HEAT3D_VIEWPORT_LOG: vlog },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let log = '';
app.stdout.on('data', (d) => (log += d));
app.stderr.on('data', (d) => (log += d));
let browser;
let failed = false;
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
  page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errors.push(m.text()));
  await page.waitForFunction(() => !!globalThis.__3dheat_engine?.live?.backend && globalThis.__3dheat_engine.live.backend !== 'none', null, { timeout: 60_000 });
  await page.evaluate(() => localStorage.setItem('heat3d.nativeViewport', 'on'));
  await page.reload();
  await page.waitForFunction(() => !!globalThis.__heat3dNative && globalThis.__3dheat_engine?.live?.backend === 'native', null, { timeout: 60_000 });
  await page.evaluate(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.id = '__probe_files';
    input.style.display = 'none';
    document.body.appendChild(input);
  });
  const cdp = await page.context().newCDPSession(page);
  const { root } = await cdp.send('DOM.getDocument');
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#__probe_files' });
  await cdp.send('DOM.setFileInputFiles', { nodeId, files: [file] });
  const got = {};
  for (const v of variants) {
    const r = await page.evaluate(variantInPage, { v, rows: P * S, step, mid: ((S - 1) * DT) / 2, secs, frames: secs > 0 && (v === 'ref' || v === 'core' || v === 'thin') });
    got[v] = r;
    if (r.picture) writeFileSync(join(out, `${matches}x${units}-${v}.png`), png(r.picture.width, r.picture.height, Uint8Array.from(r.picture.rgba)));
    const f = r.frames;
    const fs = (s) => (s ? `${s.p50.toFixed(1)}/${s.p99.toFixed(1)}/${s.max.toFixed(1)} (${s.over25} over 25 ms of ${s.n})` : '-');
    console.log(`${v}: ${r.rows} rows, page step ${r.pageStep}, load ${(r.loadMs / 1000).toFixed(1)} s, store ready ${(r.readyMs / 1000).toFixed(1)} s after, page store ${JSON.stringify(r.info)}${r.core ? `, core keys ${JSON.stringify(r.core)}` : ''}, viewport ${Math.round((r.tracksBytes ?? 0) / 1e6)} MB${f ? `; frames page ${fs(f.page)}, presents ${fs(f.present)}` : ''}`);
  }
  const ref = got.ref;
  for (const v of variants.filter((v) => v !== 'ref')) {
    const c = ref ? compare(ref.picture, got[v].picture) : null;
    if (!c) continue;
    const gate = v === 'core' || v === 'corefull';
    // The tracks probe's gate: where figures overlap, which lands on top is the GPU threads' order, run to run.
    const ok = c.mean <= 1 && c.offShare <= 0.01;
    console.log(`  ${v} vs ref: picture mean ${c.mean.toFixed(2)}/255, ${(c.offShare * 100).toFixed(2)} % > 8/255${gate ? (ok ? '  ok' : '  FAIL') : ' (report)'}`);
    if (gate && !ok) failed = true;
  }
  if (got.core && ref) {
    const keys = got.core.core?.keys ?? 0;
    const ok = keys === ref.info?.keys;
    console.log(`  core keys ${keys} vs every row's ${ref.info?.keys} (page held ${got.core.info?.keys})${ok ? '  ok' : '  FAIL'}`);
    if (!ok) failed = true;
  }
  if (errors.length) console.log(`page errors: ${errors.slice(0, 5).join(' | ')}`);
} catch (e) {
  console.error(`${e.message}\napp log:\n${log.slice(-3000)}`);
  failed = true;
} finally {
  await browser?.close().catch(() => {});
  app.kill();
  // Its WebView2 processes too, then the profile (they hold its files a moment).
  await sleep(2500);
  spawnSync('powershell', ['-NoProfile', '-Command', `Get-CimInstance Win32_Process | ? { $_.Name -eq 'msedgewebview2.exe' -and $_.CommandLine -like '*${profile.replace(/'/g, "''")}*' } | % { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`]);
  await sleep(500);
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
  } catch {}
  if (existsSync(vlog)) {
    const l = readFileSync(vlog, 'utf8').trim();
    if (l) console.log(`viewport log:\n${l.split('\n').slice(0, 20).join('\n')}`);
  }
}
process.exit(failed ? 1 : 0);
