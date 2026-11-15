import { describe, expect, it } from 'vitest';
import { Dictionary } from './growable';
import { splitObjectTracks } from './objectTracks';

describe('object tracks', () => {
  it('gives each drone and gadget of a player a track of its own and keeps the body on the player', () => {
    const persons = new Dictionary();
    const ash = persons.intern('Ash');
    const mute = persons.intern('Mute');
    const pawns = ['operator', 'drone', 'gadget'];
    // Ash's body, her drone (two ids, both 4028107629 and 4028107639: a float32 would read them as one), Mute's gadget.
    const rows: [number, number, number][] = [
      [ash, 0, 1],
      [ash, 1, 4028107629],
      [ash, 1, 4028107639],
      [ash, 0, 1],
      [ash, 1, 4028107629],
      [mute, 2, 77],
      [mute, 0, 2],
    ];
    const ids = Uint32Array.from(rows.map((r) => r[0]));
    const made = splitObjectTracks(ids, persons, Uint32Array.from(rows.map((r) => r[1])), pawns, Float64Array.from(rows.map((r) => r[2])));
    expect(made).toBe(3);
    const names = Array.from(ids, (i) => persons.labels[i]);
    expect(names).toEqual(['Ash', 'Ash · drone 1', 'Ash · drone 2', 'Ash', 'Ash · drone 1', 'Mute · gadget 1', 'Mute']);
  });

  it('leaves a table without objects as it is', () => {
    const persons = new Dictionary();
    persons.intern('a');
    const ids = new Uint32Array([0, 0]);
    expect(splitObjectTracks(ids, persons, new Uint32Array([0, 1]), ['soldier', 'vehicle'], new Float64Array([1, 2]))).toBe(0);
    expect(Array.from(ids)).toEqual([0, 0]);
  });
});
