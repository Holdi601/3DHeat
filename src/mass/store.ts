/**
 * The mass analysis's tables: every match's summary head (`types.ts`) kept
 * as columns of numbers over one string dictionary - a match, its teams,
 * vehicles, players and weapons, its phases - so ten thousand matches take
 * tens of megabytes, not the heads' JSON. Everything the panel shows is a
 * pass over these columns for the matches the filter keeps (`matchMask`).
 */

import { binomTwoSided, bhAdjust, wilson } from '../insights/stats';
import { GRID_KINDS, PHASE_BINS, type SummaryHead } from './types';

/** Phases kept per match, by kind (a row of `PHASE_BINS` each). */
export const PHASE_KINDS = ['kill', 'death', 'hit', 'launch', 'fire', 'spawn', 'capture'] as const;
const PK = PHASE_KINDS.length;
const GK = GRID_KINDS.length;
/** Classes that are not driven (a weapon's own track, a decoy): left out of balance tables. */
export const NOT_DRIVEN = new Set(['weapon', 'decoy']);

/** A column of numbers that grows. */
class Col {
  a: Float64Array;
  n = 0;
  constructor(cap = 256) {
    this.a = new Float64Array(cap);
  }
  push(v: number): void {
    if (this.n === this.a.length) {
      const b = new Float64Array(this.a.length * 2);
      b.set(this.a);
      this.a = b;
    }
    this.a[this.n++] = v;
  }
  get(i: number): number {
    return this.a[i];
  }
}

/** Float32 for the big tables: counts and seconds a row. */
class Col32 {
  a: Float32Array;
  n = 0;
  constructor(cap = 1024) {
    this.a = new Float32Array(cap);
  }
  push(v: number): void {
    if (this.n === this.a.length) {
      const b = new Float32Array(this.a.length * 2);
      b.set(this.a);
      this.a = b;
    }
    this.a[this.n++] = v;
  }
}

class Dict {
  readonly list: string[] = [];
  private readonly map = new Map<string, number>();
  id(s: string | null | undefined): number {
    if (s === null || s === undefined) return -1;
    let i = this.map.get(s);
    if (i === undefined) {
      i = this.list.length;
      this.list.push(s);
      this.map.set(s, i);
    }
    return i;
  }
  of(i: number): string {
    return i >= 0 ? this.list[i] : '';
  }
}

const TABLE = <K extends string>(keys: readonly K[]) => Object.fromEntries(keys.map((k) => [k, new Col32()])) as Record<K, Col32>;

const M_KEYS = ['game', 'map', 'mode', 'mission', 'started', 'duration', 'rows', 'units', 'players', 'ai', 'winner', 'team0', 'teams', 'veh0', 'vehs', 'pl0', 'pls', 'wp0', 'wps', 'cur', 'source'] as const;
const T_KEYS = ['match', 'name', 'units', 'players', 'presence', 'kills', 'deaths', 'won', 'earn', 'spent'] as const;
const V_KEYS = ['match', 'key', 'label', 'cls', 'team', 'tier', 'units', 'players', 'presence', 'kills', 'deaths', 'hits', 'launches', 'fires', 'damage', 'winSum', 'winN', 'earn', 'spent'] as const;
const P_KEYS = ['match', 'id', 'name', 'team', 'units', 'presence', 'kills', 'deaths', 'hits', 'launches', 'won', 'veh'] as const;
const W_KEYS = ['match', 'name', 'kills', 'hits', 'launches', 'fires', 'misses'] as const;

export interface MassFilter {
  games?: string[];
  maps?: string[];
  modes?: string[];
  /** Epoch ms, inclusive; matches without a date pass only when neither is set. */
  from?: number | null;
  to?: number | null;
}

/** What a drill-down asks for, besides the filter. */
export interface MassDrill {
  match?: number;
  /** These matches (a place's: where it held), within the filter. */
  matches?: number[];
  vehicle?: string;
  cls?: string;
  team?: string;
  player?: string;
  weapon?: string;
}

export class MassStore {
  readonly dict = new Dict();
  /** Per match; started in epoch seconds (NaN unknown), `source` its file's index in `paths`. */
  readonly m: Record<(typeof M_KEYS)[number], Col> = Object.fromEntries(M_KEYS.map((k) => [k, new Col()])) as Record<(typeof M_KEYS)[number], Col>;
  readonly t = TABLE(T_KEYS);
  readonly v = TABLE(V_KEYS);
  readonly p = TABLE(P_KEYS);
  readonly w = TABLE(W_KEYS);
  /** Per match: `PHASE_KINDS x PHASE_BINS` counts, and `GRID_KINDS` totals. */
  phases = new Col32(4096);
  events = new Col32(4096);
  /** The matches' file references (paths or ids the worker resolves). */
  readonly paths: string[] = [];

  get matches(): number {
    return this.m.game.n;
  }

  add(path: string, h: SummaryHead): number {
    const d = this.dict;
    const i = this.matches;
    const started = h.started ? Date.parse(h.started) / 1000 : NaN;
    // The currency the match counts its earnings in: its first earning column's, and the columns in it.
    const cols = h.economy?.columns ?? [];
    const cur = cols.find((c) => c.flow === 'earn')?.currency ?? cols[0]?.currency ?? null;
    const earnIdx = cols.flatMap((c, j) => (c.currency === cur && c.flow === 'earn' ? [j] : []));
    const costIdx = cols.flatMap((c, j) => (c.currency === cur && c.flow === 'cost' ? [j] : []));
    const sum = (val: number[] | undefined, idx: number[]) => idx.reduce((s, j) => s + (val?.[j] ?? 0), 0);
    const M = this.m;
    M.game.push(d.id(h.game ?? ''));
    M.map.push(d.id(h.map ?? ''));
    M.mode.push(d.id(h.mode ?? ''));
    M.mission.push(d.id(h.mission ?? ''));
    M.started.push(started);
    M.duration.push(h.duration);
    M.rows.push(h.rows);
    M.units.push(h.units);
    M.players.push(h.players);
    M.ai.push(h.ai);
    M.winner.push(h.winner === null ? -1 : d.id(h.winner));
    M.team0.push(this.t.match.n);
    M.teams.push(h.teams.length);
    M.veh0.push(this.v.match.n);
    M.vehs.push(h.vehicles.length);
    M.pl0.push(this.p.match.n);
    M.pls.push(h.playerStats.length);
    M.wp0.push(this.w.match.n);
    M.wps.push(h.weapons.length);
    M.cur.push(d.id(cur ?? ''));
    M.source.push(this.paths.length);
    this.paths.push(path);
    const ev = (e: Record<string, number>, ...k: string[]) => k.reduce((s, x) => s + (e[x] ?? 0), 0);
    for (const tm of h.teams) {
      const T = this.t;
      T.match.push(i);
      T.name.push(d.id(tm.name));
      T.units.push(tm.units);
      T.players.push(tm.players);
      T.presence.push(tm.presence);
      T.kills.push(tm.kills);
      T.deaths.push(tm.deaths);
      T.won.push(tm.won ?? NaN);
      T.earn.push(sum(tm.val, earnIdx));
      T.spent.push(sum(tm.val, costIdx));
    }
    for (const v of h.vehicles) {
      const V = this.v;
      V.match.push(i);
      V.key.push(d.id(v.key));
      V.label.push(d.id(v.label));
      V.cls.push(d.id(v.cls));
      V.team.push(v.team);
      V.tier.push(d.id(v.tier));
      V.units.push(v.units);
      V.players.push(v.players);
      V.presence.push(v.presence);
      V.kills.push(ev(v.ev, 'kill'));
      V.deaths.push(ev(v.ev, 'death', 'destroyed', 'crash'));
      V.hits.push(ev(v.ev, 'hit'));
      V.launches.push(ev(v.ev, 'launch'));
      V.fires.push(ev(v.ev, 'fire'));
      V.damage.push(ev(v.ev, 'damage'));
      V.winSum.push(v.winSum);
      V.winN.push(v.winN);
      V.earn.push(sum(v.val, earnIdx));
      V.spent.push(sum(v.val, costIdx));
    }
    for (const p of h.playerStats) {
      const P = this.p;
      P.match.push(i);
      P.id.push(d.id(p.id));
      P.name.push(d.id(p.name));
      P.team.push(p.team);
      P.units.push(p.units);
      P.presence.push(p.presence);
      P.kills.push(p.kills);
      P.deaths.push(p.deaths);
      P.hits.push(p.hits);
      P.launches.push(p.launches);
      P.won.push(p.won ?? NaN);
      P.veh.push(d.id(p.vehicles[0] ?? ''));
    }
    for (const w of h.weapons) {
      const W = this.w;
      W.match.push(i);
      W.name.push(d.id(w.name));
      W.kills.push(w.ev.kill ?? 0);
      W.hits.push(w.ev.hit ?? 0);
      W.launches.push(w.ev.launch ?? 0);
      W.fires.push(w.ev.fire ?? 0);
      W.misses.push(w.ev.miss ?? 0);
    }
    for (const k of PHASE_KINDS) {
      const a = h.phases?.kinds?.[k];
      for (let b = 0; b < PHASE_BINS; b++) this.phases.push(a ? (a[Math.floor((b * a.length) / PHASE_BINS)] ?? 0) : 0);
    }
    for (const k of GRID_KINDS) this.events.push(h.events?.[k] ?? 0);
    return i;
  }

  str(i: number): string {
    return this.dict.of(i);
  }

  /** The matches the filter keeps, 1 each. */
  matchMask(f: MassFilter): Uint8Array {
    const n = this.matches;
    const out = new Uint8Array(n);
    const set = (l?: string[]) => (l && l.length ? new Set(l.map((s) => this.dict.id(s))) : null);
    const games = set(f.games);
    const maps = set(f.maps);
    const modes = set(f.modes);
    const from = f.from ?? null;
    const to = f.to ?? null;
    for (let i = 0; i < n; i++) {
      if (games && !games.has(this.m.game.get(i))) continue;
      if (maps && !maps.has(this.m.map.get(i))) continue;
      if (modes && !modes.has(this.m.mode.get(i))) continue;
      const s = this.m.started.get(i) * 1000;
      if (from !== null && !(s >= from)) continue;
      if (to !== null && !(s <= to)) continue;
      out[i] = 1;
    }
    return out;
  }
}

// ---------------------------------------------------------------------------
// Overview

export interface Count {
  key: string;
  matches: number;
  hours: number;
}

export interface Overview {
  matches: number;
  hours: number;
  rows: number;
  units: number;
  /** Distinct players (by id) and player lives. */
  players: number;
  ai: number;
  byGame: Count[];
  byMap: (Count & { game: string })[];
  byMode: Count[];
  /** Matches a day (UTC), oldest first. */
  byDay: { day: string; matches: number }[];
  undated: number;
  events: Record<string, number>;
  /** Earned and spent by currency. */
  economy: { currency: string; earned: number; spent: number; matches: number }[];
  first: number | null;
  last: number | null;
}

function countBy(s: MassStore, mask: Uint8Array, col: Col, extra?: (i: number) => Record<string, string>): (Count & Record<string, unknown>)[] {
  const by = new Map<number, Count & Record<string, unknown>>();
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    const k = col.get(i);
    let c = by.get(k);
    if (!c) by.set(k, (c = { key: s.str(k), matches: 0, hours: 0, ...(extra ? extra(i) : {}) }));
    c.matches++;
    c.hours += s.m.duration.get(i) / 3600;
  }
  return [...by.values()].sort((a, b) => b.matches - a.matches);
}

export function overview(s: MassStore, mask: Uint8Array): Overview {
  let matches = 0, hours = 0, rows = 0, units = 0, ai = 0, undated = 0;
  let first = Infinity, last = -Infinity;
  const days = new Map<string, number>();
  const events: Record<string, number> = {};
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    matches++;
    hours += s.m.duration.get(i) / 3600;
    rows += s.m.rows.get(i);
    units += s.m.units.get(i);
    ai += s.m.ai.get(i);
    const st = s.m.started.get(i);
    if (Number.isFinite(st)) {
      first = Math.min(first, st);
      last = Math.max(last, st);
      const d = new Date(st * 1000).toISOString().slice(0, 10);
      days.set(d, (days.get(d) ?? 0) + 1);
    } else undated++;
    for (let k = 0; k < GK; k++) {
      const v = s.events.a[i * GK + k];
      if (v) events[GRID_KINDS[k]] = (events[GRID_KINDS[k]] ?? 0) + v;
    }
  }
  const ids = new Set<number>();
  for (let r = 0; r < s.p.match.n; r++) if (mask[s.p.match.a[r]]) ids.add(s.p.id.a[r]);
  const econ = new Map<number, { earned: number; spent: number; matches: Set<number> }>();
  for (let r = 0; r < s.t.match.n; r++) {
    const m = s.t.match.a[r];
    if (!mask[m]) continue;
    const c = s.m.cur.get(m);
    if (!s.str(c)) continue;
    let e = econ.get(c);
    if (!e) econ.set(c, (e = { earned: 0, spent: 0, matches: new Set() }));
    e.earned += s.t.earn.a[r];
    e.spent += s.t.spent.a[r];
    e.matches.add(m);
  }
  return {
    matches,
    hours,
    rows,
    units,
    players: ids.size,
    ai,
    byGame: countBy(s, mask, s.m.game),
    byMap: countBy(s, mask, s.m.map, (i) => ({ game: s.str(s.m.game.get(i)) })) as unknown as (Count & { game: string })[],
    byMode: countBy(s, mask, s.m.mode),
    byDay: [...days].sort((a, b) => a[0].localeCompare(b[0])).map(([day, n]) => ({ day, matches: n })),
    undated,
    events,
    economy: [...econ].map(([c, e]) => ({ currency: s.str(c), earned: e.earned, spent: e.spent, matches: e.matches.size })),
    first: Number.isFinite(first) ? first : null,
    last: Number.isFinite(last) ? last : null,
  };
}

// ---------------------------------------------------------------------------
// Balance: vehicles, classes, weapons

export type BalanceBy = 'vehicle' | 'class' | 'weapon' | 'team';
export type BalanceSplit = 'none' | 'map' | 'mode' | 'tier' | 'game';

export interface BalanceRow {
  key: string;
  label: string;
  cls: string;
  split: string;
  matches: number;
  units: number;
  players: number;
  /** Hours of presence. */
  hours: number;
  kills: number;
  deaths: number;
  hits: number;
  launches: number;
  /** Kills per death and its ~95% interval (Katz log). */
  kd: number;
  kdLo: number;
  kdHi: number;
  /** Win rate (units' won fractions), its Wilson interval and how many units it rests on. */
  win: number | null;
  winLo: number | null;
  winHi: number | null;
  winN: number;
  /** Lives that did not end in a death. */
  survival: number | null;
  /** Per minute of presence. */
  killsPerMin: number;
  hitsPerMin: number;
  earnPerMin: number;
  spentPerMin: number;
  /** Against the rest of its split: the K/D odds ratio, the win difference, and the tests' p and BH q. */
  kdRatio: number;
  winDiff: number | null;
  p: number;
  q: number;
}

interface Acc {
  key: string;
  label: string;
  cls: string;
  split: string;
  matches: Set<number>;
  units: number;
  players: number;
  presence: number;
  kills: number;
  deaths: number;
  hits: number;
  launches: number;
  winSum: number;
  winN: number;
  earn: number;
  spent: number;
}

const newAcc = (key: string, label: string, cls: string, split: string): Acc => ({ key, label, cls, split, matches: new Set(), units: 0, players: 0, presence: 0, kills: 0, deaths: 0, hits: 0, launches: 0, winSum: 0, winN: 0, earn: 0, spent: 0 });

/** Katz interval of a ratio of two counts (0.5 added to each). */
export function ratioInterval(a: number, b: number): [number, number, number] {
  const x = a + 0.5;
  const y = b + 0.5;
  const est = Math.log(x / y);
  const se = Math.sqrt(1 / x + 1 / y);
  return [a / Math.max(b, 1), Math.exp(est - 1.96 * se), Math.exp(est + 1.96 * se)];
}

export function balance(s: MassStore, mask: Uint8Array, by: BalanceBy, split: BalanceSplit, opts: { minUnits?: number; classes?: string[]; players?: boolean } = {}): BalanceRow[] {
  const accs = new Map<string, Acc>();
  const splitOf = (m: number, tier: number) =>
    split === 'map' ? s.str(s.m.map.get(m)) : split === 'mode' ? s.str(s.m.mode.get(m)) : split === 'game' ? s.str(s.m.game.get(m)) : split === 'tier' ? s.str(tier) : '';
  const classes = opts.classes?.length ? new Set(opts.classes) : null;
  if (by === 'weapon') {
    const W = s.w;
    for (let r = 0; r < W.match.n; r++) {
      const m = W.match.a[r];
      if (!mask[m]) continue;
      const name = s.str(W.name.a[r]);
      const sp = splitOf(m, -1);
      const id = `${name}\u0001${sp}`;
      let a = accs.get(id);
      if (!a) accs.set(id, (a = newAcc(name, name, '', sp)));
      a.matches.add(m);
      a.kills += W.kills.a[r];
      a.hits += W.hits.a[r];
      a.launches += W.launches.a[r] + W.fires.a[r];
      a.units += W.launches.a[r] + W.fires.a[r];
      a.deaths += W.misses.a[r];
    }
  } else {
    const V = s.v;
    for (let r = 0; r < V.match.n; r++) {
      const m = V.match.a[r];
      if (!mask[m]) continue;
      const cls = s.str(V.cls.a[r]);
      if (NOT_DRIVEN.has(cls) || (classes && !classes.has(cls))) continue;
      // Players only: what the mission's AI drove is left out.
      if (opts.players && V.players.a[r] === 0) continue;
      const team = V.team.a[r];
      const t0 = s.m.team0.get(m);
      const teamName = team < s.m.teams.get(m) ? s.str(s.t.name.a[t0 + team]) : '';
      const key = by === 'vehicle' ? s.str(V.key.a[r]) : by === 'class' ? cls : teamName;
      if (by === 'team' && !key) continue;
      const sp = splitOf(m, V.tier.a[r]);
      const id = `${key}\u0001${sp}`;
      let a = accs.get(id);
      if (!a) accs.set(id, (a = newAcc(key, by === 'vehicle' ? s.str(V.label.a[r]) || key : key, by === 'vehicle' ? cls : by === 'class' ? cls : '', sp)));
      a.matches.add(m);
      a.units += V.units.a[r];
      a.players += V.players.a[r];
      a.presence += V.presence.a[r];
      a.kills += V.kills.a[r];
      a.deaths += V.deaths.a[r];
      a.hits += V.hits.a[r];
      a.launches += V.launches.a[r];
      a.winSum += V.winSum.a[r];
      a.winN += V.winN.a[r];
      a.earn += V.earn.a[r];
      a.spent += V.spent.a[r];
    }
  }
  // Each against the rest of its split.
  const totals = new Map<string, Acc>();
  for (const a of accs.values()) {
    let t = totals.get(a.split);
    if (!t) totals.set(a.split, (t = newAcc('', '', '', a.split)));
    t.kills += a.kills;
    t.deaths += a.deaths;
    t.winSum += a.winSum;
    t.winN += a.winN;
  }
  const minUnits = opts.minUnits ?? 1;
  const rows: BalanceRow[] = [];
  const ps: number[] = [];
  for (const a of accs.values()) {
    if (a.units < minUnits) continue;
    const t = totals.get(a.split)!;
    const [kd, kdLo, kdHi] = ratioInterval(a.kills, a.deaths);
    const restK = t.kills - a.kills;
    const restD = t.deaths - a.deaths;
    const kdRatio = (a.kills + 0.5) / (a.deaths + 0.5) / ((restK + 0.5) / (restD + 0.5));
    // K/D: the group's share of kills among its kills and deaths, against the rest's.
    const n = a.kills + a.deaths;
    const p0 = (restK + 0.5) / (restK + restD + 1);
    let p = n > 0 && restK + restD > 0 ? binomTwoSided(a.kills, n, p0) : 1;
    let win: number | null = null, winLo: number | null = null, winHi: number | null = null, winDiff: number | null = null;
    if (a.winN > 0) {
      win = a.winSum / a.winN;
      [winLo, winHi] = wilson(Math.round(a.winSum), a.winN);
      const rn = t.winN - a.winN;
      if (rn > 0) {
        const rw = (t.winSum - a.winSum) / rn;
        winDiff = win - rw;
        p = Math.min(p, binomTwoSided(Math.round(a.winSum), a.winN, Math.min(0.999, Math.max(0.001, rw))));
      }
    }
    const mins = a.presence / 60;
    rows.push({
      key: a.key,
      label: a.label,
      cls: a.cls,
      split: a.split,
      matches: a.matches.size,
      units: a.units,
      players: a.players,
      hours: a.presence / 3600,
      kills: a.kills,
      deaths: a.deaths,
      hits: a.hits,
      launches: a.launches,
      kd,
      kdLo,
      kdHi,
      win,
      winLo,
      winHi,
      winN: a.winN,
      survival: a.units > 0 && by !== 'weapon' ? Math.max(0, 1 - a.deaths / a.units) : null,
      killsPerMin: mins > 0 ? a.kills / mins : 0,
      hitsPerMin: mins > 0 ? a.hits / mins : 0,
      earnPerMin: mins > 0 ? a.earn / mins : 0,
      spentPerMin: mins > 0 ? a.spent / mins : 0,
      kdRatio,
      winDiff,
      p,
      q: 1,
    });
    ps.push(p);
  }
  // Two tests a row (K/D and win), the smaller p taken: Bonferroni over the two, then BH over the rows.
  const q = bhAdjust(ps.map((p) => Math.min(1, p * 2)));
  rows.forEach((r, i) => (r.q = q[i]));
  return rows.sort((a, b) => b.hours - a.hours || b.units - a.units);
}

// ---------------------------------------------------------------------------
// Trends over dates

export type Bucket = 'day' | 'week' | 'month';

export function bucketOf(sec: number, b: Bucket): string {
  const d = new Date(sec * 1000);
  if (b === 'month') return d.toISOString().slice(0, 7);
  if (b === 'week') {
    const day = (d.getUTCDay() + 6) % 7;
    const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day));
    return monday.toISOString().slice(0, 10);
  }
  return d.toISOString().slice(0, 10);
}

export interface TrendSeries {
  key: string;
  label: string;
  /** Per bucket: share of the bucket's presence (usage), kills per death, win rate. */
  usage: number[];
  kd: number[];
  win: (number | null)[];
  units: number[];
}

export interface Trends {
  buckets: string[];
  matches: number[];
  series: TrendSeries[];
}

export function trends(s: MassStore, mask: Uint8Array, by: 'vehicle' | 'class', bucket: Bucket, top = 8): Trends {
  const bOf = new Int32Array(s.matches).fill(-1);
  const names = new Map<string, number>();
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    const st = s.m.started.get(i);
    if (!Number.isFinite(st)) continue;
    const b = bucketOf(st, bucket);
    if (!names.has(b)) names.set(b, names.size);
    bOf[i] = names.get(b)!;
  }
  const order = [...names.keys()].sort();
  const remap = new Int32Array(names.size);
  order.forEach((b, i) => (remap[names.get(b)!] = i));
  const B = order.length;
  const matches = new Array(B).fill(0);
  for (let i = 0; i < bOf.length; i++) if (bOf[i] >= 0) matches[remap[bOf[i]]]++;
  const total = new Float64Array(B);
  const groups = new Map<string, { label: string; pres: Float64Array; k: Float64Array; d: Float64Array; ws: Float64Array; wn: Float64Array; u: Float64Array; all: number }>();
  const V = s.v;
  for (let r = 0; r < V.match.n; r++) {
    const m = V.match.a[r];
    if (!mask[m] || bOf[m] < 0) continue;
    const cls = s.str(V.cls.a[r]);
    if (NOT_DRIVEN.has(cls)) continue;
    const b = remap[bOf[m]];
    const key = by === 'vehicle' ? s.str(V.key.a[r]) : cls;
    let g = groups.get(key);
    if (!g) groups.set(key, (g = { label: by === 'vehicle' ? s.str(V.label.a[r]) || key : key, pres: new Float64Array(B), k: new Float64Array(B), d: new Float64Array(B), ws: new Float64Array(B), wn: new Float64Array(B), u: new Float64Array(B), all: 0 }));
    g.pres[b] += V.presence.a[r];
    g.k[b] += V.kills.a[r];
    g.d[b] += V.deaths.a[r];
    g.ws[b] += V.winSum.a[r];
    g.wn[b] += V.winN.a[r];
    g.u[b] += V.units.a[r];
    g.all += V.presence.a[r];
    total[b] += V.presence.a[r];
  }
  const series = [...groups]
    .sort((a, b) => b[1].all - a[1].all)
    .slice(0, top)
    .map(([key, g]) => ({
      key,
      label: g.label,
      usage: Array.from(g.pres, (v, b) => (total[b] > 0 ? v / total[b] : 0)),
      kd: Array.from(g.k, (k, b) => (k + g.d[b] > 0 ? k / Math.max(1, g.d[b]) : NaN)),
      win: Array.from(g.wn, (n, b) => (n > 0 ? g.ws[b] / n : null)),
      units: Array.from(g.u),
    }));
  return { buckets: order, matches, series };
}

// ---------------------------------------------------------------------------
// Players, sides, phases

export interface Populations {
  players: number;
  /** Matches a player played: histogram over 1, 2, 3-4, 5-9, 10-19, 20+. */
  matchesHist: number[];
  top: { id: string; name: string; matches: number; kills: number; deaths: number; hours: number; win: number | null; vehicle: string }[];
  /** Players a match: median and quartiles. */
  perMatch: [number, number, number];
}

export const MATCH_HIST = [1, 2, 3, 5, 10, 20];

export function populations(s: MassStore, mask: Uint8Array, top = 50): Populations {
  const P = s.p;
  const by = new Map<number, { name: number; matches: Set<number>; k: number; d: number; pres: number; ws: number; wn: number; veh: Map<number, number> }>();
  for (let r = 0; r < P.match.n; r++) {
    const m = P.match.a[r];
    if (!mask[m]) continue;
    const id = P.id.a[r];
    let p = by.get(id);
    if (!p) by.set(id, (p = { name: P.name.a[r], matches: new Set(), k: 0, d: 0, pres: 0, ws: 0, wn: 0, veh: new Map() }));
    p.matches.add(m);
    p.k += P.kills.a[r];
    p.d += P.deaths.a[r];
    p.pres += P.presence.a[r];
    const w = P.won.a[r];
    if (Number.isFinite(w)) {
      p.ws += w;
      p.wn++;
    }
    const v = P.veh.a[r];
    p.veh.set(v, (p.veh.get(v) ?? 0) + 1);
  }
  const hist = new Array(MATCH_HIST.length).fill(0);
  for (const p of by.values()) {
    const n = p.matches.size;
    let b = MATCH_HIST.length - 1;
    while (b > 0 && n < MATCH_HIST[b]) b--;
    hist[b]++;
  }
  const per: number[] = [];
  for (let i = 0; i < mask.length; i++) if (mask[i]) per.push(s.m.players.get(i));
  per.sort((a, b) => a - b);
  const q = (f: number) => (per.length ? per[Math.min(per.length - 1, Math.floor(f * per.length))] : 0);
  return {
    players: by.size,
    matchesHist: hist,
    top: [...by]
      .sort((a, b) => b[1].matches.size - a[1].matches.size || b[1].pres - a[1].pres)
      .slice(0, top)
      .map(([id, p]) => ({
        id: s.str(id),
        name: s.str(p.name),
        matches: p.matches.size,
        kills: p.k,
        deaths: p.d,
        hours: p.pres / 3600,
        win: p.wn ? p.ws / p.wn : null,
        vehicle: s.str([...p.veh].sort((a, b) => b[1] - a[1])[0]?.[0] ?? -1),
      })),
    perMatch: [q(0.25), q(0.5), q(0.75)],
  };
}

export interface SideRow {
  map: string;
  team: string;
  matches: number;
  /** Matches it won of those with a winner, and its share. */
  wins: number;
  decided: number;
  kills: number;
  deaths: number;
  /** Its win rate (from the rows' won flags where there is no winner). */
  win: number | null;
  winLo: number | null;
  winHi: number | null;
  p: number;
  q: number;
}

/** Each map's sides: wins and kills by team name, against an even split. */
export function sides(s: MassStore, mask: Uint8Array): SideRow[] {
  const by = new Map<string, SideRow & { ws: number; wn: number; teams: Set<string> }>();
  const teamsOfMap = new Map<string, Set<string>>();
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    const map = s.str(s.m.map.get(i));
    const t0 = s.m.team0.get(i);
    const nt = s.m.teams.get(i);
    const winner = s.m.winner.get(i);
    for (let k = 0; k < nt; k++) {
      const r = t0 + k;
      if (s.t.units.a[r] === 0 || s.t.players.a[r] === 0) continue;
      const team = s.str(s.t.name.a[r]);
      const id = `${map}\u0001${team}`;
      let row = by.get(id);
      if (!row) by.set(id, (row = { map, team, matches: 0, wins: 0, decided: 0, kills: 0, deaths: 0, win: null, winLo: null, winHi: null, p: 1, q: 1, ws: 0, wn: 0, teams: new Set() }));
      if (!teamsOfMap.has(map)) teamsOfMap.set(map, new Set());
      teamsOfMap.get(map)!.add(team);
      row.matches++;
      row.kills += s.t.kills.a[r];
      row.deaths += s.t.deaths.a[r];
      if (winner >= 0) {
        row.decided++;
        if (s.t.name.a[r] === winner) row.wins++;
      } else if (Number.isFinite(s.t.won.a[r])) {
        row.ws += s.t.won.a[r];
        row.wn++;
      }
    }
  }
  const rows = [...by.values()];
  const ps: number[] = [];
  for (const r of rows) {
    const sidesN = Math.max(2, teamsOfMap.get(r.map)!.size);
    const k = r.decided ? r.wins : Math.round(r.ws);
    const n = r.decided ? r.decided : r.wn;
    if (n > 0) {
      r.win = k / n;
      [r.winLo, r.winHi] = wilson(k, n);
      r.p = binomTwoSided(k, n, 1 / sidesN);
    } else if (r.kills + r.deaths > 0) r.p = binomTwoSided(r.kills, r.kills + r.deaths, 0.5);
    ps.push(r.p);
  }
  const q = bhAdjust(ps);
  rows.forEach((r, i) => (r.q = q[i]));
  return rows.map(({ ws: _ws, wn: _wn, teams: _t, ...r }) => r).sort((a, b) => a.map.localeCompare(b.map) || b.matches - a.matches);
}

/** The phase histograms summed: per kind, `PHASE_BINS` counts over the matches' lengths. */
export function phases(s: MassStore, mask: Uint8Array): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  for (let k = 0; k < PK; k++) out[PHASE_KINDS[k]] = new Array(PHASE_BINS).fill(0);
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    for (let k = 0; k < PK; k++) {
      const o = (i * PK + k) * PHASE_BINS;
      for (let b = 0; b < PHASE_BINS; b++) out[PHASE_KINDS[k]][b] += s.phases.a[o + b];
    }
  }
  return out;
}

/** The matches a drill-down asks for (filter, then the rows that name the vehicle, class, team, player or weapon). */
export function drillMatches(s: MassStore, mask: Uint8Array, d: MassDrill): number[] {
  if (d.match !== undefined) return mask[d.match] ? [d.match] : [];
  if (d.matches) return d.matches.filter((m) => mask[m]);
  const keep = new Uint8Array(mask.length);
  let any = false;
  const id = (x?: string) => (x === undefined ? -2 : s.dict.id(x));
  if (d.vehicle !== undefined || d.cls !== undefined || d.team !== undefined) {
    any = true;
    const vk = id(d.vehicle);
    const ck = id(d.cls);
    const tk = id(d.team);
    for (let r = 0; r < s.v.match.n; r++) {
      const m = s.v.match.a[r];
      if (!mask[m]) continue;
      if (vk !== -2 && s.v.key.a[r] !== vk) continue;
      if (ck !== -2 && s.v.cls.a[r] !== ck) continue;
      if (tk !== -2) {
        const t = s.v.team.a[r];
        if (t >= s.m.teams.get(m) || s.t.name.a[s.m.team0.get(m) + t] !== tk) continue;
      }
      keep[m] = 1;
    }
  }
  if (d.player !== undefined) {
    any = true;
    const pk = id(d.player);
    for (let r = 0; r < s.p.match.n; r++) if (mask[s.p.match.a[r]] && s.p.id.a[r] === pk) keep[s.p.match.a[r]] = 1;
  }
  if (d.weapon !== undefined) {
    any = true;
    const wk = id(d.weapon);
    for (let r = 0; r < s.w.match.n; r++) if (mask[s.w.match.a[r]] && s.w.name.a[r] === wk) keep[s.w.match.a[r]] = 1;
  }
  const out: number[] = [];
  for (let i = 0; i < mask.length; i++) if (any ? keep[i] : mask[i]) out.push(i);
  return out;
}

/** Bytes the store's tables take, roughly. */
export function storeBytes(s: MassStore): number {
  let b = 0;
  for (const c of Object.values(s.m)) b += c.a.byteLength;
  for (const tb of [s.t, s.v, s.p, s.w]) for (const c of Object.values(tb)) b += c.a.byteLength;
  b += s.phases.a.byteLength + s.events.a.byteLength;
  for (const x of s.dict.list) b += 40 + x.length * 2;
  return b;
}
