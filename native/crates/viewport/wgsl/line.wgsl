
struct SceneUniforms {
  viewProj : mat4x4<f32>,
  // camera xyz, unused
  camera   : vec4<f32>,
  // fade start, fade end, size/length, brightness
  cfg      : vec4<f32>,
};
@group(0) @binding(0) var<uniform> u : SceneUniforms;

struct LineOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) colour : vec4<f32>,
  @location(1) world : vec3<f32>,
};

@vertex
fn vsLine(
  @location(0) position : vec3<f32>,
  @location(1) colour : vec4<f32>,
) -> LineOut {
  var out : LineOut;
  out.colour = colour;
  out.world = position;
  out.pos = u.viewProj * vec4<f32>(position, 1.0);
  return out;
}

// 0 every triangle, 1 the solid ones only, 2 the see-through ones only (SEE_THROUGH_BELOW): a constant of the pipeline.
override alphaPass : f32 = 0.0;

@fragment
fn fsLine(in : LineOut) -> @location(0) vec4<f32> {
  if (alphaPass > 0.5 && (alphaPass < 1.5) != (in.colour.a >= 0.995)) { discard; }
  let d = distance(in.world, u.camera.xyz);
  let fade = 1.0 - smoothstep(u.cfg.x, u.cfg.y, d);
  if (fade <= 0.001) { discard; }
  return vec4<f32>(in.colour.rgb, in.colour.a * fade);
}
