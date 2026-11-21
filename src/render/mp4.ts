/**
 * Minimal MP4 (ISO BMFF) muxer for one H.264 video track, beside the WebM one
 * (webm.ts) and for the same reason: the frames carry timestamps chosen by the
 * render, not the wall clock.
 *
 * The layout every player takes: `ftyp`, then `mdat` with the frames back to
 * back as the encoder wrote them (length-prefixed NAL units, the `avc` format),
 * then `moov` with one track whose sample table points into it - one chunk,
 * every sample's size, a constant duration, the keyframes listed. The decoder
 * setup is the encoder's own `avcC` record. 64-bit chunk offsets once the file
 * passes 4 GB.
 */

import type { EncodedFrame } from './webm';

function u32(v: number): Uint8Array {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, v >>> 0);
  return b;
}

function u16(v: number): Uint8Array {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, v & 0xffff);
  return b;
}

function u64(v: number): Uint8Array {
  const b = new Uint8Array(8);
  const d = new DataView(b.buffer);
  d.setUint32(0, Math.floor(v / 2 ** 32));
  d.setUint32(4, v >>> 0);
  return b;
}

function str(s: string): Uint8Array {
  return Uint8Array.from(s, (c) => c.charCodeAt(0) & 0x7f);
}

function cat(parts: Uint8Array[]): Uint8Array {
  let n = 0;
  for (const p of parts) n += p.length;
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

function box(type: string, ...parts: Uint8Array[]): Uint8Array {
  const body = cat(parts);
  return cat([u32(body.length + 8), str(type), body]);
}

/** A full box: version and flags before the body. */
function fullBox(type: string, version: number, flags: number, ...parts: Uint8Array[]): Uint8Array {
  return box(type, u32(((version & 0xff) << 24) | (flags & 0xffffff)), ...parts);
}

const zeros = (n: number) => new Uint8Array(n);

/** The unity matrix of tkhd and mvhd. */
const MATRIX = cat([u32(0x00010000), u32(0), u32(0), u32(0), u32(0x00010000), u32(0), u32(0), u32(0), u32(0x40000000)]);

export function muxMp4(opts: {
  frames: EncodedFrame[];
  width: number;
  height: number;
  /** Frames a second; the media timescale is a thousand times it, so each frame lasts 1000 ticks. */
  fps: number;
  /** The encoder's `decoderConfig.description`: the avcC record. */
  avcC: Uint8Array;
}): Blob {
  const { frames, width, height, fps, avcC } = opts;
  if (!frames.length) throw new Error('nothing to mux');
  const timescale = Math.max(1, Math.round(fps * 1000));
  const delta = 1000;
  const duration = frames.length * delta;
  const movieScale = 1000;
  const movieDuration = Math.round((duration / timescale) * movieScale);

  const ftyp = box('ftyp', str('isom'), u32(0x200), str('isom'), str('iso2'), str('avc1'), str('mp41'));
  let payload = 0;
  for (const f of frames) payload += f.data.length;
  const big = ftyp.length + 16 + payload > 0xffffffff;
  // mdat with a 64-bit size when it needs one.
  const mdatHeader = big ? cat([u32(1), str('mdat'), u64(payload + 16)]) : cat([u32(payload + 8), str('mdat')]);
  const dataStart = ftyp.length + mdatHeader.length;

  const avc1 = box(
    'avc1',
    zeros(6),
    u16(1), // data reference index
    zeros(16), // pre-defined, reserved
    u16(width),
    u16(height),
    u32(0x00480000), // 72 dpi
    u32(0x00480000),
    u32(0),
    u16(1), // frames per sample
    zeros(32), // compressor name
    u16(0x0018), // depth
    u16(0xffff), // pre-defined -1
    box('avcC', avcC),
  );
  const stsd = fullBox('stsd', 0, 0, u32(1), avc1);
  const stts = fullBox('stts', 0, 0, u32(1), u32(frames.length), u32(delta));
  const keys = frames.map((f, i) => (f.keyframe ? i + 1 : 0)).filter((i) => i > 0);
  const stss = fullBox('stss', 0, 0, u32(keys.length), ...keys.map(u32));
  const stsc = fullBox('stsc', 0, 0, u32(1), u32(1), u32(frames.length), u32(1));
  const stsz = fullBox('stsz', 0, 0, u32(0), u32(frames.length), ...frames.map((f) => u32(f.data.length)));
  const stco = big ? fullBox('co64', 0, 0, u32(1), u64(dataStart)) : fullBox('stco', 0, 0, u32(1), u32(dataStart));
  const stbl = box('stbl', stsd, stts, stss, stsc, stsz, stco);
  const dinf = box('dinf', fullBox('dref', 0, 0, u32(1), fullBox('url ', 0, 1)));
  const minf = box('minf', fullBox('vmhd', 0, 1, zeros(8)), dinf, stbl);
  const hdlr = fullBox('hdlr', 0, 0, u32(0), str('vide'), zeros(12), str('3dheat video'), zeros(1));
  const mdhd = fullBox('mdhd', 0, 0, u32(0), u32(0), u32(timescale), u32(duration), u16(0x55c4), u16(0)); // language 'und'
  const mdia = box('mdia', mdhd, hdlr, minf);
  const tkhd = fullBox('tkhd', 0, 3, u32(0), u32(0), u32(1), u32(0), u32(movieDuration), zeros(8), u16(0), u16(0), u16(0), u16(0), MATRIX, u32(width << 16), u32(height << 16));
  const trak = box('trak', tkhd, mdia);
  const mvhd = fullBox('mvhd', 0, 0, u32(0), u32(0), u32(movieScale), u32(movieDuration), u32(0x00010000), u16(0x0100), zeros(10), MATRIX, zeros(24), u32(2));
  const moov = box('moov', mvhd, trak);

  return new Blob([ftyp, mdatHeader, ...frames.map((f) => f.data), moov] as BlobPart[], { type: 'video/mp4' });
}

/**
 * The H.264 codec strings to try for a size and a frame rate, High profile
 * first: the lowest level whose frame size and macroblock rate hold it.
 */
export function avcCodecs(width: number, height: number, fps: number): string[] {
  const fs = Math.ceil(width / 16) * Math.ceil(height / 16);
  const mbps = fs * fps;
  const levels: Array<[number, number, number]> = [
    // level_idc, MaxFS, MaxMBPS
    [0x1f, 3600, 108000],
    [0x28, 8192, 245760],
    [0x2a, 8704, 522240],
    [0x32, 22080, 589824],
    [0x33, 36864, 983040],
    [0x34, 36864, 2073600],
    [0x3c, 139264, 4177920],
    [0x3d, 139264, 8355840],
    [0x3e, 139264, 16711680],
  ];
  const fit = levels.filter(([, maxFs, maxMbps]) => fs <= maxFs && mbps <= maxMbps).map(([l]) => l);
  const lv = (fit.length ? fit : [0x3e]).slice(0, 2).map((l) => l.toString(16).padStart(2, '0'));
  return [...lv.map((l) => `avc1.6400${l}`), ...lv.map((l) => `avc1.4d00${l}`), ...lv.map((l) => `avc1.4200${l}`)];
}
