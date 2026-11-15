/** The close-quarters walk (`walk.ts`) and metrics (`finish.ts`), fed chunk by chunk by `run.ts`. */

import { feedRows, type CqbChunk, type CqbMeta } from './feed';
import { finishCqb, type CqbNames } from './finish';
import { createWalk, stepWalk, type CqbWalk } from './walk';

type Msg = { type: 'start'; meta: CqbMeta } | { type: 'chunk'; chunk: CqbChunk } | { type: 'finish'; names: CqbNames };

let meta: CqbMeta | null = null;
let walk: CqbWalk | null = null;

self.onmessage = (e: MessageEvent<Msg>) => {
  const m = e.data;
  if (m.type === 'start') {
    meta = m.meta;
    walk = createWalk({ upm: m.meta.upm });
  } else if (m.type === 'chunk') {
    if (walk && meta) stepWalk(walk, feedRows(meta, m.chunk));
    self.postMessage({ type: 'ack' });
  } else {
    let metrics;
    try {
      metrics = walk ? finishCqb(walk, m.names) : undefined;
    } catch (err) {
      console.warn('cqb metrics failed', err);
    }
    walk = null;
    self.postMessage({ type: 'done', metrics });
  }
};
