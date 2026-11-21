/**
 * Arma 3 missions (mission.sqm as the Eden editor writes it, and the older
 * Arma 2 / pre-Eden layout): the groups of each side with their units -
 * soldiers, vehicles, aircraft, boats - where they stand and which way they
 * face, each group's waypoints, and the editor's markers and triggers.
 *
 * Arma's positions are [x east, height, y north] metres from the map's
 * south-west corner; on the board north is -z, so a unit at (x, y) stands at
 * world (x, height, -y), as Arma recordings (OCAP) are laid out.
 */

import { isBinarisedSqm, parseSqm, sqmClass, sqmItems, sqmList, sqmNum, sqmStr, type SqmClass } from './sqm';
import type { MissionGroup, MissionImporter, MissionPlace, MissionState, MissionTask, MissionUnit, MissionWaypoint, UnitCategory } from './index';
import type { TaskKind } from '../tasks';

/** Arma waypoint types the board has a task for; MOVE is the waypoint itself, the rest come in by their names. */
const ARMA_TYPES: Record<string, TaskKind | null> = {
  MOVE: null,
  SAD: 'sweep',
  DESTROY: 'attack',
  GUARD: 'guard',
  HOLD: 'hold',
  SENTRY: 'screen',
  SUPPORT: 'overwatch',
  CYCLE: 'patrol',
  LOITER: 'orbit',
};
/** Combat modes as weapons states: BLUE never fire, GREEN hold fire but defend, WHITE hold fire and engage, YELLOW / RED fire at will. */
const COMBAT: Record<string, string> = { BLUE: 'hold', GREEN: 'return', WHITE: 'tight', YELLOW: 'free', RED: 'free' };
const BEHAVIOUR: Record<string, string> = { CARELESS: 'safe', SAFE: 'safe', AWARE: 'aware', COMBAT: 'combat', STEALTH: 'stealth' };

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
  } else if (type) out.push({ name: type });
  const combat = sqmStr(w.combatMode ?? attrs?.combatMode).toUpperCase();
  if (COMBAT[combat]) out.push({ name: combat, kind: 'roe', state: COMBAT[combat] });
  const behaviour = sqmStr(w.behaviour ?? attrs?.behaviour).toUpperCase();
  if (BEHAVIOUR[behaviour]) out.push({ name: behaviour, kind: 'alarm', state: BEHAVIOUR[behaviour] });
  return out;
}

const SIDES: { re: RegExp; id: string; name: string; color: [number, number, number] }[] = [
  { re: /^(west|blufor)$/i, id: 'blufor', name: 'BLUFOR', color: [0.26, 0.55, 0.95] },
  { re: /^(east|opfor)$/i, id: 'opfor', name: 'OPFOR', color: [0.93, 0.33, 0.27] },
  { re: /^(guer|independent|resistance|indep)$/i, id: 'indep', name: 'Independent', color: [0.35, 0.8, 0.4] },
  { re: /^(civ|civilian)$/i, id: 'civ', name: 'Civilian', color: [0.75, 0.55, 0.9] },
];

const sideOf = (s: string) => SIDES.find((x) => x.re.test(s.trim()))?.id ?? 'blufor';

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

const world = (p: unknown[]): { x: number; y: number; z: number } => ({ x: sqmNum(p[0] as number), y: sqmNum(p[1] as number), z: -sqmNum(p[2] as number) });

/** An Eden object: its place, facing (angles[1], clockwise from north) and type. */
function edenUnit(o: SqmClass): MissionUnit | null {
  const type = sqmStr(o.type);
  const pi = sqmClass(o.PositionInfo);
  const pos = sqmList(pi?.position ?? o.position);
  if (!type || pos.length < 3) return null;
  const angles = sqmList(pi?.angles);
  const yaw = sqmNum(angles[1] as number);
  const attrs = sqmClass(o.Attributes);
  const cat = armaCategory(type);
  return { name: sqmStr(attrs?.name) || sqmStr(attrs?.description) || type, type, ...(cat.hint ? { figure: cat.hint } : {}), category: cat.category, at: world(pos), yaw, ...((attrs?.isPlayer ?? attrs?.isPlayable) ? { player: true } : {}) };
}

function waypointsOf(g: SqmClass, start?: { x: number; y: number; z: number }): MissionWaypoint[] {
  const seen: { x: number; y: number; z: number }[] = start ? [start] : [];
  return sqmItems(g.Waypoints)
    .map((w) => {
      const pos = sqmList(sqmClass(w.PositionInfo)?.position ?? w.position);
      if (pos.length < 3) return null;
      const at = world(pos);
      const tasks = armaWaypointTasks(w, at, [...seen, at]);
      seen.push(at);
      return { at, ...(sqmStr(w.type) ? { name: sqmStr(w.type) } : {}), ...(tasks.length ? { tasks } : {}) };
    })
    .filter((w): w is MissionWaypoint => !!w);
}

/** Walks an Eden `Entities` list: groups (with their units and waypoints), markers, triggers; nested layers too. */
function walkEden(entities: SqmClass | null, groups: MissionGroup[], places: MissionPlace[]): void {
  for (const it of sqmItems(entities ?? undefined)) {
    const dt = sqmStr(it.dataType).toLowerCase();
    if (dt === 'group') {
      const units = sqmItems(it.Entities)
        .filter((u) => sqmStr(u.dataType).toLowerCase() === 'object')
        .map(edenUnit)
        .filter((u): u is MissionUnit => !!u);
      if (!units.length) continue;
      const route = waypointsOf(it, units[0].at);
      groups.push({ name: sqmStr(sqmClass(it.Attributes)?.name) || `Group ${groups.length + 1}`, side: sideOf(sqmStr(it.side)), category: units[0].category, units, route: route.length ? [{ at: units[0].at }, ...route] : [] });
    } else if (dt === 'object') {
      // An object of no group: an empty vehicle or a prop.
      const u = edenUnit(it);
      if (u) groups.push({ name: u.name, side: sideOf(sqmStr(it.side, 'civ')), category: u.category, units: [u], route: [] });
    } else if (dt === 'marker') {
      const pos = sqmList(it.position);
      if (pos.length >= 3) places.push({ name: sqmStr(it.name), kind: /objective|flag|end/i.test(sqmStr(it.type)) ? 'objective' : 'marker', at: world(pos), text: sqmStr(it.text) || undefined });
    } else if (dt === 'trigger') {
      const pos = sqmList(sqmClass(it.PositionInfo)?.position ?? it.position);
      const size = sqmList(sqmClass(it.Attributes)?.size3 ?? it.size3);
      if (pos.length >= 3) places.push({ name: sqmStr(sqmClass(it.Attributes)?.text) || sqmStr(it.name) || 'Trigger', kind: 'zone', at: world(pos), radius: Math.max(1, Math.max(sqmNum(size[0] as number, 50), sqmNum(size[1] as number, 50))) });
    } else if (dt === 'layer') walkEden(sqmClass(it.Entities), groups, places);
  }
}

/** The older (Arma 2, pre-Eden) layout: `class Groups` of `Vehicles` and `Waypoints`, `class Markers`, `class Sensors`. */
function walkLegacy(mission: SqmClass, groups: MissionGroup[], places: MissionPlace[]): void {
  for (const g of sqmItems(mission.Groups)) {
    const units = sqmItems(g.Vehicles)
      .map((v): MissionUnit | null => {
        const pos = sqmList(v.position);
        const type = sqmStr(v.vehicle);
        if (!type || pos.length < 3) return null;
        const cat = armaCategory(type);
        return { name: sqmStr(v.text) || type, type, ...(cat.hint ? { figure: cat.hint } : {}), category: cat.category, at: world(pos), yaw: (sqmNum(v.azimut) * Math.PI) / 180, ...(/player|play/i.test(sqmStr(v.player)) ? { player: true } : {}) };
      })
      .filter((u): u is MissionUnit => !!u);
    if (!units.length) continue;
    const route = waypointsOf(g, units[0].at);
    groups.push({ name: `Group ${groups.length + 1}`, side: sideOf(sqmStr(g.side)), category: units[0].category, units, route: route.length ? [{ at: units[0].at }, ...route] : [] });
  }
  for (const m of sqmItems(mission.Markers)) {
    const pos = sqmList(m.position);
    if (pos.length >= 3) places.push({ name: sqmStr(m.name), kind: 'marker', at: world(pos), text: sqmStr(m.text) || undefined });
  }
  for (const s of sqmItems(mission.Sensors)) {
    const pos = sqmList(s.position);
    if (pos.length >= 3) places.push({ name: sqmStr(s.text) || sqmStr(s.name) || 'Trigger', kind: 'zone', at: world(pos), radius: Math.max(1, sqmNum(s.a, 50), sqmNum(s.b, 50)) });
  }
}

export function readArmaMission(text: string, name: string): MissionState {
  const root = parseSqm(text);
  const mission = sqmClass(root.Mission);
  if (!mission) throw new Error('not an Arma mission: no "class Mission"');
  const groups: MissionGroup[] = [];
  const places: MissionPlace[] = [];
  if (sqmClass(mission.Entities)) walkEden(sqmClass(mission.Entities), groups, places);
  else walkLegacy(mission, groups, places);
  const used = new Set([...groups.map((g) => g.side), ...places.map((p) => p.side).filter(Boolean)]);
  const map = sqmStr(sqmClass(root.EditorData)?.worldName) || sqmStr(root.worldName) || sqmStr(mission.worldName);
  return {
    format: 'arma-sqm',
    game: 'arma',
    title: sqmStr(sqmClass(mission.Intel)?.briefingName) || name.replace(/\.sqm$/i, ''),
    map: map ? `Arma 3: ${map}` : '',
    sides: SIDES.filter((s) => used.has(s.id) || s.id !== 'civ').map((s) => ({ id: s.id, name: s.name, color: s.color })),
    groups,
    places,
    notes: groups.length ? [] : ['the mission has no groups'],
  };
}

export const armaSqm: MissionImporter = {
  id: 'arma-sqm',
  name: 'Arma 3 (mission.sqm)',
  accepts: (name) => name.endsWith('.sqm'),
  read: async (bytes, name) => {
    if (isBinarisedSqm(bytes)) throw new Error('this mission.sqm is binarised: save it from the Eden editor with "Binarize the scenario file" off, then load it again');
    return readArmaMission(new TextDecoder('utf-8').decode(bytes), name.split(/[\\/]/).pop() ?? name);
  },
};
