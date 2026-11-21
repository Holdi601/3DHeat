import { afterEach, describe, expect, it } from 'vitest';
import type { AttributeColumn, Dataset } from '../state/types';
import { setColumnAsk } from '../data/columnWant';
import { hitsOf, hitsReady } from './hits';

/** A War Thunder ground battle's shots on a tank, with the hit points' columns left in the files at load. */
function battle(): { d: Dataset; arrive: () => void } {
  const n = 3;
  const cat = (name: string, values: string[], cats: string[]) =>
    ({ name, kind: 'category', data: Uint32Array.from(values, (v) => cats.indexOf(v)), categories: cats, min: 0, max: cats.length - 1 }) as unknown as AttributeColumn;
  const numCol = (name: string, v: number[]) => ({ name, kind: 'number', data: Float32Array.from(v), min: 0, max: 0 }) as unknown as AttributeColumn;
  const d = {
    count: n,
    time: Float32Array.of(1, 2, 3),
    sessionId: null,
    sessionLabels: [],
    attrs: [
      cat('event', ['shot', 'shot', 'module_destroyed'], ['shot', 'module_destroyed']),
      cat('player', ['Red', 'Red', 'Blu'], ['Red', 'Blu']),
      cat('Vehicle', ['tiger', 'tiger', 'canberra'], ['tiger', 'canberra']),
      cat('other', ['Blu', 'Blu', ''], ['Blu', '']),
      cat('otherVehicle', ['is_2', 'is_2', ''], ['is_2', '']),
      cat('match', ['m', 'm', 'm'], ['m']),
    ],
  } as unknown as Dataset;
  const arrive = () => d.attrs.push(numCol('hitLocalX', [1, 2, NaN]), numCol('hitLocalY', [1, 1, NaN]), numCol('hitLocalZ', [0, 0.5, NaN]));
  return { d, arrive };
}

afterEach(() => setColumnAsk(null));

describe("the hits wait for their columns", () => {
  it('asks for the hit points left in the files, and lists the tank once they are here', () => {
    const { d, arrive } = battle();
    let waiting = true;
    const asked: string[][] = [];
    setColumnAsk((names) => {
      asked.push([...names]);
      return waiting;
    });
    expect(hitsReady(d)).toBe(false);
    expect(asked.flat()).toContain('hitLocalX');
    arrive();
    waiting = false;
    expect(hitsReady(d)).toBe(true);
    const set = hitsOf(d);
    expect(set.vehicles.get('is_2')?.hits).toBe(2);
  });

  it('reads the hits again once columns they were read without arrive, not before', () => {
    const { d, arrive } = battle();
    let waiting = true;
    setColumnAsk(() => waiting);
    // Read while the points were still in the files (a caller that did not wait): no tank.
    expect(hitsOf(d).vehicles.has('is_2')).toBe(false);
    arrive();
    // Still arriving: the old answer stays (not worked out once per column).
    expect(hitsOf(d).vehicles.has('is_2')).toBe(false);
    waiting = false;
    expect(hitsOf(d).vehicles.get('is_2')?.hits).toBe(2);
    expect(hitsReady(d)).toBe(true);
  });
});
