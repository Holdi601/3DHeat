/** Decodes heat tiles off the main thread (`source.ts`): zstd and the channel sum never land on a frame. */

import { decodeTile, type DecodedTile } from './tileFormat';

self.onmessage = (e: MessageEvent<{ seq: number; tiles: Uint8Array[] }>) => {
  const out: (DecodedTile | null)[] = [];
  const transfer: ArrayBuffer[] = [];
  for (const b of e.data.tiles) {
    try {
      const t = decodeTile(b);
      out.push(t);
      transfer.push(t.counts.buffer as ArrayBuffer);
    } catch {
      out.push(null);
    }
  }
  (self as unknown as Worker).postMessage({ seq: e.data.seq, tiles: out }, transfer);
};
