/**
 * The loaded level's layout as one more source of objectives
 * (`render/objectives.ts`): drawn when the data brings no battle objectives
 * of its own. Its positions are the level's, so it is drawn in the level's
 * frame whatever axes the data has (`ObjectiveSource.world`).
 */

import type { ObjectiveSource } from './objectives';
import type { LevelLayout } from '../match/levelLayouts';
import { layoutsDoc, shownLayout, useLevelLayouts, wantLayouts } from '../state/levelLayoutsStore';
import { useSpawnDisplay } from '../state/spawnDisplayStore';

/** A level's game and name from its part names (` @<game>/<level>`, as the map tools write them). */
const PART = /\s@([a-z0-9][a-z0-9-]*)\/([A-Za-z0-9_\-.]+)\s*$/;

export function levelIdOf(partNames: readonly string[] | undefined, name?: string): { game: string; level: string } | null {
  for (const part of partNames ?? []) {
    const m = PART.exec(part);
    if (m) return { game: m[1], level: m[2] };
  }
  // Parts that name no game (an older tool's): the level's own name, and any game's layouts of that name.
  const stem = (name ?? '').replace(/[.](glb|gltf|obj|ply|fbx)$/i, '').trim();
  return stem ? { game: '', level: stem } : null;
}

/** The loaded level's game and name, when it is a model level. */
export function levelIdOfLevel(level: unknown): { game: string; level: string } | null {
  if (!level || typeof level !== 'object' || (level as { kind?: string }).kind !== 'model') return null;
  const l = level as { partNames?: string[]; name?: string };
  return levelIdOf(l.partNames, l.name);
}

let last: { key: string; layout: LevelLayout; source: ObjectiveSource } | null = null;

/** The shown layout of `level` (a model level from a map tool) as an objective source; null without one. */
export function levelLayoutSource(level: unknown): ObjectiveSource | null {
  const id = levelIdOfLevel(level);
  if (!id) return null;
  wantLayouts(id.game, id.level);
  const layout = shownLayout(id.game, id.level);
  const found = layout ? layoutsDoc(id.game, id.level) : null;
  if (!layout || !found) return null;
  // The spawns' rings only in the spawn display's `groups` (`state/spawnDisplayStore.ts`), one team's where it filters.
  const sd = useSpawnDisplay.getState();
  const key = `${found.key}|${layout.id}|${useLevelLayouts.getState().rev}|${sd.mode}|${sd.team}|${sd.owner}`;
  if (last && last.key === key && last.layout === layout) return last.source;
  const owner = sd.owner ? layout.spawnOwners.get(sd.owner) : undefined;
  const keep = (o: (typeof layout.objectives)[number]) =>
    o.layer !== 'spawns' ||
    (sd.mode === 'groups' && (sd.team === null || o.team === null || o.team === sd.team) && (!owner || o.name === owner.letter || o.name === owner.name || o.name === owner.id));
  // The same array each frame, so what is laid on the ground is laid once.
  const source: ObjectiveSource = {
    match: `@layout ${id.level} ${layout.id}`,
    objectives: layout.objectives.every(keep) ? layout.objectives : layout.objectives.filter(keep),
    timeline: null,
    offset: 0,
    world: true,
    ...(found.doc.teams ? { ownerLabels: found.doc.teams } : {}),
  };
  last = { key, layout, source };
  return source;
}
