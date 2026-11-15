import { describe, expect, it } from 'vitest';
import { factorColumns } from './automap';
import { endReasonKey, END_REASONS, outcomeColumns, outcomeKind, roundNumberColumn, shrunkRate } from './outcome';
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
