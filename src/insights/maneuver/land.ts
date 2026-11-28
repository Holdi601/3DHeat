/**
 * The maneuvers of groups on the ground (and, where the geometry is the
 * same, at sea): how a group comes at the enemy - into its face, round a
 * flank, from both flanks at once, through its line - whether it surrounds
 * one, how it moves under fire, gathers and spreads, deceives, gives way and
 * follows, defends, waits in ambush, scouts, shifts between fights, and how
 * quickly it answers contact.
 *
 * Everything is judged at the match's own scale: `R`, the engagement range
 * measured from its kills, and `secs`, the time a step of a maneuver takes in
 * the domain (infantry a third of the ground's, aircraft three quarters).
 * Each detector says in its comment what it requires; the confidence grows
 * with the margins over those requirements.
 */

import { AIR, INF, SEA, SCALE, surface, timeOf } from './frame';
import { at, centroid, countIn, dataT, emit, foughtBetween, move, outcomeOf, outlineOf, pathOf, r0, r2, secs, speedOf, unitPath, unitsNear, r1, type Contact, type Ctx, workedOf } from './context';
import type { Group } from './groups';
import { findGroups, stepAt } from './groups';

const DEG = 180 / Math.PI;
const norm = (x: number, z: number): [number, number] => {
  const h = Math.hypot(x, z);
  return h > 0 ? [x / h, z / h] : [0, 0];
};
const angle = (a: [number, number], b: [number, number]) => Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1]))) * DEG;
const stepsOf = (ctx: Ctx, dom: number, groundSecs: number) => Math.max(1, Math.round(secs(dom, groundSecs) / ctx.f.step));
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** The first step of a group at or after `s`. */
function firstFrom(g: Group, s: number): number {
  for (const st of g.steps) if (st.s >= s) return st.s;
  return g.steps[g.steps.length - 1].s;
}

/** A group's mean centroid over steps `[s0, s1]`. */
function meanPos(g: Group, s0: number, s1: number): [number, number] | null {
  let x = 0;
  let z = 0;
  let n = 0;
  for (const st of g.steps) {
    if (st.s < s0 || st.s > s1) continue;
    x += st.cx;
    z += st.cz;
    n++;
  }
  return n ? [x / n, z / n] : null;
}

function pathLength(p: [number, number, number][]): number {
  let l = 0;
  for (let i = 1; i < p.length; i++) l += Math.hypot(p[i][0] - p[i - 1][0], p[i][2] - p[i - 1][2]);
  return l;
}

export interface Attack {
  c: Contact;
  g: Group;
  dom: number;
  s0: number;
  s: number;
  enemy: number[];
  ec: [number, number, number];
  /** Direction the attack comes from (enemy to attacker), the enemy's facing, the angle between and the side. */
  a: [number, number];
  n: [number, number];
  theta: number;
  side: number;
  fixing: number;
  closed: number;
  straight: number;
}

/**
 * Attacks: a group of two or more closing on the enemy from out of range to
 * contact (half a range or more nearer). The enemy body is the enemies within
 * two ranges of the one it meets; its front faces the attacker's other units
 * near it (the force that fixes it), else its own direction of travel, else
 * the attacker's side as a whole. The angle between the enemy's facing and
 * where the attack comes from: 35° or less frontal, 50-130° a flank, more the
 * rear.
 */
export function attacks(ctx: Ctx): Attack[] {
  const f = ctx.f;
  const out: Attack[] = [];
  for (const c of ctx.contacts) {
    const g = c.g;
    if (g.dom === AIR) continue;
    const st = at(g, c.s);
    if (!st || st.members.length < 2) continue;
    const R = ctx.R[g.dom];
    const fam = surface(g.dom);
    const A = stepsOf(ctx, g.dom, 120);
    const s0 = firstFrom(g, c.s - A);
    const st0 = at(g, s0);
    if (!st0 || s0 >= c.s) continue;
    const k = c.s * f.N + c.near;
    const enemy = unitsNear(ctx, c.s, f.X[k], f.Z[k], 2 * R, g.team, fam).filter((u) => f.team[u] === c.enemyTeam);
    const ec = centroid(f, enemy, c.s);
    if (!ec) continue;
    const dA = Math.hypot(st0.cx - ec[0], st0.cz - ec[2]);
    const dC = Math.hypot(st.cx - ec[0], st.cz - ec[2]);
    const closed = dA - dC;
    if (closed < 0.5 * R) continue;
    const mem = new Set(st.members);
    // The fixing force: the attacker's other units that have stood engaged in front of the enemy for 20 s,
    // within 1.5 ranges then and now, and slower than half the attacking group.
    const hold = Math.round(20 / f.step);
    const gv = Math.hypot(st.vx, st.vz);
    const others = unitsNear(ctx, c.s, ec[0], ec[2], 1.5 * R, g.team, fam, true).filter((u) => {
      if (mem.has(u)) return false;
      const kb = Math.max(0, c.s - hold) * f.N + u;
      if (!f.alive[kb] || Math.hypot(f.X[kb] - ec[0], f.Z[kb] - ec[2]) > 1.5 * R) return false;
      return speedOf(ctx, c.s, u) <= Math.max(0.5 * gv, move(ctx, f.dom[u]));
    });
    let n: [number, number];
    let fixing = 0;
    const oc = centroid(f, others, c.s);
    if (oc) {
      n = norm(oc[0] - ec[0], oc[2] - ec[2]);
      // Fixing only when it fights the enemy body: kills either way between them in the minute around.
      const T = dataT(f, c.s);
      fixing = foughtBetween(ctx, others, unitsNear(ctx, c.s, ec[0], ec[2], 3 * R, g.team, fam), T - 60, T + 30, { x: ec[0], z: ec[2], r: 2 * R }) > 0 ? others.length : 0;
    } else {
      let vx = 0;
      let vz = 0;
      for (const u of enemy) {
        vx += ctx.G.VX[c.s * f.N + u];
        vz += ctx.G.VZ[c.s * f.N + u];
      }
      vx /= enemy.length;
      vz /= enemy.length;
      if (Math.hypot(vx, vz) > move(ctx, g.dom)) n = norm(vx, vz);
      else {
        // Standing: it faces where the attacker's side came from - its centroid when it first appeared.
        const tc = ctx.origin.get(g.team);
        if (!tc) continue;
        n = norm(tc[0] - ec[0], tc[1] - ec[2]);
      }
    }
    const mp = meanPos(g, c.s - Math.max(1, Math.round(A / 3)), c.s) ?? [st.cx, st.cz];
    const a = norm(mp[0] - ec[0], mp[1] - ec[2]);
    if (!(a[0] || a[1]) || !(n[0] || n[1])) continue;
    const theta = angle(a, n);
    const side = Math.sign(n[0] * a[1] - n[1] * a[0]);
    const path = pathOf(g, s0, c.s);
    const len = pathLength(path);
    const straight = len > 0 ? Math.hypot(path[path.length - 1][0] - path[0][0], path[path.length - 1][2] - path[0][2]) / len : 1;
    out.push({ c, g, dom: g.dom, s0, s: c.s, enemy, ec, a, n, theta, side, fixing, closed, straight });
  }
  return out;
}

function frontOf(ctx: Ctx, x: Attack): [[number, number], [number, number]] {
  const R = ctx.R[x.dom];
  const px = -x.n[1];
  const pz = x.n[0];
  const fx = x.ec[0] + x.n[0] * 0.3 * R;
  const fz = x.ec[2] + x.n[1] * 0.3 * R;
  return [
    [r2(fx - px * R), r2(fz - pz * R)],
    [r2(fx + px * R), r2(fz + pz * R)],
  ];
}

/** Frontal assaults, flanks (and from the rear), and two flanks at once: the pincer. */
export function approaches(ctx: Ctx, list: Attack[]): void {
  const f = ctx.f;
  for (const x of list) {
    const st = at(x.g, x.s)!;
    const R = ctx.R[x.dom];
    const size = st.members.length;
    const units = [...st.members];
    const common = {
      team: x.g.team,
      against: x.c.enemyTeam,
      dom: x.dom,
      s0: x.s0,
      s1: x.s,
      units,
      place: { x: x.ec[0], y: x.ec[1], z: x.ec[2], radius: R },
      paths: [pathOf(x.g, x.s0, x.s)],
      outlines: [outlineOf(f, x.enemy, x.s, R * 0.15), outlineOf(f, st.members, x.s, R * 0.1)],
      front: frontOf(ctx, x),
    };
    const ev = { angle: r0(x.theta), units: size, enemies: x.enemy.length, fixing: x.fixing, closedM: r0(x.closed / f.upm), straightness: r2(x.straight), rangeM: r0(R / f.upm) };
    if (x.theta <= 35) {
      if (x.closed < 0.75 * R) continue;
      const conf = 0.4 + 0.15 * (1 - x.theta / 35) + 0.15 * clamp01((x.closed - R) / (2 * R)) + 0.1 * (size >= 3 ? 1 : 0) + 0.1 * (x.straight >= 0.8 ? 1 : 0) + 0.1 * (x.enemy.length >= 2 ? 1 : 0);
      emit(ctx, { ...common, kind: 'frontalAssault', confidence: conf, evidence: ev });
    } else if (x.theta >= 50) {
      const rear = x.theta > 130;
      // Without a force fixing the enemy in front, its facing is a guess: a low-confidence flank at most.
      const conf = x.fixing > 0 ? 0.5 + 0.2 * clamp01((x.theta - 50) / 40) + 0.1 * clamp01(x.fixing / 3) + 0.1 * (size >= 3 ? 1 : 0) + 0.1 * (x.straight < 0.8 ? 1 : 0) : 0.3 + 0.1 * clamp01((x.theta - 50) / 40) + 0.05 * (size >= 3 ? 1 : 0);
      emit(ctx, { ...common, kind: 'flank', ...(rear ? { variant: 'rear' } : {}), confidence: conf, evidence: { ...ev, indirect: r2(1 / Math.max(0.05, x.straight)) } });
    }
  }
  // Pincers: two flank attacks of one side on the same enemy body, from opposite sides, close in time.
  const flanks = list.filter((x) => x.theta >= 50);
  const used = new Set<number>();
  for (let i = 0; i < flanks.length; i++) {
    for (let j = i + 1; j < flanks.length; j++) {
      const p = flanks[i];
      const q = flanks[j];
      if (p.g === q.g || p.g.team !== q.g.team || p.c.enemyTeam !== q.c.enemyTeam || p.dom !== q.dom) continue;
      if (used.has(i) || used.has(j)) continue;
      if (Math.abs(p.s - q.s) > stepsOf(ctx, p.dom, 90)) continue;
      const R = ctx.R[p.dom];
      if (Math.hypot(p.ec[0] - q.ec[0], p.ec[2] - q.ec[2]) > 2 * R) continue;
      const sep = angle(p.a, q.a);
      if (p.side === q.side || sep < 100) continue;
      used.add(i);
      used.add(j);
      const s0 = Math.min(p.s0, q.s0);
      const s1 = Math.max(p.s, q.s);
      const ec: [number, number, number] = [(p.ec[0] + q.ec[0]) / 2, (p.ec[1] + q.ec[1]) / 2, (p.ec[2] + q.ec[2]) / 2];
      const units = [...new Set([...at(p.g, p.s)!.members, ...at(q.g, q.s)!.members])];
      const fixing = Math.max(p.fixing, q.fixing);
      // Both arms in the fight: kills either way between them and the enemy body.
      const T = dataT(ctx.f, Math.max(p.s, q.s));
      const engaged = foughtBetween(ctx, units, [...p.enemy, ...q.enemy], dataT(ctx.f, Math.min(p.s0, q.s0)), T + 90, { x: ec[0], z: ec[2], r: 2 * R }) > 0;
      const conf = !engaged ? 0.42 : 0.55 + 0.2 * clamp01((sep - 100) / 60) + 0.15 * (fixing > 0 ? 1 : 0) + 0.1 * (Math.min(at(p.g, p.s)!.members.length, at(q.g, q.s)!.members.length) >= 2 ? 1 : 0);
      emit(ctx, {
        kind: 'pincer',
        team: p.g.team,
        against: p.c.enemyTeam,
        dom: p.dom,
        s0,
        s1,
        confidence: conf,
        units,
        place: { x: ec[0], y: ec[1], z: ec[2], radius: R },
        paths: [pathOf(p.g, p.s0, p.s), pathOf(q.g, q.s0, q.s)],
        outlines: [outlineOf(ctx.f, [...new Set([...p.enemy, ...q.enemy])], s1, R * 0.15)],
        front: frontOf(ctx, p),
        evidence: { separation: r0(sep), angleA: r0(p.theta), angleB: r0(q.theta), secondsApart: r0(Math.abs(p.s - q.s) * ctx.f.step), fixing, enemies: new Set([...p.enemy, ...q.enemy]).size },
      });
    }
  }
}

/**
 * Encirclement: two or more enemies in contact with three or more units of one
 * side (at least as many as are in it; it spread over half a range at most)
 * within 1.5 ranges, from two or more of that side's groups, whose
 * bearings from the pocket's centre leave no gap wider than 100°, for at
 * least a minute (ground), the pocket not getting out (its centre moving less
 * than a range) and cut off - none of its own side between one and three
 * ranges from it. Sure only when the ring closed in: its units came half a
 * range nearer in the minute before. In a brawl the sides mix and every group
 * has enemies all round; the cut-off and the closing are what a null model of
 * the same match (`nulls.ts`) does not produce. Paid off when the pocket loses
 * half its units or more.
 */
export function encirclement(ctx: Ctx): void {
  const f = ctx.f;
  for (const E of ctx.G.list) {
    if (E.dom === AIR || E.maxSize < 2) continue;
    const nr = ctx.near.get(E.id)!;
    const R = ctx.R[E.dom];
    const fam = surface(E.dom);
    const need = stepsOf(ctx, E.dom, 60);
    let run: { s: number; cov: number; by: number[]; team: number }[] = [];
    const flush = () => {
      const a0 = run.length ? stepAt(E, run[0].s) : null;
      const a1 = run.length ? stepAt(E, run[run.length - 1].s) : null;
      const kept = !!a0 && !!a1 && Math.hypot(a1.cx - a0.cx, a1.cz - a0.cz) < R;
      if (run.length >= need && kept) {
        const s0 = run[0].s;
        const s1 = run[run.length - 1].s;
        const team = run[0].team;
        const by = [...new Set(run.flatMap((r) => r.by))];
        const pocket = [...new Set(E.steps.filter((st) => st.s >= s0 && st.s <= s1).flatMap((st) => [...st.members]))];
        const mid = run[run.length >> 1].s;
        const st = stepAt(E, mid)!;
        const tail = secs(E.dom, 60);
        let pocketLoss = 0;
        for (const u of pocket) pocketLoss += countIn(ctx.deathsOf.get(u), dataT(f, s0), dataT(f, s1) + tail);
        const o = outcomeOf(ctx, by, team, dataT(f, s0), dataT(f, s1), tail);
        const cov = run.reduce((a, r) => a + r.cov, 0) / run.length;
        // Did the ring close in? Its units' mean distance to the pocket a minute before against at the start.
        const before = Math.max(0, s0 - stepsOf(ctx, E.dom, 60));
        const p0 = stepAt(E, s0)!;
        let dB = 0;
        let dA = 0;
        let nB = 0;
        for (const u of by) {
          const kb = before * f.N + u;
          const ka = s0 * f.N + u;
          if (!f.alive[kb] || !f.alive[ka]) continue;
          dB += Math.hypot(f.X[kb] - p0.cx, f.Z[kb] - p0.cz);
          dA += Math.hypot(f.X[ka] - p0.cx, f.Z[ka] - p0.cz);
          nB++;
        }
        const closed = nB ? (dB - dA) / nB : 0;
        // And the pocket was fought: kills either way between ring and pocket while it held or just after.
        const engaged = foughtBetween(ctx, by, pocket, dataT(f, s0) - 30, dataT(f, s1) + tail, { x: st.cx, z: st.cz, r: 2 * R }) > 0;
        const conf =
          closed >= 0.5 * R && engaged
            ? 0.5 + 0.2 * clamp01((cov - 260) / 70) + 0.15 * clamp01((run.length - need) / (2 * need)) + 0.15 * clamp01((by.length - 3) / 3)
            : 0.42;
        const groups = new Set<number>();
        for (const u of by) for (let s = s0; s <= s1; s++) if (ctx.G.at[s * f.N + u] >= 0) groups.add(ctx.G.at[s * f.N + u]);
        const back = stepsOf(ctx, E.dom, 60);
        emit(ctx, {
          kind: 'encirclement',
          team,
          against: E.team,
          dom: E.dom,
          s0,
          s1,
          confidence: conf,
          units: by,
          place: { x: st.cx, y: st.cy, z: st.cz, radius: 1.5 * R },
          paths: by.slice(0, 12).map((u) => unitPath(f, u, Math.max(0, s0 - back), s1)),
          outlines: [outlineOf(f, st.members, mid, R * 0.15)],
          evidence: { coverageDeg: r0(cov), encirclers: by.length, pocket: pocket.length, pocketLosses: pocketLoss, secs: r0((s1 - s0) * f.step), closedM: r0(closed / f.upm) },
          outcome: { ...o, paid: pocketLoss * 2 >= pocket.length ? 1 : o.paid },
        });
      }
      run = [];
    };
    for (let i = 0; i < E.steps.length; i++) {
      const st = E.steps[i];
      // A pocket is a compact body, not a whole side spread over the map.
      if (st.members.length < 2 || st.spread > 0.5 * R || !(nr.d[i] <= 1.5 * R)) {
        flush();
        continue;
      }
      // The side round it: the team of the nearest enemy.
      const team = f.team[nr.u[i]];
      const ring = unitsNear(ctx, st.s, st.cx, st.cz, 1.5 * R, E.team, fam).filter((u) => f.team[u] === team);
      const from = new Set(ring.map((u) => ctx.G.at[st.s * f.N + u]));
      if (ring.length < Math.max(3, st.members.length) || from.size < 2) {
        flush();
        continue;
      }
      // Cut off: none of its own side between one and three ranges out.
      const relief = unitsNear(ctx, st.s, st.cx, st.cz, 3 * R, team, fam).filter((u) => {
        if (f.team[u] !== E.team) return false;
        const k = st.s * f.N + u;
        return Math.hypot(f.X[k] - st.cx, f.Z[k] - st.cz) > R;
      });
      if (relief.length) {
        flush();
        continue;
      }
      const b = ring.map((u) => Math.atan2(f.Z[st.s * f.N + u] - st.cz, f.X[st.s * f.N + u] - st.cx) * DEG).sort((p, q) => p - q);
      let gap = 360 - (b[b.length - 1] - b[0]);
      for (let k = 1; k < b.length; k++) gap = Math.max(gap, b[k] - b[k - 1]);
      if (gap > 100 || (run.length && run[0].team !== team)) {
        flush();
        if (gap > 100) continue;
      }
      run.push({ s: st.s, cov: 360 - gap, by: ring, team });
    }
    flush();
  }
}

/**
 * Penetration: a moving group with enemies ahead of it on both sides that
 * have stood for 30 s, their side's centre beyond them (the enemy's own line)
 * (left and right of its heading, 0.25-1.5 ranges out, within a range
 * ahead, roughly abreast of each other - a line) that, within two minutes
 * (ground), has passed at least one of each side, 0.75 ranges or more on from
 * where it started - through the line, not round its end. Sure only when it
 * gets half a range beyond the line and is still beyond it 20 s later; a
 * breakthrough when it goes on a further range.
 */
export function penetration(ctx: Ctx): void {
  const f = ctx.f;
  for (const g of ctx.G.list) {
    if (g.dom === AIR || g.maxSize < 2) continue;
    const nr = ctx.near.get(g.id)!;
    const R = ctx.R[g.dom];
    const fam = surface(g.dom);
    const mv = move(ctx, g.dom);
    const W = stepsOf(ctx, g.dom, 120);
    let until = -1;
    for (let i = 0; i < g.steps.length; i++) {
      const st = g.steps[i];
      if (st.s <= until || st.members.length < 2 || !(nr.d[i] <= 2 * R)) continue;
      const sp = Math.hypot(st.vx, st.vz);
      if (sp < mv) continue;
      const h = norm(st.vx, st.vz);
      const near = unitsNear(ctx, st.s, st.cx, st.cz, 2.5 * R, g.team, fam);
      const left: number[] = [];
      const right: number[] = [];
      for (const u of near) {
        if (speedOf(ctx, st.s, u) > mv) continue;
        const k = st.s * f.N + u;
        const dx = f.X[k] - st.cx;
        const dz = f.Z[k] - st.cz;
        const al = dx * h[0] + dz * h[1];
        const cr = -dx * h[1] + dz * h[0];
        if (al <= 0 || al > R) continue;
        if (cr >= 0.25 * R && cr <= 1.5 * R) left.push(u);
        else if (cr <= -0.25 * R && cr >= -1.5 * R) right.push(u);
      }
      if (!left.length || !right.length) continue;
      // A held line: its units stood the 30 s before; one of the enemy's own, its side's centre beyond it.
      const hold = Math.round(30 / f.step);
      const heldL = left.filter((u) => stood(ctx, u, st.s - hold, st.s));
      const heldR = right.filter((u) => stood(ctx, u, st.s - hold, st.s));
      if (!heldL.length || !heldR.length) continue;
      left.length = 0;
      left.push(...heldL);
      right.length = 0;
      right.push(...heldR);
      const enemySide: number[] = [];
      for (let u = 0; u < f.N; u++) if (f.team[u] === f.team[left[0]] && surface(f.dom[u]) === fam && f.alive[st.s * f.N + u]) enemySide.push(u);
      const ec = centroid(f, enemySide, st.s);
      const lineAt = [...left, ...right].reduce((a, u) => a + (f.X[st.s * f.N + u] - st.cx) * h[0] + (f.Z[st.s * f.N + u] - st.cz) * h[1], 0) / (left.length + right.length);
      if (!ec || (ec[0] - st.cx) * h[0] + (ec[2] - st.cz) * h[1] <= lineAt) continue;
      // A line: some enemy on the left about abreast of some on the right.
      const alongOf = (u: number) => (f.X[st.s * f.N + u] - st.cx) * h[0] + (f.Z[st.s * f.N + u] - st.cz) * h[1];
      if (!left.some((a) => right.some((b) => Math.abs(alongOf(a) - alongOf(b)) < 0.5 * R))) continue;
      // Ahead: has it passed one of each?
      for (let j = i + 1; j < g.steps.length && g.steps[j].s <= st.s + W; j++) {
        const s2 = g.steps[j];
        const p2 = (s2.cx - st.cx) * h[0] + (s2.cz - st.cz) * h[1];
        if (p2 < 0.75 * R) continue;
        const passed = (l: number[]) =>
          l.filter((u) => {
            const k = s2.s * f.N + u;
            return f.alive[k] && (f.X[k] - st.cx) * h[0] + (f.Z[k] - st.cz) * h[1] < p2 - 0.1 * R;
          });
        const pl = passed(left);
        const pr = passed(right);
        if (!pl.length || !pr.length) continue;
        // Beyond: a further range past the line in the next minute?
        let line = -Infinity;
        for (const u of [...pl, ...pr]) {
          const k = s2.s * f.N + u;
          line = Math.max(line, (f.X[k] - st.cx) * h[0] + (f.Z[k] - st.cz) * h[1]);
        }
        let end = s2.s;
        let through = false;
        let beyond = p2;
        for (let q = j; q < g.steps.length && g.steps[q].s <= s2.s + W; q++) {
          const s3 = g.steps[q];
          end = s3.s;
          beyond = Math.max(beyond, (s3.cx - st.cx) * h[0] + (s3.cz - st.cz) * h[1]);
          if (beyond >= line + R) {
            through = true;
            break;
          }
        }
        // Deep and lasting: half a range or more beyond the line, and still beyond it (alive) 20 s after passing.
        let held = 0;
        let from = -1;
        for (let q = j; q < g.steps.length && g.steps[q].s <= s2.s + W; q++) {
          const s4 = g.steps[q];
          const beyondLine = (s4.cx - st.cx) * h[0] + (s4.cz - st.cz) * h[1] >= line + 0.25 * R;
          if (from < 0) {
            if (beyondLine) from = s4.s;
            continue;
          }
          if (!beyondLine) break;
          held = (s4.s - from) * f.step;
          if (held >= 20) break;
        }
        // And a fight: kills either way between the group and the enemies round the line while it went through.
        const deep = beyond - line >= 0.5 * R && held >= 20 && foughtBetween(ctx, st.members, near, dataT(f, st.s) - 30, dataT(f, end) + 30, { x: st.cx + h[0] * line, z: st.cz + h[1] * line, r: 2 * R }) > 0;
        const conf = deep ? 0.5 + 0.15 * (left.length >= 2 && right.length >= 2 ? 1 : 0) + 0.2 * (through ? 1 : 0) + 0.1 * (st.members.length >= 3 ? 1 : 0) + 0.05 * clamp01((pl.length + pr.length - 2) / 4) : 0.42;
        const lineUnits = [...left, ...right];
        const a = left[0];
        const b = right[0];
        const ka = st.s * f.N + a;
        const kb = st.s * f.N + b;
        emit(ctx, {
          kind: 'penetration',
          ...(through ? { variant: 'breakthrough' } : {}),
          team: g.team,
          against: f.team[left[0]],
          dom: g.dom,
          s0: st.s,
          s1: end,
          confidence: conf,
          units: [...st.members],
          place: { x: st.cx + h[0] * (line > 0 ? line : 0), y: st.cy, z: st.cz + h[1] * (line > 0 ? line : 0), radius: 1.5 * R },
          paths: [pathOf(g, Math.max(0, st.s - W), end)],
          outlines: [outlineOf(f, lineUnits, st.s, R * 0.1)],
          front: [
            [r2(f.X[ka]), r2(f.Z[ka])],
            [r2(f.X[kb]), r2(f.Z[kb])],
          ],
          evidence: { left: left.length, right: right.length, passed: pl.length + pr.length, beyondM: r0(Math.max(0, beyond - line) / f.upm), heldBeyondS: r0(held), units: st.members.length },
        });
        until = end + W;
        break;
      }
    }
  }
}

/**
 * Fire and maneuver: in a group of two or more on the ground, part moves while
 * the rest stands, then the roles swap - at least four bounds in a row whose
 * moving parts are mostly different (Jaccard of 1/3 or less), each 4-60 s,
 * the group getting forward half a range or more. Fire, hits or kills from
 * the standing part during a bound are the covering fire.
 */
export function bounding(ctx: Ctx): void {
  const f = ctx.f;
  // Elements bound apart, further than the units of a group that moves as one: loose groups, linked
  // at three times the distance whether they move alike or not.
  if (!Array.from(f.dom).some((d) => d === 1 || d === INF)) return;
  const loose = findGroups(f, { scale: 3, velocity: false, doms: [1, INF], vel: ctx.G });
  for (const g of loose.list) {
    // Fire teams to platoons: bigger loose groups are whole sides chained together.
    if (g.dom === AIR || g.dom === SEA || g.maxSize < 2 || g.maxSize > 8 || g.steps.length < 8) continue;
    const mv = move(ctx, g.dom);
    const R = ctx.R[g.dom];
    const minLen = Math.max(1, Math.round(4 / f.step));
    const maxLen = stepsOf(ctx, g.dom, 60);
    // Bound episodes: runs of steps with the same part moving and the rest standing.
    const eps: { set: Set<number>; still: Set<number>; s0: number; s1: number }[] = [];
    let cur: (typeof eps)[number] | null = null;
    for (const st of g.steps) {
      const mov = new Set<number>();
      const still = new Set<number>();
      for (const u of st.members) {
        const v = speedOf(ctx, st.s, u);
        if (v > 2 * mv) mov.add(u);
        else if (v <= 0.5 * mv) still.add(u);
      }
      if (!mov.size || !still.size) {
        if (cur && st.s - cur.s1 > 2) cur = null;
        continue;
      }
      if (cur && jaccard(cur.set, mov) >= 0.5 && st.s - cur.s1 <= 2) {
        cur.s1 = st.s;
        for (const u of still) cur.still.add(u);
      } else {
        cur = { set: mov, still, s0: st.s, s1: st.s };
        eps.push(cur);
      }
    }
    // Chains of alternating bounds.
    let chain: typeof eps = [];
    const close = () => {
      if (chain.length >= 4) {
        const s0 = chain[0].s0;
        const s1 = chain[chain.length - 1].s1;
        const a = at(g, s0) ?? g.steps[0];
        const b = at(g, s1) ?? g.steps[g.steps.length - 1];
        const adv = Math.hypot(b.cx - a.cx, b.cz - a.cz);
        if (adv >= 0.5 * R) {
          let cover = 0;
          for (const e of chain) for (const u of e.still) cover += countIn(ctx.firesBy.get(u), dataT(f, e.s0), dataT(f, e.s1)) + countIn(ctx.killsBy.get(u), dataT(f, e.s0), dataT(f, e.s1));
          const units = [...new Set(chain.flatMap((e) => [...e.set, ...e.still]))];
          // Without covering fire, only a long, regular series of bounds stands on its own.
          const conf = cover >= 2 ? 0.55 + 0.1 * clamp01((chain.length - 4) / 3) + 0.2 * clamp01(adv / R - 0.5) + 0.1 * (units.length >= 3 ? 1 : 0) : chain.length >= 6 ? 0.5 + 0.1 * clamp01(adv / R - 0.5) : 0.4;
          emit(ctx, {
            kind: 'bounding',
            team: g.team,
            against: -1,
            dom: g.dom,
            s0,
            s1,
            confidence: conf,
            units,
            place: { x: (a.cx + b.cx) / 2, y: (a.cy + b.cy) / 2, z: (a.cz + b.cz) / 2, radius: Math.max(adv / 2, R * 0.3) },
            paths: units.slice(0, 8).map((u) => unitPath(f, u, s0, s1)),
            outlines: [outlineOf(f, a.members, s0, R * 0.08)],
            evidence: { bounds: chain.length, coveringFire: cover, advanceM: r0(adv / f.upm), meanBoundS: r0(((s1 - s0) * f.step) / chain.length) },
          });
        }
      }
      chain = [];
    };
    for (const e of eps) {
      const len = e.s1 - e.s0 + 1;
      if (len < minLen || len > maxLen) {
        close();
        continue;
      }
      const prev = chain[chain.length - 1];
      if (prev && (jaccard(prev.set, e.set) > 1 / 3 || e.s0 - prev.s1 > stepsOf(ctx, g.dom, 20))) close();
      chain.push(e);
    }
    close();
  }
}

function jaccard(a: Set<number>, b: Set<number>): number {
  let i = 0;
  for (const x of a) if (b.has(x)) i++;
  return i / (a.size + b.size - i || 1);
}

/** A side's units of a family alive at a step. */
function sideUnits(ctx: Ctx, team: number, fam: number, s: number): number[] {
  const f = ctx.f;
  const out: number[] = [];
  for (let u = 0; u < f.N; u++) if (f.team[u] === team && surface(f.dom[u]) === fam && f.alive[s * f.N + u]) out.push(u);
  return out;
}

/** The most units of a list within `r` of one of them, and where. */
function massPoint(ctx: Ctx, units: number[], s: number, r: number): { n: number; x: number; y: number; z: number } {
  const f = ctx.f;
  let best = { n: 0, x: 0, y: 0, z: 0 };
  const centres = units.length > 200 ? units.filter((_, i) => i % Math.ceil(units.length / 200) === 0) : units;
  for (const c of centres) {
    const kc = s * f.N + c;
    let n = 0;
    for (const u of units) {
      const k = s * f.N + u;
      if (Math.hypot(f.X[k] - f.X[kc], f.Z[k] - f.Z[kc]) <= r) n++;
    }
    if (n > best.n) best = { n, x: f.X[kc], y: f.Y[kc], z: f.Z[kc] };
  }
  return best;
}

/**
 * Concentration and dispersion of a side over time: the share of its units
 * within 1.2 ranges of its densest point, every ~10 s. Concentration: from
 * 35% or less to 60% or more within three minutes, two or more units more at
 * the mass point, three or more there. Dispersion: from 60% or more to 30% or
 * less with no more than a third of the units lost meanwhile. The first 45 s
 * of a side's presence (spreading from the spawn) do not count.
 */
export function massing(ctx: Ctx): void {
  const f = ctx.f;
  const teams = new Set<number>();
  for (let u = 0; u < f.N; u++) teams.add(f.team[u]);
  for (const team of teams) {
    if (team < 0) continue;
    for (const fam of [1, 2]) {
      const R = ctx.R[fam === 1 ? dominant(ctx, team) : SEA];
      const every = Math.max(1, Math.round(10 / f.step));
      const series: { s: number; share: number; n: number; alive: number; x: number; y: number; z: number }[] = [];
      let first = -1;
      for (let s = 0; s < f.S; s += every) {
        const us = sideUnits(ctx, team, fam, s);
        if (us.length < 4) continue;
        if (first < 0) first = s;
        const m = massPoint(ctx, us, s, 1.2 * R);
        series.push({ s, share: m.n / us.length, n: m.n, alive: us.length, x: m.x, y: m.y, z: m.z });
      }
      if (series.length < 3) continue;
      const W = Math.round(180 / f.step);
      const skip = first + Math.round(45 / f.step);
      let i = 0;
      while (i < series.length) {
        const a = series[i];
        if (a.s < skip) {
          i++;
          continue;
        }
        let hit = -1;
        let kind: 'concentration' | 'dispersion' | null = null;
        for (let j = i + 1; j < series.length && series[j].s - a.s <= W; j++) {
          const b = series[j];
          if (a.share <= 0.35 && b.share >= 0.6 && b.n >= 3 && b.n >= a.n + 2) {
            hit = j;
            kind = 'concentration';
            break;
          }
          if (a.share >= 0.6 && b.share <= 0.3 && b.alive >= a.alive * (2 / 3)) {
            hit = j;
            kind = 'dispersion';
            break;
          }
        }
        if (hit < 0 || !kind) {
          i++;
          continue;
        }
        const b = series[hit];
        const dom = fam === 1 ? dominant(ctx, team) : SEA;
        const us = sideUnits(ctx, team, fam, b.s);
        const at2 = us.filter((u) => Math.hypot(f.X[b.s * f.N + u] - b.x, f.Z[b.s * f.N + u] - b.z) <= 1.2 * R);
        // Contact at the mass point within two minutes, and the local force ratio there.
        let ratio = 0;
        let contactS = -1;
        let where: [number, number] = [b.x, b.z];
        for (let s = b.s; s < Math.min(f.S, b.s + Math.round(120 / f.step)); s++) {
          // Where the gathered units are now: they may still be closing.
          const mc = centroid(f, at2, s);
          if (!mc) break;
          const en = unitsNear(ctx, s, mc[0], mc[2], 1.5 * R, team, fam);
          if (en.length) {
            const own = unitsNear(ctx, s, mc[0], mc[2], 1.5 * R, team, fam, true);
            ratio = own.length / en.length;
            contactS = s;
            where = [mc[0], mc[2]];
            break;
          }
        }
        const delta = Math.abs(b.share - a.share);
        // Purposeful: the units gathered came from afar (their mean distance to the mass point fell by 1.5 ranges),
        // or the side's spread grew by 1.5 ranges and doubled - not a crowd milling about.
        const both = (kind === 'concentration' ? at2 : us).filter((w) => f.alive[a.s * f.N + w]);
        const meanTo = (s: number, x: number, z: number) => both.reduce((acc, w) => acc + Math.hypot(f.X[s * f.N + w] - x, f.Z[s * f.N + w] - z), 0) / Math.max(1, both.length);
        let moved: number;
        if (kind === 'concentration') moved = meanTo(a.s, b.x, b.z) - meanTo(b.s, b.x, b.z);
        else {
          const ca = centroid(f, both, a.s);
          const cb = centroid(f, both, b.s);
          const sa = ca ? meanTo(a.s, ca[0], ca[2]) : 0;
          const sb = cb ? meanTo(b.s, cb[0], cb[2]) : 0;
          moved = sb >= 2 * sa ? sb - sa : 0;
        }
        if (moved < 1.5 * R) {
          i++;
          continue;
        }
        // A concentration for a blow: the gathered units fought there (kills either way) in the two minutes after.
        const foes: number[] = [];
        for (let u = 0; u < f.N; u++) if (f.team[u] !== team && f.team[u] >= 0) foes.push(u);
        const struck = contactS >= 0 && foughtBetween(ctx, at2, foes, dataT(f, b.s), dataT(f, b.s) + 120, { x: where[0], z: where[1], r: 2 * R }) > 0;
        const conf =
          kind === 'concentration'
            ? !struck
              ? 0.42
              : 0.5 + 0.2 * clamp01((delta - 0.25) / 0.35) + 0.15 * clamp01((ratio - 1) / 2) + 0.15 * clamp01((moved - 1.5 * R) / (3 * R))
            : 0.45 + 0.25 * clamp01((delta - 0.3) / 0.4) + 0.15 * clamp01((a.alive - 4) / 6) + 0.15 * clamp01((moved - 1.5 * R) / (3 * R));
        emit(ctx, {
          kind,
          team,
          against: -1,
          dom,
          s0: a.s,
          s1: contactS >= 0 && kind === 'concentration' ? contactS : b.s,
          confidence: conf,
          units: kind === 'concentration' ? at2 : us,
          place: { x: kind === 'concentration' ? b.x : a.x, y: b.y, z: kind === 'concentration' ? b.z : a.z, radius: 1.2 * R * (kind === 'dispersion' ? 2 : 1) },
          paths: (kind === 'concentration' ? at2 : us).slice(0, 12).map((u) => unitPath(f, u, a.s, b.s)),
          outlines: [outlineOf(f, kind === 'concentration' ? at2 : us, b.s, R * 0.1)],
          evidence: { shareBefore: r2(a.share), shareAfter: r2(b.share), atMass: b.n, alive: b.alive, movedM: r0(moved / f.upm), ...(kind === 'concentration' ? { localRatio: r2(ratio) } : {}) },
          tail: 120,
        });
        // The next episode starts after this one.
        while (i < series.length && series[i].s <= b.s) i++;
      }
    }
  }
}

/** The domain most of a side's surface units are in (vehicles or infantry). */
function dominant(ctx: Ctx, team: number): number {
  let g = 0;
  let inf = 0;
  for (let u = 0; u < ctx.f.N; u++) {
    if (ctx.f.team[u] !== team) continue;
    if (ctx.f.dom[u] === INF) inf++;
    else if (ctx.f.dom[u] === 1) g++;
  }
  return inf > g ? INF : 1;
}

/**
 * Feint: a small element (at most two units, or 40% of its side's movers)
 * comes into contact at P1; within 90 s (ground) two or more enemies who were
 * more than three ranges from P1 have come within three ranges of it; then,
 * 10-180 s after the feint's contact, a bigger group of the same side meets
 * the enemy at P2, four ranges or more from P1, where the enemy has fewer
 * units than it had when the feint began.
 */
export function feint(ctx: Ctx): void {
  const f = ctx.f;
  const done = new Set<string>();
  for (const F of ctx.contacts) {
    const g = F.g;
    if (g.dom === AIR) continue;
    const st = at(g, F.s);
    if (!st) continue;
    const fam = surface(g.dom);
    const movers = sideUnits(ctx, g.team, fam, F.s).filter((u) => speedOf(ctx, F.s, u) > move(ctx, f.dom[u])).length;
    if (st.members.length > Math.max(2, 0.4 * movers)) continue;
    const R = ctx.R[g.dom];
    const D = 3 * R;
    const p1: [number, number] = [st.cx, st.cz];
    const before = new Set(unitsNear(ctx, F.s, p1[0], p1[1], D, g.team, fam));
    let drawn: number[] = [];
    const W = stepsOf(ctx, g.dom, 90);
    for (let s = F.s + 1; s <= Math.min(f.S - 1, F.s + W); s++) {
      const now = unitsNear(ctx, s, p1[0], p1[1], D, g.team, fam).filter((u) => !before.has(u));
      if (now.length > drawn.length) drawn = now;
    }
    if (drawn.length < 2) continue;
    // The main effort.
    const lo = F.s + Math.max(1, Math.round(10 / f.step));
    const hi = F.s + stepsOf(ctx, g.dom, 180);
    for (const M of ctx.contacts) {
      if (M.s < lo || M.s > hi || M.g === g || M.g.team !== g.team || M.g.dom !== g.dom) continue;
      const sm = at(M.g, M.s);
      if (!sm || sm.members.length < Math.max(2, st.members.length + 1)) continue;
      const p2: [number, number] = [sm.cx, sm.cz];
      if (Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) < 4 * R) continue;
      const atP2Before = unitsNear(ctx, F.s, p2[0], p2[1], D, g.team, fam).length;
      const atP2Now = unitsNear(ctx, M.s, p2[0], p2[1], D, g.team, fam).length;
      // Where the drawn enemies came from: near P2 when the feint began?
      const fromP2 = drawn.filter((u) => {
        const k = F.s * f.N + u;
        return f.alive[k] && Math.hypot(f.X[k] - p2[0], f.Z[k] - p2[1]) <= D;
      }).length;
      if (atP2Now >= atP2Before && fromP2 === 0) continue;
      const key = `${g.id}:${M.g.id}`;
      if (done.has(key)) continue;
      done.add(key);
      const conf = 0.45 + 0.15 * clamp01((drawn.length - 2) / 3) + 0.2 * (fromP2 > 0 ? 1 : 0) + 0.1 * (atP2Now < atP2Before ? 1 : 0) + 0.1 * (sm.members.length >= 2 * st.members.length ? 1 : 0);
      const back = stepsOf(ctx, g.dom, 60);
      // The main effort fought there: kills either way with the enemy at P2.
      if (!foughtBetween(ctx, sm.members, unitsNear(ctx, M.s, p2[0], p2[1], D, g.team, fam), dataT(f, M.s) - 10, dataT(f, M.s) + secs(g.dom, 90), { x: p2[0], z: p2[1], r: D })) continue;
      // Over every unit it names (the feint's and the main effort's), as the result says it.
      const main = outcomeOf(ctx, [...new Set([...st.members, ...sm.members])], g.team, dataT(f, M.s), dataT(f, M.s), secs(g.dom, 90));
      emit(ctx, {
        kind: 'feint',
        team: g.team,
        against: F.enemyTeam,
        dom: g.dom,
        s0: F.s,
        s1: M.s,
        confidence: conf,
        units: [...new Set([...st.members, ...sm.members])],
        place: { x: p2[0], y: sm.cy, z: p2[1], radius: 1.5 * R },
        paths: [pathOf(g, Math.max(0, F.s - back), F.s), pathOf(M.g, Math.max(0, M.s - back), M.s), ...drawn.slice(0, 6).map((u) => unitPath(f, u, F.s, F.s + W))],
        outlines: [outlineOf(f, st.members, F.s, R * 0.1), outlineOf(f, sm.members, M.s, R * 0.1)],
        evidence: { feintUnits: st.members.length, mainUnits: sm.members.length, drawn: drawn.length, drawnFromMain: fromP2, enemyAtMainBefore: atP2Before, enemyAtMainThen: atP2Now, apartM: r0(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / f.upm) },
        outcome: main,
      });
      break;
    }
  }
}

/**
 * Withdrawal: a group of two or more in contact that, over at least 20 s
 * (ground) and three minutes at most, opens the distance to the enemy it met by a range or more, moving
 * on 70% of the steps and away from that enemy on average (cos >= 0.5); sure
 * only under pressure - an enemy there killed one of the group in the minute
 * before, and the group got two ranges from it and from where it fought, over
 * 30 s or more (ground). A rout
 * when it lost half its units or more meanwhile. Pursuit: an enemy group
 * moving the same way (cos >= 0.6) through the withdrawal, whose distance to
 * the withdrawing group grows by less than half of the way it went.
 */
export function withdrawal(ctx: Ctx): void {
  const f = ctx.f;
  for (const g of ctx.G.list) {
    if (g.dom === AIR || g.maxSize < 2) continue;
    const nr = ctx.near.get(g.id)!;
    const R = ctx.R[g.dom];
    const fam = surface(g.dom);
    const mv = move(ctx, g.dom);
    const minW = stepsOf(ctx, g.dom, 20);
    const maxW = stepsOf(ctx, g.dom, 180);
    let after = -1;
    for (let i0 = 0; i0 < g.steps.length; i0++) {
      const st0 = g.steps[i0];
      // In contact, two or more, and turning away from the enemy body it is in contact with.
      if (st0.s <= after || st0.members.length < 2 || !(nr.d[i0] <= R) || nr.u[i0] < 0) continue;
      const k0 = st0.s * f.N + nr.u[i0];
      const enemyTeam = f.team[nr.u[i0]];
      const enemy = unitsNear(ctx, st0.s, f.X[k0], f.Z[k0], 2 * R, g.team, fam).filter((u) => f.team[u] === enemyTeam);
      const ec0 = centroid(f, enemy, st0.s)!;
      // Away from where it fought, measured from the enemy's place then (a pursuer must not hide it).
      const awayAt = (i: number) => {
        const st = g.steps[i];
        const d = Math.hypot(st.cx - ec0[0], st.cz - ec0[2]);
        const v = Math.hypot(st.vx, st.vz);
        return v > mv ? ((st.cx - ec0[0]) * st.vx + (st.cz - ec0[2]) * st.vz) / (d * v || 1) : 0;
      };
      if (!(awayAt(i0) >= 0.5)) continue;
      // A turn, not an advance going on through: over the 20 s before, it held or came on.
      let prior = 0;
      let pn = 0;
      let pvx = 0;
      let pvz = 0;
      for (let i = i0 - 1; i >= 0 && g.steps[i].s >= st0.s - minW; i--) {
        prior += awayAt(i);
        pvx += g.steps[i].vx;
        pvz += g.steps[i].vz;
        pn++;
      }
      if (pn && prior / pn > 0.3) continue;
      // And it turned (60° or more) or set off from standing: driving on through a line is no withdrawal.
      const pv = Math.hypot(pvx, pvz) / Math.max(1, pn);
      const v0 = Math.hypot(st0.vx, st0.vz);
      if (pn && pv > mv && (pvx * st0.vx + pvz * st0.vz) / (pv * pn * v0 || 1) > 0.5) continue;
      const d0 = Math.hypot(st0.cx - ec0[0], st0.cz - ec0[2]);
      let best: { i: number; gain: number; away: number; moving: number } | null = null;
      let mov = 0;
      let aw = 0;
      let n = 0;
      for (let i = i0; i < g.steps.length && g.steps[i].s <= st0.s + maxW; i++) {
        const st = g.steps[i];
        const a = awayAt(i);
        if (Math.hypot(st.vx, st.vz) > mv) mov++;
        aw += a;
        n++;
        const gain = Math.hypot(st.cx - ec0[0], st.cz - ec0[2]) - d0;
        if (st.s - st0.s >= minW && gain >= R && mov / n >= 0.7 && aw / n >= 0.5) best = { i, gain, away: aw / n, moving: mov / n };
      }
      if (!best) continue;
      const end = g.steps[best.i];
      const sStart = st0.s;
      const s1 = end.s;
      after = s1;
      const units = [...st0.members];
      const T0 = dataT(f, sStart);
      const T1 = dataT(f, s1);
      let lost = 0;
      let before = 0;
      let later = 0;
      const span = Math.max(T1 - T0, 30);
      for (const u of units) {
        lost += countIn(ctx.deathsOf.get(u), T0 - 30, T1);
        before += countIn(ctx.deathsOf.get(u), T0 - span, T0);
        later += countIn(ctx.deathsOf.get(u), T0, T1 + 30);
      }
      const rout = lost * 2 >= units.length;
      const o = outcomeOf(ctx, units, g.team, T0, T1, 30);
      // A withdrawal from a fight: kills either way with that enemy body in the minute before it turned.
      // Who was in it then: the group and the enemies within two ranges, now and a minute before.
      const sBack = Math.max(0, st0.s - Math.round(60 / f.step));
      const gBack = stepAt(g, sBack) ?? g.steps[0];
      const mine = new Set([...units, ...gBack.members]);
      const theirs = new Set([...enemy, ...unitsNear(ctx, sBack, gBack.cx, gBack.cz, 2 * R, g.team, fam).filter((u) => f.team[u] === enemyTeam)]);
      // Under pressure: an enemy of that body killed one of the group in the minute before it turned, and the
      // group got a range or more further from that killer - a retreat, not a group moving on after its own kill.
      const killers = new Set<number>();
      for (const p of ctx.pairs) {
        if (p.t < T0 - 60 || p.t > T0 + 5 || !mine.has(p.victim) || !theirs.has(p.killer)) continue;
        if (!(p.d <= 2 * R) || !(Math.hypot(p.x - st0.cx, p.z - st0.cz) <= 2 * R)) continue;
        killers.add(p.killer);
      }
      const kc = centroid(f, [...killers], sStart);
      const kd = (st: { cx: number; cz: number }) => (kc ? Math.hypot(st.cx - kc[0], st.cz - kc[2]) : 0);
      const fromKiller = kc ? kd(end) - kd(st0) : 0;
      // On foot (round-based shooters) a fall-back is as common in the null models of the same matches as in
      // the matches themselves (docs/maneuver.md): listed there, never sure.
      const pressed = g.dom !== INF && killers.size > 0 && fromKiller >= 2 * R && best.gain >= 2 * R && (end.s - st0.s) * f.step >= secs(g.dom, 30);
      const conf = pressed ? 0.5 + 0.2 * clamp01((best.gain - R) / (2 * R)) + 0.15 * clamp01((best.away - 0.5) / 0.4) + 0.15 * (units.length >= 3 ? 1 : 0) : 0.42;
      const m = emit(ctx, {
        kind: 'withdrawal',
        ...(rout ? { variant: 'rout' } : {}),
        team: g.team,
        against: enemyTeam,
        dom: g.dom,
        s0: sStart,
        s1,
        confidence: conf,
        units,
        place: { x: st0.cx, y: st0.cy, z: st0.cz, radius: R },
        paths: [pathOf(g, sStart, s1)],
        outlines: [outlineOf(f, enemy, sStart, R * 0.1)],
        evidence: { openedM: r0(best.gain / f.upm), away: r2(best.away), moving: r2(best.moving), lost, units: units.length },
        outcome: { ...o, paid: later < before || (later === 0 && !rout) ? 1 : 0 },
      });
      if (!m) continue;
      // Pursuit by the enemy: moving the same way through it, not falling behind by half its way.
      const h = norm(end.cx - st0.cx, end.cz - st0.cz);
      const way = Math.hypot(end.cx - st0.cx, end.cz - st0.cz);
      const pursuers = enemy.filter((u) => {
        let same = 0;
        let k = 0;
        for (let s = sStart; s <= s1; s++) {
          const kk = s * f.N + u;
          if (!f.alive[kk]) continue;
          k++;
          const vx = ctx.G.VX[kk];
          const vz = ctx.G.VZ[kk];
          const v = Math.hypot(vx, vz);
          if (v > mv && (vx * h[0] + vz * h[1]) / v >= 0.6) same++;
        }
        if (!k || same / k < 0.6) return false;
        const ka = sStart * f.N + u;
        const kb = s1 * f.N + u;
        if (!f.alive[ka] || !f.alive[kb]) return false;
        const da = Math.hypot(f.X[ka] - st0.cx, f.Z[ka] - st0.cz);
        const db = Math.hypot(f.X[kb] - end.cx, f.Z[kb] - end.cz);
        return db - da < 0.5 * way;
      });
      if (pursuers.length && conf >= 0.5) {
        const po = outcomeOf(ctx, pursuers, enemyTeam, T0, T1, 30);
        emit(ctx, {
          kind: 'pursuit',
          team: enemyTeam,
          against: g.team,
          dom: g.dom,
          s0: sStart,
          s1,
          confidence: 0.35 + 0.2 * clamp01(pursuers.length / 3) + 0.4 * conf - 0.1,
          units: pursuers,
          place: { x: end.cx, y: end.cy, z: end.cz, radius: R },
          paths: pursuers.slice(0, 8).map((u) => unitPath(f, u, sStart, s1)),
          outlines: [],
          evidence: { pursuers: pursuers.length, fleeing: units.length, wayM: r0(way / f.upm) },
          outcome: po,
        });
      }
    }
  }
}

/** Whether a unit stood (slower than walking) over steps `[s0, s1]`, on 90% of the steps it was alive. */
function stood(ctx: Ctx, u: number, s0: number, s1: number): boolean {
  const f = ctx.f;
  const mv = move(ctx, f.dom[u]);
  let n = 0;
  let still = 0;
  for (let s = Math.max(0, s0); s <= Math.min(f.S - 1, s1); s++) {
    if (!f.alive[s * f.N + u]) continue;
    n++;
    if (speedOf(ctx, s, u) <= mv) still++;
  }
  return n >= Math.max(2, (s1 - s0 + 1) * 0.6) && still / n >= 0.9;
}

/**
 * Defence in depth: five or more units of a side standing through a minute,
 * in two or more belts one behind the other along the enemy's axis (belts:
 * two or more units, half a range or more apart in depth, each laid across
 * the axis - wider than deep - and overlapping one another across it), a
 * range deep or more, with the enemy within three ranges of the front belt.
 * Kills from more than one belt, front first, make it surer.
 */
export function defenceInDepth(ctx: Ctx): void {
  const f = ctx.f;
  const W = Math.max(2, Math.round(60 / f.step));
  const teams = [...new Set(Array.from(f.team))].filter((t) => t >= 0);
  for (const team of teams) {
    const dom = dominant(ctx, team);
    const R = ctx.R[dom];
    const fam = 1;
    let last: { s1: number } | null = null;
    for (let s = 0; s + W < f.S; s += Math.max(1, W >> 1)) {
      if (last && s <= last.s1) continue;
      const mid = s + (W >> 1);
      const still = sideUnits(ctx, team, fam, mid).filter((u) => stood(ctx, u, s, s + W));
      if (still.length < 5) continue;
      // The enemy's axis: from its movers' centroid towards ours.
      const enemyMovers: number[] = [];
      for (let u = 0; u < f.N; u++) if (f.team[u] !== team && f.team[u] >= 0 && surface(f.dom[u]) === fam && f.alive[mid * f.N + u]) enemyMovers.push(u);
      const ac = centroid(f, enemyMovers, mid);
      const bc = centroid(f, still, mid);
      if (!ac || !bc) continue;
      const u = norm(bc[0] - ac[0], bc[2] - ac[2]);
      if (!(u[0] || u[1])) continue;
      const pts = still
        .map((w) => {
          const k = mid * f.N + w;
          return { w, al: (f.X[k] - bc[0]) * u[0] + (f.Z[k] - bc[2]) * u[1], cr: -(f.X[k] - bc[0]) * u[1] + (f.Z[k] - bc[2]) * u[0] };
        })
        .sort((a, b) => a.al - b.al);
      const belts: (typeof pts)[] = [[pts[0]]];
      for (let i = 1; i < pts.length; i++) {
        if (pts[i].al - pts[i - 1].al >= 0.5 * R) belts.push([]);
        belts[belts.length - 1].push(pts[i]);
      }
      const real = belts.filter((b) => {
        if (b.length < 2) return false;
        const dep = b[b.length - 1].al - b[0].al;
        const cs = b.map((p) => p.cr);
        return Math.max(...cs) - Math.min(...cs) >= Math.max(2 * dep, 0.3 * R);
      });
      if (real.length < 2) continue;
      const depth = real[real.length - 1][real[real.length - 1].length - 1].al - real[0][0].al;
      if (depth < R) continue;
      const overlap = (a: typeof pts, b: typeof pts) => {
        const a0 = Math.min(...a.map((p) => p.cr));
        const a1 = Math.max(...a.map((p) => p.cr));
        const b0 = Math.min(...b.map((p) => p.cr));
        const b1 = Math.max(...b.map((p) => p.cr));
        return (Math.min(a1, b1) - Math.max(a0, b0)) / Math.max(1e-9, Math.min(a1 - a0, b1 - b0));
      };
      let ok = true;
      for (let i = 1; i < real.length; i++) if (overlap(real[i - 1], real[i]) < 0.5) ok = false;
      if (!ok) continue;
      // The front belt is the one nearest the enemy (lowest along the axis from it).
      const front = real[0];
      const fc = centroid(
        f,
        front.map((p) => p.w),
        mid,
      )!;
      const enemyNear = unitsNear(ctx, mid, fc[0], fc[2], 3 * R, team, fam);
      if (!enemyNear.length) continue;
      // The enemy coming on: its units near the front moving towards the belts on average.
      let adv = 0;
      for (const e of enemyNear) {
        const k = mid * f.N + e;
        adv += (ctx.G.VX[k] * u[0] + ctx.G.VZ[k] * u[1]) > move(ctx, f.dom[e]) ? 1 : 0;
      }
      if (adv === 0) continue;
      // How far the episode lasts: while the belts' units still stand.
      let s1 = s + W;
      while (s1 + W < f.S && still.filter((w) => stood(ctx, w, s1, s1 + (W >> 1))).length >= still.length * 0.6) s1 += W >> 1;
      const beltKills = real.map((b) => b.reduce((n, p) => n + countIn(ctx.killsBy.get(p.w), dataT(f, s), dataT(f, s1)), 0));
      const beltTimes = real.map((b) => {
        const ts = b.flatMap((p) => (ctx.killsBy.get(p.w) ?? []).filter((t) => t >= dataT(f, s) && t <= dataT(f, s1)));
        return ts.length ? ts.reduce((a, t) => a + t, 0) / ts.length : NaN;
      });
      const firing = beltKills.filter((k) => k > 0).length;
      if (!firing) continue;
      const ordered = beltTimes.every((t, i) => i === 0 || !(t === t) || !(beltTimes[i - 1] === beltTimes[i - 1]) || t >= beltTimes[i - 1]);
      // Sure only when two belts or more fired: belts that never engage are a scatter of campers.
      const conf = firing >= 2 ? 0.55 + 0.15 * (real.length >= 3 ? 1 : 0) + 0.15 * (ordered ? 1 : 0) + 0.15 * clamp01((depth - R) / R) : 0.42;
      const units = real.flatMap((b) => b.map((p) => p.w));
      emit(ctx, {
        kind: 'defenceInDepth',
        team,
        against: f.team[enemyMovers[0]] ?? -1,
        dom,
        s0: s,
        s1,
        confidence: conf,
        units,
        place: { x: bc[0], y: bc[1], z: bc[2], radius: depth / 2 + R * 0.5 },
        paths: [[[ac[0], ac[1], ac[2]] as [number, number, number], [bc[0], bc[1], bc[2]] as [number, number, number]]],
        outlines: real.map((b) =>
          outlineOf(
            f,
            b.map((p) => p.w),
            mid,
            R * 0.1,
          ),
        ),
        evidence: { belts: real.length, depthM: r0(depth / f.upm), standing: units.length, beltKills: beltKills.join('/'), frontFirst: firing >= 2 ? (ordered ? 'yes' : 'no') : '-' },
        tail: 30,
      });
      last = { s1 };
    }
  }
}

/**
 * Reverse slope: kills by a unit that stood for 20 s at a range under 0.6
 * of the match's, of a victim that came over a crest - its height rose and
 * then fell by 2 m or more in the 20 s before it died - while the killer
 * stood lower than that crest. Three or more for a side.
 */
export function reverseSlope(ctx: Ctx): void {
  const f = ctx.f;
  const by = new Map<number, { s: number; killer: number; victim: number }[]>();
  for (const p of ctx.pairs) {
    if (f.dom[p.victim] === AIR || f.dom[p.killer] === AIR || f.dom[p.victim] === SEA) continue;
    const s = Math.max(0, Math.round((p.t - f.start) / f.step) - 1);
    const kk = s * f.N + p.killer;
    const kv = s * f.N + p.victim;
    if (!f.alive[kk] || !f.alive[kv]) continue;
    const R = ctx.R[f.dom[p.victim]];
    if (Math.hypot(f.X[kk] - f.X[kv], f.Z[kk] - f.Z[kv]) > 0.6 * R) continue;
    const back = Math.round(20 / f.step);
    if (!stood(ctx, p.killer, s - back, s)) continue;
    let top = -Infinity;
    let first = NaN;
    for (let q = Math.max(0, s - back); q <= s; q++) {
      const k = q * f.N + p.victim;
      if (!f.alive[k]) continue;
      if (!(first === first)) first = f.Y[k];
      top = Math.max(top, f.Y[k]);
    }
    const climb = 2 * f.upm;
    if (!(top - first >= climb && top - f.Y[kv] >= climb && f.Y[kk] < top)) continue;
    let l = by.get(p.kTeam);
    if (!l) by.set(p.kTeam, (l = []));
    l.push({ s, killer: p.killer, victim: p.victim });
  }
  for (const [team, l] of by) {
    if (l.length < 3) continue;
    const killers = [...new Set(l.map((x) => x.killer))];
    const c = centroid(f, killers, l[l.length >> 1].s) ?? [f.X[l[0].s * f.N + l[0].killer], f.Y[l[0].s * f.N + l[0].killer], f.Z[l[0].s * f.N + l[0].killer]];
    const dom = f.dom[l[0].killer];
    emit(ctx, {
      kind: 'reverseSlope',
      team,
      against: f.team[l[0].victim],
      dom,
      s0: l[0].s,
      s1: l[l.length - 1].s,
      confidence: 0.45 + 0.3 * clamp01((l.length - 3) / 5) + 0.15 * clamp01(killers.length / 3),
      units: killers,
      place: { x: c[0], y: c[1], z: c[2], radius: ctx.R[dom] },
      paths: l.slice(0, 10).map((x) => unitPath(f, x.victim, Math.max(0, x.s - Math.round(20 / f.step)), x.s)),
      outlines: [],
      evidence: { crestKills: l.length, killers: killers.length },
      tail: 0,
    });
  }
}

/**
 * Ambush: a group moving into range of enemies that had stood for 45 s or
 * more (ground; infantry 15 s): the first shot in the engagement is the
 * standing side's, and the movers lose two units or half the group within
 * 20 s (infantry 8 s), more than the ambushers lose.
 */
export function ambush(ctx: Ctx): void {
  const f = ctx.f;
  const seen = new Set<string>();
  for (const c of ctx.contacts) {
    const g = c.g;
    if (g.dom === AIR) continue;
    const st = at(g, c.s);
    if (!st) continue;
    const mv = move(ctx, g.dom);
    if (Math.hypot(st.vx, st.vz) < mv) continue;
    const R = ctx.R[g.dom];
    const fam = surface(g.dom);
    const k = c.s * f.N + c.near;
    const amb = unitsNear(ctx, c.s, f.X[k], f.Z[k], 1.5 * R, g.team, fam).filter((u) => f.team[u] === c.enemyTeam);
    const hold = Math.round((g.dom === INF ? 15 : 45) / f.step);
    const still = amb.filter((u) => stood(ctx, u, c.s - hold, c.s));
    if (!still.length) continue;
    const burst = g.dom === INF ? 8 : 20;
    const T0 = dataT(f, c.s) - 5;
    const T1 = dataT(f, c.s) + burst;
    // First shot in the engagement.
    let firstA = Infinity;
    let firstB = Infinity;
    for (const u of st.members) for (const m of [ctx.firesBy, ctx.killsBy]) for (const t of m.get(u) ?? []) if (t >= T0 && t <= T1) firstA = Math.min(firstA, t);
    for (const u of still) for (const m of [ctx.firesBy, ctx.killsBy]) for (const t of m.get(u) ?? []) if (t >= T0 && t <= T1) firstB = Math.min(firstB, t);
    if (!(firstB < firstA)) continue;
    let lossA = 0;
    let lossB = 0;
    for (const u of st.members) lossA += countIn(ctx.deathsOf.get(u), T0, T1);
    for (const u of still) lossB += countIn(ctx.deathsOf.get(u), T0, T1);
    if (lossA < Math.min(2, Math.ceil(st.members.length / 2)) || lossA <= lossB) continue;
    // The ambushers did the killing: kills paired with the victims' deaths.
    if (!foughtBetween(ctx, still, st.members, T0, T1, { x: f.X[k], z: f.Z[k], r: 2 * R })) continue;
    const key = `${still.slice().sort().join(',')}:${Math.floor(c.s / Math.max(1, hold))}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const sc = centroid(f, still, c.s)!;
    const conf = 0.5 + 0.2 * clamp01((lossA - 1) / 3) + 0.15 * (still.length >= 2 ? 1 : 0) + 0.15 * (lossB === 0 ? 1 : 0);
    const kills = still.reduce((n, u) => n + countIn(ctx.killsBy.get(u), T0, T1), 0);
    emit(ctx, {
      kind: 'ambush',
      team: c.enemyTeam,
      against: g.team,
      dom: g.dom,
      s0: c.s,
      s1: Math.min(f.S - 1, c.s + Math.round(burst / f.step)),
      confidence: conf,
      units: still,
      place: { x: sc[0], y: sc[1], z: sc[2], radius: 1.5 * R },
      paths: [pathOf(g, Math.max(0, c.s - stepsOf(ctx, g.dom, 30)), c.s)],
      outlines: [outlineOf(f, still, c.s, R * 0.1), outlineOf(f, st.members, c.s, R * 0.1)],
      evidence: { ambushers: still.length, victims: st.members.length, victimLosses: lossA, ambusherLosses: lossB, waitedS: r0(hold * f.step), firstShotLeadS: r0(firstA === Infinity ? burst : firstA - firstB) },
      outcome: {
        kills,
        losses: lossB,
        captures: 0,
        exchange: r2(lossB ? kills / lossB : kills + 1),
        baseline: r2(ctx.teamLosses[c.enemyTeam] ? ctx.teamKills[c.enemyTeam] / ctx.teamLosses[c.enemyTeam] : ctx.teamKills[c.enemyTeam] + 1),
        secs: burst,
        paid: workedOf(kills, lossB, 0),
        from: r1(T0 - f.m.t0),
        until: r1(T1 - f.m.t0),
      },
    });
  }
}

/**
 * Screen: a small element (one or two units) moving ahead of a main group of
 * three or more of its side - ahead along the group's heading by at least
 * twice the group's spread (and 0.4 ranges), at most four ranges, within 1.5
 * ranges across, heading the same way (cos >= 0.5) - for 45 s or more
 * (ground). Surer when the screen meets the enemy before the main body.
 */
export function screen(ctx: Ctx): void {
  const f = ctx.f;
  const need = (dom: number) => stepsOf(ctx, dom, 45);
  const done = new Set<string>();
  for (const M of ctx.G.list) {
    if (M.dom === AIR || M.maxSize < 3) continue;
    const R = ctx.R[M.dom];
    const mv = move(ctx, M.dom);
    const runs = new Map<number, { s0: number; s1: number; lead: number }>();
    const finish = (sid: number) => {
      const r = runs.get(sid);
      runs.delete(sid);
      if (!r || r.s1 - r.s0 + 1 < need(M.dom)) return;
      const S = ctx.G.list[sid];
      const key = `${M.id}:${sid}`;
      if (done.has(key)) return;
      done.add(key);
      // Who met the enemy first after the run began?
      const firstContact = (g: Group) => ctx.contacts.find((c) => c.g === g && c.s >= r.s0)?.s ?? Infinity;
      const cs = firstContact(S);
      const cm = firstContact(M);
      const first = cs < cm;
      const sStep = at(S, r.s1) ?? S.steps[S.steps.length - 1];
      const mStep = at(M, r.s1) ?? M.steps[M.steps.length - 1];
      const conf = 0.45 + 0.25 * (first && cs !== Infinity ? 1 : 0) + 0.15 * clamp01((r.s1 - r.s0 + 1 - need(M.dom)) / need(M.dom)) + 0.15 * clamp01(r.lead / (r.s1 - r.s0 + 1) / (2 * R));
      emit(ctx, {
        kind: 'screen',
        team: M.team,
        against: -1,
        dom: M.dom,
        s0: r.s0,
        s1: r.s1,
        confidence: conf,
        units: [...sStep.members],
        place: { x: sStep.cx, y: sStep.cy, z: sStep.cz, radius: R },
        paths: [pathOf(S, r.s0, r.s1), pathOf(M, r.s0, r.s1)],
        outlines: [outlineOf(f, mStep.members, r.s1, R * 0.1)],
        evidence: { screen: sStep.members.length, mainBody: mStep.members.length, leadM: r0(r.lead / (r.s1 - r.s0 + 1) / f.upm), secs: r0((r.s1 - r.s0) * f.step), contactFirst: cs === Infinity ? '-' : first ? 'yes' : 'no' },
        tail: 60,
      });
    };
    for (const st of M.steps) {
      const sp = Math.hypot(st.vx, st.vz);
      const seenNow = new Set<number>();
      if (st.members.length >= 3 && sp > mv) {
        const h = norm(st.vx, st.vz);
        const fam = surface(M.dom);
        for (let u = 0; u < f.N; u++) {
          if (f.team[u] !== M.team || surface(f.dom[u]) !== fam) continue;
          const k = st.s * f.N + u;
          if (!f.alive[k]) continue;
          const gid = ctx.G.at[k];
          if (gid < 0 || gid === M.id) continue;
          const S = ctx.G.list[gid];
          const ss = at(S, st.s);
          if (!ss || ss.members.length > 2 || ss.members[0] !== u) continue;
          const dx = ss.cx - st.cx;
          const dz = ss.cz - st.cz;
          const al = dx * h[0] + dz * h[1];
          const cr = Math.abs(-dx * h[1] + dz * h[0]);
          const vs = Math.hypot(ss.vx, ss.vz);
          if (al < Math.max(2 * st.spread, 0.4 * R) || al > 4 * R || cr > 1.5 * R || vs < mv || (ss.vx * h[0] + ss.vz * h[1]) / vs < 0.5) continue;
          seenNow.add(gid);
          const r = runs.get(gid);
          if (r && st.s - r.s1 <= 2) {
            r.s1 = st.s;
            r.lead += al;
          } else {
            if (r) finish(gid);
            runs.set(gid, { s0: st.s, s1: st.s, lead: al });
          }
        }
      }
      for (const gid of [...runs.keys()]) if (!seenNow.has(gid) && st.s - runs.get(gid)!.s1 > 2) finish(gid);
    }
    for (const gid of [...runs.keys()]) finish(gid);
  }
}

/**
 * Interior lines: every ~10 s where two sides each have two or more groups
 * of two or more, the mean distance between one side's groups against the
 * other's. A side whose groups are 0.6 times as far apart or closer, and
 * whose centre lies between the other's two biggest groups, on 30% or more
 * of those moments and a minute or more, fights on interior lines. The time
 * its units took to move between its groups (two ranges or more apart) is the
 * shift time.
 */
export function interiorLines(ctx: Ctx): void {
  const f = ctx.f;
  const every = Math.max(1, Math.round(10 / f.step));
  // Sides only: neutral map objects (an unassigned team) are not a side to stand between - while two sides remain.
  const none = new Set(f.m.sideless ?? []);
  const all = [...new Set(Array.from(f.team))].filter((t) => t >= 0);
  const sides = all.filter((t) => !none.has(t));
  const teams = sides.length >= 2 ? sides : all;
  if (teams.length < 2) return;
  const groupsAt = (team: number, s: number) =>
    ctx.G.list
      .filter((g) => g.team === team && g.dom !== AIR)
      .map((g) => at(g, s))
      .filter((x): x is NonNullable<typeof x> => !!x && x.members.length >= 2);
  for (const A of teams)
    for (const B of teams) {
      if (A === B) continue;
      let multi = 0;
      let inner = 0;
      const ratios: number[] = [];
      let s0 = -1;
      let s1 = -1;
      for (let s = 0; s < f.S; s += every) {
        const ga = groupsAt(A, s);
        const gb = groupsAt(B, s);
        if (ga.length < 2 || gb.length < 2) continue;
        multi++;
        const md = (l: typeof ga) => {
          let sum = 0;
          let n = 0;
          for (let i = 0; i < l.length; i++) for (let j = i + 1; j < l.length; j++) ((sum += Math.hypot(l[i].cx - l[j].cx, l[i].cz - l[j].cz)), n++);
          return sum / n;
        };
        const ra = md(ga) / Math.max(1e-9, md(gb));
        const big = gb.slice().sort((p, q) => q.members.length - p.members.length);
        const p = big[0];
        const q = big[1];
        const ax = ga.reduce((a, g) => a + g.cx * g.members.length, 0) / ga.reduce((a, g) => a + g.members.length, 0);
        const az = ga.reduce((a, g) => a + g.cz * g.members.length, 0) / ga.reduce((a, g) => a + g.members.length, 0);
        const L = Math.hypot(q.cx - p.cx, q.cz - p.cz);
        const tpar = L > 0 ? ((ax - p.cx) * (q.cx - p.cx) + (az - p.cz) * (q.cz - p.cz)) / (L * L) : -1;
        const perp = L > 0 ? Math.abs((ax - p.cx) * (q.cz - p.cz) - (az - p.cz) * (q.cx - p.cx)) / L : Infinity;
        ratios.push(ra);
        if (ra <= 0.6 && tpar > 0.15 && tpar < 0.85 && perp <= 0.5 * L) {
          inner++;
          if (s0 < 0) s0 = s;
          s1 = s;
        }
      }
      if (multi < 4 || inner / multi < 0.3 || (s1 - s0) * f.step < 60) continue;
      // Shift times: a unit leaving one of A's groups and joining another two ranges or more away.
      const shifts: number[] = [];
      const dom = dominant(ctx, A);
      const R = ctx.R[dom];
      for (let u = 0; u < f.N; u++) {
        if (f.team[u] !== A) continue;
        let lastG = -1;
        let lastS = -1;
        let lastPos: [number, number] | null = null;
        for (let s = s0; s <= s1; s++) {
          const gid = ctx.G.at[s * f.N + u];
          if (gid < 0) continue;
          const g = ctx.G.list[gid];
          const st = at(g, s);
          if (!st || st.members.length < 2) continue;
          if (lastG >= 0 && gid !== lastG && lastPos && Math.hypot(st.cx - lastPos[0], st.cz - lastPos[1]) >= 2 * R) shifts.push((s - lastS) * f.step);
          lastG = gid;
          lastS = s;
          lastPos = [st.cx, st.cz];
        }
      }
      shifts.sort((a, b) => a - b);
      ratios.sort((a, b) => a - b);
      const units: number[] = [];
      for (let u = 0; u < f.N; u++) if (f.team[u] === A && f.alive[s0 * f.N + u]) units.push(u);
      const c = centroid(f, units, s0) ?? [0, 0, 0];
      const groups = groupsAt(A, s0);
      emit(ctx, {
        kind: 'interiorLines',
        team: A,
        against: B,
        dom,
        s0,
        s1,
        confidence: 0.45 + 0.25 * clamp01((inner / multi - 0.3) / 0.4) + 0.15 * clamp01((0.6 - ratios[ratios.length >> 1]) / 0.4) + 0.15 * (shifts.length >= 2 ? 1 : 0),
        units,
        place: { x: c[0], y: c[1], z: c[2], radius: 3 * R },
        paths: groups.slice(0, 6).map((st) => [[c[0], c[1], c[2]] as [number, number, number], [st.cx, st.cy, st.cz] as [number, number, number]]),
        outlines: groups.slice(0, 6).map((st) => outlineOf(f, st.members, s0, R * 0.1)),
        evidence: { share: r2(inner / multi), distanceRatio: r2(ratios[ratios.length >> 1]), shifts: shifts.length, shiftS: shifts.length ? r0(shifts[shifts.length >> 1]) : '-' },
        tail: 0,
      });
    }
}

/**
 * Tempo: for every contact, how long the group took to answer - a turn of
 * 45° or more, its speed changing by half, or its first shot - capped at a
 * minute. A side whose median answer is 1.5 times quicker than the other's,
 * over three or more contacts each, has the tempo (Mann-Whitney test on the
 * times; its p in the evidence).
 */
export function tempo(ctx: Ctx): void {
  const f = ctx.f;
  const by = new Map<number, { t: number; c: Contact }[]>();
  for (const c of ctx.contacts) {
    const g = c.g;
    const i = g.steps.findIndex((x) => x.s === c.s);
    if (i < 1) continue;
    const prev = g.steps[i - 1];
    const v0 = Math.hypot(prev.vx, prev.vz);
    const mv = move(ctx, g.dom);
    const cap = Math.round(60 / f.step);
    let rt = 60;
    const T0 = dataT(f, c.s);
    const st = g.steps[i];
    let shot = Infinity;
    for (const u of st.members) for (const t of ctx.firesBy.get(u) ?? []) if (t >= T0 && t < shot) shot = t;
    for (const u of st.members) for (const t of ctx.killsBy.get(u) ?? []) if (t >= T0 && t < shot) shot = t;
    for (let j = i + 1; j < g.steps.length && g.steps[j].s - c.s <= cap; j++) {
      const q = g.steps[j];
      const v = Math.hypot(q.vx, q.vz);
      const turned = v > mv && v0 > mv && (q.vx * prev.vx + q.vz * prev.vz) / (v * v0) < Math.cos(Math.PI / 4);
      const changed = Math.abs(v - v0) > 0.5 * Math.max(v, v0) && Math.max(v, v0) > mv;
      if (turned || changed) {
        rt = (q.s - c.s) * f.step;
        break;
      }
    }
    if (shot - T0 < rt) rt = shot - T0;
    let l = by.get(g.team);
    if (!l) by.set(g.team, (l = []));
    l.push({ t: rt, c });
  }
  const teams = [...by.keys()];
  for (const A of teams)
    for (const B of teams) {
      if (A >= B) continue;
      const a = by.get(A)!;
      const b = by.get(B)!;
      if (a.length < 5 || b.length < 5) continue;
      const med = (l: { t: number }[]) => {
        const s = l.map((x) => x.t).sort((p, q) => p - q);
        return s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
      };
      const ma = med(a);
      const mb = med(b);
      const fast = ma * 1.5 <= mb ? A : mb * 1.5 <= ma ? B : -1;
      if (fast < 0) continue;
      const p = mannWhitney(
        a.map((x) => x.t),
        b.map((x) => x.t),
      );
      const fl = fast === A ? a : b;
      const sl = fast === A ? b : a;
      const units = [...new Set(fl.flatMap((x) => [...(at(x.c.g, x.c.s)?.members ?? [])]))];
      const first = fl[0].c;
      const st = at(first.g, first.s)!;
      const o = outcomeOf(ctx, units, fast, dataT(f, fl[0].c.s), dataT(f, fl[fl.length - 1].c.s), 60);
      emit(ctx, {
        kind: 'tempo',
        team: fast,
        against: fast === A ? B : A,
        dom: first.g.dom,
        s0: fl[0].c.s,
        s1: fl[fl.length - 1].c.s,
        confidence: p > 0.05 ? 0.3 : 0.5 + 0.25 * clamp01((0.1 - p) / 0.09) + 0.15 * clamp01((Math.min(a.length, b.length) - 3) / 7) + 0.1 * clamp01((Math.max(ma, mb) / Math.max(1, Math.min(ma, mb)) - 1.5) / 2),
        units,
        place: { x: st.cx, y: st.cy, z: st.cz, radius: ctx.R[first.g.dom] },
        paths: [],
        outlines: [],
        evidence: { reactS: r2(Math.min(ma, mb)), otherReactS: r2(Math.max(ma, mb)), contacts: fl.length, otherContacts: sl.length, p: r2(p) },
        outcome: o,
      });
    }
}

/** Two-sided Mann-Whitney U test, normal approximation with ties. */
export function mannWhitney(a: number[], b: number[]): number {
  const all = [...a.map((v) => ({ v, g: 0 })), ...b.map((v) => ({ v, g: 1 }))].sort((p, q) => p.v - q.v);
  const ranks = new Float64Array(all.length);
  let tie = 0;
  for (let i = 0; i < all.length; ) {
    let j = i;
    while (j + 1 < all.length && all[j + 1].v === all[i].v) j++;
    const r = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) ranks[k] = r;
    const t = j - i + 1;
    tie += t * t * t - t;
    i = j + 1;
  }
  let ra = 0;
  for (let i = 0; i < all.length; i++) if (all[i].g === 0) ra += ranks[i];
  const n1 = a.length;
  const n2 = b.length;
  const u = ra - (n1 * (n1 + 1)) / 2;
  const mu = (n1 * n2) / 2;
  const n = n1 + n2;
  const sd = Math.sqrt(((n1 * n2) / 12) * (n + 1 - tie / (n * (n - 1))));
  if (!(sd > 0)) return 1;
  const z = Math.abs(u - mu) / sd;
  return Math.min(1, 2 * (1 - phi(z)));
}

function phi(z: number): number {
  const t = 1 / (1 + 0.2316419 * z);
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2);
  return 1 - d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
}

/**
 * Formations: a group of three or more (air: two or more) whose shape is the
 * same on 60% or more of its moving steps, for 30 s or more (infantry 10 s).
 * Columns of three or more ships are the line of battle (`sea.ts`), lines of
 * three or more aircraft heading for the enemy the wall (`air.ts`).
 */
export function formations(ctx: Ctx): void {
  const f = ctx.f;
  const found: { g: Group; shape: string; s0: number; s1: number; n: number; share: number }[] = [];
  for (const g of ctx.G.list) {
    if (g.maxSize < (g.dom === AIR ? 2 : 3)) continue;
    const mv = move(ctx, g.dom);
    const counts = new Map<string, number>();
    let moving = 0;
    let s0 = Infinity;
    let s1 = -1;
    let n = 0;
    for (const st of g.steps) {
      if (st.members.length < (g.dom === AIR ? 2 : 3) || Math.hypot(st.vx, st.vz) < mv || !st.shape) continue;
      moving++;
      counts.set(st.shape, (counts.get(st.shape) ?? 0) + 1);
      s0 = Math.min(s0, st.s);
      s1 = Math.max(s1, st.s);
      n = Math.max(n, st.members.length);
    }
    if (!moving) continue;
    const [shape, c] = [...counts].sort((a, b) => b[1] - a[1])[0];
    if (shape === 'cluster' || c / moving < 0.6 || c * f.step < secs(g.dom, 30)) continue;
    found.push({ g, shape, s0, s1, n, share: c / moving });
  }
  found.sort((a, b) => b.n * (b.s1 - b.s0) - a.n * (a.s1 - a.s0));
  for (const x of found.slice(0, 24)) {
    if (x.g.dom === SEA && x.shape === 'column' && x.n >= 3) continue;
    const mid = x.g.steps[x.g.steps.length >> 1];
    const R = ctx.R[x.g.dom];
    emit(ctx, {
      kind: 'formation',
      variant: x.shape,
      team: x.g.team,
      against: -1,
      dom: x.g.dom,
      s0: x.s0,
      s1: x.s1,
      confidence: 0.4 + 0.3 * clamp01((x.share - 0.6) / 0.3) + 0.15 * clamp01((x.n - 3) / 3) + 0.15 * clamp01(((x.s1 - x.s0) * f.step) / secs(x.g.dom, 120)),
      units: [...x.g.units],
      place: { x: mid.cx, y: mid.cy, z: mid.cz, radius: Math.max(mid.spread * 2, R * 0.3) },
      paths: [pathOf(x.g, x.s0, x.s1)],
      outlines: [outlineOf(f, mid.members, mid.s, Math.max(mid.spread * 0.15, SCALE[x.g.dom].link * f.upm * 0.05))],
      evidence: { shape: x.shape, units: x.n, share: r2(x.share), secs: r0((x.s1 - x.s0) * f.step) },
      tail: 0,
    });
  }
  void timeOf;
}
