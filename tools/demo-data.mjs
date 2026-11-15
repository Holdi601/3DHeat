/**
 * Synthetic demo data for the documentation screenshots.
 *
 * Everything here is made up: a procedural valley and a small yard as levels,
 * and matches of three made-up game styles played on them. No real map,
 * level, player or recording is used, so the pictures it makes may be
 * published. Repeatable: the random seed is fixed.
 *
 *   node tools/demo-data.mjs [out dir]        (default tools/.shots/demo)
 *
 * Writes:
 *   demo-valley.glb           a 12 km valley with a village (Y up, metres)
 *   demo-yard.glb             a 160 m yard with buildings and walls
 *   tanks.parquet             10 tank matches, 8 against 8, with shots, hits,
 *                             fires, kills, wrecks and turret aim
 *   tanks/match-NN.parquet    the same matches one file each (many-match load)
 *   air.parquet               a 4 against 4 air fight with missiles and flares
 *   shooter.parquet           12 rounds of 5 against 5 on foot, with a value
 *                             (credits) economy, helmets and utility
 *
 * Each Parquet file carries `heat3d` footer hints, so it loads without any
 * column mapping.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parquetWriteBuffer } from 'hyparquet-writer';

const OUT = resolve(process.argv[2] ?? join(import.meta.dirname, '.shots', 'demo'));
mkdirSync(join(OUT, 'tanks'), { recursive: true });

// ------------------------------------------------------------------ helpers

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
const R = rng(20261115);
const rand = (a = 0, b = 1) => a + (b - a) * R();
const pickOne = (arr) => arr[Math.floor(R() * arr.length)];
const deg = (r) => (r * 180) / Math.PI;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
/** Compass heading in degrees, 0 = -Z (north), clockwise. */
const heading = (dx, dz) => (deg(Math.atan2(dx, -dz)) + 360) % 360;

/** A table built row by row, written as Parquet with hints. */
class Table {
  constructor(cols) {
    this.cols = cols; // { name: 'DOUBLE' | 'STRING' | 'INT32' }
    this.data = Object.fromEntries(Object.keys(cols).map((k) => [k, []]));
    this.n = 0;
  }
  push(row) {
    for (const k of Object.keys(this.cols)) this.data[k].push(row[k] ?? null);
    this.n++;
  }
  write(file, hints, filter) {
    const keep = filter ? [...Array(this.n).keys()].filter(filter) : null;
    const columnData = Object.entries(this.cols).map(([name, type]) => ({
      name,
      type,
      data: keep ? keep.map((i) => this.data[name][i]) : this.data[name],
    }));
    const buf = parquetWriteBuffer({ columnData, kvMetadata: [{ key: 'heat3d', value: JSON.stringify(hints) }] });
    writeFileSync(file, Buffer.from(buf));
    return keep ? keep.length : this.n;
  }
}

// ------------------------------------------------------------------ levels

/** Height of the valley at (x, z), metres. A valley along X, ridges north and south, two hills. */
function valleyH(x, z) {
  const ridge = 260 * Math.pow(Math.min(1, Math.abs(z) / 6000), 2) * 4;
  const roll = 35 * Math.sin(x / 700) * Math.cos(z / 600);
  const hill = (cx, cz, h, r) => h * Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (r * r));
  return 40 + ridge + roll + hill(-1200, 600, 70, 380) + hill(1300, -500, 70, 380) + hill(0, 1900, 50, 500);
}
const HILLS = [
  { x: -1200, z: 600 },
  { x: 1300, z: -500 },
];

/** Height of the yard: nearly flat. */
const yardH = () => 0;

function grid(size, cells, h, colour) {
  const n = cells + 1;
  const pos = new Float32Array(n * n * 3);
  const nor = new Float32Array(n * n * 3);
  const col = new Float32Array(n * n * 3);
  const step = size / cells;
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const x = -size / 2 + i * step;
      const z = -size / 2 + j * step;
      const y = h(x, z);
      const k = (j * n + i) * 3;
      pos.set([x, y, z], k);
      const dx = (h(x + 1, z) - h(x - 1, z)) / 2;
      const dz = (h(x, z + 1) - h(x, z - 1)) / 2;
      const l = Math.hypot(dx, 1, dz);
      nor.set([-dx / l, 1 / l, -dz / l], k);
      col.set(colour(x, y, z, 1 / l), k);
    }
  const idx = new Uint32Array(cells * cells * 6);
  let o = 0;
  for (let j = 0; j < cells; j++)
    for (let i = 0; i < cells; i++) {
      const a = j * n + i;
      idx.set([a, a + n, a + 1, a + 1, a + n, a + n + 1], o);
      o += 6;
    }
  return { pos, nor, col, idx };
}

/** Axis-aligned boxes (walls, houses) as one mesh. */
function boxes(list, h) {
  const pos = [];
  const nor = [];
  const col = [];
  const idx = [];
  for (const b of list) {
    const y0 = h(b.x, b.z) - 0.5;
    const y1 = y0 + 0.5 + b.h;
    const [x0, x1, z0, z1] = [b.x - b.w / 2, b.x + b.w / 2, b.z - b.d / 2, b.z + b.d / 2];
    const faces = [
      [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [0, 1, 0]],
      [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]],
      [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1]],
      [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0]],
      [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0]],
    ];
    for (const [a, b2, c, d, nrm] of faces) {
      const base = pos.length / 3;
      for (const v of [a, b2, c, d]) {
        pos.push(...v);
        nor.push(...nrm);
        col.push(...(b.colour ?? [0.72, 0.66, 0.58]));
      }
      idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
  }
  return { pos: new Float32Array(pos), nor: new Float32Array(nor), col: new Float32Array(col), idx: new Uint32Array(idx) };
}

/** A binary glTF with one node per part; part names say ground or structure. */
function writeGlb(file, parts) {
  const chunks = [];
  let offset = 0;
  const views = [];
  const accessors = [];
  const meshes = [];
  const add = (arr, target, type, count, minmax) => {
    const bytes = Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength);
    chunks.push(bytes);
    views.push({ buffer: 0, byteOffset: offset, byteLength: bytes.length, target });
    offset += bytes.length;
    const acc = { bufferView: views.length - 1, componentType: arr instanceof Uint32Array ? 5125 : 5126, count, type };
    if (minmax) Object.assign(acc, minmax);
    accessors.push(acc);
    return accessors.length - 1;
  };
  parts.forEach((p, i) => {
    const n = p.pos.length / 3;
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (let k = 0; k < p.pos.length; k++) {
      min[k % 3] = Math.min(min[k % 3], p.pos[k]);
      max[k % 3] = Math.max(max[k % 3], p.pos[k]);
    }
    const P = add(p.pos, 34962, 'VEC3', n, { min, max });
    const N = add(p.nor, 34962, 'VEC3', n);
    const C = add(p.col, 34962, 'VEC3', n);
    const I = add(p.idx, 34963, 'SCALAR', p.idx.length);
    meshes.push({ name: p.name, primitives: [{ attributes: { POSITION: P, NORMAL: N, COLOR_0: C }, indices: I, material: i }] });
  });
  const json = {
    asset: { version: '2.0', generator: '3DHeat demo-data' },
    scene: 0,
    scenes: [{ nodes: parts.map((_, i) => i) }],
    nodes: parts.map((p, i) => ({ name: p.name, mesh: i })),
    meshes,
    materials: parts.map((p) => ({ name: p.name, pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 1 } })),
    accessors,
    bufferViews: views,
    buffers: [{ byteLength: offset }],
  };
  const pad = (b, fill) => (b.length % 4 ? Buffer.concat([b, Buffer.alloc(4 - (b.length % 4), fill)]) : b);
  const jb = pad(Buffer.from(JSON.stringify(json)), 0x20);
  const bb = pad(Buffer.concat(chunks), 0);
  const head = Buffer.alloc(12);
  head.writeUInt32LE(0x46546c67, 0);
  head.writeUInt32LE(2, 4);
  head.writeUInt32LE(12 + 8 + jb.length + 8 + bb.length, 8);
  const ch = (len, type) => {
    const b = Buffer.alloc(8);
    b.writeUInt32LE(len, 0);
    b.writeUInt32LE(type, 4);
    return b;
  };
  writeFileSync(file, Buffer.concat([head, ch(jb.length, 0x4e4f534a), jb, ch(bb.length, 0x004e4942), bb]));
}

const valleyColour = (x, y, z, up) => {
  const g = clamp((y - 40) / 600, 0, 1);
  const rock = clamp((0.97 - up) * 8, 0, 1);
  const base = [0.36 + 0.25 * g, 0.48 + 0.1 * g, 0.27 + 0.2 * g];
  return base.map((c, i) => c * (1 - rock) + [0.5, 0.47, 0.44][i] * rock);
};
const village = [];
for (let i = 0; i < 26; i++) {
  const a = rand(0, Math.PI * 2);
  const r = rand(30, 260);
  village.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, w: rand(8, 16), d: rand(7, 12), h: rand(5, 9) });
}
writeGlb(join(OUT, 'demo-valley.glb'), [
  { name: 'ground:Demo Valley', ...grid(12000, 240, valleyH, valleyColour) },
  { name: 'structure:Demo Valley village', ...boxes(village, valleyH) },
]);

const yardBoxes = [
  // outer walls
  { x: 0, z: -82, w: 166, d: 2, h: 4 },
  { x: 0, z: 82, w: 166, d: 2, h: 4 },
  { x: -82, z: 0, w: 2, d: 166, h: 4 },
  { x: 82, z: 0, w: 2, d: 166, h: 4 },
  // the middle block with a gap (the choke) and the two side buildings
  { x: -18, z: 0, w: 22, d: 30, h: 7 },
  { x: 18, z: 0, w: 22, d: 30, h: 7 },
  { x: -50, z: -5, w: 14, d: 22, h: 6 },
  { x: 50, z: -5, w: 14, d: 22, h: 6 },
  // cover at the sites
  { x: -55, z: 40, w: 6, d: 3, h: 1.4 },
  { x: -42, z: 30, w: 3, d: 6, h: 1.4 },
  { x: 55, z: 40, w: 6, d: 3, h: 1.4 },
  { x: 44, z: 28, w: 3, d: 6, h: 1.4 },
  // spawn buildings
  { x: -30, z: -70, w: 20, d: 10, h: 5 },
  { x: 30, z: 70, w: 20, d: 10, h: 5 },
];
writeGlb(join(OUT, 'demo-yard.glb'), [
  { name: 'ground:Demo Yard', ...grid(170, 85, yardH, (x, y, z) => [0.55 + 0.03 * Math.sin(x), 0.52, 0.46]) },
  { name: 'structure:Demo Yard buildings', ...boxes(yardBoxes, yardH) },
]);

// ------------------------------------------------------------------ tanks

const TANK_COLS = {
  time: 'DOUBLE', match: 'STRING', player_name: 'STRING', team: 'STRING',
  x: 'DOUBLE', y: 'DOUBLE', z: 'DOUBLE', yaw: 'DOUBLE',
  event: 'STRING', other: 'STRING', vehicle: 'STRING', weapon: 'STRING',
  ai: 'INT32', won: 'INT32', turret_yaw: 'DOUBLE', gun_pitch: 'DOUBLE',
  hitLocalX: 'DOUBLE', hitLocalY: 'DOUBLE', hitLocalZ: 'DOUBLE', calibre: 'DOUBLE', damage: 'DOUBLE',
  health: 'DOUBLE', fireId: 'STRING',
};
const TANK_HINTS = {
  columns: {
    x: 'x', y: 'y', z: 'z', time: 'time', timeUnit: 'seconds',
    personId: 'player_name', teamId: 'team', sessionId: 'match',
    lookMode: 'yawPitch', yaw: 'yaw', angleUnit: 'degrees',
    extra: ['event', 'other', 'vehicle', 'weapon', 'ai', 'won', 'turret_yaw', 'gun_pitch', 'hitLocalX', 'hitLocalY', 'hitLocalZ', 'calibre', 'damage', 'health', 'fireId'],
  },
  axes: { up: 'y' },
};
const BLUE_TANKS = ['Leopard 2A6', 'M1A2 Abrams', 'Leopard 2A6', 'M1A2 Abrams', 'CV90', 'M2A2 Bradley', 'Leopard 2A6', 'M1A2 Abrams'];
const RED_TANKS = ['T-72B3', 'T-90A', 'T-72B3', 'T-90A', 'BMP-2', 'BTR-80', 'T-72B3', 'T-80U'];
const ZONES = [
  { x: 0, z: -1100 },
  { x: 0, z: 0 },
  { x: 0, z: 1100 },
];

const tanks = new Table(TANK_COLS);
const matchRows = [];
for (let m = 1; m <= 10; m++) {
  const match = `Match ${String(m).padStart(2, '0')}`;
  const first = tanks.n;
  const units = [];
  for (const [team, list, side] of [['Blue', BLUE_TANKS, -1], ['Red', RED_TANKS, 1]]) {
    list.forEach((vehicle, i) => {
      units.push({
        name: `${team} ${i + 1}`, team, vehicle, side,
        ai: i >= 6 ? 1 : 0,
        hp: 100, alive: true, respawnAt: 0, fireOff: 0, fireN: 0,
        x: side * 2600 + rand(-150, 150), z: -900 + i * 260 + rand(-60, 60), yaw: side < 0 ? 90 : 270,
        goal: null, goalUntil: 0, turret: 0, kills: 0,
      });
    });
  }
  const pending = [];
  const T = 600;
  for (let t = 0; t <= T; t++) {
    for (const u of units) {
      if (!u.alive) {
        if (t >= u.respawnAt) {
          Object.assign(u, { alive: true, hp: 100, x: u.side * 2600 + rand(-150, 150), z: rand(-900, 900), goal: null });
          pending.push({ u, ev: 'spawn' });
        } else continue;
      }
      if (!u.goal || t > u.goalUntil) {
        const own = HILLS.find((h) => Math.sign(h.x) === u.side);
        const g = R() < 0.35 ? own : pickOne(ZONES);
        u.goal = { x: g.x + rand(-180, 180), z: g.z + rand(-180, 180) };
        u.goalUntil = t + rand(60, 140);
      }
      const dx = u.goal.x - u.x;
      const dz = u.goal.z - u.z;
      const d = Math.hypot(dx, dz);
      if (d > 20) {
        const want = heading(dx, dz);
        let turn = ((want - u.yaw + 540) % 360) - 180;
        u.yaw = (u.yaw + clamp(turn, -12, 12) + 360) % 360;
        const sp = 7 + rand(-1, 1);
        u.x += Math.sin((u.yaw * Math.PI) / 180) * sp;
        u.z -= Math.cos((u.yaw * Math.PI) / 180) * sp;
      }
    }
    // combat
    for (const a of units) {
      if (!a.alive) continue;
      const foes = units.filter((b) => b.alive && b.team !== a.team && dist(a, b) < 1400);
      if (!foes.length) {
        a.turret *= 0.9;
        continue;
      }
      const b = foes.reduce((p, q) => (dist(a, q) < dist(a, p) ? q : p));
      a.turret = ((heading(b.x - a.x, b.z - a.z) - a.yaw + 540) % 360) - 180;
      const onHill = HILLS.some((h) => dist(a, h) < 320);
      if (R() > (onHill ? 0.14 : 0.06)) continue;
      const w = a.team === 'Blue' ? '120 mm APFSDS' : '125 mm APFSDS';
      pending.push({ u: a, ev: 'fire', other: b.name, weapon: w });
      if (R() < (onHill ? 0.75 : 0.45)) {
        const dmg = rand(30, 75);
        b.hp -= dmg;
        pending.push({ u: b, ev: 'hit', other: a.name, weapon: w, hit: [rand(-3, 3), rand(0.6, 2.3), rand(-1.6, 1.6)], calibre: a.team === 'Blue' ? 120 : 125, damage: dmg });
        if (b.hp > 0 && R() < 0.25 && t >= b.fireOff) {
          b.fireN++;
          b.fireOff = t + rand(8, 15);
          pending.push({ u: b, ev: 'fire_on', fireId: `${b.name}-${b.fireN}` });
          pending.push({ u: b, ev: 'fire_off', fireId: `${b.name}-${b.fireN}`, at: b.fireOff });
        }
        if (b.hp <= 0) {
          b.alive = false;
          b.respawnAt = t + 30;
          a.kills++;
          pending.push({ u: b, ev: 'death', other: a.name, weapon: w });
          pending.push({ u: a, ev: 'kill', other: b.name, weapon: w });
        }
      }
    }
    // rows: positions of live units, then this second's events
    const rows = [];
    for (const u of units) {
      if (!u.alive) continue;
      rows.push({ u, ev: 'position' });
    }
    for (let i = pending.length - 1; i >= 0; i--) {
      const p = pending[i];
      if (p.at === undefined || p.at <= t) {
        rows.push(p);
        pending.splice(i, 1);
      }
    }
    for (const r of rows) {
      const u = r.u;
      tanks.push({
        time: t + (r.ev === 'position' ? 0 : 0.5), match, player_name: u.name, team: u.team,
        x: u.x, y: valleyH(u.x, u.z) + 1.2, z: u.z, yaw: u.yaw,
        event: r.ev, other: r.other, vehicle: u.vehicle, weapon: r.weapon, ai: u.ai, won: null,
        turret_yaw: u.turret, gun_pitch: 1.5,
        hitLocalX: r.hit?.[0], hitLocalY: r.hit?.[1], hitLocalZ: r.hit?.[2], calibre: r.calibre, damage: r.damage,
        health: r.ev === 'position' || r.ev === 'hit' ? Math.max(0, u.hp) : null, fireId: r.fireId,
      });
    }
  }
  const blue = units.filter((u) => u.team === 'Blue').reduce((s, u) => s + u.kills, 0);
  const red = units.filter((u) => u.team === 'Red').reduce((s, u) => s + u.kills, 0);
  const winner = blue >= red ? 'Blue' : 'Red';
  for (let i = first; i < tanks.n; i++) tanks.data.won[i] = tanks.data.team[i] === winner ? 1 : 0;
  matchRows.push([match, first, tanks.n]);
}
// position rows first within each second, events after; sorted by time per match already
console.log('tanks rows', tanks.write(join(OUT, 'tanks.parquet'), TANK_HINTS));
for (const [match, a, b] of matchRows) {
  tanks.write(join(OUT, 'tanks', `${match.toLowerCase().replace(' ', '-')}.parquet`), TANK_HINTS, (i) => i >= a && i < b);
}

// ------------------------------------------------------------------ air

const AIR_COLS = {
  time: 'DOUBLE', sortie: 'STRING', player_name: 'STRING', team: 'STRING',
  x: 'DOUBLE', y: 'DOUBLE', z: 'DOUBLE', yaw: 'DOUBLE', pitch: 'DOUBLE', roll: 'DOUBLE',
  event: 'STRING', other: 'STRING', vehicle: 'STRING', type: 'STRING', weapon: 'STRING', ai: 'INT32',
};
const AIR_HINTS = {
  columns: {
    x: 'x', y: 'y', z: 'z', time: 'time', timeUnit: 'seconds',
    personId: 'player_name', teamId: 'team', sessionId: 'sortie',
    lookMode: 'yawPitch', yaw: 'yaw', pitch: 'pitch', angleUnit: 'degrees',
    extra: ['event', 'other', 'vehicle', 'type', 'weapon', 'ai', 'roll'],
  },
  axes: { up: 'y' },
};
const air = new Table(AIR_COLS);
{
  const DT = 0.25;
  const planes = [];
  const blueTypes = ['F-16C_50', 'F-16C_50', 'F/A-18C', 'F/A-18C'];
  const redTypes = ['MiG-29A', 'MiG-29A', 'Su-27', 'Su-27'];
  for (const [team, list, side] of [['Blue', blueTypes, -1], ['Red', redTypes, 1]]) {
    list.forEach((vehicle, i) => {
      planes.push({
        name: `${team} ${i + 1}`, team, vehicle, type: 'Air+FixedWing', side, ai: i >= 2 ? 1 : 0, alive: true,
        x: side * 9000, z: -1500 + i * 1000, y: 3500 + i * 300, hdg: side < 0 ? 90 : 270, v: 240, pitch: 0, roll: 0,
        phase: rand(0, Math.PI * 2), fired: 0,
      });
    });
  }
  const weapons = [];
  let flares = 0;
  for (let k = 0; k * DT <= 240; k++) {
    const t = k * DT;
    for (const p of planes) {
      if (!p.alive) continue;
      const foes = planes.filter((q) => q.alive && q.team !== p.team);
      let want = p.hdg;
      if (foes.length) {
        const f = foes.reduce((a, b) => (Math.hypot(a.x - p.x, a.z - p.z) < Math.hypot(b.x - p.x, b.z - p.z) ? a : b));
        const d = Math.hypot(f.x - p.x, f.z - p.z);
        want = d > 2500 ? heading(f.x - p.x, f.z - p.z) : p.hdg + 25 * Math.sin(t / 9 + p.phase) + 20;
        // missiles
        if (d < 14000 && d > 1500 && p.fired < 2 && t > 20 + p.fired * 45 + (p.side > 0 ? 8 : 0) && R() < 0.02) {
          p.fired++;
          const w = p.team === 'Blue' ? 'AIM-120C' : 'R-27ER';
          const id = `${w} (${p.name} #${p.fired})`;
          weapons.push({ name: id, team: p.team, vehicle: w, type: 'Weapon+Missile', x: p.x, y: p.y, z: p.z, hdg: p.hdg, v: p.v, target: f, shooter: p, alive: true, born: t });
          air.push({ time: t, sortie: 'Sortie 1', player_name: p.name, team: p.team, x: p.x, y: p.y, z: p.z, yaw: p.hdg, pitch: p.pitch, roll: p.roll, event: 'launch', other: f.name, vehicle: p.vehicle, type: p.type, weapon: w, ai: p.ai });
          // the target defends with flares
          for (let j = 0; j < 3; j++) {
            flares++;
            weapons.push({ name: `Flare ${flares}`, team: f.team, vehicle: 'Flare', type: 'Misc+Decoy+Flare', x: f.x, y: f.y, z: f.z, hdg: f.hdg + 180, v: 40, flare: true, alive: true, born: t + 3 + j, die: t + 8 + j });
          }
        }
      }
      let turn = ((want - p.hdg + 540) % 360) - 180;
      const rate = clamp(turn, -14 * DT, 14 * DT);
      p.hdg = (p.hdg + rate + 360) % 360;
      p.roll = clamp(deg(Math.atan(((rate / DT) * Math.PI) / 180 * p.v / 9.81)), -80, 80);
      const climb = 30 * Math.sin(t / 15 + p.phase);
      p.pitch = deg(Math.atan2(climb, p.v));
      p.x += Math.sin((p.hdg * Math.PI) / 180) * p.v * DT;
      p.z -= Math.cos((p.hdg * Math.PI) / 180) * p.v * DT;
      p.y = clamp(p.y + climb * DT, 1500, 7000);
      air.push({ time: t, sortie: 'Sortie 1', player_name: p.name, team: p.team, x: p.x, y: p.y, z: p.z, yaw: p.hdg, pitch: p.pitch, roll: p.roll, event: 'position', vehicle: p.vehicle, type: p.type, ai: p.ai });
    }
    for (const w of weapons) {
      if (!w.alive || t < w.born) continue;
      if (w.flare) {
        w.y -= 25 * DT;
        w.x += Math.sin((w.hdg * Math.PI) / 180) * w.v * DT;
        w.z -= Math.cos((w.hdg * Math.PI) / 180) * w.v * DT;
        if (t > w.die) w.alive = false;
      } else {
        const tg = w.target;
        const d = Math.hypot(tg.x - w.x, tg.y - w.y, tg.z - w.z);
        w.v = Math.min(900, w.v + 60 * DT);
        const s = Math.min(1, (w.v * DT) / d);
        w.hdg = heading(tg.x - w.x, tg.z - w.z);
        w.x += (tg.x - w.x) * s;
        w.y += (tg.y - w.y) * s;
        w.z += (tg.z - w.z) * s;
        if (s >= 1 || !tg.alive) {
          w.alive = false;
          if (tg.alive && R() < 0.7) {
            tg.alive = false;
            air.push({ time: t, sortie: 'Sortie 1', player_name: tg.name, team: tg.team, x: tg.x, y: tg.y, z: tg.z, yaw: tg.hdg, pitch: 0, roll: 0, event: 'death', other: w.shooter.name, vehicle: tg.vehicle, type: tg.type, weapon: w.vehicle, ai: tg.ai });
            air.push({ time: t, sortie: 'Sortie 1', player_name: w.shooter.name, team: w.shooter.team, x: w.shooter.x, y: w.shooter.y, z: w.shooter.z, yaw: w.shooter.hdg, pitch: 0, roll: 0, event: 'kill', other: tg.name, vehicle: w.shooter.vehicle, type: w.shooter.type, weapon: w.vehicle, ai: w.shooter.ai });
          } else {
            air.push({ time: t, sortie: 'Sortie 1', player_name: w.name, team: w.team, x: w.x, y: w.y, z: w.z, yaw: w.hdg, pitch: 0, roll: 0, event: 'miss', vehicle: w.vehicle, type: w.type, ai: 1 });
          }
        }
      }
      air.push({ time: t, sortie: 'Sortie 1', player_name: w.name, team: w.team, x: w.x, y: w.y, z: w.z, yaw: w.hdg, pitch: 0, roll: 0, event: 'position', vehicle: w.vehicle, type: w.type, ai: 1 });
    }
  }
}
console.log('air rows', air.write(join(OUT, 'air.parquet'), AIR_HINTS));

// ------------------------------------------------------------------ shooter

const SHOOT_COLS = {
  time: 'DOUBLE', round: 'STRING', player_name: 'STRING', team: 'STRING',
  x: 'DOUBLE', y: 'DOUBLE', z: 'DOUBLE', yaw: 'DOUBLE',
  event: 'STRING', other: 'STRING', weapon: 'STRING', won: 'INT32',
  earn_credits: 'DOUBLE', cost_spent_credits: 'DOUBLE', helmet: 'INT32', inventory: 'STRING',
};
const SHOOT_HINTS = {
  columns: {
    x: 'x', y: 'y', z: 'z', time: 'time', timeUnit: 'seconds',
    personId: 'player_name', teamId: 'team', sessionId: 'round',
    lookMode: 'yawPitch', yaw: 'yaw', angleUnit: 'degrees',
    extra: ['event', 'other', 'weapon', 'won', 'earn_credits', 'cost_spent_credits', 'helmet', 'inventory'],
  },
  axes: { up: 'y' },
  entity: { size: 0.7 },
};
const LANES = {
  left: [{ x: -8, z: -70 }, { x: -65, z: -45 }, { x: -66, z: 15 }, { x: -50, z: 35 }],
  mid: [{ x: 0, z: -70 }, { x: 0, z: -25 }, { x: 0, z: 20 }, { x: rand(-40, 40), z: 40 }],
  right: [{ x: 8, z: -70 }, { x: 65, z: -45 }, { x: 66, z: 15 }, { x: 50, z: 35 }],
};
const PRICES = { 'Assault rifle': 2900, SMG: 1250, 'Sniper rifle': 4750, Shotgun: 1100, Pistol: 300 };
const shooter = new Table(SHOOT_COLS);
for (let r = 1; r <= 12; r++) {
  const round = `Round ${String(r).padStart(2, '0')}`;
  const first = shooter.n;
  const ps = [];
  for (const team of ['Blue', 'Red']) {
    for (let i = 0; i < 5; i++) {
      const weapon = i === 0 ? 'Sniper rifle' : pickOne(['Assault rifle', 'Assault rifle', 'SMG', 'Shotgun', 'Pistol']);
      const lane = team === 'Blue' ? pickOne(['left', 'mid', 'mid', 'right']) : null;
      const s0 = pickOne([{ x: -50, z: 35 }, { x: 50, z: 35 }, { x: 0, z: 10 }, { x: -30, z: 60 }, { x: 30, z: 60 }]);
      const site = team === 'Red' ? { x: s0.x + rand(-10, 10), z: s0.z + rand(-8, 8) } : null;
      ps.push({
        name: `${team} ${i + 1}`, team, weapon, lane, site, wp: 0, alive: true,
        helmet: R() < 0.7 ? 1 : 0, inventory: pickOne(['smoke|flash', 'flash', 'smoke', '']),
        x: team === 'Blue' ? rand(-20, 20) : rand(-20, 20), z: team === 'Blue' ? -72 : 72, yaw: team === 'Blue' ? 0 : 180,
      });
    }
  }
  let planted = false;
  let winner = null;
  const DT = 0.25;
  for (let k = 0; k * DT <= 90 && !winner; k++) {
    const t = k * DT;
    const ev = [];
    if (k === 0) for (const p of ps) ev.push({ p, event: 'spawn', cost: PRICES[p.weapon] });
    for (const p of ps) {
      if (!p.alive) continue;
      let goal;
      if (p.team === 'Blue') {
        const w = LANES[p.lane][Math.min(p.wp, 3)];
        p.off ??= LANES[p.lane].map(() => ({ x: rand(-7, 7), z: rand(-5, 5) }));
        goal = { x: w.x + p.off[Math.min(p.wp, 3)].x, z: w.z + p.off[Math.min(p.wp, 3)].z };
      }
      else goal = { x: p.site.x + 6 * Math.sin(t / 5 + p.x), z: p.site.z + 4 * Math.cos(t / 7) };
      const dx = goal.x - p.x;
      const dz = goal.z - p.z;
      const d = Math.hypot(dx, dz);
      if (d < 3 && p.team === 'Blue') p.wp++;
      if (d > 0.5) {
        const sp = (p.team === 'Blue' ? 4.5 : 2) * DT;
        p.x += (dx / d) * Math.min(sp, d);
        p.z += (dz / d) * Math.min(sp, d);
        p.yaw = heading(dx, dz);
      }
      if (p.team === 'Blue' && p.wp >= 3 && !planted && t > 30 && Math.abs(p.z - 35) < 6) {
        planted = true;
        ev.push({ p, event: 'plant' });
      }
    }
    for (const a of ps) {
      if (!a.alive) continue;
      for (const b of ps) {
        if (!b.alive || b.team === a.team) continue;
        const d = dist(a, b);
        if (d > (a.weapon === 'Sniper rifle' ? 70 : 30)) continue;
        a.yaw = heading(b.x - a.x, b.z - a.z);
        // the middle gap is a choke the attackers die in; the sites' cover helps the defenders
        const choke = Math.abs(b.x) < 6 && Math.abs(b.z) < 16 && b.team === 'Blue';
        const p = 0.02 + (choke ? 0.06 : 0) + (a.weapon === 'Sniper rifle' ? 0.02 : 0) - (b.helmet ? 0.01 : 0);
        if (R() < 0.3) ev.push({ p: a, event: 'fire', other: b.name, weapon: a.weapon });
        if (R() < p) {
          b.alive = false;
          ev.push({ p: b, event: 'death', other: a.name, weapon: a.weapon });
          ev.push({ p: a, event: 'kill', other: b.name, weapon: a.weapon, earn: a.weapon === 'Shotgun' ? 900 : a.weapon === 'SMG' ? 600 : 300 });
          break;
        }
      }
    }
    const blueUp = ps.some((p) => p.team === 'Blue' && p.alive);
    const redUp = ps.some((p) => p.team === 'Red' && p.alive);
    if (!blueUp) winner = 'Red';
    else if (!redUp) winner = 'Blue';
    else if (t >= 90) winner = planted ? 'Blue' : 'Red';
    for (const p of ps) {
      if (!p.alive && !ev.some((e) => e.p === p)) continue;
      shooter.push({ time: t, round, player_name: p.name, team: p.team, x: p.x, y: yardH(p.x, p.z), z: p.z, yaw: p.yaw, event: 'position', weapon: p.weapon, helmet: p.helmet, inventory: p.inventory });
    }
    for (const e of ev) {
      const p = e.p;
      shooter.push({ time: t + 0.1, round, player_name: p.name, team: p.team, x: p.x, y: yardH(p.x, p.z), z: p.z, yaw: p.yaw, event: e.event, other: e.other, weapon: e.weapon ?? p.weapon, earn_credits: e.earn, cost_spent_credits: e.cost, helmet: p.helmet, inventory: p.inventory });
    }
  }
  winner ??= 'Red';
  for (let i = first; i < shooter.n; i++) shooter.data.won[i] = shooter.data.team[i] === winner ? 1 : 0;
}
console.log('shooter rows', shooter.write(join(OUT, 'shooter.parquet'), SHOOT_HINTS));
console.log('written to', OUT);
