/**
 * Lens metrics: the measures of military operations analysis and esports
 * analytics computed on the same rows as the insight pass (`pass.ts`), in the
 * same worker and the same walk, for the knowledge lens (`lens.ts`) to judge
 * the findings by. Each is described with its sources in the knowledge base
 * (`knowledge/methods.ts`):
 *
 *   lanchester    Poisson fit of each side's losses per 20 s on both sides'
 *                 alive strengths: the exponents of the attrition law
 *   exchange      kills per death by team and by place, how concentrated the
 *                 deaths are (top-5% share, Gini) and Moran's I of death rates
 *   forceRatio    friendly and enemy units within engagement range of each
 *                 kill; share and excess of kills by the locally superior side
 *   fieldsOfFire  viewsheds of the kill places on a 2.5D obstruction surface
 *                 (level geometry, or the ground walked) against the average place
 *   energy        specific energy of air killers and air victims (E = h + v²/2g)
 *   keyTerrain    how persistently the same places host each match's fighting
 *   trades        deaths answered by a teammate's kill nearby within 5 s
 *   initiative    engagements won by the side that scored first
 *
 * Every metric is optional: it is left out when the data cannot carry it
 * (no time, no teams, no air units, too few events).
 */

import type { CompareScope } from '../volumes/compare';
import { rowShown } from '../volumes/compare';
import { COARSE, MID, type InsightChunk, type InsightJob, type InsightMeta } from './pass';
import { binomTwoSided, quantileSorted } from './stats';

export interface LensOptions {
  /** World units in a metre (1 for metres; a CS2 unit is about an inch). */
  upm: number;
}

/** Seconds a Lanchester time bin spans. */
export const LANCHESTER_BIN = 20;
/** Seconds a unit's last sample still places it at a kill. */
const STALE = 10;
/** Seconds within which a teammate's kill trades a death. */
export const TRADE_SECS = 5;
/** Seconds of quiet that end an engagement. */
export const ENGAGEMENT_GAP = 20;
/** Engagement radii: 2·f·2^k for k < RADII, f the fine cell. */
const RADII = 9;
/** Heights a mid cell keeps of the level's vertices. */
const RES = 12;
const MAX_KILLS = 400_000;
/** VEHICLE_CLASSES indices (data/canonical.ts), kept out of the worker's imports. */
const AIR_MAX = 4;
const GROUND = [5, 6, 7, 8, 9];
const SEA = [10, 11];
const INFANTRY = 12;

export interface LanchesterFit {
  bins: number;
  binSecs: number;
  matches: number;
  losses: number;
  /** Exponent on enemy strength. */
  p: number;
  pSe: number;
  /** Exponent on own strength. */
  q: number;
  qSe: number;
  /** Pearson dispersion the errors and tests are scaled by (quasi-Poisson). */
  dispersion: number;
  /** Likelihood-ratio p-values of the pure laws against the free fit. */
  pSquare: number;
  pLinear: number;
  /** `uncertain`: the errors are too wide to tell the laws apart. */
  law: 'square' | 'linear' | 'between' | 'neither' | 'uncertain';
}

export interface ExchangeCell {
  x: number;
  z: number;
  kills: number;
  deaths: number;
  ratio: number;
}

export interface ExchangeMetric {
  byTeam: { team: string; kills: number; deaths: number; ratio: number | null }[];
  overall: number | null;
  /** Places with the highest and lowest kills per death (at least 8 events). */
  best: ExchangeCell[];
  worst: ExchangeCell[];
  /**
   * Share of deaths on the deadliest ground holding 5% of the time spent
   * (0.05 if deaths followed time spent), places ranked by their death rate
   * shrunk towards the map's.
   */
  deathShareTop5: number;
  /** The same share for deaths scattered by time spent alone: what chance gives with this many deaths. */
  deathShareNull: number;
  /** Gini coefficient of deaths against time spent, in the same order (0 even, 1 all in one place). */
  gini: number;
  giniNull: number;
  /** Moran's I of deaths per time over visited mid cells, rook neighbours. */
  moranI: number | null;
  cells: number;
}

export interface ForceRatioMetric {
  kills: number;
  /** World units: twice the median nearest-enemy distance at a kill (a ladder step). */
  radius: number;
  /** Median and quartiles of the distance from killer to the nearest enemy. */
  range: { p25: number; p50: number; p75: number };
  superior: number;
  inferior: number;
  even: number;
  /** superior / (superior + inferior). */
  superiorShare: number;
  p: number;
  /** Superior kills over what numbers alone predict (Σ big/(big+small)); > 1 favours concentration. */
  excess: number;
  /** Kills by local friendly:enemy ratio band. */
  bands: { band: '≤1:3' | '1:2' | '1:1' | '2:1' | '≥3:1'; kills: number }[];
}

export interface FieldsOfFireMetric {
  source: 'level' | 'ground';
  /** Range the views were taken over, world units. */
  range: number;
  hotspots: { x: number; z: number; kills: number; deaths: number; view: number }[];
  /** Presence-weighted mean view of the visited ground. */
  baseline: number;
  /** Mean hotspot view over the baseline. */
  ratio: number;
  /** Spearman's rank correlation of view and kill share over busy places. */
  rho: number | null;
  cells: number;
}

export interface EnergyMetric {
  kills: number;
  deaths: number;
  /** Energy height, world units. */
  killerMedian: number;
  victimMedian: number;
  /** P(a killer's energy exceeds a victim's). */
  auc: number;
  p: number;
}

export interface KeyTerrainMetric {
  matches: number;
  places: { x: number; z: number; persistence: number; kills: number }[];
}

export interface TradesMetric {
  deaths: number;
  traded: number;
  rate: number;
  radius: number;
  byTeam: { team: string; deaths: number; traded: number; rate: number }[];
}

export interface InitiativeMetric {
  engagements: number;
  firstWins: number;
  share: number;
  p: number;
}

export interface LensMetrics {
  schema: 'heat3d.lens/1';
  /** Share of movement rows by kind of unit; all zero without a class column. */
  domain: { air: number; ground: number; sea: number; infantry: number };
  upm: number;
  lanchester?: LanchesterFit;
  exchange?: ExchangeMetric;
  forceRatio?: ForceRatioMetric;
  fieldsOfFire?: FieldsOfFireMetric;
  energy?: EnergyMetric;
  keyTerrain?: KeyTerrainMetric;
  trades?: TradesMetric;
  initiative?: InitiativeMetric;
}

class Grow {
  a: Float64Array;
  n = 0;
  constructor(cap = 1024) {
    this.a = new Float64Array(cap);
  }
  push(v: number) {
    if (this.n === this.a.length) {
      const b = new Float64Array(this.a.length * 2);
      b.set(this.a);
      this.a = b;
    }
    this.a[this.n++] = v;
  }
  view() {
    return this.a.subarray(0, this.n);
  }
}

interface Engagement {
  last: number;
  first: number;
  kills: Map<number, number>;
}

export interface LensJob {
  meta: InsightMeta;
  scope: CompareScope;
  upm: number;
  T: number;
  radii: number[];
  // Tracks: one per person per match.
  index: Map<number, number>;
  tx: Grow;
  ty: Grow;
  tz: Grow;
  tt: Grow;
  tteam: Grow;
  talive: Grow;
  tbin: Grow;
  tE: Grow;
  bySession: Map<number, number[]>;
  // Domain: movement rows by kind of unit.
  rowsAir: number;
  rowsGround: number;
  rowsSea: number;
  rowsInf: number;
  rowsAll: number;
  // Lanchester: per (match, bin) presence and losses per team.
  bins: Map<number, Float64Array>;
  // Force ratio: per kill, the nearest enemy and counts within each radius.
  frNear: Grow;
  frCounts: Uint16Array;
  frN: number;
  // Energy.
  eKill: Grow;
  eDeath: Grow;
  // Key terrain: per match, kills by coarse cell.
  kt: Map<number, Map<number, number>>;
  // Trades: deaths, and the distance to the nearest answering kill.
  dSess: Grow;
  dT: Grow;
  dX: Grow;
  dY: Grow;
  dZ: Grow;
  dTeam: Grow;
  dTrade: Grow;
  recent: Map<number, number[]>;
  // Initiative.
  eng: Map<number, Engagement>;
  engN: number;
  engFirst: number;
  // Level heights per mid cell.
  lvH: Float32Array | null;
  lvN: Uint8Array | null;
  lvSeen: Uint32Array | null;
  seed: number;
}

export function createLensJob(meta: InsightMeta, scope: CompareScope, opt: LensOptions): LensJob {
  const T = Math.max(1, Math.min(32, meta.teams));
  const f = meta.grid.f;
  return {
    meta,
    scope,
    upm: opt.upm > 0 ? opt.upm : 1,
    T,
    radii: Array.from({ length: RADII }, (_, k) => 2 * f * 2 ** k),
    index: new Map(),
    tx: new Grow(),
    ty: new Grow(),
    tz: new Grow(),
    tt: new Grow(),
    tteam: new Grow(),
    talive: new Grow(),
    tbin: new Grow(),
    tE: new Grow(),
    bySession: new Map(),
    rowsAir: 0,
    rowsGround: 0,
    rowsSea: 0,
    rowsInf: 0,
    rowsAll: 0,
    bins: new Map(),
    frNear: new Grow(),
    frCounts: new Uint16Array(1024 * RADII * 2),
    frN: 0,
    eKill: new Grow(),
    eDeath: new Grow(),
    kt: new Map(),
    dSess: new Grow(),
    dT: new Grow(),
    dX: new Grow(),
    dY: new Grow(),
    dZ: new Grow(),
    dTeam: new Grow(),
    dTrade: new Grow(),
    recent: new Map(),
    eng: new Map(),
    engN: 0,
    engFirst: 0,
    lvH: null,
    lvN: null,
    lvSeen: null,
    seed: 12345,
  };
}

/** Keep a sample of the level's vertex heights per mid cell (stride floats each, x y z first). */
export function stepLensLevel(job: LensJob, v: Float32Array, stride: number): void {
  const g = job.meta.grid;
  const M = g.mx * g.mz;
  if (!job.lvH) {
    job.lvH = new Float32Array(M * RES);
    job.lvN = new Uint8Array(M);
    job.lvSeen = new Uint32Array(M);
  }
  const H = job.lvH;
  const N = job.lvN!;
  const S = job.lvSeen!;
  const mf = g.f * MID;
  for (let i = 0; i + 2 < v.length; i += stride) {
    const ix = Math.floor((v[i] - g.x0) / mf);
    const iz = Math.floor((v[i + 2] - g.z0) / mf);
    if (ix < 0 || iz < 0 || ix >= g.mx || iz >= g.mz) continue;
    const c = iz * g.mx + ix;
    const seen = ++S[c];
    if (N[c] < RES) H[c * RES + N[c]++] = v[i + 1];
    else {
      // Reservoir sampling, seeded: the same level gives the same sample.
      job.seed = (Math.imul(job.seed, 1103515245) + 12345) >>> 0;
      const r = job.seed % seen;
      if (r < RES) H[c * RES + r] = v[i + 1];
    }
  }
}

function trackOf(job: LensJob, person: number, session: number): number {
  const key = person * (job.meta.sessions + 1) + (session + 1);
  let a = job.index.get(key);
  if (a !== undefined) return a;
  a = job.tx.n;
  job.index.set(key, a);
  job.tx.push(NaN);
  job.ty.push(NaN);
  job.tz.push(NaN);
  job.tt.push(NaN);
  job.tteam.push(-1);
  job.talive.push(1);
  job.tbin.push(-1);
  job.tE.push(NaN);
  let list = job.bySession.get(session);
  if (!list) job.bySession.set(session, (list = []));
  list.push(a);
  return a;
}

function binRow(job: LensJob, s: number, bin: number): Float64Array {
  const key = (s + 1) * 65536 + Math.min(65535, bin);
  let b = job.bins.get(key);
  if (!b) job.bins.set(key, (b = new Float64Array(job.T * 2)));
  return b;
}

function closeEngagement(job: LensJob, e: Engagement): void {
  let total = 0;
  let best = -1;
  let bestK = -1;
  let tie = false;
  for (const [team, k] of e.kills) {
    total += k;
    if (k > bestK) {
      bestK = k;
      best = team;
      tie = false;
    } else if (k === bestK) tie = true;
  }
  if (total < 2 || e.kills.size < 2 || tie) return;
  job.engN++;
  if (best === e.first) job.engFirst++;
}

/** Fold one chunk in, in row order (as `stepInsight`). */
export function stepLens(job: LensJob, ch: InsightChunk): void {
  const { meta, scope } = job;
  const g = meta.grid;
  const KILL = meta.kill;
  const DEATH = meta.death;
  const POS = meta.position;
  const T = job.T;
  const cap = meta.dwellCap;
  const g2 = 2 * 9.81 * job.upm;
  const { px, py, pz, time, person, team, session, event, cls, target } = ch;
  const radii = job.radii;
  const rMax = radii[RADII - 1];
  for (let j = 0; j < ch.n; j++) {
    const x = px[j];
    const y = py[j];
    const z = pz[j];
    if (!(x === x && y === y && z === z) || !rowShown(scope, ch, j)) continue;
    const kind = event && meta.eventMap ? meta.eventMap[event[j]] ?? -1 : -1;
    const moving = POS < 0 || kind === POS;
    const k = cls && meta.classMap ? meta.classMap[cls[j]] ?? -1 : -1;
    const air = k >= 0 && k <= AIR_MAX;
    if (moving && k >= 0) {
      job.rowsAll++;
      if (air) job.rowsAir++;
      else if (k === INFANTRY) job.rowsInf++;
      else if (SEA.includes(k)) job.rowsSea++;
      else if (GROUND.includes(k)) job.rowsGround++;
    }
    const s = session ? session[j] : -1;
    const tm0 = team ? team[j] : -1;
    const tm = tm0 >= 0 && tm0 < T ? tm0 : -1;
    const t = time ? time[j] : NaN;
    const hasT = t === t;
    const t0 = meta.sessionStart && s >= 0 && s < meta.sessions ? meta.sessionStart[s] : meta.t0;
    const bin = hasT ? Math.max(0, Math.floor((t - t0) / LANCHESTER_BIN)) : -1;
    const p = person ? person[j] : -1;
    const shared = p >= 0 && meta.personShared ? meta.personShared[p] === 1 : false;
    const a = p >= 0 && !shared ? trackOf(job, p, s) : -1;
    if (a >= 0) {
      if (tm >= 0) job.tteam.a[a] = tm;
      if (kind === meta.spawn) job.talive.a[a] = 1;
      if (moving) {
        if (!job.talive.a[a] && kind !== DEATH) job.talive.a[a] = 1;
        const lt = job.tt.a[a];
        if (air && hasT && lt === lt && t > lt && t - lt <= cap) {
          const v = Math.hypot(x - job.tx.a[a], y - job.ty.a[a], z - job.tz.a[a]) / (t - lt);
          job.tE.a[a] = y + (v * v) / g2;
        } else if (!air) job.tE.a[a] = NaN;
        job.tx.a[a] = x;
        job.ty.a[a] = y;
        job.tz.a[a] = z;
        job.tt.a[a] = hasT ? t : job.tt.a[a];
        // Strength: an alive unit seen moving in this bin.
        if (bin >= 0 && tm >= 0 && job.talive.a[a] && job.tbin.a[a] !== bin) {
          job.tbin.a[a] = bin;
          binRow(job, s, bin)[tm]++;
        }
      }
    }
    if (kind === DEATH) {
      if (bin >= 0 && tm >= 0) binRow(job, s, bin)[T + tm]++;
      if (air && a >= 0) {
        const e = job.tE.a[a];
        if (e === e) job.eDeath.push(e);
      }
      if (a >= 0) job.talive.a[a] = 0;
      if (hasT && tm >= 0) {
        const di = job.dT.n;
        job.dSess.push(s);
        job.dT.push(t);
        job.dX.push(x);
        job.dY.push(y);
        job.dZ.push(z);
        job.dTeam.push(tm);
        job.dTrade.push(Infinity);
        let r = job.recent.get(s);
        if (!r) job.recent.set(s, (r = []));
        r.push(di);
        if (r.length > 256) r.splice(0, r.length - 128);
      }
    } else if (kind === KILL) {
      // Key terrain: kills by coarse cell, per match.
      let ix = Math.floor((x - g.x0) / g.f);
      let iz = Math.floor((z - g.z0) / g.f);
      ix = ix < 0 ? 0 : ix >= g.nx ? g.nx - 1 : ix;
      iz = iz < 0 ? 0 : iz >= g.nz ? g.nz - 1 : iz;
      const ci = Math.floor(iz / COARSE) * g.cx + Math.floor(ix / COARSE);
      let m = job.kt.get(s);
      if (!m) job.kt.set(s, (m = new Map()));
      m.set(ci, (m.get(ci) ?? 0) + 1);
      if (air && a >= 0) {
        const tk = target && meta.targetMap ? meta.targetMap[target[j]] ?? -1 : -1;
        const e = job.tE.a[a];
        if (e === e && (tk < 0 || tk <= AIR_MAX)) job.eKill.push(e);
      }
      if (hasT && tm >= 0) {
        // Trades: this kill answers recent deaths of the killer's team.
        const r = job.recent.get(s);
        if (r)
          for (let q = r.length - 1; q >= 0; q--) {
            const di = r[q];
            const dt = t - job.dT.a[di];
            if (dt > TRADE_SECS) break;
            if (dt < 0 || job.dTeam.a[di] !== tm) continue;
            const dd = Math.hypot(x - job.dX.a[di], y - job.dY.a[di], z - job.dZ.a[di]);
            if (dd < job.dTrade.a[di]) job.dTrade.a[di] = dd;
          }
        // Initiative: engagements by quiet gaps.
        let e = job.eng.get(s);
        if (e && t - e.last > ENGAGEMENT_GAP) {
          closeEngagement(job, e);
          e = undefined;
        }
        if (!e) job.eng.set(s, (e = { last: t, first: tm, kills: new Map() }));
        e.last = t;
        e.kills.set(tm, (e.kills.get(tm) ?? 0) + 1);
        // Force ratio: who was within reach of the kill.
        const list = job.bySession.get(s);
        if (list && job.frN < MAX_KILLS) {
          if ((job.frN + 1) * RADII * 2 > job.frCounts.length) {
            const b = new Uint16Array(job.frCounts.length * 2);
            b.set(job.frCounts);
            job.frCounts = b;
          }
          const base = job.frN * RADII * 2;
          let near = Infinity;
          for (const u of list) {
            const ut = job.tt.a[u];
            if (!job.talive.a[u] || !(ut === ut) || t - ut > STALE || t - ut < -STALE) continue;
            const ut2 = job.tteam.a[u];
            if (ut2 < 0) continue;
            const d = Math.hypot(x - job.tx.a[u], y - job.ty.a[u], z - job.tz.a[u]);
            const friend = ut2 === tm || u === a;
            if (!friend && d < near) near = d;
            if (d > rMax) continue;
            let r0 = 0;
            while (r0 < RADII && radii[r0] < d) r0++;
            for (let r = r0; r < RADII; r++) {
              const o = base + r * 2 + (friend ? 0 : 1);
              if (job.frCounts[o] < 65535) job.frCounts[o]++;
            }
          }
          // The killer counts even when its track has no recent movement sample.
          if (a < 0 || !(job.tt.a[a] === job.tt.a[a]) || t - job.tt.a[a] > STALE)
            for (let r = 0; r < RADII; r++) job.frCounts[base + r * 2]++;
          job.frNear.push(near);
          job.frN++;
        }
      }
    }
  }
}

// ---------------------------------------------------------------- finishing

function round(v: number, d = 3): number {
  const m = 10 ** d;
  return Math.round(v * m) / m;
}

/** Complementary error function (Numerical Recipes erfcc, |error| < 1.2e-7). */
function erfc(x: number): number {
  const z = Math.abs(x);
  const t = 1 / (1 + 0.5 * z);
  const r =
    t *
    Math.exp(
      -z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))),
    );
  return x >= 0 ? r : 2 - r;
}

/** Ranks with ties averaged, 1-based. */
function ranks(v: ArrayLike<number>): Float64Array {
  const n = v.length;
  const idx = Array.from({ length: n }, (_, i) => i).sort((a, b) => v[a] - v[b]);
  const r = new Float64Array(n);
  for (let i = 0; i < n; ) {
    let j = i;
    while (j + 1 < n && v[idx[j + 1]] === v[idx[i]]) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) r[idx[k]] = avg;
    i = j + 1;
  }
  return r;
}

export function spearman(a: ArrayLike<number>, b: ArrayLike<number>): number | null {
  const n = a.length;
  if (n < 5) return null;
  const ra = ranks(a);
  const rb = ranks(b);
  let ma = 0;
  let mb = 0;
  for (let i = 0; i < n; i++) {
    ma += ra[i];
    mb += rb[i];
  }
  ma /= n;
  mb /= n;
  let sab = 0;
  let saa = 0;
  let sbb = 0;
  for (let i = 0; i < n; i++) {
    sab += (ra[i] - ma) * (rb[i] - mb);
    saa += (ra[i] - ma) ** 2;
    sbb += (rb[i] - mb) ** 2;
  }
  return saa > 0 && sbb > 0 ? sab / Math.sqrt(saa * sbb) : null;
}

/** Mann-Whitney: P(x > y) + ½P(x = y), and the two-sided normal-approximation p. */
export function aucTest(x: ArrayLike<number>, y: ArrayLike<number>): { auc: number; p: number } {
  const n1 = x.length;
  const n2 = y.length;
  const all = new Float64Array(n1 + n2);
  all.set(x as ArrayLike<number>, 0);
  all.set(y as ArrayLike<number>, n1);
  const r = ranks(all);
  let r1 = 0;
  for (let i = 0; i < n1; i++) r1 += r[i];
  const u = r1 - (n1 * (n1 + 1)) / 2;
  const auc = u / (n1 * n2);
  const sd = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
  const zz = sd > 0 ? (u - (n1 * n2) / 2) / sd : 0;
  return { auc, p: Math.min(1, erfc(Math.abs(zz) / Math.SQRT2)) };
}

/** Solves the 3x3 system in place; null when singular. Returns the inverse too. */
function inv3(m: number[]): number[] | null {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h;
  const B = -(d * i - f * g);
  const C = d * h - e * g;
  const det = a * A + b * B + c * C;
  if (!(Math.abs(det) > 1e-12)) return null;
  const D = -(b * i - c * h);
  const E = a * i - c * g;
  const F = -(a * h - b * g);
  const G = b * f - c * e;
  const H = -(a * f - c * d);
  const I = a * e - b * d;
  return [A / det, D / det, G / det, B / det, E / det, H / det, C / det, F / det, I / det];
}

function poissonDeviance(y: ArrayLike<number>, mu: ArrayLike<number>): number {
  let d = 0;
  for (let i = 0; i < y.length; i++) d += 2 * ((y[i] > 0 ? y[i] * Math.log(y[i] / mu[i]) : 0) - (y[i] - mu[i]));
  return d;
}

/**
 * Poisson regression ln E[y] = c + p·lnB + q·lnA by iteratively reweighted
 * least squares, and the two pure Lanchester laws as fixed-offset fits.
 */
export function fitLanchester(y: ArrayLike<number>, lnA: ArrayLike<number>, lnB: ArrayLike<number>, matches: number): LanchesterFit | null {
  const n = y.length;
  let total = 0;
  for (let i = 0; i < n; i++) total += y[i];
  if (n < 30 || total < 20) return null;
  let beta = [Math.log(total / n + 1e-3), 0, 0];
  const mu = new Float64Array(n);
  let cov: number[] | null = null;
  for (let it = 0; it < 50; it++) {
    const xtwx = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const xtwz = [0, 0, 0];
    for (let i = 0; i < n; i++) {
      const xi = [1, lnB[i], lnA[i]];
      const eta = beta[0] + beta[1] * xi[1] + beta[2] * xi[2];
      const m = Math.exp(Math.max(-30, Math.min(30, eta)));
      mu[i] = m;
      const zi = eta + (y[i] - m) / m;
      for (let r = 0; r < 3; r++) {
        xtwz[r] += xi[r] * m * zi;
        for (let c = 0; c < 3; c++) xtwx[r * 3 + c] += xi[r] * m * xi[c];
      }
    }
    cov = inv3(xtwx);
    if (!cov) return null;
    const nb = [0, 1, 2].map((r) => cov![r * 3] * xtwz[0] + cov![r * 3 + 1] * xtwz[1] + cov![r * 3 + 2] * xtwz[2]);
    const step = Math.max(...nb.map((v, r) => Math.abs(v - beta[r])));
    beta = nb;
    if (step < 1e-8) break;
  }
  for (let i = 0; i < n; i++) mu[i] = Math.exp(beta[0] + beta[1] * lnB[i] + beta[2] * lnA[i]);
  let pearson = 0;
  for (let i = 0; i < n; i++) pearson += (y[i] - mu[i]) ** 2 / mu[i];
  const phi = Math.max(1, pearson / Math.max(1, n - 3));
  const dFree = poissonDeviance(y, mu);
  const fixed = (pw: number, qw: number) => {
    let s = 0;
    for (let i = 0; i < n; i++) s += Math.exp(pw * lnB[i] + qw * lnA[i]);
    const c = Math.log(total / s);
    const m = new Float64Array(n);
    for (let i = 0; i < n; i++) m[i] = Math.exp(c + pw * lnB[i] + qw * lnA[i]);
    return poissonDeviance(y, m);
  };
  // Likelihood-ratio χ² with 2 df, scaled by the dispersion: p = exp(-x/2).
  const lr = (d: number) => Math.min(1, Math.exp(-Math.max(0, d - dFree) / phi / 2));
  const pSquare = lr(fixed(1, 0));
  const pLinear = lr(fixed(1, 1));
  const pSe = Math.sqrt(cov![4] * phi);
  const qSe = Math.sqrt(cov![8] * phi);
  const law = pSe > 0.4 || qSe > 0.4 ? 'uncertain' : pSquare >= 0.01 && pSquare >= pLinear ? 'square' : pLinear >= 0.01 ? 'linear' : beta[1] > 0.3 && beta[2] > -0.3 && beta[2] < 1.3 ? 'between' : 'neither';
  return {
    bins: n,
    binSecs: LANCHESTER_BIN,
    matches,
    losses: total,
    p: round(beta[1]),
    pSe: round(pSe),
    q: round(beta[2]),
    qSe: round(qSe),
    dispersion: round(phi, 2),
    pSquare,
    pLinear,
    law,
  };
}

function finishLanchester(job: LensJob): LanchesterFit | undefined {
  const T = job.T;
  const y = new Grow();
  const la = new Grow();
  const lb = new Grow();
  const ms = new Set<number>();
  for (const [key, b] of job.bins) {
    let all = 0;
    for (let t = 0; t < T; t++) all += b[t];
    for (let t = 0; t < T; t++) {
      const A = b[t];
      const B = all - A;
      if (A <= 0 || B <= 0) continue;
      y.push(b[T + t]);
      la.push(Math.log(A));
      lb.push(Math.log(B));
      ms.add(Math.floor(key / 65536));
    }
  }
  return fitLanchester(y.view(), la.view(), lb.view(), ms.size) ?? undefined;
}

function finishExchange(job: LensJob, ins: InsightJob, teams: readonly string[]): ExchangeMetric | undefined {
  const m = job.meta;
  if (m.kill < 0 || m.death < 0) return undefined;
  const g = m.grid;
  const M = g.mx * g.mz;
  const K = ins.mEvents.subarray(m.kill * M, m.kill * M + M);
  const D = ins.mEvents.subarray(m.death * M, m.death * M + M);
  let tk = 0;
  let td = 0;
  const byTeam: ExchangeMetric['byTeam'] = [];
  for (let t = 0; t < ins.teamKills.length; t++) {
    const k = ins.teamKills[t];
    const d = ins.teamDeaths[t];
    tk += k;
    td += d;
    if (k + d > 0) byTeam.push({ team: teams[t] ?? `#${t}`, kills: k, deaths: d, ratio: d > 0 ? round(k / d, 2) : null });
  }
  if (tk + td < 10) return undefined;
  const mf = g.f * MID;
  const cell = (c: number): ExchangeCell => {
    const k = K[c];
    const d = D[c];
    return { x: round(g.x0 + ((c % g.mx) + 0.5) * mf, 1), z: round(g.z0 + (Math.floor(c / g.mx) + 0.5) * mf, 1), kills: k, deaths: d, ratio: round((k + 0.5) / (d + 0.5), 2) };
  };
  const busy: number[] = [];
  const visited: number[] = [];
  for (let c = 0; c < M; c++) {
    if (ins.mPres[c] > 0 || K[c] + D[c] > 0) visited.push(c);
    if (K[c] + D[c] >= 8) busy.push(c);
  }
  busy.sort((a, b) => (K[b] + 0.5) / (D[b] + 0.5) - (K[a] + 0.5) / (D[a] + 0.5));
  const { top5, gini, nullTop5, nullGini } = concentration(visited.map((c) => D[c]), visited.map((c) => ins.mPres[c]));
  return {
    byTeam,
    overall: td > 0 ? round(tk / td, 2) : null,
    best: busy.slice(0, 5).map(cell),
    worst: busy.slice(Math.max(5, busy.length - 5)).reverse().map(cell),
    deathShareTop5: round(top5, 3),
    deathShareNull: round(nullTop5, 3),
    gini: round(gini, 3),
    giniNull: round(nullGini, 3),
    moranI: moran(ins, D, g.mx, g.mz),
    cells: visited.length,
  };
}

/**
 * How concentrated events are against the time spent: places ranked by their
 * rate shrunk towards the overall one (two events' worth of prior), then the
 * share of events on the places holding the first 5% of the time, and the
 * Gini coefficient of the Lorenz curve of events over time in that order.
 * Few events over many places look concentrated by chance alone, so the same
 * is measured on events scattered in proportion to time (`null*`, the mean of
 * 24 seeded draws): what exceeds that is concentration.
 */
export function concentration(events: ArrayLike<number>, time: ArrayLike<number>): { top5: number; gini: number; sum: number; nullTop5: number; nullGini: number } {
  const n = events.length;
  let E = 0;
  let minP = Infinity;
  for (let i = 0; i < n; i++) {
    E += events[i];
    if (time[i] > 0 && time[i] < minP) minP = time[i];
  }
  if (!(E > 0) || !Number.isFinite(minP)) return { top5: 0, gini: 0, sum: E, nullTop5: 0, nullGini: 0 };
  const tm = Float64Array.from({ length: n }, (_, i) => Math.max(time[i], minP / 2));
  let total = 0;
  for (let i = 0; i < n; i++) total += tm[i];
  const obs = lorenz(events, tm, total, E);
  // The null: E events dropped by time spent.
  const cum = new Float64Array(n);
  let acc = 0;
  for (let i = 0; i < n; i++) cum[i] = acc += tm[i] / total;
  // Past a few hundred thousand events chance concentration is nil; fewer draws only make the null stricter.
  const draws = Math.min(E, 200_000);
  let seed = 0x9e3779b9;
  let nt = 0;
  let ng = 0;
  const RUNS = 24;
  const sim = new Float64Array(n);
  for (let r = 0; r < RUNS; r++) {
    sim.fill(0);
    for (let k = 0; k < draws; k++) {
      seed = (Math.imul(seed ^ (seed >>> 15), 0x2c1b3c6d) + 0x6d2b79f5) >>> 0;
      const u = seed / 4294967296;
      let lo = 0;
      let hi = n - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] < u) lo = mid + 1;
        else hi = mid;
      }
      sim[lo]++;
    }
    const l = lorenz(sim, tm, total, draws);
    nt += l.top5;
    ng += l.gini;
  }
  return { top5: obs.top5, gini: obs.gini, sum: E, nullTop5: nt / RUNS, nullGini: ng / RUNS };
}

function lorenz(events: ArrayLike<number>, tm: Float64Array, total: number, E: number): { top5: number; gini: number } {
  const n = events.length;
  const r0 = E / total;
  const prior = 2;
  const rate = new Float64Array(n);
  for (let i = 0; i < n; i++) rate[i] = (events[i] + prior) / (tm[i] + prior / r0);
  const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => rate[b] - rate[a]);
  let cp = 0;
  let ce = 0;
  let top5 = -1;
  let area = 0;
  for (const i of order) {
    const p0 = cp;
    const e0 = ce;
    cp += tm[i] / total;
    ce += events[i] / E;
    // The 5% mark falls inside this place: its events in proportion.
    if (top5 < 0 && cp >= 0.05) top5 = e0 + ((0.05 - p0) / (cp - p0)) * (ce - e0);
    area += ((cp - p0) * (ce + e0)) / 2;
  }
  return { top5: Math.min(1, Math.max(0, top5)), gini: Math.max(0, 2 * area - 1) };
}

/** Moran's I of deaths per time over visited cells, rook neighbours. */
function moran(ins: InsightJob, D: ArrayLike<number>, w: number, h: number): number | null {
  const rate = new Float64Array(w * h).fill(NaN);
  let n = 0;
  let mean = 0;
  for (let c = 0; c < w * h; c++)
    if (ins.mPres[c] > 0) {
      rate[c] = D[c] / ins.mPres[c];
      mean += rate[c];
      n++;
    }
  if (n < 20) return null;
  mean /= n;
  let num = 0;
  let den = 0;
  let W = 0;
  for (let z = 0; z < h; z++)
    for (let x = 0; x < w; x++) {
      const c = z * w + x;
      const v = rate[c];
      if (!(v === v)) continue;
      den += (v - mean) ** 2;
      for (const [dx, dz] of [[1, 0], [0, 1]]) {
        const xx = x + dx;
        const zz = z + dz;
        if (xx >= w || zz >= h) continue;
        const u = rate[zz * w + xx];
        if (!(u === u)) continue;
        num += 2 * (v - mean) * (u - mean);
        W += 2;
      }
    }
  if (!(den > 0) || W === 0) return null;
  return round((n / W) * (num / den), 3);
}

function finishForceRatio(job: LensJob): ForceRatioMetric | undefined {
  const n = job.frN;
  if (n < 20) return undefined;
  const near = Array.from(job.frNear.view()).filter((d) => Number.isFinite(d)).sort((a, b) => a - b);
  if (near.length < 10) return undefined;
  const p50 = quantileSorted(near, 0.5);
  let r = 0;
  while (r < RADII - 1 && job.radii[r] < 2 * p50) r++;
  let sup = 0;
  let inf = 0;
  let even = 0;
  let expected = 0;
  const bands = [0, 0, 0, 0, 0];
  for (let i = 0; i < n; i++) {
    const f = job.frCounts[(i * RADII + r) * 2];
    const e = job.frCounts[(i * RADII + r) * 2 + 1];
    if (f === 0 || e === 0) continue;
    const ratio = f / e;
    bands[ratio <= 1 / 3 ? 0 : ratio < 0.75 ? 1 : ratio <= 4 / 3 ? 2 : ratio < 3 ? 3 : 4]++;
    if (ratio >= 1.5) sup++;
    else if (ratio <= 1 / 1.5) inf++;
    else {
      even++;
      continue;
    }
    expected += Math.max(f, e) / (f + e);
  }
  const unequal = sup + inf;
  if (unequal < 10) return undefined;
  return {
    kills: n,
    radius: round(job.radii[r], 1),
    range: { p25: round(quantileSorted(near, 0.25), 1), p50: round(p50, 1), p75: round(quantileSorted(near, 0.75), 1) },
    superior: sup,
    inferior: inf,
    even,
    superiorShare: round(sup / unequal, 3),
    p: binomTwoSided(sup, unequal, 0.5),
    excess: round(sup / Math.max(1e-9, expected), 3),
    bands: (['≤1:3', '1:2', '1:1', '2:1', '≥3:1'] as const).map((band, i) => ({ band, kills: bands[i] })),
  };
}

function finishEnergy(job: LensJob): EnergyMetric | undefined {
  const k = job.eKill.view();
  const d = job.eDeath.view();
  if (k.length < 10 || d.length < 10) return undefined;
  const ks = Float64Array.from(k).sort();
  const ds = Float64Array.from(d).sort();
  const { auc, p } = aucTest(k, d);
  return { kills: k.length, deaths: d.length, killerMedian: round(quantileSorted(ks, 0.5), 1), victimMedian: round(quantileSorted(ds, 0.5), 1), auc: round(auc, 3), p };
}

function finishKeyTerrain(job: LensJob): KeyTerrainMetric | undefined {
  const g = job.meta.grid;
  const topCount = new Map<number, number>();
  const kills = new Map<number, number>();
  let matches = 0;
  for (const m of job.kt.values()) {
    let total = 0;
    for (const [c, v] of m) {
      total += v;
      kills.set(c, (kills.get(c) ?? 0) + v);
    }
    if (total < 3) continue;
    matches++;
    const top = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    for (const [c] of top) topCount.set(c, (topCount.get(c) ?? 0) + 1);
  }
  if (matches < 3) return undefined;
  const cf = g.f * COARSE;
  const places = [...topCount.entries()]
    .sort((a, b) => b[1] - a[1] || (kills.get(b[0]) ?? 0) - (kills.get(a[0]) ?? 0))
    .slice(0, 5)
    .map(([c, n]) => ({ x: round(g.x0 + ((c % g.cx) + 0.5) * cf, 1), z: round(g.z0 + (Math.floor(c / g.cx) + 0.5) * cf, 1), persistence: round(n / matches, 3), kills: kills.get(c) ?? 0 }));
  return { matches, places };
}

function finishTrades(job: LensJob, radius: number, teams: readonly string[]): TradesMetric | undefined {
  const n = job.dT.n;
  if (n < 20 || !(radius > 0)) return undefined;
  const per = new Map<number, [number, number]>();
  let traded = 0;
  for (let i = 0; i < n; i++) {
    const tm = job.dTeam.a[i];
    const ok = job.dTrade.a[i] <= radius;
    if (ok) traded++;
    const e = per.get(tm) ?? [0, 0];
    e[0]++;
    if (ok) e[1]++;
    per.set(tm, e);
  }
  return {
    deaths: n,
    traded,
    rate: round(traded / n, 3),
    radius: round(radius, 1),
    byTeam: [...per.entries()].sort((a, b) => a[0] - b[0]).map(([t, [d, tr]]) => ({ team: teams[t] ?? `#${t}`, deaths: d, traded: tr, rate: round(tr / d, 3) })),
  };
}

function finishInitiative(job: LensJob): InitiativeMetric | undefined {
  for (const e of job.eng.values()) closeEngagement(job, e);
  job.eng.clear();
  if (job.engN < 10) return undefined;
  return { engagements: job.engN, firstWins: job.engFirst, share: round(job.engFirst / job.engN, 3), p: binomTwoSided(job.engFirst, job.engN, 0.5) };
}

/**
 * The viewshed of mid cells over a 2.5D obstruction surface: the ground
 * walked (mean row height) or, with a level, its vertex heights up to a wall's
 * height above that ground (higher ones are roofs and overhangs, not walls).
 */
function finishFieldsOfFire(job: LensJob, ins: InsightJob, range: number): FieldsOfFireMetric | undefined {
  const m = job.meta;
  const g = m.grid;
  const W = g.mx;
  const H = g.mz;
  const M = W * H;
  if (m.kill < 0 || m.death < 0) return undefined;
  const eye = 1.7 * job.upm;
  const ground = new Float64Array(M).fill(NaN);
  const sum = new Float64Array(M);
  const cnt = new Float64Array(M);
  for (let z = 0; z < g.nz; z++)
    for (let x = 0; x < g.nx; x++) {
      const fi = z * g.nx + x;
      if (!ins.fN[fi]) continue;
      const c = Math.floor(z / MID) * W + Math.floor(x / MID);
      sum[c] += ins.fY[fi];
      cnt[c] += ins.fN[fi];
    }
  for (let c = 0; c < M; c++) if (cnt[c] > 0) ground[c] = sum[c] / cnt[c];
  const obst = new Float64Array(M).fill(NaN);
  const lv = job.lvH && job.lvN ? { h: job.lvH, n: job.lvN } : null;
  for (let c = 0; c < M; c++) {
    let gr = ground[c];
    let top = gr;
    if (lv && lv.n[c] > 0) {
      let lo = Infinity;
      for (let i = 0; i < lv.n[c]; i++) lo = Math.min(lo, lv.h[c * RES + i]);
      if (!(gr === gr)) gr = lo;
      top = gr;
      const wall = gr + 3 * eye;
      for (let i = 0; i < lv.n[c]; i++) {
        const v = lv.h[c * RES + i];
        if (v <= wall && v > top) top = v;
      }
    }
    obst[c] = top;
  }
  const mf = g.f * MID;
  const R = Math.max(6, Math.min(96, Math.round(range / mf)));
  const visited = (c: number) => ins.mPres[c] > 0;
  const stamp = new Uint32Array(M);
  let stampN = 0;
  // Enough rays that the ring at full range is sampled cell by cell.
  const RAYS = Math.min(720, Math.max(72, Math.ceil(2 * Math.PI * R)));
  const view = (c0: number): number => {
    const cx = c0 % W;
    const cz = Math.floor(c0 / W);
    const eyeY = (ground[c0] === ground[c0] ? ground[c0] : obst[c0]) + eye;
    if (!(eyeY === eyeY)) return NaN;
    stampN++;
    let seen = 0;
    for (let r = 0; r < RAYS; r++) {
      const a = (r / RAYS) * Math.PI * 2;
      const dx = Math.cos(a);
      const dz = Math.sin(a);
      let maxSlope = -Infinity;
      for (let s = 0.5; s <= R; s += 0.5) {
        const x = Math.floor(cx + 0.5 + dx * s);
        const z = Math.floor(cz + 0.5 + dz * s);
        if (x < 0 || z < 0 || x >= W || z >= H) break;
        const q = z * W + x;
        if (q === c0) continue;
        const o = obst[q];
        if (!(o === o)) continue;
        const dist = s * mf;
        if (visited(q) && stamp[q] !== stampN) {
          const tY = (ground[q] === ground[q] ? ground[q] : o) + eye * 0.5;
          if ((tY - eyeY) / dist >= maxSlope) {
            stamp[q] = stampN;
            seen++;
          }
        }
        const sl = (o - eyeY) / dist;
        if (sl > maxSlope) maxSlope = sl;
      }
    }
    let total = 0;
    for (let z = Math.max(0, cz - R); z <= Math.min(H - 1, cz + R); z++)
      for (let x = Math.max(0, cx - R); x <= Math.min(W - 1, cx + R); x++) {
        const q = z * W + x;
        if (q !== c0 && visited(q) && (x - cx) ** 2 + (z - cz) ** 2 <= R * R) total++;
      }
    return total > 0 ? Math.min(1, seen / total) : NaN;
  };
  const K = ins.mEvents.subarray(m.kill * M, m.kill * M + M);
  const D = ins.mEvents.subarray(m.death * M, m.death * M + M);
  const vis: number[] = [];
  for (let c = 0; c < M; c++) if (visited(c)) vis.push(c);
  if (vis.length < 20) return undefined;
  // Baseline: a spread sample of the visited ground, weighted by time spent.
  const stride = Math.max(1, Math.floor(vis.length / 256));
  let bw = 0;
  let bv = 0;
  for (let i = 0; i < vis.length; i += stride) {
    const v = view(vis[i]);
    if (!(v === v)) continue;
    bw += ins.mPres[vis[i]];
    bv += ins.mPres[vis[i]] * v;
  }
  if (!(bw > 0)) return undefined;
  const baseline = bv / bw;
  const hot = vis.filter((c) => K[c] >= 5).sort((a, b) => K[b] - K[a]).slice(0, 8);
  if (!hot.length) return undefined;
  const hotspots = hot.map((c) => ({
    x: round(g.x0 + ((c % W) + 0.5) * mf, 1),
    z: round(g.z0 + (Math.floor(c / W) + 0.5) * mf, 1),
    kills: K[c],
    deaths: D[c],
    view: round(view(c), 3),
  }));
  const hv = hotspots.map((h) => h.view).filter((v) => v === v);
  const hotMean = hv.reduce((a, b) => a + b, 0) / Math.max(1, hv.length);
  const busy = vis.filter((c) => K[c] + D[c] >= 6).sort((a, b) => K[b] + D[b] - (K[a] + D[a])).slice(0, 300);
  const vv: number[] = [];
  const share: number[] = [];
  for (const c of busy) {
    const v = view(c);
    if (!(v === v)) continue;
    vv.push(v);
    share.push(K[c] / (K[c] + D[c]));
  }
  const rho = spearman(vv, share);
  return {
    source: lv ? 'level' : 'ground',
    range: round(R * mf, 1),
    hotspots,
    baseline: round(baseline, 3),
    ratio: baseline > 0 ? round(hotMean / baseline, 2) : 0,
    rho: rho === null ? null : round(rho, 3),
    cells: vis.length,
  };
}

export function finishLens(job: LensJob, ins: InsightJob, teams: readonly string[]): LensMetrics {
  const all = Math.max(1, job.rowsAll);
  const domain = {
    air: round(job.rowsAir / all, 3),
    ground: round(job.rowsGround / all, 3),
    sea: round(job.rowsSea / all, 3),
    infantry: round(job.rowsInf / all, 3),
  };
  const out: LensMetrics = { schema: 'heat3d.lens/1', domain, upm: job.upm };
  const put = <K extends keyof LensMetrics>(k: K, v: LensMetrics[K] | undefined) => {
    if (v !== undefined) out[k] = v;
  };
  put('lanchester', finishLanchester(job));
  put('exchange', finishExchange(job, ins, teams));
  const fr = finishForceRatio(job);
  put('forceRatio', fr);
  put('energy', finishEnergy(job));
  put('keyTerrain', finishKeyTerrain(job));
  put('trades', finishTrades(job, fr?.radius ?? job.radii[4], teams));
  put('initiative', finishInitiative(job));
  if (domain.air < 0.5) put('fieldsOfFire', finishFieldsOfFire(job, ins, fr ? fr.range.p75 * 3 : 48 * job.meta.grid.f * MID));
  return out;
}

/** The lens metrics; a failure there never costs the report. */
export function safeFinishLens(job: LensJob, ins: InsightJob, teams: readonly string[]): LensMetrics | undefined {
  try {
    return finishLens(job, ins, teams);
  } catch (e) {
    console.warn('lens metrics failed', e);
    return undefined;
  }
}
