/**
 * The finding picked, shown in the 3D view: the outline of its fitted place
 * (a ring at its floor and its ceiling, joined at four corners, and a mast),
 * a pulse that runs out from its centre a few times when it is picked so the
 * eye finds it, and a small cross at each event it is about. Drawn as the
 * engine's top lines, seven floats a vertex, merged with the other places'
 * lines (`withInsightLines`): rebuilt on a pick and for each step of the
 * pulse, never per frame otherwise.
 */

import { create } from 'zustand';
import type { Dataset } from '../state/types';
import type { FittedPlace } from './fit';

type Lines = { data: Float32Array; count: number } | null;

interface HighlightState {
  lines: Lines;
  /** The insight shown, null for none. */
  id: string | null;
  set: (p: Partial<HighlightState>) => void;
}

export const useInsightHighlight = create<HighlightState>((set) => ({ lines: null, id: null, set: (p) => set(p) }));

const RING: [number, number, number] = [0.3, 0.95, 1];
const EVENT: [number, number, number] = [1, 0.85, 0.3];
const SEGS = 64;
/** Events marked at most. */
const MAX_MARKS = 1500;

/** The highlight's lines: `pulse` 0..1 is how far the running ring has got, null for none. */
export function highlightLines(f: FittedPlace, ds: Dataset | null, pulse: number | null): { data: Float32Array; count: number } {
  const out: number[] = [];
  const seg = (a: number[], b: number[], c: [number, number, number], alpha: number) => out.push(a[0], a[1], a[2], ...c, alpha, b[0], b[1], b[2], ...c, alpha);
  const ring = (y: number, r: number, c: [number, number, number], alpha: number) => {
    for (let k = 0; k < SEGS; k++) {
      const a0 = (k / SEGS) * Math.PI * 2;
      const a1 = ((k + 1) / SEGS) * Math.PI * 2;
      seg([f.x + Math.cos(a0) * r, y, f.z + Math.sin(a0) * r], [f.x + Math.cos(a1) * r, y, f.z + Math.sin(a1) * r], c, alpha);
    }
  };
  ring(f.floor, f.radius, RING, 0.95);
  ring(f.ceil, f.radius, RING, 0.6);
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    const x = f.x + Math.cos(a) * f.radius;
    const z = f.z + Math.sin(a) * f.radius;
    seg([x, f.floor, z], [x, f.ceil, z], RING, 0.5);
  }
  const mast = Math.max(f.ceil - f.floor, f.radius * 0.5);
  seg([f.x, f.floor, f.z], [f.x, f.ceil + mast * 0.5, f.z], RING, 0.9);
  if (pulse !== null) {
    // Out from the centre and fading, at mid height.
    const y = (f.floor + f.ceil) / 2;
    ring(y, f.radius * (0.15 + 1.1 * pulse), RING, 0.95 * (1 - pulse));
  }
  if (ds) {
    const n = Math.min(f.rows.length, MAX_MARKS);
    const step = f.rows.length / Math.max(1, n);
    const s = Math.max(f.radius * 0.02, 0.15);
    for (let k = 0; k < n; k++) {
      const i = f.rows[Math.floor(k * step)];
      const x = ds.px[i];
      const y = ds.py[i];
      const z = ds.pz[i];
      seg([x - s, y, z], [x + s, y, z], EVENT, 0.85);
      seg([x, y, z - s], [x, y, z + s], EVENT, 0.85);
      seg([x, y - s, z], [x, y + s, z], EVENT, 0.85);
    }
  }
  return { data: Float32Array.from(out), count: out.length / 7 };
}

let timer = 0;

/**
 * Show a fitted place: outlined, its events marked, and the pulse run
 * `pulses` times over `seconds`. `redraw` asks the engine for a frame.
 */
export function showHighlight(id: string, f: FittedPlace, ds: Dataset | null, redraw: () => void, pulses = 3, seconds = 2.4): void {
  window.clearInterval(timer);
  const t0 = performance.now();
  const st = useInsightHighlight.getState();
  st.set({ id, lines: highlightLines(f, ds, 0) });
  redraw();
  timer = window.setInterval(() => {
    const u = (performance.now() - t0) / 1000 / seconds;
    if (useInsightHighlight.getState().id !== id) {
      window.clearInterval(timer);
      return;
    }
    if (u >= 1) {
      window.clearInterval(timer);
      useInsightHighlight.getState().set({ lines: highlightLines(f, ds, null) });
    } else useInsightHighlight.getState().set({ lines: highlightLines(f, ds, (u * pulses) % 1) });
    redraw();
  }, 50);
}

export function clearHighlight(redraw?: () => void): void {
  window.clearInterval(timer);
  useInsightHighlight.getState().set({ id: null, lines: null });
  redraw?.();
}

let merged: { base: unknown; lines: unknown; out: { data: Float32Array; count: number } } | null = null;

/** The engine's top lines with the highlight's after them (the same arrays again while neither changes). */
export function withInsightLines(base: Lines): Lines {
  const lines = useInsightHighlight.getState().lines;
  if (!lines) return base;
  if (!base) return lines;
  if (merged && merged.base === base && merged.lines === lines) return merged.out;
  const data = new Float32Array((base.count + lines.count) * 7);
  data.set(base.data.subarray(0, base.count * 7));
  data.set(lines.data.subarray(0, lines.count * 7), base.count * 7);
  merged = { base, lines, out: { data, count: base.count + lines.count } };
  return merged.out;
}
