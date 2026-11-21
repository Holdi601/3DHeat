import { beforeEach, describe, expect, it } from 'vitest';
import { aimAt, channelAt, directionOf, keyTimes, withKey } from './keyframes';
import { BASE_LAYER, posesAt } from './plan';
import { usePlanStore } from '../state/planStore';
import { planTimings, speedChecks, stepDuration, timeRoute, topSpeed, unitsPerMetre } from './timing';
import { BoardScene } from './scene';

const at = (x: number, z: number) => ({ x, y: 0, z });
const st = () => usePlanStore.getState();
const DEG = Math.PI / 180;

function place(kind: string, x: number, z: number): string {
  st().setKind(kind);
  st().click(at(x, z), null);
  return st().selected!;
}

beforeEach(() => {
  st().clear();
  usePlanStore.setState({ past: [], future: [], step: 0, tool: 'select', selected: null, selection: [], draft: null, activeLayer: BASE_LAYER, scrub: null, aiming: null, playing: false });
});

describe('keyframes', () => {
  it('interpolates a channel between keys, the short way round, holding before and after', () => {
    let tr = withKey(undefined, 'turret', 2, 170 * DEG);
    tr = withKey(tr, 'turret', 4, -170 * DEG);
    tr = withKey(tr, 'gun', 0, 0);
    tr = withKey(tr, 'gun', 10, 10 * DEG);
    expect(channelAt(tr, 'turret', 0)).toBeCloseTo(170 * DEG);
    // Halfway from 170 to -170 the short way is 180, not 0.
    expect(Math.abs(channelAt(tr, 'turret', 3)!)).toBeCloseTo(Math.PI);
    expect(channelAt(tr, 'turret', 9)).toBeCloseTo(-170 * DEG);
    expect(channelAt(tr, 'gun', 5)).toBeCloseTo(5 * DEG);
    expect(channelAt(tr, 'viewYaw', 5)).toBeUndefined();
    // A key at the same moment replaces; null removes; nothing left is no tracks.
    tr = withKey(tr, 'turret', 2.01, 0);
    expect(tr!.turret).toHaveLength(2);
    expect(keyTimes({ id: 'f', kind: 'mbt', team: 't', label: '', keys: {}, from: 0, tracks: tr })).toEqual([0, 2.01, 4, 10]);
    expect(withKey(withKey(undefined, 'gun', 1, 1), 'gun', 1, null)).toBeUndefined();
  });

  it('aims from a heading at a point, and turns that back into a direction', () => {
    // Facing north (-z), a point to the east (+x) is a quarter turn right.
    const a = aimAt({ x: 0, y: 0, z: 0 }, 0, { x: 10, y: 10, z: 0 });
    expect(a.yaw).toBeCloseTo(Math.PI / 2);
    expect(a.pitch).toBeCloseTo(Math.PI / 4);
    const d = directionOf(0, a);
    expect(d.x).toBeCloseTo(Math.SQRT1_2);
    expect(d.y).toBeCloseTo(Math.SQRT1_2);
    expect(d.z).toBeCloseTo(0);
  });

  it('poses figures with their keyframes, keys set by aiming at a click at the moment shown', () => {
    const tank = place('mbt', 0, 0);
    st().addStep();
    st().setStep(0);
    st().selectRefs([tank], false);
    // Step 1 starts at 4 s: aim just after.
    st().setScrub(4.5);
    expect(st().step).toBe(1);
    st().startAim('turret');
    st().click({ x: 20, y: 0, z: 0 }, null);
    const f = st().plan.figures[0];
    expect(f.tracks!.turret![0].t).toBeCloseTo(4.5);
    expect(f.tracks!.turret![0].v).toBeCloseTo(Math.PI / 2);
    expect(f.tracks!.gun).toHaveLength(1);
    st().setTrackKey(tank, 'viewYaw', -0.5, 0);
    const p = posesAt(st().plan, 1, 0.5);
    expect(p.get(tank)!.turret).toBeCloseTo(Math.PI / 2);
    expect(p.get(tank)!.view!.yaw).toBeCloseTo(-0.5);
    // Where it looks is drawn as lines.
    const scene = new BoardScene();
    const view = { step: 1, u: 0.5, selected: null, draft: null, cursor: null, placing: null, instanced: true };
    const withView = scene.build(st().plan, view).lines.count;
    st().setTrackKey(tank, 'viewYaw', null, 0);
    expect(scene.build(st().plan, view).lines.count).toBeLessThan(withView);
  });
});

describe('top speeds', () => {
  const opts = (speed: number, top: number, at?: (number | null)[]) => ({ speedOf: () => speed, modes: ['run' as const], pauses: [], slope: 'horizontal' as const, ground: false, unitsPerMetre: 1, maxSpeed: top, at });
  const line = [at(0, 0), at(10, 0), at(20, 0)];

  it('spreads a route to arrive when wanted, faster than its mode up to the top speed and no further', () => {
    // 20 m at 2 m/s is 10 s; wanted at the end in 20 s: slower.
    const slow = timeRoute(line, opts(2, 5, [null, null, 20]));
    expect(slow.total).toBeCloseTo(20);
    expect(slow.late).toEqual([]);
    // In 5 s: 4 m/s, within the top 5.
    const fast = timeRoute(line, opts(2, 5, [null, null, 5]));
    expect(fast.total).toBeCloseTo(5);
    expect(fast.segs[0].speed).toBeCloseTo(4);
    // In 2 s it would need 10 m/s: it is late, and gets there at the top speed in 4 s.
    const late = timeRoute(line, opts(2, 5, [null, null, 2]));
    expect(late.total).toBeCloseTo(4);
    expect(late.late).toEqual([{ point: 2, want: 2, got: 4 }]);
    expect(late.minTotal).toBeCloseTo(4);
    // A wanted time at a middle point fixes that stretch; the rest goes by its mode.
    const mid = timeRoute(line, opts(2, 5, [null, 10, null]));
    expect(mid.arrive[1]).toBeCloseTo(10);
    expect(mid.total).toBeCloseTo(15);
  });

  it('lengthens a step for a figure moved too far without a route, and a squeezed route with set seconds', () => {
    const s = place('soldier', 0, 0);
    const f = st().plan.figures[0];
    const top = topSpeed(st().plan, f)!;
    expect(top).toBeGreaterThan(3);
    st().addStep();
    // Moved 200 m for the next step, the step set to 4 s.
    const plan = structuredClone(st().plan);
    plan.figures[0].keys[1] = { x: 200 * unitsPerMetre(plan), y: 0, z: 0, yaw: 0 };
    usePlanStore.setState({ plan });
    const need = 200 / top;
    expect(stepDuration(st().plan, 0)).toBeCloseTo(need);
    const c = speedChecks(st().plan);
    expect(c).toHaveLength(1);
    expect(c[0]).toMatchObject({ kind: 'slide', figure: s, step: 0 });
    // No faster than the top speed when it plays either.
    const half = posesAt(st().plan, 0, 0.5).get(s)!;
    expect(half.x / unitsPerMetre(plan) / (need / 2)).toBeLessThanOrEqual(top + 1e-6);
    // A route squeezed into set seconds lengthens the step to the route at top speed.
    const q = structuredClone(st().plan);
    q.figures[0].keys = { 0: { x: 0, y: 0, z: 0, yaw: 0 } };
    q.arrows.push({ id: 'r', step: 0, team: q.figures[0].team, style: 'move', figure: s, points: [at(0, 0), { x: 100 * unitsPerMetre(q), y: 0, z: 0 }] });
    q.realTime = false;
    usePlanStore.setState({ plan: q });
    const t = planTimings(q).get('r')!;
    expect(stepDuration(q, 0)).toBeCloseTo(t.minTotal);
    expect(speedChecks(q).map((x) => x.kind)).toEqual(['squeezed']);
  });

  it('keeps wanted arrival times on a route and reports one that cannot be met', () => {
    const s = place('soldier', 0, 0);
    st().setTool('waypoints');
    st().click(at(0, 0), s);
    st().click({ x: 300 * unitsPerMetre(st().plan), y: 0, z: 0 }, null);
    st().finish();
    const r = st().plan.arrows[0];
    st().setArrival(r.id, 1, 3);
    expect(st().plan.arrows[0].at).toEqual([null, 3]);
    const checks = speedChecks(st().plan);
    expect(checks[0]).toMatchObject({ kind: 'late', arrow: r.id, point: 1, given: 3 });
    st().setArrival(r.id, 1, null);
    expect(st().plan.arrows[0].at).toBeUndefined();
  });
});
