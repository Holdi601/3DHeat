
override FOUR: bool = false;
struct U {
  viewProj: mat4x4<f32>,
  ground: f32, scale: f32, kernelOn: f32, perspective: f32,
  radius: f32, minPx: f32, maxPx: f32, pxPerUnit: f32,
  centre: f32, edge: f32, falloff: f32, smoothRamp: f32,
  keepMass: f32, neutralL: f32, useCurve: f32, holeW: f32,
};
// hole: the cells (texel units, min / max) where rows draw instead, weighing u.holeW.
struct Inst { rect: vec4<f32>, uv: vec4<f32>, k: f32, layer: f32, cell: f32, reach: f32, hole: vec4<f32> };
@group(0) @binding(0) var<uniform> u: U;
@group(0) @binding(1) var<storage, read> inst: array<Inst>;
@group(0) @binding(2) var tiles: texture_2d_array<f32>;
// The ramp's curve as the rows' splat reads it (centre at 0, rim at the end), linear between entries.
@group(0) @binding(3) var<storage, read> curve: array<f32, 256>;
struct VOut {
  @builtin(position) pos: vec4<f32>,
  @location(0) uv: vec2<f32>,
  @location(1) @interpolate(flat) layer: i32,
  @location(2) @interpolate(flat) k: f32,
  @location(3) depth: f32,
  @location(4) @interpolate(flat) span: vec4<i32>,
  @location(5) @interpolate(flat) cell: f32,
  @location(6) @interpolate(flat) hole: vec4<f32>,
};
@vertex fn vs(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> VOut {
  var corners = array<vec2<f32>, 6>(vec2(0.0, 0.0), vec2(1.0, 0.0), vec2(0.0, 1.0), vec2(0.0, 1.0), vec2(1.0, 0.0), vec2(1.0, 1.0));
  let c = corners[vi];
  let t = inst[ii];
  // The quad grown by the sprite's reach; the texture coordinates run on past the tile's edge.
  let lo = t.rect.xy - vec2<f32>(t.reach);
  let hi = t.rect.zw + vec2<f32>(t.reach);
  let w = mix(lo, hi, c);
  let f = (w - t.rect.xy) / max(t.rect.zw - t.rect.xy, vec2<f32>(1e-20));
  var o: VOut;
  o.pos = u.viewProj * vec4<f32>(w.x, u.ground, w.y, 1.0);
  o.uv = mix(t.uv.xy, t.uv.zw, f);
  o.layer = i32(t.layer);
  o.k = t.k * u.scale;
  o.depth = o.pos.w;
  // The cells this draw owns: [span.xy, span.zw).
  let a = min(t.uv.xy, t.uv.zw) * 256.0;
  let b = max(t.uv.xy, t.uv.zw) * 256.0;
  o.span = vec4<i32>(vec2<i32>(round(a)), vec2<i32>(round(b)));
  o.cell = t.cell;
  o.hole = t.hole;
  return o;
}
fn cell(p: vec2<i32>, layer: i32, hole: vec4<f32>) -> vec4<f32> {
  let v = textureLoad(tiles, clamp(p, vec2<i32>(0), vec2<i32>(255)), layer, 0);
  let c = vec2<f32>(p) + 0.5;
  let w = select(1.0, u.holeW, all(c >= hole.xy) && all(c < hole.zw));
  if (FOUR) { return v * w; }
  return vec4<f32>(v.r * w, 0.0, 0.0, 0.0);
}
fn ramp(d: f32) -> f32 {
  var t: f32;
  if (u.useCurve > 0.5) {
    let f = clamp(d, 0.0, 1.0) * 255.0;
    let i = u32(floor(f));
    t = mix(curve[i], curve[min(i + 1u, 255u)], f - floor(f));
  } else {
    t = pow(1.0 - d, u.falloff);
    if (u.smoothRamp > 0.5) { t = smoothstep(0.0, 1.0, t); }
  }
  return mix(u.edge, u.centre, t);
}
fn shade(v: vec4<f32>) -> vec4<f32> {
  if (FOUR) { return v; }
  // Heat alone: neutral in a team colour target (u.neutralL is 0 for a one-channel one).
  return vec4<f32>(v.r, 0.0, 0.0, v.r * u.neutralL);
}
@fragment fn fs(i: VOut) -> @location(0) vec4<f32> {
  let p = i.uv * 256.0;
  if (u.kernelOn < 0.5) {
    // Bilinear by hand: r32float is not filterable everywhere.
    let pb = p - 0.5;
    let b = floor(pb);
    let f = pb - b;
    let q = vec2<i32>(b);
    let v = mix(mix(cell(q, i.layer, i.hole), cell(q + vec2<i32>(1, 0), i.layer, i.hole), f.x),
                mix(cell(q + vec2<i32>(0, 1), i.layer, i.hole), cell(q + vec2<i32>(1, 1), i.layer, i.hole), f.x), f.y);
    return shade(v * i.k);
  }
  // The rows' sprite radius at this depth (their pixel clamp), never under KERNEL_MIN_CELLS cells.
  let w = select(1.0, max(i.depth, 1e-6), u.perspective > 0.5);
  var px = u.radius * u.pxPerUnit / w;
  px = max(u.minPx, select(px, min(px, u.maxPx), u.maxPx > 0.0));
  let rW = px * w / max(u.pxPerUnit, 1e-20);
  let rEff = max(rW, 1.25 * i.cell);
  let kept = select(rW, u.radius, u.keepMass > 0.5) / rEff;
  let rTex = rEff / max(i.cell, 1e-20);
  let n = min(i32(ceil(rTex)), 5);
  let base = vec2<i32>(floor(p));
  var acc = vec4<f32>(0.0);
  for (var dy = -n; dy <= n; dy++) {
    for (var dx = -n; dx <= n; dx++) {
      let q = base + vec2<i32>(dx, dy);
      if (any(q < i.span.xy) || any(q >= i.span.zw)) { continue; }
      let d = length(p - (vec2<f32>(q) + 0.5)) / rTex;
      if (d >= 1.0) { continue; }
      acc += cell(q, i.layer, i.hole) * ramp(d);
    }
  }
  return shade(acc * (i.k * kept * kept));
}
