/**
 * Null models for the movement analysis, built from a match's own tracks:
 * the same movement with the interaction between the sides broken, so any
 * maneuver still found there is what chance and the map's shape make of it.
 * The detectors are calibrated so that medium-confidence finds are rare on
 * these (`calibrate` below, `maneuver.test.ts`, docs/maneuver.md).
 *
 *   teams    team labels shuffled over the units, sizes kept
 *   shift    one side's whole timeline (either side) turned round by a third to two thirds
 *            of the match (circular), so its moves meet the other side's at
 *            other moments
 *   rotate   one side's tracks turned round the match's centre by 90-270°,
 *            so its fronts face another way
 *
 * The engagement ranges of the real match are kept (`MatchTracks.ranges`):
 * a null's kills no longer pair with deaths.
 */

import { rng } from './synth';
import type { MatchTracks, MEvent, UnitTrack } from './types';

export const NULL_KINDS = ['teams', 'shift', 'rotate'] as const;
export type NullKind = (typeof NULL_KINDS)[number];

/** The side moved: the biggest (`which` 0) or the second-biggest (1); -1 with one side, nothing to break. */
const sideOf = (m: MatchTracks, which: number): number => {
  const n = new Map<number, number>();
  for (const u of m.units) if (u.team >= 0) n.set(u.team, (n.get(u.team) ?? 0) + 1);
  const s = [...n].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  return s.length >= 2 ? s[Math.min(1, which)][0] : -1;
};

export function nullMatch(m: MatchTracks, kind: NullKind, seed: number, ranges?: number[], which = 1): MatchTracks {
  const r = rng(seed);
  const units = m.units.map((u) => ({ ...u }));
  let events: MEvent[] = m.events.map((e) => ({ ...e }));
  const byId = new Map(units.map((u) => [u.id, u]));
  if (kind === 'teams') {
    const teams = units.map((u) => u.team);
    for (let i = teams.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [teams[i], teams[j]] = [teams[j], teams[i]];
    }
    units.forEach((u, i) => (u.team = teams[i]));
    for (const e of events) {
      const u = byId.get(e.unit);
      if (u) e.team = u.team;
    }
  } else {
    const side = sideOf(m, which);
    if (side < 0) return { ...m, units, events, ranges };
    let lo = Infinity;
    let hi = -Infinity;
    let cx = 0;
    let cz = 0;
    let n = 0;
    for (const u of units) {
      lo = Math.min(lo, u.t[0]);
      hi = Math.max(hi, u.t[u.t.length - 1]);
      for (let i = 0; i < u.t.length; i += 8) {
        cx += u.x[i];
        cz += u.z[i];
        n++;
      }
    }
    cx /= Math.max(1, n);
    cz /= Math.max(1, n);
    const T = hi - lo;
    const dt = T * (1 / 3 + r() / 3);
    const ang = (Math.PI / 2) * (1 + 2 * r());
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    const moveT = (t: number) => lo + ((t - lo + dt) % T);
    for (const u of units) {
      if (u.team !== side) continue;
      if (kind === 'shift') {
        // Turned round: re-sorted so the samples stay in time order (the wrap is a gap, held as one).
        const idx = Array.from(u.t, (_, i) => i).sort((a, b) => moveT(u.t[a]) - moveT(u.t[b]));
        const pick = <A extends Float64Array | Float32Array>(a: A, f: (v: number) => number = (v) => v): A => {
          const b = new (a.constructor as new (n: number) => A)(a.length);
          idx.forEach((k, i) => (b[i] = f(a[k])));
          return b;
        };
        Object.assign(u, { t: pick(u.t, moveT), x: pick(u.x), y: pick(u.y), z: pick(u.z) } satisfies Partial<UnitTrack>);
      } else {
        const x = new Float32Array(u.x.length);
        const z = new Float32Array(u.z.length);
        for (let i = 0; i < x.length; i++) {
          const dx = u.x[i] - cx;
          const dz = u.z[i] - cz;
          x[i] = cx + dx * c - dz * s;
          z[i] = cz + dx * s + dz * c;
        }
        u.x = x;
        u.z = z;
      }
    }
    events = events.map((e) => {
      const u = byId.get(e.unit);
      if (!u || u.team !== side) return e;
      if (kind === 'shift') return { ...e, t: moveT(e.t) };
      const dx = e.x - cx;
      const dz = e.z - cz;
      return { ...e, x: cx + dx * c - dz * s, z: cz + dx * s + dz * c };
    });
    events.sort((a, b) => a.t - b.t);
  }
  return { ...m, units, events, ranges };
}
