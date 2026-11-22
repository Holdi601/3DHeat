/**
 * A plan written back as an Arma Reforger layer (the Workbench's text form):
 * the layer it was made from, patched, or a new layer for a world.
 *
 * **Patch.** Each entity the board left as it was stays byte for byte, and a
 * plan with no change gives the very same file. A unit moved or turned gets
 * new `coords` and a new heading (`angleY`, or the middle of `angles`), in
 * its parent's frame where it is a child entity. A group's waypoints that
 * moved get new `coords`; one given another task gets that task's waypoint
 * prefab; waypoints added become new waypoint entities and the group's
 * `m_aStaticWaypoints` lists them in the route's order; a waypoint taken off
 * the route leaves the list, and leaves the file when no other group names
 * it. A figure no entity holds becomes a new group (people) or a vehicle; an
 * entity whose figure was taken off the board is taken out, with the
 * waypoints only it used. Everything else - components, game mode, Scenario
 * Framework logic - stays as it was.
 *
 * **New.** A layer of the plan's groups and vehicles and their waypoints, to
 * add to a scenario of the world in the Workbench.
 *
 * Reforger gives a group one waypoint prefab per waypoint: the board's tasks
 * map to Search and Destroy (a sweep), Attack, Defend (defend, guard, block,
 * secure), Wait (a hold), Cycle (a patrol), Follow, Suppress, Observation
 * Post (overwatch) and Scout (recon, screen); weapons and alarm states and
 * other tasks are listed as warnings.
 */

import { enfBlockText, enfChild, enfEol, enfHead, enfIndent, enfIndentUnit, enfItems, enfLine, enfNumber, enfQuote, parseEnfusion, type EnfNode, type EnfOut } from './enfusionText';
import { componentOf, prefabPath, rfEntities, rfHeading, rfWorld, slotWaypoints, turnOffset, waypointType, type RfEntity } from './reforger';
import { applyEdits, takeSpan, type TextEdit } from './luaWrite';
import { alignRoute, type ExportWarning, type MissionExportSummary } from './dcsWrite';
import type { MissionGroup, MissionState, MissionTask, MissionWaypoint, UnitCategory } from './index';
import type { TaskKind } from '../tasks';
import type { Vec3 } from '../plan';

/** Stock waypoint prefabs, by type: the class their entity is written with and the prefab. */
export const RF_WAYPOINTS: Record<string, { cls: string; prefab: string }> = {
  Move: { cls: 'SCR_AIWaypoint', prefab: '{750A8D1695BD6998}Prefabs/AI/Waypoints/AIWaypoint_Move.et' },
  Patrol: { cls: 'SCR_AIWaypoint', prefab: '{22A875E30470BD4F}Prefabs/AI/Waypoints/AIWaypoint_Patrol.et' },
  SearchAndDestroy: { cls: 'SCR_SearchAndDestroyWaypoint', prefab: '{B3E7B8DC2BAB8ACC}Prefabs/AI/Waypoints/AIWaypoint_SearchAndDestroy.et' },
  Attack: { cls: 'SCR_EntityWaypoint', prefab: '{1B0E3436C30FA211}Prefabs/AI/Waypoints/AIWaypoint_Attack.et' },
  Defend: { cls: 'SCR_DefendWaypoint', prefab: '{93291E72AC23930F}Prefabs/AI/Waypoints/AIWaypoint_Defend.et' },
  Wait: { cls: 'SCR_TimedWaypoint', prefab: '{531EC45063C1F57B}Prefabs/AI/Waypoints/AIWaypoint_Wait.et' },
  Cycle: { cls: 'AIWaypointCycle', prefab: '{35BD6541CBB8AC08}Prefabs/AI/Waypoints/AIWaypoint_Cycle.et' },
  Follow: { cls: 'SCR_EntityWaypoint', prefab: '{A0509D3C4DD4475E}Prefabs/AI/Waypoints/AIWaypoint_Follow.et' },
  Suppress: { cls: 'SCR_SuppressWaypoint', prefab: '{ED8277F35B46B4AA}Prefabs/AI/Waypoints/AIWaypoint_Suppress.et' },
  ObservationPost: { cls: 'SCR_SmartActionWaypoint', prefab: '{97FB527ECC7CA49E}Prefabs/AI/Waypoints/AIWaypoint_ObservationPost.et' },
  Scout: { cls: 'SCR_TimedWaypoint', prefab: '{A88F0B6CF25BD1DE}Prefabs/AI/Waypoints/AIWaypoint_Scout.et' },
  GetIn: { cls: 'SCR_BoardingEntityWaypoint', prefab: '{712F4795CF8B91C7}Prefabs/AI/Waypoints/AIWaypoint_GetIn.et' },
  GetOut: { cls: 'SCR_BoardingWaypoint', prefab: '{C40316EE26846CAB}Prefabs/AI/Waypoints/AIWaypoint_GetOut.et' },
};

/** The waypoint type a board task is written as. */
const TYPE_OF_KIND: Partial<Record<TaskKind, string>> = {
  sweep: 'SearchAndDestroy',
  attack: 'Attack',
  defend: 'Defend',
  guard: 'Defend',
  block: 'Defend',
  secure: 'Defend',
  hold: 'Wait',
  patrol: 'Cycle',
  follow: 'Follow',
  escort: 'Follow',
  suppress: 'Suppress',
  overwatch: 'ObservationPost',
  recon: 'Scout',
  screen: 'Scout',
};
/** Types that read as the same board task, so one is not rewritten as another of its kind (Defend_Large stays). */
const KIND_OF_TYPE: [RegExp, string][] = [
  [/^(move|forcedmove)$/i, 'move'],
  [/^searchanddestroy/i, 'sweep'],
  [/^attack/i, 'attack'],
  [/^defend/i, 'defend'],
  [/^(wait|atease|loiter)/i, 'hold'],
  [/^cycle/i, 'patrol'],
  [/^follow/i, 'follow'],
  [/^suppress/i, 'suppress'],
  [/^observationpost/i, 'overwatch'],
  [/^scout/i, 'recon'],
];
const keyOfType = (type: string) => {
  const k = KIND_OF_TYPE.find(([re]) => re.test(type))?.[1];
  return k ? `k:${k}` : `n:${type.toLowerCase()}`;
};
const KEY_OF_KIND: Partial<Record<TaskKind, string>> = { guard: 'defend', block: 'defend', secure: 'defend', escort: 'follow', screen: 'recon' };

/** Stock groups and vehicles for new figures, by side and kind. */
const GROUPS: Record<string, string> = {
  blufor: '{84E5BBAB25EA23E5}Prefabs/Groups/BLUFOR/Group_US_FireTeam.et',
  opfor: '{30ED11AA4F0D41E5}Prefabs/Groups/OPFOR/Group_USSR_FireGroup.et',
  indep: '{5BEA04939D148B1D}Prefabs/Groups/INDFOR/Group_FIA_FireTeam.et',
};
const SNIPERS: Record<string, string> = { blufor: '{D807C7047E818488}Prefabs/Groups/BLUFOR/Group_US_SniperTeam.et' };
const VEHICLES: Record<string, Record<string, string>> = {
  jeep: { blufor: '{F649585ABB3706C4}Prefabs/Vehicles/Wheeled/M151A2/M151A2.et', opfor: '{259EE7B78C51B624}Prefabs/Vehicles/Wheeled/UAZ469/UAZ469.et', indep: '{F7E9AA0C813EABDA}Prefabs/Vehicles/Wheeled/UAZ469/UAZ469_FIA.et' },
  mrap: { blufor: '{4A71F755A4513227}Prefabs/Vehicles/Wheeled/M998/M1025.et' },
  truck: { blufor: '{9A0D72816DFFDB7F}Prefabs/Vehicles/Wheeled/M923A1/M923A1.et', opfor: '{4597626AF36C0858}Prefabs/Vehicles/Wheeled/Ural4320/Ural4320.et', indep: '{16E32C3ABEAFC2C6}Prefabs/Vehicles/Wheeled/Ural4320/Ural4320_FIA_transport.et' },
  apc: { blufor: '{0FBF8F010F81A4E5}Prefabs/Vehicles/Wheeled/LAV25/LAV25.et', opfor: '{C012BB3488BEA0C2}Prefabs/Vehicles/Wheeled/BTR70/BTR70.et', indep: '{B47110AA1A806556}Prefabs/Vehicles/Wheeled/BTR70/BTR70_FIA.et' },
  scout: { blufor: '{3EA6F47D95867114}Prefabs/Vehicles/Wheeled/M998/M1025_armed_M2HB.et', opfor: '{254289B9C09904AB}Prefabs/Vehicles/Wheeled/BRDM2/BRDM2.et', indep: '{442939C9617DF228}Prefabs/Vehicles/Wheeled/BRDM2/BRDM2_FIA.et' },
  heli: { blufor: '{70BAEEFC2D3FEE64}Prefabs/Vehicles/Helicopters/UH1H/UH1H.et', opfor: '{DF5CCB7C0FF049F4}Prefabs/Vehicles/Helicopters/Mi8MT/Mi8MT_unarmed_transport.et', indep: '{70BAEEFC2D3FEE64}Prefabs/Vehicles/Helicopters/UH1H/UH1H.et' },
};

/** The prefab a new figure is written as: its class and prefab, and whether it is a guess (another kind than the figure's). */
export function rfPrefabFor(figure: string, category: UnitCategory, side: string): { cls: string; prefab: string; guessed: boolean; group: boolean } | null {
  const s = side === 'civ' ? 'indep' : side in GROUPS ? side : 'blufor';
  if (category === 'infantry') {
    const sniper = /sniper|marksman/.test(figure) ? SNIPERS[s] : undefined;
    return { cls: 'SCR_AIGroup', prefab: sniper ?? GROUPS[s], guessed: false, group: true };
  }
  const pick = (k: string, guessed: boolean) => {
    const p = VEHICLES[k][s] ?? VEHICLES[k].blufor;
    return { cls: 'Vehicle', prefab: p, guessed, group: false };
  };
  if (category === 'heli') return pick('heli', !/uh-?1|mi-?8|huey/.test(figure));
  if (category !== 'ground') return null;
  if (/truck|ural|m923|lorry/.test(figure)) return pick('truck', false);
  if (/apc|btr|lav|ifv|bmp|stryker|mbt|tank/.test(figure)) return pick('apc', !/apc|btr|lav/.test(figure));
  if (/brdm|scout|armou?red-car/.test(figure)) return pick('scout', false);
  if (/mrap|humvee|hmmwv/.test(figure)) return pick(s === 'blufor' ? 'mrap' : 'jeep', s !== 'blufor');
  return pick('jeep', !/jeep|uaz|m151|car|lsv/.test(figure));
}

const flat = (a: { x: number; z: number }, b: { x: number; z: number }) => Math.hypot(a.x - b.x, a.z - b.z);
const turnDiff = (a: number, b: number) => Math.abs((((a - b) % 360) + 540) % 360 - 180);
const safeName = (s: string) => s.replace(/[^A-Za-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'Group';

/** The waypoint type a waypoint's tasks ask for ('Move' for none), and the tasks it cannot hold. */
function typeOfTasks(tasks: MissionTask[] | undefined): { type: string; key: string; rest: MissionTask[] } {
  let type = '';
  let key = 'k:move';
  const rest: MissionTask[] = [];
  for (const t of tasks ?? []) {
    if (!type && t.kind && TYPE_OF_KIND[t.kind]) {
      type = TYPE_OF_KIND[t.kind]!;
      key = `k:${KEY_OF_KIND[t.kind] ?? t.kind}`;
      continue;
    }
    if (!type && !t.kind && t.name) {
      type = t.name;
      key = keyOfType(t.name);
      continue;
    }
    rest.push(t);
  }
  return { type: type || 'Move', key, rest };
}

class RfPatch {
  readonly edits: TextEdit[] = [];
  readonly warnings: ExportWarning[] = [];
  readonly names = new Set<string>();
  readonly eol: string;
  readonly unit: string;
  /** New top-level entities, written after the file's last. */
  readonly appended: string[] = [];
  constructor(readonly text: string) {
    this.eol = enfEol(text);
    this.unit = enfIndentUnit(text);
  }
  replace(start: number, end: number, text: string) {
    this.edits.push({ start, end, text });
  }
  unique(base: string) {
    const b = safeName(base);
    let n = b;
    for (let i = 2; this.names.has(n); i++) n = `${b}_${i}`;
    this.names.add(n);
    return n;
  }
  /** Sets a line's values (`coords 1 2 3`), else adds the line at the start of the block's body. */
  setLine(node: EnfNode, key: string, values: string) {
    const l = enfLine(node, key);
    if (l) {
      const from = l.tokens[1]?.start ?? l.tokens[0].end;
      const was = this.text.slice(from, l.end);
      if (was !== values) this.replace(l.tokens[1] ? from : l.tokens[0].end, l.end, l.tokens[1] ? values : ` ${values}`);
      return;
    }
    this.insertLine(node, `${key} ${values}`);
  }
  /** A line added as the first of a block's body (after `coords` when it has one). */
  insertLine(node: EnfNode, line: string) {
    const after = enfLine(node, 'coords') ?? enfLine(node, 'ID');
    const ind = enfIndent(this.text, node.start) + this.unit;
    const at = after ? after.end : node.open + 1;
    this.replace(at, at, `${this.eol}${ind}${line}`);
  }
  /** Takes an entity out: its lines, from the start of its first to the end of its last. */
  remove(node: EnfNode) {
    const ls = this.text.lastIndexOf('\n', node.start - 1) + 1;
    const nl = this.text.indexOf('\n', node.end);
    const end = nl < 0 ? this.text.length : nl + 1;
    takeSpan(this.text, ls, end, this.edits);
    this.replace(ls, end, '');
  }
}

/** An entity moved to a world place and heading: its local `coords` and heading in its parent's frame. */
function placeEntity(p: RfPatch, e: RfEntity, at: Vec3, heading: number | null): boolean {
  const before = p.edits.length;
  const moved = flat(at, e.world) > 0.01 || Math.abs(at.y - e.world.y) > 0.01;
  if (moved) {
    const px = e.parent?.world ?? { x: 0, y: 0, z: 0 };
    const o = e.parent ? turnOffset(at.x - px.x, at.z - px.z, -e.parent.heading) : { x: at.x, z: at.z };
    p.setLine(e.node, 'coords', [o.x, at.y - px.y, o.z].map(enfNumber).join(' '));
  }
  if (heading !== null && turnDiff(heading, e.heading) > 0.05) {
    let local = heading - (e.parent?.heading ?? 0);
    local = ((local % 360) + 540) % 360 - 180;
    const angles = enfLine(e.node, 'angles');
    if (!enfLine(e.node, 'angleY') && angles && angles.tokens.length >= 4) p.replace(angles.tokens[2].start, angles.tokens[2].end, enfNumber(local));
    else p.setLine(e.node, 'angleY', enfNumber(local));
  }
  return p.edits.length !== before;
}

/** A new waypoint entity's text, at the top of the file. */
function waypointText(p: RfPatch, name: string, type: string, at: Vec3): string {
  const w = RF_WAYPOINTS[type] ?? RF_WAYPOINTS.Move;
  return enfBlockText(`${w.cls} ${name} : ${enfQuote(w.prefab)}`, [`coords ${[at.x, at.y, at.z].map(enfNumber).join(' ')}`], '', p.unit, p.eol);
}

/** The waypoint type to write for a waypoint's tasks, warning of what it leaves out. */
function writableType(p: RfPatch, g: MissionGroup, w: MissionWaypoint): { type: string; key: string } {
  const { type, key, rest } = typeOfTasks(w.tasks);
  for (const t of rest) p.warnings.push({ code: 'rf-task', group: g.name, what: t.name });
  if (!RF_WAYPOINTS[type]) {
    p.warnings.push({ code: 'rf-task', group: g.name, what: type });
    return { type: 'Move', key: 'k:move' };
  }
  if (type === 'Cycle') p.warnings.push({ code: 'rf-cycle', group: g.name });
  return { type, key };
}

/** Rewrites a group's route: moved waypoints moved, retasked ones given their type's prefab, the list rewritten where waypoints came or went. */
function patchRoute(p: RfPatch, groupEnt: RfEntity, g: MissionGroup, byName: Map<string, RfEntity>, usedBy: Map<string, number>) {
  const listNode = enfChild(groupEnt.node, 'm_aStaticWaypoints');
  const names = enfItems(listNode);
  const old = names.map((n) => byName.get(n)).filter((w): w is RfEntity => !!w);
  const oldAt = [groupEnt.world, ...old.map((w) => w.world)];
  const route = g.route.length ? g.route : [{ at: g.units[0].at }];
  const m = alignRoute(
    route.map((w) => w.at),
    oldAt,
  );
  route.forEach((w, i) => {
    if (i === 0 || m[i] <= 0) return;
    const o = old[m[i] - 1];
    placeEntity(p, o, w.at, null);
    const type = waypointType(o.cls, o.prefab);
    const want = typeOfTasks(w.tasks);
    if (want.key !== keyOfType(type)) {
      const t = writableType(p, g, w);
      if (t.key !== keyOfType(type)) {
        const def = RF_WAYPOINTS[t.type];
        const h = enfHead(o.node);
        p.replace(o.node.start, o.node.open, `${def.cls}${h.name ? ` ${o.node.head[1].raw}` : ''} : ${enfQuote(def.prefab)} `);
      }
    } else for (const t of want.rest) p.warnings.push({ code: 'rf-task', group: g.name, what: t.name });
  });
  const identity = route.length === oldAt.length && m.every((j, i) => j === i);
  if (identity && old.length === names.length) return;
  // The list as the route has it: kept waypoints by their names, new ones as new entities.
  const list: string[] = [];
  route.forEach((w, i) => {
    if (i === 0) return;
    if (m[i] > 0) {
      list.push(old[m[i] - 1].name);
      return;
    }
    const name = p.unique(`${g.name}_WP${i}`);
    p.appended.push(waypointText(p, name, writableType(p, g, w).type, w.at));
    list.push(name);
  });
  // Waypoints left off the route: out of the file when no other group names them.
  const kept = new Set(list);
  for (const w of old) {
    if (kept.has(w.name)) continue;
    if ((usedBy.get(w.name) ?? 0) <= 1) p.remove(w.node);
  }
  const ind = enfIndent(p.text, groupEnt.node.start) + p.unit;
  const items = list.map(enfQuote).join(' ');
  if (listNode) {
    takeSpan(p.text, listNode.open + 1, listNode.close, p.edits);
    p.replace(listNode.open + 1, listNode.close, list.length ? `${p.eol}${ind}${p.unit}${items}${p.eol}${ind}` : `${p.eol}${ind}`);
  } else if (list.length) p.insertLine(groupEnt.node, `m_aStaticWaypoints {${p.eol}${ind}${p.unit}${items}${p.eol}${ind}}`);
}

/** A Scenario Framework slot's route: its slot waypoints moved; waypoints added or taken away are left to the Workbench. */
function patchSlotRoute(p: RfPatch, e: RfEntity, g: MissionGroup, all: RfEntity[]) {
  const slot = componentOf(e.node, /^SCR_ScenarioFrameworkSlot(?!Waypoint|Marker|Trigger|Extraction)/);
  const old = slotWaypoints(slot, all);
  const oldAt = [e.world, ...old.map((w) => w.world)];
  const route = g.route.length ? g.route : [{ at: g.units[0].at }];
  const m = alignRoute(
    route.map((w) => w.at),
    oldAt,
  );
  route.forEach((w, i) => {
    if (i > 0 && m[i] > 0) placeEntity(p, old[m[i] - 1], w.at, null);
  });
  if (!(route.length === oldAt.length && m.every((j, i) => j === i)) && (route.length > 1 || old.length)) p.warnings.push({ code: 'rf-sf-route', group: g.name });
}

/** A new group or vehicle's entity text (with its waypoints appended), or null when it has none to be. */
function newEntity(p: RfPatch, g: MissionGroup): string | null {
  const u = g.units[0];
  if (!u) return null;
  if (g.category === 'static') {
    p.warnings.push({ code: 'static', group: g.name });
    return null;
  }
  const pf = rfPrefabFor(u.figure ?? '', g.category, g.side);
  if (!pf) {
    p.warnings.push({ code: 'rf-no-prefab', group: g.name });
    return null;
  }
  if (pf.guessed) p.warnings.push({ code: 'type-guess', what: `${u.name} → ${prefabPath(pf.prefab).split('/').pop()}` });
  if (g.units.length > 1) p.warnings.push({ code: 'rf-count', group: g.name, n: g.units.length });
  const name = p.unique(g.name);
  g.name = name;
  const lines: EnfOut[] = [`coords ${[u.at.x, u.at.y, u.at.z].map(enfNumber).join(' ')}`, `angleY ${enfNumber(((rfHeading(u.yaw) + 180) % 360) - 180)}`];
  const route = g.route.slice(1);
  if (pf.group && route.length) {
    const wps = route.map((w, i) => {
      const n = p.unique(`${name}_WP${i + 1}`);
      p.appended.push(waypointText(p, n, writableType(p, g, w).type, w.at));
      return n;
    });
    lines.push(['m_aStaticWaypoints', [wps.map(enfQuote).join(' ')]]);
  } else if (route.length) p.warnings.push({ code: 'rf-loose-route', group: name });
  return enfBlockText(`${pf.cls} ${name} : ${enfQuote(pf.prefab)}`, lines, '', p.unit, p.eol);
}

/** The layer's text with the plan's changes made (`MissionState` from `planToMission`). */
export function patchReforgerText(text: string, m: MissionState): { text: string; summary: MissionExportSummary } {
  const root = parseEnfusion(text);
  const all = rfEntities(root);
  const p = new RfPatch(text);
  const byRef = new Map(all.map((e) => [e.ref, e]));
  const byName = new Map<string, RfEntity>();
  for (const e of all) {
    if (e.name) p.names.add(e.name);
    if (e.name && !byName.has(e.name)) byName.set(e.name, e);
  }
  // How many groups name each waypoint.
  const usedBy = new Map<string, number>();
  for (const e of all) for (const n of enfItems(enfChild(e.node, 'm_aStaticWaypoints'))) usedBy.set(n, (usedBy.get(n) ?? 0) + 1);
  const world = rfWorld(all, '');
  const summary: MissionExportSummary = { mode: 'patch', map: world, groups: 0, units: 0, waypoints: 0, changed: [], added: [], removed: [], untouched: 0, warnings: p.warnings };
  const fresh: MissionGroup[] = [];
  let linked = 0;
  for (const g of m.groups) {
    summary.groups++;
    summary.units += g.units.length;
    summary.waypoints += g.route.length;
    const e = g.ref ? byRef.get(g.ref) : undefined;
    if (!e) {
      fresh.push(g);
      continue;
    }
    linked++;
    const before = p.edits.length + p.appended.length;
    const u = g.units[0];
    if (g.units.length > 1) p.warnings.push({ code: 'rf-count', group: g.name, n: g.units.length });
    if (u) placeEntity(p, e, u.at, rfHeading(u.yaw));
    if (u && !u.type) p.warnings.push({ code: 'rf-retype', group: g.name });
    if (enfChild(e.node, 'm_aStaticWaypoints') || (/AIGroup/i.test(e.cls) && g.route.length > 1)) patchRoute(p, e, g, byName, usedBy);
    else if (componentOf(e.node, /^SCR_ScenarioFrameworkSlot(?!Waypoint|Marker|Trigger|Extraction)/)) patchSlotRoute(p, e, g, all);
    else if (g.route.length > 1) p.warnings.push({ code: 'rf-loose-route', group: g.name });
    if (p.edits.length + p.appended.length !== before) summary.changed.push(g.name);
  }
  for (const ref of m.removed ?? []) {
    const e = byRef.get(ref);
    if (!e) continue;
    for (const n of enfItems(enfChild(e.node, 'm_aStaticWaypoints'))) {
      const w = byName.get(n);
      if (w && (usedBy.get(n) ?? 0) <= 1 && !w.parent) p.remove(w.node);
    }
    p.remove(e.node);
    summary.removed.push(e.name || prefabPath(e.prefab).split('/').pop()?.replace(/\.et$/i, '') || ref);
  }
  if (summary.removed.length) p.warnings.push({ code: 'removed', n: summary.removed.length });
  summary.untouched = linked - summary.changed.length;
  const added = fresh.map((g) => newEntity(p, g)).filter((t, i): t is string => !!t && !!summary.added.push(fresh[i].name));
  const tail = [...added, ...p.appended];
  if (tail.length) {
    const pre = text.length && !text.endsWith('\n') ? p.eol : '';
    p.replace(text.length, text.length, `${pre}${tail.map((t) => `${t}${p.eol}`).join('')}`);
  }
  return { text: applyEdits(text, p.edits), summary };
}

/** A new layer of the plan's groups and vehicles, for a scenario on `world`. */
export function newReforgerText(world: string, m: MissionState): { text: string; summary: MissionExportSummary } {
  const plain: MissionState = { ...m, groups: m.groups.map((g) => ({ ...g, ref: undefined, units: g.units.map((u) => ({ ...u, ref: undefined })) })), removed: [] };
  const r = patchReforgerText('', plain);
  return { text: r.text, summary: { ...r.summary, mode: 'new', map: world } };
}

/** The layer for a plan: `original` patched when given, else a new layer for `world`. */
export function writeReforgerLayer(m: MissionState, original: Uint8Array | null, world?: string): { bytes: Uint8Array; summary: MissionExportSummary } {
  const enc = new TextEncoder();
  if (original) {
    if (original.length >= 4 && original[0] === 0x45 && original[1] === 0x42 && original[2] === 0x49 && original[3] === 0x4e) throw new Error('the file is in the binary form (EBIN); write into a layer saved as text, or a new layer');
    const text = new TextDecoder('utf-8').decode(original);
    const r = patchReforgerText(text, m);
    return { bytes: r.text === text ? original : enc.encode(r.text), summary: r.summary };
  }
  const w = world || m.map.replace(/^Arma Reforger:\s*/i, '');
  const r = newReforgerText(w, m);
  return { bytes: enc.encode(r.text), summary: r.summary };
}

/** The worlds a new layer can be for (the Reforger levels' names). */
export const REFORGER_WORLDS = ['Eden', 'Arland', 'Cain'];
