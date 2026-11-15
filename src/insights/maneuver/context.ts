/**
 * What every maneuver detector reads: the frame, the groups, the measured
 * engagement range of each domain, each group's nearest enemy at every step
 * and the contacts that start, the kills paired with their deaths - and the
 * helpers that turn a detection into a `Maneuver` with its outcome and its
 * knowledge-base links.
 */

import { AIR, buildFrame, INF, SCALE, stepOf, surface, timeOf, type Frame } from './frame';
import { findGroups, hull, stepAt, type Group, type GroupStep, type Groups } from './groups';
import { linksOf } from './kb';
import { DOMAINS, type Maneuver, type ManeuverKind, type ManeuverOutcome, type MatchTracks, type MEvent } from './types';

export interface Contact {
  g: Group;
  /** Step the contact starts at, and the enemy unit nearest then. */
  s: number;
  near: number;
  enemyTeam: number;
}

/** A death and the kill that caused it, where one is found at the same moment. */
export interface Pair {
  t: number;
  victim: number;
  killer: number;
  vTeam: number;
  kTeam: number;
}

export interface Ctx {
  f: Frame;
  G: Groups;
  /** Engagement range by domain, world units. */
  R: number[];
  /** Per group, per its step index: distance to the nearest enemy of the same family and that unit (-1 none). */
  near: Map<number, { d: Float32Array; u: Int32Array }>;
  contacts: Contact[];
  /** Events by kind, and kills/deaths by unit index. */
  ev: MEvent[];
  killsBy: Map<number, number[]>;
  deathsOf: Map<number, number[]>;
  firesBy: Map<number, number[]>;
  captures: Map<number, number[]>;
  pairs: Pair[];
  /** Kills and losses of each team over the match. */
  teamKills: number[];
  teamLosses: number[];
  /** Each side's centroid when it first appears on the surface (ground x, z): where it comes from. */
  origin: Map<number, [number, number]>;
  out: Maneuver[];
}

/** Seconds of a domain's scale: how long a step of a maneuver takes there. */
export function secs(dom: number, ground: number): number {
  return dom === INF ? ground / 3 : dom === AIR ? ground * 0.75 : ground;
}

function pushTo(map: Map<number, number[]>, k: number, v: number): void {
  let l = map.get(k);
  if (!l) map.set(k, (l = []));
  l.push(v);
}

export function buildCtx(m: MatchTracks): Ctx | null {
  const f = buildFrame(m);
  if (!f) return null;
  const G = findGroups(f);
  const ev = m.events;
  const killsBy = new Map<number, number[]>();
  const deathsOf = new Map<number, number[]>();
  const firesBy = new Map<number, number[]>();
  const captures = new Map<number, number[]>();
  const T = Math.max(m.teams, ...m.units.map((u) => u.team + 1));
  const teamKills = new Array(Math.max(1, T)).fill(0);
  const teamLosses = new Array(Math.max(1, T)).fill(0);
  for (const e of ev) {
    const u = e.unit >= 0 ? (f.index.get(e.unit) ?? -1) : -1;
    if (e.kind === 'kill') {
      if (u >= 0) pushTo(killsBy, u, e.t);
      const tm = u >= 0 ? f.team[u] : e.team;
      if (tm >= 0 && tm < T) teamKills[tm]++;
    } else if (e.kind === 'death') {
      if (u >= 0) pushTo(deathsOf, u, e.t);
      const tm = u >= 0 ? f.team[u] : e.team;
      if (tm >= 0 && tm < T) teamLosses[tm]++;
    } else if (e.kind === 'fire' || e.kind === 'hit' || e.kind === 'launch') {
      if (u >= 0) pushTo(firesBy, u, e.t);
    } else if (e.kind === 'capture') {
      const tm = u >= 0 ? f.team[u] : e.team;
      if (tm >= 0) pushTo(captures, tm, e.t);
    }
  }
  const pairs = pairKills(f, ev);
  const R = DOMAINS.map((_, d) => rangeOf(f, pairs, d));
  const ctx: Ctx = { f, G, R, near: new Map(), contacts: [], ev, killsBy, deathsOf, firesBy, captures, pairs, teamKills, teamLosses, origin: origins(f), out: [] };
  nearest(ctx);
  return ctx;
}

function origins(f: Frame): Map<number, [number, number]> {
  const out = new Map<number, [number, number]>();
  const sum = new Map<number, [number, number, number]>();
  // The first 30 s each side has surface units in.
  const first = new Map<number, number>();
  for (let s = 0; s < f.S; s++)
    for (let u = 0; u < f.N; u++) {
      const k = s * f.N + u;
      if (!f.alive[k] || f.dom[u] === AIR) continue;
      const tm = f.team[u];
      const s0 = first.get(tm) ?? (first.set(tm, s), s);
      if ((s - s0) * f.step > 30) continue;
      const a = sum.get(tm) ?? [0, 0, 0];
      a[0] += f.X[k];
      a[1] += f.Z[k];
      a[2]++;
      sum.set(tm, a);
    }
  for (const [tm, a] of sum) out.set(tm, [a[0] / a[2], a[1] / a[2]]);
  return out;
}

/** Deaths with the kill of another side at the same moment (within 1.5 s), nearest in time. */
function pairKills(f: Frame, ev: MEvent[]): Pair[] {
  const kills = ev.filter((e) => e.kind === 'kill' && e.unit >= 0 && f.index.has(e.unit));
  const out: Pair[] = [];
  let lo = 0;
  for (const e of ev) {
    if (e.kind !== 'death' || e.unit < 0) continue;
    const v = f.index.get(e.unit);
    if (v === undefined) continue;
    while (lo < kills.length && kills[lo].t < e.t - 1.5) lo++;
    let best = -1;
    let bd = Infinity;
    for (let i = lo; i < kills.length && kills[i].t <= e.t + 1.5; i++) {
      const k = f.index.get(kills[i].unit)!;
      if (f.team[k] === f.team[v] || k === v) continue;
      const d = Math.abs(kills[i].t - e.t);
      if (d < bd) ((bd = d), (best = k));
    }
    if (best >= 0) out.push({ t: e.t, victim: v, killer: best, vTeam: f.team[v], kTeam: f.team[best] });
  }
  return out;
}

/** The match's engagement range in a domain: the 75th percentile of killer-victim distance (or nearest enemy at a death), clamped to the domain's scale. */
function rangeOf(f: Frame, pairs: Pair[], d: number): number {
  const sc = SCALE[d];
  const ds: number[] = [];
  for (const p of pairs) {
    if (f.dom[p.victim] !== d) continue;
    const s = stepOf(f, p.t - 1);
    const a = s * f.N + p.victim;
    const b = s * f.N + p.killer;
    if (!f.alive[a] || !f.alive[b]) continue;
    ds.push(Math.hypot(f.X[a] - f.X[b], f.Z[a] - f.Z[b]));
  }
  if (ds.length < 5) return sc.range * f.upm;
  ds.sort((a, b) => a - b);
  const r = ds[Math.floor(ds.length * 0.75)];
  return Math.max(sc.minRange * f.upm, Math.min(sc.maxRange * f.upm, r * 1.1));
}

/** Each group's nearest enemy (same family: air with air, the ground with infantry, sea with sea) at every step, and the contacts that start. */
function nearest(ctx: Ctx): void {
  const { f, G } = ctx;
  const N = f.N;
  // Per step a hash of the alive units of each family, cell the family's range.
  const fam = (d: number) => surface(d);
  for (const g of G.list) {
    ctx.near.set(g.id, { d: new Float32Array(g.steps.length).fill(Infinity), u: new Int32Array(g.steps.length).fill(-1) });
  }
  const byStep: Map<number, { g: Group; i: number }[]> = new Map();
  for (const g of G.list)
    g.steps.forEach((st, i) => {
      let l = byStep.get(st.s);
      if (!l) byStep.set(st.s, (l = []));
      l.push({ g, i });
    });
  const hash = new Map<number, number[]>();
  for (let s = 0; s < f.S; s++) {
    const here = byStep.get(s);
    if (!here) continue;
    hash.clear();
    const cellOf = (d: number) => ctx.R[d] * 2;
    for (let u = 0; u < N; u++) {
      const k = s * N + u;
      if (!f.alive[k]) continue;
      const d = fam(f.dom[u]);
      const c = cellOf(d);
      const hk = (Math.floor(f.X[k] / c) * 1_000_003 + Math.floor(f.Z[k] / c)) * 4 + d;
      let l = hash.get(hk);
      if (!l) hash.set(hk, (l = []));
      l.push(u);
    }
    for (const { g, i } of here) {
      const st = g.steps[i];
      const d = fam(g.dom);
      const c = cellOf(d);
      const gx = Math.floor(st.cx / c);
      const gz = Math.floor(st.cz / c);
      let best = Infinity;
      let bu = -1;
      for (let dx = -1; dx <= 1; dx++)
        for (let dz = -1; dz <= 1; dz++) {
          const l = hash.get(((gx + dx) * 1_000_003 + gz + dz) * 4 + d);
          if (!l) continue;
          for (const u of l) {
            if (f.team[u] === g.team) continue;
            const k = s * N + u;
            // Nearest to any member, not the centroid: a line's end is where it meets the enemy.
            for (const w of st.members) {
              const kw = s * N + w;
              const dd = Math.hypot(f.X[k] - f.X[kw], f.Z[k] - f.Z[kw]);
              if (dd < best) ((best = dd), (bu = u));
            }
          }
        }
      const nr = ctx.near.get(g.id)!;
      nr.d[i] = best;
      nr.u[i] = bu;
    }
  }
  // Contacts: in range after at least the quiet time out of it (or from the group's start, when it started out of range).
  for (const g of G.list) {
    const nr = ctx.near.get(g.id)!;
    const R = ctx.R[g.dom];
    const quiet = Math.max(1, Math.round(secs(g.dom, 20) / f.step));
    let out = 0;
    for (let i = 0; i < g.steps.length; i++) {
      if (nr.d[i] <= R) {
        if (out >= quiet && nr.u[i] >= 0) ctx.contacts.push({ g, s: g.steps[i].s, near: nr.u[i], enemyTeam: f.team[nr.u[i]] });
        out = 0;
      } else out++;
    }
  }
  ctx.contacts.sort((a, b) => a.s - b.s);
}

/** Events in `[t0, t1]` (data seconds) of a list of times. */
export function countIn(list: number[] | undefined, t0: number, t1: number): number {
  if (!list) return 0;
  let n = 0;
  for (const t of list) if (t >= t0 && t <= t1) n++;
  return n;
}

/** What happened to the units while the maneuver ran and `tail` seconds after (data seconds). */
export function outcomeOf(ctx: Ctx, units: number[], team: number, t0: number, t1: number, tail: number): ManeuverOutcome {
  let kills = 0;
  let losses = 0;
  for (const u of units) {
    kills += countIn(ctx.killsBy.get(u), t0, t1 + tail);
    losses += countIn(ctx.deathsOf.get(u), t0, t1 + tail);
  }
  const captures = countIn(ctx.captures.get(team), t0, t1 + tail);
  const ex = (k: number, l: number) => (l > 0 ? k / l : k + 1);
  const exchange = ex(kills, losses);
  const baseline = ex(ctx.teamKills[team] ?? 0, ctx.teamLosses[team] ?? 0);
  const paid: 0 | 1 | null = kills + losses + captures === 0 ? null : (exchange >= 1 && exchange >= baseline) || (captures > 0 && losses <= kills) ? 1 : 0;
  return { kills, losses, captures, exchange: r2(exchange), baseline: r2(baseline), secs: Math.round(t1 - t0), paid };
}

export const r2 = (v: number) => Math.round(v * 100) / 100;
export const r0 = (v: number) => Math.round(v);

/** Data seconds of step `s`. */
export const dataT = (f: Frame, s: number) => f.start + s * f.step;

/** A group's centroid path over steps `[s0, s1]`, at most 24 points, y the mean height. */
export function pathOf(g: Group, s0: number, s1: number): [number, number, number][] {
  const pts = g.steps.filter((st) => st.s >= s0 && st.s <= s1);
  const k = Math.max(1, Math.ceil(pts.length / 24));
  const out: [number, number, number][] = [];
  for (let i = 0; i < pts.length; i += k) out.push([pts[i].cx, pts[i].cy, pts[i].cz]);
  const last = pts[pts.length - 1];
  if (last && out[out.length - 1] !== undefined && (out[out.length - 1][0] !== last.cx || out[out.length - 1][2] !== last.cz)) out.push([last.cx, last.cy, last.cz]);
  return out;
}

/** A unit's path over steps `[s0, s1]`. */
export function unitPath(f: Frame, u: number, s0: number, s1: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  const k = Math.max(1, Math.ceil((s1 - s0 + 1) / 24));
  for (let s = s0; s <= s1; s += k) {
    const i = s * f.N + u;
    if (f.alive[i]) out.push([f.X[i], f.Y[i], f.Z[i]]);
  }
  return out;
}

/** The outline of units at a step: their hull, padded so a pair or a line still shows as an area. */
export function outlineOf(f: Frame, units: ArrayLike<number>, s: number, pad: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < units.length; i++) {
    const k = s * f.N + units[i];
    if (!f.alive[k]) continue;
    const x = f.X[k];
    const z = f.Z[k];
    for (let a = 0; a < 6; a++) pts.push([x + Math.cos((a * Math.PI) / 3) * pad, z + Math.sin((a * Math.PI) / 3) * pad]);
  }
  return pts.length ? hull(pts) : [];
}

export function levelOf(c: number): 'high' | 'medium' | 'low' {
  return c >= 0.75 ? 'high' : c >= 0.5 ? 'medium' : 'low';
}

/** Lowest confidence a maneuver is reported at. */
export const MIN_CONF = 0.4;

export interface Found {
  kind: ManeuverKind;
  variant?: string;
  team: number;
  against: number;
  dom: number;
  s0: number;
  s1: number;
  confidence: number;
  units: number[];
  place: { x: number; y: number; z: number; radius: number };
  paths: [number, number, number][][];
  outlines?: [number, number][][];
  front?: [[number, number], [number, number]];
  evidence: Record<string, number | string>;
  /** Seconds after the end the outcome still counts; the outcome itself where the kind judges it its own way. */
  tail?: number;
  outcome?: ManeuverOutcome;
}

export function emit(ctx: Ctx, x: Found): Maneuver | null {
  const c = Math.max(0, Math.min(1, x.confidence));
  if (c < MIN_CONF) return null;
  const f = ctx.f;
  const t0 = dataT(f, x.s0);
  const t1 = dataT(f, x.s1);
  const outcome = x.outcome ?? outcomeOf(ctx, x.units, x.team, t0, t1, x.tail ?? secs(x.dom, 60));
  const links = linksOf(x.kind);
  const m: Maneuver = {
    id: `${x.kind}:${x.team}:${Math.round(timeOf(f, x.s0))}:${ctx.out.length}`,
    kind: x.kind,
    domain: DOMAINS[x.dom] ?? 'ground',
    ...(x.variant ? { variant: x.variant } : {}),
    team: x.team,
    against: x.against,
    t0: Math.round(timeOf(f, x.s0) * 10) / 10,
    t1: Math.round(timeOf(f, x.s1) * 10) / 10,
    confidence: r2(c),
    level: levelOf(c),
    units: x.units.map((u) => f.units[u].id),
    place: { x: r2(x.place.x), y: r2(x.place.y), z: r2(x.place.z), radius: r2(x.place.radius) },
    paths: x.paths.filter((p) => p.length >= 2).map((p) => p.map(([a, b, c2]) => [r2(a), r2(b), r2(c2)] as [number, number, number])),
    outlines: (x.outlines ?? []).filter((o) => o.length >= 3).map((o) => o.map(([a, b]) => [r2(a), r2(b)] as [number, number])),
    ...(x.front ? { front: x.front } : {}),
    evidence: x.evidence,
    outcome,
    patterns: links.patterns,
    kb: links.kb,
  };
  ctx.out.push(m);
  return m;
}

/** Group step helpers. */
export function at(g: Group, s: number): GroupStep | null {
  return stepAt(g, s);
}

/** Units of `team`'s enemies (or of `team` with `own`) of a family alive at `s` within `r` of a point. */
export function unitsNear(ctx: Ctx, s: number, x: number, z: number, r: number, team: number, fam: number, own = false): number[] {
  const f = ctx.f;
  const out: number[] = [];
  for (let u = 0; u < f.N; u++) {
    const k = s * f.N + u;
    if (!f.alive[k] || surface(f.dom[u]) !== fam) continue;
    if (own ? f.team[u] !== team : f.team[u] === team) continue;
    if (Math.hypot(f.X[k] - x, f.Z[k] - z) <= r) out.push(u);
  }
  return out;
}

export function centroid(f: Frame, units: ArrayLike<number>, s: number): [number, number, number] | null {
  let x = 0;
  let y = 0;
  let z = 0;
  let n = 0;
  for (let i = 0; i < units.length; i++) {
    const k = s * f.N + units[i];
    if (!f.alive[k]) continue;
    x += f.X[k];
    y += f.Y[k];
    z += f.Z[k];
    n++;
  }
  return n ? [x / n, y / n, z / n] : null;
}

export function speedOf(ctx: Ctx, s: number, u: number): number {
  const k = s * ctx.f.N + u;
  return Math.hypot(ctx.G.VX[k], ctx.G.VZ[k]);
}

export const move = (ctx: Ctx, dom: number) => SCALE[dom].move * ctx.f.upm;
