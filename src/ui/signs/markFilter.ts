/**
 * What a click on a sign's mark does: the view is filtered to what the mark
 * stands for - a team, a player, a category, a range of a column, a slice of
 * time - so the heat and the replay show only those rows in 3D. The same
 * click again takes the filter off, as the compare panel's bars do.
 */

import { t } from '../../i18n';
import type { MarkFilter } from '../../charts/types';
import { useStore } from '../../state/store';
import type { FilterSpec } from '../../state/types';
import { toast } from '../shell/kit';

function same(a: FilterSpec, b: FilterSpec): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'teams' || a.kind === 'persons') return true;
  return (a as { column: string }).column === (b as { column: string }).column;
}

/** Apply a mark's filter to the view (again: remove it). Returns whether a filter is now on. */
export function applyMarkFilter(f: MarkFilter, label: string): boolean {
  const st = useStore.getState();
  const ds = st.dataset;
  if (!ds) return false;
  if (f.kind === 'session') {
    const on = st.team.session !== f.index;
    st.patchTeam({ session: on ? f.index : -1 });
    if (on && st.mode !== 'team') toast(t('charts.click.match', { name: label }));
    return on;
  }
  if (f.kind === 'time') {
    // A slice of time: the window shows just it, the playhead at its end.
    let base = 0;
    if (f.match && ds.sessionStart && ds.sessionStart.length) {
      const s = st.team.session >= 0 ? st.team.session : 0;
      base = ds.sessionStart[s] ?? 0;
    }
    st.patchTimeline({ mode: 'play', window: 'fixed', windowSeconds: Math.max(1, f.hi - f.lo) });
    st.seek(base + f.hi);
    toast(t('charts.click.time'));
    return true;
  }
  let spec: FilterSpec;
  if (f.kind === 'team') spec = { kind: 'teams', allowed: [f.index] };
  else if (f.kind === 'person') spec = { kind: 'persons', allowed: [f.index] };
  else if (f.kind === 'category') spec = { kind: 'categories', column: f.column, allowed: [f.index] };
  else spec = { kind: 'range', column: f.column, min: f.lo, max: f.hi };
  const old = st.filters.find((x) => same(x, spec));
  const rest = st.filters.filter((x) => !same(x, spec));
  const again = !!old && JSON.stringify(old) === JSON.stringify(spec);
  st.setFilters(again ? rest : [...rest, spec]);
  toast(again ? t('charts.click.off') : t('charts.click.on', { name: label }));
  return !again;
}
