/**
 * The match tab's state: the match summaries loaded - CS2's analysis, War
 * Thunder's results - which CS2 match is open, which round, and what the last
 * "show in the heatmap" could not do.
 */

import { create } from 'zustand';
import { parseMatchDoc, type MatchDoc } from '../match/matchDoc';
import { isWtMatch, parseWtMatch, type GameMatch } from '../match/wtMatch';
import { isContainer, openContainer } from '../data/container';
import { isObjectivesFile, loadObjectiveFiles, useObjectivesStore } from './objectivesStore';
import { parseObjectives } from '../match/objectives';
import type { MatchRead } from '../match/readMatch';
import type { SummaryHead } from '../mass/types';
import { registerLazyMatches } from './objectivesLazy';
import type { MatchReadResponse } from './matchReadWorker';

/** `ALL` as the open match: every loaded match together. */
export const ALL = '';

export interface MatchState {
  docs: MatchDoc[];
  /** Summaries of other games' matches, by match name. */
  games: GameMatch[];
  /**
   * The loaded matches that have no scoreboard of their own (a DCS recording,
   * a Siege match): their summaries, read from their containers or worked out
   * from their tables (`match/readMatch.ts`).
   */
  summaries: SummaryHead[];
  /** Match files being read for the match tab. */
  reading: number;
  /** Takes what a match file said (`readMatchFile`). */
  addRead: (read: MatchRead) => void;
  /** The open match's name, or ALL. */
  open: string;
  round: number | null;
  error: string | null;
  notice: string | null;
  /** With `quiet`, a container without a match document is passed over, and nothing is reported. */
  load: (files: File[], quiet?: boolean) => Promise<void>;
  setOpen: (match: string) => void;
  setRound: (round: number | null) => void;
  setNotice: (notice: string | null) => void;
  clear: () => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  docs: [],
  games: [],
  summaries: [],
  reading: 0,
  open: ALL,
  round: null,
  error: null,
  notice: null,
  addRead: (read) => {
    if (read.kind === 'game') {
      const games = [...get().games.filter((g) => g.match !== read.game.match), read.game];
      set({ games: games.sort((a, b) => a.started.localeCompare(b.started) || a.match.localeCompare(b.match)) });
    } else if (read.kind === 'doc') {
      const docs = [...get().docs.filter((d) => d.match !== read.doc.match), read.doc];
      set({ docs: docs.sort((a, b) => a.map.localeCompare(b.map) || a.match.localeCompare(b.match)), open: docs.length === 1 ? docs[0].match : get().open });
    } else if (read.kind === 'summary') {
      set({ summaries: [...get().summaries.filter((s) => s.id !== read.summary.id), read.summary] });
    }
  },
  load: async (files, quiet = false) => {
    const docs = [...get().docs];
    const games = [...get().games];
    const errors: string[] = [];
    for (const file of files) {
      const packed = isContainer(file.name);
      if (!/\.json$/i.test(file.name) && !packed) continue;
      try {
        // A `.3dheat` container: its match document, nothing else read (docs/container.md).
        const packedJson = packed ? await (await openContainer(file)).json('match') : undefined;
        if (quiet && packed && packedJson === null) continue;
        const text = packed ? JSON.stringify(packedJson) : await file.text();
        let json: unknown = null;
        try {
          json = JSON.parse(text);
        } catch {
          // parseMatchDoc says what is wrong with it.
        }
        if (isR6Match(json)) {
          // A Rainbow Six Siege match: its bomb sites are the objectives the replay draws (no scoreboard here).
          const j = json as Record<string, unknown>;
          const objectives = parseObjectives(j.objectives);
          if (objectives.length) useObjectivesStore.getState().addLite([{ match: String(j.match ?? ''), objectives }]);
          continue;
        }
        if (isWtMatch(json)) {
          const g = parseWtMatch(json as Record<string, unknown>);
          const at = games.findIndex((x) => x.match === g.match);
          if (at >= 0) games[at] = g;
          else games.push(g);
          continue;
        }
        const doc = parseMatchDoc(text, file.name);
        const at = docs.findIndex((d) => d.match === doc.match);
        if (at >= 0) docs[at] = doc;
        else docs.push(doc);
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e));
      }
    }
    docs.sort((a, b) => a.map.localeCompare(b.map) || a.match.localeCompare(b.match));
    games.sort((a, b) => a.started.localeCompare(b.started) || a.match.localeCompare(b.match));
    const open = docs.length === 1 ? docs[0].match : get().open;
    if (quiet) {
      set({ docs, games, open });
      return;
    }
    set({ docs, games, open, round: null, error: errors.length ? errors.join('\n') : null });
  },
  setOpen: (open) => set({ open, round: null, notice: null }),
  setRound: (round) => set({ round }),
  setNotice: (notice) => set({ notice }),
  clear: () => set({ docs: [], games: [], summaries: [], open: ALL, round: null, error: null, notice: null }),
}));

let readWorker: Worker | null = null;
let readId = 1;
const readWaiting = new Map<number, (r: MatchRead | null) => void>();

/** What a match file says of its match, read in the worker; null when it cannot be read. */
function readInWorker(file: File): Promise<MatchRead | null> {
  if (typeof Worker === 'undefined') return Promise.resolve(null);
  if (!readWorker) {
    readWorker = new Worker(new URL('./matchReadWorker.ts', import.meta.url), { type: 'module' });
    readWorker.onmessage = (e: MessageEvent<MatchReadResponse>) => {
      const done = readWaiting.get(e.data.id);
      readWaiting.delete(e.data.id);
      done?.('read' in e.data ? e.data.read : null);
    };
  }
  const id = readId++;
  return new Promise((resolve) => {
    readWaiting.set(id, resolve);
    readWorker!.postMessage({ id, file });
  });
}

/** Reads `file` for the match tab (`readMatchFile`) and keeps what it says. */
async function readBeside(file: File, as?: string): Promise<void> {
  const st = useMatchStore.getState();
  useMatchStore.setState({ reading: st.reading + 1 });
  const gen = loadGen;
  try {
    const r = await readInWorker(file);
    // A later load has taken over: what this one's file says is no longer shown.
    // A summary goes under the match's name in the data, which the match tab looks it up by.
    if (r && gen === loadGen) useMatchStore.getState().addRead(r.kind === 'summary' && as ? { kind: 'summary', summary: { ...r.summary, id: as } } : r);
  } finally {
    useMatchStore.setState({ reading: Math.max(0, useMatchStore.getState().reading - 1) });
  }
}

/** The last load's match files by match name (the file's stem), read when their match is shown (`wantMatch`). */
let besideFiles = new Map<string, File>();
/** Bumped by every load of data. */
let loadGen = 0;

/** `wantMatch`'s id for every file of the load, when the data is one match of them all. */
export const ALL_FILES = '\u0000all';
/** Files of a one-match load read at most. */
const MAX_ALL = 8;

const stemOf = (name: string) => name.replace(/\.(3dheat|parquet|pq)$/i, '').replace(/\.match\.json$/i, '');

/**
 * A match of a many-match load is shown in the match tab: what its file says,
 * read once. `id` is the match's name in the data (`matches.ts`), which starts
 * with its file's stem.
 */
export function wantMatch(id: string): void {
  // The data as one match (a campaign round of several recordings): every file of it, a few at most.
  if (id === ALL_FILES) {
    if (besideFiles.size > MAX_ALL) return;
    for (const f of besideFiles.values()) void readBeside(f);
    besideFiles = new Map();
    return;
  }
  for (const [stem, f] of besideFiles) {
    if (id !== stem && !id.startsWith(stem)) continue;
    besideFiles.delete(stem);
    void readBeside(f, id);
    return;
  }
}

/** Whether parsed JSON is a Rainbow Six Siege match document (`heat3d-r6-replay`'s). */
export function isR6Match(j: unknown): boolean {
  return !!j && typeof j === 'object' && (j as { format?: unknown }).format === 'heat3d-r6-replay-match';
}

/**
 * The match documents and the capture zones over time that come with data
 * loaded for the heatmap or the replay: each `.3dheat` container's, and a
 * loose `<match>.match.json` or `<match>.objectives.parquet` beside the
 * tables. Before, a battle's objectives were drawn only once its files had
 * also been picked in the match tab. Quiet: data without a match document is
 * nothing to report. One match is read whole, as the match tab reads it; of
 * more, only the objectives, when they are first shown (`objectivesLazy.ts`).
 */
export async function loadMatchesBeside(files: File[]): Promise<void> {
  const docs = files.filter((f) => isContainer(f.name) || /\.match\.json$/i.test(f.name));
  // A new load: the last one's summaries and unread files are not of it.
  loadGen++;
  besideFiles = new Map();
  useMatchStore.setState({ summaries: [] });
  if (docs.length > 1) {
    registerLazyMatches(files);
    // Each match's scoreboard or summary is read when the match tab shows it (`wantMatch`).
    for (const f of docs) if (!besideFiles.has(stemOf(f.name)) || isContainer(f.name)) besideFiles.set(stemOf(f.name), f);
    return;
  }
  const before = useMatchStore.getState();
  const scored = before.docs.length + before.games.length;
  if (docs.length) await useMatchStore.getState().load(docs, true);
  const after = useMatchStore.getState();
  // No scoreboard came with it: the container's summary, or one worked out from the table.
  const tables = files.filter((f) => /\.(parquet|pq)$/i.test(f.name) && !isObjectivesFile(f.name) && !/\.(flight|messages|events|effects|entities)\.(parquet|pq)$/i.test(f.name));
  const source = docs.find((f) => isContainer(f.name)) ?? (docs.length === 0 && tables.length === 1 ? tables[0] : null);
  if (source && after.docs.length + after.games.length === scored) void readBeside(source);
  const sidecars = files.filter((f) => isContainer(f.name) || isObjectivesFile(f.name));
  if (sidecars.length) await loadObjectiveFiles(sidecars);
}
