import { describe, expect, it } from 'vitest';
import type { Volume } from '../volumes/volume';
import { boundaryValue, invert4, useContourPrefs, volumeContourDraw, VOLUME_CONTOUR_FS, volumeContourWgsl } from './volumeContours';

const vol = (shape: Volume['shape'], color = '#3987e5'): Volume => ({ id: Math.random().toString(36), name: 'v', color, visible: true, op: 'include', shape });

describe('volume contours', () => {
  it('inverts a view-projection', () => {
    // Column-major: scale, then a translation.
    const m = new Float32Array([2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 4, 0, 5, 6, 7, 1]);
    const inv = invert4(m);
    const p = [1, 2, 3, 1];
    const q = [0, 1, 2, 3].map((r) => m[r] * p[0] + m[4 + r] * p[1] + m[8 + r] * p[2] + m[12 + r] * p[3]);
    const back = [0, 1, 2, 3].map((r) => inv[r] * q[0] + inv[4 + r] * q[1] + inv[8 + r] * q[2] + inv[12 + r] * q[3]);
    back.forEach((v, i) => expect(v).toBeCloseTo(p[i], 5));
  });

  it('is zero on each shape\'s surface, negative inside, positive outside', () => {
    const cyl = vol({ kind: 'cylinder', x: 10, z: 20, radius: 5, floor: 0, ceil: 10 });
    expect(boundaryValue(cyl, 15, 5, 20)).toBeCloseTo(0, 6);
    expect(boundaryValue(cyl, 10, 5, 20)).toBeLessThan(0);
    expect(boundaryValue(cyl, 20, 5, 20)).toBeGreaterThan(0);
    expect(boundaryValue(cyl, 10, 12, 20)).toBeGreaterThan(0);
    const sph = vol({ kind: 'sphere', center: [0, 0, 0], radius: 2 });
    expect(boundaryValue(sph, 0, 2, 0)).toBeCloseTo(0, 6);
    const box = vol({ kind: 'box', center: [0, 0, 0], size: [4, 2, 6], yaw: 0, pitch: 0, roll: 0 });
    expect(boundaryValue(box, 2, 0, 0)).toBeCloseTo(0, 6);
    expect(boundaryValue(box, 0, 0, 2.9)).toBeLessThan(0);
    const prism = vol({ kind: 'prism', points: [[0, 0], [10, 0], [10, 10], [0, 10]], floor: 0, ceil: 4 });
    expect(boundaryValue(prism, 10, 2, 5)).toBeCloseTo(0, 6);
    expect(boundaryValue(prism, 5, 2, 5)).toBeCloseTo(-2, 6);
    expect(boundaryValue(prism, 15, 2, 5)).toBeCloseTo(5, 6);
  });

  it('packs the visible volumes with their colours, and nothing when switched off', () => {
    const list = [vol({ kind: 'sphere', center: [0, 0, 0], radius: 1 }, '#ff0000'), { ...vol({ kind: 'sphere', center: [0, 0, 0], radius: 1 }), visible: false }];
    useContourPrefs.getState().set({ on: true, width: 2 });
    const d = volumeContourDraw(list)!;
    expect(d.count).toBe(1);
    expect(Array.from(d.colors.slice(0, 3))).toEqual([1, 0, 0]);
    expect(volumeContourDraw(list)).toBe(d);
    useContourPrefs.getState().set({ on: false });
    expect(volumeContourDraw(list)).toBeNull();
    useContourPrefs.getState().set({ on: true, width: 1.5 });
  });

  it('takes its derivatives outside any loop that can break', () => {
    // Derivatives inside a loop with an early exit drew nothing on ANGLE (D3D).
    for (const src of [VOLUME_CONTOUR_FS, volumeContourWgsl()]) {
      const deriv = src.search(/dFdx|dpdx/);
      const loop = src.lastIndexOf('for (', deriv);
      const body = src.slice(loop, deriv);
      expect(body).not.toMatch(/break/);
    }
  });
});
