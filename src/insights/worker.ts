/** The insight pass (`pass.ts`) and detectors (`engine.ts`), fed chunk by chunk by `run.ts`. */

import type { CompareScope } from '../volumes/compare';
import type { InsightNames } from './detectors';
import { finishInsights, type ReportInfo } from './engine';
import { createInsightJob, stepInsight, stepLevel, type InsightChunk, type InsightJob, type InsightMeta } from './pass';

type Msg =
  | { type: 'start'; meta: InsightMeta; scope: CompareScope }
  | { type: 'level'; v: Float32Array; stride: number }
  | { type: 'chunk'; chunk: InsightChunk }
  | { type: 'finish'; names: InsightNames; info: ReportInfo };

let job: InsightJob | null = null;

self.onmessage = (e: MessageEvent<Msg>) => {
  const m = e.data;
  if (m.type === 'start') job = createInsightJob(m.meta, m.scope);
  else if (m.type === 'level' || m.type === 'chunk') {
    if (job) {
      if (m.type === 'level') stepLevel(job, m.v, m.stride);
      else stepInsight(job, m.chunk);
    }
    self.postMessage({ type: 'ack' });
  } else if (job) {
    const report = finishInsights(job, m.names, m.info);
    job = null;
    self.postMessage({ type: 'done', report });
  }
};
