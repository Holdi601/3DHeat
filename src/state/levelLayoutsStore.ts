/**
 * The loaded level's layouts (`match/levelLayouts.ts`) and which one is shown.
 *
 * Where they come from, first found wins:
 * - a `<Level>.layouts.json` picked or dropped with data or on its own
 *   (`loadLayoutFiles`), kept for this session under its game and level;
 * - the local server's `/__heat3d/layouts/<game>/<level>` (vite.config.ts),
 *   which answers the file beside the level in the levels folder, so a level
 *   loaded from the library finds its layouts by itself.
 *
 * Which layout: the one the user picked for this level, else the one the
 * data's mode names (`noteLayoutModes`: a `mode` column's first value, the
 * match documents' modes), else the first.
 */

import { create } from 'zustand';
import { parquetMetadataAsync, parquetReadObjects } from 'hyparquet';
import { asyncBufferFromFile } from '../data/parquet';
import { isLayoutsFile, layoutsKey, norm, parseLevelLayouts, pickLayout, type LevelLayout, type LevelLayouts } from '../match/levelLayouts';

/** Where the local server answers a level's layouts file. */
export const LAYOUTS_ROUTE = '/__heat3d/layouts';

interface LayoutsState {
  docs: Record<string, LevelLayouts>;
  /** The layout the user picked, by level key; none: the data's. */
  chosen: Record<string, string>;
  /** The modes the data loaded last names, in the order they came. */
  modes: string[];
  /** Level keys already asked of the local server (found or not). */
  asked: Record<string, true>;
  rev: number;
  add: (doc: LevelLayouts) => void;
  choose: (key: string, id: string | null) => void;
  setModes: (modes: string[]) => void;
}

export const useLevelLayouts = create<LayoutsState>((set, get) => ({
  docs: {},
  chosen: {},
  modes: [],
  asked: {},
  rev: 0,
  add: (doc) =>
    set({
      docs: { ...get().docs, [layoutsKey(doc.game, doc.level)]: doc },
      rev: get().rev + 1,
    }),
  choose: (key, id) => {
    const chosen = { ...get().chosen };
    if (id) chosen[key] = id;
    else delete chosen[key];
    set({ chosen, rev: get().rev + 1 });
  },
  setModes: (modes) => {
    const was = get().modes;
    if (modes.length === was.length && modes.every((m, i) => m === was[i])) return;
    // New data: its own mode wins over a layout picked for the old.
    set({ modes, chosen: {}, rev: get().rev + 1 });
  },
}));

/**
 * A level's layouts by game and level; with no game (a level whose parts do
 * not name one), the one level of that name, whatever its game.
 */
export function layoutsDoc(game: string, level: string): { key: string; doc: LevelLayouts } | null {
  const docs = useLevelLayouts.getState().docs;
  if (game) {
    const key = layoutsKey(game, level);
    return docs[key] ? { key, doc: docs[key] } : null;
  }
  const hits = Object.entries(docs).filter(([, d]) => norm(d.level) === norm(level));
  return hits.length === 1 ? { key: hits[0][0], doc: hits[0][1] } : null;
}

/** Reads the `.layouts.json` among `files`; how many were layouts. */
export async function loadLayoutFiles(files: File[]): Promise<number> {
  let n = 0;
  for (const f of files.filter((f) => isLayoutsFile(f.name))) {
    try {
      const doc = parseLevelLayouts(JSON.parse(await f.text()));
      if (doc) {
        useLevelLayouts.getState().add(doc);
        n++;
      }
    } catch {
      // Not a layouts file after all: left alone.
    }
  }
  return n;
}

/** Asks the local server once for a level's layouts; quiet when there is no server or no file. */
export function wantLayouts(game: string, level: string): void {
  const key = layoutsKey(game || '_', level);
  const st = useLevelLayouts.getState();
  if (layoutsDoc(game, level) || st.asked[key] || typeof fetch !== 'function') return;
  useLevelLayouts.setState({ asked: { ...st.asked, [key]: true } });
  void fetch(`${LAYOUTS_ROUTE}/${encodeURIComponent(game || '_')}/${encodeURIComponent(level)}`)
    .then((r) => (r.ok && r.status !== 204 ? r.json() : null))
    .then((j) => {
      const doc = j ? parseLevelLayouts(j) : null;
      if (doc) useLevelLayouts.getState().add(doc);
    })
    .catch(() => {
      // No local server (a hosted build): layouts come by picking the file.
    });
}

/** The layout shown on a level: the user's pick, else the data's mode, else the first. */
export function shownLayout(game: string, level: string): LevelLayout | null {
  const found = layoutsDoc(game, level);
  if (!found) return null;
  const st = useLevelLayouts.getState();
  const id = st.chosen[found.key];
  return (id && found.doc.layouts.find((l) => l.id === id)) || pickLayout(found.doc, st.modes);
}

const MODE_COLUMN = /^(game_?)?mode(_?name)?$|^gamemode$/i;

/** Notes the modes picked Parquet tables are played in, from the first row's mode column. */
export async function noteLayoutModes(files: File[]): Promise<void> {
  const found: string[] = [];
  for (const file of files.filter((f) => /\.parquet$/i.test(f.name)).slice(0, 50)) {
    try {
      const buf = asyncBufferFromFile(file);
      const metadata = await parquetMetadataAsync(buf);
      const col = metadata.schema.map((s) => s.name).find((n) => MODE_COLUMN.test(n));
      if (!col) continue;
      const rows = (await parquetReadObjects({
        file: buf,
        metadata,
        columns: [col],
        rowStart: 0,
        rowEnd: 1,
      })) as Record<string, unknown>[];
      const v = rows[0]?.[col];
      if (typeof v === 'string' && v && !found.includes(v)) found.push(v);
    } catch {
      // A table that does not read says nothing about its mode.
    }
  }
  if (found.length) useLevelLayouts.getState().setModes(found);
}
