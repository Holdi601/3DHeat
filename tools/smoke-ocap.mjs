/**
 * Arma recordings (docs/ocap.md) in a real browser against the dev server:
 * a folder of made-up OCAP recordings (Arma 3 on a community terrain with no level, a winner each, and
 * one of OCAP2's Reforger recorder on Arland) is loaded as one dataset through
 * the viewer's own preview, mapping and load; its outcome and level columns
 * must be there, the level panel must say that world has no level, the Reforger
 * one must get its level from the levels folder where there is one; the
 * folder opens in the Mass analysis with a winner per match; a recording goes
 * onto the tactics board. Frame intervals are measured with the camera turning
 * (p50, p99, max), screenshots go to tools/.smoke/. Fails on a console error
 * or a step that is not as it should be.
 *
 * OCAP_SET=<folder of real recordings> loads those instead (local only, never
 * committed); OCAP_N limits how many. ANALYSIS_GPU=1 uses the real GPU, so the
 * frame numbers mean something.
 *
 *   node tools/smoke-ocap.mjs [url]
 */
import { chromium } from 'playwright';
import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = process.argv.find((a) => a.startsWith('http')) ?? 'http://127.0.0.1:5273/';
const GPU = process.env.ANALYSIS_GPU === '1';
const REAL = process.env.OCAP_SET ?? null;
const N = Number(process.env.OCAP_N ?? 1e9);
const OUT = path.join(ROOT, 'tools/.smoke');
mkdirSync(OUT, { recursive: true });

/** A made-up Arma 3 mission: two sides of `n` units walking at each other for `frames` seconds, the winner named. */
function synthA3(k, n = 40, frames = 600) {
  const entities = [];
  for (let i = 0; i < n; i++) {
    const west = i < n / 2;
    const pos = [];
    for (let f = 0; f < frames; f++) {
      const x = 6000 + (west ? f * 1.2 : 1500 - f * 1.2) + (i % 5) * 8;
      const y = 7000 + (i % 10) * 15 + Math.sin(f / 30 + i) * 10;
      pos.push([
        [x, y, 120 + Math.sin(x / 300) * 20],
        west ? 90 : 270,
        f > frames - 30 && !west && i % 3 === 0 ? 0 : 1,
        0,
        `U${i}`,
        i % 4 === 0 ? 1 : 0,
        'Rifleman',
      ]);
    }
    entities.push({
      id: i,
      type: 'unit',
      name: `U${i}`,
      side: west ? 'WEST' : 'EAST',
      group: `${west ? 'Alpha' : 'Bravo'} ${Math.floor(i / 5)}`,
      role: 'Rifleman',
      isPlayer: i % 4 === 0 ? 1 : 0,
      startFrameNum: 0,
      positions: pos,
      framesFired: [[100, [6600, 7050, 120]]],
    });
  }
  entities.push({
    id: n,
    type: 'vehicle',
    name: 'M2A4 Slammer',
    class: 'tank',
    startFrameNum: 0,
    positions: [[[5950, 7000, 118], 90, 1, [0], [0, frames - 1]]],
  });
  const winner = k % 3 === 0 ? 'EAST' : 'WEST';
  return {
    missionName: `Synthetic op ${k}`,
    worldName: 'lythium',
    captureDelay: 1,
    endFrame: frames - 1,
    extensionBuild: 'synthetic',
    times: [
      {
        frameNum: 0,
        systemTimeUTC: `2026-11-${String(1 + k).padStart(2, '0')}T20:00:00.000`,
      },
    ],
    entities,
    events: [
      [300, 'killed', n - 1, [0, 'MX 6.5 mm'], 220],
      [frames - 1, 'endMission', [winner, `${winner === 'WEST' ? 'BLUFOR' : 'OPFOR'} wins`]],
    ],
    Markers: [['hd_objective', 'Objective', 0, frames - 1, -1, '000000', -1, [[0, [6750, 7075, 0], 0]]]],
  };
}

/** OCAP2's Reforger recorder's layout on Arland: [x, up, north], a world file. */
function synthReforger(cx, cz, h) {
  const entities = [];
  for (let i = 0; i < 12; i++) {
    const pos = [];
    for (let f = 0; f < 300; f++) pos.push([[cx + Math.cos(i) * (50 + f), h, cz + Math.sin(i) * (50 + f)], (i * 30) % 360, 1, 0, `R${i}`, 1, 'Rifleman']);
    entities.push({
      id: i,
      name: `R${i}`,
      group: '',
      side: i < 6 ? 'WEST' : 'EAST',
      isPlayer: 1,
      type: 'unit',
      role: 'Rifleman',
      startFrameNum: 0,
      positions: pos,
      framesFired: [],
    });
  }
  return {
    addonVersion: '0.1.0',
    extensionVersion: '0.1.0',
    extensionBuild: 'reforger',
    missionName: 'Synthetic Reforger',
    missionAuthor: '',
    worldName: 'worlds/Arland/Arland.ent',
    endFrame: 299,
    captureDelay: 1,
    tags: '',
    times: [],
    entities,
    events: [[299, 'endMission', ['WEST', '']]],
    Markers: [],
  };
}

let files;
if (REAL) {
  files = readdirSync(REAL)
    .filter((f) => /\.json(\.gz)?$/i.test(f) && f !== 'operations.json')
    .slice(0, N)
    .map((f) => path.join(REAL, f));
} else {
  const dir = path.join(OUT, 'ocap-set');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  files = [];
  for (let k = 0; k < 6; k++) {
    const p = path.join(dir, `2026_11_${String(1 + k).padStart(2, '0')}__20_00_Synth${k}.json.gz`);
    writeFileSync(p, gzipSync(JSON.stringify(synthA3(k))));
    files.push(p);
  }
}
const bytes = files.reduce((a, f) => a + statSync(f).size, 0);

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

const result = { files: files.length, mb: +(bytes / 1e6).toFixed(1) };
try {
  await page.goto(url, { timeout: 240_000 });
  await page.waitForFunction(() => !!globalThis.__3dheat_engine && !!globalThis.__3dheat, null, { timeout: 240_000 });
  await page.evaluate(() => {
    for (const id of ['ocap-probe-files', 'ocap-probe-rf']) {
      const el = document.createElement('input');
      el.type = 'file';
      el.multiple = true;
      el.id = id;
      el.hidden = true;
      document.body.appendChild(el);
    }
  });

  /** Loads the probe input's files as the Source panel would: the first file's preview and mapping, then the load. */
  async function loadInput(id) {
    return page.evaluate(async (id) => {
      const h = globalThis.__3dheat;
      const files = Array.from(document.getElementById(id).files);
      const { previewSource } = await h.modules['data/sourcePreview']();
      const { autoMap } = await h.modules['data/automap']();
      const { loader } = await h.modules['data/loader']();
      const t0 = performance.now();
      const p = await previewSource(files[0]);
      const mapping = autoMap({
        columns: p.columns,
        rows: p.rows,
        numeric: p.numeric,
        hints: p.hints,
      });
      const ds = await loader.ingest(files, mapping, p.columns, 'ocap', 1, undefined);
      h.useStore.getState().setDataset(ds);
      return {
        ms: performance.now() - t0,
        rows: ds.count,
        sessions: ds.sessionLabels.length,
        attrs: ds.attrs.map((a) => a.name),
        teams: ds.teamLabels,
      };
    }, id);
  }

  /** Frame intervals for `ms` with the camera turning, so every frame draws. */
  async function frames(ms) {
    return page.evaluate(async (ms) => {
      const e = globalThis.__3dheat_engine;
      const t = [];
      let last = performance.now();
      const end = last + ms;
      await new Promise((done) => {
        const tick = (now) => {
          t.push(now - last);
          last = now;
          // Turning on the spot: every frame draws everything anew.
          e.camera?.setOrientationDegrees?.((now / 40) % 360, -35);
          if (e.camera) e.camera.moved = true;
          e.invalidate?.(1);
          if (now < end) requestAnimationFrame(tick);
          else done();
        };
        requestAnimationFrame(tick);
      });
      t.splice(0, 2);
      t.sort((a, b) => a - b);
      return {
        p50: t[Math.floor(t.length * 0.5)],
        p99: t[Math.min(t.length - 1, Math.floor(t.length * 0.99))],
        max: t[t.length - 1],
        n: t.length,
      };
    }, ms);
  }

  await step(`load ${files.length} recordings as one dataset (${result.mb} MB)`, async () => {
    await page.locator('#ocap-probe-files').setInputFiles(files);
    const r = await loadInput('ocap-probe-files');
    Object.assign(result, {
      loadMs: Math.round(r.ms),
      rows: r.rows,
      sessions: r.sessions,
    });
    expect(r.rows > 1000, `only ${r.rows} rows`);
    for (const c of ['Won', 'Map', 'Game', 'Unit', 'Faction', 'Event']) expect(r.attrs.includes(c), `no ${c} column`);
    expect(r.sessions >= Math.min(files.length, 2), `${r.sessions} sessions`);
    return `${r.rows} rows, ${r.sessions} sessions, teams ${r.teams.join('/')}, ${(r.ms / 1000).toFixed(1)} s`;
  });

  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUT, 'ocap-a3.png') });

  await step('the level panel says which Arma 3 world has no level', async () => {
    const head = page.locator('.section header', { hasText: 'Background / level' }).first();
    if ((await head.getAttribute('aria-expanded')) !== 'true') await head.click();
    await page.waitForTimeout(1500);
    const n = await page.locator('[data-arma-missing]').count();
    const text = n ? await page.locator('[data-arma-missing]').first().innerText() : '';
    const attrs = n
      ? ''
      : await page.evaluate(() =>
          globalThis.__3dheat.useStore
            .getState()
            .dataset?.attrs.map((a) => a.name)
            .join(','),
        );
    // A real set's world may have its level in the folder: then no hint, the level loads instead.
    if (REAL && !n) {
      const has = await page.evaluate(async () => {
        const worlds = globalThis.__3dheat.useStore.getState().dataset?.attrs.find((a) => a.name === 'World')?.categories ?? [];
        const ix = await (await fetch('/__heat3d/catalog')).json().catch(() => null);
        const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        return (ix?.items ?? []).filter((i) => i.kind === 'level' && /^arma/i.test(i.game) && worlds.some((w) => norm(w) === norm(i.name))).map((i) => i.path);
      });
      if (has.length) return `no hint: the world's level is in the levels folder (${has.join(', ')})`;
    }
    expect(!REAL ? /Lythium/.test(text) : n > 0, `hint: "${text}" (${n}) attrs ${attrs}`);
    return text.slice(0, 80);
  });

  await step('frames with the camera turning', async () => {
    const f = await frames(5000);
    result.frames = f;
    return `p50 ${f.p50.toFixed(1)} p99 ${f.p99.toFixed(1)} max ${f.max.toFixed(1)} ms over ${f.n}`;
  });

  await step('the folder in the Mass analysis, a winner per match', async () => {
    const r = await page.evaluate(async () => {
      const files = Array.from(document.getElementById('ocap-probe-files').files).map((file) => ({ file, path: file.name }));
      const mc = await globalThis.__3dheat.modules['mass/client']();
      const t0 = performance.now();
      await mc.openMass(files);
      const st = () => mc.useMass.getState();
      // At most half an hour: a summary that never comes back fails the step, it does not hang the run.
      const deadline = t0 + 30 * 60_000;
      await new Promise((done, fail) => {
        const poll = () =>
          st().facets && !st().progress
            ? done()
            : performance.now() > deadline
              ? fail(new Error(`mass analysis still running: ${JSON.stringify(st().progress)}`))
              : setTimeout(poll, 200);
        poll();
      });
      return {
        ms: performance.now() - t0,
        matches: st().facets.matches,
        stats: st().stats ?? null,
      };
    });
    result.massMs = Math.round(r.ms);
    result.massMatches = r.matches;
    expect(r.matches === files.length, `${r.matches} of ${files.length} matches`);
    await page.evaluate(() => globalThis.__3dheat.modules['mass/client']().then((m) => m.useMass.getState().set({ open: true, tab: 'outcome' })));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT, 'ocap-mass.png') });
    return `${r.matches} matches in ${(r.ms / 1000).toFixed(1)} s`;
  });
  // Fifty matches of a map at least: a real set's (OCAP_SET); the made-up one is too small to say anything.
  if (REAL)
    await step('the Outcome lens on the folder: what goes with winning', async () => {
      await page.evaluate(async () => {
        globalThis.__oc = (await globalThis.__3dheat.modules['mass/outcomeClient']()).useOutcome;
      });
      const t0 = Date.now();
      await page.click('[data-testid=outcome-run]');
      await page.waitForFunction(() => !globalThis.__oc.getState().running && !!globalThis.__oc.getState().result, null, { timeout: 1_800_000 });
      const r = await page.evaluate(() => {
        const x = globalThis.__oc.getState().result;
        return { matches: x.matches, read: x.read, tests: x.report.tests, groups: x.report.groups.length, findings: x.report.findings.length };
      });
      result.outcome = { ...r, ms: Date.now() - t0 };
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(OUT, 'ocap-outcome.png') });
      expect(r.read > 0, 'no match read');
      return `${r.read} of ${r.matches} matches read, ${r.groups} groups, ${r.tests} tests, ${r.findings} findings, ${((Date.now() - t0) / 1000).toFixed(1)} s`;
    });
  await page.evaluate(() => globalThis.__3dheat.modules['mass/client']().then((m) => m.useMass.getState().set({ open: false })));

  await step('a recording onto the tactics board', async () => {
    const r = await page.evaluate(async () => {
      const f = document.getElementById('ocap-probe-files').files[0];
      const { readMission, missionToPlan } = await globalThis.__3dheat.modules['tactics/missions']();
      const m = await readMission(f.name, new Uint8Array(await f.arrayBuffer()));
      const plan = missionToPlan(m);
      return {
        groups: m.groups.length,
        map: m.map,
        figures: plan.figures?.length ?? 0,
      };
    });
    expect(r.groups > 0, 'no groups');
    return `${r.groups} groups, ${r.figures} figures, ${r.map}`;
  });

  if (!REAL) {
    await step('a Reforger recording gets its level from the levels folder', async () => {
      // The Arland level's middle, so the made-up recording stands on it.
      const cat = await page.evaluate(async () => (await fetch('/__heat3d/catalog')).json().catch(() => null));
      const arland = cat?.items?.find((i) => i.kind === 'level' && /^arma[-_ ]?reforger$/i.test(i.game) && /^arland/i.test(i.name));
      if (!arland) return 'skipped: no Arland level in the levels folder';
      await page.evaluate(() => globalThis.__3dheat.useStore.getState().setLevel?.(null));
      const p = path.join(OUT, 'ocap-set-rf.json.gz');
      writeFileSync(p, gzipSync(JSON.stringify(synthReforger(2000, 2000, 40))));
      await page.locator('#ocap-probe-rf').setInputFiles([p]);
      await loadInput('ocap-probe-rf');
      await page.waitForFunction(() => !!globalThis.__3dheat.useStore.getState().level, null, { timeout: 300_000 });
      const b = await page.evaluate(() => {
        const s = globalThis.__3dheat.useStore.getState();
        return {
          level: s.level?.name ?? s.level?.kind,
          bounds: s.level?.bounds ?? null,
          data: s.dataset?.bounds ?? null,
        };
      });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(OUT, 'ocap-reforger.png') });
      return `${b.level} ${JSON.stringify(b.bounds)} data ${JSON.stringify(b.data)}`;
    });
  }

  writeFileSync(path.join(OUT, 'ocap-result.json'), JSON.stringify(result, null, 1));
  await step('no console errors', async () => {
    expect(!errors.length, errors.slice(0, 5).join(' | '));
  });
} finally {
  await browser.close();
}
console.log(JSON.stringify(result));
process.exit(failed ? 1 : 0);
