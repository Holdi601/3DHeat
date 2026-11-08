/**
 * The units of a replay as people name them: one entry per player or AI
 * unit, however many tracks (lives, respawns) it has, its vehicle by its
 * display name, and whether it is a player, an AI or a weapon in flight.
 *
 * Read from the columns where the data has them, else guessed from what it
 * does have:
 *
 *   player       `player` / `Pilot` / `playerName`: the unit's tracks are joined under it
 *   vehicle      `VehicleName` (a display name) before `Vehicle` / `vehicle` / `Name` (ACMI's type) / `type`
 *   AI           `ai` / `isAI` / `bot` / `isBot` (1, true, yes), `isPlayer` (inverse); else an empty `userId`
 *                or `steamid` where the column is there; else, in a Tacview recording, an object without a pilot
 *   weapon       a War Thunder weapon flight (life `w...`), or a Tacview type naming a weapon
 *
 * Worked out once per dataset.
 */

import { classOfType, isEffectDomain } from '../../figures/symbolClass';
import type { AttributeColumn, Dataset } from '../../state/types';
import { personRows } from '../../data/flight';
import { trackName } from './replayData';
import { isOverlay } from '../../match/overlay';
import { cameraTracks } from '../../render/lookAids';

export type UnitKind = 'player' | 'ai' | 'weapon';

export interface Unit {
  /** Stable within the dataset: the player column's value, or `#<person>`. */
  key: string;
  /** As the unit list and the labels say it: the player, or an AI unit by its vehicle. */
  name: string;
  /** The vehicle's display name ('' when the data has none): its first life's. */
  vehicle: string;
  /** Each life's vehicle, beside `persons`: a player who changes vehicle is named by the one they are in (`vehicleOf`). */
  vehicles: string[];
  kind: UnitKind;
  /** A decoy, a shell or debris (`figures/symbolClass.ts`): no label, and out of the lists unless asked for. */
  decoy?: boolean;
  /** Team index into `teamLabels`, -1 for none. */
  team: number;
  /** Its tracks (person ids), in the order they first appear. */
  persons: number[];
  /** When each of `persons` starts and ends, seconds. */
  spans: [number, number][];
}

export interface UnitIndex {
  units: Unit[];
  byKey: Map<string, Unit>;
  /** person -> index into `units`. */
  personUnit: Int32Array;
  /** How AI was told from players: a column of the data, a guess from another, or not at all. */
  aiFrom: 'column' | 'userId' | 'pilot' | 'none';
}

const cache = new WeakMap<Dataset, UnitIndex>();

function attr(d: Dataset, names: string[]): AttributeColumn | null {
  for (const n of names) {
    const a = d.attrs.find((x) => x.name.trim().toLowerCase() === n.toLowerCase());
    if (a) return a;
  }
  return null;
}

/** A row's text in a column: a category's label, or a number as text. */
function text(a: AttributeColumn | null, row: number): string {
  if (!a || row < 0) return '';
  if (a.kind === 'category') return a.categories?.[(a.data as Uint32Array)[row]] ?? '';
  const v = (a.data as Float32Array)[row];
  return Number.isFinite(v) ? String(v) : '';
}

const TRUE = /^(1|1\.0|true|yes|y|ai|bot)$/i;
const FALSE = /^(0|0\.0|false|no|n|player|human)$/i;

/** Country prefixes War Thunder puts on vehicle ids. */
const COUNTRY = /^(germ|us|uk|ussr|jp|it|fr|cn|sw|il|ger|rus|usa|fin|hun|rom|bel|nl|swe|isr)_/i;

/**
 * A vehicle id said a little more like a name when nothing better is known:
 * "germ_pzkpfw_III_ausf_J" -> "pzkpfw III ausf J". Ids that already read as
 * names ("F-16C_50", "T-90A") keep their shape bar underscores.
 */
export function prettyVehicle(id: string): string {
  if (!id) return '';
  return id.replace(COUNTRY, '').replace(/_+/g, ' ').trim() || id;
}

const WEAPON_TYPE = /(weapon|missile|rocket|bomb|shell|projectile|torpedo|bullet|grenade|decoy|flare|chaff)/i;

export function unitsOf(d: Dataset): UnitIndex {
  const hit = cache.get(d);
  if (hit) return hit;
  const persons = d.personLabels.length;
  const idx = personRows(d);
  const player = attr(d, ['player', 'Pilot', 'playerName', 'player_name']);
  const display = attr(d, ['VehicleName', 'vehicleName', 'vehicle_name', 'vehicleDisplayName']);
  const vehicleRaw = attr(d, ['Vehicle', 'vehicle', 'Name', 'unitType']);
  const typeCol = attr(d, ['type', 'Type']);
  const kindCol = attr(d, ['kind']);
  const life = attr(d, ['life']);
  const aiCol = attr(d, ['ai', 'isAI', 'is_ai', 'bot', 'isBot', 'is_bot']);
  const playerFlag = attr(d, ['isPlayer', 'is_player', 'human']);
  const userId = attr(d, ['userId', 'user_id', 'steamid', 'steamId']);
  const acmi = !!attr(d, ['Pilot']) && !!attr(d, ['Coalition', 'EventObjects']);
  const cams = cameraTracks(d);
  const aiFrom: UnitIndex['aiFrom'] = aiCol || playerFlag ? 'column' : userId ? 'userId' : acmi ? 'pilot' : 'none';

  const units: Unit[] = [];
  const byKey = new Map<string, Unit>();
  const personUnit = new Int32Array(persons).fill(-1);
  // Each unit's index, not searched for: hundreds of thousands of units in a large overlay.
  const unitIndex = new Map<Unit, number>();
  // In the figure overlay each player in each round is a thing of its own.
  const overlay = isOverlay(d);
  // What a type and kind are, worked out once each: an overlay has millions of tracks but few types.
  const effects = new Map<string, boolean>();
  for (let p = 0; p < persons; p++) {
    let first = -1;
    let last = -1;
    if (idx && idx.start[p + 1] > idx.start[p]) {
      // A row of the track that is a position, not an event naming someone else.
      first = idx.rows[idx.start[p]];
      last = idx.rows[idx.start[p + 1] - 1];
    }
    const lifeText = text(life, first);
    const type = text(typeCol, first);
    const kind = text(kindCol, first);
    const tk = `${type}+${kind}`;
    let effect = effects.get(tk);
    if (effect === undefined) effects.set(tk, (effect = isEffectDomain(classOfType(tk)?.domain ?? -1)));
    const weapon = effect || /^w[0-9a-f]/i.test(lifeText) || (acmi && WEAPON_TYPE.test(type)) || (!!kindCol && /^(weapon|projectile|missile|rocket|bomb|shell|torpedo)$/i.test(kind));
    const who = text(player, first).trim();
    const vehicleId = text(vehicleRaw, first);
    const vehicle = text(display, first) || prettyVehicle(vehicleId);
    let ai: boolean;
    const flag = text(aiCol, first);
    const pf = text(playerFlag, first);
    if (aiCol && TRUE.test(flag)) ai = true;
    else if (aiCol && FALSE.test(flag)) ai = false;
    else if (playerFlag && TRUE.test(pf)) ai = false;
    else if (playerFlag && FALSE.test(pf)) ai = true;
    else if (userId) ai = !text(userId, first).trim() || text(userId, first) === '0';
    else if (acmi) ai = !who;
    else ai = false;
    // Weapons are their own: one entry per flight, named by launcher and weapon.
    // A recorded camera is a unit of its own, not another life of the player it belongs to.
    const camera = cams.persons[p] === 1;
    const key = !weapon && !camera && who && !overlay ? who : `#${p}`;
    let u = byKey.get(key);
    if (!u) {
      let name: string;
      if (camera) name = d.personLabels[p]?.replace(/\s*#\w+$/, '') || trackName(d, p, first);
      else if (weapon) name = trackName(d, p, first);
      else if (ai) {
        // An AI unit by its vehicle, and which one where there are several ("#83").
        const num = /#\s*([0-9]+)$/.exec(who)?.[1];
        name = vehicle ? (num ? `${vehicle} #${num}` : vehicle) : who || trackName(d, p, first);
      } else name = who || trackName(d, p, first);
      // Which round or match, in the overlay: the label's last part.
      if (overlay) {
        const group = /·\s*([^·]+)$/.exec(d.personLabels[p] ?? '')?.[1]?.trim();
        if (group && !name.endsWith(group)) name = `${name} · ${group}`;
      }
      u = {
        key,
        name,
        vehicle,
        kind: weapon ? 'weapon' : ai ? 'ai' : 'player',
        ...(effect ? { decoy: true } : {}),
        team: d.personTeam ? d.personTeam[p] : -1,
        persons: [],
        spans: [],
        vehicles: [],
      };
      byKey.set(key, u);
      unitIndex.set(u, units.length);
      units.push(u);
    }
    if (!u.vehicle && vehicle) u.vehicle = vehicle;
    u.persons.push(p);
    u.vehicles.push(vehicle);
    const t0 = d.time && first >= 0 ? d.time[first] : 0;
    const t1 = d.time && last >= 0 ? d.time[last] : 0;
    u.spans.push([t0, t1]);
    personUnit[p] = unitIndex.get(u)!;
  }
  // Each unit's tracks in time order, so the "current life" is the last one started.
  for (const u of units) {
    if (u.persons.length === 1) {
      if (u.vehicles[0]) u.vehicle = u.vehicles[0];
      continue;
    }
    const order = u.persons.map((_, i) => i).sort((a, b) => u.spans[a][0] - u.spans[b][0]);
    u.persons = order.map((i) => u.persons[i]);
    u.spans = order.map((i) => u.spans[i]);
    u.vehicles = order.map((i) => u.vehicles[i]);
    if (u.vehicles[0]) u.vehicle = u.vehicles[0];
  }
  const out: UnitIndex = { units, byKey, personUnit, aiFrom };
  cache.set(d, out);
  return out;
}

/** The vehicle of one of the unit's tracks: the life's own, else the unit's first. */
export function vehicleOf(u: Unit, person: number): string {
  const i = u.persons.indexOf(person);
  return (i >= 0 && u.vehicles[i]) || u.vehicle;
}

/** The unit's track at `time`: the life that spans it, else the last that started before it, else the first. */
export function personAt(u: Unit, time: number): number {
  // Spans are in start order: the last that has started is the newest.
  let best = -1;
  let spanning = -1;
  for (let i = 0; i < u.persons.length; i++) {
    const [a, b] = u.spans[i];
    if (a > time) break;
    best = i;
    if (time <= b) spanning = i;
  }
  return u.persons[spanning >= 0 ? spanning : best >= 0 ? best : 0];
}

/** Units sorted for a list: by name, as the language sorts, numbers by value. */
export function sortUnits(units: Unit[]): Unit[] {
  const coll = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  return units.slice().sort((a, b) => coll.compare(a.name, b.name));
}

const uidCache = new WeakMap<Dataset, Map<number, Unit>>();

/** Units by the game's unit id (a `uid` column), for events that name their other party only by it ("uid 106"). */
export function unitByUid(d: Dataset): Map<number, Unit> {
  const hit = uidCache.get(d);
  if (hit) return hit;
  const out = new Map<number, Unit>();
  const col = attr(d, ['uid']);
  const idx = personRows(d);
  if (col && col.kind === 'number' && idx) {
    const { units, personUnit } = unitsOf(d);
    const data = col.data as Float32Array;
    for (let p = 0; p + 1 < idx.start.length; p++) {
      if (idx.start[p + 1] === idx.start[p] || personUnit[p] < 0) continue;
      const v = data[idx.rows[idx.start[p]]];
      const u = units[personUnit[p]];
      if (Number.isFinite(v) && u.kind !== 'weapon' && !out.has(v)) out.set(v, u);
    }
  }
  uidCache.set(d, out);
  return out;
}

/**
 * A party an event names, by its unit's name where it is named by id only;
 * `known` names the ids that have no track (a bunker, a gun), from the match summary.
 */
export function partyName(d: Dataset, text: string, known?: Map<number, string>): string {
  const m = /^uid\s+(\d+)$/i.exec(text.trim());
  if (!m) return text;
  const uid = Number(m[1]);
  return unitByUid(d).get(uid)?.name ?? (known?.get(uid) ? `${known.get(uid)} #${uid}` : text);
}

const playCache = new WeakMap<Dataset, Map<string, Set<string>>>();

/**
 * The units in the matches being played: those with rows in the session
 * played, and of the matches a categories filter on `matchColumn` allows.
 * Null when every unit is.
 */
export function unitsInPlay(d: Dataset, session: number, match: { column: string; allowed: number[] } | null): Set<string> | null {
  if (session < 0 && !match) return null;
  const key = `${session}|${match ? `${match.column}:${match.allowed.join(',')}` : ''}`;
  let cache = playCache.get(d);
  if (!cache) playCache.set(d, (cache = new Map()));
  const hit = cache.get(key);
  if (hit) return hit;
  const idx = personRows(d);
  const { units, personUnit } = unitsOf(d);
  const out = new Set<string>();
  const col = match ? d.attrs.find((a) => a.name === match.column) : undefined;
  const allowed = match ? new Set(match.allowed) : null;
  if (idx) {
    for (let p = 0; p < personUnit.length; p++) {
      const u = units[personUnit[p]];
      if (!u || out.has(u.key)) continue;
      for (let k: number = idx.start[p]; k < idx.start[p + 1]; k++) {
        const r = idx.rows[k];
        if (session >= 0 && d.sessionId && d.sessionId[r] !== session) continue;
        if (allowed && col && !allowed.has((col.data as Uint32Array)[r])) continue;
        out.add(u.key);
        break;
      }
    }
  }
  cache.set(key, out);
  return out;
}
