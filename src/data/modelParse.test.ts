import { describe, expect, it } from 'vitest';
import { computeNormals, markWrapping, parseGlb, parseObj, parsePly, parseStl, type RawImage } from './modelParse';
import { simplifyMesh } from './simplify';

/** A unit cube as 12 triangles, used as the shared fixture across formats. */
const CUBE_CORNERS = [
  [0, 0, 0],
  [1, 0, 0],
  [1, 1, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [1, 1, 1],
  [0, 1, 1],
];
const CUBE_FACES = [
  [0, 1, 2],
  [0, 2, 3],
  [4, 6, 5],
  [4, 7, 6],
  [0, 4, 5],
  [0, 5, 1],
  [1, 5, 6],
  [1, 6, 2],
  [2, 6, 7],
  [2, 7, 3],
  [3, 7, 4],
  [3, 4, 0],
];

function objCube(): string {
  const lines = CUBE_CORNERS.map((c) => `v ${c[0]} ${c[1]} ${c[2]}`);
  for (const f of CUBE_FACES) lines.push(`f ${f[0] + 1} ${f[1] + 1} ${f[2] + 1}`);
  return `# cube\n${lines.join('\n')}\n`;
}

function binaryStlCube(): ArrayBuffer {
  const tris = CUBE_FACES.length;
  const buf = new ArrayBuffer(84 + tris * 50);
  const view = new DataView(buf);
  view.setUint32(80, tris, true);
  let o = 84;
  for (const f of CUBE_FACES) {
    // Normals left at zero so the parser has to derive them.
    o += 12;
    for (const vi of f) {
      const c = CUBE_CORNERS[vi];
      view.setFloat32(o, c[0], true);
      view.setFloat32(o + 4, c[1], true);
      view.setFloat32(o + 8, c[2], true);
      o += 12;
    }
    o += 2; // attribute byte count
  }
  return buf;
}

function glbCube(withNormals: boolean): ArrayBuffer {
  const positions = new Float32Array(CUBE_CORNERS.flat());
  const indices = new Uint16Array(CUBE_FACES.flat());
  const normals = withNormals
    ? new Float32Array(CUBE_CORNERS.map((c) => [c[0] - 0.5, c[1] - 0.5, c[2] - 0.5]).flat())
    : null;

  const parts: ArrayBufferView[] = [positions, indices];
  if (normals) parts.push(normals);
  // 4-byte align every view, as the spec requires.
  let binLength = 0;
  const offsets: number[] = [];
  for (const p of parts) {
    binLength += (4 - (binLength % 4)) % 4;
    offsets.push(binLength);
    binLength += p.byteLength;
  }
  binLength += (4 - (binLength % 4)) % 4;

  const bin = new Uint8Array(binLength);
  parts.forEach((p, i) => {
    bin.set(new Uint8Array(p.buffer, p.byteOffset, p.byteLength), offsets[i]);
  });

  const bufferViews: unknown[] = [
    { buffer: 0, byteOffset: offsets[0], byteLength: positions.byteLength },
    { buffer: 0, byteOffset: offsets[1], byteLength: indices.byteLength },
  ];
  const accessors: unknown[] = [
    { bufferView: 0, componentType: 5126, count: CUBE_CORNERS.length, type: 'VEC3' },
    { bufferView: 1, componentType: 5123, count: indices.length, type: 'SCALAR' },
  ];
  const attributes: Record<string, number> = { POSITION: 0 };
  if (normals) {
    bufferViews.push({ buffer: 0, byteOffset: offsets[2], byteLength: normals.byteLength });
    accessors.push({ bufferView: 2, componentType: 5126, count: CUBE_CORNERS.length, type: 'VEC3' });
    attributes.NORMAL = 2;
  }

  const json = JSON.stringify({
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, translation: [10, 0, 0] }],
    meshes: [{ primitives: [{ attributes, indices: 1, mode: 4 }] }],
    accessors,
    bufferViews,
    buffers: [{ byteLength: binLength }],
  });

  const jsonBytes = new TextEncoder().encode(json);
  const jsonPad = (4 - (jsonBytes.length % 4)) % 4;
  const total = 12 + 8 + jsonBytes.length + jsonPad + 8 + binLength;
  const out = new ArrayBuffer(total);
  const dv = new DataView(out);
  const bytes = new Uint8Array(out);

  dv.setUint32(0, 0x46546c67, true); // 'glTF'
  dv.setUint32(4, 2, true);
  dv.setUint32(8, total, true);
  dv.setUint32(12, jsonBytes.length + jsonPad, true);
  dv.setUint32(16, 0x4e4f534a, true); // 'JSON'
  bytes.set(jsonBytes, 20);
  for (let i = 0; i < jsonPad; i++) bytes[20 + jsonBytes.length + i] = 0x20;
  const binHeader = 20 + jsonBytes.length + jsonPad;
  dv.setUint32(binHeader, binLength, true);
  dv.setUint32(binHeader + 4, 0x004e4942, true); // 'BIN'
  bytes.set(bin, binHeader + 8);
  return out;
}

function boundsOf(vertices: Float32Array) {
  const b = { minX: Infinity, minY: Infinity, minZ: Infinity, maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity };
  for (let i = 0; i < vertices.length; i += 6) {
    b.minX = Math.min(b.minX, vertices[i]);
    b.maxX = Math.max(b.maxX, vertices[i]);
    b.minY = Math.min(b.minY, vertices[i + 1]);
    b.maxY = Math.max(b.maxY, vertices[i + 1]);
    b.minZ = Math.min(b.minZ, vertices[i + 2]);
    b.maxZ = Math.max(b.maxZ, vertices[i + 2]);
  }
  return b;
}

/** Wrap raw arrays as a RawMesh with a single all-encompassing part. */
function asRawMesh(vertices: Float32Array, indices: Uint32Array) {
  const bounds = boundsOf(vertices);
  return {
    vertices,
    indices,
    triangles: indices.length / 3,
    bounds,
    parts: [{ name: 'test', start: 0, count: indices.length, upFacing: 1, bounds }],
  };
}

function normalsAreUnit(vertices: Float32Array): boolean {
  for (let i = 0; i < vertices.length; i += 6) {
    const len = Math.hypot(vertices[i + 3], vertices[i + 4], vertices[i + 5]);
    if (Math.abs(len - 1) > 1e-3) return false;
  }
  return true;
}

describe('OBJ', () => {
  it('parses a cube with fan-triangulated faces', () => {
    const m = parseObj(objCube());
    expect(m.triangles).toBe(12);
    expect(m.bounds).toMatchObject({ minX: 0, maxX: 1, minY: 0, maxY: 1, minZ: 0, maxZ: 1 });
    expect(normalsAreUnit(m.vertices)).toBe(true);
  });

  it('triangulates a quad face into two triangles', () => {
    const obj = 'v 0 0 0\nv 1 0 0\nv 1 1 0\nv 0 1 0\nf 1 2 3 4\n';
    expect(parseObj(obj).triangles).toBe(2);
  });

  it('handles negative (relative) indices', () => {
    const obj = 'v 0 0 0\nv 1 0 0\nv 0 1 0\nf -3 -2 -1\n';
    expect(parseObj(obj).triangles).toBe(1);
  });

  it('reads separate vertex and normal indices', () => {
    const obj =
      'v 0 0 0\nv 1 0 0\nv 0 1 0\nvn 0 0 1\nvn 0 0 1\nvn 0 0 1\nf 1//1 2//2 3//3\n';
    const m = parseObj(obj);
    expect(m.triangles).toBe(1);
    expect(Array.from(m.vertices.slice(3, 6))).toEqual([0, 0, 1]);
  });

  it('refuses a file with no faces', () => {
    expect(() => parseObj('v 0 0 0\nv 1 0 0\n')).toThrow(/no triangles/i);
  });

  it('keeps object names as separate parts', () => {
    // Object names are what tells terrain from the buildings on it, so they must
    // survive parsing rather than being flattened into one mesh.
    const obj = [
      'o Terrain',
      'v 0 0 0',
      'v 10 0 0',
      'v 0 0 10',
      'f 1 2 3',
      'o House_1',
      'v 1 0 1',
      'v 2 0 1',
      'v 1 5 1',
      'f 4 5 6',
    ].join('\n');
    const m = parseObj(obj);
    expect(m.parts.map((p) => p.name)).toEqual(['Terrain', 'House_1']);
    expect(m.parts[0].count).toBe(3);
    expect(m.parts[1].count).toBe(3);
    // Vertices are shared across objects in OBJ, so they must not be duplicated.
    expect(m.vertices.length / 6).toBe(6);
  });

  it('treats `g` the same as `o`', () => {
    const obj = 'g A\nv 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\ng B\nf 1 2 3\n';
    expect(parseObj(obj).parts.map((p) => p.name)).toEqual(['A', 'B']);
  });

  it('does not leave an empty part when the file opens with a name', () => {
    const m = parseObj('o Only\nv 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\n');
    expect(m.parts.length).toBe(1);
    expect(m.parts[0].name).toBe('Only');
  });

  it('measures up-facing area per part', () => {
    // A horizontal triangle is fully up-facing; a vertical one is not at all.
    const obj = [
      'o Flat',
      'v 0 0 0',
      'v 10 0 0',
      'v 0 0 10',
      'f 1 2 3',
      'o Wall',
      'v 0 0 0',
      'v 10 0 0',
      'v 0 10 0',
      'f 4 5 6',
    ].join('\n');
    const m = parseObj(obj);
    expect(m.parts[0].upFacing).toBeCloseTo(1, 5);
    expect(m.parts[1].upFacing).toBeCloseTo(0, 5);
  });
});

describe('STL', () => {
  it('parses binary STL and derives normals', () => {
    const m = parseStl(binaryStlCube());
    expect(m.triangles).toBe(12);
    expect(m.bounds).toMatchObject({ minX: 0, maxX: 1, maxY: 1, maxZ: 1 });
    // Source normals were zero, so they must have been computed.
    expect(normalsAreUnit(m.vertices)).toBe(true);
  });

  it('parses ASCII STL', () => {
    const ascii = `solid t
facet normal 0 0 1
  outer loop
    vertex 0 0 0
    vertex 1 0 0
    vertex 0 1 0
  endloop
endfacet
endsolid t`;
    const m = parseStl(new TextEncoder().encode(ascii).buffer as ArrayBuffer);
    expect(m.triangles).toBe(1);
    expect(Array.from(m.vertices.slice(3, 6))).toEqual([0, 0, 1]);
  });
});

describe('PLY', () => {
  it('parses ASCII PLY', () => {
    const ply = `ply
format ascii 1.0
element vertex 3
property float x
property float y
property float z
element face 1
property list uchar int vertex_index
end_header
0 0 0
1 0 0
0 1 0
3 0 1 2
`;
    const m = parsePly(new TextEncoder().encode(ply).buffer as ArrayBuffer);
    expect(m.triangles).toBe(1);
    expect(normalsAreUnit(m.vertices)).toBe(true);
  });

  it('rejects binary PLY with a message that says what to do', () => {
    const ply = 'ply\nformat binary_little_endian 1.0\nend_header\n';
    expect(() => parsePly(new TextEncoder().encode(ply).buffer as ArrayBuffer)).toThrow(/glb|stl/i);
  });
});

describe('glTF / GLB', () => {
  it('parses a GLB and applies the node transform', () => {
    const m = parseGlb(glbCube(true));
    expect(m.triangles).toBe(12);
    // The node translates by +10 on X, so the geometry must arrive translated.
    expect(m.bounds.minX).toBeCloseTo(10, 5);
    expect(m.bounds.maxX).toBeCloseTo(11, 5);
    expect(m.bounds.minY).toBeCloseTo(0, 5);
  });

  it('derives normals when the file has none', () => {
    const m = parseGlb(glbCube(false));
    expect(m.triangles).toBe(12);
    expect(normalsAreUnit(m.vertices)).toBe(true);
  });

  it('rejects a truncated file rather than producing garbage', () => {
    expect(() => parseGlb(new ArrayBuffer(4))).toThrow();
  });

  it('reports an actionable error for external buffers', () => {
    const json = JSON.stringify({
      asset: { version: '2.0' },
      scene: 0,
      scenes: [{ nodes: [0] }],
      nodes: [{ mesh: 0 }],
      meshes: [{ primitives: [{ attributes: { POSITION: 0 }, mode: 4 }] }],
      accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3' }],
      bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 36 }],
      buffers: [{ byteLength: 36, uri: 'scene.bin' }],
    });
    expect(() => parseGlb(new TextEncoder().encode(json).buffer as ArrayBuffer)).toThrow(/\.glb/i);
  });
});

describe('computeNormals', () => {
  it('produces the correct facing for a known triangle', () => {
    // Counter-clockwise in the XZ plane viewed from +Y -> normal points +Y.
    const vertices = new Float32Array([
      0, 0, 0, 0, 0, 0,
      1, 0, 0, 0, 0, 0,
      0, 0, -1, 0, 0, 0,
    ]);
    computeNormals(vertices, new Uint32Array([0, 1, 2]));
    expect(vertices[4]).toBeCloseTo(1, 5);
    expect(Math.abs(vertices[3])).toBeLessThan(1e-6);
  });

  it('leaves a degenerate triangle with a usable normal', () => {
    const vertices = new Float32Array([
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
    ]);
    computeNormals(vertices, new Uint32Array([0, 1, 2]));
    // Must be a unit vector, not NaN, or the shading maths breaks downstream.
    expect(normalsAreUnit(vertices)).toBe(true);
  });
});

describe('simplifyMesh', () => {
  /** A subdivided grid: enough connected triangles to actually decimate. */
  function grid(n: number) {
    const positions: number[] = [];
    const idx: number[] = [];
    for (let y = 0; y <= n; y++) {
      for (let x = 0; x <= n; x++) {
        // A gentle dome, so the simplifier has real curvature to work with.
        const h = Math.sin((x / n) * Math.PI) * Math.sin((y / n) * Math.PI) * 3;
        positions.push(x, h, y, 0, 1, 0);
      }
    }
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const a = y * (n + 1) + x;
        idx.push(a, a + 1, a + n + 1, a + 1, a + n + 2, a + n + 1);
      }
    }
    const vertices = new Float32Array(positions);
    const indices = new Uint32Array(idx);
    computeNormals(vertices, indices);
    return asRawMesh(vertices, indices);
  }

  it('skips work when the mesh is already under target', async () => {
    const mesh = grid(4);
    const r = await simplifyMesh(mesh, 1e9);
    expect(r.skipped).toBe(true);
    expect(r.mesh).toBe(mesh);
  });

  it('reduces the triangle count and keeps the mesh valid', async () => {
    const mesh = grid(40); // 3200 triangles
    const r = await simplifyMesh(mesh, 400);
    expect(r.skipped).toBe(false);
    expect(r.mesh.triangles).toBeLessThan(mesh.triangles);
    expect(r.mesh.triangles).toBeGreaterThan(0);
    expect(r.mesh.indices.length % 3).toBe(0);

    // Every index must address a real vertex after compaction.
    const vertexCount = r.mesh.vertices.length / 6;
    for (let i = 0; i < r.mesh.indices.length; i++) {
      expect(r.mesh.indices[i]).toBeLessThan(vertexCount);
    }
    // No vertex should survive unreferenced.
    const seen = new Set(Array.from(r.mesh.indices));
    expect(seen.size).toBe(vertexCount);
  });

  it('keeps the silhouette: bounds stay close to the original', async () => {
    const mesh = grid(40);
    const r = await simplifyMesh(mesh, 300);
    const before = mesh.bounds;
    const after = boundsOf(r.mesh.vertices);
    const span = before.maxX - before.minX;
    // A simplifier that wrecked the shape would move the extents noticeably.
    expect(Math.abs(after.minX - before.minX)).toBeLessThan(span * 0.02);
    expect(Math.abs(after.maxX - before.maxX)).toBeLessThan(span * 0.02);
    expect(after.maxY).toBeGreaterThan(before.maxY * 0.7);
  });

  it('can simplify an unwelded mesh by remapping positions first', async () => {
    // STL-style: every triangle has its own three vertices, nothing shared.
    const src = grid(30);
    const positions: number[] = [];
    for (let i = 0; i < src.indices.length; i++) {
      const v = src.indices[i] * 6;
      for (let c = 0; c < 6; c++) positions.push(src.vertices[v + c]);
    }
    const vertices = new Float32Array(positions);
    const indices = new Uint32Array(vertices.length / 6);
    for (let i = 0; i < indices.length; i++) indices[i] = i;
    const unwelded = asRawMesh(vertices, indices);

    const r = await simplifyMesh(unwelded, 200);
    // Without the position remap this would be unable to collapse anything.
    expect(r.mesh.triangles).toBeLessThan(unwelded.triangles / 2);
  });
});

/**
 * Two quads in one GLB: the first textured through TEXCOORD_0 and an embedded
 * image, the second plain. The image bytes are not a real JPEG - parsing keeps
 * images encoded and never decodes them, which is the point: the atlas is built
 * in the worker, where a canvas exists.
 */
function glbTexturedAndPlain(plainFirst = false, mask: Record<string, unknown> = {}): ArrayBuffer {
  const quad = [0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1];
  const positionsA = new Float32Array(quad);
  const positionsB = new Float32Array(quad.map((v, i) => (i % 3 === 0 ? v + 5 : v)));
  const uvs = new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]);
  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
  const image = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4, 0xff, 0xd9]);
  // The textured quad also carries a colour, so a plain part read before it
  // has to be given grey after the fact.
  const colour = new Float32Array([0.9, 0.2, 0.1, 0.9, 0.2, 0.1, 0.9, 0.2, 0.1, 0.9, 0.2, 0.1]);
  const parts: ArrayBufferView[] = [positionsA, positionsB, uvs, indices, image, colour];
  let binLength = 0;
  const offsets: number[] = [];
  for (const p of parts) {
    binLength += (4 - (binLength % 4)) % 4;
    offsets.push(binLength);
    binLength += p.byteLength;
  }
  binLength += (4 - (binLength % 4)) % 4;
  const bin = new Uint8Array(binLength);
  parts.forEach((p, i) => bin.set(new Uint8Array(p.buffer, p.byteOffset, p.byteLength), offsets[i]));
  const views = parts.map((p, i) => ({ buffer: 0, byteOffset: offsets[i], byteLength: p.byteLength }));
  const json = JSON.stringify({
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: plainFirst ? [1, 0] : [0, 1] }],
    nodes: [{ mesh: 0, name: 'ground:road x1 z1' }, { mesh: 1, name: 'structure:barriers' }],
    meshes: [
      { name: 'ground:road x1 z1', primitives: [{ attributes: { POSITION: 0, TEXCOORD_0: 2, COLOR_0: 4 }, indices: 3, material: 0, mode: 4 }] },
      { name: 'structure:barriers', primitives: [{ attributes: { POSITION: 1 }, indices: 3, material: 1, mode: 4 }] },
    ],
    materials: [
      { pbrMetallicRoughness: { baseColorTexture: { index: 0 } }, ...mask },
      { pbrMetallicRoughness: { baseColorFactor: [0.5, 0.5, 0.5, 1] } },
    ],
    textures: [{ source: 0, sampler: 0 }],
    samplers: [{}],
    images: [{ bufferView: 4, mimeType: 'image/jpeg' }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 4, type: 'VEC3' },
      { bufferView: 1, componentType: 5126, count: 4, type: 'VEC3' },
      { bufferView: 2, componentType: 5126, count: 4, type: 'VEC2' },
      { bufferView: 3, componentType: 5123, count: 6, type: 'SCALAR' },
      { bufferView: 5, componentType: 5126, count: 4, type: 'VEC3' },
    ],
    bufferViews: views,
    buffers: [{ byteLength: binLength }],
  });
  const jsonBytes = new TextEncoder().encode(json);
  const jsonPad = (4 - (jsonBytes.length % 4)) % 4;
  const total = 12 + 8 + jsonBytes.length + jsonPad + 8 + binLength;
  const out = new ArrayBuffer(total);
  const dv = new DataView(out);
  const bytes = new Uint8Array(out);
  dv.setUint32(0, 0x46546c67, true);
  dv.setUint32(4, 2, true);
  dv.setUint32(8, total, true);
  dv.setUint32(12, jsonBytes.length + jsonPad, true);
  dv.setUint32(16, 0x4e4f534a, true);
  bytes.set(jsonBytes, 20);
  for (let i = 0; i < jsonPad; i++) bytes[20 + jsonBytes.length + i] = 0x20;
  const binHeader = 20 + jsonBytes.length + jsonPad;
  dv.setUint32(binHeader, binLength, true);
  dv.setUint32(binHeader + 4, 0x004e4942, true);
  bytes.set(bin, binHeader + 8);
  return out;
}

describe('glTF textures', () => {
  it('marks an image a MASK material draws with its cutoff, and only that', () => {
    expect(parseGlb(glbTexturedAndPlain()).images![0].cutoff).toBeUndefined();
    const masked = parseGlb(glbTexturedAndPlain(false, { alphaMode: 'MASK', alphaCutoff: 0.3 }));
    expect(masked.images![0].cutoff).toBe(0.3);
    // glTF's default cutoff when the material states none.
    expect(parseGlb(glbTexturedAndPlain(false, { alphaMode: 'MASK' })).images![0].cutoff).toBe(0.5);
    // BLEND is translucency, not a cut-out; it is still drawn opaque.
    expect(parseGlb(glbTexturedAndPlain(false, { alphaMode: 'BLEND' })).images![0].cutoff).toBeUndefined();
  });

  it('keeps the UVs, which image each vertex uses, and the image itself', () => {
    const m = parseGlb(glbTexturedAndPlain());
    expect(m.images).toHaveLength(1);
    expect(m.images![0].mime).toBe('image/jpeg');
    expect(Array.from(m.images![0].bytes.slice(0, 2))).toEqual([0xff, 0xd8]);
    expect(m.uvs).toBeTruthy();
    expect(m.imageOf).toBeTruthy();
    // Four vertices per quad; the textured quad's point at image 0, the plain
    // one's at nothing.
    const imageOf = Array.from(m.imageOf!);
    expect(imageOf.filter((i) => i === 0)).toHaveLength(4);
    expect(imageOf.filter((i) => i === -1)).toHaveLength(4);
    const textured = imageOf.findIndex((i) => i === 0);
    const uv = [m.uvs![textured * 2], m.uvs![textured * 2 + 1]];
    expect(uv.every((v) => v >= 0 && v <= 1)).toBe(true);
  });

  it('gives vertices read before the first textured, coloured part no texture and grey', () => {
    // The texture and colour columns are made when first needed and filled in
    // for what came before: a plain part first must not shift the rest.
    const m = parseGlb(glbTexturedAndPlain(true));
    const imageOf = Array.from(m.imageOf!);
    expect(imageOf).toEqual([-1, -1, -1, -1, 0, 0, 0, 0]);
    expect(Array.from(m.uvs!.slice(0, 8))).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(Array.from(m.uvs!.slice(8)).every((v) => v >= 0 && v <= 1)).toBe(true);
    expect(m.uvs).toHaveLength(16);
    expect(m.colours).toHaveLength(24);
    expect(Array.from(m.colours!.slice(0, 12))).toEqual(new Array(12).fill(0.5));
    expect(m.colours![12]).toBeCloseTo(0.9);
    expect(m.colours![14]).toBeCloseTo(0.1);
  });

  it('notes per image whether its textures repeat, glTF default included', () => {
    const image = (): RawImage => ({ mime: 'image/png', bytes: new Uint8Array([1]) });
    const images = [image(), image(), image(), image()];
    markWrapping(
      [0, 1, 2, 3, 4].map((index) => ({ pbrMetallicRoughness: { baseColorTexture: { index } } })),
      [{ source: 0 }, { source: 1, sampler: 0 }, { source: 2, sampler: 1 }, { source: 3, sampler: 1 }, { source: 3, sampler: 2 }],
      [{ wrapS: 33071, wrapT: 10497 }, { wrapS: 33071, wrapT: 33071 }, { wrapS: 33648 }],
      images,
    );
    // No sampler: REPEAT both ways.
    expect([images[0].repeatU, images[0].repeatV]).toEqual([true, true]);
    // Clamped along u only.
    expect([images[1].repeatU, images[1].repeatV]).toEqual([false, true]);
    // Clamped both ways.
    expect([images[2].repeatU, images[2].repeatV]).toEqual([false, false]);
    // Clamped by one texture, mirrored (drawn as repeating) by another: repeats.
    expect([images[3].repeatU, images[3].repeatV]).toEqual([true, true]);
  });

  it('a file with no textures carries none', () => {
    const m = parseGlb(glbCube(true));
    expect(m.images ?? []).toHaveLength(0);
    expect(m.uvs ?? null).toBeNull();
  });
});

/**
 * One textured quad written the way the course exporter writes by default:
 * normals as signed bytes four to a vertex, UVs as normalised shorts, indices
 * as shorts.
 */
function glbQuantisedQuad(): ArrayBuffer {
  const positions = new Float32Array([0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1]);
  const normals = new Int8Array([0, 127, 0, 0, 76, 102, 0, 0, 0, 102, -76, 0, -127, 0, 0, 0]);
  const uvs = new Uint16Array([0, 0, 65535, 0, 65535, 65535, 16384, 32768]);
  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
  const image = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
  const parts: ArrayBufferView[] = [positions, normals, uvs, indices, image];
  let binLength = 0;
  const offsets: number[] = [];
  for (const p of parts) {
    binLength += (4 - (binLength % 4)) % 4;
    offsets.push(binLength);
    binLength += p.byteLength;
  }
  binLength += (4 - (binLength % 4)) % 4;
  const bin = new Uint8Array(binLength);
  parts.forEach((p, i) => bin.set(new Uint8Array(p.buffer, p.byteOffset, p.byteLength), offsets[i]));
  const views = parts.map((p, i) => ({ buffer: 0, byteOffset: offsets[i], byteLength: p.byteLength }));
  (views[1] as Record<string, number>).byteStride = 4;
  const json = JSON.stringify({
    asset: { version: '2.0' },
    extensionsUsed: ['KHR_mesh_quantization'],
    extensionsRequired: ['KHR_mesh_quantization'],
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ name: 'structure:sign', primitives: [{ attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 }, indices: 3, material: 0, mode: 4 }] }],
    materials: [{ pbrMetallicRoughness: { baseColorTexture: { index: 0 } } }],
    textures: [{ source: 0 }],
    images: [{ bufferView: 4, mimeType: 'image/jpeg' }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 4, type: 'VEC3' },
      { bufferView: 1, componentType: 5120, normalized: true, count: 4, type: 'VEC3' },
      { bufferView: 2, componentType: 5123, normalized: true, count: 4, type: 'VEC2' },
      { bufferView: 3, componentType: 5123, count: 6, type: 'SCALAR' },
    ],
    bufferViews: views,
    buffers: [{ byteLength: binLength }],
  });
  const jsonBytes = new TextEncoder().encode(json);
  const jsonPad = (4 - (jsonBytes.length % 4)) % 4;
  const total = 12 + 8 + jsonBytes.length + jsonPad + 8 + binLength;
  const out = new ArrayBuffer(total);
  const dv = new DataView(out);
  const bytes = new Uint8Array(out);
  dv.setUint32(0, 0x46546c67, true);
  dv.setUint32(4, 2, true);
  dv.setUint32(8, total, true);
  dv.setUint32(12, jsonBytes.length + jsonPad, true);
  dv.setUint32(16, 0x4e4f534a, true);
  bytes.set(jsonBytes, 20);
  for (let i = 0; i < jsonPad; i++) bytes[20 + jsonBytes.length + i] = 0x20;
  const binHeader = 20 + jsonBytes.length + jsonPad;
  dv.setUint32(binHeader, binLength, true);
  dv.setUint32(binHeader + 4, 0x004e4942, true);
  bytes.set(bin, binHeader + 8);
  return out;
}

describe('quantised glTF', () => {
  it('reads byte normals, short UVs and short indices as the values they stand for', () => {
    const m = parseGlb(glbQuantisedQuad());
    expect(m.triangles).toBe(2);
    // Normals are interleaved after positions, six floats a vertex, and come
    // back unit length from bytes: 127 is 1.0.
    const n0 = [m.vertices[3], m.vertices[4], m.vertices[5]];
    expect(n0[1]).toBeCloseTo(1, 2);
    for (let v = 0; v < 4; v++) {
      const len = Math.hypot(m.vertices[v * 6 + 3], m.vertices[v * 6 + 4], m.vertices[v * 6 + 5]);
      expect(len).toBeGreaterThan(0.99);
    }
    expect(m.uvs).toBeTruthy();
    const uvs = Array.from(m.uvs!);
    expect(uvs.every((u) => u >= 0 && u <= 1)).toBe(true);
    expect(uvs).toContain(1);
    expect(uvs.some((u) => Math.abs(u - 0.25) < 1e-3)).toBe(true);
  });
});

describe('unusable vertices', () => {
  it('drops the triangles that touch them and keeps them out of the bounds', () => {
    // A broken exporter's empty box: one corner at 1e32.
    const m = parseObj(['v 0 0 0', 'v 1 0 0', 'v 0 0 1', 'v 1e32 0 0', 'f 1 2 3', 'f 2 4 3'].join('\n'));
    expect(m.triangles).toBe(1);
    expect(m.bounds.maxX).toBe(1);
    expect(m.parts.reduce((sum, p) => sum + p.count, 0)).toBe(3);
  });

  it('refuses a file with nothing usable left', () => {
    expect(() => parseObj(['v 0 -1e32 0', 'v 1 0 0', 'v 0 0 1', 'f 1 2 3'].join('\n'))).toThrow();
  });
});
