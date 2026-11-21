/**
 * Comparing volumes: every measure of two or more volumes side by side, from
 * one pass over the rows the view shows (the filters, the hidden groups, the
 * time window, the match played back).
 *
 * The pass runs in a worker (`compareWorker.ts`) over chunks of the columns it
 * needs, copied off the dataset a slice at a time (`compareRun.ts`): the main
 * thread only copies memory, never visits a row, and a chunk at a time keeps
 * the copy small whatever the dataset's size. This module is the pass itself,
 * free of any thread, so the tests drive it directly.
 *
 * Per volume it counts the rows, the time spent inside (each row's gap to the
 * next sample, capped across long gaps as the volume statistics do), the
 * players, matches and teams seen, the events by the canonical event type
 * (`data/canonical.ts`), kills and deaths, the visits (in, stay, out) with the
 * distribution of how long they lasted, activity over the time into the
 * match, presence by team, vehicle class and player or AI, the mix of
 * directions where the rows have one, and per match the headline numbers -
 * the samples an effect size is worked out from. Between volumes it counts
 * the flow: which volume a track went to after which (overlapping volumes
 * count for the first in the list).
 */

import type { ActiveFilter } from '../render/types';
import { compiled, compiledContains, type CompiledVolume, type Volume } from './volume';

/** Bins of the time-into-match curves. */
export const CURVE_BINS = 60;
/** Visit lengths: log bins from `VISIT_MIN` seconds, `VISIT_PER_DECADE` a decade. */
export const VISIT_BINS = 48;
export const VISIT_MIN = 0.1;
export const VISIT_PER_DECADE = 8;
/** Direction sectors, the first centred on north (bearing 0). */
export const DIR_SECTORS = 8;
/** Packed bearing steps (render/direction.ts `DIR_STEPS`); 255 is "no direction". */
const DIR_STEPS = 255;

/** The per-match measures an effect size is worked out from. */
export const SESSION_METRICS = ['rows', 'presence', 'persons', 'entries', 'kills', 'deaths'] as const;
export type SessionMetric = (typeof SESSION_METRICS)[number];
const SM = SESSION_METRICS.length;

/** What the pass knows of the dataset besides the chunks. */
export interface CompareMeta {
  persons: number;
  teams: number;
  sessions: number;
  /** Per session, its start in dataset seconds; null without sessions. */
  sessionStart: Float32Array | null;
  /** Dataset seconds the curves count from when there are no sessions. */
  t0: number;
  /** Seconds the curves span: the longest match. */
  span: number;
  /** Most seconds one row's gap counts for. */
  dwellCap: number;
  /**
   * Per person, 1 when the name is worn by more than one moving thing
   * (`Dataset.personShared`): counted, but not followed as a track - its
   * samples alternate between creatures, so its visits and flow would be noise.
   */
  personShared: Uint8Array | null;
  /**
   * The taxonomies' sizes (`data/canonical.ts`, kept out of the worker's
   * imports) and where kill and death are in the event one.
   */
  eventKinds: number;
  vehicleClasses: number;
  actors: number;
  kill: number;
  death: number;
  /**
   * The event index of a movement sample, or -1 to follow tracks on every row.
   * Where the data has them, only movement samples move a track: an event row
   * can carry the other party's position (a hit logged from both sides).
   */
  position: number;
  /** Category index -> taxonomy index (-1 none), for the canonical columns present. */
  eventMap: Int8Array | null;
  actorMap: Int8Array | null;
  classMap: Int8Array | null;
  hasTime: boolean;
  hasLife: boolean;
  hasDir: boolean;
  /** Value columns to total (`data/cost.ts`: cost_*, earn_*, net_*), by name. */
  values?: string[];
}

/** Which rows show: the volume statistics' `Scope` with the time already applied by the chunking. */
export interface CompareScope {
  /** Inclusive time window; ±Infinity for all of it. */
  timeLo: number;
  timeHi: number;
  lifetimeNow: number | null;
  defaultLifetime: number;
  filters: ActiveFilter[];
  groupShown: Int8Array | null;
  session: number;
}

/** A slice of the columns, rows `[lo, lo + n)`. Absent columns are null. */
export interface CompareChunk {
  n: number;
  px: Float32Array;
  py: Float32Array;
  pz: Float32Array;
  time: Float32Array | null;
  life: Float32Array | null;
  person: Uint32Array | null;
  team: Uint16Array | null;
  session: Uint32Array | null;
  event: Uint32Array | null;
  actor: Uint32Array | null;
  cls: Uint32Array | null;
  dir: Uint8Array | null;
  /** One per scope filter, its column's slice (null: the column is missing, nothing shows). */
  filt: (ArrayLike<number> | null)[];
  /** One per `CompareMeta.values`, its column's slice. */
  values?: (Float32Array | null)[];
}

export interface VisitStats {
  n: number;
  mean: number;
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
  max: number;
  /** Visits per log bin (`VISIT_BINS`). */
  hist: number[];
}

export interface VolumeCompare {
  id: string;
  name: string;
  color: string;
  rows: number;
  /** Seconds inside, summed over everyone; null without per-row gaps. */
  presence: number | null;
  persons: number | null;
  sessions: number | null;
  teams: number | null;
  entries: number | null;
  exits: number | null;
  /** Rows by `EVENT_KINDS`; null without the event column. */
  events: number[] | null;
  kills: number | null;
  deaths: number | null;
  visits: VisitStats | null;
  /** Over the time into the match, `CURVE_BINS` bins over [0, span]. */
  curve: { rows: number[]; presence: number[]; kills: number[] } | null;
  byTeam: { rows: number[]; presence: number[]; kills: number[] } | null;
  byClass: { rows: number[]; presence: number[] } | null;
  byActor: { rows: number[]; presence: number[] } | null;
  /** Rows with a direction, by sector; null without directions. */
  dir: number[] | null;
  /** Per match (the matches with any row shown): mean and standard deviation of each `SESSION_METRICS`. */
  perMatch: { n: number; mean: number[]; sd: number[] } | null;
  /** Per match values, `SESSION_METRICS` major then match, for paired comparisons. */
  matchValues: Float64Array | null;
  /** Each value column's total inside, and by group and vehicle class (`CompareMeta.values`). */
  values: { name: string; total: number; byTeam: number[]; byClass: number[] }[] | null;
}

export interface CompareResult {
  volumes: VolumeCompare[];
  /** (n + 1) x (n + 1), row = from, column = to; index n is the start or end of a track. */
  flow: number[] | null;
  span: number;
  /** Matches seen (any row shown). */
  matches: number;
  shownRows: number;
  complete: boolean;
}

interface Acc {
  v: Volume;
  c: CompiledVolume;
  rows: number;
  presence: number;
  entries: number;
  exits: number;
  events: Float64Array | null;
  persons: Uint8Array | null;
  sessions: Uint8Array | null;
  teams: Uint8Array | null;
  visitHist: Float64Array;
  visitN: number;
  visitSum: number;
  visitMax: number;
  curveRows: Float64Array;
  curvePres: Float64Array;
  curveKills: Float64Array;
  teamRows: Float64Array;
  teamPres: Float64Array;
  teamKills: Float64Array;
  clsRows: Float64Array;
  clsPres: Float64Array;
  actRows: Float64Array;
  actPres: Float64Array;
  dir: Float64Array;
  /** Per match, `SM` measures each: [metric * sessions + session]. */
  sess: Float64Array | null;
  /** Per person: 0 unknown, 1 last shown sample outside, 2 inside. */
  last: Uint8Array | null;
  visitAcc: Float32Array | null;
  /** Per person: the session + 1 it was last counted in for `persons` per match. */
  seen: Int32Array | null;
  /** Value totals: per column, then per column x group and column x class. */
  val: Float64Array;
  teamVal: Float64Array;
  clsVal: Float64Array;
}

export interface CompareJob {
  meta: CompareMeta;
  scope: CompareScope;
  accs: Acc[];
  /** Per person: the session its tracking state belongs to. */
  personSess: Int32Array | null;
  /** Per person: the last volume it was in (-1 none yet), and where it is now (-2 unknown, -1 outside). */
  lastVol: Int16Array | null;
  curRegion: Int16Array | null;
  flow: Float64Array | null;
  sessAny: Uint8Array | null;
  shown: number;
  done: boolean;
}

export function createCompare(meta: CompareMeta, volumes: readonly Volume[], scope: CompareScope): CompareJob {
  const P = meta.persons;
  const S = meta.sessions;
  const tracks = P > 0 && meta.hasTime;
  const accs: Acc[] = volumes.map((v) => ({
    v,
    c: compiled(v),
    rows: 0,
    presence: 0,
    entries: 0,
    exits: 0,
    events: meta.eventMap ? new Float64Array(meta.eventKinds) : null,
    persons: P > 0 ? new Uint8Array(P) : null,
    sessions: S > 0 ? new Uint8Array(S) : null,
    teams: meta.teams > 0 ? new Uint8Array(meta.teams) : null,
    visitHist: new Float64Array(VISIT_BINS),
    visitN: 0,
    visitSum: 0,
    visitMax: 0,
    curveRows: new Float64Array(CURVE_BINS),
    curvePres: new Float64Array(CURVE_BINS),
    curveKills: new Float64Array(CURVE_BINS),
    teamRows: new Float64Array(meta.teams),
    teamPres: new Float64Array(meta.teams),
    teamKills: new Float64Array(meta.teams),
    clsRows: new Float64Array(meta.vehicleClasses),
    clsPres: new Float64Array(meta.vehicleClasses),
    actRows: new Float64Array(meta.actors),
    actPres: new Float64Array(meta.actors),
    dir: new Float64Array(DIR_SECTORS),
    sess: S > 0 ? new Float64Array(SM * S) : null,
    last: tracks ? new Uint8Array(P) : null,
    visitAcc: tracks ? new Float32Array(P) : null,
    seen: P > 0 && S > 0 ? new Int32Array(P) : null,
    val: new Float64Array(meta.values?.length ?? 0),
    teamVal: new Float64Array((meta.values?.length ?? 0) * meta.teams),
    clsVal: new Float64Array((meta.values?.length ?? 0) * meta.vehicleClasses),
  }));
  const n = volumes.length;
  return {
    meta,
    scope,
    accs,
    personSess: tracks ? new Int32Array(P).fill(-1) : null,
    lastVol: tracks ? new Int16Array(P).fill(-1) : null,
    curRegion: tracks ? new Int16Array(P).fill(-2) : null,
    flow: tracks ? new Float64Array((n + 1) * (n + 1)) : null,
    sessAny: S > 0 ? new Uint8Array(S) : null,
    shown: 0,
    done: false,
  };
}

/** The log bin of a visit length. */
export function visitBin(s: number): number {
  if (!(s > VISIT_MIN)) return 0;
  return Math.min(VISIT_BINS - 1, Math.floor(Math.log10(s / VISIT_MIN) * VISIT_PER_DECADE));
}

/** The lower edge of a visit bin, seconds. */
export function visitEdge(b: number): number {
  return VISIT_MIN * Math.pow(10, b / VISIT_PER_DECADE);
}

function closeVisit(a: Acc, p: number): void {
  const d = a.visitAcc![p];
  a.visitHist[visitBin(d)]++;
  a.visitN++;
  a.visitSum += d;
  if (d > a.visitMax) a.visitMax = d;
  a.visitAcc![p] = 0;
}

export function rowShown(sc: CompareScope, ch: CompareChunk, j: number, skip?: Uint8Array | null): boolean {
  if (ch.time) {
    const t = ch.time[j];
    if (sc.lifetimeNow !== null) {
      if (t > sc.lifetimeNow) return false;
      const life = ch.life ? ch.life[j] : -1;
      if (sc.lifetimeNow - t > (life >= 0 ? life : sc.defaultLifetime)) return false;
    } else if (t < sc.timeLo || t > sc.timeHi) return false;
  }
  if (sc.session >= 0 && ch.session && ch.session[j] !== sc.session) return false;
  if (sc.groupShown && ch.team) {
    const g = ch.team[j];
    if (g < sc.groupShown.length && sc.groupShown[g] === 0) return false;
  }
  for (let k = 0; k < sc.filters.length; k++) {
    // Filters a caller lets pass (the breakdown's deaths past an event-type filter).
    if (skip && skip[k]) continue;
    const f = sc.filters[k];
    const data = ch.filt[k];
    if (!data) return false;
    const v = data[j];
    if (f.kind === 'range') {
      if (!(v >= f.min && v <= f.max)) return false;
    } else {
      const c = Math.trunc(v);
      if (!f.mask || c < 0 || c >= f.mask.length || f.mask[c] === 0) return false;
    }
  }
  return true;
}

/** A packed bearing (render/direction.ts `packBearing`) per yaw, for rows whose direction is their view. */
export function packYaw(yaw: Float32Array): Uint8Array {
  const out = new Uint8Array(yaw.length);
  for (let i = 0; i < yaw.length; i++) {
    const v = yaw[i];
    if (!(v === v)) {
      out[i] = DIR_STEPS;
      continue;
    }
    let f = v / (Math.PI * 2);
    f -= Math.floor(f);
    const q = Math.round(f * DIR_STEPS);
    out[i] = q >= DIR_STEPS ? 0 : q;
  }
  return out;
}

/** Fold one chunk into the job. Chunks must come in row order: tracks are followed across them. */
export function stepCompare(job: CompareJob, ch: CompareChunk): void {
  const { meta, scope, accs } = job;
  const nv = accs.length;
  const S = meta.sessions;
  const inside = new Uint8Array(nv);
  const cap = meta.dwellCap;
  const span = Math.max(1e-9, meta.span);
  const KILL = meta.kill;
  const DEATH = meta.death;
  const { px, py, pz, time, life, person, team, session, event, actor, cls, dir } = ch;
  const vals = ch.values ?? [];
  const NV = Math.min(vals.length, meta.values?.length ?? 0);
  const T = meta.teams;
  const VC = meta.vehicleClasses;
  for (let j = 0; j < ch.n; j++) {
    const x = px[j];
    const y = py[j];
    const z = pz[j];
    if (!(x === x && y === y && z === z) || !rowShown(scope, ch, j)) continue;
    job.shown++;
    const s = session ? session[j] : -1;
    if (job.sessAny && s >= 0 && s < S) job.sessAny[s] = 1;
    const p = person ? person[j] : -1;
    const tracked = p >= 0 && !(meta.personShared && meta.personShared[p]);
    const kind = event && meta.eventMap ? meta.eventMap[event[j]] ?? -1 : -1;
    const moving = meta.position < 0 || kind === meta.position;
    // A track starts again in each match: close what the last one left open.
    if (job.personSess && tracked && job.personSess[p] !== s) {
      if (job.personSess[p] !== -1 || job.lastVol![p] >= 0) {
        for (let a = 0; a < nv; a++) {
          const acc = accs[a];
          if (acc.last![p] === 2) closeVisit(acc, p);
          acc.last![p] = 0;
        }
        const lv = job.lastVol![p];
        if (lv >= 0) job.flow![lv * (nv + 1) + nv]++;
      }
      job.personSess[p] = s;
      job.lastVol![p] = -1;
      job.curRegion![p] = -2;
    }
    const l = life ? life[j] : 0;
    const d = l > 0 ? (l < cap ? l : cap) : 0;
    let region = -1;
    for (let a = 0; a < nv; a++) {
      const c = accs[a].c;
      inside[a] =
        x >= c.min[0] && x <= c.max[0] && y >= c.min[1] && y <= c.max[1] && z >= c.min[2] && z <= c.max[2] && compiledContains(c, x, y, z)
          ? 1
          : 0;
      if (inside[a] && region < 0) region = a;
    }
    // The flow: a track arriving in a volume, from the volume it was last in (or its start).
    if (job.curRegion && tracked && moving) {
      const cur = job.curRegion[p];
      if (region >= 0 && region !== cur) {
        const from = job.lastVol![p];
        job.flow![(from >= 0 ? from : nv) * (nv + 1) + region]++;
        job.lastVol![p] = region;
      }
      job.curRegion[p] = region;
    }
    let bin = -1;
    if (time) {
      const t0 = s >= 0 && meta.sessionStart && s < meta.sessionStart.length ? meta.sessionStart[s] : meta.t0;
      bin = Math.floor(((time[j] - t0) / span) * CURVE_BINS);
      bin = bin < 0 ? 0 : bin >= CURVE_BINS ? CURVE_BINS - 1 : bin;
    }
    for (let a = 0; a < nv; a++) {
      const acc = accs[a];
      const inn = inside[a] === 1;
      let entered = false;
      if (acc.last && tracked && !moving) {
        if (acc.last[p] === 2) acc.visitAcc![p] += d;
      } else if (acc.last && tracked) {
        const prev = acc.last[p];
        if (inn) {
          if (prev === 1) {
            acc.entries++;
            entered = true;
          }
          if (prev !== 2) acc.visitAcc![p] = 0;
          acc.visitAcc![p] += d;
        } else if (prev === 2) {
          acc.exits++;
          closeVisit(acc, p);
        }
        acc.last[p] = inn ? 2 : 1;
      }
      if (!inn) continue;
      acc.rows++;
      acc.presence += d;
      if (acc.persons && p >= 0) acc.persons[p] = 1;
      if (acc.sessions && s >= 0) acc.sessions[s] = 1;
      if (acc.teams && team) acc.teams[team[j]] = 1;
      if (kind >= 0) acc.events![kind]++;
      if (bin >= 0) {
        acc.curveRows[bin]++;
        acc.curvePres[bin] += d;
        if (kind === KILL) acc.curveKills[bin]++;
      }
      if (team) {
        const g = team[j];
        if (g < meta.teams) {
          acc.teamRows[g]++;
          acc.teamPres[g] += d;
          if (kind === KILL) acc.teamKills[g]++;
        }
      }
      if (cls && meta.classMap) {
        const k = meta.classMap[cls[j]] ?? -1;
        if (k >= 0) {
          acc.clsRows[k]++;
          acc.clsPres[k] += d;
        }
      }
      if (actor && meta.actorMap) {
        const k = meta.actorMap[actor[j]] ?? -1;
        if (k >= 0) {
          acc.actRows[k]++;
          acc.actPres[k] += d;
        }
      }
      if (dir) {
        const q = dir[j];
        if (q < DIR_STEPS) acc.dir[Math.floor(((q / DIR_STEPS) * DIR_SECTORS + 0.5) % DIR_SECTORS)]++;
      }
      for (let c = 0; c < NV; c++) {
        const col = vals[c];
        const v = col ? col[j] : 0;
        if (v === 0 || v !== v) continue;
        acc.val[c] += v;
        if (team && team[j] < T) acc.teamVal[c * T + team[j]] += v;
        if (cls && meta.classMap) {
          const k = meta.classMap[cls[j]] ?? -1;
          if (k >= 0) acc.clsVal[c * VC + k] += v;
        }
      }
      if (acc.sess && s >= 0 && s < S) {
        const m = acc.sess;
        m[0 * S + s]++;
        m[1 * S + s] += d;
        if (acc.seen && p >= 0 && acc.seen[p] !== s + 1) {
          acc.seen[p] = s + 1;
          m[2 * S + s]++;
        }
        if (entered) m[3 * S + s]++;
        if (kind === KILL) m[4 * S + s]++;
        else if (kind === DEATH) m[5 * S + s]++;
      }
    }
  }
}

function ones(a: Uint8Array | null): number | null {
  if (!a) return null;
  let n = 0;
  for (let i = 0; i < a.length; i++) n += a[i];
  return n;
}

/** The value at fraction `q` of the visit histogram, interpolated on the log scale within its bin. */
export function visitQuantile(hist: ArrayLike<number>, n: number, q: number): number {
  if (n <= 0) return NaN;
  const target = q * n;
  let seen = 0;
  for (let b = 0; b < hist.length; b++) {
    const c = hist[b];
    if (c > 0 && seen + c >= target) {
      const f = Math.min(1, Math.max(0, (target - seen) / c));
      return b === 0 ? VISIT_MIN * f : visitEdge(b + f);
    }
    seen += c;
  }
  return visitEdge(hist.length);
}

/** Close what is still open and say the result. The job is spent afterwards. */
export function finishCompare(job: CompareJob, complete = true): CompareResult {
  const { meta, accs } = job;
  const nv = accs.length;
  const S = meta.sessions;
  const KILL = meta.kill;
  const DEATH = meta.death;
  // Visits still open at the end, and tracks' last volumes to their end.
  if (job.personSess) {
    for (let p = 0; p < meta.persons; p++) {
      for (const acc of accs) if (acc.last![p] === 2) closeVisit(acc, p);
      const lv = job.lastVol![p];
      if (lv >= 0) job.flow![lv * (nv + 1) + nv]++;
    }
  }
  const sessIdx: number[] = [];
  if (job.sessAny) for (let s = 0; s < S; s++) if (job.sessAny[s]) sessIdx.push(s);
  const tracks = !!job.personSess;
  const volumes = accs.map((acc): VolumeCompare => {
    const events = acc.events ? Array.from(acc.events) : null;
    let perMatch: VolumeCompare['perMatch'] = null;
    if (acc.sess && sessIdx.length > 0) {
      const mean: number[] = [];
      const sd: number[] = [];
      for (let m = 0; m < SM; m++) {
        let sum = 0;
        for (const s of sessIdx) sum += acc.sess[m * S + s];
        const mu = sum / sessIdx.length;
        let ss = 0;
        for (const s of sessIdx) ss += (acc.sess[m * S + s] - mu) ** 2;
        mean.push(mu);
        sd.push(sessIdx.length > 1 ? Math.sqrt(ss / (sessIdx.length - 1)) : 0);
      }
      perMatch = { n: sessIdx.length, mean, sd };
    }
    let matchValues: Float64Array | null = null;
    if (acc.sess && sessIdx.length > 0) {
      matchValues = new Float64Array(SM * sessIdx.length);
      for (let m = 0; m < SM; m++) for (let k = 0; k < sessIdx.length; k++) matchValues[m * sessIdx.length + k] = acc.sess[m * S + sessIdx[k]];
    }
    const vn = acc.visitN;
    return {
      id: acc.v.id,
      name: acc.v.name,
      color: acc.v.color,
      rows: acc.rows,
      presence: meta.hasLife ? acc.presence : null,
      persons: ones(acc.persons),
      sessions: ones(acc.sessions),
      teams: ones(acc.teams),
      entries: tracks ? acc.entries : null,
      exits: tracks ? acc.exits : null,
      events,
      kills: events ? events[KILL] : null,
      deaths: events ? events[DEATH] : null,
      visits:
        tracks && meta.hasLife
          ? {
              n: vn,
              mean: vn > 0 ? acc.visitSum / vn : NaN,
              p5: visitQuantile(acc.visitHist, vn, 0.05),
              p25: visitQuantile(acc.visitHist, vn, 0.25),
              p50: visitQuantile(acc.visitHist, vn, 0.5),
              p75: visitQuantile(acc.visitHist, vn, 0.75),
              p95: visitQuantile(acc.visitHist, vn, 0.95),
              max: acc.visitMax,
              hist: Array.from(acc.visitHist),
            }
          : null,
      curve: meta.hasTime ? { rows: Array.from(acc.curveRows), presence: Array.from(acc.curvePres), kills: Array.from(acc.curveKills) } : null,
      byTeam: meta.teams > 0 ? { rows: Array.from(acc.teamRows), presence: Array.from(acc.teamPres), kills: Array.from(acc.teamKills) } : null,
      byClass: meta.classMap ? { rows: Array.from(acc.clsRows), presence: Array.from(acc.clsPres) } : null,
      byActor: meta.actorMap ? { rows: Array.from(acc.actRows), presence: Array.from(acc.actPres) } : null,
      dir: meta.hasDir ? Array.from(acc.dir) : null,
      perMatch,
      matchValues,
      values: meta.values?.length
        ? meta.values.map((name, c) => ({
            name,
            total: acc.val[c],
            byTeam: Array.from(acc.teamVal.subarray(c * meta.teams, (c + 1) * meta.teams)),
            byClass: Array.from(acc.clsVal.subarray(c * meta.vehicleClasses, (c + 1) * meta.vehicleClasses)),
          }))
        : null,
    };
  });
  return {
    volumes,
    flow: job.flow ? Array.from(job.flow) : null,
    span: meta.span,
    matches: sessIdx.length,
    shownRows: job.shown,
    complete,
  };
}

// ---------------------------------------------------------------------------
// Effect sizes: how far apart two volumes are, on a scale that does not depend
// on the measure's units.

/**
 * Cohen's d of B against A over the matches, paired when both were measured
 * over the same matches (the usual case: the same rows, two regions): the mean
 * difference over the spread of the differences. NaN with fewer than two
 * matches or no spread.
 */
export function pairedEffect(a: ArrayLike<number>, b: ArrayLike<number>): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return NaN;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += b[i] - a[i];
  const mu = sum / n;
  let ss = 0;
  for (let i = 0; i < n; i++) ss += (b[i] - a[i] - mu) ** 2;
  const sd = Math.sqrt(ss / (n - 1));
  if (!(sd > 0)) return mu === 0 ? 0 : NaN;
  return mu / sd;
}

/** One measure's per-match values out of a volume's `matchValues`. */
export function matchSeries(v: VolumeCompare, m: SessionMetric): Float64Array | null {
  if (!v.matchValues || !v.perMatch) return null;
  const k = SESSION_METRICS.indexOf(m);
  const n = v.perMatch.n;
  return v.matchValues.subarray(k * n, (k + 1) * n);
}

/**
 * Cliff's delta of B against A from two histograms over the same bins:
 * P(B > A) - P(B < A), values in one bin counted as ties. -1..1.
 */
export function cliffsDelta(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) na += a[i];
  for (let i = 0; i < b.length; i++) nb += b[i];
  if (na === 0 || nb === 0) return NaN;
  let below = 0;
  let more = 0;
  let less = 0;
  for (let i = 0; i < b.length; i++) {
    const above = na - below - (a[i] ?? 0);
    more += b[i] * below;
    less += b[i] * above;
    below += a[i] ?? 0;
  }
  return (more - less) / (na * nb);
}

/** The usual words for an effect's size: |d| under 0.2 none, under 0.5 small, under 0.8 medium, else large. */
export function effectWord(d: number, cliff = false): 'none' | 'small' | 'medium' | 'large' | null {
  if (!Number.isFinite(d)) return null;
  const x = Math.abs(d);
  // Cliff's delta thresholds (Romano et al.): 0.147, 0.33, 0.474.
  const [s, m, l] = cliff ? [0.147, 0.33, 0.474] : [0.2, 0.5, 0.8];
  return x < s ? 'none' : x < m ? 'small' : x < l ? 'medium' : 'large';
}
