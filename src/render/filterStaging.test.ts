import { describe, expect, it } from 'vitest';
import { FILTER_SLICE_ROWS, FilterStaging, type StageOps } from './filterStaging';
import type { ActiveFilter } from './types';

const filter = (column: string, max: number): ActiveFilter => ({ column, kind: 'range', min: 0, max, mask: null, key: `${column}<=${max}` });

/** Chunks of `rows` rows each; a column is resident once landed. */
function fakeOps(chunks: number, rows: number, room = Infinity) {
  const resident = new Set<string>();
  let used = 0;
  const writes: number[] = [];
  const ops: StageOps<{ chunk: number }> = {
    chunkCount: () => chunks,
    chunkRows: () => rows,
    resident: (c, col) => resident.has(`${c}:${col}`),
    source: (col) => (col === 'missing' ? null : new Float32Array(rows)),
    reserve: () => {
      if (used + 1 > room) return false;
      used++;
      return true;
    },
    allocate: (c) => ({ chunk: c }),
    write: (_r, _c, _s, from, to) => {
      writes.push(to - from);
    },
    land: (c, col) => {
      resident.add(`${c}:${col}`);
    },
    discard: () => {
      used--;
    },
  };
  return { ops, resident, writes, used: () => used };
}

/** A clock that advances one millisecond a call. */
function tickClock() {
  let t = 0;
  return () => t++;
}

describe('FilterStaging', () => {
  it('keeps the previous filters until every chunk has the new column, then switches in one frame', () => {
    const { ops, resident } = fakeOps(4, FILTER_SLICE_ROWS * 2);
    const s = new FilterStaging<{ chunk: number }>();
    const f = [filter('m0', 10)];
    const now = tickClock();
    const shown: string[] = [];
    for (let frame = 0; frame < 100 && (frame === 0 || s.pending); frame++) {
      const got = s.choose(f, ops, 3, now);
      shown.push(got.map((x) => x.key).join(';'));
      // Never a partial set: either nothing (the previous) or the whole new one.
      if (got.length > 0) expect(resident.size).toBe(4);
    }
    expect(shown[0]).toBe('');
    expect(shown.at(-1)).toBe('m0<=10');
    expect(shown.length).toBeGreaterThan(4);
    expect(s.pending).toBe(false);
  });

  it('spreads the writes: no frame writes more than its budget allows', () => {
    const { ops, writes } = fakeOps(8, FILTER_SLICE_ROWS * 4);
    const s = new FilterStaging<{ chunk: number }>();
    const f = [filter('m0', 10)];
    let frames = 0;
    let most = 0;
    do {
      const before = writes.length;
      s.choose(f, ops, 3, tickClock());
      most = Math.max(most, writes.length - before);
      frames++;
    } while (s.pending && frames < 1000);
    expect(s.pending).toBe(false);
    expect(most).toBeLessThanOrEqual(3);
    expect(writes.reduce((a, b) => a + b, 0)).toBe(8 * FILTER_SLICE_ROWS * 4);
  });

  it('applies at once when the columns are already there, and when the filters are cleared', () => {
    const { ops } = fakeOps(3, 100);
    const s = new FilterStaging<{ chunk: number }>();
    for (let i = 0; i < 50 && (i === 0 || s.pending); i++) s.choose([filter('m0', 1)], ops, 3, tickClock());
    // Another range on the same column: nothing to upload.
    expect(s.choose([filter('m0', 2)], ops).map((f) => f.key)).toEqual(['m0<=2']);
    expect(s.choose([], ops)).toEqual([]);
    expect(s.pending).toBe(false);
  });

  it('gives back what a column no longer asked for had reserved', () => {
    const { ops, used } = fakeOps(4, FILTER_SLICE_ROWS * 8);
    const s = new FilterStaging<{ chunk: number }>();
    s.choose([filter('m0', 1)], ops, 1, tickClock());
    expect(used()).toBe(4);
    s.choose([filter('m1', 1)], ops, 1, tickClock());
    expect(used()).toBe(4);
    expect(s.columns.has('m0')).toBe(false);
  });

  it('does not wait forever for a column that does not fit or does not exist', () => {
    const { ops } = fakeOps(4, 100, 2);
    const s = new FilterStaging<{ chunk: number }>();
    let got: ActiveFilter[] = [];
    for (let i = 0; i < 50 && (i === 0 || s.pending); i++) got = s.choose([filter('m0', 1), filter('missing', 1)], ops, 3, tickClock());
    expect(s.pending).toBe(false);
    expect(got.length).toBe(2);
  });

  it('finishes a staged column at once when a pass needs it', () => {
    const { ops, resident } = fakeOps(2, FILTER_SLICE_ROWS * 4);
    const s = new FilterStaging<{ chunk: number }>();
    s.choose([filter('m0', 1)], ops, 0, tickClock());
    expect(s.finishNow(1, 'm0', ops)).toBe(true);
    expect(resident.has('1:m0')).toBe(true);
    expect(s.finishNow(1, 'm0', ops)).toBe(false);
  });
});
