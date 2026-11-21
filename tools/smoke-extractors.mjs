/**
 * The Extractors panel end to end, with no network and no game: the native
 * manager's route served by `cargo run --example serve-fake` (a stand-in
 * GitHub on 127.0.0.1 with fake extractors, a scratch data folder), a dev
 * server of this checkout, and a browser whose `/__heat3d/extractors`
 * requests are handed to the manager (as the app's own server would answer
 * them). Install, the requirements check, Run; new maps counted, extracted
 * map by map and one picked on its own; a new release asked about first
 * (notes, Later, Skip this version, Update now), Update automatically;
 * Remove; then the same page without a manager shows "Get the extractors".
 *
 *   node tools/smoke-extractors.mjs [port]     (default 5287; starts and stops its own servers)
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const REPO = resolve(import.meta.dirname, '..');
const NATIVE = join(REPO, 'native');
const PORT = Number(process.argv[2] ?? 5287);
const URL_ = `http://127.0.0.1:${PORT}`;
const SCRATCH = join(REPO, 'tools', '.smoke', 'extractors');

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

rmSync(SCRATCH, { recursive: true, force: true });
mkdirSync(SCRATCH, { recursive: true });

// The fake extractor and the manager's stand-in server.
const built = spawnSync('cargo', ['build', '-q', '-p', 'heat3d-extractors', '--examples'], { cwd: NATIVE, stdio: 'inherit' });
if (built.status !== 0) throw new Error('cargo build of the examples failed');
const exe = join(NATIVE, 'target', 'debug', 'examples', `serve-fake${process.platform === 'win32' ? '.exe' : ''}`);
const fake = spawn(exe, [SCRATCH], { stdio: ['ignore', 'pipe', 'inherit'] });
const managerPort = await new Promise((res, rej) => {
  let out = '';
  fake.stdout.on('data', (d) => {
    out += d;
    const m = /listening (\d+)/.exec(out);
    if (m) res(Number(m[1]));
  });
  fake.once('exit', () => rej(new Error(`serve-fake ended: ${out}`)));
});
const MANAGER = `http://127.0.0.1:${managerPort}`;

const vite = spawn(process.execPath, [join(REPO, 'node_modules', 'vite', 'bin', 'vite.js'), '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], {
  cwd: REPO,
  stdio: ['ignore', 'pipe', 'pipe'],
});
let log = '';
vite.stdout.on('data', (d) => (log += d));
vite.stderr.on('data', (d) => (log += d));
for (const until = Date.now() + 300_000; ; ) {
  try {
    if ((await fetch(URL_)).ok) break;
  } catch {
    // not up yet
  }
  if (Date.now() > until || vite.exitCode !== null) throw new Error(`dev server did not start:\n${log.slice(-2000)}`);
  await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

async function openPanel(page) {
  // A cold dev server on a busy machine takes minutes for its first page.
  await page.goto(`${URL_}/`, { timeout: 300_000 });
  const section = page.locator('.sidebar .section[data-section="extractors.title"]');
  await section.waitFor({ timeout: 90_000 });
  if (!(await section.evaluate((el) => el.classList.contains('open')))) await section.locator(':scope > header').click();
  return section;
}

const row = (section, id) => section.locator(`[data-extractor="${id}"]`);
// Every check, status and extract starts the fake extractor: seconds each on a busy machine.
const WAIT = 180_000;
const status = (section, id, want) => section.locator(`[data-extractor="${id}"][data-status="${want}"]`).waitFor({ timeout: WAIT });

try {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  page.setDefaultTimeout(WAIT);
  // The app's own server answers this route; here the stand-in manager does.
  await page.route('**/__heat3d/extractors**', async (route) => {
    const u = new URL(route.request().url());
    try {
      const res = await route.fetch({ url: MANAGER + u.pathname + u.search, timeout: 0 });
      await route.fulfill({ response: res });
    } catch {
      await route.abort().catch(() => {}); // the page closed meanwhile
    }
  });
  const section = await openPanel(page);

  await step('the fake index is listed with its states', async () => {
    await row(section, 'heat3d-alpha').waitFor({ timeout: WAIT });
    await status(section, 'heat3d-alpha', 'missing');
    await status(section, 'heat3d-beta', 'missing');
    await row(section, 'heat3d-gamma').getByText('no release published yet').waitFor({ timeout: WAIT });
  });

  await step('Install: downloaded, verified, unpacked, its requirements shown', async () => {
    await row(section, 'heat3d-alpha').getByRole('button', { name: 'Install' }).click();
    await status(section, 'heat3d-alpha', 'installed');
    await row(section, 'heat3d-alpha').getByText('Installed 1.0.0').waitFor({ timeout: WAIT });
    await row(section, 'heat3d-alpha').getByText('✓ Started by the panel').waitFor({ timeout: WAIT });
    await row(section, 'heat3d-alpha').getByText('✗ Game install found').waitFor({ timeout: WAIT });
    const exe = join(SCRATCH, 'data', 'extractors', 'heat3d-alpha', '1.0.0', 'heat3d-alpha', `heat3d-alpha${process.platform === 'win32' ? '.exe' : ''}`);
    expect(existsSync(exe), `no ${exe}`);
  });

  await step('Run: started as its own program, managed, told the levels folder', async () => {
    await row(section, 'heat3d-alpha').getByRole('button', { name: 'Run' }).click();
    const ran = join(SCRATCH, 'levels', 'ran-heat3d-alpha.txt');
    for (let i = 0; i < 100 && !existsSync(ran); i++) await page.waitForTimeout(100);
    expect(existsSync(ran), 'it did not run');
    expect(readFileSync(ran, 'utf8') === '1.0.0 managed=true', readFileSync(ran, 'utf8'));
    await status(section, 'heat3d-alpha', 'installed');
  });

  const counts = (text) => row(section, 'heat3d-alpha').locator('[data-map-counts]').getByText(text).waitFor({ timeout: WAIT });

  await step('new maps: counted, extracted map by map, counted again', async () => {
    writeFileSync(join(SCRATCH, 'levels', '.fake-install.txt'), 'm1\nm2\n');
    // The status was taken before the install file: a fresh look takes it again.
    await section.getByRole('button', { name: 'Look for updates' }).click();
    await counts('2 new maps available');
    await row(section, 'heat3d-alpha').getByRole('button', { name: 'Extract', exact: true }).click();
    await row(section, 'heat3d-alpha').locator('[data-extract-done]').getByText('Extracted 2, failed 0').waitFor({ timeout: WAIT });
    await counts('0 new maps available');
    expect(existsSync(join(SCRATCH, 'levels', 'fakegame', 'm2.glb')), 'no m2.glb');
  });

  await step('a map added to the install: picked on its own and extracted', async () => {
    writeFileSync(join(SCRATCH, 'levels', '.fake-install.txt'), 'm1\nm2\nm3\n');
    await section.getByRole('button', { name: 'Look for updates' }).click();
    await counts('1 new map available');
    await row(section, 'heat3d-alpha').getByRole('button', { name: 'Choose maps…' }).click();
    await row(section, 'heat3d-alpha').locator('[data-map="m3"] input').check();
    await row(section, 'heat3d-alpha').getByRole('button', { name: 'Extract 1 map' }).click();
    await counts('0 new maps available');
    expect(existsSync(join(SCRATCH, 'levels', 'fakegame', 'm3.glb')), 'no m3.glb');
  });

  const dialog = page.locator('[role="dialog"].extractors-ask');

  await step('a new release is asked about first: version and notes, Later, Skip, Update now', async () => {
    await fetch(`${MANAGER}/__fake/publish`, { method: 'POST' });
    await section.getByRole('button', { name: 'Look for updates' }).click();
    await status(section, 'heat3d-alpha', 'update');
    await section.getByRole('button', { name: 'Update all' }).click();
    await dialog.getByText('Release notes of v1.1.0.').waitFor({ timeout: WAIT });
    await dialog.getByText('1.0.0 → 1.1.0').waitFor({ timeout: WAIT });
    await dialog.getByRole('button', { name: 'Later' }).click();
    await page.waitForTimeout(1500);
    await status(section, 'heat3d-alpha', 'update');
    // Skip this version: no longer offered by Update all, kept in the manager's settings.
    await row(section, 'heat3d-alpha').getByRole('button', { name: 'Update', exact: true }).click();
    await dialog.getByRole('button', { name: 'Skip this version' }).click();
    await row(section, 'heat3d-alpha').getByText('this version skipped').waitFor({ timeout: WAIT });
    expect(await section.getByRole('button', { name: 'Update all' }).isDisabled(), 'Update all still offers a skipped version');
    const kept = JSON.parse(readFileSync(join(SCRATCH, 'data', 'extractors', 'manager.json'), 'utf8'));
    expect(kept.skip['heat3d-alpha'] === '1.1.0', JSON.stringify(kept));
    await row(section, 'heat3d-alpha').getByRole('button', { name: 'Offer again' }).click();
    await section.getByRole('button', { name: 'Update all' }).click();
    await dialog.getByRole('button', { name: 'Update now' }).click();
    await row(section, 'heat3d-alpha').getByText('Installed 1.1.0').waitFor({ timeout: WAIT });
    await status(section, 'heat3d-alpha', 'installed');
    // An old version still in use (its status run) is deleted on the next look.
    const old = join(SCRATCH, 'data', 'extractors', 'heat3d-alpha', '1.0.0');
    for (let i = 0; i < 60 && existsSync(old); i++) {
      await fetch(`${MANAGER}/__heat3d/extractors`);
      await page.waitForTimeout(500);
    }
    expect(!existsSync(old), 'the old version is still there');
  });

  await step('Update automatically: off by default; on, a refresh installs the update', async () => {
    const box = section.getByLabel('Update automatically');
    expect(!(await box.isChecked()), 'on by default');
    await box.check();
    await page.waitForTimeout(500);
    expect(JSON.parse(readFileSync(join(SCRATCH, 'data', 'extractors', 'manager.json'), 'utf8')).autoUpdate === true, 'not kept');
    await fetch(`${MANAGER}/__fake/publish?version=1.2.0`, { method: 'POST' });
    await section.getByRole('button', { name: 'Look for updates' }).click();
    await row(section, 'heat3d-alpha').getByText('Installed 1.2.0').waitFor({ timeout: WAIT });
    await box.uncheck();
  });

  await step('Remove: its folder is gone', async () => {
    await row(section, 'heat3d-alpha').getByRole('button', { name: 'Remove' }).click();
    await status(section, 'heat3d-alpha', 'missing');
    expect(!existsSync(join(SCRATCH, 'data', 'extractors', 'heat3d-alpha')), 'folder left');
  });

  await step('without a manager: "Get the extractors", one releases link each', async () => {
    const plain = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    const s = await openPanel(plain);
    await s.getByText('Get the extractors').waitFor({ timeout: WAIT });
    const links = await s.locator('a[href^="https://github.com/Holdi601/"][href$="/releases/latest"]').count();
    expect(links === 21, `${links} links`);
    await plain.close();
  });
} finally {
  await browser.close();
  vite.kill();
  fake.kill();
}
console.log(failed ? `${failed} failed` : 'all ok');
process.exit(failed ? 1 : 0);
