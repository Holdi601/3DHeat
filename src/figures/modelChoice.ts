/**
 * Which unit models a recording is drawn with, chosen per game in the level
 * panel ("Unit models"): each game's own pack (the default: its own models,
 * then other games' models of the same vehicle, then the built-in figures),
 * the built-in figures only, or another game's pack first (War Thunder's
 * models on a DCS recording, for the vehicles both have).
 *
 * The choice is kept per game in this browser and applied where a row's figure
 * is worked out (`FigureReplay.kindOf`), so a choice for one game never
 * changes another game's recordings, and it takes effect at once: every
 * thread has every pack installed, and only the name of the figure changes.
 */

import { create } from 'zustand';
import { figureSide } from './modelpack';
import { modelOfVehicleIn, packVehicleNames } from './figurepack';

/** The built-in figures only, no pack models. */
export const FIGURES_ONLY = 'figures';

/** The key for data no pack can tell the game of. */
export const OTHER_DATA = 'other';

/**
 * A game's choice: '' for its own models (the default), `FIGURES_ONLY`, or the game whose pack is drawn first.
 */
export type ModelChoice = string;

const KEY = 'heat3d.modelChoice';

function saved(): Record<string, ModelChoice> {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null') as unknown;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const out: Record<string, ModelChoice> = {};
      for (const [g, c] of Object.entries(v as Record<string, unknown>)) if (/^[\w-]{1,40}$/.test(g) && typeof c === 'string' && /^[\w-]{0,40}$/.test(c)) out[g] = c;
      return out;
    }
  } catch {
    // No storage: each game's own models.
  }
  return {};
}

interface ModelChoiceState {
  /** By game (`warthunder`, `dcs`, `OTHER_DATA`). */
  choices: Record<string, ModelChoice>;
  set: (game: string, choice: ModelChoice) => void;
}

let stamp = 0;

export const useModelChoice = create<ModelChoiceState>((set) => ({
  choices: typeof localStorage === 'undefined' ? {} : saved(),
  set: (game, choice) =>
    set((s) => {
      const choices = { ...s.choices };
      if (choice) choices[game] = choice;
      else delete choices[game];
      stamp++;
      try {
        localStorage.setItem(KEY, JSON.stringify(choices));
      } catch {
        // This visit only.
      }
      return { choices };
    }),
}));

/** Changes whenever a choice does: figures worked out before are worked out again. */
export function modelChoiceStamp(): number {
  return stamp;
}

/** The choice for data of `game` (null: a game no pack could tell). */
export function modelChoiceOf(game: string | null): ModelChoice {
  return useModelChoice.getState().choices[game || OTHER_DATA] ?? '';
}

const MODEL = '@model:';

/** The game a figure name is a pack model of, or null for a built-in figure. */
export function modelGameOf(kind: string | null | undefined): string | null {
  const at = kind ? kind.indexOf(MODEL) : -1;
  return at > 0 ? kind!.slice(at + MODEL.length).split(':')[0] || null : null;
}

/** A figure name without its pack model: the built-in figure it stands in for. */
export function builtInOf(kind: string): string {
  const at = kind.indexOf(MODEL);
  return at > 0 ? kind.slice(0, at) : kind;
}

/** The side vehicle names are matched on, from a figure's catalogue entry; '' for people, drones and the rest. */
function sideOf(entry: { domain?: string; cls?: string } | undefined): string {
  const side = figureSide(entry);
  return side === 'air' || side === 'heli' || side === 'ground' || side === 'sea' ? side : '';
}

/**
 * The figure a row is drawn as under the choice for its game: `kind` as found (own models first), the built-in
 * figure, or the chosen game's model of the same or a similar vehicle (by the row's names and the real names of the
 * model it had), `kind` where that game has none. `entry` looks a built-in figure up in the catalogue.
 */
export function chooseModel(kind: string | null, game: string | null, names: readonly string[], entry: (name: string) => { domain?: string; cls?: string } | undefined): string | null {
  if (!kind) return kind;
  const choice = modelChoiceOf(game);
  if (!choice) return kind;
  if (choice === FIGURES_ONLY) return builtInOf(kind);
  if (modelGameOf(kind) === choice) return kind;
  const base = builtInOf(kind).split('@')[0];
  const side = sideOf(entry(base));
  return modelOfVehicleIn(choice, [...names, ...packVehicleNames(kind)], side) ?? kind;
}
