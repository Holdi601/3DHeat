import { useStore } from '../state/store';
import type { ColumnMapping, Dataset } from '../state/types';
import type { WorkerRequest, WorkerResponse } from './ingestWorker';
import { msg, say, sayDataset } from './msg';
import type { SelectionSize, SourcePreview } from './sourcePreview';
import type { SynthOptions } from './synth';
import type { ColumnProfile } from './columnProfile';
import type { MatchCount, RowFilterClause } from './rowFilter';
import type { DataSource } from './dataSource';
import { coreEndpoint, inNativeApp } from './native/core';
import { nativeRefs } from './native/files';
import type { NativeLoad } from './native/readers';
import { expandContainerFiles, isContainer } from './container';

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
/**
 * The tables to read for `files`: each `.3dheat` container replaced by its
 * tables, as the pickers do (`expandContainers`). Done here as well, so a
 * caller that hands the loader a container itself (the dev hooks, a probe, a
 * drop that bypassed the picker) never has it read as text. Files that hold no
 * container come back as they are, without a wait.
 */
export async function tablesOf(files: File[]): Promise<File[]> {
  return files.some((f) => isContainer(f.name)) ? expandContainerFiles(files) : files;
}

/** Shortest gap between two progress reports of one job, in milliseconds. */
const PROGRESS_MS = 100;

export class Loader implements DataSource {
  readonly kind: DataSource['kind'] = 'local';
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
    if (res.kind !== 'progress') {
      const slot = this.lastProgress.get(res.id);
      if (slot?.timer) clearTimeout(slot.timer);
      this.lastProgress.delete(res.id);
    }
    switch (res.kind) {
      case 'progress':
        this.progress(res.id, entry, { label: say(res.label), fraction: res.fraction, rows: res.rows });
        break;
      case 'preview':
        this.pending.delete(res.id);
        (entry.resolve as (v: SourcePreview) => void)(res.preview);
        break;
      case 'measure':
        this.pending.delete(res.id);
        (entry.resolve as (v: SelectionSize) => void)(res.size);
        break;
      case 'profile':
        this.pending.delete(res.id);
        (entry.resolve as (v: ColumnProfile[]) => void)(res.profile);
        break;
      case 'count':
        this.pending.delete(res.id);
        (entry.resolve as (v: MatchCount) => void)(res.count);
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

  /**
   * Progress at most every `PROGRESS_MS` per job, the latest one winning.
   *
   * Each report re-renders the load panel on the main thread, and a mass load
   * of many files in parallel parser threads sends hundreds a second: frames
   * of 100 ms and more while 200 matches loaded. Nobody reads a progress line
   * faster than this, so nothing is lost but the hitches.
   */
  private readonly lastProgress = new Map<number, { at: number; timer: ReturnType<typeof setTimeout> | null; next: LoaderProgress | null }>();

  private progress(id: number, entry: { onProgress?: (p: LoaderProgress) => void }, p: LoaderProgress): void {
    if (!entry.onProgress) return;
    const now = performance.now();
    let slot = this.lastProgress.get(id);
    if (!slot) {
      slot = { at: -Infinity, timer: null, next: null };
      this.lastProgress.set(id, slot);
    }
    if (now - slot.at >= PROGRESS_MS) {
      slot.at = now;
      slot.next = null;
      entry.onProgress(p);
      return;
    }
    slot.next = p;
    if (slot.timer) return;
    const s = slot;
    s.timer = setTimeout(() => {
      s.timer = null;
      if (!s.next || !this.pending.has(id)) return;
      s.at = performance.now();
      const q = s.next;
      s.next = null;
      entry.onProgress?.(q);
    }, PROGRESS_MS - (now - slot.at));
  }

  protected send<T>(req: UnidentifiedRequest, onProgress?: (p: LoaderProgress) => void): Promise<T> {
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

  async preview(file: File, delimiter?: string): Promise<SourcePreview> {
    // A container previews as its first table.
    const [table = file] = await tablesOf([file]);
    return this.send<SourcePreview>({ kind: 'preview', file: table, delimiter });
  }

  /** Exact row totals from Parquet footers; estimates for CSV. */
  async measure(files: File[]): Promise<SelectionSize> {
    return this.send<SelectionSize>({ kind: 'measure', files: await tablesOf(files) });
  }

  /** Every column of a Parquet file, for the pre-filter and the column costs. */
  async profile(file: File): Promise<ColumnProfile[]> {
    const [table = file] = await tablesOf([file]);
    return this.send<ColumnProfile[]>({ kind: 'profile', file: table });
  }

  /** Rows a row filter keeps across a selection; a sample past `timeMs`. */
  async count(files: File[], clauses: RowFilterClause[], timeMs?: number): Promise<MatchCount> {
    return this.send<MatchCount>({ kind: 'count', files: await tablesOf(files), clauses, timeMs });
  }

  ingest(
    picked: File[],
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
    // Containers opened first; without one the request goes out at once, as it always did.
    if (picked.some((f) => isContainer(f.name))) {
      return tablesOf(picked).then((files) => this.ingest(files, mapping, columns, name, stride, expectedRows, onProgress, budget));
    }
    const files = picked;
    const chosen = useStore.getState().budgets;
    const { threads, ram } = budget ?? { threads: chosen.cpu, ram: chosen.ram };
    const send = (native?: NativeLoad) =>
      this.send<Dataset>(
        { kind: 'ingest', files, mapping, columns, name, stride, expectedRows, threads, ramBudget: ram, ...(native ? { native } : {}) },
        onProgress,
      );
    // Sent at once without a core, as it always was.
    const core = this.withCore(files);
    return core ? core.then(send) : send();
  }

  /** The core a load is read with, if any: none in a browser. */
  protected withCore(_files: File[]): Promise<NativeLoad | undefined> | null {
    return null;
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

/**
 * The native app's data source: the same worker and readers, with the app's
 * core reading every file it can be given by name (`data/native`). Files it
 * cannot be given - made in the page, or on a system that does not hand over
 * paths - are read in the worker as in a browser.
 */
export class NativeDataSource extends Loader {
  override readonly kind: DataSource['kind'] = 'native';

  protected override withCore(files: File[]): Promise<NativeLoad | undefined> {
    return Promise.all([nativeRefs(files), coreEndpoint()]).then(([refs, core]) => (refs.some((r) => r) ? { core, refs } : undefined));
  }
}

/** Where the viewer's data comes from: this page's worker, or in the native app its core. */
export const loader: DataSource = inNativeApp() ? new NativeDataSource() : new Loader();

// What the app's smoke run drives (`data/native/devHook.ts`): the app only.
if (inNativeApp()) void import('./native/devHook').then((m) => m.installNativeHook());
