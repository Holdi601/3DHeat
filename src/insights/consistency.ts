/**
 * How a finding over many matches spreads over them: in how many matches it
 * holds, and how much of it the biggest one makes. A place that stands out in
 * the sum because one match was fought there is not a property of the map; a
 * pattern a coach can act on shows in match after match.
 *
 * Read from the pass's per-match tables (`pass.ts` `SessionTables`): events,
 * crossings and flank credits per match and mid cell, and each match's
 * presence on the coarse grid. A place's presence in one match is its coarse
 * cells' presence in that match, scaled by the place's part of those cells
 * over all matches.
 *
 * Pure, in the worker, after the detectors (`engine.ts`).
 */

import { COARSE, MID, type InsightJob } from './pass';
import type { Insight, InsightSpread } from './types';

/** How a finding's events are judged in one match. */
export type SpreadMode =
  /** More events of `kind` than the match's own rate predicts for the time spent there. */
  | { by: 'rate'; kind: number; hot: boolean }
  /** A larger share of kills among kills and deaths there than the map's. */
  | { by: 'kd'; kill: number; death: number; mapShare: number }
  /** Any events of `kind` (crossings, flank credits): where they come from. */
  | { by: 'count'; kind: number };

/** Mid cells of a coarse cell. */
export function midCellsOf(job: InsightJob, ci: number): number[] {
  const g = job.meta.grid;
  const R = COARSE / MID;
  const cx = ci % g.cx;
  const cz = Math.floor(ci / g.cx);
  const out: number[] = [];
  for (let dz = 0; dz < R; dz++)
    for (let dx = 0; dx < R; dx++) {
      const x = cx * R + dx;
      const z = cz * R + dz;
      if (x < g.mx && z < g.mz) out.push(z * g.mx + x);
    }
  return out;
}

/** The spread of a finding at `cells` (mid cells) over the matches, or null with one match or no tables. */
export function spreadOf(job: InsightJob, cells: readonly number[], mode: SpreadMode): InsightSpread | null {
  const st = job.sess;
  if (!st || st.full || !cells.length) return null;
  const g = job.meta.grid;
  const M = g.mx * g.mz;
  const C = g.cx * g.cz;
  const S = st.S;
  const at = (kind: number, s: number) => {
    let n = 0;
    for (const c of cells) n += st.ev.get((kind * S + s) * M + c) ?? 0;
    return n;
  };
  // The place's part of each coarse cell's presence, over all matches.
  let weights: Map<number, number> | null = null;
  if (mode.by === 'rate') {
    const R = COARSE / MID;
    const coarseOf = (mi: number) => Math.floor(Math.floor(mi / g.mx) / R) * g.cx + Math.floor((mi % g.mx) / R);
    const placeIn = new Map<number, number>();
    for (const c of cells) placeIn.set(coarseOf(c), (placeIn.get(coarseOf(c)) ?? 0) + job.mPres[c]);
    weights = new Map();
    for (const [ci, p] of placeIn) {
      let all = 0;
      for (const mi of midCellsOf(job, ci)) all += job.mPres[mi];
      if (all > 0) weights.set(ci, p / all);
    }
    if (C <= 0) return null;
  }
  let matches = 0;
  let active = 0;
  let holding = 0;
  let total = 0;
  let top = 0;
  for (let s = 0; s < S; s++) {
    if (job.sessAny && !job.sessAny[s]) continue;
    matches++;
    let n = 0;
    let holds = false;
    let counts = false;
    if (mode.by === 'rate') {
      n = at(mode.kind, s);
      const pres = st.pres[s];
      let here = 0;
      for (const [ci, w] of weights!) here += st.presC[s * C + ci] * w;
      const expected = pres > 0 ? (st.total[s * st.kinds + mode.kind] * here) / pres : 0;
      counts = n > 0 || expected >= 1;
      holds = mode.hot ? n > expected && n > 0 : n < expected;
    } else if (mode.by === 'kd') {
      const k = at(mode.kill, s);
      const d = at(mode.death, s);
      n = k + d;
      counts = n > 0;
      holds = n > 0 && k / n > mode.mapShare;
    } else {
      n = at(mode.kind, s);
      counts = n > 0;
      holds = n > 0;
    }
    if (counts) active++;
    if (counts && holds) holding++;
    total += n;
    if (n > top) top = n;
  }
  if (matches < 2) return null;
  return { matches, active, holding, topShare: total > 0 ? Math.round((top / total) * 1000) / 1000 : 0 };
}

/** The spread attached to a finding where its kind can be told per match. */
export function attachSpread(job: InsightJob, ins: Insight, killKind: number, deathKind: number, eventIndex: (name: string) => number): void {
  const cells = ins.cells;
  if (!cells?.length) return;
  const m = job.meta;
  const K = job.events[killKind] ?? 0;
  const D = job.events[deathKind] ?? 0;
  let mode: SpreadMode | null = null;
  if (ins.kind === 'power.kd' || ins.kind.startsWith('classPlace.')) {
    if (killKind >= 0 && deathKind >= 0) mode = { by: 'kd', kill: killKind, death: deathKind, mapShare: K + D > 0 ? K / (K + D) : 0.5 };
    // A class's weak ground: the share falls below the map's.
    if (mode && /weak|Weak/.test(ins.kind)) mode = { ...mode, mapShare: -1 };
  } else if (ins.kind === 'power.safe') {
    if (deathKind >= 0) mode = { by: 'rate', kind: deathKind, hot: false };
  } else if (ins.kind.startsWith('zones.')) {
    const k = eventIndex(ins.subject.eventKind ?? '');
    if (k >= 0) mode = { by: 'rate', kind: k, hot: ins.kind === 'zones.hot' };
  } else if (ins.kind === 'flow.choke') {
    mode = { by: 'count', kind: m.eventKinds };
  } else if (ins.kind === 'flow.flank') {
    mode = { by: 'count', kind: m.eventKinds + 1 };
  }
  if (!mode) return;
  let s = spreadOf(job, cells, mode);
  if (s && mode.by === 'kd' && mode.mapShare < 0) {
    // Weak ground holds in a match where the class's share there is below the map's.
    const inv = spreadOf(job, cells, { ...mode, mapShare: K + D > 0 ? K / (K + D) : 0.5 });
    if (inv) s = { ...s, holding: Math.max(0, s.active - inv.holding) };
  }
  if (s) ins.spread = s;
}
