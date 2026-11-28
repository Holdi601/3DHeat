/**
 * Multiplayer view sync, follow, pointer and marks, with three real browser
 * viewers on a local `3dheat serve`: the host and two members, all on the
 * same synthetic data (tools/demo-data.mjs). Checks, as the people in it
 * would see it:
 *
 *  - joining with "keep my view in sync" on takes the host's view;
 *  - the host's changes are asked about (apply too / ignore / ignore all);
 *    a member's go to everyone; "back to my previous view"; sync off keeps
 *    one's own; turned on again it takes the session's view;
 *  - every mode and workspace (heat, difference, team, figures, lines,
 *    race, match, tactics, vehicles) and their settings reach everyone;
 *  - playback: play, speed, seek and pause line up in time for everyone;
 *  - the pointer is a point in the world (a ring where the ray hit);
 *  - erase mine / erase all reach everyone and stay erased;
 *  - "follow me" is a request: yes / no, free look while following, the X
 *    stops it and it does not come back, the host lets everyone go;
 *  - the eye: another member's view for a while, and back.
 *
 *   node tools/smoke-session-sync.mjs [--shots DIR]
 *
 * Needs the dev server (APP, default http://127.0.0.1:5318/) and the server
 * binary (HEAT3D_SERVE_BIN). Software GL: a correctness test.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const APP = process.env.APP ?? 'http://127.0.0.1:5318/';
const BIN = process.env.HEAT3D_SERVE_BIN ?? ['E:/cargo-targets/3dheat/release/3dheat.exe'].find(existsSync);
if (!BIN) throw new Error('no 3dheat binary: set HEAT3D_SERVE_BIN');
const SHOTS = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const PORT = Number(process.env.SESSION_PORT ?? 7800 + Math.floor(Math.random() * 90));
const SERVER = `http://127.0.0.1:${PORT}`;
const TOKEN = randomBytes(32).toString('hex');
const PASSWORD = 'sync smoke password 1234';

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` - ${detail}` : ''}`);
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const server = spawn(
  BIN,
  [
    'serve',
    '--plain-http',
    '--port',
    String(PORT),
    '--test-cost',
    '--host-token',
    TOKEN,
    '--password-env',
    'HEAT3D_SMOKE_PW',
    '--allow-origin',
    new URL(APP).origin,
    '--max-per-addr',
    '16',
    '--state-dir',
    mkdtempSync(join(tmpdir(), 'heat3d-sync-smoke-')),
    '--name',
    'Sync',
  ],
  {
    env: { ...process.env, HEAT3D_SMOKE_PW: PASSWORD },
    stdio: ['ignore', 'pipe', 'pipe'],
  },
);
server.stderr.on('data', () => {});
for (let i = 0; i < 100; i++) {
  try {
    if ((await fetch(`${SERVER}/session.json`)).ok) break;
  } catch {
    /* not up yet */
  }
  await wait(100);
}

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const errors = [];
async function open(label, hash = '') {
  const ctx = await browser.newContext({
    viewport: { width: 640, height: 420 },
  });
  const page = await ctx.newPage();
  for (const r of ['figure-pack', 'model-pack', 'unit-catalogs']) await ctx.route(`**/__heat3d/${r}*`, (x) => x.fulfill({ status: 204, body: '' }));
  page.on('pageerror', (e) => errors.push(`${label}: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/WebSocket connection to .* failed|Failed to load resource/.test(m.text())) errors.push(`${label}: ${m.text()}`);
  });
  await page.goto(`${APP}?backend=webgl2&session=${encodeURIComponent(SERVER)}${hash}`, { waitUntil: 'commit', timeout: 180_000 });
  await page.waitForFunction(() => !!window.__heat3dSession?.marks && !!window.__3dheat_engine && !!window.__3dheat, null, { timeout: 600_000 });
  return { label, page };
}
const S = (v, fn, arg) => v.page.evaluate(fn, arg);
const ss = (v) => S(v, () => window.__heat3dSession.store.getState());
async function until(v, pred, ms = 8000) {
  const end = Date.now() + ms;
  let last;
  while (Date.now() < end) {
    last = await S(v, pred);
    if (last) return last;
    await wait(150);
  }
  return last;
}
const shot = async (v, name) =>
  SHOTS && v.page.screenshot({ path: join(SHOTS, `${name}.png`), timeout: 90_000 }).catch((e) => console.log(`(no screenshot ${name}: ${String(e.message).slice(0, 80)})`));

/** The demo table, through the real ingest worker. */
async function loadData(v) {
  await S(v, async () => {
    const { loader } = await window.__3dheat.modules['data/loader']();
    const { autoMap } = await import('/src/data/automap.ts');
    const units = await window.__3dheat.modules['ui/replay/units']();
    const blob = await (await fetch('/tools/.shots/demo/tanks.parquet')).blob();
    const f = new File([blob], 'tanks.parquet');
    const p = await loader.preview(f);
    const mapping = autoMap({
      columns: p.columns,
      rows: p.rows,
      numeric: p.numeric,
      logicalTypes: p.logicalTypes,
      hints: p.hints,
      constant: p.constant,
      fileCount: 1,
    });
    const size = await loader.measure([f]);
    const ds = await loader.ingest([f], mapping, p.columns, f.name, 1, size.rows);
    await units.prepareUnits(ds);
    window.__3dheat.useStore.getState().setDataset(ds);
  });
}

// ------------------------------------------------------------ join
const host = await open('host', `#host=${TOKEN}`);
await until(host, () => window.__heat3dSession.store.getState().state === 'joined');
const m1 = await open('m1');
const m2 = await open('m2');
const all = [host, m1, m2];
await Promise.all(all.map(loadData));
for (const [v, name, role] of [
  [m1, 'Anna', 'draw'],
  [m2, 'Ben', 'elevated'],
]) {
  await S(v, ({ url, name, password }) => window.__heat3dSession.client.join({ url, name, password }), { url: SERVER, name, password: PASSWORD });
  const id = await until(v, () => window.__heat3dSession.store.getState().me);
  await S(host, ({ id, role }) => window.__heat3dSession.client.admin('admit', id, { role }), { id, role });
  await until(v, () => window.__heat3dSession.store.getState().state === 'joined');
  v.me = (await ss(v)).me;
  v.name = name;
}
host.me = (await ss(host)).me;
// The members took the host's view on joining; what follows are changes.
await wait(3000);
// Full sync moves the members' cameras with the host's.
await S(host, () => window.__3dheat_engine.setCameraPose({ x: 77, y: 40, z: -33 }, { x: 0, y: -0.5, z: -1 }));
await wait(3000);
{
  const cs = await Promise.all([m1, m2].map((v) => S(v, () => window.__3dheat_engine.cameraPose().position)));
  check(
    "full sync is on by default and moves the members' cameras with the host's",
    cs.every((c) => Math.hypot(c.x - 77, c.y - 40, c.z + 33) < 2),
    JSON.stringify(cs),
  );
  // Stopping it on the follow bar is a visible opt-out: the panel's box goes off.
  await m2.page.locator('.session-follow-bar .icon-btn').click();
  await wait(500);
  const s2 = await ss(m2);
  check('stopping the camera of full sync turns that part off, visibly', s2.followPeer === null && s2.sync.on && !s2.sync.camera, JSON.stringify(s2.sync));
  await S(m1, () => window.__heat3dSession.client.setSync({ camera: false }));
}
check('host and two members joined', (await ss(host)).members.filter((m) => m.connected).length === 3);
check('sync is on by default for members', (await ss(m1)).sync.on && (await ss(m2)).sync.on);

const get = (v, path) =>
  S(
    v,
    (path) => {
      const st = window.__3dheat.useStore.getState();
      return path.split('.').reduce((o, k) => (o == null ? o : o[k]), st);
    },
    path,
  );
const setStore = (v, fn, arg) => S(v, new Function('arg', `return (${fn})(window.__3dheat.useStore.getState(), arg)`), arg);
const mods = (v, name, fn, arg) => S(v, async ([name, src, arg]) => new Function('m', 'arg', `return (${src})(m, arg)`)(await window.__3dheat.modules[name](), arg), [name, fn.toString(), arg]);

// Joining took the host's view: the host had a radius of its own before the members came.
await setStore(host, (s) => s.patchHeat({ radius: 7.5 }));
await wait(1500);
await S(host, () => 0);
// Members: the host's change waits for their answer.
let p1 = await until(m1, () => window.__heat3dSession.store.getState().syncPending);
check("the host's change is asked about", !!p1 && (await get(m1, 'heat.radius')) !== 7.5, JSON.stringify(p1));
await shot(m1, 'host-change-prompt');
await m1.page.getByRole('button', { name: 'Apply too' }).click();
await wait(400);
check('"Apply too" takes it', (await get(m1, 'heat.radius')) === 7.5);
await m2.page.getByRole('button', { name: 'Ignore', exact: true }).click();
await wait(400);
const r2 = await get(m2, 'heat.radius');
check('"Ignore" keeps one\'s own', r2 !== 7.5, `radius ${r2}`);

// A member's change goes to everyone without a question.
await setStore(m1, (s) => s.setMode('heat-lines'));
await wait(1500);
check(
  "a member's change reaches the host and the other member",
  (await get(host, 'mode')) === 'heat-lines' && (await get(m2, 'mode')) === 'heat-lines',
  `${await get(host, 'mode')} ${await get(m2, 'mode')}`,
);
const applied = await ss(m2);
check('it says who changed what, with a way back', !!applied.syncApplied && applied.syncBack, JSON.stringify(applied.syncApplied));
await shot(m2, 'member-change-note');
await S(m2, () => window.__heat3dSession.client.syncBack());
await wait(800);
check('"Back to my previous view" puts one\'s own back, for oneself only', (await get(m2, 'mode')) !== 'heat-lines' && (await get(host, 'mode')) === 'heat-lines', `${await get(m2, 'mode')}`);

// "Ignore all from now on": out of sync, own view kept both ways.
await setStore(host, (s) => s.patchHeat({ radius: 9 }));
await until(m2, () => window.__heat3dSession.store.getState().syncPending);
await m2.page.getByRole('button', { name: 'Ignore all from now on' }).click();
await wait(300);
check('"Ignore all from now on" turns sync off', !(await ss(m2)).sync.on);
await setStore(host, (s) => s.setMode('heat-teams'));
await setStore(m2, (s) => s.patchHeat({ radius: 3.25 }));
await wait(1500);
check(
  "out of sync: the host's changes do not reach it, and its own reach nobody",
  (await get(m2, 'mode')) !== 'heat-teams' && (await get(host, 'heat.radius')) !== 3.25 && (await get(m1, 'heat.radius')) !== 3.25,
);
// On again: the session's view.
await S(m2, () => window.__heat3dSession.client.setSync({ on: true, askHost: false }));
await S(m1, () => window.__heat3dSession.client.setSync({ askHost: false }));
await wait(3500);
check("turned on again, it takes the session's view", (await get(m2, 'mode')) === 'heat-teams', await get(m2, 'mode'));

// ------------------------------------------------------------ every mode and workspace
const same = async (label, read) => {
  // Software GL on a busy machine: a frame can take a second; wait until they agree, up to 10 s.
  let vals;
  let ok = false;
  const end = Date.now() + 10_000;
  await wait(400);
  while (!ok && Date.now() < end) {
    vals = await Promise.all(all.map((v) => read(v)));
    ok = vals.every((x) => JSON.stringify(x) === JSON.stringify(vals[0]));
    if (!ok) await wait(400);
  }
  check(`${label} reaches everyone`, ok, JSON.stringify(vals));
  if (!ok) for (const v of all) console.log(`  ${v.label}: ${(await S(v, () => window.__heat3dSession.client.view.events.slice(-6))).join(' | ')}`);
};
// 'team' on the heatmap tab is the figure overlay (the picked matches' figures over each other).
for (const mode of ['heat-simple', 'heat-difference', 'heat-teams', 'heat-lines', 'team']) {
  await setStore(m1, (s, m) => s.setMode(m), mode);
  await same(`mode ${mode}`, (v) => get(v, 'mode'));
}
await setStore(m2, (s) => s.patchHeat({ radius: 4.5, saturation: 0.6, followExposure: false }));
await same('heat settings', (v) =>
  S(v, () => {
    const h = window.__3dheat.useStore.getState().heat;
    return [h.radius, h.followExposure];
  }),
);
await setStore(host, (s) => s.setMode('heat-difference'));
await setStore(host, (s) => s.setTeamSplit([1], [0]));
await same('difference sides', (v) => S(v, () => [window.__3dheat.useStore.getState().positiveTeams, window.__3dheat.useStore.getState().negativeTeams]));
await setStore(m1, (s) => s.setMode('team'));
await setStore(m1, (s) => s.patchTeam({ figures: !s.team.figures, figureScale: 2 }));
await same('figure overlay settings', (v) => S(v, () => [window.__3dheat.useStore.getState().team.figures, window.__3dheat.useStore.getState().team.figureScale]));
await setStore(m2, (s) => s.toggleTeam(0, false));
await same('a team hidden', (v) => S(v, () => window.__3dheat.useStore.getState().teamVisibility[0] === false));
await setStore(m2, (s) => s.toggleTeam(0, true));
await setStore(host, (s) => {
  s.setMode('heat-lines');
  s.patchLines({ view: 'teams' });
});
await same('lines settings', (v) => get(v, 'lines.view'));
const col = await S(host, () => window.__3dheat.useStore.getState().dataset.attrs.find((a) => a.categories?.length > 1)?.name ?? null);
if (col) {
  await setStore(m1, (s, c) => s.setFilters([{ kind: 'categories', column: c, allowed: [0] }]), col);
  await same('a filter (by name)', (v) => S(v, () => JSON.stringify(window.__3dheat.useStore.getState().filters)));
  await setStore(m1, (s) => s.setFilters([]));
}
for (const tab of ['race', 'match', 'plan', 'vehicle', 'heat']) {
  await mods(m2, 'state/raceStore', (m, t) => m.useRaceStore.getState().setTab(t), tab);
  await same(`workspace ${tab}`, (v) => mods(v, 'state/raceStore', (m) => m.useRaceStore.getState().tab));
}
await mods(m1, 'state/raceStore', (m) => m.useRaceStore.getState().patchView({ charts: !m.useRaceStore.getState().view.charts }));
await same('race view settings', (v) => mods(v, 'state/raceStore', (m) => m.useRaceStore.getState().view.charts));
await mods(host, 'state/matchStore', (m) => m.useMatchStore.getState().setRound(2));
await same('match round', (v) => mods(v, 'state/matchStore', (m) => m.useMatchStore.getState().round));
await mods(m2, 'state/vehicleStore', (m) =>
  m.useVehicleStore.getState().patch({
    layer: 'penetrations',
    showArrows: !m.useVehicleStore.getState().showArrows,
  }),
);
await same('vehicle view settings', (v) => mods(v, 'state/vehicleStore', (m) => [m.useVehicleStore.getState().layer, m.useVehicleStore.getState().showArrows]));
await S(m1, () => window.__heat3dSession.plan.getState().routesActiveOnly);
await S(m1, () =>
  window.__heat3dSession.plan.setState((s) => ({
    routesActiveOnly: !s.routesActiveOnly,
  })),
);
await same('tactics board view', (v) => S(v, () => window.__heat3dSession.plan.getState().routesActiveOnly));
await S(host, () => window.__heat3dSession.replay?.getState?.());
await mods(m2, 'state/replayStore', (m) => m.useReplayStore.getState().setOverlay({ colour: 'group' }));
await same('replay display (figure overlay colours)', (v) => mods(v, 'state/replayStore', (m) => m.useReplayStore.getState().overlay.colour));

// ------------------------------------------------------------ playback
await setStore(m1, (s) => {
  s.setMode('team');
  s.patchTimeline({ mode: 'play', speed: 4 });
  s.seek(20);
  s.setPlaying(true);
});
await wait(2500);
const ph = async () =>
  Promise.all(all.map((v) => S(v, () => [window.__3dheat_engine.live.playhead, window.__3dheat.useStore.getState().timeline.playing, window.__3dheat.useStore.getState().timeline.speed])));
let t = await ph();
const spread = (xs) => Math.max(...xs.map((x) => x[0])) - Math.min(...xs.map((x) => x[0]));
check(
  'play reaches everyone with its speed',
  t.every((x) => x[1] && x[2] === 4),
  JSON.stringify(t),
);
check('playing, everyone is at the same moment', spread(t) < 1.2, `spread ${spread(t).toFixed(2)} s at speed 4: ${t.map((x) => x[0].toFixed(1)).join(' ')}`);
await setStore(host, (s) => s.seek(5));
await wait(1500);
t = await ph();
check('a seek while playing reaches everyone', spread(t) < 1.2 && t.every((x) => x[0] < 20), t.map((x) => x[0].toFixed(1)).join(' '));
await setStore(m2, (s) => s.setPlaying(false));
await wait(1500);
t = await ph();
check('pause reaches everyone, at the same moment', t.every((x) => !x[1]) && spread(t) < 0.6, t.map((x) => `${x[0].toFixed(2)} ${x[1]}`).join(' | '));
await setStore(m1, (s) => s.seek(12.5));
await wait(1200);
t = await ph();
check(
  'a seek while paused reaches everyone',
  t.every((x) => Math.abs(x[0] - 12.5) < 0.05),
  t.map((x) => x[0].toFixed(2)).join(' '),
);

// ------------------------------------------------------------ pointer
await setStore(host, (s) => s.setMode('heat-simple'));
await wait(1200);
await S(m1, () => window.__3dheat_engine.frameDataset?.(true));
await wait(1500);
const box = await S(m1, () => {
  const r = window.__3dheat_engine.canvas.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
});
for (let i = 0; i < 6; i++) {
  await m1.page.mouse.move(box.x + box.width * (0.7 + i * 0.01), box.y + box.height * 0.3);
  await wait(120);
}
await wait(800);
const cur = await S(host, (id) => window.__heat3dSession.presence.get(id)?.cursor ?? null, m1.me);
const ring = await S(host, () => [...document.querySelectorAll('.peer-ring')].map((e) => e.getAttribute('d') ?? '').find((d) => d.length > 20) ?? '');
if (!cur)
  console.log(
    '  under the mouse:',
    await S(
      m1,
      ([x, y]) => {
        const e = document.elementFromPoint(x, y);
        return `${e?.tagName}.${e?.className} canvas=${e === window.__3dheat_engine.canvas}`;
      },
      [box.x + box.width * 0.75, box.y + box.height * 0.3],
    ),
    'pointAt:',
    JSON.stringify(await S(m1, ([x, y]) => window.__3dheat_engine.pointAt(x, y), [box.width * 0.75, box.height * 0.3])),
  );
check('the pointer is a point in the world, drawn as a ring where it hit', !!cur && [cur.x, cur.y, cur.z].every(Number.isFinite) && ring.length > 20, JSON.stringify(cur));
await shot(host, 'pointer-3d');

// ------------------------------------------------------------ marks
const pins = (v) =>
  S(v, () =>
    window.__heat3dSession.marks
      .getState()
      .doc.pins.map((p) => p.text)
      .sort()
      .join(','),
  );
for (const v of all)
  for (const k of [1, 2]) await S(v, (txt) => window.__heat3dSession.marks.getState().addPin({ x: Math.random() * 50, y: 0, z: 2 }, txt, txt, window.__heat3dSession.browserKey()), `${v.label}-${k}`);
await wait(1500);
check(
  "everyone sees everyone's notes",
  (await Promise.all(all.map(pins))).every((x) => x === 'host-1,host-2,m1-1,m1-2,m2-1,m2-2'),
);
await m1.page.click('.session-btn').catch(() => undefined);
await S(m1, () => window.__heat3dSession.store.getState().setPanel(true));
await m1.page.getByRole('button', { name: 'Erase mine' }).click();
await wait(1500);
check(
  '"Erase mine" reaches everyone',
  (await Promise.all(all.map(pins))).every((x) => x === 'host-1,host-2,m2-1,m2-2'),
  (await Promise.all(all.map(pins))).join(' | '),
);
await S(host, () => window.__heat3dSession.store.getState().setPanel(true));
await host.page.getByRole('button', { name: 'Erase all' }).click();
await host.page
  .getByRole('button', { name: 'Erase all' })
  .last()
  .click()
  .catch(() => undefined);
await wait(1500);
let p = await Promise.all(all.map(pins));
check(
  '"Erase all" clears everyone\'s, for everyone',
  p.every((x) => x === ''),
  p.join(' | '),
);
await wait(4000);
p = await Promise.all(all.map(pins));
check(
  'erased notes do not come back',
  p.every((x) => x === ''),
  p.join(' | '),
);
await S(host, () => window.__heat3dSession.store.getState().setPanel(false));
await S(m1, () => window.__heat3dSession.store.getState().setPanel(false));

// ------------------------------------------------------------ follow
const pos = (v) => S(v, () => window.__3dheat_engine.cameraPose());
await S(host, () => window.__heat3dSession.client.setFollow('follow', 0));
await until(m1, () => window.__heat3dSession.store.getState().followAsk !== null);
check('"follow me" is asked, not forced', (await ss(m1)).followAsk === host.me && (await ss(m1)).followPeer === null);
await shot(m1, 'follow-request');
await m1.page.getByRole('button', { name: 'Follow', exact: true }).click();
await until(m2, () => window.__heat3dSession.store.getState().followAsk !== null);
await m2.page.getByRole('button', { name: 'No thanks' }).first().click();
await S(host, () => window.__3dheat_engine.setCameraPose({ x: 123, y: 45, z: -67 }, { x: 0, y: -0.3, z: -1 }));
await wait(2500);
let c1 = (await pos(m1)).position;
let c2 = (await pos(m2)).position;
check('who said yes follows', Math.hypot(c1.x - 123, c1.y - 45, c1.z + 67) < 2, JSON.stringify(c1));
check('who said no does not', Math.hypot(c2.x - 123, c2.y - 45, c2.z + 67) > 5, JSON.stringify(c2));
// Free look: the member turns its camera; the place stays the host's, the look its own.
await S(m1, () => window.__3dheat_engine.setCameraPose(null, { x: 1, y: 0, z: 0 }));
await S(host, () => window.__3dheat_engine.setCameraPose({ x: 130, y: 45, z: -60 }, { x: 0, y: -0.3, z: -1 }));
await wait(2500);
const f1 = await pos(m1);
check("following, the member looks around freely from the host's place", Math.hypot(f1.position.x - 130, f1.position.z + 60) < 2 && f1.forward.x > 0.9, JSON.stringify(f1));
await shot(m1, 'following-free-look');
// The X stops it, and it stays stopped.
await m1.page.locator('.session-follow-bar .icon-btn').click();
await wait(300);
await S(host, () => window.__3dheat_engine.setCameraPose({ x: 300, y: 45, z: 300 }, null));
await S(host, () => window.__heat3dSession.client.setFollow('follow', 0));
await wait(2000);
c1 = (await pos(m1)).position;
check('the X stops following, and it does not start again', (await ss(m1)).followPeer === null && Math.hypot(c1.x - 300, c1.z - 300) > 5 && (await ss(m1)).followAsk === null, JSON.stringify(c1));
// The host lets everyone go.
await S(m2, (id) => window.__heat3dSession.client.followMember(id), host.me);
await wait(500);
await S(host, () => window.__heat3dSession.client.releaseFollowers());
await wait(800);
check('the host lets everyone go', (await ss(m2)).followPeer === null && (await ss(m2)).follow.mode === 'off');
// "Look where I look" is a request card too.
await S(m2, () => window.__heat3dSession.client.lookHere({ note: 'here' }));
check('"look where I look" arrives as a request', !!(await until(host, () => window.__heat3dSession.store.getState().looks.length > 0)));

// ------------------------------------------------------------ the eye
await S(m1, () => window.__heat3dSession.client.setSync({ on: false }));
await setStore(m1, (s) => {
  s.setMode('heat-teams');
  s.patchHeat({ radius: 11 });
});
await S(m2, () => window.__heat3dSession.client.setSync({ on: false }));
await setStore(m2, (s) => s.setMode('heat-simple'));
await S(m1, () => window.__3dheat_engine.setCameraPose({ x: -40, y: 80, z: 40 }, { x: 0, y: -1, z: 0.01 }));
await wait(800);
const before = await pos(m2);
await S(m2, () => window.__heat3dSession.store.getState().setPanel(true));
await m2.page.getByRole('button', { name: 'See what Anna sees' }).click();
await wait(2500);
const peekPos = (await pos(m2)).position;
check("the eye shows the member's view and settings", (await get(m2, 'mode')) === 'heat-teams' && (await get(m2, 'heat.radius')) === 11, `${await get(m2, 'mode')} ${await get(m2, 'heat.radius')}`);
check("the eye shows the member's camera", Math.hypot(peekPos.x + 40, peekPos.y - 80, peekPos.z - 40) < 2, JSON.stringify(peekPos));
await shot(m2, 'peek');
await setStore(m1, (s) => s.setMode('heat-lines'));
await wait(1500);
check('while looking, their changes come too', (await get(m2, 'mode')) === 'heat-lines');
await m2.page.locator('.session-peek-bar button').click();
await wait(1200);
const after = await pos(m2);
check(
  '"Back to my view" brings one\'s own view and camera back',
  (await get(m2, 'mode')) === 'heat-simple' && Math.hypot(after.position.x - before.position.x, after.position.z - before.position.z) < 1,
  `${await get(m2, 'mode')} ${JSON.stringify(after.position)}`,
);

// ------------------------------------------------------------ notes, analyses, volumes, bookmarks
await S(m1, () => window.__heat3dSession.client.setSync({ on: true }));
await S(m2, () => window.__heat3dSession.client.setSync({ on: true }));
const notes = (v, name, fn, arg) => mods(v, 'notes/store', fn, arg);
// Editing someone else's analysis takes the elevated role (a draw-only member edits their own): Anna gets it for this.
await S(host, (id) => window.__heat3dSession.client.admin('setRole', id, { role: 'elevated' }), m1.me);
await until(m1, () => window.__heat3dSession.store.getState().role === 'elevated');
const docId = await notes(host, 'notes/store', (m) => m.useNotes.getState().addDoc('Plan', 'Alpha.\n\nBravo.\n\nCharlie.').id);
await wait(2000);
const bodies = () => Promise.all(all.map((v) => notes(v, 'notes/store', (m, id) => m.useNotes.getState().book.docs.find((d) => d.id === id)?.body ?? null, docId)));
check(
  'a written analysis reaches everyone',
  (await bodies()).every((b) => b === 'Alpha.\n\nBravo.\n\nCharlie.'),
);
// Two type at once, in different places, from the same text: both keep their words.
await Promise.all([
  notes(m1, 'notes/store', (m, id) => m.useNotes.getState().updateDoc(id, { body: 'Alpha one.\n\nBravo.\n\nCharlie.' }), docId),
  notes(m2, 'notes/store', (m, id) => m.useNotes.getState().updateDoc(id, { body: 'Alpha.\n\nBravo.\n\nCharlie two.' }), docId),
]);
await notes(host, 'notes/store', (m, id) => m.useNotes.getState().updateDoc(id, { body: 'Alpha.\n\nBravo three.\n\nCharlie.' }), docId);
let bs;
for (let i = 0; i < 20; i++) {
  await wait(500);
  bs = await bodies();
  if (bs.every((b) => b === bs[0])) break;
}
check(
  'several typing at once: everyone ends with the same text',
  bs.every((b) => b === bs[0]),
  JSON.stringify(bs),
);
check(
  "several typing at once: no one's words are lost",
  ['one', 'two', 'three'].every((w) => bs[0].includes(w)),
  JSON.stringify(bs[0]),
);
// A late joiner (here: the server's copy, which the host corrects) has the merged text too.
await wait(1500);
const onServer = await fetch(`${SERVER}/api/docs`, {
  headers: { authorization: `Bearer ${TOKEN}` },
})
  .then((r) => (r.ok ? r.text() : ''))
  .catch(() => '');
check(
  "the server's copy has everyone's words (for who joins later)",
  onServer.includes('Alpha one') && onServer.includes('Charlie two') && onServer.includes('Bravo three'),
  onServer ? onServer.slice(0, 300) : 'not readable',
);
// Private and shared notes: a private one stays, one click shares it.
const noteId = await notes(
  m1,
  'notes/store',
  (m) =>
    m.useNotes.getState().addNote({
      title: 'mine',
      text: 'secret',
      tags: [],
      color: '#fc0',
      anchor: { kind: 'match', id: 'demo' },
      private: true,
    }).id,
);
await wait(1500);
const hasNote = () => Promise.all([host, m2].map((v) => notes(v, 'notes/store', (m, id) => m.useNotes.getState().book.notes.some((n) => n.id === id), noteId)));
check(
  'a private note stays with its writer',
  (await hasNote()).every((x) => !x),
);
await notes(m1, 'notes/store', (m, id) => m.useNotes.getState().updateNote(id, { private: undefined }), noteId);
await wait(1500);
check(
  'one click shares it with everyone',
  (await hasNote()).every((x) => x),
);
// Volumes and bookmarks.
await mods(m2, 'volumes/store', (m) => m.useVolumeStore.getState().add({ kind: 'sphere', center: [0, 0, 0], radius: 25 }, 'Shared volume'));
await same('a volume', (v) =>
  mods(v, 'volumes/store', (m) =>
    m.useVolumeStore
      .getState()
      .volumes.map((x) => x.name)
      .join(','),
  ),
);
await mods(host, 'ui/replay/bookmarks', (m) =>
  m.useBookmarkStore.getState().add({
    time: 3,
    label: 'Here',
    camera: { p: [0, 10, 0], f: [0, 0, -1] },
    follow: null,
    target: null,
  }),
);
await same('a bookmark', (v) =>
  mods(v, 'ui/replay/bookmarks', (m) =>
    m.useBookmarkStore
      .getState()
      .list.map((b) => b.label)
      .join(','),
  ),
);

check('no page errors', errors.length === 0, errors.slice(0, 4).join(' | '));
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
await browser.close();
server.kill();
process.exit(failed ? 1 : 0);
