/**
 * Measures of collective motion on the resampled tracks (`acc.ts`): how far
 * a side keeps together and what straggling costs (cohesion), how aligned and
 * how rotating its moving units are (Vicsek's order parameter, milling), who
 * turns first (leader-follower lags after Nagy et al. 2010), whether route
 * choices copy the teammate before (herding, information cascades), whether
 * counter-flows separate into lanes and trails persist (Helbing's lane and
 * trail formation), how speed, flow, deaths and effort change with crowding
 * (the fundamental diagram, faster-is-slower, social loafing) and how a side
 * moves as its losses mount (breaking point).
 */

import { binomTwoSided, binomUpper } from '../stats';
import { BIN, type MatchW, type Track, type World } from './acc';
import { bootRatio, median, pairedTest, permP, permTwoSided, quantile, rateRatio, round, spearman, type Rng } from './bstats';
import type { BreakingMetric, CohesionMetric, CrowdingMetric, HerdingMetric, LanesMetric, LeadersMetric, OrderMetric } from './types';

/** Nearest other point of each point: a sweep over x (fast for the spread-out groups of a match). */
export function nearest(xs: Float64Array, zs: Float64Array, n: number, out: Float64Array): void {
  const idx = Array.from({ length: n }, (_, i) => i).sort((a, b) => xs[a] - xs[b]);
  for (let p = 0; p < n; p++) {
    const i = idx[p];
    let best = Infinity;
    for (let q = p - 1; q >= 0; q--) {
      const j = idx[q];
      const dx = xs[i] - xs[j];
      if (dx * dx >= best) break;
      const d = dx * dx + (zs[i] - zs[j]) ** 2;
      if (d < best) best = d;
    }
    for (let q = p + 1; q < n; q++) {
      const j = idx[q];
      const dx = xs[j] - xs[i];
      if (dx * dx >= best) break;
      const d = dx * dx + (zs[i] - zs[j]) ** 2;
      if (d < best) best = d;
    }
    out[i] = Math.sqrt(best);
  }
}

/** Calls `f(trackIndex, offset)` for each member of bin `i` of the match. */
function members(w: World, M: MatchW, i: number, f: (ti: number, o: number) => void): void {
  const b = M.B0 + i;
  for (let j = M.start[i]; j < M.start[i + 1]; j++) {
    const ti = M.mem[j];
    f(ti, b - w.tracks[ti].b0);
  }
}

/** The offset of the track's point that stood when something happened at `t`: the bin itself or up to `back` before. */
export function stateAt(t: Track, time: number, back = 3): number {
  const o = Math.floor(time / BIN) - t.b0;
  for (let k = 0; k <= back; k++) {
    const q = o - k;
    if (q >= 0 && q < t.n && t.x[q] === t.x[q]) return q;
  }
  return -1;
}

const teamKey = (m: number, team: number) => m * 1024 + (team + 1);

// ------------------------------------------------------------------ cohesion

export function cohesion(w: World, r: Rng): CohesionMetric | undefined {
  const per = new Map<number, number[]>();
  const sample: number[] = [];
  let seen = 0;
  const xs = new Float64Array(4096);
  const zs = new Float64Array(4096);
  const out = new Float64Array(4096);
  for (const M of w.matches) {
    const L = M.B1 - M.B0 + 1;
    const byTeam = new Map<number, { ti: number; o: number }[]>();
    for (let i = 0; i < L; i++) {
      byTeam.clear();
      members(w, M, i, (ti, o) => {
        const tm = w.tracks[ti].team;
        let l = byTeam.get(tm);
        if (!l) byTeam.set(tm, (l = []));
        l.push({ ti, o });
      });
      for (const [tm, l] of byTeam) {
        if (l.length < 2 || l.length > 4096) continue;
        for (let j = 0; j < l.length; j++) {
          const t = w.tracks[l[j].ti];
          xs[j] = t.x[l[j].o];
          zs[j] = t.z[l[j].o];
        }
        nearest(xs, zs, l.length, out);
        const key = teamKey(M.m, tm);
        let pl = per.get(key);
        if (!pl) per.set(key, (pl = []));
        for (let j = 0; j < l.length; j++) {
          const d = out[j];
          w.tracks[l[j].ti].nn[l[j].o] = d;
          if (pl.length < 20000) pl.push(d);
          seen++;
          if (sample.length < 100000) sample.push(d);
          else {
            const k = Math.floor(r() * seen);
            if (k < sample.length) sample[k] = d;
          }
        }
      }
    }
  }
  if (sample.length < 50) return undefined;
  w.s0 = Math.max(1e-6, median(sample));
  const spacing = new Map<number, number>();
  for (const [k, l] of per) spacing.set(k, Math.max(w.s0 * 0.25, median(l)));
  // Straggling: beyond three times the side's typical spacing in this match.
  let sx = 0;
  let gx = 0;
  let sd = 0;
  let gd = 0;
  let samples = 0;
  for (const t of w.tracks) {
    const s = spacing.get(teamKey(t.m, t.team));
    if (!s) continue;
    for (let o = 0; o < t.n; o++) {
      const d = t.nn[o];
      if (!(d === d)) continue;
      samples++;
      if (d > 3 * s) sx += BIN;
      else gx += BIN;
    }
    for (const td of t.deaths) {
      const o = stateAt(t, td);
      if (o < 0 || !(t.nn[o] === t.nn[o])) continue;
      if (t.nn[o] > 3 * s) sd++;
      else gd++;
    }
  }
  const rr = rateRatio(sd, sx, gd, gx);
  if (!rr) return undefined;
  // Outcome: a side's relative spacing in a 20 s window against its share of the window's kills.
  const spc: number[] = [];
  const share: number[] = [];
  for (const M of w.matches) {
    const acc = new Map<number, { s: number; n: number }>();
    for (const ti of M.tracks) {
      const t = w.tracks[ti];
      const s = spacing.get(teamKey(M.m, t.team));
      if (!s) continue;
      for (let o = 0; o < t.n; o++) {
        if (!(t.nn[o] === t.nn[o])) continue;
        const key = Math.floor((t.b0 + o) / 10) * 1024 + t.team + 1;
        let a = acc.get(key);
        if (!a) acc.set(key, (a = { s: 0, n: 0 }));
        a.s += t.nn[o] / s;
        a.n++;
      }
    }
    const kills = new Map<number, number>();
    for (const k of M.killT) {
      const key = Math.floor(k.t / BIN / 10) * 1024 + k.team + 1;
      kills.set(key, (kills.get(key) ?? 0) + 1);
    }
    const total = new Map<number, number>();
    for (const [key, v] of kills) total.set(Math.floor(key / 1024), (total.get(Math.floor(key / 1024)) ?? 0) + v);
    for (const [key, a] of acc) {
      const tot = total.get(Math.floor(key / 1024)) ?? 0;
      if (tot < 2 || a.n < 2) continue;
      spc.push(a.s / a.n);
      share.push((kills.get(key) ?? 0) / tot);
    }
  }
  const sp = spc.length >= 20 ? spearman(spc, share) : null;
  return {
    p: rr.p,
    q: 1,
    samples,
    spacing: round(w.s0 / w.upm, 2),
    stragglerShare: round(sx / Math.max(1e-9, sx + gx)),
    deathRR: round(rr.rr),
    lo: round(rr.lo),
    hi: round(rr.hi),
    outcomeRho: sp ? round(sp.rho) : null,
    outcomeP: sp ? round(sp.p, 5) : null,
  };
}

// ------------------------------------------------------------------ order

function unitHeading(t: Track, o: number, vmin: number): [number, number] | null {
  const vx = t.vx[o];
  const vz = t.vz[o];
  const s = Math.hypot(vx, vz);
  if (!(s >= vmin)) return null;
  return [vx / s, vz / s];
}

export function order(w: World, r: Rng): OrderMetric | undefined {
  const cl: number[] = [];
  const clW: number[] = [];
  let groups = 0;
  let sumP = 0;
  let sumNull = 0;
  let nNull = 0;
  let sumM = 0;
  let pol = 0;
  let mil = 0;
  let swa = 0;
  const ph = new Float64Array(10);
  const phN = new Float64Array(10);
  let oWin = 0;
  let oKills = 0;
  let oWindows = 0;
  let matches = 0;
  for (const M of w.matches) {
    const L = M.B1 - M.B0 + 1;
    const teams = [...new Set(M.tracks.map((ti) => w.tracks[ti].team))];
    const T = teams.length;
    const tIdx = new Map(teams.map((t, i) => [t, i]));
    // Observed: per bin and side.
    const ux = new Float64Array(L * T);
    const uz = new Float64Array(L * T);
    const cx = new Float64Array(L * T);
    const cz = new Float64Array(L * T);
    const cn = new Float64Array(L * T);
    for (const ti of M.tracks) {
      const t = w.tracks[ti];
      const s = tIdx.get(t.team)!;
      for (let o = 0; o < t.n; o++) {
        const h = unitHeading(t, o, w.vmin);
        if (!h) continue;
        const k = (t.b0 + o - M.B0) * T + s;
        ux[k] += h[0];
        uz[k] += h[1];
        cx[k] += t.x[o];
        cz[k] += t.z[o];
        cn[k]++;
      }
    }
    const mill = new Float64Array(L * T);
    for (const ti of M.tracks) {
      const t = w.tracks[ti];
      const s = tIdx.get(t.team)!;
      for (let o = 0; o < t.n; o++) {
        const k = (t.b0 + o - M.B0) * T + s;
        if (cn[k] < 3) continue;
        const h = unitHeading(t, o, w.vmin);
        if (!h) continue;
        const rx = t.x[o] - cx[k] / cn[k];
        const rz = t.z[o] - cz[k] / cn[k];
        const d = Math.hypot(rx, rz);
        if (d > 0) mill[k] += (rx * h[1] - rz * h[0]) / d;
      }
    }
    // Null: each unit's track shifted in time within the match (keeps its own path, breaks the simultaneity).
    const nx = new Float64Array(L * T);
    const nz = new Float64Array(L * T);
    const nc = new Float64Array(L * T);
    const nullP = new Float64Array(Math.ceil(L / 30));
    const nullN = new Float64Array(Math.ceil(L / 30));
    for (let rep = 0; rep < 2 && L >= 20; rep++) {
      nx.fill(0);
      nz.fill(0);
      nc.fill(0);
      for (const ti of M.tracks) {
        const t = w.tracks[ti];
        const s = tIdx.get(t.team)!;
        const off = Math.floor(L * (0.25 + 0.5 * r()));
        for (let o = 0; o < t.n; o++) {
          const h = unitHeading(t, o, w.vmin);
          if (!h) continue;
          const b = (t.b0 + o - M.B0 + off) % L;
          const k = b * T + s;
          nx[k] += h[0];
          nz[k] += h[1];
          nc[k]++;
        }
      }
      for (let i = 0; i < L; i++)
        for (let s = 0; s < T; s++) {
          const k = i * T + s;
          if (nc[k] >= 3) {
            nullP[Math.floor(i / 30)] += Math.hypot(nx[k], nz[k]) / nc[k];
            nullN[Math.floor(i / 30)]++;
          }
        }
    }
    const obsP = new Float64Array(nullP.length);
    const obsN = new Float64Array(nullP.length);
    // Windows of 10 bins (20 s): each side's mean polarisation, for the outcome.
    const win = new Map<number, { p: number; n: number }>();
    let any = false;
    for (let i = 0; i < L; i++)
      for (let s = 0; s < T; s++) {
        const k = i * T + s;
        const n = cn[k];
        if (n < 3) continue;
        any = true;
        const P = Math.hypot(ux[k], uz[k]) / n;
        const Mi = Math.abs(mill[k]) / n;
        groups++;
        sumP += P;
        sumM += Mi;
        if (P > 0.65) pol++;
        else if (Mi > 0.65 && P < 0.35) mil++;
        else if (P < 0.35 && Mi < 0.35) swa++;
        const d = Math.min(9, Math.floor((10 * i) / L));
        ph[d] += P;
        phN[d]++;
        obsP[Math.floor(i / 30)] += P;
        obsN[Math.floor(i / 30)]++;
        const wk = Math.floor((M.B0 + i) / 10) * 64 + s;
        const a = win.get(wk);
        if (a) {
          a.p += P;
          a.n++;
        } else win.set(wk, { p: P, n: 1 });
      }
    if (any) matches++;
    for (let c = 0; c < obsP.length; c++) {
      if (obsN[c] < 3 || nullN[c] < 3) continue;
      const d = obsP[c] / obsN[c] - nullP[c] / nullN[c];
      cl.push(d);
      clW.push(obsN[c]);
      sumNull += (nullP[c] / nullN[c]) * obsN[c];
      nNull += obsN[c];
    }
    // Outcome: in fights between two aligned sides, the kills of the more aligned one.
    const kw = new Map<number, number>();
    for (const k of M.killT) {
      const s = tIdx.get(k.team);
      if (s === undefined) continue;
      const key = Math.floor(k.t / BIN / 10) * 64 + s;
      kw.set(key, (kw.get(key) ?? 0) + 1);
    }
    const byW = new Map<number, { s: number; p: number }[]>();
    for (const [key, a] of win) {
      const wi = Math.floor(key / 64);
      let l = byW.get(wi);
      if (!l) byW.set(wi, (l = []));
      l.push({ s: key % 64, p: a.p / a.n });
    }
    for (const [wi, l] of byW) {
      if (l.length !== 2 || Math.abs(l[0].p - l[1].p) < 0.1) continue;
      const hi = l[0].p > l[1].p ? l[0] : l[1];
      const lo = hi === l[0] ? l[1] : l[0];
      const kh = kw.get(wi * 64 + hi.s) ?? 0;
      const kl = kw.get(wi * 64 + lo.s) ?? 0;
      if (kh + kl === 0) continue;
      oWindows++;
      oWin += kh;
      oKills += kh + kl;
    }
  }
  if (groups < 30 || cl.length < 3) return undefined;
  const t = pairedTest(cl, clW, r);
  const polar = sumP / groups;
  return {
    p: t.p,
    q: 1,
    groups,
    matches,
    polar: round(polar),
    polarNull: round(nNull ? sumNull / nNull : NaN),
    lo: round(t.lo),
    hi: round(t.hi),
    mill: round(sumM / groups),
    states: { polarised: round(pol / groups), milling: round(mil / groups), swarm: round(swa / groups) },
    phases: Array.from(ph, (v, i) => round(phN[i] ? v / phN[i] : NaN)),
    outcome: oKills >= 10 ? { windows: oWindows, kills: oKills, share: round(oWin / oKills), p: round(binomTwoSided(oWin, oKills, 0.5), 5) } : null,
  };
}

// ------------------------------------------------------------------ herding and lanes

export function herdingAndLanes(w: World, r: Rng): { herding?: HerdingMetric; lanes?: LanesMetric; busy: Set<number> | null } {
  const Ch = w.s0 === w.s0 ? Math.max(2 * w.s0, 2 * w.upm) : 10 * w.upm;
  const cellOf = (x: number, z: number) => (Math.floor(x / Ch) + 32768) * 65536 + (Math.floor(z / Ch) + 32768);
  const W = 15;
  // Passes: a unit leaving a place, with the direction it left in (eight sectors).
  const pCell: number[] = [];
  const pM: number[] = [];
  const pB: number[] = [];
  const pTeam: number[] = [];
  const pT: number[] = [];
  const pDir: number[] = [];
  // Movement presence by place, and by match.
  const presence = new Map<number, number>();
  const perMatch = new Map<number, Map<number, number>>();
  // Lanes: moving points by place.
  const lc = new Map<number, { c2: number; s2: number; seen: number; pts: number[] }>();
  const Cl = 1.5 * Ch;
  const laneOf = (x: number, z: number, g: number) => g * 4294967296 + (Math.floor(x / Cl + g * 0.5) + 32768) * 65536 + (Math.floor(z / Cl + g * 0.5) + 32768);
  for (const t of w.tracks) {
    let pm = perMatch.get(t.m);
    if (!pm) perMatch.set(t.m, (pm = new Map()));
    let prevCell = NaN;
    let entry = 8;
    // Runs: stretches of a unit's movement that keep their general direction (a leg along a corridor).
    let run = 0;
    let rx = 0;
    let rz = 0;
    for (let o = 0; o < t.n; o++) {
      const x = t.x[o];
      if (!(x === x)) {
        prevCell = NaN;
        rx = rz = 0;
        continue;
      }
      const c = cellOf(x, t.z[o]);
      const h = unitHeading(t, o, w.vmin);
      if (h) {
        if (h[0] * rx + h[1] * rz <= 0) {
          run++;
          rx = h[0];
          rz = h[1];
        }
        presence.set(c, (presence.get(c) ?? 0) + 1);
        pm.set(c, (pm.get(c) ?? 0) + 1);
        const th = Math.atan2(h[1], h[0]);
        for (let g = 0; g < 2; g++) {
          const lk = laneOf(x, t.z[o], g);
          let L = lc.get(lk);
          if (!L) lc.set(lk, (L = { c2: 0, s2: 0, seen: 0, pts: [] }));
          L.c2 += Math.cos(2 * th);
          L.s2 += Math.sin(2 * th);
          // A uniform sample of the place's moving points, each with its run, shared by every place the run
          // crossed, so the null can flip a run's direction everywhere at once.
          const v = t.k * 100000 + run;
          if (L.pts.length < 4000) L.pts.push(th, x, t.z[o], v);
          else {
            const j = Math.floor(r() * (L.seen + 1));
            if (j < 1000) L.pts.splice(4 * j, 4, th, x, t.z[o], v);
          }
          L.seen++;
        }
      }
      if (prevCell === prevCell && c !== prevCell) {
        const dx = x - t.x[o - 1];
        const dz = t.z[o] - t.z[o - 1];
        const d = ((Math.round((Math.atan2(dz, dx) / Math.PI) * 4) % 8) + 8) % 8;
        // A place and the way it was entered: units coming the same way share their likely exits.
        pCell.push(prevCell * 9 + entry);
        pM.push(t.m);
        pB.push(t.b0 + o - 1);
        pTeam.push(t.team);
        pT.push(t.k);
        pDir.push(d);
        entry = d;
      } else if (prevCell !== prevCell) entry = 8;
      prevCell = c;
    }
  }
  // ---- herding
  let herding: HerdingMetric | undefined;
  const P = pCell.length;
  if (P >= 50) {
    const idx = Array.from({ length: P }, (_, i) => i).sort((a, b) => pCell[a] - pCell[b] || pM[a] - pM[b] || pB[a] - pB[b]);
    const dir = Int32Array.from(idx, (i) => pDir[i]);
    const segs: [number, number, number][] = [];
    // Pairs (later pass, earlier pass) by position in `idx`, and expected agreement.
    const pairA: number[] = [];
    const pairB: number[] = [];
    const enA: number[] = [];
    const enB: number[] = [];
    let E = 0;
    let Ee = 0;
    for (let a = 0; a < P; ) {
      let b = a;
      while (b < P && pCell[idx[b]] === pCell[idx[a]]) b++;
      const n = b - a;
      const cnt = new Float64Array(8);
      for (let j = a; j < b; j++) cnt[dir[j]]++;
      let distinct = 0;
      let sq = 0;
      for (let d = 0; d < 8; d++) {
        if (cnt[d]) distinct++;
        sq += (cnt[d] / n) ** 2;
      }
      if (n >= 10 && distinct >= 2) {
        segs.push([a, b, sq]);
        for (let j = a + 1; j < b; j++) {
          const pj = idx[j];
          let mate = -1;
          let foe = -1;
          for (let q = j - 1; q >= a; q--) {
            const pq = idx[q];
            if (pM[pq] !== pM[pj] || pB[pj] - pB[pq] > W) break;
            if (pB[pq] >= pB[pj] || pT[pq] === pT[pj]) continue;
            if (pTeam[pq] === pTeam[pj]) {
              if (mate < 0) mate = q;
            } else if (foe < 0 && pTeam[pq] >= 0 && pTeam[pj] >= 0) foe = q;
            if (mate >= 0 && foe >= 0) break;
          }
          if (mate >= 0) {
            pairA.push(j);
            pairB.push(mate);
            E += sq;
          }
          if (foe >= 0) {
            enA.push(j);
            enB.push(foe);
            Ee += sq;
          }
        }
      }
      a = b;
    }
    const same = (A: number[], B: number[]) => {
      let s = 0;
      for (let i = 0; i < A.length; i++) if (dir[A[i]] === dir[B[i]]) s++;
      return s;
    };
    const O = same(pairA, pairB);
    if (pairA.length >= 30 && E > 0) {
      // Teammates copy beyond what the place's exit shares give - but so may anyone at the same time (a common
      // goal, the flow of the moment: Manski's reflection problem). With enemy passes to compare, the test is
      // whether a teammate's exit is copied more than an enemy's.
      const ctl = enA.length >= 30 && Ee > 0;
      const stat = () => same(pairA, pairB) / E - (ctl ? same(enA, enB) / Ee : 1);
      const obs = stat();
      const Oe = same(enA, enB);
      const nulls: number[] = [];
      const keep = dir.slice();
      for (let k = 0; k < 500; k++) {
        for (const [a, b] of segs) {
          for (let i = b - 1; i > a; i--) {
            const j = a + Math.floor(r() * (i - a + 1));
            const tmp = dir[i];
            dir[i] = dir[j];
            dir[j] = tmp;
          }
        }
        nulls.push(stat());
      }
      dir.set(keep);
      const index = O / E;
      const se = 1 / Math.sqrt(Math.max(1, O));
      herding = {
        p: permTwoSided(obs, nulls),
        relative: ctl && Oe > 0 ? round(index / (Oe / Ee)) : null,
        q: 1,
        pairs: pairA.length,
        same: O,
        expected: round(E, 1),
        index: round(index),
        lo: round(index * Math.exp(-1.96 * se)),
        hi: round(index * Math.exp(1.96 * se)),
        enemyIndex: enA.length >= 30 && Ee > 0 ? round(Oe / Ee) : null,
        places: segs.length,
        windowSecs: W * BIN,
      };
    }
  }
  // ---- lanes: lateral segregation of the two directions along a place's main axis
  let lanes: LanesMetric | undefined;
  const cellsL: { s: Int8Array; strip: Uint8Array; vis: Int32Array; vs: Int8Array; run: Float64Array; g: number }[] = [];
  for (const [c, L] of lc) {
    const phi = 0.5 * Math.atan2(L.s2, L.c2);
    const g = Math.floor(c / 4294967296);
    const cc = c - g * 4294967296;
    const cx = (Math.floor(cc / 65536) - 32768 + 0.5 - g * 0.5) * Cl;
    const cz = ((cc % 65536) - 32768 + 0.5 - g * 0.5) * Cl;
    const lat: number[] = [];
    const vis: number[] = [];
    const vsum = new Map<number, number>();
    for (let i = 0; i < L.pts.length; i += 4) {
      const cos = Math.cos(L.pts[i] - phi);
      if (Math.abs(cos) < 0.7) continue;
      lat.push(-(L.pts[i + 1] - cx) * Math.sin(phi) + (L.pts[i + 2] - cz) * Math.cos(phi));
      vis.push(L.pts[i + 3]);
      vsum.set(L.pts[i + 3], (vsum.get(L.pts[i + 3]) ?? 0) + cos);
    }
    // A run's direction in a place is its points' majority there; the null flips whole runs, not points.
    const ids = [...vsum.keys()];
    const local = new Map(ids.map((v, i) => [v, i]));
    const vs = Int8Array.from(ids, (v) => (vsum.get(v)! >= 0 ? 1 : -1));
    let np = 0;
    let nm = 0;
    for (const d of vs) {
      if (d > 0) np++;
      else nm++;
    }
    if (np < 4 || nm < 4 || lat.length < 30) continue;
    const vi = Int32Array.from(vis, (v) => local.get(v)!);
    const s = Array.from(vi, (v) => vs[v]);
    // Strips one standard deviation of the place's own lateral spread wide, about its mean.
    let mu = 0;
    for (const v of lat) mu += v;
    mu /= lat.length;
    let sd = 0;
    for (const v of lat) sd += (v - mu) ** 2;
    sd = Math.sqrt(sd / lat.length) || 1;
    cellsL.push({ s: Int8Array.from(s), strip: Uint8Array.from(lat, (v) => Math.max(0, Math.min(5, Math.floor((v - mu) / sd + 3)))), vis: vi, vs, run: Float64Array.from(ids), g });
  }
  const segregation = (cells: typeof cellsL) => {
    let num = 0;
    let den = 0;
    const a = new Float64Array(12);
    for (const c of cells) {
      a.fill(0);
      for (let i = 0; i < c.s.length; i++) a[c.strip[i] * 2 + (c.s[i] > 0 ? 0 : 1)]++;
      let d = 0;
      for (let k = 0; k < 6; k++) d += Math.abs(a[2 * k] - a[2 * k + 1]);
      // Segregation beyond the imbalance of the two directions themselves.
      let np = 0;
      for (let k = 0; k < 6; k++) np += a[2 * k];
      const n = c.s.length;
      const base = Math.abs(2 * np - n);
      num += Math.max(0, d - base);
      den += n - base;
    }
    return den > 0 ? num / den : NaN;
  };
  // Trails.
  const pres = [...presence.values()].sort((a, b) => b - a);
  const totalPres = pres.reduce((s, v) => s + v, 0);
  if (cellsL.length >= 5 || pres.length >= 20) {
    // Each grid tested on its own (the same runs appear in both, so pooling them would understate chance);
    // the better one is reported, Bonferroni over the two.
    let obs = NaN;
    let nulls: number[] = [];
    let pL = 1;
    let nCells = 0;
    for (let g = 0; g < 2; g++) {
      const cells = cellsL.filter((c) => c.g === g);
      if (cells.length < 5) continue;
      const o = segregation(cells);
      const nu: number[] = [];
      const keep = cells.map((c) => c.s.slice());
      // Null: each run's direction flipped at random, the same in every place it crossed (lateral position
      // independent of direction, with the dependence between neighbouring places kept).
      const flip = new Map<number, number>();
      // As many draws as a budget of point visits allows (thousands of places in a long campaign), 100 to 500.
      const pts = cells.reduce((x, c) => x + c.s.length, 0);
      const draws = Math.max(100, Math.min(500, Math.floor(5e7 / Math.max(1, pts))));
      for (let k = 0; k < draws; k++) {
        flip.clear();
        for (const c of cells) {
          for (let i = 0; i < c.s.length; i++) {
            const id = c.run[c.vis[i]];
            let f = flip.get(id);
            if (f === undefined) flip.set(id, (f = r() < 0.5 ? -1 : 1));
            c.s[i] = c.vs[c.vis[i]] * f;
          }
        }
        nu.push(segregation(cells));
      }
      cells.forEach((c, i) => c.s.set(keep[i]));
      // One-sided: only segregation beyond chance is a lane.
      let ex = 0;
      for (const v of nu) if (v >= o - 1e-12) ex++;
      const pg = permP(ex, nu.length);
      if (!(obs === obs) || pg < pL || (pg === pL && o > obs)) {
        obs = o;
        nulls = nu;
        pL = pg;
        nCells = cells.length;
      }
    }
    const tested = new Set(cellsL.map((c) => c.g)).size;
    const top = Math.max(1, Math.round(pres.length * 0.1));
    let topSum = 0;
    for (let i = 0; i < top; i++) topSum += pres[i];
    let g = 0;
    const n = pres.length;
    const asc = pres.slice().reverse();
    for (let i = 0; i < n; i++) g += (2 * (i + 1) - n - 1) * asc[i];
    const gini = totalPres > 0 ? g / (n * totalPres) : NaN;
    // Persistence: overlap of each match's busiest tenth of its ground with the other matches'.
    let persistence: number | null = null;
    let persistenceNull: number | null = null;
    const mats = [...perMatch.values()].filter((m) => m.size >= 20).slice(0, 40);
    if (mats.length >= 2) {
      const all = [...presence.keys()];
      const tops = mats.map((m) => new Set([...m].sort((a, b) => b[1] - a[1]).slice(0, Math.max(1, Math.round(m.size * 0.1))).map((e) => e[0])));
      const rand = tops.map((s) => {
        const o = new Set<number>();
        while (o.size < s.size && o.size < all.length) o.add(all[Math.floor(r() * all.length)]);
        return o;
      });
      const jac = (a: Set<number>, b: Set<number>) => {
        let i = 0;
        for (const v of a) if (b.has(v)) i++;
        return i / (a.size + b.size - i);
      };
      let s = 0;
      let s0 = 0;
      let k = 0;
      for (let i = 0; i < tops.length; i++)
        for (let j = i + 1; j < tops.length; j++) {
          s += jac(tops[i], tops[j]);
          s0 += jac(rand[i], rand[j]);
          k++;
        }
      persistence = round(s / k);
      persistenceNull = round(s0 / k);
    }
    lanes = {
      p: nulls.length ? Math.min(1, pL * tested) : 1,
      q: 1,
      cells: nCells,
      segregation: round(obs),
      segregationNull: round(nulls.length ? nulls.reduce((a, b) => a + b, 0) / nulls.length : NaN),
      trailTop10: round(totalPres > 0 ? topSum / totalPres : NaN),
      gini: round(gini),
      persistence,
      persistenceNull,
    };
  }
  const busyN = Math.max(1, Math.round(pres.length * 0.1));
  const thr = pres.length ? pres[busyN - 1] : Infinity;
  const busy = new Set<number>();
  for (const [c, v] of presence) if (v >= thr) busy.add(c);
  (busy as Set<number> & { cellOf?: (x: number, z: number) => number }).cellOf = cellOf;
  return { herding, lanes, busy };
}

// ------------------------------------------------------------------ crowding

export function crowding(w: World, r: Rng, busy: Set<number> | null): CrowdingMetric | undefined {
  if (!(w.s0 === w.s0)) return undefined;
  const R = 2 * w.s0;
  const R2 = R * R;
  const cellOf = (busy as (Set<number> & { cellOf?: (x: number, z: number) => number }) | null)?.cellOf;
  const xs: number[] = [];
  const zs: number[] = [];
  const tm: number[] = [];
  const ids: number[] = [];
  for (const M of w.matches) {
    const L = M.B1 - M.B0 + 1;
    for (let i = 0; i < L; i++) {
      xs.length = zs.length = tm.length = ids.length = 0;
      members(w, M, i, (ti, o) => {
        const t = w.tracks[ti];
        xs.push(t.x[o]);
        zs.push(t.z[o]);
        tm.push(t.team);
        ids.push(ti * 1048576 + o);
      });
      const n = xs.length;
      if (n < 2) continue;
      const idx = Array.from({ length: n }, (_, j) => j).sort((a, b) => xs[a] - xs[b]);
      for (let p = 0; p < n; p++) {
        const a = idx[p];
        let all = 0;
        let mates = 0;
        for (let q = p - 1; q >= 0 && xs[a] - xs[idx[q]] <= R; q--) {
          const b = idx[q];
          if ((xs[a] - xs[b]) ** 2 + (zs[a] - zs[b]) ** 2 <= R2) {
            all++;
            if (tm[b] === tm[a]) mates++;
          }
        }
        for (let q = p + 1; q < n && xs[idx[q]] - xs[a] <= R; q++) {
          const b = idx[q];
          if ((xs[a] - xs[b]) ** 2 + (zs[a] - zs[b]) ** 2 <= R2) {
            all++;
            if (tm[b] === tm[a]) mates++;
          }
        }
        const t = w.tracks[Math.floor(ids[a] / 1048576)];
        const o = ids[a] % 1048576;
        t.dens[o] = Math.min(255, all);
        t.mates[o] = Math.min(255, mates);
      }
    }
  }
  const sp = new Float64Array(6);
  const spN = new Float64Array(6);
  const sD: number[] = [];
  const sV: number[] = [];
  const cD: number[] = [];
  const cV: number[] = [];
  let seen = 0;
  let seenC = 0;
  let crowdedX = 0;
  let sparseX = 0;
  let crowdedD = 0;
  let sparseD = 0;
  const effX = new Float64Array(3);
  const effF = new Float64Array(3);
  const eM: number[] = [];
  const eF: number[] = [];
  let fires = 0;
  const reservoir = (A: number[], B: number[], a: number, b: number, count: number) => {
    if (A.length < 40000) {
      A.push(a);
      B.push(b);
    } else {
      const k = Math.floor(r() * count);
      if (k < A.length) {
        A[k] = a;
        B[k] = b;
      }
    }
  };
  for (const t of w.tracks) {
    const fc = new Uint16Array(t.n);
    for (const f of t.fires) {
      const o = stateAt(t, f, 2);
      if (o >= 0) fc[o]++;
    }
    fires += t.fires.length;
    for (let o = 0; o < t.n; o++) {
      if (!(t.x[o] === t.x[o])) continue;
      const d = t.dens[o];
      const ec = t.mates[o] === 0 ? 0 : t.mates[o] <= 2 ? 1 : 2;
      effX[ec] += BIN;
      effF[ec] += fc[o];
      reservoir(eM, eF, t.mates[o], fc[o], ++seen);
      if (d >= 3) crowdedX += BIN;
      else if (d <= 1) sparseX += BIN;
      const s = Math.hypot(t.vx[o], t.vz[o]);
      if (!(s >= w.vmin) || !(t.pace > 0)) continue;
      const rel = Math.min(5, s / t.pace);
      const k = Math.min(5, d);
      sp[k] += rel;
      spN[k]++;
      reservoir(sD, sV, d, rel, spN.reduce((a, b) => a + b, 0));
      if (busy && cellOf && busy.has(cellOf(t.x[o], t.z[o]))) reservoir(cD, cV, d, rel, ++seenC);
    }
    for (const td of t.deaths) {
      const o = stateAt(t, td);
      if (o < 0) continue;
      if (t.dens[o] >= 3) crowdedD++;
      else if (t.dens[o] <= 1) sparseD++;
    }
  }
  const total = spN.reduce((a, b) => a + b, 0);
  if (total < 200) return undefined;
  const speed = Array.from(sp, (v, i) => round(spN[i] >= 20 ? v / spN[i] : NaN));
  const flow = speed.map((v, i) => round(v === v ? (i + 1) * v : NaN));
  const fl = flow.filter((v) => v === v);
  const peak = Math.max(...fl);
  const last = [...flow].reverse().find((v) => v === v) ?? NaN;
  const rho = spearman(sD, sV);
  const rc = cD.length >= 200 ? spearman(cD, cV) : null;
  // Points of one unit follow each other: the test is over units, each with its own rho.
  const tr: number[] = [];
  const tw: number[] = [];
  for (const t of w.tracks) {
    const a: number[] = [];
    const b: number[] = [];
    for (let o = 0; o < t.n; o++) {
      const s = Math.hypot(t.vx[o], t.vz[o]);
      if (!(s >= w.vmin) || !(t.pace > 0)) continue;
      a.push(t.dens[o]);
      b.push(s / t.pace);
    }
    if (a.length < 20 || Math.min(...a) === Math.max(...a)) continue;
    const q = spearman(a, b).rho;
    if (q === q) {
      tr.push(q);
      tw.push(Math.sqrt(a.length));
    }
  }
  // A minimum effect of interest: |rho| above 0.05.
  const ct = tr.length >= 3 ? pairedTest(tr, tw, r, 1000, 0.05) : { p: 1 };
  const dr = rateRatio(crowdedD, crowdedX, sparseD, sparseX);
  const er = fires >= 30 ? rateRatio(effF[2], effX[2], effF[0], effX[0]) : null;
  const es = fires >= 30 ? spearman(eM, eF) : null;
  return {
    p: ct.p,
    q: 1,
    samples: total,
    radius: round(R / w.upm, 2),
    speed,
    flow,
    rho: round(rho.rho),
    rhoChoke: rc ? round(rc.rho) : null,
    drop: round(peak > 0 ? 1 - last / peak : NaN),
    deathRR: dr ? round(dr.rr) : null,
    deathLo: dr ? round(dr.lo) : null,
    deathHi: dr ? round(dr.hi) : null,
    deathP: dr ? round(dr.p, 5) : null,
    effort: fires >= 30 ? Array.from(effF, (f, i) => round(effX[i] > 0 ? (f / effX[i]) * 60 : NaN)) : null,
    effortRho: es ? round(es.rho) : null,
    effortP: er ? round(er.p, 5) : null,
  };
}

// ------------------------------------------------------------------ leaders

const LAG = 4;

export function leaders(w: World, r: Rng): LeadersMetric | undefined {
  if (!(w.s0 === w.s0)) return undefined;
  const near2 = (3 * w.s0) ** 2;
  type Pair = { a: number; b: number; best: number; tau: number; c0: number; cNeg: number; m: number; team: number };
  const pairs: Pair[] = [];
  const nullMax: number[] = [];
  const heads = new Map<number, Float32Array>();
  const headOf = (ti: number) => {
    let h = heads.get(ti);
    if (h) return h;
    const t = w.tracks[ti];
    h = new Float32Array(t.n * 2).fill(NaN);
    for (let o = 0; o < t.n; o++) {
      const u = unitHeading(t, o, w.vmin);
      if (u) {
        h[2 * o] = u[0];
        h[2 * o + 1] = u[1];
      }
    }
    heads.set(ti, h);
    return h;
  };
  const corr = (A: Track, ha: Float32Array, B: Track, hb: Float32Array, lo: number, hi: number, tau: number, shift: number) => {
    let s = 0;
    let n = 0;
    for (let b = lo; b <= hi; b++) {
      const oa = b - A.b0;
      let ob = b + tau - B.b0;
      if (ob < 0 || ob >= B.n) continue;
      if (shift) ob = (ob + shift) % B.n;
      const ax = ha[2 * oa];
      const bx = hb[2 * ob];
      if (!(ax === ax && bx === bx)) continue;
      s += ax * bx + ha[2 * oa + 1] * hb[2 * ob + 1];
      n++;
    }
    return n >= 15 ? s / n : NaN;
  };
  for (const M of w.matches) {
    const byTeam = new Map<number, number[]>();
    for (const ti of M.tracks) {
      const t = w.tracks[ti];
      let moving = 0;
      for (let o = 0; o < t.n; o++) if (Math.hypot(t.vx[o], t.vz[o]) >= w.vmin) moving++;
      if (moving < 20) continue;
      let l = byTeam.get(t.team);
      if (!l) byTeam.set(t.team, (l = []));
      l.push(ti);
    }
    for (const [team, l0] of byTeam) {
      const l = l0.slice(0, 40);
      for (let i = 0; i < l.length && pairs.length < 20000; i++)
        for (let j = i + 1; j < l.length; j++) {
          const A = w.tracks[l[i]];
          const B = w.tracks[l[j]];
          const lo = Math.max(A.b0, B.b0);
          const hi = Math.min(A.b0 + A.n, B.b0 + B.n) - 1;
          if (hi - lo < 20) continue;
          const ha = headOf(l[i]);
          const hb = headOf(l[j]);
          let both = 0;
          let near = 0;
          for (let b = lo; b <= hi; b++) {
            const oa = b - A.b0;
            const ob = b - B.b0;
            if (!(ha[2 * oa] === ha[2 * oa] && hb[2 * ob] === hb[2 * ob])) continue;
            both++;
            if ((A.x[oa] - B.x[ob]) ** 2 + (A.z[oa] - B.z[ob]) ** 2 <= near2) near++;
          }
          if (both < 20 || near < 0.5 * both) continue;
          const c = new Float64Array(2 * LAG + 1);
          for (let tau = -LAG; tau <= LAG; tau++) c[tau + LAG] = corr(A, ha, B, hb, lo - LAG, hi + LAG, tau, 0);
          let best = -Infinity;
          let bt = 0;
          for (let tau = -LAG; tau <= LAG; tau++) if (c[tau + LAG] > best) {
            best = c[tau + LAG];
            bt = tau;
          }
          if (!(best > -Infinity)) continue;
          pairs.push({ a: l[i], b: l[j], best, tau: bt, c0: c[LAG], cNeg: c[LAG - bt], m: M.m, team });
          if (B.n >= 45) {
            const shift = 15 + Math.floor(r() * (B.n - 30));
            let nb = -Infinity;
            for (let tau = -LAG; tau <= LAG; tau++) {
              const v = corr(A, ha, B, hb, lo - LAG, hi + LAG, tau, shift);
              if (v > nb) nb = v;
            }
            if (nb > -Infinity) nullMax.push(nb);
          }
        }
    }
  }
  if (pairs.length < 10) return undefined;
  const threshold = nullMax.length >= 20 ? quantile(nullMax, 0.95) : 0.9;
  const led = pairs.filter((p) => p.best > threshold && p.tau !== 0 && p.best > p.c0 + 0.02 && p.best > (p.cNeg === p.cNeg ? p.cNeg : -1) + 0.02);
  // Edges leader -> follower: τ > 0 means b turns as a did τ bins before.
  const out = new Map<number, number>();
  const into = new Map<number, number>();
  const edges = new Map<string, Map<number, Set<number>>>();
  for (const p of led) {
    const [L, F] = p.tau > 0 ? [p.a, p.b] : [p.b, p.a];
    out.set(L, (out.get(L) ?? 0) + 1);
    into.set(F, (into.get(F) ?? 0) + 1);
    const key = `${p.m}:${p.team}`;
    let g = edges.get(key);
    if (!g) edges.set(key, (g = new Map()));
    let s = g.get(L);
    if (!s) g.set(L, (s = new Set()));
    s.add(F);
  }
  let triads = 0;
  let trans = 0;
  for (const g of edges.values()) {
    const nodes = [...new Set([...g.keys(), ...[...g.values()].flatMap((s) => [...s])])].slice(0, 40);
    const has = (a: number, b: number) => g.get(a)?.has(b) ?? false;
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        if (!(has(a, b) || has(b, a))) continue;
        for (let k = j + 1; k < nodes.length; k++) {
          const c = nodes[k];
          if (!((has(a, c) || has(c, a)) && (has(b, c) || has(c, b)))) continue;
          triads++;
          const cyc = (has(a, b) && has(b, c) && has(c, a)) || (has(b, a) && has(c, b) && has(a, c));
          if (!cyc) trans++;
        }
      }
  }
  // Leaders' and followers' fates.
  let lx = 0;
  let fx = 0;
  let ld = 0;
  let fd = 0;
  let lk = 0;
  let fk = 0;
  const touched = new Set([...out.keys(), ...into.keys()]);
  for (const ti of touched) {
    const net = (out.get(ti) ?? 0) - (into.get(ti) ?? 0);
    if (!net) continue;
    const t = w.tracks[ti];
    let x = 0;
    for (let o = 0; o < t.n; o++) if (t.x[o] === t.x[o]) x += BIN;
    if (net > 0) {
      lx += x;
      ld += t.deaths.length;
      lk += t.kills.length;
    } else {
      fx += x;
      fd += t.deaths.length;
      fk += t.kills.length;
    }
  }
  const dRR = rateRatio(ld, lx, fd, fx);
  const kRR = rateRatio(lk, lx, fk, fx);
  return {
    p: binomUpper(led.length, pairs.length, 0.05),
    q: 1,
    pairs: pairs.length,
    led: led.length,
    threshold: round(threshold),
    lagSecs: round(median(led.map((p) => Math.abs(p.tau) * BIN)), 1),
    triads,
    transitive: triads >= 5 ? round(trans / triads) : null,
    deathRR: dRR ? round(dRR.rr) : null,
    killRR: kRR ? round(kRR.rr) : null,
    outcomeP: dRR ? round(dRR.p, 5) : null,
  };
}

// ------------------------------------------------------------------ breaking point

const EDGES = [0, 0.01, 0.15, 0.3, 0.5];

export function breaking(w: World, r: Rng): BreakingMetric | undefined {
  const W = 5;
  const fs: number[] = [];
  const as: number[] = [];
  const ds: number[] = [];
  const keys: string[] = [];
  for (const M of w.matches) {
    const L = M.B1 - M.B0 + 1;
    const nw = Math.floor(L / W);
    if (nw < 3) continue;
    // Last position of each unit in each window.
    const pos = new Map<number, Float64Array>();
    for (const ti of M.tracks) {
      const t = w.tracks[ti];
      const a = new Float64Array(nw * 2).fill(NaN);
      for (let o = 0; o < t.n; o++) {
        if (!(t.x[o] === t.x[o])) continue;
        const wi = Math.floor((t.b0 + o - M.B0) / W);
        if (wi >= nw) continue;
        a[2 * wi] = t.x[o];
        a[2 * wi + 1] = t.z[o];
      }
      pos.set(ti, a);
    }
    const teams = new Map<number, number[]>();
    for (const ti of M.tracks) {
      const tm = w.tracks[ti].team;
      if (tm < 0) continue;
      let l = teams.get(tm);
      if (!l) teams.set(tm, (l = []));
      l.push(ti);
    }
    if (teams.size < 2) continue;
    const alive = new Map<number, Int32Array>();
    const cen = new Map<number, Float64Array>();
    for (const [tm, l] of teams) {
      const al = new Int32Array(nw);
      const c = new Float64Array(nw * 3);
      for (const ti of l) {
        const p = pos.get(ti)!;
        for (let wi = 0; wi < nw; wi++)
          if (p[2 * wi] === p[2 * wi]) {
            al[wi]++;
            c[3 * wi] += p[2 * wi];
            c[3 * wi + 1] += p[2 * wi + 1];
            c[3 * wi + 2]++;
          }
      }
      alive.set(tm, al);
      cen.set(tm, c);
    }
    for (const [tm, l] of teams) {
      if (l.length < 2) continue;
      const pace = median(l.map((ti) => w.tracks[ti].pace));
      if (!(pace > 0)) continue;
      const al = alive.get(tm)!;
      const c = cen.get(tm)!;
      const deaths = M.deathT.filter((d) => d.team === tm).map((d) => d.t);
      for (let wi = 1; wi < nw; wi++) {
        if (c[3 * (wi - 1) + 2] < 2) continue;
        // The enemy: every other side's units in the window before.
        let ex = 0;
        let ez = 0;
        let en = 0;
        for (const [o, cc] of cen) {
          if (o === tm) continue;
          ex += cc[3 * (wi - 1)];
          ez += cc[3 * (wi - 1) + 1];
          en += cc[3 * (wi - 1) + 2];
        }
        if (!en) continue;
        const tx = c[3 * (wi - 1)] / c[3 * (wi - 1) + 2];
        const tz = c[3 * (wi - 1) + 1] / c[3 * (wi - 1) + 2];
        const dx = ex / en - tx;
        const dz = ez / en - tz;
        const d = Math.hypot(dx, dz);
        if (!(d > 0)) continue;
        let s = 0;
        let n = 0;
        for (const ti of l) {
          const p = pos.get(ti)!;
          if (!(p[2 * wi] === p[2 * wi] && p[2 * wi - 2] === p[2 * wi - 2])) continue;
          s += ((p[2 * wi] - p[2 * wi - 2]) * dx + (p[2 * wi + 1] - p[2 * wi - 1]) * dz) / d;
          n++;
        }
        if (n < 2) continue;
        const a = Math.max(-5, Math.min(5, s / n / (W * BIN) / Math.max(pace, w.upm)));
        const tEnd = (M.B0 + (wi + 1) * W) * BIN;
        let lost = 0;
        for (const td of deaths) if (td > tEnd - 60 && td <= tEnd) lost++;
        let strength = 0;
        for (let k = Math.max(0, wi - 6); k <= wi; k++) strength = Math.max(strength, al[k]);
        const f = Math.min(1, lost / Math.max(1, strength));
        fs.push(f);
        as.push(a);
        ds.push(d);
        keys.push(`${M.m}:${tm}:${Math.floor(wi / 6)}`);
      }
    }
  }
  if (fs.length < 30) return undefined;
  const clusters = new Map<string, { s: Float64Array; n: Float64Array }>();
  for (let i = 0; i < as.length; i++) {
    let bin = 0;
    for (let e = 1; e < EDGES.length; e++) if (fs[i] >= EDGES[e]) bin = e;
    let cl = clusters.get(keys[i]);
    if (!cl) clusters.set(keys[i], (cl = { s: new Float64Array(EDGES.length), n: new Float64Array(EDGES.length) }));
    cl.s[bin] += as[i];
    cl.n[bin]++;
  }
  const cl = [...clusters.values()];
  const approach: (number | null)[] = [];
  const lo: (number | null)[] = [];
  const hi: (number | null)[] = [];
  const n: number[] = [];
  for (let b = 0; b < EDGES.length; b++) {
    const num = cl.map((c) => c.s[b]);
    const den = cl.map((c) => c.n[b]);
    const N = den.reduce((x, y) => x + y, 0);
    n.push(N);
    if (N < 5) {
      approach.push(null);
      lo.push(null);
      hi.push(null);
      continue;
    }
    const [l, h] = bootRatio(num, den, r, 300);
    approach.push(round(num.reduce((x, y) => x + y, 0) / N));
    lo.push(round(l));
    hi.push(round(h));
  }
  let breakAt: number | null = null;
  const sp = spearman(fs, as);
  // The test: do sides withdraw at some level of loss of 15% or more - faster than a tenth of their pace
  // (a minimum effect: losses come where sides meet, and sides that meet stop closing)? One-sided per level,
  // cluster bootstrap, Bonferroni over the levels tried; the breaking point is the lowest level that passes.
  const WITHDRAW = 0.1;
  let p = 1;
  let tried = 0;
  let best = 1;
  const pb: [number, number][] = [];
  for (let bin = 2; bin < EDGES.length; bin++) {
    const num = cl.map((c) => c.s[bin]);
    const den = cl.map((c) => c.n[bin]);
    if (den.reduce((x, y) => x + y, 0) < 10) continue;
    tried++;
    let ge = 0;
    const B = 1000;
    for (let k = 0; k < B; k++) {
      let a = 0;
      let b = 0;
      for (let i = 0; i < cl.length; i++) {
        const j = Math.floor(r() * cl.length);
        a += num[j];
        b += den[j];
      }
      if (!(b > 0) || a / b >= -WITHDRAW) ge++;
    }
    best = Math.min(best, (1 + ge) / (1 + B));
    pb.push([bin, (1 + ge) / (1 + B)]);
  }
  if (tried) p = Math.min(1, best * tried);
  for (const [bin, pv] of pb)
    if (pv * tried < 0.05) {
      breakAt = EDGES[bin];
      break;
    }
  return { p, q: 1, windows: fs.length, edges: EDGES, approach, lo, hi, n, breakAt, rho: round(sp.rho) };
}
