
struct SceneUniforms {
  viewProj : mat4x4<f32>,
  camera   : vec4<f32>,
  cfg      : vec4<f32>,
};
@group(0) @binding(0) var<uniform> u : SceneUniforms;

struct LookOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) colour : vec4<f32>,
};

@vertex
fn vsLook(
  @location(0) t : f32,
  @location(1) centre : vec3<f32>,
  @location(2) colour : vec3<f32>,
  @location(3) orient : vec2<f32>,
) -> LookOut {
  var out : LookOut;
  let cy = cos(orient.x);
  let sy = sin(orient.x);
  let cp = cos(orient.y);
  let sp = sin(orient.y);
  let dir = vec3<f32>(sy * cp, sp, -cy * cp);
  out.colour = vec4<f32>(mix(vec3<f32>(1.0), colour, 0.35), mix(0.95, 0.0, t));
  out.pos = u.viewProj * vec4<f32>(centre + dir * (t * u.cfg.z), 1.0);
  return out;
}

@fragment
fn fsLook(in : LookOut) -> @location(0) vec4<f32> {
  return in.colour;
}
