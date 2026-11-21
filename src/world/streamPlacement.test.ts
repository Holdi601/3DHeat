import { describe, expect, it } from 'vitest';
import { dataToWorld } from '../render/pose';
import type { AxisMapping, GeoPlacement } from '../state/types';
import { movePoint, reproject, streamBounds } from './reproject';
import { theatreById, theatreGeo } from './theatres';
import { dataOfEastNorth, planeForward } from './tiles';

/** The axes a theatre streamed before any data uses, and a Tacview recording's. */
const AXES: AxisMapping = { up: 'z', flipX: false, flipY: true, flipZ: false, scale: 1 };

describe('a streamed theatre put under data loaded after it', () => {
  const th = theatreById('Caucasus')!;
  const before: GeoPlacement = { geo: theatreGeo(th), axes: AXES };
  // A Caucasus recording's reference: a whole degree outside the map.
  const after: GeoPlacement = { geo: { lat0: 38, lon0: 36, projection: 'tangent-plane' }, axes: AXES };

  it('cannot be moved as a mesh: an empty mesh has no box (the bug: the whole scene vanished)', () => {
    const r = reproject(new Float32Array(0), [], before, after);
    expect(Number.isFinite(r.bounds.minX)).toBe(false);
  });

  it('gets its box worked out again on the new placement, finite and round the theatre', () => {
    const { bounds, band } = streamBounds(after, th.box);
    for (const v of Object.values(bounds)) expect(Number.isFinite(v)).toBe(true);
    expect(band.maxY - band.minY).toBeCloseTo(4100, 0);
    // Taman, where the recording's AWACS orbits, is inside it.
    const [e, n] = planeForward(after.geo)(45.3, 37.0);
    const p = dataToWorld(dataOfEastNorth(after.geo, e, n, 8000), after.axes);
    expect(p.x).toBeGreaterThan(bounds.minX);
    expect(p.x).toBeLessThan(bounds.maxX);
    expect(p.z).toBeGreaterThan(bounds.minZ);
    expect(p.z).toBeLessThan(bounds.maxZ);
  });

  it('moves its names exactly, however far from the reference', () => {
    const at = (pl: GeoPlacement, lat: number, lon: number, h: number) => {
      const [e, n] = planeForward(pl.geo)(lat, lon);
      return dataToWorld(dataOfEastNorth(pl.geo, e, n, h), pl.axes);
    };
    const moved = movePoint(at(before, 43.2, 44.6, 530), before, after);
    const want = at(after, 43.2, 44.6, 530);
    expect(moved.x).toBeCloseTo(want.x, 1);
    expect(moved.y).toBeCloseTo(want.y, 1);
    expect(moved.z).toBeCloseTo(want.z, 1);
  });
});

describe("a streamed world's camera", () => {
  it('widens the far plane over the whole reach but keeps the near plane close enough to follow a figure', async () => {
    const { cameraForExtent } = await import('../data/calibrate');
    const { viewNearFor } = await import('../render/depth');
    const th = theatreById('Caucasus')!;
    const pl: GeoPlacement = { geo: { lat0: 38, lon0: 36, projection: 'tangent-plane' }, axes: AXES };
    const { bounds } = streamBounds(pl, th.box);
    const data = { near: 2, far: 2_000_000, flySpeed: 100 };
    const widened = cameraForExtent(data, bounds);
    expect(widened.far).toBeGreaterThan(data.far);
    expect(widened.near).toBe(2);
    const q = { near: widened.near, far: widened.far, grow: false, outside: 0, above: 0 };
    // Reverse-Z draws with the near plane set.
    expect(viewNearFor({ ...q, reverse: true, streamed: true })).toBe(2);
    // The classic layout's floor: far / 10^5 - what cut the followed E-3A at 60 m - capped for a streamed world.
    expect(viewNearFor({ ...q, reverse: false, streamed: false })).toBeGreaterThan(100);
    expect(viewNearFor({ ...q, reverse: false, streamed: true })).toBe(10);
    expect(viewNearFor({ ...q, near: 20, reverse: false, streamed: true })).toBe(20);
  });
});
