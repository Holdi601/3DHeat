/**
 * A Counter-Strike 2 match table's hits on players (docs/person-hits.md): the
 * `hurt` rows (one per `player_hurt`), tied to the `kill` rows of the same
 * moment and to the players' own samples (`position` rows, 8 a second) for
 * the shooter's place, both players' movement and the victim's helmet.
 *
 * Pure: columns in (`TableColumns`, as `scan.ts` reads them), a block out.
 */

import { angleFromFacing, BlockBuilder, hitGroupOf, SRC_DERIVED, SRC_ESTIMATE, SRC_RECORDED, type PersonBlock, type PersonMatch } from './types';
import { cs2Falloff, cs2Weapon, type Cs2Numbers } from './weapons';
import type { TableColumns } from './table';

/** Rows a CS2 load reads, and their columns (those a file lacks are left out). */
export const CS2_EVENTS = ['hurt', 'kill', 'position'];
export const CS2_NUMBERS = ['state_helmet', 'round', 'x', 'y', 'z', 'dirX', 'dirY', 'dirZ', 'damage', 'health', 'armor', 'armorDamage', 'penetrated', 'throughSmoke', 'distance', 'hitLocalX', 'hitLocalY', 'hitLocalZ', 'hitDirX', 'hitDirY', 'hitDirZ', 'helmet', 'walking', 'duck', 'airborne', 'scoped', 'won', 'headshot', 'attackerX', 'attackerY', 'attackerZ', 'attackerSpeed', 'victimSpeed', 'armorBefore', 'wallbang', 'wallCount', 'wallThickness', 'wallGrates'];
export const CS2_TEXTS = ['event', 'player', 'other', 'side', 'weapon', 'hitgroup', 'detail', 'attackerSide', 'wallSurfaces'];

/** Whether a table's columns are a CS2 match table's (it has the hurt rows' own columns). */
export function isCs2Table(available: Set<string>): boolean {
  return available.has('event') && available.has('hitgroup') && available.has('armorDamage') && available.has('steamid');
}

/** Game units (inches) to metres. */
const M = 0.0254;
/** Eye height over the feet, standing, game units. */
const EYE = 64;

interface Track {
  t: number[];
  x: number[];
  y: number[];
  z: number[];
  fx: number[];
  fy: number[];
  helmet: number[];
  walking: number[];
  duck: number[];
  airborne: number[];
  scoped: number[];
  side: string[];
}

function nearestIndex(times: number[], t: number): number {
  let lo = 0, hi = times.length - 1;
  if (hi < 0) return -1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (times[mid] < t) lo = mid + 1;
    else hi = mid;
  }
  if (lo > 0 && Math.abs(times[lo - 1] - t) <= Math.abs(times[lo] - t)) lo--;
  return lo;
}

/** A sample within `within` seconds of `t`, its index, or -1. */
function sampleAt(tr: Track | undefined, t: number, within = 0.3): number {
  if (!tr) return -1;
  const k = nearestIndex(tr.t, t);
  return k >= 0 && Math.abs(tr.t[k] - t) <= within ? k : -1;
}

/** Speed from the samples about `k`, m/s (NaN when there are none to tell). */
function speedAt(tr: Track, k: number): number {
  const a = Math.max(0, k - 1), b = Math.min(tr.t.length - 1, k + 1);
  const dt = tr.t[b] - tr.t[a];
  if (!(dt > 0) || dt > 0.6) return NaN;
  return (Math.hypot(tr.x[b] - tr.x[a], tr.y[b] - tr.y[a]) * M) / dt;
}

function stateOf(tr: Track, k: number, speed: number, scopedToo: boolean): string {
  if (tr.airborne[k] > 0) return 'airborne';
  if (tr.duck[k] > 0.5) return 'crouched';
  if (scopedToo && tr.scoped[k] > 0) return Number.isFinite(speed) && speed > 0.5 ? 'scoped, moving' : 'scoped';
  if (!Number.isFinite(speed)) return '';
  if (speed < 0.5) return 'standing';
  if (tr.walking[k] > 0 || speed < 3.4) return 'walking';
  return 'running';
}

/** `dmg_health` (before the cap) from a hurt row's detail. */
function rawDamage(detail: string): number {
  const m = /"dmg_health":(-?\d+(?:\.\d+)?)/.exec(detail);
  return m ? Number(m[1]) : NaN;
}

export function extractCs2Hits(c: TableColumns, match: PersonMatch): PersonBlock {
  const t0 = performance.now();
  const ev = c.txt.event!;
  const txt = (name: string, r: number): string => {
    const col = c.txt[name];
    return col ? col.dict[col.ids[r]] : '';
  };
  const num = (name: string, r: number): number => {
    const col = c.num[name];
    return col ? col[r] : NaN;
  };
  // The players' samples, by name (the hurt rows name the shooter only by name).
  const tracks = new Map<string, Track>();
  const kills: number[] = [];
  const hurts: number[] = [];
  for (let r = 0; r < c.rows; r++) {
    const e = ev.dict[ev.ids[r]];
    if (e === 'hurt') hurts.push(r);
    else if (e === 'kill') kills.push(r);
    else if (e === 'position') {
      const name = txt('player', r);
      if (!name) continue;
      let tr = tracks.get(name);
      if (!tr) tracks.set(name, (tr = { t: [], x: [], y: [], z: [], fx: [], fy: [], helmet: [], walking: [], duck: [], airborne: [], scoped: [], side: [] }));
      tr.t.push(c.time[r]);
      tr.x.push(num('x', r));
      tr.y.push(num('y', r));
      tr.z.push(num('z', r));
      tr.fx.push(num('dirX', r));
      tr.fy.push(num('dirY', r));
      tr.helmet.push(num('helmet', r));
      tr.walking.push(num('walking', r));
      tr.duck.push(num('duck', r));
      tr.airborne.push(num('airborne', r));
      tr.scoped.push(num('scoped', r));
      tr.side.push(txt('side', r));
    }
  }
  // Kills by victim and time: the killing hurt row takes their penetration and distance.
  const killAt = new Map<string, number[]>();
  for (const r of kills) {
    const key = `${txt('other', r)}|${c.time[r].toFixed(3)}`;
    const list = killAt.get(key);
    if (list) list.push(r);
    else killAt.set(key, [r]);
  }
  const b = new BlockBuilder(hurts.length);
  for (const r of hurts) {
    const victim = txt('player', r), shooter = txt('other', r);
    const weapon = txt('weapon', r);
    const t = c.time[r];
    const i = b.row();
    const { num: N, int: I, src: S } = b.cols;
    N.time[i] = t;
    I.game[i] = 1;
    I.round[i] = Number.isFinite(num('round', r)) ? num('round', r) : 0;
    b.text(i, 'victim', victim);
    b.text(i, 'shooter', shooter || 'world');
    const vSide = txt('side', r);
    b.text(i, 'victimSide', vSide);
    const x = num('x', r), y = num('y', r), z = num('z', r);
    N.x[i] = x;
    N.y[i] = y;
    N.z[i] = z;
    // Where on the body, how much: the event's own.
    const group = hitGroupOf(txt('hitgroup', r));
    I.hitgroup[i] = group;
    S.hitgroup[i] = txt('hitgroup', r) ? SRC_RECORDED : 0;
    const health = num('health', r);
    N.damage[i] = num('damage', r);
    N.damageRaw[i] = rawDamage(txt('detail', r));
    N.healthBefore[i] = Number.isFinite(health) && Number.isFinite(N.damage[i]) ? health + N.damage[i] : NaN;
    const armorAfter = num('armor', r), armorLost = num('armorDamage', r);
    N.armorDamage[i] = Number.isFinite(armorLost) ? armorLost : 0;
    S.damage[i] = Number.isFinite(N.damage[i]) ? SRC_RECORDED : 0;
    const before = Number.isFinite(num('armorBefore', r)) ? num('armorBefore', r) : Number.isFinite(armorAfter) ? armorAfter + N.armorDamage[i] : NaN;
    N.armorBefore[i] = before;
    // The game's rule: armour takes half of the damage it keeps off (armour bonus 0.5), so it kept off twice what it lost.
    N.absorbed[i] = Number.isFinite(armorLost) ? 2 * armorLost : NaN;
    S.absorbed[i] = Number.isFinite(armorLost) ? SRC_DERIVED : 0;
    // The victim's and the shooter's samples about the hit.
    const vt = tracks.get(victim), st = shooter ? tracks.get(shooter) : undefined;
    const vk = sampleAt(vt, t), sk = sampleAt(st, t);
    // The helmet: the victim's state on the row itself (newer tables), else their sample.
    const helmet = Number.isFinite(num('state_helmet', r)) ? num('state_helmet', r) : Number.isFinite(num('helmet', r)) ? num('helmet', r) : vk >= 0 ? vt!.helmet[vk] : NaN;
    I.helmet[i] = Number.isFinite(helmet) ? (helmet > 0 ? 1 : 0) : -1;
    if (Number.isFinite(before)) {
      const kind = before > 0 ? (I.helmet[i] === 1 ? 'kevlar + helmet' : I.helmet[i] === 0 ? 'kevlar' : 'kevlar (helmet ?)') : I.helmet[i] === 1 ? 'helmet only' : 'none';
      b.text(i, 'armor', kind);
      S.armor[i] = SRC_RECORDED;
    }
    // Weapon: the event's; its class and calibre from the real weapon (an estimate), its numbers from the install.
    b.text(i, 'weapon', weapon);
    S.weapon[i] = weapon ? SRC_RECORDED : 0;
    const facts = cs2Weapon(weapon);
    if (facts) {
      b.text(i, 'weaponClass', facts.cls);
      b.text(i, 'ammo', facts.ammo);
      b.text(i, 'ammoType', facts.ammoType);
      N.calibre[i] = facts.calibre;
      S.calibre[i] = Number.isFinite(facts.calibre) ? SRC_ESTIMATE : 0;
    }
    // The killing hit: the kill row of the same victim and moment.
    const killed = Number.isFinite(health) ? health <= 0 : false;
    I.kill[i] = Number.isFinite(health) ? (killed ? 1 : 0) : -1;
    S.kill[i] = Number.isFinite(health) ? SRC_RECORDED : 0;
    let killRow = -1;
    if (killed) {
      const list = killAt.get(`${victim}|${t.toFixed(3)}`);
      if (list) killRow = list.find((k) => txt('player', k) === shooter) ?? list[0];
    }
    // Through a wall: the game's own on the kill (recorded, it wins for the killing hit); on every other hit the shot
    // traced through the map's collision by the CS2 tool (1.3.0 `wallbang`, derived). Not traced (no map geometry, a
    // grenade, fire or a fall): not known, as in older tables.
    const pen = Number.isFinite(num('penetrated', r)) ? num('penetrated', r) : killRow >= 0 ? num('penetrated', killRow) : NaN;
    const traced = num('wallbang', r);
    if (Number.isFinite(pen)) {
      I.penetrated[i] = pen > 0 ? 1 : 0;
      S.penetration[i] = SRC_RECORDED;
    } else if (Number.isFinite(traced)) {
      I.penetrated[i] = traced > 0 ? 1 : 0;
      S.penetration[i] = SRC_DERIVED;
    }
    // What the trace passed, kept on the killing hit too: solid objects, their thickness in all, the materials, fences.
    const walls = num('wallCount', r), thick = num('wallThickness', r), grates = num('wallGrates', r);
    if (Number.isFinite(walls)) I.walls[i] = Math.min(32767, Math.max(0, Math.round(walls)));
    if (Number.isFinite(thick)) I.wallMm[i] = Math.min(32767, Math.max(0, Math.round(thick * 1000)));
    if (Number.isFinite(grates)) I.grates[i] = Math.min(32767, Math.max(0, Math.round(grates)));
    b.text(i, 'wallSurfaces', txt('wallSurfaces', r));
    const smoke = Number.isFinite(num('throughSmoke', r)) ? num('throughSmoke', r) : killRow >= 0 ? num('throughSmoke', killRow) : NaN;
    if (Number.isFinite(smoke)) I.smoke[i] = smoke > 0 ? 1 : 0;
    // The shooter's place: on the row (newer tables), else their sample.
    let sx = num('attackerX', r), sy = num('attackerY', r), sz = num('attackerZ', r);
    if (!Number.isFinite(sx) && sk >= 0) {
      sx = st!.x[sk];
      sy = st!.y[sk];
      sz = st!.z[sk];
    }
    const dRow = Number.isFinite(num('distance', r)) ? num('distance', r) : killRow >= 0 ? num('distance', killRow) : NaN;
    if (Number.isFinite(dRow)) {
      N.distance[i] = dRow;
      S.distance[i] = SRC_RECORDED;
    } else if (Number.isFinite(sx) && Number.isFinite(x)) {
      N.distance[i] = Math.hypot(sx - x, sy - y, sz - z) * M;
      S.distance[i] = SRC_DERIVED;
    }
    // From where, against the way the victim faced, best first: the victim's facing and the shooter's place written on
    // the hit (CS2 tool 1.2.0: both at the event's tick); the shot's traced way in the victim's frame (the event's own
    // view angles: within a degree or two of the first); the 8-a-second samples (a turn between two can be far off).
    const rowFx = num('dirX', r), rowFy = num('dirY', r);
    const dx = num('hitDirX', r), dz = num('hitDirZ', r);
    if (Number.isFinite(rowFx) && Number.isFinite(num('attackerX', r)) && Number.isFinite(x)) {
      N.angle[i] = angleFromFacing(rowFx, rowFy, sx - x, sy - y);
      N.elevation[i] = (Math.atan2(sz + EYE - (z + EYE * 0.8), Math.hypot(sx - x, sy - y)) * 180) / Math.PI;
    } else if (Number.isFinite(dx) && Number.isFinite(dz) && Math.hypot(dx, dz) > 1e-6) {
      N.angle[i] = (Math.acos(Math.max(-1, Math.min(1, -dx / Math.hypot(dx, dz)))) * 180) / Math.PI;
      N.elevation[i] = (Math.asin(Math.max(-1, Math.min(1, -num('hitDirY', r)))) * 180) / Math.PI;
    } else if (vk >= 0 && Number.isFinite(sx) && Number.isFinite(x)) {
      N.angle[i] = angleFromFacing(vt!.fx[vk], vt!.fy[vk], sx - x, sy - y);
      N.elevation[i] = (Math.atan2(sz + EYE - (z + EYE * 0.8), Math.hypot(sx - x, sy - y)) * 180) / Math.PI;
    }
    if (Number.isFinite(N.angle[i])) S.angle[i] = SRC_DERIVED;
    N.localX[i] = num('hitLocalX', r);
    N.localY[i] = num('hitLocalY', r);
    N.localZ[i] = num('hitLocalZ', r);
    // Movement and the shooter's side.
    const vSpeed = Number.isFinite(num('victimSpeed', r)) ? num('victimSpeed', r) : vk >= 0 ? speedAt(vt!, vk) : NaN;
    N.victimSpeed[i] = vSpeed;
    if (vk >= 0) {
      b.text(i, 'victimState', stateOf(vt!, vk, vSpeed, false));
      S.victimMove[i] = Number.isFinite(num('victimSpeed', r)) ? SRC_RECORDED : SRC_DERIVED;
    }
    const sSpeed = Number.isFinite(num('attackerSpeed', r)) ? num('attackerSpeed', r) : sk >= 0 ? speedAt(st!, sk) : NaN;
    N.shooterSpeed[i] = sSpeed;
    if (sk >= 0) {
      b.text(i, 'shooterState', stateOf(st!, sk, sSpeed, true));
      S.shooterMove[i] = Number.isFinite(num('attackerSpeed', r)) ? SRC_RECORDED : SRC_DERIVED;
    }
    const sSide = txt('attackerSide', r) || (sk >= 0 ? st!.side[sk] : '');
    b.text(i, 'shooterSide', sSide);
    I.team[i] = sSide && vSide && sSide === vSide ? 1 : 0;
    const won = num('won', r);
    I.won[i] = Number.isFinite(won) ? (won > 0 ? 1 : 0) : -1;
  }
  return b.done(match, c.rows, performance.now() - t0);
}

/** The game's own damage at a distance for a weapon (unarmoured body), from the install's numbers. */
export function cs2Expected(numbers: Map<string, Cs2Numbers>, weapon: string, metres: number): number {
  const n = numbers.get(weapon);
  return n ? cs2Falloff(n, metres) : NaN;
}
