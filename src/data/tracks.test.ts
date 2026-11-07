import { describe, expect, it } from 'vitest';
import { TrackCursor, CUBE_STRIDE, TRAIL_STRIDE } from './tracks';
import type { Dataset } from '../state/types';

/**
 * One person, two matches, and the straight line that must not be drawn.
 *
 * The failure this guards is not a rounding error, it is a wrong answer about
 * identity: a player's last sample of one match and their first of the next are
 * adjacent rows in a time-ordered file and can be a kilometre apart. Treated as
 * one track they produce a cube travelling at implausible speed across the map,
 * and a trail segment to match — which reads as a rendering fault rather than as
 * a question nobody asked the data.
 *
 * Hand-built rather than loaded, because the interesting case has to be exact:
 * the two sessions must straddle the playhead, and their positions must be far
 * enough apart that an interpolated result cannot be mistaken for a real one.
 */
function twoSessions(): Dataset {
  //          row:   0     1      2       3
  //         time:   0    10     20      30
  //      session:  s0    s0     s1      s1
  //            x:   0   100   1000    1100
  const px = new Float32Array([0, 100, 1000, 1100]);
  const time = new Float32Array([0, 10, 20, 30]);
  return {
    id: 'two-sessions',
    name: 'two sessions',
    count: 4,
    px,
    py: new Float32Array(4),
    pz: new Float32Array(4),
    time,
    epochMs: null,
    lifetime: null,
    maxLifetimeGap: 0,
    personShared: null,
    yaw: null,
    pitch: null,
    personId: new Uint32Array([0, 0, 0, 0]),
    teamId: null,
    personLabels: ['A'],
    teamLabels: [],
    sessionId: new Uint32Array([0, 0, 1, 1]),
    sessionLabels: ['first', 'second'],
    sessionRows: new Uint32Array([2, 2]),
    sessionStart: new Float32Array([0, 20]),
    sessionEnd: new Float32Array([10, 30]),
    personTeam: null,
    personSlot: null,
    teamSizes: null,
    attrs: [],
    warnings: [],
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 1100, maxY: 0, maxZ: 0 },
    timeRange: [0, 30],
    timeSorted: true,
  };
}

const all = () => true;
/** X of the first cube, or null when nobody was drawn. */
function firstX(r: { data: Float32Array; count: number }): number | null {
  return r.count > 0 ? r.data[0] : null;
}

describe('TrackCursor and sessions', () => {
  it('does not interpolate across a session boundary', () => {
    const ds = twoSessions();
    const cursor = new TrackCursor(ds);
    // t=15 sits between the last sample of session 0 (x=100) and the first of
    // session 1 (x=1000). Halfway between them is x=550, which is the number
    // this must never produce.
    cursor.update(15);
    expect(firstX(cursor.buildCubes(15, true, 1e9, all))).toBe(100);
  });

  it('still interpolates within one session', () => {
    const ds = twoSessions();
    const cursor = new TrackCursor(ds);
    cursor.update(5);
    // Halfway between x=0 and x=100, both in session 0.
    expect(firstX(cursor.buildCubes(5, true, 1e9, all))).toBeCloseTo(50, 5);
  });

  it('shows only the selected session', () => {
    const ds = twoSessions();
    const cursor = new TrackCursor(ds);
    cursor.setSession(1);
    // Session 1 has not started at t=15, so there is nobody to draw — rather
    // than the session-0 sample held over from a different match.
    cursor.update(15);
    expect(cursor.buildCubes(15, true, 1e9, all).count).toBe(0);

    cursor.update(25);
    expect(firstX(cursor.buildCubes(25, true, 1e9, all))).toBeCloseTo(1050, 5);
  });

  it('holds the last position of a selected session rather than jumping ahead', () => {
    const ds = twoSessions();
    const cursor = new TrackCursor(ds);
    cursor.setSession(0);
    cursor.update(25);
    // Past the end of session 0, and session 1's rows are not this track.
    expect(firstX(cursor.buildCubes(25, true, 1e9, all))).toBe(100);
  });

  it('re-selecting a session invalidates the cursor rather than reusing it', () => {
    const ds = twoSessions();
    // Same instant, reached two ways: straight to session 1, and after having
    // tracked session 0 forwards. A cursor that kept its state would answer the
    // second differently.
    const fresh = new TrackCursor(ds);
    fresh.setSession(1);
    fresh.update(25);
    const direct = firstX(fresh.buildCubes(25, true, 1e9, all));

    const switched = new TrackCursor(ds);
    switched.setSession(0);
    for (const t of [0, 5, 10, 15, 20, 25]) switched.update(t);
    switched.setSession(1);
    switched.update(25);
    expect(firstX(switched.buildCubes(25, true, 1e9, all))).toBe(direct);
  });

  it('draws no trail segment across a session boundary', () => {
    const ds = twoSessions();
    const cursor = new TrackCursor(ds);
    cursor.update(30);
    const { data, count } = cursor.buildTrails(30, 1000, all);
    expect(count).toBeGreaterThan(0);
    // Every segment is a pair of vertices; none may span the gap between the
    // matches, which is the 900-unit jump from x=100 to x=1000.
    for (let v = 0; v + 1 < count; v += 2) {
      const ax = data[v * TRAIL_STRIDE];
      const bx = data[(v + 1) * TRAIL_STRIDE];
      expect(Math.abs(bx - ax)).toBeLessThan(500);
    }
  });

  it('leaves data with no session column exactly as it was', () => {
    const ds = twoSessions();
    // The same rows, with the session dimension removed: now it really is one
    // continuous track and interpolating across t=15 is the right answer.
    const flat: Dataset = { ...ds, sessionId: null, sessionLabels: [], sessionRows: null };
    const cursor = new TrackCursor(flat);
    cursor.update(15);
    expect(firstX(cursor.buildCubes(15, true, 1e9, all))).toBeCloseTo(550, 5);
  });

  it('keeps a cube per person within the stride', () => {
    const ds = twoSessions();
    const cursor = new TrackCursor(ds);
    cursor.update(5);
    const { data, count } = cursor.buildCubes(5, true, 1e9, all);
    expect(count).toBe(1);
    expect(data.length).toBeGreaterThanOrEqual(count * CUBE_STRIDE);
  });

  /**
   * The lifetime column carries the rule on its own.
   *
   * `computeLifetimes` writes a gap only where a row's successor is the same
   * person in the same session, and -1 everywhere else, so a non-negative
   * lifetime is already the whole test. Read from there in preference to
   * comparing sessions directly, which is what keeps the rule working on a load
   * whose session column was too large to list.
   */
  it('refuses the join on the lifetime sentinel alone, with no session column', () => {
    const ds = twoSessions();
    // Row 1 is the last sample of match one, so it has no successor; rows 0 and
    // 2 are each followed ten seconds later inside their own match.
    const lifetime = new Float32Array([10, -1, 10, -1]);
    const blind: Dataset = { ...ds, sessionId: null, sessionLabels: [], lifetime };
    const cursor = new TrackCursor(blind);
    cursor.update(15);
    expect(firstX(cursor.buildCubes(15, true, 1e9, all))).toBe(100);
    // And it still interpolates where the lifetime vouches for the pair.
    cursor.update(5);
    expect(firstX(cursor.buildCubes(5, true, 1e9, all))).toBeCloseTo(50, 5);
  });

  it('drops a held sample once it is stale rather than gliding on forever', () => {
    const ds = twoSessions();
    const cursor = new TrackCursor(ds);
    cursor.update(19);
    // Nine seconds past the end of match one, with a five-second staleness. The
    // bug this catches: interpolation used to skip the staleness test entirely,
    // so an unjoinable pair kept its cube alive indefinitely — one load showed
    // 1,966 cubes over a window that held no rows at all.
    expect(cursor.buildCubes(19, true, 5, all).count).toBe(0);
    expect(cursor.buildCubes(19, true, 20, all).count).toBe(1);
  });
});

/**
 * One name, two bots, one instant.
 *
 * Rows 0 and 1 are simultaneous and 900 units apart, which one thing cannot be;
 * `personShared` is what the ingest concludes from that. Both bots and a real
 * player share the cursor so the player's own track proves the suppression is
 * per person and not global.
 */
function sharedName(): Dataset {
  //          row:    0     1     2     3
  //         time:    0     0    10    10
  //       person:  BOT   BOT     P     P
  //            x:    0   900    10   910   (bots)      5 / 15 (player)
  const px = new Float32Array([0, 900, 10, 910]);
  const time = new Float32Array([0, 0, 10, 10]);
  return {
    id: 'shared',
    name: 'shared name',
    count: 4,
    px,
    py: new Float32Array(4),
    pz: new Float32Array(4),
    time,
    epochMs: null,
    lifetime: new Float32Array([-1, -1, -1, -1]),
    maxLifetimeGap: 10,
    personShared: new Uint8Array([1]),
    yaw: null,
    pitch: null,
    personId: new Uint32Array([0, 0, 0, 0]),
    teamId: null,
    personLabels: ['BOT'],
    teamLabels: [],
    sessionId: new Uint32Array([0, 0, 0, 0]),
    sessionLabels: ['one'],
    sessionRows: new Uint32Array([4]),
    sessionStart: new Float32Array([0]),
    sessionEnd: new Float32Array([10]),
    personTeam: null,
    personSlot: null,
    teamSizes: null,
    attrs: [],
    warnings: [],
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 910, maxY: 0, maxZ: 0 },
    timeRange: [0, 10],
    timeSorted: true,
  };
}

describe('TrackCursor and names worn by several things', () => {
  it('never interpolates a shared name, even inside one session', () => {
    const ds = sharedName();
    const cursor = new TrackCursor(ds);
    cursor.update(5);
    // Selecting the session cannot help here: the collision is inside it. The
    // position is held, so it must be one of the recorded x values and not a
    // blend of two bots.
    const x = firstX(cursor.buildCubes(5, true, 1e9, all));
    expect([0, 900, 10, 910]).toContain(x);
  });

  it('draws no trail for a shared name', () => {
    const ds = sharedName();
    const cursor = new TrackCursor(ds);
    cursor.update(10);
    expect(cursor.buildTrails(10, 1000, all).count).toBe(0);
  });

  it('still trails an ordinary name in the same load', () => {
    const ds = sharedName();
    // Same rows, now read as two people: the bot name and one real player, who
    // must keep the track the bot is denied.
    const two: Dataset = {
      ...ds,
      personId: new Uint32Array([0, 1, 0, 1]),
      personLabels: ['BOT', 'player'],
      personShared: new Uint8Array([1, 0]),
      lifetime: new Float32Array([10, 10, -1, -1]),
    };
    const cursor = new TrackCursor(two);
    cursor.update(10);
    const { data, count } = cursor.buildTrails(10, 1000, all);
    // Exactly one segment, the player's, from x=900 to x=910.
    expect(count).toBe(2);
    expect(data[0]).toBeCloseTo(900, 5);
    expect(data[TRAIL_STRIDE]).toBeCloseTo(910, 5);
  });
});
