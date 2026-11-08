/**
 * The grids drawn over a recording placed on the earth: latitude and
 * longitude lines at a round spacing for the area seen, and the MGRS (UTM)
 * kilometre grid of the zone under the camera. Lines come as places along
 * them, close enough together to follow the earth's curve on screen.
 */

import { fromUtm, toUtm, utmZone } from './mgrs';

/** Spacings of latitude and longitude lines, degrees: 10° down to one minute. */
const STEPS = [10, 5, 2, 1, 0.5, 0.25, 1 / 6, 1 / 12, 1 / 30, 1 / 60];

/** The spacing that puts about `lines` lines across `spanDeg` degrees. */
export function latLonStep(spanDeg: number, lines = 8): number {
  for (const s of STEPS) if (spanDeg / s >= lines) return s;
  return STEPS[STEPS.length - 1];
}

/** Spacings of the MGRS grid, metres. */
const KM_STEPS = [100000, 10000, 1000, 100];

/** The grid spacing that puts about `lines` lines across `spanM` metres. */
export function mgrsStep(spanM: number, lines = 6): number {
  for (const s of KM_STEPS) if (spanM / s >= lines) return s;
  return KM_STEPS[KM_STEPS.length - 1];
}

export interface GridLine {
  kind: 'lat' | 'lon' | 'easting' | 'northing';
  /** Degrees, or UTM metres. */
  value: number;
  pts: [number, number][];
}

/** Lines of latitude and longitude every `step` degrees over a box, `seg` places along each. */
export function latLonLines(box: { south: number; north: number; west: number; east: number }, step: number, seg = 32): GridLine[] {
  const out: GridLine[] = [];
  const s = Math.max(-89.9, box.south);
  const n = Math.min(89.9, box.north);
  const k0 = Math.ceil(s / step - 1e-9);
  const k1 = Math.floor(n / step + 1e-9);
  for (let k = k0; k <= k1 && out.length < 200; k++) {
    const lat = k * step;
    const pts: [number, number][] = [];
    for (let i = 0; i <= seg; i++) pts.push([lat, box.west + ((box.east - box.west) * i) / seg]);
    out.push({ kind: 'lat', value: lat, pts });
  }
  const j0 = Math.ceil(box.west / step - 1e-9);
  const j1 = Math.floor(box.east / step + 1e-9);
  for (let j = j0; j <= j1 && out.length < 400; j++) {
    const lon = j * step;
    const pts: [number, number][] = [];
    for (let i = 0; i <= seg; i++) pts.push([s + ((n - s) * i) / seg, lon]);
    out.push({ kind: 'lon', value: lon, pts });
  }
  return out;
}

/**
 * The UTM grid of the zone at (lat, lon), every `step` metres within
 * `radius` metres of it: lines of constant easting and of constant northing.
 */
export function mgrsLines(lat: number, lon: number, radius: number, step: number, seg = 16): { zone: number; south: boolean; lines: GridLine[] } {
  const zone = utmZone(lat, lon);
  const c = toUtm(lat, lon, zone);
  const e0 = Math.floor((c.easting - radius) / step) * step;
  const e1 = Math.ceil((c.easting + radius) / step) * step;
  const n0 = Math.floor((c.northing - radius) / step) * step;
  const n1 = Math.ceil((c.northing + radius) / step) * step;
  const lines: GridLine[] = [];
  const place = (e: number, n: number): [number, number] => fromUtm({ zone, south: c.south, easting: e, northing: n });
  for (let e = e0; e <= e1 && lines.length < 120; e += step) {
    const pts: [number, number][] = [];
    for (let i = 0; i <= seg; i++) pts.push(place(e, n0 + ((n1 - n0) * i) / seg));
    lines.push({ kind: 'easting', value: e, pts });
  }
  for (let n = n0; n <= n1 && lines.length < 240; n += step) {
    const pts: [number, number][] = [];
    for (let i = 0; i <= seg; i++) pts.push(place(e0 + ((e1 - e0) * i) / seg, n));
    lines.push({ kind: 'northing', value: n, pts });
  }
  return { zone, south: c.south, lines };
}

/** A latitude or longitude line's label: 47°30'N, 8°E. */
export function latLonLabel(kind: 'lat' | 'lon', v: number): string {
  const h = kind === 'lat' ? (v < 0 ? 'S' : 'N') : v < 0 ? 'W' : 'E';
  const a = Math.abs(v);
  let d = Math.floor(a + 1e-9);
  let m = Math.round((a - d) * 60);
  if (m === 60) {
    d++;
    m = 0;
  }
  return m ? `${d}°${String(m).padStart(2, '0')}'${h}` : `${d}°${h}`;
}

/** A UTM grid line's label, as a map writes it: the kilometres within the 100 km square ("47"), whole hundreds as "00". */
export function mgrsLabel(v: number, step: number): string {
  const km = Math.round((((v % 100000) + 100000) % 100000) / 1000);
  if (step >= 100000) return '00';
  if (step >= 1000) return String(km).padStart(2, '0');
  return (((v % 100000) + 100000) % 100000 / 1000).toFixed(1);
}
