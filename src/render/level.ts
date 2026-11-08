import type { Bounds, GeoPlacement } from '../state/types';
import type { WorldLabel } from '../world/backdrop';
import type { DcsGroundData } from '../world/dcsGround';

/**
 * Background geometry: the map under the heat.
 *
 * The reference look is a desaturated map with saturated heat on top, and that
 * separation is deliberate — the background has to carry enough detail to locate
 * a hotspot without competing with it for attention. Hence the brightness and
 * saturation controls default low rather than to the source image's own levels.
 */

export type LevelKind = 'none' | 'image' | 'model';

/** A source whose credit a level must carry on screen: see `ModelLevel.credits`. */
export type LevelCredit = 'openfreemap' | 'terrarium' | 'ourairports' | 'mapterhorn' | 'eox' | 'usgs' | 'ign';

/**
 * Ties one image pixel to one world position.
 *
 * Two anchors are enough for the axis-aligned scale-and-offset that game map
 * exports actually need, and they are what a person can realistically read off a
 * map: pick two landmarks, note their in-game coordinates.
 */
export interface MapAnchor {
  /** Pixel coordinates, origin top-left. */
  px: number;
  py: number;
  /** World coordinates on the ground plane. */
  worldX: number;
  worldZ: number;
}

export interface ImageLevel {
  kind: 'image';
  name: string;
  /** Decoded bitmap, ready for upload. */
  bitmap: ImageBitmap;
  width: number;
  height: number;
  anchors: [MapAnchor, MapAnchor];
  /** Height of the map plane in world Y. */
  elevation: number;
  opacity: number;
  /** 0 = original colour, 1 = fully grey. */
  desaturate: number;
  brightness: number;
  flipZ: boolean;
}

/**
 * A level mesh, split into the ground and the things standing on it.
 *
 * The split exists because they want opposite treatments: the ground is a solid
 * surface you read position against, while buildings are mostly in the way of
 * seeing the heat inside them — so structures render as a near-transparent
 * wireframe. One vertex buffer serves both; only the index buffers differ.
 */
export interface ModelLevel {
  kind: 'model';
  name: string;
  /** Interleaved position+normal, ready for a VBO. Shared by every draw below. */
  vertices: Float32Array;
  /**
   * Per-vertex colour from the source file, 3 floats per vertex, or absent.
   *
   * Only a reconstruction export carries this; an engine export has no colour
   * to give. Its own array rather than a fourth field in the interleaved buffer
   * because most levels have none, and widening the stride for all of them
   * would cost a third more memory on the largest thing the viewer loads.
   */
  colours?: Float32Array | null;
  /**
   * Draw the level in its captured colour instead of grey.
   *
   * Off by default, and that default is the point. The viewer's whole look
   * rests on a grey map under saturated heat, so colour in the level competes
   * with the data for attention — see the note on `MESH_FS`. But a scanned
   * racetrack is one flat ribbon flowing into its surroundings, and shading
   * alone does not separate road from verge at any angle. So this is a switch,
   * not a new default: turn it on to find the road, turn it off to read the
   * heat.
   */
  showColours?: boolean;
  /**
   * Per-vertex UV into `atlas`, 2 floats per vertex; -1 marks a vertex with no
   * texture. Absent on untextured levels and on library entries saved before
   * textures existed.
   */
  uvs?: Float32Array | null;
  /**
   * Per-vertex tile number, absent or null when no texture repeats.
   *
   * 0 is a vertex whose UV above is an atlas UV. Any other number is a vertex
   * whose image repeats across its face - a brick wall, a fence - and whose UV
   * is the image's own, unclamped; the shaders wrap it into that tile's
   * rectangle, `tileRects[(n - 1) * 4 ...]`, per pixel. See `planTiling`.
   */
  uvTiles?: Uint16Array | null;
  /** Each tile's x, y, width, height in the atlas; a negative size clamps that axis. */
  tileRects?: Float32Array | null;
  /** Every texture the level carries, packed into one encoded image. */
  atlas?: Blob | null;
  /**
   * Draw the ground with its texture.
   *
   * On by default where a texture exists, which is the opposite of the colour
   * switch above and deliberately so. Colour is a by-product of a scan; a
   * texture is in the file because someone exported it to be seen - an
   * extracted racetrack carries one precisely because geometry alone does not
   * show road from verge from grass. The brightness control still applies,
   * which is how to quieten it under the heat; Desaturate is the map image's
   * control and a 3D level's shader does not read it.
   */
  showTexture?: boolean;
  /** Ground triangles. */
  indices: Uint32Array;
  /**
   * Structure triangles and their edges. Optional so a level with no structures,
   * or one restored from an older library entry, is still a valid level.
   */
  structureIndices?: Uint32Array;
  structureEdges?: Uint32Array;
  /**
   * Water surfaces: lakes, rivers, the sea.
   *
   * Its own set rather than part of the ground, because the two want opposite
   * shading. Water is level by definition, so slope shading has nothing to say
   * about it and a contour line across a lake is nonsense — while the ground
   * needs both to be readable at all. Optional: most levels have no water, and
   * library entries saved before this existed have none recorded.
   */
  waterIndices?: Uint32Array;
  /**
   * Navigation meshes (`nav:walkable`): where one can stand.
   *
   * Never drawn. A nav mesh is draped over the ground it describes, coplanar
   * with it, and drawn as ground the two fight for every pixel - the hard-edged
   * patches, one per nav triangle, that covered the playable area of a textured
   * level. Kept so a click can say whether a spot is walkable.
   */
  navIndices?: Uint32Array;
  triangles: number;
  structureTriangles?: number;
  waterTriangles?: number;
  /** Triangles before simplification, for reporting. */
  sourceTriangles: number;
  sourceStructureTriangles?: number;
  /**
   * Part names and how each was classified, so the guess can be inspected.
   *
   * Optional because entries saved to the library before the ground/structure
   * split existed have no part detail; a missing list must degrade to "no
   * classification to show" rather than crash the panel.
   */
  partNames?: string[];
  partClasses?: Array<'ground' | 'structure' | 'water'>;
  partReasons?: string[];
  /**
   * Which source part each triangle came from, per index set: (part, end)
   * pairs over the set's triangles in order, `end` exclusive, `part` an index
   * into `partNames`.
   *
   * What lets a click on the level say "nav:walkable" rather than just
   * "ground". Null for a set the simplifier rebuilt - its triangles no longer
   * belong to any one part - and absent on library entries, which keep no part
   * detail at all.
   */
  partRuns?: { ground: Uint32Array | null; structure: Uint32Array | null; water: Uint32Array | null; nav?: Uint32Array | null };
  /**
   * Each part's bounding box, six floats (min xyz, max xyz) per part, for
   * naming a click on a simplified set by the smallest box that holds it.
   */
  partBounds?: Float32Array;
  bounds: Bounds;
  /**
   * The open data a world backdrop was built from (src/world), whose credit the
   * canvas shows for as long as the level is shown. Absent on every other level.
   */
  credits?: LevelCredit[];
  /**
   * Where a world backdrop sits on the earth: the plane it was built on and
   * the axis mapping it went through. Data on another reference moves it
   * (src/world/reproject). Absent on every other level.
   */
  placement?: GeoPlacement;
  /** A world backdrop's place names (towns, airfields), written over the view. */
  labels?: WorldLabel[];
  /**
   * A streamed theatre: its ground comes as tiles round the camera
   * (src/world/stream), and these are the options they are built with.
   * Absent on a backdrop built once.
   */
  stream?: { theatre: string; runways: boolean; imagery: boolean; dcs?: DcsGroundData | null };

  // Ground appearance.
  opacity: number;
  desaturate: number;
  brightness: number;

  // Structure appearance. Transparent, so you can see the data inside a
  // building, but solid enough to read as a volume — once heat is correctly
  // hidden behind geometry, a nearly invisible wall blocking it looks like the
  // heat vanishing for no reason. Optional so a partially-specified level still
  // renders, using the fallbacks in `structureDraw`.
  structureOpacity?: number;
  structureWireOpacity?: number;
  /** Wireframe tint, sRGB 0..1. */
  structureTint?: [number, number, number];
  showStructureFaces?: boolean;
  showStructureWire?: boolean;
  /**
   * Shade structures by their face normals rather than their vertex normals.
   *
   * An exported level is welded: one vertex where the eight triangles of a box
   * corner meet, and no normals in the file, so the only normal the viewer can
   * derive is the average of everything meeting at that point. That rounds off
   * every corner of every box, and a city of boxes reads as melted foil — which
   * looks exactly like the exporter having produced bad geometry, and is not.
   */
  flatStructures?: boolean;
  /**
   * Draw structures solid, in their own texture and colour, instead of as a
   * tinted shell.
   *
   * For a level whose structures were exported with textures - an extracted
   * racetrack's kerbs, guardrails, tyre walls and signs, which are not
   * buildings to see heat inside but the edges of the track the heat runs
   * between. A shell tinted cyan says "something is here"; the armco's own
   * grey and the tyre wall's own paint say what. Off, or absent, keeps the shell,
   * so a level saved before this existed looks as it did.
   */
  structureTexture?: boolean;
  /**
   * The structure parts carry their own colours per vertex (a level extracted
   * with each object's paint, COLOR_0): `structureTexture` then draws them in
   * those colours even without a texture.
   */
  structureColours?: boolean;
  /** Water appearance. Flat-shaded on purpose; see `waterDraw`. Unset is `DEFAULT_WATER_OPACITY`. */
  waterOpacity?: number;
  waterTint?: [number, number, number];
  showWater?: boolean;
  /** Draw the ground as wireframe too, for a fully schematic look. */
  wireframe: boolean;
  /**
   * Opacity of the ground's triangle edges, drawn on top of the shaded ground.
   *
   * Distinct from `wireframe`, which replaces the surface. Overlaying is what
   * makes a traced terrain readable — you can see the shape *and* how coarsely
   * it was sampled, and the surface still occludes the heat behind it.
   */
  groundWireOpacity?: number;

  /**
   * Relief cues for the ground. Every field optional and filled in by
   * `reliefDraw` from the level's own height range, so a level restored from the
   * library before these existed still gets sensible ones.
   */
  relief?: {
    slope?: number;
    contourSpacing?: number;
    contourStrength?: number;
    contourIndexEvery?: number;
    elevationRange?: number;
    lowY?: number;
    highY?: number;
  };
}

export type Level = ImageLevel | ModelLevel;

/**
 * How much relief the ground shows, with defaults derived from the level itself.
 *
 * The contour interval is the part that cannot be a fixed number: 10m lines are
 * right for a hillside and useless on a 2m-deep quarry floor or a 900m mountain.
 * So it comes from the level's own height range, rounded to something a person
 * would choose, and every field stays overridable.
 */
export function reliefDraw(level: ModelLevel): {
  slope: number;
  contourSpacing: number;
  contourStrength: number;
  contourIndexEvery: number;
  elevationRange: number;
  lowY: number;
  highY: number;
} {
  const lowY = level.relief?.lowY ?? level.bounds.minY;
  const highY = level.relief?.highY ?? level.bounds.maxY;
  return {
    slope: level.relief?.slope ?? 0.55,
    contourSpacing: level.relief?.contourSpacing ?? niceContourSpacing(highY - lowY),
    contourStrength: level.relief?.contourStrength ?? 0.35,
    contourIndexEvery: level.relief?.contourIndexEvery ?? 5,
    elevationRange: level.relief?.elevationRange ?? 0.5,
    lowY,
    highY,
  };
}

/**
 * A contour interval that puts roughly forty lines across the level's height.
 *
 * Rounded to a 1/2/5 x 10^n step, the same way a map legend would: 25m, not
 * 23.7m. Forty lines is dense enough to show a shallow slope and sparse enough
 * not to fill a cliff face with black.
 */
export function niceContourSpacing(heightRange: number): number {
  const target = Math.max(1e-3, heightRange) / 40;
  const power = Math.pow(10, Math.floor(Math.log10(target)));
  const scaled = target / power;
  const step = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10;
  return step * power;
}

/**
 * Structure appearance with defaults filled in.
 *
 * Every field is optional on the level so a partially-specified or
 * older-generation level still renders; resolving them in one place keeps that
 * tolerance out of the renderers.
 */
/**
 * Whether any structure triangle carries a texture.
 *
 * Decides how a freshly imported level's structures start out: an extracted
 * racetrack's guardrails and tyre walls come with their own textures and want to
 * be seen in them, while a city exported as grey boxes wants the shell. A vertex
 * with no texture has its UV set to -1; one textured vertex is enough. A tiled
 * vertex is textured whatever its UV, which may well be negative.
 */
export function structuresTextured(
  structureIndices: Uint32Array | undefined,
  uvs: Float32Array | null | undefined,
  uvTiles?: Uint16Array | null,
): boolean {
  if (!structureIndices || !uvs) return false;
  for (let i = 0; i < structureIndices.length; i++) {
    const v = structureIndices[i];
    if (uvs[v * 2] >= 0 || (uvTiles && uvTiles[v] > 0)) return true;
  }
  return false;
}

/** Whether the structure parts have colours of their own: some structure vertex not white (colours x, y, z per vertex). */
export function structuresColoured(structureIndices: Uint32Array | undefined, colours: Float32Array | null | undefined): boolean {
  if (!structureIndices || !colours) return false;
  const step = Math.max(1, Math.floor(structureIndices.length / 20000));
  for (let i = 0; i < structureIndices.length; i += step) {
    const o = structureIndices[i] * 3;
    if (colours[o] < 0.98 || colours[o + 1] < 0.98 || colours[o + 2] < 0.98) return true;
  }
  return false;
}

export function structureDraw(level: ModelLevel): {
  faceOpacity: number;
  wireOpacity: number;
  tint: [number, number, number];
  showFaces: boolean;
  showWire: boolean;
  flat: boolean;
  textured: boolean;
} {
  const hasStructures = (level.structureIndices?.length ?? 0) > 0;
  return {
    textured: level.structureTexture === true && ((!!level.uvs && !!level.atlas) || (level.structureColours === true && !!level.colours)),
    faceOpacity: level.structureOpacity ?? 0.25,
    wireOpacity: level.structureWireOpacity ?? 0.5,
    tint: level.structureTint ?? [0.35, 0.85, 1],
    showFaces: hasStructures && (level.showStructureFaces ?? true),
    showWire:
      (level.structureEdges?.length ?? 0) > 0 && (level.showStructureWire ?? true),
    // On by default. Every exported level is welded, and an imported OBJ or PLY
    // that shipped its own split normals is unaffected — its faces already have
    // one normal each, so taking that normal from the derivatives instead
    // returns the same answer.
    flat: level.flatStructures ?? true,
  };
}

/**
 * How opaque water is until someone moves its slider. One figure for the slider
 * and the renderer both, so what the panel shows is what is drawn; why 60% is in
 * `waterDraw`.
 */
export const DEFAULT_WATER_OPACITY = 0.6;

/**
 * How water is drawn: flat, plain, and slightly cool.
 *
 * Deliberately the shading the ground used to have and no longer does. Relief
 * cues exist to make terrain legible — slope darkening, contour lines, an
 * elevation ramp — and every one of them is either meaningless or actively wrong
 * on a surface that is level by definition: nothing to darken, no height for a
 * contour to follow, one value for the whole ramp. A flat lambert plane reads
 * correctly as still water, which is why the old look was described as "fine for
 * the water" at the same moment it was rejected for the ground.
 *
 * More opaque than structures, which are glass so the heat inside shows, but not
 * opaque: the reason is with the opacity below.
 */
export function waterDraw(level: ModelLevel): {
  opacity: number;
  tint: [number, number, number];
  show: boolean;
} {
  return {
    // Not opaque. An ocean plane covers everything below sea level, and on a
    // coastal map that is a large part of the terrain — the seabed, the beaches,
    // the harbour floor. Hiding it entirely is what real water does and the wrong
    // answer for a map you are reading positions off: at 60% the coastline and
    // the ground under the shallows still show through, and the surface still
    // reads unmistakably as water.
    opacity: level.waterOpacity ?? DEFAULT_WATER_OPACITY,
    // Just off grey. The level is drawn desaturated so the heat is the only
    // saturated thing on screen, and a vivid blue lake would compete with it —
    // but water that is exactly the same grey as the ground is invisible, which
    // is the state this started from.
    tint: level.waterTint ?? [0.55, 0.72, 0.86],
    show: (level.waterIndices?.length ?? 0) > 0 && (level.showWater ?? true),
  };
}

/**
 * Whether two levels would upload the same thing to the GPU.
 *
 * A level setting (a face opacity, a contour spacing) makes a new level object around the
 * same arrays, and only the geometry is ever uploaded: settings reach the renderer every
 * frame. Uploading again for one cost 3.6 s per slider step on a level of 24M triangles,
 * most of it rebuilding the ground's edges.
 */
export function sameLevelUpload(a: Level | null, b: Level | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.kind === 'image') return b.kind === 'image' && a.bitmap === b.bitmap;
  if (b.kind !== 'model') return false;
  return (
    a.vertices === b.vertices &&
    a.indices === b.indices &&
    a.colours === b.colours &&
    a.uvs === b.uvs &&
    a.uvTiles === b.uvTiles &&
    a.tileRects === b.tileRects &&
    a.atlas === b.atlas &&
    a.structureIndices === b.structureIndices &&
    a.structureEdges === b.structureEdges &&
    a.waterIndices === b.waterIndices
  );
}

/**
 * Line-list indices for a wireframe over `indices`.
 *
 * Shared edges are emitted once. Without deduplication a closed mesh yields two
 * lines per edge, which both doubles the geometry and makes every edge visibly
 * denser than it should be once the lines are translucent.
 *
 * Lives here rather than beside the classifier because both the ground and the
 * structures need it, and the ground's is built on demand in the renderer: a
 * level is usually looked at shaded, and paying a million Set operations at load
 * time for a toggle nobody turned on is not worth it.
 */
export function buildEdgeList(indices: Uint32Array): Uint32Array {
  const triangles = Math.floor(indices.length / 3);
  if (triangles === 0) return new Uint32Array(0);

  // Sorted keys rather than a Set, because a Set cannot hold this many.
  //
  // The obvious version — pack each edge into a number, dedupe through a
  // `Set<number>`, push survivors into an array — worked until an export got
  // large enough to matter and then failed outright with "Set maximum size
  // exceeded". V8 caps a Set at 2^24 entries, about 16.7 million, and a mesh has
  // three edges per triangle before deduplication: any structure mesh past
  // roughly five and a half million triangles hits the wall. It took a 463 MB
  // export to reach it, and the whole level then refused to load rather than
  // degrading, which is the worst way for a limit to be discovered.
  //
  // Sorting has no such ceiling and a flat cost: one typed array of keys, one
  // sort, one pass to emit runs. It also drops the boxed `number[]`, which for
  // fifteen million edges was several hundred megabytes of doubles on its own.
  const keys = new Float64Array(triangles * 3);
  let n = 0;
  const add = (a: number, b: number) => {
    const lo = a < b ? a : b;
    const hi = a < b ? b : a;
    // Pack the pair into one number; exact for indices below 2^26, which is far
    // more than a level mesh's vertex count will ever reach.
    keys[n++] = lo * 67108864 + hi;
  };
  for (let i = 0; i + 2 < indices.length; i += 3) {
    add(indices[i], indices[i + 1]);
    add(indices[i + 1], indices[i + 2]);
    add(indices[i + 2], indices[i]);
  }

  const packed = keys.subarray(0, n);
  packed.sort();
  let unique = 0;
  for (let i = 0; i < n; i++) {
    if (i === 0 || packed[i] !== packed[i - 1]) unique++;
  }
  const out = new Uint32Array(unique * 2);
  let w = 0;
  for (let i = 0; i < n; i++) {
    if (i > 0 && packed[i] === packed[i - 1]) continue;
    const key = packed[i];
    const lo = Math.floor(key / 67108864);
    out[w++] = lo;
    out[w++] = key - lo * 67108864;
  }
  return out;
}

/** World-space rectangle a map image covers. */
export interface MapQuad {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  y: number;
  /** True when the pixel-to-world mapping is degenerate. */
  degenerate: boolean;
}

/**
 * Solve the two anchors for the image's world footprint.
 *
 * Degenerate anchors (same pixel column or row) cannot determine a scale, so
 * they are reported rather than producing an infinity that would put the map
 * geometry at NaN and take the whole frame with it.
 */
export function mapQuadFromAnchors(level: ImageLevel): MapQuad {
  const [a, b] = level.anchors;
  const dpx = b.px - a.px;
  const dpy = b.py - a.py;
  const degenerate = Math.abs(dpx) < 1e-6 || Math.abs(dpy) < 1e-6;
  if (degenerate) {
    return { minX: -1, maxX: 1, minZ: -1, maxZ: 1, y: level.elevation, degenerate: true };
  }

  const scaleX = (b.worldX - a.worldX) / dpx;
  const scaleZ = (b.worldZ - a.worldZ) / dpy;
  // World position of pixel (0,0) and of (width,height).
  const x0 = a.worldX - a.px * scaleX;
  const x1 = x0 + level.width * scaleX;
  const z0 = a.worldZ - a.py * scaleZ;
  const z1 = z0 + level.height * scaleZ;

  return {
    minX: Math.min(x0, x1),
    maxX: Math.max(x0, x1),
    minZ: Math.min(z0, z1),
    maxZ: Math.max(z0, z1),
    y: level.elevation,
    degenerate: false,
  };
}

/**
 * Anchors that stretch the image across the data's own footprint.
 *
 * The common case by a wide margin: someone has a map screenshot and the
 * telemetry that goes with it, and no interest in typing coordinates. Getting it
 * roughly right immediately and offering the anchors for correction beats
 * demanding the anchors first.
 */
export function anchorsFromBounds(
  width: number,
  height: number,
  bounds: Bounds,
  flipZ: boolean,
): [MapAnchor, MapAnchor] {
  const z0 = flipZ ? bounds.maxZ : bounds.minZ;
  const z1 = flipZ ? bounds.minZ : bounds.maxZ;
  return [
    { px: 0, py: 0, worldX: bounds.minX, worldZ: z0 },
    { px: width, py: height, worldX: bounds.maxX, worldZ: z1 },
  ];
}

/** Metres per pixel, for showing the user the implied scale. */
export function mapScale(level: ImageLevel): { x: number; z: number } {
  const q = mapQuadFromAnchors(level);
  return {
    x: (q.maxX - q.minX) / Math.max(1, level.width),
    z: (q.maxZ - q.minZ) / Math.max(1, level.height),
  };
}

/**
 * Decode an image file, downscaling anything the GPU cannot hold.
 *
 * Map exports are routinely 8k or 16k squares; a texture larger than
 * MAX_TEXTURE_SIZE fails to allocate rather than degrading, so the resize
 * happens here where it can be reported.
 */
export async function decodeMapImage(
  file: File,
  maxSize: number,
): Promise<{ bitmap: ImageBitmap; scaled: boolean; sourceWidth: number; sourceHeight: number }> {
  const probe = await createImageBitmap(file);
  const { width, height } = probe;
  const longest = Math.max(width, height);
  if (longest <= maxSize) {
    return { bitmap: probe, scaled: false, sourceWidth: width, sourceHeight: height };
  }
  const k = maxSize / longest;
  const resized = await createImageBitmap(probe, {
    resizeWidth: Math.max(1, Math.round(width * k)),
    resizeHeight: Math.max(1, Math.round(height * k)),
    resizeQuality: 'high',
  });
  probe.close();
  return { bitmap: resized, scaled: true, sourceWidth: width, sourceHeight: height };
}

