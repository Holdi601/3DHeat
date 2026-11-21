/**
 * The mass index (docs/mass-analysis.md): one compact summary per match,
 * written once - into its `.3dheat` container as the `summary` role by
 * `tools/3dheat-summarize.mjs`, or worked out in a worker for a file without
 * one and kept in the browser's cache - so a thousand or ten thousand matches
 * are analysed without reading a row of their tables.
 *
 * Plain JSON: what the match was (game, map, mode, date, length, teams,
 * result), what each vehicle, team, player and weapon did in it (the
 * canonical events of `data/canonical.ts`, presence, earnings and losses,
 * wins), when things happened (match phases), and where (a sparse grid on
 * the ground, power-of-two cells, so the grids of many matches add up).
 */

import type { ManeuverSection } from '../insights/maneuver/summary';
import type { BehaviourMetrics } from '../insights/behaviour/types';
import type { CqbCounts } from '../insights/cqb/finish';
import type { MarkCounts } from './marks';
import type { MovesSection } from '../outcome/types';

/** The member's `format` and its version: a reader takes its own major, a newer one is worked out again. */
export const SUMMARY_FORMAT = '3dheat-summary';
export const SUMMARY_VERSION = 2;
/** The container role and member name (`<match>.summary.json`). */
export const SUMMARY_ROLE = 'summary';

/** Fine grid cells across a match's ground at most (the robust extent; strays lie outside it). */
export const GRID_CELLS = 128;
/** Bins of a match's length the phase histograms take. */
export const PHASE_BINS = 20;
/** Seconds a minute bin is, and how many there are (the last takes the rest). */
export const MINUTE_SECONDS = 60;
export const MINUTE_BINS = 60;
/** Most seconds between two samples of a unit that still count as presence. */
export const PRESENCE_GAP = 10;
/** Teams kept apart; more fall into the last slot. */
export const MAX_TEAMS = 8;
/** Weapons and players kept per match, the busiest first. */
export const MAX_WEAPONS = 60;
export const MAX_PLAYERS = 400;

/** The canonical events the grids and phases count (`EVENT_KINDS` names). */
export const GRID_KINDS = ['kill', 'death', 'hit', 'launch', 'fire', 'damage', 'spawn', 'capture', 'crash', 'destroyed', 'explosion', 'miss', 'eject', 'takeoff', 'landing'] as const;
/**
 * Height bands, metres above the match's floor (its lowest presence, 1st
 * percentile): the ground, low, and the air layers. A file with a floor or
 * storey column bands by it instead (band = the floor, 0..7).
 */
export const HEIGHT_EDGES = [3, 10, 30, 100, 300, 1000, 3000] as const;
export const BANDS = HEIGHT_EDGES.length + 1;
/** The time slices' cells are this many fine cells a side. */
export const SLICE_CELLS = 8;

/** Event counts by canonical kind (`position` and `other` left out), only those that happened. */
export type EventCounts = Record<string, number>;

export interface TeamStat {
  name: string;
  units: number;
  players: number;
  presence: number;
  kills: number;
  deaths: number;
  /** Fraction of its units' rows that say won; null when the data says nothing. */
  won: number | null;
  /** Per economy column, the sum (aligned with `economy.columns`). */
  val: number[];
  /** Rounds won and rounds with a known result (a match-based game: 1 round); absent without a result column. */
  rounds?: [number, number];
}

export interface VehicleStat {
  /** The source's own name (`Vehicle`, Tacview `Name`); `''` where the data names none. */
  key: string;
  /** Its display name where the source has one. */
  label: string;
  /** `VEHICLE_CLASSES` name. */
  cls: string;
  /** Team slot (index into `teams`; `teams.length` for none). */
  team: number;
  /** Battle rating, tier or era where a column says it. */
  tier: string | null;
  /** Lives (tracks) of it, and those a player drove. */
  units: number;
  players: number;
  presence: number;
  ev: EventCounts;
  /** Kills by the target's class. */
  vs: Record<string, number>;
  /** Wins: the sum of its units' won fractions over the units with one. */
  winSum: number;
  winN: number;
  /** Rounds won and played with a known result, a life (unit) and round each. */
  rw?: [number, number];
  val: number[];
}

export interface PlayerStat {
  /** User id where the source has one, else the name. */
  id: string;
  name: string;
  team: number;
  units: number;
  presence: number;
  kills: number;
  deaths: number;
  hits: number;
  launches: number;
  won: number | null;
  /** Rounds won and played with a known result. */
  rw?: [number, number];
  /** Vehicle keys, most driven first (up to 5). */
  vehicles: string[];
}

export interface WeaponStat {
  name: string;
  ev: EventCounts;
  /** Rounds a side used it in (fired, hit or killed with it) and won, and those with a known result. */
  rw?: [number, number];
}

/** Numbers a unit-round takes in `OutcomeSection.u`. */
export const UR_STRIDE = 7;

/**
 * Who won each round, and every life's round with what it was and did
 * (docs/mass-analysis.md, outcome): what the rounds niches (`niche.ts`) read.
 * Absent in summaries before version 2 and without a result column.
 */
export interface OutcomeSection {
  /** Names the unit-rounds point into. */
  vehicles: string[];
  weapons: string[];
  places: string[];
  /** Per round, flat `[round number, winner slot (-1 unknown), slot that made the first kill (-1 none)]`. */
  r: number[];
  /**
   * Unit-rounds with a known result, flat by `UR_STRIDE`: `[round (index into r), team slot,
   * vehicle (-1), weapon used most (-1), place held longest (-1), buy (0 eco, 1 force or pistol,
   * 2 full; -1 unknown), won (0, 1)]`.
   */
  u: number[];
}

/**
 * Where things happened, on the ground (world x, z after the file's axes, as
 * the viewer places it): cell `ix, iz` covers `[ix*cell, (ix+1)*cell)`.
 *
 * The finest level of a pyramid: cells are aligned powers of two, so the
 * level `2^k` coarser is the cells summed by `ix >> k, iz >> k` - exactly,
 * for this match and across matches of other cell sizes - and any region
 * (a box, a corridor, a ring) is a sum of cells. Every count has its
 * exposure beside it (presence seconds by team, by class and by height band),
 * so rates and expectations can be worked out for a region of any shape.
 * Stage B's scan statistics work from these (docs/mass-analysis.md).
 */
export interface SummaryGrid {
  /** World units a cell; a power of two, so grids of other matches coarsen onto it exactly. */
  cell: number;
  ix: number[];
  iz: number[];
  /** Seconds of presence (all units), and per team slot (flat, `[i * (teams + 1) + t]`, the last slot no team's). */
  p: number[];
  pt: number[];
  /** Presence by vehicle class: flat `[cell index, class, seconds]`. */
  pc: number[];
  /** Presence by height band (`HEIGHT_EDGES`, or floors): flat `[cell index, band, seconds]`. */
  ph: number[];
  /** Mean height of the presence, and the lowest seen (the cell's floor, for height above it). */
  y: number[];
  y0: number[];
  /** Direction of travel: unit vector times seconds, summed. */
  fx: number[];
  fz: number[];
  /** Events, flat tuples `[cell index, kind (GRID_KINDS), team slot, class (VEHICLE_CLASSES), band, count]`. */
  e: number[];
  /**
   * Rounds each side was in a cell (a second or more), by result: flat `[cell index, team slot,
   * rounds won, rounds lost]`. Only with a result column and two rounds or more; summed over cells,
   * a round in several counts in each (the scan measures that dispersion).
   */
  pw?: number[];
  /** What the bands are: heights above the match floor (world `floor`) or the data's floors. */
  bands: { by: 'height' | 'floor'; floor: number; unitsPerMetre: number };
  /**
   * Time slices at a coarse level (`cell * SLICE_CELLS`), by the minute from
   * the match's start: flat `[cx, cz, minute, kind, value]`, kind a
   * `GRID_KINDS` index or `GRID_KINDS.length` for presence seconds. Match
   * phases (fractions of its length) are minutes over `duration`.
   */
  ts: { cell: number; minute: number; v: number[] };
  /**
   * Where each side was, when (`outcome/types.ts`): every life's path, the deaths, the objectives' captures,
   * for the outcome analysis. Absent in summaries written before it (the analysis works those out again).
   */
  mv?: MovesSection;
}

export interface MatchSummary {
  format: typeof SUMMARY_FORMAT;
  version: number;
  id: string;
  game: string | null;
  map: string | null;
  mode: string | null;
  /** The mission or scenario (a DCS server's campaign). */
  mission: string | null;
  /** ISO date-time the match started, where known. */
  started: string | null;
  /** Seconds. */
  duration: number;
  rows: number;
  units: number;
  players: number;
  ai: number;
  teams: TeamStat[];
  winner: string | null;
  events: EventCounts;
  vehicles: VehicleStat[];
  playerStats: PlayerStat[];
  weapons: WeaponStat[];
  economy: { columns: { name: string; currency: string; flow: string; total: number }[] };
  phases: { bins: number; kinds: Record<string, number[]>; minute: number; minutes: Record<string, number[]> };
  /** The robust extent of presence `[minX, minZ, maxX, maxZ]`, world units. */
  extent: [number, number, number, number] | null;
  /** The taxonomies the grid's indices refer to. */
  kinds: string[];
  classes: string[];
  grid: SummaryGrid | null;
  /**
   * The movement analysis' counts (`insights/maneuver/summary.ts`): per kind and side, the
   * maneuvers made at medium confidence or more, how many paid off and not, kills and losses.
   * Absent in summaries written before it; null where it could not run.
   */
  maneuvers?: ManeuverSection | null;
  /**
   * The behaviour analysis (`insights/behaviour`): crowd, flocking, herding, cohesion, morale, risk,
   * streak, buy and suppression measures of this match, each with its own null model, p and q.
   */
  behaviour?: BehaviourMetrics | null;
  /**
   * Close-quarters counts (`insights/cqb/finish.ts` CqbCounts), additive over matches: opening
   * duels, trades, peeker against holder, crossfires, flashed entries, aim, man advantage,
   * plants and the most entered places' entries and deaths. Null without a round column.
   */
  cqb?: CqbCounts | null;
  /** Marks on the level per surface (`marks.ts`), additive over matches; null without. */
  marks?: MarkCounts | null;
  /** Rounds and their results, unit by unit (version 2 on); null without a result column. */
  outcome?: OutcomeSection | null;
  built: { by: string; at: string; ms: number };
}

/** A summary without its grid: what the panel holds for every match. */
export type SummaryHead = Omit<MatchSummary, 'grid'> & { grid?: null };

/** Where a summary came from, for the cache and the drill-down. */
export interface IndexEntry {
  /** The file's path as picked (folder-relative), its size and modification time. */
  path: string;
  size: number;
  mtime: number;
  head: SummaryHead;
}
