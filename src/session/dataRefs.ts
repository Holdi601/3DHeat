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

/** The data panel loaded these files: their references, worked out in the background. */
export function noteDataFiles(files: File[]): void {
  const mine = { files, refs: [] as DataRef[] };
  loaded = mine;
  void Promise.all(files.map(async (f) => ({ name: f.name, size: f.size, fingerprint: await fingerprint(f).catch(() => '') }))).then((refs) => {
    if (loaded === mine) mine.refs = refs;
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

/** Files for the data panel to take as picked (the host's data, a packed session file's). */
export const useDataHandoff = create<{ files: File[] | null; nonce: number }>(() => ({ files: null, nonce: 0 }));

export function handData(files: File[]): void {
  useDataHandoff.setState((s) => ({ files, nonce: s.nonce + 1 }));
}
