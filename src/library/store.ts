/**
 * The Library's state in the page: whether it is shown, the filter, sort and
 * selection, the pages of items loaded so far (a grid of 100,000 loads only
 * what is scrolled to), facets, collections, folders, the queue and the
 * scanner's progress. Choices of layout are kept in this browser; the
 * catalogue itself is the core's.
 */

import { create } from 'zustand';
import { lib, type Collection, type FacetAnswer, type Filter, type Item, type Job, type Root, type Status } from './api';

export const PAGE = 200;

export type LibView = 'items' | 'maps' | 'dupes' | 'settings';
export type Layout = 'grid' | 'list';

interface Kept {
  layout: Layout;
  thumb: number;
  sort: string;
  desc: boolean;
  inspector: boolean;
}

const KEY = 'heat3d.library';

function kept(): Kept {
  const base: Kept = { layout: 'grid', thumb: 220, sort: 'started', desc: true, inspector: true };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<Kept> | null;
    if (!raw) return base;
    return {
      layout: raw.layout === 'list' ? 'list' : 'grid',
      thumb: typeof raw.thumb === 'number' ? Math.min(360, Math.max(140, raw.thumb)) : base.thumb,
      sort: typeof raw.sort === 'string' ? raw.sort : base.sort,
      desc: raw.desc !== false,
      inspector: raw.inspector !== false,
    };
  } catch {
    return base;
  }
}

export interface LibraryState extends Kept {
  open: boolean;
  /** Started as its own window (`?library`): items open in a viewer window of their own. */
  standalone: boolean;
  /** The catalogue answers (false: no library behind this page). */
  available: boolean | null;
  error: string | null;
  view: LibView;
  filter: Filter;
  total: number;
  /** Pages loaded, by page number; dropped when the filter or the order changes. */
  pages: Record<number, Item[]>;
  generation: number;
  selected: Set<number>;
  focus: number | null;
  anchor: number | null;
  facets: FacetAnswer | null;
  collections: Collection[];
  roots: Root[];
  status: Status | null;
  jobs: Job[];
  jobInfo: { paused: boolean; limit: number; running: number; counts: Record<string, number> } | null;
  queueOpen: boolean;
  addOpen: boolean;
  busy: string | null;
  set: (p: Partial<LibraryState>) => void;
  setOpen: (open: boolean) => void;
  setFilter: (f: Filter) => void;
  patchFilter: (p: Partial<Filter>) => void;
  setSort: (sort: string, desc: boolean) => void;
  setLayout: (l: Layout) => void;
  setThumb: (px: number) => void;
  toggleInspector: () => void;
}

export const useLibrary = create<LibraryState>((set, get) => {
  const keep = () => {
    const { layout, thumb, sort, desc, inspector } = get();
    try {
      localStorage.setItem(KEY, JSON.stringify({ layout, thumb, sort, desc, inspector }));
    } catch {
      // A browser that keeps nothing.
    }
  };
  const refilter = (filter: Filter) => {
    set((s) => ({ filter, pages: {}, generation: s.generation + 1, focus: null, anchor: null }));
    void reload();
  };
  return {
    ...kept(),
    open: false,
    standalone: false,
    available: null,
    error: null,
    view: 'items',
    filter: {},
    total: 0,
    pages: {},
    generation: 0,
    selected: new Set(),
    focus: null,
    anchor: null,
    facets: null,
    collections: [],
    roots: [],
    status: null,
    jobs: [],
    jobInfo: null,
    queueOpen: false,
    addOpen: false,
    busy: null,
    set: (p) => set(p),
    setOpen: (open) => {
      set({ open });
      // What the Extractors panel installed meanwhile: read again, and outputs marked outdated by it.
      if (open) void lib.reloadExtractors().catch(() => {}).finally(() => void refreshAll());
    },
    setFilter: (f) => refilter(f),
    patchFilter: (p) => refilter({ ...get().filter, ...p }),
    setSort: (sort, desc) => {
      set((s) => ({ sort, desc, pages: {}, generation: s.generation + 1 }));
      keep();
      void reload();
    },
    setLayout: (layout) => {
      set({ layout });
      keep();
    },
    setThumb: (thumb) => {
      set({ thumb });
      keep();
    },
    toggleInspector: () => {
      set((s) => ({ inspector: !s.inspector }));
      keep();
    },
  };
});

const inflight = new Map<string, Promise<void>>();

/** Loads one page of the current listing (once). */
export function loadPage(page: number): Promise<void> {
  const s = useLibrary.getState();
  const key = `${s.generation}:${page}`;
  if (s.pages[page] || inflight.has(key)) return inflight.get(key) ?? Promise.resolve();
  const gen = s.generation;
  const p = lib
    .items(s.filter, s.sort, s.desc, page * PAGE, PAGE)
    .then((r) => {
      if (useLibrary.getState().generation !== gen) return;
      useLibrary.setState((st) => ({ pages: { ...st.pages, [page]: r.items }, total: r.total, available: true, error: null }));
    })
    .catch((e: Error) => useLibrary.setState({ error: e.message, available: (e as { status?: number }).status === 0 ? false : useLibrary.getState().available }))
    .finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

/** The item at a position of the listing, when its page is loaded. */
export function itemAt(i: number): Item | undefined {
  const s = useLibrary.getState();
  return s.pages[Math.floor(i / PAGE)]?.[i % PAGE];
}

/** The listing and its facets again (after a filter change, a scan, an edit). */
export async function reload(): Promise<void> {
  const s = useLibrary.getState();
  const gen = s.generation;
  await Promise.all([
    loadPage(0),
    lib
      .facets(s.filter)
      .then((facets) => {
        if (useLibrary.getState().generation === gen) useLibrary.setState({ facets });
      })
      .catch(() => {}),
  ]);
}

/** Loads the pages in sight again, in place (no flicker), keeping the scroll and the selection. */
export function refreshItems(): void {
  const s = useLibrary.getState();
  const gen = s.generation;
  const loaded = Object.keys(s.pages).map(Number);
  if (!loaded.length) {
    void reload();
    return;
  }
  for (const n of loaded) {
    lib
      .items(s.filter, s.sort, s.desc, n * PAGE, PAGE)
      .then((r) => {
        if (useLibrary.getState().generation === gen) useLibrary.setState((st) => ({ pages: { ...st.pages, [n]: r.items }, total: r.total }));
      })
      .catch(() => {});
  }
  lib
    .facets(s.filter)
    .then((facets) => {
      if (useLibrary.getState().generation === gen) useLibrary.setState({ facets });
    })
    .catch(() => {});
}

export async function refreshSide(): Promise<void> {
  const [collections, roots] = await Promise.all([lib.collections().catch(() => null), lib.roots().catch(() => null)]);
  useLibrary.setState({ ...(collections ? { collections } : {}), ...(roots ? { roots } : {}) });
}

export async function refreshStatus(): Promise<Status | null> {
  try {
    const status = await lib.status();
    useLibrary.setState({ status, available: true });
    return status;
  } catch (e) {
    useLibrary.setState({ available: (e as { status?: number }).status === 0 || (e as { status?: number }).status === 404 ? false : useLibrary.getState().available, error: (e as Error).message });
    return null;
  }
}

export async function refreshJobs(): Promise<void> {
  try {
    const r = await lib.jobs();
    useLibrary.setState({ jobs: r.jobs, jobInfo: { paused: r.paused, limit: r.limit, running: r.running, counts: r.counts } });
  } catch {
    // Said by the status line.
  }
}

export async function refreshAll(): Promise<void> {
  const st = await refreshStatus();
  if (!st) return;
  await Promise.all([reload(), refreshSide(), refreshJobs()]);
}

let polling = 0;
let lastSeen = '';

/**
 * While the Library is shown: the status every second or two, and the listing
 * again when a scan or a job changed what is in it.
 */
export function startPolling(): () => void {
  const id = ++polling;
  let wasBusy = false;
  const tick = async () => {
    if (id !== polling) return;
    const st = await refreshStatus();
    if (st) {
      const busy = st.scan.running || st.jobs.running > 0 || st.jobs.queued > 0;
      // What changed since the last look: the count, the scan's progress, the queue.
      const seen = `${st.items}:${st.missing}:${st.outdated}:${st.unconverted}:${st.scan.done}:${st.jobs.running}:${st.jobs.queued}:${st.jobs.failed}`;
      if (seen !== lastSeen) {
        lastSeen = seen;
        refreshItems();
        void refreshSide();
      }
      if (busy || wasBusy || useLibrary.getState().queueOpen) void refreshJobs();
      wasBusy = busy;
    }
    window.setTimeout(tick, st && (st.scan.running || st.jobs.running) ? 1000 : 2500);
  };
  void tick();
  return () => {
    if (id === polling) polling++;
  };
}

/** Every id the current filter matches, in order. */
export async function allIds(): Promise<number[]> {
  const s = useLibrary.getState();
  return (await lib.ids(s.filter, s.sort, s.desc)).ids;
}

/** What actions act on: the selection, or the focused item. */
export function targets(): number[] {
  const s = useLibrary.getState();
  if (s.selected.size) return [...s.selected];
  return s.focus === null ? [] : [s.focus];
}
