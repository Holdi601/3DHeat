/**
 * The same questions asked of every source: what a row is (a position, a
 * shot, a launch, a kill...), whether a player or the AI did it, and what
 * kind of vehicle it was. Each game names these its own way (War Thunder's
 * `event` and `ai`, Tacview's `Event`, `Pilot` and `Type`, CS2's, the tank
 * and ship games', Squad's); the load adds columns that say them one way, so
 * one filter works on all of them. The source's own columns stay as they are.
 *
 *   Event type    the row's event in the taxonomy below (`EVENT_KINDS`);
 *                 a Tacview weapon's first sample is its launch; a Tacview
 *                 recording converted before its events were worked out
 *                 (`acmiEvents.ts`) has them found here, on the rows they
 *                 stand on (a weapon's end its hit, miss or kill, a removal
 *                 a death or crash, a sample a take-off or landing...)
 *   Player or AI  `player` or `ai`; a weapon is its launcher's (War Thunder
 *                 says so, a Tacview weapon is given to the unit it left)
 *   Vehicle class the row's vehicle by the figure catalogue's class
 *                 (`VEHICLE_CLASSES`): with the event, the vehicle a player
 *                 was in, killed with or died in
 *   Target class  the vehicle on the other end of a kill or hit, where the
 *                 source names it (`otherVehicle`)
 *
 * Worked out once in the load (`DatasetBuilder.finish`, in a worker) from the
 * dictionaries: a value is mapped once, a row costs a table lookup. The
 * columns are ordinary category columns, so they filter on the GPU like any.
 */

import { CATALOG } from '../figures/catalog';
import { figureFor } from '../figures/match';
import { classify, type SymbolClass } from '../figures/symbolClass';
import type { AttributeColumn } from '../state/types';
import { AcmiEventFinder, acmiKindOf } from './acmiEvents';

/** The names the added columns take (said in the viewer's language by the panels, `canonicalLabel`). */
export const CANON = {
  event: 'Event type',
  actor: 'Player or AI',
  vehicleClass: 'Vehicle class',
  targetClass: 'Target class',
} as const;

export const EVENT_KINDS = ['position', 'fire', 'launch', 'hit', 'miss', 'explosion', 'damage', 'kill', 'death', 'destroyed', 'crash', 'eject', 'spawn', 'despawn', 'takeoff', 'landing', 'touchdown', 'stop', 'rearm', 'capture', 'decoy', 'message', 'other'] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export const ACTORS = ['player', 'ai'] as const;

export const VEHICLE_CLASSES = ['fighter', 'attack', 'bomber', 'otherAir', 'helicopter', 'tank', 'armoured', 'spaa', 'artillery', 'truck', 'ship', 'submarine', 'infantry', 'weapon', 'decoy', 'structure', 'other'] as const;
export type VehicleClass = (typeof VEHICLE_CLASSES)[number];

/** Whether a column is one this module added. */
export function isCanonical(name: string): boolean {
  return name === CANON.event || name === CANON.actor || name === CANON.vehicleClass || name === CANON.targetClass;
}

/** Each game's event names, lower case, to the taxonomy; anything else is `other`. */
const EVENT_MAP: Record<string, EventKind> = {
  '': 'position', position: 'position', pos: 'position', sample: 'position', move: 'position', vehicle: 'position',
  // A thrown or fired object's own flight samples, logged under its thrower's name (CS2's `grenade`):
  // never the thrower's position. Each flight's first sample is its launch where the source logs none.
  grenade: 'other', projectile: 'other', nade: 'other', thrown: 'other', flight: 'other',
  burst: 'fire', shot: 'fire', gun_shot: 'fire', fire: 'fire', fire_start: 'fire', fire_stop: 'fire', weapon_fire: 'fire', slash: 'fire', hasfired: 'fire', shoot: 'fire', fired: 'fire', tracer: 'fire',
  launch: 'launch', launched: 'launch', torpedo: 'launch', throw: 'launch', release: 'launch',
  hit: 'hit', hits: 'hit', hit_critical: 'hit', hit_severe: 'hit', struck: 'hit', impact: 'hit', hasbeenhitby: 'hit',
  miss: 'miss', missed: 'miss',
  explosion: 'explosion', flak: 'explosion', he: 'explosion', molotov: 'explosion', inferno: 'explosion', smoke: 'explosion', flash: 'explosion', explode: 'explosion',
  hurt: 'damage', damage: 'damage', damaged: 'damage', module_destroyed: 'damage', wounded: 'damage', fire_on: 'damage', blind: 'damage',
  kill: 'kill', kills: 'kill',
  death: 'death', dead: 'death', died: 'death', killed: 'death',
  destroyed: 'destroyed',
  crash: 'crash', crashed: 'crash',
  eject: 'eject', ejected: 'eject', bailout: 'eject', bailedout: 'eject',
  spawn: 'spawn', respawn: 'spawn', revived: 'spawn', created: 'spawn',
  despawn: 'despawn', removed: 'despawn', leftarea: 'despawn', timeout: 'despawn',
  takenoff: 'takeoff', takeoff: 'takeoff', landed: 'landing', landing: 'landing',
  touchdown: 'touchdown', touch_and_go: 'touchdown', stop: 'stop', parked: 'stop',
  rearm: 'rearm', rearmed: 'rearm', refuel: 'rearm', refuelled: 'rearm', refueled: 'rearm', repair: 'rearm', repaired: 'rearm',
  captured: 'capture', capture: 'capture', neutralised: 'capture', neutralized: 'capture', plant: 'capture', defuse: 'capture',
  flare: 'decoy', chaff: 'decoy', decoy: 'decoy', countermeasure: 'decoy',
  chat: 'message', message: 'message', command: 'message', bookmark: 'message', debug: 'message', comment: 'message',
};

/** Event names that are a thrown or fired object's flight samples (see `EVENT_MAP`). */
const FLIGHT = /^(grenade|projectile|nade|thrown|flight)$/i;

/** A source's event name in the taxonomy. Tacview's `Destroyed` is the object's death. */
export function eventKindOf(raw: string): EventKind {
  if (raw === 'Destroyed') return 'death';
  const k = EVENT_MAP[raw.trim().toLowerCase()];
  if (k) return k;
  // An event word with its details after it (OCAP's `killed ← Smith (MX, 200 m)`, `fired (120 m)`, `captured: Alpha`).
  const head = /^\s*([a-z_]+)\s*[←→:(]/i.exec(raw);
  return (head && EVENT_MAP[head[1].toLowerCase()]) || 'other';
}

/** Labels the converter writes for the events it worked out (`acmiEvents.ts`): a file with them needs no second look. */
const INFERRED = /^(kill|hit|miss|takeoff|landing|burst)$/;
const TACVIEW_TYPE = /^(Air|Ground|Sea|Weapon|Misc|Projectile|Navaid)\+/;
/** Which event a row keeps when several fall on it. */
const RANK: Partial<Record<EventKind, number>> = { spawn: 1, launch: 1, eject: 2, takeoff: 2, landing: 2, touchdown: 2, stop: 2, rearm: 2, hit: 3, miss: 3, death: 4, crash: 4, kill: 5 };

/**
 * The events a Tacview recording leaves unsaid (`acmiEvents.ts`), on the rows
 * they stand on: a weapon's removal its hit, miss or (killing) kill, a unit's
 * removal its death or crash, a sample its take-off, landing, stop, rearm or
 * spawn, a parachutist's first its ejection. Bursts and damage stand on no row
 * of their own and wait for the file to be converted again.
 */
function inferAcmiEvents(inp: CanonicalInput, ev: CategoryInput, type: CategoryInput, data: Uint32Array, track: (r: number) => number): void {
  const time = inp.time!;
  const removed = ev.labels.indexOf('Removed');
  const sample = ev.labels.map((l) => eventKindOf(l) === 'position');
  const wanted = type.labels.map((l) => acmiKindOf(l) !== 'other');
  const rows: number[] = [];
  for (let r = 0; r < inp.n; r++) if (wanted[type.data[r]] && (ev.data[r] === removed || sample[ev.data[r]]) && Number.isFinite(time[r])) rows.push(r);
  // In time order, a frame's samples before its removals.
  rows.sort((a, b) => time[a] - time[b] || Number(ev.data[a] === removed) - Number(ev.data[b] === removed) || a - b);
  const u = inp.units || 1;
  const rank = (k: number) => RANK[EVENT_KINDS[k]] ?? 0;
  const finder = new AcmiEventFinder<number, number, null>((e) => {
    if (e.ref === null) return;
    const k = EVENT_KINDS.indexOf(eventKindOf(e.kind));
    if (k >= 0 && rank(k) >= rank(data[e.ref])) data[e.ref] = k;
  });
  for (const r of rows) {
    // Metres, level x and y, height z (the dataset's y is up).
    if (ev.data[r] === removed) finder.removed(track(r), r, time[r]);
    else finder.sample(track(r), r, time[r], inp.px[r] / u, inp.pz[r] / u, inp.py[r] / u, type.labels[type.data[r]], null);
  }
  finder.finish();
}

/** The figure catalogue's symbol class to the filter's vehicle class. */
const BY_SYMBOL: Partial<Record<SymbolClass, VehicleClass>> = {
  fighter: 'fighter', attack: 'attack', bomber: 'bomber',
  transport: 'otherAir', tanker: 'otherAir', recon: 'otherAir', trainer: 'otherAir', uav: 'otherAir',
  rotary: 'helicopter', 'rotary-attack': 'helicopter', 'uav-rotary': 'otherAir',
  'missile-aam': 'weapon', 'missile-sam': 'weapon', 'missile-agm': 'weapon', 'missile-ship': 'weapon', bomb: 'weapon', 'guided-bomb': 'weapon', rocket: 'weapon', missile: 'weapon', shell: 'weapon',
  armour: 'tank', 'anti-tank': 'tank',
  'mech-inf': 'armoured', 'motor-inf': 'armoured', 'recon-ground': 'armoured',
  'air-defence': 'spaa', radar: 'spaa',
  artillery: 'artillery', 'rocket-artillery': 'artillery',
  'transport-ground': 'truck',
  installation: 'structure',
  infantry: 'infantry', medic: 'infantry', 'at-infantry': 'infantry', parachutist: 'infantry',
  carrier: 'ship', combatant: 'ship', 'small-boat': 'ship', amphibious: 'ship', merchant: 'ship', 'mine-warfare': 'ship',
  submarine: 'submarine',
  flare: 'decoy', chaff: 'decoy',
};

/** Figures whose symbol class says less than their own: a rider is no armoured car, a jet ski no tank, a quad bike no scout car. */
const BY_FIGURE_CLASS: Record<string, VehicleClass> = {
  cavalry: 'infantry', jetski: 'ship', quad: 'truck', motorcycle: 'truck', snowmobile: 'truck',
};

/** A vehicle's class by its names (most telling first) and type texts, as the figures match it. */
export function vehicleClassOf(names: string[], types: string[]): VehicleClass {
  const kind = names.some(Boolean) || types.some(Boolean) ? figureFor(names, types) : null;
  const own = kind ? BY_FIGURE_CLASS[CATALOG[kind.replace(/@.*$/, '')]?.cls ?? ''] : undefined;
  return own ?? BY_SYMBOL[classify(kind, types.filter(Boolean).join('+')).cls] ?? 'other';
}

const NAME_COLUMN = /^(name|hero|vehicle|vehicle.?name|unit|unit.?type|model|aircraft|plane|tank|ship|craft|loadout|kit|figure)$/i;
const TYPE_COLUMN = /^(type|class|kind|category|icon|role|domain|vehicle.?type|vehicle.?class)$/i;
const EVENT_COLUMN = /^(events?|event.?type|event.?name)$/i;

/** Whether the columns this module adds are worked out from this one (a name, a type or an event column). */
export function feedsCanonical(name: string): boolean {
  const n = name.trim();
  return NAME_COLUMN.test(n) || TYPE_COLUMN.test(n) || EVENT_COLUMN.test(n);
}
const OTHER_NAME = /^(other.?vehicle|target.?vehicle|victim.?vehicle|other.?name)$/i;
const OTHER_TYPE = /^(other.?type|target.?type|victim.?type|other.?kind|(other|target|victim).?vehicle.?(class|type))$/i;
const AI_COLUMN = /^(ai|is.?ai|bot|is.?bot|actor)$/i;
const PLAYER_FLAG = /^(is.?player|human)$/i;
const USER_ID = /^(user.?id|steam.?id)$/i;
const TRUE = /^(1|1\.0|true|yes|y|ai|bot)$/i;
const FALSE = /^(0|0\.0|false|no|n|player|human)$/i;
const WEAPON_TYPE = /(weapon|missile|rocket|bomb(?!er)|shell|projectile|torpedo|bullet|grenade)/i;

export interface CategoryInput {
  name: string;
  data: Uint32Array;
  labels: string[];
}

export interface CanonicalInput {
  n: number;
  /** Every category column the load read, those too many-valued to keep among them. */
  cats: CategoryInput[];
  person: Uint32Array | null;
  session: Uint32Array | null;
  /** Seconds, row-aligned (any order). */
  time: Float32Array | null;
  px: Float32Array;
  py: Float32Array;
  pz: Float32Array;
  /** World units a metre is, for how near a launcher must be. */
  units: number;
}

/** A per-row index over a few category columns, a value worked out once per distinct combination. */
function perRow<T extends string>(n: number, cols: CategoryInput[], labelsOf: readonly T[], of: (values: string[]) => T | null): Uint32Array | null {
  const out = new Uint32Array(n);
  const index = new Map<T, number>(labelsOf.map((l, i) => [l, i]));
  // A combination as one number: each column's index times the product of the label counts before it.
  const mult: number[] = [];
  let span = 1;
  for (const c of cols) {
    mult.push(span);
    span *= Math.max(1, c.labels.length + 1);
  }
  if (span > 2 ** 52) return null;
  const memo = new Map<number, number>();
  let lastKey = -1;
  let last = -1;
  let any = false;
  for (let r = 0; r < n; r++) {
    let key = 0;
    for (let c = 0; c < cols.length; c++) key += cols[c].data[r] * mult[c];
    if (key !== lastKey) {
      let v = memo.get(key);
      if (v === undefined) {
        const k = of(cols.map((c) => c.labels[c.data[r]] ?? ''));
        v = k === null ? 0xffffffff : index.get(k)!;
        memo.set(key, v);
      }
      lastKey = key;
      last = v;
    }
    if (last === 0xffffffff) out[r] = 0xffffffff;
    else {
      out[r] = last;
      any = true;
    }
  }
  return any ? out : null;
}

/** Seconds between two flight samples of one thrower past which they are two flights. */
const FLIGHT_GAP = 1;

/** Mark each flight's first sample a launch: per thrower (a track), a new flight after a gap. */
function flightLaunches(inp: CanonicalInput, raw: Uint32Array, flight: boolean[], data: Uint32Array, launch: number, track: (r: number) => number): void {
  const rows: number[] = [];
  for (let r = 0; r < inp.n; r++) if (flight[raw[r]]) rows.push(r);
  const time = inp.time;
  if (!time) {
    if (rows.length) data[rows[0]] = launch;
    return;
  }
  rows.sort((a, b) => track(a) - track(b) || time[a] - time[b]);
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const p = i > 0 ? rows[i - 1] : -1;
    if (p < 0 || track(p) !== track(r) || time[r] - time[p] > FLIGHT_GAP) data[r] = launch;
  }
}

/** As a category column of the values that occur, in the taxonomy's order; unknown rows (0xffffffff) an empty label at the end. */
function column(name: string, data: Uint32Array, labels: readonly string[]): AttributeColumn {
  const count = new Uint32Array(labels.length + 1);
  for (let r = 0; r < data.length; r++) count[data[r] === 0xffffffff ? labels.length : data[r]]++;
  const remap = new Uint32Array(labels.length + 1);
  const categories: string[] = [];
  for (let i = 0; i <= labels.length; i++)
    if (count[i]) {
      remap[i] = categories.length;
      categories.push(i < labels.length ? labels[i] : '');
    }
  for (let r = 0; r < data.length; r++) data[r] = remap[data[r] === 0xffffffff ? labels.length : data[r]];
  return { name, kind: 'category', data, min: 0, max: Math.max(0, categories.length - 1), categories };
}

/** Whether a row's player-or-AI is known from its own columns: `player`, `ai`, or null. */
function actorFrom(cols: { ai?: number; flag?: number; uid?: number; pilot?: number; group?: number; name?: number; type?: number }, v: string[]): 'player' | 'ai' | null {
  if (cols.ai !== undefined) {
    if (TRUE.test(v[cols.ai])) return 'ai';
    if (FALSE.test(v[cols.ai])) return 'player';
  }
  if (cols.flag !== undefined) {
    if (TRUE.test(v[cols.flag])) return 'player';
    if (FALSE.test(v[cols.flag])) return 'ai';
  }
  if (cols.uid !== undefined) {
    const u = v[cols.uid].trim();
    return u && u !== '0' ? 'player' : 'ai';
  }
  if (cols.pilot !== undefined) {
    // Tacview from DCS: an AI's pilot is its group's name with a number ("Senaki-patrol-Cap-01"), or its own name.
    const p = v[cols.pilot].trim();
    if (!p) return null;
    const g = cols.group !== undefined ? v[cols.group].trim().toLowerCase() : '';
    const nm = cols.name !== undefined ? v[cols.name].trim().toLowerCase() : '';
    const pl = p.toLowerCase();
    // Ships and fixed objects are the mission's, whatever their pilot field says ("Blue Stennis").
    if (cols.type !== undefined && /(^|\+)(Sea|Watercraft|Static|Building|Bullseye)(\+|$)/i.test(v[cols.type])) return 'ai';
    if ((g && pl.startsWith(g)) || pl === nm) return 'ai';
    return 'player';
  }
  return null;
}

/** The columns `CANON` names that the data can answer (none it already has). */
export function canonicalColumns(inp: CanonicalInput): AttributeColumn[] {
  const { n, cats } = inp;
  const out: AttributeColumn[] = [];
  if (n === 0 || cats.some((c) => isCanonical(c.name))) return out;
  const find = (re: RegExp) => cats.find((c) => re.test(c.name.trim())) ?? null;
  const types = cats.filter((c) => TYPE_COLUMN.test(c.name.trim()));
  const names = cats.filter((c) => NAME_COLUMN.test(c.name.trim()));

  // Weapons by their type text (Tacview, War Thunder's kind).
  let weapon: Uint8Array | null = null;
  if (types.length) {
    const w = perRow(n, types, ['1'] as const, (v) => (v.some((x) => WEAPON_TYPE.test(x)) ? '1' : null));
    if (w) {
      weapon = new Uint8Array(n);
      for (let r = 0; r < n; r++) weapon[r] = w[r] === 0 ? 1 : 0;
    }
  }
  // A track: a person within a session.
  let sessions = 1;
  if (inp.session) for (let r = 0; r < n; r++) if (inp.session[r] >= sessions) sessions = inp.session[r] + 1;
  const track = (r: number) => (inp.person ? inp.person[r] : 0) * sessions + (inp.session ? inp.session[r] : 0);
  // Each weapon track's first row: its launch.
  const launchRow = new Map<number, number>();
  if (weapon && inp.time && inp.person) {
    for (let r = 0; r < n; r++) {
      if (!weapon[r]) continue;
      const k = track(r);
      const f = launchRow.get(k);
      if (f === undefined || inp.time[r] < inp.time[f]) launchRow.set(k, r);
    }
  }

  // Event type.
  const ev = find(EVENT_COLUMN);
  if (ev) {
    const data = ev ? perRow(n, [ev], EVENT_KINDS, (v) => eventKindOf(v[0])) : new Uint32Array(n);
    if (data) {
      const launch = EVENT_KINDS.indexOf('launch');
      // A Tacview weapon's appearance is its launch, unless its first row says something else.
      const sourceLaunches = ev.labels.some((l) => eventKindOf(l) === 'launch');
      if (!sourceLaunches) for (const r of launchRow.values()) if (data[r] === 0) data[r] = launch;
      // Flight samples under the thrower's name: each flight's first is its launch, where the source logs none.
      const flight = ev.labels.map((l) => FLIGHT.test(l.trim()));
      if (!sourceLaunches && flight.some(Boolean)) flightLaunches(inp, ev.data, flight, data, launch, track);
      // A Tacview recording converted before its events were worked out: found here, on the rows they stand on.
      const type = cats.find((c) => /^type$/i.test(c.name.trim())) ?? null;
      if (type && inp.time && inp.person && ev.labels.includes('Removed') && !ev.labels.some((l) => INFERRED.test(l)) && type.labels.some((l) => TACVIEW_TYPE.test(l)))
        inferAcmiEvents(inp, ev, type, data, track);
      const seen = new Set<number>();
      for (let r = 0; r < n && seen.size < 2; r++) seen.add(data[r]);
      if (seen.size > 1) out.push(column(CANON.event, data, EVENT_KINDS));
    }
  }

  // Player or AI.
  const ai = find(AI_COLUMN);
  const flag = find(PLAYER_FLAG);
  const uid = find(USER_ID);
  const pilot = cats.find((c) => /^pilot$/i.test(c.name.trim())) ?? null;
  const group = cats.find((c) => /^group$/i.test(c.name.trim())) ?? null;
  const nameCol = cats.find((c) => /^name$/i.test(c.name.trim())) ?? null;
  const actorCols: CategoryInput[] = [];
  const at: { ai?: number; flag?: number; uid?: number; pilot?: number; group?: number; name?: number; type?: number } = {};
  const add = (key: keyof typeof at, c: CategoryInput | null) => {
    if (!c) return;
    at[key] = actorCols.length;
    actorCols.push(c);
  };
  add('ai', ai);
  add('flag', flag);
  if (!ai && !flag) add('uid', uid);
  if (!ai && !flag && !uid && pilot) {
    add('pilot', pilot);
    add('group', group);
    add('name', nameCol);
    add('type', cats.find((c) => /^type$/i.test(c.name.trim())) ?? null);
  }
  if (actorCols.length) {
    const data = perRow(n, actorCols, ACTORS, (v) => actorFrom(at, v));
    if (data) {
      // A Tacview weapon names no pilot: it is its launcher's.
      if (!ai && pilot && weapon && launchRow.size) giveToLaunchers(inp, weapon, launchRow, data, track);
      out.push(column(CANON.actor, data, ACTORS));
    }
  }

  // Vehicle class, and the other side's.
  if (names.length || types.length) {
    const cols = [...names, ...types];
    const data = perRow(n, cols, VEHICLE_CLASSES, (v) => vehicleClassOf(v.slice(0, names.length), v.slice(names.length)));
    if (data) out.push(column(CANON.vehicleClass, data, VEHICLE_CLASSES));
  }
  const otherName = find(OTHER_NAME);
  const otherType = find(OTHER_TYPE);
  if (otherName || otherType) {
    const cols = [otherName, otherType].filter((c): c is CategoryInput => !!c);
    const data = perRow(n, cols, VEHICLE_CLASSES, (v) => {
      const nm = otherName ? v[0] : '';
      const ty = otherType ? v[cols.length - 1] : '';
      return nm || ty ? vehicleClassOf([nm], [ty]) : null;
    });
    if (data) out.push(column(CANON.targetClass, data, VEHICLE_CLASSES));
  }
  return out;
}

/** Seconds either side of a launch a launcher's sample may be, and how far from it (metres). */
const LAUNCH_WINDOW_S = 2;
const LAUNCH_REACH_M = 1500;

/**
 * Each weapon track's rows given the player-or-AI of the unit nearest where
 * and when it appeared (its launcher: a Tacview recording names none). One
 * pass over the rows against the launches sorted by time.
 */
function giveToLaunchers(inp: CanonicalInput, weapon: Uint8Array, launchRow: Map<number, number>, actor: Uint32Array, track: (r: number) => number): void {
  const { n, time, px, py, pz } = inp;
  if (!time) return;
  const launches = [...launchRow.entries()].sort((a, b) => time[a[1]] - time[b[1]]);
  const W = launches.length;
  const lt = Float64Array.from(launches, (l) => time[l[1]]);
  const best = new Float64Array(W).fill(Infinity);
  const owner = new Int32Array(W).fill(-1);
  const reach = LAUNCH_REACH_M * inp.units;
  for (let r = 0; r < n; r++) {
    if (weapon[r] || actor[r] === 0xffffffff) continue;
    const t = time[r];
    // The first launch at or after t - window.
    let lo = 0;
    let hi = W;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (lt[m] < t - LAUNCH_WINDOW_S) lo = m + 1;
      else hi = m;
    }
    for (let w = lo; w < W && lt[w] <= t + LAUNCH_WINDOW_S; w++) {
      const lr = launches[w][1];
      if (inp.session && inp.session[lr] !== inp.session[r]) continue;
      const d = Math.hypot(px[r] - px[lr], py[r] - py[lr], pz[r] - pz[lr]);
      if (d > reach) continue;
      // Nearer in time counts as nearer in place: a fast aircraft's samples are far apart.
      const score = d + Math.abs(t - lt[w]) * 100 * inp.units;
      if (score < best[w]) {
        best[w] = score;
        owner[w] = r;
      }
    }
  }
  const given = new Map<number, number>();
  for (let w = 0; w < W; w++) if (owner[w] >= 0) given.set(launches[w][0], actor[owner[w]]);
  if (!given.size) return;
  for (let r = 0; r < n; r++) {
    if (!weapon[r]) continue;
    const a = given.get(track(r));
    if (a !== undefined) actor[r] = a;
  }
}
