/**
 * The shape of a game's cost table (`data/cost.ts` reads them).
 *
 * A table prices what a row names - a weapon, a munition, a vehicle, a unit, a
 * building - in one currency, or in several resources for games that have
 * them (minerals and gas, food/wood/gold/stone, manpower/munitions/fuel...).
 * Items are matched by regular expressions over the name normalised to
 * lowercase letters and digits ("F-16C_50" is "f16c50"), first match wins, so
 * the specific entries go before the general ones. What no item matches falls
 * back to the class average, and the row says so (`Cost source`).
 *
 * Adding a game: a new file exporting a `GameCosts`, listed in `costs/index.ts`.
 */

import type { VehicleClass } from '../canonical';

/** One currency's amount, or an amount per resource. */
export type Price = number | Readonly<Record<string, number>>;

export interface CostItem {
  /** Matched against the normalised name. */
  m: RegExp;
  v: Price;
  /** The year the price is from (real-world money is not inflation-adjusted). */
  y?: number;
  /** Source key into the table's `sources`, or a note of its own. */
  s?: string;
  /** Priced per round fired rather than per item (gun ammunition). */
  shot?: boolean;
  /** Spent when fired (a grenade, an ability) in a game that does not price a shot. */
  use?: boolean;
  /** In-game kill reward with this weapon, where the game pays one. */
  reward?: number;
}

export interface GameCosts {
  id: string;
  label: string;
  /** Column currency suffix (`cost_lost_<currency>`), lowercase. Multi-resource games: see `resources`. */
  currency: string;
  /** Several resources, each its own column; combined by `exchange` into `<currency>`. */
  resources?: readonly string[];
  /** Weight of each resource in the combined value. Documented per game: these are assumptions. */
  exchange?: Readonly<Record<string, number>>;
  exchangeNote?: string;
  /** Real money (USD) rather than a game's own economy. */
  realWorld: boolean;
  /** Where the numbers come from, by key; `s` on an item names one. */
  sources: Readonly<Record<string, string>>;
  items: readonly CostItem[];
  /** Fallback per vehicle class, flagged as a class average. */
  classAvg: Partial<Record<VehicleClass, Price>>;
  /** Fallback munition price by the weapon's type text (missile, bomb, rocket, shell...). */
  munitionAvg?: Readonly<Record<string, number>>;
  /** A gun round fired by a vehicle of the class, when the row names no ammunition. */
  shotByClass?: Partial<Record<VehicleClass, number>>;
  fuel?: {
    /** Price of a kilogram of fuel, in the table's currency. */
    perKg: number;
    year: number;
    source: string;
    /** Estimated burn at cruise, kg an hour, when the data has no fuel quantity. */
    kgPerHour: Partial<Record<VehicleClass, number>>;
    /** Internal fuel, kg, for data that gives fuel as a fraction of full. */
    tankKg: Partial<Record<VehicleClass, number>>;
  };
  /** A unit appearing (trained, built) is money spent where it appears: RTS. */
  spawnIsSpent?: boolean;
  /** Income the game pays, in its currency. */
  earn?: {
    kill?: number;
    plant?: number;
    defuse?: number;
    roundWin?: number;
    /** Loss bonus by consecutive losses; the first entry is used without a streak. */
    roundLoss?: readonly number[];
    /** Rows of gathering/harvesting events carry an amount: income where they happen. */
    gather?: boolean;
  };
  /** A sentence on what the table covers and what it does not. */
  note?: string;
}
