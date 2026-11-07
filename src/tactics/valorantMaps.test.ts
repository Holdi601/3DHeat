import { describe, expect, it } from 'vitest';
import { fetchValorantMaps, minimapAnchors, minimapToWorld, type ValorantMap } from './valorantMaps';

const map: ValorantMap = { uuid: 'u', name: 'Test', image: 'x.png', xMultiplier: 7e-5, yMultiplier: -7e-5, xScalarToAdd: 0.5, yScalarToAdd: 0.6 };

describe('Valorant minimaps', () => {
  it('turns minimap fractions into board metres by the swapped-axis calibration', () => {
    // A game position (x, y) in cm lands at u = y*xm + xa, v = x*ym + ya.
    const gx = 1200;
    const gy = -3400;
    const u = gy * map.xMultiplier + map.xScalarToAdd;
    const v = gx * map.yMultiplier + map.yScalarToAdd;
    const w = minimapToWorld(map, u, v);
    expect(w.x).toBeCloseTo(gy / 100, 9);
    expect(w.z).toBeCloseTo(gx / 100, 9);
  });

  it('anchors the image corners', () => {
    const [a, b] = minimapAnchors(map, 1024, 1024);
    expect(a).toMatchObject({ px: 0, py: 0 });
    expect(b).toMatchObject({ px: 1024, py: 1024 });
    // The whole minimap spans 1 / 7e-5 cm = about 143 m.
    expect(Math.abs(b.worldX - a.worldX)).toBeCloseTo(142.857, 2);
  });

  it('keeps only maps with a minimap and a calibration', async () => {
    const fake = (async () =>
      new Response(
        JSON.stringify({
          data: [
            { uuid: '1', displayName: 'Bind', displayIcon: 'b.png', xMultiplier: 1e-4, yMultiplier: -1e-4, xScalarToAdd: 0.5, yScalarToAdd: 0.5 },
            { uuid: '2', displayName: 'The Range', displayIcon: null, xMultiplier: 0, yMultiplier: 0, xScalarToAdd: 0, yScalarToAdd: 0 },
          ],
        }),
      )) as unknown as typeof fetch;
    const maps = await fetchValorantMaps(fake);
    expect(maps.map((m) => m.name)).toEqual(['Bind']);
  });
});
