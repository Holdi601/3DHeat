/**
 * Minimal WebM muxer for a single video track.
 *
 * Written rather than depended upon because the alternative does not work here.
 * The obvious route — `canvas.captureStream()` into a `MediaRecorder` — stamps
 * frames by wall clock, and this renderer takes as long as it takes to converge
 * each frame: a second of output would become a minute of video playing back in
 * slow motion. The frames have to carry timestamps *we* choose, which means
 * encoding them ourselves and writing the container.
 *
 * Scope is deliberately one track, no seeking beyond cue points, no audio. That
 * is all a rendered flythrough needs, and every element below is here because a
 * player refuses the file without it.
 */

/** EBML element ids, as their canonical byte sequences. */
const ID = {
  EBML: 0x1a45dfa3,
  EBMLVersion: 0x4286,
  EBMLReadVersion: 0x42f7,
  EBMLMaxIDLength: 0x42f2,
  EBMLMaxSizeLength: 0x42f3,
  DocType: 0x4282,
  DocTypeVersion: 0x4287,
  DocTypeReadVersion: 0x4285,
  Segment: 0x18538067,
  Info: 0x1549a966,
  TimecodeScale: 0x2ad7b1,
  Duration: 0x4489,
  MuxingApp: 0x4d80,
  WritingApp: 0x5741,
  Tracks: 0x1654ae6b,
  TrackEntry: 0xae,
  TrackNumber: 0xd7,
  TrackUID: 0x73c5,
  TrackType: 0x83,
  CodecID: 0x86,
  DefaultDuration: 0x23e383,
  Video: 0xe0,
  PixelWidth: 0xb0,
  PixelHeight: 0xba,
  Cluster: 0x1f43b675,
  Timecode: 0xe7,
  SimpleBlock: 0xa3,
  Cues: 0x1c53bb6b,
  CuePoint: 0xbb,
  CueTime: 0xb3,
  CueTrackPositions: 0xb7,
  CueTrack: 0xf7,
  CueClusterPosition: 0xf1,
} as const;

/** One millisecond per timecode tick — the scale every WebM in the wild uses. */
const TIMECODE_SCALE_NS = 1_000_000;

export interface EncodedFrame {
  data: Uint8Array;
  /** Milliseconds from the start of the video. */
  timeMs: number;
  keyframe: boolean;
}

/** Big-endian unsigned, in as few bytes as it fits. */
function uint(value: number): Uint8Array {
  if (value === 0) return new Uint8Array([0]);
  const bytes: number[] = [];
  let v = Math.floor(value);
  while (v > 0) {
    bytes.unshift(v % 256);
    v = Math.floor(v / 256);
  }
  return new Uint8Array(bytes);
}

function float64(value: number): Uint8Array {
  const out = new Uint8Array(8);
  new DataView(out.buffer).setFloat64(0, value, false);
  return out;
}

function ascii(s: string): Uint8Array {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0x7f;
  return out;
}

/**
 * EBML variable-length size prefix.
 *
 * The length is encoded in the position of the leading one bit, so a size needing
 * n payload bits is written in ceil((n+1)/7) bytes with a marker bit. Sizes whose
 * payload would be all ones are reserved for "unknown", which is why the loop
 * tests against `2^bits - 1` rather than `2^bits`.
 */
function vintSize(value: number): Uint8Array {
  for (let length = 1; length <= 8; length++) {
    const bits = length * 7;
    if (value < 2 ** bits - 1) {
      const out = new Uint8Array(length);
      let v = value;
      for (let i = length - 1; i >= 0; i--) {
        out[i] = v % 256;
        v = Math.floor(v / 256);
      }
      out[0] |= 1 << (8 - length);
      return out;
    }
  }
  throw new Error('element too large for EBML');
}

/** An element id as bytes — ids already carry their own length marker. */
function idBytes(id: number): Uint8Array {
  const bytes: number[] = [];
  let v = id;
  while (v > 0) {
    bytes.unshift(v & 0xff);
    v = Math.floor(v / 256);
  }
  return new Uint8Array(bytes);
}

function element(id: number, payload: Uint8Array): Uint8Array {
  const i = idBytes(id);
  const s = vintSize(payload.length);
  const out = new Uint8Array(i.length + s.length + payload.length);
  out.set(i, 0);
  out.set(s, i.length);
  out.set(payload, i.length + s.length);
  return out;
}

function concat(parts: Uint8Array[]): Uint8Array {
  let n = 0;
  for (const p of parts) n += p.length;
  const out = new Uint8Array(n);
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/**
 * A SimpleBlock: track number, a *signed 16-bit* timecode relative to the
 * cluster, flags, then the frame.
 *
 * Sixteen bits is the reason clusters exist at all in this file — the relative
 * timecode overflows after about 32 seconds, so a long render has to be cut into
 * clusters whatever else happens. See `MAX_CLUSTER_MS`.
 */
function simpleBlock(frame: EncodedFrame, clusterMs: number): Uint8Array {
  const rel = Math.round(frame.timeMs - clusterMs);
  if (rel < -32768 || rel > 32767) throw new Error('block timecode outside cluster range');
  const head = new Uint8Array(4);
  head[0] = 0x81; // track 1, as a one-byte vint
  head[1] = (rel >> 8) & 0xff;
  head[2] = rel & 0xff;
  head[3] = frame.keyframe ? 0x80 : 0x00;
  return element(ID.SimpleBlock, concat([head, frame.data]));
}

/** Well under the 16-bit relative-timecode limit, and small enough to seek by. */
const MAX_CLUSTER_MS = 4000;

/**
 * Mux encoded frames into a WebM blob.
 *
 * Frames must be in presentation order and the first must be a keyframe; both
 * hold for anything a `VideoEncoder` produces from a sequential render.
 */
export function muxWebM(opts: {
  frames: EncodedFrame[];
  width: number;
  height: number;
  /** Nominal frame interval in milliseconds — what the player uses to pace. */
  frameMs: number;
  /** 'V_VP9' or 'V_VP8'. */
  codec: string;
}): Blob {
  const { frames, width, height, frameMs, codec } = opts;
  if (frames.length === 0) throw new Error('nothing to mux');

  const header = element(
    ID.EBML,
    concat([
      element(ID.EBMLVersion, uint(1)),
      element(ID.EBMLReadVersion, uint(1)),
      element(ID.EBMLMaxIDLength, uint(4)),
      element(ID.EBMLMaxSizeLength, uint(8)),
      element(ID.DocType, ascii('webm')),
      element(ID.DocTypeVersion, uint(2)),
      element(ID.DocTypeReadVersion, uint(2)),
    ]),
  );

  const durationMs = frames[frames.length - 1].timeMs + frameMs;
  const info = element(
    ID.Info,
    concat([
      element(ID.TimecodeScale, uint(TIMECODE_SCALE_NS)),
      element(ID.Duration, float64(durationMs)),
      element(ID.MuxingApp, ascii('3dheat')),
      element(ID.WritingApp, ascii('3dheat')),
    ]),
  );

  const tracks = element(
    ID.Tracks,
    element(
      ID.TrackEntry,
      concat([
        element(ID.TrackNumber, uint(1)),
        element(ID.TrackUID, uint(1)),
        element(ID.TrackType, uint(1)), // video
        element(ID.CodecID, ascii(codec)),
        element(ID.DefaultDuration, uint(Math.round(frameMs * TIMECODE_SCALE_NS))),
        element(
          ID.Video,
          concat([element(ID.PixelWidth, uint(width)), element(ID.PixelHeight, uint(height))]),
        ),
      ]),
    ),
  );

  // Clusters. A new one starts on a keyframe once the span would exceed the
  // limit, so every cluster begins with a frame a player can decode cold.
  const clusters: Uint8Array[] = [];
  const cues: Array<{ timeMs: number; index: number }> = [];
  let batch: EncodedFrame[] = [];
  const flush = () => {
    if (batch.length === 0) return;
    const base = Math.round(batch[0].timeMs);
    cues.push({ timeMs: base, index: clusters.length });
    clusters.push(
      element(
        ID.Cluster,
        concat([element(ID.Timecode, uint(base)), ...batch.map((f) => simpleBlock(f, base))]),
      ),
    );
    batch = [];
  };
  for (const f of frames) {
    if (batch.length > 0 && f.keyframe && f.timeMs - batch[0].timeMs >= MAX_CLUSTER_MS) flush();
    batch.push(f);
  }
  flush();

  // Cue points need each cluster's byte offset from the start of the Segment's
  // payload, so they are built after the clusters are sized and placed after
  // them — which means their own size has to be added to every offset.
  const clusterOffsets: number[] = [];
  let at = info.length + tracks.length;
  for (const c of clusters) {
    clusterOffsets.push(at);
    at += c.length;
  }
  const cuesFor = (extra: number) =>
    element(
      ID.Cues,
      concat(
        cues.map((c) =>
          element(
            ID.CuePoint,
            concat([
              element(ID.CueTime, uint(c.timeMs)),
              element(
                ID.CueTrackPositions,
                concat([
                  element(ID.CueTrack, uint(1)),
                  element(ID.CueClusterPosition, uint(clusterOffsets[c.index] + extra)),
                ]),
              ),
            ]),
          ),
        ),
      ),
    );
  // Two passes: the offsets depend on the size of the Cues element, which depends
  // on the offsets. One iteration settles it in practice, and a second guards the
  // case where the first pass changed a length prefix.
  let cuesEl = cuesFor(0);
  for (let pass = 0; pass < 3; pass++) {
    const next = cuesFor(cuesEl.length);
    if (next.length === cuesEl.length) {
      cuesEl = next;
      break;
    }
    cuesEl = next;
  }

  const segment = element(ID.Segment, concat([cuesEl, info, tracks, ...clusters]));
  return new Blob([header as BlobPart, segment as BlobPart], { type: 'video/webm' });
}
