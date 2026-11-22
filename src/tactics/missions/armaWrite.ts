/**
 * A plan written back as an Arma 3 mission: the mission.sqm (or mission
 * .pbo) it was made from, patched, or a new Eden mission.
 *
 * **Patch.** The text is changed value by value (`sqm.ts` keeps where each
 * value lies); what the board left as it was stays byte for byte, and a plan
 * with no changes gives the very same file. A unit moved or turned gets a new
 * `position` and `angles` (Eden) or `azimut` (the older layout); a figure
 * changed to another kind a new `type` / `vehicle`; a moved waypoint a new
 * `position`; a waypoint's tasks its `type`, `combatMode` and behaviour
 * (`combat`). Waypoints added or taken away, units added to a group or taken
 * out of it, groups added or taken out: the list they are in is written
 * again - the items that stay keep their text and only take their new
 * number (`class Item<n>`), `items=` is the new count. New entities get ids
 * past the editor's `ItemIDProvider`, which moves on; links (`Connections`,
 * a group's `CrewLinks`) to what was taken out go with it.
 *
 * A binarised mission.sqm is read back as text (`derapifyText`) and, when
 * something changed, written as text; a .pbo gets its mission.sqm replaced
 * and its checksum made again.
 *
 * **New.** A minimal Eden mission: the plan's groups, its start, date and
 * weather. New vehicles get a stock crew of their side; Eden fills in the
 * addons the mission needs when it is saved there once.
 */

import { applyEdits, takeSpan, type TextEdit } from './luaWrite';
import { lineIndent } from './blk';
import { alignRoute, type ExportWarning, type MissionExportSummary } from './dcsWrite';
import { parseSqm, sqmClass, sqmClassText, sqmItems, sqmList, sqmNum, sqmNumber, sqmSpan, sqmStr, sqmString, type SqmClass, type SqmValue } from './sqm';
import { BEHAVIOUR, COMBAT, SIDES, armaSqmText, armaWaypointItems, behaviourOf, pboEntries, pboMissionSqm, sideOf, waypointPos } from './arma';
import { CATALOG } from '../../figures/catalog';
import type { MissionGroup, MissionState, MissionTask, MissionUnit, MissionWaypoint, UnitCategory } from './index';

// ---------------------------------------------------------------------------
// Classes for new units

type Side = 'B' | 'O' | 'I' | 'C';

/** Stock Arma 3 classes by the board's figure class, one per side (BLUFOR, OPFOR, Independent, Civilian). */
const CLASSES: Record<string, [string, string, string, string]> = {
  soldier: ['B_Soldier_F', 'O_Soldier_F', 'I_soldier_F', 'C_man_1'],
  sniper: ['B_sniper_F', 'O_sniper_F', 'I_Sniper_F', 'C_man_1'],
  'anti-tank': ['B_soldier_LAT_F', 'O_Soldier_LAT_F', 'I_Soldier_LAT_F', 'C_man_1'],
  medic: ['B_medic_F', 'O_medic_F', 'I_medic_F', 'C_man_1'],
  crew: ['B_crew_F', 'O_crew_F', 'I_crew_F', 'C_man_1'],
  operator: ['B_recon_F', 'O_recon_F', 'I_soldier_F', 'C_man_1'],
  mbt: ['B_MBT_01_cannon_F', 'O_MBT_02_cannon_F', 'I_MBT_03_cannon_F', 'C_Offroad_01_F'],
  'medium-tank': ['B_MBT_01_cannon_F', 'O_MBT_02_cannon_F', 'I_MBT_03_cannon_F', 'C_Offroad_01_F'],
  'light-tank': ['B_AFV_Wheeled_01_cannon_F', 'O_MBT_04_cannon_F', 'I_LT_01_cannon_F', 'C_Offroad_01_F'],
  'tank-destroyer': ['B_AFV_Wheeled_01_cannon_F', 'O_MBT_04_cannon_F', 'I_LT_01_AT_F', 'C_Offroad_01_F'],
  ifv: ['B_APC_Tracked_01_rcws_F', 'O_APC_Tracked_02_cannon_F', 'I_APC_tracked_03_cannon_F', 'C_Offroad_01_F'],
  'apc-tracked': ['B_APC_Tracked_01_rcws_F', 'O_APC_Tracked_02_cannon_F', 'I_APC_tracked_03_cannon_F', 'C_Offroad_01_F'],
  'apc-wheeled': ['B_APC_Wheeled_01_cannon_F', 'O_APC_Wheeled_02_rcws_v2_F', 'I_APC_Wheeled_03_cannon_F', 'C_Offroad_01_F'],
  mrap: ['B_MRAP_01_hmg_F', 'O_MRAP_02_hmg_F', 'I_MRAP_03_hmg_F', 'C_SUV_01_F'],
  'scout-car': ['B_MRAP_01_hmg_F', 'O_MRAP_02_hmg_F', 'I_MRAP_03_hmg_F', 'C_SUV_01_F'],
  jeep: ['B_LSV_01_armed_F', 'O_LSV_02_armed_F', 'I_C_Offroad_02_LMG_F', 'C_Offroad_01_F'],
  technical: ['B_G_Offroad_01_armed_F', 'O_G_Offroad_01_armed_F', 'I_G_Offroad_01_armed_F', 'C_Offroad_01_F'],
  'civilian-car': ['B_G_Offroad_01_F', 'O_G_Offroad_01_F', 'I_G_Offroad_01_F', 'C_Hatchback_01_F'],
  truck: ['B_Truck_01_transport_F', 'O_Truck_03_transport_F', 'I_Truck_02_transport_F', 'C_Truck_02_transport_F'],
  spaa: ['B_APC_Tracked_01_AA_F', 'O_APC_Tracked_02_AA_F', 'I_LT_01_AA_F', 'C_Offroad_01_F'],
  sam: ['B_SAM_System_03_F', 'O_SAM_System_04_F', 'B_SAM_System_03_F', 'C_Offroad_01_F'],
  'sp-artillery': ['B_MBT_01_arty_F', 'O_MBT_02_arty_F', 'I_Truck_02_MRL_F', 'C_Offroad_01_F'],
  mlrs: ['B_MBT_01_mlrs_F', 'O_Truck_02_MRL_F', 'I_Truck_02_MRL_F', 'C_Offroad_01_F'],
  mortar: ['B_Mortar_01_F', 'O_Mortar_01_F', 'I_Mortar_01_F', 'C_Offroad_01_F'],
  'towed-gun': ['B_HMG_01_high_F', 'O_HMG_01_high_F', 'I_HMG_01_high_F', 'C_Offroad_01_F'],
  'heli-attack': ['B_Heli_Attack_01_dynamicLoadout_F', 'O_Heli_Attack_02_dynamicLoadout_F', 'I_Heli_light_03_dynamicLoadout_F', 'C_Heli_Light_01_civil_F'],
  'heli-transport': ['B_Heli_Transport_01_F', 'O_Heli_Light_02_unarmed_F', 'I_Heli_Transport_02_F', 'C_Heli_Light_01_civil_F'],
  'heli-scout': ['B_Heli_Light_01_F', 'O_Heli_Light_02_unarmed_F', 'I_Heli_light_03_unarmed_F', 'C_Heli_Light_01_civil_F'],
  'drone-rotary': ['B_UAV_01_F', 'O_UAV_01_F', 'I_UAV_01_F', 'C_IDAP_UAV_01_F'],
  multirole: ['B_Plane_Fighter_01_F', 'O_Plane_Fighter_02_F', 'I_Plane_Fighter_04_F', 'C_Plane_Civil_01_F'],
  fighter: ['B_Plane_Fighter_01_F', 'O_Plane_Fighter_02_F', 'I_Plane_Fighter_04_F', 'C_Plane_Civil_01_F'],
  'jet-fighter': ['B_Plane_Fighter_01_F', 'O_Plane_Fighter_02_F', 'I_Plane_Fighter_04_F', 'C_Plane_Civil_01_F'],
  attack: ['B_Plane_CAS_01_dynamicLoadout_F', 'O_Plane_CAS_02_dynamicLoadout_F', 'I_Plane_Fighter_03_dynamicLoadout_F', 'C_Plane_Civil_01_F'],
  transport: ['B_T_VTOL_01_infantry_F', 'O_T_VTOL_02_infantry_dynamicLoadout_F', 'B_T_VTOL_01_infantry_F', 'C_Plane_Civil_01_F'],
  tiltrotor: ['B_T_VTOL_01_infantry_F', 'O_T_VTOL_02_infantry_dynamicLoadout_F', 'B_T_VTOL_01_infantry_F', 'C_Plane_Civil_01_F'],
  'drone-fixed': ['B_UAV_02_dynamicLoadout_F', 'O_UAV_02_dynamicLoadout_F', 'I_UAV_02_dynamicLoadout_F', 'C_Plane_Civil_01_F'],
  rhib: ['B_Boat_Transport_01_F', 'O_Boat_Transport_01_F', 'I_Boat_Transport_01_F', 'C_Rubberboat'],
  'patrol-boat': ['B_Boat_Armed_01_minigun_F', 'O_Boat_Armed_01_hmg_F', 'I_Boat_Armed_01_minigun_F', 'C_Boat_Civil_01_F'],
  submarine: ['B_SDV_01_F', 'O_SDV_01_F', 'I_SDV_01_F', 'C_Boat_Civil_01_F'],
};
/** A class per category for figures of a class the table has not. */
const BY_CATEGORY: Record<UnitCategory, string> = { infantry: 'soldier', ground: 'mrap', air: 'attack', heli: 'heli-transport', sea: 'patrol-boat', static: 'towed-gun' };
const SIDE_INDEX: Record<Side, number> = { B: 0, O: 1, I: 2, C: 3 };

/** The Arma 3 class for a board figure: its figure class's stock one on its side; `guessed` when only its category says. */
export function armaClassFor(kind: string, category: UnitCategory, side: Side): { type: string; guessed: boolean } {
  const cls = String(CATALOG[kind]?.cls ?? '');
  const row = CLASSES[kind] ?? CLASSES[cls];
  if (row) return { type: row[SIDE_INDEX[side]], guessed: !CLASSES[kind] && !cls };
  return { type: CLASSES[BY_CATEGORY[category]][SIDE_INDEX[side]], guessed: true };
}

/** The crew a new vehicle gets: a driver, and a gunner where it has a gun; pilots for aircraft. */
function crewOf(category: UnitCategory, kind: string, side: Side): { type: string; role: number; turret?: number[] }[] {
  const s = SIDE_INDEX[side];
  if (category === 'air') return [{ type: ['B_Pilot_F', 'O_Pilot_F', 'I_pilot_F', 'C_man_pilot_F'][s], role: 1 }];
  if (category === 'heli') return [{ type: ['B_Helipilot_F', 'O_helipilot_F', 'I_helipilot_F', 'C_man_pilot_F'][s], role: 1 }];
  const crew = ['B_crew_F', 'O_crew_F', 'I_crew_F', 'C_man_1'][s];
  const cls = String(CATALOG[kind]?.cls ?? kind);
  if (/towed|mortar|emplacement/.test(cls)) return [{ type: crew, role: 2, turret: [0] }];
  if (/truck|civilian|car$|bus|quad|motor/.test(cls)) return [{ type: crew, role: 1 }];
  return [
    { type: crew, role: 1 },
    { type: crew, role: 2, turret: [0] },
  ];
}

// ---------------------------------------------------------------------------
// Tasks as waypoint fields

/** The board's tasks as Eden's waypoint types (the older layout's in upper case: `LEGACY_TYPE`). */
const EDEN_TYPE: Record<string, string> = { sweep: 'SeekAndDestroy', attack: 'Destroy', guard: 'Guard', defend: 'Guard', hold: 'Hold', block: 'Hold', screen: 'Sentry', overwatch: 'Support', patrol: 'Cycle', orbit: 'Loiter' };
const LEGACY_TYPE: Record<string, string> = { sweep: 'SAD', attack: 'DESTROY', guard: 'GUARD', defend: 'GUARD', hold: 'HOLD', block: 'HOLD', screen: 'SENTRY', overwatch: 'SUPPORT', patrol: 'CYCLE', orbit: 'LOITER' };
const ROE_OUT: Record<string, string> = { hold: 'BLUE', return: 'GREEN', tight: 'WHITE', free: 'RED' };
const ALARM_OUT: Record<string, string> = { safe: 'SAFE', aware: 'AWARE', combat: 'COMBAT', stealth: 'STEALTH' };
/** The waypoint types a task of the game's own name may carry (the reader's names for the ones the board has no task for). */
const OWN_TYPES = /^(move|destroy|getin|sad|seekanddestroy|join|leader|getout|cycle|load|unload|tr ?unload|transportunload|hold|sentry|guard|talk|scripted|support|getin ?nearest|getinnearest|dismiss|loiter|vehicleinvehicleload|vehicleinvehicleunload|land|hook|unhook)$/i;

/** The same type in either spelling (`SeekAndDestroy` is `SAD`). */
const sameType = (a: string, b: string) => {
  const n = (s: string) => {
    const u = s.toUpperCase().replace(/\s+/g, '');
    return u === 'SEEKANDDESTROY' ? 'SAD' : u === 'TRANSPORTUNLOAD' ? 'TRUNLOAD' : u;
  };
  return n(a) === n(b);
};

interface WaypointFields {
  type: string;
  combatMode?: string;
  behaviour?: string;
}

/** A waypoint's fields for its tasks; the tasks Arma has no waypoint for are warned of. */
function fieldsOf(tasks: MissionTask[] | undefined, eden: boolean, warn: (w: ExportWarning) => void, group: string): WaypointFields {
  const out: WaypointFields = { type: eden ? 'Move' : 'MOVE' };
  let typed = false;
  for (const t of tasks ?? []) {
    if (t.kind === 'roe' && t.state) {
      if (ROE_OUT[t.state]) out.combatMode = ROE_OUT[t.state];
      else warn({ code: 'state', group, what: t.state });
    } else if (t.kind === 'alarm' && t.state) {
      if (ALARM_OUT[t.state]) out.behaviour = ALARM_OUT[t.state];
      else warn({ code: 'state', group, what: t.state });
    } else if (!typed && t.kind && EDEN_TYPE[t.kind]) {
      out.type = (eden ? EDEN_TYPE : LEGACY_TYPE)[t.kind];
      typed = true;
    } else if (!typed && !t.kind && OWN_TYPES.test(t.name)) {
      out.type = t.name;
      typed = true;
    } else warn({ code: 'arma-task', group, what: t.name });
  }
  return out;
}

// ---------------------------------------------------------------------------
// The patch

const flat = (a: { x: number; z: number }, b: { x: number; z: number }) => Math.hypot(a.x - b.x, a.z - b.z);
const game = (p: { x: number; y: number; z: number }) => [p.x, p.y, -p.z];
const board = (p: SqmValue[]) => ({ x: sqmNum(p[0] as number), y: sqmNum(p[1] as number), z: -sqmNum(p[2] as number) });
const turn = (a: number) => ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
const angleOff = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
const listText = (v: number[]) => `{${v.map((n) => sqmNumber(n)).join(',')}}`;
const isItem = (k: string) => /^item\d+$/i.test(k);

/** A new item to put in a list: its class (named when written). */
interface Fresh {
  fresh: SqmClass;
}
type ListItem = SqmClass | Fresh;
const isFresh = (x: ListItem): x is Fresh => !!(x as Fresh).fresh && !sqmSpan(x as SqmClass);

class ArmaPatch {
  readonly edits: TextEdit[] = [];
  readonly warnings: ExportWarning[] = [];
  readonly eol: string;
  readonly step: string;
  nextId = 0;
  idsIssued = false;
  /** The ids of what was taken out, for the links to it. */
  readonly gone = new Set<number>();
  constructor(readonly text: string) {
    this.eol = text.includes('\r\n') ? '\r\n' : '\n';
    const m = /\n([ \t]+)class /.exec(text);
    this.step = m ? (m[1][0] === '\t' ? '\t' : m[1]) : '\t';
  }
  replace(start: number, end: number, text: string) {
    this.edits.push({ start, end, text });
  }
  nl(s: string) {
    return this.eol === '\n' ? s : s.replace(/\r?\n/g, this.eol);
  }
  id(): number {
    this.idsIssued = true;
    return this.nextId++;
  }
  /** Sets a value (`key=` or `key[]=`): replaced where it is, else a line added at the class's end. */
  set(c: SqmClass, key: string, value: string, list = false) {
    const e = sqmSpan(c)?.entries[key];
    if (e) {
      if (this.text.slice(e.valueStart, e.valueEnd) !== value) this.replace(e.valueStart, e.valueEnd, value);
      return;
    }
    this.insert(c, `${key}${list ? '[]' : ''}=${value};`);
  }
  /** Takes an entry's line out. */
  drop(c: SqmClass, key: string) {
    const e = sqmSpan(c)?.entries[key];
    if (!e) return;
    const ls = this.text.lastIndexOf('\n', e.start - 1) + 1;
    const own = this.text.slice(ls, e.start).trim() === '';
    const nl = this.text.indexOf('\n', e.end);
    const lineEnd = nl < 0 ? this.text.length : nl + 1;
    if (own && this.text.slice(e.end, lineEnd).trim() === '') this.replace(ls, lineEnd, '');
    else this.replace(e.start, e.end, '');
  }
  /** A line added as the last thing in a class. */
  insert(c: SqmClass, line: string) {
    const sp = sqmSpan(c)!;
    const ind = lineIndent(this.text, sp.start) + this.step;
    const ls = this.text.lastIndexOf('\n', sp.close - 1) + 1;
    if (this.text.slice(ls, sp.close).trim() === '' && ls > sp.open) this.replace(ls, ls, `${ind}${line}${this.eol}`);
    else this.replace(sp.close, sp.close, ` ${line} `);
  }
  /**
   * A list class written again with these items in this order: the ones it
   * had keep their text (with the changes made in them) under their new
   * number, new ones are written out; `items=` is the count. What else the
   * list holds stays.
   */
  rebuild(list: SqmClass, items: ListItem[]) {
    const sp = sqmSpan(list)!;
    const indent = lineIndent(this.text, sp.start);
    const inner = indent + this.step;
    const texts = items.map((it, n) => {
      if (isFresh(it)) return this.nl(sqmClassText(`Item${n}`, it.fresh, inner, this.step));
      const cs = sqmSpan(it)!;
      return takeSpan(this.text, cs.start, cs.end, this.edits).replace(/^class\s+Item\d+/i, `class Item${n}`);
    });
    const others: string[] = [];
    for (const [k, v] of Object.entries(list)) {
      const cs = sqmClass(v) ? sqmSpan(v as SqmClass) : undefined;
      if (cs && !isItem(k)) others.push(takeSpan(this.text, cs.start, cs.end, this.edits));
      else if (!cs && k !== 'items' && sp.entries[k]) others.push(takeSpan(this.text, sp.entries[k].start, sp.entries[k].end, this.edits));
    }
    // What is left inside (items taken out, with any changes in them) goes with the old body.
    takeSpan(this.text, sp.open + 1, sp.close, this.edits);
    const body = [`${inner}items=${texts.length};`, ...others.map((o) => `${inner}${o}`), ...texts.map((t) => `${inner}${t}`)].join(this.eol);
    this.replace(sp.open + 1, sp.close, `${this.eol}${body}${this.eol}${indent}`);
  }
}

const rebuild = (p: ArmaPatch, list: SqmClass, items: ListItem[]) => p.rebuild(list, items);

/** Every `id` in a class and the classes in it. */
function idsIn(c: SqmClass, out: number[] = []): number[] {
  for (const [k, v] of Object.entries(c)) {
    if (k === 'id' && typeof v === 'number') out.push(v);
    else if (sqmClass(v)) idsIn(v as SqmClass, out);
  }
  return out;
}

const objectOf = (it: SqmClass) => sqmStr(it.dataType).toLowerCase() === 'object' && !!sqmStr(it.type) && sqmList(sqmClass(it.PositionInfo)?.position ?? it.position).length >= 3;
const waypointOf = (it: SqmClass) => sqmStr(it.dataType).toLowerCase() === 'waypoint';

/** A unit's place, facing and type, changed where the board changed them. Returns whether anything changed. */
function patchUnit(p: ArmaPatch, o: SqmClass, u: MissionUnit, side: Side, eden: boolean, group: string): void {
  const pi = eden ? (sqmClass(o.PositionInfo) ?? o) : o;
  const pos = sqmList(pi.position);
  const want = game(u.at);
  if (pos.length >= 3 && want.some((v, i) => Math.abs(v - sqmNum(pos[i] as number)) > 0.01)) p.set(pi, 'position', listText(want), true);
  if (eden) {
    const angles = sqmList(pi.angles);
    if (angleOff(sqmNum(angles[1] as number), u.yaw) > 1e-4) p.set(pi, 'angles', listText([sqmNum(angles[0] as number), turn(u.yaw), sqmNum(angles[2] as number)]), true);
  } else if (angleOff((sqmNum(o.azimut) * Math.PI) / 180, u.yaw) > 1e-4) p.set(o, 'azimut', sqmNumber(Number(((turn(u.yaw) * 180) / Math.PI).toFixed(4))));
  if (!u.type && u.figure) {
    const cls = armaClassFor(u.figure, u.category, side);
    const key = eden ? 'type' : 'vehicle';
    if (cls.type.toLowerCase() !== sqmStr(o[key]).toLowerCase()) {
      p.set(o, key, sqmString(cls.type));
      p.warnings.push({ code: 'retyped', group, what: cls.type });
    }
  }
}

/** A waypoint's place and fields, changed where the board changed them. */
function patchWaypoint(p: ArmaPatch, w: SqmClass, wp: MissionWaypoint, eden: boolean, group: string, moved: boolean): void {
  const pi = sqmClass(w.PositionInfo) ?? w;
  if (moved) p.set(pi, 'position', listText(game(wp.at)), true);
  const f = fieldsOf(wp.tasks, eden, (x) => p.warnings.push(x), group);
  const had = sqmStr(w.type);
  if (had ? !sameType(had, f.type) : !sameType(f.type, 'MOVE')) p.set(w, 'type', sqmString(f.type));
  const mode = sqmStr(w.combatMode).toUpperCase();
  if (f.combatMode) {
    if (COMBAT[mode] !== COMBAT[f.combatMode]) p.set(w, 'combatMode', sqmString(f.combatMode));
  } else if (mode) p.drop(w, 'combatMode');
  const key = w.combat !== undefined ? 'combat' : w.behaviour !== undefined ? 'behaviour' : 'combat';
  const was = behaviourOf(w);
  if (f.behaviour) {
    if (BEHAVIOUR[was] !== BEHAVIOUR[f.behaviour]) p.set(w, key, sqmString(f.behaviour));
  } else if (was) p.drop(w, key);
}

/** A new waypoint's class. */
function newWaypoint(p: ArmaPatch, wp: MissionWaypoint, eden: boolean, group: string): SqmClass {
  const f = fieldsOf(wp.tasks, eden, (x) => p.warnings.push(x), group);
  const c: SqmClass = eden ? { dataType: 'Waypoint', position: game(wp.at), type: f.type } : { position: game(wp.at), type: f.type };
  if (f.combatMode) c.combatMode = f.combatMode;
  if (f.behaviour) c.combat = f.behaviour;
  c.Effects = {};
  c.showWP = 'NEVER';
  if (eden) c.id = p.id();
  return c;
}

/** The side letter of a mission side (`blufor`, or a plan's own: the first side Blue, the second Red...). */
function sideLetter(side: string, sides: string[]): Side {
  const id = SIDES.some((s) => s.id === side) ? side : sideOf(side);
  if (SIDES.some((s) => s.re.test(side) || s.id === side)) return (['B', 'O', 'I', 'C'] as Side[])[SIDES.findIndex((s) => s.id === id)];
  if (/^(blue|allies|nato|west)/i.test(side)) return 'B';
  if (/^(red|axis|east)/i.test(side)) return 'O';
  if (/^(green|indep|guer)/i.test(side)) return 'I';
  const i = sides.indexOf(side);
  return (['B', 'O', 'I', 'C'] as Side[])[i >= 0 && i < 4 ? i : 0];
}
const SIDE_NAME: Record<Side, [string, string]> = { B: ['West', 'WEST'], O: ['East', 'EAST'], I: ['Independent', 'GUER'], C: ['Civilian', 'CIV'] };

/** New Eden objects for a unit: the unit, or a vehicle with its stock crew and the links that seat them. */
function newEdenUnits(p: ArmaPatch, u: MissionUnit, side: Side, leader: boolean, crewLinks: SqmClass[]): SqmClass[] {
  const kind = u.figure ?? '';
  const cls = u.type ? { type: u.type, guessed: false } : armaClassFor(kind, u.category, side);
  if (cls.guessed) p.warnings.push({ code: 'type-guess', what: `${u.name} → ${cls.type}` });
  const at = game(u.at);
  const obj = (type: string, flags: number): SqmClass => ({ dataType: 'Object', PositionInfo: { position: at, angles: [0, turn(u.yaw), 0] }, side: SIDE_NAME[side][0], flags, Attributes: {}, id: p.id(), type });
  if (u.category === 'infantry') return [obj(cls.type, leader ? 6 : 4)];
  const vehicle = obj(cls.type, 6);
  const crew = crewOf(u.category, kind, side).map((c, i) => ({ c, o: obj(c.type, leader && i === 0 ? 6 : 4) }));
  for (const { c, o } of crew) crewLinks.push({ item0: o.id as number, item1: vehicle.id as number, CustomData: { role: c.role, ...(c.turret ? { turretPath: c.turret } : {}) } });
  return [...crew.map((x) => x.o), vehicle];
}

/** A unit of the older layout: a vehicle there comes with its crew. */
function newLegacyVehicle(p: ArmaPatch, u: MissionUnit, side: Side, leader: boolean): SqmClass {
  const cls = u.type ? { type: u.type, guessed: false } : armaClassFor(u.figure ?? '', u.category, side);
  if (cls.guessed) p.warnings.push({ code: 'type-guess', what: `${u.name} → ${cls.type}` });
  return { position: game(u.at), azimut: Number(((turn(u.yaw) * 180) / Math.PI).toFixed(2)), id: p.id(), side: SIDE_NAME[side][1], vehicle: cls.type, ...(leader ? { leader: 1 } : {}), skill: 0.6 };
}

/** A list class holding these items, as written new. */
const listOf = (items: SqmClass[]): SqmClass => Object.fromEntries([['items', items.length], ...items.map((it, i) => [`Item${i}`, it])]);

function crewLinksClass(links: SqmClass[]): SqmClass {
  return { LinkIDProvider: { nextID: links.length }, Links: listOf(links.map((l, i) => ({ linkID: i, ...l }))) };
}

/** A new group of the mission's kind: an Eden group (or its own object, for what has no crew), or one of the older layout. */
function newGroup(p: ArmaPatch, g: MissionGroup, side: Side, eden: boolean): SqmClass | null {
  if (g.category === 'static' || !g.units.length) {
    p.warnings.push({ code: 'static', group: g.name });
    return null;
  }
  const route = g.route.slice(1);
  if (eden) {
    const links: SqmClass[] = [];
    const objects = g.units.flatMap((u, i) => newEdenUnits(p, u, side, i === 0, links));
    const wps = route.map((w) => newWaypoint(p, w, true, g.name));
    const c: SqmClass = { dataType: 'Group', side: SIDE_NAME[side][0], Entities: listOf([...objects, ...wps]), Attributes: {} };
    if (links.length) c.CrewLinks = crewLinksClass(links);
    c.id = p.id();
    if (links.length) p.warnings.push({ code: 'arma-crew', group: g.name });
    return c;
  }
  const vehicles = g.units.map((u, i) => newLegacyVehicle(p, u, side, i === 0));
  const c: SqmClass = { side: SIDE_NAME[side][1], Vehicles: listOf(vehicles) };
  if (route.length) c.Waypoints = listOf(route.map((w) => newWaypoint(p, w, false, g.name)));
  return c;
}

/**
 * A group of the file patched: its units (moved, turned, retyped; taken out;
 * added), its waypoints (moved, retasked; added or taken out: the list
 * written again). Returns whether anything changed.
 */
function patchGroup(p: ArmaPatch, gc: SqmClass, g: MissionGroup, eden: boolean, side: Side): boolean {
  const before = p.edits.length;
  const unitList = eden ? sqmClass(gc.Entities) : sqmClass(gc.Vehicles);
  const all = sqmItems(unitList ?? undefined);
  const objects = eden ? all.filter(objectOf) : all.filter((v) => !!sqmStr(v.vehicle) && sqmList(v.position).length >= 3);
  const refOf = (o: SqmClass, k: number) => (eden ? String(sqmNum(o.id)) : `${g.ref}.${all.indexOf(o) >= 0 ? all.indexOf(o) : k}`);
  const byRef = new Map(objects.map((o, k) => [refOf(o, k), o]));
  const kept = new Set<SqmClass>();
  const fresh: MissionUnit[] = [];
  for (const u of g.units) {
    const o = u.ref !== undefined ? byRef.get(u.ref) : undefined;
    if (!o) {
      fresh.push(u);
      continue;
    }
    kept.add(o);
    patchUnit(p, o, u, side, eden, g.name);
  }
  const out = objects.filter((o) => !kept.has(o));
  for (const o of out) for (const id of idsIn(o)) p.gone.add(id);
  // The route: the lead's place, then the waypoints.
  const fromEntities = eden && all.some(waypointOf);
  // Eden keeps a group's waypoints with its units (older files a list of their own, which stays theirs).
  const wpList = eden && (fromEntities || !sqmClass(gc.Waypoints)) ? unitList : sqmClass(gc.Waypoints);
  const old = armaWaypointItems(gc).filter((w) => waypointPos(w).length >= 3);
  const lead = g.units[0] && g.units[0].ref !== undefined ? byRef.get(g.units[0].ref) : undefined;
  const leadAt = lead ? board(sqmList((eden ? sqmClass(lead.PositionInfo) : null)?.position ?? lead.position)) : g.units[0]?.at;
  const route = g.route.length ? g.route : leadAt ? [{ at: leadAt }] : [];
  const oldAt = [leadAt ?? { x: 0, y: 0, z: 0 }, ...old.map((w) => board(waypointPos(w)))];
  const m = alignRoute(
    route.map((w) => w.at),
    oldAt,
  );
  route.forEach((w, i) => {
    if (i === 0 || m[i] <= 0) return;
    const was = oldAt[m[i]];
    patchWaypoint(p, old[m[i] - 1], w, eden, g.name, flat(w.at, was) > 0.05 || Math.abs(w.at.y - was.y) > 0.05);
  });
  const identity = route.length === oldAt.length && m.every((j, i) => j === i);
  const seq: ListItem[] = route.slice(1).map((w, k) => (m[k + 1] > 0 ? old[m[k + 1] - 1] : { fresh: newWaypoint(p, w, eden, g.name) }));
  const dropped = old.filter((w) => !seq.includes(w));
  if (eden) for (const w of dropped) for (const id of idsIn(w)) p.gone.add(id);
  // New units of the group (figures that joined it on the board).
  const links: SqmClass[] = [];
  const freshObjects: ListItem[] = fresh.flatMap((u) => (eden ? newEdenUnits(p, u, side, false, links) : [newLegacyVehicle(p, u, side, false)]).map((c) => ({ fresh: c })));
  if (links.length) p.warnings.push({ code: 'arma-crew', group: g.name });
  if (unitList && (out.length || freshObjects.length || (!identity && wpList === unitList))) {
    // The unit list (Eden: units and waypoints together) in its order, the waypoints where the first one was.
    const items: ListItem[] = [];
    let placed = false;
    const lastObject = all.reduce((k, it, i) => (objects.includes(it) && kept.has(it) ? i : k), -1);
    all.forEach((it, i) => {
      if (objects.includes(it)) {
        if (kept.has(it)) items.push(it);
      } else if (wpList === unitList && waypointOf(it)) {
        if (!placed) items.push(...seq);
        placed = true;
      } else items.push(it);
      if (i === lastObject) items.push(...freshObjects);
    });
    if (lastObject < 0) items.unshift(...freshObjects);
    if (!placed && wpList === unitList) items.push(...seq);
    rebuild(p, unitList, items);
  } else if (!identity && wpList && wpList !== unitList) rebuild(p, wpList, seq);
  else if (!identity && !wpList && seq.length) {
    // A route for a group of the older layout that had none: a list of its own.
    p.insert(gc, p.nl(sqmClassText('Waypoints', listOf(seq.map((s) => (s as Fresh).fresh)), lineIndent(p.text, sqmSpan(gc)!.start) + p.step, p.step)));
  }
  // The crew links: new ones added, the ones to units taken out dropped.
  const cl = sqmClass(gc.CrewLinks);
  if (cl && (links.length || out.length)) {
    const ll = sqmClass(cl.Links);
    const keep = sqmItems(ll ?? undefined).filter((l) => !p.gone.has(sqmNum(l.item0)) && !p.gone.has(sqmNum(l.item1)));
    let next = sqmNum(sqmClass(cl.LinkIDProvider)?.nextID);
    const add = links.map((l) => ({ fresh: { linkID: next++, ...l } }));
    if (ll) rebuild(p, ll, [...keep, ...add]);
    if (add.length && sqmClass(cl.LinkIDProvider)) p.set(sqmClass(cl.LinkIDProvider)!, 'nextID', String(next));
  } else if (!cl && links.length) p.insert(gc, p.nl(sqmClassText('CrewLinks', crewLinksClass(links), lineIndent(p.text, sqmSpan(gc)!.start) + p.step, p.step)));
  return p.edits.length !== before;
}

/** An object of no group (an empty vehicle): place, facing and type only. */
function patchLoose(p: ArmaPatch, o: SqmClass, g: MissionGroup, eden: boolean, side: Side): boolean {
  const before = p.edits.length;
  const u = g.units[0];
  if (u) patchUnit(p, o, u, side, eden, g.name);
  if (g.route.length > 1) p.warnings.push({ code: 'arma-loose-route', group: g.name });
  if (g.units.length > 1) p.warnings.push({ code: 'arma-loose-route', group: g.name });
  return p.edits.length !== before;
}

interface Found {
  c: SqmClass;
  list: SqmClass;
  kind: 'group' | 'loose';
}

/** The file's groups and loose objects by the refs the reader gave them. */
function indexMission(mission: SqmClass, eden: boolean): Map<string, Found> {
  const out = new Map<string, Found>();
  if (eden) {
    const walk = (list: SqmClass | null, path: string) => {
      sqmItems(list ?? undefined).forEach((it, i) => {
        const dt = sqmStr(it.dataType).toLowerCase();
        const id = it.id !== undefined ? String(sqmNum(it.id)) : `${path}${i}`;
        if (dt === 'group') out.set(`g:${id}`, { c: it, list: list!, kind: 'group' });
        else if (dt === 'object') out.set(`o:${id}`, { c: it, list: list!, kind: 'loose' });
        else if (dt === 'layer') walk(sqmClass(it.Entities), `${path}${i}.`);
      });
    };
    walk(sqmClass(mission.Entities), 'e');
  } else {
    sqmItems(mission.Groups).forEach((g, i) => out.set(`G${i}`, { c: g, list: sqmClass(mission.Groups)!, kind: 'group' }));
    sqmItems(mission.Vehicles).forEach((v, i) => out.set(`V${i}`, { c: v, list: sqmClass(mission.Vehicles)!, kind: 'loose' }));
  }
  return out;
}

/** The mission's text with the plan's changes made (`MissionState` from `planToMission`). */
export function patchArmaMissionText(text: string, m: MissionState): { text: string; summary: MissionExportSummary } {
  const root = parseSqm(text);
  const mission = sqmClass(root.Mission);
  if (!mission) throw new Error('not an Arma mission: no "class Mission"');
  const eden = !!sqmClass(mission.Entities) || !sqmClass(mission.Groups);
  const p = new ArmaPatch(text);
  const provider = sqmClass(sqmClass(root.EditorData)?.ItemIDProvider);
  p.nextId = Math.max(sqmNum(provider?.nextID), ...idsIn(root).map((n) => n + 1), 0);
  const found = indexMission(mission, eden);
  const sides = m.sides.map((s) => s.id);
  const summary: MissionExportSummary = { mode: 'patch', map: m.map, groups: 0, units: 0, waypoints: 0, changed: [], added: [], removed: [], untouched: 0, warnings: p.warnings };
  const fresh: MissionGroup[] = [];
  let linked = 0;
  for (const g of m.groups) {
    summary.groups++;
    summary.units += g.units.length;
    summary.waypoints += g.route.length;
    const f = g.ref ? found.get(g.ref) : undefined;
    if (!f) {
      fresh.push(g);
      continue;
    }
    linked++;
    const side = sideLetter(sqmStr(f.c.side) || g.side, sides);
    const changed = f.kind === 'group' ? patchGroup(p, f.c, g, eden, side) : patchLoose(p, f.c, g, eden, side);
    if (changed) summary.changed.push(g.name);
  }
  // Groups taken out, and new ones, in the lists they are in.
  const lists = new Map<SqmClass, { drop: Set<SqmClass>; add: SqmClass[] }>();
  const planOf = (l: SqmClass) => lists.get(l) ?? lists.set(l, { drop: new Set(), add: [] }).get(l)!;
  for (const ref of m.removed ?? []) {
    const f = found.get(ref);
    if (!f) continue;
    planOf(f.list).drop.add(f.c);
    for (const id of idsIn(f.c)) p.gone.add(id);
    summary.removed.push(ref);
  }
  if (summary.removed.length) p.warnings.push({ code: 'removed', n: summary.removed.length });
  summary.untouched = Math.max(0, linked - summary.changed.length);
  const top = eden ? sqmClass(mission.Entities) : sqmClass(mission.Groups);
  // A mission with no list for them yet gets one.
  const orphans: SqmClass[] = [];
  for (const g of fresh) {
    const side = sideLetter(g.side, sides);
    const c = newGroup(p, g, side, eden);
    if (!c) continue;
    if (top) planOf(top).add.push(c);
    else orphans.push(c);
    summary.added.push(g.name);
    if (g.category === 'air' || g.category === 'heli') p.warnings.push({ code: 'arma-air', group: g.name });
  }
  if (orphans.length) p.insert(mission, p.nl(sqmClassText(eden ? 'Entities' : 'Groups', listOf(orphans), lineIndent(text, sqmSpan(mission)!.start) + p.step, p.step)));
  // Inner lists (a layer's) before the lists they are in.
  const order = [...lists].sort((a, b) => sqmSpan(b[0])!.start - sqmSpan(a[0])!.start);
  for (const [list, plan] of order) rebuild(p, list, [...sqmItems(list).filter((it) => !plan.drop.has(it)), ...plan.add.map((c) => ({ fresh: c }))]);
  // Links to what was taken out go with it.
  const links = sqmClass(sqmClass(mission.Connections)?.Links);
  if (links && p.gone.size) {
    const all = sqmItems(links);
    const keep = all.filter((l) => !p.gone.has(sqmNum(l.item0, -1)) && !p.gone.has(sqmNum(l.item1, -1)));
    if (keep.length !== all.length) rebuild(p, links, keep);
  }
  if (p.idsIssued && provider) p.set(provider, 'nextID', String(p.nextId));
  return { text: applyEdits(text, p.edits), summary };
}

/** A minimal Eden mission: no units, the plan's start, date and weather. */
function emptyEdenMission(m: MissionState): string {
  const info = m.info;
  const start = info?.start ?? 12 * 3600;
  const date = info?.date ?? { year: 2035, month: 6, day: 24 };
  const overcast = Math.max(0, Math.min(1, (info?.weather?.cloudDensity ?? 3) / 10));
  const fog = info?.weather?.fog ? 0.4 : 0;
  return [
    'version=54;',
    'class EditorData',
    '{',
    '\tmoveGridStep=1;',
    '\tangleGridStep=0.2617994;',
    '\tscaleGridStep=1;',
    '\tautoGroupingDist=10;',
    '\ttoggles=1;',
    '\tclass ItemIDProvider',
    '\t{',
    '\t\tnextID=0;',
    '\t};',
    '};',
    'binarizationWanted=0;',
    'addons[]={};',
    'class Mission',
    '{',
    '\tclass Intel',
    '\t{',
    ...(m.title ? [`\t\tbriefingName=${sqmString(m.title)};`] : []),
    `\t\tstartWeather=${sqmNumber(overcast)};`,
    `\t\tforecastWeather=${sqmNumber(overcast)};`,
    ...(fog ? [`\t\tstartFog=${fog};`, `\t\tforecastFog=${fog};`] : []),
    `\t\tyear=${date.year};`,
    `\t\tmonth=${date.month};`,
    `\t\tday=${date.day};`,
    `\t\thour=${Math.floor(start / 3600) % 24};`,
    `\t\tminute=${Math.floor((start % 3600) / 60)};`,
    '\t};',
    '\tclass Entities',
    '\t{',
    '\t\titems=0;',
    '\t};',
    '};',
    '',
  ].join('\n');
}

/** A new Eden mission with the plan's groups (all of them new). */
export function newArmaMissionText(world: string, m: MissionState): { text: string; summary: MissionExportSummary } {
  const plain: MissionState = { ...m, groups: m.groups.map((g) => ({ ...g, ref: undefined, units: g.units.map((u) => ({ ...u, ref: undefined })) })), removed: [] };
  const r = patchArmaMissionText(emptyEdenMission(m), plain);
  r.summary.warnings.push({ code: 'arma-new', what: world });
  return { text: r.text, summary: { ...r.summary, mode: 'new', map: world } };
}

async function sha1(bytes: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-1', bytes.slice()));
}

/** A .pbo with one file's bytes replaced: its header's sizes set, its checksum made again. */
export async function replaceInPbo(pbo: Uint8Array, name: string, next: Uint8Array): Promise<Uint8Array> {
  const { entries, dataEnd } = pboEntries(pbo);
  const e = entries.find((x) => x.name === name);
  if (!e) throw new Error(`the .pbo has no ${name}`);
  const head = pbo.slice(0, e.offset);
  const dv = new DataView(head.buffer);
  const sizes = e.headEnd - 20;
  // Packing, original size, reserved, time, stored size: the sizes are the new file's.
  if (dv.getUint32(sizes + 4, true) !== 0) dv.setUint32(sizes + 4, next.length, true);
  dv.setUint32(sizes + 16, next.length, true);
  const rest = pbo.subarray(e.offset + e.size, dataEnd);
  const body = new Uint8Array(head.length + next.length + rest.length);
  body.set(head, 0);
  body.set(next, head.length);
  body.set(rest, head.length + next.length);
  // A signed .pbo ends in a zero byte and the SHA-1 of all before it.
  if (pbo.length === dataEnd + 21 && pbo[dataEnd] === 0) {
    const out = new Uint8Array(body.length + 21);
    out.set(body, 0);
    out.set(await sha1(body), body.length + 1);
    return out;
  }
  return body;
}

/**
 * The mission for a plan: `original` (a mission.sqm, text or binarised, or a
 * mission .pbo) patched when given, else a new Eden mission for `world`. An
 * unchanged plan gives the original bytes.
 */
export async function writeArmaMission(m: MissionState, original: Uint8Array | null, world?: string, name = ''): Promise<{ bytes: Uint8Array; summary: MissionExportSummary; ext: string }> {
  const enc = new TextEncoder();
  if (original) {
    const pbo = /\.pbo$/i.test(name) || (!/\.sqm$/i.test(name) && original[0] === 0 && original[1] !== 0x72);
    const inner = pbo ? pboMissionSqm(original) : null;
    const { text, binarised } = armaSqmText(inner ? inner.bytes : original);
    const r = patchArmaMissionText(text, m);
    if (r.text === text) return { bytes: original, summary: r.summary, ext: pbo ? '.pbo' : '.sqm' };
    if (binarised) r.summary.warnings.push({ code: 'arma-text' });
    const sqm = enc.encode(r.text);
    return { bytes: inner ? await replaceInPbo(original, inner.entry.name, sqm) : sqm, summary: r.summary, ext: pbo ? '.pbo' : '.sqm' };
  }
  const w = world || m.map.replace(/^Arma 3:\s*/i, '');
  const r = newArmaMissionText(w || 'Altis', m);
  return { bytes: enc.encode(r.text), summary: r.summary, ext: '.sqm' };
}
