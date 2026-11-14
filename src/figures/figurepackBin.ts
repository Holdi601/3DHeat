/**
 * One figure of a local figure pack (`figurepack.ts`) as the servers hand it
 * out: binary rather than the pack file's JSON and base64, and coded so it
 * compresses well (the servers brotli- or gzip-compress it on the way). The
 * same 16-bit positions and indices come back out, bit for bit.
 *
 * Layout: u32 magic, u32 length of a UTF-8 JSON header (the figure without
 * its builds, plus `words`, each build's length in 16-bit words), the header
 * padded to 4 bytes, then each build padded to 4 bytes. A build is coded as
 * the packer wrote it (u16 part count, per part vertex and triangle counts,
 * per part positions then indices), except that each part's positions are
 * stored axis by axis as differences from the one before, and its indices as
 * differences from the highest index seen so far plus one (both zigzag-coded
 * in 16 bits), and the build's bytes are split into all low bytes, then all
 * high bytes. Neighbouring vertices sit close and new indices mostly count up,
 * so the differences are small and the high bytes mostly zero.
 */

/** A pack figure (`MeshFigureData` in `meshfig.ts`; this module stands alone so the servers' config can take it). */
export interface PackFigure {
  lods: (string | Uint16Array)[];
}

/** 'H3FP', little-endian. */
const MAGIC = 0x50463348;

/** A build's 16-bit words: base64 as the pack file holds it, or the words themselves. */
export function lodWords(l: string | Uint16Array): Uint16Array {
  if (typeof l !== 'string') return l;
  const s = atob(l);
  const u8 = new Uint8Array(s.length & ~1);
  for (let i = 0; i < u8.length; i++) u8[i] = s.charCodeAt(i);
  return new Uint16Array(u8.buffer);
}

const zig = (d: number) => ((d << 1) ^ (d >> 31)) & 0xffff;
const unzig = (z: number) => (z >>> 1) ^ -(z & 1);
/** A difference of two 16-bit values, wrapped into -32768..32767. */
const wrap = (d: number) => (d << 16) >> 16;

/** Walks a build's parts: `f(offset of positions, vertices, offset of indices, triangles)`. False when the counts overrun. */
function eachPart(d: Uint16Array, f: (po: number, nv: number, io: number, nt: number) => void): boolean {
  const n = d[0];
  let o = 1 + n * 2;
  if (o > d.length) return false;
  for (let i = 0; i < n; i++) {
    const nv = d[1 + i * 2];
    const nt = d[2 + i * 2];
    if (o + nv * 3 + nt * 3 > d.length) return false;
    f(o, nv, o + nv * 3, nt);
    o += nv * 3 + nt * 3;
  }
  return true;
}

function codeLod(d: Uint16Array): Uint8Array {
  const c = d.slice();
  eachPart(d, (po, nv, io, nt) => {
    for (let a = 0; a < 3; a++) {
      let prev = 0;
      for (let v = 0; v < nv; v++) {
        const x = d[po + v * 3 + a];
        c[po + a * nv + v] = zig(wrap(x - prev));
        prev = x;
      }
    }
    let hw = 0;
    for (let t = 0; t < nt * 3; t++) {
      const x = d[io + t];
      c[io + t] = zig(wrap(hw - x));
      if (x + 1 > hw) hw = x + 1;
    }
  });
  const b = new Uint8Array(c.buffer, c.byteOffset, c.byteLength);
  const out = new Uint8Array(b.length);
  const h = c.length;
  for (let i = 0; i < h; i++) {
    out[i] = b[2 * i];
    out[h + i] = b[2 * i + 1];
  }
  return out;
}

function uncodeLod(b: Uint8Array, words: number): Uint16Array | null {
  const c = new Uint16Array(words);
  for (let i = 0; i < words; i++) c[i] = b[i] | (b[words + i] << 8);
  const d = c.slice();
  const ok = eachPart(c, (po, nv, io, nt) => {
    for (let a = 0; a < 3; a++) {
      let prev = 0;
      for (let v = 0; v < nv; v++) {
        prev = (prev + unzig(c[po + a * nv + v])) & 0xffff;
        d[po + v * 3 + a] = prev;
      }
    }
    let hw = 0;
    for (let t = 0; t < nt * 3; t++) {
      const x = (hw - unzig(c[io + t])) & 0xffff;
      d[io + t] = x;
      if (x + 1 > hw) hw = x + 1;
    }
  });
  return ok ? d : null;
}

const pad4 = (n: number) => (n + 3) & ~3;

/** A pack figure as the servers send it (before compression). */
export function encodePackFigure(m: PackFigure): Uint8Array {
  const lods = m.lods.map(lodWords);
  const header = new TextEncoder().encode(JSON.stringify({ ...m, lods: undefined, words: lods.map((l) => l.length) }));
  const coded = lods.map(codeLod);
  let size = 8 + pad4(header.length);
  for (const c of coded) size += pad4(c.length);
  const out = new Uint8Array(size);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, MAGIC, true);
  dv.setUint32(4, header.length, true);
  out.set(header, 8);
  let o = 8 + pad4(header.length);
  for (const c of coded) {
    out.set(c, o);
    o += pad4(c.length);
  }
  return out;
}

/** A pack figure back from what `encodePackFigure` made (its builds as 16-bit words), or null when it is not one. */
export function decodePackFigure(buf: ArrayBuffer | Uint8Array): PackFigure | null {
  try {
    const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    if (b.length < 8 || dv.getUint32(0, true) !== MAGIC) return null;
    const hl = dv.getUint32(4, true);
    const head = JSON.parse(new TextDecoder().decode(b.subarray(8, 8 + hl))) as { words: number[]; [field: string]: unknown };
    if (!Array.isArray(head.words)) return null;
    let o = 8 + pad4(hl);
    const lods: Uint16Array[] = [];
    for (const w of head.words) {
      if (o + w * 2 > b.length) return null;
      const l = uncodeLod(b.subarray(o, o + w * 2), w);
      if (!l) return null;
      lods.push(l);
      o += pad4(w * 2);
    }
    const { words: _words, ...rest } = head;
    return { ...rest, lods };
  } catch {
    return null;
  }
}
