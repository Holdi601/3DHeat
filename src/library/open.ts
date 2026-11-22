/**
 * "Open in 3DHeat": library items into the viewer. One match, a selection or
 * a collection: every file goes to the Source panel as one load (the viewer's
 * mass load of many matches), or to the mass analysis, or is opened and the
 * session panel shown to share it. A replay opens as its newest converted
 * match. In the Library's own window the items open in a viewer window.
 *
 * What was opened is remembered for this tab (ids only), so a session saved
 * afterwards is linked to its library items.
 */

import { t } from '../i18n';
import { openMass, useMass } from '../mass/client';
import { useSessionStore } from '../session/store';
import { toast } from '../ui/shell/kit';
import { takeFiles } from '../ui/panels/OpenData';
import { fetchFiles, lib } from './api';
import { size } from './games';
import { useLibrary } from './store';

export type OpenHow = 'view' | 'mass' | 'session';

const OPENED_KEY = 'heat3d.library.opened';

/** The library items open in this tab's viewer. */
export function openedItems(): number[] {
  try {
    const v = JSON.parse(sessionStorage.getItem(OPENED_KEY) ?? '[]') as unknown;
    return Array.isArray(v) ? v.filter((x): x is number => typeof x === 'number') : [];
  } catch {
    return [];
  }
}

function remember(ids: number[]): void {
  try {
    sessionStorage.setItem(OPENED_KEY, JSON.stringify(ids.slice(0, 5000)));
  } catch {
    // Too many: not linked.
  }
}

/** A saved session (or analysis) linked to the library items it was made from. */
export function linkOpened(kind: 'session' | 'analysis', label: string): void {
  const ids = openedItems();
  if (ids.length) void lib.link(ids, kind, label).catch(() => {});
}

// A session saved from this tab (session/sessionFile.ts says so): linked by its file name only.
if (typeof window !== 'undefined') window.addEventListener('heat3d:session-saved', (e) => linkOpened('session', String((e as CustomEvent).detail ?? '')));

interface Tauri {
  invoke(cmd: string, args?: Record<string, unknown>): Promise<unknown>;
}

function tauri(): Tauri | null {
  return (globalThis as unknown as { __TAURI_INTERNALS__?: Tauri }).__TAURI_INTERNALS__ ?? null;
}

/** Opens items in the viewer. */
export async function openItems(ids: number[], how: OpenHow = 'view'): Promise<void> {
  if (!ids.length) return;
  const st = useLibrary.getState();
  if (st.standalone) {
    // The Library's own window: a viewer window of its own takes them.
    const query = `?libraryOpen=${ids.join(',')}${how === 'view' ? '' : `&how=${how}`}`;
    const tw = tauri();
    if (tw) await tw.invoke('open_viewer', { query }).catch(() => window.open(`/${query}`, '_blank'));
    else window.open(`/${query}`, '_blank');
    return;
  }
  await openHere(ids, how);
}

/** Opens items in this page's viewer. */
export async function openHere(ids: number[], how: OpenHow): Promise<void> {
  const set = useLibrary.getState().set;
  let r;
  try {
    r = await lib.open(ids);
  } catch (e) {
    toast((e as Error).message, 'bad', 4000);
    return;
  }
  const notConverted = r.skipped.filter((s) => s.kind === 'replay');
  if (notConverted.length) toast(t('library.open.notConverted', { count: notConverted.length }), 'info', 5000);
  const missing = r.skipped.filter((s) => s.missing);
  if (missing.length) toast(t('library.open.missing', { count: missing.length }), 'bad', 5000);
  if (!r.files.length) return;
  const total = r.files.reduce((a, f) => a + f.size, 0);
  set({ busy: t('library.open.fetching', { done: 0, count: r.files.length, size: size(total) }) });
  let files: File[];
  try {
    files = await fetchFiles(r.files, (done, count) => set({ busy: t('library.open.fetching', { done, count, size: size(total) }) }));
  } catch (e) {
    set({ busy: null });
    toast((e as Error).message, 'bad', 5000);
    return;
  } finally {
    set({ busy: null });
  }
  remember(r.files.map((f) => f.id));
  useLibrary.getState().setOpen(false);
  if (how === 'mass') {
    const ok = await openMass(files.map((file) => ({ file, path: file.name })));
    if (ok) useMass.getState().set({ open: true });
    return;
  }
  takeFiles(files.map((file) => ({ file, relativePath: file.name })));
  if (how === 'session') useSessionStore.getState().setPanel(true);
}

/** A viewer window opened by the Library's window: the items in its address, once the page is up. */
export function openFromAddress(): void {
  const q = new URLSearchParams(location.search);
  const ids = (q.get('libraryOpen') ?? '')
    .split(',')
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
  if (!ids.length) return;
  const how = (q.get('how') as OpenHow | null) ?? 'view';
  // The address stays clean: a reload does not load them again.
  history.replaceState(null, '', location.pathname);
  window.setTimeout(() => void openHere(ids, how === 'mass' || how === 'session' ? how : 'view'), 300);
}
