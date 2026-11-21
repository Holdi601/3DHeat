/**
 * The outcome analysis' features (docs/outcome-analysis.md): every side of
 * every round of one map (a "side-round"), what it did - where it was in each
 * part of the round, which route its lives took first, who drew first blood
 * and where, whether it kept together, how fast it pushed out, whether it fell
 * back, which objective it took first, what it fielded - as a set of yes/no
 * features, with the side-round's result and what the test needs to allow for
 * (the score at the time, how strong its players are, when it was played).
 *
 * Pure: fed the matches' `MovesSection`s (`types.ts`), run in a worker.
 */

import { VEHICLE_CLASSES } from '../data/canonical';
import { D_STRIDE, livesOf, O_STRIDE, R_STRIDE, type MovesData } from './types';

/** One match of a group, as the worker hands it over. */
export interface OutcomeMatch {
  /** The match's index in the caller's list (the mass store's). */
  i: number;
  /** Milliseconds since 1970 it started, where known (the folds are by date). */
  started: number | null;
  /** Team names by slot. */
  teams: string[];
  mv: MovesData;
  /**
   * The round outcome section of the summary (`mass/types.ts` OutcomeSection: `r` by 3, `u` unit-rounds by 7),
   * for the buys, where the data has them.
   */
  rounds?: { r: number[]; u: number[] } | null;
  /** The ground's height: the summary grid's cells (`cell`, `ix`, `iz`, mean height `y`, presence `p`). */
  ground?: { cell: number; ix: number[]; iz: number[]; y: number[]; p: number[] } | null;
}

/** Nice window lengths, seconds: the first window of a map is the one nearest an eighth of its median round. */
const NICE_WINDOWS = [5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 300, 600, 900, 1800];
/** Windows a round is cut into: [0, b), [b, 2b), [2b, 4b), [4b, 8b). */
export const WINDOWS = 4;
/** Zones across the map, about. */
const ZONES_ACROSS = 12;
/** Points a route is compared at. */
export const ROUTE_POINTS = 8;
/** Lives the route clustering seeds its routes from at most. */
const ROUTE_SEED = 6000;
/** A life's share of a route's lives below which a route is folded into "none". */
const ROUTE_MIN_SHARE = 0.03;
/** Classes that fly. */
const AIR = new Set<string>(['fighter', 'attack', 'bomber', 'otherAir', 'helicopter', 'weapon', 'decoy']);
/** Classes a line-up is told by: what is driven, not weapons, decoys or buildings. */
const FIELDED = new Set<string>(VEHICLE_CLASSES.filter((c) => !['weapon', 'decoy', 'structure', 'other'].includes(c)));
/** Share of a side's lives that must be in a zone (two samples or more) for the side to hold it. */
const HOLD_SHARE = 0.2;
/** Share of a side's starts in a zone that make it the side's spawn (holding it says nothing). */
const SPAWN_SHARE = 0.2;

export type FeatureKind = 'hold' | 'route' | 'firstKill' | 'firstKillAt' | 'earlyContact' | 'fight' | 'grouped' | 'fast' | 'retreat' | 'capFirst' | 'capFast' | 'capZone' | 'cls' | 'clsMore' | 'buyFull' | 'buyAdv';

export interface FeatureDef {
  id: number;
  key: string;
  kind: FeatureKind;
  /** The side it is about (index into `OutcomeGroup.sides`). */
  side: number;
  zone?: number;
  window?: number;
  route?: number;
  /** An objective's name, or a vehicle class. */
  name?: string;
  /**
   * When it is known, seconds into the round: the score then is what the test
   * allows for (a pattern that only shows when a side is already ahead).
   */
  at: number;
}

export interface SideRound {
  match: number;
  /** Index of the match in the group's `matches`, the round's index in it, its number. */
  m: number;
  round: number;
  roundNo: number;
  side: number;
  slot: number;
  won: number;
  /** Seconds the round lasted. */
  len: number;
  /** Global player ids. */
  players: number[];
  feats: Set<number>;
  /** The side's kills minus losses, and objectives held minus the other side's, at each window's start. */
  /** The data's team name, as an index into `OutcomeGroup.teams`: where sides are told apart by spawn, a confounder of its own. */
  team: number;
  killLead: number[];
  objLead: number[];
  /** When the round began, seconds of the match's clock (for a jump to it). */
  t0: number;
}

export interface RouteDef {
  side: number;
  /** The mean path, world x, z by `ROUTE_POINTS`. */
  path: number[];
  lives: number;
  share: number;
  flank: boolean;
}

export interface OutcomeGroup {
  key: string;
  sides: string[];
  /** The data's team names the side-rounds' `team` points into. */
  teams: string[];
  /** Whether the sides are the data's teams or were told apart by where they start (named by the place there, where the data names places). */
  sidesBy: 'team' | 'spawn' | 'place';
  /** Spawn centroid of each side, world x, z. */
  spawns: [number, number][];
  zone: number;
  /** Zones by index: the cell `ix, iz` (`ix * zone` world units), its height, a name (callout or objective) where known. */
  zones: { ix: number; iz: number; y: number; place: string | null }[];
  /** Zone index by `zoneKey`. */
  zoneIndex: Map<number, number>;
  /** Window length `b`, seconds; windows are [0, b), [b, 2b), [2b, 4b), [4b, 8b). */
  b: number;
  windows: [number, number][];
  /** Median round length, seconds. */
  median: number;
  routes: RouteDef[];
  objectives: { name: string; x: number; z: number }[];
  features: FeatureDef[];
  rounds: SideRound[];
  /** The matches, without their moves (dropped once read). */
  matches: Pick<OutcomeMatch, 'i' | 'started' | 'teams'>[];
  /** Player names by global id. */
  players: string[];
  /** For the time slider: per side-round, the zones it held in each slice (`slice` seconds), as `slice * 65536 + zone`. */
  slice: number;
  slices: number;
  held: Int32Array[];
}

const quantile = (v: number[], q: number) => {
  if (!v.length) return NaN;
  const s = [...v].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.floor(q * (s.length - 1) + 0.5)))];
};

interface LifeW {
  side: number;
  start: number;
  /** Times (seconds from the round's start) and positions. */
  t: Float64Array;
  x: Float64Array;
  z: Float64Array;
  cls: number;
}

/** Where every side-round's lives were, read once from the matches. */
interface RoundRaw {
  m: number;
  ri: number;
  slots: number[];
  winner: number;
  len: number;
  lives: LifeW[];
  deaths: { t: number; x: number; z: number; slot: number }[];
  caps: { t: number; zone: number; slot: number }[];
  players: Map<number, Set<number>>;
  t0: number;
}

function readRounds(matches: OutcomeMatch[], playerId: (s: string) => number): RoundRaw[] {
  const out: RoundRaw[] = [];
  matches.forEach((mt, m) => {
    const mv = mt.mv;
    const nR = Math.floor(mv.r.length / R_STRIDE);
    const rounds: RoundRaw[] = [];
    for (let ri = 0; ri < nR; ri++)
      rounds.push({ m, ri, slots: [], winner: mv.r[ri * R_STRIDE + 3], len: mv.r[ri * R_STRIDE + 2] * mv.dt, lives: [], deaths: [], caps: [], players: new Map(), t0: mv.r[ri * R_STRIDE + 1] * mv.dt });
    const pid = mv.players.map(playerId);
    for (const lf of livesOf(mv)) {
      const r = rounds[lf.round];
      if (!r) continue;
      const t = new Float64Array(lf.n);
      const x = new Float64Array(lf.n);
      const z = new Float64Array(lf.n);
      for (let j = 0; j < lf.n; j++) {
        t[j] = (lf.start + j) * mv.dt;
        x[j] = mv.l[lf.at + j * 2] * mv.q;
        z[j] = mv.l[lf.at + j * 2 + 1] * mv.q;
      }
      r.lives.push({ side: lf.slot, start: lf.start * mv.dt, t, x, z, cls: lf.cls });
      if (lf.player >= 0) {
        let s = r.players.get(lf.slot);
        if (!s) r.players.set(lf.slot, (s = new Set()));
        s.add(pid[lf.player]);
      }
    }
    for (let k = 0; k + D_STRIDE <= mv.d.length; k += D_STRIDE) {
      const r = rounds[mv.d[k]];
      if (r) r.deaths.push({ t: mv.d[k + 1] / 10, x: mv.d[k + 2] * mv.q, z: mv.d[k + 3] * mv.q, slot: mv.d[k + 4] });
    }
    if (mv.o)
      for (let k = 0; k + O_STRIDE <= mv.o.length; k += O_STRIDE) {
        const r = rounds[mv.o[k]];
        if (r) r.caps.push({ t: mv.o[k + 1] / 10, zone: mv.o[k + 2], slot: mv.o[k + 3] });
      }
    for (const r of rounds) {
      r.deaths.sort((a, b) => a.t - b.t);
      r.caps.sort((a, b) => a.t - b.t);
      if (r.winner >= 0 && r.lives.length) out.push(r);
    }
  });
  return out;
}

/** Each side's mean buy in a round (by its number) from the summary's unit-rounds; null without buys. */
const buyMemo = new WeakMap<object, Map<number, Map<number, number>>>();
function buyOf(m: OutcomeMatch, roundNo: number): Map<number, number> | null {
  const o = m.rounds;
  if (!o || !o.u?.length) return null;
  let by = buyMemo.get(o);
  if (!by) {
    const sums = new Map<number, Map<number, [number, number]>>();
    for (let k = 0; k + 6 < o.u.length; k += 7) {
      const b = o.u[k + 5];
      if (b < 0) continue;
      const rn = o.r[o.u[k] * 3];
      let s = sums.get(rn);
      if (!s) sums.set(rn, (s = new Map()));
      const a = s.get(o.u[k + 1]) ?? [0, 0];
      a[0] += b;
      a[1]++;
      s.set(o.u[k + 1], a);
    }
    by = new Map([...sums].map(([rn, s]) => [rn, new Map([...s].map(([slot, [sum, n]]) => [slot, sum / n]))]));
    buyMemo.set(o, by);
  }
  return by.get(roundNo) ?? null;
}

/** 2-means of points (a few rounds of Lloyd's from the two farthest apart). */
function twoMeans(p: [number, number][]): { c: [[number, number], [number, number]]; of: number[] } {
  let a = p[0];
  let b = p[0];
  let best = -1;
  for (const q of p) {
    const d = (q[0] - a[0]) ** 2 + (q[1] - a[1]) ** 2;
    if (d > best) [best, b] = [d, q];
  }
  best = -1;
  for (const q of p) {
    const d = (q[0] - b[0]) ** 2 + (q[1] - b[1]) ** 2;
    if (d > best) [best, a] = [d, q];
  }
  let c: [[number, number], [number, number]] = [[...a], [...b]];
  let of: number[] = [];
  for (let it = 0; it < 8; it++) {
    of = p.map((q) => ((q[0] - c[0][0]) ** 2 + (q[1] - c[0][1]) ** 2 <= (q[0] - c[1][0]) ** 2 + (q[1] - c[1][1]) ** 2 ? 0 : 1));
    const s = [[0, 0, 0], [0, 0, 0]];
    p.forEach((q, i) => {
      s[of[i]][0] += q[0];
      s[of[i]][1] += q[1];
      s[of[i]][2]++;
    });
    c = [s[0][2] ? [s[0][0] / s[0][2], s[0][1] / s[0][2]] : c[0], s[1][2] ? [s[1][0] / s[1][2], s[1][1] / s[1][2]] : c[1]];
  }
  return { c, of };
}

/**
 * The two ends of a map from each round's spawns: 2-means where a round's two
 * sides always go to different ends (whichever way round costs less), so a map
 * played on two layouts is not split by layout instead of by end.
 */
function pairedEnds(sp: { r: number; p: [number, number] }[]): { c: [[number, number], [number, number]]; of: number[] } {
  let { c } = twoMeans(sp.map((s) => s.p));
  const byRound = new Map<number, number[]>();
  sp.forEach((s, i) => {
    const l = byRound.get(s.r);
    if (l) l.push(i);
    else byRound.set(s.r, [i]);
  });
  const d2 = (p: [number, number], q: [number, number]) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;
  const of = new Array<number>(sp.length).fill(0);
  for (let it = 0; it < 10; it++) {
    for (const l of byRound.values()) {
      if (l.length === 2) {
        const [a, b] = l;
        const straight = d2(sp[a].p, c[0]) + d2(sp[b].p, c[1]);
        const swapped = d2(sp[a].p, c[1]) + d2(sp[b].p, c[0]);
        of[a] = straight <= swapped ? 0 : 1;
        of[b] = 1 - of[a];
      } else for (const i of l) of[i] = d2(sp[i].p, c[0]) <= d2(sp[i].p, c[1]) ? 0 : 1;
    }
    const sum = [[0, 0, 0], [0, 0, 0]];
    sp.forEach((s, i) => {
      sum[of[i]][0] += s.p[0];
      sum[of[i]][1] += s.p[1];
      sum[of[i]][2]++;
    });
    c = [sum[0][2] ? [sum[0][0] / sum[0][2], sum[0][1] / sum[0][2]] : c[0], sum[1][2] ? [sum[1][0] / sum[1][2], sum[1][1] / sum[1][2]] : c[1]];
  }
  return { c, of };
}

/** A life's first `span` seconds as `ROUTE_POINTS` points evenly in time (null when it moved too little to say). */
function routeOf(l: LifeW, span: number): number[] | null {
  if (l.t.length < 3) return null;
  const t0 = l.t[0];
  const out: number[] = [];
  let j = 0;
  for (let k = 0; k < ROUTE_POINTS; k++) {
    const tt = t0 + (span * k) / (ROUTE_POINTS - 1);
    while (j + 1 < l.t.length && l.t[j + 1] <= tt) j++;
    if (j + 1 < l.t.length && l.t[j + 1] > l.t[j]) {
      const f = Math.min(1, Math.max(0, (tt - l.t[j]) / (l.t[j + 1] - l.t[j])));
      out.push(l.x[j] + (l.x[j + 1] - l.x[j]) * f, l.z[j] + (l.z[j + 1] - l.z[j]) * f);
    } else out.push(l.x[j], l.z[j]);
  }
  return out;
}

const routeDist = (a: ArrayLike<number>, b: ArrayLike<number>) => {
  let s = 0;
  for (let k = 0; k < ROUTE_POINTS; k++) s += Math.hypot(a[k * 2] - b[k * 2], a[k * 2 + 1] - b[k * 2 + 1]);
  return s / ROUTE_POINTS;
};

/**
 * The routes of one side: leader clustering at `tau` (a life joins the
 * nearest route within it, else starts one), then a few rounds of mean paths
 * and reassignment; routes under `ROUTE_MIN_SHARE` of the lives folded away.
 * Returns the mean paths and each life's route (-1 none).
 */
export function clusterRoutes(paths: number[][], tau: number): { centres: number[][]; of: Int32Array } {
  const of = new Int32Array(paths.length).fill(-1);
  if (!paths.length) return { centres: [], of };
  // A fixed spread of the lives seeds the routes, so the result does not hang on the order of the files.
  const step = Math.max(1, Math.floor(paths.length / ROUTE_SEED));
  let centres: number[][] = [];
  for (let i = 0; i < paths.length; i += step) {
    let best = -1, bd = Infinity;
    centres.forEach((c, k) => {
      const d = routeDist(paths[i], c);
      if (d < bd) [bd, best] = [d, k];
    });
    if (best < 0 || bd > tau) centres.push(paths[i].slice());
  }
  for (let it = 0; it < 4; it++) {
    if (!centres.length) {
      of.fill(-1);
      break;
    }
    const sum = centres.map(() => new Float64Array(ROUTE_POINTS * 2));
    const n = new Int32Array(centres.length);
    for (let i = 0; i < paths.length; i++) {
      let best = 0, bd = Infinity;
      for (let k = 0; k < centres.length; k++) {
        const d = routeDist(paths[i], centres[k]);
        if (d < bd) [bd, best] = [d, k];
      }
      of[i] = best;
      n[best]++;
      for (let q = 0; q < ROUTE_POINTS * 2; q++) sum[best][q] += paths[i][q];
    }
    const keep: number[] = [];
    centres = centres.map((c, k) => (n[k] ? Array.from(sum[k], (v) => v / n[k]) : c));
    for (let k = 0; k < centres.length; k++) if (n[k] >= Math.max(3, paths.length * ROUTE_MIN_SHARE)) keep.push(k);
    if (keep.length !== centres.length || it === 3) {
      if (it === 3) {
        const map = new Int32Array(centres.length).fill(-1);
        keep.forEach((k, j) => (map[k] = j));
        for (let i = 0; i < of.length; i++) of[i] = map[of[i]];
        centres = keep.map((k) => centres[k]);
        break;
      }
      centres = keep.map((k) => centres[k]);
    }
  }
  return { centres, of };
}

/** A zone's key: its cell at `zone` world units. */
export const zoneKey = (zone: number, x: number, z: number) => (Math.floor(x / zone) + 32768) * 65536 + (Math.floor(z / zone) + 32768);

/** The group of matches of one map as side-rounds with their features. */
export function buildGroup(key: string, matches: OutcomeMatch[]): OutcomeGroup | null {
  const playerOf = new Map<string, number>();
  const players: string[] = [];
  const playerId = (s: string) => {
    let i = playerOf.get(s);
    if (i === undefined) {
      playerOf.set(s, (i = players.length));
      players.push(s);
    }
    return i;
  };
  const raw = readRounds(matches, playerId);
  if (raw.length < 4) return null;

  // ---- sides: the teams' names, or where they start when a name does not keep to one end of the map
  const nameCount = new Map<string, number>();
  for (const r of raw) for (const l of r.lives) {
    const nm = matches[r.m].teams[l.side] ?? String(l.side);
    nameCount.set(nm, (nameCount.get(nm) ?? 0) + 1);
  }
  const names = [...nameCount].sort((a, b) => b[1] - a[1]).slice(0, 2).map((e) => e[0]).sort();
  if (names.length < 2) return null;
  // Each side-round's spawn: the mean first point of the lives that began in its first moments.
  const spawnOf = (r: RoundRaw, slot: number): [number, number] | null => {
    let sx = 0, sz = 0, n = 0;
    const early = Math.max(10, r.len * 0.05);
    for (const l of r.lives) if (l.side === slot && l.start <= early) {
      sx += l.x[0];
      sz += l.z[0];
      n++;
    }
    return n ? [sx / n, sz / n] : null;
  };
  const sp: { r: number; slot: number; name: number; p: [number, number] }[] = [];
  raw.forEach((r, ri) => {
    for (let slot = 0; slot < matches[r.m].teams.length; slot++) {
      const nm = names.indexOf(matches[r.m].teams[slot] ?? String(slot));
      if (nm < 0) continue;
      const p = spawnOf(r, slot);
      if (p) sp.push({ r: ri, slot, name: nm, p });
    }
  });
  if (sp.length < 8) return null;
  const km = pairedEnds(sp);
  const agree = sp.filter((s, i) => km.of[i] === s.name).length / sp.length;
  const spread = Math.hypot(km.c[0][0] - km.c[1][0], km.c[0][1] - km.c[1][1]);
  // The names keep to their ends (or the ends are not apart): sides are the names; else the two ends.
  const byName = agree >= 0.85 || agree <= 0.15 || !(spread > 0);
  const sideOfSp = new Map<string, number>();
  sp.forEach((s, i) => sideOfSp.set(`${s.r}|${s.slot}`, byName ? s.name : km.of[i]));
  // A side with no early start in a round (the data begins after its spawn) is the other end from its opponent's:
  // left out, the rounds a side is seen in would not be a fair sample of its rounds.
  if (!byName)
    raw.forEach((r, ri) => {
      const slots = matches[r.m].teams.length;
      if (slots !== 2) return;
      const a0 = sideOfSp.get(`${ri}|0`);
      const a1 = sideOfSp.get(`${ri}|1`);
      if (a0 === undefined && a1 !== undefined) sideOfSp.set(`${ri}|0`, 1 - a1);
      else if (a1 === undefined && a0 !== undefined) sideOfSp.set(`${ri}|1`, 1 - a0);
    });
  const sides = byName ? [...names] : ['A', 'B'];
  const spawnSum = [[0, 0, 0], [0, 0, 0]];
  sp.forEach((s, i) => {
    const side = byName ? s.name : km.of[i];
    spawnSum[side][0] += s.p[0];
    spawnSum[side][1] += s.p[1];
    spawnSum[side][2]++;
  });
  const spawns = spawnSum.map((s) => [s[0] / Math.max(1, s[2]), s[1] / Math.max(1, s[2])] as [number, number]);

  // ---- the frame: zones, windows
  const xs: number[] = [];
  const zs: number[] = [];
  const lens: number[] = [];
  // The map's span from the ground lives where most are on the ground: aircraft range far wider.
  let ground = 0, all = 0;
  for (const r of raw) for (const l of r.lives) {
    all++;
    if (!(l.cls >= 0 && AIR.has(VEHICLE_CLASSES[l.cls]))) ground++;
  }
  const groundOnly = ground >= all * 0.5;
  for (const r of raw) {
    lens.push(r.len);
    for (const l of r.lives) for (let j = 0; j < l.t.length; j += 3) {
      if (groundOnly && l.cls >= 0 && AIR.has(VEHICLE_CLASSES[l.cls])) break;
      xs.push(l.x[j]);
      zs.push(l.z[j]);
    }
  }
  const span = Math.max(quantile(xs, 0.98) - quantile(xs, 0.02), quantile(zs, 0.98) - quantile(zs, 0.02));
  const zone = 2 ** Math.round(Math.log2(Math.max(1e-3, span / ZONES_ACROSS)));
  const median = quantile(lens, 0.5);
  const b = NICE_WINDOWS.find((w) => w >= median / 8) ?? NICE_WINDOWS[NICE_WINDOWS.length - 1];
  const windows: [number, number][] = [[0, b], [b, 2 * b], [2 * b, 4 * b], [4 * b, 8 * b]];
  const zoneIdx = new Map<number, number>();
  const zones: OutcomeGroup['zones'] = [];
  const zk = (x: number, z: number) => zoneKey(zone, x, z);
  const zoneAt = (x: number, z: number) => {
    const k = zk(x, z);
    let i = zoneIdx.get(k);
    if (i === undefined) {
      zoneIdx.set(k, (i = zones.length));
      zones.push({ ix: Math.floor(x / zone), iz: Math.floor(z / zone), y: 0, place: null });
    }
    return i;
  };

  // ---- objectives: by name, their mean position over the matches
  const objSum = new Map<string, [number, number, number]>();
  for (const mt of matches) for (const o of mt.mv.oz ?? []) {
    const s = objSum.get(o.name) ?? [0, 0, 0];
    s[0] += o.x;
    s[1] += o.z;
    s[2]++;
    objSum.set(o.name, s);
  }
  const objectives = [...objSum].map(([name, s]) => ({ name, x: s[0] / s[2], z: s[1] / s[2] })).sort((a, b) => a.name.localeCompare(b.name));

  // ---- the side-rounds
  interface Work {
    sr: SideRound;
    raw: RoundRaw;
    slot: number;
    lives: LifeW[];
  }
  const work: Work[] = [];
  const teamNames: string[] = [];
  const teamIndex = (n: string) => {
    let i = teamNames.indexOf(n);
    if (i < 0) i = teamNames.push(n) - 1;
    return i;
  };
  raw.forEach((r, ri) => {
    const mt = matches[r.m];
    for (let slot = 0; slot < mt.teams.length; slot++) {
      let side = sideOfSp.get(`${ri}|${slot}`);
      if (side === undefined && byName) side = names.indexOf(mt.teams[slot] ?? String(slot));
      if (side === undefined || side < 0) continue;
      const lives = r.lives.filter((l) => l.side === slot);
      if (!lives.length) continue;
      const won = r.winner === slot ? 1 : 0;
      work.push({
        sr: { match: mt.i, m: r.m, round: r.ri, roundNo: mt.mv.r[r.ri * R_STRIDE], side, slot, won, len: r.len, players: [...(r.players.get(slot) ?? [])], team: teamIndex(mt.teams[slot] ?? String(slot)), feats: new Set(), killLead: [], objLead: [], t0: r.t0 },
        raw: r,
        slot,
        lives,
      });
    }
  });
  if (work.length < 8) return null;

  const features: FeatureDef[] = [];
  const featOf = new Map<string, number>();
  const feat = (key: string, def: Omit<FeatureDef, 'id' | 'key'>) => {
    let id = featOf.get(key);
    if (id === undefined) {
      featOf.set(key, (id = features.length));
      features.push({ id, key, ...def });
    }
    return id;
  };

  // Spawn zones of each side: where a fifth of its starts are.
  const startCount = [new Map<number, number>(), new Map<number, number>()];
  const startTotal = [0, 0];
  for (const w of work) for (const l of w.lives) {
    const z = zoneAt(l.x[0], l.z[0]);
    startCount[w.sr.side].set(z, (startCount[w.sr.side].get(z) ?? 0) + 1);
    startTotal[w.sr.side]++;
  }
  const spawnZone = [new Set<number>(), new Set<number>()];
  for (let s = 0; s < 2; s++) for (const [z, n] of startCount[s]) if (n >= SPAWN_SHARE * startTotal[s]) spawnZone[s].add(z);

  // Time slices for the slider: half a window each, over a round and a quarter of the usual length.
  const slice = b / 2;
  const slices = Math.max(8, Math.min(48, Math.ceil((1.25 * median) / slice)));
  const held: Int32Array[] = [];

  // Per side-round measures the medians split.
  const spreadW: number[][] = work.map(() => [NaN, NaN]);
  const advW: number[][] = work.map(() => [NaN, NaN]);
  const firstCap: number[] = work.map(() => NaN);
  const firstDeathT: number[] = [];

  // Routes: each side's lives that began in the first window, their first two windows.
  const routeSpan = 2 * b;
  const routeLives: { w: number; path: number[] }[][] = [[], []];

  work.forEach((w, wi) => {
    const sr = w.sr;
    const r = w.raw;
    // Holds by window, and by slice for the slider.
    const hs = new Set<number>();
    for (let wdx = 0; wdx < WINDOWS; wdx++) {
      const [a, e] = windows[wdx];
      if (r.len < a + b / 2) continue;
      const inZone = new Map<number, number>();
      let alive = 0;
      for (const l of w.lives) {
        const cnt = new Map<number, number>();
        let any = false;
        for (let j = 0; j < l.t.length; j++) {
          if (l.t[j] < a || l.t[j] >= e) continue;
          any = true;
          const z = zoneAt(l.x[j], l.z[j]);
          cnt.set(z, (cnt.get(z) ?? 0) + 1);
        }
        if (any) alive++;
        for (const [z, c] of cnt) if (c >= 2) inZone.set(z, (inZone.get(z) ?? 0) + 1);
      }
      const need = Math.max(1, Math.ceil(HOLD_SHARE * alive));
      for (const [z, c] of inZone) {
        if (c < need || spawnZone[sr.side].has(z)) continue;
        sr.feats.add(feat(`hold|${sr.side}|${z}|${wdx}`, { kind: 'hold', side: sr.side, zone: z, window: wdx, at: a }));
      }
      // Cohesion and push (first two windows): mean distance to the side's centre, and the centre's distance from the spawn.
      if (wdx < 2) {
        let sp = 0, ns = 0, cx = 0, cz = 0, nc = 0;
        for (let tt = a; tt < e; tt += Math.max(1, b / 6)) {
          const pts: [number, number][] = [];
          for (const l of w.lives) {
            if (l.t[0] > tt || l.t[l.t.length - 1] < tt) continue;
            let j = 0;
            while (j + 1 < l.t.length && l.t[j + 1] <= tt) j++;
            pts.push([l.x[j], l.z[j]]);
          }
          if (pts.length < 2) continue;
          const mx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
          const mz = pts.reduce((s, p) => s + p[1], 0) / pts.length;
          sp += pts.reduce((s, p) => s + Math.hypot(p[0] - mx, p[1] - mz), 0) / pts.length;
          ns++;
          cx = mx;
          cz = mz;
          nc++;
        }
        if (ns) spreadW[wi][wdx] = sp / ns;
        if (nc) advW[wi][wdx] = Math.hypot(cx - spawns[sr.side][0], cz - spawns[sr.side][1]);
      }
    }
    for (let s = 0; s < slices; s++) {
      const a = s * slice;
      if (r.len < a + slice / 2) break;
      const inZone = new Map<number, number>();
      let alive = 0;
      for (const l of w.lives) {
        const seen = new Set<number>();
        for (let j = 0; j < l.t.length; j++) if (l.t[j] >= a && l.t[j] < a + slice) seen.add(zoneAt(l.x[j], l.z[j]));
        if (seen.size) alive++;
        for (const z of seen) inZone.set(z, (inZone.get(z) ?? 0) + 1);
      }
      const need = Math.max(1, Math.ceil(HOLD_SHARE * alive));
      for (const [z, c] of inZone) if (c >= need) hs.add(s * 65536 + z);
    }
    held.push(Int32Array.from(hs));
    // Retreat: the side's centre back toward its spawn by a zone and a half after its furthest push, before the round's middle.
    {
      let far = 0;
      let back = false;
      for (let tt = 0; tt < Math.min(r.len * 0.5, 4 * b); tt += Math.max(1, b / 4)) {
        let cx = 0, cz = 0, n = 0;
        for (const l of w.lives) {
          if (l.t[0] > tt || l.t[l.t.length - 1] < tt) continue;
          let j = 0;
          while (j + 1 < l.t.length && l.t[j + 1] <= tt) j++;
          cx += l.x[j];
          cz += l.z[j];
          n++;
        }
        if (n < 2) continue;
        const d = Math.hypot(cx / n - spawns[sr.side][0], cz / n - spawns[sr.side][1]);
        if (d > far) far = d;
        else if (far - d > 1.5 * zone && tt >= b) back = true;
      }
      if (back) sr.feats.add(feat(`retreat|${sr.side}`, { kind: 'retreat', side: sr.side, at: b }));
    }
    // First blood: the first loss of the round, either side's.
    const fd = r.deaths[0];
    if (fd) {
      firstDeathT.push(fd.t);
      if (fd.slot !== w.slot) {
        sr.feats.add(feat(`firstKill|${sr.side}`, { kind: 'firstKill', side: sr.side, at: 0 }));
        const z = zoneAt(fd.x, fd.z);
        sr.feats.add(feat(`firstKillAt|${sr.side}|${z}`, { kind: 'firstKillAt', side: sr.side, zone: z, at: 0 }));
      }
    }
    // Fights won: more of the other side's losses than its own in a zone in a window (two losses there or more).
    // The first two windows only: a fight won late is how a round ends, not a choice that leads there.
    for (let wdx = 0; wdx < 2; wdx++) {
      const [a, e] = windows[wdx];
      if (r.len < a + b / 2) continue;
      const tally = new Map<number, [number, number]>();
      for (const d of r.deaths) {
        if (d.t < a || d.t >= e) continue;
        const z = zoneAt(d.x, d.z);
        const v = tally.get(z) ?? [0, 0];
        v[d.slot === w.slot ? 1 : 0]++;
        tally.set(z, v);
      }
      for (const [z, [k, l]] of tally) if (k + l >= 2 && k > l) sr.feats.add(feat(`fight|${sr.side}|${z}|${wdx}`, { kind: 'fight', side: sr.side, zone: z, window: wdx, at: a }));
    }
    // The score at each window's start: losses either way, objectives held.
    for (let wdx = 0; wdx < WINDOWS; wdx++) {
      const a = windows[wdx][0];
      let lead = 0;
      for (const d of r.deaths) {
        if (d.t >= a) break;
        lead += d.slot === w.slot ? -1 : 1;
      }
      sr.killLead.push(lead);
      const owner = new Map<number, number>();
      for (const c of r.caps) {
        if (c.t >= a) break;
        owner.set(c.zone, c.slot);
      }
      let ol = 0;
      for (const s of owner.values()) ol += s === w.slot ? 1 : s >= 0 ? -1 : 0;
      sr.objLead.push(ol);
    }
    // Objectives: the round's first capture, the side's first and how soon. With one objective on the map, taking
    // it is how the round is won: no pattern.
    const many = objectives.length > 1;
    const mine = many ? r.caps.find((c) => c.slot === w.slot) : undefined;
    const first = many ? r.caps.find((c) => c.slot >= 0) : undefined;
    if (first && first.slot === w.slot) sr.feats.add(feat(`capFirst|${sr.side}`, { kind: 'capFirst', side: sr.side, at: 0 }));
    if (mine) {
      firstCap[wi] = mine.t;
      const name = matches[r.m].mv.oz?.[mine.zone]?.name;
      if (name !== undefined) sr.feats.add(feat(`capZone|${sr.side}|${name}`, { kind: 'capZone', side: sr.side, name, at: 0 }));
    }
    // The buy (CS2's economy): the side's mean buy (0 eco, 1 force, 2 full) a full one, and better than the other side's.
    const buy = buyOf(matches[r.m], sr.roundNo);
    if (buy) {
      const mine = buy.get(w.slot);
      const other = buy.get(w.slot === 0 ? 1 : 0);
      if (mine !== undefined) {
        if (mine >= 1.5) sr.feats.add(feat(`buyFull|${sr.side}`, { kind: 'buyFull', side: sr.side, at: 0 }));
        if (other !== undefined && mine - other >= 0.5) sr.feats.add(feat(`buyAdv|${sr.side}`, { kind: 'buyAdv', side: sr.side, at: 0 }));
      }
    }
    // What it fielded at the start (the lives of the first window): a class at all, and more of it than the other
    // side. Later lives are left out: how many a side spawns says how often it died, and what it can spawn later
    // (aircraft for points) how well it was doing.
    const mineCls = new Map<number, number>();
    const theirs = new Map<number, number>();
    for (const l of r.lives) {
      if (l.cls < 0 || l.start > b || !FIELDED.has(VEHICLE_CLASSES[l.cls])) continue;
      const m = l.side === w.slot ? mineCls : theirs;
      m.set(l.cls, (m.get(l.cls) ?? 0) + 1);
    }
    for (const [c, n] of mineCls) {
      const name = VEHICLE_CLASSES[c] ?? String(c);
      sr.feats.add(feat(`cls|${sr.side}|${name}`, { kind: 'cls', side: sr.side, name, at: 0 }));
      if (n > (theirs.get(c) ?? 0)) sr.feats.add(feat(`clsMore|${sr.side}|${name}`, { kind: 'clsMore', side: sr.side, name, at: 0 }));
    }
    // Routes: the lives that began in the first window.
    for (const l of w.lives) {
      if (l.start > b) continue;
      const p = routeOf(l, routeSpan);
      if (p) routeLives[sr.side].push({ w: wi, path: p });
    }
  });

  // ---- splits at the medians: early contact, grouped, fast push, fast capture
  const fdMedian = quantile(firstDeathT, 0.5);
  work.forEach((w) => {
    const fd = w.raw.deaths[0];
    if (fd && fd.t < fdMedian) w.sr.feats.add(feat(`earlyContact|${w.sr.side}`, { kind: 'earlyContact', side: w.sr.side, at: 0 }));
  });
  for (let s = 0; s < 2; s++) {
    for (let wdx = 0; wdx < 2; wdx++) {
      const sv = work.map((w, i) => (w.sr.side === s ? spreadW[i][wdx] : NaN)).filter(Number.isFinite);
      const av = work.map((w, i) => (w.sr.side === s ? advW[i][wdx] : NaN)).filter(Number.isFinite);
      const ms = quantile(sv, 0.5);
      const ma = quantile(av, 0.5);
      work.forEach((w, i) => {
        if (w.sr.side !== s) return;
        if (spreadW[i][wdx] < ms) w.sr.feats.add(feat(`grouped|${s}|${wdx}`, { kind: 'grouped', side: s, window: wdx, at: windows[wdx][0] }));
        if (advW[i][wdx] > ma) w.sr.feats.add(feat(`fast|${s}|${wdx}`, { kind: 'fast', side: s, window: wdx, at: windows[wdx][0] }));
      });
    }
    const fc = work.map((w, i) => (w.sr.side === s ? firstCap[i] : NaN)).filter(Number.isFinite);
    const mc = quantile(fc, 0.5);
    work.forEach((w, i) => {
      if (w.sr.side === s && firstCap[i] < mc) w.sr.feats.add(feat(`capFast|${s}`, { kind: 'capFast', side: s, at: 0 }));
    });
  }

  // ---- routes, per side
  const routes: RouteDef[] = [];
  for (let s = 0; s < 2; s++) {
    const lv = routeLives[s];
    const { centres, of } = clusterRoutes(lv.map((x) => x.path), 1.2 * zone);
    const count = new Int32Array(centres.length);
    for (let i = 0; i < of.length; i++) if (of[i] >= 0) count[of[i]]++;
    const base = routes.length;
    const order = Array.from(centres.keys()).sort((a, b2) => count[b2] - count[a]);
    const main = order.slice(0, 2);
    for (const k of order) {
      const far = main.filter((j) => j !== k).every((j) => routeDist(centres[k], centres[j]) > 2 * zone);
      routes.push({ side: s, path: centres[k], lives: count[k], share: count[k] / Math.max(1, lv.length), flank: !main.includes(k) && far && count[k] / Math.max(1, lv.length) < 0.2 });
    }
    const idOf = new Map(order.map((k, j) => [k, base + j]));
    // A side-round took a route when a quarter of its first lives did (two of them, with four or more).
    const per = new Map<number, Map<number, number>>();
    const tot = new Map<number, number>();
    lv.forEach((x, i) => {
      tot.set(x.w, (tot.get(x.w) ?? 0) + 1);
      if (of[i] < 0) return;
      let m = per.get(x.w);
      if (!m) per.set(x.w, (m = new Map()));
      m.set(of[i], (m.get(of[i]) ?? 0) + 1);
    });
    for (const [wi, m] of per) {
      const n = tot.get(wi)!;
      for (const [k, c] of m) if (c / n >= 0.25 && c >= (n >= 4 ? 2 : 1)) work[wi].sr.feats.add(feat(`route|${s}|${idOf.get(k)}`, { kind: 'route', side: s, route: idOf.get(k)!, at: 0 }));
    }
  }

  // ---- zone heights and names
  const ySum = new Float64Array(zones.length);
  const yW = new Float64Array(zones.length);
  for (const mt of matches) {
    const g = mt.ground;
    if (!g) continue;
    for (let i = 0; i < g.ix.length; i++) {
      const x = (g.ix[i] + 0.5) * g.cell;
      const z = (g.iz[i] + 0.5) * g.cell;
      const zi = zoneIdx.get(zk(x, z));
      if (zi === undefined || !(g.p[i] > 0)) continue;
      ySum[zi] += g.y[i] * g.p[i];
      yW[zi] += g.p[i];
    }
  }
  const placeVotes = zones.map(() => new Map<string, number>());
  for (const mt of matches) {
    const mv = mt.mv;
    if (!mv.p || !mv.pn || !mv.pc) continue;
    for (let k = 0; k + 3 < mv.p.length; k += 4) {
      const zi = zoneIdx.get(zk((mv.p[k] + 0.5) * mv.pc, (mv.p[k + 1] + 0.5) * mv.pc));
      const name = mv.pn[mv.p[k + 2]];
      if (zi === undefined || !name) continue;
      placeVotes[zi].set(name, (placeVotes[zi].get(name) ?? 0) + mv.p[k + 3]);
    }
  }
  zones.forEach((z, i) => {
    z.y = yW[i] > 0 ? ySum[i] / yW[i] : 0;
    let best: string | null = null, bn = 0;
    for (const [n, c] of placeVotes[i]) if (c > bn) [best, bn] = [n, c];
    // An objective inside the zone names it before a callout does.
    const obj = objectives.find((o) => Math.floor(o.x / zone) === z.ix && Math.floor(o.z / zone) === z.iz);
    z.place = obj ? `@${obj.name}` : best;
  });
  // Sides told apart by spawn are named by the place they start at, where the data names one (a callout).
  let sidesBy: OutcomeGroup['sidesBy'] = byName ? 'team' : 'spawn';
  if (!byName) {
    // The place most of a side's rounds start at (three in five or more): a side whose start moves from round to
    // round (a defence set up at the site it picks) is not named by any one of them.
    const at = [0, 1].map((side) => {
      const votes = new Map<string, number>();
      let n = 0;
      sp.forEach((e, i) => {
        if ((byName ? e.name : km.of[i]) !== side) return;
        n++;
        const zi = zoneIdx.get(zk(e.p[0], e.p[1]));
        const p = zi === undefined ? null : zones[zi].place;
        if (p && !p.startsWith('@')) votes.set(p, (votes.get(p) ?? 0) + 1);
      });
      let best: string | null = null, bn = 0;
      for (const [p, c] of votes) if (c > bn) [best, bn] = [p, c];
      return best && bn >= 0.6 * n ? best : null;
    });
    if (at[0] && at[1] && at[0] !== at[1]) {
      sides[0] = at[0];
      sides[1] = at[1];
      sidesBy = 'place';
    }
  }

  return {
    key, sides, teams: teamNames, sidesBy, spawns, zone, zones, zoneIndex: zoneIdx, b, windows, median, routes, objectives, features,
    rounds: work.map((w) => w.sr), matches: matches.map((m) => ({ i: m.i, started: m.started, teams: m.teams })), players, slice, slices, held,
  };
}
