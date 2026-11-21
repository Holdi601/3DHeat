/**
 * The chart signs' merging worker: the row workers (`worker.ts`) each fold
 * every sign over their share of the rows and send its accumulators here;
 * once every row worker has sent a sign's share for the same scope, they are
 * added up (`addAcc`: every accumulator is a sum) and read into the chart
 * (`finishAgg`), which goes to the page only when it differs from the last
 * one sent. A row worker whose share did not change says so without the
 * numbers, and the share it sent before is used again.
 *
 * Kept off the page: adding up and finishing twenty charts a few times a
 * second is small, but never the frame's business.
 */

import { addAcc, clearAcc, createAgg, finishAgg, settlePlayers, type Agg, type AggAcc, type AggMeta, type AggScope } from '../../charts/aggregate';
import type { FromMerger, SignJob, ToMerge, ToMerger } from './protocol';

let meta: AggMeta | null = null;
let build = 0;
let shards = 0;
/** The scopes by their number, the latest few (a share names the one it was counted for). */
const scopes = new Map<number, { scope: AggScope; upTo: AggScope }>();
let latest = 0;

interface Merge {
  job: SignJob;
  agg: Agg | null;
  /** Per row worker: the scope its last share was for, and the share. */
  seq: number[];
  acc: (AggAcc | null)[];
  /** The scope last merged for, and what was sent. */
  merged: number;
  last: string;
}
const merges = new Map<string, Merge>();
/** Per row worker: the scope it last finished every sign for, and what that took. */
let idle: ({ seq: number; ms: number; scan: number; folded: number; full: number } | undefined)[] = [];
/** Shares of signs not known here yet (their job is on its way from the page). */
const early = new Map<string, { k: number; m: Extract<ToMerge, { type: 'partial' }> }[]>();

const post = (m: FromMerger) => (self as unknown as Worker).postMessage(m);

function fresh(job: SignJob): Merge {
  return { job, agg: null, seq: new Array(shards).fill(-1), acc: new Array(shards).fill(null), merged: -1, last: '' };
}

/** Every row worker's share for one scope in: add them up and say the chart. */
function tryMerge(m: Merge): void {
  if (!meta || shards === 0) return;
  const s = m.seq[0];
  if (s < 0 || m.merged === s) return;
  for (let k = 0; k < shards; k++) if (m.seq[k] !== s || !m.acc[k]) return;
  const sc = scopes.get(s);
  if (!sc) return;
  m.agg ??= createAgg(meta, m.job.spec);
  clearAcc(m.agg);
  for (const acc of m.acc) addAcc(m.agg, acc!);
  settlePlayers(m.agg);
  m.merged = s;
  const data = finishAgg(m.agg, m.job.upToNow ? sc.upTo : sc.scope);
  const json = JSON.stringify(data);
  if (json === m.last) return;
  m.last = json;
  post({ type: 'result', id: m.job.id, data, seq: s });
}

function onShard(k: number, m: ToMerge): void {
  if (m.build !== build) return;
  if (m.type === 'partial') {
    const g = merges.get(m.id);
    if (!g) {
      const list = early.get(m.id) ?? [];
      if (list.length < 64) list.push({ k, m });
      early.set(m.id, list);
      return;
    }
    g.seq[k] = m.seq;
    if (m.acc) g.acc[k] = m.acc;
    tryMerge(g);
    return;
  }
  idle[k] = { seq: m.seq, ms: m.ms, scan: m.scan, folded: m.folded, full: m.full };
  // Every row worker done with the newest scope: say so, with the slowest one's time.
  for (let j = 0; j < shards; j++) if (idle[j]?.seq !== latest) return;
  {
    const sum = { seq: latest, ms: 0, scan: 0, folded: 0, full: 0 };
    for (const x of idle as { seq: number; ms: number; scan: number; folded: number; full: number }[]) {
      sum.ms = Math.max(sum.ms, x.ms);
      sum.scan = Math.max(sum.scan, x.scan);
      sum.folded += x.folded;
      sum.full = Math.max(sum.full, x.full);
    }
    post({ type: 'idle', ...sum });
    // The next reports start afresh: a sign change at the same scope reports again.
    idle = new Array(shards);
  }
}

self.onmessage = (e: MessageEvent<ToMerger>) => {
  const m = e.data;
  switch (m.type) {
    case 'port': {
      const k = m.shard;
      m.port.onmessage = (ev: MessageEvent<ToMerge>) => onShard(k, ev.data);
      break;
    }
    case 'meta':
      meta = m.meta;
      for (const g of merges.values()) {
        g.agg = null;
        g.last = '';
      }
      break;
    case 'build':
      // New rows: every share before them is void.
      build = m.build;
      shards = m.shards;
      idle = new Array(shards);
      for (const [id, g] of merges) merges.set(id, { ...fresh(g.job), last: g.last });
      early.clear();
      break;
    case 'signs': {
      const next = new Map<string, Merge>();
      for (const job of m.signs) {
        const old = merges.get(job.id);
        next.set(job.id, old && JSON.stringify(old.job) === JSON.stringify(job) ? old : fresh(job));
      }
      merges.clear();
      for (const [k, v] of next) merges.set(k, v);
      // Shares that came before their sign did.
      for (const [id, list] of early) {
        early.delete(id);
        for (const { k, m: p } of list) onShard(k, p);
      }
      break;
    }
    case 'scope':
      scopes.set(m.seq, { scope: m.scope, upTo: m.upTo });
      latest = Math.max(latest, m.seq);
      for (const s of [...scopes.keys()]) if (s < latest - 64) scopes.delete(s);
      // Shares that came before their scope did.
      for (const g of merges.values()) tryMerge(g);
      break;
  }
};
