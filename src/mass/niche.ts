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
 */

import { NOT_DRIVEN, type MassStore } from './store';
import { ST_BINS, type PlaceMatch, type ScanFrame } from './scan';
import { BANDS, GRID_KINDS } from './types';
import { VEHICLE_CLASSES } from '../data/canonical';
import { pOfZ } from './scan';

export const NICHE_FDR = 0.05;
const MIN_N = 30;
const MIN_MATCHES = 8;
const PRIOR = 20;
const BEAM = 24;
const DEPTH = 3;
const FOLDS = 5;
/** Shrunk ratio a kept niche needs at least (or its inverse). */
const MIN_RATIO = 1.25;
const NICHE_MAX = 60;

export type NicheTarget = 'kd' | 'win' | 'death' | 'kph' | 'earn' | 'deathRate';

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
  const odds = (x: number) => x / Math.max(1e-9, 1 - x);
  const touched: number[] = [];
  const fk = new Float64Array(FOLDS),
    fn = new Float64Array(FOLDS);
  const evaluate = (conds: [number, number][], rows: Int32Array, Ks: number, Ns: number): Eval | null => {
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
      scratch[m] += T.k[r] - T.n[r] * p0 + 1e-300;
      fk[fold(m)] += T.k[r];
      fn[fold(m)] += T.n[r];
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
    const naive = share ? Ns * p0 * (1 - p0) : Ns * p0;
    const z = ((Ks - Ns * p0) / Math.sqrt(Math.max(v, naive))) * Math.sqrt(1 - 2 / Math.max(3, matches - 1));
    const Kr = K - Ks,
      Nr = N - Ns;
    let ratio: number, shrunk: number, lo: number, hi: number;
    if (share) {
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
    const dir = Math.sign(Ks - Ns * p0);
    for (let f = 0; f < FOLDS; f++) {
      if (!(fn[f] > 0)) continue;
      folds++;
      if (Math.sign(fk[f] - fn[f] * p0) === dir) agree++;
    }
    const l = Math.min(Math.log(4), Math.abs(Math.log(Math.max(1e-9, shrunk))));
    return {
      conds,
      rows,
      K: Ks,
      N: Ns,
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
        nn = new Float64Array(L);
      for (const r of g.rows) {
        const c = code[r];
        if (c < 0) continue;
        cnt[c]++;
        kk[c] += T.k[r];
        nn[c] += T.n[r];
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
        const e = evaluate([...g.conds, [f, c]], buf.subarray(start[c], start[c + 1]), kk[c], nn[c]);
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
  };
}

export interface NicheRun {
  findings: NicheFinding[];
  tests: number;
  tables: { name: string; rows: number }[];
  ms: number;
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
  for (const t of tables)
    t.targets.forEach((T, ti) => {
      let K = 0,
        N = 0;
      for (let r = 0; r < t.rows; r++)
        if (T.n[r] > 0) {
          K += T.k[r];
          N += T.n[r];
        }
      for (const e of search(t, ti, scratch, counted)) if (e.p < 0.01) cands.push({ t, ti, e, base: N > 0 ? K / N : 0, N });
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
    f.wracc = Math.round((e.N / N) * (f.value - base) * 1e6) / 1e6;
    const l = Math.min(Math.log(4), Math.abs(Math.log(Math.max(1e-9, f.shrunk))));
    f.score = Math.round((l / (l + Math.log(3))) * Math.min(1, -Math.log10(Math.max(1e-300, f.q)) / 6) * (0.5 + (0.5 * f.foldsAgree) / Math.max(1, f.folds)) * 1000) / 1000;
    out.push(f);
    if (out.length >= NICHE_MAX) break;
  }
  out.sort((a, b) => b.score - a.score);
  return {
    findings: out,
    tests: m,
    tables: tables.map((t) => ({ name: t.name, rows: t.rows })),
    ms: Math.round(performance.now() - t0),
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
    baseF = {
      ...toFinding(
        t,
        ti,
        {
          conds,
          rows: new Int32Array(0),
          K: k,
          N: n,
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
