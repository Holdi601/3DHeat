/** Decodes heat tiles off the main thread (`source.ts`): zstd and the channel weights never land on a frame. */

import { decodeTile, type ChannelWeights, type DecodedTile } from './tileFormat';

self.onmessage = (e: MessageEvent<{ seq: number; tiles: Uint8Array[]; weights: ChannelWeights | null }>) => {
  const out: (DecodedTile | null)[] = [];
  const transfer: ArrayBuffer[] = [];
  for (const b of e.data.tiles) {
    try {
      const t = decodeTile(b, e.data.weights);
      out.push(t);
      transfer.push(t.counts.buffer as ArrayBuffer);
      if (t.rgba) transfer.push(t.rgba.buffer as ArrayBuffer);
    } catch {
      out.push(null);
    }
  }
  (self as unknown as Worker).postMessage({ seq: e.data.seq, tiles: out }, transfer);
};
