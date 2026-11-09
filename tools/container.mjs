/**
 * `.3dheat` containers in Node (docs/container.md): writing one from a
 * match's loose files, reading and verifying one, adding or replacing
 * members in place (`updateContainer`), compacting (`repackContainer`), and
 * finding a match's loose files in a folder. Used by tools/3dheat-pack.mjs
 * and tools/acmi-to-parquet.mjs.
 *
 * A container is a ZIP: `manifest.json` first (when freshly written), then
 * the tables, the documents and the sidecars. Parquet and other range-read
 * or already compressed members are stored, so each is one byte range of the
 * container a reader reads in place; text members are deflated.
 */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { parquetMetadataAsync } from 'hyparquet';

export const FORMAT = '3dheat';
/** major.minor: readers take any minor of their major; the major changes only with the layout. */
export const FORMAT_VERSION = '1.0';

/**
 * Sidecar words (docs/converters.md, `SIDECAR_PARQUET` in src/data/filePick.ts)
 * and the converters' other side tables (ACMI effects, War Thunder objectives).
 * Only for finding loose files: a container's roles are any strings.
 */
export const SIDE_ROLES = ['messages', 'flight', 'packets', 'events', 'entities', 'props', 'units', 'combatlog', 'strings', 'raw', 'effects', 'objectives', 'chat'];

const MEDIA = {
  parquet: 'application/vnd.apache.parquet',
  pq: 'application/vnd.apache.parquet',
  json: 'application/json',
  arrow: 'application/vnd.apache.arrow.file',
  feather: 'application/vnd.apache.arrow.file',
  csv: 'text/csv',
  tsv: 'text/tab-separated-values',
  txt: 'text/plain',
  acmi: 'text/plain',
  xml: 'application/xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  glb: 'model/gltf-binary',
  gltf: 'model/gltf+json',
  ogg: 'audio/ogg',
  opus: 'audio/opus',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  mp4: 'video/mp4',
  webm: 'video/webm',
};
/** Text is deflated; everything else (compressed already, or read by byte range) is stored. */
const DEFLATED = /^(application\/(json|xml)|model\/gltf\+json|text\/.*)$/;

export function mediaType(name) {
  return MEDIA[/\.([^./]+)$/.exec(name)?.[1].toLowerCase() ?? ''] ?? 'application/octet-stream';
}

const CHUNK = 8 << 20;
const Z32 = 0xffffffff;

function dosTime(ms) {
  const d = new Date(ms);
  const year = Math.max(1980, d.getFullYear());
  return {
    time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
    date: ((year - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

/** sha256 and CRC-32 of a byte range of a file (the whole file by default), streamed. */
async function digest(file, start = 0, length = null) {
  const h = crypto.createHash('sha256');
  let crc = 0;
  let size = 0;
  const opts = { highWaterMark: CHUNK, start };
  if (length !== null) opts.end = start + length - 1;
  if (length !== 0)
    for await (const chunk of fs.createReadStream(file, opts)) {
      h.update(chunk);
      crc = zlib.crc32(chunk, crc);
      size += chunk.length;
    }
  return { sha256: h.digest('hex'), crc, size };
}

/** A Parquet file's footer (or a Parquet member's, at `start`): rows and its key-value metadata. */
export async function parquetFooter(file, start = 0, length = null) {
  const fh = await fsp.open(file, 'r');
  try {
    const byteLength = length ?? (await fh.stat()).size;
    const md = await parquetMetadataAsync({
      byteLength,
      slice: async (s, e) => {
        const n = (e ?? byteLength) - s;
        const b = Buffer.alloc(n);
        await fh.read(b, 0, n, start + s);
        return b.buffer.slice(b.byteOffset, b.byteOffset + n);
      },
    });
    const kv = Object.fromEntries((md.key_value_metadata ?? []).map((k) => [k.key, k.value]));
    return { rows: Number(md.num_rows), kv };
  } finally {
    await fh.close();
  }
}

/**
 * A folder's matches as loose files: each table `<match>.parquet` with the
 * files that belong to it, `<match>.<role>.parquet` (a word of `SIDE_ROLES`)
 * and `<match>.<word>.json` (`match` for the match document). Files given
 * as one folder's names; returns [{ stem, table, members: [{ role, file }] }].
 */
export function looseMatches(dir, names) {
  const have = new Set(names);
  const side = new RegExp(`^(.*)\\.(${SIDE_ROLES.join('|')})\\.parquet$`, 'i');
  const sets = new Map();
  for (const n of names) {
    if (!/\.parquet$/i.test(n)) continue;
    const m = side.exec(n);
    if (m && have.has(`${m[1]}.parquet`)) continue;
    const stem = n.replace(/\.parquet$/i, '');
    sets.set(stem, { stem, table: path.join(dir, n), members: [{ role: 'table', file: path.join(dir, n) }] });
  }
  for (const n of names) {
    const m = side.exec(n) ?? /^(.*)\.(\w+)\.json$/i.exec(n);
    if (!m) continue;
    const set = sets.get(m[1]);
    if (set) set.members.push({ role: m[2].toLowerCase(), file: path.join(dir, n) });
  }
  return [...sets.values()];
}

/** The convention a member follows, where it says: a document's `format` and `version`, a table's footer. */
async function schemaOf(file, media) {
  try {
    if (media === 'application/json') {
      const fh = await fsp.open(file, 'r');
      try {
        // The convention is named near the start; the whole document is not parsed for it.
        const b = Buffer.alloc(4096);
        const { bytesRead } = await fh.read(b, 0, b.length, 0);
        const head = b.toString('utf8', 0, bytesRead);
        const f = /"format"\s*:\s*"([^"]+)"/.exec(head);
        const v = /"version"\s*:\s*"?([\w.]+)"?/.exec(head);
        return f ? { id: f[1], version: v ? v[1] : null } : null;
      } finally {
        await fh.close();
      }
    }
    if (media === MEDIA.parquet) {
      const { kv } = await parquetFooter(file);
      if (kv.acmi) return { id: 'heat3d-acmi-table', version: '1' };
      if (kv.heat3d) return { id: 'heat3d-table', version: '1' };
    }
  } catch {
    // A member whose convention cannot be read is kept whole all the same.
  }
  return null;
}

/** What the manifest says of the match, from its match document or the table's footer. */
export async function describe(members) {
  const table = members.find((m) => m.role === 'table');
  const info = { game: null, source: null, converter: null, match: table ? path.basename(table.file).replace(/\.parquet$/i, '') : null, map: null, mode: null, started: null };
  const doc = members.find((m) => m.role === 'match');
  if (doc) {
    try {
      const d = JSON.parse(await fsp.readFile(doc.file, 'utf8'));
      if (d.format === 'heat3d-wt-replay-match') {
        Object.assign(info, { game: 'warthunder', source: d.server ? 'server replay' : 'client replay', converter: { name: 'heat3d-wt-replay', version: null } });
        info.mode = [d.difficulty, d.gameMode].filter(Boolean).join(' ') || d.battleClass || null;
      } else if (d.format === 'heat3d-cs2-match') {
        Object.assign(info, { game: 'cs2', source: 'demo', converter: { name: 'heat3d_cs2', version: null } });
      }
      info.match = d.match ?? info.match;
      info.map = d.map ?? null;
      info.started = d.started ?? d.date ?? null;
    } catch {
      // A document that does not parse is still packed whole.
    }
  }
  if (table && !info.game) {
    const { kv } = await parquetFooter(table.file);
    if (kv.acmi) {
      try {
        const a = JSON.parse(kv.acmi);
        const src = String(a.globals?.DataSource ?? '');
        Object.assign(info, {
          game: /^dcs/i.test(src) ? 'dcs' : /il-?2/i.test(src) ? 'il2' : 'tacview',
          source: 'tacview acmi',
          converter: { name: 'acmi-to-parquet', version: null },
          map: a.theatre ?? null,
          started: a.globals?.RecordingTime ?? null,
        });
      } catch {
        // As above.
      }
    }
  }
  return info;
}

/** A member name that stays inside the container's folder when unpacked: relative, `/`-separated, no `..`. */
export function safeName(name) {
  const n = name.replace(/\\/g, '/');
  if (!n || n.startsWith('/') || /^[a-z]:/i.test(n) || n.split('/').some((p) => p === '..' || p === '.' || p === '')) throw new Error(`member name ${name} is not a plain relative path`);
  return n;
}

/**
 * A member ready to write. From a file: `{ role, file, name?, media_type?,
 * compression?, schema?, match?, meta? }` (`meta`: further fields for its
 * manifest entry). Copied as it is from another container: `{ copy: { file,
 * entry }, meta }` (`entry` from `readContainer`, `meta` its manifest entry,
 * unknown fields and all).
 */
async function prepare(m) {
  if (m.copy) {
    const e = m.copy.entry;
    return { meta: { ...m.meta }, name: e.name, method: e.method, csize: e.csize, usize: e.usize, crc: e.crc, src: { file: m.copy.file, start: e.start }, mtime: Date.now() };
  }
  const name = safeName(m.name ?? path.basename(m.file));
  const stat = await fsp.stat(m.file);
  const media = m.media_type ?? mediaType(name);
  const deflate = (m.compression ?? (DEFLATED.test(media) ? 'deflate' : 'stored')) === 'deflate';
  const schema = m.schema ?? (await schemaOf(m.file, media));
  const meta = { name, role: m.role, media_type: media, compression: deflate ? 'deflate' : 'stored', bytes: stat.size, sha256: null, ...(m.match ? { match: m.match } : {}), ...(schema ? { schema } : {}), ...(m.meta ?? {}) };
  if (media === MEDIA.parquet) meta.rows = (await parquetFooter(m.file)).rows;
  if (deflate) {
    const raw = await fsp.readFile(m.file);
    const data = zlib.deflateRawSync(raw, { level: 9 });
    meta.sha256 = crypto.createHash('sha256').update(raw).digest('hex');
    return { meta, name, method: 8, data, usize: raw.length, csize: data.length, crc: zlib.crc32(raw), mtime: stat.mtimeMs };
  }
  const d = await digest(m.file);
  meta.sha256 = d.sha256;
  return { meta, name, method: 0, src: { file: m.file, start: 0 }, usize: d.size, csize: d.size, crc: d.crc, mtime: stat.mtimeMs };
}

function manifestItem(manifest) {
  const raw = Buffer.from(JSON.stringify(manifest, null, 1));
  const data = zlib.deflateRawSync(raw, { level: 9 });
  return { name: 'manifest.json', method: 8, data, usize: raw.length, csize: data.length, crc: zlib.crc32(raw), mtime: Date.now() };
}

/** The manifest over `items`, keeping every field of `base` (an older manifest) it does not set itself. */
function manifestOf(base, items, info) {
  const roles = {};
  for (const i of items) roles[i.meta.role] ??= i.meta.name;
  const known = ['game', 'source', 'converter', 'match', 'map', 'mode', 'started', 'matches', 'references', 'extensions'];
  const m = { ...base, format: FORMAT, format_version: base.format_version ?? FORMAT_VERSION };
  delete m.version;
  for (const k of known) if (info[k] !== undefined) m[k] = info[k];
  for (const k of known.slice(0, 7)) m[k] ??= null;
  m.created ??= new Date().toISOString();
  if (base.created) m.updated = new Date().toISOString();
  m.roles = roles;
  m.members = items.map((i) => i.meta);
  return m;
}

/** Writes items at `at` onward; returns their central records and where it ended. */
async function writeItems(fh, at, items) {
  const write = async (buf) => {
    await fh.write(buf, 0, buf.length, at);
    at += buf.length;
  };
  const records = [];
  for (const i of items) {
    const lho = at;
    const name = Buffer.from(i.name, 'utf8');
    const big = i.usize >= Z32 || i.csize >= Z32;
    const { time, date } = dosTime(i.mtime);
    const h = Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50, 0);
    h.writeUInt16LE(big ? 45 : 20, 4);
    h.writeUInt16LE(0x0800, 6);
    h.writeUInt16LE(i.method, 8);
    h.writeUInt16LE(time, 10);
    h.writeUInt16LE(date, 12);
    h.writeUInt32LE(i.crc >>> 0, 14);
    h.writeUInt32LE(big ? Z32 : i.csize, 18);
    h.writeUInt32LE(big ? Z32 : i.usize, 22);
    h.writeUInt16LE(name.length, 26);
    h.writeUInt16LE(big ? 20 : 0, 28);
    await write(h);
    await write(name);
    if (big) {
      const x = Buffer.alloc(20);
      x.writeUInt16LE(1, 0);
      x.writeUInt16LE(16, 2);
      x.writeBigUInt64LE(BigInt(i.usize), 4);
      x.writeBigUInt64LE(BigInt(i.csize), 12);
      await write(x);
    }
    if (i.data) await write(i.data);
    else {
      const src = await fsp.open(i.src.file, 'r');
      try {
        const buf = Buffer.alloc(CHUNK);
        for (let done = 0; done < i.csize; ) {
          const { bytesRead } = await src.read(buf, 0, Math.min(CHUNK, i.csize - done), i.src.start + done);
          if (!bytesRead) throw new Error(`${i.src.file} shrank while packed`);
          await write(buf.subarray(0, bytesRead));
          done += bytesRead;
        }
      } finally {
        await src.close();
      }
    }
    records.push({ name, method: i.method, crc: i.crc, csize: i.csize, usize: i.usize, lho, time, date });
  }
  return { records, at };
}

/** The central directory and its end records, at `at`. */
async function writeCentral(fh, at, records) {
  const parts = [];
  for (const c of records) {
    const x = [];
    if (c.usize >= Z32) x.push(c.usize);
    if (c.csize >= Z32) x.push(c.csize);
    if (c.lho >= Z32) x.push(c.lho);
    const extra = Buffer.alloc(x.length ? 4 + 8 * x.length : 0);
    if (x.length) {
      extra.writeUInt16LE(1, 0);
      extra.writeUInt16LE(8 * x.length, 2);
      x.forEach((v, k) => extra.writeBigUInt64LE(BigInt(v), 4 + 8 * k));
    }
    const h = Buffer.alloc(46);
    h.writeUInt32LE(0x02014b50, 0);
    h.writeUInt16LE(45, 4);
    h.writeUInt16LE(x.length ? 45 : 20, 6);
    h.writeUInt16LE(0x0800, 8);
    h.writeUInt16LE(c.method, 10);
    h.writeUInt16LE(c.time ?? 0, 12);
    h.writeUInt16LE(c.date ?? 0x21, 14);
    h.writeUInt32LE(c.crc >>> 0, 16);
    h.writeUInt32LE(Math.min(c.csize, Z32), 20);
    h.writeUInt32LE(Math.min(c.usize, Z32), 24);
    h.writeUInt16LE(c.name.length, 28);
    h.writeUInt16LE(extra.length, 30);
    h.writeUInt32LE(Math.min(c.lho, Z32), 42);
    parts.push(h, c.name, extra);
  }
  const cd = Buffer.concat(parts);
  const cdStart = at;
  const end = [cd];
  if (cdStart >= Z32 || cd.length >= Z32 || records.length >= 0xffff) {
    const z = Buffer.alloc(56 + 20);
    z.writeUInt32LE(0x06064b50, 0);
    z.writeBigUInt64LE(44n, 4);
    z.writeUInt16LE(45, 12);
    z.writeUInt16LE(45, 14);
    z.writeBigUInt64LE(BigInt(records.length), 24);
    z.writeBigUInt64LE(BigInt(records.length), 32);
    z.writeBigUInt64LE(BigInt(cd.length), 40);
    z.writeBigUInt64LE(BigInt(cdStart), 48);
    z.writeUInt32LE(0x07064b50, 56);
    z.writeBigUInt64LE(BigInt(cdStart + cd.length), 64);
    z.writeUInt32LE(1, 72);
    end.push(z);
  }
  const e = Buffer.alloc(22);
  e.writeUInt32LE(0x06054b50, 0);
  e.writeUInt16LE(Math.min(records.length, 0xffff), 8);
  e.writeUInt16LE(Math.min(records.length, 0xffff), 10);
  e.writeUInt32LE(Math.min(cd.length, Z32), 12);
  e.writeUInt32LE(Math.min(cdStart, Z32), 16);
  end.push(e);
  const all = Buffer.concat(end);
  await fh.write(all, 0, all.length, at);
  return at + all.length;
}

const ORDER = (r) => (r === 'table' ? 0 : r === 'match' ? 1 : 2);

/** Writes the items, the manifest first, to `out` (under `<out>.part`, renamed when whole). */
async function writeWhole(out, items, manifest) {
  const part = `${out}.part`;
  const fh = await fsp.open(part, 'w');
  try {
    const { records, at } = await writeItems(fh, 0, [manifestItem(manifest), ...items]);
    await writeCentral(fh, at, records);
  } finally {
    await fh.close();
  }
  await fsp.rename(part, out);
  return manifest;
}

/**
 * Writes `out` from `members` (see `prepare`; one at least of role `table`),
 * the manifest made from `info`: game, source, converter, match, map, mode,
 * started, and where they apply matches[], references[], extensions{}.
 * Returns the manifest.
 */
export async function writeContainer(out, members, info = {}) {
  const items = [];
  for (const m of [...members].sort((a, b) => ORDER(a.role) - ORDER(b.role) || a.role.localeCompare(b.role))) items.push(await prepare(m));
  if (new Set(items.map((i) => i.name)).size !== items.length) throw new Error('two members of one name');
  if (!items.some((i) => i.meta.role === 'table')) throw new Error('no table');
  return writeWhole(out, items, manifestOf(info.base ?? {}, items, info));
}

/** The format version a manifest says, as [major, minor]; a reader takes its own major, any minor. */
export function formatVersion(manifest) {
  const v = String(manifest.format_version ?? manifest.version ?? '1.0');
  const [major, minor = '0'] = v.split('.');
  return [Number(major), Number(minor)];
}

/** A container's central directory and manifest; `range(name)` where a member lies, `read(name)` its bytes inflated. Close it after. */
export async function readContainer(file) {
  const fh = await fsp.open(file, 'r');
  try {
    return await directory(file, fh);
  } catch (e) {
    await fh.close();
    throw e;
  }
}

async function directory(file, fh) {
  const size = (await fh.stat()).size;
  const at = async (s, n) => {
    const b = Buffer.alloc(n);
    await fh.read(b, 0, n, s);
    return b;
  };
  const tailStart = Math.max(0, size - 65_557);
  const tail = await at(tailStart, size - tailStart);
  let eocd = -1;
  for (let i = tail.length - 22; i >= 0; i--)
    if (tail.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  if (eocd < 0) throw new Error('not a ZIP container');
  let count = tail.readUInt16LE(eocd + 10);
  let cdSize = tail.readUInt32LE(eocd + 12);
  let cdStart = tail.readUInt32LE(eocd + 16);
  if (count === 0xffff || cdSize === Z32 || cdStart === Z32) {
    const loc = await at(tailStart + eocd - 20, 20);
    const z = await at(Number(loc.readBigUInt64LE(8)), 56);
    count = Number(z.readBigUInt64LE(32));
    cdSize = Number(z.readBigUInt64LE(40));
    cdStart = Number(z.readBigUInt64LE(48));
  }
  const cd = await at(cdStart, cdSize);
  const entries = [];
  for (let p = 0, k = 0; k < count; k++) {
    if (cd.readUInt32LE(p) !== 0x02014b50) throw new Error('bad central directory');
    const n = cd.readUInt16LE(p + 28),
      m = cd.readUInt16LE(p + 30),
      c = cd.readUInt16LE(p + 32);
    const e = { name: cd.toString('utf8', p + 46, p + 46 + n), method: cd.readUInt16LE(p + 10), time: cd.readUInt16LE(p + 12), date: cd.readUInt16LE(p + 14), crc: cd.readUInt32LE(p + 16), csize: cd.readUInt32LE(p + 20), usize: cd.readUInt32LE(p + 24), lho: cd.readUInt32LE(p + 42) };
    for (let x = p + 46 + n; x + 4 <= p + 46 + n + m; ) {
      const id = cd.readUInt16LE(x),
        len = cd.readUInt16LE(x + 2);
      if (id === 1) {
        let q = x + 4;
        if (e.usize === Z32) (e.usize = Number(cd.readBigUInt64LE(q))), (q += 8);
        if (e.csize === Z32) (e.csize = Number(cd.readBigUInt64LE(q))), (q += 8);
        if (e.lho === Z32) e.lho = Number(cd.readBigUInt64LE(q));
      }
      x += 4 + len;
    }
    const lh = await at(e.lho, 30);
    if (lh.readUInt32LE(0) !== 0x04034b50) throw new Error(`bad local header for ${e.name}`);
    e.start = e.lho + 30 + lh.readUInt16LE(26) + lh.readUInt16LE(28);
    entries.push(e);
    p += 46 + n + m + c;
  }
  const byName = new Map(entries.map((e) => [e.name, e]));
  const read = async (name) => {
    const e = byName.get(name);
    if (!e) throw new Error(`no member ${name}`);
    const raw = await at(e.start, e.csize);
    return e.method === 8 ? zlib.inflateRawSync(raw) : raw;
  };
  if (!byName.has('manifest.json')) throw new Error('no manifest.json');
  const manifest = JSON.parse((await read('manifest.json')).toString('utf8'));
  if (manifest.format !== FORMAT) throw new Error('not a 3dheat container');
  if (formatVersion(manifest)[0] !== 1) throw new Error(`container format ${manifest.format_version} is newer than this reader (1.x)`);
  return { file, size, cdStart, entries, manifest, range: (name) => byName.get(name), read, close: () => fh.close() };
}

/**
 * Re-reads a container whole: every member's bytes hash to the manifest's
 * sha256 and size, the ZIP CRC holds, each Parquet member's footer reads
 * where it lies with the manifest's rows. Throws on the first mismatch.
 */
export async function verifyContainer(file) {
  const c = await readContainer(file);
  try {
    const listed = new Set(['manifest.json', ...c.manifest.members.map((m) => m.name)]);
    if (c.entries.some((e) => !listed.has(e.name)) || listed.size !== c.entries.length) throw new Error('members and manifest differ');
    for (const m of c.manifest.members) {
      const e = c.range(m.name);
      if (!e) throw new Error(`${m.name} named in the manifest is not in the container`);
      if ((m.compression === 'stored') !== (e.method === 0)) throw new Error(`${m.name} compressed the wrong way`);
      let d;
      if (e.method === 0) d = await digest(file, e.start, e.csize);
      else {
        const b = await c.read(m.name);
        d = { sha256: crypto.createHash('sha256').update(b).digest('hex'), crc: zlib.crc32(b), size: b.length };
      }
      if (d.size !== m.bytes) throw new Error(`${m.name}: ${d.size} bytes, the manifest says ${m.bytes}`);
      if (d.sha256 !== m.sha256) throw new Error(`${m.name}: sha256 differs from the manifest`);
      if (d.crc >>> 0 !== e.crc >>> 0) throw new Error(`${m.name}: CRC differs`);
      if (e.method === 0 && m.media_type === MEDIA.parquet) {
        const f = await parquetFooter(file, e.start, e.csize);
        if (m.rows !== null && m.rows !== undefined && f.rows !== m.rows) throw new Error(`${m.name}: ${f.rows} rows, the manifest says ${m.rows}`);
      }
    }
    if (!c.manifest.members.some((m) => m.role === 'table')) throw new Error('no table');
    return c.manifest;
  } finally {
    await c.close();
  }
}

/**
 * Adds or replaces members (`add`, as `prepare` takes them; a name already
 * there is replaced) and drops `remove` (names), without rewriting what
 * stays: the new members and a new manifest are appended after the
 * container's end and a new central directory written after them. What was
 * replaced stays as unreferenced bytes until `repackContainer`. Every other
 * member and every manifest field is kept, known to this tool or not.
 */
export async function updateContainer(file, { add = [], remove = [], info = {} } = {}) {
  const c = await readContainer(file);
  let size;
  let manifest;
  let records;
  try {
    const fresh = [];
    for (const m of add) fresh.push(await prepare(m));
    const gone = new Set([...remove, ...fresh.map((i) => i.name)]);
    const kept = c.manifest.members.filter((m) => !gone.has(m.name));
    for (const r of remove) if (!c.range(r)) throw new Error(`no member ${r}`);
    const items = [...kept.map((meta) => ({ meta })), ...fresh];
    if (!items.some((i) => i.meta.role === 'table')) throw new Error('no table would be left');
    manifest = manifestOf(c.manifest, items, info);
    records = kept.map((meta) => {
      const e = c.range(meta.name);
      return { name: Buffer.from(e.name, 'utf8'), method: e.method, crc: e.crc, csize: e.csize, usize: e.usize, lho: e.lho, time: e.time, date: e.date };
    });
    size = c.size;
    const fh = await fsp.open(file, 'r+');
    try {
      try {
        const w = await writeItems(fh, size, [manifestItem(manifest), ...fresh]);
        await writeCentral(fh, w.at, [...w.records, ...records]);
      } catch (e) {
        // Cut back to what it was: the old central directory is still at its end.
        await fh.truncate(size);
        throw e;
      }
    } finally {
      await fh.close();
    }
  } finally {
    await c.close();
  }
  return manifest;
}

/** Rewrites a container whole, the manifest first and nothing unreferenced, every member and field kept. */
export async function repackContainer(file, out = file) {
  const c = await readContainer(file);
  try {
    const items = c.manifest.members
      .map((meta) => ({ meta, e: c.range(meta.name) }))
      .sort((a, b) => a.e.lho - b.e.lho)
      .map(({ meta, e }) => ({ meta, name: e.name, method: e.method, csize: e.csize, usize: e.usize, crc: e.crc, src: { file, start: e.start }, mtime: Date.now() }));
    const tmp = `${out}.repack`;
    await writeWhole(tmp, items, { ...c.manifest });
    await c.close();
    await fsp.rename(tmp, out);
  } finally {
    await c.close().catch(() => {});
  }
  return verifyContainer(out);
}

/** sha256 of each loose member, by the name it has in the container. */
export async function looseHashes(members) {
  const out = {};
  for (const m of members) out[m.name ?? path.basename(m.file)] = (await digest(m.file)).sha256;
  return out;
}
