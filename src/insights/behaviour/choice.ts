/**
 * Measures of choices under pressure on the per-match tracks (`acc.ts`):
 * risk taken after a lost life against after a won one (prospect theory's
 * domain of losses, the break-even effect) and early deaths after early
 * deaths (tilt); kills following kills against shuffled sequences, with the
 * finite-sequence bias Miller and Sanjurjo (2018) showed taken out; how alike
 * a side buys in a round (Fleiss' kappa against shuffled rounds); and how
 * units move and fire after taking damage (suppression).
 */

import { BIN, type Track, type World } from './acc';
import { fleissKappa, mean, pairedTest, permTwoSided, round, shuffle, type Rng } from './bstats';
import { stateAt } from './motion';
import type { BuyMetric, RiskMetric, StreakK, StreakMetric, SuppressionMetric } from './types';

export interface Life {
  ti: number;
  /** Offsets into the track: first and last point of the life. */
  s: number;
  e: number;
  /** Seconds: its start (first moving point, else first point). */
  t: number;
  kills: number;
  died: boolean;
  /** Seconds from its start to its death; NaN when it survived. */
  span: number;
}

/** Seconds of no samples that end a life where nothing else does. */
const GAP = 30;

/** Each track's lives: its rounds where the data has them, else split at deaths, spawns and long gaps. */
export function livesOf(w: World): Life[] {
  const byTrack = new Map<number, { t0: number; t1: number }[]>();
  for (const r of w.rounds) {
    let l = byTrack.get(r.ti);
    if (!l) byTrack.set(r.ti, (l = []));
    l.push({ t0: r.t0, t1: r.t1 });
  }
  const out: Life[] = [];
  w.tracks.forEach((t, ti) => {
    const cuts: number[] = [];
    const rs = byTrack.get(ti);
    if (rs) for (const r of rs) cuts.push(r.t0);
    for (const s of t.spawns) cuts.push(s);
    for (const d of t.deaths) cuts.push(d + 1e-3);
    let last = -Infinity;
    for (let o = 0; o < t.n; o++) {
      if (!(t.x[o] === t.x[o])) continue;
      const tt = (t.b0 + o) * BIN;
      if (tt - last > GAP && last > -Infinity) cuts.push(tt - 1e-3);
      last = tt;
    }
    cuts.sort((a, b) => a - b);
    let ci = 0;
    let cur: { s: number; e: number; first: number; firstMove: number } | null = null;
    const close = () => {
      if (!cur) return;
      const t0 = cur.firstMove === cur.firstMove ? cur.firstMove : cur.first;
      const tEnd = (t.b0 + cur.e + 1) * BIN;
      const tStart = (t.b0 + cur.s) * BIN;
      let kills = 0;
      for (const k of t.kills) if (k >= tStart && k < tEnd) kills++;
      const death = t.deaths.find((d) => d >= tStart && d < tEnd + BIN);
      out.push({ ti, s: cur.s, e: cur.e, t: t0, kills, died: death !== undefined, span: death !== undefined ? death - t0 : NaN });
      cur = null;
    };
    let prevT = -Infinity;
    for (let o = 0; o < t.n; o++) {
      if (!(t.x[o] === t.x[o])) continue;
      const tt = (t.b0 + o) * BIN;
      let cut = false;
      while (ci < cuts.length && cuts[ci] <= tt) {
        if (cuts[ci] > prevT) cut = true;
        ci++;
      }
      if (cut) close();
      if (!cur) cur = { s: o, e: o, first: tt, firstMove: NaN };
      cur.e = o;
      if (!(cur.firstMove === cur.firstMove) && Math.hypot(t.vx[o], t.vz[o]) >= w.vmin) cur.firstMove = tt;
      prevT = tt;
    }
    close();
  });
  return out;
}

// ------------------------------------------------------------------ risk

export function risk(w: World, lives: Life[], r: Rng): RiskMetric | undefined {
  // Side centroids per match, bin and team.
  const cen = new Map<number, Map<number, Float64Array>>();
  const aheadBy = new Map<number, Map<number, Float64Array>>();
  /** > 0 ahead of the side's centroid towards the enemy's, < 0 behind, NaN unknown. */
  const forward = (byTeam: Map<number, Float64Array>, own: Float64Array, team: number, b: number, x: number, z: number) => {
    if (team < 0 || own[3 * b + 2] < 2) return NaN;
    let ex = 0;
    let ez = 0;
    let en = 0;
    for (const [tm, a] of byTeam) {
      if (tm === team || tm < 0) continue;
      ex += a[3 * b];
      ez += a[3 * b + 1];
      en += a[3 * b + 2];
    }
    if (!en) return NaN;
    const cx = own[3 * b] / own[3 * b + 2];
    const cz = own[3 * b + 1] / own[3 * b + 2];
    return (x - cx) * (ex / en - cx) + (z - cz) * (ez / en - cz);
  };
  for (const M of w.matches) {
    const L = M.B1 - M.B0 + 1;
    const byTeam = new Map<number, Float64Array>();
    for (const ti of M.tracks) {
      const t = w.tracks[ti];
      let a = byTeam.get(t.team);
      if (!a) byTeam.set(t.team, (a = new Float64Array(L * 3)));
      for (let o = 0; o < t.n; o++) {
        if (!(t.x[o] === t.x[o])) continue;
        const b = t.b0 + o - M.B0;
        a[3 * b] += t.x[o];
        a[3 * b + 1] += t.z[o];
        a[3 * b + 2]++;
      }
    }
    // Per bin and side, how many of its units stand ahead of its centroid towards the enemy: what a unit's
    // own share is measured against, so that the state of the fight at the time cancels out.
    const ahead = new Map<number, Float64Array>();
    for (const ti of M.tracks) {
      const t = w.tracks[ti];
      const own = byTeam.get(t.team)!;
      let a = ahead.get(t.team);
      if (!a) ahead.set(t.team, (a = new Float64Array(L)));
      for (let o = 0; o < t.n; o++) {
        if (!(t.x[o] === t.x[o])) continue;
        const b = t.b0 + o - M.B0;
        const f = forward(byTeam, own, t.team, b, t.x[o], t.z[o]);
        if (f > 0) a[b]++;
      }
    }
    cen.set(M.m, byTeam);
    aheadBy.set(M.m, ahead);
  }
  const B0 = new Map(w.matches.map((M) => [M.m, M.B0]));
  const riskOf = (lf: Life): number => {
    const t = w.tracks[lf.ti];
    const byTeam = cen.get(t.m);
    const b0 = B0.get(t.m);
    if (!byTeam || b0 === undefined || t.team < 0) return NaN;
    const own = byTeam.get(t.team);
    if (!own) return NaN;
    const ah = aheadBy.get(t.m)!.get(t.team)!;
    let ahead = 0;
    let n = 0;
    for (let o = lf.s; o <= lf.e; o++) {
      if (!(t.x[o] === t.x[o])) continue;
      const b = t.b0 + o - b0;
      const f = forward(byTeam, own, t.team, b, t.x[o], t.z[o]);
      if (!(f === f)) continue;
      // Own position against the side's share ahead at that moment.
      ahead += (f > 0 ? 1 : 0) - ah[b] / own[3 * b + 2];
      n++;
    }
    return n >= 5 ? ahead / n : NaN;
  };
  // Each unit's lives in order. Only lives that ended in death are compared (the next one starts at a spawn
  // either way): with a kill (a gain) or without (a loss).
  type LV = { out: number; risk: number; early: number };
  const seqs: LV[][] = [];
  const byTrack = new Map<number, Life[]>();
  for (const lf of lives) {
    let l = byTrack.get(lf.ti);
    if (!l) byTrack.set(lf.ti, (l = []));
    l.push(lf);
  }
  // A life's risk against the lives of other units of the match that set out after a death within 30 s of it:
  // what the fight at the time asks of anyone coming back in.
  const respawns = new Map<number, { t: number; ti: number; v: number }[]>();
  const raw = new Map<Life, number>();
  for (const l of byTrack.values()) {
    l.sort((a, b) => a.t - b.t);
    for (let i = 0; i < l.length; i++) {
      const v = riskOf(l[i]);
      raw.set(l[i], v);
      if (i > 0 && l[i - 1].died && v === v) {
        const m = w.tracks[l[i].ti].m;
        let a = respawns.get(m);
        if (!a) respawns.set(m, (a = []));
        a.push({ t: l[i].t, ti: l[i].ti, v });
      }
    }
  }
  const adjusted = (x: Life) => {
    const v = raw.get(x)!;
    if (!(v === v)) return NaN;
    let s = 0;
    let n = 0;
    for (const o of respawns.get(w.tracks[x.ti].m) ?? []) {
      if (o.ti === x.ti || Math.abs(o.t - x.t) > 30) continue;
      s += o.v;
      n++;
    }
    return n ? v - s / n : NaN;
  };
  for (const l of byTrack.values()) {
    if (l.length < 2) continue;
    seqs.push(l.map((x) => ({ out: x.died ? (x.kills > 0 ? 1 : 0) : -1, risk: adjusted(x), early: x.died && x.span <= 30 ? 1 : 0 })));
  }
  // Statistics over consecutive pairs: risk after a loss minus after a win; early death after an early death minus otherwise.
  const stat = (S: LV[][]) => {
    const a = new Float64Array(8);
    for (const q of S)
      for (let i = 1; i < q.length; i++) {
        const prev = q[i - 1];
        const next = q[i];
        if (prev.out >= 0 && next.risk === next.risk) {
          a[prev.out * 2] += next.risk;
          a[prev.out * 2 + 1]++;
        }
        a[4 + prev.early * 2] += next.early;
        a[5 + prev.early * 2]++;
      }
    return {
      loss: a[1] ? a[0] / a[1] : NaN,
      win: a[3] ? a[2] / a[3] : NaN,
      nl: a[1],
      nw: a[3],
      tiltAfter: a[7] ? a[6] / a[7] : NaN,
      tiltOther: a[5] ? a[4] / a[5] : NaN,
      nt: a[5] + a[7],
      ne: a[7],
    };
  };
  const o = stat(seqs);
  if (o.nl + o.nw < 30 || o.nl < 5 || o.nw < 5) return undefined;
  const d = o.loss - o.win;
  const td = o.tiltAfter - o.tiltOther;
  // Null: each unit's lives in random order (Miller and Sanjurjo's correction: the bias of conditioning on
  // the same finite sequence is in the null too).
  const sh = seqs.map((q) => q.slice());
  const nd: number[] = [];
  const nt: number[] = [];
  for (let k = 0; k < 1000; k++) {
    // The first life (everyone setting out together) stays first.
    for (const q of sh) {
      const rest = q.slice(1);
      shuffle(rest, r);
      for (let i = 1; i < q.length; i++) q[i] = rest[i - 1];
    }
    const x = stat(sh);
    if (x.loss === x.loss && x.win === x.win) nd.push(x.loss - x.win);
    if (x.tiltAfter === x.tiltAfter && x.tiltOther === x.tiltOther) nt.push(x.tiltAfter - x.tiltOther);
  }
  const boots: number[] = [];
  for (let k = 0; k < 400; k++) {
    const pick: LV[][] = [];
    for (let i = 0; i < seqs.length; i++) pick.push(seqs[Math.floor(r() * seqs.length)]);
    const x = stat(pick);
    if (x.loss === x.loss && x.win === x.win) boots.push(x.loss - x.win);
  }
  boots.sort((a, b) => a - b);
  return {
    p: permTwoSided(d, nd),
    q: 1,
    pairs: o.nl + o.nw,
    afterLoss: round(o.loss),
    afterWin: round(o.win),
    lo: round(boots[Math.floor(boots.length * 0.025)] ?? NaN),
    hi: round(boots[Math.floor(boots.length * 0.975)] ?? NaN),
    // Not on round data yet: on CS2 tables it gives an implausible 0.5% against 13% that still needs explaining.
    tilt: !w.rounds.length && o.nt >= 30 && o.ne >= 5 && td === td ? { after: round(o.tiltAfter), otherwise: round(o.tiltOther), p: round(permTwoSided(td, nt), 5), pairs: o.nt } : null,
  };
}

// ------------------------------------------------------------------ streaks

/** P(1 | k ones before) - P(1 | k zeros before) within one sequence; NaN when either is undefined. */
export function streakDiff(seq: ArrayLike<number>, k: number): number {
  let n1 = 0;
  let s1 = 0;
  let n0 = 0;
  let s0 = 0;
  let ones = 0;
  let zeros = 0;
  for (let i = 0; i < seq.length; i++) {
    if (i >= k) {
      if (ones >= k) {
        n1++;
        s1 += seq[i];
      } else if (zeros >= k) {
        n0++;
        s0 += seq[i];
      }
    }
    if (seq[i]) {
      ones++;
      zeros = 0;
    } else {
      zeros++;
      ones = 0;
    }
  }
  return n1 && n0 ? s1 / n1 - s0 / n0 : NaN;
}

export function streaks(w: World, r: Rng): StreakMetric | undefined {
  const seqs: Uint8Array[] = [];
  let outcomes = 0;
  for (const t of w.tracks) {
    const ev: [number, number][] = [...t.kills.map((v) => [v, 1] as [number, number]), ...t.deaths.map((v) => [v, 0] as [number, number])];
    if (ev.length < 6) continue;
    ev.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
    seqs.push(Uint8Array.from(ev, (e) => e[1]));
    outcomes += ev.length;
  }
  if (seqs.length < 5) return undefined;
  const ks: StreakK[] = [];
  for (let k = 1; k <= 3; k++) {
    const meanDiff = (S: Uint8Array[]) => {
      let s = 0;
      let n = 0;
      for (const q of S) {
        const d = streakDiff(q, k);
        if (d === d) {
          s += d;
          n++;
        }
      }
      return { d: n ? s / n : NaN, n };
    };
    const o = meanDiff(seqs);
    if (o.n < 5) continue;
    const sh = seqs.map((q) => q.slice());
    const nulls: number[] = [];
    for (let rep = 0; rep < 1000; rep++) {
      for (const q of sh) shuffle(q, r);
      const d = meanDiff(sh).d;
      if (d === d) nulls.push(d);
    }
    const bias = mean(nulls);
    ks.push({ k, players: o.n, diff: round(o.d), bias: round(bias), corrected: round(o.d - bias), p: round(permTwoSided(o.d, nulls), 5) });
  }
  if (!ks.length) return undefined;
  return { p: Math.min(1, Math.min(...ks.map((x) => x.p)) * ks.length), q: 1, outcomes, ks };
}

// ------------------------------------------------------------------ buys

export function buys(w: World, r: Rng): BuyMetric | undefined {
  const recs = w.rounds.filter((x) => x.equip === x.equip && w.tracks[x.ti].team >= 0);
  if (recs.length < 30) return undefined;
  const vals = recs.map((x) => x.equip).sort((a, b) => a - b);
  // Counter-Strike's conventional buy bands by equipment value (eco, force, full); elsewhere tertiles.
  const cs = vals[vals.length - 1] <= 20000 && vals[Math.floor(vals.length / 2)] >= 200;
  const [t1, t2] = cs ? [1500, 4000] : [vals[Math.floor(vals.length / 3)], vals[Math.floor((2 * vals.length) / 3)]];
  const cat = (v: number) => (v < t1 ? 0 : v < t2 ? 1 : 2);
  const sides = new Map<string, number[]>();
  const teamOf = new Map<string, string>();
  for (const x of recs) {
    const t = w.tracks[x.ti];
    const key = `${t.m}:${t.team}:${x.round}`;
    let l = sides.get(key);
    if (!l) sides.set(key, (l = []));
    l.push(cat(x.equip));
    teamOf.set(key, `${t.m}:${t.team}`);
  }
  const keys = [...sides.keys()].filter((k) => sides.get(k)!.length >= 3);
  if (keys.length < 10) return undefined;
  const flat: number[] = [];
  const size: number[] = [];
  const grp: string[] = [];
  for (const k of keys) {
    for (const c of sides.get(k)!) flat.push(c);
    size.push(sides.get(k)!.length);
    grp.push(teamOf.get(k)!);
  }
  const score = (F: ArrayLike<number>) => {
    const counts: Float64Array[] = [];
    let o = 0;
    let un = 0;
    for (const s of size) {
      const c = new Float64Array(3);
      for (let i = 0; i < s; i++) c[F[o + i]]++;
      if (c[0] === s || c[1] === s || c[2] === s) un++;
      counts.push(c);
      o += s;
    }
    return { ...fleissKappa(counts, 3), un: un / size.length };
  };
  const obs = score(flat);
  // Null: within each side of each match, the player-rounds' buys shuffled across its rounds.
  const bySide = new Map<string, number[]>();
  let o = 0;
  size.forEach((s, i) => {
    let l = bySide.get(grp[i]);
    if (!l) bySide.set(grp[i], (l = []));
    for (let j = 0; j < s; j++) l.push(o + j);
    o += s;
  });
  const F = Int32Array.from(flat);
  const nulls: number[] = [];
  const nullUn: number[] = [];
  for (let k = 0; k < 1000; k++) {
    for (const ix of bySide.values()) {
      const sub = ix.map((i) => flat[i]);
      shuffle(sub, r);
      ix.forEach((i, j) => (F[i] = sub[j]));
    }
    const s = score(F);
    nulls.push(s.kappa);
    nullUn.push(s.un);
  }
  return {
    p: permTwoSided(obs.kappa, nulls),
    q: 1,
    rounds: keys.length,
    kappa: round(obs.kappa),
    kappaNull: round(mean(nulls)),
    unanimous: round(obs.un),
    unanimousNull: round(mean(nullUn)),
    shares: obs.shares.map((v) => round(v)),
  };
}

// ------------------------------------------------------------------ suppression

function countIn(a: number[], lo: number, hi: number): number {
  let n = 0;
  for (const v of a) if (v > lo && v <= hi) n++;
  return n;
}

function relSpeed(t: Track, o: number): number {
  if (o < 0 || o >= t.n || !(t.pace > 0)) return NaN;
  return Math.min(5, Math.hypot(t.vx[o], t.vz[o]) / t.pace);
}

/** Speed change around bin `o`: the two bins after against the two before. */
function speedChange(t: Track, o: number): number {
  const before = mean([relSpeed(t, o - 2), relSpeed(t, o - 1)]);
  const after = mean([relSpeed(t, o + 1), relSpeed(t, o + 2)]);
  return after - before;
}

export function suppression(w: World, r: Rng): SuppressionMetric | undefined {
  const dS: number[] = [];
  const dW: number[] = [];
  const dF: number[] = [];
  let events = 0;
  let fires = 0;
  let sHit = 0;
  let sCtl = 0;
  let nHit = 0;
  let nCtl = 0;
  let fHit = 0;
  let fCtl = 0;
  for (const t of w.tracks) {
    if (!t.hurts.length || !(t.pace > 0)) continue;
    const hits = t.hurts.filter((h) => !t.deaths.some((d) => d >= h && d - h <= 3));
    const calm = (tt: number) => !t.hurts.some((h) => Math.abs(h - tt) <= 10) && !t.deaths.some((d) => Math.abs(d - tt) <= 10);
    const hs: number[] = [];
    const hf: number[] = [];
    for (const h of hits) {
      const o = stateAt(t, h, 0);
      if (o < 0) continue;
      const d = speedChange(t, o);
      if (!(d === d)) continue;
      hs.push(d);
      hf.push((countIn(t.fires, h, h + 10) - countIn(t.fires, h - 10, h)) * 6);
    }
    if (!hs.length) continue;
    const cs: number[] = [];
    const cf: number[] = [];
    for (let k = 0; k < hs.length * 4 && cs.length < hs.length * 2; k++) {
      const o = 2 + Math.floor(r() * Math.max(1, t.n - 4));
      const tt = (t.b0 + o + 0.5) * BIN;
      if (!calm(tt)) continue;
      const d = speedChange(t, o);
      if (!(d === d)) continue;
      cs.push(d);
      cf.push((countIn(t.fires, tt, tt + 10) - countIn(t.fires, tt - 10, tt)) * 6);
    }
    if (!cs.length) continue;
    events += hs.length;
    fires += t.fires.length;
    dS.push(mean(hs) - mean(cs));
    dF.push(mean(hf) - mean(cf));
    dW.push(hs.length);
    sHit += hs.reduce((a, b) => a + b, 0);
    nHit += hs.length;
    sCtl += cs.reduce((a, b) => a + b, 0);
    nCtl += cs.length;
    fHit += hf.reduce((a, b) => a + b, 0);
    fCtl += cf.reduce((a, b) => a + b, 0);
  }
  if (events < 10 || dS.length < 3) return undefined;
  // Minimum effects of interest: a twentieth of the unit's pace, one shot a minute.
  const st = pairedTest(dS, dW, r, 1000, 0.05);
  const ft = fires >= 20 ? pairedTest(dF, dW, r, 1000, 1) : null;
  return {
    p: st.p,
    q: 1,
    events,
    speedHit: round(sHit / nHit),
    speedControl: round(sCtl / nCtl),
    lo: round(st.lo),
    hi: round(st.hi),
    fireHit: ft ? round(fHit / nHit, 2) : null,
    fireControl: ft ? round(fCtl / nCtl, 2) : null,
    fireP: ft ? round(ft.p, 5) : null,
  };
}
