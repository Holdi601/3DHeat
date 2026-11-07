import { describe, expect, it } from 'vitest';
import { DatasetBuilder, Permuter, type SourceBlock } from './builder';
import { radixSortIndices } from './sort';
import { MAX_GROUPS } from '../render/types';

describe('Permuter', () => {
  /** Reference implementation: out[i] = src[order[i]]. */
  const reference = (src: number[], order: number[]) => order.map((o) => src[o]);

  const check = (values: number[], order: number[]) => {
    const a = new Float32Array(values);
    new Permuter(order.length).apply(a, new Uint32Array(order));
    expect(Array.from(a)).toEqual(reference(values, order));
  };

  it('matches the copying implementation on simple permutations', () => {
    check([10, 20, 30], [0, 1, 2]); // identity
    check([10, 20, 30], [2, 1, 0]); // reversal
    check([10, 20, 30], [1, 2, 0]); // single 3-cycle
    check([10, 20, 30, 40], [1, 0, 3, 2]); // two swaps
  });

  it('handles a permutation made of several cycles of different lengths', () => {
    // (0 3 1)(2 5)(4)
    check([1, 2, 3, 4, 5, 6], [3, 0, 5, 1, 4, 2]);
  });

  it('agrees with the copying implementation on random permutations', () => {
    let seed = 7;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    for (let trial = 0; trial < 40; trial++) {
      const n = 1 + Math.floor(rnd() * 60);
      const values = Array.from({ length: n }, (_, i) => i * 3 + 1);
      const order = Array.from({ length: n }, (_, i) => i);
      // Fisher-Yates
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      check(values, order);
    }
  });

  it('works on integer columns too', () => {
    const a = new Uint32Array([5, 6, 7, 8]);
    new Permuter(4).apply(a, new Uint32Array([3, 2, 1, 0]));
    expect(Array.from(a)).toEqual([8, 7, 6, 5]);
  });

  it('applies a real time sort consistently across two columns', () => {
    // The failure this guards against is columns drifting out of alignment: each
    // is permuted separately, so a bug shows up as rows recombining wrongly.
    const times = new Float32Array([50, 10, 40, 20, 30]);
    const ids = new Uint32Array([0, 1, 2, 3, 4]);
    const order = radixSortIndices(times);
    const permuter = new Permuter(times.length);
    permuter.apply(times, order);
    permuter.apply(ids, order);
    expect(Array.from(times)).toEqual([10, 20, 30, 40, 50]);
    // Row identity must have travelled with the time it belongs to.
    expect(Array.from(ids)).toEqual([1, 3, 4, 2, 0]);
  });

  it('reuses one scratch buffer across mixed column types', () => {
    const order = new Uint32Array([2, 0, 1]);
    const permuter = new Permuter(3);
    const a = new Float32Array([1.5, 2.5, 3.5]);
    const b = new Uint32Array([7, 8, 9]);
    const c = new Float32Array([10, 20, 30]);
    permuter.apply(a, order);
    permuter.apply(b, order);
    permuter.apply(c, order);
    expect(Array.from(a)).toEqual([3.5, 1.5, 2.5]);
    expect(Array.from(b)).toEqual([9, 7, 8]);
    expect(Array.from(c)).toEqual([30, 10, 20]);
  });

  it('tolerates a scratch buffer larger than the column', () => {
    // The builder sizes the scratch from the row count; a shorter order must
    // still work rather than reading past the end.
    const a = new Float32Array([1, 2, 3]);
    new Permuter(1000).apply(a, new Uint32Array([2, 1, 0]));
    expect(Array.from(a)).toEqual([3, 2, 1]);
  });
});

/** Minimal block helper; only the fields a test cares about need supplying. */
function block(p: Partial<SourceBlock> & { rows: number }): SourceBlock {
  const n = p.rows;
  return {
    rows: n,
    px: p.px ?? new Float32Array(n),
    py: p.py ?? new Float32Array(n),
    pz: p.pz ?? new Float32Array(n),
    time: p.time ?? null,
    timeIsAbsolute: p.timeIsAbsolute ?? false,
    yaw: p.yaw ?? null,
    pitch: p.pitch ?? null,
    personIds: p.personIds ?? null,
    personLabels: p.personLabels ?? [],
    teamIds: p.teamIds ?? null,
    teamLabels: p.teamLabels ?? [],
    sessionIds: p.sessionIds ?? null,
    sessionLabels: p.sessionLabels ?? [],
    attrs: p.attrs ?? [],
    rejected: p.rejected ?? 0,
  };
}

describe('DatasetBuilder', () => {
  it('concatenates blocks and sorts the result by time', () => {
    const b = new DatasetBuilder();
    b.append(
      block({
        rows: 2,
        px: new Float32Array([10, 20]),
        time: new Float64Array([100, 300]),
      }),
    );
    b.append(
      block({
        rows: 2,
        px: new Float32Array([30, 40]),
        time: new Float64Array([200, 50]),
      }),
    );
    const ds = b.finish('two');
    expect(ds.count).toBe(4);
    expect(ds.timeSorted).toBe(true);
    // Rebased onto the global minimum (50) and ordered.
    expect(Array.from(ds.time!)).toEqual([0, 50, 150, 250]);
    expect(Array.from(ds.px)).toEqual([40, 10, 30, 20]);
    expect(ds.timeRange).toEqual([0, 250]);
  });

  it('rebases against the global minimum, not each file separately', () => {
    // Two files recorded an hour apart must stay an hour apart. Rebasing each
    // file to its own start would stack them on top of each other.
    const b = new DatasetBuilder();
    b.append(block({ rows: 1, time: new Float64Array([1_000_000]), timeIsAbsolute: true }));
    b.append(block({ rows: 1, time: new Float64Array([1_003_600]), timeIsAbsolute: true }));
    const ds = b.finish('apart');
    expect(Array.from(ds.time!)).toEqual([0, 3600]);
    expect(ds.epochMs).toBe(1_000_000_000);
  });

  it('unifies person and team dictionaries across files', () => {
    const b = new DatasetBuilder();
    b.append(
      block({
        rows: 2,
        time: new Float64Array([1, 2]),
        personIds: new Uint32Array([0, 1]),
        personLabels: ['alice', 'bob'],
        teamIds: new Uint32Array([0, 0]),
        teamLabels: ['red'],
      }),
    );
    // Second file lists the same people in a different local order.
    b.append(
      block({
        rows: 2,
        time: new Float64Array([3, 4]),
        personIds: new Uint32Array([0, 1]),
        personLabels: ['bob', 'carol'],
        teamIds: new Uint32Array([0, 1]),
        teamLabels: ['blue', 'red'],
      }),
    );
    const ds = b.finish('shared');
    expect(ds.personLabels).toEqual(['alice', 'bob', 'carol']);
    expect(ds.teamLabels).toEqual(['red', 'blue']);
    // bob is person 1 in both files despite different local ids.
    expect(Array.from(ds.personId!)).toEqual([0, 1, 1, 2]);
    expect(Array.from(ds.teamId!)).toEqual([0, 0, 1, 0]);
  });

  it('keeps columns aligned when a later file adds one', () => {
    const b = new DatasetBuilder();
    b.append(block({ rows: 2, time: new Float64Array([1, 2]) }));
    b.append(
      block({
        rows: 2,
        time: new Float64Array([3, 4]),
        yaw: new Float32Array([0.5, 0.75]),
        attrs: [{ name: 'hp', kind: 'number', data: new Float32Array([10, 20]) }],
      }),
    );
    const ds = b.finish('grown');
    expect(ds.count).toBe(4);
    // Back-filled with zeros for the rows that predate the column.
    expect(Array.from(ds.yaw!)).toEqual([0, 0, 0.5, 0.75]);
    const hp = ds.attrs.find((a) => a.name === 'hp')!;
    expect(Array.from(hp.data)).toEqual([0, 0, 10, 20]);
  });

  it('keeps columns aligned when a later file lacks one', () => {
    const b = new DatasetBuilder();
    b.append(
      block({
        rows: 2,
        time: new Float64Array([1, 2]),
        attrs: [{ name: 'hp', kind: 'number', data: new Float32Array([10, 20]) }],
      }),
    );
    b.append(block({ rows: 2, time: new Float64Array([3, 4]) }));
    const ds = b.finish('shrunk');
    const hp = ds.attrs.find((a) => a.name === 'hp')!;
    expect(Array.from(hp.data)).toEqual([10, 20, 0, 0]);
  });

  it('merges category dictionaries and reserves 0 for missing', () => {
    const b = new DatasetBuilder();
    b.append(
      block({
        rows: 1,
        time: new Float64Array([1]),
        attrs: [
          { name: 'weapon', kind: 'category', data: new Uint32Array([0]), categories: ['ak'] },
        ],
      }),
    );
    b.append(
      block({
        rows: 1,
        time: new Float64Array([2]),
        attrs: [
          { name: 'weapon', kind: 'category', data: new Uint32Array([0]), categories: ['m4'] },
        ],
      }),
    );
    const ds = b.finish('cats');
    const w = ds.attrs.find((a) => a.name === 'weapon')!;
    expect(w.categories?.[0]).toBe('');
    expect(w.categories).toEqual(['', 'ak', 'm4']);
    expect(Array.from(w.data)).toEqual([1, 2]);
  });

  it('derives the roster: team per person, slot within team, team sizes', () => {
    const b = new DatasetBuilder();
    b.append(
      block({
        rows: 4,
        time: new Float64Array([1, 2, 3, 4]),
        personIds: new Uint32Array([0, 1, 2, 0]),
        personLabels: ['a', 'b', 'c'],
        teamIds: new Uint32Array([0, 0, 1, 0]),
        teamLabels: ['red', 'blue'],
      }),
    );
    const ds = b.finish('roster');
    expect(Array.from(ds.personTeam!)).toEqual([0, 0, 1]);
    expect(Array.from(ds.personSlot!)).toEqual([0, 1, 0]);
    expect(Array.from(ds.teamSizes!)).toEqual([2, 1]);
  });

  it('computes bounds over the merged set', () => {
    const b = new DatasetBuilder();
    b.append(
      block({
        rows: 1,
        px: new Float32Array([-5]),
        py: new Float32Array([1]),
        pz: new Float32Array([7]),
        time: new Float64Array([1]),
      }),
    );
    b.append(
      block({
        rows: 1,
        px: new Float32Array([9]),
        py: new Float32Array([-3]),
        pz: new Float32Array([2]),
        time: new Float64Array([2]),
      }),
    );
    const ds = b.finish('bounds');
    expect(ds.bounds.minX).toBe(-5);
    expect(ds.bounds.maxX).toBe(9);
    expect(ds.bounds.minY).toBe(-3);
    expect(ds.bounds.maxY).toBe(1);
    expect(ds.bounds.minZ).toBe(2);
    expect(ds.bounds.maxZ).toBe(7);
  });

  /**
   * A session column with more values than a picker could ever list.
   *
   * The failure this prevents was not subtle once found and completely opaque
   * before: `sessionLabels` is a string array, `postMessage` cannot transfer
   * strings, and a folder of the test export held millions of distinct session
   * timestamps. Finishing the load therefore meant cloning millions of strings
   * into the main thread, and the tab died with `Out of Memory` — under
   * the label "Computing lifetimes", the last phase the worker had announced,
   * which is why it was reported as a crash in the lifetime pass.
   *
   * The same load completes in Node, where nothing is cloned. That is what placed
   * the cost at the hand-off rather than in the ingest.
   *
   * The ids stay. An earlier version of this test asserted that they went too,
   * and that assertion was the bug: every boundary check downstream reads
   * "compare the sessions if we have them", so discarding the ids turned all of
   * them off and the team viewer joined samples from different matches into
   * lines across the map. Four bytes a row, transferred rather than copied, is
   * not what cost the tab.
   */
  it('stops listing a session column too large to list, but keeps the boundaries', () => {
    const rows = 400;
    const sessions = Array.from({ length: rows }, (_, i) => `s${i}`);
    const b = new DatasetBuilder();
    b.append(
      block({
        rows,
        time: new Float64Array(Array.from({ length: rows }, (_, i) => i)),
        personIds: new Uint32Array(rows),
        personLabels: ['solo'],
        sessionIds: new Uint32Array(Array.from({ length: rows }, (_, i) => i)),
        sessionLabels: sessions,
      }),
    );
    // The real limit is 100,000; asserting against the behaviour rather than the
    // number keeps this test cheap. `finish` is given a stand-in ceiling through
    // the same path the production one uses.
    const ds = b.finish('many sessions', undefined, 100);
    expect(ds.sessionLabels).toEqual([]);
    expect(ds.sessionRows).toBeNull();
    expect(ds.warnings.join(' ')).toMatch(/Session column has 400 distinct values/);
    // The rows survive: it is the listing that is dropped, not the data.
    expect(ds.count).toBe(rows);

    // And the boundary survives with them. One person, one row per session, so
    // no row has a successor inside its own match and every lifetime is the
    // "no successor" sentinel. Were the ids gone, each row would instead be
    // given the one-second gap to the next match's row.
    expect(ds.sessionId).not.toBeNull();
    expect(Array.from(ds.sessionId!.slice(0, 4))).toEqual([0, 1, 2, 3]);
    expect(Array.from(ds.lifetime!.slice(0, 4))).toEqual([-1, -1, -1, -1]);
  });

  /**
   * A name worn by several things at once is not a person.
   *
   * Measured on a week of one region's matches: every bot in every match logs
   * under the name of the bot controller class, one name across hundreds of
   * sessions, and a whole match's bots can share a single (session, name,
   * timestamp). The person dictionary is keyed by name, so all of them collapse
   * into one "person" scattered over the whole map, and interpolating or
   * trailing between their samples draws lines between different creatures —
   * typically hundreds of metres long.
   *
   * Detected by physics rather than by naming, so it carries to other projects:
   * one thing cannot be in two places at one instant.
   */
  it('spots a name used by two things at the same instant', () => {
    const b = new DatasetBuilder();
    b.append(
      block({
        rows: 6,
        // Two bots under one name, plus a player with an ordinary track.
        //          bot@0   bot@0   player  bot@10  bot@10  player
        px: new Float32Array([0, 500, 0, 10, 510, 10]),
        time: new Float64Array([0, 0, 0, 10, 10, 10]),
        personIds: new Uint32Array([0, 0, 1, 0, 0, 1]),
        personLabels: ['BOT', 'player'],
      }),
    );
    const ds = b.finish('shared name');
    expect(ds.personShared).not.toBeNull();
    expect(ds.personShared![0]).toBe(1);
    expect(ds.personShared![1]).toBe(0);
    expect(ds.warnings.join(' ')).toMatch(/1 of 2 names are used by more than one thing/);
    expect(ds.warnings.join(' ')).toMatch(/BOT/);
  });

  it('writes no lifetime between two places at one instant', () => {
    const b = new DatasetBuilder();
    b.append(
      block({
        rows: 4,
        px: new Float32Array([0, 500, 10, 510]),
        time: new Float64Array([0, 0, 10, 10]),
        personIds: new Uint32Array([0, 0, 0, 0]),
        personLabels: ['BOT'],
      }),
    );
    const ds = b.finish('shared lifetimes');
    // Rows 0 and 3 are each followed by a row at their own instant in another
    // place, so they keep the "no successor" sentinel: there is nothing to join
    // them to. Only row 1, followed ten seconds later, gets a duration.
    expect(Array.from(ds.lifetime!)).toEqual([-1, 10, -1, -1]);
    // And none of them gets a lifetime of zero, which is the other half of the
    // same fault: the shader drops a zero-length row outright, so all but one
    // of a tick's bot rows — every bot in the match reporting on one tick —
    // silently vanished from the field in lifetime windowing.
    expect(Array.from(ds.lifetime!).filter((v) => v === 0)).toEqual([]);
  });

  /**
   * One event, logged from both sides, is not two things.
   *
   * This export writes an ability event from both sides - one record for each
   * party - under the same name at the same instant,
   * each carrying a different party's position: hundreds of thousands of such
   * pairs across two files. They must not be joined — and they must not be read
   * as evidence about who the name belongs to either, or nearly every player in
   * the load gets flagged, as nearly every one was when this test was not yet
   * here.
   */
  it('reads a tie between two kinds of record as neither a join nor a shared name', () => {
    const b = new DatasetBuilder();
    b.append(
      block({
        rows: 4,
        px: new Float32Array([0, 500, 10, 20]),
        time: new Float64Array([0, 0, 10, 20]),
        personIds: new Uint32Array([0, 0, 0, 0]),
        personLabels: ['player'],
        attrs: [
          {
            name: 'eventName',
            kind: 'category',
            // The colliding pair disagrees on what kind of record it is.
            data: new Uint32Array([0, 1, 0, 0]),
            categories: ['Player Location', 'Ability_Target'],
          },
        ],
      }),
    );
    const ds = b.finish('two kinds');
    expect(ds.personShared![0]).toBe(0);
    expect(ds.warnings.join(' ')).not.toMatch(/more than one thing/);
    // Still not joined, though: row 0 has no successor it can be joined to.
    expect(ds.lifetime![0]).toBe(-1);
  });

  it('does not mistake a row logged twice for two things', () => {
    const b = new DatasetBuilder();
    b.append(
      block({
        rows: 4,
        // The same sample written twice — nearly all of the simultaneous player
        // pairs in the measured week were bit-identical like this. Marking the
        // player as shared would cost them interpolation for nothing.
        px: new Float32Array([7, 7, 9, 9]),
        py: new Float32Array([3, 3, 4, 4]),
        time: new Float64Array([0, 0, 10, 10]),
        personIds: new Uint32Array([0, 0, 0, 0]),
        personLabels: ['dup'],
      }),
    );
    const ds = b.finish('duplicate rows');
    expect(ds.personShared![0]).toBe(0);
    expect(ds.warnings.join(' ')).not.toMatch(/more than one thing/);
  });

  it('keeps a session column small enough to be useful', () => {
    const rows = 6;
    const b = new DatasetBuilder();
    b.append(
      block({
        rows,
        time: new Float64Array([0, 1, 2, 3, 4, 5]),
        sessionIds: new Uint32Array([0, 0, 0, 1, 1, 1]),
        sessionLabels: ['a', 'b'],
      }),
    );
    const ds = b.finish('two sessions');
    expect(ds.sessionId).not.toBeNull();
    expect(ds.sessionLabels).toEqual(['a', 'b']);
    expect(ds.sessionRows).not.toBeNull();
    expect(ds.warnings.join(' ')).not.toMatch(/Session column has/);
  });

  it('uses session boundaries for lifetimes even when the list is dropped', () => {
    /**
     * What the column is genuinely needed for.
     *
     * A player's last row of one match has no successor however soon they appear
     * in the next, so the gap between the two must not become a lifetime. That is
     * decided inside `finish`, and getting it wrong would trade a crash for a
     * silently wrong fade length, which is worse because nothing would ever say
     * so.
     */
    const b = new DatasetBuilder();
    b.append(
      block({
        rows: 4,
        time: new Float64Array([0, 1, 100, 101]),
        personIds: new Uint32Array([0, 0, 0, 0]),
        personLabels: ['p'],
        // Two matches: rows 0-1 and rows 2-3.
        sessionIds: new Uint32Array([0, 0, 1, 1]),
        sessionLabels: ['m1', 'm2'],
      }),
    );
    const ds = b.finish('boundaries', undefined, 1);
    // The list is gone, the boundaries are not...
    expect(ds.sessionLabels).toEqual([]);
    expect(ds.sessionId).not.toBeNull();
    // ...so the gap from row 1 to row 2 was never counted as a lifetime, and the
    // largest gap is the one *within* a match, not the 99 seconds between them.
    expect(ds.lifetime![1]).toBe(-1);
    expect(ds.maxLifetimeGap).toBe(1);
  });

  it('reports file and rejection counts in the name', () => {
    const b = new DatasetBuilder();
    b.append(block({ rows: 1, time: new Float64Array([1]), rejected: 3 }));
    b.append(block({ rows: 1, time: new Float64Array([2]) }));
    const ds = b.finish('set');
    expect(ds.name).toContain('2 files');
    expect(ds.name).toContain('3 rejected');
  });

  it('refuses to finish with no rows', () => {
    expect(() => new DatasetBuilder().finish('empty')).toThrow(/No rows/);
  });

  it('keeps every row when the team column turns out to be a per-row id', () => {
    // The rows are fine; only the grouping is impossible. Throwing here threw
    // away a finished multi-gigabyte read because of one auto-mapping guess, so
    // the load now drops the grouping and says why.
    const b = new DatasetBuilder();
    const n = MAX_GROUPS + 500;
    const labels = Array.from({ length: n }, (_, i) => `id${i}`);
    b.append(
      block({
        rows: n,
        time: new Float64Array(n),
        teamIds: Uint32Array.from({ length: n }, (_, i) => i),
        teamLabels: labels,
        // Persons too, so the roster is really built rather than skipped.
        personIds: Uint32Array.from({ length: n }, (_, i) => i % 3),
        personLabels: ['a', 'b', 'c'],
      }),
    );
    const ds = b.finish('id as team');
    expect(ds.count).toBe(n);
    expect(ds.teamId).toBeNull();
    expect(ds.teamLabels).toEqual([]);
    // Localised: the message is user-facing and the host formats the numbers.
    expect(ds.warnings.join(' ')).toContain(MAX_GROUPS.toLocaleString());
    expect(ds.warnings.join(' ')).toContain(n.toLocaleString());
    // The roster must degrade to the shape it has when no group column was
    // mapped at all — one pseudo-group holding everyone — not keep a table sized
    // by the dropped column.
    expect(ds.teamSizes).toEqual(new Uint32Array([3]));
    expect(Array.from(ds.personTeam!)).toEqual([0, 0, 0]);
    expect(Array.from(ds.personSlot!)).toEqual([0, 1, 2]);
  });

  it('keeps a group column that is merely large', () => {
    const b = new DatasetBuilder();
    const teams = MAX_GROUPS;
    const n = teams * 2;
    b.append(
      block({
        rows: n,
        time: new Float64Array(n),
        teamIds: Uint32Array.from({ length: n }, (_, i) => i % teams),
        teamLabels: Array.from({ length: teams }, (_, i) => `t${i}`),
      }),
    );
    const ds = b.finish('at the limit');
    expect(ds.teamLabels.length).toBe(teams);
    expect(ds.teamId).not.toBeNull();
    expect(ds.warnings).toEqual([]);
  });
});
