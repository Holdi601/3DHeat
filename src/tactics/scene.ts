/**
 * The tactics board's geometry: every figure of the plan at the moment shown,
 * the arrows as flat ribbons with a head lying just above where they were
 * drawn, throws as arcs with the utility where it lands, areas as discs, and
 * what is being drawn right now. Triangles and lines in the renderer's vertex
 * layout (xyz, rgba), like the race scene's.
 */

import { VertexBuffer, type Rgb } from '../race/geometry';
import { CATALOG } from '../figures/catalog';
import { packFigurePending } from '../figures/figurepack';
import { place, poseFrame, TemplateCache, type Template } from '../figures/kit';
import { InstanceBatches, meshOf, NO_PITCH, type FigureBatch } from '../figures/instances';
import { directionOf } from './keyframes';
import { parseThrow, reach, solveThrow } from './ballistics';
import { unitsPerMetre } from './timing';
import { BASE_LAYER, keyAt, layerOf, onBoard, posesAt, shown, throwArc, type Plan, type PlanArrow, type PlanDrawing, type PlanNote, type Vec3 } from './plan';
import { gamePreset } from './games';
import type { ArrivalGrid } from './telemetry';
import { taskGraphics, taskInstances, type BoardCam } from './taskScene';

export interface BoardView {
  step: number;
  /** Share of the step played, 0..1; 0 when editing. */
  u: number;
  selected: string | null;
  /** Everything selected (figure, arrow, area, note ids, `<arrow>#<point>`); `selected` alone when absent. */
  selection?: string[];
  /** The earliest-arrival overlay from telemetry, when shown. */
  heat?: ArrivalGrid | null;
  /** Points of an arrow or area being drawn, and where the cursor is. */
  draft: { kind: 'arrow' | 'throw' | 'area' | 'circle'; style?: PlanArrow['style']; points: Vec3[]; team: string; group?: string[] } | null;
  /** The Draw tool's pen while it is in hand, and the freehand stroke being drawn with it. */
  pen?: { kind: PlanDrawing['kind']; color: Rgb; width: number } | null;
  stroke?: Vec3[] | null;
  /** The Measure tool's ruler. */
  measure?: { points: Vec3[]; done: boolean } | null;
  cursor: Vec3 | null;
  /** The figure about to be placed, shown at the cursor. */
  placing: { kind: string; team: string; yaw: number } | null;
  /** A group route keeps its shape (the store's `formation`); absent: it does. */
  formation?: boolean;
  /** The figures are drawn as GPU instances (`BoardScene.figures`), not into the triangles. */
  instanced?: boolean;
  /** The layer being drawn on, and whether only its routes and arrows are drawn. */
  activeLayer?: string;
  routesActiveOnly?: boolean;
  /** The Throw tool's throw (`ballistics.ts`), "projectile|strength|move", while a throw is drawn. */
  throwWeapon?: string | null;
  /** Playback seconds from the plan's start, when playing (time-bound notes); absent while editing. */
  time?: number | null;
  /** The moment shown, seconds from the plan's start: what the tasks' badges and cones follow. */
  moment?: number;
  /** The task being edited (`tasks.ts`), drawn in white; and the points of one being drawn. */
  task?: string | null;
  taskDraft?: Vec3[] | null;
}

/** Whether a note shows now: in its step, always, or (time-bound) while playback is in its window. */
export function noteShown(n: PlanNote, view: { step: number; time?: number | null }): boolean {
  const show = n.show ?? 'step';
  if (show === 'always') return true;
  if (show === 'timed') return view.time !== undefined && view.time !== null ? view.time >= (n.start ?? 0) && view.time <= (n.start ?? 0) + (n.duration ?? 5) : n.step === view.step;
  return n.step === view.step;
}

export interface BoardFrame {
  tris: VertexBuffer;
  lines: VertexBuffer;
}

const templates = new TemplateCache();
/** Kinds built before their pack model's data was here: built as the figure they stand in for, again once it is. */
const interim = new Set<string>();

export function templateOf(kind: string): Template | null {
  const e = CATALOG[kind];
  if (!e) return null;
  if (interim.has(kind) && !packFigurePending(kind)) {
    interim.delete(kind);
    templates.drop(kind);
  } else if (!interim.has(kind) && packFigurePending(kind)) interim.add(kind);
  return templates.get(kind, e.build);
}

/** Plan yaw (0 looks along -z, as box yaw) to a figure pose's heading (0 looks along +z). */
export function figureHeading(yaw: number): number {
  return Math.PI - yaw;
}

export class BoardScene {
  private readonly frame: BoardFrame = { tris: new VertexBuffer(), lines: new VertexBuffer() };
  private readonly batches = new InstanceBatches();

  build(plan: Plan, view: BoardView): BoardFrame {
    const { tris, lines } = this.frame;
    tris.reset();
    lines.reset();
    const preset = gamePreset(plan.game);
    const width = preset.arrowWidth;
    const color = (team: string): Rgb => plan.teams.find((t) => t.id === team)?.color ?? [0.8, 0.8, 0.8];
    const scale = Math.max(0.05, plan.figureScale);
    const sel = new Set(view.selection ?? (view.selected ? [view.selected] : []));
    const white: Rgb = [1, 1, 1];

    if (view.heat) heatGrid(tris, view.heat);
    // Areas, under everything else.
    for (const a of plan.areas) {
      if (a.step !== view.step || !shown(plan, a)) continue;
      disc(tris, lines, a.centre, a.radius, color(a.team), 0.18);
      if (sel.has(a.id)) ring(lines, a.centre, a.radius * 1.02, white);
    }
    // Drawings: freehand strokes, highlighter marks and circles on the level, in their step or in all.
    for (const d of plan.drawings ?? []) {
      if ((!d.always && d.step !== view.step) || !shown(plan, d)) continue;
      drawing(tris, d.kind, d.points, d.color, d.width);
      if (sel.has(d.id)) for (const p of d.kind === 'circle' ? d.points.slice(0, 1) : [d.points[0], d.points[d.points.length - 1]]) ring(lines, p, Math.max(d.width, width) * 1.5, white);
    }
    if (view.pen && view.stroke && view.stroke.length) drawing(tris, view.pen.kind, view.stroke, view.pen.color, view.pen.width);
    // Tasks: their lines on the map in this step, built once per plan and step (`taskScene.ts`).
    if (plan.tasks?.length) {
      const g = taskGraphics(plan, view.step, view.task ?? null);
      tris.append(g.tris);
      lines.append(g.lines);
    }
    if (view.taskDraft?.length) {
      const pts = view.cursor ? [...view.taskDraft, view.cursor] : view.taskDraft;
      for (let i = 0; i + 1 < pts.length; i++) lines.line([pts[i].x, pts[i].y + 0.2, pts[i].z], [pts[i + 1].x, pts[i + 1].y + 0.2, pts[i + 1].z], white, 1);
      for (const p of view.taskDraft) ring(lines, p, width * 0.8, white);
    }
    // Arrows of this step, and the last step's faintly, so a phase reads as following on:
    // shown layers' (the active layer's only, when the others' routes are to stay out of the way).
    const only = view.routesActiveOnly ? (view.activeLayer ?? BASE_LAYER) : null;
    for (const a of plan.arrows) {
      const here = a.step === view.step;
      if (!here && a.step !== view.step - 1) continue;
      if (!shown(plan, a) || (only !== null && layerOf(a) !== only)) continue;
      arrow(tris, lines, a, color(a.team), width, here ? 0.85 : 0.22, preset.throwApex, a.style === 'throw' ? throwPath(plan, a) : null);
      if (here) {
        a.points.forEach((p, i) => (sel.has(a.id) || sel.has(`${a.id}#${i}`)) && ring(lines, p, width * 0.9, white));
        // A route's end: a ring round its last waypoint, so where it stops reads at a glance.
        if (a.style !== 'throw' && a.points.length >= 2) endMark(lines, a.points[a.points.length - 1], width, color(a.team));
      }
    }
    // Figures where they are at this moment: here on the CPU, or (`instanced`) by the GPU from `figures`.
    const poses = posesAt(plan, view.step, view.u);
    for (const f of plan.figures) {
      const p = poses.get(f.id);
      const t = templateOf(f.kind);
      if (!p || !t) continue;
      const col = color(f.team);
      if (sel.has(f.id)) ring(lines, p, Math.max(t.max[0] - t.min[0], t.max[2] - t.min[2]) * 0.65 * scale + 0.3, white);
      // Where it looks and where its sensor points, from its keyframes: a fan of lines from eye height.
      const eye = { x: p.x, y: p.y + t.max[1] * 0.8 * scale, z: p.z };
      if (p.view) fan(lines, eye, p.yaw, p.view, width * 30, 0.2, VIEW_COLOR);
      if (p.sensor) fan(lines, eye, p.yaw, p.sensor, width * 45, 0.35, SENSOR_COLOR);
      if (view.instanced) continue;
      place(tris, t, { x: p.x, y: p.y, z: p.z, yaw: figureHeading(p.yaw), pitch: p.pitch, roll: p.roll, scale }, col);
      // Where the figure goes next, as a ghost, while editing.
      if (view.u === 0 && onBoard(f, view.step + 1)) {
        const next = f.keys[view.step + 1];
        const now = keyAt(f, view.step);
        if (next && now && (next.x !== now.x || next.z !== now.z)) place(tris, t, { x: next.x, y: next.y, z: next.z, yaw: figureHeading(next.yaw), scale }, col, 0.3);
      }
    }
    // Notes as pins.
    const pin = templateOf('waypoint');
    if (pin)
      for (const n of plan.notes) {
        if (!noteShown(n, view) || !shown(plan, n)) continue;
        place(tris, pin, { x: n.at.x, y: n.at.y, z: n.at.z, yaw: 0, scale: Math.max(0.3, width) }, [0.95, 0.95, 0.95], 0.9);
        if (sel.has(n.id)) ring(lines, n.at, width * 2, white);
      }

    // What is being drawn.
    const d = view.draft;
    if (d) {
      const pts = view.cursor ? [...d.points, view.cursor] : d.points;
      const col = color(d.team);
      if (d.kind === 'area' && pts.length >= 2) {
        disc(tris, lines, pts[0], Math.hypot(pts[1].x - pts[0].x, pts[1].z - pts[0].z), col, 0.12);
      } else if (d.kind === 'circle' && pts.length >= 2) {
        drawing(tris, 'circle', pts, view.pen?.color ?? white, view.pen?.width ?? width * 0.5);
      } else if (pts.length >= 2) {
        const style = d.kind === 'throw' ? 'throw' : (d.style ?? 'move');
        // A throw in hand: the reach round the thrower, and the real flight to where it would land.
        let path: Vec3[] | null = null;
        if (d.kind === 'throw' && view.throwWeapon) {
          const spec = parseThrow(view.throwWeapon);
          if (spec) {
            const upm = unitsPerMetre(plan);
            const r = reach(spec, 1, 0, 0).distance * upm;
            ring(lines, pts[0], r, col);
            ring(lines, pts[0], r * 0.995, col);
            const f = solveThrow(spec, scaled(pts[0], 1 / upm), scaled(pts[pts.length - 1], 1 / upm));
            path = f.points.map((q) => scaled(q, upm));
          }
        }
        arrow(tris, lines, { id: 'draft', step: view.step, team: d.team, style, points: pts }, col, width, 0.55, preset.throwApex, path);
        // A group route: each figure's own way, faintly, from where it stands.
        if (d.group && d.group.length > 1) {
          const c = d.points[0];
          for (const fid of d.group) {
            const f = plan.figures.find((x) => x.id === fid);
            const k = f && keyAt(f, view.step);
            if (!k) continue;
            const off = view.formation === false ? { x: 0, z: 0 } : { x: k.x - c.x, z: k.z - c.z };
            arrow(tris, lines, { id: 'draft', step: view.step, team: d.team, style, points: [k, ...pts.slice(1).map((p) => ({ x: p.x + off.x, y: p.y, z: p.z + off.z }))] }, col, width * 0.6, 0.3, preset.throwApex);
          }
        }
      }
      for (const p of d.points) ring(lines, p, width * 0.6, col);
    }
    // The ruler: a white line through its points, a ring at each.
    const m = view.measure;
    if (m && m.points.length) {
      const pts = !m.done && view.cursor ? [...m.points, view.cursor] : m.points;
      for (let i = 0; i + 1 < pts.length; i++) lines.line([pts[i].x, pts[i].y + 0.1, pts[i].z], [pts[i + 1].x, pts[i + 1].y + 0.1, pts[i + 1].z], white, 1);
      for (const p of m.points) ring(lines, p, width * 0.5, white);
    }
    if (view.placing && view.cursor && !view.instanced) {
      const t = templateOf(view.placing.kind);
      if (t) place(tris, t, { x: view.cursor.x, y: view.cursor.y, z: view.cursor.z, yaw: figureHeading(view.placing.yaw), scale }, color(view.placing.team), 0.55);
    }
    return this.frame;
  }

  /**
   * The figures as GPU instances (`figures/instances.ts`): where each stands
   * at this moment, its ghost in the next step while editing, and the one
   * about to be placed - 16 floats a figure a frame instead of every vertex.
   * Positions relative to `origin` (FrameParams.viewProjRel), so it is called
   * once the frame's origin is known.
   */
  figures(plan: Plan, view: BoardView, origin: ArrayLike<number>, cam?: BoardCam | null): FigureBatch[] {
    const out = this.batches;
    out.reset();
    const scale = Math.max(0.05, plan.figureScale);
    const color = (team: string): Rgb => plan.teams.find((t) => t.id === team)?.color ?? [0.8, 0.8, 0.8];
    const [ox, oy, oz] = [origin[0], origin[1], origin[2]];
    const put = (kind: string, p: { x: number; y: number; z: number; yaw: number; pitch?: number; roll?: number }, col: Rgb, alpha: number, turret = 0, gun = NO_PITCH) => {
      const t = templateOf(kind);
      if (!t) return;
      out.add(meshOf(t), poseFrame({ x: p.x - ox, y: p.y - oy, z: p.z - oz, yaw: figureHeading(p.yaw), pitch: p.pitch, roll: p.roll }), scale, col, alpha, turret, gun);
    };
    const poses = posesAt(plan, view.step, view.u);
    for (const f of plan.figures) {
      const p = poses.get(f.id);
      if (!p) continue;
      const col = color(f.team);
      put(f.kind, p, col, 1, p.turret ?? 0, p.gun ?? NO_PITCH);
      if (view.u === 0 && onBoard(f, view.step + 1)) {
        const next = f.keys[view.step + 1];
        const now = keyAt(f, view.step);
        if (next && now && (next.x !== now.x || next.z !== now.z)) put(f.kind, next, col, 0.3);
      }
    }
    if (view.placing && view.cursor) put(view.placing.kind, { ...view.cursor, yaw: view.placing.yaw }, color(view.placing.team), 0.55);
    // The tasks' badges and the cones of the sectors running now, sized on screen.
    if (cam && plan.tasks?.length) taskInstances(plan, view.step, view.moment ?? 0, poses, cam, origin, out, (f) => (templateOf(f.kind)?.max[1] ?? 1) * scale, view.task ?? null);
    return out.list;
  }

  private spinsFor: Plan | null = null;
  /** The plan's kinds and the templates they were drawn as when `spins` was found: a model arriving later is new. */
  private spinKinds: [string, Template | null][] = [];
  private spins = false;

  /**
   * Whether a figure on the board has a propeller or rotor: they turn by the clock, so the board is drawn every
   * frame while one is there, not only when it changes. Kept per plan while its kinds' templates stay the same (a
   * pack model takes its stand-in figure's place once loaded).
   */
  spinning(plan: Plan): boolean {
    if (plan === this.spinsFor && this.spinKinds.every(([k, t]) => templateOf(k) === t)) return this.spins;
    const kinds = new Map<string, Template | null>();
    for (const f of plan.figures) if (!kinds.has(f.kind)) kinds.set(f.kind, templateOf(f.kind));
    this.spinKinds = [...kinds];
    this.spins = this.spinKinds.some(([, t]) => !!t?.joints?.some((j) => j.kind === 'spin'));
    this.spinsFor = plan;
    return this.spins;
  }
}

/** Seconds to colour: early green through yellow to late red. */
export function arrivalColor(u: number): Rgb {
  const x = Math.max(0, Math.min(1, u));
  return x < 0.5 ? [0.1 + x * 1.7, 0.85, 0.25] : [0.95, 0.85 - (x - 0.5) * 1.5, 0.2];
}

/** The earliest-arrival overlay: a cell per square, coloured by the time it was first reached. */
function heatGrid(tris: VertexBuffer, g: ArrivalGrid): void {
  const span = Math.max(1e-3, g.tMax - g.tMin);
  const lift = g.cell * 0.02;
  for (let j = 0; j < g.nz; j++)
    for (let i = 0; i < g.nx; i++) {
      const k = j * g.nx + i;
      const v = g.values[k];
      if (!Number.isFinite(v)) continue;
      const col = arrivalColor((v - g.tMin) / span);
      const x0 = g.x0 + i * g.cell;
      const z0 = g.z0 + j * g.cell;
      const y = g.heights[k] + lift;
      tris.quad([x0, y, z0], [x0 + g.cell, y, z0], [x0 + g.cell, y, z0 + g.cell], [x0, y, z0 + g.cell], col, 0.42);
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

const VIEW_COLOR: Rgb = [1, 0.9, 0.35];
const SENSOR_COLOR: Rgb = [0.35, 0.95, 1];

/** A direction off a heading as a fan: the line itself and two at `half` radians either side, `length` long, joined at the ends. */
function fan(lines: VertexBuffer, from: Vec3, yaw: number, dir: { yaw: number; pitch: number }, length: number, half: number, col: Rgb): void {
  const tip = (dy: number) => {
    const d = directionOf(yaw, { yaw: dir.yaw + dy, pitch: dir.pitch });
    return [from.x + d.x * length, from.y + d.y * length, from.z + d.z * length] as [number, number, number];
  };
  const o: [number, number, number] = [from.x, from.y, from.z];
  const c = tip(0);
  const l = tip(-half);
  const r = tip(half);
  lines.line(o, c, col, 0.9);
  lines.line(o, l, col, 0.5);
  lines.line(o, r, col, 0.5);
  lines.line(l, c, col, 0.5);
  lines.line(c, r, col, 0.5);
}

/**
 * A drawing as flat ribbons a little above the level: a stroke solid, a
 * highlighter mark wide and see-through, a circle a ribbon round its middle
 * through the edge point. A single point is a dot.
 */
function drawing(tris: VertexBuffer, kind: PlanDrawing['kind'], points: Vec3[], col: Rgb, w: number): void {
  const half = Math.max(0.01, w / 2);
  const alpha = kind === 'highlight' ? 0.35 : 0.92;
  const lift = Math.max(0.04, w * 0.1);
  let pts = points;
  if (kind === 'circle') {
    if (points.length < 2) return;
    const c = points[0];
    const r = Math.hypot(points[1].x - c.x, points[1].z - c.z);
    const n = Math.max(24, Math.min(96, Math.round(r / Math.max(half, 1e-3))));
    pts = Array.from({ length: n + 1 }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return { x: c.x + Math.cos(a) * r, y: c.y, z: c.z + Math.sin(a) * r };
    });
  }
  if (pts.length === 1) {
    const p = pts[0];
    for (let j = 0; j < 12; j++) {
      const a0 = (j / 12) * Math.PI * 2;
      const a1 = ((j + 1) / 12) * Math.PI * 2;
      tris.triangle([p.x, p.y + lift, p.z], [p.x + Math.cos(a1) * half, p.y + lift, p.z + Math.sin(a1) * half], [p.x + Math.cos(a0) * half, p.y + lift, p.z + Math.sin(a0) * half], col, alpha);
    }
    return;
  }
  for (let i = 0; i + 1 < pts.length; i++) {
    const p = pts[i];
    const q = pts[i + 1];
    const dx = q.x - p.x;
    const dz = q.z - p.z;
    const l = Math.hypot(dx, dz) || 1;
    const nx = (-dz / l) * half;
    const nz = (dx / l) * half;
    tris.quad([p.x + nx, p.y + lift, p.z + nz], [q.x + nx, q.y + lift, q.z + nz], [q.x - nx, q.y + lift, q.z - nz], [p.x - nx, p.y + lift, p.z - nz], col, alpha);
  }
}

const scaled = (p: Vec3, k: number): Vec3 => ({ x: p.x * k, y: p.y * k, z: p.z * k });

/** A thrown arrow's flight by its game's physics (`ballistics.ts`), plan units; null for one without a projectile. Kept per arrow. */
const flights = new WeakMap<PlanArrow, Vec3[] | null>();
function throwPath(plan: Plan, a: PlanArrow): Vec3[] | null {
  if (flights.has(a)) return flights.get(a)!;
  const spec = parseThrow(a.weapon);
  let out: Vec3[] | null = null;
  if (spec && a.points.length >= 2) {
    const upm = unitsPerMetre(plan);
    out = solveThrow(spec, scaled(a.points[0], 1 / upm), scaled(a.points[a.points.length - 1], 1 / upm)).points.map((q) => scaled(q, upm));
  }
  flights.set(a, out);
  return out;
}

/** A route's end: two rings and a cross through them, in its colour. */
function endMark(lines: VertexBuffer, p: Vec3, width: number, col: Rgb): void {
  const r = width * 1.6;
  ring(lines, p, r, col);
  ring(lines, p, r * 0.6, col);
  const y = p.y + 0.1;
  lines.line([p.x - r, y, p.z], [p.x + r, y, p.z], col, 1);
  lines.line([p.x, y, p.z - r], [p.x, y, p.z + r], col, 1);
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
function arrow(tris: VertexBuffer, lines: VertexBuffer, a: PlanArrow, col: Rgb, width: number, alpha: number, apex: number, flight: Vec3[] | null = null): void {
  const pts = a.points;
  if (pts.length < 2) return;
  if (a.style === 'throw') {
    const arc = flight && flight.length >= 2 ? flight : throwArc(pts[0], pts[pts.length - 1], apex);
    for (let i = 0; i + 1 < arc.length; i++) {
      // Dashed: every other segment.
      if (i % 2) continue;
      lines.line([arc[i].x, arc[i].y, arc[i].z], [arc[i + 1].x, arc[i + 1].y, arc[i + 1].z], col, alpha);
    }
    ring(lines, arc[arc.length - 1], width * 1.2, col);
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
