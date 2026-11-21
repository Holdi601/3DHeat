/**
 * Where a dashboard's rows come from. The default source is the dataset
 * loaded in the view (`useStore`); a workspace with rows of its own - the
 * Vehicles tab's hits, a race's laps - registers a source, and a dashboard
 * that names it (`Dashboard.source`) reads those rows instead. A source is
 * any `Dataset`-shaped table: positions, optional time, team, player and
 * match, and attribute columns.
 *
 * A registered source links to its own 3D view through three optional hooks,
 * the same two ways the loaded data does: `viewMask` (+ `onViewChange`) for
 * Follow the view and Selected volume - the view narrows the tiles - and
 * `applySelection` for Drive the view - the dashboard's selection and
 * slicers narrow the view.
 */

import { useStore } from '../state/store';
import type { Dataset, FilterSpec } from '../state/types';
import type { Volume } from '../volumes/volume';

/** What a dashboard asks of its source's 3D view (Follow the view, Selected volume). */
export interface SourceViewInputs {
  /** Follow the view is on: the rows the source's view shows now (its time window, its filters). */
  followView: boolean;
  /** Selected volume is on and a volume is selected: only the rows inside it. */
  volume: Volume | null;
}

/** The rows a source's 3D view shows. */
export interface SourceMask {
  /** Changes whenever the mask does (a counter, a version): the workers keep one bitset per key. */
  key: string;
  /** Per row of the source's dataset (`dataset().count` long), non-zero where the view shows it. */
  mask: Uint8Array;
}

/** What a dashboard looks at, for the source's 3D view (Drive the view). */
export interface SourceSelection {
  dashId: string;
  /**
   * The dashboard's and the page's filters, its slicers and the selection,
   * as view filters over the source's own columns (`teams`, `persons`,
   * `categories` and `range` by column name) - one per column, the selection
   * winning over a slicer of the same column.
   */
  filters: FilterSpec[];
  /** The marks picked on the dashboard, in words: per field its name and the labels picked. */
  picked: { field: string; name: string; labels: string[] }[];
}

export interface DashSource {
  /** `[a-z0-9-]`, kept in the dashboard. */
  id: string;
  /** Said in the dashboard's source picker. */
  label: string;
  dataset: () => Dataset | null;
  /** Calls back when the dataset changes (another one, or new rows); returns the unsubscribe. */
  subscribe: (cb: () => void) => () => void;
  /**
   * Follow the view and Selected volume for this source: which of its rows
   * its 3D view shows now (null: every row). Called on each count while either
   * is on. Leave out what `applySelection` put on the view, so the dashboard
   * and the view never feed each other.
   */
  viewMask?: (inputs: SourceViewInputs) => SourceMask | null;
  /** Calls back when what `viewMask` returns changes (playback, the view's filters, the volume); returns the unsubscribe. */
  onViewChange?: (cb: () => void) => () => void;
  /** Drive the view for this source: the dashboard's selection and slicers; null takes them off again (link or window closed). */
  applySelection?: (sel: SourceSelection | null) => void;
}

export const VIEW_SOURCE = 'view';

const sources = new Map<string, DashSource>();
const changed = new Set<() => void>();

sources.set(VIEW_SOURCE, {
  id: VIEW_SOURCE,
  label: 'The loaded data',
  dataset: () => useStore.getState().dataset,
  subscribe: (cb) => useStore.subscribe((s, p) => s.dataset !== p.dataset && cb()),
});

/** Adds (or replaces) a source; returns the function that takes it away again. */
export function registerDashboardSource(s: DashSource): () => void {
  sources.set(s.id, s);
  for (const c of changed) c();
  return () => {
    if (sources.get(s.id) === s) sources.delete(s.id);
    for (const c of changed) c();
  };
}

export function dashboardSource(id: string | undefined): DashSource {
  return sources.get(id ?? VIEW_SOURCE) ?? sources.get(VIEW_SOURCE)!;
}

/** A registered source by id, never the fallback: null for the loaded data or a source that is gone. */
export function registeredSource(id: string | undefined): DashSource | null {
  if (!id || id === VIEW_SOURCE) return null;
  return sources.get(id) ?? null;
}

export function dashboardSources(): DashSource[] {
  return [...sources.values()];
}

/** Calls back when a source is added or taken away. */
export function onSourcesChanged(cb: () => void): () => void {
  changed.add(cb);
  return () => changed.delete(cb);
}
