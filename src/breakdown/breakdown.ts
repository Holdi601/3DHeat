/**
 * Who and what does best and worst in a place: the rows of a spot, the view
 * or a volume broken down by any category (a vehicle, a weapon, a player, a
 * team, a side, a buy, a binned number...), and every state factor (gear,
 * abilities, attachments, buffs, modules) measured with against without.
 *
 * Per group it counts the rows on each side of the difference map (layer A
 * and layer B, by the same split the heat draws), kills, deaths, seconds of
 * presence, money earned and lost (`earn_*` / `cost_*` columns) and the
 * rounds or matches played and won where the rows say who won (`won`).
 * Kills, deaths, presence, money and wins count every row the view shows in
 * the place, on either side or none: a kills-against-deaths split leaves the
 * movement samples on neither side, and presence is counted from them.
 *
 * State "at the time": a row's value of a column is its own, unless the row
 * lacks one (an event row that logs no gear) or is a death - a death row can
 * name the killer's weapon - and then it is what the same person last carried
 * on an earlier row of the match. The opponent's value (the victim's weapon on
 * a kill, the killer's on a death) is the other party's carried state.
 *
 * Like the volume comparison (`volumes/compare.ts`) the pass runs in a worker
 * over chunks of the columns copied a slice at a time (`breakdownRun.ts`);
 * this module is the pass alone, free of any thread, so the tests drive it.
 * The numbers each group needs from these totals (ratios, shrinkage, effect
 * sizes) are worked out on demand by `metrics.ts`, over groups, not rows.
 */

import type { ActiveFilter } from '../render/types';
import { rowShown, type CompareChunk } from '../volumes/compare';
import { compiled, compiledContains, type CompiledVolume, type Volume } from '../volumes/volume';

/** Event codes the pass knows; the rest are 0. */
export const EV_OTHER = 0;
export const EV_KILL = 1;
export const EV_DEATH = 2;
export const EV_POSITION = 3;

/** A column's slice: f32 values, or category / id indices. */
export type ColumnSlice = Float32Array | Uint32Array | Uint16Array;

/** Where the rows are counted. */
export type Region =
  | { kind: 'all' }
  | { kind: 'sphere'; c: [number, number, number]; r: number }
  /** Inside the view: a world -> clip matrix (column major, GL depth). */
  | { kind: 'frustum'; m: Float32Array | number[] }
  | { kind: 'volume'; v: Volume };

/** How a row's value of the column becomes a group. */
export interface DimSpec {
  /** Whose value: the row's (as carried, see above) or the other party's. */
  mode: 'own' | 'opponent';
  /** Category columns: category -> group (-1 none); numeric: null and `edges` instead. */
  remap: Int32Array | null;
  /** Numeric columns: ascending bin edges, `groups + 1` of them; a value outside goes to the nearest bin. */
  edges: Float64Array | null;
  groups: number;
}

/** One column that holds state factors. */
export type FactorSource =
  /** A number: the factor is on while it is non-zero. */
  | { kind: 'flag'; factor: number }
  /** A category: each category's factor (-1 none). */
  | { kind: 'cat'; factorOf: Int32Array }
  /** A list per category (`a|b|c`): category c's factors are `items[offs[c] .. offs[c + 1])`. */
  | { kind: 'list'; offs: Int32Array; items: Int32Array };

export interface BreakdownMeta {
  persons: number;
  sessions: number;
  /** Most seconds one row's gap counts for. */
  dwellCap: number;
  /** Category of the event column -> `EV_*`; null without one (every row is a sample). */
  eventCode: Int8Array | null;
  /** Category of the other-party column -> person (-1 none); null without one. */
  otherPerson: Int32Array | null;
  /** Per column read (the dimension, then each factor source): categories that mean "nothing logged". */
  missing: (Uint8Array | null)[];
  dim: DimSpec | null;
  factors: FactorSource[];
  factorCount: number;
  hasEarn: boolean;
  hasCost: boolean;
  hasWon: boolean;
  /** Rounds per session (largest round + 1); 1 without a round column. */
  rounds: number;
}

/** How the difference split signs a row (`render/filterTables.ts` `SplitTable`). */
export interface SideRule {
  /** 0: by group (`teamSign`), 1: by category (`sign`), 2: by range, -1: no difference (every row is A). */
  mode: -1 | 0 | 1 | 2;
  teamSign: Int8Array | null;
  sign: Int8Array | null;
  positive: [number, number];
  negative: [number, number];
}

export interface BreakdownScope {
  timeLo: number;
  timeHi: number;
  lifetimeNow: number | null;
  defaultLifetime: number;
  filters: ActiveFilter[];
  groupShown: Int8Array | null;
  session: number;
}

/** A slice of the columns, rows `[lo, lo + n)`; absent columns are null. */
export interface BreakdownChunk {
  n: number;
  px: Float32Array;
  py: Float32Array;
  pz: Float32Array;
  time: Float32Array | null;
  life: Float32Array | null;
  person: Uint32Array | null;
  team: Uint16Array | null;
  session: Uint32Array | null;
  event: Uint32Array | null;
  other: Uint32Array | null;
  /** The split's column (modes 1 and 2). */
  split: ColumnSlice | null;
  dim: ColumnSlice | null;
  factors: (ColumnSlice | null)[];
  earn: Float32Array | null;
  cost: Float32Array | null;
  won: Float32Array | null;
  round: ColumnSlice | null;
  filt: (ArrayLike<number> | null)[];
}

/** The totals of one group (or of everything, or of a factor's "with"). */
export interface Sums {
  a: number;
  b: number;
  rows: number;
  kills: number;
  deaths: number;
  /** Seconds. */
  presence: number;
  earn: number;
  cost: number;
  /** Rounds (or matches) played and won, of those whose result the rows say. */
  played: number;
  won: number;
}

export interface BreakdownResult {
  /** Per group, each measure `Sums` names (null without a dimension). */
  groups: { [K in keyof Sums]: Float64Array } | null;
  total: Sums;
  /** Per factor, the rows with it on. */
  factors: { [K in keyof Sums]: Float64Array };
  shown: number;
}

const KEYS = ['a', 'b', 'rows', 'kills', 'deaths', 'presence', 'earn', 'cost', 'played', 'won'] as const;

function sumArrays(n: number): { [K in keyof Sums]: Float64Array } {
  const o = {} as { [K in keyof Sums]: Float64Array };
  for (const k of KEYS) o[k] = new Float64Array(n);
  return o;
}

export interface BreakdownJob {
  meta: BreakdownMeta;
  scope: BreakdownScope;
  side: SideRule;
  region: Region;
  vol: CompiledVolume | null;
  g: { [K in keyof Sums]: Float64Array } | null;
  f: { [K in keyof Sums]: Float64Array };
  t: Sums;
  /** Per person: the session its state belongs to (-1 none), and the carried values per column. */
  pSess: Int32Array | null;
  carry: Float64Array[];
  /** Instance (session, round, person or team) -> index; per index its result and factor bits. */
  inst: Map<number, number>;
  instWon: Int8Array;
  instBits: Uint32Array;
  words: number;
  /** (instance, group) seen. */
  instGroup: Set<number>;
  shown: number;
}

export function createBreakdown(meta: BreakdownMeta, scope: BreakdownScope, side: SideRule, region: Region): BreakdownJob {
  const cols = 1 + meta.factors.length;
  const P = meta.persons;
  const words = Math.max(1, Math.ceil(meta.factorCount / 32));
  return {
    meta,
    scope,
    side,
    region,
    vol: region.kind === 'volume' ? compiled(region.v) : null,
    g: meta.dim ? sumArrays(meta.dim.groups) : null,
    f: sumArrays(meta.factorCount),
    t: { a: 0, b: 0, rows: 0, kills: 0, deaths: 0, presence: 0, earn: 0, cost: 0, played: 0, won: 0 },
    pSess: P > 0 ? new Int32Array(P).fill(-1) : null,
    carry: P > 0 ? Array.from({ length: cols }, () => new Float64Array(P).fill(NaN)) : [],
    inst: new Map(),
    instWon: new Int8Array(1024).fill(-1),
    instBits: new Uint32Array(1024 * words),
    words,
    instGroup: new Set(),
    shown: 0,
  };
}

function inRegion(job: BreakdownJob, x: number, y: number, z: number): boolean {
  const r = job.region;
  if (r.kind === 'all') return true;
  if (r.kind === 'sphere') {
    const dx = x - r.c[0];
    const dy = y - r.c[1];
    const dz = z - r.c[2];
    return dx * dx + dy * dy + dz * dz <= r.r * r.r;
  }
  if (r.kind === 'volume') return compiledContains(job.vol!, x, y, z);
  const m = r.m;
  const w = m[3] * x + m[7] * y + m[11] * z + m[15];
  if (w <= 1e-9) return false;
  const cx = m[0] * x + m[4] * y + m[8] * z + m[12];
  if (cx < -w || cx > w) return false;
  const cy = m[1] * x + m[5] * y + m[9] * z + m[13];
  return cy >= -w && cy <= w;
}

function sideOf(job: BreakdownJob, ch: BreakdownChunk, j: number): number {
  const s = job.side;
  if (s.mode === -1) return 1;
  const g = ch.team ? ch.team[j] : 0;
  const groupSign = s.teamSign && g < s.teamSign.length ? s.teamSign[g] : 1;
  if (s.mode === 0) return groupSign;
  if (groupSign === 0 || !ch.split) return 0;
  const v = ch.split[j];
  if (s.mode === 1) {
    const c = Math.round(v);
    return s.sign && c >= 0 && c < s.sign.length ? s.sign[c] : 0;
  }
  return v >= s.positive[0] && v <= s.positive[1] ? 1 : v >= s.negative[0] && v <= s.negative[1] ? -1 : 0;
}

/** The value of column `k` (0 the dimension, 1.. the factor sources) a row stands for, per the carry rule. */
function valueAt(job: BreakdownJob, k: number, data: ColumnSlice, j: number, p: number, death: boolean): number {
  const raw = data[j];
  const miss = job.meta.missing[k];
  const absent = raw !== raw || (miss !== null && raw < miss.length && miss[raw] === 1);
  const carried = p >= 0 ? job.carry[k][p] : NaN;
  if (death && carried === carried) return carried;
  return absent ? carried : raw;
}

function groupOf(d: DimSpec, v: number): number {
  if (v !== v) return -1;
  if (d.remap) {
    const c = Math.trunc(v);
    return c >= 0 && c < d.remap.length ? d.remap[c] : -1;
  }
  const e = d.edges!;
  if (v <= e[0]) return 0;
  // Few bins: a scan is as quick as a search.
  for (let b = 1; b < e.length - 1; b++) if (v < e[b]) return b - 1;
  return d.groups - 1;
}

function instanceOf(job: BreakdownJob, key: number): number {
  let i = job.inst.get(key);
  if (i === undefined) {
    i = job.inst.size;
    job.inst.set(key, i);
    if (i >= job.instWon.length) {
      const won = new Int8Array(job.instWon.length * 2).fill(-1);
      won.set(job.instWon);
      job.instWon = won;
      const bits = new Uint32Array(won.length * job.words);
      bits.set(job.instBits);
      job.instBits = bits;
    }
  }
  return i;
}

const factorScratch: number[] = [];

function add(o: { [K in keyof Sums]: Float64Array }, i: number, sa: number, sb: number, kill: number, death: number, pres: number, earn: number, cost: number): void {
  o.a[i] += sa;
  o.b[i] += sb;
  o.rows[i]++;
  o.kills[i] += kill;
  o.deaths[i] += death;
  o.presence[i] += pres;
  o.earn[i] += earn;
  o.cost[i] += cost;
}

/** Fold one chunk into the job. Chunks come in row order: the carried state follows them. */
export function stepBreakdown(job: BreakdownJob, ch: BreakdownChunk): void {
  const { meta, scope } = job;
  const P = meta.persons;
  const dim = meta.dim;
  const nf = meta.factors.length;
  const R = Math.max(1, meta.rounds);
  const G = dim ? dim.groups : 1;
  const opp = !!dim && dim.mode === 'opponent';
  for (let j = 0; j < ch.n; j++) {
    const p = ch.person && P > 0 ? ch.person[j] : -1;
    const sess = ch.session ? ch.session[j] : 0;
    const code = meta.eventCode && ch.event ? meta.eventCode[ch.event[j]] ?? 0 : EV_POSITION;
    const death = code === EV_DEATH;
    // The person's state belongs to one match: a new match starts it afresh.
    if (p >= 0 && job.pSess![p] !== sess) {
      job.pSess![p] = sess;
      for (const c of job.carry) c[p] = NaN;
    }
    // Values at the time, before this row updates what the person carries.
    let g = -1;
    if (dim && ch.dim) {
      if (opp) {
        const o = (code === EV_KILL || code === EV_DEATH) && ch.other && meta.otherPerson ? meta.otherPerson[ch.other[j]] ?? -1 : -1;
        g = o >= 0 && job.pSess![o] === sess ? groupOf(dim, job.carry[0][o]) : -1;
      } else g = groupOf(dim, valueAt(job, 0, ch.dim, j, p, death));
    }
    let nOn = 0;
    for (let k = 0; k < nf; k++) {
      const data = ch.factors[k];
      if (!data) continue;
      const v = valueAt(job, k + 1, data, j, p, death);
      if (v !== v) continue;
      const src = meta.factors[k];
      if (src.kind === 'flag') {
        if (v !== 0) factorScratch[nOn++] = src.factor;
      } else {
        const c = Math.trunc(v);
        if (src.kind === 'cat') {
          const f = c >= 0 && c < src.factorOf.length ? src.factorOf[c] : -1;
          if (f >= 0) factorScratch[nOn++] = f;
        } else if (c >= 0 && c + 1 < src.offs.length) {
          for (let q = src.offs[c]; q < src.offs[c + 1]; q++) factorScratch[nOn++] = src.items[q];
        }
      }
    }
    // What the person carries from here on: the row's own values, a death's aside.
    if (p >= 0 && !death) {
      const carry = (k: number, data: ColumnSlice | null) => {
        if (!data) return;
        const raw = data[j];
        const miss = meta.missing[k];
        if (raw === raw && !(miss !== null && raw < miss.length && miss[raw] === 1)) job.carry[k][p] = raw;
      };
      carry(0, ch.dim);
      for (let k = 0; k < nf; k++) carry(k + 1, ch.factors[k]);
    }

    if (!rowShown(scope, ch as unknown as CompareChunk, j)) continue;
    if (!inRegion(job, ch.px[j], ch.py[j], ch.pz[j])) continue;
    job.shown++;
    const sgn = sideOf(job, ch, j);
    const sa = sgn > 0 ? 1 : 0;
    const sb = sgn < 0 ? 1 : 0;
    const kill = code === EV_KILL ? 1 : 0;
    const dead = death ? 1 : 0;
    let pres = 0;
    if (code === EV_POSITION && ch.life) {
      const l = ch.life[j];
      if (l > 0) pres = l < meta.dwellCap ? l : meta.dwellCap;
    }
    const earn = ch.earn ? ch.earn[j] || 0 : 0;
    const cost = ch.cost ? ch.cost[j] || 0 : 0;
    const t = job.t;
    t.a += sa;
    t.b += sb;
    t.rows++;
    t.kills += kill;
    t.deaths += dead;
    t.presence += pres;
    t.earn += earn;
    t.cost += cost;
    if (g >= 0) add(job.g!, g, sa, sb, kill, dead, pres, earn, cost);
    for (let q = 0; q < nOn; q++) add(job.f, factorScratch[q], sa, sb, kill, dead, pres, earn, cost);

    // Results: one instance per person (else side) and round of a match.
    if (meta.hasWon && ch.won) {
      const won = ch.won[j];
      if (won === won) {
        const rd = ch.round ? Math.max(0, Math.min(R - 1, Math.trunc(ch.round[j]) || 0)) : 0;
        const who = p >= 0 ? p : (ch.team ? ch.team[j] : 0) + P;
        const i = instanceOf(job, (sess * R + rd) * (P + 65536) + who);
        job.instWon[i] = won >= 0.5 ? 1 : 0;
        const base = i * job.words;
        for (let q = 0; q < nOn; q++) {
          const f = factorScratch[q];
          job.instBits[base + (f >>> 5)] |= 1 << (f & 31);
        }
        if (g >= 0) job.instGroup.add(i * G + g);
      }
    }
  }
}

export function finishBreakdown(job: BreakdownJob): BreakdownResult {
  const n = job.inst.size;
  const F = job.meta.factorCount;
  for (let i = 0; i < n; i++) {
    const w = job.instWon[i];
    if (w < 0) continue;
    job.t.played++;
    job.t.won += w;
    const base = i * job.words;
    for (let f = 0; f < F; f++) {
      if (job.instBits[base + (f >>> 5)] & (1 << (f & 31))) {
        job.f.played[f]++;
        job.f.won[f] += w;
      }
    }
  }
  if (job.g) {
    const G = job.meta.dim!.groups;
    for (const key of job.instGroup) {
      const i = Math.floor(key / G);
      const g = key - i * G;
      const w = job.instWon[i];
      if (w < 0) continue;
      job.g.played[g]++;
      job.g.won[g] += w;
    }
  }
  return { groups: job.g, total: job.t, factors: job.f, shown: job.shown };
}
