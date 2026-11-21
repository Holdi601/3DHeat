/**
 * A tactics plan: figures placed on a level, arrows for how they move, thrown
 * utility, areas and notes, in steps (phases) that play one after another.
 *
 * A figure has a place in each step it was moved in, and keeps its last one
 * otherwise. An arrow drawn from a figure in a step is that figure's route in
 * the step: played back, the figure walks it, and where the arrow ends is
 * where the figure stands in the next step. A throw is an arc from the thrower
 * to where the utility lands, the utility's figure there.
 *
 * Plain data, saved as JSON (`.h3dplan.json`); nothing in it refers to the
 * renderer, so a plan opens in any later version that knows its `version`.
 */

import type { Mode } from './speeds';
import { planTimings, poseOnRoute, stepDuration, stepStart } from './timing';
import { channelAt } from './keyframes';
import { applyTaskMoves, readCodes, readTasks, type GoCode, type PlanTask } from './tasks';

export type Vec3 = { x: number; y: number; z: number };

export interface PlanTeam {
  id: string;
  name: string;
  /** sRGB 0..1. */
  color: [number, number, number];
}

export interface PlanKey extends Vec3 {
  /** Heading, radians, as box yaw: 0 looks along -z, pi/2 along +x. */
  yaw: number;
  /** Nose up, and right side down, radians; absent is level. */
  pitch?: number;
  roll?: number;
}

/** Where a figure is at a moment of playback, and where its turret, gun, eyes and sensor point (`keyframes.ts`). */
export interface BoardPose extends PlanKey {
  /** Turret yaw from the hull's forward, radians, right positive. */
  turret?: number;
  /** Gun elevation, radians, up positive. */
  gun?: number;
  /** Where it looks, and where its sensor points: yaw from the hull's forward (right positive) and pitch, radians. */
  view?: { yaw: number; pitch: number };
  sensor?: { yaw: number; pitch: number };
}

/**
 * A named layer of the board: a squad's routes, a plan, one of several
 * alternatives for the same figures. Hidden, what is on it is neither drawn
 * nor played; locked, it is drawn and played but cannot be picked or changed.
 * Later layers lie over earlier ones: where two shown layers both route a
 * figure in a step, the later one's route is the one it walks.
 */
export interface PlanLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

/** The layer everything is on that names none. */
export const BASE_LAYER = 'base';

export interface PlanFigure {
  id: string;
  /** A catalogue name (`figures/catalog.ts`). */
  kind: string;
  team: string;
  label: string;
  /** The layer it is on; absent: `BASE_LAYER`. */
  layer?: string;
  /** Keyframes over playback time (`keyframes.ts`): turret, gun, view and sensor direction. */
  tracks?: FigureTracks;
  /** Place per step index; a step without one keeps the last before it. */
  keys: Record<number, PlanKey>;
  /** First step the figure is on the board in. */
  from: number;
  /** Last step it is on the board in; absent: to the end. */
  to?: number;
  /** The speed profile it moves by (`speeds.ts`): a weapon held, a vehicle type; absent picks by its kind. */
  profile?: string;
  /** Its own speed per mode, metres a second, over the game's. */
  speeds?: Partial<Record<Mode, number>>;
}

export type ArrowStyle = 'move' | 'attack' | 'look' | 'throw';

export interface PlanArrow {
  id: string;
  step: number;
  team: string;
  style: ArrowStyle;
  points: Vec3[];
  /** The figure this arrow moves (a route), or throws from. */
  figure?: string;
  /** For a throw: the utility figure that lands at the end. */
  lands?: string;
  /** For a throw: the projectile and how it is thrown (`ballistics.ts`), which bound how far it reaches and its arc. */
  weapon?: string;
  /** A route's movement mode per segment (`speeds.ts`); `mode` for the segments without one. */
  modes?: Mode[];
  mode?: Mode;
  /** Seconds a route waits at each point. */
  pauses?: number[];
  /** When to be at each point, seconds from the step's start (null: as fast as its modes go); never faster than the figure's top speed. */
  at?: (number | null)[];
  layer?: string;
}

export interface PlanArea {
  id: string;
  step: number;
  team: string;
  centre: Vec3;
  radius: number;
  label: string;
  layer?: string;
}

/** When a note shows: in its step, always (every step, and all through playback), or for a while of playback. */
export type NoteShow = 'step' | 'always' | 'timed';

export interface PlanNote {
  id: string;
  step: number;
  at: Vec3;
  text: string;
  layer?: string;
  /** sRGB 0..1; absent: white. */
  color?: [number, number, number];
  /** Text size, CSS pixels; absent: 13. */
  size?: number;
  /** Absent: 'step'. */
  show?: NoteShow;
  /** For 'timed': from `start` seconds of playback for `duration` seconds. */
  start?: number;
  duration?: number;
}

/** A freehand stroke, a circle or a highlighter mark drawn on the level. */
export interface PlanDrawing {
  id: string;
  step: number;
  kind: 'stroke' | 'circle' | 'highlight';
  /** A stroke's or highlight's points; a circle's middle and a point on its edge. */
  points: Vec3[];
  color: [number, number, number];
  /** Line width, metres. */
  width: number;
  /** Shown in every step, not only its own. */
  always?: boolean;
  layer?: string;
}

/** Keyframes of a figure, per channel: values at playback times (seconds from the plan's start), radians. */
export type TrackChannel = 'turret' | 'gun' | 'viewYaw' | 'viewPitch' | 'sensorYaw' | 'sensorPitch';
export const TRACK_CHANNELS: TrackChannel[] = ['turret', 'gun', 'viewYaw', 'viewPitch', 'sensorYaw', 'sensorPitch'];
export type FigureTracks = Partial<Record<TrackChannel, { t: number; v: number }[]>>;

export interface Plan {
  version: 3;
  title: string;
  /** Which game's palette and teams the plan was made with (`games.ts`). */
  game: string;
  /** The level it was drawn on, by name, for reference when it is opened again. */
  level: string;
  teams: PlanTeam[];
  steps: { name: string; /** Seconds the step takes when played. */ seconds: number }[];
  /** At least one; `BASE_LAYER` first. */
  layers: PlanLayer[];
  figures: PlanFigure[];
  arrows: PlanArrow[];
  areas: PlanArea[];
  notes: PlanNote[];
  drawings: PlanDrawing[];
  /** What units do while they move or stand (`tasks.ts`): attack, patrol, overwatch a sector, hold until a trigger; on layers like routes. */
  tasks: PlanTask[];
  /** Go-codes the plan's holds wait for: a name, and when it is given. */
  codes: GoCode[];
  /** Who saved it last and when (ISO time), for telling files apart. */
  savedBy?: string;
  savedAt?: string;
  /** Figure size multiplier on the board: 1 is true size. */
  figureScale: number;
  /** Plan (level) units in a metre; absent: the game's usual (Source units for CS2, metres elsewhere). */
  unitsPerMetre?: number;
  /** False: steps play for their set seconds; otherwise a step lasts until its slowest route arrives. */
  realTime?: boolean;
}

export function emptyPlan(game: string, teams: PlanTeam[], level = ''): Plan {
  return { version: 3, title: '', game, level, teams, steps: [{ name: '1', seconds: 4 }], layers: [baseLayer()], figures: [], arrows: [], areas: [], notes: [], drawings: [], tasks: [], codes: [], figureScale: 1 };
}

export function baseLayer(): PlanLayer {
  return { id: BASE_LAYER, name: 'Base', visible: true, locked: false };
}

/** The layer of anything on the board. */
export const layerOf = (e: { layer?: string }): string => e.layer ?? BASE_LAYER;

/** Each layer by id, per plan. */
const layerIndex = new WeakMap<Plan, Map<string, { layer: PlanLayer; order: number }>>();
function layers(plan: Plan): Map<string, { layer: PlanLayer; order: number }> {
  let m = layerIndex.get(plan);
  if (!m) {
    m = new Map((plan.layers ?? []).map((l, order) => [l.id, { layer: l, order }]));
    layerIndex.set(plan, m);
  }
  return m;
}

/** Whether a thing's layer is shown (a layer the plan does not have is: nothing gets lost). */
export function shown(plan: Plan, e: { layer?: string }): boolean {
  return layers(plan).get(layerOf(e))?.layer.visible ?? true;
}

/** Whether a thing can be picked and changed: shown, and its layer not locked. */
export function editable(plan: Plan, e: { layer?: string }): boolean {
  const l = layers(plan).get(layerOf(e))?.layer;
  return !l || (l.visible && !l.locked);
}

/** A layer's place in the stack (later is on top); one the plan has not got is under all. */
export function layerOrder(plan: Plan, id: string): number {
  return layers(plan).get(id)?.order ?? -1;
}

let counter = 0;
/** An id unique within a session: time plus a counter. */
export function newId(prefix: string): string {
  counter = (counter + 1) % 1e6;
  return `${prefix}${Date.now().toString(36)}${counter.toString(36)}`;
}

/** Where a figure stands at the start of `step`: its key there, or the last before it. */
export function keyAt(f: PlanFigure, step: number): PlanKey | null {
  let best = -1;
  for (const k of Object.keys(f.keys)) {
    const s = Number(k);
    if (s <= step && s > best) best = s;
  }
  return best >= 0 ? f.keys[best] : null;
}

/** Whether a figure is on the board during `step`. */
export function onBoard(f: PlanFigure, step: number): boolean {
  return step >= f.from && (f.to === undefined || step <= f.to);
}

/** A polyline's length and the point and heading a share `u` (0..1) along it. */
export function along(points: Vec3[], u: number): { p: Vec3; yaw: number; length: number } {
  const segs: number[] = [];
  let total = 0;
  for (let i = 0; i + 1 < points.length; i++) {
    const d = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y, points[i + 1].z - points[i].z);
    segs.push(d);
    total += d;
  }
  if (points.length === 0) return { p: { x: 0, y: 0, z: 0 }, yaw: 0, length: 0 };
  if (total <= 0) return { p: { ...points[0] }, yaw: 0, length: 0 };
  let want = Math.max(0, Math.min(1, u)) * total;
  for (let i = 0; i < segs.length; i++) {
    if (want <= segs[i] || i === segs.length - 1) {
      const a = points[i];
      const b = points[i + 1];
      const t = segs[i] > 0 ? Math.min(1, want / segs[i]) : 0;
      return { p: { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t }, yaw: Math.atan2(b.x - a.x, -(b.z - a.z)), length: total };
    }
    want -= segs[i];
  }
  return { p: { ...points[points.length - 1] }, yaw: 0, length: total };
}

/** The route a figure walks in a step: its move arrow there on the topmost shown layer, if it has one. */
export function routeOf(plan: Plan, figure: string, step: number): PlanArrow | undefined {
  return routesIn(plan, step).get(figure);
}

/**
 * Where every figure on the board is at a moment of playback: `step` and a
 * share `u` of it. A figure with a route walks it; one moved to a new key in
 * the next step without a route slides there in a straight line; the rest
 * stand.
 */
export function posesAt(plan: Plan, step: number, u: number): Map<string, BoardPose> {
  // The board's figures and labels ask for the same moment in a frame: the last answer is kept.
  const hit = lastPoses.get(plan);
  if (hit && hit.step === step && hit.u === u) return hit.poses;
  const out = new Map<string, BoardPose>();
  const routes = routesIn(plan, step);
  const length = stepDuration(plan, step);
  // The moment, in seconds from the plan's start: what the keyframes are read at.
  const time = stepStart(plan, step) + u * length;
  for (const f of plan.figures) {
    const pose = figurePose(plan, f, step, u, routes, length, time);
    if (pose) out.set(f.id, pose);
  }
  // Tasks that move a figure while they run (a patrol, a sweep, an orbit, following another).
  if (plan.tasks?.length) applyTaskMoves(plan, out, time);
  lastPoses.set(plan, { step, u, poses: out });
  return out;
}

/** Where a figure is at a moment of playback by its routes and keys alone (no task moves it), or null off the board. */
export function basePoseAt(plan: Plan, f: PlanFigure, time: number): BoardPose | null {
  const at = playbackAt(plan, time);
  return figurePose(plan, f, at.step, at.u, routesIn(plan, at.step), stepDuration(plan, at.step), time);
}

function figurePose(plan: Plan, f: PlanFigure, step: number, u: number, routes: Map<string, PlanArrow>, length: number, time: number): BoardPose | null {
  if (!onBoard(f, step) || !shown(plan, f)) return null;
  const here = keyAt(f, step);
  if (!here) return null;
  let pose: BoardPose = here;
  const route = routes.get(f.id);
  const next = f.keys[step + 1];
  if (route && route.points.length >= 2 && u > 0) {
    const timing = plan.realTime === false ? undefined : planTimings(plan).get(route.id);
    if (timing && timing.total > 0) {
      const r = poseOnRoute(route.points, timing, u * length);
      pose = { ...r.p, yaw: r.yaw, pitch: here.pitch, roll: here.roll };
    } else {
      const a = along(route.points, u);
      pose = { ...a.p, yaw: a.yaw };
    }
  } else if (next && u > 0) {
    const dx = next.x - here.x;
    const dz = next.z - here.z;
    const yaw = Math.hypot(dx, dz) > 1e-3 ? Math.atan2(dx, -dz) : here.yaw;
    pose = { x: here.x + dx * u, y: here.y + (next.y - here.y) * u, z: here.z + dz * u, yaw: u >= 1 ? next.yaw : yaw };
  }
  if (f.tracks) {
    const tr = f.tracks;
    const turret = channelAt(tr, 'turret', time);
    const gun = channelAt(tr, 'gun', time);
    const vy = channelAt(tr, 'viewYaw', time);
    const vp = channelAt(tr, 'viewPitch', time);
    const sy = channelAt(tr, 'sensorYaw', time);
    const sp = channelAt(tr, 'sensorPitch', time);
    pose = {
      ...pose,
      ...(turret !== undefined ? { turret } : {}),
      ...(gun !== undefined ? { gun } : {}),
      ...(vy !== undefined || vp !== undefined ? { view: { yaw: vy ?? 0, pitch: vp ?? 0 } } : {}),
      ...(sy !== undefined || sp !== undefined ? { sensor: { yaw: sy ?? 0, pitch: sp ?? 0 } } : {}),
    };
  }
  return pose;
}

const lastPoses = new WeakMap<Plan, { step: number; u: number; poses: Map<string, BoardPose> }>();
const routeIndex = new WeakMap<Plan, Map<number, Map<string, PlanArrow>>>();

/**
 * Every figure's route in a step, by figure: built once per plan, so a
 * crowded plan is not searched per figure. Only shown layers' routes; where
 * two shown layers route the same figure, the upper layer's.
 */
export function routesIn(plan: Plan, step: number): Map<string, PlanArrow> {
  let byStep = routeIndex.get(plan);
  if (!byStep) routeIndex.set(plan, (byStep = new Map()));
  let m = byStep.get(step);
  if (!m) {
    m = new Map();
    for (const a of plan.arrows) {
      if (a.step !== step || !a.figure || a.style !== 'move' || !shown(plan, a)) continue;
      const had = m.get(a.figure);
      if (!had || layerOrder(plan, layerOf(a)) > layerOrder(plan, layerOf(had))) m.set(a.figure, a);
    }
    byStep.set(step, m);
  }
  return m;
}

/** Figures routed on more than one shown layer in a step: which route plays is the upper layer's. */
export function routeConflicts(plan: Plan, step: number): string[] {
  const seen = new Map<string, number>();
  for (const a of plan.arrows) if (a.step === step && a.figure && a.style === 'move' && shown(plan, a)) seen.set(a.figure, (seen.get(a.figure) ?? 0) + 1);
  return [...seen].filter(([, n]) => n > 1).map(([f]) => f);
}

/** Total playback seconds, and the step and share at a playback time. */
export function playbackAt(plan: Plan, seconds: number): { step: number; u: number; total: number } {
  const lengths = plan.steps.map((_, i) => stepDuration(plan, i));
  const total = lengths.reduce((s, x) => s + x, 0);
  let t = Math.max(0, Math.min(total, seconds));
  for (let i = 0; i < plan.steps.length; i++) {
    const d = lengths[i];
    if (t <= d || i === plan.steps.length - 1) return { step: i, u: Math.min(1, t / d), total };
    t -= d;
  }
  return { step: 0, u: 0, total };
}

/** A parabola from `a` to `b` peaking `apex` above the higher end: a thrown grenade's path. */
export function throwArc(a: Vec3, b: Vec3, apex: number, segments = 24): Vec3[] {
  const top = Math.max(a.y, b.y) + apex;
  const out: Vec3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // A quadratic through a, the apex at the middle, and b.
    const base = a.y + (b.y - a.y) * t;
    const lift = 4 * t * (1 - t) * (top - (a.y + b.y) / 2);
    out.push({ x: a.x + (b.x - a.x) * t, y: base + lift, z: a.z + (b.z - a.z) * t });
  }
  return out;
}

/** The newest plan file version this viewer writes; it reads it and every older one. */
export const PLAN_VERSION = 3;

/**
 * A plan read from JSON, checked: anything not a plan of a known version is
 * refused with the reason; a plan from a newer version is refused rather than
 * half read. A version 1 plan (before layers, drawings and keyframes) comes
 * in with everything on the base layer; a version 2 plan (before tasks and
 * go-codes) with none of either.
 */
export function readPlan(text: string): Plan {
  let v: unknown;
  try {
    v = JSON.parse(text);
  } catch {
    throw new Error('not JSON');
  }
  const p = v as Partial<Omit<Plan, 'version'>> & { version?: unknown };
  if (!p || typeof p !== 'object') throw new Error('not a plan');
  if (p.version !== 1 && p.version !== 2 && p.version !== 3) throw new Error(`plan version ${String(p.version)} is not one this viewer reads`);
  const arr = (x: unknown) => (Array.isArray(x) ? x : []);
  const num = (x: unknown, d: number) => (typeof x === 'number' && Number.isFinite(x) ? x : d);
  const vec = (x: unknown): Vec3 => {
    const o = (x ?? {}) as Partial<Vec3>;
    return { x: num(o.x, 0), y: num(o.y, 0), z: num(o.z, 0) };
  };
  const rgb = (c: unknown, d: [number, number, number] = [0.6, 0.6, 0.6]): [number, number, number] =>
    Array.isArray(c) && c.length === 3 ? (c.map((x) => Math.max(0, Math.min(1, num(x, 0.5)))) as [number, number, number]) : d;
  const str = (x: unknown) => (typeof x === 'string' && x ? x : undefined);
  const teams = arr(p.teams).map((t: PlanTeam) => ({ id: String(t.id), name: String(t.name ?? t.id), color: rgb(t.color) }));
  if (!teams.length) throw new Error('a plan needs at least one team');
  const steps = arr(p.steps).map((s: { name?: unknown; seconds?: unknown }, i) => ({ name: String(s.name ?? i + 1), seconds: num(s.seconds, 4) }));
  const layerList = arr(p.layers).map((l: PlanLayer) => ({ id: String(l.id), name: String(l.name ?? l.id), visible: l.visible !== false, locked: l.locked === true }));
  if (!layerList.some((l) => l.id === BASE_LAYER)) layerList.unshift(baseLayer());
  const ids = new Set(layerList.map((l) => l.id));
  // A thing on a layer the file does not list goes on the base layer.
  const layer = (x: { layer?: unknown }) => {
    const l = str(x.layer);
    return l && l !== BASE_LAYER && ids.has(l) ? { layer: l } : {};
  };
  const tracks = (x: unknown): FigureTracks | undefined => {
    if (!x || typeof x !== 'object') return undefined;
    const out: FigureTracks = {};
    for (const c of TRACK_CHANNELS) {
      const keys = arr((x as Record<string, unknown>)[c])
        .map((k: { t?: unknown; v?: unknown }) => ({ t: num(k.t, NaN), v: num(k.v, NaN) }))
        .filter((k) => Number.isFinite(k.t) && Number.isFinite(k.v))
        .sort((a, b) => a.t - b.t);
      if (keys.length) out[c] = keys;
    }
    return Object.keys(out).length ? out : undefined;
  };
  return {
    version: 3,
    title: String(p.title ?? ''),
    game: String(p.game ?? 'generic'),
    level: String(p.level ?? ''),
    teams,
    steps: steps.length ? steps : [{ name: '1', seconds: 4 }],
    layers: layerList,
    figures: arr(p.figures).map((f: PlanFigure) => {
      const tr = tracks(f.tracks);
      return {
        id: String(f.id),
        kind: String(f.kind),
        team: String(f.team),
        label: String(f.label ?? ''),
        from: num(f.from, 0),
        ...(f.to !== undefined ? { to: num(f.to, 0) } : {}),
        keys: Object.fromEntries(
          Object.entries(f.keys ?? {}).map(([k, key]) => {
            const pk = key as PlanKey;
            return [Number(k), { ...vec(key), yaw: num(pk.yaw, 0), ...(pk.pitch ? { pitch: num(pk.pitch, 0) } : {}), ...(pk.roll ? { roll: num(pk.roll, 0) } : {}) }];
          }),
        ),
        ...(typeof f.profile === 'string' ? { profile: f.profile } : {}),
        ...(f.speeds && typeof f.speeds === 'object' ? { speeds: Object.fromEntries(Object.entries(f.speeds).filter(([, v]) => typeof v === 'number' && v > 0)) } : {}),
        ...layer(f),
        ...(tr ? { tracks: tr } : {}),
      };
    }),
    arrows: arr(p.arrows).map((a: PlanArrow) => ({
      id: String(a.id),
      step: num(a.step, 0),
      team: String(a.team),
      style: (['move', 'attack', 'look', 'throw'] as const).includes(a.style) ? a.style : 'move',
      points: arr(a.points).map(vec),
      ...(a.figure ? { figure: String(a.figure) } : {}),
      ...(a.lands ? { lands: String(a.lands) } : {}),
      ...(Array.isArray(a.modes) ? { modes: a.modes.map(String) as Mode[] } : {}),
      ...(typeof a.mode === 'string' ? { mode: a.mode } : {}),
      ...(Array.isArray(a.pauses) ? { pauses: a.pauses.map((x) => Math.max(0, num(x, 0))) } : {}),
      ...(Array.isArray(a.at) ? { at: a.at.map((x) => (typeof x === 'number' && Number.isFinite(x) && x >= 0 ? x : null)) } : {}),
      ...(a.weapon ? { weapon: String(a.weapon) } : {}),
      ...layer(a),
    })),
    areas: arr(p.areas).map((a: PlanArea) => ({ id: String(a.id), step: num(a.step, 0), team: String(a.team), centre: vec(a.centre), radius: num(a.radius, 5), label: String(a.label ?? ''), ...layer(a) })),
    notes: arr(p.notes).map((n: PlanNote) => ({
      id: String(n.id),
      step: num(n.step, 0),
      at: vec(n.at),
      text: String(n.text ?? ''),
      ...(n.color ? { color: rgb(n.color, [1, 1, 1]) } : {}),
      ...(typeof n.size === 'number' && n.size > 0 ? { size: Math.min(96, n.size) } : {}),
      ...(n.show === 'always' || n.show === 'timed' ? { show: n.show } : {}),
      ...(n.show === 'timed' ? { start: Math.max(0, num(n.start, 0)), duration: Math.max(0.1, num(n.duration, 5)) } : {}),
      ...layer(n),
    })),
    drawings: arr(p.drawings)
      .map((d: PlanDrawing) => ({
        id: String(d.id),
        step: num(d.step, 0),
        kind: (['stroke', 'circle', 'highlight'] as const).includes(d.kind) ? d.kind : 'stroke',
        points: arr(d.points).map(vec),
        color: rgb(d.color, [1, 0.85, 0.3]),
        width: Math.max(0.01, num(d.width, 0.5)),
        ...(d.always ? { always: true } : {}),
        ...layer(d),
      }))
      .filter((d) => d.points.length >= (d.kind === 'circle' ? 2 : 1)),
    tasks: readTasks(arr(p.tasks), layer),
    codes: readCodes(arr(p.codes)),
    figureScale: num(p.figureScale, 1),
    ...(typeof p.unitsPerMetre === 'number' && p.unitsPerMetre > 0 ? { unitsPerMetre: p.unitsPerMetre } : {}),
    ...(p.realTime === false ? { realTime: false } : {}),
    ...(str(p.savedBy) ? { savedBy: str(p.savedBy) } : {}),
    ...(str(p.savedAt) ? { savedAt: str(p.savedAt) } : {}),
  };
}
