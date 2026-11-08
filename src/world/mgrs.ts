/**
 * Positions as people write them: latitude and longitude in degrees, minutes
 * and seconds, UTM, and MGRS (the military grid reference system, NATO's
 * grid on UTM: "18T WL 80735 04700"), with the way back from UTM for drawing
 * the grid. WGS84 throughout; UTM by the Krüger series to a millimetre.
 * MGRS is defined from 80° south to 84° north; beyond, at the poles (UPS),
 * there is none here.
 */

const A = 6378137;
const F = 1 / 298.257223563;
const K0 = 0.9996;
const N = F / (2 - F);
const AA = (A / (1 + N)) * (1 + (N * N) / 4 + (N ** 4) / 64);
const ALPHA = [N / 2 - (2 * N * N) / 3 + (5 * N ** 3) / 16, (13 * N * N) / 48 - (3 * N ** 3) / 5, (61 * N ** 3) / 240];
const BETA = [N / 2 - (2 * N * N) / 3 + (37 * N ** 3) / 96, (N * N) / 48 + N ** 3 / 15, (17 * N ** 3) / 480];
const DELTA = [2 * N - (2 * N * N) / 3 - 2 * N ** 3, (7 * N * N) / 3 - (8 * N ** 3) / 5, (56 * N ** 3) / 15];
const RAD = Math.PI / 180;
const BANDS = 'CDEFGHJKLMNPQRSTUVWXX';
const COLS = ['ABCDEFGH', 'JKLMNPQR', 'STUVWXYZ'];
const ROWS = 'ABCDEFGHJKLMNPQRSTUV';

export interface Utm {
  zone: number;
  /** Southern hemisphere: northings from 10,000 km at the equator. */
  south: boolean;
  easting: number;
  northing: number;
}

/** The UTM zone of a place, with Norway's and Svalbard's exceptions. */
export function utmZone(lat: number, lon: number): number {
  const l = ((((lon + 180) % 360) + 360) % 360) - 180;
  let zone = Math.floor((l + 180) / 6) + 1;
  if (zone > 60) zone = 60;
  if (lat >= 56 && lat < 64 && l >= 3 && l < 12) zone = 32;
  if (lat >= 72 && lat < 84) {
    if (l >= 0 && l < 9) zone = 31;
    else if (l >= 9 && l < 21) zone = 33;
    else if (l >= 21 && l < 33) zone = 35;
    else if (l >= 33 && l < 42) zone = 37;
  }
  return zone;
}

/** Latitude and longitude (degrees) in UTM, in the place's own zone or the one given. */
export function toUtm(lat: number, lon: number, zone = utmZone(lat, lon)): Utm {
  const lon0 = (zone - 1) * 6 - 180 + 3;
  let dl = lon - lon0;
  dl = ((((dl + 180) % 360) + 360) % 360) - 180;
  const phi = lat * RAD;
  const lam = dl * RAD;
  const s = Math.sin(phi);
  const c2 = (2 * Math.sqrt(N)) / (1 + N);
  const t = Math.sinh(Math.atanh(s) - c2 * Math.atanh(c2 * s));
  const xi = Math.atan2(t, Math.cos(lam));
  const eta = Math.atanh(Math.sin(lam) / Math.sqrt(1 + t * t));
  let x = eta;
  let y = xi;
  for (let j = 1; j <= 3; j++) {
    x += ALPHA[j - 1] * Math.cos(2 * j * xi) * Math.sinh(2 * j * eta);
    y += ALPHA[j - 1] * Math.sin(2 * j * xi) * Math.cosh(2 * j * eta);
  }
  const south = lat < 0;
  return { zone, south, easting: 500000 + K0 * AA * x, northing: (south ? 10000000 : 0) + K0 * AA * y };
}

/** UTM back to latitude and longitude, degrees. */
export function fromUtm(u: Utm): [number, number] {
  const xi = (u.northing - (u.south ? 10000000 : 0)) / (K0 * AA);
  const eta = (u.easting - 500000) / (K0 * AA);
  let xp = xi;
  let ep = eta;
  for (let j = 1; j <= 3; j++) {
    xp -= BETA[j - 1] * Math.sin(2 * j * xi) * Math.cosh(2 * j * eta);
    ep -= BETA[j - 1] * Math.cos(2 * j * xi) * Math.sinh(2 * j * eta);
  }
  const chi = Math.asin(Math.sin(xp) / Math.cosh(ep));
  let phi = chi;
  for (let j = 1; j <= 3; j++) phi += DELTA[j - 1] * Math.sin(2 * j * chi);
  const lon0 = (u.zone - 1) * 6 - 180 + 3;
  return [phi / RAD, lon0 + Math.atan2(Math.sinh(ep), Math.cos(xp)) / RAD];
}

/** The MGRS latitude band letter; '' outside 80° S to 84° N. */
export function mgrsBand(lat: number): string {
  if (lat < -80 || lat > 84) return '';
  return BANDS[Math.min(20, Math.floor((lat + 80) / 8))];
}

/** The 100 km square's two letters of a UTM position. */
export function squareLetters(zone: number, easting: number, northing: number): string {
  const set = (zone - 1) % 3;
  const col = COLS[set][Math.max(0, Math.min(7, Math.floor(easting / 100000) - 1))];
  const shift = zone % 2 === 0 ? 5 : 0;
  const row = ROWS[(((Math.floor(northing / 100000) + shift) % 20) + 20) % 20];
  return col + row;
}

export interface Mgrs {
  zone: number;
  band: string;
  square: string;
  /** Metres into the 100 km square. */
  easting: number;
  northing: number;
}

/** A place's MGRS reference; null beyond 80° S and 84° N. */
export function toMgrsParts(lat: number, lon: number): Mgrs | null {
  const band = mgrsBand(lat);
  if (!band || !Number.isFinite(lon)) return null;
  const u = toUtm(lat, lon);
  return { zone: u.zone, band, square: squareLetters(u.zone, u.easting, u.northing), easting: u.easting % 100000, northing: u.northing % 100000 };
}

/** A place's MGRS reference as written, `digits` (1-5) a coordinate: "18T WL 80735 04700". '' where there is none. */
export function toMgrs(lat: number, lon: number, digits = 5): string {
  const m = toMgrsParts(lat, lon);
  if (!m) return '';
  const d = Math.max(1, Math.min(5, Math.round(digits)));
  const div = 10 ** (5 - d);
  const e = String(Math.floor(m.easting / div)).padStart(d, '0');
  const n = String(Math.floor(m.northing / div)).padStart(d, '0');
  return `${m.zone}${m.band} ${m.square} ${e} ${n}`;
}

/** Degrees as degrees, minutes and seconds with a hemisphere letter: 40°41'21.3"N. */
export function dms(v: number, pos: string, neg: string, secDigits = 1): string {
  const h = v < 0 ? neg : pos;
  const a = Math.abs(v);
  let d = Math.floor(a);
  let m = Math.floor((a - d) * 60);
  let s = (a - d - m / 60) * 3600;
  const r = Number(s.toFixed(secDigits));
  s = r;
  if (s >= 60) {
    s -= 60;
    m++;
  }
  if (m >= 60) {
    m -= 60;
    d++;
  }
  return `${d}°${String(m).padStart(2, '0')}'${s.toFixed(secDigits).padStart(secDigits ? 3 + secDigits : 2, '0')}"${h}`;
}

/** Latitude and longitude in degrees, minutes and seconds. */
export function formatLatLon(lat: number, lon: number): string {
  return `${dms(lat, 'N', 'S')} ${dms(lon, 'E', 'W')}`;
}
