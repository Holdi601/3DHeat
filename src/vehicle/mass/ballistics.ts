/**
 * The shell's flight, where the replay does not record it: the launch
 * elevation that carries a shell from the muzzle to the hit point, and the
 * speed and descent it arrives with. A point mass under gravity and
 * quadratic drag, a = -g y - k |v| v, with k = rho Cx A / (2 m) per metre.
 *
 * Flat fire (an APFSDS dart, a tank gun's shell over a few kilometres) has a
 * closed form, exact while the path stays shallow: with w the path's slope
 * and the speed taken as its forward part,
 *
 *     dw/dx = -g e^{2kx} / v0x^2
 *     w(x)  = w0 - g (e^{2kx} - 1) / (2k v0x^2)
 *     y(x)  = w0 x - g / (2k v0x^2) ((e^{2kx} - 1) / (2k) - x)
 *     vx(x) = v0x e^{-kx},   t(x) = (e^{kx} - 1) / (k v0x)
 *
 * A slow shell (a howitzer's, a mortar's, a low-velocity HE or HEAT round)
 * climbs and comes down steeply: its path is integrated (RK4) and the
 * elevation found by bisection, the low arc unless the gun fires indirect or
 * the low arc cannot reach. Each solution is kept by its shell, range and
 * height, so a mass load solves each kind of shot once.
 */

export const G = 9.81;
/** Air density at sea level, kg/m3. */
const RHO = 1.225;

export interface Shell {
  /** Muzzle speed, m/s. */
  v0: number;
  /** Drag per metre, 1/m. */
  k: number;
  /** Fired indirect (a mortar, a howitzer's indirect round): the high arc first. */
  indirect: boolean;
  /** A guided or rocket-driven round: no ballistic estimate. */
  powered: boolean;
  /** Where the muzzle speed came from: the install's catalogue, or the round's kind. */
  from: 'catalogue' | 'kind';
}

export interface Flight {
  /** Speed at the hit, m/s. */
  speed: number;
  /** Below the horizontal at the hit, degrees (+ coming down). */
  descent: number;
  /** Launch elevation, degrees. */
  elevation: number;
  /** Seconds of flight. */
  time: number;
  arc: 'low' | 'high';
}

/** A round's kind from its type as the converter writes it (`APFSDS`, `apds_fs_long_tank`, `he_frag_tank`, `kinetic`...). */
export type ShellKind = 'APFSDS' | 'APDS' | 'APCR' | 'APHE' | 'AP' | 'HEAT-FS' | 'HEAT' | 'HESH' | 'HE' | 'ATGM' | 'rocket' | 'kinetic' | 'explosive' | 'unknown';

export function shellKind(type: string, name = ''): ShellKind {
  const t = type.toLowerCase();
  const n = name.toLowerCase();
  if (/atgm|missile|sam_|aam_|agm_/.test(t) || /9m\d|atgm|hellfire|tow|spike|hot_|milan|kornet/.test(n)) return 'ATGM';
  if (/rocket/.test(t)) return 'rocket';
  if (/apfsds|apds_fs|^dart/.test(t)) return 'APFSDS';
  if (/apds/.test(t)) return 'APDS';
  if (/apcr|hvap|apcnr/.test(t)) return 'APCR';
  if (/aphe|apcbc_?he|apbc_?he/.test(t)) return 'APHE';
  if (/^(ap|apc|apbc|apcbc|sap|ap_t|ap_i)/.test(t) || t === 'ap') return 'AP';
  if (/heat_fs|heatfs|heat-fs/.test(t)) return 'HEAT-FS';
  if (/heat/.test(t)) return 'HEAT';
  if (/hesh|hep/.test(t)) return 'HESH';
  if (/^he|frag|shrapnel|^hef|^mp/.test(t)) return 'HE';
  if (t === 'kinetic') return 'kinetic';
  if (t === 'explosive') return 'explosive';
  return 'unknown';
}

/**
 * Typical muzzle speeds (m/s) and densities (mass over calibre cubed, kg/m3) by kind, for rounds the catalogue does
 * not list. A dart's drag is its own: a thin rod, not the gun's calibre.
 */
const KIND_DEFAULTS: Record<ShellKind, { v0: number; density: number; cx: number } | null> = {
  APFSDS: { v0: 1650, density: 0, cx: 0 },
  APDS: { v0: 1250, density: 0, cx: 0 },
  APCR: { v0: 1050, density: 9000, cx: 0.35 },
  APHE: { v0: 800, density: 15000, cx: 0.3 },
  AP: { v0: 820, density: 16000, cx: 0.3 },
  'HEAT-FS': { v0: 1050, density: 6000, cx: 0.35 },
  HEAT: { v0: 600, density: 7000, cx: 0.4 },
  HESH: { v0: 730, density: 9000, cx: 0.35 },
  HE: { v0: 750, density: 12000, cx: 0.32 },
  kinetic: { v0: 900, density: 15000, cx: 0.3 },
  explosive: { v0: 750, density: 12000, cx: 0.32 },
  unknown: { v0: 850, density: 15000, cx: 0.3 },
  ATGM: null,
  rocket: null,
};

/** Drag per metre for a calibre (m) of a density (kg/m3) and drag coefficient: rho Cx (pi d^2 / 4) / (2 m), m = density d^3. */
export function dragOf(calibreM: number, density: number, cx: number): number {
  return (RHO * cx * Math.PI) / (8 * density * calibreM);
}

/** A dart's drag: long rods lose about 50-60 m/s a kilometre at 1,700 m/s; APDS cores twice that. */
const DART_K = 3.5e-5;
const APDS_K = 8e-5;

/**
 * The shell a hit was fired with: its muzzle speed from the install's catalogue (by its own name) where it is
 * listed, else its kind's; its drag from its kind and calibre. Null for guided and rocket rounds.
 */
export function shellFor(kind: ShellKind, calibreMm: number, catalogueSpeed: number | null, name = ''): Shell | null {
  const d = KIND_DEFAULTS[kind];
  if (!d) return null;
  const cal = Number.isFinite(calibreMm) && calibreMm > 0 ? calibreMm / 1000 : 0.075;
  const k = kind === 'APFSDS' ? DART_K : kind === 'APDS' ? APDS_K : dragOf(cal, d.density, d.cx);
  const v0 = catalogueSpeed !== null && catalogueSpeed > 50 ? catalogueSpeed : d.v0;
  const indirect = /mortar|howitzer_indirect|_art_|artillery/.test(name.toLowerCase()) || (cal >= 0.081 && v0 < 300 && (kind === 'HE' || kind === 'explosive'));
  return { v0, k, indirect, powered: false, from: catalogueSpeed !== null && catalogueSpeed > 50 ? 'catalogue' : 'kind' };
}

const DEG = 180 / Math.PI;

/** (e^{2kx} - 1) / (2k) - x, also where kx is tiny. */
function dropTerm(k: number, x: number): number {
  const a = 2 * k * x;
  if (a < 1e-4) return k * x * x * (1 + a / 3);
  return (Math.expm1(a) / (2 * k)) - x;
}

/** The flat-fire solution, or null when it is not shallow enough to be exact (over 12 degrees). */
export function flatFire(s: Shell, range: number, dh: number): Flight | null {
  if (range <= 0) return null;
  let v0x = s.v0;
  let w0 = 0;
  for (let it = 0; it < 4; it++) {
    w0 = (dh + (G / (2 * s.k * v0x * v0x)) * dropTerm(s.k, range)) / range;
    v0x = s.v0 / Math.sqrt(1 + w0 * w0);
  }
  const a = 2 * s.k * range;
  const grow = a < 1e-4 ? range * (1 + a / 2) : Math.expm1(a) / (2 * s.k);
  const w = w0 - (G * grow) / (v0x * v0x);
  const elevation = Math.atan(w0) * DEG;
  const descent = -Math.atan(w) * DEG;
  if (Math.abs(elevation) > 12 || Math.abs(descent) > 12) return null;
  const vx = v0x * Math.exp(-s.k * range);
  const kx = s.k * range;
  const time = kx < 1e-6 ? range / v0x : Math.expm1(kx) / (s.k * v0x);
  return { speed: vx * Math.sqrt(1 + w * w), descent, elevation, time, arc: 'low' };
}

/** Integrates a shot at `elevation` (rad) until it has gone `range` forward; the state there, or null when it falls short. */
export function flyTo(s: Shell, elevation: number, range: number): { y: number; vx: number; vy: number; t: number } | null {
  let x = 0, y = 0, vx = s.v0 * Math.cos(elevation), vy = s.v0 * Math.sin(elevation), t = 0;
  const k = s.k;
  // Some 400 steps over the flight at the muzzle speed, more as it slows.
  const ax = (vxx: number, vyy: number) => -k * Math.hypot(vxx, vyy) * vxx;
  const ay = (vxx: number, vyy: number) => -G - k * Math.hypot(vxx, vyy) * vyy;
  const budget = 200_000;
  for (let i = 0; i < budget; i++) {
    const sp = Math.hypot(vx, vy);
    const dt = Math.max(1e-4, Math.min(0.25, range / Math.max(sp, 1) / 400));
    const k1x = vx, k1y = vy, k1u = ax(vx, vy), k1v = ay(vx, vy);
    const k2x = vx + 0.5 * dt * k1u, k2y = vy + 0.5 * dt * k1v, k2u = ax(k2x, k2y), k2v = ay(k2x, k2y);
    const k3x = vx + 0.5 * dt * k2u, k3y = vy + 0.5 * dt * k2v, k3u = ax(k3x, k3y), k3v = ay(k3x, k3y);
    const k4x = vx + dt * k3u, k4y = vy + dt * k3v, k4u = ax(k4x, k4y), k4v = ay(k4x, k4y);
    const nx = x + (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
    const ny = y + (dt / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
    const nvx = vx + (dt / 6) * (k1u + 2 * k2u + 2 * k3u + k4u);
    const nvy = vy + (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
    if (nx >= range) {
      const f = (range - x) / Math.max(nx - x, 1e-9);
      return { y: y + (ny - y) * f, vx: vx + (nvx - vx) * f, vy: vy + (nvy - vy) * f, t: t + dt * f };
    }
    // Falling and already far below anything it could still reach, or stopped going forward.
    if ((ny < -50_000 && nvy < 0) || nvx < 1) return null;
    x = nx;
    y = ny;
    vx = nvx;
    vy = nvy;
    t += dt;
  }
  return null;
}

/** The integrated solution: the low arc, or the high one (`high`), or null when no elevation reaches the point. */
export function arcSolve(s: Shell, range: number, dh: number, high: boolean): Flight | null {
  // Height over the point when the shell has gone `range` forward; a shell that falls short counts as far below.
  const SHORT = -1e9;
  const f = (deg: number) => {
    const r = flyTo(s, deg / DEG, range);
    return r ? r.y - dh : SHORT;
  };
  // Bracket the roots on a coarse sweep: the first crossing is the low arc, the last the high.
  const angles = [-15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 87, 89];
  const roots: [number, number, number][] = [];
  let pa = -20, pv = f(pa);
  for (const a of angles) {
    const v = f(a);
    if ((pv > SHORT || v > SHORT) && pv * v <= 0) roots.push([pa, a, pv]);
    pa = a;
    pv = v;
  }
  if (!roots.length) return null;
  let [lo, hi, flo] = high ? roots[roots.length - 1] : roots[0];
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (Math.sign(fm) === Math.sign(flo)) {
      lo = mid;
      flo = fm;
    } else hi = mid;
  }
  // The end of the bracket the shell still reaches the point from.
  let el = (lo + hi) / 2;
  let r = flyTo(s, el / DEG, range);
  if (!r) r = flyTo(s, (el = flo > SHORT ? lo : hi) / DEG, range);
  if (!r) return null;
  return { speed: Math.hypot(r.vx, r.vy), descent: -Math.atan2(r.vy, r.vx) * DEG, elevation: el, time: r.t, arc: high && roots.length > 1 ? 'high' : 'low' };
}

/**
 * A hit's flight: flat fire where it is exact, else the integrated arc - the high one for an indirect round or where
 * the low one cannot reach. `elevationHint` (degrees, the gun's elevation at the shot where the data has it) picks
 * the arc nearer it.
 */
export function solveFlight(s: Shell, range: number, dh: number, elevationHint: number | null = null): Flight | null {
  if (!(range > 0) || s.powered) return null;
  if (!s.indirect) {
    const flat = flatFire(s, range, dh);
    if (flat) return flat;
  }
  if (elevationHint !== null) {
    const low = arcSolve(s, range, dh, false);
    const high = arcSolve(s, range, dh, true);
    if (low && high) return Math.abs(high.elevation - elevationHint) < Math.abs(low.elevation - elevationHint) ? high : low;
    return low ?? high;
  }
  const first = arcSolve(s, range, dh, s.indirect);
  return first ?? arcSolve(s, range, dh, !s.indirect);
}

/** Kept solutions, by shell, range (2 m, or a two-hundredth of it) and height (1 m, or a thousandth of the range). */
export class FlightCache {
  private readonly m = new Map<string, Flight | null>();
  get size(): number {
    return this.m.size;
  }
  solve(s: Shell, range: number, dh: number, elevationHint: number | null = null): Flight | null {
    const rb = Math.max(2, range / 200), hb = Math.max(1, range / 1000);
    const ri = Math.round(range / rb), hi = Math.round(dh / hb);
    const key = `${s.v0}|${s.k.toPrecision(4)}|${s.indirect ? 1 : 0}|${rb.toFixed(1)}|${ri}|${hi}|${elevationHint === null ? '' : Math.round(elevationHint)}`;
    let r = this.m.get(key);
    if (r === undefined) {
      r = solveFlight(s, ri * rb, hi * hb, elevationHint);
      if (this.m.size > 400_000) this.m.clear();
      this.m.set(key, r);
    }
    return r;
  }
}
