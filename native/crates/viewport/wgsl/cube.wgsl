
struct SceneUniforms {
  viewProj : mat4x4<f32>,
  camera   : vec4<f32>,
  cfg      : vec4<f32>,
};
@group(0) @binding(0) var<uniform> u : SceneUniforms;

struct CubeOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) normal : vec3<f32>,
  @location(1) colour : vec3<f32>,
};

@vertex
fn vsCube(
  @location(0) localPos : vec3<f32>,
  @location(1) localNormal : vec3<f32>,
  @location(2) centre : vec3<f32>,
  @location(3) colour : vec3<f32>,
  @location(4) orient : vec2<f32>,
) -> CubeOut {
  var out : CubeOut;
  let cy = cos(orient.x);
  let sy = sin(orient.x);
  let cp = cos(orient.y);
  let sp = sin(orient.y);
  // Yaw about world Y, then pitch about the rotated X.
  let ry = mat3x3<f32>(cy, 0.0, -sy, 0.0, 1.0, 0.0, sy, 0.0, cy);
  let rx = mat3x3<f32>(1.0, 0.0, 0.0, 0.0, cp, sp, 0.0, -sp, cp);
  let rot = ry * rx;
  let world = centre + rot * (localPos * u.cfg.z);
  out.normal = rot * localNormal;
  out.colour = colour;
  out.pos = u.viewProj * vec4<f32>(world, 1.0);
  return out;
}

@fragment
fn fsCube(in : CubeOut) -> @location(0) vec4<f32> {
  let n = normalize(in.normal);
  // Two fixed lights plus ambient: enough to read orientation without making
  // the data look like a lit game scene.
  let key = max(0.0, dot(n, normalize(vec3<f32>(0.45, 0.8, 0.35))));
  let fill = max(0.0, dot(n, normalize(vec3<f32>(-0.5, 0.2, -0.6))));
  let lum = 0.34 + 0.62 * key + 0.18 * fill;
  return vec4<f32>(in.colour * lum, 1.0);
}
