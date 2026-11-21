/**
 * The shared layers this viewer brings to a session, registered with
 * `shared.ts`: the tactics board (`planStore`) and the marks (world notes
 * and drawings over any view, `marks.ts`). Another module adds its own
 * document the same way (`registerSharedDoc`), and it is synced and saved
 * with the session without anything here knowing it.
 */

import { BASE_LAYER, emptyPlan, type Plan } from '../tactics/plan';
import { COLLECTIONS } from '../tactics/ops';
import { hasContent } from '../tactics/autosave';
import { gamePreset } from '../tactics/games';
import { usePlanStore } from '../state/planStore';
import { registerSharedDoc } from './shared';
import { MARK_COLLS, emptyMarks, useMarks, type MarksState } from './marks';

let registered = false;

/** Every entity's id on a board. */
function idsOf(plan: Plan): Set<string> {
  const ids = new Set<string>();
  for (const c of COLLECTIONS) for (const e of ((plan as unknown as Record<string, { id: string }[]>)[c] ?? [])) ids.add(e.id);
  return ids;
}

export function registerBuiltInDocs(): void {
  if (registered) return;
  registered = true;
  registerSharedDoc({
    key: 'tactics',
    colls: COLLECTIONS,
    get: () => usePlanStore.getState().plan,
    set: (state) => {
      const plan = state as Plan;
      const s = usePlanStore.getState();
      usePlanStore.setState({
        plan,
        step: Math.min(s.step, Math.max(0, (plan.steps?.length ?? 1) - 1)),
        activeLayer: plan.layers?.some((l) => l.id === s.activeLayer) ? s.activeLayer : BASE_LAYER,
        selection: s.selection.length ? s.selection.filter((r) => idsOf(plan).has(r.split('#')[0])) : s.selection,
      });
    },
    empty: () => {
      const p = gamePreset('cs2');
      return emptyPlan(p.id, p.teams);
    },
    hasContent: (state) => hasContent(state as Plan),
  });
  registerSharedDoc({
    key: 'marks',
    colls: MARK_COLLS,
    get: () => useMarks.getState().doc,
    set: (state) => useMarks.setState({ doc: state as MarksState }),
    empty: emptyMarks,
    hasContent: (state) => MARK_COLLS.some((c) => ((state as unknown as Record<string, unknown[]>)[c]?.length ?? 0) > 0),
  });
}
