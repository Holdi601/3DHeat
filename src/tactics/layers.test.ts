import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BASE_LAYER, emptyPlan, posesAt, readPlan, routeOf, type Plan } from './plan';
import { applyOps, diffPlans, isOpBatch } from './ops';
import { usePlanStore } from '../state/planStore';
import { pickRef } from './gizmo';
import { BoardScene } from './scene';
import { clearLocal, loadLocal, saveLocal } from './autosave';
import { gamePreset } from './games';

const at = (x: number, z: number) => ({ x, y: 0, z });
const st = () => usePlanStore.getState();
const json = (p: Plan) => JSON.stringify(p);

function place(kind: string, x: number, z: number): string {
  st().setKind(kind);
  st().click(at(x, z), null);
  return st().selected!;
}
function route(figure: string, ...pts: [number, number][]) {
  st().setTool('waypoints');
  st().click(at(0, 0), figure);
  for (const [x, z] of pts) st().click(at(x, z), null);
  st().finish();
  st().setTool('select');
}

beforeEach(() => {
  st().clear();
  usePlanStore.setState({ past: [], future: [], step: 0, tool: 'select', selected: null, selection: [], draft: null, activeLayer: BASE_LAYER, routesActiveOnly: false, log: [], rev: 0 });
});
afterEach(() => vi.unstubAllGlobals());

describe('the operation log', () => {
  it('records every edit as operations that rebuild the plan from where it started', () => {
    const start = st().plan;
    const a = place('soldier', 0, 0);
    const b = place('mbt', 10, 0);
    route(a, [5, 5], [9, 9]);
    st().setTitle('Rush B');
    st().addStep();
    st().addLayer('Alpha');
    route(b, [20, 0]);
    st().setLabel(a, 'Lead');
    st().remove(b);
    st().undo();
    st().redo();
    const log = st().log;
    expect(log.length).toBeGreaterThan(8);
    expect(log.every(isOpBatch)).toBe(true);
    let p = start;
    for (const batch of log) p = applyOps(p, batch.ops);
    expect(json(p)).toBe(json(st().plan));
  });

  it('diffs only what changed, by id and field', () => {
    const p = emptyPlan('cs2', gamePreset('cs2').teams);
    const q = structuredClone(p);
    q.figures.push({ id: 'f1', kind: 'soldier', team: 't', label: 'A', keys: { 0: { x: 0, y: 0, z: 0, yaw: 0 } }, from: 0 });
    const ops = diffPlans(p, q);
    expect(ops).toEqual([{ op: 'add', coll: 'figures', id: 'f1', value: q.figures[0], index: 0 }]);
    const r = structuredClone(q);
    r.figures[0].label = 'B';
    expect(diffPlans(q, r)).toEqual([{ op: 'set', coll: 'figures', id: 'f1', fields: { label: 'B' } }]);
    r.title = 'x';
    delete r.figures[0].to;
    expect(diffPlans(q, r).find((o) => o.op === 'meta')).toEqual({ op: 'meta', fields: { title: 'x' } });
  });

  it('merges two people changing different figures, and takes a batch from elsewhere once', () => {
    const a = place('soldier', 0, 0);
    const b = place('soldier', 5, 0);
    const base = st().plan;
    // Two edits made on the same plan by two people.
    const mine = structuredClone(base);
    mine.figures.find((f) => f.id === a)!.label = 'Mine';
    const theirs = structuredClone(base);
    theirs.figures.find((f) => f.id === b)!.label = 'Theirs';
    const merged = applyOps(applyOps(base, diffPlans(base, mine)), diffPlans(base, theirs));
    expect(merged.figures.map((f) => f.label)).toEqual(['Mine', 'Theirs']);
    // A peer's batch through the store: applied, logged, and a second copy of it ignored.
    const batch = { id: 'peer-1', author: 'Peer', at: 1, ops: diffPlans(base, theirs) };
    st().applyRemote(batch);
    st().applyRemote(batch);
    expect(st().plan.figures.find((f) => f.id === b)!.label).toBe('Theirs');
    expect(st().log.filter((x) => x.id === 'peer-1')).toHaveLength(1);
    // An operation on something deleted meanwhile does nothing.
    expect(applyOps(base, [{ op: 'set', coll: 'figures', id: 'gone', fields: { label: 'x' } }]).figures).toEqual(base.figures);
    expect(isOpBatch({ id: 'x', ops: [{ op: 'set', coll: 'nope', id: 'a', fields: {} }] })).toBe(false);
  });
});

describe('layers', () => {
  it('puts new things on the active layer, and an alternative route on another layer plays only when shown', () => {
    const a = place('soldier', 0, 0);
    route(a, [10, 0]);
    const alt = st().addLayer('Plan B');
    route(a, [0, 10]);
    const p = st().plan;
    expect(p.arrows).toHaveLength(2);
    expect(p.arrows[1].layer).toBe(alt);
    // Both shown: the upper layer's route plays.
    expect(routeOf(p, a, 0)!.layer).toBe(alt);
    st().setLayerVisible(alt, false);
    expect(routeOf(st().plan, a, 0)!.layer).toBeUndefined();
    const end = posesAt({ ...st().plan, realTime: false }, 0, 1).get(a)!;
    expect(end.x).toBeCloseTo(10);
  });

  it('copies a layer as an alternative for the same figures, hiding the original', () => {
    const a = place('soldier', 0, 0);
    const squad = st().addLayer('Squad');
    route(a, [10, 0]);
    const copy = st().duplicateLayer(squad)!;
    const p = st().plan;
    expect(p.layers.map((l) => l.id)).toEqual([BASE_LAYER, squad, copy]);
    expect(p.layers.find((l) => l.id === squad)!.visible).toBe(false);
    const routes = p.arrows.filter((r) => r.figure === a);
    expect(routes.map((r) => r.layer).sort()).toEqual([copy, squad].sort());
    expect(st().activeLayer).toBe(copy);
  });

  it('keeps locked and hidden things from being picked, and removes a layer with what is on it', () => {
    const a = place('soldier', 0, 0);
    const l = st().addLayer('Enemy');
    const e = place('soldier', 20, 0);
    expect(st().plan.figures.find((f) => f.id === e)!.layer).toBe(l);
    const reach = () => 2;
    expect(pickRef(st().plan, 0, at(20, 0), reach, 0.5)).toBe(e);
    st().setLayerLocked(l, true);
    expect(pickRef(st().plan, 0, at(20, 0), reach, 0.5)).toBeNull();
    // Nothing new goes on a locked layer.
    st().setKind('soldier');
    st().click(at(30, 0), null);
    expect(st().plan.figures).toHaveLength(2);
    st().selectAll();
    expect(st().selection).toEqual([a]);
    st().setLayerLocked(l, false);
    st().removeLayer(l);
    expect(st().plan.figures.map((f) => f.id)).toEqual([a]);
    expect(st().activeLayer).toBe(BASE_LAYER);
  });

  it('moves the selection to a layer, and draws only the active layer routes when asked', () => {
    const a = place('soldier', 0, 0);
    const b = place('soldier', 5, 0);
    route(a, [10, 0]);
    const l = st().addLayer('Bravo');
    route(b, [5, 10]);
    st().selectRefs([a], false);
    st().moveSelectionToLayer(l);
    expect(st().plan.figures.find((f) => f.id === a)!.layer).toBe(l);
    const scene = new BoardScene();
    const view = { step: 0, u: 0, selected: null, draft: null, cursor: null, placing: null, instanced: true };
    const all = scene.build(st().plan, view).tris.count;
    const only = scene.build(st().plan, { ...view, routesActiveOnly: true, activeLayer: l }).tris.count;
    expect(only).toBeGreaterThan(0);
    expect(only).toBeLessThan(all);
  });
});

describe('saving the board', () => {
  it('reads a version 1 plan onto the base layer and keeps everything of version 2', () => {
    const v1 = { version: 1, title: 'Old', game: 'cs2', level: '', teams: [{ id: 't', name: 'T', color: [1, 0, 0] }], steps: [{ name: '1', seconds: 4 }], figures: [{ id: 'f', kind: 'soldier', team: 't', label: 'A', keys: { 0: { x: 1, y: 0, z: 2, yaw: 0 } }, from: 0 }], arrows: [], areas: [], notes: [{ id: 'n', step: 0, at: { x: 0, y: 0, z: 0 }, text: 'hi' }], figureScale: 1 };
    const p = readPlan(JSON.stringify(v1));
    expect(p.version).toBe(3);
    expect(p.layers.map((l) => l.id)).toEqual([BASE_LAYER]);
    expect(p.drawings).toEqual([]);
    const v2 = structuredClone(p);
    v2.layers.push({ id: 'l2', name: 'Alpha', visible: false, locked: true });
    v2.figures[0].layer = 'l2';
    v2.figures[0].tracks = { turret: [{ t: 2, v: 0.5 }, { t: 1, v: 0 }] };
    v2.notes[0] = { ...v2.notes[0], color: [1, 0.5, 0], size: 20, show: 'timed', start: 3, duration: 4 };
    v2.drawings.push({ id: 'd', step: 0, kind: 'circle', points: [at(0, 0), at(3, 0)], color: [1, 1, 0], width: 0.4 });
    v2.arrows.push({ id: 'r', step: 0, team: 't', style: 'move', points: [at(0, 0), at(5, 0)], figure: 'f', at: [null, 7], layer: 'missing' });
    const back = readPlan(JSON.stringify(v2));
    expect(back.layers[1]).toEqual({ id: 'l2', name: 'Alpha', visible: false, locked: true });
    expect(back.figures[0].layer).toBe('l2');
    // Keys come back in time order.
    expect(back.figures[0].tracks!.turret!.map((k) => k.t)).toEqual([1, 2]);
    expect(back.notes[0]).toMatchObject({ color: [1, 0.5, 0], size: 20, show: 'timed', start: 3, duration: 4 });
    expect(back.drawings[0].kind).toBe('circle');
    // A thing on a layer the file does not list goes on the base layer.
    expect(back.arrows[0].layer).toBeUndefined();
    expect(back.arrows[0].at).toEqual([null, 7]);
    expect(() => readPlan('{"version":4,"teams":[]}')).toThrow(/version 4/);
  });

  it('keeps the board in the browser, and survives storage that is full or refused', () => {
    const items = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (k: string) => items.get(k) ?? null, setItem: (k: string, v: string) => void items.set(k, v), removeItem: (k: string) => void items.delete(k) });
    place('soldier', 3, 4);
    expect(saveLocal(st().plan)).toBe('ok');
    const back = loadLocal()!;
    expect(back.plan.figures[0].keys[0].x).toBe(3);
    expect(back.at).toMatch(/^\d{4}-/);
    clearLocal();
    expect(loadLocal()).toBeNull();
    vi.stubGlobal('localStorage', { getItem: () => '{broken', setItem: () => { throw new Error('QuotaExceededError'); }, removeItem: () => undefined });
    expect(saveLocal(st().plan)).toBe('full');
    expect(loadLocal()).toBeNull();
    vi.stubGlobal('localStorage', undefined);
    expect(saveLocal(st().plan)).toBe('off');
  });
});
