/**
 * The lean overlay's state on the page: the load in progress (with its
 * cancel), the overlay loaded, and how its deaths are marked. Read by the
 * panel and, for the markers, by the engine each frame.
 */

import { create } from 'zustand';
import type { LeanLoadHandle, LeanOverlay } from './load';

export interface LeanProgress {
  phase: 'footers' | 'scan' | 'planned' | 'keys' | 'build' | 'upload';
  done: number;
  total: number;
  rows: number;
  totalRows: number;
  startedMs: number;
  /** After pass 1: samples read, keys kept and the tolerance level. */
  samples?: number;
  keys?: number;
  level?: number;
}

export interface LeanState {
  overlay: LeanOverlay | null;
  progress: LeanProgress | null;
  handle: LeanLoadHandle | null;
  /** A message key (`lean.error.*`) and detail, when the last load failed. */
  error: { key: string; detail?: string } | null;
  /** Mark where units died, and for how long after (seconds; 0: every death so far). */
  markers: boolean;
  markerSeconds: number;
}

export const useLeanStore = create<LeanState>(() => ({
  overlay: null,
  progress: null,
  handle: null,
  error: null,
  markers: true,
  markerSeconds: 30,
}));

// For the performance scripts, beside window.__3dheat (dev only).
if (import.meta.env.DEV && typeof window !== 'undefined') (window as unknown as Record<string, unknown>).__3dheat_lean = useLeanStore;

/** Seconds a death stays marked in the frame now: 0 none, a large number for all so far. */
export function markerSeconds(): number {
  const s = useLeanStore.getState();
  if (!s.markers || !s.overlay) return 0;
  return s.markerSeconds > 0 ? s.markerSeconds : 1e9;
}
