import { describe, expect, it } from 'vitest';
import { VertexBuffer } from '../race/geometry';
import { EffectLayer } from './effects';
import type { Dataset } from '../state/types';

const dataset = {
  count: 4,
  time: new Float32Array([5, 10, 12, 20]),
  px: new Float32Array([0, 100, 200, 300]),
  py: new Float32Array(4),
  pz: new Float32Array(4),
  sessionId: new Uint32Array([0, 0, 1, 0]),
  attrs: [{ name: 'event', kind: 'category', data: new Uint32Array([0, 1, 2, 3]), min: 0, max: 3, categories: ['position', 'smoke', 'molotov', 'kill'] }],
} as unknown as Dataset;

describe('effects in box replay', () => {
  const draw = (now: number, session = -1) => {
    const out = new VertexBuffer();
    const n = new EffectLayer().build(dataset, now, session, 1, () => [1, 1, 1], out);
    return { n, verts: out.count };
  };

  it('shows a smoke for its lifetime and not before or after', () => {
    expect(draw(9).n).toBe(0);
    expect(draw(25).n).toBe(1);
    expect(draw(29).n).toBe(0);
  });

  it('shows what is alive at once, and only in the session played', () => {
    expect(draw(13).n).toBe(2);
    expect(draw(13, 0).n).toBe(1);
    expect(draw(13).verts).toBeGreaterThan(100);
  });
});
