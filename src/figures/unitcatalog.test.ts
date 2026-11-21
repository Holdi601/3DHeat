import { describe, expect, it } from 'vitest';
import { catalogItem, catalogName, installUnitCatalogs, lendCatalogModels, type UnitCatalogIndex } from './unitcatalog';
import type { ModelPackIndex } from './modelpack';

const catalogs: UnitCatalogIndex = {
  version: 1,
  games: [
    {
      game: 'dcs',
      items: [
        { id: 'T-72B3', name: 'MBT T-72B3', kind: 'vehicle', class: 'mbt', key: 'T-72B3' },
        { id: 'F-16C_50', name: 'F-16CM bl.50', kind: 'vehicle', class: 'fighter', key: 'F-16C' },
        { id: 'local-dcs-aim-120c', name: 'AIM-120C', kind: 'weapon', class: 'aam', key: 'F-16C' },
      ],
    },
    { game: 'battlefield-4', items: [{ id: 't90', name: 'T-90A', kind: 'vehicle', class: 'mbt', nation: 'RU', key: 'T-90A' }] },
  ],
};

const packs: ModelPackIndex = {
  version: 1,
  packs: [
    { game: 'warthunder', units: { ussr_t_72b3: { tag: 'a', name: 'T-72B3' }, f_16c: { tag: 'b', name: 'F-16C', names: ['F-16C Block 50'] } } },
    { game: 'battlefield-4', units: { t90: { tag: 'c', name: 'T-90A' } } },
  ],
};

describe('unit catalogues', () => {
  it('name a unit by its id, in any game or the one given', () => {
    installUnitCatalogs(catalogs);
    expect(catalogName('f-16c_50')).toBe('F-16CM bl.50');
    expect(catalogItem('T90')?.nation).toBe('RU');
    expect(catalogItem('t90', 'dcs')).toBeUndefined();
    expect(catalogName('nothing')).toBe('');
    installUnitCatalogs(null);
    expect(catalogName('f-16c_50')).toBe('');
  });

  it("lend another game's model by the real vehicle, never over a unit's own model or to a weapon", () => {
    const aliases: Record<string, string> = {
      ussr_t_72b3: 'mbt@model:warthunder:ussr_t_72b3',
      f_16c: 'multirole@model:warthunder:f_16c',
      t90: 'mbt@model:battlefield-4:t90',
      'local-dcs-aim-120c': 'missile',
    };
    expect(lendCatalogModels(catalogs, packs, aliases)).toBe(2);
    expect(aliases['t-72b3']).toBe('mbt@model:warthunder:ussr_t_72b3');
    expect(aliases['f-16c_50']).toBe('multirole@model:warthunder:f_16c');
    expect(aliases.t90).toBe('mbt@model:battlefield-4:t90');
    expect(aliases['local-dcs-aim-120c']).toBe('missile');
  });

  it('do nothing without catalogues or packs', () => {
    const aliases: Record<string, string> = {};
    expect(lendCatalogModels(null, packs, aliases)).toBe(0);
    expect(lendCatalogModels(catalogs, null, aliases)).toBe(0);
    expect(aliases).toEqual({});
  });
});
