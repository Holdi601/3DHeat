/**
 * The page's side of the person-hit analysis (docs/person-hits.md): the
 * worker (`worker.ts`) and what the panel asks of it. Every change of the
 * filter or the colouring asks for one view - the latest only, never on the
 * frame path - whose region colours and marks the body view draws.
 */

import { create } from 'zustand';
import { detectBudgets } from '../data/memory';
import type { Facets, PersonFilter, PersonHitDetail, RegionMetric } from './analyze';
import type { PersonLoadStats, PersonRows, PersonView, PersonWorkerReply, PersonWorkerRequest } from './worker';

export interface PersonHitsState {
  /** The Vehicles tab shows the person-hit analysis. */
  active: boolean;
  stats: PersonLoadStats | null;
  facets: Facets | null;
  error: string | null;
  filter: PersonFilter;
  metric: RegionMetric;
  mode: 'auto' | 'fine' | 'coarse';
  /** The body drawn: the generic figure or a pack model (`cs2:ctm_fbi`). */
  figure: string;
  marks: number;
  /** The region (or zone) picked, -1 none. */
  region: number;
  result: PersonView | null;
  /** The hit picked on the body (its mark), for its card. */
  detail: PersonHitDetail | null;
  busy: boolean;
  set: (p: Partial<PersonHitsState>) => void;
}

export const usePersonHits = create<PersonHitsState>((set) => ({
  active: false,
  stats: null,
  facets: null,
  error: null,
  filter: {},
  metric: 'share',
  mode: 'auto',
  figure: 'generic',
  marks: 1500,
  region: -1,
  result: null,
  detail: null,
  busy: false,
  set: (p) => set(p),
}));

let worker: Worker | null = null;
let nextId = 1;
const waiting = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
const viewListeners = new Set<() => void>();

function ensure(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = (e: MessageEvent<PersonWorkerReply>) => {
    const m = e.data;
    if (m.type === 'progress') {
      const s = usePersonHits.getState();
      s.set({ stats: m.stats, ...(m.facets ? { facets: m.facets } : {}) });
      if (!m.stats.running || m.stats.hits !== (s.result?.total ?? -1)) scheduleView();
    } else if (m.type === 'error') usePersonHits.getState().set({ error: m.message });
    else if (m.type === 'answer' || m.type === 'failed') {
      const w = waiting.get(m.id);
      if (!w) return;
      waiting.delete(m.id);
      if (m.type === 'answer') w.resolve(m.value);
      else w.reject(new Error(m.message));
    }
  };
  return worker;
}

/** A question to the worker, without its id. */
type PersonAsk = PersonWorkerRequest extends infer R ? (R extends { id: number } ? Omit<R, 'id'> : never) : never;

/** Ask the worker (a view, the dashboards' rows, the coverage). */
export function askPerson<T>(q: PersonAsk): Promise<T> {
  const w = ensure();
  const id = nextId++;
  return new Promise<T>((resolve, reject) => {
    waiting.set(id, { resolve: resolve as (v: unknown) => void, reject });
    w.postMessage({ ...q, id } as PersonWorkerRequest);
  });
}

/** Loads files (a folder's), adding to what is loaded or in place of it. */
export function loadPersonHits(files: File[], add = false): void {
  const w = ensure();
  const budget = Math.min(3.5 * 2 ** 30, detectBudgets().ram / 2);
  const jobs = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 4) - 2));
  usePersonHits.getState().set({ active: true, error: null, detail: null, ...(add ? {} : { result: null, facets: null }) });
  w.postMessage({ type: 'load', files, add, jobs, budget, cache: true } satisfies PersonWorkerRequest);
}

export function cancelPersonHits(): void {
  worker?.postMessage({ type: 'cancel' } satisfies PersonWorkerRequest);
}

let pending = false;
let asked = 0;
/** One view after the current one, the latest settings only. */
export function scheduleView(): void {
  if (pending) return;
  pending = true;
  queueMicrotask(async () => {
    pending = false;
    const s = usePersonHits.getState();
    if (!s.stats?.hits) return;
    const my = ++asked;
    s.set({ busy: true });
    try {
      const r = await askPerson<PersonView>({ type: 'view', filter: s.filter, metric: s.metric, mode: s.mode, marks: s.marks });
      if (my !== asked) return;
      usePersonHits.getState().set({ result: r, busy: false });
      for (const cb of viewListeners) cb();
    } catch (e) {
      usePersonHits.getState().set({ error: (e as Error).message, busy: false });
    }
  });
}

/** Called after each view arrives (the dashboards' source). */
export function onPersonView(cb: () => void): () => void {
  viewListeners.add(cb);
  return () => viewListeners.delete(cb);
}

export function patchPersonFilter(p: Partial<PersonFilter>): void {
  const s = usePersonHits.getState();
  s.set({ filter: { ...s.filter, ...p } });
  scheduleView();
}

export function patchPerson(p: Partial<PersonHitsState>): void {
  usePersonHits.getState().set(p);
  scheduleView();
}

/** A hit's whole record for its card (a mark picked on the body); null clears the card. */
export async function showPersonHit(index: number | null): Promise<void> {
  if (index === null || index < 0) return usePersonHits.getState().set({ detail: null });
  const d = await askPerson<PersonHitDetail | null>({ type: 'hit', index });
  usePersonHits.getState().set({ detail: d });
}

export function personRows(limit: number): Promise<PersonRows> {
  return askPerson<PersonRows>({ type: 'rows', filter: usePersonHits.getState().filter, limit });
}
