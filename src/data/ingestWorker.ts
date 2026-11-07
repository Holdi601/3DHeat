/// <reference lib="webworker" />
import type { SourceBlock } from './builder';
import { ingestFiles, parseHere, ParserCrash, type ParseFileFn } from './ingestFiles';
import { errorMsg, msg, MsgError, type Msg } from './msg';
import type { ParseRequest, ParseResponse } from './parseWorker';
import {
  measureSelection,
  previewSource,
  type SelectionSize,
  type SourcePreview,
} from './sourcePreview';
import { generateSynthetic, type SynthOptions } from './synth';
import type { ColumnMapping, Dataset } from '../state/types';

/**
 * Ingest runs here rather than on the main thread because parsing is measured in
 * seconds, not milliseconds. On the main thread a large file would freeze the
 * render loop and the whole UI for its entire duration; here the viewport keeps
 * running and the progress bar actually moves.
 *
 * Finished datasets go back by transfer, not copy — the arrays reach hundreds of
 * megabytes and structured-clone would double both the time and the peak memory.
 *
 * Nothing here is said in words: a worker has no language. Progress and errors
 * go back as messages (see msg.ts) and the loader says them on the main thread.
 */

export type WorkerRequest =
  | { id: number; kind: 'preview'; file: File; delimiter?: string }
  | { id: number; kind: 'measure'; files: File[] }
  | {
      id: number;
      kind: 'ingest';
      files: File[];
      mapping: ColumnMapping;
      columns: string[];
      name: string;
      stride?: number;
      expectedRows?: number;
      /** Files parsed at once, each in a parser worker of its own; 1 parses here. */
      threads?: number;
      /** The RAM budget in bytes, which the files in flight share with the builder. */
      ramBudget?: number;
    }
  | { id: number; kind: 'synth'; opts: SynthOptions };

export type WorkerResponse =
  | { id: number; kind: 'preview'; preview: SourcePreview }
  | { id: number; kind: 'measure'; size: SelectionSize }
  | { id: number; kind: 'progress'; label: Msg; fraction: number | null; rows: number }
  | { id: number; kind: 'dataset'; dataset: Dataset }
  | { id: number; kind: 'error'; message: Msg | string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = async (ev: MessageEvent<WorkerRequest>) => {
  const req = ev.data;
  const post = (r: WorkerResponse, transfer?: Transferable[]) =>
    transfer ? ctx.postMessage(r, transfer) : ctx.postMessage(r);

  try {
    switch (req.kind) {
      case 'preview': {
        post({
          id: req.id,
          kind: 'preview',
          preview: await previewSource(req.file, req.delimiter),
        });
        break;
      }
      case 'measure': {
        post({ id: req.id, kind: 'measure', size: await measureSelection(req.files) });
        break;
      }
      case 'ingest': {
        // ingestAll posts the dataset itself, with the transfer list.
        await ingestAll(req, post);
        break;
      }
      case 'synth': {
        const dataset = generateSynthetic(req.opts, (rows, total) =>
          post({ id: req.id, kind: 'progress', label: msg('data.ingestWorker.generating'), fraction: rows / total, rows }),
        );
        post({ id: req.id, kind: 'dataset', dataset }, collectBuffers(dataset));
        break;
      }
    }
  } catch (err) {
    post({
      id: req.id,
      kind: 'error',
      message: errorMsg(err),
    });
  }
};

async function ingestAll(
  req: Extract<WorkerRequest, { kind: 'ingest' }>,
  post: (r: WorkerResponse, transfer?: Transferable[]) => void,
): Promise<void> {
  const threads = Math.max(1, Math.floor(req.threads ?? 1));
  // One thread is this one, as it always was: no pool, nothing to spin up.
  const pool = threads > 1 && req.files.length > 1 && typeof Worker === 'function' ? new ParsePool() : null;
  let result: Awaited<ReturnType<typeof ingestFiles>>;
  try {
    result = await ingestFiles({
      files: req.files,
      mapping: req.mapping,
      columns: req.columns,
      name: req.name,
      stride: req.stride,
      expectedRows: req.expectedRows,
      threads,
      ramBudget: req.ramBudget,
      parseFile: pool?.parse,
      onProgress: (p) =>
        post({ id: req.id, kind: 'progress', label: p.msg, fraction: p.fraction, rows: p.rows }),
    });
  } finally {
    // Finished, failed or crashed, no parser outlives the load it was started for.
    pool?.close();
  }
  const { dataset, failures } = result;

  if (failures.length > 0) {
    /**
     * Grouped by reason, not listed per file.
     *
     * Every file in a telemetry export is called `movement.parquet`, so six
     * failures for one cause produced six copies of the same sentence prefixed by
     * the same name — a wall of text in which the one piece of information, the
     * reason, appeared six times and the count nowhere. Grouping turns it into
     * "6 files: <reason>".
     */
    const byReason = new Map<string, { why: Msg | string; count: number }>();
    for (const f of failures) {
      const r = byReason.get(f.reason) ?? { why: f.why, count: 0 };
      r.count++;
      byReason.set(f.reason, r);
    }
    const summary = [...byReason.values()]
      .sort((a, b) => b.count - a.count)
      .map(({ why, count }) => (count > 1 ? msg('data.ingestWorker.filesBecause', { count, reason: why }) : why));
    post({
      id: req.id,
      kind: 'progress',
      label: msg('data.ingestWorker.skipped', {
        count: failures.length,
        total: req.files.length,
        reasons: { each: summary, between: ' · ' },
      }),
      fraction: 1,
      rows: dataset.count,
    });
  }
  post({ id: req.id, kind: 'dataset', dataset }, collectBuffers(dataset));
}

/**
 * The parser threads of one load.
 *
 * Workers are started as the scheduler asks for them, which is never more than
 * the parser-thread budget at once, and reused for the next file. `close`
 * terminates them all; it runs when the load ends however it ends. A cancel
 * terminates this worker from the page, and dedicated workers end with the
 * worker that owns them, so a cancel stops them too.
 *
 * A worker that fails before saying anything at all means workers cannot be
 * started from here, which is not the file's fault: that file, and every one
 * after it, is parsed in this thread instead, which is the load as it was before
 * there was a pool. A worker that dies after it started work is a crash and ends
 * the load (see `ParserCrash`).
 */
class ParsePool {
  private readonly idle: Worker[] = [];
  private readonly all = new Set<Worker>();
  /** Workers that have answered at least once, and so are known to run. */
  private readonly spoke = new WeakSet<Worker>();
  private nextId = 1;
  private unavailable = false;
  private closed = false;

  readonly parse: ParseFileFn = (file, mapping, columns, stride, onProgress) => {
    if (this.unavailable) return parseHere(file, mapping, columns, stride, onProgress);
    if (this.closed) return Promise.reject(new ParserCrash(msg('data.loader.cancelled')));
    const worker = this.idle.pop() ?? this.spawn();
    const id = this.nextId++;
    return new Promise<SourceBlock>((resolve, reject) => {
      const done = () => {
        worker.onmessage = null;
        worker.onerror = null;
      };
      worker.onmessage = (ev: MessageEvent<ParseResponse>) => {
        const res = ev.data;
        if (res.id !== id) return;
        this.spoke.add(worker);
        switch (res.kind) {
          case 'progress':
            onProgress(res.progress);
            break;
          case 'block':
            done();
            this.release(worker);
            resolve(res.block);
            break;
          case 'error':
            done();
            this.release(worker);
            reject(typeof res.why === 'string' ? new Error(res.why) : new MsgError(res.why));
            break;
        }
      };
      worker.onerror = (ev) => {
        ev.preventDefault();
        done();
        this.all.delete(worker);
        worker.terminate();
        if (!this.spoke.has(worker)) {
          this.unavailable = true;
          parseHere(file, mapping, columns, stride, onProgress).then(resolve, reject);
        } else {
          reject(new ParserCrash(msg('data.loader.crashed')));
        }
      };
      const request: ParseRequest = { id, file, mapping, columns, stride };
      worker.postMessage(request);
    });
  };

  private spawn(): Worker {
    const w = new Worker(new URL('./parseWorker.ts', import.meta.url), { type: 'module' });
    this.all.add(w);
    return w;
  }

  private release(w: Worker): void {
    if (this.closed) w.terminate();
    else this.idle.push(w);
  }

  close(): void {
    this.closed = true;
    for (const w of this.all) w.terminate();
    this.all.clear();
    this.idle.length = 0;
  }
}

/**
 * Every distinct ArrayBuffer in a dataset, for the transfer list.
 *
 * Deduplicated because transferring the same buffer twice is a hard error, and
 * the axis remap deliberately aliases arrays instead of copying them.
 */
function collectBuffers(d: Dataset): Transferable[] {
  const seen = new Set<ArrayBufferLike>();
  const add = (v: ArrayBufferView | null | undefined) => {
    if (v) seen.add(v.buffer);
  };
  add(d.px);
  add(d.py);
  add(d.pz);
  add(d.time);
  add(d.yaw);
  add(d.pitch);
  add(d.personId);
  add(d.teamId);
  add(d.personTeam);
  add(d.personSlot);
  add(d.teamSizes);
  // Per-row columns that were being left off this list, and so were structured-
  // cloned instead: `lifetime` and `sessionId` are four bytes a row each, which
  // is another 340MB copied on a 43M-row load, at the exact moment the tab is
  // holding both the worker's arrays and the main thread's. Anything per-row
  // added to `Dataset` from here on belongs in this list.
  add(d.lifetime);
  add(d.sessionId);
  add(d.sessionRows);
  add(d.sessionStart);
  add(d.sessionEnd);
  add(d.personShared);
  for (const a of d.attrs) add(a.data);
  return [...seen] as Transferable[];
}
