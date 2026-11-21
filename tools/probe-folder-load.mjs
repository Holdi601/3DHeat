/**
 * Load a folder of many matches the way a person does, and watch that the page
 * never stops answering while it loads.
 *
 * The report: a folder of 45 War Thunder matches froze the tab for good at
 * `[14/45]`. This drives the app's own file picker (files through
 * `filechooser`, never fetched into the page), clicks Load, and meanwhile
 * samples the frame loop and how long the main thread takes to answer a probe.
 * It fails if the page stops answering for longer than `--stall` ms, if the
 * load does not finish, or if p99 of the frames during the load is above
 * `--p99` ms.
 *
 *   node tools/probe-folder-load.mjs <folder> [--url URL] [--edge] [--synthetic N]
 *
 * `--synthetic N` writes N synthetic matches of the same shape (one `.3dheat`
 * container per match, a Parquet table of ~300k rows with a wide schema) to a
 * temporary folder and loads that: the regression check, with no real data.
 */
import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const url = opt('--url', 'http://127.0.0.1:5273/');
const STALL_MS = Number(opt('--stall', 2000));
const P99_MS = Number(opt('--p99', 100));
const CEILING_MS = Number(opt('--ceiling', 6 * 60 * 1000));
const synthetic = Number(opt('--synthetic', 0));
const shots = opt('--shots', '');

let folder = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
let cleanup = null;
if (synthetic > 0) {
  folder = join(tmpdir(), `3dheat-probe-folder-${process.pid}`);
  mkdirSync(folder, { recursive: true });
  const { writeSyntheticMatches } = await import('./synthetic-matches.mjs');
  await writeSyntheticMatches(folder, synthetic, Number(opt('--rows', 300_000)));
  cleanup = () => rmSync(folder, { recursive: true, force: true });
}
if (!folder) {
  console.log('usage: node tools/probe-folder-load.mjs <folder> | --synthetic N');
  process.exit(2);
}
const files = readdirSync(folder)
  .filter((n) => /\.(3dheat|parquet)$/i.test(n))
  .map((n) => join(folder, n))
  .sort();
const mb = files.reduce((a, p) => a + statSync(p).size, 0) / 1024 ** 2;
console.log(`${files.length} files, ${mb.toFixed(0)} MB`);

const browser = await chromium.launch(
  args.includes('--edge')
    ? { channel: 'msedge', headless: true, args: ['--headless=new', '--enable-unsafe-webgpu', ...(args.includes('--log') ? ['--enable-logging=stderr', '--v=0'] : [])] }
    : { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
);
const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
let crashed = false;
page.on('crash', () => {
  crashed = true;
  console.log('  !! page crashed');
});
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 60_000 });

// Frame times, collected in the page from requestAnimationFrame.
await page.evaluate(() => {
  const g = globalThis;
  g.__probeFrames = [];
  let last = performance.now();
  const tick = (t) => {
    g.__probeFrames.push(t - last);
    last = t;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  // Long tasks with the load step showing when each began, to tell which step holds the thread.
  g.__probeLong = [];
  g.__probeSteps = [];
  globalThis.__3dheat.useStore.subscribe((st, prev) => {
    if (st.load.label !== prev.load.label) g.__probeSteps.push([performance.now(), st.load.label]);
  });
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) g.__probeLong.push([e.startTime, e.duration]);
    }).observe({ type: 'longtask', buffered: false });
  } catch {
    /* no long-task timing here */
  }
});

let cdp = null;
/** Where the stuck main thread is: a pause through the DevTools protocol, and the renderer's memory. */
async function diagnose() {
  try {
    if (!cdp) {
      cdp = await page.context().newCDPSession(page);
      await cdp.send('Debugger.enable');
    }
    const paused = new Promise((r) => cdp.once('Debugger.paused', r));
    await cdp.send('Debugger.pause');
    const ev = await Promise.race([paused, new Promise((r) => setTimeout(() => r(null), 5000))]);
    if (!ev) console.log('    (no pause within 5 s: the thread is not running script)');
    else {
      for (const f of ev.callFrames.slice(0, 14)) console.log(`    at ${f.functionName || '(anon)'} ${f.url.split('/').pop()}:${f.location.lineNumber + 1}`);
      await cdp.send('Debugger.resume');
    }
  } catch (e) {
    console.log('    diag failed', e.message);
  }
}
page.on('filechooser', (fc) => void fc.setFiles(files).catch((e) => console.log('setFiles', e.message)));
await page.getByRole('button', { name: /^Open files/ }).first().click();

// The load card in the centre, or the side panel's button.
const loadBtn = page.locator("[data-testid=load-card-go], .sidebar button.primary:text-matches(\"^Load\")").first();
await loadBtn.waitFor({ timeout: 240_000 });
if (shots) await page.screenshot({ path: join(shots, 'picked.png') });
await page.evaluate(() => (globalThis.__probeFrames.length = 0));
let profiling = null;
if (args.includes('--profile')) {
  // The main thread's profile over the load, its heaviest functions printed at the end.
  profiling = await page.context().newCDPSession(page);
  await profiling.send('Profiler.enable');
  await profiling.send('Profiler.setSamplingInterval', { interval: 500 });
  await profiling.send('Profiler.start');
}
await loadBtn.click();
const started = Date.now();

let last = '';
let worstStall = 0;
let done = false;
let shotAt = 0;
while (!crashed && Date.now() - started < CEILING_MS) {
  await new Promise((r) => setTimeout(r, 500));
  const asked = Date.now();
  let s;
  try {
    s = await Promise.race([
      page.evaluate(() => {
        const st = globalThis.__3dheat.useStore.getState();
        return { active: st.load.active, label: st.load.label, error: st.load.error, rows: st.dataset?.count ?? 0 };
      }),
      new Promise((r) => setTimeout(() => r(null), STALL_MS * 4)),
    ]);
  } catch {
    break;
  }
  const answered = Date.now() - asked;
  worstStall = Math.max(worstStall, answered);
  if (!s) {
    console.log(`  ${((Date.now() - started) / 1000).toFixed(0)}s  page did not answer within ${STALL_MS * 4} ms`);
    if (args.includes('--diag')) await diagnose();
    continue;
  }
  const line = `${s.active ? s.label : s.rows ? 'loaded' : 'idle'}${s.rows ? ` · ${s.rows.toLocaleString()} rows` : ''}`;
  if (line !== last) {
    console.log(`  ${((Date.now() - started) / 1000).toFixed(1).padStart(5)}s  ${line}  (answered in ${answered} ms)`);
    last = line;
  }
  if (shots && s.active && Date.now() - shotAt > 4000) {
    shotAt = Date.now();
    await page.screenshot({ path: join(shots, 'loading.png') }).catch(() => {});
  }
  if (s.error) {
    console.log(`  error: ${s.error}`);
    break;
  }
  if (!s.active && s.rows > 0) {
    done = true;
    break;
  }
}
const loadSeconds = (Date.now() - started) / 1000;
// A second of settled frames after the load, then the frame statistics.
await new Promise((r) => setTimeout(r, 1500));
const frames = crashed
  ? []
  : await Promise.race([page.evaluate(() => globalThis.__probeFrames.slice()), new Promise((r) => setTimeout(() => r([]), 10_000))]);
frames.sort((a, b) => a - b);
const q = (p) => (frames.length ? frames[Math.min(frames.length - 1, Math.floor(frames.length * p))] : NaN);
const p99 = q(0.99);
console.log(
  `\n${done ? 'loaded' : 'NOT loaded'} in ${loadSeconds.toFixed(1)} s · frames ${frames.length} · ` +
    `p50 ${q(0.5).toFixed(1)} ms · p99 ${p99.toFixed(1)} ms · max ${q(1 - 1e-9).toFixed(1)} ms · ` +
    `slowest answer ${worstStall} ms`,
);
if (profiling && !crashed) {
  const { profile } = await profiling.send('Profiler.stop');
  const self = new Map();
  const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  const dt = profile.timeDeltas;
  for (let i = 0; i < profile.samples.length; i++) {
    const n = byId.get(profile.samples[i]);
    const f = n.callFrame;
    if (f.functionName === '(idle)' || f.functionName === '(program)') continue;
    const k = `${f.functionName || '(anon)'} ${f.url.split('/').pop()}:${f.lineNumber + 1}`;
    self.set(k, (self.get(k) ?? 0) + (dt[i] ?? 0) / 1000);
  }
  for (const [k, ms] of [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(`  self ${ms.toFixed(0).padStart(6)} ms  ${k}`);
  // Who calls the heaviest: the first frame of the app's own code above each sample.
  const parent = new Map();
  for (const n of profile.nodes) for (const c of n.children ?? []) parent.set(c, n.id);
  const owner = new Map();
  for (let i = 0; i < profile.samples.length; i++) {
    let id = profile.samples[i];
    const f0 = byId.get(id).callFrame;
    if (f0.functionName === '(idle)' || f0.functionName === '(program)' || f0.functionName === '(garbage collector)') continue;
    while (id !== undefined && /node_modules|react|^$/.test(byId.get(id).callFrame.url)) id = parent.get(id);
    if (id === undefined) continue;
    const f = byId.get(id).callFrame;
    const k = `${f.functionName || '(anon)'} ${f.url.split('/').pop()}:${f.lineNumber + 1}`;
    owner.set(k, (owner.get(k) ?? 0) + (dt[i] ?? 0) / 1000);
  }
  for (const [k, ms] of [...owner.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)) console.log(`  app ${ms.toFixed(0).padStart(6)} ms  ${k}`);
}
if (!crashed && args.includes('--long')) {
  const long = await Promise.race([
    page.evaluate(() => {
      const steps = globalThis.__probeSteps;
      const stepAt = (t) => {
        let l = '';
        for (const [at, label] of steps) if (at <= t) l = label;
        return l;
      };
      return globalThis.__probeLong.filter(([, d]) => d >= 100).map(([t, d]) => `${d.toFixed(0)} ms during "${stepAt(t).slice(0, 60)}"`);
    }),
    new Promise((r) => setTimeout(() => r([]), 10_000)),
  ]);
  for (const l of long) console.log('  long task', l);
}
if (shots && !crashed) await page.screenshot({ path: join(shots, 'loaded.png') }).catch(() => {});
await Promise.race([browser.close(), new Promise((r) => setTimeout(r, 10_000))]);
cleanup?.();
const ok = done && !crashed && worstStall <= STALL_MS && p99 <= P99_MS;
console.log(ok ? 'PASS' : 'FAIL');
process.exit(ok ? 0 : 1);
