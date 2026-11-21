/**
 * Mission files as the board's starting state: a game's mission (DCS .miz,
 * Arma 3 mission.sqm, and more to follow) read into one neutral shape - the
 * sides, the groups with their units and routes, and the places that matter
 * (airbases, zones, markers) - and that shape made into a plan: a layer per
 * side, so one side's planners can hide the other's, every unit a figure
 * where the mission puts it, every group's route its route in the first step.
 *
 * A reader for another game implements `MissionImporter` and is added to
 * `IMPORTERS`; nothing else changes. IL-2 (.mission, text), Falcon BMS
 * (.cam/.tac campaign files) and Arma Reforger (.ent world layers / .conf
 * scenarios) are the next ones (see docs/tactics-board.md#mission-files).
 */

import { BASE_LAYER, baseLayer, emptyPlan, newId, type Plan, type PlanFigure, type PlanTeam, type Vec3 } from '../plan';
import { taskDef, type PlanTask, type TaskKind } from '../tasks';
import { gamePreset } from '../games';
import { figureFor } from '../../figures/match';
import { CATALOG } from '../../figures/catalog';
import { figureLabel } from '../names';
import { dcsMiz } from './dcs';
import { armaSqm } from './arma';

export type UnitCategory = 'air' | 'heli' | 'ground' | 'sea' | 'infantry' | 'static';

export interface MissionUnit {
  name: string;
  /** The game's type name, matched to a figure (`figures/match.ts`). */
  type: string;
  category: UnitCategory;
  /** The figure the reader judged it to be, when its type name is not one the catalogue knows. */
  figure?: string;
  /** Board world coordinates (the importer converts from the game's), metres. */
  at: Vec3;
  /** Box yaw, radians (0 looks along -z, pi/2 along +x). */
  yaw: number;
  /** A slot a player takes, not the computer. */
  player?: boolean;
}

/**
 * A task a mission gives a group at a waypoint (DCS waypoint tasks and
 * options, Arma waypoint types, combat modes and behaviours), as the board's
 * task where the reader knows one (`tasks.ts`), else by the game's name.
 */
export interface MissionTask {
  /** The game's own name for it. */
  name: string;
  kind?: TaskKind;
  /** Where it acts, board coordinates: a target, an area's middle and edge, an orbit's anchor and far end. Absent: the waypoint. */
  points?: Vec3[];
  /** Metres: a sector's or an orbit turn's radius. */
  range?: number;
  /** An orbit's height, board y (metres above the board's zero). */
  altitude?: number;
  /** Metres a second. */
  speed?: number;
  duration?: number;
  loops?: number;
  /** A weapons or alarm state (`tasks.ts` ROE_STATES, ALARM_STATES). */
  state?: string;
}

export interface MissionWaypoint {
  at: Vec3;
  /** What the group does there. */
  tasks?: MissionTask[];
  /** Speed on the leg to it, m/s, when the mission sets one. */
  speed?: number;
  /** Seconds from the mission's start it is to be reached, when the mission holds it to that. */
  eta?: number;
  name?: string;
}

export interface MissionGroup {
  name: string;
  side: string;
  category: UnitCategory;
  units: MissionUnit[];
  /** Its route, the first point where it starts. */
  route: MissionWaypoint[];
  /** The group's own task from the start (DCS's main task), when it has one. */
  task?: MissionTask;
}

export interface MissionPlace {
  name: string;
  kind: 'airbase' | 'farp' | 'zone' | 'marker' | 'bullseye' | 'objective';
  at: Vec3;
  side?: string;
  /** A zone's radius, metres. */
  radius?: number;
  text?: string;
}

export interface MissionState {
  /** Which reader read it. */
  format: string;
  /** The board game it plans for (`games.ts`). */
  game: string;
  title: string;
  /** The map it is set on (a DCS theatre, an Arma world), for picking the level. */
  map: string;
  sides: PlanTeam[];
  groups: MissionGroup[];
  places: MissionPlace[];
  /** What could not be read, said plainly (a unit type without a figure, a binarised file). */
  notes: string[];
}

export interface MissionImporter {
  id: string;
  name: string;
  /** File names it reads, lower case: an extension or a whole name. */
  accepts: (name: string) => boolean;
  read: (bytes: Uint8Array, name: string) => Promise<MissionState>;
}

export const IMPORTERS: MissionImporter[] = [dcsMiz, armaSqm];

/** The file chooser's accept list. */
export const MISSION_ACCEPT = '.miz,.sqm';

/** Reads a mission file with the reader that takes its name; refuses one no reader takes. */
export async function readMission(name: string, bytes: Uint8Array): Promise<MissionState> {
  const imp = IMPORTERS.find((i) => i.accepts(name.toLowerCase()));
  if (!imp) throw new Error(`no mission reader for "${name}" (reads ${IMPORTERS.map((i) => i.name).join(', ')})`);
  return imp.read(bytes, name);
}

const FALLBACK: Record<UnitCategory, string> = { air: 'f-16c', heli: 'uh-1h-huey', ground: 'truck', sea: 'patrol-boat', infantry: 'soldier', static: 'forward-base' };
const TAG: Record<UnitCategory, string> = { air: 'Air+FixedWing', heli: 'Air+Rotorcraft', ground: 'Ground', sea: 'Sea', infantry: 'Infantry', static: 'Building' };

/** The figure for a mission unit: its type, else its category's. */
export function figureOfUnit(u: { type: string; category: UnitCategory; figure?: string }): string {
  return figureFor([u.type], u.figure ? [] : [TAG[u.category]]) ?? (u.figure && CATALOG[u.figure] ? u.figure : null) ?? FALLBACK[u.category];
}

/**
 * A plan from a mission: a layer per side (and one for the places), each
 * unit a figure on its side's layer, each group's route given to every unit
 * of the group in the first step (the lead's points, each other unit's moved
 * by where it stands from the lead), with the mission's speeds and the times
 * it holds waypoints to; airbases and FARPs as markers, zones as areas,
 * markers and bullseyes as notes.
 */
export function missionToPlan(m: MissionState): Plan {
  const preset = gamePreset(m.game);
  const sides = m.sides.length ? m.sides : preset.teams;
  const plan = emptyPlan(preset.id, sides, m.map);
  plan.title = m.title;
  plan.unitsPerMetre = 1;
  plan.steps = [{ name: '1', seconds: 10 }];
  const layerOfSide = new Map<string, string>();
  for (const s of sides) {
    if (!m.groups.some((g) => g.side === s.id) && !m.places.some((p) => p.side === s.id)) continue;
    const id = newId('l');
    layerOfSide.set(s.id, id);
    plan.layers.push({ id, name: s.name, visible: true, locked: false });
  }
  const placesLayer = newId('l');
  if (m.places.length) plan.layers.push({ id: placesLayer, name: 'Mission places', visible: true, locked: false });
  const team = (id: string) => (sides.some((s) => s.id === id) ? id : sides[0].id);
  for (const g of m.groups) {
    const layer = layerOfSide.get(g.side);
    const lead = g.units[0];
    const first = plan.figures.length;
    for (const u of g.units) {
      const kind = figureOfUnit(u);
      const f: PlanFigure = { id: newId('f'), kind, team: team(g.side), label: u.name || figureLabel(kind), keys: { 0: { ...u.at, yaw: u.yaw } }, from: 0, ...(layer && layer !== BASE_LAYER ? { layer } : {}) };
      const speed = g.route.find((w, i) => i > 0 && w.speed && w.speed > 0)?.speed;
      // The mission's leg speed as the figure's own cruise (air) or normal (ground) speed.
      if (speed && u.category !== 'static') f.speeds = u.category === 'air' || u.category === 'heli' ? { cruise: speed } : u.category === 'infantry' ? { run: speed } : { normal: speed };
      plan.figures.push(f);
      if (g.route.length >= 2 && lead && u.category !== 'static') {
        const off = { x: u.at.x - lead.at.x, z: u.at.z - lead.at.z };
        const points = [{ ...u.at }, ...g.route.slice(1).map((w) => ({ x: w.at.x + off.x, y: w.at.y, z: w.at.z + off.z }))];
        const at = g.route.map((w, i) => (i > 0 && w.eta !== undefined && w.eta > 0 ? w.eta : null));
        plan.arrows.push({
          id: newId('r'),
          step: 0,
          team: f.team,
          style: 'move',
          points,
          figure: f.id,
          ...(at.some((x) => x !== null) ? { at } : {}),
          ...(u.category === 'air' || u.category === 'heli' ? { mode: 'cruise' as const } : {}),
          ...(layer ? { layer } : {}),
        });
      }
    }
    // The group's tasks: one task for all its units, at the waypoint the mission gives it.
    const ids = plan.figures.slice(first).filter((f) => !f.kind.includes('base')).map((f) => f.id);
    const routed = g.route.length >= 2 && g.category !== 'static';
    const make = (t: MissionTask, at: Vec3, point: number | null) => {
      const kind = t.kind ?? 'game';
      const pts = t.points ?? (taskDef(kind).min > 0 || kind === 'orbit' ? [at] : undefined);
      const task: PlanTask = {
        id: newId('k'),
        kind,
        team: team(g.side),
        figures: ids,
        step: 0,
        label: t.name,
        ...(kind === 'game' ? { game: t.name } : {}),
        ...(point !== null && routed ? { on: { step: 0, from: point } } : { start: 0 }),
        ...(pts ? { points: pts } : {}),
        ...(t.range ? { range: t.range } : {}),
        ...(t.altitude !== undefined && pts?.length ? { altitude: t.altitude - pts[0].y } : {}),
        ...(t.speed ? { speed: t.speed } : {}),
        ...(t.duration ? { duration: t.duration } : {}),
        ...(t.loops ? { loops: t.loops } : {}),
        ...(t.state ? { state: t.state } : {}),
        ...(layer ? { layer } : {}),
      };
      plan.tasks.push(task);
    };
    if (ids.length && g.task) make(g.task, g.route[0]?.at ?? lead?.at ?? { x: 0, y: 0, z: 0 }, null);
    if (ids.length) g.route.forEach((w, i) => w.tasks?.forEach((t) => make(t, w.at, i)));
  }
  const seen = new Set<string>();
  for (const p of m.places) {
    const key = `${p.kind}|${p.name}|${Math.round(p.at.x)}|${Math.round(p.at.z)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const layer = { layer: placesLayer };
    if (p.kind === 'zone' && p.radius) {
      plan.areas.push({ id: newId('a'), step: 0, team: team(p.side ?? sides[0].id), centre: p.at, radius: p.radius, label: p.name, ...layer });
      plan.notes.push({ id: newId('n'), step: 0, at: p.at, text: p.name, show: 'always', ...layer });
    } else if (p.kind === 'airbase' || p.kind === 'farp' || p.kind === 'objective') {
      const kind = p.kind === 'objective' ? 'objective-flag' : 'forward-base';
      plan.figures.push({ id: newId('f'), kind, team: team(p.side ?? sides[0].id), label: p.name, keys: { 0: { ...p.at, yaw: 0 } }, from: 0, ...layer });
    } else {
      plan.notes.push({ id: newId('n'), step: 0, at: p.at, text: p.text ? `${p.name}: ${p.text}` : p.name, show: 'always', ...(p.kind === 'bullseye' ? { color: [0.6, 0.85, 1] as [number, number, number] } : {}), ...layer });
    }
  }
  // The base layer carries nothing of a mission; it stays for the planners' own work.
  if (!plan.layers.some((l) => l.id === BASE_LAYER)) plan.layers.unshift(baseLayer());
  return plan;
}
