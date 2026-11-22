/**
 * Arma Reforger scenarios as the Workbench saves them in text: a world's
 * layer files (`.layer`) or a world saved as text (`.ent`). The game's own
 * worlds ship in the binary form (`EBIN`), which is refused with the reason.
 *
 * Read:
 * - **Groups** (`SCR_AIGroup`, a prefab under `Prefabs/Groups/`): one figure
 *   each, as the group prefab spawns its members in the game; its waypoints
 *   are the entities its `m_aStaticWaypoints` name, in that order.
 * - **Characters and vehicles** placed on their own: a figure each.
 * - **Scenario Framework** slots that spawn a group, a character or a
 *   vehicle (`m_sObjectToSpawn`), with the slot waypoints of the layers their
 *   waypoint set names as the route.
 * - **Waypoints**: Move as the waypoint itself; Search and Destroy as a
 *   sweep, Attack, Defend, Wait (a hold), Cycle (a patrol back round the
 *   route), Follow, Suppress, Observation Post (overwatch), Scout (recon) as
 *   the board's tasks; the rest (Get In, Get Out ...) by their names.
 * - **Places**: military bases (Conflict), spawn points, capture areas,
 *   Scenario Framework areas and tasks.
 *
 * The side is the faction the entity names (`m_faction`, `m_sFaction` ...),
 * else the one its prefab's path says (`BLUFOR`, `USSR`, `FIA`), else the
 * catalogue's for a vehicle; US is BLUFOR, USSR OPFOR, FIA Independent.
 *
 * A child entity's `coords` and angles are its parent's frame; positions
 * here are the world's: x east, y up, z north, metres - the frame the
 * Reforger levels and Reforger recordings lie in on the board. A heading is
 * `angleY` (or the middle of `angles`), degrees clockwise from north.
 */

import { enfChild, enfChildEntities, enfHead, enfItems, enfNumbers, enfText, enfValue, parseEnfusion, type EnfNode } from './enfusionText';
import { armaWorldOf } from '../../data/armaWorlds';
import { reforgerUnitId, sideOfFaction } from '../../data/armaUnits';
import { catalogItem } from '../../figures/unitcatalog';
import { SIDES, sideOf } from './arma';
import type { MissionGroup, MissionImporter, MissionPlace, MissionState, MissionTask, MissionUnit, MissionWaypoint, UnitCategory } from './index';
import type { TaskKind } from '../tasks';
import type { Vec3 } from '../plan';

/** A prefab reference without its resource id (`{GUID}`). */
export const prefabPath = (p: string) => p.replace(/^\{[0-9A-Fa-f]+\}/, '');

/** One entity of the file, with where it is in the world. */
export interface RfEntity {
  node: EnfNode;
  cls: string;
  name: string;
  prefab: string;
  parent: RfEntity | null;
  /** Its id for writing back: `n:<name>`, `i:<ID>`, else `p:<place among the file's entities>`. */
  ref: string;
  /** World position (game x east, y up, z north) and heading, degrees clockwise from north. */
  world: Vec3;
  heading: number;
}

/** A local offset turned by a parent's heading (left-handed: x right, z forward). */
export function turnOffset(x: number, z: number, headingDeg: number): { x: number; z: number } {
  const a = (headingDeg * Math.PI) / 180;
  return { x: x * Math.cos(a) + z * Math.sin(a), z: -x * Math.sin(a) + z * Math.cos(a) };
}

/** An entity's own heading: `angleY`, else the middle of `angles`. */
export function headingOf(node: EnfNode): number {
  const y = enfNumbers(node, 'angleY', 1);
  if (y) return y[0];
  const a = enfNumbers(node, 'angles', 3);
  return a ? a[1] : 0;
}

/** Every entity of the file, parents before their children, with world places. */
export function rfEntities(root: EnfNode): RfEntity[] {
  const out: RfEntity[] = [];
  const walk = (nodes: EnfNode[], parent: RfEntity | null, path: string) => {
    nodes.forEach((node, i) => {
      const { cls, name, prefab } = enfHead(node);
      const c = enfNumbers(node, 'coords', 3) ?? [0, 0, 0];
      const own = headingOf(node);
      let world: Vec3 = { x: c[0], y: c[1], z: c[2] };
      let heading = own;
      if (parent) {
        const o = turnOffset(c[0], c[2], parent.heading);
        world = { x: parent.world.x + o.x, y: parent.world.y + c[1], z: parent.world.z + o.z };
        heading = parent.heading + own;
      }
      const id = enfValue(node, 'ID');
      const p = `${path}${i}`;
      const e: RfEntity = { node, cls, name, prefab, parent, ref: name ? `n:${name}` : id ? `i:${id}` : `p:${p}`, world, heading };
      out.push(e);
      walk(enfChildEntities(node), e, `${p}.`);
    });
  };
  // The file's entities, and those of a head-less block at its top.
  walk([...root.nodes.filter((n) => n.head.length), ...root.nodes.filter((n) => !n.head.length).flatMap((b) => b.nodes.filter((c) => c.head.length))], null, '');
  return out;
}

/** The board's position and box yaw of a world place (north is +z, as the Reforger levels lie). */
export const rfToBoard = (p: Vec3): Vec3 => ({ x: p.x, y: p.y, z: p.z });
export const rfYaw = (headingDeg: number) => ((180 - headingDeg) * Math.PI) / 180;
/** A board yaw back to a heading, degrees clockwise from north, in [0, 360). */
export function rfHeading(yaw: number): number {
  const h = 180 - (yaw * 180) / Math.PI;
  return ((h % 360) + 360) % 360;
}

const FACTION_KEYS = new Set(['m_faction', 'm_sFaction', 'm_sFactionKey', 'm_sAffiliatedFaction', 'm_sForcedFaction']);

/** The faction an entity names in its own lines or its components (not its children's), '' when none. */
export function factionOf(node: EnfNode): string {
  const look = (n: EnfNode): string => {
    for (const l of n.lines) if (!l.tokens[0].quoted && FACTION_KEYS.has(l.tokens[0].raw) && l.tokens[1]) return enfText(l.tokens[1]);
    for (const c of n.nodes) {
      if (!c.head.length) continue; // child entities
      const f = look(c);
      if (f) return f;
    }
    return '';
  };
  return look(node);
}

/** A faction key as the board's side id. */
export function sideOfRfFaction(f: string): string | null {
  const k = f.trim().toUpperCase();
  if (!k) return null;
  const s = sideOfFaction(k) || (/^(USSR|SOVIET|RUS)/.test(k) ? 'EAST' : /^US/.test(k) ? 'WEST' : /^(FIA|IND|GUER)/.test(k) ? 'GUER' : /^CIV/.test(k) ? 'CIV' : '');
  return s ? sideOf(s.toLowerCase()) : null;
}

/** The side a prefab's path says. */
export function sideOfPrefab(prefab: string): string | null {
  const p = prefabPath(prefab);
  if (/\/BLUFOR\/|(^|[/_])US(_|\/|\.)/i.test(p)) return 'blufor';
  if (/\/OPFOR\/|(^|[/_])USSR(_|\/|\.)|Soviet/i.test(p)) return 'opfor';
  if (/\/INDFOR\/|(^|[/_])FIA(_|\/|\.)/i.test(p)) return 'indep';
  if (/\/CIV\/|(^|[/_])CIV(_|\/|\.)/i.test(p)) return 'civ';
  return null;
}

/** What a prefab places: a group, a character, a vehicle (with its category and a figure it looks like), or nothing the board shows. */
export function rfKind(cls: string, prefab: string): { kind: 'group' | 'character' | 'vehicle'; category: UnitCategory; figure?: string } | null {
  const p = prefabPath(prefab);
  const w = p.toLowerCase();
  const base = w.split('/').pop() ?? '';
  if (/aigroup/i.test(cls) || /^prefabs\/(groups|ai\/groups)\//.test(w)) {
    const figure = /sniper|marksman/.test(base) ? 'sniper' : /(_|^)(lat|at|antitank)(_|\.)/.test(base) ? 'anti-tank' : /medic|medical/.test(base) ? 'medic' : 'soldier';
    return { kind: 'group', category: 'infantry', figure };
  }
  if (/chimeracharacter/i.test(cls) || (/^prefabs\/characters\//.test(w) && !/\/(core|basebody|heads?)\//.test(w))) {
    const figure = /sniper|marksman/.test(base) ? 'sniper' : /(_|^)(lat|at|aa)(_|\.)/.test(base) ? 'anti-tank' : /medic/.test(base) ? 'medic' : /crew|pilot|driver/.test(base) ? 'crew' : 'soldier';
    return { kind: 'character', category: 'infantry', figure };
  }
  const vehicle = cls === 'Vehicle' || /^prefabs\/vehicles\/(wheeled|tracked|helicopters|boats|planes)\//.test(w);
  if (!vehicle || /wreck|parts?\/|_base\.et$|turret/.test(w)) return null;
  const item = catalogItem(reforgerUnitId(p), 'arma-reforger');
  const c = (item?.class ?? '').toLowerCase();
  if (/heli/.test(c) || /\/helicopters\//.test(w)) return { kind: 'vehicle', category: 'heli', ...(/uh1h/.test(base) ? { figure: 'uh-1h-huey' } : /mi8/.test(base) ? { figure: 'mi-8mt' } : {}) };
  if (/\/planes\//.test(w)) return { kind: 'vehicle', category: 'air' };
  if (/\/boats\//.test(w) || c === 'boat') return { kind: 'vehicle', category: 'sea', figure: /rhib|rubber|zodiac/.test(base) ? 'rhib' : 'patrol-boat' };
  if (c === 'ifv') return { kind: 'vehicle', category: 'ground', figure: 'ifv' };
  if (c === 'apc' || /btr|lav25|bmp/.test(base)) return { kind: 'vehicle', category: 'ground', figure: /bmp/.test(base) ? 'ifv' : 'apc-wheeled' };
  if (c === 'mbt' || /\/tracked\/|t72|m1a|t55/.test(w)) return { kind: 'vehicle', category: 'ground', figure: 'mbt' };
  if (c === 'truck' || /ural|m923|truck|kamaz|zil/.test(base)) return { kind: 'vehicle', category: 'ground', figure: 'truck' };
  return { kind: 'vehicle', category: 'ground', figure: 'jeep' };
}

/** A waypoint's type: its prefab's name (`AIWaypoint_SearchAndDestroy` -> SearchAndDestroy), else its class's. */
export function waypointType(cls: string, prefab: string): string {
  const m = /AIWaypoint_([A-Za-z0-9_]+)\.et$/i.exec(prefabPath(prefab));
  if (m) return m[1];
  const sf = /ScenarioFrameworkWaypoint([A-Za-z0-9_]+)$/.exec(cls);
  if (sf) return sf[1];
  const byClass: Record<string, string> = {
    AIWaypointCycle: 'Cycle',
    SCR_SearchAndDestroyWaypoint: 'SearchAndDestroy',
    SCR_DefendWaypoint: 'Defend',
    SCR_TimedWaypoint: 'Wait',
    SCR_EntityWaypoint: 'Attack',
    SCR_SuppressWaypoint: 'Suppress',
    SCR_BoardingEntityWaypoint: 'GetIn',
    SCR_BoardingWaypoint: 'GetOut',
    SCR_SmartActionWaypoint: 'ObservationPost',
  };
  return byClass[cls] ?? 'Move';
}

/** Waypoint types as the board's tasks; null is the waypoint itself. */
const TASK_OF: [RegExp, TaskKind | null][] = [
  [/^(move|forcedmove)$/i, null],
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

/** The tasks of a waypoint of that type at `at`; `route` is the group's points up to it (a cycle goes round them). */
export function rfWaypointTasks(type: string, at: Vec3, route: Vec3[]): MissionTask[] {
  const hit = TASK_OF.find(([re]) => re.test(type));
  if (!hit) return [{ name: type }];
  const kind = hit[1];
  if (!kind) return [];
  if (kind === 'sweep') return [{ name: type, kind, points: [at, { x: at.x + 50, y: at.y, z: at.z }] }];
  if (kind === 'patrol') return [{ name: type, kind, points: route.length >= 2 ? route.slice() : [at], pattern: 'loop' }];
  return [{ name: type, kind }];
}

const isWaypoint = (e: RfEntity) => (/Waypoint/i.test(e.cls) && !/ScenarioFramework/i.test(e.cls)) || /^prefabs\/ai\/waypoints\//i.test(prefabPath(e.prefab));

/** An entity's component of a class matching `re`, or undefined. */
export function componentOf(node: EnfNode, re: RegExp): EnfNode | undefined {
  return enfChild(node, 'components')?.nodes.find((c) => c.head.length && re.test(enfText(c.head[0])));
}

/** The layers a Scenario Framework slot's waypoint set names (`m_WaypointSet`, one object or a list of them). */
export function slotLayers(slot: EnfNode | undefined): Set<string> {
  const set = enfChild(slot, 'm_WaypointSet');
  if (!set) return new Set();
  return new Set([...enfItems(enfChild(set, 'm_aLayerName')), ...set.nodes.flatMap((ws) => enfItems(enfChild(ws, 'm_aLayerName')))]);
}

/** A slot's route: the slot waypoints under the layers its waypoint set names, in the file's order. */
export function slotWaypoints(slot: EnfNode | undefined, all: RfEntity[]): RfEntity[] {
  const layers = slotLayers(slot);
  if (!layers.size) return [];
  return all.filter((w) => {
    if (!componentOf(w.node, /^SCR_ScenarioFrameworkSlotWaypoint$/)) return false;
    for (let p = w.parent; p; p = p.parent) if (layers.has(p.name)) return true;
    return false;
  });
}

/** The world a file is set on: a SubScene's parent world, else a word of its name; '' when neither says. */
export function rfWorld(entities: RfEntity[], file: string): string {
  const sub = entities.find((e) => e.cls === 'SubScene');
  const parent = sub ? enfValue(sub.node, 'Parent') : '';
  for (const s of [parent, file]) {
    if (!s) continue;
    const w = armaWorldOf(prefabPath(s).replace(/\\/g, '/'), true);
    if (w && /^(Eden|Arland|Cain)$/.test(w.id)) return w.id;
  }
  if (parent) return armaWorldOf(prefabPath(parent), true)?.id ?? '';
  return '';
}

/** The text of a Reforger layer read into a mission. */
export function readReforgerLayer(text: string, file: string): MissionState {
  const root = parseEnfusion(text);
  const all = rfEntities(root);
  const byName = new Map<string, RfEntity>();
  for (const e of all) if (e.name && !byName.has(e.name)) byName.set(e.name, e);
  const groups: MissionGroup[] = [];
  const places: MissionPlace[] = [];
  const notes: string[] = [];
  const skipped = new Set<string>();
  const sideFor = (e: RfEntity, prefab = e.prefab, catalogNation = ''): string => {
    const f = factionOf(e.node);
    return sideOfRfFaction(f) ?? sideOfPrefab(prefab) ?? (catalogNation ? sideOfRfFaction(catalogNation) : null) ?? 'civ';
  };
  // Entities inside a vehicle (its turrets, its crew slots) are the vehicle's.
  const inVehicle = (e: RfEntity) => {
    for (let p = e.parent; p; p = p.parent) if (rfKind(p.cls, p.prefab)?.kind === 'vehicle') return true;
    return false;
  };
  const unitOf = (e: RfEntity, prefab: string, kind: NonNullable<ReturnType<typeof rfKind>>, at = e.world, heading = e.heading): MissionUnit => {
    const type = reforgerUnitId(prefabPath(prefab));
    return { name: e.name || type || e.cls, type, category: kind.category, ...(kind.figure ? { figure: kind.figure } : {}), at: rfToBoard(at), yaw: rfYaw(heading), ref: e.ref };
  };
  const routeOf = (start: Vec3, wps: RfEntity[], typeOf: (w: RfEntity) => string): MissionWaypoint[] => {
    const route: MissionWaypoint[] = [{ at: rfToBoard(start) }];
    for (const w of wps) {
      const at = rfToBoard(w.world);
      const type = typeOf(w);
      const tasks = rfWaypointTasks(type, at, route.map((r) => r.at).concat(/^cycle/i.test(type) ? [] : [at]));
      route.push({ at, name: w.name || type, kind: type, ...(tasks.length ? { tasks } : {}) });
    }
    return route;
  };

  for (const e of all) {
    if (isWaypoint(e)) continue;
    const kind = rfKind(e.cls, e.prefab);
    if (kind && !inVehicle(e)) {
      const nation = kind.kind === 'vehicle' ? (catalogItem(reforgerUnitId(prefabPath(e.prefab)), 'arma-reforger')?.nation ?? '') : '';
      const side = sideFor(e, e.prefab, nation);
      const unit = unitOf(e, e.prefab, kind);
      let route: MissionWaypoint[] = [];
      if (kind.kind === 'group') {
        const names = enfItems(enfChild(e.node, 'm_aStaticWaypoints'));
        const wps = names.map((n) => byName.get(n)).filter((w): w is RfEntity => !!w);
        if (wps.length < names.length) notes.push(`${e.name || unit.type}: ${names.length - wps.length} waypoint(s) not in this file`);
        if (wps.length) route = routeOf(e.world, wps, (w) => waypointType(w.cls, w.prefab));
      }
      groups.push({ name: unit.name, side, category: kind.category, units: [unit], route, ref: e.ref });
      continue;
    }
    // A Scenario Framework slot that spawns something.
    const slot = componentOf(e.node, /^SCR_ScenarioFrameworkSlot(?!Waypoint|Marker|Trigger|Extraction)/);
    const spawn = slot ? enfValue(slot, 'm_sObjectToSpawn') : '';
    if (slot && spawn) {
      const k = rfKind('', spawn);
      if (!k) {
        skipped.add(prefabPath(spawn).split('/').pop() ?? spawn);
        continue;
      }
      const unit = unitOf(e, spawn, k);
      const side = sideOfRfFaction(factionOf(e.node)) ?? sideOfPrefab(spawn) ?? 'civ';
      // Its waypoint set: the slot waypoints of the layers it names, in the file's order.
      const wps = slotWaypoints(slot, all);
      const sfType = (w: RfEntity) => {
        const wp = enfChild(componentOf(w.node, /^SCR_ScenarioFrameworkSlotWaypoint$/), 'm_Waypoint');
        return wp?.head[1] ? waypointType(enfText(wp.head[1]), '') : 'Move';
      };
      groups.push({ name: unit.name, side, category: k.category, units: [unit], route: wps.length ? routeOf(e.world, wps, sfType) : [], ref: e.ref });
      continue;
    }
    // Places.
    const at = rfToBoard(e.world);
    const pw = prefabPath(e.prefab).toLowerCase();
    const base = componentOf(e.node, /MilitaryBaseComponent$/);
    if (base || /^prefabs\/systems\/militarybase\//.test(pw)) {
      const nm = (base ? enfValue(base, 'm_sBaseName') : '') || e.name || 'Base';
      places.push({ name: nm, kind: 'objective', at, ...(sideOfRfFaction(factionOf(e.node)) ? { side: sideOfRfFaction(factionOf(e.node))! } : {}) });
    } else if ((/SpawnPoint$/i.test(e.cls) || /^prefabs\/mp\/spawning\//.test(pw)) && !/ambient/.test(pw)) {
      const f = factionOf(e.node);
      places.push({ name: e.name || `Spawn point${f ? ` (${f})` : ''}`, kind: 'marker', at, ...(sideOfRfFaction(f) ? { side: sideOfRfFaction(f)! } : {}) });
    } else if (/CaptureAndHoldArea|CaptureArea|SeizingArea/i.test(e.cls) || componentOf(e.node, /SeizingComponent$|CaptureAreaComponent$/)) {
      const r = Number(enfValue(e.node, 'm_fAreaRadius') || enfValue(e.node, 'm_fRadius')) || 50;
      places.push({ name: e.name || 'Capture area', kind: 'zone', at, radius: r });
    } else if (componentOf(e.node, /^SCR_ScenarioFrameworkArea$/)) {
      const r = Number(enfValue(componentOf(e.node, /^SCR_ScenarioFrameworkArea$/), 'm_fAreaRadius')) || 0;
      places.push({ name: e.name || 'Area', ...(r > 0 ? { kind: 'zone' as const, radius: r } : { kind: 'marker' as const }), at });
    } else {
      const task = componentOf(e.node, /^SCR_ScenarioFrameworkLayerTask/);
      if (task) places.push({ name: enfValue(task, 'm_sTaskTitle') || e.name || 'Task', kind: 'objective', at });
    }
  }
  if (skipped.size) notes.push(`spawned objects not shown: ${[...skipped].slice(0, 6).join(', ')}${skipped.size > 6 ? ' …' : ''}`);
  if (!groups.length) notes.push('the layer has no groups, characters or vehicles');
  const world = rfWorld(all, file);
  const used = new Set([...groups.map((g) => g.side), ...places.map((p) => p.side).filter(Boolean)]);
  return {
    format: 'reforger-layer',
    game: 'arma',
    title: file.replace(/^.*[\\/]/, '').replace(/\.(layer|ent)$/i, ''),
    map: world ? `Arma Reforger: ${world}` : '',
    sides: SIDES.filter((s) => used.has(s.id) || s.id !== 'civ').map((s) => ({ id: s.id, name: s.name, color: s.color })),
    groups,
    places,
    notes,
  };
}

/** Whether a file's bytes are the binary entity form (EBIN) rather than text. */
export const isEbin = (bytes: Uint8Array) => bytes.length >= 4 && bytes[0] === 0x45 && bytes[1] === 0x42 && bytes[2] === 0x49 && bytes[3] === 0x4e;

export const reforgerLayer: MissionImporter = {
  id: 'reforger-layer',
  name: 'Arma Reforger (.layer, .ent)',
  accepts: (name) => name.endsWith('.layer') || name.endsWith('.ent'),
  read: async (bytes, name) => {
    if (isEbin(bytes)) throw new Error('this world file is in the binary form the game ships (EBIN): open the layer files the Workbench saved for your scenario (text) instead');
    return readReforgerLayer(new TextDecoder('utf-8').decode(bytes), name.split(/[\\/]/).pop() ?? name);
  },
};
