/**
 * Opening real data, from wherever the viewer is: the start screen over an
 * empty view, a drop on the view, and the Source panel's own buttons. Files
 * picked or dropped outside the Source panel are handed to it (`handPicked`),
 * so they go through the same preview, mapping and fit check as a pick there.
 *
 * The start screen is the first thing a new user sees, so it leads with
 * Open files: someone who has replays or tables wants them on the screen. The
 * generated sample is a small link under it, for a look around without data;
 * the generator itself is a developer tool (`DevToolsPanel`).
 */

import { useEffect, useMemo, useState } from 'react';
import { filesFromDataTransfer, openPicker, type PickedFile } from '../../data/filePick';
import { listLevels } from '../../data/levelLibrary';
import { generatePerfData } from '../../data/perfData';
import { t, useLang } from '../../i18n';
import { useRaceStore } from '../../state/raceStore';
import { useStore } from '../../state/store';
import { handPicked } from '../../session/dataRefs';
import { readAutosave } from '../../session/sessionFile';
import { useSessionStore } from '../../session/store';
import { reveal } from '../shell/commands';
import { taskOf, useShell } from '../shell/shellStore';
import { CATALOG_ROUTE } from './CatalogSection';

/** The kinds of file the drop zone and the pickers take, as the drop zone lists them. */
export const DATA_EXTENSIONS = '.parquet · .csv · .tsv · .3dheat · .acmi · .json · .gpx · .kml · .kmz · .nmea · .igc · .fit';

/** The size of the start screen's sample: enough to look like something, quick on any machine. */
const SAMPLE_ROWS = 1_000_000;

/** The side panel shown, on a group that holds the Source panel, so the mapping and Load are in sight. */
function showLoadGroup(): void {
  const shell = useShell.getState();
  if (shell.sidebarHidden) shell.setSidebarHidden(false);
  const tab = useRaceStore.getState().tab;
  const task = taskOf(shell.task, tab);
  if (task !== 'all' && task !== 'load') shell.setTask(tab, 'load');
}

/** Hands files to the Source panel, as if picked there. */
export function takeFiles(files: PickedFile[]): void {
  if (!files.length) return;
  showLoadGroup();
  handPicked(files);
}

/** A file or folder picker, its pick handed to the Source panel. */
export async function openData(directory: boolean): Promise<void> {
  takeFiles(await openPicker(directory, true));
}

/** Files dropped on the view, handed to the Source panel. */
export async function dropData(dt: DataTransfer): Promise<void> {
  takeFiles(await filesFromDataTransfer(dt));
}

/** The session panel's file picker: a saved `.3dheat-session` (views, notes, the board, the data it names). */
export function openSessionFile(): void {
  useSessionStore.getState().setPanel(true);
  // The panel's picker, once the panel is there (the same as the command).
  window.setTimeout(() => window.dispatchEvent(new Event('heat3d:open-session')), 50);
}

/** The last session, kept in this browser, to take up again: a line with a link, or nothing. */
export function RecentSession() {
  useLang();
  const state = useSessionStore((s) => s.state);
  const role = useSessionStore((s) => s.role);
  const auto = useMemo(() => (state !== 'joined' ? readAutosave() : null), [state]);
  if (!auto || (state === 'joined' && role !== 'host')) return null;
  return (
    <button
      type="button"
      className="link"
      data-testid="recent-session"
      title={t('app.empty.start.restoreTitle')}
      onClick={() => {
        useSessionStore.getState().setPanel(true);
        window.setTimeout(() => window.dispatchEvent(new Event('heat3d:restore-session')), 50);
      }}
    >
      {t('app.empty.start.restore', { time: new Date(auto.savedAt).toLocaleString() })}
    </button>
  );
}

/** How many levels are ready to put under the data: the library's and the levels folder's. */
function useLevelCount(): number {
  const [library, setLibrary] = useState(0);
  const [folder, setFolder] = useState(0);
  useEffect(() => {
    let stop = false;
    void listLevels()
      .then((l) => !stop && setLibrary(l.length))
      .catch(() => undefined);
    // The levels folder, where a local server has one (a hosted build has none).
    fetch(CATALOG_ROUTE)
      .then((r) => (r.status === 200 ? r.json() : null))
      .then((ix: { items?: Array<{ kind?: string }> } | null) => {
        if (!stop && ix && Array.isArray(ix.items)) setFolder(ix.items.filter((i) => i.kind === 'level' || i.kind === 'course').length);
      })
      .catch(() => undefined);
    return () => {
      stop = true;
    };
  }, []);
  return library + folder;
}

/**
 * Over the empty view of the Heatmap and Match workspaces: open files (the one
 * primary action), a folder or a session, what can be opened, the last
 * session, the levels at hand, and - small, last - a generated sample.
 */
export function StartScreen() {
  useLang();
  const busy = useStore((s) => s.load.active);
  const levels = useLevelCount();
  return (
    <div className="empty-state start" data-testid="start-screen">
      <h2>{t('app.empty.start.title')}</h2>
      <div>{t('app.empty.start.hint')}</div>
      <div className="start-actions">
        <button type="button" className="primary" data-testid="start-open-files" disabled={busy} onClick={() => void openData(false)}>
          {t('app.empty.start.openFiles')}
        </button>
        <button type="button" disabled={busy} onClick={() => void openData(true)}>
          {t('app.empty.start.openFolder')}
        </button>
        <button type="button" onClick={() => openSessionFile()} title={t('heat.sourcePanel.openSessionTitle')}>
          {t('app.empty.start.openSession')}
        </button>
      </div>
      <div className="start-formats">{t('app.empty.start.formats')}</div>
      <RecentSession />
      {levels > 0 && (
        <button type="button" className="link" onClick={() => void reveal({ path: ['heat.levelPanel.title'] })}>
          {t('app.empty.start.levels', { count: levels })}
        </button>
      )}
      <button
        type="button"
        className="link start-sample"
        data-testid="start-sample"
        disabled={busy}
        title={t('app.empty.start.sampleTitle')}
        onClick={() => void generatePerfData({ rows: SAMPLE_ROWS })}
      >
        {t('app.empty.start.sample')}
      </button>
    </div>
  );
}
