/**
 * The session's notes and analysis documents (`model.ts`), and the log of
 * every change to them (`ops.ts`).
 *
 * Every edit goes through `commit`: the book before and after are compared
 * into a batch of operations, the batch is logged and handed to whoever
 * listens (`onLocalBatch`: a shared session sends it on), and the book is
 * kept in this browser a moment later (IndexedDB, else localStorage: browser
 * storage can be missing or full, so the viewer works without it and the JSON
 * file is the copy to rely on). A batch from elsewhere goes in with
 * `applyRemote`, once per batch id.
 *
 * For the session file: `notesState()` is everything to save, and
 * `loadNotesState()` puts a saved one back.
 */

import { create } from 'zustand';
import { loadAuthor, saveAuthor } from '../tactics/autosave';
import { EMPTY_BOOK, NOTES_SCHEMA, newId, readBook, type AnalysisDoc, type DataNote, type NotesBook } from './model';
import { applyBookOps, diffBooks, isNoteBatch, type NoteBatch } from './ops';
import type { Anchor } from './anchors';

/** Batches the log keeps. */
export const LOG_KEEP = 2000;

/** What a session file holds of the notes. */
export interface NotesSessionState {
  schema: typeof NOTES_SCHEMA;
  book: NotesBook;
  log: NoteBatch[];
}

interface NotesState {
  book: NotesBook;
  log: NoteBatch[];
  /** Goes up with every change: what draws from the book (pins, marks, badges) rebuilds on it. */
  rev: number;
  author: string;
  /** The note open in the editor; `new` while one is being made. */
  editing: string | null;
  /** A note being made, before it is saved. */
  draft: DataNote | null;
  /** What else the note being made could be about (`capture.ts` anchorChoices). */
  choices: Anchor[] | null;
  /** The document open in the analysis window. */
  docOpen: string | null;
  /** The note whose pin is under the pointer. */
  hover: string | null;
  /** Note pins drawn in the view. */
  pins: boolean;
  /** Whether the kept copy has been read in. */
  loaded: boolean;
  /** The last autosave failed for want of room. */
  storageFull: boolean;

  commit: (next: NotesBook) => void;
  addNote: (n: Omit<DataNote, 'id' | 'created' | 'updated' | 'author'> & { id?: string }) => DataNote;
  updateNote: (id: string, patch: Partial<Omit<DataNote, 'id' | 'created'>>) => void;
  removeNote: (id: string) => void;
  addDoc: (title: string, body?: string) => AnalysisDoc;
  updateDoc: (id: string, patch: Partial<Omit<AnalysisDoc, 'id' | 'created'>>) => void;
  removeDoc: (id: string) => void;
  /** Adds a file's notes and documents; one with an id already here replaces it. */
  merge: (book: NotesBook) => number;
  applyRemote: (batch: NoteBatch) => void;
  setAuthor: (name: string) => void;
  set: (p: Partial<Pick<NotesState, 'editing' | 'draft' | 'choices' | 'docOpen' | 'hover' | 'pins'>>) => void;
}

const listeners = new Set<(b: NoteBatch) => void>();

/** Hears every local edit's batch (a shared session sends them on); returns the removal. */
export function onLocalBatch(fn: (b: NoteBatch) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const appendLog = (log: NoteBatch[], b: NoteBatch) => [...(log.length >= LOG_KEEP ? log.slice(-LOG_KEEP + 1) : log), b];

export const useNotes = create<NotesState>((set, get) => ({
  book: EMPTY_BOOK,
  log: [],
  rev: 0,
  author: loadAuthor(),
  editing: null,
  draft: null,
  choices: null,
  docOpen: null,
  hover: null,
  pins: true,
  loaded: false,
  storageFull: false,

  commit: (next) => {
    const s = get();
    if (next === s.book) return;
    const ops = diffBooks(s.book, next);
    if (!ops.length) return;
    const batch: NoteBatch = { id: newId('o'), author: s.author || 'local', at: Date.now(), ops };
    set({ book: next, log: appendLog(s.log, batch), rev: s.rev + 1 });
    for (const fn of listeners) fn(batch);
    scheduleSave();
  },
  addNote: (n) => {
    const now = Date.now();
    const note: DataNote = { ...n, id: n.id ?? newId('n'), author: get().author, created: now, updated: now };
    get().commit({ ...get().book, notes: [...get().book.notes, note] });
    return note;
  },
  updateNote: (id, patch) => {
    const b = get().book;
    get().commit({ ...b, notes: b.notes.map((n) => (n.id === id ? { ...n, ...patch, id, updated: Date.now() } : n)) });
  },
  removeNote: (id) => {
    const b = get().book;
    get().commit({ ...b, notes: b.notes.filter((n) => n.id !== id) });
    if (get().editing === id) set({ editing: null });
  },
  addDoc: (title, body = '') => {
    const now = Date.now();
    const doc: AnalysisDoc = { id: newId('a'), title, body, blocks: {}, author: get().author, created: now, updated: now };
    get().commit({ ...get().book, docs: [...get().book.docs, doc] });
    return doc;
  },
  updateDoc: (id, patch) => {
    const b = get().book;
    get().commit({ ...b, docs: b.docs.map((d) => (d.id === id ? { ...d, ...patch, id, updated: Date.now() } : d)) });
  },
  removeDoc: (id) => {
    const b = get().book;
    get().commit({ ...b, docs: b.docs.filter((d) => d.id !== id) });
    if (get().docOpen === id) set({ docOpen: null });
  },
  merge: (more) => {
    const b = get().book;
    const notes = new Map(b.notes.map((n) => [n.id, n]));
    for (const n of more.notes) notes.set(n.id, n);
    const docs = new Map(b.docs.map((d) => [d.id, d]));
    for (const d of more.docs) docs.set(d.id, d);
    get().commit({ notes: [...notes.values()], docs: [...docs.values()] });
    return more.notes.length + more.docs.length;
  },
  applyRemote: (batch) => {
    const s = get();
    if (!isNoteBatch(batch) || s.log.some((b) => b.id === batch.id)) return;
    set({ book: applyBookOps(s.book, batch.ops), log: appendLog(s.log, batch), rev: s.rev + 1 });
    scheduleSave();
  },
  setAuthor: (author) => {
    saveAuthor(author);
    set({ author });
  },
  set: (p) => set(p),
}));

// ---------------------------------------------------------------- the session file

/** Everything a session file keeps of the notes and documents. */
export function notesState(): NotesSessionState {
  const s = useNotes.getState();
  return { schema: NOTES_SCHEMA, book: s.book, log: s.log };
}

/** Puts a saved session's notes back, in place of what is here. */
export function loadNotesState(v: unknown): void {
  const o = (v && typeof v === 'object' ? v : {}) as Partial<NotesSessionState>;
  const book = readBook(o.book ?? o);
  const log = Array.isArray(o.log) ? o.log.filter(isNoteBatch).slice(-LOG_KEEP) : [];
  useNotes.setState((s) => ({ book, log, rev: s.rev + 1, editing: null, draft: null, docOpen: book.docs.some((d) => d.id === s.docOpen) ? s.docOpen : null }));
  scheduleSave();
}

/** The notes and documents as a JSON file's text. */
export function notesToJson(book: NotesBook = useNotes.getState().book): string {
  return JSON.stringify({ schema: NOTES_SCHEMA, ...book }, null, 1);
}

// ---------------------------------------------------------------- kept in the browser

const DB = 'heat3d.notes';
const STORE = 'kv';
const KEY = 'book';
const LS_KEY = 'heat3d.notes.book';

function idb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null);
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

let dbp: Promise<IDBDatabase | null> | null = null;
const db = () => (dbp ??= idb());

async function readKept(): Promise<unknown> {
  const d = await db();
  if (d) {
    const v = await new Promise<unknown>((resolve) => {
      try {
        const req = d.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
    if (v) return v;
  }
  try {
    const text = localStorage.getItem(LS_KEY);
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

async function writeKept(state: NotesSessionState): Promise<boolean> {
  const d = await db();
  if (d) {
    const ok = await new Promise<boolean>((resolve) => {
      try {
        const tx = d.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(state, KEY);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
        tx.onabort = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
    if (ok) return true;
  }
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

let timer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave(): void {
  if (typeof window === 'undefined' || !useNotes.getState().loaded) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    // The log as far as it is worth keeping between visits: the last few hundred edits.
    const s = notesState();
    void writeKept({ ...s, log: s.log.slice(-200) }).then((ok) => useNotes.setState({ storageFull: !ok }));
  }, 700);
}

/** Reads the kept copy in, once; edits made before it arrived are put on top of it. */
export async function startNotes(): Promise<void> {
  if (useNotes.getState().loaded) return;
  const kept = await readKept();
  const s = useNotes.getState();
  const o = (kept && typeof kept === 'object' ? kept : {}) as Partial<NotesSessionState>;
  let book = readBook(o.book ?? {});
  for (const b of s.log) book = applyBookOps(book, b.ops);
  const log = [...(Array.isArray(o.log) ? o.log.filter(isNoteBatch) : []), ...s.log].slice(-LOG_KEEP);
  useNotes.setState({ book, log, rev: s.rev + 1, loaded: true });
  if (s.log.length) scheduleSave();
}
