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
/**
 * Who won, named (`winner`, `winning_team`, `round_winner`, `match_winner`,
 * `winning_faction`...): a team (or in a free-for-all, a player) rather than a
 * 0/1 per row. Where a source has no `won` of its own, the load works it out
 * from this and each row's team (`deriveOutcome`).
 */
export const WINNER = /^((round.?|match.?|game.?)?winner(.?(team|side|faction))?|(round.?|match.?|game.?)?winning.?(team|side|faction)(.?(id|name))?|victor)$/i;
/** A `WINNER` column that names the match's winner rather than the round's. */
const MATCH_WINNER = /^(match|game)/i;

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

/** Words a winner column uses for "nobody": the row's outcome is then unknown. */
const NO_WINNER = new Set(['', 'none', 'null', 'nan', 'draw', 'tie', 'unknown', '-', '-1', 'n/a', 'na']);

/** Spellings of one side that differ between a team column and a winner column. */
const SIDE_ALIASES: Record<string, string> = {
  counterterrorist: 'ct', counterterrorists: 'ct', cts: 'ct',
  terrorist: 't', terrorists: 't',
  attacker: 'attack', attackers: 'attack', attacking: 'attack', atk: 'attack',
  defender: 'defend', defenders: 'defend', defending: 'defend', def: 'defend',
  blufor: 'blue', west: 'blue', bluefor: 'blue',
  opfor: 'red', east: 'red', redfor: 'red',
  allies: 'allied', ally: 'allied',
};

/** A side's name as the winner and the team columns are compared: `Team 1`, `team_1` and `1` alike, `Terrorists` and `T` alike. */
export function sideKey(label: string): string {
  let k = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
  const n = /^(team|side|faction)([a-z0-9]+)$/.exec(k);
  if (n) k = n[2];
  k = k.replace(/^0+(?=\d)/, '');
  return SIDE_ALIASES[k] ?? k;
}

/** The words a `won` column held as text (`true`/`false`, `yes`/`no`, `won`/`lost`) as 0/1, or null for any other word. */
function flagWord(v: string): number | null {
  const k = v.trim().toLowerCase();
  if (/^(1|true|yes|y|won|win|victory|w)$/.test(k)) return 1;
  if (/^(0|false|no|n|lost|loss|lose|defeat|l)$/.test(k)) return 0;
  return null;
}

function flagColumn(name: string, data: Float32Array): AttributeColumn {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  // A column with no known outcome at all still says 0 to 1: the panels show it as one.
  return { name, kind: 'number', data, min: Number.isFinite(min) ? min : 0, max: Number.isFinite(max) ? max : 1 };
}

type Sides = Pick<Dataset, 'count' | 'teamId' | 'teamLabels' | 'personId' | 'personLabels'>;

/**
 * Each row's 0/1 from a winner column: 1 where the winner names the row's team
 * (or, where it names no team, the row's player), 0 where it names another,
 * NaN where there is no winner (empty, a draw) or nothing to compare with.
 * Null when the winner names neither any team nor any player.
 */
export function wonFromWinner(ds: Sides, winner: AttributeColumn): Float32Array | null {
  const teamOf = new Map<string, number>();
  ds.teamLabels.forEach((l, i) => {
    const k = sideKey(l);
    if (k && !teamOf.has(k)) teamOf.set(k, i);
  });
  const personOf = new Map<string, number>();
  ds.personLabels.forEach((l, i) => {
    const k = l.trim().toLowerCase();
    if (k && !personOf.has(k)) personOf.set(k, i);
  });
  // What a winner value names: a team (>= 0), a player (-2 - id), nobody (-1).
  const resolve = (label: string): number => {
    if (NO_WINNER.has(label.trim().toLowerCase())) return -1;
    if (ds.teamId) {
      const t = teamOf.get(sideKey(label));
      if (t !== undefined) return t;
    }
    if (ds.personId) {
      const p = personOf.get(label.trim().toLowerCase());
      if (p !== undefined) return -2 - p;
    }
    return -1;
  };
  let named = false;
  let lookup: (row: number) => number;
  if (winner.kind === 'category' && winner.categories) {
    const by = Int32Array.from(winner.categories, resolve);
    named = by.some((v) => v !== -1);
    const ids = winner.data as Uint32Array;
    lookup = (r) => by[ids[r]] ?? -1;
  } else {
    const memo = new Map<number, number>();
    const vals = winner.data as Float32Array;
    lookup = (r) => {
      const v = vals[r];
      if (!Number.isFinite(v)) return -1;
      let w = memo.get(v);
      if (w === undefined) {
        w = resolve(String(v));
        memo.set(v, w);
        if (w !== -1) named = true;
      }
      return w;
    };
    // Whether any value names anyone, from a spread of rows.
    const step = Math.max(1, Math.floor(ds.count / 4096));
    for (let r = 0; r < ds.count && !named; r += step) lookup(r);
  }
  if (!named) return null;
  const out = new Float32Array(ds.count);
  const team = ds.teamId;
  const person = ds.personId;
  for (let r = 0; r < ds.count; r++) {
    const w = lookup(r);
    out[r] = w === -1 ? NaN : w >= 0 ? (team ? (team[r] === w ? 1 : 0) : NaN) : person ? (person[r] === -2 - w ? 1 : 0) : NaN;
  }
  return out;
}

/**
 * Fill the rows of an outcome column that say nothing (an event row a
 * converter left empty, say) from the rows of the same side in the same match
 * (session) and, for a round's outcome, the same round: who won does not
 * change within one. Only where those rows agree; in place. Returns how many
 * rows were filled.
 */
export function fillOutcomeGaps(ds: Pick<Dataset, 'count' | 'teamId' | 'sessionId' | 'attrs'>, col: AttributeColumn, byRound: boolean): number {
  const team = ds.teamId;
  if (!team || col.kind === 'category') return 0;
  const data = col.data as Float32Array;
  let gaps = 0;
  for (let r = 0; r < ds.count; r++) if (data[r] !== data[r]) gaps++;
  if (gaps === 0 || gaps === ds.count) return 0;
  const rd = byRound ? (roundNumberColumn(ds)?.data ?? null) : null;
  const session = ds.sessionId;
  const keyOf = (r: number) => ((session ? session[r] : 0) * 65537 + team[r]) * 10007 + (rd ? Math.min(10006, Math.max(0, Math.trunc(rd[r]) + 1)) : 0);
  // What each side's known rows say: 0 lost, 1 won, 2 they disagree.
  const said = new Map<number, number>();
  let lastKey = NaN;
  let lastVal = NaN;
  for (let r = 0; r < ds.count; r++) {
    const v = data[r];
    if (v !== v) continue;
    const k = keyOf(r);
    if (k === lastKey && v === lastVal) continue;
    lastKey = k;
    lastVal = v;
    const was = said.get(k);
    said.set(k, was === undefined || was === v ? v : 2);
  }
  let filled = 0;
  for (let r = 0; r < ds.count; r++) {
    if (data[r] === data[r]) continue;
    const v = said.get(keyOf(r));
    if (v === 0 || v === 1) {
      data[r] = v;
      filled++;
    }
  }
  return filled;
}

const derived = new WeakSet<object>();

/**
 * The outcome columns the rows can be filtered and split by, wherever the
 * source says who won some other way: a `won` written as words becomes 0/1; a
 * winner column (`WINNER`) gives `won` (or, naming the match's, `matchWon`)
 * from each row's team where the source has none; and rows a converter left
 * empty (events, often) take their side's outcome in that match and round.
 * In place, once per dataset (`setDataset`); returns the names of the columns
 * added or changed.
 */
export function deriveOutcome(ds: Dataset): string[] {
  if (derived.has(ds)) return [];
  derived.add(ds);
  const changed: string[] = [];
  // `won` as words: true/false, yes/no, won/lost.
  ds.attrs.forEach((a, i) => {
    if (a.kind !== 'category' || !a.categories || !(ROUND_WON.test(a.name.trim()) || MATCH_WON.test(a.name.trim()))) return;
    const words = a.categories.map(flagWord);
    if (!words.some((w) => w !== null)) return;
    const ids = a.data as Uint32Array;
    const data = new Float32Array(ds.count);
    for (let r = 0; r < ds.count; r++) data[r] = words[ids[r]] ?? NaN;
    ds.attrs[i] = flagColumn(a.name, data);
    changed.push(a.name);
  });
  const have = outcomeColumns(ds);
  for (const which of ['round', 'match'] as const) {
    if (have[which]) continue;
    const winner = ds.attrs.find((a) => WINNER.test(a.name.trim()) && MATCH_WINNER.test(a.name.trim()) === (which === 'match'));
    const name = which === 'round' ? 'won' : 'matchWon';
    if (!winner || ds.attrs.some((a) => a.name === name)) continue;
    const data = wonFromWinner(ds, winner);
    if (!data) continue;
    ds.attrs.push(flagColumn(name, data));
    changed.push(name);
  }
  const now = outcomeColumns(ds);
  if (now.round && fillOutcomeGaps(ds, now.round, true) > 0 && !changed.includes(now.round.name)) changed.push(now.round.name);
  if (now.match && fillOutcomeGaps(ds, now.match, false) > 0 && !changed.includes(now.match.name)) changed.push(now.match.name);
  return changed;
}
