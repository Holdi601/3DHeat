/** The movement analysis off the main thread (`run.ts`): chunks in, one report out. */

import type { CompareMeta, CompareScope } from '../../volumes/compare';
import type { LensChunk } from '../lensMetrics';
import { createManeuverJob, finishManeuverJob, stepManeuver, type ManeuverJob, type ManeuverOptions } from './pass';

type Msg = { type: 'start'; meta: CompareMeta; scope: CompareScope; opt: ManeuverOptions } | { type: 'chunk'; chunk: LensChunk } | { type: 'finish' };

let job: ManeuverJob | null = null;

self.onmessage = (e: MessageEvent<Msg>) => {
  const m = e.data;
  if (m.type === 'start') job = createManeuverJob(m.meta, m.scope, m.opt);
  else if (m.type === 'chunk') {
    if (job) stepManeuver(job, m.chunk);
    self.postMessage({ type: 'ack' });
  } else if (job) {
    try {
      const report = finishManeuverJob(job);
      self.postMessage({ type: 'done', report });
    } catch (err) {
      self.postMessage({ type: 'error', message: err instanceof Error ? err.message : String(err) });
    }
    job = null;
  }
};
