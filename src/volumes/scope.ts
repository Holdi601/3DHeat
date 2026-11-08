/**
 * The rows the view shows, as the statistics and the export count them: the
 * time window at the playhead, the filters, the hidden groups and, in the
 * replay, the match played back. Built from the store, by the rules the
 * engine's frame uses (render/engine.ts, "visible time range").
 */

import { buildActiveFilters, buildGroupTable } from '../render/filterTables';
import type { useStore } from '../state/store';
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
