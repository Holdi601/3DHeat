/**
 * The movement analysis (docs/maneuver.md): how the units of a side move as
 * groups, and the tactical and operational maneuvers those groups make -
 * found from tracks and events alone, each with its confidence, the numbers
 * behind it, whether it paid off, and its parallels in the knowledge base.
 *
 * Plain JSON like the insight report, in world units (y up), times in
 * seconds into the match. Kept free of the viewer's imports: the insight
 * worker and the summary builder both run it.
 */

/** What kind of unit a track is: the movement analysis groups like with like. */
export const DOMAINS = ['air', 'ground', 'sea', 'infantry'] as const;
export type DomainId = (typeof DOMAINS)[number];
export const AIR = 0;
export const GROUND = 1;
export const SEA = 2;
export const INF = 3;

/** VEHICLE_CLASSES index -> domain (-1 not a unit: weapons, decoys, structures, other). Kept out of the canonical imports. */
export const CLASS_DOMAIN = [AIR, AIR, AIR, AIR, AIR, GROUND, GROUND, GROUND, GROUND, GROUND, SEA, SEA, INF, -1, -1, -1, -1] as const;
/** VEHICLE_CLASSES indices the detectors name. */
export const CLS_SPAA = 7;

/** Events the analysis reads. */
export type EvKind = 'kill' | 'death' | 'fire' | 'launch' | 'hit' | 'capture';

/** One unit's life track as collected: times ascending. */
export interface UnitTrack {
  /** The person (dataset) or unit (summary) index; stable within the match. */
  id: number;
  team: number;
  dom: number;
  /** VEHICLE_CLASSES index, -1 unknown. */
  cls: number;
  t: Float64Array;
  x: Float32Array;
  y: Float32Array;
  z: Float32Array;
}

export interface MEvent {
  t: number;
  kind: EvKind;
  /** The doer (shooter, killer) and the unit the row is about, track ids; -1 unknown. */
  unit: number;
  team: number;
  x: number;
  y: number;
  z: number;
  /** The target's class where the row names it (VEHICLE_CLASSES index), else -1. */
  tcls: number;
}

/** A match's tracks and events, ready for the analysis. */
export interface MatchTracks {
  /** Session (match) index in the dataset; -1 for a file of one match. */
  session: number;
  /** Seconds of the match's start (data time), subtracted from every time reported. */
  t0: number;
  /** World units a metre. */
  upm: number;
  teams: number;
  units: UnitTrack[];
  events: MEvent[];
  /** Engagement range by domain (world units) to use instead of measuring it: a null model keeps its match's. */
  ranges?: number[];
}

export const MANEUVER_KINDS = [
  // Land and general
  'formation',
  'frontalAssault',
  'flank',
  'pincer',
  'encirclement',
  'penetration',
  'bounding',
  'concentration',
  'dispersion',
  'feint',
  'withdrawal',
  'pursuit',
  'defenceInDepth',
  'reverseSlope',
  'ambush',
  'screen',
  'interiorLines',
  'tempo',
  // Air
  'crank',
  'notch',
  'drag',
  'pump',
  'airPincer',
  'wall',
  'leadTrail',
  'grinder',
  'cap',
  'energyFight',
  'anglesFight',
  'strikePackage',
  'sead',
  // Sea
  'lineOfBattle',
  'crossingT',
] as const;
export type ManeuverKind = (typeof MANEUVER_KINDS)[number];

export type FormationShape = 'line' | 'column' | 'wedge' | 'echelon' | 'box' | 'cluster';

/** Did it pay off: what happened to both sides while it ran and just after. */
export interface ManeuverOutcome {
  /** Kills by the maneuvering units, and their own losses, in the window. */
  kills: number;
  losses: number;
  /** Objectives taken by its side in the window. */
  captures: number;
  /** Kills per loss here (losses 0: kills + 1), and its side's over the whole match. */
  exchange: number;
  baseline: number;
  /** Seconds it took. */
  secs: number;
  /** 1 paid off, 0 did not, null cannot tell (nothing happened). */
  paid: 0 | 1 | null;
}

export interface Maneuver {
  /** Stable within the match: kind, side and start. */
  id: string;
  kind: ManeuverKind;
  domain: DomainId;
  /** A variant within the kind: the formation's shape, `rear` for a flank from behind, `rout` for a withdrawal under heavy loss. */
  variant?: string;
  team: number;
  /** The side it was made against; -1 none. */
  against: number;
  /** Seconds into the match. */
  t0: number;
  t1: number;
  /** 0..1, and its level (high >= 0.75, medium >= 0.5). */
  confidence: number;
  level: 'high' | 'medium' | 'low';
  /** Track ids of the units that made it. */
  units: number[];
  /** Where (the key moment), world units. */
  place: { x: number; y: number; z: number; radius: number };
  /** The movement arrows: each a path of points (a group's centroid along its way). */
  paths: [number, number, number][][];
  /** Outlines of the groups at the key moment (closed rings, ground x, z). */
  outlines: [number, number][][];
  /** The enemy's front at the key moment (a segment, ground x, z), where the kind has one. */
  front?: [[number, number], [number, number]];
  evidence: Record<string, number | string>;
  outcome: ManeuverOutcome;
  /** Pattern ids of the knowledge base it shows, with weight; and the entries that speak to it. */
  patterns: Record<string, number>;
  kb: string[];
}

/** A group as found: who moved together, how long, in what shape. */
export interface GroupInfo {
  id: number;
  team: number;
  domain: DomainId;
  units: number;
  t0: number;
  t1: number;
  formation: FormationShape;
  /** Mean speed, world units a second; distance covered. */
  speed: number;
  distance: number;
}

export interface ManeuverMatch {
  session: number;
  /** Data seconds the match's times count from. */
  start: number;
  duration: number;
  /** Engagement range by domain as measured (world units), the scale everything is judged at. */
  range: Partial<Record<DomainId, number>>;
  /** Seconds a step of the common timeline. */
  step: number;
  groups: GroupInfo[];
  maneuvers: Maneuver[];
  /** Milliseconds the analysis took, and by part (setup: timeline, groups, contacts). */
  ms: number;
  timings?: Record<string, number>;
}

export interface ManeuverReport {
  schema: 'heat3d.maneuvers/1';
  matches: ManeuverMatch[];
  /** Units and tracks analysed, and what was left out. */
  units: number;
  elapsedMs: number;
}
