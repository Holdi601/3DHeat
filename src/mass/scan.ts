/**
 * Places that stand out over many matches without standing out in the
 * picture (Stage B, docs/mass-analysis.md): a large area busy as a whole with
 * no hot cell in it, an unusual kill-death ratio on few events, a corridor, a
 * height band, a cluster that is there only in one part of the match.
 *
 * The matches' summary grids are read twice, a match at a time (memory holds
 * sums on a raster of at most `SCAN_CELLS` a side, never the matches):
 *
 * 1. Every measure - an event's rate per second of presence (all units, a
 *    class, a height band), the share of kills in kills and deaths (all, a
 *    side, a band) - is summed per raster cell as observed `O`, expected `E`
 *    and its null variance `V`. The expectation is each match's own rate
 *    spread over its own presence there (stratified by match, as a covariate
 *    adjusted Kulldorff scan), so a few bloody matches or a busy server make
 *    no place. How much matches disagree beyond Poisson - the overdispersion
 *    `phi` - is measured from each match's residuals in blocks of 1 to 16
 *    cells and every test is a quasi-likelihood one: a region of any shape is
 *    tested at the dispersion of its size.
 * 2. The scan: circles of 1 to 18 cells, ellipses at six angles, three and
 *    six times as long as wide (corridors), zones grown cell by cell from the
 *    local Getis-Ord Gi* peaks (irregular shapes), the same over each height
 *    band, and space-time cylinders (a circle in one or two fifths of the
 *    match length, against the match's own spread of events in time and
 *    space). p from the quasi-likelihood ratio; the false discovery rate over
 *    every region tried, on every map (`placeFdr`).
 * 3. What is kept is pruned to non-overlapping regions, given its rate ratio
 *    shrunk by empirical Bayes (a gamma prior fitted to the map), an interval,
 *    Gi* and local Moran at its centre, and a visual obviousness: how much the
 *    region already shows in the plain heat (contrast with its ring, a bright
 *    peak carrying the excess). Significant and not obvious is `hidden`.
 * 4. The second read (`stability`) counts the matches that saw the region and
 *    those in which it held, and the rate ratio in five folds of the matches.
 */

import { VEHICLE_CLASSES } from '../data/canonical';
import { pow2At } from './summarize';
import { BANDS, GRID_KINDS, HEIGHT_EDGES, type SummaryGrid } from './types';

/** Raster cells a side at most for the scan, and for the space-time scan. */
export const SCAN_CELLS = 64;
export const ST_CELLS = 16;
/** Parts of the match length the space-time scan takes. */
export const ST_BINS = 5;
export const PLACE_FDR = 0.05;
/** Kept a map at most, after pruning. */
export const PLACE_MAX = 40;
/** Matches a place's drill-down loads at most: those where it held the most. */
export const DRILL_MAX = 60;
/** Visual obviousness under which a significant place is hidden. */
export const HIDDEN_BELOW = 0.35;
/** Fewest matches a measure needs on a map. */
const MIN_MATCHES = 8;
/** Dispersion levels: blocks of 1, 2, 4, 8, 16 cells a side. */
const LEVELS = 5;
const FOLDS = 5;
/** |z| a region needs to be kept as a candidate (p < 0.012); the rest only count as tests. */
const Z_KEEP = 2.5;
const CAND_MAX = 400;
const TT = 8;
const C = VEHICLE_CLASSES.length;
const GK = GRID_KINDS.length;
const gk = (k: (typeof GRID_KINDS)[number]) => GRID_KINDS.indexOf(k);

/** The events scanned; a death is any of `death`, `destroyed`, `crash` (once). */
export const EVK = ['kill', 'death', 'hit', 'launch', 'capture'] as const;
const EVK_OF = new Int8Array(GK).fill(-1);
EVK_OF[gk('kill')] = 0;
for (const k of ['death', 'destroyed', 'crash'] as const) EVK_OF[gk(k)] = 1;
EVK_OF[gk('hit')] = 2;
EVK_OF[gk('launch')] = 3;
EVK_OF[gk('capture')] = 4;

// Channels of one match on the raster: presence (all, by team, class, band), events, kills and deaths by team, class, band, height.
const CH_P = 0;
const CH_PT = 1;
const CH_PC = CH_PT + TT;
const CH_PB = CH_PC + C;
const CH_EV = CH_PB + BANDS;
const CH_KT = CH_EV + EVK.length;
const CH_DT = CH_KT + TT;
const CH_KC = CH_DT + TT;
const CH_DC = CH_KC + C;
const CH_KB = CH_DC + C;
const CH_DB = CH_KB + BANDS;
const CH_Y = CH_DB + BANDS;
/** Spawns, take-offs and landings: where they gather is a base (a spawn, an airfield). */
const CH_TL = CH_Y + 1;
const CH = CH_TL + 1;
const TAKEOFF = gk('takeoff');
const LANDING = gk('landing');
const SPAWN = gk('spawn');

export interface PlaceMatch {
  /** The match's index in the store (what the drill-down loads). */
  i: number;
  grid: SummaryGrid;
  /** Team names of the grid's slots. */
  teams: string[];
  /** Seconds. */
  duration: number;
}

/** What to scan on a map: the events, classes and sides with enough of them (from the heads), and whether by height band. */
export interface PlacePlan {
  events: string[];
  classes: string[];
  teams: string[];
  bands: boolean;
}

export interface ScanFrame {
  x0: number;
  z0: number;
  cell: number;
  nx: number;
  nz: number;
}

export interface PlaceMeasure {
  id: string;
  type: 'rate' | 'share';
  /** `EVK` name, or `kd` for the share of kills. */
  event: string;
  cls?: string;
  team?: string;
  band?: number;
  o: number;
  x: number;
  x2: number;
}

export type PlaceShape = 'circle' | 'corridor' | 'zone' | 'band' | 'time';

/** A place found: its region, the numbers, how visible it already is, how stable. */
export interface PlaceFinding {
  id: string;
  map: string;
  measure: string;
  type: 'rate' | 'share';
  event: string;
  cls?: string;
  team?: string;
  /** Height band index (`HEIGHT_EDGES`, or the data's floor), and its world heights. */
  band?: number;
  bandBy?: 'height' | 'floor';
  bandY?: [number, number];
  /** Fractions of the match length (space-time). */
  phase?: [number, number];
  dir: 1 | -1;
  shape: PlaceShape;
  /** World: centre, mean height of the presence, a radius that holds it. */
  x: number;
  y: number;
  z: number;
  radius: number;
  /** Ellipse: semi-axes and angle (radians from +x towards +z), world units. */
  ellipse?: { a: number; b: number; angle: number };
  /** The outline as flat segments `[x1, z1, x2, z2, ...]`, world units. */
  segs: number[];
  /** A corridor's axis `[x, z]` points. */
  path?: [number, number][];
  cells: number;
  cell: number;
  /** A grown zone's counts and test are the half of the matches it was not grown on. */
  heldOut?: boolean;
  /** Observed, expected, trials (shares) and exposure (seconds of presence, or kills + deaths). */
  observed: number;
  expected: number;
  trials: number;
  exposure: number;
  /** Rate (or odds) ratio: raw, shrunk by empirical Bayes, ~95% interval. */
  ratio: number;
  shrunk: number;
  lo: number;
  hi: number;
  /** Signed quasi-likelihood z of the region. */
  zScore: number;
  p: number;
  q: number;
  phi: number;
  gi: [number, number, number];
  moran: number;
  /** 0..1, how much the region already shows in the plain heat; `hidden` below `HIDDEN_BELOW`. */
  obviousness: number;
  hidden: boolean;
  /** Share of the excess in its one strongest cell (1: a point, low: spread). */
  peakShare: number;
  stability: {
    seen: number;
    withEvents: number;
    held: number;
    folds: number;
    foldsAgree: number;
  };
  /** Matches where it held, the most first (at most `DRILL_MAX`). */
  matches: number[];
  /** Rank: strength, less what is already obvious, more when the folds agree. */
  score: number;
}

/** The raster for a map's matches: their robust extents' 2nd to 98th percentiles, aligned powers of two. */
export function scanFrame(extents: ([number, number, number, number] | null)[], cells = SCAN_CELLS): ScanFrame | null {
  const ex = extents.filter((e): e is [number, number, number, number] => !!e && e.every(Number.isFinite));
  if (!ex.length) return null;
  const q = (k: number, f: number) => {
    const v = ex.map((e) => e[k]).sort((a, b) => a - b);
    return v[Math.max(0, Math.min(v.length - 1, Math.round(f * (v.length - 1))))];
  };
  const lo = ex.length >= 20 ? 0.02 : 0;
  const minX = q(0, lo),
    minZ = q(1, lo),
    maxX = q(2, 1 - lo),
    maxZ = q(3, 1 - lo);
  const span = Math.max(maxX - minX, maxZ - minZ);
  if (!(span > 0)) return null;
  const cell = pow2At(span / cells);
  const x0 = Math.floor(minX / cell) * cell;
  const z0 = Math.floor(minZ / cell) * cell;
  return {
    x0,
    z0,
    cell,
    nx: Math.max(1, Math.min(cells + 1, Math.ceil((maxX - x0) / cell))),
    nz: Math.max(1, Math.min(cells + 1, Math.ceil((maxZ - z0) / cell))),
  };
}

export function measuresOf(plan: PlacePlan): PlaceMeasure[] {
  const out: PlaceMeasure[] = [];
  const ev = (e: string) => EVK.indexOf(e as (typeof EVK)[number]);
  for (const e of plan.events)
    if (ev(e) >= 0)
      out.push({
        id: `rate:${e}`,
        type: 'rate',
        event: e,
        o: CH_EV + ev(e),
        x: CH_P,
        x2: -1,
      });
  const kd = plan.events.includes('kill') && plan.events.includes('death');
  if (kd)
    out.push({
      id: 'share:kd',
      type: 'share',
      event: 'kd',
      o: CH_EV,
      x: CH_EV,
      x2: CH_EV + 1,
    });
  if (kd)
    plan.teams.slice(0, TT - 1).forEach((t, s) =>
      out.push({
        id: `share:kd:t:${t}`,
        type: 'share',
        event: 'kd',
        team: t,
        o: CH_KT + s,
        x: CH_KT + s,
        x2: CH_DT + s,
      }),
    );
  for (const name of plan.classes) {
    const c = VEHICLE_CLASSES.indexOf(name as (typeof VEHICLE_CLASSES)[number]);
    if (c < 0) continue;
    if (plan.events.includes('death'))
      out.push({
        id: `rate:death:c:${name}`,
        type: 'rate',
        event: 'death',
        cls: name,
        o: CH_DC + c,
        x: CH_PC + c,
        x2: -1,
      });
    if (plan.events.includes('kill'))
      out.push({
        id: `rate:kill:c:${name}`,
        type: 'rate',
        event: 'kill',
        cls: name,
        o: CH_KC + c,
        x: CH_PC + c,
        x2: -1,
      });
  }
  if (plan.bands && kd)
    for (let b = 0; b < BANDS; b++) {
      out.push({
        id: `rate:death:b:${b}`,
        type: 'rate',
        event: 'death',
        band: b,
        o: CH_DB + b,
        x: CH_PB + b,
        x2: -1,
      });
      out.push({
        id: `share:kd:b:${b}`,
        type: 'share',
        event: 'kd',
        band: b,
        o: CH_KB + b,
        x: CH_KB + b,
        x2: CH_DB + b,
      });
    }
  return out;
}

// ---------------------------------------------------------------------------
// Statistics

/** Complementary error function (Numerical Recipes erfcc, relative error < 1.2e-7). */
export function erfc(x: number): number {
  const z = Math.abs(x);
  const t = 1 / (1 + 0.5 * z);
  const r =
    t *
    Math.exp(
      -z * z -
        1.26551223 +
        t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))),
    );
  return x >= 0 ? r : 2 - r;
}

/** Two-sided p of a z. */
export const pOfZ = (z: number) => Math.min(1, erfc(Math.abs(z) / Math.SQRT2));

const xlogy = (x: number, y: number) => (x > 0 ? x * Math.log(y) : 0);

/**
 * Signed quasi-likelihood z of a region: Poisson (rate) or binomial (share)
 * likelihood ratio, divided by the dispersion. For a share the binomial
 * variance at the pooled share is scaled to the stratified one `V`.
 */
export function quasiZ(type: 'rate' | 'share', O: number, E: number, V: number, N: number, phi: number): number {
  if (!(E > 0) || !(V > 0)) return 0;
  let llr: number;
  let disp = phi;
  if (type === 'rate') llr = O > 0 ? O * Math.log(O / E) - (O - E) : E;
  else {
    if (!(N > E) || !(N > 0)) return 0;
    const p0 = E / N;
    const ph = O / N;
    llr = xlogy(O, ph / p0) + xlogy(N - O, (1 - ph) / (1 - p0));
    disp = phi * (V / Math.max(1e-9, N * p0 * (1 - p0)));
  }
  if (!(llr > 0)) return 0;
  return Math.sign(O - E) * Math.sqrt((2 * llr) / Math.max(1e-9, disp));
}

// ---------------------------------------------------------------------------
// Regions

interface Regions {
  n: number;
  /** 0 circle, 1 ellipse. */
  kind: Uint8Array;
  cx: Float32Array;
  cz: Float32Array;
  a: Float32Array;
  b: Float32Array;
  ang: Float32Array;
  s0: Int32Array;
  sn: Int32Array;
  area: Int32Array;
  /** Row, first and last cell, a span. */
  spans: Int16Array;
}

const CIRCLE_R = [0.75, 1.5, 2.2, 3.2, 4.5, 6.5, 9, 13, 18];
const ELLIPSE_A = [3, 5, 8, 12, 18];
const ELLIPSE_ASPECT = [3, 6];
const ANGLES = 6;
const regionCache = new Map<string, Regions>();

/** Circles (and ellipses) on a raster: their cells as row spans, once per raster size. */
function regionsFor(nx: number, nz: number, radii: number[], ellipses: boolean): Regions {
  const key = `${nx}x${nz}|${radii.join(',')}|${ellipses}`;
  const hit = regionCache.get(key);
  if (hit) return hit;
  const kind: number[] = [],
    cxs: number[] = [],
    czs: number[] = [],
    as: number[] = [],
    bs: number[] = [],
    angs: number[] = [],
    s0: number[] = [],
    sn: number[] = [],
    area: number[] = [];
  const spans: number[] = [];
  const add = (k: number, cx: number, cz: number, a: number, b: number, th: number) => {
    const start = spans.length / 3;
    let cells = 0;
    const cos = Math.cos(th),
      sin = Math.sin(th);
    const A = (cos * cos) / (a * a) + (sin * sin) / (b * b);
    const reach = Math.max(a, b);
    for (let z = Math.max(0, Math.floor(cz - reach)); z <= Math.min(nz - 1, Math.ceil(cz + reach)); z++) {
      const dz = z + 0.5 - cz;
      // (dx cos + dz sin)^2 / a^2 + (-dx sin + dz cos)^2 / b^2 <= 1, a quadratic in dx.
      const B = 2 * dz * sin * cos * (1 / (a * a) - 1 / (b * b));
      const Cq = dz * dz * ((sin * sin) / (a * a) + (cos * cos) / (b * b)) - 1;
      const disc = B * B - 4 * A * Cq;
      if (disc < 0) continue;
      const r = Math.sqrt(disc);
      const x0 = Math.max(0, Math.ceil(cx + (-B - r) / (2 * A) - 0.5));
      const x1 = Math.min(nx - 1, Math.floor(cx + (-B + r) / (2 * A) - 0.5));
      if (x1 < x0) continue;
      spans.push(z, x0, x1);
      cells += x1 - x0 + 1;
    }
    if (!cells) {
      spans.length = start * 3;
      return;
    }
    kind.push(k);
    cxs.push(cx);
    czs.push(cz);
    as.push(a);
    bs.push(b);
    angs.push(th);
    s0.push(start);
    sn.push(spans.length / 3 - start);
    area.push(cells);
  };
  for (const r of radii) {
    const step = r < 3 ? 1 : r < 7 ? 2 : 3;
    for (let z = 0; z < nz; z += step) for (let x = 0; x < nx; x += step) add(0, x + 0.5, z + 0.5, r, r, 0);
  }
  if (ellipses)
    for (const a of ELLIPSE_A) {
      if (a > Math.max(nx, nz) * 0.6) continue;
      const step = a <= 5 ? 2 : 3;
      for (const asp of ELLIPSE_ASPECT) {
        const b = Math.max(0.6, a / asp);
        for (let k = 0; k < ANGLES; k++) {
          const th = (k * Math.PI) / ANGLES;
          for (let z = 0; z < nz; z += step) for (let x = 0; x < nx; x += step) add(1, x + 0.5, z + 0.5, a, b, th);
        }
      }
    }
  const r: Regions = {
    n: kind.length,
    kind: Uint8Array.from(kind),
    cx: Float32Array.from(cxs),
    cz: Float32Array.from(czs),
    a: Float32Array.from(as),
    b: Float32Array.from(bs),
    ang: Float32Array.from(angs),
    s0: Int32Array.from(s0),
    sn: Int32Array.from(sn),
    area: Int32Array.from(area),
    spans: Int16Array.from(spans),
  };
  if (regionCache.size > 8) regionCache.clear();
  regionCache.set(key, r);
  return r;
}

function regionCells(R: Regions, k: number, nx: number): Int32Array {
  const out = new Int32Array(R.area[k]);
  let j = 0;
  for (let s = R.s0[k]; s < R.s0[k] + R.sn[k]; s++) {
    const z = R.spans[s * 3];
    for (let x = R.spans[s * 3 + 1]; x <= R.spans[s * 3 + 2]; x++) out[j++] = z * nx + x;
  }
  return out;
}

const rowPrefix = (a: Float64Array, nx: number, nz: number) => {
  const p = new Float64Array((nx + 1) * nz);
  for (let z = 0; z < nz; z++) {
    let s = 0;
    const o = z * (nx + 1);
    for (let x = 0; x < nx; x++) {
      s += a[z * nx + x];
      p[o + x + 1] = s;
    }
  }
  return p;
};

// ---------------------------------------------------------------------------
// The scan

interface Acc {
  O: Float64Array;
  E: Float64Array;
  V: Float64Array;
  X: Float64Array;
  /** The same over half the matches (`half`): zones are grown on it and tested on the other half. */
  OA: Float64Array;
  EA: Float64Array;
  VA: Float64Array;
  XA: Float64Array;
  Q: Float64Array[];
  matches: number;
  /** Whole-map test of a band against the match's other bands. */
  band: {
    O: number;
    E: number;
    V: number;
    N: number;
    X: number;
    Q: number;
    M: number;
    fo: Float64Array;
    fe: Float64Array;
    seen: number;
    held: number;
    heldBy: number[];
  } | null;
}

interface Cand {
  /** Measure index, or -1 for space-time. */
  m: number;
  shape: PlaceShape;
  /** Region index (circles, ellipses) or -1. */
  region: number;
  cells: Int32Array | null;
  O: number;
  E: number;
  V: number;
  N: number;
  X: number;
  z: number;
  p: number;
  q: number;
  pen: number;
  area: number;
  /** Space-time: the event (0 kill, 1 death) and the first and last part. */
  ev?: number;
  w0?: number;
  w1?: number;
  seed?: number;
  /** Tested on the half of the matches it was not grown on: its counts are that half's. */
  heldOut?: boolean;
}

interface Kept extends Cand {
  dir: 1 | -1;
  cellSet: Int32Array;
  /** Stability, filled by the second read. */
  seen: number;
  withEv: number;
  held: number;
  fo: Float64Array;
  fe: Float64Array;
  heldBy: { i: number; x: number }[];
  /** The second read's sums, and the squared residuals by match: the cluster-robust variance. */
  o2: number;
  e2: number;
  v2: number;
  rv: number;
}

const fold = (i: number) => (Math.imul(i + 1, 2654435761) >>> 0) % FOLDS;
/** Which half a match is in for growing zones (0) and testing them (1). */
const half = (i: number) => (Math.imul(i + 7, 0x9e3779b1) >>> 0) >>> 31;

export class PlaceScan {
  readonly map: string;
  readonly fr: ScanFrame;
  readonly measures: PlaceMeasure[];
  private readonly N: number;
  private readonly acc: Acc[];
  private readonly slotOf = new Map<string, number>();
  /** Raw sums for the visual check and for drawing: presence, height times presence, events by kind. */
  private readonly P: Float64Array;
  private readonly YP: Float64Array;
  private readonly RAW: Float64Array[];
  private readonly TL: Float64Array;
  private floorSum = 0;
  private upmSum = 0;
  private heightN = 0;
  private floorN = 0;
  // Space-time: its own coarser raster; [ev (kill, death)][bin][cell].
  readonly st: ScanFrame;
  private readonly stN: number;
  private readonly stO: Float64Array[];
  private readonly stE: Float64Array[];
  private readonly stQ: Float64Array[][];
  private stMatches = 0;
  // A match's raster, reused.
  private readonly buf: Float64Array;
  private readonly mark: Uint8Array;
  private touched: Int32Array;
  private nt = 0;
  private readonly tot = new Float64Array(CH);
  private readonly lvl: Float64Array[];
  private readonly lvlMark: Uint8Array[];
  private readonly lvlT: Int32Array[];
  private readonly lvlNx: number[];
  private readonly stBuf: Float64Array;
  matches = 0;
  skipped = 0;
  tests = 0;
  cands: Cand[] = [];
  private kept: Kept[] = [];
  private phis: Float64Array[] = [];
  private alphas: number[] = [];
  /** Per measure: Gi* at 1, 2 and 4 cells, local Moran at 1. */
  private gis: Float64Array[][] = [];
  private morans: Float64Array[] = [];
  readonly ms: Record<string, number> = { read: 0, scan: 0, stability: 0 };

  constructor(map: string, fr: ScanFrame, plan: PlacePlan) {
    this.map = map;
    this.fr = fr;
    this.measures = measuresOf(plan);
    plan.teams.slice(0, TT - 1).forEach((t, i) => this.slotOf.set(t, i));
    const N = (this.N = fr.nx * fr.nz);
    const level = (L: number) => Math.ceil(fr.nx / 2 ** L) * Math.ceil(fr.nz / 2 ** L);
    this.acc = this.measures.map((m) => ({
      O: new Float64Array(N),
      E: new Float64Array(N),
      V: new Float64Array(N),
      X: new Float64Array(N),
      OA: new Float64Array(N),
      EA: new Float64Array(N),
      VA: new Float64Array(N),
      XA: new Float64Array(N),
      Q: Array.from({ length: LEVELS }, (_, L) => new Float64Array(level(L))),
      matches: 0,
      band:
        m.band !== undefined
          ? {
              O: 0,
              E: 0,
              V: 0,
              N: 0,
              X: 0,
              Q: 0,
              M: 0,
              fo: new Float64Array(FOLDS),
              fe: new Float64Array(FOLDS),
              seen: 0,
              held: 0,
              heldBy: [],
            }
          : null,
    }));
    this.P = new Float64Array(N);
    this.YP = new Float64Array(N);
    this.RAW = EVK.map(() => new Float64Array(N));
    this.TL = new Float64Array(N);
    this.buf = new Float64Array(N * CH);
    this.mark = new Uint8Array(N);
    this.touched = new Int32Array(Math.min(N, 4096));
    this.lvl = Array.from({ length: LEVELS }, (_, L) => new Float64Array(level(L)));
    this.lvlMark = Array.from({ length: LEVELS }, (_, L) => new Uint8Array(level(L)));
    this.lvlT = Array.from({ length: LEVELS }, (_, L) => new Int32Array(level(L)));
    this.lvlNx = Array.from({ length: LEVELS }, (_, L) => Math.ceil(fr.nx / 2 ** L));
    // Space-time raster: the same origin, cells ST_CELLS a side over the same span.
    const stCell = pow2At((Math.max(fr.nx, fr.nz) * fr.cell) / ST_CELLS);
    const sx0 = Math.floor(fr.x0 / stCell) * stCell;
    const sz0 = Math.floor(fr.z0 / stCell) * stCell;
    this.st = {
      x0: sx0,
      z0: sz0,
      cell: stCell,
      nx: Math.ceil((fr.x0 + fr.nx * fr.cell - sx0) / stCell),
      nz: Math.ceil((fr.z0 + fr.nz * fr.cell - sz0) / stCell),
    };
    const SN = (this.stN = this.st.nx * this.st.nz);
    this.stO = [0, 1].map(() => new Float64Array(SN * ST_BINS));
    this.stE = [0, 1].map(() => new Float64Array(SN * ST_BINS));
    this.stQ = [0, 1].map(() => [0, 1, 2].map((L) => new Float64Array(ST_BINS * Math.ceil(this.st.nx / 2 ** L) * Math.ceil(this.st.nz / 2 ** L))));
    this.stBuf = new Float64Array(2 * ST_BINS * SN);
  }

  private slot(name: string): number {
    let s = this.slotOf.get(name);
    if (s === undefined) {
      s = Math.min(TT - 1, this.slotOf.size);
      this.slotOf.set(name, s);
    }
    return s;
  }

  private touch(c: number): void {
    if (this.mark[c]) return;
    this.mark[c] = 1;
    if (this.nt === this.touched.length) {
      const t = new Int32Array(Math.min(this.N, this.touched.length * 2));
      t.set(this.touched);
      this.touched = t;
    }
    this.touched[this.nt++] = c;
  }

  /** A match's grid onto the raster (`buf`, the cells `touched`); false when it does not fit. */
  private raster(g: SummaryGrid, teams: string[]): boolean {
    const fr = this.fr;
    const f = g.cell / fr.cell;
    if (!(f > 0) || f > 16) return false;
    const n = g.ix.length;
    const ix0 = Math.round(fr.x0 / fr.cell);
    const iz0 = Math.round(fr.z0 / fr.cell);
    // Each grid cell's first raster cell, and how many a side it covers.
    const at = new Int32Array(n).fill(-1);
    const ax = new Int32Array(n);
    const az = new Int32Array(n);
    const side = f > 1 ? f : 1;
    for (let i = 0; i < n; i++) {
      const x = (f >= 1 ? g.ix[i] * f : Math.floor(g.ix[i] * f)) - ix0;
      const z = (f >= 1 ? g.iz[i] * f : Math.floor(g.iz[i] * f)) - iz0;
      if (x + side <= 0 || z + side <= 0 || x >= fr.nx || z >= fr.nz) continue;
      at[i] = side === 1 ? z * fr.nx + x : 0;
      ax[i] = x;
      az[i] = z;
      if (side === 1) this.touch(at[i]);
    }
    const buf = this.buf;
    const nx = fr.nx;
    const put = (i: number, ch: number, v: number) => {
      const a = at[i];
      if (a < 0 || !v) return;
      if (side === 1) {
        buf[a * CH + ch] += v;
        return;
      }
      // A coarser grid's cell spread evenly over the raster cells it covers.
      const w = v / (side * side);
      const x0 = ax[i],
        z0 = az[i];
      for (let dz = 0; dz < side; dz++) {
        const z = z0 + dz;
        if (z < 0 || z >= fr.nz) continue;
        for (let dx = 0; dx < side; dx++) {
          const x = x0 + dx;
          if (x < 0 || x >= nx) continue;
          const c = z * nx + x;
          this.touch(c);
          buf[c * CH + ch] += w;
        }
      }
    };
    const T = teams.length;
    const slots = teams.map((t) => this.slot(t));
    for (let i = 0; i < n; i++) {
      const p = g.p[i];
      put(i, CH_P, p);
      put(i, CH_Y, g.y[i] * p);
      for (let t = 0; t < T; t++) put(i, CH_PT + slots[t], g.pt[i * (T + 1) + t] ?? 0);
    }
    for (let q = 0; q + 2 < g.pc.length; q += 3) if (g.pc[q + 1] < C) put(g.pc[q], CH_PC + g.pc[q + 1], g.pc[q + 2]);
    for (let q = 0; q + 2 < g.ph.length; q += 3) if (g.ph[q + 1] < BANDS) put(g.ph[q], CH_PB + g.ph[q + 1], g.ph[q + 2]);
    for (let q = 0; q + 5 < g.e.length; q += 6) {
      const kind = g.e[q + 1];
      if (kind === TAKEOFF || kind === LANDING || kind === SPAWN) put(g.e[q], CH_TL, g.e[q + 5]);
      const ek = EVK_OF[kind];
      if (ek < 0) continue;
      const i = g.e[q],
        t = g.e[q + 2],
        c = g.e[q + 3],
        b = Math.min(BANDS - 1, g.e[q + 4]),
        v = g.e[q + 5];
      put(i, CH_EV + ek, v);
      if (ek > 1) continue;
      const s = t < T ? slots[t] : -1;
      if (ek === 0) {
        if (s >= 0) put(i, CH_KT + s, v);
        if (c < C) put(i, CH_KC + c, v);
        put(i, CH_KB + b, v);
      } else {
        if (s >= 0) put(i, CH_DT + s, v);
        if (c < C) put(i, CH_DC + c, v);
        put(i, CH_DB + b, v);
      }
    }
    return true;
  }

  private clear(): void {
    const buf = this.buf;
    for (let k = 0; k < this.nt; k++) {
      const c = this.touched[k];
      this.mark[c] = 0;
      buf.fill(0, c * CH, c * CH + CH);
    }
    this.nt = 0;
  }

  /** The first read: one match's grid into every measure's sums. */
  add(m: PlaceMatch): void {
    const t0 = performance.now();
    const g = m.grid;
    if (!g || !g.ix.length || !this.raster(g, m.teams)) {
      this.skipped++;
      this.clear();
      return;
    }
    this.matches++;
    const buf = this.buf;
    const tot = this.tot.fill(0);
    for (let k = 0; k < this.nt; k++) {
      const c = this.touched[k];
      const o = c * CH;
      for (let ch = 0; ch < CH; ch++) tot[ch] += buf[o + ch];
      this.P[c] += buf[o + CH_P];
      this.YP[c] += buf[o + CH_Y];
      for (let e = 0; e < EVK.length; e++) this.RAW[e][c] += buf[o + CH_EV + e];
      this.TL[c] += buf[o + CH_TL];
    }
    if (g.bands?.by === 'floor') this.floorN++;
    else if (g.bands) {
      this.floorSum += g.bands.floor;
      this.upmSum += g.bands.unitsPerMetre || 1;
      this.heightN++;
    }
    let bandsK = 0,
      bandsD = 0,
      bandsP = 0;
    for (let b = 0; b < BANDS; b++) {
      bandsK += tot[CH_KB + b];
      bandsD += tot[CH_DB + b];
      bandsP += tot[CH_PB + b];
    }
    const fo = fold(m.i);
    const inA = half(m.i) === 0;
    this.measures.forEach((me, k) => {
      const so = tot[me.o];
      const sx = tot[me.x] + (me.x2 >= 0 ? tot[me.x2] : 0);
      if (!(sx > 0)) return;
      const a = this.acc[k];
      a.matches++;
      const r = so / sx;
      const share = me.type === 'share';
      // A band against the match's other bands, over the whole map.
      if (a.band) {
        const B = a.band;
        const rAll = share ? bandsK / Math.max(1e-9, bandsK + bandsD) : bandsD / Math.max(1e-9, bandsP);
        if (bandsK + bandsD > 0 && (share ? bandsK + bandsD : bandsP) > 0) {
          const e = sx * rAll;
          B.O += so;
          B.E += e;
          B.V += share ? sx * rAll * (1 - rAll) : e;
          B.N += sx;
          B.Q += (so - e) ** 2;
          B.M++;
          B.fo[fo] += so;
          B.fe[fo] += e;
          B.seen++;
          if (so - e > 0) B.heldBy.push(m.i);
        }
      }
      for (let j = 0; j < this.nt; j++) {
        const c = this.touched[j];
        const x = buf[c * CH + me.x] + (me.x2 >= 0 ? buf[c * CH + me.x2] : 0);
        if (!(x > 0)) continue;
        a.X[c] += x;
        if (inA) a.XA[c] += x;
        if (!(so > 0)) continue;
        const o = buf[c * CH + me.o];
        const e = x * r;
        const v = share ? e * (1 - r) : e;
        a.O[c] += o;
        a.E[c] += e;
        a.V[c] += v;
        if (inA) {
          a.OA[c] += o;
          a.EA[c] += e;
          a.VA[c] += v;
        }
        const res = o - e;
        const cx = c % this.fr.nx,
          cz = (c - cx) / this.fr.nx;
        for (let L = 0; L < LEVELS; L++) {
          const bi = (cz >> L) * this.lvlNx[L] + (cx >> L);
          if (!this.lvlMark[L][bi]) {
            this.lvlMark[L][bi] = 1;
            this.lvlT[L][this.lvlCount(L, 1)] = bi;
          }
          this.lvl[L][bi] += res;
        }
      }
      for (let L = 0; L < LEVELS; L++) {
        const n = this.lvlCount(L, 0);
        const Q = a.Q[L];
        for (let j = 0; j < n; j++) {
          const bi = this.lvlT[L][j];
          Q[bi] += this.lvl[L][bi] ** 2;
          this.lvl[L][bi] = 0;
          this.lvlMark[L][bi] = 0;
        }
        this.lvlN[L] = 0;
      }
    });
    this.clear();
    this.addSlices(m);
    this.ms.read += performance.now() - t0;
  }

  private readonly lvlN = new Int32Array(LEVELS);
  /** The level's touched count; `inc` 1 takes the next slot. */
  private lvlCount(L: number, inc: number): number {
    const n = this.lvlN[L];
    this.lvlN[L] += inc;
    return n;
  }

  /** The match's time slices onto the space-time raster, by part of its length, and their expectation. */
  private sliceRaster(m: PlaceMatch): Float64Array | null {
    const ts = m.grid.ts;
    if (!ts || !ts.v.length || !(m.duration > 0)) return null;
    const st = this.st;
    const f = ts.cell / st.cell;
    if (!(f > 0) || f > 16) return null;
    const side = f > 1 ? f : 1;
    const SN = this.stN;
    const buf = this.stBuf.fill(0);
    const minute = ts.minute || 60;
    const ix0 = Math.round(st.x0 / st.cell);
    const iz0 = Math.round(st.z0 / st.cell);
    let any = false;
    for (let q = 0; q + 4 < ts.v.length; q += 5) {
      const ek = ts.v[q + 3] < GK ? EVK_OF[ts.v[q + 3]] : -1;
      if (ek !== 0 && ek !== 1) continue;
      const v = ts.v[q + 4];
      const mi = ts.v[q + 2];
      // The minute's span, the last one holding the rest of the match, spread over the parts it covers.
      const a = mi * minute;
      const b = mi >= 59 ? Math.max(a + minute, m.duration) : (mi + 1) * minute;
      const x = (f >= 1 ? ts.v[q] * f : Math.floor(ts.v[q] * f)) - ix0;
      const z = (f >= 1 ? ts.v[q + 1] * f : Math.floor(ts.v[q + 1] * f)) - iz0;
      for (let w = 0; w < ST_BINS; w++) {
        const w0 = (w * m.duration) / ST_BINS,
          w1 = ((w + 1) * m.duration) / ST_BINS;
        const ov = Math.min(b, w1) - Math.max(a, w0);
        if (ov <= 0) continue;
        const share = (v * ov) / (b - a) / (side * side);
        for (let dz = 0; dz < side; dz++)
          for (let dx = 0; dx < side; dx++) {
            const cx = x + dx,
              cz = z + dz;
            if (cx < 0 || cz < 0 || cx >= st.nx || cz >= st.nz) continue;
            buf[(ek * ST_BINS + w) * SN + cz * st.nx + cx] += share;
            any = true;
          }
      }
    }
    return any ? buf : null;
  }

  private addSlices(m: PlaceMatch): void {
    const buf = this.sliceRaster(m);
    if (!buf) return;
    this.stMatches++;
    const SN = this.stN,
      st = this.st;
    const row = new Float64Array(SN);
    const col = new Float64Array(ST_BINS);
    for (let ek = 0; ek < 2; ek++) {
      row.fill(0);
      col.fill(0);
      let total = 0;
      for (let w = 0; w < ST_BINS; w++)
        for (let c = 0; c < SN; c++) {
          const v = buf[(ek * ST_BINS + w) * SN + c];
          if (!v) continue;
          row[c] += v;
          col[w] += v;
          total += v;
        }
      if (!(total > 0)) continue;
      const O = this.stO[ek],
        E = this.stE[ek];
      const res = [0, 1, 2].map((L) => new Float64Array(ST_BINS * Math.ceil(st.nx / 2 ** L) * Math.ceil(st.nz / 2 ** L)));
      for (let c = 0; c < SN; c++) {
        if (!row[c]) continue;
        const cx = c % st.nx,
          cz = (c - cx) / st.nx;
        for (let w = 0; w < ST_BINS; w++) {
          const o = buf[(ek * ST_BINS + w) * SN + c];
          const e = (row[c] * col[w]) / total;
          O[w * SN + c] += o;
          E[w * SN + c] += e;
          for (let L = 0; L < 3; L++) {
            const lnx = Math.ceil(st.nx / 2 ** L),
              lnz = Math.ceil(st.nz / 2 ** L);
            res[L][w * lnx * lnz + (cz >> L) * lnx + (cx >> L)] += o - e;
          }
        }
      }
      for (let L = 0; L < 3; L++) for (let j = 0; j < res[L].length; j++) if (res[L][j]) this.stQ[ek][L][j] += res[L][j] ** 2;
    }
  }

  // -------------------------------------------------------------------------

  /** Sum of a raster over blocks `2^L` a side. */
  private blocks(a: Float64Array, nx: number, nz: number, L: number): Float64Array {
    const bx = Math.ceil(nx / 2 ** L);
    const out = new Float64Array(bx * Math.ceil(nz / 2 ** L));
    for (let z = 0; z < nz; z++) for (let x = 0; x < nx; x++) out[(z >> L) * bx + (x >> L)] += a[z * nx + x];
    return out;
  }

  /** Overdispersion at each level: residuals' squares over the null variance, pooled over blocks, the worst 5% left out (they may be the places). */
  private dispersion(V: Float64Array, Q: Float64Array[], nx: number, nz: number, levels: number): Float64Array {
    const phi = new Float64Array(levels).fill(1);
    let last = 1;
    for (let L = 0; L < levels; L++) {
      const vb = this.blocks(V, nx, nz, L);
      const rows: [number, number][] = [];
      for (let j = 0; j < vb.length; j++) if (vb[j] >= 1) rows.push([Q[L][j], vb[j]]);
      if (rows.length < 3) {
        phi[L] = last;
        continue;
      }
      rows.sort((a, b) => a[0] / a[1] - b[0] / b[1]);
      const keep = rows.slice(0, Math.max(3, Math.ceil(rows.length * 0.95)));
      let q = 0,
        v = 0;
      for (const [a, b] of keep) {
        q += a;
        v += b;
      }
      phi[L] = last = Math.max(1, q / v, L > 0 ? phi[L - 1] : 1);
    }
    return phi;
  }

  private static phiAt(phi: Float64Array, area: number): number {
    const L = Math.max(0, Math.min(phi.length - 1, Math.round(Math.log2(Math.sqrt(Math.max(1, area))))));
    return phi[L];
  }

  /** Gi* at a square window `d` cells from the centre, and local Moran at 1, on the cells' standardised residuals. */
  private localStats(z: Float64Array, has: Uint8Array): { gi: Float64Array[]; moran: Float64Array } {
    const { nx, nz } = this.fr;
    const W = nx + 1;
    const S = new Float64Array(W * (nz + 1));
    const Nn = new Float64Array(W * (nz + 1));
    let n = 0,
      sum = 0,
      sq = 0;
    for (let y = 0; y < nz; y++)
      for (let x = 0; x < nx; x++) {
        const c = y * nx + x;
        const v = has[c] ? z[c] : 0;
        if (has[c]) {
          n++;
          sum += v;
          sq += v * v;
        }
        S[(y + 1) * W + x + 1] = S[y * W + x + 1] + S[(y + 1) * W + x] - S[y * W + x] + v;
        Nn[(y + 1) * W + x + 1] = Nn[y * W + x + 1] + Nn[(y + 1) * W + x] - Nn[y * W + x] + has[c];
      }
    const mean = n ? sum / n : 0;
    const sd = n > 1 ? Math.sqrt(Math.max(1e-12, sq / n - mean * mean)) : 1;
    const box = (A: Float64Array, x: number, y: number, d: number) => {
      const x0 = Math.max(0, x - d),
        y0 = Math.max(0, y - d),
        x1 = Math.min(nx, x + d + 1),
        y1 = Math.min(nz, y + d + 1);
      return A[y1 * W + x1] - A[y0 * W + x1] - A[y1 * W + x0] + A[y0 * W + x0];
    };
    const gi = [1, 2, 4].map((d) => {
      const out = new Float64Array(nx * nz);
      for (let y = 0; y < nz; y++)
        for (let x = 0; x < nx; x++) {
          const w = box(Nn, x, y, d);
          if (w < 1 || n < 3) continue;
          const den = sd * Math.sqrt(Math.max(1e-12, (n * w - w * w) / (n - 1)));
          out[y * nx + x] = (box(S, x, y, d) - mean * w) / den;
        }
      return out;
    });
    const moran = new Float64Array(nx * nz);
    for (let y = 0; y < nz; y++)
      for (let x = 0; x < nx; x++) {
        const c = y * nx + x;
        if (!has[c]) continue;
        const w = box(Nn, x, y, 1) - 1;
        if (w < 1) continue;
        moran[c] = ((z[c] - mean) / (sd * sd)) * ((box(S, x, y, 1) - z[c] - mean * w) / w);
      }
    return { gi, moran };
  }

  /** The scan over everything the first read summed: candidates with their p (and the tests they count). */
  scan(): void {
    const t0 = performance.now();
    const { nx, nz } = this.fr;
    const N = this.N;
    const R = regionsFor(nx, nz, CIRCLE_R, true);
    this.measures.forEach((me, k) => {
      const a = this.acc[k];
      this.phis[k] = new Float64Array(LEVELS).fill(1);
      this.alphas[k] = 10;
      this.gis[k] = [];
      this.morans[k] = new Float64Array(0);
      let sumO = 0,
        sumE = 0;
      for (let c = 0; c < N; c++) {
        sumO += a.O[c];
        sumE += a.E[c];
      }
      if (a.matches < MIN_MATCHES || sumO + sumE < 20) return;
      const share = me.type === 'share';
      const phi = (this.phis[k] = this.dispersion(a.V, a.Q, nx, nz, LEVELS));
      // Empirical Bayes: the spread of true ratios between 2x2 blocks, beyond what chance and dispersion give.
      {
        const ob = this.blocks(a.O, nx, nz, 1),
          eb = this.blocks(a.E, nx, nz, 1),
          vb = this.blocks(a.V, nx, nz, 1);
        let num = 0,
          den = 0;
        for (let j = 0; j < ob.length; j++)
          if (eb[j] >= 1) {
            num += (ob[j] - eb[j]) ** 2 - phi[1] * vb[j];
            den += eb[j] * eb[j];
          }
        const tau2 = Math.max(0.01, Math.min(4, den > 0 ? num / den : 0.01));
        this.alphas[k] = 1 / tau2;
      }
      const pO = rowPrefix(a.O, nx, nz),
        pE = rowPrefix(a.E, nx, nz),
        pV = rowPrefix(a.V, nx, nz),
        pX = rowPrefix(a.X, nx, nz);
      const W = nx + 1;
      const cands: Cand[] = [];
      const sp = R.spans;
      const minE = share ? 0 : 1;
      for (let r = 0; r < R.n; r++) {
        let O = 0,
          E = 0,
          V = 0,
          X = 0;
        for (let s = R.s0[r], end = s + R.sn[r]; s < end; s++) {
          const b = sp[s * 3] * W;
          const x0 = b + sp[s * 3 + 1],
            x1 = b + sp[s * 3 + 2] + 1;
          O += pO[x1] - pO[x0];
          E += pE[x1] - pE[x0];
          V += pV[x1] - pV[x0];
          X += pX[x1] - pX[x0];
        }
        if (E < minE || O + E < 4 || (share && X < 8)) continue;
        this.tests++;
        const z = quasiZ(me.type, O, E, V, X, PlaceScan.phiAt(phi, R.area[r]));
        if (Math.abs(z) < Z_KEEP) continue;
        const asp = R.kind[r] ? R.a[r] / R.b[r] : 1;
        cands.push({
          m: k,
          shape: R.kind[r] ? 'corridor' : 'circle',
          region: r,
          cells: null,
          O,
          E,
          V,
          N: X,
          X,
          z,
          p: pOfZ(z),
          q: 1,
          pen: Math.sqrt((4 * asp) / (1 + asp) ** 2),
          area: R.area[r],
        });
      }
      // Local statistics on the cells, and zones grown from their peaks.
      const zc = new Float64Array(N);
      const has = new Uint8Array(N);
      for (let c = 0; c < N; c++)
        if (a.V[c] > 0) {
          has[c] = 1;
          zc[c] = (a.O[c] - a.E[c]) / Math.sqrt(phi[0] * a.V[c]);
        }
      const ls = this.localStats(zc, has);
      this.gis[k] = ls.gi;
      this.morans[k] = ls.moran;
      // Zones: grown on half the matches, from that half's own Gi* peaks, and tested on the other half.
      const za = new Float64Array(N);
      const hasA = new Uint8Array(N);
      for (let c = 0; c < N; c++)
        if (a.VA[c] > 0) {
          hasA[c] = 1;
          za[c] = (a.OA[c] - a.EA[c]) / Math.sqrt(phi[0] * a.VA[c]);
        }
      cands.push(...this.grow(k, this.localStats(za, hasA).gi[1], hasA));
      cands.sort((x, y) => Math.abs(y.z) - Math.abs(x.z));
      this.cands.push(...cands.slice(0, CAND_MAX));
      // A height band over the whole map.
      const B = a.band;
      if (B && B.M >= MIN_MATCHES && B.O + B.E >= 20) {
        this.tests++;
        const robust = B.Q > 0 ? B.Q : B.V;
        const zz = (B.O - B.E) / Math.sqrt(Math.max(robust, B.V, 1e-9));
        this.cands.push({
          m: k,
          shape: 'band',
          region: -1,
          cells: null,
          O: B.O,
          E: B.E,
          V: B.V,
          N: B.N,
          X: B.N,
          z: zz,
          p: pOfZ(zz),
          q: 1,
          pen: 1,
          area: N,
        });
      }
    });
    this.scanSlices();
    this.ms.scan += performance.now() - t0;
  }

  /** Zones grown greedily from the strongest Gi* cells, a neighbour at a time while the region's z grows. */
  private grow(k: number, gi: Float64Array, has: Uint8Array): Cand[] {
    const full = this.acc[k];
    const a = { O: full.OA, E: full.EA, V: full.VA, X: full.XA };
    const me = this.measures[k];
    const { nx, nz } = this.fr;
    const phi = this.phis[k];
    const seeds: { c: number; dir: number }[] = [];
    for (const dir of [1, -1]) {
      const order: number[] = [];
      for (let c = 0; c < gi.length; c++) if (has[c] && dir * gi[c] > 2.5) order.push(c);
      order.sort((x, y) => dir * gi[y] - dir * gi[x]);
      // Seeds apart from each other: a strong peak's neighbours would grow the same zone.
      const taken: number[] = [];
      for (const c of order) {
        if (taken.length >= 8) break;
        const x = c % nx,
          z = (c - x) / nx;
        if (taken.some((t) => Math.abs((t % nx) - x) <= 3 && Math.abs((t - (t % nx)) / nx - z) <= 3)) continue;
        taken.push(c);
        seeds.push({ c, dir });
      }
    }
    const out: Cand[] = [];
    const inR = new Uint8Array(nx * nz);
    const share = me.type === 'share';
    for (const { c: seed, dir } of seeds) {
      inR.fill(0);
      const members = [seed];
      inR[seed] = 1;
      let O = a.O[seed],
        E = a.E[seed],
        V = a.V[seed],
        X = a.X[seed];
      let best = dir * quasiZ(me.type, O, E, V, X, PlaceScan.phiAt(phi, 1));
      const frontier = new Set<number>();
      const push = (c: number) => {
        const x = c % nx,
          z = (c - x) / nx;
        for (const [dx, dz] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const xx = x + dx,
            zz = z + dz;
          if (xx < 0 || zz < 0 || xx >= nx || zz >= nz) continue;
          const n = zz * nx + xx;
          if (!inR[n] && has[n]) frontier.add(n);
        }
      };
      push(seed);
      while (members.length < 160 && frontier.size) {
        let pick = -1,
          pz = best;
        for (const n of frontier) {
          const z = dir * quasiZ(me.type, O + a.O[n], E + a.E[n], V + a.V[n], X + a.X[n], PlaceScan.phiAt(phi, members.length + 1));
          if (z > pz) {
            pz = z;
            pick = n;
          }
        }
        if (pick < 0) break;
        frontier.delete(pick);
        inR[pick] = 1;
        members.push(pick);
        O += a.O[pick];
        E += a.E[pick];
        V += a.V[pick];
        X += a.X[pick];
        best = pz;
        push(pick);
      }
      if (members.length < 3) continue;
      // The other half's sums over the zone: a test the growing never saw.
      let ob = 0,
        eb = 0,
        vb = 0,
        xb = 0;
      for (const c of members) {
        ob += full.O[c] - a.O[c];
        eb += full.E[c] - a.E[c];
        vb += full.V[c] - a.V[c];
        xb += full.X[c] - a.X[c];
      }
      if ((!share && eb < 1) || ob + eb < 4 || (share && xb < 8)) continue;
      this.tests++;
      const z = quasiZ(me.type, ob, eb, vb, xb, PlaceScan.phiAt(phi, members.length));
      if (dir * z < Z_KEEP) continue;
      const p = pOfZ(z);
      // Compactness: a square of cells is pi/4 of its perimeter's circle.
      let edges = 0;
      for (const c of members) {
        const x = c % nx,
          zz = (c - x) / nx;
        for (const [dx, dz] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const xx = x + dx,
            z2 = zz + dz;
          if (xx < 0 || z2 < 0 || xx >= nx || z2 >= nz || !inR[z2 * nx + xx]) edges++;
        }
      }
      const compact = Math.min(1, (4 * Math.PI * members.length) / (edges * edges) / (Math.PI / 4));
      out.push({
        m: k,
        shape: 'zone',
        region: -1,
        cells: Int32Array.from(members),
        O: ob,
        E: eb,
        V: vb,
        N: xb,
        X: xb,
        z,
        p,
        q: 1,
        pen: Math.sqrt(compact),
        area: members.length,
        seed,
        heldOut: true,
      });
    }
    return out;
  }

  /** Space-time cylinders: circles on the coarse raster in one or two parts of the match. */
  private scanSlices(): void {
    if (this.stMatches < MIN_MATCHES) return;
    const st = this.st;
    const SN = this.stN;
    const R = regionsFor(st.nx, st.nz, [0.75, 1.5, 2.2, 3.2, 4.5], false);
    const windows: [number, number][] = [];
    for (let w = 0; w < ST_BINS; w++) windows.push([w, w]);
    for (let w = 0; w + 1 < ST_BINS; w++) windows.push([w, w + 1]);
    for (let ek = 0; ek < 2; ek++) {
      const O = this.stO[ek],
        E = this.stE[ek];
      let sum = 0;
      for (let j = 0; j < O.length; j++) sum += O[j];
      if (sum < 30) continue;
      // Dispersion per level over all parts.
      const phi = new Float64Array(3).fill(1);
      let last = 1;
      for (let L = 0; L < 3; L++) {
        const lnx = Math.ceil(st.nx / 2 ** L),
          lnz = Math.ceil(st.nz / 2 ** L);
        const rows: [number, number][] = [];
        for (let w = 0; w < ST_BINS; w++) {
          const eb = this.blocks(E.subarray(w * SN, (w + 1) * SN), st.nx, st.nz, L);
          for (let j = 0; j < eb.length; j++) if (eb[j] >= 1) rows.push([this.stQ[ek][L][w * lnx * lnz + j], eb[j]]);
        }
        if (rows.length >= 3) {
          rows.sort((a, b) => a[0] / a[1] - b[0] / b[1]);
          let q = 0,
            v = 0;
          for (const [a, b] of rows.slice(0, Math.max(3, Math.ceil(rows.length * 0.95)))) {
            q += a;
            v += b;
          }
          last = Math.max(1, q / v, last);
        }
        phi[L] = last;
      }
      const pre = Array.from({ length: ST_BINS }, (_, w) => [
        rowPrefix(O.subarray(w * SN, (w + 1) * SN) as Float64Array, st.nx, st.nz),
        rowPrefix(E.subarray(w * SN, (w + 1) * SN) as Float64Array, st.nx, st.nz),
      ]);
      const W = st.nx + 1;
      const cands: Cand[] = [];
      for (let r = 0; r < R.n; r++) {
        const perW = new Float64Array(ST_BINS * 2);
        for (let w = 0; w < ST_BINS; w++) {
          const [pO, pE] = pre[w];
          let o = 0,
            e = 0;
          for (let s = R.s0[r]; s < R.s0[r] + R.sn[r]; s++) {
            const b = R.spans[s * 3] * W;
            o += pO[b + R.spans[s * 3 + 2] + 1] - pO[b + R.spans[s * 3 + 1]];
            e += pE[b + R.spans[s * 3 + 2] + 1] - pE[b + R.spans[s * 3 + 1]];
          }
          perW[w * 2] = o;
          perW[w * 2 + 1] = e;
        }
        for (const [w0, w1] of windows) {
          let o = 0,
            e = 0;
          for (let w = w0; w <= w1; w++) {
            o += perW[w * 2];
            e += perW[w * 2 + 1];
          }
          if (e < 1 || o + e < 5) continue;
          this.tests++;
          const z = quasiZ('rate', o, e, e, 0, PlaceScan.phiAt(phi, R.area[r]));
          if (z < Z_KEEP) continue;
          cands.push({
            m: -1,
            shape: 'time',
            region: r,
            cells: null,
            O: o,
            E: e,
            V: e,
            N: 0,
            X: 0,
            z,
            p: pOfZ(z),
            q: 1,
            pen: 1,
            area: R.area[r],
            ev: ek,
            w0,
            w1,
          });
        }
      }
      cands.sort((x, y) => y.z - x.z);
      this.cands.push(...cands.slice(0, CAND_MAX / 2));
    }
  }

  // -------------------------------------------------------------------------

  /** After `placeFdr`: the candidates under the false discovery rate, pruned to regions that do not overlap a stronger one of their measure. */
  select(fdr = PLACE_FDR): void {
    const { nx } = this.fr;
    const R = regionsFor(this.fr.nx, this.fr.nz, CIRCLE_R, true);
    const Rst = regionsFor(this.st.nx, this.st.nz, [0.75, 1.5, 2.2, 3.2, 4.5], false);
    const sig = this.cands.filter((c) => c.q <= fdr);
    // Strongest first, a long or ragged shape paying for its freedom (Kulldorff's penalty, square root).
    sig.sort((a, b) => b.z * b.z * b.pen - a.z * a.z * a.pen);
    const kept: Kept[] = [];
    const byGroup = new Map<string, Kept[]>();
    for (const c of sig) {
      if (kept.length >= PLACE_MAX * 2) break;
      const dir = (c.z >= 0 ? 1 : -1) as 1 | -1;
      const cells = c.shape === 'band' ? new Int32Array(0) : (c.cells ?? (c.shape === 'time' ? regionCells(Rst, c.region, this.st.nx) : regionCells(R, c.region, nx)));
      const group = `${c.m}|${c.ev ?? ''}|${dir}|${c.shape === 'band' ? 'band' : c.shape === 'time' ? `t${c.w0}${c.w1}` : 'space'}`;
      const g = byGroup.get(group) ?? [];
      if (c.shape === 'band' && g.length) continue;
      const set = new Set(cells);
      // Within a measure, a region mostly inside a stronger one says the same.
      if (
        g.some((k) => {
          let inside = 0;
          for (const x of k.cellSet) if (set.has(x)) inside++;
          return inside > 0.3 * Math.min(cells.length, k.cellSet.length);
        })
      )
        continue;
      if (g.length >= 6) continue;
      const k: Kept = {
        ...c,
        dir,
        cellSet: cells,
        seen: 0,
        withEv: 0,
        held: 0,
        fo: new Float64Array(FOLDS),
        fe: new Float64Array(FOLDS),
        heldBy: [],
        o2: 0,
        e2: 0,
        v2: 0,
        rv: 0,
      };
      g.push(k);
      byGroup.set(group, g);
      kept.push(k);
    }
    this.kept = kept;
  }

  get selected(): number {
    return this.kept.length;
  }

  /** The second read: in how many matches each kept place was seen and held, and its ratio in five folds of them. */
  stability(m: PlaceMatch): void {
    if (!this.kept.length) return;
    const t0 = performance.now();
    const g = m.grid;
    const spaceKept = this.kept.filter((k) => k.shape !== 'time' && k.shape !== 'band');
    const timeKept = this.kept.filter((k) => k.shape === 'time');
    const fo = fold(m.i);
    if (spaceKept.length && g && g.ix.length && this.raster(g, m.teams)) {
      const buf = this.buf;
      const tot = this.tot.fill(0);
      for (let j = 0; j < this.nt; j++) {
        const o = this.touched[j] * CH;
        for (let ch = 0; ch < CH; ch++) tot[ch] += buf[o + ch];
      }
      for (const k of spaceKept) {
        const me = this.measures[k.m];
        const so = tot[me.o];
        const sx = tot[me.x] + (me.x2 >= 0 ? tot[me.x2] : 0);
        if (!(sx > 0)) continue;
        const r = so / sx;
        let o = 0,
          e = 0,
          x = 0;
        for (const c of k.cellSet) {
          if (!this.mark[c]) continue;
          const xc = buf[c * CH + me.x] + (me.x2 >= 0 ? buf[c * CH + me.x2] : 0);
          x += xc;
          o += buf[c * CH + me.o];
          e += xc * r;
        }
        if (!(x > 0)) continue;
        k.seen++;
        if (o > 0) k.withEv++;
        k.fo[fo] += o;
        k.fe[fo] += e;
        if (!k.heldOut || half(m.i) === 1) {
          k.o2 += o;
          k.e2 += e;
          k.v2 += me.type === 'share' ? e * (1 - r) : e;
          k.rv += (o - e) ** 2;
        }
        if (k.dir * (o - e) > 0 && (k.dir < 0 || o > 0)) {
          k.held++;
          k.heldBy.push({ i: m.i, x: k.dir * (o - e) });
        }
      }
    }
    this.clear();
    if (timeKept.length) {
      const buf = this.sliceRaster(m);
      if (buf) {
        const SN = this.stN;
        for (const k of timeKept) {
          let total = 0,
            inW = 0;
          const ek = k.ev!;
          let rowR = 0,
            o = 0;
          for (let w = 0; w < ST_BINS; w++)
            for (let c = 0; c < SN; c++) {
              const v = buf[(ek * ST_BINS + w) * SN + c];
              total += v;
              if (w >= k.w0! && w <= k.w1!) inW += v;
            }
          if (!(total > 0)) continue;
          for (const c of k.cellSet)
            for (let w = 0; w < ST_BINS; w++) {
              const v = buf[(ek * ST_BINS + w) * SN + c];
              rowR += v;
              if (w >= k.w0! && w <= k.w1!) o += v;
            }
          if (!(rowR > 0)) continue;
          const e = (rowR * inW) / total;
          k.seen++;
          k.withEv++;
          k.fo[fo] += o;
          k.fe[fo] += e;
          k.o2 += o;
          k.e2 += e;
          k.v2 += e;
          k.rv += (o - e) ** 2;
          if (o - e > 0) {
            k.held++;
            k.heldBy.push({ i: m.i, x: o - e });
          }
        }
      }
    }
    this.ms.stability += performance.now() - t0;
  }

  /** The kept places, worked out for the report. */
  findings(): PlaceFinding[] {
    const fr = this.fr;
    const { nx, nz } = fr;
    const R = regionsFor(nx, nz, CIRCLE_R, true);
    const Rst = regionsFor(this.st.nx, this.st.nz, [0.75, 1.5, 2.2, 3.2, 4.5], false);
    const bandBy: 'height' | 'floor' = this.floorN > this.heightN ? 'floor' : 'height';
    const floor = this.heightN ? this.floorSum / this.heightN : 0;
    const upm = this.heightN ? this.upmSum / this.heightN : 1;
    const out: PlaceFinding[] = [];
    // Bases: the cells holding 2% of the map's spawns, take-offs and landings or more.
    let tl = 0;
    for (let c = 0; c < this.N; c++) tl += this.TL[c];
    const airfield = (c: number) => tl > 0 && this.TL[c] >= 0.02 * tl;
    for (const k of this.kept) {
      const time = k.shape === 'time';
      const band = k.shape === 'band';
      // Quiet where units spawn, take off and land: a base is no hidden safe place.
      if (k.dir < 0 && !band && !time && k.cellSet.some(airfield)) continue;
      const me = time ? null : this.measures[k.m];
      const event = time ? EVK[k.ev!] : me!.event;
      const frame = time ? this.st : fr;
      // Geometry, world units.
      let cx: number, cz: number, radius: number;
      let segs: number[] = [];
      let ellipse: PlaceFinding['ellipse'];
      let path: PlaceFinding['path'];
      const wx = (x: number) => frame.x0 + x * frame.cell;
      const wz = (z: number) => frame.z0 + z * frame.cell;
      const ring = (x: number, z: number, a: number, b: number, th: number) => {
        const n = 40;
        const pt = (t: number): [number, number] => [
          wx(x + a * Math.cos(t) * Math.cos(th) - b * Math.sin(t) * Math.sin(th)),
          wz(z + a * Math.cos(t) * Math.sin(th) + b * Math.sin(t) * Math.cos(th)),
        ];
        for (let j = 0; j < n; j++) segs.push(...pt((j / n) * 2 * Math.PI), ...pt(((j + 1) / n) * 2 * Math.PI));
      };
      if (band) {
        // The whole band: the box of the map's presence.
        let x0 = nx,
          x1 = -1,
          z0 = nz,
          z1 = -1;
        for (let c = 0; c < this.N; c++)
          if (this.P[c] > 0) {
            const x = c % nx,
              z = (c - x) / nx;
            x0 = Math.min(x0, x);
            x1 = Math.max(x1, x);
            z0 = Math.min(z0, z);
            z1 = Math.max(z1, z);
          }
        if (x1 < 0) continue;
        cx = wx((x0 + x1 + 1) / 2);
        cz = wz((z0 + z1 + 1) / 2);
        radius = (Math.max(x1 - x0, z1 - z0) + 1) * fr.cell * 0.5;
        const X0 = wx(x0),
          X1 = wx(x1 + 1),
          Z0 = wz(z0),
          Z1 = wz(z1 + 1);
        segs = [X0, Z0, X1, Z0, X1, Z0, X1, Z1, X1, Z1, X0, Z1, X0, Z1, X0, Z0];
      } else if (k.region >= 0) {
        const RR = time ? Rst : R;
        const r = k.region;
        cx = wx(RR.cx[r]);
        cz = wz(RR.cz[r]);
        if (RR.kind[r]) {
          ellipse = {
            a: RR.a[r] * frame.cell,
            b: RR.b[r] * frame.cell,
            angle: RR.ang[r],
          };
          radius = ellipse.a;
          ring(RR.cx[r], RR.cz[r], RR.a[r], RR.b[r], RR.ang[r]);
          const dx = Math.cos(RR.ang[r]) * RR.a[r],
            dz = Math.sin(RR.ang[r]) * RR.a[r];
          path = [
            [wx(RR.cx[r] - dx), wz(RR.cz[r] - dz)],
            [wx(RR.cx[r] + dx), wz(RR.cz[r] + dz)],
          ];
        } else {
          radius = RR.a[r] * frame.cell;
          ring(RR.cx[r], RR.cz[r], RR.a[r], RR.a[r], 0);
        }
      } else {
        // A grown zone: its cells' outer edges.
        const set = new Set(k.cellSet);
        let sx = 0,
          sz = 0;
        let x0 = Infinity,
          x1 = -Infinity,
          z0 = Infinity,
          z1 = -Infinity;
        for (const c of k.cellSet) {
          const x = c % nx,
            z = (c - x) / nx;
          sx += x + 0.5;
          sz += z + 0.5;
          x0 = Math.min(x0, x);
          x1 = Math.max(x1, x + 1);
          z0 = Math.min(z0, z);
          z1 = Math.max(z1, z + 1);
          if (x + 1 >= nx || !set.has(c + 1)) segs.push(wx(x + 1), wz(z), wx(x + 1), wz(z + 1));
          if (x === 0 || !set.has(c - 1)) segs.push(wx(x), wz(z), wx(x), wz(z + 1));
          if (z + 1 >= nz || !set.has(c + nx)) segs.push(wx(x), wz(z + 1), wx(x + 1), wz(z + 1));
          if (z === 0 || !set.has(c - nx)) segs.push(wx(x), wz(z), wx(x + 1), wz(z));
        }
        cx = wx(sx / k.cellSet.length);
        cz = wz(sz / k.cellSet.length);
        radius = (Math.max(x1 - x0, z1 - z0) * fr.cell) / 2;
      }
      // The scan raster's cells under it: its height, and the visual check.
      const under: number[] = [];
      if (time) {
        const f = this.st.cell / fr.cell;
        for (const c of k.cellSet) {
          const x = c % this.st.nx,
            z = (c - x) / this.st.nx;
          const bx = Math.round((this.st.x0 + x * this.st.cell - fr.x0) / fr.cell),
            bz = Math.round((this.st.z0 + z * this.st.cell - fr.z0) / fr.cell);
          for (let dz = 0; dz < f; dz++) for (let dx = 0; dx < f; dx++) if (bx + dx >= 0 && bz + dz >= 0 && bx + dx < nx && bz + dz < nz) under.push((bz + dz) * nx + bx + dx);
        }
      } else if (!band) under.push(...k.cellSet);
      let yp = 0,
        pp = 0;
      for (const c of band ? Array.from({ length: this.N }, (_, i) => i) : under) {
        yp += this.YP[c];
        pp += this.P[c];
      }
      const y = pp > 0 ? yp / pp : 0;
      // The plain heat of the event: what a look at the map shows.
      const heatOf = (c: number) => (event === 'kd' ? this.RAW[0][c] + this.RAW[1][c] : this.RAW[Math.max(0, EVK.indexOf(event as (typeof EVK)[number]))][c]);
      let obv = 0,
        peakShare = 1;
      if (!band) {
        const acc = time ? null : this.acc[k.m];
        const exc = (c: number) => (acc ? acc.O[c] - acc.E[c] : 0);
        ({ obv, peakShare } = this.obviousness(under, k.dir, heatOf, exc, time, !time && me!.type === 'share'));
      } else {
        // A band is never seen on a ground heat map: as hidden as places get, unless it is the band almost everyone is in.
        obv = 0.1;
        peakShare = 0;
      }
      // The test again, at the variance the matches themselves show (cluster-robust, matches as clusters, never under Poisson).
      let zR = k.z,
        pR = k.p,
        phi: number;
      if (band) phi = Math.max(1, k.V > 0 && k.z ? (k.O - k.E) ** 2 / (k.z * k.z * k.V) : 1);
      else {
        const df = Math.max(3, k.seen - 1);
        const varR = Math.max((k.rv * k.seen) / Math.max(1, k.seen - 1), k.v2);
        zR = k.seen >= MIN_MATCHES && varR > 0 ? ((k.o2 - k.e2) / Math.sqrt(varR)) * Math.sqrt(1 - 2 / df) : 0;
        pR = zR * k.dir > 0 ? pOfZ(zR) : 1;
        phi = Math.max(1, k.v2 > 0 ? varR / k.v2 : 1);
      }
      // Effect: ratio raw and shrunk, interval at the dispersion.
      const share = !time && me!.type === 'share';
      const alpha = time || band ? 10 : this.alphas[k.m];
      let ratio: number, shrunk: number, lo: number, hi: number;
      if (share) {
        const p0 = k.E / k.N,
          ph = k.O / k.N;
        const odds = (v: number) => v / Math.max(1e-9, 1 - v);
        const m = Math.max(5, Math.min(200, alpha / Math.max(0.05, p0 * (1 - p0))));
        ratio = odds(Math.min(1 - 0.5 / k.N, Math.max(0.5 / k.N, ph))) / odds(p0);
        shrunk = odds((k.O + m * p0) / (k.N + m)) / odds(p0);
        const se = Math.sqrt(phi * (1 / Math.max(0.5, k.O) + 1 / Math.max(0.5, k.N - k.O)));
        lo = ratio * Math.exp(-1.96 * se);
        hi = ratio * Math.exp(1.96 * se);
      } else {
        ratio = k.E > 0 ? k.O / k.E : 1;
        shrunk = (k.O + alpha) / (k.E + alpha);
        const se = Math.sqrt(phi / Math.max(0.5, k.O));
        lo = (Math.max(0.5, k.O) / k.E) * Math.exp(-1.96 * se);
        hi = (Math.max(0.5, k.O) / k.E) * Math.exp(1.96 * se);
      }
      // Stability over folds of the matches.
      let folds = 0,
        agree = 0;
      for (let f = 0; f < FOLDS; f++) {
        const fo = band ? this.acc[k.m].band!.fo[f] : k.fo[f];
        const fe = band ? this.acc[k.m].band!.fe[f] : k.fe[f];
        if (fe < 0.5 && fo < 1) continue;
        folds++;
        if (k.dir * (fo - fe) > 0) agree++;
      }
      const B = band ? this.acc[k.m].band! : null;
      const seen = B ? B.seen : k.seen;
      const held = B ? B.heldBy.length : k.held;
      const heldBy = B
        ? B.heldBy.slice(0, DRILL_MAX)
        : k.heldBy
            .sort((a, b) => b.x - a.x)
            .slice(0, DRILL_MAX)
            .map((h) => h.i);
      const center = time ? -1 : (k.seed ?? Math.max(0, Math.min(this.N - 1, Math.floor((cz - fr.z0) / fr.cell) * nx + Math.floor((cx - fr.x0) / fr.cell))));
      const gi: [number, number, number] =
        !time && !band && this.gis[k.m]?.length && center >= 0 ? [this.gis[k.m][0][center], this.gis[k.m][1][center], this.gis[k.m][2][center]] : [0, 0, 0];
      const moran = !time && !band && this.morans[k.m]?.length && center >= 0 ? this.morans[k.m][center] : 0;
      const bandIdx = band || (me && me.band !== undefined) ? me!.band! : undefined;
      const edges = [0, ...HEIGHT_EDGES, HEIGHT_EDGES[HEIGHT_EDGES.length - 1] * 2];
      out.push({
        id: `${this.map}:${time ? `st:${event}:${k.w0}-${k.w1}` : me!.id}:${k.shape}:${Math.round(cx)}:${Math.round(cz)}`,
        map: this.map,
        measure: time ? `st:${event}` : me!.id,
        type: share ? 'share' : 'rate',
        event,
        ...(me?.cls ? { cls: me.cls } : {}),
        ...(me?.team ? { team: me.team } : {}),
        ...(bandIdx !== undefined
          ? {
              band: bandIdx,
              bandBy,
              ...(bandBy === 'height'
                ? {
                    bandY: [floor + edges[bandIdx] * upm, floor + edges[bandIdx + 1] * upm] as [number, number],
                  }
                : {}),
            }
          : {}),
        ...(time
          ? {
              phase: [k.w0! / ST_BINS, (k.w1! + 1) / ST_BINS] as [number, number],
            }
          : {}),
        dir: k.dir,
        shape: k.shape,
        x: cx,
        y: bandIdx !== undefined && bandBy === 'height' ? floor + ((edges[bandIdx] + edges[bandIdx + 1]) / 2) * upm : y,
        z: cz,
        radius,
        ...(ellipse ? { ellipse } : {}),
        segs: segs.map((v) => Math.round(v * 10) / 10),
        ...(path ? { path } : {}),
        cells: band ? 0 : k.cellSet.length,
        cell: frame.cell,
        ...(k.heldOut ? { heldOut: true } : {}),
        observed: r3(k.O),
        expected: r3(k.E),
        trials: r3(k.N),
        exposure: r3(k.X),
        ratio: r3(ratio),
        shrunk: r3(shrunk),
        lo: r3(lo),
        hi: r3(hi),
        zScore: r3(zR),
        p: pR,
        q: 1,
        phi: r3(phi),
        gi: gi.map(r3) as [number, number, number],
        moran: r3(moran),
        obviousness: r3(obv),
        hidden: obv < HIDDEN_BELOW,
        peakShare: r3(peakShare),
        stability: {
          seen,
          withEvents: B ? B.M : k.withEv,
          held,
          folds,
          foldsAgree: agree,
        },
        matches: heldBy,
        score: 0,
      });
    }
    return out;
  }

  /**
   * How much a region already shows in the plain heat (log scale to the
   * map's brightest cell, as the Map tab and the default view draw it): its
   * contrast with the ring around it, and a bright peak that carries most of
   * the excess. A low ratio is seen when the region is darker than its ring.
   */
  private obviousness(cells: number[], dir: number, heat: (c: number) => number, exc: (c: number) => number, time: boolean, share: boolean): { obv: number; peakShare: number } {
    const { nx, nz } = this.fr;
    if (!cells.length) return { obv: 0, peakShare: 0 };
    let max = 0;
    for (let c = 0; c < this.N; c++) max = Math.max(max, heat(c));
    const lm = Math.log1p(max);
    const v = (c: number) => (lm > 0 ? Math.log1p(heat(c)) / lm : 0);
    const set = new Set(cells);
    let x0 = nx,
      x1 = 0,
      z0 = nz,
      z1 = 0;
    let sin = 0,
      peak = 0,
      top = 0,
      all = 0;
    for (const c of cells) {
      const x = c % nx,
        z = (c - x) / nx;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      z0 = Math.min(z0, z);
      z1 = Math.max(z1, z);
      const vc = v(c);
      sin += vc;
      peak = Math.max(peak, vc);
      const e = dir * exc(c);
      if (e > 0) {
        all += e;
        top = Math.max(top, e);
      }
    }
    const d = Math.max(1, Math.round(0.5 * Math.sqrt(cells.length)));
    let sr = 0,
      nr = 0;
    for (let z = Math.max(0, z0 - d); z <= Math.min(nz - 1, z1 + d); z++)
      for (let x = Math.max(0, x0 - d); x <= Math.min(nx - 1, x1 + d); x++) {
        const c = z * nx + x;
        if (set.has(c) || !(this.P[c] > 0)) continue;
        sr += v(c);
        nr++;
      }
    const mIn = sin / cells.length;
    const mRing = nr ? sr / nr : 0;
    const contrast = mIn - mRing;
    const clamp = (x: number) => Math.max(0, Math.min(1, x));
    const peakShare = time ? 0 : all > 0 ? top / all : 0;
    // A tenth of the palette over an area is hard to see against the texture of a heat map; two fifths is plain.
    const bright = Math.max(clamp(contrast / 0.4), clamp((peak - 0.7) / 0.3) * (time ? 0.5 : share ? 1 : peakShare));
    // A ratio is never drawn by the plain heat: a busy place draws the eye, half way.
    if (share) return { obv: 0.5 * bright, peakShare };
    if (dir < 0) return { obv: clamp(-contrast / 0.4), peakShare };
    return { obv: bright, peakShare };
  }
}

const r3 = (v: number) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : v);

/** Benjamini-Hochberg over every region tried on every map; the candidates get their q. */
export function placeFdr(scans: PlaceScan[]): {
  tests: number;
  candidates: number;
} {
  const all = scans.flatMap((s) => s.cands);
  const tests = Math.max(
    all.length,
    scans.reduce((n, s) => n + s.tests, 0),
  );
  const idx = all.map((_, i) => i).sort((a, b) => all[a].p - all[b].p);
  let run = 1;
  for (let r = idx.length - 1; r >= 0; r--) {
    run = Math.min(run, (all[idx[r]].p * tests) / (r + 1));
    all[idx[r]].q = run;
  }
  return { tests, candidates: all.length };
}

/**
 * The kept places of every map, tested again at their cluster-robust
 * variance: Benjamini-Hochberg over every region the scans tried (those not
 * kept count as p = 1, which only makes q more careful), those under the
 * rate kept, and ranked - strength, less what the plain heat already shows,
 * more when the folds of matches agree.
 */
export function finishPlaces(found: PlaceFinding[], tests: number, fdr = PLACE_FDR): PlaceFinding[] {
  const order = found.map((_, i) => i).sort((a, b) => found[a].p - found[b].p);
  const m = Math.max(tests, found.length);
  let run = 1;
  for (let r = order.length - 1; r >= 0; r--) {
    run = Math.min(run, (found[order[r]].p * m) / (r + 1));
    found[order[r]].q = run;
  }
  const out = found.filter((f) => f.q <= fdr);
  for (const f of out) {
    // The effect saturates at 4 times (a place nobody dies in is not 30 times as telling as one twice as deadly); a quiet place ranks a little under a busy one.
    const l = Math.min(Math.log(4), Math.abs(Math.log(Math.max(1e-9, f.shrunk))));
    const strength = (l / (l + Math.log(3))) * Math.min(1, -Math.log10(Math.max(1e-300, f.q)) / 6) * (f.dir > 0 ? 1 : 0.7);
    const st = f.stability;
    f.score = r3(strength * (1 - 0.7 * f.obviousness) * (st.folds ? 0.5 + (0.5 * st.foldsAgree) / st.folds : 0.5));
  }
  out.sort((a, b) => b.score - a.score);
  // Across measures: a class's or a band's finding that says what a stronger one at the same place says (one class on the map, say) is left out.
  const kept: PlaceFinding[] = [];
  for (const f of out) {
    const same = kept.some(
      (k) =>
        k.map === f.map &&
        k.event === f.event &&
        k.dir === f.dir &&
        (k.shape === 'band') === (f.shape === 'band') &&
        (k.shape === 'time') === (f.shape === 'time') &&
        Math.hypot(k.x - f.x, k.z - f.z) < 0.5 * Math.max(k.radius, f.radius) &&
        Math.max(k.radius, f.radius) <= 1.5 * Math.min(k.radius, f.radius) + f.cell &&
        Math.abs(Math.log(k.ratio / f.ratio)) < 0.15 &&
        (k.band ?? -1) === (f.band ?? -1),
    );
    if (!same) kept.push(f);
  }
  const per = new Map<string, number>();
  return kept.filter((f) => {
    const n = per.get(f.map) ?? 0;
    per.set(f.map, n + 1);
    return n < PLACE_MAX;
  });
}

/** What to scan, from the matches' heads: events, classes and sides with enough of them. */
export function planOf(
  rows: { cls: string; kills: number; deaths: number }[],
  teams: { name: string; kills: number; deaths: number }[],
  events: Record<string, number>,
): PlacePlan {
  const ev = EVK.filter((e) => (events[e] ?? 0) + (e === 'death' ? (events.destroyed ?? 0) + (events.crash ?? 0) : 0) >= 20);
  const byCls = new Map<string, { k: number; d: number }>();
  for (const r of rows) {
    const c = byCls.get(r.cls) ?? { k: 0, d: 0 };
    c.k += r.kills;
    c.d += r.deaths;
    byCls.set(r.cls, c);
  }
  const classes = [...byCls]
    .filter(([c, v]) => c && c !== 'weapon' && c !== 'decoy' && v.k + v.d >= 40)
    .sort((a, b) => b[1].k + b[1].d - a[1].k - a[1].d)
    .slice(0, 4)
    .map(([c]) => c);
  const byTeam = new Map<string, number>();
  for (const t of teams) byTeam.set(t.name, (byTeam.get(t.name) ?? 0) + t.kills + t.deaths);
  const sides = [...byTeam]
    .filter(([, v]) => v >= 40)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([t]) => t);
  return { events: [...ev], classes, teams: sides, bands: true };
}

/** One map to scan: its raster, plan, and a read of its matches' grids (called twice). */
export interface PlaceJob {
  map: string;
  frame: ScanFrame;
  plan: PlacePlan;
  read: (visit: (m: PlaceMatch) => void) => Promise<void>;
}

export interface PlaceRun {
  findings: PlaceFinding[];
  tests: number;
  candidates: number;
  maps: {
    map: string;
    matches: number;
    skipped: number;
    kept: number;
    ms: Record<string, number>;
  }[];
  ms: number;
}

/** The whole place discovery over some maps: read, scan, false discovery rate over all, select, read again for stability. */
export async function discoverPlaces(jobs: PlaceJob[], first?: (map: string, m: PlaceMatch) => void): Promise<PlaceRun> {
  const t0 = performance.now();
  const scans: PlaceScan[] = [];
  for (const j of jobs) {
    const s = new PlaceScan(j.map, j.frame, j.plan);
    await j.read((m) => {
      s.add(m);
      first?.(j.map, m);
    });
    s.scan();
    scans.push(s);
  }
  const { tests, candidates } = placeFdr(scans);
  const findings: PlaceFinding[] = [];
  for (let k = 0; k < scans.length; k++) {
    const s = scans[k];
    s.select();
    if (s.selected) await jobs[k].read((m) => s.stability(m));
    findings.push(...s.findings());
  }
  return {
    findings: finishPlaces(findings, tests),
    tests,
    candidates,
    maps: scans.map((s) => ({
      map: s.map,
      matches: s.matches,
      skipped: s.skipped,
      kept: s.selected,
      ms: Object.fromEntries(Object.entries(s.ms).map(([k, v]) => [k, Math.round(v)])),
    })),
    ms: Math.round(performance.now() - t0),
  };
}
