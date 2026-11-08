/**
 * Drawing and editing volumes with the pointer: the same gestures on the 3D
 * view and on the 2D map.
 *
 * One click picks the tool (the Volumes panel), then one drag on the ground
 * draws the shape - a box's rectangle corner to corner, an n-gon, cylinder or
 * sphere from its centre out - and it gets heights from the data under it. A
 * free polygon is clicked point by point and closed with a double-click, Enter,
 * or a click on its first point. A selected volume shows handles: drag the
 * body to move it over the ground, corners and points to reshape it, the top
 * and bottom to set its heights, the outer handle to turn it; Alt+drag moves a
 * copy. Delete removes it, Ctrl+Z / Ctrl+Y undo and redo, Esc cancels.
 *
 * Host-agnostic: the host turns screen positions into ground points and world
 * points back into screen positions (the engine for the 3D view, the map's
 * projection for the map), and the camera never sees a press this takes.
 */

import type { Dataset } from '../state/types';
import { defaultSize, fitHeights, verticalExtent } from './fit';
import { selectedVolume, useVolumeStore, type DrawKind } from './store';
import {
  dragCorner,
  dragHeight,
  dragRadius,
  dragVertex,
  footprintHolds,
  regularPolygon,
  rotateShape,
  shapeAnchor,
  shapeFootprint,
  translateShape,
  volumeHandles,
  type Handle,
  type Vec2,
  type Vec3,
  type Volume,
  type VolumeShape,
} from './volume';

export interface GestureHost {
  /** The ground under a screen position: the level's surface, else the data's floor. */
  ground(sx: number, sy: number): Vec3 | null;
  /** The point on the horizontal plane at height `y` under a screen position. */
  plane(sx: number, sy: number, y: number): Vec3 | null;
  /** A world point on screen, or null when behind the camera. */
  toScreen(p: Vec3): [number, number] | null;
  /**
   * The height on the vertical line through (x, z) nearest the pointer's ray.
   * Absent on the map, which looks straight down and so cannot set heights.
   */
  vertical?(sx: number, sy: number, x: number, z: number): number | null;
  dataset(): Dataset | null;
}

export interface Mods {
  shift: boolean;
  alt: boolean;
}

/** How near, in pixels, a press must be to a handle or a polygon's first point. */
const HANDLE_PX = 10;
/** Under this many pixels a draw drag is a click, which places a default-sized shape. */
const CLICK_PX = 5;

type Drag =
  | { kind: 'draw'; tool: Exclude<DrawKind, 'polygon'>; from: Vec3; sx: number; sy: number; shape: VolumeShape | null }
  | { kind: 'handle'; id: string; handle: Handle; from: Vec3 | null; start: VolumeShape; sx: number; sy: number; moved: boolean };

export class VolumeGestures {
  private drag: Drag | null = null;
  /** The free polygon being clicked out. */
  private poly: Vec3[] = [];
  private cursor: Vec3 | null = null;
  /** The handle under the pointer, for highlighting. */
  hover: Handle | null = null;
  /** Bumped on every change worth redrawing for. */
  version = 0;

  constructor(private readonly host: GestureHost) {}

  /** Whether a gesture is in progress (a drag or a polygon being drawn). */
  get busy(): boolean {
    return this.drag !== null || this.poly.length > 0;
  }

  /** The shape being drawn, not yet a volume. */
  draft(): VolumeShape | null {
    if (this.drag?.kind === 'draw') return this.drag.shape;
    if (this.poly.length > 0) {
      const pts: Vec2[] = this.poly.map((p) => [p[0], p[2]]);
      if (this.cursor) pts.push([this.cursor[0], this.cursor[2]]);
      const y = this.poly[0][1];
      return { kind: 'prism', points: pts, floor: y, ceil: y + this.previewHeight() };
    }
    return null;
  }

  /** The polygon's points so far, for drawing its markers. */
  polygonPoints(): readonly Vec3[] {
    return this.poly;
  }

  /** The handles a host may draw for the selected volume (no height handles without `vertical`). */
  handles(v: Volume | null): Handle[] {
    if (!v) return [];
    return volumeHandles(v.shape).filter((h) => this.host.vertical || (h.kind !== 'top' && h.kind !== 'bottom'));
  }

  private bump(): void {
    this.version++;
  }

  private previewHeight(): number {
    const d = this.host.dataset();
    return Math.min(verticalExtent(d), defaultSize(d)) || 1;
  }

  /** The handle within reach of a screen position, nearest first. */
  private handleAt(v: Volume, sx: number, sy: number): Handle | null {
    let best: Handle | null = null;
    let bestD = HANDLE_PX;
    for (const h of this.handles(v)) {
      const s = this.host.toScreen(h.at);
      if (!s) continue;
      const d = Math.hypot(s[0] - sx, s[1] - sy);
      // Ties go to anything but the body, so a small volume's corners stay reachable.
      if (d < bestD || (d === bestD && best?.kind === 'move')) {
        best = h;
        bestD = d;
      }
    }
    return best;
  }

  /** The visible volume whose footprint is under a screen position: the smallest, so nested ones can be picked. */
  volumeAt(sx: number, sy: number): Volume | null {
    const g = this.host.ground(sx, sy);
    if (!g) return null;
    let best: Volume | null = null;
    let bestArea = Infinity;
    for (const v of useVolumeStore.getState().volumes) {
      if (!v.visible || !footprintHolds(v.shape, g[0], g[2])) continue;
      const a = shapeFootprint(v.shape);
      if (a < bestArea) {
        best = v;
        bestArea = a;
      }
    }
    return best;
  }

  /**
   * A press. True when the press is taken - drawing, or on the selected
   * volume's handles or body - and must not reach the camera.
   */
  down(sx: number, sy: number, mods: Mods): boolean {
    const st = useVolumeStore.getState();
    if (st.drawing === 'polygon') {
      const g = this.poly.length > 0 ? this.host.plane(sx, sy, this.poly[0][1]) : this.host.ground(sx, sy);
      if (!g) return true;
      // Back on the first point closes it.
      if (this.poly.length >= 3) {
        const first = this.host.toScreen(this.poly[0]);
        if (first && Math.hypot(first[0] - sx, first[1] - sy) <= HANDLE_PX) {
          this.finishPolygon();
          return true;
        }
      }
      this.poly.push(g);
      this.cursor = g;
      this.bump();
      return true;
    }
    if (st.drawing) {
      const g = this.host.ground(sx, sy);
      if (!g) return true;
      this.drag = { kind: 'draw', tool: st.drawing, from: g, sx, sy, shape: null };
      this.bump();
      return true;
    }
    const sel = selectedVolume(st);
    if (!sel || !sel.visible) return false;
    let handle = this.handleAt(sel, sx, sy);
    if (!handle) {
      const g = this.host.ground(sx, sy);
      if (g && footprintHolds(sel.shape, g[0], g[2])) handle = { kind: 'move', index: 0, at: shapeAnchor(sel.shape) };
    }
    if (!handle) return false;
    let target = sel;
    if (mods.alt) {
      // Alt-drag moves a copy and leaves the original where it was.
      const copy = st.duplicate(sel.id);
      if (copy) target = copy;
    }
    st.checkpoint();
    const from = handle.kind === 'move' ? this.host.ground(sx, sy) : null;
    this.drag = { kind: 'handle', id: target.id, handle, from, start: target.shape, sx, sy, moved: false };
    this.bump();
    return true;
  }

  move(sx: number, sy: number, mods: Mods): void {
    const st = useVolumeStore.getState();
    const drag = this.drag;
    if (!drag) {
      // Hover: the rubber band of a polygon, the handle under the pointer.
      if (this.poly.length > 0) {
        this.cursor = this.host.plane(sx, sy, this.poly[0][1]);
        this.bump();
        return;
      }
      const sel = selectedVolume(st);
      const h = sel && sel.visible ? this.handleAt(sel, sx, sy) : null;
      if (h?.kind !== this.hover?.kind || h?.index !== this.hover?.index) {
        this.hover = h;
        this.bump();
      }
      return;
    }
    if (drag.kind === 'draw') {
      drag.shape = this.drawShape(drag, sx, sy, mods, false);
      this.bump();
      return;
    }
    drag.moved = drag.moved || Math.hypot(sx - drag.sx, sy - drag.sy) > 2;
    const shape = this.editShape(drag, sx, sy, mods);
    if (shape) {
      st.update(drag.id, { shape }, false);
      this.bump();
    }
  }

  up(sx: number, sy: number, mods: Mods): void {
    const drag = this.drag;
    if (!drag) return;
    this.drag = null;
    const st = useVolumeStore.getState();
    if (drag.kind === 'draw') {
      const shape = this.drawShape(drag, sx, sy, mods, true);
      if (shape) {
        const d = this.host.dataset();
        const fitted = shape.kind === 'sphere' ? shape : fitHeights(d, shape, drag.from[1], verticalExtent(d));
        st.add(fitted);
        // One shape per pick of the tool: the next drag edits or moves the camera.
        st.cancelDraw();
      }
    } else if (!drag.moved) {
      // A press and release on the selected volume without moving: nothing
      // changed, so drop the checkpoint taken for it.
      useVolumeStore.setState((s) => ({ past: s.past.slice(0, -1) }));
    }
    this.bump();
  }

  /** A click that reached no tool: selects the volume under it, if any. True when it did. */
  click(sx: number, sy: number): boolean {
    const v = this.volumeAt(sx, sy);
    const st = useVolumeStore.getState();
    if (!v) {
      if (st.selected) {
        st.select(null);
        this.bump();
      }
      return false;
    }
    st.select(v.id);
    this.bump();
    return true;
  }

  /** A double-click: closes a polygon being drawn. */
  dblclick(): boolean {
    if (this.poly.length === 0) return false;
    // The double-click's own presses added the same point twice; drop the extra.
    while (this.poly.length > 3) {
      const a = this.poly[this.poly.length - 1];
      const b = this.poly[this.poly.length - 2];
      if (Math.hypot(a[0] - b[0], a[2] - b[2]) > 1e-6) break;
      this.poly.pop();
    }
    this.finishPolygon();
    return true;
  }

  /** The keyboard. True when the key was the tool's. */
  key(code: string, ctrl: boolean, shift: boolean): boolean {
    const st = useVolumeStore.getState();
    if (code === 'Escape') {
      if (this.drag?.kind === 'handle') {
        st.update(this.drag.id, { shape: this.drag.start }, false);
        this.drag = null;
        this.bump();
        return true;
      }
      if (this.drag || this.poly.length > 0 || st.drawing) {
        this.cancel();
        return true;
      }
      if (st.selected) {
        st.select(null);
        this.bump();
        return true;
      }
      return false;
    }
    if (this.poly.length > 0) {
      if (code === 'Enter' || code === 'NumpadEnter') {
        this.finishPolygon();
        return true;
      }
      if (code === 'Backspace') {
        this.poly.pop();
        this.bump();
        return true;
      }
    }
    if (ctrl && code === 'KeyZ') {
      if (shift) st.redo();
      else st.undo();
      this.bump();
      return true;
    }
    if (ctrl && code === 'KeyY') {
      st.redo();
      this.bump();
      return true;
    }
    if ((code === 'Delete' || code === 'Backspace') && st.selected && !this.drag) {
      st.remove(st.selected);
      this.bump();
      return true;
    }
    if (ctrl && code === 'KeyD' && st.selected) {
      const sel = selectedVolume(st);
      const d = this.host.dataset();
      if (sel) st.duplicate(sel.id, translateShape(sel.shape, defaultSize(d) * 0.25, 0, defaultSize(d) * 0.25));
      this.bump();
      return true;
    }
    return false;
  }

  cancel(): void {
    this.drag = null;
    this.poly = [];
    this.cursor = null;
    useVolumeStore.getState().cancelDraw();
    this.bump();
  }

  private finishPolygon(): void {
    const pts = this.poly;
    this.poly = [];
    this.cursor = null;
    const st = useVolumeStore.getState();
    if (pts.length >= 3) {
      const y = Math.min(...pts.map((p) => p[1]));
      const shape: VolumeShape = { kind: 'prism', points: pts.map((p) => [p[0], p[2]] as Vec2), floor: y, ceil: y + 1 };
      const d = this.host.dataset();
      st.add(fitHeights(d, shape, y, verticalExtent(d)));
    }
    st.cancelDraw();
    this.bump();
  }

  /** The shape a draw drag describes so far; on release a click places a default size. */
  private drawShape(drag: Extract<Drag, { kind: 'draw' }>, sx: number, sy: number, mods: Mods, final: boolean): VolumeShape | null {
    const d = this.host.dataset();
    const g0 = drag.from;
    const click = Math.hypot(sx - drag.sx, sy - drag.sy) < CLICK_PX;
    const p = this.host.plane(sx, sy, g0[1]);
    if (!final && (click || !p)) return null;
    const size = defaultSize(d);
    const h = this.previewHeight();
    let dx: number;
    let dz: number;
    if (click || !p) {
      if (!final) return null;
      dx = size / 2;
      dz = size / 2;
    } else {
      dx = p[0] - g0[0];
      dz = p[2] - g0[2];
    }
    const y = g0[1];
    switch (drag.tool) {
      case 'box': {
        // A click places a square round the point; a drag spans corner to corner.
        const x0 = click ? g0[0] - size / 2 : Math.min(g0[0], g0[0] + dx);
        const z0 = click ? g0[2] - size / 2 : Math.min(g0[2], g0[2] + dz);
        let w = click ? size : Math.abs(dx);
        let dd = click ? size : Math.abs(dz);
        if (mods.shift && !click) w = dd = Math.max(w, dd);
        const cx = click ? g0[0] : dx >= 0 ? x0 + w / 2 : g0[0] - w / 2;
        const cz = click ? g0[2] : dz >= 0 ? z0 + dd / 2 : g0[2] - dd / 2;
        if (w < 1e-6 || dd < 1e-6) return null;
        return { kind: 'box', center: [cx, y + h / 2, cz], size: [w, h, dd], yaw: 0, pitch: 0, roll: 0 };
      }
      case 'ngon': {
        const sides = useVolumeStore.getState().ngonSides;
        const r = Math.hypot(dx, dz);
        if (r < 1e-6) return null;
        // Shift keeps it regular; otherwise it stretches to the drag's two spans.
        const regular = mods.shift || click;
        const rx = regular ? r : Math.max(Math.abs(dx), r * 0.05);
        const rz = regular ? r : Math.max(Math.abs(dz), r * 0.05);
        // A flat side facing the viewer's axes: an octagon as a map would draw one.
        const angle = Math.PI / sides;
        return { kind: 'prism', points: regularPolygon(g0[0], g0[2], rx, rz, sides, angle), floor: y, ceil: y + h, sides };
      }
      case 'cylinder': {
        const r = Math.hypot(dx, dz);
        if (r < 1e-6) return null;
        return { kind: 'cylinder', x: g0[0], z: g0[2], radius: r, floor: y, ceil: y + h };
      }
      case 'sphere': {
        const r = Math.hypot(dx, dz);
        if (r < 1e-6) return null;
        // Resting on the ground where it was drawn.
        return { kind: 'sphere', center: [g0[0], y + r, g0[2]], radius: r };
      }
    }
  }

  /** The shape a handle drag describes, from the shape at the drag's start. */
  private editShape(drag: Extract<Drag, { kind: 'handle' }>, sx: number, sy: number, mods: Mods): VolumeShape | null {
    const s = drag.start;
    const h = drag.handle;
    switch (h.kind) {
      case 'move': {
        const g = this.host.ground(sx, sy);
        if (!g || !drag.from) {
          const p = this.host.plane(sx, sy, h.at[1]);
          if (!p) return null;
          return translateShape(s, p[0] - h.at[0], 0, p[2] - h.at[2]);
        }
        // Over the ground: it rises and falls with what is under the pointer.
        return translateShape(s, g[0] - drag.from[0], g[1] - drag.from[1], g[2] - drag.from[2]);
      }
      case 'top':
      case 'bottom': {
        const y = this.host.vertical?.(sx, sy, h.at[0], h.at[2]);
        if (y === null || y === undefined || !Number.isFinite(y)) return null;
        return dragHeight(s, h.kind, y);
      }
      case 'rotate': {
        const p = this.host.plane(sx, sy, h.at[1]);
        if (!p) return null;
        const a = shapeAnchor(s);
        // Angles as the yaw counts them: atan2(-dz, dx).
        const from = Math.atan2(-(h.at[2] - a[2]), h.at[0] - a[0]);
        const to = Math.atan2(-(p[2] - a[2]), p[0] - a[0]);
        let turn = to - from;
        if (mods.shift) {
          const step = Math.PI / 12;
          const yaw0 = s.kind === 'box' ? s.yaw : 0;
          turn = Math.round((yaw0 + turn) / step) * step - yaw0;
        }
        return rotateShape(s, turn);
      }
      default: {
        const p = this.host.plane(sx, sy, h.at[1]);
        if (!p) return null;
        if (h.kind === 'corner' && s.kind === 'box') return dragCorner(s, h.index, p[0], p[2]);
        if (h.kind === 'vertex' && s.kind === 'prism') return dragVertex(s, h.index, p[0], p[2], mods.shift);
        if (h.kind === 'radius') return dragRadius(s, p[0], p[2]);
        return null;
      }
    }
  }
}

/** Closest height on the vertical line through (x, z) to a ray. */
export function rayToVertical(origin: Vec3, dir: Vec3, x: number, z: number): number | null {
  // Lines P(s) = o + s d and Q(t) = (x, t, z): minimise |P - Q|.
  const wx = origin[0] - x;
  const wz = origin[2] - z;
  const a = dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2];
  const b = dir[1];
  const c = 1;
  const dd = dir[0] * wx + dir[1] * origin[1] + dir[2] * wz;
  const e = origin[1];
  const den = a * c - b * b;
  if (Math.abs(den) < 1e-12) return null;
  // Standard closest points: s = (b e - c dd) / den, t = (a e - b dd) / den.
  const s = (b * e - c * dd) / den;
  if (s < 0) return null;
  return (a * e - b * dd) / den;
}
