import { describe, expect, it } from 'vitest';
import { DatasetBuilder } from './builder';
import { ingestCsv } from './ingest';
import { emptyColumnMapping } from '../state/types';

/**
 * An absolute timestamp has to survive the read.
 *
 * This is the bug that made a week of telemetry unplayable without ever
 * reporting anything. Epoch milliseconds for a date in 2025 are around
 * 1.7655e12, and the nearest values a float32 can represent there are 2^17 ms —
 * 131.072 seconds — apart. The read buffer was a Float32Array, so a column
 * sampled every ten seconds arrived holding a few hundred instants, each an
 * exact multiple of 131.072s.
 *
 * Measured on one 615,367-row export: 406 distinct instants instead of tens of
 * thousands, nine tenths of every person's consecutive samples reading as
 * simultaneous, and a thirty-second window containing no rows at all. It looked
 * like a renderer fault — cubes flickering, lines across the map, "Rows in
 * window 0" — because nothing between the read and the screen could tell that
 * the timestamps had already been rounded off.
 *
 * `SourceBlock.time` was float64 for exactly this reason. The narrowing was one
 * step earlier, in the buffer the column was read into.
 */
describe('absolute timestamps through the CSV path', () => {
  /** Epoch ms for 2025-12-12T09:15:19Z, the magnitude that breaks. */
  const BASE = 1765530919018;

  const csv = (rows: Array<[number, number]>) =>
    new File(
      ['t,x,y\n' + rows.map(([t, x]) => `${t},${x},${x * 2}`).join('\n') + '\n'],
      'stamps.csv',
    );
  const COLUMNS = ['t', 'x', 'y'];

  const mapping = () => ({
    ...emptyColumnMapping(),
    x: 'x',
    y: 'y',
    time: 't',
    timeUnit: 'unix_milliseconds' as const,
    axes: { up: 'z' as const, flipX: false, flipY: false, flipZ: false, scale: 1 },
  });

  it('keeps ten-second samples ten seconds apart', async () => {
    const rows: Array<[number, number]> = [];
    for (let i = 0; i < 6; i++) rows.push([BASE + i * 10_000, i]);
    const block = await ingestCsv(csv(rows), mapping(), COLUMNS, () => {});

    expect(block.time).not.toBeNull();
    const seconds = Array.from(block.time!);
    // Read into a float32 these would all collapse onto at most one instant,
    // 131.072s being coarser than the whole 50-second span.
    expect(new Set(seconds).size).toBe(6);
    for (let i = 1; i < seconds.length; i++) {
      expect(seconds[i] - seconds[i - 1]).toBeCloseTo(10, 6);
    }
  });

  it('resolves a single millisecond at a 2025 epoch', async () => {
    const block = await ingestCsv(
      csv([
        [BASE, 0],
        [BASE + 1, 1],
      ]),
      mapping(),
      COLUMNS,
      () => {},
    );
    expect(block.time![1]).toBeGreaterThan(block.time![0]);
    expect(block.time![1] - block.time![0]).toBeCloseTo(0.001, 6);
  });

  /**
   * And through to the dataset, where the fault actually showed.
   *
   * The builder rebases to the first timestamp before narrowing to float32, so
   * relative seconds fit comfortably — but only if the absolute values reached
   * it intact. Two people sampled on the same ticks must come out with a
   * successor each, not as one instant holding everybody.
   */
  it('gives each sample its own instant in the finished dataset', async () => {
    const rows: Array<[number, number]> = [];
    for (let i = 0; i < 4; i++) {
      rows.push([BASE + i * 10_000, i]);
      rows.push([BASE + i * 10_000, 100 + i]);
    }
    const block = await ingestCsv(csv(rows), mapping(), COLUMNS, () => {});
    const b = new DatasetBuilder();
    b.append({
      ...block,
      personIds: new Uint32Array([0, 1, 0, 1, 0, 1, 0, 1]),
      personLabels: ['a', 'b'],
    });
    const ds = b.finish('stamps');

    expect(new Set(Array.from(ds.time!)).size).toBe(4);
    // Each person's first three samples are followed ten seconds later; the
    // last has no successor. Under the old read every gap was 0 or 131.072.
    const gaps = Array.from(ds.lifetime!).filter((v) => v >= 0);
    expect(gaps).toHaveLength(6);
    for (const g of gaps) expect(g).toBeCloseTo(10, 3);
  });
});
