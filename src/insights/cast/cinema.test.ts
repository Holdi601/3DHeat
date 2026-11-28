import { describe, expect, it } from 'vitest';
import { CameraSpring, azimuthTo, craneLift, framingPose, MIN_UNIT_PX, pixelsAcross, poseMoved, shotFor, smoothFor, subjectsCentre, type Pose, type Shot, type Vec3 } from './cinema';

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

  // Where a point shows in a shot: its angle off the view's middle, degrees, across and up.
  const offAxis = (shot: Shot, p: Vec3) => {
    const f = { x: shot.look.x - shot.position.x, y: shot.look.y - shot.position.y, z: shot.look.z - shot.position.z };
    const n = Math.hypot(f.x, f.y, f.z);
    const d = { x: p.x - shot.position.x, y: p.y - shot.position.y, z: p.z - shot.position.z };
    const dn = Math.hypot(d.x, d.y, d.z);
    return (Math.acos((f.x * d.x + f.y * d.y + f.z * d.z) / (n * dn)) * 180) / Math.PI;
  };
  const view = { fov: 65, aspect: 16 / 9, heightPx: 900 };

  it('frames one unit close enough to make it out, and two near each other from the side, both in the picture', () => {
    const one = shotFor([{ x: 0, y: 0, z: 0, size: 8 }], 0, view);
    expect(one.kind).toBe('single');
    const d1 = Math.hypot(one.position.x, one.position.y, one.position.z);
    expect(pixelsAcross(8, d1, one.fov, 900)).toBeGreaterThan(100);
    const a = { x: 0, y: 0, z: 0, size: 8 };
    const b = { x: 120, y: 0, z: 0, size: 8 };
    const two = shotFor([a, b], 0, view);
    expect(two.kind).toBe('pair');
    // Seen across the line between them: they are apart on screen, both well inside the picture.
    const half = (two.fov / 2) * 0.9;
    expect(offAxis(two, a)).toBeLessThan(half * view.aspect);
    expect(offAxis(two, b)).toBeLessThan(half * view.aspect);
    expect(Math.abs(two.position.x - 60)).toBeLessThan(1);
    // Each unit big enough to make out.
    const d2 = Math.hypot(two.position.x - 60, two.position.y, two.position.z);
    expect(pixelsAcross(8, d2, two.fov, 900)).toBeGreaterThanOrEqual(MIN_UNIT_PX);
  });

  it('stands behind the shooter for a shot from far away, the target in the picture too', () => {
    const shooter = { x: 0, y: 0, z: 0, size: 8 };
    const target = { x: 0, y: 0, z: -2500, size: 8 };
    const s = shotFor([shooter, target], 1, view);
    expect(s.kind).toBe('shoulder');
    // Behind (the target's way is -z) and above the shooter, close to it.
    expect(s.position.z).toBeGreaterThan(0);
    expect(s.position.y).toBeGreaterThan(0);
    expect(Math.hypot(s.position.x, s.position.y, s.position.z)).toBeLessThan(80);
    expect(offAxis(s, shooter)).toBeLessThan(s.fov / 2);
    expect(offAxis(s, target)).toBeLessThan(s.fov / 2);
    // An aircraft high above the shooter: still both in the picture.
    const high = shotFor([shooter, { x: 0, y: 900, z: -1500, size: 16 }], 1, view);
    expect(offAxis(high, shooter)).toBeLessThan(high.fov / 2);
    expect(offAxis(high, { x: 0, y: 900, z: -1500 })).toBeLessThan(high.fov / 2);
  });

  it('keeps its kind of shot near the size limit rather than swing between the two', () => {
    // Find the gap where a side view just stops being one.
    let gap = 100;
    while (shotFor([{ x: 0, y: 0, z: 0, size: 8 }, { x: gap, y: 0, z: 0, size: 8 }], 0, view).kind === 'pair') gap += 5;
    const a = { x: 0, y: 0, z: 0, size: 8 };
    expect(shotFor([a, { x: gap - 10, y: 0, z: 0, size: 8 }], 0, view, 1, 'shoulder').kind).toBe('shoulder');
    expect(shotFor([a, { x: gap + 10, y: 0, z: 0, size: 8 }], 0, view, 1, 'pair').kind).toBe('pair');
  });

  it('rises over the ground on a long move and not on a short one', () => {
    expect(craneLift(50, 60)).toBe(0);
    expect(craneLift(3000, 60)).toBeGreaterThan(200);
    expect(craneLift(30000, 60)).toBeLessThanOrEqual(600);
  });
});
