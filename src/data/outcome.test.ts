import { describe, expect, it } from 'vitest';
import { factorColumns } from './automap';
import { deriveOutcome, endReasonKey, END_REASONS, fillOutcomeGaps, outcomeColumns, outcomeKind, roundNumberColumn, shrunkRate, sideKey, WINNER } from './outcome';
import type { AttributeColumn } from '../state/types';
import { wonColumn } from '../breakdown/breakdownRun';
import type { Dataset } from '../state/types';

const flag = (name: string, min = 0, max = 1): AttributeColumn => ({ name, kind: 'number', data: new Float32Array(0), min, max });
const cat = (name: string, categories: string[]): AttributeColumn => ({ name, kind: 'category', data: new Uint32Array(0), min: 0, max: categories.length - 1, categories });

describe('the outcome contract', () => {
  it('finds the round, the match and the end reason by their names', () => {
    const attrs = [flag('matchWon'), flag('won'), flag('round', 1, 30), cat('roundEndReason', ['elimination', 'bomb'])];
    const o = outcomeColumns({ attrs });
    expect([o.round?.name, o.match?.name, o.reason?.name]).toEqual(['won', 'matchWon', 'roundEndReason']);
    expect(roundNumberColumn({ attrs })?.name).toBe('round');
    // A column called won that is not 0/1 is not an outcome.
    expect(outcomeColumns({ attrs: [flag('won', 0, 5)] }).round).toBeNull();
    expect(outcomeKind(flag('match_won'))).toBe('match');
    expect(outcomeKind(cat('endReason', ['tickets']))).toBe('reason');
    expect(outcomeKind(flag('speed'))).toBeNull();
  });

  it('is loaded by itself, the end reason too', () => {
    const cols = ['x', 'y', 'z', 'won', 'matchWon', 'round', 'roundEndReason', 'weapon'];
    expect(factorColumns(cols)).toEqual(['won', 'matchWon', 'round', 'roundEndReason']);
  });

  it("the breakdown's wins are the round's where a file has both", () => {
    const ds = { attrs: [flag('matchWon'), flag('won')] } as unknown as Dataset;
    expect(wonColumn(ds)?.name).toBe('won');
    expect(wonColumn({ attrs: [flag('matchWon')] } as unknown as Dataset)?.name).toBe('matchWon');
  });

  it("maps each game's words for how a round ended onto the shared ones", () => {
    expect(['elimination', 'bomb', 'defuse', 'time', 'surrender', 'draw', 'capture', 'tickets', 'destruction'].map(endReasonKey)).toEqual([
      'elimination', 'bomb', 'defuse', 'time', 'surrender', 'draw', 'capture', 'tickets', 'destruction',
    ]);
    expect(endReasonKey('Bomb Defused')).toBe('defuse');
    expect(endReasonKey('spike-detonated')).toBe('bomb');
    expect(endReasonKey('Secure Area')).toBe('objective');
    expect(endReasonKey('something new')).toBeNull();
    expect(END_REASONS).toContain('other');
  });

  it('pulls a win rate on few rounds toward the overall one', () => {
    expect(shrunkRate(1, 1, 0.5, 4)).toBeCloseTo(0.6);
    expect(shrunkRate(80, 100, 0.5, 4)).toBeCloseTo(82 / 104);
    expect(shrunkRate(0, 0, 0.5, 4)).toBeNaN();
  });
});

/** A synthetic dataset: rows with a team, a person, a match and the columns given. */
function synth(rows: { team: number; person?: number; session?: number }[], teamLabels: string[], attrs: AttributeColumn[], personLabels: string[] = []): Dataset {
  return {
    count: rows.length,
    teamId: Uint16Array.from(rows.map((r) => r.team)),
    teamLabels,
    personId: personLabels.length ? Uint32Array.from(rows.map((r) => r.person ?? 0)) : null,
    personLabels,
    sessionId: Uint32Array.from(rows.map((r) => r.session ?? 0)),
    attrs,
  } as unknown as Dataset;
}
const catRows = (name: string, categories: string[], ids: number[]): AttributeColumn => ({ name, kind: 'category', data: Uint32Array.from(ids), min: 0, max: categories.length - 1, categories });
const numRows = (name: string, v: number[]): AttributeColumn => ({ name, kind: 'number', data: Float32Array.from(v), min: Math.min(...v.filter(Number.isFinite)), max: Math.max(...v.filter(Number.isFinite)) });
const values = (a: AttributeColumn | null | undefined) => Array.from((a?.data ?? []) as Float32Array);

describe('who won, worked out from a winner column', () => {
  it('compares the winner with the row\'s team, whatever either is called', () => {
    for (const [team, winner] of [['Team 1', '1'], ['CT', 'Counter-Terrorists'], ['TERRORIST', 't'], ['team_b', 'Team B'], ['BLUFOR', 'blue']]) expect(sideKey(team), `${team} ~ ${winner}`).toBe(sideKey(winner));
    expect(sideKey('CT')).not.toBe(sideKey('T'));
  });

  it('gives each row 1 where its team won, 0 where it lost, nothing for a draw', () => {
    // Two rounds: Red wins the first, the second is a draw.
    const ds = synth([{ team: 0 }, { team: 1 }, { team: 0 }, { team: 1 }], ['Red', 'Blue'], [catRows('winning_team', ['red', 'draw'], [0, 0, 1, 1]), numRows('round', [1, 1, 2, 2])]);
    expect(deriveOutcome(ds)).toEqual(['won']);
    expect(values(outcomeColumns(ds).round)).toEqual([1, 0, NaN, NaN]);
    expect(outcomeColumns(ds).match).toBeNull();
    // Once per dataset.
    expect(deriveOutcome(ds)).toEqual([]);
  });

  it('takes a match winner as the match\'s outcome, a numeric winner as a team id', () => {
    const ds = synth([{ team: 0 }, { team: 1 }, { team: 2 }], ['1', '2', '3'], [numRows('match_winner', [2, 2, 2])]);
    deriveOutcome(ds);
    expect(outcomeColumns(ds).round).toBeNull();
    expect(values(outcomeColumns(ds).match)).toEqual([0, 1, 0]);
  });

  it('names a player in a free-for-all', () => {
    const ds = synth([{ team: 0, person: 0 }, { team: 0, person: 1 }], ['all'], [catRows('winner', ['Bravo'], [0, 0])], ['Alpha', 'Bravo']);
    deriveOutcome(ds);
    expect(values(outcomeColumns(ds).round)).toEqual([0, 1]);
  });

  it('leaves a winner that names no one alone, and a won the source has', () => {
    const none = synth([{ team: 0 }], ['A', 'B'], [catRows('winner', ['Zulu'], [0])]);
    expect(deriveOutcome(none)).toEqual([]);
    const own = synth([{ team: 0 }, { team: 1 }], ['A', 'B'], [numRows('won', [0, 1]), catRows('winner', ['A'], [0, 0])]);
    deriveOutcome(own);
    expect(values(outcomeColumns(own).round)).toEqual([0, 1]);
  });

  it('reads won written as words', () => {
    const ds = synth([{ team: 0 }, { team: 1 }, { team: 0 }], ['A', 'B'], [catRows('won', ['true', 'false', ''], [0, 1, 2])]);
    expect(deriveOutcome(ds)).toEqual(['won']);
    expect(outcomeColumns(ds).round?.kind).toBe('number');
    // The empty one is its side's, as the first row says.
    expect(values(outcomeColumns(ds).round)).toEqual([1, 0, 1]);
  });

  it('gives an event row its side\'s outcome in that match and round', () => {
    // Rows 2 and 5 are events a converter wrote without `won`.
    const ds = synth(
      [{ team: 0 }, { team: 1 }, { team: 0 }, { team: 0 }, { team: 1 }, { team: 1 }],
      ['A', 'B'],
      [numRows('won', [1, 0, NaN, 0, 1, NaN]), numRows('round', [1, 1, 1, 2, 2, 2])],
    );
    expect(deriveOutcome(ds)).toEqual(['won']);
    expect(values(outcomeColumns(ds).round)).toEqual([1, 0, 1, 0, 1, 1]);
  });

  it('fills nothing where the side\'s rows disagree', () => {
    const ds = synth([{ team: 0 }, { team: 0 }, { team: 0 }], ['A'], [numRows('won', [1, 0, NaN])]);
    expect(fillOutcomeGaps(ds, ds.attrs[0], false)).toBe(0);
  });

  it('is loaded by itself and never taken for the group', () => {
    expect(factorColumns(['x', 'winner', 'winning_faction', 'match_winner', 'weapon'])).toEqual(['winner', 'winning_faction', 'match_winner']);
    for (const c of ['winner', 'winning_team', 'round_winner', 'match_winner', 'winner_side', 'winning_faction', 'victor']) expect(WINNER.test(c), c).toBe(true);
    for (const c of ['won', 'team', 'winrate']) expect(WINNER.test(c), c).toBe(false);
  });
});
