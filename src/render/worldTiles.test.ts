import { Matrix4, OrthographicCamera, PerspectiveCamera } from 'three';
import { describe, expect, it } from 'vitest';
import type { Bounds } from '../state/types';
import type { WorldTile } from '../world/tileSet';
import {
  boxOutsideFrustum,
  diffWorldTiles,
  frustumPlanes,
  textureBytes,
  worldTileBufferBytes,
} from './worldTiles';

const tile = (id: string, vertexCount = 4): WorldTile => ({
  id,
  vertices: new Float32Array(vertexCount * 6),
  colours: new Float32Array(vertexCount * 3),
  uvs: null,
  image: null,
  indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
  structureIndices: new Uint32Array(0),
  structureEdges: new Uint32Array(0),
  waterIndices: new Uint32Array(0),
  bounds: { minX: 0, minY: 0, minZ: 0, maxX: 1, maxY: 1, maxZ: 1 },
});

const held = (...tiles: WorldTile[]) => new Map(tiles.map((t) => [t.id, t]));

describe('diffWorldTiles', () => {
  it('uploads only what it has not seen and frees only what is gone', () => {
    const a = tile('1/0/0');
    const b = tile('1/0/1');
    const c = tile('1/1/0');
    const { added, removed } = diffWorldTiles(held(a, b), [b, c]);
    expect(added).toEqual([c]);
    expect(removed).toEqual(['1/0/0']);
  });

  it('replaces a tile whose object changed under the same id', () => {
    // A tile is never changed in place; a new object is new content.
    const a = tile('1/0/0');
    const a2 = tile('1/0/0');
    const { added, removed } = diffWorldTiles(held(a), [a2]);
    expect(added).toEqual([a2]);
    expect(removed).toEqual(['1/0/0']);
  });

  it('does nothing for the same set, and frees everything for an empty one', () => {
    const a = tile('1/0/0');
    expect(diffWorldTiles(held(a), [a])).toEqual({ added: [], removed: [] });
    expect(diffWorldTiles(held(a), [])).toEqual({ added: [], removed: ['1/0/0'] });
  });
});

describe('world tile bytes', () => {
  it('counts the always-backed colour and UV buffers', () => {
    // 4 vertices: 96 interleaved + 48 colour + 32 UV, and 6 ground indices.
    expect(worldTileBufferBytes(tile('t'))).toBe(96 + 48 + 32 + 24);
  });

  it('adds a third for a mip chain', () => {
    expect(textureBytes(256, 256, false)).toBe(262144);
    expect(textureBytes(256, 256, true)).toBe(Math.round(262144 * 1.34));
  });
});

/** A box of half-size `h` round a point. */
const box = (x: number, y: number, z: number, h = 1): Bounds => ({
  minX: x - h,
  minY: y - h,
  minZ: z - h,
  maxX: x + h,
  maxY: y + h,
  maxZ: z + h,
});

const viewProj = (camera: PerspectiveCamera | OrthographicCamera): Float32Array => {
  camera.updateMatrixWorld();
  const m = new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  return new Float32Array(m.elements);
};

describe('frustum culling', () => {
  // At the origin, looking down -Z, 90 degrees wide.
  const persp = new PerspectiveCamera(90, 1, 0.5, 1000);
  const planes = frustumPlanes(viewProj(persp));

  it('keeps a box in front of the camera', () => {
    expect(boxOutsideFrustum(planes, box(0, 0, -50))).toBe(false);
  });

  it('drops a box behind the camera or off to a side', () => {
    expect(boxOutsideFrustum(planes, box(0, 0, 50))).toBe(true);
    expect(boxOutsideFrustum(planes, box(200, 0, -50))).toBe(true);
    expect(boxOutsideFrustum(planes, box(0, -200, -50))).toBe(true);
  });

  it('keeps a box that only straddles an edge', () => {
    // Centre outside the 45-degree edge at x = 50, but reaching back inside it.
    expect(boxOutsideFrustum(planes, box(55, 0, -50, 10))).toBe(false);
  });

  it('keeps a box far past the far plane, which it does not test', () => {
    // The far distance is the user's; the depth range cuts what lies past it.
    expect(boxOutsideFrustum(planes, box(0, 0, -5000))).toBe(false);
  });

  it('works for a parallel projection too', () => {
    const ortho = new OrthographicCamera(-10, 10, 10, -10, 0.5, 1000);
    const p = frustumPlanes(viewProj(ortho));
    expect(boxOutsideFrustum(p, box(0, 0, -50))).toBe(false);
    expect(boxOutsideFrustum(p, box(30, 0, -50))).toBe(true);
    expect(boxOutsideFrustum(p, box(0, 0, 50))).toBe(true);
  });
});
