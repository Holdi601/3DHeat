/**
 * Many matches' grids (`SummaryGrid`) added up on one map, streamed a match
 * at a time so memory holds the sum, not the matches: presence and its
 * direction, height, events by kind (by team and class for kills and
 * deaths), and per cell how many matches it was hot in (the stability of a
 * hotspot). Out of the sum come the heat rasters the panel draws and an
 * `InsightJob` the single-dataset detectors (`insights/detectors.ts`) run on
 * as they would on loaded rows.
 */

import { EVENT_KINDS, VEHICLE_CLASSES } from '../data/canonical';
import { createInsightJob, type Grid, type InsightJob, type InsightMeta } from '../insights/pass';
import { BANDS, GRID_KINDS, type SummaryGrid } from './types';
import { pow2At } from './summarize';

const K = GRID_KINDS.length;
const C = VEHICLE_CLASSES.length;
/** Team names kept apart on a map (more fall into the last). */
const TT = 8;
const KILL = GRID_KINDS.indexOf('kill');
const DEATHS = ['death', 'destroyed', 'crash'].map((k) => GRID_KINDS.indexOf(k as (typeof GRID_KINDS)[number]));
/** A cell is hot in a match when it holds at least this share of the match's kills and deaths... */
const HOT_SHARE = 0.02;
/** ...and at least this many. */
const HOT_MIN = 2;
/** Cells of a raster a side at most. */
export const RASTER_MAX = 512;

export type Channel = 'presence' | 'kills' | 'deaths' | 'kd' | 'events' | 'stability' | 'flow' | (typeof GRID_KINDS)[number];

export class GridMerge {
  cell: number;
  private readonly index = new Map<number, number>();
  ix: number[] = [];
  iz: number[] = [];
  p: number[] = [];
  y: number[] = [];
  fx: number[] = [];
  fz: number[] = [];
  /** `[cell * K + kind]`. */
  ev: number[] = [];
  /** Kills and deaths by team slot `[cell * TT + t]`, and by class `[cell * C + c]`. */
  kT: number[] = [];
  dT: number[] = [];
  kC: number[] = [];
  dC: number[] = [];
  pT: number[] = [];
  /** Presence by height band `[cell * BANDS + b]`. */
  pB: number[] = [];
  /** Matches the cell was hot in, and matches it saw anyone in. */
  hot: number[] = [];
  seen: number[] = [];
  readonly teams: string[] = [];
  matches = 0;
  /** The union of the matches' robust extents. */
  bounds: [number, number, number, number] | null = null;

  constructor(cell: number) {
    this.cell = pow2At(cell);
  }

  private slot(name: string): number {
    let i = this.teams.indexOf(name);
    if (i < 0) {
      if (this.teams.length >= TT) return TT - 1;
      i = this.teams.length;
      this.teams.push(name);
    }
    return i;
  }

  private at(ix: number, iz: number): number {
    const key = (ix + 2 ** 25) * 2 ** 26 + (iz + 2 ** 25);
    let i = this.index.get(key);
    if (i === undefined) {
      i = this.ix.length;
      this.index.set(key, i);
      this.ix.push(ix);
      this.iz.push(iz);
      for (const [a, n] of [[this.p, 1], [this.y, 1], [this.fx, 1], [this.fz, 1], [this.hot, 1], [this.seen, 1], [this.ev, K], [this.kT, TT], [this.dT, TT], [this.pT, TT], [this.kC, C], [this.dC, C], [this.pB, BANDS]] as const)
        for (let j = 0; j < n; j++) (a as number[]).push(0);
    }
    return i;
  }

  /** Everything summed into cells `f` times larger. */
  private coarsen(f: number): void {
    const old = { ix: this.ix, iz: this.iz, p: this.p, y: this.y, fx: this.fx, fz: this.fz, ev: this.ev, kT: this.kT, dT: this.dT, pT: this.pT, kC: this.kC, dC: this.dC, pB: this.pB, hot: this.hot, seen: this.seen };
    this.cell *= f;
    this.index.clear();
    this.ix = []; this.iz = []; this.p = []; this.y = []; this.fx = []; this.fz = []; this.ev = []; this.kT = []; this.dT = []; this.pT = []; this.kC = []; this.dC = []; this.pB = []; this.hot = []; this.seen = [];
    for (let i = 0; i < old.ix.length; i++) {
      const j = this.at(Math.floor(old.ix[i] / f), Math.floor(old.iz[i] / f));
      this.p[j] += old.p[i];
      this.y[j] += old.y[i];
      this.fx[j] += old.fx[i];
      this.fz[j] += old.fz[i];
      this.hot[j] = Math.max(this.hot[j], old.hot[i]);
      this.seen[j] = Math.max(this.seen[j], old.seen[i]);
      for (let k = 0; k < K; k++) this.ev[j * K + k] += old.ev[i * K + k];
      for (let t = 0; t < TT; t++) {
        this.kT[j * TT + t] += old.kT[i * TT + t];
        this.dT[j * TT + t] += old.dT[i * TT + t];
        this.pT[j * TT + t] += old.pT[i * TT + t];
      }
      for (let c = 0; c < C; c++) {
        this.kC[j * C + c] += old.kC[i * C + c];
        this.dC[j * C + c] += old.dC[i * C + c];
      }
      for (let b = 0; b < BANDS; b++) this.pB[j * BANDS + b] += old.pB[i * BANDS + b];
    }
  }

  /**
   * One match's grid, its team names (the grid's team slots), its robust
   * extent; `team` keeps only that team's presence and events.
   */
  add(g: SummaryGrid, teams: string[], extent: [number, number, number, number] | null, team: string | null = null): void {
    if (g.cell > this.cell) this.coarsen(g.cell / this.cell);
    const f = this.cell / g.cell;
    const T = teams.length;
    const n = g.ix.length;
    const to = new Int32Array(n);
    const slots = teams.map((t) => this.slot(t));
    const only = team === null ? -1 : teams.indexOf(team);
    if (team !== null && only < 0) return;
    this.matches++;
    if (extent) {
      const b = this.bounds;
      this.bounds = b ? [Math.min(b[0], extent[0]), Math.min(b[1], extent[1]), Math.max(b[2], extent[2]), Math.max(b[3], extent[3])] : [...extent];
    }
    const ps = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const j = (to[i] = this.at(Math.floor(g.ix[i] / f), Math.floor(g.iz[i] / f)));
      let p = g.p[i];
      if (only >= 0) p = g.pt[i * (T + 1) + only] ?? 0;
      ps[i] = p;
      this.p[j] += p;
      this.y[j] += g.y[i] * p;
      const share = g.p[i] > 0 ? p / g.p[i] : 0;
      this.fx[j] += g.fx[i] * share;
      this.fz[j] += g.fz[i] * share;
      for (let t = 0; t < T; t++) this.pT[j * TT + slots[t]] += g.pt[i * (T + 1) + t] ?? 0;
    }
    for (let q = 0; q + 2 < g.ph.length; q += 3) {
      const i = g.ph[q];
      const share = g.p[i] > 0 ? ps[i] / g.p[i] : 0;
      this.pB[to[i] * BANDS + g.ph[q + 1]] += g.ph[q + 2] * share;
    }
    // Events: tuples [cell, kind, team slot, class, band, count].
    const kd = new Map<number, number>();
    for (let q = 0; q + 5 < g.e.length; q += 6) {
      const i = g.e[q], k = g.e[q + 1], t = g.e[q + 2], c = g.e[q + 3], v = g.e[q + 5];
      if (only >= 0 && t !== only) continue;
      const j = to[i];
      this.ev[j * K + k] += v;
      const slot = t < T ? slots[t] : -1;
      if (k === KILL) {
        if (slot >= 0) this.kT[j * TT + slot] += v;
        this.kC[j * C + c] += v;
      } else if (DEATHS.includes(k)) {
        if (slot >= 0) this.dT[j * TT + slot] += v;
        this.dC[j * C + c] += v;
      }
      if (k === KILL || DEATHS.includes(k)) kd.set(j, (kd.get(j) ?? 0) + v);
    }
    // Hot here: the match's own busiest cells (at the merged size).
    let total = 0;
    for (const v of kd.values()) total += v;
    const seenHere = new Set<number>();
    for (let i = 0; i < n; i++) if (ps[i] > 0) seenHere.add(to[i]);
    for (const j of kd.keys()) seenHere.add(j);
    for (const j of seenHere) this.seen[j]++;
    if (total > 0) for (const [j, v] of kd) if (v >= HOT_MIN && v >= total * HOT_SHARE) this.hot[j]++;
  }

  /** The cell range inside the bounds (all cells when there are none), as a raster no larger than `RASTER_MAX` a side. */
  frame(level = 1): { x0: number; z0: number; cell: number; nx: number; nz: number; step: number } {
    let cell = this.cell * level;
    const b = this.bounds;
    let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
    if (b) [minX, minZ, maxX, maxZ] = b;
    else
      for (let i = 0; i < this.ix.length; i++) {
        minX = Math.min(minX, this.ix[i] * this.cell);
        maxX = Math.max(maxX, (this.ix[i] + 1) * this.cell);
        minZ = Math.min(minZ, this.iz[i] * this.cell);
        maxZ = Math.max(maxZ, (this.iz[i] + 1) * this.cell);
      }
    if (!Number.isFinite(minX)) return { x0: 0, z0: 0, cell, nx: 0, nz: 0, step: level };
    while (Math.max(maxX - minX, maxZ - minZ) / cell > RASTER_MAX) cell *= 2;
    const x0 = Math.floor(minX / cell) * cell;
    const z0 = Math.floor(minZ / cell) * cell;
    return { x0, z0, cell, nx: Math.max(1, Math.ceil((maxX - x0) / cell)), nz: Math.max(1, Math.ceil((maxZ - z0) / cell)), step: cell / this.cell };
  }

  /** A channel as a raster (row-major, z rows), and its own frame. */
  raster(channel: Channel, level = 1): { x0: number; z0: number; cell: number; nx: number; nz: number; v: Float32Array; d?: Float32Array; max: number } {
    const fr = this.frame(level);
    const v = new Float32Array(fr.nx * fr.nz);
    const w = new Float32Array(fr.nx * fr.nz);
    const fxr = channel === 'flow' ? new Float32Array(fr.nx * fr.nz * 2) : undefined;
    const ki = GRID_KINDS.indexOf(channel as (typeof GRID_KINDS)[number]);
    for (let i = 0; i < this.ix.length; i++) {
      const cx = Math.floor((this.ix[i] * this.cell - fr.x0) / fr.cell);
      const cz = Math.floor((this.iz[i] * this.cell - fr.z0) / fr.cell);
      if (cx < 0 || cz < 0 || cx >= fr.nx || cz >= fr.nz) continue;
      const r = cz * fr.nx + cx;
      const kills = this.ev[i * K + KILL];
      const deaths = DEATHS.reduce((s, k) => s + this.ev[i * K + k], 0);
      switch (channel) {
        case 'presence': v[r] += this.p[i]; break;
        case 'kills': v[r] += kills; break;
        case 'deaths': v[r] += deaths; break;
        case 'kd': v[r] += kills; w[r] += deaths; break;
        case 'events': for (let k = 0; k < K; k++) v[r] += this.ev[i * K + k]; break;
        case 'stability': v[r] = Math.max(v[r], this.hot[i]); w[r] = Math.max(w[r], this.seen[i]); break;
        case 'flow': v[r] += this.p[i]; fxr![r * 2] += this.fx[i]; fxr![r * 2 + 1] += this.fz[i]; break;
        default: if (ki >= 0) v[r] += this.ev[i * K + ki];
      }
    }
    if (channel === 'kd') for (let r = 0; r < v.length; r++) v[r] = v[r] + w[r] >= 3 ? (v[r] + 0.5) / (w[r] + 0.5) : NaN;
    if (channel === 'stability') for (let r = 0; r < v.length; r++) v[r] = w[r] >= 3 ? v[r] / w[r] : NaN;
    let max = 0;
    for (let r = 0; r < v.length; r++) if (Number.isFinite(v[r]) && v[r] > max) max = v[r];
    return { ...fr, v, ...(fxr ? { d: fxr } : {}), max };
  }

  /**
   * The sum as an insight pass's grids (fine = the merged cell), so the
   * single-dataset detectors run on it unchanged: presence, kills, deaths,
   * events by kind and kills and deaths by class, with no rows or tracks
   * (the detectors that need tracks say so and skip).
   */
  toInsightJob(): { job: InsightJob; teams: string[] } {
    const fr = this.frame(1);
    // Fine cells at most `FINE_MAX` (512) a side: the frame keeps to it.
    const f = fr.cell;
    const nx = fr.nx, nz = fr.nz;
    const grid: Grid = { x0: fr.x0, z0: fr.z0, f, nx, nz, mx: Math.ceil(nx / 4), mz: Math.ceil(nz / 4), cx: Math.ceil(nx / 16), cz: Math.ceil(nz / 16) };
    const evIdx = GRID_KINDS.map((k) => EVENT_KINDS.indexOf(k));
    const identity = (n: number) => Int8Array.from({ length: n }, (_, i) => i);
    const T = Math.max(1, this.teams.length);
    const meta: InsightMeta = {
      persons: 0,
      teams: T,
      sessions: 0,
      sessionStart: null,
      t0: 0,
      span: 0,
      dwellCap: 10,
      personShared: null,
      eventKinds: EVENT_KINDS.length,
      vehicleClasses: C,
      actors: 2,
      kill: EVENT_KINDS.indexOf('kill'),
      death: EVENT_KINDS.indexOf('death'),
      position: EVENT_KINDS.indexOf('position'),
      eventMap: identity(EVENT_KINDS.length),
      actorMap: null,
      classMap: identity(C),
      hasTime: true,
      hasLife: true,
      hasDir: false,
      grid,
      targetMap: null,
      spawn: EVENT_KINDS.indexOf('spawn'),
      contact: [],
    };
    const job = createInsightJob(meta, { timeLo: -Infinity, timeHi: Infinity, lifetimeNow: null, defaultLifetime: 0, filters: [], groupShown: null, session: -1 });
    const M = grid.mx * grid.mz;
    const CC = grid.cx * grid.cz;
    for (let i = 0; i < this.ix.length; i++) {
      const cx = Math.floor((this.ix[i] * this.cell - fr.x0) / f);
      const cz = Math.floor((this.iz[i] * this.cell - fr.z0) / f);
      if (cx < 0 || cz < 0 || cx >= nx || cz >= nz) continue;
      const fi = cz * nx + cx;
      const mi = Math.floor(cz / 4) * grid.mx + Math.floor(cx / 4);
      const ci = Math.floor(cz / 16) * grid.cx + Math.floor(cx / 16);
      const kills = this.ev[i * K + KILL];
      const deaths = DEATHS.reduce((s, k) => s + this.ev[i * K + k], 0);
      const yMean = this.p[i] > 0 ? this.y[i] / this.p[i] : 0;
      job.fPres[fi] += this.p[i];
      job.fKills[fi] += kills;
      job.fDeaths[fi] += deaths;
      job.fKillY[fi] += kills * yMean;
      job.fY[fi] += this.y[i];
      job.fN[fi] += this.p[i];
      job.mPres[mi] += this.p[i];
      for (let k = 0; k < K; k++) {
        const e = evIdx[k];
        const v = DEATHS.includes(k) ? (k === DEATHS[0] ? deaths : 0) : this.ev[i * K + k];
        if (e >= 0 && v) {
          job.mEvents[e * M + mi] += v;
          job.events[e] += v;
        }
      }
      for (let c = 0; c < C; c++) {
        job.cKills[c * CC + ci] += this.kC[i * C + c];
        job.cDeaths[c * CC + ci] += this.dC[i * C + c];
      }
      for (let t = 0; t < Math.min(T, TT); t++) {
        job.teamPres[t] += this.pT[i * TT + t];
        job.teamKills[t] += this.kT[i * TT + t];
        job.teamDeaths[t] += this.dT[i * TT + t];
      }
      job.presence += this.p[i];
    }
    return { job, teams: this.teams.length ? [...this.teams] : [''] };
  }

  /** Bytes the sum holds, roughly. */
  bytes(): number {
    return this.ix.length * 8 * (8 + K + 3 * TT + 2 * C + BANDS) + this.index.size * 40;
  }
}

/** The cell a merge of these matches starts at: the largest their extents give (`GRID_CELLS` a side), times `level`. */
export function mergeCell(extents: ([number, number, number, number] | null)[], cells = 128): number {
  let c = 0;
  for (const e of extents) if (e) c = Math.max(c, pow2At(Math.max(e[2] - e[0], e[3] - e[1]) / cells));
  return c || 1;
}
