/**
 * The hits a Tacview recording holds. ACMI has no hit event with a point:
 * what it gives is
 *
 *   - weapons as objects of their own, with their launcher (`Parent`), that
 *     end (`-id`, "Removed") where they burst - a weapon ending within
 *     `PROXIMITY` metres of an aircraft, vehicle or ship (not its launcher)
 *     is a hit on that unit, placed where the weapon was in the unit's frame
 *     (from its heading, pitch and roll), coming the way the weapon flew;
 *   - `Timeout` events (SourceId, TargetId, AmmoType, Outcome): a weapon's
 *     result as the recorder judged it - the outcome of a hit found above, or
 *     a hit without a point;
 *   - `Health` (1 new, 0 out of combat): each fall is damage - on the hit of
 *     that moment, or a hit without a point;
 *   - `Destroyed`: the unit's death - the last hit on it before is the
 *     killing one, else a kill without a point or a shooter.
 */

import type { AttributeColumn, Dataset } from '../state/types';
import type { Vec3 } from '../race/geometry';
import type { Outcome, VehicleHit } from './hits';
import { bodyAxes, personRows } from '../data/flight';
import { trackName, unitsPerMetre } from '../ui/replay/replayData';

/** Metres from a unit within which a weapon's end is a hit on it (a missile's proximity fuse and more). */
export const PROXIMITY = 30;
/** Seconds before a death in which the last hit on the unit is the killing one. */
const KILL_WINDOW = 6;
/** Seconds within which a Timeout or a fall of health belongs to a hit found by proximity. */
const PAIR_WINDOW = 3;

const WEAPON = /weapon|missile|rocket|bomb|projectile|shell|torpedo|bullet|grenade/i;
const DECOY = /decoy|flare|chaff|parachute|navaid|bullseye|waypoint|misc/i;

function attr(d: Dataset, name: string): AttributeColumn | null {
  const n = name.toLowerCase();
  return d.attrs.find((a) => a.name.toLowerCase() === n) ?? null;
}

function textOf(a: AttributeColumn | null): (r: number) => string {
  if (!a) return () => '';
  if (a.kind === 'category' && a.categories) {
    const ids = a.data as Uint32Array;
    const cats = a.categories;
    return (r) => cats[ids[r]] ?? '';
  }
  const data = a.data as Float32Array;
  return (r) => (Number.isFinite(data[r]) ? String(data[r]) : '');
}

/** Whether the dataset is a Tacview recording as `data/acmi.ts` reads it. */
export function isAcmiData(d: Dataset): boolean {
  return !!d.personId && !!attr(d, 'EventObjects') && !!attr(d, 'Type') && !!attr(d, 'Event');
}

interface Track {
  person: number;
  id: string;
  type: string;
  name: string;
  label: string;
  weapon: boolean;
  target: boolean;
  parent: string;
  t0: number;
  t1: number;
}

export function acmiHits(d: Dataset): { hits: VehicleHit[]; kinds: Map<string, string> } {
  const hits: VehicleHit[] = [];
  const kinds = new Map<string, string>();
  const rows = personRows(d);
  const time = d.time;
  if (!rows || !time) return { hits, kinds };
  const type = textOf(attr(d, 'Type'));
  const nameCol = textOf(attr(d, 'Name'));
  const parentCol = textOf(attr(d, 'Parent'));
  const event = textOf(attr(d, 'Event'));
  const rollA = attr(d, 'Roll');
  const roll = rollA && rollA.kind !== 'category' ? (rollA.data as Float32Array) : null;
  const healthA = attr(d, 'Health');
  const health = healthA && healthA.kind !== 'category' ? (healthA.data as Float32Array) : null;
  const sessionLabel = (r: number) => (d.sessionId ? (d.sessionLabels[d.sessionId[r]] ?? '') : '');
  const k = unitsPerMetre(d);

  const persons = d.personLabels.length;
  const tracks: Track[] = [];
  const byId = new Map<string, Track>();
  for (let p = 0; p < persons; p++) {
    const a = rows.start[p], b = rows.start[p + 1];
    if (b <= a) continue;
    const first = rows.rows[a];
    const label = d.personLabels[p] ?? '';
    const id = /#([0-9a-f]+)$/i.exec(label)?.[1]?.toLowerCase() ?? '';
    const ty = type(first);
    let parent = '';
    for (let i = a; i < b && !parent; i++) parent = parentCol(rows.rows[i]).trim().toLowerCase();
    const weapon = WEAPON.test(ty);
    const tr: Track = {
      person: p,
      id,
      type: ty,
      name: nameCol(first) || ty,
      label: trackName(d, p, first),
      weapon,
      target: !weapon && !DECOY.test(ty) && !!id,
      parent,
      t0: time[first],
      t1: time[rows.rows[b - 1]],
    };
    tracks.push(tr);
    if (id) byId.set(id, tr);
  }

  // A track's row nearest `t` (within its span), and its place there between its samples.
  const rowAt = (p: number, t: number): number => {
    let lo = rows.start[p], hi = rows.start[p + 1] - 1;
    if (hi < lo) return -1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (time[rows.rows[mid]] < t) lo = mid + 1;
      else hi = mid;
    }
    const a = rows.rows[lo];
    const b = lo > rows.start[p] ? rows.rows[lo - 1] : a;
    return Math.abs(time[a] - t) <= Math.abs(time[b] - t) ? a : b;
  };
  const placeAt = (p: number, t: number): Vec3 | null => {
    let lo = rows.start[p], hi = rows.start[p + 1] - 1;
    if (hi < lo) return null;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (time[rows.rows[mid]] < t) lo = mid + 1;
      else hi = mid;
    }
    const b = rows.rows[lo];
    const a = lo > rows.start[p] ? rows.rows[lo - 1] : b;
    const ta = time[a], tb = time[b];
    const f = tb > ta ? Math.max(0, Math.min(1, (t - ta) / (tb - ta))) : 0;
    const x = d.px[a] + (d.px[b] - d.px[a]) * f, y = d.py[a] + (d.py[b] - d.py[a]) * f, z = d.pz[a] + (d.pz[b] - d.pz[a]) * f;
    return Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z) ? [x, y, z] : null;
  };
  // A world offset (data units) in a unit's frame at a row (m: x forward, y up, z right).
  const toBody = (row: number, w: Vec3, scale: number): Vec3 | null => {
    if (!d.yaw || !Number.isFinite(d.yaw[row])) return null;
    const pitch = d.pitch && Number.isFinite(d.pitch[row]) ? d.pitch[row] : 0;
    const r = roll && Number.isFinite(roll[row]) ? (roll[row] * Math.PI) / 180 : 0;
    const ax = bodyAxes(d.yaw[row], pitch, r);
    // World x east, y up, -z north into east-north-up.
    const e = w[0] / scale, n = -w[2] / scale, u = w[1] / scale;
    const dot = (v: [number, number, number]) => v[0] * e + v[1] * n + v[2] * u;
    return [dot(ax.fwd), dot(ax.up), dot(ax.right)];
  };
  const kindOf = (tr: Track) => {
    if (!kinds.has(tr.name)) kinds.set(tr.name, tr.type);
    return tr.name;
  };
  const make = (victim: Track, shooter: Track | null, t: number, row: number, outcome: Outcome): VehicleHit => ({
    id: 0,
    side: 'victim',
    victimPerson: victim.person,
    shooterPerson: shooter ? shooter.person : -1,
    distance: null,
    vehicle: kindOf(victim),
    victim: victim.label,
    life: '',
    shooter: shooter ? shooter.label : '',
    shooterVehicle: shooter ? shooter.name : '',
    weapon: '',
    match: sessionLabel(row),
    time: t,
    row,
    local: null,
    exit: null,
    box: null,
    dir: null,
    region: null,
    part: null,
    code: '',
    damage: null,
    armorDamage: null,
    healthAfter: null,
    outcome,
    fatal: false,
    killingShot: false,
    toDeath: null,
    share: null,
    calibre: null,
    ammoType: null,
    ammoName: null,
    ammoSlot: null,
    modules: 0,
    kind: 'hit',
  });

  // ---- weapons that ended at a unit
  const targets = tracks.filter((tr) => tr.target);
  const reach = PROXIMITY * k;
  for (const w of tracks) {
    if (!w.weapon) continue;
    const endIndex = rows.start[w.person + 1] - 1;
    const end = rows.rows[endIndex];
    const t = time[end];
    const at: Vec3 = [d.px[end], d.py[end], d.pz[end]];
    if (!at.every(Number.isFinite)) continue;
    let best: Track | null = null;
    let bd = reach;
    let bp: Vec3 | null = null;
    for (const tr of targets) {
      if (tr.id === w.parent || tr.t0 > t + 1 || tr.t1 < t - 1) continue;
      const p = placeAt(tr.person, t);
      if (!p) continue;
      const dd = Math.hypot(p[0] - at[0], p[1] - at[1], p[2] - at[2]);
      if (dd < bd) {
        bd = dd;
        best = tr;
        bp = p;
      }
    }
    if (!best || !bp) continue;
    const row = rowAt(best.person, t);
    const h = make(best, byId.get(w.parent) ?? null, t, row, 'hit');
    h.weapon = w.name;
    h.local = toBody(row, [at[0] - bp[0], at[1] - bp[1], at[2] - bp[2]], k);
    // The way it flew: from its last sample elsewhere (its removal repeats its last place).
    let back = endIndex - 1;
    while (back >= rows.start[w.person] && d.px[rows.rows[back]] === at[0] && d.py[rows.rows[back]] === at[1] && d.pz[rows.rows[back]] === at[2]) back--;
    if (back >= rows.start[w.person]) {
      const prev = rows.rows[back];
      const v = toBody(row, [at[0] - d.px[prev], at[1] - d.py[prev], at[2] - d.pz[prev]], 1);
      const n = v ? Math.hypot(v[0], v[1], v[2]) : 0;
      if (v && n > 1e-9) h.dir = [v[0] / n, v[1] / n, v[2] / n];
    }
    h.code = `${Math.round(bd / k)} m`;
    hits.push(h);
  }

  const onUnit = (victim: Track, t: number, shooter: Track | null): VehicleHit | null => {
    let best: VehicleHit | null = null;
    for (const h of hits) {
      if (h.victimPerson !== victim.person || Math.abs(h.time - t) > PAIR_WINDOW) continue;
      if (shooter && h.shooterPerson >= 0 && h.shooterPerson !== shooter.person) continue;
      if (!best || Math.abs(h.time - t) < Math.abs(best.time - t)) best = h;
    }
    return best;
  };

  // ---- events: Timeout (a weapon's result) and Destroyed
  const deaths: { victim: Track; t: number }[] = [];
  const evCol = attr(d, 'Event');
  if (evCol?.kind === 'category') {
    for (let r = 0; r < d.count; r++) {
      const label = event(r);
      if (!label) continue;
      if (/^Destroyed\b/i.test(label)) {
        const tr = tracks.find((x) => x.person === d.personId![r]);
        if (tr && !tr.weapon) deaths.push({ victim: tr, t: time[r] });
        continue;
      }
      if (!/^Timeout\b/i.test(label)) continue;
      const fields = new Map<string, string>();
      for (const part of label.slice(label.indexOf(':') + 1).split('|')) {
        const c = part.indexOf(':');
        if (c > 0) fields.set(part.slice(0, c).trim().toLowerCase(), part.slice(c + 1).trim());
      }
      const target = byId.get((fields.get('targetid') ?? '').toLowerCase());
      if (!target) continue;
      const outcome = fields.get('outcome') ?? '';
      if (/miss|none|fail/i.test(outcome)) continue;
      const source = byId.get((fields.get('sourceid') ?? '').toLowerCase()) ?? null;
      const o: Outcome = /kill|destroy/i.test(outcome) ? 'kill' : /hit|damage/i.test(outcome) ? 'damage' : 'hit';
      const t = time[r];
      const found = onUnit(target, t, source);
      if (found) {
        if (o !== 'hit') found.outcome = o;
        if (!found.weapon) found.weapon = fields.get('ammotype') ?? '';
        found.code = [found.code, outcome].filter(Boolean).join(' · ');
        continue;
      }
      const h = make(target, source, t, rowAt(target.person, t), o);
      h.weapon = fields.get('ammotype') ?? '';
      h.code = outcome;
      hits.push(h);
    }
  }

  // ---- falls of health
  if (health) {
    for (const tr of tracks) {
      if (tr.weapon) continue;
      let prev = NaN;
      for (let i = rows.start[tr.person]; i < rows.start[tr.person + 1]; i++) {
        const r = rows.rows[i];
        const v = health[r];
        if (!Number.isFinite(v)) continue;
        if (Number.isFinite(prev) && v < prev - 1e-4) {
          const t = time[r];
          const dmg = (prev - v) * 100;
          const found = onUnit(tr, t, null);
          if (found && found.damage === null) {
            found.damage = dmg;
            found.healthAfter = v * 100;
            if (found.outcome === 'hit') found.outcome = v <= 0 ? 'kill' : 'damage';
          } else if (!found) {
            const h = make(tr, null, t, r, v <= 0 ? 'kill' : 'damage');
            h.damage = dmg;
            h.healthAfter = v * 100;
            hits.push(h);
          }
        }
        prev = v;
      }
    }
  }

  // ---- deaths: the last hit before is the killing one; without one, a kill of its own
  hits.sort((a, b) => a.time - b.time);
  for (const death of deaths) {
    const own = hits.filter((h) => h.victimPerson === death.victim.person && h.time <= death.t + 0.2);
    let last: VehicleHit | null = null;
    for (const h of own) if (h.time >= death.t - KILL_WINDOW) last = h;
    if (!last) {
      last = make(death.victim, null, death.t, rowAt(death.victim.person, death.t), 'kill');
      own.push(last);
      hits.push(last);
    }
    let total = 0;
    let known = true;
    for (const h of own) {
      h.toDeath = Math.max(0, death.t - h.time);
      if (h.damage === null) known = false;
      else total += h.damage;
      if (h.time >= death.t - KILL_WINDOW && (!last.shooter || h.shooter === last.shooter)) h.fatal = true;
    }
    last.killingShot = true;
    last.fatal = true;
    last.outcome = 'kill';
    if (known && total > 0 && last.damage !== null) last.share = last.damage / total;
  }
  hits.sort((a, b) => a.time - b.time);
  return { hits, kinds };
}
