/**
 * The close-quarters and esports metrics from the walk's records
 * (`walk.ts`): a round win-probability model fitted to the data with its
 * calibration out of fold, the value of each action as the change in win
 * probability it made, opening duels, trades, peeker against holder, aim at
 * the duel, crossfires, utility before entries, man advantage, clutches,
 * stacks, rotations, lurks, post-plant and retake, fatal funnels by place,
 * and player impact (win probability added, shrunk; ridge adjusted
 * plus-minus). Every share has its 95% interval, every comparison its exact
 * or permutation test, and all the tests together their false discovery rate.
 */

import { bhAdjust, binomTwoSided, quantileSorted, wilson } from '../stats';
import { calibrate, ebShrink, fisher, fitLogit, newcombe, permMeans, predict, ridgeSparse, zTwoSided, type Calibration } from './model';
import { FLASH_SECS, LURK, MAX_TEAMS, MOVE, STILL, TRADE_SECS, type CqbWalk, type Duel, type Round } from './walk';

/** A share with its Wilson interval. */
export interface Share {
  k: number;
  n: number;
  share: number;
  lo: number;
  hi: number;
}

/** Two shares compared: difference with Newcombe's interval, Fisher's p and the q over every test. */
export interface Contrast {
  with: Share;
  without: Share;
  diff: number;
  lo: number;
  hi: number;
  p: number;
  q?: number;
}

export interface CqbNames {
  teams: readonly string[];
  places?: readonly string[] | null;
  weapons?: readonly string[] | null;
  persons?: readonly string[] | null;
}

export interface PlayerValue {
  personIndex: number;
  person?: string;
  value: number;
  lo?: number;
  hi?: number;
  rounds: number;
}

export interface GroupValue {
  name: string;
  n: number;
  /** Mean change in win probability per action, shrunk, with its interval; and unshrunk. */
  mean: number;
  lo: number;
  hi: number;
  raw: number;
}

export interface CqbMetrics {
  schema: 'heat3d.cqb/1';
  /** The two sides the model is read for (A first). */
  teams: [string, string];
  rounds: number;
  /** Rounds whose winner the data says (a `won` column, or one side wiped out). */
  decided: number;
  /** Elimination rounds (nobody dies twice in a round): man advantage, clutches and the model apply. */
  roundBased: boolean;
  duels: number;
  winProb?: {
    features: string[];
    beta: number[];
    se: number[];
    snapshots: number;
    rounds: number;
    /** Side A's share of rounds won. */
    baseA: number;
    calibration: Calibration;
  };
  actions?: { kind: string; n: number; mean: number; lo: number; hi: number; p?: number; q?: number }[];
  opening?: {
    n: number;
    /** Side A's share of opening duels won. */
    a: Share;
    /** Rounds won by the side that won the opening duel. */
    convert: Share;
    byTeam: { team: string; won: Share; convert: Share }[];
    places: { place: string; n: number; a: Share; p: number; q?: number; value: number }[];
  };
  trades?: { deaths: number; traded: Share; medianSecs: number; byTeam: { team: string; traded: Share }[]; firstDeath: Contrast };
  peek?: { n: number; peeker: Share; p: number; q?: number; byTeam: { team: string; peeker: Share }[] };
  aim?: { n: number; killerPreDeg: number; victimPreDeg: number; betterAimed: Share; p: number; q?: number; rangeM: { p25: number; p50: number; p75: number }; holderOnAngle: Contrast | null };
  crossfire?: Contrast & { n: number };
  utility?: { flashEntry: Contrast | null; smokeEntry: Contrast | null; openingFlash: Contrast | null; victimFlashed: Share | null; perFlash: number; thrown: { team: string; flash: number; smoke: number; he: number; fire: number }[] };
  manAdvantage?: { own: number; enemy: number; won: Share }[];
  clutch?: { byN: { vs: number; attempts: number; wins: number; expected: number; p: number; q?: number }[] };
  setups?: {
    stack: { team: string; stacked: Share; spread: Share; p: number; q?: number }[];
    rotation: { team: string; kind: 'fight' | 'objective'; n: number; medianSecs: number; arrived: Share; fast: Share; slow: Share; p: number; q?: number }[];
    lurk: { team: string; timeShare: number; lurkKd: number; packKd: number; ratio: number; lo: number; hi: number; p: number; q?: number }[];
  };
  postPlant?: { rounds: number; planter: Share; byNumbers: { own: number; enemy: number; won: Share }[]; holderDuels: Share };
  funnel?: { entries: number; base: number; places: { place: string; entries: number; deaths: number; rate: number; lo: number; hi: number; ratio: number; p: number; q?: number }[] };
  impact?: { wpa: PlayerValue[]; rapm: PlayerValue[]; lambda: number; players: number; places: GroupValue[]; weapons: GroupValue[] };
  /** Tests run; q-values are Benjamini-Hochberg over all of them. */
  tests: number;
  /** Tests with q under 0.05. */
  discoveries: number;
}

const r3 = (v: number) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : v);
const share = (k: number, n: number): Share => {
  const [lo, hi] = wilson(k, n);
  return { k, n, share: r3(n ? k / n : NaN), lo: r3(lo), hi: r3(hi) };
};
function contrast(k1: number, n1: number, k2: number, n2: number): Contrast {
  const [lo, hi] = newcombe(k1, n1, k2, n2);
  return { with: share(k1, n1), without: share(k2, n2), diff: r3(n1 && n2 ? k1 / n1 - k2 / n2 : NaN), lo: r3(lo), hi: r3(hi), p: fisher(k1, n1 - k1, k2, n2 - k2) };
}
const median = (v: number[]) => (v.length ? quantileSorted(Float64Array.from(v).sort(), 0.5) : NaN);
const deg = (r: number) => (r * 180) / Math.PI;

interface Ctx {
  w: CqbWalk;
  names: CqbNames;
  A: number;
  B: number;
  winner: Map<number, number>;
  /** P(A wins) per snapshot; NaN outside the model. */
  pA: Float64Array | null;
  tests: { p: number; set: (q: number) => void }[];
}

const test = (c: Ctx, p: number, set: (q: number) => void) => {
  if (Number.isFinite(p)) c.tests.push({ p, set });
};

/** The value of a duel to the killer's side: the change in its win probability. */
function dwp(c: Ctx, d: Duel): number {
  if (!c.pA || d.teamkill) return NaN;
  const delta = c.pA[d.post] - c.pA[d.pre];
  return d.kTeam === c.A ? delta : d.kTeam === c.B ? -delta : NaN;
}

function teamsOf(w: CqbWalk): [number, number] | null {
  const n = new Float64Array(MAX_TEAMS);
  for (const r of w.order) for (const s of r.slots) if (s.team >= 0 && s.team < MAX_TEAMS && s.seen) n[s.team]++;
  const idx = [...n.keys()].filter((k) => n[k] > 0).sort((a, b) => n[b] - n[a]);
  return idx.length >= 2 ? [Math.min(idx[0], idx[1]), Math.max(idx[0], idx[1])] : null;
}

function winners(w: CqbWalk, A: number, B: number): Map<number, number> {
  const out = new Map<number, number>();
  for (const r of w.order) {
    const a = r.wonN[A] ? r.wonSum[A] / r.wonN[A] : NaN;
    const b = r.wonN[B] ? r.wonSum[B] / r.wonN[B] : NaN;
    if (a > 0.5 && !(b > 0.5)) out.set(r.id, A);
    else if (b > 0.5 && !(a > 0.5)) out.set(r.id, B);
    else if (Number.isNaN(a) && Number.isNaN(b)) {
      // No result column: a side wiped out lost.
      const aliveA = r.slots.some((s) => s.team === A && s.alive);
      const aliveB = r.slots.some((s) => s.team === B && s.alive);
      const seenA = r.slots.some((s) => s.team === A && s.seen);
      const seenB = r.slots.some((s) => s.team === B && s.seen);
      if (seenA && seenB && aliveA !== aliveB) out.set(r.id, aliveA ? A : B);
    }
  }
  return out;
}

const FEATURES = ['intercept', 'ln alive ratio', 'alive difference', 'A planted', 'B planted', 'A planted x time since', 'B planted x time since', 'round time', 'round time x ln ratio', 'buy difference'];

function features(w: CqbWalk, A: number, B: number, buy: Map<number, number> | null, X: Float64Array, row: number, s: number, p: number): void {
  const o = row * p;
  const nA = w.snapAlive[s * MAX_TEAMS + A];
  const nB = w.snapAlive[s * MAX_TEAMS + B];
  const lr = Math.log((nA + 0.5) / (nB + 0.5));
  const pl = w.snapPlant[s];
  const tsp = Math.min(1, w.snapTsp[s] / 40);
  const tf = Math.min(1.5, w.snapT[s] / 115);
  X[o] = 1;
  X[o + 1] = lr;
  X[o + 2] = nA - nB;
  X[o + 3] = pl === A ? 1 : 0;
  X[o + 4] = pl === B ? 1 : 0;
  X[o + 5] = pl === A ? tsp : 0;
  X[o + 6] = pl === B ? tsp : 0;
  X[o + 7] = tf;
  X[o + 8] = tf * lr;
  if (p > 9) X[o + 9] = buy?.get(w.snapRound[s]) ?? 0;
}

function fold(id: number): number {
  return (Math.imul(id + 1, 2654435761) >>> 0) % 5;
}

function winProb(c: Ctx, out: CqbMetrics): void {
  const { w, A, B } = c;
  // Buy difference per round, where the data has buys.
  let buy: Map<number, number> | null = null;
  if (w.hasBuy) {
    buy = new Map();
    for (const r of w.order) {
      const m = (t: number) => {
        const v = r.slots.filter((s) => s.team === t && Number.isFinite(s.buy)).map((s) => s.buy);
        return v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN;
      };
      const d = m(A) - m(B);
      if (Number.isFinite(d)) buy.set(r.id, d);
    }
    if (buy.size < w.order.length * 0.5) buy = null;
  }
  const p = buy ? 10 : 9;
  const rows: number[] = [];
  for (let s = 0; s < w.snapN; s++) {
    const win = c.winner.get(w.snapRound[s]);
    if (win === undefined) continue;
    if (w.snapAlive[s * MAX_TEAMS + A] + w.snapAlive[s * MAX_TEAMS + B] === 0) continue;
    rows.push(s);
  }
  const roundsIn = new Set(rows.map((s) => w.snapRound[s])).size;
  if (roundsIn < 30) return;
  const X = new Float64Array(rows.length * p);
  const y = new Float64Array(rows.length);
  rows.forEach((s, i) => {
    features(w, A, B, buy, X, i, s, p);
    y[i] = c.winner.get(w.snapRound[s]) === A ? 1 : 0;
  });
  const lambda = 1e-3;
  const full = fitLogit(X, y, rows.length, p, lambda);
  if (!full) return;
  // Out of fold, by round.
  const oof = new Float64Array(rows.length).fill(NaN);
  for (let f = 0; f < 5; f++) {
    const train: number[] = [];
    const held: number[] = [];
    rows.forEach((s, i) => (fold(w.snapRound[s]) === f ? held : train).push(i));
    if (!held.length || train.length < 50) continue;
    const m = fitLogit(X, y, rows.length, p, lambda, train);
    if (!m) continue;
    for (const i of held) oof[i] = predict(m.beta, X, i, p);
  }
  const ok: number[] = [];
  for (let i = 0; i < rows.length; i++) if (Number.isFinite(oof[i])) ok.push(i);
  const cal = calibrate(
    ok.map((i) => oof[i]),
    ok.map((i) => y[i]),
    5,
  );
  // Every snapshot read by the full model.
  const pA = new Float64Array(w.snapN).fill(NaN);
  const one = new Float64Array(p);
  for (let s = 0; s < w.snapN; s++) {
    features(w, A, B, buy, one, 0, s, p);
    pA[s] = predict(full.beta, one, 0, p);
  }
  c.pA = pA;
  let wa = 0;
  for (const v of c.winner.values()) if (v === A) wa++;
  out.winProb = {
    features: FEATURES.slice(0, p),
    beta: [...full.beta].map(r3),
    se: [...full.se].map(r3),
    snapshots: rows.length,
    rounds: roundsIn,
    baseA: r3(wa / Math.max(1, c.winner.size)),
    calibration: {
      ...cal,
      brier: r3(cal.brier),
      brierBase: r3(cal.brierBase),
      skill: r3(cal.skill),
      logLoss: r3(cal.logLoss),
      ece: r3(cal.ece),
      slope: r3(cal.slope),
      intercept: r3(cal.intercept),
      auc: r3(cal.auc),
      bins: cal.bins.map((b) => ({ p: r3(b.p), obs: r3(b.obs), n: b.n, lo: r3(b.lo), hi: r3(b.hi) })),
    },
  };
}

function meanCi(v: number[]): { n: number; mean: number; lo: number; hi: number } {
  const n = v.length;
  if (!n) return { n: 0, mean: NaN, lo: NaN, hi: NaN };
  const m = v.reduce((a, b) => a + b, 0) / n;
  const sd = n > 1 ? Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / (n - 1)) : 0;
  const h = (1.96 * sd) / Math.sqrt(n);
  return { n, mean: r3(m), lo: r3(m - h), hi: r3(m + h) };
}

function actions(c: Ctx, out: CqbMetrics): void {
  if (!c.pA) return;
  const { w } = c;
  const kills: number[] = [];
  const open: number[] = [];
  const rest: number[] = [];
  const trade: number[] = [];
  const notTrade: number[] = [];
  const flashKill: number[] = [];
  const plainKill: number[] = [];
  const isTrade = new Uint8Array(w.duels.length);
  for (const d of w.duels) if (d.tradedBy >= 0) isTrade[d.tradedBy] = 1;
  w.duels.forEach((d, k) => {
    const v = dwp(c, d);
    if (!Number.isFinite(v)) return;
    kills.push(v);
    (d.opening ? open : rest).push(v);
    (isTrade[k] ? trade : notTrade).push(v);
    (d.flashK ? flashKill : plainKill).push(v);
  });
  const plants: number[] = [];
  for (const pl of w.plants) {
    const delta = c.pA[pl.post] - c.pA[pl.pre];
    const v = pl.team === c.A ? delta : pl.team === c.B ? -delta : NaN;
    if (Number.isFinite(v)) plants.push(v);
  }
  const perFlash: number[] = [];
  for (const f of w.flashes) {
    if (f.team !== c.A && f.team !== c.B) continue;
    let s = 0;
    for (const k of f.duels) {
      const d = w.duels[k];
      const v = dwp(c, d);
      if (Number.isFinite(v) && d.kTeam === f.team) s += v / Math.max(1, d.flashBy.length);
    }
    perFlash.push(s);
  }
  const list: NonNullable<CqbMetrics['actions']> = [];
  const add = (kind: string, v: number[], against?: number[]) => {
    if (v.length < 5) return;
    const m: NonNullable<CqbMetrics['actions']>[number] = { kind, ...meanCi(v) };
    if (against && against.length >= 5) {
      m.p = permMeans(v, against, 2000, kind.length * 31).p;
      test(c, m.p, (q) => (m.q = q));
    }
    list.push(m);
  };
  add('kill', kills);
  add('openingKill', open, rest);
  add('tradeKill', trade, notTrade);
  add('flashedKill', flashKill, plainKill);
  add('plant', plants);
  add('flash', perFlash);
  if (list.length) out.actions = list;
}

function opening(c: Ctx, out: CqbMetrics): void {
  const { w, A, B, names } = c;
  const ops = w.duels.filter((d) => d.opening && (d.kTeam === A || d.kTeam === B) && (d.vTeam === A || d.vTeam === B));
  if (ops.length < 10) return;
  const aWins = ops.filter((d) => d.kTeam === A).length;
  let conv = 0;
  let convN = 0;
  const byTeam = [A, B].map((t) => {
    const mine = ops.filter((d) => d.kTeam === t);
    let k = 0;
    let n = 0;
    for (const d of mine) {
      const win = c.winner.get(d.round);
      if (win === undefined) continue;
      n++;
      if (win === t) k++;
    }
    conv += k;
    convN += n;
    return { team: names.teams[t] ?? `#${t}`, won: share(mine.length, ops.length), convert: share(k, n) };
  });
  const base = aWins / ops.length;
  const byPlace = new Map<number, Duel[]>();
  for (const d of ops) if (d.place >= 0) (byPlace.get(d.place) ?? byPlace.set(d.place, []).get(d.place)!).push(d);
  const places: NonNullable<CqbMetrics['opening']>['places'] = [];
  for (const [pl, ds] of byPlace) {
    if (ds.length < 12) continue;
    const k = ds.filter((d) => d.kTeam === A).length;
    const v = ds.map((d) => dwp(c, d)).filter(Number.isFinite);
    const row = { place: placeName(c, pl), n: ds.length, a: share(k, ds.length), p: binomTwoSided(k, ds.length, base), value: r3(v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN) } as NonNullable<CqbMetrics['opening']>['places'][number];
    test(c, row.p, (q) => (row.q = q));
    places.push(row);
  }
  places.sort((a, b) => a.p - b.p);
  out.opening = { n: ops.length, a: share(aWins, ops.length), convert: share(conv, convN), byTeam, places: places.slice(0, 12) };
}

function placeName(c: Ctx, pl: number): string {
  if (c.w.placeCells) {
    const cell = c.w.opt.cell;
    const ix = (pl >>> 16) << 16 >> 16;
    const iz = (pl & 0xffff) << 16 >> 16;
    return `cell ${ix * cell},${iz * cell} m`;
  }
  return c.names.places?.[pl] || `#${pl}`;
}

function trades(c: Ctx, out: CqbMetrics): void {
  const { w, A, B, names } = c;
  const ds = w.duels.filter((d) => !d.teamkill && (d.vTeam === A || d.vTeam === B));
  if (ds.length < 20) return;
  const traded = ds.filter((d) => d.tradedBy >= 0);
  // Rounds whose first death was traded, against those where it was not.
  let tk = 0;
  let tn = 0;
  let uk = 0;
  let un = 0;
  for (const d of ds) {
    if (!d.opening) continue;
    const win = c.winner.get(d.round);
    if (win === undefined) continue;
    if (d.tradedBy >= 0) {
      tn++;
      if (win === d.vTeam) tk++;
    } else {
      un++;
      if (win === d.vTeam) uk++;
    }
  }
  const first = contrast(tk, tn, uk, un);
  test(c, first.p, (q) => (first.q = q));
  out.trades = {
    deaths: ds.length,
    traded: share(traded.length, ds.length),
    medianSecs: r3(median(traded.map((d) => d.tradeT))),
    byTeam: [A, B].map((t) => {
      const mine = ds.filter((d) => d.vTeam === t);
      return { team: names.teams[t] ?? `#${t}`, traded: share(mine.filter((d) => d.tradedBy >= 0).length, mine.length) };
    }),
    firstDeath: first,
  };
}

/** The peeker and the holder of a duel: who moved into it and who held still; null when it is not that kind of duel. */
function roles(c: Ctx, d: Duel): { peekerWon: boolean; peekTeam: number; holdTeam: number; holderCross: number; holderPre: number; peekerFlash: boolean; peekerSmoke: boolean } | null {
  const upm = c.w.opt.upm;
  const vk = d.vk / upm;
  const vv = d.vv / upm;
  if (!Number.isFinite(vk) || !Number.isFinite(vv) || d.teamkill) return null;
  if (vk >= MOVE && vv <= STILL) return { peekerWon: true, peekTeam: d.kTeam, holdTeam: d.vTeam, holderCross: d.crossV, holderPre: d.preV, peekerFlash: d.flashK, peekerSmoke: d.smokeK };
  if (vv >= MOVE && vk <= STILL) return { peekerWon: false, peekTeam: d.vTeam, holdTeam: d.kTeam, holderCross: d.crossK, holderPre: d.preK, peekerFlash: d.flashV, peekerSmoke: d.smokeV };
  return null;
}

function peeks(c: Ctx, out: CqbMetrics): void {
  const { w, A, B, names } = c;
  const rs = w.duels.map((d) => ({ d, r: roles(c, d) })).filter((x) => x.r && (x.d.kTeam === A || x.d.kTeam === B)) as { d: Duel; r: NonNullable<ReturnType<typeof roles>> }[];
  if (rs.length >= 20) {
    const k = rs.filter((x) => x.r.peekerWon).length;
    const pk = { n: rs.length, peeker: share(k, rs.length), p: binomTwoSided(k, rs.length, 0.5), byTeam: [A, B].map((t) => {
      const mine = rs.filter((x) => x.r.peekTeam === t);
      return { team: names.teams[t] ?? `#${t}`, peeker: share(mine.filter((x) => x.r.peekerWon).length, mine.length) };
    }) } as NonNullable<CqbMetrics['peek']>;
    test(c, pk.p, (q) => (pk.q = q));
    out.peek = pk;
    // Crossfire: the holder with a teammate crossing its line onto the peeker.
    const withX = rs.filter((x) => x.r.holderCross > 0);
    const noX = rs.filter((x) => x.r.holderCross === 0);
    if (withX.length >= 5 && noX.length >= 5) {
      const cf = { ...contrast(withX.filter((x) => !x.r.peekerWon).length, withX.length, noX.filter((x) => !x.r.peekerWon).length, noX.length), n: rs.length };
      test(c, cf.p, (q) => (cf.q = q));
      out.crossfire = cf;
    }
    // Utility into the entry: the peeker's side flashed (smoked) nearby just before.
    const ut = (f: (x: (typeof rs)[number]) => boolean): Contrast | null => {
      const a = rs.filter(f);
      const b = rs.filter((x) => !f(x));
      if (a.length < 5 || b.length < 5) return null;
      const ct = contrast(a.filter((x) => x.r.peekerWon).length, a.length, b.filter((x) => x.r.peekerWon).length, b.length);
      test(c, ct.p, (q) => (ct.q = q));
      return ct;
    };
    const flashEntry = ut((x) => x.r.peekerFlash);
    const smokeEntry = ut((x) => x.r.peekerSmoke);
    // Opening duels: the side with a flash of its own in the seconds before, against without.
    const ops = w.duels.filter((d) => d.opening && !d.teamkill && d.flashK !== d.flashV);
    let openingFlash: Contrast | null = null;
    if (ops.length >= 10) {
      const k1 = ops.filter((d) => d.flashK).length;
      openingFlash = { ...contrast(k1, ops.length, ops.length - k1, ops.length), p: binomTwoSided(k1, ops.length, 0.5) };
      test(c, openingFlash.p, (q) => (openingFlash!.q = q));
    }
    const deaths = w.duels.filter((d) => !d.teamkill);
    const thrown = [A, B].map((t) => ({ team: names.teams[t] ?? `#${t}`, flash: w.utilCount[0 * MAX_TEAMS + t], smoke: w.utilCount[1 * MAX_TEAMS + t], he: w.utilCount[2 * MAX_TEAMS + t], fire: w.utilCount[3 * MAX_TEAMS + t] }));
    const pf = out.actions?.find((a) => a.kind === 'flash');
    out.utility = { flashEntry, smokeEntry, openingFlash, victimFlashed: w.hasFlashed && deaths.length ? share(deaths.filter((d) => d.flashedV).length, deaths.length) : null, perFlash: pf ? pf.mean : NaN, thrown };
  }
  // Aim: who was looking closer to the other a moment before.
  const am = w.duels.filter((d) => !d.teamkill && Number.isFinite(d.preK) && Number.isFinite(d.preV));
  if (am.length >= 20) {
    const k = am.filter((d) => d.preK < d.preV).length;
    const upm = w.opt.upm;
    const dist = Float64Array.from(am.map((d) => d.d / upm)).sort();
    // Holders on their angle (within 15 degrees at the read) against off it: who wins.
    const hold = rs.filter((x) => Number.isFinite(x.r.holderPre));
    const on = hold.filter((x) => x.r.holderPre <= (15 * Math.PI) / 180);
    const off = hold.filter((x) => x.r.holderPre > (15 * Math.PI) / 180);
    let holderOnAngle: Contrast | null = null;
    if (on.length >= 5 && off.length >= 5) {
      holderOnAngle = contrast(on.filter((x) => !x.r.peekerWon).length, on.length, off.filter((x) => !x.r.peekerWon).length, off.length);
      test(c, holderOnAngle.p, (q) => (holderOnAngle!.q = q));
    }
    const aim = {
      n: am.length,
      killerPreDeg: r3(deg(median(am.map((d) => d.preK)))),
      victimPreDeg: r3(deg(median(am.map((d) => d.preV)))),
      betterAimed: share(k, am.length),
      p: binomTwoSided(k, am.length, 0.5),
      rangeM: { p25: r3(quantileSorted(dist, 0.25)), p50: r3(quantileSorted(dist, 0.5)), p75: r3(quantileSorted(dist, 0.75)) },
      holderOnAngle,
    } as NonNullable<CqbMetrics['aim']>;
    test(c, aim.p, (q) => (aim.q = q));
    out.aim = aim;
  }
}

/** Alive counts of A and B after each death of a round, in order. */
function states(c: Ctx, r: Round): [number, number][] {
  const { w, A, B } = c;
  return r.duels.map((k) => {
    const s = w.duels[k].post;
    return [w.snapAlive[s * MAX_TEAMS + A], w.snapAlive[s * MAX_TEAMS + B]];
  });
}

function manAdvantage(c: Ctx, out: CqbMetrics): void {
  const tally = new Map<string, [number, number]>();
  for (const r of c.w.order) {
    const win = c.winner.get(r.id);
    if (win === undefined) continue;
    const seen = new Set<string>();
    for (const [a, b] of states(c, r)) {
      if (!a || !b) continue;
      for (const [own, enemy, won] of [[a, b, win === c.A], [b, a, win === c.B]] as [number, number, boolean][]) {
        const key = `${own}v${enemy}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const t = tally.get(key) ?? [0, 0];
        t[1]++;
        if (won) t[0]++;
        tally.set(key, t);
      }
    }
  }
  const rows = [...tally].filter(([, t]) => t[1] >= 10).map(([k, t]) => {
    const [own, enemy] = k.split('v').map(Number);
    return { own, enemy, won: share(t[0], t[1]) };
  });
  rows.sort((a, b) => b.own + b.enemy - (a.own + a.enemy) || b.own - a.own);
  if (rows.length) out.manAdvantage = rows;
}

function clutch(c: Ctx, out: CqbMetrics): void {
  if (!c.pA) return;
  const by = new Map<number, { attempts: number; wins: number; expected: number; v: number }>();
  for (const r of c.w.order) {
    const win = c.winner.get(r.id);
    if (win === undefined) continue;
    for (const [team, [, snap]] of r.clutch) {
      if (team !== c.A && team !== c.B) continue;
      const foe = team === c.A ? c.B : c.A;
      const vs = c.w.snapAlive[snap * MAX_TEAMS + foe];
      if (vs < 1) continue;
      const pa = c.pA[snap];
      const e = team === c.A ? pa : 1 - pa;
      const g = by.get(vs) ?? { attempts: 0, wins: 0, expected: 0, v: 0 };
      g.attempts++;
      if (win === team) g.wins++;
      g.expected += e;
      g.v += e * (1 - e);
      by.set(vs, g);
    }
  }
  const rows = [...by].sort((a, b) => a[0] - b[0]).filter(([, g]) => g.attempts >= 5).map(([vs, g]) => {
    const row = { vs, attempts: g.attempts, wins: g.wins, expected: r3(g.expected), p: g.v > 0 ? zTwoSided((g.wins - g.expected) / Math.sqrt(g.v)) : 1 } as NonNullable<CqbMetrics['clutch']>['byN'][number];
    test(c, row.p, (q) => (row.q = q));
    return row;
  });
  if (rows.length) out.clutch = { byN: rows };
}

function setups(c: Ctx, out: CqbMetrics): void {
  const { w, A, B, names } = c;
  const stack: NonNullable<CqbMetrics['setups']>['stack'] = [];
  for (const t of [A, B]) {
    const st = [0, 0, 0, 0];
    for (const r of w.order) {
      const win = c.winner.get(r.id);
      if (win === undefined || !r.stack || !r.stack[t]) continue;
      const i = r.stack[t] >= 3 ? 0 : 2;
      st[i + 1]++;
      if (win === t) st[i]++;
    }
    if (st[1] >= 5 && st[3] >= 5) {
      const ct = contrast(st[0], st[1], st[2], st[3]);
      const row = { team: names.teams[t] ?? `#${t}`, stacked: ct.with, spread: ct.without, p: ct.p } as (typeof stack)[number];
      test(c, row.p, (q) => (row.q = q));
      stack.push(row);
    }
  }
  const rotation: NonNullable<CqbMetrics['setups']>['rotation'] = [];
  for (const kind of [0, 1] as const)
    for (const t of [A, B]) {
      const rot = w.rotations.filter((x) => x.kind === kind && x.team === t);
      if (rot.length < 10) continue;
      const byRound = new Map<number, number[]>();
      for (const x of rot) (byRound.get(x.round) ?? byRound.set(x.round, []).get(x.round)!).push(x.took);
      const fs = [0, 0, 0, 0];
      for (const [rid, took] of byRound) {
        const win = c.winner.get(rid);
        if (win === undefined) continue;
        const fast = took.filter((v) => v <= 15).length * 2 >= took.length;
        const i = fast ? 0 : 2;
        fs[i + 1]++;
        if (win === t) fs[i]++;
      }
      const arrived = rot.filter((x) => Number.isFinite(x.took));
      const ct = contrast(fs[0], fs[1], fs[2], fs[3]);
      const row = { team: names.teams[t] ?? `#${t}`, kind: kind ? 'objective' : 'fight', n: rot.length, medianSecs: r3(median(arrived.map((x) => x.took))), arrived: share(arrived.length, rot.length), fast: ct.with, slow: ct.without, p: ct.p } as (typeof rotation)[number];
      if (fs[1] >= 5 && fs[3] >= 5) test(c, row.p, (q) => (row.q = q));
      else row.p = NaN;
      rotation.push(row);
    }
  const lurk: NonNullable<CqbMetrics['setups']>['lurk'] = [];
  for (const t of [A, B]) {
    const tot = w.lurkT[t] + w.packT[t];
    if (tot <= 0) continue;
    let lk = 0;
    let ld = 0;
    let pk = 0;
    let pd = 0;
    for (const d of w.duels) {
      if (d.teamkill) continue;
      if (d.kTeam === t && Number.isFinite(d.nearK)) d.nearK > LURK ? lk++ : pk++;
      if (d.vTeam === t && Number.isFinite(d.nearV)) d.nearV > LURK ? ld++ : pd++;
    }
    if (lk + ld < 10 || pk + pd < 10) continue;
    // Kills per death lurking against with the pack: an odds ratio (Woolf's interval, Haldane's half) and Fisher's test.
    const or = ((lk + 0.5) / (ld + 0.5)) / ((pk + 0.5) / (pd + 0.5));
    const se = Math.sqrt(1 / (lk + 0.5) + 1 / (ld + 0.5) + 1 / (pk + 0.5) + 1 / (pd + 0.5));
    const row = { team: names.teams[t] ?? `#${t}`, timeShare: r3(w.lurkT[t] / tot), lurkKd: r3(ld ? lk / ld : NaN), packKd: r3(pd ? pk / pd : NaN), ratio: r3(or), lo: r3(or * Math.exp(-1.96 * se)), hi: r3(or * Math.exp(1.96 * se)), p: fisher(lk, ld, pk, pd) } as (typeof lurk)[number];
    test(c, row.p, (q) => (row.q = q));
    lurk.push(row);
  }
  if (stack.length || rotation.length || lurk.length) out.setups = { stack, rotation, lurk };
}

function postPlant(c: Ctx, out: CqbMetrics): void {
  const { w, A, B } = c;
  let k = 0;
  let n = 0;
  const tally = new Map<string, [number, number]>();
  for (const r of w.order) {
    const win = c.winner.get(r.id);
    if (win === undefined || !Number.isFinite(r.plantT) || (r.plantTeam !== A && r.plantTeam !== B) || !r.plantAlive) continue;
    n++;
    if (win === r.plantTeam) k++;
    const own = r.plantAlive[r.plantTeam];
    const enemy = r.plantAlive[r.plantTeam === A ? B : A];
    const key = `${own}v${enemy}`;
    const t = tally.get(key) ?? [0, 0];
    t[1]++;
    if (win === r.plantTeam) t[0]++;
    tally.set(key, t);
  }
  if (n < 10) return;
  const plantTeam = new Map(w.order.map((r) => [r.id, r.plantTeam]));
  const pp = w.duels.filter((d) => d.postPlant && !d.teamkill);
  const held = pp.filter((d) => d.kTeam === plantTeam.get(d.round)).length;
  out.postPlant = {
    rounds: n,
    planter: share(k, n),
    byNumbers: [...tally].filter(([, t]) => t[1] >= 5).map(([key, t]) => {
      const [own, enemy] = key.split('v').map(Number);
      return { own, enemy, won: share(t[0], t[1]) };
    }).sort((a, b) => b.own - b.enemy - (a.own - a.enemy)),
    holderDuels: share(held, pp.length),
  };
}

function funnel(c: Ctx, out: CqbMetrics): void {
  const { w } = c;
  if (w.entN < 50) return;
  const by = new Map<number, [number, number]>();
  let deaths = 0;
  for (let i = 0; i < w.entN; i++) {
    const t = by.get(w.entPlace[i]) ?? [0, 0];
    t[0]++;
    t[1] += w.entDied[i];
    deaths += w.entDied[i];
    by.set(w.entPlace[i], t);
  }
  const base = deaths / w.entN;
  if (!(base > 0)) return;
  const rows: NonNullable<CqbMetrics['funnel']>['places'] = [];
  const m = 20;
  for (const [pl, [n, k]] of by) {
    if (n < 20) continue;
    const [lo, hi] = wilson(k, n);
    const row = { place: placeName(c, pl), entries: n, deaths: k, rate: r3(k / n), lo: r3(lo), hi: r3(hi), ratio: r3((k + m * base) / (n + m) / base), p: binomTwoSided(k, n, base) } as NonNullable<CqbMetrics['funnel']>['places'][number];
    // Every place tried joins the one false discovery rate of all the tests, not only those shown.
    test(c, row.p, (q) => (row.q = q));
    rows.push(row);
  }
  rows.sort((a, b) => b.ratio - a.ratio);
  out.funnel = { entries: w.entN, base: r3(base), places: rows.slice(0, 8) };
}

function impact(c: Ctx, out: CqbMetrics): void {
  if (!c.pA) return;
  const { w, A, B, names } = c;
  // Win probability added per player and round.
  const per = new Map<number, Map<number, number>>();
  const add = (round: number, person: number, v: number) => {
    let m = per.get(person);
    if (!m) per.set(person, (m = new Map()));
    m.set(round, (m.get(round) ?? 0) + v);
  };
  for (const r of w.order) for (const s of r.slots) if (s.seen && (s.team === A || s.team === B)) add(r.id, s.person, 0);
  for (const d of w.duels) {
    const v = dwp(c, d);
    if (!Number.isFinite(v)) continue;
    add(d.round, d.killer, v);
    add(d.round, d.victim, -v);
  }
  for (const pl of w.plants) {
    const delta = c.pA[pl.post] - c.pA[pl.pre];
    const v = pl.team === A ? delta : pl.team === B ? -delta : NaN;
    if (Number.isFinite(v)) add(pl.round, pl.person, v);
  }
  const people = [...per.keys()];
  const sum = people.map((p) => [...per.get(p)!.values()].reduce((a, b) => a + b, 0));
  const sq = people.map((p) => [...per.get(p)!.values()].reduce((a, b) => a + b * b, 0));
  const n = people.map((p) => per.get(p)!.size);
  const eb = ebShrink(sum, sq, n);
  const wpa: PlayerValue[] = people
    .map((p, i) => ({ personIndex: p, value: r3(eb.groups[i].mean), lo: r3(eb.groups[i].mean - 1.96 * eb.groups[i].sd), hi: r3(eb.groups[i].mean + 1.96 * eb.groups[i].sd), rounds: n[i] }))
    .filter((x) => x.rounds >= 10)
    .sort((a, b) => b.value - a.value);
  // Ridge adjusted plus-minus: round result less the model's start, on +1 for side A's players, -1 for B's.
  const idx = new Map(people.map((p, i) => [p, i]));
  const off: number[] = [0];
  const cols: number[] = [];
  const vals: number[] = [];
  const y: number[] = [];
  for (const r of w.order) {
    const win = c.winner.get(r.id);
    if (win === undefined || !r.snaps.length) continue;
    const p0 = c.pA[r.snaps[0]];
    if (!Number.isFinite(p0)) continue;
    for (const s of r.slots) {
      if (!s.seen || (s.team !== A && s.team !== B)) continue;
      cols.push(idx.get(s.person)!);
      vals.push(s.team === A ? 1 : -1);
    }
    off.push(cols.length);
    y.push((win === A ? 1 : 0) - p0);
  }
  let rapm: PlayerValue[] = [];
  let lambda = NaN;
  if (y.length >= 30 && people.length >= 2) {
    const O = Int32Array.from(off);
    const C = Int32Array.from(cols);
    const V = Float32Array.from(vals);
    let best = Infinity;
    for (const lam of [1, 3, 10, 30, 100, 300]) {
      let err = 0;
      for (let f = 0; f < 5; f++) {
        const train: number[] = [];
        const held: number[] = [];
        for (let i = 0; i < y.length; i++) (i % 5 === f ? held : train).push(i);
        const b = ridgeSparse(O, C, V, y, people.length, lam, train);
        for (const i of held) {
          let s = 0;
          for (let k = O[i]; k < O[i + 1]; k++) s += V[k] * b[C[k]];
          err += (y[i] - s) ** 2;
        }
      }
      if (err < best) {
        best = err;
        lambda = lam;
      }
    }
    const b = ridgeSparse(O, C, V, y, people.length, lambda);
    rapm = people.map((p, i) => ({ personIndex: p, value: r3(b[i]), rounds: n[i] })).filter((x) => x.rounds >= 10).sort((a, b2) => b2.value - a.value);
  }
  const groups = (key: (d: Duel) => number, label: (g: number) => string): GroupValue[] => {
    const m = new Map<number, number[]>();
    for (const d of w.duels) {
      const v = dwp(c, d);
      const g = key(d);
      if (!Number.isFinite(v) || g < 0) continue;
      (m.get(g) ?? m.set(g, []).get(g)!).push(v);
    }
    const ks = [...m.keys()];
    const s = ks.map((g) => m.get(g)!.reduce((a, b) => a + b, 0));
    const s2 = ks.map((g) => m.get(g)!.reduce((a, b) => a + b * b, 0));
    const nn = ks.map((g) => m.get(g)!.length);
    const e = ebShrink(s, s2, nn);
    return ks
      .map((g, i) => ({ name: label(g), n: nn[i], mean: r3(e.groups[i].mean), lo: r3(e.groups[i].mean - 1.96 * e.groups[i].sd), hi: r3(e.groups[i].mean + 1.96 * e.groups[i].sd), raw: r3(e.groups[i].raw) }))
      .filter((x) => x.n >= 10)
      .sort((a, b) => b.mean - a.mean);
  };
  const top = <T>(v: T[]) => (v.length <= 10 ? v : [...v.slice(0, 5), ...v.slice(-5)]);
  out.impact = {
    wpa: top(wpa),
    rapm: top(rapm),
    lambda,
    players: people.length,
    places: top(groups((d) => d.place, (g) => placeName(c, g))),
    weapons: top(groups((d) => d.weapon, (g) => names.weapons?.[g] || `#${g}`)),
  };
  if (names.persons) for (const v of [...out.impact.wpa, ...out.impact.rapm]) v.person = names.persons[v.personIndex] ?? `#${v.personIndex}`;
}

export function finishCqb(w: CqbWalk, names: CqbNames): CqbMetrics | undefined {
  const ab = teamsOf(w);
  if (!ab || w.duels.length < 10) return undefined;
  const [A, B] = ab;
  const winner = winners(w, A, B);
  const roundBased = w.order.length >= 5 && w.multiDeath <= 0.1 * w.order.length;
  const c: Ctx = { w, names, A, B, winner, pA: null, tests: [] };
  const out: CqbMetrics = {
    schema: 'heat3d.cqb/1',
    teams: [names.teams[A] ?? `#${A}`, names.teams[B] ?? `#${B}`],
    rounds: w.order.length,
    decided: winner.size,
    roundBased,
    duels: w.duelsSeen,
    tests: 0,
    discoveries: 0,
  };
  if (roundBased) winProb(c, out);
  actions(c, out);
  if (roundBased) opening(c, out);
  trades(c, out);
  peeks(c, out);
  if (roundBased) {
    manAdvantage(c, out);
    clutch(c, out);
    setups(c, out);
    postPlant(c, out);
  } else setups(c, out);
  funnel(c, out);
  impact(c, out);
  const q = bhAdjust(c.tests.map((x) => x.p));
  c.tests.forEach((x, i) => x.set(r3(q[i])));
  out.tests = c.tests.length;
  out.discoveries = [...q].filter((v) => v < 0.05).length;
  return jsonSafe(out);
}

/** The report is plain JSON: a number that could not be measured (NaN, an empty share) is null there. */
function jsonSafe<T>(v: T): T {
  const walk = (x: unknown): unknown => {
    if (typeof x === 'number') return Number.isFinite(x) ? x : null;
    if (Array.isArray(x)) return x.map(walk);
    if (x && typeof x === 'object') return Object.fromEntries(Object.entries(x).map(([k, y]) => [k, walk(y)]));
    return x;
  };
  return walk(v) as T;
}

/** Seconds and metres the metrics use, for the docs and the narrator. */
export const CQB_CONSTANTS = { tradeSecs: TRADE_SECS, flashSecs: FLASH_SECS, lurkM: LURK, moveMs: MOVE, stillMs: STILL };

/**
 * A match's raw counts, additive over matches (the many-match summary,
 * `summary.ts`): no thresholds, no model - a thousand matches' counts add up
 * to the shares above.
 */
export interface CqbCounts {
  teams: [string, string];
  rounds: number;
  decided: number;
  duels: number;
  /** Side A's opening wins, openings, rounds won by the opening's winner, openings with a known result. */
  opening: [number, number, number, number];
  /** Deaths traded, deaths, seconds to the trade summed. */
  trades: [number, number, number];
  /** Peeker wins, peeker-holder duels. */
  peek: [number, number];
  /** Holder wins and duels with a crossfire, then without. */
  cross: [number, number, number, number];
  /** Peeker wins and duels behind its own flash, then without. */
  flash: [number, number, number, number];
  /** Duels won by the better-aimed, duels with both aims known. */
  aim: [number, number];
  /** Per state `own v enemy` first reached: rounds won, rounds. */
  man: Record<string, [number, number]>;
  /** Planting side's rounds won, rounds planted. */
  plant: [number, number];
  /** Per place: entries, deaths within the funnel window (the 40 most entered). */
  funnel: Record<string, [number, number]>;
}

export function cqbCounts(w: CqbWalk, names: CqbNames): CqbCounts | null {
  const ab = teamsOf(w);
  if (!ab) return null;
  const [A, B] = ab;
  const winner = winners(w, A, B);
  const c: Ctx = { w, names, A, B, winner, pA: null, tests: [] };
  const fair = w.duels.filter((d) => !d.teamkill && (d.kTeam === A || d.kTeam === B) && (d.vTeam === A || d.vTeam === B));
  const ops = fair.filter((d) => d.opening);
  let ck = 0;
  let cn = 0;
  for (const d of ops) {
    const win = winner.get(d.round);
    if (win === undefined) continue;
    cn++;
    if (win === d.kTeam) ck++;
  }
  const traded = fair.filter((d) => d.tradedBy >= 0);
  const rs = fair.map((d) => roles(c, d)).filter((x): x is NonNullable<ReturnType<typeof roles>> => !!x);
  const cw = rs.filter((x) => x.holderCross > 0);
  const cn0 = rs.filter((x) => x.holderCross === 0);
  const fw = rs.filter((x) => x.peekerFlash);
  const fn = rs.filter((x) => !x.peekerFlash);
  const am = fair.filter((d) => Number.isFinite(d.preK) && Number.isFinite(d.preV));
  const man: Record<string, [number, number]> = {};
  let pk = 0;
  let pn = 0;
  for (const r of w.order) {
    const win = winner.get(r.id);
    if (win === undefined) continue;
    const seen = new Set<string>();
    for (const [a, b] of states(c, r)) {
      if (!a || !b) continue;
      for (const [own, enemy, won] of [[a, b, win === A], [b, a, win === B]] as [number, number, boolean][]) {
        const key = `${own}v${enemy}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const t = (man[key] ??= [0, 0]);
        t[1]++;
        if (won) t[0]++;
      }
    }
    if (Number.isFinite(r.plantT) && (r.plantTeam === A || r.plantTeam === B)) {
      pn++;
      if (win === r.plantTeam) pk++;
    }
  }
  const fun = new Map<number, [number, number]>();
  for (let i = 0; i < w.entN; i++) {
    const t = fun.get(w.entPlace[i]) ?? [0, 0];
    t[0]++;
    t[1] += w.entDied[i];
    fun.set(w.entPlace[i], t);
  }
  const funnel: Record<string, [number, number]> = {};
  for (const [pl, t] of [...fun].sort((a, b) => b[1][0] - a[1][0]).slice(0, 40)) funnel[placeName(c, pl)] = t;
  return {
    teams: [names.teams[A] ?? `#${A}`, names.teams[B] ?? `#${B}`],
    rounds: w.order.length,
    decided: winner.size,
    duels: w.duelsSeen,
    opening: [ops.filter((d) => d.kTeam === A).length, ops.length, ck, cn],
    trades: [traded.length, fair.length, Math.round(traded.reduce((s, d) => s + d.tradeT, 0) * 10) / 10],
    peek: [rs.filter((x) => x.peekerWon).length, rs.length],
    cross: [cw.filter((x) => !x.peekerWon).length, cw.length, cn0.filter((x) => !x.peekerWon).length, cn0.length],
    flash: [fw.filter((x) => x.peekerWon).length, fw.length, fn.filter((x) => x.peekerWon).length, fn.length],
    aim: [am.filter((d) => d.preK < d.preV).length, am.length],
    man,
    plant: [pk, pn],
    funnel,
  };
}
