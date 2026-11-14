/**
 * Every game's cost table, for `data/cost.ts` to pick from. A new game is a
 * file exporting a `GameCosts` and a line here.
 */

import { MILITARY } from './military';
import { RTS_TABLES } from './rts';
import { CS2, VALORANT, WOT, WOWS } from './shooters';
import type { GameCosts } from './types';

export const COST_TABLES: readonly GameCosts[] = [MILITARY, CS2, VALORANT, WOT, WOWS, ...RTS_TABLES];

export type { CostItem, GameCosts, Price } from './types';
