/**
 * What the vehicle-hit analysis asks of the hits: a filter compiled to one
 * test per hit over the store's columns, the hits of a vehicle (a model, the
 * same real vehicle under its other ids, or its whole family), and per plate
 * what struck it and what that did - penetration rate with its Wilson
 * interval, impact speed, angle and the armour along the way, calibres, and
 * the share of penetrations that killed, lit a fire, hit the crew or an
 * ammunition rack. Comparisons split the hits in two (A, B) and give the
 * difference per plate. Pure functions over a `HitStore`; run in the worker.
 */

import type { ChartData, ChartEntity } from '../../charts/types';
import { HitStore, SRC_BALLISTIC, SRC_RECORDED, type PlateHits } from './store';
import { EFFECT_BIT, EFFECTS, FLAG_ATTACKER_AI, FLAG_DIST, FLAG_RESULT_KNOWN, FLAG_VICTIM_AI, FLAG_WON, NONE16, R_UNKNOWN, RESULTS, type Effect, type HitResult } from './types';

export type Range = [number | null, number | null];

/** The filters the panel sets; every one null or empty is no filter. */
export interface HitFilter {
  calibre?: Range;
  ammoTypes?: string[] | null;
  ammoNames?: string[] | null;
  results?: HitResult[] | null;
  speed?: Range;
  angle?: Range;
  descent?: Range;
  distance?: Range;
  effMm?: Range;
  attackers?: string[] | null;
  attackerClasses?: string[] | null;
  attackerNations?: string[] | null;
  victims?: string[] | null;
  maps?: string[] | null;
  modes?: string[] | null;
  br?: Range;
  /** ms since 1970. */
  dates?: Range;
  gameVersions?: string[] | null;
  converterVersions?: string[] | null;
  /** The victim's side won or lost the match. */
  won?: 'won' | 'lost' | null;
  /** Every one of these effects (lethal, fire, a crew role, a component). */
  effects?: Effect[] | null;
  /** None of these. */
  noEffects?: Effect[] | null;
  /** Only hits whose shooter, or whose victim, is one of these players ("my shots", "hits on me"). */
  attackerPlayers?: string[] | null;
  victimPlayers?: string[] | null;
  /** Shooters driven by players or by the mission. */
  shooters?: 'players' | 'ai' | null;
  victimsBy?: 'players' | 'ai' | null;
  victimTeams?: string[] | null;
  /** Plate indices of the model shown (a click on a plate, a chart's bar). */
  plates?: number[] | null;
}

/** How the vehicle's hits are gathered: this model only, the same real vehicle under all its ids, or its family. */
export type Grouping = 'model' | 'vehicle' | 'family';

/** The codes of a dictionary whose strings are in `values`, as a lookup table; null when no restriction. */
function lookup(list: readonly string[], values: readonly string[] | null | undefined): Uint8Array | null {
  if (!values || !values.length) return null;
  const want = new Set(values);
  const t = new Uint8Array(list.length + 1);
  list.forEach((s, i) => (t[i] = want.has(s) ? 1 : 0));
  return t;
}

const lo = (r: Range | undefined) => (r && r[0] !== null && Number.isFinite(r[0]) ? r[0] : null);
const hi = (r: Range | undefined) => (r && r[1] !== null && Number.isFinite(r[1]) ? r[1] : null);
const active = (r: Range | undefined) => lo(r) !== null || hi(r) !== null;

/** Difficulty of a mode ("AB ground" -> ab) for the battle rating. */
export function difficultyOf(mode: string): 'ab' | 'rb' | 'sb' {
  const m = /\b(AB|RB|SB)\b/i.exec(mode);
  return (m ? m[1].toLowerCase() : 'rb') as 'ab' | 'rb' | 'sb';
}

/** Victim codes of a grouping round `vehicle`. */
export function victimsOf(s: HitStore, vehicle: string, by: Grouping): Set<number> {
  const out = new Set<number>();
  const code = s.vehicles.get(vehicle);
  if (code === undefined) return out;
  out.add(code);
  if (by === 'model') return out;
  const me = s.meta[code];
  const want = me ? (by === 'vehicle' ? me.key : me.family) : '';
  if (!want) return out;
  s.meta.forEach((m, i) => {
    if (m && (by === 'vehicle' ? m.key : m.family) === want) out.add(i);
  });
  return out;
}

/**
 * The filter as a test of hit `i`. Values that need a model's plates (angle, armour, plate) are looked up through
 * `plates` (the hit's place among that model's rows, `at`); without them those filters pass nothing that has none.
 */
export function compileFilter(s: HitStore, f: HitFilter, plates: { ph: PlateHits; at: Int32Array } | null = null): (i: number) => boolean {
  const c = s.cols;
  const tests: ((i: number) => boolean)[] = [];
  const range = (r: Range | undefined, get: (i: number) => number) => {
    if (!active(r)) return;
    const a = lo(r) ?? -Infinity, b = hi(r) ?? Infinity;
    tests.push((i) => {
      const v = get(i);
      return v >= a && v <= b;
    });
  };
  range(f.calibre, (i) => (c.calibre[i] ? c.calibre[i] / 10 : NaN));
  range(f.speed, (i) => (s.speedSrc[i] ? s.speed[i] : NaN));
  range(f.descent, (i) => (s.descent[i] !== NONE16 ? s.descent[i] / 100 : NaN));
  range(f.distance, (i) => (c.flags[i] & FLAG_DIST ? c.dist[i] / 4 : NaN));
  if (plates) {
    const { ph, at } = plates;
    range(f.angle, (i) => (at[i] >= 0 ? ph.angle[at[i]] : NaN));
    range(f.effMm, (i) => (at[i] >= 0 ? ph.effMm[at[i]] : NaN));
    if (f.plates && f.plates.length) {
      const want = new Set(f.plates);
      tests.push((i) => at[i] >= 0 && want.has(ph.plate[at[i]]));
    }
  } else if (active(f.angle) || active(f.effMm)) tests.push(() => false);
  const tab = (list: readonly string[], values: readonly string[] | null | undefined, col: ArrayLike<number>) => {
    const t = lookup(list, values);
    if (t) tests.push((i) => t[col[i]] === 1);
  };
  tab(s.ammoTypes.list, f.ammoTypes, c.ammoType);
  tab(s.ammoNames.list, f.ammoNames, c.ammoName);
  tab(s.vehicles.list, f.attackers, c.attacker);
  tab(s.vehicles.list, f.victims, c.victim);
  tab(s.players.list, f.attackerPlayers, c.attackerPlayer);
  tab(s.players.list, f.victimPlayers, c.victimPlayer);
  tab(s.teams.list, f.victimTeams, c.victimTeam);
  if (f.results && f.results.length) {
    const t = new Uint8Array(RESULTS.length);
    for (const r of f.results) t[RESULTS.indexOf(r)] = 1;
    tests.push((i) => t[c.result[i]] === 1);
  }
  const metaTab = (values: readonly string[] | null | undefined, key: 'cls' | 'nation') => {
    if (!values || !values.length) return;
    const want = new Set(values);
    const t = Uint8Array.from(s.vehicles.list, (_, k) => (want.has(s.meta[k]?.[key] ?? '') ? 1 : 0));
    tests.push((i) => t[c.attacker[i]] === 1);
  };
  metaTab(f.attackerClasses, 'cls');
  metaTab(f.attackerNations, 'nation');
  // Match-level filters: a table per match, tested by the hit's match.
  const m = s.matches;
  const mt: ((k: number) => boolean)[] = [];
  const mset = (values: readonly string[] | null | undefined, get: (k: number) => string) => {
    if (values && values.length) {
      const want = new Set(values);
      mt.push((k) => want.has(get(k)));
    }
  };
  mset(f.maps, (k) => m[k].map);
  mset(f.modes, (k) => m[k].mode);
  mset(f.gameVersions, (k) => m[k].gameVersion);
  mset(f.converterVersions, (k) => m[k].converterVersion);
  if (active(f.dates)) {
    const a = lo(f.dates) ?? -Infinity, b = hi(f.dates) ?? Infinity;
    mt.push((k) => m[k].started >= a && m[k].started <= b);
  }
  if (mt.length) {
    const ok = Uint8Array.from(m, (_, k) => (mt.every((t) => t(k)) ? 1 : 0));
    tests.push((i) => ok[c.match[i]] === 1);
  }
  if (active(f.br)) {
    const a = lo(f.br) ?? -Infinity, b = hi(f.br) ?? Infinity;
    const diff = Uint8Array.from(m, (x) => ['ab', 'rb', 'sb'].indexOf(difficultyOf(x.mode)));
    tests.push((i) => {
      const br = s.meta[c.victim[i]]?.br[(['ab', 'rb', 'sb'] as const)[diff[c.match[i]]]];
      return br !== undefined && br >= a && br <= b;
    });
  }
  if (f.won) {
    const want = f.won === 'won' ? FLAG_WON : 0;
    tests.push((i) => (c.flags[i] & FLAG_RESULT_KNOWN) !== 0 && (c.flags[i] & FLAG_WON) === want);
  }
  if (f.shooters) {
    const want = f.shooters === 'ai' ? FLAG_ATTACKER_AI : 0;
    tests.push((i) => (c.flags[i] & FLAG_ATTACKER_AI) === want);
  }
  if (f.victimsBy) {
    const want = f.victimsBy === 'ai' ? FLAG_VICTIM_AI : 0;
    tests.push((i) => (c.flags[i] & FLAG_VICTIM_AI) === want);
  }
  if (f.effects && f.effects.length) {
    const bits = f.effects.reduce((a, e) => a | EFFECT_BIT[e], 0);
    tests.push((i) => (c.effects[i] & bits) === bits);
  }
  if (f.noEffects && f.noEffects.length) {
    const bits = f.noEffects.reduce((a, e) => a | EFFECT_BIT[e], 0);
    tests.push((i) => (c.effects[i] & bits) === 0);
  }
  if (!tests.length) return () => true;
  if (tests.length === 1) return tests[0];
  return (i) => {
    for (let k = 0; k < tests.length; k++) if (!tests[k](i)) return false;
    return true;
  };
}

/** Wilson score interval for k of n at 95 %. */
export function wilson(k: number, n: number, z = 1.96): [number, number] {
  if (n <= 0) return [NaN, NaN];
  const p = k / n, z2 = z * z;
  const den = 1 + z2 / n;
  const mid = (p + z2 / (2 * n)) / den;
  const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / den;
  return [Math.max(0, mid - half), Math.min(1, mid + half)];
}

/** Two shares' difference and its z score (pooled). */
export function twoProportion(k1: number, n1: number, k2: number, n2: number): { diff: number; z: number } {
  if (n1 <= 0 || n2 <= 0) return { diff: NaN, z: NaN };
  const p1 = k1 / n1, p2 = k2 / n2, p = (k1 + k2) / (n1 + n2);
  const se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2));
  return { diff: p1 - p2, z: se > 0 ? (p1 - p2) / se : 0 };
}

/** What struck one plate, and what that did. */
export interface PlateStat {
  hits: number;
  /** Hits whose result is known, and those that went through. */
  known: number;
  through: number;
  rate: number;
  ci: [number, number];
  speedMean: number;
  speedMedian: number;
  /** Share of the speeds that are ballistic estimates (the rest recorded). */
  speedEstimated: number;
  angleMean: number;
  angleMedian: number;
  effMedian: number;
  distMedian: number;
  /** Calibres (mm) most frequent first, with counts. */
  calibres: [number, number][];
  /** Of the penetrations: shares that killed, lit a fire, hurt the crew, hit an ammunition rack, destroyed a module. */
  lethal: number;
  fire: number;
  crew: number;
  ammo: number;
  module: number;
  /** Effects by name over the plate's penetrations: counts. */
  effects: Partial<Record<Effect, number>>;
}

function median(xs: number[]): number {
  if (!xs.length) return NaN;
  xs.sort((a, b) => a - b);
  const m = xs.length >> 1;
  return xs.length % 2 ? xs[m] : (xs[m - 1] + xs[m]) / 2;
}
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);

const CREW_BITS = EFFECT_BIT.crew | EFFECT_BIT.driver | EFFECT_BIT.gunner | EFFECT_BIT.commander | EFFECT_BIT.loader | EFFECT_BIT.machineGunner;

/** Per plate, the statistics of the hits `keep` passes among `ph`'s rows. */
export function plateStats(s: HitStore, ph: PlateHits, plates: number, keep: (i: number) => boolean): PlateStat[] {
  const acc = Array.from({ length: plates }, () => ({ hits: 0, known: 0, through: 0, sp: [] as number[], est: 0, an: [] as number[], eff: [] as number[], di: [] as number[], cal: new Map<number, number>(), fx: new Map<Effect, number>(), lethal: 0, fire: 0, crew: 0, ammo: 0, module: 0 }));
  const c = s.cols;
  for (let j = 0; j < ph.rows.length; j++) {
    const p = ph.plate[j];
    if (p < 0) continue;
    const i = ph.rows[j];
    if (!keep(i)) continue;
    const a = acc[p];
    a.hits++;
    const r = c.result[i];
    if (r !== R_UNKNOWN) {
      a.known++;
      if (r >= 2) {
        a.through++;
        const e = c.effects[i];
        if (e & EFFECT_BIT.lethal) a.lethal++;
        if (e & EFFECT_BIT.fire) a.fire++;
        if (e & CREW_BITS) a.crew++;
        if (e & (EFFECT_BIT.ammo | EFFECT_BIT.ammoDetonation)) a.ammo++;
        if (e & EFFECT_BIT.module) a.module++;
        for (let b = 0; b < EFFECTS.length; b++) if (e & (1 << b)) a.fx.set(EFFECTS[b], (a.fx.get(EFFECTS[b]) ?? 0) + 1);
      }
    }
    if (s.speedSrc[i]) {
      a.sp.push(s.speed[i]);
      if (s.speedSrc[i] === SRC_BALLISTIC) a.est++;
    }
    if (Number.isFinite(ph.angle[j])) a.an.push(ph.angle[j]);
    if (Number.isFinite(ph.effMm[j])) a.eff.push(ph.effMm[j]);
    if (c.flags[i] & FLAG_DIST) a.di.push(c.dist[i] / 4);
    if (c.calibre[i]) {
      const mm = Math.round(c.calibre[i] / 10);
      a.cal.set(mm, (a.cal.get(mm) ?? 0) + 1);
    }
  }
  return acc.map((a) => ({
    hits: a.hits,
    known: a.known,
    through: a.through,
    rate: a.known ? a.through / a.known : NaN,
    ci: wilson(a.through, a.known),
    speedMean: mean(a.sp),
    speedMedian: median(a.sp),
    speedEstimated: a.sp.length ? a.est / a.sp.length : NaN,
    angleMean: mean(a.an),
    angleMedian: median(a.an),
    effMedian: median(a.eff),
    distMedian: median(a.di),
    calibres: [...a.cal.entries()].sort((x, y) => y[1] - x[1]).slice(0, 8),
    lethal: a.through ? a.lethal / a.through : NaN,
    fire: a.through ? a.fire / a.through : NaN,
    crew: a.through ? a.crew / a.through : NaN,
    ammo: a.through ? a.ammo / a.through : NaN,
    module: a.through ? a.module / a.through : NaN,
    effects: Object.fromEntries(a.fx),
  }));
}

/** What a plate's colour shows. */
export type PlateMetric = 'rate' | 'density' | 'lethal' | 'fire' | 'crew' | 'ammo' | 'angle' | 'speed' | 'diff';

/**
 * Each plate's colour value: t in [-1, 1] for a diverging metric (penetration rate about the vehicle's own rate,
 * a difference about none), in [0, 1] for a sequential one; NaN where the plate has fewer than `minHits`.
 * Returns the values and the legend's ends and midpoint in the metric's own units.
 */
export function plateColours(stats: PlateStat[], metric: PlateMetric, minHits: number, diff: number[] | null = null, centre: 'overall' | 'half' = 'overall'): { t: Float32Array; lo: number; mid: number; hi: number; diverging: boolean } {
  const t = new Float32Array(stats.length).fill(NaN);
  if (metric === 'diff' && diff) {
    let m = 0;
    for (let i = 0; i < diff.length; i++) if (Number.isFinite(diff[i])) m = Math.max(m, Math.abs(diff[i]));
    m = Math.max(m, 0.05);
    diff.forEach((d, i) => (t[i] = Number.isFinite(d) ? d / m : NaN));
    return { t, lo: -m, mid: 0, hi: m, diverging: true };
  }
  if (metric === 'rate') {
    let k = 0, n = 0;
    for (const s of stats) {
      k += s.through;
      n += s.known;
    }
    const mid = centre === 'half' || !n ? 0.5 : k / n;
    stats.forEach((s, i) => {
      if (s.known < minHits || !Number.isFinite(s.rate)) return;
      t[i] = s.rate >= mid ? (mid < 1 ? (s.rate - mid) / (1 - mid) : 0) : mid > 0 ? (s.rate - mid) / mid : 0;
    });
    return { t, lo: 0, mid, hi: 1, diverging: true };
  }
  const val = (s: PlateStat): number =>
    metric === 'density' ? s.hits : metric === 'angle' ? s.angleMedian : metric === 'speed' ? s.speedMedian : metric === 'lethal' ? s.lethal : metric === 'fire' ? s.fire : metric === 'crew' ? s.crew : s.ammo;
  let mx = 0;
  stats.forEach((s) => {
    const v = val(s);
    if (s.hits >= minHits && Number.isFinite(v)) mx = Math.max(mx, v);
  });
  const top = metric === 'angle' ? 90 : metric === 'density' || metric === 'speed' ? mx : Math.max(mx, 1e-9);
  stats.forEach((s, i) => {
    const v = val(s);
    if (s.hits >= minHits && Number.isFinite(v) && top > 0) t[i] = Math.min(1, v / top);
  });
  return { t, lo: 0, mid: NaN, hi: top, diverging: false };
}

/** A continuous field a chart can bin on. */
export type BinField = 'angle' | 'speed' | 'distance' | 'calibre' | 'descent' | 'effMm';
export const BIN_FIELDS: readonly BinField[] = ['angle', 'speed', 'distance', 'calibre', 'descent', 'effMm'];

export function fieldValue(s: HitStore, field: BinField, i: number, j: number, ph: PlateHits | null): number {
  const c = s.cols;
  switch (field) {
    case 'angle':
      return ph && j >= 0 ? ph.angle[j] : NaN;
    case 'effMm':
      return ph && j >= 0 ? ph.effMm[j] : NaN;
    case 'speed':
      return s.speedSrc[i] ? s.speed[i] : NaN;
    case 'distance':
      return c.flags[i] & FLAG_DIST ? c.dist[i] / 4 : NaN;
    case 'calibre':
      return c.calibre[i] ? c.calibre[i] / 10 : NaN;
    case 'descent':
      return s.descent[i] !== NONE16 ? s.descent[i] / 100 : NaN;
  }
}

const BIN_RANGE: Record<BinField, [number, number, number]> = {
  angle: [0, 90, 5],
  speed: [0, 1800, 100],
  distance: [0, 3000, 150],
  calibre: [0, 160, 10],
  descent: [-10, 80, 5],
  effMm: [0, 600, 25],
};

/**
 * Penetration rate over a binned field (a line a series), the series split by shell kind or ammunition type (the
 * most frequent four, the rest left out), or one series of all. Bins with fewer than `minHits` known results are NaN.
 */
export function rateOver(s: HitStore, rows: ArrayLike<number>, field: BinField, keep: (i: number) => boolean, ph: PlateHits | null, split: 'none' | 'kind' | 'ammoType', minHits = 5): ChartData {
  const [a, b, w] = BIN_RANGE[field];
  const bins = Math.round((b - a) / w);
  const keyOf = (i: number): string => (split === 'kind' ? s.kindOf(i) : split === 'ammoType' ? s.ammoTypes.list[s.cols.ammoType[i]] || '?' : 'all');
  const tally = new Map<string, { k: Float64Array; n: Float64Array; total: number }>();
  let used = 0;
  for (let j = 0; j < rows.length; j++) {
    const i = rows[j];
    if (!keep(i) || s.cols.result[i] === R_UNKNOWN) continue;
    const v = fieldValue(s, field, i, ph ? j : -1, ph);
    if (!Number.isFinite(v)) continue;
    const bi = Math.min(bins - 1, Math.max(0, Math.floor((v - a) / w)));
    const key = keyOf(i);
    let t = tally.get(key);
    if (!t) tally.set(key, (t = { k: new Float64Array(bins), n: new Float64Array(bins), total: 0 }));
    t.n[bi]++;
    t.total++;
    if (s.cols.result[i] >= 2) t.k[bi]++;
    used++;
  }
  const top = [...tally.entries()].sort((x, y) => y[1].total - x[1].total).slice(0, 4);
  const groups: ChartEntity[] = Array.from({ length: bins }, (_, k) => ({ key: String(k), label: `${a + k * w}-${a + (k + 1) * w}`, filter: { kind: 'range', column: field, lo: a + k * w, hi: a + (k + 1) * w } }));
  const series: ChartEntity[] = top.map(([k]) => ({ key: k, label: k === 'all' ? '@vhits.all' : k }));
  return {
    kind: 'line',
    groups,
    series,
    values: top.map(([, t]) => Array.from(t.n, (n, k) => (n >= minHits ? t.k[k] / n : NaN))),
    counts: top.map(([, t]) => Array.from(t.n)),
    format: 'pct',
    valueLabel: '@vhits.chart.rate',
    axis: { lo: a, hi: b, label: `@vhits.field.${field}` },
    rows: used,
    empty: used ? undefined : '@vhits.chart.empty',
  };
}

/** A histogram of a field, stacked by result. */
export function histogram(s: HitStore, rows: ArrayLike<number>, field: BinField, keep: (i: number) => boolean, ph: PlateHits | null): ChartData {
  const [a, b, w] = BIN_RANGE[field];
  const bins = Math.round((b - a) / w);
  const res = ['nonpenetration', 'penetration', 'critical', 'kill', 'unknown'] as const;
  const counts = res.map(() => new Array<number>(bins).fill(0));
  let used = 0;
  for (let j = 0; j < rows.length; j++) {
    const i = rows[j];
    if (!keep(i)) continue;
    const v = fieldValue(s, field, i, ph ? j : -1, ph);
    if (!Number.isFinite(v)) continue;
    const bi = Math.min(bins - 1, Math.max(0, Math.floor((v - a) / w)));
    counts[res.indexOf(RESULTS[s.cols.result[i]] as (typeof res)[number])][bi]++;
    used++;
  }
  const keepSeries = res.map((_, k) => counts[k].some((x) => x > 0));
  return {
    kind: 'stacked',
    groups: Array.from({ length: bins }, (_, k) => ({ key: String(k), label: `${a + k * w}`, filter: { kind: 'range', column: field, lo: a + k * w, hi: a + (k + 1) * w } })),
    series: res.map((r) => ({ key: r, label: `@vhits.result.${r}` })).filter((_, k) => keepSeries[k]),
    values: counts.filter((_, k) => keepSeries[k]),
    format: 'int',
    valueLabel: '@vhits.chart.hits',
    axis: { lo: a, hi: b, label: `@vhits.field.${field}` },
    rows: used,
    empty: used ? undefined : '@vhits.chart.empty',
  };
}

/** A row of a top-N table. */
export interface TopRow {
  key: string;
  hits: number;
  known: number;
  through: number;
  rate: number;
  ci: [number, number];
  kills: number;
  fires: number;
  crew: number;
  medianDist: number;
}

/** The hits grouped by a key (attacker vehicle, ammunition, map...), the largest `limit` groups. */
export function topBy(s: HitStore, rows: ArrayLike<number>, by: 'attacker' | 'ammoName' | 'ammoType' | 'kind' | 'map' | 'attackerPlayer' | 'victim', keep: (i: number) => boolean, limit = 20): TopRow[] {
  const c = s.cols;
  const keyOf = (i: number): string =>
    by === 'attacker'
      ? s.vehicles.list[c.attacker[i]]
      : by === 'victim'
        ? s.vehicles.list[c.victim[i]]
        : by === 'ammoName'
          ? s.ammoNames.list[c.ammoName[i]]
          : by === 'ammoType'
            ? s.ammoTypes.list[c.ammoType[i]]
            : by === 'kind'
              ? s.kindOf(i)
              : by === 'map'
                ? s.matches[c.match[i]].map
                : s.players.list[c.attackerPlayer[i]];
  const m = new Map<string, { hits: number; known: number; through: number; kills: number; fires: number; crew: number; d: number[] }>();
  for (let j = 0; j < rows.length; j++) {
    const i = rows[j];
    if (!keep(i)) continue;
    const k = keyOf(i) || '?';
    let a = m.get(k);
    if (!a) m.set(k, (a = { hits: 0, known: 0, through: 0, kills: 0, fires: 0, crew: 0, d: [] }));
    a.hits++;
    if (c.result[i] !== R_UNKNOWN) {
      a.known++;
      if (c.result[i] >= 2) a.through++;
    }
    if (c.effects[i] & EFFECT_BIT.killingShot) a.kills++;
    if (c.effects[i] & EFFECT_BIT.fire) a.fires++;
    if (c.effects[i] & CREW_BITS) a.crew++;
    if (c.flags[i] & FLAG_DIST && a.d.length < 4096) a.d.push(c.dist[i] / 4);
  }
  return [...m.entries()]
    .sort((x, y) => y[1].hits - x[1].hits)
    .slice(0, limit)
    .map(([key, a]) => ({ key, hits: a.hits, known: a.known, through: a.through, rate: a.known ? a.through / a.known : NaN, ci: wilson(a.through, a.known), kills: a.kills, fires: a.fires, crew: a.crew, medianDist: median(a.d) }));
}

/** Source labels of a hit's values, for the tooltip. */
export function sourceName(src: number): 'recorded' | 'ballistic' | 'derived' | 'unknown' {
  return src === SRC_RECORDED ? 'recorded' : src === SRC_BALLISTIC ? 'ballistic' : src ? 'derived' : 'unknown';
}
