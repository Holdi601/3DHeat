/**
 * The capture zones' discs (`objectives.ts`), drawn by both backends from
 * geometry made once: each vertex is a point of a zone's disc laid on the
 * ground, its zone's middle, which part of the disc it belongs to (the dark
 * rim, the owner's band, the capture band, the fill), how far round from
 * north it is, which zone, and the zone's radius. What changes while a
 * battle plays - each zone's owner, who is taking it and how far - is a few
 * bytes a zone in the uniforms (`ZONE_STATE_FLOATS`), so a capture under way
 * costs nothing but them.
 *
 * Far off, a zone is drawn at least `minPx` pixels across its radius (the
 * disc grown round its middle), as its letter is, so it reads at every zoom.
 * Over everything (`xray` above 0) only the bands are drawn, at that share
 * of their alpha: a zone behind a hill still shows.
 */

/** The most zones drawn at once; the rest are left out. */
export const MAX_ZONES = 32;
/** Floats a vertex: xyz, middle xyz, part, angle (0..1 from north), zone, radius. */
export const ZONE_VERTEX_FLOATS = 10;
/** Floats a zone's state: owner rgb and whether owned, capturer rgb and the capture (0..1). */
export const ZONE_STATE_FLOATS = 8;
/** The smallest a zone's radius is drawn, in pixels. */
export const ZONE_MIN_PX = 28;

/** The disc's parts, as `part`. */
export const ZONE_PART = { rim: 0, band: 1, capture: 2, fill: 3 } as const;

export const ZONE_GLSL_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aMid;
layout(location = 2) in vec4 aPart;
uniform mat4 uViewProj;
// Pixels a world unit at one unit's depth (proj[1][1] * height / 2), the smallest radius in pixels.
uniform vec2 uScale;
uniform vec4 uZones[${MAX_ZONES * 2}];
flat out float vPart;
flat out vec4 vOwner;
flat out vec4 vBy;
out float vAngle;
void main() {
  vec4 mid = uViewProj * vec4(aMid, 1.0);
  float px = aPart.w * uScale.x / max(mid.w, 1e-4);
  float k = max(1.0, uScale.y / max(px, 1e-6));
  vec3 p = vec3(aMid.x + (aPos.x - aMid.x) * k, aPos.y, aMid.z + (aPos.z - aMid.z) * k);
  int z = int(aPart.z + 0.5);
  vOwner = uZones[z * 2];
  vBy = uZones[z * 2 + 1];
  vPart = aPart.x;
  vAngle = aPart.y;
  gl_Position = uViewProj * vec4(p, 1.0);
}
`;

export const ZONE_GLSL_FS = `#version 300 es
precision highp float;
flat in float vPart;
flat in vec4 vOwner;
flat in vec4 vBy;
in float vAngle;
uniform float uXray;
layout(location = 0) out vec4 outColor;
void main() {
  int part = int(vPart + 0.5);
  vec3 dark = vec3(0.04, 0.05, 0.07);
  vec4 c;
  if (part == 0) c = vec4(dark, 0.6);
  else if (part == 1) c = vec4(vOwner.rgb, 0.9);
  else if (part == 2) c = vAngle < vBy.a ? vec4(vBy.rgb, 0.9) : vec4(dark, uXray > 0.0 ? 0.0 : 0.35);
  else c = vec4(vOwner.rgb, vOwner.a > 0.5 ? 0.25 : 0.16);
  if (uXray > 0.0) {
    if (part == 0 || part == 3) discard;
    c.a *= uXray;
  }
  if (c.a <= 0.0) discard;
  outColor = c;
}
`;

export const ZONE_WGSL = /* wgsl */ `
struct U {
  viewProj: mat4x4f,
  // x: pixels a world unit at one unit's depth, y: the smallest radius in pixels, z: xray.
  scale: vec4f,
  zones: array<vec4f, ${MAX_ZONES * 2}>,
};
@group(0) @binding(0) var<uniform> u: U;

struct V {
  @builtin(position) pos: vec4f,
  @location(0) @interpolate(flat) part: f32,
  @location(1) @interpolate(flat) owner: vec4f,
  @location(2) @interpolate(flat) by: vec4f,
  @location(3) angle: f32,
};

@vertex
fn vsZone(@location(0) pos: vec3f, @location(1) mid: vec3f, @location(2) part: vec4f) -> V {
  let m = u.viewProj * vec4f(mid, 1.0);
  let px = part.w * u.scale.x / max(m.w, 1e-4);
  let k = max(1.0, u.scale.y / max(px, 1e-6));
  let p = vec3f(mid.x + (pos.x - mid.x) * k, pos.y, mid.z + (pos.z - mid.z) * k);
  let z = u32(part.z + 0.5);
  var o: V;
  o.pos = u.viewProj * vec4f(p, 1.0);
  o.part = part.x;
  o.owner = u.zones[z * 2u];
  o.by = u.zones[z * 2u + 1u];
  o.angle = part.y;
  return o;
}

@fragment
fn fsZone(v: V) -> @location(0) vec4f {
  let part = u32(v.part + 0.5);
  let dark = vec3f(0.04, 0.05, 0.07);
  let xray = u.scale.z;
  var c: vec4f;
  if (part == 0u) {
    c = vec4f(dark, 0.6);
  } else if (part == 1u) {
    c = vec4f(v.owner.rgb, 0.9);
  } else if (part == 2u) {
    c = select(vec4f(dark, select(0.35, 0.0, xray > 0.0)), vec4f(v.by.rgb, 0.9), v.angle < v.by.a);
  } else {
    c = vec4f(v.owner.rgb, select(0.16, 0.25, v.owner.a > 0.5));
  }
  if (xray > 0.0) {
    if (part == 0u || part == 3u) {
      discard;
    }
    c.a = c.a * xray;
  }
  if (c.a <= 0.0) {
    discard;
  }
  return c;
}
`;

/** The uniforms of the WGSL: the matrix, the scale, the zones. */
export const ZONE_UNIFORM_BYTES = 64 + 16 + MAX_ZONES * 2 * 16;
