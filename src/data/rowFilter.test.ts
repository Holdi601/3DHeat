import { describe, expect, it } from 'vitest';
import { parquetMetadataAsync } from 'hyparquet';
import { parquetWriteBuffer } from 'hyparquet-writer';
import { ingestParquet } from './ingestParquet';
import { ingestCsv } from './ingest';
import { ingestFiles } from './ingestFiles';
import { asyncBufferFromFile } from './parquet';
import {
  activeClauses,
  compileFilter,
  countMatches,
  expectedMatches,
  pruningFilter,
  selectRows,
  type RowFilterClause,
} from './rowFilter';
import { residentBytes } from './resident';
import { emptyColumnMapping, type ColumnMapping } from '../state/types';

/**
 * Synthetic matches only: movement rows with sparse kill and death events, the
 * shape of a real match table, at sizes a test can afford.
 */

interface Match {
  file: File;
  x: Float64Array;
  event: string[];
  team: string[];
  hp: Float64Array;
}

function match(name: string, n: number, seed: number, opts: { clustered?: boolean; rowGroupSize?: number } = {}): Match {
  let s = seed * 7919 + 1;
  const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  const event = Array.from({ length: n }, () => {
    const r = rnd();
    return r < 0.004 ? 'kill' : r < 0.008 ? 'death' : r < 0.05 ? 'fire' : r < 0.06 ? 'spot' : 'move';
  });
  // Events written apart from the movement, the way an event table lies on disk.
  if (opts.clustered) event.sort((a, b) => (a === 'move' ? 1 : 0) - (b === 'move' ? 1 : 0) || a.localeCompare(b));
  const x = Float64Array.from({ length: n }, (_, i) => i);
  const team = Array.from({ length: n }, (_, i) => (i % 2 ? 'red' : 'blue'));
  const hp = Float64Array.from({ length: n }, () => Math.floor(rnd() * 101));
  const buf = parquetWriteBuffer({
    columnData: [
      { name: 'time', data: Float64Array.from({ length: n }, (_, i) => i / 10), type: 'DOUBLE' },
      { name: 'x', data: x, type: 'DOUBLE' },
      { name: 'y', data: Float64Array.from({ length: n }, (_, i) => (i * 37) % 1000), type: 'DOUBLE' },
      { name: 'event', data: event, type: 'STRING' },
      { name: 'team', data: team, type: 'STRING' },
      { name: 'hp', data: hp, type: 'DOUBLE' },
      { name: 'detail', data: Array.from({ length: n }, (_, i) => `{"row":${i},"seed":${seed}}`), type: 'STRING' },
    ],
    rowGroupSize: opts.rowGroupSize ?? 4096,
  });
  return { file: new File([buf], name), x, event, team, hp };
}

function mapping(filter: RowFilterClause[], extra: string[] = ['event', 'hp']): ColumnMapping {
  return {
    ...emptyColumnMapping(),
    x: 'x',
    y: 'y',
    time: 'time',
    teamId: 'team',
    extra,
    extraNumeric: { event: false, hp: true },
    rowFilter: filter,
  };
}

const KILLS: RowFilterClause = { column: 'event', kind: 'set', values: ['kill', 'death'] };
const quiet = () => {};

describe('row filters while reading', () => {
  it('ignore clauses that restrict nothing', () => {
    expect(activeClauses([{ column: 'a', kind: 'set', values: [] }, { column: 'b', kind: 'range', min: null, max: null }])).toEqual([]);
    expect(activeClauses(undefined)).toEqual([]);
  });

  it('keep exactly the rows a brute-force test keeps', async () => {
    const m = match('a.parquet', 30_000, 1);
    const clauses: RowFilterClause[] = [KILLS, { column: 'hp', kind: 'range', min: 20, max: 80 }];
    const buf = asyncBufferFromFile(m.file);
    const sel = await selectRows(buf, await parquetMetadataAsync(buf), clauses, ['x']);
    const test = compileFilter(clauses);
    let want = 0;
    for (let i = 0; i < m.x.length; i++) {
      const pass = test({ event: m.event[i], hp: m.hp[i] });
      if (pass) want++;
      if (sel.keep[i] !== (pass ? 1 : 0) && sel.ranges.some((r) => i >= r.rowStart && i < r.rowEnd)) throw new Error(`row ${i}`);
    }
    expect(sel.count).toBe(want);
    expect(want).toBeGreaterThan(0);
  });

  it('skip row groups the statistics rule out, unread', async () => {
    const m = match('clustered.parquet', 100_000, 2, { clustered: true });
    const buf = asyncBufferFromFile(m.file);
    const md = await parquetMetadataAsync(buf);
    expect(pruningFilter([KILLS], md)).toEqual({ event: { $in: ['kill', 'death'] } });
    const sel = await selectRows(buf, md, [KILLS], ['x']);
    expect(sel.count).toBe(m.event.filter((e) => e === 'kill' || e === 'death').length);
    // Kills and deaths sort first: every group after them is skipped.
    expect(sel.groupsSkipped).toBeGreaterThan(sel.groups * 0.8);
    expect(sel.rowsSkipped).toBeGreaterThan(80_000);
  });

  it('load only the kept rows, each with its own values', async () => {
    const m = match('b.parquet', 40_000, 3);
    const block = await ingestParquet(m.file, mapping([KILLS]), quiet);
    const ev = block.attrs.find((a) => a.name === 'event')!;
    const hp = block.attrs.find((a) => a.name === 'hp')!;
    expect(ev.kind).toBe('category');
    const want = m.event.filter((e) => e === 'kill' || e === 'death').length;
    expect(block.rows).toBe(want);
    expect(block.filtered).toMatchObject({ rows: 40_000, kept: want });
    for (let k = 0; k < block.rows; k++) {
      const row = block.px[k]; // x is the row number in the file
      const label = ev.kind === 'category' ? ev.categories[ev.data[k]] : '';
      expect(label).toBe(m.event[row]);
      expect(hp.data[k]).toBe(m.hp[row]);
    }
  });

  it('read a filter column the mapping does not keep', async () => {
    const m = match('c.parquet', 20_000, 4);
    const block = await ingestParquet(m.file, mapping([KILLS], []), quiet);
    expect(block.attrs).toEqual([]);
    expect(block.rows).toBe(m.event.filter((e) => e === 'kill' || e === 'death').length);
  });

  it('treat a column the file lacks as empty: a file without it keeps nothing', async () => {
    const m = match('d.parquet', 5_000, 5);
    const block = await ingestParquet(m.file, mapping([{ column: 'weapon', kind: 'set', values: ['rifle'] }]), quiet);
    expect(block.rows).toBe(0);
    expect(block.filtered?.kept).toBe(0);
  });

  it('filter text files the same way', async () => {
    const n = 5_000;
    const m = match('e.parquet', n, 6);
    const lines = ['time,x,y,event,team,hp'];
    for (let i = 0; i < n; i++) lines.push(`${i / 10},${i},${(i * 37) % 1000},${m.event[i]},${m.team[i]},${m.hp[i]}`);
    const csv = new File([lines.join('\n') + '\n'], 'e.csv');
    const map = mapping([KILLS, { column: 'team', kind: 'set', values: ['red'] }]);
    const fromCsv = await ingestCsv(csv, map, ['time', 'x', 'y', 'event', 'team', 'hp'], quiet);
    const fromParquet = await ingestParquet(m.file, map, quiet);
    expect(fromCsv.rows).toBe(fromParquet.rows);
    expect(Array.from(fromCsv.px)).toEqual(Array.from(fromParquet.px));
    expect(fromCsv.filtered?.kept).toBe(fromCsv.rows);
  });

  it('count a selection from the filter columns, exactly or from a sample', async () => {
    const files = [1, 2, 3, 4].map((i) => match(`m${i}.parquet`, 10_000, 10 + i));
    const want = files.reduce((a, m) => a + m.event.filter((e) => e === 'kill' || e === 'death').length, 0);
    const exact = await countMatches(files.map((m) => m.file), [KILLS]);
    expect(exact).toMatchObject({ matched: want, exact: true, scannedFiles: 4 });
    // A clock that runs out after the first file: the rest is extrapolated.
    let tick = 0;
    const sampled = await countMatches(files.map((m) => m.file), [KILLS], 1, () => (tick++ === 0 ? 0 : 10));
    expect(sampled.exact).toBe(false);
    expect(sampled.scannedFiles).toBe(1);
    const est = expectedMatches(sampled, 40_000);
    expect(Math.abs(est - want) / want).toBeLessThan(0.35);
  });

  it('merge filtered matches, an emptied one being no failure', async () => {
    const files = [match('p.parquet', 8_000, 21), match('q.parquet', 8_000, 22)];
    const sparse = new File([parquetWriteBuffer({
      columnData: [
        { name: 'time', data: Float64Array.from([0, 1]), type: 'DOUBLE' },
        { name: 'x', data: Float64Array.from([0, 1]), type: 'DOUBLE' },
        { name: 'y', data: Float64Array.from([0, 1]), type: 'DOUBLE' },
        { name: 'event', data: ['move', 'move'], type: 'STRING' },
        { name: 'team', data: ['red', 'blue'], type: 'STRING' },
        { name: 'hp', data: Float64Array.from([1, 2]), type: 'DOUBLE' },
      ],
    })], 'quiet.parquet');
    const { dataset, failures } = await ingestFiles({
      files: [...files.map((m) => m.file), sparse],
      mapping: mapping([KILLS]),
      columns: [],
      name: 'kills',
    });
    const want = files.reduce((a, m) => a + m.event.filter((e) => e === 'kill' || e === 'death').length, 0);
    expect(failures).toEqual([]);
    expect(dataset.count).toBe(want);
    expect(dataset.said?.notes.some((n) => n.key === 'data.ingestFiles.prefiltered')).toBe(true);
  });

  it('report what a pre-filtered mass load costs', async () => {
    // Sixty matches of 50,000 rows, kills and deaths only: the numbers in the log.
    const files = Array.from({ length: 60 }, (_, i) => match(`mass${i}.parquet`, 50_000, 100 + i).file);
    const t0 = performance.now();
    const full = await ingestFiles({ files, mapping: mapping([]), columns: [], name: 'all' });
    const tFull = performance.now() - t0;
    const t1 = performance.now();
    const { dataset } = await ingestFiles({ files, mapping: mapping([KILLS]), columns: [], name: 'kills' });
    const tKills = performance.now() - t1;
    expect(dataset.count).toBeLessThan(full.dataset.count * 0.02);
    const mb = (n: number) => (n / 1e6).toFixed(1);
    process.stderr.write(
      `[rowFilter] 60 matches x 50k rows: full ${full.dataset.count} rows, ${mb(residentBytes(full.dataset))} MB resident, ${tFull.toFixed(0)} ms; ` +
        `kills+deaths ${dataset.count} rows, ${mb(residentBytes(dataset))} MB resident, ${tKills.toFixed(0)} ms\n`,
    );
  }, 60_000);
});
