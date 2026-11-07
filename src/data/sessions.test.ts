import { describe, expect, it } from 'vitest';
import { playbackRange } from './sessions';
import type { Dataset } from '../state/types';

/** Two sessions inside a file that spans far more than either of them. */
function dataset(p: Partial<Dataset> = {}): Dataset {
  return {
    id: 'd',
    name: 'd',
    count: 4,
    px: new Float32Array(4),
    py: new Float32Array(4),
    pz: new Float32Array(4),
    time: new Float32Array([0, 10, 5000, 5100]),
    epochMs: null,
    lifetime: null,
    maxLifetimeGap: 0,
    personShared: null,
    yaw: null,
    pitch: null,
    personId: new Uint32Array(4),
    teamId: null,
    personLabels: ['A'],
    teamLabels: [],
    sessionId: new Uint32Array([0, 0, 1, 1]),
    sessionLabels: ['first', 'second'],
    sessionRows: new Uint32Array([2, 2]),
    sessionStart: new Float32Array([0, 5000]),
    sessionEnd: new Float32Array([10, 5100]),
    personTeam: null,
    personSlot: null,
    teamSizes: null,
    attrs: [],
    warnings: [],
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 0, maxY: 0, maxZ: 0 },
    timeRange: [0, 5100],
    timeSorted: true,
    ...p,
  };
}

describe('playbackRange', () => {
  it('narrows to the selected session in team mode', () => {
    expect(playbackRange(dataset(), 'team', 1)).toEqual([5000, 5100]);
  });

  it('covers the whole file with no session selected', () => {
    expect(playbackRange(dataset(), 'team', -1)).toEqual([0, 5100]);
  });

  it('leaves the heat modes alone', () => {
    // Heat draws every row at once; the session is about what forms a track,
    // which is a question only playback asks.
    expect(playbackRange(dataset(), 'heat-simple', 1)).toEqual([0, 5100]);
    expect(playbackRange(dataset(), 'heat-difference', 1)).toEqual([0, 5100]);
  });

  it('falls back to the file for a session with no span', () => {
    // A zero-width scrubber cannot be dragged and reads as broken.
    const d = dataset({
      sessionStart: new Float32Array([7, 7]),
      sessionEnd: new Float32Array([7, 7]),
    });
    expect(playbackRange(d, 'team', 0)).toEqual([0, 5100]);
  });

  it('falls back for data with no sessions, and for a stale index', () => {
    expect(playbackRange(dataset({ sessionStart: null, sessionEnd: null }), 'team', 0)).toEqual([
      0, 5100,
    ]);
    // A selection left over from a previous, larger dataset must not index past
    // the end of the new one.
    expect(playbackRange(dataset(), 'team', 99)).toEqual([0, 5100]);
  });

  it('has no range without a dataset', () => {
    expect(playbackRange(null, 'team', 0)).toEqual([0, 0]);
  });
});
