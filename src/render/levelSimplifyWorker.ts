/// <reference lib="webworker" />
import { buildEdgeList } from './level';
import { simplifyIndices } from '../data/simplify';

/**
 * A loaded level simplified again to another triangle budget, off the main
 * thread (levelSimplify.ts). Its arrays come in slices, one a frame, so no
 * frame copies hundreds of megabytes; the new index sets go back transferred.
 */

export type SimplifyPart = 'vertices' | 'uvs' | 'uvTiles' | 'ground' | 'structure';

export type SimplifyRequest =
  | { kind: 'part'; name: SimplifyPart; total: number; at: number; data: Float32Array | Uint32Array | Uint16Array }
  | { kind: 'run'; groundBudget: number; structureBudget: number };

export type SimplifyAnswer =
  | { kind: 'done'; ground: Uint32Array; structure: Uint32Array; edges: Uint32Array; error: number }
  | { kind: 'error'; message: string };

const parts = new Map<SimplifyPart, Float32Array | Uint32Array | Uint16Array>();

self.onmessage = async (ev: MessageEvent<SimplifyRequest>) => {
  const m = ev.data;
  if (m.kind === 'part') {
    let into = parts.get(m.name);
    if (!into || into.length !== m.total) {
      const Ctor = m.data.constructor as new (n: number) => Float32Array | Uint32Array | Uint16Array;
      into = new Ctor(m.total);
      parts.set(m.name, into);
    }
    into.set(m.data as never, m.at);
    return;
  }
  try {
    const vertices = parts.get('vertices') as Float32Array;
    const uvs = (parts.get('uvs') as Float32Array | undefined) ?? null;
    const uvTiles = (parts.get('uvTiles') as Uint16Array | undefined) ?? null;
    const none = new Uint32Array(0);
    const ground = await simplifyIndices(vertices, (parts.get('ground') as Uint32Array) ?? none, m.groundBudget, undefined, uvs, uvTiles);
    const structure = await simplifyIndices(vertices, (parts.get('structure') as Uint32Array) ?? none, m.structureBudget, undefined, uvs, uvTiles);
    const edges = buildEdgeList(structure.indices);
    // Copies where the simplifier left a set as it came: what came is the worker's own, but sent back it must not be the same buffer twice.
    const g = ground.indices.slice();
    const s = structure.indices.slice();
    const answer: SimplifyAnswer = { kind: 'done', ground: g, structure: s, edges, error: Math.max(ground.error, structure.error) };
    (self as unknown as Worker).postMessage(answer, [g.buffer, s.buffer, edges.buffer]);
  } catch (err) {
    const answer: SimplifyAnswer = { kind: 'error', message: err instanceof Error ? err.message : String(err) };
    (self as unknown as Worker).postMessage(answer);
  }
};
