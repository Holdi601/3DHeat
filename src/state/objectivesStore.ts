/**
 * The battles' objectives as the viewer shows them: which layers are drawn
 * (capture zones, spawns, airfields, areas, bombing targets), whether their
 * labels are, and the capture zones over time read from each battle's
 * `<match>.objectives.parquet` (`match/objectives.ts`). The objectives
 * themselves come with the match documents (`matchStore`).
 *
 * The layer choices are the viewer's own and kept in this browser.
 */

import { create } from 'zustand';
import { parquetMetadataAsync, parquetReadObjects, type Compressors } from 'hyparquet';
import { decompress as zstd } from 'fzstd';
import { asyncBufferFromFile } from '../data/parquet';
import { isContainer, openContainer } from '../data/container';
import { buildTimeline, OBJECTIVE_LAYERS, type ObjectiveLayer, type ObjectiveRow, type ObjectiveTimeline } from '../match/objectives';

export interface ObjectivesState {
  /** Everything at once: off hides every layer and label. */
  on: boolean;
  layers: Record<ObjectiveLayer, boolean>;
  labels: boolean;
  /** Each battle's capture zones over time, by match name. */
  timelines: Record<string, ObjectiveTimeline>;
  /** Bumped on every change the drawing depends on. */
  rev: number;
  error: string | null;
  setOn: (on: boolean) => void;
  setLayer: (layer: ObjectiveLayer, on: boolean) => void;
  setLabels: (on: boolean) => void;
  addTimelines: (list: ObjectiveTimeline[]) => void;
}

const KEY = '3dheat.objectives';

function saved(): {
  on: boolean;
  layers: Record<ObjectiveLayer, boolean>;
  labels: boolean;
} {
  const layers = Object.fromEntries(OBJECTIVE_LAYERS.map((l) => [l, true])) as Record<ObjectiveLayer, boolean>;
  const out = { on: true, layers, labels: true };
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (v && typeof v === 'object') {
      if (typeof v.on === 'boolean') out.on = v.on;
      if (typeof v.labels === 'boolean') out.labels = v.labels;
      for (const l of OBJECTIVE_LAYERS) if (typeof v.layers?.[l] === 'boolean') layers[l] = v.layers[l];
    }
  } catch {
    // Private windows and blocked storage: the defaults.
  }
  return out;
}

function save(s: ObjectivesState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ on: s.on, layers: s.layers, labels: s.labels }));
  } catch {
    // The choice lasts this session only.
  }
}

export const useObjectivesStore = create<ObjectivesState>((set, get) => ({
  ...saved(),
  timelines: {},
  rev: 0,
  error: null,
  setOn: (on) => {
    set({ on, rev: get().rev + 1 });
    save(get());
  },
  setLayer: (layer, on) => {
    set({ layers: { ...get().layers, [layer]: on }, rev: get().rev + 1 });
    save(get());
  },
  setLabels: (labels) => {
    set({ labels, rev: get().rev + 1 });
    save(get());
  },
  addTimelines: (list) => {
    if (!list.length) return;
    const timelines = { ...get().timelines };
    for (const tl of list) timelines[tl.match] = tl;
    set({ timelines, rev: get().rev + 1 });
  },
}));

const SIDECAR = /\.objectives\.(parquet|pq)$/i;

export function isObjectivesFile(name: string): boolean {
  return SIDECAR.test(name);
}

/** What the converter compresses its side tables with, besides what the reader knows. */
const COMPRESSORS: Compressors = {
  ZSTD: (input, outputLength) => zstd(input, new Uint8Array(outputLength)),
};

const num = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'bigint' ? Number(v) : NaN);

/** A battle's capture zones over time from its `<match>.objectives.parquet` (a few hundred rows). */
export async function readObjectivesFile(file: File): Promise<ObjectiveTimeline> {
  const buf = asyncBufferFromFile(file);
  const metadata = await parquetMetadataAsync(buf);
  const names = new Set(metadata.schema.map((s) => s.name));
  if (!names.has('zone') || !names.has('time')) throw new Error(`${file.name}: no zone or time column`);
  const columns = ['time', 'event', 'zone', 'owner', 'progress'].filter((c) => names.has(c));
  const read = (await parquetReadObjects({
    file: buf,
    metadata,
    columns,
    compressors: COMPRESSORS,
  })) as Record<string, unknown>[];
  const rows: ObjectiveRow[] = read.map((r) => ({
    time: num(r.time),
    event: typeof r.event === 'string' ? r.event : '',
    zone: typeof r.zone === 'string' ? r.zone : '',
    owner: num(r.owner),
    progress: num(r.progress),
  }));
  return buildTimeline(file.name.replace(SIDECAR, ''), rows);
}

/**
 * Reads the `<match>.objectives.parquet` among `files`, and the `objectives`
 * member of each `.3dheat` container (the rest are left alone): what the
 * match tab's loads and drops call beside the match documents.
 */
export async function loadObjectiveFiles(files: File[]): Promise<number> {
  const picked = files.filter((f) => isObjectivesFile(f.name) || isContainer(f.name));
  if (!picked.length) return 0;
  const out: ObjectiveTimeline[] = [];
  const errors: string[] = [];
  for (const f of picked) {
    try {
      if (isContainer(f.name)) {
        const member = await (await openContainer(f)).member('objectives');
        if (!member) continue;
        const tl = await readObjectivesFile(member);
        // Named by the container, whatever its member is called.
        out.push({ ...tl, match: f.name.replace(/\.3dheat$/i, '') });
      } else out.push(await readObjectivesFile(f));
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }
  useObjectivesStore.getState().addTimelines(out);
  useObjectivesStore.setState({
    error: errors.length ? errors.join('\n') : null,
  });
  return out.length;
}
