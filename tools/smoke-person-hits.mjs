/**
 * The person-hit analysis (docs/person-hits.md) in a real browser against the
 * dev server: made-up matches of three games - Counter-Strike 2-like tables
 * (hurt, kill and sample rows), VALORANT-like game data and Arma 3 OCAP-like
 * recordings - are loaded through the Vehicles tab's person-hit analysis; the
 * body, the regions table, the charts and the sources are checked, filters
 * are set, a dashboard template opens; frames are measured while the files
 * load and while the filters change. Screenshots go to tools/.smoke/. Fails on
 * a console error or a step that is not as it should be.
 *
 * PHITS_LIST=<file> loads the files it lists instead (a path a line; a local
 * real set, never committed). ANALYSIS_GPU=1 uses the real GPU.
 *
 *   node tools/smoke-person-hits.mjs [url]
 */
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parquetWriteBuffer } from 'hyparquet-writer';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = process.argv.find((a) => a.startsWith('http')) ?? 'http://127.0.0.1:5273/';
const GPU = process.env.ANALYSIS_GPU === '1';
const LIST = process.env.PHITS_LIST ?? null;
const OUT = path.join(ROOT, 'tools/.smoke');
mkdirSync(OUT, { recursive: true });

let seed = 11;
const R = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pick = (xs) => xs[Math.floor(R() * xs.length)];

const CS2_COLS = {
  time: 'DOUBLE', round: 'DOUBLE', event: 'STRING', player: 'STRING', steamid: 'STRING', side: 'STRING', other: 'STRING', map: 'STRING',
  x: 'FLOAT', y: 'FLOAT', z: 'FLOAT', dirX: 'FLOAT', dirY: 'FLOAT', dirZ: 'FLOAT', damage: 'FLOAT', health: 'FLOAT', armor: 'FLOAT', armorDamage: 'FLOAT',
  hitgroup: 'STRING', weapon: 'STRING', detail: 'STRING', penetrated: 'FLOAT', throughSmoke: 'FLOAT', distance: 'FLOAT', helmet: 'FLOAT', walking: 'FLOAT',
  duck: 'FLOAT', airborne: 'FLOAT', scoped: 'FLOAT', won: 'FLOAT', hitLocalX: 'FLOAT', hitLocalY: 'FLOAT', hitLocalZ: 'FLOAT',
};
const GROUPS = [['head', 4, 1.62], ['chest', 1, 1.3], ['stomach', 1.25, 1.0], ['left_arm', 1, 1.2], ['right_arm', 1, 1.2], ['left_leg', 0.75, 0.5], ['right_leg', 0.75, 0.5]];
const GUNS = [['AK-47', 36, 0.98], ['M4A4', 33, 0.97], ['AWP', 115, 0.99], ['Glock-18', 30, 0.9]];

/** A CS2-like match: ten players on a line, a hurt row every second or so. */
function cs2Match(m) {
  const rows = [];
  const players = Array.from({ length: 10 }, (_, k) => ({ name: `p${k}`, side: k < 5 ? 'T' : 'CT', x: (k < 5 ? -1 : 1) * (200 + R() * 1500), y: R() * 800 }));
  const health = new Map(players.map((p) => [p.name, 100]));
  for (let t = 0; t < 600; t += 0.125) {
    const round = 1 + Math.floor(t / 60);
    for (const p of players) rows.push({ time: t, round, event: 'position', player: p.name, steamid: p.name, side: p.side, map: 'de_test', x: p.x, y: p.y, z: 0, dirX: p.side === 'T' ? 1 : -1, dirY: 0, dirZ: 0, helmet: R() < 0.7 ? 1 : 0, walking: 0, duck: R() < 0.1 ? 1 : 0, airborne: 0, scoped: 0 });
    if (R() < 0.1) {
      const a = pick(players), b = pick(players.filter((p) => p.side !== a.side));
      const [gun, base, rm] = pick(GUNS);
      const [group, mult, h] = pick(GROUPS);
      const dist = Math.hypot(a.x - b.x, a.y - b.y) * 0.0254;
      const raw = Math.round(base * mult * Math.pow(rm, dist / 0.0254 / 500));
      const armour = group === 'head' ? 0 : Math.round(raw * 0.25);
      const left = health.get(b.name);
      const took = Math.min(left, raw - armour * 2);
      health.set(b.name, left - took <= 0 ? 100 : left - took);
      rows.push({ time: t, round, event: 'hurt', player: b.name, steamid: b.name, side: b.side, other: a.name, map: 'de_test', x: b.x, y: b.y, z: 0, damage: took, health: left - took, armor: 100 - armour, armorDamage: armour, hitgroup: group, weapon: gun, detail: JSON.stringify({ dmg_health: raw - armour * 2, dmg_armor: armour }), won: R() < 0.5 ? 1 : 0, hitLocalX: 0.1, hitLocalY: h, hitLocalZ: (R() - 0.5) * 0.3 });
      if (left - took <= 0) rows.push({ time: t, round, event: 'kill', player: a.name, steamid: a.name, side: a.side, other: b.name, map: 'de_test', x: a.x, y: a.y, z: 0, distance: dist, penetrated: R() < 0.1 ? 1 : 0, throughSmoke: 0, hitgroup: group, weapon: gun });
    }
  }
  const columnData = Object.entries(CS2_COLS).map(([name, type]) => ({ name, type, data: rows.map((r) => r[name] ?? null) }));
  return Buffer.from(parquetWriteBuffer({ columnData }));
}

/** A VALORANT-like game: snapshots a second, a damage event now and then. */
function valorantGame() {
  const ev = [];
  const meta = (t) => ({ metadata: { eventTime: { omittingPauses: `${t.toFixed(3)}s` }, gameVersion: 'smoke' } });
  ev.push({ ...meta(0), platformGameId: 'smoke', configuration: { teams: [{ teamId: { value: 1 }, name: 'Red', playersInTeam: [1, 2, 3, 4, 5].map((v) => ({ value: v })) }, { teamId: { value: 2 }, name: 'Blue', playersInTeam: [6, 7, 8, 9, 10].map((v) => ({ value: v })) }], players: Array.from({ length: 10 }, (_, k) => ({ playerId: { value: k + 1 }, displayName: `v${k + 1}` })), selectedMap: { fallback: { displayName: 'Testmap' } } } });
  for (let round = 1; round <= 12; round++) {
    const t0 = round * 100;
    ev.push({ ...meta(t0), roundStarted: { roundNumber: round } });
    for (let t = t0; t < t0 + 90; t += 1) {
      ev.push({ ...meta(t), snapshot: { players: Array.from({ length: 10 }, (_, k) => ({ playerId: { value: k + 1 }, aliveState: { health: 100, armor: k % 2 ? 50 : 25, position: { x: (k < 5 ? -1 : 1) * 1500, y: k * 300, z: 0 }, viewVector: { x: k < 5 ? 1 : -1, y: 0, z: 0 }, velocity: { x: 0, y: 0, z: 0 }, equippedItem: { displayName: k % 3 ? 'Vandal' : 'Phantom', guid: k % 3 ? 'gv' : 'gp' } } })) } });
      if (R() < 0.5) ev.push({ ...meta(t + 0.5), damageEvent: { location: pick(['HEAD', 'BODY', 'BODY', 'LEG']), causerId: { value: 1 + Math.floor(R() * 5) }, victimId: { value: 6 + Math.floor(R() * 5) }, damageAmount: 20 + R() * 120, killEvent: R() < 0.2, wallPen: R() < 0.08 } });
    }
    ev.push({ ...meta(t0 + 95), roundDecided: { result: { roundNumber: round, winningTeam: { value: round % 2 ? 1 : 2 } } } });
  }
  return gzipSync(Buffer.from(JSON.stringify(ev)));
}

/** An OCAP-like recording: two squads, hits and kills with magazines. */
function ocapRecording() {
  const frames = 600;
  const units = Array.from({ length: 16 }, (_, k) => ({ id: k, type: 'unit', name: `o${k}`, side: k < 8 ? 'WEST' : 'EAST', isPlayer: 1, startFrameNum: 0, positions: Array.from({ length: frames }, (_, f) => [[1000 + (k < 8 ? 0 : 300) + (k % 8) * 10, 1000 + f * 0.5, 10], k < 8 ? 90 : 270, 1, 0, `o${k}`, 1]) }));
  const events = [];
  for (let f = 10; f < frames; f += 3) {
    const s = pick(units), v = pick(units.filter((u) => u.side !== s.side));
    events.push([f, R() < 0.25 ? 'killed' : 'hit', v.id, [s.id, pick(['L85A3 [5.56 mm AP]', 'AK-74M [7N10]', 'L7A2 GPMG [7.62mm Tracer]'])], 300 + Math.round(R() * 40)]);
  }
  events.push([frames, 'endMission', ['WEST', 'won']]);
  return gzipSync(Buffer.from(JSON.stringify({ captureDelay: 1, worldName: 'testworld', missionName: 'smoke', endFrame: frames, entities: units, events })));
}

function synthSet() {
  const dir = path.join(OUT, 'phits-set');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const files = [];
  for (let m = 0; m < 6; m++) {
    const f = path.join(dir, `cs2_test_${m}.parquet`);
    writeFileSync(f, cs2Match(m));
    files.push(f);
  }
  for (let m = 0; m < 3; m++) {
    const f = path.join(dir, `val_test_${m}.json.gz`);
    writeFileSync(f, valorantGame());
    files.push(f);
  }
  for (let m = 0; m < 3; m++) {
    const f = path.join(dir, `ocap_test_${m}.json.gz`);
    writeFileSync(f, ocapRecording());
    files.push(f);
  }
  return files;
}

const files = LIST ? readFileSync(LIST, 'utf8').split(/\r?\n/).filter(Boolean) : synthSet();
const browser = await chromium.launch({
  args: GPU
    ? ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--disable-frame-rate-limit']
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
async function startFrames() {
  await page.evaluate(() => {
    globalThis.__frames = [];
    globalThis.__measuring = true;
    let last = performance.now();
    const tick = (now) => {
      globalThis.__frames.push(now - last);
      last = now;
      globalThis.__3dheat_engine?.invalidate?.(1);
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
    globalThis.__ph = await globalThis.__3dheat.modules['person/client']();
    (await globalThis.__3dheat.modules['state/raceStore']()).useRaceStore.getState().setTab('vehicle');
  });

  await step('open the person-hit analysis from the Vehicles tab', async () => {
    if (!(await page.locator('[data-phits=enter]').count())) await page.getByText('Hits on people over many matches').first().click({ timeout: 60_000 });
    await page.locator('[data-phits=enter]').first().click({ timeout: 30_000 });
    await page.waitForSelector('[data-phits=files]', { state: 'attached', timeout: 30_000 });
    expect(await page.evaluate(() => globalThis.__ph.usePersonHits.getState().active), 'not active');
  });

  await step(`load the hits of ${files.length} files, frames measured meanwhile`, async () => {
    await startFrames();
    const t0 = Date.now();
    await page.locator('[data-phits=files]').setInputFiles(files);
    await page.waitForFunction(() => {
      const s = globalThis.__ph.usePersonHits.getState();
      return s.stats && !s.stats.running && s.stats.done === s.stats.files && s.result;
    }, null, { timeout: 1_800_000, polling: 500 });
    const f = await stopFrames();
    const st = await page.evaluate(() => globalThis.__ph.usePersonHits.getState().stats);
    summary.load = { ...st, wall: Date.now() - t0, frames: f };
    expect(st.hits > 0, 'no hits');
    expect(st.failed === 0, `${st.failed} files failed: ${st.lastError}`);
    return `${st.matches} matches, ${st.hits} hits, ${(st.bytes / 1048576).toFixed(1)} MB, ${((Date.now() - t0) / 1000).toFixed(1)} s; ${fmt(f)}`;
  });

  await step('the body, the regions and the charts are there', async () => {
    const r = await page.evaluate(() => {
      const s = globalThis.__ph.usePersonHits.getState().result;
      return { kept: s.kept, mode: s.mode, regions: s.regions.map((x) => x.hits), values: s.values.filter(Number.isFinite).length, charts: s.charts.map((c) => c.rows), games: Object.keys(s.coverage), marks: s.marks.x.length };
    });
    summary.view = r;
    expect(r.kept > 0, 'nothing kept');
    expect(r.regions.some((n) => n > 0), 'no region hit');
    expect(r.charts.every((n) => n > 0), `a chart is empty: ${r.charts}`);
    expect(LIST || r.games.length === 3, `games ${r.games}`);
    expect(await page.locator('[data-phits=body] canvas').count(), 'no body canvas');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT, 'person-hits.png') });
    return JSON.stringify(r);
  });

  await step('filters answer, frames measured meanwhile', async () => {
    await startFrames();
    const times = await page.evaluate(async () => {
      const mod = globalThis.__ph;
      const wait = async () => {
        const before = mod.usePersonHits.getState().result;
        const t0 = performance.now();
        for (let k = 0; k < 800 && mod.usePersonHits.getState().result === before; k++) await new Promise((r) => setTimeout(r, 25));
        const ms = performance.now() - t0;
        await new Promise((r) => setTimeout(r, 300));
        return ms;
      };
      const out = [];
      mod.patchPersonFilter({ games: ['cs2'] });
      out.push(await wait());
      mod.patchPersonFilter({ weapons: ['AK-47'], distance: [5, 40] });
      out.push(await wait());
      mod.patchPersonFilter({ penetrated: 'yes', weapons: null, distance: null });
      out.push(await wait());
      mod.patchPerson({ metric: 'killRate' });
      out.push(await wait());
      mod.patchPersonFilter({ games: ['valorant'], penetrated: null });
      out.push(await wait());
      mod.patchPerson({ filter: {}, metric: 'damage' });
      out.push(await wait());
      return out;
    });
    const f = await stopFrames();
    const mode = await page.evaluate(() => globalThis.__ph.usePersonHits.getState().result.mode);
    summary.filters = { times, frames: f };
    return `answers ${times.map((x) => x.toFixed(0)).join(', ')} ms; mode ${mode}; ${fmt(f)}`;
  });

  await step('the dashboard source gives rows', async () => {
    const n = await page.evaluate(async () => (await globalThis.__ph.personRows(1000)).n);
    expect(n > 0, 'no rows');
    return `${n} rows`;
  });

  await step('no console errors', async () => {
    expect(errors.length === 0, errors.slice(0, 5).join(' | '));
  });
  writeFileSync(path.join(OUT, 'person-hits.json'), JSON.stringify(summary, null, 2));
} finally {
  await browser.close();
}
process.exit(failed ? 1 : 0);
