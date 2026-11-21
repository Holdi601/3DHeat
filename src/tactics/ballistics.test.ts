import { beforeEach, describe, expect, it } from 'vitest';
import { fly, parseThrow, projectilesFor, reach, solveThrow, throwKey } from './ballistics';
import { BASE_LAYER } from './plan';
import { usePlanStore } from '../state/planStore';
import { BoardScene } from './scene';
import { unitsPerMetre } from './timing';

const st = () => usePlanStore.getState();

describe('ballistics', () => {
  it('reaches what a drag-free throw reaches: v squared over g at 45 degrees', () => {
    const spec = parseThrow(throwKey('hand-grenade', 'full', 'stand'))!;
    const r = reach(spec, 1, 0, 0);
    expect(r.distance).toBeCloseTo((18 * 18) / 9.81, 0);
    expect((r.elevation * 180) / Math.PI).toBeCloseTo(45, -1);
    // Higher targets are nearer, lower ones further.
    expect(reach(spec, 1, 0, 5).distance).toBeLessThan(r.distance);
    expect(reach(spec, 1, 0, -10).distance).toBeGreaterThan(r.distance);
  });

  it('throws CS2 grenades as the game does: further running and jumping, shorter underhand', () => {
    const [g] = projectilesFor('cs2');
    expect(g.speed).toBeCloseTo(675 / 39.37);
    expect(g.gravity).toBeCloseTo(320 / 39.37);
    const at = (s: string, m: 'stand' | 'run' | 'jump' | 'runjump') => reach(parseThrow(throwKey(g.id, s, m))!, 1, 0, 0).distance;
    const stand = at('full', 'stand');
    // About 36 m standing on the flat.
    expect(stand).toBeGreaterThan(33);
    expect(stand).toBeLessThan(39);
    expect(at('full', 'jump')).toBeGreaterThan(stand);
    expect(at('full', 'runjump')).toBeGreaterThan(at('full', 'jump'));
    expect(at('under', 'stand')).toBeLessThan(stand / 4);
  });

  it('caps a launcher at the range the game ends it, and finds the low arc to a target', () => {
    const spec = parseThrow(throwKey('40mm', 'full', 'stand'))!;
    expect(reach(spec, 1, 0, 0).distance).toBe(400);
    const f = fly(spec, 1, 0, 0.1, 0);
    expect(f.distance).toBeGreaterThan(0);
    const s = solveThrow(spec, { x: 0, y: 0, z: 0 }, { x: 150, y: 0, z: 0 });
    expect(s.reachable).toBe(true);
    const end = s.points[s.points.length - 1];
    expect(end.x).toBeCloseTo(150, 0);
    // The low arc: well under 45 degrees, so it is up and down in a few seconds.
    expect(s.time).toBeLessThan(4);
    const far = solveThrow(parseThrow(throwKey('hand-grenade', 'full', 'stand'))!, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: -200 });
    expect(far.reachable).toBe(false);
    expect(Math.hypot(far.landing.x, far.landing.z)).toBeCloseTo(33, -1);
  });
});

describe('the Throw tool', () => {
  beforeEach(() => {
    st().clear();
    usePlanStore.setState({ past: [], future: [], step: 0, tool: 'select', selected: null, selection: [], draft: null, activeLayer: BASE_LAYER, scrub: null });
  });

  it('brings a throw past the reach in to its edge and records how it was thrown', () => {
    st().setKind('soldier');
    st().click({ x: 0, y: 0, z: 0 }, null);
    const thrower = st().selected!;
    st().setKind('cs2-smoke');
    st().setTool('throw');
    st().setThrowSpec({ strength: 'full', move: 'stand' });
    const upm = unitsPerMetre(st().plan);
    st().click({ x: 0, y: 0, z: 0 }, thrower);
    st().click({ x: 100 * upm, y: 0, z: 0 }, null);
    const a = st().plan.arrows[0];
    expect(a.weapon).toBe('cs2-grenade|full|stand');
    const landed = a.points[1].x / upm;
    expect(landed).toBeGreaterThan(30);
    expect(landed).toBeLessThan(40);
    const smoke = st().plan.figures.find((f) => f.kind === 'cs2-smoke')!;
    expect(smoke.keys[0].x).toBeCloseTo(a.points[1].x);
    // Drawn along its real flight.
    const f = new BoardScene().build(st().plan, { step: 0, u: 0, selected: null, draft: null, cursor: null, placing: null, instanced: true });
    expect(f.lines.count).toBeGreaterThan(20);
  });
});
