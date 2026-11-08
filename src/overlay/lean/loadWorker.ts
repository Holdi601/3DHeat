/// <reference lib="webworker" />
/**
 * The lean overlay load, off the main thread: reads the files' footers, works
 * out which column is which, then runs the two passes over every job in a
 * pool of decode workers and assembles the result (`assemble.ts`), which goes
 * to the page by transfer. Terminating this worker cancels the load, the pool
 * with it.
 */

import { parquetMetadataAsync, parquetReadObjects } from 'hyparquet';
import type { FileMetaData } from 'hyparquet';
import { LeanAssembler, planJobs, type LeanBuilt, type LeanFile } from './assemble';
import type { DecodeRequest, DecodeResponse } from './decodeWorker';
import { leanSpec, specFor } from './spec';
import type { LeanSpec } from './scan';

export type LoadRequest = { files: File[]; maxKeys: number; threads: number; name: string };

export type LoadProgress = {
  phase: 'footers' | 'scan' | 'keys' | 'build';
  done: number;
  total: number;
  rows: number;
  totalRows: number;
};

export type LoadResponse =
  | { kind: 'progress'; progress: LoadProgress }
  | { kind: 'planned'; samples: number; keys: number; level: number; skipped: string[] }
  | { kind: 'done'; built: LeanBuilt; skipped: string[]; ms: Record<string, number> }
  | { kind: 'error'; reason: string; detail?: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

/** Bytes the decodes in flight may hold together, and what one row takes while decoded. */
const DECODE_BYTES = 1.6e9;
const ROW_BYTES = 400;

function asyncBuffer(file: File) {
  return { byteLength: file.size, slice: (s: number, e?: number) => file.slice(s, e ?? file.size).arrayBuffer() };
}

function display(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'bigint') return v.toString();
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function leafColumns(md: FileMetaData): string[] {
  return md.schema.slice(1).filter((e) => !e.num_children).map((e) => e.name);
}

async function specOfFirst(file: File, md: FileMetaData) {
  const columns = leafColumns(md);
  const n = Math.min(50, Number(md.num_rows));
  const sample = (await parquetReadObjects({ file: asyncBuffer(file), metadata: md, rowStart: 0, rowEnd: n })) as Record<string, unknown>[];
  const rows = sample.map((r) => columns.map((c) => display(r[c])));
  const numeric = columns.map((c) => {
    const el = md.schema.find((e) => e.name === c);
    return !!el && ['FLOAT', 'DOUBLE', 'INT32', 'INT64', 'BOOLEAN'].includes(String(el.type)) && (!el.converted_type || /^U?INT_/.test(String(el.converted_type)));
  });
  const timestamps = columns.filter((c) => {
    const el = md.schema.find((e) => e.name === c);
    const lt = el?.logical_type as { type?: string } | undefined;
    return !!el && ((!!lt?.type && /TIMESTAMP|DATE/i.test(lt.type)) || (!!el.converted_type && /TIMESTAMP|DATE/i.test(String(el.converted_type))));
  });
  const hints = md.key_value_metadata?.find((kv) => kv.key === 'heat3d')?.value ?? null;
  return leanSpec({ columns, rows, numeric, hints, timestamps });
}

/** A pool of decode workers taking jobs as they free up. */
class Pool {
  private readonly workers: Worker[] = [];
  private readonly idle: Worker[] = [];
  private readonly waiting: (() => void)[] = [];
  private next = 1;
  private readonly pending = new Map<number, { resolve: (r: DecodeResponse) => void }>();

  constructor(n: number) {
    for (let i = 0; i < n; i++) {
      const w = new Worker(new URL('./decodeWorker.ts', import.meta.url), { type: 'module' });
      w.onmessage = (ev: MessageEvent<DecodeResponse>) => {
        const p = this.pending.get(ev.data.id);
        this.pending.delete(ev.data.id);
        this.idle.push(w);
        this.waiting.shift()?.();
        p?.resolve(ev.data);
      };
      w.onerror = (ev) => {
        ev.preventDefault();
        for (const [id, p] of this.pending) p.resolve({ id, ok: false, error: ev.message || 'decode worker failed' });
        this.pending.clear();
      };
      this.workers.push(w);
      this.idle.push(w);
    }
  }

  /** Runs a job on the next free worker; `make` builds its request only then, so requests are not all held at once. */
  async run(make: () => { req: Omit<DecodeRequest, 'id'>; transfer?: Transferable[] }): Promise<DecodeResponse> {
    while (!this.idle.length) await new Promise<void>((r) => this.waiting.push(r));
    const w = this.idle.pop()!;
    const id = this.next++;
    const { req, transfer } = make();
    return new Promise((resolve) => {
      this.pending.set(id, { resolve });
      w.postMessage({ ...req, id } as DecodeRequest, transfer ?? []);
    });
  }

  close(): void {
    for (const w of this.workers) w.terminate();
  }
}

ctx.onmessage = async (ev: MessageEvent<LoadRequest>) => {
  const { files, maxKeys, threads, name } = ev.data;
  const post = (r: LoadResponse, transfer?: Transferable[]) => ctx.postMessage(r, transfer ?? []);
  const ms: Record<string, number> = {};
  let t0 = performance.now();
  const lap = (k: string) => {
    const t = performance.now();
    ms[k] = Math.round(t - t0);
    t0 = t;
  };
  let pool: Pool | null = null;
  try {
    // Footers, a few at a time.
    const metas: (FileMetaData | null)[] = new Array(files.length).fill(null);
    let done = 0;
    const footerAt = async (i: number) => {
      try {
        metas[i] = await parquetMetadataAsync(asyncBuffer(files[i]));
      } catch {
        metas[i] = null;
      }
      if (++done % 50 === 0 || done === files.length) post({ kind: 'progress', progress: { phase: 'footers', done, total: files.length, rows: 0, totalRows: 0 } });
    };
    for (let i = 0; i < files.length; i += 32) await Promise.all(files.slice(i, i + 32).map((_, k) => footerAt(i + k)));
    const first = metas.findIndex((m) => m && Number(m.num_rows) > 0);
    if (first < 0) {
      post({ kind: 'error', reason: 'noRows' });
      return;
    }
    const sp = await specOfFirst(files[first], metas[first]!);
    if (!sp.ok) {
      post({ kind: 'error', reason: sp.reason });
      return;
    }
    const skipped: string[] = [];
    const used: { file: File; md: FileMetaData; spec: LeanSpec }[] = [];
    metas.forEach((md, i) => {
      const spec = md ? specFor(sp.spec, new Set(leafColumns(md))) : null;
      if (!md || !spec || Number(md.num_rows) === 0) skipped.push(files[i].name);
      else used.push({ file: files[i], md, spec });
    });
    const leanFiles: LeanFile[] = used.map((u) => ({ name: u.file.name, rowGroups: u.md.row_groups.map((g) => Number(g.num_rows)) }));
    const jobs = planJobs(leanFiles);
    const totalRows = leanFiles.reduce((a, f) => a + f.rowGroups.reduce((x, y) => x + y, 0), 0);
    // Every tolerance counted only when the rows could be more keys than fit.
    const asm = new LeanAssembler(leanFiles, jobs, sp.spec, totalRows > maxKeys);
    lap('footers');
    // A decode holds its rows as JS arrays, some 400 bytes a row with what is made of them: no more at once than fit in DECODE_BYTES.
    const biggest = jobs.reduce((a, j) => Math.max(a, j.rowEnd - j.rowStart), 1);
    pool = new Pool(Math.max(1, Math.min(threads, jobs.length, Math.floor(DECODE_BYTES / (biggest * ROW_BYTES)))));
    const p = pool;
    let rows = 0;
    done = 0;
    let lastPost = 0;
    const report = (phase: LoadProgress['phase']) => {
      const now = performance.now();
      if (now - lastPost < 150 && done < jobs.length) return;
      lastPost = now;
      post({ kind: 'progress', progress: { phase, done, total: jobs.length, rows, totalRows } });
    };
    const fail = (r: DecodeResponse) => {
      if (!r.ok) throw new Error(r.error);
    };
    await Promise.all(
      jobs.map(async (job, j) => {
        const u = used[job.file];
        const r = await p.run(() => ({ req: { pass: 1, file: u.file, fileIndex: job.file, rowStart: job.rowStart, rowEnd: job.rowEnd, spec: u.spec, levels: asm.levels } }));
        fail(r);
        if (r.ok && r.pass === 1) asm.addPass1(j, r.result);
        rows += job.rowEnd - job.rowStart;
        done++;
        report('scan');
      }),
    );
    lap('scan');
    const plan = asm.plan(maxKeys);
    if (!plan) {
      post({ kind: 'error', reason: 'tooBig', detail: String(asm.totals().keys.at(-1)) });
      return;
    }
    post({ kind: 'planned', samples: asm.totals().samples, keys: plan.keys, level: plan.level, skipped });
    rows = 0;
    done = 0;
    await Promise.all(
      jobs.map(async (job, j) => {
        const u = used[job.file];
        const r = await p.run(() => {
          const inp = asm.pass2Input(j);
          return { req: { pass: 2, file: u.file, fileIndex: job.file, rowStart: job.rowStart, rowEnd: job.rowEnd, spec: u.spec, spans: inp.spans, alloc: inp.alloc, level: inp.level }, transfer: [inp.spans.buffer] };
        });
        fail(r);
        if (r.ok && r.pass === 2) asm.addPass2(j, r.result);
        rows += job.rowEnd - job.rowStart;
        done++;
        report('keys');
      }),
    );
    lap('keys');
    pool.close();
    pool = null;
    post({ kind: 'progress', progress: { phase: 'build', done: 0, total: 1, rows: totalRows, totalRows } });
    const built = asm.finish(name, sp.entitySize);
    lap('build');
    const d = built.dataset;
    const transfer: ArrayBufferLike[] = [built.groupStart.buffer, built.trackData.buffer, built.keysA.buffer, built.keysB.buffer, built.trackRow.buffer, built.trackGroup.buffer, built.trackFile.buffer, built.trackRows.buffer, built.markers.data.buffer, built.markers.team.buffer, built.markers.group.buffer];
    for (const a of [d.px, d.py, d.pz, d.time, d.lifetime, d.personId, d.teamId, d.personShared, d.personTeam, d.personSlot, d.teamSizes]) if (a) transfer.push(a.buffer);
    for (const a of d.attrs) transfer.push(a.data.buffer);
    post({ kind: 'done', built, skipped, ms }, [...new Set(transfer)] as Transferable[]);
  } catch (e) {
    post({ kind: 'error', reason: 'failed', detail: e instanceof Error ? e.message : String(e) });
  } finally {
    pool?.close();
  }
};
