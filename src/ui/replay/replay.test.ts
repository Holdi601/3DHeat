import { describe, expect, it } from 'vitest';
import { braa, useReplayStore } from '../../state/replayStore';
import { eventRows, trackName } from './replayData';
import type { Dataset } from '../../state/types';

describe('debrief', () => {
  it('reads bearing, range and height from one track to another, north being -z', () => {
    const m = braa({ x: 0, y: 1000, z: 0 }, { x: 1000, y: 1500, z: -1000 });
    expect(m.bearing).toBeCloseTo(45);
    expect(m.ground).toBeCloseTo(Math.SQRT2 * 1000);
    expect(m.dy).toBe(500);
    expect(braa({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 }).bearing).toBeCloseTo(180);
    expect(braa({ x: 0, y: 0, z: 0 }, { x: -10, y: 0, z: 0 }).bearing).toBeCloseTo(270);
  });

  it('names tracks without Tacview ids, and an unmanned one by its type', () => {
    const d = { personLabels: ['Viper 1 (F-16C_50) #101', '(T-90A) #401', 'player7'] } as unknown as Dataset;
    expect(trackName(d, 0, 0)).toBe('Viper 1 (F-16C_50)');
    expect(trackName(d, 1, 0)).toBe('T-90A');
    expect(trackName(d, 2, 0)).toBe('player7');
  });

  it('finds the event rows in time order', () => {
    const d = {
      count: 4,
      time: new Float32Array([3, 1, 2, 0]),
      personId: new Uint32Array([0, 1, 1, 0]),
      attrs: [{ name: 'Event', kind: 'category', data: new Uint32Array([1, 0, 2, 0]), min: 0, max: 2, categories: ['position', 'Destroyed', 'TakenOff'] }],
    } as unknown as Dataset;
    const e = eventRows(d)!;
    expect(Array.from(e.rows)).toEqual([2, 0]);
    expect(e.labels).toEqual(['TakenOff', 'Destroyed']);
    expect(Array.from(e.persons)).toEqual([1, 0]);
  });

  it('picks a pair with two shift-clicks and follows with one click', () => {
    const r = useReplayStore.getState();
    r.clearPair();
    r.pick(3);
    r.pick(5);
    expect(useReplayStore.getState().pair).toEqual([3, 5]);
    r.toggleFollow(5);
    expect(useReplayStore.getState().follow).toBe(5);
    useReplayStore.getState().toggleFollow(5);
    expect(useReplayStore.getState().follow).toBeNull();
  });
});
