
struct LutParams {
  // centre intensity, edge intensity, falloff, flags (rowCfg.w bits)
  shape : vec4<f32>,
};
@group(0) @binding(0) var<uniform> lp : LutParams;
// K_eff, then its first moment along x: J(o) = mean over the cell of u.x K(|o - u| / r).
@group(0) @binding(1) var<storage, read_write> lut : array<f32>;
@group(0) @binding(2) var curveTex : texture_2d<f32>;
@group(0) @binding(3) var curveSamp : sampler;

fn kernel(d : f32) -> f32 {
  if (d > 1.0) { return 0.0; }
  let flags = u32(lp.shape.w);
  var t : f32;
  if ((flags & 64u) != 0u) {
    t = textureSampleLevel(curveTex, curveSamp, vec2<f32>(mix(0.001953125, 0.998046875, d), 0.5), 0.0).r;
  } else {
    t = pow(1.0 - d, lp.shape.z);
    if ((flags & 32u) != 0u) { t = smoothstep(0.0, 1.0, t); }
  }
  return mix(lp.shape.y, lp.shape.x, t);
}

@compute @workgroup_size(64)
fn csLut(@builtin(global_invocation_id) g : vec3<u32>) {
  let n = 37570u;
  if (g.x >= n) { return; }
  let level = g.x / 289u;
  let rest = g.x % 289u;
  let oy = f32(rest / 17u);
  let ox = f32(rest % 17u);
  let r = f32(level) * 0.125;
  var sum = 0.0;
  var first = 0.0;
  if (r > 0.0) {
    for (var j = 0u; j < 32u; j++) {
      for (var i = 0u; i < 32u; i++) {
        let du = (f32(i) + 0.5) / 32.0 - 0.5;
        let dv = (f32(j) + 0.5) / 32.0 - 0.5;
        let k = kernel(length(vec2<f32>(ox - du, oy - dv)) / r);
        sum += k;
        first += du * k;
      }
    }
  }
  lut[g.x] = sum / 1024.0;
  lut[n + g.x] = first / 1024.0;
}
