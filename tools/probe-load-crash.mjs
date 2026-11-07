/**
 * Reproduce the crash, and find out which phase it is really in.
 *
 * The report is "it crashed at computing lifetimes", twice. That is where the
 * progress line stopped, but the line is not evidence of where the work was:
 * computing lifetimes is the *last* thing the ingest worker announces, and what
 * happens next — `renderer.setDataset`, which packs every row into GPU buffers,
 * synchronously, on the main thread — announces nothing at all. A crash anywhere
 * in that stretch reads as a crash in the last phase that had a name.
 *
 * So this drives the app the way a person does, through its own file picker, and
 * reports which side of the hand-off it dies on: whether a dataset ever reached
 * the store, and whether the renderer ever finished making it resident.
 *
 * Files come through `filechooser` rather than `fetch`, because fetching them
 * first puts a second copy of every byte in the page and would invent the very
 * memory pressure under investigation.
 *
 *   node tools/probe-load-crash.mjs [region] [url]
 */
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const REPO = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const target = process.argv[2] ?? 'us';
const url = process.argv[3] ?? 'http://127.0.0.1:5273/?backend=webgl2';
const CEILING_MS = 12 * 60 * 1000;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.parquet$/i.test(name)) out.push(p);
  }
  return out;
}

const files = walk(join(REPO, 'TestData', ...target.split('/'))).sort();
const mb = files.reduce((a, p) => a + statSync(p).size, 0) / 1024 ** 2;
console.log(`TestData/${target}: ${files.length} files, ${mb.toFixed(0)} MB on disk\n`);

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
let crashed = false;
page.on('crash', () => {
  crashed = true;
  console.log('  !! renderer gone — this is the Out of Memory tab crash');
});
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40_000 });

page.on('filechooser', (fc) => void fc.setFiles(files).catch(() => {}));
await page.locator('.sidebar button', { hasText: /^Files/ }).first().click();

const estimate = page.locator('.field', { hasText: 'Memory estimate' }).first();
await estimate.waitFor({ timeout: 240_000 });
console.log(`panel: ${(await estimate.innerText()).replace(/\s+/g, ' ')}\n`);

const loadBtn = page.locator('.sidebar button', { hasText: /^Load |^Too large/ }).first();
if (/Too large/.test((await loadBtn.innerText()) ?? '')) {
  console.log('refused before loading — the estimate said no, which is the fix working');
  await browser.close();
  process.exit(0);
}
await loadBtn.click();

const started = Date.now();
let last = '';
let sawDataset = false;
while (!crashed && Date.now() - started < CEILING_MS) {
  await new Promise((r) => setTimeout(r, 1000));
  let s;
  try {
    s = await page.evaluate(() => {
      const st = globalThis.__3dheat.useStore.getState();
      const live = globalThis.__3dheat_engineLive ?? {};
      return {
        active: st.load.active,
        label: st.load.label,
        error: st.load.error,
        rows: st.dataset?.count ?? 0,
        resident: live.residentRows ?? 0,
        dropped: live.droppedRows ?? 0,
        gpuBytes: live.gpuBytes ?? 0,
      };
    });
  } catch {
    break; // the page is gone; the crash handler reported it
  }
  const line =
    `${s.label || (s.rows ? 'dataset in the store' : 'idle')}` +
    (s.rows ? ` · ${s.rows.toLocaleString()} rows` : '') +
    (s.resident ? ` · ${s.resident.toLocaleString()} resident` : '');
  if (line !== last) {
    const t = ((Date.now() - started) / 1000).toFixed(0).padStart(4);
    console.log(`  ${t}s  ${line}`);
    last = line;
  }
  if (s.error) {
    console.log(`  error: ${s.error}`);
    break;
  }
  if (s.rows > 0) sawDataset = true;
  // Done when the dataset is in the store *and* the renderer has made it
  // resident: the second half is the part with no progress reporting, and the
  // part this probe exists to attribute.
  if (!s.active && sawDataset && s.resident > 0) {
    console.log(
      `\nloaded and resident: ${s.rows.toLocaleString()} rows, ` +
        `${s.resident.toLocaleString()} on the GPU, ${s.dropped.toLocaleString()} dropped, ` +
        `${(s.gpuBytes / 1024 ** 3).toFixed(2)} GB of GPU memory`,
    );
    await browser.close();
    process.exit(0);
  }
}

if (crashed) {
  console.log(
    `\ncrashed after ${((Date.now() - started) / 1000).toFixed(0)}s.\n` +
      `last phase reported: "${last}"\n` +
      (sawDataset
        ? 'a dataset HAD reached the store, so the ingest finished and the crash is\n' +
          'in the GPU upload — which reports nothing, hence the misattribution.'
        : 'no dataset ever reached the store, so the crash is inside the ingest itself.'),
  );
  process.exit(1);
}
console.log('\nno crash and no completion within the time limit');
await browser.close();
process.exit(1);
