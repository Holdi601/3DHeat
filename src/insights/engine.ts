/**
 * The insight engine: the pass's tables through every detector, into one
 * report. Free of any thread, so the worker and the tests run the same code.
 */

import { DETECTOR_LIST, type DetectContext, type InsightNames } from './detectors';
import { COARSE, MID, type InsightJob } from './pass';
import { curateInsights, rankInsights, type SpawnSpot } from './curate';
import { attachSpread } from './consistency';
import type { DetectorRun, Insight, InsightReport, InsightValue } from './types';

/** False discovery rate every detector holds its findings to. */
export const FDR = 0.05;
/** Insights in a report at most, strongest first. */
export const MAX_INSIGHTS = 40;
/** Mid cells holding at least this share of all life starts (and 3) are a spawn. */
const SPAWN_SHARE = 0.01;

export interface ReportInfo {
  name: string;
  rows: number;
  hasLevel: boolean;
  /** World units in a metre. */
  upm?: number;
  sessionUnit?: 'match' | 'round';
}

/** Mean row height per cell of a coarser grid, from the fine cells. */
function heights(job: InsightJob, step: number, w: number, h: number): Float64Array {
  const g = job.meta.grid;
  const sum = new Float64Array(w * h);
  const n = new Float64Array(w * h);
  for (let z = 0; z < g.nz; z++)
    for (let x = 0; x < g.nx; x++) {
      const fi = z * g.nx + x;
      if (!job.fN[fi]) continue;
      const c = Math.floor(z / step) * w + Math.floor(x / step);
      sum[c] += job.fY[fi];
      n[c] += job.fN[fi];
    }
  for (let i = 0; i < sum.length; i++) sum[i] = n[i] > 0 ? sum[i] / n[i] : NaN;
  return sum;
}

export function finishInsights(job: InsightJob, names: InsightNames, info: ReportInfo, now: () => number = () => performance.now()): InsightReport {
  const t0 = now();
  const g = job.meta.grid;
  const ctx: DetectContext = {
    job,
    names,
    fdr: FDR,
    midY: heights(job, MID, g.mx, g.mz),
    coarseY: heights(job, COARSE, g.cx, g.cz),
  };
  const runs: DetectorRun[] = [];
  const all: Insight[] = [];
  for (const d of DETECTOR_LIST) {
    const s = now();
    const why = d.skip(ctx);
    if (why) {
      runs.push({ id: d.id, ran: false, skipped: why, tests: 0, found: 0, ms: 0 });
      continue;
    }
    const r = d.run(ctx);
    all.push(...r.insights);
    runs.push({ id: d.id, ran: true, tests: r.tests, found: r.insights.length, ms: Math.round(now() - s) });
  }
  // How each finding spreads over the matches (or rounds), where there are several.
  const m0 = job.meta;
  const evIndex = (name: string) => names.events.indexOf(name);
  for (const i of all) attachSpread(job, i, m0.kill, m0.death, evIndex);
  // Left out: findings that say nothing (whole-map places, the rear, the spawns, one match's doing); the rest by usefulness.
  const spots = spawnSpots(job);
  const { kept, dropped } = curateInsights(all, {
    mapExtent: Math.max(g.nx, g.nz) * g.f,
    presence: job.presence,
    spawns: spots,
    powerRan: runs.some((r) => r.id === 'power' && r.ran),
  });
  const ranked = rankInsights(kept, dropped);
  let crossings = 0;
  for (let i = 0; i < job.mPasses.length; i++) crossings += job.mPasses[i];
  let matches = 0;
  if (job.sessAny) for (let s = 0; s < job.sessAny.length; s++) matches += job.sessAny[s];
  const m = job.meta;
  return {
    schema: 'heat3d.insights/1',
    dataset: {
      name: info.name,
      rows: info.rows,
      shownRows: job.shown,
      matches: job.sessAny ? matches : 1,
      persons: m.persons,
      teams: m.teams,
      hasLevel: info.hasLevel,
      exposure: m.hasLife ? 'seconds' : 'samples',
      upm: info.upm ?? 1,
      sessionUnit: info.sessionUnit ?? 'match',
    },
    grid: { x0: g.x0, z0: g.z0, fine: g.f, mid: g.f * MID, coarse: g.f * COARSE, nx: g.nx, nz: g.nz },
    baseline: {
      presence: Math.round(job.presence * 10) / 10,
      kills: m.kill >= 0 ? job.events[m.kill] : 0,
      deaths: m.death >= 0 ? job.events[m.death] : 0,
      spawns: job.lives.n,
      crossings,
    },
    ...(m.values?.length ? { values: valuesOf(job, names) } : {}),
    detectors: runs,
    insights: ranked.slice(0, MAX_INSIGHTS),
    dropped,
    spawnSpots: spots.map((s) => ({ x: Math.round(s.x), z: Math.round(s.z), starts: s.starts })),
    fdr: FDR,
    elapsedMs: Math.round(now() - t0),
  };
}

/** Where lives start: the mid cells that hold at least `SPAWN_SHARE` of all life starts. */
function spawnSpots(job: InsightJob): SpawnSpot[] {
  const lv = job.lives;
  if (lv.n < 10) return [];
  const g = job.meta.grid;
  const per = new Map<number, number>();
  for (let i = 0; i < lv.n; i++) per.set(lv.cell[i], (per.get(lv.cell[i]) ?? 0) + 1);
  const floor = Math.max(3, lv.n * SPAWN_SHARE);
  const size = g.f * MID;
  const out: SpawnSpot[] = [];
  for (const [mi, n] of per) {
    if (n < floor) continue;
    out.push({ x: g.x0 + ((mi % g.mx) + 0.5) * size, z: g.z0 + (Math.floor(mi / g.mx) + 0.5) * size, radius: size * 0.71, starts: n });
  }
  return out;
}

/** Each value column's totals: by group, and the ten players with the most. */
function valuesOf(job: InsightJob, names: InsightNames): InsightValue[] {
  const cols = job.meta.values ?? [];
  const T = job.teamVal.length / Math.max(1, cols.length);
  const P = job.meta.persons;
  return cols.map((column, c) => {
    const byTeam: Record<string, number> = {};
    for (let g = 0; g < T; g++) {
      const v = job.teamVal[c * T + g];
      if (v !== 0) byTeam[names.teams[g] ?? `#${g}`] = Math.round(v);
    }
    const top: { personIndex: number; value: number }[] = [];
    for (let p = 0; p < P; p++) {
      const v = job.personVal[c * P + p];
      if (v === 0) continue;
      if (top.length < 10 || Math.abs(v) > Math.abs(top[top.length - 1].value)) {
        top.push({ personIndex: p, value: Math.round(v) });
        top.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
        if (top.length > 10) top.pop();
      }
    }
    return { column, total: Math.round(job.valTotal[c]), rows: job.valRows[c], byTeam, topPlayers: top };
  });
}
