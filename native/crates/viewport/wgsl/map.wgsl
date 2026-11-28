
struct MapUniforms {
  viewProj : mat4x4<f32>,
  // minX, minZ, maxX, maxZ
  rect     : vec4<f32>,
  // y, flipV, opacity, desaturate
  cfg      : vec4<f32>,
  // brightness, unused
  cfg2     : vec4<f32>,
};
@group(0) @binding(0) var<uniform> u : MapUniforms;
@group(0) @binding(1) var mapTex : texture_2d<f32>;
@group(0) @binding(2) var samp : sampler;

struct MapOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) uv : vec2<f32>,
};

@vertex
fn vsMap(@builtin(vertex_index) vid : u32) -> MapOut {
  var out : MapOut;
  // Two triangles of a quad, straight from the vertex index.
  let cx = f32(vid == 1u || vid == 2u || vid == 4u);
  let cy = f32(vid == 2u || vid == 4u || vid == 5u);
  var v = cy;
  if (u.cfg.y > 0.5) { v = 1.0 - cy; }
  out.uv = vec2<f32>(cx, v);
  let p = vec3<f32>(
    mix(u.rect.x, u.rect.z, cx),
    u.cfg.x,
    mix(u.rect.y, u.rect.w, cy),
  );
  out.pos = u.viewProj * vec4<f32>(p, 1.0);
  return out;
}

@fragment
fn fsMap(in : MapOut) -> @location(0) vec4<f32> {
  let t = textureSample(mapTex, samp, in.uv);
  // Rec.709 luma, so desaturation preserves perceived lightness.
  let l = dot(t.rgb, vec3<f32>(0.2126, 0.7152, 0.0722));
  let c = mix(t.rgb, vec3<f32>(l), clamp(u.cfg.w, 0.0, 1.0)) * u.cfg2.x;
  return vec4<f32>(c, t.a * u.cfg.z);
}
