/**
 * What the behaviour analysis measures (`acc.ts`): the science of crowds,
 * collective motion and decisions under pressure applied to the tracks and
 * events of matches. Every measure carries its own test against a null model
 * (time-shifted tracks, shuffled labels or sequences) and is left out when the
 * data cannot carry it. `q` is the Benjamini-Hochberg false discovery rate over
 * every p-value of one report.
 */

export interface Test {
  /** Two-sided p-value of the measure's own null model; `q` after FDR control. */
  p: number;
  q: number;
}

/** Group alignment (Vicsek's order parameter) and rotation (milling) of a side's moving units. */
export interface OrderMetric extends Test {
  /** Team-periods (one side, one 2 s bin) with three or more units moving. */
  groups: number;
  matches: number;
  /** Mean polarisation |Σu|/n, and the same with each unit's track shifted in time (alignment by chance). */
  polar: number;
  polarNull: number;
  /** 95% interval of polar - polarNull, bootstrapped over matches. */
  lo: number;
  hi: number;
  /** Mean milling |Σ r̂×u|/n. */
  mill: number;
  /** Share of team-periods polarised (P > 0.65), milling (M > 0.65, P < 0.35), swarming (both < 0.35). */
  states: { polarised: number; milling: number; swarm: number };
  /** Mean polarisation in ten phases of the match. */
  phases: number[];
  /** Fights (20 s windows with kills) where one side was more aligned than the other: its share of the kills. */
  outcome: { windows: number; kills: number; share: number; p: number } | null;
}

/** Route choices copied from the teammate who passed the same place shortly before. */
export interface HerdingMetric extends Test {
  /** Passes with a teammate's pass through the same place within the window before. */
  pairs: number;
  /** Same exit as that teammate: observed, expected from the place's own exit shares. */
  same: number;
  expected: number;
  /** observed / expected, with its 95% interval. */
  index: number;
  lo: number;
  hi: number;
  /** The same index against the enemy's earlier passes (the flow of the moment, a common goal). */
  enemyIndex: number | null;
  /** index / enemyIndex: copying a teammate beyond copying anyone; the tested effect when enemies passed too. */
  relative: number | null;
  places: number;
  windowSecs: number;
}

/** Lanes in counter-flow and trails reused across matches. */
export interface LanesMetric extends Test {
  /** Places with enough movement both ways along their main axis. */
  cells: number;
  /** Mean lateral segregation of the two directions (0 mixed, 1 separate lanes) and by chance. */
  segregation: number;
  segregationNull: number;
  /** Share of movement on the busiest 10% of the ground moved over, and its Gini. */
  trailTop10: number;
  gini: number;
  /** Mean overlap (Jaccard) of the matches' busiest ground, and of random ground of the same size. */
  persistence: number | null;
  persistenceNull: number | null;
}

/** Speed and flow against local density; deaths in crowds; effort per head as groups grow. */
export interface CrowdingMetric extends Test {
  samples: number;
  /** Radius neighbours are counted in, metres. */
  radius: number;
  /** Per neighbour count 0..5+: mean speed relative to the unit's own median, and flow (count+1)·speed. */
  speed: number[];
  flow: number[];
  /** Spearman's ρ of neighbours and relative speed, overall and on the busiest ground (the chokes). */
  rho: number;
  rhoChoke: number | null;
  /** 1 - flow at the densest class / the peak flow: the faster-is-slower capacity drop. */
  drop: number;
  /** Deaths per hour among 3+ neighbours against 0-1 neighbours. */
  deathRR: number | null;
  deathLo: number | null;
  deathHi: number | null;
  deathP: number | null;
  /** Fire events a unit-minute by teammates nearby 0, 1-2, 3+ (social loafing: effort per head falls as groups grow). */
  effort: number[] | null;
  effortRho: number | null;
  effortP: number | null;
}

/** Who turns first and who follows: time-lagged correlation of headings (Nagy et al. 2010). */
export interface LeadersMetric extends Test {
  /** Teammate pairs that travelled together, and those with a clear leader. */
  pairs: number;
  led: number;
  /** Null threshold of the best lagged correlation (95th percentile of time-shifted pairs). */
  threshold: number;
  /** Median lead time, seconds. */
  lagSecs: number;
  /** Triads with all three pairs led, and the share that are transitive (a > b > c and a > c; 0.75 by chance). */
  triads: number;
  transitive: number | null;
  /** Leaders' deaths and kills an hour against followers'. */
  deathRR: number | null;
  killRR: number | null;
  outcomeP: number | null;
}

/** Units far from any teammate (stragglers) against those with the group. */
export interface CohesionMetric extends Test {
  samples: number;
  /** Median distance to the nearest teammate, metres. */
  spacing: number;
  /** Share of unit time spent straggling (beyond three times the side's typical spacing). */
  stragglerShare: number;
  deathRR: number;
  lo: number;
  hi: number;
  /** Spearman's ρ of a side's mean spacing in a 20 s window and its share of that window's kills. */
  outcomeRho: number | null;
  outcomeP: number | null;
}

/** How a side moves as its recent losses mount: closing, holding, withdrawing. */
export interface BreakingMetric extends Test {
  windows: number;
  /** Loss bins: share of the side lost in the last 60 s, lower edges. */
  edges: number[];
  /** Mean approach speed towards the enemy per bin (in the side's own pace; negative withdraws), with 95% intervals. */
  approach: (number | null)[];
  lo: (number | null)[];
  hi: (number | null)[];
  n: number[];
  /** The lowest loss share at which sides withdraw significantly faster than a tenth of their pace; null when they never do. */
  breakAt: number | null;
  rho: number;
}

/** Risk taken in the life after one that ended in a loss, against after a win (prospect theory). */
export interface RiskMetric extends Test {
  pairs: number;
  /**
   * Mean share of time spent ahead of one's own side's centroid towards the enemy, above the side's own
   * share ahead at the same moments: after a life lost without a kill, after one with a kill.
   */
  afterLoss: number;
  afterWin: number;
  lo: number;
  hi: number;
  /** Early death (within 30 s of starting) after an early death against after none: tilt. */
  tilt: { after: number; otherwise: number; p: number; pairs: number } | null;
}

export interface StreakK {
  k: number;
  players: number;
  /** Mean over players of P(kill | k kills before) - P(kill | k deaths before). */
  diff: number;
  /** Its mean when each player's own sequence is shuffled: the finite-sequence bias. */
  bias: number;
  corrected: number;
  p: number;
}

/** Hot hand: kills following kills, tested against shuffled sequences (Miller and Sanjurjo 2018). */
export interface StreakMetric extends Test {
  outcomes: number;
  ks: StreakK[];
}

/** Buy or loadout agreement within a side's round (Fleiss' kappa) against shuffled rounds. */
export interface BuyMetric extends Test {
  rounds: number;
  kappa: number;
  kappaNull: number;
  /** Share of side-rounds where everyone bought alike, and by chance. */
  unanimous: number;
  unanimousNull: number;
  /** Category shares: eco, force, full. */
  shares: number[];
}

/** How units move and fire in the seconds after taking non-lethal damage, against their own other moments. */
export interface SuppressionMetric extends Test {
  events: number;
  /** Change of speed (relative to the unit's median) from before to after: hit, control. */
  speedHit: number;
  speedControl: number;
  lo: number;
  hi: number;
  /** Change of own fire events a minute: hit, control, and its p. */
  fireHit: number | null;
  fireControl: number | null;
  fireP: number | null;
}

export interface BehaviourMetrics {
  schema: 'heat3d.behaviour/1';
  matches: number;
  tracks: number;
  /** Seconds a movement bin spans; the typical nearest-teammate distance in metres. */
  binSecs: number;
  spacing: number | null;
  /** True when the tracks were too many and only part of the matches were followed. */
  sampled: boolean;
  order?: OrderMetric;
  herding?: HerdingMetric;
  lanes?: LanesMetric;
  crowding?: CrowdingMetric;
  leaders?: LeadersMetric;
  cohesion?: CohesionMetric;
  breaking?: BreakingMetric;
  risk?: RiskMetric;
  streaks?: StreakMetric;
  buy?: BuyMetric;
  suppression?: SuppressionMetric;
}
