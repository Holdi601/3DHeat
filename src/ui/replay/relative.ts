/**
 * The values between two units, from the first (the followed one) to the
 * second: range, bearing, bearing off the nose, aspect, closure, line-of-sight
 * rate and the height between them. Pure, in metres and degrees, so the unit
 * card, the two-unit strip and the tests share one reading.
 */

/** The fields that are from one unit to another. */
export const RELATIVE_FIELDS = ['range', 'bearing', 'relBearing', 'aspect', 'closure', 'losRate', 'altDiff'] as const;

/** Velocity east, north, up (m/s), from ground speed, course (degrees) and vertical speed. */
export function velocityOf(gs: number, course: number, vs: number): [number, number, number] {
  const c = (course * Math.PI) / 180;
  return [gs * Math.sin(c), gs * Math.cos(c), vs];
}

export interface RelativeInput {
  /** Where the second unit is from the first: metres east, north and up. */
  east: number;
  north: number;
  up: number;
  /** The first unit's heading and the second's course, degrees; NaN where unknown. */
  heading: number;
  course: number;
  /** Both velocities east, north, up (m/s); null where unknown. */
  va: [number, number, number] | null;
  vb: [number, number, number] | null;
}

/** One relative value (`RELATIVE_FIELDS`), NaN where it cannot be told. */
export function relativeValue(id: string, c: RelativeInput): number {
  const { east, north, up } = c;
  const r = Math.hypot(east, north, up);
  switch (id) {
    case 'range':
      return r;
    case 'altDiff':
      // The second unit above the first, positive.
      return up;
    case 'bearing':
      return ((Math.atan2(east, north) * 180) / Math.PI + 360) % 360;
    case 'relBearing': {
      // Off the first unit's nose, right positive.
      if (!Number.isFinite(c.heading)) return NaN;
      const brg = (Math.atan2(east, north) * 180) / Math.PI;
      return ((((brg - c.heading) % 360) + 540) % 360) - 180;
    }
    case 'aspect': {
      // Where the first unit sits seen from the second's tail: 0 astern, 180 head on.
      if (!Number.isFinite(c.course)) return NaN;
      const toRef = ((Math.atan2(-east, -north) * 180) / Math.PI + 360) % 360;
      const off = Math.abs(((toRef - c.course + 540) % 360) - 180);
      return 180 - off;
    }
    case 'closure': {
      // The rate the range shrinks: the relative velocity along the line of sight.
      if (!c.va || !c.vb || r < 1) return NaN;
      const dv = [c.vb[0] - c.va[0], c.vb[1] - c.va[1], c.vb[2] - c.va[2]];
      return -(dv[0] * east + dv[1] * north + dv[2] * up) / r;
    }
    case 'losRate': {
      // How fast the line of sight turns: the relative velocity across it over the range, degrees a second.
      if (!c.va || !c.vb || r < 1) return NaN;
      const dv = [c.vb[0] - c.va[0], c.vb[1] - c.va[1], c.vb[2] - c.va[2]];
      const cx = north * dv[2] - up * dv[1];
      const cy = up * dv[0] - east * dv[2];
      const cz = east * dv[1] - north * dv[0];
      return (Math.hypot(cx, cy, cz) / (r * r)) * (180 / Math.PI);
    }
  }
  return NaN;
}
