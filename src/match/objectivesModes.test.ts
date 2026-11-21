import { describe, expect, it } from 'vitest';
import { objectivesOfOneMode } from './objectives';

const conq = { match: 'map_a_RB_Conq1_2026-01-01_10-00-00_aa' };
const conq2 = { match: 'map_a_RB_Conq1_2026-01-02_10-00-00_bb' };
const dom = { match: 'map_b_RB_Dom_2026-01-03_10-00-00_cc' };
const unnamed = { match: 'map_c' };

describe('objectives of several modes', () => {
  it('are hidden when battles of several modes are shown together', () => {
    expect(objectivesOfOneMode([conq, dom], false)).toEqual([]);
    expect(objectivesOfOneMode([conq, conq2, dom], false)).toEqual([]);
  });

  it('are all drawn when asked for', () => {
    expect(objectivesOfOneMode([conq, dom], true)).toEqual([conq, dom]);
  });

  it('are drawn for one battle, or several of one mode', () => {
    expect(objectivesOfOneMode([dom], false)).toEqual([dom]);
    expect(objectivesOfOneMode([conq, conq2], false)).toEqual([conq, conq2]);
    // A name that says no mode does not make a second one.
    expect(objectivesOfOneMode([conq, unnamed], false)).toEqual([conq, unnamed]);
  });
});
