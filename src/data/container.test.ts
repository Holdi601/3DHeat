import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parquetMetadataAsync, parquetReadObjects } from 'hyparquet';
import { parquetWriteBuffer } from 'hyparquet-writer';
import { expandContainers, openContainer, sidecarOf } from './container';
import { filterDataFiles } from './filePick';
import { asyncBuffer, readColumns } from '../overlay/lean/columns';

const ROOT = path.resolve(__dirname, '../..');
const STEM = 'm_RB_2026-11-09_12-00-00_abc';

function table(n: number, seed: number): ArrayBuffer {
  return parquetWriteBuffer({
    columnData: [
      { name: 'time', data: Float64Array.from({ length: n }, (_, i) => i / 10 + seed), type: 'DOUBLE' },
      { name: 'x', data: Float64Array.from({ length: n }, (_, i) => Math.sin(i + seed) * 1000), type: 'DOUBLE' },
      { name: 'track', data: Array.from({ length: n }, (_, i) => `u${(i + seed) % 17}`), type: 'STRING' },
    ],
    rowGroupSize: 4096,
  });
}

/**
 * A converter's loose files for one match, made once: a table of several row groups (the byte-range read below
 * crosses one), a flight and a messages sidecar, and a match document.
 */
const LOOSE: Record<string, Uint8Array> = {
  [`${STEM}.parquet`]: new Uint8Array(table(20_000, 1)),
  [`${STEM}.flight.parquet`]: new Uint8Array(table(500, 2)),
  [`${STEM}.messages.parquet`]: new Uint8Array(table(3000, 3)),
  [`${STEM}.match.json`]: new TextEncoder().encode(JSON.stringify({ format: 'heat3d-wt-replay-match', match: STEM, map: 'm', started: '2026-11-09T12:00:00Z', players: Array.from({ length: 200 }, (_, i) => ({ name: `p${i}` })) })),
};

/** The pack CLI, run as a user runs it: a node process of its own, the slow part of these tests. */
const cli = (...a: string[]) => execFileSync(process.execPath, [path.join(ROOT, 'tools/3dheat-pack.mjs'), ...a], { stdio: 'pipe' });

/** A new folder with the loose files in it. */
function looseDir(): string {
  const dir = mkdtempSync(path.join(tmpdir(), '3dheat-container-'));
  for (const [n, b] of Object.entries(LOOSE)) writeFileSync(path.join(dir, n), b);
  return dir;
}

/** The loose files packed by the CLI; returns the folder and the container's path. */
function packed(keepLoose: boolean) {
  const dir = looseDir();
  // Settled: written "long ago" is not needed with --settle 0.
  cli(dir, '--settle', '0', ...(keepLoose ? [] : ['--delete-loose']));
  return { dir, file: path.join(dir, `${STEM}.3dheat`) };
}

type WriteContainer = (out: string, members: unknown[], info?: unknown) => Promise<void>;

/** The writer of tools/container.mjs, called in this process as a later writer would call it. */
async function writer(): Promise<WriteContainer> {
  const m = (await import(/* @vite-ignore */ pathToFileURL(path.join(ROOT, 'tools/container.mjs')).href)) as { writeContainer: WriteContainer };
  return m.writeContainer;
}

/** In memory: a file open in this process could not be replaced on Windows (repack renames over it). */
async function fileOf(p: string): Promise<File> {
  return new File([readFileSync(p)], path.basename(p));
}

// The CLI's processes can take seconds each while the whole suite runs in parallel: these tests get room for them.
describe('.3dheat containers', { timeout: 60_000 }, () => {
  // Packed once for the tests that only read a container; a test that changes one works on its own.
  let A: { dir: string; file: string } | undefined;
  let B: { dir: string; file: string } | undefined;
  beforeAll(() => {
    A = packed(false);
    B = packed(true);
  }, 120_000);
  afterAll(() => {
    for (const x of [A, B]) if (x) rmSync(x.dir, { recursive: true, force: true });
  });

  it('packs a match into one file, and its table reads as the loose table did', async () => {
    const { dir, file } = A!;
    expect(readdirSync(dir)).toEqual([`${STEM}.3dheat`]);
    const c = await openContainer(await fileOf(file));
    expect(c.manifest.format).toBe('3dheat');
    expect(c.manifest.game).toBe('warthunder');
    expect(c.manifest.roles.table).toBe(`${STEM}.parquet`);
    expect(c.manifest.members.find((m) => m.role === 'table')?.rows).toBe(20_000);
    expect(c.table!.name).toBe(`${STEM}.parquet`);
    expect(new Uint8Array(await c.table!.arrayBuffer())).toEqual(LOOSE[`${STEM}.parquet`]);
    const fromLoose = await parquetReadObjects({ file: await new Blob([LOOSE[`${STEM}.parquet`] as BlobPart]).arrayBuffer() });
    const fromContainer = await parquetReadObjects({ file: asyncBuffer(c.table!) });
    expect(fromContainer).toEqual(fromLoose);
  });

  it('opens with two small reads, and reads sidecars and the match document only when asked', async () => {
    const whole = await fileOf(A!.file);
    const read: number[] = [];
    const counted = new Proxy(whole, {
      get(t, k) {
        if (k === 'slice')
          return (s?: number, e?: number) => {
            const b = t.slice(s, e);
            read.push(b.size);
            return b;
          };
        const v = Reflect.get(t, k, t);
        return typeof v === 'function' ? v.bind(t) : v;
      },
    });
    const c = await openContainer(counted);
    // The tail and the head; the table's slice is not read by opening.
    const opened = read.slice(0, -1);
    expect(opened.length).toBe(2);
    expect(opened.reduce((a, b) => a + b, 0)).toBeLessThan(8192);
    expect(whole.size).toBeGreaterThan(100_000);
    const flight = await sidecarOf(c.table!, 'flight');
    expect(flight!.name).toBe(`${STEM}.flight.parquet`);
    expect(new Uint8Array(await flight!.arrayBuffer())).toEqual(LOOSE[`${STEM}.flight.parquet`]);
    expect(await c.member('objectives')).toBeNull();
    const doc = (await c.json('match')) as { match: string; players: unknown[] };
    expect(doc.match).toBe(STEM);
    expect(doc.players).toHaveLength(200);
  });

  it('loads in the many-match loader by its byte range, as the loose table does', async () => {
    const { files, failed } = await expandContainers([{ file: await fileOf(B!.file), relativePath: `wt/m/${STEM}.3dheat` }]);
    expect(failed).toEqual([]);
    const { accepted } = filterDataFiles(files);
    expect(accepted.map((f) => f.relativePath)).toEqual([`wt/m/${STEM}.parquet`]);
    const t = accepted[0].file;
    const looseFile = new File([LOOSE[`${STEM}.parquet`] as BlobPart], `${STEM}.parquet`);
    const [a, b] = await Promise.all([parquetMetadataAsync(asyncBuffer(t)), parquetMetadataAsync(asyncBuffer(looseFile))]);
    expect(Number(a.num_rows)).toBe(Number(b.num_rows));
    // Pass 1 and 2 read row ranges of columns; one past a row group's edge.
    const [ca, cb] = await Promise.all([readColumns(t, a, ['time', 'track'], 4000, 9000), readColumns(looseFile, b, ['time', 'track'], 4000, 9000)]);
    expect(ca).toEqual(cb);
  });

  it('unpacks to the loose files byte for byte', () => {
    const dir = mkdtempSync(path.join(tmpdir(), '3dheat-container-'));
    const file = path.join(dir, `${STEM}.3dheat`);
    copyFileSync(A!.file, file);
    try {
      cli('unpack', file, '--delete-container');
      expect(readdirSync(dir).sort()).toEqual(Object.keys(LOOSE).sort());
      for (const [n, b] of Object.entries(LOOSE)) expect(new Uint8Array(readFileSync(path.join(dir, n)))).toEqual(b);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('reads a container from a newer minor version with roles, fields and media it does not know, and keeps them through update and repack', async () => {
    const dir = looseDir();
    try {
      writeFileSync(path.join(dir, 'voice.ogg'), new Uint8Array([79, 103, 103, 83, 1, 2, 3]));
      writeFileSync(path.join(dir, 'heat.json'), JSON.stringify({ format: 'future-analysis', version: '3.1', cells: [1, 2, 3] }));
      const future = path.join(dir, 'future.3dheat');
      // Written as a later writer would: format 1.7, a field, a member field and an extension this reader has never seen.
      await (await writer())(
        future,
        [
          { role: 'table', file: path.join(dir, `${STEM}.parquet`), name: `${STEM}.parquet` },
          { role: 'voice', file: path.join(dir, 'voice.ogg'), name: 'audio/voice.ogg', meta: { channel: 'team', offset_s: 1.5 } },
          { role: 'analysis', file: path.join(dir, 'heat.json'), name: 'analysis/heat.json' },
        ],
        { game: 'future', base: { format_version: '1.7', weather_model: { gusts: true } }, extensions: { 'acme/sync': { fps: 120 } }, references: [{ kind: 'level', name: 'map.glb', sha256: 'ab'.repeat(32) }] },
      );
      const c = await openContainer(await fileOf(future));
      expect(c.manifest.format_version).toBe('1.7');
      expect(c.manifest.weather_model).toEqual({ gusts: true });
      expect(c.manifest.extensions).toEqual({ 'acme/sync': { fps: 120 } });
      expect(new Uint8Array(await c.table!.arrayBuffer())).toEqual(LOOSE[`${STEM}.parquet`]);
      const voice = c.manifest.members.find((m) => m.role === 'voice')!;
      expect(voice).toMatchObject({ name: 'audio/voice.ogg', media_type: 'audio/ogg', compression: 'stored', channel: 'team' });
      expect(c.manifest.members.find((m) => m.role === 'analysis')).toMatchObject({ compression: 'deflate', schema: { id: 'future-analysis', version: '3.1' } });
      expect(await c.json('analysis')).toEqual({ format: 'future-analysis', version: '3.1', cells: [1, 2, 3] });
      // Update: another table appended, the stored ones not rewritten; then repack: everything kept, the dead bytes gone.
      writeFileSync(path.join(dir, 'b.parquet'), new Uint8Array(table(100, 9)));
      cli('update', future, '--add', `table:matches/b.parquet=${path.join(dir, 'b.parquet')}`);
      const u = await openContainer(await fileOf(future));
      expect(u.tables.map((t) => t.name)).toEqual([`future.parquet`, 'b.parquet']);
      expect(u.manifest.weather_model).toEqual({ gusts: true });
      expect(u.manifest.members.map((m) => m.role).sort()).toEqual(['analysis', 'table', 'table', 'voice']);
      cli('repack', future);
      const r = await openContainer(await fileOf(future));
      expect(r.manifest.members).toEqual(u.manifest.members);
      expect(r.manifest.extensions).toEqual({ 'acme/sync': { fps: 120 } });
      expect(new Uint8Array(await (await r.open('audio/voice.ogg'))!.arrayBuffer())).toEqual(new Uint8Array([79, 103, 103, 83, 1, 2, 3]));
      const { files } = await expandContainers([{ file: await fileOf(future), relativePath: 'f/future.3dheat' }]);
      expect(files.map((f) => f.relativePath)).toEqual(['f/future.parquet', 'f/b.parquet']);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('refuses a container of a newer major version', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), '3dheat-container-'));
    try {
      const f = path.join(dir, 'm.3dheat');
      writeFileSync(path.join(dir, 'm.parquet'), new Uint8Array(table(10, 1)));
      await (await writer())(f, [{ role: 'table', file: path.join(dir, 'm.parquet') }], { base: { format_version: '2.0' } });
      await expect(openContainer(await fileOf(f))).rejects.toThrow(/newer/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('leaves a file that is not a container out, named', async () => {
    const bad = new File([new Uint8Array(100)], 'x.3dheat');
    const r = await expandContainers([{ file: bad, relativePath: 'x.3dheat' }]);
    expect(r.failed).toEqual(['x.3dheat']);
    expect(r.files).toEqual([]);
  });
});
