import { create } from 'zustand';
import type { Vec3, YawConvention } from '../render/pose';
import type { Dataset } from './types';
import type { HeatStack } from '../render/heatStack';

/**
 * The inspection tools' state: what the camera readout and the pick card show.
 *
 * Its own store rather than more of the main one, because none of it changes
 * what is drawn: a pick, or a switched-off readout, must not reach the render
 * loop's signatures or re-render the panels that depend on the main store.
 */

/** What a click on the level hit. */
export interface PickedSurface {
  /** The source part's name (`nav:walkable`, a structure's name), when known. */
  part: string | null;
  /** The index set it is in; `map` is a map image's plane. */
  cls: 'ground' | 'structure' | 'water' | 'map';
  /** The part was guessed from bounding boxes, the set having been simplified. */
  approximate: boolean;
  /**
   * The level's navigation mesh at this spot, when it has one: its part name,
   * and whether it lies on the surface hit - "one can stand here".
   */
  nav?: { part: string; walkable: boolean } | null;
}

export interface PickResult {
  /** Increments per click, so a late answer to an old click can be told apart. */
  id: number;
  /**
   * `data`: a drawn sample; `surface`: the level; `pending`: still working out
   * the surface - the level's index is being built, or a large dataset scanned.
   */
  kind: 'data' | 'surface' | 'pending';
  /** World position of the pick: the sample as drawn, or where the ray met the level. */
  point: Vec3 | null;
  /** From the camera at the moment of the click, world units. */
  distance: number;
  surface?: PickedSurface;
  /** The row, and the dataset it indexes. */
  row?: number;
  dataset?: Dataset;
  /** The row's look direction in world terms, when the data has one. */
  look?: Vec3 | null;
  /** While pending: how far the surface index has got, 0..1, or null for a data scan. */
  progress?: number | null;
}

/** The heat stack under a pick (render/heatStack.ts), while it is read and once it is. */
export interface StackReading {
  /** The pick it answers (`PickResult.id`). */
  pickId: number;
  /** 0..1 while scanning. */
  progress: number;
  /** Null until the scan is done. */
  stack: HeatStack | null;
}

type Saved = Pick<InspectState, 'showCamera' | 'pickOnClick' | 'yawConvention' | 'heatLabels' | 'heatLabelCount'>;

interface InspectState {
  /** The camera's position over the view. */
  showCamera: boolean;
  /** A click on the view picks what is under it (the ruler, when on, takes clicks instead). */
  pickOnClick: boolean;
  /** Which yaw the readout, the pose box and the jump box speak. */
  yawConvention: YawConvention;
  pick: PickResult | null;
  stack: StackReading | null;
  /** Label the hottest places in view (and the most negative, in a signed mode) with their heat. */
  heatLabels: boolean;
  /** How many places per side the labels name. */
  heatLabelCount: number;
  /** Bumped to ask the jump box to take focus (the `G` key). */
  focusJump: number;
  patch: (p: Partial<Saved>) => void;
  setPick: (p: PickResult | null) => void;
  setStack: (s: StackReading | null) => void;
  requestJumpFocus: () => void;
}

const KEY = 'heat3d.inspect';

/** The switches this browser last had: a per-browser convenience, like the axis mirror. */
function saved(): Saved {
  const fallback = { showCamera: true, pickOnClick: true, yawConvention: 'viewer' as YawConvention, heatLabels: false, heatLabelCount: 5 };
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (v && typeof v === 'object') {
      return {
        showCamera: v.showCamera !== false,
        pickOnClick: v.pickOnClick !== false,
        yawConvention: v.yawConvention === 'game' ? 'game' : 'viewer',
        heatLabels: v.heatLabels === true,
        heatLabelCount: Number.isFinite(v.heatLabelCount) ? Math.max(1, Math.min(20, Math.round(v.heatLabelCount))) : 5,
      };
    }
  } catch {
    // No storage, or something unreadable in it.
  }
  return fallback;
}

export const useInspectStore = create<InspectState>((set, get) => ({
  ...saved(),
  pick: null,
  stack: null,
  focusJump: 0,
  patch: (p) => {
    set(p);
    const s = get();
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          showCamera: s.showCamera,
          pickOnClick: s.pickOnClick,
          yawConvention: s.yawConvention,
          heatLabels: s.heatLabels,
          heatLabelCount: s.heatLabelCount,
        }),
      );
    } catch {
      // Private windows and blocked storage: the setting lasts this session only.
    }
  },
  setPick: (pick) => set({ pick }),
  setStack: (stack) => set({ stack }),
  requestJumpFocus: () => set({ focusJump: get().focusJump + 1 }),
}));
