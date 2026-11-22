import { boxOutsideFrustum } from '../worldTiles';
import { BOX_FLOATS, unitCube, type TerrainBoxes } from '../../world/terrainObjects';
import { compileProgram, UniformCache } from './glutil';
import { BOX_VS, MESH_FS, PEEL_BOX_VS, PEEL_FS } from './shaders';

/**
 * A tiled terrain's placed objects on WebGL2 (src/world/terrainObjects.ts); the
 * WebGPU renderer's `boxes.ts` does the same. One unit cube, an instance buffer
 * per cell of the map, one instanced draw per cell in view. `mesh` takes the
 * structure passes' look (MESH_FS), `peel` the depth-peel layers' (PEEL_FS);
 * the caller sets their uniforms as for the level's own structures.
 */

/** Instance bytes written a frame, at most (one cell always). */
const UPLOAD_BYTES = 1024 * 1024;

export interface GlBoxCell {
  src: TerrainBoxes;
  buffer: WebGLBuffer;
}

export class GlBoxes {
  readonly mesh: { prog: WebGLProgram; u: UniformCache };
  readonly peel: { prog: WebGLProgram; u: UniformCache };
  private readonly vao: WebGLVertexArrayObject;
  private readonly cube: WebGLBuffer;
  private readonly cubeIndex: WebGLBuffer;
  private readonly held = new Map<string, GlBoxCell>();
  private queue: TerrainBoxes[] = [];
  private version = -1;
  private source: object | null = null;
  bytes = 0;

  constructor(private readonly gl: WebGL2RenderingContext) {
    const mesh = compileProgram(gl, BOX_VS, MESH_FS, 'boxes');
    const peel = compileProgram(gl, PEEL_BOX_VS, PEEL_FS, 'boxes peel');
    this.mesh = { prog: mesh, u: new UniformCache(gl, mesh) };
    this.peel = { prog: peel, u: new UniformCache(gl, peel) };
    const c = unitCube();
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    this.cube = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cube);
    gl.bufferData(gl.ARRAY_BUFFER, c.vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
    for (let k = 0; k < 3; k++) {
      gl.enableVertexAttribArray(5 + k);
      gl.vertexAttribDivisor(5 + k, 1);
    }
    this.cubeIndex = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeIndex);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, c.indices, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
  }

  /** Takes on the sets of `owner` at `version`: gone cells freed, new ones written a megabyte a frame. */
  sync(owner: object, sets: readonly TerrainBoxes[], version: number): void {
    const gl = this.gl;
    if (owner !== this.source) {
      this.clear();
      this.source = owner;
    }
    if (version !== this.version) {
      this.version = version;
      const want = new Map(sets.map((s) => [s.id, s]));
      for (const [id, h] of this.held) {
        if (want.get(id) !== h.src) {
          gl.deleteBuffer(h.buffer);
          this.bytes -= h.src.instances.byteLength;
          this.held.delete(id);
        }
      }
      this.queue = sets.filter((s) => !this.held.has(s.id) && s.count > 0);
    }
    let written = 0;
    while (this.queue.length && (written === 0 || written < UPLOAD_BYTES)) {
      const s = this.queue.shift()!;
      const buffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, s.instances, gl.STATIC_DRAW);
      this.held.set(s.id, { src: s, buffer });
      this.bytes += s.instances.byteLength;
      written += s.instances.byteLength;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  get pending(): boolean {
    return this.queue.length > 0;
  }

  inView(planes: Float32Array): GlBoxCell[] {
    const out: GlBoxCell[] = [];
    for (const h of this.held.values()) if (!boxOutsideFrustum(planes, h.src.bounds)) out.push(h);
    return out;
  }

  /** Draws `cells` with the program in use and its uniforms set. */
  draw(cells: readonly GlBoxCell[]): void {
    const gl = this.gl;
    if (!cells.length) return;
    gl.bindVertexArray(this.vao);
    for (const h of cells) {
      gl.bindBuffer(gl.ARRAY_BUFFER, h.buffer);
      for (let k = 0; k < 3; k++) gl.vertexAttribPointer(5 + k, 4, gl.FLOAT, false, BOX_FLOATS * 4, k * 16);
      gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, h.src.count);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
  }

  clear(): void {
    for (const h of this.held.values()) this.gl.deleteBuffer(h.buffer);
    this.held.clear();
    this.queue = [];
    this.bytes = 0;
    this.version = -1;
    this.source = null;
  }

  dispose(): void {
    this.clear();
    this.gl.deleteBuffer(this.cube);
    this.gl.deleteBuffer(this.cubeIndex);
    this.gl.deleteVertexArray(this.vao);
    this.gl.deleteProgram(this.mesh.prog);
    this.gl.deleteProgram(this.peel.prog);
  }
}
