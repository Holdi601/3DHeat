/**
 * Mass-analysis demo set: 150 small synthetic tank matches as `.3dheat`
 * containers in <out>/mass, on two demo maps and two modes, dated over four
 * weeks. The T-90A over-performs and the BTR-80 under-performs, so the
 * Balance tab has something to show. Then the offline summary tool runs once
 * over the folder (summaries inside the containers, plus the folder index).
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parquetWriteBuffer } from 'hyparquet-writer';
import { writeContainer } from './container.mjs';

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const R = rng(20261116);
const rand = (a, b) => a + (b - a) * R();
const pick = (l) => l[Math.floor(R() * l.length)];

const COLS = { time: 'DOUBLE', match: 'STRING', player_name: 'STRING', team: 'STRING', x: 'DOUBLE', y: 'DOUBLE', z: 'DOUBLE', yaw: 'DOUBLE', event: 'STRING', other: 'STRING', vehicle: 'STRING', weapon: 'STRING', ai: 'INT32', won: 'INT32' };
const HINTS = {
  columns: { x: 'x', y: 'y', z: 'z', time: 'time', timeUnit: 'seconds', personId: 'player_name', teamId: 'team', sessionId: 'match', lookMode: 'yawPitch', yaw: 'yaw', angleUnit: 'degrees', extra: ['event', 'other', 'vehicle', 'weapon', 'ai', 'won'] },
  axes: { up: 'y' },
};
const BLUE = ['Leopard 2A6', 'M1A2 Abrams', 'CV90', 'M2A2 Bradley', 'Leopard 2A6', 'M1A2 Abrams'];
const RED = ['T-72B3', 'T-90A', 'BMP-2', 'BTR-80', 'T-72B3', 'T-72B3'];
/** Chance a shot kills, by the shooter's vehicle. */
const EDGE = { 'T-90A': 1.8, 'BTR-80': 0.5, 'T-72B3': 1.0, 'BMP-2': 0.9, 'Leopard 2A6': 1.1, 'M1A2 Abrams': 1.1, CV90: 1.0, 'M2A2 Bradley': 1.0 };

export default async function (outDir) {
  const dir = join(outDir, 'mass');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(dir, '.tmp'), { recursive: true });
  const N = 150;
  const start = Date.parse('2026-10-05T10:00:00Z');
  for (let m = 1; m <= N; m++) {
    const name = `Demo Match ${String(m).padStart(3, '0')}`;
    const map = m % 3 === 0 ? 'Demo Ridge' : 'Demo Valley';
    const mode = m % 2 === 0 ? 'Domination' : 'Conquest';
    const started = new Date(start + (m / N) * 28 * 86400e3 + rand(0, 3600e3)).toISOString();
    const rows = [];
    const units = [];
    [['Blue', BLUE, -1], ['Red', RED, 1]].forEach(([team, list, side]) =>
      list.forEach((vehicle, i) => units.push({ name: `${team} ${i + 1}`, team, vehicle, side, ai: i >= 4 ? 1 : 0, alive: true, back: 0, x: side * 2200 + rand(-120, 120), z: -700 + i * 260, kills: 0 })),
    );
    const row = (t, u, event = 'position', other = null, weapon = null) =>
      rows.push({ time: t, match: name, player_name: u.name, team: u.team, x: u.x, y: 40, z: u.z, yaw: u.side < 0 ? 90 : 270, event, other, vehicle: u.vehicle, weapon, ai: u.ai, won: null });
    for (const u of units) row(0, u, 'spawn');
    for (let t = 0; t <= 180; t += 3) {
      for (const u of units) {
        if (!u.alive) {
          if (t >= u.back) { u.alive = true; u.x = u.side * 2200 + rand(-120, 120); u.z = rand(-800, 800); } else continue;
        }
        u.x -= u.side * rand(20, 40);
        u.z += rand(-25, 25);
        row(t, u);
      }
      for (const a of units) {
        if (!a.alive || R() > 0.3) continue;
        const foes = units.filter((b) => b.alive && b.team !== a.team);
        if (!foes.length) continue;
        const b = pick(foes);
        const w = a.team === 'Blue' ? '120 mm APFSDS' : '125 mm APFSDS';
        row(t + 0.5, a, 'fire', b.name, w);
        if (R() < 0.6) row(t + 0.55, b, 'hit', a.name, w);
        if (R() < 0.35 * EDGE[a.vehicle] / EDGE[b.vehicle] ** 0.5) {
          b.alive = false;
          b.back = Infinity;
          a.kills++;
          row(t + 0.6, b, 'death', a.name, w);
          row(t + 0.6, a, 'kill', b.name, w);
        }
      }
    }
    const k = (team) => units.filter((u) => u.team === team).reduce((s, u) => s + u.kills, 0);
    const winner = k('Blue') === k('Red') ? pick(['Blue', 'Red']) : k('Blue') > k('Red') ? 'Blue' : 'Red';
    for (const r of rows) r.won = r.team === winner ? 1 : 0;
    const columnData = Object.entries(COLS).map(([n, type]) => ({ name: n, type, data: rows.map((r) => r[n] ?? null) }));
    const file = join(dir, '.tmp', `${name}.parquet`);
    writeFileSync(file, Buffer.from(parquetWriteBuffer({ columnData, kvMetadata: [{ key: 'heat3d', value: JSON.stringify(HINTS) }] })));
    await writeContainer(join(dir, `${name}.3dheat`), [{ file, role: 'table' }], { game: 'demo', match: name, map, mode, started });
  }
  rmSync(join(dir, '.tmp'), { recursive: true, force: true });
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [join(import.meta.dirname, '3dheat-summarize.mjs'), dir, '--settle', '0'], { stdio: 'inherit' });
  console.log(`mass: ${N} matches, summarised in ${((Date.now() - t0) / 1000).toFixed(1)} s (exit ${r.status})`);
}
