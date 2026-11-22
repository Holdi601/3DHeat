import { describe, expect, it } from 'vitest';
import { placementFromLevelInfo, placeMission, placePoint, readPlacement, tangent, unplaceMission, unplacePoint, type Il2Placement } from './placement';
import type { MissionState } from './index';

/** A made-up map: about 100 by 120 km, a little turned against north. */
const INFO = {
  heightmap: { samples: [2401, 2001], cell: 50, heightMul: 1.25, seaLevel: -40 },
  corners: { MapNW: { lat: 51.0, lon: 30.0 }, MapNE: { lat: 50.98, lon: 31.7 }, MapSE: { lat: 50.08, lon: 31.68 }, MapSW: { lat: 50.1, lon: 29.99 } },
  frame: { name: 'enu', origin: { lat: 50.55, lon: 30.85 } },
};

describe('mission placement', () => {
  const p = placementFromLevelInfo('il2-mission', INFO) as Il2Placement;

  it('reads a level json', () => {
    expect(p.kind).toBe('il2-enu');
    expect(p.xMax).toBe(100000);
    expect(p.zMax).toBe(120000);
    expect(p.yOffset).toBe(50);
    expect(placementFromLevelInfo('il2-mission', { frame: { name: 'game' } })).toBeNull();
    expect(placementFromLevelInfo('dcs-miz', INFO)).toBeNull();
    expect(readPlacement(JSON.parse(JSON.stringify(p)))).toEqual(p);
    expect(readPlacement({ kind: 'x' })).toBeUndefined();
  });

  it('puts the map corners where the corners say', () => {
    // The south-west corner: game (0, 0) = board (0, y, 0).
    const sw = placePoint(p, { x: 0, y: 10, z: 0 });
    const [e, n] = tangent(50.1, 29.99, 50.55, 30.85);
    expect(sw.x).toBeCloseTo(e, 6);
    expect(sw.z).toBeCloseTo(-n, 6);
    expect(sw.y).toBe(60);
    // The north-east corner: game x = xMax (north), z = zMax (east).
    const ne = placePoint(p, { x: p.zMax, y: 0, z: -p.xMax });
    const [e2, n2] = tangent(50.98, 31.7, 50.55, 30.85);
    expect(ne.x).toBeCloseTo(e2, 6);
    expect(ne.z).toBeCloseTo(-n2, 6);
  });

  it('goes there and back to well under a millimetre', () => {
    for (const q of [
      { x: 0, y: 0, z: 0 },
      { x: 60000, y: 1500, z: -50000 },
      { x: 119000, y: 200, z: -99000 },
      { x: 12345.678, y: 3, z: -87654.321 },
    ]) {
      const back = unplacePoint(p, placePoint(p, q));
      expect(Math.abs(back.x - q.x)).toBeLessThan(1e-3);
      expect(Math.abs(back.z - q.z)).toBeLessThan(1e-3);
      expect(back.y).toBeCloseTo(q.y, 9);
    }
  });

  it('moves a whole mission and back, headings turned with the ground', () => {
    const m: MissionState = {
      format: 'il2-mission',
      game: 'air',
      title: 't',
      map: 'IL-2: test',
      sides: [],
      places: [{ name: 'a', kind: 'airbase', at: { x: 1000, y: 0, z: -1000 } }],
      notes: [],
      groups: [
        {
          name: 'g',
          side: 'blue',
          category: 'air',
          units: [{ name: 'u', type: 't', category: 'air', at: { x: 100000, y: 1000, z: -20000 }, yaw: 1 }],
          route: [{ at: { x: 100000, y: 1000, z: -20000 } }, { at: { x: 90000, y: 1000, z: -30000 }, tasks: [{ name: 'x', points: [{ x: 1, y: 2, z: -3 }] }] }],
        },
      ],
    };
    const on = placeMission(m, p);
    expect(on.placement).toBe(p);
    // The map is turned against north: a heading changes a little, not a lot.
    expect(Math.abs(on.groups[0].units[0].yaw - 1)).toBeGreaterThan(1e-4);
    expect(Math.abs(on.groups[0].units[0].yaw - 1)).toBeLessThan(0.1);
    const back = unplaceMission(on, p);
    expect(back.placement).toBeUndefined();
    expect(back.groups[0].units[0].yaw).toBeCloseTo(1, 6);
    expect(back.groups[0].route[1].at.x).toBeCloseTo(90000, 3);
    expect(back.groups[0].route[1].tasks?.[0].points?.[0].z).toBeCloseTo(-3, 3);
    expect(back.places[0].at.z).toBeCloseTo(-1000, 3);
  });
});
