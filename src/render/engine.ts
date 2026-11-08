import { Matrix4, Vector3 } from 'three';
import { estimateSaturation, horizontalExtent } from '../data/calibrate';
import { buildLines, heatModeFor, lineSettingsKey, type LineData } from '../data/lines';
import { playbackRange } from '../data/sessions';
import { CUBE_STRIDE, TrackCursor } from '../data/tracks';
import { HEAT_RESPONSE_CODE, snapshot, useStore, type HeatSettings } from '../state/store';
import { raceClock, raceHover, replayLength, useRaceStore, type RaceState } from '../state/raceStore';
import { RaceScene } from '../race/scene';
import { BoardScene, templateOf } from '../tactics/scene';
import { VehicleStage } from '../vehicle/stage';
import { FigureReplay } from '../figures/replay';
import { EffectLayer } from '../figures/effects';
import { emptySample, MotionModel, MotionRefiner } from '../figures/motion';
import { WeaponLayer } from './weapons';
import { FireLayer, type FirePose, type FireView } from '../figures/fires';
import { FireBody, firesOf } from '../data/fires';
import { HitMarkLayer, hitMarksOf, type MarkPose, type MarkView } from '../figures/hitmarks';
import { gpuTrackStore, registeredGpuTrackStore, rowOfKey, TRACK_U32, type GpuTrackStore } from './gpuTracks/store';
import { emptyPose, evaluateTrack } from './gpuTracks/evaluate';
import { isShown, rayNearTrack, trackTimes, trackVisibility } from './gpuTracks/visibility';
import { markerSeconds } from '../overlay/lean/leanState';
import type { FigureBatch } from '../figures/instances';
import { VertexBuffer } from '../race/geometry';
import { useReplayStore } from '../state/replayStore';
import { dropLinesOn, unitsPerMetre } from '../ui/replay/replayData';
import { FollowRig, type RigMode } from './followRig';
import { nearForFollow } from './followNear';
import { FAR_MODE_ID, symbolThreshold } from './symbols/lod';
import { Domain, isEffectDomain, isWeaponDomain } from '../figures/symbolClass';
import { sideTable, SYMBOL_STYLE_ID } from './symbols/affiliation';
import type { SymbolParams } from './types';
import { TacticalLayer, axesOfTrack, cockpitClip } from './tactical';
import { figureNear, usePlanStore } from '../state/planStore';
import { playbackAt } from '../tactics/plan';
import { pickRef, refPoints } from '../tactics/gizmo';
import { setTerrain } from '../tactics/timing';
import { useTelemetry } from '../tactics/telemetryClient';
import { gamePreset } from '../tactics/games';
import type { Dataset, FilterSpec } from '../state/types';
import { CURVE_LUT_SIZE, bakeCurveLut, curveSignature } from '../state/curve';
import { buildColorLut, isUnassignedLabel, teamHueCount, teamMemberColor } from './colors';
import type { Projection } from './camera';
import { autoExposure, type ExposureResult } from './exposure';
import { FlyCamera, MIN_FLY_SPEED } from './camera';
import { createRenderer, type BackendPreference } from './createRenderer';
import {
  mapQuadFromAnchors,
  reliefDraw,
  sameLevelUpload,
  structureDraw,
  waterDraw,
  type Level,
} from './level';
import { appendCross, buildOverlay, screenToPlane, type MeasureState } from './measure';
import { endsOf } from '../data/despawn';
import { BudgetController, candidateRange, HeatLevel, nextExactCap, nextHeatCap, planFrame } from './sampling';
import { Inspector, type PickContext } from './inspector';
import type { DrawnRows } from './pick';
import { lookAtDistance, lookAtPitch, type Vec3 } from './pose';
import { useInspectStore } from '../state/inspectStore';
import { effectiveGpuBudget } from './budget';
import { buildActiveFilters, frameSignTables, sideScales, splitSideCounts, type SideCounts, type SplitTable } from './filterTables';
import { ExposureFollower } from './exposureFollow';
import { publishSplitStatus } from '../state/splitStatus';
import {
  MAX_PLAN_SPRITES,
  SAMPLE_BLOCK,
  type ActiveFilter,
  type BackendKind,
  type CapturedFrame,
  type ChunkDrawPlan,
  type FrameParams,
  type LevelDraw,
  type Renderer,
  type GpuTracksParams,
} from './types';
import { t } from '../i18n';
import { worldTiles } from '../world/tileSet';
import { VolumeGestures, rayToVertical } from '../volumes/gestures';
import { appendVolumeOverlay } from '../volumes/overlay';
import { packVolumes, type VolumeDraw } from '../volumes/gpu';
import { selectedVolume, useVolumeStore } from '../volumes/store';
import { volumeFilter } from '../volumes/volume';
import { postDrawFor, tacticalLevel, tacticalLines, LOOK_TINT, type LookTrack, type TacticalLook } from './tacticalLook';
import type { PostDraw } from './types';
import { unitCategory } from '../ui/replay/objectType';
import { unitsOf } from '../ui/replay/units';

export interface LiveReadout {
  playhead: number;
  fps: number;
  frameMs: number;
  splats: number;
  candidates: number;
  accumFrames: number;
  /**
   * Frames actually submitted to the GPU since startup.
   *
   * Distinct from wall-clock frames: the engine deliberately skips work when
   * nothing changed, so this advancing is the only evidence that motion is
   * producing new pictures rather than one held frame.
   */
  frames: number;
  /** Frames still needed for the accumulation to cover every candidate row. */
  convergeFrames: number;
  converged: boolean;
  /**
   * How the last rendered frame combined with the accumulation buffer.
   *
   * Exposed because the three modes normalise differently — `sum` divides by
   * `accumFrames` at composite, the others do not — so a mismatch between the mode
   * that filled the buffer and the mode that reads it shows up as the picture
   * drifting brighter or dimmer while nothing is moving. Without this it is
   * guesswork which path a frame took.
   */
  accumMode: 'reset' | 'mean' | 'ema' | 'extend' | 'skip';
  cubes: number;
  backend: BackendKind | 'none';
  budget: number;
  /** Rows resident on the GPU, and rows that did not fit. */
  residentRows: number;
  droppedRows: number;
  gpuBytes: number;
  /** GPU bytes of the level and the world tiles, apart from the rows' `gpuBytes`. */
  levelBytes: number;
  gpuName: string | null;
  /** Heat buffer resolution actually in use, after the auto throttle. */
  heatScale: number;
  /** Line heat's routes, while it has them: begun, reaching an end, segments. */
  lines: { routes: number; ended: number; segments: number; jumps: number } | null;
}

const EMPTY_PLAN: ChunkDrawPlan[] = [];


// The replay store for the smoke and performance scripts, beside window.__3dheat (dev only).
if (import.meta.env.DEV && typeof window !== 'undefined') (window as unknown as Record<string, unknown>).__3dheat_replay = useReplayStore;

/** From this many tracked things the GPU places the units (where it can). */
const GPU_TRACKS_FROM = 3000;

/**
 * Time constants of the follow cameras' easing, seconds: how long a change takes
 * to come about two thirds of the way. Chosen to match what the per-frame
 * shares they replace (0.12 of the heading, 0.2 of the race chase) did at 60
 * frames a second, without depending on the frame rate.
 */
const CHASE_HEADING_SECONDS = 0.13;
const RACE_CHASE_SECONDS = 0.075;
/** ?gputracks puts any dataset on the GPU path, ?gputracks=0 none: for comparing the two. */
function gpuTracksForced(): boolean | null {
  if (typeof location === 'undefined') return null;
  const v = new URLSearchParams(location.search).get('gputracks');
  return v === null ? null : v !== '0';
}

/**
 * Most sprites one frame can draw, whatever it is asked for.
 *
 * The draw plan's own ceiling, not a policy: a request for exactness past what a plan
 * can carry is capped here and the shortfall shows up honestly as `convergeFrames > 1`.
 */
const EXACT_SPRITE_CAP = MAX_PLAN_SPRITES;

/**
 * "Every row" is the default, and many sprites of a large radius can take a frame past what
 * the GPU's watchdog allows, which loses the device. So it starts at what always was the
 * limit, climbs while frames are easy and backs off while they are slow; a still view
 * converges just the same.
 *
 * Where the heat's GPU time is known, a frame that slow is a dropped one on every
 * camera move, so there the cap aims at a share of the frame instead; see
 * `nextHeatCap`. It starts where a window of tens of millions of rows still fits,
 * and a still view converges over a few frames rather than stalling one.
 */
const EXACT_STALL_MS = 400;
const EXACT_EASY_MS = 150;
const EXACT_START_SPRITES = 2_048 * SAMPLE_BLOCK;
const EXACT_FLOOR_SPRITES = 8 * SAMPLE_BLOCK;
/** The floor without the heat's GPU time, as it always was: the frame time cannot show what cutting buys. */
const EXACT_FLOOR_UNTIMED = 2_048 * SAMPLE_BLOCK;
/**
 * Share of the frame budget the heat pass may take, when the GPU times it. The
 * rest is the level, the composite and the margin a display's refresh needs.
 */
const HEAT_GPU_SHARE = 0.45;
/** Drawn frames the sprite cap holds after a change, for the smoothed GPU time to catch up. */
const CAP_HOLD_FRAMES = 12;
/** Frames between steps up of the sprites drawn: the GPU's reading of a frame comes back in two or three. */
const RAMP_FRAMES = 4;
/** Milliseconds of the heat's budget given over to data arriving a slice a frame. */
const ARRIVING_MS = 3;
/** Sprites the first frame of a new scene may draw; each frame after may draw up to twice the last. */
const RAMP_START_SPRITES = 64 * SAMPLE_BLOCK;
/** Drawn frames the sprite cap holds after a cut: the GPU's reading of a frame comes back in two or three. */
const CAP_CUT_HOLD_FRAMES = 4;

/**
 * Blend weight while the visible window is moving.
 *
 * Fixed rather than 1/n because the field itself is changing: an average over all
 * frames since playback started would lag behind the playhead. A third gives about
 * three frames of smoothing, enough to kill the worst of the sampling noise while
 * still tracking a moving window.
 */
const EMA_ALPHA = 0.34;

/**
 * Heat samples to meter for auto-exposure.
 *
 * A percentile only needs enough samples to be stable, and the field is read in
 * one bulk transfer either way, so this bounds the sort rather than the readback.
 */
const EXPOSURE_SAMPLES = 40_000;

/**
 * Rendered frames to let the field build before metering a new dataset.
 *
 * Enough that the estimate is not pure noise, few enough that the first look is
 * already exposed correctly.
 */
const AUTO_EXPOSE_AFTER_FRAMES = 8;

/**
 * Magnitude the estimated peak of the field is mapped to in a half-float target.
 *
 * See `heatGain`: the estimate is analytic, from the row count, the sprite and
 * the data's extent. Low enough that a field several times the estimate still
 * fits inside 65504, high enough that half float's 11-bit mantissa gives fine
 * steps at the values that matter. 2048 leaves 32x headroom above the top of the
 * ramp.
 */
const HEAT_F16_LEVEL = 2048;

/**
 * The two palette numbers a dataset implies: which group is neutral, and the
 * stride that keeps neighbouring ids from sharing a hue.
 */
/** The box every loaded lap fits in. */
/** A number per object, for telling whether the board's plan or draft is the one last drawn. */
const boardIds = (() => {
  const ids = new WeakMap<object, number>();
  let next = 1;
  return {
    of(o: object | null): number {
      if (!o) return 0;
      let id = ids.get(o);
      if (id === undefined) ids.set(o, (id = next++));
      return id;
    },
  };
})();

/** The box round a plan's figures and arrows, padded; null for an empty plan. */
function boardBounds(plan: import('../tactics/plan').Plan): { minX: number; minY: number; minZ: number; maxX: number; maxY: number; maxZ: number } | null {
  const pts: { x: number; y: number; z: number }[] = [];
  for (const f of plan.figures) for (const k of Object.values(f.keys)) pts.push(k);
  for (const a of plan.arrows) pts.push(...a.points);
  for (const a of plan.areas) pts.push(a.centre);
  if (!pts.length) return null;
  const b = { minX: Infinity, minY: Infinity, minZ: Infinity, maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity };
  for (const p of pts) {
    b.minX = Math.min(b.minX, p.x);
    b.maxX = Math.max(b.maxX, p.x);
    b.minY = Math.min(b.minY, p.y);
    b.maxY = Math.max(b.maxY, p.y);
    b.minZ = Math.min(b.minZ, p.z);
    b.maxZ = Math.max(b.maxZ, p.z);
  }
  const pad = Math.max(10, (b.maxX - b.minX + b.maxZ - b.minZ) * 0.15);
  return { minX: b.minX - pad, maxX: b.maxX + pad, minY: b.minY, maxY: b.maxY + 2, minZ: b.minZ - pad, maxZ: b.maxZ + pad };
}

function raceBounds(race: RaceState): { minX: number; minY: number; minZ: number; maxX: number; maxY: number; maxZ: number } {
  const b = { minX: Infinity, minY: Infinity, minZ: Infinity, maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity };
  for (const lap of race.laps) {
    const { x, y, z } = lap.channels;
    for (let i = 0; i < lap.count; i++) {
      b.minX = Math.min(b.minX, x[i]);
      b.maxX = Math.max(b.maxX, x[i]);
      b.minY = Math.min(b.minY, y[i]);
      b.maxY = Math.max(b.maxY, y[i]);
      b.minZ = Math.min(b.minZ, z[i]);
      b.maxZ = Math.max(b.maxZ, z[i]);
    }
  }
  return b;
}

function teamPaletteFor(dataset: Dataset | null): { neutral: number; slices: number } {
  const labels = dataset?.teamLabels ?? [];
  if (labels.length === 0) return { neutral: -1, slices: 1 };
    // Matched on the label, not the index: the index is a dictionary position and
  // depends on which value the first file happened to mention first.
  const neutral = labels.findIndex((l) => isUnassignedLabel(String(l)));
  return { neutral, slices: teamHueCount(labels.length) };
}

/**
 * Owns the render loop.
 *
 * Everything that changes at frame rate — camera transform, playhead, sampling
 * budget — lives here as plain fields rather than in the store, so a frame costs
 * no React work at all. The store is read once per frame (a property read) and
 * written back only for the low-frequency readouts.
 */
export class Engine {
  readonly camera = new FlyCamera();
  private renderer: Renderer | null = null;
  private raf = 0;
  private detachInput: (() => void) | null = null;
  private disposed = false;

  private dataset: Dataset | null = null;
  /**
   * The dataset whose GPU upload has been announced but not yet performed.
   *
   * Held separately from `dataset` because the announcement and the work happen
   * on different frames — see the note in the render loop — and without it the
   * loop would announce the same upload forever and never get to it.
   */
  private uploadAnnounced: Dataset | null = null;

  /**
   * The team palette's two derived numbers, recomputed only when the data changes.
   *
   * Both depend on the group *labels* rather than on any setting, so they belong
   * with the dataset and not in the per-frame parameters — finding which label
   * means "unassigned" is a string search over every group, which is not something
   * to repeat sixty times a second.
   */
  private teamPalette: { neutral: number; slices: number } = { neutral: -1, slices: 1 };
  private level: Level | null = null;
  /**
   * What the renderer last got of the world tiles: from which tile-set version,
   * whether a model level was there to draw them with, and which renderer it
   * was. Any one differing hands the set over again; none differing costs three
   * comparisons a frame.
   */
  private tilesVersion = -1;
  private tilesForModel = false;
  private tilesRenderer: Renderer | null = null;
  private cursor: TrackCursor | null = null;

  private lastNow = 0;
  private fpsAccum = 0;
  private fpsFrames = 0;
  private smoothedFrameMs = 16.6;

  private playhead = 0;
  private wasPlaying = false;
  /** The playhead the team view's units were last placed at; NaN before the first. */
  private teamDrawnAt = NaN;
  private lastSeekNonce = -1;
  private lastPublish = 0;

  private geometrySig = '';
  /** What line heat's routes were built from, or '' when there are none. */
  private linesKey = '';
  private lines: LineData | null = null;
  /**
   * What kind of heat the saturation was last metered on: points, or lines
   * built from particular routes. Null before the first heat mode is shown.
   */
  private meteredKind: string | null = null;
  private windowSig = '';
  private compositeSig = '';
  private accumFrames = 0;
  private frameIndex = 0;
  /** Last fly speed seen from the store, to tell a slider edit from a wheel notch. */
  private lastStoreFlySpeed = Number.NaN;
  /** Rendered frames remaining before the automatic exposure pass. */
  private autoExposePending = 0;
  /** The filters the exposure was last metered for: a change meters it again. */
  private meteredFilters: FilterSpec[] | null = null;
  /** Re-meters the exposure when the camera comes to rest; see `followExposure`. */
  private readonly follower = new ExposureFollower();
  /** A follow reading is in flight; another is not started until it lands. */
  private followMetering = false;
  /** Rows on each side of the difference, and what they were counted for. */
  private sideCounts: SideCounts = { positive: 0, negative: 0, exact: true };
  private sideCountsKey = '';
  private sideCountsRange: [number, number] = [0, 0];
  private sideCountsAt = 0;
  /** Chunks the last splat left out for want of the split's column, of how many. */
  private splitChunks = { skipped: 0, total: 0 };
  /** Last projection seen from the store, to tell a UI change from a camera one. */
  private lastStoreProjection: Projection | null = null;
  /** Splat scale in force for the current frame; see `heatGain`. */
  private frameGain = 1;
  /**
   * The row range the accumulation buffer currently represents, when it is a
   * growing cumulative window.
   *
   * `-1` means the buffer is not a valid cumulative accumulation — it has just
   * been reset, or the window is one that slides rather than grows — and the next
   * frame has to estimate from scratch.
   */
  private accumRowLo = -1;
  private accumRowHi = -1;
  private lastCubeCount = 0;
  private budget: BudgetController;

  private readonly viewProj = new Matrix4();
  /**
   * World to display: -1 on each inverted axis (CameraSettings.mirror). The
   * camera lives in display space, so flying and looking work as usual on a
   * mirrored world; the renderers, the overlays and the tools all get world
   * coordinates, through this reflection folded into the view matrix.
   */
  private mirror: [number, number, number] = [1, 1, 1];
  private readonly mirrorMat = new Matrix4();
  private readonly viewMirrored = new Matrix4();
  /**
   * Maps clip-space depth from OpenGL's [-1, 1] to WebGPU's [0, 1].
   *
   * three.js builds projection matrices in the OpenGL convention. WebGPU clips
   * anything with z < 0, so without this correction a perspective view merely
   * loses depth precision — most of the scene happens to land near z = +1 — while
   * an orthographic view, whose depth is linear, lands almost entirely at
   * negative z and is clipped away in its entirety. The symptom is an empty
   * frame with no error, which is why it is applied explicitly here rather than
   * left to chance.
   */
  private readonly depthRemap = new Matrix4().set(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 0.5, 0.5,
    0, 0, 0, 1,
  );
  private readonly viewProjArr = new Float32Array(16);
  private readonly viewArr = new Float32Array(16);
  private readonly projArr = new Float32Array(16);
  private readonly camPos = new Float32Array(3);
  private readonly viewProjRelArr = new Float32Array(16);
  private readonly originArr = new Float32Array(3);
  /** Unit vector the camera looks along; see the planar distance cull. */
  private readonly camFwd = new Float32Array(3);
  private lut: Uint8Array = new Uint8Array(0);
  private lutSig = '';
  private curveLut: Float32Array = new Float32Array(0);
  private curveSig = '';
  /** The group and split sign tables, reused from frame to frame. */
  private readonly signScratch: { group: Int8Array | null; split: Int8Array | null } = {
    group: null,
    split: null,
  };
  /**
   * Each filter's slot description, by the spec it came from.
   *
   * The store replaces a spec whenever it changes, so an unchanged one can keep
   * its description — the person filter's mask in particular. Dropped with the
   * dataset, which the descriptions depend on.
   */
  private filterCache = new WeakMap<FilterSpec, ActiveFilter>();

  /** How many sprites "every row" may ask for now; see `EXACT_STALL_MS`. */
  private exactCap = EXACT_START_SPRITES;
  /** The heat buffer's resolution level, from the sprites' size; see `HeatLevel`. */
  private readonly heatLevel = new HeatLevel();
  /** The heat scale the buffer was last drawn at; 0 before the first frame. */
  private heatScaleUsed = 0;
  /** Smoothed time of frames that followed a frame which drew, for the controllers. */
  private drawnFrameMs = 16.6;
  /** The user's own heat scale when `heatScaleUsed` was taken. */
  private heatScaleUserSet = 0;
  /** The last frame's heat cost and its budget, for the sprite cap. */
  private heatCostMs = 0;
  private heatBudgetMs = 1;
  /** Sprites a frame of the current run of accumulation draws; see `planFrame`. */
  private runSplats = 0;
  /** Whether the cap's hold follows a step up, which a cut need not wait out. */
  private capHoldAfterGrowth = false;
  /** The frame the drawn sprites last stepped up on; see `RAMP_FRAMES`. */
  private rampFrame = -Infinity;
  /** The heat cost's latest reading where it is above the average. */
  private heatCostPeak = 0;
  /** Whether the growing window's base was drawn thinned, while the camera moved. */
  private baseThinned = false;
  /** Sprites the last frame that drew drew. */
  private prevSprites = 0;
  /** Whether the renderer had geometry on its way last frame. */
  private wasUploading = false;
  /** Whether the heat pass's GPU time is known, rather than only the frame's. */
  private heatTimed = false;
  /** Drawn frames before the sprite cap may move again. */
  private capHold = 0;
  /** The texel radius the sprite cap was last sized for. */
  private capTexelRadius = 0;
  /** The saturation the last frame was composited with, a glide's included. */
  private shownSaturation: number | null = null;
  /** Whether the last frame splatted anything: one that only recomposited says nothing of the cost. */
  private lastFrameDrew = false;

  /** The near plane of the last frame; see `nearForView`. */
  private viewNear = 1;
  /** The far plane of the last frame; see `farForView`. */
  private viewFar = 40_000;

  readonly live: LiveReadout = {
    playhead: 0,
    fps: 0,
    frameMs: 0,
    splats: 0,
    candidates: 0,
    accumFrames: 0,
    frames: 0,
    convergeFrames: 0,
    converged: false,
    accumMode: 'reset',
    cubes: 0,
    backend: 'none',
    budget: 0,
    residentRows: 0,
    droppedRows: 0,
    gpuBytes: 0,
    levelBytes: 0,
    gpuName: null,
    heatScale: 1,
    lines: null,
  };

  initError: string | null = null;

  /**
   * Ruler state. Lives here rather than in the store because the cursor moves
   * with the mouse and the heat probe is read from the framebuffer — neither
   * belongs in React's update cycle.
   */
  readonly measure: MeasureState = { points: [], cursor: null, heat: null };
  measureEnabled = false;
  /** Click-to-inspect: the pick card's answers and the marker it draws. */
  readonly inspector = new Inspector();
  /** Which heat rows the last frame drew, for answering a click on one. */
  private drawn: DrawnRows | null = null;
  /** The box replay's boxes as last built, for the same. */
  private pickCubes: PickContext['cubes'] = null;
  /**
   * World to clip in OpenGL's depth convention, whatever the backend: the
   * pick's projection, which also rejects what is past the near and far planes
   * and so must not see WebGPU's remapped depth.
   */
  private readonly pickViewProj = new Float32Array(16);
  private cursorPx: { x: number; y: number } | null = null;
  private overlayBuf: Float32Array = new Float32Array(0);
  /** The race tab's geometry, and what it was last built from. */
  private readonly raceScene = new RaceScene();
  private raceBuiltFrom: RaceState | null = null;
  private raceBuiltAt = Number.NaN;
  private raceBuiltHover: number | null = null;
  private raceWasTab = false;
  /** The tactics board's geometry, and where on the level the pointer is while a board tool wants it. */
  private readonly boardScene = new BoardScene();
  /** The vehicle heatmap's figure and its turntable. */
  private readonly vehicleStage = new VehicleStage();
  /** Box replay as figures. */
  private readonly figureReplay = new FigureReplay();
  /** Smokes, fires and the bomb from the event rows, in box replay. */
  private readonly effects = new EffectLayer();
  /** Box replay's motion between samples: smooth curves and shortest-arc attitudes (figures/motion.ts). */
  private readonly motion = new MotionRefiner();
  private readonly motionSample = emptySample();
  private readonly followSample = emptySample();
  /** The GPU tracks the last frame placed its units from, for the follow camera. */
  private lastGpuStore: GpuTrackStore | null = null;
  /** Weapons, shots, hits and kills in box replay (render/weapons.ts). */
  private readonly weapons = new WeaponLayer();
  private readonly weaponTris = new VertexBuffer();
  /** Fires burning on units, from the data's fire_on to fire_off (figures/fires.ts); the GPU tracks' own triangles. */
  private readonly fireLayer = new FireLayer();
  private readonly fireTris = new VertexBuffer();
  /** Per person: the live track it is this frame (CPU path), valid where its stamp is this frame's. */
  private fireSlot = new Int32Array(0);
  private fireSeen = new Int32Array(0);
  private fireStamp = 0;
  private fireStore: GpuTrackStore | null = null;
  private fireFigureScale = 1;
  private fireF32Of: Uint32Array | null = null;
  private fireF32: Float32Array = new Float32Array(0);
  private fireMinPixels = 0;
  private readonly fireTrackPose = emptyPose();
  private readonly fireView: FireView = {
    t: 0,
    eye: [0, 0, 0],
    pixelSize: () => 0,
    units: 1,
    poseOf: (p, body, out) => this.firePose(p, body, out),
  };
  /** Marks where shots struck the units (figures/hitmarks.ts), onto the same triangles as the fires. */
  private readonly hitMarkLayer = new HitMarkLayer();
  /** Per person: the figure it was placed as this frame (CPU path), valid where its stamp is this frame's. */
  private markSlot = new Int32Array(0);
  private markSeen = new Int32Array(0);
  private markStamp = 0;
  /** The row of the unit the last `firePose` placed. */
  private poseRow = -1;
  private readonly markView: MarkView = {
    t: 0,
    seconds: 10,
    session: -1,
    eye: [0, 0, 0],
    pixelSize: () => 0,
    units: 1,
    poseOf: (p, body, out) => this.markPose(p, body, out),
    dataset: null as unknown as Dataset,
  };
  private smoothTrailBuf = new Float32Array(0);
  private figureTris: { data: Float32Array; count: number } | null = null;
  /** This frame's GPU tracks, when the GPU places the units (gpuTracks/). */
  private gpuTracksParams: GpuTracksParams | null = null;
  /** Below this many pixels at true size a GPU-placed unit is a dart; steered by the frame time. */
  private dartPx = 3;
  /** Frame interval, ms, smoothed: what steers the GPU tracks' level of detail. */
  private frameMsAvg = 16;
  private readonly gpuPose = emptyPose();
  /** Box replay's figures as GPU instances this frame (`figures/instances.ts`). */
  private figureBatches: FigureBatch[] | null = null;
  /**
   * Box replay's live tracks as last built: who, which row, where, which way
   * (box yaw). What the replay's labels and the follow camera read.
   */
  liveTracks: { person: number; row: number; x: number; y: number; z: number; yaw: number; pitch: number; q: number[] | null }[] = [];
  /** The replay's cockpit, fixed, padlock, target and satellite views (`followRig.ts`). */
  private readonly followRig = new FollowRig();
  /** The near plane the cockpit views ask for (data units), 0 for none. */
  private rigNear = 0;
  /** Velocity vectors, radar cones, locks and engagement domes (`tactical.ts`). */
  private readonly tactical = new TacticalLayer();
  /** The follow camera as it last set the view (display space): the eased unit, its heading, the orbit, the pose. */
  private followCam: { person: number; fx: number; fy: number; fz: number; head: number; rel: number; yaw: number; pitch: number; px: number; py: number; pz: number } | null = null;
  /** Trails and drop lines together, reused frame to frame. */
  private dropBuf = new Float32Array(0);
  /** The tactical display's rings and ladders, appended to the trail lines. */
  private readonly lookBuf = { buf: new Float32Array(0) };
  /** Which persons are aircraft, per dataset: the ladders stand under those. */
  private airOf: { d: Dataset; air: Uint8Array } | null = null;
  /** `performance.now()` of the director's last cut: the tactical display flashes on it. */
  lookCutAt = -1e9;
  private boardCursor: { x: number; y: number; z: number } | null = null;
  /** Where the chase camera was, so it glides rather than jitters. */
  private chase: { x: number; y: number; z: number; yaw: number } | null = null;
  private lastProbe = 0;

  /** Set when the preferred backend was unavailable, for display. */
  backendFallbackReason: string | null = null;

  /** Backend-specific diagnostics, when the backend exposes any. */
  get rendererDebug(): unknown {
    return (this.renderer as unknown as { debug?: unknown })?.debug ?? null;
  }

  /**
   * Read back the composited frame, when the backend supports it.
   *
   * The WebGPU backend needs this to be testable at all: headless Chromium
   * renders it correctly but never composites the canvas, so reading the canvas
   * gives a transparent black image no matter what was drawn.
   */
  /**
   * What the live backend can say about the GPU.
   *
   * Exposed so the memory budget can be sized from a real context instead of the
   * panel creating a throwaway one, which on a weak machine can evict the context
   * the app is drawing with.
   */
  rendererInfo(): { gpuName: string | null; maxTextureSize: number; maxBufferBytes: number | null } | null {
    const r = this.renderer;
    if (!r) return null;
    return {
      gpuName: r.gpuName,
      maxTextureSize: r.gpuLimits.maxTextureSize,
      maxBufferBytes: r.gpuLimits.maxBufferBytes,
    };
  }

  captureFrame(): Promise<CapturedFrame | null> {
    if (!this.renderer?.captureFrame) return Promise.resolve(null);
    // A converged, unchanged view legitimately skips rendering entirely, so a
    // capture would wait for a frame that never comes. Force a few.
    this.forceRenderFrames = 4;
    return this.renderer.captureFrame();
  }

  /** Frames remaining that must render even if nothing changed. */
  private forceRenderFrames = 0;

  /** Force the next frame to redraw, e.g. after an external state change. */
  invalidate(frames = 1): void {
    this.forceRenderFrames = Math.max(this.forceRenderFrames, frames);
  }

  constructor(readonly canvas: HTMLCanvasElement) {
    this.budget = new BudgetController(snapshot().budget.splatsPerFrame);
    this.detachInput = this.camera.attach(canvas);
    this.detachMeasure = this.attachMeasureInput(canvas);
    // The tactics board: its gizmo keys while something is selected, shift-drag for a box.
    const boardKeys = { editor: ['KeyW', 'KeyE', 'KeyR'], blender: ['KeyG', 'KeyR', 'KeyS'] };
    this.camera.keyFilter = (e) => {
      if (useRaceStore.getState().tab !== 'plan' || e.ctrlKey || e.metaKey || e.altKey) return false;
      const b = usePlanStore.getState();
      return b.selection.length > 0 && boardKeys[b.keyScheme].includes(e.code);
    };
    this.camera.pressFilter = (e) => e.button === 0 && e.shiftKey && useRaceStore.getState().tab === 'plan' && usePlanStore.getState().tool === 'select';
    setTerrain((x, y, z, reach) => this.surfaceBelow(x, y, z, reach), 0);
    this.detachVolumes = this.attachVolumeInput(canvas);
  }

  // ---------------------------------------------------------------- volumes

  /** Drawing and editing the user's volumes on the view (volumes/gestures.ts). */
  readonly volumeGestures = new VolumeGestures({
    ground: (sx, sy) => {
      const p = this.worldAt(sx, sy);
      return p ? [p.x, p.y, p.z] : null;
    },
    plane: (sx, sy, y) => {
      const ray = this.rayAt(sx, sy);
      if (!ray || Math.abs(ray.dir.y) < 1e-9) return null;
      const t = (y - ray.origin.y) / ray.dir.y;
      if (!(t > 0) || !Number.isFinite(t)) return null;
      return [ray.origin.x + ray.dir.x * t, y, ray.origin.z + ray.dir.z * t];
    },
    toScreen: (p) => this.toScreen(p[0], p[1], p[2]),
    vertical: (sx, sy, x, z) => {
      const ray = this.rayAt(sx, sy);
      if (!ray) return null;
      return rayToVertical([ray.origin.x, ray.origin.y, ray.origin.z], [ray.dir.x, ray.dir.y, ray.dir.z], x, z);
    },
    dataset: () => this.dataset,
  });
  private detachVolumes: (() => void) | null = null;
  /** Bumped when the volumes change, for the overlay's redraw. */
  private volumeRev = 0;
  /** The volumes filter as last packed, and what it was packed from. */
  private volumeDraw: VolumeDraw | null = null;
  private volumeDrawFrom: unknown = null;

  /** A world point in CSS pixels of the canvas, or null behind the camera. */
  toScreen(x: number, y: number, z: number): [number, number] | null {
    const m = this.pickViewProj;
    const cx = m[0] * x + m[4] * y + m[8] * z + m[12];
    const cy = m[1] * x + m[5] * y + m[9] * z + m[13];
    const cw = m[3] * x + m[7] * y + m[11] * z + m[15];
    if (cw <= 1e-9) return null;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    return [((cx / cw) * 0.5 + 0.5) * w, (1 - ((cy / cw) * 0.5 + 0.5)) * h];
  }

  /**
   * The hit whose mark (figures/hitmarks.ts) is under a point of the canvas
   * (CSS pixels), the nearest of those drawn last frame within its size or
   * `slack` pixels; its index in `hitsOf(dataset).hits`, or -1.
   */
  hitMarkAt(cssX: number, cssY: number, slack = 4): number {
    const dr = this.hitMarkLayer.drawn;
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < dr.count; i++) {
      const x = dr.xyz[i * 3], y = dr.xyz[i * 3 + 1], z = dr.xyz[i * 3 + 2];
      const s = this.toScreen(x, y, z);
      if (!s) continue;
      const d = Math.hypot(s[0] - cssX, s[1] - cssY);
      if (d > slack + 40 || d >= bestD) continue;
      // The mark's own radius on screen: a point its radius off to the side.
      const e = this.toScreen(x + dr.radius[i], y, z);
      const r = e ? Math.hypot(e[0] - s[0], e[1] - s[1]) : 0;
      if (d <= Math.max(r, 3) + slack) {
        bestD = d;
        best = dr.hit[i];
      }
    }
    return best;
  }

  /** Whether the volume tools work on the current tab: the heatmap and the match views show the level. */
  private volumesLive(): boolean {
    const tab = useRaceStore.getState().tab;
    return tab === 'heat' || tab === 'match';
  }

  /**
   * Pointer and keys for the volume tools.
   *
   * On the window in the capture phase, so a press the tools take - drawing, or
   * on the selected volume's handles or body - is stopped before the camera's
   * own handlers see it: the view must not turn while a handle is dragged. A
   * press they do not take passes through untouched.
   */
  private attachVolumeInput(canvas: HTMLCanvasElement): () => void {
    const g = this.volumeGestures;
    let active = false;
    const at = (e: MouseEvent): [number, number] => {
      const r = canvas.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    const mods = (e: MouseEvent) => ({ shift: e.shiftKey, alt: e.altKey });
    const onDown = (e: MouseEvent) => {
      if (e.target !== canvas || e.button !== 0 || !this.volumesLive()) return;
      const [x, y] = at(e);
      if (!g.down(x, y, mods(e))) return;
      active = true;
      e.stopPropagation();
      e.preventDefault();
      canvas.focus({ preventScroll: true });
      this.invalidate(2);
    };
    const onMove = (e: MouseEvent) => {
      if (!active && (e.target !== canvas || !this.volumesLive())) return;
      const [x, y] = at(e);
      const before = g.version;
      g.move(x, y, mods(e));
      if (g.version !== before) this.invalidate(2);
    };
    const onUp = (e: MouseEvent) => {
      if (!active || e.button !== 0) return;
      active = false;
      const [x, y] = at(e);
      g.up(x, y, mods(e));
      this.invalidate(2);
    };
    const onDbl = (e: MouseEvent) => {
      if (e.target !== canvas || !this.volumesLive()) return;
      if (g.dblclick()) {
        e.stopPropagation();
        e.preventDefault();
        this.invalidate(2);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (!this.volumesLive()) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)) return;
      if (g.key(e.code, e.ctrlKey || e.metaKey, e.shiftKey)) {
        e.stopPropagation();
        e.preventDefault();
        this.invalidate(2);
      }
    };
    const unsub = useVolumeStore.subscribe((s, prev) => {
      if (s.volumes !== prev.volumes || s.selected !== prev.selected || s.filter !== prev.filter || s.drawing !== prev.drawing) {
        this.volumeRev++;
        // A tool put down from the panel mid-polygon drops the polygon.
        if (!s.drawing && prev.drawing && g.busy) g.cancel();
        this.invalidate(2);
      }
    });
    window.addEventListener('mousedown', onDown, true);
    window.addEventListener('mousemove', onMove, true);
    window.addEventListener('mouseup', onUp, true);
    window.addEventListener('dblclick', onDbl, true);
    window.addEventListener('keydown', onKey, true);
    return () => {
      unsub();
      window.removeEventListener('mousedown', onDown, true);
      window.removeEventListener('mousemove', onMove, true);
      window.removeEventListener('mouseup', onUp, true);
      window.removeEventListener('dblclick', onDbl, true);
      window.removeEventListener('keydown', onKey, true);
    };
  }

  /**
   * The volumes filter for this frame, packed for the heat shaders: rebuilt
   * only when the volumes or the filter change.
   */
  private frameVolumes(): VolumeDraw | null {
    const v = useVolumeStore.getState();
    if (this.volumeDrawFrom !== v.volumes || this.volumeDraw?.mode !== (v.filter === 'inside' ? 1 : v.filter === 'outside' ? 2 : undefined)) {
      this.volumeDrawFrom = v.volumes;
      this.volumeDraw = packVolumes(v.volumes, v.filter);
    }
    return this.volumesLive() ? this.volumeDraw : null;
  }

  /**
   * Drop the boxes outside the volumes filter from this frame's live boxes:
   * the box replay shows what the heat shows. Compacts in place, keeping each
   * box's row and motion pose with it; returns the new count.
   */
  private filterCubes(cubes: Float32Array, count: number, stride: number, rows: Int32Array, poses: Float32Array | null, posed: Uint8Array | null, exact: Float64Array | null = null): number {
    const v = useVolumeStore.getState();
    const keep = this.volumesLive() ? volumeFilter(v.volumes, v.filter) : null;
    if (!keep) return count;
    let j = 0;
    for (let i = 0; i < count; i++) {
      const o = i * stride;
      if (!keep(cubes[o], cubes[o + 1], cubes[o + 2])) continue;
      if (i !== j) {
        cubes.copyWithin(j * stride, o, o + stride);
        if (rows.length > i) rows[j] = rows[i];
        if (poses && poses.length >= (i + 1) * 4) poses.copyWithin(j * 4, i * 4, i * 4 + 4);
        if (posed && posed.length > i) posed[j] = posed[i];
        if (exact && exact.length >= (i + 1) * 3) exact.copyWithin(j * 3, i * 3, i * 3 + 3);
      }
      j++;
    }
    return j;
  }

  /**
   * Create the GPU backend.
   *
   * Separate from the constructor because WebGPU initialisation is asynchronous;
   * the input handlers are attached first so the camera works even if the
   * renderer fails.
   */
  async init(preference: BackendPreference = 'auto'): Promise<void> {
    try {
      const created = await createRenderer(this.canvas, preference);
      if (this.disposed) {
        created.renderer.dispose();
        return;
      }
      this.renderer = created.renderer;
      this.backendFallbackReason = created.fallbackReason;
      this.live.backend = created.backend;
      this.live.gpuName = created.renderer.gpuName;
      useStore.getState().reportStats({ backend: created.backend });
    } catch (err) {
      this.initError = err instanceof Error ? err.message : String(err);
    }
  }

  private detachMeasure: (() => void) | null = null;

  /**
   * Ruler input.
   *
   * Deliberately separate from the camera's handlers: the camera claims drag for
   * look, so a measurement click has to be distinguished from the start of a
   * drag by movement, not by button.
   */
  private attachMeasureInput(canvas: HTMLCanvasElement): () => void {
    let downAt: { x: number; y: number } | null = null;
    /**
     * How far the pointer travelled while the button was down.
     *
     * Summed from the movement deltas rather than read off the client
     * position at release, because the camera takes a pointer lock on press:
     * under the lock the client position stays where the press was, so a long
     * drag would end where it began and read as a click.
     */
    let travel = 0;

    const toCanvas = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMove = (e: MouseEvent) => {
      this.cursorPx = toCanvas(e);
    };
    const onTravel = (e: MouseEvent) => {
      if (downAt) travel += Math.abs(e.movementX) + Math.abs(e.movementY);
    };
    const onLeave = () => {
      this.cursorPx = null;
      this.measure.cursor = null;
      this.measure.heat = null;
    };
    const onDown = (e: MouseEvent) => {
      downAt = toCanvas(e);
      travel = 0;
      this.boardBox = this.camera.pressFilter?.(e) ? { x0: downAt.x, y0: downAt.y, x1: downAt.x, y1: downAt.y } : null;
    };
    const onBoxMove = (e: MouseEvent) => {
      if (!this.boardBox) return;
      const p = toCanvas(e);
      this.boardBox = { ...this.boardBox, x1: p.x, y1: p.y };
    };
    const onUp = (e: MouseEvent) => {
      if (e.button !== 0 || !downAt) return;
      const from = downAt;
      const at = toCanvas(e);
      // Anything past a few pixels was a camera drag, not a click.
      const moved = Math.max(travel, Math.hypot(at.x - from.x, at.y - from.y));
      downAt = null;
      const box = this.boardBox;
      this.boardBox = null;
      if (box && Math.hypot(box.x1 - box.x0, box.y1 - box.y0) > 4) {
        this.boardBoxSelect(box);
        return;
      }
      if (moved > 4) return;
      // The tactics board owns clicks on its tab.
      if (useRaceStore.getState().tab === 'plan') {
        this.boardClick(from.x, from.y, e.shiftKey);
        return;
      }
      // The vehicle heatmap's clicks pick a hit.
      if (useRaceStore.getState().tab === 'vehicle') {
        this.vehicleStage.click(from.x, from.y, canvas.clientWidth, canvas.clientHeight, this.pickViewProj);
        return;
      }
      // The ruler, when on, owns the click; picking waits until it is off, so
      // placing a ruler point never also opens a card.
      if (this.measureEnabled) {
        const p = this.measure.cursor;
        if (p) this.measure.points.push({ ...p });
        return;
      }
      // A click on a volume selects it, for its handles; elsewhere it deselects.
      if (this.volumesLive() && this.volumeGestures.click(from.x, from.y)) return;
      if (useInspectStore.getState().pickOnClick) this.pickAt(from.x, from.y);
    };
    const onContext = (e: MouseEvent) => {
      // On the board a right click ends what is being drawn.
      if (useRaceStore.getState().tab === 'plan') {
        e.preventDefault();
        const board = usePlanStore.getState();
        if (board.draft) board.finish();
        else board.cancel();
        return;
      }
      if (!this.measureEnabled) return;
      e.preventDefault();
      // Right-click removes the last point; empties the ruler when it runs out.
      this.measure.points.pop();
    };

    canvas.addEventListener('mousemove', onMove);
    window.addEventListener('mousemove', onTravel);
    window.addEventListener('mousemove', onBoxMove);
    canvas.addEventListener('mouseleave', onLeave);
    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('contextmenu', onContext);
    return () => {
      canvas.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousemove', onTravel);
      window.removeEventListener('mousemove', onBoxMove);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('contextmenu', onContext);
    };
  }

  /** The ray under a CSS-pixel canvas position, in world space (through the axis mirror). */
  private rayAt(cssX: number, cssY: number): { origin: { x: number; y: number; z: number }; dir: { x: number; y: number; z: number } } | null {
    const cam = this.camera.camera;
    const w = this.canvas.clientWidth;
    const hgt = this.canvas.clientHeight;
    if (w <= 0 || hgt <= 0) return null;
    const ndcX = (cssX / w) * 2 - 1;
    const ndcY = 1 - (cssY / hgt) * 2;
    const inv = new Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse).invert();
    const a = new Vector3(ndcX, ndcY, -1).applyMatrix4(inv);
    const b = new Vector3(ndcX, ndcY, 1).applyMatrix4(inv);
    const origin = this.mirrorPoint(a.x, a.y, a.z);
    const far = this.mirrorPoint(b.x, b.y, b.z);
    const len = Math.hypot(far.x - origin.x, far.y - origin.y, far.z - origin.z) || 1;
    return { origin, dir: { x: (far.x - origin.x) / len, y: (far.y - origin.y) / len, z: (far.z - origin.z) / len } };
  }

  /**
   * The point on the level under a canvas position: its surface where the
   * level's index is built, else the ground plane (the data's floor, or 0).
   */
  worldAt(cssX: number, cssY: number): { x: number; y: number; z: number } | null {
    const ray = this.rayAt(cssX, cssY);
    if (!ray) return null;
    const hit = this.inspector.surfaceHit(ray);
    if (hit) return hit;
    const planeY = this.dataset ? this.dataset.bounds.minY : 0;
    const t = Math.abs(ray.dir.y) > 1e-9 ? (planeY - ray.origin.y) / ray.dir.y : -1;
    if (t <= 0) return null;
    return { x: ray.origin.x + ray.dir.x * t, y: planeY, z: ray.origin.z + ray.dir.z * t };
  }

  /** A click on the tactics board: the point on the level, and what is there, to the board's store. */
  private boardClick(cssX: number, cssY: number, additive = false): void {
    const at = this.worldAt(cssX, cssY);
    if (!at) return;
    const board = usePlanStore.getState();
    const scale = Math.max(0.05, board.plan.figureScale);
    // Each figure within its own size of its middle, and never less than a body width.
    const reachOf = (f: { kind: string }) => {
      const t = templateOf(f.kind);
      const size = t ? Math.max(t.max[0] - t.min[0], t.max[2] - t.min[2]) * 0.6 : 1.2;
      return Math.max(1.2, size) * scale;
    };
    if (board.tool === 'select') {
      const ref = pickRef(board.plan, board.step, at, (kind) => reachOf({ kind }), gamePreset(board.plan.game).arrowWidth);
      board.click(at, ref, additive);
      return;
    }
    const hit = figureNear(board.plan, board.step, at, reachOf);
    board.click(at, hit?.id ?? null);
  }

  /** The rectangle being dragged out on the board (shift-drag), CSS pixels; the gizmo overlay draws it. */
  boardBox: { x0: number; y0: number; x1: number; y1: number } | null = null;

  /** Adds everything of the shown step whose place falls in a screen rectangle to the board's selection. */
  private boardBoxSelect(box: { x0: number; y0: number; x1: number; y1: number }): void {
    const b = usePlanStore.getState();
    const [x0, x1] = [Math.min(box.x0, box.x1), Math.max(box.x0, box.x1)];
    const [y0, y1] = [Math.min(box.y0, box.y1), Math.max(box.y0, box.y1)];
    const inside = (p: { x: number; y: number; z: number }) => {
      const s = this.project(p.x, p.y, p.z);
      return !!s && s.x >= x0 && s.x <= x1 && s.y >= y0 && s.y <= y1;
    };
    const p = b.plan;
    const refs: string[] = [];
    for (const f of p.figures) if (refPoints(p, b.step, f.id).some(inside)) refs.push(f.id);
    for (const a of p.arrows) if (a.step === b.step) a.points.forEach((q, i) => inside(q) && refs.push(`${a.id}#${i}`));
    for (const a of p.areas) if (a.step === b.step && inside(a.centre)) refs.push(a.id);
    for (const n of p.notes) if (n.step === b.step && inside(n.at)) refs.push(n.id);
    b.selectRefs([...new Set([...b.selection, ...refs])], false);
  }

  /** The world ray under a canvas position, for the board's gizmo. */
  boardRay(cssX: number, cssY: number): { origin: { x: number; y: number; z: number }; dir: { x: number; y: number; z: number } } | null {
    return this.rayAt(cssX, cssY);
  }

  /** The level's surface below a point, within `reach` under it; null without a level there. */
  surfaceBelow(x: number, y: number, z: number, reach: number): number | null {
    const hit = this.inspector.surfaceHit({ origin: { x, y, z }, dir: { x: 0, y: -1, z: 0 } });
    return hit && y - hit.y <= reach ? hit.y : null;
  }
  private boardTerrainKey: unknown = null;
  private boardTerrainReady = false;
  private boardTerrainStamp = 0;

  /**
   * Board playback time while a plan plays, seconds: advanced here each frame
   * and written to the store only at a step change, at the end, or four times
   * a second - a store write at frame rate would re-render the sidebar with it.
   * Null when not playing. The board's labels read it.
   */
  boardPlayTime: number | null = null;
  private boardLastPublish = 0;
  private boardKey = '';
  private boardFrame: { tris: import('../race/geometry').VertexBuffer; lines: import('../race/geometry').VertexBuffer } | null = null;

  /**
   * The board as it is this frame: playback advanced, the pointer followed
   * while a tool draws. Rebuilt only when something it shows changed; the
   * second value says whether it did.
   */
  private buildBoard(dt: number): [{ tris: import('../race/geometry').VertexBuffer; lines: import('../race/geometry').VertexBuffer }, boolean] {
    const board = usePlanStore.getState();
    if (board.playing) {
      const was = this.boardPlayTime ?? board.playTime;
      const now = was + dt;
      const total = playbackAt(board.plan, now).total;
      this.boardPlayTime = Math.min(now, total);
      const stepChanged = playbackAt(board.plan, was).step !== playbackAt(board.plan, now).step;
      if (stepChanged || now >= total || now - this.boardLastPublish > 0.25) {
        this.boardLastPublish = now;
        board.setPlayTime(this.boardPlayTime);
        if (now >= total) this.boardPlayTime = null;
      }
    } else if (this.boardPlayTime !== null) {
      // Paused: the store takes the time the board stood at, not the last one published.
      board.setPlayTime(this.boardPlayTime);
      this.boardPlayTime = null;
    }
    // Route timings follow the level's surface: a new level, or its index done, times them again.
    const lvl = useStore.getState().level;
    const ready = this.inspector.surfaceState.ready;
    if (this.boardTerrainKey !== lvl || this.boardTerrainReady !== ready) {
      this.boardTerrainKey = lvl;
      this.boardTerrainReady = ready;
      setTerrain((x, y, z, reach) => this.surfaceBelow(x, y, z, reach), ++this.boardTerrainStamp);
      this.boardKey = '';
    }
    const heat = useTelemetry.getState().heat;
    const wantsCursor = board.tool !== 'select' || board.moving;
    this.boardCursor = wantsCursor && this.cursorPx ? this.worldAt(this.cursorPx.x, this.cursorPx.y) : null;
    const time = this.boardPlayTime ?? board.playTime;
    const at = board.playing ? playbackAt(board.plan, time) : { step: board.step, u: 0 };
    const c = this.boardCursor;
    const key = [
      boardIds.of(board.plan),
      at.step,
      at.u.toFixed(4),
      board.selection.join(','),
      boardIds.of(heat),
      boardIds.of(board.draft),
      c ? `${c.x.toFixed(3)},${c.y.toFixed(3)},${c.z.toFixed(3)}` : '',
      board.tool === 'place' ? `${board.kind}|${board.team}|${board.yaw}` : '',
    ].join('/');
    if (this.boardFrame && key === this.boardKey) return [this.boardFrame, false];
    this.boardKey = key;
    this.boardFrame = this.boardScene.build(board.plan, {
      step: at.step,
      u: at.u,
      selected: board.selected,
      selection: board.selection,
      heat,
      draft: board.draft,
      cursor: c,
      placing: board.tool === 'place' ? { kind: board.kind, team: board.team, yaw: board.yaw } : null,
    });
    return [this.boardFrame, true];
  }

  clearMeasure(): void {
    this.measure.points.length = 0;
  }

  /**
   * Accumulated heat at a CSS-pixel canvas position.
   *
   * Exposed separately from the throttled per-frame probe so callers that want
   * one specific reading — a test, a click handler — can take it directly.
   */
  readHeatProbe(cssX: number, cssY: number): number | null {
    if (!this.renderer) return null;
    const dpr = window.devicePixelRatio || 1;
    // The buffer holds the estimate itself rather than a sum, so the only thing
    // to undo is the half-float range scaling.
    return this.renderer.readHeatAt(cssX * dpr, cssY * dpr, this.currentGain());
  }

  /**
   * The Measure panel's live *Heat here*, read under the cursor.
   *
   * After the frame is drawn, and rarely: this is a single-pixel readback, which
   * stalls the GPU pipeline every time it runs. Through `readHeatProbe`, so the
   * live readout is divided by the gain the frame was written with — on a
   * half-float target a power of two away from 1 — and agrees with the one-shot
   * probe and the saturation point.
   */
  private probeCursor(now: number): void {
    if (!this.measureEnabled || !this.cursorPx || now - this.lastProbe <= 120) return;
    this.lastProbe = now;
    this.measure.heat = this.readHeatProbe(this.cursorPx.x, this.cursorPx.y);
  }

  /** Awaited probe; WebGPU can only read a texture asynchronously. */
  probeHeat(cssX: number, cssY: number): Promise<number | null> {
    if (!this.renderer) return Promise.resolve(null);
    const dpr = window.devicePixelRatio || 1;
    return this.renderer.probeHeat(cssX * dpr, cssY * dpr, this.currentGain());
  }

  start(): void {
    if (this.raf || !this.renderer) return;
    this.lastNow = performance.now();
    const tick = (now: number) => {
      if (this.disposed) return;
      this.raf = requestAnimationFrame(tick);
      this.frame(now);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  dispose(): void {
    this.disposed = true;
    this.stop();
    this.detachInput?.();
    this.detachMeasure?.();
    this.detachVolumes?.();
    this.renderer?.dispose();
    this.renderer = null;
  }

  /**
   * Scale to apply to every splat, divided back out at composite.
   *
   * On a 32-bit target, none: the format spans the whole range of any real field.
   * On a half-float target it is essential. Half float tops out at 65504 with 11
   * bits of mantissa, while a dense field reaches hundreds of thousands — so the
   * hot end both clips *and* loses its low bits to rounding, and the error grows
   * with the value, which reads as the densest areas being far cooler than they
   * are. Anchoring the field's interesting range to a magnitude the format handles
   * well fixes both. The anchor is the analytic estimate of the field's peak
   * (`estimateSaturation`, from the row count, the sprite and the data's extent),
   * mapped to `HEAT_F16_LEVEL` and rounded to a power of two — not the saturation
   * point, for the reason given in the body.
   */
  private heatGain(renderer: Renderer, h: HeatSettings): number {
    if (renderer.heatPrecision === 'f32' || !this.dataset) return 1;
    // Anchored to an analytic estimate of the field's magnitude, and *not* to the
    // saturation point. Saturation is applied at composite precisely so that
    // dragging it never restarts convergence — but if the gain moved with it, the
    // buffer would still hold values written at the old gain while the composite
    // divided by the new one, and the two errors cancel the change exactly. The
    // slider would appear to do nothing.
    const peak = estimateSaturation(
      this.dataset.count,
      h.radius,
      h.centerIntensity,
      this.dataset.bounds,
    );
    // Quantised to a power of two so a small drift in the estimate leaves the gain
    // — and therefore the accumulated buffer — completely alone.
    const exp = Math.round(Math.log2(HEAT_F16_LEVEL / Math.max(1e-6, peak)));
    return Math.pow(2, Math.max(-20, Math.min(20, exp)));
  }

  /**
   * The gain the current frame was written with.
   *
   * Cached per frame rather than recomputed, so a readback cannot divide by a
   * different value than the splat multiplied by.
   */
  private currentGain(): number {
    return this.frameGain;
  }

  /**
   * A typical heat sprite's radius in device pixels at full resolution.
   *
   * Sampled where five rays down the middle of the picture meet the data's
   * floor, and averaged as squares, because what it sizes is fill: the near
   * ground at the bottom of the picture costs more than the far ground at the
   * top. A ray over the horizon counts at the distance to the data's centre.
   * Clamped as the shader clamps. An estimate for the heat level, not for drawing.
   */
  private spritePixels(s: ReturnType<typeof snapshot>, heightPx: number): number {
    if (!this.dataset) return 0;
    const h = s.heat;
    const clampPx = (px: number) => Math.max(h.minPixelRadius, Math.min(h.maxPixelRadius > 0 ? h.maxPixelRadius : Infinity, px));
    if (s.camera.projection === 'orthographic') return clampPx((h.radius * heightPx) / Math.max(1e-6, this.camera.orthoHeight));
    const b = this.toDisplay(this.dataset.bounds);
    const p = this.camPos;
    const m = this.viewMirrored.elements;
    const tanHalf = Math.tan((s.camera.fov * Math.PI) / 360);
    const focal = heightPx / (2 * tanHalf);
    const centre = Math.hypot((b.minX + b.maxX) / 2 - p[0], (b.minY + b.maxY) / 2 - p[1], (b.minZ + b.maxZ) / 2 - p[2]);
    let sum = 0;
    for (const y of [-0.8, -0.4, 0, 0.4, 0.8]) {
      // Forward plus up times the ray's height in the picture; its y component
      // is all the floor distance needs, the length all the depth does.
      const dy = -m[6] + m[5] * y * tanHalf;
      // Depth along the view axis: what the shader divides the radius by.
      let d = p[1] > b.minY && dy < -0.02 ? (p[1] - b.minY) / -dy : centre;
      d = Math.max(this.viewNear, Math.min(d, centre * 4));
      const px = clampPx((h.radius * focal) / d);
      sum += px * px;
    }
    return Math.sqrt(sum / 5);
  }

  /**
   * Copy the engine's playhead into the store without triggering a seek.
   *
   * The engine owns the playhead during playback — routing it through React every
   * frame would cost more than the rest of the frame — but the store's copy has to
   * be right whenever something else reads it. Writing `playhead` alone is safe
   * because adoption is gated on `seekNonce`, so this cannot feed back as a seek.
   */
  private publishPlayhead(): void {
    const s = useStore.getState();
    if (Math.abs(s.timeline.playhead - this.playhead) < 1e-6) return;
    useStore.setState({ timeline: { ...s.timeline, playhead: this.playhead } });
  }

  /**
   * Set the saturation point from the field currently on screen.
   *
   * Meters the accumulated heat rather than deriving it, because the analytic
   * estimate has to assume a peak-to-mean ratio and real telemetry's clustering
   * makes that assumption wrong by an order of magnitude. Returns what it chose so
   * the caller can report it, or null when there was nothing lit to meter.
   */
  async autoExpose(): Promise<ExposureResult | null> {
    const renderer = this.renderer;
    if (!renderer || !this.dataset) return null;
    // Metering a half-finished estimate would expose for the noise, so give the
    // accumulation a moment to converge first.
    this.forceRenderFrames = Math.max(this.forceRenderFrames, 2);
    const samples = await renderer.readHeatField(EXPOSURE_SAMPLES);
    // Undo the half-float range scaling, so the exposure is metered in the same
    // units the saturation point is expressed in.
    const gain = this.currentGain();
    if (samples && gain !== 1) {
      for (let i = 0; i < samples.length; i++) samples[i] /= gain;
    }
    const result = autoExposure(samples);
    if (result.saturation !== null) {
      useStore.getState().patchHeat({ saturation: result.saturation });
    }
    return result;
  }

  /**
   * Meter the field for the view the camera has come to rest on, and hand the
   * reading to the follower, which glides to it unless it is close to the
   * current saturation or the camera has moved since. See `ExposureFollower`.
   */
  private async followExposure(generation: number): Promise<void> {
    const renderer = this.renderer;
    if (!renderer || !this.dataset) return;
    this.followMetering = true;
    try {
      const samples = await renderer.readHeatField(EXPOSURE_SAMPLES);
      const gain = this.currentGain();
      if (samples && gain !== 1) {
        for (let i = 0; i < samples.length; i++) samples[i] /= gain;
      }
      const result = autoExposure(samples);
      const heat = useStore.getState().heat;
      if (result.saturation !== null && heat.followExposure) {
        this.follower.propose(generation, this.shownSaturation ?? heat.saturation, result.saturation, performance.now());
      }
    } finally {
      this.followMetering = false;
    }
  }

  /**
   * Rows on each side of the difference over the time window, and the per-side
   * weights that follow from them.
   *
   * Counted again when what decides a row's side changes, and at most four
   * times a second while only the window moves - a playing window moves every
   * frame, and the weights barely change from one frame to the next. Returns
   * [1, 1] unless each side is to be normalised to its own total.
   */
  private updateSideCounts(
    now: number,
    difference: boolean,
    shares: boolean,
    timeLo: number,
    timeHi: number,
    filters: ActiveFilter[],
    teamSign: Int8Array | null,
    split: SplitTable,
  ): [number, number] {
    const ds = this.dataset;
    if (!ds || !difference) return [1, 1];
    const key = [
      ds.id,
      teamSign ? teamSign.join(',') : '',
      `${split.mode}:${split.column ?? ''}:${split.sign ? split.sign.join(',') : ''}:${split.positiveRange}:${split.negativeRange}:${split.problem ?? ''}`,
      filters.map((f) => f.key).join(';'),
    ].join('|');
    const range = candidateRange(ds, timeLo, timeHi);
    const moved = range[0] !== this.sideCountsRange[0] || range[1] !== this.sideCountsRange[1];
    if (key !== this.sideCountsKey || (moved && now - this.sideCountsAt > 250)) {
      this.sideCounts = splitSideCounts(ds, range[0], range[1], filters, teamSign, split);
      this.sideCountsKey = key;
      this.sideCountsRange = range;
      this.sideCountsAt = now;
    }
    if (!shares) return [1, 1];
    // Quantised, so a playing window's slowly drifting counts do not restart the
    // accumulation every time they move a fraction of a per cent.
    const q = (v: number) => Math.exp(Math.round(Math.log(v) * 50) / 50);
    const [p, n] = sideScales(this.sideCounts);
    return [q(p), q(n)];
  }

  /** Fit the data to the view. Keeps the current orientation by default. */
  frameDataset(keepOrientation = true): void {
    const race = useRaceStore.getState();
    if (race.tab === 'race' && race.laps.length) {
      this.camera.frame(this.toDisplay(raceBounds(race)), snapshot().camera.fov, keepOrientation);
      return;
    }
    if (race.tab === 'vehicle') {
      const aspect = Math.max(1, this.canvas.clientWidth) / Math.max(1, this.canvas.clientHeight);
      this.vehicleStage.frameCamera(this.camera, snapshot().camera.fov, aspect, this.mirror, keepOrientation);
      return;
    }
    if (race.tab === 'plan') {
      // The plan's figures and arrows; with none yet, the level, then the data.
      const b = boardBounds(usePlanStore.getState().plan);
      const level = snapshot().level;
      // A map picture is framed by where its anchors put it.
      const quad = level?.kind === 'image' ? mapQuadFromAnchors(level) : null;
      const fallback =
        level?.kind === 'model'
          ? level.bounds
          : quad && !quad.degenerate
            ? { minX: quad.minX, maxX: quad.maxX, minY: quad.y, maxY: quad.y + 1, minZ: quad.minZ, maxZ: quad.maxZ }
            : (this.dataset?.bounds ?? null);
      const box = b ?? fallback;
      if (box) this.camera.frame(this.toDisplay(box), snapshot().camera.fov, keepOrientation);
      return;
    }
    if (this.dataset) {
      this.camera.frame(this.toDisplay(this.dataset.bounds), snapshot().camera.fov, keepOrientation);
    }
  }

  /** A world box as the camera sees it, through the axis mirror. */
  private toDisplay<B extends { minX: number; minY: number; minZ: number; maxX: number; maxY: number; maxZ: number }>(
    b: B,
  ): B {
    const [mx, my, mz] = this.mirror;
    const x = [b.minX * mx, b.maxX * mx];
    const y = [b.minY * my, b.maxY * my];
    const z = [b.minZ * mz, b.maxZ * mz];
    return {
      ...b,
      minX: Math.min(x[0], x[1]),
      maxX: Math.max(x[0], x[1]),
      minY: Math.min(y[0], y[1]),
      maxY: Math.max(y[0], y[1]),
      minZ: Math.min(z[0], z[1]),
      maxZ: Math.max(z[0], z[1]),
    };
  }

  /**
   * The near plane this view can afford.
   *
   * Depth precision goes with the square of the distance over the near plane: a near
   * calibrated for standing in the data leaves steps of several metres at a map seen
   * from far above, and water and the shore under it then fight for each pixel,
   * flickering as the camera moves. So from outside the scene, or high over its ground,
   * the plane moves out with the distance to the nearest thing it could cut.
   *
   * Outside means outside the level and the data together: a small level under wider
   * data still has data to cut. High means past a tenth of the level's width over its
   * ground, which leaves a person flying inside a tall building their near plane. The
   * race tab's cars are in neither box, and its camera sits metres from one.
   */
  private nearForView(near: number, s: ReturnType<typeof snapshot>, raceTab: boolean): number {
    if (raceTab || this.camera.projection !== 'perspective') return near;
    const level = s.level?.kind === 'model' ? s.level : null;
    const boxes = [level?.bounds, s.dataset?.bounds].filter((b) => b !== undefined);
    if (!boxes.length) return near;
    const p = this.mirrorPoint(this.camera.position.x, this.camera.position.y, this.camera.position.z);
    const dx = Math.max(Math.min(...boxes.map((b) => b.minX)) - p.x, 0, p.x - Math.max(...boxes.map((b) => b.maxX)));
    const dy = Math.max(Math.min(...boxes.map((b) => b.minY)) - p.y, 0, p.y - Math.max(...boxes.map((b) => b.maxY)));
    const dz = Math.max(Math.min(...boxes.map((b) => b.minZ)) - p.z, 0, p.z - Math.max(...boxes.map((b) => b.maxZ)));
    const outside = Math.hypot(dx, dy, dz);
    const top = level?.relief?.highY;
    const above =
      top === undefined || !level ? 0 : p.y - top - 0.1 * Math.max(level.bounds.maxX - level.bounds.minX, level.bounds.maxZ - level.bounds.minZ);
    return Math.max(near, 0.02 * Math.max(outside, above));
  }

  /**
   * The far plane for this view: the calibrated one, pushed out to the far side of
   * the level and the data when the camera has flown further away than that.
   *
   * The calibration sets far from the data's extent, so a small dataset seen from a
   * few kilometres up lay wholly past it and vanished - heat, lines and all - the
   * moment the camera crossed it. With the near plane moving out with the distance
   * (`nearForView`), the ratio stays where depth precision wants it.
   */
  private farForView(far: number, s: ReturnType<typeof snapshot>, raceTab: boolean): number {
    if (raceTab) return far;
    const level = s.level?.kind === 'model' ? s.level : null;
    const boxes = [level?.bounds, s.dataset?.bounds].filter((b) => b !== undefined);
    if (!boxes.length) return far;
    const p = this.mirrorPoint(this.camera.position.x, this.camera.position.y, this.camera.position.z);
    let reach = 0;
    for (const b of boxes) {
      const dx = Math.max(Math.abs(b.minX - p.x), Math.abs(b.maxX - p.x));
      const dy = Math.max(Math.abs(b.minY - p.y), Math.abs(b.maxY - p.y));
      const dz = Math.max(Math.abs(b.minZ - p.z), Math.abs(b.maxZ - p.z));
      reach = Math.max(reach, Math.hypot(dx, dy, dz));
    }
    return Number.isFinite(reach) ? Math.max(far, reach * 1.1) : far;
  }

  /**
   * The person whose figure is under a CSS-pixel canvas position, the nearest
   * along the view ray; null when no figure is there. Picks by the figure as
   * drawn (turned, and grown to its on-screen minimum), so a click on a wing
   * is that aircraft, not whichever track's centre lies nearest the pointer.
   */
  figureAt(cssX: number, cssY: number): number | null {
    const d = this.dataset;
    const ray = this.rayAt(cssX, cssY);
    if (!d?.personId || !ray) return null;
    if (this.gpuTracksParams) return this.gpuUnitAt(ray, cssX, cssY);
    if (!this.figureBatches) return null;
    const box = this.figureReplay.hit([ray.origin.x, ray.origin.y, ray.origin.z], [ray.dir.x, ray.dir.y, ray.dir.z]);
    const row = box >= 0 && this.cursor ? this.cursor.cubeRows[box] : -1;
    return row >= 0 ? d.personId[row] : null;
  }

  /**
   * The GPU-placed unit under the pointer: every unit placed on the CPU at the
   * playhead (the shader's arithmetic, evaluate.ts), the nearest whose drawn
   * size the ray passes within. Asked again for the same pixel, playhead and
   * view it answers from the last time, so a hover does not redo it each frame.
   */
  private gpuUnitAt(ray: { origin: { x: number; y: number; z: number }; dir: { x: number; y: number; z: number } }, cssX: number, cssY: number): number | null {
    const p = this.gpuTracksParams!;
    const key = `${Math.round(cssX)},${Math.round(cssY)},${p.t.toFixed(3)},${this.viewProjArr.join(',')}`;
    if (this.gpuPick && this.gpuPick.key === key) return this.gpuPick.person;
    const st = p.store;
    const pose = emptyPose();
    const o = ray.origin;
    const dir = ray.dir;
    let best = -1;
    let bestT = Infinity;
    const f32 = new Float32Array(st.trackData.buffer, st.trackData.byteOffset, st.trackData.length);
    const oa = [o.x, o.y, o.z];
    const da = [dir.x, dir.y, dir.z];
    // Near enough to matter: the longest figure at true size, or the pixel minimum at the box's distance.
    const fixed = 200 * p.scale + (p.focalPx > 0 ? 0 : Math.max(p.minPixels, 8) * p.orthoPx);
    const perDistance = p.focalPx > 0 ? Math.max(p.minPixels, 8) / p.focalPx : 0;
    for (let i = 0; i < st.tracks; i++) {
      if (!isShown(p.visible ?? null, i)) continue;
      const [ta, tb] = trackTimes(st, i);
      if (p.t < ta || p.t > tb + p.stale) continue;
      if (!rayNearTrack(st, i, oa, da, fixed, perDistance)) continue;
      if (!evaluateTrack(st, i, p.t, p.stale, pose)) continue;
      const dx = pose.x - o.x;
      const dy = pose.y - o.y;
      const dz = pose.z - o.z;
      const along = dx * dir.x + dy * dir.y + dz * dir.z;
      if (along <= 0 || along > bestT) continue;
      const off = Math.hypot(dx - dir.x * along, dy - dir.y * along, dz - dir.z * along);
      // Its drawn half length: true size, or the pixel minimum at that distance.
      const longest = f32[i * TRACK_U32 + 4];
      const px = p.focalPx > 0 ? along / p.focalPx : p.orthoPx;
      const half = Math.max(longest * p.scale, p.minPixels * px) / 2;
      if (off <= Math.max(half, 4 * px)) {
        bestT = along;
        best = i;
      }
    }
    const person = best >= 0 ? st.personOf[best] : null;
    this.gpuPick = { key, person };
    return person;
  }

  private gpuPick: { key: string; person: number | null } | null = null;

  /**
   * The GPU tracks for the loaded dataset, when it has so many units that
   * the GPU places them (and the backend can): built once, null otherwise.
   */
  private gpuStoreFor(s: ReturnType<typeof snapshot>, renderer: Renderer): GpuTrackStore | null {
    const d = this.dataset;
    const max = renderer.gpuTracksMaxBytes ?? 0;
    if (!d || !max || !d.time || !d.personId) return null;
    // An overlay loaded straight into tracks (overlay/lean): drawn from them whatever its size.
    const lean = registeredGpuTrackStore(d);
    if (lean) return lean;
    const force = gpuTracksForced();
    if (force === false || (d.personLabels.length < GPU_TRACKS_FROM && !force)) return null;
    if (s.team.session >= 0 && d.sessionId && d.sessionLabels.length > 1) return null;
    return gpuTrackStore(d, { maxKeys: Math.floor(max / 8) });
  }

  /**
   * A frame of the GPU tracks: the playhead and view for the compute pass,
   * the screen-size threshold below which a unit is a dart nudged by the
   * frame time, and on the CPU only the units someone follows or picked
   * (for the labels, the card and the follow camera).
   */
  private gpuFrame(s: ReturnType<typeof snapshot>, store: GpuTrackStore): void {
    this.lastGpuStore = store;
    const t = this.playhead;
    const hgt = Math.max(1, this.canvas.clientHeight);
    const persp = this.camera.projection === 'perspective';
    const focal = persp ? hgt / (2 * Math.tan((s.camera.fov * Math.PI) / 360)) : 0;
    // Frame time steers how small a unit may be and still be a figure: slow frames, more darts.
    const ms = this.frameMsAvg;
    // Frames come at the display's rate when there is room (about 16.7 ms at 60 Hz): figures grow back slowly
    // while that holds, darts take over quickly when a frame runs late.
    if (ms > 19) this.dartPx = Math.min(400, this.dartPx * 1.08 + 0.25);
    // "At a distance: figure" keeps every model it can; the governor still turns the smallest into darts on slow frames.
    else if (ms < 17.6) this.dartPx = Math.max(s.team.farMode === 'figure' ? 0.25 : 2, this.dartPx * 0.985);
    this.gpuTracksParams = {
      store,
      t,
      focalPx: focal,
      orthoPx: persp ? 0 : this.camera.orthoHeight / hgt,
      minPixels: s.team.figurePixels,
      stale: s.timeline.defaultLifetime,
      scale: store.units * Math.max(0.01, s.team.figureScale),
      fullPx: 120,
      dartPx: this.dartPx,
      triangleBudget: 40_000_000,
      trailSeconds: s.team.trailSeconds,
      // Drop lines as the CPU path draws them (below): to the data's floor.
      dropFloor: this.dataset && dropLinesOn(this.dataset, useReplayStore.getState().dropLines) ? this.dataset.bounds.minY : null,
      visible: this.dataset ? trackVisibility(store, this.dataset, s.teamVisibility, s.filters) : null,
      weapons: s.team.weapons ? 1.5 : 0,
      markerSeconds: markerSeconds(),
      farMode: FAR_MODE_ID[s.team.farMode],
      symbolThreshold: symbolThreshold(s.team.figurePixels, s.team.symbolPx),
      symbolPx: s.team.symbolPx,
      weaponDrops: s.team.weaponMarks,
    };
    // The units in question, on the CPU.
    const r = useReplayStore.getState();
    const want = new Set<number>();
    if (r.follow !== null) want.add(r.follow);
    if (r.pairFrom !== null) want.add(r.pairFrom);
    if (r.pair) for (const p of r.pair) want.add(p);
    // The second unit of the padlock and target views, which the camera and its card read.
    if (r.targetPerson !== null) want.add(r.targetPerson);
    const tracks: typeof this.liveTracks = [];
    const pose = this.gpuPose;
    for (const p of want) {
      const i = store.trackOf[p] ?? -1;
      if (i < 0 || !evaluateTrack(store, i, t, s.timeline.defaultLifetime, pose)) continue;
      const f = pose.f;
      tracks.push({ person: p, row: rowOfKey(store, i, pose.key), x: pose.x, y: pose.y, z: pose.z, yaw: Math.atan2(f[0], -f[2]), pitch: Math.asin(Math.max(-1, Math.min(1, f[1]))), q: null });
    }
    this.liveTracks = tracks;
    // Fires burning on the units: the burning ones only, placed on the CPU (figures/fires.ts).
    if (s.team.fires && this.dataset) {
      const ortho = persp ? 0 : this.camera.orthoHeight / hgt;
      const eye = this.camPos;
      this.drawFires(this.dataset, store, t, eye, ortho ? () => ortho : (x, y, z) => Math.hypot(x - eye[0], y - eye[1], z - eye[2]) / focal);
    }
    if (s.team.hitMarks && this.dataset) {
      const ortho = persp ? 0 : this.camera.orthoHeight / hgt;
      const eye = this.camPos;
      this.drawHitMarks(this.dataset, store, t, eye, ortho ? () => ortho : (x, y, z) => Math.hypot(x - eye[0], y - eye[1], z - eye[2]) / focal);
    } else this.hitMarkLayer.drawn.count = 0;
  }

  /**
   * The fires burning at `t` into the frame's triangles: onto the figures' (or
   * the weapons') where the CPU drew them, else their own (`store`: the GPU
   * tracks place the units, the burning ones are evaluated here).
   */
  private drawFires(d: Dataset, store: GpuTrackStore | null, t: number, eye: ArrayLike<number>, pixelSize: (x: number, y: number, z: number) => number): void {
    const fires = firesOf(d);
    if (!fires.count) return;
    this.posesFor(d, store, t, eye, pixelSize);
    const v = this.fireView;
    const ft = this.figureTris;
    const out = store || !ft ? this.fireTris : ft.data === this.weaponTris.data ? this.weaponTris : this.figureReplay.tris;
    if (out === this.fireTris) out.reset();
    if (this.fireLayer.build(fires, v, out) > 0 || ft) this.figureTris = out.count ? { data: out.data, count: out.count } : ft;
  }

  /**
   * The marks of the shots that struck units in the time window, into the
   * frame's triangles as the fires go (after them: onto the fires' own where
   * those are this frame's).
   */
  private drawHitMarks(d: Dataset, store: GpuTrackStore | null, t: number, eye: ArrayLike<number>, pixelSize: (x: number, y: number, z: number) => number): void {
    const marks = hitMarksOf(d);
    this.hitMarkLayer.drawn.count = 0;
    if (!marks.count) return;
    this.posesFor(d, store, t, eye, pixelSize);
    const team = useStore.getState().team;
    // The CPU figures as placed this frame, with their roll and their drawn size.
    const n = d.personLabels.length;
    if (this.markSlot.length < n) {
      this.markSlot = new Int32Array(n);
      this.markSeen = new Int32Array(n);
    }
    const stamp = ++this.markStamp;
    if (!store && team.figures && d.personId) {
      const placed = this.figureReplay.placed;
      for (let i = 0; i < placed.length; i++) {
        const r = placed[i].row;
        const p = r >= 0 && r < d.count ? d.personId[r] : -1;
        if (p >= 0 && p < n) {
          this.markSlot[p] = i;
          this.markSeen[p] = stamp;
        }
      }
    }
    const v = this.markView;
    v.t = t;
    v.seconds = team.hitMarkSeconds > 0 ? team.hitMarkSeconds : Infinity;
    v.session = team.session;
    v.eye = eye;
    v.pixelSize = pixelSize;
    v.units = this.fireView.units;
    v.dataset = d;
    const ft = this.figureTris;
    const own = ft !== null && ft.data === this.fireTris.data;
    const out = own || store || !ft ? this.fireTris : ft.data === this.weaponTris.data ? this.weaponTris : this.figureReplay.tris;
    if (out === this.fireTris && !own) out.reset();
    if (this.hitMarkLayer.build(marks, v, out) > 0 || ft) this.figureTris = out.count ? { data: out.data, count: out.count } : ft;
  }

  /** A unit's pose for its hit marks: the CPU figure as placed, else as the fires take it. */
  private markPose(p: number, body: FireBody, out: MarkPose): boolean {
    if (!this.fireStore && p >= 0 && p < this.markSeen.length && this.markSeen[p] === this.markStamp) {
      const e = this.figureReplay.placed[this.markSlot[p]];
      out.x = e.fr.o[0];
      out.y = e.fr.o[1];
      out.z = e.fr.o[2];
      out.f[0] = e.fr.f[0];
      out.f[1] = e.fr.f[1];
      out.f[2] = e.fr.f[2];
      out.u[0] = e.fr.u[0];
      out.u[1] = e.fr.u[1];
      out.u[2] = e.fr.u[2];
      out.scale = e.scale / this.fireView.units;
      out.row = e.row;
      return true;
    }
    this.poseRow = -1;
    if (!this.firePose(p, body, out)) return false;
    out.row = this.poseRow;
    return true;
  }

  /** The tables `firePose` reads, for this frame: the GPU tracks, or who each live track is. */
  private posesFor(d: Dataset, store: GpuTrackStore | null, t: number, eye: ArrayLike<number>, pixelSize: (x: number, y: number, z: number) => number): void {
    this.fireStore = store;
    if (!store) {
      const n = d.personLabels.length;
      if (this.fireSlot.length < n) {
        this.fireSlot = new Int32Array(n);
        this.fireSeen = new Int32Array(n);
      }
      const stamp = ++this.fireStamp;
      const tracks = this.liveTracks;
      for (let i = 0; i < tracks.length; i++) {
        const p = tracks[i].person;
        if (p >= 0 && p < n) {
          this.fireSlot[p] = i;
          this.fireSeen[p] = stamp;
        }
      }
    }
    const v = this.fireView;
    const team = useStore.getState().team;
    this.fireFigureScale = Math.max(0.01, team.figureScale);
    this.fireMinPixels = team.figurePixels;
    v.t = t;
    v.eye = eye;
    v.pixelSize = pixelSize;
    v.units = unitsPerMetre(d);
  }

  /** A person's pose for its fires (`drawFires`): the GPU tracks' evaluated on the CPU, or the live track's. */
  private firePose(p: number, body: FireBody, out: FirePose): boolean {
    const store = this.fireStore;
    if (store) {
      const i = store.trackOf[p] ?? -1;
      const g = this.gpuTracksParams;
      if (i < 0 || (g && !isShown(g.visible ?? null, i))) return false;
      const pose = this.fireTrackPose;
      if (!evaluateTrack(store, i, this.fireView.t, g ? g.stale : Infinity, pose)) return false;
      this.poseRow = rowOfKey(store, i, pose.key);
      out.x = pose.x;
      out.y = pose.y;
      out.z = pose.z;
      out.f[0] = pose.f[0];
      out.f[1] = pose.f[1];
      out.f[2] = pose.f[2];
      out.u[0] = pose.u[0];
      out.u[1] = pose.u[1];
      out.u[2] = pose.u[2];
      // As the GPU tracks draw it: true size, or as big as it takes to stay `figurePixels` long on screen.
      if (this.fireF32Of !== store.trackData) {
        this.fireF32Of = store.trackData;
        this.fireF32 = new Float32Array(store.trackData.buffer, store.trackData.byteOffset, store.trackData.length);
      }
      const longest = this.fireF32[i * TRACK_U32 + 4];
      const ps = this.fireView.pixelSize(pose.x, pose.y, pose.z);
      out.scale = Math.max(this.fireFigureScale, longest > 0 ? (this.fireMinPixels * ps) / (longest * this.fireView.units) : 0);
      return true;
    }
    if (p < 0 || p >= this.fireSeen.length || this.fireSeen[p] !== this.fireStamp) return false;
    const tr = this.liveTracks[this.fireSlot[p]];
    this.poseRow = tr.row;
    out.scale = (this.figureReplay.drawnScale.get(p) ?? 1) * this.fireFigureScale;
    // As the figure is placed (`figures/replay.ts`): heading, and the pitch for aircraft; ground figures keep level.
    const yaw = Math.PI - tr.yaw;
    const pitch = body === FireBody.Air && Number.isFinite(tr.pitch) ? tr.pitch : 0;
    const sy = Math.sin(yaw), cy = Math.cos(yaw), sp = Math.sin(pitch), cp = Math.cos(pitch);
    out.x = tr.x;
    out.y = tr.y;
    out.z = tr.z;
    out.f[0] = sy * cp;
    out.f[1] = sp;
    out.f[2] = cy * cp;
    out.u[0] = -sy * sp;
    out.u[1] = cp;
    out.u[2] = -cy * sp;
    return true;
  }

  /** The largest buffer the GPU tracks may use on this backend, bytes (0: none). */
  get gpuTracksMaxBytes(): number {
    return this.renderer?.gpuTracksMaxBytes ?? 0;
  }

  /** The GPU tracks' state for the stats: units, keys, reduction, bytes, build time. */
  gpuTracksInfo(): { tracks: number; keys: number; samples: number; tolerance: number; cpuMB: number; gpuMB: number; buildMs: number; dartPx: number } | null {
    const p = this.gpuTracksParams;
    if (!p) return null;
    const st = p.store;
    return { tracks: st.tracks, keys: st.keys, samples: st.samples, tolerance: st.tolerance, cpuMB: Math.round(st.bytes / 1e6), gpuMB: Math.round((this.renderer?.gpuTracksBytes ?? 0) / 1e6), buildMs: Math.round(st.buildMs), dartPx: Math.round(p.dartPx * 10) / 10 };
  }

  /** How many times true size a person's figure was drawn last frame (1 when not drawn as a figure). */
  figureScaleAt(person: number): number {
    return this.figureReplay.drawnScale.get(person) ?? 1;
  }

  /**
   * Trails along the motion curves of the live tracks: line segments,
   * newest opaque and fading backwards, as `TrackCursor.buildTrails` draws
   * them sample to sample - but through the samples on the curve the boxes
   * move along, and up to the box itself.
   */
  private smoothTrails(d: Dataset, motion: MotionModel, t: number, seconds: number, session: number): { data: Float32Array; count: number } {
    const tracks = this.liveTracks;
    const maxVerts = 1 << 17;
    const step = Math.max(0.04, (tracks.length * seconds * 2.5) / maxVerts);
    const need = maxVerts * 7;
    if (this.smoothTrailBuf.length < need) this.smoothTrailBuf = new Float32Array(need);
    const out = this.smoothTrailBuf;
    let v = 0;
    let px = 0;
    let py = 0;
    let pz = 0;
    let pa = 0;
    const seen = new Set<number>();
    for (const tr of tracks) {
      const p = tr.person;
      if (seen.has(p) || (d.personShared && d.personShared[p])) continue;
      seen.add(p);
      // Chaff, shells and debris leave no trail; a flare a short one of smoke (`symbolClass.ts`).
      const dom = this.domainOfRow(tr.row);
      if (dom === Domain.Chaff || dom === Domain.Shell || dom === Domain.Misc) continue;
      const secs = dom === Domain.Flare ? Math.min(seconds, 1.2) : seconds;
      const [r, g, b] = dom === Domain.Flare ? [0.78, 0.78, 0.76] : this.cursor!.personColor(p);
      motion.trail(p, t - secs, t, step, this.motionSample, (sm, ts, join) => {
        const a = Math.max(0, Math.min(1, 1 - (t - ts) / secs)) * (dom === Domain.Flare ? 0.5 : 0.8);
        if (join && session >= 0 && d.sessionId && d.sessionId[motion.knots[motion.knotAt(p, ts)]] !== session) join = false;
        if (join) {
          if (v + 2 > maxVerts) return false;
          let o = v * 7;
          out[o++] = px;
          out[o++] = py;
          out[o++] = pz;
          out[o++] = r;
          out[o++] = g;
          out[o++] = b;
          out[o++] = pa;
          out[o++] = sm.x;
          out[o++] = sm.y;
          out[o++] = sm.z;
          out[o++] = r;
          out[o++] = g;
          out[o++] = b;
          out[o++] = a;
          v += 2;
        }
        px = sm.x;
        py = sm.y;
        pz = sm.z;
        pa = a;
        return true;
      });
    }
    return { data: out, count: v };
  }

  /** A world point as the camera sees it, or back: the mirror is its own inverse. */
  mirrorPoint(x: number, y: number, z: number): { x: number; y: number; z: number } {
    const [mx, my, mz] = this.mirror;
    return { x: x * mx, y: y * my, z: z * mz };
  }

  // ---------------------------------------------------------------- inspect

  /**
   * The camera in world terms: where it is and the way it looks.
   *
   * Through the axis mirror, both of them. The camera's own yaw lives in
   * display space, so with an axis inverted it describes the mirror image of
   * the direction the view shows; the world direction is what a number typed
   * back in, or compared against a tool's, has to mean.
   */
  cameraPose(): { position: Vec3; forward: Vec3 } {
    const c = this.camera;
    const f = c.forward(new Vector3());
    return {
      position: this.mirrorPoint(c.position.x, c.position.y, c.position.z),
      forward: this.mirrorPoint(f.x, f.y, f.z),
    };
  }

  /** Move the camera to a world position and, when given, turn it to a world direction. */
  setCameraPose(position: Vec3 | null, forward: Vec3 | null): void {
    const c = this.camera;
    if (position) {
      const p = this.mirrorPoint(position.x, position.y, position.z);
      c.position.set(p.x, p.y, p.z);
    }
    if (forward) {
      const f = this.mirrorPoint(forward.x, forward.y, forward.z);
      const len = Math.hypot(f.x, f.y, f.z) || 1;
      const lim = Math.PI / 2 - 1e-3;
      // Straight up or down keeps the yaw it had: it has none of its own.
      if (Math.hypot(f.x, f.z) > 1e-9) c.yaw = Math.atan2(-f.x, -f.z);
      c.pitch = Math.max(-lim, Math.min(lim, Math.asin(Math.max(-1, Math.min(1, f.y / len)))));
    }
    this.chase = null;
    c.moved = true;
  }

  /**
   * Go to a world point.
   *
   * `stand` puts the camera on the point - looking along `forward` when given,
   * otherwise the way it already looked. `look` keeps the camera's heading
   * (tipped to look down at the point if it was looking level) and backs off
   * along it to a distance that shows the point and what is around it; the
   * focus distance, the parallel view's height and a fly speed that would cross
   * that distance in about a second follow, so the view arrives usable.
   */
  jumpTo(target: Vec3, mode: 'look' | 'stand', forward: Vec3 | null = null): void {
    if (mode === 'stand') {
      this.setCameraPose(target, forward);
      return;
    }
    const c = this.camera;
    let f = forward;
    if (!f) {
      const pose = this.cameraPose();
      const flat = Math.hypot(pose.forward.x, pose.forward.z);
      const pitch = (lookAtPitch(c.pitchDegrees) * Math.PI) / 180;
      // Straight down has no heading to keep; any will do.
      const hx = flat > 1e-9 ? pose.forward.x / flat : 0;
      const hz = flat > 1e-9 ? pose.forward.z / flat : -1;
      f = { x: hx * Math.cos(pitch), y: Math.sin(pitch), z: hz * Math.cos(pitch) };
    }
    const len = Math.hypot(f.x, f.y, f.z) || 1;
    const eye = this.cameraPose().position;
    const d = lookAtDistance(Math.hypot(eye.x - target.x, eye.y - target.y, eye.z - target.z), this.sceneExtent());
    this.setCameraPose(
      { x: target.x - (f.x / len) * d, y: target.y - (f.y / len) * d, z: target.z - (f.z / len) * d },
      f,
    );
    c.focusDistance = d;
    if (c.projection === 'orthographic') c.orthoHeight = 2 * d * Math.tan((snapshot().camera.fov * Math.PI) / 360);
    c.speed = Math.min(c.speed, Math.max(MIN_FLY_SPEED, d));
  }

  /** The horizontal size of what is loaded: the level when there is one, the data otherwise. */
  private sceneExtent(): number {
    const s = snapshot();
    const b = s.level?.kind === 'model' ? s.level.bounds : (s.dataset?.bounds ?? null);
    if (!b) return 1000;
    const e = Math.max(b.maxX - b.minX, b.maxZ - b.minZ);
    return Number.isFinite(e) && e > 0 ? e : 1000;
  }

  /**
   * Answer a click at a CSS-pixel canvas position: the drawn data point under
   * it, or the level's surface. See `Inspector`.
   *
   * Everything the answer depends on is captured here, at the click, so a
   * pick still working when the camera moves on answers the click that was
   * made and not the view that followed.
   */
  pickAt(cssX: number, cssY: number): void {
    if (useRaceStore.getState().tab === 'race') return;
    const s = snapshot();
    const cam = this.camera.camera;
    const w = this.canvas.clientWidth;
    const hgt = this.canvas.clientHeight;
    if (w <= 0 || hgt <= 0) return;
    const ndcX = (cssX / w) * 2 - 1;
    const ndcY = 1 - (cssY / hgt) * 2;
    // Display space first, as the camera's matrices are, then through the
    // mirror into the world the data and the level live in.
    const inv = new Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse).invert();
    const a = new Vector3(ndcX, ndcY, -1).applyMatrix4(inv);
    const b = new Vector3(ndcX, ndcY, 1).applyMatrix4(inv);
    const origin = this.mirrorPoint(a.x, a.y, a.z);
    const far = this.mirrorPoint(b.x, b.y, b.z);
    const len = Math.hypot(far.x - origin.x, far.y - origin.y, far.z - origin.z) || 1;
    const dir = { x: (far.x - origin.x) / len, y: (far.y - origin.y) / len, z: (far.z - origin.z) / len };

    // One CSS pixel at a distance along the ray. The ray starts on the near
    // plane, so under perspective its view depth is that much further.
    const m11 = cam.projectionMatrix.elements[5];
    const near = this.viewNear;
    const perspective = this.camera.projection === 'perspective';
    const worldPerPixel = perspective ? (t: number) => (2 * (t + near)) / (m11 * hgt) : () => 2 / (m11 * hgt);

    // The level is drawn only inside the slice and the distance cull, when
    // those apply to it; a click goes through what is not drawn.
    const sl = s.slice;
    const hs = s.heat;
    const eye = { x: this.camPos[0], y: this.camPos[1], z: this.camPos[2] };
    const fwd = { x: this.camFwd[0], y: this.camFwd[1], z: this.camFwd[2] };
    const sliceHides = sl.enabled && sl.outsideOpacity <= 0.02;
    const axis = sl.axis === 'x' ? 0 : sl.axis === 'y' ? 1 : 2;
    const cullHides = hs.cullGeometry && (hs.cullNear > 0 || hs.cullFar > 0);
    const accept =
      sliceHides || cullHides
        ? (x: number, y: number, z: number) => {
            if (sliceHides) {
              const v = axis === 0 ? x : axis === 1 ? y : z;
              if (v < sl.center - sl.thickness * 0.5 || v > sl.center + sl.thickness * 0.5) return false;
            }
            if (cullHides) {
              const dist = hs.cullPlanar
                ? (x - eye.x) * fwd.x + (y - eye.y) * fwd.y + (z - eye.z) * fwd.z
                : Math.hypot(x - eye.x, y - eye.y, z - eye.z);
              if (dist < hs.cullNear || (hs.cullFar > 0 && dist > hs.cullFar)) return false;
            }
            return true;
          }
        : null;

    // The tables the frame reuses are copied: an answer that takes a few
    // frames must not see them change under it.
    const drawn = this.drawn
      ? {
          ...this.drawn,
          teamSign: this.drawn.teamSign ? this.drawn.teamSign.slice() : null,
          splitSign: this.drawn.splitSign ? this.drawn.splitSign.slice() : null,
        }
      : null;

    void this.inspector.pick({
      click: { x: cssX, y: cssY },
      ray: { origin, dir },
      eye,
      screen: { viewProj: this.pickViewProj.slice(), width: w, height: hgt },
      worldPerPixel,
      dataset: this.dataset,
      drawn,
      cubes: this.pickCubes,
      level: this.level,
      accept,
    });
    this.invalidate(2);
  }

  /**
   * Invert axes and keep looking at the same place: the camera's position and
   * view direction go through the change, so the view flips in place rather
   * than jumping to the mirror image of where it was.
   */
  private setMirror(want: [number, number, number]): void {
    const flip = want.map((v, i) => v * this.mirror[i]);
    const c = this.camera;
    c.position.set(c.position.x * flip[0], c.position.y * flip[1], c.position.z * flip[2]);
    // Forward is (-sin yaw cos pitch, sin pitch, -cos yaw cos pitch).
    const fx = -Math.sin(c.yaw) * Math.cos(c.pitch) * flip[0];
    const fy = Math.sin(c.pitch) * flip[1];
    const fz = -Math.cos(c.yaw) * Math.cos(c.pitch) * flip[2];
    c.yaw = Math.atan2(-fx, -fz);
    c.pitch = Math.asin(Math.max(-1, Math.min(1, fy)));
    c.moved = true;
    if (this.chase) this.chase = null;
    this.mirror = want;
  }

  /**
   * Point at a preset view and immediately fit the data to it.
   *
   * A preset may also change the projection — the isometric and elevation views
   * are only meaningful as parallel projections — so the store is updated to match
   * rather than left disagreeing with the camera.
   */
  applyPreset(name: string): void {
    const wanted = this.camera.setPreset(name);
    this.frameDataset(true);
    if (wanted) {
      this.lastStoreProjection = wanted;
      const s = useStore.getState();
      if (s.camera.projection !== wanted) s.patchCamera({ projection: wanted });
    }
  }

  /**
   * Switch projection, preserving apparent scale, and tell the store.
   *
   * Goes through the camera rather than the store so the scale-matching and the
   * remembered perspective pose apply; setting the store directly would work but
   * would jump-cut the view.
   */
  setProjection(next: Projection): void {
    this.camera.setProjection(next);
    this.lastStoreProjection = next;
    const s = useStore.getState();
    if (s.camera.projection !== next) s.patchCamera({ projection: next });
  }

  // ------------------------------------------------------------------- frame

  private frame(now: number): void {
    const renderer = this.renderer;
    if (!renderer) return;
    const dtRaw = (now - this.lastNow) / 1000;
    this.lastNow = now;
    // Clamp so a tab switch doesn't teleport the playhead or the camera.
    const dt = Math.min(0.1, Math.max(0, dtRaw));
    if (dtRaw > 0 && dtRaw < 1) this.frameMsAvg += (dtRaw * 1000 - this.frameMsAvg) * 0.1;
    const s = snapshot();

    /**
     * A new dataset is announced one frame before it is uploaded.
     *
     * `renderer.setDataset` packs every resident row into GPU buffers on this
     * thread, synchronously, and on tens of millions of rows that is minutes
     * during which nothing repaints and nothing can be cancelled. Reproduced with
     * `probe-load-crash.mjs`: 55M rows left the page unresponsive for over ten
     * minutes, and for someone with less headroom it ends as an out-of-memory tab
     * crash instead.
     *
     * The label has to be published on an *earlier* frame than the work, or it
     * would never be seen: setting it and then blocking in the same frame means
     * the browser has no opportunity to paint it. So the first frame after a
     * dataset arrives says what is about to happen and returns; the next one does
     * it. One frame of delay buys the difference between a named phase and an
     * apparent freeze — which is what this looked like, and it was reported as a
     * crash "at computing lifetimes", the last thing the ingest worker had said.
     */
    if (s.dataset !== this.dataset && s.dataset && this.uploadAnnounced !== s.dataset) {
      this.uploadAnnounced = s.dataset;
      useStore.getState().setLoad({
        active: true,
        label: t('render.engine.uploading', { count: s.dataset.count }),
        fraction: null,
        rowsSoFar: s.dataset.count,
        error: null,
      });
      // Residency counts belong to the dataset on the GPU, and that is no longer
      // the one being asked about. Left standing they describe the *previous*
      // load for as long as the announcement lasts, which reads as "all ten
      // million rows are already resident" about a dataset not yet uploaded —
      // and anything waiting for residency to settle by watching these numbers
      // is answered by the old ones before the new upload has begun.
      this.live.residentRows = 0;
      this.live.droppedRows = 0;
      this.invalidate(2);
      return;
    }

    if (s.dataset !== this.dataset) {
      this.dataset = s.dataset;
      this.cursor = s.dataset ? new TrackCursor(s.dataset) : null;
      this.teamPalette = teamPaletteFor(s.dataset);
      this.filterCache = new WeakMap();
      this.pickCubes = null;
      this.inspector.setDataset(s.dataset);
      // Decided by the same function as the load's fit check, so a load the check
      // approved is a load that ends up resident. A figure above the detected one
      // is the user's deliberate choice and applies; only the ceiling the slider
      // stops at caps it, so a value set from the console cannot exceed that.
      renderer.gpuBudgetBytes = effectiveGpuBudget(s.budget.gpuBudgetBytes, s.budget.gpuBudgetMax);
      renderer.setDataset(s.dataset);
      if (s.dataset) {
        // Cleared only once the upload is actually done, so the panel does not
        // claim success while the thread is still packing buffers.
        useStore.getState().setLoad({
          active: false,
          label: '',
          fraction: null,
          rowsSoFar: s.dataset.count,
          error: null,
        });
      }
      this.live.residentRows = renderer.residentRows;
      this.live.droppedRows = renderer.droppedRows;
      this.live.gpuBytes = renderer.gpuBytesUsed;
      this.live.gpuName = renderer.gpuName;
      // Park at the *start*, not the end. Parking at the end means the first
      // press of Play either snaps instantly back to the beginning (loop on) or
      // does nothing at all (loop off), both of which read as a broken button.
      // `all` mode ignores the playhead anyway, so nothing is lost by doing this.
      this.playhead = s.dataset ? s.dataset.timeRange[0] : 0;
      this.publishPlayhead();
      // Meter the exposure once this dataset has something on screen to meter.
      // Doing it automatically matters more than it sounds: the analytic estimate
      // it replaces can leave the interesting part of the data in the bottom
      // quarter of the ramp, and a first-time user has no reason to suspect the
      // saturation slider rather than the data.
      this.autoExposePending = s.dataset ? AUTO_EXPOSE_AFTER_FRAMES : 0;
      // A new scene's cost is unknown: its sprites ramp up from a few.
      this.prevSprites = RAMP_START_SPRITES;
      this.geometrySig = '';
      // The renderer dropped the routes with the old dataset's buffers.
      this.linesKey = '';
      this.meteredKind = null;
      this.lines = null;
      this.live.lines = null;
      this.accumFrames = 0;
      // A fresh dataset resets to the default three-quarter view rather than
      // keeping whatever the previous one happened to be pointing at.
      if (s.dataset) this.camera.frame(s.dataset.bounds, s.camera.fov, false);
    }

    if (s.level !== this.level) {
      if (!sameLevelUpload(this.level, s.level)) renderer.setLevel(s.level);
      this.level = s.level;
      this.inspector.setLevel(s.level);
      this.geometrySig = '';
    }

    // The streamed world tiles (src/world/tileSet), drawn with a model level's
    // look and only with one: without it the renderer is handed none, which
    // also frees what it held. The tiles hide heat behind them like the level
    // does, so a change redraws the heat as well as the scene.
    const tilesForModel = s.level?.kind === 'model';
    if (
      worldTiles.version !== this.tilesVersion ||
      tilesForModel !== this.tilesForModel ||
      renderer !== this.tilesRenderer
    ) {
      this.tilesVersion = worldTiles.version;
      this.tilesForModel = tilesForModel;
      this.tilesRenderer = renderer;
      // The inspector gets the same set, so a click hits what is drawn.
      const tiles = tilesForModel ? worldTiles.tiles : [];
      renderer.setWorldTiles(tiles);
      this.inspector.setTiles(tiles);
      this.invalidate(2);
    }

    // Line heat's routes: built when the mode wants them, for this dataset and
    // these events, and freed when it no longer does - they cost four bytes a
    // row here and eight on the GPU, which nothing else needs.
    const wantLines = s.mode === 'heat-lines' && this.dataset !== null;
    const linesKey = wantLines ? `${this.dataset!.id}|${lineSettingsKey(s.lines)}` : '';
    if (linesKey !== this.linesKey) {
      this.linesKey = linesKey;
      this.lines = wantLines ? buildLines(this.dataset!, s.lines) : null;
      renderer.setLines(this.lines);
      this.live.gpuBytes = renderer.gpuBytesUsed;
      this.live.lines = this.lines
        ? { routes: this.lines.routes, ended: this.lines.ended, segments: this.lines.segments, jumps: this.lines.jumps }
        : null;
      this.geometrySig = '';
    }

    if (s.timeline.seekNonce !== this.lastSeekNonce) {
      this.lastSeekNonce = s.timeline.seekNonce;
      this.playhead = s.timeline.playhead;
    }

    // The selected session's span, not the whole file's. See `playbackRange`.
    const range = playbackRange(this.dataset, s.mode, s.team.session);
    const playing = s.timeline.playing && !!this.dataset;
    // Played backwards as Tacview's reverse playback: the same, from the end towards the start.
    const back = !!s.timeline.reverse;
    if (playing && !this.wasPlaying) {
      // Starting from the end restarts, the way every media player does. Without
      // this, pressing Play after a run to the end looks like a dead button.
      const span = range[1] - range[0];
      if (span > 0 && !back && this.playhead >= range[1] - span * 1e-4) this.playhead = range[0];
      if (span > 0 && back && this.playhead <= range[0] + span * 1e-4) this.playhead = range[1];
    }
    if (playing) {
      this.playhead += dt * s.timeline.speed * (back ? -1 : 1);
      if (this.playhead > range[1] || this.playhead < range[0]) {
        if (s.timeline.loop) {
          this.playhead = back ? range[1] : range[0];
        } else {
          this.playhead = back ? range[0] : range[1];
          useStore.getState().setPlaying(false);
        }
      }
    }
    this.playhead = Math.min(range[1], Math.max(range[0], this.playhead));
    const race = useRaceStore.getState();
    // The tactics board draws its own scene over the level, as the race tab does,
    // and no heat: everything that skips the heat for the race skips it for the board.
    const boardTab = race.tab === 'plan';
    // The vehicle heatmap too: its own scene, one figure, no heat of the data and no level.
    const vehicleTab = race.tab === 'vehicle';
    const raceTab = race.tab === 'race' || boardTab || vehicleTab;
    if (raceTab !== this.raceWasTab) {
      this.raceWasTab = raceTab;
      this.chase = null;
      this.invalidate(2);
    }
    let raceBuilt: ReturnType<RaceScene['build']> | null = null;
    let raceChanged = false;
    if (vehicleTab) {
      const [frame, changed] = this.vehicleStage.build(this.dataset, s.heat.scheme);
      raceBuilt = { ...frame, cars: new Map() };
      raceChanged = changed;
    } else if (boardTab) {
      const [frame, changed] = this.buildBoard(dt);
      raceBuilt = { ...frame, cars: new Map() };
      raceChanged = changed;
    } else if (raceTab) {
      this.advanceRace(race, dt);
      raceChanged =
        race !== this.raceBuiltFrom || raceClock.time !== this.raceBuiltAt || raceHover.value !== this.raceBuiltHover;
      this.raceBuiltFrom = race;
      this.raceBuiltAt = raceClock.time;
      this.raceBuiltHover = raceHover.value;
      // Before the camera update, so a chase camera is where the car is this
      // frame rather than the last.
      raceBuilt = this.raceScene.build(race, raceClock.time, s.level?.kind === 'model', raceHover.value);
      this.follow(race, raceBuilt.cars, dt);
    }
    // Publish on the transitions rather than every frame: the scrubber reads the
    // engine directly for smoothness, but the store has to be correct whenever
    // anything else might read it — pausing, looping, or reaching the end.
    if (playing !== this.wasPlaying) this.publishPlayhead();
    this.wasPlaying = playing;

    const { width, height } = this.resizeCanvas();
    this.camera.invertY = s.camera.invertY;
    const mirror = s.camera.mirror;
    const want: [number, number, number] = [mirror.x ? -1 : 1, mirror.y ? -1 : 1, mirror.z ? -1 : 1];
    if (want.some((v, i) => v !== this.mirror[i])) this.setMirror(want);
    // Fly speed is owned by two things — the slider and the mouse wheel — so it
    // is pushed down only when the *store* changed. Assigning it unconditionally
    // would overwrite every wheel notch before the sync-back below could see it,
    // which silently breaks wheel-to-adjust-speed while looking correct.
    if (s.camera.flySpeed !== this.lastStoreFlySpeed) {
      this.camera.speed = s.camera.flySpeed;
      this.lastStoreFlySpeed = s.camera.flySpeed;
    }
    // Pushed down only when the *store* changed, so a projection the camera chose
    // itself — via a preset, or the scale-preserving switch — is not immediately
    // overwritten by a stale store value on the same frame.
    if (s.camera.projection !== this.lastStoreProjection) {
      this.lastStoreProjection = s.camera.projection;
      this.camera.setProjection(s.camera.projection);
    }
    this.camera.gamepad = s.camera.gamepad;
    if (!raceTab) this.followTrack(s, dt);
    if (vehicleTab) {
      if (this.vehicleStage.takeFrameRequest()) this.frameDataset(false);
      this.vehicleStage.orbit(this.camera, dt, this.mirror);
    }
    this.viewNear = this.nearForView(s.camera.near, s, raceTab);
    // A followed unit is never cut by the near plane, however close the camera comes (`followNear.ts`).
    if (!raceTab) this.viewNear = nearForFollow(this.viewNear, [this.camera.position.x, this.camera.position.y, this.camera.position.z], this.followedPoint(s), this.dataset ? unitsPerMetre(this.dataset) : 1);
    // Out of a cockpit the unit's own figure is clipped away, as Tacview hides it.
    if (this.rigNear > 0) this.viewNear = Math.max(this.viewNear, this.rigNear);
    this.viewFar = this.farForView(s.camera.far, s, raceTab);
    this.camera.update(dt, width / height, s.camera.fov, this.viewNear, this.viewFar);
    // The pad's "frame" button is a request rather than an action, so the camera
    // does not need to know about the dataset.
    if (this.camera.frameRequested) {
      this.camera.frameRequested = false;
      this.frameDataset(true);
    }
    // Keep the UI's fly-speed box in sync with the wheel and with framing.
    if (Math.abs(this.camera.speed - this.lastStoreFlySpeed) > 1e-6) {
      this.lastStoreFlySpeed = this.camera.speed;
      useStore.getState().patchCamera({ flySpeed: this.camera.speed });
    }

    const cam = this.camera.camera;
    const [mx, my, mz] = this.mirror;
    this.mirrorMat.makeScale(mx, my, mz);
    this.viewMirrored.multiplyMatrices(cam.matrixWorldInverse, this.mirrorMat);
    this.viewProj.multiplyMatrices(cam.projectionMatrix, this.viewMirrored);
    this.pickViewProj.set(this.viewProj.elements);
    if (this.live.backend === 'webgpu') this.viewProj.premultiply(this.depthRemap);
    this.viewProjArr.set(this.viewProj.elements);
    this.viewArr.set(this.viewMirrored.elements);
    this.projArr.set(cam.projectionMatrix.elements);
    this.camPos[0] = cam.position.x * mx;
    this.camPos[1] = cam.position.y * my;
    this.camPos[2] = cam.position.z * mz;
    // The same view relative to the camera's (32-bit) position, for figures: see
    // FrameParams.viewProjRel. The translation is folded in while still double.
    this.originArr.set(this.camPos);
    {
      const e = this.viewProj.elements;
      const [ox, oy, oz] = this.originArr;
      this.viewProjRelArr.set(e);
      for (let r = 0; r < 4; r++) this.viewProjRelArr[12 + r] = e[r] * ox + e[4 + r] * oy + e[8 + r] * oz + e[12 + r];
    }
    // The view axis, read out of the view matrix's third row rather than
    // recomputed from yaw and pitch: the matrix is the thing the projection
    // actually uses, so anything derived from it cannot disagree with what is on
    // screen. Negated because a view matrix looks down -Z.
    const m = this.viewMirrored.elements;
    this.camFwd[0] = -m[2];
    this.camFwd[1] = -m[6];
    this.camFwd[2] = -m[10];

    // A line lays down far less heat per sample than a sprite where samples are
    // close together, and none at all where someone stood still - so the
    // saturation metered for points leaves lines all but black, and the other
    // way round. Meter again when the kind of heat changes, in the heat mode it
    // changed to: box replay draws no heat, and metering there would leave the
    // next heat mode with a saturation for nothing.
    const heatKind = raceTab || s.mode === 'team' ? null : s.mode === 'heat-lines' ? `lines|${this.linesKey}` : 'points';
    if (heatKind !== null && heatKind !== this.meteredKind) {
      if (this.meteredKind !== null && this.dataset) this.autoExposePending = AUTO_EXPOSE_AFTER_FRAMES;
      this.meteredKind = heatKind;
      this.prevSprites = RAMP_START_SPRITES;
    }

    // ---- visible time range
    //
    // In `all` mode the playhead is ignored entirely, which is what makes it a
    // different question ("where does this happen") rather than just scrubbing
    // to the end. In `lifetime` windowing the range is a superset bounded by the
    // longest gap in the data, and the shader narrows it per row.
    const tl = s.timeline;
    const showAll = tl.mode === 'all' || !this.dataset?.time;
    const maxLife = this.dataset
      ? Math.max(this.dataset.maxLifetimeGap, tl.defaultLifetime)
      : tl.defaultLifetime;
    const timeHi = showAll ? range[1] : this.playhead;
    let timeLo = range[0];
    if (!showAll) {
      if (tl.window === 'fixed') timeLo = Math.max(range[0], timeHi - tl.windowSeconds);
      else if (tl.window === 'lifetime') timeLo = Math.max(range[0], timeHi - maxLife);
    }
    // Line heat played back: every route drawn up to where its person is now,
    // with the heat fading over the window behind them - the whole route so
    // far in a cumulative window. The rows it needs reach past the playhead by
    // the longest segment, for the segments people are in the middle of.
    const lineTrail =
      !raceTab && !showAll && s.mode === 'heat-lines' && this.lines !== null
        ? { now: this.playhead, tail: tl.window === 'cumulative' ? 1e30 : Math.max(1e-3, tl.windowSeconds) }
        : null;
    if (lineTrail) {
      timeLo = tl.window === 'cumulative' ? range[0] : Math.max(range[0], this.playhead - lineTrail.tail);
    }
    const rowsHi = lineTrail ? timeHi + this.lines!.maxSeconds : timeHi;
    const useLifetime =
      !lineTrail && !showAll && tl.window === 'lifetime' && !!this.dataset?.lifetime;
    const lifetimeParams = useLifetime
      ? {
          now: this.playhead,
          defaultLifetime: tl.defaultLifetime,
          fadeOut: Math.max(0, Math.min(1, tl.fadeOut)),
        }
      : null;

    // ---- team weights, the difference split and column filters
    //
    // Only difference mode has two sides, so a column split is inert elsewhere.
    // Under one the group table is visibility only, and both are sent: the column
    // decides the sign, the groups still decide who is drawn.
    const heatMode = heatModeFor(s.mode, s.lines);
    const { teamSign, split } = frameSignTables(
      this.dataset,
      heatMode,
      s.positiveTeams,
      s.negativeTeams,
      s.teamVisibility,
      s.filters,
      s.split,
      this.signScratch,
    );
    // The person filter is one of these: a slot over the person ids, so the heat
    // shows the selected people as the box replay does.
    const activeFilters = buildActiveFilters(this.dataset, s.filters, this.filterCache);
    const splitScale = this.updateSideCounts(
      now,
      heatMode === 'heat-difference' && !raceTab && s.mode !== 'team',
      s.heat.splitShares,
      timeLo,
      rowsHi,
      activeFilters,
      teamSign,
      split,
    );
    // A filter can take what is drawn from every position to a hundred kills -
    // a density orders of magnitude lower, which the saturation metered for
    // all of it would leave all but invisible. Meter again, as on a load.
    if (s.filters !== this.meteredFilters) {
      if (this.meteredFilters !== null && this.dataset) this.autoExposePending = AUTO_EXPOSE_AFTER_FRAMES;
      this.meteredFilters = s.filters;
    }

    // ---- colour LUT
    const lutSig = JSON.stringify(s.heat.scheme);
    let lutDirty = false;
    if (lutSig !== this.lutSig) {
      this.lutSig = lutSig;
      this.lut = buildColorLut(s.heat.scheme, this.lut.length ? this.lut : undefined);
      lutDirty = true;
    }

    // ---- sprite ramp curve
    // Baked here rather than in the store so dragging a control point costs one
    // 256-entry evaluation per frame at most, and nothing at all once released.
    const curveSig = curveSignature(s.heat.curve);
    let curveDirty = false;
    if (curveSig !== this.curveSig) {
      this.curveSig = curveSig;
      this.curveLut = bakeCurveLut(
        s.heat.curve,
        CURVE_LUT_SIZE,
        this.curveLut.length === CURVE_LUT_SIZE ? this.curveLut : undefined,
      );
      curveDirty = true;
    }

    // ---- adaptive budget
    // Clamped only against the absurd — a tab regaining focus, a driver stall —
    // not against merely slow. The cap used to be 200ms, which is inside the
    // range this app genuinely reaches on a heavy level, and a controller whose
    // input saturates cannot tell "slow" from "very much worse than slow": the
    // budget controller's check for a climb making things worse compares against
    // a multiple of the frame time, and above a 133ms baseline that multiple sat
    // beyond the cap and could never be observed.
    this.smoothedFrameMs = this.smoothedFrameMs * 0.9 + Math.min(2000, dtRaw * 1000) * 0.1;
    // The controllers listen only to frames that drew. A converged view redraws
    // nothing but the composite, so its frames say nothing of what drawing costs,
    // and with the display's refresh holding them at the target they used to
    // read as a spell of calm: the controller probed upward, the probe changed
    // the resolution, the change threw the field away and redrew it, and the
    // redraw's slow frame cut it back - every second or so, on a view nobody
    // touched.
    const targetMs = 1000 / Math.max(15, s.budget.targetFps);
    if (this.lastFrameDrew) this.drawnFrameMs = this.drawnFrameMs * 0.9 + Math.min(2000, dtRaw * 1000) * 0.1;
    let splatBudget = s.budget.splatsPerFrame;
    if (s.budget.adaptive && s.mode !== 'team') {
      // Not while every row is drawn: the sprite cap answers for the heat there.
      splatBudget = this.lastFrameDrew && !s.budget.exact ? this.budget.update(this.drawnFrameMs, targetMs) : this.budget.value;
    } else {
      this.budget.reset(s.budget.splatsPerFrame);
    }
    // What the heat pass cost: its GPU time where the device times it, which the
    // display's refresh cannot hide; the drawn frame's time otherwise.
    const passMs = (renderer as { gpuPassMs?: Record<string, number> }).gpuPassMs;
    const heatGpuMs = passMs?.heat;
    const heatCost = heatGpuMs !== undefined ? heatGpuMs : Math.min(2000, dtRaw * 1000);
    // Less while a dataset or tracks are still arriving: their slices take
    // a few milliseconds of every frame meanwhile.
    const arriving = (renderer as { dataPending?: boolean }).dataPending || (renderer as { uploadsPending?: boolean }).uploadsPending ? ARRIVING_MS : 0;
    const heatBudgetMs =
      heatGpuMs !== undefined ? Math.max(1, targetMs * HEAT_GPU_SHARE - (passMs?.scene ?? 0) * 0.25 - arriving) : targetMs;
    const spritePx = this.spritePixels(s, height);
    // Not for line heat: a route is drawn at least a few pixels wide however
    // coarse the buffer, so a coarser level changes how much heat a thin route
    // leaves, and a camera move that changed the level showed as a flicker.
    // With the automatic off the resolution is the user's alone: no level for the sprites' size or cost.
    const level =
      s.mode === 'heat-lines' || !s.budget.adaptive
        ? 1
        : this.heatLevel.update(spritePx, this.lastFrameDrew && s.mode !== 'team' ? heatCost : null, heatBudgetMs);
    // The resolution: the user's, the budget's second stage, and the level for
    // the sprites' size. A change of it throws the field away, so it is taken up
    // only on a frame that starts over anyway - the camera moving, or the user
    // changing it - and never on a still view, which would redraw for nothing.
    // The budget's second stage in powers of two too, so its levels are ones the
    // renderers keep targets for. Not with every row drawn: there the level and
    // the sprite cap answer to the heat's own cost, and a third control on the
    // same cost, reading the whole frame's time, only fights them.
    const budgetScale = s.budget.exact
      ? 1
      : Math.pow(2, Math.round(Math.log2(Math.max(0.25, this.budget.resolutionScale))));
    const wantHeatScale = s.budget.heatScale * budgetScale * level;
    if (this.heatScaleUsed === 0 || this.camera.moved || this.heatScaleUserSet !== s.budget.heatScale) {
      this.heatScaleUsed = wantHeatScale;
      this.heatScaleUserSet = s.budget.heatScale;
    }
    const effectiveHeatScale = this.heatScaleUsed;
    this.live.heatScale = effectiveHeatScale;
    this.heatCostMs = heatCost;
    this.heatBudgetMs = heatBudgetMs;
    this.heatCostPeak = Math.max(heatCost, passMs?.heatLast ?? 0);
    // Line heat keeps the patient rule: a route's heat is spread along it, so a
    // cap that moves while the camera does shows as the routes flickering.
    this.heatTimed = heatGpuMs !== undefined && s.mode !== 'heat-lines';
    // A sprite's cost goes with the texels it covers. When a radius change or a
    // zoom changes that, the cap moves with it on the same frame, rather than
    // after the GPU time has shown the frame it already dropped. Below a couple
    // of texels the vertex work dominates and size stops mattering.
    const texelRadius = Math.max(2, spritePx * effectiveHeatScale);
    if (this.capTexelRadius > 0 && this.dataset && this.heatTimed) {
      const k = (this.capTexelRadius / texelRadius) ** 2;
      if (k < 0.9 || k > 1.1) {
        this.exactCap = Math.max(EXACT_FLOOR_SPRITES, Math.min(EXACT_SPRITE_CAP, this.exactCap * Math.max(0.25, Math.min(2, k))));
        this.capTexelRadius = texelRadius;
      }
    } else {
      this.capTexelRadius = texelRadius;
    }

    // ---- grid extent, sized from the data rather than fixed
    const gridSpacing = this.dataset ? niceGridSpacing(this.dataset.bounds) : 10;
    // Keep the grid a modest multiple of the data's own footprint. Extending it
    // far past the data just fills the horizon with sub-pixel lines and moire.
    const dataExtent = this.dataset ? horizontalExtent(this.dataset.bounds) : gridSpacing * 20;
    const gridExtent = Math.max(gridSpacing * 8, Math.min(dataExtent * 1.5, gridSpacing * 120));

    // ---- ruler
    //
    // The reference plane is the map's own elevation when there is one, so a
    // measurement lands where the background says the ground is.
    const planeY =
      s.level?.kind === 'image' ? s.level.elevation : this.dataset ? this.dataset.bounds.minY : 0;
    let overlayVerts: Float32Array | null = null;
    let overlayVertCount = 0;
    if (this.measureEnabled) {
      if (this.cursorPx) {
        const ndcX = (this.cursorPx.x / this.canvas.clientWidth) * 2 - 1;
        const ndcY = 1 - (this.cursorPx.y / this.canvas.clientHeight) * 2;
        // The camera's ray is in display space; the ruler is in world space.
        const hit = screenToPlane(cam, ndcX, ndcY, planeY * my);
        this.measure.cursor = hit ? { x: hit.x * mx, y: hit.y * my, z: hit.z * mz } : null;
      }
      const ov = buildOverlay(this.measure, gridSpacing * 0.15, this.overlayBuf);
      this.overlayBuf = ov.data;
      overlayVerts = ov.data;
      overlayVertCount = ov.count;
    } else if (this.measure.cursor) {
      this.measure.cursor = null;
      this.measure.heat = null;
    }
    // The pick marker: a cross whose arms are a fixed fraction of its distance,
    // so it reads the same size on screen near and far.
    const marker = raceTab ? null : this.inspector.marker;
    if (marker) {
      const reach = Math.hypot(marker.x - this.camPos[0], marker.y - this.camPos[1], marker.z - this.camPos[2]);
      const ov = appendCross(this.overlayBuf, overlayVertCount, marker, Math.max(1e-3, reach * 0.025));
      this.overlayBuf = ov.data;
      overlayVerts = ov.data;
      overlayVertCount = ov.count;
    }
    // The user's volumes, their handles and the shape being drawn.
    const vols = useVolumeStore.getState();
    const volGest = this.volumeGestures;
    let volumeSig = '';
    if (!raceTab && (vols.volumes.length > 0 || volGest.busy)) {
      const sel = selectedVolume(vols);
      const ov = appendVolumeOverlay(this.overlayBuf, overlayVertCount, {
        volumes: vols.volumes,
        selected: vols.selected,
        handles: sel && sel.visible ? volGest.handles(sel) : [],
        hover: volGest.hover,
        draft: volGest.draft(),
        polygon: volGest.polygonPoints(),
        markerSize: (p) => Math.max(1e-3, Math.hypot(p[0] - this.camPos[0], p[1] - this.camPos[1], p[2] - this.camPos[2]) * 0.008),
      });
      this.overlayBuf = ov.data;
      overlayVerts = ov.data;
      overlayVertCount = ov.count;
      volumeSig = `${this.volumeRev}|${volGest.version}`;
    }
    const volumeDraw = raceTab ? null : this.frameVolumes();

    // ---- what invalidates the accumulation buffer
    const groundY = this.dataset ? this.dataset.bounds.minY : 0;
    const h = s.heat;
    // The exposure follower's glide is drawn from here and written to the store
    // once, as it lands. Written every frame it re-rendered every panel reading
    // the heat settings sixty times a second for the length of the glide, which
    // is CPU the frame did not have. A saturation set by hand meanwhile wins.
    if (this.follower.from !== null && h.saturation !== this.follower.from) this.follower.cancel();
    const glide = this.follower.value(now);
    if (glide !== null && this.follower.from === null) useStore.getState().patchHeat({ saturation: glide });
    const saturation = glide ?? h.saturation;
    this.shownSaturation = saturation;
    // Computed before the signatures because it belongs in one: the gain is the
    // units the buffer is written in, so a change to it invalidates everything
    // already accumulated.
    this.frameGain = this.heatGain(renderer, h);
    const geometrySig = [
      raceTab ? 'race' : s.mode === 'heat-lines' ? `heat-lines|${heatMode}` : s.mode,
      // Which routes line heat draws.
      this.linesKey,
      h.radius,
      h.centerIntensity,
      h.edgeIntensity,
      h.falloff,
      h.minPixelRadius,
      h.maxPixelRadius,
      // Whether a clamped sprite keeps its heat changes every clamped sprite.
      h.zoomInvariant ? 1 : 0,
      h.groundProjected ? 1 : 0,
      h.smoothRamp ? 1 : 0,
      // Each chunk of a dataset still arriving, as it lands: see the renderers'
      // `flushDataUpload`.
      (renderer as { dataGeneration?: number }).dataGeneration ?? 0,
      // The units the accumulation buffer is written in.
      this.frameGain,
      // The curve changes the shape of every sprite, so accumulated heat from the
      // old shape is no longer an estimate of anything.
      h.useCurve ? `curve:${curveSig}` : '',
      // Distance culling changes which rows contribute, so it invalidates the
      // accumulated field. Its cost is one signature entry, not a rebuild.
      h.cullNear,
      h.cullFar,
      h.cullPlanar ? 1 : 0,
      // Occlusion and the slice both change how much each row contributes, and
      // both are resolved per point while splatting — so the accumulated field
      // was written under the old setting and is no longer an estimate of
      // anything. Left out of this list, they appear to do nothing at all: the
      // engine keeps the converged field and only recomposites it.
      h.occlusion,
      h.hideBehindGround ? 1 : 0,
      s.slice.enabled
        ? `slice:${s.slice.axis}:${s.slice.center}:${s.slice.thickness}:${s.slice.outsideOpacity}:${s.slice.clipHeat ? 1 : 0}`
        : '',
      groundY,
      width,
      height,
      effectiveHeatScale,
      teamSign ? teamSign.join(',') : '',
      // The split decides which rows contribute and with what sign, so a change
      // invalidates accumulated heat outright.
      `${split.mode}:${split.column ?? ''}:${split.sign ? split.sign.join(',') : ''}:${split.positiveRange.join(',')}:${split.negativeRange.join(',')}`,
      // Each side's weight, when the sides are normalised to their totals.
      splitScale.join(','),
      // Switching between all/play or changing the expiry rule invalidates the
      // accumulated field outright, so these belong here rather than in the
      // window signature that only triggers a blend.
      showAll ? 'all' : 'play',
      useLifetime ? 'life' : tl.window,
      // A filter change alters which rows contribute, so accumulated heat is
      // no longer an estimate of anything and must be discarded.
      activeFilters.map((f) => f.key).join(';'),
      // So does the volumes filter.
      volumeDraw ? volumeDraw.key : '',
    ].join('|');
    const windowSig =
      `${timeLo}|${timeHi}|` +
      // The fade scales each row's contribution, so changing it changes the field
      // and the accumulation has to start over.
      (useLifetime ? `${tl.defaultLifetime}|${tl.fadeOut}` : '');
    // Saturation and the ramp are applied at composite time, so changing them
    // must redraw but must NOT throw away accumulated heat. The team settings
    // ride along here for the same reason: they change what gets drawn without
    // invalidating any accumulated heat.
    const teamCfg = s.team;
    const compositeSig = [
      saturation,
      h.response,
      h.floor,
      lutSig,
      // Culling the level redraws the scene and leaves the heat field alone —
      // which is what this signature is for. In `geometrySig` it would throw away
      // a converged field to change something the field does not depend on.
      h.cullGeometry ? 1 : 0,
      s.showGrid,
      s.showAxes,
      gridSpacing,
      teamCfg.cubeSize,
      teamCfg.interpolate ? 1 : 0,
      teamCfg.showLookDirection ? 1 : 0,
      teamCfg.lookLength,
      teamCfg.trailSeconds,
      // Redraws the scene without touching the heat field: the session decides
      // which cubes and trails exist, and cubes are not accumulated.
      teamCfg.session,
      teamCfg.showRawSamples ? 1 : 0,
      tl.defaultLifetime,
      // Depth of field is applied at composite, so changing it must redraw but
      // must not throw away accumulated heat.
      s.camera.dof.enabled ? 1 : 0,
      s.camera.dof.maxBlur,
      s.camera.dof.aperture,
      s.camera.dof.autoFocus ? this.camera.focusDistance : s.camera.dof.focusDistance,
      // The pick marker is overlay, drawn with the scene: moving it must redraw.
      marker ? `${marker.x},${marker.y},${marker.z}` : '',
      // The volumes' outlines and handles, likewise.
      volumeSig,
    ].join('|');

    // A level arriving a slice a frame is drawn once all of it is there, and the
    // view may be still by then, so that frame has to draw the scene.
    const uploading = (renderer as { uploadsPending?: boolean }).uploadsPending ?? false;
    if (this.wasUploading && !uploading) this.forceRenderFrames = Math.max(this.forceRenderFrames, 1);
    this.wasUploading = uploading;
    const forced = this.forceRenderFrames > 0;
    if (forced) this.forceRenderFrames--;
    const geometryChanged = forced || geometrySig !== this.geometrySig;
    const windowChanged = windowSig !== this.windowSig;
    const compositeChanged = compositeSig !== this.compositeSig;
    const cameraMoved = this.camera.moved;
    this.camera.moved = false;
    this.geometrySig = geometrySig;
    this.windowSig = windowSig;
    this.compositeSig = compositeSig;

    // ---- what the buffer already holds
    //
    // A cumulative window only ever grows, so the rows already accumulated stay
    // visible and the frame need only add the ones that just became visible.
    // Everything else — a sliding window, a seek backwards, a camera move — makes
    // the buffer's contents wrong and forces a fresh estimate.
    const rowRange =
      this.dataset && s.mode !== 'team'
        ? candidateRange(this.dataset, timeLo, rowsHi)
        : ([0, 0] as [number, number]);
    // Not with a moving head: a segment drawn part-way last frame is drawn
    // further this one, so adding to what is there would count it twice.
    const growing = !showAll && tl.window === 'cumulative' && !useLifetime && !lineTrail;
    const mustReset = !s.budget.progressive || cameraMoved || geometryChanged;
    // A base thinned while the camera moved is drawn again, whole, once it
    // stops: it is kept and only extended from, and the thinning would stay.
    const canExtend =
      growing &&
      !mustReset &&
      !(this.baseThinned && !cameraMoved) &&
      this.accumRowLo === rowRange[0] &&
      this.accumRowHi >= 0 &&
      rowRange[1] >= this.accumRowHi;

    // ---- sampling plan
    let plan: ChunkDrawPlan[] = EMPTY_PLAN;
    let candidateRows = 0;
    let submitted = 0;
    let sampleWeight = 1;
    let runFrames = 0;
    // Rows this frame is responsible for: the whole window normally, only the
    // newly-visible tail when extending.
    const planLo = canExtend ? this.accumRowHi : rowRange[0];
    const planHi = rowRange[1];

    // A frame that starts a fresh estimate draws *everything*, budget aside.
    //
    // This is the rule that stops a moving camera glittering, and it is stated
    // here as a rule rather than left to the budget controller to arrive at,
    // because a controller can only ever arrive at it approximately and
    // temporarily. Accumulation is what removes the sampling grain, a camera move
    // discards the accumulation, and so a moving frame is a single estimate whose
    // noise is set entirely by how much of the data it drew. Draw a quarter and
    // you see a quarter, in bright weighted dots.
    //
    // Everything else tried here treats the symptom. Raising the default budget
    // helps until a dataset is bigger than the new default. Teaching the adaptive
    // controller to climb out of its floor works — measured, it reached exactness
    // on a 14M-row load — but it is a feedback loop with a frame-time target, so
    // on a heavier level it settles somewhere lower, oscillates while it hunts,
    // and the grain comes and goes. And telling someone to switch the adaptive
    // budget off and type 16M works right up until they reload the page, because
    // none of these settings are persisted: that is exactly how this came back
    // after being fixed.
    //
    // The cost is real and it is the right way round. A frame the camera moved on
    // is transient — nobody reads a value off it — so spending time to make it
    // *correct* is worth more than spending it to make it *quick*, and the
    // alternative is not a faster picture but a wrong one. The frame the camera
    // stops on is the one that gets read, and this makes that frame exact
    // immediately rather than after a second of settling.
    // Unconditional, for the rows this frame is responsible for.
    //
    // Narrowing it to "the camera moved" was tried and it reintroduces the
    // problem at the other end of the gesture. The frame the camera moves on is
    // then exact, but the frames *after* it merge partial estimates into that
    // exact one at 1/n — so letting go of the mouse produces three or four frames
    // of diluted picture before the accumulation catches up. Barely a tenth of a
    // second, and precisely the shimmer this is supposed to remove.
    //
    // Exact everywhere means the accumulator has nothing to do in the ordinary
    // case: `convergeFrames` comes out at one, the very next frame is idle, and
    // the whole progressive machinery is left where it is still needed — a window
    // holding more rows than one draw plan can carry.
    //
    // What this costs is the configured `Sprites / frame` becoming a floor rather
    // than a ceiling. That is a real loss of control and it is the right trade:
    // the setting exists to bound frame cost, the bound is already there in the
    // draw plan's own capacity, and the levers that actually matter for cost —
    // the time window, the filters, the distance cull — all reduce the candidate
    // rows themselves rather than sampling them more thinly.
    if (s.budget.exact && this.dataset && s.mode !== 'team') {
      // Held after each change for as long as the smoothed GPU time takes to
      // show it; acting again on the old reading cut a cap that had already
      // been cut, down to the floor.
      // A cut does not wait out the hold that followed a step up: over budget
      // is frames being dropped now.
      if (this.lastFrameDrew && this.capHold > 0 && !(this.capHoldAfterGrowth && this.heatCostPeak > this.heatBudgetMs * 1.15)) {
        this.capHold--;
      } else {
        // Without the heat's GPU time the frame time is all there is, and the
        // display's refresh hides what part of it the heat is: there the old,
        // patient rule stays, which only reacts to a frame near the watchdog.
        // Over budget, cut from what was drawn rather than from the cap: with
        // fewer rows in view than the cap allows, cutting the cap did nothing
        // for step after step while every other frame was dropped.
        //
        // And judged on the latest reading as well as the average: a view that
        // turns onto dense data costs more at once, and the average showed it
        // only after a run of dropped frames.
        const over = this.heatCostPeak > this.heatBudgetMs * 1.15;
        const from = over && this.prevSprites > 0 ? Math.min(this.exactCap, this.prevSprites) : this.exactCap;
        const cap = this.heatTimed
          ? nextHeatCap(from, over ? this.heatCostPeak : this.heatCostMs, this.heatBudgetMs, this.lastFrameDrew, mustReset, {
              floor: EXACT_FLOOR_SPRITES,
              ceiling: EXACT_SPRITE_CAP,
            })
          : nextExactCap(Math.max(this.exactCap, EXACT_FLOOR_UNTIMED), Math.min(2000, dtRaw * 1000), this.lastFrameDrew, mustReset, {
              floor: EXACT_FLOOR_UNTIMED,
              ceiling: EXACT_SPRITE_CAP,
              stallMs: EXACT_STALL_MS,
              easyMs: EXACT_EASY_MS,
            });
        // A cut is judged again as soon as the GPU's reading of it is back, a
        // few frames; growth waits for the average to settle.
        if (cap !== this.exactCap) {
          this.capHold = cap < from ? CAP_CUT_HOLD_FRAMES : CAP_HOLD_FRAMES;
          this.capHoldAfterGrowth = cap >= from;
        }
        this.exactCap = cap;
      }
      // With the budget adaptive, the cap is the control: the frame-time
      // controller's own figure used to be a floor under it, and that
      // controller, having seen cutting fail to help on a slow frame for other
      // reasons, climbs - it held a radius too wide for the frame at every row.
      // With the automatic off nothing adapts: every row in view, every frame.
      const exactRows = s.budget.adaptive ? Math.min(this.exactCap, planHi - planLo) : planHi - planLo;
      splatBudget = s.budget.adaptive ? exactRows : Math.max(splatBudget, exactRows);
      // A growing window's base is kept and only extended from, never averaged
      // over again, so a sampled base stayed sampled for as long as it played.
      // It is drawn whole up to the floor the cap always had.
      if (growing && !canExtend && !cameraMoved) splatBudget = Math.max(splatBudget, Math.min(EXACT_FLOOR_UNTIMED, planHi - planLo));
      // At most twice what the last drawn frame drew. The cap answers a cost it
      // has seen; when the rows on offer jump - a chunk of a dataset landing, a
      // window opening - drawing all of them at once was a frame it never saw.
      //
      // And less than twice where the last reading says twice would not fit:
      // the cap had never seen this scene's cost on its first frames, drew
      // every row in view at once, and the GPU took 27 ms over it.
      //
      // A step up waits for the GPU's reading of the last one, a few frames:
      // doubling every frame reached every row in view before the first
      // reading of the cost came back.
      if (s.budget.adaptive && this.heatTimed && this.prevSprites > 0) {
        const settled = this.frameIndex - this.rampFrame >= RAMP_FRAMES;
        const ramp = !settled ? 1 : this.heatCostPeak > 0 ? Math.max(1, Math.min(2, (this.heatBudgetMs * 0.9) / this.heatCostPeak)) : 2;
        const limit = Math.max(EXACT_FLOOR_SPRITES, this.prevSprites * ramp);
        if (splatBudget > this.prevSprites && limit > this.prevSprites) this.rampFrame = this.frameIndex;
        splatBudget = Math.min(splatBudget, limit);
      }
    }

    if (this.dataset && s.mode !== 'team') {
      // A run of accumulation keeps the sprite count it started with and takes
      // the blocks in turn, so that when it ends every row has been drawn once.
      // See `PlanOptions.runFrame`.
      const fresh = mustReset || canExtend || growing || windowChanged;
      if (fresh || this.runSplats === 0) this.runSplats = splatBudget;
      const r = planFrame({
        rowLo: planLo,
        rowHi: planHi,
        splatsPerFrame: fresh ? splatBudget : this.runSplats,
        frameIndex: this.frameIndex,
        // A frame that starts over, or a sliding window's, draws the run's first
        // share; the tail a growing window adds is drawn the old way, whole.
        runFrame: canExtend ? undefined : fresh ? 0 : this.accumFrames,
      });
      plan = r.plan;
      candidateRows = r.candidateRows;
      submitted = r.submittedSprites;
      sampleWeight = r.sampleWeight;
      runFrames = r.frames ?? 0;
    }

    // Keep the planned figure for the readout: once accumulation converges the
    // frame stops splatting, and reporting the resulting 0 would read as a bug.
    const plannedSubmitted = submitted;
    const convergeFrames =
      submitted > 0 ? Math.max(1, runFrames || Math.ceil(candidateRows / submitted)) : 1;
    const converged = this.accumFrames >= convergeFrames;

    let accumMode: FrameParams['accumMode'];
    let blendAlpha = 1;
    // Idle: converged and nothing that affects the picture changed. The frame
    // still has to redraw the canvas — see `compositeOnly` — but it draws nothing
    // new into the scene or heat buffers, so it costs one fullscreen pass.
    let compositeOnly = false;
    if (mustReset) {
      accumMode = 'reset';
      this.accumFrames = 1;
    } else if (canExtend) {
      // Add the tail. Nothing decays, so the field builds up exactly — and when
      // the playhead stops the tail is empty and there is simply nothing left to
      // arrive, which is why pausing no longer changes the picture.
      accumMode = 'extend';
      this.accumFrames = 1;
      compositeOnly = candidateRows === 0 && !compositeChanged;
      if (candidateRows === 0) plan = EMPTY_PLAN;
    } else if (growing) {
      // A growing window whose buffer is not extendable yet — first frame of
      // playback, or just after a seek. Lay down the base in one go and extend
      // from it, rather than taking the moving-average path: that path is checked
      // after this one, so without this branch a growing window would re-estimate
      // itself every frame and never become extendable at all.
      accumMode = 'reset';
      this.accumFrames = 1;
    } else if (windowChanged && lineTrail) {
      // Played-back lines move: the heads are somewhere else every frame, and a
      // moving average would smear each into a streak of its own. Each frame is
      // drawn whole instead - the tail is the fade the picture asks for.
      accumMode = 'reset';
      this.accumFrames = 1;
    } else if (windowChanged) {
      // A window that slides has to be re-estimated; an exponential moving average
      // is unbiased in steady state and far quieter than starting over each frame.
      accumMode = 'ema';
      this.accumFrames = 1;
      blendAlpha = EMA_ALPHA;
    } else if (converged) {
      // Nothing left to add; hold what the buffer already has.
      accumMode = 'mean';
      blendAlpha = 0;
      plan = EMPTY_PLAN;
      compositeOnly = !compositeChanged;
    } else {
      // Running mean: 1/n on the nth frame merges this estimate into the average
      // of the previous n-1 without the buffer ever exceeding one field's worth.
      accumMode = 'mean';
      this.accumFrames += 1;
      blendAlpha = 1 / this.accumFrames;
    }

    // Record what the buffer will represent after this frame. Only a growing
    // window can be extended from; anything else invalidates it.
    if (!growing) {
      this.accumRowLo = -1;
      this.accumRowHi = -1;
    } else if (accumMode === 'extend') {
      this.accumRowHi = Math.max(this.accumRowHi, planHi);
    } else {
      // A fresh estimate of the whole window, extendable from here. If the window
      // was too large to splat in one frame this base carries the sampler's noise
      // and keeps it — but it keeps it *steadily*, which is the point: a static
      // grain reads as texture, while re-estimating every frame reads as flicker.
      this.accumRowLo = rowRange[0];
      this.accumRowHi = planHi;
      // Only a base thinned by the cap while moving is redrawn, once: one
      // past the floor even at rest stays as it is.
      this.baseThinned = cameraMoved && submitted < candidateRows;
    }

    // The team view's units move with the playhead even when no heat changes. In
    // team mode the cumulative window has no rows to add, so the extend branch
    // above calls the frame idle; without this the figures froze while playing
    // and moved only when the camera did.
    if (s.mode === 'team' && this.dataset && this.playhead !== this.teamDrawnAt) compositeOnly = false;

    if (plan === EMPTY_PLAN) submitted = 0;
    // What the frame asked for, not what the plan's power-of-two thinning drew:
    // ramping from the drawn count never reached the next power of two.
    if (submitted > 0 && !compositeOnly) this.prevSprites = Math.max(submitted, Math.min(splatBudget, candidateRows));
    this.live.accumMode = compositeOnly ? 'skip' : accumMode;

    // ---- team viewer geometry
    let cubes: Float32Array | null = null;
    let cubeCount = 0;
    let trailVerts: Float32Array | null = null;
    let trailVertCount = 0;
    // A dataset of many thousands of units (an overlay of many matches): every
    // unit placed by the GPU, the CPU only sets the playhead (gpuTracks/).
    const gpuStore = s.mode === 'team' && !showAll && !s.team.showRawSamples && s.team.figures ? this.gpuStoreFor(s, renderer) : null;
    if (!compositeOnly) this.gpuTracksParams = null;
    if (gpuStore && !compositeOnly) {
      this.figureTris = null;
      this.figureBatches = null;
      this.pickCubes = null;
      this.gpuFrame(s, gpuStore);
    }
    // Skipped on an idle frame: nothing draws it, and rebuilding one cube per
    // person every frame while the view sits still is the one cost that would make
    // recompositing-when-idle worth avoiding.
    if (s.mode === 'team' && !compositeOnly) this.teamDrawnAt = this.playhead;
    if (s.mode === 'team' && this.cursor && !compositeOnly && !gpuStore) {
      const visible = this.personVisibility(s.teamVisibility, s.filters);
      // `all` mode ignores the playhead, so the cursor is placed at the end and
      // every sample in range is drawn rather than one live position per person.
      const cursorAt = showAll ? range[1] : this.playhead;
      // Which match is being played back. Set before the cursor is moved: it is
      // part of what a track *is*, not a filter over one, so changing it has to
      // invalidate the cursors rather than be applied to their results.
      this.cursor.setSession(s.team.session);
      this.cursor.update(cursorAt);

      const drawEverySample = showAll || s.team.showRawSamples;
      let motion: MotionModel | null = null;
      // Data units a pixel covers at a point, for figures and weapons kept a few pixels big at distance.
      const eye: [number, number, number] = [this.camPos[0], this.camPos[1], this.camPos[2]];
      const hgt = Math.max(1, this.canvas.clientHeight);
      const focal = hgt / (2 * Math.tan((s.camera.fov * Math.PI) / 360));
      const ortho = this.camera.projection !== 'perspective' ? this.camera.orthoHeight / hgt : 0;
      const pixelSize = ortho ? () => ortho : (x: number, y: number, z: number) => Math.hypot(x - eye[0], y - eye[1], z - eye[2]) / focal;
      if (drawEverySample) {
        const span = showAll
          ? Number.POSITIVE_INFINITY
          : tl.window === 'fixed'
            ? tl.windowSeconds
            : Number.POSITIVE_INFINITY;
        const raw = this.cursor.buildRawSamples(cursorAt, span, visible);
        cubes = raw.data;
        cubeCount = raw.count;
        if (cubes) cubeCount = this.filterCubes(cubes, cubeCount, CUBE_STRIDE, this.cursor.cubeRows, null, null);
      } else {
        // The lifetime is what decides how long someone with no further samples
        // keeps being drawn, so it doubles as the staleness cut-off here.
        const live = this.cursor.buildCubes(
          cursorAt,
          s.team.interpolate,
          tl.defaultLifetime,
          visible,
          // Figures leave when their data does (`data/despawn.ts`).
          s.team.figures && this.dataset ? endsOf(this.dataset) : null,
        );
        cubes = live.data;
        cubeCount = live.count;
        // On their curves rather than straight from sample to sample, turned the short way round.
        if (s.team.interpolate && this.dataset) {
          motion = this.motion.refine(this.dataset, cubes, CUBE_STRIDE, cubeCount, this.cursor.cubeRows, cursorAt, s.team.session);
          cubeCount = this.motion.count;
        }
        // The volumes filter: the replay shows the units the heat would.
        if (cubes) {
          cubeCount = this.filterCubes(cubes, cubeCount, CUBE_STRIDE, this.cursor.cubeRows, motion ? this.motion.poses : null, motion ? this.motion.posed : null, motion ? this.motion.exact : null);
          if (motion) this.motion.count = cubeCount;
        }
      }
      this.pickCubes = {
        data: cubes,
        stride: CUBE_STRIDE,
        count: cubeCount,
        rows: this.cursor.cubeRows,
        size: s.team.cubeSize,
        // Filled in below when the boxes are drawn as figures: a click picks the figure it lands on.
        figureHit: undefined as ((origin: [number, number, number], dir: [number, number, number]) => number) | undefined,
      };
      // The live tracks, for the labels and the follow camera.
      const tracks: typeof this.liveTracks = [];
      const pid = this.dataset?.personId ?? null;
      if (!drawEverySample) {
        for (let i = 0; i < cubeCount; i++) {
          const row = this.cursor.cubeRows[i];
          const o = i * CUBE_STRIDE;
          // With its attitude where the motion model has one, for the cockpit view and the radar cones.
          const q = motion && this.motion.posed[i] ? Array.from(this.motion.poses.subarray(i * 4, i * 4 + 4)) : null;
          // In double precision where the motion model placed it (`MotionRefiner.exact`).
          const ex = motion ? this.motion.exact : null;
          const [x, y, z] = ex ? [ex[i * 3], ex[i * 3 + 1], ex[i * 3 + 2]] : [cubes[o], cubes[o + 1], cubes[o + 2]];
          tracks.push({ person: pid && row >= 0 ? pid[row] : i, row, x, y, z, yaw: cubes[o + 6], pitch: cubes[o + 7], q });
        }
      }
      this.liveTracks = tracks;
      // Clicks still answer every person; only the drawing changes.
      this.figureTris = null;
      this.figureBatches = null;
      const liveCubes = cubes;
      const liveCount = cubeCount;
      if (s.team.figures && this.dataset && !drawEverySample) {
        // Each live box as its figure; what has none stays a box. A data unit is
        // a metre unless the data says how big one tracked thing is (a CS2 player
        // is 32 units across, about 0.8 m). True size up close, and never
        // smaller on screen than `figurePixels`, as Tacview draws them.
        const units = unitsPerMetre(this.dataset);
        const fr = this.figureReplay;
        fr.build(this.dataset, cubes, cubeCount, this.cursor.cubeRows, {
          scale: units * Math.max(0.01, s.team.figureScale),
          unknown: fr.knowsTypes(this.dataset) ? 'box' : 'soldier',
          minPixels: s.team.figurePixels,
          pixelSize,
          poses: motion ? this.motion.poses : undefined,
          posed: motion ? this.motion.posed : undefined,
          time: cursorAt,
          farMode: FAR_MODE_ID[s.team.farMode],
          symbolThreshold: symbolThreshold(s.team.figurePixels, s.team.symbolPx),
          symbolPx: s.team.symbolPx,
          // Positions in double precision, written relative to the frame's
          // origin: see FrameParams.viewProjRel.
          exact: motion ? this.motion.exact : undefined,
          origin: this.originArr,
        });
        // What the events leave behind for a while, in the thrower's colour.
        const d = this.dataset;
        this.effects.build(d, cursorAt, s.team.session, units, (row) => {
          const p = d.personId ? d.personId[row] : 0;
          const team = d.personTeam ? d.personTeam[p] : 0;
          return teamMemberColor(team, d.personSlot ? d.personSlot[p] : p, d.teamSizes ? d.teamSizes[team] : 1);
        }, fr.tris);
        this.figureTris = { data: fr.tris.data, count: fr.tris.count };
        this.figureBatches = fr.batches.list;
        if (this.pickCubes) this.pickCubes.figureHit = (o, dir) => fr.hit(o, dir);
        cubes = fr.rest;
        cubeCount = fr.restCount;
      }
      // Weapons, shots, hits and kills, onto the figures' triangles (or their own without figures).
      if (s.team.weapons && this.dataset && !drawEverySample && liveCubes) {
        const d = this.dataset;
        const fr = this.figureReplay;
        const out = this.figureTris ? fr.tris : this.weaponTris;
        if (!this.figureTris) {
          this.weaponTris.reset();
          fr.kindsDrawn.length = liveCount;
          for (let i = 0; i < liveCount; i++) {
            const row = this.cursor.cubeRows[i];
            fr.kindsDrawn[i] = row < 0 ? '' : (fr.kindOf(d, row) ?? fr.specialOf(d, row));
          }
        }
        const inspector = this.inspector;
        const drawn = this.weapons.build(
          d,
          {
            t: cursorAt,
            session: s.team.session,
            eye,
            pixelSize,
            motion: motion ?? MotionModel.of(d),
            kindOfRow: (row) => fr.kindOf(d, row),
            colorOfPerson: (p) => this.cursor!.personColor(p),
            ground: (a, dir, len) => {
              if (!inspector.surfaceState.ready) return undefined;
              const hit = inspector.surfaceHit({ origin: { x: a[0], y: a[1], z: a[2] }, dir: { x: dir[0], y: dir[1], z: dir[2] } });
              if (!hit) return null;
              const along = (hit.x - a[0]) * dir[0] + (hit.y - a[1]) * dir[1] + (hit.z - a[2]) * dir[2];
              return along >= 0 && along <= len ? along : null;
            },
          },
          { cubes: liveCubes, stride: CUBE_STRIDE, count: liveCount, rows: this.cursor.cubeRows, kinds: fr.kindsDrawn },
          out,
        );
        if (this.figureTris) this.figureTris = { data: fr.tris.data, count: fr.tris.count };
        else if (drawn > 0) this.figureTris = { data: this.weaponTris.data, count: this.weaponTris.count };
      }
      // Fires burning on the units, onto the same triangles.
      if (s.team.fires && this.dataset && !drawEverySample && this.liveTracks.length) this.drawFires(this.dataset, null, cursorAt, eye, pixelSize);
      // The shots that struck the units, marked on them.
      if (s.team.hitMarks && this.dataset && !drawEverySample && this.liveTracks.length) this.drawHitMarks(this.dataset, null, cursorAt, eye, pixelSize);
      else this.hitMarkLayer.drawn.count = 0;
      if (s.team.trailSeconds > 0 && !drawEverySample) {
        // Along the same curves the boxes move on, where there is one; else sample to sample.
        const tr = motion && this.dataset ? this.smoothTrails(this.dataset, motion, cursorAt, s.team.trailSeconds, s.team.session) : this.cursor.buildTrails(cursorAt, s.team.trailSeconds, visible);
        trailVerts = tr.data;
        trailVertCount = tr.count;
      }
      // Drop lines, as Tacview draws them: from each live track straight down
      // to the data's floor, so a height reads in a 3D view.
      if (this.dataset && dropLinesOn(this.dataset, useReplayStore.getState().dropLines) && this.liveTracks.length) {
        const floor = this.dataset.bounds.minY;
        const n = this.liveTracks.length;
        const need = (trailVertCount + n * 2) * 7;
        if (this.dropBuf.length < need) this.dropBuf = new Float32Array(need * 2);
        if (trailVerts && trailVertCount) this.dropBuf.set(trailVerts.subarray(0, trailVertCount * 7));
        let o = trailVertCount * 7;
        const weaponMarks = s.team.weaponMarks;
        for (let i = 0; i < n; i++) {
          const tr = this.liveTracks[i];
          if (tr.y - floor < 1) continue;
          // None under decoys and shells; under weapons only when asked for.
          const dom = this.domainOfRow(tr.row);
          if (isEffectDomain(dom) || (isWeaponDomain(dom) && !weaponMarks)) continue;
          const c = i * CUBE_STRIDE;
          const col = this.pickCubes ? [this.pickCubes.data[c + 3], this.pickCubes.data[c + 4], this.pickCubes.data[c + 5]] : [0.8, 0.8, 0.8];
          for (const y of [tr.y, floor]) {
            this.dropBuf[o++] = tr.x;
            this.dropBuf[o++] = y;
            this.dropBuf[o++] = tr.z;
            this.dropBuf[o++] = col[0];
            this.dropBuf[o++] = col[1];
            this.dropBuf[o++] = col[2];
            this.dropBuf[o++] = y === floor ? 0.15 : 0.55;
          }
        }
        trailVerts = this.dropBuf;
        trailVertCount = o / 7;
      }
      // Tacview's display aids: velocity vectors, the path ahead, radar cones, locks, engagement domes.
      if (this.dataset && this.liveTracks.length) {
        const live = this.pickCubes;
        const aids = this.tactical.build(this.dataset, this.liveTracks, cursorAt, s.team.session, (i) => (live ? live.data.subarray(i * CUBE_STRIDE + 3, i * CUBE_STRIDE + 6) : [0.8, 0.8, 0.8]), trailVerts, trailVertCount);
        if (aids) {
          trailVerts = aids.data;
          trailVertCount = aids.count;
        }
      }
      // The tactical display's range rings and altitude ladders.
      const look = useReplayStore.getState().look;
      if (look.on && this.dataset && this.liveTracks.length && (look.rings || look.ladders)) {
        const lines = this.lookLines(this.dataset, look, trailVerts, trailVertCount);
        trailVerts = lines.data;
        trailVertCount = lines.count;
      }
    }

    let sceneTris: Float32Array | null = null;
    let sceneTriVertCount = 0;
    if (!raceBuilt && s.mode === 'team' && this.figureTris && this.figureTris.count > 0) {
      sceneTris = this.figureTris.data;
      sceneTriVertCount = this.figureTris.count;
    }
    if (raceBuilt) {
      plan = EMPTY_PLAN;
      submitted = 0;
      cubes = null;
      cubeCount = 0;
      trailVerts = raceBuilt.lines.data;
      trailVertCount = raceBuilt.lines.count;
      sceneTris = raceBuilt.tris.data;
      sceneTriVertCount = raceBuilt.tris.count;
      compositeOnly = !(raceChanged || geometryChanged || cameraMoved || compositeChanged);
    }

    // What a click on a data point is answered against: the rows this frame
    // draws, by the rules the shader applies to them.
    if (this.dataset && !raceTab && s.mode !== 'team') {
      const [rowLo, rowHi] = candidateRange(this.dataset, timeLo, timeHi);
      const sl = s.slice;
      this.drawn = {
        rowLo,
        rowHi,
        filters: activeFilters,
        teamSign,
        useSign: teamSign !== null || split.mode !== 0,
        splitMode: split.mode,
        splitColumn: split.column,
        splitSign: split.sign,
        splitPositive: split.positiveRange,
        splitNegative: split.negativeRange,
        lifetime: lifetimeParams ? { now: lifetimeParams.now, defaultLifetime: lifetimeParams.defaultLifetime } : null,
        cull:
          h.cullNear > 0 || h.cullFar > 0
            ? {
                near: Math.max(0, h.cullNear),
                far: Math.max(0, h.cullFar),
                planar: h.cullPlanar,
                eye: { x: this.camPos[0], y: this.camPos[1], z: this.camPos[2] },
                forward: { x: this.camFwd[0], y: this.camFwd[1], z: this.camFwd[2] },
              }
            : null,
        // A slice that clips the heat to nothing outside it hides those rows;
        // one that only dims them still draws them.
        slice:
          sl.enabled && sl.clipHeat && sl.outsideOpacity <= 0
            ? {
                axis: sl.axis === 'x' ? 0 : sl.axis === 'y' ? 1 : 2,
                min: sl.center - sl.thickness * 0.5,
                max: sl.center + sl.thickness * 0.5,
              }
            : null,
        groundY: h.groundProjected ? groundY : null,
      };
    } else {
      this.drawn = null;
    }
    if (raceTab || s.mode !== 'team') this.pickCubes = null;

    // The tactical display: the match replay only.
    const lookOn = !raceTab && s.mode === 'team' && !!this.dataset && useReplayStore.getState().look.on;
    const params: FrameParams = {
      viewProj: this.viewProjArr,
      viewProjRel: this.viewProjRelArr,
      origin: this.originArr,
      view: this.viewArr,
      proj: this.projArr,
      cameraPos: this.camPos,
      cameraForward: this.camFwd,
      perspective: s.camera.projection === 'perspective',
      width,
      height,
      heatScale: effectiveHeatScale,
      // The race tab draws no heat: box-replay mode is the one that skips it.
      mode: raceTab ? 'team' : heatMode,
      lineHeat: !raceTab && s.mode === 'heat-lines' && this.lines !== null,
      lineTrail,
      heat: {
        radius: h.radius,
        centerIntensity: h.centerIntensity,
        edgeIntensity: h.edgeIntensity,
        falloff: h.falloff,
        saturation,
        floor: Math.max(0, Math.min(1, h.floor)),
        minPixelRadius: h.minPixelRadius,
        maxPixelRadius: h.maxPixelRadius,
        zoomInvariant: h.zoomInvariant,
        groundProjected: h.groundProjected,
        groundY,
        signed: heatMode === 'heat-difference',
        teamColors: heatMode === 'heat-teams' && (this.dataset?.teamLabels.length ?? 0) > 0,
        // Every group, including the hidden ones. See HeatUniforms.teamCount.
        teamCount: Math.max(1, this.dataset?.teamLabels.length ?? 1),
        teamNeutral: this.teamPalette.neutral,
        teamSlices: this.teamPalette.slices,
        teamBoost: Math.max(0, h.teamBoost),
        smoothRamp: h.smoothRamp,
        useCurve: h.useCurve,
        response: HEAT_RESPONSE_CODE[h.response] ?? 0,
        cullNear: Math.max(0, h.cullNear),
        cullFar: Math.max(0, h.cullFar),
        cullPlanar: h.cullPlanar,
        cullGeometry: h.cullGeometry,
        // Meaningless with the data flattened onto one plane: every point would
        // then sit exactly on the ground it is being tested against.
        occlusion: h.groundProjected ? 0 : occlusionStrength(h.occlusion),
        occlusionFloor: h.groundProjected ? 0 : occlusionFloor(h.occlusion),
        occludedExtra: OCCLUDED_EXTRA_WALL,
        // Flattening puts every point on the plane it would be tested against,
        // so there is nothing behind the ground any more. A level with no
        // geometry has no ground either.
        hideBehindGround:
          h.hideBehindGround && !h.groundProjected && Boolean(s.level),
      },
      plan,
      candidateRows,
      submittedSprites: submitted,
      sampleWeight,
      accumMode,
      compositeOnly,
      blendAlpha,
      heatGain: this.frameGain,
      accumFrames: this.accumFrames,
      timeLo,
      timeHi,
      lifetime: lifetimeParams,
      teamSign,
      // A column split supplies the sign itself, so it does not need a group
      // column to exist — which is the point: comparing two files works on data
      // with no teams at all, where it is this split that makes the mode
      // available (`splitHasTwoSides`).
      useTeamSign: teamSign !== null || split.mode !== 0,
      splitMode: split.mode,
      splitColumn: split.column,
      splitSign: split.sign,
      splitPositive: split.positiveRange,
      splitNegative: split.negativeRange,
      splitScale,
      filters: activeFilters,
      cubes,
      cubeCount,
      cubeSize: s.team.cubeSize,
      showLookDirection: s.team.showLookDirection,
      lookLength: s.team.lookLength,
      colorLut: this.lut,
      colorLutDirty: lutDirty,
      curveLut: this.curveLut,
      curveLutDirty: curveDirty,
      // Not over a world backdrop: the grid and the axes lie at height 0, which
      // is sea level there, and drawn on the sea they fight it for depth far
      // off and show as dashed lines across the water.
      // The tactical display draws its own grid on the ground; the line grid would only glow as stripes under it.
      showGrid: !lookOn && s.showGrid && (vehicleTab || !onEarth(s.level)),
      showAxes: !lookOn && s.showAxes && !vehicleTab && !onEarth(s.level),
      gridSpacing,
      gridExtent,
      trailVerts,
      trailVertCount,
      sceneTris,
      sceneTriVertCount,
      figureBatches: !raceBuilt && s.mode === 'team' ? this.figureBatches : null,
      gpuTracks: !raceBuilt && s.mode === 'team' ? this.gpuTracksParams : null,
      symbols: !raceBuilt && s.mode === 'team' && s.team.figures ? this.symbolParams(s) : null,
      overlayVerts,
      overlayVertCount,
      level: vehicleTab ? null : lookOn ? tacticalLevel(buildLevelDraw(s.level)) : buildLevelDraw(s.level),
      post: lookOn ? this.lookPost(s) : null,
      // Auto-focus uses whatever the view was last framed on, which is the only
      // distance the camera can honestly claim to be looking at.
      dof:
        s.camera.dof.enabled && s.camera.dof.maxBlur > 0
          ? {
              focus: s.camera.dof.autoFocus
                ? this.camera.focusDistance
                : Math.max(1e-3, s.camera.dof.focusDistance),
              aperture: Math.max(0.01, s.camera.dof.aperture),
              maxBlur: s.camera.dof.maxBlur,
            }
          : null,
      near: this.viewNear,
      far: this.viewFar,
      slice: s.slice.enabled
        ? {
            axis: s.slice.axis === 'x' ? 0 : s.slice.axis === 'y' ? 1 : 2,
            min: s.slice.center - s.slice.thickness * 0.5,
            max: s.slice.center + s.slice.thickness * 0.5,
            outside: Math.max(0, Math.min(1, s.slice.outsideOpacity)),
            clipHeat: s.slice.clipHeat,
          }
        : null,
      volumes: volumeDraw,
    };

    renderer.render(params);
    this.frameIndex++;
    // A getter on the renderer; the atlas and the tiles' edges arrive between
    // uploads, so it is read every frame rather than at them.
    this.live.levelBytes = renderer.levelBytes;
    this.lastFrameDrew = !compositeOnly && plan.length > 0;
    this.live.frames = this.frameIndex;

    // Auto-expose once the field has had a few frames to build. Counted in
    // rendered frames rather than on a timer so it cannot fire against an empty
    // buffer on a slow machine — and counted on *every* frame, because a dataset
    // small enough to draw in one pass converges immediately and would otherwise
    // never reach the threshold at all.
    // Not while the dataset is still arriving: a field of part of it would be
    // exposed too bright for the whole.
    const dataPending = (renderer as { dataPending?: boolean }).dataPending ?? false;
    if (this.autoExposePending > 0 && this.dataset && !dataPending) {
      this.autoExposePending--;
      if (this.autoExposePending === 0) void this.autoExpose();
    }
    // Following the view: meter again once the camera has come to rest, and
    // glide to the result. Heat modes only - the box replay has no field.
    const follow = !raceTab && s.mode !== 'team' && !!this.dataset && h.followExposure;
    const due = this.follower.frame(cameraMoved, follow);
    if (due !== null && !this.followMetering && this.autoExposePending === 0) void this.followExposure(due);
    // What the split drew, for the panel: the rows on each side, and chunks left
    // out because the split's column could not be put on the GPU for them.
    if (heatMode === 'heat-difference' && !raceTab && s.mode !== 'team') {
      // Read only after a frame that splatted: a composite-only frame leaves
      // the renderer's count from the last splat and draws no chunks itself.
      if (!compositeOnly) {
        this.splitChunks = {
          skipped: split.mode !== 0 && !split.problem ? (renderer.splitSkippedChunks ?? 0) : 0,
          total: plan.length,
        };
      }
      publishSplitStatus({
        positive: this.sideCounts.positive,
        negative: this.sideCounts.negative,
        exact: this.sideCounts.exact,
        skippedChunks: this.splitChunks.skipped,
        chunks: this.splitChunks.total,
      });
    }
    // An idle frame did not rebuild the cubes, so report the count still on
    // screen rather than the 0 it computed.
    if (!compositeOnly) this.lastCubeCount = cubeCount;

    this.probeCursor(now);
    this.publish(
      now,
      dtRaw,
      plannedSubmitted,
      candidateRows,
      convergeFrames,
      converged,
      compositeOnly ? this.lastCubeCount : cubeCount,
      splatBudget,
    );
  }

  // ------------------------------------------------------------------ race

  /** Run the replay clock: forward while playing, looping or stopping at the end. */
  private advanceRace(race: RaceState, dt: number): void {
    if (!race.replay.playing) return;
    const end = replayLength(race);
    let t = raceClock.time + dt * race.replay.speed;
    if (t > end) {
      if (race.replay.loop) t = 0;
      else {
        t = end;
        race.patchReplay({ playing: false });
      }
    }
    raceClock.set(t);
  }

  /**
   * Chase the followed car: behind it and above, looking along its heading.
   * Eased, so the camera does not shake with every wobble of the heading.
   */
  private follow(race: RaceState, cars: Map<string, { x: number; y: number; z: number; course: number }>, dt: number): void {
    if (!race.follow) {
      this.chase = null;
      return;
    }
    const car = cars.get(race.follow);
    if (!car) return;
    const back = 2.5 + race.view.carScale * 4;
    const up = 0.9 + race.view.carScale * 1.1;
    // The car as the camera sees it, through the axis mirror.
    const [mx, my, mz] = this.mirror;
    const course = Math.atan2(Math.sin(car.course) * mx, Math.cos(car.course) * mz);
    // The camera looks along -Z at yaw 0: forward = (-sin yaw, -cos yaw).
    const yaw = Math.atan2(-Math.sin(course), -Math.cos(course));
    const target = {
      x: car.x * mx - Math.sin(course) * back,
      y: car.y * my + up,
      z: car.z * mz - Math.cos(course) * back,
      yaw,
    };
    const c = this.chase ?? target;
    const k = 1 - Math.exp(-dt / RACE_CHASE_SECONDS);
    let dyaw = target.yaw - c.yaw;
    while (dyaw > Math.PI) dyaw -= 2 * Math.PI;
    while (dyaw < -Math.PI) dyaw += 2 * Math.PI;
    this.chase = {
      x: c.x + (target.x - c.x) * k,
      y: c.y + (target.y - c.y) * k,
      z: c.z + (target.z - c.z) * k,
      yaw: c.yaw + dyaw * k,
    };
    this.camera.position.set(this.chase.x, this.chase.y, this.chase.z);
    this.camera.yaw = this.chase.yaw;
    this.camera.pitch = -Math.atan2(up, back) * 0.8;
    this.camera.moved = true;
  }

  /**
   * The match replay's follow camera: an orbit around the followed unit that
   * goes where it goes. Dragging turns the view around it, the wheel and W/S
   * move in and out (`followDistance`), A/D and Q/E orbit. In chase mode the
   * orbit turns with the unit's heading - behind it stays behind it - and in
   * orbit mode it keeps its own direction, as Tacview's two external views.
   *
   * The camera's own yaw and pitch are the orbit angles: what the user turned
   * since the last frame is read off them, and the keyboard's flying off the
   * position it moved to. The unit is taken where it is at this frame's
   * playhead (`followedNow`), on the same curve its figure is drawn from, so it
   * holds still in the view; only the chase heading is eased, over time.
   */
  private sidesKey = '';
  private readonly sides = new Float32Array(64);

  /** The far-off glyphs' settings this frame, and the CPU path's glyphs (`symbols/`). */
  private symbolParams(s: ReturnType<typeof snapshot>): SymbolParams {
    const t = s.team;
    const labels = this.dataset?.teamLabels ?? [];
    const key = `${t.symbolStyle}|${t.mySide}|${t.symbolOthers}|${labels.join('\u0001')}`;
    if (key !== this.sidesKey) {
      sideTable(t.symbolStyle, { mySide: t.mySide, teams: labels.length, others: t.symbolOthers, labels }, this.sides);
      this.sidesKey = key;
    }
    return { style: SYMBOL_STYLE_ID[t.symbolStyle], mode: FAR_MODE_ID[t.farMode], ticks: t.symbolTicks, sides: this.sides, cpu: this.gpuTracksParams ? null : this.figureReplay.glyphs };
  }

  /** A row's far-off domain (`figures/symbolClass.ts`); -1 without a row. */
  private domainOfRow(row: number): number {
    const d = this.dataset;
    if (!d || row < 0) return -1;
    return (this.figureReplay.wordOf(d, row, this.figureReplay.kindOf(d, row)) >>> 16) & 15;
  }

  /** Where the followed unit is in the view's (mirrored) space; null when nothing is followed or it is not live. */
  private followedPoint(s: ReturnType<typeof snapshot>): [number, number, number] | null {
    const follow = useReplayStore.getState().follow;
    if (follow === null || s.mode !== 'team') return null;
    const t = this.liveTracks.find((x) => x.person === follow);
    if (!t) return null;
    const [mx, my, mz] = this.mirror;
    return [t.x * mx, t.y * my, t.z * mz];
  }

  /**
   * The followed unit where it is at this frame's playhead, on the curve the
   * figures are drawn from - the GPU tracks' own evaluation, or the motion model -
   * rather than where the last frame's tracks had it. Following last frame's
   * position put the camera a frame's travel behind the figure, a lag that
   * changed with every frame's length and shook the unit on screen. Its attitude
   * is the last frame's: it turns slowly enough that a frame does not show.
   */
  private followedNow(person: number, s: ReturnType<typeof snapshot>): (typeof this.liveTracks)[number] | undefined {
    const last = this.liveTracks.find((x) => x.person === person);
    const d = this.dataset;
    if (!d) return last;
    const store = this.lastGpuStore;
    if (store && this.gpuTracksParams) {
      const i = store.trackOf[person] ?? -1;
      const pose = this.gpuPose;
      if (i < 0 || !evaluateTrack(store, i, this.playhead, s.timeline.defaultLifetime, pose)) return last;
      const f = pose.f;
      return { person, row: last?.row ?? -1, x: pose.x, y: pose.y, z: pose.z, yaw: Math.atan2(f[0], -f[2]), pitch: Math.asin(Math.max(-1, Math.min(1, f[1]))), q: null };
    }
    const m = s.team.interpolate && last ? MotionModel.of(d) : null;
    if (!m || !last || !m.at(person, this.playhead, s.team.session, this.followSample)) return last;
    const p = this.followSample;
    return { ...last, x: p.x, y: p.y, z: p.z };
  }

  private followTrack(s: ReturnType<typeof snapshot>, dt: number): void {
    const r = useReplayStore.getState();
    const follow = r.follow;
    const c = this.camera;
    const rigMode = r.followMode !== 'chase' && r.followMode !== 'orbit' ? (r.followMode as RigMode) : null;
    this.rigNear = 0;
    // Only the cockpit and fixed views roll the camera; let go, it is level again.
    if ((follow === null || s.mode !== 'team' || !rigMode) && c.roll !== 0) {
      c.roll = 0;
      c.moved = true;
    }
    if (follow === null || s.mode !== 'team') {
      this.followCam = null;
      this.followRig.release();
      return;
    }
    const t = this.followedNow(follow, s);
    if (!t) return;
    const units = this.dataset ? unitsPerMetre(this.dataset) : 1;
    const [mx, my, mz] = this.mirror;
    if (rigMode) {
      this.followCam = null;
      const ax = axesOfTrack(t);
      const m = (v: [number, number, number]): [number, number, number] => [v[0] * mx, v[1] * my, v[2] * mz];
      const tt = r.targetPerson !== null ? this.liveTracks.find((x) => x.person === r.targetPerson && x.person !== follow) : undefined;
      // The eye a little ahead of the unit's middle and above it, as far as its figure is drawn bigger.
      const size = this.figureScaleAt(follow) * units;
      const zoom = this.followRig.update(c, {
        mode: rigMode,
        person: follow,
        pos: [t.x * mx, t.y * my, t.z * mz],
        fwd: m(ax.fwd),
        up: m(ax.up),
        target: tt ? [tt.x * mx, tt.y * my, tt.z * mz] : null,
        distance: Math.max(1, r.followDistance) * units,
        units,
        eyeAhead: 0,
        eyeUp: 0.5 * size,
        reset: r.viewReset,
      });
      if (rigMode === 'cockpit' || rigMode === 'padlock') this.rigNear = cockpitClip(this.dataset, follow) * size;
      if (zoom !== 1) r.setFollowDistance(r.followDistance * zoom);
      return;
    }
    this.followRig.release();
    const target = { x: t.x * mx, y: t.y * my, z: t.z * mz };
    // The unit's heading as a camera yaw: box yaw is a compass heading, forward (sin, 0, -cos) in the world.
    const headYaw = Math.atan2(-Math.sin(t.yaw) * mx, Math.cos(t.yaw) * mz);
    const wrap = (a: number) => {
      while (a > Math.PI) a -= 2 * Math.PI;
      while (a < -Math.PI) a += 2 * Math.PI;
      return a;
    };
    let f = this.followCam;
    if (!f) {
      // Starting: behind and a little above in chase, from where the camera already looks in orbit.
      const rel = r.followMode === 'chase' ? 0 : wrap(c.yaw - headYaw);
      f = { person: follow, fx: target.x, fy: target.y, fz: target.z, head: headYaw, rel, yaw: headYaw + rel, pitch: -0.3, px: c.position.x, py: c.position.y, pz: c.position.z };
      // Nothing turned yet.
      c.yaw = f.yaw;
      c.pitch = f.pitch;
    }
    // What the user did since the last frame: turned the camera (a drag, the pad) ...
    const dyaw = wrap(c.yaw - f.yaw);
    let pitch = c.pitch;
    // ... or flew it with the keyboard: forward and back zoom, sideways and up and down orbit.
    const mvx = c.position.x - f.px;
    const mvy = c.position.y - f.py;
    const mvz = c.position.z - f.pz;
    let rel = f.rel + dyaw;
    let distance = r.followDistance;
    if (Math.hypot(mvx, mvy, mvz) > 1e-9) {
      const cp = Math.cos(f.pitch);
      const fwd = [-Math.sin(f.yaw) * cp, Math.sin(f.pitch), -Math.cos(f.yaw) * cp];
      const along = mvx * fwd[0] + mvy * fwd[1] + mvz * fwd[2];
      const side = mvx * Math.cos(f.yaw) - mvz * Math.sin(f.yaw);
      const rise = mvy - along * fwd[1];
      const m = Math.hypot(mvx, mvy, mvz);
      if (Math.abs(along) > m * 0.3) distance *= along > 0 ? 0.975 : 1 / 0.975;
      if (Math.abs(side) > m * 0.3) rel -= Math.sign(side) * 0.025;
      if (Math.abs(rise) > m * 0.3) pitch -= Math.sign(rise) * 0.02;
      if (distance !== r.followDistance) r.setFollowDistance(distance);
    }
    pitch = Math.max(-1.45, Math.min(1.2, pitch));
    // A new life of the unit somewhere else: no glide across the map to it.
    const jump = f.person !== follow;
    // On the unit itself, which is on its curve at this frame's playhead
    // (`followedNow`): any easing of the position leaves it a speed-dependent
    // distance off the middle of the view. The heading still swings round
    // gently, over a time constant rather than a share of each frame, so how
    // far it swings does not depend on how fast frames come; it turns the
    // view about the unit and never moves it on screen.
    const fx = target.x;
    const fy = target.y;
    const fz = target.z;
    const head = jump ? headYaw : f.head + wrap(headYaw - f.head) * (1 - Math.exp(-dt / CHASE_HEADING_SECONDS));
    const chase = r.followMode === 'chase';
    const yaw = chase ? head + rel : c.yaw;
    if (!chase) rel = wrap(yaw - head);
    const back = Math.max(1, r.followDistance) * units;
    const cp = Math.cos(pitch);
    const px = fx + Math.sin(yaw) * cp * back;
    const py = fy - Math.sin(pitch) * back;
    const pz = fz + Math.cos(yaw) * cp * back;
    c.position.set(px, py, pz);
    c.yaw = yaw;
    c.pitch = pitch;
    c.moved = true;
    this.followCam = { person: follow, fx, fy, fz, head, rel, yaw, pitch, px, py, pz };
  }

  /** The scene's scale for the tactical display: the level's bounds where it has a model, else the data's. */
  private lookScene(s: ReturnType<typeof snapshot>): { extent: number; heightRange: number; floor: number; unitsPerMetre: number } {
    const b = s.level?.kind === 'model' ? s.level.bounds : (this.dataset?.bounds ?? null);
    const upm = this.dataset ? unitsPerMetre(this.dataset) : 1;
    if (!b) return { extent: 1000 * upm, heightRange: 100 * upm, floor: 0, unitsPerMetre: upm };
    return { extent: Math.max(b.maxX - b.minX, b.maxZ - b.minZ), heightRange: b.maxY - b.minY, floor: b.minY, unitsPerMetre: upm };
  }

  private lookPost(s: ReturnType<typeof snapshot>): PostDraw {
    const now = performance.now();
    return postDrawFor(useReplayStore.getState().look, this.lookScene(s), now / 1000, 1 - (now - this.lookCutAt) / 450);
  }

  private lookLines(d: Dataset, look: TacticalLook, base: Float32Array | null, baseCount: number): { data: Float32Array; count: number } {
    if (this.airOf?.d !== d) {
      const index = unitsOf(d);
      const air = new Uint8Array(index.personUnit.length);
      for (let p = 0; p < air.length; p++) {
        const u = index.units[index.personUnit[p]];
        air[p] = u && unitCategory(d, u) === 'air' ? 1 : 0;
      }
      this.airOf = { d, air };
    }
    const air = this.airOf.air;
    const cam = this.camera.position;
    const [mx, my, mz] = this.mirror;
    const cubes = this.pickCubes;
    const follow = useReplayStore.getState().follow;
    const tracks: LookTrack[] = [];
    let followed: LookTrack | null = null;
    this.liveTracks.forEach((t, i) => {
      const c = i * CUBE_STRIDE;
      const tr: LookTrack = {
        x: t.x,
        y: t.y,
        z: t.z,
        colour: cubes ? cubes.data.subarray(c + 3, c + 6) : [0.8, 0.8, 0.8],
        air: air[t.person] === 1,
        near: (t.x * mx - cam.x) ** 2 + (t.y * my - cam.y) ** 2 + (t.z * mz - cam.z) ** 2,
      };
      tracks.push(tr);
      if (t.person === follow) followed = tr;
    });
    const sc = this.lookScene(snapshot());
    // Without a model level the data's floor; a level's lowest point otherwise.
    const floor = this.dataset ? this.dataset.bounds.minY : sc.floor;
    return tacticalLines(tracks, followed, { floor, extent: sc.extent, unitsPerMetre: sc.unitsPerMetre, rings: look.rings, ladders: look.ladders, quality: look.quality, tint: LOOK_TINT[look.colour] }, base, baseCount, this.lookBuf);
  }

  /** Put the camera at a point of the data looking at another: the director's flyby, which holds the camera still while the unit passes. */
  placeCamera(from: { x: number; y: number; z: number }, at: { x: number; y: number; z: number }): void {
    const [mx, my, mz] = this.mirror;
    const c = this.camera;
    const px = from.x * mx, py = from.y * my, pz = from.z * mz;
    const dx = at.x * mx - px, dy = at.y * my - py, dz = at.z * mz - pz;
    const len = Math.hypot(dx, dy, dz);
    if (len < 1e-9) return;
    c.position.set(px, py, pz);
    // Forward is (-sin yaw cos pitch, sin pitch, -cos yaw cos pitch), as the follow camera has it.
    c.yaw = Math.atan2(-dx, -dz);
    c.pitch = Math.asin(Math.max(-1, Math.min(1, dy / len)));
    c.moved = true;
  }

  /** Bring a spot of the track into view: a ball of `radius` around it, keeping the view direction. */
  frameAround(x: number, y: number, z: number, radius: number): void {
    const b = { minX: x - radius, minY: y - radius, minZ: z - radius, maxX: x + radius, maxY: y + radius, maxZ: z + radius };
    this.camera.frame(this.toDisplay(b), snapshot().camera.fov, true);
  }

  /** Where a world point lands on the canvas, in CSS pixels; null behind the camera. */
  project(x: number, y: number, z: number): { x: number; y: number } | null {
    const e = this.viewProj.elements;
    const cx = e[0] * x + e[4] * y + e[8] * z + e[12];
    const cy = e[1] * x + e[5] * y + e[9] * z + e[13];
    const w = e[3] * x + e[7] * y + e[11] * z + e[15];
    if (w <= 1e-6) return null;
    return {
      x: (cx / w * 0.5 + 0.5) * this.canvas.clientWidth,
      y: (1 - (cy / w * 0.5 + 0.5)) * this.canvas.clientHeight,
    };
  }

  // ------------------------------------------------------------------ helpers

  private publish(
    now: number,
    dtRaw: number,
    splats: number,
    candidates: number,
    convergeFrames: number,
    converged: boolean,
    cubes: number,
    budget: number,
  ): void {
    this.fpsAccum += dtRaw;
    this.fpsFrames++;
    const live = this.live;
    live.playhead = this.playhead;
    live.frameMs = this.smoothedFrameMs;
    live.splats = splats;
    live.candidates = candidates;
    live.accumFrames = this.accumFrames;
    live.convergeFrames = convergeFrames;
    live.converged = converged;
    live.cubes = cubes;
    live.budget = Math.round(budget);
    if (this.fpsAccum >= 0.4) {
      live.fps = this.fpsFrames / this.fpsAccum;
      this.fpsAccum = 0;
      this.fpsFrames = 0;
    }
    // The store only needs these for panels that re-render rarely.
    if (now - this.lastPublish > 500) {
      this.lastPublish = now;
      useStore.getState().reportStats({
        fps: live.fps,
        frameMs: live.frameMs,
        splatsSubmitted: live.splats,
        candidateRows: live.candidates,
        accumFrames: live.accumFrames,
        // Republished rather than set once at init, so the store reflects the
        // live backend even if something raced the initial report.
        backend: live.backend,
      });
    }
  }

  private resizeCanvas(): { width: number; height: number } {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(this.canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(this.canvas.clientHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    return { width: w, height: h };
  }

  private personVisibility(
    visibility: Record<number, boolean>,
    filters: FilterSpec[],
  ): (person: number) => boolean {
    const ds = this.dataset;
    const personTeam = ds?.personTeam ?? null;
    const personFilter = filters.find((f) => f.kind === 'persons');
    const allowedPersons =
      personFilter && personFilter.kind === 'persons' ? new Set(personFilter.allowed) : null;
    const teamFilter = filters.find((f) => f.kind === 'teams');
    const allowedTeams =
      teamFilter && teamFilter.kind === 'teams' ? new Set(teamFilter.allowed) : null;

    return (p: number) => {
      if (allowedPersons && !allowedPersons.has(p)) return false;
      if (!personTeam) return true;
      const t = personTeam[p];
      if (visibility[t] === false) return false;
      if (allowedTeams && !allowedTeams.has(t)) return false;
      return true;
    };
  }
}

/**
 * Per-frame appearance for the background, resolved from the level.
 *
 * The image footprint is recomputed each frame rather than cached, because the
 * anchors are live controls — dragging them has to move the map immediately.
 */
function buildLevelDraw(level: Level | null): LevelDraw | null {
  if (!level) return null;
  const noStructure = {
    faceOpacity: 0,
    wireOpacity: 0,
    tint: [1, 1, 1] as [number, number, number],
    showFaces: false,
    showWire: false,
    flat: false,
    textured: false,
  };
  const flat = {
    slope: 0,
    contourSpacing: 0,
    contourStrength: 0,
    contourIndexEvery: 0,
    elevationRange: 0,
    lowY: 0,
    highY: 1,
  };
  if (level.kind === 'image') {
    const q = mapQuadFromAnchors(level);
    // Degenerate anchors would place the quad at NaN and lose the whole frame.
    if (q.degenerate) return null;
    return {
      kind: 'image',
      rect: [q.minX, q.minZ, q.maxX, q.maxZ],
      y: q.y,
      flipV: level.flipZ,
      opacity: level.opacity,
      desaturate: level.desaturate,
      brightness: level.brightness,
      wireframe: false,
      vertexColours: false,
      texture: false,
      groundWireOpacity: 0,
      groundWireFade: [1e9, 1e9 + 1],
      relief: flat,
      water: { opacity: 0, tint: [1, 1, 1], show: false },
      structure: noStructure,
      tiles: { colours: false, texture: false, water: false, faces: false, wire: false },
    };
  }
  const groundExtent = Math.max(
    level.bounds.maxX - level.bounds.minX,
    level.bounds.maxZ - level.bounds.minZ,
  );
  return {
    kind: 'model',
    rect: [0, 0, 0, 0],
    y: 0,
    flipV: false,
    opacity: level.opacity,
    desaturate: level.desaturate,
    brightness: level.brightness,
    wireframe: level.wireframe,
    vertexColours: level.showColours === true && !!level.colours,
    texture: level.showTexture !== false && !!level.uvs && !!level.atlas,
    groundWireOpacity: level.groundWireOpacity ?? 0,
    // Out to a quarter of the level's width, which on a 4km map is about
    // 1,000m — past the point where a 3m terrain cell still covers more than a
    // couple of pixels.
    groundWireFade: [groundExtent * 0.06, groundExtent * 0.25],
    relief: reliefDraw(level),
    water: waterDraw(level),
    structure: structureDraw(level),
    // The same switches with the same defaults, unresolved: a tile brings its
    // own colours, imagery, water and buildings whatever this level holds.
    tiles: {
      colours: level.showColours === true,
      texture: level.showTexture !== false,
      water: level.showWater ?? true,
      faces: level.showStructureFaces ?? true,
      wire: level.showStructureWire ?? true,
    },
  };
}

/**
 * Occluded heat is never *gone*, only dim — except at the very top of the slider.
 *
 * Two failures, in opposite directions, and the second was caused by fixing the
 * first.
 *
 * Linear was unusable. The shader multiplies an occluded point's contribution by
 * `1 - strength`, so a slider at 0.8 left a fifth of it, and a fifth of a
 * saturated field is still saturated — measured on the probe, the linear slider
 * removed 7% of the heat behind a wall at 0.5 and 19% at 0.8. A control whose
 * only useful position is the far end reads as broken.
 *
 * So it was curved to a fourth power, and 0.8 then removed everything. Which is
 * also wrong, and worse: a heatmap of a building is *mostly* behind something,
 * and hiding it completely means the map shows an empty room where the data says
 * people walked. You cannot even tell there is something to look at, so you have
 * no reason to reach for the slice tool that would show you.
 *
 * Hence a floor. Occluded heat keeps a small fraction of its brightness, enough
 * to read as "something is in there" and far too little to be mistaken for what
 * is in front of it. Only a slider pinned at exactly 1.0 removes it outright,
 * because that is an explicit request rather than a default.
 */
const MIN_OCCLUDED_VISIBILITY = 0.006;

/**
 * Dimming applied per surface *beyond* the first.
 *
 * Half. Gentler than the first surface on purpose: the slider is calibrated so
 * one wall leaves a few per cent, and a few per cent compounded is nothing by
 * the third wall — every interior would sit on the floor and the wall count
 * would stop meaning anything. Halving keeps four steps that are all visible and
 * all distinguishable.
 */
const OCCLUDED_EXTRA_WALL = 0.5;

/**
 * The slider, curved, as the fraction of brightness the *first* surface removes.
 *
 * Squared rather than to the fourth power. At the fourth power the default 0.8
 * left 0.16% — indistinguishable from erased, which is the failure the floor
 * exists to prevent, and it left no headroom at all for extra surfaces to dim
 * into. Squared, 0.8 leaves 4% and 0.5 leaves 25%, and the range above 0.9 is
 * there for anyone who wants a wall to be nearly opaque.
 */
function occlusionStrength(slider: number): number {
  const s = Math.max(0, Math.min(1, slider));
  if (s >= 1) return 1;
  return 1 - (1 - s) ** 2;
}

/**
 * The visibility an occluded point keeps however many walls are in front of it.
 *
 * Applied to the compounded result rather than to the per-wall factor, because
 * flooring the factor and then raising it to the power of the wall count is not
 * a floor: three walls at 0.06 each come to 0.0002, which is erased. Zero only
 * at a slider pinned to 1.0, which is an explicit request to hide.
 */
function occlusionFloor(slider: number): number {
  return slider >= 1 ? 0 : MIN_OCCLUDED_VISIBILITY;
}

/** Round the grid step to a 1/2/5 x 10^n value covering the data sensibly. */
function niceGridSpacing(bounds: {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}): number {
  const span = Math.max(bounds.maxX - bounds.minX, bounds.maxZ - bounds.minZ);
  if (!Number.isFinite(span) || span <= 0) return 10;
  const target = span / 40;
  const mag = Math.pow(10, Math.floor(Math.log10(target)));
  const norm = target / mag;
  const step = norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10;
  return step * mag;
}

export { CUBE_STRIDE };

/** Whether the level is a world backdrop: a model level placed on the earth. */
function onEarth(level: Level | null): boolean {
  return level?.kind === 'model' && !!level.placement;
}
