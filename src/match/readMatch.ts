/**
 * What a loaded match file says about its match, for the match tab: its match
 * document - a War Thunder battle's results, a CS2 match's rounds - when it
 * has one; else its summary (`mass/types.ts`, the teams, players, kills and
 * vehicles), the container's own `summary` member or, where it has none,
 * worked out from its table. Every `.3dheat` holds a table, so every one
 * says something; nothing has to be loaded beside it by hand.
 *
 * Pure of the stores, so the match tab's worker (`state/matchReadWorker.ts`)
 * runs it off the main thread: a battle's document is up to tens of
 * megabytes of JSON, and working out a summary reads the whole table.
 */

import { isContainer, openContainer } from '../data/container';
import { summarizeTable } from '../mass/summarize';
import { SUMMARY_FORMAT, type MatchSummary, type SummaryHead } from '../mass/types';
import { parseMatchDoc, type MatchDoc } from './matchDoc';
import { isWtMatch, parseWtMatch, type GameMatch } from './wtMatch';
import { isGhpcMatch, parseGhpcMatch } from './ghpcMatch';

export type MatchRead =
  | { kind: 'doc'; doc: MatchDoc }
  | { kind: 'game'; game: GameMatch }
  | { kind: 'summary'; summary: SummaryHead }
  | { kind: 'none' };

/** Whether parsed JSON is a match summary (`3dheat-summarize`'s, or the viewer's own). */
export function isSummary(j: unknown): j is MatchSummary {
  return !!j && typeof j === 'object' && (j as { format?: unknown }).format === SUMMARY_FORMAT && Array.isArray((j as { teams?: unknown }).teams);
}

/** A summary without its grid: the grid is the mass analysis', and most of the bytes. */
export function summaryHead(s: MatchSummary): SummaryHead {
  return { ...s, grid: null };
}

const asyncBuffer = (file: Blob) => ({ byteLength: file.size, slice: (s: number, e?: number) => file.slice(s, e ?? file.size).arrayBuffer() });

/** A match document's scoreboard, or null for one without (a Siege match's is its bomb sites only). */
function fromDoc(j: unknown, text: () => string, name: string): MatchRead | null {
  if (!j || typeof j !== 'object') return null;
  if (isWtMatch(j)) return { kind: 'game', game: parseWtMatch(j as Record<string, unknown>) };
  if (isGhpcMatch(j)) return { kind: 'game', game: parseGhpcMatch(j as Record<string, unknown>) };
  if ((j as { format?: unknown }).format === 'heat3d-cs2-match') return { kind: 'doc', doc: parseMatchDoc(text(), name) };
  return null;
}

/**
 * What `file` - a `.3dheat` container, a `<match>.match.json` or a loose
 * table - says of its match; `compute` false leaves a table without a
 * summary unread (`none`).
 */
export async function readMatchFile(file: File, compute = true): Promise<MatchRead> {
  const stem = file.name.replace(/\.(3dheat|parquet|pq)$/i, '').replace(/\.match\.json$/i, '');
  if (/\.json$/i.test(file.name)) {
    const text = await file.text();
    const j = JSON.parse(text) as unknown;
    if (isSummary(j)) return { kind: 'summary', summary: summaryHead(j) };
    return fromDoc(j, () => text, file.name) ?? { kind: 'none' };
  }
  let table: File | null = file;
  let manifest = null;
  let doc: Record<string, unknown> | null = null;
  if (isContainer(file.name)) {
    const c = await openContainer(file);
    manifest = c.manifest;
    table = c.table;
    try {
      doc = (await c.json('match')) as Record<string, unknown> | null;
    } catch {
      doc = null;
    }
    const scored = fromDoc(doc, () => JSON.stringify(doc), file.name);
    if (scored) return scored;
    let own: unknown = null;
    try {
      own = await c.json('summary');
    } catch {
      own = null;
    }
    if (isSummary(own)) return { kind: 'summary', summary: summaryHead(own) };
  }
  if (!table || !compute) return { kind: 'none' };
  const s = await summarizeTable(asyncBuffer(table), { id: manifest?.match ?? stem, manifest, doc, by: 'viewer' });
  return s ? { kind: 'summary', summary: summaryHead(s) } : { kind: 'none' };
}
