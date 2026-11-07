import { describe, expect, it } from 'vitest';
import { pathLength, poseAt, prepare, type Keyframe } from './campath';

/**
 * A camera path's failures are all visible and none of them throw: a lurch at a
 * key, a spin the wrong way round, a fly-off before the first keyframe. These
 * pin the ones that would ruin a render.
 */

const key = (u: number, p: Partial<Keyframe> = {}): Keyframe => ({
  u,
  x: 0,
  y: 0,
  z: 0,
  yaw: 0,
  pitch: 0,
  fov: 60,
  ...p,
});

describe('poseAt — the ends', () => {
  it('has no pose without keys', () => {
    expect(poseAt([], 0.5)).toBeNull();
  });

  it('holds a single key everywhere', () => {
    const only = [key(0.4, { x: 7, yaw: 33 })];
    for (const u of [0, 0.4, 1]) {
      expect(poseAt(only, u)).toMatchObject({ x: 7, yaw: 33 });
    }
  });

  it('holds the endpoints rather than extrapolating past them', () => {
    // A cubic run off the end of its data accelerates without bound, so a camera
    // asked for u = 0 on a path starting at 0.25 would be somewhere absurd.
    const keys = [key(0.25, { x: 10 }), key(0.75, { x: 20 })];
    expect(poseAt(keys, 0)!.x).toBeCloseTo(10, 6);
    expect(poseAt(keys, 1)!.x).toBeCloseTo(20, 6);
  });

  it('passes exactly through every keyframe', () => {
    // The one property a keyframe has to have. Hermite interpolation guarantees
    // it; a smoothing filter over the keys would not, and the difference only
    // shows up as "the shot does not quite frame what I framed".
    const keys = [key(0, { x: 0 }), key(0.3, { x: 50 }), key(0.5, { x: -20 }), key(1, { x: 9 })];
    for (const k of keys) {
      expect(poseAt(keys, k.u)!.x).toBeCloseTo(k.x, 6);
    }
  });
});

describe('poseAt — smoothness', () => {
  it('has no speed discontinuity at a key with uneven spacing', () => {
    // The reason this uses Hermite with finite-difference tangents rather than
    // uniform Catmull-Rom. Keys placed by hand are never evenly spaced, and
    // uniform parameterisation makes the curve continuous but its *speed* jump
    // at every key — which on a camera reads as the operator flinching.
    const keys = [key(0, { x: 0 }), key(0.2, { x: 10 }), key(1, { x: 20 })];
    const h = 1e-4;
    const at = (u: number) => poseAt(keys, u)!.x;
    const before = (at(0.2) - at(0.2 - h)) / h;
    const after = (at(0.2 + h) - at(0.2)) / h;
    expect(Math.abs(after - before) / Math.max(1, Math.abs(before))).toBeLessThan(0.02);
  });

  it('corners at every key when told to go straight', () => {
    // The other option has to actually be the other option.
    const keys = [key(0, { x: 0 }), key(0.2, { x: 10 }), key(1, { x: 20 })];
    const h = 1e-4;
    const at = (u: number) => poseAt(keys, u, 'linear')!.x;
    const before = (at(0.2) - at(0.2 - h)) / h;
    const after = (at(0.2 + h) - at(0.2)) / h;
    expect(Math.abs(after - before)).toBeGreaterThan(1);
  });

  it('keeps field of view monotonic between two keys', () => {
    // Cubic on fov overshoots, and an overshoot in fov is a lens breath at every
    // key even when the motion is perfectly smooth — so it stays linear.
    const keys = [key(0, { fov: 40 }), key(0.5, { fov: 90 }), key(1, { fov: 40 })];
    for (let i = 0; i <= 50; i++) {
      const v = poseAt(keys, i / 100)!.fov;
      expect(v).toBeGreaterThanOrEqual(40 - 1e-9);
      expect(v).toBeLessThanOrEqual(90 + 1e-9);
    }
  });
});

describe('prepare — yaw unwrapping', () => {
  it('turns the short way past north', () => {
    // 350° then 10° is a 20° turn right, not a 340° spin left. Interpolating the
    // raw numbers gives the spin, through everything the shot was avoiding.
    const keys = prepare([key(0, { yaw: 350 }), key(1, { yaw: 10 })]);
    expect(keys[1].yaw).toBeCloseTo(370, 6);
    const mid = poseAt(keys, 0.5)!.yaw;
    expect(mid).toBeGreaterThan(350);
    expect(mid).toBeLessThan(370);
  });

  it('unwraps a continuing turn cumulatively', () => {
    // A camera turning steadily right through north and on round. Each key must
    // be unwrapped against the *unwrapped* previous one, not the raw one, or the
    // path folds back on itself after the first wrap.
    const keys = prepare([
      key(0, { yaw: 170 }),
      key(0.33, { yaw: -170 }),
      key(0.66, { yaw: -110 }),
      key(1, { yaw: -50 }),
    ]);
    expect(keys.map((k) => Math.round(k.yaw))).toEqual([170, 190, 250, 310]);
  });

  it('reads an alternating pair as an oscillation, not a climb', () => {
    // 170, -170, 170 is the camera crossing 180 and coming back — a 20° turn each
    // way. Unwrapping must not mistake it for a continuing rotation, which would
    // send the camera round and round on a path that was meant to rock.
    const keys = prepare([key(0, { yaw: 170 }), key(0.5, { yaw: -170 }), key(1, { yaw: 170 })]);
    expect(keys.map((k) => Math.round(k.yaw))).toEqual([170, 190, 170]);
  });

  it('sorts by position and drops unusable keys', () => {
    const keys = prepare([
      key(0.9, { x: 3 }),
      key(0.1, { x: 1 }),
      { ...key(0.5), u: Number.NaN },
      key(0.5, { x: 2 }),
    ]);
    expect(keys.map((k) => k.x)).toEqual([1, 2, 3]);
  });

  it('does not mutate the keys it is given', () => {
    // The keys live in the store; unwrapping in place would rewrite the user's
    // yaw values behind their back every time the path was evaluated.
    const original = [key(0, { yaw: 350 }), key(1, { yaw: 10 })];
    prepare(original);
    expect(original[1].yaw).toBe(10);
  });
});

describe('poseAt — coincident keys', () => {
  it('survives two keys at the same position', () => {
    // Reachable by capturing two keyframes and then changing the count, and a
    // zero-width segment is a division by zero waiting to happen.
    const keys = [key(0.5, { x: 1 }), key(0.5, { x: 2 }), key(1, { x: 3 })];
    for (let i = 0; i <= 10; i++) {
      const p = poseAt(keys, i / 10)!;
      expect(Number.isFinite(p.x)).toBe(true);
    }
  });

  it('survives every key at the same position', () => {
    const keys = [key(0, { x: 1 }), key(0, { x: 2 })];
    const p = poseAt(keys, 0.5)!;
    expect(Number.isFinite(p.x)).toBe(true);
  });
});

describe('pathLength', () => {
  it('is zero for a path that does not move', () => {
    expect(pathLength([key(0), key(1)])).toBe(0);
  });

  it('measures a straight line', () => {
    const keys = [key(0, { x: 0 }), key(1, { x: 100 })];
    expect(pathLength(keys, 'linear')).toBeCloseTo(100, 1);
  });

  it('measures a smooth curve as at least the straight-line distance', () => {
    const keys = [key(0, { x: 0 }), key(0.5, { x: 50, z: 40 }), key(1, { x: 100 })];
    expect(pathLength(keys, 'smooth')).toBeGreaterThan(100);
  });
});
