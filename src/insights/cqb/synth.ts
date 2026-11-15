/**
 * Synthetic elimination rounds for the close-quarters tests: two sides of
 * five, duels staged in the seconds before each death with the geometry the
 * walk reads (a peeker moving in, a holder still, perhaps a second holder
 * crossing its line, perhaps a flash), and effects planted on demand - the
 * peeker's advantage, crossfires, flashes, a fatal funnel at one place and
 * better aim winning. With every effect off, the same rounds are the null.
 */

import { rng } from './model';
import { K_DEATH, K_FLASH, K_KILL, K_PLANT, K_POS, type CqbRows } from './walk';

export interface SynthEffects {
  /** Peeker's chance against a lone, dry holder. */
  peek: number;
  /** Added to the holder's chance with a crossfire partner. */
  cross: number;
  /** Added to the peeker's chance behind its own flash. */
  flash: number;
  /** Peeker's death chance entering the funnel place (3); NaN: no funnel. */
  funnel: number;
  /** Whether the winner of a duel was the better-aimed one. */
  aim: boolean;
}

export const NULL_EFFECTS: SynthEffects = { peek: 0.5, cross: 0, flash: 0, funnel: NaN, aim: false };

const HZ = 8;

/** `rounds` rounds as one row slice, time-ordered, rounds as sessions; team 0 and 1, persons 0-4 and 5-9. */
export function synthRounds(rounds: number, fx: SynthEffects, seed = 1): CqbRows {
  const R = rng(seed);
  const rows: { t: number; x: number; z: number; yaw: number; p: number; team: number; s: number; k: number; o: number; pl: number; won: number }[] = [];
  let clock = 0;
  for (let s = 0; s < rounds; s++) {
    const start = clock;
    const alive = new Array(10).fill(true);
    const home = Array.from({ length: 10 }, (_, p) => ({ x: (p % 5) * 60 + (p < 5 ? 0 : 1000), z: p < 5 ? 0 : 400 }));
    const pos = home.map((h) => ({ ...h, yaw: 0 }));
    const out: typeof rows = [];
    const emit = (t: number, p: number, k: number, o = -1, at?: { x: number; z: number; yaw?: number }) => {
      const q = at ?? pos[p];
      out.push({ t, x: q.x, z: q.z, yaw: q.yaw ?? pos[p].yaw, p, team: p < 5 ? 0 : 1, s, k, o, pl: (q as { pl?: number }).pl ?? placeOf[p], won: NaN });
    };
    const placeOf = new Array(10).fill(0);
    let t = start + 1;
    // A second of everyone at home.
    for (let f = 0; f < HZ; f++) for (let p = 0; p < 10; p++) emit(t + f / HZ, p, K_POS);
    t += 1;
    let duels = 0;
    let planted = false;
    while (duels < 7) {
      const a0 = alive.slice(0, 5).filter(Boolean).length;
      const a1 = alive.slice(5).filter(Boolean).length;
      if (!a0 || !a1) break;
      const peekTeam = R() < 0.5 ? 0 : 1;
      const pick = (team: number) => {
        const c = [0, 1, 2, 3, 4].map((i) => i + team * 5).filter((p) => alive[p]);
        return c[Math.floor(R() * c.length)];
      };
      const P = pick(peekTeam);
      const H = pick(1 - peekTeam);
      const mates = [0, 1, 2, 3, 4].map((i) => i + (1 - peekTeam) * 5).filter((p) => alive[p] && p !== H);
      const C = mates.length && R() < 0.4 ? mates[0] : -1;
      const flash = R() < 0.35;
      const place = 1 + Math.floor(R() * 6);
      // Stage: a site at a fresh spot; holder still at its centre, peeker coming in from 3 m beyond the 10 m mark.
      const cx = 200 + (duels % 3) * 120;
      const cz = 200;
      const ang = R() * Math.PI * 2;
      const hx = cx;
      const hz = cz;
      const end = { x: cx + Math.sin(ang) * 10, z: cz - Math.cos(ang) * 10 };
      const beg = { x: cx + Math.sin(ang) * 13, z: cz - Math.cos(ang) * 13 };
      const cAng = ang + (70 * Math.PI) / 180;
      const cpos = { x: end.x - Math.sin(cAng) * 12, z: end.z + Math.cos(cAng) * 12 };
      // Who wins.
      let pPeek = fx.peek;
      if (C >= 0) pPeek -= fx.cross;
      if (flash) pPeek += fx.flash;
      if (place === 3 && Number.isFinite(fx.funnel)) pPeek = 1 - fx.funnel;
      const peekerWins = R() < pPeek;
      const W = peekerWins ? P : H;
      const L = peekerWins ? H : P;
      const t0 = t;
      const T = t0 + 2;
      const bearing = (from: { x: number; z: number }, to: { x: number; z: number }) => Math.atan2(to.x - from.x, -(to.z - from.z));
      for (let f = 0; f <= 2 * HZ; f++) {
        const tt = t0 + f / HZ;
        const u = Math.max(0, Math.min(1, (tt - (T - 1)) / 1));
        const pp = { x: beg.x + (end.x - beg.x) * u, z: beg.z + (end.z - beg.z) * u };
        for (let p = 0; p < 10; p++) {
          if (!alive[p]) continue;
          if (p === P) {
            const yaw = bearing(pp, { x: hx, z: hz }) + (fx.aim ? (W === P ? 0.05 : 0.6) : (R() - 0.5) * 0.8) * (R() < 0.5 ? 1 : -1);
            // Into the stage's place as the stage begins: every entry is a peek, wherever it is.
            placeOf[p] = place;
            emit(tt, p, K_POS, -1, { ...pp, yaw });
            pos[p] = { ...pp, yaw };
          } else if (p === H) {
            const yaw = bearing({ x: hx, z: hz }, pp) + (fx.aim ? (W === H ? 0.05 : 0.6) : (R() - 0.5) * 0.8) * (R() < 0.5 ? 1 : -1);
            emit(tt, p, K_POS, -1, { x: hx, z: hz, yaw });
            pos[p] = { x: hx, z: hz, yaw };
          } else if (p === C) {
            emit(tt, p, K_POS, -1, { ...cpos, yaw: bearing(cpos, end) });
            pos[p] = { ...cpos, yaw: bearing(cpos, end) };
          } else {
            // Off-stage players far away, still.
            const h = home[p];
            emit(tt, p, K_POS, -1, { x: h.x + 2000, z: h.z + 2000, yaw: 0 });
            pos[p] = { x: h.x + 2000, z: h.z + 2000, yaw: 0 };
          }
        }
        if (flash && Math.abs(tt - (T - 1)) < 1e-6) out.push({ t: tt, x: end.x, z: end.z, yaw: NaN, p: P, team: peekTeam, s, k: K_FLASH, o: -1, pl: 0, won: NaN });
      }
      emit(T, L, K_DEATH, W);
      emit(T, W, K_KILL, L);
      alive[L] = false;
      duels++;
      t = T + 1.5;
      if (!planted && duels === 2 && alive.slice(0, 5).some(Boolean) && R() < 0.5) {
        planted = true;
        emit(t, alive.findIndex((v, i) => v && i < 5), K_PLANT);
        t += 1;
      }
    }
    const a0 = alive.slice(0, 5).filter(Boolean).length;
    const a1 = alive.slice(5).filter(Boolean).length;
    const win0 = a0 > a1 || (a0 === a1 && R() < 0.5);
    for (let p = 0; p < 10; p++) emit(t, p, 10);
    for (const r of out) if (r.k === 10) r.won = (r.team === 0) === win0 ? 1 : 0;
    rows.push(...out);
    clock = t + 5;
  }
  rows.sort((a, b) => a.t - b.t);
  const n = rows.length;
  return {
    n,
    t: Float64Array.from(rows, (r) => r.t),
    x: Float32Array.from(rows, (r) => r.x),
    y: new Float32Array(n),
    z: Float32Array.from(rows, (r) => r.z),
    yaw: Float32Array.from(rows, (r) => r.yaw),
    person: Int32Array.from(rows, (r) => r.p),
    team: Int32Array.from(rows, (r) => r.team),
    session: Int32Array.from(rows, (r) => r.s),
    kind: Int8Array.from(rows, (r) => r.k),
    other: Int32Array.from(rows, (r) => r.o),
    place: Int32Array.from(rows, (r) => r.pl),
    weapon: new Int32Array(n).fill(-1),
    won: Float32Array.from(rows, (r) => r.won),
    flashed: null,
    buy: null,
  };
}
