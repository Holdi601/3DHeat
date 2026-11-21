/**
 * Local usage statistics, end to end: a dev server of this checkout with the
 * statistics switched on (HEAT3D_USAGE=1, the same as `"usageStats": true` in
 * tools/local-data.json), a browser doing a few things - a palette search that
 * finds nothing, a palette command, a section opened, a quick-bar button, a
 * key - and the day's jsonl file checked: those events are there, every line
 * passes the schema, and none holds a file name or a path. The route refuses
 * a batch with content in it. Then the same with the statistics off: the route
 * answers 204 and nothing is written.
 *
 *   node tools/smoke-usage.mjs [port]      (default 5285; starts and stops its own server)
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { checkEvent } from '../src/usage/schema.ts';

const REPO = resolve(import.meta.dirname, '..');
const PORT = Number(process.argv[2] ?? 5285);
const URL_ = `http://127.0.0.1:${PORT}`;
const english = {};
const enDir = join(REPO, 'src', 'i18n', 'locales', 'en');
for (const f of readdirSync(enDir)) if (f.endsWith('.json')) Object.assign(english, JSON.parse(readFileSync(join(enDir, f), 'utf8')));
const isKey = (k) => k in english;

let failed = 0;
async function step(name, fn) {
  try {
    await fn();
    console.log(`ok   ${name}`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${name}: ${e instanceof Error ? e.message : e}`);
  }
}
const expect = (cond, what) => {
  if (!cond) throw new Error(what);
};

async function server(on, dir) {
  const child = spawn(process.execPath, [join(REPO, 'node_modules', 'vite', 'bin', 'vite.js'), '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], {
    cwd: REPO,
    env: { ...process.env, HEAT3D_USAGE: on ? '1' : '0', HEAT3D_USAGE_DIR: dir },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  child.stdout.on('data', (d) => (log += d));
  child.stderr.on('data', (d) => (log += d));
  const until = Date.now() + 90_000;
  for (;;) {
    try {
      const r = await fetch(`${URL_}/__heat3d/usage`);
      if (r.status === (on ? 200 : 204)) break;
    } catch {
      // not up yet
    }
    if (Date.now() > until || child.exitCode !== null) throw new Error(`server did not start:\n${log.slice(-2000)}`);
    await new Promise((r) => setTimeout(r, 500));
  }
  return child;
}

const stop = (child) =>
  new Promise((r) => {
    if (child.exitCode !== null) return r();
    child.once('exit', () => r());
    child.kill();
    setTimeout(r, 5000);
  });

/** A few things a user does; then the buffer written out. */
async function act(page) {
  await page.goto(`${URL_}/`, { timeout: 120_000 });
  await page.waitForFunction(() => !!window.__3dheat_engine && !!window.__3dheat_usage, null, { timeout: 90_000 });
  // Some data, so the view's buttons are live.
  await page.evaluate(() => window.__3dheat.load(20_000));
  await page.waitForTimeout(1500);
  const canvas = page.locator('canvas').first();
  await canvas.click({ position: { x: 300, y: 300 } });
  // A search that finds nothing, then one that runs a command.
  await page.keyboard.press('Control+KeyK');
  await page.keyboard.type('qqqzzzxxx');
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+KeyK');
  await page.keyboard.type('Frame the data');
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  // A section of the side panel opened, a quick-bar button, a key.
  await page.locator('.sidebar .section:not(.open)[data-section] > header').first().click();
  await page.waitForTimeout(300);
  await page.locator('.quick-bar [data-usage="cam:top"]').click({ timeout: 10_000 });
  await page.waitForTimeout(300);
  await canvas.focus();
  await page.keyboard.press('KeyF');
  await page.waitForTimeout(300);
  await page.evaluate(() => window.__3dheat_usage.flush());
  await page.waitForTimeout(800);
}

const lines = (dir) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => /^usage-.*\.jsonl$/.test(f))
        .flatMap((f) => readFileSync(join(dir, f), 'utf8').split('\n').filter(Boolean))
    : [];

const base = join(REPO, 'tools', '.smoke', 'usage');
rmSync(base, { recursive: true, force: true });
const onDir = join(base, 'on');
const offDir = join(base, 'off');
mkdirSync(base, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });

// ------------------------------------------------------------------ on
let child = await server(true, onDir);
try {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await step('with the local key on, a few actions are recorded', async () => {
    await act(page);
    // The batch is posted when the page flushes; give the server a moment to append it.
    for (let i = 0; i < 40 && !lines(onDir).some((l) => l.includes('"cam:top"')); i++) await page.waitForTimeout(250);
    await page.waitForTimeout(500);
    const events = lines(onDir).map((l) => JSON.parse(l));
    expect(events.length >= 5, `only ${events.length} events written`);
    const has = (pred, what) => expect(events.some(pred), `no ${what} in ${JSON.stringify(events.map((e) => `${e.k} ${e.id ?? ''} ${e.src ?? ''}`))}`);
    has((e) => e.k === 'session' && /^(webgpu|webgl2|none)$/.test(e.v), 'session event');
    has((e) => e.k === 'search' && e.n === 0 && e.q === 'qqqzzzxxx', 'palette miss with its words');
    has((e) => e.k === 'use' && e.id === 'cmd:frame' && e.src === 'palette', 'palette command');
    has((e) => e.k === 'open' && /^sec:/.test(e.id), 'section opened');
    has((e) => e.k === 'use' && e.id === 'cam:top' && e.src === 'quick', 'quick-bar button');
    has((e) => e.k === 'use' && e.id === 'cmd:frame' && e.src === 'key', 'key');
  });
  await step('every line passes the schema and holds no content', async () => {
    const raw = lines(onDir);
    for (const l of raw) {
      const why = checkEvent(JSON.parse(l), isKey);
      expect(why === null, `${why}: ${l}`);
      expect(!/[\\/]{2}|[A-Za-z]:[\\/]|\.(parquet|csv|acmi|wrpl|glb)"/.test(l), `content in ${l}`);
    }
  });
  await step('the route refuses a batch with a path in it, and takes nothing of it', async () => {
    const before = lines(onDir).length;
    const bad = { v: 1, events: [{ t: Date.now(), k: 'use', s: 'abcdef12', id: 'sec:C:/Users/x/movement.parquet' }] };
    const r = await fetch(`${URL_}/__heat3d/usage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bad) });
    expect(r.status === 400, `status ${r.status}`);
    const extra = await fetch(`${URL_}/__heat3d/usage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ v: 1, events: [{ t: Date.now(), k: 'use', s: 'abcdef12', id: 'cmd:play', file: 'x' }] }) });
    expect(extra.status === 400, `unknown field: status ${extra.status}`);
    const big = await fetch(`${URL_}/__heat3d/usage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'x'.repeat(600 * 1024) }).catch(() => ({ status: 413 }));
    expect(big.status === 413, `oversize: status ${big.status}`);
    const cross = await fetch(`${URL_}/__heat3d/usage`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://elsewhere.example' }, body: JSON.stringify({ v: 1, events: [{ t: Date.now(), k: 'use', s: 'abcdef12', id: 'cmd:play' }] }) });
    expect(cross.status === 403, `cross origin: status ${cross.status}`);
    expect(lines(onDir).length === before, 'a refused batch was written');
  });
  await page.close();
} finally {
  await stop(child);
}

// ------------------------------------------------------------------ off
child = await server(false, offDir);
try {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await step('with the local key off, the route answers 204 and nothing is written', async () => {
    await act(page);
    const r = await fetch(`${URL_}/__heat3d/usage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ v: 1, events: [{ t: Date.now(), k: 'use', s: 'abcdef12', id: 'cmd:play' }] }) });
    expect(r.status === 204, `status ${r.status}`);
    expect(!existsSync(offDir), 'the usage folder was created');
    const state = await page.evaluate(() => window.__3dheat_usage.state());
    expect(!state.enabled && state.kept === 0, `recording: ${JSON.stringify(state)}`);
  });
  await page.close();
} finally {
  await stop(child);
}

await browser.close();
console.log(failed ? `${failed} step(s) failed` : 'all steps passed');
process.exit(failed ? 1 : 0);
