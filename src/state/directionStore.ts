import { create } from 'zustand';
import type { DirSource, SpotDirections } from '../render/direction';
import type { Vec3 } from '../render/pose';

/**
 * The directions at the last clicked spot, or in a volume: what the pick card's
 * arrow and polar chart show (render/directionController.ts fills it).
 */
export interface DirectionSpot {
  /** The pick it answers, or -1 for a volume. */
  id: number;
  /** The volume's name when it answers a volume. */
  volume?: string;
  point: Vec3 | null;
  /** World units round the point. */
  radius: number;
  source: DirSource;
  result: SpotDirections;
}

interface DirectionState {
  spot: DirectionSpot | null;
  /** A scan is under way. */
  busy: boolean;
  /** Rows with a direction, by source, once worked out; null before or without a dataset. */
  counts: Record<string, number> | null;
  /** Ask for a volume's directions: its id, bumped `ask` so asking twice asks again. */
  volumeAsk: { id: string; ask: number } | null;
  set: (p: Partial<Pick<DirectionState, 'spot' | 'busy' | 'counts'>>) => void;
  askVolume: (id: string) => void;
}

export const useDirectionStore = create<DirectionState>((set) => ({
  spot: null,
  busy: false,
  counts: null,
  volumeAsk: null,
  set: (p) => set(p),
  askVolume: (id) => set((s) => ({ volumeAsk: { id, ask: (s.volumeAsk?.ask ?? 0) + 1 } })),
}));
