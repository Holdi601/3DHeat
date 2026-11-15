/**
 * Naval maneuvers: the line of battle (three or more ships in column, the
 * shape held on 60% of their moving steps for a minute or more) and crossing
 * the T (a column of a side across the head of an enemy column: its axis
 * within 60° of square to the enemy's course, ahead of the enemy's leading
 * ship and within a column's length of its track, inside 1.5 ranges, for
 * 30 s or more). The screen is the ground's (`land.ts`), which also runs at
 * sea.
 */

import { SEA, SCALE } from './frame';
import { at, emit, outlineOf, pathOf, r0, r2, type Ctx } from './context';
import { principal } from './groups';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function lineOfBattle(ctx: Ctx): void {
  const f = ctx.f;
  const mv = SCALE[SEA].move * f.upm;
  for (const g of ctx.G.list) {
    if (g.dom !== SEA || g.maxSize < 3) continue;
    let moving = 0;
    let col = 0;
    let s0 = Infinity;
    let s1 = -1;
    let n = 0;
    for (const st of g.steps) {
      if (st.members.length < 3 || Math.hypot(st.vx, st.vz) < mv) continue;
      moving++;
      if (st.shape === 'column') {
        col++;
        s0 = Math.min(s0, st.s);
        s1 = Math.max(s1, st.s);
        n = Math.max(n, st.members.length);
      }
    }
    if (!moving || col / moving < 0.6 || col * f.step < 60) continue;
    const mid = at(g, s1)!;
    emit(ctx, {
      kind: 'lineOfBattle',
      team: g.team,
      against: -1,
      dom: SEA,
      s0,
      s1,
      confidence: 0.5 + 0.3 * clamp01((col / moving - 0.6) / 0.3) + 0.2 * clamp01((n - 3) / 3),
      units: [...g.units],
      place: { x: mid.cx, y: mid.cy, z: mid.cz, radius: Math.max(mid.spread * 2, 1000 * f.upm) },
      paths: [pathOf(g, s0, s1)],
      outlines: [outlineOf(f, mid.members, s1, 300 * f.upm)],
      evidence: { ships: n, share: r2(col / moving), secs: r0(col * f.step) },
      tail: 0,
    });
  }
}

export function crossingT(ctx: Ctx): void {
  const f = ctx.f;
  const R = ctx.R[SEA];
  const mv = SCALE[SEA].move * f.upm;
  const sea = ctx.G.list.filter((g) => g.dom === SEA && g.maxSize >= 2);
  const need = Math.max(2, Math.round(30 / f.step));
  for (const A of sea)
    for (const B of sea) {
      if (A.team === B.team) continue;
      let run: number[] = [];
      let done = false;
      const flush = () => {
        if (run.length >= need && !done) {
          done = true;
          const s0 = run[0];
          const s1 = run[run.length - 1];
          const a = at(A, s1)!;
          const b = at(B, s1)!;
          emit(ctx, {
            kind: 'crossingT',
            team: A.team,
            against: B.team,
            dom: SEA,
            s0,
            s1,
            confidence: 0.55 + 0.25 * clamp01((run.length - need) / (2 * need)) + 0.2 * clamp01((a.members.length - 2) / 2),
            units: [...a.members],
            place: { x: (a.cx + b.cx) / 2, y: a.cy, z: (a.cz + b.cz) / 2, radius: Math.hypot(a.cx - b.cx, a.cz - b.cz) / 2 + a.spread },
            paths: [pathOf(A, s0, s1), pathOf(B, s0, s1)],
            outlines: [outlineOf(f, a.members, s1, 200 * f.upm), outlineOf(f, b.members, s1, 200 * f.upm)],
            evidence: { ships: a.members.length, enemyShips: b.members.length, secs: r0((s1 - s0) * f.step) },
            tail: 120,
          });
        }
        run = [];
      };
      for (const sa of A.steps) {
        const sb = at(B, sa.s);
        if (!sb || sa.members.length < 2 || sb.members.length < 2) {
          flush();
          continue;
        }
        const vb = Math.hypot(sb.vx, sb.vz);
        if (vb < mv) {
          flush();
          continue;
        }
        const hb: [number, number] = [sb.vx / vb, sb.vz / vb];
        const xs = Array.from(sa.members, (u) => f.X[sa.s * f.N + u]);
        const zs = Array.from(sa.members, (u) => f.Z[sa.s * f.N + u]);
        const ax = principal(xs, zs);
        const square = Math.abs(ax[0] * hb[0] + ax[1] * hb[1]) <= 0.5;
        // B's leading ship: furthest along its course.
        let lead = -Infinity;
        for (const u of sb.members) lead = Math.max(lead, (f.X[sa.s * f.N + u] - sb.cx) * hb[0] + (f.Z[sa.s * f.N + u] - sb.cz) * hb[1]);
        const dx = sa.cx - sb.cx;
        const dz = sa.cz - sb.cz;
        const ahead = dx * hb[0] + dz * hb[1] - lead;
        const across = Math.abs(-dx * hb[1] + dz * hb[0]);
        let len = 0;
        for (let i = 0; i < xs.length; i++) len = Math.max(len, Math.hypot(xs[i] - sa.cx, zs[i] - sa.cz));
        const ok = square && ahead > 0 && across <= Math.max(len, 0.5 * R) && Math.hypot(dx, dz) <= 1.5 * R;
        if (ok) run.push(sa.s);
        else flush();
      }
      flush();
    }
}
