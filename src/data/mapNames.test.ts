import { describe, expect, it } from 'vitest';
import { folderGameName, mapTitle, titleWords } from './mapNames';
import { thumbFor } from './catalogIndex';

describe('map names', () => {
  it('says a level as a person would', () => {
    expect(mapTitle('warthunder', 'avg_netherlands')).toBe('Netherlands');
    expect(mapTitle('warthunder', 'air_afghan')).toBe('Afghan (air)');
    expect(mapTitle('battlefield-4', 'MP_Prison')).toBe('Operation Locker');
    expect(mapTitle('battlefield-1', 'MP_ItalianCoast')).toBe('Italian Coast');
    expect(mapTitle('battlefield-6', 'abbasid_textured_ground_nav')).toBe('Abbasid');
    expect(mapTitle('cs2', 'de_dust2')).toBe('Dust II');
    expect(mapTitle('cs2', 'de_ancient')).toBe('Ancient');
    expect(mapTitle('r6', 'r6_Bartlett-University')).toBe('Bartlett University');
    expect(mapTitle('il2', 'landscape_moscow_w')).toBe('Moscow (winter)');
    expect(mapTitle('dcs', 'Caucasus_r1', 'dcs/Caucasus/r1/Caucasus_r1.glb')).toBe('Caucasus, region 1');
    expect(mapTitle('dcs', 'Caucasus_Beslan')).toBe('Caucasus, Beslan');
    expect(mapTitle('arma-reforger', 'Arland-4m-preview', 'arma-reforger/preview/Arland-4m-preview.glb')).toBe('Arland (preview)');
    expect(titleWords('MonteCarloS1Bollene')).toBe('Monte Carlo S1 Bollene');
    expect(titleWords('GermanyCW')).toBe('Germany Cold War');
  });

  it("names a levels folder's game", () => {
    expect(folderGameName('warthunder')).toBe('War Thunder');
    expect(folderGameName('battlefield-4')).toBe('Battlefield 4');
    expect(folderGameName('arma3')).toBe('Arma 3');
    expect(folderGameName('some-new-game')).toBe('Some New Game');
  });

  it("finds a level's picture beside it", () => {
    const files = new Set(['warthunder/avg_x/avg_x_map.png', 'warthunder/avg_x/avg_x_tankmap.png', 'warthunder/avg_x/avg_x_terrain.png', 'arma-reforger/preview/Arland-overview.png', 'arma-reforger/preview/Arland-top.png']);
    expect(thumbFor('warthunder/avg_x/avg_x.glb', files)).toBe('warthunder/avg_x/avg_x_tankmap.png');
    expect(thumbFor('arma-reforger/Arland.glb', files)).toBe('arma-reforger/preview/Arland-overview.png');
    expect(thumbFor('arma-reforger/preview/Arland-4m-preview.glb', files)).toBe('arma-reforger/preview/Arland-overview.png');
    expect(thumbFor('cs2/de_dust2.glb', files)).toBeNull();
  });
});
