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
import { isContainer, openContainer } from '../data/container';
import { OBJECTIVE_LAYERS, type Objective, type ObjectiveLayer, type ObjectiveTimeline } from '../match/objectives';
import { isObjectivesFile, readObjectivesFile } from '../match/objectivesFile';

export { isObjectivesFile, readObjectivesFile };

export interface ObjectivesState {
  /** Everything at once: off hides every layer and label. */
  on: boolean;
  layers: Record<ObjectiveLayer, boolean>;
  labels: boolean;
  /** Battles of several modes shown together: every mode's objectives, rather than none (`objectivesOfOneMode`). */
  allModes: boolean;
  /** Each battle's capture zones over time, by match name. */
  timelines: Record<string, ObjectiveTimeline>;
  /**
   * Objectives read on their own, without the rest of the match document: a
   * many-match load's (`objectivesLazy.ts`), one read for every battle of a map
   * and mode, under each of its battles' names.
   */
  lite: { match: string; objectives: Objective[]; ownerLabels?: Record<number, string> }[];
  /** Bumped on every change the drawing depends on. */
  rev: number;
  error: string | null;
  setOn: (on: boolean) => void;
  setLayer: (layer: ObjectiveLayer, on: boolean) => void;
  setLabels: (on: boolean) => void;
  setAllModes: (on: boolean) => void;
  addTimelines: (list: ObjectiveTimeline[]) => void;
  addLite: (list: { match: string; objectives: Objective[]; ownerLabels?: Record<number, string> }[]) => void;
}

const KEY = '3dheat.objectives';

function saved(): {
  on: boolean;
  layers: Record<ObjectiveLayer, boolean>;
  labels: boolean;
  allModes: boolean;
} {
  const layers = Object.fromEntries(OBJECTIVE_LAYERS.map((l) => [l, true])) as Record<ObjectiveLayer, boolean>;
  const out = { on: true, layers, labels: true, allModes: false };
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (v && typeof v === 'object') {
      if (typeof v.on === 'boolean') out.on = v.on;
      if (typeof v.labels === 'boolean') out.labels = v.labels;
      if (typeof v.allModes === 'boolean') out.allModes = v.allModes;
      for (const l of OBJECTIVE_LAYERS) if (typeof v.layers?.[l] === 'boolean') layers[l] = v.layers[l];
    }
  } catch {
    // Private windows and blocked storage: the defaults.
  }
  return out;
}

function save(s: ObjectivesState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ on: s.on, layers: s.layers, labels: s.labels, allModes: s.allModes }));
  } catch {
    // The choice lasts this session only.
  }
}

export const useObjectivesStore = create<ObjectivesState>((set, get) => ({
  ...saved(),
  timelines: {},
  lite: [],
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
  setAllModes: (allModes) => {
    set({ allModes, rev: get().rev + 1 });
    save(get());
  },
  addTimelines: (list) => {
    if (!list.length) return;
    const timelines = { ...get().timelines };
    for (const tl of list) timelines[tl.match] = tl;
    set({ timelines, rev: get().rev + 1 });
  },
  addLite: (list) => {
    if (!list.length) return;
    const names = new Set(list.map((l) => l.match));
    set({ lite: [...get().lite.filter((l) => !names.has(l.match)), ...list], rev: get().rev + 1 });
  },
}));

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
