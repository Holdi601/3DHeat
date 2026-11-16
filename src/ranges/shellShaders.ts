/**
 * The range shells' shaders, GLSL for WebGL2 and WGSL for WebGPU, the same
 * drawing in both (`shells.ts` for the instances).
 *
 * Every shell is see-through and added onto the picture (blending `one` onto
 * what is there), so the order they are drawn in never matters and the inner
 * shells show through the outer from outside and from inside alike. The faces
 * themselves are faint: what reads is their rim (where a shell turns away
 * from the eye), their lines - rings of elevation and meridians on the
 * sphere, rings of distance on a cone's side - and the bright edges where a
 * shell is cut. The bands differ by their lines: the most range solid, the
 * best range dashed, the least range dotted and greyed.
 *
 * Lines and edges are measured in pixels (`fwidth`), so they keep their width
 * at every zoom. Derivatives are taken before anything is discarded, as WGSL
 * asks.
 */

import { MAX_VIEWS, VIEW_GLSL, VIEW_WGSL } from './viewshedShaders';

export const SHELL_GLSL_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec4 aPos;
layout(location = 1) in vec4 iA;
layout(location = 2) in vec4 iB;
layout(location = 3) in vec4 iC;
layout(location = 4) in vec4 iD;
layout(location = 5) in vec4 iE;
layout(location = 6) in vec4 iF;
uniform mat4 uViewProj;
out vec3 vRel;
out float vT;
flat out vec4 vA;
flat out vec4 vB;
flat out vec4 vC;
flat out vec4 vD;
flat out vec4 vE;
flat out vec4 vF;
void main() {
  vec3 p;
  if (aPos.w < 0.5) {
    p = iA.xyz + aPos.xyz * iA.w;
    vT = -1.0;
  } else {
    vec3 f = iC.xyz;
    vec3 a = normalize(abs(f.y) < 0.9 ? cross(f, vec3(0.0, 1.0, 0.0)) : cross(f, vec3(1.0, 0.0, 0.0)));
    vec3 b = cross(f, a);
    float c = max(iC.w, -1.0);
    float s = sqrt(max(0.0, 1.0 - c * c));
    vec3 dir = c * f + s * (aPos.y * a + aPos.z * b);
    // A view frustum: the circle round the cone's side squared off to its width and height.
    if (iC.w < -2.5) {
      float m = max(max(abs(aPos.y), abs(aPos.z)), 1e-6);
      dir = normalize(f + (aPos.y / m) * iF.z * a + (aPos.z / m) * iF.w * b);
    }
    p = iA.xyz + dir * iA.w * aPos.x;
    vT = aPos.x;
  }
  vRel = p;
  vA = iA; vB = iB; vC = iC; vD = iD; vE = iE; vF = iF;
  gl_Position = uViewProj * vec4(p, 1.0);
}
`;

export const SHELL_GLSL_FS = `#version 300 es
precision highp float;
precision highp sampler2DArray;
in vec3 vRel;
in float vT;
flat in vec4 vA;
flat in vec4 vB;
flat in vec4 vC;
flat in vec4 vD;
flat in vec4 vE;
flat in vec4 vF;
// xyz: the camera relative to the origin, w: opacity.
uniform vec4 uCam;
// x: faces, y: lines, z: line of sight on.
uniform vec4 uStyle;
${VIEW_GLSL}
layout(location = 0) out vec4 outColor;
float lineAA(float x, float fw) {
  float d = abs(fract(x + 0.5) - 0.5);
  return 1.0 - smoothstep(0.5, 1.5, d / max(fw, 1e-6));
}
float edgeAA(float s, float fw) {
  return 1.0 - smoothstep(1.0, 2.5, s / max(fw, 1e-6));
}
void main() {
  vec3 d = vRel - vA.xyz;
  float r = max(length(d), 1e-6);
  vec3 dir = d / r;
  bool side = vT >= 0.0;
  float h = d.y;
  float cosA = dot(dir, vC.xyz);
  float lat = asin(clamp(dir.y, -1.0, 1.0)) * 57.29578;
  float az = atan(dir.z, dir.x) * 57.29578;
  float fwH = fwidth(h);
  float fwE = fwidth(dir.y);
  float fwC = fwidth(cosA);
  float fwLat = fwidth(lat / 15.0);
  float fwAz = fwidth(az / 30.0);
  float fwR = fwidth(r);
  float fwT = fwidth(vT * 4.0);
  vec3 n = normalize(cross(dFdx(vRel), dFdy(vRel)));
  // Across and up a view frustum, as tangents off its axis.
  vec3 fa = normalize(abs(vC.y) < 0.9 ? cross(vC.xyz, vec3(0.0, 1.0, 0.0)) : cross(vC.xyz, vec3(1.0, 0.0, 0.0)));
  vec3 fb = cross(vC.xyz, fa);
  float fz = max(cosA, 1e-4);
  float fx = dot(dir, fa) / fz;
  float fy = dot(dir, fb) / fz;
  float fwX = fwidth(fx);
  float fwY = fwidth(fy);
  bool frustum = vC.w < -2.5;

  if (h < vD.x || h > vD.y) discard;
  if (dir.y < vD.z - 1e-4 || dir.y > vD.w + 1e-4) discard;
  if (vC.w > -1.5 && !side && cosA < vC.w) discard;
  if (frustum && !side && (cosA <= 0.0 || abs(fx) > vF.z || abs(fy) > vF.w)) discard;

  float edge = 0.0;
  if (vD.x > -1e8) edge = max(edge, edgeAA(h - vD.x, fwH));
  if (vD.y < 1e8) edge = max(edge, edgeAA(vD.y - h, fwH));
  if (vD.z > -0.999) edge = max(edge, edgeAA(dir.y - vD.z, fwE));
  if (vD.w < 0.999) edge = max(edge, edgeAA(vD.w - dir.y, fwE));
  if (vC.w > -1.5 && !side) edge = max(edge, edgeAA(cosA - vC.w, fwC));
  if (frustum && !side) edge = max(edge, max(edgeAA(vF.z - abs(fx), fwX), edgeAA(vF.w - abs(fy), fwY)));

  float seen = 1.0;
  if (uStyle.z > 0.5 && vE.y > -0.5) {
    seen = viewSeen(int(vE.y + 0.5), vRel);
    if (seen < 0.0) discard;
  }

  int band = int(vE.x + 0.5);
  float lines;
  if (!side) lines = max(lineAA(lat / 15.0, fwLat), lineAA(az / 30.0, fwAz));
  else {
    lines = lineAA(vT * 4.0, fwT);
    if (vF.x > 0.0) lines = max(lines, edgeAA(abs(r - vF.x), fwR));
    if (vF.y > 0.0) lines = max(lines, edgeAA(abs(r - vF.y), fwR));
  }
  float pattern = band == 2 ? 1.0 : band == 1 ? step(0.45, fract((az + lat) / 6.0)) : step(0.7, fract((az + lat) / 2.5));
  lines *= pattern;
  vec3 col = band == 2 ? vB.rgb : band == 1 ? mix(vB.rgb, vec3(1.0), 0.25) : mix(vB.rgb, vec3(0.6), 0.5);
  float rim = pow(1.0 - abs(dot(n, normalize(uCam.xyz - vRel))), 3.0);
  float fill = band == 2 ? 0.035 : 0.05;
  // Where the line of sight cuts the shell: an edge as bright as a cut's.
  edge = max(edge, 1.0 - seen);
  float a = uCam.w * (uStyle.x * (fill + rim * 0.45) + uStyle.y * lines * 0.55 + edge * 0.9);
  if (a <= 0.002) discard;
  outColor = vec4(col, clamp(a, 0.0, 1.0));
}
`;

export const SHELL_WGSL = /* wgsl */ `
struct U {
  viewProj: mat4x4f,
  cam: vec4f,
  style: vec4f,
  views: array<vec4f, ${MAX_VIEWS * 6}>,
  faces: vec4f,
};
@group(0) @binding(0) var<uniform> u: U;
@group(0) @binding(1) var viewDepth: texture_depth_2d_array;
${VIEW_WGSL}

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
`;

/** The WGSL uniforms: the matrix, camera, style, the views' faces, the face size. */
export const SHELL_UNIFORM_BYTES = 64 + 16 + 16 + MAX_VIEWS * 6 * 16 + 16;
