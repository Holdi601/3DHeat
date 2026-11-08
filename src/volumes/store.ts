/**
 * The volumes the user has drawn, what is selected and being drawn, how they
 * filter the views, and an undo history.
 *
 * Saved per dataset in localStorage: loading the same data again brings its
 * volumes back, and a different dataset starts with its own (empty) set. The
 * history holds whole volume lists - they are a handful of small objects, so a
 * copy per edit is simpler and safer than inverse operations.
 */

import { create } from 'zustand';
import { useStore } from '../state/store';
import { useRaceStore } from '../state/raceStore';
import type { Dataset } from '../state/types';
import { newVolumeId, VOLUME_COLORS, type Volume, type VolumeFilter, type VolumeShape } from './volume';

export type DrawKind = 'box' | 'ngon' | 'polygon' | 'sphere' | 'cylinder';

/** How the statistics are laid out: the selected volume, or every volume side by side. */
export type StatsLayout = 'selected' | 'compare';

const HISTORY_LIMIT = 100;

export interface VolumeState {
  /** Which dataset the volumes belong to, or null before any is loaded. */
  datasetKey: string | null;
  volumes: Volume[];
  selected: string | null;
  filter: VolumeFilter;
  /** The tool armed: the next drag on the ground draws this shape. */
  drawing: DrawKind | null;
  /** Corners of the n-gon tool. */
  ngonSides: number;
  statsLayout: StatsLayout;
  /** Bumped to ask the Volumes panel to open and scroll into view. */
  focusNonce: number;
  past: Volume[][];
  future: Volume[][];

  add: (shape: VolumeShape, name?: string) => Volume;
  /** Add an imported list; history-recorded. */
  addMany: (volumes: Volume[]) => void;
  /** Replace a volume's fields. `record` false for the frames of a drag (see `checkpoint`). */
  update: (id: string, patch: Partial<Omit<Volume, 'id'>>, record?: boolean) => void;
  remove: (id: string) => void;
  clear: () => void;
  duplicate: (id: string, shape?: VolumeShape) => Volume | null;
  select: (id: string | null) => void;
  setFilter: (f: VolumeFilter) => void;
  startDraw: (kind: DrawKind) => void;
  cancelDraw: () => void;
  setNgonSides: (n: number) => void;
  setStatsLayout: (l: StatsLayout) => void;
  /** Record the current list before a drag, so the whole drag undoes as one step. */
  checkpoint: () => void;
  undo: () => void;
  redo: () => void;
  /** Switch to another dataset's saved volumes. */
  loadFor: (key: string | null) => void;
}

const STORAGE_PREFIX = '3dheat.volumes.';

/** A key naming a dataset across reloads: its name, size and extent - nothing that changes with settings. */
export function datasetKey(d: Dataset): string {
  const b = d.bounds;
  const r = (v: number) => (Number.isFinite(v) ? Math.round(v * 10) / 10 : 0);
  return `${d.name}|${d.count}|${r(b.minX)},${r(b.minY)},${r(b.minZ)},${r(b.maxX)},${r(b.maxY)},${r(b.maxZ)}`;
}

function readSaved(key: string): { volumes: Volume[]; filter: VolumeFilter } {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return { volumes: [], filter: 'off' };
    const v = JSON.parse(raw) as { volumes?: unknown; filter?: unknown };
    const volumes = Array.isArray(v.volumes) ? (v.volumes as Volume[]).filter((x) => x && typeof x.id === 'string' && x.shape) : [];
    const filter = v.filter === 'inside' || v.filter === 'outside' ? v.filter : 'off';
    return { volumes, filter };
  } catch {
    return { volumes: [], filter: 'off' };
  }
}

function save(key: string | null, volumes: Volume[], filter: VolumeFilter): void {
  if (!key) return;
  try {
    if (volumes.length === 0) localStorage.removeItem(STORAGE_PREFIX + key);
    else localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify({ volumes, filter }));
  } catch {
    // Private windows and full storage: the volumes last this session.
  }
}

/** The first "Volume n" name not taken. */
function nextName(volumes: Volume[], base = 'Volume'): string {
  const taken = new Set(volumes.map((v) => v.name));
  for (let i = volumes.length + 1; ; i++) {
    const n = `${base} ${i}`;
    if (!taken.has(n)) return n;
  }
}

export const useVolumeStore = create<VolumeState>((set, get) => {
  /** Apply a new list, recording the old one in the history. */
  const commit = (volumes: Volume[], extra: Partial<VolumeState> = {}) => {
    const s = get();
    set({
      volumes,
      past: [...s.past, s.volumes].slice(-HISTORY_LIMIT),
      future: [],
      ...extra,
    });
  };
  return {
    datasetKey: null,
    volumes: [],
    selected: null,
    filter: 'off',
    drawing: null,
    ngonSides: 8,
    statsLayout: 'selected',
    focusNonce: 0,
    past: [],
    future: [],

    add: (shape, name) => {
      const s = get();
      const v: Volume = {
        id: newVolumeId(),
        name: name ?? nextName(s.volumes),
        color: VOLUME_COLORS[s.volumes.length % VOLUME_COLORS.length],
        visible: true,
        op: 'include',
        shape,
      };
      commit([...s.volumes, v], { selected: v.id });
      return v;
    },
    addMany: (list) => {
      if (list.length === 0) return;
      commit([...get().volumes, ...list], { selected: list[list.length - 1].id });
    },
    update: (id, patch, record = true) => {
      const s = get();
      const volumes = s.volumes.map((v) => (v.id === id ? { ...v, ...patch, id } : v));
      if (record) commit(volumes);
      else set({ volumes });
    },
    remove: (id) => {
      const s = get();
      if (!s.volumes.some((v) => v.id === id)) return;
      commit(
        s.volumes.filter((v) => v.id !== id),
        { selected: s.selected === id ? null : s.selected },
      );
    },
    clear: () => {
      if (get().volumes.length === 0) return;
      commit([], { selected: null });
    },
    duplicate: (id, shape) => {
      const s = get();
      const src = s.volumes.find((v) => v.id === id);
      if (!src) return null;
      const copy: Volume = {
        ...src,
        id: newVolumeId(),
        name: nextName(s.volumes, src.name.replace(/\s+\d+$/, '') || 'Volume'),
        color: VOLUME_COLORS[s.volumes.length % VOLUME_COLORS.length],
        shape: shape ?? src.shape,
      };
      commit([...s.volumes, copy], { selected: copy.id });
      return copy;
    },
    select: (id) => set({ selected: id }),
    setFilter: (filter) => set({ filter }),
    startDraw: (kind) => set((s) => ({ drawing: kind, selected: null, focusNonce: s.focusNonce + 1 })),
    cancelDraw: () => set({ drawing: null }),
    setNgonSides: (n) => set({ ngonSides: Math.max(3, Math.min(64, Math.round(n))) }),
    setStatsLayout: (statsLayout) => set({ statsLayout }),
    checkpoint: () => {
      const s = get();
      set({ past: [...s.past, s.volumes].slice(-HISTORY_LIMIT), future: [] });
    },
    undo: () => {
      const s = get();
      const prev = s.past[s.past.length - 1];
      if (!prev) return;
      set({
        volumes: prev,
        past: s.past.slice(0, -1),
        future: [s.volumes, ...s.future].slice(0, HISTORY_LIMIT),
        selected: prev.some((v) => v.id === s.selected) ? s.selected : null,
      });
    },
    redo: () => {
      const s = get();
      const next = s.future[0];
      if (!next) return;
      set({
        volumes: next,
        past: [...s.past, s.volumes].slice(-HISTORY_LIMIT),
        future: s.future.slice(1),
        selected: next.some((v) => v.id === s.selected) ? s.selected : null,
      });
    },
    loadFor: (key) => {
      if (key === get().datasetKey) return;
      const saved = key ? readSaved(key) : { volumes: [], filter: 'off' as VolumeFilter };
      set({ datasetKey: key, volumes: saved.volumes, filter: saved.filter, selected: null, drawing: null, past: [], future: [] });
    },
  };
});

// Saved whenever the list or the filter changes, under the dataset they belong to.
let saveTimer: ReturnType<typeof setTimeout> | null = null;
useVolumeStore.subscribe((s, prev) => {
  if (s.volumes === prev.volumes && s.filter === prev.filter) return;
  if (s.datasetKey !== prev.datasetKey) return;
  if (saveTimer) clearTimeout(saveTimer);
  const { datasetKey: key, volumes, filter } = s;
  saveTimer = setTimeout(() => save(key, volumes, filter), 300);
});

// Each dataset brings its own volumes.
useStore.subscribe((s, prev) => {
  if (s.dataset === prev.dataset) return;
  useVolumeStore.getState().loadFor(s.dataset ? datasetKey(s.dataset) : null);
});
{
  const d = useStore.getState().dataset;
  if (d) useVolumeStore.getState().loadFor(datasetKey(d));
}

/**
 * Arm a drawing tool from anywhere, and go where it can be used: the vehicle
 * heatmap's view shows a vehicle, not the level, so it switches to the match
 * tab (whose data the hit analysis reads); the race and tactics tabs go to the
 * heatmap.
 */
export function drawFrom(kind: DrawKind): void {
  const race = useRaceStore.getState();
  if (race.tab === 'vehicle') race.setTab('match');
  else if (race.tab === 'race' || race.tab === 'plan') race.setTab('heat');
  useVolumeStore.getState().startDraw(kind);
}

/** The selected volume, or null. */
export function selectedVolume(s: Pick<VolumeState, 'volumes' | 'selected'>): Volume | null {
  return s.volumes.find((v) => v.id === s.selected) ?? null;
}
