/**
 * The outcome analysis' tests (docs/outcome-analysis.md): for every feature
 * of every side of every map (`features.ts`), the side's win rate with it and
 * without it, and whether that difference is worth saying.
 *
 * - Each arm's win rate with its Wilson interval, the difference with
 *   Newcombe's; the p of the Cochran-Mantel-Haenszel test within strata of
 *   the players' strength (their win rate in the other matches) and of the
 *   score when the feature happens, so a pattern of stronger players or of a
 *   side already ahead is not taken for one that wins; the difference after
 *   allowing for them (Mantel-Haenszel risk difference).
 * - Benjamini-Hochberg over every test of the run (`fdr`).
 * - A minimum of side-rounds in each arm; a feature nearly always or never
 *   there is not tested (it cannot be told from the side itself).
 * - Consistency: the same direction in N of M periods (the matches cut by
 *   date into `FOLDS`) and for N of M regular players, so one group's habit
 *   is not taken for a winning pattern.
 * - "Likely a consequence": a feature that shows mostly where the side was
 *   already ahead, and whose difference mostly goes away once the score is
 *   allowed for, is said as such.
 *
 * Correlation, not proof: the docs say what this can and cannot tell.
 */

import { bhAdjust, wilson } from '../insights/stats';
import { newcombe, zTwoSided } from '../insights/cqb/model';
import { buildGroup, ROUTE_POINTS, zoneKey, type FeatureDef, type FeatureKind, type OutcomeGroup, type OutcomeMatch, type SideRound } from './features';

export interface OutcomeOptions {
  /** Side-rounds each arm needs. */
  minArm: number;
  /** False discovery rate. */
  fdr: number;
  /** Smallest difference in win rate worth saying. */
  minDiff: number;
}

export const DEFAULT_OPTIONS: OutcomeOptions = { minArm: 20, fdr: 0.05, minDiff: 0.05 };

/** Kinds where one side's having it in a round is the other's not having it. */
const MIRRORED = new Set<FeatureKind>(['firstKill', 'capFirst']);

/** Periods the matches are cut into by date for the consistency check. */
export const FOLDS = 5;
/** Side-rounds a player needs on a side of a map to count as a regular there. */
const REGULAR = 10;
/** Prior strength (side-rounds at 50%) of a player's win rate. */
const PLAYER_PRIOR = 10;
/** Kinds that only one side of a pair is tested for (the other is its mirror). */
const KINDS: FeatureKind[] = ['hold', 'route', 'firstKill', 'firstKillAt', 'earlyContact', 'fight', 'grouped', 'fast', 'retreat', 'capFirst', 'capFast', 'capZone', 'cls', 'clsMore'];

export interface Arm {
  k: number;
  n: number;
  rate: number;
  lo: number;
  hi: number;
}

/** Where a zone lies for a side: from its own spawn to the other's (depth), and to its left or right on the way. */
export interface ZoneWhere {
  depth: 'own' | 'mid' | 'enemy';
  lateral: 'left' | 'centre' | 'right';
  /** A callout or objective name (`@` before an objective's), where known. */
  place: string | null;
  x0: number;
  z0: number;
  x1: number;
  z1: number;
  y: number;
}

export interface OutcomeFinding {
  id: string;
  group: string;
  side: number;
  sideName: string;
  /** How the side is named: the data's team, an end of the map (A, B), the place it starts at. */
  sideBy: 'team' | 'spawn' | 'place';
  kind: FeatureKind;
  feature: FeatureDef;
  with: Arm;
  without: Arm;
  diff: number;
  lo: number;
  hi: number;
  /** The difference allowed for the players' strength and the score at the time (Mantel-Haenszel). */
  adjDiff: number;
  /** The difference allowed for the players' strength alone; NaN where no player is known. */
  strengthDiff: number;
  p: number;
  q: number;
  /** Same direction in `[a]` of `[b]` periods, and for `[a]` of `[b]` regular players. */
  folds: [number, number];
  players: [number, number];
  /** Shares of each arm's side-rounds that were ahead when the feature happened. */
  aheadWith: number;
  aheadWithout: number;
  consequence: boolean;
  /** Most of the difference goes away once the players' strength is allowed for. */
  strengthExplained: boolean;
  stable: boolean;
  score: number;
  /** Findings folded into this one: the same pattern in a neighbouring zone or window, the same way. */
  near: number;
  /** Seconds the window spans (from, to), where the feature has one. */
  window: [number, number] | null;
  zone: ZoneWhere | null;
  /** A route's mean path (world x, z), and whether it runs off the main routes. */
  path: number[] | null;
  flank: boolean;
  /** Where a route ends, as its side sees it. */
  routeEnd: ZoneWhere | null;
  point: [number, number] | null;
  /** The matches (callers' indices) with it, and example side-rounds won and lost. */
  matches: number[];
  examples: { match: number; round: number; at: number; t0: number; won: number }[];
}

export interface GroupSummary {
  key: string;
  sides: string[];
  sidesBy: 'team' | 'spawn' | 'place';
  matches: number;
  rounds: number;
  /** Each side's side-rounds won and played. */
  wins: Arm[];
  zone: number;
  b: number;
  windows: [number, number][];
  median: number;
  spawns: [number, number][];
  objectives: { name: string; x: number; z: number }[];
  tests: number;
}

export interface OutcomeReport {
  groups: GroupSummary[];
  findings: OutcomeFinding[];
  tests: number;
  /** Why candidate patterns were not said, counted. */
  dropped: Record<string, number>;
  ms: number;
  options: OutcomeOptions;
}

const armOf = (k: number, n: number): Arm => {
  const [lo, hi] = wilson(k, n);
  return { k, n, rate: n ? k / n : NaN, lo, hi };
};

interface Cell {
  a: number;
  b: number;
  c: number;
  d: number;
}

/** Cochran-Mantel-Haenszel over the strata: p (continuity-corrected) and the Mantel-Haenszel risk difference. */
export function cmh(cells: Iterable<Cell>): { p: number; rd: number } {
  let num = 0, varSum = 0, rdN = 0, rdD = 0;
  for (const s of cells) {
    const n = s.a + s.b + s.c + s.d;
    const n1 = s.a + s.b;
    const n0 = s.c + s.d;
    if (n < 2 || !n1 || !n0) continue;
    const m1 = s.a + s.c;
    const m0 = s.b + s.d;
    num += s.a - (n1 * m1) / n;
    varSum += (n1 * n0 * m1 * m0) / (n * n * (n - 1));
    rdN += (s.a * n0 - s.c * n1) / n;
    rdD += (n1 * n0) / n;
  }
  if (!(varSum > 0)) return { p: 1, rd: rdD > 0 ? rdN / rdD : NaN };
  const chi = Math.max(0, Math.abs(num) - 0.5) ** 2 / varSum;
  return { p: zTwoSided(Math.sqrt(chi)), rd: rdD > 0 ? rdN / rdD : NaN };
}

/** Each side-round's players' strength: their shrunk win rate in the run's other matches (NaN with none known). */
function strengths(groups: OutcomeGroup[]): Map<SideRound, number> {
  const tot = new Map<string, [number, number]>();
  const perMatch = new Map<string, [number, number]>();
  for (const g of groups) for (const r of g.rounds) for (const p of r.players) {
    const name = g.players[p];
    const t = tot.get(name) ?? [0, 0];
    t[0] += r.won;
    t[1]++;
    tot.set(name, t);
    const key = `${name}\u0001${r.match}`;
    const m = perMatch.get(key) ?? [0, 0];
    m[0] += r.won;
    m[1]++;
    perMatch.set(key, m);
  }
  const out = new Map<SideRound, number>();
  for (const g of groups) for (const r of g.rounds) {
    let s = 0, n = 0;
    for (const p of r.players) {
      const name = g.players[p];
      const t = tot.get(name)!;
      const m = perMatch.get(`${name}\u0001${r.match}`)!;
      const games = t[1] - m[1];
      if (games < 3) continue;
      s += (t[0] - m[0] + PLAYER_PRIOR * 0.5) / (games + PLAYER_PRIOR);
      n++;
    }
    out.set(r, n ? s / n : NaN);
  }
  return out;
}

/** A zone as a side sees it. */
export function zoneWhere(g: OutcomeGroup, side: number, z: number): ZoneWhere {
  const zn = g.zones[z];
  const x = (zn.ix + 0.5) * g.zone;
  const zz = (zn.iz + 0.5) * g.zone;
  const [sx, sz] = g.spawns[side];
  const [ex, ez] = g.spawns[1 - side];
  const dx = ex - sx, dz = ez - sz;
  const l2 = dx * dx + dz * dz || 1;
  const u = ((x - sx) * dx + (zz - sz) * dz) / l2;
  const v = (dx * (zz - sz) - dz * (x - sx)) / l2;
  return {
    depth: u < 0.35 ? 'own' : u > 0.65 ? 'enemy' : 'mid',
    lateral: v < -0.15 ? 'left' : v > 0.15 ? 'right' : 'centre',
    place: zn.place,
    x0: zn.ix * g.zone,
    z0: zn.iz * g.zone,
    x1: (zn.ix + 1) * g.zone,
    z1: (zn.iz + 1) * g.zone,
    y: zn.y,
  };
}

/** The zone a route ends in. */
function endOf(g: OutcomeGroup, side: number, path: number[]): ZoneWhere | null {
  const n = ROUTE_POINTS - 1;
  const z = g.zoneIndex.get(zoneKey(g.zone, path[n * 2], path[n * 2 + 1]));
  return z === undefined ? null : zoneWhere(g, side, z);
}

/** Whether a side-round could have had the feature: a window's features only where the round lasted into it. */
function eligible(g: OutcomeGroup, f: FeatureDef, r: SideRound): boolean {
  if (r.side !== f.side) return false;
  if (f.window !== undefined) return r.len >= g.windows[f.window][0] + g.b / 2;
  return true;
}

/** The window a feature's score is read at: the one starting at its time. */
const windowAt = (g: OutcomeGroup, at: number) => {
  let w = 0;
  for (let i = 0; i < g.windows.length; i++) if (g.windows[i][0] <= at) w = i;
  return w;
};

/**
 * The run: the groups (one map, mode and mission each) built from their
 * matches, every feature tested, the findings that pass, ranked.
 * `progress` is told after each group; `cancelled` is asked between groups.
 */
export async function analyseOutcome(
  input: { key: string; matches: OutcomeMatch[] }[],
  options: Partial<OutcomeOptions> = {},
  hooks: { progress?: (done: number, total: number) => void; cancelled?: () => boolean; yieldEvery?: () => Promise<void> } = {},
): Promise<{ report: OutcomeReport; groups: OutcomeGroup[] }> {
  const t0 = performance.now();
  const o: OutcomeOptions = { ...DEFAULT_OPTIONS, ...options };
  const groups: OutcomeGroup[] = [];
  let done = 0;
  for (const it of input) {
    if (hooks.cancelled?.()) throw new Error('cancelled');
    const g = buildGroup(it.key, it.matches);
    // The moves are read: let them go.
    it.matches = [];
    if (g) groups.push(g);
    hooks.progress?.(++done, input.length);
    await hooks.yieldEvery?.();
  }
  const strength = strengths(groups);
  const dropped: Record<string, number> = {};
  const drop = (why: string) => (dropped[why] = (dropped[why] ?? 0) + 1);
  const pvals: number[] = [];
  const pending: Omit<OutcomeFinding, 'q' | 'score' | 'stable' | 'near'>[] = [];
  const summaries: GroupSummary[] = [];
  for (const g of groups) {
    // Strength terciles per side.
    const terc = new Map<SideRound, number>();
    for (let s = 0; s < 2; s++) {
      const v = g.rounds.filter((r) => r.side === s).map((r) => strength.get(r)!).filter(Number.isFinite).sort((a, b) => a - b);
      const c1 = v[Math.floor(v.length / 3)];
      const c2 = v[Math.floor((2 * v.length) / 3)];
      for (const r of g.rounds) if (r.side === s) {
        const x = strength.get(r)!;
        terc.set(r, !Number.isFinite(x) || v.length < 30 ? 3 : x < c1 ? 0 : x < c2 ? 1 : 2);
      }
    }
    // Folds by date: each match's period.
    const order = g.matches.map((m, i) => [m.started ?? i, i] as const).sort((a, b) => a[0] - b[0]);
    const foldOf = new Int32Array(g.matches.length);
    order.forEach(([, i], rank) => (foldOf[i] = Math.min(FOLDS - 1, Math.floor((rank * FOLDS) / order.length))));
    const wins = [0, 1].map((s) => {
      const rs = g.rounds.filter((r) => r.side === s);
      return armOf(rs.reduce((a, r) => a + r.won, 0), rs.length);
    });
    let tests = 0;
    for (const f of g.features) {
      if (!KINDS.includes(f.kind)) continue;
      const rows = g.rounds.filter((r) => eligible(g, f, r));
      const has = rows.map((r) => r.feats.has(f.id));
      const n1 = has.filter(Boolean).length;
      const n0 = rows.length - n1;
      if (n1 < o.minArm || n0 < o.minArm) {
        drop('small');
        continue;
      }
      if (n1 / rows.length < 0.05 || n1 / rows.length > 0.95) {
        drop('noContrast');
        continue;
      }
      tests++;
      let k1 = 0, k0 = 0;
      const wi = windowAt(g, f.at);
      const strata = new Map<number, Cell>();
      const sOnly = new Map<number, Cell>();
      let ahead1 = 0, ahead0 = 0;
      const fold = Array.from({ length: FOLDS }, () => [0, 0, 0, 0]);
      const per = new Map<number, number[]>();
      rows.forEach((r, i) => {
        const h = has[i];
        if (h) k1 += r.won;
        else k0 += r.won;
        const lead = f.at > 0 ? Math.sign(r.killLead[wi] + 2 * r.objLead[wi]) : 0;
        if (lead > 0) h ? ahead1++ : ahead0++;
        const tc = terc.get(r) ?? 3;
        // The data's team as a stratum too: where sides are ends of the map, a team that wins more often anyway
        // (players against bots, say) would make whatever it does look like winning.
        const key = ((r.team * 4 + tc) * 3) + (lead + 1);
        for (const [m, k] of [[strata, key], [sOnly, r.team * 4 + tc]] as const) {
          const c = m.get(k) ?? { a: 0, b: 0, c: 0, d: 0 };
          if (h) r.won ? c.a++ : c.b++;
          else r.won ? c.c++ : c.d++;
          m.set(k, c);
        }
        const fo = fold[foldOf[r.m]];
        fo[h ? 0 : 2] += r.won;
        fo[h ? 1 : 3]++;
        for (const p of r.players) {
          let a = per.get(p);
          if (!a) per.set(p, (a = [0, 0, 0, 0]));
          a[h ? 0 : 2] += r.won;
          a[h ? 1 : 3]++;
        }
      });
      const diff = k1 / n1 - k0 / n0;
      const [lo, hi] = newcombe(k1, n1, k0, n0);
      const { p, rd } = cmh(strata.values());
      const sAdj = [...terc.values()].some((v) => v < 3) || g.teams.length > 1 ? cmh(sOnly.values()).rd : NaN;
      const agree = (cells: number[][]) => {
        let a = 0, b = 0;
        for (const c of cells) {
          if (c[1] < 3 || c[3] < 3) continue;
          b++;
          if (Math.sign(c[0] / c[1] - c[2] / c[3]) === Math.sign(diff)) a++;
        }
        return [a, b] as [number, number];
      };
      const regulars = [...per.values()].filter((c) => c[1] + c[3] >= REGULAR);
      const aheadWith = ahead1 / n1;
      const aheadWithout = ahead0 / n0;
      // Mostly where the side was ahead already, and mostly gone once the score is allowed for.
      const consequence = f.at > 0 && aheadWith - aheadWithout >= 0.15 && Math.abs(rd) < 0.6 * Math.abs(diff);
      const strengthExplained = Number.isFinite(sAdj) && Math.abs(sAdj) < 0.5 * Math.abs(diff);
      const z = f.zone !== undefined ? zoneWhere(g, f.side, f.zone) : null;
      const route = f.route !== undefined ? g.routes[f.route] : null;
      const obj = f.kind === 'capZone' ? g.objectives.find((x) => x.name === f.name) : undefined;
      const withRows = rows.filter((_, i) => has[i]);
      const pick = (won: number) => {
        const l = withRows.filter((r) => r.won === won);
        const out: SideRound[] = [];
        for (let i = 0; i < 4 && i < l.length; i++) out.push(l[Math.floor((i * l.length) / Math.min(4, l.length))]);
        return out;
      };
      pending.push({
        id: `${g.key}|${f.key}`,
        group: g.key,
        side: f.side,
        sideName: g.sides[f.side],
        sideBy: g.sidesBy,
        kind: f.kind,
        feature: f,
        with: armOf(k1, n1),
        without: armOf(k0, n0),
        diff, lo, hi,
        adjDiff: Number.isFinite(rd) ? rd : diff,
        strengthDiff: sAdj,
        p,
        folds: agree(fold),
        players: agree(regulars),
        aheadWith, aheadWithout, consequence, strengthExplained,
        window: f.window !== undefined ? g.windows[f.window] : null,
        zone: z,
        path: route ? route.path.slice(0, ROUTE_POINTS * 2) : null,
        flank: !!route?.flank,
        routeEnd: route ? endOf(g, f.side, route.path) : null,
        point: obj ? [obj.x, obj.z] : null,
        matches: [...new Set(withRows.map((r) => r.match))],
        examples: [...pick(1), ...pick(0)].map((r) => ({ match: r.match, round: r.roundNo, at: f.at, t0: r.t0, won: r.won })),
      });
      pvals.push(p);
    }
    summaries.push({
      key: g.key, sides: g.sides, sidesBy: g.sidesBy, matches: g.matches.length, rounds: Math.round(g.rounds.length / 2), wins, zone: g.zone, b: g.b, windows: g.windows, median: g.median,
      spawns: g.spawns, objectives: g.objectives, tests,
    });
    await hooks.yieldEvery?.();
  }
  const q = bhAdjust(pvals);
  const findings: OutcomeFinding[] = [];
  pending.forEach((c, i) => {
    if (!(q[i] <= o.fdr)) return drop('notSignificant');
    if (Math.abs(c.diff) < o.minDiff) return drop('tooSmall');
    // Allowed for the team, the players and the score, too little is left: the plain difference was theirs.
    if (Math.abs(c.adjDiff) < o.minDiff || Math.sign(c.adjDiff) !== Math.sign(c.diff)) return drop('explained');
    const stable = c.folds[1] < 3 || c.folds[0] >= Math.ceil(0.6 * c.folds[1]);
    if (!stable) drop('unstable');
    const agreeShare = c.folds[1] ? c.folds[0] / c.folds[1] : 0.5;
    const score = Math.abs(c.adjDiff) * (0.5 + 0.5 * agreeShare) * (c.consequence || c.strengthExplained ? 0.25 : 1) * (stable ? 1 : 0.3);
    findings.push({ ...c, q: q[i], stable, score, near: 0 });
  });
  findings.sort((a, b) => b.score - a.score);
  // One place said once: a weaker finding of the same kind and side, the same way, a zone or a window next to a
  // stronger one, is folded into it.
  const kept: OutcomeFinding[] = [];
  for (const f of findings) {
    // A round's first blood, first capture, early contact: one side's having it is the other's not; said once.
    const mirror = MIRRORED.has(f.kind) ? kept.find((k) => k.group === f.group && k.kind === f.kind && k.side !== f.side && Math.sign(k.diff) === Math.sign(f.diff)) : undefined;
    const into = mirror ?? (f.zone
      ? kept.find(
          (k) =>
            k.group === f.group && k.side === f.side && k.kind === f.kind && Math.sign(k.diff) === Math.sign(f.diff) && k.zone &&
            Math.abs(k.zone.x0 - f.zone!.x0) <= (f.zone!.x1 - f.zone!.x0) * 1.01 && Math.abs(k.zone.z0 - f.zone!.z0) <= (f.zone!.z1 - f.zone!.z0) * 1.01 &&
            Math.abs((k.feature.window ?? 0) - (f.feature.window ?? 0)) <= 1,
        )
      : undefined);
    if (into) {
      into.near++;
      drop('merged');
    } else kept.push(f);
  }
  findings.length = 0;
  findings.push(...kept);
  return { report: { groups: summaries, findings, tests: pvals.length, dropped, ms: Math.round(performance.now() - t0), options: o }, groups };
}
