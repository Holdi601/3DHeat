
struct SceneUniforms {
  viewProj : mat4x4<f32>,
  camera   : vec4<f32>,
  cfg      : vec4<f32>,
};
@group(0) @binding(0) var<uniform> u : SceneUniforms;

struct TrailOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) colour : vec4<f32>,
};

@vertex
fn vsTrail(@location(0) position : vec4<f32>, @location(1) colour : vec4<f32>) -> TrailOut {
  var out : TrailOut;
  out.colour = colour;
  out.pos = u.viewProj * vec4<f32>(position.xyz, 1.0);
  return out;
}

@fragment
fn fsTrail(in : TrailOut) -> @location(0) vec4<f32> {
  if (in.colour.a <= 0.002) { discard; }
  return in.colour;
}
