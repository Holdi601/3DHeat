/**
 * The numbers the breakdown shows, from the pass's totals (`breakdown.ts`):
 * per group a metric with small counts pulled toward the whole place's value,
 * and per state factor its effect with against without, with a 95% interval.
 *
 * Shrinkage: a ratio of `num` to `den` is read as `(num + m * r0) / (den + m)`,
 * `r0` the ratio over every group and `m` a few units of the denominator, so a
 * group with one kill and no deaths does not top the list at infinity - and
 * the counts are shown beside it, so nothing is hidden by it.
 *
 * Effects: ratios (KDR, kills a minute, deaths a minute) as the log of the
 * ratio with against without, its standard error from the counts as Poisson
 * (half a count added to each); wins as the difference of two proportions
 * (Agresti-Caffo). For the ranking the estimate is pulled toward no effect by
 * its own uncertainty, `est * tau^2 / (tau^2 + se^2)`, so a rare factor needs
 * a clear effect to rank high; the interval shown is the unpulled one.
 */

import type { BreakdownResult, Sums } from './breakdown';

export const GROUP_METRICS = ['a', 'b', 'ratio', 'diff', 'share', 'kdr', 'win', 'kpm', 'earn', 'cost', 'net'] as const;
export type GroupMetric = (typeof GROUP_METRICS)[number];

export const FACTOR_EFFECTS = ['kdr', 'win', 'survival', 'kpm', 'money'] as const;
export type FactorEffect = (typeof FACTOR_EFFECTS)[number];

/** Prior strength per metric, in units of its denominator. */
const PRIOR = { ratio: 4, share: 4, kdr: 4, win: 4, kpm: 2 } as const;

export function shrink(num: number, den: number, r0: number, m: number): number {
  return (num + m * r0) / (den + m);
}

export function sumsAt(o: { [K in keyof Sums]: Float64Array }, i: number): Sums {
  return {
    a: o.a[i], b: o.b[i], rows: o.rows[i], kills: o.kills[i], deaths: o.deaths[i],
    presence: o.presence[i], earn: o.earn[i], cost: o.cost[i], played: o.played[i], won: o.won[i],
  };
}

/** Whether a metric can be worked out from these totals at all (the place's). */
export function metricAvailable(t: Sums, m: GroupMetric, sided: boolean): boolean {
  switch (m) {
    case 'a': return true;
    case 'b': case 'ratio': case 'diff': case 'share': return sided;
    case 'kdr': return t.kills + t.deaths > 0;
    case 'win': return t.played > 0;
    case 'kpm': return t.presence > 0 && t.kills > 0;
    case 'earn': return t.earn !== 0;
    case 'cost': return t.cost !== 0;
    case 'net': return t.earn !== 0 || t.cost !== 0;
  }
}

/** A group's value of a metric (shrunk where a ratio), or NaN where it has none. */
export function groupValue(s: Sums, t: Sums, m: GroupMetric): number {
  switch (m) {
    case 'a': return s.a;
    case 'b': return s.b;
    case 'diff': return s.a - s.b;
    case 'ratio': return s.a + s.b > 0 ? shrink(s.a, s.b, t.b > 0 ? t.a / t.b : 1, PRIOR.ratio) : NaN;
    case 'share': return s.a + s.b > 0 ? shrink(s.a, s.a + s.b, t.a + t.b > 0 ? t.a / (t.a + t.b) : 0.5, PRIOR.share) : NaN;
    case 'kdr': return s.kills + s.deaths > 0 ? shrink(s.kills, s.deaths, t.deaths > 0 ? t.kills / t.deaths : 1, PRIOR.kdr) : NaN;
    case 'win': return s.played > 0 ? shrink(s.won, s.played, t.played > 0 ? t.won / t.played : 0.5, PRIOR.win) : NaN;
    case 'kpm': return s.presence > 0 ? shrink(s.kills, s.presence / 60, t.presence > 0 ? t.kills / (t.presence / 60) : 0, PRIOR.kpm) : NaN;
    case 'earn': return s.earn;
    case 'cost': return s.cost;
    case 'net': return s.earn - s.cost;
  }
}

/** Whether a lower value of the metric is the better one. */
export function lowerIsBetter(m: GroupMetric): boolean {
  return m === 'b' || m === 'cost';
}

export interface Ranked {
  index: number;
  value: number;
}

/** Groups with a value, best first. */
export function rankGroups(r: BreakdownResult, m: GroupMetric): Ranked[] {
  if (!r.groups) return [];
  const out: Ranked[] = [];
  const n = r.groups.rows.length;
  for (let i = 0; i < n; i++) {
    if (r.groups.rows[i] === 0 && r.groups.played[i] === 0) continue;
    const v = groupValue(sumsAt(r.groups, i), r.total, m);
    if (Number.isFinite(v)) out.push({ index: i, value: v });
  }
  const low = lowerIsBetter(m);
  out.sort((x, y) => (low ? x.value - y.value : y.value - x.value) || x.index - y.index);
  return out;
}

export interface Effect {
  /** The effect: a ratio (`log` true, est is its log) or a difference. */
  est: number;
  se: number;
  /** `est` pulled toward none by its uncertainty, for the ranking. */
  shrunk: number;
  log: boolean;
  /** With and without, as shown: the rates or shares themselves. */
  withValue: number;
  withoutValue: number;
}

const Z = 1.959964;

export function interval(e: Effect): [number, number] {
  return [e.est - Z * e.se, e.est + Z * e.se];
}

function pull(est: number, se: number, tau: number): number {
  return (est * tau * tau) / (tau * tau + se * se);
}

/** Log of a ratio of two count ratios, with its standard error. */
function logRatio(n1: number, d1: number, n0: number, d0: number, tau = 0.5): Effect | null {
  if (n1 + d1 <= 0 || n0 + d0 <= 0) return null;
  const est = Math.log((n1 + 0.5) / (d1 + 0.5)) - Math.log((n0 + 0.5) / (d0 + 0.5));
  const se = Math.sqrt(1 / (n1 + 0.5) + 1 / (d1 + 0.5) + 1 / (n0 + 0.5) + 1 / (d0 + 0.5));
  return { est, se, shrunk: pull(est, se, tau), log: true, withValue: n1 / Math.max(d1, 1e-9), withoutValue: n0 / Math.max(d0, 1e-9) };
}

/** Log of a ratio of two rates per unit of exposure (counts Poisson, exposure exact). */
function logRate(c1: number, e1: number, c0: number, e0: number, tau = 0.5): Effect | null {
  if (e1 <= 0 || e0 <= 0 || c1 + c0 <= 0) return null;
  const est = Math.log((c1 + 0.5) / e1) - Math.log((c0 + 0.5) / e0);
  const se = Math.sqrt(1 / (c1 + 0.5) + 1 / (c0 + 0.5));
  return { est, se, shrunk: pull(est, se, tau), log: true, withValue: c1 / e1, withoutValue: c0 / e0 };
}

/** The effect of a factor on one measure: with it (`w`) against without (`o`). */
export function factorEffect(w: Sums, t: Sums, kind: FactorEffect): Effect | null {
  const o: Sums = {
    a: t.a - w.a, b: t.b - w.b, rows: t.rows - w.rows, kills: t.kills - w.kills, deaths: t.deaths - w.deaths,
    presence: t.presence - w.presence, earn: t.earn - w.earn, cost: t.cost - w.cost, played: t.played - w.played, won: t.won - w.won,
  };
  switch (kind) {
    case 'kdr':
      return logRatio(w.kills, w.deaths, o.kills, o.deaths);
    case 'kpm':
      return logRate(w.kills, w.presence / 60, o.kills, o.presence / 60);
    case 'survival': {
      // Fewer deaths a minute is longer survival: the effect is the inverse rate.
      const e = logRate(w.deaths, w.presence / 60, o.deaths, o.presence / 60);
      if (!e) return null;
      const inv = (r: number) => (r > 0 ? 1 / r : Infinity);
      return { ...e, est: -e.est, shrunk: -e.shrunk, withValue: inv(e.withValue), withoutValue: inv(e.withoutValue) };
    }
    case 'win': {
      if (w.played <= 0 || o.played <= 0) return null;
      const p1 = (w.won + 1) / (w.played + 2);
      const p0 = (o.won + 1) / (o.played + 2);
      const est = p1 - p0;
      const se = Math.sqrt((p1 * (1 - p1)) / (w.played + 2) + (p0 * (1 - p0)) / (o.played + 2));
      return { est, se, shrunk: pull(est, se, 0.1), log: false, withValue: w.won / w.played, withoutValue: o.won / o.played };
    }
    case 'money': {
      // Net money a minute present; its spread is not a count's, so no interval.
      if (w.presence <= 0 || o.presence <= 0) return null;
      const r1 = (w.earn - w.cost) / (w.presence / 60);
      const r0 = (o.earn - o.cost) / (o.presence / 60);
      return { est: r1 - r0, se: NaN, shrunk: r1 - r0, log: false, withValue: r1, withoutValue: r0 };
    }
  }
}

/** Factors with an effect on `kind`, strongest positive first. */
export function rankFactors(r: BreakdownResult, kind: FactorEffect): { index: number; effect: Effect }[] {
  const out: { index: number; effect: Effect }[] = [];
  const n = r.factors.rows.length;
  for (let i = 0; i < n; i++) {
    if (r.factors.rows[i] === 0) continue;
    const e = factorEffect(sumsAt(r.factors, i), r.total, kind);
    if (e && Number.isFinite(e.shrunk)) out.push({ index: i, effect: e });
  }
  out.sort((x, y) => y.effect.shrunk - x.effect.shrunk || x.index - y.index);
  return out;
}
