/**
 * Saved analysis views: the camera, the mode, the filters, the layers, the
 * selection and the time, with a note - kept in this browser, listed, renamed,
 * deleted, and written to or read from a JSON file.
 *
 * A view is saved by names, not by the dataset's indices: a category filter as
 * its values, a team as its label, a session as its label, a unit as its key.
 * Restored onto another load of the same data - or a different file with the
 * same columns - it means the same; whatever the data lacks is left out and
 * said (`applyView`'s list of what could not be restored).
 */

import { create } from 'zustand';
import type { Engine } from '../render/engine';
import { toFilterSpec } from '../insights/apply';
import type { InsightFilter } from '../insights/types';
import { useStore, type CameraSettings, type HeatSettings, type SliceSettings, type TimelineSettings } from './store';
import type { LineSettings } from '../data/lines';
import type { FilterSpec, ViewMode } from './types';
import { useReplayStore, type DisplayAids } from './replayStore';
import { useVolumeStore } from '../volumes/store';
import type { Volume, VolumeFilter } from '../volumes/volume';
import { useObjectivesStore } from './objectivesStore';
import { useInspectStore } from './inspectStore';
import { useContourPrefs } from '../render/volumeContours';
import { unitsOf } from '../ui/replay/units';
import { useSignStore } from '../volumes/signs/store';
import { parseSign, type Sign } from '../volumes/signs/sign';

type Vec3 = { x: number; y: number; z: number };

/** A filter by names (`InsightFilter`), or a numeric range as it is. */
export type SavedFilter = InsightFilter | { by: 'range'; column: string; min: number; max: number };

export interface ViewState {
  mode: ViewMode;
  camera: { position: Vec3; forward: Vec3; fov: number; projection: CameraSettings['projection']; orthoHeight: number };
  timeline: Omit<TimelineSettings, 'seekNonce' | 'playing'>;
  filters: SavedFilter[];
  /** Hidden groups by label. */
  hiddenTeams: string[];
  /** The match or round, by its session label; null for all. */
  session: string | null;
  heat: HeatSettings;
  lines: LineSettings;
  slice: SliceSettings;
  volumes: { list: Volume[]; filter: VolumeFilter; selected: string | null };
  /** The chart signs on the volumes (absent in views saved before them). */
  signs?: Sign[];
  layers: {
    objectives: { on: boolean; labels: boolean };
    contours: { on: boolean; width: number };
    heatLabels: { on: boolean; count: number };
    aids: DisplayAids;
  };
  selection: { unit: string | null; follow: string | null; followMode: string };
}

export interface SavedView {
  id: string;
  name: string;
  note: string;
  savedAt: number;
  /** The data it was saved on, by name: shown beside it, not required to restore it. */
  dataset: string;
  view: ViewState;
}

export interface ViewFile {
  schema: 'heat3d.views/1';
  views: SavedView[];
}

const KEY = 'heat3d.savedViews';

function filterToSaved(f: FilterSpec, labels: { categories: (column: string) => string[] | undefined; teams: string[]; persons: string[] }): SavedFilter | null {
  if (f.kind === 'range') return { by: 'range', column: f.column, min: f.min, max: f.max };
  if (f.kind === 'categories') {
    const cats = labels.categories(f.column);
    return cats ? { by: 'category', column: f.column, values: f.allowed.map((i) => cats[i]).filter((v) => v !== undefined) } : null;
  }
  if (f.kind === 'teams') return { by: 'team', values: f.allowed.map((i) => labels.teams[i]).filter((v) => v !== undefined) };
  return { by: 'person', values: f.allowed.map((i) => labels.persons[i]).filter((v) => v !== undefined) };
}

/** What is on screen now, by names. */
export function captureView(engine: Engine): ViewState {
  const s = useStore.getState();
  const ds = s.dataset;
  const pose = engine.cameraPose();
  const labels = {
    categories: (c: string) => ds?.attrs.find((a) => a.name === c)?.categories,
    teams: ds?.teamLabels ?? [],
    persons: ds?.personLabels ?? [],
  };
  const r = useReplayStore.getState();
  const vs = useVolumeStore.getState();
  const obj = useObjectivesStore.getState();
  const ins = useInspectStore.getState();
  const cp = useContourPrefs.getState();
  const units = ds ? unitsOf(ds) : null;
  const followKey = r.followUnit ?? (r.follow !== null && units ? (units.units[units.personUnit[r.follow]]?.key ?? null) : null);
  const { seekNonce: _n, playing: _p, ...timeline } = s.timeline;
  return {
    mode: s.mode,
    camera: { position: pose.position, forward: pose.forward, fov: s.camera.fov, projection: s.camera.projection, orthoHeight: engine.camera.orthoHeight },
    timeline: { ...timeline, playhead: engine.live.playhead },
    filters: s.filters.map((f) => filterToSaved(f, labels)).filter((f): f is SavedFilter => !!f),
    hiddenTeams: Object.entries(s.teamVisibility)
      .filter(([, v]) => v === false)
      .map(([k]) => labels.teams[Number(k)])
      .filter((v): v is string => v !== undefined),
    session: s.team.session >= 0 && ds ? (ds.sessionLabels[s.team.session] ?? null) : null,
    heat: structuredClone(s.heat),
    lines: structuredClone(s.lines),
    slice: { ...s.slice },
    volumes: { list: structuredClone(vs.volumes) as Volume[], filter: vs.filter, selected: vs.selected },
    signs: structuredClone(useSignStore.getState().signs),
    layers: {
      objectives: { on: obj.on, labels: obj.labels },
      contours: { on: cp.on, width: cp.width },
      heatLabels: { on: ins.heatLabels, count: ins.heatLabelCount },
      aids: { ...r.aids },
    },
    selection: { unit: r.selected, follow: followKey, followMode: r.followMode },
  };
}

/**
 * Put a view back. Returns what could not be restored on this data, as
 * short descriptions (a filter's column, a team, a session, a unit).
 */
export function applyView(engine: Engine, v: ViewState): string[] {
  const missing: string[] = [];
  const st = useStore.getState();
  const ds = st.dataset;
  if (st.mode !== v.mode) st.setMode(v.mode);
  // Filters by names onto this data.
  const filters: FilterSpec[] = [];
  for (const f of v.filters) {
    if (f.by === 'range') {
      if (ds?.attrs.some((a) => a.name === f.column)) filters.push({ kind: 'range', column: f.column, min: f.min, max: f.max });
      else missing.push(f.column);
      continue;
    }
    const spec = ds ? toFilterSpec(ds, f) : null;
    if (spec) filters.push(spec);
    else missing.push(f.by === 'category' ? f.column : f.values.join(', '));
  }
  st.setFilters(filters);
  // Groups shown and hidden.
  if (ds) {
    ds.teamLabels.forEach((label, i) => {
      const hide = v.hiddenTeams.includes(label);
      if ((st.teamVisibility[i] === false) !== hide) useStore.getState().toggleTeam(i, !hide);
    });
  }
  // The match, then the time.
  const session = v.session === null ? -1 : (ds?.sessionLabels.indexOf(v.session) ?? -1);
  if (v.session !== null && session < 0) missing.push(v.session);
  useStore.getState().patchTeam({ session });
  const { playhead, ...timeline } = v.timeline;
  useStore.getState().patchTimeline(timeline);
  useStore.getState().seek(playhead);
  useStore.getState().patchHeat(v.heat);
  useStore.getState().patchLines(v.lines);
  useStore.getState().patchSlice(v.slice);
  useStore.getState().patchCamera({ fov: v.camera.fov, projection: v.camera.projection });
  // Layers.
  const vs = useVolumeStore.getState();
  vs.clear();
  if (v.volumes.list.length) vs.addMany(structuredClone(v.volumes.list));
  vs.setFilter(v.volumes.filter);
  if (v.volumes.selected) vs.select(v.volumes.selected);
  if (Array.isArray(v.signs)) useSignStore.getState().replaceAll(v.signs.map(parseSign).filter((x): x is Sign => !!x));
  const obj = useObjectivesStore.getState();
  if (obj.on !== v.layers.objectives.on) obj.setOn(v.layers.objectives.on);
  if (obj.labels !== v.layers.objectives.labels) obj.setLabels(v.layers.objectives.labels);
  useContourPrefs.getState().set(v.layers.contours);
  useInspectStore.getState().patch({ heatLabels: v.layers.heatLabels.on, heatLabelCount: v.layers.heatLabels.count });
  const r = useReplayStore.getState();
  r.setAids(v.layers.aids);
  // The selection: units by key.
  const units = ds ? unitsOf(ds) : null;
  r.stopFollow();
  if (v.selection.unit && !units?.byKey.has(v.selection.unit)) missing.push(v.selection.unit);
  r.select(v.selection.unit && units?.byKey.has(v.selection.unit) ? v.selection.unit : null);
  // The camera last, after the mode switch had its say, and again a moment later
  // in case the switch framed the data on its next frame.
  const place = () => {
    if (v.selection.follow && units?.byKey.has(v.selection.follow)) return;
    engine.setCameraPose(v.camera.position, v.camera.forward);
    if (v.camera.projection === 'orthographic') engine.camera.orthoHeight = v.camera.orthoHeight;
    engine.invalidate(3);
  };
  place();
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => requestAnimationFrame(place));
  if (v.selection.follow && units) {
    const u = units.byKey.get(v.selection.follow);
    if (u) {
      r.patchSaved({ followMode: v.selection.followMode as typeof r.followMode });
      useReplayStore.setState({ follow: u.persons[0] ?? null, followUnit: u.key, selected: u.key });
    } else missing.push(v.selection.follow);
  }
  return missing;
}

function newId(): string {
  return `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** Saved views from JSON; what is not one is left out. */
export function readViews(json: unknown): SavedView[] {
  const list = Array.isArray(json) ? json : json && typeof json === 'object' && Array.isArray((json as ViewFile).views) ? (json as ViewFile).views : [];
  const out: SavedView[] = [];
  for (const x of list) {
    if (!x || typeof x !== 'object') continue;
    const o = x as Record<string, unknown>;
    const view = o.view as ViewState | undefined;
    if (!view || typeof view !== 'object' || typeof view.mode !== 'string' || !view.camera || !view.timeline) continue;
    const p = view.camera.position;
    if (!p || ![p.x, p.y, p.z].every(Number.isFinite)) continue;
    out.push({
      id: typeof o.id === 'string' && o.id ? o.id : newId(),
      name: typeof o.name === 'string' && o.name.trim() ? o.name.trim().slice(0, 120) : 'View',
      note: typeof o.note === 'string' ? o.note.slice(0, 4000) : '',
      savedAt: typeof o.savedAt === 'number' ? o.savedAt : Date.now(),
      dataset: typeof o.dataset === 'string' ? o.dataset : '',
      view: {
        ...view,
        filters: Array.isArray(view.filters) ? view.filters : [],
        hiddenTeams: Array.isArray(view.hiddenTeams) ? view.hiddenTeams : [],
        volumes: view.volumes && Array.isArray(view.volumes.list) ? view.volumes : { list: [], filter: 'off', selected: null },
      },
    });
  }
  return out;
}

export function viewsToJson(views: SavedView[]): string {
  const file: ViewFile = { schema: 'heat3d.views/1', views };
  return JSON.stringify(file, null, 1);
}

function load(): SavedView[] {
  try {
    return readViews(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
  } catch {
    return [];
  }
}

interface ViewsState {
  views: SavedView[];
  add: (name: string, note: string, dataset: string, view: ViewState) => SavedView;
  update: (id: string, p: Partial<Pick<SavedView, 'name' | 'note' | 'view'>>) => void;
  remove: (id: string) => void;
  /** Adds a file's views; one with an id already here replaces it. Returns how many. */
  merge: (views: SavedView[]) => number;
}

export const useSavedViews = create<ViewsState>((set, get) => {
  const persist = (views: SavedView[]) => {
    set({ views });
    try {
      localStorage.setItem(KEY, JSON.stringify(views));
    } catch {
      // Storage full or blocked: this session only.
    }
  };
  return {
    views: load(),
    add: (name, note, dataset, view) => {
      const v: SavedView = { id: newId(), name: name.trim() || 'View', note, savedAt: Date.now(), dataset, view };
      persist([...get().views, v]);
      return v;
    },
    update: (id, p) => persist(get().views.map((v) => (v.id === id ? { ...v, ...p, name: p.name !== undefined ? p.name.trim() || v.name : v.name } : v))),
    remove: (id) => persist(get().views.filter((v) => v.id !== id)),
    merge: (views) => {
      const byId = new Map(get().views.map((v) => [v.id, v]));
      for (const v of views) byId.set(v.id, v);
      persist([...byId.values()]);
      return views.length;
    },
  };
});
