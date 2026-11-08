/**
 * The tactical display's screen pass: the composited picture redrawn as a
 * glowing telemetry display. Terrain turns into a dark monochrome in the
 * display's colour with topographic contours and a measurement grid on it
 * (both from the depth buffer: world height and ground position per pixel),
 * silhouettes get glowing edges, bright lines and figures bloom, and a faint
 * scan pattern, vignette and grain finish it.
 *
 * Both renderers run the same passes from the same uniform block:
 *
 * 1. `down`  - bright parts and depth edges into a smaller glow target;
 * 2. `blur`  - a separable 9-tap blur, across then down (skipped on low);
 * 3. `final` - everything above, into the canvas.
 *
 * Pure packing lives here so it can be tested; the shaders are below it.
 */

import type { FrameParams, PostDraw } from '../types';

/** vec4s in the uniform block: 10 shared, 1 per pass. */
export const POST_VEC4S = 11;
export const POST_FLOATS = POST_VEC4S * 4;
/** Bytes per pass's block, padded to WebGPU's dynamic-offset alignment. */
export const POST_BLOCK_BYTES = 256;

/** The glow target's size as a divisor of the canvas, by quality. */
export function glowDivisor(quality: PostDraw['quality']): number {
  return quality >= 2 ? 2 : 4;
}

/**
 * The shared block: the camera as a ray basis (so each pixel's world position
 * comes back from its depth without an inverse matrix), the look's weights.
 * `clear` is the scene pass's clear colour: sky pixels are told by depth, but
 * lines drawn over the sky keep their colour by swapping only the clear.
 */
export function packPostUniforms(
  params: Pick<FrameParams, 'view' | 'proj' | 'cameraPos' | 'perspective' | 'near' | 'far'>,
  post: PostDraw,
  width: number,
  height: number,
  clear: readonly [number, number, number],
  out: Float32Array,
): Float32Array {
  const v = params.view;
  const p = params.proj;
  // Column-major view: its rows are the camera axes in world space.
  const rx = v[0], ry = v[4], rz = v[8];
  const ux = v[1], uy = v[5], uz = v[9];
  const fx = -v[2], fy = -v[6], fz = -v[10];
  // Perspective: half the view's tangent; parallel: half its extent.
  const sx = 1 / (p[0] || 1);
  const sy = 1 / (p[5] || 1);
  out.fill(0);
  out.set([params.cameraPos[0], params.cameraPos[1], params.cameraPos[2], post.time], 0);
  out.set([rx * sx, ry * sx, rz * sx, Math.max(1e-6, post.contourSpacing)], 4);
  out.set([ux * sy, uy * sy, uz * sy, Math.max(1e-6, post.gridSpacing)], 8);
  out.set([fx, fy, fz, params.perspective ? 1 : 0], 12);
  out.set([1 / Math.max(1, width), 1 / Math.max(1, height), params.near, params.far], 16);
  out.set([post.bloom, post.edges, post.contours, post.grid], 20);
  out.set([post.scanlines, post.quality >= 2 ? post.chroma : 0, post.vignette, post.noise], 24);
  out.set([post.tint[0], post.tint[1], post.tint[2], post.terrain], 28);
  out.set([post.fogNear, Math.max(post.fogNear + 1e-3, post.fogFar), post.flash, post.quality], 32);
  out.set([clear[0], clear[1], clear[2], post.quality > 0 && post.bloom > 0 ? 1 : 0], 36);
  return out;
}

/** The per-pass vec4: 0 down (spread), 1 blur (texel step x, y). */
export function passVec(kind: 'down' | 'blur' | 'final', a = 0, b = 0): [number, number, number, number] {
  return [a, b, kind === 'down' ? 0 : kind === 'blur' ? 1 : 2, 0];
}

// ------------------------------------------------------------------ GLSL

const GLSL_HEAD = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform vec4 uP[${POST_VEC4S}];
uniform sampler2D uSrc;
uniform sampler2D uDepth;
uniform sampler2D uGlow;
float viewDistance(float d) {
  float n = uP[4].z;
  float f = uP[4].w;
  if (uP[3].w > 0.5) {
    float ndc = d * 2.0 - 1.0;
    return (2.0 * n * f) / max(1e-6, f + n - ndc * (f - n));
  }
  return mix(n, f, d);
}
// Inverse distance: affine across a plane on screen, so its Laplacian finds creases and silhouettes, not slopes.
float invDist(vec2 uv) {
  float d = texture(uDepth, uv).r;
  return d >= 0.999999 ? 0.0 : 1.0 / max(1e-6, viewDistance(d));
}
float edgeAt(vec2 uv, vec2 t) {
  float w0 = invDist(uv);
  float wl = invDist(uv - vec2(t.x, 0.0));
  float wr = invDist(uv + vec2(t.x, 0.0));
  float wd = invDist(uv - vec2(0.0, t.y));
  float wu = invDist(uv + vec2(0.0, t.y));
  float m = max(max(max(w0, wl), max(wr, wd)), wu);
  float e = (abs(wl + wr - 2.0 * w0) + abs(wd + wu - 2.0 * w0)) / max(m, 1e-9);
  return smoothstep(0.08, 0.35, e);
}
`;

export const POST_DOWN_FS = `${GLSL_HEAD}
void main() {
  vec2 t = uP[4].xy;
  vec2 s = t * uP[10].x;
  vec3 c = 0.25 * (texture(uSrc, vUv + vec2(-s.x, -s.y) * 0.5).rgb + texture(uSrc, vUv + vec2(s.x, -s.y) * 0.5).rgb
    + texture(uSrc, vUv + vec2(-s.x, s.y) * 0.5).rgb + texture(uSrc, vUv + vec2(s.x, s.y) * 0.5).rgb);
  float l = max(c.r, max(c.g, c.b));
  vec3 g = c * smoothstep(0.42, 0.95, l);
  g += uP[7].rgb * edgeAt(vUv, t * 1.5) * uP[5].y * 0.7;
  outColor = vec4(g, 1.0);
}
`;

export const POST_BLUR_FS = `${GLSL_HEAD}
void main() {
  vec2 d = uP[10].xy;
  vec3 c = texture(uSrc, vUv).rgb * 0.227027;
  c += (texture(uSrc, vUv + d * 1.384615).rgb + texture(uSrc, vUv - d * 1.384615).rgb) * 0.316216;
  c += (texture(uSrc, vUv + d * 3.230769).rgb + texture(uSrc, vUv - d * 3.230769).rgb) * 0.070270;
  outColor = vec4(c, 1.0);
}
`;

const GLSL_FINAL_BODY = `
vec3 background(vec3 r) {
  float y = abs(r.y);
  vec3 c = mix(vec3(0.020, 0.050, 0.066), vec3(0.006, 0.011, 0.020), smoothstep(0.0, 0.55, y));
  return c + uP[7].rgb * exp(-y * 70.0) * 0.12;
}
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}
float gridLine(vec2 g) {
  vec2 fw = max(fwidth(g), vec2(1e-6));
  vec2 d = abs(fract(g - 0.5) - 0.5) / fw;
  float l = 1.0 - min(min(d.x, d.y), 1.0);
  return l * (1.0 - smoothstep(0.12, 0.45, max(fw.x, fw.y)));
}
float levelLine(float h, float width) {
  float fw = max(fwidth(h), 1e-6);
  float l = 1.0 - smoothstep(0.0, width, abs(fract(h - 0.5) - 0.5) / fw);
  return l * (1.0 - smoothstep(0.15, 0.45, fw));
}
void main() {
  vec2 uv = vUv;
  vec2 dc = uv - 0.5;
  vec2 t = uP[4].xy;
  vec3 col;
  float ca = uP[6].y * 0.006;
  if (ca > 0.0) {
    vec2 o = dc * ca;
    col = vec3(texture(uSrc, uv + o).r, texture(uSrc, uv).g, texture(uSrc, uv - o).b);
  } else {
    col = texture(uSrc, uv).rgb;
  }
  float dep = texture(uDepth, uv).r;
  bool sky = dep >= 0.999999;
  float z = sky ? uP[4].w : viewDistance(dep);
  vec2 ndc = uv * 2.0 - 1.0;
  vec3 ray;
  vec3 world;
  if (uP[3].w > 0.5) {
    ray = normalize(uP[3].xyz + ndc.x * uP[1].xyz + ndc.y * uP[2].xyz);
    world = uP[0].xyz + ray * (z / max(1e-4, dot(ray, uP[3].xyz)));
  } else {
    ray = uP[3].xyz;
    world = uP[0].xyz + ndc.x * uP[1].xyz + ndc.y * uP[2].xyz + ray * z;
  }
  // Far off the depth buffer cannot place a pixel to within a line's spacing; the lines fade before they turn to noise.
  float err = z * z / max(uP[4].z * 4194304.0, 1e-9);
  float cl = levelLine(world.y / uP[1].w, 1.0) * (1.0 - smoothstep(0.1, 0.4, err / uP[1].w));
  float ci = levelLine(world.y / (uP[1].w * 5.0), 1.6) * (1.0 - smoothstep(0.1, 0.4, err / (uP[1].w * 5.0)));
  float gl = gridLine(world.xz / uP[2].w) * (1.0 - smoothstep(0.1, 0.4, err / uP[2].w));
  float gm = gridLine(world.xz / (uP[2].w * 10.0)) * (1.0 - smoothstep(0.1, 0.4, err / (uP[2].w * 10.0)));
  vec3 bg = background(ray);
  vec3 tint = uP[7].rgb;
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  float mask = sky ? 0.0 : 1.0 - smoothstep(0.30, 0.62, luma);
  float fog = sky ? 0.0 : smoothstep(uP[8].x, uP[8].y, z);
  vec3 c = mix(col, (luma * 1.3 + 0.015) * tint, mask * uP[7].w);
  float near = mask * (1.0 - fog);
  c += tint * (cl * 0.35 + ci * 0.7) * uP[5].z * near;
  c += tint * (gl * 0.18 + gm * 0.4) * uP[5].w * near;
  c = mix(c, bg, fog * (0.35 + 0.65 * mask));
  if (sky) c = max(col - uP[9].rgb, vec3(0.0)) + bg;
  float e = edgeAt(uv, t);
  vec3 ec = tint;
  if (uP[8].w > 1.5) {
    // The nearer side's own colour, so a figure's outline glows in its team's.
    vec3 a = texture(uSrc, uv + vec2(t.x, 0.0)).rgb;
    vec3 b = texture(uSrc, uv - vec2(t.x, 0.0)).rgb;
    vec3 n = invDist(uv + vec2(t.x, 0.0)) > invDist(uv - vec2(t.x, 0.0)) ? a : b;
    float nl = max(n.r, max(n.g, n.b));
    ec = nl > 0.35 ? mix(tint, n / nl, 0.75) : tint;
  }
  c += ec * e * uP[5].y * (1.0 - fog * 0.7);
  if (uP[9].w > 0.5) c += texture(uGlow, uv).rgb * uP[5].x;
  float sl = 0.5 + 0.5 * sin(gl_FragCoord.y * 2.0944);
  c *= 1.0 - uP[6].x * 0.2 * sl;
  float band = fract(uv.y * 0.6 - uP[0].w * 0.045) - 0.5;
  c += tint * exp(-band * band * 1600.0) * uP[6].x * 0.05;
  c *= 1.0 - uP[6].z * smoothstep(0.38, 0.95, length(dc * vec2(1.0, 0.8)) * 1.3);
  c += (hash(gl_FragCoord.xy + fract(uP[0].w) * 91.7) - 0.5) * uP[6].w * 0.035;
  float fl = uP[8].z;
  float sweep = uv.y - (1.0 - fl);
  c += tint * (fl * 0.18 + exp(-sweep * sweep * 4000.0) * fl * 0.8);
  outColor = vec4(c, 1.0);
}
`;

export const POST_FINAL_FS = `${GLSL_HEAD}${GLSL_FINAL_BODY}`;

// ------------------------------------------------------------------ WGSL

const WGSL_HEAD = /* wgsl */ `
struct FsOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) uv : vec2<f32>,
};
@vertex
fn vsPost(@builtin(vertex_index) vid : u32) -> FsOut {
  var out : FsOut;
  let p = vec2<f32>(f32((vid & 1u) << 1u), f32(vid & 2u));
  out.uv = vec2<f32>(p.x, 1.0 - p.y);
  out.pos = vec4<f32>(p * 2.0 - 1.0, 0.0, 1.0);
  return out;
}
struct PostUniforms { p : array<vec4<f32>, ${POST_VEC4S}>, };
@group(0) @binding(0) var<uniform> u : PostUniforms;
@group(0) @binding(1) var srcTex : texture_2d<f32>;
@group(0) @binding(2) var depthTex : texture_depth_2d;
@group(0) @binding(3) var glowTex : texture_2d<f32>;
@group(0) @binding(4) var samp : sampler;

fn viewDistance(d : f32) -> f32 {
  let n = u.p[4].z;
  let f = u.p[4].w;
  if (u.p[3].w > 0.5) {
    return (n * f) / max(1e-6, f - d * (f - n));
  }
  return mix(n, f, d);
}
fn depthAt(uv : vec2<f32>) -> f32 {
  let size = vec2<i32>(textureDimensions(depthTex));
  let px = clamp(vec2<i32>(uv * vec2<f32>(size)), vec2<i32>(0), size - vec2<i32>(1));
  return textureLoad(depthTex, px, 0);
}
fn invDist(uv : vec2<f32>) -> f32 {
  let d = depthAt(uv);
  if (d >= 0.999999) { return 0.0; }
  return 1.0 / max(1e-6, viewDistance(d));
}
fn edgeAt(uv : vec2<f32>, t : vec2<f32>) -> f32 {
  let w0 = invDist(uv);
  let wl = invDist(uv - vec2<f32>(t.x, 0.0));
  let wr = invDist(uv + vec2<f32>(t.x, 0.0));
  let wd = invDist(uv - vec2<f32>(0.0, t.y));
  let wu = invDist(uv + vec2<f32>(0.0, t.y));
  let m = max(max(max(w0, wl), max(wr, wd)), wu);
  let e = (abs(wl + wr - 2.0 * w0) + abs(wd + wu - 2.0 * w0)) / max(m, 1e-9);
  return smoothstep(0.08, 0.35, e);
}
`;

export const POST_WGSL = /* wgsl */ `${WGSL_HEAD}
@fragment
fn fsDown(in : FsOut) -> @location(0) vec4<f32> {
  let t = u.p[4].xy;
  let s = t * u.p[10].x * 0.5;
  let c = 0.25 * (textureSample(srcTex, samp, in.uv + vec2<f32>(-s.x, -s.y)).rgb + textureSample(srcTex, samp, in.uv + vec2<f32>(s.x, -s.y)).rgb
    + textureSample(srcTex, samp, in.uv + vec2<f32>(-s.x, s.y)).rgb + textureSample(srcTex, samp, in.uv + vec2<f32>(s.x, s.y)).rgb);
  let l = max(c.r, max(c.g, c.b));
  var g = c * smoothstep(0.42, 0.95, l);
  g += u.p[7].rgb * edgeAt(in.uv, t * 1.5) * u.p[5].y * 0.7;
  return vec4<f32>(g, 1.0);
}

@fragment
fn fsBlur(in : FsOut) -> @location(0) vec4<f32> {
  let d = u.p[10].xy;
  var c = textureSample(srcTex, samp, in.uv).rgb * 0.227027;
  c += (textureSample(srcTex, samp, in.uv + d * 1.384615).rgb + textureSample(srcTex, samp, in.uv - d * 1.384615).rgb) * 0.316216;
  c += (textureSample(srcTex, samp, in.uv + d * 3.230769).rgb + textureSample(srcTex, samp, in.uv - d * 3.230769).rgb) * 0.070270;
  return vec4<f32>(c, 1.0);
}

fn background(r : vec3<f32>) -> vec3<f32> {
  let y = abs(r.y);
  let c = mix(vec3<f32>(0.020, 0.050, 0.066), vec3<f32>(0.006, 0.011, 0.020), smoothstep(0.0, 0.55, y));
  return c + u.p[7].rgb * exp(-y * 70.0) * 0.12;
}
fn hash(p : vec2<f32>) -> f32 {
  return fract(sin(dot(p, vec2<f32>(12.9898, 78.233))) * 43758.5453);
}
fn gridLine(g : vec2<f32>) -> f32 {
  let fw = max(fwidth(g), vec2<f32>(1e-6));
  let d = abs(fract(g - 0.5) - 0.5) / fw;
  let l = 1.0 - min(min(d.x, d.y), 1.0);
  return l * (1.0 - smoothstep(0.12, 0.45, max(fw.x, fw.y)));
}
fn levelLine(h : f32, width : f32) -> f32 {
  let fw = max(fwidth(h), 1e-6);
  let l = 1.0 - smoothstep(0.0, width, abs(fract(h - 0.5) - 0.5) / fw);
  return l * (1.0 - smoothstep(0.15, 0.45, fw));
}

@fragment
fn fsFinal(in : FsOut) -> @location(0) vec4<f32> {
  let uv = in.uv;
  let dc = uv - 0.5;
  let t = u.p[4].xy;
  let ca = u.p[6].y * 0.006;
  let o = dc * ca;
  let base = textureSample(srcTex, samp, uv).rgb;
  var col = base;
  if (ca > 0.0) {
    col = vec3<f32>(textureSample(srcTex, samp, uv + o).r, base.g, textureSample(srcTex, samp, uv - o).b);
  }
  let dep = depthAt(uv);
  let sky = dep >= 0.999999;
  var z = u.p[4].w;
  if (!sky) { z = viewDistance(dep); }
  // The shader's uv runs top down; the camera basis wants y up.
  let ndc = vec2<f32>(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0);
  var ray = u.p[3].xyz;
  var world = u.p[0].xyz + ndc.x * u.p[1].xyz + ndc.y * u.p[2].xyz + ray * z;
  if (u.p[3].w > 0.5) {
    ray = normalize(u.p[3].xyz + ndc.x * u.p[1].xyz + ndc.y * u.p[2].xyz);
    world = u.p[0].xyz + ray * (z / max(1e-4, dot(ray, u.p[3].xyz)));
  }
  let err = z * z / max(u.p[4].z * 4194304.0, 1e-9);
  let cl = levelLine(world.y / u.p[1].w, 1.0) * (1.0 - smoothstep(0.1, 0.4, err / u.p[1].w));
  let ci = levelLine(world.y / (u.p[1].w * 5.0), 1.6) * (1.0 - smoothstep(0.1, 0.4, err / (u.p[1].w * 5.0)));
  let gl = gridLine(world.xz / u.p[2].w) * (1.0 - smoothstep(0.1, 0.4, err / u.p[2].w));
  let gm = gridLine(world.xz / (u.p[2].w * 10.0)) * (1.0 - smoothstep(0.1, 0.4, err / (u.p[2].w * 10.0)));
  let glow = textureSample(glowTex, samp, uv).rgb;
  let bg = background(ray);
  let tint = u.p[7].rgb;
  let luma = dot(col, vec3<f32>(0.299, 0.587, 0.114));
  var mask = 1.0 - smoothstep(0.30, 0.62, luma);
  var fog = smoothstep(u.p[8].x, u.p[8].y, z);
  if (sky) { mask = 0.0; fog = 0.0; }
  var c = mix(col, (luma * 1.3 + 0.015) * tint, mask * u.p[7].w);
  let nearK = mask * (1.0 - fog);
  c += tint * (cl * 0.35 + ci * 0.7) * u.p[5].z * nearK;
  c += tint * (gl * 0.18 + gm * 0.4) * u.p[5].w * nearK;
  c = mix(c, bg, fog * (0.35 + 0.65 * mask));
  if (sky) { c = max(col - u.p[9].rgb, vec3<f32>(0.0)) + bg; }
  let e = edgeAt(uv, t);
  var ec = tint;
  if (u.p[8].w > 1.5) {
    let a = textureSample(srcTex, samp, uv + vec2<f32>(t.x, 0.0)).rgb;
    let b = textureSample(srcTex, samp, uv - vec2<f32>(t.x, 0.0)).rgb;
    var n = b;
    if (invDist(uv + vec2<f32>(t.x, 0.0)) > invDist(uv - vec2<f32>(t.x, 0.0))) { n = a; }
    let nl = max(n.r, max(n.g, n.b));
    if (nl > 0.35) { ec = mix(tint, n / nl, 0.75); }
  }
  c += ec * e * u.p[5].y * (1.0 - fog * 0.7);
  if (u.p[9].w > 0.5) { c += glow * u.p[5].x; }
  let sl = 0.5 + 0.5 * sin(in.pos.y * 2.0944);
  c *= 1.0 - u.p[6].x * 0.2 * sl;
  let band = fract((1.0 - uv.y) * 0.6 - u.p[0].w * 0.045) - 0.5;
  c += tint * exp(-band * band * 1600.0) * u.p[6].x * 0.05;
  c *= 1.0 - u.p[6].z * smoothstep(0.38, 0.95, length(dc * vec2<f32>(1.0, 0.8)) * 1.3);
  c += (hash(in.pos.xy + fract(u.p[0].w) * 91.7) - 0.5) * u.p[6].w * 0.035;
  let fl = u.p[8].z;
  let sweep = (1.0 - uv.y) - (1.0 - fl);
  c += tint * (fl * 0.18 + exp(-sweep * sweep * 4000.0) * fl * 0.8);
  return vec4<f32>(c, 1.0);
}
`;
