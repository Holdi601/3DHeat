import { CURVE_U0, CURVE_U1 } from '../../state/curve';
import { TEAM_CHROMA, TEAM_LIGHTNESS } from '../colors';
import { FILTER_MASK_CAPACITY } from '../types';

/**
 * WGSL sources for the WebGPU backend.
 *
 * Two things differ structurally from the WebGL2 shaders, both simplifications.
 * Rows live in storage buffers rather than textures, so a row index is just an
 * array subscript instead of a width-mask and a shift. And uniforms are one
 * struct per pass, with every member padded to a 16-byte boundary — WGSL's
 * uniform layout rules are strict enough that hand-packing `vec3` and scalars is
 * a reliable source of silently wrong values, so nothing here is narrower than a
 * `vec4`.
 */

/** Bit positions in `rowCfg.w`. */
export const FLAG_PERSPECTIVE = 1;
export const FLAG_GROUND_PROJECTED = 2;
export const FLAG_USE_TEAM_SIGN = 4;
export const FLAG_USE_LIFETIME = 8;
export const FLAG_SIGNED_COMPOSITE = 16;
export const FLAG_SMOOTH_RAMP = 32;
export const FLAG_USE_CURVE = 64;
export const FLAG_TEAM_COLORS = 128;

/**
 * Bytes in the heat pass uniform buffer.
 *
 * The `UniformRing` stride has to be at least this, and it is a multiple of
 * `minUniformBufferOffsetAlignment` (256). Spare lanes in existing vec4s get used
 * before a new one is added — distance culling puts its far bound in a
 * `filterCfg` lane for that reason — because each new vec4 risks another 256
 * bytes per draw.
 *
 * 368 covers twenty-three vec4s: sixteen for the original struct plus depth
 * occlusion, the slice slab, the terrain cutoff, the cull plane's view axis and
 * the team palette, none of which fit in a spare lane. The ring's stride rounds
 * this to 512, so there is room for another six floats before it costs anything.
 *
 * 400 since line heat: two more vec4s for the box segment starts are quantised
 * to. Still inside the ring's 512-byte stride.
 */
export const HEAT_UNIFORM_BYTES = 400;

/**
 * The level's atlas, its tiles, and how a fragment reads them: the bindings
 * and functions the peel and mesh shaders share, in one string, because WGSL
 * has no include and the two must read a texel identically - a leaf card's
 * cut-out corner discarded in one and peeled as a wall in the other would
 * dim heat the picture shows in plain view.
 *
 * A vertex's tile number is 0 for a UV that is already an atlas UV; any other
 * number names a repeating texture's rectangle in `tiles` (see
 * `ModelLevel.uvTiles`), looked up once per vertex and handed on flat. The
 * renderer binds a one-entry table when the level has no tiles.
 *
 * `sampleAtlas` wraps a tiled UV - the image's own, 0 to 40 along a brick
 * wall - into its rectangle per pixel, `rect.xy + fract(uv) * rect.zw`, and
 * takes the mip level from the *unwrapped* UV's derivatives scaled to the
 * rectangle. Left to the hardware the derivatives would be those of the
 * wrapped coordinate, which jumps by a whole tile at every seam, and each seam
 * would be drawn at the smallest mip as a line of the image's average colour.
 * The texels a read takes from past the rectangle's edge are the gutter, which
 * for a tile holds its own opposite edge (composeAtlas). A negative width or
 * height clamps that axis instead. It must be called in uniform control flow,
 * before anything can discard.
 */
const ATLAS_WGSL = /* wgsl */ `
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
`;

/**
 * Depth peeling: keep only what is behind the layer already recorded.
 *
 * Run once per layer over the structure geometry with the previous layer's depth
 * texture bound, into a depth-only pass. What survives the discard and wins the
 * depth test is the next surface along each ray, so the heat pass can count how
 * many surfaces stand between a datapoint and the camera instead of only
 * detecting the first.
 *
 * No colour attachment and no fragment output: the pass exists for its depth.
 *
 * A cut-out texel is no surface here either: a leaf card's empty corners,
 * peeled whole, would count as walls in front of whatever stands behind the
 * foliage. So the atlas is read as fsMesh reads it - same group, same bindings,
 * so the renderer's atlas bind group serves both - and the same test applies
 * whenever it has decoded (cfg.w), whether or not the structures are drawn from
 * it: foliage never occludes heat, the shell look included.
 */
export const PEEL_WGSL = /* wgsl */ `
${ATLAS_WGSL}
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
  if (in.pos.z <= prev + u.cfg.z) { discard; }
  if (u.cfg.w > 0.5 && (in.tile.z != 0.0 || in.uv.x >= 0.0) && alpha < 0.5) { discard; }
}
`;

/** Bytes in the peel pass uniform buffer: a mat4 and one vec4. */
export const PEEL_UNIFORM_BYTES = 80;

/** Bytes in the composite pass uniform buffer: four `vec4<f32>`. */
export const COMPOSITE_UNIFORM_BYTES = 64;

const POINT_HEAT_WGSL = /* wgsl */ `
struct HeatUniforms {
  viewProj      : mat4x4<f32>,
  // viewport.xy, pixel clamp min/max
  viewportClamp : vec4<f32>,
  // chunk AABB minimum xyz, then the fraction of a row's life spent fading out.
  // The fade rides in this spare lane rather than a new vec4 — see the note on
  // HEAT_UNIFORM_BYTES about the cost of adding one.
  aabbMin       : vec4<f32>,
  // chunk AABB size xyz, then the number of groups the hue circle is split
  // between. Another spare lane put to work for the same reason as above.
  aabbSize      : vec4<f32>,
  // radius, proj11, centre intensity, edge intensity
  shape         : vec4<f32>,
  // falloff, weight, ground Y, playhead
  shape2        : vec4<f32>,
  // chunk time min, time scale, life scale, default lifetime
  timeCfg       : vec4<f32>,
  // minRow, maxRow, blockShift, flags
  rowCfg        : vec4<u32>,
  filterModes   : vec4<u32>,
  filterRangeA  : vec4<f32>,
  filterRangeB  : vec4<f32>,
  // x: rows per filter slot in the packed filter buffer.
  // y: this chunk's base index in the packed block-start buffer.
  // z: bit pattern of the far distance-cull bound, as f32. Stored here rather
  //    than in a new vec4 because the struct is already one full ring slot.
  // w: difference split mode — 0 by group, 1 by category, 2 by range.
  filterCfg     : vec4<u32>,
  // camera xyz, near distance-cull bound
  camCull       : vec4<f32>,
  // split positive range xy, negative range zw (mode 2 only)
  splitRanges   : vec4<f32>,
  // x: how much a datapoint behind level geometry is suppressed, 0..1
  // y: camera near   z: camera far
  // w: scene-to-heat resolution ratio, for reading the depth texture when the
  //    heat target has been throttled below canvas size
  depthCfg      : vec4<f32>,
  // x: slice axis as a float — 0 x, 1 y, 2 z, negative disables
  // y,z: slab bounds on that axis   w: what survives outside it
  sliceCfg      : vec4<f32>,
  // x: dimming per surface beyond the first — see occlusionExtra in the engine
  // y: least visibility an occluded point keeps, whatever the surface count
  // z: how many peeled depth layers are valid this frame
  // w: 1 to cut points behind the terrain outright — see structDepth
  occlusionCfg  : vec4<f32>,
  // xyz: the unit vector the camera looks along
  // w: 1 to measure the cull distances along it rather than from the eye
  cullPlane     : vec4<f32>,
  // x: the group index that means "no group", or -1. Given no hue at all.
  // y: slice permutation stride, coprime with the group count. 1 = identity.
  // z, w: spare.
  teamCfg       : vec4<f32>,
  // Line heat: the box segment starts are quantised to - all of the data, not
  // this chunk, since a segment can start in another chunk. w lanes spare.
  lineMin       : vec4<f32>,
  lineSize      : vec4<f32>,
};

@group(0) @binding(0) var<uniform> u : HeatUniforms;
// Two u32 per row: x | y<<16, then z | team<<16.
@group(0) @binding(1) var<storage, read> positions : array<u32>;
// One u32 per row: quantised time | lifetime<<16.
@group(0) @binding(2) var<storage, read> times : array<u32>;
@group(0) @binding(3) var<storage, read> blockStarts : array<u32>;
/**
 * Two sign tables end to end, each half the array: per group, then per category
 * of a difference split by column. The groups are read in every split mode, so a
 * hidden group stays hidden however the difference is split.
 */
@group(0) @binding(4) var<storage, read> teamSign : array<f32>;
/**
 * All active filter columns packed end to end, filterCfg.x rows apiece.
 *
 * One binding rather than four because the vertex stage is limited to eight
 * storage buffers and this pass already needs five others. Packing costs a
 * rebuild when the *set* of filtered columns changes, but not when a threshold
 * moves — thresholds are uniforms, which is the case that has to stay free.
 */
@group(0) @binding(5) var<storage, read> filterValues : array<f32>;
// Category allow-masks as a bitset, one FILTER_MASK_CAPACITY-sized run per slot.
@group(0) @binding(6) var<storage, read> filterMask : array<u32>;
/**
 * Baked sprite ramp, centre at u=0 and rim at u=1.
 *
 * A texture rather than an evaluation: solving a Bézier for x needs iteration,
 * and this is the hottest shader in the program. r16float so the interpolation is
 * smooth without 8-bit banding showing up in a large sprite.
 */
@group(0) @binding(7) var curveTex : texture_2d<f32>;
@group(0) @binding(8) var curveSamp : sampler;
/**
 * The depth the scene pass left behind, for hiding datapoints behind geometry.
 *
 * Read with textureLoad rather than sampled: a depth texture needs a
 * non-filtering sampler and integer levels, and there is nothing to interpolate
 * here — the question is what single pixel of the level is in front.
 */
@group(0) @binding(9) var sceneDepth : texture_depth_2d;

/**
 * Successive surfaces behind the nearest one, for counting walls.
 *
 * One comparison against the scene depth answers "is anything in front of this
 * point" and nothing more, so a point behind a single wall and a point four rooms
 * into a building dim identically and a whole interior reads as one faint smear.
 * These hold the 2nd, 3rd and 4th surface along each ray (see PEEL_WGSL), so the
 * count is available and the dimming can compound per surface.
 *
 * Separate bindings rather than a texture array: a depth texture array would have
 * to be one texture with array layers, and each peel pass needs its own layer as
 * a depth *attachment* while sampling the previous one — which a single array
 * texture cannot do without a copy per layer.
 */
@group(0) @binding(10) var depthLayer0 : texture_depth_2d;
@group(0) @binding(11) var depthLayer1 : texture_depth_2d;
@group(0) @binding(12) var depthLayer2 : texture_depth_2d;

/**
 * The nearest structure surface, so terrain can be told from a wall.
 *
 * The scene depth holds the nearest surface of any kind, and that conflation is
 * what left one occlusion control unable to serve both. A wall is looked through
 * on purpose — which corridor, which floor. A hill is not: behind it is the far
 * side of the map, most of the data on a large one, and it arrives with no depth
 * cue to place it and sums along the horizon into a band brighter than anything
 * in the foreground. Turning the dimmer up far enough to suppress that also
 * erases the building interior the dimmer exists to reveal.
 *
 * With this beside the scene depth: an occluder that is not a structure is
 * terrain, and terrain gets a cutoff instead.
 */
@group(0) @binding(13) var structDepth : texture_depth_2d;

const CORNERS = array<vec2<f32>, 6>(
  vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(-1.0, 1.0),
  vec2<f32>( 1.0, -1.0), vec2<f32>(1.0,  1.0), vec2<f32>(-1.0, 1.0)
);

// A sprite is one triangle round its unit circle: three vertices rather than a quad's six,
// and nearly every sprite of a large load is a pixel or two across, where vertices are
// the whole cost. The fragment stage discards past the circle, so the heat is the same.
const SPRITE_CORNERS = array<vec2<f32>, 3>(
  vec2<f32>(0.0, 2.0), vec2<f32>(-1.7320508, -1.0), vec2<f32>(1.7320508, -1.0)
);

// Ids one filter slot's mask holds. Enough for the person filter, whose ids are
// people and can run to tens of thousands; an id past it was never allowed.
const FILTER_MASK_CAPACITY : u32 = ${FILTER_MASK_CAPACITY}u;

/**
 * Reverse the low 16 bits: counting turned into repeated halving.
 *
 * reverse16(0,1,2,3,...) walks 0, ½, ¼, ¾, ⅛, ⅝, … of the range, so each new id
 * lands in the middle of the largest remaining gap. WGSL has reverseBits, but
 * this is written out to stay line-for-line identical with the GLSL copy, where
 * there is no such builtin in ES 3.00 — two spellings of one rule is how the two
 * backends drift apart.
 */
fn reverse16(x : u32) -> u32 {
  var v = x & 0xffffu;
  v = ((v >> 1u) & 0x5555u) | ((v & 0x5555u) << 1u);
  v = ((v >> 2u) & 0x3333u) | ((v & 0x3333u) << 2u);
  v = ((v >> 4u) & 0x0f0fu) | ((v & 0x0f0fu) << 4u);
  v = ((v >> 8u) & 0x00ffu) | ((v & 0x00ffu) << 8u);
  return v & 0xffffu;
}

struct VsOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) local : vec2<f32>,
  @location(1) sign : f32,
  /** How much of this row's contribution survives its lifetime fade, 0..1. */
  @location(2) fade : f32,
  /** How much survives being outside the slice slab, 0..1. */
  @location(3) visible : f32,
  /**
   * Depth this sprite must be in front of to count as visible.
   *
   * In *window depth*, not world distance. Linearising both sides into metres
   * and comparing there does not survive an ordinary near/far pair: at 0.1 and
   * 24000 a wall at 2000 units and a point at 3000 differ by 1.5e-5 in window
   * depth, and expanding that back out turns it into hundreds of metres of
   * error. Window space keeps the difference small but exact, which is how the
   * hardware depth test does the same job.
   */
  @location(4) occludeAt : f32,
  /**
   * This sprite's group as a position on the Oklab colour plane, or (0,0).
   *
   * Two interpolants rather than a lookup table binding, because it is two trig
   * calls from the group index the position buffer already carries and the vertex
   * stage is one storage buffer short of its limit as it is. Flat across the
   * sprite — all six of its vertices produce the same value — so the interpolation
   * is free.
   */
  @location(5) teamAB : vec2<f32>,
};

fn passFilter(slot : u32, row : u32) -> bool {
  let mode = u.filterModes[slot];
  if (mode == 0u) { return true; }
  let v = filterValues[slot * u.filterCfg.x + row];
  if (mode == 1u) {
    // Ranges are packed two per vec4 to keep everything 16-byte aligned.
    var lo : f32;
    var hi : f32;
    if (slot == 0u) { lo = u.filterRangeA.x; hi = u.filterRangeA.y; }
    else if (slot == 1u) { lo = u.filterRangeA.z; hi = u.filterRangeA.w; }
    else if (slot == 2u) { lo = u.filterRangeB.x; hi = u.filterRangeB.y; }
    else { lo = u.filterRangeB.z; hi = u.filterRangeB.w; }
    return v >= lo && v <= hi;
  }
  let category = u32(max(0.0, v));
  if (category >= FILTER_MASK_CAPACITY) { return false; }
  let bitIndex = slot * FILTER_MASK_CAPACITY + category;
  let word = filterMask[bitIndex >> 5u];
  return ((word >> (bitIndex & 31u)) & 1u) == 1u;
}

@vertex
fn vsHeat(@builtin(vertex_index) vid : u32) -> VsOut {
  var out : VsOut;
  let sprite = vid / 3u;
  let corner = vid % 3u;
  let blockShift = u.rowCfg.z;
  let block = sprite >> blockShift;
  let local = sprite & ((1u << blockShift) - 1u);
  // All chunks share one block-start buffer, so each starts at its own base.
  let row = blockStarts[u.filterCfg.y + block] + local;

  // Blocks may overhang the candidate range; collapse the overhang rather than
  // trimming the draw, so vertex-id to row stays a shift and a mask.
  var reject = row < u.rowCfg.x || row >= u.rowCfg.y;

  let packedA = positions[row * 2u];
  let packedB = positions[row * 2u + 1u];
  let qx = f32(packedA & 0xffffu);
  let qy = f32(packedA >> 16u);
  let qz = f32(packedB & 0xffffu);
  let team = packedB >> 16u;

  var p = u.aabbMin.xyz + vec3<f32>(qx, qy, qz) * (1.0 / 65535.0) * u.aabbSize.xyz;
  let flags = u.rowCfg.w;
  if ((flags & ${FLAG_GROUND_PROJECTED}u) != 0u) { p.y = u.shape2.z; }

  // Distance culling. Slices the field to a shell around the camera, which is
  // how you read density inside a building without the roof and the far side of
  // the map summing on top of it.
  let cullNear = u.camCull.w;
  let cullFar = bitcast<f32>(u.filterCfg.z);
  //
  // Along the view axis rather than from the eye when asked, which turns the cut
  // from a sphere into a plane parallel to the screen: it stays put when the
  // camera turns, and leaves a flat face to read rather than a curved one.
  if (cullNear > 0.0 || cullFar > 0.0) {
    var dist = distance(u.camCull.xyz, p);
    if (u.cullPlane.w > 0.5) { dist = dot(p - u.camCull.xyz, u.cullPlane.xyz); }
    if (dist < cullNear) { reject = true; }
    if (cullFar > 0.0 && dist > cullFar) { reject = true; }
  }

  if (!passFilter(0u, row)) { reject = true; }
  if (!passFilter(1u, row)) { reject = true; }
  if (!passFilter(2u, row)) { reject = true; }
  if (!passFilter(3u, row)) { reject = true; }

  var sgn = 1.0;
  if ((flags & ${FLAG_USE_TEAM_SIGN}u) != 0u) {
    // Mode in the low byte, the slot its column landed in above it.
    let splitMode = u.filterCfg.w & 0xffu;
    let splitSlot = u.filterCfg.w >> 8u;
    // Each table is half the buffer. A group past its table still draws.
    let tableSize = arrayLength(&teamSign) / 2u;
    var groupSign = 1.0;
    if (team < tableSize) { groupSign = teamSign[team]; }
    if (splitMode == 0u) {
      sgn = groupSign;
    } else {
      // A split by column takes its sign from the column, but the groups still
      // decide who is drawn: their table then holds 1 shown, 0 hidden, so a
      // group unticked in the Teams list or left out of the group filter stays
      // hidden whichever way the difference is split.
      if (groupSign == 0.0) { reject = true; }
      // The split column rides the same packed per-row buffer the filters use.
      let v = filterValues[splitSlot * u.filterCfg.x + row];
      if (splitMode == 1u) {
        // The categories' signs are the second table. A category id past it
        // belongs to neither side and is rejected.
        let cat = u32(max(0.0, v + 0.5));
        sgn = 0.0;
        if (cat < tableSize) { sgn = teamSign[tableSize + cat]; }
      } else {
        // Rows in neither range are dropped, not counted as zero, so a split over
        // two of five values compares exactly those two.
        sgn = 0.0;
        if (v >= u.splitRanges.x && v <= u.splitRanges.y) { sgn = 1.0; }
        else if (v >= u.splitRanges.z && v <= u.splitRanges.w) { sgn = -1.0; }
      }
    }
    if (sgn == 0.0) { reject = true; }
  }
  out.sign = sgn;

  // Where this sprite's group sits on the Oklab colour plane.
  //
  // The centre of its slice of the circle, (i + 0.5) / n, not the edge: edges
  // put group 0 at hue 0 and — only when n is even — group n/2 exactly opposite
  // it, so a five-group map and a six-group map would disagree about what
  // "opposite" means. Centres keep the spacing even at every count.
  //
  // Indexed by the raw group id over the total group count, so hiding a group
  // leaves every other group's colour exactly where it was.
  var teamAB = vec2<f32>(0.0, 0.0);
  if ((flags & ${FLAG_TEAM_COLORS}u) != 0u && f32(team) != u.teamCfg.x) {
    let groups = max(1u, u32(u.aabbSize.w));
    let n = max(1u, u32(u.teamCfg.y));
    var slice = team % groups;
    if (n < groups) {
      // More groups than there are hues anyone can tell apart, so ids are placed
      // by repeated halving: 0, the far side, the quarter points, the eighths.
      // Reversing the bits of the id *is* that sequence, and it puts ids that are
      // close together — which here means neighbouring landing places — as far
      // apart on the circle as it allows.
      slice = (reverse16(team) * n) >> 16u;
    }
    let hue = (f32(slice) + 0.5) / f32(n) * 6.28318530718;
    teamAB = vec2<f32>(cos(hue), sin(hue)) * ${TEAM_CHROMA};
  }
  out.teamAB = teamAB;

  var fade = 1.0;
  if ((flags & ${FLAG_USE_LIFETIME}u) != 0u) {
    let tl = times[row];
    let rowTime = u.timeCfg.x + f32(tl & 0xffffu) * u.timeCfg.y;
    let lifeQ = tl >> 16u;
    // 65535 marks "this person never appears again", which is a viewing
    // decision rather than a duration, so it must survive quantisation.
    var life = u.timeCfg.w;
    if (lifeQ != 65535u) { life = f32(lifeQ) * u.timeCfg.z; }
    let age = max(0.0, u.shape2.w - rowTime);
    if (age > life) {
      reject = true;
    } else if (u.aabbMin.w > 0.0) {
      // Fade out over the last fraction of the row's life instead of vanishing.
      // A datapoint disappearing between one frame and the next reads as a
      // flicker rather than as a thing ending, and with one sample live per
      // person the whole field flickers at the sample rate.
      var t = 1.0;
      if (life > 0.0) { t = age / life; }
      let start = 1.0 - clamp(u.aabbMin.w, 0.0, 1.0);
      fade = 1.0 - smoothstep(start, 1.0, t);
    }
  }
  out.fade = fade;

  // Outside the slice slab. Tested on the world position, so the same plane
  // cuts the data as cuts the geometry.
  var visible = 1.0;
  if (u.sliceCfg.x >= 0.0) {
    var coord = p.x;
    if (u.sliceCfg.x > 1.5) { coord = p.z; } else if (u.sliceCfg.x > 0.5) { coord = p.y; }
    if (coord < u.sliceCfg.y || coord > u.sliceCfg.z) { visible = visible * u.sliceCfg.w; }
  }
  out.visible = visible;

  var clip = u.viewProj * vec4<f32>(p, 1.0);
  // A fully faded row contributes nothing, so drop it rather than rasterising it.
  if (reject || fade <= 0.0 || visible <= 0.0 || clip.w <= 0.0) {
    out.local = vec2<f32>(0.0);
    out.pos = vec4<f32>(2.0, 2.0, 2.0, 1.0); // outside the clip volume
    out.occludeAt = 0.0;
    return out;
  }

  // Under perspective clip.w is the view-space distance, so the bias — one
  // sprite radius, standing for how far the level's approximation of a surface
  // can be from where the datapoint stood — converts into window units exactly.
  // WebGPU clips depth to [0, 1], so clip.z / clip.w already *is* window depth.
  let near = u.depthCfg.y;
  let far = u.depthCfg.z;
  var dzdd = 1.0 / max(1e-9, far - near);
  if ((flags & ${FLAG_PERSPECTIVE}u) != 0u) {
    let dist = max(1e-6, clip.w);
    dzdd = (near * far) / max(1e-9, dist * dist * (far - near));
  }
  out.occludeAt = clip.z / clip.w - max(u.shape.x * dzdd, 8.0 / 16777216.0);

  // Under perspective clip.w is the view-space depth, so size falls off with
  // distance. Orthographic has no falloff, which is the point of offering it.
  var denom = 1.0;
  if ((flags & ${FLAG_PERSPECTIVE}u) != 0u) { denom = clip.w; }
  let viewport = u.viewportClamp.xy;
  var pixRadius = u.shape.x * u.shape.y / denom * (viewport.y * 0.5);
  pixRadius = clamp(pixRadius, u.viewportClamp.z, u.viewportClamp.w);

  let c = SPRITE_CORNERS[corner];
  out.local = c;
  clip = vec4<f32>(
    clip.xy + c * (pixRadius * 2.0 / viewport) * clip.w,
    clip.z,
    clip.w,
  );
  out.pos = clip;
  return out;
}

@fragment
fn fsHeat(in : VsOut) -> @location(0) vec4<f32> {
  let d = length(in.local);
  if (d > 1.0) { discard; }

  // Behind the level. Per fragment rather than per point, so a sprite straddling
  // a wall's edge is partly hidden rather than all or nothing — and because the
  // heat target can be smaller than the scene, the coordinate is scaled by the
  // ratio between them.
  var visible = in.visible;
  let depthCoord = vec2<i32>(in.pos.xy * u.depthCfg.w);
  // Behind the terrain: something opaque is in front, and it is not a structure.
  //
  // Tested before the wall count and independently of the dimmer, because it is a
  // different question. Cut rather than dimmed: there is no reading of a heatmap
  // in which the far side of a hill is wanted.
  if (u.occlusionCfg.w > 0.5
      && in.occludeAt > textureLoad(sceneDepth, depthCoord, 0)
      && in.occludeAt <= textureLoad(structDepth, depthCoord, 0)) {
    discard;
  }
  if (u.depthCfg.x > 0.0) {
    let coord = depthCoord;
    if (in.occludeAt > textureLoad(sceneDepth, coord, 0)) {
      // Count the surfaces in front, then dim per surface. The first costs
      // depthCfg.x; each one after it costs occlusionCfg.x — two different
      // numbers, because one factor compounded either barely dims a single wall
      // or erases everything behind three. See the WebGL2 shader for the
      // measurements. (No backticks in here: this comment is inside a template
      // literal and one would end the shader source mid-string.)
      var walls = 1.0;
      let layers = u.occlusionCfg.z;
      if (layers > 0.5 && in.occludeAt > textureLoad(depthLayer0, coord, 0)) { walls += 1.0; }
      if (layers > 1.5 && in.occludeAt > textureLoad(depthLayer1, coord, 0)) { walls += 1.0; }
      if (layers > 2.5 && in.occludeAt > textureLoad(depthLayer2, coord, 0)) { walls += 1.0; }
      var gain = 1.0 - u.depthCfg.x;
      if (walls > 1.5) { gain = gain * pow(u.occlusionCfg.x, walls - 1.0); }
      visible = visible * max(gain, u.occlusionCfg.y);
      if (visible <= 0.0) { discard; }
    }
  }
  // Radial ramp: centre intensity at d=0, edge intensity at d=1.
  var t : f32;
  if ((u.rowCfg.w & ${FLAG_USE_CURVE}u) != 0u) {
    // Half a texel of inset keeps the ends of the ramp exact under filtering.
    t = textureSample(curveTex, curveSamp, vec2<f32>(mix(${CURVE_U0}, ${CURVE_U1}, d), 0.5)).r;
  } else {
    t = pow(1.0 - d, u.shape2.x);
    if ((u.rowCfg.w & ${FLAG_SMOOTH_RAMP}u) != 0u) { t = smoothstep(0.0, 1.0, t); }
  }
  let ramp = mix(u.shape.w, u.shape.z, t);
  let v = ramp * u.shape2.y * in.sign * in.fade * visible;
  // Density in R, and the group's colour *weighted by that density* in G and B.
  //
  // Weighted, because what the composite wants is the mean group colour at the
  // pixel and a mean is a weighted sum over the sum of the weights. Accumulating
  // the colours unweighted would let a sprite's faint rim count as much as
  // another's centre, and a pixel's hue would then depend on how many sprites
  // grazed it rather than on how much of each group is actually there.
  //
  // Three of the four channels are written even when the target is
  // single-channel, in which case G and B are discarded — the same shader serves
  // both, and only the pipeline's target format differs.
  return vec4<f32>(v, v * in.teamAB.x, v * in.teamAB.y, 0.0);
}
`;

/** Replace `from` with `to` in `src`, exactly once, or fail loudly at load. */
function swapOnce(src: string, from: string, to: string, what: string): string {
  const at = src.indexOf(from);
  if (at < 0 || src.indexOf(from, at + 1) >= 0) throw new Error(`line heat shader: ${what} not found once`);
  return src.slice(0, at) + to + src.slice(at + from.length);
}

/**
 * Line heat: the point splat, with each row drawn as the segment from the
 * previous sample of its route instead of as a disc.
 *
 * Derived from the point shader rather than written beside it, so the filters,
 * the sign, the group colour, the lifetime fade, the slice and the fragment
 * stage - the falloff curve included - are the same code in both. Only how a
 * row turns into triangles differs: eighteen vertices instead of six, a round
 * cap at the route's start, a body as wide as a sprite with the falloff across
 * it, and a round cap at the route's end. The body's `local` is (0, across), so
 * the fragment stage's radial falloff becomes a lateral one with no change.
 *
 * Caps only where a route begins or ends: at a joint between two segments a cap
 * on each would lay a full disc of extra heat on every sample, beading the line.
 * Without them a straight run of segments tiles exactly; a bend leaves a sliver
 * on its outside and a sliver of overlap inside, which at the sample spacing of
 * any recorded movement is narrower than a pixel.
 */
function lineHeatWgsl(): string {
  let s = POINT_HEAT_WGSL;
  s = swapOnce(
    s,
    '@group(0) @binding(13) var structDepth : texture_depth_2d;',
    `@group(0) @binding(13) var structDepth : texture_depth_2d;
// Where each row's segment starts, quantised to lineMin/lineSize: x | y<<16,
// then z | flags<<16. Flags: 1 a segment, 2 its route starts here, 4 it ends.
@group(0) @binding(14) var<storage, read> lineStarts : array<u32>;`,
    'binding 13',
  );
  s = swapOnce(s, 'let sprite = vid / 3u;\n  let corner = vid % 3u;', 'let sprite = vid / 18u;\n  let corner = vid % 18u;', 'vertex split');
  // The half-width at each end, so the fragment can turn the across offset -
  // carried in pixels - into the falloff's 0..1. A ratio of two interpolants
  // rather than one interpolated ratio: the body is a trapezoid wherever its
  // ends are at different depths, and only the pixel offset and the width are
  // affine across it.
  s = swapOnce(s, '  @location(5) teamAB : vec2<f32>,\n};', '  @location(5) teamAB : vec2<f32>,\n  @location(6) width : f32,\n};', 'varyings');
  s = swapOnce(s, '  let d = length(in.local);', '  let d = length(vec2<f32>(in.local.x, in.local.y / max(in.width, 1e-6)));', 'fragment distance');
  const tailFrom = s.indexOf('  var clip = u.viewProj * vec4<f32>(p, 1.0);');
  const tailTo = s.indexOf('@fragment');
  if (tailFrom < 0 || tailTo < tailFrom) throw new Error('line heat shader: splat tail not found');
  const tail = /* wgsl */ `  // ---- the segment from the route's previous sample to this row
  let la = lineStarts[row * 3u];
  let lb = lineStarts[row * 3u + 1u];
  var lineFlags = lb >> 16u;
  if ((lineFlags & 1u) == 0u) { reject = true; }
  var a = u.lineMin.xyz
    + vec3<f32>(f32(la & 0xffffu), f32(la >> 16u), f32(lb & 0xffffu)) * (1.0 / 65535.0) * u.lineSize.xyz;
  if ((flags & ${FLAG_GROUND_PROJECTED}u) != 0u) { a.y = u.shape2.z; }

  // ---- playback: a head moving between samples, and a tail that fades.
  // lineSize.w is how many seconds the tail lasts (0: not playing back), and
  // lineMin.w the playhead. A segment the playhead is inside of is drawn to
  // where the person is now, interpolated, with a round end - the moving point.
  var fadeA = 1.0;
  var fadeB = 1.0;
  let trail = u.lineSize.w;
  if (trail > 0.0) {
    let now = u.lineMin.w;
    let tB = u.timeCfg.x + f32(times[row] & 0xffffu) * u.timeCfg.y;
    let seconds = bitcast<f32>(lineStarts[row * 3u + 2u]);
    let tA = tB - seconds;
    if (tA >= now) { reject = true; }
    var tEnd = tB;
    if (tB > now && seconds > 0.0) {
      p = mix(a, p, clamp((now - tA) / seconds, 0.0, 1.0));
      tEnd = now;
      lineFlags = lineFlags | 4u;
    }
    fadeA = clamp(1.0 - (now - tA) / trail, 0.0, 1.0);
    fadeB = clamp(1.0 - (now - tEnd) / trail, 0.0, 1.0);
    if (fadeA <= 0.0 && fadeB <= 0.0) { reject = true; }
  }
  var clipA = u.viewProj * vec4<f32>(a, 1.0);
  var clipB = u.viewProj * vec4<f32>(p, 1.0);

  // Clipped against the near plane in clip space, so a segment running past the
  // camera keeps the part in front instead of flipping through infinity. A
  // point sprite only has to be dropped there; a line has to be cut.
  let wMin = max(1e-6, u.depthCfg.y);
  out.width = 1.0;
  if (reject || fade <= 0.0 || visible <= 0.0 || (clipA.w < wMin && clipB.w < wMin)) {
    out.local = vec2<f32>(0.0);
    out.pos = vec4<f32>(2.0, 2.0, 2.0, 1.0);
    out.occludeAt = 0.0;
    return out;
  }
  if (clipA.w < wMin) { clipA = mix(clipA, clipB, (wMin - clipA.w) / (clipB.w - clipA.w)); }
  if (clipB.w < wMin) { clipB = mix(clipB, clipA, (wMin - clipB.w) / (clipA.w - clipB.w)); }

  // Which of the three quads, which of its corners, and at which end.
  let quad = corner / 6u;
  let c = CORNERS[corner % 6u];
  let second = c.x > 0.0;
  var atB = false;
  var along = 0.0;
  var capped = true;
  if (quad == 0u) {
    along = select(-1.0, 0.0, second);
    capped = (lineFlags & 2u) != 0u;
  } else if (quad == 1u) {
    atB = second;
  } else {
    atB = true;
    along = select(0.0, 1.0, second);
    capped = (lineFlags & 4u) != 0u;
  }
  if (!capped) {
    out.local = vec2<f32>(0.0);
    out.pos = vec4<f32>(2.0, 2.0, 2.0, 1.0);
    out.occludeAt = 0.0;
    return out;
  }
  var clip = clipA;
  if (atB) { clip = clipB; }

  let near = u.depthCfg.y;
  let far = u.depthCfg.z;
  var dzdd = 1.0 / max(1e-9, far - near);
  if ((flags & ${FLAG_PERSPECTIVE}u) != 0u) {
    let dist = max(1e-6, clip.w);
    dzdd = (near * far) / max(1e-9, dist * dist * (far - near));
  }
  out.occludeAt = clip.z / clip.w - max(u.shape.x * dzdd, 8.0 / 16777216.0);

  // The width at each end is a sprite's radius at that end's distance.
  var denom = 1.0;
  if ((flags & ${FLAG_PERSPECTIVE}u) != 0u) { denom = clip.w; }
  let viewport = u.viewportClamp.xy;
  var pixRadius = u.shape.x * u.shape.y / denom * (viewport.y * 0.5);
  pixRadius = clamp(pixRadius, u.viewportClamp.z, u.viewportClamp.w);
  // Never thinner than two and a half pixels. A line narrower than the pixel grid
  // only touches the pixel centres it happens to pass over and breaks up into
  // beads wherever it runs at an angle; widened, and dimmed by as much, it keeps
  // the heat it carries across and is drawn smoothly.
  var thin = 1.0;
  if (pixRadius < 2.5) {
    thin = pixRadius / 2.5;
    pixRadius = 2.5;
  }
  fadeA = fadeA * thin;
  fadeB = fadeB * thin;

  // Along and across the segment on screen, in pixels.
  let sa = clipA.xy / clipA.w * viewport * 0.5;
  let sb = clipB.xy / clipB.w * viewport * 0.5;
  var dir = sb - sa;
  let len = length(dir);
  if (len < 1e-4) { dir = vec2<f32>(1.0, 0.0); } else { dir = dir / len; }
  let across = vec2<f32>(-dir.y, dir.x);
  let offset = (dir * along + across * c.y) * pixRadius;

  // Divided through by w here, so the rasteriser interpolates linearly on
  // screen. The quad is built on screen; interpolated with perspective, the
  // falloff across it would wander from the centre line wherever the segment
  // runs into the depth, and come out as a bright bead at every sample.
  out.local = vec2<f32>(along, c.y * pixRadius);
  out.width = pixRadius;
  // The tail's fade, per end, so it runs down the segment.
  if (atB) { out.fade = fade * fadeB; } else { out.fade = fade * fadeA; }
  out.pos = vec4<f32>(clip.xy / clip.w + offset * 2.0 / viewport, clip.z / clip.w, 1.0);
  return out;
}

`;
  return s.slice(0, tailFrom) + tail + s.slice(tailTo);
}

export const HEAT_WGSL = POINT_HEAT_WGSL;
export const LINE_HEAT_WGSL = lineHeatWgsl();

/** Fullscreen triangle, shared by the composite and decay passes. */
const FULLSCREEN_VS = /* wgsl */ `
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
`;

export const COMPOSITE_WGSL = /* wgsl */ `
${FULLSCREEN_VS}

struct CompositeUniforms {
  // 1/frames, saturation, signed flag, response curve (0 linear, 1 sat, 2 log)
  cfg : vec4<f32>,
  // floor, dof max blur px, dof focus distance, dof aperture
  cfg2 : vec4<f32>,
  // near, far, texel width, texel height
  cfg3 : vec4<f32>,
  // perspective depth flag, team-colour flag, chroma boost, unused
  cfg4 : vec4<f32>,
};

@group(0) @binding(0) var<uniform> u : CompositeUniforms;
@group(0) @binding(1) var sceneTex : texture_2d<f32>;
@group(0) @binding(2) var heatTex : texture_2d<f32>;
@group(0) @binding(3) var lutTex : texture_2d<f32>;
@group(0) @binding(4) var samp : sampler;
@group(0) @binding(5) var depthTex : texture_depth_2d;

/** Depth sample -> distance from the camera along the view axis. */
fn viewDistance(depth : f32) -> f32 {
  let n = u.cfg3.x;
  let f = u.cfg3.y;
  if (u.cfg4.x > 0.5) {
    // WebGPU depth is already 0..1, and the projection was remapped to match, so
    // this is the standard reverse of a perspective divide on that range.
    return (n * f) / max(1e-6, f - depth * (f - n));
  }
  return mix(n, f, depth);
}

// Blur radius in pixels for a pixel at distance dist from the camera.
fn circleOfConfusion(dist : f32) -> f32 {
  let focus = max(1e-3, u.cfg2.z);
  let band = max(1e-4, focus * u.cfg2.w);
  return u.cfg2.y * clamp(abs(dist - focus) / band, 0.0, 1.0);
}

/**
 * Gather-blur the scene by its own circle of confusion.
 *
 * Taps sit on a golden-angle spiral, which covers a disc far more evenly than a
 * grid at this few samples. Each tap is weighted by whether *its* blur circle
 * reaches the centre pixel, which is what stops a sharp foreground from being
 * smeared outward by the blurry background behind it.
 */
fn sceneWithDof(uv : vec2<f32>) -> vec3<f32> {
  let texel = u.cfg3.zw;
  // Depth is read with integer fetches rather than sampled. Interpolating depth
  // across a silhouette produces a distance that exists nowhere in the scene, and
  // WGSL only accepts an integer mip level for a depth texture anyway.
  let dims = vec2<f32>(textureDimensions(depthTex));
  let centre = vec2<i32>(uv * dims);
  let maxPx = vec2<i32>(dims) - vec2<i32>(1, 1);
  let centreCoc = circleOfConfusion(viewDistance(textureLoad(depthTex, centre, 0)));
  // textureSampleLevel rather than textureSample: the early return below makes
  // this non-uniform control flow, and an implicit-derivative sample is only
  // allowed in uniform control flow. Naming the level explicitly sidesteps it.
  var sum = textureSampleLevel(sceneTex, samp, uv, 0.0).rgb;
  var weight = 1.0;
  if (centreCoc < 1.0) { return sum; }

  let TAPS = 24;
  let GOLDEN = 2.39996323;
  for (var i = 0; i < TAPS; i = i + 1) {
    let fi = f32(i) + 0.5;
    // sqrt for equal-area spacing: without it the taps bunch at the centre.
    let r = sqrt(fi / f32(TAPS)) * centreCoc;
    let a = fi * GOLDEN;
    let offset = vec2<f32>(cos(a), sin(a)) * r;
    let tapUv = uv + offset * texel;
    let tapPx = clamp(centre + vec2<i32>(offset), vec2<i32>(0, 0), maxPx);
    let tapCoc = circleOfConfusion(viewDistance(textureLoad(depthTex, tapPx, 0)));
    let w = clamp(tapCoc - r + 1.0, 0.0, 1.0);
    sum = sum + textureSampleLevel(sceneTex, samp, tapUv, 0.0).rgb * w;
    weight = weight + w;
  }
  return sum / max(1e-4, weight);
}

/**
 * Oklab to sRGB, Björn Ottosson's matrices plus the transfer function.
 *
 * A copy of oklabToRgb in colors.ts, and the two are tested against each other
 * through the headless probe rather than trusted to stay in step: the matrices are
 * twelve hand-typed constants and one wrong sign produces a picture that looks
 * like a plausible palette rather than like a bug. (One of them, the blue row's
 * -0.0041960863, was wrong here in an earlier draft and only the round trip
 * caught it.)
 */
fn oklabToSrgb(L : f32, a : f32, b : f32) -> vec3<f32> {
  let l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  let m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  let s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  let l = l_ * l_ * l_;
  let m = m_ * m_ * m_;
  let s = s_ * s_ * s_;
  let lin = clamp(vec3<f32>(
     4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ), vec3<f32>(0.0), vec3<f32>(1.0));
  // Per-channel clamp rather than a gamut-preserving projection. It shifts the
  // hue of a boosted mixture that leaves sRGB, which is a real inaccuracy, but the
  // alternative costs a search per pixel and the boost is a legibility control
  // being dragged by hand — it is looked at, not measured.
  return select(
    1.055 * pow(lin, vec3<f32>(1.0 / 2.4)) - 0.055,
    lin * 12.92,
    lin <= vec3<f32>(0.0031308),
  );
}

@fragment
fn fsComposite(in : FsOut) -> @location(0) vec4<f32> {
  // Heat is deliberately not blurred: it is the sum of sprites at many depths, so
  // it has no single depth to be out of focus at, and blurring it by whatever
  // geometry happens to sit behind it would be wrong wherever it floats in front.
  var scene : vec3<f32>;
  if (u.cfg2.y > 0.0) {
    scene = sceneWithDof(in.uv);
  } else {
    scene = textureSample(sceneTex, samp, in.uv).rgb;
  }
  let hv = textureSample(heatTex, samp, in.uv);
  let h = hv.r * u.cfg.x;
  let k = abs(h) / max(u.cfg.y, 1e-6);
  var t = k;
  if (u.cfg.w > 1.5) {
    // Log. Compresses a long tail so one extreme hotspot stops flattening
    // everything else to the bottom of the ramp.
    t = log2(1.0 + k * 7.0) / 3.0;
  } else if (u.cfg.w > 0.5) {
    // Saturating. Reproduces the feel of accumulating with alpha-over blending,
    // where each layer covers only a fraction of what is left, so a hotspot
    // approaches the top of the ramp without a hard clip.
    t = 1.0 - exp(-k);
  }
  t = clamp(t, 0.0, 1.0);
  // Lift anything that carries heat at all up to the floor, so one datapoint is
  // visible rather than sitting a hair above transparent. The threshold keeps
  // genuinely empty pixels empty; without it the floor would flood the frame.
  if (u.cfg2.x > 0.0 && k > 1e-4) { t = mix(u.cfg2.x, 1.0, t); }
  // Two-row LUT: row 0 positive, row 1 negative. Sample at the row centres.
  var row = 0.25;
  if (u.cfg.z > 0.5 && h < 0.0) { row = 0.75; }
  let c = textureSample(lutTex, samp, vec2<f32>(t, row));
  var rgb = c.rgb;
  if (u.cfg4.y > 0.5) {
    // The mixture: the density-weighted mean of the groups present, recovered by
    // dividing the weighted sum in G,B by the weight in R.
    //
    // Dividing by the accumulated weight rather than by anything derived from
    // the ramp is what makes the hue independent of how much data is here — so a
    // group's colour does not drift as more of its own samples land, and every
    // control that shapes density (the response curve, the saturation point, the
    // floor, the sprite ramp) goes on acting on t alone and keeps working
    // unchanged. Hue and density are carried on separate axes on purpose.
    //
    // The frame gain cancels in the ratio, so it is left out of both sides.
    let w = max(abs(hv.r), 1e-6);
    let ab = vec2<f32>(hv.g, hv.b) / w * max(0.0, u.cfg4.z);
    rgb = oklabToSrgb(${TEAM_LIGHTNESS}, ab.x, ab.y);
  }
  // Alpha still comes from the LUT even in team mode, which is the whole reason
  // the two axes were separated: transparent where there is nothing, opaque at
  // the top of the ramp, with the colour saying who rather than how much.
  return vec4<f32>(mix(scene, rgb, c.a), 1.0);
}
`;

/**
 * Multiplies the heat buffer by a constant: the decay half of the EMA.
 * Achieved with blend factors src=zero, dst=src, i.e. result = dst * src.
 */
export const DECAY_WGSL = /* wgsl */ `
${FULLSCREEN_VS}

struct DecayUniforms { cfg : vec4<f32>, };
@group(0) @binding(0) var<uniform> u : DecayUniforms;

@fragment
fn fsDecay(in : FsOut) -> @location(0) vec4<f32> {
  _ = in.uv;
  return vec4<f32>(u.cfg.x);
}
`;

/**
 * Adds a scaled copy of one heat target into another.
 *
 * The second half of merging a frame: the accumulator is scaled by `1 - alpha`
 * first, then this adds `alpha` of the frame just rendered. One multiply and one
 * add per pixel, so the arithmetic no longer degrades as more frames merge.
 */
export const MERGE_WGSL = /* wgsl */ `
${FULLSCREEN_VS}

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
`;

export const LINE_WGSL = /* wgsl */ `
struct SceneUniforms {
  viewProj : mat4x4<f32>,
  // camera xyz, unused
  camera   : vec4<f32>,
  // fade start, fade end, size/length, brightness
  cfg      : vec4<f32>,
};
@group(0) @binding(0) var<uniform> u : SceneUniforms;

struct LineOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) colour : vec4<f32>,
  @location(1) world : vec3<f32>,
};

@vertex
fn vsLine(
  @location(0) position : vec3<f32>,
  @location(1) colour : vec4<f32>,
) -> LineOut {
  var out : LineOut;
  out.colour = colour;
  out.world = position;
  out.pos = u.viewProj * vec4<f32>(position, 1.0);
  return out;
}

@fragment
fn fsLine(in : LineOut) -> @location(0) vec4<f32> {
  let d = distance(in.world, u.camera.xyz);
  let fade = 1.0 - smoothstep(u.cfg.x, u.cfg.y, d);
  if (fade <= 0.001) { discard; }
  return vec4<f32>(in.colour.rgb, in.colour.a * fade);
}
`;

export const CUBE_WGSL = /* wgsl */ `
struct SceneUniforms {
  viewProj : mat4x4<f32>,
  camera   : vec4<f32>,
  cfg      : vec4<f32>,
};
@group(0) @binding(0) var<uniform> u : SceneUniforms;

struct CubeOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) normal : vec3<f32>,
  @location(1) colour : vec3<f32>,
};

@vertex
fn vsCube(
  @location(0) localPos : vec3<f32>,
  @location(1) localNormal : vec3<f32>,
  @location(2) centre : vec3<f32>,
  @location(3) colour : vec3<f32>,
  @location(4) orient : vec2<f32>,
) -> CubeOut {
  var out : CubeOut;
  let cy = cos(orient.x);
  let sy = sin(orient.x);
  let cp = cos(orient.y);
  let sp = sin(orient.y);
  // Yaw about world Y, then pitch about the rotated X.
  let ry = mat3x3<f32>(cy, 0.0, -sy, 0.0, 1.0, 0.0, sy, 0.0, cy);
  let rx = mat3x3<f32>(1.0, 0.0, 0.0, 0.0, cp, sp, 0.0, -sp, cp);
  let rot = ry * rx;
  let world = centre + rot * (localPos * u.cfg.z);
  out.normal = rot * localNormal;
  out.colour = colour;
  out.pos = u.viewProj * vec4<f32>(world, 1.0);
  return out;
}

@fragment
fn fsCube(in : CubeOut) -> @location(0) vec4<f32> {
  let n = normalize(in.normal);
  // Two fixed lights plus ambient: enough to read orientation without making
  // the data look like a lit game scene.
  let key = max(0.0, dot(n, normalize(vec3<f32>(0.45, 0.8, 0.35))));
  let fill = max(0.0, dot(n, normalize(vec3<f32>(-0.5, 0.2, -0.6))));
  let lum = 0.34 + 0.62 * key + 0.18 * fill;
  return vec4<f32>(in.colour * lum, 1.0);
}
`;

export const LOOK_WGSL = /* wgsl */ `
struct SceneUniforms {
  viewProj : mat4x4<f32>,
  camera   : vec4<f32>,
  cfg      : vec4<f32>,
};
@group(0) @binding(0) var<uniform> u : SceneUniforms;

struct LookOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) colour : vec4<f32>,
};

@vertex
fn vsLook(
  @location(0) t : f32,
  @location(1) centre : vec3<f32>,
  @location(2) colour : vec3<f32>,
  @location(3) orient : vec2<f32>,
) -> LookOut {
  var out : LookOut;
  let cy = cos(orient.x);
  let sy = sin(orient.x);
  let cp = cos(orient.y);
  let sp = sin(orient.y);
  let dir = vec3<f32>(sy * cp, sp, -cy * cp);
  out.colour = vec4<f32>(mix(vec3<f32>(1.0), colour, 0.35), mix(0.95, 0.0, t));
  out.pos = u.viewProj * vec4<f32>(centre + dir * (t * u.cfg.z), 1.0);
  return out;
}

@fragment
fn fsLook(in : LookOut) -> @location(0) vec4<f32> {
  return in.colour;
}
`;

export const MAP_WGSL = /* wgsl */ `
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
`;

/**
 * Level surfaces, in two looks selected by `tint.w`.
 *
 * Ground is flat grey: it is context, and colour in it would be read as data.
 * Structures get a Fresnel rim instead — bright where a surface turns away from
 * the viewer, nearly invisible face-on — which is what makes a building read as
 * a transparent shell you can see the heat inside, rather than a foggy box.
 */
export const MESH_WGSL = /* wgsl */ `
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
${ATLAS_WGSL}

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
`;

/** Structure wireframe: constant tint, no shading, so edges stay crisp. */
export const WIRE_WGSL = /* wgsl */ `
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
`;

