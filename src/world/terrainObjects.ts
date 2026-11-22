import type { WorldTile } from './tileSet';
import type { TerrainModel } from './terrainFormat';

/**
 * A tiled terrain's placed objects (`terrainFormat.ts`: 20-byte records per
 * square cell) as one world tile of boxes, the way the single-mesh levels drew
 * them: each object a box of its model's size, turned and tipped as placed.
 *
 * Record: x, y, z (float32), yaw (uint16, 65536 a turn about +y), model
 * (uint16), up x and z (int8, of 127), scale (uint16, of 4096). A corner c of
 * the model's box is at position + scale * T(up) * Ry(yaw) * c, T(up) the
 * smallest turn taking +y to the up axis.
 */

export const RECORD_BYTES = 20;

/** Corner i of a box is (x, y, z) = bits (i & 1, i & 2, i & 4) between lo and hi. */
const FACES = [
  0, 4, 6, 0, 6, 2, 1, 7, 5, 1, 3, 7, 0, 1, 5, 0, 5, 4, 2, 7, 3, 2, 6, 7, 0, 2, 3, 0, 3, 1, 4, 7, 6, 4, 5, 7,
];
const EDGES = [0, 1, 2, 3, 4, 5, 6, 7, 0, 2, 1, 3, 4, 6, 5, 7, 0, 4, 1, 5, 2, 6, 3, 7];

/** One cell's records as a world tile (structures only), `id` its name. */
export function objectsTile(id: string, records: ArrayBuffer, count: number, models: readonly TerrainModel[]): WorldTile {
  const dv = new DataView(records);
  const vertices = new Float32Array(count * 8 * 6);
  const structureIndices = new Uint32Array(count * 36);
  const structureEdges = new Uint32Array(count * 24);
  let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  let n = 0;
  for (let r = 0; r < count; r++) {
    const o = r * RECORD_BYTES;
    const px = dv.getFloat32(o, true), py = dv.getFloat32(o + 4, true), pz = dv.getFloat32(o + 8, true);
    const yaw = (dv.getUint16(o + 12, true) / 65536) * Math.PI * 2;
    const model = models[dv.getUint16(o + 14, true)];
    if (!model) continue;
    let ux = dv.getInt8(o + 16) / 127;
    let uz = dv.getInt8(o + 17) / 127;
    const scale = dv.getUint16(o + 18, true) / 4096;
    // Ry(yaw), then the turn of +y onto up (Rodrigues about (uz, 0, -ux)).
    const c = Math.cos(yaw), s = Math.sin(yaw);
    const h2 = ux * ux + uz * uz;
    if (h2 > 1) {
      const k = 1 / Math.sqrt(h2);
      ux *= k;
      uz *= k;
    }
    const uy = Math.sqrt(Math.max(0, 1 - ux * ux - uz * uz));
    // T maps +y to u; for a vector v: T v = v cos + (a x v) sin + a (a.v)(1 - cos), a = (uz, 0, -ux)/|.|, cos = uy.
    const sinT = Math.sqrt(ux * ux + uz * uz);
    const ax = sinT > 1e-6 ? uz / sinT : 0, az = sinT > 1e-6 ? -ux / sinT : 0;
    const turn = (vx: number, vy: number, vz: number, out: number[]) => {
      // a = (ax, 0, az): a x v = (0*vz - az*vy, az*vx - ax*vz, ax*vy - 0*vx)
      const dot = ax * vx + az * vz;
      out[0] = vx * uy + -az * vy * sinT + ax * dot * (1 - uy);
      out[1] = vy * uy + (az * vx - ax * vz) * sinT;
      out[2] = vz * uy + ax * vy * sinT + az * dot * (1 - uy);
    };
    const [lx, ly, lz, hx, hy, hz] = model.box;
    const p: number[] = [0, 0, 0];
    const base = n * 8;
    for (let i = 0; i < 8; i++) {
      const bx = (i & 1 ? hx : lx) * scale, by = (i & 2 ? hy : ly) * scale, bz = (i & 4 ? hz : lz) * scale;
      // Ry: x' = x c + z s, z' = -x s + z c
      turn(bx * c + bz * s, by, -bx * s + bz * c, p);
      const x = px + p[0], y = py + p[1], z = pz + p[2];
      const v = (base + i) * 6;
      vertices[v] = x;
      vertices[v + 1] = y;
      vertices[v + 2] = z;
      // Normals from the box's centre outward; the level draws structures flat-shaded anyway.
      const cx = (i & 1 ? 1 : -1), cy = (i & 2 ? 1 : -1), cz = (i & 4 ? 1 : -1);
      turn(cx * c + cz * s, cy, -cx * s + cz * c, p);
      const len = Math.hypot(p[0], p[1], p[2]) || 1;
      vertices[v + 3] = p[0] / len;
      vertices[v + 4] = p[1] / len;
      vertices[v + 5] = p[2] / len;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (z < minZ) minZ = z;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (z > maxZ) maxZ = z;
    }
    for (let f = 0; f < 36; f++) structureIndices[n * 36 + f] = base + FACES[f];
    for (let e = 0; e < 24; e++) structureEdges[n * 24 + e] = base + EDGES[e];
    n++;
  }
  const empty = new Uint32Array(0);
  return {
    id,
    vertices: vertices.subarray(0, n * 48),
    colours: new Float32Array(n * 8 * 3).fill(0.75),
    uvs: null,
    image: null,
    indices: empty,
    structureIndices: structureIndices.subarray(0, n * 36),
    structureEdges: structureEdges.subarray(0, n * 24),
    waterIndices: empty,
    bounds: n
      ? { minX, minY, minZ, maxX, maxY, maxZ }
      : { minX: 0, minY: 0, minZ: 0, maxX: 0, maxY: 0, maxZ: 0 },
  };
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
