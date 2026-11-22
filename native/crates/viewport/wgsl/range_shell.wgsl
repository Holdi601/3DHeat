
struct U {
  viewProj: mat4x4f,
  cam: vec4f,
  style: vec4f,
  views: array<vec4f, 24>,
  faces: vec4f,
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
  @location(1) t: f32,
  @location(2) @interpolate(flat) a: vec4f,
  @location(3) @interpolate(flat) b: vec4f,
  @location(4) @interpolate(flat) c: vec4f,
  @location(5) @interpolate(flat) d: vec4f,
  @location(6) @interpolate(flat) e: vec4f,
  @location(7) @interpolate(flat) f: vec4f,
};

@vertex
fn vsShell(@location(0) pos: vec4f, @location(1) iA: vec4f, @location(2) iB: vec4f, @location(3) iC: vec4f,
           @location(4) iD: vec4f, @location(5) iE: vec4f, @location(6) iF: vec4f) -> V {
  var p: vec3f;
  var t = -1.0;
  if (pos.w < 0.5) {
    p = iA.xyz + pos.xyz * iA.w;
  } else {
    let f = iC.xyz;
    let a = normalize(select(cross(f, vec3f(1.0, 0.0, 0.0)), cross(f, vec3f(0.0, 1.0, 0.0)), abs(f.y) < 0.9));
    let b = cross(f, a);
    let c = max(iC.w, -1.0);
    let s = sqrt(max(0.0, 1.0 - c * c));
    var dir = c * f + s * (pos.y * a + pos.z * b);
    // A view frustum: the circle round the cone's side squared off to its width and height.
    if (iC.w < -2.5) {
      let m = max(max(abs(pos.y), abs(pos.z)), 1e-6);
      dir = normalize(f + (pos.y / m) * iF.z * a + (pos.z / m) * iF.w * b);
    }
    p = iA.xyz + dir * iA.w * pos.x;
    t = pos.x;
  }
  var o: V;
  o.pos = u.viewProj * vec4f(p, 1.0);
  o.rel = p;
  o.t = t;
  o.a = iA; o.b = iB; o.c = iC; o.d = iD; o.e = iE; o.f = iF;
  return o;
}

fn lineAA(x: f32, fw: f32) -> f32 {
  let d = abs(fract(x + 0.5) - 0.5);
  return 1.0 - smoothstep(0.5, 1.5, d / max(fw, 1e-6));
}
fn edgeAA(s: f32, fw: f32) -> f32 {
  return 1.0 - smoothstep(1.0, 2.5, s / max(fw, 1e-6));
}

@fragment
fn fsShell(v: V) -> @location(0) vec4f {
  let d = v.rel - v.a.xyz;
  let r = max(length(d), 1e-6);
  let dir = d / r;
  let side = v.t >= 0.0;
  let h = d.y;
  let cosA = dot(dir, v.c.xyz);
  let lat = asin(clamp(dir.y, -1.0, 1.0)) * 57.29578;
  let az = atan2(dir.z, dir.x) * 57.29578;
  let fwH = fwidth(h);
  let fwE = fwidth(dir.y);
  let fwC = fwidth(cosA);
  let fwLat = fwidth(lat / 15.0);
  let fwAz = fwidth(az / 30.0);
  let fwR = fwidth(r);
  let fwT = fwidth(v.t * 4.0);
  let n = normalize(cross(dpdx(v.rel), dpdy(v.rel)));
  // Across and up a view frustum, as tangents off its axis.
  let fa = normalize(select(cross(v.c.xyz, vec3f(1.0, 0.0, 0.0)), cross(v.c.xyz, vec3f(0.0, 1.0, 0.0)), abs(v.c.y) < 0.9));
  let fb = cross(v.c.xyz, fa);
  let fz = max(cosA, 1e-4);
  let fx = dot(dir, fa) / fz;
  let fy = dot(dir, fb) / fz;
  let fwX = fwidth(fx);
  let fwY = fwidth(fy);
  let frustum = v.c.w < -2.5;

  if (h < v.d.x || h > v.d.y) { discard; }
  if (dir.y < v.d.z - 1e-4 || dir.y > v.d.w + 1e-4) { discard; }
  if (v.c.w > -1.5 && !side && cosA < v.c.w) { discard; }
  if (frustum && !side && (cosA <= 0.0 || abs(fx) > v.f.z || abs(fy) > v.f.w)) { discard; }

  var edge = 0.0;
  if (v.d.x > -1e8) { edge = max(edge, edgeAA(h - v.d.x, fwH)); }
  if (v.d.y < 1e8) { edge = max(edge, edgeAA(v.d.y - h, fwH)); }
  if (v.d.z > -0.999) { edge = max(edge, edgeAA(dir.y - v.d.z, fwE)); }
  if (v.d.w < 0.999) { edge = max(edge, edgeAA(v.d.w - dir.y, fwE)); }
  if (v.c.w > -1.5 && !side) { edge = max(edge, edgeAA(cosA - v.c.w, fwC)); }
  if (frustum && !side) { edge = max(edge, max(edgeAA(v.f.z - abs(fx), fwX), edgeAA(v.f.w - abs(fy), fwY))); }

  var seen = 1.0;
  if (u.style.z > 0.5 && v.e.y > -0.5) {
    seen = viewSeen(i32(v.e.y + 0.5), v.rel);
    if (seen < 0.0) { discard; }
  }

  let band = i32(v.e.x + 0.5);
  var lines: f32;
  if (!side) {
    lines = max(lineAA(lat / 15.0, fwLat), lineAA(az / 30.0, fwAz));
  } else {
    lines = lineAA(v.t * 4.0, fwT);
    if (v.f.x > 0.0) { lines = max(lines, edgeAA(abs(r - v.f.x), fwR)); }
    if (v.f.y > 0.0) { lines = max(lines, edgeAA(abs(r - v.f.y), fwR)); }
  }
  var pattern = 1.0;
  if (band == 1) { pattern = step(0.45, fract((az + lat) / 6.0)); }
  if (band == 0) { pattern = step(0.7, fract((az + lat) / 2.5)); }
  lines = lines * pattern;
  var col = v.b.rgb;
  if (band == 1) { col = mix(v.b.rgb, vec3f(1.0), 0.25); }
  if (band == 0) { col = mix(v.b.rgb, vec3f(0.6), 0.5); }
  let rim = pow(1.0 - abs(dot(n, normalize(u.cam.xyz - v.rel))), 3.0);
  let fill = select(0.05, 0.035, band == 2);
  edge = max(edge, 1.0 - seen);
  let a = u.cam.w * (u.style.x * (fill + rim * 0.45) + u.style.y * lines * 0.55 + edge * 0.9);
  if (a <= 0.002) { discard; }
  return vec4f(col, clamp(a, 0.0, 1.0));
}
