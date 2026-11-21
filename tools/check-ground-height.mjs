/**
 * Do the ground units of a recording stand on its level? Loads recordings
 * through the app the way a user does (Open files, Load), loads the level by
 * its name from the levels folder, and prints each match's median height of
 * its ground units above the level's ground and the spread, as the app's own
 * ground check measures it (`src/data/groundFit.ts`), with the matches the app
 * corrected. Right is a median of 0-2 m: a tank's origin on its tracks.
 * The recordings and the level stay on this machine; nothing is written.
 *
 *   node tools/check-ground-height.mjs --level=<level name> [--url=http://127.0.0.1:5273/] <file.3dheat|parquet>...
 *
 * Exits 1 when a match is off by more than 2 m after the app's correction.
 */

import { chromium } from 'playwright';

const argv = process.argv.slice(2);
const opt = (n) => argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? null;
const files = argv.filter((a) => !a.startsWith('--'));
const base = opt('url') ?? 'http://127.0.0.1:5273/';
const level = opt('level');
if (!files.length || !level) {
  console.log('give --level=<level name> and one or more recordings');
  process.exit(2);
}

const browser = await chromium.launch({ channel: 'msedge', headless: false, args: ['--enable-unsafe-webgpu'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
page.on('pageerror', (e) => console.log('pageerror:', e.message));
await page.routeWebSocket(/./, () => {});
// The file input the app falls back to where the browser has no file picker.
await page.addInitScript(() => {
  delete window.showOpenFilePicker;
  window.showOpenFilePicker = undefined;
});
await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 180_000 });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine && globalThis.__3dheat), null, { timeout: 180_000 });
const chooser = page.waitForEvent('filechooser');
await page.getByRole('button', { name: /^Open files/ }).first().click();
await (await chooser).setFiles(files);
// The load plan's column proposal first, as a user waits for it.
await page.waitForTimeout(10_000);
await page.getByRole('button', { name: /^Load (file|\d+ files)/ }).first().click({ timeout: 60_000 });
await page.waitForFunction(() => (globalThis.__3dheat.useStore.getState().dataset?.count ?? 0) > 0, null, { timeout: 600_000 });

// The level, from the levels folder, unless the app loaded one by itself.
await page.locator('button', { hasText: /^\s*Match\s*$/ }).first().click();
await page.waitForTimeout(1500);
if (!(await page.evaluate(() => !!globalThis.__3dheat.useStore.getState().level))) {
  const section = page.getByText(/Background \/ level/).first();
  const chip = page.locator('button.chip', { hasText: new RegExp(`^\\s*${level.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s*◆)?\\s*$`) }).first();
  if (!(await chip.isVisible().catch(() => false))) {
    await section.click();
    await page.waitForTimeout(2000);
    for (const s of await page.locator('summary').all()) if (!(await chip.isVisible().catch(() => false))) await s.click().catch(() => {});
  }
  await chip.click({ timeout: 60_000 });
}
await page.waitForFunction(() => globalThis.__3dheat.useStore.getState().level?.kind === 'model', null, { timeout: 600_000 });

const out = await page.evaluate(async () => {
  const h = globalThis.__3dheat;
  const gf = await h.modules['data/groundFitRun']();
  const settled = () => {
    const s = gf.useGroundFit.getState();
    return s.dataset === h.useStore.getState().dataset && s.level === h.useStore.getState().level && s.checks.length > 0;
  };
  // The first check, a correction if one was made, then the corrected data's own check.
  for (let i = 0; i < 1200 && !settled(); i++) await new Promise((r) => setTimeout(r, 500));
  await new Promise((r) => setTimeout(r, 5000));
  for (let i = 0; i < 1200 && !settled(); i++) await new Promise((r) => setTimeout(r, 500));
  const s = gf.useGroundFit.getState();
  return { checks: s.checks, fixes: s.fixes };
});
let bad = 0;
for (const c of out.checks) {
  const ok = c.samples === 0 || (c.median >= -0.5 && c.median <= 2);
  if (!ok) bad++;
  console.log(`${ok ? 'ok ' : 'OFF'} ${c.label || '(one match)'}: median ${c.median.toFixed(2)} m, spread ${c.spread.toFixed(2)} m, ${c.samples} samples`);
}
for (const f of out.fixes) console.log(`corrected ${f.label || '(one match)'} by ${f.metres >= 0 ? '+' : ''}${f.metres.toFixed(2)} m`);
await browser.close();
process.exit(bad ? 1 : 0);
