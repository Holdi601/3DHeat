import { beforeEach, describe, expect, it } from 'vitest';
import { along, keyAt, playbackAt, posesAt, readPlan, throwArc } from './plan';
import { usePlanStore } from '../state/planStore';
import { BoardScene } from './scene';

const at = (x: number, z: number) => ({ x, y: 0, z });

describe('plan geometry', () => {
  it('walks along a polyline by share of its length', () => {
    const a = along([at(0, 0), at(10, 0), at(10, 10)], 0.75);
    expect(a.length).toBe(20);
    expect(a.p.x).toBeCloseTo(10);
    expect(a.p.z).toBeCloseTo(5);
    // Heading as box yaw: moving along +z is pi.
    expect(Math.abs(a.yaw)).toBeCloseTo(Math.PI);
  });

  it('arcs a throw above both ends and lands on the target', () => {
    const arc = throwArc({ x: 0, y: 0, z: 0 }, { x: 20, y: 2, z: 0 }, 4);
    expect(arc[0]).toEqual({ x: 0, y: 0, z: 0 });
    expect(arc[arc.length - 1].x).toBeCloseTo(20);
    expect(arc[arc.length - 1].y).toBeCloseTo(2);
    expect(Math.max(...arc.map((p) => p.y))).toBeGreaterThan(5);
  });
});

describe('the board', () => {
  beforeEach(() => {
    usePlanStore.getState().clear();
    usePlanStore.setState({ past: [], future: [], step: 0, tool: 'select', selected: null, draft: null });
  });

  it('places a figure, routes it with an arrow from it, and plays the route', () => {
    const s = usePlanStore.getState();
    s.setKind('soldier');
    usePlanStore.getState().click(at(0, 0), null);
    const id = usePlanStore.getState().selected!;
    expect(usePlanStore.getState().plan.figures).toHaveLength(1);
    usePlanStore.getState().setTool('arrow');
    usePlanStore.getState().click(at(0.2, 0.1), id);
    usePlanStore.getState().click(at(10, 0), null);
    usePlanStore.getState().click(at(10, 10), null);
    usePlanStore.getState().finish();
    const plan = usePlanStore.getState().plan;
    expect(plan.arrows).toHaveLength(1);
    expect(plan.arrows[0].figure).toBe(id);
    // The route starts at the figure, not where the click was.
    expect(plan.arrows[0].points[0]).toEqual({ x: 0, y: 0, z: 0 });
    // Set seconds, not real time: the route is shared out over the step.
    const half = posesAt({ ...plan, realTime: false }, 0, 0.5).get(id)!;
    expect(half.x).toBeCloseTo(10);
    expect(half.z).toBeCloseTo(0);
    // The next step begins where the route ended.
    usePlanStore.getState().addStep();
    const k = keyAt(usePlanStore.getState().plan.figures[0], 1)!;
    expect(k.x).toBeCloseTo(10);
    expect(k.z).toBeCloseTo(10);
  });

  it('throws utility that lands and stays', () => {
    const s = usePlanStore.getState();
    s.setKind('soldier');
    usePlanStore.getState().click(at(0, 0), null);
    const thrower = usePlanStore.getState().selected!;
    usePlanStore.getState().setKind('cs2-smoke');
    usePlanStore.getState().setTool('throw');
    usePlanStore.getState().click(at(0, 0), thrower);
    usePlanStore.getState().click(at(15, 5), null);
    const plan = usePlanStore.getState().plan;
    const smoke = plan.figures.find((f) => f.kind === 'cs2-smoke')!;
    expect(smoke).toBeTruthy();
    expect(plan.arrows[0].style).toBe('throw');
    expect(plan.arrows[0].lands).toBe(smoke.id);
    expect(keyAt(smoke, 0)!.x).toBe(15);
  });

  it('removes a figure from a later step on, and undoes and redoes', () => {
    usePlanStore.getState().setKind('soldier');
    usePlanStore.getState().click(at(0, 0), null);
    const id = usePlanStore.getState().selected!;
    usePlanStore.getState().addStep();
    usePlanStore.getState().remove(id);
    const f = usePlanStore.getState().plan.figures[0];
    expect(f.to).toBe(0);
    expect(posesAt(usePlanStore.getState().plan, 1, 0).has(id)).toBe(false);
    usePlanStore.getState().undo();
    expect(usePlanStore.getState().plan.figures[0].to).toBeUndefined();
    usePlanStore.getState().redo();
    expect(usePlanStore.getState().plan.figures[0].to).toBe(0);
  });

  it('saves and reads back a plan, and refuses what is not one', () => {
    usePlanStore.getState().setKind('m1a2-abrams');
    usePlanStore.getState().click(at(5, 5), null);
    const text = JSON.stringify(usePlanStore.getState().plan);
    const back = readPlan(text);
    expect(back.figures[0].kind).toBe('m1a2-abrams');
    expect(back.figures[0].keys[0].x).toBe(5);
    expect(() => readPlan('{"version":2}')).toThrow(/version/);
    expect(() => readPlan('nope')).toThrow();
  });

  it('times playback across steps', () => {
    usePlanStore.getState().addStep();
    usePlanStore.getState().setStepSeconds(0, 2);
    usePlanStore.getState().setStepSeconds(1, 6);
    const p = playbackAt(usePlanStore.getState().plan, 5);
    expect(p.total).toBe(8);
    expect(p.step).toBe(1);
    expect(p.u).toBeCloseTo(0.5);
  });

  it('draws figures, arrows and a draft', () => {
    usePlanStore.getState().setKind('soldier');
    usePlanStore.getState().click(at(0, 0), null);
    usePlanStore.getState().setTool('arrow');
    usePlanStore.getState().click(at(0, 0), null);
    usePlanStore.getState().click(at(5, 0), null);
    const s = usePlanStore.getState();
    const scene = new BoardScene();
    const f = scene.build(s.plan, { step: 0, u: 0, selected: null, draft: s.draft, cursor: at(5, 5), placing: null });
    expect(f.tris.count).toBeGreaterThan(100);
    for (let i = 0; i < f.tris.count * 7; i++) expect(Number.isFinite(f.tris.data[i])).toBe(true);
  });
});
