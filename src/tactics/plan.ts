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
}

export interface PlanFigure {
  id: string;
  /** A catalogue name (`figures/catalog.ts`). */
  kind: string;
  team: string;
  label: string;
  /** Place per step index; a step without one keeps the last before it. */
  keys: Record<number, PlanKey>;
  /** First step the figure is on the board in. */
  from: number;
  /** Last step it is on the board in; absent: to the end. */
  to?: number;
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
}

export interface PlanArea {
  id: string;
  step: number;
  team: string;
  centre: Vec3;
  radius: number;
  label: string;
}

export interface PlanNote {
  id: string;
  step: number;
  at: Vec3;
  text: string;
}

export interface Plan {
  version: 1;
  title: string;
  /** Which game's palette and teams the plan was made with (`games.ts`). */
  game: string;
  /** The level it was drawn on, by name, for reference when it is opened again. */
  level: string;
  teams: PlanTeam[];
  steps: { name: string; /** Seconds the step takes when played. */ seconds: number }[];
  figures: PlanFigure[];
  arrows: PlanArrow[];
  areas: PlanArea[];
  notes: PlanNote[];
  /** Figure size multiplier on the board: 1 is true size. */
  figureScale: number;
}

export function emptyPlan(game: string, teams: PlanTeam[], level = ''): Plan {
  return { version: 1, title: '', game, level, teams, steps: [{ name: '1', seconds: 4 }], figures: [], arrows: [], areas: [], notes: [], figureScale: 1 };
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

/** The route a figure walks in a step: its move arrow there, if it has one. */
export function routeOf(plan: Plan, figure: string, step: number): PlanArrow | undefined {
  return plan.arrows.find((a) => a.step === step && a.figure === figure && a.style === 'move');
}

/**
 * Where every figure on the board is at a moment of playback: `step` and a
 * share `u` of it. A figure with a route walks it; one moved to a new key in
 * the next step without a route slides there in a straight line; the rest
 * stand.
 */
export function posesAt(plan: Plan, step: number, u: number): Map<string, PlanKey> {
  const out = new Map<string, PlanKey>();
  for (const f of plan.figures) {
    if (!onBoard(f, step)) continue;
    const here = keyAt(f, step);
    if (!here) continue;
    const route = routeOf(plan, f.id, step);
    if (route && route.points.length >= 2 && u > 0) {
      const a = along(route.points, u);
      out.set(f.id, { ...a.p, yaw: a.yaw });
      continue;
    }
    const next = f.keys[step + 1];
    if (next && u > 0) {
      const dx = next.x - here.x;
      const dz = next.z - here.z;
      const yaw = Math.hypot(dx, dz) > 1e-3 ? Math.atan2(dx, -dz) : here.yaw;
      out.set(f.id, { x: here.x + dx * u, y: here.y + (next.y - here.y) * u, z: here.z + dz * u, yaw: u >= 1 ? next.yaw : yaw });
      continue;
    }
    out.set(f.id, here);
  }
  return out;
}

/** Total playback seconds, and the step and share at a playback time. */
export function playbackAt(plan: Plan, seconds: number): { step: number; u: number; total: number } {
  const total = plan.steps.reduce((s, x) => s + Math.max(0.1, x.seconds), 0);
  let t = Math.max(0, Math.min(total, seconds));
  for (let i = 0; i < plan.steps.length; i++) {
    const d = Math.max(0.1, plan.steps[i].seconds);
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

/**
 * A plan read from JSON, checked: anything not a plan of a known version is
 * refused with the reason; a plan from a newer version is refused rather than
 * half read.
 */
export function readPlan(text: string): Plan {
  let v: unknown;
  try {
    v = JSON.parse(text);
  } catch {
    throw new Error('not JSON');
  }
  const p = v as Partial<Plan>;
  if (!p || typeof p !== 'object') throw new Error('not a plan');
  if (p.version !== 1) throw new Error(`plan version ${String(p.version)} is not one this viewer reads`);
  const arr = (x: unknown) => (Array.isArray(x) ? x : []);
  const num = (x: unknown, d: number) => (typeof x === 'number' && Number.isFinite(x) ? x : d);
  const vec = (x: unknown): Vec3 => {
    const o = (x ?? {}) as Partial<Vec3>;
    return { x: num(o.x, 0), y: num(o.y, 0), z: num(o.z, 0) };
  };
  const teams = arr(p.teams).map((t: PlanTeam) => ({ id: String(t.id), name: String(t.name ?? t.id), color: (Array.isArray(t.color) && t.color.length === 3 ? t.color.map((c) => num(c, 0.5)) : [0.6, 0.6, 0.6]) as [number, number, number] }));
  if (!teams.length) throw new Error('a plan needs at least one team');
  const steps = arr(p.steps).map((s: { name?: unknown; seconds?: unknown }, i) => ({ name: String(s.name ?? i + 1), seconds: num(s.seconds, 4) }));
  return {
    version: 1,
    title: String(p.title ?? ''),
    game: String(p.game ?? 'generic'),
    level: String(p.level ?? ''),
    teams,
    steps: steps.length ? steps : [{ name: '1', seconds: 4 }],
    figures: arr(p.figures).map((f: PlanFigure) => ({
      id: String(f.id),
      kind: String(f.kind),
      team: String(f.team),
      label: String(f.label ?? ''),
      from: num(f.from, 0),
      ...(f.to !== undefined ? { to: num(f.to, 0) } : {}),
      keys: Object.fromEntries(Object.entries(f.keys ?? {}).map(([k, key]) => [Number(k), { ...vec(key), yaw: num((key as PlanKey).yaw, 0) }])),
    })),
    arrows: arr(p.arrows).map((a: PlanArrow) => ({
      id: String(a.id),
      step: num(a.step, 0),
      team: String(a.team),
      style: (['move', 'attack', 'look', 'throw'] as const).includes(a.style) ? a.style : 'move',
      points: arr(a.points).map(vec),
      ...(a.figure ? { figure: String(a.figure) } : {}),
      ...(a.lands ? { lands: String(a.lands) } : {}),
    })),
    areas: arr(p.areas).map((a: PlanArea) => ({ id: String(a.id), step: num(a.step, 0), team: String(a.team), centre: vec(a.centre), radius: num(a.radius, 5), label: String(a.label ?? '') })),
    notes: arr(p.notes).map((n: PlanNote) => ({ id: String(n.id), step: num(n.step, 0), at: vec(n.at), text: String(n.text ?? '') })),
    figureScale: num(p.figureScale, 1),
  };
}
