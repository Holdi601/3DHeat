

struct FsOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) uv : vec2<f32>,
};

@vertex
fn vsFullscreen(@builtin(vertex_index) vid : u32) -> FsOut {
  var out : FsOut;
  let p = vec2<f32>(f32((vid & 1u) << 1u), f32(vid & 2u));
  out.uv = vec2<f32>(p.x, 1.0 - p.y);
  out.pos = vec4<f32>(p * 2.0 - 1.0, 0.0, 1.0);
  return out;
}


struct MergeUniforms { cfg : vec4<f32>, };
@group(0) @binding(0) var<uniform> u : MergeUniforms;
@group(0) @binding(1) var srcTex : texture_2d<f32>;

@fragment
fn fsMerge(in : FsOut) -> @location(0) vec4<f32> {
  let dims = vec2<f32>(textureDimensions(srcTex));
  let px = vec2<i32>(in.uv * dims);
  // All four channels, not just R. In team mode G and B carry the weighted group
  // colour, and merging the density while dropping the colour would leave the
  // accumulator's ratio between them meaningless — the picture would be correctly
  // bright and coloured by whatever the last full frame happened to hold.
  return textureLoad(srcTex, px, 0) * u.cfg.x;
}
