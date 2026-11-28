/**
 * Heat from tiles in the built app, as a person gets it (Stage 6): the app started, the
 * rows' files dropped on the Source panel the way a person drops them, so the app finds
 * they need a stride and draws the heat from the core's tile pyramid by itself. Run once
 * with the web engine and once with the native viewport (Settings > Native viewport):
 *
 *   node native/tools/probe-native-tiles.mjs --dir <rowceiling folder> [--files 45]
 *        [--backends webgpu,native] [--out <folder>] [--seconds 8] [--port 9347]
 *
 * Reports per backend: the status line's text, time to the first tile and to the whole
 * pyramid, whether the legend shows, the picture (captureFrame, the viewport's own for
 * native) with its lit share, the page's and the viewport's frame intervals while the
 * camera orbits (p50 / p99 / max, over 25 ms), and the viewport's errors. Between the two
 * pictures: the mean per-pixel difference and the pixels off by more than 8/255.
 * Needs the release app (`cargo build --release -p heat3d-app`) with the page's `dist`
 * copied to <target>/release/web. Windows (WebView2's DevTools port); the real GPU.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
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
const out = resolve(arg('out', join(process.env.TEMP ?? '.', 'heat3d-native-tiles')));
const secs = Number(arg('seconds', 8));
const backends = String(arg('backends', 'webgpu,native')).split(',');
const PORT = Number(arg('port', 9347));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(out, { recursive: true });

const files = readdirSync(dir)
  .filter((f) => f.endsWith('.parquet'))
  .sort()
  .slice(0, count)
  .map((f) => resolve(dir, f));

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

async function run(backend) {
  const vlog = join(out, `${backend}-viewport.log`);
  rmSync(vlog, { force: true });
  const app = spawn(exe, [], {
    env: { ...process.env, WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${PORT}`, WEBVIEW2_USER_DATA_FOLDER: join(out, `webview2-${PORT}`), HEAT3D_VIEWPORT_LOG: vlog },
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
    page.on('pageerror', (e) => errors.push(e.message));
    await page.waitForFunction(() => !!globalThis.__3dheat_engine?.live?.backend && globalThis.__3dheat_engine.live.backend !== 'none', null, { timeout: 60_000 });
    await page.evaluate((on) => localStorage.setItem('heat3d.nativeViewport', on ? 'on' : 'off'), backend === 'native');
    await page.reload();
    await page.waitForFunction(() => !!globalThis.__heat3dNative && !!globalThis.__3dheat_engine?.live?.backend && globalThis.__3dheat_engine.live.backend !== 'none', null, { timeout: 60_000 });
    const got = await page.evaluate(() => globalThis.__3dheat_engine.live.backend);
    if (got !== backend) throw new Error(`asked for ${backend}, the app runs ${got}`);
    // The files as a drop on the Source panel's drop zone (what a person does with a folder's files).
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
    await cdp.send('DOM.setFileInputFiles', { nodeId, files });
    await page.waitForSelector('.dropzone', { timeout: 30_000 });
    const t0 = Date.now();
    await page.evaluate(() => {
      const dt = new DataTransfer();
      for (const f of document.getElementById('__probe_files').files) dt.items.add(f);
      const zone = document.querySelector('.dropzone');
      zone.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
    });
    const status = () => page.evaluate(() => document.querySelector('[data-testid="tile-heat-status"]')?.textContent ?? null);
    let firstAt = 0;
    let doneAt = 0;
    let text = null;
    for (const until = Date.now() + 300_000; Date.now() < until; ) {
      text = await status();
      if (text && !firstAt && /\d/.test(text) && !/waiting|wartet/.test(text)) firstAt = Date.now();
      if (text && firstAt && !/counting/.test(text)) {
        doneAt = Date.now();
        break;
      }
      await sleep(100);
    }
    // Settled: every tile of the view in (the native viewport says so with tilesPending).
    await page.evaluate(async () => {
      const eng = globalThis.__3dheat_engine;
      for (let i = 0; i < 600; i++) {
        await new Promise((r) => requestAnimationFrame(r));
        const rd = eng.renderer;
        if (i > 60 && !(rd.snap?.tilesPending ?? false)) break;
      }
    });
    const state = await page.evaluate(() => {
      const eng = globalThis.__3dheat_engine;
      const src = eng.heatTiles();
      return {
        status: document.querySelector('[data-testid="tile-heat-status"]')?.textContent ?? null,
        legend: document.querySelector('[data-testid="heat-legend"]')?.textContent ?? null,
        loadCard: !!document.querySelector('[data-testid="load-card"]'),
        tiles: src?.stats ? { tiles: src.stats.tiles, bytes: src.stats.bytes, level: src.stats.drawnLevel, leaf: src.info?.leafLevel, rows: src.info?.rowsCounted } : null,
        snap: eng.renderer.snap ? { tilesPending: eng.renderer.snap.tilesPending, frames: eng.renderer.snap.frames } : null,
        page: src ? { wanted: src.wanted.map((t) => `${t.level}/${t.x}/${t.y}`), cached: [...src.cache.keys()], empty: [...src.empty], asked: [...src.asked].length } : null,
      };
    });
    const cap = await page.evaluate(async () => {
      const c = await globalThis.__3dheat_engine.captureFrame();
      return c ? { width: c.width, height: c.height, rgba: Array.from(c.rgba) } : null;
    });
    let lit = null;
    if (cap) {
      const rgba = Uint8Array.from(cap.rgba);
      writeFileSync(join(out, `${backend}.png`), png(cap.width, cap.height, rgba));
      let n = 0;
      // Lit: brighter than the background by a margin in any channel.
      for (let i = 0; i < rgba.length; i += 4) if (Math.max(rgba[i], rgba[i + 1], rgba[i + 2]) > 60) n++;
      lit = n / (cap.width * cap.height);
    }
    await page.screenshot({ path: join(out, `${backend}-page.png`), timeout: 10_000 }).catch((e) => errors.push(`screenshot: ${e.message.split(String.fromCharCode(10))[0]}`));
    const frames = await page.evaluate(async (secs) => {
      const eng = globalThis.__3dheat_engine;
      if (eng.renderer.times) await eng.renderer.times();
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
      const native = eng.renderer.times ? await eng.renderer.times() : null;
      const stats = (a) => {
        const s = a.slice(30).sort((x, y) => x - y);
        const q = (p) => s[Math.min(s.length - 1, Math.floor(s.length * p))];
        return s.length ? { n: s.length, p50: q(0.5), p99: q(0.99), max: s[s.length - 1], over25: s.filter((x) => x > 25).length } : null;
      };
      return { page: stats(dts), present: native ? stats(native.intervals) : null };
    }, secs);
    const vl = existsSync(vlog) ? readFileSync(vlog, 'utf8').trim() : '';
    return { backend, firstMs: firstAt ? firstAt - t0 : null, doneMs: doneAt ? doneAt - t0 : null, state, lit, frames, cap, errors: errors.slice(0, 5), viewportLog: vl.slice(-1500) };
  } finally {
    await browser?.close().catch(() => {});
    app.kill();
    await sleep(2500);
  }
}

const f1 = (v) => (v == null ? '-' : v.toFixed(1));
const results = [];
for (const b of backends) {
  const r = await run(b);
  results.push(r);
  console.log(`${b}: first tile ${r.firstMs} ms, pyramid ${r.doneMs} ms; status "${r.state.status}"; legend ${r.state.legend ? 'shown' : 'NONE'}; load card ${r.state.loadCard ? 'SHOWN' : 'gone'}`);
  if (process.argv.includes('--debug')) console.log(`  page tiles ${JSON.stringify(r.state.page)}`);
  console.log(`  tiles ${JSON.stringify(r.state.tiles)} snap ${JSON.stringify(r.state.snap)}; lit ${r.lit == null ? '-' : (r.lit * 100).toFixed(1) + '%'}`);
  const fr = r.frames;
  console.log(`  frames page p50/p99/max ${f1(fr.page?.p50)}/${f1(fr.page?.p99)}/${f1(fr.page?.max)} ms (${fr.page?.over25} over 25)` + (fr.present ? `; presents ${f1(fr.present.p50)}/${f1(fr.present.p99)}/${f1(fr.present.max)} (${fr.present.over25} over 25 of ${fr.present.n})` : ''));
  if (r.errors.length) console.log(`  page errors: ${r.errors.join(' | ')}`);
  if (r.viewportLog) console.log(`  viewport log: ${r.viewportLog}`);
}
const [a, b] = results;
if (a?.cap && b?.cap && a.cap.width === b.cap.width && a.cap.height === b.cap.height) {
  let sum = 0;
  let off = 0;
  for (let i = 0; i < a.cap.rgba.length; i += 4) {
    let d = 0;
    for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(a.cap.rgba[i + c] - b.cap.rgba[i + c]));
    sum += d;
    if (d > 8) off++;
  }
  const n = a.cap.rgba.length / 4;
  console.log(`pictures ${a.backend} vs ${b.backend}: mean ${(sum / n).toFixed(2)}/255, ${((off / n) * 100).toFixed(2)} % > 8/255 (written to ${out})`);
}
