/**
 * Test vectors for the dataset build: small synthetic Parquet tables and the
 * loads made of them (`build/cases.json`). The web app's build
 * (`src/data/native/buildVectors.test.ts`, which also writes `build/expected.json`
 * with `UPDATE_VECTORS=1`) and the native core's (`native/crates/core/tests/build_vectors.rs`)
 * are both checked against them. Everything in them is made up here.
 *
 *   node native/vectors/make-build-vectors.mjs
 *
 * Each case names its files, a mapping (`ColumnMapping` fields over
 * `emptyColumnMapping()`), a stride and a row filter. Between them they cover
 * unsorted and tied times, rows without a position, the stride, the row filter,
 * the axes (Z-up, flips, scale), wall-clock times (TIMESTAMP and unix
 * milliseconds), yaw and pitch in degrees, look vectors, extras present in some
 * files only, a file that fails, sessions, recordings far apart aligned, a
 * campaign series, a category past the ceiling and a name worn twice.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ParquetWriter, fileWriter } from 'hyparquet-writer';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'build');
fs.mkdirSync(out, { recursive: true });

/** A deterministic generator, so the vectors never change unless this file does. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const kinds = {
  f32: { type: 'FLOAT' },
  f64: { type: 'DOUBLE' },
  str: { type: 'BYTE_ARRAY', converted_type: 'UTF8' },
  ms: { type: 'INT64', converted_type: 'TIMESTAMP_MILLIS' },
};

/** Writes `cols` ({name: [kind, values]}) as one file, in row groups of `group`. */
function write(name, cols, group = 40) {
  const entries = Object.entries(cols);
  const w = new ParquetWriter({
    writer: fileWriter(path.join(out, name)),
    schema: [{ name: 'root', num_children: entries.length }, ...entries.map(([n, [k]]) => ({ name: n, ...kinds[k], repetition_type: 'OPTIONAL' }))],
    kvMetadata: [],
    statistics: true,
  });
  const rows = entries[0][1][1].length;
  for (let at = 0; at < rows; at += group) {
    w.write({
      columnData: entries.map(([n, [k, v]]) => ({
        name: n,
        data: v.slice(at, at + group).map((x) => (x === null || x === undefined ? null : k === 'ms' ? BigInt(Math.round(x)) : x)),
      })),
      rowGroupSize: group,
    });
  }
  w.finish();
}

function walk(n, seed, opts = {}) {
  const r = rng(seed);
  const people = opts.people ?? 6;
  const cols = { x: ['f32', []], y: ['f32', []], z: ['f32', []], time: ['f64', []], player: ['str', []], team: ['str', []] };
  for (let i = 0; i < n; i++) {
    const p = Math.floor(r() * people);
    cols.x[1].push(Math.fround((r() - 0.5) * 2000));
    cols.y[1].push(Math.fround((r() - 0.5) * 2000));
    cols.z[1].push(Math.fround(r() * 50));
    // Ties and disorder: whole tenths, drawn at random.
    cols.time[1].push((opts.t0 ?? 0) + Math.floor(r() * (opts.span ?? 60) * 10) / 10);
    cols.player[1].push(`p${p}`);
    cols.team[1].push(p % 2 ? 'blue' : 'red');
  }
  return { cols, r };
}

// A: one file, Z-up with a flip and a scale, rows without a position, extras.
{
  const { cols, r } = walk(300, 1);
  cols.x[1][7] = null;
  cols.z[1][11] = NaN;
  cols.y[1][19] = Infinity;
  cols.speed = ['f32', cols.x[1].map(() => Math.fround(r() * 30))];
  cols.speed[1][4] = NaN;
  cols.gear = ['str', cols.x[1].map(() => ['low', 'high', 'mid', ''][Math.floor(r() * 4)])];
  cols.gear[1][5] = null;
  write('a.parquet', cols);
}

// B: three files, extras in some only, wall-clock times, one file without a player column.
{
  const b1 = walk(120, 2);
  b1.cols.time = ['ms', b1.cols.time[1].map((t) => 1.7e12 + t * 1000)];
  b1.cols.speed = ['f32', b1.cols.x[1].map(() => Math.fround(b1.r() * 30))];
  write('b1.parquet', b1.cols);
  const b2 = walk(90, 3);
  b2.cols.time = ['ms', b2.cols.time[1].map((t) => 1.7e12 + 30_000 + t * 1000)];
  b2.cols.gear = ['str', b2.cols.x[1].map(() => (b2.r() < 0.5 ? 'up' : 'down'))];
  write('b2.parquet', b2.cols);
  const b3 = walk(50, 4);
  delete b3.cols.player;
  b3.cols.time = ['ms', b3.cols.time[1].map((t) => 1.7e12 + t * 1000)];
  write('b3.parquet', b3.cols);
  // The same rows with time as plain unix milliseconds (DOUBLE), for the unit path.
  const b4 = walk(80, 5);
  b4.cols.time = ['f64', b4.cols.time[1].map((t) => 1.7e12 + 5_000 + t * 1000)];
  write('b4.parquet', b4.cols);
}

// C: two recordings a year apart, one session each, yaw and pitch in degrees.
{
  for (const [k, t0] of [
    [1, 1_000],
    [2, 1_000 + 365 * 86400],
  ]) {
    const { cols, r } = walk(100, 10 + k, { t0, span: 120 });
    cols.session = ['str', cols.x[1].map(() => `match ${k}`)];
    cols.heading = ['f32', cols.x[1].map(() => Math.fround(r() * 360 - 180))];
    cols.elev = ['f32', cols.x[1].map(() => Math.fround(r() * 60 - 30))];
    cols.heading[1][3] = null;
    write(`c${k}.parquet`, cols);
  }
}

// D: a campaign round in three sessions, out of order, each with its real start.
{
  const starts = [1_700_100_000, 1_700_000_000, 1_700_050_000];
  starts.forEach((real, k) => {
    const { cols } = walk(60, 20 + k, { t0: 500 + k * 7, span: 200 });
    const stamp = new Date(real * 1000).toISOString().slice(0, 16).replace('T', ' ');
    cols.session = ['str', cols.x[1].map(() => `Round 7 ${stamp}`)];
    cols.campaign = ['str', cols.x[1].map(() => 'Op North')];
    cols.sessionStart = ['f32', cols.x[1].map(() => Math.fround(real + 40))];
    write(`d${k + 1}.parquet`, cols);
  });
}

// E: look vectors, a category past the ceiling, names worn twice, sessions interleaved.
{
  const n = 5000;
  const { cols, r } = walk(n, 30, { people: 9, span: 30 });
  cols.dx = ['f32', cols.x[1].map(() => Math.fround(r() * 2 - 1))];
  cols.dy = ['f32', cols.x[1].map(() => Math.fround(r() * 2 - 1))];
  cols.dz = ['f32', cols.x[1].map(() => Math.fround(r() * 2 - 1))];
  cols.dz[1][2] = null;
  cols.serial = ['str', cols.x[1].map((_, i) => `s${i}`)];
  cols.round = ['str', cols.x[1].map(() => (r() < 0.5 ? 'r1' : 'r2'))];
  // p0 at two places at one instant, the same kind of record, far apart.
  for (let i = 100; i < 140; i += 2) {
    cols.player[1][i] = 'p0';
    cols.player[1][i + 1] = 'p0';
    cols.time[1][i + 1] = cols.time[1][i];
    cols.x[1][i + 1] = Math.fround(cols.x[1][i] + 900);
  }
  write('e.parquet', cols, 700);
}

const cases = [
  {
    name: 'single file, axes, bad rows, extras',
    files: ['a.parquet'],
    mapping: { x: 'x', y: 'y', z: 'z', time: 'time', personId: 'player', teamId: 'team', extra: ['speed', 'gear'], extraNumeric: { speed: true, gear: false }, axes: { up: 'z', flipX: true, flipY: false, flipZ: false, scale: 2 } },
    stride: 1,
  },
  {
    name: 'single file, Y-up, stride and a row filter',
    files: ['a.parquet'],
    mapping: { x: 'x', y: 'z', z: 'y', time: 'time', personId: 'player', teamId: 'team', extra: ['gear'], extraNumeric: { gear: false }, axes: { up: 'y', flipX: false, flipY: false, flipZ: true, scale: 1 }, rowFilter: [{ column: 'speed', kind: 'range', min: 3, max: 25 }, { column: 'gear', kind: 'set', values: ['low', 'mid', ''] }] },
    stride: 3,
  },
  {
    name: 'files with extras in some, wall clock, one failing',
    files: ['b1.parquet', 'b2.parquet', 'b3.parquet', 'b4.parquet'],
    mapping: { x: 'x', y: 'y', z: 'z', time: 'time', timeUnit: 'unix_milliseconds', personId: 'player', teamId: 'team', extra: ['speed', 'gear'], extraNumeric: { speed: true, gear: false } },
    stride: 1,
  },
  {
    name: 'recordings far apart, sessions, yaw and pitch',
    files: ['c1.parquet', 'c2.parquet'],
    mapping: { x: 'x', y: 'y', z: 'z', time: 'time', personId: 'player', teamId: 'team', sessionId: 'session', lookMode: 'yawPitch', yaw: 'heading', pitch: 'elev', angleUnit: 'degrees' },
    stride: 1,
  },
  {
    name: 'a campaign round in three sessions',
    files: ['d1.parquet', 'd2.parquet', 'd3.parquet'],
    mapping: { x: 'x', y: 'y', z: 'z', time: 'time', personId: 'player', teamId: 'team', sessionId: 'session', extra: ['campaign', 'sessionStart'], extraNumeric: { campaign: false, sessionStart: true } },
    stride: 1,
  },
  {
    name: 'look vectors, a category past the ceiling, names worn twice',
    files: ['e.parquet'],
    mapping: { x: 'x', y: 'y', z: 'z', time: 'time', personId: 'player', teamId: 'team', sessionId: 'round', lookMode: 'vector', dirX: 'dx', dirY: 'dy', dirZ: 'dz', extra: ['serial'], extraNumeric: { serial: false }, byHand: ['serial'] },
    stride: 1,
  },
];
fs.writeFileSync(path.join(out, 'cases.json'), JSON.stringify(cases, null, 1) + '\n');
console.log(`wrote ${cases.length} cases to ${out}`);
