import { describe, expect, it } from 'vitest';
import {
  axesOf,
  eulerOf,
  FollowRig,
  turnAbout,
  type RigCamera,
  type RigInput,
  type Vec3,
} from './followRig';
import { axesOfTrack, beamRim, bodyDirection, domeLines } from './tactical';

const close = (a: ArrayLike<number>, b: ArrayLike<number>, d = 6) => {
  for (let i = 0; i < b.length; i++) expect(a[i]).toBeCloseTo(b[i], d);
};

function camera(): RigCamera {
  const position = {
    x: 0,
    y: 0,
    z: 0,
    set(x: number, y: number, z: number) {
      this.x = x;
      this.y = y;
      this.z = z;
    },
  };
  return { position, yaw: 0, pitch: 0, roll: 0, moved: false };
}

const input = (p: Partial<RigInput>): RigInput => ({
  mode: 'cockpit',
  person: 1,
  pos: [100, 2000, -50],
  fwd: [0, 0, -1],
  up: [0, 1, 0],
  target: null,
  distance: 60,
  units: 1,
  eyeAhead: 0,
  eyeUp: 0,
  reset: 0,
  ...p,
});

describe('follow rig', () => {
  it("turns a forward and up into the fly camera's yaw, pitch and roll and back", () => {
    for (const [yaw, pitch, roll] of [
      [0, 0, 0],
      [0.7, 0.2, -0.5],
      [-2.5, -0.9, 1.2],
      [3, 0.4, 2.9],
    ]) {
      const { fwd, up } = axesOf(yaw, pitch, roll);
      const e = eulerOf(fwd, up);
      expect(e.pitch).toBeCloseTo(pitch, 9);
      expect(Math.cos(e.yaw - yaw)).toBeCloseTo(1, 9);
      expect(Math.cos(e.roll - roll)).toBeCloseTo(1, 9);
    }
  });

  it('rolls the camera the way the unit banks: right wing down tilts the view clockwise', () => {
    // Heading north, banked 30 degrees right: up leans east.
    const bank = (30 * Math.PI) / 180;
    const e = eulerOf([0, 0, -1], [Math.sin(bank), Math.cos(bank), 0]);
    expect(e.yaw).toBeCloseTo(0);
    expect(e.roll).toBeCloseTo(-bank);
  });

  it('turns a vector about an axis right-handed', () => {
    close(turnAbout([0, 0, -1], [0, 1, 0], Math.PI / 2), [-1, 0, 0]);
  });

  it('looks out of the cockpit along the nose, at the unit', () => {
    const c = camera();
    const rig = new FollowRig();
    rig.update(c, input({ fwd: [1, 0, 0], up: [0, 1, 0], eyeUp: 1 }));
    close([c.position.x, c.position.y, c.position.z], [100, 2001, -50]);
    close(axesOf(c.yaw, c.pitch, c.roll).fwd, [1, 0, 0]);
    expect(c.roll).toBeCloseTo(0);
  });

  it('keeps the cockpit look the user dragged, relative to the unit, until reset', () => {
    const c = camera();
    const rig = new FollowRig();
    rig.update(c, input({}));
    // A drag to the right: the fly camera's yaw goes down.
    c.yaw -= Math.PI / 2;
    rig.update(c, input({}));
    close(axesOf(c.yaw, c.pitch, c.roll).fwd, [1, 0, 0]);
    // The unit turns west; the look stays to its right (north).
    rig.update(c, input({ fwd: [-1, 0, 0] }));
    close(axesOf(c.yaw, c.pitch, c.roll).fwd, [0, 0, -1]);
    rig.update(c, input({ fwd: [-1, 0, 0], reset: 1 }));
    close(axesOf(c.yaw, c.pitch, c.roll).fwd, [-1, 0, 0]);
  });

  it('keeps the padlock on the target and the satellite straight down, north up', () => {
    const c = camera();
    const rig = new FollowRig();
    rig.update(c, input({ mode: 'padlock', target: [100, 2000, -1050] }));
    close(axesOf(c.yaw, c.pitch, c.roll).fwd, [0, 0, -1]);
    rig.update(c, input({ mode: 'padlock', target: [1100, 2000, -50] }));
    close(axesOf(c.yaw, c.pitch, c.roll).fwd, [1, 0, 0]);
    rig.update(c, input({ mode: 'satellite', distance: 3000 }));
    expect(c.position.y).toBeCloseTo(5000);
    const a = axesOf(c.yaw, c.pitch, c.roll);
    close(a.fwd, [0, -1, 0], 3);
    close(a.up, [0, 0, -1], 3);
  });

  it('puts the fixed camera behind by default and in front when moved head-on, rolling with the unit', () => {
    const c = camera();
    const rig = new FollowRig();
    rig.update(c, input({ mode: 'fixed' }));
    // Behind the unit heading north: south of it (z larger), looking at it.
    expect(c.position.z).toBeGreaterThan(-50);
    rig.az = 0;
    rig.el = 0;
    const bank = 0.6;
    rig.update(c, input({ mode: 'fixed', up: [Math.sin(bank), Math.cos(bank), 0] }));
    close([c.position.x, c.position.y, c.position.z], [100, 2000, -110], 4);
    const a = axesOf(c.yaw, c.pitch, c.roll);
    close(a.fwd, [0, 0, 1], 6);
    close(a.up, [Math.sin(bank), Math.cos(bank), 0], 6);
  });

  it('zooms when the keyboard flies the camera in', () => {
    const c = camera();
    const rig = new FollowRig();
    rig.update(c, input({ mode: 'fixed' }));
    const { fwd } = axesOf(c.yaw, c.pitch, 0);
    c.position.set(c.position.x + fwd[0], c.position.y + fwd[1], c.position.z + fwd[2]);
    expect(rig.update(c, input({ mode: 'fixed' }))).toBeLessThan(1);
  });
});

describe('tactical display', () => {
  const north = { fwd: [0, 0, -1] as Vec3, up: [0, 1, 0] as Vec3, right: [1, 0, 0] as Vec3 };

  it("reads a unit's axes from its heading and pitch where it has no attitude", () => {
    const a = axesOfTrack({ person: 0, row: 0, x: 0, y: 0, z: 0, yaw: Math.PI / 2, pitch: 0 });
    close(a.fwd, [1, 0, 0]);
    close(a.right, [0, 0, 1]);
    close(a.up, [0, 1, 0]);
  });

  it('turns radar angles against the unit: azimuth right, elevation up', () => {
    close(bodyDirection(north, 90, 0), [1, 0, 0]);
    close(bodyDirection(north, -90, 0), [-1, 0, 0]);
    close(bodyDirection(north, 0, 90), [0, 1, 0]);
  });

  it('draws a beam as wide and tall as its beamwidths', () => {
    const rim = beamRim(north, 0, 0, 0, 60, 20, 1000, 4);
    // The first point is the beam's right edge: 30 degrees off the axis, the third its left.
    const ang = (p: Vec3) => (Math.atan2(p[0], -p[2]) * 180) / Math.PI;
    expect(ang(rim[0])).toBeCloseTo(30, 4);
    expect(ang(rim[2])).toBeCloseTo(-30, 4);
    // Up and down: 10 degrees.
    expect((Math.asin(rim[1][1] / 1000) * 180) / Math.PI).toBeCloseTo(10, 4);
    for (const p of rim) expect(Math.hypot(...p)).toBeCloseTo(1000, 6);
  });

  it('builds an engagement dome over the ground, ovoid when its height differs', () => {
    const lines = domeLines(8000, 3500, 4, 6, 48);
    let top = 0;
    let wide = 0;
    for (const [a, b] of lines)
      for (const p of [a, b]) {
        expect(p[1]).toBeGreaterThanOrEqual(-1e-9);
        top = Math.max(top, p[1]);
        wide = Math.max(wide, Math.hypot(p[0], p[2]));
      }
    expect(top).toBeCloseTo(3500, 6);
    expect(wide).toBeCloseTo(8000, 6);
  });
});
