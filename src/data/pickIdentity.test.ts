import { describe, expect, it } from 'vitest';
import { gameName, pickIdentity } from './pickIdentity';
import { estimateLoadSeconds } from './memory';
import { tacticsGameFor } from '../tactics/games';
import { levelForMap, type CatalogItem } from './catalogIndex';

const item = (game: string, name: string): CatalogItem => ({
  path: `${game}/${name}/${name}.glb`,
  game,
  kind: 'level',
  name,
  bytes: 1,
  mtime: 0,
  sha256: null,
  extractor: null,
  gameBuild: null,
});

describe('what a pick is', () => {
  it('names the games by their own names, and keeps an unknown id as it is', () => {
    expect(gameName('warthunder')).toBe('War Thunder');
    expect(gameName('cs2')).toBe('Counter-Strike 2');
    expect(gameName('somegame')).toBe('somegame');
    expect(gameName(null)).toBeNull();
  });

  it('takes a folder of Tacview recordings as one game, the theatre left to where they fly', () => {
    const f = (name: string) => ({ file: new File(['x'], name), relativePath: name });
    const who = pickIdentity([f('a.acmi'), f('b.acmi')], [f('a.acmi'), f('b.acmi')]);
    expect(who).toMatchObject({ gameId: 'tacview', map: null, matches: 2 });
  });

  it('knows neither game nor map of plain tables', () => {
    const f = (name: string) => ({ file: new File(['x'], name), relativePath: name });
    expect(pickIdentity([f('a.parquet')], [f('a.parquet')])).toEqual({ gameId: null, game: null, map: null, matches: 1 });
  });
});

describe('the level for a map', () => {
  const items = [item('warthunder', 'test_map_a'), item('cs2', 'de_test'), item('battlefield-4', 'MP_Same'), item('battlefield-1', 'MP_Same')];

  it('finds the one level of that name, in the game named or else in any', () => {
    expect(levelForMap(items, 'test_map_a', 'warthunder')?.path).toBe('warthunder/test_map_a/test_map_a.glb');
    expect(levelForMap(items, 'de_test', 'counter-strike')?.game).toBe('cs2');
  });

  it('picks none where the name is ambiguous or unknown', () => {
    expect(levelForMap(items, 'MP_Same', null)).toBeNull();
    expect(levelForMap(items, 'nowhere', 'warthunder')).toBeNull();
  });
});

describe('the tactics board for the data', () => {
  it('opens on the game of the data, where it has one', () => {
    expect(tacticsGameFor('warthunder')).toBe('air');
    expect(tacticsGameFor('tacview')).toBe('air');
    expect(tacticsGameFor('cs2')).toBe('cs2');
    expect(tacticsGameFor('battlefield-4')).toBe('battlefield');
    expect(tacticsGameFor('dota')).toBeNull();
    expect(tacticsGameFor(null)).toBeNull();
  });
});

describe('the load time projected', () => {
  it('counts what each row costs: a wide table takes far longer than a narrow one', () => {
    const narrow = estimateLoadSeconds(13_000_000, 6, 1);
    const wide = estimateLoadSeconds(13_000_000, 116, 1);
    expect(wide / narrow).toBeCloseTo(116 / 6, 5);
    // 45 converted matches keeping 110 columns: over a minute, not the 11 s once promised.
    expect(estimateLoadSeconds(13_400_000, 116, 30)).toBeGreaterThan(60);
  });
});
