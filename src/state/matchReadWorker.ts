/// <reference lib="webworker" />
/**
 * Reads what a loaded match file says of its match off the main thread
 * (`match/readMatch.ts`): its scoreboard, or its summary, worked out from its
 * table where the file holds none.
 */

import { readMatchFile, type MatchRead } from '../match/readMatch';

export type MatchReadRequest = { id: number; file: File };
export type MatchReadResponse = { id: number; read: MatchRead } | { id: number; error: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = async (e: MessageEvent<MatchReadRequest>) => {
  const { id, file } = e.data;
  try {
    ctx.postMessage({ id, read: await readMatchFile(file) } satisfies MatchReadResponse);
  } catch (err) {
    ctx.postMessage({ id, error: err instanceof Error ? err.message : String(err) } satisfies MatchReadResponse);
  }
};
