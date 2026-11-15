/**
 * Running the insights off the main thread, the way the volume comparison
 * runs (`volumes/compareRun.ts`, whose preparation and chunking this shares):
 * slices of the columns copied over a few at a time, the worker folding each
 * into its grids and asking for the next. The level's vertices go first, in
 * slices too, for the geometry density the cover detector reads.
 */

import { ACTORS, CANON, EVENT_KINDS, VEHICLE_CLASSES } from '../data/canonical';
import type { ModelLevel, Level } from '../render/level';
import type { Dataset } from '../state/types';
import type { CompareScope } from '../volumes/compare';
import { chunkAt, COMPARE_CHUNK, prepareCompare } from '../volumes/compareRun';
import type { InsightNames } from './detectors';
import { finishInsights, type ReportInfo } from './engine';
import { createInsightJob, gridFor, stepInsight, stepLevel, type InsightChunk, type InsightMeta } from './pass';
import { createLensJob, safeFinishLens, stepLens, stepLensLevel, type LensOptions } from './lensMetrics';
import type { InsightReport } from './types';
import { cqbSync, runCqb } from './cqb/run';

const IN_FLIGHT = 3;
/** Level floats a slice. */
const LEVEL_CHUNK = 6 << 18;

function taxonomyMap(ds: Dataset, column: string, kinds: readonly string[]): Int8Array | null {
  const a = ds.attrs.find((c) => c.name === column);
  if (!a || !a.categories) return null;
  return Int8Array.from(a.categories, (c) => kinds.indexOf(c));
}

/** The analysis covers the whole time; the filters, hidden groups and match picked still apply. */
export function analysisScope(sc: CompareScope): CompareScope {
  return { ...sc, timeLo: -Infinity, timeHi: Infinity, lifetimeNow: null };
}

interface Prep {
  ds: Dataset;
  meta: InsightMeta;
  scope: CompareScope;
  cmp: ReturnType<typeof prepareCompare>;
  level: ModelLevel | null;
  names: InsightNames;
  info: ReportInfo;
  lens: LensOptions;
  shooterCol: Uint32Array | null;
}

function prepare(ds: Dataset, sc: CompareScope, level: Level | null): Prep {
  const scope = analysisScope(sc);
  const cmp = prepareCompare(ds, [], scope, null);
  // No directions: the insights do not read them, and the view yaw would be packed here, row by row.
  cmp.meta.hasDir = false;
  const b = ds.bounds;
  const ev = (k: string) => EVENT_KINDS.indexOf(k as (typeof EVENT_KINDS)[number]);
  const meta: InsightMeta = {
    ...cmp.meta,
    grid: gridFor(b.minX, b.minZ, b.maxX, b.maxZ),
    targetMap: taxonomyMap(ds, CANON.targetClass, VEHICLE_CLASSES),
    spawn: ev('spawn'),
    contact: ['fire', 'launch', 'hit', 'damage', 'kill', 'death'].map(ev),
  };
  const shooter = shooterOf(ds);
  const model = level && level.kind === 'model' && !level.stream && level.vertices.length > 0 ? level : null;
  return {
    ds,
    meta,
    scope,
    cmp,
    level: model,
    names: {
      events: EVENT_KINDS,
      classes: VEHICLE_CLASSES,
      actors: ACTORS,
      teams: ds.teamLabels.slice(),
      eventColumn: CANON.event,
      classColumn: CANON.vehicleClass,
      actorColumn: CANON.actor,
    },
    info: { name: ds.name, rows: ds.count, hasLevel: !!model },
    // Units in a metre, as the replay reckons it (`replayData.unitsPerMetre`): from the file's entity size.
    lens: { upm: ds.entitySize ? ds.entitySize / 0.8 : 1, events: { launch: ev('launch'), fire: ev('fire'), takeoff: ev('takeoff'), landing: ev('landing') }, shooterMap: shooter?.map },
    shooterCol: shooter?.col ?? null,
  };
}

function chunk(p: Prep, lo: number, n: number): { chunk: InsightChunk; transfer: ArrayBuffer[] } {
  const { chunk: c, transfer } = chunkAt(p.cmp, lo, n);
  let target: Uint32Array | null = null;
  if (p.meta.targetMap) {
    const col = p.ds.attrs.find((a) => a.name === CANON.targetClass)?.data as Uint32Array | undefined;
    if (col) {
      target = col.slice(lo, lo + n);
      transfer.push(target.buffer as ArrayBuffer);
    }
  }
  // The launching unit of weapon rows, for the lens (`lensMetrics.ts`: launch ranges, kill chain).
  let shooter: Uint32Array | null = null;
  if (p.shooterCol) {
    shooter = p.shooterCol.slice(lo, lo + n);
    transfer.push(shooter.buffer as ArrayBuffer);
  }
  return { chunk: { ...c, target, shooter } as InsightChunk, transfer };
}

/** Columns naming the unit that fired or launched a row's weapon, in order of preference. */
const SHOOTER_COLUMNS = ['Shooter', 'Launcher', 'shooter', 'launcher', 'attacker', 'Attacker'];

/**
 * The shooter column's categories as person indices: by the whole label, else
 * by its trailing object id (`#5702`), as Tacview-derived labels carry one.
 */
function shooterOf(ds: Dataset): { col: Uint32Array; map: Int32Array } | null {
  const a = SHOOTER_COLUMNS.map((n) => ds.attrs.find((x) => x.name === n && x.categories)).find(Boolean);
  if (!a || !a.categories) return null;
  const byLabel = new Map<string, number>();
  const byId = new Map<string, number>();
  ds.personLabels.forEach((l, i) => {
    byLabel.set(l, i);
    const id = /#[0-9a-f]+$/i.exec(l)?.[0];
    // An id worn by two people (recordings reuse them) names neither.
    if (id) byId.set(id, byId.has(id) ? -1 : i);
  });
  const map = Int32Array.from(a.categories, (c) => byLabel.get(c) ?? byId.get(/#[0-9a-f]+$/i.exec(c)?.[0] ?? '') ?? -1);
  return map.some((v) => v >= 0) ? { col: a.data as Uint32Array, map } : null;
}

/** The people the report names by index, named. */
function resolve(r: InsightReport, ds: Dataset): InsightReport {
  for (const ins of r.insights) {
    const i = ins.subject.personIndex;
    if (i === undefined) continue;
    const name = ds.personLabels[i] ?? `#${i}`;
    ins.subject.person = name;
    if ('player' in ins.sentence.params) ins.sentence.params.player = name;
    for (const f of ins.filters) if (f.by === 'person') f.values = [name];
  }
  for (const v of r.values ?? []) for (const p of v.topPlayers) p.person = ds.personLabels[p.personIndex] ?? `#${p.personIndex}`;
  return r;
}

/** The whole thing on this thread: for the tests and small data. */
export function insightsSync(ds: Dataset, scope: CompareScope, level: Level | null = null): InsightReport {
  const p = prepare(ds, scope, level);
  const job = createInsightJob(p.meta, p.scope);
  const lens = createLensJob(p.meta, p.scope, p.lens);
  if (p.level) {
    stepLevel(job, p.level.vertices, 6);
    stepLensLevel(lens, p.level.vertices, 6);
  }
  for (let lo = p.cmp.lo; lo < p.cmp.hi; lo += COMPARE_CHUNK) {
    const c = chunk(p, lo, Math.min(COMPARE_CHUNK, p.cmp.hi - lo)).chunk;
    stepInsight(job, c);
    stepLens(lens, c);
  }
  const report = finishInsights(job, p.names, p.info);
  report.lens = safeFinishLens(lens, job, p.names.teams);
  // Close quarters and esports measures (`cqb/`), where the data carries them.
  if (report.lens) report.lens.cqb = cqbSync(ds, scope);
  return resolve(report, ds);
}

/** The insights in a worker; rejects with an AbortError when `signal` is aborted. */
export function runInsights(
  ds: Dataset,
  scope: CompareScope,
  level: Level | null,
  opts: { signal?: AbortSignal; onProgress?: (fraction: number) => void } = {},
): Promise<InsightReport> {
  const p = prepare(ds, scope, level);
  // Close quarters and esports measures in their own worker, alongside (`cqb/run.ts`).
  const cqb = runCqb(ds, scope, opts.signal).catch(() => undefined);
  const lv = p.level?.vertices ?? null;
  return new Promise((resolveP, reject) => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    let nextLevel = 0;
    let next = p.cmp.lo;
    let inFlight = 0;
    let finishing = false;
    let over = false;
    const total = p.cmp.hi - p.cmp.lo;
    const end = () => {
      over = true;
      worker.terminate();
    };
    const fail = (e: unknown) => {
      if (over) return;
      end();
      reject(e);
    };
    opts.signal?.addEventListener('abort', () => fail(new DOMException('aborted', 'AbortError')), { once: true });
    const pump = () => {
      while (!over && inFlight < IN_FLIGHT && lv && nextLevel < lv.length) {
        const v = lv.slice(nextLevel, Math.min(lv.length, nextLevel + LEVEL_CHUNK));
        worker.postMessage({ type: 'level', v, stride: 6 }, [v.buffer]);
        nextLevel += LEVEL_CHUNK;
        inFlight++;
      }
      while (!over && inFlight < IN_FLIGHT && (!lv || nextLevel >= lv.length) && next < p.cmp.hi) {
        const n = Math.min(COMPARE_CHUNK, p.cmp.hi - next);
        const { chunk: c, transfer } = chunk(p, next, n);
        worker.postMessage({ type: 'chunk', chunk: c }, transfer);
        next += n;
        inFlight++;
      }
      if (!over && !finishing && (!lv || nextLevel >= lv.length) && next >= p.cmp.hi && inFlight === 0) {
        finishing = true;
        worker.postMessage({ type: 'finish', names: p.names, info: p.info });
      }
    };
    worker.onmessage = (e: MessageEvent<{ type: 'ack' } | { type: 'done'; report: InsightReport }>) => {
      if (over) return;
      const m = e.data;
      if (m.type === 'ack') {
        inFlight--;
        opts.onProgress?.(total > 0 ? Math.max(0, next - p.cmp.lo - inFlight * COMPARE_CHUNK) / total : 1);
        pump();
      } else {
        end();
        const rep = resolve(m.report, ds);
        void cqb.then((c) => {
          if (c && rep.lens) rep.lens.cqb = c;
          resolveP(rep);
        });
      }
    };
    worker.onerror = (e) => fail(new Error(e.message || 'insight worker failed'));
    if (opts.signal?.aborted) return fail(new DOMException('aborted', 'AbortError'));
    worker.postMessage({ type: 'start', meta: p.meta, scope: p.scope, lens: p.lens });
    pump();
  });
}
