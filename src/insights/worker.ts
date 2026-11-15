/** The insight pass (`pass.ts`) and detectors (`engine.ts`), fed chunk by chunk by `run.ts`. */

import type { CompareScope } from '../volumes/compare';
import type { InsightNames } from './detectors';
import { finishInsights, type ReportInfo } from './engine';
import { createInsightJob, stepInsight, stepLevel, type InsightChunk, type InsightJob, type InsightMeta } from './pass';
import { createLensJob, safeFinishLens, stepLens, stepLensLevel, type LensJob, type LensOptions } from './lensMetrics';
import { createBehaviourJob, finishBehaviour, stepBehaviour, type BehaviourJob } from './behaviour/feed';

type Msg =
  | { type: 'start'; meta: InsightMeta; scope: CompareScope; lens: LensOptions }
  | { type: 'level'; v: Float32Array; stride: number }
  | { type: 'chunk'; chunk: InsightChunk }
  | { type: 'finish'; names: InsightNames; info: ReportInfo };

let job: InsightJob | null = null;
let lens: LensJob | null = null;
let behaviour: BehaviourJob | null = null;

self.onmessage = (e: MessageEvent<Msg>) => {
  const m = e.data;
  if (m.type === 'start') {
    job = createInsightJob(m.meta, m.scope);
    lens = createLensJob(m.meta, m.scope, m.lens);
    behaviour = createBehaviourJob(m.meta, m.scope, m.lens);
  }
  else if (m.type === 'level' || m.type === 'chunk') {
    if (job) {
      if (m.type === 'level') {
        stepLevel(job, m.v, m.stride);
        if (lens) stepLensLevel(lens, m.v, m.stride);
      } else {
        stepInsight(job, m.chunk);
        if (lens) stepLens(lens, m.chunk);
        if (behaviour) stepBehaviour(behaviour, m.chunk);
      }
    }
    self.postMessage({ type: 'ack' });
  } else if (job) {
    const report = finishInsights(job, m.names, m.info);
    if (lens) report.lens = safeFinishLens(lens, job, m.names.teams);
    if (behaviour && report.lens) report.lens.behaviour = finishBehaviour(behaviour);
    job = null;
    lens = null;
    behaviour = null;
    self.postMessage({ type: 'done', report });
  }
};
