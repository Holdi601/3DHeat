/**
 * DCS World missions (.miz): a zip holding `mission` - the Lua table the
 * mission editor writes - and `l10n/DEFAULT/dictionary` for names kept by
 * key. Read: the coalitions (blue, red, neutral) and their countries'
 * planes, helicopters, vehicles, ships and statics, group by group, each
 * unit where it stands with its heading, each group's route with its speeds
 * and the arrival times the mission holds it to (`ETA_locked`); airbases
 * where routes take off and land, FARPs, trigger zones and each side's
 * bullseye; the start time, date, weather and briefing; every group's and
 * unit's id, so a plan made of it can be written back into the same file
 * (`dcsWrite.ts`).
 *
 * Positions are DCS's own metres - x north, y east, altitude - which is how
 * the DCS levels lie (world x north, z east, y up), so a mission falls on
 * its theatre's level where it belongs.
 */

import { zipEntries } from '../../data/zip';
import { luaList, luaNum, luaStr, luaTable, parseLuaAssignments, type LuaTable, type LuaValue } from './lua';
import type { MissionGroup, MissionImporter, MissionInfo, MissionPlace, MissionState, MissionTask, UnitCategory } from './index';
import type { TaskKind } from '../tasks';

/** DCS task ids the board has a task for. */
const DCS_TASKS: Record<string, TaskKind> = {
  Orbit: 'orbit',
  AttackGroup: 'attack',
  AttackUnit: 'attack',
  AttackMapObject: 'attack',
  Strafing: 'attack',
  Bombing: 'strike',
  BombingRunway: 'strike',
  CarpetBombing: 'strike',
  FireAtPoint: 'suppress',
  Escort: 'escort',
  GroundEscort: 'escort',
  Follow: 'follow',
  followBigFormation: 'follow',
  Hold: 'hold',
  FAC: 'recon',
  FAC_AttackGroup: 'recon',
  FAC_EngageGroup: 'recon',
};

/** DCS's group main tasks the board has a task for; the rest come in by their names. */
const DCS_MAIN: Record<string, TaskKind> = { Reconnaissance: 'recon', AFAC: 'recon' };

/** ROE option values: air 0-2 weapons free, 3 return fire, 4 weapons hold (ground and ships 2-4 alike). */
const ROE: Record<number, string> = { 0: 'free', 1: 'free', 2: 'free', 3: 'return', 4: 'hold' };
const ALARM: Record<number, string> = { 0: 'auto', 1: 'green', 2: 'red' };

/** Target types that make a zone's engagement a SEAD, and those that make it a sweep (air targets only). */
const SEAD_TYPES = /^(Air Defence|SAM|SAM SR|SAM TR|SAM LL|SAM CC|AAA|EWR)$/;
const AIR_TYPES = /^(Air|Planes|Helicopters|Fighters|Bombers|Multirole fighters)$/;

/** A task's list of target types (`targetTypes = { [1] = "Air", ... }`). */
export function targetTypes(params: LuaTable | null | undefined): string[] {
  return luaList(params?.targetTypes).filter((x): x is string => typeof x === 'string');
}

/**
 * One entry of a waypoint's task list as the board's task: an orbit with its
 * pattern, height and speed, an attack or a bombing at its point or on a
 * group, an engagement in a zone as close air support, SEAD or a sweep (by
 * what it may engage), the ROE and alarm state options as weapons and alarm
 * states, anything else by its DCS id. Null for what the board does not
 * see: an entry switched off, an option it has no state for, the list itself.
 */
export function dcsTask(tv: LuaValue | undefined, at: { x: number; y: number; z: number }): MissionTask | null {
  const t = luaTable(tv);
  if (!t || t.enabled === false) return null;
  const id = luaStr(t.id);
  const params = luaTable(t.params);
  if (id === 'WrappedAction') {
    const action = luaTable(params?.action);
    const ap = luaTable(action?.params);
    const aid = luaStr(action?.id);
    if (aid === 'Option' && ap) {
      const name = luaNum(ap.name, -1);
      const value = luaNum(ap.value, -1);
      if (name === 0 && ROE[value]) return { name: 'ROE', kind: 'roe', state: ROE[value] };
      if (name === 9 && ALARM[value]) return { name: 'Alarm State', kind: 'alarm', state: ALARM[value] };
      return null;
    }
    return aid ? { name: aid } : null;
  }
  if (!id || id === 'ComboTask') return null;
  if (id === 'ControlledTask') {
    // A task with a stop condition: the task, for as long as its stop says.
    const inner = dcsTask({ enabled: true, ...(luaTable(params?.task) ?? {}) }, at);
    const d = luaNum(luaTable(params?.stopCondition)?.duration, 0);
    return inner ? { ...inner, ...(d > 0 ? { duration: d } : {}) } : null;
  }
  const pt = params && typeof params.x === 'number' && typeof params.y === 'number' ? { x: luaNum(params.x), y: at.y, z: luaNum(params.y) } : null;
  if (id === 'EngageTargetsInZone' && pt) {
    const types = targetTypes(params);
    const r = Math.max(1, luaNum(params?.zoneRadius, 5000));
    const kind: TaskKind = types.some((x) => SEAD_TYPES.test(x)) ? 'sead' : types.length && types.every((x) => AIR_TYPES.test(x)) ? 'sweep' : 'cas';
    return { name: id, kind, points: [pt, { x: pt.x + r, y: pt.y, z: pt.z }] };
  }
  const group = params && typeof params.groupId === 'number' ? String(params.groupId) : '';
  const kind = id === 'EngageGroup' ? 'attack' : DCS_TASKS[id];
  const task: MissionTask = { name: id, ...(kind ? { kind } : {}), ...(group && (kind === 'attack' || kind === 'escort' || kind === 'follow') ? { target: group } : {}) };
  if (kind === 'orbit') {
    const alt = luaNum(params?.altitude, NaN);
    const speed = luaNum(params?.speed, 0);
    if (Number.isFinite(alt)) task.altitude = alt;
    if (speed > 0) task.speed = speed;
    const p1 = luaTable(params?.point);
    const p2 = luaTable(params?.point2);
    if (p1 && p2) task.points = [{ x: luaNum(p1.x), y: at.y, z: luaNum(p1.y) }, { x: luaNum(p2.x), y: at.y, z: luaNum(p2.y) }];
    else if (luaStr(params?.pattern) === 'Race-Track') task.points = [at];
  } else if (pt && kind) task.points = [pt];
  if (kind === 'suppress' && params) task.range = luaNum(params.radius, 0) || undefined;
  if (id === 'Land' && params) {
    const d = luaNum(params.duration, 0);
    if (params.durationFlag === true && d > 0) task.duration = d;
  }
  return task;
}

/** A waypoint's tasks (`task.params.tasks`, a ComboTask's list), each as `dcsTask` reads it. */
export function dcsWaypointTasks(p: LuaTable, at: { x: number; y: number; z: number }): MissionTask[] {
  const out: MissionTask[] = [];
  for (const tv of luaList(luaTable(luaTable(p.task)?.params)?.tasks)) {
    const task = dcsTask(tv, at);
    if (task) out.push(task);
  }
  return out;
}

/** The start time, date, weather and briefing of a mission table. */
export function dcsMissionInfo(mission: LuaTable, dict: (s: string) => string): MissionInfo {
  const info: MissionInfo = {};
  if (typeof mission.start_time === 'number') info.start = mission.start_time;
  const d = luaTable(mission.date);
  if (d && luaNum(d.Year) && luaNum(d.Month) && luaNum(d.Day)) info.date = { year: luaNum(d.Year), month: luaNum(d.Month), day: luaNum(d.Day) };
  const w = luaTable(mission.weather);
  if (w) {
    const ground = luaTable(luaTable(w.wind)?.atGround);
    const clouds = luaTable(w.clouds);
    const weather: NonNullable<MissionInfo['weather']> = {};
    const preset = luaStr(clouds?.preset) || luaStr(w.name);
    if (preset) weather.preset = preset;
    const temp = luaTable(w.season)?.temperature;
    if (typeof temp === 'number') weather.temperature = temp;
    if (ground && typeof ground.speed === 'number') weather.windSpeed = ground.speed;
    // DCS keeps where the wind blows to; a forecast says where it comes from.
    if (ground && typeof ground.dir === 'number') weather.windFrom = (((ground.dir + 180) % 360) + 360) % 360;
    if (clouds && typeof clouds.base === 'number') weather.cloudBase = clouds.base;
    if (clouds && typeof clouds.density === 'number') weather.cloudDensity = clouds.density;
    const vis = luaTable(w.visibility)?.distance;
    if (typeof vis === 'number') weather.visibility = vis;
    if (typeof w.qnh === 'number') weather.qnh = w.qnh;
    if (w.enable_fog === true) weather.fog = true;
    info.weather = weather;
  }
  const text = dict(luaStr(mission.descriptionText));
  if (text && !text.startsWith('DictKey_')) info.description = text;
  const sortie = dict(luaStr(mission.sortie));
  if (sortie && !sortie.startsWith('DictKey_')) info.sortie = sortie;
  return info;
}

const SIDES: { key: string; id: string; name: string; color: [number, number, number] }[] = [
  { key: 'blue', id: 'blue', name: 'Blue', color: [0.26, 0.55, 0.95] },
  { key: 'red', id: 'red', name: 'Red', color: [0.93, 0.33, 0.27] },
  { key: 'neutrals', id: 'neutral', name: 'Neutral', color: [0.8, 0.8, 0.8] },
];

const CATEGORIES: { key: string; category: UnitCategory }[] = [
  { key: 'plane', category: 'air' },
  { key: 'helicopter', category: 'heli' },
  { key: 'vehicle', category: 'ground' },
  { key: 'ship', category: 'sea' },
  { key: 'static', category: 'static' },
];

/** Box yaw from a DCS heading (radians, 0 north, clockwise): north is world +x, east +z. */
export function dcsYaw(heading: number): number {
  return Math.atan2(Math.cos(heading), -Math.sin(heading));
}

/** A mission's own data: the `mission` table (and the dictionary for keyed names) to the neutral shape. */
export function readDcsMission(mission: LuaTable, dictionary: LuaTable | null, name: string, airbaseNames?: ReadonlyMap<number, string>): MissionState {
  const dict = (s: string) => (s.startsWith('DictKey_') && dictionary && typeof dictionary[s] === 'string' ? (dictionary[s] as string) : s);
  const groups: MissionGroup[] = [];
  const places: MissionPlace[] = [];
  const notes: string[] = [];
  const airbases = new Map<number, { x: number; z: number; y: number; side: string }>();
  const coalitions = luaTable(mission.coalition);
  for (const s of SIDES) {
    const c = luaTable(coalitions?.[s.key]);
    if (!c) continue;
    const bull = luaTable(c.bullseye);
    if (bull) places.push({ name: `Bullseye (${s.name})`, kind: 'bullseye', at: { x: luaNum(bull.x), y: 0, z: luaNum(bull.y) }, side: s.id });
    for (const country of luaList(c.country)) {
      const ct = luaTable(country);
      if (!ct) continue;
      for (const cat of CATEGORIES) {
        for (const gv of luaList(luaTable(ct[cat.key])?.group)) {
          const g = luaTable(gv);
          if (!g) continue;
          const ids = { ...(typeof g.groupId === 'number' ? { ref: String(g.groupId) } : {}), ...(luaStr(ct.name) ? { country: luaStr(ct.name) } : {}) };
          const units = luaList(g.units)
            .map((uv) => luaTable(uv))
            .filter((u): u is LuaTable => !!u)
            .map((u) => {
              const type = luaStr(u.type);
              // A static FARP is a place more than a unit.
              const category: UnitCategory = cat.category === 'ground' && /infantry|soldier|paratrooper|^Soldier/i.test(type) ? 'infantry' : cat.category;
              return {
                name: dict(luaStr(u.name)),
                type,
                category,
                at: { x: luaNum(u.x), y: luaNum(u.alt, luaNum(g.alt)), z: luaNum(u.y) },
                yaw: dcsYaw(luaNum(u.heading, luaNum(g.heading))),
                ...(/^(client|player)$/i.test(luaStr(u.skill)) ? { player: true } : {}),
                ...(typeof u.unitId === 'number' ? { ref: String(u.unitId) } : {}),
                ...(luaStr(u.skill) ? { skill: luaStr(u.skill) } : {}),
              };
            });
          if (cat.category === 'static') {
            const farps = units.filter((u) => /farp|helipad|invisible farp|FARP/i.test(u.type));
            for (const f of farps) places.push({ name: f.name || f.type, kind: 'farp', at: f.at, side: s.id });
            const rest = units.filter((u) => !farps.includes(u));
            if (!rest.length) continue;
            groups.push({ name: dict(luaStr(g.name)), side: s.id, category: 'static', units: rest, route: [], ...ids });
            continue;
          }
          const route = luaList(luaTable(g.route)?.points)
            .map((pv) => luaTable(pv))
            .filter((p): p is LuaTable => !!p)
            .map((p) => {
              const airdrome = luaNum(p.airdromeId, -1);
              const at = { x: luaNum(p.x), y: luaNum(p.alt), z: luaNum(p.y) };
              if (airdrome >= 0 && !airbases.has(airdrome)) airbases.set(airdrome, { ...at, side: s.id });
              const eta = p.ETA_locked === true ? luaNum(p.ETA, -1) : -1;
              const speed = luaNum(p.speed, 0);
              const tasks = dcsWaypointTasks(p, at);
              return {
                at,
                ...(speed > 0 ? { speed } : {}),
                ...(eta > 0 ? { eta } : {}),
                ...(typeof p.name === 'string' && p.name ? { name: dict(p.name) } : {}),
                ...(tasks.length ? { tasks } : {}),
                ...(luaStr(p.type) ? { kind: luaStr(p.type) } : {}),
              };
            });
          // A racetrack runs from its waypoint to the next one.
          route.forEach((w, i) => w.tasks?.forEach((t) => t.kind === 'orbit' && t.points && route[i + 1] && (t.points = [w.at, route[i + 1].at])));
          if (!units.length) continue;
          const main = luaStr(g.task);
          const task: MissionTask | undefined = main && main !== 'Nothing' ? { name: main, ...(DCS_MAIN[main] ? { kind: DCS_MAIN[main] } : {}) } : undefined;
          groups.push({ name: dict(luaStr(g.name)), side: s.id, category: cat.category, units, route, ...(task ? { task } : {}), ...ids });
        }
      }
    }
  }
  for (const [id, a] of airbases) places.push({ name: airbaseNames?.get(id) ?? `Airfield ${id}`, kind: 'airbase', at: { x: a.x, y: a.y, z: a.z }, side: a.side });
  for (const zv of luaList(luaTable(mission.triggers)?.zones)) {
    const z = luaTable(zv);
    if (!z) continue;
    places.push({ name: dict(luaStr(z.name, 'Zone')), kind: 'zone', at: { x: luaNum(z.x), y: 0, z: luaNum(z.y) }, radius: Math.max(1, luaNum(z.radius, 100)) });
  }
  const units = groups.reduce((n, g) => n + g.units.length, 0);
  if (!units) notes.push('the mission has no units');
  const theatre = luaStr(mission.theatre);
  return {
    format: 'dcs-miz',
    game: 'air',
    title: name.replace(/\.miz$/i, ''),
    map: theatre ? `DCS: ${theatre}` : '',
    sides: SIDES.map((s) => ({ id: s.id, name: s.name, color: s.color })),
    groups,
    places,
    notes,
    info: dcsMissionInfo(mission, dict),
  };
}

/**
 * A theatre's airbases by id with their names, from its layouts
 * (`<theatre>.layouts.json`, which the DCS maps tool writes into the levels
 * folder), asked of the local server; none without one (a hosted build).
 */
export async function dcsAirbaseNames(theatre: string): Promise<Map<number, string>> {
  const out = new Map<number, string>();
  if (!theatre || typeof fetch !== 'function') return out;
  try {
    const r = await fetch(`/__heat3d/layouts/dcs/${encodeURIComponent(theatre)}`);
    if (!r.ok || r.status === 204) return out;
    const doc = (await r.json()) as { layouts?: { objectives?: { type?: string; airdromeId?: number; name?: string }[] }[] };
    for (const l of doc.layouts ?? []) for (const o of l.objectives ?? []) if (o.type === 'airfield' && typeof o.airdromeId === 'number' && o.name) out.set(o.airdromeId, o.name);
  } catch {
    // No server or no layouts: airbases go by their ids.
  }
  return out;
}

/** The `mission` file's table, and the dictionary's, from a .miz. */
export async function missionTables(bytes: Uint8Array): Promise<{ mission: LuaTable; dictionary: LuaTable | null }> {
  const entries = zipEntries(bytes);
  const find = (n: string) => entries.find((e) => e.name.replace(/\\/g, '/').toLowerCase() === n);
  const m = find('mission');
  if (!m) throw new Error('not a DCS mission: no "mission" in the .miz');
  const text = new TextDecoder('utf-8').decode(await m.bytes());
  const mission = luaTable(parseLuaAssignments(text).mission as LuaValue);
  if (!mission) throw new Error('not a DCS mission: its "mission" file holds no mission table');
  const d = find('l10n/default/dictionary');
  let dictionary: LuaTable | null = null;
  if (d) {
    try {
      dictionary = luaTable(parseLuaAssignments(new TextDecoder('utf-8').decode(await d.bytes())).dictionary as LuaValue);
    } catch {
      dictionary = null;
    }
  }
  return { mission, dictionary };
}

export const dcsMiz: MissionImporter = {
  id: 'dcs-miz',
  name: 'DCS World (.miz)',
  accepts: (name) => name.endsWith('.miz'),
  read: async (bytes, name) => {
    const { mission, dictionary } = await missionTables(bytes);
    const names = await dcsAirbaseNames(luaStr(mission.theatre));
    return readDcsMission(mission, dictionary, name.split(/[\\/]/).pop() ?? name, names);
  },
};
