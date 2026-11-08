import { describe, expect, it } from 'vitest';
import type { Engine } from '../../render/engine';
import { clearView } from './replayView';

type V = { x: number; y: number; z: number };

/** An engine whose level is flat ground at y = 0 plus, optionally, a wall at x = -50 from z -200 to 200, 100 high. */
function fakeEngine(wall: boolean): Engine {
  const surfaceHit = ({ origin, dir }: { origin: V; dir: V }): V | null => {
    let best = Infinity;
    if (dir.y < 0) best = -origin.y / dir.y;
    if (wall && Math.abs(dir.x) > 1e-9) {
      const t = (-50 - origin.x) / dir.x;
      const y = origin.y + dir.y * t;
      const z = origin.z + dir.z * t;
      if (t > 0 && y >= 0 && y <= 100 && Math.abs(z) <= 200) best = Math.min(best, t);
    }
    return Number.isFinite(best) ? { x: origin.x + dir.x * best, y: origin.y + dir.y * best, z: origin.z + dir.z * best } : null;
  };
  return { inspector: { surfaceHit } } as unknown as Engine;
}

const target = { x: 0, y: 0, z: 0 };
// Looking along +x from far to the west, slightly down: the camera would sit at x = -220.
const fromWest: [number, number, number] = [0.98, -0.2, 0];

describe('flying to an event finds a view with nothing in the way', () => {
  it('keeps the approach when it is clear', () => {
    expect(clearView(fakeEngine(false), target, fromWest, 220, 1)).toEqual(fromWest);
  });

  it('turns to another side when a wall stands on the line', () => {
    const f = clearView(fakeEngine(true), target, fromWest, 220, 1);
    expect(f).not.toEqual(fromWest);
    // The camera ends up away from the wall's side or high above it.
    const cam = { x: -f[0] * 220, y: -f[1] * 220, z: -f[2] * 220 };
    expect(cam.x > -50 || cam.y > 100).toBe(true);
    expect(cam.y).toBeGreaterThan(3);
  });

  it('never puts the camera under the ground', () => {
    const fromBelow: [number, number, number] = [0.9, 0.43, 0];
    const f = clearView(fakeEngine(false), target, fromBelow, 220, 1);
    expect(-f[1] * 220).toBeGreaterThan(3);
  });
});
