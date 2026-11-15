/**
 * A Tacview recording's text, a piece at a time: plain or zipped (`.zip.acmi`,
 * the first member, stored or deflated). Shared by the ACMI converter
 * (`acmi-to-parquet.mjs`) and the campaign chain (`dcs-campaign-rounds.mjs`).
 */

import fs from 'node:fs';
import zlib from 'node:zlib';

/** Where the first member of a zip lies: its method and the byte range of its data. */
export function zipMember(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const size = fs.fstatSync(fd).size;
    const tail = Math.min(size, 65557);
    const buf = Buffer.alloc(tail);
    fs.readSync(fd, buf, 0, tail, size - tail);
    let eocd = -1;
    for (let i = tail - 22; i >= 0; i--)
      if (buf.readUInt32LE(i) === 0x06054b50) {
        eocd = i;
        break;
      }
    if (eocd < 0) throw new Error('not a zip: no end of central directory');
    const cdAt = buf.readUInt32LE(eocd + 16);
    const cd = Buffer.alloc(46);
    fs.readSync(fd, cd, 0, 46, cdAt);
    if (cd.readUInt32LE(0) !== 0x02014b50) throw new Error('zip central directory not found');
    const method = cd.readUInt16LE(10);
    const csize = cd.readUInt32LE(20);
    const local = cd.readUInt32LE(42);
    const lh = Buffer.alloc(30);
    fs.readSync(fd, lh, 0, 30, local);
    const start = local + 30 + lh.readUInt16LE(26) + lh.readUInt16LE(28);
    return { method, start, end: start + csize };
  } finally {
    fs.closeSync(fd);
  }
}

/**
 * Feeds the recording's text to `push`, piece by piece; `push` returning
 * `false` stops the reading there (the rest of the file is not read).
 */
export async function readText(file, push) {
  const head = Buffer.alloc(4);
  const fd = fs.openSync(file, 'r');
  fs.readSync(fd, head, 0, 4, 0);
  fs.closeSync(fd);
  let stream;
  let raw = null;
  if (head.readUInt32LE(0) === 0x04034b50) {
    const m = zipMember(file);
    if (m.method !== 0 && m.method !== 8) throw new Error(`zip method ${m.method} is not supported`);
    raw = fs.createReadStream(file, { start: m.start, end: Math.max(m.start, m.end - 1), highWaterMark: 1 << 20 });
    stream = m.method === 8 ? raw.pipe(zlib.createInflateRaw({ chunkSize: 1 << 20 })) : raw;
  } else stream = fs.createReadStream(file, { highWaterMark: 1 << 20 });
  const dec = new TextDecoder('utf-8');
  try {
    for await (const chunk of stream) if (push(dec.decode(chunk, { stream: true })) === false) return;
    const rest = dec.decode();
    if (rest) push(rest);
  } finally {
    stream.destroy();
    raw?.destroy();
  }
}
