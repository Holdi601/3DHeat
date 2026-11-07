/**
 * Named figures beyond the starter set in `../catalog.ts`, by domain, and the
 * aliases that map names in data (a DCS unit type, a War Thunder vehicle id, a
 * Battlefield vehicle name, a Tacview Name) onto catalogue entries.
 *
 * Each file here adds one family of games' vehicles; this index only merges
 * them, so files can be added without touching the catalogue.
 */

import type { GroundSpec } from '../ground';
import type { FixedWingSpec, HeliSpec, MissileFigureSpec } from '../air';
import type { NavalSpec } from '../naval';
import type { FigureEntry } from '../catalog';
import { AIR_DEFENCE } from './air-defence';
import { GROUND_MODERN } from './ground-modern';
import { GROUND_WW2 } from './ground-ww2';
import { TANKS } from './tanks';
import { GENERIC } from './generic';
import { DCS_ALIASES } from './aliases-dcs';
import { BF_ALIASES } from './aliases-bf';
import { WT_ALIASES } from './aliases-wt';
import { IL2_ALIASES } from './aliases-il2';
import { MUNITIONS } from './munitions';
import { PROPS } from './props';
import { HELIS } from './helis';
import { AIRCRAFT } from './aircraft';
import { SHIPS } from './ships';
import { JET_VARIANTS } from './jet-variants';
import { JET_ATTACK } from './jet-attack';
import { AIR_EXTRA } from './air-extra';
import { HELI_VARIANTS } from './heli-variants';
import { ARMOUR_MODERN } from './armour-modern';
import { ARMOUR_WW2 } from './armour-ww2';
import { PROP_VARIANTS } from './prop-variants';
import { SHIP_CLASSES } from './ship-classes';

export type Named<T> = Record<string, T & { cls: string }>;

export interface SpecSet {
  ground?: Named<GroundSpec>;
  air?: Named<FixedWingSpec>;
  heli?: Named<HeliSpec>;
  missile?: Named<MissileFigureSpec>;
  naval?: Named<NavalSpec>;
  /** Figures with a builder of their own (riders, walkers, airships, emplacements). */
  figures?: Record<string, FigureEntry>;
  /** Lower-case name as it appears in data -> catalogue name. */
  aliases?: Record<string, string>;
}

/** Every spec set, in order; a later set's entry replaces an earlier one of the same name. */
export const SPEC_SETS: SpecSet[] = [GENERIC, AIR_DEFENCE, GROUND_MODERN, GROUND_WW2, TANKS, PROPS, HELIS, AIRCRAFT, SHIPS, JET_VARIANTS, JET_ATTACK, HELI_VARIANTS, ARMOUR_MODERN, ARMOUR_WW2, PROP_VARIANTS, AIR_EXTRA, SHIP_CLASSES, MUNITIONS, DCS_ALIASES, BF_ALIASES, WT_ALIASES, IL2_ALIASES];
