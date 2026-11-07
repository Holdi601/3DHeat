/**
 * Import a model through the Level panel's own button and file dialog, in a
 * chosen browser, and report what the panel says.
 *
 * Exists because a browser can fail where the tests pass: Thorium, a Chromium
 * fork, stops growing a plain array at 64M elements where Chrome allows 128M,
 * and a 23.6M-vertex course export failed only there, with "Invalid array
 * length", until the parser moved to typed arrays. `EXE` points the probe at
 * any Chromium build.
 *
 *   node tools/probe-import.mjs <model file>
 *   EXE="C:/Users/<you>/AppData/Local/Thorium/Application/thorium.exe" GPU=1 node tools/probe-import.mjs <model>
 *   CHANNEL=msedge GPU=1 ROWS=40 node tools/probe-import.mjs <model>   # Edge, after a 40M-row heat dataset
 *
 * EXE / CHANNEL pick the browser, GPU=1 uses the real graphics card, ROWS=n
 * generates an n-million-row dataset first, RACE=1 imports from the race tab.
 */
import { chromium } from 'playwright';

const file = process.argv[2];
if (!file) {
  console.error('usage: node tools/probe-import.mjs <model file>');
  process.exit(2);
}
const browser = await chromium.launch({
  channel: process.env.CHANNEL || undefined,
  executablePath: process.env.EXE || undefined,
  headless: !process.env.HEADED,
  args: process.env.GPU ? ['--enable-gpu', '--use-angle=d3d11', '--enable-unsafe-webgpu'] : [],
});
const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
page.on('console', (m) => {
  if (m.type() === 'error') console.log('[console]', m.text().slice(0, 400));
});
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('crash', () => console.log('[crash]'));
await page.goto(process.env.URL ?? 'http://127.0.0.1:5273/', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !!window.__3dheat_engine, null, { timeout: 60000 });
console.log(
  'browser',
  await page.evaluate(() => navigator.userAgent.match(/Chrome\/[\d.]+/)?.[0]),
  'backend',
  await page.evaluate(() => window.__3dheat_engine.live.backend),
);
if (process.env.ROWS) {
  // A heat dataset first, as a working session would have.
  await page.getByText('Dataset', { exact: true }).click().catch(() => {});
  await page.evaluate((m) => {
    const label = [...document.querySelectorAll('.field .label span')].find((s) => s.textContent === 'Rows (millions)');
    const input = label?.closest('.field')?.querySelector('input');
    if (input) {
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      set.call(input, String(m));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, Number(process.env.ROWS));
  await page.getByRole('button', { name: 'Generate' }).click();
  await page.waitForFunction(() => (window.__3dheat_engine?.live.residentRows ?? 0) > 0, null, { timeout: 300000 });
  console.log('dataset rows', await page.evaluate(() => window.__3dheat_engine.live.residentRows));
}
if (process.env.RACE) await page.getByRole('tab', { name: 'Race analysis' }).click();
await page.getByText('Background / level').click();
const chooser = page.waitForEvent('filechooser');
await page.getByRole('button', { name: '3D model…' }).click();
await (await chooser).setFiles(file);
const t0 = Date.now();
let result = null;
for (let i = 0; i < 600 && !result; i++) {
  await page.waitForTimeout(1000);
  result = await page.evaluate(() => {
    const err = document.querySelector('.err')?.textContent ?? null;
    const note = [...document.querySelectorAll('.hint')].map((n) => n.textContent).find((t) => t?.includes('triangles'));
    return err || note ? { err, note: note ?? null } : null;
  });
}
console.log(`after ${((Date.now() - t0) / 1000).toFixed(0)}s:`, JSON.stringify(result ?? 'no answer'));
await page.waitForTimeout(3000);
console.log('frames', await page.evaluate(() => window.__3dheat_engine.live.frames));
await browser.close();
process.exit(result && !result.err ? 0 : 1);
