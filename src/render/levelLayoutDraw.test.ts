import { describe, expect, it } from 'vitest';
import { ObjectiveLayerDraw } from './objectives';
import { parseLevelLayouts } from '../match/levelLayouts';
import { OBJECTIVE_LAYERS, type ObjectiveLayer } from '../match/objectives';

const square = (x0: number, z0: number, x1: number, z1: number) => [
  [x0, 5, z0],
  [x1, 5, z0],
  [x1, 5, z1],
  [x0, 5, z1],
];

describe("a level's layout drawn", () => {
  it('fills each play area, hatches out of bounds, in the level frame whatever the axes', () => {
    const doc = parseLevelLayouts({
      format: '3dheat-layouts',
      game: 'battlefield-4',
      level: 'MP_Test',
      layouts: [
        {
          id: 'ConquestLarge0',
          objectives: [
            {
              type: 'capture_zone',
              letter: 'A',
              position: [50, 5, 50],
              radius: 15,
            },
          ],
          zones: [
            { type: 'play_area', team: 1, points: square(0, 0, 200, 200) },
            { type: 'play_area', team: 2, points: square(100, 0, 300, 200) },
          ],
          spawns: [],
        },
      ],
    })!;
    const layers = Object.fromEntries(OBJECTIVE_LAYERS.map((l) => [l, true])) as Record<ObjectiveLayer, boolean>;
    const draw = new ObjectiveLayerDraw();
    const frame = (only?: ObjectiveLayer) =>
      draw.build(
        {
          sources: [
            {
              match: '@layout',
              objectives: doc.layouts[0].objectives,
              timeline: null,
              offset: 0,
              world: true,
            },
          ],
          // The data's axes are mirrored and scaled: the layout must not be.
          axes: {
            up: 'y',
            flipX: true,
            flipY: false,
            flipZ: false,
            scale: 10,
          } as never,
          layers: only
            ? ({
                ...Object.fromEntries(OBJECTIVE_LAYERS.map((l) => [l, l === only])),
              } as Record<ObjectiveLayer, boolean>)
            : layers,
          t: 0,
          teamColor: (n) => (n === 2 ? [0, 0, 1] : [1, 0, 0]),
          ground: null,
          ready: () => true,
          groundKey: null,
          xray: 1,
        },
        null,
        0,
      );
    const all = frame();
    expect(all.count).toBeGreaterThan(0);
    // Every line point inside the areas' extent, not mirrored or scaled.
    for (let i = 0; i < all.count; i++) {
      const x = all.data![i * 7];
      expect(x).toBeGreaterThanOrEqual(-0.01);
      expect(x).toBeLessThanOrEqual(300.01);
    }
    expect(draw.ground!.count).toBeGreaterThan(0);
    const hatch = frame('bounds');
    expect(hatch.count).toBeGreaterThan(8);
  });
});
