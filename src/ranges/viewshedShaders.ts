/**
 * Line of sight for the range shells: what a unit can see, as six depth
 * pictures taken from its eye (the faces of a cube round it), drawn by the GPU
 * from the level's own triangles and kept on the GPU - never read back.
 *
 * A face holds, for each direction, how far the unit sees before the level
 * stops its view (distance over the view's reach, written as the depth). A
 * point is seen when it is no farther than that along its direction. The
 * shells are cut where their points are hidden, with a bright edge where
 * seen and hidden meet; the ground the unit sees within reach is shaded.
 *
 * Every face keeps the eye it was taken from (`views`, relative to the frame's
 * origin, with the reach; reach 0: not taken yet, everything counts as seen),
 * so faces taken a few frames apart while a unit moves stay true to theirs.
 */

/** The most units with a line of sight at once. */
export const MAX_VIEWS = 4;
/** Texels along a face's side. */
export const VIEW_FACE = 256;
/** Layers of the depth array: six faces a view. */
export const VIEW_LAYERS = MAX_VIEWS * 6;

/** The six faces: the axis looked along, then the axes across and up the picture. */
export const FACES: [number, number, number][][] = [
  [[1, 0, 0], [0, 0, -1], [0, 1, 0]],
  [[-1, 0, 0], [0, 0, 1], [0, 1, 0]],
  [[0, 1, 0], [1, 0, 0], [0, 0, -1]],
  [[0, -1, 0], [1, 0, 0], [0, 0, 1]],
  [[0, 0, 1], [1, 0, 0], [0, 1, 0]],
  [[0, 0, -1], [-1, 0, 0], [0, 1, 0]],
];

/** Which face a direction falls on (the same rule as the shaders'). */
export function faceOf(d: readonly number[]): number {
  const ax = Math.abs(d[0]), ay = Math.abs(d[1]), az = Math.abs(d[2]);
  if (ax >= ay && ax >= az) return d[0] > 0 ? 0 : 1;
  if (ay >= az) return d[1] > 0 ? 2 : 3;
  return d[2] > 0 ? 4 : 5;
}

/** Where a direction falls on its face, -1..1 across and up. */
export function faceUv(d: readonly number[], f: number): [number, number] {
  const [a, r, u] = FACES[f];
  const w = d[0] * a[0] + d[1] * a[1] + d[2] * a[2];
  return [(d[0] * r[0] + d[1] * r[1] + d[2] * r[2]) / w, (d[0] * u[0] + d[1] * u[1] + d[2] * u[2]) / w];
}

const glslVec = (v: number[]) => `vec3(${v.map((x) => x.toFixed(1)).join(', ')})`;
const wgslVec = (v: number[]) => `vec3f(${v.map((x) => x.toFixed(1)).join(', ')})`;

/**
 * GLSL: `viewSeen(slot, rel)` - -1 where hidden from that view, else how
 * clearly seen (1; less near the edge of what is seen).
 * uViews: per face its eye (relative) and reach; uFaces: x texels a side, y bias (data units).
 */
export const VIEW_GLSL = `
uniform vec4 uViews[${MAX_VIEWS * 6}];
uniform vec4 uFaces;
uniform sampler2DArray uViewDepth;
const vec3 FACE_A[6] = vec3[6](${FACES.map((f) => glslVec(f[0])).join(', ')});
const vec3 FACE_R[6] = vec3[6](${FACES.map((f) => glslVec(f[1])).join(', ')});
const vec3 FACE_U[6] = vec3[6](${FACES.map((f) => glslVec(f[2])).join(', ')});
int viewFace(vec3 d) {
  vec3 a = abs(d);
  if (a.x >= a.y && a.x >= a.z) return d.x > 0.0 ? 0 : 1;
  if (a.y >= a.z) return d.y > 0.0 ? 2 : 3;
  return d.z > 0.0 ? 4 : 5;
}
float viewDepthAt(int layer, vec2 uv) {
  float n = uFaces.x;
  ivec2 px = clamp(ivec2((uv * 0.5 + 0.5) * n), ivec2(0), ivec2(int(n) - 1));
  return texelFetch(uViewDepth, ivec3(px, layer), 0).r;
}
float viewSeen(int slot, vec3 rel) {
  int f = viewFace(rel - uViews[slot * 6].xyz);
  vec4 e = uViews[slot * 6 + f];
  if (e.w <= 0.0) return 1.0;
  vec3 d = rel - e.xyz;
  float dist = length(d);
  if (dist >= e.w) return 1.0;
  float w = max(dot(d, FACE_A[f]), 1e-6);
  vec2 uv = vec2(dot(d, FACE_R[f]), dot(d, FACE_U[f])) / w;
  float bias = 0.004 * dist + uFaces.y;
  int layer = slot * 6 + f;
  if (dist > viewDepthAt(layer, uv) * e.w + bias) return -1.0;
  float o = 5.0 / uFaces.x;
  float hidden = 0.0;
  if (dist > viewDepthAt(layer, uv + vec2(o, 0.0)) * e.w + bias) hidden += 0.5;
  if (dist > viewDepthAt(layer, uv - vec2(o, 0.0)) * e.w + bias) hidden += 0.5;
  if (dist > viewDepthAt(layer, uv + vec2(0.0, o)) * e.w + bias) hidden += 0.5;
  if (dist > viewDepthAt(layer, uv - vec2(0.0, o)) * e.w + bias) hidden += 0.5;
  return 1.0 - min(1.0, hidden);
}
`;

/** WGSL: the same, reading `u.views`, `u.faces` and `viewDepth` (declared by the including shader); rows run top down. */
export const VIEW_WGSL = /* wgsl */ `
const FACE_A = array<vec3f, 6>(${FACES.map((f) => wgslVec(f[0])).join(', ')});
const FACE_R = array<vec3f, 6>(${FACES.map((f) => wgslVec(f[1])).join(', ')});
const FACE_U = array<vec3f, 6>(${FACES.map((f) => wgslVec(f[2])).join(', ')});
fn viewFace(d: vec3f) -> i32 {
  let a = abs(d);
  if (a.x >= a.y && a.x >= a.z) { return select(1, 0, d.x > 0.0); }
  if (a.y >= a.z) { return select(3, 2, d.y > 0.0); }
  return select(5, 4, d.z > 0.0);
}
fn viewDepthAt(layer: i32, uv: vec2f) -> f32 {
  let n = u.faces.x;
  let px = clamp(vec2i(vec2f(uv.x * 0.5 + 0.5, 0.5 - uv.y * 0.5) * n), vec2i(0), vec2i(i32(n) - 1));
  return textureLoad(viewDepth, px, layer, 0);
}
fn viewSeen(slot: i32, rel: vec3f) -> f32 {
  let f = viewFace(rel - u.views[slot * 6].xyz);
  let e = u.views[slot * 6 + f];
  if (e.w <= 0.0) { return 1.0; }
  let d = rel - e.xyz;
  let dist = length(d);
  if (dist >= e.w) { return 1.0; }
  let w = max(dot(d, FACE_A[f]), 1e-6);
  let uv = vec2f(dot(d, FACE_R[f]), dot(d, FACE_U[f])) / w;
  let bias = 0.004 * dist + u.faces.y;
  let layer = slot * 6 + f;
  if (dist > viewDepthAt(layer, uv) * e.w + bias) { return -1.0; }
  let o = 5.0 / u.faces.x;
  var hidden = 0.0;
  if (dist > viewDepthAt(layer, uv + vec2f(o, 0.0)) * e.w + bias) { hidden += 0.5; }
  if (dist > viewDepthAt(layer, uv - vec2f(o, 0.0)) * e.w + bias) { hidden += 0.5; }
  if (dist > viewDepthAt(layer, uv + vec2f(0.0, o)) * e.w + bias) { hidden += 0.5; }
  if (dist > viewDepthAt(layer, uv - vec2f(0.0, o)) * e.w + bias) { hidden += 0.5; }
  return 1.0 - min(1.0, hidden);
}
`;

/** Taking a face: the level's triangles, each point's distance from the eye over the reach as its depth. */
export const CAPTURE_GLSL_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPos;
uniform vec3 uEye;
uniform vec3 uAx;
uniform vec3 uRt;
uniform vec3 uUp;
uniform float uNear;
out vec3 vD;
void main() {
  vec3 d = aPos - uEye;
  vD = d;
  float w = dot(d, uAx);
  gl_Position = vec4(dot(d, uRt), dot(d, uUp), w - 2.0 * uNear, w);
}
`;

export const CAPTURE_GLSL_FS = `#version 300 es
precision highp float;
in vec3 vD;
uniform float uFar;
void main() {
  float dist = length(vD);
  // Pushed back by how much the distance changes across a texel: ground seen at a
  // grazing angle is not hidden by its own neighbouring texel (a slope-scaled bias).
  float slope = fwidth(dist);
  if (dist > uFar) discard;
  gl_FragDepth = min(1.0, (dist + 1.5 * slope) / uFar);
}
`;

export const CAPTURE_WGSL = /* wgsl */ `
struct C {
  eye: vec4f,
  ax: vec4f,
  rt: vec4f,
  up: vec4f,
};
@group(0) @binding(0) var<uniform> c: C;
struct V {
  @builtin(position) pos: vec4f,
  @location(0) d: vec3f,
};
@vertex
fn vsCapture(@location(0) pos: vec3f) -> V {
  let d = pos - c.eye.xyz;
  let w = dot(d, c.ax.xyz);
  var o: V;
  o.pos = vec4f(dot(d, c.rt.xyz), dot(d, c.up.xyz), w - c.ax.w, w);
  o.d = d;
  return o;
}
@fragment
fn fsCapture(v: V) -> @builtin(frag_depth) f32 {
  let dist = length(v.d);
  let slope = fwidth(dist);
  if (dist > c.eye.w) { discard; }
  return min(1.0, (dist + 1.5 * slope) / c.eye.w);
}
`;

/** Floats of a face's capture uniforms (WGSL), and the stride between faces' (bytes, 256-aligned). */
export const CAPTURE_UNIFORM_BYTES = 64;
export const CAPTURE_UNIFORM_STRIDE = 256;

/**
 * The ground a unit sees within reach, shaded: the level drawn again over
 * itself (depth tested, pulled a little towards the eye), each point lit
 * where a view sees it within its reach - brighter inside the best range,
 * with rings at the least, best and most range.
 * uGround[i]: least, best, most range (data units), strength; uGroundCol[i]: colour.
 */
export const GROUND_GLSL_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPos;
uniform mat4 uViewProj;
uniform vec3 uOrigin;
out vec3 vRel;
void main() {
  vRel = aPos - uOrigin;
  gl_Position = uViewProj * vec4(aPos, 1.0);
}
`;

export const GROUND_GLSL_FS = `#version 300 es
precision highp float;
precision highp sampler2DArray;
in vec3 vRel;
uniform vec4 uGround[${MAX_VIEWS}];
uniform vec4 uGroundCol[${MAX_VIEWS}];
// A view cone's axis and the tangent of half its width (0: all round); its height is 9/16 of that.
uniform vec4 uGroundDir[${MAX_VIEWS}];
uniform int uViewCount;
${VIEW_GLSL}
layout(location = 0) out vec4 outColor;
void main() {
  vec4 acc = vec4(0.0);
  // Derivatives first, for every view, before anything branches.
  float rs[${MAX_VIEWS}];
  float fws[${MAX_VIEWS}];
  for (int i = 0; i < ${MAX_VIEWS}; i++) {
    rs[i] = length(vRel - uViews[i * 6].xyz);
    fws[i] = max(fwidth(rs[i]), 1e-6);
  }
  for (int i = 0; i < ${MAX_VIEWS}; i++) {
    if (i >= uViewCount) break;
    vec4 g = uGround[i];
    float r = rs[i];
    float fw = fws[i];
    if (g.w <= 0.0 || r > g.z || r < g.x) continue;
    vec4 dr = uGroundDir[i];
    if (dr.w > 0.0) {
      vec3 q = vRel - uViews[i * 6].xyz;
      vec3 fa = normalize(abs(dr.y) < 0.9 ? cross(dr.xyz, vec3(0.0, 1.0, 0.0)) : cross(dr.xyz, vec3(1.0, 0.0, 0.0)));
      float qz = dot(q, dr.xyz);
      if (qz <= 0.0 || abs(dot(q, fa)) > dr.w * qz || abs(dot(q, cross(dr.xyz, fa))) > dr.w * 0.5625 * qz) continue;
    }
    if (viewSeen(i, vRel) < 0.0) continue;
    float ring = max(max(1.0 - smoothstep(0.5, 1.5, abs(r - g.z) / fw), 1.0 - smoothstep(0.5, 1.5, abs(r - g.y) / fw)), g.x > 0.0 ? 1.0 - smoothstep(0.5, 1.5, abs(r - g.x) / fw) : 0.0);
    float a = g.w * ((r <= g.y ? 0.22 : 0.12) + ring * 0.6);
    acc.rgb += uGroundCol[i].rgb * a;
    acc.a = max(acc.a, a);
  }
  if (acc.a <= 0.002) discard;
  outColor = vec4(acc.rgb / max(acc.a, 1e-4), min(acc.a, 0.85));
}
`;

export const GROUND_WGSL = /* wgsl */ `
struct U {
  viewProj: mat4x4f,
  origin: vec4f,
  views: array<vec4f, ${MAX_VIEWS * 6}>,
  faces: vec4f,
  ground: array<vec4f, ${MAX_VIEWS}>,
  colour: array<vec4f, ${MAX_VIEWS}>,
  dir: array<vec4f, ${MAX_VIEWS}>,
};
@group(0) @binding(0) var<uniform> u: U;
@group(0) @binding(1) var viewDepth: texture_depth_2d_array;
${VIEW_WGSL}
struct V {
  @builtin(position) pos: vec4f,
  @location(0) rel: vec3f,
};
@vertex
fn vsGround(@location(0) pos: vec3f) -> V {
  var o: V;
  o.pos = u.viewProj * vec4f(pos, 1.0);
  o.rel = pos - u.origin.xyz;
  return o;
}
fn ringAA(x: f32, fw: f32) -> f32 {
  return 1.0 - smoothstep(0.5, 1.5, abs(x) / max(fw, 1e-6));
}
@fragment
fn fsGround(v: V) -> @location(0) vec4f {
  var acc = vec4f(0.0);
  let count = i32(u.origin.w);
  // Derivatives first, for every view, before anything branches.
  var rs: array<f32, ${MAX_VIEWS}>;
  var fws: array<f32, ${MAX_VIEWS}>;
  for (var i = 0; i < ${MAX_VIEWS}; i++) {
    rs[i] = length(v.rel - u.views[i * 6].xyz);
    fws[i] = fwidth(rs[i]);
  }
  for (var i = 0; i < ${MAX_VIEWS}; i++) {
    let g = u.ground[i];
    let r = rs[i];
    let fw = fws[i];
    if (i >= count || g.w <= 0.0 || r > g.z || r < g.x) { continue; }
    let dr = u.dir[i];
    if (dr.w > 0.0) {
      let q = v.rel - u.views[i * 6].xyz;
      let fa = normalize(select(cross(dr.xyz, vec3f(1.0, 0.0, 0.0)), cross(dr.xyz, vec3f(0.0, 1.0, 0.0)), abs(dr.y) < 0.9));
      let qz = dot(q, dr.xyz);
      if (qz <= 0.0 || abs(dot(q, fa)) > dr.w * qz || abs(dot(q, cross(dr.xyz, fa))) > dr.w * 0.5625 * qz) { continue; }
    }
    if (viewSeen(i, v.rel) < 0.0) { continue; }
    var ring = max(ringAA(r - g.z, fw), ringAA(r - g.y, fw));
    if (g.x > 0.0) { ring = max(ring, ringAA(r - g.x, fw)); }
    let a = g.w * (select(0.12, 0.22, r <= g.y) + ring * 0.6);
    acc = vec4f(acc.rgb + u.colour[i].rgb * a, max(acc.a, a));
  }
  if (acc.a <= 0.002) { discard; }
  return vec4f(acc.rgb / max(acc.a, 1e-4), min(acc.a, 0.85));
}
`;

export const GROUND_UNIFORM_BYTES = 64 + 16 + MAX_VIEWS * 6 * 16 + 16 + MAX_VIEWS * 16 * 3;
