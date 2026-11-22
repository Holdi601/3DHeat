

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

@vertex
fn vsStream(@builtin(vertex_index) vid : u32) -> @builtin(position) vec4<f32> {
  let p = vec2<f32>(f32((vid & 1u) << 1u), f32(vid & 2u));
  return vec4<f32>(p * 2.0 - 1.0, 0.0, 1.0);
}
fn hash(q : vec2<f32>) -> f32 {
  var p = fract(q * vec2<f32>(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}
fn fieldAt(uv : vec2<f32>) -> vec3<f32> {
  let f = textureSampleLevel(field, fieldSamp, uv, 0.0).xyz;
  var m = vec2<f32>(0.0);
  if (f.z > 0.0) { m = f.xy / f.z; }
  return vec3<f32>(m, f.z);
}
@fragment
fn fsStream(@builtin(position) frag : vec4<f32>) -> @location(0) vec4<f32> {
  let canvas = u.size.zw;
  let uv0 = frag.xy / canvas;
  let f0 = fieldAt(uv0);
  let amount = f0.z * u.cfg.x / max(1e-9, u.cfg.y);
  let r0 = length(f0.xy);
  if (f0.z <= 0.0 || r0 < 0.03 || amount < 0.004) { discard; }
  let STEPS = 12;
  let STEP = 1.6;
  var acc = 0.0;
  let still = u.cfg.w < 0.0;
  let phase = select(u.cfg.w * 0.9, 0.0, still);
  for (var side = 0; side < 2; side++) {
    var uv = uv0;
    let dirSign = select(1.0, -1.0, side == 0);
    for (var k = 1; k <= STEPS; k++) {
      let m = fieldAt(uv).xy;
      let ml = length(m);
      if (ml < 1e-4) { break; }
      // The field is y up, texture space y down.
      uv += dirSign * vec2<f32>(m.x, -m.y) / ml * STEP / canvas;
      let pixel = vec2<f32>(uv.x, 1.0 - uv.y) * canvas;
      let cellId = floor(pixel / 3.0);
      let dot1 = step(0.93, hash(cellId));
      let along = f32(k) / f32(STEPS) * dirSign;
      var pulse = 1.0 - abs(along);
      if (!still) { pulse = fract(phase + hash(cellId + 7.0) - along * 0.5); }
      acc += dot1 * pulse;
    }
  }
  let a = clamp(acc * 0.55, 0.0, 1.0) * clamp(sqrt(amount), 0.0, 1.0) * (0.3 + 0.7 * r0);
  if (a <= 0.003) { discard; }
  return vec4<f32>(u.color.rgb, u.color.a * a);
}
