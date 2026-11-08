/**
 * The follow camera's Tacview views besides chase and orbit: cockpit (out of
 * the unit, along its attitude, the horizon rolling with it), padlock (from
 * the cockpit, kept on a second unit), fixed (a place around the unit that
 * turns and rolls with it: a wingtip, head-on), target (behind the unit,
 * looking past it at the second one) and satellite (straight down on it,
 * north up).
 *
 * The camera's own yaw and pitch are what the user turns: what changed since
 * the last frame is read off them and becomes the look around in the cockpit,
 * the place around the unit for the fixed view, the turn of the map for the
 * satellite. Keyboard flying forward and back comes back as a zoom.
 *
 * Everything here is in the display's frame (the engine's mirror applied):
 * x east, y up, -z north.
 */

import { framePadlock, framePair, pairState } from './pairFrame';

export type Vec3 = [number, number, number];

export type RigMode = 'cockpit' | 'fixed' | 'padlock' | 'target' | 'satellite';

export interface RigCamera {
  position: { x: number; y: number; z: number; set(x: number, y: number, z: number): unknown };
  yaw: number;
  pitch: number;
  roll: number;
  moved: boolean;
}

export interface RigInput {
  mode: RigMode;
  person: number;
  /** The unit: where it is, its nose and its up (unit vectors). */
  pos: Vec3;
  fwd: Vec3;
  up: Vec3;
  /** The second unit, for padlock and target. */
  target: Vec3 | null;
  /** How far the camera sits from the unit, data units. */
  distance: number;
  /** Data units in a metre. */
  units: number;
  /** From the unit's middle to the pilot's eye: along the nose and up, data units. */
  eyeAhead: number;
  eyeUp: number;
  /** Bumped to put the look and the place back. */
  reset: number;
  /** Seconds since the last frame, for the two-unit views' swing; the wall clock's when not given. */
  dt?: number;
}

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const add = (a: Vec3, b: Vec3, k = 1): Vec3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
function norm(a: Vec3): Vec3 {
  const l = Math.hypot(a[0], a[1], a[2]);
  return l > 1e-12 ? [a[0] / l, a[1] / l, a[2] / l] : [0, 0, -1];
}
const wrap = (a: number) => {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
};

/** `v` turned by `angle` about the unit axis `axis` (right-handed). */
export function turnAbout(v: Vec3, axis: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const k = dot(axis, v) * (1 - c);
  const x = cross(axis, v);
  return [
    v[0] * c + x[0] * s + axis[0] * k,
    v[1] * c + x[1] * s + axis[1] * k,
    v[2] * c + x[2] * s + axis[2] * k,
  ];
}

/**
 * The fly camera's yaw, pitch and roll (Euler YXZ: yaw about y, then pitch,
 * then roll about the view axis; 0 looks along -z) that look along `fwd` with
 * `up` as near the top of the view as it can be.
 */
export function eulerOf(fwd: Vec3, up: Vec3): { yaw: number; pitch: number; roll: number } {
  const f = norm(fwd);
  const pitch = Math.asin(Math.max(-1, Math.min(1, f[1])));
  const cp = Math.cos(pitch);
  // Straight up or down has no heading: keep the one the up vector says.
  const yaw =
    cp > 1e-6
      ? Math.atan2(-f[0], -f[2])
      : Math.atan2(f[1] > 0 ? up[0] : -up[0], f[1] > 0 ? up[2] : -up[2]);
  const sy = Math.sin(yaw);
  const cy = Math.cos(yaw);
  const sp = Math.sin(pitch);
  const r0: Vec3 = [cy, 0, -sy];
  const u0: Vec3 = [sp * sy, cp, sp * cy];
  const roll = Math.atan2(-dot(up, r0), dot(up, u0));
  return { yaw, pitch, roll };
}

/** The forward and up of a camera's yaw, pitch and roll: the inverse of `eulerOf`. */
export function axesOf(yaw: number, pitch: number, roll: number): { fwd: Vec3; up: Vec3 } {
  const sy = Math.sin(yaw);
  const cy = Math.cos(yaw);
  const sp = Math.sin(pitch);
  const cp = Math.cos(pitch);
  const fwd: Vec3 = [-sy * cp, sp, -cy * cp];
  const r0: Vec3 = [cy, 0, -sy];
  const u0: Vec3 = [sp * sy, cp, sp * cy];
  const up = add(scale(u0, Math.cos(roll)), r0, -Math.sin(roll));
  return { fwd, up };
}

/** `up` made square to `fwd` (Gram-Schmidt), or world up where it is along it. */
function squareTo(up: Vec3, fwd: Vec3): Vec3 {
  const u = add(up, fwd, -dot(up, fwd));
  if (Math.hypot(u[0], u[1], u[2]) > 1e-6) return norm(u);
  return norm(add([0, 1, 0], fwd, -fwd[1]));
}

/** Where the fixed view sits by default: behind, a little to the left and above. */
export const FIXED_START = { az: (-150 * Math.PI) / 180, el: (12 * Math.PI) / 180 };

export class FollowRig {
  /** The cockpit's look around: yaw and pitch off the nose. */
  lookYaw = 0;
  lookPitch = 0;
  /** The fixed view's place: azimuth from the nose (0 ahead, ±π behind, + right) and elevation. */
  az = FIXED_START.az;
  el = FIXED_START.el;
  /** The satellite's turn: 0 is north up. */
  turn = 0;
  private last: {
    yaw: number;
    pitch: number;
    px: number;
    py: number;
    pz: number;
    mode: RigMode;
    person: number;
  } | null = null;
  private resetSeen = 0;
  /** The two-unit views' eased framing, and when the last frame was (ms). */
  private pair = pairState();
  private lastAt = 0;

  /** Forget the last frame, as when the camera is let go. */
  release(): void {
    this.last = null;
  }

  /**
   * Places the camera for this frame. Returns the factor the follow distance
   * is to change by (keyboard flying in and out), 1 for none.
   */
  update(c: RigCamera, inp: RigInput): number {
    if (inp.reset !== this.resetSeen) {
      this.resetSeen = inp.reset;
      this.lookYaw = 0;
      this.lookPitch = 0;
      this.az = FIXED_START.az;
      this.el = FIXED_START.el;
      this.turn = 0;
    }
    let zoom = 1;
    const l = this.last;
    // Another unit or view starts its framing afresh; the same one eases on.
    const at = performance.now();
    const same = !!l && l.mode === inp.mode && l.person === inp.person;
    const dt = same ? Math.max(0, inp.dt ?? (at - this.lastAt) / 1000) : 0;
    if (!same) this.pair = pairState();
    this.lastAt = at;
    if (l && l.mode === inp.mode) {
      // What the user turned since the last frame.
      const dyaw = wrap(c.yaw - l.yaw);
      const dpitch = c.pitch - l.pitch;
      if (inp.mode === 'cockpit') {
        this.lookYaw = wrap(this.lookYaw + dyaw);
        this.lookPitch = Math.max(-1.4, Math.min(1.4, this.lookPitch + dpitch));
      } else if (inp.mode === 'fixed') {
        this.az = wrap(this.az + dyaw);
        this.el = Math.max(-1.5, Math.min(1.5, this.el - dpitch));
      } else if (inp.mode === 'satellite') this.turn = wrap(this.turn + dyaw);
      // Flown with the keyboard: forward closer, back further.
      const mv: Vec3 = [c.position.x - l.px, c.position.y - l.py, c.position.z - l.pz];
      const m = Math.hypot(mv[0], mv[1], mv[2]);
      if (m > 1e-9) {
        const { fwd } = axesOf(l.yaw, l.pitch, 0);
        const along = dot(mv, fwd);
        if (Math.abs(along) > m * 0.3) zoom = along > 0 ? 0.975 : 1 / 0.975;
      }
    }

    const fwd = norm(inp.fwd);
    const up = squareTo(inp.up, fwd);
    const right = cross(fwd, up);
    const eye0 = add(add(inp.pos, fwd, inp.eyeAhead), up, inp.eyeUp);
    let eye: Vec3;
    let look: Vec3;
    let top: Vec3;
    switch (inp.mode) {
      case 'cockpit': {
        // The head turned about the unit's up, then raised about its turned right.
        const f1 = turnAbout(fwd, up, this.lookYaw);
        const r1 = turnAbout(right, up, this.lookYaw);
        look = norm(turnAbout(f1, r1, this.lookPitch));
        top = squareTo(up, look);
        eye = eye0;
        break;
      }
      case 'padlock': {
        eye = eye0;
        look = framePadlock(this.pair, eye, fwd, inp.target, dt);
        // The head stays upright in the cockpit: the unit's up, squared to the look.
        top = squareTo(up, look);
        break;
      }
      case 'fixed': {
        const ce = Math.cos(this.el);
        const off = norm(
          add(
            add(scale(fwd, ce * Math.cos(this.az)), right, ce * Math.sin(this.az)),
            up,
            Math.sin(this.el),
          ),
        );
        eye = add(inp.pos, off, inp.distance);
        look = scale(off, -1);
        top = squareTo(up, look);
        break;
      }
      case 'target': {
        // Behind the unit on the line from the target, a little above, both in the picture (pairFrame.ts).
        const p = framePair(this.pair, inp.pos, fwd, inp.target, inp.distance, dt);
        eye = p.eye;
        look = p.look;
        top = squareTo([0, 1, 0], look);
        break;
      }
      case 'satellite':
      default: {
        eye = add(inp.pos, [0, 1, 0], inp.distance);
        look = [0, -1, 0];
        // North (-z) at the top, turned as the user turned it.
        top = [-Math.sin(this.turn), 0, -Math.cos(this.turn)];
        break;
      }
    }
    const e = eulerOf(look, top);
    c.position.set(eye[0], eye[1], eye[2]);
    c.yaw = e.yaw;
    c.pitch = e.pitch;
    c.roll = e.roll;
    c.moved = true;
    this.last = {
      yaw: e.yaw,
      pitch: e.pitch,
      px: eye[0],
      py: eye[1],
      pz: eye[2],
      mode: inp.mode,
      person: inp.person,
    };
    return zoom;
  }
}
