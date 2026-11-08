import { describe, expect, it } from 'vitest';
import type { Dataset } from '../../state/types';
import { subtitlesAt, subtitlesOf } from './subtitleRows';
import { crossingsOf, limitSide } from './altitudeLimits';
import { cumulativeDistance, interpolateAt, timeAtValue } from './charts';
import { mediaTimeAt } from './Media';
import { readGeo, readLimits, readAids, DEFAULT_AIDS } from '../../state/replayStore';

const cat = (name: string, values: string[]) => {
  const categories = [...new Set(values)];
  return { name, kind: 'category' as const, data: Uint32Array.from(values.map((v) => categories.indexOf(v))), min: 0, max: categories.length - 1, categories };
};

/** A recording of messages: an ACMI message, a comment, a bookmark (not a subtitle), and a chat column. */
function talk(): Dataset {
  const events = ['', 'Message: Fox two', '', 'Bookmark: Merge', 'Comment: Good kill', ''];
  const chat = ['', '', 'gg', '', '', ''];
  const n = events.length;
  return {
    id: 't',
    name: 't',
    count: n,
    px: new Float32Array(n),
    py: new Float32Array(n),
    pz: new Float32Array(n),
    time: Float32Array.from([0, 1, 2, 3, 10, 20]),
    epochMs: null,
    lifetime: null,
    maxLifetimeGap: 0,
    personShared: null,
    yaw: null,
    pitch: null,
    personId: Uint32Array.from([0, 0, 1, 2, 2, 1]),
    teamId: null,
    personLabels: ['Viper 1 (F-16C) #101', 'Flanker 1 (Su-27) #102', '(recording)'],
    teamLabels: [],
    sessionId: null,
    sessionLabels: [],
    sessionRows: null,
    sessionStart: null,
    sessionEnd: null,
    personTeam: null,
    personSlot: null,
    teamSizes: null,
    attrs: [cat('Event', events), cat('chat', chat)] as Dataset['attrs'],
    warnings: [],
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 0, maxY: 0, maxZ: 0 },
    timeRange: [0, 20],
    timeSorted: true,
  };
}

describe('subtitles', () => {
  it('takes messages, comments and chat, not bookmarks', () => {
    const s = subtitlesOf(talk());
    expect(s.map((x) => [x.time, x.who, x.text])).toEqual([
      [1, 'Viper 1 (F-16C)', 'Fox two'],
      [2, 'Flanker 1 (Su-27)', 'gg'],
      [10, '', 'Good kill'],
    ]);
  });
  it('shows what was said in the last seconds', () => {
    const s = subtitlesOf(talk());
    expect(subtitlesAt(s, 2.5, -1).map((x) => x.text)).toEqual(['Fox two', 'gg']);
    expect(subtitlesAt(s, 9, -1)).toEqual([]);
    expect(subtitlesAt(s, 12, -1).map((x) => x.text)).toEqual(['Good kill']);
    expect(subtitlesAt(s, 0.5, -1)).toEqual([]);
  });
});

describe('altitude restriction', () => {
  const l = { on: true, floor: 100, ceiling: 1000 };
  it('says which side of the limits a height is', () => {
    expect(limitSide(50, l)).toBe(-1);
    expect(limitSide(500, l)).toBe(0);
    expect(limitSide(1500, l)).toBe(1);
    expect(limitSide(5000, { on: true, floor: null, ceiling: null })).toBe(0);
  });
  it('finds every crossing, and a start outside', () => {
    const t = [0, 1, 2, 3, 4, 5];
    expect(crossingsOf(t, [50, 200, 1200, 900, 900, 80], l)).toEqual([
      { index: 0, kind: 'belowFloor' },
      { index: 1, kind: 'backInside' },
      { index: 2, kind: 'aboveCeiling' },
      { index: 3, kind: 'backInside' },
      { index: 5, kind: 'belowFloor' },
    ]);
    expect(crossingsOf(t, [500, 500, 500, 500, 500, 500], l)).toEqual([]);
  });
  it('reads saved settings safely', () => {
    expect(readLimits({ on: true, floor: 'x', ceiling: 3000 })).toEqual({ on: true, floor: null, ceiling: 3000 });
    expect(readGeo({ grid: 'mgrs', magnetic: true })).toEqual({ grid: 'mgrs', magnetic: true, glideslope: false });
    expect(readGeo(null).grid).toBe('off');
    expect(readAids({ engagements: 'air', engagementRange: -5 })).toMatchObject({ engagements: 'air', engagementRange: DEFAULT_AIDS.engagementRange, pilotSight: 'selected', lockLabels: true });
  });
});

describe('charts along distance', () => {
  const t = [0, 1, 2, 30, 31];
  const x = [0, 3, 6, 1000, 1004];
  const y = [0, 4, 8, 0, 3];
  const z = [0, 0, 0, 0, 0];
  it('adds up the way through the air or over the ground, not across a gap', () => {
    expect(Array.from(cumulativeDistance(t, x, y, z, false))).toEqual([0, 5, 10, 10, 15]);
    expect(Array.from(cumulativeDistance(t, x, y, z, true))).toEqual([0, 3, 6, 6, 10]);
  });
  it('goes from time to distance and back', () => {
    const d = cumulativeDistance(t, x, y, z, false);
    expect(interpolateAt(t, d, 1.5)).toBeCloseTo(7.5);
    expect(timeAtValue(t, d, 7.5)).toBeCloseTo(1.5);
    expect(interpolateAt(t, d, -3)).toBe(0);
  });
});

describe('synchronised media', () => {
  it('maps the replay time onto the file', () => {
    expect(mediaTimeAt(105, 100, 60)).toBe(5);
    expect(mediaTimeAt(99, 100, 60)).toBeNull();
    expect(mediaTimeAt(170, 100, 60)).toBeNull();
    expect(mediaTimeAt(170, 100, NaN)).toBe(70);
  });
});
