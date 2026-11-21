import { describe, expect, it } from 'vitest';
import { CANON } from '../../data/canonical';
import type { AttributeColumn, Dataset } from '../../state/types';
import { plainName, summarisePlace } from './placeSummary';

/** Five rows of a made-up tank match: ids, a plain vehicle name, the game's own events beside the classes. */
function place(withDeaths: boolean): Dataset {
  const cat = (name: string, categories: string[], data: number[]): AttributeColumn =>
    ({ name, kind: 'category', data: Uint32Array.from(data), min: 0, max: categories.length - 1, categories }) as AttributeColumn;
  const ev = withDeaths ? ['position', 'damage', 'kill', 'death'] : ['position', 'damage', 'kill'];
  return {
    count: 5,
    personId: Uint32Array.from([0, 0, 1, 1, 0]),
    personLabels: ['alpha #1', 'bravo #2'],
    teamId: Uint16Array.from([0, 0, 1, 1, 0]),
    teamLabels: ['1', '2'],
    sessionId: Uint32Array.from([0, 0, 0, 1, 1]),
    sessionLabels: ['m1', 'm2'],
    attrs: [
      cat(CANON.event, ev, [0, 1, 2, withDeaths ? 3 : 0, 2]),
      cat('event', ['position', 'fire_on', 'kill', 'death'], [0, 1, 2, withDeaths ? 3 : 0, 2]),
      cat('Vehicle', ['tank_a_long_id', 'tank_b_long_id'], [0, 0, 1, 1, 0]),
      cat('VehicleShortName', ['Tank A', 'Tank B'], [0, 0, 1, 1, 0]),
      cat('weapon', ['', '88mm_pzgr_39'], [0, 1, 1, 0, 1]),
      cat('weaponName', ['', 'PzGr 39'], [0, 0, 1, 0, 0]),
    ],
  } as unknown as Dataset;
}

describe('the pick card summary', () => {
  it('tallies a place by event, unit, weapon and who, weighed by heat, in plain names', () => {
    const s = summarisePlace(place(true), [0, 1, 2, 3, 4], [1, 1, 4, 1, 3]);
    expect(s.rows).toBe(5);
    expect(s.matches).toBe(2);
    expect(s.units).toBe(2);
    expect(s.events[0]).toMatchObject({ label: 'kill', rows: 2 });
    expect(s.events.find((e) => e.label === 'damage (fire on)')).toBeTruthy();
    expect(s.vehicles.map((v) => v.label)).toEqual(['Tank A', 'Tank B']);
    // The data's plain name where the row has one, else the id made readable.
    expect(s.weapons.map((w) => w.label).sort()).toEqual(['88 mm pzgr 39', 'PzGr 39']);
    expect(s.kills).toBe(2);
    expect(s.deaths).toBe(1);
  });

  it('says no deaths count where the data logs none of its own', () => {
    expect(summarisePlace(place(false), [0, 1, 2, 3, 4], [1, 1, 1, 1, 1]).deaths).toBeNull();
  });

  it('makes an id readable', () => {
    expect(plainName('88mm_pzgr_39_43')).toBe('88 mm pzgr 39 43');
    expect(plainName('M1A1 HC')).toBe('M1A1 HC');
  });
});
