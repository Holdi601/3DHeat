import { describe, expect, it } from 'vitest';
import { Matrix4, PerspectiveCamera, Vector4 } from 'three';
import {
  behind,
  DEPTH_GLSL,
  DEPTH_WGSL,
  REVERSE_Z_REMAP,
  viewDistanceAt,
  viewNearFor,
  windowDepth,
  ZERO_ONE_REMAP,
} from './depth';

/** z/w of a point straight ahead at `dist`, through a three.js projection and a remap. */
function clipDepth(remap: readonly number[], near: number, far: number, dist: number): number {
  const cam = new PerspectiveCamera(65, 1.6, near, far);
  cam.updateProjectionMatrix();
  const m = new Matrix4().set(...(remap as Parameters<Matrix4['set']>)).multiply(cam.projectionMatrix);
  const c = new Vector4(0, 0, -dist, 1).applyMatrix4(m);
  return c.z / c.w;
}

/** A 24-bit fixed-point depth buffer's stored value. */
const fixed24 = (d: number) => Math.round(d * 16777215);

describe('reverse-Z depth', () => {
  it('maps the near plane to 1 and the far plane to 0, through the same matrix the engine uses', () => {
    expect(clipDepth(REVERSE_Z_REMAP, 0.05, 180_000, 0.05)).toBeCloseTo(1, 6);
    expect(clipDepth(REVERSE_Z_REMAP, 0.05, 180_000, 180_000)).toBeCloseTo(0, 6);
    for (const d of [0.5, 30, 2000, 20_000]) {
      expect(clipDepth(REVERSE_Z_REMAP, 0.05, 180_000, d)).toBeCloseTo(windowDepth(d, 0.05, 180_000, true, true), 9);
      expect(clipDepth(ZERO_ONE_REMAP, 0.05, 180_000, d)).toBeCloseTo(windowDepth(d, 0.05, 180_000, true, false), 9);
    }
  });

  it('reads distance back from depth in both layouts, perspective and parallel', () => {
    for (const reverse of [true, false])
      for (const perspective of [true, false])
        for (const d of [1, 75, 4000, 90_000]) {
          const back = viewDistanceAt(windowDepth(d, 0.5, 100_000, perspective, reverse), 0.5, 100_000, perspective, reverse);
          expect(back / d).toBeCloseTo(1, 6);
        }
  });

  it('says "behind" the right way round in each layout', () => {
    const near = windowDepth(100, 0.05, 1e5, true, true);
    const far = windowDepth(200, 0.05, 1e5, true, true);
    expect(behind(far, near, true)).toBe(true);
    expect(behind(near, far, true)).toBe(false);
    expect(behind(windowDepth(200, 0.05, 1e5, true, false), windowDepth(100, 0.05, 1e5, true, false), false)).toBe(true);
  });

  it('tells two surfaces a metre apart 20 km off apart, with the near plane 5 cm out', () => {
    // What z-fought before: a 60 km level put the classic near plane 1.8 m out,
    // and even so a 24-bit buffer could not separate the two.
    const [n, f] = [0.05, 180_000];
    const a = Math.fround(windowDepth(20_000, n, f, true, true));
    const b = Math.fround(windowDepth(20_001, n, f, true, true));
    expect(a).toBeGreaterThan(b);
    // Hundreds of float steps apart, not one.
    expect((a - b) / (a * 2 ** -23)).toBeGreaterThan(100);
    const classic = (d: number) => fixed24(windowDepth(d, 1.8, f, true, false));
    expect(classic(20_001) - classic(20_000)).toBeLessThanOrEqual(1);
  });

  it('draws with the near plane set under reverse-Z, and keeps the classic floor without it', () => {
    const q = { near: 0.05, far: 180_000, grow: false, outside: 0, above: 0, streamed: false };
    expect(viewNearFor({ ...q, reverse: true })).toBe(0.05);
    expect(viewNearFor({ ...q, reverse: true, grow: true, outside: 50_000 })).toBe(0.05);
    expect(viewNearFor({ ...q, reverse: false })).toBeCloseTo(1.8);
    expect(viewNearFor({ ...q, reverse: false, grow: true, outside: 50_000 })).toBeCloseTo(1000);
    expect(viewNearFor({ ...q, far: 3e6, reverse: false, streamed: true })).toBe(10);
    expect(viewNearFor({ ...q, near: 20, reverse: false })).toBe(20);
  });

  it('has both layouts in the GLSL, and reverse-Z in the WGSL', () => {
    expect(DEPTH_GLSL).toMatch(/#ifdef REVERSE_Z[\s\S]*DEPTH_BEHIND\(a, b\) \(\(a\) < \(b\)\)[\s\S]*#else[\s\S]*DEPTH_BEHIND\(a, b\) \(\(a\) > \(b\)\)[\s\S]*#endif/);
    expect(DEPTH_WGSL).toMatch(/fn depthBehind\(a : f32, b : f32\) -> bool \{ return a < b; \}/);
    // The float literals must be valid in both languages: no 'e' without a mantissa digit.
    expect(DEPTH_GLSL + DEPTH_WGSL).not.toMatch(/[^\d.]e-\d/);
  });
});
