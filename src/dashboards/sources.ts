/**
 * Where a dashboard's rows come from. The default source is the dataset
 * loaded in the view (`useStore`); a workspace with rows of its own - the
 * Vehicles tab's hits, a race's laps - registers a source, and a dashboard
 * that names it (`Dashboard.source`) reads those rows instead. A source is
 * any `Dataset`-shaped table: positions, optional time, team, player and
 * match, and attribute columns.
 */

import { useStore } from '../state/store';
import type { Dataset } from '../state/types';

export interface DashSource {
  /** `[a-z0-9-]`, kept in the dashboard. */
  id: string;
  /** Said in the dashboard's source picker. */
  label: string;
  dataset: () => Dataset | null;
  /** Calls back when the dataset changes (another one, or new rows); returns the unsubscribe. */
  subscribe: (cb: () => void) => () => void;
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

export function dashboardSources(): DashSource[] {
  return [...sources.values()];
}

/** Calls back when a source is added or taken away. */
export function onSourcesChanged(cb: () => void): () => void {
  changed.add(cb);
  return () => changed.delete(cb);
}
