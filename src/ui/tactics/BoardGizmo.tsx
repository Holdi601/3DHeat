import { useRef } from 'react';
import { usePlanStore } from '../../state/planStore';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { AXES, closestOnAxis, gimbalAxes, pivotOf, rayPlane, ringAngle, snapTo, type Axis, type Ray, type Transform } from '../../tactics/gizmo';
import { keyAt, type Vec3 } from '../../tactics/plan';
import { moveClassOf } from '../../tactics/speeds';
import { clock, planTimings, stepStart, unitsPerMetre } from '../../tactics/timing';
import type { Engine } from '../../render/engine';

const COLORS: Record<Axis, string> = { x: '#e5484d', y: '#46a758', z: '#3e82f7' };
const PLANES: { id: string; a: Axis; b: Axis; n: Axis }[] = [
  { id: 'xz', a: 'x', b: 'z', n: 'y' },
  { id: 'xy', a: 'x', b: 'y', n: 'z' },
  { id: 'yz', a: 'y', b: 'z', n: 'x' },
];

const add = (a: Vec3, b: Vec3, k = 1): Vec3 => ({ x: a.x + b.x * k, y: a.y + b.y * k, z: a.z + b.z * k });

interface Drag {
  handle: string;
  ray0: Ray;
  pivot: Vec3;
  axes: Record<Axis, Vec3>;
  mx: number;
  my: number;
  /** Where the surface was under the press, for a free move. */
  w0: Vec3 | null;
  pivotPx: { x: number; y: number } | null;
}

/**
 * The tactics board's transform gizmo and route handles, over the view as
 * SVG: arrows, planes and a centre to move along X, Y, Z (Y is up), rings to
 * turn (yaw, pitch, roll), and handles to scale; a dot on every point of the
 * shown step's arrows to pick and drag; the time to each waypoint; and the
 * box of a shift-drag. Its handles take the pointer before the canvas does,
 * so the camera never moves while one is dragged.
 */
export function BoardGizmo() {
  const engine = useEngine();
  const svg = useRef<SVGSVGElement>(null);
  const last = useRef('');
  const drag = useRef<Drag | null>(null);

  useAnimationFrame(() => {
    const el = svg.current;
    if (!engine || !el) return;
    const html = render(engine);
    if (html !== last.current) {
      last.current = html;
      el.innerHTML = html;
    }
  }, true);

  const onDown = (e: React.PointerEvent) => {
    if (!engine || e.button !== 0) return;
    const target = e.target as Element;
    const handle = target.getAttribute('data-h');
    const ref = target.getAttribute('data-ref');
    if (!handle && !ref) return;
    e.preventDefault();
    e.stopPropagation();
    const s = usePlanStore.getState();
    if (ref) {
      if (e.shiftKey) {
        s.selectRefs([ref], true);
        return;
      }
      if (!s.selection.includes(ref)) s.selectRefs([ref], false);
    }
    const st = usePlanStore.getState();
    const r = (svg.current as SVGSVGElement).getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    const ray0 = engine.boardRay(mx, my);
    const pivot = pivotOf(st.plan, st.step, st.selection);
    if (!ray0 || !pivot) return;
    drag.current = { handle: handle ?? 'c', ray0, pivot, axes: gizmoAxes(), mx, my, w0: engine.worldAt(mx, my), pivotPx: engine.project(pivot.x, pivot.y, pivot.z) };
    st.beginDrag();
    const move = (ev: PointerEvent) => {
      const d = drag.current;
      if (!d || !usePlanStore.getState().dragBase) return stop();
      const x = ev.clientX - r.left;
      const y = ev.clientY - r.top;
      const t = transformFor(engine, d, x, y, ev.ctrlKey || ev.metaKey);
      if (t) usePlanStore.getState().dragPreview(t);
    };
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      drag.current = null;
    };
    const up = () => {
      stop();
      usePlanStore.getState().endDrag();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return <svg ref={svg} className="board-gizmo" onPointerDown={onDown} />;
}

/** The gizmo's axes: a single figure turns about its own yaw, pitch and roll axes; everything else about the world's. */
function gizmoAxes(): Record<Axis, Vec3> {
  const s = usePlanStore.getState();
  if (s.gizmo === 'rotate' && s.selection.length === 1) {
    const f = s.plan.figures.find((x) => x.id === s.selection[0]);
    const k = f && keyAt(f, s.step);
    if (k) return gimbalAxes(k);
  }
  return AXES;
}

/** World length that shows as about `px` pixels at a point. */
function worldPerPixels(engine: Engine, p: Vec3, px: number): number {
  const o = engine.project(p.x, p.y, p.z);
  if (!o) return 0;
  let best = 0;
  for (const a of Object.values(AXES)) {
    const q = engine.project(p.x + a.x, p.y + a.y, p.z + a.z);
    if (q) best = Math.max(best, Math.hypot(q.x - o.x, q.y - o.y));
  }
  return best > 1e-6 ? px / best : 0;
}

function transformFor(engine: Engine, d: Drag, x: number, y: number, snap: boolean): Transform | null {
  const s = usePlanStore.getState();
  const ray = engine.boardRay(x, y);
  if (!ray) return null;
  const plan = s.dragBase ?? s.plan;
  const upm = unitsPerMetre(plan);
  const grid = s.grid > 0 ? s.grid : upm;
  const ground = (q: Vec3, ref: string): number | null => {
    if (!s.snapGround) return null;
    const f = plan.figures.find((g) => g.id === ref);
    const cls = f ? moveClassOf(f.kind) : 'infantry';
    if (cls === 'air' || cls === 'heli') return null;
    return engine.surfaceBelow(q.x, q.y + 2 * upm, q.z, 50 * upm);
  };
  const h = d.handle;
  if (s.gizmo === 'move' || h === 'c') {
    if (h === 'x' || h === 'y' || h === 'z') {
      const ax = d.axes[h];
      const s0 = closestOnAxis(d.ray0, d.pivot, ax);
      const s1 = closestOnAxis(ray, d.pivot, ax);
      if (s0 === null || s1 === null) return null;
      const dist = snap ? snapTo(s1 - s0, grid) : s1 - s0;
      return { kind: 'move', d: { x: ax.x * dist, y: ax.y * dist, z: ax.z * dist }, ground: h === 'y' ? null : ground };
    }
    const plane = PLANES.find((p) => p.id === h);
    let delta: Vec3 | null = null;
    if (plane) {
      const n = d.axes[plane.n];
      const p0 = rayPlane(d.ray0, d.pivot, n);
      const p1 = rayPlane(ray, d.pivot, n);
      if (p0 && p1) delta = { x: p1.x - p0.x, y: p1.y - p0.y, z: p1.z - p0.z };
    } else {
      // The centre: over the surface under the pointer, else across the level plane.
      const w = engine.worldAt(x, y);
      if (w && d.w0) delta = { x: w.x - d.w0.x, y: w.y - d.w0.y, z: w.z - d.w0.z };
      else {
        const p0 = rayPlane(d.ray0, d.pivot, AXES.y);
        const p1 = rayPlane(ray, d.pivot, AXES.y);
        if (p0 && p1) delta = { x: p1.x - p0.x, y: 0, z: p1.z - p0.z };
      }
    }
    if (!delta) return null;
    if (snap) delta = { x: snapTo(delta.x, grid), y: snapTo(delta.y, grid), z: snapTo(delta.z, grid) };
    return { kind: 'move', d: delta, ground: h === 'xy' || h === 'yz' ? null : ground };
  }
  if (s.gizmo === 'rotate') {
    const a = h.slice(1) as Axis;
    const ax = d.axes[a];
    if (!ax) return null;
    let angle = ringAngle(d.ray0, ray, d.pivot, ax);
    // Seen edge on, the ring turns with the pointer's travel instead.
    if (angle === null || Math.abs(ray.dir.x * ax.x + ray.dir.y * ax.y + ray.dir.z * ax.z) < 0.08) angle = (x - d.mx - (y - d.my)) * 0.01;
    if (snap) angle = snapTo(angle, (s.angleStep * Math.PI) / 180);
    return { kind: 'rotate', axis: ax, angle, pivot: d.pivot };
  }
  // Scale: along an axis, or all of them from the centre.
  let k = { x: 1, y: 1, z: 1 };
  if (h === 'sc') {
    const c = d.pivotPx;
    if (!c) return null;
    const f = Math.max(0.02, Math.hypot(x - c.x, y - c.y) / Math.max(1, Math.hypot(d.mx - c.x, d.my - c.y)));
    k = { x: f, y: f, z: f };
  } else {
    const a = h.slice(1) as Axis;
    const ax = d.axes[a];
    const s0 = ax && closestOnAxis(d.ray0, d.pivot, ax);
    const s1 = ax && closestOnAxis(ray, d.pivot, ax);
    if (!s0 || s1 === null || s1 === undefined || Math.abs(s0) < 1e-9) return null;
    k = { ...k, [a]: Math.max(0.02, s1 / s0) };
  }
  if (snap) k = { x: Math.max(0.1, snapTo(k.x, 0.1)), y: Math.max(0.1, snapTo(k.y, 0.1)), z: Math.max(0.1, snapTo(k.z, 0.1)) };
  return { kind: 'scale', k, pivot: d.pivot };
}

const f1 = (v: number) => v.toFixed(1);

function render(engine: Engine): string {
  const s = usePlanStore.getState();
  if (s.playing) return '';
  const plan = s.plan;
  const out: string[] = [];
  const P = (p: Vec3) => engine.project(p.x, p.y, p.z);
  // Handles on the points of this step's arrows, and the time to each waypoint of a route.
  const timings = planTimings(plan);
  const sel = new Set(s.selection);
  for (const a of plan.arrows) {
    if (a.step !== s.step) continue;
    const t = timings.get(a.id);
    const t0 = t ? stepStart(plan, a.step) : 0;
    a.points.forEach((p, i) => {
      const q = P(p);
      if (!q) return;
      const ref = `${a.id}#${i}`;
      if (s.tool === 'select') out.push(`<circle class="wp${sel.has(ref) || sel.has(a.id) ? ' on' : ''}" data-ref="${ref}" cx="${f1(q.x)}" cy="${f1(q.y)}" r="5"/>`);
      if (t && i > 0) out.push(`<text class="eta" x="${f1(q.x + 8)}" y="${f1(q.y - 8)}">+${(t.arrive[i] - t.depart[i - 1]).toFixed(1)} s · ${clock(t0 + t.arrive[i])}</text>`);
    });
  }
  const b = engine.boardBox;
  if (b) out.push(`<rect class="box" x="${f1(Math.min(b.x0, b.x1))}" y="${f1(Math.min(b.y0, b.y1))}" width="${f1(Math.abs(b.x1 - b.x0))}" height="${f1(Math.abs(b.y1 - b.y0))}"/>`);
  if (s.tool !== 'select' || !s.selection.length) return out.join('');
  const pivot = pivotOf(plan, s.step, s.selection);
  const c = pivot && P(pivot);
  if (!pivot || !c) return out.join('');
  const L = worldPerPixels(engine, pivot, 90);
  if (!(L > 0)) return out.join('');
  const axes = gizmoAxes();
  const seg = (a: Vec3, bb: Vec3, cls: string, h: string, color: string) => {
    const p = P(a);
    const q = P(bb);
    if (!p || !q) return;
    const d = `M${f1(p.x)} ${f1(p.y)}L${f1(q.x)} ${f1(q.y)}`;
    out.push(`<path class="${cls}" d="${d}" stroke="${color}"/><path class="hit" data-h="${h}" d="${d}"/>`);
  };
  if (s.gizmo === 'move') {
    for (const pl of PLANES) {
      const A = axes[pl.a];
      const B = axes[pl.b];
      const pts = [add(add(pivot, A, L * 0.18), B, L * 0.18), add(add(pivot, A, L * 0.36), B, L * 0.18), add(add(pivot, A, L * 0.36), B, L * 0.36), add(add(pivot, A, L * 0.18), B, L * 0.36)].map(P);
      if (pts.some((p) => !p)) continue;
      out.push(`<polygon class="plane" data-h="${pl.id}" fill="${COLORS[pl.n]}" points="${pts.map((p) => `${f1(p!.x)},${f1(p!.y)}`).join(' ')}"/>`);
    }
    for (const a of ['x', 'y', 'z'] as Axis[]) {
      const end = add(pivot, axes[a], L);
      seg(pivot, end, 'axis', a, COLORS[a]);
      const q = P(end);
      const p = P(add(pivot, axes[a], L * 0.8));
      if (q && p) {
        const dx = q.x - p.x;
        const dy = q.y - p.y;
        const l = Math.hypot(dx, dy) || 1;
        const nx = -dy / l;
        const ny = dx / l;
        out.push(`<polygon class="head" data-h="${a}" fill="${COLORS[a]}" points="${f1(q.x + (dx / l) * 6)},${f1(q.y + (dy / l) * 6)} ${f1(q.x + nx * 6)},${f1(q.y + ny * 6)} ${f1(q.x - nx * 6)},${f1(q.y - ny * 6)}"/>`);
      }
    }
    out.push(`<circle class="centre" data-h="c" cx="${f1(c.x)}" cy="${f1(c.y)}" r="7"/>`);
  } else if (s.gizmo === 'rotate') {
    for (const a of ['y', 'x', 'z'] as Axis[]) {
      const n = axes[a];
      // Two directions across the ring's plane.
      const helper = Math.abs(n.y) > 0.9 ? AXES.x : AXES.y;
      const u = norm(cross(n, helper));
      const v = cross(n, u);
      const pts: string[] = [];
      for (let i = 0; i <= 64; i++) {
        const t = (i / 64) * Math.PI * 2;
        const q = P(add(add(pivot, u, Math.cos(t) * L * 0.85), v, Math.sin(t) * L * 0.85));
        if (q) pts.push(`${i ? 'L' : 'M'}${f1(q.x)} ${f1(q.y)}`);
      }
      const d = pts.join('');
      out.push(`<path class="ring" d="${d}" stroke="${COLORS[a]}"/><path class="hit" data-h="r${a}" d="${d}"/>`);
    }
    out.push(`<circle class="centre" data-h="c" cx="${f1(c.x)}" cy="${f1(c.y)}" r="5"/>`);
  } else {
    for (const a of ['x', 'y', 'z'] as Axis[]) {
      const end = add(pivot, axes[a], L);
      seg(pivot, end, 'axis', `s${a}`, COLORS[a]);
      const q = P(end);
      if (q) out.push(`<rect class="head" data-h="s${a}" fill="${COLORS[a]}" x="${f1(q.x - 5)}" y="${f1(q.y - 5)}" width="10" height="10"/>`);
    }
    out.push(`<rect class="centre" data-h="sc" x="${f1(c.x - 7)}" y="${f1(c.y - 7)}" width="14" height="14"/>`);
  }
  return out.join('');
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}
function norm(a: Vec3): Vec3 {
  const l = Math.hypot(a.x, a.y, a.z) || 1;
  return { x: a.x / l, y: a.y / l, z: a.z / l };
}
