/**
 * Reads a battle's objectives, or its capture zones over time, off the main
 * thread (`objectivesLazy.ts`): a War Thunder match document is most of a
 * megabyte of JSON, and only its `objectives` are wanted.
 */

import { isContainer, openContainer } from '../data/container';
import { parseObjectives } from '../match/objectives';
import { readObjectivesFile } from '../match/objectivesFile';

export type ObjectivesRequest = { id: number; kind: 'objectives' | 'timeline'; file: File; match: string };

self.onmessage = async (e: MessageEvent<ObjectivesRequest>) => {
  const { id, kind, file, match } = e.data;
  try {
    if (kind === 'objectives') {
      const j = isContainer(file.name) ? await (await openContainer(file)).json('match') : JSON.parse(await file.text());
      const list = j && typeof j === 'object' ? (j as { objectives?: unknown }).objectives : null;
      postMessage({ id, objectives: parseObjectives(list) });
    } else {
      const f = isContainer(file.name) ? await (await openContainer(file)).member('objectives') : file;
      const tl = f ? await readObjectivesFile(f) : null;
      postMessage({ id, timeline: tl ? { ...tl, match } : null });
    }
  } catch (err) {
    postMessage({ id, error: err instanceof Error ? err.message : String(err) });
  }
};
