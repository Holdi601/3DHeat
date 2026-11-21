/**
 * How fast and how large a load the native app takes, and how smooth it is there.
 *
 *   node native/tools/probe-native-load.mjs --dir <rowceiling folder> --rows 100,400 [--path core|page]
 *                                           [--exe <3dheat-app.exe>] [--page-rows N] [--repeat 2]
 *
 * Starts the built app once per load, picks the row-ceiling tables (`tools/probe-row-ceiling.mjs`
 * writes them; more files are made by hard links when a load needs them) the way a person picks
 * files, and loads them with the probe's mapping: positions, time, a player and a team, the
 * measures left to be read when asked. `--path core` (the default) is the app's own path - the
 * core builds the dataset and the engine takes its chunks; `--path page` switches that off
 * (`heat3d.nativeBuild`), so the page builds as in Stage 2a. Reports, per load:
 *
 *   loadMs     from the load's start until every row is on the GPU (or dropped by the budget)
 *   buildMs    the core's build, as the page waited for it; columnsMs taking the columns over
 *   page       the WebView2 renderer's private bytes, peak (sampled every 250 ms) and after
 *   core       the app process's private bytes, peak and after
 *   machine    how far free memory fell during the load: shared memory (the columns both the
 *              core and the page see) is in neither process's private bytes, but is in this
 *   frames     p50 / p99 / max frame time over 8 s of camera motion with the timeline playing
 *
 * Windows only (WebView2's DevTools port).
 */
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, linkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
};
const target = process.env.CARGO_TARGET_DIR ?? resolve(import.meta.dirname, '..', 'target');
const exe = arg('exe', join(target, 'release', '3dheat-app.exe'));
const dir = arg('dir', null);
const loads = String(arg('rows', '100')).split(',').map((r) => Number(r) * 1e6);
const path = arg('path', 'core');
const pageRows = Number(arg('page-rows', 0));
const repeat = Number(arg('repeat', 1));
const PORT = Number(arg('port', 9335));
const PER_FILE = 10_000_000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
if (!dir) throw new Error('--dir is required');

/** The table and as many hard links of it as `rows` needs. */
function files(rows) {
  const base = join(dir, `wide-${PER_FILE}-8.parquet`);
  if (!existsSync(base)) throw new Error(`no ${base}: run tools/probe-row-ceiling.mjs --dir ${dir} first`);
  const out = [];
  for (let i = 0; i < Math.ceil(rows / PER_FILE); i++) {
    const p = i === 0 ? base : join(dir, `wide-${PER_FILE}-8-${i}.parquet`);
    if (!existsSync(p)) linkSync(base, p);
    out.push(p);
  }
  return out;
}

/** Private bytes of the app and of its WebView2 renderers, from one PowerShell call. */
function memory(appPid) {
  const ps = `
$all = Get-CimInstance Win32_Process -Filter "Name='msedgewebview2.exe' OR ProcessId=${appPid}" | Select-Object ProcessId,ParentProcessId,PrivatePageCount,WorkingSetSize,CommandLine
$app = $all | Where-Object { $_.ProcessId -eq ${appPid} }
$browser = $all | Where-Object { $_.ParentProcessId -eq ${appPid} } | Select-Object -ExpandProperty ProcessId
$r = $all | Where-Object { $browser -contains $_.ParentProcessId -and $_.CommandLine -match 'type=renderer' } | Sort-Object PrivatePageCount -Descending | Select-Object -First 1
$free = [int64](Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory * 1024
@{ app = [int64]$app.PrivatePageCount; appWs = [int64]$app.WorkingSetSize; page = [int64]$r.PrivatePageCount; pageWs = [int64]$r.WorkingSetSize; free = $free } | ConvertTo-Json -Compress`;
  try {
    return JSON.parse(execFileSync('powershell', ['-NoProfile', '-Command', ps], { encoding: 'utf8' }));
  } catch {
    return null;
  }
}

async function attempt(rows) {
  const picked = files(rows);
  const app = spawn(exe, [], {
    env: { ...process.env, WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${PORT}` },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  app.stdout.on('data', (d) => (log += d));
  app.stderr.on('data', (d) => (log += d));
  let browser;
  const peak = { app: 0, page: 0, appWs: 0, pageWs: 0, freeMin: Infinity };
  let sampling = true;
  const sampler = (async () => {
    while (sampling) {
      const m = memory(app.pid);
      if (m) {
        for (const k of ['app', 'page', 'appWs', 'pageWs']) peak[k] = Math.max(peak[k], m[k] ?? 0);
        peak.freeMin = Math.min(peak.freeMin, m.free ?? Infinity);
      }
      await sleep(250);
    }
  })();
  try {
    // A loaded machine may take a minute to start the app and its WebView2.
    for (const until = Date.now() + 120_000; !browser && Date.now() < until; ) {
      try {
        browser = await chromium.connectOverCDP(`http://127.0.0.1:${PORT}`);
      } catch {
        await sleep(100);
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
    page.on('crash', () => errors.push('page crashed'));
    await page.waitForFunction(() => !!globalThis.__heat3dNative && !!globalThis.__3dheat_engine, null, { timeout: 60_000 });
    await page.evaluate(
      ([p, pr]) => {
        localStorage.setItem('heat3d.nativeBuild', p === 'page' ? 'off' : 'on');
        if (pr > 0) localStorage.setItem('heat3d.nativePageRows', String(pr));
        else localStorage.removeItem('heat3d.nativePageRows');
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.id = '__probe_files';
        input.style.display = 'none';
        document.body.appendChild(input);
      },
      [path, pageRows],
    );
    await sleep(1000);
    const before = memory(app.pid);
    const cdp = await page.context().newCDPSession(page);
    const { root } = await cdp.send('DOM.getDocument');
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#__probe_files' });
    await cdp.send('DOM.setFileInputFiles', { nodeId, files: picked });
    const extra = Array.from({ length: 8 }, (_, i) => `m${i}`);
    const mapping = {
      x: 'x',
      y: 'y',
      z: 'z',
      time: 'time',
      personId: 'player',
      teamId: 'team',
      extra: [],
      onDemand: extra,
      extraNumeric: Object.fromEntries(extra.map((c) => [c, true])),
      axes: { up: 'z', flipX: false, flipY: false, flipZ: false, scale: 1 },
    };
    const load = await page.evaluate(async (m) => {
      const t0 = performance.now();
      const files = [...document.getElementById('__probe_files').files];
      try {
        const r = await globalThis.__heat3dNative.loadFiles(files, 1, m, true);
        const eng = globalThis.__3dheat_engine;
        const until = performance.now() + 900_000;
        // Every row on the GPU: none still arriving, and the counts of this dataset, not the last.
        await new Promise((res) => setTimeout(res, 100));
        while (performance.now() < until && (eng.live.residentRows + eng.live.droppedRows < r.rows || globalThis.__heat3dNative.uploading())) await new Promise((res) => setTimeout(res, 20));
        return { ok: true, ...r, loadMs: performance.now() - t0, resident: eng.live.residentRows, dropped: eng.live.droppedRows, backend: eng.live.backend, stats: await globalThis.__heat3dNative.buildStats() };
      } catch (e) {
        return { ok: false, error: String(e?.message ?? e), loadMs: performance.now() - t0 };
      }
    }, mapping);
    const after = memory(app.pid);
    let frames = null;
    if (load.ok) {
      frames = await page.evaluate(async () => {
        const eng = globalThis.__3dheat_engine;
        await globalThis.__heat3dNative.play(true);
        const dts = [];
        let last = performance.now();
        const until = last + 8000;
        while (performance.now() < until) {
          eng.camera.setOrientationDegrees(eng.camera.yawDegrees + 0.3, eng.camera.pitchDegrees);
          await new Promise((r) => requestAnimationFrame(r));
          const now = performance.now();
          dts.push(now - last);
          last = now;
        }
        await globalThis.__heat3dNative.play(false);
        const s = dts.slice(30).sort((a, b) => a - b);
        const q = (p) => s[Math.min(s.length - 1, Math.floor(s.length * p))];
        return { n: s.length, p50: q(0.5), p99: q(0.99), max: s[s.length - 1] };
      });
    }
    return { rows, path, files: picked.length, load, frames, memory: { before, after, peak }, errors: errors.slice(0, 5) };
  } finally {
    sampling = false;
    await sampler;
    await browser?.close().catch(() => {});
    app.kill();
    await sleep(2000);
  }
}

const results = [];
for (const rows of loads) {
  for (let k = 0; k < repeat; k++) {
    const free = Number(execFileSync('powershell', ['-NoProfile', '-Command', "(Get-Counter '\\Memory\\Available MBytes').CounterSamples.CookedValue"], { encoding: 'utf8' }).trim());
    const r = await attempt(rows);
    r.freeMbBefore = free;
    results.push(r);
    const gb = (b) => (b / 2 ** 30).toFixed(1);
    console.log(
      `${rows / 1e6}M ${path}: ${r.load.ok ? `${(r.load.loadMs / 1000).toFixed(1)} s, ${r.load.rows} page rows, resident ${r.load.resident} dropped ${r.load.dropped}` : `FAILED ${r.load.error}`}` +
        ` | page peak ${gb(r.memory.peak.page)} GB, core peak ${gb(r.memory.peak.app)} GB, machine ${gb((r.memory.before?.free ?? 0) - r.memory.peak.freeMin)} GB used at peak` +
        (r.frames ? ` | frames p50 ${r.frames.p50.toFixed(1)} p99 ${r.frames.p99.toFixed(1)} max ${r.frames.max.toFixed(1)} ms` : ''),
    );
  }
}
console.log(JSON.stringify(results, null, 1));
