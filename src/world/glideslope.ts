/**
 * The glideslope of a runway end, as an ILS draws it: the path down at 3°
 * (or the given angle) to the threshold along the runway's direction, from a
 * crossing height over the threshold, out to so many nautical miles, with
 * the edges of full-scale deflection (±0.7°) beside it. From the surveyed
 * thresholds of OurAirports (`runways.ts`); a runway without an ILS still
 * gets one, as the visual approach slope a pilot flies.
 */

import type { Runway } from './runways';

const R = 6371008.8;
const RAD = Math.PI / 180;
export const NM = 1852;

/** Initial bearing from a to b, degrees true. */
export function bearingTo(a: [number, number], b: [number, number]): number {
  const p1 = a[0] * RAD;
  const p2 = b[0] * RAD;
  const dl = (b[1] - a[1]) * RAD;
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return ((Math.atan2(y, x) / RAD) + 360) % 360;
}

/** The place `dist` metres from `from` along `bearing` (degrees true), on a sphere. */
export function destination(from: [number, number], bearing: number, dist: number): [number, number] {
  const d = dist / R;
  const b = bearing * RAD;
  const p1 = from[0] * RAD;
  const l1 = from[1] * RAD;
  const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(b));
  const l2 = l1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2));
  return [p2 / RAD, ((((l2 / RAD) + 540) % 360) - 180)];
}

export interface GlidePoint {
  lat: number;
  lon: number;
  /** Metres above sea level. */
  h: number;
  /** Nautical miles from the threshold. */
  nm: number;
}

export interface Glideslope {
  /** The runway end landed on ("09L"). */
  ident: string;
  airport: string;
  /** The landing direction, degrees true. */
  course: number;
  threshold: [number, number];
  elevation: number;
  /** The path, every `step` nautical miles from the threshold out. */
  path: GlidePoint[];
  /** The upper and lower edges of full-scale deflection. */
  upper: GlidePoint[];
  lower: GlidePoint[];
}

/**
 * The glideslopes onto both ends of a runway. `ground` gives the elevation
 * of an end the list has none for (the level or 0).
 */
export function glideslopes(
  r: Runway,
  opts: { angle?: number; crossing?: number; lengthNm?: number; stepNm?: number; ground?: (lat: number, lon: number) => number } = {},
): Glideslope[] {
  const angle = opts.angle ?? 3;
  const tch = opts.crossing ?? 15;
  const length = opts.lengthNm ?? 10;
  const step = opts.stepNm ?? 0.5;
  const out: Glideslope[] = [];
  const ends: [[number, number], [number, number], string, number | undefined][] = [
    [r.le, r.he, r.leIdent, r.leElevation],
    [r.he, r.le, r.heIdent, r.heElevation],
  ];
  for (const [at, toward, ident, elev] of ends) {
    // Landing on `at` means flying from beyond it toward the other end.
    const course = bearingTo(at, toward);
    const back = (course + 180) % 360;
    const e = Number.isFinite(elev) ? (elev as number) : (opts.ground?.(at[0], at[1]) ?? 0);
    const line = (a: number): GlidePoint[] => {
      const pts: GlidePoint[] = [];
      for (let nm = 0; nm <= length + 1e-9; nm += step) {
        const [lat, lon] = destination(at, back, nm * NM);
        pts.push({ lat, lon, h: e + tch + Math.tan(a * RAD) * nm * NM, nm });
      }
      return pts;
    };
    out.push({ ident, airport: r.airport, course, threshold: at, elevation: e, path: line(angle), upper: line(angle + 0.7), lower: line(Math.max(0.1, angle - 0.7)) });
  }
  return out;
}

/**
 * How far a place is above (+) or below (-) a glideslope, in degrees of the
 * angle seen from the threshold, and its distance out along the course (m);
 * null when it is behind the threshold or off to the side by more than the
 * localizer's ±35°.
 */
export function glideslopeDeviation(g: Glideslope, lat: number, lon: number, h: number, angle = 3): { degrees: number; along: number } | null {
  const brg = bearingTo(g.threshold, [lat, lon]);
  const off = Math.abs(((brg - (g.course + 180) + 540) % 360) - 180);
  if (off > 35) return null;
  const p1 = g.threshold[0] * RAD;
  const p2 = lat * RAD;
  const dl = (lon - g.threshold[1]) * RAD;
  const a = Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  const dist = 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
  const along = dist * Math.cos(off * RAD);
  if (along <= 0) return null;
  return { degrees: Math.atan2(h - g.elevation, along) / RAD - angle, along };
}
