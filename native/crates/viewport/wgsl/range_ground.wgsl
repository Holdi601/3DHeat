
struct U {
  viewProj: mat4x4f,
  origin: vec4f,
  views: array<vec4f, 24>,
  faces: vec4f,
  ground: array<vec4f, 4>,
  colour: array<vec4f, 4>,
  dir: array<vec4f, 4>,
};
@group(0) @binding(0) var<uniform> u: U;
@group(0) @binding(1) var viewDepth: texture_depth_2d_array;

const FACE_A = array<vec3f, 6>(vec3f(1.0, 0.0, 0.0), vec3f(-1.0, 0.0, 0.0), vec3f(0.0, 1.0, 0.0), vec3f(0.0, -1.0, 0.0), vec3f(0.0, 0.0, 1.0), vec3f(0.0, 0.0, -1.0));
const FACE_R = array<vec3f, 6>(vec3f(0.0, 0.0, -1.0), vec3f(0.0, 0.0, 1.0), vec3f(1.0, 0.0, 0.0), vec3f(1.0, 0.0, 0.0), vec3f(1.0, 0.0, 0.0), vec3f(-1.0, 0.0, 0.0));
const FACE_U = array<vec3f, 6>(vec3f(0.0, 1.0, 0.0), vec3f(0.0, 1.0, 0.0), vec3f(0.0, 0.0, -1.0), vec3f(0.0, 0.0, 1.0), vec3f(0.0, 1.0, 0.0), vec3f(0.0, 1.0, 0.0));
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
  var rs: array<f32, 4>;
  var fws: array<f32, 4>;
  for (var i = 0; i < 4; i++) {
    rs[i] = length(v.rel - u.views[i * 6].xyz);
    fws[i] = fwidth(rs[i]);
  }
  for (var i = 0; i < 4; i++) {
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
