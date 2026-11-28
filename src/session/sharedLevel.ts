/**
 * A level the host shared, made the level by itself once its files are here
 * and checked (`assets.ts`): its layouts first, its tiled terrain when it has
 * one (read from the shared tiles, a range at a time), else its model.
 */

import { modelLoader } from '../data/modelLoader';
import { IMPORT_DEFAULT_LOD, LOD_TARGETS } from '../data/simplify';
import { loadLayoutFiles } from '../state/levelLayoutsStore';
import { useStore } from '../state/store';
import { blobReader } from '../world/terrainFormat';
import { sharedPath } from './assets';

/** Loads the shared level `name` from its files; false when they hold no model or terrain. */
export async function loadSharedLevel(name: string, files: File[]): Promise<boolean> {
  const layouts = files.find((f) => /\.layouts\.json$/i.test(f.name));
  if (layouts) await loadLayoutFiles([layouts]);
  const index = files.find((f) => /\.terrain\.json$/i.test(f.name));
  if (index) {
    try {
      const text = await index.text();
      const bin = (JSON.parse(text) as { bin?: unknown }).bin;
      const tiles = typeof bin === 'string' ? files.find((f) => sharedPath(f) === bin || f.name === bin) : undefined;
      if (tiles) {
        const { openTerrainLevel } = await import('../ui/panels/terrainLevel');
        useStore.getState().setLevel(await openTerrainLevel(name, text, blobReader(tiles)));
        return true;
      }
    } catch {
      // The tiles do not read: the model instead.
    }
  }
  const model = files.find((f) => /\.(glb|gltf)$/i.test(f.name));
  if (!model) return false;
  const m = await modelLoader.load(model, LOD_TARGETS[IMPORT_DEFAULT_LOD], () => undefined);
  const { modelLevelFrom } = await import('../ui/panels/LevelPanel');
  useStore.getState().setLevel(modelLevelFrom(model.name, m));
  return true;
}
