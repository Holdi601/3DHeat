/**
 * The board's link to the telemetry worker: what is loaded, the earliest-
 * arrival overlay, speeds measured, and travel times asked for.
 */

import { create } from 'zustand';
import type { Dataset } from '../state/types';
import { tracksFromDataset, type ArrivalGrid, type Region, type SpeedStat, type TravelStats } from './telemetry';
import type { TelemetryRequest } from './telemetry.worker';

export interface TelemetryState {
  status: 'none' | 'loading' | 'ready' | 'error';
  message: string;
  rounds: number;
  samples: number;
  /** The overlay, and how it is asked for. */
  heat: ArrivalGrid | null;
  heatOn: boolean;
  heatStat: 'min' | 'median';
  /** null: both sides. */
  side: number | null;
  speeds: { states: SpeedStat[]; weapons: { weapon: string; n: number; p95: number }[] } | null;
  loadFiles: (files: File[]) => void;
  loadDataset: (d: Dataset) => void;
  setHeat: (on: boolean, stat?: 'min' | 'median', cell?: number) => void;
  setSide: (side: number | null) => void;
  travel: (from: Region | 'roundStart', to: Region) => Promise<TravelStats>;
}

let worker: Worker | null = null;
let nextId = 1;
const waiting = new Map<number, (v: unknown) => void>();
let heatCell = 0;

function post(m: TelemetryRequest): void {
  if (!worker) {
    worker = new Worker(new URL('./telemetry.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent) => {
      const d = e.data as { type: string; id?: number; message?: string; rounds?: number; samples?: number };
      if (d.type === 'loaded') {
        useTelemetry.setState({ status: 'ready', rounds: d.rounds ?? 0, samples: d.samples ?? 0, message: '', heat: null, speeds: null });
        const s = useTelemetry.getState();
        ask({ type: 'speeds', id: 0 }).then((v) => useTelemetry.setState({ speeds: v as TelemetryState['speeds'] }));
        if (s.heatOn) s.setHeat(true);
        return;
      }
      if (d.type === 'error' && !waiting.has(d.id ?? -1)) {
        useTelemetry.setState({ status: 'error', message: d.message ?? '' });
        return;
      }
      const cb = waiting.get(d.id ?? -1);
      if (cb) {
        waiting.delete(d.id!);
        cb(d.type === 'error' ? new Error(d.message) : ((d as Record<string, unknown>).stats ?? (d as Record<string, unknown>).grid));
      }
    };
  }
  worker.postMessage(m);
}

function ask(m: Extract<TelemetryRequest, { id: number }>): Promise<unknown> {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    waiting.set(id, (v) => (v instanceof Error ? reject(v) : resolve(v)));
    post({ ...m, id });
  });
}

export const useTelemetry = create<TelemetryState>((set, get) => ({
  status: 'none',
  message: '',
  rounds: 0,
  samples: 0,
  heat: null,
  heatOn: false,
  heatStat: 'min',
  side: null,
  speeds: null,
  loadFiles: (files) => {
    if (!files.length) return;
    set({ status: 'loading', message: '' });
    post({ type: 'files', files });
  },
  loadDataset: (d) => {
    const tracks = tracksFromDataset(d);
    if (!tracks || !tracks.x.length) {
      set({ status: 'error', message: 'no-rounds' });
      return;
    }
    set({ status: 'loading', message: '' });
    post({ type: 'tracks', tracks });
  },
  setHeat: (on, stat, cell) => {
    if (cell !== undefined) heatCell = cell;
    const s = get();
    const heatStat = stat ?? s.heatStat;
    set({ heatOn: on, heatStat, ...(on ? {} : { heat: null }) });
    if (!on || s.status !== 'ready') return;
    ask({ type: 'heat', id: 0, cell: heatCell || 64, stat: heatStat, side: s.side })
      .then((g) => get().heatOn && set({ heat: g as ArrivalGrid }))
      .catch((e: Error) => set({ message: e.message }));
  },
  setSide: (side) => {
    set({ side });
    const s = get();
    if (s.heatOn) s.setHeat(true);
  },
  travel: (from, to) => ask({ type: 'travel', id: 0, from, to, side: get().side }) as Promise<TravelStats>,
}));
