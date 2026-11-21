/**
 * The vehicle-hit analysis (docs/vehicle-hits.md) in a real browser against
 * the dev server: made-up War Thunder-like matches (hits on two tanks, with
 * fires, deaths and turret samples) are written as `.3dheat` containers,
 * loaded through the Vehicles tab's hit analysis, a vehicle is shown, filters
 * and a comparison are set, a mark's card opens; the page's frame intervals
 * are measured while the files load and while the filters change (p50, p99,
 * max). Screenshots go to tools/.smoke/. Fails on a console error or a step
 * that is not as it should be.
 *
 * VHITS_SET=<folder of .3dheat> runs it on that folder instead (a local real
 * set, never committed), VHITS_LIST=<file> on the files it lists (a path a
 * line); VHITS_LIMIT=<n> takes the first n files.
 * ANALYSIS_GPU=1 uses the real GPU, so the frame numbers mean something.
 *
 *   node tools/smoke-vehicle-hits.mjs [url]
 */
import { chromium } from 'playwright';
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parquetWriteBuffer } from 'hyparquet-writer';
import { writeContainer } from './container.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = process.argv.find((a) => a.startsWith('http')) ?? 'http://127.0.0.1:5273/';
const GPU = process.env.ANALYSIS_GPU === '1';
const REAL = process.env.VHITS_SET ?? null;
const LIMIT = Number(process.env.VHITS_LIMIT ?? 0) || Infinity;
const OUT = path.join(ROOT, 'tools/.smoke');
mkdirSync(OUT, { recursive: true });

let seed = 7;
const R = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pick = (xs) => xs[Math.floor(R() * xs.length)];

const COLS = {
  time: 'DOUBLE', event: 'STRING', player: 'STRING', team: 'STRING', life: 'STRING', Vehicle: 'STRING', ai: 'BOOLEAN',
  x: 'FLOAT', y: 'FLOAT', z: 'FLOAT', other: 'STRING', otherVehicle: 'STRING', otherLife: 'STRING', weapon: 'STRING',
  targetX: 'FLOAT', targetY: 'FLOAT', targetZ: 'FLOAT', hitLocalX: 'FLOAT', hitLocalY: 'FLOAT', hitLocalZ: 'FLOAT',
  hitDirX: 'FLOAT', hitDirY: 'FLOAT', hitDirZ: 'FLOAT', hitPart: 'DOUBLE', hitOutcome: 'STRING', calibre: 'FLOAT',
  ammoType: 'STRING', ammoName: 'STRING', fireId: 'STRING', turretYaw: 'FLOAT', gunPitch: 'FLOAT',
};

/** Made-up matches: two sides of five tanks; every few seconds a shot lands on the front or the side of one. */
async function synthSet(n) {
  const dir = path.join(OUT, 'vhits-set');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(path.join(dir, '.tmp'), { recursive: true });
  const vehicles = ['ussr_t_72b3', 'us_m1a2_sep'];
  const shells = [
    ['APFSDS', '125mm_test_dart', 125],
    ['APDS', '30mm_test_apds', 30],
    ['HEAT-FS', '120mm_test_heat', 120],
  ];
  for (let m = 0; m < n; m++) {
    const rows = [];
    const units = Array.from({ length: 10 }, (_, k) => ({ name: `p${k}`, team: k < 5 ? '1' : '2', life: `${100 + k}#1`, vehicle: vehicles[k % 2], x: k < 5 ? -800 : 800, z: (k % 5) * 60 }));
    for (let t = 0; t < 300; t += 1) {
      for (const u of units) rows.push({ time: t, event: 'position', player: u.name, team: u.team, life: u.life, Vehicle: u.vehicle, ai: false, x: u.x, y: 10, z: u.z, turretYaw: (R() - 0.5) * 60, gunPitch: 2 });
      if (R() < 0.6) {
        const a = pick(units), b = pick(units.filter((x) => x.team !== a.team));
        const [type, name, cal] = pick(shells);
        const side = R() < 0.6;
        const ang = side ? 50 + R() * 30 : R() * 40;
        const rad = (ang * Math.PI) / 180;
        const pen = R() < (side ? 0.8 : 0.3) * (type === 'APDS' ? 0.5 : 1);
        const out = pen ? (R() < 0.1 ? 'kill' : R() < 0.3 ? 'critical' : 'penetration') : 'nonpenetration';
        rows.push({
          time: t + 0.5, event: 'shot', player: a.name, team: a.team, life: a.life, Vehicle: a.vehicle, ai: false, x: a.x, y: 10, z: a.z,
          other: b.name, otherVehicle: b.vehicle, otherLife: b.life, targetX: b.x, targetY: 11, targetZ: b.z,
          hitLocalX: side ? -1 + R() * 3 : 3.2, hitLocalY: 0.6 + R() * 0.8, hitLocalZ: side ? 1.7 : -1 + R() * 2,
          hitDirX: side ? -Math.sin(rad) : -Math.cos(rad), hitDirY: -0.02, hitDirZ: side ? -Math.cos(rad) : Math.sin(rad),
          hitOutcome: out, calibre: cal, ammoType: type, ammoName: name,
        });
        if (pen && R() < 0.2) rows.push({ time: t + 0.5, event: 'fire_on', player: b.name, team: b.team, life: b.life, fireId: '1:0' });
        if (out === 'kill') rows.push({ time: t + 0.9, event: 'death', player: b.name, team: b.team, life: b.life, other: a.name });
      }
    }
    rows.sort((p, q) => p.time - q.time);
    const columnData = Object.entries(COLS).map(([name, type]) => ({ name, type, data: rows.map((r) => r[name] ?? null) }));
    const stem = `test_map_RB_${String(m).padStart(4, '0')}`;
    const file = path.join(dir, '.tmp', `${stem}.parquet`);
    writeFileSync(file, Buffer.from(parquetWriteBuffer({ columnData })));
    await writeContainer(path.join(dir, `${stem}.3dheat`), [{ file, role: 'table' }], {
      game: 'warthunder', match: stem, map: 'test_map', mode: m % 3 ? 'RB ground' : 'AB ground',
      started: new Date(Date.UTC(2026, 10, 1 + (m % 20), 12)).toISOString(), converter: { name: 'smoke', version: m % 2 ? '0.2.4' : '0.2.6' },
      extensions: { 'heat3d/economy': { winnerTeam: m % 2 ? '1' : '2' } },
    });
  }
  rmSync(path.join(dir, '.tmp'), { recursive: true, force: true });
  return dir;
}

function listFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = path.join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      // A file changed in the last ten minutes may still be written by a converter.
      else if (name.endsWith('.3dheat') && (!REAL || Date.now() - statSync(p).mtimeMs > 600_000)) out.push(p);
      if (out.length >= LIMIT) return;
    }
  };
  walk(dir);
  return out;
}

// VHITS_LIST=<text file>: the files to load, a path a line (a chosen subset of a real set).
const LIST = process.env.VHITS_LIST ?? null;
const dir = LIST ? null : (REAL ?? (await synthSet(80)));
const files = LIST ? readFileSync(LIST, 'utf8').split(/\r?\n/).filter(Boolean).slice(0, LIMIT) : listFiles(dir);
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
const summary = {};
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

/** Frame intervals from now until `stop()`: the camera turns (turntable), so every frame draws. */
async function startFrames() {
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
  });
}
async function stopFrames() {
  return page.evaluate(() => {
    globalThis.__measuring = false;
    const t = globalThis.__frames.slice(2).sort((a, b) => a - b);
    return { p50: t[Math.floor(t.length * 0.5)], p99: t[Math.min(t.length - 1, Math.floor(t.length * 0.99))], max: t[t.length - 1], n: t.length };
  });
}
const fmt = (f) => `p50 ${f.p50.toFixed(1)} p99 ${f.p99.toFixed(1)} max ${f.max.toFixed(1)} ms over ${f.n}`;

try {
await page.goto(url, { timeout: 240_000 });
await page.waitForFunction(() => !!globalThis.__3dheat_engine && !!globalThis.__3dheat, null, { timeout: 240_000 });
await page.evaluate(async () => {
  globalThis.__vh = (await globalThis.__3dheat.modules['vehicle/mass/client']()).useHitMass;
  (await globalThis.__3dheat.modules['state/raceStore']()).useRaceStore.getState().setTab('vehicle');
});

await step('open the hit analysis from the Vehicles tab', async () => {
  // The entry sits in a closed section: open it by its title, then press the button.
  if (!(await page.locator('[data-vhits=enter]').count())) await page.getByText('Hits over many matches').first().click({ timeout: 60_000 });
  await page.locator('[data-vhits=enter]').first().click({ timeout: 30_000 });
  await page.waitForSelector('[data-vhits=files]', { state: 'attached', timeout: 30_000 });
  expect(await page.evaluate(() => globalThis.__vh.getState().active), 'not active');
});

await step(`load the hits of ${files.length} files, frames measured meanwhile`, async () => {
  expect(files.length > 0, 'no files to load');
  await startFrames();
  const t0 = Date.now();
  await page.locator('[data-vhits=files]').setInputFiles(files);
  // Progress every 15 s; a load that moves no file on for ten minutes has stalled.
  let lastDone = -1, lastMove = Date.now();
  for (;;) {
    const st = await page.evaluate(() => {
      const s = globalThis.__vh.getState();
      return { stats: s.stats, facets: !!s.facets, error: s.error };
    });
    if (st.stats && !st.stats.running && st.stats.done === st.stats.files && st.facets) break;
    if (st.error) throw new Error(st.error);
    const done = st.stats?.done ?? 0;
    if (done !== lastDone) {
      lastDone = done;
      lastMove = Date.now();
    } else if (Date.now() - lastMove > 600_000) throw new Error(`stalled at ${done} files: ${JSON.stringify(st.stats)}`);
    console.log(`     ${done} of ${st.stats?.files ?? '?'} files, ${st.stats?.hits ?? 0} hits, ${((st.stats?.bytes ?? 0) / 1048576).toFixed(0)} MB, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    await page.waitForTimeout(15_000);
  }
  const wall = Date.now() - t0;
  const f = await stopFrames();
  const st = await page.evaluate(() => globalThis.__vh.getState().stats);
  summary.load = { ...st, wall, frames: f };
  expect(st.hits > 0, 'no hits');
  expect(st.failed <= Math.floor(st.files * 0.01), `${st.failed} files failed`);
  return `${st.matches} matches, ${st.hits} hits, ${(st.bytes / 1048576).toFixed(1)} MB, ${(wall / 1000).toFixed(1)} s, ${st.cached} cached, ${st.native} native; ${fmt(f)}`;
});

await step('a vehicle is shown with its counts and plate colours', async () => {
  await page.waitForFunction(() => !!globalThis.__vh.getState().result, null, { timeout: 120_000 });
  const r = await page.evaluate(() => {
    const s = globalThis.__vh.getState();
    return { vehicle: s.vehicle, kept: s.result.kept, hits: s.result.hits, plates: !!s.platesKey, coloured: s.colours ? Array.from(s.colours).filter(Number.isFinite).length / 3 : 0, marks: s.drawn?.length ?? 0, ms: s.result.ms };
  });
  summary.view = r;
  expect(r.hits > 0, 'no hits on the vehicle');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'vehicle-hits.png') });
  return `${r.kept} of ${r.hits} hits, plates ${r.plates ? `${r.coloured} coloured, ${r.marks} marks` : 'none in the local pack'}, ${r.ms.toFixed(0)} ms`;
});

await step('filters and a comparison answer, frames measured meanwhile', async () => {
  await startFrames();
  const times = await page.evaluate(async () => {
    const mod = await globalThis.__3dheat.modules['vehicle/mass/client']();
    const wait = async () => {
      const before = globalThis.__vh.getState().result;
      const t0 = performance.now();
      for (let k = 0; k < 600 && globalThis.__vh.getState().result === before; k++) await new Promise((r) => setTimeout(r, 25));
      const ms = performance.now() - t0;
      await new Promise((r) => setTimeout(r, 400));
      return ms;
    };
    const out = [];
    mod.patchFilter({ results: ['penetration', 'critical', 'kill'] });
    out.push(await wait());
    mod.patchFilter({ results: null, calibre: [100, null] });
    out.push(await wait());
    mod.patchFilter({ angle: [40, 90] });
    out.push(await wait());
    mod.patchFilter({ won: 'lost' });
    out.push(await wait());
    mod.patchHits({ compare: { field: 'converterVersion', a: ['0.2.4'], b: ['0.2.6'] } });
    out.push(await wait());
    mod.patchHits({ metric: 'fire', compare: null });
    out.push(await wait());
    mod.patchHits({ filter: {} });
    out.push(await wait());
    return out;
  });
  const f = await stopFrames();
  summary.filters = { times, frames: f };
  return `answers ${times.map((x) => x.toFixed(0)).join(', ')} ms; ${fmt(f)}`;
});

await step('a mark opens its card', async () => {
  const ok = await page.evaluate(async () => {
    const s = globalThis.__vh.getState();
    const first = s.drawn?.[0]?.hit ?? null;
    const mod = await globalThis.__3dheat.modules['vehicle/mass/client']();
    const index = first ? first.id : 0;
    await mod.showHit(index);
    const d = globalThis.__vh.getState().detail;
    return d ? { result: d.result, speedSource: d.speedSource, distanceSource: d.distanceSource } : null;
  });
  expect(ok, 'no card');
  return JSON.stringify(ok);
});

await step('no console errors', async () => {
  expect(errors.length === 0, errors.slice(0, 5).join(' | '));
});

writeFileSync(path.join(OUT, 'vehicle-hits.json'), JSON.stringify(summary, null, 2));
} finally {
  await browser.close();
}
process.exit(failed ? 1 : 0);
