/**
 * The air maneuvers: missile defence against a launch (crank, notch, drag,
 * pump), the beyond-visual-range formations and tactics (pincer, wall,
 * lead-trail, grinder), combat air patrol stations, the energy and the
 * angles fight at close range, strike packages and the suppression of air
 * defences before the strike. Judged in metres times the match's units a
 * metre; aircraft speeds in metres a second.
 */

import { AIR, GROUND, SEA, SCALE } from './frame';
import { at, centroid, countIn, dataT, emit, foughtBetween, outcomeOf, outlineOf, pathOf, r0, r1, r2, unitPath, type Ctx, type Path } from './context';
import { CLS_SPAA } from './types';

const DEG = 180 / Math.PI;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function airUnits(ctx: Ctx): number[] {
  const out: number[] = [];
  for (let u = 0; u < ctx.f.N; u++) if (ctx.f.dom[u] === AIR) out.push(u);
  return out;
}

/** Angle (degrees) between unit `u`'s velocity and the line from it to point (x, z); NaN when it does not move. */
function offBore(ctx: Ctx, s: number, u: number, x: number, z: number): number {
  const f = ctx.f;
  const k = s * f.N + u;
  const vx = ctx.G.VX[k];
  const vz = ctx.G.VZ[k];
  const v = Math.hypot(vx, vz);
  const dx = x - f.X[k];
  const dz = z - f.Z[k];
  const d = Math.hypot(dx, dz);
  if (!(v > 1e-6) || !(d > 0)) return NaN;
  return Math.acos(Math.max(-1, Math.min(1, (vx * dx + vz * dz) / (v * d)))) * DEG;
}

/** Seconds a missile defence is followed after the shot; a pump may take longer to turn back. */
const ANSWER_S = 45;
const PUMP_S = 75;
/** Metres a second below which an aircraft's heading is not read (a hovering helicopter). */
const MIN_AIR_SPEED = 15;

/**
 * A missile seen flying at an aircraft: when it flew (data seconds), where
 * it came from, the aircraft it flew at and the unit that fired it (-1 not
 * known: the launch point stands for it).
 */
export interface Threat {
  /** Index into the match's `weapons`. */
  w: number;
  t0: number;
  t1: number;
  x: number;
  y: number;
  z: number;
  tgt: number;
  shooter: number;
  team: number;
  /** Median degrees between the missile's way and the line to the aircraft over the first part of its flight. */
  aim: number;
}

/** Unit `u`'s place at data time `t`, between its steps; null where it is not placed. */
export function posAt(f: Ctx['f'], u: number, t: number): [number, number, number] | null {
  const q = (t - f.start) / f.step;
  const a = Math.floor(q);
  if (a < 0 || a >= f.S) return null;
  const b = Math.min(f.S - 1, a + 1);
  const ka = a * f.N + u;
  const kb = b * f.N + u;
  if (!f.alive[ka]) return null;
  if (!f.alive[kb]) return [f.X[ka], f.Y[ka], f.Z[ka]];
  const w = q - a;
  return [f.X[ka] + (f.X[kb] - f.X[ka]) * w, f.Y[ka] + (f.Y[kb] - f.Y[ka]) * w, f.Z[ka] + (f.Z[kb] - f.Z[ka]) * w];
}

/** Degrees a missile may point off the line to an aircraft (median, first 60% of its flight) and still be flying at it. */
export const AIM_DEG = 20;

/**
 * The missiles the data follows that fly at an enemy aircraft: over the
 * first 60% of the flight the missile's way points at the aircraft (median
 * within `AIM_DEG`) and closes on it at half its own speed or more, and no
 * vehicle on the ground is flown at more surely or ends the flight far
 * nearer the missile (one passing an aircraft on its way to a tank). A missile fired at the ground, or at
 * nobody, is no threat to any aircraft. Null when the match follows no
 * weapons at all (only launches are known).
 */
export function threatsOf(ctx: Ctx): Threat[] | null {
  const f = ctx.f;
  const ws = f.m.weapons;
  if (!ws || !ws.length) return null;
  const air = airUnits(ctx);
  const out: Threat[] = [];
  const launches = ctx.ev.filter((e) => e.kind === 'launch' && e.unit >= 0 && f.index.has(e.unit));
  for (let wi = 0; wi < ws.length; wi++) {
    const w = ws[wi];
    const n = w.t.length;
    if (n < 4 || w.t[n - 1] - w.t[0] < 1.5) continue;
    // Who fired it: a launch at that moment and place, else the nearest unit of its side there.
    let shooter = -1;
    let bestD = 500 * f.upm;
    for (const e of launches) {
      if (Math.abs(e.t - w.t[0]) > 1.5) continue;
      const u = f.index.get(e.unit)!;
      const p = posAt(f, u, w.t[0]);
      const d = p ? Math.hypot(p[0] - w.x[0], p[1] - w.y[0], p[2] - w.z[0]) : Infinity;
      if (d < bestD) ((bestD = d), (shooter = u));
    }
    if (shooter < 0) {
      bestD = 300 * f.upm;
      for (let u = 0; u < f.N; u++) {
        if (w.team >= 0 && f.team[u] !== w.team) continue;
        const p = posAt(f, u, w.t[0]);
        const d = p ? Math.hypot(p[0] - w.x[0], p[1] - w.y[0], p[2] - w.z[0]) : Infinity;
        if (d < bestD) ((bestD = d), (shooter = u));
      }
    }
    const team = w.team >= 0 ? w.team : shooter >= 0 ? f.team[shooter] : -1;
    const upto = Math.max(3, Math.floor(n * 0.6));
    /** Unit u as this missile's target: the median angle off it, whether the missile closes on it, how far it ends from it; null too few samples. */
    const aimAt = (u: number): { aim: number; closing: boolean; end: number } | null => {
      const aims: number[] = [];
      let dFirst = NaN;
      let dLast = NaN;
      let flown = 0;
      for (let i = 1; i < Math.min(n, upto + 1); i++) {
        const p = posAt(f, u, w.t[i]);
        if (!p) continue;
        const vx = w.x[i] - w.x[i - 1];
        const vy = w.y[i] - w.y[i - 1];
        const vz = w.z[i] - w.z[i - 1];
        const dx = p[0] - w.x[i];
        const dy = p[1] - w.y[i];
        const dz = p[2] - w.z[i];
        const nv = Math.hypot(vx, vy, vz);
        const nd = Math.hypot(dx, dy, dz);
        if (!(nv > 1e-6) || !(nd > 1e-6)) continue;
        aims.push(Math.acos(Math.max(-1, Math.min(1, (vx * dx + vy * dy + vz * dz) / (nv * nd)))) * DEG);
        if (dFirst !== dFirst) dFirst = nd;
        else flown += nv;
        dLast = nd;
      }
      if (aims.length < 3) return null;
      aims.sort((p, q) => p - q);
      const pe = posAt(f, u, w.t[n - 1]);
      const end = pe ? Math.hypot(pe[0] - w.x[n - 1], pe[1] - w.y[n - 1], pe[2] - w.z[n - 1]) : Infinity;
      // Closing on it at half the missile's own speed or more, from no further than 60 km.
      return { aim: aims[aims.length >> 1], closing: dFirst - dLast >= 0.5 * flown && dFirst <= 60000 * f.upm, end };
    };
    const enemy = (u: number) => !((team >= 0 && f.team[u] === team) || u === shooter);
    const at: { u: number; aim: number; end: number }[] = [];
    for (const u of air) {
      if (!enemy(u)) continue;
      const a = aimAt(u);
      if (a && a.closing && a.aim <= AIM_DEG) at.push({ u, aim: a.aim, end: a.end });
    }
    if (!at.length) continue;
    // Not an aircraft a missile only passed on its way to a vehicle below: no vehicle on the ground it flies at
    // more surely (3° nearer its way) or ends far nearer to (a third of the way to the aircraft).
    let ground: { aim: number; end: number } | null = null;
    for (let u = 0; u < f.N; u++) {
      if (f.dom[u] === AIR || !enemy(u)) continue;
      const a = aimAt(u);
      if (a && a.closing && (!ground || a.aim < ground.aim)) ground = a;
    }
    for (const x of at) {
      if (ground && (ground.aim < x.aim - 3 || ground.end < x.end / 3)) continue;
      out.push({ w: wi, t0: w.t[0], t1: w.t[n - 1], x: w.x[0], y: w.y[0], z: w.z[0], tgt: x.u, shooter, team, aim: x.aim });
    }
  }
  return out.sort((a, b) => a.t0 - b.t0);
}

/** A shot at one aircraft: when, by whom (-1 not known) and from where, and the missiles seen in the air at it within 20 s. */
interface Shot {
  t: number;
  tgt: number;
  sh: number;
  x: number;
  y: number;
  z: number;
  flights: [number, number][];
  weapons: number[];
  /** How sure the shot was at it: degrees off (lower is surer). */
  score: number;
}

/**
 * Missile defence: how an aircraft flew while a missile came at it, by the
 * angle between its heading and the shooter (where the missile came from):
 * 40-70° held 8 s a crank, 75-105° held 6 s a notch, 140° or more held 8 s a
 * drag, a drag of 5 s turned back to 45° or less within 75 s a pump.
 *
 * Where the data follows the missiles in flight (`threatsOf`), only a
 * missile seen flying at the aircraft starts one, and it is `shown` to be on
 * purpose when the angle was held 3 s or more (half a short flight) while
 * that missile was in the air; held only before or after it, `unproven`.
 * Where the data has launches only, the target is the enemy aircraft nearest
 * the shooter's nose (within 35°, 5-100 km, the shooter within 60° of its own
 * nose) and nothing shows a missile came at it: `unproven`, never above
 * medium confidence. Worked when the aircraft still lives a minute after the
 * shot.
 */
export function missileDefence(ctx: Ctx): void {
  const f = ctx.f;
  const upm = f.upm;
  const air = airUnits(ctx);
  if (!air.length) return;
  const shots: Shot[] = [];
  const threats = threatsOf(ctx);
  if (threats) {
    // One answer an aircraft per 20 s of shots: every missile in the air at it over that time.
    const open = new Map<number, Shot>();
    for (const th of threats) {
      const cur = open.get(th.tgt);
      if (cur && th.t0 - cur.t < 20) {
        cur.flights.push([th.t0, th.t1]);
        cur.weapons.push(th.w);
        continue;
      }
      const sh: Shot = { t: th.t0, tgt: th.tgt, sh: th.shooter, x: th.x, y: th.y, z: th.z, flights: [[th.t0, th.t1]], weapons: [th.w], score: th.aim };
      open.set(th.tgt, sh);
      shots.push(sh);
    }
  } else {
    const last = new Map<number, number>();
    for (const e of ctx.ev) {
      if (e.kind !== 'launch' || e.unit < 0) continue;
      const sh = f.index.get(e.unit);
      if (sh === undefined || f.dom[sh] !== AIR) continue;
      const s = Math.max(0, Math.min(f.S - 1, Math.round((e.t - f.start) / f.step)));
      const ks = s * f.N + sh;
      if (!f.alive[ks]) continue;
      let tgt = -1;
      let best = Infinity;
      for (const u of air) {
        if (f.team[u] === f.team[sh]) continue;
        const k = s * f.N + u;
        if (!f.alive[k]) continue;
        const d = Math.hypot(f.X[k] - f.X[ks], f.Z[k] - f.Z[ks], f.Y[k] - f.Y[ks]);
        if (d < 5000 * upm || d > 100000 * upm) continue;
        const ob = offBore(ctx, s, sh, f.X[k], f.Z[k]);
        if (!(ob <= 35)) continue;
        const score = ob + d / (10000 * upm);
        if (score < best) ((best = score), (tgt = u));
      }
      if (tgt < 0) continue;
      // A missile fight: the target had the shooter within 60° of its nose at the launch (closing, as in BVR).
      if (!(offBore(ctx, s, tgt, f.X[ks], f.Z[ks]) <= 60)) continue;
      const lt = last.get(tgt);
      if (lt !== undefined && e.t - lt < 20) continue;
      last.set(tgt, e.t);
      shots.push({ t: e.t, tgt, sh, x: f.X[ks], y: f.Y[ks], z: f.Z[ks], flights: [], weapons: [], score: best });
    }
  }
  for (const shot of shots) answer(ctx, shot, !!threats);
}

/** The aircraft's answer to a shot: its angle off the shooter step by step, the kind it held, and whether the data shows it meant it. */
function answer(ctx: Ctx, shot: Shot, seen: boolean): void {
  const f = ctx.f;
  const upm = f.upm;
  const { tgt, sh } = shot;
  const s = Math.max(0, Math.min(f.S - 1, Math.round((shot.t - f.start) / f.step)));
  const steps = Math.round(ANSWER_S / f.step);
  const pumpSteps = Math.round(PUMP_S / f.step);
  const ata: number[] = [];
  for (let q = s; q < Math.min(f.S, s + pumpSteps); q++) {
    const k = q * f.N + tgt;
    if (!f.alive[k]) break;
    // The shooter where it is, else where it fired from.
    const kq = q * f.N + sh;
    const x = sh >= 0 && f.alive[kq] ? f.X[kq] : shot.x;
    const z = sh >= 0 && f.alive[kq] ? f.Z[kq] : shot.z;
    const v = Math.hypot(ctx.G.VX[k], ctx.G.VZ[k]) / upm;
    ata.push(v >= MIN_AIR_SPEED ? offBore(ctx, q, tgt, x, z) : NaN);
  }
  const t0 = dataT(f, s);
  /** The longest run of steps within [lo, hi] in the first `upTo`: its seconds and time span (data seconds). */
  const run = (lo: number, hi: number, upTo: number) => {
    let best = { secs: 0, a: 0, b: 0 };
    let start = -1;
    const n = Math.min(upTo, ata.length);
    for (let i = 0; i <= n; i++) {
      const on = i < n && ata[i] >= lo && ata[i] <= hi;
      if (on && start < 0) start = i;
      if (!on && start >= 0) {
        const secs = (i - start) * f.step;
        if (secs > best.secs) best = { secs, a: t0 + start * f.step, b: t0 + i * f.step };
        start = -1;
      }
    }
    return best;
  };
  const crank = run(40, 70, steps);
  const notch = run(75, 105, steps);
  const drag = run(140, 180, steps);
  // Pump: a drag, then back towards the threat.
  let pump: { secs: number; a: number; b: number } | null = null;
  let cur = 0;
  for (let i = 0; i < ata.length; i++) {
    if (ata[i] >= 140) cur++;
    else {
      if (cur * f.step >= 5 && ata.slice(i).some((a) => a <= 45)) {
        pump = { secs: cur * f.step, a: t0 + (i - cur) * f.step, b: t0 + i * f.step };
        break;
      }
      cur = 0;
    }
  }
  const kind = pump ? 'pump' : notch.secs >= 6 ? 'notch' : drag.secs >= 8 ? 'drag' : crank.secs >= 8 ? 'crank' : null;
  if (!kind) return;
  const held = kind === 'pump' ? pump! : kind === 'notch' ? notch : kind === 'drag' ? drag : crank;
  // On purpose: the angle held while a missile was in the air at it - 3 s, or half a short flight.
  let overlap = 0;
  let flight = 0;
  for (const [a, b] of shot.flights) {
    overlap += Math.max(0, Math.min(b, held.b) - Math.max(a, held.a));
    flight = Math.max(flight, b - a);
  }
  const shown = seen && overlap > 0 && overlap >= Math.min(3, flight / 2);
  // It ends a few seconds after the angle was held or the last missile gone, whichever is later.
  const until = Math.max(held.b, ...shot.flights.map((x) => x[1])) + 5;
  const end = Math.min(f.S - 1, s + ata.length - 1, Math.max(s + 1, Math.ceil((until - f.start) / f.step)));
  const deaths = (ctx.deathsOf.get(tgt) ?? []).filter((t) => t >= shot.t && t <= shot.t + 60);
  const died = deaths.length > 0;
  const k = s * f.N + tgt;
  const range = Math.hypot(f.X[k] - shot.x, f.Z[k] - shot.z);
  const conf = (seen ? 0.6 : 0.55) + 0.25 * clamp01((held.secs - 6) / 12) + 0.2 * clamp01(1 - shot.score / (seen ? AIM_DEG : 35));
  const ws = f.m.weapons ?? [];
  const missilePaths = shot.weapons.slice(0, 4).map((wi) => {
    const w = ws[wi];
    const p: Path = [];
    const every = Math.max(1, Math.ceil(w.t.length / 32));
    for (let i = 0; i < w.t.length; i += every) p.push([w.x[i], w.y[i], w.z[i]]);
    const l = w.t.length - 1;
    if ((l % every) !== 0) p.push([w.x[l], w.y[l], w.z[l]]);
    p.owner = { u: -1, id: w.id, team: sh >= 0 ? f.team[sh] : w.team, n: 1, weapon: true };
    return p;
  });
  emit(ctx, {
    kind,
    team: f.team[tgt],
    against: sh >= 0 ? f.team[sh] : ws[shot.weapons[0]]?.team ?? -1,
    dom: AIR,
    s0: s,
    s1: end,
    // Not shown to be on purpose: at most "likely".
    confidence: shown ? conf : Math.min(conf, 0.74),
    units: [tgt],
    foes: sh >= 0 ? [sh] : [],
    intent: shown ? 'shown' : 'unproven',
    place: { x: f.X[k], y: f.Y[k], z: f.Z[k], radius: range / 2 },
    paths: [unitPath(f, tgt, s, end), ...(sh >= 0 ? [unitPath(f, sh, s, end)] : []), ...missilePaths],
    outlines: [],
    evidence: {
      launchKm: r2(range / upm / 1000),
      heldS: r0(held.secs),
      crankS: r0(crank.secs),
      notchS: r0(notch.secs),
      dragS: r0(drag.secs),
      missiles: shot.flights.length,
      heldInFlightS: r0(overlap),
      survived: died ? 'no' : 'yes',
    },
    outcome: {
      kills: countIn(ctx.killsBy.get(tgt), shot.t, shot.t + 60),
      losses: died ? 1 : 0,
      captures: 0,
      exchange: died ? 0 : 1,
      baseline: 1,
      secs: r0((end - s) * f.step),
      paid: died ? 0 : 1,
      from: r1(shot.t - f.m.t0),
      until: r1(shot.t + 60 - f.m.t0),
      ...(died ? { lostAfter: r0(deaths[0] - shot.t) } : {}),
    },
  });
}

/**
 * Air pincer: two aircraft of a side that flew together (within the link
 * distance) up to two minutes before and now close on the same enemy aircraft
 * from bearings 70° or more apart, both within 40 km and closing, for 10 s.
 */
export function airPincer(ctx: Ctx): void {
  const f = ctx.f;
  const upm = f.upm;
  const air = airUnits(ctx);
  const L = SCALE[AIR].link * upm;
  const back = Math.round(180 / f.step);
  const need = Math.max(2, Math.round(20 / f.step));
  const runs = new Map<string, { s0: number; s1: number; u: number; w: number; e: number; sep: number }>();
  const done = new Set<string>();
  const flush = (key: string) => {
    const r = runs.get(key)!;
    runs.delete(key);
    if (r.s1 - r.s0 + 1 < need) return;
    // Both arms at about the same range from the enemy at the end: a pincer closes together.
    const ke0 = r.s1 * f.N + r.e;
    const du = Math.hypot(f.X[r.s1 * f.N + r.u] - f.X[ke0], f.Z[r.s1 * f.N + r.u] - f.Z[ke0]);
    const dw = Math.hypot(f.X[r.s1 * f.N + r.w] - f.X[ke0], f.Z[r.s1 * f.N + r.w] - f.Z[ke0]);
    if (Math.max(du, dw) > 1.6 * Math.min(du, dw)) return;
    const dk = `${f.team[r.u]}:${r.e}:${Math.floor(r.s0 / back)}`;
    if (done.has(dk)) return;
    done.add(dk);
    const k = r.s1 * f.N + r.e;
    emit(ctx, {
      kind: 'airPincer',
      team: f.team[r.u],
      against: f.team[r.e],
      dom: AIR,
      s0: Math.max(0, r.s0 - back),
      s1: r.s1,
      confidence: 0.55 + 0.25 * clamp01((r.sep - 70) / 60) + 0.2 * clamp01((r.s1 - r.s0 + 1 - need) / (2 * need)),
      units: [r.u, r.w],
      place: { x: f.X[k], y: f.Y[k], z: f.Z[k], radius: 20000 * upm },
      paths: [unitPath(f, r.u, Math.max(0, r.s0 - back), r.s1), unitPath(f, r.w, Math.max(0, r.s0 - back), r.s1)],
      outlines: [],
      evidence: { separationDeg: r0(r.sep), heldS: r0((r.s1 - r.s0) * f.step) },
      tail: 60,
    });
  };
  for (let s = back; s < f.S; s++) {
    const live = new Set<string>();
    for (const e of air) {
      const ke = s * f.N + e;
      if (!f.alive[ke]) continue;
      const closing: { u: number; b: number }[] = [];
      for (const u of air) {
        if (f.team[u] === f.team[e]) continue;
        const k = s * f.N + u;
        if (!f.alive[k]) continue;
        const d = Math.hypot(f.X[k] - f.X[ke], f.Z[k] - f.Z[ke]);
        if (d > 40000 * upm || d < 1000 * upm) continue;
        const ob = offBore(ctx, s, u, f.X[ke], f.Z[ke]);
        if (!(ob < 70)) continue;
        closing.push({ u, b: Math.atan2(f.Z[k] - f.Z[ke], f.X[k] - f.X[ke]) * DEG });
      }
      for (let i = 0; i < closing.length; i++)
        for (let j = i + 1; j < closing.length; j++) {
          const a = closing[i];
          const b = closing[j];
          if (f.team[a.u] !== f.team[b.u]) continue;
          let sep = Math.abs(a.b - b.b);
          if (sep > 180) sep = 360 - sep;
          if (sep < 70) continue;
          // Together before?
          let together = false;
          for (let q = s - back; q < s && !together; q += Math.max(1, Math.round(10 / f.step))) {
            const ka = q * f.N + a.u;
            const kb = q * f.N + b.u;
            if (f.alive[ka] && f.alive[kb] && Math.hypot(f.X[ka] - f.X[kb], f.Z[ka] - f.Z[kb]) <= L) together = true;
          }
          if (!together) continue;
          const key = `${Math.min(a.u, b.u)}:${Math.max(a.u, b.u)}:${e}`;
          live.add(key);
          const r = runs.get(key);
          if (r && r.s1 >= s - 1) {
            r.s1 = s;
            r.sep = Math.max(r.sep, sep);
          } else runs.set(key, { s0: s, s1: s, u: a.u, w: b.u, e, sep });
        }
    }
    for (const key of [...runs.keys()]) if (!live.has(key)) flush(key);
  }
  for (const key of [...runs.keys()]) flush(key);
}

/** Nearest enemy aircraft to a point at a step, and its distance. */
function nearestAir(ctx: Ctx, s: number, team: number, x: number, z: number): { u: number; d: number } {
  const f = ctx.f;
  let best = { u: -1, d: Infinity };
  for (let u = 0; u < f.N; u++) {
    if (f.dom[u] !== AIR || f.team[u] === team) continue;
    const k = s * f.N + u;
    if (!f.alive[k]) continue;
    const d = Math.hypot(f.X[k] - x, f.Z[k] - z);
    if (d < best.d) best = { u, d };
  }
  return best;
}

/**
 * The wall: three or more aircraft of a side abreast (a line across their
 * heading) flying at an enemy aircraft within 80 km, their heading within 30°
 * of it, for 20 s. Lead-trail: two elements of a side on the same heading
 * (within 18°), the second 5-20 km behind the first and within 3 km of its
 * track, the enemy within 100 km ahead, for 30 s.
 */
export function airFormations(ctx: Ctx): void {
  const f = ctx.f;
  const upm = f.upm;
  for (const g of ctx.G.list) {
    if (g.dom !== AIR || g.maxSize < 3) continue;
    let r0s = -1;
    let r1s = -1;
    let n = 0;
    const flush = () => {
      if (r0s >= 0 && (r1s - r0s) * f.step >= 20) {
        const st = at(g, r1s)!;
        emit(ctx, {
          kind: 'wall',
          team: g.team,
          against: -1,
          dom: AIR,
          s0: r0s,
          s1: r1s,
          confidence: 0.55 + 0.25 * clamp01(((r1s - r0s) * f.step - 20) / 40) + 0.2 * clamp01((n - 3) / 2),
          units: [...st.members],
          place: { x: st.cx, y: st.cy, z: st.cz, radius: Math.max(st.spread * 2, 3000 * upm) },
          paths: [pathOf(g, r0s, r1s)],
          outlines: [outlineOf(f, st.members, r1s, 500 * upm)],
          evidence: { aircraft: n, heldS: r0((r1s - r0s) * f.step) },
          tail: 60,
        });
      }
      r0s = -1;
      n = 0;
    };
    for (const st of g.steps) {
      const v = Math.hypot(st.vx, st.vz);
      const e = st.members.length >= 3 && st.shape === 'line' && v > SCALE[AIR].move * upm ? nearestAir(ctx, st.s, g.team, st.cx, st.cz) : { u: -1, d: Infinity };
      let ok = false;
      if (e.u >= 0 && e.d <= 80000 * upm) {
        const k = st.s * f.N + e.u;
        const dx = f.X[k] - st.cx;
        const dz = f.Z[k] - st.cz;
        ok = (st.vx * dx + st.vz * dz) / (v * Math.hypot(dx, dz)) >= Math.cos(30 / DEG);
      }
      if (ok && (r0s < 0 || st.s - r1s <= 2)) {
        if (r0s < 0) r0s = st.s;
        r1s = st.s;
        n = Math.max(n, st.members.length);
      } else if (!ok && r0s >= 0 && st.s - r1s > 2) flush();
    }
    flush();
  }
  // Lead-trail: between groups (and single aircraft) of a side.
  const every = Math.max(1, Math.round(4 / f.step));
  const runs = new Map<string, { s0: number; s1: number; lead: number; trail: number; gap: number }>();
  const done = new Set<string>();
  const flush = (key: string) => {
    const r = runs.get(key)!;
    runs.delete(key);
    if ((r.s1 - r.s0) * f.step < 30 || done.has(key)) return;
    done.add(key);
    const L = ctx.G.list[r.lead];
    const T = ctx.G.list[r.trail];
    const a = at(L, r.s1) ?? L.steps[L.steps.length - 1];
    const b = at(T, r.s1) ?? T.steps[T.steps.length - 1];
    emit(ctx, {
      kind: 'leadTrail',
      team: L.team,
      against: -1,
      dom: AIR,
      s0: r.s0,
      s1: r.s1,
      confidence: 0.55 + 0.25 * clamp01(((r.s1 - r.s0) * f.step - 30) / 60) + 0.2 * (a.members.length + b.members.length >= 3 ? 1 : 0),
      units: [...a.members, ...b.members],
      place: { x: (a.cx + b.cx) / 2, y: (a.cy + b.cy) / 2, z: (a.cz + b.cz) / 2, radius: r.gap },
      paths: [pathOf(L, r.s0, r.s1), pathOf(T, r.s0, r.s1)],
      outlines: [],
      evidence: { gapKm: r2(r.gap / upm / 1000), heldS: r0((r.s1 - r.s0) * f.step), lead: a.members.length, trail: b.members.length },
      tail: 60,
    });
  };
  const airGroups = ctx.G.list.filter((g) => g.dom === AIR);
  for (let s = 0; s < f.S; s += every) {
    const here = airGroups.filter((g) => g.steps[0].s <= s && g.steps[g.steps.length - 1].s >= s).map((g) => ({ g, st: at(g, s) })).filter((x) => !!x.st) as { g: (typeof ctx.G.list)[number]; st: NonNullable<ReturnType<typeof at>> }[];
    const live = new Set<string>();
    const nearCache = new Map<number, { u: number; d: number }>();
    for (const p of here)
      for (const q of here) {
        if (p.g === q.g || p.g.team !== q.g.team) continue;
        const vp = Math.hypot(p.st.vx, p.st.vz);
        const vq = Math.hypot(q.st.vx, q.st.vz);
        if (vp < SCALE[AIR].move * upm || vq < SCALE[AIR].move * upm) continue;
        if ((p.st.vx * q.st.vx + p.st.vz * q.st.vz) / (vp * vq) < Math.cos(18 / DEG)) continue;
        const hx = p.st.vx / vp;
        const hz = p.st.vz / vp;
        const dx = p.st.cx - q.st.cx;
        const dz = p.st.cz - q.st.cz;
        const al = dx * hx + dz * hz;
        const cr = Math.abs(-dx * hz + dz * hx);
        if (al < 5000 * upm || al > 20000 * upm || cr > 3000 * upm) continue;
        let e = nearCache.get(p.g.id);
        if (!e) nearCache.set(p.g.id, (e = nearestAir(ctx, s, p.g.team, p.st.cx, p.st.cz)));
        if (e.u < 0 || e.d > 100000 * upm) continue;
        const ke = s * f.N + e.u;
        if ((f.X[ke] - p.st.cx) * hx + (f.Z[ke] - p.st.cz) * hz <= 0) continue;
        const key = `${p.g.id}:${q.g.id}`;
        live.add(key);
        const r = runs.get(key);
        if (r && s - r.s1 <= every * 2) ((r.s1 = s), (r.gap = Math.max(r.gap, al)));
        else runs.set(key, { s0: s, s1: s, lead: p.g.id, trail: q.g.id, gap: al });
      }
    for (const key of [...runs.keys()]) if (!live.has(key) && s - runs.get(key)!.s1 > every * 2) flush(key);
  }
  for (const key of [...runs.keys()]) flush(key);
}

interface Orbit {
  u: number;
  s0: number;
  s1: number;
  cx: number;
  cz: number;
  cy: number;
  r: number;
  turn: number;
}

/**
 * Orbits of each aircraft: stretches turning one way through 300° or more
 * (net) while staying within 30 km of their centre at 50 m/s or more. A
 * combat air patrol: orbits held three minutes or more (aircraft of a side
 * on the same station, centres within 10 km, one patrol). A grinder: two or
 * more aircraft of a side orbiting the same centre at once for two minutes,
 * spaced 90° or more round it on average.
 */
export function orbits(ctx: Ctx): void {
  const f = ctx.f;
  const upm = f.upm;
  const list: Orbit[] = [];
  for (const u of airUnits(ctx)) {
    let s = 0;
    while (s < f.S) {
      if (!f.alive[s * f.N + u]) {
        s++;
        continue;
      }
      // Grow a stretch while it stays within 30 km of its running centre.
      let turn = 0;
      let prevH = NaN;
      let sx = 0;
      let sz = 0;
      let sy = 0;
      let n = 0;
      let q = s;
      let bestEnd = -1;
      let bestTurn = 0;
      for (; q < f.S; q++) {
        const k = q * f.N + u;
        if (!f.alive[k]) break;
        const v = Math.hypot(ctx.G.VX[k], ctx.G.VZ[k]);
        if (v < 50 * upm) break;
        sx += f.X[k];
        sz += f.Z[k];
        sy += f.Y[k];
        n++;
        if (Math.hypot(f.X[k] - sx / n, f.Z[k] - sz / n) > 30000 * upm) break;
        const h = Math.atan2(ctx.G.VZ[k], ctx.G.VX[k]);
        if (prevH === prevH) {
          let d = h - prevH;
          while (d > Math.PI) d -= 2 * Math.PI;
          while (d < -Math.PI) d += 2 * Math.PI;
          turn += d;
        }
        prevH = h;
        if (Math.abs(turn) * DEG >= 300) ((bestEnd = q), (bestTurn = turn));
      }
      if (bestEnd > s) {
        let r = 0;
        const cx = sx / n;
        const cz = sz / n;
        for (let p = s; p <= bestEnd; p++) r = Math.max(r, Math.hypot(f.X[p * f.N + u] - cx, f.Z[p * f.N + u] - cz));
        list.push({ u, s0: s, s1: bestEnd, cx, cz, cy: sy / n, r, turn: Math.abs(bestTurn) * DEG });
        s = bestEnd + 1;
      } else s = Math.max(s + 1, q);
    }
  }
  // Patrols: orbits of a side on one station.
  const used = new Set<Orbit>();
  for (const o of list) {
    if (used.has(o)) continue;
    const same = list.filter((p) => !used.has(p) && f.team[p.u] === f.team[o.u] && Math.hypot(p.cx - o.cx, p.cz - o.cz) <= 10000 * upm);
    for (const p of same) used.add(p);
    const units = [...new Set(same.map((p) => p.u))];
    const s0 = Math.min(...same.map((p) => p.s0));
    const s1 = Math.max(...same.map((p) => p.s1));
    // Grinder: two at once, apart round the centre.
    let phase = 0;
    let both = 0;
    if (units.length >= 2) {
      for (let s = s0; s <= s1; s++) {
        const on = same.filter((p) => s >= p.s0 && s <= p.s1);
        const us = [...new Set(on.map((p) => p.u))];
        if (us.length < 2) continue;
        const ang = us.map((u) => Math.atan2(f.Z[s * f.N + u] - o.cz, f.X[s * f.N + u] - o.cx) * DEG);
        let sep = Math.abs(ang[0] - ang[1]);
        if (sep > 180) sep = 360 - sep;
        phase += sep;
        both++;
      }
    }
    const grinder = both * f.step >= 120 && phase / both >= 90;
    const secsHeld = (s1 - s0) * f.step;
    if (!grinder && secsHeld < 180) continue;
    const turns = same.reduce((a, p) => a + p.turn, 0) / 360;
    emit(ctx, {
      kind: grinder ? 'grinder' : 'cap',
      team: f.team[o.u],
      against: -1,
      dom: AIR,
      s0,
      s1,
      confidence: grinder ? 0.55 + 0.25 * clamp01((phase / both - 90) / 60) + 0.2 * clamp01((both * f.step - 120) / 240) : 0.5 + 0.3 * clamp01((secsHeld - 180) / 420) + 0.2 * clamp01((turns - 1) / 3),
      units,
      place: { x: o.cx, y: o.cy, z: o.cz, radius: Math.max(...same.map((p) => p.r)) },
      paths: units.slice(0, 4).map((u) => unitPath(f, u, s0, s1)),
      outlines: [],
      evidence: { aircraft: units.length, heldS: r0(secsHeld), orbits: r2(turns), radiusKm: r2(Math.max(...same.map((p) => p.r)) / upm / 1000), ...(grinder ? { phaseDeg: r0(phase / both) } : {}) },
      tail: 0,
    });
  }
}

/**
 * Energy and angles: a close fight is two opposing aircraft within 3 km for
 * 20 s or more. Each aircraft's own style over it: the angles fight - height
 * kept within 500 m, turning 8°/s or more on average, slower than it came in
 * by a fifth or more; the energy fight - 800 m or more of height used, 15 m/s
 * vertical on average. Its kills and losses in the fight and the next 30 s
 * are the outcome.
 */
export function closeFights(ctx: Ctx): void {
  const f = ctx.f;
  const upm = f.upm;
  const air = airUnits(ctx);
  const need = Math.max(2, Math.round(20 / f.step));
  const runs = new Map<string, { s0: number; s1: number }>();
  const fights: { a: number; b: number; s0: number; s1: number }[] = [];
  const cell = 3000 * upm;
  const hash = new Map<number, number[]>();
  for (let s = 0; s < f.S; s++) {
    // Pairs within 3 km: through a hash of 3 km cells, so a thousand aircraft cost no more than their neighbours.
    hash.clear();
    for (const u of air) {
      const k = s * f.N + u;
      if (!f.alive[k]) continue;
      const hk = Math.floor(f.X[k] / cell) * 1_000_003 + Math.floor(f.Z[k] / cell);
      let l = hash.get(hk);
      if (!l) hash.set(hk, (l = []));
      l.push(u);
    }
    for (const u of air) {
      const ka = s * f.N + u;
      if (!f.alive[ka]) continue;
      const gx = Math.floor(f.X[ka] / cell);
      const gz = Math.floor(f.Z[ka] / cell);
      for (let dx = -1; dx <= 1; dx++)
        for (let dz = -1; dz <= 1; dz++) {
          const l = hash.get((gx + dx) * 1_000_003 + gz + dz);
          if (!l) continue;
          for (const w of l) {
            if (w <= u || f.team[w] === f.team[u]) continue;
            const kb = s * f.N + w;
            if (Math.hypot(f.X[ka] - f.X[kb], f.Z[ka] - f.Z[kb], f.Y[ka] - f.Y[kb]) > cell) continue;
            const key = `${u}:${w}`;
            const r = runs.get(key);
            if (r && r.s1 >= s - 2) r.s1 = s;
            else {
              if (r && r.s1 - r.s0 + 1 >= need) fights.push({ a: u, b: w, ...r });
              runs.set(key, { s0: s, s1: s });
            }
          }
        }
    }
  }
  for (const [key, r] of runs) {
    if (r.s1 - r.s0 + 1 < need) continue;
    const [a, b] = key.split(':').map(Number);
    fights.push({ a, b, ...r });
  }
  for (const fi of fights)
    for (const u of [fi.a, fi.b]) {
      const other = u === fi.a ? fi.b : fi.a;
      let ymin = Infinity;
      let ymax = -Infinity;
      let turn = 0;
      let vy = 0;
      let n = 0;
      let speed = 0;
      let prevH = NaN;
      for (let s = fi.s0; s <= fi.s1; s++) {
        const k = s * f.N + u;
        if (!f.alive[k]) continue;
        ymin = Math.min(ymin, f.Y[k]);
        ymax = Math.max(ymax, f.Y[k]);
        const h = Math.atan2(ctx.G.VZ[k], ctx.G.VX[k]);
        if (prevH === prevH) {
          let d = h - prevH;
          while (d > Math.PI) d -= 2 * Math.PI;
          while (d < -Math.PI) d += 2 * Math.PI;
          turn += Math.abs(d);
        }
        prevH = h;
        if (s > fi.s0 && f.alive[k - f.N]) vy += Math.abs(f.Y[k] - f.Y[k - f.N]) / f.step;
        speed += Math.hypot(ctx.G.VX[k], ctx.G.VZ[k]);
        n++;
      }
      if (n < need) continue;
      const k0 = Math.max(0, fi.s0 - Math.round(10 / f.step)) * f.N + u;
      const entry = f.alive[k0] ? Math.hypot(ctx.G.VX[k0], ctx.G.VZ[k0]) : speed / n;
      const rate = (turn * DEG) / (n * f.step);
      const climb = vy / Math.max(1, n - 1) / upm;
      const used = (ymax - ymin) / upm;
      const slowed = speed / n <= 0.8 * entry;
      const kind = used < 500 && rate >= 8 && slowed ? 'anglesFight' : used >= 800 && climb >= 15 ? 'energyFight' : null;
      if (!kind) continue;
      // A fight, not a pair flying together: their headings apart by 30° or more on average while close,
      // and a shot, hit or kill by one of them.
      const F0 = dataT(f, fi.s0);
      const F1 = dataT(f, fi.s1) + 5;
      if (![u, other].some((w) => countIn(ctx.firesBy.get(w), F0, F1) + countIn(ctx.killsBy.get(w), F0, F1) > 0)) continue;
      let apart = 0;
      let na = 0;
      for (let s = fi.s0; s <= fi.s1; s++) {
        const ka = s * f.N + u;
        const kb = s * f.N + other;
        if (!f.alive[ka] || !f.alive[kb]) continue;
        let d = Math.atan2(ctx.G.VZ[ka], ctx.G.VX[ka]) - Math.atan2(ctx.G.VZ[kb], ctx.G.VX[kb]);
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        apart += Math.abs(d);
        na++;
      }
      if (!na || (apart / na) * DEG < 30) continue;
      // And they fought each other: a kill between them, or each in turn held the other within 30° of
      // its nose inside 1.5 km for 4 s (a turning fight; a wingman in trail holds its leader, never back).
      const noseRun = (a: number, b: number) => {
        let run = 0;
        let best = 0;
        for (let s = fi.s0; s <= fi.s1; s++) {
          const ka = s * f.N + a;
          const kb = s * f.N + b;
          const ok = f.alive[ka] && f.alive[kb] && Math.hypot(f.X[ka] - f.X[kb], f.Z[ka] - f.Z[kb], f.Y[ka] - f.Y[kb]) <= 1500 * upm && offBore(ctx, s, a, f.X[kb], f.Z[kb]) <= 30;
          run = ok ? run + 1 : 0;
          best = Math.max(best, run);
        }
        return best * f.step;
      };
      const decided = foughtBetween(ctx, [u], [other], F0, F1 + 10) > 0;
      if (!decided && !(noseRun(u, other) >= 4 && noseRun(other, u) >= 4)) continue;
      const k = fi.s1 * f.N + u;
      const o = outcomeOf(ctx, [u], f.team[u], dataT(f, fi.s0), dataT(f, fi.s1), 30);
      emit(ctx, {
        kind,
        team: f.team[u],
        against: f.team[other],
        dom: AIR,
        s0: fi.s0,
        s1: fi.s1,
        // Sure only when one killed the other: in a furball, mutual turning alone is as common between
        // aircraft whose meeting a null model makes up (`nulls.ts`).
        confidence: !decided ? 0.42 : kind === 'anglesFight' ? 0.5 + 0.25 * clamp01((rate - 8) / 8) + 0.25 * clamp01((500 - used) / 500) : 0.5 + 0.25 * clamp01((used - 800) / 1500) + 0.25 * clamp01((climb - 15) / 30),
        units: [u],
        place: { x: f.alive[k] ? f.X[k] : f.X[fi.s0 * f.N + u], y: f.alive[k] ? f.Y[k] : f.Y[fi.s0 * f.N + u], z: f.alive[k] ? f.Z[k] : f.Z[fi.s0 * f.N + u], radius: 3000 * upm },
        paths: [unitPath(f, u, fi.s0, fi.s1), unitPath(f, other, fi.s0, fi.s1)],
        outlines: [],
        evidence: { heightUsedM: r0(used), turnDegS: r2(rate), verticalMS: r2(climb), entryMS: r0(entry / upm), meanMS: r0(speed / n / upm), secs: r0((fi.s1 - fi.s0) * f.step) },
        outcome: { ...o, paid: o.kills + o.losses === 0 ? null : o.kills > o.losses ? 1 : 0 },
      });
    }
}

/** A kill's victim's domain and class (from the paired death, else the kill row's target class). */
function victims(ctx: Ctx): { t: number; killer: number; vdom: number; vcls: number; x: number; z: number }[] {
  const f = ctx.f;
  return ctx.pairs.map((p) => {
    const s = Math.max(0, Math.min(f.S - 1, Math.round((p.t - f.start) / f.step) - 1));
    const k = s * f.N + p.victim;
    return { t: p.t, killer: p.killer, vdom: f.dom[p.victim], vcls: f.cls[p.victim], x: f.alive[k] ? f.X[k] : NaN, z: f.alive[k] ? f.Z[k] : NaN };
  });
}

/**
 * Strike package: an air group of three or more together for a minute or
 * more, of whose aircraft some kill ground or sea targets within five minutes
 * of the group's end (the strikers) and some do not (escort, suppression).
 * SEAD: a side's air kills of the enemy's air defences in an area (30 km)
 * coming before most (60%) of its kills of other ground targets there, with
 * one air-defence kill and two others at least.
 */
export function strikes(ctx: Ctx): void {
  const f = ctx.f;
  const upm = f.upm;
  const vic = victims(ctx);
  const groundKill = new Map<number, number[]>();
  for (const v of vic) if (v.vdom === GROUND || v.vdom === SEA) {
    let l = groundKill.get(v.killer);
    if (!l) groundKill.set(v.killer, (l = []));
    l.push(v.t);
  }
  // Also kills whose row names a ground or sea target class.
  for (const e of ctx.ev) {
    if (e.kind !== 'kill' || e.unit < 0 || e.tcls < 0) continue;
    const u = f.index.get(e.unit);
    if (u === undefined || f.dom[u] !== AIR) continue;
    if (e.tcls >= 5 && e.tcls <= 11) {
      let l = groundKill.get(u);
      if (!l) groundKill.set(u, (l = []));
      if (!l.some((t) => Math.abs(t - e.t) < 1)) l.push(e.t);
    }
  }
  for (const g of ctx.G.list) {
    if (g.dom !== AIR || g.maxSize < 3) continue;
    const big = g.steps.filter((st) => st.members.length >= 3);
    if (big.length * f.step < 60) continue;
    const s0 = big[0].s;
    const s1 = big[big.length - 1].s;
    const T0 = dataT(f, s0);
    const T1 = dataT(f, s1) + 300;
    const members = [...new Set(big.flatMap((st) => [...st.members]))];
    const strikers = members.filter((u) => countIn(groundKill.get(u), T0, T1) > 0);
    const others = members.filter((u) => !strikers.includes(u));
    if (!strikers.length || !others.length) continue;
    const airKills = others.reduce((n, u) => n + countIn(ctx.killsBy.get(u), T0, T1), 0);
    const hits = strikers.reduce((n, u) => n + countIn(groundKill.get(u), T0, T1), 0);
    const mid = big[big.length >> 1];
    const o = outcomeOf(ctx, members, g.team, T0, dataT(f, s1), 60);
    emit(ctx, {
      kind: 'strikePackage',
      team: g.team,
      against: -1,
      dom: AIR,
      s0,
      s1,
      confidence: 0.5 + 0.2 * clamp01((members.length - 3) / 3) + 0.15 * clamp01(hits / 3) + 0.15 * (airKills > 0 ? 1 : 0),
      units: members,
      place: { x: mid.cx, y: mid.cy, z: mid.cz, radius: Math.max(mid.spread * 2, 3000 * upm) },
      paths: [pathOf(g, s0, s1)],
      outlines: [outlineOf(f, mid.members, mid.s, 400 * upm)],
      evidence: { aircraft: members.length, strikers: strikers.length, escorts: others.length, groundKills: hits, escortKills: airKills },
      outcome: o,
    });
  }
  // SEAD sequencing.
  const byTeam = new Map<number, typeof vic>();
  for (const v of vic) {
    if (f.dom[v.killer] !== AIR || v.vdom !== GROUND || !(v.x === v.x)) continue;
    const tm = f.team[v.killer];
    let l = byTeam.get(tm);
    if (!l) byTeam.set(tm, (l = []));
    l.push(v);
  }
  for (const [team, l] of byTeam) {
    const sams = l.filter((v) => v.vcls === CLS_SPAA);
    const done = new Set<(typeof l)[number]>();
    for (const s of sams) {
      if (done.has(s)) continue;
      const area = l.filter((v) => Math.hypot(v.x - s.x, v.z - s.z) <= 30000 * upm);
      const ad = area.filter((v) => v.vcls === CLS_SPAA);
      const rest = area.filter((v) => v.vcls !== CLS_SPAA);
      for (const v of ad) done.add(v);
      if (ad.length < 1 || rest.length < 2) continue;
      const first = Math.min(...ad.map((v) => v.t));
      const after = rest.filter((v) => v.t > first).length / rest.length;
      if (after < 0.6) continue;
      const killers = [...new Set(area.map((v) => v.killer))];
      const c = centroid(f, [], 0) ?? [s.x, 0, s.z];
      const sStep = Math.max(0, Math.round((first - f.start) / f.step));
      const sEnd = Math.min(f.S - 1, Math.round((Math.max(...area.map((v) => v.t)) - f.start) / f.step));
      emit(ctx, {
        kind: 'sead',
        team,
        against: -1,
        dom: AIR,
        s0: sStep,
        s1: sEnd,
        confidence: 0.5 + 0.25 * clamp01((after - 0.6) / 0.4) + 0.15 * clamp01((ad.length - 1) / 3) + 0.1 * clamp01((rest.length - 2) / 4),
        units: killers,
        place: { x: c[0], y: 0, z: c[2], radius: 30000 * upm },
        paths: killers.slice(0, 6).map((u) => unitPath(f, u, Math.max(0, sStep - Math.round(60 / f.step)), sEnd)),
        outlines: [],
        evidence: { airDefenceKills: ad.length, otherGroundKills: rest.length, afterShare: r2(after), firstAdS: r0(first - f.m.t0) },
        tail: 0,
      });
    }
  }
}
