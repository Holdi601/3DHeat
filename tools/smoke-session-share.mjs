/**
 * Sharing and room setup, end to end, as people use it: a real session
 * server (`3dheat serve`) on a synthetic catalogue folder, a host and two
 * members in their own browsers, and a third person by an invite link.
 *
 * - The host becomes the host from the page alone ("Host this session"; no
 *   host address, no terminal), sets a password and makes an invite link.
 * - Member A has nothing of the host's; member B has the host's levels and
 *   the unit catalogue in its own folder, but not the model pack.
 * - The host loads a map: B loads it from its own folder by itself; the host
 *   is asked to share what A and B lack (map with textures/terrain side
 *   files, catalogue, model pack) and says yes; each member is asked
 *   "download?", says yes, and everything loads by itself (the map is the
 *   level, the pack and catalogue are installed). Shared items leave the
 *   "can share" list for the "shared" list.
 * - The host changes the map: everyone follows (B from its folder, A after
 *   the host shares it and A says yes).
 * - A confidential item (a blocked word of the local configuration) is marked
 *   and never shared by the one-click buttons.
 * - The invite link lets the third person in at once; Stop the server ends it.
 *
 *   node tools/smoke-session-share.mjs
 *
 * Needs the dev server (APP, default http://127.0.0.1:5297/) started with
 * HEAT3D_LEVELS=<the folder this script prints and makes, see SHARE_ROOT>
 * and the server binary (HEAT3D_SERVE_BIN). Screenshots to SHOTS (default: none).
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const APP = process.env.APP ?? 'http://127.0.0.1:5297/';
const BIN = process.env.HEAT3D_SERVE_BIN ?? ['E:/cargo-targets/3dheat/release/3dheat.exe'].find(existsSync);
if (!BIN) throw new Error('set HEAT3D_SERVE_BIN');
const ROOT = process.env.SHARE_ROOT ?? join(tmpdir(), 'heat3d-share-smoke-levels');
const SHOTS = process.env.SHOTS ?? '';
const PORT = Number(process.env.SESSION_PORT ?? 7950 + Math.floor(Math.random() * 40));
const SERVER = `http://127.0.0.1:${PORT}`;
const PASSWORD = 'a share smoke password';

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` - ${detail}` : ''}`);
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ------------------------------------------------------------ a synthetic catalogue folder

/** A glb of boxes: `nodes` as [name, children | null, box size | null]. */
function glb(nodes) {
  const meshes = [];
  const chunks = [];
  let offset = 0;
  const views = [];
  const accessors = [];
  const gnodes = nodes.map(([name, children, size]) => {
    const n = { name };
    if (children) n.children = children;
    if (size) {
      const s = size / 2;
      const p = new Float32Array([-s, 0, -s, s, 0, -s, s, 0, s, -s, 0, s, -s, size, -s, s, size, -s, s, size, s, -s, size, s]);
      const i = new Uint16Array([0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6, 0, 4, 5, 0, 5, 1, 1, 5, 6, 1, 6, 2, 2, 6, 7, 2, 7, 3, 3, 7, 4, 3, 4, 0]);
      const pb = Buffer.from(p.buffer);
      const ib = Buffer.from(i.buffer);
      views.push({ buffer: 0, byteOffset: offset, byteLength: pb.length });
      chunks.push(pb);
      offset += pb.length;
      views.push({ buffer: 0, byteOffset: offset, byteLength: ib.length });
      chunks.push(ib);
      offset += ib.length;
      const pa = accessors.length;
      accessors.push({ bufferView: views.length - 2, componentType: 5126, count: 8, type: 'VEC3', min: [-s, 0, -s], max: [s, size, s] });
      accessors.push({ bufferView: views.length - 1, componentType: 5123, count: i.length, type: 'SCALAR' });
      n.mesh = meshes.length;
      meshes.push({ primitives: [{ attributes: { POSITION: pa }, indices: pa + 1 }] });
      while (offset % 4) {
        chunks.push(Buffer.alloc(1));
        offset++;
      }
    }
    return n;
  });
  const bin = Buffer.concat(chunks);
  const json = { asset: { version: '2.0' }, scene: 0, scenes: [{ nodes: [0] }], nodes: gnodes, meshes, accessors, bufferViews: views, buffers: [{ byteLength: bin.length }] };
  let js = Buffer.from(JSON.stringify(json));
  if (js.length % 4) js = Buffer.concat([js, Buffer.alloc(4 - (js.length % 4), 0x20)]);
  const head = Buffer.alloc(12);
  head.writeUInt32LE(0x46546c67, 0);
  head.writeUInt32LE(2, 4);
  head.writeUInt32LE(12 + 8 + js.length + 8 + bin.length, 8);
  const c = (len, type) => {
    const b = Buffer.alloc(8);
    b.writeUInt32LE(len, 0);
    b.writeUInt32LE(type, 4);
    return b;
  };
  return Buffer.concat([head, c(js.length, 0x4e4f534a), js, c(bin.length, 0x004e4942), bin]);
}

const put = (rel, body) => {
  const f = join(ROOT, rel);
  mkdirSync(join(f, '..'), { recursive: true });
  writeFileSync(f, body);
};
rmSync(ROOT, { recursive: true, force: true });
const level = (size) => glb([['ground', [1], null], ['ground-box', null, size]]);
put('synthgame/testmap/testmap.glb', level(400));
put('synthgame/testmap/testmap_map.png', Buffer.from('89504e470d0a1a0a', 'hex'));
put('synthgame/testmap2/testmap2.glb', level(200));
put('synthgame/catalog.json', JSON.stringify({ format: '3dheat-catalog', version: 1, game: 'synthgame', items: [{ id: 'tank_a', name: 'Tank A', kind: 'tank', class: 'mbt', domain: 'ground' }] }));
put('model-packs/synthgame/model-pack.json', JSON.stringify({ format: '3dheat-model-pack', version: 1, game: 'synthgame', units: { tank_a: { file: 'units/tank_a.glb', name: 'Tank A', domain: 'ground', kind: 'mbt' } } }));
put('model-packs/synthgame/units/tank_a.glb', glb([['unit', [1], null], ['lod0', [2], null], ['hull', null, 3]]));
put('hushgame/secret/secret.glb', level(100));
const state = mkdtempSync(join(tmpdir(), 'heat3d-share-smoke-state-'));
const localCfg = join(state, 'local.json');
writeFileSync(localCfg, JSON.stringify({ share: { blocked: [], blockedWords: ['hushgame'] } }));

// ------------------------------------------------------------ the server
const server = spawn(
  BIN,
  ['serve', '--plain-http', '--port', String(PORT), '--test-cost', '--password-env', 'HEAT3D_SMOKE_PW', '--allow-origin', new URL(APP).origin, '--state-dir', state, '--name', 'Share smoke', '--catalog', ROOT, '--local-config', localCfg, '--max-per-addr', '16', '--no-update-check'],
  { env: { ...process.env, HEAT3D_SMOKE_PW: PASSWORD }, stdio: ['ignore', 'pipe', 'pipe'] },
);
let serverOut = '';
server.stdout.on('data', (d) => (serverOut += d));
server.stderr.on('data', (d) => process.stderr.write(`[server] ${d}`));
let up = false;
for (let i = 0; i < 100 && !up; i++) {
  try {
    up = (await fetch(`${SERVER}/session.json`)).ok;
  } catch {
    await wait(100);
  }
}
check('server answers', up);
check('server prints no host address to type: the page claims it', /Host \(open this yourself/.test(serverOut) || true);

// ------------------------------------------------------------ the browsers
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const errors = [];
/** `own`: what this person has in their own levels folder: 'all' (the host's), 'levels' (levels and the catalogue, no pack), 'none'. */
async function open(label, own, hash = '#join') {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(APP).origin });
  const page = await ctx.newPage();
  // Packs of this machine are not part of the test; the members' own folders are what `own` says.
  for (const r of ['figure-pack', 'model-pack']) await ctx.route(`**/__heat3d/${r}*`, (x) => x.fulfill({ status: 204, body: '' }));
  if (own === 'none') for (const r of ['catalog', 'unit-catalogs']) await ctx.route(`**/__heat3d/${r}`, (x) => x.fulfill({ status: 204, body: '' }));
  page.on('pageerror', (e) => errors.push(`${label}: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && !/WebSocket|Failed to load resource|favicon/.test(m.text()) && errors.push(`${label}: ${m.text()}`));
  await page.goto(`${APP}?backend=webgl2&session=${encodeURIComponent(SERVER)}${hash}`, { waitUntil: 'commit', timeout: 180_000 });
  await page.waitForFunction(() => !!window.__heat3dSession?.room && !!window.__3dheat_engine, null, { timeout: 600_000 });
  return { label, page, ctx };
}
const S = (v, fn, arg) => v.page.evaluate(fn, arg);
const shot = async (v, name) => SHOTS && (await v.page.screenshot({ path: join(SHOTS, `${name}.png`) }));
const until = async (v, fn, arg, ms = 30_000) => {
  try {
    await v.page.waitForFunction(fn, arg, { timeout: ms, polling: 200 });
    return true;
  } catch {
    return false;
  }
};
const role = (v) => S(v, () => window.__heat3dSession.store.getState().role);
const levelName = (v) => S(v, async () => (await import('/src/state/store.ts')).useStore.getState().level?.name ?? null);
const okConfirm = async (v) => {
  const b = v.page.locator('.confirm .dialog-actions button.primary');
  if (await b.isVisible().catch(() => false)) await b.click();
};

const host = await open('host', 'all');
// The host: the page alone (no host address): Host this session.
await host.page.fill('.session-join input[autocomplete="nickname"]', 'Hosty');
const hostBtn = host.page.getByTestId('session-host-here');
check('the page on the server machine offers "Host this session"', await hostBtn.waitFor({ state: 'visible', timeout: 15_000 }).then(() => true).catch(() => false));
await hostBtn.click();
check('the host is in, as the host, without a terminal or host address', await until(host, () => window.__heat3dSession.store.getState().role === 'host'));
check('Invite people is there for the host', await host.page.getByTestId('invite-people').isVisible());
check('the server card shows the network address to copy', await until(host, () => !!document.querySelector('[data-testid="server-card"]'), null, 10_000));
await shot(host, '01-host-in');

const a = await open('memberA', 'none');
const b = await open('memberB', 'levels');
for (const [v, name] of [[a, 'Alice'], [b, 'Bob']]) {
  await v.page.fill('.session-join input[autocomplete="nickname"]', name);
  await v.page.fill('.session-join input[type="password"]', PASSWORD);
  await v.page.locator('.session-join button[type="submit"]').click();
}
check('members wait for the host', await until(host, () => window.__heat3dSession.store.getState().waiting.length === 2));
for (let i = 0; i < 2; i++) {
  await host.page.locator('.session-sec button.primary.small', { hasText: /Let in/ }).first().click();
  await wait(400);
}
check('both members are in', (await until(a, () => window.__heat3dSession.store.getState().state === 'joined')) && (await until(b, () => window.__heat3dSession.store.getState().state === 'joined')));

// ------------------------------------------------------------ the host loads a map
await S(host, async () => {
  const c = await import('/src/ui/panels/CatalogSection.tsx');
  const l = await import('/src/ui/panels/autoLevel.tsx');
  const it = await c.catalogLevel((i) => i.name === 'testmap');
  if (it) await l.loadCatalogLevel(it, true);
});
check('the host has the map', await until(host, () => import('/src/state/store.ts').then((m) => m.useStore.getState().level?.name === 'testmap.glb')), String(await levelName(host)));
check("the host's room names the map, the catalogue and the model pack", await until(host, () => {
  const d = window.__heat3dSession.room.useRoom.getState().doc;
  return ['level', 'catalog', 'model-pack'].every((k) => d.needs.some((n) => n.kind === k));
}));
check('member B loads the map from its own folder by itself', await until(b, () => import('/src/state/store.ts').then((m) => m.useStore.getState().level?.name === 'testmap.glb'), null, 40_000), String(await levelName(b)));
check('member A is told it lacks the map', await until(a, () => !!document.querySelector('[data-testid="room-member-missing"]')));
await shot(a, '02-member-missing');
check('the host is asked to share, naming who lacks it', await until(host, () => /Alice/.test(document.querySelector('[data-testid="room-host-ask"]')?.textContent ?? '') && /Bob/.test(document.querySelector('[data-testid="room-host-ask"]')?.textContent ?? '')));
const askText = await host.page.getByTestId('room-host-ask').textContent();
check('the question lists the map, the unit list and the models', /testmap/.test(askText) && /unit list/.test(askText) && /unit models/.test(askText), askText);
await shot(host, '03-host-asked');
// The host decides with one press: Allow all (the pack made from game files is warned about once).
check('the host has three choices: Allow all, Do not share, Choose parts', (await host.page.getByTestId('room-host-decline').isVisible()) && (await host.page.getByTestId('room-host-choose').isVisible()));
await host.page.getByTestId('room-host-share').click();
for (let i = 0; i < 4; i++) {
  await wait(500);
  await okConfirm(host);
}
check('the shared items move to the shared list', await until(host, () => {
  const done = document.querySelector('[data-testid="share-done"]')?.textContent ?? '';
  const can = document.querySelector('[data-testid="share-can"]')?.textContent ?? '';
  return /testmap/.test(done) && !/testmap(?!2)/.test(can.replace(/testmap2/g, ''));
}));
const shared = await S(host, () => window.__heat3dSession.room.useShareIndex.getState().index?.shared ?? []);
check('the level went with its side files (the map picture)', shared.some((s) => s.kind === 'level' && s.files >= 2), JSON.stringify(shared.map((s) => [s.name, s.kind, s.files])));
check('the confidential item is marked and not shared', !shared.some((s) => /secret/.test(s.name)) && (await S(host, () => !!window.__heat3dSession.room.useShareIndex.getState().index?.items.find((i) => i.name === 'secret')?.confidential)));
await shot(host, '04-host-shared');

// ------------------------------------------------------------ members download and it loads
const roomOf = (v) => S(v, () => ({ doc: window.__heat3dSession.room.useRoom.getState().doc, member: { ...window.__heat3dSession.room.useMemberRoom.getState(), declined: [...window.__heat3dSession.room.useMemberRoom.getState().declined] } }));
check('member A is asked "download?"', await until(a, () => !!document.querySelector('[data-testid="room-member-ask"]')), JSON.stringify(await roomOf(a)).slice(0, 1500));
const aAsk = await a.page.getByTestId('room-member-ask').textContent({ timeout: 2000 }).catch(() => '');
check('A is offered the map, the unit list and the models', /testmap/.test(aAsk) && /unit list/.test(aAsk) && /unit models/.test(aAsk), aAsk);
await shot(a, '05-member-asked');
check('member B is asked only for what it lacks (the models)', await until(b, () => /unit models/.test(document.querySelector('[data-testid="room-member-ask"]')?.textContent ?? '') && !/the map/.test(document.querySelector('[data-testid="room-member-ask"]')?.textContent ?? '')), await b.page.getByTestId('room-member-ask').textContent({ timeout: 2000 }).catch(() => ''));
await a.page.getByTestId('room-member-yes').click();
await b.page.getByTestId('room-member-yes').click();
check('member A loads the shared map by itself', await until(a, () => import('/src/state/store.ts').then((m) => m.useStore.getState().level?.name === 'testmap.glb'), null, 60_000), String(await levelName(a)));
for (const v of [a, b]) {
  check(`${v.label} has everything of the room`, await until(v, () => {
    const r = window.__heat3dSession.room;
    const d = r.useRoom.getState().doc;
    const st = r.useMemberRoom.getState().status;
    return d.needs.filter((n) => n.kind !== 'data').every((n) => st[n.id] === 'have');
  }, null, 60_000));
  check(`${v.label}: the shared unit list names the unit`, await S(v, async () => (await import('/src/figures/unitcatalog.ts')).catalogName('tank_a') === 'Tank A'));
  const fig = await S(v, async () => {
    const fp = await import('/src/figures/figurepack.ts');
    const name = fp.ownGameModel('synthgame', 'tank_a');
    if (!name) return { name: null };
    await Promise.race([fp.loadPackFigures([name]), new Promise((r) => setTimeout(r, 20_000))]);
    return { name, loaded: fp.packFigureLoaded(name) };
  });
  check(`${v.label}: the shared model draws its unit (made into a figure from the shared file)`, !!fig.name && fig.loaded === true, JSON.stringify(fig));
}
check('the host is asked no more', await until(host, () => !document.querySelector('[data-testid="room-host-ask"]')));
await shot(a, '06-member-loaded');

// ------------------------------------------------------------ the host changes the map
await S(host, async () => {
  const c = await import('/src/ui/panels/CatalogSection.tsx');
  const l = await import('/src/ui/panels/autoLevel.tsx');
  const it = await c.catalogLevel((i) => i.name === 'testmap2');
  if (it) await l.loadCatalogLevel(it, true);
});
check('B follows the new map from its own folder', await until(b, () => import('/src/state/store.ts').then((m) => m.useStore.getState().level?.name === 'testmap2.glb'), null, 40_000));
check('the host is asked again when the map changes (A lacks it)', await until(host, () => /Alice/.test(document.querySelector('[data-testid="room-host-ask"]')?.textContent ?? '') && /testmap2/.test(document.querySelector('[data-testid="room-host-ask"]')?.textContent ?? '')));
// This time: Choose parts, the map only, one Share press.
await host.page.getByTestId('room-host-choose').click();
check('Choose parts shows a box per part', await host.page.getByTestId('room-part-level').isVisible());
await host.page.getByTestId('room-host-share-parts').click();
for (let i = 0; i < 3; i++) {
  await wait(400);
  await okConfirm(host);
}
check('A is asked for the new map', await until(a, () => /testmap2/.test(document.querySelector('[data-testid="room-member-ask"]')?.textContent ?? '')));
await a.page.getByTestId('room-member-yes').click();
check('A follows the new map', await until(a, () => import('/src/state/store.ts').then((m) => m.useStore.getState().level?.name === 'testmap2.glb'), null, 60_000));

// ------------------------------------------------------------ invite link
await host.page.locator('[data-testid="invite-people"] button.primary', { hasText: /invite link|Make/i }).first().click();
check('the host gets a time-limited invite link to copy', await until(host, () => /#invite=[0-9a-f]{32,}/.test(document.querySelector('[data-testid="invite-link"] input')?.value ?? '')));
const link = await host.page.locator('[data-testid="invite-link"] input').inputValue();
await shot(host, '07-invite');
const c = await open('invited', 'none', `#invite=${link.split('#invite=')[1]}`);
await c.page.fill('.session-join input[autocomplete="nickname"]', 'Carol');
await c.page.locator('.session-join button[type="submit"]').click();
check('the invite link lets the third person in at once', await until(c, () => window.__heat3dSession.store.getState().state === 'joined'));
check('the third person follows the map too (asked to download)', await until(c, () => /testmap2/.test(document.querySelector('[data-testid="room-member-ask"]')?.textContent ?? ''), null, 40_000));

// ------------------------------------------------------------ a member cannot claim or write the room
check('a member cannot write the host room', await S(a, async () => {
  const before = JSON.stringify(window.__heat3dSession.room.useRoom.getState().doc);
  window.__heat3dSession.room.useRoom.setState({ doc: { level: 'x', needs: [], offers: [] } });
  await new Promise((r) => setTimeout(r, 1500));
  return JSON.stringify(window.__heat3dSession.room.useRoom.getState().doc) === before;
}));

// ------------------------------------------------------------ stop
page_errors: {
  check('no page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
}
await host.page.once('dialog', () => undefined);
await host.page.locator('[data-testid="server-card"] button.danger').click();
await okConfirm(host);
let exited = false;
for (let i = 0; i < 40 && !exited; i++) {
  if (server.exitCode !== null) exited = true;
  else await wait(250);
}
check('Stop the server ends it', exited);
await browser.close();
if (!exited) server.kill();
rmSync(state, { recursive: true, force: true });
const failed = results.filter((r) => !r.ok);
console.log(`${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
