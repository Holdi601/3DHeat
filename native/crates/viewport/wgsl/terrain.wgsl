
struct MeshUniforms {
  viewProj : mat4x4<f32>,
  camera   : vec4<f32>,
  // fade start, fade end, opacity, brightness
  cfg      : vec4<f32>,
  // rgb tint, w = fresnel strength (0 for ground)
  tint     : vec4<f32>,
  // slope strength, contour spacing, contour strength, index-contour interval
  relief   : vec4<f32>,
  // elevation ramp strength, low Y, high Y, flat-normal flag
  elev     : vec4<f32>,
  // slice axis (0 x, 1 y, 2 z; negative disables), slab min, slab max, outside
  slice    : vec4<f32>,
  // The distance cull, applied to the level as well as to the heat: without it
  // the plane removes the datapoints and leaves the building standing in front
  // of them, which hides the thing the plane was moved there to reveal.
  //
  // xyz: the unit vector the camera looks along   w: 1 to measure along it
  cullAxis : vec4<f32>,
  // x: near bound   y: far bound   0 disables either.
  // z: 1 to shade with the level's captured vertex colour, 0 for grey.
  // w: 1 to draw the ground from its texture atlas, lighting softened; 2 to
  //    draw structures from it with the lighting whole.
  cullCfg  : vec4<f32>,
};
@group(0) @binding(0) var<uniform> u : MeshUniforms;
// The level's texture atlas and its tiles. Their own group, so the scene
// uniforms' bind group - shared with every other pipeline - does not have to
// know textures exist. A 1x1 placeholder is bound when the level has none.

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


struct MeshOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) normal : vec3<f32>,
  @location(1) world : vec3<f32>,
  @location(2) colour : vec3<f32>,
  @location(3) uv : vec2<f32>,
  @location(4) @interpolate(flat) tile : vec4<f32>,
};

@vertex
fn vsMesh(
  @location(0) position : vec3<f32>,
  @location(1) normal : vec3<f32>,
  // Captured colour, in its own buffer. The renderer binds a constant white one
  // when the level has no colour, so this is always backed.
  @location(2) colour : vec3<f32>,
  // Texture coordinate into the atlas; -1 marks a vertex with none. Always
  // backed, for the same reason as the colour. A tiled vertex's is its image's own.
  @location(3) uv : vec2<f32>,
  // Its tile number, 0 for an atlas UV; a zero buffer when nothing tiles.
  @location(4) tile : u32,
) -> MeshOut {
  var out : MeshOut;
  out.normal = normal;
  out.world = position;
  out.colour = colour;
  out.uv = uv;
  out.tile = tileRect(tile);
  out.pos = u.viewProj * vec4<f32>(position, 1.0);
  return out;
}

/**
 * Is this world position outside the distance bounds?
 *
 * The level is cut by the same bounds as the heat, or the plane hides what it was
 * moved there to reveal: with the datapoints gone and the building still standing
 * in front of them there is nothing to read.
 */
fn cullsAway(world : vec3<f32>) -> bool {
  if (u.cullCfg.x <= 0.0 && u.cullCfg.y <= 0.0) { return false; }
  var camDist = distance(world, u.camera.xyz);
  if (u.cullAxis.w > 0.5) { camDist = dot(world - u.camera.xyz, u.cullAxis.xyz); }
  if (u.cullCfg.x > 0.0 && camDist < u.cullCfg.x) { return true; }
  if (u.cullCfg.y > 0.0 && camDist > u.cullCfg.y) { return true; }
  return false;
}
/** How much of a surface at this world position survives the slice slab. */
fn sliceFade(world : vec3<f32>) -> f32 {
  if (u.slice.x < 0.0) { return 1.0; }
  var coord = world.x;
  if (u.slice.x > 1.5) { coord = world.z; } else if (u.slice.x > 0.5) { coord = world.y; }
  if (coord < u.slice.y || coord > u.slice.z) { return u.slice.w; }
  return 1.0;
}

@fragment
fn fsMesh(in : MeshOut) -> @location(0) vec4<f32> {
  // Derivatives first, unconditionally: they are only defined in uniform
  // control flow, and everything below this point can discard.
  let faceRaw = cross(dpdx(in.world), dpdy(in.world));
  // The texture too: its mip level comes from the UV's derivatives, so it is
  // only valid in uniform control flow, and everything below can discard. A
  // vertex with no texture carries -1; the clamp keeps that a legal read and
  // its result is not used.
  let sampled = sampleAtlas(in.uv, in.tile);
  var texel = sampled.rgb;
  // A tiled UV may be negative; only an untiled one marks "no texture" with -1.
  let textured = in.tile.z != 0.0 || in.uv.x >= 0.0;
  if (cullsAway(in.world)) { discard; }
  if (u.cullCfg.w > 0.5 && textured) {
    // A cut-out texel - a leaf card's empty corner - is not there at all. The
    // atlas holds 255 for every opaque image's texels, so only cut-out images
    // ever discard, and their texels are 0 or 255 by their own material's
    // cutoff (settleAlpha in atlas.ts). An empty texel is black, so a sample
    // at a leaf's edge is darkened by its coverage; dividing it back out gives
    // the leaf's colour. At alpha 1 the division changes nothing.
    if (sampled.a < 0.5) { discard; }
    texel = sampled.rgb / sampled.a;
  }

  let fade = sliceFade(in.world);
  if (fade <= 0.0) { discard; }

  var n = normalize(in.normal);
  if (u.elev.w > 0.0) {
    // The face's own normal, recovered from how the world position changes
    // across one pixel. An exported level is welded — one vertex where eight
    // triangles of a box corner meet — so the interpolated normal is the
    // average of everything meeting there, and every box comes out with
    // rounded corners. Oriented by the smooth normal, since the sign of that
    // cross product follows the winding, not the surface.
    let len = length(faceRaw);
    if (len > 1e-9) {
      let face = faceRaw / len;
      n = select(face, -face, dot(face, n) < 0.0);
    }
  }
  // Textured structures are lit from the side the camera sees. A sign or a
  // billboard is two coincident faces back to back, and which one wins the
  // depth test is down to rounding; lit by its own normal, the back one comes
  // out in dark triangles through the front.
  if (u.cullCfg.w > 1.5 && dot(n, u.camera.xyz - in.world) < 0.0) {
    n = -n;
  }
  let key = max(0.0, dot(n, normalize(vec3<f32>(0.4, 0.85, 0.3))));
  let fill = max(0.0, dot(n, normalize(vec3<f32>(-0.5, 0.15, -0.7))));
  var lum = (0.26 + 0.55 * key + 0.14 * fill) * u.cfg.w;
  var alpha = u.cfg.z;

  // Ground relief. Terrain normals nearly all point up, so a key light alone
  // gives it one flat grey and a valley looks like a plateau.
  if (u.relief.x > 0.0) {
    // 0 on the flat, 1 on a vertical face; squared so only real relief darkens.
    let steep = 1.0 - clamp(abs(n.y), 0.0, 1.0);
    lum = lum * (1.0 - u.relief.x * steep * steep);
  }
  if (u.elev.x > 0.0) {
    let h = clamp((in.world.y - u.elev.y) / max(1e-4, u.elev.z - u.elev.y), 0.0, 1.0);
    lum = lum * (1.0 - u.elev.x * 0.5 + u.elev.x * h);
  }
  if (u.relief.y > 0.0 && u.relief.z > 0.0) {
    // Distance to the nearest contour measured in *lines*, so fwidth gives a
    // line one pixel wide at any zoom. A fixed-width band aliases into moire.
    let lines = in.world.y / u.relief.y;
    let dist = abs(fract(lines - 0.5) - 0.5) / max(1e-5, fwidth(lines));
    var line = 1.0 - smoothstep(0.0, 1.2, dist);
    var strength = u.relief.z;
    if (u.relief.w > 0.0) {
      let major = abs(fract(lines / u.relief.w - 0.5) - 0.5) / max(1e-5, fwidth(lines / u.relief.w));
      let heavy = 1.0 - smoothstep(0.0, 1.2, major);
      line = max(line, heavy);
      strength = strength * (1.0 + 0.6 * heavy);
    }
    lum = lum * (1.0 - clamp(line * strength, 0.0, 0.95));
  }

  if (u.tint.w > 0.0) {
    let view = normalize(u.camera.xyz - in.world);
    // Grazing angles approach 1, head-on approaches 0.
    let rim = pow(1.0 - abs(dot(n, view)), 3.0);
    lum = mix(lum, lum + 0.9, rim * u.tint.w);
    alpha = mix(alpha, min(1.0, alpha + 0.75), rim * u.tint.w);
  }
  // Grey unless asked otherwise. Colour in the level competes with the heat for
  // attention, which is why it is a switch — but a scanned racetrack is one flat
  // ribbon flowing into its surroundings, and no shading separates road from
  // verge. The relief cues stay applied underneath either way.
  var base = mix(vec3<f32>(1.0), in.colour, u.cullCfg.z);
  var shadeOut = lum;
  if (u.cullCfg.w > 0.5 && textured) {
    // The texture carries the fine relief of its own ground already, so the
    // mesh lighting is applied gently - at full strength the two multiply and
    // the ground goes muddy. Brightness is taken out, softened with the cues,
    // and put back.
    base = texel;
    if (u.cullCfg.w < 1.5) {
      // A model's texture has no lighting baked in, so structures (2) keep it.
      let bright = max(u.cfg.w, 1e-3);
      shadeOut = bright * mix(1.0, (lum / bright) / 0.8, 0.45);
    }
  }
  return vec4<f32>(u.tint.rgb * base * shadeOut, alpha * fade);
}

struct TerrainU {
  palette : array<vec4<f32>, 16>,
  // x: samples a tile row (side)
  cfg : vec4<f32>,
};
@group(2) @binding(0) var terrainHeights : texture_2d_array<u32>;
@group(2) @binding(1) var terrainClasses : texture_2d_array<u32>;
@group(2) @binding(2) var<uniform> tu : TerrainU;

fn terrainH(layer : i32, p : vec2<i32>, base : f32, stp : f32) -> f32 {
  return base + f32(textureLoad(terrainHeights, p, layer, 0).r) * stp;
}

fn terrainBilinear(layer : i32, q : vec2<f32>, base : f32, stp : f32) -> f32 {
  let top = tu.cfg.x - 2.0;
  let p0 = clamp(floor(q), vec2<f32>(0.0), vec2<f32>(top));
  let f = clamp(q - p0, vec2<f32>(0.0), vec2<f32>(1.0));
  let i = vec2<i32>(p0);
  let h00 = terrainH(layer, i, base, stp);
  let h10 = terrainH(layer, i + vec2<i32>(1, 0), base, stp);
  let h01 = terrainH(layer, i + vec2<i32>(0, 1), base, stp);
  let h11 = terrainH(layer, i + vec2<i32>(1, 1), base, stp);
  return mix(mix(h00, h10, f.x), mix(h01, h11, f.x), f.y);
}

@vertex
fn vsTerrain(
  // x, z in cells of the node; 1 for a skirt vertex
  @location(0) grid : vec3<f32>,
  // origin x, origin z, spacing, skirt depth
  @location(5) a : vec4<f32>,
  // layer, texel x, texel z, level
  @location(6) b : vec4<f32>,
  // height base, height step, morph start, morph end
  @location(7) c : vec4<f32>,
) -> MeshOut {
  var out : MeshOut;
  let layer = i32(b.x + 0.5);
  let g = grid.xy;
  let t0 = b.yz;
  let h0 = terrainH(layer, vec2<i32>(t0 + g + vec2<f32>(0.5)), c.x, c.y);
  let w0 = vec3<f32>(a.x + g.x * a.z, h0, a.y + g.y * a.z);
  let k = clamp((distance(w0, u.camera.xyz) - c.z) / max(c.w - c.z, 1e-3), 0.0, 1.0);
  let gm = g - fract(g * 0.5) * 2.0 * k;
  let q = t0 + gm;
  let h = terrainBilinear(layer, q, c.x, c.y);
  let sz = 1.0 + k;
  let hx0 = terrainBilinear(layer, q - vec2<f32>(sz, 0.0), c.x, c.y);
  let hx1 = terrainBilinear(layer, q + vec2<f32>(sz, 0.0), c.x, c.y);
  let hz0 = terrainBilinear(layer, q - vec2<f32>(0.0, sz), c.x, c.y);
  let hz1 = terrainBilinear(layer, q + vec2<f32>(0.0, sz), c.x, c.y);
  out.normal = normalize(vec3<f32>(hx0 - hx1, 2.0 * sz * a.z, hz0 - hz1));
  let cls = textureLoad(terrainClasses, vec2<i32>(round(q)), layer, 0).r;
  out.colour = tu.palette[min(cls, 15u)].rgb;
  var world = vec3<f32>(a.x + gm.x * a.z, h, a.y + gm.y * a.z);
  if (grid.z > 0.5) { world.y = world.y - a.w; }
  out.world = world;
  out.uv = vec2<f32>(-1.0);
  out.tile = vec4<f32>(0.0);
  out.pos = u.viewProj * vec4<f32>(world, 1.0);
  return out;
}
