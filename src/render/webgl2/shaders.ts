import { CURVE_U0, CURVE_U1 } from '../../state/curve';
import { TEAM_CHROMA, TEAM_LIGHTNESS } from '../colors';
import {
  BLOCK_TEX_WIDTH,
  FILTER_MASK_CAPACITY,
  FILTER_MASK_ROWS,
  FILTER_MASK_WIDTH,
  HEAT_DEPTH_LAYERS,
  PEEL_EPSILON,
  TILE_TABLE_WIDTH,
} from '../types';
import { VOLUME_GLSL } from '../../volumes/gpu';

/**
 * GLSL ES 3.00 sources for the WebGL2 backend.
 *
 * The heat pass is the whole ballgame, so a note on its shape: there are no
 * vertex attributes. Rows live in a quantised RGBA16UI texture and a sprite
 * reaches its row through `gl_VertexID` -> block -> row, with the block start
 * read from a tiny per-frame index texture. That indirection is what lets the
 * stochastic sampler draw an arbitrary scattered subset of a 400M-row dataset in
 * one `drawArrays` call, with reads still coalesced inside each 4096-row block.
 */

/**
 * The distance cull, for the level's own geometry.
 *
 * Shared between the mesh and wire shaders as a string, because the two have to
 * agree exactly: a cut that removed a wall's faces and left its wireframe, or cut
 * the ground at a different distance from the structures standing on it, would be
 * worse than no cut at all.
 *
 * Culling the geometry as well as the heat is what makes the plane useful rather
 * than merely tidy. With the heat cut and the level left whole you are looking at
 * datapoints through a building that is still in front of them, so the thing you
 * removed is the thing you wanted to see; with both cut the plane becomes a
 * section through the map and the points inside it sit against the walls and
 * floors they belong to.
 */
const CULL_UNIFORMS = `
uniform vec3  uCamPos;
uniform vec3  uCamFwd;
uniform vec2  uGeomCull;    // (near, far) world units; 0 disables either
uniform int   uCullPlanar;  // 1 = along the view axis, not from the eye
`;

const CULL_TEST = `
  if (uGeomCull.x > 0.0 || uGeomCull.y > 0.0) {
    float camDist = uCullPlanar == 1
      ? dot(vWorld - uCamPos, uCamFwd)
      : distance(vWorld, uCamPos);
    if (uGeomCull.x > 0.0 && camDist < uGeomCull.x) discard;
    if (uGeomCull.y > 0.0 && camDist > uGeomCull.y) discard;
  }
`;

export const FULLSCREEN_VS = `#version 300 es
precision highp float;
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID & 1) << 1), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

const POINT_HEAT_VS = `#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
precision highp isampler2D;

uniform mat4  uViewProj;
uniform vec2  uViewport;       // heat target size in pixels
uniform float uProj11;         // perspective: 1/tan(fovY/2); ortho: 2/frustumHeight
uniform int   uPerspective;    // 0 for an orthographic projection
uniform float uRadius;         // sprite radius, world units
uniform vec2  uPixelClamp;     // (min, max) sprite radius in pixels
uniform int   uConserve;       // 1: a clamped sprite keeps its heat (zoomInvariant)
uniform int   uTexMask;        // texture width - 1 (width is a power of two)
uniform int   uTexShift;       // log2(texture width)
uniform vec3  uAabbMin;
uniform vec3  uAabbSize;
uniform int   uMinRow;
uniform int   uMaxRow;
uniform int   uBlockShift;     // log2(SAMPLE_BLOCK)
uniform int   uGroundProjected;
uniform float uGroundY;
uniform int   uSigned;
/**
 * Colour each sprite by its group instead of leaving the whole field one ramp.
 *
 * uTeamCount is every group, not the visible ones: deriving the divisor from
 * what happens to be switched on would recolour the entire map each time a group
 * was toggled, and two pictures with different palettes cannot be compared.
 */
uniform int   uTeamColors;
uniform float uTeamCount;
// The group index that means "no group", or -1. It abstains from the hue rather
// than taking a slice of its own — otherwise every AI row and every unreadable
// spawn comes out as one confident colour spread across the map.
uniform float uTeamNeutral;
// Slice permutation, coprime with the count. Consecutive ids are consecutive
// places, so the identity gave neighbouring teams near-identical hues.
uniform float uTeamSlices;

/**
 * Reverse the low 16 bits: counting turned into repeated halving.
 *
 * GLSL ES 3.00 has no bitfieldReverse (that arrived in ES 3.1), so the five
 * steps are written out, identically to the WGSL copy.
 */
uint reverse16(uint x) {
  uint v = x & 0xffffu;
  v = ((v >> 1u) & 0x5555u) | ((v & 0x5555u) << 1u);
  v = ((v >> 2u) & 0x3333u) | ((v & 0x3333u) << 2u);
  v = ((v >> 4u) & 0x0f0fu) | ((v & 0x0f0fu) << 4u);
  v = ((v >> 8u) & 0x00ffu) | ((v & 0x00ffu) << 8u);
  return v & 0xffffu;
}
// Difference split: 0 by group, 1 by category of uSplitTex, 2 by its value range.
uniform int       uSplitMode;
uniform sampler2D uSplitTex;    // per-row value of the split column
uniform int       uSignWidth;   // entries per row of uTeamSignTex, for clamping the index
uniform vec2      uSplitPos;    // positive range, mode 2
uniform vec2      uSplitNeg;    // negative range, mode 2
uniform vec2      uSideScale;   // weight of a positive row, of a negative one
uniform vec3  uCamPos;
uniform vec3  uCamFwd;         // unit view axis, for the planar cull
uniform vec2  uDistCull;       // (near, far) world units; far <= 0 disables
uniform int   uCullPlanar;     // 1 = measure along the view axis, not from the eye

uniform vec2  uNearFar;

// The slab of world to draw. Outside it, a point contributes uSliceOutside.
uniform int   uSliceAxis;      // -1 disables
uniform vec2  uSliceRange;
uniform float uSliceOutside;

// The user's volumes, as a filter: see volumes/gpu.ts.
${VOLUME_GLSL}

/**
 * Window depth this sprite must be in front of to count as visible.
 *
 * The comparison happens in *window depth*, not in world distance, and that is
 * the whole trick. Linearising both sides into metres and comparing there is the
 * obvious approach and it does not work: with a near plane of 0.1 and a far of
 * 24000 — ordinary values, picked by the calibration from the data's own extent
 * — a wall at 2000 units and a datapoint at 3000 sit at window depths of
 * 0.999950 and 0.999935. Expanding those back out through the projection turns a
 * 1.5e-5 difference into hundreds of metres of error, so the two came out 19
 * units apart instead of 1000 and no sensible tolerance could separate them.
 *
 * In window space the difference is small but *exact*, which is precisely how the
 * hardware depth test manages the same comparison.
 *
 * The bias converts the one tolerance that is genuinely in world units — the
 * sprite radius, standing for how far the level's approximation of a surface can
 * be from where the datapoint actually stood — into window units at this depth,
 * using dz/ddistance. Plus a few least-significant bits of a 24-bit buffer, so a
 * datapoint resting exactly on a surface does not shadow itself.
 */
float occlusionThreshold(float windowZ, float viewDist) {
  float near = uNearFar.x;
  float far = uNearFar.y;
  // Rate of change of window depth per world unit at this distance.
  float dzdd = (uPerspective == 1)
    ? (2.0 * near * far) / max(1e-9, viewDist * viewDist * (far - near))
    : 1.0 / max(1e-9, far - near);
  float bias = max(uRadius * dzdd, 8.0 / 16777216.0);
  return windowZ - bias;
}

uniform usampler2D uPosTex;      // xyz quantised to the chunk AABB, w = teamId
uniform isampler2D uBlockTex;    // per-frame block start rows
uniform sampler2D  uTeamSignTex; // row 0 teamId -> {-1, 0, +1}, row 1 split category -> sign
uniform usampler2D uTimeTex;     // r = row time, g = lifetime (65535 = no successor)

uniform int   uUseLifetime;
uniform float uNow;              // playhead, dataset seconds
uniform float uChunkTimeMin;
uniform float uTimeScale;        // chunk time span / 65535
uniform float uLifeScale;        // lifetime cap / 65534
uniform float uDefaultLifetime;  // for rows whose person never reappears
uniform float uFadeIn;           // fraction of a row's life spent fading out

// Live filters. 0 = unused, 1 = numeric range, 2 = category allow-mask.
uniform int       uFilterMode[4];
uniform vec2      uFilterRange[4];
uniform sampler2D uFilterTex0;
uniform sampler2D uFilterTex1;
uniform sampler2D uFilterTex2;
uniform sampler2D uFilterTex3;
uniform sampler2D uFilterMaskTex; // ${FILTER_MASK_ROWS} rows per slot, one texel per category

/**
 * Samplers are passed as parameters rather than indexed out of an array,
 * because GLSL ES 3.00 only allows a sampler array to be indexed by a constant
 * expression — a loop counter does not qualify on every driver.
 */
bool passFilter(sampler2D tex, int slot, ivec2 tc) {
  int mode = uFilterMode[slot];
  if (mode == 0) return true;
  float v = texelFetch(tex, tc, 0).r;
  if (mode == 1) {
    vec2 r = uFilterRange[slot];
    return v >= r.x && v <= r.y;
  }
  // Several rows per slot, so a slot holds ${FILTER_MASK_CAPACITY} ids: the person
  // filter's ids are people, and there can be tens of thousands. An id past the
  // mask was never allowed.
  int c = int(v);
  if (c < 0 || c >= ${FILTER_MASK_CAPACITY}) return false;
  ivec2 at = ivec2(c & ${FILTER_MASK_WIDTH - 1}, slot * ${FILTER_MASK_ROWS} + (c >> ${Math.log2(FILTER_MASK_WIDTH)}));
  return texelFetch(uFilterMaskTex, at, 0).r > 0.5;
}

out vec2  vLocal;
out float vSign;
/** How much of this row's contribution survives its lifetime fade, 0..1. */
out float vFade;
/** How much survives being outside the slice, 0..1. */
out float vVisible;
/**
 * Distance from the camera at which this sprite's surface would have to be for
 * the sprite to count as hidden. Compared against the scene depth per fragment.
 *
 * Computed here because it depends only on the point: one calculation per sprite
 * rather than per pixel, with the fragment left to do a fetch and a compare.
 */
out float vOccludeAt;
/**
 * This sprite's group as a position on the Oklab colour plane, or (0,0).
 *
 * Two varyings rather than a lookup texture, because it is two trig calls from the
 * group index the position texture already carries in q.w — and this shader is
 * already at eight samplers, which is the floor the spec guarantees a vertex
 * stage. Flat across the sprite, so the interpolation costs nothing.
 */
out vec2  vTeamAB;

const vec2 CORNERS[6] = vec2[6](
  vec2(-1.0, -1.0), vec2(1.0, -1.0), vec2(-1.0, 1.0),
  vec2( 1.0, -1.0), vec2(1.0,  1.0), vec2(-1.0, 1.0)
);

// A sprite is one triangle round its unit circle: three vertices rather than a quad's six,
// and nearly every sprite of a large load is a pixel or two across, where vertices are
// the whole cost. The fragment stage discards past the circle, so the heat is the same.
const vec2 SPRITE_CORNERS[3] = vec2[3](
  vec2(0.0, 2.0), vec2(-1.7320508, -1.0), vec2(1.7320508, -1.0)
);

void main() {
  int vid    = gl_VertexID;
  int sprite = vid / 3;
  int corner = vid - sprite * 3;

  int block = sprite >> uBlockShift;
  int local = sprite & ((1 << uBlockShift) - 1);
  // The block index texture is two-dimensional: a single row wide enough for
  // every block exceeds the maximum texture size on common drivers, and going
  // past that limit fails silently rather than loudly.
  ivec2 btc = ivec2(block & ${BLOCK_TEX_WIDTH - 1}, block >> ${Math.log2(BLOCK_TEX_WIDTH)});
  int row   = texelFetch(uBlockTex, btc, 0).r + local;

  // Blocks may overhang the candidate range; collapse the overhang instead of
  // trimming the draw, which keeps the vertex-id -> row map a shift and a mask.
  bool reject = (row < uMinRow || row >= uMaxRow);

  ivec2 tc = ivec2(row & uTexMask, row >> uTexShift);
  uvec4 q = texelFetch(uPosTex, tc, 0);
  vec3 p = uAabbMin + vec3(q.xyz) * (1.0 / 65535.0) * uAabbSize;
  // Inside or outside the volumes, at the row's true height: before the ground
  // projection flattens it.
  if (!volKeep(p)) reject = true;
  if (uGroundProjected == 1) p.y = uGroundY;

  // Distance culling. Slices the field to a shell around the camera, which is
  // how you read density inside a building without the roof and the far side of
  // the map summing on top of it.
  //
  // Along the view axis rather than from the eye when asked, which turns the cut
  // from a sphere into a plane parallel to the screen. The sphere's edge curves
  // away across the frame and slides whenever the camera turns; the plane stays
  // where it was put, which is what makes it usable as a control you push back
  // and forth rather than a filter you set once.
  if (uDistCull.y > 0.0 || uDistCull.x > 0.0) {
    float dist = uCullPlanar == 1 ? dot(p - uCamPos, uCamFwd) : distance(uCamPos, p);
    if (dist < uDistCull.x) reject = true;
    if (uDistCull.y > 0.0 && dist > uDistCull.y) reject = true;
  }

  // Filters run before anything expensive; a rejected row costs one vertex
  // invocation and no fragments at all.
  if (!passFilter(uFilterTex0, 0, tc)) reject = true;
  if (!passFilter(uFilterTex1, 1, tc)) reject = true;
  if (!passFilter(uFilterTex2, 2, tc)) reject = true;
  if (!passFilter(uFilterTex3, 3, tc)) reject = true;

  float sgn = 1.0;
  if (uSigned == 1) {
    // The group's entry, from row 0. A group past the table still draws.
    int g = int(q.w);
    float groupSign = g < uSignWidth ? texelFetch(uTeamSignTex, ivec2(g, 0), 0).r : 1.0;
    if (uSplitMode == 0) {
      sgn = groupSign;
    } else {
      // A split by column takes its sign from the column, but the groups still
      // decide who is drawn: the group row then holds 1 shown, 0 hidden, so a
      // group unticked in the Teams list or left out of the group filter stays
      // hidden whichever way the difference is split.
      if (groupSign == 0.0) reject = true;
      if (uSplitMode == 1) {
        // The categories' signs are row 1. Clamped because the table is capped:
        // a column with more values than it holds must reject the overflow
        // rather than fetch outside the texture.
        int cat = int(texelFetch(uSplitTex, tc, 0).r + 0.5);
        sgn = (cat >= 0 && cat < uSignWidth)
          ? texelFetch(uTeamSignTex, ivec2(cat, 1), 0).r
          : 0.0;
      } else {
        float v = texelFetch(uSplitTex, tc, 0).r;
        // Rows in neither range are dropped, not counted as zero, so a split over
        // two of five values compares exactly those two.
        sgn = (v >= uSplitPos.x && v <= uSplitPos.y)
          ? 1.0
          : ((v >= uSplitNeg.x && v <= uSplitNeg.y) ? -1.0 : 0.0);
      }
    }
    if (sgn == 0.0) reject = true;
    // Each side normalised to its own total, when asked: see sideScales.
    sgn *= sgn > 0.0 ? uSideScale.x : uSideScale.y;
  }
  vSign = sgn;

  // Where this sprite's group sits on the Oklab colour plane: the *centre* of its
  // slice of the circle, (i + 0.5) / n. Edges would put group 0 at hue 0 and,
  // only when n is even, group n/2 exactly opposite it — so a five-group map and a
  // six-group map would disagree about what "opposite" means. Centres are evenly
  // spaced at every count.
  vTeamAB = vec2(0.0);
  if (uTeamColors == 1 && float(q.w) != uTeamNeutral) {
    uint groups = uint(max(1.0, uTeamCount));
    uint n = uint(max(1.0, uTeamSlices));
    uint slice = q.w % groups;
    if (n < groups) {
      // See the WGSL copy: more groups than distinguishable hues, so ids are
      // placed by repeated halving instead of in order.
      slice = (reverse16(q.w) * n) >> 16;
    }
    float hue = (float(slice) + 0.5) / float(n) * 6.28318530718;
    vTeamAB = vec2(cos(hue), sin(hue)) * ${TEAM_CHROMA};
  }

  float fade = 1.0;
  if (uUseLifetime == 1) {
    uvec2 tl = texelFetch(uTimeTex, tc, 0).rg;
    float rowTime = uChunkTimeMin + float(tl.r) * uTimeScale;
    // 65535 is the "no following sample" sentinel, not a duration.
    float life = (tl.g == 65535u) ? uDefaultLifetime : float(tl.g) * uLifeScale;
    // The row range already guarantees rowTime <= now up to quantisation error,
    // so clamping the age is enough — no separate lower-bound test needed.
    float age = max(0.0, uNow - rowTime);
    if (age > life) reject = true;
    else if (uFadeIn > 0.0) {
      // Fade out over the last uFadeIn of the row's life instead of vanishing.
      // A datapoint disappearing between one frame and the next reads as a
      // flicker rather than as a thing ending, and with one sample live per
      // person the whole field flickers at the sample rate.
      float t = life > 0.0 ? age / life : 1.0;
      float start = 1.0 - clamp(uFadeIn, 0.0, 1.0);
      fade = 1.0 - smoothstep(start, 1.0, t);
    }
  }
  vFade = fade;

  vec4 clip = uViewProj * vec4(p, 1.0);

  // ---- how much of this point survives the world it sits in
  float visible = 1.0;

  // Outside the slice slab. Checked on the world position, so it cuts the same
  // plane through the data as through the geometry.
  if (uSliceAxis >= 0) {
    float coord = uSliceAxis == 0 ? p.x : (uSliceAxis == 1 ? p.y : p.z);
    if (coord < uSliceRange.x || coord > uSliceRange.y) visible *= uSliceOutside;
  }

  // The window depth this sprite must beat to count as in front of the level.
  // The comparison itself happens per fragment: sampling a depth texture from a
  // vertex shader reads far everywhere on some drivers — ANGLE's software
  // rasteriser among them — which made occlusion silently do nothing. Per
  // fragment is also more correct at a wall's edge, where a sprite that straddles
  // it should be partly hidden rather than all or nothing.
  //
  // Under perspective, clip.w *is* the view-space distance, so it needs no
  // reconstruction from depth — which is the other half of avoiding the precision
  // trap described in occlusionThreshold.
  float windowZ = clip.w > 0.0 ? (clip.z / clip.w) * 0.5 + 0.5 : 1.0;
  vOccludeAt = occlusionThreshold(windowZ, uPerspective == 1 ? max(1e-6, clip.w) : 1.0);
  vVisible = visible;

  // A row that contributes nothing is dropped rather than rasterised — which is
  // also the fast path for a hard cull, where occluded points cost one vertex
  // and no fragments at all.
  if (reject || fade <= 0.0 || visible <= 0.0 || clip.w <= 0.0) {
    vLocal = vec2(0.0);
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // degenerate, culled
    return;
  }

  // World radius -> pixels. Under perspective, clip.w is the view-space depth,
  // so size falls off with distance. Orthographic has no falloff: clip.w is 1
  // and the scale is the same everywhere, which is the point of using it.
  float denom = (uPerspective == 1) ? clip.w : 1.0;
  float trueRadius = uRadius * uProj11 / denom * (uViewport.y * 0.5);
  float pixRadius = clamp(trueRadius, uPixelClamp.x, uPixelClamp.y);
  // A clamped sprite keeps the heat its true size would add: weighted by the
  // area it lost or gained, so the field is density per world area at any zoom.
  // See HeatUniforms.zoomInvariant.
  if (uConserve == 1) {
    float ratio = trueRadius / max(1e-6, pixRadius);
    vFade = fade * ratio * ratio;
  }

  vec2 c = SPRITE_CORNERS[corner];
  vLocal = c;
  clip.xy += c * (pixRadius * 2.0 / uViewport) * clip.w;
  gl_Position = clip;
}
`;

/** Replace `from` with `to` in `src`, exactly once, or fail loudly at load. */
function swapOnce(src: string, from: string, to: string, what: string): string {
  const at = src.indexOf(from);
  if (at < 0 || src.indexOf(from, at + 1) >= 0) throw new Error(`line heat shader: ${what} not found once`);
  return src.slice(0, at) + to + src.slice(at + from.length);
}

/**
 * Line heat: each row splatted as the segment from its route's previous sample.
 *
 * The GLSL twin of the WGSL line shader, derived from the point shader the same
 * way and for the same reason - everything but the triangles stays shared. See
 * the WGSL copy for the shape: eighteen vertices, round caps only where a route
 * begins or ends, a body with the falloff across it.
 */
function lineHeatVs(): string {
  let s = POINT_HEAT_VS;
  s = swapOnce(
    s,
    'uniform usampler2D uPosTex;',
    `// Where each row's segment starts, quantised to uLineMin/uLineSize, and its
// flags in w: 1 a segment, 2 its route starts here, 4 it ends here.
uniform usampler2D uLineStartTex;
uniform vec3  uLineMin;
uniform vec3  uLineSize;
uniform float uTrail;            // playback tail, seconds; 0 when not playing back
uniform float uTrailNow;         // the playhead, dataset seconds
uniform usampler2D uPosTex;`,
    'position texture',
  );
  s = swapOnce(s, 'int sprite = vid / 3;\n  int corner = vid - sprite * 3;', 'int sprite = vid / 18;\n  int corner = vid - sprite * 18;', 'vertex split');
  // The half-width at each end; see the WGSL copy and LINE_HEAT_FS.
  s = swapOnce(s, 'out vec2  vTeamAB;', 'out vec2  vTeamAB;\nout float vWidth;', 'varyings');
  const from = s.indexOf('  vec4 clip = uViewProj * vec4(p, 1.0);');
  const to = s.lastIndexOf('}');
  if (from < 0 || to < from) throw new Error('line heat shader: splat tail not found');
  const tail = `  // ---- how much of this point survives the world it sits in
  float visible = 1.0;
  if (uSliceAxis >= 0) {
    float coord = uSliceAxis == 0 ? p.x : (uSliceAxis == 1 ? p.y : p.z);
    if (coord < uSliceRange.x || coord > uSliceRange.y) visible *= uSliceOutside;
  }
  vVisible = visible;

  // ---- the segment from the route's previous sample to this row
  uvec4 ls = texelFetch(uLineStartTex, tc, 0);
  uint lineFlags = ls.y >> 16u;
  if ((lineFlags & 1u) == 0u) reject = true;
  vec3 a = uLineMin + vec3(float(ls.x & 0xffffu), float(ls.x >> 16u), float(ls.y & 0xffffu)) * (1.0 / 65535.0) * uLineSize;
  if (uGroundProjected == 1) a.y = uGroundY;

  // ---- playback: a head moving between samples, and a fading tail. See the
  // WGSL copy. uTrail is the tail in seconds, 0 when not playing back.
  float fadeA = 1.0;
  float fadeB = 1.0;
  if (uTrail > 0.0) {
    float tB = uChunkTimeMin + float(texelFetch(uTimeTex, tc, 0).r) * uTimeScale;
    float seconds = uintBitsToFloat(ls.z);
    float tA = tB - seconds;
    if (tA >= uTrailNow) reject = true;
    float tEnd = tB;
    if (tB > uTrailNow && seconds > 0.0) {
      p = mix(a, p, clamp((uTrailNow - tA) / seconds, 0.0, 1.0));
      tEnd = uTrailNow;
      lineFlags = lineFlags | 4u;
    }
    fadeA = clamp(1.0 - (uTrailNow - tA) / uTrail, 0.0, 1.0);
    fadeB = clamp(1.0 - (uTrailNow - tEnd) / uTrail, 0.0, 1.0);
    if (fadeA <= 0.0 && fadeB <= 0.0) reject = true;
  }
  vec4 clipA = uViewProj * vec4(a, 1.0);
  vec4 clipB = uViewProj * vec4(p, 1.0);

  // Cut at the near plane rather than dropped: see the WGSL copy.
  float wMin = max(1e-6, uNearFar.x);
  vWidth = 1.0;
  if (reject || fade <= 0.0 || visible <= 0.0 || (clipA.w < wMin && clipB.w < wMin)) {
    vLocal = vec2(0.0);
    vOccludeAt = 0.0;
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }
  if (clipA.w < wMin) clipA = mix(clipA, clipB, (wMin - clipA.w) / (clipB.w - clipA.w));
  if (clipB.w < wMin) clipB = mix(clipB, clipA, (wMin - clipB.w) / (clipA.w - clipB.w));

  int quad = corner / 6;
  vec2 c = CORNERS[corner - quad * 6];
  bool second = c.x > 0.0;
  bool atB = false;
  float along = 0.0;
  bool capped = true;
  if (quad == 0) {
    along = second ? 0.0 : -1.0;
    capped = (lineFlags & 2u) != 0u;
  } else if (quad == 1) {
    atB = second;
  } else {
    atB = true;
    along = second ? 1.0 : 0.0;
    capped = (lineFlags & 4u) != 0u;
  }
  if (!capped) {
    vLocal = vec2(0.0);
    vOccludeAt = 0.0;
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }
  vec4 clip = atB ? clipB : clipA;
  float windowZ = (clip.z / clip.w) * 0.5 + 0.5;
  vOccludeAt = occlusionThreshold(windowZ, uPerspective == 1 ? max(1e-6, clip.w) : 1.0);

  // The width at each end is a sprite's radius at that end's distance.
  float denom = (uPerspective == 1) ? clip.w : 1.0;
  float trueRadius = uRadius * uProj11 / denom * (uViewport.y * 0.5);
  float pixRadius = clamp(trueRadius, uPixelClamp.x, uPixelClamp.y);
  // A clamped line keeps the heat its true width carries across: see the WGSL copy.
  float thin = uConserve == 1 ? trueRadius / max(1e-6, pixRadius) : 1.0;
  // The radius a cap's area is owed: see the WGSL copy.
  float capRadius = uConserve == 1 ? trueRadius : pixRadius;
  // Never thinner than two and a half pixels, dimmed by as much: see the WGSL copy.
  if (pixRadius < 2.5) {
    thin *= pixRadius / 2.5;
    pixRadius = 2.5;
  }
  fadeA *= thin;
  fadeB *= thin;

  // Along and across the segment on screen, in pixels.
  vec2 sa = clipA.xy / clipA.w * uViewport * 0.5;
  vec2 sb = clipB.xy / clipB.w * uViewport * 0.5;
  vec2 dir = sb - sa;
  float len = length(dir);
  dir = len < 1e-4 ? vec2(1.0, 0.0) : dir / len;
  vec2 across = vec2(-dir.y, dir.x);
  vec2 offset = (dir * along + across * c.y) * pixRadius;

  // Divided through by w, so it is interpolated linearly on screen: see the
  // WGSL copy for why perspective interpolation beads the line.
  vLocal = vec2(along, c.y * pixRadius);
  vWidth = pixRadius;
  vFade = fade * (atB ? fadeB : fadeA) * (quad == 1 ? 1.0 : capRadius / pixRadius);
  gl_Position = vec4(clip.xy / clip.w + offset * 2.0 / uViewport, clip.z / clip.w, 1.0);
`;
  return s.slice(0, from) + tail + s.slice(to);
}

export const HEAT_VS = POINT_HEAT_VS;
export const LINE_HEAT_VS = lineHeatVs();

export const HEAT_FS = `#version 300 es
precision highp float;
// Integers default to mediump in a fragment shader and highp in a vertex one, so
// a uniform shared by both — uPerspective here — fails to *link* without this.
precision highp int;

in vec2  vLocal;
in float vSign;
in float vFade;
in float vVisible;
in float vOccludeAt;
in vec2  vTeamAB;

// Occlusion against the scene the level was drawn into. The depth texture is
// sampled here rather than in the vertex shader because a vertex-stage fetch of
// a depth texture returns nothing useful on some drivers, and because a sprite
// crossing a wall's edge should be partly hidden rather than entirely.
uniform sampler2D uSceneDepth;
uniform float uOcclusion;      // 0 = show through walls, 1 = drop entirely
uniform float uOccludedExtra;  // dimming per surface beyond the first
uniform float uOcclusionFloor; // least visibility any occluded point keeps
uniform vec2  uViewport;

/**
 * Depth layers behind the first one, for counting walls rather than detecting
 * one.
 *
 * A single depth comparison answers "is anything in front of this point", which
 * dims a point behind one wall and a point behind four rooms of a building by
 * exactly the same amount — so a heatmap of an interior is uniformly faint and
 * says nothing about which floor or which corridor the data is on. Each of these
 * holds the next surface further from the camera than the previous one (see
 * PEEL_FS below — no backticks: this comment lives inside a template literal,
 * and a backtick here ends the shader source mid-string), so counting how many
 * of them the point is behind gives depth complexity, and the dimming compounds
 * per layer the way it does in reality.
 *
 * Three layers plus the scene's own depth is four walls of resolution, which
 * covers a building; beyond that the count saturates and the point sits at the
 * floor, which is the right answer anyway.
 */
uniform sampler2D uDepthLayers[${HEAT_DEPTH_LAYERS}];
uniform int uLayerCount;

/**
 * The nearest structure surface, so terrain can be told from a wall.
 *
 * One depth texture cannot answer both questions this pass needs to ask, and
 * conflating them is what made the dimmer read as broken. It holds the nearest
 * surface of any kind, so "something is in front of this point" is all it can
 * say — and terrain and walls want opposite treatment. You look through a wall
 * deliberately, to see which corridor and which floor the traffic was on. You
 * never want to look through a hill: what is behind it is the far side of the
 * map, and on a large one that is most of the data, arriving with no depth cue
 * to place it and summing along the horizon into a band brighter than anything
 * in front of you.
 *
 * With this beside the scene depth: an occluder that is not a structure is
 * terrain, and terrain gets a cutoff rather than a dimmer.
 */
uniform sampler2D uStructDepth;
uniform int uGroundCull;

uniform float uCenter;
uniform float uEdge;
uniform float uFalloff;
uniform float uWeight;   // candidateRows / submittedSprites
uniform int   uSmooth;   // 1 = S-curve the ramp instead of using it raw
uniform int   uUseCurve; // 1 = read the ramp from uCurveTex instead
uniform sampler2D uCurveTex; // baked Bezier ramp, centre at u=0, rim at u=1

layout(location = 0) out vec4 outHeat;

void main() {
  float d = length(vLocal);
  if (d > 1.0) discard;
  // Radial ramp: centre intensity at d=0, edge intensity at d=1.
  float t;
  if (uUseCurve == 1) {
    // A texture fetch, not an evaluation — solving a Bezier for x needs iteration
    // and this is the hottest shader in the program. Half a texel of inset keeps
    // the ends of the ramp exact under linear filtering.
    t = texture(uCurveTex, vec2(mix(${CURVE_U0}, ${CURVE_U1}, d), 0.5)).r;
  } else {
    t = pow(1.0 - d, uFalloff);
    if (uSmooth == 1) t = smoothstep(0.0, 1.0, t);
  }
  if (uOcclusion > 90.0) {
    float sz = texture(uSceneDepth, gl_FragCoord.xy / uViewport).r;
    float dbg = uOcclusion > 98.5 ? sz : (uOcclusion > 97.5 ? vOccludeAt : ((vOccludeAt > sz) ? 1.0 : 0.0));
    outHeat = vec4(dbg, 0.0, 0.0, 0.0);
    return;
  }
  float visible = vVisible;
  vec2 uv = gl_FragCoord.xy / uViewport;
  // Behind the terrain: something opaque is in front, and it is not a structure.
  //
  // Tested before the wall count and independently of the dimmer, because it is
  // a different question with a different answer. Cut, not dimmed — there is no
  // reading of a heatmap in which the far side of a hill is wanted, and the
  // dimmer cannot be turned up far enough to suppress it without also erasing
  // the building interior it exists to reveal.
  if (uGroundCull == 1 && vOccludeAt > texture(uSceneDepth, uv).r
      && vOccludeAt <= texture(uStructDepth, uv).r) {
    discard;
  }
  if (uOcclusion > 0.0) {
    // How many surfaces stand between this sprite and the camera. The scene's
    // own depth is the first; the peeled layers are the rest.
    int walls = vOccludeAt > texture(uSceneDepth, uv).r ? 1 : 0;
    if (walls > 0) {
      // Unrolled, and it has to be. GLSL ES 3.00 only permits a sampler array to
      // be indexed by a constant expression, and a loop counter is not one — the
      // loop version compiled nowhere, which surfaced as the engine silently
      // failing to initialise rather than as a shader error.
${Array.from(
  { length: HEAT_DEPTH_LAYERS },
  (_, i) => `      if (${i} < uLayerCount && vOccludeAt > texture(uDepthLayers[${i}], uv).r) walls++;`,
).join('\n')}
      // The first surface dims hard; each one after it dims by a gentler,
      // separate factor. Two different numbers on purpose.
      //
      // One factor compounded cannot do this job. The slider is set so a single
      // wall leaves a few per cent — that is the look that reads as "behind
      // something" — and a few per cent compounded is 0.1% at two walls and
      // nothing at three, so every interior collapses to the visibility floor
      // and the wall count stops mattering again. Halving per extra surface
      // keeps four distinguishable steps inside a range that is all visible,
      // which is what makes a corridor read as nearer than the rooms behind it.
      float gain = 1.0 - uOcclusion;
      if (walls > 1) gain *= pow(uOccludedExtra, float(walls - 1));
      visible *= max(gain, uOcclusionFloor);
      if (visible <= 0.0) discard;
    }
  }

  float ramp = mix(uEdge, uCenter, t);
  // Density in R, and the group's colour *weighted by that density* in G and B.
  //
  // Weighted, because the composite wants the mean group colour at the pixel and a
  // mean is a weighted sum over the sum of the weights. Accumulating the colours
  // unweighted would let one sprite's faint rim count as much as another's centre,
  // so a pixel's hue would follow how many sprites grazed it rather than how much
  // of each group is there.
  //
  // Written in every mode. When the target is single-channel G and B are simply
  // discarded, which is what lets one program serve both.
  float v = ramp * uWeight * vSign * vFade * visible;
  outHeat = vec4(v, v * vTeamAB.x, v * vTeamAB.y, 0.0);
}
`;

export const COMPOSITE_FS = `#version 300 es
precision highp float;

in vec2 vUv;

uniform sampler2D uScene;
uniform sampler2D uHeat;
uniform sampler2D uLut;      // 256 x 2: row 0 positive, row 1 negative
uniform float uInvFrames;    // 1 / accumulated frames
uniform float uSaturation;   // heat that maps to the top of the ramp
uniform int   uSigned;
uniform int   uResponse;     // 0 = linear clamp, 1 = saturating, 2 = log
uniform float uFloor;        // ramp position for any pixel carrying heat at all

// Depth of field, applied to the scene only. uDof.x <= 0 disables it.
uniform sampler2D uSceneDepth;
uniform vec3 uDof;           // maxBlur px, focus distance, aperture
uniform vec2 uDepthRange;    // near, far
uniform vec2 uTexel;         // 1 / scene resolution
uniform int  uPerspectiveDepth;
// Team colours: read the mixture out of G,B instead of ramping through the LUT.
uniform int   uTeamColors;
uniform float uTeamBoost;

/**
 * Oklab to sRGB, Björn Ottosson's matrices plus the transfer function.
 *
 * A third copy of the same twelve constants — this one, the WGSL one, and
 * oklabToRgb in colors.ts — and the reason they are checked against each other
 * rather than trusted is that a single wrong sign here produces a picture that
 * looks like a palette choice rather than like a bug. The blue row's leading
 * -0.0041960863 was positive in an earlier draft and only a round-trip test
 * caught it.
 */
vec3 oklabToSrgb(float L, float a, float b) {
  float l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  float m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  float s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  float l = l_ * l_ * l_;
  float m = m_ * m_ * m_;
  float s = s_ * s_ * s_;
  vec3 lin = clamp(vec3(
     4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  ), 0.0, 1.0);
  // Per-channel clamp rather than a gamut-preserving projection: it shifts the hue
  // of a boosted mixture that leaves sRGB, which is a real inaccuracy, but the
  // alternative costs a search per pixel and the boost is a legibility control
  // dragged by hand — it is looked at, not measured.
  return mix(1.055 * pow(lin, vec3(1.0 / 2.4)) - 0.055,
             lin * 12.92,
             step(lin, vec3(0.0031308)));
}

/** Depth sample -> distance from the camera along the view axis. */
float viewDistance(float depth) {
  if (uPerspectiveDepth == 1) {
    float ndc = depth * 2.0 - 1.0;
    float n = uDepthRange.x;
    float f = uDepthRange.y;
    return (2.0 * n * f) / max(1e-6, f + n - ndc * (f - n));
  }
  // Parallel projection: depth is linear in distance already.
  return mix(uDepthRange.x, uDepthRange.y, depth);
}

// Blur radius in pixels for a pixel at distance d from the camera.
float circleOfConfusion(float dist) {
  float focus = max(1e-3, uDof.y);
  float band = max(1e-4, focus * uDof.z);
  return uDof.x * clamp(abs(dist - focus) / band, 0.0, 1.0);
}

/**
 * Gather-blur the scene by its own circle of confusion.
 *
 * Taps sit on a golden-angle spiral, which covers a disc far more evenly than a
 * grid at this few samples. Each tap is weighted by whether *its* blur circle
 * reaches the centre pixel, which is what stops a sharp foreground from being
 * smeared outward by the blurry background behind it — the classic depth-of-field
 * artefact, and the reason a plain radius-weighted blur looks wrong.
 */
vec3 sceneWithDof() {
  // Depth is read with integer fetches rather than sampled: interpolating depth
  // across a silhouette produces a distance that exists nowhere in the scene.
  ivec2 dims = textureSize(uSceneDepth, 0);
  ivec2 centre = ivec2(vUv * vec2(dims));
  ivec2 maxPx = dims - ivec2(1);
  float centreCoc = circleOfConfusion(viewDistance(texelFetch(uSceneDepth, centre, 0).r));
  vec3 sum = texture(uScene, vUv).rgb;
  float weight = 1.0;
  // Under a pixel of blur there is nothing to gather.
  if (centreCoc < 1.0) return sum;

  const int TAPS = 24;
  const float GOLDEN = 2.39996323;
  for (int i = 0; i < TAPS; i++) {
    float fi = float(i) + 0.5;
    // sqrt for equal-area spacing: without it the taps bunch at the centre.
    float r = sqrt(fi / float(TAPS)) * centreCoc;
    float a = fi * GOLDEN;
    vec2 offset = vec2(cos(a), sin(a)) * r;
    ivec2 tapPx = clamp(centre + ivec2(offset), ivec2(0), maxPx);
    float tapCoc = circleOfConfusion(viewDistance(texelFetch(uSceneDepth, tapPx, 0).r));
    float w = clamp(tapCoc - r + 1.0, 0.0, 1.0);
    sum += texture(uScene, vUv + offset * uTexel).rgb * w;
    weight += w;
  }
  return sum / max(1e-4, weight);
}

layout(location = 0) out vec4 outColor;

void main() {
  // Heat is deliberately not blurred: it is the sum of sprites at many depths, so
  // it has no single depth to be out of focus at, and blurring it by whatever
  // geometry happens to sit behind it would be wrong wherever it floats in front.
  vec3 scene = uDof.x > 0.0 ? sceneWithDof() : texture(uScene, vUv).rgb;
  vec4 hv = texture(uHeat, vUv);
  float h = hv.r * uInvFrames;
  float k = abs(h) / max(uSaturation, 1e-6);
  float t;
  if (uResponse == 1) {
    // Saturating. Reproduces the feel of accumulating with alpha-over blending,
    // where each layer can only ever cover a fraction of what is left, so a
    // hotspot approaches the top of the ramp without a hard clip.
    t = 1.0 - exp(-k);
  } else if (uResponse == 2) {
    // Log. Compresses a long tail so a single extreme hotspot stops flattening
    // everything else to the bottom of the ramp.
    t = log2(1.0 + k * 7.0) / 3.0;
  } else {
    t = k;
  }
  t = clamp(t, 0.0, 1.0);
  // Lift anything that carries heat at all up to the floor, so one datapoint is
  // visible rather than sitting a hair above transparent. The threshold keeps
  // genuinely empty pixels empty; without it the floor would flood the frame.
  if (uFloor > 0.0 && k > 1e-4) t = mix(uFloor, 1.0, t);
  float row = (uSigned == 1 && h < 0.0) ? 0.75 : 0.25;
  vec4 c = texture(uLut, vec2(t, row));
  vec3 rgb = c.rgb;
  if (uTeamColors == 1) {
    // The mixture: the density-weighted mean of the groups present, recovered by
    // dividing the weighted sum in G,B by the weight in R.
    //
    // Dividing by the accumulated weight rather than by anything derived from the
    // ramp is what keeps the hue independent of how much data is here — a group's
    // colour does not drift as more of its own samples land — and it is why every
    // control that shapes density (the response curve, the saturation point, the
    // floor, the sprite ramp) goes on acting on t alone and keeps working
    // untouched. Hue and density ride separate axes deliberately.
    //
    // The frame gain cancels in the ratio, so neither side carries it.
    float w = max(abs(hv.r), 1e-6);
    vec2 ab = vec2(hv.g, hv.b) / w * max(0.0, uTeamBoost);
    rgb = oklabToSrgb(${TEAM_LIGHTNESS}, ab.x, ab.y);
  }
  // Alpha still comes from the LUT even in team mode, which is the point of
  // separating the two axes: transparent where there is nothing, opaque at the top
  // of the ramp, with the colour saying who rather than how much.
  outColor = vec4(mix(scene, rgb, c.a), 1.0);
}
`;

/**
 * Multiplies the heat buffer by a constant, via blendFunc(ZERO, SRC_COLOR):
 * result = 0 * src + dst * src. That's the decay half of the EMA.
 */
/**
 * Adds a scaled copy of one heat target into another.
 *
 * The second half of merging a frame: the accumulator is scaled by `1 - alpha`
 * first, then this adds `alpha` of the frame just rendered. One multiply and one
 * add per pixel, so the arithmetic no longer degrades as more frames merge.
 */
export const BLEND_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uSrc;
uniform float uScale;
layout(location = 0) out vec4 outColor;
// All four channels, not just R. In team mode G and B carry the weighted group
// colour, and merging the density while dropping the colour would leave the
// accumulator's ratio between them meaningless — a correctly bright picture
// coloured by whatever the last full frame happened to hold.
void main() { outColor = texture(uSrc, vUv) * uScale; }
`;

export const SCALE_FS = `#version 300 es
precision highp float;
uniform float uScale;
layout(location = 0) out vec4 outColor;
void main() { outColor = vec4(uScale); }
`;

/**
 * Georeferenced map plane.
 *
 * Desaturated and dimmed by default so the heat on top stays legible — the
 * background's job is to let you locate a hotspot, not to compete with it.
 */
export const MAP_VS = `#version 300 es
precision highp float;
uniform mat4 uViewProj;
uniform vec4 uRect;   // minX, minZ, maxX, maxZ
uniform float uY;
uniform int uFlipV;
out vec2 vUv;
void main() {
  // Two triangles from gl_VertexID; no buffers needed for a quad.
  int id = gl_VertexID;
  vec2 c = vec2(float((id == 1 || id == 2 || id == 4)), float((id == 2 || id == 4 || id == 5)));
  vUv = vec2(c.x, uFlipV == 1 ? 1.0 - c.y : c.y);
  vec3 p = vec3(mix(uRect.x, uRect.z, c.x), uY, mix(uRect.y, uRect.w, c.y));
  gl_Position = uViewProj * vec4(p, 1.0);
}
`;

export const MAP_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uMap;
uniform float uOpacity;
uniform float uDesaturate;
uniform float uBrightness;
layout(location = 0) out vec4 outColor;
void main() {
  vec4 t = texture(uMap, vUv);
  // Rec.709 luma, so desaturation preserves perceived lightness.
  float l = dot(t.rgb, vec3(0.2126, 0.7152, 0.0722));
  vec3 c = mix(t.rgb, vec3(l), clamp(uDesaturate, 0.0, 1.0)) * uBrightness;
  outColor = vec4(c, t.a * uOpacity);
}
`;

/**
 * A vertex's tile: the atlas rectangle its repeating texture wraps in.
 *
 * Shared by the mesh and peel vertex shaders. `aTile` is the vertex's tile
 * number, 0 for a vertex whose UV is already an atlas UV; a level with no
 * repeating texture binds no buffer there and the attribute reads its constant
 * 0. The rectangle is looked up once per vertex and handed on, the same at
 * every corner of a triangle.
 *
 * Interpolated, not flat, though interpolating three equal values changes
 * nothing that matters (a rounding in the last bit, a ten-thousandth of a texel
 * across an 8192-pixel atlas). GL takes a flat value from a triangle's last
 * corner and Direct3D from its first, and ANGLE has to square the two on
 * Direct3D: with this varying flat, a city level of 24 million triangles took
 * half a second a frame instead of 7 ms.
 */
const TILE_VS = `
layout(location = 4) in float aTile;
uniform highp sampler2D uTiles;
out vec4 vTile;
vec4 tileRect(float tile) {
  int t = int(tile + 0.5) - 1;
  if (t < 0) return vec4(0.0);
  return texelFetch(uTiles, ivec2(t % ${TILE_TABLE_WIDTH}, t / ${TILE_TABLE_WIDTH}), 0);
}
`;

/**
 * Read the atlas at a fragment's UV, wrapping it into its tile if it has one.
 *
 * A tiled UV is the image's own, unbounded - 0 to 40 along a brick wall - and
 * is wrapped into the tile's rectangle here, per pixel: `rect.xy +
 * fract(uv) * rect.zw`. The mip level is taken from the *unwrapped* UV's
 * derivatives, scaled to the rectangle. Left to the hardware, the derivatives
 * would be those of the wrapped coordinate, which jumps by a whole tile at
 * every seam, and each seam would be drawn at the smallest mip as a line of
 * the image's average colour. The texels a read takes from past the
 * rectangle's edge are the gutter, which for a tile holds its own opposite
 * edge (composeAtlas), so the seam itself does not show either.
 *
 * A negative width or height clamps that axis instead. A vertex with no tile
 * (z = 0) reads its UV as an atlas UV, clamped as it always was: an
 * untextured vertex's -1 stays a legal read whose result is not used.
 *
 * Call it before anything can discard: the derivatives are only defined while
 * the whole quad is still running.
 */
const ATLAS_SAMPLE = `
vec4 sampleAtlas(sampler2D atlas, vec2 uv, vec4 tile) {
  vec2 dx = dFdx(uv);
  vec2 dy = dFdy(uv);
  if (tile.z == 0.0) return textureGrad(atlas, clamp(uv, 0.0, 1.0), dx, dy);
  vec2 size = abs(tile.zw);
  vec2 local = mix(clamp(uv, 0.0, 1.0), fract(uv), step(0.0, tile.zw));
  return textureGrad(atlas, tile.xy + local * size, dx * size, dy * size);
}
`;

export const MESH_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
// Captured colour, present only on a reconstruction export. The renderer binds
// a constant white buffer when the level has none, so this attribute is always
// backed and the shader needs no variant.
layout(location = 2) in vec3 aColour;
// Texture coordinate into the level's atlas; -1 marks a vertex with none. Always
// backed for the same reason the colour is. A tiled vertex's is its image's own.
layout(location = 3) in vec2 aUv;
${TILE_VS}
uniform mat4 uViewProj;
out vec3 vNormal;
out vec3 vWorld;
out vec3 vColour;
out vec2 vUv;
void main() {
  vNormal = aNormal;
  vWorld = aPos;
  vColour = aColour;
  vUv = aUv;
  vTile = tileRect(aTile);
  gl_Position = uViewProj * vec4(aPos, 1.0);
}
`;

/**
 * Level surfaces, in two looks selected by uFresnel.
 *
 * Structures get a Fresnel rim — bright where a surface turns away from the
 * viewer, nearly invisible face-on — which is what makes a building read as a
 * shell you can see the heat inside, rather than as a uniformly foggy box.
 *
 * The ground gets relief instead. A key light alone is not enough: terrain
 * normals nearly all point up, so lambert gives it one flat grey and a valley
 * looks like a plateau. Three cues fix that, and each answers a different
 * failure —
 *
 *   - **slope darkening**, which makes every bank and cliff visible at any
 *     camera angle, unlike a key light that flattens whenever you face the sun;
 *   - **contour lines**, the only cue that survives terrain too shallow to shade
 *     at all, drawn in screen space so they stay one pixel wide at any zoom;
 *   - **an elevation ramp**, faint, which gives high and low ground a different
 *     value so a whole hillside reads at a glance.
 *
 * All greyscale by default. Colour in the level competes with the heat, which
 * is the thing the viewer exists to show — so `uVertexColour` is off unless
 * asked for. It is asked for when geometry alone is not enough to tell one
 * surface from another: a scanned racetrack is a ribbon flowing into its
 * surroundings, and no amount of relief shading separates the road from the
 * verge beside it. The relief cues stay applied underneath either way, so the
 * shape is still readable when the colour is on.
 */
export const MESH_FS = `#version 300 es
precision highp float;
in vec3 vNormal;
in vec3 vWorld;
in vec3 vColour;
in vec2 vUv;
in vec4 vTile;
uniform vec3  uCameraPos;
uniform vec3  uTint;
uniform float uOpacity;
uniform float uBrightness;
uniform float uFresnel;
uniform float uFlatNormals;
uniform float uVertexColour;   // 0 grey, 1 the level's captured colour
// 0 no texture; 1 textured ground, mesh lighting softened; 2 textured
// structures, mesh lighting at full strength.
uniform float uTexture;
uniform sampler2D uAtlas;

// Ground relief. All zero gives the flat look, which is what water wants.
uniform float uSlope;
uniform float uContourSpacing;
uniform float uContourStrength;
uniform float uContourIndex;   // every nth line drawn heavier; 0 disables
uniform float uElevRange;
uniform vec2  uElevBand;       // (lowY, highY)

// Slice slab: fade or discard whatever is outside it.
uniform int   uSliceAxis;      // -1 disables
uniform vec2  uSliceRange;
uniform float uSliceOutside;
${CULL_UNIFORMS}
layout(location = 0) out vec4 outColor;
${ATLAS_SAMPLE}
void main() {
  // Derivatives first, before anything can discard. A discarded fragment stops
  // contributing to its quad, and its neighbours' derivatives go with it.
  vec3 faceRaw = cross(dFdx(vWorld), dFdy(vWorld));
  // The texture read too, for the same reason: its mip level comes from the
  // UV's derivatives. A vertex with no texture carries -1, which the clamp keeps
  // a legal read; its result is simply not used.
  vec4 sampled = sampleAtlas(uAtlas, vUv, vTile);
  vec3 texel = sampled.rgb;
  // A tiled UV may be negative; only an untiled one marks "no texture" with -1.
  bool textured = vTile.z != 0.0 || vUv.x >= 0.0;
${CULL_TEST}
  if (uTexture > 0.0 && textured) {
    // A cut-out texel - a leaf card's empty corner - is not there at all. The
    // atlas holds 255 for every opaque image's texels, so only cut-out images
    // ever discard, and their texels are 0 or 255 by their own material's
    // cutoff (settleAlpha in atlas.ts). An empty texel is black, so a sample
    // at a leaf's edge is darkened by its coverage; dividing it back out gives
    // the leaf's colour. At alpha 1 the division changes nothing.
    if (sampled.a < 0.5) discard;
    texel = sampled.rgb / sampled.a;
  }
  float sliceFade = 1.0;
  if (uSliceAxis >= 0) {
    float coord = uSliceAxis == 0 ? vWorld.x : (uSliceAxis == 1 ? vWorld.y : vWorld.z);
    if (coord < uSliceRange.x || coord > uSliceRange.y) {
      if (uSliceOutside <= 0.0) discard;
      sliceFade = uSliceOutside;
    }
  }

  vec3 n = normalize(vNormal);
  if (uFlatNormals > 0.0) {
    // The face's own normal, from how the world position changes across one
    // pixel. Exact, free, and needs no second copy of the geometry — the
    // alternative is splitting every shared vertex, which quadruples a level's
    // vertex buffer to say something the rasteriser already knows.
    //
    // Precision is not the problem it looks like at these coordinates: a level
    // spans +/-185,000cm, where a float32 step is 0.016cm, and one pixel of a
    // wall ten metres away spans 0.8cm. Fifty steps to work with.
    float len = length(faceRaw);
    if (len > 1e-9) {
      // Oriented by the smooth normal, because the sign of that cross product
      // follows the winding and the screen-space handedness rather than the
      // surface. A back face would otherwise light as if it faced the sun.
      vec3 face = faceRaw / len;
      n = dot(face, n) < 0.0 ? -face : face;
    }
  }
  // Textured structures are lit from the side the camera sees. A sign or a
  // billboard is two coincident faces back to back, and which one wins the
  // depth test is down to rounding; lit by its own normal, the back one comes
  // out in dark triangles through the front.
  if (uTexture > 1.5 && dot(n, uCameraPos - vWorld) < 0.0) n = -n;
  float key  = max(0.0, dot(n, normalize(vec3(0.4, 0.85, 0.3))));
  float fill = max(0.0, dot(n, normalize(vec3(-0.5, 0.15, -0.7))));
  float lum = (0.26 + 0.55 * key + 0.14 * fill) * uBrightness;

  if (uSlope > 0.0) {
    // 0 on the flat, 1 on a vertical face. Squared so gentle ground stays light
    // and only real relief darkens.
    float steep = 1.0 - clamp(abs(n.y), 0.0, 1.0);
    lum *= 1.0 - uSlope * steep * steep;
  }

  if (uElevRange > 0.0) {
    float h = clamp((vWorld.y - uElevBand.x) / max(1e-4, uElevBand.y - uElevBand.x), 0.0, 1.0);
    lum *= 1.0 - uElevRange * 0.5 + uElevRange * h;
  }

  if (uContourSpacing > 0.0 && uContourStrength > 0.0) {
    // Distance to the nearest contour, measured in lines rather than metres, so
    // fwidth gives a line one pixel wide however far away the ground is. Without
    // that a fixed-width band aliases into moire the moment you zoom out.
    float lines = vWorld.y / uContourSpacing;
    float d = abs(fract(lines - 0.5) - 0.5) / max(1e-5, fwidth(lines));
    float line = 1.0 - smoothstep(0.0, 1.2, d);
    float strength = uContourStrength;
    if (uContourIndex > 0.0) {
      // Index contours: every nth line heavier, as on a paper map.
      float major = abs(fract(lines / uContourIndex - 0.5) - 0.5) / max(1e-5, fwidth(lines / uContourIndex));
      line = max(line, (1.0 - smoothstep(0.0, 1.2, major)) * 1.0);
      strength *= 1.0 + 0.6 * (1.0 - smoothstep(0.0, 1.2, major));
    }
    lum *= 1.0 - clamp(line * strength, 0.0, 0.95);
  }

  float alpha = uOpacity;
  if (uFresnel > 0.0) {
    vec3 view = normalize(uCameraPos - vWorld);
    // Grazing angles approach 1, head-on approaches 0.
    float rim = pow(1.0 - abs(dot(n, view)), 3.0);
    lum = mix(lum, lum + 0.9, rim * uFresnel);
    alpha = mix(alpha, min(1.0, alpha + 0.75), rim * uFresnel);
  }
  vec3 base = mix(vec3(1.0), vColour, uVertexColour);
  if (uTexture > 0.0 && textured) {
    // The texture already carries the fine relief of its own ground, baked in
    // from the game's detail normals, so the mesh lighting is applied gently -
    // at full strength the two multiply and the ground goes muddy.
    base = texel;
    if (uTexture < 1.5) {
      // lum carries the brightness and the relief cues; take the cues out,
      // soften them, and put the brightness back. Contours survive at reduced
      // strength. A model's texture has no lighting baked into it, so
      // structures (2) keep the mesh lighting whole.
      float shaded = lum / max(uBrightness, 1e-3);
      lum = uBrightness * mix(1.0, shaded / 0.8, 0.45);
    }
  }
  outColor = vec4(uTint * base * lum, alpha * sliceFade);
}
`;

/**
 * One layer of depth peeling: the nearest surface *behind* the previous layer.
 *
 * Run once per layer over the structure geometry, with the previous layer's depth
 * texture bound. Anything at or in front of that depth is discarded, so what
 * survives to the depth test is the next surface along the ray. Colour is never
 * written — only depth — so these passes cost geometry throughput and nothing
 * else.
 *
 * The epsilon is in window-depth units and has to be generous enough to reject
 * the previous surface despite the non-linear depth distribution, and small
 * enough not to skip a genuinely adjacent wall. A building's walls are metres
 * apart and a depth buffer's precision near the camera is far finer than that,
 * so there is a wide margin.
 *
 * A cut-out texel is no surface here either. A tree's leaf cards are quads whose
 * empty corners the colour pass discards (MESH_FS); peeled whole, those corners
 * would count as walls in front of whatever stands behind the foliage, and dim
 * heat the picture shows in plain view. So the same atlas read and the same
 * test, through the mesh's own UV attribute, whenever the atlas has decoded
 * (uTexture) - whether or not the structures are drawn from it. Foliage never
 * occludes heat, the shell look included. An opaque image is 255 throughout the
 * atlas and the blank texture bound without one is opaque, so nothing else
 * changes.
 */
export const PEEL_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPos;
// The mesh's UV attribute, at the location MESH_VS reads it from in the same
// VAO; -1 marks a vertex with no texture. Its tile likewise.
layout(location = 3) in vec2 aUv;
${TILE_VS}
uniform mat4 uViewProj;
out vec2 vUv;
void main() {
  vUv = aUv;
  vTile = tileRect(aTile);
  gl_Position = uViewProj * vec4(aPos, 1.0);
}
`;

export const PEEL_FS = `#version 300 es
precision highp float;
in vec2 vUv;
in vec4 vTile;
uniform sampler2D uPrevDepth;
uniform sampler2D uAtlas;
uniform float uTexture;        // above 0 once the atlas has decoded
uniform vec2 uViewport;
${ATLAS_SAMPLE}
void main() {
  float prev = texture(uPrevDepth, gl_FragCoord.xy / uViewport).r;
  // Read before anything can discard, as in MESH_FS: the mip level comes from
  // the UV's derivatives. A vertex with no texture carries -1, which the clamp
  // keeps a legal read; its result is simply not used.
  float alpha = sampleAtlas(uAtlas, vUv, vTile).a;
  if (gl_FragCoord.z <= prev + ${PEEL_EPSILON}) discard;
  if (uTexture > 0.0 && (vTile.z != 0.0 || vUv.x >= 0.0) && alpha < 0.5) discard;
}
`;

/**
 * Edge overlays: constant tint, no shading, so edges stay crisp.
 *
 * With a distance fade, which the ground's triangle grid cannot do without. A
 * traced terrain is over a thousand cells across, so past a few hundred metres
 * its edges are closer together than the pixels drawing them and the whole
 * surface turns into a white moire sheet — brighter than the shading underneath,
 * so it erases the contours and the relief it was meant to complement. Fading
 * them out at the distance where they stop resolving keeps them a near-field cue,
 * which is the only thing they were ever useful as.
 *
 * Structure edges pass thresholds beyond any scene, i.e. no fade: there are far
 * fewer of them and they describe objects rather than a grid.
 */
export const WIRE_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPos;
uniform mat4  uViewProj;
uniform vec3  uCameraPos;
uniform float uFadeStart;
uniform float uFadeEnd;
out vec3  vWorld;
out float vFade;
void main() {
  vWorld = aPos;
  float d = distance(aPos, uCameraPos);
  vFade = 1.0 - smoothstep(uFadeStart, uFadeEnd, d);
  gl_Position = uViewProj * vec4(aPos, 1.0);
}
`;

export const WIRE_FS = `#version 300 es
precision highp float;
in vec3  vWorld;
in float vFade;
uniform vec3  uTint;
uniform float uOpacity;
uniform int   uSliceAxis;
uniform vec2  uSliceRange;
uniform float uSliceOutside;
${CULL_UNIFORMS}
layout(location = 0) out vec4 outColor;
void main() {
  float fade = vFade;
  if (fade <= 0.0) discard;
${CULL_TEST}
  if (uSliceAxis >= 0) {
    float coord = uSliceAxis == 0 ? vWorld.x : (uSliceAxis == 1 ? vWorld.y : vWorld.z);
    if (coord < uSliceRange.x || coord > uSliceRange.y) {
      if (uSliceOutside <= 0.0) discard;
      fade *= uSliceOutside;
    }
  }
  outColor = vec4(uTint, uOpacity * fade);
}
`;

export const LINE_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec4 aColor;
uniform mat4 uViewProj;
out vec4 vColor;
out vec3 vWorld;
void main() {
  vColor = aColor;
  vWorld = aPos;
  gl_Position = uViewProj * vec4(aPos, 1.0);
}
`;

export const LINE_FS = `#version 300 es
precision highp float;
in vec4 vColor;
in vec3 vWorld;
uniform vec3  uCameraPos;
uniform float uFadeStart;
uniform float uFadeEnd;
layout(location = 0) out vec4 outColor;
void main() {
  float d = distance(vWorld, uCameraPos);
  float fade = 1.0 - smoothstep(uFadeStart, uFadeEnd, d);
  if (fade <= 0.001) discard;
  outColor = vec4(vColor.rgb, vColor.a * fade);
}
`;

export const CUBE_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPos;     // unit cube, -0.5 .. 0.5
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec3 iPos;     // instance centre
layout(location = 3) in vec3 iColor;
layout(location = 4) in vec2 iOrient;  // yaw, pitch (radians)

uniform mat4  uViewProj;
uniform float uSize;

out vec3 vNormal;
out vec3 vColor;

void main() {
  float cy = cos(iOrient.x), sy = sin(iOrient.x);
  float cp = cos(iOrient.y), sp = sin(iOrient.y);
  // Yaw about world Y, then pitch about the rotated X.
  mat3 ry = mat3(cy, 0.0, -sy, 0.0, 1.0, 0.0, sy, 0.0, cy);
  mat3 rx = mat3(1.0, 0.0, 0.0, 0.0, cp, sp, 0.0, -sp, cp);
  mat3 rot = ry * rx;
  vec3 world = iPos + rot * (aPos * uSize);
  vNormal = rot * aNormal;
  vColor = iColor;
  gl_Position = uViewProj * vec4(world, 1.0);
}
`;

export const CUBE_FS = `#version 300 es
precision highp float;
in vec3 vNormal;
in vec3 vColor;
layout(location = 0) out vec4 outColor;
void main() {
  vec3 n = normalize(vNormal);
  // Two fixed lights plus ambient: enough to read cube orientation without
  // making the data look like a lit game scene.
  float key  = max(0.0, dot(n, normalize(vec3(0.45, 0.8, 0.35))));
  float fill = max(0.0, dot(n, normalize(vec3(-0.5, 0.2, -0.6))));
  float lum = 0.34 + 0.62 * key + 0.18 * fill;
  outColor = vec4(vColor * lum, 1.0);
}
`;

export const LOOK_VS = `#version 300 es
precision highp float;
layout(location = 0) in float aT;      // 0 at the cube, 1 at the tip
layout(location = 1) in vec3 iPos;
layout(location = 2) in vec3 iColor;
layout(location = 3) in vec2 iOrient;
uniform mat4  uViewProj;
uniform float uLength;
out vec4 vColor;
void main() {
  float cy = cos(iOrient.x), sy = sin(iOrient.x);
  float cp = cos(iOrient.y), sp = sin(iOrient.y);
  vec3 dir = vec3(sy * cp, sp, -cy * cp);
  vColor = vec4(mix(vec3(1.0), iColor, 0.35), mix(0.95, 0.0, aT));
  gl_Position = uViewProj * vec4(iPos + dir * (aT * uLength), 1.0);
}
`;

export const LOOK_FS = `#version 300 es
precision highp float;
in vec4 vColor;
layout(location = 0) out vec4 outColor;
void main() { outColor = vColor; }
`;









/**
 * Line heat's fragment stage: the point splat's, with the across offset - carried
 * in pixels, beside the half-width it is measured against - turned into the 0..1
 * the falloff reads. See LINE_HEAT_VS.
 */
export const LINE_HEAT_FS = (() => {
  let s = HEAT_FS;
  s = swapOnce(s, 'in vec2  vTeamAB;', 'in vec2  vTeamAB;\nin float vWidth;', 'varyings');
  s = swapOnce(s, 'float d = length(vLocal);', 'float d = length(vec2(vLocal.x, vLocal.y / max(vWidth, 1e-6)));', 'fragment distance');
  return s;
})();
