import { describe, expect, it } from 'vitest';
import { DEFAULT_LOOK, niceStep, postDrawFor, readLook, tacticalLevel, tacticalLines, type LookTrack } from './tacticalLook';
import { POST_FLOATS, packPostUniforms } from './post/tacticalPost';

describe('tactical look', () => {
  it('rounds steps to 1, 2, 5', () => {
    expect(niceStep(0.7)).toBe(1);
    expect(niceStep(130)).toBe(200);
    expect(niceStep(400)).toBe(500);
    expect(niceStep(5000)).toBe(5000);
    expect(niceStep(NaN)).toBe(1);
  });

  it('reads a saved look, keeping only what is valid', () => {
    expect(readLook(null)).toEqual(DEFAULT_LOOK);
    const l = readLook({ on: true, quality: 'ultra', colour: 'amber', bloom: 'yes', director: true });
    expect(l).toMatchObject({ on: true, quality: 'medium', colour: 'amber', bloom: true, director: true });
  });

  it('scales the weights by quality and the spacings by the scene', () => {
    const scene = { extent: 40000, heightRange: 1500, unitsPerMetre: 1 };
    const low = postDrawFor({ ...DEFAULT_LOOK, quality: 'low' }, scene, 0, 0);
    const high = postDrawFor({ ...DEFAULT_LOOK, quality: 'high' }, scene, 0, 2);
    expect(low.bloom).toBe(0);
    expect(low.noise).toBe(0);
    expect(high.bloom).toBeGreaterThan(1);
    expect(high.flash).toBe(1);
    expect(high.gridSpacing).toBe(1000);
    expect(high.contourSpacing).toBe(100);
    expect(postDrawFor({ ...DEFAULT_LOOK, contours: false }, scene, 0, 0).contours).toBe(0);
  });

  it('packs the camera as a ray basis', () => {
    // Identity view: the camera at the origin looking down -z, 90 degree view.
    const view = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    const proj = new Float32Array(16);
    proj[0] = 1;
    proj[5] = 2;
    const out = packPostUniforms(
      { view, proj, cameraPos: new Float32Array([1, 2, 3]), perspective: true, near: 0.5, far: 900 },
      postDrawFor(DEFAULT_LOOK, { extent: 1000, heightRange: 100, unitsPerMetre: 1 }, 7, 0),
      200,
      100,
      [0.1, 0.1, 0.1],
      new Float32Array(POST_FLOATS),
    );
    expect(Array.from(out.subarray(0, 4))).toEqual([1, 2, 3, 7]);
    expect(Array.from(out.subarray(4, 7))).toEqual([1, 0, 0]);
    expect(Array.from(out.subarray(8, 11))).toEqual([0, 0.5, 0]);
    expect(Array.from(out.subarray(12, 16))).toEqual([-0, -0, -1, 1]);
    expect(out[16]).toBeCloseTo(1 / 200);
    expect(out[39]).toBe(1);
  });

  it('dims the level and draws its structures as wires', () => {
    expect(tacticalLevel(null)).toBeNull();
  });

  it('stands a ladder under each flier and rings round the followed one', () => {
    const t = (x: number, y: number, air: boolean, near = 0): LookTrack => ({ x, y, z: 0, colour: [1, 0, 0], air, near });
    const tracks = [t(0, 1000, true), t(10, 0, false), t(20, 500, true, 5)];
    const scratch = { buf: new Float32Array(0) };
    const base = new Float32Array(14).fill(9);
    const opts = { floor: 0, extent: 10000, unitsPerMetre: 1, rings: false, ladders: true, quality: 'medium' as const, tint: [0, 1, 1] };
    const r = tacticalLines(tracks, null, opts, base, 2, scratch);
    // The base kept in front.
    expect(r.data[0]).toBe(9);
    // Step 200 (1000 / 8 -> 200): 5 and 2 ticks; per flier a pole, 2 segments a tick, a 24-segment foot ring.
    expect(r.count).toBe(2 + (2 + 4 * 5 + 48) + (2 + 4 * 2 + 48));
    const rings = tacticalLines(tracks, tracks[0], { ...opts, ladders: false, rings: true }, null, 0, scratch);
    expect(rings.count).toBe(4 * (96 * 2 + 24) + 2);
    // Low quality keeps the nearest fliers only.
    const many = Array.from({ length: 20 }, (_, i) => t(i, 100, true, 20 - i));
    const low = tacticalLines(many, null, { ...opts, quality: 'low' }, null, 0, scratch);
    // 100 / 8 -> step 20: five ticks each.
    expect(low.count).toBe(8 * (2 + 4 * 5 + 48));
  });
});
