import type { VolumeDraw } from '../volumes/gpu';
import type { FigureBatch } from '../figures/instances';
import type { GpuTrackStore } from './gpuTracks/store';
import type { LineData } from '../data/lines';
import type { Dataset, ViewMode } from '../state/types';
import type { Level } from './level';
import type { WorldTile } from '../world/tileSet';

export type BackendKind = 'webgpu' | 'webgl2';

/** Rows per stochastic sampling block. Contiguous so texture reads stay coalesced. */
export const SAMPLE_BLOCK = 4096;

/**
 * Rows per GPU chunk. Chunks are the unit of residency: each owns its own
 * textures and its own quantisation AABB, and can be skipped whole when its
 * time range falls outside the visible window.
 */
/**
 * How many blocks one frame's plan can carry, and so how many sprites one frame can
 * draw: 268M. Enough for every row of the largest load that fits a tab (264M, measured).
 */
export const MAX_PLAN_BLOCKS = 65536;
export const MAX_PLAN_SPRITES = MAX_PLAN_BLOCKS * SAMPLE_BLOCK;

export const CHUNK_ROWS = 1 << 23; // 8.4M rows -> ~67MB of position texture

/**
 * Width of the per-frame block index texture, which is two-dimensional.
 *
 * A single row wide enough for every block would be 16384 px, and plenty of
 * drivers cap MAX_TEXTURE_SIZE at 8192 — including ANGLE's SwiftShader, which the
 * test suite runs on. Exceeding the cap is not an error you can catch at the call
 * site: the allocation is silently dropped, every upload to it fails, and the
 * shader reads zeros, so the sampler quietly draws block 0 of every chunk and
 * nothing else. 4096 is comfortably inside every limit worth supporting.
 */
export const BLOCK_TEX_WIDTH = 4096;

/**
 * Filter slots evaluated per row in the vertex shader.
 *
 * Capped deliberately. Each active slot costs one 4-byte-per-row texture, which
 * on a 40M-row dataset is 160MB of VRAM, and the whole point of filtering in the
 * shader is that changing a threshold costs nothing — no re-parse, no re-upload,
 * no rebuild of any buffer, just a uniform.
 */
export const MAX_FILTER_SLOTS = 4;

/**
 * Texels per row of the WebGL2 tile table: one RGBA32F texel per repeating
 * texture's atlas rectangle (see `ModelLevel.tileRects`), read by tile number in
 * the vertex shader. A row this wide stays within WebGL2's guaranteed 2048
 * texture size for the 65,535 tiles a 16-bit tile number can name.
 */
export const TILE_TABLE_WIDTH = 1024;

/** Width of the category allow-mask texture; `FILTER_MASK_ROWS` rows per filter slot. */
export const FILTER_MASK_WIDTH = 4096;

/**
 * Mask rows per filter slot, so one slot holds `FILTER_MASK_CAPACITY` ids.
 *
 * Sixteen because of the person filter: it takes a slot like any column filter,
 * and its ids are people, of which a real export carries tens of thousands —
 * every AI actor is one. A row is `FILTER_MASK_WIDTH` ids, so 16 rows hold 65,536,
 * which is also the most a 16-bit group or position channel can tell apart. An id
 * past the capacity is never in the mask: with the filter active, such a row is
 * rejected even when it was selected.
 */
export const FILTER_MASK_ROWS = 16;
export const FILTER_MASK_CAPACITY = FILTER_MASK_WIDTH * FILTER_MASK_ROWS;

/**
 * Most distinct values a column can have and still be grouped by.
 *
 * Two different ceilings meet here, and neither is a mesh or buffer size:
 *
 *   - the group id rides in the spare fourth channel of each row's position
 *     texel (RGBA16UI: x, y, z, group), which costs nothing but is 16 bits wide,
 *     so 65535 is the most that can be *stored*;
 *   - every group also needs a texel in the sign table the shader reads to
 *     decide whether a row is hidden, added or subtracted, and that table is
 *     `FILTER_MASK_WIDTH` wide. Past its end the shader reads the "not in the
 *     table" default, so visibility toggles and +/- assignments silently stop
 *     working.
 *
 * The second is the smaller and it is the honest one, because a group is a thing
 * someone assigns by hand — a row in a list, a checkbox, a side of the
 * difference. A column with more distinct values than this is an id, not a
 * group, and is loaded without grouping rather than half-working.
 */
export const MAX_GROUPS = FILTER_MASK_WIDTH;

export interface ActiveFilter {
  /**
   * Column name; resolves to a lazily uploaded per-row texture.
   *
   * `PERSON_FILTER_COLUMN` (see filterTables.ts) is not a column: it resolves to
   * the dataset's person ids, which is how the person filter reaches the heat.
   */
  column: string;
  kind: 'range' | 'categories';
  /** Inclusive bounds for `range`. */
  min: number;
  max: number;
  /**
   * For `categories`: one byte per category id, non-zero meaning allowed, at most
   * `FILTER_MASK_CAPACITY` long. Uploaded into the slot's `FILTER_MASK_ROWS` rows
   * of the shared mask.
   */
  mask: Uint8Array | null;
  /**
   * What the filter selects, as a string: equal keys, equal filters.
   *
   * For change detection — the accumulation signature, the mask upload — without
   * hashing a mask that can be 65,536 bytes long every frame.
   */
  key: string;
}

export interface HeatUniforms {
  radius: number;
  centerIntensity: number;
  edgeIntensity: number;
  falloff: number;
  saturation: number;
  /** Ramp position given to any pixel with heat at all, so single points show. */
  floor: number;
  minPixelRadius: number;
  maxPixelRadius: number;
  /**
   * Keep each sprite's total heat when the pixel clamps resize it.
   *
   * A sprite clamped up to the minimum pixel radius covers more ground than its
   * world radius, and one clamped down to the maximum covers less; weighting it
   * by (true radius / drawn radius)^2 keeps the heat it adds the same, so the
   * field is density per area of the world at any zoom. Without it a far view of
   * sub-pixel sprites reads many times hotter than the same ground seen close.
   */
  zoomInvariant: boolean;
  groundProjected: boolean;
  /** Y of the ground plane when groundProjected. */
  groundY: number;
  /** Signed mode: +1 for positive teams, -1 for negative, 0 to reject. */
  signed: boolean;
  /**
   * Colour each sprite by its group and mix the overlaps, rather than ramping the
   * whole field through one gradient.
   *
   * Costs a four-channel accumulation target instead of a single-channel one, so
   * it is a per-mode switch and not a uniform: the heat pass is the hottest in the
   * program and quadrupling its blend bandwidth in the modes that cannot use the
   * extra channels would be paying for nothing. Both backends recreate their heat
   * targets when this changes.
   */
  teamColors: boolean;
  /**
   * How many groups the hue circle is divided between.
   *
   * Every group, not just the visible ones. Deriving it from what is switched on
   * would recolour the whole map every time a group was toggled, and comparing two
   * pictures whose palettes disagree is worse than comparing one picture to
   * nothing.
   */
  teamCount: number;
  /**
   * The group index that means "no group", or -1 when every group is real.
   *
   * Given no hue at all — it contributes density and abstains from the colour, so
   * a pixel of only-unassigned rows is grey rather than a team. Without this, the
   * derived columns' 0 value took a slice of the circle like any other id, and on
   * one file 18% of rows sat on it: every AI row, and every player whose spawn
   * could not be read, came out as one confident colour. It read as a team that
   * covered the map.
   */
  teamNeutral: number;
  /**
   * Slice permutation, coprime with `teamCount`. See `teamSlice` in `colors.ts`.
   *
   * 1 leaves the assignment as-is. Anything else is what stops neighbouring ids —
   * which are neighbouring places, because that is how they are numbered — from
   * getting hues a fraction of a degree apart.
   */
  teamSlices: number;
  /**
   * How far a mixture is pushed away from neutral. 1 leaves it alone.
   *
   * Needed because the honest answer and the readable one diverge as the group
   * count grows: with a dozen groups almost every busy pixel is a mixture of
   * several, their Oklab positions very nearly cancel, and a correct map is a grey
   * map. Scaling `(a, b)` sharpens whatever imbalance is there without inventing
   * one — a genuine dead heat is at the origin and stays there at any setting.
   */
  teamBoost: number;
  /** S-curve the per-sprite ramp. */
  smoothRamp: boolean;
  /** Sample `curveLut` for the ramp instead of the analytic falloff. */
  useCurve: boolean;
  /** Density response: 0 linear, 1 saturating, 2 log. Matches HEAT_RESPONSE_CODE. */
  response: number;
  /** Distance from the camera below which rows are skipped. 0 = no limit. */
  cullNear: number;
  /** Distance above which rows are skipped. 0 = no limit. */
  cullFar: number;
  /**
   * Measure the cull distances along the view axis rather than from the eye.
   *
   * Straight-line distance cuts a sphere around the camera, so the cut curves
   * away at the edges of the frame and a wall of it drifts nearer as you look
   * around. Along the view axis it is a plane parallel to the screen, which is
   * both what "cut everything past sixty metres" sounds like it should mean and
   * the more useful of the two: it leaves a flat face you can read a floor plan
   * off, and it does not move when the camera turns.
   */
  cullPlanar: boolean;
  /**
   * Cut the level's geometry at the same bounds, not just the heat.
   *
   * Both, or the plane hides what it was moved there to reveal: with the heat cut
   * and the level left whole you are looking at the remaining datapoints through
   * a building that is still in front of them. Cutting both turns the plane into
   * a section through the map, and the points inside it sit against the walls and
   * floors they belong to.
   */
  cullGeometry: boolean;
  /**
   * How far a datapoint behind level geometry is suppressed, per surface in
   * front of it. 0 off. Compounds: two walls apply it twice.
   */
  occlusion: number;
  /**
   * Least visibility an occluded point keeps, whatever the wall count.
   *
   * So that a heatmap of a building interior still shows *that there is data* —
   * hiding it outright means an empty room and a room full of hidden traffic look
   * identical, and nothing on screen suggests reaching for the slice tool. Zero
   * only when the slider is pinned to 1.
   */
  occlusionFloor: number;
  /** Extra dimming per surface beyond the first. Compounds. */
  occludedExtra: number;
  /**
   * Drop points behind the terrain instead of dimming them.
   *
   * "Behind the terrain" means: something opaque is in front of this point and
   * no structure is. That is a hair's breadth from exact — a point behind both a
   * hill and a wall is charged as being behind the wall — and it is exact in the
   * case that matters, which is open ground and the horizon. The alternative is a
   * ground-only depth copy, and recovering one costs either a second pass over
   * the terrain or a depth blit that WebGPU will not do.
   */
  hideBehindGround: boolean;
}

/**
 * A slab of world to draw, with everything outside it cut away.
 *
 * Given to every pass that draws something positional — the level, the heat, the
 * team cubes — because a slice that only applied to one of them would leave heat
 * hanging in the air where its building was.
 */
export interface SliceDraw {
  /** 0 = x, 1 = y, 2 = z. */
  axis: number;
  min: number;
  max: number;
  /** What to multiply geometry outside the slab by. 0 removes it. */
  outside: number;
  /** Whether datapoints are cut as well as geometry. */
  clipHeat: boolean;
}

export interface CubeInstance {
  x: number;
  y: number;
  z: number;
  r: number;
  g: number;
  b: number;
  /** Radians, for the look-direction indicator. */
  yaw: number;
  pitch: number;
}

/** Everything a backend needs to draw one frame. Rebuilt each frame, no allocations. */
export interface FrameParams {
  viewProj: Float32Array;
  /**
   * The view-projection for geometry given relative to `origin`, worked out in
   * double precision: `viewProj` times a translation by the origin.
   *
   * A theatre's units sit hundreds of kilometres from the world origin, where a
   * 32-bit float steps by 6 cm and a view matrix carrying that translation
   * cancels away as much again per vertex - a unit the camera follows shook by
   * pixels. Figures are drawn relative to a point beside the camera instead.
   */
  viewProjRel: Float32Array;
  /** The camera's position rounded to 32 bits: what `viewProjRel` is relative to. */
  origin: Float32Array;
  view: Float32Array;
  proj: Float32Array;
  cameraPos: Float32Array;
  /** Unit vector the camera looks along, for the planar distance cull. */
  cameraForward: Float32Array;
  /** False for an orthographic projection, where sprite size is distance-independent. */
  perspective: boolean;
  width: number;
  height: number;
  /** Device pixel ratio already folded into width/height. */
  heatScale: number;
  mode: ViewMode;
  heat: HeatUniforms;
  /**
   * Splat each row as the segment from the row its route came from, rather than
   * as a point: line heat. Only set when `setLines` has given the renderer the
   * routes for the current dataset; rows with no segment then draw nothing.
   */
  lineHeat: boolean;
  /**
   * Line heat played back: each route drawn up to where its person is at `now`,
   * interpolated between samples, with the heat fading over the last `tail`
   * seconds behind them. Null when not playing back.
   */
  lineTrail: { now: number; tail: number } | null;

  /** Per-chunk draw plan for the heat pass. Index matches uploaded chunk order. */
  plan: ChunkDrawPlan[];
  /** Rows in the candidate set before subsampling. */
  candidateRows: number;
  /** Sprites actually submitted this frame. */
  submittedSprites: number;
  /** candidateRows / submittedSprites — keeps the estimate unbiased. */
  sampleWeight: number;
  /**
   * How this frame's splat combines with what's already in the heat buffer.
   *
   * - `reset` — clear first, then splat one full-weight estimate. The only correct
   *   choice when the camera moved or a sprite-geometry uniform changed, because
   *   stale heat sits at stale pixels.
   * - `mean`  — scale the buffer by `1 - blendAlpha` and add `blendAlpha` of a
   *   fresh estimate, with `blendAlpha = 1/n` on the nth frame. That is a running
   *   mean: after n frames it holds exactly the average of n estimates, and a
   *   static view converges to the exact all-rows answer.
   * - `ema`   — the same operation with a fixed alpha. Used while a *sliding*
   *   window moves: unbiased in steady state and far quieter than re-estimating
   *   from scratch every frame.
   * - `extend` — add to what is there, decaying nothing. For a window that only
   *   grows, which is what cumulative playback is: the rows already accumulated
   *   are still visible, so re-estimating the whole window every frame is not just
   *   wasted work but actively worse. Each frame would light up a different random
   *   subset at full compensating weight and let it fade, which reads as bursts
   *   flaring and vanishing. Splatting only the newly-visible rows — exactly,
   *   since a frame's worth of new data is small — builds the field up
   *   monotonically with no noise at all.
   *
   * `mean` is a running average rather than a sum divided at composite time
   * because the buffer is `r16float` wherever float32 blending is unavailable.
   * A sum reaches n times the field and saturates at 65504, and once it does, a
   * divisor that keeps growing makes the picture fade the longer the view sits
   * still — while a moving camera, which resets every frame, looks correct. The
   * running mean keeps the buffer at one field's worth no matter how many frames
   * are merged.
   */
  accumMode: 'reset' | 'mean' | 'ema' | 'extend';
  /** Weight of this frame's estimate for `mean` and `ema`. */
  blendAlpha: number;
  /**
   * Scale applied to every splat, divided out again at composite.
   *
   * Exists for the half-float accumulation target, which is what a device without
   * float32 blending gets. Half float tops out at 65504 and carries 11 bits of
   * mantissa, and a real heat field reaches hundreds of thousands — so without
   * this the hot end both clips and loses its low bits, which shows up as the
   * densest areas reading far cooler than they are. Scaling the field into the
   * range the format handles well fixes both. 1 on a 32-bit target.
   */
  heatGain: number;
  /**
   * Redraw the canvas from the existing scene and heat buffers, drawing nothing
   * new into either.
   *
   * Set on an idle frame — converged, nothing changed. The alternative is to skip
   * the frame entirely and trust the canvas to keep showing what was last drawn,
   * which the WebGL spec explicitly does not promise: without
   * `preserveDrawingBuffer` the drawing buffer's contents are undefined after
   * compositing. It happens to survive on some drivers and not others, and where
   * it does not the picture quietly drains away whenever the user stops moving.
   *
   * The scene and heat targets are our own framebuffers and do retain, so this
   * costs one fullscreen pass and nothing else — the sprite splatting, which is
   * the expensive part, stays skipped.
   */
  compositeOnly: boolean;
  /** Frames merged into the accumulation buffer *including* this one. */
  accumFrames: number;

  /** Visible time window in dataset seconds. */
  timeLo: number;
  timeHi: number;

  /**
   * Per-row expiry test, or null when the window alone decides visibility.
   *
   * The row range from the timeline is a contiguous superset — bounded by the
   * longest lifetime in the dataset — and this narrows it per row, so that each
   * person shows one current position rather than a growing pile of stale ones.
   */
  lifetime: {
    /** Playhead, in dataset seconds. */
    now: number;
    /** Duration for rows whose person never appears again. */
    defaultLifetime: number;
    /** Fraction of each row's life spent fading out. 0 pops off instead. */
    fadeOut: number;
  } | null;

  /**
   * Per-team weight, indexed by teamId: +1 additive, -1 subtractive, 0 hidden.
   *
   * Used in every heat mode, not just difference — team visibility is expressed
   * as a 0 here so hiding a team costs a texture read rather than a rebuild.
   * Under a column split (`splitMode` 1 or 2) it is visibility only, 1 shown and
   * 0 hidden: the column decides the sign, and this still decides who is drawn.
   * The renderers keep it beside `splitSign` rather than in its place.
   */
  teamSign: Int8Array | null;
  /** Whether the splat shader should consult `teamSign` at all. */
  useTeamSign: boolean;

  /**
   * How the difference split assigns a sign to each row.
   *
   * 0 — by group id, from `teamSign`.
   * 1 — by category of `splitColumn`, from `splitSign` indexed by category.
   * 2 — by value of `splitColumn` falling in `splitPositive` / `splitNegative`.
   *
   * Modes 1 and 2 need the column's per-row values on the GPU, which reuses the
   * same lazily-uploaded per-row buffers the column filters use. In both, a row
   * whose group `teamSign` hides is rejected as well.
   */
  splitMode: SplitMode;
  splitColumn: string | null;
  splitSign: Int8Array | null;
  splitPositive: [number, number];
  splitNegative: [number, number];
  /**
   * Weight of a positive row and of a negative one, in difference mode; 1 and 1
   * unless each side is normalised to its own total (`sideScales`).
   */
  splitScale: [number, number];
  /** Column filters, up to MAX_FILTER_SLOTS. Evaluated per row in the shader. */
  filters: ActiveFilter[];

  cubes: Float32Array | null;
  cubeCount: number;
  cubeSize: number;
  showLookDirection: boolean;
  lookLength: number;

  /** RGBA8 lookup table, 2 rows: row 0 = positive ramp, row 1 = negative ramp. */
  colorLut: Uint8Array;
  colorLutDirty: boolean;

  /**
   * Baked sprite ramp, centre to rim. Sampled per fragment in the heat pass when
   * `heat.useCurve` is set.
   */
  curveLut: Float32Array;
  curveLutDirty: boolean;

  showGrid: boolean;
  showAxes: boolean;
  gridSpacing: number;
  gridExtent: number;

  trailVerts: Float32Array | null;
  trailVertCount: number;

  /**
   * World-space triangles in their own colours, seven floats a vertex (xyz,
   * rgba) - the race tab's driven lines, its maps and its cars. Shading is baked
   * into the colours, so one shader draws them all; depth-tested and written
   * like any solid, after the level.
   */
  sceneTris: Float32Array | null;
  sceneTriVertCount: number;
  /**
   * Box replay's figures as GPU instances of meshes uploaded once
   * (`figures/instances.ts`), drawn before `sceneTris` with the same blending
   * and depth writes. Absent or empty: none. Their positions are relative to
   * `origin`, drawn with `viewProjRel`.
   */
  figureBatches?: FigureBatch[] | null;
  /**
   * Every unit of a large dataset placed by the GPU (`gpuTracks/`): the store
   * uploaded once, a compute pass a frame. Only where `gpuTracksMaxBytes` is
   * set (WebGPU); absent: none.
   */
  gpuTracks?: GpuTracksParams | null;
  /**
   * The far-off glyphs (`symbols/`): map symbols, weapons' glyphs, decoys -
   * screen-facing quads from one atlas, from the GPU tracks' own run and
   * from `cpu` (the CPU path's). Absent: none.
   */
  symbols?: SymbolParams | null;

  /**
   * Ruler and probe geometry, drawn last and without depth testing so it stays
   * visible over whatever it is measuring across.
   */
  overlayVerts: Float32Array | null;
  overlayVertCount: number;
  /**
   * Lines over the finished picture, the heat included, without depth (seven
   * floats a vertex, as the trails): the battles' objectives in the heatmap,
   * which the heat would otherwise cover. Drawn on every frame, idle ones too.
   */
  topVerts?: Float32Array | null;
  topVertCount?: number;

  /** Appearance of the background map or level mesh. Null draws neither. */
  level: LevelDraw | null;

  /** Depth of field for the scene pass. Null disables it entirely. */
  dof: DofDraw | null;
  /** Camera near/far, needed to turn a depth sample back into a distance. */
  near: number;
  far: number;
  /** The slab of world to draw. Null draws everything. */
  slice: SliceDraw | null;
  /**
   * The user's volumes as a filter on the heat (volumes/gpu.ts): only the rows
   * inside them, or only those outside. Null or absent filters nothing.
   */
  volumes?: VolumeDraw | null;
  /**
   * The tactical display's screen pass (`post/tacticalPost.ts`): the composited
   * picture re-drawn as a glowing telemetry display. Null or absent: the
   * composite goes straight to the canvas, as always.
   */
  post?: PostDraw | null;
}

/** The tactical display look, as the renderers draw it (`post/tacticalPost.ts` packs it). */
export interface PostDraw {
  /** 0 low (one pass, no glow), 1 medium (quarter-res glow), 2 high (half-res glow, team-coloured edges, chroma). */
  quality: 0 | 1 | 2;
  bloom: number;
  edges: number;
  contours: number;
  grid: number;
  scanlines: number;
  chroma: number;
  vignette: number;
  noise: number;
  /** How far terrain is turned into the display's monochrome, 0..1. */
  terrain: number;
  /** The display's colour, linear 0..1. */
  tint: [number, number, number];
  /** World units between contour lines and between grid lines. */
  contourSpacing: number;
  gridSpacing: number;
  /** World distances over which the scene fades into the background. */
  fogNear: number;
  fogFar: number;
  /** Seconds, for the scan band. */
  time: number;
  /** A camera cut's flash, 1 at the cut falling to 0. */
  flash: number;
}

export interface DofDraw {
  /** World distance to the focal plane. */
  focus: number;
  /** Depth range that stays sharp, as a fraction of `focus`. */
  aperture: number;
  /** Largest blur radius in pixels. */
  maxBlur: number;
}

/**
 * Depth layers peeled behind the nearest surface, for counting walls.
 *
 * One comparison against the scene's depth tells you whether *something* is in
 * front of a datapoint. It cannot tell one wall from a whole building, so every
 * interior comes out uniformly faint and the picture says nothing about which
 * floor or corridor the data is on. Peeling further layers gives depth
 * complexity, and the dimming can then compound per surface.
 *
 * Three is a judgement: it is four surfaces of resolution counting the scene's
 * own depth, which covers a room inside a building seen from outside, and each
 * layer is a full pass over the structure geometry. Past four the count
 * saturates, and a point that deep is at the visibility floor regardless.
 */
export const HEAT_DEPTH_LAYERS = 3;

/**
 * Window-depth margin for rejecting the previous layer while peeling.
 *
 * Large enough to clear the surface already recorded despite depth being
 * distributed non-linearly, small enough not to skip a wall standing right
 * behind another one. Written as a GLSL literal, so it needs the decimal point.
 */
export const PEEL_EPSILON = '0.0000005';

/** The same value as a number, for WebGPU, which passes it in a uniform. */
export const PEEL_EPSILON_F = 5e-7;

export interface LevelDraw {
  kind: 'image' | 'model';
  /** Image only: world footprint as (minX, minZ, maxX, maxZ). */
  rect: [number, number, number, number];
  /** Image only: height of the plane. */
  y: number;
  flipV: boolean;
  opacity: number;
  desaturate: number;
  brightness: number;
  wireframe: boolean;
  /**
   * Model only: shade the ground with its captured vertex colour.
   *
   * Resolved here rather than in the renderer so that "the user asked for
   * colour" and "this level actually has any" are decided in one place; a
   * renderer seeing true is guaranteed a colour buffer to bind.
   */
  vertexColours: boolean;
  /**
   * Model only: draw the ground with its texture atlas.
   *
   * Resolved in the engine like `vertexColours`: true guarantees the level has
   * both UVs and an atlas. The renderer still falls back to untextured until the
   * atlas has finished decoding, which is asynchronous.
   */
  texture: boolean;
  /**
   * Model only: opacity of the ground's own triangle edges, drawn over the
   * shaded ground rather than instead of it. 0 draws none.
   *
   * The most direct answer to "how big is the terrain sampling" and "is that a
   * slope or a shading artefact", which is why it is a separate dial from the
   * relief cues rather than a mode that replaces them.
   */
  groundWireOpacity: number;
  /**
   * Distance over which the ground's edges fade out, as (start, end).
   *
   * Required, not optional: a traced terrain is a thousand cells across, so
   * beyond a few hundred metres its edges are denser than the pixels drawing
   * them and the surface becomes a white moire sheet that hides the shading and
   * the contours underneath. Scaled from the level's own extent.
   */
  groundWireFade: [number, number];
  /**
   * Model only: how the ground's relief is made legible.
   *
   * A terrain lit only by a lambert key is nearly flat-shaded — its normals all
   * point roughly up, so every slope reads as the same grey and a valley is
   * indistinguishable from a plateau. These add the cues a map needs: shading
   * that responds to slope, and contour lines, which are the one cue that
   * survives however shallow the terrain is.
   */
  relief: {
    /** Strength of slope shading. 0 is the flat look. */
    slope: number;
    /** Contour spacing in world units. 0 draws none. */
    contourSpacing: number;
    /** Contour line strength. */
    contourStrength: number;
    /** Every nth contour is drawn heavier, as on a real map. 0 disables. */
    contourIndexEvery: number;
    /** Lift from low ground to high, as a fraction of brightness. */
    elevationRange: number;
    /** World Y that maps to the bottom of the elevation ramp. */
    lowY: number;
    /** World Y that maps to the top. */
    highY: number;
  };
  /**
   * Model only: water surfaces, drawn flat with none of the relief cues.
   *
   * Every terrain cue is meaningless on a surface that is level by definition,
   * and a lake shaded like ground is invisible against it.
   */
  water: {
    opacity: number;
    tint: [number, number, number];
    show: boolean;
  };
  /**
   * Model only: how the structures standing on the ground are drawn.
   *
   * Separate from the ground's appearance because the two want opposite
   * treatments — a solid surface to read position against, and a near-transparent
   * shell you can see the heat inside.
   */
  structure: {
    faceOpacity: number;
    wireOpacity: number;
    tint: [number, number, number];
    showFaces: boolean;
    showWire: boolean;
    /**
     * Shade each triangle by its own face normal instead of the interpolated one.
     *
     * An exported level arrives welded — one vertex where eight triangles of a
     * box corner meet — so the only normal that can be derived from it is the
     * average of everything meeting there, which rounds off every corner of
     * every box. A city of boxes then reads as a heap of melted foil, and the
     * exporter gets blamed for geometry that is actually correct.
     *
     * The face normal is recovered per fragment from the derivatives of the
     * world position, which costs nothing and needs no extra vertices. The
     * ground is left smooth: terrain is a sampled height grid, and faceting it
     * would show the sampling rather than the hill.
     */
    flat: boolean;
    /**
     * Solid, in the structures' own texture and colour, with the mesh lighting
     * at full strength - see `ModelLevel.structureTexture`. True guarantees the
     * level has UVs and an atlas; the tint and the rim are not applied.
     */
    textured: boolean;
  };
  /**
   * Model only: the user's switches as they apply to the streamed world tiles
   * (src/world/tileSet), which are otherwise drawn with every setting above.
   *
   * Separate because the level's own flags are resolved against the level's
   * contents - captured colour only if the level has colours, the texture only
   * if it has an atlas, water and structures only if it has any - and a tile
   * carries its own colours, imagery, water and buildings whatever the level
   * holds. So these say only what the user asked for; the renderer still draws
   * a tile's texture only where it has one. All false on an image level.
   */
  tiles: {
    colours: boolean;
    texture: boolean;
    water: boolean;
    faces: boolean;
    wire: boolean;
  };
}

/**
 * Which blocks of one chunk to splat this frame.
 *
 * Every block is exactly SAMPLE_BLOCK sprites wide so the vertex shader can get
 * from vertex id to row with a shift and a mask. Blocks that overhang the
 * candidate range are not trimmed — the shader rejects rows outside
 * [minRow, maxRow) by collapsing them to zero size, which costs one vertex
 * invocation and no fragments.
 */
export interface ChunkDrawPlan {
  chunk: number;
  /** Chunk-relative start row of each selected block. */
  blockStarts: Uint32Array;
  blockCount: number;
  /** Chunk-relative bounds of the candidate range, for the shader's row reject. */
  minRow: number;
  maxRow: number;
}

export interface FrameResult {
  gpuMs: number | null;
}

export interface Renderer {
  readonly kind: BackendKind;
  setDataset(dataset: Dataset | null): void;
  /**
   * The routes for line heat, one link per row of the current dataset (see
   * `data/lines.ts`), or null to free them. Called after `setDataset`.
   */
  setLines(lines: LineData | null): void;
  /** Upload background geometry. Pass null to clear it. */
  setLevel(level: Level | null): void;
  /**
   * The streamed world tiles to draw with a model level, in full each time.
   *
   * Diffed by id and object: tiles already uploaded stay, new ones are
   * uploaded, the rest freed. Pass an empty list to free them all. Drawn only
   * while the level is a model level, with that level's look.
   */
  setWorldTiles(tiles: WorldTile[]): void;
  /** GPU bytes held by the level and the world tiles, beside `gpuBytesUsed` for the rows. */
  readonly levelBytes: number;
  render(params: FrameParams): FrameResult;
  dispose(): void;
  /** GPU memory ceiling for row data, in bytes. */
  gpuBudgetBytes: number;
  /**
   * The largest storage buffer the GPU tracks may use, bytes; 0 where the
   * backend cannot place units on the GPU (WebGL2).
   */
  readonly gpuTracksMaxBytes?: number;
  /** GPU bytes the GPU tracks hold now. */
  readonly gpuTracksBytes?: number;
  readonly gpuBytesUsed: number;
  readonly residentRows: number;
  /**
   * Rows that did not fit in the GPU budget and are therefore not drawn.
   *
   * Reported rather than hidden: a silently truncated dataset looks like a
   * complete one, which is the worst possible failure for an analysis tool.
   */
  readonly droppedRows: number;
  /** Driver's renderer string, when it will say. */
  readonly gpuName: string | null;
  /**
   * Coarse capability signals, used to size the GPU budget.
   *
   * No web API reports VRAM. These are the only numbers a context will admit to
   * that correlate with card class at all — enough to separate an integrated part
   * from a discrete one, not enough to size a budget precisely.
   */
  readonly gpuLimits: GpuLimits;
  /**
   * Precision of the accumulation target.
   *
   * Reported because the caller has to compensate for it: a half-float target
   * needs the field scaled into its usable range, and the scale has to be divided
   * back out of anything read from it.
   */
  readonly heatPrecision: 'f16' | 'f32';
  /**
   * Accumulated heat at one canvas pixel, matching what the ramp was fed.
   *
   * A single-pixel readback, so it stalls the pipeline; callers must throttle.
   */
  readHeatAt(canvasX: number, canvasY: number, divisor: number): number | null;
  /**
   * Same value, awaited.
   *
   * WebGPU can only read a texture asynchronously, so its synchronous
   * `readHeatAt` returns the previous sample — fine for a cursor readout, useless
   * for a one-shot query. This waits for the real answer.
   */
  probeHeat(canvasX: number, canvasY: number, divisor: number): Promise<number | null>;
  /**
   * Absolute accumulated heat across the whole field, subsampled.
   *
   * For auto-exposure: the saturation point has to come from the distribution the
   * shader actually produced, because the analytic guess it replaces has to assume
   * a peak-to-mean ratio, and real telemetry's clustering makes that assumption
   * wrong by an order of magnitude in either direction. Measuring it is the only
   * way to put the interesting part of the data in the middle of the ramp.
   *
   * Returns null when there is nothing to read. Ordering is not meaningful — the
   * caller wants a distribution, not an image.
   */
  readHeatField(maxSamples: number): Promise<Float32Array | null>;
  /**
   * Read back the composited frame as RGBA bytes.
   *
   * Exists so a backend can be verified without depending on the browser
   * compositing its canvas — headless Chromium renders WebGPU correctly but does
   * not present it, which would otherwise make the backend untestable.
   */
  captureFrame?(): Promise<CapturedFrame | null>;
  /**
   * Chunks the last heat pass left out because the difference split's column
   * could not be put on the GPU for them. They are skipped rather than drawn
   * with the group split, so the caller has to say so.
   */
  readonly splitSkippedChunks?: number;
}

/** 0 = by group, 1 = by column category, 2 = by column range. */
export type SplitMode = 0 | 1 | 2;

export interface GpuLimits {
  /** Largest 2D texture dimension the context will allocate. */
  maxTextureSize: number;
  /** Largest single buffer, where the API exposes one (WebGPU only). */
  maxBufferBytes: number | null;
}

export interface CapturedFrame {
  width: number;
  height: number;
  /** Tightly packed RGBA, top row first. */
  rgba: Uint8Array;
}

export class GpuInitError extends Error {}

/** How the far-off glyphs are drawn (`symbols/shaders.ts`). */
export interface SymbolParams {
  /** `SYMBOL_STYLE_ID`. */
  style: number;
  /** `FAR_MODE_ID`. */
  mode: number;
  /** Heading ticks on moving units' symbols. */
  ticks: boolean;
  /** 16 x (r, g, b, affiliation), `symbols/affiliation.ts` sideTable. */
  sides: Float32Array;
  /** Glyph instances the CPU placed (figure instances, `symbols/cpuGlyphs.ts`). */
  cpu?: { data: Float32Array; count: number } | null;
}

/** What the renderer needs besides the view to place and draw the GPU tracks. */
export interface GpuTracksParams {
  store: GpuTrackStore;
  /** Playhead, dataset seconds. */
  t: number;
  /** Focal length in pixels (perspective), else 0 and `orthoPx` the size of a pixel. */
  focalPx: number;
  orthoPx: number;
  minPixels: number;
  /** Seconds a unit is held at its last key. */
  stale: number;
  /** Data units at true size. */
  scale: number;
  fullPx: number;
  dartPx: number;
  triangleBudget: number;
  /** Seconds of trail behind each unit; 0 none. */
  trailSeconds: number;
  /** Drop lines from each unit down to this height (the data's floor); null or absent: none. */
  dropFloor?: number | null;
  /** One bit a track, set when shown (team toggles, filters); null: all shown. */
  visible?: Uint32Array | null;
  /** Seconds of streak behind a weapon in flight; 0 hides weapons. */
  weapons?: number;
  /** Seconds a death stays marked; 0 none. */
  markerSeconds?: number;
  /** `FAR_MODE_ID`: figure, arrow or symbol far off. */
  farMode?: number;
  /** Below this many pixels long at true size a unit is a symbol (symbol mode). */
  symbolThreshold?: number;
  /** A symbol's size on screen, px. */
  symbolPx?: number;
  /** Drop lines under weapons in flight too. */
  weaponDrops?: boolean;
}
