import { Matrix4, Vector3 } from 'three';
import type { Camera } from 'three';
import { num, t } from '../i18n';
import { unitPrefs } from '../state/unitsStore';
import { formatLength as formatShort, formatLong } from '../units/format';
import { FT, longUnitMetres, type UnitPrefs } from '../units/units';

/**
 * Ruler and probe tools.
 *
 * Distance is measured against a horizontal reference plane rather than by
 * reading back the depth buffer, because WebGL2 cannot read a depth attachment
 * directly and because on a map heatmap the answer someone actually wants is the
 * ground distance between two places — not the distance along a line that
 * happens to clip a rooftop.
 */

export interface MeasurePoint {
  x: number;
  y: number;
  z: number;
}

export interface MeasureState {
  points: MeasurePoint[];
  /** Live cursor position on the reference plane, or null when off-scene. */
  cursor: MeasurePoint | null;
  /** Accumulated heat under the cursor, or null when not sampled. */
  heat: number | null;
}

/** Floats per overlay line vertex: x,y,z, r,g,b,a — same layout as trails. */
export const OVERLAY_STRIDE = 7;

/**
 * Un-project a screen position onto a horizontal plane at `planeY`.
 *
 * Returns null when the ray points away from the plane, which is what happens
 * whenever the camera is looking at the horizon or upward — a case that would
 * otherwise produce a point thousands of kilometres away.
 */
export function screenToPlane(
  camera: Camera,
  ndcX: number,
  ndcY: number,
  planeY: number,
  out = new Vector3(),
): Vector3 | null {
  const inv = new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).invert();
  // Two points along the ray, then intersect with y = planeY.
  const near = new Vector3(ndcX, ndcY, -1).applyMatrix4(inv);
  const far = new Vector3(ndcX, ndcY, 1).applyMatrix4(inv);
  const dir = far.sub(near);
  if (Math.abs(dir.y) < 1e-9) return null;
  const t = (planeY - near.y) / dir.y;
  if (t < 0 || !Number.isFinite(t)) return null;
  return out.set(near.x + dir.x * t, planeY, near.z + dir.z * t);
}

export function distance(a: MeasurePoint, b: MeasurePoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
}

/** Ground distance, ignoring height difference. */
export function groundDistance(a: MeasurePoint, b: MeasurePoint): number {
  return Math.hypot(b.x - a.x, b.z - a.z);
}

export function pathLength(points: MeasurePoint[]): number {
  let n = 0;
  for (let i = 1; i < points.length; i++) n += distance(points[i - 1], points[i]);
  return n;
}

/**
 * Line geometry for the ruler: the path, a rubber-band segment to the cursor,
 * and a small axis cross at each placed point so its exact position is readable
 * against the heat underneath.
 */
export function buildOverlay(
  state: MeasureState,
  tickSize: number,
  out?: Float32Array,
): { data: Float32Array; count: number } {
  const pts = state.points;
  const segments = Math.max(0, pts.length - 1) + (state.cursor && pts.length > 0 ? 1 : 0);
  const ticks = pts.length * 3 + (state.cursor ? 3 : 0);
  const verts = (segments + ticks) * 2;
  const data = out && out.length >= verts * OVERLAY_STRIDE ? out : new Float32Array(verts * OVERLAY_STRIDE);

  let v = 0;
  const push = (
    p: MeasurePoint,
    dx: number,
    dy: number,
    dz: number,
    r: number,
    g: number,
    b: number,
    a: number,
  ) => {
    const o = v * OVERLAY_STRIDE;
    data[o] = p.x + dx;
    data[o + 1] = p.y + dy;
    data[o + 2] = p.z + dz;
    data[o + 3] = r;
    data[o + 4] = g;
    data[o + 5] = b;
    data[o + 6] = a;
    v++;
  };

  for (let i = 1; i < pts.length; i++) {
    push(pts[i - 1], 0, 0, 0, 1, 0.95, 0.4, 0.95);
    push(pts[i], 0, 0, 0, 1, 0.95, 0.4, 0.95);
  }
  if (state.cursor && pts.length > 0) {
    const last = pts[pts.length - 1];
    // Dimmer, so the un-committed segment reads as provisional.
    push(last, 0, 0, 0, 1, 0.95, 0.4, 0.45);
    push(state.cursor, 0, 0, 0, 1, 0.95, 0.4, 0.45);
  }

  const cross = (p: MeasurePoint, a: number) => {
    push(p, -tickSize, 0, 0, 1, 1, 1, a);
    push(p, tickSize, 0, 0, 1, 1, 1, a);
    push(p, 0, 0, -tickSize, 1, 1, 1, a);
    push(p, 0, 0, tickSize, 1, 1, 1, a);
    push(p, 0, 0, 0, 1, 1, 1, a);
    push(p, 0, tickSize * 2, 0, 1, 1, 1, a);
  };
  for (const p of pts) cross(p, 0.9);
  if (state.cursor) cross(state.cursor, 0.4);

  return { data, count: v };
}

/**
 * A three-axis cross at `p`, in the pick colour, after the `count` vertices
 * already in `data`: the pick marker, riding the ruler's overlay so both
 * backends draw it without a pipeline of its own. Grows the buffer when needed,
 * keeping what is in it.
 */
export function appendCross(
  data: Float32Array,
  count: number,
  p: MeasurePoint,
  size: number,
): { data: Float32Array; count: number } {
  const need = (count + 6) * OVERLAY_STRIDE;
  let out = data;
  if (out.length < need) {
    out = new Float32Array(need);
    out.set(data.subarray(0, count * OVERLAY_STRIDE));
  }
  let v = count;
  const push = (dx: number, dy: number, dz: number) => {
    const o = v * OVERLAY_STRIDE;
    out[o] = p.x + dx;
    out[o + 1] = p.y + dy;
    out[o + 2] = p.z + dz;
    // Cyan: apart from the ruler's yellow and white, and from every heat ramp.
    out[o + 3] = 0.3;
    out[o + 4] = 0.95;
    out[o + 5] = 1;
    out[o + 6] = 1;
    v++;
  };
  push(-size, 0, 0);
  push(size, 0, 0);
  push(0, -size, 0);
  push(0, size, 0);
  push(0, 0, -size);
  push(0, 0, size);
  return { data: out, count: v };
}

/** Format a length with a unit that suits its magnitude, in the viewer's units (`units/`). */
export function formatLength(metres: number, units: UnitPrefs = unitPrefs()): string {
  const a = Math.abs(metres);
  if (units.altitude === 'm' && a < 1) return t('render.measure.centimetres', { value: num(metres * 100, 1) });
  if (units.altitude === 'ft' && a < FT) return t('units.v.in', { v: num(metres / FT * 12, 1) });
  if (a < longUnitMetres(units.distance)) return formatShort(metres, units, 2);
  return formatLong(metres, units, 3);
}
