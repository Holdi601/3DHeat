import { describe, expect, it } from 'vitest';
import { outOfBounds, parseLevelLayouts, pickLayout } from './levelLayouts';

const square = (x0: number, z0: number, x1: number, z1: number) => [
  [x0, 0, z0],
  [x1, 0, z0],
  [x1, 0, z1],
  [x0, 0, z1],
];

const doc = {
  format: '3dheat-layouts',
  version: 1,
  game: 'battlefield-4',
  level: 'MP_Test',
  layouts: [
    {
      id: 'ConquestLarge0',
      name: 'Conquest Large',
      mode: 'ConquestLarge0',
      objectives: [
        {
          type: 'capture_zone',
          letter: 'A',
          name: 'Storage',
          position: [10, 0, 10],
          radius: 15,
        },
        { type: 'base', team: 1, name: 'HQ', position: [0, 0, 0] },
      ],
      zones: [
        { type: 'play_area', team: 1, points: square(-10, -10, 100, 100) },
        { type: 'play_area', team: 2, points: square(0, 0, 110, 110) },
      ],
      spawns: [
        { type: 'spawn', team: 1, position: [1, 0, 1], base: 'HQ' },
        { type: 'spawn', team: 1, position: [3, 0, 1], base: 'HQ' },
        { type: 'spawn', team: null, position: [12, 0, 12], base: 'A' },
      ],
    },
    {
      id: 'RushLarge0',
      name: 'Rush',
      mode: 'RushLarge0',
      objectives: [
        { type: 'objective', kind: 'mcom', position: [5, 0, 5], stage: 1 },
        { type: 'objective', kind: 'mcom', position: [50, 0, 5], stage: 2 },
      ],
      zones: [],
      spawns: [],
    },
  ],
};

describe('level layouts', () => {
  it('reads a layouts file: zones, areas, spawns grouped by owner, stages on their own', () => {
    const d = parseLevelLayouts(doc)!;
    expect(d.level).toBe('MP_Test');
    expect(d.layouts.map((l) => l.id)).toEqual(['ConquestLarge0', 'RushLarge0', 'RushLarge0#1', 'RushLarge0#2']);
    const cq = d.layouts[0].objectives;
    const zone = cq.find((o) => o.type === 'capture_zone')!;
    expect([zone.layer, zone.letter, zone.shape, zone.radius]).toEqual(['zones', 'A', 'cylinder', 15]);
    expect(cq.filter((o) => o.type === 'play_area').map((o) => [o.layer, o.team, o.shape])).toEqual([
      ['areas', 1, 'outline'],
      ['areas', 2, 'outline'],
    ]);
    const spawns = cq.filter((o) => o.type === 'spawn');
    expect(spawns.map((s) => [s.name, s.points.length])).toEqual([
      ['HQ', 2],
      ['A', 1],
    ]);
    expect(d.layouts[2].objectives.map((o) => o.position[0])).toEqual([5]);
  });

  it("hatches each team's ground outside its own area", () => {
    const d = parseLevelLayouts(doc)!;
    const hatch = outOfBounds(d.layouts[0].objectives.filter((o) => o.type === 'play_area'));
    expect(hatch.map((h) => [h.team, h.layer, h.shape])).toEqual([
      [1, 'bounds', 'hatch'],
      [2, 'bounds', 'hatch'],
    ]);
    // Team 1's strokes lie beyond x or z = 100 (team 2's corner), none inside its own square.
    for (let i = 0; i < hatch[0].points.length; i += 2) {
      const [a, b] = [hatch[0].points[i], hatch[0].points[i + 1]];
      const mx = (a[0] + b[0]) / 2;
      const mz = (a[2] + b[2]) / 2;
      expect(mx > 99.9 || mz > 99.9).toBe(true);
    }
    expect(d.layouts[0].objectives.some((o) => o.type === 'out_of_bounds')).toBe(true);
  });

  it('hatches an out-of-bounds outline inside, names stages', () => {
    const d = parseLevelLayouts({
      format: '3dheat-layouts',
      game: 'warthunder',
      level: 'avg_test',
      layouts: [
        {
          id: 'test_dom',
          stageNames: { 1: 'low ranks', 2: 'top ranks' },
          objectives: [
            { type: 'airfield', position: [0, 0, 0], stage: 1 },
            { type: 'airfield', position: [900, 0, 0], stage: 2 },
          ],
          zones: [{ type: 'out_of_bounds', team: 2, points: square(0, 0, 100, 100) }],
          spawns: [],
        },
      ],
    })!;
    expect(d.layouts.map((l) => [l.id, l.stageName])).toEqual([
      ['test_dom', undefined],
      ['test_dom#1', 'low ranks'],
      ['test_dom#2', 'top ranks'],
    ]);
    const oob = d.layouts[0].objectives.find((o) => o.type === 'out_of_bounds')!;
    expect([oob.team, oob.layer, oob.shape]).toEqual([2, 'bounds', 'hatch']);
    // Strokes in pairs, all inside the square (its edge included).
    expect(oob.points.length % 2).toBe(0);
    expect(oob.points.length).toBeGreaterThan(8);
    for (const p of oob.points) expect(p[0] > -0.01 && p[0] < 100.01 && p[2] > -0.01 && p[2] < 100.01).toBe(true);
  });

  it("picks the layout the data's mode names", () => {
    const d = parseLevelLayouts(doc)!;
    expect(pickLayout(d, ['RushLarge0'])!.id).toBe('RushLarge0');
    expect(pickLayout(d, ['Rush'])!.id).toBe('RushLarge0');
    expect(pickLayout(d, ['conquest_large'])!.id).toBe('ConquestLarge0');
    expect(pickLayout(d, [])!.id).toBe('ConquestLarge0');
    expect(parseLevelLayouts({ format: 'other' })).toBeNull();
  });
});
