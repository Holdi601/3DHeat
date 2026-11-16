/**
 * Does the Compare groups panel cost the 3D view frames?
 *
 * Loads a synthetic dataset, then measures the page's frame times (rAF
 * deltas) in three phases of a few seconds each: the view alone, the panel
 * recounting over and over (its groups change every half second), and its
 * charts animating (the chart type changes every 600 ms). Prints p50, p99
 * and max per phase, and the panel's own count time.
 *
 *   node tools/probe-versus.mjs [url] [rows]
 */
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:5273/?backend=webgl2';
const rows = Number(process.argv[3] ?? 4_000_000);

const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-webgl'] });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on('pageerror', (e) => console.log('pageerror', e.message));
await page.goto(url);
await page.waitForFunction(() => !!window.__3dheat, null, { timeout: 60_000 });
await page.evaluate((n) => window.__3dheat.load(n), rows);
await page.waitForTimeout(3000);

const measure = (ms) =>
  page.evaluate(
    (ms) =>
      new Promise((resolve) => {
        const d = [];
        let last = performance.now();
        const end = last + ms;
        const tick = (now) => {
          d.push(now - last);
          last = now;
          if (now < end) requestAnimationFrame(tick);
          else resolve(d);
        };
        requestAnimationFrame(tick);
      }),
    ms,
  );
const stats = (name, d) => {
  const s = [...d].sort((a, b) => a - b);
  const q = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  console.log(`${name.padEnd(12)} frames ${String(s.length).padStart(4)}  p50 ${q(0.5).toFixed(1)} ms  p99 ${q(0.99).toFixed(1)} ms  max ${s[s.length - 1].toFixed(1)} ms`);
};

stats('view alone', await measure(4000));

// The module the dev server serves is the one the page runs: open the panel through its store.
await page.evaluate(() => import('/src/ui/versus/VersusPanel.tsx').then((m) => m.useVersus.getState().set({ open: true })));
await page.waitForSelector('.vs-window');
await page.waitForFunction(() => /counted in/.test(document.querySelector('.vs-window .cmp-status')?.textContent ?? ''), null, { timeout: 120_000 });
console.log('first count:', await page.textContent('.vs-window .cmp-status'));

// Recounting: change a group's filter every half second.
const filters = ['', 'x > 0', 'y > 10', 'x < 0 and z > 0'];
const cdp = process.env.PROFILE ? await page.context().newCDPSession(page) : null;
if (cdp) {
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
  await cdp.send('Profiler.start');
}
await page.evaluate(() => {
  window.__long = [];
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push(Math.round(e.duration)))).observe({ type: 'longtask', buffered: false });
});
const recount = measure(4000);
for (let i = 0; i < 8; i++) {
  await page.locator('.vs-expr').first().fill(filters[i % filters.length]);
  await page.waitForTimeout(500);
}
stats('recounting', await recount);
console.log('long tasks:', JSON.stringify(await page.evaluate(() => window.__long)));
if (cdp) {
  const { profile } = await cdp.send('Profiler.stop');
  const self = new Map();
  const dt = profile.timeDeltas;
  const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  profile.samples.forEach((id, i) => {
    const n = byId.get(id);
    const k = `${n.callFrame.functionName || '(anon)'} ${n.callFrame.url.split('/').pop()}:${n.callFrame.lineNumber}`;
    self.set(k, (self.get(k) ?? 0) + (dt[i] ?? 0) / 1000);
  });
  console.log([...self].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, v]) => `${v.toFixed(0).padStart(6)} ms  ${k}`).join(String.fromCharCode(10)));
}
await page.waitForFunction(() => /counted in/.test(document.querySelector('.vs-window .cmp-status')?.textContent ?? ''), null, { timeout: 120_000 });
console.log('settled:', await page.textContent('.vs-window .cmp-status'));

// Animating: switch chart types.
const kinds = ['bar', 'column', 'pie', 'donut', 'scatter', 'table', 'bar'];
const anim = measure(4500);
for (const k of kinds) {
  await page.selectOption('.vs-tools select[aria-label]', k);
  await page.waitForTimeout(600);
}
stats('animating', await anim);
await browser.close();
