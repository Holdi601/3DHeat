/**
 * The page's side of the outcome analysis (docs/outcome-analysis.md): runs
 * it in the mass worker (`massWorker.ts`, progress and cancel there), keeps
 * what the panel shows - the group, the side, the window or moment, the
 * finding picked - and puts the zones and routes in the 3D view as lines
 * (`outcome/view.ts`), made once a selection, never on the frame path.
 */

import { create } from 'zustand';
import { outcomeColumns } from '../data/outcome';
import { sourceSeconds } from '../data/reshape';
import type { Engine } from '../render/engine';
import { useStore } from '../state/store';
import type { OutcomeFinding } from '../outcome/analyze';
import { outcomeLines, type OutcomeMap } from '../outcome/view';
import { askMass, drillDown, postMass, useMass } from './client';
import type { OutcomeResult } from './massWorker';
import { usePlaceLines } from './placeLines';

export interface OutcomeState {
  result: OutcomeResult | null;
  /** The filter the result is of. */
  resultKey: string | null;
  running: boolean;
  error: string | null;
  /** Work out the moves of matches whose summaries lack them (reads their tables). */
  compute: boolean;
  group: string | null;
  side: number;
  /** Zones by a window of the round, or at a moment of it (the time slider). */
  by: 'window' | 'moment';
  window: number;
  slice: number;
  map: OutcomeMap | null;
  focus: string | null;
  set: (p: Partial<OutcomeState>) => void;
}

export const useOutcome = create<OutcomeState>((set) => ({
  result: null,
  resultKey: null,
  running: false,
  error: null,
  compute: false,
  group: null,
  side: 0,
  by: 'window',
  window: 1,
  slice: 2,
  map: null,
  focus: null,
  set: (p) => set(p),
}));

if (import.meta.env.DEV) (globalThis as { __outcome?: typeof useOutcome }).__outcome = useOutcome;

/** Runs the analysis on the mass panel's filter. */
export async function runOutcome(engine: Engine | null): Promise<void> {
  const st = useOutcome.getState();
  if (st.running) return;
  st.set({ running: true, error: null });
  const filter = useMass.getState().filter;
  try {
    const result = await askMass<OutcomeResult>({ type: 'outcome', filter, compute: st.compute }, 'outcome');
    const g = result.report.groups.slice().sort((a, b) => b.matches - a.matches)[0];
    const keep = st.group && result.report.groups.some((x) => x.key === st.group) ? st.group : (g?.key ?? null);
    useOutcome.getState().set({ result, resultKey: JSON.stringify(filter), group: keep, focus: null });
    await refreshOutcomeMap(engine, true);
  } catch (e) {
    const msg = (e as Error).message;
    useOutcome.getState().set({ error: msg === 'cancelled' ? null : msg });
  } finally {
    useOutcome.getState().set({ running: false });
    useMass.getState().set({ progress: null });
  }
}

export function cancelOutcome(): void {
  postMass({ type: 'outcomeCancel' });
}

/** The finding picked, from the last result. */
export function focusedFinding(): OutcomeFinding | null {
  const s = useOutcome.getState();
  return s.result?.report.findings.find((f) => f.id === s.focus) ?? null;
}

/** Asks the worker for the selection's zones and routes and draws them; `frame` puts the camera over them. */
export async function refreshOutcomeMap(engine: Engine | null, frame = false): Promise<void> {
  const s = useOutcome.getState();
  if (!s.result || !s.group) {
    clearOutcomeLines(engine);
    return;
  }
  const sel = s.by === 'window' ? { window: s.window } : { slice: s.slice };
  const map = await askMass<OutcomeMap | null>({ type: 'outcomeMap', group: s.group, side: s.side, ...sel }, 'outcomeMap');
  useOutcome.getState().set({ map });
  drawOutcome(engine);
  if (frame && map && engine && map.zones.length) {
    let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity, y = 0;
    for (const z of map.zones) {
      x0 = Math.min(x0, z.x0);
      z0 = Math.min(z0, z.z0);
      x1 = Math.max(x1, z.x1);
      z1 = Math.max(z1, z.z1);
      y += z.y / map.zones.length;
    }
    engine.frameAround((x0 + x1) / 2, y, (z0 + z1) / 2, Math.max(x1 - x0, z1 - z0) * 0.35);
  }
}

/** The lines of the current selection, the focused finding full. */
export function drawOutcome(engine: Engine | null): void {
  const s = useOutcome.getState();
  const focus = focusedFinding();
  const m = s.map;
  const heightAt = (x: number, z: number) => {
    if (!m || !m.zones.length) return 0;
    let best = m.zones[0], bd = Infinity;
    for (const zn of m.zones) {
      const d = Math.hypot((zn.x0 + zn.x1) / 2 - x, (zn.z0 + zn.z1) / 2 - z);
      if (d < bd) [bd, best] = [d, zn];
    }
    return best.y;
  };
  usePlaceLines.getState().set({ lines: outcomeLines(m, focus && focus.group === s.group ? focus : null, heightAt), focus: null });
  engine?.invalidate(2);
}

export function clearOutcomeLines(engine: Engine | null): void {
  usePlaceLines.getState().set({ lines: null, focus: null });
  engine?.invalidate(2);
}

/** Puts the camera on a finding's place. */
export function frameFinding(engine: Engine | null, f: OutcomeFinding): void {
  if (!engine) return;
  if (f.zone) engine.frameAround((f.zone.x0 + f.zone.x1) / 2, f.zone.y, (f.zone.z0 + f.zone.z1) / 2, (f.zone.x1 - f.zone.x0) * 3);
  else if (f.path) {
    let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
    for (let k = 0; k + 1 < f.path.length; k += 2) {
      x0 = Math.min(x0, f.path[k]);
      x1 = Math.max(x1, f.path[k]);
      z0 = Math.min(z0, f.path[k + 1]);
      z1 = Math.max(z1, f.path[k + 1]);
    }
    const y = useOutcome.getState().map?.zones[0]?.y ?? 0;
    engine.frameAround((x0 + x1) / 2, y, (z0 + z1) / 2, Math.max(x1 - x0, z1 - z0) * 0.8 + 20);
  } else if (f.point) engine.frameAround(f.point[0], useOutcome.getState().map?.zones[0]?.y ?? 0, f.point[1], 200);
}

/** Matches loaded for a comparison at most: an even spread of those with the pattern. */
export const COMPARE_MATCHES = 60;

/**
 * The matches with the pattern loaded into the view, the side's winners
 * against its losers as the difference (won on +, lost on -), the team picked
 * where the sides are the data's teams.
 */
export async function compareFinding(engine: Engine | null, f: OutcomeFinding): Promise<number> {
  const step = Math.max(1, f.matches.length / COMPARE_MATCHES);
  const pick: number[] = [];
  for (let k = 0; k < f.matches.length && pick.length < COMPARE_MATCHES; k += step) pick.push(f.matches[Math.floor(k)]);
  const g = useOutcome.getState().result?.report.groups.find((x) => x.key === f.group);
  const n = await drillDown(engine, { drill: { matches: pick, ...(g?.sidesBy === 'team' ? { team: f.sideName } : {}) } });
  const ds = useStore.getState().dataset;
  if (ds) {
    const o = outcomeColumns(ds);
    const col = o.match ?? o.round;
    if (col) {
      const st = useStore.getState();
      st.setSplit({ kind: 'range', column: col.name, positive: [1, 1], negative: [0, 0] });
      st.patchHeat({ splitRate: false });
      st.setMode('heat-difference');
    }
  }
  frameFinding(engine, f);
  drawOutcome(engine);
  return n;
}

/** One example match loaded, the clock at the moment the pattern is about. */
export async function openExample(engine: Engine | null, f: OutcomeFinding, k: number): Promise<void> {
  const ex = f.examples[k];
  if (!ex) return;
  await drillDown(engine, { drill: { match: ex.match } });
  const ds = useStore.getState().dataset;
  if (ds?.time) {
    const st = useStore.getState();
    if (st.timeline.mode === 'all') st.patchTimeline({ mode: 'play' });
    // The summary's times are the file's own seconds; the dataset's count from its origin.
    st.seek(ex.t0 + ex.at - sourceSeconds(ds, 0));
  }
  frameFinding(engine, f);
  drawOutcome(engine);
}
