/**
 * The tactics board's telemetry, off the main thread: reads match tables
 * (CS2 demo Parquet files, the columns it needs only) or takes tracks built
 * from the loaded data, and answers travel-time, speed and earliest-arrival
 * questions on them (`telemetry.ts`).
 */

import { earliestArrival, speedStats, travelTimes, type Region, type Tracks } from './telemetry';
import { readMatchFiles } from './telemetryFiles';

export type TelemetryRequest =
  | { type: 'files'; files: File[] }
  | { type: 'tracks'; tracks: Tracks }
  | { type: 'travel'; id: number; from: Region | 'roundStart'; to: Region; side: number | null }
  | { type: 'heat'; id: number; cell: number; stat: 'min' | 'median'; side: number | null }
  | { type: 'speeds'; id: number };

let tracks: Tracks | null = null;

self.onmessage = async (e: MessageEvent<TelemetryRequest>) => {
  const m = e.data;
  try {
    if (m.type === 'files') {
      tracks = await readMatchFiles(m.files);
      self.postMessage({ type: 'loaded', rounds: tracks.rounds.length, samples: tracks.x.length });
    } else if (m.type === 'tracks') {
      tracks = m.tracks;
      self.postMessage({ type: 'loaded', rounds: tracks.rounds.length, samples: tracks.x.length });
    } else if (!tracks) {
      self.postMessage({ type: 'error', id: 'id' in m ? m.id : 0, message: 'no telemetry loaded' });
    } else if (m.type === 'travel') {
      self.postMessage({ type: 'travel', id: m.id, stats: travelTimes(tracks, m.from, m.to, m.side) });
    } else if (m.type === 'heat') {
      const g = earliestArrival(tracks, m.cell, m.stat, m.side);
      self.postMessage({ type: 'heat', id: m.id, grid: g }, { transfer: [g.values.buffer, g.heights.buffer] });
    } else if (m.type === 'speeds') {
      self.postMessage({ type: 'speeds', id: m.id, stats: speedStats(tracks) });
    }
  } catch (err) {
    self.postMessage({ type: 'error', id: 'id' in m ? m.id : 0, message: err instanceof Error ? err.message : String(err) });
  }
};
