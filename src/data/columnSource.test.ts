import { describe, expect, it } from 'vitest';
import { parquetWriteBuffer } from 'hyparquet-writer';
import { ingestFiles } from './ingestFiles';
import { readColumn } from './columnRead';
import {
  assemble,
  chooseEvictions,
  describeKept,
  forEachKept,
  mergeOf,
  onDemandEligible,
  onDemandOf,
  rowMapBytes,
  type BlockRows,
} from './columnSource';
import { pinnedColumns, rowFingerprint } from './columnStore';
import { emptyColumnMapping, type ColumnMapping, type Dataset } from '../state/types';

/** A small match table: positions, time, a player, a measure and a category, with gaps where asked. */
function table(
  name: string,
  n: number,
  seed: number,
  opts: { sorted?: boolean; nanEvery?: number; withTag?: boolean; rowGroupSize?: number } = {},
): File {
  let s = seed * 7919 + 1;
  const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  const time = Float64Array.from({ length: n }, (_, i) => (opts.sorted === false ? rnd() * 100 : i / 10 + seed));
  const x = Float64Array.from({ length: n }, (_, i) => (opts.nanEvery && i % opts.nanEvery === 3 ? NaN : i + seed * 1000));
  const cols = [
    { name: 'time', data: time, type: 'DOUBLE' as const },
    { name: 'x', data: x, type: 'DOUBLE' as const },
    { name: 'y', data: Float64Array.from({ length: n }, (_, i) => (i * 37) % 1000), type: 'DOUBLE' as const },
    { name: 'player', data: Array.from({ length: n }, (_, i) => `p${(i + seed) % 5}`), type: 'STRING' as const },
    { name: 'event', data: Array.from({ length: n }, () => (rnd() < 0.1 ? 'kill' : 'move')), type: 'STRING' as const },
    { name: 'speed', data: Float64Array.from({ length: n }, () => Math.floor(rnd() * 500) / 4), type: 'DOUBLE' as const },
  ];
  if (opts.withTag !== false) {
    cols.push({ name: 'tag', data: Array.from({ length: n }, () => (rnd() < 0.2 ? '' : `t${Math.floor(rnd() * 7)}`)) as never, type: 'STRING' as const });
  }
  const buf = parquetWriteBuffer({ columnData: cols, rowGroupSize: opts.rowGroupSize ?? 512 });
  return new File([buf], name);
}

function mapping(extra: string[], onDemand: string[], numeric: Record<string, boolean> = { speed: true, tag: false, event: false }): ColumnMapping {
  return {
    ...emptyColumnMapping(),
    x: 'x',
    y: 'y',
    time: 'time',
    personId: 'player',
    extra,
    onDemand,
    extraNumeric: numeric,
    axes: { up: 'z', flipX: false, flipY: false, flipZ: false, scale: 1 },
  };
}

async function load(files: File[], m: ColumnMapping, stride = 1): Promise<Dataset> {
  return (await ingestFiles({ files, mapping: m, columns: [], name: 't', stride })).dataset;
}

/** The same column loaded at once and read on demand must be the same column. */
async function sameAsEager(files: File[], column: string, kind: 'number' | 'category', extraMapping: Partial<ColumnMapping> = {}, stride = 1) {
  const eager = await load(files, { ...mapping(['event', column], []), ...extraMapping }, stride);
  const lazy = await load(files, { ...mapping(['event'], [column]), ...extraMapping }, stride);
  expect(lazy.count).toBe(eager.count);
  expect(Array.from(lazy.px)).toEqual(Array.from(eager.px));
  expect(lazy.attrs.some((a) => a.name === column)).toBe(false);
  const src = lazy.columnSource!;
  expect(src).toBeTruthy();
  expect(src.deferred).toEqual([{ name: column, kind }]);
  const got = await readColumn(src, column, kind);
  const want = eager.attrs.find((a) => a.name === column)!;
  expect(Array.from(got.data)).toEqual(Array.from(want.data));
  expect(got.min).toBe(want.min);
  expect(got.max).toBe(want.max);
  expect(got.categories).toEqual(want.categories);
  return src;
}

describe('columns on demand', () => {
  it('walks the kept rows of a block: stride, dropped rows, a selection', () => {
    const keep = new Uint8Array(10);
    for (const i of [0, 2, 6, 8]) keep[i] = 1;
    // Stride 2 over 10 read rows: 0 2 4 6 8 considered, 4 dropped.
    const b: BlockRows = { file: 0, ...describeKept(10, 2, keep, 4, Uint32Array.from([10, 11, 12, 13, 14, 15, 16, 17, 18, 19])) };
    expect(Array.from(b.drop!)).toEqual([4]);
    const rows: number[] = [];
    forEachKept(b, (_, fileRow) => rows.push(fileRow));
    expect(rows).toEqual([10, 12, 16, 18]);
  });

  it('gathers in sort order three ways', () => {
    const blocks: BlockRows[] = [
      { file: 0, read: 3, sel: null, step: 1, drop: null, rows: 3 },
      { file: 1, read: 2, sel: null, step: 1, drop: null, rows: 2 },
    ];
    const values = [Float32Array.from([1, 2, 3]), Float32Array.from([10, 20])];
    // Times 0 2 4 | 1 3: each block sorted on its own.
    const time = Float32Array.from([0, 2, 4, 1, 3]);
    const order = Uint32Array.from([0, 3, 1, 4, 2]);
    const runs = mergeOf(order, [0, 3], time, 5);
    expect(runs.kind).toBe('runs');
    expect(Array.from(assemble(runs, blocks, values, new Float32Array(5)))).toEqual([1, 10, 2, 20, 3]);
    // A block out of order needs the permutation itself.
    const unsorted = mergeOf(Uint32Array.from([1, 0, 3, 2, 4]), [0, 3], Float32Array.from([2, 1, 4, 3, 5]), 5);
    expect(unsorted.kind).toBe('order');
    expect(Array.from(assemble(unsorted, blocks, values, new Float32Array(5)))).toEqual([2, 1, 10, 3, 20]);
    expect(Array.from(assemble(mergeOf(null, [0, 3], time, 5), blocks, values, new Float32Array(5)))).toEqual([1, 2, 3, 10, 20]);
    expect(rowMapBytes({ blocks, merge: runs })).toBe(5);
  });

  it('reads a measure again exactly as the load would have', async () => {
    const src = await sameAsEager([table('a.parquet', 3000, 1), table('b.parquet', 2500, 2)], 'speed', 'number');
    // Two files each in time order: one byte a row says where each row went.
    expect(src.merge.kind).toBe('runs');
  });

  it('reads a category again with the same labels in the same order, a file without it read as empty', async () => {
    await sameAsEager([table('a.parquet', 2000, 3), table('b.parquet', 1500, 4, { withTag: false }), table('c.parquet', 1800, 5)], 'tag', 'category');
  });

  it('keeps the dataset order through an unsorted file, dropped positions and a stride', async () => {
    const src = await sameAsEager([table('a.parquet', 2000, 6, { sorted: false, nanEvery: 17 }), table('b.parquet', 1700, 7, { nanEvery: 5 })], 'speed', 'number', {}, 3);
    expect(src.merge.kind).toBe('order');
    expect(src.blocks.every((b) => b.step === 3 && b.drop && b.drop.length > 0)).toBe(true);
  });

  it('keeps the rows a pre-filter chose', async () => {
    const src = await sameAsEager([table('a.parquet', 4000, 8), table('b.parquet', 4000, 9)], 'tag', 'category', {
      rowFilter: [{ column: 'event', kind: 'set', values: ['kill'] }],
    });
    expect(src.blocks.every((b) => b.sel !== null && b.read < 4000)).toBe(true);
  });

  it('loads at once what a text file holds, since it has no column to read alone', async () => {
    const csv = new File(['time,x,y,player,event,speed\n0,1,2,a,move,3\n1,2,3,a,kill,4\n'], 'a.csv');
    const ds = (await ingestFiles({ files: [csv], mapping: mapping(['event'], ['speed']), columns: ['time', 'x', 'y', 'player', 'event', 'speed'], name: 't' })).dataset;
    expect(ds.columnSource).toBeUndefined();
    expect(ds.attrs.some((a) => a.name === 'speed')).toBe(true);
  });

  it('never leaves to later a column the load itself reads', () => {
    for (const name of ['event', 'type', 'vehicle', 'won', 'winner', 'round', 'cost_usd', 'Source file', 'sessionStart', 'campaign'])
      expect(onDemandEligible(name), name).toBe(false);
    for (const name of ['speed', 'ammo_left', 'm0', 'heading']) expect(onDemandEligible(name), name).toBe(true);
    expect(onDemandOf({ extra: ['speed'], onDemand: ['speed', 'm0', 'event', 'm0'] })).toEqual(['m0']);
  });

  it('evicts the least recently used column that is not pinned', () => {
    const entries = [
      { name: 'a', bytes: 100, lastUsed: 3 },
      { name: 'b', bytes: 100, lastUsed: 1 },
      { name: 'c', bytes: 100, lastUsed: 2 },
    ];
    expect(chooseEvictions(entries, new Set(), 500, 100, 1000)).toEqual([]);
    expect(chooseEvictions(entries, new Set(), 950, 100, 1000)).toEqual(['b']);
    expect(chooseEvictions(entries, new Set(['b']), 950, 250, 1000)).toEqual(['c', 'a']);
    expect(chooseEvictions(entries, new Set(['a', 'b', 'c']), 950, 150, 1000)).toEqual([]);
  });

  it('pins what the view reads', () => {
    const pins = pinnedColumns({
      filters: [{ kind: 'range', column: 'speed', min: 0, max: 1 }, { kind: 'teams', allowed: [] }],
      split: { kind: 'categories', column: 'tag', positive: [1], negative: [2] },
      heat: { weightBy: 'cost_usd' },
      lines: { column: 'event' },
    });
    expect([...pins].sort()).toEqual(['cost_usd', 'event', 'speed', 'tag']);
  });

  it('tells a copy of the rows from the rows reordered', () => {
    const ds = { count: 100, px: Float32Array.from({ length: 100 }, (_, i) => i), pz: new Float32Array(100), time: Float32Array.from({ length: 100 }, (_, i) => i) };
    expect(rowFingerprint({ ...ds })).toBe(rowFingerprint(ds));
    expect(rowFingerprint({ ...ds, px: ds.px.slice().reverse() })).not.toBe(rowFingerprint(ds));
  });
});
