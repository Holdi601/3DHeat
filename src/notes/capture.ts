/**
 * What a new note is anchored to, worked out from what is on screen, and the
 * pictures and numbers a note or a document block keeps: a thumbnail of the
 * view, a heat spot's numbers. Run on a click, never on the frame path.
 *
 * "New note here" picks the most specific thing in sight: the pick card's
 * heat spot or data row, else the unit selected or followed (at the
 * playhead), else the place in the middle of the view.
 */

import type { Engine } from '../render/engine';
import { fieldCellAt, relativeHeat, visibleCells, visibleSpread } from '../render/heatStack';
import { useInspectStore, type PickResult } from '../state/inspectStore';
import { useReplayStore } from '../state/replayStore';
import { captureView } from '../state/savedViews';
import { useStore } from '../state/store';
import { matchesOf, pickedMatches } from '../match/matches';
import { dataRef, rowAnchor, type Anchor, type Vec3 } from './anchors';

/** The view as a small JPEG (`width` CSS pixels across), or null when the frame cannot be read. */
export async function thumbnail(engine: Engine, width = 360, quality = 0.82): Promise<string | null> {
  try {
    engine.invalidate(1);
    const f = await engine.captureFrame();
    if (!f || !f.width || !f.height || typeof document === 'undefined') return null;
    const src = document.createElement('canvas');
    src.width = f.width;
    src.height = f.height;
    const g = src.getContext('2d');
    if (!g) return null;
    g.putImageData(new ImageData(Uint8ClampedArray.from(f.rgba), f.width, f.height), 0, 0);
    const w = Math.min(width, f.width);
    const h = Math.max(1, Math.round((f.height / f.width) * w));
    const out = document.createElement('canvas');
    out.width = w;
    out.height = h;
    const o = out.getContext('2d');
    if (!o) return null;
    o.imageSmoothingQuality = 'high';
    o.drawImage(src, 0, 0, w, h);
    return out.toDataURL('image/jpeg', quality);
  } catch {
    return null;
  }
}

/** How long a new note waits for the heat field's numbers. */
const FIELD_WAIT_MS = 1500;

/** The heat spot of a pick, with the pick card's numbers: the pixel's heat and the place against the view. */
export async function heatAnchor(engine: Engine, pick: PickResult): Promise<Anchor | null> {
  const p = pick.point;
  if (!p) return null;
  const st = useStore.getState();
  const ds = st.dataset;
  const reading = useInspectStore.getState().stack;
  const stack = reading && reading.pickId === pick.id ? reading.stack : null;
  const heat: Extract<Anchor, { kind: 'heat' }>['heat'] = { value: stack?.total ?? NaN, place: null, rows: null, percentile: null, places: null, ofMedian: null, ofPeak: null, mode: st.mode };
  try {
    // The field is built on first use, which on a large load takes a while: the note does not wait past a moment for it.
    const f = await Promise.race([engine.heatField.ensure(), new Promise<null>((r) => setTimeout(() => r(null), FIELD_WAIT_MS))]);
    if (f) {
      const c = fieldCellAt(f, p.x, p.y, p.z);
      if (c >= 0) {
        const cells = visibleCells(f, (x, y, z) => engine.project(x, y, z), engine.canvas.clientWidth, engine.canvas.clientHeight);
        const rel = relativeHeat(f.value[c], visibleSpread(f, cells));
        heat.place = f.value[c];
        heat.rows = f.count[c];
        if (rel) {
          heat.percentile = rel.percentile;
          heat.places = rel.places;
          heat.ofMedian = rel.ofMedian;
          heat.ofPeak = rel.ofPeak;
        }
      }
    }
  } catch {
    // The numbers stay unknown; the place is still the place.
  }
  if (!Number.isFinite(heat.value)) heat.value = heat.place ?? 0;
  return { kind: 'heat', ...(ds ? { data: dataRef(ds) } : {}), point: { ...p }, t: ds?.time ? engine.live.playhead : null, heat };
}

/** The unit selected or followed, at the playhead. */
export function unitAnchor(engine: Engine | null): Anchor | null {
  const ds = useStore.getState().dataset;
  const r = useReplayStore.getState();
  const key = r.followUnit ?? r.selected;
  if (!ds || !key) return null;
  return unitAnchorOf(key, engine);
}

export function unitAnchorOf(key: string, engine: Engine | null, name?: string): Anchor | null {
  const ds = useStore.getState().dataset;
  if (!ds) return null;
  return { kind: 'unit', data: dataRef(ds), key, name: name ?? key, t: ds.time && engine ? engine.live.playhead : null };
}

/** The place in the middle of the view: the ground or the data under it, else a point ahead of the camera. */
export function centrePoint(engine: Engine): Vec3 {
  const w = engine.canvas.clientWidth;
  const h = engine.canvas.clientHeight;
  const hit = engine.worldAt(w / 2, h / 2);
  if (hit) return hit;
  const pose = engine.cameraPose();
  const ds = useStore.getState().dataset;
  const b = ds?.bounds;
  const reach = b ? Math.max(1, Math.hypot(b.maxX - b.minX, b.maxZ - b.minZ) * 0.15) : 50;
  return { x: pose.position.x + pose.forward.x * reach, y: pose.position.y + pose.forward.y * reach, z: pose.position.z + pose.forward.z * reach };
}

/** The anchor "New note here" takes, and its words for the editor. */
export async function anchorHere(engine: Engine): Promise<Anchor> {
  const st = useStore.getState();
  const ds = st.dataset;
  const pick = useInspectStore.getState().pick;
  if (pick && pick.kind !== 'pending' && pick.point) {
    const heatMode = st.mode !== 'team';
    if (pick.kind === 'data' && pick.dataset && pick.row !== undefined && (!heatMode || !ds)) return rowAnchor(pick.dataset, pick.row);
    if (heatMode && ds) {
      const a = await heatAnchor(engine, pick);
      if (a) return a;
    }
    if (pick.kind === 'data' && pick.dataset && pick.row !== undefined) return rowAnchor(pick.dataset, pick.row);
    return { kind: 'place', ...(ds ? { data: dataRef(ds) } : {}), point: { ...pick.point }, t: ds?.time ? engine.live.playhead : null };
  }
  const u = unitAnchor(engine);
  if (u) return u;
  if (!ds) return { kind: 'place', point: centrePoint(engine), t: null };
  return { kind: 'place', data: dataRef(ds), point: centrePoint(engine), t: ds.time && st.timeline.mode !== 'all' ? engine.live.playhead : null };
}

/** The view now, to jump back to (`state/savedViews.ts`). */
export function viewNow(engine: Engine | null): unknown {
  try {
    return engine ? captureView(engine) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * What else a new note could be about, beside what `anchorHere` found: the
 * match and the round being played, the time window at the playhead, the
 * place in the middle of the view, the whole data. The editor offers them.
 */
export function anchorChoices(engine: Engine, first: Anchor): Anchor[] {
  const out: Anchor[] = [first];
  const st = useStore.getState();
  const ds = st.dataset;
  const add = (a: Anchor | null) => {
    if (a && !out.some((x) => JSON.stringify(x) === JSON.stringify(a))) out.push(a);
  };
  add(unitAnchor(engine));
  if (ds) {
    const ref = dataRef(ds);
    const s = st.team.session;
    const label = s >= 0 ? (ds.sessionLabels[s] ?? null) : null;
    if (label) add({ kind: 'round', data: ref, session: label });
    const set = matchesOf(ds);
    const picked = pickedMatches(set, st.filters, s);
    if (set.via !== 'whole' && picked && picked.length === 1) {
      const e = set.entries.find((x) => x.index === picked[0]);
      if (e) add({ kind: 'match', data: ref, id: e.id });
    }
    if (ds.time) {
      const t = engine.live.playhead;
      const tl = st.timeline;
      const from = tl.mode === 'play' && tl.window === 'fixed' ? Math.max(ds.timeRange[0], t - tl.windowSeconds) : Math.max(ds.timeRange[0], t - 30);
      add({ kind: 'time', data: ref, from, to: t, session: label });
    }
    add({ kind: 'place', data: ref, point: centrePoint(engine), t: ds.time && st.timeline.mode !== 'all' ? engine.live.playhead : null });
    add({ kind: 'data', data: ref });
  }
  return out;
}
