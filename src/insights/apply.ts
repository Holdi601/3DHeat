/**
 * Acting on an insight in the viewer: the camera to its place, the filters
 * that show it, the time it is about, or a volume round it. Everything comes
 * from the insight's JSON (filters by name, places in world units), so an
 * insight saved earlier, or picked by an external narrator by its id, acts
 * the same as one just found.
 */

import { useStore } from '../state/store';
import type { Dataset, FilterSpec } from '../state/types';
import { useVolumeStore } from '../volumes/store';
import type { Insight, InsightFilter } from './types';
import { fitInsight } from './fit';

interface Framer {
  frameAround(x: number, y: number, z: number, radius: number): void;
}

/** An insight filter as the viewer's filter; null when the data lacks the column or every value. */
export function toFilterSpec(ds: Dataset, f: InsightFilter): FilterSpec | null {
  if (f.by === 'category') {
    const cats = ds.attrs.find((a) => a.name === f.column)?.categories;
    if (!cats) return null;
    const allowed = cats.flatMap((c, i) => (f.values.includes(c) ? [i] : []));
    return allowed.length ? { kind: 'categories', column: f.column, allowed } : null;
  }
  const labels = f.by === 'team' ? ds.teamLabels : ds.personLabels;
  const allowed = f.values.map((v) => labels.indexOf(v)).filter((i) => i >= 0);
  if (!allowed.length) return null;
  return f.by === 'team' ? { kind: 'teams', allowed } : { kind: 'persons', allowed };
}

const sameSlot = (a: FilterSpec, b: FilterSpec) =>
  a.kind === b.kind && (a.kind === 'categories' || a.kind === 'range' ? (a as { column: string }).column === (b as { column: string }).column : true);

/**
 * Show what an insight is about: its filters in place of any on the same
 * columns (`base` - the filters from before the first insight was shown -
 * keeps clicking from one insight to the next from stacking them), the camera
 * on its place and the playhead at its time.
 */
export function showInsight(ins: Insight, engine: Framer | null, base: FilterSpec[], frame = true): void {
  const st = useStore.getState();
  const ds = st.dataset;
  if (!ds) return;
  const specs = ins.filters.map((f) => toFilterSpec(ds, f)).filter((f): f is FilterSpec => !!f);
  st.setFilters([...base.filter((f) => !specs.some((s) => sameSlot(f, s))), ...specs]);
  const p = ins.place;
  if (p && engine && frame) engine.frameAround(p.x, p.y, p.z, Math.max(p.radius * 1.6, p.cell * 2));
  if (ins.time && ds.time) {
    const ss = ds.sessionStart;
    const s = st.team.session;
    const at = (ss && s >= 0 && s < ss.length ? ss[s] : ds.timeRange[0]) + ins.time.to;
    st.seek(at);
  }
}

/**
 * A volume round an insight's place, fitted to the events it is about: their
 * footprint and their height band, not the grid cells and the whole data's
 * height (`fit.ts`).
 */
export async function volumeFor(ins: Insight): Promise<void> {
  const ds = useStore.getState().dataset;
  if (!ins.place || !ds) return;
  const f = await fitInsight(ds, ins);
  if (!f || useStore.getState().dataset !== ds) return;
  const vs = useVolumeStore.getState();
  const v = vs.add({ kind: 'cylinder', x: f.x, z: f.z, radius: f.radius, floor: f.floor, ceil: f.ceil });
  vs.select(v.id);
}
