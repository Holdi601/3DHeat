/**
 * The places of the mass analysis drawn in the 3D view: each region's
 * outline (a circle, a corridor with its axis, a grown zone's cell edges, a
 * height band's box at its floor and ceiling) as lines over the picture -
 * the engine's top lines, seven floats a vertex, made once when the places
 * change and copied with the objectives' lines, so a frame costs nothing.
 * Hidden places (significant, not plain in the heat) in magenta, plain ones
 * in amber, quiet ones in cyan; the one picked full, the rest faint.
 */

import { create } from 'zustand';
import type { MassInsight } from './detect';

export interface PlaceLinesState {
  /** The vertices, or null for none. */
  lines: { data: Float32Array; count: number } | null;
  /** The insight picked (drawn full). */
  focus: string | null;
  set: (p: Partial<PlaceLinesState>) => void;
}

export const usePlaceLines = create<PlaceLinesState>((set) => ({
  lines: null,
  focus: null,
  set: (p) => set(p),
}));

const HIDDEN: [number, number, number] = [1, 0.35, 0.86];
const PLAIN: [number, number, number] = [1, 0.7, 0.25];
const QUIET: [number, number, number] = [0.35, 0.85, 1];

/** The lines of these places (those with a region), the focused one full. */
export function placeLines(list: MassInsight[], focus: string | null): { data: Float32Array; count: number } | null {
  const out: number[] = [];
  const seg = (a: [number, number, number], b: [number, number, number], c: [number, number, number], alpha: number) => out.push(...a, ...c, alpha, ...b, ...c, alpha);
  for (const i of list) {
    const r = i.region;
    if (!r || !i.place) continue;
    const up = i.sentence.key.endsWith('Up');
    const col = !up ? QUIET : r.hidden ? HIDDEN : PLAIN;
    const alpha = focus === null || focus === i.id ? 0.95 : 0.35;
    const heights = r.bandY ? [r.bandY[0], r.bandY[1]] : [i.place.y];
    for (const y of heights) for (let k = 0; k + 3 < r.segs.length; k += 4) seg([r.segs[k], y, r.segs[k + 1]], [r.segs[k + 2], y, r.segs[k + 3]], col, alpha);
    if (r.bandY)
      // The box's corners, floor to ceiling, where the outline turns.
      for (let k = 0; k + 3 < r.segs.length; k += 4) seg([r.segs[k], r.bandY[0], r.segs[k + 1]], [r.segs[k], r.bandY[1], r.segs[k + 1]], col, alpha * 0.6);
    if (r.path) for (let k = 0; k + 1 < r.path.length; k++) seg([r.path[k][0], i.place.y, r.path[k][1]], [r.path[k + 1][0], i.place.y, r.path[k + 1][1]], col, alpha * 0.8);
    // A short mast at the centre, so a place far below or above the camera's eye is found.
    const h = Math.max(i.place.radius * 0.15, i.place.cell * 0.5);
    seg([i.place.x, i.place.y, i.place.z], [i.place.x, i.place.y + h, i.place.z], col, alpha);
  }
  return out.length ? { data: Float32Array.from(out), count: out.length / 7 } : null;
}

let merged: {
  base: unknown;
  lines: unknown;
  out: { data: Float32Array; count: number };
} | null = null;

/** The engine's top lines with the places' after them (the same arrays again while neither changes). */
export function withPlaceLines(base: { data: Float32Array; count: number } | null): { data: Float32Array; count: number } | null {
  const lines = usePlaceLines.getState().lines;
  if (!lines) return base;
  if (!base) return lines;
  if (merged && merged.base === base && merged.lines === lines) return merged.out;
  const data = new Float32Array((base.count + lines.count) * 7);
  data.set(base.data.subarray(0, base.count * 7));
  data.set(lines.data.subarray(0, lines.count * 7), base.count * 7);
  merged = { base, lines, out: { data, count: base.count + lines.count } };
  return merged.out;
}
