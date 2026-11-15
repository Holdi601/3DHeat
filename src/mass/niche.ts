/**
 * Niches: groups of lives (or of a map's places) that do markedly better or
 * worse than the rest - a vehicle on one map in one mode on one side, kills
 * in one sector at one height - found by a beam search over combinations of
 * the factors the summaries hold (docs/mass-analysis.md, Stage B).
 *
 * Tables: `lives` (every vehicle of every match: game, map, mode, class,
 * vehicle, side, tier, player or AI, period of the dates, length of the
 * match; targets K/D, win, death per life, kills an hour, earnings a
 * minute), `places` (each match's kills and deaths by sector of the map,
 * class, side and height band) and `phases` (by sector and fifth of the
 * match: K/D and deaths an hour of presence).
 *
 * A group is tested against the whole with matches as clusters (the
 * sandwich variance of its residuals summed by match), so one long match or
 * one server's habit is no niche; its effect is an odds (or rate) ratio
 * shrunk towards 1 by a prior of `PRIOR` outcomes, it needs `MIN_N`
 * outcomes in `MIN_MATCHES` matches, and a refinement must be stronger than
 * the group it refines. Benjamini-Hochberg over every group evaluated; what
 * is kept also agrees in at least four of five folds of the matches and is
 * not a refinement that only repeats its parent.
 *
 * The `rounds` table (`roundsTable`) has the round's result as its target:
 * each life's round on a map (its side, the part of the match, its vehicle -
 * an operator, an agent -, the weapon it used most, the place it held
 * longest, the buy, whether its side made the first kill). Each row is judged
 * against its own side's win rate in its own match (a stratified expectation,
 * as Mantel-Haenszel), so a niche is a group that wins more (or less) than the
 * same side did in the same matches - never the map's or the side's balance.
 * Its z is calibrated against the search run again on the results shuffled
 * between the rounds of each side of each match (`NULL_RUNS` times): the
 * spread of the null's z (Efron's empirical null) scales the real ones before
 * their p and the false discovery rate. Ranked by the lift times the support
 * (`wracc`), held by the evidence and the folds.
 */

import { NOT_DRIVEN, type MassStore } from './store';
import { ST_BINS, type PlaceMatch, type ScanFrame } from './scan';
import { BANDS, GRID_KINDS, UR_STRIDE } from './types';
import { VEHICLE_CLASSES } from '../data/canonical';
import { pOfZ } from './scan';

export const NICHE_FDR = 0.05;
/** Searches on shuffled results a calibrated target's null is drawn from. */
export const NULL_RUNS = 8;
const MIN_N = 30;
const MIN_MATCHES = 8;
const PRIOR = 20;
const BEAM = 24;
const DEPTH = 3;
const FOLDS = 5;
/** Shrunk ratio a kept niche needs at least (or its inverse). */
const MIN_RATIO = 1.25;
const NICHE_MAX = 60;

export type NicheTarget = 'kd' | 'win' | 'death' | 'kph' | 'earn' | 'deathRate' | 'roundWin';

export interface NicheCond {
  f: string;
  v: string;
  /** What to show for the value (a vehicle's display name). */
  label?: string;
}

export interface NicheFinding {
  id: string;
  table: string;
  target: NicheTarget;
  type: 'share' | 'rate';
  conds: NicheCond[];
  dir: 1 | -1;
  /** Successes (kills, wins, deaths) and outcomes (or exposure: hours, minutes) in the group; the whole's rate. */
  k: number;
  n: number;
  value: number;
  base: number;
  /** Odds ratio (share) or rate ratio against the rest: raw, shrunk, ~95% interval. */
  ratio: number;
  shrunk: number;
  lo: number;
  hi: number;
  z: number;
  p: number;
  q: number;
  /** Weighted relative accuracy: the group's share of outcomes times its difference from the whole. */
  wracc: number;
  rows: number;
  matches: number;
  folds: number;
  foldsAgree: number;
  score: number;
  /** A calibrated target: the empirical null's scale the z was divided by. */
  nullScale?: number;
  /** Matches whose rows show it the most (for the drill-down), and a few of their rounds `[match, round]`. */
  matchIds?: number[];
  rounds?: [number, number][];
}

/** A table of rows: factor codes, the match a row is from, and targets as (k, n) columns. */
export interface NicheTable {
  name: string;
  factors: string[];
  /** Factors another one fixes (a vehicle fixes its class): not refined by once it is there. */
  implies: Record<string, string[]>;
  levels: string[][];
  labels: (string | undefined)[][];
  codes: Int32Array[];
  match: Int32Array;
  rows: number;
  targets: {
    id: NicheTarget;
    type: 'share' | 'rate';
    k: Float64Array;
    n: Float64Array;
    /** Expected successes per row (stratified): the residual is `k - e` instead of `k - n * p0`. */
    e?: Float64Array;
    /** Outcome units (a side's round) and the strata they are shuffled within (a side in a match), for the null. */
    unit?: Int32Array;
    stratum?: Int32Array;
    /** Per row, its round number (for the drill-down). */
    round?: Int32Array;
  }[];
}

class Codes {
  readonly levels: string[] = [];
  readonly labels: (string | undefined)[] = [];
  private readonly map = new Map<string, number>();
  id(v: string | null | undefined, label?: string): number {
    if (v === null || v === undefined || v === '') return -1;
    let i = this.map.get(v);
    if (i === undefined) {
      i = this.levels.length;
      this.levels.push(v);
      this.labels.push(label && label !== v ? label : undefined);
      this.map.set(v, i);
    }
    return i;
  }
}

/** A growing table being filled a row at a time. */
export class NicheBuilder {
  readonly codes: Codes[];
  readonly cols: number[][];
  readonly match: number[] = [];
  readonly t: {
    id: NicheTarget;
    type: 'share' | 'rate';
    k: number[];
    n: number[];
  }[];
  constructor(
    readonly name: string,
    readonly factors: string[],
    targets: { id: NicheTarget; type: 'share' | 'rate' }[],
    readonly implies: Record<string, string[]> = {},
  ) {
    this.codes = factors.map(() => new Codes());
    this.cols = factors.map(() => []);
    this.t = targets.map((t) => ({ ...t, k: [], n: [] }));
  }
  push(match: number, values: (string | null | [string, string])[], kn: [number, number][]): void {
    values.forEach((v, j) => this.cols[j].push(Array.isArray(v) ? this.codes[j].id(v[0], v[1]) : this.codes[j].id(v)));
    this.match.push(match);
    kn.forEach(([k, n], j) => {
      this.t[j].k.push(k);
      this.t[j].n.push(n);
    });
  }
  get rows(): number {
    return this.match.length;
  }
  done(): NicheTable {
    return {
      name: this.name,
      factors: this.factors,
      implies: this.implies,
      levels: this.codes.map((c) => c.levels),
      labels: this.codes.map((c) => c.labels),
      codes: this.cols.map((c) => Int32Array.from(c)),
      match: Int32Array.from(this.match),
      rows: this.match.length,
      targets: this.t.map((t) => ({
        id: t.id,
        type: t.type,
        k: Float64Array.from(t.k),
        n: Float64Array.from(t.n),
      })),
    };
  }
}

const day = (sec: number) => new Date(sec * 1000).toISOString().slice(0, 10);

/** The matches' periods (quarters of the filter's dates) and lengths (thirds), by match. */
function matchBins(s: MassStore, mask: Uint8Array): { period: (string | null)[]; length: (string | null)[] } {
  const dates: number[] = [];
  const lens: number[] = [];
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    const st = s.m.started.get(i);
    if (Number.isFinite(st)) dates.push(st);
    lens.push(s.m.duration.get(i));
  }
  dates.sort((a, b) => a - b);
  lens.sort((a, b) => a - b);
  const q = (a: number[], f: number) => a[Math.min(a.length - 1, Math.floor(f * a.length))];
  const dq = dates.length >= 40 ? [q(dates, 0.25), q(dates, 0.5), q(dates, 0.75)] : null;
  const lq = lens.length >= 30 ? [q(lens, 1 / 3), q(lens, 2 / 3)] : null;
  const period: (string | null)[] = new Array(mask.length).fill(null);
  const length: (string | null)[] = new Array(mask.length).fill(null);
  const min = (sec: number) => `${Math.round(sec / 60)} min`;
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    const st = s.m.started.get(i);
    if (dq && Number.isFinite(st)) {
      const b = st < dq[0] ? 0 : st < dq[1] ? 1 : st < dq[2] ? 2 : 3;
      const lo = b === 0 ? dates[0] : dq[b - 1];
      const hi = b === 3 ? dates[dates.length - 1] : dq[b];
      period[i] = `${day(lo)}…${day(hi)}`;
    }
    if (lq) {
      const d = s.m.duration.get(i);
      length[i] = d < lq[0] ? `< ${min(lq[0])}` : d < lq[1] ? `${min(lq[0])}–${min(lq[1])}` : `> ${min(lq[1])}`;
    }
  }
  return { period, length };
}

/** Every vehicle of every match the mask keeps, as rows of the `lives` table. */
export function livesTable(s: MassStore, mask: Uint8Array): NicheTable {
  const b = new NicheBuilder(
    'lives',
    ['game', 'map', 'mode', 'class', 'vehicle', 'side', 'tier', 'period', 'length'],
    [
      { id: 'kd', type: 'share' },
      { id: 'win', type: 'share' },
      { id: 'death', type: 'share' },
      { id: 'kph', type: 'rate' },
      { id: 'earn', type: 'rate' },
    ],
    { vehicle: ['class', 'game'], map: ['game'] },
  );
  const { period, length } = matchBins(s, mask);
  const V = s.v;
  for (let r = 0; r < V.match.n; r++) {
    const m = V.match.a[r];
    if (!mask[m]) continue;
    const cls = s.str(V.cls.a[r]);
    if (NOT_DRIVEN.has(cls)) continue;
    const units = V.units.a[r];
    // Players' lives: the mission's own AI (trucks, flak, tankers) is no choice anyone made, and earns, scores and dies by its script.
    if (!(units > 0) || V.players.a[r] * 2 < units) continue;
    const slot = V.team.a[r];
    const side = slot < s.m.teams.get(m) ? s.str(s.t.name.a[s.m.team0.get(m) + slot]) : null;
    const key = s.str(V.key.a[r]);
    const label = s.str(V.label.a[r]);
    const kills = V.kills.a[r],
      deaths = V.deaths.a[r];
    const hours = V.presence.a[r] / 3600;
    b.push(
      m,
      [
        s.str(s.m.game.get(m)),
        s.str(s.m.map.get(m)),
        s.str(s.m.mode.get(m)),
        cls,
        key ? [key, label] : null,
        side,
        V.tier.a[r] >= 0 ? s.str(V.tier.a[r]) : null,
        period[m],
        length[m],
      ],
      [
        [kills, kills + deaths],
        [V.winSum.a[r], V.winN.a[r]],
        [Math.min(deaths, units), units],
        [kills, hours],
        [V.earn.a[r], s.str(s.m.cur.get(m)) ? hours * 60 : 0],
      ],
    );
  }
  return b.done();
}

const BUYS = ['eco', 'force', 'full'];

/** The part of a match a round number falls in: rounds 1-4, 5-8, ... (the halves' first rounds in their own). */
const roundPhase = (n: number) => (n >= 1 ? `R${Math.floor((n - 1) / 4) * 4 + 1}–${Math.floor((n - 1) / 4) * 4 + 4}` : null);

/**
 * Every life's round of every match the mask keeps that says who won (the
 * summaries' `outcome`), as rows of the `rounds` table: the round's result,
 * judged against the side's own win rate in the match.
 */
export function roundsTable(s: MassStore, mask: Uint8Array): NicheTable {
  const b = new NicheBuilder('rounds', ['map', 'side', 'phase', 'vehicle', 'weapon', 'place', 'buy', 'opening'], [{ id: 'roundWin', type: 'share' }], { place: ['map'] });
  const unit: number[] = [];
  const stratum: number[] = [];
  const round: number[] = [];
  const unitId = new Map<number, number>();
  const MAX_RI = 4096;
  for (let m = 0; m < mask.length; m++) {
    const o = mask[m] ? s.outcome[m] : null;
    if (!o || o.r.length < 6) continue;
    const map = s.str(s.m.map.get(m)) || null;
    const T = s.m.teams.get(m);
    const side = (slot: number) => (slot >= 0 && slot < T ? s.str(s.t.name.a[s.m.team0.get(m) + slot]) : null);
    for (let q = 0; q + UR_STRIDE - 1 < o.u.length; q += UR_STRIDE) {
      const ri = o.u[q];
      const slot = o.u[q + 1];
      const sd = side(slot);
      if (!sd) continue;
      const first = o.r[ri * 3 + 2];
      const veh = o.u[q + 2];
      const wp = o.u[q + 3];
      const pl = o.u[q + 4];
      const buy = o.u[q + 5];
      b.push(
        m,
        [map, sd, roundPhase(o.r[ri * 3]), veh >= 0 ? (o.vehicles[veh] ?? null) : null, wp >= 0 ? (o.weapons[wp] ?? null) : null, pl >= 0 ? (o.places[pl] ?? null) : null, buy >= 0 ? BUYS[buy] : null, first < 0 ? null : first === slot ? 'first kill' : 'first death'],
        [[o.u[q + 6], 1]],
      );
      const uk = (m * MAX_RI + ri) * 8 + Math.min(7, slot);
      let id = unitId.get(uk);
      if (id === undefined) unitId.set(uk, (id = unitId.size));
      unit.push(id);
      stratum.push(m * 8 + Math.min(7, slot));
      round.push(o.r[ri * 3]);
    }
  }
  const t = b.done();
  // Each side's win rate in its own match, its rows' expectation.
  const T0 = t.targets[0];
  const e = new Float64Array(t.rows);
  const sum = new Map<number, [number, number]>();
  for (let r = 0; r < t.rows; r++) {
    const a = sum.get(stratum[r]) ?? [0, 0];
    a[0] += T0.k[r];
    a[1] += T0.n[r];
    sum.set(stratum[r], a);
  }
  for (let r = 0; r < t.rows; r++) {
    const [k, n] = sum.get(stratum[r])!;
    e[r] = T0.n[r] * (n > 0 ? k / n : 0);
  }
  t.targets[0] = { ...T0, e, unit: Int32Array.from(unit), stratum: Int32Array.from(stratum), round: Int32Array.from(round) };
  return t;
}

const K_KILL = GRID_KINDS.indexOf('kill');
const K_DEATHS = new Set(['death', 'destroyed', 'crash'].map((k) => GRID_KINDS.indexOf(k as (typeof GRID_KINDS)[number])));
const SECTORS = 4;

/**
 * The `places` and `phases` tables, filled a match at a time from the same
 * read of the grids as the place scan: kills and deaths by sector of the
 * map's raster (4 x 4, named A1..D4 west to east, south to north), class,
 * side and band; and by sector and fifth of the match length, with the
 * presence.
 */
export class PlaceTables {
  readonly places = new NicheBuilder('places', ['map', 'mode', 'period', 'sector', 'class', 'side', 'band'], [{ id: 'kd', type: 'share' }], { sector: ['map'] });
  readonly phases = new NicheBuilder(
    'phases',
    ['map', 'mode', 'period', 'sector', 'phase'],
    [
      { id: 'kd', type: 'share' },
      { id: 'deathRate', type: 'rate' },
    ],
    { sector: ['map'] },
  );
  private bins: ReturnType<typeof matchBins> | null = null;
  constructor(
    private readonly s: MassStore,
    mask: Uint8Array,
    private readonly maxRows = 2_000_000,
  ) {
    this.bins = matchBins(s, mask);
  }

  add(map: string, fr: ScanFrame, m: PlaceMatch): void {
    const g = m.grid;
    if (!g || this.places.rows > this.maxRows) return;
    const s = this.s;
    const mode = s.str(s.m.mode.get(m.i));
    const period = this.bins?.period[m.i] ?? null;
    const sectorOf = (x: number, z: number) => {
      const sx = Math.floor(((x - fr.x0) / (fr.nx * fr.cell)) * SECTORS);
      const sz = Math.floor(((z - fr.z0) / (fr.nz * fr.cell)) * SECTORS);
      if (sx < 0 || sz < 0 || sx >= SECTORS || sz >= SECTORS) return null;
      return `${String.fromCharCode(65 + sx)}${sz + 1}`;
    };
    const T = m.teams.length;
    const acc = new Map<string, [number, number]>();
    for (let q = 0; q + 5 < g.e.length; q += 6) {
      const kind = g.e[q + 1];
      const kill = kind === K_KILL;
      if (!kill && !K_DEATHS.has(kind)) continue;
      const i = g.e[q];
      const sec = sectorOf((g.ix[i] + 0.5) * g.cell, (g.iz[i] + 0.5) * g.cell);
      if (!sec) continue;
      const t = g.e[q + 2],
        c = g.e[q + 3],
        b = Math.min(BANDS - 1, g.e[q + 4]);
      const key = `${sec}|${c < VEHICLE_CLASSES.length ? VEHICLE_CLASSES[c] : ''}|${t < T ? m.teams[t] : ''}|${b}`;
      const v = acc.get(key) ?? [0, 0];
      v[kill ? 0 : 1] += g.e[q + 5];
      acc.set(key, v);
    }
    for (const [key, [k, d]] of acc) {
      const [sec, cls, side, band] = key.split('|');
      this.places.push(m.i, [map, mode, period, sec, cls || null, side || null, g.bands?.by === 'floor' ? `floor ${band}` : `band ${band}`], [[k, k + d]]);
    }
    // Phases from the time slices: kills, deaths and presence by sector and fifth of the length.
    const ts = g.ts;
    if (!ts || !(m.duration > 0)) return;
    const minute = ts.minute || 60;
    const ph = new Map<string, [number, number, number]>();
    for (let q = 0; q + 4 < ts.v.length; q += 5) {
      const kind = ts.v[q + 3];
      const pres = kind === GRID_KINDS.length;
      const kill = kind === K_KILL;
      if (!pres && !kill && !K_DEATHS.has(kind)) continue;
      const sec = sectorOf((ts.v[q] + 0.5) * ts.cell, (ts.v[q + 1] + 0.5) * ts.cell);
      if (!sec) continue;
      const mi = ts.v[q + 2];
      const w = Math.min(ST_BINS - 1, Math.floor((((mi + 0.5) * minute) / m.duration) * ST_BINS));
      const key = `${sec}|${w}`;
      const v = ph.get(key) ?? [0, 0, 0];
      v[pres ? 2 : kill ? 0 : 1] += ts.v[q + 4];
      ph.set(key, v);
    }
    for (const [key, [k, d, p]] of ph) {
      const [sec, w] = key.split('|');
      const from = (Number(w) * 100) / ST_BINS;
      this.phases.push(
        m.i,
        [map, mode, period, sec, `${from}–${from + 100 / ST_BINS}%`],
        [
          [k, k + d],
          [d, p / 3600],
        ],
      );
    }
  }

  tables(): NicheTable[] {
    return [this.places.done(), this.phases.done()];
  }
}

// ---------------------------------------------------------------------------
// The search

interface Group {
  conds: [number, number][];
  rows: Int32Array;
}

interface Eval {
  conds: [number, number][];
  rows: Int32Array;
  K: number;
  N: number;
  /** Expected successes (a stratified target), else `N * p0`. */
  E: number;
  /** The empirical null's scale its z was divided by (1: none). */
  scale: number;
  z: number;
  p: number;
  ratio: number;
  shrunk: number;
  lo: number;
  hi: number;
  matches: number;
  folds: number;
  agree: number;
  quality: number;
}

const fold = (i: number) => (Math.imul(i + 1, 2654435761) >>> 0) % FOLDS;

/** One table, one target: the beam search. */
function search(t: NicheTable, ti: number, scratch: Float64Array, counted: { tests: number }, base?: [number, number][], one = false): Eval[] {
  const T = t.targets[ti];
  const share = T.type === 'share';
  let K = 0,
    N = 0;
  const live: number[] = [];
  for (let r = 0; r < t.rows; r++)
    if (T.n[r] > 0) {
      K += T.k[r];
      N += T.n[r];
      live.push(r);
    }
  if (!(N > 0) || !(K > 0)) return [];
  const p0 = K / N;
  const Ex = T.e;
  const exp = (r: number) => (Ex ? Ex[r] : T.n[r] * p0);
  const odds = (x: number) => x / Math.max(1e-9, 1 - x);
  const touched: number[] = [];
  const fk = new Float64Array(FOLDS),
    fn = new Float64Array(FOLDS);
  const evaluate = (conds: [number, number][], rows: Int32Array, Ks: number, Ns: number, Es: number): Eval | null => {
    if (Ns < (share ? MIN_N : 0) || (!share && Ns * p0 < 15) || Ns >= N * 0.95) return null;
    // None or all of it: the data does not record the outcome for this group (deaths of a slot that never logs one), not a niche.
    if (Ks <= 0 || (share && Ks >= Ns)) return null;
    counted.tests++;
    // Cluster-robust: residuals summed by match.
    fk.fill(0);
    fn.fill(0);
    let recorded = 0;
    for (const r of rows) {
      if (T.k[r] > 0) recorded++;
      const m = t.match[r];
      if (scratch[m] === 0) touched.push(m);
      scratch[m] += T.k[r] - exp(r) + 1e-300;
      fk[fold(m)] += T.k[r];
      fn[fold(m)] += Ex ? Ex[r] : T.n[r];
    }
    let v = 0;
    for (const m of touched) {
      v += scratch[m] * scratch[m];
      scratch[m] = 0;
    }
    const matches = touched.length;
    touched.length = 0;
    if (matches < MIN_MATCHES) return null;
    // Earnings most of whose lives record none: the data does not keep them for it.
    if (T.id === 'earn' && recorded < rows.length * 0.25) return null;
    v *= matches / (matches - 1);
    const pe = Es / Ns;
    const naive = share ? Ns * pe * (1 - pe) : Ns * p0;
    const z = ((Ks - Es) / Math.sqrt(Math.max(v, naive, 1e-9))) * Math.sqrt(1 - 2 / Math.max(3, matches - 1));
    const Kr = K - Ks,
      Nr = N - Ns;
    let ratio: number, shrunk: number, lo: number, hi: number;
    if (share && Ex) {
      // Against its own expectation: the odds of its wins over the odds its matches and sides gave it.
      const pc = Math.min(1 - 1e-6, Math.max(1e-6, pe));
      const ps = Math.min(1 - 0.5 / Ns, Math.max(0.5 / Ns, Ks / Ns));
      ratio = odds(ps) / odds(pc);
      shrunk = odds((Ks + PRIOR * pc) / (Ns + PRIOR)) / odds(pc);
      const se = Math.sqrt(Math.max(v, naive) / Math.max(1e-9, naive)) * Math.sqrt(1 / Math.max(0.5, Ks) + 1 / Math.max(0.5, Ns - Ks));
      lo = ratio * Math.exp(-1.96 * se);
      hi = ratio * Math.exp(1.96 * se);
    } else if (share) {
      const pr = Math.min(1 - 1e-6, Math.max(1e-6, Kr / Math.max(1e-9, Nr)));
      const ps = Math.min(1 - 0.5 / Ns, Math.max(0.5 / Ns, Ks / Ns));
      ratio = odds(ps) / odds(pr);
      shrunk = odds((Ks + PRIOR * pr) / (Ns + PRIOR)) / odds(pr);
      const se = Math.sqrt(Math.max(v, naive) / naive) * Math.sqrt(1 / Math.max(0.5, Ks) + 1 / Math.max(0.5, Ns - Ks));
      lo = ratio * Math.exp(-1.96 * se);
      hi = ratio * Math.exp(1.96 * se);
    } else {
      const lr = Kr / Math.max(1e-9, Nr);
      const e = Ns * lr;
      ratio = e > 0 ? Ks / e : 1;
      shrunk = (Ks + PRIOR) / (e + PRIOR);
      const se = Math.sqrt(Math.max(v, naive) / naive / Math.max(0.5, Ks));
      lo = ratio * Math.exp(-1.96 * se);
      hi = ratio * Math.exp(1.96 * se);
    }
    let folds = 0,
      agree = 0;
    const dir = Math.sign(Ks - Es);
    for (let f = 0; f < FOLDS; f++) {
      if (!(fn[f] > 0)) continue;
      folds++;
      if (Math.sign(fk[f] - (Ex ? fn[f] : fn[f] * p0)) === dir) agree++;
    }
    const l = Math.min(Math.log(4), Math.abs(Math.log(Math.max(1e-9, shrunk))));
    return {
      conds,
      rows,
      K: Ks,
      N: Ns,
      E: Es,
      scale: 1,
      z,
      p: pOfZ(z),
      ratio,
      shrunk,
      lo,
      hi,
      matches,
      folds,
      agree,
      quality: l * (1 - Math.exp(-Math.abs(z) / 3)),
    };
  };
  // Children of a group: its rows grouped by each factor it does not fix yet.
  const children = (g: Group): Eval[] => {
    const out: Eval[] = [];
    const fixed = new Set<number>();
    const have = new Set<string>();
    for (const [f] of g.conds) {
      fixed.add(f);
      have.add(t.factors[f]);
      for (const x of t.implies[t.factors[f]] ?? []) fixed.add(t.factors.indexOf(x));
    }
    for (let f = 0; f < t.factors.length; f++) {
      // A factor that fixes one already there (a vehicle after its class) makes a group found without it.
      if (fixed.has(f) || (t.implies[t.factors[f]] ?? []).some((x) => have.has(x))) continue;
      const L = t.levels[f].length;
      if (L < 2) continue;
      const code = t.codes[f];
      const cnt = new Int32Array(L);
      const kk = new Float64Array(L),
        nn = new Float64Array(L),
        ee = new Float64Array(L);
      for (const r of g.rows) {
        const c = code[r];
        if (c < 0) continue;
        cnt[c]++;
        kk[c] += T.k[r];
        nn[c] += T.n[r];
        ee[c] += exp(r);
      }
      // Only levels with the support worth testing get their rows gathered.
      const want: number[] = [];
      for (let c = 0; c < L; c++) if (cnt[c] && nn[c] >= (share ? MIN_N : 0) && (share || nn[c] * p0 >= 15)) want.push(c);
      if (!want.length) continue;
      const start = new Int32Array(L + 1);
      for (const c of want) start[c + 1] = cnt[c];
      for (let c = 0; c < L; c++) start[c + 1] += start[c];
      const buf = new Int32Array(start[L]);
      const fill = start.slice();
      const ok = new Uint8Array(L);
      for (const c of want) ok[c] = 1;
      for (const r of g.rows) {
        const c = code[r];
        if (c >= 0 && ok[c]) buf[fill[c]++] = r;
      }
      for (const c of want) {
        const e = evaluate([...g.conds, [f, c]], buf.subarray(start[c], start[c + 1]), kk[c], nn[c], ee[c]);
        if (e) out.push(e);
      }
    }
    return out;
  };
  const all: Eval[] = [];
  const root: Group = { conds: base ?? [], rows: Int32Array.from(live) };
  if (base?.length) {
    // The base's own rows.
    const keep: number[] = [];
    for (const r of live) if (base.every(([f, c]) => t.codes[f][r] === c)) keep.push(r);
    root.rows = Int32Array.from(keep);
  }
  let beam: { g: Group; quality: number }[] = [{ g: root, quality: 0 }];
  for (let d = 0; d < (one ? 1 : DEPTH); d++) {
    const next: Eval[] = [];
    for (const b of beam) {
      for (const c of children(b.g)) {
        // A refinement earns its place by being stronger than what it refines.
        if (d > 0 && c.quality <= b.quality * 1.1) continue;
        next.push(c);
      }
    }
    all.push(...next);
    next.sort((a, b) => b.quality - a.quality);
    const seen = new Set<string>();
    beam = [];
    for (const e of next) {
      const key = e.conds
        .map(([f, c]) => `${f}:${c}`)
        .sort()
        .join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      beam.push({ g: { conds: e.conds, rows: e.rows }, quality: e.quality });
      if (beam.length >= BEAM) break;
    }
    if (!beam.length) break;
  }
  return all;
}

function toFinding(t: NicheTable, ti: number, e: Eval, base: number): NicheFinding {
  const T = t.targets[ti];
  const conds = e.conds.map(([f, c]) => ({
    f: t.factors[f],
    v: t.levels[f][c],
    ...(t.labels[f][c] ? { label: t.labels[f][c] } : {}),
  }));
  const value = e.N > 0 ? e.K / e.N : 0;
  const r3 = (v: number) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : v);
  // A stratified target's base is the group's own expectation: what its matches and sides gave it.
  if (T.e && e.N > 0) base = e.E / e.N;
  let matchIds: number[] | undefined;
  let rounds: [number, number][] | undefined;
  if (T.e && e.rows.length) {
    // Where it showed: the matches with the largest residual its way, and their rounds that did.
    const dir = e.K >= e.E ? 1 : -1;
    const by = new Map<number, number>();
    for (const r of e.rows) by.set(t.match[r], (by.get(t.match[r]) ?? 0) + dir * (T.k[r] - T.e[r]));
    matchIds = [...by].filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 60).map((x) => x[0]);
    if (T.round) {
      const seen = new Set<string>();
      rounds = [];
      for (const r of e.rows) {
        if (rounds.length >= 60) break;
        if ((dir > 0 ? T.k[r] : T.n[r] - T.k[r]) <= 0) continue;
        const key = `${t.match[r]}:${T.round[r]}`;
        if (seen.has(key)) continue;
        seen.add(key);
        rounds.push([t.match[r], T.round[r]]);
      }
    }
  }
  return {
    id: `${t.name}:${T.id}:${conds.map((c) => `${c.f}=${c.v}`).join('&')}`,
    table: t.name,
    target: T.id,
    type: T.type,
    conds,
    dir: e.shrunk >= 1 ? 1 : -1,
    k: r3(e.K),
    n: r3(e.N),
    value: r3(value),
    base: r3(base),
    ratio: r3(e.ratio),
    shrunk: r3(e.shrunk),
    lo: r3(e.lo),
    hi: r3(e.hi),
    z: r3(e.z),
    p: e.p,
    q: 1,
    wracc: 0,
    rows: e.rows.length,
    matches: e.matches,
    folds: e.folds,
    foldsAgree: e.agree,
    score: 0,
    ...(matchIds ? { matchIds } : {}),
    ...(rounds ? { rounds } : {}),
  };
}

/** A copy of a calibrated target with its results shuffled between the units of each stratum. */
function shuffled(t: NicheTable, ti: number, seed: number): NicheTable {
  const T = t.targets[ti];
  const unit = T.unit!;
  const stratum = T.stratum!;
  // Each unit's result (its rows share it) and the units of each stratum.
  const res = new Map<number, number>();
  const of = new Map<number, number[]>();
  for (let r = 0; r < t.rows; r++) {
    if (!(T.n[r] > 0)) continue;
    const u = unit[r];
    if (!res.has(u)) {
      res.set(u, T.k[r] / T.n[r]);
      (of.get(stratum[r]) ?? of.set(stratum[r], []).get(stratum[r])!).push(u);
    }
  }
  let a = seed >>> 0;
  const rnd = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  const to = new Map<number, number>();
  for (const us of of.values()) {
    const v = us.map((u) => res.get(u)!);
    for (let i = v.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [v[i], v[j]] = [v[j], v[i]];
    }
    us.forEach((u, i) => to.set(u, v[i]));
  }
  const k = new Float64Array(t.rows);
  for (let r = 0; r < t.rows; r++) k[r] = T.n[r] > 0 ? (to.get(unit[r]) ?? 0) * T.n[r] : 0;
  const targets = t.targets.map((x, i) => (i === ti ? { ...x, k } : x));
  return { ...t, targets };
}

/**
 * The empirical null of a calibrated target: the search on shuffled results, every group it
 * tried; the scale its |z| show beyond a standard normal (1 at least), from the middle and
 * from the tail, the larger - by the number of conditions, as a refinement of a group the beam
 * kept for its large z inherits some of it (the deeper the group, the more selected).
 */
export function nullScale(t: NicheTable, ti: number, matches: number, runs = NULL_RUNS, base?: [number, number][], one = false): number[] {
  const scratch = new Float64Array(Math.max(1, matches));
  const byDepth: number[][] = [];
  for (let k = 0; k < runs; k++) {
    const counted = { tests: 0 };
    for (const e of search(shuffled(t, ti, 1000 + k * 7919), ti, scratch, counted, base, one)) (byDepth[e.conds.length - 1] ??= []).push(Math.abs(e.z));
  }
  const scale = (zs: number[]) => {
    zs.sort((a, b) => a - b);
    const q = (f: number) => zs[Math.min(zs.length - 1, Math.floor(f * zs.length))];
    return Math.max(1, q(0.5) / 0.6745, q(0.99) / 2.5758);
  };
  const all = byDepth.flat();
  const whole = all.length >= 50 ? scale(all) : 1;
  const out: number[] = [];
  let last = 1;
  for (let d = 0; d < Math.max(DEPTH + (base?.length ?? 0), byDepth.length); d++) {
    const zs = byDepth[d] ?? [];
    // Too few groups at a depth: the whole pool's, never below the shallower depth's.
    last = Math.max(last, zs.length >= 50 ? scale(zs) : whole);
    out.push(last);
  }
  return out;
}

export interface NicheRun {
  findings: NicheFinding[];
  tests: number;
  tables: { name: string; rows: number }[];
  ms: number;
  /** Calibrated targets (`table:target`) and the empirical null's largest scale of their z. */
  nulls?: Record<string, number>;
}

/** The beam search over every table and target: Benjamini-Hochberg over all groups evaluated, the practical and stable ones kept, refinements that repeat their parent dropped. */
export function discoverNiches(tables: NicheTable[], matches: number, fdr = NICHE_FDR): NicheRun {
  const t0 = performance.now();
  const scratch = new Float64Array(Math.max(1, matches));
  const counted = { tests: 0 };
  const cands: {
    t: NicheTable;
    ti: number;
    e: Eval;
    base: number;
    N: number;
  }[] = [];
  const scales = new Map<string, number>();
  for (const t of tables)
    t.targets.forEach((T, ti) => {
      let K = 0,
        N = 0;
      for (let r = 0; r < t.rows; r++)
        if (T.n[r] > 0) {
          K += T.k[r];
          N += T.n[r];
        }
      // A calibrated target: its z scaled by the empirical null of the same search on shuffled results.
      const scaleBy = T.unit && T.stratum ? nullScale(t, ti, matches) : null;
      if (scaleBy) scales.set(`${t.name}:${T.id}`, Math.max(...scaleBy));
      for (const e of search(t, ti, scratch, counted)) {
        const scale = scaleBy ? scaleBy[Math.min(scaleBy.length - 1, e.conds.length - 1)] : 1;
        if (scale !== 1) {
          e.scale = scale;
          e.z /= scale;
          e.p = pOfZ(e.z);
          e.quality = Math.min(Math.log(4), Math.abs(Math.log(Math.max(1e-9, e.shrunk)))) * (1 - Math.exp(-Math.abs(e.z) / 3));
        }
        if (e.p < 0.01) cands.push({ t, ti, e, base: N > 0 ? K / N : 0, N });
      }
    });
  // Benjamini-Hochberg: the groups not kept as candidates count as p = 1.
  const m = Math.max(counted.tests, cands.length);
  const order = cands.map((_, i) => i).sort((a, b) => cands[a].e.p - cands[b].e.p);
  const q = new Float64Array(cands.length);
  let run = 1;
  for (let r = order.length - 1; r >= 0; r--) {
    run = Math.min(run, (cands[order[r]].e.p * m) / (r + 1));
    q[order[r]] = run;
  }
  const out: NicheFinding[] = [];
  const keptConds: {
    key: string;
    set: Set<string>;
    dir: number;
    shrunk: number;
  }[] = [];
  const idx = cands
    .map((_, i) => i)
    .filter((i) => {
      const e = cands[i].e;
      const practical = e.shrunk >= MIN_RATIO || e.shrunk <= 1 / MIN_RATIO;
      return q[i] <= fdr && practical && e.folds >= 4 && e.agree >= Math.min(e.folds, 4);
    });
  const quality = (i: number) => cands[i].e.quality * (1 - Math.exp(-(-Math.log10(Math.max(1e-300, q[i]))) / 3));
  idx.sort((a, b) => quality(b) - quality(a));
  for (const i of idx) {
    const { t, ti, e, base, N } = cands[i];
    const f = toFinding(t, ti, e, base);
    const set = new Set(f.conds.map((c) => `${c.f}=${c.v}`));
    const key = `${t.name}|${f.target}`;
    // A group that only adds a condition to a kept one and says about as much is the same niche.
    const repeats = keptConds.some(
      (k) =>
        k.key === key &&
        k.dir === f.dir &&
        ([...k.set].every((c) => set.has(c)) || [...set].every((c) => k.set.has(c))) &&
        Math.abs(Math.log(Math.max(1e-9, k.shrunk) / Math.max(1e-9, f.shrunk))) < 0.25,
    );
    if (repeats) continue;
    keptConds.push({ key, set, dir: f.dir, shrunk: f.shrunk });
    f.q = q[i];
    f.wracc = Math.round((e.N / N) * (f.value - f.base) * 1e6) / 1e6;
    if (scales.has(`${t.name}:${f.target}`)) f.nullScale = Math.round(e.scale * 1000) / 1000;
    const evidence = Math.min(1, -Math.log10(Math.max(1e-300, f.q)) / 6) * (0.5 + (0.5 * f.foldsAgree) / Math.max(1, f.folds));
    if (t.targets[ti].e) {
      // Lift times support: the points above (below) its expectation, by the square root of its rounds.
      const ls = Math.abs(f.value - f.base) * Math.sqrt(e.N);
      f.score = Math.round((ls / (ls + 1.5)) * evidence * 1000) / 1000;
    } else {
      const l = Math.min(Math.log(4), Math.abs(Math.log(Math.max(1e-9, f.shrunk))));
      f.score = Math.round((l / (l + Math.log(3))) * evidence * 1000) / 1000;
    }
    out.push(f);
    if (out.length >= NICHE_MAX) break;
  }
  out.sort((a, b) => b.score - a.score);
  return {
    findings: out,
    tests: m,
    tables: tables.map((t) => ({ name: t.name, rows: t.rows })),
    ms: Math.round(performance.now() - t0),
    ...(scales.size ? { nulls: Object.fromEntries(scales) } : {}),
  };
}

/** The explorer: every one-condition refinement of a group, with its numbers (q over just these). */
export function nicheChildren(t: NicheTable, target: NicheTarget, base: NicheCond[], matches: number): { base: NicheFinding | null; children: NicheFinding[] } {
  const ti = t.targets.findIndex((x) => x.id === target);
  if (ti < 0) return { base: null, children: [] };
  const conds: [number, number][] = [];
  for (const c of base) {
    const f = t.factors.indexOf(c.f);
    const v = f >= 0 ? t.levels[f].indexOf(c.v) : -1;
    if (v < 0) return { base: null, children: [] };
    conds.push([f, v]);
  }
  const T = t.targets[ti];
  let K = 0,
    N = 0;
  for (let r = 0; r < t.rows; r++)
    if (T.n[r] > 0) {
      K += T.k[r];
      N += T.n[r];
    }
  const p0 = N > 0 ? K / N : 0;
  const counted = { tests: 0 };
  const scratch = new Float64Array(Math.max(1, matches));
  const evals = search(t, ti, scratch, counted, conds, true);
  // A calibrated target: the same one-step refinement on shuffled results scales the z.
  if (T.unit && T.stratum) {
    const by = nullScale(t, ti, matches, NULL_RUNS, conds, true);
    const scale = by[Math.min(by.length - 1, conds.length)];
    for (const e of evals) {
      e.scale = scale;
      e.z /= scale;
      e.p = pOfZ(e.z);
    }
  }
  const order = evals.map((_, i) => i).sort((a, b) => evals[a].p - evals[b].p);
  const children = evals.map((e) => toFinding(t, ti, e, p0));
  let run = 1;
  for (let r = order.length - 1; r >= 0; r--) {
    run = Math.min(run, (evals[order[r]].p * Math.max(1, counted.tests)) / (r + 1));
    children[order[r]].q = run;
  }
  for (const c of children) {
    c.wracc = Math.round((c.n / N) * (c.value - p0) * 1e6) / 1e6;
    const l = Math.min(Math.log(4), Math.abs(Math.log(Math.max(1e-9, c.shrunk))));
    c.score = Math.round((l / (l + Math.log(3))) * Math.min(1, -Math.log10(Math.max(1e-300, c.q)) / 6) * 1000) / 1000;
  }
  children.sort((a, b) => b.score - a.score || b.n - a.n);
  // The base itself, against the whole.
  let baseF: NicheFinding | null = null;
  if (conds.length) {
    let k = 0,
      n = 0;
    for (let r = 0; r < t.rows; r++) if (T.n[r] > 0 && conds.every(([f, c]) => t.codes[f][r] === c)) ((k += T.k[r]), (n += T.n[r]));
    let ex = 0;
    if (T.e) for (let r = 0; r < t.rows; r++) if (T.n[r] > 0 && conds.every(([f, c]) => t.codes[f][r] === c)) ex += T.e[r];
    baseF = {
      ...toFinding(
        t,
        ti,
        {
          conds,
          rows: new Int32Array(0),
          K: k,
          N: n,
          E: T.e ? ex : n * p0,
          scale: 1,
          z: 0,
          p: 1,
          ratio: NaN,
          shrunk: NaN,
          lo: NaN,
          hi: NaN,
          matches: 0,
          folds: 0,
          agree: 0,
          quality: 0,
        },
        p0,
      ),
    };
  }
  return { base: baseF, children: children.slice(0, 80) };
}
