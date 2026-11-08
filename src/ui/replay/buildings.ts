/**
 * Buildings in the match replay: where an extracted level paints each object
 * (its structure parts carry their own colours), the replay shows them solid
 * in those colours - they are the town the battle is fought in - while the
 * heat views keep the see-through shells, since seeing the data inside a
 * building is the point there. Which one the replay shows is the viewer's
 * choice (`replayStore.buildings`), applied when the match tab is entered and
 * when a level is loaded on it.
 */

import { useStore } from '../../state/store';
import type { ModelLevel } from '../../render/level';

/** The see-through shell's face opacity (the level panel's default). */
const SHELL_OPACITY = 0.25;

/** How a level's structures are drawn, solid or see-through. */
export function buildingsLook(solid: boolean): Partial<Omit<ModelLevel, 'kind'>> {
  return solid
    ? { structureTexture: true, structureOpacity: 1, showStructureWire: false, flatStructures: false }
    : { structureTexture: false, structureOpacity: SHELL_OPACITY, showStructureWire: true };
}

/** Whether the loaded level has buildings painted in their own colours (what the toggle is for). */
export function levelHasColouredBuildings(): boolean {
  const l = useStore.getState().level;
  return !!l && l.kind === 'model' && l.structureColours === true;
}

/** Whether the loaded level's buildings are drawn solid now. */
export function buildingsSolid(): boolean {
  const l = useStore.getState().level;
  return !!l && l.kind === 'model' && l.structureTexture === true && (l.structureOpacity ?? 0) >= 0.999;
}

/** Draws the loaded level's painted buildings solid or see-through; nothing for a level without painted buildings. */
export function applyBuildings(solid: boolean): void {
  if (!levelHasColouredBuildings()) return;
  useStore.getState().patchLevel(buildingsLook(solid));
}
