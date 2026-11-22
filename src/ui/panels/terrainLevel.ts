import type { ModelLevel } from '../../render/level';
import { parseTerrainIndex, type TerrainReader } from '../../world/terrainFormat';
import { TerrainStream } from '../../world/terrainStream';
import { modelLevelFrom } from './LevelPanel';

/**
 * A tiled terrain (`<Level>.terrain.json` + `.terrain.bin`, src/world/terrainFormat.ts)
 * as the level: no arrays of its own - the ground comes from the height tiles
 * round the camera, the placed objects and the sea as world tiles - only its
 * extent and the look a big extracted map wants (in its ground's colours, the
 * relief scaled to its heights, building edges off).
 */
export function terrainLevel(name: string, stream: TerrainStream): ModelLevel {
  const ix = stream.index;
  const [minX, minZ, maxX, maxZ] = ix.extent;
  const minY = Math.min(ix.heights.min, ix.water?.y ?? Infinity);
  const bounds = { minX, minY, minZ, maxX, maxY: ix.heights.max, maxZ };
  const empty = new Uint32Array(0);
  const base = modelLevelFrom(name, {
    vertices: new Float32Array(0),
    colours: null,
    uvs: null,
    atlas: null,
    indices: empty,
    structureIndices: empty,
    structureEdges: empty,
    waterIndices: empty,
    triangles: 0,
    structureTriangles: ix.instances?.count ? ix.instances.count * 12 : 0,
    waterTriangles: 0,
    sourceTriangles: 0,
    sourceStructureTriangles: 0,
    error: 0,
    partNames: [],
    partClasses: [],
    partReasons: [],
    partRuns: { ground: null, structure: null, water: null, nav: null },
    bounds,
    groundBand: { minY: Math.max(ix.heights.min, ix.water?.y ?? -Infinity), maxY: ix.heights.max },
  });
  return {
    ...base,
    terrain: stream,
    // The ground in its classes' colours (beach, rock, roads ...), as the single-mesh level's texture drew it.
    showTexture: true,
    groundWireOpacity: 0,
    showStructureWire: false,
  };
}

/** Reads a tiled terrain's index and makes its level; `reader` reads the `.bin`. */
export async function openTerrainLevel(name: string, indexText: string, reader: TerrainReader): Promise<ModelLevel> {
  const index = parseTerrainIndex(JSON.parse(indexText));
  return terrainLevel(name, new TerrainStream(index, reader, name));
}
