/**
 * The outcome analysis (docs/outcome-analysis.md) in a real browser against
 * the dev server: a mass index of made-up matches with two planted winning
 * patterns (side 0's left route, side 1 holding a far corner in the second
 * window: `src/outcome/synth.ts`) is opened in the Mass analysis, the Outcome
 * tab runs, both patterns must be found, the zones are drawn, the time slider
 * moves, a pattern is shown; screenshots in the dark and light theme go to
 * tools/.smoke/. Fails on a console error or a step that is not as it should
 * be. While the analysis runs, the page's frame intervals are measured (p50,
 * p99, max): the work is in the worker, the frames must not notice.
 *
 * OUTCOME_SET=<folder with 3dheat-index.jsonl.gz and 3dheat-index.grids.jsonl.gz>
 * runs it on that index instead (no planted patterns checked: a local real
 * set, never committed). ANALYSIS_GPU=1 uses the real GPU, so the frame
 * numbers mean something.
 *
 *   node tools/smoke-outcome.mjs [url]
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = process.argv.find((a) => a.startsWith('http')) ?? 'http://127.0.0.1:5273/';
const GPU = process.env.ANALYSIS_GPU === '1';
const REAL = process.env.OUTCOME_SET ?? null;
const OUT = path.join(ROOT, 'tools/.smoke');
mkdirSync(OUT, { recursive: true });

/** A made-up index: a head and a grid (with its moves) a match. */
async function synthIndex() {
  const { runnerImport } = await import('vite');
  const { module: S } = await runnerImport(path.join(ROOT, 'src/outcome/synth.ts'), { root: ROOT, logLevel: 'silent', configFile: false });
  const matches = S.synthMatches(400, 7, { routeLeft: 0.4, holdCorner: 0.4 });
  const dir = path.join(OUT, 'outcome-set');
  mkdirSync(dir, { recursive: true });
  const heads = [];
  const grids = [];
  matches.forEach((m, i) => {
    const p = `m${i}.3dheat`;
    const w = m.mv.r[3];
    const head = {
      format: '3dheat-summary', version: 2, id: `m${i}`, game: 'demo', map: 'demo_square', mode: 'demo', mission: null,
      started: new Date(m.started).toISOString(), duration: 300, rows: 0, units: 10, players: 10, ai: 0,
      teams: m.teams.map((name, s) => ({ name, units: 5, players: 5, presence: 1500, kills: 0, deaths: 0, won: w === s ? 1 : 0, val: [] })),
      winner: m.teams[w], events: {}, vehicles: [], playerStats: [], weapons: [], economy: { columns: [] },
      phases: { bins: 20, kinds: {}, minute: 60, minutes: {} }, extent: [0, 0, 1024, 1024], kinds: [], classes: [], built: { by: 'smoke', at: '', ms: 0 },
    };
    const mv = { ...m.mv, r: Array.from(m.mv.r), l: Array.from(m.mv.l), d: Array.from(m.mv.d) };
    heads.push(JSON.stringify({ path: p, size: 1, mtime: 0, head }));
    grids.push(JSON.stringify({ path: p, size: 1, grid: { cell: 8, ix: [], iz: [], p: [], pt: [], pc: [], ph: [], y: [], y0: [], fx: [], fz: [], e: [], bands: { by: 'height', floor: 0, unitsPerMetre: 1 }, ts: { cell: 64, minute: 60, v: [] }, mv } }));
  });
  writeFileSync(path.join(dir, '3dheat-index.jsonl.gz'), gzipSync(heads.join('\n') + '\n'));
  writeFileSync(path.join(dir, '3dheat-index.grids.jsonl.gz'), gzipSync(grids.join('\n') + '\n'));
  return dir;
}

const dir = REAL ?? (await synthIndex());
const browser = await chromium.launch({
  args: GPU
    ? ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--disable-frame-rate-limit', '--js-flags=--max-old-space-size=16384']
    : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
let failed = 0;
async function step(name, fn) {
  try {
    const note = await fn();
    console.log(`ok   ${name}${note ? ` - ${note}` : ''}`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${name}: ${e instanceof Error ? e.message : e}`);
  }
}
const expect = (cond, what) => {
  if (!cond) throw new Error(what);
};

await page.goto(url, { timeout: 240_000 });
await page.waitForFunction(() => !!globalThis.__3dheat_engine && !!globalThis.__3dheat, null, { timeout: 240_000 });
await page.evaluate(async () => {
  globalThis.__mc = (await globalThis.__3dheat.modules['mass/client']()).useMass;
  globalThis.__oc = (await globalThis.__3dheat.modules['mass/outcomeClient']()).useOutcome;
});

await step('open the index in the mass analysis', async () => {
  // A folder input of the probe's own, its files handed to the panel's opener as the Folder button would.
  await page.evaluate(() => {
    const el = document.createElement('input');
    el.type = 'file';
    el.multiple = true;
    el.setAttribute('webkitdirectory', '');
    el.id = 'outcome-probe-folder';
    el.hidden = true;
    document.body.appendChild(el);
  });
  await page.locator('#outcome-probe-folder').setInputFiles(dir);
  await page.evaluate(async () => {
    const files = Array.from(document.getElementById('outcome-probe-folder').files).map((file) => ({ file, path: file.webkitRelativePath || file.name }));
    await (await globalThis.__3dheat.modules['mass/client']()).openMass(files);
  });
  await page.waitForFunction(() => !!globalThis.__mc.getState().facets, null, { timeout: 600_000 });
  const n = await page.evaluate(() => globalThis.__mc.getState().facets.matches);
  expect(n > 0, 'no matches');
  await page.evaluate(() => globalThis.__mc.getState().set({ open: true, tab: 'outcome' }));
  await page.waitForSelector('[data-testid=outcome-run]');
  return `${n} matches`;
});

/** Frame intervals for `ms` with nothing running: what the run's are judged against. */
async function idleFrames(ms) {
  return page.evaluate(async (ms) => {
    const e = globalThis.__3dheat_engine;
    const t = [];
    let last = performance.now();
    const end = last + ms;
    await new Promise((done) => {
      const tick = (now) => {
        t.push(now - last);
        last = now;
        e.invalidate?.(1);
        if (now < end) requestAnimationFrame(tick);
        else done();
      };
      requestAnimationFrame(tick);
    });
    t.splice(0, 2);
    t.sort((a, b) => a - b);
    return { p50: t[Math.floor(t.length * 0.5)], p99: t[Math.min(t.length - 1, Math.floor(t.length * 0.99))], max: t[t.length - 1], n: t.length };
  }, ms);
}

let report = null;
await step('frames with nothing running (baseline)', async () => {
  const f = await idleFrames(4000);
  writeFileSync(path.join(OUT, 'outcome-baseline.json'), JSON.stringify(f));
  return `p50 ${f.p50.toFixed(1)} p99 ${f.p99.toFixed(1)} max ${f.max.toFixed(1)} ms over ${f.n}`;
});

await step('run the outcome analysis, frames measured meanwhile', async () => {
  // Frame intervals while it runs: the camera turns, so every frame draws.
  await page.evaluate(() => {
    globalThis.__frames = [];
    globalThis.__measuring = true;
    let last = performance.now();
    const e = globalThis.__3dheat_engine;
    const tick = (now) => {
      globalThis.__frames.push(now - last);
      last = now;
      e.invalidate?.(1);
      if (globalThis.__measuring) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    // Long tasks on the page's thread, and when the result came in: where a slow frame comes from.
    globalThis.__long = [];
    globalThis.__t0 = performance.now();
    try {
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) globalThis.__long.push([Math.round(e.startTime - globalThis.__t0), Math.round(e.duration)]);
      }).observe({ type: 'longtask', buffered: false });
    } catch {}
    globalThis.__oc.subscribe((s, p) => {
      if (s.result && !p.result) globalThis.__resultAt = Math.round(performance.now() - globalThis.__t0);
      if (s.map && !p.map) globalThis.__mapAt = Math.round(performance.now() - globalThis.__t0);
    });
  });
  const t0 = Date.now();
  await page.click('[data-testid=outcome-run]');
  await page.waitForFunction(() => !globalThis.__oc.getState().running && !!globalThis.__oc.getState().result, null, { timeout: 3_600_000 });
  const wall = Date.now() - t0;
  const frames = await page.evaluate(() => {
    globalThis.__measuring = false;
    const t = globalThis.__frames.slice(2).sort((a, b) => a - b);
    const q = (p) => t[Math.min(t.length - 1, Math.floor(t.length * p))];
    return { p50: q(0.5), p99: q(0.99), max: t[t.length - 1], n: t.length, long: globalThis.__long.sort((x, y) => y[1] - x[1]).slice(0, 6), resultAt: globalThis.__resultAt, mapAt: globalThis.__mapAt };
  });
  console.log(`     long tasks [at ms, ms]: ${JSON.stringify(frames.long)}; result at ${frames.resultAt} ms, map at ${frames.mapAt} ms`);
  report = await page.evaluate(() => {
    const r = globalThis.__oc.getState().result;
    return { matches: r.matches, read: r.read, missing: r.missing, tests: r.report.tests, ms: r.report.ms, groups: r.report.groups.length, findings: r.report.findings.map((f) => ({ kind: f.kind, side: f.side, window: f.feature.window ?? null, diff: f.diff, group: f.group })) };
  });
  writeFileSync(path.join(OUT, 'outcome-timing.json'), JSON.stringify({ wall, frames, gpu: GPU, matches: report.matches, read: report.read, tests: report.tests, ms: report.ms }, null, 1));
  return `${report.read} matches read, ${report.tests} tests, ${report.findings.length} said; wall ${(wall / 1000).toFixed(1)} s (analysis ${(report.ms / 1000).toFixed(1)} s); frames p50 ${frames.p50.toFixed(1)} p99 ${frames.p99.toFixed(1)} max ${frames.max.toFixed(1)} ms over ${frames.n}${GPU ? '' : ' (software GL: not judged)'}`;
});

if (!REAL)
  await step('the planted patterns are found', async () => {
    expect(report, 'no report');
    expect(report.findings.some((f) => f.kind === 'route' && f.side === 0 && f.diff > 0.1), 'left route of side 0 not found');
    expect(report.findings.some((f) => f.kind === 'hold' && f.side === 1 && f.window === 1 && f.diff > 0.1), 'corner hold of side 1 not found');
  });

await step('zones drawn, time slider, a pattern shown', async () => {
  await page.waitForFunction(() => !!globalThis.__oc.getState().map, null, { timeout: 60_000 });
  const zones = await page.evaluate(() => globalThis.__oc.getState().map.zones.length);
  expect(zones > 0, 'no zones');
  await page.evaluate(() => globalThis.__oc.getState().set({ by: 'moment', slice: 3 }));
  await page.waitForFunction(() => globalThis.__oc.getState().map?.slice === 3, null, { timeout: 60_000 });
  await page.evaluate(() => globalThis.__oc.getState().set({ by: 'window', window: 1, side: 1 }));
  const first = page.locator('[data-testid=outcome-finding] button').first();
  if (await first.count()) await first.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, `outcome-dark${REAL ? '-real' : ''}.png`) });
  await page.evaluate(async () => (await globalThis.__3dheat.modules['ui/shell/shellStore']()).useShell.getState().setTheme('light'));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, `outcome-light${REAL ? '-real' : ''}.png`) });
  await page.evaluate(async () => (await globalThis.__3dheat.modules['ui/shell/shellStore']()).useShell.getState().setTheme('dark'));
  return `${zones} zones`;
});

await step('no console errors', async () => expect(!errors.length, errors.slice(0, 3).join(' | ')));
await browser.close();
console.log(failed ? `${failed} step(s) failed` : 'all steps passed');
process.exit(failed ? 1 : 0);
