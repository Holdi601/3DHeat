/**
 * The tactics board's transform gizmo, as math: where a drag along an axis,
 * across a plane or round a ring takes the selection, and applying a move,
 * turn or scale to the selected things of a plan - figures (position and
 * yaw, pitch, roll), whole arrows, single route points, areas and notes.
 * Pure; the overlay (`ui/tactics/BoardGizmo`) turns pointer rays into these.
 */

import { poseFrame } from '../figures/kit';
import { keyAt, routeOf, type Plan, type PlanKey, type Vec3 } from './plan';

export type GizmoMode = 'move' | 'rotate' | 'scale';
export type Axis = 'x' | 'y' | 'z';
export interface Ray {
  origin: Vec3;
  dir: Vec3;
}

export const AXES: Record<Axis, Vec3> = { x: { x: 1, y: 0, z: 0 }, y: { x: 0, y: 1, z: 0 }, z: { x: 0, y: 0, z: 1 } };

const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const add = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
const mul = (a: Vec3, k: number): Vec3 => ({ x: a.x * k, y: a.y * k, z: a.z * k });
const cross = (a: Vec3, b: Vec3): Vec3 => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });

/** The parameter along the line `o + s*axis` of the point nearest the ray; null when they are parallel. */
export function closestOnAxis(ray: Ray, o: Vec3, axis: Vec3): number | null {
  const w = sub(o, ray.origin);
  const a = dot(axis, axis);
  const b = dot(axis, ray.dir);
  const c = dot(ray.dir, ray.dir);
  const d = dot(axis, w);
  const e = dot(ray.dir, w);
  const den = a * c - b * b;
  if (Math.abs(den) < 1e-9) return null;
  return (b * e - c * d) / den;
}

/** Where a ray meets a plane, or null when it runs along it or away. */
export function rayPlane(ray: Ray, p: Vec3, n: Vec3): Vec3 | null {
  const den = dot(ray.dir, n);
  if (Math.abs(den) < 1e-9) return null;
  const t = dot(sub(p, ray.origin), n) / den;
  return t > 0 ? add(ray.origin, mul(ray.dir, t)) : null;
}

/** The signed angle from `a` to `b` about `axis` (right-handed), radians. */
export function angleAbout(a: Vec3, b: Vec3, axis: Vec3): number {
  return Math.atan2(dot(cross(a, b), axis), dot(a, b));
}

/** A ring drag: the angle turned about `axis` through `c` from the first ray to the second; null when the ring is seen edge on. */
export function ringAngle(from: Ray, to: Ray, c: Vec3, axis: Vec3): number | null {
  const p0 = rayPlane(from, c, axis);
  const p1 = rayPlane(to, c, axis);
  if (!p0 || !p1) return null;
  return angleAbout(sub(p0, c), sub(p1, c), axis);
}

export function snapTo(v: number, step: number): number {
  return step > 0 ? Math.round(v / step) * step : v;
}

/** Turns `p` about `axis` (unit) through `c` by `angle` (Rodrigues). */
export function rotateAbout(p: Vec3, c: Vec3, axis: Vec3, angle: number): Vec3 {
  const v = sub(p, c);
  const cs = Math.cos(angle);
  const sn = Math.sin(angle);
  const r = add(add(mul(v, cs), mul(cross(axis, v), sn)), mul(axis, dot(axis, v) * (1 - cs)));
  return add(c, r);
}

/** A plan key's orientation as forward and up (world), through the figures' own pose frame. */
export function orientation(k: { yaw: number; pitch?: number; roll?: number }): { f: Vec3; u: Vec3; r: Vec3 } {
  const fr = poseFrame({ x: 0, y: 0, z: 0, yaw: Math.PI - k.yaw, pitch: k.pitch ?? 0, roll: k.roll ?? 0 });
  const v = (a: number[]): Vec3 => ({ x: a[0], y: a[1], z: a[2] });
  return { f: v(fr.f), u: v(fr.u), r: v(fr.r) };
}

/** Yaw (box yaw), pitch and roll of a forward and up. */
export function eulerOf(f: Vec3, u: Vec3): { yaw: number; pitch: number; roll: number } {
  const h = Math.atan2(f.x, f.z);
  const pitch = Math.asin(Math.max(-1, Math.min(1, f.y)));
  const base = orientation({ yaw: Math.PI - h, pitch, roll: 0 });
  const roll = Math.atan2(dot(u, base.r), dot(u, base.u));
  return { yaw: wrap(Math.PI - h), pitch, roll: Math.abs(roll) < 1e-9 ? 0 : roll };
}

function wrap(a: number): number {
  let x = a % (Math.PI * 2);
  if (x > Math.PI) x -= Math.PI * 2;
  if (x < -Math.PI) x += Math.PI * 2;
  return x;
}

/** A key turned by `angle` about the world `axis`. */
export function rotateKey(k: PlanKey, axis: Vec3, angle: number): PlanKey {
  const o = orientation(k);
  const e = eulerOf(rotateAbout(o.f, { x: 0, y: 0, z: 0 }, axis, angle), rotateAbout(o.u, { x: 0, y: 0, z: 0 }, axis, angle));
  const out: PlanKey = { x: k.x, y: k.y, z: k.z, yaw: e.yaw };
  if (Math.abs(e.pitch) > 1e-9) out.pitch = e.pitch;
  if (Math.abs(e.roll) > 1e-9) out.roll = e.roll;
  return out;
}

/** The gimbal axes of a key: yaw about up, pitch about its level right, roll about its forward. */
export function gimbalAxes(k: { yaw: number; pitch?: number; roll?: number }): Record<Axis, Vec3> {
  const level = orientation({ yaw: k.yaw });
  const pitched = orientation({ yaw: k.yaw, pitch: k.pitch ?? 0 });
  return { y: AXES.y, x: level.r, z: pitched.f };
}

// ------------------------------------------------------------------ selection

/** What a selection reference names: a figure, an arrow, one point of an arrow (`<arrow>#<i>`), an area or a note. */
export type RefKind = 'figure' | 'arrow' | 'point' | 'area' | 'note';

export function refKind(plan: Plan, ref: string): RefKind | null {
  if (ref.includes('#')) return 'point';
  if (plan.figures.some((f) => f.id === ref)) return 'figure';
  if (plan.arrows.some((a) => a.id === ref)) return 'arrow';
  if (plan.areas.some((a) => a.id === ref)) return 'area';
  if (plan.notes.some((n) => n.id === ref)) return 'note';
  return null;
}

/** The places a reference stands at in a step (an arrow: all its points). */
export function refPoints(plan: Plan, step: number, ref: string): Vec3[] {
  const [id, idx] = ref.split('#');
  if (idx !== undefined) {
    const p = plan.arrows.find((a) => a.id === id)?.points[Number(idx)];
    return p ? [p] : [];
  }
  const f = plan.figures.find((x) => x.id === id);
  if (f) {
    const k = keyAt(f, step);
    return k ? [k] : [];
  }
  const a = plan.arrows.find((x) => x.id === id);
  if (a) return a.points;
  const ar = plan.areas.find((x) => x.id === id);
  if (ar) return [ar.centre];
  const n = plan.notes.find((x) => x.id === id);
  return n ? [n.at] : [];
}

/** The middle of a selection: where the gizmo sits. */
export function pivotOf(plan: Plan, step: number, refs: string[]): Vec3 | null {
  const pts = refs.flatMap((r) => refPoints(plan, step, r));
  if (!pts.length) return null;
  const s = pts.reduce((a, p) => add(a, p), { x: 0, y: 0, z: 0 });
  return mul(s, 1 / pts.length);
}

export type Transform =
  | { kind: 'move'; d: Vec3; /** Puts a moved point on the ground; null leaves it. */ ground?: ((p: Vec3, ref: string) => number | null) | null }
  | { kind: 'rotate'; axis: Vec3; angle: number; pivot: Vec3 }
  | { kind: 'scale'; k: Vec3; pivot: Vec3 };

/**
 * A copy of `plan` with a transform applied to the referenced things in
 * `step`. A figure moved or turned in a step after its first gets its own
 * place there; its route in the step starts where it now stands.
 */
export function applyTransform(base: Plan, step: number, refs: string[], t: Transform): Plan {
  const plan = structuredClone(base);
  const movePoint = (p: Vec3, ref: string): Vec3 => {
    if (t.kind === 'move') {
      const q = add(p, t.d);
      const g = t.ground?.(q, ref);
      return g === null || g === undefined ? q : { ...q, y: g };
    }
    if (t.kind === 'rotate') return rotateAbout(p, t.pivot, t.axis, t.angle);
    return { x: t.pivot.x + (p.x - t.pivot.x) * t.k.x, y: t.pivot.y + (p.y - t.pivot.y) * t.k.y, z: t.pivot.z + (p.z - t.pivot.z) * t.k.z };
  };
  const points = new Map<string, Set<number>>();
  for (const ref of refs) {
    const [id, idx] = ref.split('#');
    if (idx !== undefined) {
      if (!points.has(id)) points.set(id, new Set());
      points.get(id)!.add(Number(idx));
      continue;
    }
    const f = plan.figures.find((x) => x.id === id);
    if (f) {
      const k = keyAt(f, step);
      if (!k) continue;
      const p = movePoint(k, ref);
      let nk: PlanKey = { ...k, x: p.x, y: p.y, z: p.z };
      if (t.kind === 'rotate') nk = { ...rotateKey(k, t.axis, t.angle), x: p.x, y: p.y, z: p.z };
      f.keys[step] = nk;
      const route = routeOf(plan, f.id, step);
      if (route && Math.hypot(route.points[0].x - k.x, route.points[0].z - k.z) < 1e-6) route.points[0] = { x: nk.x, y: nk.y, z: nk.z };
      continue;
    }
    const a = plan.arrows.find((x) => x.id === id);
    if (a) {
      points.set(id, new Set(a.points.map((_, i) => i)));
      continue;
    }
    const ar = plan.areas.find((x) => x.id === id);
    if (ar) {
      ar.centre = movePoint(ar.centre, ref);
      if (t.kind === 'scale') ar.radius = Math.max(0.05, ar.radius * Math.max(Math.abs(t.k.x), Math.abs(t.k.z)));
      continue;
    }
    const n = plan.notes.find((x) => x.id === id);
    if (n) n.at = movePoint(n.at, ref);
  }
  for (const [id, idx] of points) {
    const a = plan.arrows.find((x) => x.id === id);
    if (!a) continue;
    for (const i of idx) if (a.points[i]) a.points[i] = movePoint(a.points[i], `${id}#${i}`);
  }
  return plan;
}

/** The figure, arrow point, arrow, note or area nearest a point on the board, within reach, in that order of preference. */
export function pickRef(plan: Plan, step: number, at: Vec3, figureReach: (kind: string) => number, width: number): string | null {
  const flat = (p: Vec3) => Math.hypot(p.x - at.x, p.z - at.z);
  let best: string | null = null;
  let bestD = Infinity;
  const take = (ref: string, d: number, reach: number) => {
    if (d < reach && d < bestD) {
      bestD = d;
      best = ref;
    }
  };
  for (const a of plan.arrows) if (a.step === step) a.points.forEach((p, i) => take(`${a.id}#${i}`, flat(p), width * 1.5));
  if (best) return best;
  for (const f of plan.figures) {
    if (step < f.from || (f.to !== undefined && step > f.to)) continue;
    const k = keyAt(f, step);
    if (k) take(f.id, flat(k), figureReach(f.kind));
  }
  if (best) return best;
  for (const a of plan.arrows) {
    if (a.step !== step) continue;
    for (let i = 0; i + 1 < a.points.length; i++) take(a.id, segDist(at, a.points[i], a.points[i + 1]), width * 1.5);
  }
  for (const n of plan.notes) if (n.step === step) take(n.id, flat(n.at), width * 3);
  if (best) return best;
  for (const a of plan.areas) if (a.step === step) take(a.id, flat(a.centre), a.radius);
  return best;
}

function segDist(p: Vec3, a: Vec3, b: Vec3): number {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const l = dx * dx + dz * dz;
  const u = l > 0 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / l)) : 0;
  return Math.hypot(p.x - (a.x + dx * u), p.z - (a.z + dz * u));
}
