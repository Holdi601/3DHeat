import { create } from 'zustand';
import { calibrate, cameraForExtent } from '../data/calibrate';
import { clampBudgets, detectBudgets, type Budgets } from '../data/memory';
import { sayDataset, speakWith } from '../data/msg';
import { int, lang, num, onLanguageChange, t } from '../i18n';
import { datasetCapabilities, defaultColumnSplit, splitHasTwoSides } from '../data/validate';
import { suggestLineSettings, suggestMaxJump, type LineSettings } from '../data/lines';
import { DEFAULT_CURVE, normaliseCurve, type CurvePoint } from './curve';
import type { Projection } from '../render/camera';
import type { Keyframe, PathEasing } from '../render/campath';
import { DEFAULT_GAMEPAD, type GamepadSettings } from '../render/gamepad';
import type { ImageLevel, Level, ModelLevel } from '../render/level';
import {
  DEFAULT_NEGATIVE_RAMP,
  DEFAULT_POSITIVE_RAMP,
  type ColorStop,
  type Dataset,
  type FilterSpec,
  type HeatColorScheme,
  type SplitRule,
  type ViewMode,
} from './types';
import { savedSpeed } from './playbackSpeed';
import type { FarMode } from '../render/symbols/lod';
import type { SymbolStyle } from '../render/symbols/affiliation';

/**
 * Heat appearance. Every field here maps to a shader uniform and can change
 * per-frame with no buffer rebuild, so dragging these sliders is free.
 */
export interface HeatSettings {
  /** Sprite radius in world units. */
  radius: number;
  /** Heat contributed at the exact centre of a sprite. */
  centerIntensity: number;
  /** Heat contributed at the sprite's outer edge. */
  edgeIntensity: number;
  /** Shapes the centre->edge ramp. 1 = linear, >1 = tighter hotspot. */
  falloff: number;
  /** Accumulated heat that maps to the top of the colour ramp. */
  saturation: number;
  /**
   * Ramp position given to *any* pixel carrying heat at all, 0..1.
   *
   * Raise it and a single datapoint becomes clearly visible instead of sitting
   * just above transparent — which is what you want when the question is "where
   * did this ever happen" rather than "where was it densest". Pair it with a
   * smaller radius so single points read as points.
   *
   * Applied at composite, so it costs nothing and never restarts convergence.
   */
  floor: number;
  /** Clamp sprites to a minimum pixel radius so far-away data stays visible. */
  minPixelRadius: number;
  /** Clamp sprites to a maximum pixel radius; the main defence against overdraw. */
  maxPixelRadius: number;
  /**
   * Colour means density per area of the world, the same at any zoom.
   *
   * A sprite the pixel clamps resize keeps the heat its true size would add (see
   * `HeatUniforms.zoomInvariant`). Without it a far view of sprites clamped up to
   * a pixel reads many times hotter than the same ground seen close, so a picture
   * exposed from far away fades as you fly into it.
   */
  zoomInvariant: boolean;
  /**
   * Re-meter the exposure for whatever is on screen each time the camera comes
   * to rest, gliding to it and ignoring small changes. Off is the lock: the
   * scale then stays put, so two places can be compared on one scale. Dragging
   * the saturation slider turns it off.
   */
  followExposure: boolean;
  /**
   * Difference mode: weight each side by the inverse of its own row count, so
   * the picture compares where each side is proportionally more common rather
   * than which side simply has more rows. See `sideScales`.
   */
  splitShares: boolean;
  /** Ignore Z and flatten all heat onto the ground plane. */
  groundProjected: boolean;
  /** S-curve the per-sprite ramp instead of using the raw falloff. */
  smoothRamp: boolean;
  /**
   * Use `curve` for the sprite ramp instead of falloff + smoothing.
   *
   * Kept as a switch rather than replacing the sliders: a slider is the faster
   * way to get a reasonable sprite, and the curve is for when a reasonable one
   * is not what the data needs.
   */
  useCurve: boolean;
  /** Editable ramp shape, centre (x=0) to rim (x=1). */
  curve: CurvePoint[];
  /** How accumulated density maps onto the colour ramp. */
  response: HeatResponse;
  /** Skip rows closer to the camera than this, in world units. 0 = no limit. */
  cullNear: number;
  /** Skip rows further from the camera than this. 0 = no limit. */
  cullFar: number;
  /**
   * Cut at a plane across the view instead of a sphere around the eye.
   *
   * The near and far bounds are the same numbers either way; this decides what
   * they are measured along. A sphere's edge curves away across the frame and
   * slides as the camera turns; a plane stays parallel to the screen and stays
   * put, which is what makes it usable as a "show me only this far" control
   * rather than a static filter.
   */
  cullPlanar: boolean;
  /**
   * Cut the level at the near and far bounds too, not only the heat.
   *
   * On, because a cut that removes the datapoints and leaves the building in
   * front of them hides the thing the cut was for. Off is still useful — reading
   * density through a level you can see is what the bounds did until now — so it
   * is a switch rather than a rewrite.
   */
  cullGeometry: boolean;
  /**
   * How much a datapoint behind level geometry is suppressed. 0 = show through
   * walls, 1 = drop it entirely.
   *
   * Without this the heat is a flat overlay: everything the dataset contains
   * glows through every building at full strength, the depth cues the level
   * provides are cancelled out, and a hotspot inside a warehouse is
   * indistinguishable from one on the roof. Suppressing occluded points restores
   * the ordering — the building in front stays in front.
   *
   * Not a hard cull by default, because a faint glow through a wall still tells
   * you something is behind it, and because a hard cull makes the field flicker
   * along surfaces the data sits on.
   */
  occlusion: number;
  /**
   * Drop datapoints standing behind the terrain outright, rather than dimming
   * them.
   *
   * Terrain and walls are opaque in different ways, and one dimmer cannot serve
   * both. A wall you want to see through — which corridor, which floor — so the
   * dimmer is a dimmer. A hill you never want to see through: what is behind it
   * is the far side of the world, and on a map kilometres across that is most
   * of the data.
   *
   * Sharing one control between them fails in a way that looks like the control
   * is broken. Set strong enough to suppress the horizon, and the inside of the
   * building you are looking at goes with it; set weak enough to read the
   * building, and heat from three kilometres away sums along the horizon into a
   * band brighter than anything in the foreground — because there is a great deal
   * more of it. So terrain gets a cutoff and walls keep the dimmer.
   */
  hideBehindGround: boolean;
  /**
   * How far a team-mode mixture is pushed away from neutral. 1 leaves it alone.
   *
   * Teams mode only. It exists because the honest answer and the readable one come
   * apart as the group count grows: with a dozen groups, almost every busy pixel is
   * a mixture of several, their positions on the colour plane very nearly cancel,
   * and a correct picture is a grey picture. Scaling the mixture's distance from
   * the origin sharpens whatever imbalance is actually there without inventing one
   * — a genuine dead heat sits at the origin and stays there at any setting.
   *
   * Above about 2 the brighter mixtures leave sRGB and get clamped per channel,
   * which shifts their hue. That is the trade the control is for, so the ceiling is
   * generous rather than safe.
   */
  teamBoost: number;
  scheme: HeatColorScheme;
}

/**
 * A slab of the world to show, cutting everything outside it away.
 *
 * The counterpart to occlusion: once the level hides what is behind it, you need
 * a way to look inside. A slab does both jobs — set it thin and it is a floor
 * plan at that height, set one edge past the world and it is "everything below
 * the third storey".
 *
 * Applied to level geometry and to datapoints alike. Slicing only the level
 * would leave heat floating where its building used to be.
 */
export interface SliceSettings {
  enabled: boolean;
  /** Which world axis the slab is measured along. Y is height. */
  axis: 'x' | 'y' | 'z';
  /** Centre of the slab, in world units. */
  center: number;
  /** Slab thickness. Wide enough and it becomes a half-space cut. */
  thickness: number;
  /** Dim rather than remove what is outside, for context. 0 = remove. */
  outsideOpacity: number;
  /** Cut the datapoints too, not just the geometry. */
  clipHeat: boolean;
}

/**
 * Density -> ramp position.
 *
 * `saturating` matches what alpha-over accumulation gives you: a hotspot
 * approaches the top of the ramp asymptotically rather than clipping to it. It is
 * the safer default for eyeballing an unfamiliar dataset because nothing goes
 * flat white. `linear` is the one to use when you are comparing two runs, since
 * it is the only mapping where equal colour means equal count.
 */
export type HeatResponse = 'linear' | 'saturating' | 'log';

export const HEAT_RESPONSE_CODE: Record<HeatResponse, number> = {
  linear: 0,
  saturating: 1,
  log: 2,
};

export interface TeamSettings {
  /** Cube edge length in world units. */
  cubeSize: number;
  /** Draw a look-direction indicator from each cube. */
  showLookDirection: boolean;
  lookLength: number;
  /** Seconds of trailing history drawn behind each person. */
  trailSeconds: number;
  /** Interpolate between a person's bracketing samples instead of snapping. */
  interpolate: boolean;
  /** Draw every raw sample in the window as a cube, not just live positions. */
  showRawSamples: boolean;
  /**
   * Draw each live person as the figure of what they are - a soldier, the tank
   * or aircraft the data names - instead of a box. See `figures/replay.ts`.
   */
  figures: boolean;
  /** Figure size: 1 is true size. */
  figureScale: number;
  /**
   * The smallest a figure is drawn, in pixels along its longest side: true
   * size up close, and further off grown just enough to stay this big, as
   * Tacview draws them. 0 keeps true size at any distance.
   */
  figurePixels: number;
  /** How a unit is drawn far off: its model, its domain's arrow, or a map symbol (`render/symbols/lod.ts`). */
  farMode: FarMode;
  /** The symbols' convention: NATO APP-6, Russian tactical signs, a game map's glyphs, or shape-only (`symbols/atlas.ts`). */
  symbolStyle: SymbolStyle;
  /** A symbol's size on screen, px. */
  symbolPx: number;
  /** The team that is friend in the symbols (-1: the first). */
  mySide: number;
  /** What the teams that are not mine are in the symbols. */
  symbolOthers: 'hostile' | 'neutral';
  /** A tick on moving units' symbols the way they go. */
  symbolTicks: boolean;
  /** Drop lines and name labels on weapons in flight too. */
  weaponMarks: boolean;
  /** Weapons in flight with their smoke, tracers, impacts, hits and kills (render/weapons.ts). */
  weapons: boolean;
  /**
   * Which session to play back, as an index into `dataset.sessionLabels`.
   *
   * -1 means every session at once, which is honest but rarely what is wanted:
   * real telemetry interleaves concurrent matches, so "everyone alive at 14:51"
   * is dozens of players from a dozen different matches standing on the same map.
   * Playback of one match is what the team view is for, so a dataset that has
   * sessions opens on its busiest one.
   */
  session: number;
}

/**
 * Whether the playhead matters at all.
 *
 * `all` is not the same as scrubbing to the end: it ignores the playhead
 * entirely, so it keeps showing every row (minus the filters) while playback is
 * irrelevant. It is the mode you want to answer "where does this happen", as
 * opposed to "when".
 */
export type TimelineMode = 'all' | 'play';

/**
 * How much history is visible at the playhead in `play` mode.
 *
 * - `cumulative` — everything from the start of the dataset up to the playhead.
 * - `fixed`      — a window of `windowSeconds` ending at the playhead.
 * - `lifetime`   — each row lives until the same person's next sample, so
 *   exactly one position per person is current at any instant. Rows with no
 *   successor fall back to `defaultLifetime`.
 */
export type WindowMode = 'cumulative' | 'fixed' | 'lifetime';

export interface TimelineSettings {
  mode: TimelineMode;
  window: WindowMode;
  /** Seconds. Current playhead within the dataset's time range. */
  playhead: number;
  /** Bumped whenever the playhead is set from outside the render loop. */
  seekNonce: number;
  playing: boolean;
  /** Dataset-seconds advanced per wall-clock second. */
  speed: number;
  loop: boolean;
  /** Played backwards, from the end towards the start (Tacview's reverse playback). */
  reverse?: boolean;
  /** Window length for `fixed`, in seconds. */
  windowSeconds: number;
  /**
   * Fraction of a datapoint's life spent fading out, in `lifetime` mode.
   *
   * A datapoint that disappears between one frame and the next reads as a flicker
   * rather than as something ending — and since lifetime mode shows exactly one
   * sample per person, the whole field flickers at the sample rate. Fading over
   * the tail of each life turns that into motion.
   */
  fadeOut: number;
  /** Seconds a row with no following sample stays visible in `lifetime` mode. */
  defaultLifetime: number;
}

export interface RenderBudget {
  /**
   * Max sprites submitted per frame. The stochastic sampler scales weight to
   * compensate, so this trades noise for framerate, never correctness of the mean.
   */
  splatsPerFrame: number;
  /** Accumulate across frames while the view is static, converging to exact. */
  progressive: boolean;
  /**
   * Draw every candidate row on every frame, ignoring `splatsPerFrame` as a
   * ceiling, up to what one draw plan can hold.
   *
   * On by default, because with it off a moving camera glitters and that is the
   * single most-reported thing about this viewer. Accumulation is what removes
   * the sampling grain and a camera move discards the accumulation, so a moving
   * frame shows exactly as much of the data as it drew — a quarter of it, in
   * bright weighted dots, at the default budget on a fourteen-million-row load.
   *
   * Turning it off restores the stochastic behaviour in full: `splatsPerFrame`
   * becomes a real ceiling again and the frame cost is bounded by it rather than
   * by the size of the data. That is the trade to make on hardware that cannot
   * afford the whole field at once, and it is what the accumulator exists for.
   */
  exact: boolean;
  /** Render heat at this fraction of canvas resolution, then upscale. */
  heatScale: number;
  targetFps: number;
  /** Auto-tune splatsPerFrame to hold targetFps. */
  adaptive: boolean;
  /**
   * Ceiling on GPU memory for row textures.
   *
   * Enforced rather than hoped for: WebGL accepts allocations it cannot service
   * and then either loses the context or silently falls back to system memory at
   * ruinous cost, so exceeding this drops chunks and says so.
   */
  gpuBudgetBytes: number;
  /**
   * Highest the above may be: `Budgets.gpuCeiling`, where the slider stops.
   *
   * Not the detected figure. A budget above that is the user's deliberate choice
   * and applies; the panel warns that it is above what was detected. Kept beside
   * the value so the render loop applies the same limit as the load-time fit
   * check — both go through `effectiveGpuBudget` (render/budget.ts).
   */
  gpuBudgetMax: number;
}

export interface AxisMirror {
  x: boolean;
  y: boolean;
  z: boolean;
}

/** Furthest a streamed world level pushes the near plane, metres (see cameraForExtent). */
const STREAM_NEAR_CAP = 10;

const MIRROR_KEY = 'heat3d.mirror';
const FAR_KEY = 'heat3d.far';

type FarSettings = Pick<TeamSettings, 'farMode' | 'symbolStyle' | 'symbolPx' | 'mySide' | 'symbolOthers' | 'symbolTicks' | 'weaponMarks'>;
const FAR_DEFAULTS: FarSettings = { farMode: 'figure', symbolStyle: 'nato', symbolPx: 28, mySide: -1, symbolOthers: 'hostile', symbolTicks: true, weaponMarks: false };

/** The far-off settings this viewer last had, as the other figure settings, per browser. */
function savedFar(): FarSettings {
  try {
    const v = JSON.parse(localStorage.getItem(FAR_KEY) ?? 'null');
    if (v && typeof v === 'object') {
      const pick = <T,>(x: unknown, ok: readonly T[], d: T): T => (ok.includes(x as T) ? (x as T) : d);
      return {
        farMode: pick<FarMode>(v.farMode, ['figure', 'arrow', 'symbol'], FAR_DEFAULTS.farMode),
        symbolStyle: pick<SymbolStyle>(v.symbolStyle, ['nato', 'russian', 'map', 'mono'], FAR_DEFAULTS.symbolStyle),
        symbolPx: Number.isFinite(v.symbolPx) ? Math.max(8, Math.min(96, v.symbolPx)) : FAR_DEFAULTS.symbolPx,
        mySide: Number.isInteger(v.mySide) ? v.mySide : -1,
        symbolOthers: v.symbolOthers === 'neutral' ? 'neutral' : 'hostile',
        symbolTicks: v.symbolTicks !== false,
        weaponMarks: v.weaponMarks === true,
      };
    }
  } catch {
    // No storage, or something unreadable in it: the defaults.
  }
  return { ...FAR_DEFAULTS };
}

function saveFar(t: TeamSettings): void {
  try {
    const f: FarSettings = { farMode: t.farMode, symbolStyle: t.symbolStyle, symbolPx: t.symbolPx, mySide: t.mySide, symbolOthers: t.symbolOthers, symbolTicks: t.symbolTicks, weaponMarks: t.weaponMarks };
    localStorage.setItem(FAR_KEY, JSON.stringify(f));
  } catch {
    // Private windows and blocked storage: the settings last this session only.
  }
}

/** The axes this viewer last had inverted: a per-browser convenience. */
function savedMirror(): AxisMirror {
  try {
    const v = JSON.parse(localStorage.getItem(MIRROR_KEY) ?? 'null');
    if (v && typeof v === 'object') return { x: !!v.x, y: !!v.y, z: !!v.z };
  } catch {
    // No storage, or something unreadable in it: nothing inverted.
  }
  return { x: false, y: false, z: false };
}

export function saveMirror(m: AxisMirror): void {
  try {
    localStorage.setItem(MIRROR_KEY, JSON.stringify(m));
  } catch {
    // Private windows and blocked storage: the setting lasts this session only.
  }
}

export interface CameraSettings {
  fov: number;
  /** World units per second at full throttle. */
  flySpeed: number;
  near: number;
  far: number;
  invertY: boolean;
  /**
   * World axes drawn reversed. A game that keeps a left-handed world (Forza,
   * Unreal) comes out mirrored in this right-handed view - a right-hand bend
   * drawn as a left-hand one - and one inverted horizontal axis puts it back.
   * Only the drawing changes: the data, the analysis and every coordinate the
   * tools show stay the game's own.
   */
  mirror: AxisMirror;
  /**
   * Orthographic removes perspective foreshortening, so two hotspots of equal
   * density read as the same size wherever they sit in the frame. That is the
   * comparison a map heatmap exists to support, which is why it is offered
   * rather than left as a curiosity.
   */
  projection: Projection;
  /** XInput and other standard-layout pads, polled from the frame loop. */
  gamepad: GamepadSettings;
  /** Depth of field, applied to the background geometry only. */
  dof: DofSettings;
}

/**
 * Depth of field.
 *
 * Applied to the scene — level geometry, grid, cubes — and *not* to the heat.
 * Heat at a pixel is the sum of sprites at many different depths, so it has no
 * single depth to be in or out of focus at; blurring it by the depth of whatever
 * happens to be behind it would be wrong wherever heat floats in front of
 * geometry. Softening the context while the data stays sharp is also the more
 * useful of the two, which makes the limitation easy to live with.
 */
export interface DofSettings {
  enabled: boolean;
  /**
   * Take the focus distance from whatever the view was last framed on, rather
   * than the manual value.
   */
  autoFocus: boolean;
  /** World units from the camera to the focal plane, when not auto. */
  focusDistance: number;
  /**
   * Depth range that stays acceptably sharp, as a fraction of the focus distance.
   *
   * Expressed relatively rather than as an f-number because the scenes here span
   * anything from a room to an eight-kilometre map, and an absolute aperture would
   * need retuning for every dataset.
   */
  aperture: number;
  /** Largest blur radius in pixels. The cost of the effect scales with this. */
  maxBlur: number;
}

/**
 * A keyframed camera move, and the settings for writing it out as a video.
 *
 * Keys live on a normalised axis rather than in seconds, so changing the output
 * duration re-times the whole move without touching any keyframe — which is what
 * you want when a shot is right but too quick. See `render/campath.ts`.
 */
export interface PathSettings {
  keys: Keyframe[];
  easing: PathEasing;
  /** Length of the output video. */
  seconds: number;
  fps: number;
  /** Video bitrate in kilobits per second. */
  kbps: number;
  /**
   * Render frames to wait for one output frame to become exact before moving on.
   *
   * A large window at a low sprite budget can genuinely need hundreds. The cap is
   * so a render reports which frames it could not finish rather than hanging.
   */
  maxWaitFrames: number;
  /** Position along the path being previewed, 0..1. */
  preview: number;
  /** Whether the viewport camera is following `preview` rather than the mouse. */
  showPreview: boolean;
}

export interface LiveStats {
  fps: number;
  frameMs: number;
  gpuMs: number | null;
  /** Sprites submitted last frame. */
  splatsSubmitted: number;
  /** Rows passing the current filters and time window. */
  candidateRows: number;
  /** Frames merged into the current progressive accumulation. */
  accumFrames: number;
  backend: 'webgpu' | 'webgl2' | 'none';
}

export interface LoadProgress {
  active: boolean;
  label: string;
  /** 0..1, or null when indeterminate. */
  fraction: number | null;
  rowsSoFar: number;
  error: string | null;
}

interface AppState {
  dataset: Dataset | null;
  load: LoadProgress;
  /** Background geometry: a georeferenced map image or a level mesh. */
  level: Level | null;

  mode: ViewMode;
  heat: HeatSettings;
  team: TeamSettings;
  /** Line heat: which events begin and end a route. See `data/lines.ts`. */
  lines: LineSettings;
  timeline: TimelineSettings;
  budget: RenderBudget;
  /** Detected resource ceilings, and the budgets chosen within them. */
  budgets: Budgets;
  camera: CameraSettings;
  filters: FilterSpec[];
  /** Team index -> visible. Empty map means all visible. */
  teamVisibility: Record<number, boolean>;
  /** In difference mode: which team indices count as positive / negative. */
  positiveTeams: number[];
  negativeTeams: number[];
  /** What decides which side of the difference a row lands on. */
  split: SplitRule;
  /** The slab of world to show, for looking inside buildings. */
  slice: SliceSettings;
  /** Keyframed camera path, and what a render of it should look like. */
  path: PathSettings;

  stats: LiveStats;
  showGrid: boolean;
  showAxes: boolean;

  setDataset: (d: Dataset | null) => void;
  setLevel: (l: Level | null) => void;
  patchLevel: (p: Partial<ImageLevel> & Partial<ModelLevel>) => void;
  setLoad: (p: Partial<LoadProgress>) => void;
  setMode: (m: ViewMode) => void;
  patchHeat: (p: Partial<HeatSettings>) => void;
  patchSlice: (p: Partial<SliceSettings>) => void;
  patchPath: (p: Partial<PathSettings>) => void;
  patchTeam: (p: Partial<TeamSettings>) => void;
  patchLines: (p: Partial<LineSettings>) => void;
  patchBudget: (p: Partial<RenderBudget>) => void;
  patchCamera: (p: Partial<CameraSettings>) => void;
  setRamp: (which: 'positive' | 'negative', stops: ColorStop[]) => void;
  setCurve: (points: CurvePoint[]) => void;
  /**
   * Detected resource ceilings and the chosen budgets within them.
   *
   * In the store rather than in the panel that happens to show them, because the
   * load-time fit check, the render loop's residency limit and the settings UI all
   * have to agree on one set of numbers.
   */
  setBudgets: (b: Budgets) => void;
  seek: (t: number) => void;
  setPlaying: (p: boolean) => void;
  patchTimeline: (p: Partial<Omit<TimelineSettings, 'seekNonce'>>) => void;
  setFilters: (f: FilterSpec[]) => void;
  setTeamSplit: (positive: number[], negative: number[]) => void;
  setSplit: (s: SplitRule) => void;
  toggleTeam: (index: number, visible: boolean) => void;
  reportStats: (s: Partial<LiveStats>) => void;
  toggle: (key: 'showGrid' | 'showAxes') => void;
}

/**
 * Detected once at module load, before any backend exists.
 *
 * The GPU half is refined once a renderer can be asked; the RAM and CPU halves
 * are available immediately and are the ones that gate a load.
 */
const DETECTED: Budgets = detectBudgets(null);

/** The session with the most rows, or -1 when the data has no sessions. */
function busiestSession(d: Dataset): number {
  const rows = d.sessionRows;
  if (!d.sessionId || !rows || rows.length === 0) return -1;
  let best = 0;
  for (let i = 1; i < rows.length; i++) if (rows[i] > rows[best]) best = i;
  return best;
}

export const useStore = create<AppState>((set) => ({
  dataset: null,
  level: null,
  load: { active: false, label: '', fraction: null, rowsSoFar: 0, error: null },

  mode: 'heat-simple',
  heat: {
    radius: 6,
    centerIntensity: 1,
    edgeIntensity: 0,
    falloff: 1.6,
    saturation: 24,
    floor: 0,
    minPixelRadius: 1,
    maxPixelRadius: 96,
    zoomInvariant: true,
    followExposure: true,
    splitShares: false,
    groundProjected: false,
    smoothRamp: true,
    useCurve: false,
    curve: DEFAULT_CURVE.map((p) => ({ ...p })),
    response: 'saturating',
    cullNear: 0,
    cullFar: 0,
    // A plane, because that is what the control is for. Costs nothing when the
    // bounds are off, which they are by default.
    cullPlanar: true,
    cullGeometry: true,
    // Strong by default, but not absolute: a wall should clearly be in front of
    // what is behind it, while a faint trace still says something is there.
    occlusion: 0.8,
    // On, because it is what the depth buffer already says: you cannot see
    // through a hill. It costs one depth pass over the structures and is skipped
    // entirely when off.
    hideBehindGround: true,
    // 1.4, not 1. At 1 the arithmetic is exact and the picture is disappointing:
    // a two-team map reads well but anything past four or five is mostly grey,
    // because a mixture of five hues spread evenly round the circle *is* grey. A
    // little above 1 keeps ties honest while making a 60/40 split visible.
    teamBoost: 1.4,
    scheme: {
      positive: DEFAULT_POSITIVE_RAMP.map((s) => ({ ...s })),
      negative: DEFAULT_NEGATIVE_RAMP.map((s) => ({ ...s })),
    },
  },
  slice: {
    enabled: false,
    axis: 'y',
    center: 0,
    thickness: 500,
    outsideOpacity: 0,
    clipHeat: true,
  },
  path: {
    keys: [],
    easing: 'smooth',
    seconds: 12,
    fps: 30,
    kbps: 16_000,
    maxWaitFrames: 240,
    preview: 0,
    showPreview: false,
  },
  lines: { column: null, starts: [], ends: [], points: [] },
  team: {
    cubeSize: 1.6,
    showLookDirection: true,
    lookLength: 5,
    trailSeconds: 8,
    interpolate: true,
    showRawSamples: false,
    figures: true,
    figureScale: 1,
    figurePixels: 36,
    ...savedFar(),
    weapons: true,
    session: -1,
  },
  timeline: {
    // Opens showing everything: a first look should answer "where" before
    // anyone has to think about a playhead.
    mode: 'all',
    window: 'cumulative',
    playhead: 0,
    seekNonce: 0,
    playing: false,
    speed: savedSpeed(),
    loop: true,
    windowSeconds: 30,
    fadeOut: 0.4,
    defaultLifetime: 10,
  },
  budget: {
    splatsPerFrame: 4_000_000,
    progressive: true,
    exact: true,
    heatScale: 1,
    targetFps: 60,
    adaptive: true,
    gpuBudgetBytes: DETECTED.gpu,
    gpuBudgetMax: DETECTED.gpuCeiling,
  },
  budgets: DETECTED,
  camera: {
    fov: 65,
    flySpeed: 120,
    near: 0.5,
    far: 40_000,
    invertY: false,
    mirror: savedMirror(),
    projection: 'perspective',
    gamepad: { ...DEFAULT_GAMEPAD },
    dof: {
      // Off by default: it is a presentation effect, and the default view should
      // show the data rather than an interpretation of it.
      enabled: false,
      autoFocus: true,
      focusDistance: 1000,
      aperture: 0.35,
      maxBlur: 12,
    },
  },
  filters: [],
  teamVisibility: {},
  positiveTeams: [],
  negativeTeams: [],
  split: { kind: 'teams' },

  stats: {
    fps: 0,
    frameMs: 0,
    gpuMs: null,
    splatsSubmitted: 0,
    candidateRows: 0,
    accumFrames: 0,
    backend: 'none',
  },
  showGrid: true,
  showAxes: true,

  setDataset: (d) =>
    set((s) => {
      if (!d) return { dataset: null };
      const cap = datasetCapabilities(d);
      const teamCount = d.teamLabels.length;
      // Default difference split: first half of teams positive, rest negative.
      const half = Math.max(1, Math.ceil(teamCount / 2));
      const all = Array.from({ length: teamCount }, (_, i) => i);
      // The split carries over when it still has two sides in the new data. With
      // fewer than two groups a retained column is split instead - the file of
      // origin first - so data without groups still has a difference to show.
      const split = splitHasTwoSides(s.split, d)
        ? s.split
        : teamCount >= 2
          ? ({ kind: 'teams' } as const)
          : (defaultColumnSplit(d) ?? ({ kind: 'teams' } as const));
      const twoSides = cap.canDifference || splitHasTwoSides(split, d);
      // Sprite radius, cube size and camera range all have to scale with the
      // dataset or nothing is visible on first load.
      const cal = calibrate(d);
      return {
        dataset: d,
        filters: [],
        teamVisibility: {},
        positiveTeams: all.slice(0, half),
        negativeTeams: all.slice(half),
        split,
        heat: { ...s.heat, radius: cal.radius, saturation: cal.saturation },
        team: {
          ...s.team,
          cubeSize: cal.cubeSize,
          lookLength: cal.lookLength,
          // The busiest session, not "all of them".
          //
          // All of them is honest and unreadable: concurrent matches put dozens
          // of players from a dozen matches on one map at one instant, and the team
          // view exists to watch a match. The busiest is the one most likely to be
          // worth watching, and it is one pass over a count that ingest already
          // made. `-1` when the data has no session column, which leaves the
          // behaviour exactly as it was.
          session: busiestSession(d),
        },
        camera: { ...s.camera, flySpeed: cal.flySpeed, far: cal.far, near: cal.near },
        // Fall back to a mode the data can actually support rather than showing
        // an empty viewport with no explanation.
        mode:
          s.mode === 'heat-difference' && !twoSides
            ? 'heat-simple'
            : s.mode === 'heat-teams' && !cap.canGroup
              ? 'heat-simple'
              : s.mode === 'team' && !cap.canTracks
                ? 'heat-simple'
                : s.mode === 'heat-lines' && !(cap.canTracks && cap.canTimeline)
                ? 'heat-simple'
                : s.mode,
        // What a route is, guessed afresh from each dataset's own events.
        lines: { ...suggestLineSettings(d), maxJump: suggestMaxJump(d) },
        timeline: {
          ...s.timeline,
          // Without a time axis there is nothing to play.
          mode: cap.canTimeline ? s.timeline.mode : 'all',
          window: cap.canLifetime ? s.timeline.window : 'cumulative',
          // The start, not the end. Parked at the end, the first press of Play
          // either snaps instantly back to the beginning (loop on) or does nothing
          // at all (loop off) — both read as a broken button. `all` mode, which is
          // the default, ignores the playhead entirely, so nothing is lost.
          playhead: d.timeRange[0],
          seekNonce: s.timeline.seekNonce + 1,
          playing: false,
        },
      };
    }),
  setLevel: (level) =>
    set((s) => {
      // Release the decoded bitmap: at map resolutions it is tens of megabytes
      // and nothing else will free it.
      if (s.level?.kind === 'image' && s.level !== level) s.level.bitmap.close();
      // A level can be far larger than the data on it, and the far plane is
      // calibrated from the *dataset* — or, with no dataset loaded, not at all.
      // An exported Unreal map can be several kilometres across, which needs
      // hundreds of thousands of units of distance to frame; against the 40k
      // default the whole map sits behind the far plane and the viewport is
      // empty, with nothing on screen to suggest why. Only ever widened, never
      // narrowed, so a dataset's own calibration is not undone by loading a
      // small level next to it.
      //
      // Model levels only. An image level is placed by anchors derived from the
      // data it sits under, so the dataset's own calibration already covers it.
      const camera =
        level?.kind === 'model' ? cameraForExtent(s.camera, level.bounds, level.stream ? STREAM_NEAR_CAP : Infinity) : s.camera;
      return { level, camera };
    }),
  patchLevel: (p) =>
    set((s) => (s.level ? { level: { ...s.level, ...p } as Level } : {})),
  setLoad: (p) => set((s) => ({ load: { ...s.load, ...p } })),
  setMode: (mode) => set({ mode }),
  patchHeat: (p) => set((s) => ({ heat: { ...s.heat, ...p } })),
  patchSlice: (p) => set((s) => ({ slice: { ...s.slice, ...p } })),
  patchPath: (p) => set((s) => ({ path: { ...s.path, ...p } })),
  patchTeam: (p) =>
    set((s) => {
      const team = { ...s.team, ...p };
      if (Object.keys(p).some((k) => k in FAR_DEFAULTS)) saveFar(team);
      return { team };
    }),
  patchLines: (p) => set((s) => ({ lines: { ...s.lines, ...p } })),
  patchBudget: (p) => set((s) => ({ budget: { ...s.budget, ...p } })),
  patchCamera: (p) => {
    if (p.mirror) saveMirror(p.mirror);
    set((s) => ({ camera: { ...s.camera, ...p } }));
  },
  setRamp: (which, stops) =>
    set((s) => ({
      heat: { ...s.heat, scheme: { ...s.heat.scheme, [which]: stops } },
    })),
  // Normalised on the way in, so nothing downstream — the editor, the bake, the
  // shader — has to cope with unsorted or out-of-range points.
  setCurve: (points) =>
    set((s) => ({ heat: { ...s.heat, curve: normaliseCurve(points) } })),
  setBudgets: (b) =>
    set((s) => {
      const clamped = clampBudgets(b);
      return {
        budgets: clamped,
        // The renderer enforces residency per frame from its own copy, so the
        // chosen GPU figure has to reach it — otherwise the fit check approves a
        // load the renderer then partly drops.
        budget: {
          ...s.budget,
          gpuBudgetBytes: clamped.gpu,
          gpuBudgetMax: clamped.gpuCeiling,
        },
      };
    }),
  seek: (t) =>
    set((s) => ({
      timeline: { ...s.timeline, playhead: t, seekNonce: s.timeline.seekNonce + 1 },
    })),
  setPlaying: (playing) => set((s) => ({ timeline: { ...s.timeline, playing } })),
  patchTimeline: (p) => set((s) => ({ timeline: { ...s.timeline, ...p } })),
  setFilters: (filters) => set({ filters }),
  setTeamSplit: (positiveTeams, negativeTeams) => set({ positiveTeams, negativeTeams }),
  setSplit: (split) => set({ split }),
  toggleTeam: (index, visible) =>
    set((s) => ({ teamVisibility: { ...s.teamVisibility, [index]: visible } })),
  reportStats: (p) => set((s) => ({ stats: { ...s.stats, ...p } })),
  toggle: (key) => set((s) => ({ [key]: !s[key] }) as Partial<AppState>),
}));

/**
 * Read-only snapshot for the render loop. `getState()` on zustand is a plain
 * property read, so calling this every frame is free.
 */
export const snapshot = () => useStore.getState();

/**
 * The data code's messages, in the viewer's language.
 *
 * What the ingest and model workers have to say comes back as messages (see
 * data/msg), and is said with the i18n module's own words and numbers from here
 * on. A loaded dataset's name and warnings were said when it arrived; on a
 * change of language they are said again, in place - the dataset itself, all of
 * its arrays, stays the one the renderer holds, and the tree re-renders anyway.
 */
speakWith({ t, int, num, lang });
onLanguageChange(() => {
  const ds = useStore.getState().dataset;
  if (ds) sayDataset(ds);
});
