import type { AxisMapping, Dataset } from '../state/types';
import { dataToWorld } from './pose';

/**
 * Directional heat: a bearing per row, packed for the GPU, and the circular
 * statistics a picked spot or a volume is answered with.
 *
 * A bearing is an angle on the ground plane in the dataset's look convention
 * (`rowLookDirection`): world direction `(sin b, ., -cos b)`, so a row's view
 * yaw already is its bearing. One byte a row on the GPU - 255 steps round the
 * circle, 1.4 degrees each, far finer than any wedge anyone draws - and 255
 * itself means "this row has no direction", which draws as today's disc.
 */

/** Where a row's direction comes from. `auto` takes the best one the row has. */
export type DirSource = 'auto' | 'view' | 'aim' | 'movement' | 'other';
export const DIR_SOURCES: readonly DirSource[] = ['auto', 'view', 'aim', 'movement', 'other'];

/** The packed value of a row with no direction. */
export const DIR_NONE = 255;
/** Packed steps round the circle: 0..254. */
export const DIR_STEPS = 255;
const TAU = Math.PI * 2;

/** Seconds a row and the other party's sample may be apart and still be one moment. */
export const LINK_MAX_GAP = 3;
/** Seconds between two samples of one person past which they do not make a movement. */
export const MOVE_MAX_GAP = 10;

export function packBearing(rad: number): number {
  let f = rad / TAU;
  f -= Math.floor(f);
  const q = Math.round(f * DIR_STEPS);
  return q >= DIR_STEPS ? 0 : q;
}

export function unpackBearing(q: number): number {
  return (q * TAU) / DIR_STEPS;
}

/** Bearing of the world ground-plane vector (dx, dz). */
export function bearingOf(dx: number, dz: number): number {
  return Math.atan2(dx, -dz);
}

/** The links from a row to the other party's sample: kills, deaths, hits. Parallel arrays, rows ascending. */
export interface DirLinks {
  rows: Uint32Array;
  other: Uint32Array;
}

export interface DirectionData {
  source: DirSource;
  /** One byte a row, `DIR_NONE` where the row has no direction. */
  angles: Uint8Array;
  links: DirLinks | null;
  /** Rows with a direction, by where it came from. */
  counts: Record<Exclude<DirSource, 'auto'>, number>;
}

/** Column pairs read as an aim or shot vector, in the data's frame, x then y. */
const AIM_PAIRS: Array<[RegExp, RegExp]> = [
  [/^aim_?(dir)?_?x$/i, /^aim_?(dir)?_?y$/i],
  [/^shot_?(dir)?_?x$/i, /^shot_?(dir)?_?y$/i],
  [/^fire_?(dir)?_?x$/i, /^fire_?(dir)?_?y$/i],
  [/^hit_?dir_?x$/i, /^hit_?dir_?y$/i],
];

/** Column names that name the other party of an event, by its label. */
const OTHER_NAMES = [/^other$/i, /^victim$/i, /^target$/i, /^killer$/i, /^attacker$/i, /^shooter$/i, /^other_?(id|uid|name|player|unit)$/i];

/** The aim vector's columns, or null: numeric, x and y, z when the data has one. */
export function aimColumns(ds: Dataset): { x: Float32Array; y: Float32Array; z: Float32Array | null } | null {
  for (const [rx, ry] of AIM_PAIRS) {
    const cx = ds.attrs.find((a) => a.kind !== 'category' && rx.test(a.name));
    const cy = ds.attrs.find((a) => a.kind !== 'category' && ry.test(a.name));
    if (!cx || !cy) continue;
    const zName = cx.name.replace(/x$/i, (m) => (m === 'x' ? 'z' : 'Z'));
    const cz = ds.attrs.find((a) => a.kind !== 'category' && a.name === zName);
    return { x: cx.data as Float32Array, y: cy.data as Float32Array, z: cz ? (cz.data as Float32Array) : null };
  }
  return null;
}

/** The other-party column as person indices per category, or null when the data has none that names people. */
export function otherColumn(ds: Dataset): { data: Uint32Array; person: Int32Array } | null {
  if (!ds.personId || ds.personLabels.length === 0) return null;
  const byLabel = new Map<string, number>();
  ds.personLabels.forEach((l, i) => byLabel.set(l, i));
  for (const re of OTHER_NAMES) {
    const col = ds.attrs.find((a) => a.kind === 'category' && re.test(a.name) && a.categories);
    if (!col || !col.categories) continue;
    const person = new Int32Array(col.categories.length).fill(-1);
    let hits = 0;
    col.categories.forEach((c, i) => {
      const p = byLabel.get(c);
      if (p !== undefined && c !== '') {
        person[i] = p;
        hits++;
      }
    });
    if (hits > 0) return { data: col.data as Uint32Array, person };
  }
  return null;
}

/** Column names that say what kind of event a row is: the layers a source can be set per. */
const EVENT_NAMES = [/^event$/i, /^event_?type$/i, /^type$/i, /^kind$/i, /^action$/i];

/** The event-kind column, or null: a category column by one of `EVENT_NAMES`. */
export function eventColumn(ds: Dataset): { name: string; data: Uint32Array; categories: string[] } | null {
  for (const re of EVENT_NAMES) {
    const c = ds.attrs.find((a) => a.kind === 'category' && re.test(a.name) && a.categories && a.categories.length > 0);
    if (c) return { name: c.name, data: c.data as Uint32Array, categories: c.categories! };
  }
  return null;
}

/** World ground-plane bearing of a data-frame vector. NaN when it has no horizontal part. */
function vectorBearing(x: number, y: number, z: number, axes: AxisMapping | null | undefined): number {
  const w = dataToWorld({ x, y, z }, axes);
  if (!Number.isFinite(w.x) || !Number.isFinite(w.z) || Math.abs(w.x) + Math.abs(w.z) < 1e-9) return NaN;
  return bearingOf(w.x, w.z);
}

/** Milliseconds a scan works before it hands the thread back until the next frame is drawn. */
const SCAN_SLICE_MS = 2;

/** Just after the next frame is drawn; without frames (a hidden page, tests) soon after. */
function afterFrame(): Promise<void> {
  return new Promise((done) => {
    if (typeof requestAnimationFrame !== 'function') {
      setTimeout(done, 0);
      return;
    }
    const timer = setTimeout(done, 100);
    requestAnimationFrame(() => {
      clearTimeout(timer);
      setTimeout(done, 0);
    });
  });
}

/**
 * A long scan's pacing: `slice()` is false while this frame's few milliseconds
 * last, else waits for the frame after and is true. Back-to-back timeouts
 * would let a slice run into a frame; one slice a frame, just after it is
 * drawn, leaves the frame its whole budget.
 */
function pacer(): { start: () => Promise<void>; slice: () => Promise<boolean> } {
  let since = performance.now();
  return {
    async start() {
      await afterFrame();
      since = performance.now();
    },
    async slice() {
      if (performance.now() - since < SCAN_SLICE_MS) return false;
      await afterFrame();
      since = performance.now();
      return true;
    },
  };
}

/**
 * Every row's bearing from `source`.
 *
 * Linear passes over the columns, no per-row objects: view and aim are
 * per-row; movement is the step from the person's previous sample in the
 * same session; the other party is that person's sample nearest in time
 * (`LINK_MAX_GAP`), found by one pass forwards and one backwards, so a kill
 * points from killer to victim, a death from victim to killer and a hit from
 * whoever's row it is towards the other side. With `yieldRows` it starts after
 * the next frame and, every so many rows, hands the thread back until the
 * frame after once a few milliseconds have gone, so a load of hundreds of
 * millions does not drop frames.
 */
export async function computeDirections(
  ds: Dataset,
  source: DirSource,
  opts: { yieldRows?: number; cancelled?: () => boolean; by?: Record<string, DirSource> } = {},
): Promise<DirectionData | null> {
  const n = ds.count;
  const every = opts.yieldRows ?? 0;
  const pace = pacer();
  if (every > 0) {
    await pace.start();
    if (opts.cancelled?.()) return null;
  }
  const angles = new Uint8Array(n).fill(DIR_NONE);
  const counts = { view: 0, aim: 0, movement: 0, other: 0 };
  let budget = every;
  const tick = async (k: number): Promise<boolean> => {
    if (every <= 0) return false;
    budget -= k;
    if (budget > 0) return false;
    budget = every;
    if (!(await pace.slice())) return false;
    return opts.cancelled?.() ?? false;
  };
  // Per event kind (`opts.by`, keyed by the event column's labels): a kind
  // named there takes its own source, every other row `source`.
  const ev = opts.by && Object.keys(opts.by).length > 0 ? eventColumn(ds) : null;
  const kindSource = ev ? Uint8Array.from(ev.categories, (c) => (opts.by![c] ? DIR_SOURCES.indexOf(opts.by![c]) : 255)) : null;
  const kinds = ev ? ev.data : null;
  const fallback = DIR_SOURCES.indexOf(source);
  const sourceOf = (i: number) => {
    if (!kindSource) return fallback;
    const c = kinds![i];
    const k = c < kindSource.length ? kindSource[c] : 255;
    return k === 255 ? fallback : k;
  };
  // Index 0 is `auto`, which takes every source in turn.
  const want = (s: Exclude<DirSource, 'auto'>) => {
    const k = DIR_SOURCES.indexOf(s);
    return fallback === 0 || fallback === k || (kindSource !== null && kindSource.some((v) => v === 0 || v === k));
  };
  const ok = (i: number, s: Exclude<DirSource, 'auto'>) => {
    const k = sourceOf(i);
    return k === 0 || k === DIR_SOURCES.indexOf(s);
  };
  const SLICE = 1 << 16;

  // Lowest priority first, so in `auto` a better source overwrites a worse one.
  if (want('movement') && ds.personId) {
    const last = new Int32Array(ds.personLabels.length).fill(-1);
    const pid = ds.personId;
    for (let s = 0; s < n; s += SLICE) {
      const e = Math.min(n, s + SLICE);
      for (let i = s; i < e; i++) {
        const p = pid[i];
        if (p >= last.length) continue;
        const j = last[p];
        last[p] = i;
        if (j < 0 || (ds.personShared && ds.personShared[p])) continue;
        if (ds.sessionId && ds.sessionId[j] !== ds.sessionId[i]) continue;
        if (ds.time && Math.abs(ds.time[i] - ds.time[j]) > MOVE_MAX_GAP) continue;
        const dx = ds.px[i] - ds.px[j];
        const dz = ds.pz[i] - ds.pz[j];
        if (Math.abs(dx) + Math.abs(dz) < 1e-6 || !ok(i, 'movement')) continue;
        angles[i] = packBearing(bearingOf(dx, dz));
        counts.movement++;
      }
      if (await tick(e - s)) return null;
    }
  }
  if (want('view') && ds.yaw) {
    const yaw = ds.yaw;
    for (let s = 0; s < n; s += SLICE) {
      const e = Math.min(n, s + SLICE);
      for (let i = s; i < e; i++) {
        const y = yaw[i];
        if (!Number.isFinite(y) || !ok(i, 'view')) continue;
        angles[i] = packBearing(y);
        counts.view++;
      }
      if (await tick(e - s)) return null;
    }
  }
  const aim = want('aim') ? aimColumns(ds) : null;
  if (aim) {
    for (let s = 0; s < n; s += SLICE) {
      const e = Math.min(n, s + SLICE);
      for (let i = s; i < e; i++) {
        const b = vectorBearing(aim.x[i], aim.y[i], aim.z ? aim.z[i] : 0, ds.axes);
        if (Number.isNaN(b) || !ok(i, 'aim')) continue;
        angles[i] = packBearing(b);
        counts.aim++;
      }
      if (await tick(e - s)) return null;
    }
  }
  let links: DirLinks | null = null;
  const other = want('other') ? otherColumn(ds) : null;
  if (other && ds.personId) {
    const pid = ds.personId;
    const people = ds.personLabels.length;
    const time = ds.time;
    const rows: number[] = [];
    const prev: number[] = [];
    const last = new Int32Array(people).fill(-1);
    for (let s = 0; s < n; s += SLICE) {
      const e = Math.min(n, s + SLICE);
      for (let i = s; i < e; i++) {
        const c = other.data[i];
        const q = c < other.person.length ? other.person[c] : -1;
        if (q >= 0 && q !== pid[i]) {
          rows.push(i);
          prev.push(last[q]);
        }
        if (pid[i] < people) last[pid[i]] = i;
      }
      if (await tick(e - s)) return null;
    }
    const linkRows = new Uint32Array(rows.length);
    const linkOther = new Uint32Array(rows.length);
    let kept = 0;
    last.fill(-1);
    let k = rows.length - 1;
    for (let e = n; e > 0 && k >= 0; e -= SLICE) {
      const s = Math.max(0, e - SLICE);
      for (let i = e - 1; i >= s && k >= 0; i--) {
        // The links at this row, before this row is recorded as its person's next sample.
        while (k >= 0 && rows[k] === i) {
          const c = other.data[i];
          const q = other.person[c];
          const a = prev[k];
          const b = last[q];
          const gap = (j: number) => (j < 0 ? Infinity : time ? Math.abs(time[j] - time[i]) : Math.abs(j - i));
          const sameSession = (j: number) => j >= 0 && (!ds.sessionId || ds.sessionId[j] === ds.sessionId[i]);
          const ga = sameSession(a) ? gap(a) : Infinity;
          const gb = sameSession(b) ? gap(b) : Infinity;
          const j = ga <= gb ? a : b;
          const g = Math.min(ga, gb);
          if (j >= 0 && g <= (time ? LINK_MAX_GAP : 1e9)) {
            linkRows[kept] = i;
            linkOther[kept] = j;
            kept++;
          }
          k--;
        }
        if (pid[i] < people) last[pid[i]] = i;
      }
      if (await tick(e - s)) return null;
    }
    // Collected backwards: ascending again.
    const lr = linkRows.subarray(0, kept).reverse();
    const lo = linkOther.subarray(0, kept).reverse();
    for (let t = 0; t < kept; t++) {
      const i = lr[t];
      const j = lo[t];
      const dx = ds.px[j] - ds.px[i];
      const dz = ds.pz[j] - ds.pz[i];
      if (Math.abs(dx) + Math.abs(dz) < 1e-6 || !ok(i, 'other')) continue;
      angles[i] = packBearing(bearingOf(dx, dz));
      counts.other++;
    }
    links = { rows: lr.slice(), other: lo.slice() };
  }
  return { source, angles, links, counts };
}

// ------------------------------------------------------------------ wedge

/**
 * The angular weight of a wedge at `off` radians from its axis: 1 inside the
 * half opening, falling to 0 over `soft` radians either side of its edge.
 * The shaders compute exactly this.
 */
export function wedgeWeight(off: number, half: number, soft: number): number {
  const a = Math.abs(off);
  if (soft <= 1e-6) return a <= half ? 1 : 0;
  const t = Math.min(1, Math.max(0, (a - (half - soft)) / (2 * soft)));
  return 1 - t * t * (3 - 2 * t);
}

/**
 * What a wedge's heat is multiplied by so it adds exactly what a disc of the
 * same radius adds: the full circle over the integral of its angular weight.
 * Without it a narrow wedge would read as a cold spot, and a difference map
 * between two openings would show the openings rather than the data.
 */
export function wedgeNorm(half: number, soft: number): number {
  if (half >= Math.PI && soft <= 1e-6) return 1;
  const N = 720;
  let sum = 0;
  for (let k = 0; k < N; k++) {
    const off = -Math.PI + ((k + 0.5) / N) * TAU;
    sum += wedgeWeight(off, half, soft);
  }
  const mean = sum / N;
  return mean > 1e-6 ? 1 / mean : 1;
}

/** The wedge's settings in shader terms: half opening and softness in radians, and its norm. */
export function wedgeUniforms(openingDeg: number, softness: number): { half: number; soft: number; norm: number } {
  const open = Math.min(360, Math.max(1, openingDeg));
  const half = (open / 360) * Math.PI;
  // Softness is a fraction of the half opening, but never past the far side.
  const soft = Math.min(Math.PI, Math.max(0, Math.min(1, softness)) * half);
  if (open >= 360) return { half: Math.PI, soft: 0, norm: 1 };
  return { half, soft, norm: wedgeNorm(half, soft) };
}

/**
 * Below this many pixels of radius a wedge turns back into a disc: a wedge one
 * pixel across covers no pixel centre, and its heat would flicker in and out
 * as the camera moved. Blended between the two radii, so it never pops.
 */
export const WEDGE_FULL_PX = 4;
export const WEDGE_DISC_PX = 1.5;

/**
 * Widest half opening plus softness, radians, drawn as its own tight triangle
 * rather than the disc's (`wedgeTriangle`); past it the tight one is no smaller.
 */
export const WEDGE_TIGHT_MAX = 1.2;

/**
 * The triangle a wedge is drawn as, in sprite units along (x) and across (y)
 * its direction: everything the fragment stage can light - the sector out to
 * half + soft, and the antialiasing band `w` (0.75 px over the radius in
 * pixels) along each edge, the edge lines pushed out by it. The shaders build
 * the same three corners.
 */
export function wedgeTriangle(half: number, soft: number, pixRadius: number, edgePx = 0.75): [number, number][] {
  const hs = half + soft;
  const w = edgePx / pixRadius;
  const sh = Math.sin(hs);
  const ch = Math.cos(hs);
  const pp = (1 + w + w * sh) / ch;
  return [
    [-w / sh, 0],
    [pp * ch - w * sh, pp * sh + w * ch],
    [pp * ch - w * sh, -(pp * sh + w * ch)],
  ];
}

/**
 * How far forward a wedge's heat sits, as a fraction of its radius: the
 * centroid of the sprite's radial ramp `ramp(d)` times the wedge's angular
 * weight. A wedge moves a row's heat ahead of it along its direction, and by
 * this much of its *world* radius at every zoom: the shaders shift a sprite the
 * pixel clamps or the wedge-to-disc blend shrank by what it lost, so a place
 * keeps its colour from far and near (zoom invariance).
 */
export function wedgeCentroid(half: number, soft: number, ramp: (d: number) => number): number {
  if (half >= Math.PI) return 0;
  const N = 256;
  let nr = 0;
  let dr = 0;
  for (let k = 0; k < N; k++) {
    const d = (k + 0.5) / N;
    const v = ramp(d);
    nr += v * d * d;
    dr += v * d;
  }
  let na = 0;
  let da = 0;
  for (let k = 0; k < 720; k++) {
    const a = -Math.PI + ((k + 0.5) / 720) * 2 * Math.PI;
    const w = wedgeWeight(a, half, soft);
    na += w * Math.cos(a);
    da += w;
  }
  return dr > 0 && da > 0 ? (nr / dr) * (na / da) : 0;
}

// ------------------------------------------------------------------ statistics

export const ROSE_BINS = 24;

export interface DirStats {
  /** Rows counted. */
  n: number;
  /** Circular mean bearing, radians; NaN without rows. */
  mean: number;
  /** Mean resultant length, 0 (all ways) .. 1 (one way). */
  r: number;
  /** Circular standard deviation, radians: sqrt(-2 ln R). */
  spread: number;
  /** Rows per bearing bin, bin 0 centred on bearing 0. */
  rose: Uint32Array;
}

export class DirAccumulator {
  private c = 0;
  private s = 0;
  n = 0;
  readonly rose = new Uint32Array(ROSE_BINS);
  add(b: number): void {
    this.c += Math.cos(b);
    this.s += Math.sin(b);
    this.n++;
    let f = b / TAU + 0.5 / ROSE_BINS;
    f -= Math.floor(f);
    this.rose[Math.min(ROSE_BINS - 1, Math.floor(f * ROSE_BINS))]++;
  }
  done(): DirStats {
    const n = this.n;
    if (n === 0) return { n: 0, mean: NaN, r: 0, spread: NaN, rose: this.rose };
    const r = Math.hypot(this.c, this.s) / n;
    return {
      n,
      mean: Math.atan2(this.s, this.c),
      r,
      spread: r >= 1 ? 0 : r <= 1e-9 ? Infinity : Math.sqrt(-2 * Math.log(r)),
      rose: this.rose,
    };
  }
}

export interface SpotDirections {
  /** Rows inside, by their own direction: where they point out of the spot. */
  outgoing: DirStats;
  /** Rows elsewhere whose other party is inside, by their direction into it. */
  incoming: DirStats;
  /** Rows inside, with or without a direction. */
  rows: number;
}

/**
 * The directions at a spot or in a volume.
 *
 * `inside` decides membership, `drawn` whether a row is in the picture (the
 * shaders' own rules, `rowDrawn`). Scans [rowLo, rowHi) once and the links
 * once, handing the thread back every `yieldRows`.
 */
export async function spotDirections(
  ds: Dataset,
  dir: DirectionData,
  rowLo: number,
  rowHi: number,
  inside: (i: number) => boolean,
  drawn: (i: number) => boolean,
  opts: { yieldRows?: number; cancelled?: () => boolean } = {},
): Promise<SpotDirections | null> {
  const out = new DirAccumulator();
  const inc = new DirAccumulator();
  let rows = 0;
  const every = opts.yieldRows ?? 0;
  const pace = pacer();
  let since = 0;
  for (let i = rowLo; i < rowHi; i++) {
    if (every > 0 && ++since >= every) {
      since = 0;
      if ((await pace.slice()) && opts.cancelled?.()) return null;
    }
    if (!inside(i) || !drawn(i)) continue;
    rows++;
    const q = dir.angles[i];
    if (q !== DIR_NONE) out.add(unpackBearing(q));
  }
  const links = dir.links;
  if (links) {
    for (let k = 0; k < links.rows.length; k++) {
      const i = links.rows[k];
      if (i < rowLo || i >= rowHi) continue;
      const j = links.other[k];
      if (!inside(j) || !drawn(i)) continue;
      const dx = ds.px[j] - ds.px[i];
      const dz = ds.pz[j] - ds.pz[i];
      if (Math.abs(dx) + Math.abs(dz) < 1e-6) continue;
      inc.add(bearingOf(dx, dz));
    }
  }
  return { outgoing: out.done(), incoming: inc.done(), rows };
}

/** Compass degrees, 0..360, of a bearing. */
export function bearingDegrees(b: number): number {
  let d = (b * 180) / Math.PI;
  d %= 360;
  if (d < 0) d += 360;
  return d;
}
