/**
 * IL-2 Sturmovik: Great Battles missions in the text form the mission editor
 * saves (`.Mission`): blocks of `Name` and `{ ... }`, parameters as
 * `Key = value;` (numbers, quoted strings with backslashes as they are,
 * `[1,2]` lists of indexes, `12:30:0` times, `25.8.1942` dates), and rows
 * `101 : 1;` in a few tables (countries, wind layers). The reader keeps
 * where each parameter and block stands in the text, so the writer
 * (`il2Write.ts`) changes a value and leaves every other byte as it was.
 *
 * **Units.** `Plane`, `Vehicle`, `Ship` and `Train` objects, at the top or in
 * the editor's `Group` folders (not the planes an `Airfield` offers): where
 * `XPos`/`YPos`/`ZPos` put them, facing `YOri` (degrees clockwise from north),
 * on the side the `Countries` table gives their `Country` (coalition 1 the
 * Allies, Blue; 2 the Axis, Red). Planes, tanks, guns and lorries alike:
 * IL-2's drivable tanks are `Vehicle`s.
 *
 * **Groups.** An object is driven through its entity (`MCU_TR_Entity`, its
 * `LinkTrId`). A wingman's or a column member's entity names its leader's
 * entity in `Targets`; a leader and everyone who follows it (directly or
 * through another follower) are one group, lead first. A group's id in the
 * file (`ref`) is its leader object's `Index`; a unit's is its own `Index`.
 *
 * **Routes.** The `MCU_Waypoint`s whose `Objects` name a group's entities,
 * in the order the mission's links (`Targets`, through timers and other
 * logic) lead from one to the next, from the first that no other of them
 * leads to; each with its `Speed` (km/h) and `Area`. Commands given to the
 * group (`MCU_CMD_AttackArea`, `MCU_CMD_AttackTarget`, `MCU_CMD_Cover`,
 * formation, behaviour, take-off, landing) come in at the waypoint whose
 * links reach them, else at the start.
 *
 * **Places.** Airfields as airbases; `MCU_Icon`s with an icon as markers;
 * `MCU_TR_MissionObjective`s as objectives; check zones as zones.
 *
 * The game's metres are x north from the map's south edge, y up, z east from
 * its west edge. On the board, north is up: board x = game z, board z =
 * -(game x). A level tied to the earth moves the mission onto itself when it
 * is loaded with it (`placement.ts`).
 *
 * `.msnbin` (the binary form the game runs and ships its missions in) is
 * written out as this text first (`il2Bin.ts`) and read the same way.
 */

import { figureFor } from '../../figures/match';
import { CATALOG } from '../../figures/catalog';
import { il2BinaryText, isIl2Binary } from './il2Bin';
import type { MissionGroup, MissionImporter, MissionInfo, MissionPlace, MissionState, MissionTask, MissionUnit, MissionWaypoint, UnitCategory } from './index';

// ---------------------------------------------------------------------------
// The text form

export interface Il2Param {
  /** The key; '' for a row of a table (`101 : 1;`). */
  name: string;
  /** The value as written (a string with its quotes taken off). */
  raw: string;
  /** From the key to past the `;`; the value as written (with quotes). */
  start: number;
  end: number;
  valueStart: number;
  valueEnd: number;
}

export interface Il2Block {
  name: string;
  params: Il2Param[];
  blocks: Il2Block[];
  /** From the name to past the closing brace; the braces. */
  start: number;
  end: number;
  open: number;
  close: number;
}

/** The whole file as one block (its name empty). */
export function parseIl2(text: string): Il2Block {
  let i = 0;
  const n = text.length;
  const ws = () => {
    for (;;) {
      while (i < n && /\s/.test(text[i])) i++;
      // `# Mission File Version = 1.0;` and comments.
      if (text[i] === '#' || (text[i] === '/' && text[i + 1] === '/')) {
        const e = text.indexOf('\n', i);
        i = e < 0 ? n : e + 1;
        continue;
      }
      return;
    }
  };
  const fail = (want: string) => new Error(`not an IL-2 mission: expected ${want} at line ${text.slice(0, i).split('\n').length}`);
  const block = (name: string, start: number, open: number): Il2Block => {
    const b: Il2Block = { name, params: [], blocks: [], start, end: n, open, close: n };
    for (;;) {
      ws();
      if (i >= n) {
        if (open < 0) {
          b.end = b.close = n;
          return b;
        }
        throw fail('"}"');
      }
      if (text[i] === '}') {
        if (open < 0) throw fail('an entry');
        b.close = i;
        b.end = ++i;
        return b;
      }
      const s = i;
      const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(text.slice(i, i + 128));
      if (m) {
        i += m[0].length;
        ws();
        if (text[i] === '{') {
          const o = i++;
          b.blocks.push(block(m[0], s, o));
          continue;
        }
        if (text[i] === '=') {
          i++;
          while (i < n && (text[i] === ' ' || text[i] === '\t')) i++;
          const vs = i;
          let raw: string;
          if (text[i] === '"') {
            const e = text.indexOf('"', i + 1);
            if (e < 0) throw fail('the end of a string');
            raw = text.slice(i + 1, e);
            i = e + 1;
          } else {
            while (i < n && text[i] !== ';' && text[i] !== '\n' && text[i] !== '}') i++;
            raw = text.slice(vs, i).trimEnd();
          }
          const ve = text[vs] === '"' ? i : vs + text.slice(vs, i).trimEnd().length;
          while (i < n && text[i] !== ';' && text[i] !== '\n' && text[i] !== '}') i++;
          if (text[i] === ';') i++;
          b.params.push({ name: m[0], raw, start: s, end: i, valueStart: vs, valueEnd: ve });
          continue;
        }
        i = s;
      }
      // A row of a table: everything up to its `;`.
      const e = text.indexOf(';', i);
      const nl = text.indexOf('\n', i);
      const stop = e < 0 || (nl >= 0 && nl < e) ? (nl < 0 ? n : nl) : e;
      if (stop === i) throw fail('an entry');
      const raw = text.slice(i, stop).trim();
      i = stop + (text[stop] === ';' ? 1 : 0);
      b.params.push({ name: '', raw, start: s, end: i, valueStart: s, valueEnd: s + text.slice(s, stop).trimEnd().length });
    }
  };
  return block('', 0, -1);
}

export function il2Param(b: Il2Block | null | undefined, name: string): Il2Param | undefined {
  return b?.params.find((p) => p.name === name);
}
export function il2Child(b: Il2Block | null | undefined, name: string): Il2Block | undefined {
  return b?.blocks.find((c) => c.name === name);
}
export const il2Num = (b: Il2Block | null | undefined, name: string, d = 0): number => {
  const p = il2Param(b, name);
  const v = p ? Number(p.raw) : NaN;
  return Number.isFinite(v) ? v : d;
};
export const il2Str = (b: Il2Block | null | undefined, name: string, d = ''): string => il2Param(b, name)?.raw ?? d;
/** A `[1,2,3]` list of indexes. */
export const il2List = (b: Il2Block | null | undefined, name: string): number[] =>
  (il2Param(b, name)?.raw.match(/-?\d+/g) ?? []).map(Number);

/** A number as the editor writes a position: three decimals. */
export const il2Fixed = (v: number, d = 3) => (Number.isFinite(v) ? v : 0).toFixed(d);
/** A string value, quoted (the format has no escapes: a quote in it is dropped). */
export const il2Text = (s: string) => `"${s.replace(/"/g, "'").replace(/[\r\n]+/g, ' ')}"`;

// ---------------------------------------------------------------------------
// The mission

/** Object blocks that are units. */
export const IL2_UNITS = new Set(['Plane', 'Vehicle', 'Ship', 'Train']);

/** Every block of a kind at the top or in `Group` folders (not inside an object: an airfield's planes). */
export function il2Objects(root: Il2Block, keep: (b: Il2Block) => boolean): Il2Block[] {
  const out: Il2Block[] = [];
  const walk = (b: Il2Block) => {
    for (const c of b.blocks) {
      if (c.name === 'Group') walk(c);
      else if (keep(c)) out.push(c);
    }
  };
  walk(root);
  return out;
}

/** Board point of a block's position (board x = game z, board z = -game x). */
export const il2At = (b: Il2Block) => ({ x: il2Num(b, 'ZPos'), y: il2Num(b, 'YPos'), z: -il2Num(b, 'XPos') });
/** Game position (x north, y, z east) of a board point. */
export const il2Game = (p: { x: number; y: number; z: number }) => ({ x: -p.z, y: p.y, z: p.x });

/** A unit's kind of thing, from its model's folder (`graphics\planes\...`, `graphics\vehicles\...`). */
export function il2Category(model: string, block: string): UnitCategory {
  const m = model.toLowerCase().replace(/\//g, '\\');
  if (block === 'Plane' || /\\planes\\/.test(m)) return 'air';
  if (block === 'Ship' || /\\ships\\/.test(m)) return 'sea';
  return 'ground';
}

/** The script's name, the unit's type in the game (`LuaScripts\WorldObjects\Planes\bf109e4.txt` -> `bf109e4`). */
export const il2Type = (script: string, model: string) =>
  (script || model).replace(/^.*[\\/]/, '').replace(/\.(txt|mgm)$/i, '');

/** Hints for vehicles whose script name says what they are. */
const VEHICLE_HINTS: [RegExp, string][] = [
  [/flak|61k|72k|52k|zis-?3|m4a1-?aa|mg34|dshk|maxim|m16|aaa|zsu|sdkfz10|wirbel|ostwind/i, 'spaa'],
  [/lefh|sfh|ml20|m30|howitzer|lefh18|gun|pak|53k|zis2|flak36|qf|bofors/i, 'towed-gun'],
  [/truck|opel|gaz|zis5|zis6|studebaker|ford|bedford|dodge|blitz|kfz|m3a1|car|horch|willys|jeep/i, 'truck'],
  [/sdkfz251|sdkfz250|ba-?64|ba10|m3|halftrack|bren|universal/i, 'apc-wheeled'],
  [/pz|tiger|panther|t34|t-34|t70|kv1|kv-1|su-?\d|stug|marder|m4|sherman|churchill|cromwell|elefant|ferdinand|nashorn|brummbar|tank|valentine|matilda|is2|isu|t60|m10|jagd|hetzer|wespe|hummel|kv2/i, 'mbt'],
];

/** The figure an IL-2 unit is drawn as: its type and model folder by the catalogue, else by its kind. */
export function il2Figure(type: string, model: string, category: UnitCategory): string | undefined {
  const folder = model.replace(/\\[^\\]*$/, '').replace(/^.*\\/, '');
  const tag = category === 'air' ? 'Air+FixedWing' : category === 'sea' ? 'Sea' : 'Ground';
  // A drivable tank's type starts with "_" (`_t34-76stz`): the same vehicle as the AI's.
  const bare = type.replace(/^_+/, '');
  const f = figureFor([bare, bare.replace(/-/g, ''), folder.replace(/^_+/, '')].filter(Boolean), [tag]);
  if (f && CATALOG[f]) return f;
  if (category === 'ground') for (const [re, hint] of VEHICLE_HINTS) if (re.test(bare)) return hint;
  return undefined;
}

/** IL-2's AI levels by number. */
export const IL2_SKILL = ['Plain', 'Low', 'Normal', 'High', 'Ace'];

const SIDES = [
  { id: 'blue', name: 'Allies', color: [0.26, 0.55, 0.95] as [number, number, number] },
  { id: 'red', name: 'Axis', color: [0.93, 0.33, 0.27] as [number, number, number] },
  { id: 'neutral', name: 'Neutral', color: [0.8, 0.8, 0.8] as [number, number, number] },
];

/** The mission's countries by coalition (`Options.Countries`: `country : coalition`). */
export function il2Coalitions(root: Il2Block): Map<number, number> {
  const out = new Map<number, number>();
  for (const p of il2Child(il2Child(root, 'Options'), 'Countries')?.params ?? []) {
    const m = /^(-?\d+)\s*:\s*(-?\d+)$/.exec(p.raw);
    if (m) out.set(Number(m[1]), Number(m[2]));
  }
  return out;
}

/** A country's side: by the mission's table (coalition 1 Allies, 2 Axis), else by its number (1xx Allies, 2xx Axis). */
export function il2Side(country: number, coalitions: Map<number, number>): string {
  const c = coalitions.get(country) ?? (country >= 100 && country < 200 ? 1 : country >= 200 && country < 300 ? 2 : 0);
  return c === 1 ? 'blue' : c === 2 ? 'red' : 'neutral';
}

/** The country a new unit of a side gets: the first of the mission's countries on it, else the USSR or Germany. */
export function il2CountryOf(side: string, coalitions: Map<number, number>): number {
  const want = side === 'blue' ? 1 : side === 'red' ? 2 : 0;
  for (const [country, c] of coalitions) if (c === want && country !== 0) return country;
  return want === 1 ? 101 : want === 2 ? 201 : 0;
}

/** The levels folder's name of the map a mission is on (`graphics\LANDSCAPE_Moscow_w\height.hini` -> `landscape_moscow_w`). */
export function il2MapName(options: Il2Block | undefined): string {
  const path = il2Str(options, 'HMap') || il2Str(options, 'Textures');
  const m = /graphics[\\/]+([^\\/]+)[\\/]/i.exec(path);
  return m ? m[1].toLowerCase() : il2Str(options, 'GuiMap');
}

/** Every block with an `Index`, by it (MCUs and objects, in `Group` folders too). */
export function il2Indexed(root: Il2Block): Map<number, Il2Block> {
  const out = new Map<number, Il2Block>();
  const walk = (b: Il2Block) => {
    for (const c of b.blocks) {
      if (c.name === 'Group') {
        walk(c);
        continue;
      }
      const p = il2Param(c, 'Index');
      if (p && !out.has(Number(p.raw))) out.set(Number(p.raw), c);
    }
  };
  walk(root);
  return out;
}

export interface Il2Unit {
  block: Il2Block;
  index: number;
  /** Its entity's index, 0 for none. */
  entity: number;
}

export interface Il2Group {
  /** Lead first. */
  units: Il2Unit[];
  /** The waypoints the group drives along, in order. */
  waypoints: Il2Block[];
}

/**
 * The mission's groups: leaders with their followers (entities that name a
 * leader's entity in `Targets`), each with its waypoints in the order the
 * mission's links lead through them.
 */
export function il2Groups(root: Il2Block): { groups: Il2Group[]; byIndex: Map<number, Il2Block> } {
  const byIndex = il2Indexed(root);
  const units: Il2Unit[] = il2Objects(root, (b) => IL2_UNITS.has(b.name) && !!il2Param(b, 'Index')).map((b) => ({ block: b, index: il2Num(b, 'Index'), entity: il2Num(b, 'LinkTrId') }));
  const unitOfEntity = new Map<number, Il2Unit>();
  for (const u of units) if (u.entity && byIndex.get(u.entity)?.name === 'MCU_TR_Entity') unitOfEntity.set(u.entity, u);
  // Follow: an entity whose Targets name another unit's entity follows it.
  const leaderOf = new Map<number, number>();
  for (const [e] of unitOfEntity) {
    const lead = il2List(byIndex.get(e), 'Targets').find((t) => t !== e && unitOfEntity.has(t));
    if (lead !== undefined) leaderOf.set(e, lead);
  }
  const rootOf = (e: number) => {
    const seen = new Set<number>();
    while (leaderOf.has(e) && !seen.has(e)) {
      seen.add(e);
      e = leaderOf.get(e)!;
    }
    return e;
  };
  const byLead = new Map<number, Il2Unit[]>();
  const groups: Il2Group[] = [];
  for (const u of units) {
    const key = u.entity && unitOfEntity.get(u.entity) === u ? rootOf(u.entity) : -u.index - 1;
    let g = byLead.get(key);
    if (!g) {
      g = [];
      byLead.set(key, g);
    }
    g.push(u);
  }
  for (const [key, us] of byLead) {
    // The leader first, then the others as the file has them.
    const li = us.findIndex((u) => u.entity === key);
    const lead = li >= 0 ? us.splice(li, 1)[0] : us.shift()!;
    const members = [lead, ...us];
    groups.push({ units: members, waypoints: il2Route(byIndex, new Set(members.map((u) => u.entity).filter(Boolean))) });
  }
  // Groups in the order their leaders stand in the file.
  groups.sort((a, b) => a.units[0].block.start - b.units[0].block.start);
  return { groups, byIndex };
}

/** MCUs reached from `from`'s Targets through logic that is not one of `stop`, up to a few links on. */
function reach(byIndex: Map<number, Il2Block>, from: Il2Block, stop: (b: Il2Block, i: number) => boolean, depth = 6): number[] {
  const out: number[] = [];
  const seen = new Set<number>();
  let front = il2List(from, 'Targets');
  for (let d = 0; d < depth && front.length; d++) {
    const next: number[] = [];
    for (const i of front) {
      if (seen.has(i)) continue;
      seen.add(i);
      const b = byIndex.get(i);
      if (!b) continue;
      if (stop(b, i)) out.push(i);
      else if (b.name.startsWith('MCU_') && !b.name.startsWith('MCU_CMD') && b.name !== 'MCU_Waypoint') next.push(...il2List(b, 'Targets'));
    }
    front = next;
  }
  return out;
}

/** A group's waypoints, in the order the links lead through them. */
export function il2Route(byIndex: Map<number, Il2Block>, entities: Set<number>): Il2Block[] {
  if (!entities.size) return [];
  const mine = new Map<number, Il2Block>();
  for (const [i, b] of byIndex) if (b.name === 'MCU_Waypoint' && il2List(b, 'Objects').some((o) => entities.has(o))) mine.set(i, b);
  if (!mine.size) return [];
  const next = new Map<number, number[]>();
  const into = new Set<number>();
  for (const [i, b] of mine) {
    const n = reach(byIndex, b, (_, j) => mine.has(j));
    next.set(i, n);
    for (const j of n) if (j !== i) into.add(j);
  }
  const ordered = [...mine.keys()].sort((a, b) => mine.get(a)!.start - mine.get(b)!.start);
  const start = ordered.find((i) => !into.has(i)) ?? ordered[0];
  const out: Il2Block[] = [];
  const seen = new Set<number>();
  for (let i: number | undefined = start; i !== undefined && !seen.has(i); ) {
    seen.add(i);
    out.push(mine.get(i)!);
    i = next.get(i)!.find((j) => !seen.has(j));
  }
  return out;
}

/** A command an IL-2 group is given, as the board's task. */
function commandTask(b: Il2Block, entityOfGroup: Map<number, string>): MissionTask | null {
  const at = il2At(b);
  switch (b.name) {
    case 'MCU_CMD_AttackArea': {
      const r = il2Num(b, 'AttackArea', 500);
      const air = il2Num(b, 'AttackAir') > 0;
      const ground = il2Num(b, 'AttackGround') > 0 || il2Num(b, 'AttackGTargets') > 0;
      return { name: 'AttackArea', kind: ground ? 'cas' : air ? 'sweep' : 'attack', points: [at, { x: at.x + r, y: at.y, z: at.z }], altitude: at.y, ...(il2Num(b, 'Time') > 0 ? { duration: il2Num(b, 'Time') } : {}) };
    }
    case 'MCU_CMD_AttackTarget': {
      const target = il2List(b, 'Targets').map((t) => entityOfGroup.get(t)).find(Boolean);
      return { name: 'AttackTarget', kind: 'attack', ...(target ? { target } : { points: [at] }) };
    }
    case 'MCU_CMD_Cover': {
      const target = il2List(b, 'Targets').map((t) => entityOfGroup.get(t)).find(Boolean);
      return { name: 'Cover', kind: 'escort', ...(target ? { target } : {}) };
    }
    case 'MCU_CMD_Behaviour':
    case 'MCU_CMD_Formation':
    case 'MCU_CMD_TakeOff':
    case 'MCU_CMD_Land':
    case 'MCU_CMD_Effect':
      return { name: b.name.replace(/^MCU_CMD_/, '') };
    default:
      return null;
  }
}

function il2Info(options: Il2Block | undefined): MissionInfo {
  const info: MissionInfo = {};
  const time = /^(\d+):(\d+)(?::(\d+))?$/.exec(il2Str(options, 'Time'));
  if (time) info.start = Number(time[1]) * 3600 + Number(time[2]) * 60 + Number(time[3] ?? 0);
  const date = /^(\d+)\.(\d+)\.(\d+)$/.exec(il2Str(options, 'Date'));
  if (date) info.date = { day: Number(date[1]), month: Number(date[2]), year: Number(date[3]) };
  const w: NonNullable<MissionInfo['weather']> = {};
  if (il2Param(options, 'Temperature')) w.temperature = il2Num(options, 'Temperature');
  // Wind at the ground: the first layer's `height : direction : speed`.
  const wind = il2Child(options, 'WindLayers')?.params[0];
  const wm = wind && /^(-?[\d.]+)\s*:\s*(-?[\d.]+)\s*:\s*(-?[\d.]+)$/.exec(wind.raw);
  if (wm) {
    w.windFrom = Number(wm[2]);
    w.windSpeed = Number(wm[3]);
  }
  if (il2Param(options, 'CloudLevel')) w.cloudBase = il2Num(options, 'CloudLevel');
  const cloud = il2Str(options, 'CloudConfig');
  if (cloud) w.preset = cloud.replace(/\\sky\.ini$/i, '');
  if (il2Param(options, 'Pressure')) w.qnh = il2Num(options, 'Pressure');
  if (Object.keys(w).length) info.weather = w;
  return info;
}

export function readIl2Mission(text: string, file: string): MissionState {
  const root = parseIl2(text);
  const options = il2Child(root, 'Options');
  if (!options) throw new Error('not an IL-2 mission: no Options block');
  const coalitions = il2Coalitions(root);
  const { groups: raw, byIndex } = il2Groups(root);
  const notes: string[] = [];
  const groups: MissionGroup[] = [];
  // Entities by the group they are in, for commands aimed at another group.
  const groupOfEntity = new Map<number, string>();
  for (const g of raw) for (const u of g.units) if (u.entity) groupOfEntity.set(u.entity, String(g.units[0].index));
  const unknown = new Set<string>();
  for (const g of raw) {
    const lead = g.units[0];
    const units: MissionUnit[] = g.units.map((u) => {
      const model = il2Str(u.block, 'Model');
      const type = il2Type(il2Str(u.block, 'Script'), model);
      const category = il2Category(model, u.block.name);
      const figure = il2Figure(type, model, category);
      if (!figure) unknown.add(type);
      const skill = IL2_SKILL[il2Num(u.block, 'AILevel', -1)];
      return {
        name: il2Str(u.block, 'Name') || type,
        type,
        category,
        ...(figure ? { figure } : {}),
        at: il2At(u.block),
        yaw: (il2Num(u.block, 'YOri') * Math.PI) / 180,
        ref: String(u.index),
        ...(skill ? { skill } : {}),
        ...(il2Num(u.block, 'CoopStart') > 0 || /player/i.test(il2Str(u.block, 'Name')) ? { player: true } : {}),
      };
    });
    const country = il2Num(lead.block, 'Country');
    const entities = new Set(g.units.map((u) => u.entity).filter(Boolean));
    // Commands for the group, where the links put them.
    const cmds = new Map<number, Il2Block>();
    for (const [i, b] of byIndex) if (b.name.startsWith('MCU_CMD_') && il2List(b, 'Objects').some((o) => entities.has(o))) cmds.set(i, b);
    const placed = new Set<number>();
    const route: MissionWaypoint[] = [{ at: units[0].at }];
    const startTasks: MissionTask[] = [];
    for (const w of g.waypoints) {
      const tasks: MissionTask[] = [];
      for (const c of reach(byIndex, w, (_, j) => cmds.has(j))) {
        if (placed.has(c)) continue;
        placed.add(c);
        const t = commandTask(cmds.get(c)!, groupOfEntity);
        if (t) tasks.push(t);
      }
      const speed = il2Num(w, 'Speed') / 3.6;
      route.push({ at: il2At(w), ...(speed > 0 ? { speed } : {}), name: il2Str(w, 'Name'), kind: 'Waypoint', ...(tasks.length ? { tasks } : {}) });
    }
    for (const [i, c] of cmds) {
      if (placed.has(i)) continue;
      const t = commandTask(c, groupOfEntity);
      if (t) startTasks.push(t);
    }
    if (startTasks.length) route[0].tasks = startTasks;
    const category = units[0].category;
    groups.push({
      name: units[0].name,
      side: il2Side(country, coalitions),
      category,
      units,
      route: route.length > 1 || startTasks.length ? route : [],
      ref: String(lead.index),
      country: String(country),
    });
  }
  if (unknown.size) notes.push(`types drawn by their kind: ${[...unknown].slice(0, 12).join(', ')}${unknown.size > 12 ? ' …' : ''}`);
  const places: MissionPlace[] = [];
  for (const b of il2Objects(root, (c) => c.name === 'Airfield')) places.push({ name: il2Str(b, 'Name') || 'Airfield', kind: 'airbase', at: il2At(b), side: il2Side(il2Num(b, 'Country'), coalitions) });
  for (const b of byIndex.values()) {
    if (b.name === 'MCU_Icon' && il2Num(b, 'IconId') > 0) places.push({ name: il2Str(b, 'Name') || 'Icon', kind: 'marker', at: il2At(b) });
    else if (b.name === 'MCU_TR_MissionObjective') places.push({ name: il2Str(b, 'Name') || 'Objective', kind: 'objective', at: il2At(b), side: il2Num(b, 'Coalition') === 2 ? 'red' : 'blue' });
    else if (b.name === 'MCU_CheckZone') places.push({ name: il2Str(b, 'Name') || 'Check zone', kind: 'zone', at: il2At(b), radius: Math.max(1, il2Num(b, 'Zone', 100)) });
  }
  const statics = il2Objects(root, (c) => c.name === 'Block' || c.name === 'Bridge').length;
  if (statics) notes.push(`${statics} buildings and bridges left on the map, not on the board`);
  if (!groups.length) notes.push('the mission has no units');
  const map = il2MapName(options);
  return {
    format: 'il2-mission',
    game: 'air',
    title: file.replace(/^.*[\\/]/, '').replace(/\.(mission|msnbin)$/i, ''),
    map: map ? `IL-2: ${map}` : '',
    sides: SIDES.map((s) => ({ ...s })),
    groups,
    places,
    notes,
    info: il2Info(options),
  };
}

export const il2Mission: MissionImporter = {
  id: 'il2-mission',
  name: 'IL-2 Great Battles (.Mission, .msnbin)',
  accepts: (name) => name.endsWith('.mission') || name.endsWith('.msnbin'),
  read: async (bytes, name) => {
    const file = name.split(/[\\/]/).pop() ?? name;
    if (isIl2Binary(bytes)) {
      const m = readIl2Mission(il2BinaryText(bytes), file);
      m.notes.unshift("read from the binary .msnbin; it is written back as the editor's text .Mission");
      return m;
    }
    if (/\.msnbin$/i.test(name)) throw new Error('not an IL-2 binary mission (.msnbin) this reader knows');
    return readIl2Mission(new TextDecoder('utf-8').decode(bytes), file);
  },
};
