import { describe, expect, it } from 'vitest';
import { mapQuadFromAnchors, type ImageLevel } from '../render/level';
import { DOTA_MAX, DOTA_MIN, dotaAnchors, dotaToMinimap, FALLBACK, newestDotaMap, patchOf } from './dotaMap';

describe('the Dota 2 map', () => {
  it('puts the fountains in the corners, Radiant bottom left', () => {
    // The fountains as a replay has them, in Dota world units.
    const radiant = dotaToMinimap(-6900, -6425);
    const dire = dotaToMinimap(6950, 6500);
    expect(radiant.u).toBeLessThan(0.15);
    expect(radiant.v).toBeGreaterThan(0.85);
    expect(dire.u).toBeGreaterThan(0.85);
    expect(dire.v).toBeLessThan(0.15);
    expect(dotaToMinimap(DOTA_MIN, DOTA_MAX)).toEqual({ u: 0, v: 0 });
  });

  it('anchors the image so north is towards -Z, as a replay table loads', () => {
    const [a, b] = dotaAnchors(900, 900);
    expect(a).toEqual({ px: 0, py: 0, worldX: -8192, worldZ: -8064 });
    expect(b).toEqual({ px: 900, py: 900, worldX: 8064, worldZ: 8192 });
    const level = { width: 900, height: 900, anchors: [a, b], elevation: 0 } as unknown as ImageLevel;
    const q = mapQuadFromAnchors(level);
    // A table's row at Dota (x, y) is drawn at world (x, -y): pixel row 0 is the north edge.
    expect([q.minX, q.maxX, q.minZ, q.maxZ]).toEqual([-8192, 8064, -8064, 8192]);
  });

  it('takes the newest drawing from OpenDota\'s list, else the one it knows', async () => {
    const list = (async () => new Response('jpg: "/x/detailed_741.jpg", webp: "/x/detailed_741.webp" ... detailed_740.webp')) as unknown as typeof fetch;
    expect(await newestDotaMap(list)).toBe('detailed_741.webp');
    const down = (async () => new Response('', { status: 503 })) as unknown as typeof fetch;
    expect(await newestDotaMap(down)).toBe(FALLBACK);
    const offline = (async () => {
      throw new TypeError('offline');
    }) as unknown as typeof fetch;
    expect(await newestDotaMap(offline)).toBe(FALLBACK);
    expect(patchOf('detailed_740.webp')).toBe('7.40');
  });
});
