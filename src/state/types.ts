/**
 * Core domain types.
 *
 * Everything positional is stored Structure-of-Arrays in typed arrays so it can
 * be uploaded to GPU buffers without a per-row transform. Rows are stored
 * *already sorted ascending by time* — that invariant is what makes timeline
 * playback cost O(events crossing the window edge) instead of O(rows).
 */

import { sayingTable, type Msg } from '../data/msg';

export type TimeUnit =
  | 'seconds'
  | 'milliseconds'
  | 'microseconds'
  | 'nanoseconds'
  | 'unix_seconds'
  | 'unix_milliseconds'
  | 'iso8601';

/** Each unit's label, said in the viewer's language when it is read. */
export const TIME_UNIT_LABELS: Record<TimeUnit, string> = sayingTable({
  seconds: 'state.types.timeUnit.seconds',
  milliseconds: 'state.types.timeUnit.milliseconds',
  microseconds: 'state.types.timeUnit.microseconds',
  nanoseconds: 'state.types.timeUnit.nanoseconds',
  unix_seconds: 'state.types.timeUnit.unixSeconds',
  unix_milliseconds: 'state.types.timeUnit.unixMilliseconds',
  iso8601: 'state.types.timeUnit.iso8601',
});

/** How the dataset's axes map onto world axes. Game engines disagree wildly. */
export type UpAxis = 'y' | 'z';

export interface AxisMapping {
  /** Which dataset column feeds world X / Y / Z. */
  up: UpAxis;
  /** Negate after remap — handles left- vs right-handed sources. */
  flipX: boolean;
  flipY: boolean;
  flipZ: boolean;
  /** Multiply positions by this (e.g. cm -> m = 0.01). */
  scale: number;
}

export const DEFAULT_AXIS_MAPPING: AxisMapping = {
  up: 'z',
  flipX: false,
  flipY: false,
  flipZ: false,
  scale: 1,
};

export type LookMode = 'none' | 'yawPitch' | 'vector';

export interface ColumnMapping {
  x: string | null;
  y: string | null;
  z: string | null;
  lookMode: LookMode;
  yaw: string | null;
  pitch: string | null;
  dirX: string | null;
  dirY: string | null;
  dirZ: string | null;
  /** Degrees vs radians for yaw/pitch columns. */
  angleUnit: 'degrees' | 'radians';
  personId: string | null;
  teamId: string | null;
  /**
   * The column identifying one match, raid or run.
   *
   * Mapped separately from a filter column because two things depend on it that
   * a filter cannot express: what counts as a continuous track for one person,
   * and which of those tracks the team viewer is playing back. See
   * `Dataset.sessionId`.
   */
  sessionId: string | null;
  time: string | null;
  timeUnit: TimeUnit;
  /** Extra columns retained in memory so they can be filtered on later. */
  extra: string[];
  /**
   * Per extra column: treat as a numeric range (true) or a category set (false).
   * Sniffed from the file's head, overridable — a numeric-looking id column is
   * far more useful as a category.
   */
  extraNumeric: Record<string, boolean>;
  /**
   * Field separator for delimited text. Sniffed, but always overridable: the
   * detector cannot tell a semicolon-separated file from a comma-separated one
   * whose text fields are full of semicolons.
   */
  delimiter: string;
  axes: AxisMapping;
  /**
   * How big one tracked thing is, in the data's own units, where the file says
   * (a CS2 player is 32 units across). Sizes the boxes and look rays of the box
   * replay; without it they are guessed from the extent of the data.
   */
  entitySize?: number;
}

export function emptyColumnMapping(): ColumnMapping {
  return {
    x: null,
    y: null,
    z: null,
    lookMode: 'none',
    yaw: null,
    pitch: null,
    dirX: null,
    dirY: null,
    dirZ: null,
    angleUnit: 'degrees',
    personId: null,
    teamId: null,
    sessionId: null,
    time: null,
    timeUnit: 'seconds',
    extra: [],
    extraNumeric: {},
    delimiter: ',',
    axes: { ...DEFAULT_AXIS_MAPPING },
  };
}

/**
 * Where a dataset sits on the earth, for data recorded in the real world.
 *
 * Only a recording that says where it is carries one: a Tacview ACMI file,
 * whose positions are east and north metres on the plane touching the WGS84
 * ellipsoid at its reference point (`tangentPlane` in data/acmi), with heights
 * in metres above sea level. The positions it describes are the data's own,
 * before the load's axis mapping (`Dataset.axes`); the world backdrop
 * (src/world) projects the real world the same way and maps it through the same
 * axes, so it lands under the data. Absent for every game-world dataset.
 */
export interface GeoReference {
  /** The reference point, degrees. */
  lat0: number;
  lon0: number;
  /** How positions are projected: x east and y north metres on the tangent plane at the reference, z height. */
  projection: 'tangent-plane';
}

export interface Bounds {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
}

export function emptyBounds(): Bounds {
  return {
    minX: Infinity,
    minY: Infinity,
    minZ: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
    maxZ: -Infinity,
  };
}

export function boundsCenter(b: Bounds): [number, number, number] {
  return [(b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2, (b.minZ + b.maxZ) / 2];
}

export function boundsRadius(b: Bounds): number {
  const dx = b.maxX - b.minX;
  const dy = b.maxY - b.minY;
  const dz = b.maxZ - b.minZ;
  return Math.max(1e-3, 0.5 * Math.hypot(dx, dy, dz));
}

/**
 * A retained non-positional column, usable as a filter source.
 *
 * Numeric columns keep their values as f32 and filter by range. Low-cardinality
 * string columns become `category`: values are dictionary-encoded to a u32 index
 * and filter by an allow-set, which is both far smaller and GPU-testable.
 */
export type AttributeKind = 'number' | 'category';

export interface AttributeColumn {
  name: string;
  kind: AttributeKind;
  /** f32 values, or u32 category indices reinterpreted through `categories`. */
  data: Float32Array | Uint32Array;
  min: number;
  max: number;
  /** Present iff kind === 'category'. Index -> original label. */
  categories?: string[];
}

/**
 * An in-memory dataset ready for GPU upload.
 *
 * `count` can reach hundreds of millions, so nothing here may be an array of
 * objects and nothing may be iterated per-row on the render thread.
 */
export interface Dataset {
  id: string;
  name: string;
  count: number;

  /** World-space positions, axis mapping already applied. */
  px: Float32Array;
  py: Float32Array;
  pz: Float32Array;

  /** Seconds relative to `epochMs`. Ascending. Null if no time column mapped. */
  time: Float32Array | null;
  /** Absolute wall-clock of time=0, for display only. Null when time is relative. */
  epochMs: number | null;

  /**
   * Seconds each row stays "alive": the gap to the next sample of the same
   * person, or -1 when there is no next sample.
   *
   * The -1 is deliberately a sentinel rather than a large number, because what
   * should happen to a datapoint with no successor is a viewing decision — the
   * person may have left, died, or simply stopped being logged — so the fallback
   * duration is a render-time setting, not something baked into the data.
   *
   * Null when the dataset has no time or no person column, since a lifetime
   * cannot be defined without both.
   */
  lifetime: Float32Array | null;
  /** Largest finite gap in `lifetime`, for bounding the candidate row range. */
  maxLifetimeGap: number;

  /**
   * person index -> 1 when that label is worn by more than one moving thing.
   *
   * The person dictionary is keyed by name, and a name is not always an entity.
   * On one region's week of matches every bot in every match logs under the name
   * of the bot controller class, so hundreds of sessions' worth of them collapse
   * into a single "person" scattered across the whole map. Joining their samples — by
   * interpolating between them or by drawing a trail — draws a line between two
   * different creatures, and a field of those lines is what a broken renderer
   * looks like.
   *
   * Detected without knowing any project's naming, so it carries over to other
   * Unreal titles: two records *of the same kind*, under one name, in one
   * session, at the same instant, and far enough apart to be two places, cannot
   * be one thing.
   *
   * Both qualifiers are load-bearing, and each was added because the rule
   * without it marked real players. Over two files of one week, some thousands
   * of names, each version of the rule marked:
   *
   *   simultaneous and displaced          most of the names
   *     + far enough apart                far fewer
   *     + same kind of record             fewer again
   *     + both                            a handful
   *
   * The same kind of record matters because this export logs one event from
   * both sides — an ability event's two records arrive under one name at one
   * instant, each carrying a different party's
   * position. Two different kinds of record disagree about position for reasons
   * that have nothing to do with identity, so they are not evidence.
   *
   * Far enough apart matters because plenty of same-kind records are genuinely
   * simultaneous: a shotgun blast writes a shot event per pellet,
   * metres apart. The floor is a hundredth of the diagonal of the loaded extent
   * — tens of metres on the test level — rather than a fixed distance, because
   * the world units depend on the axis mapping.
   *
   * A rule of "most of this name's rows are ambiguous" was tried and rejected:
   * at any threshold it caught real players, dozens of them at a half.
   *
   * Of the handful it leaves, most are bot and creature archetypes, one is the
   * blank name, and the rest are players carrying exactly one collision each — two
   * accounts under one display name in one match, which is the same fact about
   * identity and the same right answer.
   *
   * Comparing every categorical column makes the conclusion conservative: any
   * disagreement means no claim is made, so the error falls on the side of
   * leaving a name alone.
   *
   * Null when there is no time or no person column to detect it from.
   */
  personShared: Uint8Array | null;

  /** Radians. Null when no look direction mapped. */
  yaw: Float32Array | null;
  pitch: Float32Array | null;

  /** Dictionary-encoded ids. Null when unmapped. */
  personId: Uint32Array | null;
  teamId: Uint16Array | null;
  personLabels: string[];
  teamLabels: string[];
  /**
   * Which match, raid or run each row belongs to.
   *
   * A person is only the same *moving thing* within one session, and without
   * this the team viewer cannot know that. Real telemetry is a pile of sessions
   * concatenated, frequently overlapping in wall-clock time — on the test
   * export three consecutive rows belong to three different matches, all
   * within the same minute — so a player's "previous" and "next" samples either
   * side of the playhead are routinely from different matches, hundreds of
   * metres apart. Interpolating between them draws a straight line across the
   * map at implausible speed, and it looks like a rendering fault rather than a
   * question about identity.
   */
  sessionId: Uint32Array | null;
  sessionLabels: string[];
  /** Rows, and the time span covered, per session. Parallel to `sessionLabels`. */
  sessionRows: Uint32Array | null;
  sessionStart: Float32Array | null;
  sessionEnd: Float32Array | null;
  /**
   * person index -> team index, and person index -> position within that team.
   * Resolved once at ingest so the render loop never has to search for it; the
   * team-shade palette is derived entirely from these two.
   */
  personTeam: Uint16Array | null;
  personSlot: Uint16Array | null;
  /** Members per team, parallel to `teamLabels`. */
  teamSizes: Uint32Array | null;

  attrs: AttributeColumn[];

  /**
   * Things the load decided to do differently, in the user's terms.
   *
   * Carried on the dataset rather than reported once and lost, because the
   * consequence outlives the load: a group column dropped for having hundreds of
   * thousands of distinct values explains why the Groups panel is empty an hour
   * later, and "the load said something and I clicked past it" is not an
   * explanation anyone can act on.
   */
  warnings: string[];
  /**
   * `name` and `warnings` as messages: the name the load was given, what the
   * load adds to it ("1,234 rows", "2 files"), and the warnings. They are
   * worked out in the ingest worker, which has no language, so the main thread
   * says them again in the viewer's - when the dataset arrives and whenever the
   * language changes (`sayDataset` in data/msg). Absent on a dataset built
   * without them; its `name` and `warnings` are then what they are.
   */
  said?: { name: Msg | string; notes: Msg[]; warnings: Msg[] };

  bounds: Bounds;
  /** [min, max] of `time`, in seconds. */
  timeRange: [number, number];

  /** True when rows are physically ascending in `time`. Enables the fast path. */
  timeSorted: boolean;
  /** How big one tracked thing is, in world units, where the data said: see `ColumnMapping.entitySize`. */
  entitySize?: number;
  /**
   * The axis mapping the load applied, so a world position can be said again in
   * the data's own frame: the inspection tools show and accept coordinates
   * that way, and a number copied out of the source table lands where the
   * table meant. Absent on a dataset not loaded from files.
   */
  axes?: AxisMapping;
  /**
   * Where the data is on the earth, when the source said (see `GeoReference`).
   * Set only when every file of the load shares one reference.
   */
  geo?: GeoReference;
  /** The source's names for the columns that took a role, for labelling a row the way its file does. */
  roleColumns?: Partial<Record<'x' | 'y' | 'z' | 'time' | 'person' | 'team' | 'session', string>>;
  /**
   * What `time` counts from when it is not wall-clock time: the smallest time
   * in the source, in its seconds. Rebasing onto it keeps float32 precise; adding
   * it back says a row's time the way the file does. Zero or absent when nothing
   * was subtracted, and unused when `epochMs` is set.
   */
  timeOrigin?: number;
}

/**
 * `heat-teams` is a heat mode, not a variant of `team`.
 *
 * The names are close and the things are not. `team` draws one cube per player
 * and plays them back; `heat-teams` is the density field of `heat-simple` with
 * every team given its own hue and overlaps mixing. They share only the column
 * they read.
 */
export type ViewMode = 'heat-simple' | 'heat-difference' | 'heat-teams' | 'heat-lines' | 'team';

/**
 * What decides which side of the difference a row lands on.
 *
 * Difference mode subtracts one population from another, and *which* two
 * populations is the whole question. Splitting by group is the common case, but
 * the interesting comparisons are usually "this attribute value against that one"
 * or "this test run against that one" — so the split is a predicate over any
 * retained column, with groups as one named case of it.
 *
 * Rows matching neither side are dropped rather than counted as zero, so a split
 * over two of five values compares exactly those two.
 */
export type SplitRule =
  /** By group id, using `positiveTeams` / `negativeTeams`. */
  | { kind: 'teams' }
  /** By value sets over a categorical column — one value or several per side. */
  | { kind: 'categories'; column: string; positive: number[]; negative: number[] }
  /** By value ranges over a numeric column. */
  | {
      kind: 'range';
      column: string;
      positive: [number, number];
      negative: [number, number];
    };

/** A live filter predicate evaluated in the vertex shader. */
export type FilterSpec =
  | { kind: 'range'; column: string; min: number; max: number }
  | { kind: 'categories'; column: string; allowed: number[] }
  | { kind: 'teams'; allowed: number[] }
  | { kind: 'persons'; allowed: number[] };

export interface ColorStop {
  /** 0..1 along the ramp. */
  pos: number;
  /** sRGB 0..255. */
  rgb: [number, number, number];
  /** 0..1 */
  alpha: number;
}

export interface HeatColorScheme {
  /** Ramp for positive heat. Index 0 is the zero-heat end. */
  positive: ColorStop[];
  /** Ramp for negative heat (difference mode only). */
  negative: ColorStop[];
}

/** transparent -> red -> yellow -> white, per the spec. */
export const DEFAULT_POSITIVE_RAMP: ColorStop[] = [
  { pos: 0.0, rgb: [0, 0, 0], alpha: 0 },
  { pos: 0.15, rgb: [180, 0, 0], alpha: 0.55 },
  { pos: 0.45, rgb: [255, 40, 0], alpha: 0.85 },
  { pos: 0.72, rgb: [255, 220, 40], alpha: 0.95 },
  { pos: 1.0, rgb: [255, 255, 255], alpha: 1 },
];

/** transparent -> green -> blue -> purple, per the spec. */
export const DEFAULT_NEGATIVE_RAMP: ColorStop[] = [
  { pos: 0.0, rgb: [0, 0, 0], alpha: 0 },
  { pos: 0.15, rgb: [0, 170, 60], alpha: 0.55 },
  { pos: 0.45, rgb: [0, 190, 200], alpha: 0.85 },
  { pos: 0.72, rgb: [40, 80, 255], alpha: 0.95 },
  { pos: 1.0, rgb: [170, 60, 255], alpha: 1 },
];

/** Base hues teams cycle through; each team gets a shade ramp of one hue. */
export const TEAM_HUES = [
  210, // blue
  8, // red
  130, // green
  45, // amber
  280, // violet
  190, // cyan
  330, // magenta
  95, // lime
  20, // orange
  240, // indigo
];
