/**
 * The GPU tracks for WebGL2, which has no compute: the place shader
 * (`shader.ts`) as a vertex shader run once a track, its output caught by
 * transform feedback - one instance a track, in track order, read back by the
 * dart draw as instance attributes. The tracks and keys are integer textures.
 *
 * Without compute there is no sorting units into one run a mesh, so here every
 * unit small on screen is a dart (scale 0 otherwise: nothing drawn); the few
 * big enough to be figures are placed on the CPU (`near.ts`) and drawn with
 * the figure batches. Same curve, same culling, same sizes as on WebGPU.
 *
 * Output instance: origin + scale (0: not drawn as a dart), forward + alpha,
 * up + weapon speed (-1: no streak), team colour.
 */

import { CHUNK_SHIFT } from './store';

/**
 * Keys from their span (`store.ts`: the chunk's, else the track's), times
 * from the playhead: uCam.w, the playhead as a float, and uTLo, what that
 * leaves out (2 ms at five hours, half a metre at 250 m/s).
 */
const SPAN_GLSL = `uniform float uTLo;
// The track's first texel, its first key, its chunk spans' first texel (0: none): set before its keys are read.
int spanTrack;
int spanFirst;
int spanChunks;
// Key j's span: origin xyz + position step, then first time + time step, two texels.
int spanOf(int j) { return spanChunks == 0 ? spanTrack + 2 : spanChunks + ((j - spanFirst) >> ${CHUNK_SHIFT}) * 2; }
float timeAt(int j) {
  uvec4 b = texelFetch(uTracks, at(spanOf(j) + 1), 0);
  return (uintBitsToFloat(b.x) - uCam.w) + float(texelFetch(uKeysA, at(j), 0).y >> 16u) * uintBitsToFloat(b.y) - uTLo;
}
vec4 keyAt(int j) {
  int o = spanOf(j);
  uvec4 a = texelFetch(uTracks, at(o), 0);
  uvec4 b = texelFetch(uTracks, at(o + 1), 0);
  uvec2 k = texelFetch(uKeysA, at(j), 0).xy;
  float t = (uintBitsToFloat(b.x) - uCam.w) + float(k.y >> 16u) * uintBitsToFloat(b.y) - uTLo;
  return vec4(vec3(uintBitsToFloat(a.x), uintBitsToFloat(a.y), uintBitsToFloat(a.z)) + vec3(float(k.x & 0xffffu), float(k.x >> 16u), float(k.y & 0xffffu)) * uintBitsToFloat(a.w), t);
}`;

export const EVAL_GLSL_VS = `#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
uniform usampler2D uTracks;   // RGBA32UI, four texels a track
uniform usampler2D uKeysA;    // RG32UI
uniform usampler2D uKeysB;    // R32UI
uniform usampler2D uVis;      // R32UI, a bit a track
uniform int uW;               // the textures' width
uniform mat4 uViewProj;
uniform vec4 uCam;            // camera xyz, playhead t
uniform vec4 uPx;             // focal px (0: orthographic), px size when orthographic, min px, stale s
uniform vec4 uLod;            // units a metre, scale at true size, full figure from px, figure (not dart) from px
uniform vec4 uOpt;            // weapon streak s (<0: weapons hidden), 1 when every track is shown
out vec4 oOrigin;
out vec4 oForward;
out vec4 oUp;
out vec4 oTeam;

ivec2 at(int n) { return ivec2(n % uW, n / uW); }
uvec4 trackTexel(int i, int k) { return texelFetch(uTracks, at(i * 4 + k), 0); }
${SPAN_GLSL}
vec4 unpackQ(uint v) {
  ivec4 b = ivec4(int(v << 24u) >> 24, int(v << 16u) >> 24, int(v << 8u) >> 24, int(v) >> 24);
  return vec4(b) / 127.0;
}
vec3 rot(vec4 q, vec3 v) {
  vec3 t = 2.0 * cross(q.xyz, v);
  return v + q.w * t + cross(q.xyz, t);
}
vec3 vel(int j, int first, int last) {
  vec4 o = keyAt(j);
  if (j > first && j < last) {
    vec4 p = keyAt(j - 1);
    vec4 n = keyAt(j + 1);
    float h0 = o.w - p.w;
    float h1 = n.w - o.w;
    return ((o.xyz - p.xyz) / h0) * (h1 / (h0 + h1)) + ((n.xyz - o.xyz) / h1) * (h0 / (h0 + h1));
  }
  if (j < last) { vec4 n = keyAt(j + 1); return (n.xyz - o.xyz) / (n.w - o.w); }
  if (j > first) { vec4 p = keyAt(j - 1); return (o.xyz - p.xyz) / (o.w - p.w); }
  return vec3(0.0);
}
float noseWeight(float v) {
  if (v <= 25.0) return 0.0;
  if (v >= 40.0) return 1.0;
  float x = (v - 25.0) / 15.0;
  return x * x * (3.0 - 2.0 * x);
}
vec3 turnTowards(vec3 a, vec3 d, float w) {
  float c = clamp(dot(a, d), -1.0, 1.0);
  float th = acos(c);
  float k0 = 1.0 - w;
  float k1 = w;
  if (th > 1e-4) {
    float sn = sin(th);
    if (sn > 1e-6) { k0 = sin((1.0 - w) * th) / sn; k1 = sin(w * th) / sn; }
  }
  vec3 r = a * k0 + d * k1;
  float l = length(r);
  return l < 1e-12 ? a : r / l;
}
vec3 squareUp(vec3 f, vec3 u0) {
  vec3 r = u0 - f * dot(u0, f);
  float l = length(r);
  if (l < 1e-4) { r = vec3(0.0, 1.0, 0.0) - f * f.y; l = max(length(r), 1e-12); }
  return r / l;
}

void main() {
  int i = gl_VertexID;
  oOrigin = vec4(0.0);
  oForward = vec4(1.0, 0.0, 0.0, 1.0);
  oUp = vec4(0.0, 1.0, 0.0, -1.0);
  oTeam = vec4(0.0);
  uvec4 t0 = trackTexel(i, 0);
  uvec4 t1 = trackTexel(i, 1);
  uvec4 t3 = trackTexel(i, 3);
  int first = int(t0.x);
  int count = int(t0.y);
  uint flags = t1.y;
  // Times are from the playhead.
  float t = 0.0;
  if (count == 0) return;
  if (uOpt.y < 0.5) {
    uint word = texelFetch(uVis, at(i >> 5), 0).x;
    if (((word >> uint(i & 31)) & 1u) == 0u) return;
  }
  bool weapon = (flags & 4u) != 0u;
  if (weapon && uOpt.x < 0.0) return;
  spanTrack = i * 4;
  spanFirst = first;
  spanChunks = int(t1.w) / 4;
  if (timeAt(first) > t) return;
  int last = first + count - 1;
  int lo = first;
  int hi = last + 1;
  for (int it = 0; it < 32; it++) {
    if (hi - lo <= 1) break;
    int mid = (lo + hi) >> 1;
    if (timeAt(mid) <= t) lo = mid; else hi = mid;
  }
  int k = lo;
  vec4 A0 = keyAt(k);
  vec3 P;
  vec3 V;
  float sP = 0.0;
  int kb = k;
  if (k == last) {
    float hold = uintBitsToFloat(t3.z);
    if (hold < 1e8 && t - A0.w > (hold > 0.5 ? min(uPx.w, hold - 1.0) : uPx.w)) return;
    P = A0.xyz;
    V = vel(k, first, last);
  } else {
    kb = k + 1;
    vec4 A1 = keyAt(k + 1);
    float h = A1.w - A0.w;
    float s = clamp((t - A0.w) / h, 0.0, 1.0);
    sP = s;
    vec3 va = vel(k, first, last);
    vec3 vb = vel(k + 1, first, last);
    vec3 C = A1.xyz - A0.xyz;
    float cap = 1.5 * length(C);
    float m0 = length(va) * h;
    float m1 = length(vb) * h;
    m0 = m0 > cap ? (cap / m0) * h : h;
    m1 = m1 > cap ? (cap / m1) * h : h;
    float s2 = s * s;
    float s3 = s2 * s;
    // From A0 (h00 = 1 - h01): no sum of two big coordinates.
    P = A0.xyz + ((s3 - 2.0 * s2 + s) * va * m0 + (-2.0 * s3 + 3.0 * s2) * C + (s3 - s2) * vb * m1);
    V = ((6.0 * s2 - 6.0 * s) * -C + (3.0 * s2 - 4.0 * s + 1.0) * va * m0 + (3.0 * s2 - 2.0 * s) * vb * m1) / h;
  }
  float speed = length(V);
  vec3 f = vec3(1.0, 0.0, 0.0);
  vec3 up = vec3(0.0, 1.0, 0.0);
  if ((flags & 2u) != 0u) {
    vec4 qa = unpackQ(texelFetch(uKeysB, at(k), 0).x);
    vec4 qb = unpackQ(texelFetch(uKeysB, at(kb), 0).x);
    float d = dot(qa, qb);
    if (d < 0.0) { qb = -qb; d = -d; }
    float k0 = 1.0 - sP;
    float k1 = sP;
    if (d < 0.9995) {
      float th = acos(min(1.0, d));
      float sn = sin(th);
      k0 = sin((1.0 - sP) * th) / sn;
      k1 = sin(sP * th) / sn;
    }
    vec4 q = normalize(qa * k0 + qb * k1);
    f = rot(q, vec3(1.0, 0.0, 0.0));
    up = rot(q, vec3(0.0, 1.0, 0.0));
    float w = noseWeight(speed / uLod.x);
    if (w > 0.0) { f = turnTowards(f, V / speed, w); up = squareUp(f, up); }
  } else if (speed > 0.2 * uLod.x) {
    f = V / speed;
    up = squareUp(f, vec3(0.0, 1.0, 0.0));
  }
  if ((flags & 1u) == 0u) {
    float l = length(f.xz);
    f = l > 1e-6 ? vec3(f.x / l, 0.0, f.z / l) : vec3(1.0, 0.0, 0.0);
    up = vec3(0.0, 1.0, 0.0);
  }
  uint c = t0.z;
  oTeam = vec4(float(c & 255u) / 255.0, float((c >> 8u) & 255u) / 255.0, float((c >> 16u) & 255u) / 255.0, -100.0);  // gun elevation: as built
  oForward = vec4(f, 1.0);
  oUp = vec4(up, weapon && uOpt.x > 0.0 ? speed : -1.0);
  oOrigin = vec4(P, 0.0);
  // Off screen: no dart (its streak may still show).
  vec4 clip = uViewProj * vec4(P, 1.0);
  if (clip.w <= 0.0) return;
  vec2 ndc = clip.xy / clip.w;
  if (abs(ndc.x) > 1.3 || abs(ndc.y) > 1.3) return;
  float pxSize = uPx.x > 0.0 ? distance(P, uCam.xyz) / uPx.x : uPx.y;
  float longest = uintBitsToFloat(t1.x);
  uint meshes = t0.w;
  float trueLen = longest * uLod.y / pxSize;
  // Big enough to be a figure: placed on the CPU.
  if (meshes != 0u && trueLen >= uLod.w) return;
  oOrigin.w = max(uLod.y, uPx.z * pxSize);
}
`;

/** The transform feedback pass draws nothing. */
export const EVAL_GLSL_FS = `#version 300 es
precision highp float;
out vec4 o;
void main() { o = vec4(0.0); }
`;

/** A weapon's streak: from it back along its flight, fading, as two-vertex line instances. */
export const STREAK_GLSL_VS = `#version 300 es
precision highp float;
layout(location = 4) in vec4 iOrigin;
layout(location = 5) in vec4 iForward;
layout(location = 6) in vec4 iUp;
layout(location = 7) in vec4 iTeam;
uniform mat4 uViewProj;
uniform float uStreak;
out vec4 vColor;
out vec3 vWorld;
void main() {
  if (iUp.w < 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vColor = vec4(0.0); vWorld = vec3(0.0); return; }
  float back = gl_VertexID == 1 ? iUp.w * uStreak : 0.0;
  vec3 p = iOrigin.xyz - iForward.xyz * back;
  vColor = vec4(iTeam.rgb, gl_VertexID == 1 ? 0.0 : 0.9);
  vWorld = p;
  gl_Position = uViewProj * vec4(p, 1.0);
}
`;

/** Most trail segments a unit, as on WebGPU (`webgpu/tracks.ts`). */
export const TRAIL_SEGMENTS_GL = 48;

/**
 * Trails and drop lines, as the WebGPU place shader writes them (`shader.ts`):
 * one instance a track (its placed instance from the feedback buffer, so a
 * hidden, stale or not yet started unit draws nothing), two vertices a line.
 * Line n < 48 is the trail's n-th piece: from where the unit is (n = 0) or
 * its key k - n + 1 back to key k - n, kept while that key is no older than
 * the trail seconds, fading with age; the last line is the drop line, straight
 * down to the data's floor. Units off screen draw neither, as on WebGPU.
 */
export const TRAIL_GLSL_VS = `#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
layout(location = 4) in vec4 iOrigin;
layout(location = 7) in vec4 iTeam;
uniform usampler2D uTracks;
uniform usampler2D uKeysA;
uniform int uW;
uniform mat4 uViewProj;
uniform vec4 uCam;      // camera xyz, playhead t
uniform vec4 uTrail;    // trail seconds (0: none), 1 for drop lines, the floor's height, segments
out vec4 vColor;
out vec3 vWorld;

ivec2 at(int n) { return ivec2(n % uW, n / uW); }
${SPAN_GLSL}

void main() {
  gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  vColor = vec4(0.0);
  vWorld = vec3(0.0);
  // Placed this frame (the eval pass writes the gun elevation -100 only then), and on screen.
  if (iTeam.w > -99.0) return;
  vec3 P = iOrigin.xyz;
  vec4 clip = uViewProj * vec4(P, 1.0);
  if (clip.w <= 0.0) return;
  vec2 ndc = clip.xy / clip.w;
  if (abs(ndc.x) > 1.3 || abs(ndc.y) > 1.3) return;
  int n = gl_VertexID / 2;
  bool end = (gl_VertexID % 2) == 1;
  int segs = int(uTrail.w);
  vec3 p;
  float a;
  if (n == segs) {
    if (uTrail.y < 0.5 || P.y - uTrail.z < 1.0) return;
    p = end ? vec3(P.x, uTrail.z, P.z) : P;
    a = end ? 0.15 : 0.55;
  } else {
    float W = uTrail.x;
    if (W <= 0.0) return;
    int i = gl_InstanceID;
    uvec4 t0 = texelFetch(uTracks, at(i * 4), 0);
    uvec4 t1 = texelFetch(uTracks, at(i * 4 + 1), 0);
    int first = int(t0.x);
    int last = first + int(t0.y) - 1;
    spanTrack = i * 4;
    spanFirst = first;
    spanChunks = int(t1.w) / 4;
    float t = 0.0;
    int lo = first;
    int hi = last + 1;
    for (int it = 0; it < 32; it++) {
      if (hi - lo <= 1) break;
      int mid = (lo + hi) >> 1;
      if (timeAt(mid) <= t) lo = mid; else hi = mid;
    }
    int k = lo;
    if (n > 0 && (k - n < first || timeAt(k - n + 1) < t - W)) return;
    vec4 key = end ? keyAt(k - n) : (n == 0 ? vec4(P, t) : keyAt(k - n + 1));
    p = key.xyz;
    a = 0.8 * clamp(1.0 - (t - key.w) / W, 0.0, 1.0);
  }
  vColor = vec4(iTeam.rgb, a);
  vWorld = p;
  gl_Position = uViewProj * vec4(p, 1.0);
}
`;

/** Deaths: a small cross each (three lines), in its team's colour, fading with age, kept some pixels big. */
export const MARK_GLSL_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec4 aMark;     // x, y, z, time
layout(location = 1) in vec4 aColour;   // rgba8, normalised
uniform mat4 uViewProj;
uniform vec4 uCam;     // camera xyz, playhead t
uniform vec4 uMark;    // seconds shown, pixels across, focal px (0: orthographic), px size when orthographic
out vec4 vColor;
out vec3 vWorld;
void main() {
  float age = uCam.w - aMark.w;
  vWorld = aMark.xyz;
  if (age < 0.0 || age > uMark.x) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vColor = vec4(0.0); return; }
  float pxSize = uMark.z > 0.0 ? distance(aMark.xyz, uCam.xyz) / uMark.z : uMark.w;
  float r = 0.5 * uMark.y * pxSize;
  int seg = gl_VertexID / 2;
  float side = (gl_VertexID % 2) == 0 ? -1.0 : 1.0;
  vec3 axis = seg == 0 ? vec3(r, 0.0, r) : seg == 1 ? vec3(r, 0.0, -r) : vec3(0.0, 1.4 * r, 0.0);
  vec3 p = aMark.xyz + side * axis;
  vColor = vec4(aColour.rgb, 0.95 * clamp(1.0 - age / uMark.x, 0.3, 1.0));
  vWorld = p;
  gl_Position = uViewProj * vec4(p, 1.0);
}
`;
