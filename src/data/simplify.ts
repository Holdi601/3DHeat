import { MeshoptSimplifier } from 'meshoptimizer/simplifier';
import type { RawMesh } from './modelParse';
import { msg, MsgError, say, sayingTable } from './msg';

/**
 * Mesh decimation for level backgrounds.
 *
 * Level geometry from a game export routinely runs to millions of triangles,
 * which is memory and frame time spent on something that is meant to be a
 * backdrop. meshoptimizer's edge-collapse simplifier is used rather than a
 * hand-rolled one because quadric error metrics are what keep silhouettes and
 * hard edges intact — naive vertex clustering at these ratios turns architecture
 * into pudding, which is exactly the "catastrophic" outcome to avoid.
 */

export type LodPreset = 'full' | 'high' | 'medium' | 'low' | 'silhouette';

/**
 * Target triangle budget per preset.
 *
 * These were an order of magnitude too mean, and the way that failed is worth
 * recording because it was invisible from inside the code. A level exported at
 * 3.6M triangles arrived, `suggestLod` picked `low`, and the viewer quietly
 * decimated it *thirty-fold* to 120k — at which point a hundred thousand
 * building volumes share fewer triangles than they have corners, so every one of
 * them collapses to a sliver, the traced ground loses its shape, and the whole
 * map reads as randomly placed debris. It looks exactly like a broken exporter.
 * Every screenshot taken while developing the exporter used `full`, so the
 * failure never appeared in one.
 *
 * A background mesh is cheap on any GPU that can run this tool at all — it is
 * static geometry drawn once per frame, against millions of heat sprites drawn
 * every frame. The reference the tool is measured against, the old Unity
 * pipeline, shipped 300–560 MB of map per level. So: budgets that keep an
 * exported map intact, and a decimation ladder that exists for the person
 * importing raw art, not for our own exporter's output.
 */
export const LOD_TARGETS: Record<LodPreset, number> = {
  full: Infinity,
  high: 8_000_000,
  medium: 3_000_000,
  low: 800_000,
  silhouette: 100_000,
};

/**
 * Fraction of the budget spent on structures rather than ground.
 *
 * Structures get the larger share because they are the many-small-objects half
 * of a level and lose their shape fastest under decimation, while terrain is
 * large smooth polygons that survive heavy reduction. Their wireframe also costs
 * a line per edge, so the absolute count has to stay modest either way.
 */
export const STRUCTURE_BUDGET_SHARE = 0.6;

/**
 * The preset the level panel starts on, and therefore the one every import gets
 * unless somebody changes the dropdown.
 *
 * Exported as a constant rather than left as a literal in the panel so that
 * anything claiming to show what an import looks like — `tools/shot-level.mjs`,
 * in particular — is reading the same value the panel is. A screenshot tool with
 * its own idea of the default is how an exporter got blamed twice for geometry
 * the viewer had thrown away.
 */
export const IMPORT_DEFAULT_LOD: LodPreset = 'full';

/** Each preset's label, said in the viewer's language when it is read. */
export const LOD_LABELS: Record<LodPreset, string> = sayingTable({
  full: 'data.simplify.lod.full',
  high: 'data.simplify.lod.high',
  medium: 'data.simplify.lod.medium',
  low: 'data.simplify.lod.low',
  silhouette: 'data.simplify.lod.silhouette',
});

export interface SimplifyResult {
  mesh: RawMesh;
  sourceTriangles: number;
  /** Relative geometric deviation reported by the simplifier, 0..1-ish. */
  error: number;
  /** True when the target was already met and nothing was done. */
  skipped: boolean;
}

/**
 * Decimate `mesh` toward `targetTriangles`.
 *
 * `LockBorder` is on because level exports are usually split into many separate
 * pieces, and letting their shared edges move independently opens visible cracks
 * between them. `Prune` drops components that shrink to nothing rather than
 * leaving degenerate slivers behind.
 */
export async function simplifyMesh(
  mesh: RawMesh,
  targetTriangles: number,
  targetError = 0.02,
): Promise<SimplifyResult> {
  const sourceTriangles = mesh.triangles;
  if (!Number.isFinite(targetTriangles) || sourceTriangles <= targetTriangles) {
    return { mesh, sourceTriangles, error: 0, skipped: true };
  }
  if (!MeshoptSimplifier.supported) {
    throw new MsgError(msg('data.simplify.unavailable'));
  }
  await MeshoptSimplifier.ready;

  // Formats like STL store every triangle's corners separately, so no two
  // triangles share a vertex and no edge can be collapsed. Welding coincident
  // positions is what makes such a mesh simplifiable at all — and the welding
  // has to produce a genuinely compacted vertex array, not merely a remapped
  // index buffer: the simplifier derives its vertex count from the positions it
  // is handed, and leaving 5400 vertices in place while only 961 are referenced
  // makes it decline to collapse anything.
  const remap = keepUvSeams(MeshoptSimplifier.generatePositionRemap(mesh.vertices, 6), mesh.uvs);
  const welded = new Uint32Array(mesh.indices.length);
  for (let i = 0; i < mesh.indices.length; i++) welded[i] = remap[mesh.indices[i]];
  const dense = compactGeometry(mesh.vertices, welded, mesh.colours, mesh.uvs);

  const [indices, error] = MeshoptSimplifier.simplify(
    dense.indices,
    dense.vertices,
    6,
    Math.max(3, Math.floor(targetTriangles) * 3),
    targetError,
    ['LockBorder', 'Prune'],
  );

  // Simplification leaves the collapsed-away vertices unreferenced; compact
  // again so nothing dead is uploaded.
  const final = compactGeometry(dense.vertices, indices, dense.colours, dense.uvs);

  return {
    mesh: {
      vertices: final.vertices,
      colours: final.colours,
      uvs: final.uvs,
      indices: final.indices,
      triangles: final.indices.length / 3,
      bounds: mesh.bounds,
      // Decimation collapses across part boundaries, so the original spans no
      // longer describe the result; the whole thing becomes one part.
      parts: [
        {
          name: mesh.parts.length === 1 ? mesh.parts[0].name : 'simplified',
          start: 0,
          count: final.indices.length,
          upFacing: mesh.parts[0]?.upFacing ?? 0,
          bounds: mesh.bounds,
        },
      ],
    },
    sourceTriangles,
    error,
    skipped: false,
  };
}

/**
 * Drop unreferenced vertices and renumber the index buffer densely.
 *
 * Used both before simplification (to make welding real) and after (to discard
 * what was collapsed away).
 */
export function compactGeometry(
  vertices: Float32Array,
  indices: Uint32Array,
  colours?: Float32Array | null,
  uvs?: Float32Array | null,
  uvTiles?: Uint16Array | null,
): {
  vertices: Float32Array;
  indices: Uint32Array;
  colours: Float32Array | null;
  uvs: Float32Array | null;
  uvTiles: Uint16Array | null;
} {
  const vertexCount = vertices.length / 6;
  const map = new Int32Array(vertexCount).fill(-1);
  let kept = 0;
  for (let i = 0; i < indices.length; i++) {
    const v = indices[i];
    if (v < vertexCount && map[v] === -1) map[v] = kept++;
  }
  const out = new Float32Array(kept * 6);
  for (let v = 0; v < vertexCount; v++) {
    const dst = map[v];
    if (dst === -1) continue;
    for (let c = 0; c < 6; c++) out[dst * 6 + c] = vertices[v * 6 + c];
  }
  const idx = new Uint32Array(indices.length);
  for (let i = 0; i < indices.length; i++) idx[i] = Math.max(0, map[indices[i]]);

  // Colours ride the same mapping. Dropping them here would be a quiet
  // surprise: a capture loaded at full detail would be coloured and the same
  // capture simplified would not, with nothing to say why.
  let movedColours: Float32Array | null = null;
  if (colours && colours.length >= vertexCount * 3) {
    movedColours = new Float32Array(kept * 3);
    for (let v = 0; v < vertexCount; v++) {
      const dst = map[v];
      if (dst === -1) continue;
      movedColours[dst * 3] = colours[v * 3];
      movedColours[dst * 3 + 1] = colours[v * 3 + 1];
      movedColours[dst * 3 + 2] = colours[v * 3 + 2];
    }
  }
  // UVs likewise, and for the same reason: a textured level simplified would
  // otherwise lose its texture with nothing to say why.
  let movedUvs: Float32Array | null = null;
  if (uvs && uvs.length >= vertexCount * 2) {
    movedUvs = new Float32Array(kept * 2);
    for (let v = 0; v < vertexCount; v++) {
      const dst = map[v];
      if (dst === -1) continue;
      movedUvs[dst * 2] = uvs[v * 2];
      movedUvs[dst * 2 + 1] = uvs[v * 2 + 1];
    }
  }
  // And the tile each UV wraps in, without which a tiled UV addresses nothing.
  let movedTiles: Uint16Array | null = null;
  if (uvTiles && uvTiles.length >= vertexCount) {
    movedTiles = new Uint16Array(kept);
    for (let v = 0; v < vertexCount; v++) {
      const dst = map[v];
      if (dst !== -1) movedTiles[dst] = uvTiles[v];
    }
  }
  return { vertices: out, indices: idx, colours: movedColours, uvs: movedUvs, uvTiles: movedTiles };
}

/**
 * Decimate one index range of a shared vertex buffer.
 *
 * Ground and structures are simplified separately so each gets its own budget,
 * but they must keep sharing one vertex buffer — duplicating vertices per group
 * would undo the memory the decimation just saved. So this returns indices into
 * the *original* vertex array rather than a compacted mesh of its own.
 */
export async function simplifyIndices(
  vertices: Float32Array,
  indices: Uint32Array,
  targetTriangles: number,
  targetError = 0.02,
  uvs?: Float32Array | null,
  uvTiles?: Uint16Array | null,
): Promise<{ indices: Uint32Array; error: number; skipped: boolean }> {
  const triangles = indices.length / 3;
  if (triangles === 0) return { indices, error: 0, skipped: true };
  if (!Number.isFinite(targetTriangles) || triangles <= targetTriangles) {
    return { indices, error: 0, skipped: true };
  }
  if (!MeshoptSimplifier.supported) {
    throw new MsgError(msg('data.simplify.unavailable'));
  }
  await MeshoptSimplifier.ready;

  // Weld coincident positions so edges can actually collapse; see simplifyMesh
  // for why the vertex array must be compacted rather than merely remapped.
  const remap = keepUvSeams(MeshoptSimplifier.generatePositionRemap(vertices, 6), uvs, uvTiles);
  const welded = new Uint32Array(indices.length);
  for (let i = 0; i < indices.length; i++) welded[i] = remap[indices[i]];
  const dense = compactGeometry(vertices, welded);

  const [simplified, error] = MeshoptSimplifier.simplify(
    dense.indices,
    dense.vertices,
    6,
    Math.max(3, Math.floor(targetTriangles) * 3),
    targetError,
    ['LockBorder', 'Prune'],
  );

  // Map dense vertex ids back to positions in the shared buffer. The dense array
  // was built in first-use order, so walking the same order rebuilds the map.
  const denseToShared = new Uint32Array(dense.vertices.length / 6);
  // Flags in a typed array, not a Set: V8 caps a Set at 2^24 entries, fewer
  // than the vertices of an extracted city course.
  const seen = new Uint8Array(vertices.length / 6);
  let next = 0;
  for (let i = 0; i < welded.length; i++) {
    const v = welded[i];
    if (!seen[v]) {
      seen[v] = 1;
      denseToShared[next++] = v;
    }
  }
  const out = new Uint32Array(simplified.length);
  for (let i = 0; i < simplified.length; i++) out[i] = denseToShared[simplified[i]];
  return { indices: out, error, skipped: false };
}

/**
 * Recover the old-vertex to new-vertex mapping that compaction performed.
 *
 * `compactGeometry` renumbers in first-use order and does not report its map, so
 * walking the before and after index arrays in step reconstructs it. Needed
 * because the wireframe is built from pre-compaction indices.
 */
export function buildRemap(before: Uint32Array, after: Uint32Array): Int32Array {
  // A typed array indexed by the old vertex, not a Map: V8 caps a Map at 2^24
  // entries, and an extracted city course has more vertices than that - the
  // import failed with "Map maximum size exceeded" rather than loading.
  let highest = -1;
  for (let i = 0; i < before.length; i++) if (before[i] > highest) highest = before[i];
  const map = new Int32Array(highest + 1).fill(-1);
  for (let i = 0; i < before.length; i++) {
    if (map[before[i]] === -1) map[before[i]] = after[i];
  }
  return map;
}

/**
 * Undo a weld wherever it would join two different texture coordinates.
 *
 * Welding by position alone is right for geometry and wrong for a textured
 * level. Where two terrain tiles meet, the same corner exists twice, once in
 * each tile's image - and in the atlas those images are wherever the packer put
 * them, not side by side. Weld the two copies and a triangle on one side ends
 * up with a corner addressing the other tile's cell, so its texture smears
 * across the atlas between them.
 *
 * A repeating texture keeps its own UVs (see `planTiling`), so two images'
 * vertices can carry the very same UV; their tile numbers tell them apart.
 */
export function keepUvSeams(
  remap: Uint32Array,
  uvs: Float32Array | null | undefined,
  uvTiles?: Uint16Array | null,
): Uint32Array {
  if (!uvs) return remap;
  const out = new Uint32Array(remap.length);
  for (let v = 0; v < remap.length; v++) {
    const r = remap[v];
    const same =
      uvs[v * 2] === uvs[r * 2] &&
      uvs[v * 2 + 1] === uvs[r * 2 + 1] &&
      (!uvTiles || uvTiles[v] === uvTiles[r]);
    out[v] = same ? r : v;
  }
  return out;
}

/**
 * Reasonable LOD for a triangle count.
 *
 * Biased hard towards keeping what arrived. A file produced by one of this
 * project's own exporters has already been budgeted, tile by tile, against a
 * ceiling chosen from the level's size — decimating it again does not tame it,
 * it destroys it, because the second pass has no idea that those 24 triangles
 * are a building rather than 24 triangles of a hillside. The ladder is here for
 * someone dropping in raw art with no budgeting behind it at all.
 */
export function suggestLod(triangles: number): LodPreset {
  if (triangles <= LOD_TARGETS.high) return 'full';
  if (triangles <= 30_000_000) return 'high';
  return 'medium';
}

export function formatTriangles(n: number): string {
  if (n >= 1e6) return say(msg('data.count.millions', { n: { num: n / 1e6, digits: 2 } }));
  if (n >= 1e3) return say(msg('data.count.thousands', { n: { num: n / 1e3, digits: 0 } }));
  return String(n);
}
