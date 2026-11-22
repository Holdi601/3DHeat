/// <reference lib="webworker" />
import { objectBoxes } from './terrainObjects';
import type { TerrainModel } from './terrainFormat';

/** Turns a tiled terrain's object cells into instanced boxes off the page's thread (`terrainStream.ts`). */

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
  const boxes = objectBoxes(m.id, m.records, m.count, models);
  (self as unknown as Worker).postMessage(boxes, [boxes.instances.buffer as ArrayBuffer]);
};
