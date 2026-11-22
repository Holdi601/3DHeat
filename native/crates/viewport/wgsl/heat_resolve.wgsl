

struct BinParams {
  // grid width, height, apron, flags (1 radius channel, 2 |w| channel, 4 team)
  grid  : vec4<u32>,
  // words a channel plane, channel of the radius, of |w|, first team channel
  // (the offset sums, x and y, are always channels 1 and 2)
  chan  : vec4<u32>,
  // weight scale, radius scale, the radius when it is uniform, the pass weight
  scale : vec4<f32>,
  // tiles across, tiles down, target width, target height
  tiles : vec4<u32>,
  // word of the count plane, word of the first slot, slots a cell, words a slot
  sparse : vec4<u32>,
  // the kernel: centre intensity, edge intensity, falloff, ramp flags
  kern  : vec4<f32>,
};

@group(0) @binding(0) var<uniform> bp : BinParams;
@group(0) @binding(1) var<storage, read> bins : array<u32>;
@group(0) @binding(2) var<storage, read_write> tiles : array<u32>;
@group(0) @binding(3) var sums : texture_storage_2d<rgba32float, write>;
@group(0) @binding(4) var radii : texture_storage_2d<rgba32float, write>;

var<workgroup> reach : atomic<u32>;

fn wide(i : u32) -> f32 {
  let lo = bins[i];
  let hi = bins[i + 1u];
  if (hi == 0u) { return f32(lo); }
  // Small negatives exactly, rather than as a difference of two huge numbers.
  if (hi == 0xffffffffu) { return -f32(0u - lo); }
  return f32(bitcast<i32>(hi)) * 4294967296.0 + f32(lo);
}

@compute @workgroup_size(16, 16)
fn csResolve(@builtin(global_invocation_id) g : vec3<u32>, @builtin(local_invocation_index) li : u32, @builtin(workgroup_id) wg : vec3<u32>) {
  if (li == 0u) { atomicStore(&reach, 0u); }
  workgroupBarrier();
  if (g.x < bp.grid.x && g.y < bp.grid.y) {
    let cell = g.y * bp.grid.x + g.x;
    let plane = bp.chan.x;
    let count = bins[bp.sparse.x + cell];
    let w = wide(cell * 2u) / bp.scale.x;
    var a = abs(w);
    if ((bp.grid.w & 2u) != 0u) { a = wide(bp.chan.z * plane + cell * 2u) / bp.scale.x; }
    var r = 0.0;
    var sum = vec4<f32>(w, 0.0, 0.0, 0.0);
    if (count > 0u && count <= bp.sparse.z) {
      // Folded from its rows: marked by their count, negative.
      r = -f32(count);
      var m = 0u;
      for (var k = 0u; k < count; k++) {
        let at = bp.sparse.y + (cell * bp.sparse.z + k) * bp.sparse.w;
        m = max(m, u32(floor(unpack2x16float(bins[at + 1u]).y + 0.5)));
      }
      atomicMax(&reach, m);
    } else if (count > 0u && a > 0.0) {
      r = bp.scale.z;
      if ((bp.grid.w & 1u) != 0u) { r = (wide(bp.chan.y * plane + cell * 2u) / bp.scale.y) / a; }
      r = clamp(r, 1e-3, 16.0);
      if ((bp.grid.w & 4u) != 0u) {
        let t = bp.chan.w * plane + cell * 2u;
        sum = vec4<f32>(w, wide(t) / bp.scale.x, wide(t + plane) / bp.scale.x, wide(t + plane * 2u) / bp.scale.x);
      }
      atomicMax(&reach, u32(floor(r + 0.5)));
    }
    textureStore(sums, vec2<i32>(g.xy), sum);
    textureStore(radii, vec2<i32>(g.xy), vec4<f32>(r, wide(plane + cell * 2u) / bp.scale.x, wide(plane * 2u + cell * 2u) / bp.scale.x, 0.0));
  }
  workgroupBarrier();
  if (li == 0u) { tiles[wg.y * bp.tiles.x + wg.x] = atomicLoad(&reach); }
}

// Each tile's reach becomes the most any neighbour's cells reach into it.
@group(0) @binding(5) var<storage, read_write> reachOut : array<u32>;

@compute @workgroup_size(8, 8)
fn csDilate(@builtin(global_invocation_id) g : vec3<u32>) {
  if (g.x >= bp.tiles.x || g.y >= bp.tiles.y) { return; }
  var m = 0u;
  for (var dy = -1; dy <= 1; dy++) {
    for (var dx = -1; dx <= 1; dx++) {
      let x = i32(g.x) + dx;
      let y = i32(g.y) + dy;
      if (x < 0 || y < 0 || x >= i32(bp.tiles.x) || y >= i32(bp.tiles.y)) { continue; }
      m = max(m, tiles[u32(y) * bp.tiles.x + u32(x)]);
    }
  }
  reachOut[g.y * bp.tiles.x + g.x] = m;
}
