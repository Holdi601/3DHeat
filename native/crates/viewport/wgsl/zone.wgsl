
struct U {
  viewProj: mat4x4f,
  // x: pixels a world unit at one unit's depth, y: the smallest radius in pixels, z: xray.
  scale: vec4f,
  zones: array<vec4f, 64>,
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
