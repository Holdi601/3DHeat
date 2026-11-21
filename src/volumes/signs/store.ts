/**
 * The chart signs, as an operation-log collection (`state/sharedDocs.ts`):
 * every local edit is a batch of add / set / del operations by id, a peer's
 * batch is applied with `applyRemote`, and the document registers itself as
 * "signs" so the session file keeps it and a shared session syncs it.
 *
 * Saved per dataset in this browser beside the volumes (`volumes/store.ts`),
 * and with a saved view. Which sign's editor is open is this viewer's own and
 * never shared.
 */

import { create } from 'zustand';
import { useStore } from '../../state/store';
import { applyCollectionOps, diffCollection, isDocBatch, newBatchId, registerSharedDoc, type DocBatch } from '../../state/sharedDocs';
import { datasetKey, useVolumeStore } from '../store';
import { makeSign, parseSign, type Sign } from './sign';
import type { ChartSpec } from '../../charts/types';

export const SIGNS_DOC = 'signs';
const COLL = 'signs';
const LOG_KEEP = 2000;
const STORAGE_PREFIX = '3dheat.signs.';

export interface SignState {
  datasetKey: string | null;
  signs: Sign[];
  /** This session's batches, oldest first (at most `LOG_KEEP`). */
  log: DocBatch[];
  rev: number;
  author: string;
  /** The editor panel: open on a volume, adding (sign null) or editing a sign. */
  editor: { volumeId: string; signId: string | null } | null;
  /** Every sign out of sight (this viewer's own choice, not shared). */
  hidden: boolean;
  setHidden: (v: boolean) => void;
  add: (volumeId: string, spec: Partial<ChartSpec>, extra?: Partial<Sign>) => Sign;
  update: (id: string, patch: Partial<Omit<Sign, 'id'>>) => void;
  /** A drag's frames: the sign moves without a batch; `settle` logs the whole drag as one. */
  preview: (id: string, patch: Partial<Omit<Sign, 'id'>>) => void;
  settle: () => void;
  remove: (id: string) => void;
  /** Replace every sign (a saved view, a session file): logged as the batch that does it. */
  replaceAll: (signs: Sign[]) => void;
  applyRemote: (batch: DocBatch) => void;
  openEditor: (volumeId: string, signId?: string | null) => void;
  closeEditor: () => void;
  loadFor: (key: string | null) => void;
}

const listeners = new Set<(b: DocBatch) => void>();

function readSaved(key: string): Sign[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return [];
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.map(parseSign).filter((s): s is Sign => !!s) : [];
  } catch {
    return [];
  }
}

function save(key: string | null, signs: Sign[]): void {
  if (!key) return;
  try {
    if (signs.length === 0) localStorage.removeItem(STORAGE_PREFIX + key);
    else localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(signs));
  } catch {
    // Private windows and full storage: the signs last this session.
  }
}

export const useSignStore = create<SignState>((set, get) => {
  /** Apply a new list as the viewer's own edit: logged, and sent to whoever listens. */
  let dragBase: Sign[] | null = null;
  const commit = (signs: Sign[], extra: Partial<SignState> = {}) => {
    const s = get();
    const from = dragBase ?? s.signs;
    dragBase = null;
    const ops = diffCollection(COLL, from as unknown as Record<string, unknown>[], signs as unknown as Record<string, unknown>[]);
    if (!ops.length) {
      set(extra);
      return;
    }
    const batch: DocBatch = { doc: SIGNS_DOC, id: newBatchId(), author: s.author || 'local', at: Date.now(), ops };
    set({ signs, log: [...(s.log.length >= LOG_KEEP ? s.log.slice(-LOG_KEEP + 1) : s.log), batch], rev: s.rev + 1, ...extra });
    for (const l of listeners) l(batch);
  };
  return {
    datasetKey: null,
    signs: [],
    log: [],
    rev: 0,
    author: '',
    editor: null,
    hidden: false,
    setHidden: (hidden) => set({ hidden }),
    add: (volumeId, spec, extra) => {
      const s = get();
      const sign = makeSign(volumeId, spec, s.signs.filter((x) => x.volumeId === volumeId).length, extra);
      commit([...s.signs, sign], { editor: { volumeId, signId: sign.id } });
      return sign;
    },
    update: (id, patch) => {
      const s = get();
      if (!s.signs.some((x) => x.id === id)) return;
      commit(s.signs.map((x) => (x.id === id ? { ...x, ...patch, id } : x)));
    },
    preview: (id, patch) => {
      const s = get();
      if (!dragBase) dragBase = s.signs;
      set({ signs: s.signs.map((x) => (x.id === id ? { ...x, ...patch, id } : x)) });
    },
    settle: () => {
      if (dragBase) commit(get().signs);
    },
    remove: (id) => {
      const s = get();
      commit(
        s.signs.filter((x) => x.id !== id),
        s.editor?.signId === id ? { editor: { volumeId: s.editor.volumeId, signId: null } } : {},
      );
    },
    replaceAll: (signs) => commit(signs.map((x) => structuredClone(x))),
    applyRemote: (batch) => {
      const s = get();
      if (!isDocBatch(batch, SIGNS_DOC) || s.log.some((b) => b.id === batch.id)) return;
      const signs = applyCollectionOps(s.signs, COLL, batch.ops)
        .map(parseSign)
        .filter((x): x is Sign => !!x);
      set({ signs, log: [...(s.log.length >= LOG_KEEP ? s.log.slice(-LOG_KEEP + 1) : s.log), batch], rev: s.rev + 1 });
    },
    openEditor: (volumeId, signId = null) => set({ editor: { volumeId, signId } }),
    closeEditor: () => set({ editor: null }),
    loadFor: (key) => {
      if (key === get().datasetKey) return;
      set({ datasetKey: key, signs: key ? readSaved(key) : [], editor: null });
    },
  };
});

let saveTimer: ReturnType<typeof setTimeout> | null = null;
useSignStore.subscribe((s, prev) => {
  if (s.signs === prev.signs || s.datasetKey !== prev.datasetKey) return;
  if (saveTimer) clearTimeout(saveTimer);
  const { datasetKey: key, signs } = s;
  saveTimer = setTimeout(() => save(key, signs), 300);
});

// Each dataset brings its own signs, as it brings its own volumes.
useStore.subscribe((s, prev) => {
  if (s.dataset === prev.dataset) return;
  useSignStore.getState().loadFor(s.dataset ? datasetKey(s.dataset) : null);
});
{
  const d = useStore.getState().dataset;
  if (d) useSignStore.getState().loadFor(datasetKey(d));
}

// A deleted volume's editor closes (its signs stay, so undoing the delete brings them back).
useVolumeStore.subscribe((v, prev) => {
  if (v.volumes === prev.volumes) return;
  const ed = useSignStore.getState().editor;
  if (ed && !v.volumes.some((x) => x.id === ed.volumeId)) useSignStore.getState().closeEditor();
});

registerSharedDoc({
  key: SIGNS_DOC,
  colls: [COLL],
  get: () => ({ signs: useSignStore.getState().signs }),
  set: (state) => {
    const list = (state as { signs?: unknown }).signs;
    const signs = Array.isArray(list) ? list.map(parseSign).filter((x): x is Sign => !!x) : [];
    const ed = useSignStore.getState().editor;
    useSignStore.setState({ signs, editor: ed && signs.some((x) => x.volumeId === ed.volumeId) ? ed : null });
  },
  empty: () => ({ signs: [] }),
  hasContent: (state) => Array.isArray((state as { signs?: unknown }).signs) && (state as { signs: unknown[] }).signs.length > 0,
});

/** Each batch of this viewer's own edits, as it is made (for a peer link that sends batches). */
export function onLocalSignBatch(cb: (b: DocBatch) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** The signs of the volumes that exist and are shown. */
export function liveSigns(signs: readonly Sign[], volumes: readonly { id: string; visible: boolean }[]): Sign[] {
  const shown = new Set(volumes.filter((v) => v.visible).map((v) => v.id));
  return signs.filter((s) => shown.has(s.volumeId));
}
