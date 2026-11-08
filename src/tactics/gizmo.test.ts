import { describe, expect, it } from 'vitest';
import { applyTransform, closestOnAxis, eulerOf, gimbalAxes, orientation, pickRef, pivotOf, rayPlane, ringAngle, rotateAbout, rotateKey, AXES } from './gizmo';
import { emptyPlan, keyAt } from './plan';
import { gamePreset } from './games';

const v = (x: number, y: number, z: number) => ({ x, y, z });

describe('gizmo math', () => {
  it('finds where a pointer ray is along an axis and on a plane', () => {
    // A ray straight down at x = 5 meets the x axis at 5.
    expect(closestOnAxis({ origin: v(5, 10, 3), dir: v(0, -1, 0) }, v(0, 0, 0), AXES.x)).toBeCloseTo(5);
    expect(closestOnAxis({ origin: v(0, 10, 0), dir: v(1, 0, 0) }, v(0, 0, 0), AXES.x)).toBeNull();
    const hit = rayPlane({ origin: v(2, 10, -4), dir: v(0, -1, 0) }, v(0, 1, 0), AXES.y)!;
    expect(hit).toEqual({ x: 2, y: 1, z: -4 });
    expect(rayPlane({ origin: v(0, 10, 0), dir: v(0, 1, 0) }, v(0, 0, 0), AXES.y)).toBeNull();
  });

  it('turns a ring by the angle between the two rays', () => {
    const a = ringAngle({ origin: v(1, 10, 0), dir: v(0, -1, 0) }, { origin: v(0, 10, -1), dir: v(0, -1, 0) }, v(0, 0, 0), AXES.y)!;
    // From +x to -z about +y is a quarter turn, right-handed.
    expect(a).toBeCloseTo(Math.PI / 2);
    expect(rotateAbout(v(1, 0, 0), v(0, 0, 0), AXES.y, Math.PI / 2).z).toBeCloseTo(-1);
  });

  it('round-trips yaw, pitch and roll through an orientation', () => {
    const k = { yaw: 0.7, pitch: 0.3, roll: -0.4 };
    const o = orientation(k);
    const e = eulerOf(o.f, o.u);
    expect(e.yaw).toBeCloseTo(0.7);
    expect(e.pitch).toBeCloseTo(0.3);
    expect(e.roll).toBeCloseTo(-0.4);
    // Box yaw: 0 faces -z, pi/2 faces +x.
    expect(orientation({ yaw: Math.PI / 2 }).f.x).toBeCloseTo(1);
  });

  it('turns a figure about its gimbal axes: the yaw ring changes yaw only, the pitch ring pitch only', () => {
    const k = { x: 0, y: 0, z: 0, yaw: 0.5 };
    const ax = gimbalAxes(k);
    const yawed = rotateKey(k, ax.y, -0.25);
    expect(Math.abs(yawed.yaw - 0.5)).toBeCloseTo(0.25);
    expect(yawed.pitch ?? 0).toBeCloseTo(0);
    const pitched = rotateKey(k, ax.x, 0.2);
    expect(pitched.yaw).toBeCloseTo(0.5);
    expect(Math.abs(pitched.pitch ?? 0)).toBeCloseTo(0.2);
    expect(pitched.roll ?? 0).toBeCloseTo(0);
  });
});

describe('transforming a selection', () => {
  const plan = emptyPlan('cs2', gamePreset('cs2').teams);
  plan.steps.push({ name: '2', seconds: 4 });
  plan.figures.push({ id: 'f1', kind: 'soldier', team: 't', label: 'A', keys: { 0: { x: 0, y: 0, z: 0, yaw: 0 } }, from: 0 });
  plan.arrows.push({ id: 'r1', step: 1, team: 't', style: 'move', figure: 'f1', points: [v(0, 0, 0), v(10, 0, 0), v(10, 0, 10)] });
  plan.areas.push({ id: 'a1', step: 1, team: 't', centre: v(20, 0, 20), radius: 4, label: '' });

  it('moves a figure in a later step as a new place there, its route starting with it', () => {
    const out = applyTransform(plan, 1, ['f1'], { kind: 'move', d: v(2, 0, 3), ground: () => 7 });
    expect(keyAt(out.figures[0], 0)).toMatchObject({ x: 0, z: 0 });
    expect(out.figures[0].keys[1]).toMatchObject({ x: 2, y: 7, z: 3 });
    expect(out.arrows[0].points[0]).toEqual({ x: 2, y: 7, z: 3 });
    // The original is untouched: undo keeps it.
    expect(plan.figures[0].keys[1]).toBeUndefined();
  });

  it('moves single waypoints, turns whole arrows about the pivot, scales an area', () => {
    const moved = applyTransform(plan, 1, ['r1#1'], { kind: 'move', d: v(0, 0, 5) });
    expect(moved.arrows[0].points[1]).toEqual({ x: 10, y: 0, z: 5 });
    expect(moved.arrows[0].points[2]).toEqual({ x: 10, y: 0, z: 10 });
    const pivot = pivotOf(plan, 1, ['r1'])!;
    const turned = applyTransform(plan, 1, ['r1'], { kind: 'rotate', axis: AXES.y, angle: Math.PI, pivot });
    expect(turned.arrows[0].points[0].x).toBeCloseTo(2 * pivot.x);
    const scaled = applyTransform(plan, 1, ['a1'], { kind: 'scale', k: v(2, 1, 2), pivot: v(20, 0, 20) });
    expect(scaled.areas[0].radius).toBe(8);
  });

  it('picks a waypoint before the figure on it, and an area by its disc', () => {
    expect(pickRef(plan, 1, v(10.2, 0, 0), () => 1, 0.5)).toBe('r1#1');
    expect(pickRef(plan, 0, v(0.3, 0, 0), () => 1, 0.5)).toBe('f1');
    expect(pickRef(plan, 1, v(5, 0, 0.2), () => 1, 0.5)).toBe('r1');
    expect(pickRef(plan, 1, v(22, 0, 21), () => 1, 0.5)).toBe('a1');
  });
});
