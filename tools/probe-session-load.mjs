/**
 * A big room without a browser: a session server (`3dheat serve`, its
 * defaults: no fixed member cap) and N simulated members (the `loadgen`
 * example of native/crates/session: invite link, camera ten times a second, a
 * mark every two seconds), all from one address as a team behind one office
 * address would be. A host client here makes the invite and reads everything
 * the server sends, as a host's viewer would. Measured over the run: the
 * server's and its gateway's CPU and memory, what the host receives (messages,
 * bytes, presence frames and how many poses each holds) and how long decoding
 * it takes, and what each member receives.
 *
 *   node --experimental-transform-types tools/probe-session-load.mjs [members=100] [seconds=30]
 *
 * Needs the server and loadgen builds (cargo build --release -p heat3d-server
 * --bin 3dheat -p heat3d-session --example loadgen in native/; CARGO_TARGET
 * names their folder). Windows (process use read with PowerShell).
 */
import { execFileSync, spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { create, fromBinary, toBinary } from '@bufbuild/protobuf';
import { ClientMsgSchema, Role, ServerMsgSchema } from '../src/session/proto/heat3d/session/v1/session_pb.ts';

const MEMBERS = Number(process.argv[2] ?? 100);
const SECONDS = Number(process.argv[3] ?? 30);
const TARGET = process.env.CARGO_TARGET ?? 'E:/cargo-targets/3dheat/release';
const PORT = 7700 + Math.floor(Math.random() * 90);
const TOKEN = randomBytes(32).toString('hex');
const state = mkdtempSync(join(tmpdir(), 'heat3d-session-load-'));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const server = spawn(`${TARGET}/3dheat.exe`, ['serve', '--plain-http', '--port', String(PORT), '--test-cost', '--host-token', TOKEN, '--state-dir', state, '--no-update-check'], { stdio: 'ignore' });
for (let i = 0; i < 100; i++) {
  try {
    if ((await fetch(`http://127.0.0.1:${PORT}/session.json`)).ok) break;
  } catch {
    await wait(100);
  }
}

/** The server's and its gateway's CPU seconds and working set (MiB). */
function serverUse() {
  const ps = `$c = 0; $m = 0; foreach ($x in (Get-CimInstance Win32_Process | ? { $_.ProcessId -eq ${server.pid} -or $_.ParentProcessId -eq ${server.pid} })) { $g = Get-Process -Id $x.ProcessId -ErrorAction SilentlyContinue; if ($g) { $c += $g.CPU; $m += $g.WorkingSet64 } }; "$c $m"`;
  const [c, m] = execFileSync('powershell', ['-NoProfile', '-Command', ps], { encoding: 'utf8' }).trim().split(/\s+/).map(Number);
  return { cpu: c, mib: m / 1048576 };
}

// ------------------------------------------------------------ the host
const ws = new WebSocket(`ws://127.0.0.1:${PORT}/ws`);
ws.binaryType = 'arraybuffer';
const send = (body, rid = 0) => ws.send(toBinary(ClientMsgSchema, create(ClientMsgSchema, { rid, body })));
const stats = { msgs: 0, bytes: 0, frames: 0, poses: 0, maxPoses: 0, decodeMs: 0, roster: 0, ops: 0 };
let invite = '';
let counting = false;
ws.onmessage = (e) => {
  const t = performance.now();
  const m = fromBinary(ServerMsgSchema, new Uint8Array(e.data));
  const dt = performance.now() - t;
  const b = m.body;
  if (b.case === 'challenge') send({ case: 'hello', value: { proto: 1, name: 'Host', hostToken: TOKEN, clientKey: 'loadhost' } });
  if (b.case === 'welcome') send({ case: 'invite', value: { role: Role.DRAW, uses: MEMBERS, ttlMs: 3_600_000n, label: 'load' } }, 1);
  if (b.case === 'invite') invite = b.value.token;
  if (!counting) return;
  stats.msgs++;
  stats.bytes += e.data.byteLength;
  stats.decodeMs += dt;
  if (b.case === 'presence') {
    stats.frames++;
    stats.poses += b.value.items.length;
    stats.maxPoses = Math.max(stats.maxPoses, b.value.items.length);
  }
  if (b.case === 'roster') stats.roster++;
  if (b.case === 'op') stats.ops++;
};
for (let i = 0; i < 100 && !invite; i++) await wait(100);
if (!invite) throw new Error('no invite');
// The host's own camera, as a viewer sends it, once a second.
const pose = { position: { x: 0, y: 100, z: 0 }, forward: { x: 0, y: -1, z: 0 }, fov: 60, aspect: 1.7 };
const hostTimer = setInterval(() => send({ case: 'presence', value: { pose, tab: 'heat', mode: 'heat-simple' } }), 1000);

// ------------------------------------------------------------ the members
const before = serverUse();
// Everyone in (60 upgrades at once from one address, then five a second), then measured; the members stay that long.
const settle = Math.max(8000, (MEMBERS - 60) * 220 + 4000);
const gen = spawn(`${TARGET}/examples/loadgen.exe`, [`ws://127.0.0.1:${PORT}/ws`, String(MEMBERS), invite, String(Math.ceil(settle / 1000) + SECONDS + 10)], { stdio: ['ignore', 'pipe', 'inherit'] });
const genDone = new Promise((r) => gen.on('exit', r));
let genOut = '';
gen.stdout.on('data', (d) => (genOut += d));
await wait(settle);
const start = serverUse();
const t0 = performance.now();
counting = true;
await wait(SECONDS * 1000);
counting = false;
const end = serverUse();
const secs = (performance.now() - t0) / 1000;
clearInterval(hostTimer);
await genDone;
console.log(`members: ${MEMBERS} asked, loadgen: ${genOut.trim()}`);
console.log(`server + gateway: ${(((end.cpu - start.cpu) / secs) * 100).toFixed(1)} % of one core while ${MEMBERS} move and mark; memory ${before.mib.toFixed(0)} -> ${end.mib.toFixed(0)} MiB`);
console.log(
  `host receives: ${(stats.msgs / secs).toFixed(1)} messages/s, ${(stats.bytes / 1024 / secs).toFixed(1)} KiB/s; presence ${(stats.frames / secs).toFixed(1)} frames/s, ${(stats.poses / Math.max(1, stats.frames)).toFixed(1)} poses a frame (max ${stats.maxPoses}); ${stats.ops} mark batches; decoding ${((stats.decodeMs / secs) * 100 / 1000).toFixed(2)} % of the host's main thread`,
);
ws.close();
server.kill();
rmSync(state, { recursive: true, force: true });
process.exit(0);
