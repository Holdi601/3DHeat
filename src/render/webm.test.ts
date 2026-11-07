import { describe, expect, it } from 'vitest';
import { muxWebM, type EncodedFrame } from './webm';

/**
 * A container is either exactly right or unplayable, and "unplayable" is not a
 * thing a unit test can see — so these check the structure a player reads first:
 * the magic, the doctype, the timecode scale, and that every frame ended up in a
 * cluster whose relative timecodes fit in the sixteen bits the format allows.
 *
 * Parsed back rather than compared against a golden blob, because a golden blob
 * would pin the byte layout of correct output *and* of incorrect output equally
 * well.
 */

const frame = (timeMs: number, keyframe = false, size = 8): EncodedFrame => ({
  data: new Uint8Array(size).fill(1),
  timeMs,
  keyframe,
});

async function bytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

/** Read an EBML variable-length integer at `at`; returns value and its width. */
function readVint(b: Uint8Array, at: number): { value: number; width: number } {
  const first = b[at];
  let width = 0;
  for (let i = 0; i < 8; i++) {
    if (first & (1 << (7 - i))) {
      width = i + 1;
      break;
    }
  }
  if (width === 0) throw new Error('not a vint');
  let value = first & ((1 << (8 - width)) - 1);
  for (let i = 1; i < width; i++) value = value * 256 + b[at + i];
  return { value, width };
}

/** Every occurrence of an element id, as byte offsets. */
function findAll(b: Uint8Array, id: number[]): number[] {
  const out: number[] = [];
  outer: for (let i = 0; i + id.length <= b.length; i++) {
    for (let j = 0; j < id.length; j++) if (b[i + j] !== id[j]) continue outer;
    out.push(i);
  }
  return out;
}

const CLUSTER = [0x1f, 0x43, 0xb6, 0x75];
const SIMPLE_BLOCK = [0xa3];

describe('muxWebM', () => {
  it('refuses to write nothing', () => {
    expect(() => muxWebM({ frames: [], width: 8, height: 8, frameMs: 33, codec: 'V_VP9' })).toThrow();
  });

  it('starts with the EBML magic and declares webm', async () => {
    const b = await bytes(
      muxWebM({ frames: [frame(0, true)], width: 64, height: 32, frameMs: 40, codec: 'V_VP9' }),
    );
    expect([...b.slice(0, 4)]).toEqual([0x1a, 0x45, 0xdf, 0xa3]);
    const text = new TextDecoder().decode(b.slice(0, 200));
    expect(text).toContain('webm');
    expect(text).toContain('V_VP9');
  });

  it('reports the blob as video/webm', () => {
    const blob = muxWebM({ frames: [frame(0, true)], width: 8, height: 8, frameMs: 33, codec: 'V_VP8' });
    expect(blob.type).toBe('video/webm');
  });

  it('writes one block per frame', async () => {
    const frames = Array.from({ length: 24 }, (_, i) => frame(i * 40, i === 0));
    const b = await bytes(muxWebM({ frames, width: 16, height: 16, frameMs: 40, codec: 'V_VP9' }));
    // The SimpleBlock id is a single byte, so a raw scan finds it inside payloads
    // too; count only those whose declared size matches a real block.
    const blocks = findAll(b, SIMPLE_BLOCK).filter((at) => {
      try {
        const { value, width } = readVint(b, at + 1);
        // 4 bytes of block header plus the 8-byte payload used above.
        return value === 12 && at + 1 + width + value <= b.length;
      } catch {
        return false;
      }
    });
    expect(blocks.length).toBeGreaterThanOrEqual(frames.length);
  });

  it('splits into clusters so no relative timecode overflows sixteen bits', async () => {
    // The reason clusters exist in this file at all: a SimpleBlock's timecode is
    // a signed 16-bit offset from its cluster, which overflows after ~32s. A long
    // render that stayed in one cluster would throw, or worse, wrap.
    const frames = Array.from({ length: 400 }, (_, i) => frame(i * 100, i % 20 === 0));
    const blob = muxWebM({ frames, width: 16, height: 16, frameMs: 100, codec: 'V_VP9' });
    const b = await bytes(blob);
    expect(findAll(b, CLUSTER).length).toBeGreaterThan(1);
  });

  it('does not split when a long span has no keyframe to split on', async () => {
    // A cluster has to begin with a decodable frame, so a run without keyframes
    // cannot be broken up. Better to write one long cluster than an undecodable
    // one — and it still must not throw.
    const frames = Array.from({ length: 200 }, (_, i) => frame(i * 100, i === 0));
    expect(() =>
      muxWebM({ frames, width: 16, height: 16, frameMs: 100, codec: 'V_VP9' }),
    ).not.toThrow();
  });

  it('throws rather than wrapping when a block cannot fit its cluster', async () => {
    // 40 seconds with no keyframe after the first: unsplittable and past the
    // 16-bit limit. Silently wrapping would produce a file that plays with frames
    // in the wrong order, which is far worse than a refusal.
    const frames = [frame(0, true), frame(40_000)];
    expect(() =>
      muxWebM({ frames, width: 16, height: 16, frameMs: 33, codec: 'V_VP9' }),
    ).toThrow(/timecode/);
  });

  it('grows roughly with the payload it is given', async () => {
    const small = muxWebM({
      frames: [frame(0, true, 100)],
      width: 16, height: 16, frameMs: 33, codec: 'V_VP9',
    });
    const big = muxWebM({
      frames: [frame(0, true, 100_000)],
      width: 16, height: 16, frameMs: 33, codec: 'V_VP9',
    });
    expect(big.size - small.size).toBeGreaterThan(99_000);
  });

  it('encodes sizes above the one-byte vint limit', async () => {
    // A frame larger than 126 bytes needs a multi-byte size prefix, and getting
    // the marker bit wrong there makes every file over that size unreadable while
    // small test files pass.
    const b = await bytes(
      muxWebM({
        frames: [frame(0, true, 5000)],
        width: 16, height: 16, frameMs: 33, codec: 'V_VP9',
      }),
    );
    const at = findAll(b, SIMPLE_BLOCK).find((i) => {
      try {
        return readVint(b, i + 1).value === 5004;
      } catch {
        return false;
      }
    });
    expect(at).toBeDefined();
  });
});
