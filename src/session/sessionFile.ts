/**
 * The session file (`.3dheat-session`): a whole session to keep and open
 * again - with others or alone. It holds every shared layer (the tactics
 * board, the marks and world notes, notes and whatever else registered with
 * `shared.ts`) as their state, the saved views and the view on screen, the
 * session's settings (waiting room, follow, the invites by name and role),
 * and the data and level it was made on by reference: name, size and
 * fingerprint, never the data itself, unless the user packs it in.
 *
 * Never in it: the session password, tokens, the ban list.
 *
 * Plain JSON (`schema: heat3d.session/1`); packed, the JSON is followed by
 * the data files: `3DHSESS\0`, the JSON's length (u32, little-endian), the
 * JSON, then each file's bytes in the order `packed` lists them.
 */

import type { Engine } from '../render/engine';
import { applyView, captureView, readViews, useSavedViews, type SavedView, type ViewState } from '../state/savedViews';
import { useStore } from '../state/store';
import { loadNotesState, notesState, type NotesSessionState } from '../notes/store';
import { compareData, fingerprint, loadedData, type DataRef } from './dataRefs';
import { loadLocalStates, localStates, readDocState, type DocState } from './shared';
import { session, httpUrl } from './client';
import { useSessionStore, type FollowModeName, type SessionRole } from './store';

export const SESSION_SCHEMA = 'heat3d.session/1';
export const SESSION_EXT = '.3dheat-session';
const MAGIC = new TextEncoder().encode('3DHSESS\0');

export interface SessionFile {
  schema: typeof SESSION_SCHEMA;
  savedAt: number;
  name: string;
  /** Every shared layer by its document name. */
  docs: Record<string, DocState>;
  views: SavedView[];
  /** The view on screen when it was saved. */
  current: ViewState | null;
  data: DataRef[];
  level: { name: string } | null;
  settings: {
    waitingRoom: boolean;
    follow: { mode: FollowModeName; leader: string };
    /** Invites to make again, by who they were for and the role (no tokens). */
    invites: { label: string; role: SessionRole }[];
    /** Members' roles by name, for the host to give again. */
    roles: { name: string; role: SessionRole }[];
  };
  /** Data packed in after the JSON. */
  packed?: (DataRef & { offset: number })[];
  /** The notes and analyses with their own edit history (`notes/store.ts`); their state is also in `docs.notes`. */
  notes?: NotesSessionState;
}

/** Steps from older files to the current one: `from version n` to n + 1. */
const MIGRATIONS: Record<number, (f: Record<string, unknown>) => Record<string, unknown>> = {
  // heat3d.session/1 is the first; a /2 adds its step here as `1: (f) => ({ ...f, schema: 'heat3d.session/2', ... })`.
};

/** The schema's version, or null for something else. */
function versionOf(schema: unknown): number | null {
  const m = typeof schema === 'string' ? /^heat3d\.session\/(\d+)$/.exec(schema) : null;
  return m ? Number(m[1]) : null;
}

/** A session file from its JSON: migrated to this version, checked; throws what is wrong. */
export function readSessionJson(json: unknown): SessionFile {
  if (!json || typeof json !== 'object') throw new Error('notSession');
  let f = json as Record<string, unknown>;
  let v = versionOf(f.schema);
  if (v === null) throw new Error('notSession');
  const current = versionOf(SESSION_SCHEMA)!;
  if (v > current) throw new Error('newer');
  while (v < current) {
    const step = MIGRATIONS[v];
    if (!step) throw new Error('notSession');
    f = step(f);
    v++;
  }
  const docs: Record<string, DocState> = {};
  if (f.docs && typeof f.docs === 'object') {
    for (const [k, d] of Object.entries(f.docs as Record<string, unknown>)) {
      if (!/^[A-Za-z0-9_.:-]{1,32}$/.test(k)) continue;
      const ds = readDocState(d);
      if (ds) docs[k] = ds;
    }
  }
  const refs = (x: unknown): DataRef[] =>
    Array.isArray(x)
      ? x.filter((r): r is DataRef => !!r && typeof r === 'object' && typeof (r as DataRef).name === 'string' && typeof (r as DataRef).size === 'number' && typeof (r as DataRef).fingerprint === 'string')
      : [];
  const s = (f.settings ?? {}) as Partial<SessionFile['settings']>;
  const roles = new Set(['viewer', 'draw', 'elevated', 'admin']);
  const cur = f.current as ViewState | null | undefined;
  return {
    schema: SESSION_SCHEMA,
    savedAt: typeof f.savedAt === 'number' ? f.savedAt : 0,
    name: typeof f.name === 'string' ? f.name.slice(0, 120) : '',
    docs,
    views: readViews(f.views ?? []),
    current: cur && typeof cur === 'object' && cur.camera && cur.timeline ? cur : null,
    data: refs(f.data),
    level: f.level && typeof (f.level as { name?: unknown }).name === 'string' ? { name: (f.level as { name: string }).name } : null,
    settings: {
      waitingRoom: s.waitingRoom !== false,
      follow: {
        mode: s.follow && ['off', 'follow', 'enforce'].includes(s.follow.mode) ? s.follow.mode : 'off',
        leader: typeof s.follow?.leader === 'string' ? s.follow.leader : '',
      },
      invites: Array.isArray(s.invites) ? s.invites.filter((i) => i && typeof i.label === 'string' && roles.has(i.role)).slice(0, 100) : [],
      roles: Array.isArray(s.roles) ? s.roles.filter((r) => r && typeof r.name === 'string' && roles.has(r.role)).slice(0, 200) : [],
    },
    ...(f.notes && typeof f.notes === 'object' ? { notes: f.notes as NotesSessionState } : {}),
    ...(Array.isArray(f.packed) ? { packed: (refs(f.packed) as (DataRef & { offset: number })[]).filter((p) => Number.isFinite(p.offset)) } : {}),
  };
}

/** The view on screen, or none when there is nothing to describe (no data loaded). */
function viewNow(engine: Engine): ViewState | null {
  try {
    return captureView(engine);
  } catch {
    return null;
  }
}

/** The session as it is now, as a file. */
export function captureSession(engine: Engine | null, name = ''): SessionFile {
  const st = useSessionStore.getState();
  const inSession = st.state === 'joined' && !!session.sync;
  const leader = st.members.find((m) => m.id === st.follow.leader)?.name ?? '';
  return {
    schema: SESSION_SCHEMA,
    savedAt: Date.now(),
    name: name || st.info?.name || '',
    docs: inSession ? session.sync!.states() : localStates(),
    views: useSavedViews.getState().views,
    current: engine ? viewNow(engine) : null,
    data: loadedData().refs,
    level: useStore.getState().level ? { name: useStore.getState().level!.name } : null,
    settings: {
      waitingRoom: st.info?.waitingRoom ?? true,
      follow: { mode: st.follow.mode, leader },
      invites: st.invites.filter((i) => i.role !== 'host').map((i) => ({ label: i.label, role: i.role })),
      roles: st.members.filter((m) => m.role !== 'host' && m.role !== 'viewer').map((m) => ({ name: m.name, role: m.role })),
    },
    notes: notesState(),
  };
}

/** The file to download: JSON, or packed with the loaded data's files after it. */
export async function sessionBlob(file: SessionFile, pack: boolean): Promise<Blob> {
  if (!pack) return new Blob([JSON.stringify(file, null, 1)], { type: 'application/json' });
  const { files } = loadedData();
  let offset = 0;
  const packed: (DataRef & { offset: number })[] = [];
  for (const f of files) {
    packed.push({ name: f.name, size: f.size, fingerprint: await fingerprint(f), offset });
    offset += f.size;
  }
  const json = new TextEncoder().encode(JSON.stringify({ ...file, packed }));
  const len = new Uint8Array(4);
  new DataView(len.buffer).setUint32(0, json.length, true);
  // The data files are referenced, not copied: a packed file of gigabytes costs no memory here.
  return new Blob([MAGIC, len, json, ...files], { type: 'application/octet-stream' });
}

/** A session file from what was opened: its JSON, and for a packed one the data files in it. */
export async function readSessionBlob(blob: Blob): Promise<{ file: SessionFile; packed: File[] }> {
  const head = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
  const isPacked = MAGIC.every((b, i) => head[i] === b);
  if (!isPacked) {
    const text = await blob.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error('notSession');
    }
    return { file: readSessionJson(json), packed: [] };
  }
  const len = new DataView(head.buffer).getUint32(8, true);
  if (len > 256 * 1024 * 1024 || 12 + len > blob.size) throw new Error('notSession');
  const json = JSON.parse(await blob.slice(12, 12 + len).text());
  const file = readSessionJson(json);
  const start = 12 + len;
  const packed = (file.packed ?? [])
    .filter((p) => p.offset >= 0 && start + p.offset + p.size <= blob.size)
    .map((p) => new File([blob.slice(start + p.offset, start + p.offset + p.size)], p.name));
  return { file, packed };
}

export interface LoadReport {
  /** Data the file was made on that is not loaded here. */
  missing: DataRef[];
  level: string | null;
  /** Documents no module here knows (kept in a session, left out alone). */
  unknown: string[];
  views: number;
  /** What the view on screen named and this data lacks. */
  viewMissing: string[];
  /** The view on screen, kept to be put back once the data it was made on is loaded (`sessionOpen.ts`). */
  pendingView: ViewState | null;
  /** The data the file was made on. */
  data: DataRef[];
  /** The packed data files, to load. */
  packed: File[];
  invites: SessionFile['settings']['invites'];
  roles: SessionFile['settings']['roles'];
}

/**
 * Opens a session file: alone, its layers replace this viewer's; as a
 * session's host, they replace the session's and everyone gets them. A
 * member who is not the host cannot (the host's session is the host's).
 */
export async function openSession(engine: Engine | null, file: SessionFile, packed: File[]): Promise<LoadReport> {
  const st = useSessionStore.getState();
  let unknown: string[] = [];
  if (st.state === 'joined') {
    if (st.role !== 'host') throw new Error('notHost');
    const res = await fetch(`${httpUrl(session.serverUrl())}/api/load`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.hostToken()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ docs: file.docs }),
    });
    if (!res.ok) throw new Error('loadFailed');
    session.settings({ waitingRoom: file.settings.waitingRoom });
    if (file.settings.follow.mode !== 'off') {
      const leader = st.members.find((m) => m.name === file.settings.follow.leader);
      session.setFollow(file.settings.follow.mode, leader?.id ?? 0);
    }
  } else {
    unknown = loadLocalStates(file.docs);
    // The notes with their history, where the file has it.
    if (file.notes) loadNotesState(file.notes);
  }
  const views = useSavedViews.getState().merge(file.views);
  const { missing } = compareData(file.data);
  const level = file.level && useStore.getState().level?.name !== file.level.name ? file.level.name : null;
  // The view names the data's columns, teams and units, and the camera stands on its level: put back now only where
  // both are here, else once they are (`sessionOpen.ts`), so its filters are not dropped for want of the data.
  const now = !!engine && !!file.current && !missing.length && !level && (!file.data.length || !!useStore.getState().dataset);
  const viewMissing = now ? applyView(engine!, file.current!) : [];
  return {
    missing,
    level,
    unknown,
    views,
    viewMissing,
    pendingView: now ? null : file.current,
    data: file.data,
    packed,
    invites: file.settings.invites,
    roles: file.settings.roles,
  };
}

/** Saves to a download. */
export async function downloadSession(engine: Engine | null, pack: boolean, name = ''): Promise<void> {
  const file = captureSession(engine, name);
  const blob = await sessionBlob(file, pack);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const base = (file.name || '3dheat').replace(/[^A-Za-z0-9 _.-]+/g, '_').trim() || '3dheat';
  a.href = url;
  a.download = `${base}${SESSION_EXT}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

const AUTOSAVE_KEY = 'heat3d.session.autosave';

/** The host's copy in this browser, every couple of minutes (too big for the browser: skipped). */
export function autosave(engine: Engine | null): boolean {
  try {
    const text = JSON.stringify(captureSession(engine));
    if (text.length > 4_000_000) return false;
    localStorage.setItem(AUTOSAVE_KEY, text);
    return true;
  } catch {
    return false;
  }
}

export function readAutosave(): SessionFile | null {
  try {
    const t = localStorage.getItem(AUTOSAVE_KEY);
    return t ? readSessionJson(JSON.parse(t)) : null;
  } catch {
    return null;
  }
}
