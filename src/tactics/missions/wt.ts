/**
 * War Thunder user missions: the text `.blk` the game's mission editor saves
 * (`UserMissions/`). Read: every unit block of `units` - aircraft
 * (`armada`), tanks and wheeled vehicles, infantry, ships, structures - as a
 * group of its own on its army's side (army 1 Blue, army 2 Red), where its
 * matrix puts it and facing where the matrix's forward axis points; its
 * `way` waypoints as its route with their speeds; its `attack_type` as its
 * weapons state; the mission's level, time of day, weather and date; the
 * `areas` as zones and markers. Each unit block's name is its id, so a plan
 * made of it can be written back into the same file (`wtWrite.ts`).
 *
 * War Thunder's world is x east, y up, z north; the War Thunder levels lie in
 * the viewer with z mirrored, so a mission's (x, y, z) is the board's
 * (x, y, -z). A unit block stands for a whole flight or platoon (`count`): it
 * is one figure on the board, named with the block's name.
 */

import { blkChild, blkNum, blkParam, blkStr, blkValue, parseBlk, type BlkBlock } from './blk';
import { figureFor } from '../../figures/match';
import { CATALOG } from '../../figures/catalog';
import type { MissionGroup, MissionImporter, MissionInfo, MissionPlace, MissionState, MissionTask, MissionWaypoint, UnitCategory } from './index';

/** Unit blocks by the kind of unit they hold. */
export const WT_UNIT_BLOCKS: Record<string, UnitCategory> = {
  armada: 'air',
  tankModels: 'ground',
  wheeledVehicles: 'ground',
  infantryUnits: 'infantry',
  ships: 'sea',
  structures: 'static',
  objectGroups: 'static',
};

/** Weapons states (`props.attack_type`) as the board's. */
export const WT_ROE: Record<string, string> = { fire_at_will: 'free', return_fire: 'return', hold_fire: 'hold' };

const SIDES: { army: number; id: string; name: string; color: [number, number, number] }[] = [
  { army: 1, id: 'blue', name: 'Blue', color: [0.26, 0.55, 0.95] },
  { army: 2, id: 'red', name: 'Red', color: [0.93, 0.33, 0.27] },
  { army: 0, id: 'neutral', name: 'Neutral', color: [0.8, 0.8, 0.8] },
];

/** A block's matrix: its three axis rows and its position, game coordinates. */
export function wtMatrix(b: BlkBlock | undefined): number[][] | null {
  const v = blkValue(blkParam(b, 'tm'));
  if (!Array.isArray(v) || v.length < 12) return null;
  return [v.slice(0, 3), v.slice(3, 6), v.slice(6, 9), v.slice(9, 12)];
}

/** Board position of a game position (z mirrored). */
export const wtToBoard = (p: number[]) => ({ x: p[0], y: p[1], z: -p[2] });

/** Box yaw (0 along the board's -z, which is north) from a matrix's forward row: the heading, clockwise from north. */
export const wtYaw = (row0: number[]) => Math.atan2(row0[0], row0[2]);

/** Hours of the day the editor's named times stand for. */
const TIMES: Record<string, number> = { dawn: 5, morning: 7, day: 12, noon: 12, evening: 18, dusk: 19, night: 0 };

function wtInfo(root: BlkBlock): MissionInfo {
  const mission = blkChild(blkChild(root, 'mission_settings'), 'mission');
  const info: MissionInfo = {};
  const env = blkStr(mission, 'environment');
  const h = /^\d+(\.\d+)?$/.test(env) ? Number(env) : TIMES[env.toLowerCase()];
  if (h !== undefined) info.start = Math.round(h * 3600);
  const stars = blkChild(mission, 'stars');
  const y = blkNum(stars, 'year');
  const mo = blkNum(stars, 'month');
  const d = blkNum(stars, 'day');
  if (y && mo && d) info.date = { year: y, month: mo, day: d };
  const weather = blkStr(mission, 'weather');
  if (weather) info.weather = { preset: weather };
  return info;
}

/** A level's name from its path (`levels/avg_poland.bin` -> `avg_poland`). */
export const wtLevelName = (path: string) => path.replace(/^.*[\\/]/, '').replace(/\.bin$/i, '');

export function readWtMission(text: string, file: string): MissionState {
  const root = parseBlk(text);
  const groups: MissionGroup[] = [];
  const places: MissionPlace[] = [];
  const notes: string[] = [];
  const units = blkChild(root, 'units');
  const skipped = new Set<string>();
  for (const b of units?.blocks ?? []) {
    let category = WT_UNIT_BLOCKS[b.name];
    if (!category) {
      if (b.name !== 'squad') skipped.add(b.name);
      continue;
    }
    const tm = wtMatrix(b);
    const name = blkStr(b, 'name');
    if (!tm || !name) continue;
    const type = blkStr(b, 'unit_class');
    const figure = figureFor([type], []);
    if (category === 'air' && figure && CATALOG[figure]?.domain === 'heli') category = 'heli';
    const props = blkChild(b, 'props');
    const army = blkNum(props, 'army', 0);
    const side = SIDES.find((s) => s.army === army) ?? SIDES[2];
    const at = wtToBoard(tm[3]);
    const route: MissionWaypoint[] = [
      { at },
      ...(blkChild(b, 'way')?.blocks ?? [])
        .map((w) => {
          const m = wtMatrix(w);
          if (!m) return null;
          const speed = blkNum(blkChild(w, 'props'), 'speed', 0) / 3.6;
          return { at: wtToBoard(m[3]), ...(speed > 0 ? { speed } : {}), name: w.name, kind: blkStr(w, 'type') || 'normal' };
        })
        .filter((w): w is NonNullable<typeof w> => !!w),
    ];
    const roe = WT_ROE[blkStr(props, 'attack_type')];
    const tasks: MissionTask[] = roe ? [{ name: 'attack_type', kind: 'roe', state: roe }] : [];
    if (tasks.length) route[0] = { ...route[0], tasks };
    groups.push({
      name,
      side: side.id,
      category,
      ref: name,
      units: [{ name, type, category, at, yaw: wtYaw(tm[0]), ref: name }],
      route: category === 'static' ? [] : route,
    });
  }
  if (skipped.size) notes.push(`unit kinds not read: ${[...skipped].join(', ')}`);
  for (const a of blkChild(root, 'areas')?.blocks ?? []) {
    const m = wtMatrix(a);
    if (!m) continue;
    const kind = blkStr(a, 'type');
    const at = wtToBoard(m[3]);
    if (/point/i.test(kind)) places.push({ name: a.name, kind: 'marker', at });
    else places.push({ name: a.name, kind: 'zone', at, radius: Math.max(1, Math.hypot(...m[0]), Math.hypot(...m[2])) });
  }
  if (!groups.length) notes.push('the mission has no units');
  const level = wtLevelName(blkStr(blkChild(blkChild(root, 'mission_settings'), 'mission'), 'level'));
  return {
    format: 'wt-blk',
    game: 'air',
    title: file.replace(/^.*[\\/]/, '').replace(/\.blk$/i, ''),
    map: level ? `War Thunder: ${level}` : '',
    sides: SIDES.map((s) => ({ id: s.id, name: s.name, color: s.color })),
    groups,
    places,
    notes,
    info: wtInfo(root),
  };
}

export const wtBlk: MissionImporter = {
  id: 'wt-blk',
  name: 'War Thunder (.blk)',
  accepts: (name) => name.endsWith('.blk'),
  read: async (bytes, name) => {
    const text = new TextDecoder('utf-8').decode(bytes);
    // The game's own archives hold BLKs in a binary form; a user mission is text.
    if (bytes.length && (bytes[0] < 9 || !/[{:]/.test(text.slice(0, 4096)))) throw new Error('not a text BLK: save the mission from the War Thunder mission editor');
    return readWtMission(text, name);
  },
};
