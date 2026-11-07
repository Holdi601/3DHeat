import { describe, expect, it, vi } from 'vitest';
import { emptyColumnMapping } from '../state/types';

/**
 * A Parquet time column holding ISO-8601 text.
 *
 * Read as a number, as it once was, every value came out NaN and every row sat
 * at time 0. The file reader is replaced here by one that serves three rows from
 * memory, so the test needs no Parquet writer: what is under test is what
 * `ingestParquet` asks for and how it turns the answer into times.
 */
const ROWS: Record<string, Array<string | number>> = {
  x: [1, 2, 3],
  y: [4, 5, 6],
  t: ['2025-01-01T00:00:00Z', '2025-01-01T00:00:10Z', '2025-01-01T00:01:00Z'],
};

vi.mock('hyparquet', () => ({
  parquetMetadataAsync: async () => ({
    num_rows: 3n,
    schema: [
      { name: 'root', num_children: 3 },
      { name: 'x', type: 'DOUBLE' },
      { name: 'y', type: 'DOUBLE' },
      { name: 't', type: 'BYTE_ARRAY', converted_type: 'UTF8' },
    ],
  }),
}));

vi.mock('./parquet', () => ({
  asyncBufferFromFile: () => ({}),
  readParquetColumns: async (
    _buf: unknown,
    _meta: unknown,
    requests: Array<{ name: string; numbers?: Float64Array; ids?: Uint32Array; intern?: (s: string) => number }>,
  ) => {
    for (const r of requests) {
      const values = ROWS[r.name];
      values.forEach((v, i) => {
        if (r.numbers) r.numbers[i] = Number(v);
        else r.ids![i] = r.intern!(String(v));
      });
    }
  },
}));

describe('an ISO-8601 text time column in Parquet', () => {
  it('is parsed as dates, not read as numbers', async () => {
    const { ingestParquet } = await import('./ingestParquet');
    const mapping = { ...emptyColumnMapping(), x: 'x', y: 'y', time: 't', timeUnit: 'iso8601' as const };
    const block = await ingestParquet(new File(['x'], 'times.parquet'), mapping, () => {});
    const base = Date.parse('2025-01-01T00:00:00Z') / 1000;
    expect(Array.from(block.time!, (v) => v - base)).toEqual([0, 10, 60]);
    expect(block.timeIsAbsolute).toBe(true);
  });
});
