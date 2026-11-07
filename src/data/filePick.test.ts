import { describe, expect, it } from 'vitest';
import { filterDataFiles, isDataFile, type PickedFile } from './filePick';

/**
 * Which files a dropped folder actually loads.
 *
 * A telemetry export is one movement table per environment plus dozens of
 * unrelated ones, and none of those carry a position. The rule has to drop them without also breaking the case of
 * a folder holding a single positions file under some other name.
 */

const pick = (relativePath: string, size = 1024): PickedFile => ({
  relativePath,
  file: { name: relativePath.split('/').pop() ?? relativePath, size } as File,
});

describe('isDataFile', () => {
  it('accepts the loadable extensions and nothing else', () => {
    // .json and .json.gz: OCAP recordings of Arma 3 missions.
    for (const n of ['a.parquet', 'a.pq', 'a.csv', 'a.tsv', 'a.txt', 'a.acmi', 'a.json', 'a.json.gz']) {
      expect(isDataFile(n)).toBe(true);
    }
    for (const n of ['a.gz', 'a.glb', 'a.png', 'a']) expect(isDataFile(n)).toBe(false);
    // A CS2 match summary beside its table is not a recording.
    for (const n of ['de_x.match.json', 'soni.course.json']) expect(isDataFile(n)).toBe(false);
  });
});

describe('filterDataFiles', () => {
  it('keeps only movement files when a folder has them', () => {
    const { accepted, skipped } = filterDataFiles([
      pick('13/eu_env/Movement/Logs/movement.parquet'),
      pick('13/eu_env/Other/logins.parquet'),
      pick('13/eu_env/Other/events.parquet'),
    ]);
    expect(accepted.map((f) => f.file.name)).toEqual(['movement.parquet']);
    expect(skipped).toHaveLength(2);
    expect(skipped[0].reason).toMatch(/movement/);
  });

  it('keeps a split movement table in all its parts', () => {
    // The same export arrives as movement.parquet, movement_1.parquet and so on
    // when a table is chunked, and every part is wanted.
    const { accepted } = filterDataFiles([
      pick('a/movement.parquet'),
      pick('a/movement_1.parquet'),
      pick('a/movement_2.parquet'),
      pick('a/results.parquet'),
    ]);
    expect(accepted).toHaveLength(3);
  });

  it('loads a folder that has no movement file at all', () => {
    // The rule is "prefer movement where it exists", not "require movement". One
    // CSV of positions under its own name has to still work, or the filter
    // becomes a wall in front of every dataset that is not this one export
    // format.
    const { accepted, skipped } = filterDataFiles([
      pick('positions.csv'),
      pick('more/points.parquet'),
    ]);
    expect(accepted).toHaveLength(2);
    expect(skipped).toHaveLength(0);
  });

  it('still drops empty files and non-data files', () => {
    const { accepted, skipped } = filterDataFiles([
      pick('a/movement.parquet'),
      pick('a/movement_empty.parquet', 0),
      pick('a/readme.md'),
    ]);
    expect(accepted).toHaveLength(1);
    expect(skipped.map((s) => s.reason).sort()).toEqual([
      'empty (0 bytes)',
      'not a csv/parquet file',
    ]);
  });

  it('orders accepted files deterministically', () => {
    // Directory order varies between runs, and a different order means a
    // different dataset id and a reshuffled roster — so team colours would move
    // between loads of the same data.
    const one = filterDataFiles([
      pick('z/movement.parquet'),
      pick('a/movement.parquet'),
      pick('m/movement.parquet'),
    ]);
    const two = filterDataFiles([
      pick('m/movement.parquet'),
      pick('z/movement.parquet'),
      pick('a/movement.parquet'),
    ]);
    expect(one.accepted.map((f) => f.relativePath)).toEqual(
      two.accepted.map((f) => f.relativePath),
    );
    expect(one.accepted[0].relativePath).toBe('a/movement.parquet');
  });

  it('is case-insensitive about the name', () => {
    const { accepted } = filterDataFiles([pick('a/Movement.PARQUET'), pick('a/logins.parquet')]);
    expect(accepted).toHaveLength(1);
  });
});
