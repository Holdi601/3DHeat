
struct SU {
  viewProj : mat4x4<f32>,
  view : vec4<f32>,   // viewport px w, h, style, mode
  opt : vec4<f32>,    // heading ticks, sign of the size
  cam : vec4<f32>,
  sides : array<vec4<f32>, 16>,
};
@group(0) @binding(0) var<uniform> u : SU;
@group(0) @binding(1) var atlas : texture_2d<f32>;
@group(0) @binding(2) var samp : sampler;

struct GOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) uv : vec2<f32>,
  @location(1) @interpolate(flat) cells : vec2<i32>,
  @location(2) @interpolate(flat) fill : vec4<f32>,
  @location(3) @interpolate(flat) line : vec4<f32>,
  @location(4) @interpolate(flat) glow : vec4<f32>,
  @location(5) @interpolate(flat) halo : vec4<f32>,
  @location(6) @interpolate(flat) tick : vec4<f32>,
};
fn effectCell(dom : u32, cls : u32) -> i32 {
  if (dom == 5u) { return 125; }
  if (dom == 4u) { return select(126, 127, cls == 17u); }
  if (dom == 11u) { return 128; }
  if (dom == 12u) { return 129; }
  if (dom == 15u) { return 130; }
  if (dom == 13u) { return 131; }
  return 124;}
fn weaponColour(dom : u32, cls : u32) -> vec3<f32> {
  if (dom == 4u) { return vec3<f32>(0.42, 0.42, 0.4); }
  if (dom == 11u) { return vec3<f32>(1.0, 0.97, 0.85); }
  if (dom == 12u) { return vec3<f32>(0.82, 0.84, 0.87); }
  if (dom == 15u) { return vec3<f32>(0.6, 0.6, 0.6); }
  if (cls == 12u) { return vec3<f32>(0.85, 0.93, 1.0); }
  if (cls == 13u) { return vec3<f32>(1.0, 0.5, 0.3); }
  if (cls == 14u) { return vec3<f32>(1.0, 0.78, 0.32); }
  if (cls == 15u) { return vec3<f32>(0.55, 1.0, 0.62); }
  return vec3<f32>(0.95, 0.95, 0.95);}
fn glowColour(dom : u32) -> vec3<f32> {
  if (dom == 11u) { return vec3<f32>(1.6, 1.35, 0.85); }
  if (dom == 13u) { return vec3<f32>(1.4, 1.0, 0.45); }
  return vec3<f32>(1.5, 0.95, 0.45);}
fn frameDomain(dom : u32) -> u32 {
  if (dom >= 1u && dom <= 5u) { return 0u; }
  if (dom == 8u) { return 2u; }
  if (dom == 9u) { return 3u; }
  return 1u;}

@vertex
fn vsGlyph(@builtin(vertex_index) vi : u32, @location(4) origin : vec4<f32>, @location(5) forward : vec4<f32>, @location(6) upAxis : vec4<f32>, @location(7) team : vec4<f32>) -> GOut {
  var out : GOut;
  let corner = vi % 6u;
  let q = vec2<f32>(select(-1.0, 1.0, corner == 1u || corner == 2u || corner == 4u), select(-1.0, 1.0, corner == 2u || corner == 4u || corner == 5u));
  let px = origin.w * u.opt.y;
  let alpha = forward.w;
  let clip = u.viewProj * vec4<f32>(origin.xyz, 1.0);
  out.pos = vec4<f32>(2.0, 2.0, 2.0, 1.0);
  out.uv = vec2<f32>(0.0);
  out.cells = vec2<i32>(-1, -1);
  out.fill = vec4<f32>(0.0);
  out.line = vec4<f32>(0.0);
  out.glow = vec4<f32>(0.0);
  out.halo = vec4<f32>(0.0);
  out.tick = vec4<f32>(0.0);
  if (px <= 0.0 || alpha <= 0.002 || clip.w <= 0.0 || team.w > -999.5) { return out; }
  let word = u32(-team.w - 999.5);
  let cls = word & 255u;
  let tm = (word >> 8u) & 255u;
  let dom = (word >> 16u) & 15u;
  let moving = (word & 1048576u) != 0u;
  let style = i32(u.view.z);
  let symbol = u.view.w > 1.5;
  let k = 0.01 * distance(origin.xyz, u.cam.xyz) + 0.01;
  let clip2 = u.viewProj * vec4<f32>(origin.xyz + forward.xyz * k, 1.0);
  var dir = vec2<f32>(0.0);
  if (clip2.w > 0.0) { dir = (clip2.xy / clip2.w - clip.xy / clip.w) * u.view.xy; }
  let dl = length(dir);
  var head = vec2<f32>(0.0, 1.0);
  if (dl > 1e-4) { head = dir / dl; }
  let effect = dom >= 11u && dom != 14u;
  let weapon = dom >= 3u && dom <= 5u;
  let natoMissile = symbol && dom == 3u && style != 2;
  var turn = false;
  let side = u.sides[min(tm, 15u)];
  let dark = vec3<f32>(0.06);
  out.halo = vec4<f32>(0.97, 0.97, 0.95, 0.75);
  if (effect || (weapon && !natoMissile)) {
    out.cells = vec2<i32>(-1, effectCell(dom, cls));
    out.fill = vec4<f32>(weaponColour(dom, cls), 1.0);
    out.line = vec4<f32>(dark, 0.0);
    out.glow = vec4<f32>(glowColour(dom), select(0.0, 1.0, dom == 3u || dom == 5u || dom == 11u || dom == 13u));
    out.halo = select(vec4<f32>(0.05, 0.05, 0.05, 0.55), vec4<f32>(0.0), dom == 11u || dom == 12u);
    turn = dl > 1e-4;
  } else if (style == 1) {
    out.cells = vec2<i32>(-1, 62 + i32(cls));
    out.line = vec4<f32>(side.rgb, 0.0);
    turn = moving && dl > 1e-4;
  } else if (style == 2) {
    out.cells = vec2<i32>(-1, 108 + i32(dom));
    out.fill = vec4<f32>(abs(team.rgb), 1.0);
    out.line = vec4<f32>(dark, 0.0);
    out.halo = vec4<f32>(0.0, 0.0, 0.0, 0.45);
    out.tick = vec4<f32>(head, select(0.0, 1.0, moving), 1.0);
  } else {
    let aff = i32(side.a + 0.5);
    out.cells = vec2<i32>(0 + aff * 4 + i32(frameDomain(dom)), 16 + i32(cls));
    out.fill = vec4<f32>(side.rgb, 1.0);
    out.line = vec4<f32>(dark, select(0.0, 1.0 + f32(aff), style == 3));
    out.tick = vec4<f32>(head, select(0.0, 1.0, moving), 1.0);
  }
  if (u.opt.x < 0.5) { out.tick.z = 0.0; }
  // A wreck (`data/deaths.ts`): its fill greyed and the frame crossed out, as APP-6 and MIL-STD-2525 mark destroyed (tick.z -1).
  if ((word & 2097152u) != 0u && !effect && !weapon) {
    out.fill = vec4<f32>(mix(vec3<f32>(0.4), out.fill.rgb, 0.3), out.fill.a);
    out.tick.z = -1.0;
  }
  out.glow.a = out.glow.a * alpha;
  out.fill.a = out.fill.a * alpha;
  out.halo.a = out.halo.a * alpha;
  out.tick.w = alpha;
  var o = q * 1.5;
  if (turn) { let r = vec2<f32>(head.y, -head.x); o = r * o.x + head * o.y; }
  out.uv = q * 1.5;
  let ndc = o * px / u.view.xy;
  out.pos = vec4<f32>(clip.xy + ndc * clip.w, 0.0, clip.w);
  return out;
}

const ATLAS_W = 1024.0;
const ATLAS_H = 576.0;

fn cellAt(c : i32, uv : vec2<f32>) -> vec4<f32> {
  let org = vec2<f32>(f32(max(c, 0) % 16), f32(max(c, 0) / 16)) * 64.0;
  let p = org + (vec2<f32>(clamp(uv.x, -1.0, 1.0), -clamp(uv.y, -1.0, 1.0)) * 0.5 + 0.5) * 64.0;
  let s = textureSampleLevel(atlas, samp, p / vec2<f32>(ATLAS_W, ATLAS_H), 0.0);
  if (c < 0 || abs(uv.x) > 1.0 || abs(uv.y) > 1.0) { return vec4<f32>(0.0); }
  return s;
}

fn seg(p : vec2<f32>, a : vec2<f32>, b : vec2<f32>) -> f32 {
  let ab = b - a;
  let t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
  return length(p - a - ab * t);
}

@fragment
fn fsGlyph(in : GOut) -> @location(0) vec4<f32> {
  let s = max(cellAt(in.cells.x, in.uv), cellAt(in.cells.y, in.uv));
  var fill = s.r * in.fill.a;
  var line = s.g * in.tick.w;
  var halo = s.a;
  if (in.line.a > 0.5) {
    let aff = in.line.a - 1.0;
    var shade = 0.0;
    if (aff > 0.5 && aff < 1.5) { shade = 0.45; } else if (aff > 1.5 && aff < 2.5) { shade = step(0.5, fract((in.uv.x + in.uv.y) * 4.0)) * 0.9; } else if (aff < 0.5) { shade = step(length(fract(in.uv * 4.0) - 0.5), 0.18) * 0.9; }
    line = max(line, s.r * shade * in.tick.w);
    fill = s.r * 0.92 * in.fill.a;
  }
  let dd = seg(in.uv, in.tick.xy * 0.68, in.tick.xy * 1.42);
  let aa = fwidth(dd);
  if (in.tick.z > 0.5) {
    line = max(line, (1.0 - smoothstep(0.055 - aa, 0.055 + aa, dd)) * in.tick.w);
    halo = max(halo, 1.0 - smoothstep(0.13 - aa, 0.13 + aa, dd));
  }
  // Destroyed: an X across the frame.
  let dx = min(seg(in.uv, vec2<f32>(-0.82, -0.82), vec2<f32>(0.82, 0.82)), seg(in.uv, vec2<f32>(-0.82, 0.82), vec2<f32>(0.82, -0.82)));
  let ax = fwidth(dx);
  if (in.tick.z < -0.5) {
    line = max(line, (1.0 - smoothstep(0.07 - ax, 0.07 + ax, dx)) * in.tick.w);
    halo = max(halo, 1.0 - smoothstep(0.16 - ax, 0.16 + ax, dx));
  }
  var c = vec4<f32>(in.halo.rgb, 1.0) * halo * in.halo.a;
  c = c * (1.0 - fill) + vec4<f32>(in.fill.rgb, 1.0) * fill;
  c = c * (1.0 - line) + vec4<f32>(in.line.rgb, 1.0) * line;
  c = vec4<f32>(c.rgb + in.glow.rgb * s.b * in.glow.a, c.a);
  if (c.a <= 0.002 && dot(c.rgb, vec3<f32>(1.0)) <= 0.002) { discard; }
  return c;
}
