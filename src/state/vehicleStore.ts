/**
 * The vehicle heatmap's settings: which vehicle, which hits (matches,
 * shooters, weapons, a layer), how the heat looks and what is drawn over it,
 * the turntable, and whether the flat sheet is open. What the hits are comes
 * from the loaded dataset (`vehicle/hits.ts`); this is only the choice.
 */

import { create } from 'zustand';
import type { ColourBy } from '../vehicle/scene';

export type VehicleLayer = 'all' | 'kills' | 'modules';

export interface VehicleState {
  /** The vehicle id shown; null picks the most-hit one. */
  vehicle: string | null;
  /** Null: every match, shooter, weapon. */
  matches: string[] | null;
  shooters: string[] | null;
  weapons: string[] | null;
  layer: VehicleLayer;
  colourBy: ColourBy;
  showPoints: boolean;
  showArrows: boolean;
  /** Move the hits to where they lie best on the figure (`vehicle/fit.ts`). */
  fit: boolean;
  /** Gaussian radius, m; 0 is automatic. */
  radius: number;
  /** Stops over the automatic exposure. */
  exposure: number;
  turntable: boolean;
  /** Degrees a second. */
  spin: number;
  sheetOpen: boolean;
  patch: (p: Partial<Omit<VehicleState, 'patch' | 'toggle'>>) => void;
  /** Adds or removes one value of a filter list; a list holding every value is all (null) again. */
  toggle: (list: 'matches' | 'shooters' | 'weapons', value: string, all: string[]) => void;
}

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicle: null,
  matches: null,
  shooters: null,
  weapons: null,
  layer: 'all',
  colourBy: 'none',
  showPoints: false,
  showArrows: false,
  fit: true,
  radius: 0,
  exposure: 0,
  turntable: true,
  spin: 12,
  sheetOpen: false,
  patch: (p) => set(p),
  toggle: (list, value, all) => {
    const cur = get()[list];
    const now = new Set(cur ?? all);
    if (now.has(value)) now.delete(value);
    else now.add(value);
    const next = all.filter((v) => now.has(v));
    set({ [list]: next.length === all.length ? null : next } as Partial<VehicleState>);
  },
}));
