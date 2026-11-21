/**
 * The notes' pins in the view: one GPU instance per note with a place, in
 * the spawn markers' pipeline (`render/spawnMarks.ts`) - a rounded square of
 * constant pixel size in the note's colour with a page glyph, over the
 * finished picture - so a thousand notes cost one instanced draw.
 *
 * Where each note is comes from resolving its anchor on the loaded data
 * (`anchors.ts`), worked out again only when the notes or the data change.
 * In Play mode a note about a moment shows around it (from a few seconds
 * before to a while after; a range for its length); in All mode every note
 * shows. The instance array is written again only when the set shown changes,
 * never for a frame that shows the same pins.
 */

import { NOTE_GLYPH, SPAWN_INSTANCE_FLOATS, type SpawnMarkDraw } from '../render/spawnMarks';
import type { Dataset } from '../state/types';
import { anchorNeedsData, dataKey, resolveAnchor } from './anchors';
import type { DataNote } from './model';

/** A note's pin shows from this long before its moment to this long after, in Play mode. */
export const PIN_BEFORE = 3;
export const PIN_AFTER = 12;
/** Above the point, so the pin sits over what it marks. */
const LIFT = 1.5;

export interface Pin {
  id: string;
  x: number;
  y: number;
  z: number;
  /** When it shows in Play mode; -Infinity..Infinity for always. */
  from: number;
  to: number;
  rgb: [number, number, number];
}

function rgbOf(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return Number.isFinite(n) ? [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255] : [1, 0.8, 0.2];
}

/** The pins of `notes` on `d`: the notes whose anchor has a place here. */
export function pinsOf(notes: readonly DataNote[], d: Dataset | null): Pin[] {
  const key = d ? dataKey(d) : null;
  const out: Pin[] = [];
  for (const n of notes) {
    const a = n.anchor;
    // A place or a heat spot of other data is somewhere else on another level: not drawn here.
    const ref = 'data' in a ? a.data : undefined;
    if (ref && key && ref.key !== key && !anchorNeedsData(a)) continue;
    const r = resolveAnchor(d, a);
    if (!r.ok || !r.point) continue;
    const t = r.time ?? (a.kind === 'unit' || a.kind === 'place' || a.kind === 'heat' ? (a.t ?? null) : null);
    const from = r.range ? r.range[0] - PIN_BEFORE : t !== null && t !== undefined ? t - PIN_BEFORE : -Infinity;
    const to = r.range ? r.range[1] + PIN_AFTER : t !== null && t !== undefined ? t + PIN_AFTER : Infinity;
    out.push({ id: n.id, x: r.point.x, y: r.point.y + LIFT, z: r.point.z, from, to, rgb: rgbOf(n.color) });
  }
  return out;
}

/** Writes the instances of the pins shown at `t` (null: all of them) into `out`; how many. */
export function pinInstances(pins: readonly Pin[], t: number | null, out: { data: Float32Array }): number {
  if (out.data.length < pins.length * SPAWN_INSTANCE_FLOATS) out.data = new Float32Array(Math.max(1, pins.length) * SPAWN_INSTANCE_FLOATS);
  const d = out.data;
  let n = 0;
  for (const p of pins) {
    if (t !== null && (t < p.from || t > p.to)) continue;
    const o = n * SPAWN_INSTANCE_FLOATS;
    d[o] = p.x;
    d[o + 1] = p.y;
    d[o + 2] = p.z;
    d[o + 3] = -1000;
    d[o + 4] = p.rgb[0];
    d[o + 5] = p.rgb[1];
    d[o + 6] = p.rgb[2];
    d[o + 7] = 1 + NOTE_GLYPH * 4;
    d[o + 8] = 0;
    d[o + 9] = 0;
    d[o + 10] = 0;
    d[o + 11] = 0;
    n++;
  }
  return n;
}

/** Which pins show at `t`, as a signature: equal signatures, equal instances. */
function shownSig(pins: readonly Pin[], t: number | null): string {
  if (t === null) return 'all';
  let h = 0;
  let n = 0;
  for (let i = 0; i < pins.length; i++) {
    const p = pins[i];
    if (t < p.from || t > p.to) continue;
    h = (Math.imul(h, 31) + i + 1) | 0;
    n++;
  }
  return `${n}:${h}`;
}

/**
 * The pins of a frame: resolved again when the notes (`rev`) or the data
 * change, the instances written again only when the set shown changes.
 */
export class NotePinLayer {
  private rev = -1;
  private data: Dataset | null | undefined = undefined;
  pins: Pin[] = [];
  private sig = '';
  private draw: SpawnMarkDraw | null = null;

  private pending = false;
  /** Called when pins resolved off the frame are ready to draw. */
  onReady: (() => void) | null = null;

  /** The pins, resolved for this data and these notes, now (tests, the click). */
  resolve(notes: readonly DataNote[], rev: number, d: Dataset | null): Pin[] {
    if (rev !== this.rev || d !== this.data) {
      this.rev = rev;
      this.data = d;
      this.pins = pinsOf(notes, d);
      this.sig = '';
    }
    return this.pins;
  }

  /**
   * The pins as last resolved; when the notes or the data changed, resolved
   * again outside the frame (an idle callback) and drawn from the next frame
   * on, so a frame never waits on the anchors.
   */
  private current(notes: readonly DataNote[], rev: number, d: Dataset | null): Pin[] {
    if ((rev !== this.rev || d !== this.data) && !this.pending) {
      this.pending = true;
      const run = () => {
        this.pending = false;
        this.resolve(notes, rev, d);
        this.onReady?.();
      };
      const idle = (globalThis as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      if (idle) idle(run, { timeout: 150 });
      else setTimeout(run, 0);
    }
    return this.pins;
  }

  /** What to draw at `t` (null: every pin). */
  build(notes: readonly DataNote[], rev: number, d: Dataset | null, t: number | null): SpawnMarkDraw | null {
    const pins = this.current(notes, rev, d);
    if (!pins.length) {
      this.draw = null;
      this.sig = '';
      return null;
    }
    const sig = shownSig(pins, t);
    if (sig === this.sig) return this.draw;
    this.sig = sig;
    // A new array each time, so a renderer uploads it once by its identity.
    const buf = { data: new Float32Array(0) };
    const count = pinInstances(pins, t, buf);
    this.draw = count ? { data: buf.data, count, lines: false } : null;
    return this.draw;
  }

  /** The pin shown under (x, y), CSS pixels on the canvas, within `reach`; its note id or null. */
  at(x: number, y: number, project: (x: number, y: number, z: number) => { x: number; y: number } | null, t: number | null, reach = 11): string | null {
    let best: string | null = null;
    let bestD = reach * reach;
    for (const p of this.pins) {
      if (t !== null && (t < p.from || t > p.to)) continue;
      const s = project(p.x, p.y, p.z);
      if (!s) continue;
      const d = (s.x - x) ** 2 + (s.y - y) ** 2;
      if (d <= bestD) {
        bestD = d;
        best = p.id;
      }
    }
    return best;
  }
}

/** Spawn markers and note pins as one draw (the renderers take one): a new array only when either changes. */
export class MarkMerge {
  private a: SpawnMarkDraw | null = null;
  private b: SpawnMarkDraw | null = null;
  private out: SpawnMarkDraw | null = null;

  merge(a: SpawnMarkDraw | null, b: SpawnMarkDraw | null): SpawnMarkDraw | null {
    if (!b) return a;
    if (!a) return b;
    if (a === this.a && b === this.b && this.out) return this.out;
    this.a = a;
    this.b = b;
    const n = a.count + b.count;
    const data = new Float32Array(n * SPAWN_INSTANCE_FLOATS);
    data.set(a.data.subarray(0, a.count * SPAWN_INSTANCE_FLOATS), 0);
    data.set(b.data.subarray(0, b.count * SPAWN_INSTANCE_FLOATS), a.count * SPAWN_INSTANCE_FLOATS);
    this.out = { data, count: n, lines: a.lines };
    return this.out;
  }
}
