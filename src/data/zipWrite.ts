/**
 * Writing zips: a new one from named files, or an existing one again with
 * some of its files replaced, added or dropped - every file not touched
 * copied as the bytes it was stored as (same compression, same checksum,
 * same time), so a mission patched in one file is the same archive in all
 * the others. Files written new are deflated where the platform deflates
 * (`CompressionStream`), stored otherwise. No ZIP64: an archive over 4 GiB
 * is refused.
 */

interface RawEntry {
  name: Uint8Array;
  method: number;
  flags: number;
  time: number;
  date: number;
  crc: number;
  csize: number;
  usize: number;
  data: Uint8Array;
  external: number;
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(b: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Every file of a zip as stored: name, method, checksum, sizes and the stored bytes. */
function rawEntries(z: Uint8Array): RawEntry[] {
  const dv = new DataView(z.buffer, z.byteOffset, z.byteLength);
  let eocd = -1;
  for (let i = z.length - 22; i >= Math.max(0, z.length - 65557); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('not a zip: no end of central directory');
  const count = dv.getUint16(eocd + 10, true);
  let at = dv.getUint32(eocd + 16, true);
  const out: RawEntry[] = [];
  for (let k = 0; k < count; k++) {
    if (dv.getUint32(at, true) !== 0x02014b50) throw new Error('zip central directory is broken');
    const nameLen = dv.getUint16(at + 28, true);
    const extraLen = dv.getUint16(at + 30, true);
    const commentLen = dv.getUint16(at + 32, true);
    const local = dv.getUint32(at + 42, true);
    const csize = dv.getUint32(at + 20, true);
    if (csize === 0xffffffff || local === 0xffffffff) throw new Error('ZIP64 archives are not written');
    const start = local + 30 + dv.getUint16(local + 26, true) + dv.getUint16(local + 28, true);
    out.push({
      name: z.slice(at + 46, at + 46 + nameLen),
      flags: dv.getUint16(at + 8, true) & ~0x0008,
      method: dv.getUint16(at + 10, true),
      time: dv.getUint16(at + 12, true),
      date: dv.getUint16(at + 14, true),
      crc: dv.getUint32(at + 16, true),
      csize,
      usize: dv.getUint32(at + 24, true),
      data: z.subarray(start, start + csize),
      external: dv.getUint32(at + 38, true),
    });
    at += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

async function deflate(b: Uint8Array): Promise<Uint8Array | null> {
  if (typeof CompressionStream !== 'function') return null;
  try {
    const stream = new Blob([b.slice()]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return null;
  }
}

/** DOS time and date of a moment. */
function dosTime(d: Date): { time: number; date: number } {
  return {
    time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
    date: (Math.max(0, d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

async function newEntry(name: string, bytes: Uint8Array, when: Date): Promise<RawEntry> {
  const packed = await deflate(bytes);
  const use = packed && packed.length < bytes.length;
  const { time, date } = dosTime(when);
  return {
    name: new TextEncoder().encode(name),
    // UTF-8 names.
    flags: 0x0800,
    method: use ? 8 : 0,
    time,
    date,
    crc: crc32(bytes),
    csize: use ? packed!.length : bytes.length,
    usize: bytes.length,
    data: use ? packed! : bytes,
    external: 0,
  };
}

function assemble(entries: RawEntry[]): Uint8Array {
  const locals: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const e of entries) {
    const l = new Uint8Array(30 + e.name.length);
    const lv = new DataView(l.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, e.flags, true);
    lv.setUint16(8, e.method, true);
    lv.setUint16(10, e.time, true);
    lv.setUint16(12, e.date, true);
    lv.setUint32(14, e.crc, true);
    lv.setUint32(18, e.csize, true);
    lv.setUint32(22, e.usize, true);
    lv.setUint16(26, e.name.length, true);
    lv.setUint16(28, 0, true);
    l.set(e.name, 30);
    const c = new Uint8Array(46 + e.name.length);
    const cv = new DataView(c.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, e.flags, true);
    cv.setUint16(10, e.method, true);
    cv.setUint16(12, e.time, true);
    cv.setUint16(14, e.date, true);
    cv.setUint32(16, e.crc, true);
    cv.setUint32(20, e.csize, true);
    cv.setUint32(24, e.usize, true);
    cv.setUint16(28, e.name.length, true);
    cv.setUint32(38, e.external, true);
    cv.setUint32(42, offset, true);
    c.set(e.name, 46);
    locals.push(l, e.data);
    central.push(c);
    offset += l.length + e.data.length;
    if (offset > 0xffffffff) throw new Error('the archive is over 4 GiB');
  }
  const cdSize = central.reduce((s, c) => s + c.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, offset, true);
  const out = new Uint8Array(offset + cdSize + 22);
  let at = 0;
  for (const p of [...locals, ...central, end]) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/** A new zip of named files, in the order given. */
export async function makeZip(files: Record<string, Uint8Array>, when = new Date()): Promise<Uint8Array> {
  const entries: RawEntry[] = [];
  for (const [name, bytes] of Object.entries(files)) entries.push(await newEntry(name, bytes, when));
  return assemble(entries);
}

/**
 * A zip again with the files named in `replace` written new (null drops one)
 * and those of `add` the archive lacks added at its end; every other file is
 * copied as stored. Names match without regard to case or slash direction.
 */
export async function rewriteZip(original: Uint8Array, replace: Record<string, Uint8Array | null>, when = new Date()): Promise<Uint8Array> {
  const key = (n: string) => n.replace(/\\/g, '/').toLowerCase();
  const wanted = new Map(Object.entries(replace).map(([n, b]) => [key(n), { name: n, bytes: b }]));
  const done = new Set<string>();
  const out: RawEntry[] = [];
  const dec = new TextDecoder('utf-8');
  for (const e of rawEntries(original)) {
    const n = dec.decode(e.name);
    const w = wanted.get(key(n));
    if (!w) {
      out.push(e);
      continue;
    }
    done.add(key(n));
    if (w.bytes) out.push(await newEntry(n, w.bytes, when));
  }
  for (const [k, w] of wanted) if (!done.has(k) && w.bytes) out.push(await newEntry(w.name, w.bytes, when));
  return assemble(out);
}
