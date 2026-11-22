/**
 * A plan written back as an IL-2 Great Battles mission (`.Mission`, the
 * editor's text form): the mission it was made from, patched, or a new one
 * on a map.
 *
 * **Patch.** Values are changed where they stand (`il2.ts` keeps every
 * parameter's place); a group the board left as it was stays byte for byte,
 * and a plan with no change gives the very same file. A unit moved or turned
 * gets new `XPos`/`YPos`/`ZPos` and `YOri`, and its entity moves with it; a
 * waypoint moved gets its position (and its `Speed` where the leg changed).
 * A waypoint taken away is taken out of the mission's links: whatever led to
 * it leads to what it led to. A waypoint added is linked in after the one
 * before it: it takes over the links that led on to the next waypoint, and
 * the one before leads to it. A unit no object holds becomes a new object
 * with its entity, following its group's leader (a new group gets a mission
 * start and a one-second timer that sends it along its route). A unit or
 * group taken off the board is taken out with its entity, and with the
 * waypoints and commands that were only for it; links to them are dropped.
 *
 * **New.** A minimal mission on a map (the levels folder's name of it, as
 * `landscape_moscow_w`): its options, the countries of both coalitions, and
 * the plan's groups.
 *
 * IL-2 gives units their tasks through command MCUs linked from waypoints;
 * the commands a mission has stay as they are, and a task the board adds is
 * listed as one to give in the mission editor.
 */

import { alignRoute, type ExportWarning, type MissionExportSummary } from './dcsWrite';
import { applyEdits, type TextEdit } from './luaWrite';
import {
  il2At,
  il2Coalitions,
  il2CountryOf,
  il2Figure,
  il2Fixed,
  il2Game,
  il2Groups,
  il2List,
  il2MapName,
  il2Num,
  il2Objects,
  il2Param,
  il2Str,
  il2Text,
  il2Child,
  il2Type,
  IL2_UNITS,
  parseIl2,
  readIl2Mission,
  type Il2Block,
} from './il2';
import type { MissionGroup, MissionState, MissionWaypoint, UnitCategory } from './index';

/** Script and model of IL-2 units by type, for new units (the game's own names; planes follow one pattern). */
const VEHICLES: Record<string, string> = {
  't34-76stz': 'vehicles\\t34-76stz\\t34-76stz',
  't34-76-43': 'vehicles\\t34-76-43\\t34-76-43',
  'kv1-s': 'vehicles\\kv1-s\\kv1-s',
  bt7m: 'vehicles\\bt7m\\bt7m',
  'pziii-l': 'vehicles\\pziii-l\\pziii-l',
  'pziv-g': 'vehicles\\pziv-g\\pziv-g',
  pz38t: 'vehicles\\pz38t\\pz38t',
  ba64: 'vehicles\\ba64\\ba64',
  ba10m: 'vehicles\\ba10m\\ba10m',
  'sdkfz251-1c': 'vehicles\\sdkfz251\\sdkfz251-1c',
  'sdkfz10-flak38': 'vehicles\\sdkfz10-flak38\\sdkfz10-flak38',
  'gaz-aa': 'vehicles\\gaz\\gaz-aa',
  'gaz-m': 'vehicles\\gaz\\gaz-m',
  'gaz-aa-m4-aa': 'vehicles\\gaz\\gaz-aa-m4-aa',
  'zis5-72k': 'vehicles\\zis\\zis5-72k',
  bm13: 'vehicles\\zis\\bm13',
  'ford-g917': 'vehicles\\ford\\ford-g917',
  horch830: 'vehicles\\horch\\horch830',
  pak40: 'artillery\\pak40\\pak40',
  zis3gun: 'artillery\\zis3gun\\zis3gun',
  lefh18: 'artillery\\lefh18\\lefh18',
  m30: 'artillery\\m30\\m30',
  flak36: 'artillery\\flak36\\flak36',
  flak37: 'artillery\\flak37\\flak37',
  flak38: 'artillery\\flak38\\flak38',
  '52k': 'artillery\\52k\\52k',
  '61k': 'artillery\\61k\\61k',
  'mg34-aa': 'artillery\\mg34-aa\\mg34-aa',
  'dshk-aa': 'artillery\\dshk-aa\\dshk-aa',
  'maksim4-aa': 'artillery\\maksim4-aa\\maksim4-aa',
};
const PLANES = [
  'yak1s69', 'yak1s127', 'yak7bs36', 'yak9s1', 'yak3s9', 'lagg3s29', 'la5s8', 'la5fns2', 'mig3s24', 'i16t24', 'i153', 'il2m42', 'il2m43', 'pe2s87', 'u2vs', 'li2',
  'bf109e7', 'bf109f4', 'bf109g2', 'bf109g6', 'bf109g14', 'bf109k4', 'fw190a3', 'fw190a5', 'fw190a8', 'fw190d9', 'ta152h1', 'ju87d3', 'he111h6', 'he111h16', 'ju88a4', 'bf110e2', 'bf110g2', 'hs129b2', 'ju523mg4e', 'me262a', 'ar234b2', 'me410a1', 'mc202s8',
  'spitfiremkvb', 'spitfiremkixe', 'spitfiremkxiv', 'typhoonmkib', 'tempestmkvs2', 'mosquitofbmkvis2', 'p39l1', 'p40e1', 'p47d28', 'p51d15', 'p38j25', 'a20b', 'b25draf', 'c47a',
  'sopcamel', 'se5a', 'spad13', 'fokkerd7', 'fokkerdr1', 'albatrosd5',
];
const SHIPS = ['torpboatg5s11b', 'landboata', 'subtype2b', 'largecargoshiptype1', 'largetankershiptype1'];

/** A type's script and model paths. */
function pathsOf(type: string, c: UnitCategory, known: Map<string, { script: string; model: string }>): { script: string; model: string } {
  const own = known.get(type.toLowerCase());
  if (own) return own;
  if (c === 'air' || c === 'heli') return { script: `LuaScripts\\WorldObjects\\Planes\\${type}.txt`, model: `graphics\\planes\\${type}\\${type}.mgm` };
  if (c === 'sea') return { script: `LuaScripts\\WorldObjects\\Ships\\${type}.txt`, model: `graphics\\ships\\${type}\\${type}.mgm` };
  const v = VEHICLES[type.replace(/^_+/, '')] ?? `vehicles\\${type}\\${type}`;
  return { script: `LuaScripts\\WorldObjects\\vehicles\\${type}.txt`, model: `graphics\\${v}.mgm` };
}

let byFigure: Map<string, string> | null = null;
/** An IL-2 type for a figure: one the game names it by, else one of its kind of unit for its side. */
export function il2TypeFor(kind: string, c: UnitCategory, side: string): { type: string; guessed: boolean } {
  if (!byFigure) {
    byFigure = new Map();
    const add = (type: string, cat: UnitCategory, model: string) => {
      const f = il2Figure(type, model, cat);
      if (f && !byFigure!.has(f)) byFigure!.set(f, type);
    };
    for (const p of PLANES) add(p, 'air', `graphics\\planes\\${p}\\${p}.mgm`);
    for (const [t, v] of Object.entries(VEHICLES)) add(t, 'ground', `graphics\\${v}.mgm`);
    for (const s of SHIPS) add(s, 'sea', `graphics\\ships\\${s}\\${s}.mgm`);
  }
  const own = byFigure.get(kind);
  if (own) return { type: own, guessed: false };
  const red = side === 'red';
  const type = c === 'air' || c === 'heli' ? (red ? 'bf109f4' : 'yak1s69') : c === 'sea' ? (red ? 'torpboatg5s11b' : 'subtypesh10') : red ? 'pziii-l' : 't34-76stz';
  return { type, guessed: true };
}

const flat = (a: { x: number; z: number }, b: { x: number; z: number }) => Math.hypot(a.x - b.x, a.z - b.z);
const angle = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
const isAir = (c: UnitCategory) => c === 'air' || c === 'heli';
const degrees = (yaw: number) => ((((yaw * 180) / Math.PI) % 360) + 360) % 360;

interface Fresh {
  index: number;
  head: string;
  lines: string[];
  targets: number[];
  objects: number[];
}

class Il2Patch {
  readonly edits: TextEdit[] = [];
  readonly warnings: ExportWarning[] = [];
  readonly nl: string;
  next: number;
  /** Targets lists as they are now, where changed (old blocks and new). */
  readonly targets = new Map<number, number[]>();
  readonly objects = new Map<number, number[]>();
  readonly removed = new Set<number>();
  readonly fresh: Fresh[] = [];
  readonly known = new Map<string, { script: string; model: string }>();
  /** How many changes so far: a group whose patch adds none is left as it was. */
  dirty = 0;
  private readonly parsed = new Map<number, number[]>();
  constructor(
    readonly text: string,
    readonly byIndex: Map<number, Il2Block>,
  ) {
    this.nl = text.includes('\r\n') ? '\r\n' : '\n';
    this.next = Math.max(0, ...byIndex.keys()) + 1;
  }
  replace(start: number, end: number, text: string) {
    this.edits.push({ start, end, text });
  }
  /** A parameter's value, replaced where it differs. */
  set(b: Il2Block, name: string, value: string) {
    const p = il2Param(b, name);
    if (!p) return;
    if (this.text.slice(p.valueStart, p.valueEnd) !== value) {
      this.replace(p.valueStart, p.valueEnd, value);
      this.dirty++;
    }
  }
  targetsOf(i: number): number[] {
    const own = this.targets.get(i) ?? this.fresh.find((f) => f.index === i)?.targets;
    if (own) return own;
    let t = this.parsed.get(i);
    if (!t) {
      t = il2List(this.byIndex.get(i), 'Targets');
      this.parsed.set(i, t);
    }
    return t;
  }
  setTargets(i: number, t: number[]) {
    this.dirty++;
    const f = this.fresh.find((x) => x.index === i);
    if (f) f.targets = t;
    else this.targets.set(i, t);
  }
  /** Every block (old and new) whose Targets name `i`. */
  leadingTo(i: number): number[] {
    const out: number[] = [];
    for (const k of this.byIndex.keys()) if (!this.removed.has(k) && this.targetsOf(k).includes(i)) out.push(k);
    for (const f of this.fresh) if (f.targets.includes(i)) out.push(f.index);
    return out;
  }
  /** Whether `goal` is reached from `from` through logic (timers, counters, triggers), as the links are now. */
  reaches(from: number, goal: number): boolean {
    const seen = new Set<number>();
    let front = [from];
    for (let d = 0; d < 8 && front.length; d++) {
      const next: number[] = [];
      for (const i of front) {
        if (i === goal) return true;
        if (seen.has(i)) continue;
        seen.add(i);
        const b = this.byIndex.get(i);
        if (b && (b.name === 'MCU_Waypoint' || b.name.startsWith('MCU_CMD_') || !b.name.startsWith('MCU_'))) continue;
        next.push(...this.targetsOf(i));
      }
      front = next;
    }
    return false;
  }
  /** A block taken out; links to it dropped (or, spliced, passed on to what it led to). */
  remove(i: number, splice = false) {
    if (this.removed.has(i) || !this.byIndex.has(i)) return;
    if (splice) {
      const on = this.targetsOf(i).filter((t) => t !== i);
      for (const k of this.leadingTo(i)) this.setTargets(k, [...new Set(this.targetsOf(k).flatMap((t) => (t === i ? on.filter((x) => x !== k) : [t])))]);
    }
    this.removed.add(i);
    this.dirty++;
  }
  block(head: string, lines: string[], targets: number[] | null, objects: number[] | null): number {
    const index = this.next++;
    this.dirty++;
    this.fresh.push({ index, head, lines, targets: targets ?? [], objects: objects ?? [] });
    return index;
  }
}

const pos = (g: { x: number; y: number; z: number }) => [`XPos = ${il2Fixed(g.x)};`, `YPos = ${il2Fixed(g.y)};`, `ZPos = ${il2Fixed(g.z)};`];
const ori = (deg = 0) => [`XOri = 0.00;`, `YOri = ${il2Fixed(deg, 2)};`, `ZOri = 0.00;`];

/** A new unit (object and entity); returns its entity's index. */
function newUnit(p: Il2Patch, u: MissionGroup['units'][number], g: MissionGroup, leadEntity: number | null, slot: number, coalitions: Map<number, number>): number | null {
  const c = u.category === 'infantry' || u.category === 'static' ? null : u.category;
  if (!c) return null;
  let type = u.type && p.known.has(u.type.toLowerCase()) ? u.type : '';
  if (!type) {
    const t = il2TypeFor(u.figure ?? '', c, g.side);
    type = t.type;
    if (t.guessed) p.warnings.push({ code: 'type-guess', what: `${u.name} → ${type}` });
  }
  const { script, model } = pathsOf(type, c, p.known);
  const g0 = il2Game(u.at);
  const obj = p.next++;
  const entity = p.next++;
  const country = Number(g.country) || il2CountryOf(g.side, coalitions);
  const common = [`Name = ${il2Text(u.name || type)};`, `LinkTrId = ${entity};`, ...pos(g0), ...ori(degrees(u.yaw)), `Script = ${il2Text(script)};`, `Model = ${il2Text(model)};`];
  const head = isAir(c) ? 'Plane' : c === 'sea' ? 'Ship' : 'Vehicle';
  const rest = isAir(c)
    ? [`Country = ${country};`, 'Desc = "";', 'Skin = "";', 'AILevel = 2;', 'CoopStart = 0;', `NumberInFormation = ${slot};`, 'Vulnerable = 1;', 'Engageable = 1;', 'LimitAmmo = 1;', 'StartInAir = 0;', 'Callsign = 0;', 'Callnum = 0;', 'Time = 60;', 'DamageReport = 50;', 'DamageThreshold = 1;', 'PayloadId = 0;', 'WMMask = 1;', 'AiRTBDecision = 1;', 'DeleteAfterDeath = 1;', 'Spotter = -1;', 'Fuel = 1;']
    : ['Desc = "";', `Country = ${country};`, ...(c === 'sea' ? [] : [`NumberInFormation = ${slot};`]), 'Vulnerable = 1;', 'Engageable = 1;', 'LimitAmmo = 1;', 'AILevel = 2;', 'DamageReport = 50;', 'DamageThreshold = 1;', 'DeleteAfterDeath = 1;', 'CoopStart = 0;', 'Spotter = -1;', 'BeaconChannel = 0;', 'Callsign = 0;'];
  p.dirty++;
  p.fresh.push({ index: obj, head, lines: [...common, ...rest], targets: [], objects: [] });
  p.fresh.push({
    index: entity,
    head: 'MCU_TR_Entity',
    lines: [`Name = ${il2Text(`${head} entity`)};`, 'Desc = "";', '@Targets', '@Objects', ...pos({ ...g0, y: g0.y + 0.2 }), ...ori(), 'Enabled = 1;', `MisObjID = ${obj};`],
    targets: leadEntity !== null ? [leadEntity] : [],
    objects: [],
  });
  return entity;
}

/** A new waypoint for a group's entity. */
function newWaypoint(p: Il2Patch, w: MissionWaypoint, y: number, entity: number, c: UnitCategory): number {
  const kmh = Math.round((w.speed ?? (isAir(c) ? 300 / 3.6 : 20 / 3.6)) * 3.6);
  return p.block('MCU_Waypoint', ['Name = "Waypoint";', 'Desc = "";', '@Targets', '@Objects', ...pos(il2Game({ ...w.at, y })), ...ori(), `Area = ${isAir(c) ? 500 : 50};`, `Speed = ${kmh};`, 'Priority = 1;'], [], [entity]);
}

/** Heights of an aircraft's new waypoints drawn on the ground: the height before them. */
function lifted(route: MissionWaypoint[], isNew: (i: number) => boolean, c: UnitCategory, warn: (n: number) => void): number[] {
  let last = 1000;
  let n = 0;
  const out = route.map((w, i) => {
    if (isAir(c) && isNew(i) && w.onGround) {
      n++;
      return last;
    }
    if (!w.onGround && w.at.y > 30) last = w.at.y;
    return w.at.y;
  });
  if (n) warn(n);
  return out;
}

/** A start for a new route: the mission's beginning, a second's wait, the first waypoint. */
function startRoute(p: Il2Patch, at: { x: number; y: number; z: number }, first: number) {
  const g = il2Game(at);
  const timer = p.block('MCU_Timer', ['Name = "1s";', 'Desc = "";', '@Targets', '@Objects', ...pos({ ...g, x: g.x + 40 }), ...ori(), 'Time = 1;', 'Random = 100;'], [first], []);
  p.block('MCU_TR_MissionBegin', ['Name = "Mission Begin";', 'Desc = "";', '@Targets', '@Objects', ...pos({ ...g, x: g.x + 80 }), ...ori(), 'Enabled = 1;'], [timer], []);
}

/** Links a new waypoint in after `prev` (a waypoint's index, null for the start), before the old `next` when there is one. */
function linkIn(p: Il2Patch, n: number, prev: number | null, next: number | undefined, at: { x: number; y: number; z: number }) {
  if (prev === null) {
    const into = next !== undefined ? p.leadingTo(next).filter((k) => k !== n) : [];
    if (next !== undefined && into.length) {
      for (const k of into) p.setTargets(k, p.targetsOf(k).map((t) => (t === next ? n : t)));
      p.setTargets(n, [next]);
    } else {
      if (next !== undefined) p.setTargets(n, [next]);
      startRoute(p, at, n);
    }
    return;
  }
  const out = p.targetsOf(prev);
  const on = next !== undefined ? out.filter((t) => p.reaches(t, next)) : [];
  p.setTargets(n, on);
  p.setTargets(prev, [...out.filter((t) => !on.includes(t)), n]);
}

function patchGroup(p: Il2Patch, g: MissionGroup, old: { units: { block: Il2Block; index: number; entity: number }[]; waypoints: Il2Block[] }, coalitions: Map<number, number>, oldTasks: Set<string>): boolean {
  const before = p.dirty;
  const kept = new Set(g.units.map((u) => u.ref).filter(Boolean));
  const oldLead = old.units[0];
  // Units taken off the board; a lead taken off hands its place to the first that stays.
  const gone = old.units.filter((u) => !kept.has(String(u.index)));
  const byRef = new Map(old.units.map((u) => [String(u.index), u]));
  const newLead = g.units.map((u) => (u.ref ? byRef.get(u.ref) : undefined)).find(Boolean);
  let leadEntity = newLead?.entity || null;
  for (const u of gone) {
    p.remove(u.index);
    if (u.entity) p.remove(u.entity);
  }
  if (gone.includes(oldLead) && oldLead.entity && leadEntity) {
    const swap = (l: number[]) => l.map((x) => (x === oldLead.entity ? leadEntity! : x)).filter((x, i, a) => a.indexOf(x) === i);
    for (const k of p.byIndex.keys()) {
      if (p.removed.has(k)) continue;
      const t = p.targetsOf(k);
      if (t.includes(oldLead.entity)) p.setTargets(k, k === leadEntity ? t.filter((x) => x !== oldLead.entity) : swap(t));
      const b = p.byIndex.get(k)!;
      const o = p.objects.get(k) ?? il2List(b, 'Objects');
      if (o.includes(oldLead.entity)) {
        p.objects.set(k, swap(o));
        p.dirty++;
      }
    }
  }
  // Units: moved, turned, retyped, new.
  g.units.forEach((u, slot) => {
    const o = u.ref ? byRef.get(u.ref) : undefined;
    if (!o) {
      const e = newUnit(p, u, g, leadEntity, slot, coalitions);
      if (e === null) p.warnings.push({ code: 'static', group: g.name });
      else leadEntity ??= e;
      return;
    }
    const was = il2At(o.block);
    const want = u.at;
    if (flat(was, want) > 0.5 || Math.abs(was.y - want.y) > 0.5) {
      const gp = il2Game(want);
      p.set(o.block, 'XPos', il2Fixed(gp.x));
      p.set(o.block, 'YPos', il2Fixed(gp.y));
      p.set(o.block, 'ZPos', il2Fixed(gp.z));
      const e = o.entity ? p.byIndex.get(o.entity) : undefined;
      if (e) {
        p.set(e, 'XPos', il2Fixed(gp.x));
        p.set(e, 'YPos', il2Fixed(gp.y + (il2Num(e, 'YPos') - il2Num(o.block, 'YPos'))));
        p.set(e, 'ZPos', il2Fixed(gp.z));
      }
    }
    if (angle((il2Num(o.block, 'YOri') * Math.PI) / 180, u.yaw) > 0.003) p.set(o.block, 'YOri', il2Fixed(degrees(u.yaw), 2));
    if (!u.type) p.warnings.push({ code: 'il2-type', group: g.name, what: u.name });
  });
  // Tasks the mission does not have.
  for (const t of g.route.flatMap((w) => w.tasks ?? [])) if (!oldTasks.has(t.name)) p.warnings.push({ code: 'il2-task', group: g.name, what: t.name });
  // The route.
  const route = g.route.length ? g.route : [{ at: g.units[0]?.at ?? il2At(oldLead.block) }];
  const oldAt = [il2At(oldLead.block), ...old.waypoints.map(il2At)];
  const m = alignRoute(
    route.map((w) => w.at),
    oldAt,
  );
  const c = g.category;
  const alts = lifted(route, (i) => m[i] < 0, c, (n) => p.warnings.push({ code: 'ground', group: g.name, n }));
  const movedAt = route.map((w, i) => m[i] < 0 || (i > 0 && (flat(w.at, oldAt[m[i]]) > 0.5 || Math.abs(alts[i] - oldAt[m[i]].y) > 0.5)));
  route.forEach((w, i) => {
    if (i === 0 || m[i] <= 0) return;
    const b = old.waypoints[m[i] - 1];
    if (movedAt[i]) {
      const gp = il2Game({ ...w.at, y: alts[i] });
      p.set(b, 'XPos', il2Fixed(gp.x));
      p.set(b, 'YPos', il2Fixed(gp.y));
      p.set(b, 'ZPos', il2Fixed(gp.z));
    }
    const kmh = w.speed !== undefined ? Math.round(w.speed * 3.6) : null;
    if (kmh !== null && kmh > 0 && (movedAt[i] || movedAt[i - 1]) && Math.abs(il2Num(b, 'Speed') - kmh) > 1) p.set(b, 'Speed', String(kmh));
  });
  const keptOld = new Set(m.filter((j) => j > 0));
  old.waypoints.forEach((b, j) => {
    if (!keptOld.has(j + 1)) p.remove(il2Num(b, 'Index'), true);
  });
  if (m.some((j, i) => i > 0 && j < 0)) {
    if (!leadEntity) p.warnings.push({ code: 'il2-no-entity', group: g.name });
    else {
      let prev: number | null = null;
      route.forEach((w, i) => {
        if (i === 0) return;
        if (m[i] > 0) {
          prev = il2Num(old.waypoints[m[i] - 1], 'Index');
          return;
        }
        const nextJ = m.slice(i + 1).find((j) => j > 0);
        const next = nextJ !== undefined ? il2Num(old.waypoints[nextJ - 1], 'Index') : undefined;
        const n = newWaypoint(p, w, alts[i], leadEntity!, c);
        linkIn(p, n, prev, next, route[0].at);
        prev = n;
      });
    }
  }
  return p.dirty !== before;
}

function newGroup(p: Il2Patch, g: MissionGroup, coalitions: Map<number, number>): boolean {
  let lead: number | null = null;
  g.units.forEach((u, slot) => {
    const e = newUnit(p, u, g, lead, slot, coalitions);
    lead ??= e;
  });
  if (lead === null) {
    p.warnings.push({ code: 'static', group: g.name });
    return false;
  }
  for (const t of g.route.flatMap((w) => w.tasks ?? [])) p.warnings.push({ code: 'il2-task', group: g.name, what: t.name });
  const route = g.route;
  const alts = lifted(route, () => true, g.category, (n) => p.warnings.push({ code: 'ground', group: g.name, n }));
  let prev: number | null = null;
  for (let i = 1; i < route.length; i++) {
    const n = newWaypoint(p, route[i], alts[i], lead, g.category);
    if (prev === null) startRoute(p, route[0].at, n);
    else p.setTargets(prev, [...p.targetsOf(prev), n]);
    prev = n;
  }
  if (isAir(g.category)) p.warnings.push({ code: 'new-air', group: g.name });
  return true;
}

/** The text with the patch's changes made: values, links, blocks taken out and the new ones before the end. */
function finish(p: Il2Patch, text: string): string {
  const list = (l: number[]) => `[${l.join(',')}]`;
  // Blocks taken out, each with the blank lines after it.
  const cuts: [number, number][] = [];
  for (const i of p.removed) {
    const b = p.byIndex.get(i)!;
    const ls = text.lastIndexOf('\n', b.start - 1) + 1;
    let e = b.end;
    while (text.startsWith(p.nl, e) || text.startsWith('\n', e)) e += text.startsWith(p.nl, e) ? p.nl.length : 1;
    cuts.push([ls, e]);
  }
  const inCut = (at: number) => cuts.some(([s, e]) => at >= s && at < e);
  for (const e of p.edits.splice(0)) if (!inCut(e.start)) p.edits.push(e);
  for (const [s, e] of cuts) p.replace(s, e, '');
  // Links: Targets and Objects lists, without what was taken out.
  for (const [i, b] of p.byIndex) {
    if (p.removed.has(i) || inCut(b.start)) continue;
    for (const [key, now] of [
      ['Targets', p.targets.get(i)],
      ['Objects', p.objects.get(i)],
    ] as const) {
      const was = il2List(b, key);
      const want = (now ?? was).filter((x) => !p.removed.has(x));
      if (want.length !== was.length || want.some((x, k) => x !== was[k])) p.set(b, key, list(want));
    }
  }
  if (p.fresh.length) {
    const nl = p.nl;
    const body = p.fresh
      .map((f) => {
        const lines = [`Index = ${f.index};`, ...f.lines].map((l) => (l === '@Targets' ? `Targets = ${list(f.targets.filter((x) => !p.removed.has(x)))};` : l === '@Objects' ? `Objects = ${list(f.objects)};` : l));
        // The editor writes the index after the name for objects, first for MCUs.
        if (!f.head.startsWith('MCU_')) lines.splice(0, 2, lines[1], lines[0]);
        return `${f.head}${nl}{${nl}${lines.map((l) => `  ${l}${nl}`).join('')}}${nl}${nl}${nl}${nl}`;
      })
      .join('');
    const end = text.lastIndexOf('# end of file');
    const at = end >= 0 ? end : text.length;
    const pad = at > 0 && !text.slice(0, at).endsWith(nl) ? nl : '';
    p.replace(at, at, pad + body);
  }
  return applyEdits(text, p.edits);
}

/** The mission's text with the plan's changes made (`MissionState` from `planToMission`). */
export function patchIl2MissionText(text: string, m: MissionState): { text: string; summary: MissionExportSummary } {
  const root = parseIl2(text);
  const { groups: old, byIndex } = il2Groups(root);
  const p = new Il2Patch(text, byIndex);
  for (const b of il2Objects(root, (c) => IL2_UNITS.has(c.name))) {
    const script = il2Str(b, 'Script');
    const model = il2Str(b, 'Model');
    if (script && model) p.known.set(il2Type(script, model).toLowerCase(), { script, model });
  }
  const coalitions = il2Coalitions(root);
  const byRef = new Map(old.map((g) => [String(g.units[0].index), g]));
  // The tasks each group came in with, by name.
  const tasksOf = new Map<string, Set<string>>();
  for (const g of readIl2Mission(text, 'mission').groups) tasksOf.set(g.ref ?? '', new Set(g.route.flatMap((w) => w.tasks ?? []).map((t) => t.name)));
  const map = il2MapName(il2Child(root, 'Options'));
  const summary: MissionExportSummary = { mode: 'patch', map, groups: 0, units: 0, waypoints: 0, changed: [], added: [], removed: [], untouched: 0, warnings: p.warnings };
  const fresh: MissionGroup[] = [];
  for (const g of m.groups) {
    summary.groups++;
    summary.units += g.units.length;
    summary.waypoints += g.route.length;
    const o = g.ref ? byRef.get(g.ref) : undefined;
    if (!o) fresh.push(g);
    else if (patchGroup(p, g, o, coalitions, tasksOf.get(g.ref!) ?? new Set())) summary.changed.push(g.name);
  }
  for (const ref of m.removed ?? []) {
    const o = byRef.get(ref);
    if (!o) continue;
    const entities = new Set(o.units.map((u) => u.entity).filter(Boolean));
    for (const u of o.units) {
      p.remove(u.index);
      if (u.entity) p.remove(u.entity);
    }
    // Waypoints and commands for this group alone.
    for (const [i, b] of byIndex) {
      if (!b.name.startsWith('MCU_')) continue;
      const objs = il2List(b, 'Objects');
      if (objs.length && objs.every((x) => entities.has(x)) && (b.name === 'MCU_Waypoint' || b.name.startsWith('MCU_CMD_'))) p.remove(i);
    }
    summary.removed.push(il2Str(o.units[0].block, 'Name') || ref);
  }
  if (summary.removed.length) p.warnings.push({ code: 'removed', n: summary.removed.length });
  summary.untouched = byRef.size - summary.changed.length - summary.removed.length;
  for (const g of fresh) if (newGroup(p, g, coalitions)) summary.added.push(g.name);
  return { text: finish(p, text), summary };
}

/** What season a map is in, by its name's end (`_w` winter, `_su` summer ...). */
function seasonOf(map: string): { prefix: string; folder: string } {
  const s = map.toLowerCase();
  if (/(_w|_wi|winter)(_|$)/.test(s)) return { prefix: 'wi', folder: 'winter' };
  if (/(_a|_au|autumn)(_|$)/.test(s)) return { prefix: 'au', folder: 'autumn' };
  if (/(_sp|spring)(_|$)/.test(s)) return { prefix: 'sp', folder: 'spring' };
  return { prefix: 'su', folder: 'summer' };
}

/** A minimal mission on a map (the levels folder's name of it), with the plan's groups (all new). */
export function newIl2MissionText(map: string, m: MissionState): { text: string; summary: MissionExportSummary } {
  const nl = '\r\n';
  const info = m.info;
  const start = info?.start ?? 12 * 3600;
  const date = info?.date ?? { year: 1942, month: 8, day: 25 };
  const season = seasonOf(map);
  const folder = map.replace(/^IL-2:\s*/i, '');
  const options = [
    'LCName = 0;',
    'LCDesc = 1;',
    'LCAuthor = 2;',
    'PlayerConfig = "";',
    `Time = ${Math.floor(start / 3600) % 24}:${Math.floor((start % 3600) / 60)}:${Math.floor(start % 60)};`,
    `Date = ${date.day}.${date.month}.${date.year};`,
    `HMap = ${il2Text(`graphics\\${folder}\\height.hini`)};`,
    `Textures = ${il2Text(`graphics\\${folder}\\textures.tini`)};`,
    `Forests = ${il2Text(`graphics\\${folder}\\trees\\woods.wds`)};`,
    'Layers = "";',
    `GuiMap = ${il2Text(folder.replace(/^landscape_/i, '').toLowerCase())};`,
    `SeasonPrefix = "${season.prefix}";`,
    'MissionType = 0;',
    'AqmId = 0;',
    `CloudLevel = ${Math.round(info?.weather?.cloudBase ?? 1000)};`,
    'CloudHeight = 500;',
    'PrecLevel = 0;',
    'PrecType = 0;',
    `CloudConfig = ${il2Text(`${season.folder}\\01_Light_00\\sky.ini`)};`,
    'SeaState = 0;',
    'Turbulence = 0;',
    'TempPressLevel = 0;',
    `Temperature = ${Math.round(info?.weather?.temperature ?? 15)};`,
    'Pressure = 760;',
    'Haze = 0;',
    'LayerFog = 0;',
  ];
  const text = [
    '# Mission File Version = 1.0;',
    '',
    'Options',
    '{',
    ...options.map((l) => `  ${l}`),
    '  WindLayers',
    '  {',
    ...[0, 500, 1000, 2000, 5000].map((h) => `    ${h} :     0 :     0;`),
    '  }',
    '  Countries',
    '  {',
    ...['0 : 0', '101 : 1', '102 : 1', '103 : 1', '201 : 2', '202 : 2', '203 : 2'].map((r) => `    ${r};`),
    '  }',
    '}',
    '',
    '',
    '',
    '# end of file',
  ].join(nl);
  const plain: MissionState = { ...m, groups: m.groups.map((g) => ({ ...g, ref: undefined, country: undefined, units: g.units.map((u) => ({ ...u, ref: undefined })) })), removed: [] };
  const r = patchIl2MissionText(text, plain);
  r.summary.warnings.push({ code: 'il2-new' });
  return { text: r.text, summary: { ...r.summary, mode: 'new', map: folder } };
}

/** The mission for a plan: `original` patched when given, else a new mission on `map`. */
export function writeIl2Mission(m: MissionState, original: Uint8Array | null, map?: string): { bytes: Uint8Array; summary: MissionExportSummary } {
  const enc = new TextEncoder();
  if (original) {
    const text = new TextDecoder('utf-8').decode(original);
    const r = patchIl2MissionText(text, m);
    return { bytes: r.text === text ? original : enc.encode(r.text), summary: r.summary };
  }
  const name = (map || m.map).replace(/^IL-2:\s*/i, '').trim();
  if (!name) throw new Error('a new mission needs a map');
  const r = newIl2MissionText(name, m);
  return { bytes: enc.encode(r.text), summary: r.summary };
}

