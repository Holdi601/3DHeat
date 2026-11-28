/**
 * Heat from tiles for a session member, end to end (Stage 6): the built app hosts a session
 * beside its window (`3dheat-app --host`, the same core), the host joins it, the rows' files
 * are dropped on its Source panel (too many rows: tiles by themselves, shared with the
 * session), and a member in a browser opens the viewer the session serves, joins by an
 * invite (a dev server's viewer, `--app`, as the production build hides the engine) and draws the host's heat - the pyramid's key from the session document, the tiles
 * read by key through the session's gateway with the member's token.
 *
 *   node native/tools/probe-session-tiles.mjs --dir <rowceiling folder> [--files 45]
 *        [--out <folder>] [--seconds 8]
 *
 * Reports: the member's time from joining to the first tile and to a settled view, tiles and
 * bytes it read, the status line ("the host's"), the requests through the gateway (count,
 * bytes, p50/p99 latency), frames while its camera orbits, and both pictures from the same
 * camera (mean per-pixel difference, pixels off by more than 8/255). Needs the release app
 * with the page's `dist` copied to <target>/release/web; Windows (WebView2's DevTools port).
 */
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
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
if (!dir) throw new Error('--dir <folder of parquet files>');
const count = Number(arg('files', 45));
const out = resolve(arg('out', join(process.env.TEMP ?? '.', 'heat3d-session-tiles')));
const secs = Number(arg('seconds', 8));
const CDP = Number(arg('cdp', 9349));
const PORT = Number(arg('port', 7960 + Math.floor(Math.random() * 30)));
const SERVER = `http://127.0.0.1:${PORT}`;
const TOKEN = randomBytes(32).toString('hex');
// The member's viewer: a dev server's (the production build hides the engine the probe reads).
const APP = arg('app', 'http://127.0.0.1:5347/');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(out, { recursive: true });
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.parquet'))
  .sort()
  .slice(0, count)
  .map((f) => resolve(dir, f));

function png(width, height, rgba) {
  const T = new Uint32Array(256).map((_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf) => {
    let c = 0xffffffff;
    for (const b of buf) c = T[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const b = Buffer.alloc(12 + data.length);
    b.writeUInt32BE(data.length, 0);
    b.write(type, 4, 'ascii');
    data.copy(b, 8);
    b.writeUInt32BE(crc(b.subarray(4, 8 + data.length)), 8 + data.length);
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

const capture = (page) =>
  page.evaluate(async () => {
    const c = await globalThis.__3dheat_engine.captureFrame();
    return c ? { width: c.width, height: c.height, rgba: Array.from(c.rgba) } : null;
  });
const settle = (page) =>
  page.evaluate(async () => {
    const eng = globalThis.__3dheat_engine;
    let last = -1;
    let still = 0;
    for (let i = 0; i < 1200 && still < 30; i++) {
      await new Promise((r) => requestAnimationFrame(r));
      const s = eng.heatTiles()?.stats;
      const n = s ? s.tiles + s.bytes : -1;
      still = n > 0 && n === last ? still + 1 : 0;
      last = n;
    }
  });

const app = spawn(exe, ['--host', '--plain-http', '--port', String(PORT), '--test-cost', '--host-token', TOKEN, '--no-update-check', '--allow-origin', new URL(APP).origin, '--state-dir', join(out, 'state')], {
  env: { ...process.env, WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${CDP}`, WEBVIEW2_USER_DATA_FOLDER: join(out, `webview2-${CDP}`) },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let log = '';
app.stdout.on('data', (d) => (log += d));
app.stderr.on('data', (d) => (log += d));
let host;
let browser;
try {
  for (const until = Date.now() + 120_000; !host && Date.now() < until; ) {
    try {
      host = await chromium.connectOverCDP(`http://127.0.0.1:${CDP}`);
    } catch {
      await sleep(200);
    }
  }
  if (!host) throw new Error(`no DevTools port: ${log}`);
  let hp;
  for (let i = 0; i < 300 && !hp; i++) {
    hp = host.contexts().flatMap((c) => c.pages()).find((p) => /tauri\.localhost|127\.0\.0\.1/.test(p.url()));
    if (!hp) await sleep(100);
  }
  await hp.waitForFunction(() => !!globalThis.__heat3dNative && !!globalThis.__heat3dSession?.client && !!globalThis.__3dheat_engine?.live?.backend, null, { timeout: 60_000 });
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`${SERVER}/session.json`)).ok) break;
    } catch {
      /* not yet */
    }
    await sleep(200);
  }
  // The host into its own session, an invite for the member.
  await hp.evaluate(({ url, token }) => globalThis.__heat3dSession.client.join({ url, name: 'Host', hostToken: token }), { url: SERVER, token: TOKEN });
  await hp.waitForFunction(() => globalThis.__heat3dSession.store.getState().state === 'joined', null, { timeout: 30_000 }).catch(async (e) => {
    const st = await hp.evaluate(() => {
      const s = globalThis.__heat3dSession.store.getState();
      return JSON.stringify({ state: s.state, error: s.error, reason: s.reason, url: location.href });
    });
    throw new Error(`host did not join: ${st}; app: ${log.slice(-1500)}`);
  });
  await hp.evaluate(() => globalThis.__heat3dSession.client.invite('elevated', 1, 3_600_000, 'tiles'));
  await hp.waitForFunction(() => !!globalThis.__heat3dSession.store.getState().lastInvite?.token);
  const invite = await hp.evaluate(() => globalThis.__heat3dSession.store.getState().lastInvite.token);
  // The files dropped on the host's Source panel.
  await hp.evaluate(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.id = '__probe_files';
    input.style.display = 'none';
    document.body.appendChild(input);
  });
  const cdp = await hp.context().newCDPSession(hp);
  const { root } = await cdp.send('DOM.getDocument');
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#__probe_files' });
  await cdp.send('DOM.setFileInputFiles', { nodeId, files });
  await hp.waitForSelector('.dropzone', { timeout: 30_000 });
  await hp.evaluate(() => {
    const dt = new DataTransfer();
    for (const f of document.getElementById('__probe_files').files) dt.items.add(f);
    document.querySelector('.dropzone').dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
  });
  await hp.waitForFunction(() => /\d/.test(document.querySelector('[data-testid="tile-heat-status"]')?.textContent ?? '') && !/counting/.test(document.querySelector('[data-testid="tile-heat-status"]')?.textContent ?? ''), null, { timeout: 300_000 });
  await settle(hp);
  console.error('host: tiles drawn');
  const hostStatus = await hp.evaluate(() => document.querySelector('[data-testid="tile-heat-status"]')?.textContent);
  const shared = await hp.evaluate(() => globalThis.__heat3dSession.store.getState().state);

  // The member: the viewer the session serves, joined by the invite.
  browser = await chromium.launch({ channel: 'chromium', headless: true, args: ['--enable-unsafe-webgpu', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=d3d11'] });
  const mp = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const errors = [];
  mp.on('pageerror', (e) => errors.push(e.message));
  const reqs = [];
  const started = new Map();
  mp.on('request', (r) => {
    if (r.url().startsWith(`${SERVER}/v1`)) started.set(r, Date.now());
  });
  mp.on('requestfinished', async (r) => {
    if (!started.has(r)) return;
    const res = await r.response();
    const body = res ? await res.body().catch(() => Buffer.alloc(0)) : Buffer.alloc(0);
    reqs.push({ ms: Date.now() - started.get(r), bytes: body.length, status: res?.status() ?? 0 });
  });
  await mp.goto(`${APP}?backend=webgpu`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await mp.waitForFunction(() => !!globalThis.__heat3dSession?.client && !!globalThis.__3dheat_engine?.live?.backend && globalThis.__3dheat_engine.live.backend !== 'none', null, { timeout: 60_000 }).catch(async (e) => {
    await mp.screenshot({ path: join(out, 'member-stuck.png') }).catch(() => {});
    const g = await mp.evaluate(() => ({ url: location.href, session: !!globalThis.__heat3dSession, client: !!globalThis.__heat3dSession?.client, engine: !!globalThis.__3dheat_engine, backend: globalThis.__3dheat_engine?.live?.backend, title: document.title, body: document.body.innerText.slice(0, 300) })).catch((x) => x.message);
    throw new Error(`member viewer: ${JSON.stringify(g)}; errors ${errors.join(' | ')}`);
  });
  console.error('member: viewer up');
  const t0 = Date.now();
  await mp.evaluate(({ url, invite }) => globalThis.__heat3dSession.client.join({ url, name: 'Member', invite }), { url: SERVER, invite });
  await mp.waitForFunction(() => globalThis.__heat3dSession.store.getState().state === 'joined', null, { timeout: 60_000 });
  const joinedMs = Date.now() - t0;
  console.error('member: joined');
  let firstMs = null;
  for (const until = Date.now() + 120_000; Date.now() < until; ) {
    const n = await mp.evaluate(() => globalThis.__3dheat_engine.heatTiles()?.stats?.tiles ?? 0);
    if (n > 0) {
      firstMs = Date.now() - t0;
      break;
    }
    await sleep(50);
  }
  await settle(mp);
  const settledMs = Date.now() - t0;
  const member = await mp.evaluate(() => {
    const src = globalThis.__3dheat_engine.heatTiles();
    return {
      status: document.querySelector('[data-testid="tile-heat-status"]')?.textContent ?? null,
      legend: !!document.querySelector('[data-testid="heat-legend"]'),
      tiles: src?.stats?.tiles ?? 0,
      bytes: src?.stats?.bytes ?? 0,
      level: src?.stats?.drawnLevel,
    };
  });
  // The same camera on both, then both pictures.
  const pose = await hp.evaluate(() => {
    const e = globalThis.__3dheat_engine;
    return { pos: Array.from(e.camPos).slice(0, 3), fwd: Array.from(e.camFwd).slice(0, 3) };
  });
  // The member's window the size of the host's, so the pictures match texel for texel.
  const size = await hp.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }));
  await mp.setViewportSize(size);
  await settle(mp);
  const posed = await mp.evaluate((p) => {
    const e = globalThis.__3dheat_engine;
    const v = (a) => ({ x: a[0], y: a[1], z: a[2] });
    e.setCameraPose(v(p.pos), v(p.fwd));
    e.invalidate(4);
    return true;
  }, pose);
  await settle(mp);
  await settle(hp);
  const a = await capture(hp);
  const b = await capture(mp);
  if (a) writeFileSync(join(out, 'host.png'), png(a.width, a.height, Uint8Array.from(a.rgba)));
  if (b) writeFileSync(join(out, 'member.png'), png(b.width, b.height, Uint8Array.from(b.rgba)));
  let pictures = 'different sizes';
  if (a && b && a.width === b.width && a.height === b.height) {
    let sum = 0;
    let off = 0;
    for (let i = 0; i < a.rgba.length; i += 4) {
      let d = 0;
      for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(a.rgba[i + c] - b.rgba[i + c]));
      sum += d;
      if (d > 8) off++;
    }
    const n = a.rgba.length / 4;
    pictures = `mean ${(sum / n).toFixed(2)}/255, ${((off / n) * 100).toFixed(2)} % > 8/255`;
  }
  const frames = await mp.evaluate(async (secs) => {
    const eng = globalThis.__3dheat_engine;
    const dts = [];
    let last = performance.now();
    const until = last + secs * 1000;
    while (performance.now() < until) {
      eng.camera.setOrientationDegrees(eng.camera.yawDegrees + 0.4, eng.camera.pitchDegrees);
      await new Promise((r) => requestAnimationFrame(r));
      const now = performance.now();
      dts.push(now - last);
      last = now;
    }
    const s = dts.slice(30).sort((x, y) => x - y);
    const q = (p) => s[Math.min(s.length - 1, Math.floor(s.length * p))];
    return { n: s.length, p50: q(0.5), p99: q(0.99), max: s[s.length - 1], over25: s.filter((x) => x > 25).length };
  }, secs);
  const after = await mp.evaluate(() => globalThis.__3dheat_engine.heatTiles()?.stats ?? null);
  const lat = reqs.map((r) => r.ms).sort((x, y) => x - y);
  const q = (p) => lat[Math.min(lat.length - 1, Math.floor(p * lat.length))] ?? 0;
  console.log(`host: "${hostStatus}" (session ${shared})`);
  console.log(`member: joined ${joinedMs} ms, first tile ${firstMs} ms, settled ${settledMs} ms after join; status "${member.status}", legend ${member.legend ? 'shown' : 'NONE'}; ${member.tiles} tiles, ${(member.bytes / 1e6).toFixed(2)} MB, level ${member.level}`);
  console.log(`  gateway /v1: ${reqs.length} requests, ${(reqs.reduce((s, r) => s + r.bytes, 0) / 1e6).toFixed(2)} MB, latency p50 ${q(0.5)} ms p99 ${q(0.99)} ms max ${lat[lat.length - 1] ?? 0} ms, statuses ${[...new Set(reqs.map((r) => r.status))].join(',')}`);
  console.log(`  same camera (${posed ? 'set' : 'NOT set'}): host vs member pictures ${pictures} (in ${out})`);
  console.log(`  orbit ${secs} s: p50/p99/max ${frames.p50.toFixed(1)}/${frames.p99.toFixed(1)}/${frames.max.toFixed(1)} ms, ${frames.over25} over 25 of ${frames.n}; tiles read by then ${after?.tiles} / ${((after?.bytes ?? 0) / 1e6).toFixed(2)} MB`);
  if (errors.length) console.log(`  member page errors: ${errors.slice(0, 3).join(' | ')}`);
} finally {
  await browser?.close().catch(() => {});
  await host?.close().catch(() => {});
  app.kill();
}
