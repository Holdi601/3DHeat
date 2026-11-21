import { afterEach, describe, expect, it } from 'vitest';
import { parquetWriteBuffer } from 'hyparquet-writer';
import {
  columnBytes,
  dropToFit,
  forgetChoice,
  importanceOf,
  labelBytes,
  profileParquet,
  profileSample,
  recallChoice,
  rememberChoice,
  sourceKey,
  suggestColumns,
} from './columnProfile';
import { emptyColumnMapping, type ColumnMapping } from '../state/types';

/** A synthetic table shaped like a vehicle game's export: positions, events, an id per row, a JSON detail blob. */
function table(n: number): File {
  return new File(
    [
      parquetWriteBuffer({
        columnData: [
          { name: 'time', data: Float64Array.from({ length: n }, (_, i) => i / 10), type: 'DOUBLE' },
          { name: 'x', data: Float64Array.from({ length: n }, (_, i) => i), type: 'DOUBLE' },
          { name: 'y', data: Float64Array.from({ length: n }, (_, i) => -i), type: 'DOUBLE' },
          { name: 'event', data: Array.from({ length: n }, (_, i) => (i % 97 === 0 ? 'kill' : 'move')), type: 'STRING' },
          { name: 'team', data: Array.from({ length: n }, (_, i) => (i % 2 ? 'A' : 'B')), type: 'STRING' },
          { name: 'won', data: Int32Array.from({ length: n }, (_, i) => i % 2), type: 'INT32' },
          { name: 'shot_id', data: Array.from({ length: n }, (_, i) => `s-${i}`), type: 'STRING' },
          { name: 'detail', data: Array.from({ length: n }, (_, i) => `{"hit":${i},"part":"turret","shell":"APDS"}`), type: 'STRING' },
          { name: 'server', data: Array.from({ length: n }, () => 'eu-1'), type: 'STRING' },
          { name: 'speed', data: Float64Array.from({ length: n }, (_, i) => (i * 13) % 90), type: 'DOUBLE' },
        ],
        rowGroupSize: 2048,
      }),
    ],
    'wt.parquet',
  );
}

const mapping = (extra: string[]): ColumnMapping => ({
  ...emptyColumnMapping(),
  x: 'x',
  y: 'y',
  time: 'time',
  teamId: 'team',
  extra,
  extraNumeric: { event: false, shot_id: false, detail: false, server: false, won: true, speed: true },
});

describe('column profiles', () => {
  it('list the values worth filtering by, with counts, and the span of numbers', async () => {
    const p = await profileParquet(table(10_000));
    const event = p.find((c) => c.name === 'event')!;
    expect(event.values.map((v) => v.value)).toEqual(['move', 'kill']);
    expect(event.values[1].count).toBe(Math.ceil(10_000 / 97));
    const won = p.find((c) => c.name === 'won')!;
    expect(won.values.map((v) => v.value).sort()).toEqual(['0', '1']);
    const speed = p.find((c) => c.name === 'speed')!;
    expect([speed.min, speed.max]).toEqual([0, 89]);
    const id = p.find((c) => c.name === 'shot_id')!;
    expect(id.capped).toBe(true);
    expect(p.find((c) => c.name === 'detail')!.jsonLike).toBe(true);
  });

  it('rank core first and costly detail as the first to drop', async () => {
    const p = await profileParquet(table(10_000));
    const m = mapping(['event', 'won', 'shot_id', 'detail', 'server', 'speed']);
    const rank = (n: string) => importanceOf(p.find((c) => c.name === n)!, m);
    expect(rank('x').rank).toBe(0);
    expect(rank('event')).toEqual({ rank: 1, reason: 'useful' });
    expect(rank('won').rank).toBe(1);
    expect(rank('speed').rank).toBe(1);
    expect(rank('detail')).toEqual({ rank: 3, reason: 'json' });
    expect(rank('shot_id')).toEqual({ rank: 3, reason: 'identifier' });
    expect(rank('server')).toEqual({ rank: 3, reason: 'constant' });

    // A million rows: a string per row is the cost that dwarfs a 4-byte column.
    const s = suggestColumns(p, m, 1_000_000);
    expect(s[0].rank).toBe(3);
    const detail = s.find((c) => c.name === 'detail')!;
    expect(detail.bytes).toBeGreaterThan(20 * columnBytes(p.find((c) => c.name === 'speed')!, 1_000_000, true));
    // Dropping to free 100 MB takes the JSON column first and never a core one.
    const drop = dropToFit(s, 100e6);
    expect(drop[0]).toBe('detail');
    expect(drop).not.toContain('x');
    expect(labelBytes(p, m, 1_000_000)).toBeGreaterThan(detail.bytes - 4_000_000 - 1);
  });

  it('profile a text file from its preview sample', () => {
    const p = profileSample(['x', 'event'], [['1', 'kill'], ['2', 'move'], ['3', 'move']], [true, false], 3000);
    expect(p[1].values[0]).toEqual({ value: 'move', count: 2 });
    expect(p[0]).toMatchObject({ min: 1, max: 3, text: false });
  });
});

describe('remembered load choices', () => {
  const store = new Map<string, string>();
  const g = globalThis as { localStorage?: unknown };
  const had = g.localStorage;
  g.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  afterEach(() => store.clear());

  it('key a source by its columns, in any order', () => {
    expect(sourceKey(['a', 'b'])).toBe(sourceKey(['b', 'a']));
    expect(sourceKey(['a', 'b'])).not.toBe(sourceKey(['a', 'c']));
  });

  it('come back for the same kind of source, keeping only columns it has', () => {
    const key = sourceKey(['x', 'event']);
    rememberChoice(key, {
      extra: ['event', 'gone'],
      extraNumeric: { event: false },
      rowFilter: [{ column: 'event', kind: 'set', values: ['kill'] }, { column: 'gone', kind: 'set', values: ['1'] }],
    });
    const back = recallChoice(key, ['x', 'event']);
    expect(back?.extra).toEqual(['event']);
    expect(back?.rowFilter).toEqual([{ column: 'event', kind: 'set', values: ['kill'] }]);
    forgetChoice(key);
    expect(recallChoice(key, ['x', 'event'])).toBeNull();
    g.localStorage = had;
  });
});
