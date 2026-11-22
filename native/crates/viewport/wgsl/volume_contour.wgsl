

struct VolumeUniforms {
  cfg  : vec4<f32>,
  m    : array<vec4<f32>, 24>,
  info : array<vec4<f32>, 8>,
  poly : array<vec4<f32>, 32>,
};
@group(0) @binding(0) var<uniform> vol : VolumeUniforms;

fn volPoint(k : i32) -> vec2<f32> {
  let v = vol.poly[k >> 1u];
  if ((k & 1) == 0) { return v.xy; }
  return v.zw;
}

fn volHolds(i : i32, p : vec3<f32>) -> bool {
  let info = vol.info[i];
  let ph = vec4<f32>(p, 1.0);
  let uy = dot(vol.m[i * 3 + 1], ph);
  let code = i32(info.x + 0.5);
  if (code == 4) {
    if (abs(uy) > 1.0) { return false; }
    let start = i32(info.z + 0.5);
    let n = i32(info.w + 0.5);
    var inside = false;
    var b = volPoint(start + n - 1);
    for (var k = 0; k < n; k = k + 1) {
      let a = volPoint(start + k);
      if ((a.y > p.z) != (b.y > p.z) && p.x < (b.x - a.x) * (p.z - a.y) / (b.y - a.y) + a.x) { inside = !inside; }
      b = a;
    }
    return inside;
  }
  let ux = dot(vol.m[i * 3], ph);
  let uz = dot(vol.m[i * 3 + 2], ph);
  if (code == 1) { return abs(ux) <= 1.0 && abs(uy) <= 1.0 && abs(uz) <= 1.0; }
  if (code == 2) { return ux * ux + uy * uy + uz * uz <= 1.0; }
  return ux * ux + uz * uz <= 1.0 && abs(uy) <= 1.0;
}

fn volSelected(p : vec3<f32>) -> bool {
  let count = min(i32(vol.cfg.y + 0.5), 8);
  var inInclude = false;
  for (var i = 0; i < count; i = i + 1) {
    if (vol.info[i].y > 0.0) {
      if (!inInclude && volHolds(i, p)) { inInclude = true; }
    } else if (volHolds(i, p)) {
      return false;
    }
  }
  return vol.cfg.z < 0.5 || inInclude;
}

fn volKeep(p : vec3<f32>) -> bool {
  if (vol.cfg.x < 0.5) { return true; }
  let sel = volSelected(p);
  if (vol.cfg.x < 1.5) { return sel; }
  return !sel;
}

struct ContourUniforms {
  color : array<vec4<f32>, 8>,
  inv : mat4x4<f32>,
  // width, height, clear depth, 0
  view : vec4<f32>,
  // Where the canvas starts in the target, pixels (the native viewport draws into the window).
  origin : vec4<f32>,
};
@group(0) @binding(1) var<uniform> cu : ContourUniforms;
@group(0) @binding(2) var depthTex : texture_depth_2d;

struct VsOut {
  @builtin(position) pos : vec4<f32>,
};

@vertex
fn vsContour(@builtin(vertex_index) vid : u32) -> VsOut {
  var out : VsOut;
  let p = vec2<f32>(f32((vid & 1u) << 1u), f32(vid & 2u));
  out.pos = vec4<f32>(p * 2.0 - 1.0, 0.0, 1.0);
  return out;
}

fn volEdge(i : i32, p : vec3<f32>) -> f32 {
  let info = vol.info[i];
  let ph = vec4<f32>(p, 1.0);
  let ux = dot(vol.m[i * 3], ph);
  let uy = dot(vol.m[i * 3 + 1], ph);
  let uz = dot(vol.m[i * 3 + 2], ph);
  let code = i32(info.x + 0.5);
  if (code == 1) { return max(max(abs(ux), abs(uy)), abs(uz)) - 1.0; }
  if (code == 2) { return length(vec3<f32>(ux, uy, uz)) - 1.0; }
  if (code == 4) {
    let start = i32(info.z + 0.5);
    let n = i32(info.w + 0.5);
    var d = 1e30;
    var inside = false;
    var b = volPoint(start + n - 1);
    for (var k = 0; k < 64; k++) {
      if (k >= n) { break; }
      let a = volPoint(start + k);
      let e = b - a;
      let q = p.xz - a;
      let h = clamp(dot(q, e) / max(dot(e, e), 1e-12), 0.0, 1.0);
      d = min(d, length(q - e * h));
      if ((a.y > p.z) != (b.y > p.z) && p.x < (b.x - a.x) * (p.z - a.y) / (b.y - a.y) + a.x) { inside = !inside; }
      b = a;
    }
    let halfH = 1.0 / max(1e-9, length(vol.m[i * 3 + 1].xyz));
    return max(select(d, -d, inside), (abs(uy) - 1.0) * halfH);
  }
  return max(length(vec2<f32>(ux, uz)) - 1.0, abs(uy) - 1.0);
}

@fragment
fn fsContour(in : VsOut) -> @location(0) vec4<f32> {
  let fp = in.pos.xy - cu.origin.xy;
  let px = vec2<i32>(fp);
  let depth = textureLoad(depthTex, px, 0);
  let ndc = vec2<f32>(fp.x / cu.view.x * 2.0 - 1.0, 1.0 - fp.y / cu.view.y * 2.0);
  let w = cu.inv * vec4<f32>(ndc, depth, 1.0);
  let p = w.xyz / w.w;
  let count = i32(vol.cfg.y + 0.5);
  let width = max(0.5, vol.cfg.w);
  var col = vec4<f32>(0.0);
  var fs : array<f32, 8>;
  for (var i = 0; i < 8; i++) { fs[i] = select(1e3, volEdge(i, p), i < count); }
  for (var i = 0; i < 8; i++) {
    let f = fs[i];
    let fx = dpdx(f);
    let fy = dpdy(f);
    let fw = abs(fx) + abs(fy);
    let a = select(1.0 - smoothstep(0.5 * width, 0.5 * width + 1.0, abs(f) / max(fw, 1e-12)), 0.0, fw > 0.25);
    let c = cu.color[i];
    let alpha = select(0.0, a * c.a, i < count);
    if (alpha > col.a) { col = vec4<f32>(c.rgb, alpha); }
  }
  if (depth == cu.view.z) { col.a = 0.0; }
  return col;
}
