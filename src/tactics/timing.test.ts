import { describe, expect, it } from 'vitest';
import { emptyPlan, playbackAt, posesAt, type Plan } from './plan';
import { arrivals, poseOnRoute, slopeFactor, stepDuration, timeArrow, timeRoute } from './timing';
import { modeSpeed, speedTable } from './speeds';
import { gamePreset } from './games';

const p = (x: number, z: number, y = 0) => ({ x, y, z });

function routePlan(game: string, kind: string, points: { x: number; y: number; z: number }[], extra: Partial<Plan['arrows'][number]> = {}): Plan {
  const plan = emptyPlan(game, gamePreset(game).teams);
  plan.figures.push({ id: 'f1', kind, team: plan.teams[0].id, label: 'A', keys: { 0: { ...points[0], yaw: 0 } }, from: 0 });
  plan.arrows.push({ id: 'r1', step: 0, team: plan.teams[0].id, style: 'move', points, figure: 'f1', ...extra });
  return plan;
}

describe('speed tables', () => {
  it('reads CS2 weapon speeds in Source units and falls back from modes the game has not got', () => {
    const t = speedTable('cs2');
    expect(t.unit).toBe('u/s');
    // Knife, 250 u/s at an inch a unit.
    expect(modeSpeed(t, 'soldier', 'run')).toBeCloseTo(250 * 0.0254, 6);
    expect(modeSpeed(t, 'soldier', 'run', 'awp')).toBeCloseTo(200 * 0.0254, 6);
    // No sprint in CS2: the nearest mode, run.
    expect(modeSpeed(t, 'soldier', 'sprint')).toBeCloseTo(250 * 0.0254, 6);
    // A figure's own speed wins.
    expect(modeSpeed(t, 'soldier', 'run', undefined, { run: 3 })).toBe(3);
    expect(modeSpeed(t, 'cs2-smoke', 'run')).toBeNull();
  });
});

describe('route timing', () => {
  it('times a CS2 run in Source units: 250 units at knife speed is a second', () => {
    const plan = routePlan('cs2', 'soldier', [p(0, 0), p(250, 0), p(250, 500)]);
    const t = timeArrow(plan, plan.arrows[0], plan.figures[0], null)!;
    expect(t.arrive[1]).toBeCloseTo(1, 4);
    expect(t.total).toBeCloseTo(3, 4);
  });

  it('walks slower than it runs, waits at a pause, and counts only the horizontal in CS2', () => {
    const run = timeRoute([p(0, 0), p(100, 0, 50)], { speedOf: () => 10, modes: ['run'], pauses: [], slope: 'horizontal', ground: true, unitsPerMetre: 1 });
    expect(run.total).toBeCloseTo(10, 4);
    const plan = routePlan('cs2', 'soldier', [p(0, 0), p(250, 0), p(500, 0)], { modes: ['walk', 'run'], pauses: [0, 2] });
    const t = timeArrow(plan, plan.arrows[0], plan.figures[0], null)!;
    expect(t.arrive[1]).toBeCloseTo(1 / 0.52, 2);
    expect(t.depart[1]).toBeCloseTo(t.arrive[1] + 2, 6);
    expect(t.total).toBeCloseTo(1 / 0.52 + 2 + 1, 2);
  });

  it('slows uphill on a slope model, and follows the surface between points', () => {
    expect(slopeFactor('tobler', 0)).toBeCloseTo(1, 6);
    expect(slopeFactor('tobler', 0.3)).toBeLessThan(0.5);
    expect(slopeFactor('grade', 0.2)).toBeCloseTo(0.7, 6);
    const flat = timeRoute([p(0, 0), p(100, 0)], { speedOf: () => 2, modes: ['run'], pauses: [], slope: 'tobler', ground: true, unitsPerMetre: 1 });
    // A hill in the middle the straight line knows nothing of.
    const hill = timeRoute([p(0, 0), p(100, 0)], { speedOf: () => 2, modes: ['run'], pauses: [], slope: 'tobler', ground: true, unitsPerMetre: 1, heightAt: (x) => 20 - Math.abs(x - 50) * 0.4 });
    expect(hill.segs[0].length).toBeGreaterThan(flat.segs[0].length);
    expect(hill.total).toBeGreaterThan(flat.total * 1.3);
  });

  it('plays a plan in real time: the step lasts as long as its slowest route, figures at their own speed', () => {
    const plan = routePlan('cs2', 'soldier', [p(0, 0), p(1000, 0)]);
    plan.steps[0].seconds = 1;
    expect(stepDuration(plan, 0)).toBeCloseTo(4, 3);
    const at = playbackAt(plan, 2);
    expect(at.u).toBeCloseTo(0.5, 3);
    expect(posesAt(plan, 0, at.u).get('f1')!.x).toBeCloseTo(500, 0);
    const pose = poseOnRoute(plan.arrows[0].points, timeArrow(plan, plan.arrows[0], plan.figures[0], null)!, 10);
    expect(pose.done).toBe(true);
    const arr = arrivals(plan);
    expect(arr).toHaveLength(1);
    expect(arr[0].atPlan).toBeCloseTo(4, 3);
  });
});
