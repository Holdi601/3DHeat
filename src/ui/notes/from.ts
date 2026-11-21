/**
 * Anchors and document blocks made from the other panels' things: an insight
 * finding, the pick card's heat spot, a saved view, the tactics plan.
 */

import type { Engine } from '../../render/engine';
import type { Insight, InsightReport } from '../../insights/types';
import { dataRef, type Anchor } from '../../notes/anchors';
import { heatAnchor } from '../../notes/capture';
import type { DocBlock } from '../../notes/model';
import { usePlanStore } from '../../state/planStore';
import { useInspectStore } from '../../state/inspectStore';
import type { SavedView } from '../../state/savedViews';
import { useStore } from '../../state/store';
import { plainInsight } from '../insights/plain';
import { insertBlock, viewThumb } from './actions';

export function insightAnchor(ins: Insight, report: InsightReport | null): Anchor {
  const ds = useStore.getState().dataset;
  const text = plainInsight(ins, report, report?.dataset.exposure === 'samples').what;
  return {
    kind: 'insight',
    ...(ds ? { data: dataRef(ds) } : {}),
    id: ins.id,
    insightKind: ins.kind,
    text,
    place: ins.place ? { x: ins.place.x, y: ins.place.y, z: ins.place.z } : null,
    time: ins.time,
    filters: ins.filters,
  };
}

export function insightBlock(ins: Insight, report: InsightReport | null): Omit<Extract<DocBlock, { type: 'insight' }>, 'id'> {
  return { type: 'insight', anchor: insightAnchor(ins, report), strength: ins.usefulness ?? ins.strength, evidence: ins.evidence };
}

/** The pick card's heat spot as a document block, with a thumbnail; null without a pick. */
export async function heatBlock(engine: Engine): Promise<Omit<Extract<DocBlock, { type: 'heat' }>, 'id'> | null> {
  const pick = useInspectStore.getState().pick;
  if (!pick || pick.kind === 'pending') return null;
  const anchor = await heatAnchor(engine, pick);
  if (!anchor) return null;
  const thumb = await viewThumb(engine);
  return { type: 'heat', anchor, ...(thumb ? { thumb } : {}) };
}

export function savedViewBlock(v: SavedView): Omit<Extract<DocBlock, { type: 'view' }>, 'id'> {
  return { type: 'view', name: v.name, view: v.view, viewId: v.id };
}

export function planAnchor(): Anchor {
  const p = usePlanStore.getState().plan;
  return { kind: 'plan', title: p.title, game: p.game, level: p.level, plan: structuredClone(p) };
}

/** The pick card's heat spot into the open analysis. */
export async function heatToAnalysis(engine: Engine): Promise<void> {
  const b = await heatBlock(engine);
  if (b) insertBlock(b);
}
