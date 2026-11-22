
@group(0) @binding(0) var<storage, read> runs : array<vec2<u32>>;
@group(0) @binding(1) var<storage, read> counts : array<u32>;
@group(0) @binding(2) var<storage, read_write> args : array<u32>;
@group(0) @binding(3) var<uniform> n : vec4<u32>;   // meshes, trail vertex room (counts: the meshes', the trail's, the glyphs')
@group(0) @binding(4) var<storage, read_write> trailArgs : array<u32>;

@compute @workgroup_size(64)
fn finish(@builtin(global_invocation_id) gid : vec3<u32>) {
  let m = gid.x;
  if (m == n.x) {
    // The trail's vertex count: whole segments that fitted.
    let c = counts[n.x];
    trailArgs[0] = min(c, n.y);
    return;
  }
  if (m == n.x + 1u) {
    // The glyphs' run, after the meshes': its draw's arguments after theirs.
    args[n.x * 4u + 1u] = min(counts[m], runs[n.x].y);
    return;
  }
  if (m > n.x) { return; }
  args[m * 4u + 1u] = min(counts[m], runs[m].y);
}
