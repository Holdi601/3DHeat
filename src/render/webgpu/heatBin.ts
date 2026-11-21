/**
 * Compute-binning heat: one atomic add per row into a screen-space grid, then
 * one pass that folds the sprite's kernel over the grid.
 *
 * Splatting costs every row a triangle and every texel it covers a fragment, so
 * it tops out near 2e9 rows a second at a pixel or two and far lower with large
 * sprites. Binning costs a row a few atomics whatever its size, and the fold
 * costs the grid's texels times the kernel's footprint whatever the row count:
 * twenty to forty times the rows per frame on the same GPU (see
 * docs/heat-binning.md for the measurements).
 *
 * What the splat does per row is kept exactly: the bin shader is the splat's
 * vertex shader, derived from its text (`binWgsl`), so filters, groups, the
 * split and its sides, value weights, lifetime fades, the slice, volumes,
 * culling, clamps and the zoom-invariant weight are the same code. What differs:
 *
 * - The kernel is applied per grid cell, not per row. The fold uses the
 *   kernel averaged over a cell (`K_eff`, built by `LUT_WGSL`), which is the
 *   expected splat of a row anywhere in the cell, so the converged field is the
 *   splat's and not one shifted to cell centres.
 * - Under perspective each row's radius differs. A cell keeps the weighted mean
 *   radius of its rows; rows in one cell are at nearly one depth, so this is
 *   the splat's radius except where near and far rows share a texel.
 * - Occlusion is tested at the row's centre rather than per fragment. A sprite
 *   straddling a wall's edge is then all in front or all behind instead of
 *   partly; at the radii binning takes (`BIN_RMAX` texels at most) that is a
 *   sliver along depth edges.
 * - Rows larger than `BIN_RMAX` texels go to a list and are splatted exactly,
 *   in the same pass (`listHeatWgsl`). A list that overflows bins its rest at
 *   `BIN_RMAX` with their heat kept by area.
 *
 * Line heat, directional wedges, the direction field and the rate map stay on
 * the splat path: their kernels are not one radial function of distance.
 */
import { CURVE_U0, CURVE_U1 } from '../../state/curve';
import { TEAM_LIGHTNESS } from '../colors';
import { FLAG_CONSERVE, FLAG_HAS_DIRS, FLAG_PERSPECTIVE, FLAG_SMOOTH_RAMP, FLAG_TEAM_COLORS, FLAG_USE_CURVE, HEAT_WGSL } from './shaders';

/** Largest sprite radius, in heat texels, that is binned; larger ones are splatted from a list. */
export const BIN_RMAX = 16;
/** Cells round the target, so a row just off screen still adds its rim. */
export const BIN_APRON = BIN_RMAX + 1;
/** Radius step of the kernel table, texels. */
const LUT_STEP = 0.125;
const LUT_LEVELS = BIN_RMAX / LUT_STEP + 2;
/** Offsets 0..BIN_RMAX on each axis. */
const LUT_SIDE = BIN_RMAX + 1;
/** Tile of the radius bound, texels. */
const TILE = 16;
/** Fixed-point scales: a row's weight, and weight times radius. */
const SCALE_W = 65536;
const SCALE_R = 2048;
/** Plan entries (chunks in one frame) the list can serve. */
export const BIN_SLOTS = 256;
/** Words before the list's rows: counters, then capacities. */
const LIST_HEAD = BIN_SLOTS * 2;
/** Rows the list holds across a frame. */
export const BIN_LIST_ROWS = 4 * 1024 * 1024;

/**
 * Rows a cell keeps exactly. A cell holding no more than this many is folded
 * from their own positions and radii, as the splat would draw them; only a
 * fuller cell uses its sums through the averaged kernel. A sparse field - the
 * rim of the data, one sample a person - is then the splat's to the texel.
 */
export const BIN_SPARSE = 8;

/** Bits of `BinParams.grid.w`. */
const BIN_RADIUS = 1;
const BIN_ABS = 2;
const BIN_TEAM = 4;

/** Replace `from` with `to` in `src`, exactly once, or fail loudly at load. */
function swapOnce(src: string, from: string, to: string, what: string): string {
  const at = src.indexOf(from);
  if (at < 0 || src.indexOf(from, at + 1) >= 0) throw new Error(`heat bin shader: ${what} not found once`);
  return src.slice(0, at) + to + src.slice(at + from.length);
}

const PARAMS_WGSL = /* wgsl */ `
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
`;

const VS_HEAD = '@vertex\nfn vsHeat(@builtin(vertex_index) vid : u32) -> VsOut {\n  var out : VsOut;\n  let sprite = vid / 3u;\n  let corner = vid % 3u;';

/**
 * The bin pass: the splat's vertex shader up to where it would place the
 * sprite, then the row's weight into its cell.
 */
export function binWgsl(): string {
  let s = HEAT_WGSL;
  s = swapOnce(
    s,
    VS_HEAD,
    `${PARAMS_WGSL}
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
  let corner = 0u;`,
    'vertex head',
  );
  // Never bound here: binning is not used while rows carry a direction.
  s = swapOnce(
    s,
    `if ((flags & ${FLAG_HAS_DIRS}u) != 0u) { dirQ = (dirs[row >> 2u] >> ((row & 3u) * 8u)) & 0xffu; }`,
    '',
    'direction read',
  );
  const tailFrom = s.indexOf('  var clip = u.viewProj * vec4<f32>(p, 1.0);');
  if (tailFrom < 0) throw new Error('heat bin shader: splat tail not found');
  const tail = /* wgsl */ `  var clip = u.viewProj * vec4<f32>(p, 1.0);
  if (reject || fade <= 0.0 || visible <= 0.0 || clip.w <= 0.0) { return; }
  // The rasteriser's depth clip, which drops a whole sprite: all its corners share one depth.
  if (clip.z < 0.0 || clip.z > clip.w) { return; }

  let near = u.depthCfg.y;
  let far = u.depthCfg.z;
  var dzdd = 1.0 / max(1e-9, far - near);
  if ((flags & ${FLAG_PERSPECTIVE}u) != 0u) {
    let dist = max(1e-6, clip.w);
    dzdd = (near * far) / max(1e-9, dist * dist * (far - near));
  }
  let occludeAt = towardCamera(clip.z / clip.w, u.shape.x * dzdd);

  var denom = 1.0;
  if ((flags & ${FLAG_PERSPECTIVE}u) != 0u) { denom = clip.w; }
  let viewport = u.viewportClamp.xy;
  let trueRadius = u.shape.x * u.shape.y / denom * (viewport.y * 0.5);
  var pixRadius = clamp(trueRadius, u.viewportClamp.z, u.viewportClamp.w);
  var w = sgn * fade;
  if ((flags & ${FLAG_CONSERVE}u) != 0u) {
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
  let big = pixRadius > ${BIN_RMAX.toFixed(1)};
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
    if (at < atomicLoad(&list[${BIN_SLOTS}u + slot])) {
      atomicStore(&list[${LIST_HEAD}u + u.filterModes.y + at], row);
      return;
    }
    // The list is full: binned, a large one at the largest radius that folds
    // with its heat kept by area, one across an edge as its centre has it.
    if (big) {
      let s = pixRadius / ${BIN_RMAX.toFixed(1)};
      w = w * s * s;
      pixRadius = ${BIN_RMAX.toFixed(1)};
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
  if ((bp.grid.w & ${BIN_RADIUS}u) != 0u) {
    binAdd(bp.chan.y * plane + cell * 2u, binRound(abs(w) * pixRadius * bp.scale.y, binHash(h + 1u)));
  }
  if ((bp.grid.w & ${BIN_ABS}u) != 0u) {
    binAdd(bp.chan.z * plane + cell * 2u, binRound(abs(w) * bp.scale.x, binHash(h + 2u)));
  }
  if ((bp.grid.w & ${BIN_TEAM}u) != 0u) {
    let t = bp.chan.w * plane + cell * 2u;
    binAdd(t, binRound(w * out.teamAB.x * bp.scale.x, binHash(h + 3u)));
    binAdd(t + plane, binRound(w * out.teamAB.y * bp.scale.x, binHash(h + 4u)));
    binAdd(t + plane * 2u, binRound(w * out.teamAB.z * bp.scale.x, binHash(h + 5u)));
  }
}
`;
  return s.slice(0, tailFrom) + tail;
}

/** The splat for the rows the bin pass listed: row from the list instead of a block. */
export function listHeatWgsl(): string {
  return swapOnce(
    HEAT_WGSL,
    'let row = blockStarts[u.filterCfg.y + block] + local;',
    `let row = blockStarts[${LIST_HEAD}u + u.filterModes.y + sprite];`,
    'row',
  );
}

/** The grid in floats, its mean radius per cell, and the largest kernel reach a tile. */
const RESOLVE_WGSL = /* wgsl */ `
${PARAMS_WGSL}
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

@compute @workgroup_size(${TILE}, ${TILE})
fn csResolve(@builtin(global_invocation_id) g : vec3<u32>, @builtin(local_invocation_index) li : u32, @builtin(workgroup_id) wg : vec3<u32>) {
  if (li == 0u) { atomicStore(&reach, 0u); }
  workgroupBarrier();
  if (g.x < bp.grid.x && g.y < bp.grid.y) {
    let cell = g.y * bp.grid.x + g.x;
    let plane = bp.chan.x;
    let count = bins[bp.sparse.x + cell];
    let w = wide(cell * 2u) / bp.scale.x;
    var a = abs(w);
    if ((bp.grid.w & ${BIN_ABS}u) != 0u) { a = wide(bp.chan.z * plane + cell * 2u) / bp.scale.x; }
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
      if ((bp.grid.w & ${BIN_RADIUS}u) != 0u) { r = (wide(bp.chan.y * plane + cell * 2u) / bp.scale.y) / a; }
      r = clamp(r, 1e-3, ${BIN_RMAX.toFixed(1)});
      if ((bp.grid.w & ${BIN_TEAM}u) != 0u) {
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
`;

/**
 * The kernel averaged over a cell, `K_eff(ox, oy; r)`: the expected splat at a
 * texel offset (ox, oy) from the cell of a row of radius r anywhere in it. A
 * table over radius steps; the fold interpolates between two.
 */
const LUT_WGSL = /* wgsl */ `
struct LutParams {
  // centre intensity, edge intensity, falloff, flags (rowCfg.w bits)
  shape : vec4<f32>,
};
@group(0) @binding(0) var<uniform> lp : LutParams;
// K_eff, then its first moment along x: J(o) = mean over the cell of u.x K(|o - u| / r).
@group(0) @binding(1) var<storage, read_write> lut : array<f32>;
@group(0) @binding(2) var curveTex : texture_2d<f32>;
@group(0) @binding(3) var curveSamp : sampler;

fn kernel(d : f32) -> f32 {
  if (d > 1.0) { return 0.0; }
  let flags = u32(lp.shape.w);
  var t : f32;
  if ((flags & ${FLAG_USE_CURVE}u) != 0u) {
    t = textureSampleLevel(curveTex, curveSamp, vec2<f32>(mix(${CURVE_U0}, ${CURVE_U1}, d), 0.5), 0.0).r;
  } else {
    t = pow(1.0 - d, lp.shape.z);
    if ((flags & ${FLAG_SMOOTH_RAMP}u) != 0u) { t = smoothstep(0.0, 1.0, t); }
  }
  return mix(lp.shape.y, lp.shape.x, t);
}

@compute @workgroup_size(64)
fn csLut(@builtin(global_invocation_id) g : vec3<u32>) {
  let n = ${LUT_LEVELS * LUT_SIDE * LUT_SIDE}u;
  if (g.x >= n) { return; }
  let level = g.x / ${LUT_SIDE * LUT_SIDE}u;
  let rest = g.x % ${LUT_SIDE * LUT_SIDE}u;
  let oy = f32(rest / ${LUT_SIDE}u);
  let ox = f32(rest % ${LUT_SIDE}u);
  let r = f32(level) * ${LUT_STEP};
  var sum = 0.0;
  var first = 0.0;
  if (r > 0.0) {
    for (var j = 0u; j < 32u; j++) {
      for (var i = 0u; i < 32u; i++) {
        let du = (f32(i) + 0.5) / 32.0 - 0.5;
        let dv = (f32(j) + 0.5) / 32.0 - 0.5;
        let k = kernel(length(vec2<f32>(ox - du, oy - dv)) / r);
        sum += k;
        first += du * k;
      }
    }
  }
  lut[g.x] = sum / 1024.0;
  lut[n + g.x] = first / 1024.0;
}
`;

/** The fold: each texel gathers the cells within reach, through the averaged kernel. */
const FOLD_WGSL = /* wgsl */ `
${PARAMS_WGSL}
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
  if ((flags & ${FLAG_USE_CURVE}u) != 0u) {
    t = textureSampleLevel(curveTex, curveSamp, vec2<f32>(mix(${CURVE_U0}, ${CURVE_U1}, d), 0.5), 0.0).r;
  } else {
    t = pow(1.0 - d, bp.kern.z);
    if ((flags & ${FLAG_SMOOTH_RAMP}u) != 0u) { t = smoothstep(0.0, 1.0, t); }
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
  let reachHere = i32(reach[u32(g.y / ${TILE}) * bp.tiles.x + u32(g.x / ${TILE})]);
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
      let f = min(r / ${LUT_STEP}, ${(LUT_LEVELS - 1.001).toFixed(3)});
      let l0 = u32(f);
      let at = u32(ay * ${LUT_SIDE} + ax);
      let ta = u32(ax * ${LUT_SIDE} + ay);
      let L0 = l0 * ${LUT_SIDE * LUT_SIDE}u;
      let L1 = L0 + ${LUT_SIDE * LUT_SIDE}u;
      let J = ${LUT_LEVELS * LUT_SIDE * LUT_SIDE}u;
      let k = mix(lut[L0 + at], lut[L1 + at], fract(f));
      // The first moment: exact where the rows thin out across the cell
      // linearly, which is most of what is left between the cell's mean
      // kernel and the splat of its rows. The texel is at -(dx, dy).
      let jx = mix(lut[J + L0 + at], lut[J + L1 + at], fract(f)) * select(-1.0, 1.0, dx <= 0);
      let jy = mix(lut[J + L0 + ta], lut[J + L1 + ta], fract(f)) * select(-1.0, 1.0, dy <= 0);
      let m = textureLoad(radii, c, 0);
      let sum = textureLoad(sums, c, 0);
      let tilt = 12.0 * (m.y * jx + m.z * jy);
      acc += k * sum + tilt * select(vec4<f32>(1.0, 0.0, 0.0, 0.0), sum / sum.x, sum.x != 0.0 && (bp.grid.w & ${BIN_TEAM}u) != 0u);
    }
  }
  acc = acc * bp.scale.w;
  if ((bp.grid.w & ${BIN_TEAM}u) != 0u) { return acc; }
  return vec4<f32>(acc.x, 0.0, 0.0, acc.x * ${TEAM_LIGHTNESS});
}

// Indirect draws for the listed rows, one a plan entry.
@group(0) @binding(5) var<storage, read> counts : array<u32>;
@group(0) @binding(6) var<storage, read_write> args : array<u32>;

@compute @workgroup_size(${BIN_SLOTS})
fn csArgs(@builtin(local_invocation_index) i : u32) {
  let n = min(counts[i], counts[${BIN_SLOTS}u + i]);
  args[i * 4u] = n * 3u;
  args[i * 4u + 1u] = 1u;
  args[i * 4u + 2u] = 0u;
  args[i * 4u + 3u] = 0u;
}
`;

/** Most bytes the grid's sums may take; see `GpuHeatBin.fits`. */
const BIN_MAX_BYTES = 768 * 1024 * 1024;

/** 64-bit sums a cell: weight and its offset in x and y, the radius, |weight|, the three colour sums. */
function channelsFor(f: { perspective: boolean; signed: boolean; team: boolean }): number {
  return 3 + (f.perspective ? 1 : 0) + (f.perspective && f.signed ? 1 : 0) + (f.team ? 3 : 0);
}

/** What one frame's binning needs from the renderer. */
export interface BinFrame {
  /** Target size in texels. */
  width: number;
  height: number;
  /** Rows' radii differ (perspective); otherwise every row has `uniformRadius`. */
  perspective: boolean;
  uniformRadius: number;
  signed: boolean;
  team: boolean;
  /** Sample weight times gain, the splat's `shape2.y`. */
  weight: number;
  /** Centre, edge, falloff and the ramp flags, for the kernel table. */
  centre: number;
  edge: number;
  falloff: number;
  rampFlags: number;
  curveDirty: boolean;
}

/** Whether the splat path's ramp flags are among `flags`; for `BinFrame.rampFlags`. */
export function rampFlags(useCurve: boolean, smooth: boolean): number {
  return (useCurve ? FLAG_USE_CURVE : 0) | (smooth ? FLAG_SMOOTH_RAMP : 0);
}

export { FLAG_TEAM_COLORS };

export class GpuHeatBin {
  /** All pipelines compiled: until then the heat splats. */
  ready = false;
  failed = false;
  /** Names the buffers and textures bind groups hold: the sums buffer's and the grid's. */
  generation = '';
  private binsId = 0;
  binPipeline: GPUComputePipeline | null = null;
  private resolvePipeline: GPUComputePipeline | null = null;
  private dilatePipeline: GPUComputePipeline | null = null;
  private lutPipeline: GPUComputePipeline | null = null;
  private argsPipeline: GPUComputePipeline | null = null;
  private readonly foldPipelines = new Map<GPUTextureFormat, GPURenderPipeline>();
  private readonly listPipelines = new Map<GPUTextureFormat, GPURenderPipeline>();

  readonly params: GPUBuffer;
  private readonly lutParams: GPUBuffer;
  private readonly lut: GPUBuffer;
  readonly list: GPUBuffer;
  readonly args: GPUBuffer;
  bins: GPUBuffer | null = null;
  private tiles: GPUBuffer | null = null;
  private reach: GPUBuffer | null = null;
  private sums: GPUTexture | null = null;
  private radii: GPUTexture | null = null;
  private gridW = 0;
  private gridH = 0;
  private gridId = 0;
  /**
   * The grid's textures for each target size lately used, most recent last: the
   * heat's level moves in powers of two with the sprites' size, and making a
   * grid on the frame a level changes was an allocation on the frame path.
   */
  private readonly grids = new Map<string, { sums: GPUTexture; radii: GPUTexture; tiles: GPUBuffer; reach: GPUBuffer; id: number }>();
  private nextGrid = 0;
  private lutKey = '';
  private readonly paramScratch = new ArrayBuffer(96);
  private readonly head = new Uint32Array(LIST_HEAD);
  /** Bytes held, for the memory readout. */
  bytes = 0;

  constructor(
    private readonly device: GPUDevice,
    private readonly curveView: GPUTextureView,
    private readonly sampler: GPUSampler,
  ) {
    const usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST;
    this.params = device.createBuffer({ label: 'heat bin params', size: 96, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.lutParams = device.createBuffer({ label: 'heat bin kernel params', size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.lut = device.createBuffer({ label: 'heat bin kernel', size: LUT_LEVELS * LUT_SIDE * LUT_SIDE * 8, usage });
    this.list = device.createBuffer({ label: 'heat bin list', size: (LIST_HEAD + BIN_LIST_ROWS) * 4, usage: usage | GPUBufferUsage.COPY_SRC });
    this.args = device.createBuffer({ label: 'heat bin draws', size: BIN_SLOTS * 16, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.INDIRECT });
    this.bytes = this.lut.size + this.list.size + this.args.size;
  }

  /** Compile every pipeline off the frame; `ready` once all are there. */
  async prewarm(formats: GPUTextureFormat[]): Promise<void> {
    const d = this.device;
    try {
      const bin = d.createShaderModule({ label: 'heat bin', code: binWgsl() });
      const list = d.createShaderModule({ label: 'heat bin list', code: listHeatWgsl() });
      const resolve = d.createShaderModule({ label: 'heat bin resolve', code: RESOLVE_WGSL });
      const lut = d.createShaderModule({ label: 'heat bin kernel', code: LUT_WGSL });
      const fold = d.createShaderModule({ label: 'heat bin fold', code: FOLD_WGSL });
      const compute = (module: GPUShaderModule, entryPoint: string, label: string) =>
        d.createComputePipelineAsync({ label, layout: 'auto', compute: { module, entryPoint } });
      const add: GPUBlendState = {
        color: { srcFactor: 'one', dstFactor: 'one', operation: 'add' },
        alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' },
      };
      const render = (module: GPUShaderModule, vs: string, fs: string, format: GPUTextureFormat, label: string) =>
        d.createRenderPipelineAsync({
          label: `${label} ${format}`,
          layout: 'auto',
          vertex: { module, entryPoint: vs },
          fragment: { module, entryPoint: fs, targets: [{ format, blend: add }] },
          primitive: { topology: 'triangle-list' },
        });
      const [b, r, dl, l, a] = await Promise.all([
        compute(bin, 'csBin', 'heat bin'),
        compute(resolve, 'csResolve', 'heat bin resolve'),
        compute(resolve, 'csDilate', 'heat bin reach'),
        compute(lut, 'csLut', 'heat bin kernel'),
        compute(fold, 'csArgs', 'heat bin draws'),
      ]);
      this.binPipeline = b;
      this.resolvePipeline = r;
      this.dilatePipeline = dl;
      this.lutPipeline = l;
      this.argsPipeline = a;
      for (const f of formats) {
        const [fp, lp] = await Promise.all([render(fold, 'vsFold', 'fsFold', f, 'heat fold'), render(list, 'vsHeat', 'fsHeat', f, 'heat list')]);
        this.foldPipelines.set(f, fp);
        this.listPipelines.set(f, lp);
      }
      this.ready = true;
    } catch (e) {
      this.failed = true;
      // eslint-disable-next-line no-console
      console.warn(`heat binning unavailable: ${String(e)}`);
    }
  }

  /**
   * Whether this frame's grid fits: within one storage binding, and within
   * `BIN_MAX_BYTES` - past that (a 4K canvas with team colours at full heat
   * resolution) the heat splats rather than take that much of the card.
   */
  fits(f: BinFrame): boolean {
    const cells = (f.width + 2 * BIN_APRON) * (f.height + 2 * BIN_APRON);
    const bytes = cells * (channelsFor(f) * 8 + 4 + BIN_SPARSE * (f.team ? 3 : 2) * 4) * 1.25;
    return bytes <= Math.min(BIN_MAX_BYTES, this.device.limits.maxStorageBufferBindingSize, this.device.limits.maxBufferSize);
  }

  canDraw(format: GPUTextureFormat): boolean {
    return this.ready && this.foldPipelines.has(format) && this.listPipelines.has(format);
  }

  listPipeline(format: GPUTextureFormat): GPURenderPipeline {
    return this.listPipelines.get(format)!;
  }

  /** Grid buffers for a target of `w`×`h` texels and `channels` 64-bit sums a cell. */
  private ensure(w: number, h: number, channels: number, slotWords: number): void {
    const gw = w + 2 * BIN_APRON;
    const gh = h + 2 * BIN_APRON;
    const binBytes = gw * gh * (channels * 8 + 4 + BIN_SPARSE * slotWords * 4);
    if (!this.bins || this.bins.size < binBytes) {
      this.bins?.destroy();
      // Grown only, with room: a change of mode or level should not reallocate each time.
      this.bins = this.device.createBuffer({ label: 'heat bins', size: Math.ceil(binBytes / 256) * 256, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
      this.binsId++;
    }
    if (gw !== this.gridW || gh !== this.gridH || !this.sums) {
      const key = `${gw}x${gh}`;
      let grid = this.grids.get(key);
      if (grid) {
        this.grids.delete(key);
      } else {
        const usage = GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING;
        const tileBytes = Math.max(16, Math.ceil(gw / TILE) * Math.ceil(gh / TILE) * 4);
        grid = {
          sums: this.device.createTexture({ label: 'heat bin sums', size: [gw, gh], format: 'rgba32float', usage }),
          radii: this.device.createTexture({ label: 'heat bin radii', size: [gw, gh], format: 'rgba32float', usage }),
          tiles: this.device.createBuffer({ label: 'heat bin tiles', size: tileBytes, usage: GPUBufferUsage.STORAGE }),
          reach: this.device.createBuffer({ label: 'heat bin reach', size: tileBytes, usage: GPUBufferUsage.STORAGE }),
          id: ++this.nextGrid,
        };
      }
      this.grids.set(key, grid);
      while (this.grids.size > 2) {
        const [oldest, g] = this.grids.entries().next().value!;
        g.sums.destroy();
        g.radii.destroy();
        g.tiles.destroy();
        g.reach.destroy();
        this.grids.delete(oldest);
      }
      ({ sums: this.sums, radii: this.radii, tiles: this.tiles, reach: this.reach, id: this.gridId } = grid);
      this.gridW = gw;
      this.gridH = gh;
    }
    this.generation = `${this.binsId}:${this.gridId}`;
    let gridBytes = 0;
    for (const g of this.grids.values()) gridBytes += g.sums.width * g.sums.height * 32 + g.tiles.size * 2;
    this.bytes = this.lut.size + this.list.size + this.args.size + this.bins.size + gridBytes;
  }

  /**
   * Set the frame up: grid, parameters, kernel table, list capacities. `slots`
   * is each plan entry's sprite count; returns each one's list base. Encodes
   * the clears and the kernel table, if it changed, into `encoder`.
   */
  begin(encoder: GPUCommandEncoder, f: BinFrame, slots: number[]): number[] {
    const channels = channelsFor(f);
    const slotWords = f.team ? 3 : 2;
    this.ensure(f.width, f.height, channels, slotWords);
    const gw = this.gridW;
    const gh = this.gridH;
    const plane = gw * gh * 2;
    const countAt = plane * channels;
    const slotAt = countAt + gw * gh;
    let next = 3;
    const chR = f.perspective ? next++ : 0;
    const chA = f.perspective && f.signed ? next++ : 0;
    const chT = f.team ? next : 0;
    const flags = (f.perspective ? BIN_RADIUS : 0) | (chA ? BIN_ABS : 0) | (f.team ? BIN_TEAM : 0);
    const u32 = new Uint32Array(this.paramScratch);
    const f32 = new Float32Array(this.paramScratch);
    u32.set([gw, gh, BIN_APRON, flags, plane, chR, chA, chT], 0);
    f32.set([SCALE_W, SCALE_R, Math.min(BIN_RMAX, f.uniformRadius), f.weight], 8);
    u32.set([Math.ceil(gw / TILE), Math.ceil(gh / TILE), f.width, f.height], 12);
    u32.set([countAt, slotAt, BIN_SPARSE, slotWords], 16);
    f32.set([f.centre, f.edge, f.falloff, f.rampFlags], 20);
    this.device.queue.writeBuffer(this.params, 0, this.paramScratch);

    // The list: counters zeroed, each entry's capacity by its share of the sprites.
    const total = slots.reduce((a, b) => a + b, 0);
    const bases: number[] = [];
    this.head.fill(0);
    let base = 0;
    slots.forEach((n, i) => {
      const cap = total > 0 ? Math.floor((BIN_LIST_ROWS * n) / total) : 0;
      bases.push(base);
      if (i < BIN_SLOTS) this.head[BIN_SLOTS + i] = cap;
      base += cap;
    });
    this.device.queue.writeBuffer(this.list, 0, this.head);
    // The sums and the counts; a slot is read only below its cell's count.
    encoder.clearBuffer(this.bins!, 0, slotAt * 4);

    const lutKey = `${f.centre}|${f.edge}|${f.falloff}|${f.rampFlags}`;
    if (lutKey !== this.lutKey || (f.curveDirty && f.rampFlags & FLAG_USE_CURVE)) {
      this.lutKey = lutKey;
      this.device.queue.writeBuffer(this.lutParams, 0, new Float32Array([f.centre, f.edge, f.falloff, f.rampFlags]));
      const pass = encoder.beginComputePass({ label: 'heat bin kernel' });
      pass.setPipeline(this.lutPipeline!);
      pass.setBindGroup(0, this.device.createBindGroup({
        layout: this.lutPipeline!.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.lutParams } },
          { binding: 1, resource: { buffer: this.lut } },
          { binding: 2, resource: this.curveView },
          { binding: 3, resource: this.sampler },
        ],
      }));
      pass.dispatchWorkgroups(Math.ceil((LUT_LEVELS * LUT_SIDE * LUT_SIDE) / 64));
      pass.end();
    }
    return bases;
  }

  /** The bin pass's own bindings, beside the splat's. */
  binEntries(): GPUBindGroupEntry[] {
    return [
      { binding: 17, resource: { buffer: this.params } },
      { binding: 18, resource: { buffer: this.bins! } },
      { binding: 19, resource: { buffer: this.list } },
    ];
  }

  private readonly groupCache = new Map<string, { resolve: GPUBindGroup; dilate: GPUBindGroup; fold: Map<GPUTextureFormat, GPUBindGroup>; args: GPUBindGroup }>();

  private groups(format: GPUTextureFormat) {
    const key = this.generation;
    let g = this.groupCache.get(key);
    if (!g) {
      const d = this.device;
      // As many as there are grids, so switching between levels makes none.
      while (this.groupCache.size >= 8) this.groupCache.delete(this.groupCache.keys().next().value!);
      g = {
        resolve: d.createBindGroup({
          layout: this.resolvePipeline!.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: this.params } },
            { binding: 1, resource: { buffer: this.bins! } },
            { binding: 2, resource: { buffer: this.tiles! } },
            { binding: 3, resource: this.sums!.createView() },
            { binding: 4, resource: this.radii!.createView() },
          ],
        }),
        dilate: d.createBindGroup({
          layout: this.dilatePipeline!.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: this.params } },
            { binding: 2, resource: { buffer: this.tiles! } },
            { binding: 5, resource: { buffer: this.reach! } },
          ],
        }),
        fold: new Map(),
        args: d.createBindGroup({
          layout: this.argsPipeline!.getBindGroupLayout(0),
          entries: [
            { binding: 5, resource: { buffer: this.list, offset: 0, size: LIST_HEAD * 4 } },
            { binding: 6, resource: { buffer: this.args } },
          ],
        }),
      };
      this.groupCache.set(key, g);
    }
    let fold = g.fold.get(format);
    if (!fold) {
      fold = this.device.createBindGroup({
        layout: this.foldPipelines.get(format)!.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.params } },
          { binding: 1, resource: this.sums!.createView() },
          { binding: 2, resource: this.radii!.createView() },
          { binding: 3, resource: { buffer: this.reach! } },
          { binding: 4, resource: { buffer: this.lut } },
          { binding: 7, resource: { buffer: this.bins! } },
          { binding: 8, resource: this.curveView },
          { binding: 9, resource: this.sampler },
        ],
      });
      g.fold.set(format, fold);
    }
    return { ...g, fold };
  }

  /** After the bin dispatches: the grid in floats, each tile's reach, the list's draws. */
  resolve(pass: GPUComputePassEncoder, format: GPUTextureFormat): void {
    const g = this.groups(format);
    const tw = Math.ceil(this.gridW / TILE);
    const th = Math.ceil(this.gridH / TILE);
    pass.setPipeline(this.resolvePipeline!);
    pass.setBindGroup(0, g.resolve);
    pass.dispatchWorkgroups(tw, th);
    pass.setPipeline(this.dilatePipeline!);
    pass.setBindGroup(0, g.dilate);
    pass.dispatchWorkgroups(Math.ceil(tw / 8), Math.ceil(th / 8));
    pass.setPipeline(this.argsPipeline!);
    pass.setBindGroup(0, g.args);
    pass.dispatchWorkgroups(1);
  }

  /** The fold, into the pass's target (additive, as the splat). */
  fold(pass: GPURenderPassEncoder, format: GPUTextureFormat): void {
    pass.setPipeline(this.foldPipelines.get(format)!);
    pass.setBindGroup(0, this.groups(format).fold);
    pass.draw(3);
  }

  /** Rows listed and rows that overflowed the list last frame, for probes; never on the frame path. */
  async readListCounts(slots: number): Promise<{ listed: number; overflow: number } | null> {
    const buf = this.device.createBuffer({ size: LIST_HEAD * 4, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    const enc = this.device.createCommandEncoder();
    enc.copyBufferToBuffer(this.list, 0, buf, 0, LIST_HEAD * 4);
    this.device.queue.submit([enc.finish()]);
    try {
      await buf.mapAsync(GPUMapMode.READ);
      const a = new Uint32Array(buf.getMappedRange().slice(0));
      buf.unmap();
      let listed = 0;
      let overflow = 0;
      for (let i = 0; i < Math.min(slots, BIN_SLOTS); i++) {
        listed += Math.min(a[i], a[BIN_SLOTS + i]);
        overflow += Math.max(0, a[i] - a[BIN_SLOTS + i]);
      }
      return { listed, overflow };
    } catch {
      return null;
    } finally {
      buf.destroy();
    }
  }

  /**
   * Give the grid back: the sums, the counts, the sparse rows and every level's
   * float copy. Called once the heat has not been binned for a while (a switch
   * to line heat, a small load), so the memory is not held for a path not in
   * use; a software adapter ran out of it with line heat on top.
   */
  release(): void {
    if (!this.bins && !this.grids.size) return;
    this.bins?.destroy();
    this.bins = null;
    for (const g of this.grids.values()) {
      g.sums.destroy();
      g.radii.destroy();
      g.tiles.destroy();
      g.reach.destroy();
    }
    this.grids.clear();
    this.groupCache.clear();
    this.sums = this.radii = null;
    this.tiles = this.reach = null;
    this.gridW = this.gridH = 0;
    this.binsId++;
    this.bytes = this.lut.size + this.list.size + this.args.size;
  }

  dispose(): void {
    for (const b of [this.params, this.lutParams, this.lut, this.list, this.args, this.bins]) b?.destroy();
    for (const g of this.grids.values()) {
      g.sums.destroy();
      g.radii.destroy();
      g.tiles.destroy();
      g.reach.destroy();
    }
    this.grids.clear();
  }
}
