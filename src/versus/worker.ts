/** The Compare panel's pass (`engine.ts`), fed chunk by chunk by `run.ts`. */

import { createJob, finishJob, stepJob, type Chunk, type Job, type Request } from './engine';

type Msg = { type: 'start'; req: Request } | { type: 'chunk'; chunk: Chunk } | { type: 'finish' };

let job: Job | null = null;

self.onmessage = (e: MessageEvent<Msg>) => {
  const m = e.data;
  try {
    if (m.type === 'start') job = createJob(m.req);
    else if (m.type === 'chunk') {
      if (job) stepJob(job, m.chunk);
      self.postMessage({ type: 'ack' });
    } else if (job) {
      const result = finishJob(job);
      job = null;
      self.postMessage({ type: 'done', result });
    }
  } catch (err) {
    job = null;
    self.postMessage({ type: 'error', message: String((err as Error)?.message ?? err) });
  }
};
