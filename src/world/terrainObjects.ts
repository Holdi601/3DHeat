import type { WorldTile } from './tileSet';
import type { TerrainModel } from './terrainFormat';

/**
 * A tiled terrain's placed objects (`terrainFormat.ts`: 20-byte records per
 * square cell) as boxes drawn instanced (one unit cube, an affine map per
 * object), the way the single-mesh levels drew them: each object a box of its
 * model's size, turned and tipped as placed.
 *
 * Record: x, y, z (float32), yaw (uint16, 65536 a turn about +y), model
 * (uint16), up x and z (int8, of 127), scale (uint16, of 4096). A corner c of
 * the model's box is at position + scale * T(up) * Ry(yaw) * c, T(up) the
 * smallest turn taking +y to the up axis.
 */

export const RECORD_BYTES = 20;

/** One cell's objects, ready to draw: an affine map of the unit cube per object. */
export interface TerrainBoxes {
  id: string;
  /** BOX_FLOATS per object: three rows (a, b, c, d) with world = (a, b, c) . corner + d, corner in 0..1. */
  instances: Float32Array;
  count: number;
  bounds: { minX: number; minY: number; minZ: number; maxX: number; maxY: number; maxZ: number };
}

/** Floats an object takes in `TerrainBoxes.instances`. */
export const BOX_FLOATS = 12;

/** One cell's records as boxes to draw instanced, `id` its name. */
export function objectBoxes(id: string, records: ArrayBuffer, count: number, models: readonly TerrainModel[]): TerrainBoxes {
  const dv = new DataView(records);
  const out = new Float32Array(count * BOX_FLOATS);
  let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  const col: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  let n = 0;
  for (let r = 0; r < count; r++) {
    const o = r * RECORD_BYTES;
    const model = models[dv.getUint16(o + 14, true)];
    if (!model) continue;
    const px = dv.getFloat32(o, true), py = dv.getFloat32(o + 4, true), pz = dv.getFloat32(o + 8, true);
    const yaw = (dv.getUint16(o + 12, true) / 65536) * Math.PI * 2;
    let ux = dv.getInt8(o + 16) / 127;
    let uz = dv.getInt8(o + 17) / 127;
    const scale = dv.getUint16(o + 18, true) / 4096;
    const h2 = ux * ux + uz * uz;
    if (h2 > 1) {
      const k = 1 / Math.sqrt(h2);
      ux *= k;
      uz *= k;
    }
    // R = T(up) Ry(yaw): T the smallest turn of +y onto up (Rodrigues about (uz, 0, -ux)).
    const uy = Math.sqrt(Math.max(0, 1 - ux * ux - uz * uz));
    const sinT = Math.sqrt(ux * ux + uz * uz);
    const ax = sinT > 1e-6 ? uz / sinT : 0, az = sinT > 1e-6 ? -ux / sinT : 0;
    const c = Math.cos(yaw), s = Math.sin(yaw);
    const turn = (vx: number, vy: number, vz: number, out3: number[]) => {
      const dot = ax * vx + az * vz;
      out3[0] = vx * uy - az * vy * sinT + ax * dot * (1 - uy);
      out3[1] = vy * uy + (az * vx - ax * vz) * sinT;
      out3[2] = vz * uy + ax * vy * sinT + az * dot * (1 - uy);
    };
    // Ry columns: x -> (c, 0, -s), y -> (0, 1, 0), z -> (s, 0, c).
    turn(c, 0, -s, col[0]);
    turn(0, 1, 0, col[1]);
    turn(s, 0, c, col[2]);
    const [lx, ly, lz, hx, hy, hz] = model.box;
    const lo = [lx * scale, ly * scale, lz * scale];
    const size = [(hx - lx) * scale, (hy - ly) * scale, (hz - lz) * scale];
    const p = [px, py, pz];
    const base = n * BOX_FLOATS;
    for (let row = 0; row < 3; row++) {
      out[base + row * 4] = col[0][row] * size[0];
      out[base + row * 4 + 1] = col[1][row] * size[1];
      out[base + row * 4 + 2] = col[2][row] * size[2];
      out[base + row * 4 + 3] = p[row] + col[0][row] * lo[0] + col[1][row] * lo[1] + col[2][row] * lo[2];
    }
    // The box's bounds: its corners.
    for (let k = 0; k < 8; k++) {
      const cx = k & 1, cy = (k >> 1) & 1, cz = (k >> 2) & 1;
      const x = out[base] * cx + out[base + 1] * cy + out[base + 2] * cz + out[base + 3];
      const y = out[base + 4] * cx + out[base + 5] * cy + out[base + 6] * cz + out[base + 7];
      const z = out[base + 8] * cx + out[base + 9] * cy + out[base + 10] * cz + out[base + 11];
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (z < minZ) minZ = z;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (z > maxZ) maxZ = z;
    }
    n++;
  }
  return {
    id,
    instances: out.subarray(0, n * BOX_FLOATS),
    count: n,
    bounds: n ? { minX, minY, minZ, maxX, maxY, maxZ } : { minX: 0, minY: 0, minZ: 0, maxX: 0, maxY: 0, maxZ: 0 },
  };
}

/**
 * The unit cube every object is drawn with: 24 corners (four a face, so each
 * face has its own normal) as corner xyz + normal xyz, and 36 indices.
 */
export function unitCube(): { vertices: Float32Array; indices: Uint16Array } {
  const faces: [number[], number[][]][] = [
    [[1, 0, 0], [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]]],
    [[-1, 0, 0], [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]]],
    [[0, 1, 0], [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]]],
    [[0, -1, 0], [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]]],
    [[0, 0, 1], [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]]],
    [[0, 0, -1], [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]]],
  ];
  const vertices = new Float32Array(24 * 6);
  const indices = new Uint16Array(36);
  faces.forEach(([n, quad], f) => {
    quad.forEach((c, k) => vertices.set([...c, ...n], (f * 4 + k) * 6));
    indices.set([0, 1, 2, 0, 2, 3].map((i) => f * 4 + i), f * 6);
  });
  return { vertices, indices };
}

/** The sea as one world tile over the terrain's extent, at `y`. */
export function waterTile(id: string, extent: readonly [number, number, number, number], y: number): WorldTile {
  const [x0, z0, x1, z1] = extent;
  const vertices = Float32Array.from([x0, y, z0, 0, 1, 0, x1, y, z0, 0, 1, 0, x0, y, z1, 0, 1, 0, x1, y, z1, 0, 1, 0]);
  const empty = new Uint32Array(0);
  return {
    id,
    vertices,
    colours: new Float32Array(12).fill(1),
    uvs: null,
    image: null,
    indices: empty,
    structureIndices: empty,
    structureEdges: empty,
    waterIndices: Uint32Array.from([0, 2, 3, 0, 3, 1]),
    bounds: { minX: x0, minY: y, minZ: z0, maxX: x1, maxY: y, maxZ: z1 },
  };
}
