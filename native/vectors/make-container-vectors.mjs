/**
 * Test vectors for the `.3dheat` readers: small synthetic containers and what
 * each holds, which the web app's reader (`src/data/container.test.ts`) and the
 * native core's (`native/crates/core/tests/container_vectors.rs`) are both
 * checked against. Everything in them is made up here.
 *
 *   node native/vectors/make-container-vectors.mjs
 *
 * - `written.3dheat`: by the repository's own writer (tools/container.mjs): the
 *   manifest first and deflated, a stored Parquet table, a deflated match
 *   document, a stored sidecar table.
 * - `two-tables.3dheat`: hand-laid: two stored tables, a member of a role no
 *   reader knows, the manifest last, a newer minor version.
 * - `zip64.3dheat`: the same members, with ZIP64 records and extras.
 *
 * `expected.json` lists, per vector, the manifest's version and roles, the tables
 * in order, and every member's method, sizes, data offset and SHA-256.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { ParquetWriter, fileWriter } from 'hyparquet-writer';
import { writeContainer } from '../../tools/container.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'container');
fs.mkdirSync(out, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'heat3d-vectors-'));

function table(file, rows, seed) {
  const w = new ParquetWriter({
    writer: fileWriter(file),
    schema: [
      { name: 'root', num_children: 4 },
      { name: 'x', type: 'FLOAT', repetition_type: 'REQUIRED' },
      { name: 'y', type: 'FLOAT', repetition_type: 'REQUIRED' },
      { name: 'time', type: 'DOUBLE', repetition_type: 'REQUIRED' },
      { name: 'player', type: 'BYTE_ARRAY', converted_type: 'UTF8', repetition_type: 'REQUIRED' },
    ],
    kvMetadata: [],
  });
  const x = Float32Array.from({ length: rows }, (_, i) => Math.sin(i + seed) * 100);
  const y = Float32Array.from({ length: rows }, (_, i) => Math.cos(i * 0.5 + seed) * 100);
  const t = Float64Array.from({ length: rows }, (_, i) => i * 0.25);
  const p = Array.from({ length: rows }, (_, i) => `p${(i + seed) % 5}`);
  w.write({ columnData: [{ name: 'x', data: x }, { name: 'y', data: y }, { name: 'time', data: t }, { name: 'player', data: p }], rowGroupSize: 64 });
  w.finish();
}

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const crc = (b) => zlib.crc32(b);

/** A ZIP from members `{name, data, deflate}`, in order, optionally with ZIP64 records. */
function zip(members, zip64 = false) {
  const parts = [];
  const cd = [];
  let at = 0;
  for (const m of members) {
    const data = m.deflate ? zlib.deflateRawSync(m.data) : m.data;
    const name = Buffer.from(m.name);
    const extra = zip64 ? Buffer.alloc(4 + 24) : Buffer.alloc(0);
    if (zip64) {
      extra.writeUInt16LE(1, 0);
      extra.writeUInt16LE(24, 2);
      extra.writeBigUInt64LE(BigInt(m.data.length), 4);
      extra.writeBigUInt64LE(BigInt(data.length), 12);
      extra.writeBigUInt64LE(BigInt(at), 20);
    }
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(zip64 ? 45 : 20, 4);
    lh.writeUInt16LE(m.deflate ? 8 : 0, 8);
    lh.writeUInt32LE(crc(m.data), 14);
    lh.writeUInt32LE(data.length, 18);
    lh.writeUInt32LE(m.data.length, 22);
    lh.writeUInt16LE(name.length, 26);
    lh.writeUInt16LE(0, 28);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(zip64 ? 45 : 20, 4);
    ch.writeUInt16LE(zip64 ? 45 : 20, 6);
    ch.writeUInt16LE(m.deflate ? 8 : 0, 10);
    ch.writeUInt32LE(crc(m.data), 16);
    ch.writeUInt32LE(zip64 ? 0xffffffff : data.length, 20);
    ch.writeUInt32LE(zip64 ? 0xffffffff : m.data.length, 24);
    ch.writeUInt16LE(name.length, 28);
    ch.writeUInt16LE(extra.length, 30);
    ch.writeUInt32LE(zip64 ? 0xffffffff : at, 42);
    cd.push(ch, name, extra);
    parts.push(lh, name, data);
    at += 30 + name.length + data.length;
  }
  const cdBuf = Buffer.concat(cd);
  const tail = [];
  if (zip64) {
    const rec = Buffer.alloc(56);
    rec.writeUInt32LE(0x06064b50, 0);
    rec.writeBigUInt64LE(44n, 4);
    rec.writeUInt16LE(45, 12);
    rec.writeUInt16LE(45, 14);
    rec.writeBigUInt64LE(BigInt(members.length), 24);
    rec.writeBigUInt64LE(BigInt(members.length), 32);
    rec.writeBigUInt64LE(BigInt(cdBuf.length), 40);
    rec.writeBigUInt64LE(BigInt(at), 48);
    const loc = Buffer.alloc(20);
    loc.writeUInt32LE(0x07064b50, 0);
    loc.writeBigUInt64LE(BigInt(at + cdBuf.length), 8);
    loc.writeUInt32LE(1, 16);
    tail.push(rec, loc);
  }
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(zip64 ? 0xffff : members.length, 8);
  eocd.writeUInt16LE(zip64 ? 0xffff : members.length, 10);
  eocd.writeUInt32LE(zip64 ? 0xffffffff : cdBuf.length, 12);
  eocd.writeUInt32LE(zip64 ? 0xffffffff : at, 16);
  return Buffer.concat([...parts, cdBuf, ...tail, eocd]);
}

/** What a reader must find in a container's bytes, from its central directory. */
function expectOf(bytes, manifest, tables) {
  const eocd = bytes.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  let count = bytes.readUInt16LE(eocd + 10);
  let cdStart = bytes.readUInt32LE(eocd + 16);
  if (count === 0xffff) {
    const z = Number(bytes.readBigUInt64LE(eocd - 20 + 8));
    count = Number(bytes.readBigUInt64LE(z + 32));
    cdStart = Number(bytes.readBigUInt64LE(z + 48));
  }
  const members = [];
  for (let p = cdStart, k = 0; k < count; k++) {
    const n = bytes.readUInt16LE(p + 28);
    const m = bytes.readUInt16LE(p + 30);
    const c = bytes.readUInt16LE(p + 32);
    const name = bytes.toString('utf8', p + 46, p + 46 + n);
    let csize = bytes.readUInt32LE(p + 20);
    let usize = bytes.readUInt32LE(p + 24);
    let lho = bytes.readUInt32LE(p + 42);
    if (m >= 28 && bytes.readUInt16LE(p + 46 + n) === 1) {
      usize = Number(bytes.readBigUInt64LE(p + 46 + n + 4));
      csize = Number(bytes.readBigUInt64LE(p + 46 + n + 12));
      lho = Number(bytes.readBigUInt64LE(p + 46 + n + 20));
    }
    const method = bytes.readUInt16LE(p + 10);
    const start = lho + 30 + bytes.readUInt16LE(lho + 26) + bytes.readUInt16LE(lho + 28);
    const raw = bytes.subarray(start, start + csize);
    const data = method === 8 ? zlib.inflateRawSync(raw) : raw;
    members.push({ name, method, compressed: csize, size: usize, dataOffset: start, sha256: sha(data) });
    p += 46 + n + m + c;
  }
  return { formatVersion: manifest.format_version, roles: manifest.roles, tables, members };
}

const expected = {};

// 1. The repository's writer.
{
  const t = path.join(tmp, 'match.parquet');
  const side = path.join(tmp, 'match.events.parquet');
  const doc = path.join(tmp, 'match.match.json');
  table(t, 300, 1);
  table(side, 40, 3);
  fs.writeFileSync(doc, JSON.stringify({ format: 'vector-match', match: 'vector', players: ['p0', 'p1'] }));
  const file = path.join(out, 'written.3dheat');
  const manifest = await writeContainer(file, [
    { file: t, role: 'table' },
    { file: side, role: 'events' },
    { file: doc, role: 'match' },
  ]);
  const bytes = fs.readFileSync(file);
  expected['written.3dheat'] = expectOf(bytes, manifest, manifest.members.filter((m) => m.role === 'table').map((m) => m.name));
}

// 2 and 3. Hand-laid, plain and ZIP64.
{
  const a = path.join(tmp, 'a.parquet');
  const b = path.join(tmp, 'b.parquet');
  table(a, 100, 2);
  table(b, 50, 4);
  const manifest = {
    format: '3dheat',
    format_version: '1.7',
    roles: { table: 'tables/a.parquet', notes: 'notes.txt' },
    members: [
      { name: 'tables/a.parquet', role: 'table', compression: 'stored' },
      { name: 'tables/b.parquet', role: 'table', compression: 'stored' },
      { name: 'notes.txt', role: 'notes', compression: 'deflate' },
      { name: 'future.bin', role: 'something-new', compression: 'stored' },
    ],
    later: { kept: true },
  };
  const members = [
    { name: 'tables/a.parquet', data: fs.readFileSync(a) },
    { name: 'notes.txt', data: Buffer.from('synthetic notes, '.repeat(40)), deflate: true },
    { name: 'tables/b.parquet', data: fs.readFileSync(b) },
    { name: 'future.bin', data: Buffer.from([1, 2, 3, 4, 5]) },
    { name: 'manifest.json', data: Buffer.from(JSON.stringify(manifest)), deflate: true },
  ];
  for (const [name, z64] of [['two-tables.3dheat', false], ['zip64.3dheat', true]]) {
    const bytes = zip(members, z64);
    fs.writeFileSync(path.join(out, name), bytes);
    expected[name] = expectOf(bytes, manifest, ['tables/a.parquet', 'tables/b.parquet']);
  }
}

fs.writeFileSync(path.join(out, 'expected.json'), JSON.stringify(expected, null, 1) + '\n');
fs.rmSync(tmp, { recursive: true, force: true });
console.log(Object.keys(expected).join(', '));
