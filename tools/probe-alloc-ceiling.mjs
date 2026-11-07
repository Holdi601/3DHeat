/**
 * How much typed-array memory can one tab actually hold?
 *
 * The budgeting assumes the answer is "as much as the machine has free", which is
 * why it offers 20GB on a 64GB machine. But a load estimated at 3.1GB killed a
 * tab with `Out of Memory` on a machine with 24GB free, twice, and no amount of
 * fixing the estimate explains that: 3.1GB is not 24GB.
 *
 * The suspicion is that the ceiling has nothing to do with system memory. Chrome
 * allocates `ArrayBuffer` backing stores inside V8's sandbox, and that sandbox is
 * a fixed virtual reservation per renderer — so the wall would be a property of
 * the browser, identical on a 16GB laptop and a 256GB workstation, and a budget
 * derived from free RAM would be meaningless above it.
 *
 * That is a claim about the browser, so it gets measured rather than argued.
 * Allocate until it fails, in the page and again inside a worker, and report
 * where it stopped. Blocks are touched after allocation because a reservation
 * that is never written may not be committed, and an untouched ceiling would be
 * the wrong number.
 *
 *   node tools/probe-alloc-ceiling.mjs [url]
 */
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:5273/?backend=webgl2';
/** Block size. Large enough to reach a ceiling quickly, small enough to bracket it. */
const BLOCK_MB = 128;
/** Stop here regardless, so a browser with no ceiling does not run forever. */
const MAX_GB = 40;

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
let crashed = false;
page.on('crash', () => {
  crashed = true;
});
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40_000 });

const allocIn = async (where) => {
  const script = ({ blockMb, maxGb }) => {
    const held = [];
    let mb = 0;
    let error = '';
    try {
      while (mb < maxGb * 1024) {
        const b = new Uint8Array(blockMb * 1024 * 1024);
        // Touch every page, or the allocation may be a reservation the OS never
        // commits and the ceiling comes out far too high.
        for (let i = 0; i < b.length; i += 4096) b[i] = 1;
        held.push(b);
        mb += blockMb;
      }
    } catch (e) {
      error = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    }
    // Released before returning, so the page survives to report.
    held.length = 0;
    return { mb, error };
  };

  if (where === 'page') {
    return page.evaluate(script, { blockMb: BLOCK_MB, maxGb: MAX_GB });
  }
  // In a worker, because that is where the ingest actually runs: if the ceiling
  // is per-renderer then the worker shares it, and if it is per-isolate the
  // worker has its own and the two numbers differ.
  return page.evaluate(
    ({ blockMb, maxGb, src }) =>
      new Promise((resolve) => {
        const blob = new Blob(
          [
            `self.onmessage = (e) => { const fn = ${src};` +
              ` self.postMessage(fn(e.data)); };`,
          ],
          { type: 'text/javascript' },
        );
        const w = new Worker(URL.createObjectURL(blob));
        w.onmessage = (e) => {
          w.terminate();
          resolve(e.data);
        };
        w.onerror = (e) => {
          w.terminate();
          resolve({ mb: -1, error: `worker died: ${e.message ?? 'no message'}` });
        };
        w.postMessage({ blockMb, maxGb });
      }),
    { blockMb: BLOCK_MB, maxGb: MAX_GB, src: script.toString() },
  );
};

for (const where of ['page', 'worker']) {
  if (crashed) {
    console.log(`${where}: skipped, the tab is already gone`);
    continue;
  }
  let r;
  try {
    r = await allocIn(where);
  } catch (e) {
    console.log(`${where}: the attempt itself failed — ${e.message}`);
    continue;
  }
  if (r.mb < 0) {
    console.log(`${where}: ${r.error}`);
    continue;
  }
  const reached = (r.mb / 1024).toFixed(2);
  if (r.error) {
    console.log(`${where}: stopped at ${reached} GB — ${r.error}`);
  } else {
    console.log(`${where}: reached ${reached} GB without failing (the cap this probe sets)`);
  }
}

if (crashed) {
  console.log('\nthe tab crashed during the attempt, which is itself the answer:');
  console.log('the ceiling is enforced by killing the renderer, not by throwing.');
}
await browser.close();
