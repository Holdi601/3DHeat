import { describe, expect, it } from 'vitest';
import { autoMap, parseHints } from './automap';

/**
 * Auto-mapping only has to beat a blank form, so these tests cover the guesses
 * that are expensive to get wrong rather than every heuristic.
 *
 * The group axis is the expensive one. A column mapped as the group is
 * dictionary-encoded across the whole load, and if it turns out to hold an id —
 * one value per player, per match, per row — the grouping has to be dropped at
 * the end, after the reading is paid for. Real telemetry has plenty of columns
 * that are named like a group and are not one.
 */

/** `rows` as the previewer produces them: strings, parallel to `columns`. */
function input(columns: string[], rows: string[][], numeric?: boolean[]) {
  return { columns, rows, numeric: numeric ?? columns.map(() => false) };
}

const XYZ = ['X', 'Y', 'Z'];
const xyzNumeric = [true, true, true];

/** 200 sampled rows with a fixed position and one varying column. */
function sample(values: (i: number) => string): string[][] {
  return Array.from({ length: 200 }, (_, i) => ['1', '2', '3', values(i)]);
}

describe('autoMap — session column', () => {
  it('maps a column named like a match as the session', () => {
    const m = autoMap(
      input([...XYZ, 'Session'], sample((i) => `s-${i % 30}`), [...xyzNumeric, false]),
    );
    expect(m.sessionId).toBe('Session');
  });

  it('does not let a session column become the group', () => {
    // Before sessions existed, `Session` on the test export was a candidate for
    // the group stand-in — a high-cardinality column mapped as a grouping,
    // which is dictionary-encoded across the whole load and then dropped at the
    // end, after the reading is paid for.
    const m = autoMap(
      input([...XYZ, 'match_id'], sample((i) => `m-${i}`), [...xyzNumeric, false]),
    );
    expect(m.sessionId).toBe('match_id');
    expect(m.teamId).not.toBe('match_id');
    expect(m.personId).not.toBe('match_id');
  });

  it('leaves the person column to the person', () => {
    const rows = Array.from({ length: 200 }, (_, i) => ['1', '2', '3', `p${i % 8}`, `r-${i % 4}`]);
    const m = autoMap(input([...XYZ, 'Name', 'round'], rows, [...xyzNumeric, false, false]));
    expect(m.personId).toBe('Name');
    expect(m.sessionId).toBe('round');
  });

  it('maps nothing when there is no session-shaped column', () => {
    const m = autoMap(input([...XYZ, 'weapon'], sample((i) => `w${i % 5}`), [...xyzNumeric, false]));
    expect(m.sessionId).toBeNull();
  });
});

describe('autoMap — group column', () => {
  it('maps a low-cardinality column named like a group as the group', () => {
    const m = autoMap(
      input([...XYZ, 'team'], sample((i) => `t${i % 4}`), [...xyzNumeric, false]),
    );
    expect(m.teamId).toBe('team');
  });

  it('does not map a group-named column that holds an id as the group', () => {
    const m = autoMap(
      input([...XYZ, 'team_id'], sample((i) => `match-${i}`), [...xyzNumeric, false]),
    );
    expect(m.teamId).not.toBe('team_id');
  });

  it('uses an id-like group column as the person column instead', () => {
    // It is per-entity data under a group-sounding name, and person ids are
    // 32-bit and unbounded — so this is the mapping that actually works.
    const m = autoMap(
      input([...XYZ, 'squad_id'], sample((i) => `squad-${i}`), [...xyzNumeric, false]),
    );
    expect(m.personId).toBe('squad_id');
    expect(m.teamId).not.toBe('squad_id');
  });

  it('leaves an existing person mapping alone', () => {
    const rows = Array.from({ length: 200 }, (_, i) => ['1', '2', '3', `p${i % 8}`, `sq-${i}`]);
    const m = autoMap(
      input([...XYZ, 'playerName', 'squad_id'], rows, [...xyzNumeric, false, false]),
    );
    expect(m.personId).toBe('playerName');
    expect(m.teamId).not.toBe('squad_id');
  });

  it('still finds a stand-in group when the named one was rejected', () => {
    // The fallback path looks for a low-cardinality string column, which is what
    // difference mode wants on its two sides.
    const rows = Array.from({ length: 200 }, (_, i) => ['1', '2', '3', `m-${i}`, i % 2 ? 'won' : 'lost']);
    const m = autoMap(input([...XYZ, 'party', 'outcome'], rows, [...xyzNumeric, false, false]));
    expect(m.teamId).toBe('outcome');
  });
});

/**
 * Racing telemetry.
 *
 * A different shape of data from the shooter exports these heuristics grew up
 * on, and the three columns that matter are the three that are named nothing
 * like their equivalents there. Each is expensive to miss in its own way:
 * without the session every lap of a course strings into one track and it jumps
 * from the finish line back to the start once a lap; without the person there
 * are no tracks at all; without the group there is nothing to colour a
 * comparison by.
 */
describe('autoMap — recorded laps', () => {
  const rows = Array.from({ length: 200 }, (_, i) => [
    '1',
    '2',
    '3',
    `lap-${i % 20}`,
    `${1000 + (i % 5)}`,
    ['A', 'B', 'R', 'S1'][i % 4],
    `${i * 0.08}`,
  ]);
  const columns = [...XYZ, 'lap', 'car', 'car_class', 'elapsed'];
  const numeric = [...xyzNumeric, false, true, false, true];

  it('takes a lap as the session', () => {
    expect(autoMap(input(columns, rows, numeric)).sessionId).toBe('lap');
  });

  it('takes the car as the thing that moves', () => {
    expect(autoMap(input(columns, rows, numeric)).personId).toBe('car');
  });

  it('takes the car class as the group', () => {
    expect(autoMap(input(columns, rows, numeric)).teamId).toBe('car_class');
  });

  it('takes elapsed time as the axis, so laps line up at their own start', () => {
    const m = autoMap(input(columns, rows, numeric));
    expect(m.time).toBe('elapsed');
    expect(m.timeUnit).toBe('seconds');
  });

  it('prefers a driver to a car when a file has both', () => {
    const both = [...XYZ, 'car', 'driver'];
    const withBoth = Array.from({ length: 200 }, (_, i) => [
      '1', '2', '3', `${1000 + (i % 5)}`, `d${i % 6}`,
    ]);
    const m = autoMap(input(both, withBoth, [...xyzNumeric, true, false]));
    expect(m.personId).toBe('driver');
  });

  it('prefers car_class to a bare class column', () => {
    // A bare `class` can still be chosen — the generic fallback picks up any
    // low-cardinality categorical column, and it is right to. What the named
    // pattern buys is precedence: in a file carrying both, the one that means
    // the car's class wins, rather than whichever happened to be scored higher.
    const both = [...XYZ, 'class', 'car_class'];
    const rows = Array.from({ length: 200 }, (_, i) => [
      '1', '2', '3', `c${i % 5}`, ['A', 'B', 'R'][i % 3],
    ]);
    const m = autoMap(input(both, rows, [...xyzNumeric, false, false]));
    expect(m.teamId).toBe('car_class');
  });
});

describe('autoMap — a file that says how to read it', () => {
  // The CS2 demo export's columns, and the hints it writes into the footer.
  const columns = ['match', 'round', 'roundId', 'time', 'event', 'player', 'side', 'team', 'x', 'y', 'z', 'dirX', 'dirY', 'dirZ', 'weapon'];
  const numeric = columns.map((c) => ['round', 'time', 'x', 'y', 'z', 'dirX', 'dirY', 'dirZ'].includes(c));
  const rows = Array.from({ length: 50 }, (_, i) => [
    'm1', '3', 'm1 #03', `${i * 0.125}`, 'position', `p${i % 10}`, i % 2 ? 'T' : 'CT', i % 2 ? 'A' : 'B',
    `${i}`, `${-i}`, '-160', '1', '0', '0', 'AK-47',
  ]);
  const hints = parseHints(
    JSON.stringify({
      axes: { up: 'z', flipY: true, scale: 1 },
      columns: {
        x: 'x', y: 'y', z: 'z', time: 'time', timeUnit: 'seconds', personId: 'player', teamId: 'side',
        sessionId: 'roundId', lookMode: 'vector', dirX: 'dirX', dirY: 'dirY', dirZ: 'dirZ',
        extra: ['event', 'match', 'round', 'weapon', 'not-a-column'],
      },
    }),
  );

  it('takes the roles, the look vector and the mirrored axis from the hints', () => {
    const m = autoMap({ columns, rows, numeric, hints });
    expect(m.personId).toBe('player');
    // Guessed alone, `team` would be the group; the file says side.
    expect(m.teamId).toBe('side');
    expect(m.sessionId).toBe('roundId');
    expect(m.lookMode).toBe('vector');
    expect([m.dirX, m.dirY, m.dirZ]).toEqual(['dirX', 'dirY', 'dirZ']);
    expect(m.axes).toMatchObject({ up: 'z', flipY: true, scale: 1 });
    expect(m.extra).toEqual(['event', 'match', 'round', 'weapon']);
    expect(m.extraNumeric).toEqual({ event: false, match: false, round: true, weapon: false });
  });

  it('is what a file without hints gets anyway, guessed', () => {
    const m = autoMap({ columns, rows, numeric });
    expect(m.axes.flipY).toBe(false);
    expect(m.lookMode).toBe('none');
  });

  it('ignores hints that do not parse', () => {
    expect(parseHints('{not json')).toBeNull();
    expect(parseHints('[1, 2]')).toBeNull();
    expect(parseHints(undefined)).toBeNull();
  });
});

describe('autoMap — how big one tracked thing is', () => {
  it('comes from the file where it says, and sizes the box replay', async () => {
    const { calibrate } = await import('./calibrate');
    const columns = ['x', 'y', 'z'];
    const rows = [['0', '0', '0'], ['4000', '3000', '10']];
    const m = autoMap({ columns, rows, numeric: [true, true, true], hints: { entity: { size: 32 } } });
    expect(m.entitySize).toBe(32);
    expect(autoMap({ columns, rows, numeric: [true, true, true] }).entitySize).toBeUndefined();
    const bounds = { minX: 0, minY: 0, minZ: 0, maxX: 4000, maxY: 10, maxZ: 3000 };
    const base = { bounds, count: 2 } as Parameters<typeof calibrate>[0];
    expect(calibrate({ ...base, entitySize: 32 }).cubeSize).toBe(32);
    expect(calibrate({ ...base, entitySize: 32 }).lookLength).toBe(128);
    expect(calibrate(base).cubeSize).toBe(8);
  });
});
