/**
 * DCS World's own metres <-> WGS84 latitude and longitude.
 *
 * Each DCS theatre is a Transverse Mercator projection (WGS84, latitude of
 * origin 0, scale 0.9996) with its own central meridian and false origin;
 * DCS's x is the northing and z the easting, y the height:
 *
 *     x = northing + false northing        z = easting + false easting
 *
 * The constants are facts published by the pydcs project (dcs/terrain/<name>/
 * projection.py, generated there from the sim). The maths is Krueger's series
 * to sixth order as C. F. F. Karney gives it ("Transverse Mercator with an
 * accuracy of a few nanometers", J. Geodesy 85, 2011): this is a port of the
 * 3DHeat DCS terrain converter's own implementation
 * (exporters/ext/dcs-maps/heat3d_ext_dcs/projection.py, MIT), so a level that
 * converter writes, a Watcher DCS table in DCS metres and a world backdrop all
 * land on the same ground.
 */

const A = 6378137.0;
const F = 1 / 298.257223563;
const E2 = F * (2 - F);
const E = Math.sqrt(E2);
const N = F / (2 - F);
/** The rectifying radius. */
const RA = (A / (1 + N)) * (1 + N ** 2 / 4 + N ** 4 / 64 + N ** 6 / 256);
const ALPHA = [
  N / 2 - (2 * N ** 2) / 3 + (5 * N ** 3) / 16 + (41 * N ** 4) / 180 - (127 * N ** 5) / 288 + (7891 * N ** 6) / 37800,
  (13 * N ** 2) / 48 - (3 * N ** 3) / 5 + (557 * N ** 4) / 1440 + (281 * N ** 5) / 630 - (1983433 * N ** 6) / 1935360,
  (61 * N ** 3) / 240 - (103 * N ** 4) / 140 + (15061 * N ** 5) / 26880 + (167603 * N ** 6) / 181440,
  (49561 * N ** 4) / 161280 - (179 * N ** 5) / 168 + (6601661 * N ** 6) / 7257600,
  (34729 * N ** 5) / 80640 - (3418889 * N ** 6) / 1995840,
  (212378941 * N ** 6) / 319334400,
];
const BETA = [
  N / 2 - (2 * N ** 2) / 3 + (37 * N ** 3) / 96 - N ** 4 / 360 - (81 * N ** 5) / 512 + (96199 * N ** 6) / 604800,
  N ** 2 / 48 + N ** 3 / 15 - (437 * N ** 4) / 1440 + (46 * N ** 5) / 105 - (1118711 * N ** 6) / 3870720,
  (17 * N ** 3) / 480 - (37 * N ** 4) / 840 - (209 * N ** 5) / 4480 + (5569 * N ** 6) / 90720,
  (4397 * N ** 4) / 161280 - (11 * N ** 5) / 504 - (830251 * N ** 6) / 7257600,
  (4583 * N ** 5) / 161280 - (108847 * N ** 6) / 3991680,
  (20648693 * N ** 6) / 638668800,
];
const RAD = Math.PI / 180;

export interface DcsProjection {
  centralMeridian: number;
  falseEasting: number;
  falseNorthing: number;
  scale: number;
}

const p = (centralMeridian: number, falseEasting: number, falseNorthing: number): DcsProjection => ({
  centralMeridian,
  falseEasting,
  falseNorthing,
  scale: 0.9996,
});

/**
 * By DCS theatre name. The terrain folder names and the names a mission gives
 * (`mission.theatre`) are both listed where they are known to differ. Iraq's
 * constants are not published: they are fitted to the beacons its own
 * beacons.lua gives both ways (4 cm root mean square; the same fit gives
 * Caucasus, Syria and Sinai back to the millimetre).
 */
export const DCS_PROJECTIONS: Record<string, DcsProjection> = {
  Afghanistan: p(63, -300150.0, -3759657.0),
  Caucasus: p(33, -99516.9999999732, -4998114.999999984),
  Falklands: p(-57, 147639.99999997593, 5815417.000000032),
  GermanyColdWar: p(21, 35427.619999985734, -6061633.128000011),
  GermanyCW: p(21, 35427.619999985734, -6061633.128000011),
  Iraq: p(45, 72290.0, -3680057.0),
  Kola: p(21, -62702.00000000087, -7543624.999999979),
  MarianaIslands: p(147, 238417.99999989968, -1491840.000000048),
  MarianasWWII: p(147, 238417.99999989968, -1491840.000000048),
  MarianaIslandsWWII: p(147, 238417.99999989968, -1491840.000000048),
  Nevada: p(-117, -193996.80999964548, -4410028.063999966),
  Normandy: p(-3, -195526.00000000204, -5484812.999999951),
  PersianGulf: p(57, 75755.99999999645, -2894933.0000000377),
  Sinai: p(33, 169221.9999999585, -3325312.9999999693),
  SinaiMap: p(33, 169221.9999999585, -3325312.9999999693),
  Syria: p(39, 282801.00000003993, -3879865.9999999935),
  TheChannel: p(3, 99376.00000000288, -5636889.00000001),
};

/** tan of the conformal latitude from tan of the latitude (Karney eq. 7). */
function conformal(tau: number): number {
  const sigma = Math.sinh(E * Math.atanh((E * tau) / Math.hypot(1, tau)));
  return tau * Math.hypot(1, sigma) - sigma * Math.hypot(1, tau);
}

/** Easting and northing (metres, no false origin) of a latitude and a longitude from the central meridian. */
function forward(lat: number, dlon: number, k0: number): [number, number] {
  const lam = dlon * RAD;
  const tp = conformal(Math.tan(lat * RAD));
  const xi = Math.atan2(tp, Math.cos(lam));
  const eta = Math.asinh(Math.sin(lam) / Math.hypot(tp, Math.cos(lam)));
  let x = eta;
  let y = xi;
  for (let j = 1; j <= 6; j++) {
    const a = ALPHA[j - 1];
    x += a * Math.cos(2 * j * xi) * Math.sinh(2 * j * eta);
    y += a * Math.sin(2 * j * xi) * Math.cosh(2 * j * eta);
  }
  return [k0 * RA * x, k0 * RA * y];
}

/** Latitude and longitude offset (degrees) from easting and northing. */
function inverse(x: number, y: number, k0: number): [number, number] {
  const xi = y / (k0 * RA);
  const eta = x / (k0 * RA);
  let xp = xi;
  let ep = eta;
  for (let j = 1; j <= 6; j++) {
    const b = BETA[j - 1];
    xp -= b * Math.sin(2 * j * xi) * Math.cosh(2 * j * eta);
    ep -= b * Math.cos(2 * j * xi) * Math.sinh(2 * j * eta);
  }
  const tp = Math.sin(xp) / Math.hypot(Math.sinh(ep), Math.cos(xp));
  const lam = Math.atan2(Math.sinh(ep), Math.cos(xp));
  let tau = tp / (1 - E2);
  for (let i = 0; i < 8; i++) {
    const c = conformal(tau);
    const d = ((tp - c) * (1 + (1 - E2) * tau * tau)) / ((1 - E2) * Math.hypot(1, c) * Math.hypot(1, tau));
    tau += d;
    if (Math.abs(d) < 1e-14 * Math.max(1, Math.abs(tau))) break;
  }
  return [Math.atan(tau) / RAD, lam / RAD];
}

/** Latitude, longitude (degrees) -> DCS x (north), z (east), metres. */
export function toDcs(proj: DcsProjection, lat: number, lon: number): { x: number; z: number } {
  const [e, n] = forward(lat, lon - proj.centralMeridian, proj.scale);
  return { x: n + proj.falseNorthing, z: e + proj.falseEasting };
}

/** DCS x (north), z (east), metres -> latitude, longitude (degrees). */
export function fromDcs(proj: DcsProjection, x: number, z: number): [number, number] {
  const [lat, dlon] = inverse(z - proj.falseEasting, x - proj.falseNorthing, proj.scale);
  return [lat, dlon + proj.centralMeridian];
}
