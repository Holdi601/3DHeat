import { describe, expect, it } from 'vitest';
import { meshOf, NO_PITCH, NO_PITCH_BELOW, spinPitch } from './instances';
import { joint, newKit, into, finish } from './kit';
import { figureGlslVs, figureWgsl } from '../render/figureShaders';

describe('spinning parts', () => {
  it("carry their power below every gun elevation and above every dart's word", () => {
    for (const f of [0, 0.3, 1]) {
      const p = spinPitch(f);
      expect(p).toBeLessThan(NO_PITCH_BELOW);
      expect(p).toBeLessThan(NO_PITCH - 0.5);
      expect(p).toBeGreaterThan(-999.5);
    }
    expect(spinPitch(0)).toBeGreaterThan(spinPitch(1));
  });

  it('are kind 4 in the mesh: pivot, shaft and turns a second', () => {
    const k = newKit();
    const j = joint(k, { kind: 'spin', pivot: [3, 0.4, 0], parent: -1, rest: 0, axis: [1, 0, 0], rate: 12 });
    into(k, j);
    for (const [y, z] of [[1, 0], [0, 1], [-1, 0]]) k.team.vertex(3, y, z, 0.5, 0.5, 0.5, 1);
    const m = meshOf(finish(k, 'centre'));
    expect([...m.data.subarray(12, 20)]).toEqual([4, 3, Math.fround(0.4), 0, 1, 0, 0, 12]);
  });

  it('turn in both renderers by the scene clock', () => {
    expect(figureGlslVs()).toContain('uSpinTime * aArt1.w');
    expect(figureWgsl()).toContain('u.camera.w * art1.w');
  });
});
