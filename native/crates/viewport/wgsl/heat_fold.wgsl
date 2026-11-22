

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
@group(0) @binding(1) var sums : texture_2d<f32>;
@group(0) @binding(2) var radii : texture_2d<f32>;
@group(0) @binding(3) var<storage, read> reach : array<u32>;
@group(0) @binding(4) var<storage, read> lut : array<f32>;
@group(0) @binding(7) var<storage, read> bins : array<u32>;
@group(0) @binding(8) var curveTex : texture_2d<f32>;
@group(0) @binding(9) var curveSamp : sampler;

// The splat's ramp (fsHeat), for the rows a sparse cell keeps.
fn kernel(d : f32) -> f32 {
  if (d > 1.0) { return 0.0; }
  let flags = u32(bp.kern.w);
  var t : f32;
  if ((flags & 64u) != 0u) {
    t = textureSampleLevel(curveTex, curveSamp, vec2<f32>(mix(0.001953125, 0.998046875, d), 0.5), 0.0).r;
  } else {
    t = pow(1.0 - d, bp.kern.z);
    if ((flags & 32u) != 0u) { t = smoothstep(0.0, 1.0, t); }
  }
  return mix(bp.kern.y, bp.kern.x, t);
}

@vertex
fn vsFold(@builtin(vertex_index) vid : u32) -> @builtin(position) vec4<f32> {
  let p = vec2<f32>(f32((vid & 1u) << 1u), f32(vid & 2u));
  return vec4<f32>(p * 2.0 - 1.0, 0.0, 1.0);
}

@fragment
fn fsFold(@builtin(position) pos : vec4<f32>) -> @location(0) vec4<f32> {
  let apron = i32(bp.grid.z);
  let g = vec2<i32>(pos.xy) + vec2<i32>(apron);
  let reachHere = i32(reach[u32(g.y / 16) * bp.tiles.x + u32(g.x / 16)]);
  if (reachHere == 0) { discard; }
  var acc = vec4<f32>(0.0);
  for (var dy = -reachHere; dy <= reachHere; dy++) {
    for (var dx = -reachHere; dx <= reachHere; dx++) {
      let c = g + vec2<i32>(dx, dy);
      let r = textureLoad(radii, c, 0).r;
      if (r == 0.0) { continue; }
      if (r < 0.0) {
        let n = u32(-r);
        for (var k = 0u; k < n; k++) {
          let at = bp.sparse.y + ((u32(c.y) * bp.grid.x + u32(c.x)) * bp.sparse.z + k) * bp.sparse.w;
          let pq = bins[at];
          let f = (vec2<f32>(f32(pq & 0xffu), f32((pq >> 8u) & 0xffu)) + vec2<f32>(0.5)) / 256.0;
          let wr = unpack2x16float(bins[at + 1u]);
          // The texel is -(dx, dy) from the cell: the cell is what is gathered.
          let d = length(vec2<f32>(f32(-dx), f32(-dy)) + vec2<f32>(0.5) - f) / max(wr.y, 1e-6);
          if (d > 1.0) { continue; }
          let v = kernel(d) * wr.x;
          var ab = vec2<f32>(0.0);
          if (bp.sparse.w > 2u) { ab = unpack2x16float(bins[at + 2u]); }
          acc += v * vec4<f32>(1.0, ab.x, ab.y, f32(pq >> 16u) / 65535.0);
        }
        continue;
      }
      let ax = abs(dx);
      let ay = abs(dy);
      let s = i32(floor(r + 0.5));
      if (ax > s || ay > s) { continue; }
      let f = min(r / 0.125, 128.999);
      let l0 = u32(f);
      let at = u32(ay * 17 + ax);
      let ta = u32(ax * 17 + ay);
      let L0 = l0 * 289u;
      let L1 = L0 + 289u;
      let J = 37570u;
      let k = mix(lut[L0 + at], lut[L1 + at], fract(f));
      // The first moment: exact where the rows thin out across the cell
      // linearly, which is most of what is left between the cell's mean
      // kernel and the splat of its rows. The texel is at -(dx, dy).
      let jx = mix(lut[J + L0 + at], lut[J + L1 + at], fract(f)) * select(-1.0, 1.0, dx <= 0);
      let jy = mix(lut[J + L0 + ta], lut[J + L1 + ta], fract(f)) * select(-1.0, 1.0, dy <= 0);
      let m = textureLoad(radii, c, 0);
      let sum = textureLoad(sums, c, 0);
      let tilt = 12.0 * (m.y * jx + m.z * jy);
      acc += k * sum + tilt * select(vec4<f32>(1.0, 0.0, 0.0, 0.0), sum / sum.x, sum.x != 0.0 && (bp.grid.w & 4u) != 0u);
    }
  }
  acc = acc * bp.scale.w;
  if ((bp.grid.w & 4u) != 0u) { return acc; }
  return vec4<f32>(acc.x, 0.0, 0.0, acc.x * 0.7);
}

// Indirect draws for the listed rows, one a plan entry.
@group(0) @binding(5) var<storage, read> counts : array<u32>;
@group(0) @binding(6) var<storage, read_write> args : array<u32>;

@compute @workgroup_size(256)
fn csArgs(@builtin(local_invocation_index) i : u32) {
  let n = min(counts[i], counts[256u + i]);
  args[i * 4u] = n * 3u;
  args[i * 4u + 1u] = 1u;
  args[i * 4u + 2u] = 0u;
  args[i * 4u + 3u] = 0u;
}
