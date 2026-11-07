import { useStore } from '../state/store';
import type { ColumnMapping, Dataset } from '../state/types';
import type { WorkerRequest, WorkerResponse } from './ingestWorker';
import { msg, say, sayDataset } from './msg';
import type { SelectionSize, SourcePreview } from './sourcePreview';
import type { SynthOptions } from './synth';

/** How a load may parse: files at once, and the RAM budget they share. */
export interface ParseBudget {
  threads: number;
  /** Bytes. */
  ram: number;
}

export interface LoaderProgress {
  label: string;
  fraction: number | null;
  rows: number;
}

/**
 * `Omit` over a union collapses it to the intersection of its members' keys, so
 * it has to be distributed by hand to keep each request variant intact.
 */
type UnidentifiedRequest = WorkerRequest extends infer R
  ? R extends { id: number }
    ? Omit<R, 'id'>
    : never
  : never;

/**
 * Main-thread client for the ingest worker.
 *
 * One long-lived worker rather than one per job: spinning up a worker costs tens
 * of milliseconds and, more importantly, re-parses and re-JITs the parser each
 * time, which is measurable against the files this handles. A load of several
 * files with more than one parser thread starts parser workers of its own from
 * there, for that load only; that cost is paid once per load, not per file.
 *
 * The worker speaks in messages, having no language of its own; they are said
 * here, in the viewer's, before anything reaches the UI.
 */
export class Loader {
  private worker: Worker | null = null;
  private nextId = 1;
  private readonly pending = new Map<
    number,
    {
      resolve: (v: never) => void;
      reject: (e: Error) => void;
      onProgress?: (p: LoaderProgress) => void;
    }
  >();

  private ensure(): Worker {
    if (this.worker) return this.worker;
    const w = new Worker(new URL('./ingestWorker.ts', import.meta.url), { type: 'module' });
    w.onmessage = (ev: MessageEvent<WorkerResponse>) => this.handle(ev.data);
    w.onerror = (ev) => {
      // A worker-level error kills every job it was running.
      const err = new Error(ev.message || say(msg('data.loader.crashed')));
      for (const [, p] of this.pending) p.reject(err);
      this.pending.clear();
    };
    this.worker = w;
    return w;
  }

  private handle(res: WorkerResponse): void {
    const entry = this.pending.get(res.id);
    if (!entry) return;
    switch (res.kind) {
      case 'progress':
        entry.onProgress?.({ label: say(res.label), fraction: res.fraction, rows: res.rows });
        break;
      case 'preview':
        this.pending.delete(res.id);
        (entry.resolve as (v: SourcePreview) => void)(res.preview);
        break;
      case 'measure':
        this.pending.delete(res.id);
        (entry.resolve as (v: SelectionSize) => void)(res.size);
        break;
      case 'dataset':
        this.pending.delete(res.id);
        sayDataset(res.dataset);
        (entry.resolve as (v: Dataset) => void)(res.dataset);
        break;
      case 'error':
        this.pending.delete(res.id);
        entry.reject(new Error(say(res.message)));
        break;
    }
  }

  private send<T>(req: UnidentifiedRequest, onProgress?: (p: LoaderProgress) => void): Promise<T> {
    const id = this.nextId++;
    const worker = this.ensure();
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, {
        resolve: resolve as (v: never) => void,
        reject,
        onProgress,
      });
      worker.postMessage({ ...req, id } as WorkerRequest);
    });
  }

  preview(file: File, delimiter?: string): Promise<SourcePreview> {
    return this.send<SourcePreview>({ kind: 'preview', file, delimiter });
  }

  /** Exact row totals from Parquet footers; estimates for CSV. */
  measure(files: File[]): Promise<SelectionSize> {
    return this.send<SelectionSize>({ kind: 'measure', files });
  }

  ingest(
    files: File[],
    mapping: ColumnMapping,
    columns: string[],
    name: string,
    stride: number,
    expectedRows: number,
    onProgress?: (p: LoaderProgress) => void,
    /**
     * The parser threads and RAM budget to load within. The budgets chosen in
     * the resource panel unless given, which is what every load should use.
     */
    budget?: ParseBudget,
  ): Promise<Dataset> {
    const chosen = useStore.getState().budgets;
    const { threads, ram } = budget ?? { threads: chosen.cpu, ram: chosen.ram };
    return this.send<Dataset>(
      { kind: 'ingest', files, mapping, columns, name, stride, expectedRows, threads, ramBudget: ram },
      onProgress,
    );
  }

  synth(opts: SynthOptions, onProgress?: (p: LoaderProgress) => void): Promise<Dataset> {
    return this.send<Dataset>({ kind: 'synth', opts }, onProgress);
  }

  /**
   * Drop the worker and reject anything outstanding.
   *
   * Used to cancel: there is no way to interrupt a synchronous parse loop from
   * outside, so terminating the thread is the only real cancel available. The
   * parser workers a load started belong to that thread and end with it.
   */
  dispose(): void {
    this.worker?.terminate();
    this.worker = null;
    for (const [, p] of this.pending) p.reject(new Error(say(msg('data.loader.cancelled'))));
    this.pending.clear();
  }
}

export const loader = new Loader();
