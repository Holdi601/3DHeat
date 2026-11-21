/**
 * What a field dropped on a tile (or on an empty spot of the page) does,
 * Power BI's way: on a slot it goes into that slot; on the tile itself a
 * category goes to the axis (then the legend), a number to the values; on the
 * page it makes a new tile of the visual that fits it - a category a bar
 * chart, a number a histogram, a clock a line over time, a measure a KPI card.
 */

import type { Catalog, FieldInfo } from '../../dashboards/fields';
import type { AggKind, FieldRef, Tile, TileKind, ValueRef } from '../../dashboards/model';
import { useDash } from '../../dashboards/store';

export type Dropped = { field: FieldRef } | { measure: string };
export type Slot = 'axis' | 'legend' | 'values' | 'size' | 'axis2';

/** A quick measure for a field: numbers are averaged, categories counted once each. */
export function quickFor(f: FieldInfo | undefined): ValueRef {
  if (!f) return { agg: 'count' };
  const agg: AggKind = f.kind === 'num' && !f.bin && !f.levels ? 'mean' : 'distinct';
  return { agg, field: f.id };
}

/** Kinds whose axis takes a numeric field as it is (bins over it). */
const NUMERIC_AXIS: readonly TileKind[] = ['histogram', 'density', 'line', 'area', 'bands'];

/** Put a dropped field or measure into a tile's slot (or where it fits when `slot` is null). */
export function dropField(tile: Tile, cat: Catalog, d: Dropped, slot: Slot | null): void {
  const st = useDash.getState();
  if ('measure' in d) {
    const vals = [...(tile.values ?? []).filter((v) => !('agg' in v && v.agg === 'count' && !v.field && !v.where)), { m: d.measure }];
    st.patchTile(tile.id, slot === 'size' ? { size: { m: d.measure } } : { values: vals.slice(-8) });
    return;
  }
  const f = cat.byId.get(d.field);
  if (!f) return;
  if (tile.kind === 'slicer') {
    st.patchTile(tile.id, { axis: [f.id], opts: { ...tile.opts, slicer: f.kind === 'cat' ? (tile.opts?.slicer === 'range' ? 'dropdown' : (tile.opts?.slicer ?? 'dropdown')) : 'range' } });
    return;
  }
  const where: Slot = slot ?? (f.kind === 'cat' || f.levels || NUMERIC_AXIS.includes(tile.kind) ? (!tile.axis?.length ? 'axis' : tile.kind === 'table' ? 'axis' : !tile.legend && tile.kind !== 'kpi' ? 'legend' : 'values') : 'values');
  if (tile.kind === 'kpi' && where !== 'values') {
    st.patchTile(tile.id, { values: [quickFor(f)] });
    return;
  }
  switch (where) {
    case 'axis':
      st.patchTile(tile.id, { axis: tile.kind === 'table' || tile.kind === 'pivot' ? [...(tile.axis ?? []).filter((x) => x !== f.id), f.id].slice(-3) : [f.id, ...(tile.axis ?? []).slice(1)] });
      return;
    case 'axis2':
      st.patchTile(tile.id, { axis: [tile.axis?.[0] ?? f.id, f.id] });
      return;
    case 'legend':
      st.patchTile(tile.id, { legend: f.id });
      return;
    case 'size':
      st.patchTile(tile.id, { size: quickFor(f) });
      return;
    case 'values': {
      const vals = [...(tile.values ?? []).filter((v) => !('agg' in v && v.agg === 'count' && !v.field && !v.where)), quickFor(f)];
      st.patchTile(tile.id, { values: vals.slice(-8) });
    }
  }
}

/** A new tile for something dropped on the page. */
export function autoPlace(pageId: string, cat: Catalog, d: Dropped, at: { x: number; y: number }): Tile {
  const st = useDash.getState();
  if ('measure' in d) return st.addTile(pageId, 'kpi', at, { values: [{ m: d.measure }] });
  const f = cat.byId.get(d.field);
  if (!f) return st.addTile(pageId, 'bar', at);
  if (f.time) return st.addTile(pageId, 'line', at, { axis: [f.id] });
  if (f.kind === 'num' && !f.bin) return st.addTile(pageId, 'histogram', at, { axis: [f.id] });
  return st.addTile(pageId, 'bar', at, { axis: [f.id] });
}
