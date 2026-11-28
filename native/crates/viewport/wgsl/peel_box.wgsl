

// The level's atlas, or the renderer's opaque placeholder when there is none.
@group(1) @binding(0) var atlas : texture_2d<f32>;
@group(1) @binding(1) var atlasSampler : sampler;
@group(1) @binding(2) var<storage, read> tiles : array<vec4<f32>>;

fn tileRect(tile : u32) -> vec4<f32> {
  if (tile == 0u) { return vec4<f32>(0.0); }
  return tiles[tile - 1u];
}

fn sampleAtlas(uv : vec2<f32>, tile : vec4<f32>) -> vec4<f32> {
  let dx = dpdx(uv);
  let dy = dpdy(uv);
  if (tile.z == 0.0) {
    return textureSampleGrad(atlas, atlasSampler, clamp(uv, vec2<f32>(0.0), vec2<f32>(1.0)), dx, dy);
  }
  let size = abs(tile.zw);
  let local = select(clamp(uv, vec2<f32>(0.0), vec2<f32>(1.0)), fract(uv), tile.zw > vec2<f32>(0.0));
  return textureSampleGrad(atlas, atlasSampler, tile.xy + local * size, dx * size, dy * size);
}

struct PeelUniforms {
  viewProj : mat4x4<f32>,
  // xy: viewport in pixels, z: depth-compare epsilon, w: 1 once the atlas has
  // decoded, so its cut-out texels are not surfaces
  cfg      : vec4<f32>,
};
@group(0) @binding(0) var<uniform> u : PeelUniforms;
@group(0) @binding(1) var prevDepth : texture_depth_2d;

struct PeelOut {
  @builtin(position) pos : vec4<f32>,
  // -1 on a vertex with no texture.
  @location(0) uv : vec2<f32>,
  @location(1) @interpolate(flat) tile : vec4<f32>,
};

@vertex
fn vsPeel(
  @location(0) position : vec3<f32>,
  @location(1) uv : vec2<f32>,
  @location(2) tile : u32,
) -> PeelOut {
  var out : PeelOut;
  out.pos = u.viewProj * vec4<f32>(position, 1.0);
  out.uv = uv;
  out.tile = tileRect(tile);
  return out;
}

@fragment
fn fsPeel(in : PeelOut) {
  // Sampled first: the mip level comes from the UV's derivatives, which are
  // only valid in uniform control flow, and both tests below discard. The clamp
  // keeps an untextured vertex's -1 a legal read; its result is not used.
  let alpha = sampleAtlas(in.uv, in.tile).a;
  let prev = textureLoad(prevDepth, vec2<i32>(in.pos.xy), 0);
  // Reverse-Z: at or in front of the last layer is at or above it, by a share of its depth (render/depth.ts).
  if (in.pos.z >= prev * (1.0 - u.cfg.z)) { discard; }
  if (u.cfg.w > 0.5 && (in.tile.z != 0.0 || in.uv.x >= 0.0) && alpha < 0.5) { discard; }
}

fn boxPoint(c : vec3<f32>, r0 : vec4<f32>, r1 : vec4<f32>, r2 : vec4<f32>) -> vec3<f32> {
  return vec3<f32>(dot(r0.xyz, c) + r0.w, dot(r1.xyz, c) + r1.w, dot(r2.xyz, c) + r2.w);
}

@vertex
fn vsPeelBox(
  @location(0) corner : vec3<f32>,
  @location(5) r0 : vec4<f32>,
  @location(6) r1 : vec4<f32>,
  @location(7) r2 : vec4<f32>,
) -> PeelOut {
  var out : PeelOut;
  out.pos = u.viewProj * vec4<f32>(boxPoint(corner, r0, r1, r2), 1.0);
  out.uv = vec2<f32>(-1.0);
  out.tile = vec4<f32>(0.0);
  return out;
}
