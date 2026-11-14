/** The volume comparison's pass (`compare.ts`), fed chunk by chunk by `compareRun.ts`. */

import { createCompare, finishCompare, stepCompare, type CompareChunk, type CompareJob, type CompareMeta, type CompareScope } from './compare';
import type { Volume } from './volume';

type Msg =
  | { type: 'start'; meta: CompareMeta; volumes: Volume[]; scope: CompareScope }
  | { type: 'chunk'; chunk: CompareChunk }
  | { type: 'finish' };

let job: CompareJob | null = null;

self.onmessage = (e: MessageEvent<Msg>) => {
  const m = e.data;
  if (m.type === 'start') job = createCompare(m.meta, m.volumes, m.scope);
  else if (m.type === 'chunk') {
    if (job) stepCompare(job, m.chunk);
    self.postMessage({ type: 'ack' });
  } else if (job) {
    const result = finishCompare(job);
    job = null;
    self.postMessage({ type: 'done', result });
  }
};
