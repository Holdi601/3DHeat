/**
 * The video fallback (Stage 8) end to end on this machine.
 *
 *   node native/tools/probe-video.mjs --dir <rowceiling folder> [--rows 10] [--members 1,4]
 *        [--shared 10] [--seconds 10] [--exe <3dheat-app.exe>] [--port 7979] [--screens <folder>] [--trace]
 *
 * Starts the built app hosting a session beside its window (`--host`, loopback only: no
 * firewall prompt), switches its native viewport on and loads the row-ceiling tables as
 * `probe-native-viewport.mjs` does, then joins headless Chromium members (playwright) with
 * the password and puts each in video mode. The host orbits its camera with the timeline
 * playing; each member turns its own camera twice a second. Measured:
 *
 *   camera to picture  each member's camera send time to the expected display time of the
 *                      first frame drawn from it (requestVideoFrameCallback, the frame
 *                      matched by its RTP time to what the host announced on the channel):
 *                      glass to glass less the input device and the screen's scan-out
 *   encode / draw      the host's encode time per frame, and its draw + convert + read-back
 *   host frames        the viewport's present intervals (p50/p99/max) with no stream, then
 *                      with N streams, the same orbit (the no-frame-drops rule)
 *   bandwidth          received kbit/s per member (getStats), and what the host sent
 *
 * --shared N: a last run with N members following the host (one shared stream) beside the last
 * count's own views; they keep their cameras still.
 * --screens: the first member's page with the video, and with the session panel open, as PNG.
 * --trace: the viewport notes the governor's figures every 5 s (`HEAT3D_VIDEO_TRACE`), in the
 * result's `viewportLog`. The app runs with a WebView2 profile of its own per run (a second
 * start next to a profile still in use fails with 0x8007139F), removed after.
 *
 * Needs the real GPU: check nothing else uses it (a game) first; numbers taken during a game
 * are a smoke check only. Windows (WebView2's DevTools port).
 */

import { spawn } from 'node:child_process';
import { existsSync, linkSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
};
const target = process.env.CARGO_TARGET_DIR ?? resolve(import.meta.dirname, '..', 'target');
const exe = arg('exe', join(target, 'release', '3dheat-app.exe'));
const dir = arg('dir', null);
const rows = Number(arg('rows', 10)) * 1e6;
const memberCounts = String(arg('members', '1,4')).split(',').map(Number);
// Members who follow the host (one shared stream), in a last run beside the last count's own views.
const shared = Number(arg('shared', 0));
const plan = memberCounts.map((own) => ({ own, shared: 0 }));
if (shared > 0) plan.push({ own: memberCounts[memberCounts.length - 1] ?? 0, shared });
const secs = Number(arg('seconds', 10));
const PORT = Number(arg('port', 7979));
const CDP = Number(arg('cdp', 9337));
const screens = arg('screens', null);
const PER_FILE = 10_000_000;
const PW = 'probe video passphrase long';
const HOST_TOKEN = 'ab'.repeat(32);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
if (!dir) throw new Error('--dir is required');

function files(n) {
  const base = join(dir, `wide-${PER_FILE}-8.parquet`);
  if (!existsSync(base)) throw new Error(`no ${base}: run tools/probe-row-ceiling.mjs --dir ${dir} first`);
  const list = [];
  for (let i = 0; i < Math.ceil(n / PER_FILE); i++) {
    const p = i === 0 ? base : join(dir, `wide-${PER_FILE}-8-${i}.parquet`);
    if (!existsSync(p)) linkSync(base, p);
    list.push(p);
  }
  return list;
}

const stats = (a, skip = 0) => {
  const s = a.slice(skip).sort((x, y) => x - y);
  const q = (p) => s[Math.min(s.length - 1, Math.floor(s.length * p))];
  return s.length ? { n: s.length, p50: +q(0.5).toFixed(2), p95: +q(0.95).toFixed(2), p99: +q(0.99).toFixed(2), max: +s[s.length - 1].toFixed(2), over25: s.filter((x) => x > 25).length } : null;
};

const state = join(process.env.TEMP ?? '.', `heat3d-probe-video-${process.pid}`);
mkdirSync(state, { recursive: true });
const app = spawn(exe, ['--host', '--plain-http', '--port', String(PORT), '--host-token', HOST_TOKEN, '--password-env', 'HEAT3D_PROBE_PW', '--no-waiting-room', '--max-per-addr', '64', '--max-clients', '64', '--state-dir', state, '--no-update-check'], {
  env: { ...process.env, HEAT3D_PROBE_PW: PW, WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${CDP}`, WEBVIEW2_USER_DATA_FOLDER: join(state, `webview2-${CDP}`), HEAT3D_VIEWPORT_LOG: join(state, "viewport.log"), ...(process.argv.includes("--trace") ? { HEAT3D_VIDEO_TRACE: "1" } : {}) },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let log = '';
app.stdout.on('data', (d) => (log += d));
app.stderr.on('data', (d) => (log += d));
let host;
let members;
const result = { rows, runs: [] };
try {
  for (const until = Date.now() + 120_000; !host && Date.now() < until; ) {
    try {
      host = await chromium.connectOverCDP(`http://127.0.0.1:${CDP}`);
    } catch {
      await sleep(200);
    }
  }
  if (!host) throw new Error(`no DevTools port: ${log}`);
  let page;
  for (let i = 0; i < 300 && !page; i++) {
    page = host.contexts().flatMap((c) => c.pages()).find((p) => /tauri\.localhost|127\.0\.0\.1/.test(p.url()));
    if (!page) await sleep(100);
  }
  await page.waitForFunction(() => !!globalThis.__3dheat_engine?.live?.backend && globalThis.__3dheat_engine.live.backend !== 'none', null, { timeout: 60_000 });
  await page.evaluate(() => localStorage.setItem('heat3d.nativeViewport', 'on'));
  await page.reload();
  await page.waitForFunction(() => !!globalThis.__heat3dNative && globalThis.__3dheat_engine?.live?.backend === 'native', null, { timeout: 60_000 });
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
  await cdp.send('DOM.setFileInputFiles', { nodeId, files: files(rows) });
  const extra = Array.from({ length: 8 }, (_, i) => `m${i}`);
  const mapping = {
    x: 'x', y: 'y', z: 'z', time: 'time', personId: 'player', teamId: 'team', extra: ['m0'], onDemand: extra.slice(1),
    extraNumeric: Object.fromEntries(extra.map((c) => [c, true])),
    axes: { up: 'z', flipX: false, flipY: false, flipZ: false, scale: 1 },
  };
  result.load = await page.evaluate(async (m) => {
    const eng = globalThis.__3dheat_engine;
    const t0 = performance.now();
    const r = await globalThis.__heat3dNative.loadFiles([...document.getElementById('__probe_files').files], 1, m, true);
    const until = performance.now() + 600_000;
    await new Promise((res) => setTimeout(res, 300));
    while (performance.now() < until && (eng.live.residentRows + eng.live.droppedRows < r.rows || eng.renderer.dataPending)) await new Promise((res) => setTimeout(res, 20));
    eng.camera.setOrientationDegrees(30, -40);
    eng.frameDataset(true);
    return { rows: r.rows, ms: Math.round(performance.now() - t0) };
  }, mapping);

  /** The host orbiting with the timeline playing for `s` seconds; the viewport's present intervals. */
  const hostOrbit = (s) =>
    page.evaluate(async (s) => {
      const useStore = await globalThis.__heat3dNative.store();
      const eng = globalThis.__3dheat_engine;
      useStore.getState().patchBudget({ adaptive: true, exact: true, targetFps: 60, heatScale: 1 });
      await globalThis.__heat3dNative.play(true);
      if (eng.renderer.times) await eng.renderer.times();
      const dts = [];
      let last = performance.now();
      const until = last + s * 1000;
      while (performance.now() < until) {
        eng.camera.setOrientationDegrees(eng.camera.yawDegrees + 0.3, eng.camera.pitchDegrees);
        await new Promise((r) => requestAnimationFrame(r));
        const now = performance.now();
        dts.push(now - last);
        last = now;
      }
      await globalThis.__heat3dNative.play(false);
      const native = eng.renderer.times ? await eng.renderer.times() : null;
      return { page: dts, present: native?.intervals ?? [] };
    }, s);

  const base = await hostOrbit(secs);
  result.baseline = { page: stats(base.page, 30), present: stats(base.present, 30) };

  const browser = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--enable-unsafe-webgpu'] });
  members = browser;
  if (shared > 0) {
    // The host in the session as a member with the host's role, for the followers to follow (the shared
    // stream draws the native viewport's camera whoever stands for the host here).
    const hp = await (await browser.newContext()).newPage();
    await hp.goto(`http://127.0.0.1:${PORT}/`);
    await hp.waitForFunction(() => !!globalThis.__heat3dSession, null, { timeout: 60_000 });
    await hp.evaluate(({ port, token }) => globalThis.__heat3dSession.client.join({ url: `http://127.0.0.1:${port}`, name: 'host', hostToken: token }), { port: PORT, token: HOST_TOKEN });
    await hp.waitForFunction(() => globalThis.__heat3dSession.store.getState().state === 'joined', null, { timeout: 30_000 }).catch(() => {});
    result.hostMember = await hp.evaluate(() => globalThis.__heat3dSession.store.getState().role);
  }
  for (const run of plan) {
    const n = run.own + run.shared;
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pages = [];
    for (let i = 0; i < n; i++) {
      const follower = i >= run.own;
      const p = await ctx.newPage();
      await p.goto(`http://127.0.0.1:${PORT}/`);
      await p.waitForFunction(() => !!globalThis.__heat3dSession && !!globalThis.__heat3dVideo?.client.view(), null, { timeout: 60_000 });
      await p.evaluate(({ port, pw, i }) => globalThis.__heat3dSession.client.join({ url: `http://127.0.0.1:${port}`, name: `m${i}`, password: pw }), { port: PORT, pw: PW, i });
      await p.waitForFunction(() => globalThis.__heat3dSession.store.getState().state === 'joined', null, { timeout: 30_000 });
      await p.evaluate((follower) => {
        if (follower) {
          // Follows the host: the shared stream of the host's view.
          const s = globalThis.__heat3dSession.store;
          const h = s.getState().members.find((m) => m.role === 'host');
          if (h) s.setState({ followPeer: h.id });
        }
        const e = globalThis.__heat3dVideo.client.view();
        e.camera.setOrientationDegrees(30, -40);
        void globalThis.__heat3dVideo.client.start(e);
      }, follower);
      await p.waitForFunction(() => ['on', 'failed'].includes(globalThis.__heat3dVideo.store.getState().state), null, { timeout: 30_000 });
      const st = await p.evaluate(() => globalThis.__heat3dVideo.store.getState());
      if (st.state !== 'on') {
        // The host's side: its backend and whether its viewport still answers.
        const hostSide = await page
          .evaluate(async () => ({ backend: globalThis.__3dheat_engine?.live?.backend, times: !!(await globalThis.__3dheat_engine?.renderer?.times?.()) }))
          .catch((e) => String(e));
        throw new Error(`member ${i}: ${st.reason} ${st.detail} host ${JSON.stringify(hostSide)}\n${log.slice(-2000)}`);
      }
      pages.push(p);
    }
    if (screens && run === plan[0]) {
      // What the first member sees: the host's picture in place of its own canvas, and the panel.
      mkdirSync(screens, { recursive: true });
      await sleep(2500);
      await pages[0].screenshot({ path: join(screens, 'member-video.png') });
      // Where the picture sits and whether it has frames: a screen without it says why.
      result.videoElement = await pages[0].evaluate(() => {
        const v = document.querySelector('video.session-video');
        if (!v) return null;
        const r = v.getBoundingClientRect();
        const c = v.previousElementSibling;
        return {
          rect: [r.x, r.y, r.width, r.height].map(Math.round),
          size: [v.videoWidth, v.videoHeight],
          paused: v.paused,
          readyState: v.readyState,
          display: getComputedStyle(v).display,
          visibility: getComputedStyle(v).visibility,
          parent: v.parentElement?.className ?? '',
          before: c ? `${c.tagName}.${c.className}` : '',
          topAtCentre: (() => {
            const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
            return e ? `${e.tagName}.${e.className}` : '';
          })(),
        };
      });
      await pages[0].evaluate(() => globalThis.__heat3dSession.store.getState().setPanel(true));
      await sleep(1500);
      await pages[0].screenshot({ path: join(screens, 'member-panel.png') });
      await pages[0].evaluate(() => globalThis.__heat3dSession.store.getState().setPanel(false));
    }
    if (screens && run.shared > 0) {
      await sleep(2500);
      await pages[pages.length - 1].screenshot({ path: join(screens, 'follower-video.png') });
    }
    // Members turn their cameras twice a second while the host orbits.
    const turning = pages.map((p, i) =>
      p.evaluate(
        async ({ s, turn }) => {
          const e = globalThis.__heat3dVideo.client.view();
          const until = performance.now() + s * 1000;
          let k = 0;
          while (performance.now() < until) {
            if (turn) e.camera.setOrientationDegrees(30 + (k++ % 2 ? 25 : -25), -40);
            await new Promise((r) => setTimeout(r, 500));
          }
          return { ...globalThis.__heat3dVideo.client.measurements(), shared: globalThis.__heat3dVideo.store.getState().shared };
        },
        { s: secs + 2, turn: i < run.own },
      ),
    );
    const orbit = await hostOrbit(secs);
    const got = await Promise.all(turning);
    result.runs.push({
      members: n,
      own: run.own,
      following: run.shared,
      present: stats(orbit.present, 30),
      page: stats(orbit.page, 30),
      cameraToPicture: stats(got.flatMap((g) => g.latencies)),
      perMember: got.map((g) => ({ shared: g.shared, ...g.stats, latency: stats(g.latencies) })),
      // The host's figures per frame, as it announced them on each member's channel.
      encodeMs: stats(got.flatMap((g) => g.encodes)),
      drawConvertReadbackMs: stats(got.flatMap((g) => g.renders)),
    });
    for (const p of pages) await p.evaluate(() => globalThis.__heat3dVideo.client.stop()).catch(() => {});
    await sleep(1500);
    await ctx.close();
    await sleep(1500);
  }
} catch (e) {
  result.error = String(e?.stack ?? e);
} finally {
  await members?.close().catch(() => {});
  await host?.close().catch(() => {});
  app.kill();
}
result.log = log.slice(-1500);
try {
  result.viewportLog = readFileSync(join(state, 'viewport.log'), 'utf8').split('\n').filter(Boolean).slice(-40);
} catch {
  /* nothing noted */
}
// The app's state and its WebView2 profile (per run, so a second run never meets a folder still in use).
await sleep(2000);
try {
  rmSync(state, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
} catch {
  /* left for the system's temp cleanup */
}
console.log(JSON.stringify(result, null, 1));
