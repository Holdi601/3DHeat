/**
 * Insights over many matches, from the mass index alone (no rows): the
 * single-dataset detectors on a map's summed grids (`GridMerge.toInsightJob`),
 * and the mass detectors -
 *
 *   balance   a vehicle or class doing better or worse than the rest on a
 *             map or in a mode: K/D share and win rate against the rest's
 *   hotspot   places hot in a steady share of matches, not just in sum:
 *             matches hot / matches seen against the map's base rate
 *   side      a side (team) of a map winning or trading kills more than an
 *             even split
 *   meta      a vehicle's use or K/D moving between the earlier and the
 *             later half of the dates
 *   phase     a part of the match length holding more kills (or hits,
 *             launches...) than an even spread
 *
 * Every finding carries its counts, its effect with an interval, p and the
 * Benjamini-Hochberg q over all a detector tried, the filter and drill-down
 * that show it, and a sentence key with its values - the report stays the
 * JSON the narrators read (`insights/seam.ts`). Stage B (niche and subgroup
 * discovery) plugs in as another `MassDetector` (docs/mass-analysis.md).
 */

import { finishInsights } from '../insights/engine';
import { ACTORS, EVENT_KINDS, VEHICLE_CLASSES } from '../data/canonical';
import type { InsightNames } from '../insights/detectors';
import { bhAdjust, confidenceLevel, shareTest, strengthOf, type ShareTest } from '../insights/stats';
import type { Insight, InsightPlace } from '../insights/types';
import type { GridMerge } from './grids';
import { balance, drillMatches, NOT_DRIVEN, phases, sides, type MassDrill, type MassFilter, type MassStore } from './store';
import { pOfZ, type PlaceFinding, type PlaceRun, type PlaceShape } from './scan';
import { NULL_RUNS, type NicheFinding, type NicheRun } from './niche';
import { GRID_KINDS, PHASE_BINS } from './types';

export const MASS_FDR = 0.05;
export const MASS_MAX = 80;
/** Fewest lives (or matches) a group needs to be tested. */
const MIN_UNITS = 20;
const MIN_SEEN = 8;

export type MassDetectorId = 'balance' | 'hotspot' | 'side' | 'meta' | 'phase' | 'place' | 'niche' | `grid.${string}`;

/** An insight of the mass report: the single-dataset shape, with what loads its evidence. */
export interface MassInsight extends Omit<Insight, 'detector'> {
  detector: MassDetectorId;
  /** The matches it rests on, as a drill-down within the report's filter (and map). */
  drill: MassDrill & { map?: string; mode?: string };
  /** A place's outline, height band or part of the match, and how plain it already is in the heat (`place`). */
  region?: {
    shape: PlaceShape;
    segs: number[];
    path?: [number, number][];
    bandY?: [number, number];
    phase?: [number, number];
    obviousness: number;
    hidden: boolean;
  };
  /** A niche's conditions (`niche`). */
  conds?: { f: string; v: string; label?: string }[];
}

export interface MassDetectorRun {
  id: MassDetectorId;
  ran: boolean;
  skipped?: string;
  tests: number;
  found: number;
  ms: number;
}

export interface MassReport {
  schema: 'heat3d.mass/1';
  /** Stage B in full: every place and niche kept (the insights carry the best of them). */
  places?: PlaceRun | null;
  niches?: NicheRun | null;
  dataset: { matches: number; games: string[]; maps: number; hours: number; players: number; from: string | null; to: string | null };
  filter: MassFilter;
  detectors: MassDetectorRun[];
  insights: MassInsight[];
  fdr: number;
  elapsedMs: number;
}

/** What a detector gets: the store, the filter's matches, and the summed grids of the maps looked at. */
export interface MassContext {
  store: MassStore;
  mask: Uint8Array;
  filter: MassFilter;
  grids: Map<string, GridMerge>;
  /** Stage B, worked out before (the place scan reads the grids twice, the niches need its tables). */
  places?: PlaceRun | null;
  niches?: NicheRun | null;
}

export interface MassDetector {
  id: MassDetectorId;
  skip(ctx: MassContext): string | null;
  run(ctx: MassContext): { insights: MassInsight[]; tests: number };
}

const r3 = (v: number) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : v);
const fin = (v: number) => (Number.isFinite(v) ? r3(v) : null);
/** A share as the sentence says it. */
const pc = (v: number) => `${Math.round(v * 1000) / 10}%`;

interface Draft {
  detector: MassDetectorId;
  kind: string;
  key: string;
  test: ShareTest;
  params: Record<string, number | string>;
  evidence: Record<string, number | string>;
  drill: MassInsight['drill'];
  place?: InsightPlace | null;
  time?: { from: number; to: number } | null;
  subject?: Insight['subject'];
  filters?: Insight['filters'];
  method: string;
}

/** Drafts to insights: BH over every test the detector made, those under the FDR kept. */
function finish(drafts: Draft[], tests: number): MassInsight[] {
  const q = bhAdjust(drafts.map((d) => d.test.p), Math.max(tests, drafts.length));
  const out: MassInsight[] = [];
  drafts.forEach((d, i) => {
    if (q[i] > MASS_FDR) return;
    const t = d.test;
    const ratio = t.shrunk >= 1 ? t.shrunk : 1 / t.shrunk;
    out.push({
      id: `mass:${d.kind}:${d.key}`,
      detector: d.detector,
      kind: d.kind,
      sentence: { key: `mass.say.${d.kind}${t.shrunk >= 1 ? 'Up' : 'Down'}`, params: { ratio: r3(ratio), ...d.params } },
      strength: r3(strengthOf(t.shrunk, q[i])),
      effect: { measure: 'shareRatio', value: r3(t.shrunk), raw: fin(t.raw), lo: fin(t.lo), hi: fin(t.hi) },
      confidence: { p: t.p, q: q[i], level: confidenceLevel(q[i]), tests: Math.max(tests, drafts.length), method: d.method },
      evidence: d.evidence,
      place: d.place ?? null,
      time: d.time ?? null,
      filters: d.filters ?? [],
      subject: d.subject ?? {},
      drill: d.drill,
    });
  });
  return out;
}

const balanceDetector: MassDetector = {
  id: 'balance',
  skip: (ctx) => (ctx.store.v.match.n === 0 ? 'mass.skip.noVehicles' : null),
  run: (ctx) => {
    const drafts: Draft[] = [];
    let tests = 0;
    for (const split of ['map', 'mode'] as const) {
      const rows = balance(ctx.store, ctx.mask, 'vehicle', split, { minUnits: MIN_UNITS });
      // The rest of the split: its totals less the row's.
      const tot = new Map<string, { k: number; d: number; ws: number; wn: number }>();
      for (const r of rows) {
        const t = tot.get(r.split) ?? { k: 0, d: 0, ws: 0, wn: 0 };
        t.k += r.kills;
        t.d += r.deaths;
        if (r.win !== null) {
          t.ws += r.win * r.winN;
          t.wn += r.winN;
        }
        tot.set(r.split, t);
      }
      for (const r of rows) {
        // Balance is the players' question: the mission's own AI (trucks, flak) is no choice anyone made.
        if (!r.split || r.players < MIN_UNITS) continue;
        const t = tot.get(r.split)!;
        const drill = { vehicle: r.key, ...(split === 'map' ? { map: r.split } : { mode: r.split }) };
        const params = { vehicle: r.label || r.key, where: r.split, kd: r3(r.kd), units: r.units };
        if (r.kills + r.deaths >= 10 && t.k + t.d - r.kills - r.deaths > 0) {
          tests++;
          drafts.push({
            detector: 'balance', kind: 'balance.kd', key: `${split}:${r.split}:${r.key}`,
            test: shareTest(r.kills, r.kills + r.deaths, t.k - r.kills, t.k + t.d - r.kills - r.deaths),
            params, drill, method: 'exact binomial on kills of kills + deaths against the rest of the split; BH',
            evidence: { kills: r.kills, deaths: r.deaths, units: r.units, matches: r.matches, hours: r3(r.hours), split, where: r.split },
            subject: { vehicleClass: r.cls },
          });
        }
        if (r.win !== null && r.winN >= MIN_UNITS && t.wn - r.winN > 0) {
          tests++;
          drafts.push({
            detector: 'balance', kind: 'balance.win', key: `${split}:${r.split}:${r.key}`,
            test: shareTest(Math.round(r.win * r.winN), r.winN, Math.round(t.ws - r.win * r.winN), t.wn - r.winN),
            params: { ...params, win: pc(r.win) }, drill, method: 'exact binomial on lives in won matches against the rest of the split; BH',
            evidence: { won: r3(r.win * r.winN), lives: r.winN, matches: r.matches, split, where: r.split },
            subject: { vehicleClass: r.cls },
          });
        }
      }
    }
    return { insights: finish(drafts, tests), tests };
  },
};

const hotspotDetector: MassDetector = {
  id: 'hotspot',
  skip: (ctx) => (ctx.grids.size === 0 ? 'mass.skip.noGrids' : null),
  run: (ctx) => {
    const drafts: Draft[] = [];
    let tests = 0;
    for (const [map, g] of ctx.grids) {
      if (g.matches < MIN_SEEN) continue;
      let hot = 0, seen = 0;
      for (let i = 0; i < g.ix.length; i++)
        if (g.seen[i] >= MIN_SEEN) {
          hot += g.hot[i];
          seen += g.seen[i];
        }
      if (!seen) continue;
      for (let i = 0; i < g.ix.length; i++) {
        if (g.seen[i] < MIN_SEEN || g.hot[i] < 3) continue;
        tests++;
        const test = shareTest(g.hot[i], g.seen[i], hot - g.hot[i], seen - g.seen[i]);
        if (test.shrunk <= 1) continue;
        const x = (g.ix[i] + 0.5) * g.cell;
        const z = (g.iz[i] + 0.5) * g.cell;
        const y = g.p[i] > 0 ? g.y[i] / g.p[i] : 0;
        drafts.push({
          detector: 'hotspot', kind: 'hotspot.stable', key: `${map}:${g.ix[i]}:${g.iz[i]}`,
          test, params: { map, share: pc(g.hot[i] / g.seen[i]), matches: g.seen[i] },
          evidence: { hotIn: g.hot[i], seenIn: g.seen[i], mapMatches: g.matches, cell: g.cell, kills: g.ev[i * GRID_KINDS.length + GRID_KINDS.indexOf('kill')], presence: r3(g.p[i]) },
          place: { x, y, z, radius: g.cell * 0.71, grid: 'fine', cell: g.cell },
          drill: { map }, method: 'exact binomial on matches hot of matches seen against the map\'s other cells; BH',
        });
      }
    }
    // Neighbours of a stronger spot say the same: one a 3x3 block.
    drafts.sort((a, b) => a.test.p - b.test.p);
    const kept: Draft[] = [];
    for (const d of drafts) {
      const p = d.place!;
      if (kept.some((k) => k.drill.map === d.drill.map && Math.abs(k.place!.x - p.x) <= p.cell * 1.5 && Math.abs(k.place!.z - p.z) <= p.cell * 1.5)) continue;
      kept.push(d);
    }
    return { insights: finish(kept, tests), tests };
  },
};

const sideDetector: MassDetector = {
  id: 'side',
  skip: () => null,
  run: (ctx) => {
    const rows = sides(ctx.store, ctx.mask);
    const drafts: Draft[] = [];
    let tests = 0;
    const per = new Map<string, number>();
    for (const r of rows) per.set(r.map, (per.get(r.map) ?? 0) + 1);
    for (const r of rows) {
      const n = r.decided || (r.win !== null ? r.matches : 0);
      if (n < MIN_SEEN || !r.map) continue;
      const k = r.decided ? r.wins : Math.round((r.win ?? 0) * r.matches);
      const sidesN = Math.max(2, per.get(r.map)!);
      tests++;
      drafts.push({
        detector: 'side', kind: 'side.win', key: `${r.map}:${r.team}`,
        test: shareTest(k, n, Math.round(n * (sidesN - 1) * (1 / sidesN) * 10), Math.round(n * (sidesN - 1) * 10)),
        params: { map: r.map, team: r.team, win: pc(k / n), matches: n },
        evidence: { won: k, decided: n, kills: r.kills, deaths: r.deaths, sides: sidesN },
        drill: { map: r.map, team: r.team }, filters: [{ by: 'team', values: [r.team] }],
        method: 'exact binomial on matches won against an even split; BH',
      });
    }
    return { insights: finish(drafts, tests), tests };
  },
};

/** A use shift worth telling: this many share points at least, and a quarter more or less. */
const META_MIN_POINTS = 0.02;
const META_MIN_USE = 1.25;
/** A K/D shift: odds this much better or worse. */
const META_MIN_KD = 1.3;

/**
 * Meta shifts with practical significance: on mixed dates, servers and
 * missions a binomial on lives calls nearly every change significant (lives
 * of one match move together). So the test is cluster-robust (each match's
 * lives a cluster, its residual against the half's share), the shift must be
 * large enough to matter (`META_MIN_*`), the dates' quarters must move the
 * same way (Kendall's tau of the quarters' shares with time, at least 0.5 in
 * the shift's direction: a trend, not one odd stretch), and a vehicle seen
 * on several maps must shift the same way on most of them.
 */
const metaDetector: MassDetector = {
  id: 'meta',
  skip: (ctx) => {
    let dated = 0;
    for (let i = 0; i < ctx.mask.length; i++) if (ctx.mask[i] && Number.isFinite(ctx.store.m.started.get(i))) dated++;
    return dated < 2 * MIN_SEEN ? 'mass.skip.fewDates' : null;
  },
  run: (ctx) => {
    const s = ctx.store;
    const n = ctx.mask.length;
    const dates: number[] = [];
    for (let i = 0; i < n; i++) if (ctx.mask[i] && Number.isFinite(s.m.started.get(i))) dates.push(s.m.started.get(i));
    dates.sort((a, b) => a - b);
    const cut = [0.25, 0.5, 0.75].map((f) => dates[Math.floor(dates.length * f)]);
    const mid = cut[1];
    /** Quarter of the dates (0..3), -1 undated or filtered out. */
    const quarter = new Int8Array(n).fill(-1);
    for (let i = 0; i < n; i++) {
      const st = s.m.started.get(i);
      if (ctx.mask[i] && Number.isFinite(st)) quarter[i] = st < cut[0] ? 0 : st < cut[1] ? 1 : st < cut[2] ? 2 : 3;
    }
    // Player lives a match (the vehicles anyone chose).
    const tot = new Float64Array(n);
    const V = s.v;
    for (let r = 0; r < V.match.n; r++) {
      const m = V.match.a[r];
      if (quarter[m] < 0 || NOT_DRIVEN.has(s.str(V.cls.a[r]))) continue;
      tot[m] += V.players.a[r];
    }
    // Per map and quarter: lives, and lives squared (for the robust variance).
    const mapQ = new Map<number, { t: Float64Array; t2: Float64Array }>();
    for (let i = 0; i < n; i++) {
      if (quarter[i] < 0) continue;
      const mp = s.m.map.get(i);
      let a = mapQ.get(mp);
      if (!a) mapQ.set(mp, (a = { t: new Float64Array(4), t2: new Float64Array(4) }));
      a.t[quarter[i]] += tot[i];
      a.t2[quarter[i]] += tot[i] * tot[i];
    }
    interface Acc { key: number; label: number; cls: number; map: number; l: Float64Array; ll: Float64Array; lt: Float64Array; k: Float64Array; d: Float64Array; kk: Float64Array; kn: Float64Array; nn: Float64Array }
    const accs = new Map<string, Acc>();
    for (let r = 0; r < V.match.n; r++) {
      const m = V.match.a[r];
      const qt = quarter[m];
      if (qt < 0 || NOT_DRIVEN.has(s.str(V.cls.a[r]))) continue;
      const mp = s.m.map.get(m);
      const id = `${mp}|${V.key.a[r]}`;
      let a = accs.get(id);
      if (!a) {
        const z = () => new Float64Array(4);
        accs.set(id, (a = { key: V.key.a[r], label: V.label.a[r], cls: V.cls.a[r], map: mp, l: z(), ll: z(), lt: z(), k: z(), d: z(), kk: z(), kn: z(), nn: z() }));
      }
      const l = V.players.a[r], k = V.kills.a[r], d = V.deaths.a[r];
      a.l[qt] += l;
      a.ll[qt] += l * l;
      a.lt[qt] += l * tot[m];
      a.k[qt] += k;
      a.d[qt] += d;
      a.kk[qt] += k * k;
      a.kn[qt] += k * (k + d);
      a.nn[qt] += (k + d) * (k + d);
    }
    const sum = (x: Float64Array, q: number[]) => q.reduce((v, i) => v + x[i], 0);
    const E = [0, 1], L = [2, 3];
    /** Kendall's tau of the quarters' values (those with enough) against time. */
    const tau = (v: number[], ok: boolean[]) => {
      const pts = v.map((x, i) => [i, x] as const).filter((_, i) => ok[i]);
      let c = 0, all = 0;
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          all++;
          c += Math.sign(pts[j][1] - pts[i][1]);
        }
      return pts.length >= 3 && all ? c / all : 0;
    };
    type Shift = { a: Acc; kind: 'usage' | 'kd'; dir: number; draft: Draft };
    const shifts: Shift[] = [];
    let tests = 0;
    const day = (sec: number) => new Date(sec * 1000).toISOString().slice(0, 10);
    for (const a of accs.values()) {
      const mq = mapQ.get(a.map)!;
      const mapName = s.str(a.map);
      if (!mapName) continue;
      const vehicle = s.str(a.label) || s.str(a.key);
      const params = { vehicle, map: mapName, since: day(mid) };
      const drill = { vehicle: s.str(a.key), map: mapName };
      // Use: share of the map's player lives, early half against late.
      const lE = sum(a.l, E), lL = sum(a.l, L), tE = sum(mq.t, E), tL = sum(mq.t, L);
      if (lE + lL >= MIN_UNITS && tE >= MIN_UNITS && tL >= MIN_UNITS) {
        tests++;
        const pE = lE / tE, pL = lL / tL;
        // Over the half's matches, (lives - p * total)^2 - the matches without the vehicle included.
        const rv = (q: number[], p: number, T: number) => (sum(a.ll, q) - 2 * p * sum(a.lt, q) + p * p * sum(mq.t2, q)) / (T * T);
        const se = Math.sqrt(Math.max(1e-12, rv(E, pE, tE) + rv(L, pL, tL), (pE * (1 - pE)) / tE + (pL * (1 - pL)) / tL));
        const z = (pL - pE) / se;
        const rel = Math.max(pL, 1e-9) / Math.max(pE, 1e-9);
        const big = Math.abs(pL - pE) >= META_MIN_POINTS && (rel >= META_MIN_USE || 1 / rel >= META_MIN_USE);
        const qs = [0, 1, 2, 3].map((q) => (mq.t[q] > 0 ? a.l[q] / mq.t[q] : 0));
        const trend = tau(qs, [0, 1, 2, 3].map((q) => mq.t[q] >= MIN_SEEN)) * Math.sign(pL - pE);
        if (big && trend >= 0.5) {
          const test = shareTest(lL, tL, lE, tE);
          test.p = pOfZ(z);
          shifts.push({
            a, kind: 'usage', dir: Math.sign(pL - pE),
            draft: {
              detector: 'meta', kind: 'meta.usage', key: `${mapName}:${s.str(a.key)}`, test,
              params: { ...params, before: pc(pE), after: pc(pL) },
              evidence: { livesLate: lL, livesEarly: lE, totalLate: tL, totalEarly: tE, quarters: qs.map((x) => pc(x)).join(' '), trend: r3(trend), z: r3(z), split: day(mid), map: mapName },
              drill, subject: { vehicleClass: s.str(a.cls) },
              method: "share of the map's player lives, later half of the dates against the earlier; matches as clusters (robust variance); a shift of 2 points and 25% at least, the quarters trending the same way (Kendall tau >= 0.5); BH",
            },
          });
        }
      }
      // K/D: kills of kills + deaths, early half against late.
      const kE = sum(a.k, E), kL = sum(a.k, L), nE = kE + sum(a.d, E), nL = kL + sum(a.d, L);
      if (sum(a.l, E) >= MIN_UNITS && sum(a.l, L) >= MIN_UNITS && nE >= 10 && nL >= 10) {
        tests++;
        const pE = kE / nE, pL = kL / nL;
        const rv = (q: number[], p: number, N: number) => (sum(a.kk, q) - 2 * p * sum(a.kn, q) + p * p * sum(a.nn, q)) / (N * N);
        const se = Math.sqrt(Math.max(1e-12, rv(E, pE, nE) + rv(L, pL, nL), (pE * (1 - pE)) / nE + (pL * (1 - pL)) / nL));
        const z = (pL - pE) / se;
        const test = shareTest(kL, nL, kE, nE);
        const ratio = test.shrunk >= 1 ? test.shrunk : 1 / test.shrunk;
        const qs = [0, 1, 2, 3].map((q) => (a.k[q] + a.d[q] > 0 ? a.k[q] / (a.k[q] + a.d[q]) : 0));
        const trend = tau(qs, [0, 1, 2, 3].map((q) => a.k[q] + a.d[q] >= 5)) * Math.sign(pL - pE);
        if (ratio >= META_MIN_KD && trend >= 0.5) {
          test.p = pOfZ(z);
          const kd = (k: number, nn: number) => r3(k / Math.max(1, nn - k));
          shifts.push({
            a, kind: 'kd', dir: Math.sign(pL - pE),
            draft: {
              detector: 'meta', kind: 'meta.kd', key: `${mapName}:${s.str(a.key)}`, test,
              params: { ...params, before: kd(kE, nE), after: kd(kL, nL) },
              evidence: { killsLate: kL, deathsLate: nL - kL, killsEarly: kE, deathsEarly: nE - kE, trend: r3(trend), z: r3(z), split: day(mid), map: mapName },
              drill, subject: { vehicleClass: s.str(a.cls) },
              method: 'kills of kills + deaths on the map, later half against the earlier; matches as clusters (robust variance); odds 1.3 times at least, the quarters trending the same way; BH',
            },
          });
        }
      }
    }
    // Across maps: a vehicle shifting one way here and the other way elsewhere is noise, not a meta.
    const byVehicle = new Map<string, number[]>();
    for (const a of accs.values()) {
      const mq = mapQ.get(a.map)!;
      const lE = sum(a.l, E), lL = sum(a.l, L);
      if (lE >= 10 && lL >= 10) {
        const v = byVehicle.get(`${a.key}|usage`) ?? [];
        v.push(Math.sign(lL / Math.max(1e-9, sum(mq.t, L)) - lE / Math.max(1e-9, sum(mq.t, E))));
        byVehicle.set(`${a.key}|usage`, v);
      }
      const nE = sum(a.k, E) + sum(a.d, E), nL = sum(a.k, L) + sum(a.d, L);
      if (nE >= 10 && nL >= 10) {
        const w = byVehicle.get(`${a.key}|kd`) ?? [];
        w.push(Math.sign(sum(a.k, L) / nL - sum(a.k, E) / nE));
        byVehicle.set(`${a.key}|kd`, w);
      }
    }
    const drafts = shifts
      .filter((x) => {
        const dirs = byVehicle.get(`${x.a.key}|${x.kind}`) ?? [];
        return dirs.length < 2 || dirs.filter((d) => d === x.dir).length / dirs.length > 0.5;
      })
      .map((x) => x.draft);
    return { insights: finish(drafts, tests), tests };
  },
};

const phaseDetector: MassDetector = {
  id: 'phase',
  skip: () => null,
  run: (ctx) => {
    const ph = phases(ctx.store, ctx.mask);
    const drafts: Draft[] = [];
    let tests = 0;
    for (const [kind, bins] of Object.entries(ph)) {
      const total = bins.reduce((s, v) => s + v, 0);
      if (total < 50) continue;
      for (let b = 0; b < PHASE_BINS; b++) {
        tests++;
        // Against an even spread: a base of 1 in `PHASE_BINS`.
        const test = shareTest(bins[b], total, 1, PHASE_BINS);
        if (test.shrunk <= 1) continue;
        drafts.push({
          detector: 'phase', kind: 'phase.peak', key: `${kind}:${b}`,
          test,
          params: { event: kind, from: Math.round((b * 100) / PHASE_BINS), to: Math.round(((b + 1) * 100) / PHASE_BINS) },
          evidence: { count: bins[b], total, bins: PHASE_BINS },
          time: null, drill: {}, filters: [{ by: 'category', column: 'Event type', values: [kind] }],
          subject: { eventKind: kind },
          method: 'exact binomial on the bin\'s share of the events against an even spread over the match length; BH',
        });
      }
    }
    return { insights: finish(drafts, tests), tests };
  },
};

const DEATH_EVENTS = ['death', 'destroyed', 'crash'];

/** A place's sentence: by what it measures (all units, a class, a side, a band) and its shape. */
function placeKind(f: PlaceFinding): string {
  if (f.shape === 'time') return 'place.time';
  if (f.shape === 'band') return f.type === 'share' ? 'place.bandKd' : 'place.bandRate';
  if (f.event === 'win') return 'place.winSide';
  if (f.type === 'share') return f.team ? 'place.kdSide' : f.band !== undefined ? 'place.kdBand' : 'place.kd';
  return f.cls ? 'place.rateClass' : f.band !== undefined ? 'place.rateBand' : 'place.rate';
}

/** A band as words: metres above the ground, or the data's floor. */
export function bandName(f: { band?: number; bandBy?: 'height' | 'floor' }): string {
  if (f.band === undefined) return '';
  if (f.bandBy === 'floor') return `#${f.band}`;
  const e = [0, 3, 10, 30, 100, 300, 1000, 3000];
  return f.band >= e.length - 1 ? `> ${e[e.length - 1]} m` : `${e[f.band]}–${e[f.band + 1]} m`;
}

/** A place's sentence: its message key and values. */
export function placeSentence(f: PlaceFinding): { key: string; params: Record<string, number | string> } {
  const kind = placeKind(f);
  return {
    key: `mass.say.${kind}${f.dir > 0 ? 'Up' : 'Down'}`,
    params: {
      map: f.map,
      event: f.event,
      ratio: r2(f.dir > 0 ? f.shrunk : 1 / Math.max(1e-9, f.shrunk)),
      obs: Math.round(f.observed),
      exp: f.expected >= 10 ? Math.round(f.expected) : r2(f.expected),
      held: `${f.stability.held}/${f.stability.seen}`,
      ...(f.event === 'win' && f.exposure > 0 ? { value: pc(f.observed / f.exposure), base: pc(f.expected / f.exposure), rounds: Math.round(f.exposure) } : {}),
      ...(f.cls ? { cls: f.cls } : {}),
      ...(f.team ? { team: f.team } : {}),
      ...(f.band !== undefined ? { band: bandName(f) } : {}),
      ...(f.phase ? { from: Math.round(f.phase[0] * 100), to: Math.round(f.phase[1] * 100) } : {}),
    },
  };
}

/** Places found by the scan (`scan.ts`), as insights: already tested, held to the rate and ranked there. */
const placeDetector: MassDetector = {
  id: 'place',
  skip: (ctx) => (!ctx.places ? 'mass.skip.noGrids' : null),
  run: (ctx) => {
    const run = ctx.places!;
    const insights: MassInsight[] = run.findings.map((f) => {
      const events = f.event === 'kd' ? ['kill', ...DEATH_EVENTS] : f.event === 'death' ? DEATH_EVENTS : f.event === 'win' ? ['position'] : [f.event];
      return {
        id: `mass:place:${f.id}`,
        detector: 'place',
        kind: placeKind(f),
        sentence: placeSentence(f),
        strength: f.score,
        effect: { measure: f.event === 'win' ? 'winOddsRatio' : f.type === 'share' ? 'kdOddsRatio' : 'rateRatio', value: f.shrunk, raw: fin(f.ratio), lo: fin(f.lo), hi: fin(f.hi) },
        confidence: { p: f.p, q: f.q, level: confidenceLevel(f.q), tests: run.tests, method: `${f.shape === 'zone' ? 'zone grown on half the matches, tested on the other half' : f.shape === 'time' ? 'space-time scan against each match\'s own spread of events' : f.shape === 'band' ? 'height band against the match\'s other bands' : `${f.shape} scan`}; quasi-likelihood at the dispersion of the matches, retested cluster-robust; BH over ${run.tests} regions` },
        evidence: {
          map: f.map, observed: f.observed, expected: f.expected, exposure: f.exposure, ratioRaw: f.ratio, z: f.zScore, dispersion: f.phi,
          giStar1: f.gi[0], giStar2: f.gi[1], giStar4: f.gi[2], localMoran: f.moran,
          obviousness: f.obviousness, hidden: f.hidden ? 1 : 0, peakShare: f.peakShare,
          matchesSeen: f.stability.seen, matchesHeld: f.stability.held, folds: `${f.stability.foldsAgree}/${f.stability.folds}`,
          shape: f.shape, cells: f.cells, cell: f.cell, measure: f.measure, ...(f.heldOut ? { heldOut: 1 } : {}),
        },
        place: { x: f.x, y: f.y, z: f.z, radius: f.radius, grid: 'coarse', cell: f.cell, ...(f.path ? { path: f.path.map(([x, z]) => [x, f.y, z] as [number, number, number]) } : {}) },
        time: null,
        filters: [{ by: 'category', column: 'Event type', values: events }, ...(f.team ? [{ by: 'team' as const, values: [f.team] }] : [])],
        subject: { ...(f.cls ? { vehicleClass: f.cls } : {}), ...(f.team ? { team: f.team } : {}), eventKind: f.event === 'kd' ? 'kill' : f.event },
        drill: { map: f.map, ...(f.matches.length ? { matches: f.matches } : {}), ...(f.cls ? { cls: f.cls } : {}) },
        region: { shape: f.shape, segs: f.segs, ...(f.path ? { path: f.path } : {}), ...(f.bandY ? { bandY: f.bandY } : {}), ...(f.phase ? { phase: f.phase } : {}), obviousness: f.obviousness, hidden: f.hidden },
      };
    });
    return { insights, tests: run.tests };
  },
};

/** A niche's conditions as words: its values, `·` between. */
export function nicheGroup(f: Pick<NicheFinding, 'conds'>): string {
  return f.conds.map((c) => c.label || c.v).join(' · ');
}

const nicheValue = (f: NicheFinding, v: number) => (f.type === 'share' ? pc(v) : r2(v));
const r2 = (v: number) => Math.round(v * 100) / 100;

/** A niche's sentence: its message key and values. */
export function nicheSentence(f: NicheFinding): { key: string; params: Record<string, number | string> } {
  return {
    key: `mass.say.niche.${f.target}${f.dir > 0 ? 'Up' : 'Down'}`,
    params: { group: nicheGroup(f), value: nicheValue(f, f.value), base: nicheValue(f, f.base), ratio: r2(f.dir > 0 ? f.shrunk : 1 / Math.max(1e-9, f.shrunk)), matches: f.matches, n: Math.round(f.n) },
  };
}

/** Niches found by the beam search (`niche.ts`), as insights. */
const nicheDetector: MassDetector = {
  id: 'niche',
  skip: (ctx) => (!ctx.niches ? 'mass.skip.other' : null),
  run: (ctx) => {
    const run = ctx.niches!;
    const insights: MassInsight[] = run.findings.map((f) => {
      const get = (k: string) => f.conds.find((c) => c.f === k)?.v;
      const kind = `niche.${f.target}`;
      return {
        id: `mass:niche:${f.id}`,
        detector: 'niche',
        kind,
        sentence: nicheSentence(f),
        strength: f.score,
        effect: { measure: f.target === 'kd' ? 'kdOddsRatio' : f.target === 'roundWin' || f.target === 'win' ? 'winOddsRatio' : f.type === 'share' ? 'shareRatio' : 'rateRatio', value: f.shrunk, raw: fin(f.ratio), lo: fin(f.lo), hi: fin(f.hi) },
        confidence: {
          p: f.p, q: f.q, level: confidenceLevel(f.q), tests: run.tests,
          method: f.target === 'roundWin'
            ? `beam search over ${f.table}; each round against its side's own win rate in its match (stratified); matches as clusters (robust variance); z scaled by the empirical null of ${NULL_RUNS} searches on results shuffled within each side of each match (scale ${f.nullScale ?? 1}); 4 of 5 folds agree; BH over ${run.tests} groups; ranked by lift times support`
            : `beam search over ${f.table}; matches as clusters (robust variance); shrunk by a prior of 20 outcomes; 4 of 5 folds agree; BH over ${run.tests} groups`,
        },
        evidence: {
          table: f.table, k: f.k, n: f.n, value: f.value, base: f.base, wracc: f.wracc, z: f.z, rows: f.rows, matches: f.matches, folds: `${f.foldsAgree}/${f.folds}`, conditions: f.conds.map((c) => `${c.f}=${c.label || c.v}`).join('; '),
          ...(f.nullScale !== undefined ? { nullScale: f.nullScale } : {}),
          ...(f.rounds?.length ? { rounds: f.rounds.slice(0, 12).map(([m, r]) => `${m}:${r}`).join(' ') } : {}),
        },
        place: null,
        time: null,
        filters: [],
        subject: { ...(get('class') ? { vehicleClass: get('class') } : {}), ...(get('side') ? { team: get('side') } : {}) },
        drill: { ...(get('map') ? { map: get('map') } : {}), ...(get('mode') ? { mode: get('mode') } : {}), ...(get('vehicle') ? { vehicle: get('vehicle') } : {}), ...(get('class') ? { cls: get('class') } : {}), ...(get('side') ? { team: get('side') } : {}), ...(f.matchIds?.length ? { matches: f.matchIds } : {}) },
        conds: f.conds,
      };
    });
    return { insights, tests: run.tests };
  },
};

export const MASS_DETECTORS: MassDetector[] = [balanceDetector, hotspotDetector, sideDetector, metaDetector, phaseDetector, placeDetector, nicheDetector];

const NAMES: InsightNames = { events: EVENT_KINDS, classes: VEHICLE_CLASSES, actors: ACTORS, teams: [], eventColumn: 'Event type', classColumn: 'Vehicle class', actorColumn: 'Player or AI' };

/** The single-dataset detectors on each map's summed grids. */
function gridDetectors(ctx: MassContext, runs: MassDetectorRun[]): MassInsight[] {
  const out: MassInsight[] = [];
  for (const [map, g] of ctx.grids) {
    const t0 = performance.now();
    const { job, teams } = g.toInsightJob();
    const r = finishInsights(job, { ...NAMES, teams }, { name: map, rows: 0, hasLevel: false });
    for (const d of r.detectors) runs.push({ id: `grid.${d.id}`, ran: d.ran, skipped: d.skipped, tests: d.tests, found: d.found, ms: d.ran ? d.ms : 0 });
    for (const i of r.insights) out.push({ ...i, id: `mass:${map}:${i.id}`, detector: `grid.${i.detector}`, evidence: { ...i.evidence, map, matches: g.matches }, drill: { map } });
    runs.push({ id: 'grid.all', ran: true, tests: 0, found: r.insights.length, ms: Math.round(performance.now() - t0) });
  }
  return out;
}

export function massInsights(ctx: MassContext, extra: MassDetector[] = []): MassReport {
  const t0 = performance.now();
  const runs: MassDetectorRun[] = [];
  const all: MassInsight[] = [];
  for (const d of [...MASS_DETECTORS, ...extra]) {
    const s = performance.now();
    const why = d.skip(ctx);
    if (why) {
      runs.push({ id: d.id, ran: false, skipped: why, tests: 0, found: 0, ms: 0 });
      continue;
    }
    const r = d.run(ctx);
    all.push(...r.insights);
    runs.push({ id: d.id, ran: true, tests: r.tests, found: r.insights.length, ms: Math.round(performance.now() - s) });
  }
  if (ctx.grids.size) all.push(...gridDetectors(ctx, runs));
  all.sort((a, b) => b.strength - a.strength);
  // A few of each kind first, as the single-dataset report does.
  const seen = new Map<string, number>();
  const first: MassInsight[] = [];
  const rest: MassInsight[] = [];
  for (const i of all) {
    const n = seen.get(i.kind) ?? 0;
    seen.set(i.kind, n + 1);
    (n < 3 ? first : rest).push(i);
  }
  const s = ctx.store;
  let matches = 0, hours = 0, from = Infinity, to = -Infinity;
  const games = new Set<string>();
  const maps = new Set<number>();
  for (let i = 0; i < ctx.mask.length; i++) {
    if (!ctx.mask[i]) continue;
    matches++;
    hours += s.m.duration.get(i) / 3600;
    games.add(s.str(s.m.game.get(i)));
    maps.add(s.m.map.get(i));
    const st = s.m.started.get(i);
    if (Number.isFinite(st)) {
      from = Math.min(from, st);
      to = Math.max(to, st);
    }
  }
  const players = new Set<number>();
  for (let r = 0; r < s.p.match.n; r++) if (ctx.mask[s.p.match.a[r]]) players.add(s.p.id.a[r]);
  return {
    schema: 'heat3d.mass/1',
    dataset: {
      matches,
      games: [...games],
      maps: maps.size,
      hours: r3(hours),
      players: players.size,
      from: Number.isFinite(from) ? new Date(from * 1000).toISOString() : null,
      to: Number.isFinite(to) ? new Date(to * 1000).toISOString() : null,
    },
    filter: ctx.filter,
    detectors: runs,
    insights: [...first, ...rest].slice(0, MASS_MAX),
    places: ctx.places ?? null,
    niches: ctx.niches ?? null,
    fdr: MASS_FDR,
    elapsedMs: Math.round(performance.now() - t0),
  };
}

/** The mass report as a model reads it (the same shape `insights/seam.ts` gives a single report). */
export function massReportForModel(r: MassReport, say: (key: string, params: Record<string, number | string>) => string) {
  return {
    schema: r.schema,
    dataset: r.dataset,
    filter: r.filter,
    fdr: r.fdr,
    detectors: r.detectors.map(({ id, ran, skipped, tests, found }) => ({ id, ran, skipped, tests, found })),
    insights: r.insights.map((i) => ({
      id: i.id,
      kind: i.kind,
      text: say(i.sentence.key, i.sentence.params),
      strength: i.strength,
      effect: i.effect,
      confidence: i.confidence,
      evidence: i.evidence,
      place: i.place,
      time: i.time,
      filters: i.filters,
      subject: i.subject,
      drill: { ...i.drill, ...(i.drill.matches ? { matches: i.drill.matches.length } : {}) },
      ...(i.region ? { region: { shape: i.region.shape, hidden: i.region.hidden, obviousness: i.region.obviousness, ...(i.region.bandY ? { heights: i.region.bandY } : {}), ...(i.region.phase ? { phase: i.region.phase } : {}) } } : {}),
      ...(i.conds ? { conditions: i.conds } : {}),
    })),
    // Stage B beyond the insights: how much was tried, and every hidden place (no outlines: numbers a model reads).
    ...(r.places ? { places: { tests: r.places.tests, found: r.places.findings.length, hidden: r.places.findings.filter((f) => f.hidden).length, maps: r.places.maps.map(({ map, matches, kept }) => ({ map, matches, kept })) } } : {}),
    ...(r.niches ? { niches: { tests: r.niches.tests, found: r.niches.findings.length } } : {}),
  };
}

/** The matches an insight's drill-down loads, within the filter. */
export function insightMatches(s: MassStore, filter: MassFilter, ins: MassInsight): number[] {
  const { map, mode, ...d } = ins.drill;
  const f: MassFilter = { ...filter, ...(map ? { maps: [map] } : {}), ...(mode ? { modes: [mode] } : {}) };
  return drillMatches(s, s.matchMask(f), d);
}
