/**
 * A plan written back as a DCS World mission (.miz): either the mission it
 * was made from, patched, or a new mission of its own for a theatre.
 *
 * **Patch.** The `mission` file is changed in place, value by value, and
 * every other file of the .miz is copied as it was stored: a group whose
 * units, route and tasks are as they came in is left byte for byte; a unit
 * moved or turned gets its new x, y, height and heading; a route whose
 * waypoints moved gets them moved, a waypoint added or taken away rewrites
 * that group's point list (the waypoints that stay keep everything they
 * had: their type, airfield, formation, properties); a waypoint's tasks are
 * rewritten only where the board's differ, and the tasks the board does not
 * show (switched off, options it has no state for) stay. New groups are
 * added to their side's first country, groups taken off the board are taken
 * out. Nothing is executed: the file is read as data (`lua.ts`) and edited
 * as text.
 *
 * **New.** A minimal mission for the theatre: CJTF Blue and CJTF Red, the
 * plan's groups, the mission's start time, date and weather when the plan
 * has them, the default ones otherwise.
 *
 * Board tasks become DCS tasks: an orbit or an aircraft's patrol an Orbit
 * (a racetrack between its two points, else a circle) with an engagement of
 * air targets; an attack on a group AttackGroup (an aircraft) or EngageGroup
 * (an interception), on a point a zone of ground targets (aircraft) or
 * FireAtPoint (ground); close air support, SEAD and a sweep an engagement of
 * the targets they are for in their area; a strike Bombing; escort and
 * follow Escort and Follow; defend, hold, guard and block Hold (ground) or a
 * circling orbit (aircraft); suppression FireAtPoint; ROE and alarm state
 * the options; a time limit a stop condition. What a mission cannot hold is
 * said in the summary's warnings, never dropped silently.
 */

import { zipEntries } from '../../data/zip';
import { makeZip, rewriteZip } from '../../data/zipWrite';
import { luaNum, luaSpans, luaStr, luaTable, parseLuaAssignments, type LuaSpans, type LuaTable, type LuaValue } from './lua';
import { applyEdits, depthAt, indentUnit, luaFile, luaKey, luaNumber, luaString, luaValue, takeSpan, type TextEdit } from './luaWrite';
import { dcsTask } from './dcs';
import { headingOfYaw } from './fromPlan';
import { areaOf, taskDef } from '../tasks';
import type { MissionGroup, MissionState, MissionTask, MissionUnit, MissionWaypoint, UnitCategory } from './index';

/** Something the mission could not hold as the board has it: a code (`tactics.dcs.warn.<code>`), the group, a count. */
export interface ExportWarning {
  code: string;
  group?: string;
  n?: number;
  what?: string;
}

export interface MissionExportSummary {
  mode: 'patch' | 'new';
  map: string;
  /** What the written mission holds of the plan. */
  groups: number;
  units: number;
  waypoints: number;
  /** Groups changed, added and taken out, by name; how many were left as they were. */
  changed: string[];
  added: string[];
  removed: string[];
  untouched: number;
  warnings: ExportWarning[];
}

// ---------------------------------------------------------------------------
// Types, countries, defaults

/** The DCS type of the figures the board's palettes place, where the catalogue's name is not DCS's. */
const DCS_TYPES: Record<string, string> = {
  'f-16c': 'F-16C_50',
  'f-15c': 'F-15C',
  'f-a-18c': 'FA-18C_hornet',
  'su-27': 'Su-27',
  'mig-29a': 'MiG-29A',
  'mig-21bis': 'MiG-21Bis',
  'mirage-2000c': 'M-2000C',
  'a-10c': 'A-10C_2',
  'su-25t': 'Su-25T',
  'c-130h-hercules': 'C-130',
  'bf-109-g6': 'Bf-109K-4',
  'spitfire-mk-ix': 'SpitfireLFMkIX',
  'p-51d-mustang': 'P-51D',
  'fw-190-a8': 'FW-190A8',
  'ju-87-stuka': 'Ju-88A4',
  'b-17g': 'B-17G',
  'ah-64d-apache': 'AH-64D_BLK_II',
  'mi-24p-hind': 'Mi-24P',
  'ka-50': 'Ka-50',
  'uh-1h-huey': 'UH-1H',
  'uh-60a-black-hawk': 'UH-60A',
  'ch-47-chinook': 'CH-47D',
  'mi-8mtv2': 'Mi-8MT',
  'sa-342-gazelle': 'SA342M',
  'zsu-23-4-shilka': 'ZSU-23-4 Shilka',
  '2k22-tunguska': '2S6 Tunguska',
  'flakpanzer-gepard': 'Gepard',
  'roland-marder': 'Roland ADS',
  '9k330-tor': 'Tor 9A331',
  'zu-23-2': 'ZU-23 Emplacement',
  'mim-104-patriot-launcher': 'Patriot ln',
  mbt: 'T-72B',
  'light-tank': 'M-113',
  ifv: 'BMP-2',
  'apc-tracked': 'M-113',
  'apc-wheeled': 'BTR-80',
  mrap: 'MaxxPro_MRAP',
  jeep: 'Hummer',
  truck: 'Ural-375',
  spaa: 'ZSU-23-4 Shilka',
  'sp-artillery': 'M-109',
  mlrs: 'Grad-URAL',
  'towed-gun': 'L118_Unit',
  'm1a2-abrams': 'M-1 Abrams',
  't-90a': 'T-90',
  'leopard-2a6': 'Leopard-2',
  'leopard-1a5': 'Leopard1A3',
  't-55a': 'T-55',
  'bmp-2': 'BMP-2',
  'm2a2-bradley': 'M-2 Bradley',
  'bm-21-grad': 'Grad-URAL',
  'm109-paladin': 'M-109',
  'arleigh-burke': 'USS_Arleigh_Burke_IIa',
  'nimitz-carrier': 'CVN_71',
  'kilo-submarine': 'KILO',
  'patrol-boat': 'speedboat',
  soldier: 'Soldier M4',
};

/** A type for each kind of unit when the figure has none of its own. */
const FALLBACK_TYPE: Record<UnitCategory, string> = { air: 'F-16C_50', heli: 'UH-1H', ground: 'Ural-375', infantry: 'Soldier M4', sea: 'speedboat', static: '' };

/** Internal fuel, kilograms, of the aircraft a new flight is most often made of; others get the default and a warning. */
const FUEL: Record<string, number> = {
  'F-16C_50': 3249,
  'FA-18C_hornet': 4900,
  'F-15C': 6103,
  'Su-27': 5590,
  'MiG-29A': 3376,
  'A-10C_2': 5029,
  'Su-25T': 3790,
  'M-2000C': 3165,
  'AH-64D_BLK_II': 1438,
  'Ka-50': 1450,
  'Mi-24P': 1704,
  'UH-1H': 631,
  SA342M: 416,
};

/** The countries whose aircraft take a number for a callsign rather than a name. */
const NUMBER_CALLSIGNS = /^(Russia|Ukraine|Belarus|Abkhazia|South Ossetia|Kazakhstan)$/;

/** The DCS type of a figure: its own when the board knows it, else a stand-in for its kind of unit. */
export function dcsTypeFor(kind: string, category: UnitCategory): { type: string; guessed: boolean } {
  const own = DCS_TYPES[kind];
  if (own) return { type: own, guessed: false };
  return { type: FALLBACK_TYPE[category], guessed: true };
}

const SIDE_KEY: Record<string, string> = { blue: 'blue', red: 'red', neutral: 'neutrals', neutrals: 'neutrals' };

/** The coalition a plan's team is: blue, red or neutral by its id, else by its place (first blue, second red). */
function coalitionOf(side: string, sides: string[]): string {
  return SIDE_KEY[side] ?? (sides.indexOf(side) === 0 ? 'blue' : sides.indexOf(side) === 1 ? 'red' : 'neutrals');
}

const CATEGORY_KEY: Record<UnitCategory, string> = { air: 'plane', heli: 'helicopter', ground: 'vehicle', infantry: 'vehicle', sea: 'ship', static: 'static' };

const isAir = (c: UnitCategory) => c === 'air' || c === 'heli';
const flat = (a: { x: number; z: number }, b: { x: number; z: number }) => Math.hypot(a.x - b.x, a.z - b.z);
const angle = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
const r1 = (v: number | undefined) => (v === undefined ? '' : String(Math.round(v)));
/** A Lua list (keys 1..n) of an array. */
const list1 = <T extends LuaValue>(a: T[]): LuaTable => Object.fromEntries(a.map((v, i) => [String(i + 1), v]));

// ---------------------------------------------------------------------------
// Tasks

/** Weapon type DCS takes for "whatever fits". */
const AUTO_WEAPON = 1073741822;
const GROUND_TARGETS = ['Helicopters', 'Ground Units', 'Light armed ships'];

interface TaskContext {
  category: UnitCategory;
  at: { x: number; y: number; z: number };
  speed: number;
  /** A group's DCS id by its key (`MissionTask.target`), or undefined when the mission has no such group. */
  groupId: (key: string) => number | undefined;
}

const vec2 = (p: { x: number; z: number }): LuaTable => ({ x: p.x, y: p.z });

function wrapOption(name: number, value: number): LuaTable {
  return { id: 'WrappedAction', params: { action: { id: 'Option', params: { value, name } } } };
}

/**
 * A board task as DCS task entries (an orbit brings the engagement of air
 * targets with it); null with a warning code for one DCS has no task for.
 */
export function dcsTaskEntries(t: MissionTask, c: TaskContext): { entries: LuaTable[] } | { warn: string } {
  const air = isAir(c.category);
  const pts = t.points ?? [];
  const p0 = pts[0] ?? c.at;
  const kind = t.kind;
  const target = t.target ? c.groupId(t.target) : undefined;
  const engage = (types: string[], area: { x: number; z: number }, r: number): LuaTable => ({ id: 'EngageTargetsInZone', params: { targetTypes: list1(types), x: area.x, y: area.z, zoneRadius: Math.max(100, Math.round(r)), priority: 0 } });
  const zone = () => {
    const a = areaOf(pts.length ? pts : [c.at]);
    return { c: a.c, r: a.r > 0 ? a.r : t.range ?? 5000 };
  };
  let out: LuaTable[] | null = null;
  switch (kind) {
    case 'orbit':
    case 'patrol':
    case 'screen':
      if (!air) return { warn: 'patrol-ground' };
      out = [
        {
          id: 'Orbit',
          params: {
            pattern: pts.length >= 2 ? 'Race-Track' : 'Circle',
            speed: t.speed ?? c.speed,
            altitude: t.altitude ?? c.at.y,
            speedEdited: true,
            ...(pts.length >= 2 ? { point: vec2(pts[0]), point2: vec2(pts[1]) } : pts.length === 1 ? { point: vec2(pts[0]) } : {}),
          },
        },
        { id: 'EngageTargets', params: { targetTypes: { 1: 'Air' }, priority: 0, maxDistEnabled: true, maxDist: 60000 } },
      ];
      break;
    case 'attack':
    case 'intercept':
      if (target !== undefined) out = [{ id: kind === 'intercept' ? 'EngageGroup' : air ? 'AttackGroup' : 'AttackGroup', params: { groupId: target, weaponType: AUTO_WEAPON, ...(kind === 'intercept' ? { priority: 0, visible: false } : { expend: 'Auto', attackQtyLimit: false, attackQty: 1, directionEnabled: false, direction: 0, altitudeEnabled: false, altitude: 2000, groupAttack: false }) } }];
      else if (kind === 'intercept') out = [{ id: 'EngageTargets', params: { targetTypes: { 1: 'Air' }, priority: 0, maxDistEnabled: true, maxDist: 60000 } }];
      else if (air) out = [engage(GROUND_TARGETS, p0, t.range ?? 2000)];
      else out = [{ id: 'FireAtPoint', params: { x: p0.x, y: p0.z, zoneRadius: Math.round(t.range ?? 100), expendQty: 1, expendQtyEnabled: false, templateId: '' } }];
      break;
    case 'cas':
      if (!air) return { warn: 'air-only' };
      out = [engage(GROUND_TARGETS, zone().c, zone().r)];
      break;
    case 'sead':
      if (!air) return { warn: 'air-only' };
      out = [engage(['Air Defence'], zone().c, zone().r)];
      break;
    case 'sweep':
      if (!air) return { warn: 'sweep-ground' };
      out = [engage(['Air'], zone().c, zone().r)];
      break;
    case 'strike':
      if (!air) return { warn: 'air-only' };
      out = [{ id: 'Bombing', params: { x: p0.x, y: p0.z, weaponType: AUTO_WEAPON, expend: 'Auto', attackQtyLimit: false, attackQty: 1, directionEnabled: false, direction: 0, altitudeEnabled: false, altitude: 2000, groupAttack: false } }];
      break;
    case 'escort':
    case 'follow':
      if (target === undefined) return { warn: 'no-target' };
      out = [
        kind === 'escort' && air
          ? { id: 'Escort', params: { groupId: target, pos: { x: -500, y: 0, z: 200 }, lastWptIndexFlag: false, lastWptIndexFlagChangedManually: false, engagementDistMax: 60000, targetTypes: { 1: 'Planes' } } }
          : { id: 'Follow', params: { groupId: target, pos: { x: -200, y: 0, z: 200 }, lastWptIndexFlag: false, lastWptIndexFlagChangedManually: false } },
      ];
      break;
    case 'defend':
    case 'hold':
    case 'guard':
    case 'block':
    case 'overwatch':
      out = air ? [{ id: 'Orbit', params: { pattern: 'Circle', speed: c.speed, altitude: c.at.y, speedEdited: true } }] : [{ id: 'Hold', params: {} }];
      break;
    case 'suppress':
      out = [{ id: 'FireAtPoint', params: { x: p0.x, y: p0.z, zoneRadius: Math.round(t.range ?? 100), expendQty: 1, expendQtyEnabled: false, templateId: '' } }];
      break;
    case 'roe': {
      const v = { free: air ? 0 : 2, tight: 2, return: 3, hold: 4 }[t.state ?? ''];
      if (v === undefined) return { warn: 'state' };
      out = [wrapOption(0, v)];
      break;
    }
    case 'alarm': {
      const v = { auto: 0, green: 1, safe: 1, stealth: 1, aware: 0, red: 2, combat: 2 }[t.state ?? ''];
      if (v === undefined || air) return { warn: 'state' };
      out = [wrapOption(9, v)];
      break;
    }
    default:
      return { warn: kind ? 'no-task' : 'game-task' };
  }
  if (t.duration && t.duration > 0 && out.length && out[0].id !== 'WrappedAction') {
    const [first, ...rest] = out;
    out = [{ id: 'ControlledTask', params: { task: first, stopCondition: { duration: Math.round(t.duration) } } }, ...rest];
  }
  return { entries: out };
}

/** What a task is, for telling one the board left as it was from one it changed: its kind (or name), state, points and numbers, rounded to metres. */
function taskSig(t: MissionTask): string {
  return [t.kind ?? '', t.kind ? '' : t.name, t.state ?? '', (t.points ?? []).map((p) => `${Math.round(p.x)},${Math.round(p.z)}`).join(';'), r1(t.altitude), r1(t.speed), r1(t.range), r1(t.duration), t.target ?? ''].join('|');
}

/** A task read from the file as the board gets it in `missionToPlan`: an orbit's racetrack to the next waypoint, a task needing a point at its waypoint. */
function asBoardHasIt(t: MissionTask, at: { x: number; y: number; z: number }, next: { x: number; y: number; z: number } | null): MissionTask {
  const out = { ...t };
  if (out.kind === 'orbit' && out.points?.length === 1 && next) out.points = [at, next];
  if (!out.points && out.kind && (taskDef(out.kind).min > 0 || out.kind === 'orbit')) out.points = [at];
  return out;
}

// ---------------------------------------------------------------------------
// The patch

interface OrigGroup {
  g: LuaTable;
  coalition: string;
  country: LuaTable;
  catKey: string;
  /** The `group` list it is in, and its key there. */
  list: LuaTable;
  key: string;
}

interface ListChange {
  list: LuaTable;
  remove: Set<string>;
  add: LuaTable[];
}

class MissionPatch {
  readonly edits: TextEdit[] = [];
  readonly unit: string;
  readonly warnings: ExportWarning[] = [];
  private readonly lists = new Map<LuaTable, ListChange>();
  private readonly fieldAdds = new Map<LuaTable, { key: string; value: LuaValue }[]>();
  /** Group ids by group key: the file's for groups it has, new ones for those the plan adds. */
  readonly groupIds = new Map<string, number>();
  readonly names = new Set<string>();
  maxGroupId = 0;
  maxUnitId = 0;
  /** Changes asked for so far: a group changed when this grew while it was patched. */
  ops = 0;

  constructor(
    readonly text: string,
    readonly spans: LuaSpans,
    readonly dict: (s: string) => string,
  ) {
    this.unit = indentUnit(text);
  }

  span(t: LuaTable) {
    const s = this.spans.tables.get(t);
    if (!s) throw new Error('mission table without a span');
    return s;
  }

  /** The line indentation (in units) of a table's opening brace. */
  depth(t: LuaTable): number {
    return depthAt(this.text, this.span(t).start, this.unit);
  }

  /** Sets a field of a table: its value replaced where it has one, else added at the table's end. */
  set(t: LuaTable, key: string, value: LuaValue): void {
    const e = this.span(t).entries.get(key);
    if (e) {
      const depth = depthAt(this.text, e.start, this.unit);
      this.ops++;
      // A table's text begins on a line of its own; the file already has the break before the old brace.
      this.edits.push({ start: e.valueStart, end: e.valueEnd, text: luaValue(value, depth, this.unit).replace(/^\n[ \t]*/, '') });
      return;
    }
    this.ops++;
    let adds = this.fieldAdds.get(t);
    if (!adds) this.fieldAdds.set(t, (adds = []));
    adds.push({ key, value });
  }

  setNum(t: LuaTable, key: string, v: number): void {
    this.set(t, key, Number(luaNumber(v)));
  }

  /** Text that adds entries at a table's end: on lines of their own before its closing brace, or inline for a table on one line. */
  private insertion(t: LuaTable, items: { key: string; value: LuaValue }[]): TextEdit {
    const sp = this.span(t);
    const close = sp.end - 1;
    const lineStart = this.text.lastIndexOf('\n', close - 1) + 1;
    const ownLine = this.text.slice(lineStart, close).trim() === '' && lineStart > sp.start;
    const d = this.depth(t) + 1;
    const pad = this.unit.repeat(d);
    if (ownLine) {
      const body = items
        .map(({ key, value }) => {
          const k = luaKey(key);
          const v = luaValue(value, d, this.unit);
          return `${pad}${k} = ${v},${v.includes('\n') ? ` -- end of ${k}` : ''}\n`;
        })
        .join('');
      return { start: lineStart, end: lineStart, text: body };
    }
    // One line, or the brace after the last entry: a separator when the last entry has none.
    let i = close - 1;
    while (i > sp.start && /\s/.test(this.text[i])) i--;
    const sep = /[{,;]/.test(this.text[i]) ? ' ' : ', ';
    const body = items.map(({ key, value }) => `${luaKey(key)} = ${luaValue(value, d, this.unit)}, `).join('');
    return { start: close, end: close, text: `${sep}${body}` };
  }

  /** A list's entries in key order. */
  entries(t: LuaTable | null): { key: string; v: LuaTable }[] {
    if (!t) return [];
    return Object.keys(t)
      .filter((k) => /^\d+$/.test(k))
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => ({ key: k, v: luaTable(t[k]) }))
      .filter((e): e is { key: string; v: LuaTable } => !!e.v);
  }

  /**
   * A list written again from its pieces, numbered 1..n: each kept entry's
   * text (with the changes made inside it) and each new one written out.
   * `renumber` changes a field that repeats the entry's number (a task's
   * `number`).
   */
  rebuildList(t: LuaTable, items: ({ keep: LuaTable } | { add: LuaValue })[], renumber?: string): void {
    this.ops++;
    const sp = this.span(t);
    const d = this.depth(t);
    const pad = this.unit.repeat(d);
    const inner = this.unit.repeat(d + 1);
    const parts: string[] = [];
    items.forEach((it, i) => {
      const k = luaKey(String(i + 1));
      if ('keep' in it) {
        const es = this.spans.tables.get(it.keep);
        if (!es) return;
        if (renumber) {
          const n = es.entries.get(renumber);
          if (n) this.edits.push({ start: n.valueStart, end: n.valueEnd, text: String(i + 1) });
        }
        // Edits inside the entry's table (a field added) come in with it.
        this.flushFields(it.keep);
        const body = takeSpan(this.text, es.start, es.end, this.edits);
        parts.push(`${inner}${k} = ${body.includes('\n') ? `\n${inner}` : ''}${body},${body.includes('\n') ? ` -- end of ${k}` : ''}\n`);
      } else {
        const v = it.add && typeof it.add === 'object' && renumber ? { ...it.add, [renumber]: i + 1 } : it.add;
        const text = luaValue(v, d + 1, this.unit);
        parts.push(`${inner}${k} = ${text},${text.includes('\n') ? ` -- end of ${k}` : ''}\n`);
      }
    });
    // Anything left inside the old list's span is gone with it.
    takeSpan(this.text, sp.start, sp.end, this.edits);
    this.fieldAdds.delete(t);
    this.edits.push({ start: sp.start, end: sp.end, text: parts.length ? `{\n${parts.join('')}${pad}}` : '{}' });
  }

  private flushFields(t: LuaTable): void {
    const adds = this.fieldAdds.get(t);
    if (!adds?.length) return;
    this.fieldAdds.delete(t);
    this.edits.push(this.insertion(t, adds));
  }

  listChange(list: LuaTable): ListChange {
    let c = this.lists.get(list);
    if (!c) this.lists.set(list, (c = { list, remove: new Set(), add: [] }));
    return c;
  }

  /** The edits, with the lists' and fields' changes made: the file's text. */
  finish(): string {
    // Fields first: a list written again below takes them in with its entries.
    for (const t of [...this.fieldAdds.keys()]) this.flushFields(t);
    for (const c of this.lists.values()) {
      const kept = this.entries(c.list).filter((e) => !c.remove.has(e.key));
      if (c.remove.size) this.rebuildList(c.list, [...kept.map((e) => ({ keep: e.v })), ...c.add.map((a) => ({ add: a }))]);
      else if (c.add.length) {
        const n = this.entries(c.list).reduce((m, e) => Math.max(m, Number(e.key)), 0);
        this.edits.push(this.insertion(c.list, c.add.map((a, i) => ({ key: String(n + i + 1), value: a }))));
      }
    }
    for (const t of [...this.fieldAdds.keys()]) this.flushFields(t);
    return applyEdits(this.text, this.edits);
  }

  uniqueName(base: string): string {
    let n = base || 'Group';
    for (let i = 2; this.names.has(n); i++) n = `${base} #${i}`;
    this.names.add(n);
    return n;
  }
}

/** Every group of the mission, by its id; and the ids and names in use. */
function indexGroups(p: MissionPatch, mission: LuaTable): Map<string, OrigGroup> {
  const out = new Map<string, OrigGroup>();
  const coalitions = luaTable(mission.coalition);
  for (const side of ['blue', 'red', 'neutrals']) {
    const c = luaTable(coalitions?.[side]);
    for (const ce of p.entries(luaTable(c?.country))) {
      for (const catKey of ['plane', 'helicopter', 'vehicle', 'ship', 'static']) {
        const list = luaTable(luaTable(ce.v[catKey])?.group);
        for (const ge of p.entries(list)) {
          const g = ge.v;
          const id = luaNum(g.groupId, -1);
          p.maxGroupId = Math.max(p.maxGroupId, id);
          p.names.add(p.dict(luaStr(g.name)));
          for (const ue of p.entries(luaTable(g.units))) {
            p.maxUnitId = Math.max(p.maxUnitId, luaNum(ue.v.unitId, 0));
            p.names.add(p.dict(luaStr(ue.v.name)));
          }
          if (id >= 0) {
            out.set(String(id), { g, coalition: side, country: ce.v, catKey, list: list!, key: ge.key });
            p.groupIds.set(String(id), id);
          }
        }
      }
    }
  }
  return out;
}

/** A new waypoint as DCS writes one for a kind of unit. */
function newPoint(w: MissionWaypoint, c: UnitCategory, speed: number, first: boolean, tasks: LuaTable[]): LuaTable {
  const air = isAir(c);
  return {
    alt: air ? w.at.y : 0,
    action: air ? 'Turning Point' : c === 'sea' ? 'Turning Point' : 'Off Road',
    alt_type: 'BARO',
    speed: w.speed ?? speed,
    task: { id: 'ComboTask', params: { tasks: list1(tasks) } },
    type: 'Turning Point',
    ETA: first ? 0 : (w.eta ?? 0),
    ETA_locked: first || w.eta !== undefined,
    y: w.at.z,
    x: w.at.x,
    name: w.name ?? '',
    formation_template: '',
    speed_locked: true,
  };
}

const DEFAULT_SPEED: Record<UnitCategory, number> = { air: 180, heli: 50, ground: 10, infantry: 1.5, sea: 10, static: 0 };

/** The task entries of a list numbered as DCS numbers them, each switched on. */
function numbered(entries: LuaTable[], from = 1): LuaTable[] {
  return entries.map((e, i) => ({ enabled: true, auto: false, id: e.id, number: from + i, params: e.params ?? {} }));
}

/** The board's tasks at a waypoint as DCS entries; the warnings for those it cannot hold. */
function generateTasks(tasks: MissionTask[], ctx: TaskContext, group: string, warn: (w: ExportWarning) => void): LuaTable[] {
  const out: LuaTable[] = [];
  for (const t of tasks) {
    const r = dcsTaskEntries(t, ctx);
    if ('warn' in r) warn({ code: r.warn, group, what: t.name });
    else out.push(...r.entries);
  }
  return out;
}

/** Changes a waypoint's tasks where the board's differ from the file's: the entries it left keep their text, the board's new ones are written. */
function patchTasks(p: MissionPatch, pt: LuaTable, w: MissionWaypoint, next: LuaTable | null, ctx: TaskContext, group: string): boolean {
  const at = { x: luaNum(pt.x), y: luaNum(pt.alt), z: luaNum(pt.y) };
  const nextAt = next ? { x: luaNum(next.x), y: luaNum(next.alt), z: luaNum(next.y) } : null;
  const combo = luaTable(pt.task);
  const list = combo && luaStr(combo.id) === 'ComboTask' ? luaTable(luaTable(combo.params)?.tasks) : null;
  const orig = p.entries(list).map((e) => {
    const t = dcsTask(e.v, at);
    return { e, sig: t ? taskSig(asBoardHasIt(t, at, nextAt)) : null };
  });
  const wanted = w.tasks ?? [];
  const used = new Set<number>();
  const fresh: MissionTask[] = [];
  for (const t of wanted) {
    const s = taskSig(t);
    const i = orig.findIndex((o, k) => !used.has(k) && o.sig === s);
    if (i >= 0) used.add(i);
    else fresh.push(t);
  }
  const dropped = orig.some((o, k) => o.sig !== null && !used.has(k));
  if (!fresh.length && !dropped) return false;
  const made = generateTasks(fresh, ctx, group, (x) => p.warnings.push(x));
  const keep = orig.filter((o, k) => o.sig === null || used.has(k)).map((o) => o.e.v);
  if (list) {
    p.rebuildList(list, [...keep.map((v) => ({ keep: v })), ...numbered(made, keep.length + 1).map((a) => ({ add: a as LuaValue }))], 'number');
  } else {
    p.set(pt, 'task', { id: 'ComboTask', params: { tasks: list1(numbered(made)) } });
  }
  return true;
}

/**
 * Which new waypoint is which old one: the first to the first, then each new
 * one to the next old one within 50 m, then those between two such pairs to
 * the old ones between them, in order. -1: a new waypoint.
 */
export function alignRoute(next: { x: number; z: number }[], old: { x: number; z: number }[]): number[] {
  const m = next.map(() => -1);
  if (!next.length || !old.length) return m;
  m[0] = 0;
  let j0 = 1;
  for (let i = 1; i < next.length; i++) {
    for (let j = j0; j < old.length; j++) {
      if (flat(next[i], old[j]) < 50) {
        m[i] = j;
        j0 = j + 1;
        break;
      }
    }
  }
  // Between two anchors (or after the last), the moved ones pair up in order.
  let i = 0;
  while (i < next.length) {
    if (m[i] >= 0) {
      i++;
      continue;
    }
    const a = i;
    while (i < next.length && m[i] < 0) i++;
    const lo = (a > 0 ? m[a - 1] : -1) + 1;
    const hi = i < next.length ? m[i] : old.length;
    for (let k = 0; k < i - a && lo + k < hi; k++) m[a + k] = lo + k;
  }
  return m;
}

/** Heights an aircraft's new waypoint drawn on the ground is flown at when none before it is in the air, metres. */
const CRUISE_ALT: Partial<Record<UnitCategory, number>> = { air: 2000, heli: 150 };

/**
 * Each waypoint's height as written: the board's, but an aircraft's new
 * waypoint that lies on the ground (`onGround`) at the height of the one
 * before it in the air. `m`: which waypoints the file has (-1 new).
 */
function liftedAlts(route: MissionWaypoint[], m: number[], c: UnitCategory, p: MissionPatch, group: string): number[] {
  const out: number[] = [];
  let last = CRUISE_ALT[c] ?? 0;
  let lifted = 0;
  route.forEach((w, i) => {
    if (isAir(c) && m[i] < 0 && w.onGround) {
      out.push(last);
      lifted++;
      return;
    }
    out.push(w.at.y);
    if (!w.onGround && w.at.y > 30) last = w.at.y;
  });
  if (lifted) p.warnings.push({ code: 'ground', group, n: lifted });
  return out;
}

function patchGroup(p: MissionPatch, o: OrigGroup, ng: MissionGroup, theatreGroups: Map<string, OrigGroup>): boolean {
  const before = p.ops;
  let changed = false;
  const g = o.g;
  const category = ng.category;
  // Units: moved, turned, retyped, renamed; taken away; added.
  const units = p.entries(luaTable(g.units));
  const byRef = new Map(ng.units.filter((u) => u.ref).map((u) => [u.ref!, u]));
  const kept: LuaTable[] = [];
  for (const ue of units) {
    const u = ue.v;
    const nu = byRef.get(String(luaNum(u.unitId, -1)));
    if (!nu) {
      changed = true;
      continue;
    }
    kept.push(u);
    if (flat({ x: luaNum(u.x), z: luaNum(u.y) }, nu.at) > 0.5) {
      p.setNum(u, 'x', nu.at.x);
      p.setNum(u, 'y', nu.at.z);
    }
    if (isAir(category) && typeof u.alt === 'number' && Math.abs(u.alt - nu.at.y) > 0.5) p.setNum(u, 'alt', nu.at.y);
    const h = headingOfYaw(nu.yaw);
    if (angle(luaNum(u.heading), h) > 0.003) {
      p.setNum(u, 'heading', h);
      if (typeof u.psi === 'number') p.setNum(u, 'psi', -h);
    }
    if (!nu.type) {
      const t = dcsTypeFor(nu.figure ?? '', category);
      if (t.type && t.type !== luaStr(u.type)) {
        p.set(u, 'type', t.type);
        p.warnings.push({ code: 'retyped', group: ng.name, what: t.type });
      }
    }
    // A unit the file leaves unnamed keeps no name: the board's label is only what it shows.
    const was = p.dict(luaStr(u.name));
    if (was && nu.name && nu.name !== was) p.set(u, 'name', p.uniqueName(nu.name));
  }
  const added = ng.units.filter((u) => !u.ref || !units.some((e) => String(luaNum(e.v.unitId, -1)) === u.ref));
  if (added.length || kept.length < units.length) {
    const tmpl = kept[0] ?? units[0]?.v;
    p.rebuildList(luaTable(g.units)!, [...kept.map((v) => ({ keep: v })), ...added.map((u) => ({ add: newUnit(p, u, category, luaStr(o.country.name), luaStr(tmpl?.skill) || undefined) as LuaValue }))]);
    changed = true;
  }
  // How far the lead moved: the group's own place and its first waypoint (which need not be where the lead stands: a parking spot) move by as much.
  const lead = ng.units[0];
  const was = lead?.ref ? units.find((e) => String(luaNum(e.v.unitId, -1)) === lead.ref)?.v : undefined;
  const delta = lead && was ? { x: lead.at.x - luaNum(was.x), y: lead.at.y - luaNum(was.alt, lead.at.y), z: lead.at.z - luaNum(was.y) } : { x: 0, y: 0, z: 0 };
  const leadMoved = Math.hypot(delta.x, delta.z) > 0.5;
  if (leadMoved && typeof g.x === 'number') {
    p.setNum(g, 'x', luaNum(g.x) + delta.x);
    p.setNum(g, 'y', luaNum(g.y) + delta.z);
  }
  // The route.
  const pointsTable = luaTable(luaTable(g.route)?.points);
  if (category !== 'static' && pointsTable) {
    const old = p.entries(pointsTable);
    const oldAt = old.map((e) => ({ x: luaNum(e.v.x), y: luaNum(e.v.alt), z: luaNum(e.v.y) }));
    const route = ng.route;
    const m = alignRoute(route.map((w) => w.at), oldAt);
    const speeds = old.slice(1).map((e) => luaNum(e.v.speed));
    const uniform = speeds.every((s) => Math.abs(s - (speeds[0] ?? 0)) < 0.5);
    // The first waypoint is where the lead starts on the board; in the file it moves with the lead.
    const target = route.map((w, i) => (i === 0 && m[0] === 0 ? { x: oldAt[0].x + delta.x, y: oldAt[0].y + (isAir(category) ? delta.y : 0), z: oldAt[0].z + delta.z } : w.at));
    const moved = route.map((_, i) => m[i] < 0 || flat(target[i], oldAt[m[i]]) > 0.5);
    const alts = liftedAlts(route, m, category, p, ng.name);
    const groupId = (key: string) => p.groupIds.get(key) ?? (theatreGroups.has(key) ? Number(key) : undefined);
    route.forEach((w, i) => {
      const j = m[i];
      if (j < 0) return;
      const pt = old[j].v;
      if (moved[i]) {
        p.setNum(pt, 'x', target[i].x);
        p.setNum(pt, 'y', target[i].z);
      }
      if (isAir(category) && Math.abs(luaNum(pt.alt) - target[i].y) > 0.5) p.setNum(pt, 'alt', target[i].y);
      const legChanged = i > 0 && (moved[i] || moved[i - 1]);
      if (w.speed !== undefined && Math.abs(luaNum(pt.speed) - w.speed) > 0.5 && (legChanged || (uniform && i > 0 && w.eta === undefined && luaNum(pt.speed) > 0))) p.setNum(pt, 'speed', w.speed);
      if (i > 0) {
        if (w.eta !== undefined) {
          if (pt.ETA_locked !== true || Math.abs(luaNum(pt.ETA) - w.eta) > 0.5) {
            p.setNum(pt, 'ETA', w.eta);
            p.set(pt, 'ETA_locked', true);
          }
        } else if (pt.ETA_locked === true && luaNum(pt.ETA) > 0) p.set(pt, 'ETA_locked', false);
      }
      const nextJ = j + 1 < old.length ? old[j + 1].v : null;
      if (patchTasks(p, pt, w, nextJ, { category, at: w.at, speed: w.speed ?? luaNum(pt.speed, DEFAULT_SPEED[category]), groupId }, ng.name)) changed = true;
    });
    const identity = route.length === old.length && m.every((j, i) => j === i);
    if (!identity) {
      changed = true;
      const used = new Set(m.filter((j) => j >= 0));
      if (old.some((e, j) => !used.has(j) && /TakeOff|Land/i.test(luaStr(e.v.type)))) p.warnings.push({ code: 'airfield-dropped', group: ng.name });
      p.rebuildList(
        pointsTable,
        route.map((w, i) => {
          if (m[i] >= 0) return { keep: old[m[i]].v };
          const at = { ...w.at, y: alts[i] };
          const ctx = { category, at, speed: w.speed ?? DEFAULT_SPEED[category], groupId };
          return { add: newPoint({ ...w, at }, category, DEFAULT_SPEED[category], false, numbered(generateTasks(w.tasks ?? [], ctx, ng.name, (x) => p.warnings.push(x)))) as LuaValue };
        }),
      );
    }
  }
  return changed || p.ops !== before;
}

function newUnit(p: MissionPatch, u: MissionUnit, c: UnitCategory, country: string, skill?: string, index = 1, groupIndex = 1): LuaTable {
  const t = u.type ? { type: u.type, guessed: false } : dcsTypeFor(u.figure ?? '', c);
  if (t.guessed) p.warnings.push({ code: 'type-guess', what: `${u.name} → ${t.type}` });
  const h = headingOfYaw(u.yaw);
  const id = ++p.maxUnitId;
  const name = p.uniqueName(u.name || t.type);
  if (isAir(c)) {
    const fuel = FUEL[t.type];
    if (fuel === undefined) p.warnings.push({ code: 'fuel', what: t.type });
    return {
      alt: u.at.y,
      alt_type: 'BARO',
      livery_id: '',
      skill: skill && !/^(client|player)$/i.test(skill) ? skill : 'High',
      speed: DEFAULT_SPEED[c],
      type: t.type,
      unitId: id,
      psi: -h,
      x: u.at.x,
      y: u.at.z,
      name,
      payload: { pylons: {}, fuel: fuel ?? (c === 'heli' ? 600 : 3000), flare: 0, chaff: 0, gun: 100 },
      heading: h,
      callsign: NUMBER_CALLSIGNS.test(country) ? 100 + id : { 1: 1, 2: groupIndex, 3: index, name: `Enfield${groupIndex}${index}` },
      onboard_num: String(10 + (id % 90)).padStart(3, '0'),
    };
  }
  if (c === 'sea') return { type: t.type, unitId: id, skill: skill ?? 'Average', y: u.at.z, x: u.at.x, name, heading: h, modulation: 0, frequency: 127500000 };
  return { type: t.type, transportable: { randomTransportable: false }, unitId: id, skill: skill ?? 'Average', y: u.at.z, x: u.at.x, name, playerCanDrive: false, heading: h };
}

/** A group the plan adds, as DCS writes one of its kind. */
function newGroup(p: MissionPatch, ng: MissionGroup, country: string, groupIndex: number, groupIds: Map<string, number>, existing: Map<string, OrigGroup>): LuaTable {
  const c = ng.category;
  const id = groupIds.get(ng.name)!;
  const name = p.uniqueName(ng.name);
  const route: MissionWaypoint[] = ng.route.length ? ng.route : [{ at: ng.units[0].at }];
  const groupId = (key: string) => groupIds.get(key) ?? (existing.has(key) ? Number(key) : undefined);
  const alts = liftedAlts(route, route.map(() => -1), c, p, name);
  // A new flight placed on the ground starts in the air, at its first waypoint's height.
  const up = isAir(c) && route[0].onGround ? alts[0] - route[0].at.y : 0;
  const units = ng.units.map((u, i) => newUnit(p, up ? { ...u, at: { ...u.at, y: u.at.y + up } } : u, c, country, u.skill, i + 1, groupIndex));
  const points = route.map((w, i) => {
    const at = { ...w.at, y: alts[i] };
    const ctx = { category: c, at, speed: w.speed ?? DEFAULT_SPEED[c], groupId };
    return newPoint({ ...w, at }, c, DEFAULT_SPEED[c], i === 0, numbered(generateTasks(w.tasks ?? [], ctx, ng.name, (x) => p.warnings.push(x))));
  });
  const kinds = new Set(route.flatMap((w) => w.tasks ?? []).map((t) => t.kind));
  const main = !isAir(c)
    ? 'Ground Nothing'
    : kinds.has('sead')
      ? 'SEAD'
      : kinds.has('cas') || (kinds.has('attack') && c === 'air')
        ? 'CAS'
        : kinds.has('strike')
          ? 'Ground Attack'
          : kinds.has('sweep')
            ? 'Fighter Sweep'
            : kinds.has('intercept')
              ? 'Intercept'
              : kinds.has('escort')
                ? 'Escort'
                : kinds.has('orbit') || kinds.has('patrol')
                  ? 'CAP'
                  : 'Nothing';
  const lead = ng.units[0].at;
  if (isAir(c)) {
    return {
      modulation: 0,
      tasks: {},
      radioSet: false,
      task: main,
      uncontrolled: false,
      route: { points: list1(points) },
      groupId: id,
      hidden: false,
      units: list1(units),
      y: lead.z,
      x: lead.x,
      name,
      communication: true,
      start_time: 0,
      frequency: c === 'heli' ? 127.5 : 251,
    };
  }
  return {
    visible: false,
    tasks: {},
    uncontrollable: false,
    ...(c === 'sea' ? {} : { task: main, taskSelected: true }),
    route: { ...(c === 'sea' ? {} : { spans: {} }), points: list1(points) },
    groupId: id,
    hidden: false,
    units: list1(units),
    y: lead.z,
    x: lead.x,
    name,
    start_time: 0,
  };
}

const COUNTRY_DEFAULT: Record<string, { id: number; name: string }> = { blue: { id: 80, name: 'CJTF Blue' }, red: { id: 81, name: 'CJTF Red' } };
/** A side's second choice when the first is another side's already. */
const COUNTRY_SECOND: Record<string, { id: number; name: string }> = { blue: { id: 2, name: 'USA' }, red: { id: 0, name: 'Russia' } };

/**
 * A country for a side that has none in the file: CJTF Blue or Red (USA or
 * Russia when another side has that one), put on the side in the mission's
 * list of who is on which side too. Null for the neutral side.
 */
function newCountry(p: MissionPatch, mission: LuaTable, side: string): LuaTable | null {
  const coalitions = luaTable(mission.coalition);
  const used = new Set<number>();
  for (const s of ['blue', 'red', 'neutrals']) for (const e of p.entries(luaTable(luaTable(coalitions?.[s])?.country))) used.add(luaNum(e.v.id, -1));
  const pick = [COUNTRY_DEFAULT[side], COUNTRY_SECOND[side]].find((c) => c && !used.has(c.id));
  if (!pick) return null;
  // Who is on which side: the id taken off the others' lists and put on this side's.
  const lists = luaTable(mission.coalitions);
  if (lists) {
    for (const s of ['blue', 'red', 'neutrals']) {
      const l = luaTable(lists[s]);
      if (!l) continue;
      const ids = Object.keys(l)
        .filter((k) => /^\d+$/.test(k))
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => l[k])
        .filter((v): v is number => typeof v === 'number');
      if (s === side && !ids.includes(pick.id)) p.set(lists, s, list1([...ids, pick.id]));
      else if (s !== side && ids.includes(pick.id)) p.set(lists, s, list1(ids.filter((v) => v !== pick.id)));
    }
  }
  return { id: pick.id, name: pick.name };
}

/**
 * The `mission` file's text with the plan's changes made (`MissionState` from
 * `planToMission`): its groups by `ref` changed in place, new ones added,
 * removed ones taken out. Pure: the text in, the text out, and what was done.
 */
export function patchDcsMissionText(text: string, m: MissionState, dictionary: LuaTable | null = null): { text: string; summary: MissionExportSummary } {
  const spans = luaSpans();
  const top = parseLuaAssignments(text, spans);
  const mission = luaTable(top.mission);
  if (!mission) throw new Error('not a DCS mission: no mission table');
  const dict = (s: string) => (s.startsWith('DictKey_') && dictionary && typeof dictionary[s] === 'string' ? (dictionary[s] as string) : s);
  const p = new MissionPatch(text, spans, dict);
  const orig = indexGroups(p, mission);
  const summary: MissionExportSummary = { mode: 'patch', map: luaStr(mission.theatre), groups: 0, units: 0, waypoints: 0, changed: [], added: [], removed: [], untouched: 0, warnings: p.warnings };
  const sides = m.sides.map((s) => s.id);
  // Ids for the new groups first: tasks may name them.
  const fresh = m.groups.filter((g) => !g.ref || !orig.has(g.ref));
  for (const g of fresh) p.groupIds.set(g.name, ++p.maxGroupId);
  for (const g of m.groups) {
    summary.groups++;
    summary.units += g.units.length;
    summary.waypoints += g.route.length;
    const o = g.ref ? orig.get(g.ref) : undefined;
    if (!o) continue;
    if (patchGroup(p, o, g, orig)) summary.changed.push(g.name);
  }
  for (const ref of m.removed ?? []) {
    const o = orig.get(ref);
    if (!o) continue;
    p.listChange(o.list).remove.add(o.key);
    summary.removed.push(p.dict(luaStr(o.g.name)));
  }
  if (summary.removed.length) p.warnings.push({ code: 'removed', n: summary.removed.length });
  summary.untouched = orig.size - summary.changed.length - summary.removed.length;
  const coalitions = luaTable(mission.coalition);
  // New groups for a country without that kind of unit yet, or a kind without a group list: written as one table each.
  const pending = new Map<LuaTable, Map<string, LuaTable[]>>();
  const later = (t: LuaTable, key: string, g: LuaTable) => {
    let m = pending.get(t);
    if (!m) pending.set(t, (m = new Map()));
    m.set(key, [...(m.get(key) ?? []), g]);
  };
  let groupIndex = 1;
  // Countries the patch gives a side that had none, and their groups: written as one table each.
  const made = new Map<string, LuaTable>();
  for (const g of fresh) {
    if (g.category === 'static') {
      p.warnings.push({ code: 'static', group: g.name });
      continue;
    }
    const side = coalitionOf(g.side, sides);
    const c = luaTable(coalitions?.[side]);
    const countries = p.entries(luaTable(c?.country));
    let country: LuaTable | null = countries.find((e) => luaStr(e.v.name) === g.country)?.v ?? countries[0]?.v ?? made.get(side) ?? null;
    if (!country && c) {
      country = newCountry(p, mission, side);
      if (country) made.set(side, country);
    }
    if (!country) {
      p.warnings.push({ code: 'no-country', group: g.name, what: side });
      continue;
    }
    const table = newGroup(p, g, luaStr(country.name), groupIndex++, p.groupIds, orig);
    const catKey = CATEGORY_KEY[g.category];
    if ([...made.values()].includes(country)) {
      const cat = (luaTable(country[catKey]) ?? (country[catKey] = { group: {} })) as LuaTable;
      const list = luaTable(cat.group)!;
      list[String(Object.keys(list).length + 1)] = table;
      summary.added.push(luaStr(table.name));
      if (isAir(g.category)) p.warnings.push({ code: 'new-air', group: luaStr(table.name) });
      continue;
    }
    const cat = luaTable(country[catKey]);
    const list = luaTable(cat?.group);
    if (list) p.listChange(list).add.push(table);
    else if (cat) later(cat, 'group', table);
    else later(country, catKey, table);
    summary.added.push(luaStr(table.name));
    if (isAir(g.category)) p.warnings.push({ code: 'new-air', group: luaStr(table.name) });
  }
  for (const [t, m] of pending) for (const [key, gs] of m) p.set(t, key, key === 'group' ? list1(gs) : { group: list1(gs) });
  for (const [side, country] of made) {
    const list = luaTable(luaTable(coalitions?.[side])?.country);
    if (list) p.listChange(list).add.push(country);
    else p.set(luaTable(coalitions?.[side])!, 'country', list1([country]));
  }
  return { text: p.finish(), summary };
}

// ---------------------------------------------------------------------------
// A new mission

function weatherTable(m: MissionState): LuaTable {
  const w = m.info?.weather ?? {};
  // DCS keeps where the wind blows to.
  const to = ((((w.windFrom ?? 0) + 180) % 360) + 360) % 360;
  return {
    atmosphere_type: 0,
    wind: { at8000: { speed: 0, dir: 0 }, atGround: { speed: w.windSpeed ?? 0, dir: to }, at2000: { speed: 0, dir: 0 } },
    enable_fog: w.fog === true,
    groundTurbulence: 0,
    visibility: { distance: w.visibility ?? 80000 },
    season: { temperature: w.temperature ?? 20 },
    type_weather: 0,
    modifiedTime: false,
    cyclones: {},
    name: w.preset ?? 'Default',
    fog: { thickness: 0, visibility: 0 },
    dust_density: 0,
    qnh: w.qnh ?? 760,
    enable_dust: false,
    clouds: { density: w.cloudDensity ?? 0, thickness: 200, base: w.cloudBase ?? 300, iprecptns: 0 },
  };
}

const NO_RESULT = { conditions: {}, actions: {}, func: {} };
const ROLES = { blue: 0, red: 0, neutrals: 0 };

/** A minimal mission table for a theatre, without groups: what `newDcsMission` fills. */
export function emptyDcsMission(theatre: string, m: MissionState): LuaTable {
  const d = m.info?.date ?? { year: 2024, month: 6, day: 1 };
  const xs = m.groups.flatMap((g) => g.units.map((u) => u.at));
  const cx = xs.length ? xs.reduce((s, p) => s + p.x, 0) / xs.length : 0;
  const cz = xs.length ? xs.reduce((s, p) => s + p.z, 0) / xs.length : 0;
  const country = (side: 'blue' | 'red') => ({ 1: { id: COUNTRY_DEFAULT[side].id, name: COUNTRY_DEFAULT[side].name } });
  return {
    requiredModules: {},
    date: { Day: d.day, Year: d.year, Month: d.month },
    trig: { actions: {}, events: {}, custom: {}, func: {}, flag: {}, conditions: {}, customStartup: {}, funcStartup: {} },
    result: { offline: NO_RESULT, total: 0, blue: NO_RESULT, red: NO_RESULT },
    maxDictId: 0,
    groundControl: { isPilotControlVehicles: false, roles: { artillery_commander: ROLES, instructor: ROLES, observer: ROLES, forward_observer: ROLES } },
    goals: {},
    weather: weatherTable(m),
    theatre,
    triggers: { zones: {} },
    map: { centerY: cz, zoom: 1000000, centerX: cx },
    coalitions: { neutrals: {}, blue: { 1: COUNTRY_DEFAULT.blue.id }, red: { 1: COUNTRY_DEFAULT.red.id } },
    descriptionText: m.info?.description ?? '',
    pictureFileNameR: {},
    descriptionNeutralsTask: '',
    descriptionBlueTask: '',
    descriptionRedTask: '',
    pictureFileNameB: {},
    coalition: {
      neutrals: { bullseye: { x: 0, y: 0 }, nav_points: {}, name: 'neutrals', country: {} },
      blue: { bullseye: { x: cx, y: cz }, nav_points: {}, name: 'blue', country: country('blue') },
      red: { bullseye: { x: cx, y: cz }, nav_points: {}, name: 'red', country: country('red') },
    },
    sortie: m.info?.sortie ?? m.title,
    version: 21,
    trigrules: {},
    currentKey: 0,
    start_time: m.info?.start ?? 43200,
    forcedOptions: {},
    failures: {},
  };
}

/** The files of a minimal new .miz for a theatre with the plan's groups in it (all of them new). */
export function newDcsMissionFiles(theatre: string, m: MissionState): { files: Record<string, string>; summary: MissionExportSummary } {
  const base = luaFile('mission', emptyDcsMission(theatre, m));
  const plain: MissionState = { ...m, groups: m.groups.map((g) => ({ ...g, ref: undefined, units: g.units.map((u) => ({ ...u, ref: undefined })) })), removed: [] };
  const { text, summary } = patchDcsMissionText(base, plain);
  return {
    files: {
      mission: text,
      options: luaFile('options', { playerName: '', difficulty: {}, miscellaneous: {}, views: {}, sound: {}, graphics: {}, plugins: {}, format: 1 }),
      warehouses: luaFile('warehouses', { airports: {}, warehouses: {} }),
      theatre,
      'l10n/DEFAULT/dictionary': luaFile('dictionary', {}),
      'l10n/DEFAULT/mapResource': luaFile('mapResource', {}),
    },
    summary: { ...summary, mode: 'new', map: theatre },
  };
}

/** A theatre's name from a map name as missions and levels give it ("DCS: Caucasus" -> "Caucasus"). */
export function theatreOf(map: string): string {
  return map.replace(/^DCS:\s*/i, '').trim();
}

const enc = (s: string) => new TextEncoder().encode(s);

/**
 * The .miz for a plan: `original` patched when it is given (the .miz the
 * plan was made from, or another of the same theatre), else a new mission
 * for `theatre`.
 */
export async function writeDcsMiz(m: MissionState, original: Uint8Array | null, theatre?: string): Promise<{ bytes: Uint8Array; summary: MissionExportSummary }> {
  if (original) {
    const entries = zipEntries(original);
    const find = (n: string) => entries.find((e) => e.name.replace(/\\/g, '/').toLowerCase() === n);
    const me = find('mission');
    if (!me) throw new Error('not a DCS mission: no "mission" in the .miz');
    const text = new TextDecoder('utf-8').decode(await me.bytes());
    let dictionary: LuaTable | null = null;
    const de = find('l10n/default/dictionary');
    if (de) {
      try {
        dictionary = luaTable(parseLuaAssignments(new TextDecoder('utf-8').decode(await de.bytes())).dictionary as LuaValue);
      } catch {
        dictionary = null;
      }
    }
    const r = patchDcsMissionText(text, m, dictionary);
    // Nothing changed: the very same file.
    if (r.text === text) return { bytes: original, summary: r.summary };
    return { bytes: await rewriteZip(original, { [me.name]: enc(r.text) }), summary: r.summary };
  }
  const t = theatre || theatreOf(m.map);
  if (!t) throw new Error('a new mission needs a theatre');
  const { files, summary } = newDcsMissionFiles(t, m);
  return { bytes: await makeZip(Object.fromEntries(Object.entries(files).map(([k, v]) => [k, enc(v)]))), summary };
}

export { luaString };
