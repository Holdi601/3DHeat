/**
 * The Library's smoke test, on a synthetic library (no real data): a first
 * session as a new user would have it. The welcome screen, adding the levels
 * folder and a folder of matches, the grid with its pictures, a filter, a
 * rating by key, converting replays with a stand-in converter (one fails, one
 * needs Oodle), the maps tab (new maps, extract all), search, the list, and
 * Open in 3DHeat loading a match into the viewer.
 *
 *   node tools/smoke-library.mjs
 *
 * Builds nothing: it needs the release (or debug) build of `3dheat`,
 * `library-demo` and `fake-converter` in BIN_DIR (default
 * E:/cargo-targets/3dheat-lib/release; `cargo build --release -p heat3d-server
 * -p heat3d-library` in native/). It starts the Library's API and a dev server
 * of its own (ports 5340-5349, 127.0.0.1) and writes screenshots to SHOTS.
 */
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const EXE = process.platform === 'win32' ? '.exe' : '';
const BIN_DIR = process.env.BIN_DIR ?? ['E:/cargo-targets/3dheat-lib/release', 'E:/cargo-targets/3dheat-lib/debug'].find((d) => existsSync(join(d, `3dheat${EXE}`)));
if (!BIN_DIR) throw new Error('no 3dheat build: cargo build --release -p heat3d-server -p heat3d-library in native/, or set BIN_DIR');
const API_PORT = Number(process.env.LIB_PORT ?? 5341);
const APP_PORT = Number(process.env.APP_PORT ?? 5342);
const SHOTS = process.env.SHOTS ?? join(tmpdir(), 'heat3d-library-shots');
mkdirSync(SHOTS, { recursive: true });
const dir = mkdtempSync(join(tmpdir(), 'heat3d-library-smoke-'));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` - ${detail}` : ''}`);
};

// ------------------------------------------------------------ the synthetic library
execFileSync(join(BIN_DIR, `library-demo${EXE}`), [dir, '--table', 'native/vectors/build/a.parquet', '--matches', '48'], { stdio: 'inherit' });
const files = join(dir, 'files');
const levels = join(dir, 'data', 'levels');
// The library's own data, levels and outputs inside the synthetic folder, never the user's.
const env = { ...process.env, HEAT3D_LEVELS: levels, HEAT3D_EXTRACTORS: join(dir, 'data', 'extractors', 'installed.json') };
const api = spawn(join(BIN_DIR, `3dheat${EXE}`), ['library', 'serve', '--port', String(API_PORT), '--data', join(dir, 'data')], { env, stdio: ['ignore', 'pipe', 'pipe'] });
api.stderr.on('data', (d) => process.stderr.write(`[library] ${d}`));
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(APP_PORT), '--strictPort', '--host', '127.0.0.1'], {
  env: { ...process.env, HEAT3D_LIBRARY_URL: `http://127.0.0.1:${API_PORT}`, HEAT3D_LEVELS: levels },
  stdio: ['ignore', 'pipe', 'pipe'],
});
vite.stderr.on('data', (d) => process.stderr.write(`[vite] ${d}`));
const APP = `http://127.0.0.1:${APP_PORT}/`;
for (let i = 0; i < 600; i++) {
  try {
    if ((await fetch(APP)).ok) break;
  } catch {
    /* not up yet */
  }
  await wait(200);
}

// The servers end with this script, however it ends.
process.on('exit', () => {
  api.kill();
  vite.kill();
});
// The machine's own GPU (a software renderer is slow and loads the machine).
const browser = await chromium.launch({ args: ['--enable-gpu', '--ignore-gpu-blocklist', ...(process.platform === 'win32' ? ['--use-angle=d3d11'] : [])], timeout: 600_000 });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
const shot = (name) => page.screenshot({ path: join(SHOTS, `${name}.png`) });
const cards = () => page.locator('.lib-card:not(.placeholder)').count();
const until = async (what, fn, ms = 30_000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try {
      if (await fn()) return true;
    } catch {
      /* not yet */
    }
    await wait(250);
  }
  check(what, false, 'timed out');
  return false;
};

try {
  // ---------------------------------------------------------- a first session
  // The dev server's first page compiles every module: give a busy machine time.
  await page.goto(`${APP}?library`, { timeout: 300_000, waitUntil: 'domcontentloaded' });
  await page.getByText('Your replays, in one place').waitFor({ timeout: 300_000 });
  check('a new library greets with Add a folder', await page.getByRole('button', { name: 'Add a folder' }).isVisible());
  await shot('01-welcome');

  for (const folder of [levels, files]) {
    await page.getByRole('button', { name: 'Add a folder' }).first().click();
    await page.getByPlaceholder('Folder path').fill(folder);
    await shot('02-add-folder');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await wait(600);
  }
  await until('the grid fills', async () => (await cards()) >= 20, 60_000);
  // The pictures: the thumbnails loaded as images.
  await until('thumbnails show', () => page.evaluate(() => [...document.querySelectorAll('.lib-card img')].filter((i) => i.complete && i.naturalWidth > 0).length >= 10));
  await shot('03-grid');
  const total = await page.locator('.lib-status').innerText();
  check('the status line counts the items', /\d+ items/.test(total), total.split('\n')[0]);

  // ---------------------------------------------------------- filter
  await page.locator('.lib-check', { hasText: 'War Thunder' }).first().click();
  await until('the game filter narrows the grid', async () => /^(1[0-9]|2[0-9]) items/.test((await page.locator('.lib-status').innerText()).trim()));
  await shot('04-filtered');
  await page.getByRole('button', { name: 'Clear filters' }).click();

  // ---------------------------------------------------------- rate by key, inspector
  await page.locator('.lib-card:not(.placeholder)').first().click();
  await page.keyboard.press('4');
  await until('a rating by key shows on the card', async () => (await page.locator('.lib-card .lib-stars').count()) > 0);
  check('the inspector shows the item', await page.locator('.lib-insp h3').isVisible());
  await shot('05-inspector');

  // ---------------------------------------------------------- convert
  await page.locator('.lib-check', { hasText: 'Replay' }).first().click();
  await until('replays listed', async () => (await cards()) >= 5);
  await page.locator('.lib-card:not(.placeholder)').first().click();
  await page.keyboard.press('Control+A');
  await wait(400);
  await page.getByRole('button', { name: /^Convert/ }).first().click();
  await until('the queue opens', () => page.locator('.lib-queue').isVisible());
  await until(
    'every job ends',
    async () => (await page.locator('.lib-job.queued, .lib-job.running').count()) === 0 && (await page.locator('.lib-job').count()) >= 5,
    90_000,
  );
  const done = await page.locator('.lib-job.done').count();
  const failed = await page.locator('.lib-job.failed').count();
  check('converted replays: the good ones done, the bad ones failed', done >= 3 && failed >= 2, `${done} done, ${failed} failed`);
  check('a missing converter or Oodle is said in words', (await page.getByText('Oodle library').count()) > 0);
  await shot('06-queue');
  await page.locator('.lib-queue header button[aria-label="Close"]').click();

  // ---------------------------------------------------------- maps
  await page.getByRole('tab', { name: 'Maps and levels' }).click();
  await page.getByRole('button', { name: 'Check' }).first().click();
  await until('the extractor says what is new', async () => (await page.getByText(/new maps? available/).count()) > 0);
  await shot('07-maps');
  await page.getByRole('button', { name: /^Extract all/ }).first().click();
  await until('extracting all new maps ends', async () => (await page.getByText('Every map is extracted and up to date.').count()) > 0 || (await page.locator('.lib-job.done').count()) >= 4, 60_000);

  // ---------------------------------------------------------- search, list
  await page.getByRole('tab', { name: 'Library' }).click();
  // The Replay filter from the conversions off again.
  if (await page.getByRole('button', { name: 'Clear filters' }).count()) await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.locator('.lib-search').fill('forest');
  await until('search finds the map', async () => (await cards()) > 0 && (await page.locator('.lib-card .lib-sub', { hasText: 'forest_valley' }).count()) > 0);
  await page.keyboard.press('Escape');
  await page.locator('.lib-scroll').click({ position: { x: 5, y: 5 } }).catch(() => {});
  await page.keyboard.press('l');
  await until('the list shows rows', async () => (await page.locator('.lib-lrow:not(.placeholder)').count()) > 0);
  await shot('08-list');
  await page.keyboard.press('g');

  // ---------------------------------------------------------- open in 3DHeat
  await page.locator('.lib-search').fill('match_000');
  await until('the match with a table is found', async () => (await cards()) === 1);
  await page.locator('.lib-card:not(.placeholder)').first().click();
  // The Library's own window opens a viewer window: follow it.
  const [viewer] = await Promise.all([
    page.context().waitForEvent('page', { timeout: 60_000 }),
    page.getByRole('button', { name: /^Open in 3DHeat/ }).first().click(),
  ]);
  await viewer.waitForLoadState('domcontentloaded', { timeout: 300_000 });
  const loaded = await (async () => {
    for (let i = 0; i < 240; i++) {
      const handed = await viewer.evaluate(() => document.querySelector('.sidebar')?.textContent ?? '').catch(() => '');
      if (/match_000/.test(handed)) return true;
      await wait(250);
    }
    return false;
  })();
  check('Open in 3DHeat hands the match to the viewer', loaded);
  await viewer.screenshot({ path: join(SHOTS, '09-viewer.png') });
  check('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
} catch (e) {
  check('the smoke test ran through', false, String(e));
  await shot('zz-failure').catch(() => {});
} finally {
  await browser.close();
  api.kill();
  vite.kill();
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {
    /* a file still held */
  }
}
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed; screenshots in ${SHOTS}`);
process.exit(failed ? 1 : 0);
