/**
 * What the person-hit panel asks of the hits (docs/person-hits.md): the
 * filter, each body region's numbers (hits, share, damage, kill rate, armour
 * absorbed), the charts (damage over distance a weapon, headshot rate over
 * distance, what each armour kept off, hits over distance), the top lists,
 * where every value came from, and the hits as rows for the dashboards.
 * Pure functions over a `PersonStore`; run in the analysis worker.
 */

import { wilson } from '../dashboards/ci';
import type { ChartData, ChartEntity } from '../charts/types';
import type { PersonStore } from './store';
import { GAMES, HITGROUPS, REGIONS, SOURCE_FIELDS, SOURCES, ZONES, regionOfGroup, sideOfAngle, zoneOfGroup, type SourceField, type TextColumn } from './types';

export type Range = [number, number];

export interface PersonFilter {
  games?: string[] | null;
  maps?: string[] | null;
  weapons?: string[] | null;
  weaponClasses?: string[] | null;
  ammoTypes?: string[] | null;
  ammos?: string[] | null;
  armors?: string[] | null;
  /** Body regions or zones (`head`, `chest`... or `body`, `legs`). */
  regions?: string[] | null;
  victims?: string[] | null;
  shooters?: string[] | null;
  sides?: string[] | null;
  roles?: string[] | null;
  victimStates?: string[] | null;
  shooterStates?: string[] | null;
  distance?: Range | null;
  angle?: Range | null;
  calibre?: Range | null;
  /** From where against the victim's facing: front, side, back. */
  from?: ('front' | 'side' | 'back')[] | null;
  penetrated?: 'yes' | 'no' | null;
  kill?: 'yes' | 'no' | null;
  won?: 'won' | 'lost' | null;
  helmet?: 'yes' | 'no' | null;
  /** Hits on one's own side too (left out unless asked). */
  teamHits?: boolean;
}

export type RegionMetric = 'share' | 'damage' | 'killRate' | 'absorbed';
export const REGION_METRICS: readonly RegionMetric[] = ['share', 'damage', 'killRate', 'absorbed'];

/** One region's (or zone's) numbers. */
export interface RegionStat {
  name: string;
  hits: number;
  share: number;
  shareLo: number;
  shareHi: number;
  /** Mean health taken a hit, of hits with a known damage. */
  damage: number;
  damageN: number;
  kills: number;
  killN: number;
  killRate: number;
  killLo: number;
  killHi: number;
  absorbed: number;
  absorbedN: number;
}

const inSet = (list: string[] | null | undefined, v: string) => !list || !list.length || list.includes(v);
const inRange = (r: Range | null | undefined, v: number) => !r || (Number.isFinite(v) && v >= r[0] && v <= r[1]);

/** A test of one hit against the filter. */
export function compileFilter(s: PersonStore, f: PersonFilter): (i: number) => boolean {
  const c = s.cols;
  const txt = (col: TextColumn, list: string[] | null | undefined) => {
    if (!list || !list.length) return null;
    const want = new Set<number>();
    for (const v of list) {
      const code = s.dicts[col].list.indexOf(v);
      if (code >= 0) want.add(code);
    }
    const ids = c.txt[col];
    return (i: number) => want.has(ids[i]);
  };
  const tests: ((i: number) => boolean)[] = [];
  for (const [col, list] of [
    ['weapon', f.weapons],
    ['weaponClass', f.weaponClasses],
    ['ammoType', f.ammoTypes],
    ['ammo', f.ammos],
    ['armor', f.armors],
    ['victim', f.victims],
    ['shooter', f.shooters],
    ['victimSide', f.sides],
    ['victimRole', f.roles],
    ['victimState', f.victimStates],
    ['shooterState', f.shooterStates],
  ] as const) {
    const t = txt(col, list);
    if (t) tests.push(t);
  }
  if (f.games?.length) tests.push((i) => f.games!.includes(GAMES[c.int.game[i]]));
  if (f.maps?.length) tests.push((i) => inSet(f.maps, s.mapOf(i)));
  if (f.regions?.length) {
    const want = new Set(f.regions);
    tests.push((i) => {
      const g = c.int.hitgroup[i];
      const r = regionOfGroup(g), z = zoneOfGroup(g);
      return (r >= 0 && want.has(REGIONS[r])) || (z >= 0 && want.has(ZONES[z])) || want.has(HITGROUPS[g]);
    });
  }
  if (f.distance) tests.push((i) => inRange(f.distance, c.num.distance[i]));
  if (f.angle) tests.push((i) => inRange(f.angle, c.num.angle[i]));
  if (f.calibre) tests.push((i) => inRange(f.calibre, c.num.calibre[i]));
  if (f.from?.length) tests.push((i) => (f.from as string[]).includes(sideOfAngle(c.num.angle[i])));
  if (f.penetrated) tests.push((i) => c.int.penetrated[i] === (f.penetrated === 'yes' ? 1 : 0));
  if (f.kill) tests.push((i) => c.int.kill[i] === (f.kill === 'yes' ? 1 : 0));
  if (f.won) tests.push((i) => c.int.won[i] === (f.won === 'won' ? 1 : 0));
  if (f.helmet) tests.push((i) => c.int.helmet[i] === (f.helmet === 'yes' ? 1 : 0));
  if (!f.teamHits) tests.push((i) => c.int.team[i] === 0);
  return (i) => {
    for (const t of tests) if (!t(i)) return false;
    return true;
  };
}

/** The hits passing the filter, as indices. */
export function selected(s: PersonStore, f: PersonFilter): Uint32Array {
  const keep = compileFilter(s, f);
  const out = new Uint32Array(s.n);
  let k = 0;
  for (let i = 0; i < s.n; i++) if (keep(i)) out[k++] = i;
  return out.subarray(0, k);
}

/** The whole hit as health: what it took plus what armour kept off (before the cap where the game says). */
export function wholeDamage(s: PersonStore, i: number): number {
  const c = s.cols.num;
  const base = Number.isFinite(c.damageRaw[i]) ? c.damageRaw[i] : c.damage[i];
  if (!Number.isFinite(base)) return NaN;
  return base + (Number.isFinite(c.absorbed[i]) ? c.absorbed[i] : 0);
}

function stat(name: string): RegionStat {
  return { name, hits: 0, share: 0, shareLo: NaN, shareHi: NaN, damage: 0, damageN: 0, kills: 0, killN: 0, killRate: NaN, killLo: NaN, killHi: NaN, absorbed: 0, absorbedN: 0 };
}

function finish(st: RegionStat, total: number): void {
  st.share = total ? st.hits / total : NaN;
  const w = wilson(st.hits, total);
  if (w) [st.shareLo, st.shareHi] = w;
  st.damage = st.damageN ? st.damage / st.damageN : NaN;
  st.absorbed = st.absorbedN ? st.absorbed / st.absorbedN : NaN;
  st.killRate = st.killN ? st.kills / st.killN : NaN;
  const k = wilson(st.kills, st.killN);
  if (k) [st.killLo, st.killHi] = k;
}

/**
 * Each region's and zone's numbers. Shares are of the hits whose place on the body is known; a coarse hit (VALORANT's
 * body or legs) counts in its zone, not in a region.
 */
export function regionStats(s: PersonStore, rows: ArrayLike<number>): { regions: RegionStat[]; zones: RegionStat[]; placed: number; fine: number; coarse: number } {
  const regions = REGIONS.map(stat), zones = ZONES.map(stat);
  const c = s.cols;
  let fine = 0, coarse = 0;
  const add = (st: RegionStat, i: number) => {
    st.hits++;
    const d = c.num.damage[i];
    if (Number.isFinite(d)) {
      st.damage += d;
      st.damageN++;
    }
    const a = c.num.absorbed[i];
    if (Number.isFinite(a)) {
      st.absorbed += a;
      st.absorbedN++;
    }
    const k = c.int.kill[i];
    if (k >= 0) {
      st.killN++;
      if (k === 1) st.kills++;
    }
  };
  for (let j = 0; j < rows.length; j++) {
    const i = rows[j];
    const g = c.int.hitgroup[i];
    const r = regionOfGroup(g), z = zoneOfGroup(g);
    if (r >= 0) {
      add(regions[r], i);
      fine++;
    } else if (z >= 0) coarse++;
    if (z >= 0) add(zones[z], i);
  }
  for (const st of regions) finish(st, fine);
  for (const st of zones) finish(st, fine + coarse);
  return { regions, zones, placed: fine + coarse, fine, coarse };
}

export function metricOf(st: RegionStat, m: RegionMetric): number {
  return m === 'share' ? st.share : m === 'damage' ? st.damage : m === 'killRate' ? st.killRate : st.absorbed;
}

// ---------------------------------------------------------------------------
// Charts.

const DIST_BINS: Record<string, [number, number]> = { cs2: [60, 2], valorant: [60, 2], r6siege: [40, 2], arma3: [800, 25], squad: [800, 25] };

/** The distance bins for the games in the rows: one game's own range, or the widest. */
export function distanceBins(s: PersonStore, rows: ArrayLike<number>): [number, number] {
  let hi = 0, w = 2;
  const seen = new Set<number>();
  for (let j = 0; j < rows.length && seen.size < GAMES.length; j++) seen.add(s.cols.int.game[rows[j]]);
  for (const g of seen) {
    const b = DIST_BINS[GAMES[g]] ?? [100, 5];
    if (b[0] > hi) [hi, w] = b;
  }
  return hi ? [hi, w] : [60, 2];
}

function binsOf(s: PersonStore, rows: ArrayLike<number>): { hi: number; w: number; n: number } {
  const [hi, w] = distanceBins(s, rows);
  return { hi, w, n: Math.max(1, Math.round(hi / w)) };
}

const groups = (n: number, w: number, column: string): ChartEntity[] => Array.from({ length: n }, (_, k) => ({ key: String(k), label: `${k * w}`, filter: { kind: 'range', column, lo: k * w, hi: (k + 1) * w } }));

/** The most frequent values of a text column over the rows (that pass `keep`). */
function topValues(s: PersonStore, rows: ArrayLike<number>, col: TextColumn, k: number, keep: (i: number) => boolean = () => true): number[] {
  const n = new Map<number, number>();
  const ids = s.cols.txt[col];
  for (let j = 0; j < rows.length; j++) {
    const i = rows[j];
    if (!ids[i] || !keep(i)) continue;
    n.set(ids[i], (n.get(ids[i]) ?? 0) + 1);
  }
  return [...n.entries()].sort((a, b) => b[1] - a[1]).slice(0, k).map(([c]) => c);
}

const bodyish = (s: PersonStore, i: number) => zoneOfGroup(s.cols.int.hitgroup[i]) === 1;

/**
 * Damage over distance, a line a weapon (the five most used): the mean whole hit (health taken plus what armour kept
 * off) of the hits on the body (chest, stomach, arms), so the mix of headshots does not move the line.
 */
export function falloff(s: PersonStore, rows: ArrayLike<number>, minHits = 5): ChartData {
  const { w, n } = binsOf(s, rows);
  const keep = (i: number) => bodyish(s, i) && Number.isFinite(wholeDamage(s, i)) && Number.isFinite(s.cols.num.distance[i]);
  const top = topValues(s, rows, 'weapon', 5, keep);
  const sum = top.map(() => new Float64Array(n)), cnt = top.map(() => new Float64Array(n));
  let used = 0;
  for (let j = 0; j < rows.length; j++) {
    const i = rows[j];
    const k = top.indexOf(s.cols.txt.weapon[i]);
    if (k < 0 || !keep(i)) continue;
    const b = Math.min(n - 1, Math.floor(s.cols.num.distance[i] / w));
    sum[k][b] += wholeDamage(s, i);
    cnt[k][b]++;
    used++;
  }
  return {
    kind: 'line',
    groups: groups(n, w, 'distance'),
    series: top.map((c) => ({ key: s.dicts.weapon.list[c], label: s.dicts.weapon.list[c] })),
    values: top.map((_, k) => Array.from(sum[k], (v, b) => (cnt[k][b] >= minHits ? v / cnt[k][b] : NaN))),
    counts: top.map((_, k) => Array.from(cnt[k])),
    format: 'dec',
    valueLabel: '@phits.chart.damagePerHit',
    axis: { lo: 0, hi: n * w, label: '@phits.field.distance' },
    rows: used,
    empty: used ? undefined : '@phits.chart.noDamage',
  };
}

/** The share of hits on the head over distance, a line a weapon class (the four most used), with its Wilson interval. */
export function headshotRate(s: PersonStore, rows: ArrayLike<number>, minHits = 10): ChartData {
  const { w, n } = binsOf(s, rows);
  const keep = (i: number) => s.cols.int.hitgroup[i] !== 0 && Number.isFinite(s.cols.num.distance[i]);
  const top = topValues(s, rows, 'weaponClass', 4, keep);
  const k1 = top.map(() => new Float64Array(n)), n1 = top.map(() => new Float64Array(n));
  let used = 0;
  for (let j = 0; j < rows.length; j++) {
    const i = rows[j];
    const k = top.indexOf(s.cols.txt.weaponClass[i]);
    if (k < 0 || !keep(i)) continue;
    const b = Math.min(n - 1, Math.floor(s.cols.num.distance[i] / w));
    n1[k][b]++;
    if (zoneOfGroup(s.cols.int.hitgroup[i]) === 0) k1[k][b]++;
    used++;
  }
  const ci = { method: 'wilson' as const, level: 0.95, lo: [] as number[][], hi: [] as number[][] };
  const values = top.map((_, k) =>
    Array.from(n1[k], (t, b) => {
      const iv = t >= minHits ? wilson(k1[k][b], t) : null;
      (ci.lo[k] ??= []).push(iv ? iv[0] : NaN);
      (ci.hi[k] ??= []).push(iv ? iv[1] : NaN);
      return t >= minHits ? k1[k][b] / t : NaN;
    }),
  );
  return {
    kind: 'line',
    groups: groups(n, w, 'distance'),
    series: top.map((c) => ({ key: s.dicts.weaponClass.list[c], label: s.dicts.weaponClass.list[c] })),
    values,
    counts: top.map((_, k) => Array.from(n1[k])),
    ci,
    format: 'pct',
    valueLabel: '@phits.chart.headshotRate',
    axis: { lo: 0, hi: n * w, label: '@phits.field.distance' },
    rows: used,
    empty: used ? undefined : '@phits.chart.noPlace',
  };
}

/** What each armour worn kept off and let through, per hit: two bars an armour, in health points. */
export function armourEffect(s: PersonStore, rows: ArrayLike<number>): ChartData {
  const keep = (i: number) => Number.isFinite(s.cols.num.damage[i]) && s.cols.txt.armor[i] !== 0;
  const top = topValues(s, rows, 'armor', 8, keep);
  const took = new Float64Array(top.length), kept = new Float64Array(top.length), n = new Float64Array(top.length);
  let used = 0;
  for (let j = 0; j < rows.length; j++) {
    const i = rows[j];
    const k = top.indexOf(s.cols.txt.armor[i]);
    if (k < 0 || !keep(i)) continue;
    took[k] += s.cols.num.damage[i];
    kept[k] += Number.isFinite(s.cols.num.absorbed[i]) ? s.cols.num.absorbed[i] : 0;
    n[k]++;
    used++;
  }
  return {
    kind: 'bar',
    groups: top.map((c) => ({ key: s.dicts.armor.list[c], label: s.dicts.armor.list[c], filter: { kind: 'category', column: 'armor', index: c } })),
    series: [
      { key: 'took', label: '@phits.chart.healthTaken' },
      { key: 'kept', label: '@phits.chart.armourKept' },
    ],
    values: [Array.from(took, (v, k) => (n[k] ? v / n[k] : NaN)), Array.from(kept, (v, k) => (n[k] ? v / n[k] : NaN))],
    counts: [Array.from(n), Array.from(n)],
    format: 'dec',
    valueLabel: '@phits.chart.perHit',
    rows: used,
    empty: used ? undefined : '@phits.chart.noArmour',
  };
}

/** Hits over distance, stacked: killed, did not, not known. */
export function distanceHistogram(s: PersonStore, rows: ArrayLike<number>): ChartData {
  const { w, n } = binsOf(s, rows);
  const res = [new Array<number>(n).fill(0), new Array<number>(n).fill(0), new Array<number>(n).fill(0)];
  let used = 0;
  for (let j = 0; j < rows.length; j++) {
    const i = rows[j];
    const d = s.cols.num.distance[i];
    if (!Number.isFinite(d)) continue;
    const b = Math.min(n - 1, Math.floor(d / w));
    const k = s.cols.int.kill[i];
    res[k === 1 ? 0 : k === 0 ? 1 : 2][b]++;
    used++;
  }
  const keepSeries = res.map((r) => r.some((x) => x > 0));
  return {
    kind: 'stacked',
    groups: groups(n, w, 'distance'),
    series: [
      { key: 'kill', label: '@phits.result.kill' },
      { key: 'hit', label: '@phits.result.hit' },
      { key: 'unknown', label: '@phits.result.unknown' },
    ].filter((_, k) => keepSeries[k]),
    values: res.filter((_, k) => keepSeries[k]),
    format: 'int',
    valueLabel: '@phits.chart.hits',
    axis: { lo: 0, hi: n * w, label: '@phits.field.distance' },
    rows: used,
    empty: used ? undefined : '@phits.chart.noDistance',
  };
}

// ---------------------------------------------------------------------------
// Top lists, facets, sources.

export interface TopRow {
  key: string;
  hits: number;
  /** Mean health taken, NaN unknown. */
  damage: number;
  headShare: number;
  killRate: number;
  distance: number;
  wallbangs: number;
}

export type TopField = 'weapon' | 'shooter' | 'victim' | 'armor' | 'victimRole' | 'ammo';

export function topBy(s: PersonStore, rows: ArrayLike<number>, field: TopField, k = 12): TopRow[] {
  const ids = s.cols.txt[field];
  const acc = new Map<number, { hits: number; dmg: number; dn: number; head: number; placed: number; kills: number; kn: number; dist: number[]; wall: number }>();
  const c = s.cols;
  for (let j = 0; j < rows.length; j++) {
    const i = rows[j];
    const id = ids[i];
    if (!id) continue;
    let a = acc.get(id);
    if (!a) acc.set(id, (a = { hits: 0, dmg: 0, dn: 0, head: 0, placed: 0, kills: 0, kn: 0, dist: [], wall: 0 }));
    a.hits++;
    if (Number.isFinite(c.num.damage[i])) {
      a.dmg += c.num.damage[i];
      a.dn++;
    }
    const z = zoneOfGroup(c.int.hitgroup[i]);
    if (z >= 0) {
      a.placed++;
      if (z === 0) a.head++;
    }
    if (c.int.kill[i] >= 0) {
      a.kn++;
      if (c.int.kill[i] === 1) a.kills++;
    }
    if (Number.isFinite(c.num.distance[i]) && a.dist.length < 4000) a.dist.push(c.num.distance[i]);
    if (c.int.penetrated[i] === 1) a.wall++;
  }
  return [...acc.entries()]
    .sort((x, y) => y[1].hits - x[1].hits)
    .slice(0, k)
    .map(([id, a]) => {
      a.dist.sort((p, q) => p - q);
      return {
        key: s.dicts[field].list[id],
        hits: a.hits,
        damage: a.dn ? a.dmg / a.dn : NaN,
        headShare: a.placed ? a.head / a.placed : NaN,
        killRate: a.kn ? a.kills / a.kn : NaN,
        distance: a.dist.length ? a.dist[a.dist.length >> 1] : NaN,
        wallbangs: a.wall,
      };
    });
}

/** The values a filter can pick, most frequent first, with their counts. */
export type Facets = Partial<Record<TextColumn | 'game' | 'map', [string, number][]>>;

export function facetsOf(s: PersonStore): Facets {
  const out: Facets = {};
  for (const col of ['weapon', 'weaponClass', 'ammoType', 'ammo', 'armor', 'victimSide', 'victimRole', 'victimState', 'shooterState', 'shooter', 'victim'] as const) {
    const n = new Uint32Array(s.dicts[col].list.length);
    const ids = s.cols.txt[col];
    for (let i = 0; i < s.n; i++) n[ids[i]]++;
    out[col] = [...n].map((c, k) => [s.dicts[col].list[k], c] as [string, number]).filter(([v, c]) => v && c).sort((a, b) => b[1] - a[1]).slice(0, 400);
  }
  const games = new Map<string, number>(), maps = new Map<string, number>();
  for (let i = 0; i < s.n; i++) {
    const g = s.gameOf(i);
    games.set(g, (games.get(g) ?? 0) + 1);
    const m = s.mapOf(i);
    if (m) maps.set(m, (maps.get(m) ?? 0) + 1);
  }
  out.game = [...games.entries()].sort((a, b) => b[1] - a[1]);
  out.map = [...maps.entries()].sort((a, b) => b[1] - a[1]);
  return out;
}

/** Per game and field: how many hits have the value recorded, derived, estimated or not at all. */
export type Coverage = Record<string, { hits: number; fields: Record<SourceField, [number, number, number, number]> }>;

export function coverageOf(s: PersonStore, rows?: ArrayLike<number>): Coverage {
  const out: Coverage = {};
  const c = s.cols;
  const len = rows ? rows.length : s.n;
  for (let j = 0; j < len; j++) {
    const i = rows ? rows[j] : j;
    const g = s.gameOf(i);
    let e = out[g];
    if (!e) {
      e = out[g] = { hits: 0, fields: {} as Coverage[string]['fields'] };
      for (const f of SOURCE_FIELDS) e.fields[f] = [0, 0, 0, 0];
    }
    e.hits++;
    for (const f of SOURCE_FIELDS) e.fields[f][c.src[f][i]]++;
  }
  return out;
}

export { SOURCES };
