/**
 * The rows the view shows, as the statistics and the export count them: the
 * time window at the playhead, the filters, the hidden groups and, in the
 * replay, the match played back. Built from the store, by the rules the
 * engine's frame uses (render/engine.ts, "visible time range").
 */

import { buildActiveFilters, buildGroupTable } from '../render/filterTables';
import type { useStore } from '../state/store';
import type { Dataset, FilterSpec } from '../state/types';
import type { Scope } from './stats';

type AppState = ReturnType<typeof useStore.getState>;

export function currentScope(s: AppState, playhead: number): Scope {
  const ds = s.dataset;
  const tl = s.timeline;
  const range = ds ? ds.timeRange : [0, 0];
  const showAll = tl.mode === 'all' || !ds?.time;
  const lifetime = !showAll && tl.window === 'lifetime' && !!ds?.lifetime;
  let timeLo = -Infinity;
  let timeHi = Infinity;
  if (!showAll) {
    timeHi = playhead;
    timeLo = tl.window === 'fixed' ? Math.max(range[0], playhead - tl.windowSeconds) : -Infinity;
  }
  return {
    timeLo,
    timeHi,
    lifetimeNow: lifetime ? playhead : null,
    defaultLifetime: tl.defaultLifetime,
    filters: buildActiveFilters(ds, s.filters),
    groupShown: buildGroupTable(ds, false, [], [], s.teamVisibility, s.filters),
    session: s.mode === 'team' && ds?.sessionId ? s.team.session : -1,
  };
}

/** A key for a scope: equal keys, equal rows. */
export function scopeKey(sc: Scope): string {
  return [
    sc.timeLo,
    sc.timeHi,
    sc.lifetimeNow,
    sc.defaultLifetime,
    sc.filters.map((f) => f.key).join(';'),
    sc.groupShown ? Array.from(sc.groupShown).join('') : '',
    sc.session,
  ].join('|');
}

/**
 * The rules of a scope as plain JSON, to count the same rows again later: the
 * filters as the view had them, the teams shown, the match, and the time
 * window (null for no bound). A chart a sign sends to a document keeps these
 * (`charts/block.ts`), so refreshing it counts the rows it was sent with.
 */
export interface SavedRows {
  filters: FilterSpec[];
  teamVisibility: Record<number, boolean>;
  session: number;
  timeLo: number | null;
  timeHi: number | null;
  lifetimeNow: number | null;
  defaultLifetime: number;
}

const bound = (v: number): number | null => (Number.isFinite(v) ? v : null);

/** The rows the view shows now, as rules; `upToNow`: from the start up to the playhead instead of the window. */
export function savedRowsNow(s: AppState, playhead: number, upToNow = false): SavedRows {
  const sc = currentScope(s, playhead);
  const playing = s.timeline.mode !== 'all' && !!s.dataset?.time;
  const up = upToNow && playing;
  const hi = sc.lifetimeNow !== null ? sc.lifetimeNow : sc.timeHi;
  return {
    filters: structuredClone(s.filters),
    teamVisibility: { ...s.teamVisibility },
    session: sc.session,
    timeLo: up ? null : bound(sc.timeLo),
    timeHi: bound(up ? hi : sc.timeHi),
    lifetimeNow: up ? null : sc.lifetimeNow,
    defaultLifetime: sc.defaultLifetime,
  };
}

/** Saved rules back to a scope over a dataset (its filters resolved against its columns). */
export function scopeOfSaved(ds: Dataset, r: SavedRows): Scope {
  return {
    timeLo: r.timeLo ?? -Infinity,
    timeHi: r.timeHi ?? Infinity,
    lifetimeNow: r.lifetimeNow,
    defaultLifetime: r.defaultLifetime,
    filters: buildActiveFilters(ds, r.filters),
    groupShown: buildGroupTable(ds, false, [], [], r.teamVisibility, r.filters),
    session: ds.sessionId && r.session < ds.sessionLabels.length ? r.session : -1,
  };
}

/** Whether a value read back from JSON is such rules. */
export function isSavedRows(v: unknown): v is SavedRows {
  const r = v as Partial<SavedRows> | null;
  return !!r && typeof r === 'object' && Array.isArray(r.filters) && typeof r.teamVisibility === 'object' && typeof r.session === 'number' && typeof r.defaultLifetime === 'number';
}
