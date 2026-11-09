import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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

/** A converter's loose files for one match, packed by the CLI; returns the folder and the loose bytes. */
function packed(keepLoose: boolean) {
  const dir = mkdtempSync(path.join(tmpdir(), '3dheat-container-'));
  const loose: Record<string, Uint8Array> = {
    [`${STEM}.parquet`]: new Uint8Array(table(60_000, 1)),
    [`${STEM}.flight.parquet`]: new Uint8Array(table(500, 2)),
    [`${STEM}.messages.parquet`]: new Uint8Array(table(3000, 3)),
    [`${STEM}.match.json`]: new TextEncoder().encode(JSON.stringify({ format: 'heat3d-wt-replay-match', match: STEM, map: 'm', started: '2026-11-09T12:00:00Z', players: Array.from({ length: 200 }, (_, i) => ({ name: `p${i}` })) })),
  };
  for (const [n, b] of Object.entries(loose)) writeFileSync(path.join(dir, n), b);
  // Settled: written "long ago" is not needed with --settle 0.
  execFileSync(process.execPath, [path.join(ROOT, 'tools/3dheat-pack.mjs'), dir, '--settle', '0', ...(keepLoose ? [] : ['--delete-loose'])], { stdio: 'pipe' });
  return { dir, loose, file: path.join(dir, `${STEM}.3dheat`) };
}

/** In memory: a file open in this process could not be replaced on Windows (repack renames over it). */
async function fileOf(p: string): Promise<File> {
  return new File([readFileSync(p)], path.basename(p));
}

describe('.3dheat containers', () => {
  it('packs a match into one file, and its table reads as the loose table did', async () => {
    const { dir, loose, file } = packed(false);
    try {
      expect(readdirSync(dir)).toEqual([`${STEM}.3dheat`]);
      const c = await openContainer(await fileOf(file));
      expect(c.manifest.format).toBe('3dheat');
      expect(c.manifest.game).toBe('warthunder');
      expect(c.manifest.roles.table).toBe(`${STEM}.parquet`);
      expect(c.manifest.members.find((m) => m.role === 'table')?.rows).toBe(60_000);
      expect(c.table!.name).toBe(`${STEM}.parquet`);
      expect(new Uint8Array(await c.table!.arrayBuffer())).toEqual(loose[`${STEM}.parquet`]);
      const fromLoose = await parquetReadObjects({ file: await new Blob([loose[`${STEM}.parquet`] as BlobPart]).arrayBuffer() });
      const fromContainer = await parquetReadObjects({ file: asyncBuffer(c.table!) });
      expect(fromContainer).toEqual(fromLoose);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('opens with two small reads, and reads sidecars and the match document only when asked', async () => {
    const { dir, loose, file } = packed(false);
    try {
      const whole = await fileOf(file);
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
      expect(whole.size).toBeGreaterThan(500_000);
      const flight = await sidecarOf(c.table!, 'flight');
      expect(flight!.name).toBe(`${STEM}.flight.parquet`);
      expect(new Uint8Array(await flight!.arrayBuffer())).toEqual(loose[`${STEM}.flight.parquet`]);
      expect(await c.member('objectives')).toBeNull();
      const doc = (await c.json('match')) as { match: string; players: unknown[] };
      expect(doc.match).toBe(STEM);
      expect(doc.players).toHaveLength(200);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('loads in the many-match loader by its byte range, as the loose table does', async () => {
    const { dir, loose, file } = packed(true);
    try {
      const { files, failed } = await expandContainers([{ file: await fileOf(file), relativePath: `wt/m/${STEM}.3dheat` }]);
      expect(failed).toEqual([]);
      const { accepted } = filterDataFiles(files);
      expect(accepted.map((f) => f.relativePath)).toEqual([`wt/m/${STEM}.parquet`]);
      const t = accepted[0].file;
      const looseFile = new File([loose[`${STEM}.parquet`] as BlobPart], `${STEM}.parquet`);
      const [a, b] = await Promise.all([parquetMetadataAsync(asyncBuffer(t)), parquetMetadataAsync(asyncBuffer(looseFile))]);
      expect(Number(a.num_rows)).toBe(Number(b.num_rows));
      // Pass 1 and 2 read row ranges of columns; one past a row group's edge.
      const [ca, cb] = await Promise.all([readColumns(t, a, ['time', 'track'], 4000, 9000), readColumns(looseFile, b, ['time', 'track'], 4000, 9000)]);
      expect(ca).toEqual(cb);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('unpacks to the loose files byte for byte', () => {
    const { dir, loose, file } = packed(false);
    try {
      execFileSync(process.execPath, [path.join(ROOT, 'tools/3dheat-pack.mjs'), 'unpack', file, '--delete-container'], { stdio: 'pipe' });
      expect(readdirSync(dir).sort()).toEqual(Object.keys(loose).sort());
      for (const [n, b] of Object.entries(loose)) expect(new Uint8Array(readFileSync(path.join(dir, n)))).toEqual(b);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('reads a container from a newer minor version with roles, fields and media it does not know, and keeps them through update and repack', async () => {
    const { dir, loose, file } = packed(false);
    try {
      writeFileSync(path.join(dir, 'voice.ogg'), new Uint8Array([79, 103, 103, 83, 1, 2, 3]));
      writeFileSync(path.join(dir, 'heat.json'), JSON.stringify({ format: 'future-analysis', version: '3.1', cells: [1, 2, 3] }));
      const future = path.join(dir, 'future.3dheat');
      // Written as a later writer would: format 1.7, a field, a member field and an extension this reader has never seen.
      const script = `
        import { writeContainer } from ${JSON.stringify(pathToFileURL(path.join(ROOT, 'tools/container.mjs')).href)};
        const [dir, out, stem] = process.argv.slice(1);
        await writeContainer(out, [
          { role: 'table', file: dir + '/' + stem + '.parquet', name: stem + '.parquet' },
          { role: 'voice', file: dir + '/voice.ogg', name: 'audio/voice.ogg', meta: { channel: 'team', offset_s: 1.5 } },
          { role: 'analysis', file: dir + '/heat.json', name: 'analysis/heat.json' },
        ], { game: 'future', base: { format_version: '1.7', weather_model: { gusts: true } }, extensions: { 'acme/sync': { fps: 120 } }, references: [{ kind: 'level', name: 'map.glb', sha256: 'ab'.repeat(32) }] });`;
      execFileSync(process.execPath, [path.join(ROOT, 'tools/3dheat-pack.mjs'), 'unpack', file], { stdio: 'pipe' });
      execFileSync(process.execPath, ['--input-type=module', '-e', script, dir, future, STEM], { stdio: 'pipe' });
      const c = await openContainer(await fileOf(future));
      expect(c.manifest.format_version).toBe('1.7');
      expect(c.manifest.weather_model).toEqual({ gusts: true });
      expect(c.manifest.extensions).toEqual({ 'acme/sync': { fps: 120 } });
      expect(new Uint8Array(await c.table!.arrayBuffer())).toEqual(loose[`${STEM}.parquet`]);
      const voice = c.manifest.members.find((m) => m.role === 'voice')!;
      expect(voice).toMatchObject({ name: 'audio/voice.ogg', media_type: 'audio/ogg', compression: 'stored', channel: 'team' });
      expect(c.manifest.members.find((m) => m.role === 'analysis')).toMatchObject({ compression: 'deflate', schema: { id: 'future-analysis', version: '3.1' } });
      expect(await c.json('analysis')).toEqual({ format: 'future-analysis', version: '3.1', cells: [1, 2, 3] });
      // Update: another table appended, the stored ones not rewritten; then repack: everything kept, the dead bytes gone.
      const pack = (...a: string[]) => execFileSync(process.execPath, [path.join(ROOT, 'tools/3dheat-pack.mjs'), ...a], { stdio: 'pipe' });
      writeFileSync(path.join(dir, 'b.parquet'), new Uint8Array(table(100, 9)));
      pack('update', future, '--add', `table:matches/b.parquet=${path.join(dir, 'b.parquet')}`);
      const u = await openContainer(await fileOf(future));
      expect(u.tables.map((t) => t.name)).toEqual([`future.parquet`, 'b.parquet']);
      expect(u.manifest.weather_model).toEqual({ gusts: true });
      expect(u.manifest.members.map((m) => m.role).sort()).toEqual(['analysis', 'table', 'table', 'voice']);
      pack('repack', future);
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
      const script = `
        import { writeContainer } from ${JSON.stringify(pathToFileURL(path.join(ROOT, 'tools/container.mjs')).href)};
        import fs from 'node:fs';
        const [f, dir] = process.argv.slice(1);
        fs.writeFileSync(dir + '/m.parquet', Buffer.from(${JSON.stringify(Array.from(new Uint8Array(table(10, 1))))}));
        await writeContainer(f, [{ role: 'table', file: dir + '/m.parquet' }], { base: { format_version: '2.0' } });`;
      execFileSync(process.execPath, ['--input-type=module', '-e', script, f, dir], { stdio: 'pipe' });
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
