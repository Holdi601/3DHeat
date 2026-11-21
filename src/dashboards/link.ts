/**
 * The dashboard driving the 3D view: with "Drive the view" on, the open
 * dashboard's selection and its slicers on the page shown become the view's
 * filters - a team, players, a category's values, a numeric range - so the
 * heat and the replay show the rows the dashboard is looking at. The filters
 * set this way are this module's own (`dashClient.owned`): they are replaced
 * as the selection changes, taken off when the link or the window closes,
 * and left out of what the dashboard reads back from the view (the view
 * driving the dashboard), so the two never feed each other.
 *
 * A dashboard over a registered source drives that source's own view the
 * same way, through its `applySelection` (`sources.ts`): the same filters in
 * the source's column names and the marks picked, and null when the link,
 * the window or the dashboard goes.
 */

import { useStore } from '../state/store';
import type { FilterSpec } from '../state/types';
import { dashClient } from './client';
import type { Catalog, FieldInfo } from './fields';
import type { Dashboard, FilterDef } from './model';
import { cellParts, type Selection } from './plan';
import { onSourcesChanged, registeredSource, VIEW_SOURCE, type SourceSelection } from './sources';
import { pageShown, useDash } from './store';

const same = (a: FilterSpec, b: FilterSpec) => JSON.stringify(a) === JSON.stringify(b);

/** A dashboard field's values as a view filter; null where the view cannot filter by it. */
function specOf(f: FieldInfo, values: number[] | null, range: [number, number] | null): FilterSpec | null {
  if (values) {
    if (f.bin) {
      if (!values.length) return null;
      const lo = f.bin.lo + f.bin.step * Math.min(...values);
      const hi = f.bin.lo + f.bin.step * (Math.max(...values) + 1);
      return f.key.startsWith('a:') ? { kind: 'range', column: f.key.slice(2), min: lo, max: hi } : null;
    }
    if (f.id === 'team') return { kind: 'teams', allowed: values };
    if (f.id === 'person') return { kind: 'persons', allowed: values };
    if (f.key.startsWith('a:') && f.kind === 'cat') return { kind: 'categories', column: f.key.slice(2), allowed: values };
    return null;
  }
  if (range && f.key.startsWith('a:') && f.kind === 'num') return { kind: 'range', column: f.key.slice(2), min: range[0], max: range[1] };
  return null;
}

function fromFilter(cat: Catalog, fd: FilterDef): FilterSpec | null {
  const f = cat.byId.get(fd.field);
  if (!f || f.levels) return null;
  if ((fd.op === 'in' || fd.op === 'out') && fd.values?.length && f.labels) {
    const idx = fd.values.map((v) => f.labels!.indexOf(v)).filter((i) => i >= 0);
    const vals = fd.op === 'in' ? idx : f.labels.map((_l, i) => i).filter((i) => !idx.includes(i));
    return specOf(f, vals, null);
  }
  if (fd.op === 'range' && (fd.lo !== undefined || fd.hi !== undefined)) return specOf(f, null, [fd.lo ?? -Infinity, fd.hi ?? Infinity]);
  return null;
}

function fromSelection(cat: Catalog, sel: Selection): FilterSpec[] {
  const out: FilterSpec[] = [];
  sel.fields.forEach((ref, i) => {
    const f = cat.byId.get(ref);
    if (!f) return;
    const vals = [...new Set(sel.cells.map((c) => cellParts(sel.dims, c)[i]))];
    const s = specOf(f, f.kind === 'cat' || f.bin ? vals : null, null);
    if (s) out.push(s);
    else if (f.kind === 'num') {
      const d = sel.dims[i];
      if (d.k === 'bin') {
        const s2 = specOf(f, null, [d.lo + d.step * Math.min(...vals), d.lo + d.step * (Math.max(...vals) + 1)]);
        if (s2) out.push(s2);
      }
    }
  });
  return out;
}

/** The filters a dashboard drives its view with (any source): its and the page's filters, slicers, the selection. */
function driveFilters(dash: Dashboard): FilterSpec[] {
  const st = useDash.getState();
  const cat = dashClient.catalog(dash);
  if (!cat) return [];
  const page = pageShown(st, dash.id);
  const out: FilterSpec[] = [];
  for (const fd of [...(dash.filters ?? []), ...(page?.filters ?? [])]) {
    const s = fromFilter(cat, fd);
    if (s) out.push(s);
  }
  const sel = st.inter[dash.id]?.selection;
  if (sel && sel.pageId === page?.id) out.push(...fromSelection(cat, sel));
  // One filter per column: the later (the selection) wins.
  const by = new Map<string, FilterSpec>();
  for (const s of out) by.set(s.kind === 'teams' || s.kind === 'persons' ? s.kind : `${s.kind}:${s.column}`, s);
  return [...by.values()];
}

/** The open dashboard, when it drives its view. */
function driving(): Dashboard | null {
  const st = useDash.getState();
  const dash = st.open ? st.dashboards.find((d) => d.id === st.open) : null;
  return dash && st.shown && dash.link.driveView ? dash : null;
}

/** The view filters the open dashboard asks for now (the loaded data's view). */
export function wantedFilters(): FilterSpec[] {
  const dash = driving();
  if (!dash || (dash.source && dash.source !== VIEW_SOURCE)) return [];
  return driveFilters(dash);
}

/** What the open dashboard hands a registered source's `applySelection`; null when it drives nothing there. */
export function wantedSelection(): { source: string; sel: SourceSelection } | null {
  const dash = driving();
  if (!dash || !dash.source || dash.source === VIEW_SOURCE) return null;
  const src = registeredSource(dash.source);
  if (!src?.applySelection) return null;
  const st = useDash.getState();
  const cat = dashClient.catalog(dash);
  const page = pageShown(st, dash.id);
  const sel = st.inter[dash.id]?.selection;
  const picked: SourceSelection['picked'] = [];
  if (cat && sel && sel.pageId === page?.id)
    sel.fields.forEach((ref, i) => {
      const labels = [...new Set(sel.labels.map((l) => l[i]).filter((x): x is string => typeof x === 'string'))];
      if (labels.length) picked.push({ field: ref, name: cat.byId.get(ref)?.name ?? ref, labels });
    });
  return { source: dash.source, sel: { dashId: dash.id, filters: driveFilters(dash), picked } };
}

let applied: { source: string; json: string } | null = null;

/** Hand the open dashboard's selection to its registered source, and take it back from one it no longer drives. */
export function syncSourceSelection(): void {
  const want = wantedSelection();
  const json = want ? JSON.stringify(want.sel) : '';
  if (applied && (!want || applied.source !== want.source)) {
    try {
      registeredSource(applied.source)?.applySelection?.(null);
    } catch (e) {
      console.warn(`dashboards: the ${applied.source} source's applySelection failed`, e);
    }
    applied = null;
  }
  if (!want || applied?.json === json) return;
  try {
    registeredSource(want.source)?.applySelection?.(want.sel);
  } catch (e) {
    console.warn(`dashboards: the ${want.source} source's applySelection failed`, e);
  }
  applied = { source: want.source, json };
}

/** Put the wanted filters on the view in place of the ones set before. */
export function syncViewFilters(): void {
  const want = wantedFilters();
  const prev = dashClient.owned;
  if (want.length === prev.length && want.every((w, i) => same(w, prev[i]))) return;
  const s = useStore.getState();
  const rest = s.filters.filter((f) => !prev.some((p) => same(p, f)));
  // A column the user filters by hand keeps the user's filter.
  const free = want.filter((w) => !rest.some((r) => r.kind === w.kind && ('column' in r ? r.column === (w as { column?: string }).column : true)));
  dashClient.owned = free;
  s.setFilters([...rest, ...free]);
}

let started = false;
/** Follow the dashboards' state (once). */
export function startDashLink(): void {
  if (started) return;
  started = true;
  useDash.subscribe((s, p) => {
    if (s.inter !== p.inter || s.dashboards !== p.dashboards || s.pages !== p.pages || s.open !== p.open || s.shown !== p.shown || s.page !== p.page) {
      syncViewFilters();
      syncSourceSelection();
    }
  });
  // A source registered (or gone) while its dashboard is open.
  onSourcesChanged(() => syncSourceSelection());
}
