/**
 * The tactics board's geometry: every figure of the plan at the moment shown,
 * the arrows as flat ribbons with a head lying just above where they were
 * drawn, throws as arcs with the utility where it lands, areas as discs, and
 * what is being drawn right now. Triangles and lines in the renderer's vertex
 * layout (xyz, rgba), like the race scene's.
 */

import { VertexBuffer, type Rgb } from '../race/geometry';
import { CATALOG } from '../figures/catalog';
import { place, TemplateCache, type Template } from '../figures/kit';
import { keyAt, onBoard, posesAt, throwArc, type Plan, type PlanArrow, type Vec3 } from './plan';
import { gamePreset } from './games';

export interface BoardView {
  step: number;
  /** Share of the step played, 0..1; 0 when editing. */
  u: number;
  selected: string | null;
  /** Points of an arrow or area being drawn, and where the cursor is. */
  draft: { kind: 'arrow' | 'throw' | 'area'; style?: PlanArrow['style']; points: Vec3[]; team: string } | null;
  cursor: Vec3 | null;
  /** The figure about to be placed, shown at the cursor. */
  placing: { kind: string; team: string; yaw: number } | null;
}

export interface BoardFrame {
  tris: VertexBuffer;
  lines: VertexBuffer;
}

const templates = new TemplateCache();

export function templateOf(kind: string): Template | null {
  const e = CATALOG[kind];
  if (!e) return null;
  return templates.get(kind, e.build);
}

/** Plan yaw (0 looks along -z, as box yaw) to a figure pose's heading (0 looks along +z). */
export function figureHeading(yaw: number): number {
  return Math.PI - yaw;
}

export class BoardScene {
  private readonly frame: BoardFrame = { tris: new VertexBuffer(), lines: new VertexBuffer() };

  build(plan: Plan, view: BoardView): BoardFrame {
    const { tris, lines } = this.frame;
    tris.reset();
    lines.reset();
    const preset = gamePreset(plan.game);
    const width = preset.arrowWidth;
    const color = (team: string): Rgb => plan.teams.find((t) => t.id === team)?.color ?? [0.8, 0.8, 0.8];
    const scale = Math.max(0.05, plan.figureScale);

    // Areas, under everything else.
    for (const a of plan.areas) {
      if (a.step !== view.step) continue;
      disc(tris, lines, a.centre, a.radius, color(a.team), 0.18);
    }
    // Arrows of this step, and the last step's faintly, so a phase reads as following on.
    for (const a of plan.arrows) {
      const here = a.step === view.step;
      if (!here && a.step !== view.step - 1) continue;
      arrow(tris, lines, a, color(a.team), width, here ? 0.85 : 0.22, preset.throwApex);
    }
    // Figures where they are at this moment.
    const poses = posesAt(plan, view.step, view.u);
    for (const f of plan.figures) {
      const p = poses.get(f.id);
      const t = templateOf(f.kind);
      if (!p || !t) continue;
      const col = color(f.team);
      place(tris, t, { x: p.x, y: p.y, z: p.z, yaw: figureHeading(p.yaw), scale }, col);
      if (f.id === view.selected) ring(lines, p, Math.max(t.max[0] - t.min[0], t.max[2] - t.min[2]) * 0.65 * scale + 0.3, [1, 1, 1]);
      // Where the figure goes next, as a ghost, while editing.
      if (view.u === 0 && onBoard(f, view.step + 1)) {
        const next = f.keys[view.step + 1];
        const now = keyAt(f, view.step);
        if (next && now && (next.x !== now.x || next.z !== now.z)) place(tris, t, { x: next.x, y: next.y, z: next.z, yaw: figureHeading(next.yaw), scale }, col, 0.3);
      }
    }
    // Notes as pins.
    const pin = templateOf('waypoint');
    if (pin) for (const n of plan.notes) if (n.step === view.step) place(tris, pin, { x: n.at.x, y: n.at.y, z: n.at.z, yaw: 0, scale: Math.max(0.3, width) }, [0.95, 0.95, 0.95], 0.9);

    // What is being drawn.
    const d = view.draft;
    if (d) {
      const pts = view.cursor ? [...d.points, view.cursor] : d.points;
      const col = color(d.team);
      if (d.kind === 'area' && pts.length >= 2) {
        disc(tris, lines, pts[0], Math.hypot(pts[1].x - pts[0].x, pts[1].z - pts[0].z), col, 0.12);
      } else if (pts.length >= 2) {
        arrow(tris, lines, { id: 'draft', step: view.step, team: d.team, style: d.kind === 'throw' ? 'throw' : (d.style ?? 'move'), points: pts }, col, width, 0.55, preset.throwApex);
      }
      for (const p of d.points) ring(lines, p, width * 0.6, col);
    }
    if (view.placing && view.cursor) {
      const t = templateOf(view.placing.kind);
      if (t) place(tris, t, { x: view.cursor.x, y: view.cursor.y, z: view.cursor.z, yaw: figureHeading(view.placing.yaw), scale }, color(view.placing.team), 0.55);
    }
    return this.frame;
  }
}

/** A flat ring of lines round a point, just above it. */
function ring(lines: VertexBuffer, p: Vec3, r: number, col: Rgb): void {
  const n = 32;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    lines.line([p.x + Math.cos(a0) * r, p.y + 0.08, p.z + Math.sin(a0) * r], [p.x + Math.cos(a1) * r, p.y + 0.08, p.z + Math.sin(a1) * r], col, 1);
  }
}

function disc(tris: VertexBuffer, lines: VertexBuffer, c: Vec3, r: number, col: Rgb, alpha: number): void {
  const n = 48;
  const y = c.y + 0.06;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    tris.triangle([c.x, y, c.z], [c.x + Math.cos(a1) * r, y, c.z + Math.sin(a1) * r], [c.x + Math.cos(a0) * r, y, c.z + Math.sin(a0) * r], col, alpha);
    lines.line([c.x + Math.cos(a0) * r, y, c.z + Math.sin(a0) * r], [c.x + Math.cos(a1) * r, y, c.z + Math.sin(a1) * r], col, Math.min(1, alpha * 4));
  }
}

/**
 * An arrow: a flat ribbon along the points with a head at the end, lifted a
 * little off the surface it was drawn on. A throw is an arc in lines instead,
 * a look a thin line; an attack has a wider head.
 */
function arrow(tris: VertexBuffer, lines: VertexBuffer, a: PlanArrow, col: Rgb, width: number, alpha: number, apex: number): void {
  const pts = a.points;
  if (pts.length < 2) return;
  if (a.style === 'throw') {
    const arc = throwArc(pts[0], pts[pts.length - 1], apex);
    for (let i = 0; i + 1 < arc.length; i++) {
      // Dashed: every other segment.
      if (i % 2) continue;
      lines.line([arc[i].x, arc[i].y, arc[i].z], [arc[i + 1].x, arc[i + 1].y, arc[i + 1].z], col, alpha);
    }
    ring(lines, pts[pts.length - 1], width * 1.2, col);
    return;
  }
  if (a.style === 'look') {
    for (let i = 0; i + 1 < pts.length; i++) lines.line([pts[i].x, pts[i].y + 1.5, pts[i].z], [pts[i + 1].x, pts[i + 1].y + 1.5, pts[i + 1].z], col, alpha);
    return;
  }
  const lift = Math.max(0.05, width * 0.12);
  const head = width * (a.style === 'attack' ? 3.2 : 2.4);
  const headLen = width * 2.6;
  // Shorten the last segment by the head's length so the head ends at the last point.
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const segLen = Math.hypot(last.x - prev.x, last.z - prev.z) || 1;
  const k = Math.max(0, 1 - headLen / segLen);
  const body = [...pts.slice(0, -1), { x: prev.x + (last.x - prev.x) * k, y: prev.y + (last.y - prev.y) * k, z: prev.z + (last.z - prev.z) * k }];
  const half = width / 2;
  const side = (p: Vec3, q: Vec3): [number, number] => {
    const dx = q.x - p.x;
    const dz = q.z - p.z;
    const l = Math.hypot(dx, dz) || 1;
    return [-dz / l, dx / l];
  };
  for (let i = 0; i + 1 < body.length; i++) {
    const p = body[i];
    const q = body[i + 1];
    const [nx, nz] = side(p, q);
    tris.quad([p.x + nx * half, p.y + lift, p.z + nz * half], [q.x + nx * half, q.y + lift, q.z + nz * half], [q.x - nx * half, q.y + lift, q.z - nz * half], [p.x - nx * half, p.y + lift, p.z - nz * half], col, alpha);
    // A round joint so turns have no notch.
    if (i > 0) {
      const n = 8;
      for (let j = 0; j < n; j++) {
        const a0 = (j / n) * Math.PI * 2;
        const a1 = ((j + 1) / n) * Math.PI * 2;
        tris.triangle([p.x, p.y + lift, p.z], [p.x + Math.cos(a1) * half, p.y + lift, p.z + Math.sin(a1) * half], [p.x + Math.cos(a0) * half, p.y + lift, p.z + Math.sin(a0) * half], col, alpha);
      }
    }
  }
  const b = body[body.length - 1];
  const [nx, nz] = side(prev, last);
  tris.triangle([b.x + (nx * head) / 2, b.y + lift, b.z + (nz * head) / 2], [last.x, last.y + lift, last.z], [b.x - (nx * head) / 2, b.y + lift, b.z - (nz * head) / 2], col, Math.min(1, alpha + 0.1));
}
