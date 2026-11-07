/**
 * Box replay's Tacview-like extras: names over the live tracks, a camera that
 * follows one of them, and a pair whose range, bearing and height difference
 * is shown - what a flight debrief asks of a replay.
 */

import { create } from 'zustand';

export type LabelDetail = 'off' | 'name' | 'full';

interface ReplayState {
  labels: LabelDetail;
  /** The person the camera follows, by person id; null for a free camera. */
  follow: number | null;
  /** How far behind the followed track the camera sits, metres before the figure scale. */
  followDistance: number;
  /** Two persons whose range and bearing are drawn, from the first to the second. */
  pair: [number, number] | null;
  /** The first of a pair being picked. */
  pairFrom: number | null;
  /** A line from each live track down to the floor, so heights read in 3D; null leaves it to the data (`dropLinesOn`). */
  dropLines: boolean | null;
  setDropLines: (on: boolean | null) => void;
  setLabels: (l: LabelDetail) => void;
  toggleFollow: (person: number) => void;
  stopFollow: () => void;
  setFollowDistance: (d: number) => void;
  /** Shift-click on a label: first the one to measure from, then the one to measure to; again clears. */
  pick: (person: number) => void;
  clearPair: () => void;
}

export const useReplayStore = create<ReplayState>((set, get) => ({
  labels: 'name',
  follow: null,
  followDistance: 40,
  pair: null,
  pairFrom: null,
  dropLines: null,
  setDropLines: (dropLines) => set({ dropLines }),
  setLabels: (labels) => set({ labels }),
  toggleFollow: (person) => set({ follow: get().follow === person ? null : person }),
  stopFollow: () => set({ follow: null }),
  setFollowDistance: (followDistance) => set({ followDistance: Math.max(2, Math.min(5000, followDistance)) }),
  pick: (person) => {
    const s = get();
    if (s.pairFrom === null) set({ pairFrom: person, pair: null });
    else if (s.pairFrom === person) set({ pairFrom: null });
    else set({ pair: [s.pairFrom, person], pairFrom: null });
  },
  clearPair: () => set({ pair: null, pairFrom: null }),
}));

/** Bearing (degrees from north, clockwise), ground range, slant range and height difference from a to b, world metres. */
export function braa(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): { bearing: number; ground: number; slant: number; dy: number } {
  const east = b.x - a.x;
  // World -z is north (as box yaw has it: 0 looks along -z).
  const north = -(b.z - a.z);
  const ground = Math.hypot(east, north);
  const dy = b.y - a.y;
  let bearing = (Math.atan2(east, north) * 180) / Math.PI;
  if (bearing < 0) bearing += 360;
  return { bearing, ground, slant: Math.hypot(ground, dy), dy };
}
