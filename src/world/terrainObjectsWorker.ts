/// <reference lib="webworker" />
import { objectsTile } from './terrainObjects';
import type { TerrainModel } from './terrainFormat';

/** Builds a tiled terrain's object cells into box meshes off the page's thread (`terrainStream.ts`). */

export type ObjectsWorkerRequest =
  | { kind: 'models'; models: TerrainModel[] }
  | { kind: 'build'; id: string; records: ArrayBuffer; count: number };

let models: TerrainModel[] = [];

self.onmessage = (e: MessageEvent<ObjectsWorkerRequest>) => {
  const m = e.data;
  if (m.kind === 'models') {
    models = m.models;
    return;
  }
  const tile = objectsTile(m.id, m.records, m.count, models);
  const transfer = [tile.vertices.buffer, tile.colours.buffer, tile.structureIndices.buffer, tile.structureEdges.buffer] as ArrayBuffer[];
  (self as unknown as Worker).postMessage(tile, [...new Set(transfer)]);
};
