import { describe, expect, it } from 'vitest';
import { cameraForExtent } from './calibrate';
import type { Bounds } from '../state/types';

function bounds(width: number, height = 100): Bounds {
  return {
    minX: -width / 2,
    maxX: width / 2,
    minY: 0,
    maxY: height,
    minZ: -width / 2,
    maxZ: width / 2,
  };
}

const START = { near: 0.5, far: 40_000, flySpeed: 120 };

describe('cameraForExtent', () => {
  it('leaves a frustum alone when the level already fits', () => {
    // Same object back, not a copy: this runs inside a store update, where a new
    // object would re-render every camera subscriber on every level load.
    const same = cameraForExtent(START, bounds(2_000));
    expect(same).toBe(START);
  });

  it('widens far enough to frame a kilometre-scale map', () => {
    // A level several kilometres across. Framing it at a 65 degree field of
    // view needs ~314k units of distance, against a 40k default far plane.
    const widened = cameraForExtent(START, bounds(400_000));
    expect(widened.far).toBeGreaterThan(314_000);
    expect(widened.flySpeed).toBeGreaterThan(START.flySpeed);
  });

  it('moves near with far, to keep the depth buffer usable', () => {
    // Depth precision is set by the ratio, and the heat occlusion test compares
    // window depths. Pinning near at half a unit against a million-unit far
    // plane would leave a wall and the ground behind it indistinguishable.
    const widened = cameraForExtent(START, bounds(3_000_000));
    expect(widened.far / widened.near).toBeLessThanOrEqual(100_000);
    expect(widened.near).toBeGreaterThan(START.near);
  });

  it('never narrows a frustum a dataset already widened', () => {
    // A big dataset with a small level loaded next to it: the level must not
    // pull the far plane back in front of the data.
    const calibrated = { near: 5, far: 500_000, flySpeed: 4_000 };
    expect(cameraForExtent(calibrated, bounds(1_000))).toBe(calibrated);
  });
});
