/**
 * A many-match load's objectives, read when they are first shown and not
 * before. Each battle's match document is most of a megabyte of JSON, and a
 * folder of hundreds of them read whole at load would hold up the load and
 * the frames after it for objectives that are the same for every battle of a
 * map and mode. So the battles are grouped by map and mode (their names say:
 * `<map>_<difficulty>_<mode>_<date>_<time>_<id>`), one document a group is
 * read in a worker, its objectives listed under every battle of the group
 * (`useObjectivesStore.lite`), and a battle's capture zones over time read
 * only when it is the one shown. A single match is read whole at load, as
 * the match tab reads it (`loadMatchesBeside`).
 */

import { isContainer } from '../data/container';
import type { Objective, ObjectiveTimeline } from '../match/objectives';
import { isObjectivesFile } from '../match/objectivesFile';
import { useObjectivesStore } from './objectivesStore';
import type { ObjectivesRequest } from './objectivesWorker';

interface Group {
  /** The battles of one map and mode, each with the file its objectives are in. */
  matches: { match: string; file: File }[];
  /** 0 not asked for, 1 being read, 2 done. */
  state: 0 | 1 | 2;
}

/** A battle's name without its date, time and id: what its map and mode are known by. */
export function groupKey(match: string): string {
  return match.replace(/_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}(_[0-9a-f]+)?(_server)?$/i, '');
}

const stem = (name: string) => name.replace(/\.3dheat$/i, '').replace(/\.match\.json$/i, '').replace(/\.objectives\.(parquet|pq)$/i, '');

let groups = new Map<string, Group>();
/** Where each battle's capture zones are (its container or sidecar), until read. */
let timelineFiles = new Map<string, File>();
let pending = false;
let worker: Worker | null = null;
let nextId = 1;
const waiting = new Map<number, (r: { objectives?: Objective[]; timeline?: ObjectiveTimeline | null; error?: string }) => void>();

/** Takes over from the last load: `files` are its containers and loose match documents and sidecars. */
export function registerLazyMatches(files: File[]): void {
  groups = new Map();
  timelineFiles = new Map();
  for (const f of files) {
    const packed = isContainer(f.name);
    if (packed || /\.match\.json$/i.test(f.name)) {
      const match = stem(f.name);
      const key = groupKey(match);
      let g = groups.get(key);
      if (!g) groups.set(key, (g = { matches: [], state: 0 }));
      g.matches.push({ match, file: f });
    }
    if (packed || isObjectivesFile(f.name)) timelineFiles.set(stem(f.name), f);
  }
  pending = groups.size > 0;
  useObjectivesStore.setState((st) => ({ lite: [], rev: st.rev + 1 }));
}

function ask(req: Omit<ObjectivesRequest, 'id'>): Promise<{ objectives?: Objective[]; timeline?: ObjectiveTimeline | null; error?: string }> {
  if (!worker) {
    worker = new Worker(new URL('./objectivesWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e) => {
      const done = waiting.get(e.data.id);
      waiting.delete(e.data.id);
      done?.(e.data);
    };
  }
  const id = nextId++;
  return new Promise((resolve) => {
    waiting.set(id, resolve);
    worker!.postMessage({ ...req, id });
  });
}

/**
 * The objectives are wanted (the layer is on, battles are loaded): every group
 * not read yet is read, one document each, in the worker. Called every frame
 * that shows objectives; nothing but a flag test once all are asked for.
 */
export function wantObjectives(): void {
  if (!pending) return;
  pending = false;
  const mine = groups;
  void (async () => {
    for (const g of mine.values()) {
      if (g.state !== 0) continue;
      g.state = 1;
      // The first battle of the group whose document has any.
      for (const m of g.matches) {
        const r = await ask({ kind: 'objectives', file: m.file, match: m.match });
        if (groups !== mine) return;
        if (!r.objectives || !r.objectives.length) continue;
        const objectives = r.objectives;
        useObjectivesStore.getState().addLite(g.matches.map((x) => ({ match: x.match, objectives })));
        break;
      }
      g.state = 2;
    }
  })();
}

/** One battle is shown: its capture zones over time, read once. */
export function wantTimeline(match: string): void {
  const file = timelineFiles.get(match);
  if (!file) return;
  timelineFiles.delete(match);
  void ask({ kind: 'timeline', file, match }).then((r) => {
    if (r.timeline) useObjectivesStore.getState().addTimelines([r.timeline]);
  });
}
