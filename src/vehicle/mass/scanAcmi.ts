/**
 * One DCS World recording's hits for the mass analysis, from its converted
 * `.3dheat` (`tools/acmi-to-parquet.mjs`): the hit rows the converter
 * worked out (`Event` hit, at the weapon: shells and bullets in the effects
 * table, the rest in the main one), the deaths and ejections that follow
 * them, and the damage rows for each unit's side and whether the AI drove it.
 *
 * What a hit holds, and where from (docs/vehicle-hits.md):
 *
 *   weapon, shooter, unit hit   recorded (the weapon object's name, the
 *                               launcher and unit worked out by the converter)
 *   calibre, type               derived from the weapon's name (`ammo.ts`)
 *   point                       estimate: where the weapon's path passed
 *                               nearest the unit's reference point, in its
 *                               frame (`hitLocal*`); the plates' ray entry
 *                               along the way in makes the point on the model
 *   way in, impact speed,       derived from the weapon's and the unit's
 *   distance from the launch    samples (`hitDir*`, `impactSpeed`,
 *                               `launchDistance`)
 *   lethal, killing shot        derived: the unit's death the converter
 *                               worked out, by the hit's shooter
 *   bail-out                    derived: an ejection from the unit after a hit
 *
 * A recording converted before the geometry columns has the weapon, the
 * shooter, the unit and the deaths only: its hits come without a point, a
 * way in, a speed or a distance (each one unknown, as the filters say).
 */

import {
  allocColumns,
  EFFECT_BIT,
  FATAL_WINDOW,
  FLAG_ATTACKER_AI,
  FLAG_DIR,
  FLAG_DIST,
  FLAG_LOCAL,
  FLAG_RESULT_KNOWN,
  FLAG_VICTIM_AI,
  FLAG_WON,
  FLAG2_CALIBRE_NAMED,
  FLAG2_DIR_DERIVED,
  FLAG2_DIST_LAUNCH,
  FLAG2_LOCAL_EST,
  FLAG2_RESULT_DERIVED,
  FLAG2_SPEED,
  NONE16,
  NONE8,
  R_KILL,
  R_UNKNOWN,
  sliceColumns,
  type HitBlock,
  type HitMatch,
} from './types';
import { dcsAmmo } from './ammo';

/** The events a DCS hit load reads. */
export const ACMI_HIT_EVENTS = ['hit', 'damage', 'death', 'eject'];
export const ACMI_NUMBER_COLUMNS = ['Altitude', 'hitLocalX', 'hitLocalY', 'hitLocalZ', 'hitDirX', 'hitDirY', 'hitDirZ', 'impactSpeed', 'launchDistance', 'impactDescent', 'won'];
export const ACMI_TEXT_COLUMNS = ['Event', 'Name', 'Type', 'WeaponType', 'Object', 'Shooter', 'Target', 'OtherVehicle', 'ShooterVehicle', 'Actor', 'Coalition'];

/** Seconds after a hit within which the unit's death or its crew's ejection is put down to it. */
const DEATH_WINDOW = 120;

/** Whether a table's columns are a converted Tacview recording's. */
export function isAcmiTable(available: Set<string>): boolean {
  return available.has('Event') && available.has('Object') && available.has('Inferred') && available.has('Time');
}

export interface AcmiScanColumns {
  rows: number;
  time: Float64Array;
  num: Partial<Record<string, Float32Array | Float64Array>>;
  txt: Partial<Record<string, { ids: Uint32Array; dict: string[] }>>;
}

class Dict {
  readonly list: string[] = [''];
  private readonly m = new Map<string, number>([['', 0]]);
  code(s: string): number {
    let c = this.m.get(s);
    if (c === undefined) {
      c = this.list.length;
      this.list.push(s);
      this.m.set(s, c);
    }
    return c;
  }
}

/** A Tacview object label's vehicle and pilot: "Pilot (Vehicle) #id". */
export function labelParts(label: string): { pilot: string; vehicle: string } {
  const m = /^(.*?)\s*\(([^()]*)\)\s*#[0-9a-f]+$/i.exec(label);
  if (!m) return { pilot: label.replace(/\s*#[0-9a-f]+$/i, ''), vehicle: '' };
  return { pilot: m[1].trim(), vehicle: m[2].trim() };
}

const q16 = (v: number, scale: number) => (Number.isFinite(v) ? Math.max(-32767, Math.min(32767, Math.round(v * scale))) : NONE16);
const q8 = (v: number) => (Number.isFinite(v) ? Math.max(-127, Math.min(127, Math.round(v * 127))) : NONE8);

/** The hits of one recording from its tables' hit, damage, death and ejection rows (any number of tables). */
export function extractAcmiHits(tables: AcmiScanColumns[], match: HitMatch): Omit<HitBlock, 'rows' | 'kept' | 'ms' | 'native'> {
  interface Row { t: number; ev: string; get: (c: string) => string; num: (c: string) => number }
  const rows: Row[] = [];
  for (const c of tables) {
    for (let r = 0; r < c.rows; r++) {
      const get = (name: string) => {
        const col = c.txt[name];
        return col ? (col.dict[col.ids[r]] ?? '') : '';
      };
      const num = (name: string) => {
        const col = c.num[name];
        return col ? col[r] : NaN;
      };
      rows.push({ t: c.time[r], ev: get('Event'), get, num });
    }
  }
  rows.sort((a, b) => a.t - b.t);
  const t0 = rows.length ? rows[0].t : 0;

  // Each unit's side and whether the AI drove it, from the rows standing on it.
  const sideOf = new Map<string, string>();
  const aiOf = new Map<string, boolean>();
  // Whether its side won (the converter's `won`, by the row's colour, where a rounds file says).
  const wonOf = new Map<string, number>();
  for (const r of rows) {
    if (r.ev !== 'damage' && r.ev !== 'death' && r.ev !== 'eject') continue;
    const o = r.get('Object');
    if (!sideOf.has(o)) sideOf.set(o, r.get('Coalition'));
    if (!aiOf.has(o)) aiOf.set(o, r.get('Actor') === 'ai');
    const w = r.num('won');
    if (!wonOf.has(o) && Number.isFinite(w)) wonOf.set(o, w);
  }

  const hits = rows.filter((r) => r.ev === 'hit' && r.get('Target'));
  const out = allocColumns(hits.length);
  const vehicles = new Dict(), players = new Dict(), teams = new Dict(), types = new Dict(), names = new Dict();
  const lifeOfHit: string[] = new Array(hits.length);
  const shooterOfHit: string[] = new Array(hits.length);
  const sides = new Set<string>();
  for (let i = 0; i < hits.length; i++) {
    const r = hits[i];
    const target = r.get('Target'), shooter = r.get('Shooter');
    const tp = labelParts(target), sp = labelParts(shooter);
    out.match[i] = 0;
    out.time[i] = r.t - t0;
    out.victim[i] = vehicles.code(r.get('OtherVehicle') || tp.vehicle);
    out.attacker[i] = vehicles.code(r.get('ShooterVehicle') || sp.vehicle);
    out.victimPlayer[i] = players.code(tp.pilot);
    out.attackerPlayer[i] = players.code(sp.pilot);
    const at = r.get('Coalition');
    if (at) sides.add(at);
    out.attackerTeam[i] = teams.code(at);
    const vt = sideOf.get(target) ?? '';
    if (vt) sides.add(vt);
    out.victimTeam[i] = teams.code(vt);
    out.part[i] = -1;
    let flags = 0, flags2 = 0;
    const lx = r.num('hitLocalX'), ly = r.num('hitLocalY'), lz = r.num('hitLocalZ');
    if (Number.isFinite(lx) && Number.isFinite(ly) && Number.isFinite(lz)) {
      out.lx[i] = q16(lx, 1000);
      out.ly[i] = q16(ly, 1000);
      out.lz[i] = q16(lz, 1000);
      flags |= FLAG_LOCAL;
      flags2 |= FLAG2_LOCAL_EST;
    } else out.lx[i] = out.ly[i] = out.lz[i] = NONE16;
    const dx = r.num('hitDirX'), dy = r.num('hitDirY'), dz = r.num('hitDirZ');
    const dl = Math.hypot(dx, dy, dz);
    if (Number.isFinite(dl) && dl > 1e-6) {
      out.dx[i] = q8(dx / dl);
      out.dy[i] = q8(dy / dl);
      out.dz[i] = q8(dz / dl);
      flags |= FLAG_DIR;
      flags2 |= FLAG2_DIR_DERIVED;
    } else out.dx[i] = out.dy[i] = out.dz[i] = NONE8;
    const d = r.num('launchDistance');
    if (Number.isFinite(d)) {
      out.dist[i] = Math.min(0xfffe, Math.round(d * 4));
      flags |= FLAG_DIST;
      flags2 |= FLAG2_DIST_LAUNCH;
    } else out.dist[i] = 0xffff;
    out.dh[i] = NONE16;
    out.yaw[i] = out.pitch[i] = NONE16;
    const sp2 = r.num('impactSpeed');
    if (Number.isFinite(sp2) && sp2 > 0) {
      out.speed[i] = Math.min(65535, Math.round(sp2));
      flags2 |= FLAG2_SPEED;
    }
    const ammo = dcsAmmo(r.get('Name'), r.get('WeaponType') || r.get('Type'));
    out.calibre[i] = ammo.calibre !== null ? Math.min(65535, Math.round(ammo.calibre * 10)) : 0;
    out.ammoType[i] = Math.min(65535, types.code(ammo.type || ammo.kind));
    out.ammoName[i] = Math.min(65535, names.code(ammo.name));
    if (ammo.src !== 'unknown') flags2 |= FLAG2_CALIBRE_NAMED;
    out.result[i] = R_UNKNOWN;
    if (r.get('Actor') === 'ai') flags |= FLAG_ATTACKER_AI;
    if (aiOf.get(target)) flags |= FLAG_VICTIM_AI;
    out.flags[i] = flags;
    out.flags2[i] = flags2;
    lifeOfHit[i] = target;
    shooterOfHit[i] = shooter;
  }

  // The hits on each unit, in time order (the rows are).
  const byLife = new Map<string, number[]>();
  for (let i = 0; i < hits.length; i++) {
    let l = byLife.get(lifeOfHit[i]);
    if (!l) byLife.set(lifeOfHit[i], (l = []));
    l.push(i);
  }
  for (const r of rows) {
    if (r.ev !== 'death' && r.ev !== 'eject') continue;
    const l = byLife.get(r.get('Object'));
    if (!l) continue;
    const t = r.t - t0;
    if (r.ev === 'death') {
      const killer = r.get('Shooter');
      // The killing shot: the killer's last hit on it before (the converter put the death down to it).
      let last = -1;
      for (const i of l) {
        if (out.time[i] > t + 0.2) break;
        if (out.time[i] >= t - DEATH_WINDOW && (!killer || shooterOfHit[i] === killer)) last = i;
      }
      if (last < 0) continue;
      out.effects[last] |= EFFECT_BIT.killingShot | EFFECT_BIT.lethal;
      // Its result: the kill, worked out from the death (the recording has no hit result).
      out.result[last] = R_KILL;
      out.flags2[last] |= FLAG2_RESULT_DERIVED;
      // The killer's hits of the same pass (within the window before the killing shot) count towards it.
      for (const i of l) if (i !== last && shooterOfHit[i] === shooterOfHit[last] && out.time[i] <= out.time[last] && out.time[i] >= out.time[last] - FATAL_WINDOW) out.effects[i] |= EFFECT_BIT.lethal;
    } else {
      let last = -1;
      for (const i of l) {
        if (out.time[i] > t + 0.2) break;
        if (out.time[i] >= t - DEATH_WINDOW) last = i;
      }
      if (last >= 0) out.effects[last] |= EFFECT_BIT.bailout;
    }
  }
  // Who won, by side; a unit's side unknown: the other of two.
  const two = [...sides];
  for (let i = 0; i < hits.length; i++) {
    let vt = teams.list[out.victimTeam[i]];
    if (!vt && two.length === 2) {
      const at = teams.list[out.attackerTeam[i]];
      vt = at === two[0] ? two[1] : at === two[1] ? two[0] : '';
      out.victimTeam[i] = teams.code(vt);
    }
    const won = wonOf.get(lifeOfHit[i]);
    if (won !== undefined) {
      out.flags[i] |= FLAG_RESULT_KNOWN;
      if (won > 0) out.flags[i] |= FLAG_WON;
    }
  }
  const cols = out.n === hits.length ? out : sliceColumns(out, hits.length);
  return { cols, vehicles: vehicles.list, players: players.list, teams: teams.list, ammoTypes: types.list, ammoNames: names.list, match };
}
