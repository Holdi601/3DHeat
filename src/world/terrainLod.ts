/**
 * Which pieces of a tiled terrain to draw, and how finely: a quadtree of
 * square nodes over the height pyramid (`terrainFormat.ts`), chosen from the
 * camera each frame (continuous distance-dependent level of detail, as in
 * Strugar's CDLOD).
 *
 * A node is 32 x 32 cells of its level and is drawn as one instance of the
 * same 32 x 32 grid, its heights read from the level's tile in the vertex
 * shader. A node is split into its four children while the camera is nearer
 * its box than `range(level - 1)`, and only when the children's tile is on the
 * GPU - until then the node stands in for them. In the outer part of its range
 * a node's odd vertices slide onto the even ones (`morph`), so by the range's
 * end it is the coarser level's grid exactly and the change of level never
 * pops; that also makes it meet a coarser neighbour without a crack. The ranges
 * are far enough apart (`LOD_K`, `MORPH_MARGIN`) that a node's neighbours are
 * at most one level away and only the finer of two neighbours is morphing where
 * they meet. Each node also hangs a skirt from its edges, which hides any gap
 * left while a finer tile is still loading.
 *
 * Pure, so the choice can be tested without a GPU.
 */

/** Cells a side of a node. */
export const NODE_CELLS = 32;
/** A level's nodes are kept out to this many node widths. */
export const LOD_K = 7;
/** Node widths between the finer level's range and the start of a level's morph: a node's 3D diagonal and then some. */
export const MORPH_MARGIN = 2;

export interface LodGrid {
  /** Level-frame (x, z) of sample (0, 0). */
  origin: [number, number];
  /** Spacing of level 0, metres. */
  spacing: number;
  /** Levels, 0 the finest. */
  levels: number;
  /** Cells a side of level 0 (padded: 128 x 2^(levels - 1)). */
  cells: number;
  /** The real grid's minX, minZ, maxX, maxZ: nodes wholly outside it are not drawn. */
  extent: [number, number, number, number];
}

export interface LodNode {
  level: number;
  nx: number;
  nz: number;
}

/** A node's width, metres. */
export function nodeSize(g: LodGrid, level: number): number {
  return NODE_CELLS * g.spacing * 2 ** level;
}

/** Distance within which a level's nodes are drawn rather than their parent: K node widths. */
export function lodRange(g: LodGrid, level: number): number {
  return LOD_K * nodeSize(g, level);
}

/** Where a level's vertices start and end sliding onto the coarser grid; none for the top level. */
export function morphRange(g: LodGrid, level: number): [number, number] {
  if (level >= g.levels - 1) return [1e30, 2e30];
  const end = lodRange(g, level);
  const start = lodRange(g, level - 1) + MORPH_MARGIN * nodeSize(g, level);
  return [Math.min(start, end * 0.95), end];
}

/** Nodes a side at a level. */
export function nodesPerSide(g: LodGrid, level: number): number {
  return (g.cells >> level) / NODE_CELLS;
}

/** The node's box in x and z. */
export function nodeRect(g: LodGrid, n: LodNode): [number, number, number, number] {
  const s = nodeSize(g, n.level);
  const x0 = g.origin[0] + n.nx * s;
  const z0 = g.origin[1] + n.nz * s;
  return [x0, z0, x0 + s, z0 + s];
}

/** Distance from a point to a box. */
export function boxDistance(
  p: [number, number, number] | Float32Array | number[],
  minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number,
): number {
  const dx = Math.max(minX - p[0], 0, p[0] - maxX);
  const dy = Math.max(minY - p[1], 0, p[1] - maxY);
  const dz = Math.max(minZ - p[2], 0, p[2] - maxZ);
  return Math.hypot(dx, dy, dz);
}

export interface LodQuery {
  camera: [number, number, number] | Float32Array;
  /** A node's height range, or null when nothing of its level is known yet. */
  heights(n: LodNode): [number, number] | null;
  /** Whether the tile under a node is on the GPU. */
  ready(n: LodNode): boolean;
  /** Frustum test on a box; true = outside. Absent culls nothing. */
  outside?: (minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number) => boolean;
}

export interface LodChoice {
  /** The nodes to draw. */
  nodes: LodNode[];
  /** Nodes that wanted their children and could not have them: their children's tiles are wanted. */
  wanted: LodNode[];
}

/**
 * The nodes to draw for a camera: from every node of the top level down,
 * split while near and while the children are there.
 */
export function selectNodes(g: LodGrid, q: LodQuery): LodChoice {
  const nodes: LodNode[] = [];
  const wanted: LodNode[] = [];
  const top = g.levels - 1;
  const n = nodesPerSide(g, top);
  const [ex0, ez0, ex1, ez1] = g.extent;
  const visit = (node: LodNode) => {
    const [x0, z0, x1, z1] = nodeRect(g, node);
    if (x0 > ex1 || z0 > ez1 || x1 < ex0 || z1 < ez0) return;
    if (!q.ready(node)) return;
    const h = q.heights(node) ?? [0, 0];
    if (q.outside?.(x0, h[0], z0, x1, h[1], z1)) return;
    if (node.level > 0 && boxDistance(q.camera, x0, h[0], z0, x1, h[1], z1) < lodRange(g, node.level - 1)) {
      const kids: LodNode[] = [];
      for (let k = 0; k < 4; k++) kids.push({ level: node.level - 1, nx: node.nx * 2 + (k & 1), nz: node.nz * 2 + (k >> 1) });
      if (kids.every((c) => q.ready(c))) {
        for (const c of kids) visit(c);
        return;
      }
      wanted.push(node);
    }
    nodes.push(node);
  };
  for (let nz = 0; nz < n; nz++) for (let nx = 0; nx < n; nx++) visit({ level: top, nx, nz });
  return { nodes, wanted };
}

/**
 * The grid every node is drawn with: (n + 1)^2 vertices (x, z in cells, 0
 * for the surface) then a skirt ring (the edge vertices again, 1), and its
 * triangles - every cell split along the same diagonal, so a morphed grid is
 * the coarser grid's own triangles - then the skirt's.
 */
export function nodeGrid(n = NODE_CELLS): { vertices: Float32Array; indices: Uint16Array | Uint32Array } {
  const side = n + 1;
  const ring: [number, number][] = [];
  for (let i = 0; i < n; i++) ring.push([i, 0]);
  for (let j = 0; j < n; j++) ring.push([n, j]);
  for (let i = n; i > 0; i--) ring.push([i, n]);
  for (let j = n; j > 0; j--) ring.push([0, j]);
  const vertices = new Float32Array((side * side + ring.length) * 3);
  let v = 0;
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) vertices.set([i, j, 0], v++ * 3);
  for (const [i, j] of ring) vertices.set([i, j, 1], v++ * 3);
  const tris: number[] = [];
  const at = (i: number, j: number) => j * side + i;
  // Wound counter-clockwise seen from +y in a frame with z running south (x east): a, c, b.
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const a = at(i, j), b = at(i + 1, j), c = at(i, j + 1), d = at(i + 1, j + 1);
      tris.push(a, c, d, a, d, b);
    }
  }
  const base = side * side;
  for (let k = 0; k < ring.length; k++) {
    const k1 = (k + 1) % ring.length;
    const top0 = at(ring[k][0], ring[k][1]);
    const top1 = at(ring[k1][0], ring[k1][1]);
    // No face is culled, so one winding serves both sides.
    tris.push(top0, top1, base + k1, top0, base + k1, base + k);
  }
  const indices = v <= 65535 ? Uint16Array.from(tris) : Uint32Array.from(tris);
  return { vertices, indices };
}
