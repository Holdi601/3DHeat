/**
 * The page's side of the mass analysis: the worker (`massWorker.ts`), what
 * it has loaded, the panel's filter and tab, and the drill-down - the
 * matches behind a row, a cell or an insight loaded into the 3D view as the
 * many-match overlay, with the filters that show it.
 */

import { create } from 'zustand';
import { expandContainerFiles } from '../data/container';
import { toFilterSpec } from '../insights/apply';
import type { InsightFilter, InsightPlace } from '../insights/types';
import type { Engine } from '../render/engine';
import { useStore } from '../state/store';
import type { FilterSpec } from '../state/types';
import { startLeanLoad } from '../ui/overlay/LeanOverlayPanel';
import type { MassInsight, MassReport } from './detect';
import { placeLines, usePlaceLines } from './placeLines';
import type { MassFacets, MassLoadStats, MassRequest, MassResponse } from './massWorker';
import type { MassDrill, MassFilter } from './store';

export type MassTab = 'overview' | 'balance' | 'trends' | 'players' | 'sides' | 'map' | 'insights' | 'places' | 'niches';

export interface MassState {
  open: boolean;
  tab: MassTab;
  filter: MassFilter;
  progress: { done: number; total: number; phase: string } | null;
  facets: MassFacets | null;
  stats: MassLoadStats | null;
  error: string | null;
  /** Last round trips, ms, by what was asked (for the panel and the probes). */
  timings: Record<string, number>;
  drilling: boolean;
  /** The last insights run (Insights, Places and Niches tabs share it), its filter's key, and whether one is running. */
  report: MassReport | null;
  reportKey: string | null;
  reporting: boolean;
  reportError: string | null;
  set: (p: Partial<MassState>) => void;
}

export const useMass = create<MassState>((set) => ({
  open: false,
  tab: 'overview',
  filter: {},
  progress: null,
  facets: null,
  stats: null,
  error: null,
  timings: {},
  drilling: false,
  report: null,
  reportKey: null,
  reporting: false,
  reportError: null,
  set: (p) => set(p),
}));

/** Runs the insights (Stage A and B) on the filter, for every tab that shows them. */
export async function findInsights(maps: number): Promise<void> {
  const st = useMass.getState();
  if (st.reporting) return;
  st.set({ reporting: true, reportError: null });
  try {
    const filter = st.filter;
    const report = await askMass<MassReport>({ type: 'insights', filter, maps }, 'insights');
    useMass.getState().set({ report, reportKey: JSON.stringify(filter) });
  } catch (e) {
    useMass.getState().set({ reportError: (e as Error).message });
  } finally {
    useMass.getState().set({ reporting: false });
  }
}

/** The places of a map drawn in the view, one picked; none when `map` is null. */
export function showPlaces(engine: Engine | null, map: string | null, focus: string | null = null): void {
  const r = useMass.getState().report;
  const list = map && r ? r.insights.filter((i) => i.region && i.drill.map === map) : [];
  // Every place of the map the report kept, not only those among the insights.
  const extra = map && r?.places ? r.places.findings.filter((f) => f.map === map && !list.some((i) => i.id === `mass:place:${f.id}`)) : [];
  const all = [...list, ...extra.map(placeInsight)];
  usePlaceLines.getState().set({ lines: all.length ? placeLines(all, focus) : null, focus });
  engine?.invalidate(2);
}

/** A place as the insight the report would have made of it (for the lines and the drill-down). */
export function placeInsight(f: NonNullable<MassReport['places']>['findings'][number]): MassInsight {
  return {
    id: `mass:place:${f.id}`,
    detector: 'place',
    kind: 'place',
    sentence: { key: f.dir > 0 ? 'Up' : 'Down', params: {} },
    strength: f.score,
    effect: { measure: 'rateRatio', value: f.shrunk, raw: f.ratio, lo: f.lo, hi: f.hi },
    confidence: { p: f.p, q: f.q, level: 'low', tests: 0, method: '' },
    evidence: {},
    place: { x: f.x, y: f.y, z: f.z, radius: f.radius, grid: 'coarse', cell: f.cell },
    time: null,
    filters: [],
    subject: {},
    drill: { map: f.map, ...(f.matches.length ? { matches: f.matches } : {}) },
    region: { shape: f.shape, segs: f.segs, ...(f.path ? { path: f.path } : {}), ...(f.bandY ? { bandY: f.bandY } : {}), obviousness: f.obviousness, hidden: f.hidden },
  };
}

// The probes read the timings (tools, dev builds only).
if (import.meta.env.DEV) (globalThis as { __mass?: typeof useMass }).__mass = useMass;

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void; kind: string; t0: number }>();
let opened: ((ok: boolean) => void) | null = null;

function ensure(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL('./massWorker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = (ev: MessageEvent<MassResponse>) => {
    const m = ev.data;
    const st = useMass.getState();
    if (m.type === 'progress') st.set({ progress: { done: m.done, total: m.total, phase: m.phase } });
    else if (m.type === 'ready') {
      st.set({ facets: m.facets, stats: m.stats, progress: null, timings: { ...st.timings, open: m.stats.ms } });
      opened?.(true);
      opened = null;
    } else if (m.type === 'result') {
      const p = pending.get(m.id);
      pending.delete(m.id);
      if (p) {
        st.set({ timings: { ...useMass.getState().timings, [p.kind]: Math.round(performance.now() - p.t0), [`${p.kind}Worker`]: Math.round(m.ms) }, progress: null });
        p.resolve(m.data);
      }
    } else if (m.type === 'error') {
      if (m.id !== undefined) {
        pending.get(m.id)?.reject(new Error(m.message));
        pending.delete(m.id);
      } else {
        st.set({ error: m.message, progress: null });
        opened?.(false);
        opened = null;
      }
    }
  };
  return worker;
}

/** Hands the picked files (containers, tables, the folders' index files) to the worker. */
export async function openMass(list: { file: File; path: string }[], add = false): Promise<boolean> {
  const w = ensure();
  useMass.getState().set({ error: null, progress: { done: 0, total: list.length, phase: 'index' }, ...(add ? {} : { facets: null, stats: null }) });
  // The handles go over in slices, a task each: cloning hundreds of them in one message held the page for a frame or more.
  for (let i = 0; i < list.length; i += 16) {
    w.postMessage({ type: 'files', files: list.slice(i, i + 16) } satisfies MassRequest);
    await new Promise((r) => setTimeout(r, 0));
  }
  return new Promise((resolve) => {
    opened = resolve;
    w.postMessage({ type: 'open', files: [], add } satisfies MassRequest);
  });
}

/** Asks the worker; `kind` names the round trip in the timings. */
export function askMass<T>(req: DistributiveOmit<Extract<MassRequest, { id: number }>, 'id'>, kind: string): Promise<T> {
  const w = ensure();
  const id = nextId++;
  return new Promise<T>((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject, kind, t0: performance.now() });
    w.postMessage({ ...req, id } as MassRequest);
  });
}

type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

/** A category column of the loaded dataset holding the value: a vehicle's name column, say. */
function columnWith(value: string, prefer: RegExp): string | null {
  const ds = useStore.getState().dataset;
  if (!ds) return null;
  const cols = ds.attrs.filter((a) => a.kind === 'category' && a.categories?.includes(value));
  return (cols.find((c) => prefer.test(c.name)) ?? cols[0])?.name ?? null;
}

/**
 * The matches a drill-down names, loaded into the 3D view (the many-match
 * overlay); then the filters that show what was clicked, and the camera on
 * its place.
 */
export async function drillDown(engine: Engine | null, req: { drill?: MassDrill; insight?: MassInsight; extra?: MassFilter; place?: InsightPlace | null }): Promise<number> {
  const st = useMass.getState();
  st.set({ drilling: true });
  try {
    const t0 = performance.now();
    const filter = { ...st.filter, ...(req.extra ?? {}) };
    const r = await askMass<{ files: File[]; matches: number }>({ type: 'drill', filter, drill: req.drill, insight: req.insight }, 'drill');
    if (!r.files.length) return 0;
    const tables = await expandContainerFiles(r.files);
    const ok = await startLeanLoad(tables, engine, false);
    useMass.getState().set({ timings: { ...useMass.getState().timings, drillLoad: Math.round(performance.now() - t0) } });
    if (!ok) return r.files.length;
    const ds = useStore.getState().dataset;
    if (!ds) return r.files.length;
    const d: MassDrill = { ...(req.insight?.drill ?? {}), ...(req.drill ?? {}) };
    const filters: InsightFilter[] = [...(req.insight?.filters ?? [])];
    if (d.vehicle) {
      const c = columnWith(d.vehicle, /vehicle|^name$|type/i);
      if (c) filters.push({ by: 'category', column: c, values: [d.vehicle] });
    }
    if (d.cls) filters.push({ by: 'category', column: 'Vehicle class', values: [d.cls] });
    if (d.weapon) {
      const c = columnWith(d.weapon, /weapon/i);
      if (c) filters.push({ by: 'category', column: c, values: [d.weapon] });
    }
    if (d.team) filters.push({ by: 'team', values: [d.team] });
    if (d.player) {
      const c = columnWith(d.player, /user|steam|player|pilot/i);
      if (c) filters.push({ by: 'category', column: c, values: [d.player] });
    }
    const specs = filters.map((f) => toFilterSpec(ds, f)).filter((f): f is FilterSpec => !!f);
    if (specs.length) useStore.getState().setFilters(specs);
    const p = req.place ?? req.insight?.place ?? null;
    if (p && engine) engine.frameAround(p.x, p.y, p.z, Math.max(p.radius * 1.6, p.cell * 2));
    return r.files.length;
  } finally {
    useMass.getState().set({ drilling: false });
  }
}
