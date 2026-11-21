/**
 * The built-in detectors. Each reads the pass's tables (`pass.ts`) and says
 * what stands out against the map's own baseline, never a raw count alone:
 * rates per time spent (or per spawn, per crossing), each place or group
 * tested exactly against the rest of the map (`stats.ts`), the effect shrunk
 * towards "like the rest" so a handful of events cannot top the list, and the
 * false discovery rate held over every place a detector tried.
 *
 * A detector is a function of the tables alone: no dataset, no DOM, no
 * language. New ones join `DETECTOR_LIST`; the report and the panel take them
 * as they come.
 */

import { APPROACH, COARSE, EARLY, MID, speedEdge, SPEED_BINS, type InsightJob } from './pass';
import { bhAdjust, confidenceLevel, quantileSorted, rateTest, shareTest, strengthOf, type RateTest, type ShareTest } from './stats';
import type { DetectorId, Insight, InsightFilter, InsightPlace, InsightSubject } from './types';
import { currencyUnit, parseValueColumn } from '../data/costs/columns';
import { midCellsOf } from './consistency';

/** Names the detectors speak in: the taxonomies and the canonical columns (kept out of the worker's imports). */
export interface InsightNames {
  events: readonly string[];
  classes: readonly string[];
  actors: readonly string[];
  teams: readonly string[];
  eventColumn: string;
  classColumn: string;
  actorColumn: string;
}

export interface DetectContext {
  job: InsightJob;
  names: InsightNames;
  /** False discovery rate the findings are held to. */
  fdr: number;
  /** Mean height per mid and coarse cell (from the fine cells' rows). */
  midY: Float64Array;
  coarseY: Float64Array;
}

export interface DetectorResult {
  insights: Insight[];
  tests: number;
}

export interface Detector {
  id: DetectorId;
  /** Null when the data has what the detector needs, else the `insights.skip.*` reason. */
  skip: (ctx: DetectContext) => string | null;
  run: (ctx: DetectContext) => DetectorResult;
}

// ---------------------------------------------------------------------------
// Shared pieces

const LARGE = 1.5;
const SMALL = 1 / LARGE;

type Level = 'fine' | 'mid' | 'coarse';
const STEP: Record<Level, number> = { fine: 1, mid: MID, coarse: COARSE };

function cellPlace(ctx: DetectContext, level: Level, i: number, y?: number, radius?: number): InsightPlace {
  const g = ctx.job.meta.grid;
  const size = g.f * STEP[level];
  const w = level === 'fine' ? g.nx : level === 'mid' ? g.mx : g.cx;
  const ix = i % w;
  const iz = Math.floor(i / w);
  const yy = y ?? (level === 'coarse' ? ctx.coarseY[i] : level === 'mid' ? ctx.midY[i] : NaN);
  return {
    x: g.x0 + (ix + 0.5) * size,
    y: Number.isFinite(yy) ? yy : 0,
    z: g.z0 + (iz + 0.5) * size,
    radius: radius ?? size * 0.71,
    grid: level,
    cell: size,
  };
}

function eventsAt(ctx: DetectContext, kind: number, mi: number): number {
  const M = ctx.job.meta.grid.mx * ctx.job.meta.grid.mz;
  return kind >= 0 ? ctx.job.mEvents[kind * M + mi] : 0;
}

function round(v: number, d = 3): number {
  if (!Number.isFinite(v)) return v;
  const k = Math.pow(10, d);
  return Math.round(v * k) / k;
}

/** JSON has no infinity: an unbounded end is null. */
const finite = (v: number): number | null => (Number.isFinite(v) ? round(v, 4) : null);

interface Draft {
  kind: string;
  key: string;
  test: RateTest | ShareTest;
  q: number;
  tests: number;
  oneSided: boolean;
  measure: Insight['effect']['measure'];
  params: Record<string, number | string>;
  evidence: Record<string, number | string>;
  place: InsightPlace | null;
  filters: InsightFilter[];
  subject?: InsightSubject;
  time?: Insight['time'];
  detector: DetectorId;
  method: string;
}

function build(d: Draft): Insight {
  const t = d.test;
  const p = d.oneSided ? (t.shrunk >= 1 ? t.pUpper : t.pLower) : t.p;
  return {
    id: `${d.detector}:${d.kind}:${d.key}`,
    detector: d.detector,
    kind: d.kind,
    sentence: { key: `insights.say.${d.kind}`, params: { ratio: round(t.shrunk >= 1 ? t.shrunk : 1 / t.shrunk, 2), ...d.params } },
    strength: round(strengthOf(t.shrunk, d.q), 4),
    effect: { measure: d.measure, value: round(t.shrunk, 4), raw: finite(t.raw), lo: finite(t.lo), hi: finite(t.hi) },
    confidence: { p, q: d.q, level: confidenceLevel(d.q), tests: d.tests, method: d.method },
    evidence: d.evidence,
    place: d.place,
    time: d.time ?? null,
    filters: d.filters,
    subject: d.subject ?? {},
  };
}

/** Strongest first, dropping any within `reach` cells of a stronger one of the same group. */
function suppress<T extends { strength: number; cell: number; group: string }>(items: T[], w: number, reach: number, cap: number): T[] {
  items.sort((a, b) => b.strength - a.strength);
  const kept: T[] = [];
  for (const it of items) {
    const x = it.cell % w;
    const z = Math.floor(it.cell / w);
    const near = kept.some((k) => k.group === it.group && Math.abs((k.cell % w) - x) <= reach && Math.abs(Math.floor(k.cell / w) - z) <= reach);
    if (!near) kept.push(it);
    if (kept.length >= cap) break;
  }
  return kept;
}

/** Connected groups (8-neighbours within `reach` cells) of the marked cells. */
function components(cells: number[], w: number, reach = 1): number[][] {
  const set = new Set(cells);
  const seen = new Set<number>();
  const out: number[][] = [];
  for (const c of cells) {
    if (seen.has(c)) continue;
    const comp: number[] = [];
    const stack = [c];
    seen.add(c);
    while (stack.length) {
      const a = stack.pop()!;
      comp.push(a);
      const ax = a % w;
      const az = Math.floor(a / w);
      for (let dz = -reach; dz <= reach; dz++)
        for (let dx = -reach; dx <= reach; dx++) {
          const bx = ax + dx;
          if (bx < 0 || bx >= w) continue;
          const b = (az + dz) * w + bx;
          if (set.has(b) && !seen.has(b)) {
            seen.add(b);
            stack.push(b);
          }
        }
    }
    out.push(comp);
  }
  return out;
}

/**
 * The peaks of a group of cells: a found area can sprawl over half a map when
 * its neighbouring cells all pass the test, and a volume that size says
 * nothing. Each peak is the best remaining cell and its neighbours (within
 * `reach` cells) that score at least `keep` of it, so each place is one hot
 * spot, a few cells across at most. Strongest first, at most `cap`.
 */
export function peaks(cells: number[], w: number, score: (c: number) => number, cap = 4, reach = 1, keep = 0.3): number[][] {
  const left = new Set(cells.filter((c) => score(c) > 0));
  const out: number[][] = [];
  while (left.size && out.length < cap) {
    let seed = -1;
    let best = -Infinity;
    for (const c of left) {
      const v = score(c);
      if (v > best) {
        best = v;
        seed = c;
      }
    }
    const sx = seed % w;
    const sz = Math.floor(seed / w);
    const region: number[] = [];
    for (const c of left) {
      if (Math.abs((c % w) - sx) <= reach && Math.abs(Math.floor(c / w) - sz) <= reach && (c === seed || score(c) >= keep * best)) region.push(c);
    }
    for (const c of region) left.delete(c);
    // The ring round a peak is its own slope, not a second hot spot.
    for (const c of [...left]) if (Math.abs((c % w) - sx) <= reach + 1 && Math.abs(Math.floor(c / w) - sz) <= reach + 1) left.delete(c);
    out.push(region);
  }
  return out;
}

/** A group of mid cells as one place: presence-weighted centre, radius over them all. */
function groupPlace(ctx: DetectContext, cells: number[], weight: (c: number) => number): InsightPlace {
  let sw = 0;
  let sx = 0;
  let sy = 0;
  let sz = 0;
  const pts = cells.map((c) => cellPlace(ctx, 'mid', c));
  pts.forEach((p, i) => {
    const w = Math.max(1e-9, weight(cells[i]));
    sw += w;
    sx += p.x * w;
    sy += p.y * w;
    sz += p.z * w;
  });
  const x = sx / sw;
  const z = sz / sw;
  let r = 0;
  for (const p of pts) r = Math.max(r, Math.hypot(p.x - x, p.z - z) + p.radius);
  return { x, y: sy / sw, z, radius: r, grid: 'mid', cell: pts[0].cell };
}

/** Points of a group along its longest spread (a route's order). */
function along(ctx: DetectContext, cells: number[]): [number, number, number][] {
  const pts = cells.map((c) => cellPlace(ctx, 'mid', c));
  const mx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
  const mz = pts.reduce((a, p) => a + p.z, 0) / pts.length;
  let sxx = 0;
  let szz = 0;
  let sxz = 0;
  for (const p of pts) {
    sxx += (p.x - mx) ** 2;
    szz += (p.z - mz) ** 2;
    sxz += (p.x - mx) * (p.z - mz);
  }
  const ang = 0.5 * Math.atan2(2 * sxz, sxx - szz);
  const ux = Math.cos(ang);
  const uz = Math.sin(ang);
  return pts
    .map((p) => ({ p, s: (p.x - mx) * ux + (p.z - mz) * uz }))
    .sort((a, b) => a.s - b.s)
    .map(({ p }) => [round(p.x, 2), round(p.y, 2), round(p.z, 2)]);
}

const evFilter = (ctx: DetectContext, ...kinds: string[]): InsightFilter => ({ by: 'category', column: ctx.names.eventColumn, values: kinds });

function placeKey(p: InsightPlace | null): string {
  return p ? `${Math.round(p.x)},${Math.round(p.z)}` : 'map';
}

/** A side makes at least this share of a place's kills (or deaths) for the place to be told as that side's. */
const SIDE_SHARE = 0.65;

/**
 * The side that makes most of a place's kills or deaths, where one does and
 * there are enough of them to say: on most maps a side is a side of the map,
 * and "a power position" means little until it says for whom.
 */
function sideOf(ctx: DetectContext, cells: readonly number[], of: 'kills' | 'deaths'): Insight['side'] {
  const { job, names } = ctx;
  const M = job.meta.grid.mx * job.meta.grid.mz;
  const arr = of === 'kills' ? job.mTeamKills : job.mTeamDeaths;
  const T = Math.floor(arr.length / Math.max(1, M));
  if (T < 2) return undefined;
  let all = 0;
  let best = -1;
  let bestN = 0;
  for (let t = 0; t < T; t++) {
    let n = 0;
    for (const c of cells) n += arr[t * M + c];
    all += n;
    if (n > bestN) {
      bestN = n;
      best = t;
    }
  }
  if (all < 5 || best < 0 || bestN / all < SIDE_SHARE || !names.teams[best]) return undefined;
  return { team: names.teams[best], share: round(bestN / all, 3), of };
}

// ---------------------------------------------------------------------------
// 1. Power positions: kill-to-death odds or survival far above the map's

const power: Detector = {
  id: 'power',
  skip: (ctx) => {
    const m = ctx.job.meta;
    if (!m.eventMap || m.kill < 0 || m.death < 0) return 'insights.skip.noEvents';
    if (ctx.job.events[m.kill] + ctx.job.events[m.death] < 20) return 'insights.skip.fewKills';
    return null;
  },
  run: (ctx) => {
    const { job } = ctx;
    const m = job.meta;
    const g = m.grid;
    const M = g.mx * g.mz;
    const K = job.events[m.kill];
    const D = job.events[m.death];
    const T = job.presence;
    const tests: { mi: number; kind: 'kd' | 'safe'; test: RateTest | ShareTest; p: number }[] = [];
    for (let mi = 0; mi < M; mi++) {
      const k = eventsAt(ctx, m.kill, mi);
      const d = eventsAt(ctx, m.death, mi);
      if (k + d >= 3 && K > 0) {
        const s = shareTest(k, k + d, K - k, K + D - k - d);
        tests.push({ mi, kind: 'kd', test: s, p: s.pUpper });
      }
      const pres = job.mPres[mi];
      if (pres > 0 && T > pres && D > 0) {
        const r = rateTest(d, pres, D - d, T - pres);
        if (r.expected >= 3) tests.push({ mi, kind: 'safe', test: r, p: r.pLower });
      }
    }
    const q = bhAdjust(tests.map((t) => t.p));
    const found: (Insight & { cell: number; group: string })[] = [];
    tests.forEach((t, i) => {
      if (!(q[i] < ctx.fdr)) return;
      if (t.kind === 'kd' ? t.test.shrunk < LARGE : t.test.shrunk > SMALL) return;
      const k = eventsAt(ctx, m.kill, t.mi);
      const d = eventsAt(ctx, m.death, t.mi);
      let place = cellPlace(ctx, 'mid', t.mi, undefined, g.f * MID * 0.71);
      if (t.kind === 'kd') {
        // Pin it down to the fine cell that holds it best, shrunk towards the mid cell.
        const pm = k / (k + d);
        let best = -1;
        let bestS = -1;
        const mx0 = (t.mi % g.mx) * MID;
        const mz0 = Math.floor(t.mi / g.mx) * MID;
        for (let dz = 0; dz < MID; dz++)
          for (let dx = 0; dx < MID; dx++) {
            const fx = mx0 + dx;
            const fz = mz0 + dz;
            if (fx >= g.nx || fz >= g.nz) continue;
            const fi = fz * g.nx + fx;
            const kf = job.fKills[fi];
            const nf = kf + job.fDeaths[fi];
            if (kf < 2) continue;
            const s = (kf + 5 * pm) / (nf + 5) + kf * 1e-9;
            if (s > bestS) {
              bestS = s;
              best = fi;
            }
          }
        if (best >= 0) place = cellPlace(ctx, 'fine', best, job.fKillY[best] / job.fKills[best], g.f);
      }
      const pres = job.mPres[t.mi];
      found.push({
        ...build({
          detector: 'power',
          kind: t.kind === 'kd' ? 'power.kd' : 'power.safe',
          key: placeKey(place),
          test: t.test,
          q: q[i],
          tests: tests.length,
          oneSided: true,
          measure: t.kind === 'kd' ? 'kdOddsRatio' : 'rateRatio',
          method: t.kind === 'kd' ? 'exact binomial, kill share vs rest of map, BH' : 'exact Poisson rate ratio vs rest of map, BH',
          params: { kills: k, deaths: d, timeSecs: round(pres, 1) },
          evidence: { kills: k, deaths: d, presence: round(pres, 1), mapKills: K, mapDeaths: D, mapPresence: round(T, 1) },
          place,
          filters: [evFilter(ctx, 'kill', 'death')],
        }),
        cells: [t.mi],
        ...(t.kind === 'kd' ? { side: sideOf(ctx, [t.mi], 'kills') } : {}),
        cell: t.mi,
        group: t.kind,
      });
    });
    return { insights: suppress(found, g.mx, 1, 12), tests: tests.length };
  },
};

// ---------------------------------------------------------------------------
// 2. Hot and cold zones: each event's rate per time spent, against the map's

const SKIP_ZONE = new Set(['position', 'message', 'other']);

const zones: Detector = {
  id: 'zones',
  skip: (ctx) => (!ctx.job.meta.eventMap ? 'insights.skip.noEvents' : ctx.job.presence <= 0 ? 'insights.skip.noTime' : null),
  run: (ctx) => {
    const { job, names } = ctx;
    const g = job.meta.grid;
    const M = g.mx * g.mz;
    const T = job.presence;
    const tests: { kind: number; mi: number; test: RateTest }[] = [];
    for (let kind = 0; kind < names.events.length; kind++) {
      const tot = job.events[kind];
      if (tot < 20 || SKIP_ZONE.has(names.events[kind])) continue;
      for (let mi = 0; mi < M; mi++) {
        const pres = job.mPres[mi];
        if (!(pres > 0) || pres >= T) continue;
        const a = eventsAt(ctx, kind, mi);
        const r = rateTest(a, pres, tot - a, T - pres);
        if (a >= 3 || r.expected >= 3) tests.push({ kind, mi, test: r });
      }
    }
    const q = bhAdjust(tests.map((t) => t.test.p));
    const groups = new Map<string, { kind: number; hot: boolean; cells: number[]; q: Map<number, number> }>();
    tests.forEach((t, i) => {
      if (!(q[i] < ctx.fdr)) return;
      const hot = t.test.shrunk >= LARGE;
      if (!hot && t.test.shrunk > SMALL) return;
      const key = `${t.kind}:${hot}`;
      let gr = groups.get(key);
      if (!gr) groups.set(key, (gr = { kind: t.kind, hot, cells: [], q: new Map() }));
      gr.cells.push(t.mi);
      gr.q.set(t.mi, q[i]);
    });
    const out: Insight[] = [];
    for (const gr of groups.values()) {
      const kindName = names.events[gr.kind];
      const tot = job.events[gr.kind];
      // Each connected area split into its peaks: the excess over what the time spent predicts, per cell.
      const excess = (c: number) => {
        const e = (tot * job.mPres[c]) / T;
        const a = eventsAt(ctx, gr.kind, c);
        return gr.hot ? a - e : e - a;
      };
      const zs = components(gr.cells, g.mx).flatMap((comp) => peaks(comp, g.mx, excess)).map((cells) => {
        let a = 0;
        let pres = 0;
        let qq = 1;
        for (const c of cells) {
          a += eventsAt(ctx, gr.kind, c);
          pres += job.mPres[c];
          qq = Math.min(qq, gr.q.get(c)!);
        }
        const r = rateTest(a, pres, tot - a, T - pres);
        const place = groupPlace(ctx, cells, (c) => job.mPres[c]);
        const ins = build({
          detector: 'zones',
          kind: gr.hot ? 'zones.hot' : 'zones.cold',
          key: `${kindName}:${placeKey(place)}`,
          test: r,
          q: qq,
          tests: tests.length,
          oneSided: false,
          measure: 'rateRatio',
          method: 'exact Poisson rate ratio per presence vs rest of map, BH; adjacent cells merged',
          params: { kind: kindName, count: a, expected: round(r.expected, 1) },
          evidence: { count: a, expected: round(r.expected, 1), presence: round(pres, 1), cells: cells.length, mapCount: tot, mapPresence: round(T, 1) },
          place,
          filters: [evFilter(ctx, kindName)],
          subject: { eventKind: kindName },
        });
        // An absence ranks below a presence of the same size: quiet ground is
        // often only where nobody fights (a spawn, an airfield).
        if (!gr.hot) ins.strength = round(ins.strength * 0.6, 4);
        ins.cells = cells;
        if (gr.hot && (kindName === 'kill' || kindName === 'death')) ins.side = sideOf(ctx, cells, kindName === 'kill' ? 'kills' : 'deaths');
        return ins;
      });
      zs.sort((a, b) => b.strength - a.strength);
      out.push(...zs.slice(0, 4));
    }
    return { insights: out, tests: tests.length };
  },
};

// ---------------------------------------------------------------------------
// 3. Open ground against cover: deaths per time spent by the level's geometry
// density, or without a level by how fast the dying were moving

function bands(values: number[], weights: number[]): number[] {
  // Presence-weighted thirds: the band of each value.
  const order = values.map((_, i) => i).sort((a, b) => values[a] - values[b]);
  const total = weights.reduce((a, b) => a + b, 0);
  const band = new Array<number>(values.length).fill(0);
  let run = 0;
  for (const i of order) {
    band[i] = Math.min(2, Math.floor((run / total) * 3));
    run += weights[i];
  }
  return band;
}

const cover: Detector = {
  id: 'cover',
  skip: (ctx) => {
    const m = ctx.job.meta;
    if (!m.eventMap || m.death < 0) return 'insights.skip.noEvents';
    if (ctx.job.events[m.death] < 20) return 'insights.skip.fewKills';
    return null;
  },
  run: (ctx) => {
    const { job } = ctx;
    const m = job.meta;
    const g = m.grid;
    const M = g.mx * g.mz;
    const cands: { kind: 'level' | 'speed'; test: RateTest; ev: Record<string, number> }[] = [];
    if (job.levelVerts > 0) {
      const cells: number[] = [];
      for (let mi = 0; mi < M; mi++) if (job.mPres[mi] > 0) cells.push(mi);
      const b = bands(
        cells.map((c) => job.mLevel[c]),
        cells.map((c) => job.mPres[c]),
      );
      const d = [0, 0, 0];
      const t = [0, 0, 0];
      cells.forEach((c, i) => {
        d[b[i]] += eventsAt(ctx, m.death, c);
        t[b[i]] += job.mPres[c];
      });
      // Two of the three bands compared: at least 20 deaths between them, or the factor is chance.
      if (d[0] + d[2] >= 20 && t[0] > 0 && t[2] > 0)
        cands.push({ kind: 'level', test: rateTest(d[0], t[0], d[2], t[2]), ev: { deathsOpen: d[0], presenceOpen: round(t[0], 1), deathsMid: d[1], presenceMid: round(t[1], 1), deathsDense: d[2], presenceDense: round(t[2], 1) } });
    }
    {
      const idx = Array.from({ length: SPEED_BINS }, (_, i) => i).filter((i) => job.speedPres[i] > 0);
      const b = bands(idx, idx.map((i) => job.speedPres[i]));
      const d = [0, 0, 0];
      const t = [0, 0, 0];
      let slowTop = 0;
      let fastBottom = Infinity;
      idx.forEach((bin, i) => {
        d[b[i]] += job.speedDeaths[bin];
        t[b[i]] += job.speedPres[bin];
        if (b[i] === 0) slowTop = Math.max(slowTop, speedEdge(bin + 1));
        if (b[i] === 2) fastBottom = Math.min(fastBottom, speedEdge(bin));
      });
      if (d[0] + d[2] >= 10 && t[0] > 0 && t[2] > 0)
        cands.push({ kind: 'speed', test: rateTest(d[0], t[0], d[2], t[2]), ev: { deathsSlow: d[0], presenceSlow: round(t[0], 1), deathsFast: d[2], presenceFast: round(t[2], 1), slowBelow: round(slowTop, 2), fastAbove: round(fastBottom, 2) } });
    }
    const q = bhAdjust(cands.map((c) => c.test.p));
    const out: Insight[] = [];
    cands.forEach((c, i) => {
      if (!(q[i] < ctx.fdr) || (c.test.shrunk < 1.25 && c.test.shrunk > 0.8)) return;
      const up = c.test.shrunk >= 1;
      const kind = c.kind === 'level' ? (up ? 'cover.open' : 'cover.dense') : up ? 'cover.slow' : 'cover.fast';
      out.push(
        build({
          detector: 'cover',
          kind,
          key: c.kind,
          test: c.test,
          q: q[i],
          tests: cands.length,
          oneSided: false,
          measure: 'rateRatio',
          method:
            c.kind === 'level'
              ? 'deaths per presence, most open vs densest third of the ground by level geometry, exact Poisson rate ratio'
              : 'deaths per presence in play (away from the cell the life started in), slowest vs fastest third of that time by speed, exact Poisson rate ratio',
          params: c.kind === 'speed' ? { slowBelow: c.ev.slowBelow, fastAbove: c.ev.fastAbove } : {},
          evidence: c.ev,
          place: null,
          filters: [evFilter(ctx, 'death')],
        }),
      );
    });
    return { insights: out, tests: cands.length };
  },
};

// ---------------------------------------------------------------------------
// 4. Spawns: early kills, early deaths and first contact per spawn area

const spawn: Detector = {
  id: 'spawn',
  skip: (ctx) => {
    const m = ctx.job.meta;
    if (!m.hasTime || m.persons === 0) return 'insights.skip.noTracks';
    if (ctx.job.lives.n < 20) return 'insights.skip.fewSpawns';
    return null;
  },
  run: (ctx) => {
    const { job, names } = ctx;
    const lv = job.lives;
    const g = job.meta.grid;
    const N = lv.n;
    // AI lives where there are players' too: an AI wave sent to die (bombers, targets) is no spawn to learn from.
    let human = 0;
    for (let i = 0; i < N; i++) if (!lv.ai[i]) human++;
    const counts = (i: number) => human === 0 || human === N || !lv.ai[i];
    // Spawn areas: coarse cells many lives start in, merged with their near
    // neighbours; by side instead where the areas hold under half the spawns.
    const R = COARSE / MID;
    const coarseOf = (mi: number) => Math.floor(Math.floor(mi / g.mx) / R) * g.cx + Math.floor((mi % g.mx) / R);
    const perCell = new Map<number, number>();
    for (let i = 0; i < N; i++) {
      if (!counts(i)) continue;
      const c = coarseOf(lv.cell[i]);
      perCell.set(c, (perCell.get(c) ?? 0) + 1);
    }
    const floor = Math.max(3, N * 0.005);
    const hot = [...perCell].filter(([, n]) => n >= floor).map(([c]) => c);
    const areas = components(hot, g.cx, 1);
    const groupOf = new Map<number, number>();
    areas.forEach((cells, a) => cells.forEach((c) => groupOf.set(c, a)));
    let covered = 0;
    for (const c of hot) covered += perCell.get(c)!;
    const byTeam = areas.length < 2 || covered < N / 2;
    const G = byTeam ? names.teams.length : areas.length;
    if (G < 2) return { insights: [], tests: 0 };
    const n = new Float64Array(G);
    const ek = new Float64Array(G);
    const ed = new Float64Array(G);
    const sx = new Float64Array(G);
    const sy = new Float64Array(G);
    const sz = new Float64Array(G);
    const teamVotes = Array.from({ length: G }, () => new Map<number, number>());
    const contacts: number[][] = Array.from({ length: G }, () => []);
    const all: number[] = [];
    for (let i = 0; i < N; i++) {
      if (!counts(i)) continue;
      const gi = byTeam ? lv.team[i] : groupOf.get(coarseOf(lv.cell[i])) ?? -1;
      if (gi < 0 || gi >= G) continue;
      n[gi]++;
      ek[gi] += lv.earlyKills[i];
      ed[gi] += lv.earlyDeath[i];
      sx[gi] += lv.x[i];
      sy[gi] += lv.y[i];
      sz[gi] += lv.z[i];
      teamVotes[gi].set(lv.team[i], (teamVotes[gi].get(lv.team[i]) ?? 0) + 1);
      const c = lv.contact[i];
      if (c === c) {
        contacts[gi].push(c);
        all.push(c);
      }
    }
    let NT = 0;
    let EK = 0;
    let ED = 0;
    for (let gi = 0; gi < G; gi++) {
      NT += n[gi];
      EK += ek[gi];
      ED += ed[gi];
    }
    const tests: { gi: number; kind: 'strong' | 'trap' | 'safe'; test: RateTest; p: number }[] = [];
    for (let gi = 0; gi < G; gi++) {
      if (n[gi] < 5 || n[gi] >= NT) continue;
      if (EK >= 10) {
        const r = rateTest(ek[gi], n[gi], EK - ek[gi], NT - n[gi]);
        tests.push({ gi, kind: 'strong', test: r, p: r.p });
      }
      if (ED >= 10) {
        const r = rateTest(ed[gi], n[gi], ED - ed[gi], NT - n[gi]);
        tests.push({ gi, kind: r.shrunk >= 1 ? 'trap' : 'safe', test: r, p: r.p });
      }
    }
    const q = bhAdjust(tests.map((t) => t.p));
    all.sort((a, b) => a - b);
    const out: Insight[] = [];
    tests.forEach((t, i) => {
      if (!(q[i] < ctx.fdr)) return;
      if (t.kind === 'strong' ? t.test.shrunk < LARGE : t.kind === 'trap' ? t.test.shrunk < LARGE : t.test.shrunk > SMALL) return;
      const gi = t.gi;
      let team = byTeam ? gi : -1;
      if (!byTeam) {
        let best = 0;
        for (const [tm, c] of teamVotes[gi])
          if (c > best) {
            best = c;
            team = tm;
          }
      }
      const teamName = team >= 0 && team < names.teams.length ? names.teams[team] : '';
      // A side the data leaves unnamed (neutral units, the AI's own spawns): no side to tell.
      if (!teamName) return;
      const cs = contacts[gi].sort((a, b) => a - b);
      const place: InsightPlace = byTeam
        ? { x: sx[gi] / n[gi], y: sy[gi] / n[gi], z: sz[gi] / n[gi], radius: g.f * MID * 4, grid: 'mid', cell: g.f * MID }
        : { x: sx[gi] / n[gi], y: sy[gi] / n[gi], z: sz[gi] / n[gi], radius: g.f * COARSE * Math.max(1, Math.sqrt(areas[gi].length)), grid: 'coarse', cell: g.f * COARSE };
      out.push(
        build({
          detector: 'spawn',
          kind: `spawn.${t.kind}`,
          key: byTeam ? `team${gi}` : placeKey(place),
          test: t.test,
          q: q[i],
          tests: tests.length,
          oneSided: false,
          measure: 'rateRatio',
          method: `per spawn, the first ${EARLY} s vs the other spawns, exact Poisson rate ratio, BH`,
          params: { team: teamName, spawns: n[gi], earlyPct: round(ed[gi] / n[gi], 3), earlySecs: EARLY, contactSecs: round(quantileSorted(cs, 0.5), 1) },
          evidence: {
            spawns: n[gi],
            earlyKills: ek[gi],
            earlyDeaths: ed[gi],
            medianContact: round(quantileSorted(cs, 0.5), 1),
            mapMedianContact: round(quantileSorted(all, 0.5), 1),
            mapSpawns: NT,
            grouping: byTeam ? 'team' : 'area',
          },
          place,
          filters: teamName ? [{ by: 'team', values: [teamName] }] : [],
          subject: teamName ? { team: teamName } : {},
          time: null,
        }),
      );
    });
    return { insights: out, tests: tests.length };
  },
};

// ---------------------------------------------------------------------------
// 5. A vehicle class (or the player/AI split) strong or weak in a place

const classPlace: Detector = {
  id: 'classPlace',
  skip: (ctx) => {
    const m = ctx.job.meta;
    if (!m.eventMap || m.kill < 0) return 'insights.skip.noEvents';
    if (!m.classMap && !m.actorMap) return 'insights.skip.noClasses';
    return null;
  },
  run: (ctx) => {
    const { job, names } = ctx;
    const m = job.meta;
    const g = m.grid;
    const C = g.cx * g.cz;
    const dims: { dim: 'class' | 'actor'; kills: Float64Array; deaths: Float64Array; values: readonly string[] }[] = [];
    if (m.classMap) dims.push({ dim: 'class', kills: job.cKills, deaths: job.cDeaths, values: names.classes });
    if (m.actorMap) dims.push({ dim: 'actor', kills: job.cActKills, deaths: job.cActDeaths, values: names.actors });
    const tests: { dim: (typeof dims)[number]; v: number; ci: number; test: ShareTest; K: number; D: number }[] = [];
    for (const d of dims) {
      for (let v = 0; v < d.values.length; v++) {
        let K = 0;
        let D = 0;
        for (let ci = 0; ci < C; ci++) {
          K += d.kills[v * C + ci];
          D += d.deaths[v * C + ci];
        }
        if (K + D < 20 || K === 0 || D === 0) continue;
        for (let ci = 0; ci < C; ci++) {
          const k = d.kills[v * C + ci];
          const n = k + d.deaths[v * C + ci];
          if (n < 5 || n >= K + D) continue;
          tests.push({ dim: d, v, ci, test: shareTest(k, n, K - k, K + D - n), K, D });
        }
      }
    }
    const q = bhAdjust(tests.map((t) => t.test.p));
    const found: (Insight & { cell: number; group: string })[] = [];
    tests.forEach((t, i) => {
      if (!(q[i] < ctx.fdr)) return;
      const strong = t.test.shrunk >= LARGE;
      if (!strong && t.test.shrunk > SMALL) return;
      const value = t.dim.values[t.v];
      const k = t.dim.kills[t.v * C + t.ci];
      const d = t.dim.deaths[t.v * C + t.ci];
      let top = -1;
      if (t.dim.dim === 'class')
        for (let c = 0; c < names.classes.length; c++) if (job.cTarget[c * C + t.ci] > 0 && (top < 0 || job.cTarget[c * C + t.ci] > job.cTarget[top * C + t.ci])) top = c;
      const place = cellPlace(ctx, 'coarse', t.ci);
      const isClass = t.dim.dim === 'class';
      found.push({
        ...build({
          detector: 'classPlace',
          kind: `classPlace.${isClass ? '' : 'actor'}${strong ? (isClass ? 'strong' : 'Strong') : isClass ? 'weak' : 'Weak'}`,
          key: `${value}:${placeKey(place)}`,
          test: t.test,
          q: q[i],
          tests: tests.length,
          oneSided: false,
          measure: 'kdOddsRatio',
          method: 'exact binomial, kill share of this class here vs the class elsewhere, BH over classes x places',
          params: { [isClass ? 'class' : 'actor']: value, kills: k, deaths: d },
          evidence: { kills: k, deaths: d, mapKills: t.K, mapDeaths: t.D, ...(top >= 0 ? { mostKilled: names.classes[top] } : {}) },
          place,
          filters: [{ by: 'category', column: isClass ? names.classColumn : names.actorColumn, values: [value] }, evFilter(ctx, 'kill', 'death')],
          subject: isClass ? { vehicleClass: value, ...(top >= 0 ? { targetClass: names.classes[top] } : {}) } : { actor: value },
        }),
        cells: midCellsOf(job, t.ci),
        cell: t.ci,
        group: `${t.dim.dim}:${t.v}:${strong}`,
      });
    });
    return { insights: suppress(found, g.cx, 1, 16), tests: tests.length };
  },
};

// ---------------------------------------------------------------------------
// 6. Players far above or below the others in the same vehicle class

const players: Detector = {
  id: 'players',
  skip: (ctx) => {
    const m = ctx.job.meta;
    if (m.persons === 0) return 'insights.skip.noTracks';
    if (!m.eventMap || m.kill < 0) return 'insights.skip.noEvents';
    return null;
  },
  run: (ctx) => {
    const { job, names } = ctx;
    const pr = job.pairs;
    const groups = new Map<number, { k: number; d: number; t: number; n: number }>();
    for (let i = 0; i < pr.n; i++) {
      if (!(pr.presence[i] > 0)) continue;
      const c = pr.cls[i];
      const gr = groups.get(c) ?? { k: 0, d: 0, t: 0, n: 0 };
      gr.k += pr.kills[i];
      gr.d += pr.deaths[i];
      gr.t += pr.presence[i];
      gr.n++;
      groups.set(c, gr);
    }
    const tests: { i: number; kind: 'kills' | 'deaths'; test: RateTest }[] = [];
    for (let i = 0; i < pr.n; i++) {
      const T = pr.presence[i];
      if (!(T > 0)) continue;
      const gr = groups.get(pr.cls[i])!;
      if (gr.n < 3 || T >= gr.t) continue;
      if (gr.k >= 10) tests.push({ i, kind: 'kills', test: rateTest(pr.kills[i], T, gr.k - pr.kills[i], gr.t - T) });
      if (gr.d >= 10) tests.push({ i, kind: 'deaths', test: rateTest(pr.deaths[i], T, gr.d - pr.deaths[i], gr.t - T) });
    }
    const q = bhAdjust(tests.map((t) => t.test.p));
    const out: Insight[] = [];
    tests.forEach((t, j) => {
      if (!(q[j] < ctx.fdr)) return;
      const up = t.test.shrunk >= LARGE;
      if (!up && t.test.shrunk > SMALL) return;
      const i = t.i;
      const cls = pr.cls[i] >= 0 ? names.classes[pr.cls[i]] : '';
      const kind = t.kind === 'kills' ? (up ? 'players.over' : 'players.under') : up ? 'players.fragile' : 'players.durable';
      const ai = pr.ai[i] * 2 > pr.rows[i];
      // An AI unit is no player to learn from: one that kills little or never dies was left alone, one
      // that dies often is a wave sent to die (bombers, targets). Only an AI that kills far more is told.
      if (ai && kind !== 'players.over') return;
      out.push(
        build({
          detector: 'players',
          kind,
          key: `${pr.person[i]}:${cls}`,
          test: t.test,
          q: q[j],
          tests: tests.length,
          oneSided: false,
          measure: 'rateRatio',
          method: `${t.kind} per presence vs the other players in the same vehicle class, exact Poisson rate ratio, BH`,
          params: { player: '', kills: pr.kills[i], deaths: pr.deaths[i], timeSecs: round(pr.presence[i], 1) },
          evidence: {
            kills: pr.kills[i],
            deaths: pr.deaths[i],
            presence: round(pr.presence[i], 1),
            classKills: groups.get(pr.cls[i])!.k,
            classDeaths: groups.get(pr.cls[i])!.d,
            classPresence: round(groups.get(pr.cls[i])!.t, 1),
            classPlayers: groups.get(pr.cls[i])!.n,
          },
          place: null,
          filters: [{ by: 'person', values: [] }],
          subject: { personIndex: pr.person[i], ...(cls ? { vehicleClass: cls } : {}), actor: ai ? names.actors[1] : names.actors[0] },
        }),
      );
    });
    out.sort((a, b) => b.strength - a.strength);
    return { insights: out.slice(0, 20), tests: tests.length };
  },
};

// ---------------------------------------------------------------------------
// 7. Choke points and flank routes, from where the tracks cross

const withCells = (cells: number[], ins: Insight): Insight => Object.assign(ins, { cells });

/**
 * Whether the traffic round a cell (by eight directions, from its 5 x 5 ring)
 * runs through it: on two opposite sides, with little on the two sides across.
 * A spawn, a base or an airfield is busy all round - traffic that starts or
 * ends there, not a passage - and is no choke point.
 */
export function throughRoute(sec: readonly number[], total: number): boolean {
  if (!(total > 0)) return false;
  const at = (k: number) => sec[((k % 8) + 8) % 8];
  for (let k = 0; k < 4; k++) {
    const a = at(k - 1) + at(k) + at(k + 1);
    const b = at(k + 3) + at(k + 4) + at(k + 5);
    const across = at(k + 2) + at(k + 6);
    if (Math.min(a, b) >= 0.2 * total && across <= 0.2 * total) return true;
  }
  return false;
}

const flow: Detector = {
  id: 'flow',
  skip: (ctx) => {
    if (ctx.job.meta.persons === 0) return 'insights.skip.noTracks';
    // A route is where many go: one or two people's tracks are only their own way.
    if (ctx.job.meta.persons < 4) return 'insights.skip.fewPersons';
    let n = 0;
    for (let i = 0; i < ctx.job.mPasses.length; i++) n += ctx.job.mPasses[i];
    return n < 50 ? 'insights.skip.fewCrossings' : null;
  },
  run: (ctx) => {
    const { job } = ctx;
    const m = job.meta;
    const g = m.grid;
    const M = g.mx * g.mz;
    const P = job.mPasses;
    let total = 0;
    let approach = 0;
    const used: number[] = [];
    for (let mi = 0; mi < M; mi++) {
      total += P[mi];
      approach += job.mApproach[mi];
      if (P[mi] > 0) used.push(P[mi]);
    }
    used.sort((a, b) => a - b);
    const busy = quantileSorted(used, 0.75);
    const tests: { mi: number; kind: 'choke' | 'flank'; test: RateTest; p: number; around?: number }[] = [];
    for (let mi = 0; mi < M; mi++) {
      const a = P[mi];
      if (a < 10 || a < busy) continue;
      const ix = mi % g.mx;
      const iz = Math.floor(mi / g.mx);
      let b = 0;
      let nb = 0;
      const sec = [0, 0, 0, 0, 0, 0, 0, 0];
      for (let dz = -2; dz <= 2; dz++)
        for (let dx = -2; dx <= 2; dx++) {
          if (!dx && !dz) continue;
          const x = ix + dx;
          const z = iz + dz;
          if (x < 0 || z < 0 || x >= g.mx || z >= g.mz) continue;
          const v = P[z * g.mx + x];
          b += v;
          nb++;
          sec[(Math.round(Math.atan2(dz, dx) / (Math.PI / 4)) + 8) % 8] += v;
        }
      if (nb < 8 || !throughRoute(sec, b)) continue;
      const r = rateTest(a, 1, b, nb);
      tests.push({ mi, kind: 'choke', test: r, p: r.pUpper, around: b / nb });
    }
    const usedFive = used.filter((v) => v >= 5);
    const quiet = quantileSorted(usedFive, 0.5);
    if (approach >= 20) {
      for (let mi = 0; mi < M; mi++) {
        const a = P[mi];
        if (a < 5 || a > quiet) continue;
        const r = rateTest(job.mApproach[mi], a, approach - job.mApproach[mi], total - a);
        tests.push({ mi, kind: 'flank', test: r, p: r.pUpper });
      }
    }
    const q = bhAdjust(tests.map((t) => t.p));
    const deaths = m.death >= 0 ? job.events[m.death] : 0;
    const chokes: (Insight & { cell: number; group: string })[] = [];
    const flanks: number[] = [];
    const flankQ = new Map<number, number>();
    tests.forEach((t, i) => {
      if (!(q[i] < ctx.fdr)) return;
      if (t.kind === 'choke') {
        if (t.test.shrunk < 2) return;
        const d = eventsAt(ctx, m.death, t.mi);
        const place = cellPlace(ctx, 'mid', t.mi);
        chokes.push({
          ...build({
            detector: 'flow',
            kind: 'flow.choke',
            key: placeKey(place),
            test: t.test,
            q: q[i],
            tests: tests.length,
            oneSided: true,
            measure: 'shareRatio',
            method: 'crossings vs the 5x5 cells around, exact binomial, BH',
            params: { crossings: P[t.mi], deaths: d },
            evidence: { crossings: P[t.mi], aroundMean: round(t.around ?? 0, 1), deaths: d, deathsPerCrossing: round(d / P[t.mi], 4), mapDeathsPerCrossing: round(deaths / Math.max(1, total), 4) },
            place,
            filters: [],
          }),
          cells: [t.mi],
          cell: t.mi,
          group: 'choke',
        });
      } else if (t.test.shrunk >= LARGE) {
        flanks.push(t.mi);
        flankQ.set(t.mi, q[i]);
      }
    });
    const out: Insight[] = suppress(chokes, g.mx, 2, 8);
    const routes = components(flanks, g.mx).map((cells) => {
      let a = 0;
      let n = 0;
      let qq = 1;
      for (const c of cells) {
        a += job.mApproach[c];
        n += P[c];
        qq = Math.min(qq, flankQ.get(c)!);
      }
      const r = rateTest(a, n, approach - a, total - n);
      const place = { ...groupPlace(ctx, cells, (c) => P[c]), path: along(ctx, cells) };
      return withCells(cells, build({
        detector: 'flow',
        kind: 'flow.flank',
        key: placeKey(place),
        test: r,
        q: qq,
        tests: tests.length,
        oneSided: true,
        measure: 'rateRatio',
        method: `kills within ${APPROACH} s of crossing, per crossing, quiet cells vs the rest, exact Poisson rate ratio, BH; adjacent cells merged`,
        params: { kills: a, crossings: n, approachSecs: APPROACH, sharePct: round(n / Math.max(1, total), 4) },
        evidence: { killsAfter: a, crossings: n, cells: cells.length, mapKillsAfter: approach, mapCrossings: total },
        place,
        filters: [evFilter(ctx, 'kill')],
      }));
    });
    routes.sort((a, b) => b.strength - a.strength);
    out.push(...routes.slice(0, 6));
    return { insights: out, tests: tests.length };
  },
};

// ---------------------------------------------------------------------------
// Value: where the most was paid or earned (data/cost.ts)

/** Per currency, the column of what was paid (all of it where there is a total) and of what was earned. */
function valueTargets(cols: readonly string[]): { c: number; earned: boolean; currency: string }[] {
  const out: { c: number; earned: boolean; currency: string }[] = [];
  const parsed = cols.map((name) => parseValueColumn(name));
  // A game's own currencies only: a converter's real-world price estimate (`usd`) for game vehicles is no finding.
  const currencies = new Set(parsed.flatMap((p) => (p && p.currency !== 'usd' ? [p.currency] : [])));
  const PAID = ['total', 'lost', 'spent', 'fired', 'fuel'];
  for (const cur of currencies) {
    for (const kind of PAID) {
      const c = parsed.findIndex((p) => p && p.flow === 'cost' && p.currency === cur && p.kind === kind);
      if (c >= 0) {
        out.push({ c, earned: false, currency: cur });
        break;
      }
    }
    const e = parsed.findIndex((p) => p && p.flow === 'earn' && p.currency === cur);
    if (e >= 0) out.push({ c: e, earned: true, currency: cur });
  }
  return out;
}

const value: Detector = {
  id: 'value',
  skip: (ctx) => (!ctx.job.meta.values?.length ? 'insights.skip.noValue' : ctx.job.presence <= 0 ? 'insights.skip.noTime' : null),
  run: (ctx) => {
    const { job } = ctx;
    const g = job.meta.grid;
    const M = g.mx * g.mz;
    const T = job.presence;
    const cols = job.meta.values ?? [];
    const tests: { t: number; mi: number; test: RateTest }[] = [];
    const targets = valueTargets(cols);
    targets.forEach((tg, t) => {
      const tot = job.valRows[tg.c];
      if (tot < 20) return;
      for (let mi = 0; mi < M; mi++) {
        const pres = job.mPres[mi];
        if (!(pres > 0) || pres >= T) continue;
        const a = job.mValN[tg.c * M + mi];
        const r = rateTest(a, pres, tot - a, T - pres);
        if (a >= 3 || r.expected >= 3) tests.push({ t, mi, test: r });
      }
    });
    const q = bhAdjust(tests.map((x) => x.test.p));
    const groups = new Map<number, { cells: number[]; q: Map<number, number> }>();
    tests.forEach((x, i) => {
      if (!(q[i] < ctx.fdr) || x.test.shrunk < LARGE) return;
      let gr = groups.get(x.t);
      if (!gr) groups.set(x.t, (gr = { cells: [], q: new Map() }));
      gr.cells.push(x.mi);
      gr.q.set(x.mi, q[i]);
    });
    const out: Insight[] = [];
    for (const [t, gr] of groups) {
      const tg = targets[t];
      const tot = job.valRows[tg.c];
      const sum = job.valTotal[tg.c];
      const over = (c: number) => job.mValN[tg.c * M + c] - (tot * job.mPres[c]) / T;
      const found = components(gr.cells, g.mx).flatMap((comp) => peaks(comp, g.mx, over)).map((cells) => {
        let a = 0;
        let pres = 0;
        let v = 0;
        let qq = 1;
        for (const c of cells) {
          a += job.mValN[tg.c * M + c];
          v += job.mVal[tg.c * M + c];
          pres += job.mPres[c];
          qq = Math.min(qq, gr.q.get(c)!);
        }
        const r = rateTest(a, pres, tot - a, T - pres);
        const place = groupPlace(ctx, cells, (c) => Math.abs(job.mVal[tg.c * M + c]));
        const share = sum !== 0 ? round((v / sum) * 100, 1) : 0;
        const ins = build({
          detector: 'value',
          kind: tg.earned ? 'value.earned' : 'value.lost',
          key: `${cols[tg.c]}:${placeKey(place)}`,
          test: r,
          q: qq,
          tests: tests.length,
          oneSided: true,
          measure: 'rateRatio',
          method: 'exact Poisson rate ratio of valued rows per presence vs rest of map, BH; adjacent cells merged',
          params: { value: Math.round(v), unit: currencyUnit(tg.currency), share },
          evidence: { rows: a, expected: round(r.expected, 1), value: Math.round(v), share, presence: round(pres, 1), cells: cells.length, column: cols[tg.c] },
          place,
          filters: [],
        });
        // Ranked by the money as much as by the rate: a big share is the finding.
        ins.strength = round(ins.strength * (0.5 + Math.min(1, Math.abs(share) / 20)), 4);
        ins.cells = cells;
        return ins;
      });
      found.sort((a, b) => b.strength - a.strength);
      out.push(...found.slice(0, 4));
    }
    return { insights: out, tests: tests.length };
  },
};

export const DETECTOR_LIST: readonly Detector[] = [power, zones, cover, spawn, classPlace, players, flow, value];
