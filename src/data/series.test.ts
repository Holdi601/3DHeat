import { describe, expect, it } from 'vitest';
import { DatasetBuilder, SERIES_BREAK_S, type SourceBlock } from './builder';
import { realDate, seriesAt, seriesStanding } from './series';
import { matchesOf } from '../match/matches';

const REAL0 = Date.parse('2026-11-01T06:00:00Z') / 1000;

/**
 * One recording of a synthetic campaign round: `rows` samples a minute
 * apart on the mission's own clock (each session's mission date years from
 * the others', as a DCS server's are), its real start, how many places each
 * side held at its start, and `taken` capture rows marked between missions.
 */
function session(k: number, realHours: number, missionStart: number, held: [number, number], taken: number, campaign = 'Test Server North 2'): SourceBlock {
  const rows = 10 + taken;
  const time = Float64Array.from({ length: rows }, (_, i) => missionStart + (i < taken ? 0 : (i - taken) * 60));
  const real = REAL0 + realHours * 3600;
  const label = `Test_North ${realDate(real)}`;
  return {
    rows,
    px: new Float32Array(rows).fill(k),
    py: new Float32Array(rows),
    pz: new Float32Array(rows),
    time,
    timeIsAbsolute: true,
    yaw: null,
    pitch: null,
    personIds: new Uint32Array(rows),
    personLabels: [`pilot ${k}`],
    teamIds: null,
    teamLabels: [],
    sessionIds: new Uint32Array(rows),
    sessionLabels: [label],
    attrs: [
      { name: 'campaign', kind: 'category', data: new Uint32Array(rows), categories: [campaign] },
      { name: 'sessionStart', kind: 'number', data: new Float32Array(rows).fill(real) },
      { name: 'heldRed', kind: 'number', data: new Float32Array(rows).fill(held[0]) },
      { name: 'heldBlue', kind: 'number', data: new Float32Array(rows).fill(held[1]) },
      { name: 'Inferred', kind: 'category', data: Uint32Array.from({ length: rows }, (_, i) => (i < taken ? 1 : 0)), categories: ['', 'between missions'] },
    ],
    rejected: 0,
    sourceName: `s${k}.parquet`,
  };
}

function build(blocks: SourceBlock[]) {
  const b = new DatasetBuilder();
  for (const x of blocks) b.append(x);
  return b.finish('series');
}

describe('a campaign round as a series', () => {
  // Merged out of real order (as files sorted by name can be), mission dates far apart.
  const blocks = [
    session(1, 12, Date.parse('1974-03-02T10:00:00Z') / 1000, [12, 8], 2),
    session(0, 0, Date.parse('2014-06-01T06:00:00Z') / 1000, [10, 10], 0),
    session(2, 30, Date.parse('1999-01-01T00:00:00Z') / 1000, [15, 5], 3),
  ];
  const d = build(blocks);

  it('plays the sessions in real order, each after the last with a short break', () => {
    expect(d.series?.campaign).toBe('Test Server North 2');
    const s = d.series!.sessions;
    expect(s.map((x) => x.realStart)).toEqual([REAL0, REAL0 + 12 * 3600, REAL0 + 30 * 3600]);
    expect(s[0].start).toBe(0);
    expect(s[1].start).toBe(s[0].end + SERIES_BREAK_S);
    expect(s[2].start).toBe(s[1].end + SERIES_BREAK_S);
    expect(d.timeRange[1]).toBe(s[2].end);
    expect(d.epochMs).toBeNull();
    // Each session's rows stay in its span.
    const label = (k: number) => d.sessionLabels.indexOf(blocks[k].sessionLabels[0]);
    for (let i = 0; i < d.count; i++) {
      const k = s.findIndex((x) => x.session === d.sessionId![i]);
      expect(d.time![i]).toBeGreaterThanOrEqual(s[k].start);
      expect(d.time![i]).toBeLessThanOrEqual(s[k].end);
    }
    expect(s.map((x) => x.session)).toEqual([label(1), label(0), label(2)]);
  });

  it('says where a moment falls: a session and its real time, or the break before the next', () => {
    const s = d.series!.sessions;
    expect(seriesAt(d, 120)).toMatchObject({ index: 0, of: 3, inBreak: false, real: REAL0 + 120 });
    expect(seriesAt(d, s[0].end + 10)).toMatchObject({ index: 1, inBreak: true, real: REAL0 + 12 * 3600 });
    expect(seriesAt(d, s[2].start + 60)).toMatchObject({ index: 2, inBreak: false, real: REAL0 + 30 * 3600 + 60 });
    expect(realDate(REAL0)).toBe('2026-11-01 06:00');
  });

  it('gives each session its standing at the start and the places taken before it', () => {
    expect(seriesStanding(d).map((r) => [r.red, r.blue, r.taken])).toEqual([[10, 10, 0], [12, 8, 2], [15, 5, 3]]);
  });

  it('is one match, watched whole', () => {
    expect(matchesOf(d)).toMatchObject({ via: 'whole', entries: [{ id: 'Test Server North 2' }] });
  });

  it('is no series when the files name different rounds, or none', () => {
    const mixed = build([session(0, 0, 1e9, [1, 1], 0, 'A 1'), session(1, 10, 2e9, [1, 1], 0, 'B 1')]);
    expect(mixed.series).toBeUndefined();
    // Far apart, each its own session: started together as before.
    expect(mixed.recordingsAligned).toBe(2);
  });
});
