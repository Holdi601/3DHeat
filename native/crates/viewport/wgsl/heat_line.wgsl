

fn depthBehind(a : f32, b : f32) -> bool { return a < b; }
fn depthSky(d : f32) -> bool { return d <= 0.0; }
fn depthToDistance(d : f32, n : f32, f : f32, persp : bool) -> f32 {
  if (persp) { return (n * f) / max(1e-30, n + d * (f - n)); }
  return f - d * (f - n);
}
fn towardCamera(d : f32, bias : f32) -> f32 { return d + max(bias, d * 5e-7); }
fn depthError(z : f32, n : f32) -> f32 { return abs(z) * 1e-6; }

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
  // x: 1 when this chunk's rows are filtered by their pass bits (passBits); y-w spare.
  filterModes   : vec4<u32>,
  // Spare: the filters are folded into the pass bits, so any number fit.
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
  // z, w: the weight of a positive row and of a negative one in a signed field
  //       (see sideScales), 1 and 1 unless each side is normalised to its total.
  teamCfg       : vec4<f32>,
  // Line heat: the box segment starts are quantised to - all of the data, not
  // this chunk, since a segment can start in another chunk. w lanes spare.
  lineMin       : vec4<f32>,
  lineSize      : vec4<f32>,
  // Directional heat: x half the wedge's opening (PI: the disc), y the
  // softness of its sides, both radians; z the norm that keeps a wedge's heat
  // its disc's; w 1 for the direction-field pass (see DirectionDraw).
  dirCfg        : vec4<f32>,
  // x: the wedge's heat centroid ahead of the row, fraction of radius.
  // y: slot of the value weight in the packed filter values, negative off; z its scale. w spare.
  dirCfg2       : vec4<f32>,
};

@group(0) @binding(0) var<uniform> u : HeatUniforms;
const TEAM_PAL_COUNT : u32 = 3u;
var<private> TEAM_PAL : array<vec3<f32>, 16> = array<vec3<f32>, 16>(vec3<f32>(0.633081, -0.050381, -0.157431), vec3<f32>(0.628962, 0.173425, 0.106689), vec3<f32>(0.665982, -0.127789, 0.022112), vec3<f32>(0.500276, 0.159695, -0.092602), vec3<f32>(0.500039, 0.031769, -0.181990), vec3<f32>(0.499600, 0.082919, 0.099391), vec3<f32>(0.666403, 0.174624, -0.062976), vec3<f32>(0.666125, 0.023723, 0.132763), vec3<f32>(0.534435, -0.090149, 0.107512), vec3<f32>(0.659281, 0.068486, 0.129925), vec3<f32>(0.599090, -0.055567, -0.119931), vec3<f32>(0.532905, 0.184104, 0.000348), vec3<f32>(0.665982, -0.127789, 0.022112), vec3<f32>(0.499599, 0.093327, -0.159699), vec3<f32>(0.500542, -0.083401, 0.099817), vec3<f32>(0.666728, 0.092297, -0.160173));
var<private> TEAM_PAL_START : array<u32, 3> = array<u32, 3>(0u, 0u, 9u);
var<private> TEAM_PAL_LEN : array<u32, 3> = array<u32, 3>(0u, 9u, 7u);
// One bearing byte a row, four to a word; 255 is "no direction".
@group(0) @binding(16) var<storage, read> dirs : array<u32>;
// The user's volumes, as a filter: see volumes/gpu.ts. A uniform block of its
// own, written once a frame, rather than lanes of the per-chunk ring slot.

struct VolumeUniforms {
  cfg  : vec4<f32>,
  m    : array<vec4<f32>, 24>,
  info : array<vec4<f32>, 8>,
  poly : array<vec4<f32>, 32>,
};
@group(0) @binding(15) var<uniform> vol : VolumeUniforms;

fn volPoint(k : i32) -> vec2<f32> {
  let v = vol.poly[k >> 1u];
  if ((k & 1) == 0) { return v.xy; }
  return v.zw;
}

fn volHolds(i : i32, p : vec3<f32>) -> bool {
  let info = vol.info[i];
  let ph = vec4<f32>(p, 1.0);
  let uy = dot(vol.m[i * 3 + 1], ph);
  let code = i32(info.x + 0.5);
  if (code == 4) {
    if (abs(uy) > 1.0) { return false; }
    let start = i32(info.z + 0.5);
    let n = i32(info.w + 0.5);
    var inside = false;
    var b = volPoint(start + n - 1);
    for (var k = 0; k < n; k = k + 1) {
      let a = volPoint(start + k);
      if ((a.y > p.z) != (b.y > p.z) && p.x < (b.x - a.x) * (p.z - a.y) / (b.y - a.y) + a.x) { inside = !inside; }
      b = a;
    }
    return inside;
  }
  let ux = dot(vol.m[i * 3], ph);
  let uz = dot(vol.m[i * 3 + 2], ph);
  if (code == 1) { return abs(ux) <= 1.0 && abs(uy) <= 1.0 && abs(uz) <= 1.0; }
  if (code == 2) { return ux * ux + uy * uy + uz * uz <= 1.0; }
  return ux * ux + uz * uz <= 1.0 && abs(uy) <= 1.0;
}

fn volSelected(p : vec3<f32>) -> bool {
  let count = min(i32(vol.cfg.y + 0.5), 8);
  var inInclude = false;
  for (var i = 0; i < count; i = i + 1) {
    if (vol.info[i].y > 0.0) {
      if (!inInclude && volHolds(i, p)) { inInclude = true; }
    } else if (volHolds(i, p)) {
      return false;
    }
  }
  return vol.cfg.z < 0.5 || inInclude;
}

fn volKeep(p : vec3<f32>) -> bool {
  if (vol.cfg.x < 0.5) { return true; }
  let sel = volSelected(p);
  if (vol.cfg.x < 1.5) { return sel; }
  return !sel;
}

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
/**
 * Every active filter folded into one bit a row (FILTER_PASS_WGSL), rebuilt
 * when a filter changes: any number of filters cost this one read a row.
 */
@group(0) @binding(6) var<storage, read> passBits : array<u32>;
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
// Where each row's segment starts, quantised to lineMin/lineSize: x | y<<16,
// then z | flags<<16. Flags: 1 a segment, 2 its route starts here, 4 it ends.
@group(0) @binding(14) var<storage, read> lineStarts : array<u32>;

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
  @location(5) teamAB : vec3<f32>,
  @location(6) width : f32,
  /**
   * The row's direction on screen: xy a unit vector in pixels, z how far the
   * sprite is a wedge rather than a disc, w 1 when the row has a direction.
   */
  @location(7) @interpolate(flat) dir : vec4<f32>,
  /** The sprite's drawn radius in pixels, so the wedge's edge can be antialiased by the pixel. */
  @location(8) @interpolate(flat) dirPx : f32,
};

fn passFilters(row : u32) -> bool {
  if (u.filterModes.x == 0u) { return true; }
  return ((passBits[row >> 5u] >> (row & 31u)) & 1u) == 1u;
}

@vertex
fn vsHeat(@builtin(vertex_index) vid : u32) -> VsOut {
  var out : VsOut;
  let sprite = vid / 18u;
  let corner = vid % 18u;
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
  // Inside or outside the volumes, at the row's true height: before the ground
  // projection flattens it.
  if (!volKeep(p)) { reject = true; }
  let flags = u.rowCfg.w;
  if ((flags & 2u) != 0u) { p.y = u.shape2.z; }

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

  if (!passFilters(row)) { reject = true; }

  var sgn = 1.0;
  if ((flags & 4u) != 0u) {
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
    // Each side normalised to its own total, when asked: see sideScales.
    if (sgn > 0.0) { sgn = sgn * u.teamCfg.z; } else { sgn = sgn * u.teamCfg.w; }
  }
  if (u.dirCfg2.y >= 0.0) {
    // Heat weighed by value (render/valueWeight.ts). A row worth nothing draws
    // nothing; a net value carries its sign.
    let w = filterValues[u32(u.dirCfg2.y) * u.filterCfg.x + row] * u.dirCfg2.z;
    if (!(abs(w) > 0.0)) { reject = true; }
    sgn = sgn * w;
  }
  out.sign = sgn;
  out.dir = vec4<f32>(0.0);
  out.dirPx = 1.0;
  var dirQ = 255u;
  if ((flags & 512u) != 0u) { dirQ = (dirs[row >> 2u] >> ((row & 3u) * 8u)) & 0xffu; }
  // The direction field counts only rows that point somewhere.
  if (u.dirCfg.w > 0.5 && dirQ == 255u) { reject = true; }

  // Where this sprite's group sits on the Oklab colour plane.
  //
  // The centre of its slice of the circle, (i + 0.5) / n, not the edge: edges
  // put group 0 at hue 0 and — only when n is even — group n/2 exactly opposite
  // it, so a five-group map and a six-group map would disagree about what
  // "opposite" means. Centres keep the spacing even at every count.
  //
  // Indexed by the raw group id over the total group count, so hiding a group
  // leaves every other group's colour exactly where it was.
  //
  // While the groups fit in the team palette (render/colors.ts TEAM_PALETTES,
  // which one in dirCfg2.w) each takes its own colour, lightness and all, in z.
  var teamAB = vec3<f32>(0.0, 0.0, 0.7);
  let palette = min(u32(max(0.0, u.dirCfg2.w)), TEAM_PAL_COUNT - 1u);
  if ((flags & 128u) != 0u && f32(team) != u.teamCfg.x && max(1u, u32(u.aabbSize.w)) <= TEAM_PAL_LEN[palette]) {
    let c = TEAM_PAL[TEAM_PAL_START[palette] + team % max(1u, u32(u.aabbSize.w))];
    teamAB = vec3<f32>(c.y, c.z, c.x);
  } else if ((flags & 128u) != 0u && f32(team) != u.teamCfg.x) {
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
    teamAB = vec3<f32>(vec2<f32>(cos(hue), sin(hue)) * 0.115, 0.7);
  }
  out.teamAB = teamAB;

  var fade = 1.0;
  if ((flags & 8u) != 0u) {
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

  // ---- the segment from the route's previous sample to this row
  let la = lineStarts[row * 3u];
  let lb = lineStarts[row * 3u + 1u];
  var lineFlags = lb >> 16u;
  if ((lineFlags & 1u) == 0u) { reject = true; }
  var a = u.lineMin.xyz
    + vec3<f32>(f32(la & 0xffffu), f32(la >> 16u), f32(lb & 0xffffu)) * (1.0 / 65535.0) * u.lineSize.xyz;
  if ((flags & 2u) != 0u) { a.y = u.shape2.z; }

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
  if ((flags & 1u) != 0u) {
    let dist = max(1e-6, clip.w);
    dzdd = (near * far) / max(1e-9, dist * dist * (far - near));
  }
  out.occludeAt = towardCamera(clip.z / clip.w, u.shape.x * dzdd);

  // The width at each end is a sprite's radius at that end's distance.
  var denom = 1.0;
  if ((flags & 1u) != 0u) { denom = clip.w; }
  let viewport = u.viewportClamp.xy;
  let trueRadius = u.shape.x * u.shape.y / denom * (viewport.y * 0.5);
  var pixRadius = clamp(trueRadius, u.viewportClamp.z, u.viewportClamp.w);
  var thin = 1.0;
  // A clamped line keeps the heat its true width would carry across it: weighted
  // by the width it lost or gained, the one dimension a line has across, as a
  // point is by area. See HeatUniforms.zoomInvariant.
  // A round cap is a half disc, so its heat goes with its area: dimmed by the
  // width alone, as the body is, a cap drawn wider than the line's true width
  // carried the square of the difference. Routes too short to see from far
  // away are mostly cap, and read several times too hot.
  var capRadius = pixRadius;
  if ((flags & 256u) != 0u) {
    thin = trueRadius / max(1e-6, pixRadius);
    capRadius = trueRadius;
  }
  // Never thinner than two and a half pixels. A line narrower than the pixel grid
  // only touches the pixel centres it happens to pass over and breaks up into
  // beads wherever it runs at an angle; widened, and dimmed by as much, it keeps
  // the heat it carries across and is drawn smoothly.
  if (pixRadius < 2.5) {
    thin = thin * pixRadius / 2.5;
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
  if (quad != 1u) { out.fade = out.fade * capRadius / pixRadius; }
  out.pos = vec4<f32>(clip.xy / clip.w + offset * 2.0 / viewport, clip.z / clip.w, 1.0);
  return out;
}

@fragment
fn fsHeat(in : VsOut) -> @location(0) vec4<f32> {
  let d = length(vec2<f32>(in.local.x, in.local.y / max(in.width, 1e-6)));
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
      && depthBehind(in.occludeAt, textureLoad(sceneDepth, depthCoord, 0))
      && !depthBehind(in.occludeAt, textureLoad(structDepth, depthCoord, 0))) {
    discard;
  }
  if (u.depthCfg.x > 0.0) {
    let coord = depthCoord;
    if (depthBehind(in.occludeAt, textureLoad(sceneDepth, coord, 0))) {
      // Count the surfaces in front, then dim per surface. The first costs
      // depthCfg.x; each one after it costs occlusionCfg.x — two different
      // numbers, because one factor compounded either barely dims a single wall
      // or erases everything behind three. See the WebGL2 shader for the
      // measurements. (No backticks in here: this comment is inside a template
      // literal and one would end the shader source mid-string.)
      var walls = 1.0;
      let layers = u.occlusionCfg.z;
      if (layers > 0.5 && depthBehind(in.occludeAt, textureLoad(depthLayer0, coord, 0))) { walls += 1.0; }
      if (layers > 1.5 && depthBehind(in.occludeAt, textureLoad(depthLayer1, coord, 0))) { walls += 1.0; }
      if (layers > 2.5 && depthBehind(in.occludeAt, textureLoad(depthLayer2, coord, 0))) { walls += 1.0; }
      var gain = 1.0 - u.depthCfg.x;
      if (walls > 1.5) { gain = gain * pow(u.occlusionCfg.x, walls - 1.0); }
      visible = visible * max(gain, u.occlusionCfg.y);
      if (visible <= 0.0) { discard; }
    }
  }
  // Radial ramp: centre intensity at d=0, edge intensity at d=1.
  var t : f32;
  if ((u.rowCfg.w & 64u) != 0u) {
    // Half a texel of inset keeps the ends of the ramp exact under filtering.
    t = textureSample(curveTex, curveSamp, vec2<f32>(mix(0.001953125, 0.998046875, d), 0.5)).r;
  } else {
    t = pow(1.0 - d, u.shape2.x);
    if ((u.rowCfg.w & 32u) != 0u) { t = smoothstep(0.0, 1.0, t); }
  }
  let ramp = mix(u.shape.w, u.shape.z, t);
  var v = ramp * u.shape2.y * in.sign * in.fade * visible;
  // The wedge: the part of the disc facing the row's direction, its angular
  // weight scaled by the norm so it adds what the disc adds (wedgeWeight).
  if (in.dir.z > 0.0 && d > 1e-4) {
    let off = acos(clamp(dot(in.local / d, in.dir.xy), -1.0, 1.0));
    // Never sharper than a pixel where it is: see the GLSL copy.
    let aa = min(0.75 / max(d * in.dirPx, 1e-3), min(u.dirCfg.x, 3.14159265 - u.dirCfg.x));
    let sw = max(u.dirCfg.y, aa);
    let e = clamp((off - (u.dirCfg.x - sw)) / (2.0 * sw), 0.0, 1.0);
    v = v * mix(1.0, (1.0 - e * e * (3.0 - 2.0 * e)) * u.dirCfg.z, in.dir.z);
  }
  if (u.dirCfg.w > 0.5) {
    // The direction field: the row's screen direction weighted by its heat, and
    // the weight, so a cell's mean is a division away.
    let a = abs(v);
    return vec4<f32>(a * in.dir.x, a * in.dir.y, a, 0.0);
  }
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
  if ((u.rowCfg.w & 1024u) != 0u) {
    // The rate map's sums (render/rateMap.ts): the heat, the + side's heat, and
    // the square over the pass's weight, from which the composite counts the rows.
    let a = abs(v);
    return vec4<f32>(a, select(0.0, a, in.sign > 0.0), a * a / max(u.shape2.y, 1e-20), 0.0);
  }
  // And the group's lightness, weighted the same way, in A.
  return vec4<f32>(v, v * in.teamAB.x, v * in.teamAB.y, v * in.teamAB.z);
}
