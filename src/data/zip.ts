/**
 * The files of a zip (stored or deflated), as a KMZ or a zipped recording
 * holds them: names and bytes, read from the central directory.
 */

export interface ZipEntry {
  name: string;
  bytes: () => Promise<Uint8Array>;
}

export function isZip(b: Uint8Array): boolean {
  return b.length >= 4 && b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04;
}

/** Every file of a zip. Throws on a file that is not one. */
export function zipEntries(z: Uint8Array): ZipEntry[] {
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
  const out: ZipEntry[] = [];
  for (let k = 0; k < count; k++) {
    if (dv.getUint32(at, true) !== 0x02014b50) throw new Error('zip central directory is broken');
    const method = dv.getUint16(at + 10, true);
    const csize = dv.getUint32(at + 20, true);
    const nameLen = dv.getUint16(at + 28, true);
    const extraLen = dv.getUint16(at + 30, true);
    const commentLen = dv.getUint16(at + 32, true);
    const local = dv.getUint32(at + 42, true);
    const name = new TextDecoder('utf-8').decode(z.subarray(at + 46, at + 46 + nameLen));
    at += 46 + nameLen + extraLen + commentLen;
    out.push({
      name,
      bytes: async () => {
        const start = local + 30 + dv.getUint16(local + 26, true) + dv.getUint16(local + 28, true);
        const data = z.subarray(start, start + csize);
        if (method === 0) return data;
        if (method !== 8) throw new Error(`zip method ${method} is not supported`);
        const stream = new Blob([data.slice()]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
        return new Uint8Array(await new Response(stream).arrayBuffer());
      },
    });
  }
  return out;
}
