/**
 * Arma 3 missions (mission.sqm as the Eden editor writes it, and the older
 * Arma 2 / pre-Eden layout; text, or binarised and read back as text; or a
 * mission .pbo with its mission.sqm inside): the groups of each side with
 * their units - soldiers, vehicles, aircraft, boats - where they stand and
 * which way they face, each group's waypoints, and the editor's markers and
 * triggers.
 *
 * Arma's positions are [x east, height, y north] metres from the map's
 * south-west corner; on the board north is -z, so a unit at (x, y) stands at
 * world (x, height, -y), as the Arma 3 levels and recordings (OCAP) lie.
 *
 * Every group and unit keeps its id in the file (`ref`) for writing the plan
 * back (`armaWrite.ts`): an Eden entity's `id` (`g:<id>` for a group, `o:<id>`
 * for an object of no group), and in the older layout its place in the lists
 * (`G<n>` for the n-th group, `G<n>.<k>` for its k-th unit, `V<n>` for an
 * empty vehicle).
 *
 * A unit's kind comes from the game's own catalogue where it is installed (its
 * class and the real vehicle it stands for), else from the words its class
 * name is made of.
 */

import { derapifyText, isBinarisedSqm, parseSqm, sqmClass, sqmItems, sqmList, sqmNum, sqmStr, type SqmClass } from './sqm';
import { catalogItem } from '../../figures/unitcatalog';
import { figureFor, figureForClass } from '../../figures/match';
import { arma3RealVehicle } from '../../data/armaUnits';
import type { MissionGroup, MissionImporter, MissionInfo, MissionPlace, MissionState, MissionTask, MissionUnit, MissionWaypoint, UnitCategory } from './index';
import type { TaskKind } from '../tasks';

/** Arma waypoint types (upper case, Eden's names and the older ones) the board has a task for; MOVE is the waypoint itself, the rest come in by their names. */
export const ARMA_TYPES: Record<string, TaskKind | null> = {
  MOVE: null,
  SAD: 'sweep',
  SEEKANDDESTROY: 'sweep',
  DESTROY: 'attack',
  GUARD: 'guard',
  HOLD: 'hold',
  SENTRY: 'screen',
  SUPPORT: 'overwatch',
  CYCLE: 'patrol',
  LOITER: 'orbit',
};
/** Combat modes as weapons states: BLUE never fire, GREEN hold fire but defend, WHITE hold fire and engage, YELLOW / RED fire at will. */
export const COMBAT: Record<string, string> = { BLUE: 'hold', GREEN: 'return', WHITE: 'tight', YELLOW: 'free', RED: 'free' };
export const BEHAVIOUR: Record<string, string> = { CARELESS: 'safe', SAFE: 'safe', AWARE: 'aware', COMBAT: 'combat', STEALTH: 'stealth' };

/** A waypoint's behaviour: `combat` in the files the editors write, `behaviour` in some. */
export const behaviourOf = (w: SqmClass, attrs?: SqmClass | null): string => sqmStr(w.combat ?? w.behaviour ?? attrs?.combat ?? attrs?.behaviour).toUpperCase();

/**
 * A waypoint's tasks: its type as the board's task (a search and destroy a
 * sweep of the ground round it, a CYCLE a patrol back round the route), its
 * combat mode as a weapons state and its behaviour as an alarm state.
 * `route` is the group's points so far, for a CYCLE.
 */
export function armaWaypointTasks(w: SqmClass, at: { x: number; y: number; z: number }, route: { x: number; y: number; z: number }[]): MissionTask[] {
  const out: MissionTask[] = [];
  const attrs = sqmClass(w.Attributes);
  const type = sqmStr(w.type).toUpperCase();
  if (type && type in ARMA_TYPES) {
    const kind = ARMA_TYPES[type];
    if (kind === 'sweep') out.push({ name: type, kind, points: [at, { x: at.x + 50, y: at.y, z: at.z }] });
    else if (kind === 'patrol') out.push({ name: type, kind, points: route.length >= 2 ? route.slice() : [at], loops: 2 });
    else if (kind === 'orbit') out.push({ name: type, kind, points: [at], range: sqmNum(w.loiterRadius ?? attrs?.loiterRadius, 0) || undefined });
    else if (kind) out.push({ name: type, kind });
  } else if (type) out.push({ name: sqmStr(w.type) });
  const combat = sqmStr(w.combatMode ?? attrs?.combatMode).toUpperCase();
  if (COMBAT[combat]) out.push({ name: combat, kind: 'roe', state: COMBAT[combat] });
  const behaviour = behaviourOf(w, attrs);
  if (BEHAVIOUR[behaviour]) out.push({ name: behaviour, kind: 'alarm', state: BEHAVIOUR[behaviour] });
  return out;
}

export const SIDES: { re: RegExp; id: string; name: string; color: [number, number, number]; eden: string; legacy: string }[] = [
  { re: /^(west|blufor)$/i, id: 'blufor', name: 'BLUFOR', color: [0.26, 0.55, 0.95], eden: 'West', legacy: 'WEST' },
  { re: /^(east|opfor)$/i, id: 'opfor', name: 'OPFOR', color: [0.93, 0.33, 0.27], eden: 'East', legacy: 'EAST' },
  { re: /^(guer|independent|resistance|indep)$/i, id: 'indep', name: 'Independent', color: [0.35, 0.8, 0.4], eden: 'Independent', legacy: 'GUER' },
  { re: /^(civ|civilian)$/i, id: 'civ', name: 'Civilian', color: [0.75, 0.55, 0.9], eden: 'Civilian', legacy: 'CIV' },
];

export const sideOf = (s: string) => SIDES.find((x) => x.re.test(s.trim()))?.id ?? 'blufor';

/** The kinds of the Arma 3 catalogue's vehicle classes, as the board's: a category and a figure class. */
const CATALOGUE_CLASS: Record<string, { category: UnitCategory; hint: string }> = {
  car: { category: 'ground', hint: 'jeep' },
  truck: { category: 'ground', hint: 'truck' },
  'static-mg': { category: 'ground', hint: 'towed-gun' },
  static: { category: 'ground', hint: 'towed-gun' },
  mortar: { category: 'ground', hint: 'mortar' },
  boat: { category: 'sea', hint: 'patrol-boat' },
  submarine: { category: 'sea', hint: 'patrol-boat' },
  'heli-transport': { category: 'heli', hint: 'heli-transport' },
  'heli-attack': { category: 'heli', hint: 'heli-attack' },
  uav: { category: 'air', hint: 'drone-fixed' },
  ugv: { category: 'ground', hint: 'jeep' },
  mbt: { category: 'ground', hint: 'mbt' },
  'light-tank': { category: 'ground', hint: 'light-tank' },
  'tank-destroyer': { category: 'ground', hint: 'tank-destroyer' },
  ifv: { category: 'ground', hint: 'ifv' },
  apc: { category: 'ground', hint: 'apc-wheeled' },
  arv: { category: 'ground', hint: 'apc-tracked' },
  spaa: { category: 'ground', hint: 'spaa' },
  spg: { category: 'ground', hint: 'sp-artillery' },
  mlrs: { category: 'ground', hint: 'mlrs' },
  fighter: { category: 'air', hint: 'multirole' },
  plane: { category: 'air', hint: 'transport' },
  attack: { category: 'air', hint: 'attack' },
  tiltrotor: { category: 'air', hint: 'tiltrotor' },
};

/** What an Arma class name says the unit is: its kind of vehicle from the words its name is made of. */
export function armaCategory(type: string): { category: UnitCategory; hint: string | null } {
  const t = type.toLowerCase();
  if (/_(plane|uav_0[25]|jet)|plane_|fighter|_cas_/.test(t)) return { category: 'air', hint: null };
  if (/heli|_uav_01|chopper/.test(t)) return { category: 'heli', hint: null };
  if (/boat|ship|sdv|_destroyer|_carrier/.test(t)) return { category: 'sea', hint: t.includes('rhib') || t.includes('rubber') ? 'rhib' : 'patrol-boat' };
  if (/_mbt_|tank/.test(t)) return { category: 'ground', hint: 'mbt' };
  if (/_apc_tracked|_afv_|ifv/.test(t)) return { category: 'ground', hint: 'ifv' };
  if (/_apc_wheeled|_apc_/.test(t)) return { category: 'ground', hint: 'apc-wheeled' };
  if (/_mrap_/.test(t)) return { category: 'ground', hint: 'mrap' };
  if (/_truck_|truck/.test(t)) return { category: 'ground', hint: 'truck' };
  if (/_lsv_|offroad|quadbike|_car_|_suv_|hatchback|van_/.test(t)) return { category: 'ground', hint: 'jeep' };
  if (/_aa_|_sam_|_radar_/.test(t)) return { category: 'ground', hint: 'spaa' };
  if (/mortar|artillery|_mlrs|_arty/.test(t)) return { category: 'ground', hint: 'sp-artillery' };
  if (/_hmg_|_gmg_|static|_at_01|_aa_01/.test(t)) return { category: 'ground', hint: 'towed-gun' };
  return { category: 'infantry', hint: /sniper|_sn_/.test(t) ? 'sniper' : /_at_|_lat_|_aa_/.test(t) ? 'anti-tank' : /medic/.test(t) ? 'medic' : /crew|pilot/.test(t) ? 'crew' : 'soldier' };
}

/** A unit's kind: the catalogue's class and real vehicle when the class is in it, else the words of its name. */
export function armaKind(type: string): { category: UnitCategory; hint: string | null } {
  const it = catalogItem(type, 'arma3');
  if (it?.kind === 'man') return { category: 'infantry', hint: armaCategory(type).hint ?? 'soldier' };
  const own = it?.kind === 'vehicle' ? CATALOGUE_CLASS[it.class ?? ''] : undefined;
  if (it && own) {
    const real = it.key || arma3RealVehicle(it.name, it.class ?? '');
    return { category: own.category, hint: (real && figureFor([real], [])) || figureForClass(own.hint) || own.hint };
  }
  return armaCategory(type);
}

const world = (p: unknown[]): { x: number; y: number; z: number } => ({ x: sqmNum(p[0] as number), y: sqmNum(p[1] as number), z: -sqmNum(p[2] as number) });

/** Whether a class is a soldier or a person: the catalogue says so, else its name has the words of one. */
function isMan(type: string): boolean {
  const it = catalogItem(type, 'arma3');
  if (it) return it.kind === 'man';
  return /^[a-z]+_.*(soldier|_man|crew|pilot|medic|sniper|officer|survivor|diver|recon|spotter|engineer|story|_tl_|_sl_)/i.test(type);
}

/** A skill as the board keeps it: the file's number. */
const skillOf = (v: unknown) => (typeof v === 'number' ? String(v) : typeof v === 'string' && v ? v : undefined);

/** An Eden object: its place, facing (angles[1], clockwise from north) and type. */
function edenUnit(o: SqmClass): MissionUnit | null {
  const type = sqmStr(o.type);
  const pi = sqmClass(o.PositionInfo);
  const pos = sqmList(pi?.position ?? o.position);
  if (!type || pos.length < 3) return null;
  const angles = sqmList(pi?.angles);
  const yaw = sqmNum(angles[1] as number);
  const attrs = sqmClass(o.Attributes);
  const cat = armaKind(type);
  const skill = skillOf(attrs?.skill ?? o.skill);
  return {
    name: sqmStr(attrs?.name) || sqmStr(attrs?.description) || type,
    type,
    ...(cat.hint ? { figure: cat.hint } : {}),
    category: cat.category,
    at: world(pos),
    yaw,
    ...((attrs?.isPlayer ?? attrs?.isPlayable) ? { player: true } : {}),
    ...(o.id !== undefined ? { ref: String(sqmNum(o.id)) } : {}),
    ...(skill ? { skill } : {}),
  };
}

/** A group's waypoints: its `Waypoint` entities (Eden) and its `Waypoints` list (older files, and some Eden ones), in order. */
export function armaWaypointItems(g: SqmClass): SqmClass[] {
  return [...sqmItems(g.Entities).filter((e) => sqmStr(e.dataType).toLowerCase() === 'waypoint'), ...sqmItems(g.Waypoints)];
}

export const waypointPos = (w: SqmClass) => sqmList(sqmClass(w.PositionInfo)?.position ?? w.position);

function waypointsOf(g: SqmClass, start?: { x: number; y: number; z: number }): MissionWaypoint[] {
  const seen: { x: number; y: number; z: number }[] = start ? [start] : [];
  return armaWaypointItems(g)
    .map((w): MissionWaypoint | null => {
      const pos = waypointPos(w);
      if (pos.length < 3) return null;
      const at = world(pos);
      const tasks = armaWaypointTasks(w, at, [...seen, at]);
      seen.push(at);
      return { at, ...(sqmStr(w.type) ? { name: sqmStr(w.type), kind: sqmStr(w.type) } : {}), ...(tasks.length ? { tasks } : {}) };
    })
    .filter((w): w is MissionWaypoint => !!w);
}

/** The category a group is: its lead's, but a vehicle's when soldiers crew it (they sit in it). */
function groupCategory(units: MissionUnit[]): UnitCategory {
  return units.find((u) => u.category !== 'infantry')?.category ?? units[0].category;
}

/** Walks an Eden `Entities` list: groups (with their units and waypoints), markers, triggers; nested layers too. */
function walkEden(entities: SqmClass | null, groups: MissionGroup[], places: MissionPlace[], path: string, props: { n: number }): void {
  sqmItems(entities ?? undefined).forEach((it, i) => {
    const dt = sqmStr(it.dataType).toLowerCase();
    const id = it.id !== undefined ? String(sqmNum(it.id)) : `${path}${i}`;
    if (dt === 'group') {
      const units = sqmItems(it.Entities)
        .filter((u) => sqmStr(u.dataType).toLowerCase() === 'object')
        .map(edenUnit)
        .filter((u): u is MissionUnit => !!u);
      if (!units.length) return;
      const route = waypointsOf(it, units[0].at);
      groups.push({
        name: sqmStr(sqmClass(it.Attributes)?.name) || `Group ${groups.length + 1}`,
        side: sideOf(sqmStr(it.side)),
        category: groupCategory(units),
        units,
        route: route.length ? [{ at: units[0].at }, ...route] : [],
        ref: `g:${id}`,
        country: sqmStr(it.side),
      });
    } else if (dt === 'object') {
      // An object of no group: an empty vehicle or a prop.
      const u = edenUnit(it);
      // Props (walls, sandbags, boxes) are not units: they stay in the file, off the board.
      if (u && u.category === 'infantry' && !isMan(u.type)) props.n++;
      else if (u) groups.push({ name: u.name, side: sideOf(sqmStr(it.side, 'civ')), category: u.category, units: [u], route: [], ref: `o:${id}`, country: sqmStr(it.side, 'Empty') });
    } else if (dt === 'marker') {
      const pos = sqmList(it.position);
      if (pos.length >= 3) places.push({ name: sqmStr(it.name), kind: /objective|flag|end/i.test(sqmStr(it.type)) ? 'objective' : 'marker', at: world(pos), text: sqmStr(it.text) || undefined });
    } else if (dt === 'trigger') {
      const pos = sqmList(sqmClass(it.PositionInfo)?.position ?? it.position);
      const size = sqmList(sqmClass(it.Attributes)?.size3 ?? it.size3);
      if (pos.length >= 3) places.push({ name: sqmStr(sqmClass(it.Attributes)?.text) || sqmStr(it.name) || 'Trigger', kind: 'zone', at: world(pos), radius: Math.max(1, Math.max(sqmNum(size[0] as number, 50), sqmNum(size[1] as number, 50))) });
    } else if (dt === 'layer') walkEden(sqmClass(it.Entities), groups, places, `${path}${i}.`, props);
  });
}

/** A unit of the older layout. */
function legacyUnit(v: SqmClass, ref: string): MissionUnit | null {
  const pos = sqmList(v.position);
  const type = sqmStr(v.vehicle);
  if (!type || pos.length < 3) return null;
  const cat = armaKind(type);
  const skill = skillOf(v.skill);
  return { name: sqmStr(v.text) || type, type, ...(cat.hint ? { figure: cat.hint } : {}), category: cat.category, at: world(pos), yaw: (sqmNum(v.azimut) * Math.PI) / 180, ...(/player|play/i.test(sqmStr(v.player)) ? { player: true } : {}), ref, ...(skill ? { skill } : {}) };
}

/** The older (Arma 2, pre-Eden) layout: `class Groups` of `Vehicles` and `Waypoints`, empty `Vehicles`, `class Markers`, `class Sensors`. */
function walkLegacy(mission: SqmClass, groups: MissionGroup[], places: MissionPlace[]): void {
  sqmItems(mission.Groups).forEach((g, gi) => {
    const units = sqmItems(g.Vehicles)
      .map((v, k) => legacyUnit(v, `G${gi}.${k}`))
      .filter((u): u is MissionUnit => !!u);
    if (!units.length) return;
    const route = waypointsOf(g, units[0].at);
    groups.push({ name: `Group ${groups.length + 1}`, side: sideOf(sqmStr(g.side)), category: groupCategory(units), units, route: route.length ? [{ at: units[0].at }, ...route] : [], ref: `G${gi}`, country: sqmStr(g.side) });
  });
  sqmItems(mission.Vehicles).forEach((v, vi) => {
    const u = legacyUnit(v, `V${vi}`);
    if (u) groups.push({ name: u.name, side: sideOf(sqmStr(v.side, 'civ')), category: u.category, units: [u], route: [], ref: `V${vi}`, country: sqmStr(v.side, 'EMPTY') });
  });
  for (const m of sqmItems(mission.Markers)) {
    const pos = sqmList(m.position);
    if (pos.length >= 3) places.push({ name: sqmStr(m.name), kind: 'marker', at: world(pos), text: sqmStr(m.text) || undefined });
  }
  for (const s of sqmItems(mission.Sensors)) {
    const pos = sqmList(s.position);
    if (pos.length >= 3) places.push({ name: sqmStr(s.text) || sqmStr(s.name) || 'Trigger', kind: 'zone', at: world(pos), radius: Math.max(1, sqmNum(s.a, 50), sqmNum(s.b, 50)) });
  }
}

/** The vanilla terrains' sizes, metres: a mission whose units lie beyond one is not on it. */
export const ARMA3_WORLDS: Record<string, number> = { Altis: 30720, Stratis: 8192, Tanoa: 15360, Malden: 12800, Enoch: 12800, VR: 8192 };

/** A world's name as the levels folder spells it, where it is a vanilla one. */
const knownWorld = (w: string) => Object.keys(ARMA3_WORLDS).find((k) => k.toLowerCase() === w.toLowerCase()) ?? w;

/**
 * The world a mission is on: the name its folder or .pbo gives (`Name.Altis`),
 * the file's own `worldName` where it has one, else the terrain addons it
 * lists most (`A3_Map_Altis`) among the terrains its units fit on. `how`
 * says which.
 */
export function armaWorld(root: SqmClass, mission: SqmClass, file: string, groups: MissionGroup[]): { world: string; how: 'name' | 'file' | 'addons' | '' } {
  const stem = file
    .replace(/^.*[\\/](?=[^\\/]*[\\/]mission\.sqm$)/i, '')
    .replace(/(__|[\\/])?mission\.sqm$/i, '')
    .replace(/\.pbo$/i, '')
    .replace(/^.*[\\/]/, '');
  const named = /\.([A-Za-z][A-Za-z0-9_]*)$/.exec(stem)?.[1];
  if (named) return { world: knownWorld(named), how: 'name' };
  const own = sqmStr(sqmClass(root.EditorData)?.worldName) || sqmStr(root.worldName) || sqmStr(mission.worldName);
  if (own) return { world: knownWorld(own), how: 'file' };
  let far = 0;
  for (const g of groups) for (const u of g.units) far = Math.max(far, u.at.x, -u.at.z);
  const votes = new Map<string, number>();
  const addons = [...sqmList(root.addons), ...sqmList(mission.addOns), ...sqmItems(sqmClass(sqmClass(root.AddonsMetaData)?.List) ?? undefined).map((a) => a.className)];
  for (const a of addons) {
    const m = /^a3_map_([a-z0-9]+?)(?:_scenes)?(?:_f)?$/i.exec(sqmStr(a as string));
    if (!m) continue;
    const w = knownWorld(m[1]);
    if (ARMA3_WORLDS[w] !== undefined && ARMA3_WORLDS[w] < far) continue;
    votes.set(w, (votes.get(w) ?? 0) + 1);
  }
  const best = [...votes].sort((a, b) => b[1] - a[1])[0];
  return best ? { world: best[0], how: 'addons' } : { world: '', how: '' };
}

/** The scenario's start, date and weather (`Intel`). */
function armaInfo(mission: SqmClass): MissionInfo | undefined {
  const intel = sqmClass(mission.Intel);
  if (!intel) return undefined;
  const info: MissionInfo = {};
  const y = sqmNum(intel.year);
  const mo = sqmNum(intel.month);
  const d = sqmNum(intel.day);
  if (y && mo && d) info.date = { year: y, month: mo, day: d };
  if (intel.hour !== undefined) info.start = Math.round(sqmNum(intel.hour) * 3600 + sqmNum(intel.minute) * 60);
  if (intel.startWeather !== undefined) info.weather = { cloudDensity: Math.round(sqmNum(intel.startWeather) * 10), ...(sqmNum(intel.startFog) > 0.3 ? { fog: true } : {}) };
  const brief = sqmStr(intel.briefingName);
  if (brief) info.sortie = brief;
  const overview = sqmStr(intel.overviewText);
  if (overview) info.description = overview;
  return info;
}

export function readArmaMission(text: string, name: string, notes: string[] = []): MissionState {
  const root = parseSqm(text);
  const mission = sqmClass(root.Mission);
  if (!mission) throw new Error('not an Arma mission: no "class Mission"');
  const groups: MissionGroup[] = [];
  const places: MissionPlace[] = [];
  const props = { n: 0 };
  if (sqmClass(mission.Entities)) walkEden(sqmClass(mission.Entities), groups, places, 'e', props);
  else walkLegacy(mission, groups, places);
  if (props.n) notes.push(`${props.n} props (walls, boxes, signs) are left off the board and stay in the file as they are`);
  const used = new Set([...groups.map((g) => g.side), ...places.map((p) => p.side).filter(Boolean)]);
  const { world: map, how } = armaWorld(root, mission, name, groups);
  if (how === 'addons') notes.push(`the world is not named in mission.sqm; taken as ${map} from the addons it needs`);
  else if (!map) notes.push('the world is not named in mission.sqm: open the mission .pbo (Name.World.pbo), or load its level from the level panel');
  const info = armaInfo(mission);
  const base = name.replace(/^.*[\\/]/, '');
  const brief = sqmStr(sqmClass(mission.Intel)?.briefingName);
  return {
    format: 'arma-sqm',
    game: 'arma',
    title: (brief && !brief.startsWith('@') ? brief : '') || base.replace(/(__)?mission\.sqm$/i, '').replace(/\.pbo$/i, '') || 'mission',
    map: map ? `Arma 3: ${map}` : '',
    sides: SIDES.filter((s) => used.has(s.id) || s.id !== 'civ').map((s) => ({ id: s.id, name: s.name, color: s.color })),
    groups,
    places,
    notes: groups.length ? notes : [...notes, 'the mission has no groups'],
    ...(info ? { info } : {}),
  };
}

// ---------------------------------------------------------------------------
// Mission .pbo files

export interface PboEntry {
  name: string;
  /** Where its bytes are in the file, and how many. */
  offset: number;
  size: number;
  /** 0x43707273 ('Cprs', compressed) or 0. */
  packing: number;
  /** Where its header record lies (name to stored size). */
  headStart: number;
  headEnd: number;
}

/**
 * A .pbo's table: each file's name and where its bytes lie. The layout: a
 * header record per file - its name (zero-ended), packing method, size,
 * reserved word, time and stored size - the first one empty with a `Vers`
 * method and name/value pairs after it, an empty name ending the table; the
 * files' bytes follow in order, then a zero byte and a SHA-1 of what is
 * before it.
 */
export function pboEntries(bytes: Uint8Array): { entries: PboEntry[]; headerEnd: number; dataEnd: number } {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const dec = new TextDecoder('latin1');
  let i = 0;
  const z = () => {
    const e = bytes.indexOf(0, i);
    if (e < 0) throw new Error('not a .pbo');
    const t = dec.decode(bytes.subarray(i, e));
    i = e + 1;
    return t;
  };
  const heads: { name: string; packing: number; size: number; headStart: number; headEnd: number }[] = [];
  for (;;) {
    const headStart = i;
    const name = z();
    if (i + 20 > bytes.length) throw new Error('not a .pbo');
    const packing = dv.getUint32(i, true);
    const size = dv.getUint32(i + 16, true);
    i += 20;
    if (!name && packing === 0x56657273) {
      while (z()) z();
      continue;
    }
    if (!name) break;
    heads.push({ name, packing, size, headStart, headEnd: i });
  }
  const headerEnd = i;
  let off = i;
  const entries = heads.map((h) => {
    const e = { ...h, offset: off };
    off += h.size;
    return e;
  });
  if (off > bytes.length) throw new Error('not a .pbo: its files run past its end');
  return { entries, headerEnd, dataEnd: off };
}

/** The mission.sqm of a mission .pbo, and its entry. */
export function pboMissionSqm(bytes: Uint8Array): { entry: PboEntry; bytes: Uint8Array } {
  const { entries } = pboEntries(bytes);
  const e = entries.filter((x) => /(^|[\\/])mission\.sqm$/i.test(x.name)).sort((a, b) => a.name.length - b.name.length)[0];
  if (!e) throw new Error('this .pbo holds no mission.sqm');
  if (e.packing === 0x43707273) throw new Error("this .pbo's mission.sqm is compressed: unpack the .pbo and open its mission.sqm");
  return { entry: e, bytes: bytes.subarray(e.offset, e.offset + e.size) };
}

/** A mission.sqm's text: as it is, or read back from its binarised form. */
export function armaSqmText(bytes: Uint8Array): { text: string; binarised: boolean } {
  if (isBinarisedSqm(bytes)) return { text: derapifyText(bytes), binarised: true };
  return { text: new TextDecoder('utf-8').decode(bytes), binarised: false };
}

export const armaSqm: MissionImporter = {
  id: 'arma-sqm',
  name: 'Arma 3 (mission.sqm, mission .pbo)',
  accepts: (name) => name.endsWith('.sqm') || name.endsWith('.pbo'),
  read: async (bytes, name) => {
    const notes: string[] = [];
    const sqm = name.toLowerCase().endsWith('.pbo') ? pboMissionSqm(bytes).bytes : bytes;
    const { text, binarised } = armaSqmText(sqm);
    if (binarised) notes.push('the mission.sqm is binarised: read back as text, and written back as text');
    return readArmaMission(text, name.split(/[\\/]/).pop() ?? name, notes);
  },
};
