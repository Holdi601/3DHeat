/**
 * How long a figure takes along its route: each segment's length over the
 * level (sampled on the surface where there is one), slowed by slope for
 * ground movement as the game's speed table says, at the segment's mode's
 * speed, with any pause at a waypoint. And where a figure is at a moment, so
 * a plan plays in real time.
 */

import { keyAt, onBoard, routesIn, shown, type Plan, type PlanArrow, type PlanFigure, type Vec3 } from './plan';
import { DEFAULT_MODE, MODES, modeSpeed, moveClassOf, speedTable, defaultUnitsPerMetre, type Mode, type SlopeModel } from './speeds';

/** The floor near a point: the level's surface height below `y` (within `reach`), or null. */
export type HeightAt = (x: number, y: number, z: number, reach: number) => number | null;

let terrain: HeightAt | null = null;
let terrainStamp = 0;
/** The engine registers the level's surface; a new stamp drops cached timings. */
export function setTerrain(fn: HeightAt | null, stamp: number): void {
  terrain = fn;
  terrainStamp = stamp;
}

/** Speed share left on a slope (rise over run), by model; 1 on the flat. */
export function slopeFactor(model: SlopeModel, grade: number): number {
  if (model === 'tobler') {
    // Tobler's hiking function, relative to the flat: fastest slightly downhill.
    return Math.max(0.15, Math.min(1.2, Math.exp(-3.5 * Math.abs(grade + 0.05)) / Math.exp(-3.5 * 0.05)));
  }
  if (model === 'grade') return grade > 0 ? Math.max(0.3, 1 - 1.5 * grade) : Math.min(1.1, 1 - 0.3 * grade);
  return 1;
}

export interface SegmentTime {
  /** Distance travelled, plan units (3D over the surface, or horizontal where only that counts). */
  length: number;
  seconds: number;
  mode: Mode;
  /** Mean speed, plan units a second. */
  speed: number;
}

export interface RouteTiming {
  segs: SegmentTime[];
  /** Seconds from the route's start to reaching each point. */
  arrive: number[];
  /** Seconds each point is left: arrive plus its pause. */
  depart: number[];
  total: number;
  /** The route at the figure's top speed all the way, with its pauses: no plan can have it there sooner. */
  minTotal: number;
  /** Waypoints whose wanted arrival time (`at`) cannot be met at the figure's top speed: when it was wanted, and the earliest it gets there. */
  late: { point: number; want: number; got: number }[];
}

export interface RouteOptions {
  /** Plan units a second per mode, or null when the figure does not move. */
  speedOf: (mode: Mode) => number | null;
  modes: Mode[];
  pauses: number[];
  slope: SlopeModel;
  /** Ground movement follows the surface; air and sea fly straight. */
  ground: boolean;
  unitsPerMetre: number;
  heightAt?: HeightAt | null;
  /** The figure's top speed, plan units a second: no segment is faster, whatever arrival time is wanted. */
  maxSpeed?: number | null;
  /** When to be at each point, seconds from the route's start (null: by the segment's mode). */
  at?: (number | null)[];
}

/** Times a polyline. Pure: everything it needs comes in. */
export function timeRoute(points: Vec3[], o: RouteOptions): RouteTiming {
  const segs: SegmentTime[] = [];
  /** Each segment's time at the top speed. */
  const least: number[] = [];
  for (let i = 0; i + 1 < points.length; i++) {
    const a = points[i];
    const b = points[i + 1];
    const mode = o.modes[i] ?? o.modes[o.modes.length - 1];
    const v = o.speedOf(mode) ?? 0;
    const flat = Math.hypot(b.x - a.x, b.z - a.z);
    let length = 0;
    let seconds = 0;
    if (!o.ground) {
      length = Math.hypot(flat, b.y - a.y);
      seconds = v > 0 ? length / v : 0;
    } else {
      // Sampled every couple of metres, up to 64 pieces, on the surface where there is one.
      const n = Math.max(1, Math.min(64, Math.ceil(flat / (2 * o.unitsPerMetre))));
      let px = a.x;
      let py = a.y;
      let pz = a.z;
      const reach = 3 * o.unitsPerMetre;
      for (let k = 1; k <= n; k++) {
        const t = k / n;
        const x = a.x + (b.x - a.x) * t;
        const z = a.z + (b.z - a.z) * t;
        const yLine = a.y + (b.y - a.y) * t;
        const y = k === n ? b.y : (o.heightAt?.(x, yLine + o.unitsPerMetre, z, reach) ?? yLine);
        const dxz = Math.hypot(x - px, z - pz);
        const dy = y - py;
        const piece = o.slope === 'horizontal' ? dxz : Math.hypot(dxz, dy);
        const f = slopeFactor(o.slope, dxz > 1e-9 ? dy / dxz : 0);
        length += piece;
        if (v > 0) seconds += piece / (v * f);
        px = x;
        py = y;
        pz = z;
      }
    }
    // At the top speed the same piece takes the share of the time its mode's speed is of the top.
    const top = o.maxSpeed && o.maxSpeed > 0 ? o.maxSpeed : v;
    segs.push({ length, seconds, mode, speed: seconds > 0 ? length / seconds : 0 });
    least.push(v > 0 && top > 0 ? seconds * Math.min(1, v / top) : seconds);
  }
  // Wanted arrival times: each stretch from the last point with one to the
  // next is spread (faster or slower than its modes) to arrive then, never
  // faster than the top speed - a time that needs more is late, and arrives
  // as early as it can.
  const pause = (i: number) => Math.max(0, o.pauses[i] ?? 0);
  const late: RouteTiming['late'] = [];
  let from = 0;
  let leave = pause(0);
  for (let j = 1; j < points.length; j++) {
    const want = o.at?.[j];
    if (want === null || want === undefined || !Number.isFinite(want)) continue;
    let natural = 0;
    let fastest = 0;
    let waits = 0;
    for (let i = from; i < j; i++) {
      natural += segs[i].seconds;
      fastest += least[i];
      if (i > from) waits += pause(i);
    }
    const moving = want - leave - waits;
    const k = natural > 0 ? Math.max(moving, fastest) / natural : 1;
    if (moving < fastest - 1e-6) late.push({ point: j, want, got: leave + waits + fastest });
    for (let i = from; i < j; i++) {
      const sg = segs[i];
      sg.seconds = natural > 0 ? (moving >= fastest ? sg.seconds * k : least[i]) : sg.seconds;
      sg.speed = sg.seconds > 0 ? sg.length / sg.seconds : 0;
    }
    leave = leave + waits + Math.max(moving, fastest) + (j + 1 < points.length ? pause(j) : 0);
    from = j;
  }
  const arrive = [0];
  const depart = [pause(0)];
  for (let i = 0; i < segs.length; i++) {
    const t = depart[i] + segs[i].seconds;
    arrive.push(t);
    depart.push(t + (i + 2 < points.length ? pause(i + 1) : 0));
  }
  let minTotal = pause(0);
  for (let i = 0; i < least.length; i++) minTotal += least[i] + (i + 2 < points.length ? pause(i + 1) : 0);
  return { segs, arrive, depart, total: arrive[arrive.length - 1], minTotal, late };
}

/** Where along a timed route a figure is `t` seconds after it set off: the point and heading (box yaw). */
export function poseOnRoute(points: Vec3[], timing: RouteTiming, t: number): { p: Vec3; yaw: number; done: boolean } {
  const last = points.length - 1;
  const head = (a: Vec3, b: Vec3) => Math.atan2(b.x - a.x, -(b.z - a.z));
  if (last < 1) return { p: { ...points[0] }, yaw: 0, done: true };
  for (let i = 0; i < last; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (t < timing.depart[i]) return { p: { ...a }, yaw: head(a, b), done: false };
    if (t < timing.arrive[i + 1]) {
      const d = timing.arrive[i + 1] - timing.depart[i];
      const u = d > 0 ? (t - timing.depart[i]) / d : 1;
      return { p: { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, z: a.z + (b.z - a.z) * u }, yaw: head(a, b), done: false };
    }
  }
  return { p: { ...points[last] }, yaw: head(points[last - 1], points[last]), done: true };
}

/** Plan units in a metre: the plan's, else the game's usual. */
export function unitsPerMetre(plan: Plan): number {
  return plan.unitsPerMetre && plan.unitsPerMetre > 0 ? plan.unitsPerMetre : defaultUnitsPerMetre(plan.game);
}

/** A route's modes, one per segment, filled with the figure class's default. */
export function routeModes(arrow: PlanArrow, figure: PlanFigure): Mode[] {
  const cls = moveClassOf(figure.kind);
  const d = cls ? DEFAULT_MODE[cls] : 'run';
  const n = Math.max(0, arrow.points.length - 1);
  return Array.from({ length: n }, (_, i) => (arrow.modes?.[i] as Mode | undefined) ?? (arrow.mode as Mode | undefined) ?? d);
}

/** Times one figure's route. */
export function timeArrow(plan: Plan, arrow: PlanArrow, figure: PlanFigure, heightAt: HeightAt | null = terrain): RouteTiming | null {
  const cls = moveClassOf(figure.kind);
  if (!cls || arrow.points.length < 2) return null;
  const table = speedTable(plan.game);
  const upm = unitsPerMetre(plan);
  return timeRoute(arrow.points, {
    speedOf: (m) => {
      const v = modeSpeed(table, figure.kind, m, figure.profile, figure.speeds);
      return v === null ? null : v * upm;
    },
    modes: routeModes(arrow, figure),
    pauses: arrow.pauses ?? [],
    slope: cls === 'infantry' || cls === 'ground' ? table.slope : 'horizontal',
    ground: cls === 'infantry' || cls === 'ground',
    unitsPerMetre: upm,
    heightAt,
    maxSpeed: (topSpeed(plan, figure) ?? 0) * upm,
    at: arrow.at,
  });
}

/**
 * A figure's top speed, metres a second: the fastest of its class's modes for
 * it - its own speeds where set, else its profile's or its class's in the
 * game's table (`speeds.ts`; a game's table falls back to class defaults).
 * Null for what does not move by itself.
 */
export function topSpeed(plan: Plan, figure: PlanFigure): number | null {
  const cls = moveClassOf(figure.kind);
  if (!cls) return null;
  const table = speedTable(plan.game);
  let best = 0;
  for (const m of MODES[cls]) best = Math.max(best, modeSpeed(table, figure.kind, m, figure.profile, figure.speeds) ?? 0);
  return best > 0 ? best : null;
}

/** Every route's timing in a plan, by arrow id; cached per plan and level. */
const cache = new WeakMap<Plan, { stamp: number; byArrow: Map<string, RouteTiming> }>();
export function planTimings(plan: Plan): Map<string, RouteTiming> {
  const hit = cache.get(plan);
  if (hit && hit.stamp === terrainStamp) return hit.byArrow;
  const byArrow = new Map<string, RouteTiming>();
  const figures = new Map(plan.figures.map((f) => [f.id, f]));
  for (const a of plan.arrows) {
    if (a.style !== 'move' || !a.figure) continue;
    const f = figures.get(a.figure);
    const t = f ? timeArrow(plan, a, f) : null;
    if (t) byArrow.set(a.id, t);
  }
  cache.set(plan, { stamp: terrainStamp, byArrow });
  return byArrow;
}

/**
 * How long a step plays: its set seconds, or longer where a figure could not
 * do what the step asks of it in them - never faster than its top speed. In
 * real time a route takes as long as its modes (and wanted times) make it;
 * with set seconds a route is spread over the step, so the step lasts at
 * least as long as the route takes at the top speed. A figure moved to a new
 * place in the next step without a route slides there, no faster than its
 * top speed either.
 */
export function stepDuration(plan: Plan, step: number): number {
  return stepLimits(plan).byStep[step] ?? Math.max(0.1, plan.steps[step]?.seconds ?? 4);
}

/** A step lengthened past its set seconds, and who made it so. */
export interface SpeedCheck {
  step: number;
  figure: string;
  /** 'late': a wanted arrival time cannot be met; 'slide': a move without a route needs longer than the step; 'squeezed': a route needs longer than the step's set seconds. */
  kind: 'late' | 'slide' | 'squeezed';
  /** Seconds it needs, and the seconds it was given (the wanted time, or the step's set seconds). */
  needs: number;
  given: number;
  /** The route and its waypoint, for a late arrival. */
  arrow?: string;
  point?: number;
}

/** Each step's length and every place the top speeds held a plan back, per plan and level. */
function stepLimits(plan: Plan): { byStep: number[]; checks: SpeedCheck[] } {
  const hit = durations.get(plan);
  if (hit && hit.stamp === terrainStamp) return hit;
  const timings = planTimings(plan);
  const upm = unitsPerMetre(plan);
  const checks: SpeedCheck[] = [];
  const byStep = plan.steps.map((s, i) => {
    const set = Math.max(0.1, s.seconds ?? 4);
    let need = 0;
    // The routes that play: shown layers', the upper one's where two route a figure.
    const routes = routesIn(plan, i);
    for (const a of routes.values()) {
      const t = timings.get(a.id);
      if (!t || !a.figure) continue;
      for (const l of t.late) checks.push({ step: i, figure: a.figure, kind: 'late', needs: l.got, given: l.want, arrow: a.id, point: l.point });
      const route = plan.realTime === false ? t.minTotal : t.total;
      if (plan.realTime === false && route > set + 1e-6) checks.push({ step: i, figure: a.figure, kind: 'squeezed', needs: route, given: set });
      need = Math.max(need, route);
    }
    for (const f of plan.figures) {
      const next = f.keys[i + 1];
      if (!next || routes.has(f.id) || !onBoard(f, i) || !onBoard(f, i + 1) || !shown(plan, f)) continue;
      const here = keyAt(f, i);
      const top = topSpeed(plan, f);
      if (!here || !top) continue;
      const slide = Math.hypot(next.x - here.x, next.y - here.y, next.z - here.z) / (top * upm);
      if (slide > set + 1e-6) checks.push({ step: i, figure: f.id, kind: 'slide', needs: slide, given: set });
      need = Math.max(need, slide);
    }
    return Math.max(set, need);
  });
  const out = { stamp: terrainStamp, byStep, checks };
  durations.set(plan, out);
  return out;
}

/** Everywhere the figures' top speeds held the plan back: late arrivals, and steps lengthened for a figure. */
export function speedChecks(plan: Plan): SpeedCheck[] {
  return stepLimits(plan).checks;
}

/** Each step's length and its checks, per plan and level: playback asks for the lengths every frame. */
const durations = new WeakMap<Plan, { stamp: number; byStep: number[]; checks: SpeedCheck[] }>();

/** Seconds from the plan's start to the start of a step. */
export function stepStart(plan: Plan, step: number): number {
  let t = 0;
  for (let i = 0; i < step; i++) t += stepDuration(plan, i);
  return t;
}

export interface Arrival {
  figure: string;
  label: string;
  team: string;
  step: number;
  /** Index of the waypoint on the route (1 is the first after the start). */
  point: number;
  /** Seconds from the step's start, and from the plan's. */
  inStep: number;
  atPlan: number;
  at: Vec3;
}

/** Every waypoint reached by every routed figure, earliest first. */
export function arrivals(plan: Plan): Arrival[] {
  const timings = planTimings(plan);
  const out: Arrival[] = [];
  for (const a of plan.arrows) {
    const t = timings.get(a.id);
    const f = plan.figures.find((x) => x.id === a.figure);
    if (!t || !f) continue;
    const s0 = stepStart(plan, a.step);
    for (let i = 1; i < a.points.length; i++) out.push({ figure: f.id, label: f.label, team: f.team, step: a.step, point: i, inStep: t.arrive[i], atPlan: s0 + t.arrive[i], at: a.points[i] });
  }
  return out.sort((x, y) => x.atPlan - y.atPlan);
}

/** "0:34" or "1:02:05". */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`;
}
