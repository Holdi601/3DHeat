/**
 * The round outcome (`cqb/outcome.ts`) as insights: what separated won from
 * lost rounds and the players who added (or cost) the most win probability,
 * each held to the report's false discovery rate over its own family of
 * tests, ranked among the other detectors' findings with the outcome's weight
 * (`OUTCOME_WEIGHT`): the outcome is what a debrief is about.
 */

import { confidenceLevel, strengthOf } from './stats';
import type { CqbOutcome, OutcomeFactor } from './cqb/outcome';
import type { DetectorRun, Insight, InsightReport } from './types';

/** How much more an outcome finding weighs in the ranking than another of the same effect and evidence. */
export const OUTCOME_WEIGHT = 1.35;
/** Rounds of the prior a factor's odds ratio is shrunk with (half each way). */
const PRIOR_ROUNDS = 4;

const r3 = (v: number) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : v);
const pts = (v: number) => Math.round(v * 1000) / 10;

/** The factor's odds ratio shrunk towards 1, and the ~95% interval of the raw one (Woolf, 0.5 added). */
function oddsOf(f: OutcomeFactor): { shrunk: number; raw: number; lo: number; hi: number } {
  const a = f.with.k, b = f.with.n - f.with.k, c = f.without.k, d = f.without.n - f.without.k;
  const h = PRIOR_ROUNDS / 4;
  const shrunk = ((a + h) / (b + h)) / ((c + h) / (d + h));
  const raw = ((a + 0.5) / (b + 0.5)) / ((c + 0.5) / (d + 0.5));
  const se = Math.sqrt(1 / (a + 0.5) + 1 / (b + 0.5) + 1 / (c + 0.5) + 1 / (d + 0.5));
  return { shrunk, raw, lo: raw * Math.exp(-1.96 * se), hi: raw * Math.exp(1.96 * se) };
}

export function outcomeInsights(o: CqbOutcome, fdr: number): { insights: Insight[]; run: DetectorRun } {
  const out: Insight[] = [];
  for (const f of o.factors) {
    if (!(f.q <= fdr)) continue;
    const odds = oddsOf(f);
    out.push({
      id: `outcome.${f.id}`,
      detector: 'outcome',
      kind: `outcome.${f.kind}`,
      sentence: {
        key: `insights.say.outcome.${f.kind}`,
        params: {
          team: f.team, ...(f.place ? { place: f.place } : {}), ...(f.secs !== undefined ? { fastSecs: f.secs } : {}),
          withPct: f.with.share, withoutPct: f.without.share, n1: f.with.n, n2: f.without.n, diff: pts(f.diff), lo: pts(f.lo), hi: pts(f.hi),
        },
      },
      strength: Math.min(1, strengthOf(odds.shrunk, f.q) * OUTCOME_WEIGHT * (f.small ? 0.6 : 1)),
      effect: { measure: 'winOddsRatio', value: r3(odds.shrunk), raw: r3(odds.raw), lo: r3(odds.lo), hi: r3(odds.hi) },
      confidence: { p: f.p, q: f.q, level: confidenceLevel(f.q), tests: o.tests, method: `Fisher's exact test of the side's rounds won with and without; Newcombe interval of the difference; BH over ${o.tests} factors` },
      evidence: { roundsWith: f.with.n, wonWith: f.with.k, roundsWithout: f.without.n, wonWithout: f.without.k, diff: f.diff, diffLo: f.lo, diffHi: f.hi, small: f.small ? 1 : 0, model: o.model },
      place: null,
      time: null,
      filters: [{ by: 'team', values: [f.team] }],
      subject: { team: f.team },
    });
  }
  for (const [list, up] of [[o.best, true], [o.worst, false]] as const) {
    for (const p of list) {
      if (!(p.q <= fdr)) continue;
      out.push({
        id: `outcome.player:${p.personIndex}`,
        detector: 'outcome',
        kind: up ? 'outcome.playerUp' : 'outcome.playerDown',
        sentence: { key: `insights.say.outcome.${up ? 'playerUp' : 'playerDown'}`, params: { player: p.person ?? `#${p.personIndex}`, team: p.team, wpa: r3(Math.abs(p.wpa)), rounds: p.rounds, perRound: pts(p.perRound), lo: pts(p.lo), hi: pts(p.hi) } },
        // A round's worth of win probability a round on average is the ceiling; a tenth of one is half way.
        strength: Math.min(1, strengthOf(Math.exp(Math.abs(p.perRound) * 11), p.q) * OUTCOME_WEIGHT * (p.small ? 0.6 : 1)),
        effect: { measure: 'winOddsRatio', value: r3(Math.exp(p.perRound * 4)), raw: null, lo: null, hi: null },
        confidence: { p: p.p, q: p.q, level: confidenceLevel(p.q), tests: 0, method: `Student's t of the win probability added a round against 0 (${o.model === 'fitted' ? 'model fitted to these rounds' : 'prior model'}); BH over every player` },
        evidence: { wpa: p.wpa, perRound: p.perRound, lo: p.lo, hi: p.hi, rounds: p.rounds, roundsWon: p.won, small: p.small ? 1 : 0, model: o.model },
        place: null,
        time: null,
        filters: [{ by: 'person', values: [p.person ?? `#${p.personIndex}`] }],
        subject: { personIndex: p.personIndex, ...(p.person ? { person: p.person } : {}), team: p.team },
      });
    }
  }
  return { insights: out, run: { id: 'outcome', ran: true, tests: o.tests, found: out.length, ms: 0 } };
}

/** The outcome's insights into a report: ranked among the rest, its run listed. */
export function mergeOutcome(r: InsightReport): void {
  const o = r.lens?.cqb?.outcome;
  r.insights = r.insights.filter((i) => i.detector !== 'outcome');
  r.detectors = r.detectors.filter((d) => d.id !== 'outcome');
  if (!o) return;
  const { insights, run } = outcomeInsights(o, r.fdr);
  r.detectors.push(run);
  // As the engine ranks: a few of each kind first, then the rest, strongest first.
  const all = [...r.insights, ...insights].sort((a, b) => b.strength - a.strength);
  const seen = new Map<string, number>();
  const first: Insight[] = [];
  const rest: Insight[] = [];
  for (const i of all) {
    const n = seen.get(i.kind) ?? 0;
    seen.set(i.kind, n + 1);
    (n < 3 ? first : rest).push(i);
  }
  r.insights = [...first, ...rest].slice(0, Math.max(60, r.insights.length));
}
