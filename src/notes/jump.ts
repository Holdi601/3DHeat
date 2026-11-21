/**
 * A click on a note (or a document's block) goes there: the workspace it was
 * made on, the view it was made in - camera, mode, filters, time, selection -
 * and then the anchor itself on the loaded data: the unit selected, the match
 * or round picked, the playhead at its moment, the camera on its place when
 * the note kept no view. Returns what could not be found, in words, so the
 * panel can say so.
 */

import type { Engine } from '../render/engine';
import { useInsights } from '../insights/store';
import { toFilterSpec } from '../insights/apply';
import type { InsightFilter } from '../insights/types';
import { matchesOf, pickMatches } from '../match/matches';
import { usePlanStore } from '../state/planStore';
import { useRaceStore } from '../state/raceStore';
import { useReplayStore } from '../state/replayStore';
import { applyView, type ViewState } from '../state/savedViews';
import { useStore } from '../state/store';
import type { FilterSpec } from '../state/types';
import { readPlan } from '../tactics/plan';
import { resolveAnchor, type Anchor, type Resolved } from './anchors';

type Tab = 'heat' | 'race' | 'match' | 'plan' | 'vehicle';

const later = (fn: () => void) => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(() => requestAnimationFrame(fn)) : setTimeout(fn, 0));

/** The findings of the current insight report, by id. */
export function currentFindings(): ReadonlyMap<string, { place: { x: number; y: number; z: number } | null }> | undefined {
  const rep = useInsights.getState().report;
  if (!rep) return undefined;
  return new Map(rep.insights.map((i) => [i.id, { place: i.place ? { x: i.place.x, y: i.place.y, z: i.place.z } : null }]));
}

function looksLikeView(v: unknown): v is ViewState {
  const o = v as ViewState | undefined;
  return !!o && typeof o === 'object' && typeof o.mode === 'string' && !!o.camera && !!o.timeline;
}

/** Puts the anchor's own things in place on the loaded data (after the view, when there is one). */
function applyAnchor(engine: Engine, a: Anchor, r: Resolved, framed: boolean): void {
  const st = useStore.getState();
  const ds = st.dataset;
  if (a.kind === 'plan') {
    useRaceStore.getState().setTab('plan');
    try {
      usePlanStore.getState().replacePlan(readPlan(JSON.stringify(a.plan)));
    } catch {
      // Not a plan this viewer reads: the board stays as it is.
    }
    return;
  }
  if (a.kind === 'view') {
    if (looksLikeView(a.view)) applyView(engine, a.view);
    return;
  }
  if (a.kind === 'insight' && ds && !framed) {
    const specs = (a.filters as InsightFilter[]).map((f) => toFilterSpec(ds, f)).filter((f): f is FilterSpec => !!f);
    if (specs.length) st.setFilters([...st.filters.filter((f) => !specs.some((s) => s.kind === f.kind && ('column' in s ? 'column' in f && s.column === f.column : true))), ...specs]);
  }
  if (!ds) {
    if (r.point && !framed) engine.frameAround(r.point.x, r.point.y, r.point.z, 40);
    return;
  }
  if (r.match !== undefined) pickMatches(ds, [r.match]);
  if (r.session !== undefined && st.team.session !== r.session && (a.kind === 'round' || a.kind === 'time' || st.mode === 'team')) useStore.getState().patchTeam({ session: r.session });
  if (r.unit) {
    const rs = useReplayStore.getState();
    rs.select(r.unit);
  }
  const t = r.time ?? r.range?.[0];
  if (t !== undefined && ds.time) {
    // A moment in All mode shows everything at once: Play, so the time means something.
    if (useStore.getState().timeline.mode === 'all' && (a.kind === 'event' || a.kind === 'row' || a.kind === 'time')) useStore.getState().patchTimeline({ mode: 'play' });
    useStore.getState().seek(t);
  }
  if (r.point && !framed) {
    const b = ds.bounds;
    const span = Math.max(1, Math.hypot(b.maxX - b.minX, b.maxY - b.minY, b.maxZ - b.minZ));
    engine.frameAround(r.point.x, r.point.y, r.point.z, Math.max(span * 0.03, a.kind === 'heat' || a.kind === 'place' ? span * 0.05 : 0));
  }
  engine.invalidate(3);
}

/**
 * Goes to a note's anchor, with the view it was made in. Returns the
 * unresolved part's reason (a key under `notes.unresolved.`) or null, and
 * what the view could not restore.
 */
export function jumpTo(engine: Engine, target: { anchor: Anchor; view?: unknown; tab?: string }): { reason: string | null; missing: string[] } {
  const race = useRaceStore.getState();
  const want = (target.tab ?? null) as Tab | null;
  const go = (): { reason: string | null; missing: string[] } => {
    const ds = useStore.getState().dataset;
    const r = resolveAnchor(ds, target.anchor, target.anchor.kind === 'insight' ? currentFindings() : undefined);
    let missing: string[] = [];
    const view = looksLikeView(target.view) ? target.view : null;
    if (view) missing = applyView(engine, view);
    if (r.ok || r.point) applyAnchor(engine, target.anchor, r, !!view);
    return { reason: r.ok ? null : (r.reason ?? null), missing };
  };
  if (want && want !== race.tab && want !== 'race' && want !== 'vehicle' && target.anchor.kind !== 'plan') {
    race.setTab(want);
    // The tab sets its own mode on its next render: the view goes on after it.
    const r = resolveAnchor(useStore.getState().dataset, target.anchor, target.anchor.kind === 'insight' ? currentFindings() : undefined);
    later(() => void go());
    return { reason: r.ok ? null : (r.reason ?? null), missing: [] };
  }
  return go();
}

/** The match index a match anchor names on the data, for the list badges. */
export function matchIndexOf(id: string): number {
  const ds = useStore.getState().dataset;
  if (!ds) return -1;
  return matchesOf(ds).entries.find((e) => e.id === id)?.index ?? -1;
}
