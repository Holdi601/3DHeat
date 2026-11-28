/**
 * Multiplayer smoke test: a real session server (`3dheat serve`) and 2 to
 * 20 headless viewers in their own browser contexts. The host joins by its
 * token; the others by password, through the waiting room, and are let in
 * with every role in turn. Then every role tries every action - marks,
 * erasing another's, the tactics board, look here, follow, mute, invites,
 * settings, kicking the host, promoting itself - and the test checks the
 * server allowed exactly what the role may. Also: presence, follow and
 * enforced camera, the look-here limit, reconnect with an edit made while
 * away, leave and rejoin, kick, ban and unban, a late joiner catching up,
 * a wrong password, the origin check, and that everyone ends with the same
 * state.
 *
 *   node tools/smoke-session.mjs [clients=6] [--proxy]
 *
 * With `--proxy` the members join through a reverse proxy on this machine
 * (tools/proxy-chain.mjs: each member its own client address), as a public
 * session's would; the host stays on the server itself. The server trusts
 * only that proxy, allows 3 members per address (the default), and must
 * tell each member by the address the proxy names.
 *
 * Needs the dev server (APP, default http://127.0.0.1:5275/) and the server
 * binary (HEAT3D_SERVE_BIN, default the release build in
 * E:/cargo-targets/3dheat, the native workspace's). Software GL: a correctness test, not a
 * performance one (that is tools/probe-session-perf.mjs).
 */
import { chromium } from 'playwright';
import { execFileSync, spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join as joinPath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startProxy } from './proxy-chain.mjs';

const ARGS = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const PROXY = process.argv.includes('--proxy') || process.env.SMOKE_PROXY === '1';
const N = Math.max(2, Math.min(20, Number(ARGS[0] ?? process.env.CLIENTS ?? 6)));
const APP = process.env.APP ?? 'http://127.0.0.1:5275/';
const BIN = process.env.HEAT3D_SERVE_BIN ?? ['E:/cargo-targets/3dheat/release/3dheat.exe', 'E:/cargo-targets/3dheat/debug/3dheat.exe'].find(existsSync);
if (!BIN) throw new Error('no 3dheat binary: cargo build -p heat3d-server in native/, or set HEAT3D_SERVE_BIN');
// A server built before the last change to the session code or its protocol
// speaks an older protocol (one without the challenge, say): the viewers then
// wait for a message that never comes and the run fails at the host's join,
// which looks like a bug in the change under test.
{
  const root = joinPath(dirname(fileURLToPath(import.meta.url)), '..');
  let changed = 0;
  try {
    // The last commit to them, not the files' times: a fresh checkout's files are all new.
    changed = 1000 * Number(execFileSync('git', ['log', '-1', '--format=%ct', '--', 'native/crates/session/src', 'native/crates/server/src', 'native/proto/heat3d/session'], { cwd: root, encoding: 'utf8' }).trim() || 0);
  } catch {
    /* no git here: no check */
  }
  if (!process.env.HEAT3D_SERVE_BIN && statSync(BIN).mtimeMs < changed) {
    throw new Error(`${BIN} is older than the last change to the session server: rebuild it (cargo build --release -p heat3d-server in native/), or set HEAT3D_SERVE_BIN`);
  }
}
const PORT = Number(process.env.SESSION_PORT ?? 7900 + Math.floor(Math.random() * 90));
const SERVER = `http://127.0.0.1:${PORT}`;
const PROXY_PORT = Number(process.env.PROXY_PORT ?? PORT + 1);
let nextClient = 10;
/** Where a viewer reaches the session: the server itself, or the proxy at a loopback address of its own (one client each). */
const serverFor = (label) => (PROXY && label !== 'host' ? `http://127.0.0.${nextClient++}:${PROXY_PORT}` : SERVER);
const TOKEN = randomBytes(32).toString('hex');
const PASSWORD = 'smoke test password 1234';
const state = mkdtempSync(joinPath(tmpdir(), 'heat3d-session-smoke-'));

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` - ${detail}` : ''}`);
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ------------------------------------------------------------ the server
const server = spawn(
  BIN,
  [
    'serve', '--plain-http', '--port', String(PORT), '--test-cost', '--host-token', TOKEN, '--password-env', 'HEAT3D_SMOKE_PW',
    '--allow-origin', new URL(APP).origin, '--max-clients', '64', '--state-dir', state, '--name', 'Smoke',
    // Through the proxy each member is its own address: the default of 3 per address must hold for them.
    ...(PROXY ? ['--trusted-proxy', '127.0.0.1', '--max-per-addr', '3'] : ['--max-per-addr', '64']),
  ],
  { env: { ...process.env, HEAT3D_SMOKE_PW: PASSWORD }, stdio: ['ignore', 'pipe', 'pipe'] },
);
server.stderr.on('data', (d) => process.stderr.write(`[server] ${d}`));
for (let i = 0; i < 100; i++) {
  try {
    if ((await fetch(`${SERVER}/session.json`)).ok) break;
  } catch {
    /* not up yet */
  }
  await wait(100);
}
const info = await (await fetch(`${SERVER}/session.json`)).json();
check('server answers /session.json', info.app === '3dheat' && info.password === true);
const head = await fetch(`${SERVER}/session.json`);
check('security headers', /script-src 'self'/.test(head.headers.get('content-security-policy') ?? '') && head.headers.get('x-content-type-options') === 'nosniff' && head.headers.get('x-frame-options') === 'DENY');

/** A WebSocket upgrade from another site's page: refused. */
const foreign = await new Promise((resolve) => {
  const req = request({ host: '127.0.0.1', port: PORT, path: '/ws', headers: { Connection: 'Upgrade', Upgrade: 'websocket', 'Sec-WebSocket-Version': '13', 'Sec-WebSocket-Key': randomBytes(16).toString('base64'), Origin: 'http://evil.example' } });
  req.on('response', (r) => resolve(r.statusCode));
  req.on('upgrade', () => resolve(101));
  req.on('error', () => resolve(0));
  req.end();
});
check('origin check refuses another site', foreign === 403, `status ${foreign}`);
const unauth = await fetch(`${SERVER}/a/${'0'.repeat(64)}`);
check('assets need a member token', unauth.status === 401, `status ${unauth.status}`);
const loadNoToken = await fetch(`${SERVER}/api/load`, { method: 'POST', body: '{}' });
check('session load needs the host token', loadNoToken.status === 401);

// ------------------------------------------------------------ the proxy
const proxy = PROXY ? await startProxy({ upstream: SERVER, port: PROXY_PORT, hosts: Array.from({ length: N + 8 }, (_, i) => `127.0.0.${10 + i}`) }) : null;
if (PROXY) {
  const via = `http://127.0.0.${10 + N + 7}:${PROXY_PORT}`;
  const pinfo = await (await fetch(`${via}/session.json`)).json();
  check('the proxy reaches the server, which says it is public', pinfo.app === '3dheat' && pinfo.exposed === true, `exposed ${pinfo.exposed}`);
  const blocked = await Promise.all(['/api/docs', '/api/load', '/__heat3d/public'].map(async (p) => (await fetch(`${via}${p}`, { method: p === '/api/load' ? 'POST' : 'GET' })).status));
  check("the proxy keeps the host's own endpoints off the public door", blocked.every((c) => c === 403), blocked.join(','));
}

// ------------------------------------------------------------ the viewers
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const errors = [];
const missing = new Set();
const pages = [];
async function open(label, hash = '') {
  const server = serverFor(label);
  const ctx = await browser.newContext({ viewport: { width: 640, height: 400 } });
  const page = await ctx.newPage();
  // This machine's own figure and model packs are not part of the test (the routes answer 404 without them).
  for (const r of ['figure-pack', 'model-pack', 'unit-catalogs']) await ctx.route(`**/__heat3d/${r}*`, (x) => x.fulfill({ status: 204, body: '' }));
  page.on('pageerror', (e) => errors.push(`${label}: ${e.message}`));
  page.on('response', (r) => r.status() >= 400 && missing.add(`${r.status()} ${new URL(r.url()).pathname}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/WebSocket connection to .* failed/.test(m.text())) errors.push(`${label}: ${m.text()}`);
  });
  await page.goto(`${APP}?backend=webgl2&session=${encodeURIComponent(server)}${hash}`, { waitUntil: 'commit', timeout: 180_000 });
  // A cold dev server on a busy machine takes minutes for the first page.
  await page.waitForFunction(() => !!window.__heat3dSession?.marks && !!window.__3dheat_engine, null, { timeout: 600_000 });
  const v = { label, page, ctx, server };
  pages.push(v);
  return v;
}
const S = (v, fn, arg) => v.page.evaluate(fn, arg);
const st = (v) => S(v, () => { const s = window.__heat3dSession.store.getState(); return { state: s.state, me: s.me, role: s.role, error: s.error, members: s.members, follow: s.follow, looks: s.looks.map((l) => l.fromName), waiting: s.waiting, bans: s.bans, info: s.info, lastInvite: !!s.lastInvite?.token, seq: s.seq }; });
async function until(v, pred, ms = 8000) {
  const end = Date.now() + ms;
  let last;
  while (Date.now() < end) {
    last = await st(v);
    if (pred(last)) return last;
    await wait(150);
  }
  return last;
}
const join = (v, name, password = PASSWORD) => S(v, ({ url, name, password }) => window.__heat3dSession.client.join({ url, name, password }), { url: v.server, name, password });

const host = await open('host', `#host=${TOKEN}`);
let hs = await until(host, (s) => s.state === 'joined');
check('host joins by its token', hs.state === 'joined' && hs.role === 'host');
const hostId = hs.me;
// Every "look here" the host gets, counted by who sent it (its list on screen keeps only the last few).
await S(host, () => {
  window.__lookCount = {};
  let prev = [];
  window.__heat3dSession.store.subscribe((s) => {
    for (const l of s.looks) if (!prev.some((p) => p.id === l.id)) window.__lookCount[l.fromName] = (window.__lookCount[l.fromName] ?? 0) + 1;
    prev = s.looks;
  });
});

const ROLES = ['viewer', 'draw', 'elevated', 'admin'];
const clients = [];
for (let i = 1; i < N; i++) {
  const v = await open(`c${i}`);
  v.name = `client${i}`;
  v.role = ROLES[(i - 1) % ROLES.length];
  if (i === 1) {
    // One through the panel itself.
    await v.page.click('.session-btn');
    await v.page.fill('.session-join input:not([type=password]) >> nth=1', v.name);
    await v.page.fill('.session-join input[type=password]', PASSWORD);
    await v.page.click('.session-join button[type=submit]');
  } else await join(v, v.name);
  clients.push(v);
}
for (const v of clients) {
  const s = await until(v, (s) => s.state === 'waiting');
  v.waitId = s.me;
}
check('everyone else waits in the waiting room', clients.every((v) => v.waitId), clients.filter((v) => !v.waitId).map((v) => v.label).join(','));
hs = await until(host, (s) => s.waiting.length === clients.length);
check('the host sees the waiting room', hs.waiting.length === clients.length, `${hs.waiting.length}/${clients.length}`);
for (const v of clients) await S(host, ({ id, role }) => window.__heat3dSession.client.admin('admit', id, { role }), { id: v.waitId, role: v.role });
for (const v of clients) {
  const s = await until(v, (s) => s.state === 'joined');
  v.me = s.me;
  check(`${v.label} let in as ${v.role}`, s.state === 'joined' && s.role === v.role, `${s.state} ${s.role}`);
}
hs = await until(host, (s) => s.members.filter((m) => m.connected).length === N);
check(`the roster has all ${N}`, hs.members.filter((m) => m.connected).length === N);

// Presence: everyone's camera reaches the host.
await wait(2500);
const seen = await S(host, () => window.__heat3dSession.presence.size);
check('presence of every member reaches the host', seen === N - 1, `${seen}/${N - 1}`);

// ------------------------------------------------------------ the matrix
const rank = (r) => ['viewer', 'draw', 'elevated', 'admin', 'host'].indexOf(r) + 1;
const actors = [{ ...host, role: 'host', name: 'Host', me: hostId }, ...ROLES.map((r) => clients.find((c) => c.role === r)).filter(Boolean)];
const observer = clients.find((c) => c.role === 'viewer') ?? host;
const victim = N >= 6 ? clients[clients.length - 1] : null;
const pinsOf = (v) => S(v, () => window.__heat3dSession.marks.getState().doc.pins.map((p) => p.id));
const planIds = (v, coll) => S(v, (coll) => window.__heat3dSession.plan.getState().plan[coll].map((x) => x.id), coll);
const addPin = (v, id) => S(v, ({ id, name }) => {
  const m = window.__heat3dSession.marks;
  const key = localStorage.getItem('heat3d.session.key') ?? '';
  m.setState((s) => ({ doc: { ...s.doc, pins: [...s.doc.pins, { id, at: { x: 1, y: 0, z: 2 }, text: id, color: [1, 1, 0], author: name, key, created: Date.now() }] } }));
}, { id, name: v.name });
const addTo = (v, coll, value) => S(v, ({ coll, value }) => {
  const p = window.__heat3dSession.plan;
  p.setState((s) => ({ plan: { ...s.plan, [coll]: [...(s.plan[coll] ?? []), value] } }));
}, { coll, value });

// The host's own pins for each role to try erasing.
for (const a of actors) await addPin(host, `hp-${a.role}`);
await wait(1200);
for (const a of actors) {
  const r = a.role;
  const mayDraw = rank(r) >= rank('draw');
  const mayElev = rank(r) >= rank('elevated');
  const mayAdmin = rank(r) >= rank('admin');
  await addPin(a, `pin-${r}`);
  await S(a, (id) => window.__heat3dSession.marks.getState().remove(id), `hp-${r}`);
  await addTo(a, 'figures', { id: `fig-${r}`, kind: 'soldier', team: 'a', label: r, keys: { 0: { x: 0, y: 0, z: 0, yaw: 0 } }, from: 0 });
  await addTo(a, 'drawings', { id: `dr-${r}`, step: 0, kind: 'stroke', points: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 1 }], color: [1, 0, 0], width: 1 });
  await S(a, (note) => window.__heat3dSession.client.lookHere({ note }), `look-${r}`);
  await S(a, (me) => window.__heat3dSession.client.setFollow('follow', me), a.me);
  if (victim) await S(a, (id) => window.__heat3dSession.client.admin('mute', id, { durationMs: 60_000 }), victim.me);
  await S(a, () => window.__heat3dSession.client.invite('draw', 1, 3_600_000, 'smoke'));
  const before = (await st(host)).info.waitingRoom;
  await S(a, (w) => window.__heat3dSession.client.settings({ waitingRoom: !w }), before);
  if (a.me !== hostId) await S(a, (id) => window.__heat3dSession.client.admin('kick', id), hostId);
  if (r !== 'host') await S(a, (me) => window.__heat3dSession.client.admin('setRole', me, { role: 'admin' }), a.me);
  await wait(1500);
  const h = await st(host);
  const o = await st(observer);
  const hp = await pinsOf(host);
  const figs = await planIds(host, 'figures');
  const drs = await planIds(host, 'drawings');
  check(`${r}: own note ${mayDraw ? 'kept' : 'refused'}`, hp.includes(`pin-${r}`) === mayDraw);
  check(`${r}: erasing the host's note ${mayElev ? 'done' : 'refused'}`, !hp.includes(`hp-${r}`) === mayElev);
  check(`${r}: a figure on the board ${mayElev ? 'kept' : 'refused'}`, figs.includes(`fig-${r}`) === mayElev);
  check(`${r}: a drawing on the board ${mayDraw ? 'kept' : 'refused'}`, drs.includes(`dr-${r}`) === mayDraw);
  if (r !== 'host') check(`${r}: look here reaches the host`, h.looks.includes(a.name), h.looks.join(','));
  check(`${r}: follow for everyone ${mayAdmin ? 'set' : 'refused'}`, (o.follow.mode === 'follow' && o.follow.leader === a.me) === mayAdmin, JSON.stringify(o.follow));
  if (victim) {
    const vm = h.members.find((m) => m.id === victim.me);
    check(`${r}: mute ${mayAdmin ? 'done' : 'refused'}`, !!vm?.muted === mayAdmin);
    await S(host, (id) => window.__heat3dSession.client.admin('unmute', id), victim.me);
  }
  const mine = await st(a);
  check(`${r}: invite link ${mayAdmin ? 'made' : 'refused'}`, mine.lastInvite === mayAdmin);
  check(`${r}: session settings ${r === 'host' ? 'changed' : 'refused'}`, (h.info.waitingRoom !== before) === (r === 'host'));
  if (r === 'host') await S(host, (w) => window.__heat3dSession.client.settings({ waitingRoom: w }), before);
  if (a.me !== hostId) check(`${r}: kicking the host refused`, h.state === 'joined' && h.members.some((m) => m.id === hostId && m.connected));
  if (r !== 'host') check(`${r}: promoting itself refused`, h.members.find((m) => m.id === a.me)?.role === r);
  await S(host, () => window.__heat3dSession.client.setFollow('off'));
  await wait(400);
}

// The look-here limit: three a minute, the first already used.
const lv = clients.find((c) => c.role === 'viewer');
if (lv) {
  for (let i = 0; i < 4; i++) await S(lv, () => window.__heat3dSession.client.lookHere({ note: 'again' }));
  await wait(1200);
  const n = await S(host, (name) => window.__lookCount[name] ?? 0, lv.name);
  // One in the matrix, then four more: three a minute get through, the rest are refused.
  check('look here is limited to 3 a minute', n === 3, `${n} arrived`);
}

// ------------------------------------------------------------ follow: full sync, then a request, never forced
const fv = clients[0];
await S(host, () => window.__3dheat_engine.setCameraPose({ x: 123, y: 45, z: -67 }, { x: 0, y: -0.3, z: -1 }));
await wait(2500);
let cam = await S(fv, () => window.__3dheat_engine.cameraPose().position);
check("members follow the host's camera (full sync, on by default)", Math.hypot(cam.x - 123, cam.y - 45, cam.z + 67) < 2, JSON.stringify(cam));
await S(fv, () => window.__heat3dSession.client.followMember(null));
await S(host, () => window.__heat3dSession.client.setFollow('enforce', 0));
await wait(800);
await S(fv, () => window.__3dheat_engine.setCameraPose({ x: -500, y: 10, z: 500 }, null));
await wait(2500);
cam = await S(fv, () => window.__3dheat_engine.cameraPose().position);
const asked = await S(fv, () => window.__heat3dSession.store.getState().followAsk);
check('"lock" is only a request now: the member is asked and keeps its own camera', asked !== null && Math.hypot(cam.x + 500, cam.z - 500) < 2, JSON.stringify(cam));
await S(host, () => window.__heat3dSession.client.setFollow('off'));
await wait(500);

// ------------------------------------------------------------ reconnect
const rv = clients.find((c) => c.role === 'draw') ?? clients[0];
if (rank(rv.role) >= rank('draw')) {
  await S(rv, () => window.__heat3dSession.client.ws.close());
  await wait(100);
  await addPin(rv, 'while-away');
  const back = await until(rv, (s) => s.state === 'joined' && s.me === rv.me, 15_000);
  check('a dropped member comes back as the same member', back.state === 'joined' && back.me === rv.me, `${back.state} ${back.me}/${rv.me}`);
  await wait(1500);
  check('an edit made while away arrives after the reconnect', (await pinsOf(host)).includes('while-away'));
}

// ------------------------------------------------------------ leave and rejoin
const lvv = clients[clients.length - 1];
await S(lvv, () => window.__heat3dSession.client.leave());
hs = await until(host, (s) => s.members.some((m) => m.id === lvv.me && !m.connected));
check('leaving shows the member away', hs.members.some((m) => m.id === lvv.me && !m.connected));
await join(lvv, lvv.name);
let ws = await until(lvv, (s) => s.state === 'waiting');
await S(host, ({ id, role }) => window.__heat3dSession.client.admin('admit', id, { role }), { id: ws.me, role: lvv.role });
ws = await until(lvv, (s) => s.state === 'joined');
check('rejoining goes through the waiting room again', ws.state === 'joined');
lvv.me = ws.me;

// ------------------------------------------------------------ kick, ban, unban
if (victim) {
  victim.me = (await st(victim)).me;
  await S(host, (id) => window.__heat3dSession.client.admin('kick', id), victim.me);
  let vs = await until(victim, (s) => s.state === 'closed');
  check('kick closes the member\'s session', vs.state === 'closed' && vs.error === 'kicked', `${vs.state} ${vs.error}`);
  await join(victim, victim.name);
  vs = await until(victim, (s) => s.state === 'waiting');
  await S(host, ({ id }) => window.__heat3dSession.client.admin('admit', id, { role: 'viewer' }), { id: vs.me });
  vs = await until(victim, (s) => s.state === 'joined');
  await S(host, (id) => window.__heat3dSession.client.admin('ban', id, { durationMs: 60_000 }), vs.me);
  vs = await until(victim, (s) => s.state === 'closed');
  check('ban closes the member\'s session', vs.error === 'bannedNow', vs.error);
  await join(victim, victim.name);
  vs = await until(victim, (s) => s.state === 'closed' && s.error === 'banned');
  check('a banned member cannot come back', vs.error === 'banned', vs.error);
  hs = await until(host, (s) => s.bans.length > 0);
  await S(host, (id) => window.__heat3dSession.client.admin('unban', 0, { ref: id }), hs.bans[0].id);
  await wait(500);
  await join(victim, victim.name);
  vs = await until(victim, (s) => s.state === 'waiting');
  check('unbanned, the member may knock again', vs.state === 'waiting');
  await S(host, ({ id }) => window.__heat3dSession.client.admin('admit', id, { role: 'viewer' }), { id: vs.me });
  await until(victim, (s) => s.state === 'joined');
}

// ------------------------------------------------------------ a wrong password, a late joiner
const bad = await open('wrong');
await join(bad, 'Mallory', 'not the password!!');
const bs = await until(bad, (s) => s.state === 'closed');
check('a wrong password is refused', bs.error === 'badPassword', bs.error);

const late = await open('late');
await join(late, 'Late');
let ls = await until(late, (s) => s.state === 'waiting');
await S(host, ({ id }) => window.__heat3dSession.client.admin('admit', id, { role: 'viewer' }), { id: ls.me });
ls = await until(late, (s) => s.state === 'joined');
await wait(1500);
const want = JSON.stringify((await pinsOf(host)).sort());
check('a late joiner gets the whole state', JSON.stringify((await pinsOf(late)).sort()) === want && JSON.stringify((await planIds(late, 'figures')).sort()) === JSON.stringify((await planIds(host, 'figures')).sort()));

// Everyone the same at the end.
await wait(1500);
const same = [];
for (const v of [...clients, late]) if ((await st(v)).state === 'joined' && JSON.stringify((await pinsOf(v)).sort()) !== want) same.push(v.label);
check('every member ends with the same marks', same.length === 0, same.join(','));

// The session file: the host saves, a mark goes, the host opens the file again - and it is back for everyone.
{
  await S(host, () => window.__heat3dSession.store.getState().setPanel(true));
  const save = host.page.locator('.session-panel .session-sec button', { hasText: 'Save session' }).first();
  await save.scrollIntoViewIfNeeded({ timeout: 60_000 });
  const [dl] = await Promise.all([host.page.waitForEvent('download', { timeout: 120_000 }), save.click({ timeout: 60_000 })]);
  const file = joinPath(state, 'smoke.3dheat-session');
  await dl.saveAs(file);
  check('save session downloads a .3dheat-session file', dl.suggestedFilename().endsWith('.3dheat-session'), dl.suggestedFilename());
  await S(host, () => window.__heat3dSession.marks.getState().remove('pin-host'));
  await wait(1500);
  const gone = !(await pinsOf(observer)).includes('pin-host');
  // "Open session" makes its file input on the click (chooseSessionFile): the chooser it opens takes the file.
  const open = host.page.locator('.session-panel .session-sec button', { hasText: 'Open session' }).first();
  const [chooser] = await Promise.all([host.page.waitForEvent('filechooser', { timeout: 60_000 }), open.click({ timeout: 60_000 })]);
  await chooser.setFiles(file);
  await wait(2500);
  const onServer = await (await fetch(`${SERVER}/api/docs`, { headers: { Authorization: `Bearer ${TOKEN}` } })).json();
  const serverHas = (onServer.docs.marks?.colls.pins ?? []).some((p) => p.id === 'pin-host');
  const back = serverHas && (await pinsOf(observer)).includes('pin-host') && (await pinsOf(host)).includes('pin-host');
  check('opening the session file restores the shared layers for everyone', gone && back, `gone ${gone}, on the server ${serverHas}, back ${back}`);
}

if (PROXY) {
  // The server told every member by the address the proxy named, the host by its own.
  const log = readFileSync(joinPath(state, 'audit.log'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const placed = log.filter((e) => (e.event === 'waiting' || e.event === 'join') && e.addr);
  const members = placed.filter((e) => e.via !== 'host_token');
  const named = new Set(members.map((e) => e.addr));
  const viaProxy = members.length > 0 && members.every((e) => /^198\.18\.0\.\d+$/.test(e.addr)) && named.size >= N - 1;
  const hostDirect = placed.some((e) => e.via === 'host_token' && e.addr === '127.0.0.1');
  check('each member is known by the address the proxy named', viaProxy && hostDirect, `${named.size} member addresses; ${[...named].slice(0, 4).join(' ')}`);
}

check('no page errors', errors.length === 0, [...errors.slice(0, 3), ...missing].join(' | '));

await browser.close();
await proxy?.close();
server.kill();
rmSync(state, { recursive: true, force: true });
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed with ${N} viewers`);
process.exit(failed.length ? 1 : 0);
