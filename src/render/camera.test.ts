import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { FlyCamera, ISOMETRIC_PITCH, VIEW_PRESETS } from './camera';

/**
 * Advance the camera enough to build its matrices, without any input.
 *
 * `update` is the only thing that writes the three.js camera, so the rendered
 * orientation is not available until it has run.
 */
const SETTLE_FOV = 60;
const SETTLE_ASPECT = 16 / 9;

function settle(cam: FlyCamera): void {
  cam.update(0, SETTLE_ASPECT, SETTLE_FOV, 0.5, 40_000);
}

/** The direction the rendered camera actually looks: -Z of its world matrix. */
function renderedForward(cam: FlyCamera): Vector3 {
  settle(cam);
  const e = cam.camera.matrixWorld.elements;
  return new Vector3(-e[8], -e[9], -e[10]).normalize();
}

/** The rendered camera's right: +X of its world matrix. */
function renderedRight(cam: FlyCamera): Vector3 {
  settle(cam);
  const e = cam.camera.matrixWorld.elements;
  return new Vector3(e[0], e[1], e[2]).normalize();
}

const ANGLES: Array<[number, number]> = [
  [0, 0],
  [90, 0],
  [-90, 0],
  [180, 0],
  [45, 30],
  [-45, -35.264],
  [135, -60],
  [-170, 12],
  [37, -80],
];

describe('FlyCamera orientation', () => {
  it('agrees with the rendered view direction at every angle', () => {
    // This is the check that matters: movement is computed from `forward()` while
    // the picture comes from the Euler, and a mismatch is invisible at yaw 0 and
    // exactly backwards at yaw ±90 — so WASD flies the wrong way only once you
    // have turned, which is a miserable thing to debug from a bug report.
    for (const [yaw, pitch] of ANGLES) {
      const cam = new FlyCamera();
      cam.setOrientationDegrees(yaw, pitch);
      const rendered = renderedForward(cam);
      const computed = cam.forward(new Vector3());
      expect(computed.length(), `|forward| at ${yaw}/${pitch}`).toBeCloseTo(1, 6);
      expect(computed.x, `x at ${yaw}/${pitch}`).toBeCloseTo(rendered.x, 5);
      expect(computed.y, `y at ${yaw}/${pitch}`).toBeCloseTo(rendered.y, 5);
      expect(computed.z, `z at ${yaw}/${pitch}`).toBeCloseTo(rendered.z, 5);
    }
  });

  it('agrees with the rendered right vector at every angle', () => {
    for (const [yaw, pitch] of ANGLES) {
      const cam = new FlyCamera();
      cam.setOrientationDegrees(yaw, pitch);
      const rendered = renderedRight(cam);
      const computed = cam.right(new Vector3());
      expect(computed.length(), `|right| at ${yaw}/${pitch}`).toBeCloseTo(1, 6);
      // The rendered right tilts with roll; there is none here, so it stays level
      // and must match the level right vector used for strafing.
      expect(computed.x, `x at ${yaw}/${pitch}`).toBeCloseTo(rendered.x, 5);
      expect(computed.z, `z at ${yaw}/${pitch}`).toBeCloseTo(rendered.z, 5);
    }
  });

  it('keeps forward, right and up mutually perpendicular', () => {
    for (const [yaw, pitch] of ANGLES) {
      const cam = new FlyCamera();
      cam.setOrientationDegrees(yaw, pitch);
      const f = cam.forward(new Vector3());
      const r = cam.right(new Vector3());
      expect(f.dot(r), `f·r at ${yaw}/${pitch}`).toBeCloseTo(0, 5);
      expect(r.y, `right must stay level at ${yaw}/${pitch}`).toBeCloseTo(0, 6);
    }
  });

  it('points down -Z at rest, so an unrotated camera looks into the scene', () => {
    const cam = new FlyCamera();
    cam.setOrientationDegrees(0, 0);
    const f = cam.forward(new Vector3());
    expect(f.x).toBeCloseTo(0, 6);
    expect(f.y).toBeCloseTo(0, 6);
    expect(f.z).toBeCloseTo(-1, 6);
    expect(cam.right(new Vector3()).x).toBeCloseTo(1, 6);
  });

  it('turns right when yaw decreases, matching the drag direction', () => {
    // Dragging right does `yaw -= dx`, so decreasing yaw must swing the view
    // toward the camera's own right — otherwise the mouse is inverted.
    const cam = new FlyCamera();
    cam.setOrientationDegrees(0, 0);
    const right = cam.right(new Vector3());
    cam.setOrientationDegrees(-20, 0);
    const turned = cam.forward(new Vector3());
    expect(turned.dot(right)).toBeGreaterThan(0);
  });
});

describe('FlyCamera movement', () => {
  const BOUNDS = { minX: -100, maxX: 100, minY: 0, maxY: 20, minZ: -100, maxZ: 100 };

  /**
   * Move and return the offset.
   *
   * Goes through `move`, the same seam the keyboard and the pad use, so this
   * covers the mapping they share. The key-to-axis half is covered by the smoke
   * suite with real events, which needs a browser this does not have.
   */
  function step(yaw: number, pitch: number, f: number, s: number, r: number): Vector3 {
    const cam = new FlyCamera();
    cam.setOrientationDegrees(yaw, pitch);
    cam.position.set(0, 0, 0);
    settle(cam);
    cam.move(f, s, r, 100);
    return cam.position.clone();
  }

  it('flies along the view direction after turning', () => {
    for (const [yaw, pitch] of ANGLES) {
      const cam = new FlyCamera();
      cam.setOrientationDegrees(yaw, pitch);
      const expected = cam.forward(new Vector3());
      const moved = step(yaw, pitch, 1, 0, 0);
      expect(moved.length(), `distance at ${yaw}/${pitch}`).toBeCloseTo(100, 3);
      // Colinear with the view direction, not merely forward-ish.
      expect(moved.clone().normalize().dot(expected), `direction at ${yaw}/${pitch}`).toBeCloseTo(
        1,
        4,
      );
    }
  });

  it('flies along the rendered view direction, not just a self-consistent one', () => {
    for (const [yaw, pitch] of ANGLES) {
      const cam = new FlyCamera();
      cam.setOrientationDegrees(yaw, pitch);
      const rendered = renderedForward(cam);
      const moved = step(yaw, pitch, 1, 0, 0).normalize();
      expect(moved.dot(rendered), `at ${yaw}/${pitch}`).toBeCloseTo(1, 4);
    }
  });

  it('strafes along the right vector after turning', () => {
    for (const [yaw, pitch] of ANGLES) {
      const cam = new FlyCamera();
      cam.setOrientationDegrees(yaw, pitch);
      const expected = cam.right(new Vector3());
      const moved = step(yaw, pitch, 0, 1, 0).normalize();
      expect(moved.dot(expected), `direction at ${yaw}/${pitch}`).toBeCloseTo(1, 4);
    }
  });

  it('rises along world up regardless of where it is looking', () => {
    const moved = step(123, -70, 0, 0, 1);
    expect(moved.x).toBeCloseTo(0, 6);
    expect(moved.z).toBeCloseTo(0, 6);
    expect(moved.y).toBeCloseTo(100, 6);
  });

  it('reverses cleanly, so back-and-forth returns to the start', () => {
    for (const [yaw, pitch] of ANGLES) {
      const cam = new FlyCamera();
      cam.setOrientationDegrees(yaw, pitch);
      cam.position.set(0, 0, 0);
      settle(cam);
      cam.move(1, 0.5, -0.25, 100);
      cam.move(-1, -0.5, 0.25, 100);
      expect(cam.position.length(), `at ${yaw}/${pitch}`).toBeCloseTo(0, 4);
    }
  });

  it('does nothing and reports nothing for a zero move', () => {
    const cam = new FlyCamera();
    settle(cam);
    cam.moved = false;
    cam.move(0, 0, 0, 100);
    expect(cam.moved).toBe(false);
  });

  it('gives every isometric corner the isometric pitch and a parallel projection', () => {
    const iso = Object.entries(VIEW_PRESETS).filter(([, p]) => p.group === 'iso');
    // Four corners, because one always hides half the map behind whatever is
    // nearer the camera.
    expect(iso).toHaveLength(4);
    const yaws = new Set<number>();
    for (const [name, p] of iso) {
      expect(p.pitch, name).toBeCloseTo(ISOMETRIC_PITCH, 6);
      // Parallel, or it is not isometric — under perspective a "top view" still
      // converges and equal areas stop reading as equal.
      expect(p.projection, name).toBe('orthographic');
      yaws.add(p.yaw);
    }
    expect(yaws.size).toBe(4);
    // 90° apart, so the four together cover every side.
    const sorted = [...yaws].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i] - sorted[i - 1]).toBeCloseTo(90, 6);
    }
  });

  it('is a genuinely isometric angle, not merely a diagonal one', () => {
    // At atan(1/sqrt(2)) the three world axes project to equal *screen* lengths,
    // 120° apart. Any other pitch is axonometric: it looks similar but distances
    // stop being comparable between axes, which is the whole reason to use the
    // view. Clip space is not screen space — x is divided by the aspect ratio —
    // so that has to be undone before the lengths mean anything.
    const aspect = SETTLE_ASPECT;
    const cam = new FlyCamera();
    cam.setPreset('Iso NE');
    settle(cam);
    const vp = cam.camera.projectionMatrix.clone().multiply(cam.camera.matrixWorldInverse);
    const origin = new Vector3(0, 0, 0).applyMatrix4(vp);
    const screen = [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)].map((axis) => {
      const p = axis.applyMatrix4(vp).sub(origin);
      return { x: p.x * aspect, y: p.y };
    });

    // Equal projected lengths is the definition of isometric, and it is what makes
    // a measurement along one axis comparable to one along another.
    const lengths = screen.map((p) => Math.hypot(p.x, p.y));
    for (const l of lengths) expect(l).toBeCloseTo(lengths[0], 5);

    // The signature of the angle: world up projects straight up the screen, and
    // the two horizontal axes leave it at ±30° from the horizon — the 30° that
    // isometric drawing is named for. (They are 60° apart at this corner, not
    // 120°; the 120° figure describes a different choice of axis signs.)
    const [ax, ay, az] = screen.map((p) => (Math.atan2(p.y, p.x) * 180) / Math.PI);
    expect(ay).toBeCloseTo(90, 4);
    expect(Math.abs(ax)).toBeCloseTo(30, 3);
    expect(Math.abs(az)).toBeCloseTo(30, 3);
    // Mirror images about the vertical, so neither horizontal axis is favoured.
    expect(ax).toBeCloseTo(-az, 4);
  });

  it('adopts the projection a preset needs', () => {
    const cam = new FlyCamera();
    expect(cam.projection).toBe('perspective');
    expect(cam.setPreset('Iso NE')).toBe('orthographic');
    expect(cam.projection).toBe('orthographic');
    expect(cam.setPreset('Perspective')).toBe('perspective');
    expect(cam.projection).toBe('perspective');
  });

  it('keeps the subject the same size across a projection switch', () => {
    // Without this the switch is a jump cut: a parallel projection's frustum
    // height has nothing to do with how far away the camera is.
    const cam = new FlyCamera();
    cam.setOrientationDegrees(-35, -28);
    cam.position.set(0, 0, 0);
    cam.focusDistance = 500;
    settle(cam);
    const fovRad = (SETTLE_FOV * Math.PI) / 180;
    cam.setProjection('orthographic');
    // The parallel height must match what perspective covered at the focus plane.
    expect(cam.orthoHeight).toBeCloseTo(2 * 500 * Math.tan(fovRad / 2), 3);
  });

  it('returns to the pose it left perspective in', () => {
    const cam = new FlyCamera();
    cam.setOrientationDegrees(-35, -28);
    cam.position.set(120, 40, -60);
    cam.speed = 77;
    settle(cam);
    const pose = cam.position.clone();

    cam.setProjection('orthographic');
    // Wander around in the parallel view.
    cam.setOrientationDegrees(90, -89);
    cam.position.set(9999, 9999, 9999);
    cam.zoomOrtho(4);

    cam.setProjection('perspective');
    expect(cam.position.distanceTo(pose)).toBeCloseTo(0, 4);
    expect(cam.yawDegrees).toBeCloseTo(-35, 4);
    expect(cam.pitchDegrees).toBeCloseTo(-28, 4);
    expect(cam.speed).toBeCloseTo(77, 6);
  });

  it('still centres the subject when returning with nothing remembered', () => {
    // Reached by starting in a parallel projection, so there is no saved pose.
    const cam = new FlyCamera();
    cam.projection = 'orthographic';
    cam.setOrientationDegrees(0, 0);
    cam.position.set(0, 0, 0);
    cam.focusDistance = 300;
    cam.orthoHeight = 400;
    settle(cam);
    // The point it was looking at, before the switch.
    const target = cam.position.clone().addScaledVector(cam.forward(new Vector3()), 300);

    cam.setProjection('perspective');
    settle(cam);
    // Still looking at the same point, from further back.
    const toTarget = target.clone().sub(cam.position);
    expect(toTarget.clone().normalize().dot(cam.forward(new Vector3()))).toBeCloseTo(1, 4);
    const fovRad = (SETTLE_FOV * Math.PI) / 180;
    expect(toTarget.length()).toBeCloseTo(400 / (2 * Math.tan(fovRad / 2)), 2);
  });

  it('does nothing when asked to switch to the projection it is already in', () => {
    const cam = new FlyCamera();
    cam.position.set(5, 6, 7);
    cam.orthoHeight = 123;
    settle(cam);
    cam.setProjection('perspective');
    expect(cam.position.toArray()).toEqual([5, 6, 7]);
    expect(cam.orthoHeight).toBe(123);
  });

  it('records the focus distance when framing', () => {
    const cam = new FlyCamera();
    cam.setOrientationDegrees(-35, -28);
    cam.frame(BOUNDS, 65, true);
    // Framing is the one moment the camera knows what it is looking at.
    expect(cam.focusDistance).toBeGreaterThan(0);
    const centre = new Vector3(0, 10, 0);
    expect(cam.position.distanceTo(centre)).toBeCloseTo(cam.focusDistance, 3);
  });

  it('places the camera so the data is in front of it, at any preset', () => {
    // Framing uses `forward()` to step backwards from the centre, so a sign error
    // there puts the camera on the far side and the frame comes back empty.
    for (const name of Object.keys(VIEW_PRESETS)) {
      const cam = new FlyCamera();
      cam.setPreset(name);
      cam.frame(BOUNDS, 60, true);
      settle(cam);
      const toCentre = new Vector3(0, 10, 0).sub(cam.position).normalize();
      const look = cam.forward(new Vector3());
      expect(look.dot(toCentre), `${name} must look toward the data`).toBeGreaterThan(0.9);
    }
  });
});

