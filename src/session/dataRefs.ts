/**
 * The data a session (or a session file) refers to, by content rather than
 * by path: each file's name, size and a fingerprint (SHA-256 of its size and
 * its first and last MiB - quick on a file of any size, and different for
 * any two real recordings). The file itself stays where it is unless the
 * user packs it into the session file or the host publishes it.
 *
 * Files handed over here (from the host, from a packed session file) go to
 * the data panel as if picked there.
 */

import { create } from 'zustand';
import { isContainer, openContainer } from '../data/container';
import type { PickedFile } from '../data/filePick';

export interface DataRef {
  name: string;
  size: number;
  /** Hex SHA-256 of the size and the first and last MiB. */
  fingerprint: string;
}

const MIB = 1 << 20;

/** A file's fingerprint (see above). */
export async function fingerprint(file: Blob): Promise<string> {
  const size = new Uint8Array(8);
  new DataView(size.buffer).setBigUint64(0, BigInt(file.size), true);
  const head = new Uint8Array(await file.slice(0, Math.min(MIB, file.size)).arrayBuffer());
  const tail = file.size > 2 * MIB ? new Uint8Array(await file.slice(file.size - MIB).arrayBuffer()) : new Uint8Array(await file.slice(Math.min(MIB, file.size)).arrayBuffer());
  const all = new Uint8Array(8 + head.length + tail.length);
  all.set(size, 0);
  all.set(head, 8);
  all.set(tail, 8 + head.length);
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', all));
  return [...d].map((b) => b.toString(16).padStart(2, '0')).join('');
}

interface Loaded {
  files: File[];
  refs: DataRef[];
}

let loaded: Loaded = { files: [], refs: [] };

/**
 * Counts each change of the loaded data whose references are known, so what
 * depends on them (an opened session file's report) can follow.
 */
export const useLoadedRefs = create<{ version: number }>(() => ({ version: 0 }));

/** The data panel loaded these files: their references, worked out in the background. */
export function noteDataFiles(files: File[]): void {
  const mine = { files, refs: [] as DataRef[] };
  loaded = mine;
  void Promise.all(files.map(async (f) => ({ name: f.name, size: f.size, fingerprint: await fingerprint(f).catch(() => '') }))).then((refs) => {
    if (loaded !== mine) return;
    mine.refs = refs;
    useLoadedRefs.setState((s) => ({ version: s.version + 1 }));
  });
}

/** The loaded data's files and references (references may still be on their way: empty then). */
export function loadedData(): Loaded {
  return loaded;
}

/** Which of `want` the loaded data has, and which it lacks. */
export function compareData(want: DataRef[]): { have: DataRef[]; missing: DataRef[] } {
  const by = new Set(loaded.refs.map((r) => r.fingerprint));
  const have: DataRef[] = [];
  const missing: DataRef[] = [];
  for (const w of want) (by.has(w.fingerprint) ? have : missing).push(w);
  return { have, missing };
}

/**
 * Files for the data panel to take as picked (the host's data, a packed
 * session file's, the start screen's picker or a drop on the view). `picked`
 * keeps the paths under a picked or dropped folder, which say what the files are.
 */
export const useDataHandoff = create<{ files: File[] | null; picked: PickedFile[] | null; nonce: number; load: boolean }>(() => ({
  files: null,
  picked: null,
  nonce: 0,
  load: false,
}));

/** `load`: the panel loads them by itself once it has read them (a session file's data), instead of waiting for Load. */
export function handData(files: File[], load = false): void {
  useDataHandoff.setState((s) => ({ files, picked: null, nonce: s.nonce + 1, load }));
}

/** Files picked or dropped outside the data panel, with their paths, for it to take. */
export function handPicked(picked: PickedFile[], load = false): void {
  useDataHandoff.setState((s) => ({ files: picked.map((p) => p.file), picked, nonce: s.nonce + 1, load }));
}

/**
 * Of a pick (a folder, some files), those that hold data `want` names: a file
 * of the same name, size and fingerprint, or a `.3dheat` container with such a
 * table in it (the container itself is kept, its match documents with it).
 * Only same-named, same-sized files are read for their fingerprint, so a big
 * folder costs a listing. `found` are the references met, `still` the rest.
 */
export async function matchDataFiles(want: DataRef[], picked: PickedFile[]): Promise<{ keep: PickedFile[]; found: DataRef[]; still: DataRef[] }> {
  const byName = new Map<string, DataRef[]>();
  for (const w of want) {
    const k = `${w.name}|${w.size}`;
    const l = byName.get(k);
    if (l) l.push(w);
    else byName.set(k, [w]);
  }
  const met = new Set<string>();
  const keep: PickedFile[] = [];
  const hit = async (f: File): Promise<boolean> => {
    const cands = byName.get(`${f.name}|${f.size}`);
    if (!cands) return false;
    const fp = await fingerprint(f).catch(() => '');
    const c = cands.find((w) => w.fingerprint === fp);
    if (!c) return false;
    met.add(c.fingerprint);
    return true;
  };
  for (const p of picked) {
    if (isContainer(p.file.name)) {
      try {
        const c = await openContainer(p.file);
        let any = false;
        for (const t of c.tables) if (await hit(t)) any = true;
        if (any) keep.push(p);
      } catch {
        // Not a container after all: left out.
      }
    } else if (await hit(p.file)) keep.push(p);
  }
  return { keep, found: want.filter((w) => met.has(w.fingerprint)), still: want.filter((w) => !met.has(w.fingerprint)) };
}

/**
 * A level for the level panel to load as if picked there (one the host shared
 * in the session), with its layouts file when it has one. Kept until a level
 * panel takes it, so it waits while none is on screen.
 */
export const useLevelHandoff = create<{ file: File | null; layouts: File | null; nonce: number }>(() => ({
  file: null,
  layouts: null,
  nonce: 0,
}));

export function handLevel(file: File, layouts: File | null = null): void {
  useLevelHandoff.setState((s) => ({ file, layouts, nonce: s.nonce + 1 }));
}
