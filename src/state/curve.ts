/**
 * Editable sprite ramp, as a piecewise cubic Bézier.
 *
 * This is the shape of a single heat sprite: x is distance from the centre
 * (0 = centre, 1 = rim) and y is how much of the centre intensity applies there
 * (1 = full centre intensity, 0 = full edge intensity). A straight line from
 * (0,1) to (1,0) is the linear ramp; everything else is a matter of taste and of
 * what the data needs.
 *
 * Baked to a lookup table and sampled per fragment rather than evaluated in the
 * shader. Solving a Bézier for x needs iteration, which has no place in the
 * hottest shader in the program — and a 256-entry fetch is cheaper than the
 * `pow()` it replaces.
 */

/**
 * One point on the curve, with Bézier handles.
 *
 * Handles are offsets from the point, not absolute positions, so dragging a
 * point carries its handles along — which is what every curve editor does and
 * what anyone who has used one will expect.
 */
export interface CurvePoint {
  x: number;
  y: number;
  /** Handle towards the previous point. `inX` is normally negative. */
  inX: number;
  inY: number;
  /** Handle towards the next point. `outX` is normally positive. */
  outX: number;
  outY: number;
}

/** Entries in the baked table. 256 is past the point of visible banding. */
export const CURVE_LUT_SIZE = 256;

/**
 * Texture coordinates of the first and last entry's centres.
 *
 * Both shaders sample the table across this range rather than 0..1, so the ends
 * of the ramp stay exact under linear filtering. Derived from the size rather than
 * written out, because a hardcoded half-texel silently stops matching the moment
 * the table is resized.
 */
// Fixed notation with a decimal point: both shader languages would reject an
// integer literal where a float is expected, and GLSL is unforgiving about it.
export const CURVE_U0 = (0.5 / CURVE_LUT_SIZE).toFixed(9);
export const CURVE_U1 = ((CURVE_LUT_SIZE - 0.5) / CURVE_LUT_SIZE).toFixed(9);

export function curvePoint(
  x: number,
  y: number,
  handle = 0.25,
  slope = 0,
): CurvePoint {
  return {
    x,
    y,
    inX: -handle,
    inY: -handle * slope,
    outX: handle,
    outY: handle * slope,
  };
}

/**
 * Named starting points.
 *
 * These exist because a blank curve editor is a worse experience than a slider:
 * the useful shapes for a heat sprite are a small set, and the editor is for
 * departing from one of them rather than discovering them.
 */
export const CURVE_PRESETS: Record<string, CurvePoint[]> = {
  /** The straight ramp. Matches falloff = 1 exactly. */
  Linear: [curvePoint(0, 1, 0.33, -1), curvePoint(1, 0, 0.33, -1)],
  /** S-curve. The shape the original shader's smoothstep produced. */
  Smooth: [curvePoint(0, 1, 0.4, 0), curvePoint(1, 0, 0.4, 0)],
  /** Tight core, long faint skirt. Reads well on sparse data. */
  Tight: [curvePoint(0, 1, 0.1, -4), curvePoint(1, 0, 0.45, 0)],
  /** Flat plateau then a fast rolloff — closer to a disc than a blob. */
  Plateau: [curvePoint(0, 1, 0.55, 0), curvePoint(1, 0, 0.12, -3)],
  /** Bright rim, hollow centre. Good for showing where paths pass, not stop. */
  Ring: [curvePoint(0, 0.15, 0.18, 0), curvePoint(0.62, 1, 0.2, 0), curvePoint(1, 0, 0.18, 0)],
  /** Two-stage falloff, which separates a dense core from its surroundings. */
  Shelf: [
    curvePoint(0, 1, 0.12, 0),
    curvePoint(0.35, 0.45, 0.16, -0.4),
    curvePoint(1, 0, 0.3, 0),
  ],
};

export const DEFAULT_CURVE: CurvePoint[] = CURVE_PRESETS.Smooth.map((p) => ({ ...p }));

/**
 * Put a curve into a usable state: sorted, endpoints pinned to x = 0 and 1, all
 * values inside the unit box.
 *
 * Called on every edit rather than trusted to the editor, because the store is
 * also reachable from the console and from a saved preset, and a curve with
 * points out of order silently bakes to nonsense.
 */
export function normaliseCurve(points: CurvePoint[]): CurvePoint[] {
  const clean = points
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
    .map((p) => ({
      x: clamp01(p.x),
      y: clamp01(p.y),
      inX: Number.isFinite(p.inX) ? p.inX : 0,
      inY: Number.isFinite(p.inY) ? p.inY : 0,
      outX: Number.isFinite(p.outX) ? p.outX : 0,
      outY: Number.isFinite(p.outY) ? p.outY : 0,
    }))
    .sort((a, b) => a.x - b.x);

  if (clean.length === 0) return DEFAULT_CURVE.map((p) => ({ ...p }));
  if (clean.length === 1) {
    // One point is not a curve; extend it into a flat line at its own height.
    const y = clean[0].y;
    return [curvePoint(0, y, 0.33, 0), curvePoint(1, y, 0.33, 0)];
  }
  clean[0].x = 0;
  clean[clean.length - 1].x = 1;
  return clean;
}

/**
 * Evaluate the curve at `x`.
 *
 * Handles are clamped to the segment horizontally, which keeps every segment a
 * function of x. Without that a hard drag folds the curve back on itself and the
 * baked table depends on which root the solver happened to find.
 */
export function evalCurve(points: CurvePoint[], x: number): number {
  const p = points;
  if (p.length === 0) return 0;
  const xc = clamp01(x);
  if (p.length === 1 || xc <= p[0].x) return clamp01(p[0].y);
  const last = p[p.length - 1];
  if (xc >= last.x) return clamp01(last.y);

  let i = 0;
  while (i < p.length - 2 && p[i + 1].x <= xc) i++;
  const a = p[i];
  const b = p[i + 1];
  const dx = b.x - a.x;
  // Coincident points: a segment of zero width has no interior to evaluate.
  if (dx <= 1e-9) return clamp01(b.y);

  const x0 = a.x;
  const x1 = a.x + clampRange(a.outX, 0, dx);
  const x2 = b.x + clampRange(b.inX, -dx, 0);
  const x3 = b.x;
  const t = solveBezierT(x0, x1, x2, x3, xc);
  return clamp01(bezier(a.y, a.y + a.outY, b.y + b.inY, b.y, t));
}

/** Bake the curve into a table the shader can sample. */
export function bakeCurveLut(
  points: CurvePoint[],
  size = CURVE_LUT_SIZE,
  out?: Float32Array,
): Float32Array {
  const lut = out && out.length === size ? out : new Float32Array(size);
  for (let i = 0; i < size; i++) {
    lut[i] = evalCurve(points, i / (size - 1));
  }
  return lut;
}

/** Stable identity for change detection, so an unchanged curve never re-uploads. */
export function curveSignature(points: CurvePoint[]): string {
  let s = '';
  for (const p of points) {
    s += `${r(p.x)},${r(p.y)},${r(p.inX)},${r(p.inY)},${r(p.outX)},${r(p.outY)};`;
  }
  return s;
}

function r(v: number): string {
  return v.toFixed(4);
}

function bezier(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

function bezierSlope(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const u = 1 - t;
  return 3 * (u * u * (p1 - p0) + 2 * u * t * (p2 - p1) + t * t * (p3 - p2));
}

/**
 * Find t where the x-component of the segment equals `x`.
 *
 * Newton first because it converges in two or three steps on the smooth
 * interior, then bisection for the cases Newton handles badly — a near-zero
 * derivative where a handle is pulled flat against the segment end.
 */
function solveBezierT(x0: number, x1: number, x2: number, x3: number, x: number): number {
  let t = (x - x0) / (x3 - x0 || 1);
  for (let i = 0; i < 6; i++) {
    const err = bezier(x0, x1, x2, x3, t) - x;
    if (Math.abs(err) < 1e-7) return t;
    const d = bezierSlope(x0, x1, x2, x3, t);
    if (Math.abs(d) < 1e-6) break;
    t -= err / d;
    if (t < 0 || t > 1) break;
  }
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) * 0.5;
    if (bezier(x0, x1, x2, x3, mid) < x) lo = mid;
    else hi = mid;
  }
  return (lo + hi) * 0.5;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function clampRange(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
