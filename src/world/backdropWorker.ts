/// <reference lib="webworker" />
import { errorMsg, msg, type Msg } from '../data/msg';
import { buildBackdrop, type BackdropRequest, type BackdropResult } from './backdrop';
import { cachedFetch } from './cache';
import { decodePng } from './terrarium';

/**
 * The world backdrop, built off the main thread: downloads, PNG decoding,
 * vector tile reading and meshing all happen here, so the view keeps
 * rendering while a progress line moves. A cancel terminates the worker, which
 * stops its downloads with it.
 */

export type BackdropWorkerRequest = { id: number } & BackdropRequest;

export type BackdropWorkerResponse =
  | { id: number; kind: 'progress'; label: Msg; fraction: number | null }
  | { id: number; kind: 'done'; result: BackdropResult }
  | { id: number; kind: 'error'; message: Msg | string };

const post = (m: BackdropWorkerResponse, transfer: Transferable[] = []) => (self as unknown as DedicatedWorkerGlobalScope).postMessage(m, transfer);

self.onmessage = async (ev: MessageEvent<BackdropWorkerRequest>) => {
  const { id, ...req } = ev.data;
  try {
    const result = await buildBackdrop(req, {
      fetch: async (url, mode) => {
        try {
          return await cachedFetch(url, mode);
        } catch (err) {
          throw new Error(`${url}: ${err instanceof Error ? err.message : String(err)}`);
        }
      },
      decodePng,
      progress: (label, fraction) => post({ id, kind: 'progress', label, fraction }),
    });
    const m = result.mesh;
    post({ id, kind: 'done', result }, [
      m.vertices.buffer,
      m.colours.buffer,
      m.indices.buffer,
      m.structureIndices.buffer,
      m.structureEdges.buffer,
      m.waterIndices.buffer,
    ] as Transferable[]);
  } catch (err) {
    const e = errorMsg(err);
    post({ id, kind: 'error', message: typeof e === 'string' ? msg('heat.world.error.failed', { reason: e }) : e });
  }
};
