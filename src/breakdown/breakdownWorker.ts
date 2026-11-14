/** The breakdown's pass (`breakdown.ts`), fed chunk by chunk by `breakdownRun.ts`. */

import { createBreakdown, finishBreakdown, stepBreakdown, type BreakdownChunk, type BreakdownJob, type BreakdownMeta, type BreakdownScope, type Region, type SideRule } from './breakdown';

type Msg =
  | { type: 'start'; meta: BreakdownMeta; scope: BreakdownScope; side: SideRule; region: Region }
  | { type: 'chunk'; chunk: BreakdownChunk }
  | { type: 'finish' };

let job: BreakdownJob | null = null;

self.onmessage = (e: MessageEvent<Msg>) => {
  const m = e.data;
  if (m.type === 'start') job = createBreakdown(m.meta, m.scope, m.side, m.region);
  else if (m.type === 'chunk') {
    if (job) stepBreakdown(job, m.chunk);
    self.postMessage({ type: 'ack' });
  } else if (job) {
    const result = finishBreakdown(job);
    job = null;
    self.postMessage({ type: 'done', result });
  }
};
