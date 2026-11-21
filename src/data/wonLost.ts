/**
 * Won against lost as the difference split (docs/win-rate.md#won-against-lost):
 * the rows of a side that went on to win on +, of one that went on to lose on
 * −, by the outcome columns (`data/outcome.ts`). "Per side" narrows both
 * halves to one team, so team 1 won is set against team 1 lost rather than the
 * winners of either team against the losers of either.
 */

import type { Dataset, SplitRule } from '../state/types';
import { outcomeColumns } from './outcome';

export type WonLostBy = 'round' | 'match';

/** The outcome columns a won-against-lost split can use: the round's (or a match-based game's match), and the match's. */
export function wonLostColumns(ds: Pick<Dataset, 'attrs'> | null): Partial<Record<WonLostBy, string>> {
  const c = outcomeColumns(ds);
  const out: Partial<Record<WonLostBy, string>> = {};
  if (c.round) out.round = c.round.name;
  if (c.match) out.match = c.match.name;
  return out;
}

/** The split: won (1) on +, lost (0) on −. */
export function wonLostRule(column: string): SplitRule {
  return { kind: 'range', column, positive: [1, 1], negative: [0, 0] };
}

/** Which outcome the split in force sets won against lost by, or null for any other split. */
export function wonLostOf(split: SplitRule, ds: Pick<Dataset, 'attrs'> | null): WonLostBy | null {
  if (split.kind !== 'range') return null;
  if (split.positive[0] !== 1 || split.positive[1] !== 1 || split.negative[0] !== 0 || split.negative[1] !== 0) return null;
  const cols = wonLostColumns(ds);
  if (cols.round === split.column) return 'round';
  if (cols.match === split.column) return 'match';
  return null;
}

/**
 * Team visibility for one side: only `team` drawn (null: every team). Under a
 * column split the groups decide only what is drawn (`frameSignTables`), so
 * this is the whole of "per side".
 */
export function sideVisibility(teamCount: number, team: number | null): Record<number, boolean> {
  const out: Record<number, boolean> = {};
  for (let i = 0; i < teamCount; i++) out[i] = team === null || i === team;
  return out;
}

/** The one team drawn, or null when every team (or several) is. */
export function shownSide(teamCount: number, visibility: Record<number, boolean>): number | null {
  let only: number | null = null;
  for (let i = 0; i < teamCount; i++) {
    if (visibility[i] === false) continue;
    if (only !== null) return null;
    only = i;
  }
  return only;
}
