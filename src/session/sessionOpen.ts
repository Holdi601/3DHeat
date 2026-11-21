/**
 * An opened session file, followed until everything it names is back: the
 * report of what is missing (kept up to date as data is loaded, so it clears
 * by itself), the level loaded by name, the missing data found in a folder,
 * and the view on screen put back once its data and level are there.
 *
 * Kept outside any panel, so the report survives the panel closing and shows
 * wherever it is rendered (the session panel, the data panel).
 */

import { create } from 'zustand';
import type { Engine } from '../render/engine';
import { applyView, type ViewState } from '../state/savedViews';
import { useStore } from '../state/store';
import type { PickedFile } from '../data/filePick';
import { openPicker } from '../data/filePick';
import { compareData, handPicked, loadedData, matchDataFiles, useLoadedRefs, type DataRef } from './dataRefs';
import { filesOfKeptFolder, keptFolderName, pickDataFolder } from './dataFolder';
import { clearLevelRequest, requestLevel, useLevelRequest } from './levelRequest';
import { openSession, type LoadReport, type SessionFile } from './sessionFile';

export interface FindResult {
  /** Data files found and handed to the data panel. */
  found: number;
  /** Still not found. */
  still: number;
  /** Files looked at. */
  looked: number;
}

interface OpenState {
  report: LoadReport | null;
  /** The file's data not loaded here, now. */
  missing: DataRef[];
  /** The view on screen, waiting for its data and level. */
  pendingView: ViewState | null;
  /** What the view named and this data lacks, once it was put back. */
  viewMissing: string[];
  /** A search for the missing data: running, or what came of the last. */
  finding: 'busy' | FindResult | null;
  /** The folder kept from last time, offered again (File System Access only). */
  keptFolder: string | null;
}

export const useSessionOpen = create<OpenState>(() => ({
  report: null,
  missing: [],
  pendingView: null,
  viewMissing: [],
  finding: null,
  keptFolder: null,
}));

let engineRef: Engine | null = null;

/** Puts the waiting view back when its data and level are there. */
function refresh(): void {
  const s = useSessionOpen.getState();
  if (!s.report) return;
  const missing = compareData(s.report.data).missing;
  if (missing.length !== s.missing.length) useSessionOpen.setState({ missing });
  if (!s.pendingView || !engineRef) return;
  const lv = useLevelRequest.getState().status;
  const levelSettled = lv !== 'pending' && lv !== 'loading';
  const dataHere = !missing.length && (!s.report.data.length || !!useStore.getState().dataset);
  if (dataHere && levelSettled) applyPending();
}

/** The waiting view, now: with what of it this data has. */
export function applyPending(): void {
  const s = useSessionOpen.getState();
  const v = s.pendingView;
  if (!v || !engineRef) return;
  const engine = engineRef;
  const viewMissing = applyView(engine, v);
  useSessionOpen.setState({ pendingView: null, viewMissing });
  // Once more a moment later: a data load or a level frames the camera on its own first frames.
  window.setTimeout(() => {
    if (v.selection.follow) return;
    engine.setCameraPose(v.camera.position, v.camera.forward);
    if (v.camera.projection === 'orthographic') engine.camera.orthoHeight = v.camera.orthoHeight;
    engine.invalidate(3);
  }, 400);
}

let subscribed = false;
function follow(): void {
  if (subscribed) return;
  subscribed = true;
  useLoadedRefs.subscribe(refresh);
  useLevelRequest.subscribe((st, prev) => {
    if (st.status !== prev.status) refresh();
  });
  // The dataset itself, for a view whose file names no data.
  useStore.subscribe((st, prev) => {
    if (st.dataset !== prev.dataset) refresh();
  });
}

/** Opens a session file (`openSession`) and follows it until all it names is here. */
export async function restoreSession(engine: Engine | null, file: SessionFile, packed: File[]): Promise<LoadReport> {
  follow();
  engineRef = engine;
  const report = await openSession(engine, file, packed);
  useSessionOpen.setState({ report, missing: report.missing, pendingView: report.pendingView, viewMissing: report.viewMissing, finding: null, keptFolder: null });
  if (report.level) requestLevel(report.level);
  else clearLevelRequest();
  if (report.missing.length) void keptFolderName().then((keptFolder) => useSessionOpen.setState({ keptFolder }));
  // The packed data loads by itself: it came with the file.
  if (packed.length && report.missing.length) handPicked(packed.map((f) => ({ file: f, relativePath: f.name })), true);
  refresh();
  return report;
}

export function closeOpenReport(): void {
  useSessionOpen.setState({ report: null, missing: [], finding: null });
}

/**
 * Looks for the missing data in a folder (or files) the user picks, kept from
 * last time where `how` is 'kept': the files that are the session's data are
 * loaded, together with what is loaded already of it.
 */
export async function findMissingData(how: 'folder' | 'files' | 'kept'): Promise<void> {
  const s = useSessionOpen.getState();
  if (!s.report || s.finding === 'busy') return;
  let picked: PickedFile[] | null;
  if (how === 'kept') picked = await filesOfKeptFolder();
  else if (how === 'folder') picked = await pickDataFolder();
  else picked = await openPicker(false, true);
  if (!picked?.length) return;
  useSessionOpen.setState({ finding: 'busy' });
  try {
    const want = compareData(s.report.data).missing;
    const { keep, still } = await matchDataFiles(want, picked);
    if (keep.length) {
      // What of the session's data is loaded already stays loaded with it.
      const fp = new Set(s.report.data.map((d) => d.fingerprint));
      const { files, refs } = loadedData();
      const already = files.filter((_, i) => refs[i] && fp.has(refs[i].fingerprint)).map((f) => ({ file: f, relativePath: f.name }));
      handPicked([...already, ...keep], true);
    }
    useSessionOpen.setState({ finding: { found: want.length - still.length, still: still.length, looked: picked.length } });
    if (how === 'folder') void keptFolderName().then((keptFolder) => useSessionOpen.setState({ keptFolder }));
  } catch {
    useSessionOpen.setState({ finding: null });
  }
}
