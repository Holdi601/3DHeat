import { describe, expect, it } from 'vitest';
import { HOLD_LOST, framePadlock, framePair, pairState, turnToward, type Vec3 } from './pairFrame';

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const unit = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / l, a[1] / l, a[2] / l];
};
/** The angle between the look and the direction from the eye to a point, degrees. */
const off = (eye: Vec3, look: Vec3, p: Vec3) => (Math.acos(Math.min(1, dot(look, unit(sub(p, eye))))) * 180) / Math.PI;

describe('pair framing', () => {
  it('puts the eye behind A on the line from B, with both in the picture', () => {
    const s = pairState();
    const a: Vec3 = [0, 1000, 0];
    const b: Vec3 = [0, 1000, -5000];
    const { eye, look } = framePair(s, a, [1, 0, 0], b, 100, 0);
    // Behind A, away from B (B is north, the eye south), and a little above.
    expect(eye[2]).toBeGreaterThan(a[2]);
    expect(eye[1]).toBeGreaterThan(a[1]);
    // Both well inside a 60 degree view.
    expect(off(eye, look, a)).toBeLessThan(25);
    expect(off(eye, look, b)).toBeLessThan(25);
  });

  it('swings round, not snaps, when B passes behind A', () => {
    const s = pairState();
    const a: Vec3 = [0, 0, 0];
    framePair(s, a, [0, 0, -1], [0, 0, -500], 100, 0);
    const before = s.dir!;
    // B jumps to straight behind: one 60 Hz frame turns the kept direction only a little.
    framePair(s, a, [0, 0, -1], [0, 0, 500], 100, 1 / 60);
    const turned = (Math.acos(Math.max(-1, Math.min(1, dot(before, s.dir!)))) * 180) / Math.PI;
    expect(turned).toBeGreaterThan(0.5);
    expect(turned).toBeLessThan(15);
    // Opposite directions turn about the vertical, level.
    expect(Math.abs(s.dir![1])).toBeLessThan(1e-6);
    // Given time it gets there.
    for (let i = 0; i < 240; i++) framePair(s, a, [0, 0, -1], [0, 0, 500], 100, 1 / 60);
    expect(dot(s.dir!, [0, 0, 1])).toBeGreaterThan(0.999);
  });

  it('follows smooth motion exactly, without lag', () => {
    const s = pairState();
    for (let k = 0; k < 120; k++) {
      // B circling A at 30 degrees a second.
      const t = (k / 60) * (Math.PI / 6);
      framePair(s, [0, 0, 0], [0, 0, -1], [Math.sin(t) * 1000, 0, -Math.cos(t) * 1000], 100, 1 / 60);
      expect(s.dir![0]).toBeCloseTo(Math.sin(t), 9);
      expect(s.swinging).toBe(false);
    }
  });

  it('keeps the eye from going far under A or straight over it', () => {
    const s = pairState();
    // B straight above: the eye would be straight under A.
    const { eye } = framePair(s, [0, 0, 0], [0, 0, -1], [0, 2000, 0], 100, 0);
    expect(eye[1]).toBeGreaterThan(-100 * Math.sin(0.31));
    // It sits behind the nose instead.
    expect(eye[2]).toBeGreaterThan(0);
  });

  it('holds a lost B where it was, then eases back to the plain follow', () => {
    const s = pairState();
    const a: Vec3 = [0, 0, 0];
    const b: Vec3 = [300, 0, -300];
    framePair(s, a, [0, 0, -1], b, 100, 0);
    // Lost: still framed where it was for the hold.
    const held = framePair(s, a, [0, 0, -1], null, 100, 0.2);
    expect(held.b).toEqual(b);
    expect(s.w).toBeGreaterThan(0.99);
    // Past the hold: no B, the weight eases out, smoothly.
    let w = s.w;
    for (let t = 0; t < HOLD_LOST + 3; t += 1 / 60) {
      const f = framePair(s, a, [0, 0, -1], null, 100, 1 / 60);
      expect(w - s.w).toBeLessThan(0.06);
      w = s.w;
      if (t > HOLD_LOST + 0.1) expect(f.b).toBeNull();
    }
    expect(s.w).toBeLessThan(0.01);
    // Back behind the nose, looking at A.
    const end = framePair(s, a, [0, 0, -1], null, 100, 1 / 60);
    expect(end.eye[2]).toBeGreaterThan(90);
    expect(off(end.eye, end.look, a)).toBeLessThan(1);
  });

  it('a B seen again ends the hold', () => {
    const s = pairState();
    framePair(s, [0, 0, 0], [0, 0, -1], [0, 0, -100], 100, 0);
    framePair(s, [0, 0, 0], [0, 0, -1], null, 100, HOLD_LOST - 0.1);
    framePair(s, [0, 0, 0], [0, 0, -1], [10, 0, -100], 100, 0.1);
    expect(s.lostFor).toBe(0);
    expect(framePair(s, [0, 0, 0], [0, 0, -1], null, 100, 0.2).b).toEqual([10, 0, -100]);
  });

  it('the padlock eases onto B and back to the nose', () => {
    const s = pairState();
    const eye: Vec3 = [0, 0, 0];
    expect(framePadlock(s, eye, [0, 0, -1], [100, 0, 0], 0)).toEqual([1, 0, 0]);
    // Lost past the hold: one frame turns only part of the way back.
    expect(framePadlock(s, eye, [0, 0, -1], null, HOLD_LOST - 0.01)).toEqual([1, 0, 0]);
    const one = framePadlock(s, eye, [0, 0, -1], null, 1 / 60);
    expect(one[0]).toBeGreaterThan(0.5);
    expect(one[2]).toBeLessThan(0);
  });

  it('turnToward goes the share of the angle asked', () => {
    const v = turnToward([1, 0, 0], [0, 0, -1], 0.5);
    expect(v[0]).toBeCloseTo(Math.SQRT1_2, 6);
    expect(v[2]).toBeCloseTo(-Math.SQRT1_2, 6);
    expect(turnToward([1, 0, 0], [0, 0, -1], 1)).toEqual([0, 0, -1]);
  });
});
