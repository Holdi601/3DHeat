
struct MeshUniforms {
  viewProj : mat4x4<f32>,
  camera   : vec4<f32>,
  cfg      : vec4<f32>,
  tint     : vec4<f32>,
  relief   : vec4<f32>,
  elev     : vec4<f32>,
  slice    : vec4<f32>,
  cullAxis : vec4<f32>,
  cullCfg  : vec4<f32>,
};
@group(0) @binding(0) var<uniform> u : MeshUniforms;

struct WireOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) world : vec3<f32>,
  @location(1) distanceFade : f32,
};

@vertex
fn vsWire(@location(0) position : vec3<f32>) -> WireOut {
  var out : WireOut;
  out.world = position;
  // cfg.xy are the fade thresholds. Structure edges are given values beyond any
  // scene, i.e. no fade; the ground's triangle grid needs one or it becomes a
  // white moire sheet past the distance where its cells stop resolving.
  out.distanceFade =
    1.0 - smoothstep(u.cfg.x, u.cfg.y, distance(position, u.camera.xyz));
  out.pos = u.viewProj * vec4<f32>(position, 1.0);
  return out;
}

/**
 * Is this world position outside the distance bounds?
 *
 * A second copy of the mesh shader's function, because these are two separate
 * shader modules and WGSL has no include. They must stay identical: a cut that
 * removed a wall's faces and left its wireframe behind would read as a bug in the
 * geometry rather than as a cut.
 */
fn cullsAway(world : vec3<f32>) -> bool {
  if (u.cullCfg.x <= 0.0 && u.cullCfg.y <= 0.0) { return false; }
  var camDist = distance(world, u.camera.xyz);
  if (u.cullAxis.w > 0.5) { camDist = dot(world - u.camera.xyz, u.cullAxis.xyz); }
  if (u.cullCfg.x > 0.0 && camDist < u.cullCfg.x) { return true; }
  if (u.cullCfg.y > 0.0 && camDist > u.cullCfg.y) { return true; }
  return false;
}

@fragment
fn fsWire(in : WireOut) -> @location(0) vec4<f32> {
  var fade = in.distanceFade;
  if (fade <= 0.0) { discard; }
  if (cullsAway(in.world)) { discard; }
  if (u.slice.x >= 0.0) {
    var coord = in.world.x;
    if (u.slice.x > 1.5) { coord = in.world.z; } else if (u.slice.x > 0.5) { coord = in.world.y; }
    if (coord < u.slice.y || coord > u.slice.z) {
      if (u.slice.w <= 0.0) { discard; }
      fade = fade * u.slice.w;
    }
  }
  return vec4<f32>(u.tint.rgb, u.cfg.z * fade);
}
