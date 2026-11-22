

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

@group(0) @binding(17) var<uniform> bp : BinParams;
@group(0) @binding(18) var<storage, read_write> bins : array<atomic<u32>>;
@group(0) @binding(19) var<storage, read_write> list : array<atomic<u32>>;

fn binHash(x0 : u32) -> u32 {
  var x = x0;
  x ^= x >> 16u; x *= 0x7feb352du; x ^= x >> 15u; x *= 0x846ca68bu; x ^= x >> 16u;
  return x;
}
// Unbiased rounding to the fixed-point grid: a row too light for one step
// still adds its weight on average.
fn binRound(x : f32, h : u32) -> i32 {
  return i32(clamp(floor(x + f32(h & 0xffffffu) / 16777216.0), -2.0e9, 2.0e9));
}
// A 64-bit add from two 32-bit atomics: the carry out of the low word, and the
// sign extension of a negative amount, go into the high word.
fn binAdd(i : u32, q : i32) {
  if (q == 0) { return; }
  let uq = bitcast<u32>(q);
  let old = atomicAdd(&bins[i], uq);
  var hi = select(0u, 0xffffffffu, q < 0);
  if (old + uq < old) { hi = hi + 1u; }
  if (hi != 0u) { atomicAdd(&bins[i + 1u], hi); }
}

// What survives of a row at one texel of the target behind the level, as the
// splat's fragment stage has it: -1 cut (behind terrain), else the dimming.
fn binVisible(at : vec2<f32>, occludeAt : f32) -> f32 {
  let dsz = vec2<i32>(textureDimensions(sceneDepth));
  let dc = clamp(vec2<i32>(at * u.depthCfg.w), vec2<i32>(0), dsz - vec2<i32>(1));
  if (u.occlusionCfg.w > 0.5
      && depthBehind(occludeAt, textureLoad(sceneDepth, dc, 0))
      && !depthBehind(occludeAt, textureLoad(structDepth, dc, 0))) {
    return -1.0;
  }
  var vis = 1.0;
  if (u.depthCfg.x > 0.0) {
    if (depthBehind(occludeAt, textureLoad(sceneDepth, dc, 0))) {
      var walls = 1.0;
      let layers = u.occlusionCfg.z;
      if (layers > 0.5 && depthBehind(occludeAt, textureLoad(depthLayer0, dc, 0))) { walls += 1.0; }
      if (layers > 1.5 && depthBehind(occludeAt, textureLoad(depthLayer1, dc, 0))) { walls += 1.0; }
      if (layers > 2.5 && depthBehind(occludeAt, textureLoad(depthLayer2, dc, 0))) { walls += 1.0; }
      var gain = 1.0 - u.depthCfg.x;
      if (walls > 1.5) { gain = gain * pow(u.occlusionCfg.x, walls - 1.0); }
      vis = max(gain, u.occlusionCfg.y);
    }
  }
  return vis;
}

@compute @workgroup_size(256)
fn csBin(@builtin(global_invocation_id) gid : vec3<u32>, @builtin(num_workgroups) nwg : vec3<u32>) {
  var out : VsOut;
  let sprite = gid.x + gid.y * nwg.x * 256u;
  if (sprite >= bitcast<u32>(u.filterRangeA.x)) { return; }
  let corner = 0u;
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

  var clip = u.viewProj * vec4<f32>(p, 1.0);
  if (reject || fade <= 0.0 || visible <= 0.0 || clip.w <= 0.0) { return; }
  // The rasteriser's depth clip, which drops a whole sprite: all its corners share one depth.
  if (clip.z < 0.0 || clip.z > clip.w) { return; }

  let near = u.depthCfg.y;
  let far = u.depthCfg.z;
  var dzdd = 1.0 / max(1e-9, far - near);
  if ((flags & 1u) != 0u) {
    let dist = max(1e-6, clip.w);
    dzdd = (near * far) / max(1e-9, dist * dist * (far - near));
  }
  let occludeAt = towardCamera(clip.z / clip.w, u.shape.x * dzdd);

  var denom = 1.0;
  if ((flags & 1u) != 0u) { denom = clip.w; }
  let viewport = u.viewportClamp.xy;
  let trueRadius = u.shape.x * u.shape.y / denom * (viewport.y * 0.5);
  var pixRadius = clamp(trueRadius, u.viewportClamp.z, u.viewportClamp.w);
  var w = sgn * fade;
  if ((flags & 256u) != 0u) {
    let ratio = trueRadius / max(1e-6, pixRadius);
    w = w * ratio * ratio;
  }
  // Where the sprite's centre lands, in texels of the target.
  let ndc = clip.xy / clip.w;
  let win = vec2<f32>((ndc.x * 0.5 + 0.5) * viewport.x, (0.5 - ndc.y * 0.5) * viewport.y);

  if (win.x + pixRadius < 0.0 || win.y + pixRadius < 0.0 || win.x - pixRadius > viewport.x || win.y - pixRadius > viewport.y) { return; }

  // Behind the level, at the centre. A sprite whose texels differ in that -
  // across a wall's edge - is partly dimmed by the splat, so it is splatted:
  // the rim is sampled at eight points, which at the radii binned is every
  // edge that matters.
  let big = pixRadius > 16.0;
  let vis = binVisible(win, occludeAt);
  var straddles = false;
  if (!big && (u.occlusionCfg.w > 0.5 || u.depthCfg.x > 0.0)) {
    for (var k = 0u; k < 8u; k++) {
      let a = f32(k) * 0.78539816;
      if (binVisible(win + vec2<f32>(cos(a), sin(a)) * pixRadius * 0.98, occludeAt) != vis) { straddles = true; break; }
    }
  }
  if (big || straddles) {
    // Splatted exactly from the list.
    let slot = u.filterModes.w;
    let at = atomicAdd(&list[slot], 1u);
    if (at < atomicLoad(&list[256u + slot])) {
      atomicStore(&list[512u + u.filterModes.y + at], row);
      return;
    }
    // The list is full: binned, a large one at the largest radius that folds
    // with its heat kept by area, one across an edge as its centre has it.
    if (big) {
      let s = pixRadius / 16.0;
      w = w * s * s;
      pixRadius = 16.0;
    }
  }
  if (vis <= 0.0) { return; }

  let apron = f32(bp.grid.z);
  let g = floor(win) + vec2<f32>(apron);
  if (g.x < 0.0 || g.y < 0.0 || g.x >= f32(bp.grid.x) || g.y >= f32(bp.grid.y)) { return; }
  w = w * visible * vis;

  let cell = u32(g.y) * bp.grid.x + u32(g.x);
  let plane = bp.chan.x;
  // The first rows of a cell exactly: where in it, how heavy, how wide, what colour.
  let nth = atomicAdd(&bins[bp.sparse.x + cell], 1u);
  // Position to a 256th of a texel, weight and radius as halves, and with team
  // colours the colour: two words a slot, three.
  if (nth < bp.sparse.z) {
    let at = bp.sparse.y + (cell * bp.sparse.z + nth) * bp.sparse.w;
    let f = clamp(win - floor(win), vec2<f32>(0.0), vec2<f32>(255.0 / 256.0));
    let light = u32(clamp(out.teamAB.z, 0.0, 1.0) * 65535.0 + 0.5);
    atomicStore(&bins[at], u32(f.x * 256.0) | (u32(f.y * 256.0) << 8u) | (light << 16u));
    // A half tops out at 65504; a heavier row (a value weight) is held there.
    atomicStore(&bins[at + 1u], pack2x16float(vec2<f32>(clamp(w, -65000.0, 65000.0), pixRadius)));
    if (bp.sparse.w > 2u) { atomicStore(&bins[at + 2u], pack2x16float(out.teamAB.xy)); }
  }
  let h = binHash(row * 2654435761u + u.filterModes.z * 40503u + 1u);
  binAdd(cell * 2u, binRound(w * bp.scale.x, h));
  // Where in the cell the weight lies, for the fold's first-moment term.
  let off = win - floor(win) - vec2<f32>(0.5);
  binAdd(plane + cell * 2u, binRound(w * off.x * bp.scale.x, binHash(h + 6u)));
  binAdd(plane * 2u + cell * 2u, binRound(w * off.y * bp.scale.x, binHash(h + 7u)));
  if ((bp.grid.w & 1u) != 0u) {
    binAdd(bp.chan.y * plane + cell * 2u, binRound(abs(w) * pixRadius * bp.scale.y, binHash(h + 1u)));
  }
  if ((bp.grid.w & 2u) != 0u) {
    binAdd(bp.chan.z * plane + cell * 2u, binRound(abs(w) * bp.scale.x, binHash(h + 2u)));
  }
  if ((bp.grid.w & 4u) != 0u) {
    let t = bp.chan.w * plane + cell * 2u;
    binAdd(t, binRound(w * out.teamAB.x * bp.scale.x, binHash(h + 3u)));
    binAdd(t + plane, binRound(w * out.teamAB.y * bp.scale.x, binHash(h + 4u)));
    binAdd(t + plane * 2u, binRound(w * out.teamAB.z * bp.scale.x, binHash(h + 5u)));
  }
}
