/**
 * The insight pass: one walk over the rows the analysis covers, folding them
 * into ground grids and small per-player, per-team and per-life tables that
 * every detector then reads. Like the volume comparison (`volumes/compare.ts`,
 * whose chunks and row scope it shares), it runs in a worker over copied
 * slices of the columns, so the cost on the main thread is a memory copy and
 * the cost here is a few array adds a row, whatever the number of matches.
 *
 * Three grids on the ground (x, z; y is up), each four times the one below:
 *   fine    up to 512 cells a side, never under one world unit (a metre where
 *           the data is in metres): where a power position is pinned down
 *   mid     the places the detectors test (zones, positions, spawns, flow)
 *   coarse  the places a class or the player/AI split is tested over (these
 *           split the events many ways, so they need bigger places)
 *
 * Exposure is the time spent: each row's gap to the person's next sample,
 * capped across long gaps (the volume statistics' rule). Without per-row gaps
 * it falls back to counting movement samples.
 */

import type { CompareChunk, CompareMeta, CompareScope } from '../volumes/compare';
import { rowShown } from '../volumes/compare';

/** Fine cells a side at most; mid and coarse are 4 and 16 fine cells. */
export const FINE_MAX = 512;
export const MID = 4;
export const COARSE = 16;
/** Seconds after a spawn that count as its start: first contact, early kills and deaths. */
export const EARLY = 60;
/** Seconds before a kill the killer's way there is credited with it (flank routes). */
export const APPROACH = 30;
/** Cells the flank credit looks back over. */
const RING = 6;
/** Speed bins: log2 steps of world units a second from 1/8. */
export const SPEED_BINS = 20;
const SPEED_MIN = 1 / 8;

export interface Grid {
  x0: number;
  z0: number;
  /** Fine cell size; mid and coarse are `MID` and `COARSE` times it. */
  f: number;
  nx: number;
  nz: number;
  mx: number;
  mz: number;
  cx: number;
  cz: number;
}

/**
 * A round cell size (1, 2 or 5 times a power of ten) that fits the extent in
 * `FINE_MAX` cells, never under `minCell` world units: a metre, in the data's
 * units (`upm`), so data in inches is not cut into places a hand across.
 */
export function gridFor(minX: number, minZ: number, maxX: number, maxZ: number, minCell = 1): Grid {
  const w = Math.max(1e-6, maxX - minX);
  const h = Math.max(1e-6, maxZ - minZ);
  const raw = Math.max(minCell > 0 ? minCell : 1, Math.max(w, h) / FINE_MAX);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw * (1 - 1e-9)) ?? raw;
  const x0 = Math.floor(minX / f) * f;
  const z0 = Math.floor(minZ / f) * f;
  const nx = Math.max(1, Math.min(FINE_MAX + 1, Math.floor((maxX - x0) / f) + 1));
  const nz = Math.max(1, Math.min(FINE_MAX + 1, Math.floor((maxZ - z0) / f) + 1));
  const mx = Math.ceil(nx / MID);
  const mz = Math.ceil(nz / MID);
  return { x0, z0, f, nx, nz, mx, mz, cx: Math.ceil(nx / COARSE), cz: Math.ceil(nz / COARSE) };
}

export interface InsightMeta extends CompareMeta {
  grid: Grid;
  /** Target class category -> taxonomy (-1 none), where the column exists. */
  targetMap: Int8Array | null;
  /** Event taxonomy indices the pass needs; -1 where the taxonomy lacks one. */
  spawn: number;
  contact: number[];
}

export interface InsightChunk extends CompareChunk {
  target: Uint32Array | null;
}

/**
 * Per match (session): the presence on the coarse grid and, sparsely, the
 * events, crossings and flank credits per mid cell - so a finding over many
 * matches can say in how many it holds and how much of it one match makes
 * (`consistency.ts`). Left out (null) for one match, or when there are so many
 * matches that the tables would not be small.
 */
export interface SessionTables {
  S: number;
  /** Event kinds, then the crossings and the flank credits as two more kinds. */
  kinds: number;
  /** Seconds (or samples) of presence per session. */
  pres: Float64Array;
  /** Per session and coarse cell: [s * coarse cells + c]. */
  presC: Float32Array;
  /** Per session and kind: [s * kinds + kind]. */
  total: Float64Array;
  /** Sparse: ((kind * S + s) * mid cells + cell) -> count. */
  ev: Map<number, number>;
  /** The map grew past `SESSION_EVENTS_MAX` entries: counts stop and the spread is not told. */
  full: boolean;
}

/** Session x coarse cells at most for the session tables (float32: 32 MB). */
const SESSION_CELLS_MAX = 8_000_000;
/** Distinct (kind, session, cell) entries at most. */
const SESSION_EVENTS_MAX = 3_000_000;

function sessionTables(meta: InsightMeta): SessionTables | null {
  const S = meta.sessions;
  const C = meta.grid.cx * meta.grid.cz;
  if (S < 2 || S * C > SESSION_CELLS_MAX) return null;
  const kinds = meta.eventKinds + 2;
  return { S, kinds, pres: new Float64Array(S), presC: new Float32Array(S * C), total: new Float64Array(S * kinds), ev: new Map(), full: false };
}

function countSession(st: SessionTables, kind: number, s: number, M: number, mi: number): void {
  st.total[s * st.kinds + kind]++;
  if (st.full) return;
  const key = (kind * st.S + s) * M + mi;
  const v = st.ev.get(key);
  if (v !== undefined) st.ev.set(key, v + 1);
  else if (st.ev.size >= SESSION_EVENTS_MAX) st.full = true;
  else st.ev.set(key, 1);
}

/** Per life: where and when it started and how its first minute went. */
export class Lives {
  n = 0;
  x = new Float32Array(1024);
  y = new Float32Array(1024);
  z = new Float32Array(1024);
  cell = new Int32Array(1024);
  team = new Int32Array(1024);
  start = new Float32Array(1024);
  /** Seconds to the first fire, hit, damage, kill or death; NaN none. */
  contact = new Float32Array(1024);
  earlyKills = new Uint16Array(1024);
  earlyDeath = new Uint8Array(1024);
  /** The life is an AI unit's (by the row it started on). */
  ai = new Uint8Array(1024);

  push(x: number, y: number, z: number, cell: number, team: number, start: number): number {
    if (this.n === this.x.length) {
      const grow = <T extends Float32Array | Int32Array | Uint16Array | Uint8Array>(a: T): T => {
        const b = new (a.constructor as new (n: number) => T)(a.length * 2);
        b.set(a);
        return b;
      };
      this.x = grow(this.x);
      this.y = grow(this.y);
      this.z = grow(this.z);
      this.cell = grow(this.cell);
      this.team = grow(this.team);
      this.start = grow(this.start);
      this.contact = grow(this.contact);
      this.earlyKills = grow(this.earlyKills);
      this.earlyDeath = grow(this.earlyDeath);
      this.ai = grow(this.ai);
    }
    const i = this.n++;
    this.x[i] = x;
    this.y[i] = y;
    this.z[i] = z;
    this.cell[i] = cell;
    this.team[i] = team;
    this.start[i] = start;
    this.contact[i] = NaN;
    this.earlyKills[i] = 0;
    this.earlyDeath[i] = 0;
    this.ai[i] = 0;
    return i;
  }
}

/** A player in one vehicle class: what the outlier test compares within the class. */
export class Pairs {
  n = 0;
  person = new Int32Array(256);
  cls = new Int8Array(256);
  presence = new Float64Array(256);
  kills = new Float64Array(256);
  deaths = new Float64Array(256);
  /** Rows by the AI (the rest are a player's or unknown). */
  ai = new Float64Array(256);
  rows = new Float64Array(256);
  private index = new Map<number, number>();

  of(person: number, cls: number, classes: number): number {
    const key = person * (classes + 1) + (cls + 1);
    let i = this.index.get(key);
    if (i !== undefined) return i;
    if (this.n === this.person.length) {
      const grow = <T extends Int32Array | Int8Array | Float64Array>(a: T): T => {
        const b = new (a.constructor as new (n: number) => T)(a.length * 2);
        b.set(a);
        return b;
      };
      this.person = grow(this.person);
      this.cls = grow(this.cls);
      this.presence = grow(this.presence);
      this.kills = grow(this.kills);
      this.deaths = grow(this.deaths);
      this.ai = grow(this.ai);
      this.rows = grow(this.rows);
    }
    i = this.n++;
    this.person[i] = person;
    this.cls[i] = cls;
    this.index.set(key, i);
    return i;
  }
}

/**
 * The state followed along each track: one per player per match. Matches can
 * share a clock and a player can play several, so their rows interleave; each
 * keeps its own track.
 */
export class Tracks {
  n = 0;
  cell: Int32Array;
  x: Float32Array;
  z: Float32Array;
  t: Float32Array;
  speed: Float32Array;
  dead: Uint8Array;
  life: Int32Array;
  /** The life has left the cell it started in: in play, no longer waiting at its spawn. */
  away: Uint8Array;
  cls: Int8Array;
  pair: Int32Array;
  ringCell: Int32Array;
  ringT: Float32Array;
  ringHead: Uint8Array;
  private index = new Map<number, number>();

  constructor(cap: number) {
    cap = Math.max(16, cap);
    this.cell = new Int32Array(cap);
    this.x = new Float32Array(cap);
    this.z = new Float32Array(cap);
    this.t = new Float32Array(cap);
    this.speed = new Float32Array(cap);
    this.dead = new Uint8Array(cap);
    this.life = new Int32Array(cap);
    this.away = new Uint8Array(cap);
    this.cls = new Int8Array(cap);
    this.pair = new Int32Array(cap);
    this.ringCell = new Int32Array(cap * RING);
    this.ringT = new Float32Array(cap * RING);
    this.ringHead = new Uint8Array(cap);
  }

  /** The track of `person` in `session`, made fresh (returned negated, minus one) on first sight. */
  slot(person: number, session: number, sessions: number): number {
    const key = person * (sessions + 1) + (session + 1);
    const got = this.index.get(key);
    if (got !== undefined) return got;
    if (this.n === this.cell.length) this.grow();
    const i = this.n++;
    this.index.set(key, i);
    this.cell[i] = -1;
    this.t[i] = NaN;
    this.speed[i] = NaN;
    this.dead[i] = 0;
    this.life[i] = -1;
    this.away[i] = 0;
    this.cls[i] = -2;
    this.pair[i] = -1;
    this.ringCell.fill(-1, i * RING, i * RING + RING);
    this.ringHead[i] = 0;
    return -i - 1;
  }

  private grow(): void {
    const g = <T extends Int32Array | Float32Array | Uint8Array | Int8Array>(a: T): T => {
      const b = new (a.constructor as new (n: number) => T)(a.length * 2);
      b.set(a);
      return b;
    };
    this.cell = g(this.cell);
    this.x = g(this.x);
    this.z = g(this.z);
    this.t = g(this.t);
    this.speed = g(this.speed);
    this.dead = g(this.dead);
    this.life = g(this.life);
    this.away = g(this.away);
    this.cls = g(this.cls);
    this.pair = g(this.pair);
    this.ringCell = g(this.ringCell);
    this.ringT = g(this.ringT);
    this.ringHead = g(this.ringHead);
  }
}

export interface InsightJob {
  meta: InsightMeta;
  scope: CompareScope;
  shown: number;
  sessAny: Uint8Array | null;
  // Fine grid.
  fPres: Float64Array;
  fKills: Float64Array;
  fDeaths: Float64Array;
  fKillY: Float64Array;
  fY: Float64Array;
  fN: Float64Array;
  // Mid grid.
  mPres: Float64Array;
  /** Events by kind, kind-major: [kind * cells + cell]. */
  mEvents: Float64Array;
  mPasses: Float64Array;
  /** Kills made within `APPROACH` seconds of having crossed the cell. */
  mApproach: Float64Array;
  /** Level vertices in the cell: the geometry density, the cover proxy. */
  mLevel: Float64Array;
  levelVerts: number;
  // Coarse grid, class-major: [class * cells + cell].
  cKills: Float64Array;
  cDeaths: Float64Array;
  cActKills: Float64Array;
  cActDeaths: Float64Array;
  cTarget: Float64Array;
  // Totals.
  events: Float64Array;
  presence: number;
  teamPres: Float64Array;
  teamKills: Float64Array;
  teamDeaths: Float64Array;
  /** Kills and deaths per team and mid cell: [team * mid cells + cell]. */
  mTeamKills: Float64Array;
  mTeamDeaths: Float64Array;
  /** Per match, for the spread of a finding over the matches; null for one. */
  sess: SessionTables | null;
  speedPres: Float64Array;
  speedDeaths: Float64Array;
  lives: Lives;
  pairs: Pairs;
  /** Per person: the match its cached track is in, and that track. */
  pSess: Int32Array | null;
  pSlot: Int32Array | null;
  tracks: Tracks | null;
  /**
   * Value columns (`CompareMeta.values`): totals, and per column the sum and the
   * rows carrying a value per mid cell, per group and per person.
   */
  valTotal: Float64Array;
  valRows: Float64Array;
  mVal: Float64Array;
  mValN: Float64Array;
  teamVal: Float64Array;
  personVal: Float64Array;
}

export function createInsightJob(meta: InsightMeta, scope: CompareScope): InsightJob {
  const g = meta.grid;
  const F = g.nx * g.nz;
  const M = g.mx * g.mz;
  const C = g.cx * g.cz;
  const P = meta.persons;
  const T = Math.max(1, meta.teams);
  const K = meta.vehicleClasses;
  const V = meta.values?.length ?? 0;
  const tracks = P > 0;
  return {
    meta,
    scope,
    shown: 0,
    sessAny: meta.sessions > 0 ? new Uint8Array(meta.sessions) : null,
    fPres: new Float64Array(F),
    fKills: new Float64Array(F),
    fDeaths: new Float64Array(F),
    fKillY: new Float64Array(F),
    fY: new Float64Array(F),
    fN: new Float64Array(F),
    mPres: new Float64Array(M),
    mEvents: new Float64Array(meta.eventKinds * M),
    mPasses: new Float64Array(M),
    mApproach: new Float64Array(M),
    mLevel: new Float64Array(M),
    levelVerts: 0,
    cKills: new Float64Array(K * C),
    cDeaths: new Float64Array(K * C),
    cActKills: new Float64Array(meta.actors * C),
    cActDeaths: new Float64Array(meta.actors * C),
    cTarget: new Float64Array(K * C),
    events: new Float64Array(meta.eventKinds),
    presence: 0,
    teamPres: new Float64Array(T),
    teamKills: new Float64Array(T),
    teamDeaths: new Float64Array(T),
    mTeamKills: new Float64Array(T * M),
    mTeamDeaths: new Float64Array(T * M),
    sess: sessionTables(meta),
    speedPres: new Float64Array(SPEED_BINS),
    speedDeaths: new Float64Array(SPEED_BINS),
    lives: new Lives(),
    pairs: new Pairs(),
    pSess: tracks ? new Int32Array(P).fill(-2) : null,
    pSlot: tracks ? new Int32Array(P).fill(-1) : null,
    tracks: tracks ? new Tracks(P) : null,
    valTotal: new Float64Array(V),
    valRows: new Float64Array(V),
    mVal: new Float64Array(V * M),
    mValN: new Float64Array(V * M),
    teamVal: new Float64Array(V * T),
    personVal: new Float64Array(V * P),
  };
}

/** The speed bin of a speed in world units a second. */
export function speedBin(v: number): number {
  if (!(v > SPEED_MIN)) return 0;
  return Math.min(SPEED_BINS - 1, Math.floor(Math.log2(v / SPEED_MIN)) + 1);
}

/** The lower edge of a speed bin. */
export function speedEdge(b: number): number {
  return b <= 0 ? 0 : SPEED_MIN * Math.pow(2, b - 1);
}

/** Count a level's vertices (stride floats each, x y z first) into the mid grid. */
export function stepLevel(job: InsightJob, v: Float32Array, stride: number): void {
  const g = job.meta.grid;
  const mf = g.f * MID;
  for (let i = 0; i + 2 < v.length; i += stride) {
    const ix = Math.floor((v[i] - g.x0) / mf);
    const iz = Math.floor((v[i + 2] - g.z0) / mf);
    if (ix < 0 || iz < 0 || ix >= g.mx || iz >= g.mz) continue;
    job.mLevel[iz * g.mx + ix]++;
    job.levelVerts++;
  }
}

/** Fold one chunk in. Chunks come in row order: tracks are followed across them. */
export function stepInsight(job: InsightJob, ch: InsightChunk): void {
  const { meta, scope } = job;
  const g = meta.grid;
  const M = g.mx * g.mz;
  const C = g.cx * g.cz;
  const S = meta.sessions;
  const KILL = meta.kill;
  const DEATH = meta.death;
  const SPAWN = meta.spawn;
  const POS = meta.position;
  const contactKind = new Uint8Array(Math.max(1, meta.eventKinds));
  for (const k of meta.contact) if (k >= 0) contactKind[k] = 1;
  const cap = meta.dwellCap;
  const hasLife = meta.hasLife;
  const { px, py, pz, time, life, person, team, session, event, actor, cls, target } = ch;
  const vals = ch.values ?? [];
  const V = Math.min(vals.length, meta.values?.length ?? 0);
  const TV = job.teamVal.length / Math.max(1, meta.values?.length ?? 1);
  const PV = meta.persons;
  const shared = meta.personShared;
  const pairs = job.pairs;
  for (let j = 0; j < ch.n; j++) {
    const x = px[j];
    const y = py[j];
    const z = pz[j];
    // A row exactly at the origin is a converter's "no position" (an event it could not place), not a place.
    if (!(x === x && y === y && z === z) || (x === 0 && y === 0 && z === 0) || !rowShown(scope, ch, j)) continue;
    job.shown++;
    const s = session ? session[j] : -1;
    if (job.sessAny && s >= 0 && s < S) job.sessAny[s] = 1;
    const kind = event && meta.eventMap ? meta.eventMap[event[j]] ?? -1 : -1;
    const moving = POS < 0 || kind === POS;
    let d: number;
    if (hasLife) {
      const l = life ? life[j] : 0;
      d = l > 0 ? (l < cap ? l : cap) : 0;
    } else d = moving ? 1 : 0;
    let ix = Math.floor((x - g.x0) / g.f);
    let iz = Math.floor((z - g.z0) / g.f);
    ix = ix < 0 ? 0 : ix >= g.nx ? g.nx - 1 : ix;
    iz = iz < 0 ? 0 : iz >= g.nz ? g.nz - 1 : iz;
    const fi = iz * g.nx + ix;
    const mi = Math.floor(iz / MID) * g.mx + Math.floor(ix / MID);
    const ci = Math.floor(iz / COARSE) * g.cx + Math.floor(ix / COARSE);
    job.fPres[fi] += d;
    job.fY[fi] += y;
    job.fN[fi]++;
    job.mPres[mi] += d;
    job.presence += d;
    for (let c = 0; c < V; c++) {
      const col = vals[c];
      const v = col ? col[j] : 0;
      if (v === 0 || v !== v) continue;
      job.valTotal[c] += v;
      job.valRows[c]++;
      job.mVal[c * M + mi] += v;
      job.mValN[c * M + mi]++;
      const tg = team ? team[j] : -1;
      if (tg >= 0 && tg < TV) job.teamVal[c * TV + tg] += v;
      const pp = person ? person[j] : -1;
      if (pp >= 0 && pp < PV) job.personVal[c * PV + pp] += v;
    }
    const k = cls && meta.classMap ? meta.classMap[cls[j]] ?? -1 : -1;
    const ac = actor && meta.actorMap ? meta.actorMap[actor[j]] ?? -1 : -1;
    const tm = team ? team[j] : -1;
    if (tm >= 0 && tm < job.teamPres.length) job.teamPres[tm] += d;
    const st = job.sess;
    if (st && s >= 0 && s < st.S) {
      st.pres[s] += d;
      st.presC[s * C + ci] += d;
      if (kind >= 0) countSession(st, kind, s, M, mi);
    }
    if (kind >= 0) {
      job.events[kind]++;
      job.mEvents[kind * M + mi]++;
      if (kind === KILL) {
        job.fKills[fi]++;
        job.fKillY[fi] += y;
        if (k >= 0) job.cKills[k * C + ci]++;
        if (ac >= 0) job.cActKills[ac * C + ci]++;
        const tk = target && meta.targetMap ? meta.targetMap[target[j]] ?? -1 : -1;
        if (k >= 0 && tk >= 0) job.cTarget[tk * C + ci]++;
        if (tm >= 0 && tm < job.teamKills.length) {
          job.teamKills[tm]++;
          job.mTeamKills[tm * M + mi]++;
        }
      } else if (kind === DEATH) {
        job.fDeaths[fi]++;
        if (k >= 0) job.cDeaths[k * C + ci]++;
        if (ac >= 0) job.cActDeaths[ac * C + ci]++;
        if (tm >= 0 && tm < job.teamDeaths.length) {
          job.teamDeaths[tm]++;
          job.mTeamDeaths[tm * M + mi]++;
        }
      }
    }
    const p = person ? person[j] : -1;
    if (p < 0 || !job.pSess || (shared && shared[p])) continue;
    const t = time ? time[j] : NaN;
    const tr = job.tracks!;
    let a: number;
    let born = false;
    if (job.pSess[p] === s) a = job.pSlot![p];
    else {
      a = tr.slot(p, s, S);
      if (a < 0) {
        a = -a - 1;
        born = true;
      }
      job.pSess[p] = s;
      job.pSlot![p] = a;
    }
    if (kind === SPAWN || (tr.dead[a] && moving && kind !== DEATH)) born = true;
    if (born && time) {
      tr.life[a] = job.lives.push(x, y, z, mi, tm, t);
      if (ac === 1) job.lives.ai[tr.life[a]] = 1; // ACTORS[1] is the AI
      tr.dead[a] = 0;
      tr.away[a] = 0;
    }
    // In play once it has left the cell its life started in (a life of unknown start always is).
    const lifeNow = tr.life[a];
    if (!tr.away[a] && (lifeNow < 0 || job.lives.cell[lifeNow] !== mi)) tr.away[a] = 1;
    // Speed from the last movement sample.
    if (moving && time) {
      const lt = tr.t[a];
      if (lt === lt && t > lt) {
        const dt = t - lt;
        if (dt <= cap) tr.speed[a] = Math.hypot(x - tr.x[a], z - tr.z[a]) / dt;
      }
      tr.x[a] = x;
      tr.z[a] = z;
      tr.t[a] = t;
    }
    // Speed while in play: time waiting at a spawn (a freeze time, a parked unit) is no speed to die at.
    const sp = tr.speed[a];
    if (sp === sp && tr.away[a]) {
      const b = speedBin(sp);
      job.speedPres[b] += d;
      if (kind === DEATH) job.speedDeaths[b]++;
    }
    // The first minute of this life.
    const li = tr.life[a];
    if (li >= 0 && time && kind >= 0) {
      const lv = job.lives;
      const since = t - lv.start[li];
      if (contactKind[kind] && !(lv.contact[li] === lv.contact[li])) lv.contact[li] = since;
      if (since <= EARLY) {
        if (kind === KILL && lv.earlyKills[li] < 65535) lv.earlyKills[li]++;
        else if (kind === DEATH) lv.earlyDeath[li] = 1;
      }
    }
    if (kind === DEATH) {
      tr.dead[a] = 1;
      tr.life[a] = -1;
    }
    // Crossings, and the cells crossed lately for the flank credit.
    const ring = a * RING;
    if (moving && mi !== tr.cell[a]) {
      job.mPasses[mi]++;
      if (st && s >= 0 && s < st.S) countSession(st, meta.eventKinds, s, M, mi);
      tr.cell[a] = mi;
      const h = tr.ringHead[a];
      tr.ringCell[ring + h] = mi;
      tr.ringT[ring + h] = time ? t : 0;
      tr.ringHead[a] = (h + 1) % RING;
    }
    if (kind === KILL) {
      for (let r = 0; r < RING; r++) {
        const c = tr.ringCell[ring + r];
        if (c < 0 || c === mi) continue;
        if (time && t - tr.ringT[ring + r] > APPROACH) continue;
        let dup = false;
        for (let q = 0; q < r; q++) if (tr.ringCell[ring + q] === c) dup = true;
        if (!dup) {
          job.mApproach[c]++;
          if (st && s >= 0 && s < st.S) countSession(st, meta.eventKinds + 1, s, M, c);
        }
      }
    }
    // The player in this class.
    if (tr.cls[a] !== k) {
      tr.cls[a] = k;
      tr.pair[a] = pairs.of(p, k, meta.vehicleClasses);
    }
    const pi = tr.pair[a];
    pairs.presence[pi] += d;
    pairs.rows[pi]++;
    if (ac === 1) pairs.ai[pi]++; // ACTORS[1] is the AI
    if (kind === KILL) pairs.kills[pi]++;
    else if (kind === DEATH) pairs.deaths[pi]++;
  }
}
