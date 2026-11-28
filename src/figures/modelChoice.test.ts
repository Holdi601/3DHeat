import { afterEach, describe, expect, it } from 'vitest';
import type { Template } from './kit';
import type { ModelPackIndex } from './modelpack';
import { installModelPackIndex, packGames, removeFigurePack } from './figurepack';
import { builtInOf, chooseModel, FIGURES_ONLY, modelChoiceOf, modelChoiceStamp, modelGameOf, useModelChoice } from './modelChoice';

const own = (): Template => ({ team: new Float32Array(0), fixed: new Float32Array(0), min: [0, 0, 0], max: [1, 1, 1], anchor: 'ground', triangles: 0 });

function install() {
  const catalog: Record<string, { domain: string; cls: string; build: () => Template }> = {
    'leopard-2a5': { domain: 'ground', cls: 'mbt', build: own },
    mbt: { domain: 'ground', cls: 'mbt', build: own },
    'su-27': { domain: 'air', cls: 'fighter', build: own },
    soldier: { domain: 'person', cls: 'infantry', build: own },
  };
  const aliases: Record<string, string> = { germ_leopard_2a5: 'leopard-2a5', 'leopard-2a5': 'leopard-2a5', 'su-27': 'su-27' };
  const index: ModelPackIndex = {
    version: 1,
    packs: [
      { game: 'warthunder', units: { germ_leopard_2a5: { tag: 'a', domain: 'ground', kind: 'mbt', name: 'Leopard 2A5' }, su_27sm: { tag: 'b', domain: 'air', kind: 'fighter', name: 'Su-27SM' } } },
      { game: 'dcs', units: { 'leopard-2a5': { tag: 'c', domain: 'ground', kind: 'mbt', name: 'Leopard 2A5' } } },
    ],
  };
  installModelPackIndex(catalog, index, undefined, aliases);
  return { catalog, aliases };
}

afterEach(() => {
  for (const g of Object.keys(useModelChoice.getState().choices)) useModelChoice.getState().set(g, '');
});

describe('unit models choice', () => {
  it('names the game a figure is a model of, and the built-in figure behind it', () => {
    expect(modelGameOf('leopard-2a5@model:warthunder:germ_leopard_2a5')).toBe('warthunder');
    expect(modelGameOf('leopard-2a5')).toBeNull();
    expect(builtInOf('leopard-2a5@model:dcs:leopard-2a5')).toBe('leopard-2a5');
  });

  it("keeps each game's own models by default, the built-in figures or another game's models when chosen, per game", () => {
    const { catalog } = install();
    try {
      expect(packGames()).toEqual(['warthunder', 'dcs']);
      const entry = (n: string) => catalog[n];
      const dcsOwn = 'leopard-2a5@model:dcs:leopard-2a5';
      const wtOwn = 'leopard-2a5@model:warthunder:germ_leopard_2a5';
      // Default: what was found stays.
      expect(chooseModel(dcsOwn, 'dcs', ['Leopard-2A5'], entry)).toBe(dcsOwn);
      // War Thunder's models on DCS data: the same vehicle by its name.
      const before = modelChoiceStamp();
      useModelChoice.getState().set('dcs', 'warthunder');
      expect(modelChoiceStamp()).not.toBe(before);
      expect(modelChoiceOf('dcs')).toBe('warthunder');
      expect(chooseModel(dcsOwn, 'dcs', ['Leopard-2A5'], entry)).toBe(wtOwn);
      // A vehicle the chosen game lacks keeps its own; people are never swapped.
      expect(chooseModel('mbt@model:dcs:t-90', 'dcs', ['T-90'], entry)).toBe('mbt@model:dcs:t-90');
      expect(chooseModel('soldier', 'dcs', ['Soldier M4'], entry)).toBe('soldier');
      // An aircraft's model only for an aircraft: the Su-27SM is of the Su-27's family.
      expect(chooseModel('su-27', 'dcs', ['Su-27'], entry)).toBe('su-27@model:warthunder:su_27sm');
      // A choice for DCS changes nothing for War Thunder data.
      expect(chooseModel(wtOwn, 'warthunder', ['germ_leopard_2a5'], entry)).toBe(wtOwn);
      // The built-in figures only.
      useModelChoice.getState().set('warthunder', FIGURES_ONLY);
      expect(chooseModel(wtOwn, 'warthunder', ['germ_leopard_2a5'], entry)).toBe('leopard-2a5');
      expect(chooseModel(null, 'warthunder', [], entry)).toBeNull();
    } finally {
      removeFigurePack(catalog);
    }
    expect(packGames()).toEqual([]);
  });
});
