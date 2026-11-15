/**
 * The movement analysis of a match, end to end: tracks on a common timeline,
 * groups, then every detector (`land.ts`, `air.ts`, `sea.ts`). Overlapping
 * finds of one kind by one side are merged, the most confident kept.
 */

import { airFormations, airPincer, closeFights, missileDefence, orbits, strikes } from './air';
import { buildCtx } from './context';
import { AIR } from './frame';
import { ambush, approaches, attacks, bounding, defenceInDepth, encirclement, feint, formations, interiorLines, massing, penetration, reverseSlope, screen, tempo, withdrawal } from './land';
import { crossingT, lineOfBattle } from './sea';
import { DOMAINS, type GroupInfo, type Maneuver, type ManeuverMatch, type ManeuverReport, type MatchTracks } from './types';
import { ManeuverCollector } from './collect';

/** Maneuvers a match keeps at most, the most confident first. */
export const MAX_PER_MATCH = 200;

export function analyseMatch(m: MatchTracks, now: () => number = () => performance.now()): ManeuverMatch | null {
  const t0 = now();
  const ctx = buildCtx(m);
  if (!ctx) return null;
  const f = ctx.f;
  const timings: Record<string, number> = { setup: Math.round(now() - t0) };
  const steps: [string, () => void][] = [
    ['approaches', () => approaches(ctx, attacks(ctx))],
    ['encirclement', () => encirclement(ctx)],
    ['penetration', () => penetration(ctx)],
    ['bounding', () => bounding(ctx)],
    ['massing', () => massing(ctx)],
    ['feint', () => feint(ctx)],
    ['withdrawal', () => withdrawal(ctx)],
    ['depth', () => defenceInDepth(ctx)],
    ['reverseSlope', () => reverseSlope(ctx)],
    ['ambush', () => ambush(ctx)],
    ['screen', () => screen(ctx)],
    ['interior', () => interiorLines(ctx)],
    ['tempo', () => tempo(ctx)],
    ['formations', () => formations(ctx)],
    ['missile', () => missileDefence(ctx)],
    ['airPincer', () => airPincer(ctx)],
    ['airFormations', () => airFormations(ctx)],
    ['orbits', () => orbits(ctx)],
    ['closeFights', () => closeFights(ctx)],
    ['strikes', () => strikes(ctx)],
    ['line', () => lineOfBattle(ctx)],
    ['crossingT', () => crossingT(ctx)],
  ];
  const hasAir = Array.from(f.dom).some((d) => d === AIR);
  for (const [name, run] of steps) {
    if (!hasAir && ['missile', 'airPincer', 'airFormations', 'orbits', 'closeFights', 'strikes'].includes(name)) continue;
    const ts = now();
    try {
      run();
      timings[name] = Math.round(now() - ts);
    } catch (e) {
      // A detector that fails leaves the others' finds standing.
      if (typeof console !== 'undefined') console.warn(`maneuver detector ${name} failed`, e);
    }
  }
  const maneuvers = merge(ctx.out).sort((a, b) => a.t0 - b.t0 || b.confidence - a.confidence);
  const kept = maneuvers.length > MAX_PER_MATCH ? maneuvers.slice().sort((a, b) => b.confidence - a.confidence).slice(0, MAX_PER_MATCH).sort((a, b) => a.t0 - b.t0) : maneuvers;
  const groups: GroupInfo[] = ctx.G.list
    .filter((g) => g.maxSize >= 2 && g.steps.length >= 3)
    .map((g) => {
      const shapes = new Map<string, number>();
      let dist = 0;
      for (let i = 0; i < g.steps.length; i++) {
        const st = g.steps[i];
        if (st.shape) shapes.set(st.shape, (shapes.get(st.shape) ?? 0) + 1);
        if (i) dist += Math.hypot(st.cx - g.steps[i - 1].cx, st.cz - g.steps[i - 1].cz);
      }
      const shape = [...shapes].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'cluster';
      const secs = (g.steps[g.steps.length - 1].s - g.steps[0].s) * f.step;
      return {
        id: g.id,
        team: g.team,
        domain: DOMAINS[g.dom],
        units: g.maxSize,
        t0: Math.round(g.steps[0].s * f.step + f.start - m.t0),
        t1: Math.round(g.steps[g.steps.length - 1].s * f.step + f.start - m.t0),
        formation: shape as GroupInfo['formation'],
        speed: secs > 0 ? Math.round((dist / secs) * 100) / 100 : 0,
        distance: Math.round(dist),
      };
    })
    .sort((a, b) => b.units * (b.t1 - b.t0) - a.units * (a.t1 - a.t0))
    .slice(0, 60);
  const range: ManeuverMatch['range'] = {};
  for (let d = 0; d < DOMAINS.length; d++) if (Array.from(f.dom).some((x) => x === d)) range[DOMAINS[d]] = Math.round(ctx.R[d]);
  return { session: m.session, start: m.t0, duration: Math.round(f.duration), range, step: f.step, groups, maneuvers: kept, ms: Math.round(now() - t0), timings };
}

/** Finds of one kind by one side that overlap in time and place: the most confident stands for them. */
function merge(list: Maneuver[]): Maneuver[] {
  const byKey = new Map<string, Maneuver[]>();
  for (const m of list) {
    const k = `${m.kind}:${m.team}`;
    let l = byKey.get(k);
    if (!l) byKey.set(k, (l = []));
    l.push(m);
  }
  const out: Maneuver[] = [];
  for (const l of byKey.values()) {
    l.sort((a, b) => b.confidence - a.confidence);
    const kept: Maneuver[] = [];
    for (const m of l) {
      const dup = kept.find(
        (k) =>
          m.t0 <= k.t1 &&
          k.t0 <= m.t1 &&
          Math.hypot(m.place.x - k.place.x, m.place.z - k.place.z) <= Math.max(m.place.radius, k.place.radius) &&
          // Missile defences and close fights are each one aircraft's: only its own repeat merges.
          (!['crank', 'notch', 'drag', 'pump', 'energyFight', 'anglesFight'].includes(m.kind) || m.units[0] === k.units[0]),
      );
      if (!dup) kept.push(m);
    }
    out.push(...kept);
  }
  return out;
}

export function analyseAll(list: MatchTracks[], now: () => number = () => performance.now()): ManeuverReport {
  const t0 = now();
  const matches: ManeuverMatch[] = [];
  let units = 0;
  for (const m of list) {
    units += m.units.length;
    const r = analyseMatch(m);
    if (r) matches.push(r);
  }
  return { schema: 'heat3d.maneuvers/1', matches, units, elapsedMs: Math.round(now() - t0) };
}

export function finishManeuvers(c: ManeuverCollector, teams: number): ManeuverReport {
  return analyseAll(c.finish(teams));
}
