/**
 * The insight engine: the pass's tables through every detector, into one
 * report. Free of any thread, so the worker and the tests run the same code.
 */

import { DETECTOR_LIST, type DetectContext, type InsightNames } from './detectors';
import { COARSE, MID, type InsightJob } from './pass';
import { curateInsights } from './curate';
import type { DetectorRun, Insight, InsightReport, InsightValue } from './types';

/** False discovery rate every detector holds its findings to. */
export const FDR = 0.05;
/** Insights in a report at most, strongest first. */
export const MAX_INSIGHTS = 60;
/** Findings of one kind ranked before any second-tier ones. */
const PER_KIND = 3;

export interface ReportInfo {
  name: string;
  rows: number;
  hasLevel: boolean;
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
  // Left out: findings that say nothing (whole-map places, the rear, the spawns); the rest by usefulness.
  const { kept, dropped } = curateInsights(all, { mapExtent: Math.max(g.nx, g.nz) * g.f, presence: job.presence });
  all.length = 0;
  all.push(...kept);
  // A few of each kind of finding first, then the rest: the top of the list shows every detector's best.
  const seen = new Map<string, number>();
  const first: Insight[] = [];
  const rest: Insight[] = [];
  for (const i of all) {
    const g = i.kind;
    const n = seen.get(g) ?? 0;
    seen.set(g, n + 1);
    (n < PER_KIND ? first : rest).push(i);
  }
  const ranked = [...first, ...rest];
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
    fdr: FDR,
    elapsedMs: Math.round(now() - t0),
  };
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
