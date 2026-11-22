

struct FieldUniforms {
  // cells xy, canvas pixels zw
  size  : vec4<f32>,
  // 1 / heat gain, saturation, widen (pixels, the outline), time (s, < 0 still)
  cfg   : vec4<f32>,
  color : vec4<f32>,
};
@group(0) @binding(0) var<uniform> u : FieldUniforms;
@group(0) @binding(1) var field : texture_2d<f32>;
@group(0) @binding(2) var fieldSamp : sampler;

struct ArrowOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) alpha : f32,
};
const SHAPE = array<vec2<f32>, 9>(
  vec2<f32>(-0.5, -1.0), vec2<f32>(0.18, -1.0), vec2<f32>(-0.5, 1.0),
  vec2<f32>(0.18, -1.0), vec2<f32>(0.18, 1.0), vec2<f32>(-0.5, 1.0),
  vec2<f32>(0.18, -3.2), vec2<f32>(0.5, 0.0), vec2<f32>(0.18, 3.2)
);
@vertex
fn vsArrow(@builtin(vertex_index) vid : u32, @builtin(instance_index) inst : u32) -> ArrowOut {
  var out : ArrowOut;
  let cells = vec2<i32>(u.size.xy);
  let c = vec2<i32>(i32(inst) % cells.x, i32(inst) / cells.x);
  var sum = vec3<f32>(0.0);
  for (var dy = -1; dy <= 1; dy++) {
    for (var dx = -1; dx <= 1; dx++) {
      let q = clamp(c + vec2<i32>(dx, dy), vec2<i32>(0), cells - 1);
      var w = 1.0;
      if (dx == 0 && dy == 0) { w = 2.0; }
      sum += textureLoad(field, q, 0).xyz * w;
    }
  }
  sum *= 0.1;
  let m = sum.xy / max(sum.z, 1e-12);
  let r = length(m);
  // Only where the cell itself carries heat: see the WebGL2 copy.
  let amount = textureLoad(field, c, 0).z * u.cfg.x / max(1e-9, u.cfg.y);
  if (sum.z <= 0.0 || r < 0.03 || amount < 0.004) {
    out.pos = vec4<f32>(2.0, 2.0, 2.0, 1.0);
    out.alpha = 0.0;
    return out;
  }
  let dir = m / r;
  let across = vec2<f32>(-dir.y, dir.x);
  let cellPx = u.size.zw / u.size.xy;
  let cell = min(cellPx.x, cellPx.y);
  let len = cell * (0.3 + 0.62 * r);
  let halfW = max(0.75, cell * 0.035) + u.cfg.z;
  let s = SHAPE[vid];
  let px = dir * (s.x * len + sign(s.x) * u.cfg.z) + across * s.y * halfW;
  let uv = (vec2<f32>(c) + 0.5) / u.size.xy;
  let center = vec2<f32>(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0);
  out.pos = vec4<f32>(center + px / u.size.zw * 2.0, 0.0, 1.0);
  out.alpha = clamp(sqrt(amount), 0.0, 1.0) * (0.35 + 0.65 * r);
  return out;
}
@fragment
fn fsArrow(in : ArrowOut) -> @location(0) vec4<f32> {
  return vec4<f32>(u.color.rgb, u.color.a * in.alpha);
}
