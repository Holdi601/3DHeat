import { describe, expect, it } from 'vitest';
import {
  buildLines,
  heatModeFor,
  LINE_END_CAP,
  LINE_SEGMENT,
  LINE_START_CAP,
  packLineStarts,
  stepHistogram,
  suggestLineSettings,
  suggestMaxJump,
  type LineSettings,
} from './lines';
import type { Dataset } from '../state/types';

/**
 * Rows of people and events, in time order, as a dataset.
 *
 * Each row is [person, x, event, session?]. Hand-built so the routes are exact:
 * which row a segment comes from is the whole question.
 */
function rows(spec: Array<[string, number, string, number?]>, events = true): Dataset {
  const people = [...new Set(spec.map((r) => r[0]))];
  const categories = ['', ...new Set(spec.map((r) => r[2]))];
  const n = spec.length;
  const sessions = spec.some((r) => r[3] !== undefined);
  return {
    id: 'lines',
    name: 'lines',
    count: n,
    px: new Float32Array(spec.map((r) => r[1])),
    py: new Float32Array(n),
    pz: new Float32Array(n),
    time: new Float32Array(spec.map((_, i) => i)),
    epochMs: null,
    lifetime: null,
    maxLifetimeGap: 0,
    personShared: null,
    yaw: null,
    pitch: null,
    personId: new Uint32Array(spec.map((r) => people.indexOf(r[0]))),
    teamId: null,
    personLabels: people,
    teamLabels: [],
    sessionId: sessions ? new Uint32Array(spec.map((r) => r[3] ?? 0)) : null,
    sessionLabels: sessions ? ['a', 'b'] : [],
    sessionRows: null,
    sessionStart: null,
    sessionEnd: null,
    personTeam: null,
    personSlot: null,
    teamSizes: null,
    attrs: events
      ? [
          {
            name: 'event',
            kind: 'category',
            data: new Uint32Array(spec.map((r) => categories.indexOf(r[2]))),
            categories,
          },
        ]
      : [],
    warnings: [],
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 0, maxY: 0, maxZ: 0 },
    timeRange: [0, n - 1],
    timeSorted: true,
  } as unknown as Dataset;
}

/** The segments as `from->to` row pairs, in row order. */
function segments(ds: Dataset, s: LineSettings): string[] {
  const l = buildLines(ds, s);
  const out: string[] = [];
  for (let i = 0; i < ds.count; i++) if (l.flags[i] & LINE_SEGMENT) out.push(`${l.from[i]}->${i}`);
  return out;
}

const settings = (p: Partial<LineSettings>): LineSettings => ({ column: 'event', starts: [], ends: [], points: [], ...p });

describe('line heat routes', () => {
  it('run from a spawn to a death, and not from the death to the next spawn', () => {
    const ds = rows([
      ['A', 0, 'spawn'],
      ['A', 1, 'pos'],
      ['A', 2, 'death'],
      ['A', 50, 'pos'], // dead: on no route
      ['A', 90, 'spawn'],
      ['A', 91, 'pos'],
    ]);
    expect(segments(ds, settings({ starts: ['spawn'], ends: ['death'] }))).toEqual(['0->1', '1->2', '4->5']);
    const l = buildLines(ds, settings({ starts: ['spawn'], ends: ['death'] }));
    expect(l.routes).toBe(2);
    expect(l.ended).toBe(1);
    // Rounded off where each route begins and ends, and nowhere in between.
    expect(l.flags[1] & LINE_START_CAP).toBeTruthy();
    expect(l.flags[2] & LINE_END_CAP).toBeTruthy();
    expect(l.flags[2] & LINE_START_CAP).toBeFalsy();
    expect(l.flags[5] & (LINE_START_CAP | LINE_END_CAP)).toBe(LINE_START_CAP | LINE_END_CAP);
  });

  it('take several starts and ends', () => {
    const ds = rows([
      ['A', 0, 'deploy'],
      ['A', 1, 'pos'],
      ['A', 2, 'extract'],
      ['A', 3, 'respawn'],
      ['A', 4, 'pos'],
      ['A', 5, 'teleport'],
      ['A', 6, 'pos'],
    ]);
    expect(
      segments(ds, settings({ starts: ['deploy', 'respawn'], ends: ['extract', 'teleport'] })),
    ).toEqual(['0->1', '1->2', '3->4', '4->5']);
  });

  it('begin at the first sample, and after each end, when no start is chosen', () => {
    const ds = rows([
      ['A', 0, 'pos'],
      ['A', 1, 'death'],
      ['A', 2, 'pos'],
      ['A', 3, 'pos'],
    ]);
    expect(segments(ds, settings({ ends: ['death'] }))).toEqual(['0->1', '2->3']);
  });

  it('keep people apart, and a new spawn ends an open route without a line to it', () => {
    const ds = rows([
      ['A', 0, 'spawn'],
      ['B', 100, 'spawn'],
      ['A', 1, 'pos'],
      ['B', 101, 'pos'],
      ['A', 40, 'spawn'], // no death seen: the route ends at row 2
      ['A', 41, 'pos'],
    ]);
    expect(segments(ds, settings({ starts: ['spawn'], ends: ['death'] }))).toEqual(['0->2', '1->3', '4->5']);
  });

  it('follow only the chosen points', () => {
    const ds = rows([
      ['A', 0, 'spawn'],
      ['A', 1, 'pos'],
      ['A', 500, 'grenade'], // where the grenade landed, not where A was
      ['A', 2, 'pos'],
      ['A', 3, 'death'],
    ]);
    expect(segments(ds, settings({ starts: ['spawn'], ends: ['death'], points: ['pos'] }))).toEqual([
      '0->1',
      '1->3',
      '3->4',
    ]);
  });

  it('never cross a session change', () => {
    const ds = rows([
      ['A', 0, 'pos', 0],
      ['A', 1, 'pos', 0],
      ['A', 1000, 'pos', 1],
      ['A', 1001, 'pos', 1],
    ]);
    expect(segments(ds, settings({}))).toEqual(['0->1', '2->3']);
  });

  it('follow one person through matches whose rows interleave', () => {
    // Rows sorted by time, with time counted from each match's start.
    const ds = rows([
      ['A', 0, 'pos', 0],
      ['A', 1000, 'pos', 1],
      ['A', 1, 'pos', 0],
      ['A', 1001, 'pos', 1],
    ]);
    expect(segments(ds, settings({}))).toEqual(['0->2', '1->3']);
  });

  it('are whole tracks without an event column', () => {
    const ds = rows(
      [
        ['A', 0, ''],
        ['B', 5, ''],
        ['A', 1, ''],
        ['A', 2, ''],
      ],
      false,
    );
    expect(segments(ds, { column: null, starts: [], ends: [], points: [] })).toEqual(['0->2', '2->3']);
  });

  it('break at a jump and carry on from the far end', () => {
    const ds = rows([
      ['a', 0, 'pos'],
      ['a', 10, 'pos'],
      ['a', 5000, 'pos'],
      ['a', 5010, 'pos'],
    ]);
    const limited = { ...settings({}), maxJump: 100 };
    expect(segments(ds, limited)).toEqual(['0->1', '2->3']);
    const built = buildLines(ds, limited);
    expect(built.jumps).toBe(1);
    expect(built.routes).toBe(2);
    expect(built.flags[1] & LINE_END_CAP).toBeTruthy();
    expect(built.flags[3] & LINE_START_CAP).toBeTruthy();
    expect(segments(ds, { ...settings({}), maxJump: null })).toEqual(['0->1', '1->2', '2->3']);
  });

  it('keep the rules for starts and ends at a jump', () => {
    const ds = rows([
      ['a', 0, 'spawn'],
      ['a', 10, 'pos'],
      ['a', 5000, 'spawn'],
      ['a', 5010, 'pos'],
      ['a', 9000, 'death'],
      ['a', 9010, 'pos'],
    ]);
    const limited = { ...settings({ starts: ['spawn'], ends: ['death'] }), maxJump: 100 };
    // A spawn after a jump starts its route as usual; a death after one draws no line to it.
    expect(segments(ds, limited)).toEqual(['0->1', '2->3']);
    expect(buildLines(ds, limited).ended).toBe(0);
  });

  it('find the jump limit in the gap between walking and jumping', () => {
    const spec: Array<[string, number, string]> = [];
    let x = 0;
    for (let i = 0; i < 5000; i++) {
      // Steps of 50 to 150, and now and then one across the map.
      x += i % 200 === 199 ? 100000 : 50 + (i % 100);
      spec.push(['a', x, 'pos']);
    }
    const limit = suggestMaxJump(rows(spec))!;
    expect(limit).toBeGreaterThan(150);
    expect(limit).toBeLessThan(100000);
    const built = buildLines(rows(spec), { ...settings({}), maxJump: limit });
    expect(built.jumps).toBe(25);
  });

  it('count the steps by length, with each one in the bin that holds it', () => {
    const hist = stepHistogram(
      rows([
        ['a', 0, 'pos'],
        ['a', 10, 'pos'],
        ['a', 20, 'pos'],
        ['a', 1020, 'pos'],
        ['a', 1020, 'pos'],
      ]),
    )!;
    // Three steps that moved; the one that did not is not counted.
    expect(hist.steps).toBe(3);
    expect(hist.counts.reduce((sum, c) => sum + c, 0)).toBe(3);
    expect(hist.edges.length).toBe(hist.counts.length + 1);
    const binOf = (v: number) => hist.edges.findIndex((e, i) => e <= v && v < hist.edges[i + 1]);
    expect(hist.counts[binOf(10)]).toBe(2);
    expect(hist.counts[binOf(1000)]).toBe(1);
  });

  it('cut nothing when there is no gap to find', () => {
    const spec: Array<[string, number, string]> = [];
    let x = 0;
    // Every length from a stroll to a long way, with no empty range between them.
    for (let i = 0; i < 5000; i++) {
      x += 1.004 ** i;
      spec.push(['a', x, 'pos']);
    }
    expect(suggestMaxJump(rows(spec))).toBeNull();
  });

  it('wear the colouring chosen for them, and leave other modes alone', () => {
    const lines = settings({});
    expect(heatModeFor('heat-lines', lines)).toBe('heat-lines');
    expect(heatModeFor('heat-lines', { ...lines, view: 'heat' })).toBe('heat-lines');
    expect(heatModeFor('heat-lines', { ...lines, view: 'teams' })).toBe('heat-teams');
    expect(heatModeFor('heat-lines', { ...lines, view: 'difference' })).toBe('heat-difference');
    expect(heatModeFor('heat-simple', { ...lines, view: 'difference' })).toBe('heat-simple');
    expect(heatModeFor('team', { ...lines, view: 'teams' })).toBe('team');
  });

  it('pack each segment start into the box of all positions', () => {
    const ds = rows([
      ['A', 0, 'pos'],
      ['A', 100, 'pos'],
    ]);
    const l = buildLines(ds, settings({}));
    const packed = packLineStarts(ds, l, 1, 1, 3);
    // Row 1's segment starts at x=0, the low end of the box, and took a second.
    expect(packed[0] & 0xffff).toBe(0);
    expect(packed[1] >>> 16).toBe(l.flags[1]);
    expect(new Float32Array(packed.buffer)[2]).toBe(1);
    expect(l.maxSeconds).toBe(1);
    // Row 0 has no segment: nothing to draw from it.
    expect(packLineStarts(ds, l, 0, 1, 4)[1] >>> 16).toBe(0);
    // The far end of the box quantises to the top of the range.
    const far = rows([
      ['A', 100, 'pos'],
      ['A', 0, 'pos'],
    ]);
    expect(packLineStarts(far, buildLines(far, settings({})), 1, 1, 3)[0] & 0xffff).toBe(65535);
  });

  it('suggest spawn and death events, but not a kill', () => {
    const ds = rows([
      ['A', 0, 'Player Spawned'],
      ['A', 1, 'position'],
      ['A', 2, 'kill'],
      ['A', 3, 'death'],
      ['A', 4, 'Extracted'],
    ]);
    const s = suggestLineSettings(ds);
    expect(s.column).toBe('event');
    expect(s.starts).toEqual(['Player Spawned']);
    expect(s.ends).toEqual(['death', 'Extracted']);
    expect(s.points).toEqual(['position', 'Player Spawned', 'death', 'Extracted']);
  });
});
