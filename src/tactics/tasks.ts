/**
 * Tasks: what a unit or a group does on the board while it moves or stands -
 * attack, defend, patrol a route, sweep an area, overwatch a sector, hold
 * until a go-code, fly a CAP - after the tactical mission tasks of FM 3-90
 * and the task graphics of APP-6 / MIL-STD-2525 (drawn by the board itself,
 * `taskSymbols.ts`), and the waypoint tasks of the games whose missions the
 * board reads (DCS, Arma 3).
 *
 * A task runs for a while of playback: a time window (from `start` for
 * `duration` seconds, or to the plan's end), or a stretch of the figure's
 * route in a step (`on`: from one waypoint to another). Tasks run alongside
 * each other, the routes and the keyframes; a task that moves the figure (a
 * patrol, a sweep, an orbit, following another) takes it over while it runs
 * - bound to a waypoint, the route waits there for it - and a hold keeps the
 * figure at its waypoint until its trigger comes. What cannot work is said,
 * not hidden (`TaskSchedule.conflicts`): two tasks that both move a figure,
 * a task that fires under weapons hold, a patrol that cannot finish its
 * loops in its time at top speed, a hold whose trigger never comes.
 *
 * Plain data in the plan (`Plan.tasks`, `Plan.codes`); everything here is
 * worked out from it and cached per plan.
 */

import { basePoseAt, keyAt, routesIn, shown, type BoardPose, type Plan, type PlanArrow, type PlanFigure, type Vec3 } from './plan';
import { moveClassOf } from './speeds';
import { groundAt, planTimings, poseOnRoute, timePath, timingContext, timingStamp, topSpeed, unitsPerMetre, type RouteTiming, type TimingContext } from './timing';

export type TaskKind =
  | 'attack' | 'seize' | 'secure' | 'breach' | 'sweep' | 'ambush'
  | 'defend' | 'block' | 'delay' | 'withdraw'
  | 'patrol' | 'screen' | 'guard' | 'recon' | 'follow' | 'escort'
  | 'overwatch' | 'suppress' | 'smoke'
  | 'orbit' | 'cas' | 'sead' | 'strike' | 'intercept'
  | 'hold' | 'phaseLine' | 'rally' | 'roe' | 'alarm' | 'game';

export type TaskGroup = 'offense' | 'defense' | 'security' | 'fires' | 'air' | 'control';
export const TASK_GROUPS: TaskGroup[] = ['offense', 'defense', 'security', 'fires', 'air', 'control'];

/** What a task is drawn with on the map: nothing, a point, a line, an area (a circle from two points, else a polygon), a route, a sector, another figure. */
export type TaskShape = 'none' | 'point' | 'line' | 'area' | 'route' | 'sector' | 'figure';

export interface TaskDef {
  id: TaskKind;
  group: TaskGroup;
  /** The unit domains it is for: g ground and people, a air and helicopters, n naval; empty for a control measure of no unit. */
  for: string;
  shape: TaskShape;
  /** Points it needs on the map. */
  min: number;
  /** It moves the figure while it runs: along a path it makes, or with another figure. */
  moves?: 'path' | 'follow';
  /** It needs weapons free. */
  fires?: boolean;
  /** A sector shown as a cone while it runs, `arc` degrees wide unless set. */
  sector?: boolean;
  arc?: number;
  /** Tasks it cannot run alongside (either way round). */
  excludes?: TaskKind[];
  /** Shift + this digit gives the selection the task (`boardKeys.ts`). */
  quick?: number;
  /** The letters on its badge, and what the picker finds it by. */
  code: string;
}

const T = (id: TaskKind, group: TaskGroup, dom: string, shape: TaskShape, min: number, code: string, extra: Partial<TaskDef> = {}): TaskDef => ({ id, group, for: dom, shape, min, code, ...extra });

/** Every task, in the picker's order. */
export const TASKS: TaskDef[] = [
  T('attack', 'offense', 'gan', 'point', 1, 'ATK', { fires: true, quick: 1, excludes: ['withdraw', 'defend'] }),
  T('seize', 'offense', 'g', 'point', 1, 'SZ', { excludes: ['withdraw'] }),
  T('secure', 'offense', 'g', 'area', 2, 'SEC', { excludes: ['withdraw'] }),
  T('breach', 'offense', 'g', 'line', 2, 'BR', { excludes: ['withdraw'] }),
  T('sweep', 'offense', 'gan', 'area', 2, 'SWP', { moves: 'path', quick: 4, excludes: ['defend'] }),
  T('ambush', 'offense', 'g', 'area', 2, 'AMB', { fires: true, excludes: ['withdraw'] }),
  T('defend', 'defense', 'gn', 'sector', 0, 'DEF', { sector: true, arc: 90, quick: 2, excludes: ['withdraw', 'patrol'] }),
  T('block', 'defense', 'g', 'line', 2, 'BLK', { excludes: ['withdraw'] }),
  T('delay', 'defense', 'g', 'line', 2, 'DLY', { excludes: ['attack'] }),
  T('withdraw', 'defense', 'gan', 'point', 1, 'WDR'),
  T('patrol', 'security', 'gan', 'route', 2, 'PTL', { moves: 'path', quick: 3 }),
  T('screen', 'security', 'ga', 'sector', 0, 'SCR', { sector: true, arc: 120 }),
  T('guard', 'security', 'g', 'sector', 0, 'GRD', { sector: true, arc: 90 }),
  T('recon', 'security', 'gan', 'sector', 0, 'REC', { sector: true, arc: 90, quick: 7 }),
  T('follow', 'security', 'gan', 'figure', 0, 'FOL', { moves: 'follow' }),
  T('escort', 'security', 'gan', 'figure', 0, 'ESC', { moves: 'follow' }),
  T('overwatch', 'fires', 'gn', 'sector', 0, 'SBF', { sector: true, arc: 60, fires: true, quick: 5 }),
  T('suppress', 'fires', 'gan', 'sector', 0, 'SUP', { sector: true, arc: 30, fires: true, quick: 6 }),
  T('smoke', 'fires', 'g', 'line', 1, 'SMK'),
  T('orbit', 'air', 'a', 'route', 1, 'CAP', { moves: 'path', quick: 9 }),
  T('cas', 'air', 'a', 'area', 1, 'CAS', { fires: true }),
  T('sead', 'air', 'a', 'area', 1, 'SEAD', { fires: true }),
  T('strike', 'air', 'a', 'point', 1, 'STK', { fires: true }),
  T('intercept', 'air', 'a', 'figure', 0, 'INT', { moves: 'follow', fires: true }),
  T('hold', 'control', 'gan', 'none', 0, 'HLD', { quick: 8 }),
  T('phaseLine', 'control', '', 'line', 2, 'PL'),
  T('rally', 'control', '', 'point', 1, 'RP'),
  T('roe', 'control', 'gan', 'none', 0, 'ROE'),
  T('alarm', 'control', 'gan', 'none', 0, 'ALM'),
  T('game', 'control', 'gan', 'none', 0, '?'),
];

const BY_ID = new Map(TASKS.map((d) => [d.id, d]));
/** A task's definition; an unknown kind is a game task. */
export function taskDef(kind: string): TaskDef {
  return BY_ID.get(kind as TaskKind) ?? BY_ID.get('game')!;
}
export const isTaskKind = (k: unknown): k is TaskKind => typeof k === 'string' && BY_ID.has(k as TaskKind);

/** Weapons states (`roe`), as DCS's ROE and Arma's combat modes have them. */
export const ROE_STATES = ['free', 'tight', 'return', 'hold'] as const;
/** Alarm states and behaviours (`alarm`): DCS's green / red, Arma's behaviours. */
export const ALARM_STATES = ['auto', 'green', 'red', 'safe', 'aware', 'combat', 'stealth'] as const;
export type SweepPattern = 'lanes' | 'square' | 'sector';

/** When a hold ends: at a time, at a go-code, when a figure reaches a waypoint of its route in a step, when another task starts or ends. */
export type TaskTrigger =
  | { kind: 'time'; at: number }
  | { kind: 'code'; code: string }
  | { kind: 'reach'; figure: string; step: number; point: number }
  | { kind: 'task'; task: string; edge: 'start' | 'end' };

/** A go-code: its name, and when it is given (seconds from the plan's start); without a time it is never given. */
export interface GoCode {
  id: string;
  name: string;
  at?: number;
}

export interface PlanTask {
  id: string;
  kind: TaskKind;
  team: string;
  /** The units it is for: one, a group, or none (a control measure: a phase line, a rally point). */
  figures: string[];
  /** The step it was made in: when its graphics show if it runs at no time of its own. */
  step: number;
  layer?: string;
  /** A time window: seconds from the plan's start, and how long (absent: as long as it takes, or to the plan's end). */
  start?: number;
  duration?: number;
  /** Bound to each figure's route in `step`: from waypoint `from` to `to` (absent: its end). A task that moves the figure, and a hold, run at waypoint `from`, the route waiting for them. */
  on?: { step: number; from: number; to?: number };
  /** Its points on the map, plan units: a target, a line, an area (two points a circle), a patrol route, an orbit's anchor (and the racetrack's far end). */
  points?: Vec3[];
  /** A sector: world bearing (box yaw, radians), width (radians) and reach (metres); absent bearing: toward its point, else where the figure's sensor, view or turret points, else ahead. */
  bearing?: number;
  arc?: number;
  range?: number;
  /** How a sweep covers its area, how a patrol goes round its route ('loop' back to its start, or 'back' the way it came). */
  pattern?: SweepPattern | 'loop' | 'back';
  /** Times round (a patrol, an orbit, a sweep), seconds waited at the start after each, lane spacing (metres). */
  loops?: number;
  dwell?: number;
  spacing?: number;
  /** Metres a second (never over the figure's top speed); an orbit's height above its anchor point, metres. */
  speed?: number;
  altitude?: number;
  /** The figure followed, escorted, intercepted or guarded; how far behind (metres). */
  target?: string;
  offset?: number;
  trigger?: TaskTrigger;
  /** A weapons state (`ROE_STATES`) or alarm state (`ALARM_STATES`). */
  state?: string;
  label?: string;
  /** A game's own task name, as a mission had it. */
  game?: string;
}

/** A figure's domain letter for `TaskDef.for`; null for what does not move by itself. */
export function domainOf(kind: string): 'g' | 'a' | 'n' | null {
  const c = moveClassOf(kind);
  return c === 'infantry' || c === 'ground' ? 'g' : c === 'air' || c === 'heli' ? 'a' : c === 'sea' ? 'n' : null;
}

// ---------------------------------------------------------------------------
// Paths a task makes

const head = (h: number) => ({ x: Math.sin(h), z: -Math.cos(h) });
const flatDist = (a: Vec3, b: Vec3) => Math.hypot(b.x - a.x, b.z - a.z);

/** A patrol's one time round: its points and back to the first ('loop'), or there and back the same way ('back'). */
export function patrolPath(points: Vec3[], pattern: PlanTask['pattern'] = 'loop'): Vec3[] {
  if (points.length < 2) return points.slice();
  if (pattern === 'back') return [...points, ...points.slice(0, -1).reverse()];
  const closed = flatDist(points[0], points[points.length - 1]) < 1e-6;
  return closed ? points.slice() : [...points, { ...points[0] }];
}

/** An area's middle and how far its edge reaches from it: two points a circle (middle and edge), more a polygon. */
export function areaOf(points: Vec3[]): { c: Vec3; r: number; poly: Vec3[] | null } {
  if (points.length === 1) return { c: points[0], r: 0, poly: null };
  if (points.length === 2) return { c: points[0], r: flatDist(points[0], points[1]), poly: null };
  const c = points.reduce((s, p) => ({ x: s.x + p.x / points.length, y: s.y + p.y / points.length, z: s.z + p.z / points.length }), { x: 0, y: 0, z: 0 });
  return { c, r: Math.max(...points.map((p) => flatDist(c, p))), poly: points };
}

/**
 * The path a sweep covers its area by, plan units: 'lanes' back and forth
 * `spacing` apart along `bearing` (the area's longest edge when absent),
 * cut to the area; 'square' an expanding square from the middle, legs
 * growing by `spacing` every second turn; 'sector' the three triangles of a
 * sector search through the middle. At most a few hundred legs.
 */
export function sweepPath(area: Vec3[], pattern: SweepPattern, spacing: number, bearing?: number): Vec3[] {
  const { c, r, poly } = areaOf(area);
  if (r <= 0) return [];
  const s = Math.max(spacing, r / 100);
  let h = bearing;
  if (h === undefined) {
    h = 0;
    if (poly) {
      let best = -1;
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i];
        const b = poly[(i + 1) % poly.length];
        const d = flatDist(a, b);
        if (d > best) {
          best = d;
          h = Math.atan2(b.x - a.x, -(b.z - a.z));
        }
      }
    }
  }
  const y = c.y;
  const fwd = head(h);
  const right = { x: -fwd.z, z: fwd.x };
  const pt = (u: number, v: number): Vec3 => ({ x: c.x + fwd.x * u + right.x * v, y, z: c.z + fwd.z * u + right.z * v });
  if (pattern === 'sector') {
    const at = (deg: number) => {
      const d = head(h! + (deg * Math.PI) / 180);
      return { x: c.x + d.x * r, y, z: c.z + d.z * r };
    };
    return [{ ...c, y }, at(0), at(60), { ...c, y }, at(240), at(300), { ...c, y }, at(120), at(180), { ...c, y }];
  }
  if (pattern === 'square') {
    const out: Vec3[] = [{ ...c, y }];
    let u = 0;
    let v = 0;
    for (let leg = 0; leg < 400; leg++) {
      const len = s * (Math.floor(leg / 2) + 1);
      const dir = leg % 4;
      const nu = u + (dir === 0 ? len : dir === 2 ? -len : 0);
      const nv = v + (dir === 1 ? len : dir === 3 ? -len : 0);
      if (Math.hypot(nu, nv) > r * 1.0001) break;
      u = nu;
      v = nv;
      out.push(pt(u, v));
    }
    return out;
  }
  // Lanes: across the area's width, each cut to where it is inside.
  const local = (p: Vec3) => ({ u: (p.x - c.x) * fwd.x + (p.z - c.z) * fwd.z, v: (p.x - c.x) * right.x + (p.z - c.z) * right.z });
  const lp = poly?.map(local) ?? null;
  const vmin = lp ? Math.min(...lp.map((p) => p.v)) : -r;
  const vmax = lp ? Math.max(...lp.map((p) => p.v)) : r;
  const n = Math.min(300, Math.max(1, Math.floor((vmax - vmin) / s)));
  const step = (vmax - vmin) / n;
  const out: Vec3[] = [];
  for (let i = 0; i < n; i++) {
    const v = vmin + step * (i + 0.5);
    let u0: number;
    let u1: number;
    if (lp) {
      const us: number[] = [];
      for (let k = 0; k < lp.length; k++) {
        const a = lp[k];
        const b = lp[(k + 1) % lp.length];
        if ((a.v <= v && b.v > v) || (b.v <= v && a.v > v)) us.push(a.u + ((v - a.v) / (b.v - a.v)) * (b.u - a.u));
      }
      if (us.length < 2) continue;
      u0 = Math.min(...us);
      u1 = Math.max(...us);
    } else {
      const half = Math.sqrt(Math.max(0, r * r - v * v));
      u0 = -half;
      u1 = half;
    }
    const ends = out.length / 2 % 2 ? [u1, u0] : [u0, u1];
    out.push(pt(ends[0], v), pt(ends[1], v));
  }
  return out;
}

/**
 * An orbit's one time round at height `y`: a circle of `radius` round the
 * anchor, turning right; with a second point a racetrack, its legs from the
 * anchor to the far point and back `2 * radius` to their right.
 */
export function orbitPath(points: Vec3[], radius: number, y: number): Vec3[] {
  const a = points[0];
  if (!a) return [];
  const out: Vec3[] = [];
  const n = 36;
  if (points.length < 2 || flatDist(a, points[1]) < radius * 0.1) {
    for (let i = 0; i <= n; i++) {
      const d = head((i / n) * Math.PI * 2);
      out.push({ x: a.x + d.x * radius, y, z: a.z + d.z * radius });
    }
    return out;
  }
  const b = points[1];
  const h = Math.atan2(b.x - a.x, -(b.z - a.z));
  const f = head(h);
  const right = { x: -f.z, z: f.x };
  const arc = (cx: number, cz: number, from: number) => {
    for (let i = 1; i < 12; i++) {
      const d = head(from + (i / 12) * Math.PI);
      out.push({ x: cx + d.x * radius, y, z: cz + d.z * radius });
    }
  };
  out.push({ x: a.x, y, z: a.z }, { x: b.x, y, z: b.z });
  arc(b.x + right.x * radius, b.z + right.z * radius, h - Math.PI / 2);
  out.push({ x: b.x + right.x * 2 * radius, y, z: b.z + right.z * 2 * radius }, { x: a.x + right.x * 2 * radius, y, z: a.z + right.z * 2 * radius });
  arc(a.x + right.x * radius, a.z + right.z * radius, h + Math.PI / 2);
  out.push({ x: a.x, y, z: a.z });
  return out;
}

// ---------------------------------------------------------------------------
// Moving tasks

/** A stretch of a task's movement, seconds from its start: along a timed path (round and round every `period`), or standing. */
export interface MoveSeg {
  t0: number;
  t1: number;
  path?: Vec3[];
  timing?: RouteTiming;
  period?: number;
  at?: Vec3;
  yaw?: number;
  /** Metres a second along the path (an aircraft banks by it in turns). */
  mps?: number;
}

/** How a task moves a figure: from `t0` to `t1` (seconds from the plan's start), the pattern it flies or walks, and its pieces. */
export interface MovePlan {
  task: string;
  kind: TaskKind;
  t0: number;
  t1: number;
  segs: MoveSeg[];
  /** The pattern itself, for the map. */
  path: Vec3[];
  air: boolean;
}

/** Following another figure: `back` behind it and `side` to its right (plan units), easing over `ramp` seconds at either end. */
export interface FollowPlan {
  task: string;
  target: string;
  t0: number;
  t1: number;
  back: number;
  side: number;
  ramp: number;
}

export type ConflictKind = 'moves' | 'roe' | 'excludes' | 'domain' | 'fit' | 'speed' | 'trigger' | 'routeMoves' | 'realTime' | 'noRoute' | 'noTarget' | 'geometry' | 'late';

export interface TaskConflict {
  kind: ConflictKind;
  task: string;
  /** The other task, for a pair that cannot run together. */
  other?: string;
  figure?: string;
  /** Seconds (or metres a second for 'speed') needed and given. */
  needs?: number;
  given?: number;
  /** For 'trigger': why it never comes. */
  reason?: 'code' | 'missing' | 'cycle' | 'after';
}

interface Built {
  segs: MoveSeg[];
  path: Vec3[];
  length: number;
  air: boolean;
  fit?: { needs: number; given: number };
}

const builtCache = new Map<string, Built | null>();

/** Default reach of a sector or an orbit's turn, metres, by the figure's domain. */
function defaultRange(kind: string, what: 'sector' | 'orbit'): number {
  const c = moveClassOf(kind);
  if (what === 'orbit') return c === 'heli' ? 400 : 3000;
  return c === 'infantry' ? 300 : c === 'ground' ? 1500 : c === 'heli' ? 3000 : c === 'air' ? 10000 : c === 'sea' ? 8000 : 300;
}

/**
 * A moving task's path and timing for one figure starting at `anchor`
 * (`off` from the group's lead), seconds from its start: there, round its
 * pattern, and back to the anchor (so the route goes on where it was left).
 * `window` seconds it has, when it has a set time; whole loops for a patrol
 * or a sweep (sped up to the top speed where that makes them fit), any time
 * round for an orbit.
 */
function buildMove(plan: Plan, task: PlanTask, f: PlanFigure, anchor: Vec3, off: { x: number; z: number }, window: number | null): Built | null {
  const upm = unitsPerMetre(plan);
  const key = `${timingStamp()}|${plan.game}|${upm}|${f.kind}|${f.profile ?? ''}|${JSON.stringify(f.speeds ?? null)}|${JSON.stringify(task)}|${anchor.x.toFixed(2)},${anchor.y.toFixed(2)},${anchor.z.toFixed(2)}|${off.x.toFixed(2)},${off.z.toFixed(2)}|${window}`;
  if (builtCache.has(key)) return builtCache.get(key)!;
  if (builtCache.size > 50000) builtCache.clear();
  const out = buildMoveUncached(plan, task, f, anchor, off, window, upm);
  builtCache.set(key, out);
  return out;
}

function buildMoveUncached(plan: Plan, task: PlanTask, f: PlanFigure, anchor: Vec3, off: { x: number; z: number }, window: number | null, upm: number): Built | null {
  const cls = moveClassOf(f.kind);
  if (!cls) return null;
  const air = cls === 'air' || cls === 'heli';
  const pts = (task.points ?? []).map((p) => ({ x: p.x + off.x, y: p.y, z: p.z + off.z }));
  let path: Vec3[] = [];
  if (task.kind === 'patrol') path = patrolPath(pts, task.pattern);
  else if (task.kind === 'sweep') {
    const pattern: SweepPattern = task.pattern === 'square' || task.pattern === 'sector' ? task.pattern : 'lanes';
    const { r } = areaOf(pts);
    path = sweepPath(pts, pattern, task.spacing && task.spacing > 0 ? task.spacing * upm : r / 3, task.bearing);
  } else if (task.kind === 'orbit') {
    const base = pts[0] ?? anchor;
    const y = task.altitude !== undefined ? base.y + task.altitude * upm : anchor.y;
    path = orbitPath(pts.length ? pts : [anchor], (task.range && task.range > 0 ? task.range : defaultRange(f.kind, 'orbit')) * upm, y);
  }
  if (air && task.kind !== 'orbit') path = path.map((p) => ({ ...p, y: anchor.y }));
  if (!air) path = path.map((p) => ({ ...p, y: groundAt(p.x, p.y + 50 * upm, p.z, 100 * upm) ?? p.y }));
  if (path.length < 2) return null;
  const top = topSpeed(plan, f) ?? 0;
  const timed = (v: number | null) => {
    const loop = timePath(plan, f, path, v);
    const tin = timePath(plan, f, [anchor, path[0]], v);
    return loop ? { loop, tin: tin?.total ?? 0 } : null;
  };
  let v = task.speed && task.speed > 0 ? Math.min(task.speed, top || task.speed) : null;
  let t = timed(v);
  if (!t) return null;
  const continuous = task.kind === 'orbit';
  const dwell = Math.max(0, task.dwell ?? 0);
  const outPath = (end: Vec3) => timePath(plan, f, [end, anchor], v)?.total ?? 0;
  let fit: Built['fit'];
  let n = task.loops && task.loops > 0 ? task.loops : 0;
  const needFor = (tt: { loop: RouteTiming; tin: number }, k: number) => tt.tin + k * tt.loop.total + Math.max(0, k - 1) * dwell + outPath(path[path.length - 1]);
  if (window !== null && window > 0) {
    if (!n && continuous) n = Math.max(0, (window - t.tin - outPath(path[0])) / t.loop.total);
    else if (!n) n = Math.floor((window - t.tin - outPath(path[path.length - 1]) + dwell) / (t.loop.total + dwell));
    if (!continuous) n = Math.max(1, n);
    const need = needFor(t, n);
    if (!continuous && need > window + 1e-6) {
      // Faster, up to the top speed, to fit the time it has.
      const moving = need - Math.max(0, n - 1) * dwell;
      const room = window - Math.max(0, n - 1) * dwell;
      const usual = t.loop.segs[0]?.speed ? t.loop.segs[0].speed / upm : top;
      const want = room > 0 ? usual * (moving / room) : Infinity;
      if (top > 0 && want <= top + 1e-6) {
        v = want;
        t = timed(v) ?? t;
      } else {
        v = top || v;
        t = timed(v) ?? t;
        fit = { needs: needFor(t, n), given: window };
      }
    }
  } else if (!n) n = 1;
  const mps = (t.loop.segs[0]?.speed ?? 0) / upm;
  const segs: MoveSeg[] = [];
  let at = 0;
  if (t.tin > 0) {
    const tin = timePath(plan, f, [anchor, path[0]], v)!;
    segs.push({ t0: 0, t1: tin.total, path: [anchor, path[0]], timing: tin, mps });
    at = tin.total;
  }
  const period = t.loop.total + dwell;
  const roundsTime = continuous ? n * t.loop.total : n * t.loop.total + Math.max(0, n - 1) * dwell;
  segs.push({ t0: at, t1: at + roundsTime, path, timing: t.loop, period, mps });
  at += roundsTime;
  // Where the last round left it, and back to the anchor.
  const endT = continuous ? (n % 1) * t.loop.total : t.loop.total;
  const end = poseOnRoute(path, t.loop, endT).p;
  const back = timePath(plan, f, [end, anchor], v);
  if (back && back.total > 0) {
    segs.push({ t0: at, t1: at + back.total, path: [end, anchor], timing: back, mps });
    at += back.total;
  }
  if (window !== null && window > at) {
    segs.push({ t0: at, t1: window, at: anchor, yaw: undefined });
    at = window;
  }
  return { segs, path, length: at, air, ...(fit ? { fit } : {}) };
}

const TAU = Math.PI * 2;
const wrap = (a: number) => ((((a + Math.PI) % TAU) + TAU) % TAU) - Math.PI;

/** Where a moving task has the figure `tau` seconds after it began. */
export function movePose(mp: { segs: MoveSeg[]; air: boolean }, tau: number, upm = 1): { x: number; y: number; z: number; yaw?: number; roll?: number } | null {
  const segs = mp.segs;
  let s = segs[segs.length - 1];
  for (const x of segs) {
    if (tau <= x.t1) {
      s = x;
      break;
    }
  }
  if (!s) return null;
  if (!s.path || !s.timing) return s.at ? { ...s.at, ...(s.yaw !== undefined ? { yaw: s.yaw } : {}) } : null;
  let local = Math.max(0, Math.min(s.t1, tau) - s.t0);
  if (s.period && s.period > 0) {
    local = local % s.period;
    // Waiting at the start between rounds.
    if (local > s.timing.total) local = s.timing.total;
  }
  const r = poseOnRoute(s.path, s.timing, local);
  if (!mp.air) return { ...r.p, yaw: r.yaw, roll: 0 };
  // An aircraft banks into its turns: tan(bank) = speed * turn rate / g.
  const ahead = poseOnRoute(s.path, s.timing, Math.min(s.timing.total, local + 0.5));
  const rate = wrap(ahead.yaw - r.yaw) / 0.5;
  const v = s.mps ?? 0;
  const roll = Math.max(-1.05, Math.min(1.05, Math.atan((v * rate) / 9.81)));
  void upm;
  return { ...r.p, yaw: r.yaw, roll };
}

// ---------------------------------------------------------------------------
// When tasks run

/** A waypoint task's own wait at its waypoint: how long it moves the figure there. */
function waypointMove(plan: Plan, task: PlanTask, f: PlanFigure, route: PlanArrow, i: number, lead: Vec3): Built | null {
  const p = route.points[i];
  return buildMove(plan, task, f, p, { x: p.x - lead.x, z: p.z - lead.z }, task.duration && task.duration > 0 ? task.duration : null);
}

/** The first figure of a task's group that has a route in its step: whose waypoint the others' paths are offset from. */
function leadPoint(plan: Plan, task: PlanTask, step: number, i: number): Vec3 | null {
  for (const id of task.figures) {
    const r = routesIn(plan, step).get(id);
    if (r) return r.points[Math.min(i, r.points.length - 1)];
  }
  return null;
}

const figureIndex = new WeakMap<Plan, Map<string, PlanFigure>>();
function figureById(plan: Plan, id: string): PlanFigure | undefined {
  let m = figureIndex.get(plan);
  if (!m) figureIndex.set(plan, (m = new Map(plan.figures.map((f) => [f.id, f]))));
  return m.get(id);
}

/**
 * Seconds each route waits at its waypoints for the tasks there, by arrow
 * (`timing.ts` adds them to the route's own pauses): a moving task's time
 * there, then a hold's wait for its trigger.
 */
export function taskPauses(plan: Plan, ctx: TimingContext): Map<string, number[]> {
  const out = new Map<string, number[]>();
  const add = (route: PlanArrow, i: number, secs: number) => {
    let xs = out.get(route.id);
    if (!xs) out.set(route.id, (xs = route.points.map(() => 0)));
    xs[i] += secs;
  };
  const tasks = (plan.tasks ?? []).filter((t) => t.on && shown(plan, t));
  for (const pass of ['moves', 'hold'] as const) {
    for (const task of tasks) {
      const def = taskDef(task.kind);
      if (pass === 'moves' ? def.moves !== 'path' : task.kind !== 'hold') continue;
      const on = task.on!;
      for (const id of task.figures) {
        const f = figureById(plan, id);
        const route = routesIn(plan, on.step).get(id);
        if (!f || !route || route.points.length < 2) continue;
        const i = Math.max(0, Math.min(route.points.length - 1, Math.round(on.from)));
        if (pass === 'moves') {
          const lead = leadPoint(plan, task, on.step, i) ?? route.points[i];
          const b = waypointMove(plan, task, f, route, i, lead);
          if (b) add(route, i, b.length);
          continue;
        }
        const timing = ctx.timings.get(route.id);
        if (!timing) continue;
        const before = out.get(route.id)?.[i] ?? 0;
        const holdStart = (ctx.starts[on.step] ?? 0) + timing.arrive[i] + ownPause(route, i) + before;
        const at = triggerTime(plan, task.trigger, ctx, new Set([task.id]));
        if (at !== null && at > holdStart) add(route, i, at - holdStart);
      }
    }
  }
  return out;
}

/** A route's own pause at a point (none at its end, where a route does not wait). */
const ownPause = (route: PlanArrow, i: number) => (i < route.points.length - 1 ? Math.max(0, route.pauses?.[i] ?? 0) : 0);

/** When a trigger comes, seconds from the plan's start; null when it never does. */
export function triggerTime(plan: Plan, trig: TaskTrigger | undefined, ctx: TimingContext, visiting: Set<string>): number | null {
  if (!trig) return null;
  switch (trig.kind) {
    case 'time':
      return Number.isFinite(trig.at) ? Math.max(0, trig.at) : null;
    case 'code': {
      const c = (plan.codes ?? []).find((x) => x.id === trig.code || x.name === trig.code);
      return c && typeof c.at === 'number' && Number.isFinite(c.at) ? c.at : null;
    }
    case 'reach': {
      const route = routesIn(plan, trig.step).get(trig.figure);
      const t = route && ctx.timings.get(route.id);
      if (!t || trig.point < 0 || trig.point >= t.arrive.length) return null;
      return (ctx.starts[trig.step] ?? 0) + t.arrive[trig.point];
    }
    case 'task': {
      const other = (plan.tasks ?? []).find((x) => x.id === trig.task);
      if (!other || visiting.has(other.id) || !shown(plan, other)) return null;
      visiting.add(other.id);
      let best: number | null = null;
      for (const id of other.figures.length ? other.figures : ['']) {
        const w = windowOf(plan, other, id, ctx, visiting);
        if (!w) continue;
        const x = trig.edge === 'start' ? w.t0 : w.t1;
        best = best === null ? x : trig.edge === 'start' ? Math.min(best, x) : Math.max(best, x);
      }
      visiting.delete(other.id);
      return best;
    }
  }
  return null;
}

export interface TaskWindow {
  t0: number;
  t1: number;
}

/**
 * When a task runs for one of its figures ('' for a control measure of no
 * figure), seconds from the plan's start; null when it never does (its route
 * is gone). A time-window task that moves the figure and has no set
 * duration lasts its loops, else to the plan's end.
 */
export function windowOf(plan: Plan, task: PlanTask, fig: string, ctx: TimingContext, visiting: Set<string>, anchor?: Vec3): TaskWindow | null {
  const def = taskDef(task.kind);
  const f = fig ? figureById(plan, fig) : undefined;
  if (task.on && fig) {
    const on = task.on;
    const route = routesIn(plan, on.step).get(fig);
    const t = route && ctx.timings.get(route.id);
    if (!route || !t) return null;
    const s0 = ctx.starts[on.step] ?? 0;
    const last = route.points.length - 1;
    const i = Math.max(0, Math.min(last, Math.round(on.from)));
    const own = ownPause(route, i);
    if (def.moves === 'path' && f) {
      const lead = leadPoint(plan, task, on.step, i) ?? route.points[i];
      const b = waypointMove(plan, task, f, route, i, lead);
      const t0 = s0 + t.arrive[i] + own;
      return { t0, t1: t0 + (b?.length ?? 0) };
    }
    if (task.kind === 'hold') return { t0: s0 + t.arrive[i] + own, t1: s0 + t.depart[i] };
    const j = on.to !== undefined ? Math.max(i, Math.min(last, Math.round(on.to))) : last;
    if (i === last) return { t0: s0 + t.arrive[last], t1: ctx.starts[on.step + 1] ?? ctx.total };
    return { t0: s0 + t.depart[i], t1: s0 + t.arrive[j] };
  }
  const t0 = typeof task.start === 'number' ? Math.max(0, task.start) : (ctx.starts[task.step] ?? 0);
  if (task.duration !== undefined && task.duration > 0) return { t0, t1: t0 + task.duration };
  if (task.kind === 'hold') {
    const at = triggerTime(plan, task.trigger, ctx, visiting);
    return { t0, t1: at === null ? ctx.total : Math.max(t0, at) };
  }
  if (def.moves === 'path' && f && task.loops && task.loops > 0) {
    const k = keyAt(f, stepAt(ctx, t0));
    const b = buildMove(plan, task, f, anchor ?? k ?? { x: 0, y: 0, z: 0 }, { x: 0, z: 0 }, null);
    return { t0, t1: t0 + (b?.length ?? 0) };
  }
  // A control measure made in a step and given no time: that step.
  if (!fig && typeof task.start !== 'number') return { t0, t1: ctx.starts[task.step + 1] ?? ctx.total };
  return { t0, t1: Math.max(t0, ctx.total) };
}

function stepAt(ctx: TimingContext, t: number): number {
  let s = 0;
  for (let i = 0; i < ctx.starts.length; i++) if (ctx.starts[i] <= t + 1e-9) s = i;
  return s;
}

// ---------------------------------------------------------------------------
// The schedule

export interface TaskSchedule {
  /** When each task runs per figure: `${task}|${figure}` (`${task}|` for none). */
  windows: Map<string, TaskWindow>;
  /** Where each figure stood as its task began: `${task}|${figure}`. */
  anchors: Map<string, BoardPose>;
  /** Moving tasks per figure, in time order. */
  moves: Map<string, MovePlan[]>;
  follows: Map<string, FollowPlan[]>;
  /** The shown tasks of each figure, in plan order. */
  byFigure: Map<string, PlanTask[]>;
  conflicts: TaskConflict[];
  total: number;
}

const schedules = new WeakMap<Plan, { stamp: number; s: TaskSchedule }>();

export const winKey = (task: string, fig: string) => `${task}|${fig}`;

/** Every task's time, path and conflicts, per plan and level. */
export function taskSchedule(plan: Plan): TaskSchedule {
  const hit = schedules.get(plan);
  if (hit && hit.stamp === timingStamp()) return hit.s;
  const s = buildSchedule(plan);
  schedules.set(plan, { stamp: timingStamp(), s });
  return s;
}

function buildSchedule(plan: Plan): TaskSchedule {
  const ctx = timingContext(plan, planTimings(plan));
  const upm = unitsPerMetre(plan);
  const out: TaskSchedule = { windows: new Map(), anchors: new Map(), moves: new Map(), follows: new Map(), byFigure: new Map(), conflicts: [], total: ctx.total };
  const conflict = (c: TaskConflict) => out.conflicts.push(c);
  const push = <T>(m: Map<string, T[]>, k: string, v: T) => {
    const xs = m.get(k);
    if (xs) xs.push(v);
    else m.set(k, [v]);
  };
  for (const task of plan.tasks ?? []) {
    if (!shown(plan, task)) continue;
    const def = taskDef(task.kind);
    const figs = task.figures.filter((id) => {
      const f = figureById(plan, id);
      return !!f && shown(plan, f);
    });
    if ((task.points?.length ?? 0) < def.min) conflict({ kind: 'geometry', task: task.id, needs: def.min, given: task.points?.length ?? 0 });
    if (!figs.length) {
      const w = windowOf(plan, task, '', ctx, new Set([task.id]));
      if (w) out.windows.set(winKey(task.id, ''), w);
      continue;
    }
    let lead: Vec3 | null = null;
    for (const id of figs) {
      const f = figureById(plan, id)!;
      push(out.byFigure, id, task);
      const dom = domainOf(f.kind);
      if (dom && def.for && !def.for.includes(dom)) conflict({ kind: 'domain', task: task.id, figure: id });
      if (task.on) {
        if (!routesIn(plan, task.on.step).get(id)) conflict({ kind: 'noRoute', task: task.id, figure: id });
        if (plan.realTime === false && (def.moves === 'path' || task.kind === 'hold')) conflict({ kind: 'realTime', task: task.id, figure: id });
      }
      const top = topSpeed(plan, f);
      if (task.speed && top && task.speed > top + 1e-6) conflict({ kind: 'speed', task: task.id, figure: id, needs: task.speed, given: top });
      // Where it stands as the task begins: its waypoint, else where its routes have it then.
      const pre = windowOf(plan, task, id, ctx, new Set([task.id]));
      if (!pre) continue;
      let anchor: BoardPose | null = null;
      if (task.on) {
        const r = routesIn(plan, task.on.step).get(id);
        const i = Math.max(0, Math.min((r?.points.length ?? 1) - 1, Math.round(task.on.from)));
        anchor = r ? { ...r.points[i], yaw: basePoseAt(plan, f, pre.t0)?.yaw ?? 0 } : null;
      }
      anchor ??= basePoseAt(plan, f, pre.t0) ?? keyAt(f, task.step) ?? null;
      if (!anchor) continue;
      const w = task.on ? pre : (windowOf(plan, task, id, ctx, new Set([task.id]), anchor) ?? pre);
      out.anchors.set(winKey(task.id, id), anchor);
      if (w.t0 > ctx.total + 1e-6) conflict({ kind: 'late', task: task.id, figure: id, needs: w.t0, given: ctx.total });
      lead ??= anchor;
      if (def.moves === 'path') {
        const window = task.on ? (task.duration && task.duration > 0 ? task.duration : null) : task.duration && task.duration > 0 ? task.duration : task.loops && task.loops > 0 ? null : Math.max(0, ctx.total - w.t0);
        const off = task.on ? (() => {
          const lp = leadPoint(plan, task, task.on!.step, Math.round(task.on!.from)) ?? anchor;
          return { x: anchor.x - lp.x, z: anchor.z - lp.z };
        })() : { x: anchor.x - lead.x, z: anchor.z - lead.z };
        const b = buildMove(plan, task, f, anchor, off, window);
        if (!b) {
          if ((task.points?.length ?? 0) >= def.min) conflict({ kind: 'geometry', task: task.id, figure: id, needs: def.min, given: task.points?.length ?? 0 });
          out.windows.set(winKey(task.id, id), w);
          continue;
        }
        if (b.fit) conflict({ kind: 'fit', task: task.id, figure: id, needs: b.fit.needs, given: b.fit.given });
        const t1 = w.t0 + b.length;
        out.windows.set(winKey(task.id, id), { t0: w.t0, t1 });
        push(out.moves, id, { task: task.id, kind: task.kind, t0: w.t0, t1, segs: b.segs, path: b.path, air: b.air });
        if (t1 > ctx.total + 0.5 && !task.on) conflict({ kind: 'late', task: task.id, figure: id, needs: t1, given: ctx.total });
        if (!task.on) routeMovesCheck(plan, ctx, task, id, w.t0, t1, conflict);
        continue;
      }
      out.windows.set(winKey(task.id, id), w);
      if (def.moves === 'follow') {
        const target = task.target ? figureById(plan, task.target) : undefined;
        if (!target || task.target === id) {
          conflict({ kind: 'noTarget', task: task.id, figure: id });
          continue;
        }
        const tp = basePoseAt(plan, target, w.t0);
        const speed = (top ?? 5) * upm;
        const back = (task.offset ?? (task.kind === 'intercept' ? 0 : domainOf(f.kind) === 'a' ? 300 : 30)) * upm;
        const side = task.kind === 'escort' ? back * 0.8 : 0;
        const ramp = tp ? Math.max(0.5, Math.hypot(tp.x - anchor.x, tp.z - anchor.z) / speed) : 1;
        push(out.follows, id, { task: task.id, target: target.id, t0: w.t0, t1: w.t1, back, side, ramp });
        if (!task.on) routeMovesCheck(plan, ctx, task, id, w.t0, w.t1, conflict);
      }
      if (task.kind === 'hold') {
        const at = triggerTime(plan, task.trigger, ctx, new Set([task.id]));
        if (at === null) conflict({ kind: 'trigger', task: task.id, figure: id, reason: task.trigger?.kind === 'code' ? 'code' : task.trigger?.kind === 'task' ? 'cycle' : 'missing' });
        else if (at > ctx.total + 1e-6) conflict({ kind: 'trigger', task: task.id, figure: id, reason: 'after', needs: at, given: ctx.total });
        else if (task.on && at > w.t1 + 0.5) conflict({ kind: 'trigger', task: task.id, figure: id, reason: 'cycle', needs: at, given: w.t1 });
      }
    }
  }
  for (const xs of out.moves.values()) xs.sort((a, b) => a.t0 - b.t0);
  // Pairs on one figure that cannot run at once.
  for (const [id, tasks] of out.byFigure) {
    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        const a = tasks[i];
        const b = tasks[j];
        const wa = out.windows.get(winKey(a.id, id));
        const wb = out.windows.get(winKey(b.id, id));
        if (!wa || !wb || wa.t1 <= wb.t0 + 1e-6 || wb.t1 <= wa.t0 + 1e-6) continue;
        const da = taskDef(a.kind);
        const db = taskDef(b.kind);
        if (da.moves && db.moves) conflict({ kind: 'moves', task: a.id, other: b.id, figure: id });
        else if (da.excludes?.includes(b.kind) || db.excludes?.includes(a.kind)) conflict({ kind: 'excludes', task: a.id, other: b.id, figure: id });
        if ((da.fires && b.kind === 'roe' && b.state === 'hold') || (db.fires && a.kind === 'roe' && a.state === 'hold')) conflict({ kind: 'roe', task: da.fires ? a.id : b.id, other: da.fires ? b.id : a.id, figure: id });
      }
    }
  }
  return out;
}

/** A time-window task that moves a figure while its route also does: the route is overruled meanwhile. */
function routeMovesCheck(plan: Plan, ctx: TimingContext, task: PlanTask, id: string, t0: number, t1: number, conflict: (c: TaskConflict) => void): void {
  for (let s = 0; s < ctx.starts.length; s++) {
    const a = ctx.starts[s];
    const b = ctx.starts[s + 1] ?? ctx.total;
    if (b <= t0 + 1e-6 || a >= t1 - 1e-6) continue;
    const r = routesIn(plan, s).get(id);
    const timing = r && ctx.timings.get(r.id);
    if (timing && timing.total > 0 && a + timing.total > t0 + 1e-6) {
      conflict({ kind: 'routeMoves', task: task.id, figure: id });
      return;
    }
  }
}

/** The figures' poses at a moment with what their moving tasks make of them (`plan.posesAt` calls it). */
export function applyTaskMoves(plan: Plan, poses: Map<string, BoardPose>, time: number): void {
  const s = taskSchedule(plan);
  if (!s.moves.size && !s.follows.size) return;
  const upm = unitsPerMetre(plan);
  for (const [id, plans] of s.moves) {
    const pose = poses.get(id);
    if (!pose) continue;
    for (const mp of plans) {
      if (time < mp.t0 || time > mp.t1) continue;
      const p = movePose(mp, time - mp.t0, upm);
      if (p) poses.set(id, { ...pose, x: p.x, y: p.y, z: p.z, ...(p.yaw !== undefined ? { yaw: p.yaw } : {}), ...(mp.air ? { roll: p.roll ?? 0, pitch: 0 } : {}) });
      break;
    }
  }
  for (const [id, plans] of s.follows) {
    const own = poses.get(id);
    if (!own) continue;
    for (const fp of plans) {
      if (time < fp.t0 || time > fp.t1) continue;
      const t = poses.get(fp.target);
      if (!t) break;
      const d = head(t.yaw);
      const slot = { x: t.x - d.x * fp.back - d.z * fp.side, y: t.y, z: t.z - d.z * fp.back + d.x * fp.side };
      const w = Math.min(1, (time - fp.t0) / fp.ramp, (fp.t1 - time) / fp.ramp);
      const k = w * w * (3 - 2 * w);
      poses.set(id, { ...own, x: own.x + (slot.x - own.x) * k, y: own.y + (slot.y - own.y) * k, z: own.z + (slot.z - own.z) * k, yaw: k > 0.5 ? t.yaw : own.yaw });
      break;
    }
  }
}

/** Whether a task runs at a moment for a figure. */
export function taskActive(s: TaskSchedule, task: string, fig: string, time: number): boolean {
  const w = s.windows.get(winKey(task, fig));
  return !!w && time >= w.t0 - 1e-6 && time <= w.t1 + 1e-6;
}

/**
 * A sector task's cone for a figure at a pose: world bearing (box yaw),
 * width and reach, radians and plan units. Without a set bearing: toward
 * its point, else where the figure's sensor (for recon), view or turret
 * points, else ahead.
 */
export function sectorOf(plan: Plan, task: PlanTask, kind: string, pose: BoardPose): { bearing: number; arc: number; range: number } {
  const def = taskDef(task.kind);
  const upm = unitsPerMetre(plan);
  const arc = task.arc && task.arc > 0 ? task.arc : ((def.arc ?? 60) * Math.PI) / 180;
  const p = task.points?.[0];
  let bearing = task.bearing;
  let range = task.range && task.range > 0 ? task.range * upm : 0;
  if (bearing === undefined && p && Math.hypot(p.x - pose.x, p.z - pose.z) > 1e-3) {
    bearing = Math.atan2(p.x - pose.x, -(p.z - pose.z));
    if (!range) range = Math.hypot(p.x - pose.x, p.z - pose.z) * 1.1;
  }
  if (bearing === undefined) {
    const rel = task.kind === 'recon' ? (pose.sensor?.yaw ?? pose.view?.yaw ?? pose.turret) : (pose.turret ?? pose.view?.yaw);
    bearing = pose.yaw + (rel ?? 0);
  }
  return { bearing, arc, range: range || defaultRange(kind, 'sector') * upm };
}

// ---------------------------------------------------------------------------
// Reading

/** Tasks read from a plan file, checked; `layer` keeps a known layer (else the base). */
export function readTasks(xs: unknown[], layer: (x: { layer?: unknown }) => { layer?: string }): PlanTask[] {
  const num = (x: unknown): number | undefined => (typeof x === 'number' && Number.isFinite(x) ? x : undefined);
  const vec = (x: unknown): Vec3 => {
    const o = (x ?? {}) as Partial<Vec3>;
    return { x: num(o.x) ?? 0, y: num(o.y) ?? 0, z: num(o.z) ?? 0 };
  };
  const out: PlanTask[] = [];
  for (const raw of xs) {
    if (!raw || typeof raw !== 'object') continue;
    const t = raw as Record<string, unknown>;
    if (typeof t.id !== 'string') continue;
    const kind: TaskKind = isTaskKind(t.kind) ? t.kind : 'game';
    const task: PlanTask = {
      id: t.id,
      kind,
      team: String(t.team ?? ''),
      figures: Array.isArray(t.figures) ? t.figures.filter((x): x is string => typeof x === 'string') : [],
      step: Math.max(0, num(t.step) ?? 0),
      ...layer(t as { layer?: unknown }),
    };
    if (!isTaskKind(t.kind) && typeof t.kind === 'string') task.game = t.kind;
    for (const k of ['start', 'duration', 'bearing', 'arc', 'range', 'loops', 'dwell', 'spacing', 'speed', 'altitude', 'offset'] as const) {
      const v = num(t[k]);
      if (v !== undefined) task[k] = v;
    }
    const on = t.on as { step?: unknown; from?: unknown; to?: unknown } | undefined;
    if (on && typeof on === 'object' && num(on.step) !== undefined) task.on = { step: Math.max(0, num(on.step)!), from: Math.max(0, num(on.from) ?? 0), ...(num(on.to) !== undefined ? { to: num(on.to)! } : {}) };
    if (Array.isArray(t.points)) task.points = t.points.map(vec);
    if (typeof t.pattern === 'string' && ['lanes', 'square', 'sector', 'loop', 'back'].includes(t.pattern)) task.pattern = t.pattern as PlanTask['pattern'];
    for (const k of ['target', 'state', 'label', 'game'] as const) if (typeof t[k] === 'string' && t[k]) task[k] = t[k] as string;
    const tr = t.trigger as Record<string, unknown> | undefined;
    if (tr && typeof tr === 'object') {
      if (tr.kind === 'time' && num(tr.at) !== undefined) task.trigger = { kind: 'time', at: num(tr.at)! };
      else if (tr.kind === 'code' && typeof tr.code === 'string') task.trigger = { kind: 'code', code: tr.code };
      else if (tr.kind === 'reach' && typeof tr.figure === 'string') task.trigger = { kind: 'reach', figure: tr.figure, step: num(tr.step) ?? 0, point: num(tr.point) ?? 1 };
      else if (tr.kind === 'task' && typeof tr.task === 'string') task.trigger = { kind: 'task', task: tr.task, edge: tr.edge === 'start' ? 'start' : 'end' };
    }
    out.push(task);
  }
  return out;
}

export function readCodes(xs: unknown[]): GoCode[] {
  return xs
    .filter((c): c is Record<string, unknown> => !!c && typeof c === 'object' && typeof (c as { id?: unknown }).id === 'string')
    .map((c) => ({ id: String(c.id), name: String(c.name ?? c.id), ...(typeof c.at === 'number' && Number.isFinite(c.at) ? { at: Math.max(0, c.at) } : {}) }));
}
