/**
 * How fast a figure moves on the board: per game, per movement class, per
 * mode, from the data files in `speeds/` (one per game preset, each with its
 * sources; see docs/tactics-speeds.md). A figure picks a profile - a weapon
 * held in CS2 or Valorant, a vehicle type elsewhere - by its catalogue name or
 * class, or the one chosen on the board, and may override any mode's speed.
 */

import { CATALOG } from '../figures/catalog';

export type MoveClass = 'infantry' | 'ground' | 'sea' | 'air' | 'heli';
export type Mode = 'crawl' | 'crouch' | 'walk' | 'run' | 'sprint' | 'cautious' | 'normal' | 'rush' | 'slow' | 'cruise' | 'combat' | 'max';
export type SlopeModel = 'horizontal' | 'tobler' | 'grade';

/** Each class's modes, slowest first. */
export const MODES: Record<MoveClass, Mode[]> = {
  infantry: ['crawl', 'crouch', 'walk', 'run', 'sprint'],
  ground: ['crawl', 'cautious', 'normal', 'rush'],
  sea: ['crawl', 'cautious', 'normal', 'rush'],
  air: ['slow', 'cruise', 'combat', 'max'],
  heli: ['slow', 'cruise', 'combat', 'max'],
};

export const DEFAULT_MODE: Record<MoveClass, Mode> = { infantry: 'run', ground: 'normal', sea: 'normal', air: 'cruise', heli: 'cruise' };

export interface SpeedEntry {
  modes: Partial<Record<Mode, number | null>>;
  source: string;
  approx?: boolean;
  note?: string;
}

export interface SpeedProfile extends SpeedEntry {
  id: string;
  label: string;
  class: MoveClass;
  match?: string[];
}

export interface SpeedTable {
  game: string;
  unit: 'm/s' | 'km/h' | 'u/s';
  metresPerUnit?: number;
  slope: SlopeModel;
  sources: { id: string; title: string; url?: string; accessed?: string; note?: string }[];
  classes: Partial<Record<MoveClass, SpeedEntry>>;
  profiles?: SpeedProfile[];
}

const files = import.meta.glob('./speeds/*.json', { eager: true, import: 'default' }) as Record<string, SpeedTable>;
const TABLES: Record<string, SpeedTable> = Object.fromEntries(Object.values(files).map((t) => [t.game, t]));

export function speedTable(game: string): SpeedTable {
  return TABLES[game] ?? TABLES.generic;
}

/** The movement class of a catalogue figure; null for what does not move by itself (markers, utility, weapons). */
export function moveClassOf(kind: string): MoveClass | null {
  const d = CATALOG[kind]?.domain;
  if (d === 'person') return 'infantry';
  if (d === 'ground' || d === 'sea' || d === 'air' || d === 'heli') return d;
  return null;
}

/** The profile a figure moves by: the one chosen, else one matching its name, else its class's. */
export function profileFor(table: SpeedTable, kind: string, chosen?: string): SpeedProfile | null {
  const cls = moveClassOf(kind);
  const ps = (table.profiles ?? []).filter((p) => p.class === cls);
  if (chosen) {
    const p = ps.find((x) => x.id === chosen);
    if (p) return p;
  }
  const byName = ps.find((p) => p.match?.includes(kind));
  if (byName) return byName;
  const c = CATALOG[kind]?.cls;
  return (c && ps.find((p) => p.match?.includes(c))) || null;
}

/** A table's number in metres a second. */
export function toMetresPerSecond(table: SpeedTable, v: number): number {
  if (table.unit === 'km/h') return v / 3.6;
  if (table.unit === 'u/s') return v * (table.metresPerUnit ?? 1);
  return v;
}

/**
 * A mode's speed, metres a second, for a figure: its override, else its
 * profile's, else its class's; a mode the game has not got (null) takes the
 * nearest one it has, preferring the slower.
 */
export function modeSpeed(table: SpeedTable, kind: string, mode: Mode, profile?: string, override?: Partial<Record<Mode, number>>): number | null {
  const cls = moveClassOf(kind);
  if (!cls) return null;
  const o = override?.[mode];
  if (typeof o === 'number' && o > 0) return o;
  const order = MODES[cls];
  const p = profileFor(table, kind, profile);
  const base = table.classes[cls];
  const look = (m: Mode): number | null => {
    const v = p?.modes[m] ?? base?.modes[m];
    return typeof v === 'number' && v > 0 ? toMetresPerSecond(table, v) : null;
  };
  const i = Math.max(0, order.indexOf(mode));
  for (let d = 0; d < order.length; d++) {
    for (const j of [i - d, i + d]) {
      if (j < 0 || j >= order.length) continue;
      const v = look(order[j]);
      if (v !== null) return v;
    }
  }
  return null;
}

/** Plan units in a metre a game's levels usually come in: Source units for CS2, metres elsewhere. */
export function defaultUnitsPerMetre(game: string): number {
  const t = TABLES[game];
  return t?.unit === 'u/s' && t.metresPerUnit ? 1 / t.metresPerUnit : 1;
}
