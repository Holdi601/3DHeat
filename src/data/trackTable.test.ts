import { describe, expect, it } from 'vitest';
import { TrackTable } from './trackTable';

describe('TrackTable', () => {
  it('gives one person in two matches two tracks, and the same track again', () => {
    const t = new TrackTable();
    const a = t.track(5, 1);
    const b = t.track(5, 2);
    expect(a).not.toBe(b);
    expect(t.track(5, 1)).toBe(a);
    expect(t.track(5, 2)).toBe(b);
    expect(t.count).toBe(2);
    expect(t.last[a]).toBe(-1);
  });

  it('keeps every track and what it stored through growing', () => {
    const t = new TrackTable(4);
    const ids: number[] = [];
    for (let p = 0; p < 300; p++) {
      for (let s = 0; s < 300; s++) {
        const id = t.track(p, s);
        t.last[id] = p * 1000 + s;
        ids.push(id);
      }
    }
    expect(t.count).toBe(90000);
    let i = 0;
    for (let p = 0; p < 300; p++) {
      for (let s = 0; s < 300; s++) {
        const id = t.track(p, s);
        expect(id).toBe(ids[i++]);
        expect(t.last[id]).toBe(p * 1000 + s);
      }
    }
    expect(t.count).toBe(90000);
  });
});
