/**
 * The board's tasks on the map: what each task draws on the level in the
 * step shown (its patrol loop, the sweep's area and pattern, an orbit's
 * racetrack, arrows to targets, lines, sectors, smoke) - built once per
 * plan and step, a few lines a task - and, every frame, the GPU instances
 * that follow the figures: a badge over each unit per task (bright while it
 * runs), a warning badge where something cannot work, a cone for each
 * sector that is active, and a badge at each task's place on the map. The
 * badges are sized on screen (`BoardCam.pxAt`), so they read at any zoom.
 */

import { VertexBuffer, type Frame3, type Rgb } from '../race/geometry';
import type { InstanceBatches } from '../figures/instances';
import { badgeMesh, BADGE_ASPECT, coneMesh } from './taskSymbols';
import { areaOf, sectorOf, taskDef, taskSchedule, winKey, type PlanTask, type TaskKind } from './tasks';
import { shown, type BoardPose, type Plan, type PlanFigure, type Vec3 } from './plan';
import { stepDuration, stepStart, unitsPerMetre } from './timing';

/** The camera, for sizing on screen: where it is, its right and up, and the world units one CSS pixel spans at a distance. */
export interface BoardCam {
  eye: ArrayLike<number>;
  right: [number, number, number];
  up: [number, number, number];
  pxAt: (distance: number) => number;
}

/** Badge height on screen, CSS pixels. */
export const BADGE_PX = 20;

interface Anchor {
  kind: TaskKind;
  at: Vec3;
  team: string;
  task: string;
}

interface Graphics {
  tris: VertexBuffer;
  lines: VertexBuffer;
  anchors: Anchor[];
}

const cache = new WeakMap<Plan, Map<string, Graphics>>();

/** Whether a task runs at some time of a step, for any of its figures. */
function inStep(plan: Plan, task: PlanTask, step: number, windows: Map<string, { t0: number; t1: number }>): boolean {
  const a = stepStart(plan, step);
  const b = a + stepDuration(plan, step);
  for (const id of task.figures.length ? task.figures : ['']) {
    const w = windows.get(winKey(task.id, id));
    if (w && w.t1 >= a - 1e-6 && w.t0 <= b + 1e-6) return true;
  }
  return false;
}

/** The task graphics of a step, kept per plan, step and selected task. */
export function taskGraphics(plan: Plan, step: number, selected: string | null): Graphics {
  let m = cache.get(plan);
  if (!m) cache.set(plan, (m = new Map()));
  const key = `${step}|${selected ?? ''}`;
  let g = m.get(key);
  if (g) return g;
  g = { tris: new VertexBuffer(), lines: new VertexBuffer(), anchors: [] };
  m.set(key, g);
  if (!plan.tasks?.length) return g;
  const s = taskSchedule(plan);
  const upm = unitsPerMetre(plan);
  const color = (team: string): Rgb => plan.teams.find((t) => t.id === team)?.color ?? [0.8, 0.8, 0.8];
  const { lines, tris } = g;
  const lift = 0.15 * upm;
  const seg = (a: Vec3, b: Vec3, c: Rgb, al: number) => lines.line([a.x, a.y + lift, a.z], [b.x, b.y + lift, b.z], c, al);
  const poly = (pts: Vec3[], c: Rgb, al: number, dashed = false) => {
    for (let i = 0; i + 1 < pts.length; i++) {
      if (!dashed) {
        seg(pts[i], pts[i + 1], c, al);
        continue;
      }
      // Dashes about a fiftieth of the leg, at least four a leg.
      const a = pts[i];
      const b = pts[i + 1];
      const n = Math.max(4, Math.min(40, Math.round(Math.hypot(b.x - a.x, b.z - a.z) / (4 * upm))));
      for (let k = 0; k < n; k += 2) {
        const u0 = k / n;
        const u1 = Math.min(1, (k + 1) / n);
        seg(lerp(a, b, u0), lerp(a, b, u1), c, al);
      }
    }
  };
  const headAt = (a: Vec3, b: Vec3, c: Rgb, al: number, size?: number) => {
    const l = Math.hypot(b.x - a.x, b.z - a.z) || 1;
    const h = size ?? Math.min(l * 0.12, 12 * upm);
    const ux = (b.x - a.x) / l;
    const uz = (b.z - a.z) / l;
    for (const sgn of [-1, 1]) seg(b, { x: b.x - ux * h - uz * h * 0.5 * sgn, y: b.y, z: b.z - uz * h + ux * h * 0.5 * sgn }, c, al);
  };
  const circle = (c0: Vec3, r: number, c: Rgb, al: number, a0 = 0, a1 = Math.PI * 2) => {
    const n = Math.max(12, Math.min(64, Math.round(((a1 - a0) / (Math.PI * 2)) * 48)));
    const pts = Array.from({ length: n + 1 }, (_, i) => {
      const a = a0 + ((a1 - a0) * i) / n;
      return { x: c0.x + Math.sin(a) * r, y: c0.y, z: c0.z - Math.cos(a) * r };
    });
    poly(pts, c, al);
  };
  const area = (pts: Vec3[], c: Rgb, al: number, fallback: number) => {
    const { c: mid, r, poly: p } = areaOf(pts);
    if (p) poly([...p, p[0]], c, al);
    else circle(mid, r || fallback, c, al);
    return mid;
  };
  const figures = new Map(plan.figures.map((f) => [f.id, f]));
  for (const task of plan.tasks) {
    if (!shown(plan, task) || !inStep(plan, task, step, s.windows)) continue;
    const def = taskDef(task.kind);
    const sel = task.id === selected;
    const col: Rgb = sel ? [1, 1, 1] : color(task.team);
    const al = sel ? 1 : 0.85;
    const pts = task.points ?? [];
    const lead = task.figures.find((id) => s.anchors.has(winKey(task.id, id)));
    const from = lead ? s.anchors.get(winKey(task.id, lead))! : null;
    let anchor: Vec3 | null = pts[0] ?? from;
    const move = lead ? s.moves.get(lead)?.find((m) => m.task === task.id) : undefined;
    switch (task.kind) {
      case 'patrol':
      case 'orbit':
      case 'sweep': {
        if (task.kind === 'sweep' && pts.length >= 2) anchor = area(pts, col, al, 0);
        if (move && move.path.length >= 2) {
          poly(move.path, col, al * 0.8, true);
          // Which way round: a head every few legs.
          const every = Math.max(1, Math.floor(move.path.length / 6));
          for (let i = every; i < move.path.length; i += every) headAt(move.path[i - 1], move.path[i], col, al, Math.hypot(move.path[i].x - move.path[i - 1].x, move.path[i].z - move.path[i - 1].z) * 0.08);
          if (task.kind === 'orbit') {
            const c0 = pts[0] ?? move.path[0];
            seg({ ...c0, y: move.path[0].y }, c0, col, 0.4);
            anchor = { ...c0, y: move.path[0].y };
          }
        } else if (pts.length >= 2) poly(task.kind === 'patrol' ? [...pts, pts[0]] : pts, col, al * 0.6, true);
        break;
      }
      case 'secure':
      case 'ambush':
      case 'cas':
      case 'sead': {
        if (!pts.length) break;
        anchor = area(pts, col, al, (task.range && task.range > 0 ? task.range : 500) * upm);
        if (task.kind === 'ambush' && from) {
          // The ambush line: an arc on the near side of the kill zone, barbs toward it.
          const h = Math.atan2(anchor.x - from.x, -(anchor.z - from.z));
          const r = Math.hypot(anchor.x - from.x, anchor.z - from.z) * 0.35;
          circle(from, r, col, al, h - 0.6, h + 0.6);
          for (const d of [-0.4, 0, 0.4]) {
            const p = { x: from.x + Math.sin(h + d) * r, y: from.y, z: from.z - Math.cos(h + d) * r };
            seg(p, { x: p.x + Math.sin(h) * r * 0.25, y: p.y, z: p.z - Math.cos(h) * r * 0.25 }, col, al);
          }
        } else if (from && (task.kind === 'cas' || task.kind === 'sead')) {
          poly([from, anchor], col, al * 0.6, true);
          headAt(from, anchor, col, al);
        }
        break;
      }
      case 'attack':
      case 'seize':
      case 'strike':
      case 'withdraw': {
        if (!pts.length) break;
        const to = pts[0];
        if (from) {
          seg(from, to, col, al);
          headAt(from, to, col, al);
        }
        if (task.kind === 'seize') circle(to, Math.max(5 * upm, (from ? Math.hypot(to.x - from.x, to.z - from.z) : 50 * upm) * 0.12), col, al);
        if (task.kind === 'strike') {
          const r = 10 * upm;
          seg({ x: to.x - r, y: to.y, z: to.z - r }, { x: to.x + r, y: to.y, z: to.z + r }, col, al);
          seg({ x: to.x - r, y: to.y, z: to.z + r }, { x: to.x + r, y: to.y, z: to.z - r }, col, al);
        }
        break;
      }
      case 'rally': {
        if (!pts.length) break;
        const p = pts[0];
        const r = 8 * upm;
        poly([{ x: p.x - r, y: p.y, z: p.z + r * 0.6 }, { x: p.x + r, y: p.y, z: p.z + r * 0.6 }, { x: p.x, y: p.y, z: p.z - r }, { x: p.x - r, y: p.y, z: p.z + r * 0.6 }], col, al);
        break;
      }
      case 'breach':
      case 'block':
      case 'delay':
      case 'smoke':
      case 'phaseLine': {
        if (pts.length < 1) break;
        if (task.kind === 'smoke') {
          const w = (task.range && task.range > 0 ? task.range : 20) * upm;
          if (pts.length === 1) circle(pts[0], w, [0.75, 0.75, 0.75], 0.8);
          for (let i = 0; i + 1 < pts.length; i++) band(tris, pts[i], pts[i + 1], w / 2, lift, [0.8, 0.8, 0.8], 0.35);
          anchor = pts[Math.floor(pts.length / 2)];
          break;
        }
        poly(pts, col, al, task.kind === 'phaseLine');
        const n = pts.length;
        if (n >= 2) {
          const bar = (p: Vec3, q: Vec3) => {
            const l = Math.hypot(q.x - p.x, q.z - p.z) || 1;
            const k = Math.min(l * 0.2, 20 * upm);
            const nx = (-(q.z - p.z) / l) * k;
            const nz = ((q.x - p.x) / l) * k;
            seg({ x: q.x + nx, y: q.y, z: q.z + nz }, { x: q.x - nx, y: q.y, z: q.z - nz }, col, al);
          };
          if (task.kind === 'block' || task.kind === 'breach') bar(pts[n - 2], pts[n - 1]);
          if (task.kind === 'breach') bar(pts[1], pts[0]);
          if (task.kind === 'delay') headAt(pts[n - 2], pts[n - 1], col, al);
        }
        anchor = n >= 2 ? lerp(pts[0], pts[1], 0.5) : pts[0];
        break;
      }
      case 'follow':
      case 'escort':
      case 'intercept': {
        const tf = task.target ? figures.get(task.target) : undefined;
        const ta = tf ? (s.anchors.get(winKey(task.id, lead ?? '')) ?? null) : null;
        if (from && tf) {
          const k = tf.keys[step] ?? Object.values(tf.keys)[0];
          if (k) {
            poly([from, k], col, al * 0.6, true);
            headAt(from, k, col, al);
          }
        }
        void ta;
        anchor = from;
        break;
      }
      case 'hold': {
        if (from) {
          circle(from, 6 * upm, col, al);
          circle(from, 4 * upm, col, al);
        }
        anchor = from;
        break;
      }
      default: {
        // A sector task drawn where it starts, faintly; the cone shows while it runs.
        if (def.sector && from && lead) {
          const f = figures.get(lead);
          if (f) {
            const sc = sectorOf(plan, task, f.kind, from);
            const r = sc.range;
            circle(from, r, col, 0.35, sc.bearing - sc.arc / 2, sc.bearing + sc.arc / 2);
            for (const a of [sc.bearing - sc.arc / 2, sc.bearing + sc.arc / 2]) seg(from, { x: from.x + Math.sin(a) * r, y: from.y, z: from.z - Math.cos(a) * r }, col, 0.35);
            if (task.kind === 'defend') {
              // The battle position: open toward the enemy, round the unit.
              const b = 12 * upm;
              const fw = { x: Math.sin(sc.bearing), z: -Math.cos(sc.bearing) };
              const rt = { x: -fw.z, z: fw.x };
              const p = (u: number, v: number) => ({ x: from.x + fw.x * u * b + rt.x * v * b, y: from.y, z: from.z + fw.z * u * b + rt.z * v * b });
              poly([p(0.8, -1), p(-0.8, -1), p(-0.8, 1), p(0.8, 1)], col, al);
            }
          }
        }
        anchor = null;
      }
    }
    if (anchor && task.kind !== 'hold' && !(def.sector && !pts.length)) g.anchors.push({ kind: task.kind, at: anchor, team: task.team, task: task.id });
  }
  return g;
}

const lerp = (a: Vec3, b: Vec3, u: number): Vec3 => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, z: a.z + (b.z - a.z) * u });

/** A flat band `hw` either side of a leg. */
function band(tris: VertexBuffer, a: Vec3, b: Vec3, hw: number, lift: number, c: Rgb, al: number): void {
  const l = Math.hypot(b.x - a.x, b.z - a.z) || 1;
  const nx = (-(b.z - a.z) / l) * hw;
  const nz = ((b.x - a.x) / l) * hw;
  tris.quad([a.x + nx, a.y + lift, a.z + nz], [b.x + nx, b.y + lift, b.z + nz], [b.x - nx, b.y + lift, b.z - nz], [a.x - nx, a.y + lift, a.z - nz], c, al);
}

/**
 * The task instances of a frame: badges over the units and at the tasks'
 * places, warnings, and the cones of the sectors that run now. Positions
 * relative to `origin`, as the figures'.
 */
export function taskInstances(
  plan: Plan,
  step: number,
  time: number,
  poses: Map<string, BoardPose>,
  cam: BoardCam,
  origin: ArrayLike<number>,
  out: InstanceBatches,
  topOf: (f: PlanFigure) => number,
  selected: string | null,
): void {
  if (!plan.tasks?.length) return;
  const s = taskSchedule(plan);
  const [ox, oy, oz] = [origin[0], origin[1], origin[2]];
  const ex = cam.eye[0];
  const ey = cam.eye[1];
  const ez = cam.eye[2];
  const R = cam.right;
  const U = cam.up;
  const F: Frame3 = { o: [0, 0, 0], f: R, r: [0, 0, 0], u: U };
  const teams = new Map(plan.teams.map((t) => [t.id, t.color]));
  const grey: Rgb = [0.8, 0.8, 0.8];
  const color = (team: string): Rgb => teams.get(team) ?? grey;
  const white: Rgb = [1, 1, 1];
  const cone: Frame3 = { o: [0, 0, 0], f: [0, 0, 0], r: [0, 0, 0], u: [0, 1, 0] };
  const conflicted = conflictFigures(plan);
  const badge = (kind: TaskKind | 'conflict', x: number, y: number, z: number, h: number, col: Rgb, alpha: number) => {
    F.o[0] = x - ox;
    F.o[1] = y - oy;
    F.o[2] = z - oz;
    out.add(badgeMesh(kind), F, h, col, alpha);
  };
  const a0 = stepStart(plan, step);
  const a1 = a0 + stepDuration(plan, step);
  for (const [id, tasks] of figureRows(plan, s)) {
    const p = poses.get(id);
    if (!p) continue;
    const f = figureOf(plan, id);
    if (!f) continue;
    const d = Math.hypot(p.x - ex, p.y - ey, p.z - ez);
    const px = cam.pxAt(d);
    const h = BADGE_PX * px;
    // Over the figure: above its top, and up the screen by a badge (a view from straight above sees no height).
    const lift = h * 0.95 + topOf(f) * 0.6;
    const bx = p.x + U[0] * lift;
    const bz = p.z + U[2] * lift;
    const top = p.y + topOf(f) + U[1] * lift;
    // Running tasks first, at most three badges.
    let n = 0;
    const list: [PlanTask, boolean][] = [];
    for (const [t, w] of tasks) if (list.length < 3 && time >= w.t0 - 1e-6 && time <= w.t1 + 1e-6) list.push([t, true]);
    for (const [t, w] of tasks) if (list.length < 3 && !(time >= w.t0 - 1e-6 && time <= w.t1 + 1e-6) && w.t1 >= a0 - 1e-6 && w.t0 <= a1 + 1e-6) list.push([t, false]);
    if (!list.length) continue;
    const warn = conflicted.has(id);
    const count = list.length + (warn ? 1 : 0);
    const w = h * BADGE_ASPECT * 1.08;
    let x0 = -((count - 1) * w) / 2 - (warn ? (w - h) / 2 : 0);
    if (warn) {
      badge('conflict', bx + R[0] * x0, top + R[1] * x0, bz + R[2] * x0, h, white, 1);
      x0 += (w + h * 1.08) / 2;
    }
    for (const [t, active] of list) {
      const k = x0 + n * w;
      const col = t.id === selected ? white : color(t.team);
      badge(t.kind, bx + R[0] * k, top + R[1] * k, bz + R[2] * k, h, col, active ? 1 : 0.45);
      n++;
      if (!active) continue;
      const def = taskDef(t.kind);
      if (!def.sector) continue;
      const sc = sectorOf(plan, t, f.kind, p);
      // Lying flat, ahead along the bearing (box yaw).
      cone.o[0] = p.x - ox;
      cone.o[1] = p.y + 0.2 - oy;
      cone.o[2] = p.z - oz;
      cone.f[0] = Math.sin(sc.bearing);
      cone.f[2] = -Math.cos(sc.bearing);
      const alpha = t.kind === 'suppress' ? 0.65 + 0.35 * Math.sin(time * 7) : 0.9;
      out.add(coneMesh(sc.arc), cone, sc.range, col, alpha);
    }
  }
  for (const a of taskGraphics(plan, step, selected).anchors) {
    const d = Math.hypot(a.at.x - ex, a.at.y - ey, a.at.z - ez);
    const h = BADGE_PX * cam.pxAt(d);
    badge(a.kind, a.at.x, a.at.y + h * 0.8, a.at.z, h, a.task === selected ? white : color(a.team), 0.95);
  }
}

const rowIndex = new WeakMap<ReturnType<typeof taskSchedule>, Map<string, [PlanTask, { t0: number; t1: number }][]>>();
/** Each figure's tasks with their windows, built once per schedule: the frame loop does no lookups by key. */
function figureRows(plan: Plan, s: ReturnType<typeof taskSchedule>): Map<string, [PlanTask, { t0: number; t1: number }][]> {
  let m = rowIndex.get(s);
  if (m) return m;
  m = new Map();
  for (const [id, tasks] of s.byFigure) {
    const rows: [PlanTask, { t0: number; t1: number }][] = [];
    for (const t of tasks) {
      const w = s.windows.get(winKey(t.id, id));
      if (w) rows.push([t, w]);
    }
    if (rows.length) m.set(id, rows);
  }
  void plan;
  rowIndex.set(s, m);
  return m;
}

const figIndex = new WeakMap<Plan, Map<string, PlanFigure>>();
function figureOf(plan: Plan, id: string): PlanFigure | undefined {
  let m = figIndex.get(plan);
  if (!m) figIndex.set(plan, (m = new Map(plan.figures.map((f) => [f.id, f]))));
  return m.get(id);
}

const conflictIndex = new WeakMap<Plan, Set<string>>();
/** The figures something cannot work for. */
export function conflictFigures(plan: Plan): Set<string> {
  let m = conflictIndex.get(plan);
  if (m) return m;
  m = new Set();
  const s = taskSchedule(plan);
  const byId = new Map(plan.tasks.map((t) => [t.id, t]));
  for (const c of s.conflicts) {
    if (c.figure) m.add(c.figure);
    else for (const id of byId.get(c.task)?.figures ?? []) m.add(id);
  }
  conflictIndex.set(plan, m);
  return m;
}
