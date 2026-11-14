/**
 * The insight report: what the built-in detectors found, as plain JSON.
 *
 * Every insight carries its numbers (counts, exposures, the effect with its
 * interval, the test's p and its false-discovery q), the place in world units,
 * the time into the match where one applies and the filters that show it -
 * by names, not by the dataset's category indices - so the report can be
 * saved, compared, and handed as it is to a language model that narrates it
 * (the seam in `seam.ts`). The sentence is a message key with its values: the
 * viewer says it in the viewer's language, a narrator can say it in its own.
 */

export const DETECTORS = ['power', 'zones', 'cover', 'spawn', 'classPlace', 'players', 'flow', 'value'] as const;
export type DetectorId = (typeof DETECTORS)[number];

/** What the effect measures. All are ratios: 1 is "like the rest of the map". */
export type EffectMeasure =
  /** Events per exposure here over the rate elsewhere. */
  | 'rateRatio'
  /** Odds of a kill (of kills + deaths) here over the odds elsewhere. */
  | 'kdOddsRatio'
  /** Share of spawns or crossings against the rest. */
  | 'shareRatio';

export interface InsightEffect {
  measure: EffectMeasure;
  /** Shrunk towards 1 (few events say little): the value ranked by. */
  value: number;
  /** As counted; null when unbounded (nothing expected, or no outcome of the other kind). */
  raw: number | null;
  /** ~95% interval of the raw ratio; null where it is unbounded. */
  lo: number | null;
  hi: number | null;
}

export interface InsightConfidence {
  /** The test's p-value (exact binomial; two-sided unless the detector looks one way). */
  p: number;
  /** Benjamini-Hochberg q over every place or group the detector tried. */
  q: number;
  level: 'high' | 'medium' | 'low';
  /** Tests the q accounts for. */
  tests: number;
  method: string;
}

/** A place in world units (y up), with the volume that holds it. */
export interface InsightPlace {
  x: number;
  y: number;
  z: number;
  /** Ground radius the finding covers. */
  radius: number;
  /** The grid it was found on and that grid's cell size: "to the metre" is a fine cell of 1. */
  grid: 'fine' | 'mid' | 'coarse';
  cell: number;
  /** A route's points (flank routes), in order along it. */
  path?: [number, number, number][];
}

/** A filter by names: category values of a column, teams or players. */
export type InsightFilter =
  | { by: 'category'; column: string; values: string[] }
  | { by: 'team'; values: string[] }
  | { by: 'person'; values: string[] };

export interface InsightSubject {
  team?: string;
  person?: string;
  /** The person's index in the dataset (resolved to `person` on the main thread). */
  personIndex?: number;
  vehicleClass?: string;
  actor?: string;
  eventKind?: string;
  targetClass?: string;
}

export interface Insight {
  /** Stable for the same data and scope: detector, kind and the place or group. */
  id: string;
  detector: DetectorId;
  /** The finding's kind, e.g. `power.kd`, `zones.hot`, `spawn.trap`. Also its message's name. */
  kind: string;
  /** `insights.say.<kind>` with these values; numbers raw (the viewer formats them). */
  sentence: { key: string; params: Record<string, number | string> };
  /** 0..1, the order of the list: the shrunk effect times the evidence (`stats.strengthOf`). */
  strength: number;
  effect: InsightEffect;
  confidence: InsightConfidence;
  /** The counts behind it, named. Exposure is seconds of presence, or samples without time. */
  evidence: Record<string, number | string>;
  place: InsightPlace | null;
  /** Seconds into the match it is about, where it is about a time. */
  time: { from: number; to: number } | null;
  filters: InsightFilter[];
  subject: InsightSubject;
}

export interface DetectorRun {
  id: DetectorId;
  ran: boolean;
  /** Why not, as a message key (`insights.skip.*`). */
  skipped?: string;
  tests: number;
  found: number;
  ms: number;
}

export interface InsightValue {
  column: string;
  total: number;
  rows: number;
  byTeam: Record<string, number>;
  /** The largest by magnitude; `person` is filled in on the main thread. */
  topPlayers: { personIndex: number; person?: string; value: number }[];
}

export interface InsightReport {
  schema: 'heat3d.insights/1';
  dataset: {
    name: string;
    rows: number;
    shownRows: number;
    matches: number;
    persons: number;
    teams: number;
    hasLevel: boolean;
    /** What exposure is counted in. */
    exposure: 'seconds' | 'samples';
  };
  /** The analysis grids on the ground (x, z), world units. */
  grid: { x0: number; z0: number; fine: number; mid: number; coarse: number; nx: number; nz: number };
  /** Totals the rates are measured against. */
  baseline: { presence: number; kills: number; deaths: number; spawns: number; crossings: number };
  /**
   * What was paid, lost and earned (`data/cost.ts`), per value column: the total,
   * by group, and the players who account for the most. Absent without value columns.
   */
  values?: InsightValue[];
  detectors: DetectorRun[];
  insights: Insight[];
  /** Was the false discovery rate controlled at. */
  fdr: number;
  elapsedMs: number;
}
