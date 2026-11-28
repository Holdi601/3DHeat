/**
 * The dashboards, as an operation-log document (`state/sharedDocs.ts`):
 * three collections - `dashboards`, `pages`, `tiles` - each edit a batch of
 * add / set / del operations by id, so a shared session merges two people
 * editing different tiles and the session file keeps them. Saved in this
 * browser too (dashboards are not tied to one dataset: they read whatever
 * columns the loaded data has).
 *
 * Beside the document, this viewer's own state, never shared: the dashboard
 * open and its page, edit mode, the tile picked, undo / redo per dashboard,
 * and the interaction - cross-filter selection, drill states, a drill-through.
 */

import { create } from 'zustand';
import { applyCollectionOps, diffCollection, isDocBatch, newBatchId, registerSharedDoc, type DocBatch } from '../state/sharedDocs';
import { DASH_SCHEMA, makeDashboard, makeTile, newId, parseBundle, parseDashboard, parsePage, parseTile, reid, type DashBundle, type Dashboard, type FilterDef, type Page, type Tile, type TileKind } from './model';
import type { DrillState, Interaction, Selection } from './plan';

export const DASH_DOC = 'dashboards';
const COLLS = ['dashboards', 'pages', 'tiles'] as const;
const STORAGE = '3dheat.dashboards.v1';
const LOG_KEEP = 2000;
const UNDO_KEEP = 100;

export interface DashDoc {
  dashboards: Dashboard[];
  pages: Page[];
  tiles: Tile[];
}

type Fields = Record<string, unknown>;

export interface DashState extends DashDoc {
  log: DocBatch[];
  rev: number;
  author: string;
  /** The dashboard open in the window, and whether the window shows. */
  open: string | null;
  shown: boolean;
  /** The page shown per dashboard. */
  page: Record<string, string>;
  edit: boolean;
  picked: string | null;
  inter: Record<string, Interaction>;
  undo: Record<string, DashBundle[]>;
  redo: Record<string, DashBundle[]>;

  bundle: (dashId: string) => DashBundle | null;
  create: (name: string, from?: DashBundle | null, workspace?: string) => string;
  importBundle: (v: unknown) => string | null;
  remove: (dashId: string) => void;
  patchDash: (dashId: string, patch: Partial<Omit<Dashboard, 'id'>>) => void;
  addPage: (dashId: string, name?: string) => string;
  patchPage: (pageId: string, patch: Partial<Omit<Page, 'id' | 'dashId'>>) => void;
  removePage: (pageId: string) => void;
  addTile: (pageId: string, kind: TileKind, at: { x: number; y: number }, extra?: Partial<Tile>) => Tile;
  patchTile: (tileId: string, patch: Partial<Omit<Tile, 'id'>>) => void;
  removeTile: (tileId: string) => void;
  duplicateTile: (tileId: string) => Tile | null;
  /** A drag's frames: tiles move without a batch; `settle` logs the drag as one edit. */
  preview: (patches: { id: string; patch: Partial<Tile> }[]) => void;
  settle: () => void;
  /** A slicer's value: set (or cleared with null) on its page, or on the dashboard for an all-pages slicer. */
  setSlicer: (tileId: string, f: FilterDef | null) => void;
  /** Replace the filters of a level (the filter pane). */
  setFilters: (level: { dashId: string } | { pageId: string } | { tileId: string }, filters: FilterDef[]) => void;
  undoEdit: (dashId: string) => void;
  redoEdit: (dashId: string) => void;
  applyRemote: (batch: DocBatch) => void;
  replaceAll: (doc: DashDoc) => void;

  openDash: (dashId: string | null) => void;
  setShown: (v: boolean) => void;
  showPage: (dashId: string, pageId: string) => void;
  setEdit: (v: boolean) => void;
  pick: (tileId: string | null) => void;
  select: (dashId: string, sel: Selection | null) => void;
  setDrill: (dashId: string, tileId: string, st: DrillState | null) => void;
  drillThrough: (dashId: string, pageId: string, filters: FilterDef[]) => void;
  back: (dashId: string) => void;
}

function readSaved(): DashDoc {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE) : null;
    if (raw) return readDoc(JSON.parse(raw));
  } catch {
    // A private window, a broken entry: none saved.
  }
  return { dashboards: [], pages: [], tiles: [] };
}

/** A document from elsewhere (storage, a session file, a peer): every entity read again. */
export function readDoc(v: unknown): DashDoc {
  const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  const arr = (x: unknown) => (Array.isArray(x) ? x : []);
  const dashboards = arr(o.dashboards).map(parseDashboard).filter((d): d is Dashboard => !!d);
  const ids = new Set(dashboards.map((d) => d.id));
  const pages = arr(o.pages).map(parsePage).filter((p): p is Page => !!p && ids.has(p.dashId));
  const pids = new Set(pages.map((p) => p.id));
  const tiles = arr(o.tiles).map(parseTile).filter((t): t is Tile => !!t && pids.has(t.pageId));
  return { dashboards, pages, tiles };
}

const listeners = new Set<(b: DocBatch) => void>();

export function bundleOf(doc: DashDoc, dashId: string): DashBundle | null {
  const dashboard = doc.dashboards.find((d) => d.id === dashId);
  if (!dashboard) return null;
  const pages = doc.pages.filter((p) => p.dashId === dashId).sort((a, b) => a.order - b.order);
  const ids = new Set(pages.map((p) => p.id));
  return { schema: DASH_SCHEMA, dashboard, pages, tiles: doc.tiles.filter((t) => ids.has(t.pageId)) };
}

/** The dashboard a page or tile belongs to. */
function dashOfPage(doc: DashDoc, pageId: string): string | null {
  return doc.pages.find((p) => p.id === pageId)?.dashId ?? null;
}
function dashOfTile(doc: DashDoc, tileId: string): string | null {
  const t = doc.tiles.find((x) => x.id === tileId);
  return t ? dashOfPage(doc, t.pageId) : null;
}

const emptyInter = (pageId: string): Interaction => ({ pageId, selection: null, drill: {}, through: null });

export const useDash = create<DashState>((set, get) => {
  let dragBase: DashDoc | null = null;
  let dragDash: string | null = null;
  /** Apply a new document as this viewer's edit of one dashboard: logged, undoable, sent on. */
  const commit = (next: DashDoc, dashId: string | null, opts: { undo?: boolean; extra?: Partial<DashState> } = {}) => {
    const s = get();
    const from: DashDoc = dragBase ?? s;
    dragBase = null;
    dragDash = null;
    const ops = COLLS.flatMap((c) => diffCollection(c, from[c] as unknown as Fields[], next[c] as unknown as Fields[]));
    if (!ops.length) {
      set({ ...next, ...(opts.extra ?? {}) });
      return;
    }
    const batch: DocBatch = { doc: DASH_DOC, id: newBatchId(), author: s.author || 'local', at: Date.now(), ops };
    const patch: Partial<DashState> = { ...next, log: [...(s.log.length >= LOG_KEEP ? s.log.slice(-LOG_KEEP + 1) : s.log), batch], rev: s.rev + 1, ...(opts.extra ?? {}) };
    if (dashId && opts.undo !== false) {
      const before = bundleOf(from, dashId);
      if (before) {
        patch.undo = { ...s.undo, [dashId]: [...(s.undo[dashId] ?? []).slice(-UNDO_KEEP + 1), structuredClone(before)] };
        patch.redo = { ...s.redo, [dashId]: [] };
      }
    }
    set(patch);
    for (const l of listeners) l(batch);
  };
  const doc = (): DashDoc => {
    const s = get();
    return { dashboards: s.dashboards, pages: s.pages, tiles: s.tiles };
  };
  /** A dashboard's entities swapped for a bundle's (undo, redo). */
  const swapIn = (d: DashDoc, b: DashBundle): DashDoc => {
    const id = b.dashboard.id;
    const pages = new Set(d.pages.filter((p) => p.dashId === id).map((p) => p.id));
    return {
      dashboards: d.dashboards.some((x) => x.id === id) ? d.dashboards.map((x) => (x.id === id ? b.dashboard : x)) : [...d.dashboards, b.dashboard],
      pages: [...d.pages.filter((p) => p.dashId !== id), ...b.pages],
      tiles: [...d.tiles.filter((t) => !pages.has(t.pageId)), ...b.tiles],
    };
  };
  const init = readSaved();
  return {
    ...init,
    log: [],
    rev: 0,
    author: '',
    open: null,
    shown: false,
    page: {},
    edit: false,
    picked: null,
    inter: {},
    undo: {},
    redo: {},

    bundle: (dashId) => bundleOf(doc(), dashId),
    create: (name, from, workspace) => {
      const b = from ? reid(from) : makeDashboard(name, workspace ? { workspace } : {});
      if (from) b.dashboard.name = name || b.dashboard.name;
      if (workspace && !b.dashboard.workspace) b.dashboard.workspace = workspace;
      const d = doc();
      commit({ dashboards: [...d.dashboards, b.dashboard], pages: [...d.pages, ...b.pages], tiles: [...d.tiles, ...b.tiles] }, null, {
        extra: { open: b.dashboard.id, shown: true, page: { ...get().page, [b.dashboard.id]: b.pages[0].id } },
      });
      return b.dashboard.id;
    },
    importBundle: (v) => {
      const b = parseBundle(v);
      if (!b) return null;
      return get().create(b.dashboard.name, b);
    },
    remove: (dashId) => {
      const d = doc();
      const pages = new Set(d.pages.filter((p) => p.dashId === dashId).map((p) => p.id));
      const s = get();
      commit({ dashboards: d.dashboards.filter((x) => x.id !== dashId), pages: d.pages.filter((p) => p.dashId !== dashId), tiles: d.tiles.filter((t) => !pages.has(t.pageId)) }, null, {
        extra: s.open === dashId ? { open: null } : {},
      });
    },
    patchDash: (dashId, patch) => {
      const d = doc();
      commit({ ...d, dashboards: d.dashboards.map((x) => (x.id === dashId ? { ...x, ...patch, id: dashId } : x)) }, dashId);
    },
    addPage: (dashId, name) => {
      const d = doc();
      const n = d.pages.filter((p) => p.dashId === dashId);
      const page: Page = { id: newId('p'), dashId, name: name ?? `Page ${n.length + 1}`, order: n.reduce((m, p) => Math.max(m, p.order), -1) + 1 };
      commit({ ...d, pages: [...d.pages, page] }, dashId, { extra: { page: { ...get().page, [dashId]: page.id } } });
      return page.id;
    },
    patchPage: (pageId, patch) => {
      const d = doc();
      commit({ ...d, pages: d.pages.map((p) => (p.id === pageId ? { ...p, ...patch } : p)) }, dashOfPage(d, pageId));
    },
    removePage: (pageId) => {
      const d = doc();
      const dashId = dashOfPage(d, pageId);
      if (!dashId || d.pages.filter((p) => p.dashId === dashId).length <= 1) return;
      const rest = d.pages.filter((p) => p.id !== pageId);
      const s = get();
      const nextPage = rest.find((p) => p.dashId === dashId)!.id;
      commit({ ...d, pages: rest, tiles: d.tiles.filter((t) => t.pageId !== pageId) }, dashId, { extra: s.page[dashId] === pageId ? { page: { ...s.page, [dashId]: nextPage } } : {} });
    },
    addTile: (pageId, kind, at, extra) => {
      const d = doc();
      const t = makeTile(pageId, kind, at, extra);
      commit({ ...d, tiles: [...d.tiles, t] }, dashOfPage(d, pageId), { extra: { picked: t.id } });
      return t;
    },
    patchTile: (tileId, patch) => {
      const d = doc();
      commit({ ...d, tiles: d.tiles.map((t) => (t.id === tileId ? { ...t, ...patch, id: tileId } : t)) }, dashOfTile(d, tileId));
    },
    removeTile: (tileId) => {
      const d = doc();
      const dashId = dashOfTile(d, tileId);
      const s = get();
      // Its slicer value goes with it.
      const strip = (fs: FilterDef[] | undefined) => (fs?.some((f) => f.slicer === tileId) ? fs.filter((f) => f.slicer !== tileId) : fs);
      commit(
        {
          dashboards: d.dashboards.map((x) => (x.id === dashId && strip(x.filters) !== x.filters ? { ...x, filters: strip(x.filters) } : x)),
          pages: d.pages.map((p) => (strip(p.filters) !== p.filters ? { ...p, filters: strip(p.filters) } : p)),
          tiles: d.tiles.filter((t) => t.id !== tileId),
        },
        dashId,
        { extra: s.picked === tileId ? { picked: null } : {} },
      );
    },
    duplicateTile: (tileId) => {
      const d = doc();
      const t = d.tiles.find((x) => x.id === tileId);
      if (!t) return null;
      const copy: Tile = { ...structuredClone(t), id: newId('t'), y: t.y + t.h };
      commit({ ...d, tiles: [...d.tiles, copy] }, dashOfTile(d, tileId), { extra: { picked: copy.id } });
      return copy;
    },
    preview: (patches) => {
      const s = get();
      if (!dragBase) {
        dragBase = doc();
        dragDash = patches[0] ? dashOfTile(dragBase, patches[0].id) : null;
      }
      const by = new Map(patches.map((p) => [p.id, p.patch]));
      set({ tiles: s.tiles.map((t) => (by.has(t.id) ? { ...t, ...by.get(t.id)!, id: t.id } : t)) });
    },
    settle: () => {
      if (dragBase) commit(doc(), dragDash);
    },
    setSlicer: (tileId, f) => {
      const d = doc();
      const t = d.tiles.find((x) => x.id === tileId);
      if (!t) return;
      const dashId = dashOfTile(d, tileId);
      const put = (fs: FilterDef[] | undefined) => {
        const rest = (fs ?? []).filter((x) => x.slicer !== tileId);
        return f ? [...rest, { ...f, slicer: tileId }] : rest;
      };
      const all = !!t.opts?.allPages;
      const without = (fs: FilterDef[] | undefined) => (fs ?? []).filter((x) => x.slicer !== tileId);
      commit(
        {
          ...d,
          dashboards: d.dashboards.map((x) => (x.id === dashId ? { ...x, filters: all ? put(x.filters) : without(x.filters) } : x)),
          pages: d.pages.map((p) => (p.id === t.pageId ? { ...p, filters: all ? without(p.filters) : put(p.filters) } : p)),
        },
        dashId,
      );
    },
    setFilters: (level, filters) => {
      const d = doc();
      if ('dashId' in level) commit({ ...d, dashboards: d.dashboards.map((x) => (x.id === level.dashId ? { ...x, filters } : x)) }, level.dashId);
      else if ('pageId' in level) commit({ ...d, pages: d.pages.map((p) => (p.id === level.pageId ? { ...p, filters } : p)) }, dashOfPage(d, level.pageId));
      else commit({ ...d, tiles: d.tiles.map((t) => (t.id === level.tileId ? { ...t, filters } : t)) }, dashOfTile(d, level.tileId));
    },
    undoEdit: (dashId) => {
      const s = get();
      const stack = s.undo[dashId] ?? [];
      const prev = stack[stack.length - 1];
      if (!prev) return;
      const cur = bundleOf(doc(), dashId);
      commit(swapIn(doc(), prev), dashId, {
        undo: false,
        extra: { undo: { ...s.undo, [dashId]: stack.slice(0, -1) }, redo: { ...s.redo, [dashId]: [...(s.redo[dashId] ?? []), ...(cur ? [structuredClone(cur)] : [])] } },
      });
    },
    redoEdit: (dashId) => {
      const s = get();
      const stack = s.redo[dashId] ?? [];
      const next = stack[stack.length - 1];
      if (!next) return;
      const cur = bundleOf(doc(), dashId);
      commit(swapIn(doc(), next), dashId, {
        undo: false,
        extra: { redo: { ...s.redo, [dashId]: stack.slice(0, -1) }, undo: { ...s.undo, [dashId]: [...(s.undo[dashId] ?? []), ...(cur ? [structuredClone(cur)] : [])] } },
      });
    },
    applyRemote: (batch) => {
      const s = get();
      if (!isDocBatch(batch, DASH_DOC) || s.log.some((b) => b.id === batch.id)) return;
      const next = readDoc({
        dashboards: applyCollectionOps(s.dashboards, 'dashboards', batch.ops),
        pages: applyCollectionOps(s.pages, 'pages', batch.ops),
        tiles: applyCollectionOps(s.tiles, 'tiles', batch.ops),
      });
      set({ ...next, log: [...(s.log.length >= LOG_KEEP ? s.log.slice(-LOG_KEEP + 1) : s.log), batch], rev: s.rev + 1 });
    },
    replaceAll: (d) => commit(readDoc(structuredClone(d)), null),

    openDash: (dashId) => set({ open: dashId, shown: dashId !== null || get().shown, picked: null }),
    setShown: (shown) => set({ shown }),
    showPage: (dashId, pageId) => {
      const s = get();
      const it = s.inter[dashId];
      set({ page: { ...s.page, [dashId]: pageId }, picked: null, inter: { ...s.inter, [dashId]: { ...(it ?? emptyInter(pageId)), pageId, selection: it?.selection?.pageId === pageId ? it.selection : null } } });
    },
    setEdit: (edit) => set({ edit, picked: edit ? get().picked : null }),
    pick: (picked) => set({ picked }),
    select: (dashId, sel) => {
      const s = get();
      const it = s.inter[dashId] ?? emptyInter(s.page[dashId] ?? '');
      set({ inter: { ...s.inter, [dashId]: { ...it, selection: sel } } });
    },
    setDrill: (dashId, tileId, st) => {
      const s = get();
      const it = s.inter[dashId] ?? emptyInter(s.page[dashId] ?? '');
      const drill = { ...it.drill };
      if (st) drill[tileId] = st;
      else delete drill[tileId];
      // A drill changes what the marks are: a selection on that tile no longer means them.
      set({ inter: { ...s.inter, [dashId]: { ...it, drill, selection: it.selection?.tileId === tileId ? null : it.selection } } });
    },
    drillThrough: (dashId, pageId, filters) => {
      const s = get();
      const from = s.page[dashId] ?? '';
      const it = s.inter[dashId] ?? emptyInter(from);
      set({ page: { ...s.page, [dashId]: pageId }, inter: { ...s.inter, [dashId]: { ...it, pageId, selection: null, through: { pageId, filters, from } } } });
    },
    back: (dashId) => {
      const s = get();
      const it = s.inter[dashId];
      if (!it?.through) return;
      const from = it.through.from;
      set({ page: { ...s.page, [dashId]: from }, inter: { ...s.inter, [dashId]: { ...it, pageId: from, through: null, selection: null } } });
    },
  };
});

/** The page a dashboard shows now (its first page when none was picked). */
export function pageShown(s: Pick<DashState, 'pages' | 'page'>, dashId: string): Page | null {
  const pages = s.pages.filter((p) => p.dashId === dashId).sort((a, b) => a.order - b.order);
  return pages.find((p) => p.id === s.page[dashId]) ?? pages[0] ?? null;
}

/** The interaction with a dashboard, for a page. */
export function interOf(s: Pick<DashState, 'inter'>, dashId: string, pageId: string): Interaction {
  const it = s.inter[dashId];
  return it ? { ...it, pageId } : emptyInter(pageId);
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
useDash.subscribe((s, p) => {
  if (s.dashboards === p.dashboards && s.pages === p.pages && s.tiles === p.tiles) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const st = useDash.getState();
      localStorage.setItem(STORAGE, JSON.stringify({ dashboards: st.dashboards, pages: st.pages, tiles: st.tiles }));
    } catch {
      // Full storage: the session file and an export still keep them.
    }
  }, 400);
});

registerSharedDoc({
  key: DASH_DOC,
  colls: COLLS,
  get: () => {
    const s = useDash.getState();
    return { dashboards: s.dashboards, pages: s.pages, tiles: s.tiles };
  },
  set: (state) => {
    const d = readDoc(state);
    const s = useDash.getState();
    useDash.setState({ ...d, open: s.open && d.dashboards.some((x) => x.id === s.open) ? s.open : null });
  },
  empty: () => ({ dashboards: [], pages: [], tiles: [] }),
  hasContent: (state) => Array.isArray((state as DashDoc).dashboards) && (state as DashDoc).dashboards.length > 0,
  // A private dashboard keeps its pages and tiles to itself too.
  privacy: (state) => {
    const d = state as Partial<DashDoc>;
    const dashes = new Set((d.dashboards ?? []).filter((x) => x.private === true).map((x) => x.id));
    const pages = new Set((d.pages ?? []).filter((p) => dashes.has(p.dashId)).map((p) => p.id));
    return (coll, e) => (coll === 'dashboards' ? e.private === true : coll === 'pages' ? dashes.has(e.dashId as string) : coll === 'tiles' ? pages.has(e.pageId as string) : false);
  },
});

/** Each batch of this viewer's own edits, as it is made. */
export function onLocalDashBatch(cb: (b: DocBatch) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
