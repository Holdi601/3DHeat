/**
 * Frame times of the host's viewer in a session: does presence and the
 * shared layers' traffic of nine other members (simulated, by the
 * `loadgen` example of native/crates/session) cost the host frames?
 *
 * The host is a real viewer on the GPU (Edge, WebGPU, a window), with 2
 * million synthetic rows as heat and the camera orbiting all the time. Frame
 * intervals are measured alone first, then in the session with the nine
 * others moving their cameras ten times a second and setting marks.
 *
 *   node tools/probe-session-perf.mjs [members=9] [seconds=12]
 *
 * Needs the dev server (APP, default http://127.0.0.1:5275/) and the server
 * and loadgen builds (cargo build --release -p heat3d-server -p heat3d-session --examples in native/).
 */
import { chromium } from 'playwright';
import { execFileSync, spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const MEMBERS = Number(process.argv[2] ?? 9);
const SECONDS = Number(process.argv[3] ?? 12);
const APP = process.env.APP ?? 'http://127.0.0.1:5275/';
const TARGET = process.env.CARGO_TARGET ?? 'E:/cargo-targets/3dheat/release';
const PORT = 7990 + Math.floor(Math.random() * 9);
const SERVER = `http://127.0.0.1:${PORT}`;
const TOKEN = randomBytes(32).toString('hex');
const state = mkdtempSync(join(tmpdir(), 'heat3d-session-perf-'));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// The defaults: no fixed member cap, the members all from one address (as a team behind one office address).
const server = spawn(`${TARGET}/3dheat.exe`, ['serve', '--plain-http', '--port', String(PORT), '--test-cost', '--host-token', TOKEN, '--allow-origin', new URL(APP).origin, '--state-dir', state, '--no-update-check'], { stdio: 'ignore' });

/** The server's and its gateway's CPU seconds and memory (Windows): [cpu s, working set MiB]. */
function serverUse() {
  try {
    const ps = `$p = Get-CimInstance Win32_Process | ? { $_.ProcessId -eq ${server.pid} -or $_.ParentProcessId -eq ${server.pid} }; $c = 0; $m = 0; foreach ($x in $p) { $g = Get-Process -Id $x.ProcessId -ErrorAction SilentlyContinue; if ($g) { $c += $g.CPU; $m += $g.WorkingSet64 } }; "$c $m"`;
    const [c, m] = execFileSync('powershell', ['-NoProfile', '-Command', ps], { encoding: 'utf8' }).trim().split(/\s+/).map(Number);
    return [c, m / 1048576];
  } catch {
    return [NaN, NaN];
  }
}
for (let i = 0; i < 100; i++) {
  try {
    if ((await fetch(`${SERVER}/session.json`)).ok) break;
  } catch {
    /* not yet */
  }
  await wait(100);
}

const browser = await chromium.launch({ channel: 'msedge', headless: false, args: ['--enable-unsafe-webgpu'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
for (const r of ['figure-pack', 'model-pack', 'unit-catalogs']) await page.route(`**/__heat3d/${r}*`, (x) => x.fulfill({ status: 204, body: '' }));
await page.goto(`${APP}?session=${encodeURIComponent(SERVER)}`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine && globalThis.__3dheat && globalThis.__heat3dSession?.marks), null, { timeout: 180_000 });
await page.evaluate(() => {
  const s = globalThis.__3dheat.useStore.getState();
  s.setDataset(globalThis.__3dheat.generateSynthetic({ ...globalThis.__3dheat.DEFAULT_SYNTH, rows: 2_000_000 }));
  s.setMode('heat-simple');
});
await wait(6000);

/** Frame intervals over `frames` frames with the camera orbiting. */
const measure = (frames) =>
  page.evaluate(async (frames) => {
    const e = globalThis.__3dheat_engine;
    const b = globalThis.__3dheat.useStore.getState().dataset.bounds;
    const c = { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2, z: (b.minZ + b.maxZ) / 2 };
    const r = Math.max(b.maxX - b.minX, b.maxZ - b.minZ) * 0.9;
    const gaps = [];
    let last = performance.now();
    let k = 0;
    await new Promise((res) => {
      const tick = () => {
        const now = performance.now();
        gaps.push(now - last);
        last = now;
        const a = k++ * 0.01;
        e.setCameraPose({ x: c.x + r * Math.cos(a), y: c.y + r * 0.5, z: c.z + r * Math.sin(a) }, { x: -Math.cos(a), y: -0.45, z: -Math.sin(a) });
        if (gaps.length < frames) requestAnimationFrame(tick);
        else res();
      };
      requestAnimationFrame(tick);
    });
    const s = gaps.slice(5).sort((x, y) => x - y);
    return { frames: s.length, median: s[s.length >> 1], p99: s[Math.floor(s.length * 0.99)], max: s[s.length - 1] };
  }, frames);

const fmt = (r) => `median ${r.median.toFixed(2)} ms, p99 ${r.p99.toFixed(2)} ms, max ${r.max.toFixed(2)} ms over ${r.frames} frames`;
const alone = await measure(SECONDS * 60);
console.log(`alone:      ${fmt(alone)}`);

// Into the session as the host, an invite for the others.
await page.evaluate(({ url, token }) => globalThis.__heat3dSession.client.join({ url, name: 'Host', hostToken: token }), { url: SERVER, token: TOKEN });
await page.waitForFunction(() => globalThis.__heat3dSession.store.getState().state === 'joined');
await page.evaluate((n) => globalThis.__heat3dSession.client.invite('elevated', n, 3_600_000, 'load'), MEMBERS);
await page.waitForFunction(() => !!globalThis.__heat3dSession.store.getState().lastInvite?.token);
const invite = await page.evaluate(() => globalThis.__heat3dSession.store.getState().lastInvite.token);
const gen = spawn(`${TARGET}/examples/loadgen.exe`, [`ws://127.0.0.1:${PORT}/ws`, String(MEMBERS), invite, String(SECONDS + 15)], { stdio: ['ignore', 'pipe', 'inherit'] });
let genOut = '';
gen.stdout.on('data', (d) => (genOut += d));
await wait(Math.max(5000, MEMBERS * 120));
const peers = await page.evaluate(() => globalThis.__heat3dSession.presence.size);
const [cpu0] = serverUse();
const t0 = performance.now();
// The host page's own work on the session's messages: long tasks while it is in the session.
await page.evaluate(() => {
  globalThis.__longTasks = [];
  new PerformanceObserver((l) => globalThis.__longTasks.push(...l.getEntries().map((e) => e.duration))).observe({ type: 'longtask', buffered: false });
});
const loaded = await measure(SECONDS * 60);
const [cpu1, mem1] = serverUse();
const longTasks = await page.evaluate(() => globalThis.__longTasks);
console.log(`server + gateway: ${(((cpu1 - cpu0) / ((performance.now() - t0) / 1000)) * 100).toFixed(1)} % of one core, ${mem1.toFixed(0)} MiB; host page long tasks ${longTasks.length} (max ${Math.max(0, ...longTasks).toFixed(0)} ms)`);
const marks = await page.evaluate(() => globalThis.__heat3dSession.marks.getState().doc.pins.length);
console.log(`in session: ${fmt(loaded)}  (${peers} others' cameras shown, ${marks} marks arrived)`);
// The same with the marks hidden: what the others' cameras cost alone.
await page.evaluate(() => globalThis.__heat3dSession.marks.getState().setVisible(false));
const noMarks = await measure(SECONDS * 60);
console.log(`marks hidden: ${fmt(noMarks)}`);
await page.evaluate(() => globalThis.__heat3dSession.marks.getState().setVisible(true));
await new Promise((r) => gen.on('exit', r));
console.log(`loadgen: ${genOut.trim()}`);
await browser.close();
server.kill();
rmSync(state, { recursive: true, force: true });
