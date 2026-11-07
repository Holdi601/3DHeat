/**
 * Geometry-only model parsing for level backgrounds.
 *
 * Written directly rather than via a scene-graph loader because the requirement
 * is narrow: positions, normals and triangles, welded into one buffer. A general
 * loader would additionally build materials, decode textures and construct a
 * node hierarchy — all of which are unused here, and all of which need DOM APIs
 * that are awkward or unavailable inside a worker.
 */

import { GrowableF32, GrowableI16, GrowableU32 } from './growable';
import { msg, MsgError } from './msg';

export interface MeshBounds {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
}

/**
 * One named run of triangles from the source file.
 *
 * Kept because the ground and the things standing on it need to be drawn
 * differently, and the only reliable signal for which is which is the name the
 * exporter gave each mesh.
 */
export interface MeshPart {
  name: string;
  /** Offset into `indices`. */
  start: number;
  count: number;
  /** Fraction of this part's triangle area facing up, 0..1. */
  upFacing: number;
  bounds: MeshBounds;
}

export interface RawMesh {
  /** Interleaved position(3) + normal(3), 24 bytes per vertex. */
  vertices: Float32Array;
  /**
   * Per-vertex colour from the source file's `COLOR_0`, 3 floats per vertex,
   * or null when the file carries none.
   *
   * Its own array rather than a fourth field in the interleaved buffer: most
   * levels have no colour, an engine export never does, and widening the vertex
   * stride for all of them to suit the few that do would cost a third more
   * memory on the largest thing the viewer loads.
   *
   * Only reconstruction exports carry this. A scanned racetrack is mostly one
   * flat surface flowing into its surroundings, and without colour the road is
   * not distinguishable from the verge at any shading angle.
   */
  colours?: Float32Array | null;
  /**
   * Per-vertex texture coordinate, 2 floats per vertex, into the image
   * `imageOf` names for that vertex; null when no part is textured.
   *
   * Carried as the source file's own UVs, one image each, rather than already
   * packed into an atlas: packing needs a canvas to draw into, which a test in
   * Node does not have, and parsing has to stay testable there. The worker packs
   * them - see `atlas.ts`.
   */
  uvs?: Float32Array | null;
  /** Per-vertex index into `images`; -1 where the vertex's part is untextured. */
  imageOf?: Int16Array | null;
  /** The encoded base-colour images the file carries, in file order. */
  images?: RawImage[];
  indices: Uint32Array;
  triangles: number;
  bounds: MeshBounds;
  parts: MeshPart[];
}

/** An image as it sits in the file: still encoded, so it costs its compressed size. */
export interface RawImage {
  mime: string;
  bytes: Uint8Array<ArrayBuffer>;
  /**
   * Set when a material draws this image with `alphaMode` MASK: texels whose
   * alpha is below it are not there at all - the empty corners of a leaf card,
   * the gaps in a fence. Unset, the image is opaque, whatever alpha it carries.
   */
  cutoff?: number;
  /**
   * False when every texture drawing this image clamps along u (or v) rather
   * than repeating; unset means repeat, glTF's default. Only a repeating axis
   * whose UVs leave 0..1 makes the image a tile in the atlas - see
   * `planTiling`.
   */
  repeatU?: boolean;
  repeatV?: boolean;
}

export type ModelFormat = 'glb' | 'gltf' | 'obj' | 'stl' | 'ply';

export function detectModelFormat(name: string): ModelFormat | null {
  const m = /\.(glb|gltf|obj|stl|ply)$/i.exec(name);
  return m ? (m[1].toLowerCase() as ModelFormat) : null;
}

export const MODEL_EXTENSIONS = '.glb,.gltf,.obj,.stl,.ply';

// ------------------------------------------------------------------ assembly

/** Further from the origin than this (1,000 km in centimetres, 100,000 km in metres) a vertex is a broken file's, not geometry. */
const INSANE = 1e8;

/**
 * Accumulates triangles from any source into one interleaved buffer.
 *
 * Positions are transformed on the way in, because glTF geometry is only correct
 * once each node's world matrix has been applied, and doing it here avoids
 * carrying a hierarchy through to the renderer.
 */
class MeshBuilder {
  // Typed arrays, not plain ones. A large level is tens of millions of
  // vertices, and a plain array stops growing at a length the browser chooses:
  // 134M elements in Chrome, 64M in Thorium, where a 23.6M-vertex course export
  // failed at its 71M position coordinates with "Invalid array length". A
  // plain array of numbers also holds each as a double, twice the float it
  // ends up as.
  private pos = new GrowableF32();
  private nrm = new GrowableF32();
  /** Made by the first part with colour; every vertex before it is grey. Null keeps a colourless file colourless. */
  private col: GrowableF32 | null = null;
  /** Made by the first textured part; untextured vertices are (0, 0) on image -1. Null keeps an untextured file untextured. */
  private uv: GrowableF32 | null = null;
  private img: GrowableI16 | null = null;
  private idx = new GrowableU32();
  /** False when no source supplied usable normals, so they must be derived. */
  private hasNormals = false;
  /** The file's images, set by the glTF reader before `finish`. */
  images: RawImage[] = [];

  /** The colour column, made on first use with grey for the vertices already in. */
  private colours(): GrowableF32 {
    if (!this.col) {
      this.col = new GrowableF32(Math.max(1, this.pos.length));
      for (let i = 0; i < this.pos.length; i++) this.col.push(0.5);
    }
    return this.col;
  }

  /** The UV and image columns, made on first use with no texture for the vertices already in. */
  private textures(): [GrowableF32, GrowableI16] {
    if (!this.uv || !this.img) {
      const n = this.pos.length / 3;
      this.uv = new GrowableF32(Math.max(1, n * 2));
      this.uv.pad(n * 2);
      this.img = new GrowableI16(Math.max(1, n));
      this.img.fill(-1, n);
    }
    return [this.uv, this.img];
  }

  private readonly partSpans: Array<{ name: string; start: number; count: number }> = [];

  addTriangleSoup(
    positions: Float32Array,
    normals: Float32Array | null,
    indices: Uint32Array | null,
    matrix: Float32Array | null,
    name = 'mesh',
    colours: Float32Array | null = null,
    uvs: Float32Array | null = null,
    image = -1,
  ): void {
    const indexStart = this.idx.length;
    const base = this.pos.length / 3;
    const count = positions.length / 3;
    if (normals && normals.some((v) => v !== 0)) this.hasNormals = true;
    // A texture with no coordinates, or coordinates for a different vertex
    // count, is a file that cannot be drawn textured; it falls back to
    // untextured rather than sampling garbage.
    const textured = image >= 0 && uvs !== null && uvs.length >= count * 2;
    if (textured) this.textures();
    if (colours) this.colours();
    if (this.uv && this.img) {
      if (textured) {
        this.uv.pushAll(uvs!, count * 2);
        this.img.fill(image, count);
      } else {
        this.uv.pad(count * 2);
        this.img.fill(-1, count);
      }
    }
    const col = this.col;

    for (let i = 0; i < count; i++) {
      let x = positions[i * 3];
      let y = positions[i * 3 + 1];
      let z = positions[i * 3 + 2];
      if (matrix) {
        const m = matrix;
        const w = m[3] * x + m[7] * y + m[11] * z + m[15] || 1;
        const tx = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
        const ty = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
        const tz = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
        x = tx;
        y = ty;
        z = tz;
      }
      this.pos.push(x);
      this.pos.push(y);
      this.pos.push(z);

      if (col) {
        if (colours) {
          col.push(colours[i * 3]);
          col.push(colours[i * 3 + 1]);
          col.push(colours[i * 3 + 2]);
        } else {
          // Mid-grey for a part with no colour in a file where other parts
          // have some. Black would read as a hole once colour is switched on.
          col.push(0.5);
          col.push(0.5);
          col.push(0.5);
        }
      }

      if (normals) {
        let nx = normals[i * 3];
        let ny = normals[i * 3 + 1];
        let nz = normals[i * 3 + 2];
        if (matrix) {
          // Rotation part only; a normal is a direction, not a position.
          const m = matrix;
          const tx = m[0] * nx + m[4] * ny + m[8] * nz;
          const ty = m[1] * nx + m[5] * ny + m[9] * nz;
          const tz = m[2] * nx + m[6] * ny + m[10] * nz;
          const len = Math.hypot(tx, ty, tz) || 1;
          nx = tx / len;
          ny = ty / len;
          nz = tz / len;
        }
        this.nrm.push(nx);
        this.nrm.push(ny);
        this.nrm.push(nz);
      } else {
        this.nrm.pad(3);
      }
    }

    if (indices) {
      for (let i = 0; i < indices.length; i++) this.idx.push(base + indices[i]);
    } else {
      for (let i = 0; i < count; i++) this.idx.push(base + i);
    }
    this.partSpans.push({ name, start: indexStart, count: this.idx.length - indexStart });
  }

  /**
   * Add vertices without any triangles, returning their base index.
   *
   * OBJ shares one vertex list across every `o`/`g` block, so the vertices go in
   * once and each named object contributes only indices — calling
   * `addTriangleSoup` per object would duplicate the whole vertex list per part.
   */
  addVertices(positions: ArrayLike<number>, normals: ArrayLike<number> | null): number {
    const base = this.pos.length / 3;
    const count = positions.length / 3;
    if (normals) {
      for (let i = 0; i < normals.length; i++) {
        if (normals[i] !== 0) {
          this.hasNormals = true;
          break;
        }
      }
    }
    this.pos.pushAll(positions, count * 3);
    if (normals) this.nrm.pushAll(normals, count * 3);
    else this.nrm.pad(count * 3);
    // Vertices from here carry no texture or colour of their own.
    if (this.uv && this.img) {
      this.uv.pad(count * 2);
      this.img.fill(-1, count);
    }
    if (this.col) for (let i = 0; i < count * 3; i++) this.col.push(0.5);
    return base;
  }

  /** Record one named run of triangles over already-added vertices. */
  addPart(name: string, indices: ArrayLike<number>, base: number): void {
    if (indices.length === 0) return;
    const start = this.idx.length;
    for (let i = 0; i < indices.length; i++) this.idx.push(base + indices[i]);
    this.partSpans.push({ name, start, count: indices.length });
  }

  get vertexCount(): number {
    return this.pos.length / 3;
  }

  /** Vertices `dropInsane` found unusable, left out of the bounds; null when there were none. */
  private insane: Uint8Array | null = null;

  /**
   * The index buffer without triangles that touch an unusable vertex: one not
   * finite, or further than INSANE along an axis. A broken exporter writes
   * such vertices (an empty box's 1e32 corners); kept, they stretch the bounds
   * past anything the camera, the depth range or the spatial index can hold,
   * and the page stops responding. Such vertices are set to the origin so no
   * later pass over the vertex list meets them either.
   */
  private dropInsane(indices: Uint32Array, pos: Float32Array, n: number): Uint32Array {
    let bad: Uint8Array | null = null;
    for (let i = 0; i < n; i++) {
      const x = pos[i * 3];
      const y = pos[i * 3 + 1];
      const z = pos[i * 3 + 2];
      if (Math.abs(x) <= INSANE && Math.abs(y) <= INSANE && Math.abs(z) <= INSANE) continue; // NaN fails this too
      if (!bad) bad = new Uint8Array(n);
      bad[i] = 1;
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
    }
    if (!bad) return indices;
    this.insane = bad;
    const kept = new Uint32Array(indices.length);
    let k = 0;
    for (const span of this.partSpans) {
      const start = k;
      for (let i = span.start; i < span.start + span.count; i += 3) {
        const a = indices[i];
        const b = indices[i + 1];
        const c = indices[i + 2];
        if (bad[a] || bad[b] || bad[c]) continue;
        kept[k++] = a;
        kept[k++] = b;
        kept[k++] = c;
      }
      span.start = start;
      span.count = k - start;
    }
    if (k < 3) throw new MsgError(msg('data.modelParse.noTriangles'));
    return kept.slice(0, k);
  }

  finish(): RawMesh {
    const n = this.pos.length / 3;
    if (n === 0 || this.idx.length < 3) {
      throw new MsgError(msg('data.modelParse.noTriangles'));
    }
    const pos = this.pos.raw();
    const nrm = this.nrm.raw();
    const indices = this.dropInsane(this.idx.finish(), pos, n);
    const vertices = new Float32Array(n * 6);
    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;

    for (let i = 0; i < n; i++) {
      const x = pos[i * 3];
      const y = pos[i * 3 + 1];
      const z = pos[i * 3 + 2];
      vertices[i * 6] = x;
      vertices[i * 6 + 1] = y;
      vertices[i * 6 + 2] = z;
      vertices[i * 6 + 3] = nrm[i * 3];
      vertices[i * 6 + 4] = nrm[i * 3 + 1];
      vertices[i * 6 + 5] = nrm[i * 3 + 2];
      if (this.insane && this.insane[i]) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }

    if (!this.hasNormals) computeNormals(vertices, indices);

    return {
      vertices,
      colours: this.col ? this.col.finish() : null,
      uvs: this.uv ? this.uv.finish() : null,
      imageOf: this.img ? this.img.finish() : null,
      images: this.uv ? this.images : [],
      indices,
      triangles: indices.length / 3,
      bounds: { minX, minY, minZ, maxX, maxY, maxZ },
      parts: this.partSpans.map((span) => describePart(span, vertices, indices)),
    };
  }
}

/**
 * Measure a part so it can be classified.
 *
 * `upFacing` is area-weighted rather than a triangle count: terrain is a few
 * large flat polygons while a building is many small ones, so counting
 * triangles would call a house "mostly flat" as soon as it has a roof.
 */
function describePart(
  span: { name: string; start: number; count: number },
  vertices: Float32Array,
  indices: Uint32Array,
): MeshPart {
  let up = 0;
  let total = 0;
  const b: MeshBounds = {
    minX: Infinity,
    minY: Infinity,
    minZ: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
    maxZ: -Infinity,
  };

  for (let i = span.start; i < span.start + span.count; i += 3) {
    const a = indices[i] * 6;
    const c = indices[i + 1] * 6;
    const d = indices[i + 2] * 6;
    for (const o of [a, c, d]) {
      const x = vertices[o];
      const y = vertices[o + 1];
      const z = vertices[o + 2];
      if (x < b.minX) b.minX = x;
      if (x > b.maxX) b.maxX = x;
      if (y < b.minY) b.minY = y;
      if (y > b.maxY) b.maxY = y;
      if (z < b.minZ) b.minZ = z;
      if (z > b.maxZ) b.maxZ = z;
    }
    const e1x = vertices[c] - vertices[a];
    const e1y = vertices[c + 1] - vertices[a + 1];
    const e1z = vertices[c + 2] - vertices[a + 2];
    const e2x = vertices[d] - vertices[a];
    const e2y = vertices[d + 1] - vertices[a + 1];
    const e2z = vertices[d + 2] - vertices[a + 2];
    const nx = e1y * e2z - e1z * e2y;
    const ny = e1z * e2x - e1x * e2z;
    const nz = e1x * e2y - e1y * e2x;
    const area = Math.hypot(nx, ny, nz);
    if (area <= 0) continue;
    total += area;
    // ny/area is the cosine between the face normal and world up.
    if (Math.abs(ny) / area > 0.7) up += area;
  }

  return {
    name: span.name,
    start: span.start,
    count: span.count,
    upFacing: total > 0 ? up / total : 0,
    bounds: b,
  };
}

/**
 * Area-weighted vertex normals, for sources that ship none.
 *
 * Area weighting rather than a plain average: level geometry mixes large floor
 * quads with small trim, and an unweighted average lets the trim dominate the
 * shading of the surface it sits on.
 */
/**
 * COLOR_0 as three floats per vertex, whatever width it arrived in.
 *
 * glTF allows VEC3 or VEC4 here, so a reader that assumes one of them silently
 * mis-strides on the other and produces colours shifted by a channel per vertex
 * — which looks like a plausible palette rather than like a bug.
 */
function asRgb(raw: Float32Array, vertices: number): Float32Array | null {
  if (vertices <= 0) return null;
  const stride = Math.round(raw.length / vertices);
  if (stride === 3) return raw;
  if (stride !== 4) return null;
  const out = new Float32Array(vertices * 3);
  for (let i = 0; i < vertices; i++) {
    out[i * 3] = raw[i * 4];
    out[i * 3 + 1] = raw[i * 4 + 1];
    out[i * 3 + 2] = raw[i * 4 + 2];
  }
  return out;
}

export function computeNormals(vertices: Float32Array, indices: Uint32Array): void {
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i] * 6;
    const b = indices[i + 1] * 6;
    const c = indices[i + 2] * 6;
    const ax = vertices[a];
    const ay = vertices[a + 1];
    const az = vertices[a + 2];
    const e1x = vertices[b] - ax;
    const e1y = vertices[b + 1] - ay;
    const e1z = vertices[b + 2] - az;
    const e2x = vertices[c] - ax;
    const e2y = vertices[c + 1] - ay;
    const e2z = vertices[c + 2] - az;
    // Un-normalised cross product: its length is twice the triangle area.
    const nx = e1y * e2z - e1z * e2y;
    const ny = e1z * e2x - e1x * e2z;
    const nz = e1x * e2y - e1y * e2x;
    for (const o of [a, b, c]) {
      vertices[o + 3] += nx;
      vertices[o + 4] += ny;
      vertices[o + 5] += nz;
    }
  }
  for (let i = 0; i < vertices.length; i += 6) {
    const len = Math.hypot(vertices[i + 3], vertices[i + 4], vertices[i + 5]);
    if (len > 1e-20) {
      vertices[i + 3] /= len;
      vertices[i + 4] /= len;
      vertices[i + 5] /= len;
    } else {
      vertices[i + 4] = 1;
    }
  }
}

// ---------------------------------------------------------------------- glTF

const GLB_MAGIC = 0x46546c67; // 'glTF'

interface GltfAccessor {
  bufferView?: number;
  byteOffset?: number;
  componentType: number;
  count: number;
  type: string;
  /** Integer components standing for -1..1 or 0..1: quantised normals, UVs, colours. */
  normalized?: boolean;
}

const COMPONENT_SIZE: Record<number, number> = {
  5120: 1, // BYTE
  5121: 1, // UNSIGNED_BYTE
  5122: 2, // SHORT
  5123: 2, // UNSIGNED_SHORT
  5125: 4, // UNSIGNED_INT
  5126: 4, // FLOAT
};
const TYPE_COMPONENTS: Record<string, number> = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT4: 16,
};

export function parseGlb(buffer: ArrayBuffer): RawMesh {
  const view = new DataView(buffer);
  if (view.byteLength < 12) throw new MsgError(msg('data.modelParse.glbTooShort'));
  if (view.getUint32(0, true) !== GLB_MAGIC) {
    // A .gltf JSON file, or something else entirely.
    return parseGltfJson(new TextDecoder().decode(buffer), null);
  }

  const length = view.getUint32(8, true);
  let offset = 12;
  let json: string | null = null;
  let bin: ArrayBuffer | null = null;

  while (offset + 8 <= Math.min(length, view.byteLength)) {
    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    const start = offset + 8;
    if (start + chunkLength > view.byteLength) break;
    if (chunkType === 0x4e4f534a) json = new TextDecoder().decode(new Uint8Array(buffer, start, chunkLength));
    else if (chunkType === 0x004e4942) bin = buffer.slice(start, start + chunkLength);
    // Chunks are 4-byte aligned.
    offset = start + chunkLength + ((4 - (chunkLength % 4)) % 4);
  }
  if (!json) throw new MsgError(msg('data.modelParse.glbNoJson'));
  return parseGltfJson(json, bin);
}

function parseGltfJson(jsonText: string, bin: ArrayBuffer | null): RawMesh {
  const gltf = JSON.parse(jsonText) as {
    meshes?: Array<{
      name?: string;
      primitives: Array<{
        attributes: Record<string, number>;
        indices?: number;
        mode?: number;
        material?: number;
      }>;
    }>;
    materials?: Array<{
      pbrMetallicRoughness?: { baseColorTexture?: { index: number; texCoord?: number } };
      alphaMode?: string;
      alphaCutoff?: number;
    }>;
    textures?: Array<{ source?: number; sampler?: number }>;
    samplers?: Array<{ wrapS?: number; wrapT?: number }>;
    images?: Array<{ bufferView?: number; mimeType?: string; uri?: string }>;
    nodes?: Array<{
      name?: string;
      mesh?: number;
      children?: number[];
      matrix?: number[];
      translation?: number[];
      rotation?: number[];
      scale?: number[];
    }>;
    scenes?: Array<{ nodes?: number[] }>;
    scene?: number;
    accessors?: GltfAccessor[];
    bufferViews?: Array<{ buffer: number; byteOffset?: number; byteLength: number; byteStride?: number }>;
    buffers?: Array<{ byteLength: number; uri?: string }>;
  };

  if (!gltf.meshes?.length) throw new MsgError(msg('data.modelParse.noMeshes'));

  const buffers: Array<ArrayBuffer | null> = (gltf.buffers ?? []).map((b, i) => {
    if (!b.uri) return i === 0 ? bin : null;
    if (b.uri.startsWith('data:')) {
      const comma = b.uri.indexOf(',');
      const bytes = base64ToBytes(b.uri.slice(comma + 1));
      return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    }
    // External .bin files would need to be picked alongside the .gltf; a single
    // .glb avoids the problem entirely and is what exporters produce by default.
    return null;
  });

  const readAccessor = (index: number | undefined): Float32Array | Uint32Array | null => {
    if (index === undefined) return null;
    const acc = gltf.accessors?.[index];
    if (!acc || acc.bufferView === undefined) return null;
    const bv = gltf.bufferViews?.[acc.bufferView];
    if (!bv) return null;
    const buf = buffers[bv.buffer];
    if (!buf) {
      throw new MsgError(msg('data.modelParse.externalBuffer'));
    }
    const comps = TYPE_COMPONENTS[acc.type] ?? 1;
    const compSize = COMPONENT_SIZE[acc.componentType] ?? 4;
    const base = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    const stride = bv.byteStride ?? comps * compSize;
    const dv = new DataView(buf);
    const total = acc.count * comps;

    // Interleaved buffer views are legal and common, so read element by element
    // rather than assuming a tight typed-array view.
    if (acc.componentType === 5126) {
      const out = new Float32Array(total);
      for (let i = 0; i < acc.count; i++) {
        for (let c = 0; c < comps; c++) {
          out[i * comps + c] = dv.getFloat32(base + i * stride + c * 4, true);
        }
      }
      return out;
    }
    // Normalised integers (glTF core for UVs and colours, KHR_mesh_quantization
    // for normals) come back as the floats they stand for, so everything that
    // reads an attribute keeps reading floats. A large extracted course stores
    // its normals in bytes and its UVs in shorts, a third off a gigabyte file.
    if (acc.normalized) {
      const out = new Float32Array(total);
      const read =
        acc.componentType === 5120
          ? (o: number) => Math.max(dv.getInt8(o) / 127, -1)
          : acc.componentType === 5121
            ? (o: number) => dv.getUint8(o) / 255
            : acc.componentType === 5122
              ? (o: number) => Math.max(dv.getInt16(o, true) / 32767, -1)
              : (o: number) => dv.getUint16(o, true) / 65535;
      for (let i = 0; i < acc.count; i++) {
        for (let c = 0; c < comps; c++) {
          out[i * comps + c] = read(base + i * stride + c * compSize);
        }
      }
      return out;
    }
    const out = new Uint32Array(total);
    for (let i = 0; i < acc.count; i++) {
      for (let c = 0; c < comps; c++) {
        const o = base + i * stride + c * compSize;
        out[i * comps + c] =
          acc.componentType === 5125
            ? dv.getUint32(o, true)
            : acc.componentType === 5123
              ? dv.getUint16(o, true)
              : dv.getUint8(o);
      }
    }
    return out;
  };

  const builder = new MeshBuilder();
  builder.images = readImages(gltf.images ?? [], gltf.bufferViews ?? [], buffers);
  markCutouts(gltf.materials ?? [], gltf.textures ?? [], builder.images);
  markWrapping(gltf.materials ?? [], gltf.textures ?? [], gltf.samplers ?? [], builder.images);

  /**
   * The image a primitive's base colour comes from, and the UVs that address it.
   *
   * Only the base-colour texture. Coordinates stored as normalised shorts or
   * bytes arrive here already as floats (see `readAccessor`); anything else is
   * not a texture coordinate this can use.
   */
  const textureOf = (prim: {
    attributes: Record<string, number>;
    material?: number;
  }): { image: number; uvs: Float32Array | null } => {
    const slot = gltf.materials?.[prim.material ?? -1]?.pbrMetallicRoughness?.baseColorTexture;
    if (!slot) return { image: -1, uvs: null };
    const source = gltf.textures?.[slot.index]?.source;
    if (source === undefined || !builder.images[source]?.bytes.length) return { image: -1, uvs: null };
    const raw = readAccessor(prim.attributes[`TEXCOORD_${slot.texCoord ?? 0}`]);
    if (!(raw instanceof Float32Array)) return { image: -1, uvs: null };
    return { image: source, uvs: raw };
  };

  const visit = (nodeIndex: number, parent: Float32Array | null, depth: number): void => {
    if (depth > 64) return;
    const node = gltf.nodes?.[nodeIndex];
    if (!node) return;
    const local = nodeMatrix(node);
    const world = parent ? multiply(parent, local) : local;

    if (node.mesh !== undefined) {
      const mesh = gltf.meshes?.[node.mesh];
      for (const prim of mesh?.primitives ?? []) {
        // mode 4 is TRIANGLES; anything else is lines or points, not surface.
        if (prim.mode !== undefined && prim.mode !== 4) continue;
        const pos = readAccessor(prim.attributes.POSITION);
        if (!(pos instanceof Float32Array)) continue;
        const nrmRaw = readAccessor(prim.attributes.NORMAL);
        const nrm = nrmRaw instanceof Float32Array ? nrmRaw : null;
        const idxRaw = readAccessor(prim.indices);
        const idx = idxRaw ? new Uint32Array(idxRaw) : null;
        // COLOR_0 is optional and, per the specification, may be VEC3 or VEC4.
        // Only the colour channels are wanted; alpha on a level surface would
        // mean "see through the ground", which is not what a capture is saying.
        const colRaw = readAccessor(prim.attributes.COLOR_0);
        const col = colRaw instanceof Float32Array ? asRgb(colRaw, pos.length / 3) : null;
        const tex = textureOf(prim);
        builder.addTriangleSoup(
          pos,
          nrm,
          idx,
          world,
          partName(node, mesh, nodeIndex),
          col,
          tex.uvs,
          tex.image,
        );
      }
    }
    for (const child of node.children ?? []) visit(child, world, depth + 1);
  };

  const sceneIndex = gltf.scene ?? 0;
  const roots = gltf.scenes?.[sceneIndex]?.nodes ?? gltf.nodes?.map((_, i) => i) ?? [];
  for (const r of roots) visit(r, null, 0);

  if (builder.vertexCount === 0) {
    // No usable scene graph; fall back to every mesh at the origin.
    for (const mesh of gltf.meshes ?? []) {
      for (const prim of mesh.primitives) {
        if (prim.mode !== undefined && prim.mode !== 4) continue;
        const pos = readAccessor(prim.attributes.POSITION);
        if (!(pos instanceof Float32Array)) continue;
        const nrmRaw = readAccessor(prim.attributes.NORMAL);
        const idxRaw = readAccessor(prim.indices);
        const colRaw = readAccessor(prim.attributes.COLOR_0);
        const tex = textureOf(prim);
        builder.addTriangleSoup(
          pos,
          nrmRaw instanceof Float32Array ? nrmRaw : null,
          idxRaw ? new Uint32Array(idxRaw) : null,
          null,
          'mesh',
          colRaw instanceof Float32Array ? asRgb(colRaw, pos.length / 3) : null,
          tex.uvs,
          tex.image,
        );
      }
    }
  }
  return builder.finish();
}

/**
 * Give each image a MASK material draws its cutoff (glTF's default, 0.5, when
 * the material states none).
 *
 * Per image rather than per material because the atlas works in images: the
 * cutoff is applied to the image's texels there, once, and the shaders then
 * test every textured fragment against one fixed threshold. An image some
 * material draws opaque and another masked is treated as masked.
 */
export function markCutouts(
  materials: Array<{
    pbrMetallicRoughness?: { baseColorTexture?: { index: number } };
    alphaMode?: string;
    alphaCutoff?: number;
  }>,
  textures: Array<{ source?: number }>,
  images: RawImage[],
): void {
  for (const material of materials) {
    if (material.alphaMode !== 'MASK') continue;
    const slot = material.pbrMetallicRoughness?.baseColorTexture;
    const source = slot ? textures[slot.index]?.source : undefined;
    if (source === undefined || !images[source]) continue;
    images[source].cutoff = material.alphaCutoff ?? 0.5;
  }
}

/** glTF's CLAMP_TO_EDGE; REPEAT (10497) is the default, MIRRORED_REPEAT (33648) is drawn as REPEAT. */
const CLAMP_TO_EDGE = 33071;

/**
 * Note, per image, whether its base-colour textures repeat along each axis.
 *
 * Per image for the same reason as the cutoff: the atlas works in images. An
 * image one texture repeats and another clamps is treated as repeating; it
 * only becomes a tile where its UVs actually leave 0..1, which a clamping
 * material's do not need to.
 */
export function markWrapping(
  materials: Array<{ pbrMetallicRoughness?: { baseColorTexture?: { index: number } } }>,
  textures: Array<{ source?: number; sampler?: number }>,
  samplers: Array<{ wrapS?: number; wrapT?: number }>,
  images: RawImage[],
): void {
  const seen = new Set<number>();
  for (const material of materials) {
    const slot = material.pbrMetallicRoughness?.baseColorTexture;
    const texture = slot ? textures[slot.index] : undefined;
    const source = texture?.source;
    if (source === undefined || !images[source]) continue;
    const sampler = texture?.sampler !== undefined ? samplers[texture.sampler] : undefined;
    const u = (sampler?.wrapS ?? 10497) !== CLAMP_TO_EDGE;
    const v = (sampler?.wrapT ?? 10497) !== CLAMP_TO_EDGE;
    const image = images[source];
    image.repeatU = seen.has(source) ? image.repeatU || u : u;
    image.repeatV = seen.has(source) ? image.repeatV || v : v;
    seen.add(source);
  }
}

/**
 * The file's images, still encoded.
 *
 * Embedded ones only - a buffer view, or a `data:` URI. An image referenced by
 * a relative path would have to be picked alongside the file, and a missing one
 * leaves its slot empty so every later image keeps its index.
 */
function readImages(
  images: Array<{ bufferView?: number; mimeType?: string; uri?: string }>,
  views: Array<{ buffer: number; byteOffset?: number; byteLength: number }>,
  buffers: Array<ArrayBuffer | null>,
): RawImage[] {
  return images.map((image) => {
    if (image.bufferView !== undefined) {
      const view = views[image.bufferView];
      const buffer = view ? buffers[view.buffer] : null;
      if (!view || !buffer) return { mime: image.mimeType ?? '', bytes: new Uint8Array(0) };
      const start = view.byteOffset ?? 0;
      return {
        mime: image.mimeType ?? '',
        bytes: new Uint8Array(buffer.slice(start, start + view.byteLength)),
      };
    }
    if (image.uri?.startsWith('data:')) {
      const comma = image.uri.indexOf(',');
      const header = image.uri.slice(5, comma);
      return {
        mime: image.mimeType ?? header.split(';')[0],
        bytes: base64ToBytes(image.uri.slice(comma + 1)),
      };
    }
    return { mime: image.mimeType ?? '', bytes: new Uint8Array(0) };
  });
}

/**
 * Best available name for a primitive, for classification.
 *
 * Node name first: exporters put the meaningful label there ("Terrain",
 * "House_03") while mesh names are often generic. Falls back to an index so
 * every part is at least distinguishable.
 */
function partName(
  node: { name?: string },
  mesh: { name?: string } | undefined,
  nodeIndex: number,
): string {
  return node.name || mesh?.name || `node_${nodeIndex}`;
}

function nodeMatrix(node: {
  matrix?: number[];
  translation?: number[];
  rotation?: number[];
  scale?: number[];
}): Float32Array {
  if (node.matrix) return new Float32Array(node.matrix);
  const t = node.translation ?? [0, 0, 0];
  const r = node.rotation ?? [0, 0, 0, 1];
  const s = node.scale ?? [1, 1, 1];
  const [x, y, z, w] = r;
  const x2 = x + x;
  const y2 = y + y;
  const z2 = z + z;
  const xx = x * x2;
  const xy = x * y2;
  const xz = x * z2;
  const yy = y * y2;
  const yz = y * z2;
  const zz = z * z2;
  const wx = w * x2;
  const wy = w * y2;
  const wz = w * z2;
  // Column-major, matching glTF's own convention.
  return new Float32Array([
    (1 - (yy + zz)) * s[0], (xy + wz) * s[0], (xz - wy) * s[0], 0,
    (xy - wz) * s[1], (1 - (xx + zz)) * s[1], (yz + wx) * s[1], 0,
    (xz + wy) * s[2], (yz - wx) * s[2], (1 - (xx + yy)) * s[2], 0,
    t[0], t[1], t[2], 1,
  ]);
}

function multiply(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
  }
  return out;
}

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ----------------------------------------------------------------------- OBJ

export function parseObj(text: string): RawMesh {
  // Typed, as in `MeshBuilder`: a plain array stops growing at a length the
  // browser chooses, as low as 64M elements.
  const pos = new GrowableF32();
  const nrm = new GrowableF32();
  const outPos = new GrowableF32();
  const outNrm = new GrowableF32();
  // One index list per `o`/`g` block. Object names are the strongest signal for
  // telling terrain from the buildings standing on it, so they are preserved
  // rather than flattened into a single mesh.
  const groups: Array<{ name: string; idx: GrowableU32 }> = [];
  let current: { name: string; idx: GrowableU32 } = { name: 'mesh', idx: new GrowableU32(1024) };
  groups.push(current);
  // Vertex/normal pairs are deduplicated so shared corners stay shared, which is
  // what lets the simplifier collapse across them later.
  const cache = new Map<string, number>();

  /** Component `c` of item `i` in a column of triples; 0 past its end. */
  const read = (column: GrowableF32, i: number, c: number): number =>
    i >= 0 && i * 3 + c < column.length ? column.raw()[i * 3 + c] : 0;

  const emit = (vRef: number, nRef: number): number => {
    const key = `${vRef}/${nRef}`;
    const hit = cache.get(key);
    if (hit !== undefined) return hit;
    const id = outPos.length / 3;
    for (let c = 0; c < 3; c++) outPos.push(read(pos, vRef, c));
    for (let c = 0; c < 3; c++) outNrm.push(nRef >= 0 ? read(nrm, nRef, c) : 0);
    cache.set(key, id);
    return id;
  };

  const resolve = (raw: number, count: number) => (raw < 0 ? count + raw : raw - 1);

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (line.length === 0 || line[0] === '#') continue;
    const sp = line.indexOf(' ');
    const tag = sp < 0 ? line : line.slice(0, sp);
    if (tag === 'o' || tag === 'g') {
      const name = sp < 0 ? '' : line.slice(sp + 1).trim();
      // Reuse the initial group if nothing has been emitted into it yet, so a
      // file that opens with `o Terrain` does not leave an empty part behind.
      if (current.idx.length === 0) {
        current.name = name || current.name;
      } else {
        current = { name: name || `group_${groups.length}`, idx: new GrowableU32(1024) };
        groups.push(current);
      }
    } else if (tag === 'v') {
      const p = line.slice(sp + 1).trim().split(/\s+/);
      for (let c = 0; c < 3; c++) pos.push(Number(p[c]) || 0);
    } else if (tag === 'vn') {
      const p = line.slice(sp + 1).trim().split(/\s+/);
      for (let c = 0; c < 3; c++) nrm.push(Number(p[c]) || 0);
    } else if (tag === 'f') {
      const parts = line.slice(sp + 1).trim().split(/\s+/);
      const corners: number[] = [];
      for (const part of parts) {
        const bits = part.split('/');
        const v = resolve(Number(bits[0]), pos.length / 3);
        const n = bits[2] ? resolve(Number(bits[2]), nrm.length / 3) : -1;
        corners.push(emit(v, n));
      }
      // Fan-triangulate: OBJ faces are arbitrary convex polygons.
      for (let i = 2; i < corners.length; i++) {
        current.idx.push(corners[0]);
        current.idx.push(corners[i - 1]);
        current.idx.push(corners[i]);
      }
    }
  }

  const builder = new MeshBuilder();
  const base = builder.addVertices(outPos.finish(), outNrm.finish());
  for (const g of groups) builder.addPart(g.name, g.idx.finish(), base);
  return builder.finish();
}

// ----------------------------------------------------------------------- STL

export function parseStl(buffer: ArrayBuffer): RawMesh {
  const view = new DataView(buffer);
  // Binary STL: 80-byte header, then a u32 count, then 50 bytes per triangle.
  const expected = (n: number) => 84 + n * 50;
  const asciiish = new TextDecoder().decode(new Uint8Array(buffer, 0, Math.min(256, buffer.byteLength)));
  if (buffer.byteLength >= 84) {
    const count = view.getUint32(80, true);
    if (expected(count) === buffer.byteLength) return parseStlBinary(view, count);
  }
  if (/^\s*solid/i.test(asciiish)) return parseStlAscii(new TextDecoder().decode(buffer));
  if (buffer.byteLength >= 84) return parseStlBinary(view, view.getUint32(80, true));
  throw new MsgError(msg('data.modelParse.badStl'));
}

function parseStlBinary(view: DataView, count: number): RawMesh {
  const positions = new Float32Array(count * 9);
  const normals = new Float32Array(count * 9);
  let o = 84;
  for (let t = 0; t < count; t++) {
    if (o + 50 > view.byteLength) break;
    const nx = view.getFloat32(o, true);
    const ny = view.getFloat32(o + 4, true);
    const nz = view.getFloat32(o + 8, true);
    for (let v = 0; v < 3; v++) {
      const p = o + 12 + v * 12;
      positions[t * 9 + v * 3] = view.getFloat32(p, true);
      positions[t * 9 + v * 3 + 1] = view.getFloat32(p + 4, true);
      positions[t * 9 + v * 3 + 2] = view.getFloat32(p + 8, true);
      normals[t * 9 + v * 3] = nx;
      normals[t * 9 + v * 3 + 1] = ny;
      normals[t * 9 + v * 3 + 2] = nz;
    }
    o += 50;
  }
  const builder = new MeshBuilder();
  builder.addTriangleSoup(positions, normals, null, null);
  return builder.finish();
}

function parseStlAscii(text: string): RawMesh {
  const positions: number[] = [];
  const normals: number[] = [];
  let nx = 0;
  let ny = 0;
  let nz = 0;
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (line.startsWith('facet normal')) {
      const p = line.split(/\s+/);
      nx = Number(p[2]) || 0;
      ny = Number(p[3]) || 0;
      nz = Number(p[4]) || 0;
    } else if (line.startsWith('vertex')) {
      const p = line.split(/\s+/);
      positions.push(Number(p[1]) || 0, Number(p[2]) || 0, Number(p[3]) || 0);
      normals.push(nx, ny, nz);
    }
  }
  const builder = new MeshBuilder();
  builder.addTriangleSoup(new Float32Array(positions), new Float32Array(normals), null, null);
  return builder.finish();
}

// ----------------------------------------------------------------------- PLY

export function parsePly(buffer: ArrayBuffer): RawMesh {
  const head = new TextDecoder().decode(new Uint8Array(buffer, 0, Math.min(4096, buffer.byteLength)));
  const endIdx = head.indexOf('end_header');
  if (endIdx < 0) throw new MsgError(msg('data.modelParse.noPlyHeader'));
  const header = head.slice(0, endIdx);
  if (!/format\s+ascii/i.test(header)) {
    throw new MsgError(msg('data.modelParse.binaryPly'));
  }
  const text = new TextDecoder().decode(buffer);
  const bodyStart = text.indexOf('\n', text.indexOf('end_header')) + 1;
  const vertexCount = Number(/element\s+vertex\s+(\d+)/i.exec(header)?.[1] ?? 0);
  const faceCount = Number(/element\s+face\s+(\d+)/i.exec(header)?.[1] ?? 0);
  const lines = text.slice(bodyStart).split('\n');

  const positions = new Float32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount; i++) {
    const p = (lines[i] ?? '').trim().split(/\s+/);
    positions[i * 3] = Number(p[0]) || 0;
    positions[i * 3 + 1] = Number(p[1]) || 0;
    positions[i * 3 + 2] = Number(p[2]) || 0;
  }
  const idx: number[] = [];
  for (let f = 0; f < faceCount; f++) {
    const p = (lines[vertexCount + f] ?? '').trim().split(/\s+/);
    const n = Number(p[0]) || 0;
    for (let i = 2; i < n; i++) {
      idx.push(Number(p[1]), Number(p[i]), Number(p[i + 1]));
    }
  }
  const builder = new MeshBuilder();
  builder.addTriangleSoup(positions, null, new Uint32Array(idx), null);
  return builder.finish();
}

/** Parse by extension. */
export async function parseModel(file: File): Promise<RawMesh> {
  const format = detectModelFormat(file.name);
  if (!format) throw new MsgError(msg('data.modelParse.unsupported', { file: file.name }));
  if (format === 'obj') return parseObj(await file.text());
  const buffer = await file.arrayBuffer();
  if (format === 'glb' || format === 'gltf') return parseGlb(buffer);
  if (format === 'stl') return parseStl(buffer);
  return parsePly(buffer);
}
