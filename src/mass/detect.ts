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
import { balance, drillMatches, phases, sides, type MassDrill, type MassFilter, type MassStore } from './store';
import { GRID_KINDS, PHASE_BINS } from './types';

export const MASS_FDR = 0.05;
export const MASS_MAX = 80;
/** Fewest lives (or matches) a group needs to be tested. */
const MIN_UNITS = 20;
const MIN_SEEN = 8;

export type MassDetectorId = 'balance' | 'hotspot' | 'side' | 'meta' | 'phase' | `grid.${string}`;

/** An insight of the mass report: the single-dataset shape, with what loads its evidence. */
export interface MassInsight extends Omit<Insight, 'detector'> {
  detector: MassDetectorId;
  /** The matches it rests on, as a drill-down within the report's filter (and map). */
  drill: MassDrill & { map?: string; mode?: string };
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

const metaDetector: MassDetector = {
  id: 'meta',
  skip: (ctx) => {
    let dated = 0;
    for (let i = 0; i < ctx.mask.length; i++) if (ctx.mask[i] && Number.isFinite(ctx.store.m.started.get(i))) dated++;
    return dated < 2 * MIN_SEEN ? 'mass.skip.fewDates' : null;
  },
  run: (ctx) => {
    const s = ctx.store;
    const dates: number[] = [];
    for (let i = 0; i < ctx.mask.length; i++) if (ctx.mask[i] && Number.isFinite(s.m.started.get(i))) dates.push(s.m.started.get(i));
    dates.sort((a, b) => a - b);
    const mid = dates[Math.floor(dates.length / 2)];
    const early = new Uint8Array(ctx.mask.length);
    const late = new Uint8Array(ctx.mask.length);
    for (let i = 0; i < ctx.mask.length; i++) {
      const st = s.m.started.get(i);
      if (!ctx.mask[i] || !Number.isFinite(st)) continue;
      (st < mid ? early : late)[i] = 1;
    }
    // Per map, so a change in which maps were played is no change in the meta; usage counts the lives players chose.
    const a = balance(s, early, 'vehicle', 'map');
    const b = balance(s, late, 'vehicle', 'map');
    const sum = (rows: typeof a) => {
      const m = new Map<string, number>();
      for (const r of rows) m.set(r.split, (m.get(r.split) ?? 0) + r.players);
      return m;
    };
    const ta = sum(a), tb = sum(b);
    const byKey = new Map(a.map((r) => [`${r.key}${r.split}`, r]));
    const drafts: Draft[] = [];
    let tests = 0;
    const day = (sec: number) => new Date(sec * 1000).toISOString().slice(0, 10);
    for (const r of b) {
      const e = byKey.get(`${r.key}${r.split}`);
      const pe = e?.players ?? 0;
      const na = ta.get(r.split) ?? 0;
      const nb = tb.get(r.split) ?? 0;
      if (!r.split || r.players + pe < MIN_UNITS || na < MIN_UNITS || nb < MIN_UNITS) continue;
      const params = { vehicle: r.label || r.key, map: r.split, since: day(mid) };
      tests++;
      drafts.push({
        detector: 'meta', kind: 'meta.usage', key: `${r.split}:${r.key}`,
        test: shareTest(r.players, nb, pe, na),
        params: { ...params, before: pc(pe / na), after: pc(r.players / nb) },
        evidence: { livesLate: r.players, livesEarly: pe, totalLate: nb, totalEarly: na, split: day(mid), map: r.split },
        drill: { vehicle: r.key, map: r.split }, subject: { vehicleClass: r.cls },
        method: 'exact binomial on its share of player lives on the map, later half of the dates against the earlier; BH',
      });
      if (e && r.players >= MIN_UNITS && e.players >= MIN_UNITS && r.kills + r.deaths >= 10 && e.kills + e.deaths >= 10) {
        tests++;
        drafts.push({
          detector: 'meta', kind: 'meta.kd', key: `${r.split}:${r.key}`,
          test: shareTest(r.kills, r.kills + r.deaths, e.kills, e.kills + e.deaths),
          params: { ...params, before: r3(e.kd), after: r3(r.kd) },
          evidence: { killsLate: r.kills, deathsLate: r.deaths, killsEarly: e.kills, deathsEarly: e.deaths, split: day(mid), map: r.split },
          drill: { vehicle: r.key, map: r.split }, subject: { vehicleClass: r.cls },
          method: 'exact binomial on kills of kills + deaths on the map, later half against the earlier; BH',
        });
      }
    }
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

export const MASS_DETECTORS: MassDetector[] = [balanceDetector, hotspotDetector, sideDetector, metaDetector, phaseDetector];

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
      drill: i.drill,
    })),
  };
}

/** The matches an insight's drill-down loads, within the filter. */
export function insightMatches(s: MassStore, filter: MassFilter, ins: MassInsight): number[] {
  const { map, mode, ...d } = ins.drill;
  const f: MassFilter = { ...filter, ...(map ? { maps: [map] } : {}), ...(mode ? { modes: [mode] } : {}) };
  return drillMatches(s, s.matchMask(f), d);
}
