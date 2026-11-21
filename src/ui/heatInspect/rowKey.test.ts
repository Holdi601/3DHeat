import { describe, expect, it } from 'vitest';
import type { AttributeColumn, Dataset } from '../../state/types';
import { followMetres, keyOfRow, rowIn } from './rowKey';

/** Two matches with the same two players in each, every match on its own clock span of the dataset. */
function twoMatches(): Dataset {
  const rows: { p: number; s: number; t: number; x: number }[] = [];
  for (let s = 0; s < 2; s++)
    for (let p = 0; p < 2; p++) for (let k = 0; k < 10; k++) rows.push({ p: s * 2 + p, s, t: s * 1000 + k * 10, x: p * 100 + k });
  const kind = { name: 'kind', kind: 'category', data: Uint32Array.from(rows, (r) => r.p % 2), categories: ['tank', 'aircraft'] } as unknown as AttributeColumn;
  return {
    count: rows.length,
    px: Float32Array.from(rows, (r) => r.x),
    py: new Float32Array(rows.length),
    pz: new Float32Array(rows.length),
    time: Float32Array.from(rows, (r) => r.t),
    personId: Uint32Array.from(rows, (r) => r.p),
    // Each match's tracks carry the player's name: the same names in both matches.
    personLabels: ['anna', 'ben', 'anna', 'ben'],
    sessionId: Uint32Array.from(rows, (r) => r.s),
    sessionLabels: ['match one', 'match two'],
    attrs: [kind],
  } as unknown as Dataset;
}

describe('a row found again for the replay', () => {
  it('finds a row of the data itself where it is', () => {
    const d = twoMatches();
    for (const row of [3, 17, 25, 39]) expect(rowIn(d, keyOfRow(d, row))).toBe(row);
  });

  it("finds an overlay's row in its own match, not the same player's row at that time in another", () => {
    const d = twoMatches();
    // As the overlay names it: the player in match two, 30 s into that match.
    const row = rowIn(d, { person: 'anna', group: 'match two', time: 30, x: 3, z: 0 });
    expect(d.sessionId![row]).toBe(1);
    expect(d.time![row]).toBe(1030);
    expect(d.personLabels[d.personId![row]]).toBe('anna');
    expect(rowIn(d, { person: 'nobody', group: '', time: 0, x: 0, z: 0 })).toBe(-1);
  });

  it('follows a tank close and an aircraft further out', () => {
    const d = twoMatches();
    expect(followMetres(d, 0)).toBeLessThan(30);
    expect(followMetres(d, 10)).toBeGreaterThanOrEqual(60);
  });
});
