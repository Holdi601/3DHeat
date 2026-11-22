/**
 * A plan as a mission: the board's figures, routes and tasks back in the
 * neutral mission shape (`index.ts`) a game's writer turns into its file
 * (`dcsWrite.ts`). The way back of `missionToPlan`:
 *
 * - **Groups.** A plan made from a mission knows which figures are which
 *   group's units (`Plan.mission`): those stay that group, with its id. A
 *   figure no group holds joins the group it shares a task with, else the
 *   new figures that share a task are a new group together, else it is a
 *   group of its own. A group whose figures were all taken off the board is
 *   listed as removed; one on a hidden layer is left out, so the file keeps
 *   it as it was.
 * - **Route.** The lead's routes over the steps one after another, from
 *   where it stands at the start: each point a waypoint, with the speed the
 *   board's timing gives the leg and the time where the plan holds it to one
 *   (**Be there**). A step without a route that moves the lead to a new place
 *   adds that place. An aircraft's waypoint drawn on the ground says so
 *   (`onGround`): the writer flies a new one at the height before it.
 * - **Tasks.** Every task of the group's figures at the waypoint it is bound
 *   to (the first, when it is bound to none), with its points, height,
 *   speed, time and state; a task on another figure names that figure's
 *   group.
 */

import { keyAt, onBoard, routeOf, shown, type Plan, type PlanFigure, type Vec3 } from '../plan';
import { groundAt, planTimings, routeModes, stepStart, unitsPerMetre } from '../timing';
import { moveClassOf } from '../speeds';
import type { PlanTask } from '../tasks';
import type { PlanMissionGroup } from '../missionLink';
import { unplaceMission } from './placement';
import type { MissionGroup, MissionState, MissionTask, MissionUnit, MissionWaypoint, UnitCategory } from './index';

/** A figure's mission category by what it is; null for what is not a unit (markers, utility, weapons). */
export function categoryOf(kind: string): UnitCategory | null {
  const c = moveClassOf(kind);
  return c === 'infantry' ? 'infantry' : c === 'ground' ? 'ground' : c === 'air' ? 'air' : c === 'heli' ? 'heli' : c === 'sea' ? 'sea' : null;
}

/** Box yaw (0 along -z, pi/2 along +x) to a DCS-style heading: radians from north (+x), clockwise toward east (+z). */
export function headingOfYaw(yaw: number): number {
  const h = Math.atan2(-Math.cos(yaw), Math.sin(yaw));
  return h < 0 ? h + 2 * Math.PI : h;
}

interface Draft {
  link: PlanMissionGroup | null;
  name: string;
  side: string;
  category: UnitCategory;
  figures: PlanFigure[];
}

/** Where a figure stands when the plan starts: its key in its first step on the board. */
function startOf(f: PlanFigure): { x: number; y: number; z: number; yaw: number } | null {
  return keyAt(f, f.from) ?? keyAt(f, Math.max(0, ...Object.keys(f.keys).map(Number)));
}

/**
 * The lead's route over the plan's steps, and for each step the index of the
 * waypoint its route starts from (what a task's `on.from` counts from).
 */
function routeOfLead(plan: Plan, f: PlanFigure, category: UnitCategory, upm: number): { route: MissionWaypoint[]; offsets: Map<number, number> } {
  const s0 = startOf(f);
  const offsets = new Map<number, number>();
  if (!s0) return { route: [], offsets };
  const air = category === 'air' || category === 'heli';
  // An aircraft's point on the ground (the board's click lands there): the writer flies a new one at the height before it.
  const point = (p: Vec3): MissionWaypoint => {
    const at = { x: p.x / upm, y: p.y / upm, z: p.z / upm };
    if (!air) return { at };
    const g = groundAt(p.x, p.y, p.z, 50 * upm);
    return g !== null ? (p.y - g < 5 * upm ? { at, onGround: true } : { at }) : at.y <= 1 ? { at, onGround: true } : { at };
  };
  const route: MissionWaypoint[] = [point(s0)];
  if (category === 'static') return { route, offsets };
  const timings = planTimings(plan);
  for (let s = 0; s < plan.steps.length; s++) {
    if (!onBoard(f, s)) continue;
    const arrow = routeOf(plan, f.id, s);
    if (arrow && arrow.points.length >= 2) {
      offsets.set(s, route.length - 1);
      const timing = timings.get(arrow.id);
      const t0 = stepStart(plan, s);
      const modes = routeModes(arrow, f);
      const own = f.speeds ? Object.values(f.speeds).filter((v): v is number => typeof v === 'number' && v > 0) : [];
      for (let i = 1; i < arrow.points.length; i++) {
        const w = point(arrow.points[i]);
        const want = arrow.at?.[i];
        const timed = typeof want === 'number' && want >= 0;
        // The figure's own speed for the leg's mode (what the planner sets), else what the timing makes of it; a leg held to a time goes as the time asks.
        const set = f.speeds?.[modes[i - 1]] ?? (own.length === 1 ? own[0] : undefined);
        const seg = timing?.segs[i - 1];
        if (!timed && set) w.speed = set;
        else if (seg && seg.speed > 0) w.speed = seg.speed / upm;
        if (timed) w.eta = t0 + want;
        route.push(w);
      }
      continue;
    }
    offsets.set(s, route.length - 1);
    const next = f.keys[s + 1];
    const last = route[route.length - 1].at;
    if (next && onBoard(f, s + 1) && Math.hypot(next.x / upm - last.x, next.z / upm - last.z) > 1) route.push(point(next));
  }
  return { route, offsets };
}

/** A board task as the mission's: its points, height, speed, time, state; another figure as the group it is in. */
function missionTask(t: PlanTask, groupOfFigure: Map<string, string>, upm: number): MissionTask {
  const pts = t.points?.map((p) => ({ x: p.x / upm, y: p.y / upm, z: p.z / upm }));
  const target = t.target ? groupOfFigure.get(t.target) : undefined;
  return {
    name: t.game ?? t.label ?? t.kind,
    ...(t.kind !== 'game' ? { kind: t.kind } : {}),
    ...(pts?.length ? { points: pts } : {}),
    ...(t.range ? { range: t.range } : {}),
    ...(t.altitude !== undefined && pts?.length ? { altitude: pts[0].y + t.altitude / upm } : {}),
    ...(t.speed ? { speed: t.speed } : {}),
    ...(t.duration ? { duration: t.duration } : {}),
    ...(t.loops ? { loops: t.loops } : {}),
    ...(t.state ? { state: t.state } : {}),
    ...(t.pattern ? { pattern: t.pattern } : {}),
    ...(target ? { target } : {}),
  };
}

/**
 * The plan in the neutral mission shape, for a writer. `notes` says what the
 * board has that a mission does not hold (a figure that is no unit, a task
 * timed to start later than its waypoint).
 */
export function planToMission(plan: Plan): MissionState {
  const link = plan.mission;
  const upm = unitsPerMetre(plan);
  const byId = new Map(plan.figures.map((f) => [f.id, f]));
  const isPlace = (f: PlanFigure) => !!link?.placesLayer && f.layer === link.placesLayer;
  const drafts: Draft[] = [];
  const removed: string[] = [];
  const draftOf = new Map<string, Draft>();
  const unitOf = new Map<string, PlanMissionGroup['units'][number]>();
  const mainTasks = new Set<string>();
  let skipped = 0;
  const flags = new Set<string>();

  for (const g of link?.groups ?? []) {
    if (g.mainTask) mainTasks.add(g.mainTask);
    const figures = g.units.map((u) => byId.get(u.figure)).filter((f): f is PlanFigure => !!f);
    if (!figures.length) {
      removed.push(g.ref);
      continue;
    }
    // On a hidden layer: the file keeps the group as it is.
    if (!figures.some((f) => shown(plan, f))) continue;
    const d: Draft = { link: g, name: g.name, side: g.side, category: (g.category as UnitCategory) || 'ground', figures };
    drafts.push(d);
    for (const f of figures) draftOf.set(f.id, d);
    for (const u of g.units) unitOf.set(u.figure, u);
  }

  // The figures no group holds, by what they are.
  const loose = plan.figures.filter((f) => !draftOf.has(f.id) && shown(plan, f) && !isPlace(f) && !unitOf.has(f.id));
  const catOf = new Map<string, UnitCategory>();
  for (const f of loose) {
    const c = categoryOf(f.kind);
    if (c) catOf.set(f.id, c);
    else skipped++;
  }
  // Shared tasks join figures: to a mission's group, or into a new group together.
  const parent = new Map<string, string>();
  const root = (id: string): string => {
    let r = id;
    while (parent.has(r) && parent.get(r) !== r) r = parent.get(r)!;
    return r;
  };
  for (const t of plan.tasks ?? []) {
    const ids = t.figures.filter((id) => catOf.has(id) || draftOf.has(id));
    for (let i = 1; i < ids.length; i++) {
      const a = byId.get(ids[0])!;
      const b = byId.get(ids[i])!;
      if (a.team !== b.team) continue;
      const ca = catOf.get(a.id) ?? draftOf.get(a.id)?.category;
      const cb = catOf.get(b.id) ?? draftOf.get(b.id)?.category;
      if (ca !== cb) continue;
      const ra = root(a.id);
      const rb = root(b.id);
      // A mission's group stays the root, so a new figure joins it.
      if (ra !== rb) {
        if (draftOf.has(rb) && !draftOf.has(ra)) parent.set(ra, rb);
        else parent.set(rb, ra);
      }
    }
  }
  const taken = new Set(drafts.map((d) => d.name));
  const uniqueName = (base: string) => {
    let n = base || 'Group';
    for (let i = 2; taken.has(n); i++) n = `${base} #${i}`;
    taken.add(n);
    return n;
  };
  const fresh = new Map<string, Draft>();
  for (const f of loose) {
    const c = catOf.get(f.id);
    if (!c) continue;
    const r = root(f.id);
    const joined = draftOf.get(r);
    if (joined && joined.link) {
      joined.figures.push(f);
      draftOf.set(f.id, joined);
      continue;
    }
    let d = fresh.get(r);
    if (!d) {
      d = { link: null, name: '', side: f.team, category: c, figures: [] };
      fresh.set(r, d);
      drafts.push(d);
    }
    d.figures.push(f);
    draftOf.set(f.id, d);
  }
  for (const d of fresh.values()) d.name = uniqueName(d.figures[0].label);
  // Each group by its key in the mission: the file's id, else its name.
  const keyOf = (d: Draft) => d.link?.ref ?? d.name;
  const groupOfFigure = new Map<string, string>();
  for (const d of drafts) for (const f of d.figures) groupOfFigure.set(f.id, keyOf(d));

  const groups: MissionGroup[] = [];
  for (const d of drafts) {
    const lead = d.figures[0];
    const units: MissionUnit[] = [];
    for (const f of d.figures) {
      const s = startOf(f);
      if (!s) continue;
      const u = unitOf.get(f.id);
      units.push({
        name: f.label,
        // A figure changed to another kind is a unit of another type.
        type: u && u.kind === f.kind ? u.type : '',
        figure: f.kind,
        category: d.category === 'ground' && categoryOf(f.kind) === 'infantry' ? 'infantry' : d.category,
        at: { x: s.x / upm, y: s.y / upm, z: s.z / upm },
        yaw: s.yaw,
        ...(u?.ref ? { ref: u.ref } : {}),
        ...(u?.skill ? { skill: u.skill } : {}),
        ...(u?.skill && /^(client|player)$/i.test(u.skill) ? { player: true } : {}),
      });
    }
    if (!units.length) continue;
    const { route, offsets } = routeOfLead(plan, lead, d.category, upm);
    const ids = new Set(d.figures.map((f) => f.id));
    for (const t of plan.tasks ?? []) {
      if (mainTasks.has(t.id) || !t.figures.some((id) => ids.has(id))) continue;
      let at = 0;
      if (t.on && offsets.has(t.on.step)) at = offsets.get(t.on.step)! + t.on.from;
      else if ((t.start ?? 0) > 1) flags.add('start');
      const w = route[Math.max(0, Math.min(route.length - 1, at))];
      if (!w) continue;
      (w.tasks ??= []).push(missionTask(t, groupOfFigure, upm));
    }
    groups.push({ name: d.name, side: d.side, category: d.category, units, route, ...(d.link ? { ref: d.link.ref } : {}), ...(d.link?.country ? { country: d.link.country } : {}) });
  }

  // Lines drawn on the board (strokes), for the games whose missions hold lines.
  const lines = plan.drawings
    .filter((d) => d.kind === 'stroke' && d.points.length >= 2 && shown(plan, d))
    .map((d, i) => ({ name: `Line ${i + 1}`, points: d.points.map((p) => ({ x: p.x / upm, y: p.y / upm, z: p.z / upm })) }));
  const notes: string[] = [];
  if (skipped) notes.push(`skipped:${skipped}`);
  if (flags.has('start')) notes.push('start');
  const out: MissionState = {
    format: link?.format ?? '',
    game: plan.game,
    title: plan.title || link?.source || 'mission',
    map: link?.map ?? plan.level,
    sides: plan.teams,
    groups,
    places: plan.areas.filter((a) => shown(plan, a)).map((a) => ({ name: a.label || 'Zone', kind: 'zone' as const, at: { x: a.centre.x / upm, y: a.centre.y / upm, z: a.centre.z / upm }, radius: a.radius / upm, side: a.team })),
    notes,
    ...(lines.length ? { lines } : {}),
    ...(link?.info ? { info: link.info } : {}),
    ...(removed.length ? { removed } : {}),
  };
  // A mission moved onto its level goes back in the game's own metres.
  return link?.placement ? unplaceMission(out, link.placement) : out;
}
