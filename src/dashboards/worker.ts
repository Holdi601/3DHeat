/**
 * A dashboard row worker: one share of the rows (a contiguous slice, so a
 * time-sorted dataset stays sorted in it), the columns the dashboards read,
 * and the query engine over them (`query.ts`). Told the columns a chunk at a
 * time (`col`), columns worked out here (`derive`: time into the match, the
 * dashboards' calculated columns), and the queries of every tile shown
 * (`run`); answers each run with its partial numbers, summed with the other
 * workers' on the page (`client.ts`).
 *
 * Work is done in steps of `pace.run` ms with `pace.rest` ms of rest between,
 * so a busy machine's frames come first (the page slows the pace when they
 * come late). Runs are never cut short: the page sends the next only when
 * every worker answered the last, so each answer is whole.
 */

import { computeColumn } from './columns';
import { Engine, type ColArr, type QuerySpec, type Store } from './query';
import type { RNode } from '../versus/expr';
import { K } from '../versus/engine';

export type ToDashWorker =
  | { type: 'reset'; n: number; weight: number; sorted: boolean; sessionStart: number[] | null; timeLo: number; maxBitsets: number }
  | { type: 'col'; key: string; kind: 'f32' | 'u32' | 'u16'; off: number; data: ColArr; last: boolean }
  | { type: 'derive'; key: string; node: RNode | null }
  | { type: 'drop'; keys: string[] }
  | { type: 'run'; seq: number; queries: QuerySpec[] }
  | { type: 'pace'; run: number; rest: number };

export type FromDashWorker =
  | { type: 'ack'; key: string }
  | { type: 'range'; key: string; lo: number; hi: number }
  | { type: 'result'; seq: number; partials: import('./query').Partial[]; ms: number; stats: Engine['stats'] };

const post = (m: FromDashWorker, transfer: Transferable[] = []) => (self as unknown as Worker).postMessage(m, transfer);

let store: Store = { n: 0, weight: 1, cols: {}, sorted: false, maxLife: Infinity };
let engine = new Engine(store);
let sessionStart: number[] | null = null;
let timeLo = 0;
let pace = { run: 12, rest: 0 };
const queue: ToDashWorker[] = [];
let busy = false;

function handle(m: ToDashWorker): Generator<void, void, void> | null {
  switch (m.type) {
    case 'reset':
      store = { n: m.n, weight: m.weight, cols: {}, sorted: m.sorted, maxLife: Infinity };
      engine = new Engine(store);
      engine.maxBitsets = m.maxBitsets;
      sessionStart = m.sessionStart;
      timeLo = m.timeLo;
      return null;
    case 'col': {
      let a = store.cols[m.key];
      if (!a || a.length !== store.n) {
        a = m.kind === 'u16' ? new Uint16Array(store.n) : m.kind === 'u32' ? new Uint32Array(store.n) : new Float32Array(store.n);
        store.cols[m.key] = a;
      }
      a.set(m.data as never, m.off);
      if (m.last) {
        if (m.key === K.life) {
          let mx = 0;
          for (let i = 0; i < a.length; i++) if (a[i] > mx) mx = a[i];
          store.maxLife = mx;
        }
        // Whatever read the column before (it was absent or partial) starts over.
        engine.invalidate();
      }
      post({ type: 'ack', key: m.key });
      return null;
    }
    case 'derive': {
      const r = computeColumn(store, m.key, m.node, sessionStart, timeLo);
      store.cols[m.key] = r.data;
      engine.invalidate();
      post({ type: 'range', key: m.key, lo: r.lo, hi: r.hi });
      return null;
    }
    case 'drop':
      for (const k of m.keys) delete store.cols[k];
      engine.invalidate();
      return null;
    case 'pace':
      pace = { run: m.run, rest: m.rest };
      return null;
    case 'run':
      return runJob(m.seq, m.queries);
  }
}

function* runJob(seq: number, queries: QuerySpec[]): Generator<void, void, void> {
  const t0 = performance.now();
  const g = engine.run(queries);
  let r = g.next();
  while (!r.done) {
    yield;
    r = g.next();
  }
  const partials = r.value;
  post({ type: 'result', seq, partials, ms: performance.now() - t0, stats: { ...engine.stats } }, partials.flatMap((p) => p.accs.map((a) => a.buffer as ArrayBuffer)));
}

/** Work through the queue: plain messages at once, a run in paced steps. */
function pump(): void {
  if (busy) return;
  busy = true;
  const step = () => {
    let job: Generator<void, void, void> | null = null;
    while (queue.length && !job) {
      // Of several runs waiting only the newest matters (the page sends one at a time; this is for safety).
      const m = queue.shift()!;
      if (m.type === 'run' && queue.some((x) => x.type === 'run')) continue;
      job = handle(m);
    }
    if (!job) {
      busy = false;
      return;
    }
    const j = job;
    const slice = () => {
      const t = performance.now();
      for (;;) {
        if (j.next().done) {
          setTimeout(step, 0);
          return;
        }
        if (performance.now() - t >= pace.run) break;
      }
      setTimeout(slice, pace.rest);
    };
    slice();
  };
  step();
}

self.onmessage = (e: MessageEvent<ToDashWorker>) => {
  queue.push(e.data);
  pump();
};
