import { describe, expect, it } from 'vitest';
import { easeSegment, poseAlong, poseAt, type Keyframe } from './campath';
import { avcCodecs, muxMp4 } from './mp4';
import { muxWebM, type EncodedFrame } from './webm';
import { pathsToJson, readPaths } from './pathLibrary';

const key = (u: number, x: number, ease?: Keyframe['ease']): Keyframe => ({ u, x, y: 0, z: 0, yaw: 0, pitch: 0, fov: 60, ease });

async function bytes(b: Blob): Promise<Uint8Array> {
  return new Uint8Array(await b.arrayBuffer());
}

/** The top-level boxes of an MP4: type, offset, size. */
function boxes(b: Uint8Array, from = 0, to = b.length): Array<{ type: string; at: number; size: number }> {
  const d = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const out: Array<{ type: string; at: number; size: number }> = [];
  let at = from;
  while (at + 8 <= to) {
    let size = d.getUint32(at);
    const type = String.fromCharCode(...b.subarray(at + 4, at + 8));
    if (size === 1) size = d.getUint32(at + 8) * 2 ** 32 + d.getUint32(at + 12);
    out.push({ type, at, size });
    at += size;
  }
  return out;
}

function find(b: Uint8Array, type: string): number {
  const t = Array.from(type, (c) => c.charCodeAt(0));
  for (let i = 0; i + 4 <= b.length; i++) if (b[i] === t[0] && b[i + 1] === t[1] && b[i + 2] === t[2] && b[i + 3] === t[3]) return i - 4;
  return -1;
}

const frames: EncodedFrame[] = [
  { data: Uint8Array.from([0, 0, 0, 2, 0x65, 0x88]), timeMs: 0, keyframe: true },
  { data: Uint8Array.from([0, 0, 0, 1, 0x41]), timeMs: 40, keyframe: false },
  { data: Uint8Array.from([0, 0, 0, 1, 0x41]), timeMs: 80, keyframe: false },
];

describe('camera path timing', () => {
  it('eases a segment without moving its ends', () => {
    for (const e of ['none', 'in', 'out', 'inOut'] as const) {
      expect(easeSegment(0, e)).toBe(0);
      expect(easeSegment(1, e)).toBe(1);
    }
    expect(easeSegment(0.5, 'in')).toBeLessThan(0.5);
    expect(easeSegment(0.5, 'out')).toBeGreaterThan(0.5);
    // An eased segment starts slower than an even one.
    const even = poseAt([key(0, 0), key(1, 100)], 0.1, 'linear')!.x;
    const eased = poseAt([key(0, 0, 'in'), key(1, 100)], 0.1, 'linear')!.x;
    expect(eased).toBeLessThan(even);
  });

  it('moves at one speed when asked, however the keys are timed', () => {
    // Keys bunched: the first 90 units in 10% of the time at their own timing.
    const keys = [key(0, 0), key(0.1, 90), key(1, 100)];
    expect(poseAlong(keys, 0.1, 'linear', 'keys')!.x).toBeCloseTo(90);
    expect(poseAlong(keys, 0.5, 'linear', 'constant')!.x).toBeCloseTo(50, 0);
    expect(poseAlong(keys, 0.25, 'linear', 'constant')!.x).toBeCloseTo(25, 0);
  });
});

describe('video containers', () => {
  it('writes an MP4 whose table points at its frames', async () => {
    const avcC = Uint8Array.from([1, 0x64, 0, 0x28, 0xff, 0xe0, 0, 0]);
    const b = await bytes(muxMp4({ frames, width: 320, height: 180, fps: 25, avcC }));
    const top = boxes(b);
    expect(top.map((x) => x.type)).toEqual(['ftyp', 'mdat', 'moov']);
    const mdat = top[1];
    // The chunk offset is where the first frame's bytes start.
    const stco = find(b, 'stco');
    const off = new DataView(b.buffer).getUint32(stco + 16);
    expect(off).toBe(mdat.at + 8);
    expect(Array.from(b.subarray(off, off + 6))).toEqual(Array.from(frames[0].data));
    // Three samples, one keyframe, the avcC record carried.
    const stsz = find(b, 'stsz');
    expect(new DataView(b.buffer).getUint32(stsz + 16)).toBe(3);
    const stss = find(b, 'stss');
    expect(new DataView(b.buffer).getUint32(stss + 12)).toBe(1);
    expect(find(b, 'avcC')).toBeGreaterThan(0);
  });

  it('writes Matroska with the codec setup, and WebM as before', async () => {
    const mkv = await bytes(muxWebM({ frames, width: 320, height: 180, frameMs: 40, codec: 'V_MPEG4/ISO/AVC', docType: 'matroska', codecPrivate: Uint8Array.from([1, 2, 3]) }));
    expect(String.fromCharCode(...mkv.subarray(0, 64)).includes('matroska')).toBe(true);
    expect(String.fromCharCode(...mkv).includes('V_MPEG4/ISO/AVC')).toBe(true);
    const webm = await bytes(muxWebM({ frames, width: 320, height: 180, frameMs: 40, codec: 'V_VP9' }));
    expect(String.fromCharCode(...webm.subarray(0, 64)).includes('webm')).toBe(true);
  });

  it('picks an H.264 level that holds the size and the rate', () => {
    expect(avcCodecs(1920, 1080, 30)[0]).toBe('avc1.640028');
    expect(avcCodecs(1920, 1080, 60)[0]).toBe('avc1.64002a');
    expect(avcCodecs(3840, 2160, 30)[0]).toBe('avc1.640033');
  });
});

describe('saved camera paths', () => {
  it('round-trips through JSON and leaves out what is not a path', () => {
    const json = pathsToJson([{ id: 'a', name: 'Fly-in', keys: [key(0, 1), key(1, 2, 'inOut')], easing: 'smooth', timing: 'constant', seconds: 8, fps: 30, savedAt: 1 }]);
    const back = readPaths(JSON.parse(json));
    expect(back).toHaveLength(1);
    expect(back[0].keys[1].ease).toBe('inOut');
    expect(back[0].timing).toBe('constant');
    expect(readPaths({ paths: [{ name: 'x', keys: [{ u: 'a' }] }, 5, null] })).toEqual([]);
  });
});
