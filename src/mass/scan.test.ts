import { describe, expect, it } from 'vitest';
import { VEHICLE_CLASSES } from '../data/canonical';
import { discoverPlaces, quasiZ, scanFrame, type PlaceJob, type PlaceMatch } from './scan';
import { BANDS, GRID_KINDS, type SummaryGrid } from './types';

/** A seeded generator, so the tests see the same matches every run. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function poisson(r: () => number, l: number): number {
  if (l <= 0) return 0;
  if (l > 30) return Math.max(0, Math.round(l + Math.sqrt(l) * Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r())));
  const L = Math.exp(-l);
  let k = 0,
    p = 1;
  do {
    k++;
    p *= r();
  } while (p > L);
  return k - 1;
}

interface Plant {
  /** Deaths' rate times `mult` in a circle (cells of 8 world units). */
  diffuse?: { x: number; z: number; r: number; mult: number };
  /** Kills' rate times `mult` in a strip from (x0, z0) to (x1, z1), `w` cells wide. */
  corridor?: {
    x0: number;
    z0: number;
    x1: number;
    z1: number;
    w: number;
    mult: number;
  };
  /** Deaths in a height band times `mult`. */
  band?: { b: number; mult: number };
  /** Extra deaths in a circle only in one fifth of the match. */
  time?: { x: number; z: number; r: number; bin: number; extra: number };
}

const K = GRID_KINDS.length;
const KILL = GRID_KINDS.indexOf('kill');
const DEATH = GRID_KINDS.indexOf('death');
const TANK = VEHICLE_CLASSES.indexOf('tank');

/**
 * A match on a 128x128 grid of 8-unit cells: presence in a few blobs that
 * change from match to match, deaths and kills at a rate that changes from
 * match to match and runs three times higher in a few spots of each match
 * (clustered noise: what makes real matches overdispersed), and the planted
 * effects.
 */
function synth(seed: number, plant: Plant): SummaryGrid {
  const r = rng(seed * 7919 + 13);
  const G = 128;
  const p = new Float64Array(G * G);
  const blobs = Array.from({ length: 6 }, () => ({
    x: 10 + r() * 108,
    z: 10 + r() * 108,
    s: 6 + r() * 12,
    w: 20 + r() * 60,
  }));
  // A presence floor where people pass anyway, so every place is seen now and then.
  for (let c = 0; c < G * G; c++) if (r() < 0.12) p[c] += 2 + r() * 4;
  for (const b of blobs)
    for (let z = Math.max(0, Math.floor(b.z - 2 * b.s)); z < Math.min(G, b.z + 2 * b.s); z++)
      for (let x = Math.max(0, Math.floor(b.x - 2 * b.s)); x < Math.min(G, b.x + 2 * b.s); x++) {
        const d2 = (x - b.x) ** 2 + (z - b.z) ** 2;
        p[z * G + x] += b.w * Math.exp(-d2 / (2 * b.s * b.s));
      }
  const rate = 0.004 * (0.5 + r());
  const noise = Array.from({ length: 3 }, () => ({
    x: r() * G,
    z: r() * G,
    s: 4 + r() * 6,
  }));
  const ix: number[] = [],
    iz: number[] = [],
    P: number[] = [],
    pt: number[] = [],
    pc: number[] = [],
    ph: number[] = [],
    y: number[] = [],
    y0: number[] = [],
    fx: number[] = [],
    fz: number[] = [],
    e: number[] = [];
  const ts: number[] = [];
  const tsCount = new Map<string, number>();
  const tsAdd = (cx: number, cz: number, minute: number, kind: number, v: number) => {
    const key = `${cx},${cz},${minute},${kind}`;
    tsCount.set(key, (tsCount.get(key) ?? 0) + v);
  };
  const shares = [0.6, 0.25, 0, 0, 0, 0.15, 0, 0];
  const duration = 1200;
  for (let c = 0; c < G * G; c++) {
    if (p[c] < 0.5) continue;
    const x = c % G,
      z = (c - x) / G;
    const i = ix.length;
    const pres = Math.round(p[c] * 10) / 10;
    ix.push(x);
    iz.push(z);
    P.push(pres);
    pt.push(pres / 2, pres / 2, 0);
    y.push(5);
    y0.push(0);
    fx.push(0);
    fz.push(0);
    pc.push(i, TANK, pres);
    for (let b = 0; b < BANDS; b++) if (shares[b]) ph.push(i, b, Math.round(pres * shares[b] * 10) / 10);
    let mD = 1,
      mK = 1;
    for (const n of noise) if ((x - n.x) ** 2 + (z - n.z) ** 2 < n.s * n.s) ((mD *= 3), (mK *= 3));
    const d = plant.diffuse;
    if (d && (x - d.x) ** 2 + (z - d.z) ** 2 < d.r * d.r) mD *= d.mult;
    const co = plant.corridor;
    if (co) {
      const vx = co.x1 - co.x0,
        vz = co.z1 - co.z0;
      const t = Math.max(0, Math.min(1, ((x - co.x0) * vx + (z - co.z0) * vz) / (vx * vx + vz * vz)));
      if (Math.hypot(x - co.x0 - t * vx, z - co.z0 - t * vz) <= co.w / 2) mK *= co.mult;
    }
    // Deaths by band: the band's presence share, the planted band weighted up.
    const bw = shares.map((s, b) => s * (plant.band && plant.band.b === b ? plant.band.mult : 1));
    const bsum = bw.reduce((a, b) => a + b, 0);
    for (let b = 0; b < BANDS; b++) {
      if (!bw[b]) continue;
      const nd = poisson(r, ((pres * rate * mD * bw[b]) / bsum) * (bsum / 1));
      const nk = poisson(r, pres * rate * mK * shares[b]);
      for (const [kind, n] of [
        [DEATH, nd],
        [KILL, nk],
      ] as const) {
        if (!n) continue;
        e.push(i, kind, r() < 0.5 ? 0 : 1, TANK, b, n);
        for (let j = 0; j < n; j++) tsAdd(x >> 3, z >> 3, Math.floor(r() * 20), kind, 1);
      }
    }
    const tp = plant.time;
    if (tp && (x - tp.x) ** 2 + (z - tp.z) ** 2 < tp.r * tp.r) {
      const n = poisson(r, tp.extra * pres * rate);
      if (n) {
        e.push(i, DEATH, 0, TANK, 0, n);
        for (let j = 0; j < n; j++) tsAdd(x >> 3, z >> 3, tp.bin * 4 + Math.floor(r() * 4), DEATH, 1);
      }
    }
    if (pres > 0) tsAdd(x >> 3, z >> 3, Math.floor(r() * 20), K, pres);
  }
  for (const [key, v] of tsCount) {
    const [cx, cz, m, k] = key.split(',').map(Number);
    ts.push(cx, cz, m, k, v);
  }
  void duration;
  return {
    cell: 8,
    ix,
    iz,
    p: P,
    pt,
    pc,
    ph,
    y,
    y0,
    fx,
    fz,
    e,
    bands: { by: 'height', floor: 0, unitsPerMetre: 1 },
    ts: { cell: 64, minute: 60, v: ts },
  };
}

const PLAN = {
  events: ['kill', 'death'],
  classes: ['tank'],
  teams: ['a', 'b'],
  bands: true,
};

function job(n: number, plant: Plant, seed = 1, map = 'synthetic'): PlaceJob {
  const grids = Array.from({ length: n }, (_, i) => synth(seed * 100003 + i, plant));
  const frame = scanFrame(grids.map(() => [0, 0, 1024, 1024] as [number, number, number, number]))!;
  return {
    map,
    frame,
    plan: PLAN,
    read: async (visit: (m: PlaceMatch) => void) => {
      grids.forEach((grid, i) => visit({ i, grid, teams: ['a', 'b'], duration: 1200 }));
    },
  };
}

describe('place scan', () => {
  it('quasi z: a dispersion of 4 halves z', () => {
    const z1 = quasiZ('rate', 40, 20, 20, 0, 1);
    const z4 = quasiZ('rate', 40, 20, 20, 0, 4);
    expect(z1).toBeGreaterThan(3.5);
    expect(z4).toBeCloseTo(z1 / 2, 6);
    expect(quasiZ('rate', 10, 20, 20, 0, 1)).toBeLessThan(0);
  });

  it('finds a planted diffuse area, a corridor, a height band and a phase cluster, and flags the faint ones hidden', async () => {
    const plant: Plant = {
      diffuse: { x: 40, z: 88, r: 22, mult: 1.6 },
      corridor: { x0: 70, z0: 20, x1: 120, z1: 60, w: 3, mult: 3 },
      band: { b: 5, mult: 2.2 },
      time: { x: 96, z: 100, r: 8, bin: 3, extra: 2 },
    };
    const run = await discoverPlaces([job(240, plant)]);
    const f = run.findings;
    const near = (x: number, z: number, cx: number, cz: number, r: number) => Math.hypot(x - cx * 8, z - cz * 8) <= r * 8;
    const diffuse = f.find((p) => p.event === 'death' && p.dir === 1 && p.shape !== 'time' && p.shape !== 'band' && near(p.x, p.z, 40, 88, 22));
    expect(diffuse, JSON.stringify(f.map((p) => [p.measure, p.shape, Math.round(p.x / 8), Math.round(p.z / 8), p.z, p.q]))).toBeTruthy();
    expect(diffuse!.hidden).toBe(true);
    expect(diffuse!.stability.foldsAgree).toBeGreaterThanOrEqual(4);
    const corridor = f.find((p) => p.event === 'kill' && p.dir === 1 && p.shape !== 'time' && near(p.x, p.z, 95, 40, 20));
    expect(corridor).toBeTruthy();
    expect(f.some((p) => p.event === 'kill' && p.shape === 'corridor')).toBe(true);
    const band = f.find((p) => p.shape === 'band' && p.band === 5 && p.dir === 1);
    expect(band).toBeTruthy();
    const time = f.find((p) => p.shape === 'time' && p.event === 'death' && p.phase![0] <= 0.6 && p.phase![1] >= 0.8 && near(p.x, p.z, 96, 100, 12));
    expect(time).toBeTruthy();
    expect(run.tests).toBeGreaterThan(10000);
  }, 120_000);

  it('holds the false discovery rate on matches with nothing planted', async () => {
    let withAny = 0,
      total = 0;
    for (let rep = 0; rep < 8; rep++) {
      const run = await discoverPlaces([job(60, {}, 500 + rep, `null${rep}`)]);
      total += run.findings.length;
      if (run.findings.length) withAny++;
    }
    // Under the complete null every finding is false: the FDR is the chance of any, held to 5% (a margin for 8 runs).
    expect(withAny).toBeLessThanOrEqual(1);
    expect(total).toBeLessThanOrEqual(3);
  }, 120_000);
});
