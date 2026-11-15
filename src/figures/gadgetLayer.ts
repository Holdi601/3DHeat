/**
 * Placed gadgets in the figure replay: each gadget a player put down or threw
 * (a tactical table's `pawn` = gadget rows, `tactical.ts`) drawn as its figure
 * where its latest row puts it, from its first row until its round ends. A
 * replay writes a placed thing's rows only when it changes, so the last row is
 * not when it is gone: it stays until the round's last row, unless a later
 * row of it says otherwise.
 *
 * Rows whose position is the origin or nowhere near the level (a gadget
 * object before it is placed is written at 0, 0 or far below) are left out.
 *
 * Built once per dataset; a frame walks the gadgets that have started, a few
 * hundred in a match, and adds each as an instance of its figure's mesh.
 */

import type { Dataset } from '../state/types';
import type { Frame3 } from '../race/geometry';
import { teamMemberColor } from '../render/colors';
import { poseFrame, type Template } from './kit';
import { meshOf, type InstanceBatches } from './instances';
import { placedFigure, tacticalColumns } from './tactical';

interface Placed {
  /** Its rows with a real position, in time order, and their times. */
  rows: Uint32Array;
  times: Float64Array;
  /** When its round ends: it is drawn until then. */
  end: number;
  session: number;
  figure: string;
  person: number;
}

interface Index {
  /** By first row's time. */
  items: Placed[];
  starts: Float64Array;
}

const cache = new WeakMap<Dataset, Index | null>();

/** Whether a row's position is a real one: not the origin, not far under it. */
function placedAt(d: Dataset, row: number): boolean {
  const x = d.px[row];
  const y = d.py[row];
  const z = d.pz[row];
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return false;
  if (Math.abs(x) < 0.01 && Math.abs(z) < 0.01) return false;
  return y > -50;
}

/** The placed gadgets of a tactical table, or null for a table that has none. */
export function placedGadgets(d: Dataset): Index | null {
  if (cache.has(d)) return cache.get(d)!;
  const g = placedSteps(d);
  for (;;) {
    const r = g.next();
    if (r.done) return r.value;
  }
}

/** Rows a step of `placedSteps` walks: well under a millisecond. */
const ROWS_STEP = 1 << 15;
const building = new WeakMap<Dataset, Generator<void, Index | null, void>>();

/**
 * The placed gadgets once worked out, else null after working on them for
 * about `budgetMs`: the index walks every row (about 10 ms on a match), so it
 * is built a slice a frame and drawn from the frame it is whole.
 */
export function placedGadgetsSoon(d: Dataset, budgetMs = 2): Index | null {
  if (cache.has(d)) return cache.get(d)!;
  let g = building.get(d);
  if (!g) building.set(d, (g = placedSteps(d)));
  const end = performance.now() + budgetMs;
  for (;;) {
    const r = g.next();
    if (r.done) {
      building.delete(d);
      return r.value;
    }
    if (performance.now() >= end) return null;
  }
}

function* placedSteps(d: Dataset): Generator<void, Index | null, void> {
  const c = tacticalColumns(d);
  let out: Index | null = null;
  if (c && c.pawn && d.time) {
    const pawnIds = c.pawn.data as Uint32Array;
    const isGadget = c.pawn.categories!.map((l) => /^gadget$/i.test(l.trim()));
    const round = d.attrs.find((a) => a.kind === 'number' && /^round$/i.test(a.name.trim()));
    const rnd = round ? (round.data as Float32Array) : null;
    const sess = d.sessionId;
    // When each round ends: its last row of any kind. Numbers only: this walks every row, on the frame that first needs it.
    const roundEnd = new Map<number, number>();
    const roundKey = (r: number) => (sess ? sess[r] : 0) * 65536 + (rnd ? rnd[r] : 0);
    const groups = new Map<number, number[]>();
    let lastKey = NaN;
    let lastEnd = -Infinity;
    for (let r = 0; r < d.count; r++) {
      if ((r & (ROWS_STEP - 1)) === ROWS_STEP - 1) yield;
      const k = roundKey(r);
      const t = d.time[r];
      if (k !== lastKey) {
        if (lastKey === lastKey) roundEnd.set(lastKey, Math.max(roundEnd.get(lastKey) ?? -Infinity, lastEnd));
        lastKey = k;
        lastEnd = roundEnd.get(k) ?? -Infinity;
      }
      if (t > lastEnd) lastEnd = t;
      if (!isGadget[pawnIds[r]] || !placedAt(d, r)) continue;
      // One gadget: its track in its session (the load gives every object a track of its own, `data/objectTracks.ts`).
      const g = (d.personId ? d.personId[r] : 0) * 65536 + (sess ? sess[r] : 0);
      const list = groups.get(g);
      if (list) list.push(r);
      else groups.set(g, [r]);
    }
    if (lastKey === lastKey) roundEnd.set(lastKey, Math.max(roundEnd.get(lastKey) ?? -Infinity, lastEnd));
    const items: Placed[] = [];
    for (const rows of groups.values()) {
      rows.sort((a, b) => d.time![a] - d.time![b]);
      const first = rows[0];
      items.push({
        rows: Uint32Array.from(rows),
        times: Float64Array.from(rows.map((r) => d.time![r])),
        end: Math.max(roundEnd.get(roundKey(rows[rows.length - 1])) ?? d.time[rows[rows.length - 1]], d.time[rows[rows.length - 1]]),
        session: sess ? sess[first] : -1,
        figure: placedFigure(c, first),
        person: d.personId ? d.personId[first] : 0,
      });
    }
    items.sort((a, b) => a.times[0] - b.times[0]);
    if (items.length) out = { items, starts: Float64Array.from(items.map((p) => p.times[0])) };
  }
  cache.set(d, out);
  return out;
}

export interface GadgetDrawOptions {
  time: number;
  /** The session on show, -1 for all. */
  session: number;
  /** Data units a figure's metre takes. */
  scale: number;
  minPixels?: number;
  pixelSize?: (x: number, y: number, z: number) => number;
  /** Positions are written relative to this point (see `FigureReplayOptions.origin`). */
  origin?: ArrayLike<number>;
  template: (kind: string) => Template | null;
}

/** Adds every gadget placed at `o.time` to `batches`; returns how many. */
export function drawPlacedGadgets(d: Dataset, batches: InstanceBatches, o: GadgetDrawOptions): number {
  const ix = placedGadgetsSoon(d);
  if (!ix) return 0;
  // Gadgets that have started: those whose first row is at or before the time.
  let hi = 0;
  let lo = ix.starts.length;
  while (hi < lo) {
    const mid = (hi + lo) >> 1;
    if (ix.starts[mid] <= o.time) hi = mid + 1;
    else lo = mid;
  }
  let n = 0;
  for (let i = 0; i < hi; i++) {
    const g = ix.items[i];
    if (g.end < o.time) continue;
    if (o.session >= 0 && g.session >= 0 && g.session !== o.session) continue;
    const t = o.template(g.figure);
    if (!t) continue;
    // Its latest row at or before the time.
    let a = 0;
    let b = g.times.length;
    while (a < b) {
      const m = (a + b) >> 1;
      if (g.times[m] <= o.time) a = m + 1;
      else b = m;
    }
    const row = g.rows[Math.max(0, a - 1)];
    const x = d.px[row];
    const y = d.py[row];
    const z = d.pz[row];
    let scale = o.scale;
    if (o.minPixels && o.minPixels > 0 && o.pixelSize) {
      const long = Math.max(t.max[0] - t.min[0], t.max[1] - t.min[1], t.max[2] - t.min[2], 0.05);
      const need = (o.minPixels * o.pixelSize(x, y, z)) / long;
      if (need > scale) scale = need;
    }
    const yaw = d.yaw ? d.yaw[row] : 0;
    const fr = poseFrame({ x, y, z, yaw: Math.PI - (Number.isFinite(yaw) ? yaw : 0), pitch: 0, roll: 0 });
    const team = d.personTeam ? d.personTeam[g.person] : 0;
    const col = teamMemberColor(team, d.personSlot ? d.personSlot[g.person] : g.person, d.teamSizes ? d.teamSizes[team] : 1);
    batches.add(meshOf(t), relative(fr, o.origin), scale, col, 1);
    n++;
  }
  return n;
}

function relative(fr: Frame3, o: ArrayLike<number> | undefined): Frame3 {
  return o ? { ...fr, o: [fr.o[0] - o[0], fr.o[1] - o[1], fr.o[2] - o[2]] } : fr;
}
