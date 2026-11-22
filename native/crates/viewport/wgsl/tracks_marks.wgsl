
struct U {
  viewProj : mat4x4<f32>,
  cam : vec4<f32>,
  px : vec4<f32>,
  lod : vec4<f32>,
  n : vec4<u32>,
  trail : vec4<f32>,
  m : vec4<u32>,
};
@group(0) @binding(0) var<uniform> u : U;
@group(0) @binding(1) var<storage, read> markPos : array<vec4<f32>>;   // x, y, z, time
@group(0) @binding(2) var<storage, read> markColour : array<u32>;
@group(0) @binding(3) var<storage, read_write> counts : array<atomic<u32>>;
@group(0) @binding(4) var<storage, read_write> trail : array<vec4<f32>>;

@compute @workgroup_size(64)
fn marks(@builtin(global_invocation_id) gid : vec3<u32>, @builtin(num_workgroups) nwg : vec3<u32>) {
  let i = gid.x + gid.y * nwg.x * 64u;
  if (i >= u.m.x) { return; }
  let mk = markPos[i];
  let age = u.cam.w - mk.w;
  let W = u.trail.z;
  if (age < 0.0 || age > W) { return; }
  let clip = u.viewProj * vec4<f32>(mk.xyz, 1.0);
  if (clip.w <= 0.0) { return; }
  let ndc = clip.xy / clip.w;
  if (abs(ndc.x) > 1.1 || abs(ndc.y) > 1.1) { return; }
  var pxSize = u.px.y;
  if (u.px.x > 0.0) { pxSize = distance(mk.xyz, u.cam.xyz) / u.px.x; }
  let r = 0.5 * u.trail.w * pxSize;
  let c = markColour[i];
  let a = 0.95 * clamp(1.0 - age / W, 0.3, 1.0);
  let col = vec4<f32>(f32(c & 255u) / 255.0, f32((c >> 8u) & 255u) / 255.0, f32((c >> 16u) & 255u) / 255.0, a);
  let base = atomicAdd(&counts[u.n.y], 6u);
  if (base + 6u > u.n.z) { return; }
  let axes = array<vec3<f32>, 3>(vec3<f32>(r, 0.0, r), vec3<f32>(r, 0.0, -r), vec3<f32>(0.0, 1.4 * r, 0.0));
  for (var k = 0u; k < 3u; k = k + 1u) {
    let v = (base + k * 2u) * 2u;
    trail[v] = vec4<f32>(mk.xyz - axes[k], 1.0);
    trail[v + 1u] = col;
    trail[v + 2u] = vec4<f32>(mk.xyz + axes[k], 1.0);
    trail[v + 3u] = col;
  }
}
