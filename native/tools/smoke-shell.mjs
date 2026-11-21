/**
 * Smoke run of the native app: starts the built app, loads a synthetic Parquet
 * file through its native core, and checks that the heat draws.
 *
 *   node native/tools/smoke-shell.mjs [--exe <3dheat.exe>] [--file <table.parquet>] [--rows N]
 *                                     [--echo-mb 256] [--chunks <file.parquet>...]
 *
 * The file is picked the way a person picks one (a file input, set through the
 * DevTools protocol), so it reaches the core as a picked file does. The core's
 * request counts prove who read it. The heat is checked on screenshots, before
 * and after: a release build exposes no engine handle. Also measures the
 * transfer from core to page (`echo`), and with `--chunks` the engine's chunk
 * layout built by the core and read over. Windows: WebView2's DevTools port.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
};
const many = (name) => process.argv.flatMap((a, i) => (a === `--${name}` ? [process.argv[i + 1]] : []));
const target = process.env.CARGO_TARGET_DIR ?? resolve(import.meta.dirname, '..', 'target');
const exe = arg('exe', join(target, 'release', '3dheat-app.exe'));
const rows = Number(arg('rows', 2_000_000));
const echoMb = Number(arg('echo-mb', 256));
const PORT = Number(arg('port', 9334));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const report = {};
let failed = false;
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failed = true;
};

async function syntheticTable(file, n) {
  if (existsSync(file)) return;
  const { ParquetWriter, fileWriter } = await import('hyparquet-writer');
  const P = 40;
  const w = new ParquetWriter({
    writer: fileWriter(file),
    schema: [
      { name: 'root', num_children: 6 },
      { name: 'x', type: 'FLOAT', repetition_type: 'REQUIRED' },
      { name: 'y', type: 'FLOAT', repetition_type: 'REQUIRED' },
      { name: 'z', type: 'FLOAT', repetition_type: 'REQUIRED' },
      { name: 'time', type: 'DOUBLE', repetition_type: 'REQUIRED' },
      { name: 'player', type: 'BYTE_ARRAY', converted_type: 'UTF8', repetition_type: 'REQUIRED' },
      { name: 'team', type: 'BYTE_ARRAY', converted_type: 'UTF8', repetition_type: 'REQUIRED' },
    ],
    kvMetadata: [],
  });
  const G = 250_000;
  const pos = Array.from({ length: P }, (_, i) => [Math.cos(i) * 800, Math.sin(i) * 800]);
  for (let at = 0; at < n; at += G) {
    const k = Math.min(G, n - at);
    const x = new Float32Array(k);
    const y = new Float32Array(k);
    const z = new Float32Array(k);
    const t = new Float64Array(k);
    const pl = new Array(k);
    const tm = new Array(k);
    for (let i = 0; i < k; i++) {
      const r = at + i;
      const p = r % P;
      const q = pos[p];
      q[0] = Math.max(-1000, Math.min(1000, q[0] + (Math.random() - 0.5) * 6));
      q[1] = Math.max(-1000, Math.min(1000, q[1] + (Math.random() - 0.5) * 6));
      x[i] = q[0];
      y[i] = q[1];
      t[i] = Math.floor(r / P) * 0.1;
      pl[i] = `p${p}`;
      tm[i] = p % 2 ? 'blue' : 'red';
    }
    w.write({
      columnData: [
        { name: 'x', data: x },
        { name: 'y', data: y },
        { name: 'z', data: z },
        { name: 'time', data: t },
        { name: 'player', data: pl },
        { name: 'team', data: tm },
      ],
      rowGroupSize: 100_000,
    });
  }
  w.finish();
}

const dir = join(tmpdir(), 'heat3d-smoke-shell');
mkdirSync(dir, { recursive: true });
const file = resolve(arg('file', join(dir, `synthetic-${rows}.parquet`)));
await syntheticTable(file, rows);

const app = spawn(exe, [], {
  env: { ...process.env, WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${PORT}` },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let appLog = '';
app.stdout.on('data', (d) => (appLog += d));
app.stderr.on('data', (d) => (appLog += d));
const t0 = Date.now();

let browser;
try {
  // A loaded machine may take a minute to start the app and its WebView2.
    for (const until = Date.now() + 120_000; !browser && Date.now() < until; ) {
    try {
      browser = await chromium.connectOverCDP(`http://127.0.0.1:${PORT}`);
    } catch {
      await sleep(100);
    }
  }
  if (!browser) throw new Error(`no DevTools port: ${appLog}`);
  let page;
  for (let i = 0; i < 300 && !page; i++) {
    page = browser.contexts().flatMap((c) => c.pages()).find((p) => /tauri\.localhost|127\.0\.0\.1/.test(p.url()));
    if (!page) await sleep(100);
  }
  if (!page) throw new Error('no app page');
  const consoleLines = [];
  page.on('console', (m) => consoleLines.push(`${m.type()}: ${m.text()}`));
  await page.waitForFunction(() => !!globalThis.__heat3dNative, null, { timeout: 30_000 });
  report.startMs = Date.now() - t0;
  report.endpoint = await page.evaluate(() => globalThis.__heat3dNative.endpoint());
  const hello = await page.evaluate(() => globalThis.__heat3dNative.hello());
  report.core = hello;
  check(hello.threads > 0, `core answers: ${hello.core} ${hello.version}, ${hello.threads} threads, ${(hello.memoryBytes / 2 ** 30).toFixed(0)} GiB`);

  // Lit pixels: coloured ones, which the empty scene and the panels do not have.
  const lit = async () => {
    const png = (await page.screenshot()).toString('base64');
    return page.evaluate(async (b64) => {
      const blob = await (await fetch(`data:image/png;base64,${b64}`)).blob();
      const bmp = await createImageBitmap(blob);
      const c = new OffscreenCanvas(bmp.width, bmp.height);
      const g = c.getContext('2d');
      g.drawImage(bmp, 0, 0);
      const d = g.getImageData(0, 0, bmp.width, bmp.height).data;
      let n = 0;
      for (let i = 0; i < d.length; i += 4) {
        const hi = Math.max(d[i], d[i + 1], d[i + 2]);
        const lo = Math.min(d[i], d[i + 1], d[i + 2]);
        if (hi - lo > 80 && d[i] > 120) n++;
      }
      return n;
    }, png);
  };
  await sleep(1500);
  const before = await lit();

  await page.evaluate(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.id = '__smoke_native_file';
    input.multiple = true;
    input.style.display = 'none';
    document.body.appendChild(input);
  });
  // Set by path, through the DevTools protocol, as a person's pick would be: a
  // Playwright upload over CDP would hand over the bytes, not a file on disk.
  const cdp = await page.context().newCDPSession(page);
  const { root } = await cdp.send('DOM.getDocument');
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#__smoke_native_file' });
  await cdp.send('DOM.setFileInputFiles', { nodeId, files: [file] });
  const tokens = await page.evaluate(() => globalThis.__heat3dNative.tokens([...document.getElementById('__smoke_native_file').files]));
  check(!!tokens[0]?.token, `the picked file reaches the core (token ${tokens[0]?.token})`);
  const load = await page.evaluate(() => globalThis.__heat3dNative.loadFiles([...document.getElementById('__smoke_native_file').files]));
  report.load = load;
  check(load.rows === rows, `loaded ${load.rows} rows in ${(load.ingestMs / 1000).toFixed(2)} s`);
  const after = await page.evaluate(() => globalThis.__heat3dNative.hello());
  check((after.served.build_dataset ?? 0) + (after.served.read_columns ?? 0) >= 1, `the core read the file (${JSON.stringify(after.served)})`);
  await sleep(4000);
  const heat = await lit();
  report.litPixels = { before, after: heat };
  check(heat > before + 2000, `the heat draws: ${before} lit pixels before, ${heat} after`);

  // Transfer from the core to the page.
  const echo = [];
  for (let i = 0; i < 4; i++) echo.push(await page.evaluate((b) => globalThis.__heat3dNative.echo(b), echoMb * 2 ** 20));
  report.echo = echo;
  const best = Math.max(...echo.map((e) => e.gbPerS));
  check(best > 0.2, `transfer core -> page: ${echo.map((e) => e.gbPerS.toFixed(2)).join(', ')} GB/s for ${echoMb} MiB`);

  const shared = [];
  for (let i = 0; i < 4; i++) shared.push(await page.evaluate((b) => globalThis.__heat3dNative.sharedEcho(b), echoMb * 2 ** 20));
  report.shared = shared;
  if (shared[0]) console.log(`info transfer core -> page through shared memory: ${shared.map((e) => e.gbPerS.toFixed(2)).join(', ')} GB/s for ${echoMb} MiB`);

  // Stage 2c: the core builds the dataset, and builds what the page would. The
  // shared vectors' files, picked as a person picks them, built both ways.
  const vectors = resolve(import.meta.dirname, '..', 'vectors', 'build');
  for (const c of [
    { files: ['b1.parquet', 'b2.parquet', 'b4.parquet'], mapping: { x: 'x', y: 'y', z: 'z', time: 'time', timeUnit: 'unix_milliseconds', personId: 'player', teamId: 'team', extra: ['speed', 'gear'], extraNumeric: { speed: true, gear: false } } },
    { files: ['c1.parquet', 'c2.parquet'], mapping: { x: 'x', y: 'y', z: 'z', time: 'time', personId: 'player', teamId: 'team', sessionId: 'session', lookMode: 'yawPitch', yaw: 'heading', pitch: 'elev', angleUnit: 'degrees' } },
  ]) {
    await cdp.send('DOM.setFileInputFiles', { nodeId, files: c.files.map((f) => join(vectors, f)) });
    const p = await page.evaluate((m) => globalThis.__heat3dNative.parity([...document.getElementById('__smoke_native_file').files], m), c.mapping);
    check(p.coreBuilt && p.differs.length === 0, `core-built dataset of ${c.files.join(', ')} (${p.rows} rows) is the page's: ${p.differs.length ? `differs in ${p.differs.join(', ')}` : 'every column the same'}`);
  }

  const chunkFiles = many('chunks').map((f) => resolve(f));
  if (chunkFiles.length) {
    const roles = { x: 'x', y: 'y', z: 'z', time: 'time', person: 'player', group: 'team' };
    const c = await page.evaluate(([p, r]) => globalThis.__heat3dNative.chunks(p, r), [chunkFiles, roles]);
    report.chunks = c;
    check(c.rows > 0, `chunks: ${c.rows} rows, ${c.chunks} chunks built in ${(c.buildMs / 1000).toFixed(2)} s, read over at ${c.gbPerS.toFixed(2)} GB/s`);
  }
  const errors = consoleLines.filter((l) => l.startsWith('error'));
  check(errors.length === 0, `no console errors${errors.length ? `: ${errors.slice(0, 3).join(' | ')}` : ''}`);
} catch (e) {
  console.error(e);
  failed = true;
} finally {
  await browser?.close().catch(() => {});
  app.kill();
}
console.log(JSON.stringify(report, null, 1));
process.exit(failed ? 1 : 0);
