/// <reference lib="webworker" />
/**
 * One match's summary worked out in the browser, for a file the mass index
 * has none for (`massWorker.ts` keeps a few of these busy): a container's
 * table with its manifest and match document, or a loose table.
 */

import { openContainer, isContainer } from '../data/container';
import { objectivesOf, summarizeColumns, summarizeTable } from './summarize';
import { isOcapName, ocapHints, ocapText, parseOcap } from '../data/ocap';
import type { ObjectiveEvent } from '../outcome/collect';
import type { MatchSummary } from './types';

export type SummarizeRequest = { id: number; file: File; path: string };
export type SummarizeResponse = { id: number; ok: true; summary: MatchSummary | null; ms: number } | { id: number; ok: false; error: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

const asyncBuffer = (file: Blob) => ({ byteLength: file.size, slice: (s: number, e?: number) => file.slice(s, e ?? file.size).arrayBuffer() });

ctx.onmessage = async (ev: MessageEvent<SummarizeRequest>) => {
  const { id, file, path } = ev.data;
  const t0 = performance.now();
  try {
    let table: File | null = file;
    let manifest = null;
    let doc: Record<string, unknown> | null = null;
    let objectives: ObjectiveEvent[] | null = null;
    const stem = path.slice(path.lastIndexOf('/') + 1).replace(/\.(3dheat|parquet)$/i, '');
    if (isContainer(file.name)) {
      const c = await openContainer(file);
      manifest = c.manifest;
      table = c.table;
      try {
        doc = (await c.json('match')) as Record<string, unknown> | null;
      } catch {
        doc = null;
      }
      try {
        const o = await c.member('objectives');
        if (o) objectives = await objectivesOf(asyncBuffer(o));
      } catch {
        objectives = null;
      }
    }
    if (isOcapName(file.name)) {
      // A recording its own reader reads (`ocap.ts`): the table in memory, read by the reader's hints.
      const name = stem.replace(/\.jsonl?(\.gz)?$/i, '');
      const t = parseOcap(await ocapText(file), name);
      const started = (t.data[t.columns.indexOf('Date')] as string[] | undefined)?.[0] || null;
      const info = { id: name, manifest: { game: t.game, map: t.map, mode: null, started, match: name }, by: 'viewer' };
      const summary = summarizeColumns(t, info, JSON.stringify(ocapHints(t)));
      // Arma missions are mostly played once (a community's evening, a new scenario each week): the mass analysis
      // groups them by their map, not by a mission name no other recording shares.
      if (summary) summary.mission = null;
      ctx.postMessage({ id, ok: true, summary, ms: performance.now() - t0 } satisfies SummarizeResponse);
      return;
    }
    if (!table) throw new Error('no table');
    const summary = await summarizeTable(asyncBuffer(table), { id: manifest?.match ?? stem, manifest, doc, objectives, by: 'viewer' });
    ctx.postMessage({ id, ok: true, summary, ms: performance.now() - t0 } satisfies SummarizeResponse);
  } catch (e) {
    ctx.postMessage({ id, ok: false, error: e instanceof Error ? e.message : String(e) } satisfies SummarizeResponse);
  }
};
