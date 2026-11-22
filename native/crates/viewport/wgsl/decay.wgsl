

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


struct DecayUniforms { cfg : vec4<f32>, };
@group(0) @binding(0) var<uniform> u : DecayUniforms;

@fragment
fn fsDecay(in : FsOut) -> @location(0) vec4<f32> {
  _ = in.uv;
  return vec4<f32>(u.cfg.x);
}
