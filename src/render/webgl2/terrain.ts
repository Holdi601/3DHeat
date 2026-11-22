import { nodeGrid } from '../../world/terrainLod';
import { INSTANCE_FLOATS, UPLOADS_PER_FRAME, type TerrainFrame, type TerrainStream } from '../../world/terrainStream';
import { compileProgram, UniformCache } from './glutil';
import { MESH_FS, TERRAIN_VS } from './shaders';

/**
 * A tiled terrain's ground on WebGL2 (src/world/terrainStream.ts); the WebGPU
 * renderer's `terrain.ts` does the same. Heights and classes in two integer
 * texture arrays, a layer a tile; one instanced draw of a 32 x 32 grid per
 * frame. The caller sets the mesh look's uniforms (relief, slice, cull,
 * opacity) through `u` and binds the atlas units, as for any ground.
 */

/** Tile layers held, at most. */
const MAX_LAYERS = 256;

/** Texture units the terrain's arrays take (above the atlas and tile table). */
const HEIGHT_UNIT = 6;
const CLASS_UNIT = 7;

export class GlTerrain {
  readonly prog: WebGLProgram;
  readonly u: UniformCache;
  private readonly vao: WebGLVertexArrayObject;
  private readonly instanceBuf: WebGLBuffer;
  private instanceCap = 0;
  private readonly gridCount: number;
  private readonly indexType: number;
  private heights: WebGLTexture | null = null;
  private classes: WebGLTexture | null = null;
  private stream: TerrainStream | null = null;
  private side = 0;
  readonly capacity: number;
  private readonly buffers: WebGLBuffer[] = [];

  constructor(private readonly gl: WebGL2RenderingContext) {
    this.capacity = Math.min(MAX_LAYERS, gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS) as number);
    this.prog = compileProgram(gl, TERRAIN_VS, MESH_FS, 'terrain');
    this.u = new UniformCache(gl, this.prog);
    const g = nodeGrid();
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    const grid = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, grid);
    gl.bufferData(gl.ARRAY_BUFFER, g.vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 12, 0);
    this.instanceBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuf);
    for (let k = 0; k < 3; k++) {
      gl.enableVertexAttribArray(5 + k);
      gl.vertexAttribPointer(5 + k, 4, gl.FLOAT, false, INSTANCE_FLOATS * 4, k * 16);
      gl.vertexAttribDivisor(5 + k, 1);
    }
    const index = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.indices, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    this.vao = vao;
    this.buffers.push(grid, index, this.instanceBuf);
    this.gridCount = g.indices.length;
    this.indexType = g.indices instanceof Uint16Array ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;
  }

  /** GPU bytes held for tiles. */
  get bytes(): number {
    return this.heights ? this.capacity * this.side * this.side * 3 : 0;
  }

  private makeArray(internal: number): WebGLTexture {
    const gl = this.gl;
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, t);
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, internal, this.side, this.side, this.capacity);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return t;
  }

  /** Takes `stream` on (its tiles go up again from the start) and writes the tiles that arrived. */
  prepare(stream: TerrainStream): void {
    const gl = this.gl;
    if (stream !== this.stream) {
      this.stream = stream;
      this.side = stream.side;
      if (this.heights) gl.deleteTexture(this.heights);
      if (this.classes) gl.deleteTexture(this.classes);
      this.heights = this.makeArray(gl.R16UI);
      this.classes = this.makeArray(gl.R8UI);
      stream.attach(this.capacity);
    }
    const ups = stream.takeUploads(UPLOADS_PER_FRAME);
    if (!ups.length) return;
    const side = this.side;
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    for (const up of ups) {
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.heights);
      gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, up.slot, side, side, 1, gl.RED_INTEGER, gl.UNSIGNED_SHORT, up.heights);
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.classes);
      gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, up.slot, side, side, 1, gl.RED_INTEGER, gl.UNSIGNED_BYTE, up.classes);
    }
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
  }

  /** Draws `frame`'s nodes with the program in use and its look already set (`u`). */
  draw(frame: TerrainFrame, palette: Float32Array): void {
    const gl = this.gl;
    if (!frame.count || !this.heights || !this.classes) return;
    const floats = frame.count * INSTANCE_FLOATS;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuf);
    if (this.instanceCap < floats) {
      this.instanceCap = Math.max(floats, 16 * 1024);
      gl.bufferData(gl.ARRAY_BUFFER, this.instanceCap * 4, gl.DYNAMIC_DRAW);
    }
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, frame.instances, 0, floats);
    gl.activeTexture(gl.TEXTURE0 + HEIGHT_UNIT);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.heights);
    this.u.i1('uHeights', HEIGHT_UNIT);
    gl.activeTexture(gl.TEXTURE0 + CLASS_UNIT);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.classes);
    this.u.i1('uClasses', CLASS_UNIT);
    gl.activeTexture(gl.TEXTURE0);
    const pal = this.u.loc('uPalette[0]') ?? this.u.loc('uPalette');
    if (pal) gl.uniform4fv(pal, palette);
    this.u.f1('uSide', this.side);
    gl.bindVertexArray(this.vao);
    gl.drawElementsInstanced(gl.TRIANGLES, this.gridCount, this.indexType, 0, frame.count);
    gl.bindVertexArray(null);
    gl.activeTexture(gl.TEXTURE0 + HEIGHT_UNIT);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
    gl.activeTexture(gl.TEXTURE0 + CLASS_UNIT);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
    gl.activeTexture(gl.TEXTURE0);
  }

  dispose(): void {
    const gl = this.gl;
    if (this.heights) gl.deleteTexture(this.heights);
    if (this.classes) gl.deleteTexture(this.classes);
    for (const b of this.buffers) gl.deleteBuffer(b);
    gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.prog);
    this.stream = null;
  }
}
