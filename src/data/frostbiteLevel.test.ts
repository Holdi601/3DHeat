import { describe, expect, it } from 'vitest';
import { frostbiteGameKey, frostbiteLevelOf, frostbiteLevelsFor, parseFrostbiteGameKey } from './frostbiteLevel';
import type { StoredLevelMeta } from './levelLibrary';

describe('Battlefield levels from the Battlefield maps tool', () => {
  it('reads the game and map off the part names', () => {
    expect(frostbiteLevelOf(['ground:terrain @battlefield-4/MP_Test', 'structure:props @battlefield-4/MP_Test'])).toEqual({
      game: 'battlefield-4',
      map: 'MP_Test',
    });
    expect(frostbiteLevelOf(['ground:terrain', 'structure:r6 House @12'])).toBeNull();
  });

  it('keeps them under a key that reads back', () => {
    const id = { game: 'battlefield-1', map: 'MP_Test' };
    expect(parseFrostbiteGameKey(frostbiteGameKey(id))).toEqual(id);
    expect(parseFrostbiteGameKey('r6siege:1:House')).toBeNull();
  });

  it('finds the saved levels for a map name, in either game', () => {
    const meta = (game: string, id: string) => ({ id, name: id, game }) as unknown as StoredLevelMeta;
    const library = [meta('frostbite:battlefield-4:MP_Sea', 'a'), meta('frostbite:battlefield-1:MP_Sea', 'b'), meta('frostbite:battlefield-1:MP_Hill', 'c')];
    expect(frostbiteLevelsFor(library, 'mp_hill').map((l) => l.id)).toEqual(['c']);
    expect(frostbiteLevelsFor(library, 'MP_Sea').map((l) => l.id)).toEqual(['a', 'b']);
    expect(frostbiteLevelsFor(library, 'MP_None')).toEqual([]);
  });
});
