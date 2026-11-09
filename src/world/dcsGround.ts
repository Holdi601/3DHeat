import { DCS_PROJECTIONS, fromDcs, toDcs, type DcsProjection } from './dcsProjection';
import type { Runway } from './runways';
import { latToMy, mxToLon, myToLat } from './tiles';

/**
 * A DCS theatre's own ground under the streamed real world: the hybrid
 * backdrop. The ground is a level written by the DCS converter
 * (exporters/ext/dcs-maps: the game's terrain triangles in DCS metres, x north,
 * y up, z east, coloured by the overlay the game draws on each). Recorded
 * aircraft fly over that ground, not over the real earth, so the streamed
 * tiles take its heights wherever it reaches (a tile's buildings, roads and
 * runways then stand on it too), and show the real world only where the two
 * agree:
 *
 * - **Shift.** Where the game's runway lies beside the surveyed one
 *   (OurAirports), or short of or past its ends, the real-world layer near
 *   it is moved by the difference, so imagery, roads and the surveyed
 *   runway lie where the recorded aircraft roll.
 * - **Judge.** Each tile compares the real terrain with the game's at its
 *   grid points: the coast (land on one, sea on the other) and the height.
 *   Where they agree, imagery and map features are draped on the game's
 *   ground; where they do not, the tile shows the game's own ground in its
 *   class colours instead, so nothing floats or sinks.
 * - **Buildings.** Where the level carries the game's own buildings (boxes
 *   from its scene), those stand in the town instead of the mapped ones:
 *   the game's town is the one the pilot flew over.
 */

export interface DcsGroundData {
  /** The theatre, a key of DCS_PROJECTIONS. */
  theatre: string;
  /** x, y, z per vertex, DCS metres. */
  positions: Float32Array;
  /** r, g, b per vertex, 0..255; null when the level has no colours. */
  colours: Uint8Array | null;
  /** Land triangles, and the flat sea's. */
  ground: Uint32Array;
  water: Uint32Array;
  /** The game's buildings, BUILDING_STRIDE floats each (see dcsBuildings); absent when the level has none. */
  buildings?: Float32Array | null;
}

/** Floats per building: x, z, base, height, half x, half z, heading (radians), kind. */
export const BUILDING_STRIDE = 8;

/**
 * The level's buildings (its .json `buildings.rows`: x, z, base, height,
 * half_x, half_z, heading_deg, kind) packed for the stream worker, the
 * heading in radians; null when there are none.
 */
export function dcsBuildings(rows: number[][] | null | undefined): Float32Array | null {
  if (!rows?.length) return null;
  const out = new Float32Array(rows.length * BUILDING_STRIDE);
  let n = 0;
  for (const r of rows) {
    if (r.length < 8 || !r.slice(0, 8).every(Number.isFinite)) continue;
    out.set([r[0], r[1], r[2], r[3], r[4], r[5], (r[6] * Math.PI) / 180, r[7]], n * BUILDING_STRIDE);
    n++;
  }
  return n ? out.slice(0, n * BUILDING_STRIDE) : null;
}

/** The converter's runway class colour (heat3d_ext_dcs COLOURS.runway), 0..255. */
const RUNWAY_RGB = [26, 26, 26];
const SEA_RGB: readonly [number, number, number] = [0.24, 0.45, 0.72];

/**
 * The ground of a loaded level for the streamer: positions out of the
 * viewer's interleaved vertices (position and normal, six floats a vertex), in
 * the level's own (DCS) metres.
 */
export function dcsGroundFrom(
  theatre: string,
  vertices: Float32Array,
  colours: Float32Array | null,
  ground: Uint32Array,
  water: Uint32Array,
  buildings: Float32Array | null = null,
): DcsGroundData {
  const n = vertices.length / 6;
  const positions = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    positions[i * 3] = vertices[i * 6];
    positions[i * 3 + 1] = vertices[i * 6 + 1];
    positions[i * 3 + 2] = vertices[i * 6 + 2];
  }
  let rgb: Uint8Array | null = null;
  if (colours && colours.length >= n * 3) {
    rgb = new Uint8Array(n * 3);
    for (let i = 0; i < n * 3; i++) rgb[i] = Math.max(0, Math.min(255, Math.round(colours[i] * 255)));
  }
  return { theatre, positions, colours: rgb, ground, water, buildings };
}

export interface DcsSample {
  h: number;
  sea: boolean;
  rgb: [number, number, number];
}

export interface TileVerdict {
  /** Grid points the game's ground reaches. */
  covered: number;
  /** Shown as the real world (true) or as the game's ground (false). */
  agree: boolean;
  /**
   * Real minus game height on land, metres: its median (the bias, a level
   * difference the drape on the game's heights takes away anyway), and the
   * median and 90th percentile of what is left after it (the shape).
   */
  bias: number;
  median: number;
  p90: number;
  /** Share of covered points that are land on one and sea on the other. */
  coast: number;
}

/** What the game's ground says over one tile's grid. */
export interface DcsTile {
  /** The real-world layer's move onto the game's, in Web Mercator units (0..1 across the world). */
  shift: [number, number];
  covered: Uint8Array;
  heights: Float32Array;
  sea: Uint8Array;
  /** r, g, b per grid point, 0..1. */
  colours: Float32Array;
  verdict: TileVerdict;
}

/** The game's runway beside the surveyed one: where, and by how much (DCS metres). */
export interface RunwayShift {
  x: number;
  z: number;
  dx: number;
  dz: number;
  airport: string;
  /** Sideways distance, metres, signed. */
  lateral: number;
  /** Along the runway (low end toward high), metres, signed: how far the game's ends lie past the surveyed ones. */
  along?: number;
}

/** Height a coast is told at: land on one side above it, sea on the other at or below a metre. */
const COAST_LAND = 5;
/** A shift reaches this far from its runway, fading with distance. */
const SHIFT_REACH = 60_000;

/**
 * Where the tile's judgement passes: the coast differing at few points, the
 * relief alike. A tile whose ground is level with the real one up to a
 * constant (a datum, or the game's survey) agrees: its imagery is draped on
 * the game's heights anyway. What tells a moved ridge or valley is the
 * spread of the difference once that constant is taken off. The tolerance grows with the grid's spacing, since a coarse
 * tile samples a ridge or a valley at different points of each terrain.
 */
export function judge(real: Float32Array, game: Float32Array, sea: Uint8Array, covered: Uint8Array, cellMetres: number): TileVerdict {
  const diffs: number[] = [];
  let n = 0;
  let coast = 0;
  for (let k = 0; k < covered.length; k++) {
    if (!covered[k]) continue;
    n++;
    const gameLand = !sea[k] && game[k] > COAST_LAND;
    const gameSea = !!sea[k];
    if ((gameSea && real[k] > COAST_LAND) || (gameLand && real[k] <= 1)) coast++;
    if (!gameSea) diffs.push(real[k] - game[k]);
  }
  const q = (a: number[], f: number) => (a.length ? a[Math.min(a.length - 1, Math.floor(f * a.length))] : 0);
  diffs.sort((a, b) => a - b);
  const bias = q(diffs, 0.5);
  const spread = diffs.map((d) => Math.abs(d - bias)).sort((a, b) => a - b);
  const median = q(spread, 0.5);
  const p90 = q(spread, 0.9);
  const share = n ? coast / n : 0;
  const agree = share <= 0.02 && median <= Math.max(25, cellMetres * 0.15) && p90 <= Math.max(60, cellMetres * 0.4);
  return { covered: n, agree, bias, median, p90, coast: share };
}

/** Numbers per runway triangle in findShifts: its middle x, z, its area, its corners' x, z. */
const CENT = 9;
/** Steps along a runway, and the margin before and after its surveyed ends, metres. */
const ALONG_STEP = 10;
const ALONG_MARGIN = 600;

/**
 * How far the game's runway lies along the surveyed one (see findShifts):
 * `cents` holds each runway-coloured triangle's middle x, z, its area and
 * its corners' x, z; the strip from `s0` to `s1` metres beside the surveyed
 * axis (the low end at `ax`, `az`, `len` long) is the game's runway.
 */
export function alongOffset(
  cents: number[],
  ax: number,
  az: number,
  ux: number,
  uz: number,
  nx: number,
  nz: number,
  len: number,
  s0: number,
  s1: number,
  width: number,
): number {
  const n = Math.ceil((len + 2 * ALONG_MARGIN) / ALONG_STEP);
  const bins = new Float64Array(n);
  for (let k = 0; k < cents.length; k += CENT) {
    const side = (cents[k] - ax) * nx + (cents[k + 1] - az) * nz;
    if (side < s0 || side >= s1) continue;
    let a0 = Infinity;
    let a1 = -Infinity;
    for (let v = 3; v < 9; v += 2) {
      const al = (cents[k + v] - ax) * ux + (cents[k + v + 1] - az) * uz + ALONG_MARGIN;
      a0 = Math.min(a0, al);
      a1 = Math.max(a1, al);
    }
    const area = cents[k + 2];
    if (!(a1 > a0)) {
      const i = Math.floor(a0 / ALONG_STEP);
      if (i >= 0 && i < n) bins[i] += area;
      continue;
    }
    for (let i = Math.max(0, Math.floor(a0 / ALONG_STEP)); i <= Math.min(n - 1, Math.floor(a1 / ALONG_STEP)); i++) {
      const over = Math.min(a1, (i + 1) * ALONG_STEP) - Math.max(a0, i * ALONG_STEP);
      if (over > 0) bins[i] += (area * over) / (a1 - a0);
    }
  }
  const full = (i: number) => bins[i] >= 0.5 * ALONG_STEP * Math.min(width, s1 - s0);
  const mid = Math.floor((len / 2 + ALONG_MARGIN) / ALONG_STEP);
  if (!full(mid)) return 0;
  let lo = mid;
  let hi = mid;
  while (lo > 0 && full(lo - 1)) lo--;
  while (hi < n - 1 && full(hi + 1)) hi++;
  const loEnd = lo > 1 ? lo * ALONG_STEP - ALONG_MARGIN : null;
  const hiEnd = hi < n - 2 ? (hi + 1) * ALONG_STEP - ALONG_MARGIN - len : null;
  if (loEnd === null && hiEnd === null) return 0;
  return loEnd === null ? hiEnd! : hiEnd === null ? loEnd : (loEnd + hiEnd) / 2;
}

export class DcsGround {
  readonly proj: DcsProjection;
  private pos: Float32Array;
  private col: Uint8Array | null;
  /** All triangles, land first; `landCount` of them are land. */
  private tris: Uint32Array;
  private landCount: number;
  private x0 = 0;
  private z0 = 0;
  private cell = 1;
  private nx = 0;
  private nz = 0;
  private start: Uint32Array = new Uint32Array(1);
  private ids: Uint32Array = new Uint32Array(0);
  /** Runway shifts found so far; null until the surveyed runways were read. */
  shifts: RunwayShift[] | null = null;
  /** The game's buildings (BUILDING_STRIDE floats each), and a grid of them by x and z. */
  readonly buildings: Float32Array;
  private bCell = 500;
  private bGrid = new Map<number, number[]>();

  constructor(d: DcsGroundData) {
    const proj = DCS_PROJECTIONS[d.theatre];
    if (!proj) throw new Error(`unknown DCS theatre ${d.theatre}`);
    this.proj = proj;
    this.pos = d.positions;
    this.col = d.colours;
    this.tris = new Uint32Array(d.ground.length + d.water.length);
    this.tris.set(d.ground);
    this.tris.set(d.water, d.ground.length);
    this.landCount = d.ground.length / 3;
    this.index();
    this.buildings = d.buildings ?? new Float32Array(0);
    for (let i = 0; i < this.buildings.length / BUILDING_STRIDE; i++) {
      const k = this.bKey(Math.floor(this.buildings[i * BUILDING_STRIDE] / this.bCell), Math.floor(this.buildings[i * BUILDING_STRIDE + 1] / this.bCell));
      const list = this.bGrid.get(k);
      if (list) list.push(i);
      else this.bGrid.set(k, [i]);
    }
  }

  private bKey(a: number, b: number): number {
    return (a + 100_000) * 200_000 + (b + 100_000);
  }

  /** The buildings whose middle lies in the DCS box (x0..x1, z0..z1), by index. */
  buildingsIn(x0: number, z0: number, x1: number, z1: number): number[] {
    const out: number[] = [];
    if (!this.buildings.length) return out;
    const c = this.bCell;
    const B = this.buildings;
    for (let a = Math.floor(x0 / c); a <= Math.floor(x1 / c); a++) {
      for (let b = Math.floor(z0 / c); b <= Math.floor(z1 / c); b++) {
        for (const i of this.bGrid.get(this.bKey(a, b)) ?? []) {
          const x = B[i * BUILDING_STRIDE];
          const z = B[i * BUILDING_STRIDE + 1];
          if (x >= x0 && x <= x1 && z >= z0 && z <= z1) out.push(i);
        }
      }
    }
    return out;
  }

  /** A uniform grid over x and z listing the triangles touching each cell. */
  private index(): void {
    const p = this.pos;
    const t = this.tris;
    const count = t.length / 3;
    if (!count) return;
    let x0 = Infinity;
    let z0 = Infinity;
    let x1 = -Infinity;
    let z1 = -Infinity;
    for (let i = 0; i < p.length; i += 3) {
      x0 = Math.min(x0, p[i]);
      x1 = Math.max(x1, p[i]);
      z0 = Math.min(z0, p[i + 2]);
      z1 = Math.max(z1, p[i + 2]);
    }
    // About two triangles to a cell on average, never finer than 20 m.
    const cell = Math.max(20, Math.sqrt(((x1 - x0) * (z1 - z0)) / Math.max(1, count / 2)));
    const nx = Math.max(1, Math.ceil((x1 - x0) / cell) + 1);
    const nz = Math.max(1, Math.ceil((z1 - z0) / cell) + 1);
    Object.assign(this, { x0, z0, cell, nx, nz });
    const span = (i: number) => {
      const a = t[i * 3] * 3;
      const b = t[i * 3 + 1] * 3;
      const c = t[i * 3 + 2] * 3;
      return [
        Math.floor((Math.min(p[a], p[b], p[c]) - x0) / cell),
        Math.floor((Math.max(p[a], p[b], p[c]) - x0) / cell),
        Math.floor((Math.min(p[a + 2], p[b + 2], p[c + 2]) - z0) / cell),
        Math.floor((Math.max(p[a + 2], p[b + 2], p[c + 2]) - z0) / cell),
      ];
    };
    const counts = new Uint32Array(nx * nz + 1);
    for (let i = 0; i < count; i++) {
      const [i0, i1, j0, j1] = span(i);
      for (let a = i0; a <= i1; a++) for (let b = j0; b <= j1; b++) counts[a * nz + b + 1]++;
    }
    for (let k = 1; k < counts.length; k++) counts[k] += counts[k - 1];
    const ids = new Uint32Array(counts[counts.length - 1]);
    const fill = counts.slice(0, -1);
    for (let i = 0; i < count; i++) {
      const [i0, i1, j0, j1] = span(i);
      for (let a = i0; a <= i1; a++) for (let b = j0; b <= j1; b++) ids[fill[a * nz + b]++] = i;
    }
    this.start = counts;
    this.ids = ids;
  }

  /** The ground at DCS (x, z), or null where the level does not reach. */
  at(x: number, z: number): DcsSample | null {
    const a = Math.floor((x - this.x0) / this.cell);
    const b = Math.floor((z - this.z0) / this.cell);
    if (a < 0 || b < 0 || a >= this.nx || b >= this.nz) return null;
    const p = this.pos;
    const t = this.tris;
    const k = a * this.nz + b;
    for (let s = this.start[k]; s < this.start[k + 1]; s++) {
      const i = this.ids[s];
      const ia = t[i * 3];
      const ib = t[i * 3 + 1];
      const ic = t[i * 3 + 2];
      const ax = p[ia * 3];
      const az = p[ia * 3 + 2];
      const bx = p[ib * 3];
      const bz = p[ib * 3 + 2];
      const cx = p[ic * 3];
      const cz = p[ic * 3 + 2];
      const d = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz);
      if (d === 0) continue;
      const l1 = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / d;
      const l2 = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / d;
      const l3 = 1 - l1 - l2;
      const e = -1e-6;
      if (l1 < e || l2 < e || l3 < e) continue;
      const h = l1 * p[ia * 3 + 1] + l2 * p[ib * 3 + 1] + l3 * p[ic * 3 + 1];
      const sea = i >= this.landCount;
      let rgb: [number, number, number] = [SEA_RGB[0], SEA_RGB[1], SEA_RGB[2]];
      const c = this.col;
      if (c && !sea) {
        rgb = [0, 1, 2].map((j) => (l1 * c[ia * 3 + j] + l2 * c[ib * 3 + j] + l3 * c[ic * 3 + j]) / 255) as [number, number, number];
      }
      return { h, sea, rgb };
    }
    return null;
  }

  /** The ground under a latitude and longitude. */
  atLatLon(lat: number, lon: number): DcsSample | null {
    const p = toDcs(this.proj, lat, lon);
    return this.at(p.x, p.z);
  }

  /** Whether the triangle is drawn as runway (its first vertex's colour). */
  private isRunway(i: number): boolean {
    const c = this.col;
    if (!c || i >= this.landCount) return false;
    const v = this.tris[i * 3] * 3;
    return Math.abs(c[v] - RUNWAY_RGB[0]) <= 3 && Math.abs(c[v + 1] - RUNWAY_RGB[1]) <= 3 && Math.abs(c[v + 2] - RUNWAY_RGB[2]) <= 3;
  }

  /**
   * The game's runway beside each surveyed runway the level reaches: the
   * runway-coloured ground along the middle of the surveyed one, its
   * area summed in 5 m strips across it, and the runway's width of strips
   * holding most of it taken as the game's runway. Taxiways and aprons
   * beside it are narrower or shorter and lose to the runway itself.
   *
   * Along the runway, the same strips are summed in 10 m steps from 600 m
   * before its low end to 600 m past its high end, each triangle's area
   * spread over the stretch it spans (the game draws a runway in triangles
   * hundreds of metres long); the run of steps mostly
   * covered that holds the runway's middle is the game's runway, and its
   * ends against the surveyed ones tell how far it lies along. An end that
   * runs on into the margin (a taxiway carrying on, an apron) tells
   * nothing; with both such, the runway is moved sideways only.
   */
  findShifts(runways: Runway[]): RunwayShift[] {
    const out: RunwayShift[] = [];
    const p = this.pos;
    const t = this.tris;
    const cents: number[] = [];
    for (let i = 0; i < this.landCount; i++) {
      if (!this.isRunway(i)) continue;
      const a = t[i * 3] * 3;
      const b = t[i * 3 + 1] * 3;
      const c = t[i * 3 + 2] * 3;
      const area = Math.abs((p[b] - p[a]) * (p[c + 2] - p[a + 2]) - (p[c] - p[a]) * (p[b + 2] - p[a + 2])) / 2;
      cents.push((p[a] + p[b] + p[c]) / 3, (p[a + 2] + p[b + 2] + p[c + 2]) / 3, area, p[a], p[a + 2], p[b], p[b + 2], p[c], p[c + 2]);
    }
    if (!cents.length) return out;
    const BIN = 5;
    const REACH = 250;
    for (const r of runways) {
      const a = toDcs(this.proj, r.le[0], r.le[1]);
      const b = toDcs(this.proj, r.he[0], r.he[1]);
      const len = Math.hypot(b.x - a.x, b.z - a.z);
      if (!(len > 300)) continue;
      const ux = (b.x - a.x) / len;
      const uz = (b.z - a.z) / len;
      const nx = -uz;
      const nz = ux;
      const bins = new Float64Array((2 * REACH) / BIN);
      for (let k = 0; k < cents.length; k += CENT) {
        const rx = cents[k] - a.x;
        const rz = cents[k + 1] - a.z;
        const along = rx * ux + rz * uz;
        if (along < len * 0.15 || along > len * 0.85) continue;
        const side = rx * nx + rz * nz;
        if (side <= -REACH || side >= REACH) continue;
        bins[Math.floor((side + REACH) / BIN)] += cents[k + 2];
      }
      const w = Math.max(2, Math.round(Math.max(30, r.width) / BIN));
      let best = -1;
      let bestSum = 0;
      for (let s = 0; s + w <= bins.length; s++) {
        let sum = 0;
        for (let j = s; j < s + w; j++) sum += bins[j];
        if (sum > bestSum) {
          bestSum = sum;
          best = s;
        }
      }
      // Most of a runway's middle seven tenths, else it is not there.
      if (best < 0 || bestSum < len * 0.7 * Math.max(30, r.width) * 0.3) continue;
      let m = 0;
      for (let j = best; j < best + w; j++) m += bins[j] * ((j + 0.5) * BIN - REACH);
      const lateral = m / bestSum;
      const along = alongOffset(cents, a.x, a.z, ux, uz, nx, nz, len, best * BIN - REACH, (best + w) * BIN - REACH, Math.max(20, r.width));
      out.push({
        x: (a.x + b.x) / 2,
        z: (a.z + b.z) / 2,
        dx: nx * lateral + ux * along,
        dz: nz * lateral + uz * along,
        airport: r.airport,
        lateral,
        along,
      });
    }
    return out;
  }

  /** The shift at DCS (x, z): the runways' shifts weighed by closeness, fading to none at SHIFT_REACH. */
  shiftAt(x: number, z: number): { dx: number; dz: number } {
    const s = this.shifts;
    if (!s?.length) return { dx: 0, dz: 0 };
    let wsum = 0;
    let dx = 0;
    let dz = 0;
    let near = Infinity;
    for (const r of s) {
      const d = Math.hypot(r.x - x, r.z - z);
      near = Math.min(near, d);
      const w = 1 / Math.max(1, d) ** 2;
      wsum += w;
      dx += r.dx * w;
      dz += r.dz * w;
    }
    const fade = Math.max(0, 1 - near / SHIFT_REACH);
    if (!fade) return { dx: 0, dz: 0 };
    return { dx: (dx / wsum) * fade, dz: (dz / wsum) * fade };
  }

  /**
   * One tile's grid (`grid` points a side, `step` tile pixels apart from
   * pixel (px0, py0), `S` pixels across the world) against the game's
   * ground: the shift for the tile, the game's ground at each point moved by
   * it, and the verdict against the real heights.
   */
  forTile(px0: number, py0: number, step: number, grid: number, S: number, real: Float32Array, cellMetres: number): DcsTile | null {
    const n = grid * grid;
    const covered = new Uint8Array(n);
    const heights = new Float32Array(n);
    const sea = new Uint8Array(n);
    const colours = new Float32Array(n * 3);
    // The shift at the tile's middle, as a move in latitude and longitude.
    const mid = (grid - 1) / 2;
    const cLat = myToLat((py0 + mid * step) / S);
    const cLon = mxToLon((px0 + mid * step) / S);
    const c = toDcs(this.proj, cLat, cLon);
    const sh = this.shiftAt(c.x, c.z);
    const [sLat, sLon] = fromDcs(this.proj, c.x + sh.dx, c.z + sh.dz);
    const shift: [number, number] = [(sLon - cLon) / 360, latToMy(sLat) - latToMy(cLat)];
    let any = 0;
    for (let j = 0; j < grid; j++) {
      for (let i = 0; i < grid; i++) {
        const k = j * grid + i;
        const s = this.atLatLon(myToLat((py0 + j * step) / S + shift[1]), mxToLon((px0 + i * step) / S + shift[0]));
        if (!s) continue;
        any++;
        covered[k] = 1;
        heights[k] = s.sea ? 0 : s.h;
        sea[k] = s.sea ? 1 : 0;
        colours.set(s.rgb, k * 3);
      }
    }
    if (!any) return null;
    return { shift, covered, heights, sea, colours, verdict: judge(real, heights, sea, covered, cellMetres) };
  }
}
