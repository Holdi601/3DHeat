/// <reference lib="webworker" />
import { buildWireframe, classifyParts, setOfPart, splitByClass, type PartClass } from './classify';
import { buildAtlas, type BuiltAtlas } from './atlas';
import { parseModel, type MeshBounds } from './modelParse';
import { errorMsg, msg, type Msg } from './msg';
import { buildRemap, compactGeometry, simplifyIndices, STRUCTURE_BUDGET_SHARE } from './simplify';

/**
 * Model parsing, classification and simplification, off the main thread.
 *
 * A multi-million-triangle level takes seconds to parse and seconds more to
 * decimate. On the main thread that is a frozen viewport for the whole duration;
 * here the heat keeps rendering while a progress line moves.
 *
 * Progress, errors and the classifier's reasons go back as messages (see
 * msg.ts): a worker has no language, the model loader says them in the viewer's.
 */

export interface ModelRequest {
  id: number;
  file: File;
  /** Total triangle budget, split between ground and structures. */
  targetTriangles: number;
  /** Overrides for parts the classifier got wrong, by part name. */
  overrides?: Record<string, PartClass>;
}

export type ModelResponse =
  | { id: number; kind: 'progress'; label: Msg; fraction: number | null }
  | {
      id: number;
      kind: 'done';
      vertices: Float32Array;
      /**
       * Per-vertex colour, or null when the source file carried none.
       *
       * Only reconstruction exports have it; an engine export has no colour to
       * give, and a level with none must stay null rather than become white, so
       * the viewer can tell "no colour" from "white colour" and grey the toggle
       * out instead of offering a switch that does nothing.
       */
      colours: Float32Array | null;
      /**
       * Per-vertex UV into `atlas`, -1 where untextured; null with no texture.
       * A tiled vertex's UV is its image's own instead - see `uvTiles`.
       */
      uvs: Float32Array | null;
      /** Per-vertex tile number, 0 where the UV is an atlas UV; null when nothing tiles. */
      uvTiles: Uint16Array | null;
      /** Each tile's rectangle in the atlas, four floats; null when nothing tiles. */
      tileRects: Float32Array | null;
      /** Every texture the file carried, packed into one encoded image. */
      atlas: Blob | null;
      groundIndices: Uint32Array;
      structureIndices: Uint32Array;
      structureEdges: Uint32Array;
      waterIndices: Uint32Array;
      /** Navigation meshes, not drawn: see `NAV_PART`. */
      navIndices: Uint32Array;
      groundTriangles: number;
      structureTriangles: number;
      waterTriangles: number;
      sourceGroundTriangles: number;
      sourceStructureTriangles: number;
      error: number;
      bounds: MeshBounds;
      /**
       * Height range of the *ground* alone.
       *
       * Distinct from the level's bounds, and the difference is the whole point:
       * on a real map the bounds include 600m of towers over 200m of terrain, so
       * a contour interval derived from them is nine times too coarse and no
       * lines appear at all. The ground's own range is what the relief cues have
       * to be scaled to.
       */
      groundBand: { minY: number; maxY: number };
      partNames: string[];
      partClasses: PartClass[];
      partReasons: Msg[];
      /** Which part each triangle came from, per set; see `ModelLevel.partRuns`. */
      partRuns: { ground: Uint32Array | null; structure: Uint32Array | null; water: Uint32Array | null; nav: Uint32Array | null };
      /** Each part's box, six floats (min xyz, max xyz); see `ModelLevel.partBounds`. */
      partBounds: Float32Array;
    }
  | { id: number; kind: 'error'; message: Msg | string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = async (ev: MessageEvent<ModelRequest>) => {
  const { id, file, targetTriangles, overrides } = ev.data;
  const post = (r: ModelResponse, transfer?: Transferable[]) =>
    transfer ? ctx.postMessage(r, transfer) : ctx.postMessage(r);

  try {
    post({ id, kind: 'progress', label: msg('data.modelWorker.parsing', { file: file.name }), fraction: null });
    const raw = await parseModel(file);

    // Textures are packed before anything is simplified or compacted, so that
    // from here on a textured level is just one more per-vertex array riding
    // along with the colours.
    let atlas: BuiltAtlas | null = null;
    if (raw.images?.length) {
      post({
        id,
        kind: 'progress',
        label: msg('data.modelWorker.packing', { count: raw.images.length }),
        fraction: null,
      });
      atlas = await buildAtlas(raw.uvs, raw.imageOf, raw.images);
    }

    post({
      id,
      kind: 'progress',
      label: msg('data.modelWorker.classifying', { count: raw.parts.length }),
      fraction: null,
    });
    const classification = classifyParts(raw);
    const classes = raw.parts.map(
      (p, i) => overrides?.[p.name] ?? classification.classes[i],
    );
    const split = splitByClass(raw, classes);
    const sourceGround = split.groundIndices.length / 3;
    const sourceStructure = split.structureIndices.length / 3;

    // Structures take the larger share: they are the many-small-objects half of
    // a level and lose their shape fastest under decimation.
    const structureBudget = Number.isFinite(targetTriangles)
      ? targetTriangles * STRUCTURE_BUDGET_SHARE
      : Infinity;
    const groundBudget = Number.isFinite(targetTriangles)
      ? targetTriangles * (1 - STRUCTURE_BUDGET_SHARE)
      : Infinity;

    post({
      id,
      kind: 'progress',
      label: msg('data.modelWorker.simplifyingGround', { count: sourceGround }),
      fraction: null,
    });
    const ground = await simplifyIndices(
      raw.vertices,
      split.groundIndices,
      groundBudget,
      undefined,
      atlas?.uvs,
      atlas?.uvTiles,
    );

    post({
      id,
      kind: 'progress',
      label: msg('data.modelWorker.simplifyingStructures', { count: sourceStructure }),
      fraction: null,
    });
    const structure = await simplifyIndices(
      raw.vertices,
      split.structureIndices,
      structureBudget,
      undefined,
      atlas?.uvs,
      atlas?.uvTiles,
    );

    post({ id, kind: 'progress', label: msg('data.modelWorker.wireframe'), fraction: null });
    const edges = buildWireframe(structure.indices);

    // Water is never decimated. A lake is a fan of eight triangles and a river a
    // strip of seventy, so the whole of it on a large map is a few thousand —
    // less than a rounding error against the ground, and there is nothing in a
    // flat polygon for a simplifier to remove without deleting the polygon.
    const waterIndices0 = split.waterIndices;
    // Nor is the navigation mesh, which is never drawn and only met by clicks.
    const navIndices0 = split.navIndices;

    // Every index set addresses one shared vertex buffer, so compaction has to
    // consider them together or one group's vertices would be discarded.
    const atWater = ground.indices.length + structure.indices.length;
    const atNav = atWater + waterIndices0.length;
    const combined = new Uint32Array(atNav + navIndices0.length);
    combined.set(ground.indices, 0);
    combined.set(structure.indices, ground.indices.length);
    combined.set(waterIndices0, atWater);
    combined.set(navIndices0, atNav);
    const packed = compactGeometry(raw.vertices, combined, raw.colours, atlas?.uvs, atlas?.uvTiles);
    const groundIndices = packed.indices.slice(0, ground.indices.length);
    const structureIndices = packed.indices.slice(ground.indices.length, atWater);
    const waterIndices = packed.indices.slice(atWater, atNav);
    const navIndices = packed.indices.slice(atNav);
    // The wireframe references the same vertices, so remap it the same way.
    const remapForEdges = buildRemap(combined, packed.indices);

    // Which part each triangle came from, for naming what a click hit. Only for
    // a set the simplifier left alone: `splitByClass` lays each class's parts
    // end to end in file order and compaction keeps the triangle order, so the
    // set's triangles are still runs of whole parts. A simplified set is one
    // new mesh with no such runs, and is named from the part boxes instead.
    const runsOf = (set: ReturnType<typeof setOfPart>, kept: boolean): Uint32Array | null => {
      if (!kept) return null;
      const out: number[] = [];
      let end = 0;
      raw.parts.forEach((part, i) => {
        if (setOfPart(part.name, classes[i]) !== set || part.count === 0) return;
        end += part.count / 3;
        out.push(i, end);
      });
      return new Uint32Array(out);
    };
    const partRuns = {
      ground: runsOf('ground', ground.skipped),
      structure: runsOf('structure', structure.skipped),
      water: runsOf('water', true),
      nav: runsOf('nav', true),
    };
    const partBounds = new Float32Array(raw.parts.length * 6);
    raw.parts.forEach((part, i) => {
      const b = part.bounds;
      partBounds.set([b.minX, b.minY, b.minZ, b.maxX, b.maxY, b.maxZ], i * 6);
    });
    const structureEdges = new Uint32Array(edges.length);
    for (let i = 0; i < edges.length; i++) {
      const to = edges[i] < remapForEdges.length ? remapForEdges[edges[i]] : -1;
      structureEdges[i] = to >= 0 ? to : 0;
    }

    post(
      {
        id,
        kind: 'done',
        vertices: packed.vertices,
        colours: packed.colours,
        uvs: packed.uvs,
        uvTiles: packed.uvTiles,
        tileRects: packed.uvTiles ? (atlas?.tileRects ?? null) : null,
        atlas: atlas?.atlas ?? null,
        groundIndices,
        structureIndices,
        structureEdges,
        waterIndices,
        navIndices,
        groundTriangles: groundIndices.length / 3,
        structureTriangles: structureIndices.length / 3,
        waterTriangles: waterIndices.length / 3,
        sourceGroundTriangles: sourceGround,
        sourceStructureTriangles: sourceStructure,
        error: Math.max(ground.error, structure.error),
        bounds: raw.bounds,
        groundBand: heightBand(packed.vertices, groundIndices),
        partNames: raw.parts.map((p) => p.name),
        partClasses: classes,
        partReasons: classification.why,
        partRuns,
        partBounds,
      },
      [
        packed.vertices.buffer,
        ...(packed.colours ? [packed.colours.buffer] : []),
        ...(packed.uvs ? [packed.uvs.buffer] : []),
        ...(packed.uvTiles ? [packed.uvTiles.buffer] : []),
        groundIndices.buffer,
        structureIndices.buffer,
        structureEdges.buffer,
        waterIndices.buffer,
        navIndices.buffer,
      ],
    );
  } catch (err) {
    post({ id, kind: 'error', message: errorMsg(err) });
  }
};

/**
 * Height range spanned by the vertices these indices address.
 *
 * Walked over the indices rather than the whole vertex buffer, because ground and
 * structures share one buffer and the answer wanted here is the ground's alone.
 * Stride is 6 floats: position then normal.
 */
function heightBand(vertices: Float32Array, indices: Uint32Array): { minY: number; maxY: number } {
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < indices.length; i++) {
    const y = vertices[indices[i] * 6 + 1];
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return Number.isFinite(minY) ? { minY, maxY } : { minY: 0, maxY: 1 };
}
