import { describe, expect, it } from 'vitest';
import { VertexBuffer } from '../race/geometry';
import type { Dataset } from '../state/types';
import { CATALOG } from './catalog';
import { extent, LOCAL } from './kit';
import { expand, InstanceBatches, meshOf } from './instances';
import { LEAN_MAX, leanFrom, posed, stanceFrom } from './posture';
import { FigureReplay } from './replay';
import { CUBE_STRIDE } from '../data/tracks';

describe('posture', () => {
  it('reads stances and leans in the words and numbers games use', () => {
    expect(stanceFrom('Standing')).toBe('stand');
    expect(stanceFrom('CROUCHED')).toBe('crouch');
    expect(stanceFrom('kneel')).toBe('crouch');
    expect(stanceFrom('prone')).toBe('prone');
    expect(stanceFrom('crawling')).toBe('prone');
    expect(stanceFrom('on back')).toBe('supine');
    expect(stanceFrom('supine')).toBe('supine');
    expect(stanceFrom(0)).toBe('stand');
    expect(stanceFrom(1)).toBe('crouch');
    expect(stanceFrom('2')).toBe('prone');
    expect(stanceFrom(3)).toBe('supine');
    expect(stanceFrom('')).toBeNull();
    expect(leanFrom('left')).toBe(-1);
    expect(leanFrom('Right')).toBe(1);
    expect(leanFrom('none')).toBe(0);
    expect(leanFrom(-0.5)).toBe(-0.5);
    expect(leanFrom(50 as number)).toBe(0.5);
    expect(leanFrom(22.5)).toBeCloseTo(0.5, 5);
  });

  it('finds every person figure in each stance, its own variant or the plain soldier', () => {
    const has = (n: string) => !!CATALOG[n];
    expect(posed('soldier', 'supine', has)).toBe('soldier-supine');
    expect(posed('soldier-prone', 'stand', has)).toBe('soldier');
    expect(posed('operator-smg-attack', 'crouch', has)).toBe('operator-smg-crouch-attack');
    expect(posed('op-ash-rifle-attack', 'supine', has)).toBe('op-ash-rifle-supine-attack');
    expect(posed('op-ash-rifle-prone-attack', 'stand', has)).toBe('op-ash-rifle-attack');
    expect(posed('medic', 'prone', has)).toBe('soldier-prone');
  });

  it('lies a supine figure flat, face up, and leans the upper body without moving the feet', () => {
    const sup = extent(CATALOG['soldier-supine'].build());
    expect(sup.height).toBeLessThan(0.7);
    expect(sup.length).toBeGreaterThan(1.5);
    const t = CATALOG['op-ash-rifle-attack'].build();
    expect(t.joints?.[0]).toMatchObject({ kind: 'pitch', rest: Math.PI / 2 });
    // Drawn leaning right (elevation -max): the head goes right (+z), the feet stay.
    const side = (pitch: number) => {
      const b = new InstanceBatches();
      b.add(meshOf(t), LOCAL, 1, [1, 1, 1], 1, 0, pitch);
      const out = new VertexBuffer();
      expand(b.list[0], out);
      let topZ = 0;
      let topN = 0;
      let footZ = 0;
      let footN = 0;
      for (let i = 0; i < out.count; i++) {
        const y = out.data[i * 7 + 1];
        const z = out.data[i * 7 + 2];
        if (y > 1.55) (topZ += z), topN++;
        if (y < 0.1) (footZ += z), footN++;
      }
      return { top: topZ / topN, foot: footZ / footN };
    };
    const upright = side(0);
    const right = side(-LEAN_MAX);
    expect(right.top - upright.top).toBeGreaterThan(0.25);
    expect(Math.abs(right.foot - upright.foot)).toBeLessThan(0.01);
  });

  it('draws a row in the stance and lean its columns give, and blends a change of stance', () => {
    const d = {
      count: 2,
      time: new Float64Array([0, 1]),
      px: new Float32Array([0, 0.1]),
      py: new Float32Array(2),
      pz: new Float32Array(2),
      personId: new Uint32Array([0, 0]),
      personLabels: ['a'],
      attrs: [
        { name: 'stance', kind: 'category', data: new Uint32Array([0, 1]), min: 0, max: 1, categories: ['standing', 'prone'] },
        { name: 'lean', kind: 'number', data: new Float32Array([1, 1]), min: 1, max: 1 },
      ],
    } as unknown as Dataset;
    const fr = new FigureReplay();
    const cubes = new Float32Array(CUBE_STRIDE);
    const draw = (row: number, time: number) => {
      fr.build(d, cubes, 1, Int32Array.of(row), { scale: 1, unknown: 'soldier', time });
      return fr.batches.list.filter((b) => b.count > 0).length;
    };
    expect(draw(0, 0.9)).toBe(1);
    expect(fr.kindsDrawn[0]).toBe('soldier');
    // The new stance and the old drawn together while the change blends, then the new alone.
    expect(draw(1, 1.05)).toBe(2);
    expect(fr.kindsDrawn[0]).toBe('soldier-prone');
    expect(draw(1, 1.5)).toBe(1);
  });
});
