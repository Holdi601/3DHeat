/**
 * The viewer's choices for the engagement ranges (`ranges/`): on or off, for
 * which units, which kinds of weapon, which bands, how they look. Kept with
 * the replay's other choices (`state/replayStore.ts`).
 */

import { WEAPON_CLASSES, type WeaponClass } from './catalog';

export type RangeUnits = 'selected' | 'team' | 'all';
/** glass: faint faces with bright rims; lines: rings and meridians only; both. */
export type RangeStyle = 'glass' | 'lines' | 'both';

export interface RangeSettings {
  on: boolean;
  units: RangeUnits;
  /** The weapons' ranges. */
  weapons: boolean;
  /** The view cone (`view.ts`), and how far it reaches (metres; 0: the game's or the unit's usual visual range). */
  view: boolean;
  viewLength: number;
  classes: Record<WeaponClass, boolean>;
  bands: { min: boolean; opt: boolean; max: boolean };
  /** 0.05 to 1. */
  opacity: number;
  style: RangeStyle;
  /** Cut each shell where the unit's line of sight ends (terrain, buildings). */
  los: boolean;
  /** Shade the ground the unit sees within reach. */
  ground: boolean;
  /** The most units drawn at once (nearest the camera first). */
  maxUnits: number;
}

export const DEFAULT_RANGES: RangeSettings = {
  on: false,
  units: 'selected',
  weapons: true,
  view: false,
  viewLength: 0,
  classes: Object.fromEntries(WEAPON_CLASSES.map((c) => [c, true])) as Record<WeaponClass, boolean>,
  bands: { min: true, opt: true, max: true },
  opacity: 0.5,
  style: 'both',
  los: true,
  ground: true,
  maxUnits: 6,
};

/** Saved range settings, each checked; what is missing or wrong is the default. */
export function readRanges(v: unknown): RangeSettings {
  if (!v || typeof v !== 'object') return DEFAULT_RANGES;
  const a = v as Record<string, unknown>;
  const d = DEFAULT_RANGES;
  const c = (a.classes ?? {}) as Record<string, unknown>;
  const b = (a.bands ?? {}) as Record<string, unknown>;
  return {
    on: a.on === true,
    units: a.units === 'team' || a.units === 'all' ? a.units : 'selected',
    weapons: a.weapons !== false,
    view: a.view === true,
    viewLength: typeof a.viewLength === 'number' && a.viewLength > 0 ? Math.min(100000, a.viewLength) : 0,
    classes: Object.fromEntries(WEAPON_CLASSES.map((k) => [k, c[k] !== false])) as Record<WeaponClass, boolean>,
    bands: { min: b.min !== false, opt: b.opt !== false, max: b.max !== false },
    opacity: typeof a.opacity === 'number' && a.opacity > 0 ? Math.min(1, Math.max(0.05, a.opacity)) : d.opacity,
    style: a.style === 'glass' || a.style === 'lines' ? a.style : 'both',
    los: a.los !== false,
    ground: a.ground !== false,
    maxUnits: typeof a.maxUnits === 'number' && a.maxUnits >= 1 ? Math.min(32, Math.round(a.maxUnits)) : d.maxUnits,
  };
}
