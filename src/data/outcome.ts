/**
 * The outcome contract (docs/data-formats.md#outcome-columns): what the rows
 * say about who won, so a place, a route or a play can be judged by how often
 * its side went on to win.
 *
 *   won             0/1, the row's side (team) won the round - in a game
 *                   without rounds, the match
 *   matchWon        0/1, the row's side (team) won the match
 *   round           the round number, 1-based; 1 throughout a match-based game
 *   roundEndReason  how the round (in a match-based game, the match) ended,
 *                   in the shared words `END_REASONS` lists
 *
 * Empty (null) where the source does not say. The names below are the
 * contract's and their common spellings; the load keeps them by itself
 * (`automap.factorColumns`), and the filter panel, the difference split's win
 * rate and the volume statistics read them through here.
 */

import type { AttributeColumn, Dataset } from '../state/types';

/** The round's (or in a game without rounds, the match's) outcome. */
export const ROUND_WON = /^(won|win|is.?win(ner)?|victory|round.?won|round.?win)$/i;
/** The match's outcome. */
export const MATCH_WON = /^(match.?won|match.?win|game.?won|won.?match)$/i;
/** How the round (or match) ended. */
export const END_REASON = /^(round.?end.?reason|end.?reason|match.?end.?reason|round.?win.?reason|win.?reason)$/i;

/**
 * The shared end reasons. A game's own word maps onto one of these where it
 * can (`endReasonKey`); any other value is shown as the data has it.
 *
 *   elimination  every player of a side out (CS2, Valorant, Rainbow Six)
 *   bomb         the bomb (spike) went off
 *   defuse       the bomb (spike) defused
 *   time         the round clock ran out; War Thunder: decided with tickets left
 *   surrender    a side gave up
 *   draw         no winner
 *   objective    an objective taken or held (Rainbow Six's hostage, secure area)
 *   capture      War Thunder: bled out of tickets while the winner held zones;
 *                DCS: a persistent campaign won by taking every airfield and zone
 *   tickets      War Thunder: tickets lost to kills
 *   destruction  War Thunder: the last vehicles lost at once, no one left to spawn
 *   other
 */
export const END_REASONS = ['elimination', 'bomb', 'defuse', 'time', 'surrender', 'draw', 'objective', 'capture', 'tickets', 'destruction', 'other'] as const;
export type EndReason = (typeof END_REASONS)[number];

const ALIASES: Record<string, EndReason> = {
  elimination: 'elimination', eliminated: 'elimination', kills: 'elimination', wipe: 'elimination', teamwipe: 'elimination', killed: 'elimination',
  bomb: 'bomb', exploded: 'bomb', explosion: 'bomb', bombexploded: 'bomb', detonated: 'bomb', spikedetonated: 'bomb', target_bombed: 'bomb', targetbombed: 'bomb',
  defuse: 'defuse', defused: 'defuse', bombdefused: 'defuse', spikedefused: 'defuse',
  time: 'time', timeout: 'time', timer: 'time', timeexpired: 'time', target_saved: 'time', targetsaved: 'time',
  surrender: 'surrender', surrendered: 'surrender', forfeit: 'surrender', concede: 'surrender',
  draw: 'draw', tie: 'draw',
  objective: 'objective', hostage: 'objective', securearea: 'objective', secure: 'objective', extracted: 'objective',
  capture: 'capture', captured: 'capture', zones: 'capture',
  tickets: 'tickets', ticket: 'tickets',
  destruction: 'destruction', destroyed: 'destruction', annihilation: 'destruction',
  other: 'other',
};

/** A source's end reason as one of the shared ones, or null for a word the contract does not know. */
export function endReasonKey(value: string): EndReason | null {
  return ALIASES[value.trim().toLowerCase().replace(/[\s-]+/g, '')] ?? ALIASES[value.trim().toLowerCase()] ?? null;
}

/** The round number column. */
export const ROUND_NUMBER = /^(round|round.?num(ber)?|round.?index|round.?no)$/i;

/** The round number column a dataset kept, where it has one a round key can be made of. */
export function roundNumberColumn(ds: Pick<Dataset, 'attrs'>): AttributeColumn | null {
  return (
    ds.attrs.find(
      (a) => ROUND_NUMBER.test(a.name.trim()) && (a.kind !== 'category' ? a.max < 10_000 : (a.categories?.length ?? 0) < 10_000),
    ) ?? null
  );
}

/** A 0/1 column: numbers, nothing outside 0 to 1. */
function isFlag(a: AttributeColumn): boolean {
  return a.kind !== 'category' && a.min >= 0 && a.max <= 1;
}

export interface OutcomeColumns {
  /** The round's outcome (`won`), the match's in a game without rounds. */
  round: AttributeColumn | null;
  /** The match's outcome (`matchWon`). */
  match: AttributeColumn | null;
  /** How the round or match ended (`roundEndReason`), a category column. */
  reason: AttributeColumn | null;
}

/** The outcome columns a dataset kept. */
export function outcomeColumns(ds: Pick<Dataset, 'attrs'> | null): OutcomeColumns {
  const attrs = ds?.attrs ?? [];
  return {
    round: attrs.find((a) => isFlag(a) && ROUND_WON.test(a.name.trim())) ?? null,
    match: attrs.find((a) => isFlag(a) && MATCH_WON.test(a.name.trim())) ?? null,
    reason: attrs.find((a) => a.kind === 'category' && END_REASON.test(a.name.trim())) ?? null,
  };
}

/** Whether a column is one of the outcome columns: the panels name it in the viewer's language. */
export function outcomeKind(a: Pick<AttributeColumn, 'name' | 'kind' | 'min' | 'max'>): 'round' | 'match' | 'reason' | null {
  const name = a.name.trim();
  if (a.kind === 'category') return END_REASON.test(name) ? 'reason' : null;
  if (!(a.min >= 0 && a.max <= 1)) return null;
  if (MATCH_WON.test(name)) return 'match';
  return ROUND_WON.test(name) ? 'round' : null;
}

/** Prior strength of a place's win rate, in rounds: the breakdown's (`breakdown/metrics.ts`). */
export const WIN_PRIOR = 4;

/**
 * A win rate pulled toward the overall one where it rests on few rounds:
 * `(won + m * r0) / (played + m)`, as the breakdown reads small counts
 * (`breakdown/metrics.ts`). NaN with nothing played.
 */
export function shrunkRate(won: number, played: number, overall: number, m: number): number {
  if (!(played > 0)) return NaN;
  const r0 = Number.isFinite(overall) ? overall : 0.5;
  return (won + Math.max(0, m) * r0) / (played + Math.max(0, m));
}
