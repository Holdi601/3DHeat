import { describe, expect, it } from 'vitest';
import { CameraSpring, azimuthTo, framingPose, poseMoved, smoothFor, subjectsCentre, type Pose } from './cinema';

describe('the caster camera', () => {
  it('frames two subjects from a distance that holds both, looking down on them', () => {
    const { centre, spread } = subjectsCentre([
      { x: 0, y: 0, z: 0 },
      { x: 200, y: 0, z: 0 },
    ]);
    expect(centre.x).toBe(100);
    expect(spread).toBe(200);
    const p = framingPose(centre, spread, 0);
    const d = Math.hypot(p.position.x - centre.x, p.position.y - centre.y, p.position.z - centre.z);
    expect(d).toBeCloseTo(340);
    expect(p.forward.y).toBeLessThan(0);
    // Looking towards -z from behind (+z) the centre.
    expect(p.position.z).toBeGreaterThan(centre.z);
    expect(azimuthTo({ x: 0, y: 0, z: 10 }, { x: 0, y: 0, z: 0 }, 1)).toBeCloseTo(0);
  });

  it('moves across the map without a cut: smooth speed, settles, no overshoot', () => {
    const s = new CameraSpring();
    const from: Pose = { position: { x: 0, y: 100, z: 0 }, forward: { x: 0, y: -0.3, z: -1 } };
    s.reset(from, 100);
    const target = framingPose({ x: 5000, y: 0, z: -3000 }, 50, 0);
    const smooth = smoothFor(Math.hypot(5000, 3000), 85);
    const dt = 1 / 60;
    let prev = from.position;
    let prevStep = 0;
    let maxJerk = 0;
    let maxStep = 0;
    let pose = from;
    for (let i = 0; i < 60 * 12; i++) {
      pose = s.step(target, { x: 5000, y: 0, z: -3000 }, dt, smooth);
      const step = Math.hypot(pose.position.x - prev.x, pose.position.y - prev.y, pose.position.z - prev.z);
      maxStep = Math.max(maxStep, step);
      if (i > 0) maxJerk = Math.max(maxJerk, Math.abs(step - prevStep));
      prevStep = step;
      prev = pose.position;
    }
    const total = Math.hypot(target.position.x, target.position.y - 100, target.position.z);
    // Never more than a few per cent of the way in one frame, and the speed changes gently.
    expect(maxStep).toBeLessThan(total * 0.05);
    expect(maxJerk).toBeLessThan(maxStep * 0.2);
    expect(Math.hypot(pose.position.x - target.position.x, pose.position.z - target.position.z)).toBeLessThan(1);
    // No overshoot along x: never past the target.
    expect(pose.position.x).toBeLessThanOrEqual(target.position.x + 1e-6);
  });

  it('tells its own pose from one someone else set', () => {
    const a: Pose = { position: { x: 1, y: 2, z: 3 }, forward: { x: 0, y: 0, z: -1 } };
    expect(poseMoved(a, { ...a }, 1)).toBe(false);
    expect(poseMoved(a, { ...a, position: { x: 1.5, y: 2, z: 3 } }, 1)).toBe(true);
    expect(poseMoved(a, { ...a, forward: { x: 0.1, y: 0, z: -0.99 } }, 1)).toBe(true);
  });
});
