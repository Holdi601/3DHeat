/**
 * Reverse-Z: how the depth buffer is laid out, in one place.
 *
 * A depth buffer that stores `z/w` the usual way - 0 at the near plane, 1 at the
 * far - spends almost all of its precision right in front of the camera: with a
 * fixed-point 24-bit buffer the step at distance z is about z² / (near · 2²⁴). So
 * the near plane had to be pushed out to keep water and shore from fighting far
 * off, and a near plane metres out cuts the ground and the walls the camera flies
 * along. Turning the range round (1 at the near plane, 0 at the far) and storing
 * it as a 32-bit float puts the float's exponent where the hyperbola needs it:
 * the step becomes about z · 2⁻²³ at every distance, whatever the near plane. So
 * the near plane can sit centimetres from the eye with no z-fighting kilometres
 * away.
 *
 * WebGPU always draws this way (depth32float is core). WebGL2 does when the
 * browser offers `EXT_clip_control`, which turns clip space's depth to [0, 1] -
 * without it, OpenGL's [-1, 1] adds 0.5 to every depth and the float's precision
 * at 0 is lost again, so that context keeps the classic layout and the engine
 * keeps its near plane far enough out (`nearFloor`).
 *
 * Under reverse-Z *nearer is larger*: the depth test is greater-or-equal, the
 * buffer clears to 0, and every comparison in a shader that asks "is this behind
 * that" flips. The shaders say it through the helpers here, so the two layouts
 * cannot drift apart.
 */

/**
 * Clip depth from OpenGL's [-1, 1] (three.js builds its projections so) to
 * reverse-Z's [1, 0]: `z' = (w - z) / 2`. Row-major, as `Matrix4.set` takes it.
 * Premultiplied onto the view-projection, in doubles, before it goes to the GPU,
 * so the small coefficients reverse-Z lives on are never formed in 32 bits.
 */
export const REVERSE_Z_REMAP: readonly number[] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -0.5, 0.5, 0, 0, 0, 1];

/** OpenGL's [-1, 1] to [0, 1] the classic way round: `z' = (z + w) / 2`. */
export const ZERO_ONE_REMAP: readonly number[] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0.5, 0.5, 0, 0, 0, 1];

/** WebGPU's scene depth: reverse-Z, in a 32-bit float. */
export const GPU_DEPTH_FORMAT: GPUTextureFormat = 'depth32float';
/** Its test: nearer is larger, and an equal depth passes (a surface drawn twice, lines on it). */
export const GPU_DEPTH_TEST: GPUCompareFunction = 'greater-equal';
/** What the scene's depth clears to: the far plane. */
export const GPU_DEPTH_CLEAR = 0;

/**
 * The near plane a load calibrates (`calibrate`), in metres: five centimetres,
 * a hand's breadth inside anything the camera can touch. Reverse-Z draws with
 * it as it is; the classic layout keeps its own floor (`viewNearFor`).
 */
export const REVERSE_Z_NEAR_M = 0.05;

/**
 * The classic layout's precision floor: far over this. Past a ratio of about
 * 10⁵ a 24-bit buffer can no longer tell a wall from the ground behind it.
 */
export const CLASSIC_FAR_OVER_NEAR = 100_000;

/**
 * Furthest the classic layout's floor pushes the near plane for a streamed world,
 * whose box reaches 1,500 km past its theatre: 140 m would cut a figure followed
 * from 60 m (its views still move the plane out from high above or outside).
 */
export const CLASSIC_STREAM_NEAR_CAP = 10;

export interface NearQuery {
  /** The camera's near plane as set (the View panel's box). */
  near: number;
  /** The far plane the view draws with. */
  far: number;
  reverse: boolean;
  /** Whether a perspective view out over the scene, which may move the plane out (classic only). */
  grow: boolean;
  /** How far the camera is outside the level and the data together; 0 inside. */
  outside: number;
  /** How far it is above the level's top, past a tenth of the level's width; 0 or less when not. */
  above: number;
  /** Whether the level is a streamed world (`CLASSIC_STREAM_NEAR_CAP`). */
  streamed: boolean;
}

/**
 * The near plane a view draws with.
 *
 * Reverse-Z: the one set - its precision does not depend on it, so nothing has to
 * push it out, and the ground in front of the camera is never cut early.
 *
 * Classic: never nearer than far / 10⁵, and from outside the scene, or high over
 * its ground, out to 2% of that distance, so a map seen from far above keeps
 * enough depth precision that water and shore do not flicker. High means past a
 * tenth of the level's width, which leaves a person flying inside a tall building
 * their near plane.
 */
export function viewNearFor(q: NearQuery): number {
  if (q.reverse) return q.near;
  const floor = Math.min(q.far / CLASSIC_FAR_OVER_NEAR, q.streamed ? CLASSIC_STREAM_NEAR_CAP : Infinity);
  const grown = q.grow ? 0.02 * Math.max(q.outside, q.above, 0) : 0;
  return Math.max(q.near, floor, grown);
}

/**
 * Relative margin a depth must be behind the previous peel layer by to count as
 * the next surface (`PEEL_WGSL`, `PEEL_FS`). Relative because reverse-Z's step
 * is: 2·10⁻⁵ of the distance is 2 mm at 100 m and 2 cm at a kilometre - wide of
 * the float's own rounding, narrow enough to keep a wall standing behind another.
 */
export const PEEL_EPSILON_REVERSE = 2e-5;

/**
 * Least a sprite is lifted towards the camera before it is compared against the
 * scene, as a share of its own depth: a few float steps, so a point lying on a
 * surface does not shadow itself (the 24-bit layout's floor was 8 steps of 2⁻²⁴).
 */
export const OCCLUDE_FLOOR_REVERSE = 5e-7;

/**
 * The window depth a point at view distance `dist` lands at, as the GPU stores it.
 * `reverse` false is WebGPU's classic [0, 1] layout (WebGL2 without clip control
 * stores the same values). For tests and for CPU code that reads depth back.
 */
export function windowDepth(dist: number, near: number, far: number, perspective: boolean, reverse: boolean): number {
  const classic = perspective ? (far * (dist - near)) / (dist * (far - near)) : (dist - near) / (far - near);
  return reverse ? (perspective ? (near * (far - dist)) / (dist * (far - near)) : (far - dist) / (far - near)) : classic;
}

/** The view distance a stored depth stands for: `windowDepth` undone. */
export function viewDistanceAt(depth: number, near: number, far: number, perspective: boolean, reverse: boolean): number {
  if (reverse) return perspective ? (near * far) / Math.max(1e-30, near + depth * (far - near)) : far - depth * (far - near);
  return perspective ? (near * far) / Math.max(1e-30, far - depth * (far - near)) : near + depth * (far - near);
}

/**
 * Whether depth `a` lies behind depth `b` - further from the camera - in the
 * layout given. The one comparison every occlusion test is made of.
 */
export function behind(a: number, b: number, reverse: boolean): boolean {
  return reverse ? a < b : a > b;
}

/**
 * The GLSL side of the same: `DEPTH_BEHIND(a, b)`, `DEPTH_SKY(d)` (nothing was
 * drawn there), `depthToDistance(d, near, far, perspective)`,
 * `towardCamera(d, bias)` and `depthError(z, near)` (how far a point placed from
 * its depth can be off at distance z: a few steps of the buffer). `REVERSE_Z` is defined by `compileProgram` for a
 * context that draws reverse-Z (`setReverseZ` in webgl2/glutil.ts).
 */
export const DEPTH_GLSL = `
#ifdef REVERSE_Z
#define DEPTH_BEHIND(a, b) ((a) < (b))
#define DEPTH_SKY(d) ((d) <= 0.0)
float depthToDistance(float d, float n, float f, bool persp) {
  return persp ? (n * f) / max(1e-30, n + d * (f - n)) : f - d * (f - n);
}
float towardCamera(float d, float bias) {
  return d + max(bias, d * ${OCCLUDE_FLOOR_REVERSE.toExponential()});
}
float depthError(float z, float n) {
  return abs(z) * 1e-6;
}
#else
#define DEPTH_BEHIND(a, b) ((a) > (b))
#define DEPTH_SKY(d) ((d) >= 0.999999)
float depthToDistance(float d, float n, float f, bool persp) {
  if (!persp) return mix(n, f, d);
  float ndc = d * 2.0 - 1.0;
  return (2.0 * n * f) / max(1e-6, f + n - ndc * (f - n));
}
float towardCamera(float d, float bias) {
  return d - max(bias, 8.0 / 16777216.0);
}
float depthError(float z, float n) {
  return z * z / max(abs(n) * 4194304.0, 1e-9);
}
#endif
`;

/**
 * The WGSL side: WebGPU always draws reverse-Z, so these are the reverse-Z forms
 * of `DEPTH_GLSL`'s.
 */
export const DEPTH_WGSL = /* wgsl */ `
fn depthBehind(a : f32, b : f32) -> bool { return a < b; }
fn depthSky(d : f32) -> bool { return d <= 0.0; }
fn depthToDistance(d : f32, n : f32, f : f32, persp : bool) -> f32 {
  if (persp) { return (n * f) / max(1e-30, n + d * (f - n)); }
  return f - d * (f - n);
}
fn towardCamera(d : f32, bias : f32) -> f32 { return d + max(bias, d * ${OCCLUDE_FLOOR_REVERSE.toExponential()}); }
fn depthError(z : f32, n : f32) -> f32 { return abs(z) * 1e-6; }
`;
