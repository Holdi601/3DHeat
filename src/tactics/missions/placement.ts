/**
 * Where a mission's board coordinates lie on its level, when the level is not
 * in the game's own metres. A reader gives positions in its game's own flat
 * frame on the board; a level written in another frame (an IL-2 map tied to
 * the earth: metres east and north of an origin on the WGS-84 tangent plane)
 * says how it lies in the `.json` beside it, and the mission is moved onto it
 * when it is opened with that level (`placeMission`). The plan keeps the
 * placement (`PlanMission.placement`), so it is written back in the game's
 * own metres (`unplaceMission`), to well under a millimetre.
 *
 * **IL-2.** A reader's board frame is the game's metres with north up: board
 * x = game z (east from the map's west edge), board z = -(game x) (north from
 * its south edge). The map's four corners (`MapNW` ...) place a point by
 * bilinear interpolation between them, and the level's origin puts it on the
 * tangent plane as (east, height, -north) - as the IL-2 level extractor lays
 * the ground.
 */

import type { Vec3 } from '../plan';
import type { MissionState } from './index';

export interface Il2Placement {
  kind: 'il2-enu';
  /** [lat, lon] of the map's corners. */
  nw: [number, number];
  ne: [number, number];
  se: [number, number];
  sw: [number, number];
  /** The map's extent in game metres: x (north) and z (east). */
  xMax: number;
  zMax: number;
  /** The level's tangent-plane origin, [lat, lon]. */
  origin: [number, number];
  /** Metres added to a height on the way onto the level. */
  yOffset?: number;
}

export type MissionPlacement = Il2Placement;

const WGS84_A = 6378137.0;
const WGS84_F = 1 / 298.257223563;
const WGS84_E2 = WGS84_F * (2 - WGS84_F);
const RAD = Math.PI / 180;

function ecef(lat: number, lon: number): [number, number, number] {
  const p = lat * RAD;
  const l = lon * RAD;
  const n = WGS84_A / Math.sqrt(1 - WGS84_E2 * Math.sin(p) ** 2);
  return [n * Math.cos(p) * Math.cos(l), n * Math.cos(p) * Math.sin(l), n * (1 - WGS84_E2) * Math.sin(p)];
}

/** East and north metres of (lat, lon) from the origin on the WGS-84 tangent plane. */
export function tangent(lat: number, lon: number, lat0: number, lon0: number): [number, number] {
  const [x, y, z] = ecef(lat, lon);
  const [x0, y0, z0] = ecef(lat0, lon0);
  const dx = x - x0;
  const dy = y - y0;
  const dz = z - z0;
  const p = lat0 * RAD;
  const l = lon0 * RAD;
  const east = -Math.sin(l) * dx + Math.cos(l) * dy;
  const north = -Math.sin(p) * Math.cos(l) * dx - Math.sin(p) * Math.sin(l) * dy + Math.cos(p) * dz;
  return [east, north];
}

/** (lat, lon) at fractions u (west to east) and v (north to south) of a map. */
function bilinear(p: Il2Placement, u: number, v: number): [number, number] {
  const top = [p.nw[0] + (p.ne[0] - p.nw[0]) * u, p.nw[1] + (p.ne[1] - p.nw[1]) * u];
  const bottom = [p.sw[0] + (p.se[0] - p.sw[0]) * u, p.sw[1] + (p.se[1] - p.sw[1]) * u];
  return [top[0] + (bottom[0] - top[0]) * v, top[1] + (bottom[1] - top[1]) * v];
}

/** Game metres (x north, z east) to the level's (east, north). */
function il2Forward(p: Il2Placement, gx: number, gz: number): [number, number] {
  const [lat, lon] = bilinear(p, gz / p.zMax, (p.xMax - gx) / p.xMax);
  return tangent(lat, lon, p.origin[0], p.origin[1]);
}

/** The level's (east, north) back to game metres: Newton steps on the forward map. */
function il2Inverse(p: Il2Placement, east: number, north: number): [number, number] {
  // A first guess from the map's middle, then a few steps; the map is near-linear, so three or four do.
  let gx = p.xMax / 2;
  let gz = p.zMax / 2;
  const [e0, n0] = il2Forward(p, gx, gz);
  gx += north - n0;
  gz += east - e0;
  const h = 1;
  for (let i = 0; i < 8; i++) {
    const [e, n] = il2Forward(p, gx, gz);
    const de = east - e;
    const dn = north - n;
    if (Math.abs(de) < 1e-6 && Math.abs(dn) < 1e-6) break;
    const [ex, nx] = il2Forward(p, gx + h, gz);
    const [ez, nz] = il2Forward(p, gx, gz + h);
    const a = (ex - e) / h;
    const b = (ez - e) / h;
    const c = (nx - n) / h;
    const d = (nz - n) / h;
    const det = a * d - b * c;
    if (!det) break;
    gx += (d * de - b * dn) / det;
    gz += (a * dn - c * de) / det;
  }
  return [gx, gz];
}

/** A board point of the reader's frame on the level. */
export function placePoint(p: MissionPlacement, q: Vec3): Vec3 {
  const [e, n] = il2Forward(p, -q.z, q.x);
  return { x: e, y: q.y + (p.yOffset ?? 0), z: -n };
}

/** A point on the level back in the reader's frame. */
export function unplacePoint(p: MissionPlacement, q: Vec3): Vec3 {
  const [gx, gz] = il2Inverse(p, q.x, -q.z);
  return { x: gz, y: q.y - (p.yOffset ?? 0), z: -gx };
}

/** How far a heading turns on the way onto the level at a point: the game's north there as a board yaw. */
function turnAt(p: MissionPlacement, q: Vec3): number {
  const a = placePoint(p, q);
  const b = placePoint(p, { x: q.x, y: q.y, z: q.z - 100 });
  return Math.atan2(b.x - a.x, -(b.z - a.z));
}

type Mapper = (q: Vec3) => Vec3;

/** Every position of a mission (units, waypoints, task points, places) through `f`, headings turned by `turn`. */
function mapMission(m: MissionState, f: Mapper, turn: (q: Vec3) => number): MissionState {
  const pts = (ps?: Vec3[]) => ps?.map(f);
  return {
    ...m,
    groups: m.groups.map((g) => ({
      ...g,
      units: g.units.map((u) => ({ ...u, at: f(u.at), yaw: u.yaw + turn(u.at) })),
      route: g.route.map((w) => ({ ...w, at: f(w.at), ...(w.tasks ? { tasks: w.tasks.map((t) => ({ ...t, ...(t.points ? { points: pts(t.points) } : {}), ...(t.altitude !== undefined ? { altitude: t.altitude + (f(w.at).y - w.at.y) } : {}) })) } : {}) })),
      ...(g.task ? { task: { ...g.task, ...(g.task.points ? { points: pts(g.task.points) } : {}) } } : {}),
    })),
    places: m.places.map((pl) => ({ ...pl, at: f(pl.at) })),
  };
}

/** The mission moved onto a level that lies as `p` says; the plan made of it keeps `p`. */
export function placeMission(m: MissionState, p: MissionPlacement): MissionState {
  return { ...mapMission(m, (q) => placePoint(p, q), (q) => turnAt(p, q)), placement: p };
}

/** A mission written from a placed plan, back in its game's own frame. */
export function unplaceMission(m: MissionState, p: MissionPlacement): MissionState {
  const out = mapMission(
    m,
    (q) => unplacePoint(p, q),
    (q) => -turnAt(p, unplacePoint(p, q)),
  );
  delete out.placement;
  return out;
}

const num = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const corner = (x: unknown): [number, number] | null => {
  const c = x as { lat?: unknown; lon?: unknown } | null;
  const la = num(c?.lat);
  const lo = num(c?.lon);
  return la !== null && lo !== null ? [la, lo] : null;
};

/**
 * The placement a level's `.json` describes, for a mission of `format`;
 * null when the level is in the game's own metres (nothing to move).
 */
export function placementFromLevelInfo(format: string, info: unknown): MissionPlacement | null {
  if (!info || typeof info !== 'object') return null;
  const j = info as Record<string, unknown>;
  if (format.startsWith('il2')) {
    const frame = j.frame as { name?: string; origin?: unknown } | undefined;
    if (frame?.name !== 'enu') return null;
    const cs = j.corners as Record<string, unknown> | undefined;
    const hm = j.heightmap as { samples?: unknown; cell?: unknown } | undefined;
    const samples = Array.isArray(hm?.samples) ? (hm!.samples as unknown[]).map(num) : [];
    const cell = num(hm?.cell);
    const nw = corner(cs?.MapNW);
    const ne = corner(cs?.MapNE);
    const se = corner(cs?.MapSE);
    const sw = corner(cs?.MapSW);
    const origin = corner(frame.origin);
    if (!nw || !ne || !se || !sw || !origin || cell === null || samples[0] === null || samples[1] === null || samples.length < 2) return null;
    // A mission's heights are the game's own (the heightmap's raw * heightMul / 256); the level's are above
    // sea level, which the map's SeaLevel (in the same units) puts SeaLevel * heightMul below them.
    const sea = num((hm as { seaLevel?: unknown } | undefined)?.seaLevel) ?? 0;
    const mul = num((hm as { heightMul?: unknown } | undefined)?.heightMul) ?? 1;
    const yOffset = -sea * mul;
    return { kind: 'il2-enu', nw, ne, se, sw, xMax: (samples[1]! - 1) * cell, zMax: (samples[0]! - 1) * cell, origin, ...(yOffset ? { yOffset } : {}) };
  }
  return null;
}

/** A saved plan's placement as this viewer keeps it; undefined for anything that is not one. */
export function readPlacement(x: unknown): MissionPlacement | undefined {
  if (!x || typeof x !== 'object') return undefined;
  const p = x as Il2Placement;
  const pair = (v: unknown): v is [number, number] => Array.isArray(v) && v.length === 2 && v.every((n) => num(n) !== null);
  if (p.kind !== 'il2-enu' || !pair(p.nw) || !pair(p.ne) || !pair(p.se) || !pair(p.sw) || !pair(p.origin) || !num(p.xMax) || !num(p.zMax)) return undefined;
  return { kind: 'il2-enu', nw: p.nw, ne: p.ne, se: p.se, sw: p.sw, xMax: p.xMax, zMax: p.zMax, origin: p.origin, ...(num(p.yOffset) !== null ? { yOffset: p.yOffset } : {}) };
}
