/**
 * The unit card's fields for what drives and sails: a tank's turret and gun,
 * what it fired and reloaded, the hits it took and dealt, the armour the last
 * hit struck, and what the game's catalogue says the vehicle is. An aircraft's
 * card keeps the flight fields; these are a ground unit's and a ship's.
 *
 * Which a unit is comes from the data's `kind` column at its track's first
 * row (War Thunder: tank, spaa, aircraft, helicopter, ship...), else from the
 * game's catalogue entry for its vehicle.
 */

import type { Dataset } from '../../state/types';
import { t } from '../../i18n';
import { personRows } from '../../data/flight';
import { aimOf, type AimNow } from '../../figures/aim';
import { catalogItem } from '../../figures/unitcatalog';
import { hitsHeld, hitsOf, penetrated, type HitSet, type VehicleHit } from '../../vehicle/hits';
import { figureOfVehicle } from '../../vehicle/scene';
import { namesOf, packUnitOf, platesOf, platesOfHits } from '../../vehicle/plates';

export type Domain = 'air' | 'ground' | 'sea';

/** The fields of this module, in the order the lists show them. */
export const VEHICLE_FIELDS = ['vehicleInfo', 'turretHeading', 'gunElevation', 'ammo', 'shots', 'reloads', 'hitsTaken', 'hitsDealt', 'lastPlate'] as const;
const VEHICLE_SET = new Set<string>(VEHICLE_FIELDS);

/** Whether a field is one of this module's. */
export function isVehicleField(id: string): boolean {
  return VEHICLE_SET.has(id);
}

/** Flight fields a ground unit or a ship never shows. */
const FLIGHT_ONLY = new Set(['alt', 'agl', 'tas', 'ias', 'cas', 'mach', 'vs', 'pitch', 'roll', 'aoa', 'aos', 'g', 'gLong', 'gLat', 'turnRate', 'turnRadius', 'energy', 'energyRate', 'afterburner', 'flaps', 'gear', 'airbrakes', 'tailhook', 'rotor', 'altDiff']);

/** Whether a field means nothing for a unit of `domain` (a tank's Mach number). */
export function wrongForDomain(id: string, domain: Domain): boolean {
  if (domain === 'air') return id === 'turretHeading' || id === 'gunElevation' || id === 'lastPlate';
  return FLIGHT_ONLY.has(id);
}

const AIR = /aircraft|airplane|plane|fighter|bomber|attacker|assault|interceptor|heli|drone|uav|jet|glider|^air$/i;
const SEA = /ship|boat|destroyer|cruiser|frigate|battleship|submarine|naval|carrier|corvette|barge|torpedo_?boat|^sea$/i;
const GROUND = /tank|spaa|apc|ifv|ground|vehicle|truck|car\b|artillery|atgm|howitzer|tank_?destroyer|spg|armou?r|infantry|soldier|static/i;

/** A kind or type word's domain, null when it says none. */
export function domainOfWord(word: string): Domain | null {
  const w = word.trim();
  if (!w) return null;
  if (AIR.test(w)) return 'air';
  if (SEA.test(w)) return 'sea';
  if (GROUND.test(w)) return 'ground';
  return null;
}

function category(d: Dataset, names: string[]): ((row: number) => string) | null {
  for (const n of names) {
    const a = d.attrs.find((x) => x.kind === 'category' && x.name.trim().toLowerCase() === n.toLowerCase());
    if (a?.categories) {
      const ids = a.data as Uint32Array;
      const cats = a.categories;
      return (r) => cats[ids[r]] ?? '';
    }
  }
  return null;
}

const domains = new WeakMap<Dataset, Map<number, Domain>>();

/** A track's domain: air (also where nothing says), ground or sea. */
export function domainOf(d: Dataset, person: number): Domain {
  let m = domains.get(d);
  if (!m) domains.set(d, (m = new Map()));
  const had = m.get(person);
  if (had) return had;
  const row = firstRow(d, person);
  let out: Domain | null = null;
  if (row >= 0) {
    out = domainOfWord(category(d, ['kind'])?.(row) ?? '') ?? domainOfWord(category(d, ['type'])?.(row) ?? '');
    if (!out) {
      const id = category(d, ['Vehicle', 'vehicle'])?.(row) ?? '';
      const item = id ? catalogItem(id) : undefined;
      out = item ? domainOfWord(item.domain ?? '') : null;
    }
  }
  m.set(person, out ?? 'air');
  return out ?? 'air';
}

/** A track's first row; -1 for none. */
function firstRow(d: Dataset, person: number): number {
  const idx = personRows(d);
  if (!idx || person < 0 || person + 1 >= idx.start.length || idx.start[person] >= idx.start[person + 1]) return -1;
  return idx.rows[idx.start[person]];
}

/** A track's last row at or before `time`; -1 for none. */
export function rowAtTime(d: Dataset, person: number, time: number): number {
  const idx = personRows(d);
  if (!idx || !d.time || person < 0 || person + 1 >= idx.start.length) return -1;
  let lo = idx.start[person];
  let hi = idx.start[person + 1];
  if (hi <= lo || d.time[idx.rows[lo]] > time) return -1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (d.time[idx.rows[mid]] <= time) lo = mid;
    else hi = mid;
  }
  return idx.rows[lo];
}

/** A track's events worth counting, by time: shots fired, reloads, the rounds named. */
interface Events {
  shots: number[];
  reloads: number[];
  /** The round of each shot or hit that names one, by time. */
  ammoTimes: number[];
  ammo: string[];
}

const FIRED = /^(gun_shot|fire|fired|shot_fired|weapon_fire|launch)$/i;
const RELOAD = /^reload$/i;
const eventCache = new WeakMap<Dataset, Map<number, Events>>();

function eventsOf(d: Dataset, person: number): Events {
  let m = eventCache.get(d);
  if (!m) eventCache.set(d, (m = new Map()));
  const had = m.get(person);
  if (had) return had;
  const out: Events = { shots: [], reloads: [], ammoTimes: [], ammo: [] };
  const idx = personRows(d);
  const event = category(d, ['event', 'events']);
  const ammo = category(d, ['ammoName', 'ammo']);
  if (idx && d.time && person >= 0 && person + 1 < idx.start.length) {
    for (let k = idx.start[person]; k < idx.start[person + 1]; k++) {
      const r = idx.rows[k];
      const ev = event ? event(r) : '';
      if (FIRED.test(ev)) out.shots.push(d.time[r]);
      else if (RELOAD.test(ev)) out.reloads.push(d.time[r]);
      const a = ammo ? ammo(r) : '';
      if (a) {
        out.ammoTimes.push(d.time[r]);
        out.ammo.push(a);
      }
    }
  }
  m.set(person, out);
  return out;
}

/** How many of sorted `times` are at or before `time`. */
function countTo(times: number[], time: number): number {
  let lo = 0;
  let hi = times.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (times[mid] <= time) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Per match and name, the hits a unit took and dealt, by time. */
interface HitIndex {
  taken: Map<string, VehicleHit[]>;
  dealt: Map<string, VehicleHit[]>;
}

const hitIndexes = new WeakMap<HitSet, HitIndex>();

function hitIndexOf(set: HitSet): HitIndex {
  const had = hitIndexes.get(set);
  if (had) return had;
  const out: HitIndex = { taken: new Map(), dealt: new Map() };
  const add = (m: Map<string, VehicleHit[]>, k: string, h: VehicleHit) => {
    let l = m.get(k);
    if (!l) m.set(k, (l = []));
    l.push(h);
  };
  for (const h of set.hits) {
    if (h.kind !== 'hit') continue;
    if (h.victim) add(out.taken, `${h.match}\u0000${h.victim}`, h);
    if (h.shooter) add(out.dealt, `${h.match}\u0000${h.shooter}`, h);
  }
  for (const m of [out.taken, out.dealt]) for (const l of m.values()) l.sort((a, b) => a.time - b.time);
  hitIndexes.set(set, out);
  return out;
}

/** The key the hits name a track's unit by: its match and its player's (or its own) name. */
function hitKeyOf(d: Dataset, person: number): string {
  const row = firstRow(d, person);
  if (row < 0) return '';
  const name = category(d, ['player', 'name'])?.(row) || d.personLabels[person] || '';
  const match = category(d, ['match'])?.(row) ?? (d.sessionId ? (d.sessionLabels[d.sessionId[row]] ?? '') : '');
  return `${match}\u0000${name}`;
}

/** Hits up to `time` from a sorted list. */
function upTo(list: VehicleHit[] | undefined, time: number): VehicleHit[] {
  if (!list) return [];
  let n = 0;
  while (n < list.length && list[n].time <= time) n++;
  return list.slice(0, n);
}

/** The words for a count of hits and how many of them went through: "12 · 4 through". */
function hitCount(hits: VehicleHit[]): string {
  if (!hits.length) return '0';
  let through = 0;
  let known = 0;
  for (const h of hits) {
    const p = penetrated(h.outcome);
    if (p === null) continue;
    known++;
    if (p) through++;
  }
  return known ? t('replay.vehicle.hits', { n: hits.length, through }) : String(hits.length);
}

/** A round's game name made readable: "125mm_3bm46" as "125mm 3bm46". */
function roundName(s: string): string {
  return s.replace(/_/g, ' ').trim();
}

const aimNow: AimNow = { yaw: NaN, pitch: NaN };

/** What the card needs to say a vehicle field: the track, the time, and how a heading and an angle are written. */
export interface VehicleFieldContext {
  d: Dataset;
  person: number;
  time: number;
  /** The hull's heading now (degrees), NaN when not known. */
  hull: () => number;
  heading: (deg: number) => string;
  angle: (deg: number) => string;
}

/** A vehicle field's text for a track now; '' when the data has nothing to say. */
export function vehicleFieldText(c: VehicleFieldContext, id: string): string {
  const { d, person, time } = c;
  switch (id) {
    case 'vehicleInfo': {
      const row = firstRow(d, person);
      const vid = row >= 0 ? (category(d, ['Vehicle', 'vehicle'])?.(row) ?? '') : '';
      const item = vid ? catalogItem(vid) : undefined;
      if (!item) return '';
      const parts: string[] = [];
      const cls = item.class ?? item.type ?? '';
      if (cls) parts.push(cls.replace(/_/g, ' '));
      if (typeof item.rank === 'number') parts.push(t('replay.vehicle.rank', { n: item.rank }));
      const diff = (row >= 0 ? (category(d, ['difficulty'])?.(row) ?? '') : '').toLowerCase();
      const br = item.br ? (item.br[diff] ?? item.br.rb ?? item.br.ab) : undefined;
      if (typeof br === 'number') parts.push(t('replay.vehicle.br', { v: br.toFixed(1) }));
      if (item.nation) parts.push(item.nation);
      return parts.join(' · ');
    }
    case 'turretHeading':
    case 'gunElevation': {
      const aim = aimOf(d);
      const row = rowAtTime(d, person, time);
      if (!aim || row < 0) return '';
      aim.at(row, time, aimNow);
      if (id === 'gunElevation') return Number.isFinite(aimNow.pitch) ? c.angle((aimNow.pitch * 180) / Math.PI) : '';
      if (!Number.isFinite(aimNow.yaw)) return '';
      const rel = (aimNow.yaw * 180) / Math.PI;
      const side = Math.abs(rel) < 0.5 ? t('replay.vehicle.ahead') : t(rel > 0 ? 'replay.unit.degRight' : 'replay.unit.degLeft', { v: Math.round(Math.abs(rel)) });
      const hull = c.hull();
      return Number.isFinite(hull) ? `${c.heading((((hull + rel) % 360) + 360) % 360)} · ${side}` : side;
    }
    case 'ammo': {
      const e = eventsOf(d, person);
      const n = countTo(e.ammoTimes, time);
      return n ? roundName(e.ammo[n - 1]) : '';
    }
    case 'shots': {
      const e = eventsOf(d, person);
      return e.shots.length ? String(countTo(e.shots, time)) : '';
    }
    case 'reloads': {
      const e = eventsOf(d, person);
      if (!e.reloads.length) return '';
      const n = countTo(e.reloads, time);
      return n ? t('replay.vehicle.reloads', { n, s: Math.max(0, Math.round(time - e.reloads[n - 1])) }) : '0';
    }
    case 'hitsTaken':
    case 'hitsDealt':
    case 'lastPlate': {
      // The hits as worked out for the replay's marks: never worked out here, in a frame.
      if (hitsHeld(d) < 0) return '';
      const set = hitsOf(d);
      const ix = hitIndexOf(set);
      const key = hitKeyOf(d, person);
      if (id === 'hitsDealt') return hitCount(upTo(ix.dealt.get(key), time));
      const taken = upTo(ix.taken.get(key), time);
      if (id === 'hitsTaken') return hitCount(taken);
      const last = taken[taken.length - 1];
      return last ? plateText(set, last) : '';
    }
  }
  return '';
}

/** The armour a hit struck: the plate's name and thickness where the model pack has the unit's plates, else the part it names. */
function plateText(set: HitSet, h: VehicleHit): string {
  const info = set.vehicles.get(h.vehicle);
  const figure = info ? figureOfVehicle(info) : null;
  const unit = packUnitOf(figure);
  const names = unit ? namesOf(unit.game) : null;
  // Asked for once: the next frames find them here.
  const list = platesOf(figure);
  const what = t(`vehicle.outcome.${h.outcome}`);
  if (list?.length) {
    const at = platesOfHits([h], list, names).get(h.id) ?? -1;
    const p = at >= 0 ? list[at] : null;
    if (p) {
      const name = p.name.replace(/_dm$/, '').replace(/_/g, ' ');
      return p.mm !== null ? t('replay.vehicle.plate', { name, mm: Math.round(p.mm), what }) : `${name} · ${what}`;
    }
  }
  return what;
}
