/**
 * DCS World missions (.miz): a zip holding `mission` - the Lua table the
 * mission editor writes - and `l10n/DEFAULT/dictionary` for names kept by
 * key. Read: the coalitions (blue, red, neutral) and their countries'
 * planes, helicopters, vehicles, ships and statics, group by group, each
 * unit where it stands with its heading, each group's route with its speeds
 * and the arrival times the mission holds it to (`ETA_locked`); airbases
 * where routes take off and land, FARPs, trigger zones and each side's
 * bullseye.
 *
 * Positions are DCS's own metres - x north, y east, altitude - which is how
 * the DCS levels lie (world x north, z east, y up), so a mission falls on
 * its theatre's level where it belongs.
 */

import { zipEntries } from '../../data/zip';
import { luaList, luaNum, luaStr, luaTable, parseLuaAssignments, type LuaTable, type LuaValue } from './lua';
import type { MissionGroup, MissionImporter, MissionPlace, MissionState, UnitCategory } from './index';

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
export function readDcsMission(mission: LuaTable, dictionary: LuaTable | null, name: string): MissionState {
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
              };
            });
          if (cat.category === 'static') {
            const farps = units.filter((u) => /farp|helipad|invisible farp|FARP/i.test(u.type));
            for (const f of farps) places.push({ name: f.name || f.type, kind: 'farp', at: f.at, side: s.id });
            const rest = units.filter((u) => !farps.includes(u));
            if (!rest.length) continue;
            groups.push({ name: dict(luaStr(g.name)), side: s.id, category: 'static', units: rest, route: [] });
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
              return { at, ...(speed > 0 ? { speed } : {}), ...(eta > 0 ? { eta } : {}), ...(typeof p.name === 'string' && p.name ? { name: dict(p.name) } : {}) };
            });
          if (!units.length) continue;
          groups.push({ name: dict(luaStr(g.name)), side: s.id, category: cat.category, units, route });
        }
      }
    }
  }
  for (const [id, a] of airbases) places.push({ name: `Airfield ${id}`, kind: 'airbase', at: { x: a.x, y: a.y, z: a.z }, side: a.side });
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
  };
}

/** The `mission` file's table, and the dictionary's, from a .miz. */
async function missionTables(bytes: Uint8Array): Promise<{ mission: LuaTable; dictionary: LuaTable | null }> {
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
    return readDcsMission(mission, dictionary, name.split(/[\\/]/).pop() ?? name);
  },
};
