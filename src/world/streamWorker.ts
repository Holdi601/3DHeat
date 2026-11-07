/// <reference lib="webworker" />
import { cachedFetch } from './cache';
import { buildTile, type BuiltTile, type TileRequest } from './tileBuild';

/**
 * Builds the streamed backdrop's tiles off the main thread, several at once:
 * most of a tile's time is waiting for its downloads, so up to four are in
 * hand together (OpenFreeMap asks for at most four requests in parallel; a
 * tile asks each source once). A request the streamer no longer wants is
 * dropped if it has not started; one already started finishes and is
 * answered, and the streamer decides whether it is still of use.
 */

export type StreamWorkerRequest = { kind: 'build'; id: number; req: TileRequest } | { kind: 'drop'; ids: number[] };

export type StreamWorkerResponse = { id: number; kind: 'done'; tile: BuiltTile } | { id: number; kind: 'error'; message: string };

const scope = self as unknown as DedicatedWorkerGlobalScope;
const queue: Array<{ id: number; req: TileRequest }> = [];
let running = 0;
const PARALLEL = 4;

const decodeImage = async (bytes: ArrayBuffer, type: string) => {
  const bitmap = await createImageBitmap(new Blob([bytes], { type }), { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
  try {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('2d context unavailable');
    ctx.drawImage(bitmap, 0, 0);
    return { width: bitmap.width, height: bitmap.height, rgba: ctx.getImageData(0, 0, bitmap.width, bitmap.height).data };
  } finally {
    bitmap.close();
  }
};

function pump(): void {
  while (running < PARALLEL && queue.length) {
    const job = queue.shift()!;
    running++;
    void buildTile(job.req, {
      fetch: (url, mode) => cachedFetch(url, mode),
      decodeImage,
      bitmap: (bytes, type) => createImageBitmap(new Blob([bytes], { type })),
    })
      .then((tile) => {
        const m = tile.mesh;
        const transfer: Transferable[] = [m.vertices.buffer, m.colours.buffer, m.indices.buffer, m.structureIndices.buffer, m.structureEdges.buffer, m.waterIndices.buffer];
        if (tile.uvs) transfer.push(tile.uvs.buffer);
        if (tile.image) transfer.push(tile.image);
        scope.postMessage({ id: job.id, kind: 'done', tile } satisfies StreamWorkerResponse, transfer);
      })
      .catch((err) => scope.postMessage({ id: job.id, kind: 'error', message: err instanceof Error ? err.message : String(err) } satisfies StreamWorkerResponse))
      .finally(() => {
        running--;
        pump();
      });
  }
}

scope.onmessage = (ev: MessageEvent<StreamWorkerRequest>) => {
  const m = ev.data;
  if (m.kind === 'drop') {
    const gone = new Set(m.ids);
    for (let i = queue.length - 1; i >= 0; i--) if (gone.has(queue[i].id)) queue.splice(i, 1);
    return;
  }
  queue.push({ id: m.id, req: m.req });
  pump();
};
