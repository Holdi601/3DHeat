/**
 * The shared layers this viewer brings to a session, registered with
 * `shared.ts`: the tactics board (`planStore`), the marks (world notes and
 * drawings over any view, `marks.ts`) and the data notes and analysis
 * documents (`notes/store.ts`, collections `notes` and `docs`), the volumes and the replay's bookmarks. Another module adds its own
 * document the same way (`registerSharedDoc`), and it is synced and saved
 * with the session without anything here knowing it.
 */

import { BASE_LAYER, emptyPlan, type Plan } from '../tactics/plan';
import { COLLECTIONS } from '../tactics/ops';
import { hasContent } from '../tactics/autosave';
import { gamePreset } from '../tactics/games';
import { usePlanStore } from '../state/planStore';
import { useNotes } from '../notes/store';
import { EMPTY_BOOK, readBook, type NotesBook } from '../notes/model';
import { registerSharedDoc } from './shared';
import { MARK_COLLS, emptyMarks, useMarks, type MarksState } from './marks';
import { useTileHeatShare } from '../render/heatTiles/tileHeat';
import { useVolumeStore } from '../volumes/store';
import { parseVolume, type Volume } from '../volumes/volume';
import { parseBookmarks, useBookmarkStore, type Bookmark } from '../ui/replay/bookmarks';

let registered = false;

/** One object per list, so an unchanged list reads as unchanged (the sync compares by reference). */
function memoDoc<T>(key: string) {
  let last: { list: T[]; doc: Record<string, T[]> } | null = null;
  return (list: T[]) => {
    if (last?.list !== list) last = { list, doc: { [key]: list } };
    return last.doc;
  };
}
const volumesDoc = memoDoc<Volume>('volumes');
const bookmarksDoc = memoDoc<Bookmark>('bookmarks');

/** Every entity's id on a board. */
function idsOf(plan: Plan): Set<string> {
  const ids = new Set<string>();
  for (const c of COLLECTIONS) for (const e of ((plan as unknown as Record<string, { id: string }[]>)[c] ?? [])) ids.add(e.id);
  return ids;
}

export function registerBuiltInDocs(): void {
  if (registered) return;
  registered = true;
  registerSharedDoc({
    key: 'tactics',
    colls: COLLECTIONS,
    text: { notes: ['text'] },
    get: () => usePlanStore.getState().plan,
    set: (state) => {
      const plan = state as Plan;
      const s = usePlanStore.getState();
      usePlanStore.setState({
        plan,
        step: Math.min(s.step, Math.max(0, (plan.steps?.length ?? 1) - 1)),
        activeLayer: plan.layers?.some((l) => l.id === s.activeLayer) ? s.activeLayer : BASE_LAYER,
        selection: s.selection.length ? s.selection.filter((r) => idsOf(plan).has(r.split('#')[0])) : s.selection,
      });
    },
    empty: () => {
      const p = gamePreset('cs2');
      return emptyPlan(p.id, p.teams);
    },
    hasContent: (state) => hasContent(state as Plan),
  });
  registerSharedDoc({
    key: 'marks',
    colls: MARK_COLLS,
    get: () => useMarks.getState().doc,
    set: (state) => useMarks.setState({ doc: state as MarksState }),
    empty: emptyMarks,
    hasContent: (state) => MARK_COLLS.some((c) => ((state as unknown as Record<string, unknown[]>)[c]?.length ?? 0) > 0),
  });
  // The notes book: its edits go through `commit` (a new book each), so the
  // sync reads them as differences like any other document; a state from the
  // session replaces the book and bumps `rev`, which redraws pins and marks.
  // Its own op log (`onLocalBatch` / `applyRemote`) stays the notes' local
  // history; the session file also keeps it (`sessionFile.ts`, `notesState`).
  registerSharedDoc({
    key: 'notes',
    colls: ['notes', 'docs'],
    // Several people typing in one note or analysis keep each other's words.
    text: { notes: ['title', 'text'], docs: ['title', 'body'] },
    get: () => useNotes.getState().book,
    set: (state) => useNotes.setState((s) => ({ book: readBook(state as NotesBook), rev: s.rev + 1 })),
    empty: () => EMPTY_BOOK,
    hasContent: (state) => ((state as NotesBook).notes?.length ?? 0) + ((state as NotesBook).docs?.length ?? 0) > 0,
  });
  // The volumes drawn on the data (their chart signs are their own document, `signs`).
  registerSharedDoc({
    key: 'volumes',
    colls: ['volumes'],
    get: () => volumesDoc(useVolumeStore.getState().volumes),
    set: (state) => {
      const list = (state as { volumes?: unknown }).volumes;
      const volumes = Array.isArray(list) ? list.map((v, i) => parseVolume(v, i)).filter((v): v is Volume => !!v) : [];
      const s = useVolumeStore.getState();
      useVolumeStore.setState({ volumes, selected: s.selected && volumes.some((v) => v.id === s.selected) ? s.selected : null });
    },
    empty: () => ({ volumes: [] }),
    hasContent: (state) => ((state as { volumes?: unknown[] }).volumes?.length ?? 0) > 0,
  });
  // The replay's bookmarks: moments with their camera, of the recording loaded.
  registerSharedDoc({
    key: 'bookmarks',
    colls: ['bookmarks'],
    get: () => bookmarksDoc(useBookmarkStore.getState().list),
    set: (state) => {
      const list = (state as { bookmarks?: unknown }).bookmarks;
      useBookmarkStore.setState({ list: parseBookmarks(JSON.stringify(Array.isArray(list) ? list : [])) });
    },
    empty: () => ({ bookmarks: [] }),
    hasContent: (state) => ((state as { bookmarks?: unknown[] }).bookmarks?.length ?? 0) > 0,
  });
  // The host's heat from tiles (Stage 6): the pyramid's key and where it lies, so
  // members draw the same heat, read through the session's gateway by key only.
  registerSharedDoc({
    key: 'heattiles',
    colls: [],
    get: () => useTileHeatShare.getState().doc,
    set: (state) => useTileHeatShare.setState({ doc: { ...(state as object) } }),
    empty: () => ({}),
    hasContent: (state) => !!(state as { key?: string }).key,
  });
}
