/**
 * What decided the rounds of one match (or of the matches shown): the
 * outcome as the target. From the close-quarters walk (`walk.ts`) and the
 * round win-probability model (`finish.ts`):
 *
 * - **Factors**: what separated won from lost rounds, per side - winning the
 *   opening duel, the better buy, a traded first death, the plant, more
 *   utility than usual, an early first contact, each named place held (five
 *   seconds or more) and each reached in the first `EARLY_SECS` (the route).
 *   Each is the side's round win rate with and without it: the difference
 *   with Newcombe's interval, Fisher's exact p, and the q of
 *   Benjamini-Hochberg over every factor tried. An arm under `SMALL` rounds is
 *   marked small.
 * - **Turning points**: the kills and plants that moved the win probability
 *   most, who made them, where, and whether the side went on to win.
 * - **Contributions**: the win probability each player added over the rounds
 *   (kills and plants for, deaths against), per round with its interval; and
 *   each place's balance of duels for each side.
 *
 * With fewer rounds than the fitted model needs (`finish.ts` winProb), the
 * probabilities come from a fixed prior model of the same features (men alive,
 * the plant, the clock), and the result says so (`model: 'prior'`).
 */

import { betaInc, bhAdjust, wilson } from '../stats';
import { fisher, newcombe } from './model';
import { MAX_TEAMS, type CqbWalk, type Duel, type Round } from './walk';

/** Rounds an arm needs to be said without the small-sample mark. */
export const SMALL = 8;
/** Rounds with a known winner the analysis needs at all. */
const MIN_ROUNDS = 6;
/** Seconds at a place that count as holding it in a round. */
const HELD_SECS = 5;
const MAX_FACTORS = 24;
const MAX_TURNS = 8;

export type OutcomeKind = 'opening' | 'buy' | 'traded' | 'plant' | 'utility' | 'fast' | 'held' | 'early';

export interface OutcomeShare {
  k: number;
  n: number;
  share: number;
  lo: number;
  hi: number;
}

export interface OutcomeFactor {
  id: string;
  kind: OutcomeKind;
  /** The side whose rounds are split by it. */
  team: string;
  place?: string;
  /** An early first contact: before this many seconds into the round. */
  secs?: number;
  /** The side's rounds won with the factor, and without it. */
  with: OutcomeShare;
  without: OutcomeShare;
  /** Difference of the two win rates, Newcombe's 95% interval; odds ratio (0.5 added to each cell). */
  diff: number;
  lo: number;
  hi: number;
  odds: number;
  p: number;
  q: number;
  /** An arm has fewer than `SMALL` rounds. */
  small: boolean;
}

export interface OutcomeTurn {
  /** Round number in the match (1 first), seconds into it, and the dataset time. */
  round: number;
  at: number;
  time: number;
  kind: 'kill' | 'plant';
  team: string;
  /** Person indices: who did it, and the victim of a kill (-1 none). */
  person: number;
  victim: number;
  /** The side's win probability before and after, and the change. */
  before: number;
  after: number;
  delta: number;
  place?: string;
  /** World position of the kill (the plant), on the ground. */
  x: number;
  z: number;
  opening: boolean;
  /** Whether the side went on to win the round; null unknown. */
  won: boolean | null;
}

export interface OutcomePlayer {
  personIndex: number;
  person?: string;
  team: string;
  /** Win probability added over the match (1 = one round's worth), a round on average with its 95% interval. */
  wpa: number;
  perRound: number;
  lo: number;
  hi: number;
  rounds: number;
  /** Rounds the player's side won, of those played. */
  won: number;
  /** Student's t test of the mean a round against 0; q over every player. */
  p: number;
  q: number;
  small: boolean;
}

export interface OutcomeSpot {
  place: string;
  team: string;
  duels: number;
  /** Win probability the side gained in duels there: total, a duel on average with its 95% interval. */
  wpa: number;
  mean: number;
  lo: number;
  hi: number;
}

export interface CqbOutcome {
  teams: [string, string];
  /** Rounds with a known winner, and each side's rounds won. */
  rounds: number;
  wins: [OutcomeShare, OutcomeShare];
  /** Where the win probabilities came from: the model fitted to these rounds, or the fixed prior. */
  model: 'fitted' | 'prior';
  factors: OutcomeFactor[];
  turns: OutcomeTurn[];
  best: OutcomePlayer[];
  worst: OutcomePlayer[];
  spots: OutcomeSpot[];
  /** Factors tried (the q accounts for them) and those under q 0.05. */
  tests: number;
  discoveries: number;
}

export interface OutcomeInput {
  w: CqbWalk;
  A: number;
  B: number;
  teams: readonly string[];
  places?: readonly string[] | null;
  /** Round id -> winning team. */
  winner: Map<number, number>;
  /** P(A wins) per snapshot. */
  pA: Float64Array | null;
  model: 'fitted' | 'prior';
  placeName: (pl: number) => string;
}

const r3 = (v: number) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : v);

export function outcomeShare(k: number, n: number): OutcomeShare {
  const [lo, hi] = wilson(k, n);
  return { k, n, share: r3(n ? k / n : NaN), lo: r3(lo), hi: r3(hi) };
}

/** Two-sided p of Student's t with `df` degrees of freedom. */
function tP(t: number, df: number): number {
  if (!Number.isFinite(t) || df < 1) return 1;
  return Math.min(1, betaInc(df / 2, 0.5, df / (df + t * t)));
}

function meanCi(v: number[]): { mean: number; lo: number; hi: number; p: number } {
  const n = v.length;
  if (!n) return { mean: NaN, lo: NaN, hi: NaN, p: 1 };
  const m = v.reduce((a, b) => a + b, 0) / n;
  const sd = n > 1 ? Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / (n - 1)) : 0;
  // Student's t at 95% for small n (2.0 from 60 on).
  const t = n >= 60 ? 1.96 : [12.71, 4.3, 3.18, 2.78, 2.57, 2.45, 2.36, 2.31, 2.26, 2.23][n - 2] ?? 2.0 + 2.2 / n;
  const h = n > 1 ? (t * sd) / Math.sqrt(n) : NaN;
  return { mean: m, lo: m - h, hi: m + h, p: n > 1 && sd > 0 ? tP(m / (sd / Math.sqrt(n)), n - 1) : 1 };
}

/** The round analysis; null without enough rounds of a known winner. */
export function roundOutcome(c: OutcomeInput): CqbOutcome | null {
  const { w, A, B, winner } = c;
  const rounds = w.order.filter((r) => winner.has(r.id));
  if (rounds.length < MIN_ROUNDS) return null;
  const name = (t: number) => c.teams[t] ?? `#${t}`;
  const number = new Map(w.order.map((r, i) => [r.id, i + 1]));
  const duelsOf = new Map<number, Duel[]>();
  for (const d of w.duels) if (!d.teamkill) (duelsOf.get(d.round) ?? duelsOf.set(d.round, []).get(d.round)!).push(d);
  const won = (r: Round, t: number) => winner.get(r.id) === t;

  // ---- factors
  const factors: OutcomeFactor[] = [];
  const add = (kind: OutcomeKind, t: number, has: (r: Round) => boolean | null, place?: string) => {
    let k1 = 0, n1 = 0, k2 = 0, n2 = 0;
    for (const r of rounds) {
      const h = has(r);
      if (h === null) continue;
      if (h) {
        n1++;
        if (won(r, t)) k1++;
      } else {
        n2++;
        if (won(r, t)) k2++;
      }
    }
    if (n1 < 3 || n2 < 3) return;
    const [lo, hi] = newcombe(k1, n1, k2, n2);
    const odds = ((k1 + 0.5) / (n1 - k1 + 0.5)) / ((k2 + 0.5) / (n2 - k2 + 0.5));
    factors.push({
      id: `${kind}:${name(t)}${place ? `:${place}` : ''}`,
      kind,
      team: name(t),
      ...(place ? { place } : {}),
      with: outcomeShare(k1, n1),
      without: outcomeShare(k2, n2),
      diff: r3(k1 / n1 - k2 / n2),
      lo: r3(lo),
      hi: r3(hi),
      odds: r3(odds),
      p: fisher(k1, n1 - k1, k2, n2 - k2),
      q: 1,
      small: n1 < SMALL || n2 < SMALL,
    });
  };
  const opening = (r: Round): Duel | null => (duelsOf.get(r.id) ?? []).find((d) => d.opening && (d.kTeam === A || d.kTeam === B)) ?? null;
  // Symmetric factors are said once, for side A: B's are their mirror.
  add('opening', A, (r) => {
    const d = opening(r);
    return d ? d.kTeam === A : null;
  });
  if (w.hasBuy) {
    const buyOf = (r: Round, t: number) => {
      const v = r.slots.filter((s) => s.team === t && Number.isFinite(s.buy)).map((s) => s.buy);
      return v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN;
    };
    add('buy', A, (r) => {
      const d = buyOf(r, A) - buyOf(r, B);
      return Number.isFinite(d) && Math.abs(d) >= 0.1 ? d > 0 : null;
    });
  }
  const times = rounds.map((r) => opening(r)).filter((d): d is Duel => !!d).map((d) => d.t - (w.rounds.get(d.round)?.start ?? d.t)).sort((a, b) => a - b);
  if (times.length >= 6) {
    const mid = times[times.length >> 1];
    add('fast', A, (r) => {
      const d = opening(r);
      return d ? d.t - r.start < mid : null;
    });
    const f = factors.find((x) => x.kind === 'fast');
    if (f) f.secs = r3(mid);
  }
  for (const t of [A, B]) {
    add('traded', t, (r) => {
      const d = (duelsOf.get(r.id) ?? []).find((x) => x.vTeam === t);
      return d ? d.tradedBy >= 0 : null;
    });
    const planted = rounds.filter((r) => r.plantTeam === t).length;
    if (planted >= 3) add('plant', t, (r) => r.plantTeam === t);
    const util = rounds.map((r) => r.utilN[t]).sort((a, b) => a - b);
    const uMid = util[util.length >> 1];
    if (util[util.length - 1] > 0) add('utility', t, (r) => r.utilN[t] > uMid || (uMid === 0 && r.utilN[t] > 0));
  }
  if (w.hasPlace && !w.placeCells) {
    const places = new Set<number>();
    for (const r of rounds) for (const k of r.placeT.keys()) places.add(Math.floor(k / MAX_TEAMS));
    for (const pl of places) {
      const pn = c.placeName(pl);
      for (const t of [A, B]) {
        const key = pl * MAX_TEAMS + t;
        add('held', t, (r) => (r.placeT.get(key) ?? 0) >= HELD_SECS, pn);
        add('early', t, (r) => r.placeE.has(key), pn);
      }
    }
  }
  const q = bhAdjust(factors.map((f) => f.p));
  factors.forEach((f, i) => (f.q = r3(q[i])));
  const tests = factors.length;
  const discoveries = factors.filter((f) => f.q < 0.05).length;
  // Strongest first: the effect, held back by the evidence.
  const rank = (f: OutcomeFactor) => Math.abs(f.diff) * (1 - Math.min(1, f.q)) * (f.small ? 0.6 : 1);
  factors.sort((a, b) => rank(b) - rank(a) || a.p - b.p);

  // ---- turning points and contributions
  const turns: OutcomeTurn[] = [];
  const best: OutcomePlayer[] = [];
  const worst: OutcomePlayer[] = [];
  const spots: OutcomeSpot[] = [];
  const pA = c.pA;
  if (pA) {
    const pOf = (s: number, t: number) => (t === A ? pA[s] : 1 - pA[s]);
    const per = new Map<number, { team: number; byRound: Map<number, number> }>();
    const credit = (person: number, team: number, round: number, v: number) => {
      let e = per.get(person);
      if (!e) per.set(person, (e = { team, byRound: new Map() }));
      e.byRound.set(round, (e.byRound.get(round) ?? 0) + v);
    };
    for (const r of rounds) for (const s of r.slots) if (s.seen && (s.team === A || s.team === B)) credit(s.person, s.team, r.id, 0);
    const spot = new Map<string, number[]>();
    const all: OutcomeTurn[] = [];
    for (const d of w.duels) {
      if (d.teamkill || (d.kTeam !== A && d.kTeam !== B) || !winner.has(d.round)) continue;
      const before = pOf(d.pre, d.kTeam);
      const after = pOf(d.post, d.kTeam);
      const v = after - before;
      if (!Number.isFinite(v)) continue;
      credit(d.killer, d.kTeam, d.round, v);
      credit(d.victim, d.vTeam, d.round, -v);
      if (d.place >= 0) {
        const pn = c.placeName(d.place);
        for (const [t, x] of [[d.kTeam, v], [d.vTeam, -v]] as [number, number][]) {
          if (t !== A && t !== B) continue;
          const k = `${pn}\u0001${t}`;
          (spot.get(k) ?? spot.set(k, []).get(k)!).push(x);
        }
      }
      const r = w.rounds.get(d.round)!;
      all.push({
        round: number.get(d.round) ?? 0, at: r3(d.t - r.start), time: d.t, kind: 'kill', team: name(d.kTeam), person: d.killer, victim: d.victim,
        before: r3(before), after: r3(after), delta: r3(v), ...(d.place >= 0 ? { place: c.placeName(d.place) } : {}), x: d.x, z: d.z, opening: d.opening, won: won(r, d.kTeam),
      });
    }
    for (const pl of w.plants) {
      if ((pl.team !== A && pl.team !== B) || !winner.has(pl.round)) continue;
      const before = pOf(pl.pre, pl.team);
      const after = pOf(pl.post, pl.team);
      const v = after - before;
      if (!Number.isFinite(v)) continue;
      credit(pl.person, pl.team, pl.round, v);
      const r = w.rounds.get(pl.round)!;
      all.push({ round: number.get(pl.round) ?? 0, at: r3(r.plantT - r.start), time: r.plantT, kind: 'plant', team: name(pl.team), person: pl.person, victim: -1, before: r3(before), after: r3(after), delta: r3(v), x: r.plantX, z: r.plantZ, opening: false, won: won(r, pl.team) });
    }
    all.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    turns.push(...all.slice(0, MAX_TURNS));
    const players: OutcomePlayer[] = [];
    for (const [person, e] of per) {
      const v = [...e.byRound.values()];
      if (!v.length) continue;
      const m = meanCi(v);
      const total = v.reduce((a, b) => a + b, 0);
      let wonN = 0;
      for (const id of e.byRound.keys()) if (winner.get(id) === e.team) wonN++;
      players.push({ personIndex: person, team: name(e.team), wpa: r3(total), perRound: r3(m.mean), lo: r3(m.lo), hi: r3(m.hi), rounds: v.length, won: wonN, p: m.p, q: 1, small: v.length < SMALL });
    }
    const pq = bhAdjust(players.map((x) => x.p));
    players.forEach((x, i) => (x.q = r3(pq[i])));
    players.sort((a, b) => b.wpa - a.wpa);
    best.push(...players.filter((p) => p.wpa > 0).slice(0, 3));
    worst.push(...players.filter((p) => p.wpa < 0).slice(-3).reverse());
    for (const [k, v] of spot) {
      if (v.length < 3) continue;
      const [place, t] = k.split('\u0001');
      const m = meanCi(v);
      spots.push({ place, team: name(Number(t)), duels: v.length, wpa: r3(v.reduce((a, b) => a + b, 0)), mean: r3(m.mean), lo: r3(m.lo), hi: r3(m.hi) });
    }
    spots.sort((a, b) => Math.abs(b.wpa) - Math.abs(a.wpa));
  }
  const wa = rounds.filter((r) => winner.get(r.id) === A).length;
  const wb = rounds.filter((r) => winner.get(r.id) === B).length;
  return {
    teams: [name(A), name(B)],
    rounds: rounds.length,
    wins: [outcomeShare(wa, rounds.length), outcomeShare(wb, rounds.length)],
    model: c.model,
    factors: factors.slice(0, MAX_FACTORS),
    turns,
    best,
    worst,
    spots: spots.slice(0, 8),
    tests,
    discoveries,
  };
}
