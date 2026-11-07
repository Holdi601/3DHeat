import type { MeshPart, RawMesh } from './modelParse';
import { msg, say, type Msg } from './msg';

/**
 * Split a level mesh into the ground and the things standing on it.
 *
 * They want different treatment: the ground is context you read position
 * against, while buildings mostly get in the way of seeing heat inside them —
 * hence a near-transparent wireframe for structures and a solid surface for the
 * ground. Doing that split needs a decision per part, and there is no single
 * reliable signal, so this combines two:
 *
 * - The name the exporter gave the part. Strongest signal when it exists;
 *   "Terrain", "Landscape_01", "ground_mesh" are unambiguous.
 * - Geometry. Terrain is a small number of very large, mostly-upward-facing
 *   polygons spanning most of the map; a house is many small polygons over a
 *   small footprint with walls. Area-weighted up-facing ratio plus footprint
 *   coverage separates them well.
 *
 * Everything is overridable in the UI, because a level whose parts are all
 * called `mesh_042` cannot be classified by any heuristic.
 */

/**
 * An exporter that already knows the answer, saying so.
 *
 * Inside a game engine the landscape is a different class from a building —
 * there is nothing to infer. The level exporters in `exporters/` therefore name
 * each part `ground:<map>` or `structure:<map>`, and a part labelled that way is
 * taken at its word rather than run past heuristics that can only be less
 * certain. Anything else falls through to the name lists and the geometry.
 */
const EXPLICIT_CLASS = /^(ground|structure|water)\s*[:|]/i;

const GROUND_NAMES = [
  /terrain/i,
  /landscape/i,
  /^ground/i,
  /_ground/i,
  /heightmap/i,
  /^floor/i,
  /^map(_|$)/i,
  /^base(_|$)/i,
  /road|street|pavement|sidewalk/i,
];

// Flat, not walkable, and shaded without terrain cues. Named separately from the
// ground because a contour line across a lake is nonsense and slope shading has
// nothing to say about a surface that is level by definition.
const WATER_NAMES = [
  // "water" as the thing, not as a prefix on a building. A water tower is a
  // tower, and a house called Riverside is a house — which is why the second
  // pattern requires a word boundary after the noun rather than matching
  // anywhere in the name.
  /(^|[_\W])water(?!tower|tank|mill|front|fall|pump|pipe)/i,
  /(^|[_\W])(ocean|sea|lake|pond|lagoon|river)(?![a-z])/i,
];

const STRUCTURE_NAMES = [
  /house|building|bldg/i,
  /wall|roof|door|window|stair/i,
  /prop|asset|clutter|debris/i,
  /crate|barrel|fence|tree|rock|bush/i,
  /vehicle|car|truck|tank/i,
  /bridge|tower|silo|hangar|bunker/i,
];

export type PartClass = 'ground' | 'structure' | 'water';

export interface Classification {
  /** Decision per part, parallel to `RawMesh.parts`. */
  classes: PartClass[];
  /** How each decision was reached, for the UI to show. */
  reasons: string[];
  /** The same as messages, for the main thread to say in its language (this runs in a worker). */
  why: Msg[];
  groundTriangles: number;
  structureTriangles: number;
  waterTriangles: number;
}

/**
 * Decide ground vs structure for every part.
 *
 * When nothing is named and the geometry is ambiguous, everything becomes
 * ground — a solid grey level is a reasonable thing to look at, whereas
 * defaulting to transparent wireframe would make the whole scene nearly
 * invisible and look broken.
 */
export function classifyParts(mesh: RawMesh): Classification {
  const { parts, bounds } = mesh;
  const mapArea = Math.max(
    1e-6,
    (bounds.maxX - bounds.minX) * (bounds.maxZ - bounds.minZ),
  );
  const mapHeight = Math.max(1e-6, bounds.maxY - bounds.minY);

  const classes: PartClass[] = [];
  const why: Msg[] = [];
  let groundTriangles = 0;
  let structureTriangles = 0;
  let waterTriangles = 0;

  for (const part of parts) {
    const decision = classifyOne(part, mapArea, mapHeight);
    classes.push(decision.cls);
    why.push(decision.why);
    if (decision.cls === 'water') waterTriangles += part.count / 3;
    else if (decision.cls === 'ground') groundTriangles += part.count / 3;
    else structureTriangles += part.count / 3;
  }

  // A model that came in as one unnamed blob cannot be split, and calling the
  // whole thing structure would render the level as a faint wireframe ghost.
  if (structureTriangles > 0 && groundTriangles === 0 && parts.length === 1) {
    classes[0] = 'ground';
    why[0] = msg('data.classify.singleMesh');
    groundTriangles = structureTriangles;
    structureTriangles = 0;
  }

  return { classes, reasons: why.map(say), why, groundTriangles, structureTriangles, waterTriangles };
}

function classifyOne(
  part: MeshPart,
  mapArea: number,
  mapHeight: number,
): { cls: PartClass; why: Msg } {
  // Reported as ground, which is what it lies on; `splitByClass` keeps it out
  // of what is drawn.
  if (NAV_PART.test(part.name)) return { cls: 'ground', why: msg('data.classify.navigation') };
  const explicit = EXPLICIT_CLASS.exec(part.name);
  if (explicit) {
    const cls = explicit[1].toLowerCase() as PartClass;
    return { cls, why: msg('data.classify.exporter') };
  }

  for (const p of WATER_NAMES) {
    if (p.test(part.name)) return { cls: 'water', why: msg('data.classify.nameMatches', { pattern: p.source }) };
  }
  for (const p of GROUND_NAMES) {
    if (p.test(part.name)) return { cls: 'ground', why: msg('data.classify.nameMatches', { pattern: p.source }) };
  }
  for (const p of STRUCTURE_NAMES) {
    if (p.test(part.name)) return { cls: 'structure', why: msg('data.classify.nameMatches', { pattern: p.source }) };
  }

  const footprint =
    (part.bounds.maxX - part.bounds.minX) * (part.bounds.maxZ - part.bounds.minZ);
  const coverage = footprint / mapArea;
  const relHeight = (part.bounds.maxY - part.bounds.minY) / mapHeight;

  // Spans most of the map and faces upward: that is the ground.
  if (coverage > 0.25 && part.upFacing > 0.6) {
    return {
      cls: 'ground',
      why: msg('data.classify.covers', {
        coverage: { num: coverage * 100, digits: 0 },
        up: { num: part.upFacing * 100, digits: 0 },
      }),
    };
  }
  // Tall relative to the level, or predominantly vertical surfaces: a structure.
  if (part.upFacing < 0.45 || (relHeight > 0.15 && coverage < 0.1)) {
    return {
      cls: 'structure',
      why: msg('data.classify.tall', {
        up: { num: part.upFacing * 100, digits: 0 },
        height: { num: relHeight * 100, digits: 0 },
      }),
    };
  }
  return { cls: 'ground', why: msg('data.classify.ambiguous') };
}

export interface SplitGeometry {
  groundIndices: Uint32Array;
  structureIndices: Uint32Array;
  waterIndices: Uint32Array;
  /** Navigation meshes: kept, but not drawn. See `NAV_PART`. */
  navIndices: Uint32Array;
}

/**
 * A navigation mesh, named so by the exporter (`nav:walkable`).
 *
 * Not ground, whatever its geometry says: it is draped over the ground it
 * describes, coplanar with it to within centimetres, and drawn as ground the two
 * surfaces fight for every pixel - which on a textured level reads as hard-edged
 * grey and beige patches, one per nav triangle, over the whole playable area.
 * So it is kept apart and not drawn; a click still meets it, which is where
 * "can one stand here" is worth knowing.
 */
export const NAV_PART = /^nav\s*[:|]/i;

/** Which index set a part's triangles go to: its class, or the navigation set. */
export function setOfPart(name: string, cls: PartClass | undefined): 'ground' | 'structure' | 'water' | 'nav' {
  if (NAV_PART.test(name)) return 'nav';
  // Anything not explicitly water or structure is ground, matching
  // `classifyOne`'s default: a solid grey level is a reasonable thing to look at.
  return cls === 'water' || cls === 'structure' ? cls : 'ground';
}

/** Gather each class's triangles into its own index buffer. */
export function splitByClass(mesh: RawMesh, classes: PartClass[]): SplitGeometry {
  const counts = { ground: 0, structure: 0, water: 0, nav: 0 };
  const setOf = (i: number) => setOfPart(mesh.parts[i].name, classes[i]);
  mesh.parts.forEach((part, i) => {
    counts[setOf(i)] += part.count;
  });

  const out = {
    ground: new Uint32Array(counts.ground),
    structure: new Uint32Array(counts.structure),
    water: new Uint32Array(counts.water),
    nav: new Uint32Array(counts.nav),
  };
  const at = { ground: 0, structure: 0, water: 0, nav: 0 };
  mesh.parts.forEach((part, i) => {
    const set = setOf(i);
    out[set].set(mesh.indices.subarray(part.start, part.start + part.count), at[set]);
    at[set] += part.count;
  });
  return {
    groundIndices: out.ground,
    structureIndices: out.structure,
    waterIndices: out.water,
    navIndices: out.nav,
  };
}

/**
 * Line-list indices for a wireframe over `indices`.
 *
 * The implementation lives in `render/level.ts`, because the renderer needs the
 * same thing for the ground on demand; re-exported here so the structure path
 * and its tests keep reading as one thing.
 */
export { buildEdgeList as buildWireframe } from '../render/level';
