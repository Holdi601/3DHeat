/**
 * File selection: a single file, several files, or a whole folder tree.
 *
 * Folder support has to work two ways, because the browser exposes them
 * differently: `<input webkitdirectory>` for the picker, and recursive
 * `webkitGetAsEntry()` traversal for drag-and-drop. Neither one covers both.
 */

import { t } from '../i18n';

const DATA_EXT = /\.(parquet|pq|csv|tsv|txt|acmi|json|json\.gz|gpx|kml|kmz|nmea|nma|igc|fit)$/i;

/**
 * Files that carry positions.
 *
 * `movement*` rather than exactly `movement.parquet`, because the same export
 * appears as `movement.parquet`, `movement_1.parquet` and so on when a table is
 * split, and all of them are the thing wanted.
 */
const MOVEMENT = /^movement\w*\.(parquet|pq|csv|tsv|txt)$/i;

export interface PickedFile {
  file: File;
  /** Path relative to the chosen folder, when one is known. */
  relativePath: string;
}

/**
 * JSON written beside a table to describe it, never positions itself: the CS2
 * exporter's `<match>.match.json`, a level's `.json` sidecar, a course file.
 * Only other `.json` files are offered as recordings (OCAP).
 */
const SIDECAR_JSON = /\.(match|course|level|meta|summary|session|hints)\.json$/i;

export function isDataFile(name: string): boolean {
  return DATA_EXT.test(name) && !SIDECAR_JSON.test(name);
}

/**
 * Parquet a converter writes beside a match's table: what it decoded only in
 * part or not at all, kept whole (`<match>.<what>.parquet`, see
 * docs/converters.md, whose list of `<what>` this must match). Left out when
 * a folder is loaded, so a folder of matches loads its tables; picked or
 * dropped on their own (nothing but sidecars in the selection) they load like
 * any table.
 */
const SIDECAR_PARQUET =
  /\.(messages|flight|packets|events|entities|props|units|combatlog|strings|raw|objectives)\.(parquet|pq)$/i;

export function isSidecar(name: string): boolean {
  return SIDECAR_PARQUET.test(name);
}

/**
 * Keep only loadable files, drop empties, and order them deterministically.
 *
 * Sorting matters: a set of files read in directory order would produce a
 * different dataset id and a different roster ordering run to run, which makes
 * team colours shuffle between loads of the same data.
 */
export function filterDataFiles(files: PickedFile[]): {
  accepted: PickedFile[];
  skipped: Array<{ name: string; reason: string }>;
} {
  const accepted: PickedFile[] = [];
  const skipped: Array<{ name: string; reason: string }> = [];
  // A folder of telemetry exports holds one movement file per environment and
  // dozens of unrelated tables beside it. Only the movement files carry
  // positions, so the rest are not "data this can load
  // but chose not to": they have no X, Y or Z and every one of them would either
  // be rejected downstream or, worse, contribute rows with no position.
  //
  // Dropped here rather than at ingest so the count in the sidebar is the number
  // of files that will actually appear, and so a folder of a thousand tables does
  // not spend minutes being read before saying so.
  const positional = files.some((f) => MOVEMENT.test(f.file.name));
  // Sidecars are wanted only when they are all that was chosen: then the user
  // opened them on purpose, else they are the raw data beside the tables.
  const data = files.filter((f) => isDataFile(f.file.name));
  const deliberate = data.length > 0 && data.every((f) => isSidecar(f.file.name));
  for (const f of files) {
    if (!isDataFile(f.file.name)) {
      skipped.push({ name: f.relativePath || f.file.name, reason: t('data.filePick.notData') });
    } else if (f.file.size === 0) {
      skipped.push({ name: f.relativePath || f.file.name, reason: t('data.filePick.empty') });
    } else if (!deliberate && isSidecar(f.file.name)) {
      skipped.push({ name: f.relativePath || f.file.name, reason: t('data.filePick.sidecar') });
    } else if (positional && !MOVEMENT.test(f.file.name)) {
      // Only when a movement file is present. A folder of something else entirely
      // — one CSV of positions with a name of its own — must still load, so the
      // rule is "prefer movement where it exists" rather than "require it".
      skipped.push({
        name: f.relativePath || f.file.name,
        reason: t('data.filePick.notMovement'),
      });
    } else {
      accepted.push(f);
    }
  }
  accepted.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  return { accepted, skipped };
}

/** Open a native picker. `directory` switches to folder mode (recursive). */
export function openPicker(directory: boolean, multiple = true): Promise<PickedFile[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    if (directory) {
      // Non-standard but the only widely supported way to pick a folder.
      input.setAttribute('webkitdirectory', '');
      input.setAttribute('directory', '');
    } else {
      input.multiple = multiple;
      input.accept = '.3dheat,.parquet,.pq,.csv,.tsv,.txt,.acmi,.json,.gz,.gpx,.kml,.kmz,.nmea,.nma,.igc,.fit';
    }
    input.style.display = 'none';
    document.body.appendChild(input);

    let settled = false;
    const finish = (files: PickedFile[]) => {
      if (settled) return;
      settled = true;
      input.remove();
      resolve(files);
    };

    input.onchange = () => {
      const list = Array.from(input.files ?? []).map((file) => ({
        file,
        relativePath: (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name,
      }));
      finish(list);
    };
    // 'cancel' is not universally fired, so also resolve empty on window focus.
    input.oncancel = () => finish([]);
    input.click();
  });
}

/**
 * Extract files from a drop, walking into any dropped directories.
 *
 * The DataTransfer entry list is only valid synchronously, so entries are
 * captured up front and traversed afterwards.
 */
export async function filesFromDataTransfer(dt: DataTransfer): Promise<PickedFile[]> {
  const entries: FileSystemEntry[] = [];
  const plainFiles: File[] = [];

  for (const item of Array.from(dt.items)) {
    if (item.kind !== 'file') continue;
    const entry = (item as DataTransferItem & {
      webkitGetAsEntry?: () => FileSystemEntry | null;
    }).webkitGetAsEntry?.();
    if (entry) entries.push(entry);
    else {
      const f = item.getAsFile();
      if (f) plainFiles.push(f);
    }
  }

  const out: PickedFile[] = plainFiles.map((file) => ({ file, relativePath: file.name }));
  for (const entry of entries) {
    await walkEntry(entry, '', out);
  }
  // Fall back to the flat list if the entry API gave us nothing.
  if (out.length === 0) {
    for (const file of Array.from(dt.files)) out.push({ file, relativePath: file.name });
  }
  return out;
}

/** Guard against a pathological or symlinked tree. */
const MAX_DEPTH = 12;
const MAX_FILES = 20_000;

async function walkEntry(entry: FileSystemEntry, prefix: string, out: PickedFile[]): Promise<void> {
  if (out.length >= MAX_FILES) return;
  const path = prefix ? `${prefix}/${entry.name}` : entry.name;

  if (entry.isFile) {
    const file = await new Promise<File | null>((resolve) => {
      (entry as FileSystemFileEntry).file(
        (f) => resolve(f),
        () => resolve(null),
      );
    });
    if (file) out.push({ file, relativePath: path });
    return;
  }

  if (!entry.isDirectory || prefix.split('/').length > MAX_DEPTH) return;
  const reader = (entry as FileSystemDirectoryEntry).createReader();
  for (;;) {
    // readEntries returns at most ~100 at a time and must be called until empty.
    const batch = await new Promise<FileSystemEntry[]>((resolve) => {
      reader.readEntries(
        (es) => resolve(es),
        () => resolve([]),
      );
    });
    if (batch.length === 0) break;
    for (const child of batch) await walkEntry(child, path, out);
  }
}

/** Human-readable label for a selection. */
export function describeSelection(files: PickedFile[]): string {
  if (files.length === 0) return t('data.filePick.nothing');
  if (files.length === 1) return files[0].file.name;
  // Longest common directory prefix reads better than "12 files".
  const dirs = files.map((f) => f.relativePath.split('/').slice(0, -1));
  let common = dirs[0] ?? [];
  for (const d of dirs.slice(1)) {
    let i = 0;
    while (i < common.length && i < d.length && common[i] === d[i]) i++;
    common = common.slice(0, i);
  }
  const root = common.join('/');
  return root
    ? t('data.filePick.filesIn', { root, count: files.length })
    : t('data.filePick.files', { count: files.length });
}

export function totalBytes(files: PickedFile[]): number {
  return files.reduce((n, f) => n + f.file.size, 0);
}
