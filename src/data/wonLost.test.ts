import { describe, expect, it } from 'vitest';
import type { AttributeColumn, Dataset } from '../state/types';
import { frameSignTables, matchScales, sideScales, splitSideCounts } from '../render/filterTables';
import { shownSide, sideVisibility, wonLostColumns, wonLostOf, wonLostRule } from './wonLost';

/**
 * Made-up matches: four of them, two teams each. Team 0 wins matches 0, 1 and
 * 2 and loses match 3; every match has ten rows a team, except that match 0 is
 * long (forty rows a team).
 */
function matches(): Dataset {
  const team: number[] = [];
  const session: number[] = [];
  const won: number[] = [];
  const winner = [0, 0, 0, 1];
  for (let m = 0; m < 4; m++) {
    for (let tm = 0; tm < 2; tm++) {
      const rows = m === 0 ? 40 : 10;
      for (let i = 0; i < rows; i++) {
        team.push(tm);
        session.push(m);
        won.push(winner[m] === tm ? 1 : 0);
      }
    }
  }
  const n = team.length;
  const attrs: AttributeColumn[] = [{ name: 'won', kind: 'number', data: Float32Array.from(won), min: 0, max: 1 }];
  return {
    count: n,
    px: new Float32Array(n),
    teamId: Uint16Array.from(team),
    teamLabels: ['1', '2'],
    sessionId: Uint32Array.from(session),
    sessionLabels: ['m0', 'm1', 'm2', 'm3'],
    attrs,
  } as unknown as Dataset;
}

const scratch = () => ({ group: null as Int8Array | null, split: null as Int8Array | null });

describe('won against lost', () => {
  it('splits by the outcome column, won on + and lost on -', () => {
    const ds = matches();
    expect(wonLostColumns(ds)).toEqual({ round: 'won' });
    const rule = wonLostRule('won');
    expect(wonLostOf(rule, ds)).toBe('round');
    expect(wonLostOf({ kind: 'teams' }, ds)).toBeNull();
    const { teamSign, split } = frameSignTables(ds, 'heat-difference', [], [], {}, [], rule, scratch());
    const c = splitSideCounts(ds, 0, ds.count, [], teamSign, split);
    // Won: team 0 in matches 0-2 (40 + 10 + 10) and team 1 in match 3 (10); lost the rest.
    expect(c).toEqual({ positive: 70, negative: 70, exact: true, positiveMatches: 4, negativeMatches: 4 });
  });

  it('per side: one team won against the same team lost, per match', () => {
    const ds = matches();
    const vis = sideVisibility(2, 0);
    expect(vis).toEqual({ 0: true, 1: false });
    expect(shownSide(2, vis)).toBe(0);
    expect(shownSide(2, sideVisibility(2, null))).toBeNull();
    const { teamSign, split } = frameSignTables(ds, 'heat-difference', [], [], vis, [], wonLostRule('won'), scratch());
    const c = splitSideCounts(ds, 0, ds.count, [], teamSign, split);
    expect(c).toEqual({ positive: 60, negative: 10, exact: true, positiveMatches: 3, negativeMatches: 1 });
    // By rows the long match weighs four times; by matches each match of a side counts once.
    const [pr, nr] = sideScales(c);
    expect(pr * 60).toBeCloseTo(nr * 10);
    const [pm, nm] = matchScales(c);
    expect(pm * 3).toBeCloseTo(nm * 1);
    // As if each side had played half of the four matches.
    expect(pm).toBeCloseTo(2 / 3);
    expect(nm).toBeCloseTo(2);
  });

  it('falls back to rows where there are no matches to count', () => {
    expect(matchScales({ positive: 30, negative: 10, exact: true })).toEqual(sideScales({ positive: 30, negative: 10 }));
  });
});
