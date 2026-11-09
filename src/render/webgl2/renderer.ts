import { VOL_CFG, VOL_INFO, VOL_M, VOL_POLY, VOLUME_BLOCK_FLOATS, type VolumeDraw } from '../../volumes/gpu';
import { GlFigures } from './figures';
import { GlSymbols } from './symbols';
import { GlPost } from './post';
import { GlTracks } from './tracks';
import { ATLAS_MIP_LEVELS } from '../../data/atlas';
import { packLineStarts, type LineData } from '../../data/lines';
import { CURVE_LUT_SIZE } from '../../state/curve';
import type { Bounds, Dataset } from '../../state/types';
import { LUT_HEIGHT, LUT_WIDTH } from '../colors';
import { filterColumnData, packSignTables } from '../filterTables';
import { halfToFloat } from '../half';
import {
  BLOCK_TEX_WIDTH,
  CHUNK_ROWS,
  FILTER_MASK_ROWS,
  FILTER_MASK_WIDTH,
  GpuInitError,
  HEAT_DEPTH_LAYERS,
  MAX_FILTER_SLOTS,
  MAX_PLAN_BLOCKS,
  SAMPLE_BLOCK,
  TILE_TABLE_WIDTH,
  type ActiveFilter,
  type BackendKind,
  type CapturedFrame,
  type FrameParams,
  type FrameResult,
  type GpuLimits,
  type Renderer,
  type SliceDraw,
} from '../types';
import {
  checkFramebuffer,
  compileProgram,
  createTexture,
  GlError,
  probeFloatSupport,
  UniformCache,
  warmPrograms,
  type FloatTargetSupport,
} from './glutil';
import {
  COMPOSITE_FS,
  CUBE_FS,
  CUBE_VS,
  FULLSCREEN_VS,
  HEAT_FS,
  HEAT_VS,
  LINE_FS,
  LINE_HEAT_FS,
  LINE_HEAT_VS,
  LINE_VS,
  LOOK_FS,
  LOOK_VS,
  MAP_FS,
  MAP_VS,
  MESH_FS,
  MESH_VS,
  PEEL_FS,
  PEEL_VS,
  WIRE_FS,
  WIRE_VS,
  BLEND_FS,
  SCALE_FS,
} from './shaders';
import { buildEdgeList, type Level } from '../level';
import { boxOutsideFrustum, diffWorldTiles, frustumPlanes, textureBytes } from '../worldTiles';
import type { WorldTile } from '../../world/tileSet';
import { num, t } from '../../i18n';

/** Texture width for the row store. Power of two so the shader can shift/mask. */
const ROW_TEX_WIDTH = 8192;
const ROW_TEX_SHIFT = 13;
/** Per-frame block index texture: 16 rows of 4096, whichever chunk they serve. */
const MAX_BLOCKS = MAX_PLAN_BLOCKS;
const BLOCK_SHIFT = Math.log2(SAMPLE_BLOCK);
/**
 * Texture unit for line heat's segment starts. Past the sixteen the point splat
 * already fills; WebGL2 guarantees 32 combined units and 16 per vertex stage, of
 * which the vertex stage then uses eleven.
 */
const LINE_UNIT = 16;
/** The tile table's texture unit; see `bindAtlas`. */
const TILE_UNIT = 17;

/** A chunk on its way to the GPU, a slice a frame; see `flushDataUpload`. */
interface PendingChunk {
  start: number;
  rows: number;
  /** The next row to read: bounds first, then packing. */
  cursor: number;
  packing: boolean;
  min: [number, number, number];
  max: [number, number, number];
  posTex: WebGLTexture | null;
  timeTex: WebGLTexture | null;
}

interface GpuChunk {
  posTex: WebGLTexture;
  /** First dataset row in this chunk. */
  start: number;
  /**
   * Line heat: where each row's segment starts, and its flags (RGBA16UI, laid
   * out like `posTex`). Only while line heat has routes; see `setLines`.
   */
  lineTex: WebGLTexture | null;
  /**
   * Quantised row time and lifetime. Allocated only when the dataset has both a
   * time and a person column, since a lifetime is undefined without both — and
   * at 2 bytes per row per channel it is not worth carrying speculatively.
   */
  timeTex: WebGLTexture | null;
  rows: number;
  aabbMin: [number, number, number];
  aabbSize: [number, number, number];
  timeMin: number;
  /** Chunk time span / 65535, the dequantisation step. */
  timeScale: number;
  /** Lifetime cap / 65534; 65535 is reserved as the "no successor" sentinel. */
  lifeScale: number;
}

interface Prog {
  prog: WebGLProgram;
  u: UniformCache;
}

/** What `uploadMesh` reads: a model level's arrays, or a world tile's. */
interface MeshSource {
  vertices: Float32Array;
  colours: Float32Array | null | undefined;
  uvs: Float32Array | null | undefined;
  indices: Uint32Array;
  structureIndices: Uint32Array;
  structureEdges: Uint32Array;
  waterIndices: Uint32Array;
  uvTiles?: Uint16Array | null;
  tileRects?: Float32Array | null;
}

/**
 * One mesh's GPU resources: the model level's, or one streamed world tile's.
 *
 * The level and every tile are the same kind of thing - interleaved
 * position+normal, colour, UVs, and ground / structure / water / edge index sets
 * over the one vertex buffer - so they share the upload and every draw pass.
 */
interface GlMesh {
  vbo: WebGLBuffer;
  colourVbo: WebGLBuffer;
  uvVbo: WebGLBuffer;
  tileVbo: WebGLBuffer | null;
  tileTex: WebGLTexture | null;
  /** The level's atlas once decoded, or a tile's own image; null without one. */
  texture: WebGLTexture | null;
  /** Shaded VAO, its element buffer the ground's; the other sets are swapped in and back. */
  vao: WebGLVertexArrayObject;
  /** Positions only, with the structure edges. */
  wireVao: WebGLVertexArrayObject;
  groundIbo: WebGLBuffer | null;
  structIbo: WebGLBuffer | null;
  wireIbo: WebGLBuffer | null;
  waterIbo: WebGLBuffer | null;
  groundCount: number;
  structCount: number;
  wireCount: number;
  waterCount: number;
  /** Ground edges, built the first time the ground is asked for as a wireframe. */
  groundWireIbo: WebGLBuffer | null;
  groundWireCount: number;
  groundIndices: Uint32Array;
  /** GPU footprint, growing as the atlas and the ground's edges arrive. */
  bytes: number;
  /** For culling; null for the level, which is always drawn. */
  bounds: Bounds | null;
  /** A world tile, drawn with `LevelDraw.tiles` where the level's own look is resolved from its contents. */
  tile: boolean;
}

/** The scene pass's background; the tactical display swaps exactly this for its own. */
const SCENE_CLEAR = [0.086, 0.09, 0.102] as const;

export class Webgl2Renderer implements Renderer {
  readonly kind: BackendKind = 'webgl2';

  private readonly gl: WebGL2RenderingContext;
  private readonly float: FloatTargetSupport;
  /**
   * Accumulation format for the current mode: one channel, or four for team
   * colours.
   *
   * Mutable, because the wide target is only worth having in the one mode with
   * something to put in the extra channels. The heat pass is the hottest in the
   * program and it is blend-bound, so quadrupling its read-modify-write bandwidth
   * to carry three channels of zeroes is not a rounding error at 4K.
   */
  private heatInternalFormat: number;
  /** 1 or 4. Decides the internal format and the readback stride. */
  private heatChannels: 1 | 4 = 1;
  readonly heatPrecision: 'f16' | 'f32';

  private readonly heatProg: Prog;
  /** Line heat's splat, compiled the first time it is drawn. Null until then. */
  private lineHeatProg: Prog | null = null;
  /** Set when compiling it failed, so the failure is not retried every frame. */
  private lineHeatBroken = false;
  /** The routes `setLines` was given, for the box their starts are quantised to. */
  private lines: LineData | null = null;
  private readonly compositeProg: Prog;
  private readonly lineProg: Prog;
  private readonly cubeProg: Prog;
  private readonly lookProg: Prog;
  private readonly scaleProg: Prog;
  private readonly blendProg: Prog;
  private readonly mapProg: Prog;
  private readonly meshProg: Prog;
  private readonly wireProg: Prog;
  /** Depth-only peel pass; see peelDepthLayers. */
  private readonly peelProg: Prog;

  private chunks: GpuChunk[] = [];
  /** Ceiling on row-texture memory; overshooting it is what kills a context. */
  gpuBudgetBytes = 2 * 1024 ** 3;
  gpuBytesUsed = 0;
  residentRows = 0;
  /** Rows that did not fit and are therefore not being drawn at all. */
  droppedRows = 0;

  private width = 1;
  private height = 1;
  private heatWidth = 1;
  private heatHeight = 1;

  private sceneFbo: WebGLFramebuffer | null = null;
  private sceneColor: WebGLTexture | null = null;
  private sceneDepth: WebGLTexture | null = null;
  private heatFbo: WebGLFramebuffer | null = null;
  private heatColor: WebGLTexture | null = null;
  private heatDepth: WebGLTexture | null = null;
  /** One frame's estimate, before it is blended into `heatColor`. */
  private heatScratchFbo: WebGLFramebuffer | null = null;
  private heatScratch: WebGLTexture | null = null;

  private readonly blockTex: WebGLTexture;
  private readonly lutTex: WebGLTexture;
  private readonly curveTex: WebGLTexture;
  private teamSignTex: WebGLTexture | null = null;
  private teamSignWidth = 0;
  private teamSignBuf: Float32Array | null = null;
  private dummyUintTex: WebGLTexture | null = null;
  private blockStagingBuf: Int32Array | null = null;

  /**
   * Per-row filter values, uploaded on first use and keyed by chunk + column.
   *
   * Lazy because a filter column costs 4 bytes per row — 40MB per column on a
   * 10M-row dataset — and most retained columns are never actually filtered on.
   */
  private readonly filterTextures = new Map<string, WebGLTexture>();
  private filterMaskTex: WebGLTexture | null = null;
  private filterMaskDirty = '';
  /** Bound to unused filter units; sampling an unbound unit is undefined. */
  private dummyTex: WebGLTexture | null = null;
  private dataset: Dataset | null = null;

  private readonly emptyVao: WebGLVertexArrayObject;
  readonly gpuName: string | null;
  readonly gpuLimits: GpuLimits;

  private cubeVao: WebGLVertexArrayObject;
  private cubeGeom: WebGLBuffer;
  private cubeIndex: WebGLBuffer;
  private cubeInstances: WebGLBuffer;
  private cubeInstanceCapacity = 0;

  private lookVao: WebGLVertexArrayObject;
  private lookGeom: WebGLBuffer;

  private lineVao: WebGLVertexArrayObject;
  private lineBuf: WebGLBuffer;
  private lineVertCount = 0;
  private lineSignature = '';

  private trailVao: WebGLVertexArrayObject;
  private trailBuf: WebGLBuffer;
  private trailCapacity = 0;

  private overlayVao: WebGLVertexArrayObject;
  private overlayBuf: WebGLBuffer;
  private overlayCapacity = 0;
  /** The lines over the picture (`FrameParams.topVerts`), made when first asked for. */
  private top: { buf: WebGLBuffer; vao: WebGLVertexArrayObject; capacity: number } | null = null;
  private triVao: WebGLVertexArrayObject;
  /** Instanced figures, made on first use. */
  private figures: GlFigures | null = null;
  /** The camera relative to the frame's origin, for the figures. */
  private readonly relCamera = new Float32Array(3);
  private symbols: GlSymbols | null = null;
  /** The tactical display's screen pass; made the first time it is asked for. */
  private post: GlPost | null = null;
  /** Every unit of a large dataset placed on the GPU (transform feedback): `tracks.ts`. */
  private tracks: GlTracks | null = null;
  private triBuf: WebGLBuffer;
  private triCapacity = 0;

  /** Cached readPixels format/type for the heat target; 0 means not yet queried. */
  private readFormat = 0;
  private readType = 0;

  private mapTex: WebGLTexture | null = null;
  /** The model level's geometry; null for an image level or none. */
  private levelMesh: GlMesh | null = null;
  /**
   * The streamed world tiles' geometry, by tile id, with the tile object each
   * was uploaded from - identity is what says a tile is unchanged. See
   * `setWorldTiles`.
   */
  private tileMeshes = new Map<string, GlMesh>();
  private readonly tileSources = new Map<string, WorldTile>();
  /** What the tiles hold on the GPU, buffers and images together. */
  private tileBytes = 0;
  /**
   * The meshes this frame draws: the level's, then every tile in view. Decided
   * once per frame in `drawScene`, so the colour pass and every depth pass after
   * it draw exactly the same geometry - a tile in the colour but not in the depth
   * would show heat through a hill that is plainly there.
   */
  private frameMeshes: GlMesh[] = [];
  private readonly planes = new Float32Array(20);
  /**
   * Bumped on every level change, so an atlas that finishes decoding after the
   * level it belonged to was replaced is dropped rather than uploaded onto the
   * new one.
   */
  private atlasToken = 0;
  /** Peeled depth layers, nearest first. See HEAT_DEPTH_LAYERS. */
  private peelDepth: WebGLTexture[] = [];
  private peelFbo: WebGLFramebuffer[] = [];
  /**
   * The nearest *structure* surface, kept apart from the scene's depth.
   *
   * The scene depth holds the nearest surface of any kind, and that conflation is
   * what made one occlusion control unable to serve both terrain and walls. With
   * this beside it the heat pass can tell the two apart: something opaque in
   * front and no structure in front means the occluder is terrain.
   */
  private structDepth: WebGLTexture | null = null;
  private structDepthFbo: WebGLFramebuffer | null = null;
  /** The level's own GPU footprint: its map, or its mesh and atlas. */
  private levelOwnBytes = 0;

  /** Background geometry's GPU footprint, the world tiles included, reported alongside the row data. */
  get levelBytes(): number {
    return this.levelOwnBytes + this.tileBytes;
  }

  /** The GPU tracks' room here: their keys in integer textures, a square of the largest. */
  get gpuTracksMaxBytes(): number {
    return GlTracks.maxBytes(this.gl);
  }

  get gpuTracksBytes(): number {
    return this.tracks?.bytes ?? 0;
  }

  constructor(private readonly canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      // The scene renders into our own FBO, so the default framebuffer needs no
      // depth or stencil of its own.
      depth: false,
      stencil: false,
      desynchronized: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    if (!gl) throw new GpuInitError(t('render.backend.unavailable', { api: 'WebGL2' }));
    this.gl = gl;

    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const name = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : null;
    this.gpuName = typeof name === 'string' ? name : null;
    this.gpuLimits = {
      maxTextureSize: (gl.getParameter(gl.MAX_TEXTURE_SIZE) as number) || 0,
      // WebGL has no buffer-size limit to report.
      maxBufferBytes: null,
    };

    this.float = probeFloatSupport(gl);
    if (!this.float.renderF16 && !this.float.renderF32) {
      throw new GpuInitError(t('render.webgl2.noFloatTargets', { extension: 'EXT_color_buffer_float' }));
    }
    // 32-bit accumulation needs EXT_float_blend; without it the additive draw is
    // silently dropped, so fall back to 16-bit rather than render nothing.
    this.heatInternalFormat = this.float.blendF32 ? gl.R32F : gl.R16F;
    this.heatPrecision = this.float.blendF32 ? 'f32' : 'f16';

    const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
    const neededHeight = Math.ceil(CHUNK_ROWS / ROW_TEX_WIDTH);
    if (maxTex < ROW_TEX_WIDTH || maxTex < neededHeight) {
      throw new GpuInitError(
        t('render.webgl2.textureTooSmall', {
          limit: 'MAX_TEXTURE_SIZE',
          size: num(maxTex),
          needed: num(Math.max(ROW_TEX_WIDTH, neededHeight)),
        }),
      );
    }

    this.heatProg = this.makeProg(HEAT_VS, HEAT_FS, 'heat');
    this.compositeProg = this.makeProg(FULLSCREEN_VS, COMPOSITE_FS, 'composite');
    this.lineProg = this.makeProg(LINE_VS, LINE_FS, 'line');
    this.cubeProg = this.makeProg(CUBE_VS, CUBE_FS, 'cube');
    this.lookProg = this.makeProg(LOOK_VS, LOOK_FS, 'look');
    this.scaleProg = this.makeProg(FULLSCREEN_VS, SCALE_FS, 'scale');
    this.blendProg = this.makeProg(FULLSCREEN_VS, BLEND_FS, 'blend');
    this.mapProg = this.makeProg(MAP_VS, MAP_FS, 'map');
    this.meshProg = this.makeProg(MESH_VS, MESH_FS, 'mesh');
    this.wireProg = this.makeProg(WIRE_VS, WIRE_FS, 'wire');
    // Positions and the UVs: depth only, but a cut-out texel must not count as
    // a surface. See PEEL_FS.
    this.peelProg = this.makeProg(PEEL_VS, PEEL_FS, 'peel');

    const emptyVao = gl.createVertexArray();
    if (!emptyVao) throw new GpuInitError('createVertexArray failed');
    this.emptyVao = emptyVao;

    // Two-dimensional, not a single long row. A 16384x1 texture is past the limit
    // on plenty of drivers — 8192 is common — and going past it fails silently:
    // the allocation is dropped, every upload errors, and the shader reads zeros,
    // which makes the sampler draw block 0 of every chunk for ever.
    this.blockTex = createTexture(gl, {
      width: BLOCK_TEX_WIDTH,
      height: MAX_BLOCKS / BLOCK_TEX_WIDTH,
      internalFormat: gl.R32I,
      format: gl.RED_INTEGER,
      type: gl.INT,
    });
    this.lutTex = createTexture(gl, {
      width: LUT_WIDTH,
      height: LUT_HEIGHT,
      internalFormat: gl.RGBA8,
      format: gl.RGBA,
      type: gl.UNSIGNED_BYTE,
      filter: gl.LINEAR,
    });
    // R16F, not RGBA8: the ramp is sampled per fragment and then summed
    // thousands of times over, so quantisation error in it accumulates rather
    // than cancelling, and 8 bits shows as banding in a large sprite. R16F is
    // filterable in core WebGL2 where R32F needs OES_texture_float_linear, so
    // this gets linear interpolation for free — the table is uploaded as f32 and
    // converted by the driver.
    this.curveTex = createTexture(gl, {
      width: CURVE_LUT_SIZE,
      height: 1,
      internalFormat: gl.R16F,
      format: gl.RED,
      type: gl.FLOAT,
      filter: gl.LINEAR,
    });

    const cube = buildCubeGeometry();
    this.cubeGeom = mustBuffer(gl);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeGeom);
    gl.bufferData(gl.ARRAY_BUFFER, cube.vertices, gl.STATIC_DRAW);
    this.cubeIndex = mustBuffer(gl);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeIndex);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cube.indices, gl.STATIC_DRAW);
    this.cubeInstances = mustBuffer(gl);
    this.cubeVao = this.buildCubeVao();

    this.lookGeom = mustBuffer(gl);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lookGeom);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1]), gl.STATIC_DRAW);
    this.lookVao = this.buildLookVao();

    this.lineBuf = mustBuffer(gl);
    this.lineVao = this.buildLineVao(this.lineBuf);
    this.trailBuf = mustBuffer(gl);
    this.trailVao = this.buildLineVao(this.trailBuf);
    this.overlayBuf = mustBuffer(gl);
    this.overlayVao = this.buildLineVao(this.overlayBuf);
    // Same layout as a line vertex: position and colour.
    this.triBuf = mustBuffer(gl);
    this.triVao = this.buildLineVao(this.triBuf);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
    // The figures', the GPU tracks' and the glyphs' programs, started now and linked in the background: the
    // first frame of a replay would otherwise wait for them (a quarter of a second for the tracks' place pass).
    warmPrograms(gl, () => {
      new GlFigures(gl);
      new GlTracks(gl);
      new GlSymbols(gl);
    });
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  private makeProg(vs: string, fs: string, label: string): Prog {
    const prog = compileProgram(this.gl, vs, fs, label);
    return { prog, u: new UniformCache(this.gl, prog) };
  }

  // ---------------------------------------------------------------- geometry

  private buildCubeVao(): WebGLVertexArrayObject {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    if (!vao) throw new GpuInitError('createVertexArray failed');
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeGeom);
    // pos(3) + normal(3), stride 24
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeInstances);
    // iPos(3) + iColor(3) + iOrient(2), stride 32
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 32, 0);
    gl.vertexAttribDivisor(2, 1);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 32, 12);
    gl.vertexAttribDivisor(3, 1);
    gl.enableVertexAttribArray(4);
    gl.vertexAttribPointer(4, 2, gl.FLOAT, false, 32, 24);
    gl.vertexAttribDivisor(4, 1);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeIndex);
    gl.bindVertexArray(null);
    return vao;
  }

  private buildLookVao(): WebGLVertexArrayObject {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    if (!vao) throw new GpuInitError('createVertexArray failed');
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lookGeom);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 4, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeInstances);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 32, 0);
    gl.vertexAttribDivisor(1, 1);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 32, 12);
    gl.vertexAttribDivisor(2, 1);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 32, 24);
    gl.vertexAttribDivisor(3, 1);
    gl.bindVertexArray(null);
    return vao;
  }

  private buildLineVao(buf: WebGLBuffer): WebGLVertexArrayObject {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    if (!vao) throw new GpuInitError('createVertexArray failed');
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    // pos(3) + rgba(4), stride 28
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 28, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 28, 12);
    gl.bindVertexArray(null);
    return vao;
  }

  // ----------------------------------------------------------------- dataset

  setDataset(dataset: Dataset | null): void {
    const gl = this.gl;
    for (const c of this.chunks) {
      gl.deleteTexture(c.posTex);
      if (c.timeTex) gl.deleteTexture(c.timeTex);
      if (c.lineTex) gl.deleteTexture(c.lineTex);
    }
    this.lines = null;
    this.chunks = [];
    for (const j of this.pendingChunks) {
      if (j.posTex) gl.deleteTexture(j.posTex);
      if (j.timeTex) gl.deleteTexture(j.timeTex);
    }
    this.pendingChunks = [];
    this.dataGeneration++;
    // The frame a dataset arrives on has the rest of its arrival to carry.
    this.uploadIdle = true;
    if (this.teamSignTex) {
      gl.deleteTexture(this.teamSignTex);
      this.teamSignTex = null;
      this.teamSignWidth = 0;
    }
    for (const t of this.filterTextures.values()) gl.deleteTexture(t);
    this.filterTextures.clear();
    this.filterMaskDirty = '';
    this.gpuBytesUsed = 0;
    this.residentRows = 0;
    this.droppedRows = 0;
    this.dataset = dataset;
    if (!dataset || dataset.count === 0) return;

    // Hard stop on GPU memory. WebGL will happily accept allocations it cannot
    // service and then either fail the context or fall back to system memory at
    // catastrophic cost, so the budget is enforced here rather than discovered.
    const bytesPerRow = 8 + (dataset.time && dataset.lifetime ? 4 : 0);
    const chunkCount = Math.ceil(dataset.count / CHUNK_ROWS);
    for (let ci = 0; ci < chunkCount; ci++) {
      const start = ci * CHUNK_ROWS;
      let rows = Math.min(CHUNK_ROWS, dataset.count - start);
      // Textures are padded to a whole row of the row-store texture.
      const cost = (r: number) => Math.ceil(r / ROW_TEX_WIDTH) * ROW_TEX_WIDTH * bytesPerRow;

      if (this.gpuBytesUsed + cost(rows) > this.gpuBudgetBytes) {
        // Take a partial chunk rather than nothing: a budget that cannot hold a
        // whole chunk should still show as much of the data as it can, and since
        // rows are time-ordered a prefix is a coherent slice rather than noise.
        const affordable = Math.floor(
          (this.gpuBudgetBytes - this.gpuBytesUsed) / (ROW_TEX_WIDTH * bytesPerRow),
        );
        const partial = Math.max(0, affordable) * ROW_TEX_WIDTH;
        if (partial < ROW_TEX_WIDTH) {
          this.droppedRows = dataset.count - start;
          break;
        }
        rows = Math.min(rows, partial);
        this.pendingChunks.push(pendingChunk(start, rows));
        this.gpuBytesUsed += cost(rows);
        this.residentRows += rows;
        this.droppedRows = dataset.count - start - rows;
        break;
      }

      // Queued rather than packed here; see `flushDataUpload`.
      this.pendingChunks.push(pendingChunk(start, rows));
      this.gpuBytesUsed += cost(rows);
      this.residentRows += rows;
    }

    // Two rows: row 0 the group table, row 1 the categories of a difference split
    // by column. Both at once, because a split by column still has to leave hidden
    // groups hidden. Wide enough for the group ids and the categories of any
    // retained column. A third sampler for the split's table is not an option:
    // the heat vertex stage is already at the eight the spec guarantees.
    //
    // Capped, and capped against the driver's own limit: a high-cardinality column
    // can have tens of thousands of values, and asking for a texture wider than
    // MAX_TEXTURE_SIZE does not fail gracefully — the allocation is rejected, every
    // later write to it errors, and the context ends up unusable. A column with
    // more values than this cannot be hand-assigned to two sides anyway.
    const maxWidth = Math.min(SIGN_TABLE_LIMIT, this.gpuLimits.maxTextureSize || SIGN_TABLE_LIMIT);
    let signWidth = Math.max(1, dataset.teamLabels.length);
    for (const a of dataset.attrs) {
      if (a.categories) signWidth = Math.max(signWidth, a.categories.length);
    }
    signWidth = Math.max(1, Math.min(signWidth, maxWidth));
    this.teamSignTex = createTexture(gl, {
      width: signWidth,
      height: 2,
      internalFormat: gl.R32F,
      format: gl.RED,
      type: gl.FLOAT,
      data: packSignTables(null, null, signWidth),
    });
    this.teamSignWidth = signWidth;
  }

  /**
   * Upload background geometry.
   *
   * Kept separate from the dataset because they change independently: swapping
   * datasets should not re-upload the map, and swapping the map should not
   * re-upload hundreds of megabytes of row textures.
   */
  setLevel(level: Level | null): void {
    const gl = this.gl;
    if (this.mapTex) {
      gl.deleteTexture(this.mapTex);
      this.mapTex = null;
    }
    this.atlasToken++;
    if (this.levelMesh) this.freeMesh(this.levelMesh);
    this.levelMesh = null;
    this.levelOwnBytes = 0;
    if (!level) return;

    if (level.kind === 'image') {
      const tex = gl.createTexture();
      if (!tex) throw new GlError('createTexture failed for map');
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, level.bitmap);
      // Mips matter here: a map viewed from above is minified hard, and without
      // them the ground shimmers badly enough to distract from the heat.
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
      if (aniso) {
        const max = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number;
        gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, max));
      }
      gl.bindTexture(gl.TEXTURE_2D, null);
      this.mapTex = tex;
      // 4 bytes per texel plus a third again for the mip chain.
      this.levelOwnBytes = Math.round(level.width * level.height * 4 * 1.34);
      return;
    }

    const mesh = this.uploadMesh(
      {
        vertices: level.vertices,
        colours: level.colours,
        uvs: level.uvs,
        indices: level.indices,
        // Structure arrays are optional: a level may have no buildings, or come
        // from a library entry saved before the split existed.
        structureIndices: level.structureIndices ?? EMPTY_INDICES,
        structureEdges: level.structureEdges ?? EMPTY_INDICES,
        waterIndices: level.waterIndices ?? EMPTY_INDICES,
        uvTiles: level.uvs && level.tileRects ? level.uvTiles : null,
        tileRects: level.tileRects,
      },
      null,
      false,
    );
    this.levelMesh = mesh;
    this.levelOwnBytes = mesh.bytes;
    if (level.atlas && level.uvs) this.loadAtlas(level.atlas, mesh);
  }

  /**
   * Upload one mesh: the level's, or a world tile's.
   *
   * One vertex buffer, up to four index buffers. Ground and structures share
   * vertices because they came from one mesh and duplicating them would undo the
   * memory the decimation saved; only the index sets differ.
   */
  private uploadMesh(src: MeshSource, bounds: Bounds | null, tile: boolean): GlMesh {
    const gl = this.gl;
    const vbo = mustBuffer(gl);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, src.vertices, gl.STATIC_DRAW);

    // The interleaved buffer is position+normal at 24 bytes; colour rides in
    // its own buffer. A mesh without colour still gets one, filled with white,
    // so the attribute is never unbound — an unbound attribute reads as
    // (0,0,0,1) on some drivers and as the last value left in the register on
    // others, which is a black level on one machine and not on the next.
    //
    // Always allocated, so the mesh shader has one code path instead of two. A
    // white buffer costs 12 bytes a vertex on levels that will never use it,
    // which is a third of the interleaved buffer — acceptable next to a branch
    // that would have to be right in two renderers.
    const vertexCount = src.vertices.length / 6;
    const colours =
      src.colours && src.colours.length >= vertexCount * 3
        ? src.colours
        : new Float32Array(vertexCount * 3).fill(1);
    const colourVbo = mustBuffer(gl);
    gl.bindBuffer(gl.ARRAY_BUFFER, colourVbo);
    gl.bufferData(gl.ARRAY_BUFFER, colours, gl.STATIC_DRAW);

    // UVs likewise always backed: -1 everywhere on an untextured mesh, which
    // the shader reads as "no texture here".
    const uvs =
      src.uvs && src.uvs.length >= vertexCount * 2
        ? src.uvs
        : new Float32Array(vertexCount * 2).fill(-1);
    const uvVbo = mustBuffer(gl);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvVbo);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

    // Per-vertex tile numbers, 4 bytes a vertex, and the tiles' rectangles as an
    // RGBA32F texture the vertex shader reads by number (see TILE_VS). Both null
    // on a mesh with no repeating texture: the attribute then reads its
    // constant 0, and costs nothing.
    let tileVbo: WebGLBuffer | null = null;
    let tileTex: WebGLTexture | null = null;
    if (src.uvTiles && src.uvTiles.length >= vertexCount && src.tileRects) {
      tileVbo = mustBuffer(gl);
      gl.bindBuffer(gl.ARRAY_BUFFER, tileVbo);
      // As floats, exact for every 16-bit tile number. Not the shorts they
      // arrive as: Direct3D has no vertex format that reads an unsigned short
      // as a float, so ANGLE would keep a converted copy of its own anyway.
      gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(src.uvTiles.subarray(0, vertexCount)), gl.STATIC_DRAW);
      tileTex = this.makeTileTable(src.tileRects);
    }

    const ibo = (data: Uint32Array): WebGLBuffer | null => {
      if (data.length === 0) return null;
      const b = mustBuffer(gl);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return b;
    };
    // Bound with no VAO current would rebind the last VAO's element buffer, so
    // make sure there is none.
    gl.bindVertexArray(null);
    const groundIbo = ibo(src.indices);
    const structIbo = ibo(src.structureIndices);
    const wireIbo = ibo(src.structureEdges);
    const waterIbo = ibo(src.waterIndices);

    // Two VAOs: the shaded pass needs normals, the wireframe only positions.
    const makeVao = (indexBuffer: WebGLBuffer | null, withNormals: boolean) => {
      const vao = gl.createVertexArray();
      if (!vao) throw new GlError('createVertexArray failed for mesh');
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
      if (withNormals) {
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
        gl.bindBuffer(gl.ARRAY_BUFFER, colourVbo);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 12, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, uvVbo);
        gl.enableVertexAttribArray(3);
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 8, 0);
        // Without tiles the attribute stays disabled and reads the constant
        // set in bindAtlas.
        if (tileVbo) {
          gl.bindBuffer(gl.ARRAY_BUFFER, tileVbo);
          gl.enableVertexAttribArray(4);
          gl.vertexAttribPointer(4, 1, gl.FLOAT, false, 4, 0);
        }
      }
      if (indexBuffer) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bindVertexArray(null);
      return vao;
    };

    return {
      vbo,
      colourVbo,
      uvVbo,
      tileVbo,
      tileTex,
      texture: null,
      vao: makeVao(groundIbo, true),
      wireVao: makeVao(wireIbo, false),
      groundIbo,
      structIbo,
      wireIbo,
      waterIbo,
      groundCount: src.indices.length,
      structCount: src.structureIndices.length,
      wireCount: src.structureEdges.length,
      waterCount: src.waterIndices.length,
      groundWireIbo: null,
      groundWireCount: 0,
      // Kept for the lazy ground wireframe; the array is already in memory in
      // the store, so this is a reference, not a copy.
      groundIndices: src.indices,
      bytes:
        src.vertices.byteLength +
        colours.byteLength +
        uvs.byteLength +
        (tileVbo ? vertexCount * 4 : 0) +
        src.indices.byteLength +
        src.structureIndices.byteLength +
        src.structureEdges.byteLength +
        src.waterIndices.byteLength,
      bounds,
      tile,
    };
  }

  private freeMesh(mesh: GlMesh): void {
    const gl = this.gl;
    gl.deleteVertexArray(mesh.vao);
    gl.deleteVertexArray(mesh.wireVao);
    for (const b of [
      mesh.vbo,
      mesh.colourVbo,
      mesh.uvVbo,
      mesh.tileVbo,
      mesh.groundIbo,
      mesh.structIbo,
      mesh.wireIbo,
      mesh.waterIbo,
      mesh.groundWireIbo,
    ]) {
      if (b) gl.deleteBuffer(b);
    }
    if (mesh.texture) gl.deleteTexture(mesh.texture);
    if (mesh.tileTex) gl.deleteTexture(mesh.tileTex);
    mesh.texture = null;
    mesh.tileTex = null;
  }

  /**
   * The streamed world tiles to draw with a model level (src/world/tileSet).
   *
   * Uploads the tiles it has not seen and frees the ones that are gone, by id and
   * by object - a tile is never changed in place. Each is a small model level in
   * itself and goes through the same draw code as the level: see `frameMeshes`.
   */
  setWorldTiles(tiles: WorldTile[]): void {
    const { added, removed } = diffWorldTiles(this.tileSources, tiles);
    for (const id of removed) {
      const mesh = this.tileMeshes.get(id);
      if (mesh) {
        this.tileBytes -= mesh.bytes;
        this.freeMesh(mesh);
      }
      this.tileMeshes.delete(id);
      this.tileSources.delete(id);
    }
    // Queued, and made a few at a time between frames; see the WebGPU renderer.
    for (const tile of added) {
      this.tileSources.set(tile.id, tile);
      this.tileQueue.push(tile);
    }
    if (this.tileMeshes.size === 0 && this.tileQueue.length === 0) this.tileBytes = 0;
  }

  /** Tiles set but not yet made; see `flushTiles`. */
  private tileQueue: WorldTile[] = [];

  /** Whether world tiles are still waiting to be made; the engine redraws the scene when they are. */
  get uploadsPending(): boolean {
    return this.tileQueue.length > 0;
  }

  /** Make queued tiles for up to `TILE_UPLOAD_MS` a frame, at least one. */
  private flushTiles(): void {
    const until = performance.now() + TILE_UPLOAD_MS;
    let made = 0;
    while (this.tileQueue.length > 0 && (made === 0 || performance.now() < until)) {
      const tile = this.tileQueue.shift()!;
      // Removed or replaced while it waited.
      if (this.tileSources.get(tile.id) !== tile || this.tileMeshes.has(tile.id)) continue;
      const mesh = this.uploadMesh(tile, tile.bounds, true);
      if (tile.image && tile.uvs) {
        mesh.texture = this.uploadTileImage(tile.image);
        if (mesh.texture) mesh.bytes += textureBytes(tile.image.width, tile.image.height, true);
      }
      this.tileMeshes.set(tile.id, mesh);
      this.tileBytes += mesh.bytes;
      made++;
    }
  }

  /**
   * A tile's own imagery as a texture: mipmapped and anisotropic like the atlas,
   * because the backdrop is seen at grazing angles far out where an unfiltered
   * picture turns to shimmer. The bitmap belongs to the tile set and is left
   * open - the same tile may be uploaded again by a recreated renderer.
   */
  private uploadTileImage(image: ImageBitmap): WebGLTexture | null {
    const gl = this.gl;
    const tex = gl.createTexture();
    if (!tex) return null;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, image);
    } catch {
      // A bitmap closed before it got here throws; the tile is then drawn
      // untextured rather than losing the frame.
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.deleteTexture(tex);
      return null;
    }
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
    if (aniso) {
      const max = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number;
      gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, max));
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
    return tex;
  }

  /**
   * Decode the level's atlas and upload it, when it is ready.
   *
   * Asynchronous because decoding a 4096-pixel JPEG takes a noticeable moment,
   * and the level should appear at once and gain its texture when that is done
   * rather than wait. Mipmapped with anisotropy: ground is seen at grazing
   * angles, and without either it shimmers into noise a few hundred metres out.
   *
   * Uploaded as plain RGBA8 rather than sRGB. The level's other colours are
   * written to the frame as they are, so decoding this one to linear would draw
   * it darker than the file it came from.
   */
  private loadAtlas(atlas: Blob, mesh: GlMesh): void {
    const token = this.atlasToken;
    void createImageBitmap(atlas, { imageOrientation: 'none' }).then(
      (bitmap) => {
        if (token !== this.atlasToken || this.levelMesh !== mesh) {
          bitmap.close();
          return;
        }
        const gl = this.gl;
        const tex = gl.createTexture();
        if (!tex) return;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
        // Only the levels the cell gutters protect; see ATLAS_MIP_LEVELS.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, ATLAS_MIP_LEVELS - 1);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
        if (aniso) {
          const max = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number;
          gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, max));
        }
        gl.bindTexture(gl.TEXTURE_2D, null);
        mesh.texture = tex;
        const bytes = Math.round(bitmap.width * bitmap.height * 4 * 1.34);
        mesh.bytes += bytes;
        this.levelOwnBytes += bytes;
        bitmap.close();
      },
      () => {
        // An atlas that will not decode costs the texture, not the level.
      },
    );
  }

  /**
   * The tiles' rectangles as a texture, one RGBA32F texel each, in rows of
   * TILE_TABLE_WIDTH. Nearest filtering, and not only because it is read with
   * texelFetch: a float texture with linear filtering is incomplete without an
   * extension, and an incomplete texture reads as black.
   */
  private makeTileTable(rects: Float32Array): WebGLTexture | null {
    const gl = this.gl;
    const count = Math.max(1, Math.floor(rects.length / 4));
    const width = Math.min(count, TILE_TABLE_WIDTH);
    const height = Math.ceil(count / TILE_TABLE_WIDTH);
    const data = new Float32Array(width * height * 4);
    data.set(rects.subarray(0, Math.min(rects.length, data.length)));
    const tex = gl.createTexture();
    if (!tex) return null;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return tex;
  }

  /** Bind a mesh's texture (the level's atlas, a tile's image) to unit 0 and say whether to use it. */
  /** `mode` as the shader reads `uTexture`: 1 ground, 2 structures. */
  /** `unit` for a pass whose unit 0 is taken: the peel's previous layer. */
  private bindAtlas(u: UniformCache, mesh: GlMesh, on: boolean, mode: 1 | 2 = 1, unit = 0): void {
    const gl = this.gl;
    const use = on && mesh.texture !== null;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, use ? mesh.texture : this.blankTex());
    u.i1('uAtlas', unit);
    u.f1('uTexture', use ? mode : 0);
    // The tile table on a unit of its own, and the tile attribute's constant
    // for a mesh without one: generic attribute values are context state, not
    // the VAO's, so it is set where every pass that reads it passes through.
    gl.activeTexture(gl.TEXTURE0 + TILE_UNIT);
    gl.bindTexture(gl.TEXTURE_2D, mesh.tileTex ?? this.blankTileTex());
    u.i1('uTiles', TILE_UNIT);
    if (!mesh.tileVbo) gl.vertexAttrib1f(4, 0);
    gl.activeTexture(gl.TEXTURE0 + unit);
  }

  private blankTile: WebGLTexture | null = null;

  /** A 1x1 tile table for a level without tiles, so the vertex shader's sampler is never left unbound. */
  private blankTileTex(): WebGLTexture | null {
    if (this.blankTile) return this.blankTile;
    this.blankTile = this.makeTileTable(new Float32Array(4));
    return this.blankTile;
  }

  private blank: WebGLTexture | null = null;

  /**
   * A 1x1 texture for unit 0 when there is no atlas, so the sampler is never
   * left pointing at whatever the last pass bound there - a depth texture, on
   * some frames, which is a feedback loop the driver is entitled to reject.
   */
  private blankTex(): WebGLTexture | null {
    if (this.blank) return this.blank;
    const gl = this.gl;
    this.blank = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.blank);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([128, 128, 128, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return this.blank;
  }

  /**
   * Quantise a row range into an RGBA16UI texture: xyz to 16 bits each within
   * the chunk's own AABB, w = teamId.
   *
   * Per-chunk AABBs are what make 16 bits enough — on an 8km map a chunk usually
   * covers a fraction of it, so the quantisation step lands well under a
   * centimetre and is far below any positional noise in real telemetry.
   */
  /** Chunks still on their way to the GPU, in order. */
  private pendingChunks: PendingChunk[] = [];
  /** Bumped when a dataset is set and as each of its chunks lands, so the engine redraws with it. */
  dataGeneration = 0;

  /** Skip the upload for a frame: set on the frame a dataset arrives. */
  private uploadIdle = false;

  /** Whether some of the dataset is still on its way to the GPU. */
  get dataPending(): boolean {
    return this.pendingChunks.length > 0;
  }

  /**
   * Pack and write the dataset a slice at a time, for a few milliseconds a frame.
   *
   * A chunk's bounds are read first, since its positions are quantised against
   * them, then it is packed and written a band of texture rows at a time. It is
   * drawn once all of it is there; the chunks before it draw meanwhile. Done in
   * one call on the frame the dataset arrived, the same work was a stall that
   * grew with the row count.
   */
  private flushDataUpload(): void {
    const ds = this.dataset;
    if (!ds || this.pendingChunks.length === 0) return;
    if (this.uploadIdle) {
      this.uploadIdle = false;
      return;
    }
    const gl = this.gl;
    const { px, py, pz, teamId } = ds;
    const until = performance.now() + DATA_UPLOAD_MS;
    while (this.pendingChunks.length > 0 && performance.now() < until) {
      const j = this.pendingChunks[0];
      const end = j.start + j.rows;
      const stop = Math.min(end, j.cursor + DATA_SLICE_ROWS);
      if (!j.posTex) {
        // A chunk's textures are tens of megabytes, and making them is a stall of
        // its own in some drivers: a frame of its own, with nothing else to do.
        const texHeight = Math.ceil(j.rows / ROW_TEX_WIDTH);
        j.posTex = createTexture(gl, {
          width: ROW_TEX_WIDTH,
          height: texHeight,
          internalFormat: gl.RGBA16UI,
          format: gl.RGBA_INTEGER,
          type: gl.UNSIGNED_SHORT,
        });
        if (ds.time && ds.lifetime) {
          j.timeTex = createTexture(gl, {
            width: ROW_TEX_WIDTH,
            height: texHeight,
            internalFormat: gl.RG16UI,
            format: gl.RG_INTEGER,
            type: gl.UNSIGNED_SHORT,
          });
        }
        gl.bindTexture(gl.TEXTURE_2D, null);
        return;
      }
      if (!j.packing) {
        const mn = j.min;
        const mx = j.max;
        for (let i = j.cursor; i < stop; i++) {
          const x = px[i];
          const y = py[i];
          const z = pz[i];
          if (x < mn[0]) mn[0] = x;
          if (x > mx[0]) mx[0] = x;
          if (y < mn[1]) mn[1] = y;
          if (y > mx[1]) mx[1] = y;
          if (z < mn[2]) mn[2] = z;
          if (z > mx[2]) mx[2] = z;
        }
        j.cursor = stop;
        if (stop >= end) {
          j.packing = true;
          j.cursor = j.start;
        }
        continue;
      }
      // Whole texture rows a slice, the last one padded.
      const n = stop - j.cursor;
      const band = Math.ceil(n / ROW_TEX_WIDTH);
      const y0 = (j.cursor - j.start) / ROW_TEX_WIDTH;
      if (this.posScratch.length < DATA_SLICE_ROWS * 4) this.posScratch = new Uint16Array(DATA_SLICE_ROWS * 4);
      const data = this.posScratch;
      const sx = 65535 / Math.max(1e-6, j.max[0] - j.min[0]);
      const sy = 65535 / Math.max(1e-6, j.max[1] - j.min[1]);
      const sz = 65535 / Math.max(1e-6, j.max[2] - j.min[2]);
      const [x0, ya, z0] = j.min;
      for (let i = 0; i < n; i++) {
        const r = j.cursor + i;
        const o = i * 4;
        data[o] = (px[r] - x0) * sx;
        data[o + 1] = (py[r] - ya) * sy;
        data[o + 2] = (pz[r] - z0) * sz;
        data[o + 3] = teamId ? teamId[r] : 0;
      }
      data.fill(0, n * 4, band * ROW_TEX_WIDTH * 4);
      gl.bindTexture(gl.TEXTURE_2D, j.posTex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, y0, ROW_TEX_WIDTH, band, gl.RGBA_INTEGER, gl.UNSIGNED_SHORT, data, 0);
      if (j.timeTex && ds.time && ds.lifetime) {
        const q = timeQuantum(ds, j.start, j.rows);
        if (this.timeScratch.length < DATA_SLICE_ROWS * 2) this.timeScratch = new Uint16Array(DATA_SLICE_ROWS * 2);
        const tl = this.timeScratch;
        for (let i = 0; i < n; i++) {
          const r = j.cursor + i;
          const o = i * 2;
          tl[o] = clampU16((ds.time[r] - q.timeMin) * q.invTime);
          const life = ds.lifetime[r];
          tl[o + 1] = life < 0 ? 65535 : Math.min(65534, clampU16(life * q.invLife));
        }
        tl.fill(0, n * 2, band * ROW_TEX_WIDTH * 2);
        gl.bindTexture(gl.TEXTURE_2D, j.timeTex);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, y0, ROW_TEX_WIDTH, band, gl.RG_INTEGER, gl.UNSIGNED_SHORT, tl, 0);
      }
      gl.bindTexture(gl.TEXTURE_2D, null);
      j.cursor = stop;
      if (stop >= end) {
        this.pendingChunks.shift();
        this.chunks.push(this.landChunk(ds, j));
        this.dataGeneration++;
      }
    }
  }

  private posScratch = new Uint16Array(0);
  private timeScratch = new Uint16Array(0);

  /** A chunk whose rows have all arrived, as the passes draw it. */
  private landChunk(ds: Dataset, j: PendingChunk): GpuChunk {
    let timeMin = 0;
    let timeScale = 1;
    let lifeScale = 1;
    if (j.timeTex && ds.time && ds.lifetime) {
      const q = timeQuantum(ds, j.start, j.rows);
      timeMin = q.timeMin;
      timeScale = q.span / 65535;
      lifeScale = q.lifeCap / 65534;
    }
    const chunk: GpuChunk = {
      posTex: j.posTex!,
      start: j.start,
      lineTex: null,
      timeTex: j.timeTex,
      rows: j.rows,
      aabbMin: [j.min[0], j.min[1], j.min[2]],
      aabbSize: [
        Math.max(1e-6, j.max[0] - j.min[0]),
        Math.max(1e-6, j.max[1] - j.min[1]),
        Math.max(1e-6, j.max[2] - j.min[2]),
      ],
      timeMin,
      timeScale,
      lifeScale,
    };
    // Routes set while it was on its way get their starts now.
    if (this.lines) {
      const gl = this.gl;
      const texHeight = Math.ceil(chunk.rows / ROW_TEX_WIDTH);
      const data = new Uint32Array(ROW_TEX_WIDTH * texHeight * 4);
      data.set(packLineStarts(ds, this.lines, chunk.start, chunk.rows, 4));
      chunk.lineTex = createTexture(gl, {
        width: ROW_TEX_WIDTH,
        height: texHeight,
        internalFormat: gl.RGBA32UI,
        format: gl.RGBA_INTEGER,
        type: gl.UNSIGNED_INT,
        data,
      });
      this.gpuBytesUsed += ROW_TEX_WIDTH * texHeight * 16;
    }
    return chunk;
  }

  setLines(lines: LineData | null): void {
    const gl = this.gl;
    for (const c of this.chunks) {
      if (c.lineTex) {
        gl.deleteTexture(c.lineTex);
        this.gpuBytesUsed -= Math.ceil(c.rows / ROW_TEX_WIDTH) * ROW_TEX_WIDTH * 16;
      }
      c.lineTex = null;
    }
    this.lines = lines;
    const dataset = this.dataset;
    if (!lines || !dataset || lines.flags.length !== dataset.count) {
      this.lines = null;
      return;
    }
    for (const c of this.chunks) {
      const texHeight = Math.ceil(c.rows / ROW_TEX_WIDTH);
      // Four u32 per row: x | y<<16, z | flags<<16, the segment's seconds, 0.
      const data = new Uint32Array(ROW_TEX_WIDTH * texHeight * 4);
      data.set(packLineStarts(dataset, lines, c.start, c.rows, 4));
      c.lineTex = createTexture(gl, {
        width: ROW_TEX_WIDTH,
        height: texHeight,
        internalFormat: gl.RGBA32UI,
        format: gl.RGBA_INTEGER,
        type: gl.UNSIGNED_INT,
        data,
      });
      this.gpuBytesUsed += ROW_TEX_WIDTH * texHeight * 16;
    }
  }

  private lineHeatQueued = false;

  /** The pixel buffer `readHeatField` reads into, its size, and whether a read is under way. */
  private fieldPbo: WebGLBuffer | null = null;
  private fieldPboBytes = 0;
  private fieldReading = false;

  /** The line heat program, compiled on first use; null where it would not compile. */
  private lineHeat(): Prog | null {
    if (this.lineHeatProg || this.lineHeatBroken) return this.lineHeatProg;
    try {
      this.lineHeatProg = this.makeProg(LINE_HEAT_VS, LINE_HEAT_FS, 'line heat');
    } catch (e) {
      this.lineHeatBroken = true;
      console.error(e);
    }
    return this.lineHeatProg;
  }

  // ------------------------------------------------------------------ frame

  render(params: FrameParams): FrameResult {
    const gl = this.gl;
    this.flushTiles();
    this.flushDataUpload();
    // The line heat program, compiled off the frame rather than on the first
    // frame of line heat.
    if (!this.lineHeatProg && !this.lineHeatBroken && !this.lineHeatQueued) {
      this.lineHeatQueued = true;
      setTimeout(() => this.lineHeat(), 0);
    }
    this.ensureTargets(
      params.width,
      params.height,
      params.heatScale,
      params.heat.teamColors ? 4 : 1,
    );

    if (params.colorLutDirty) {
      gl.bindTexture(gl.TEXTURE_2D, this.lutTex);
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        LUT_WIDTH,
        LUT_HEIGHT,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        params.colorLut,
      );
    }
    if (params.curveLutDirty && params.curveLut.length === CURVE_LUT_SIZE) {
      gl.bindTexture(gl.TEXTURE_2D, this.curveTex);
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        CURVE_LUT_SIZE,
        1,
        gl.RED,
        gl.FLOAT,
        params.curveLut,
      );
    }
    // The group table and a category split's table, one row each of the sign
    // texture. Uploaded together: the shader reads the groups in every split mode.
    if (this.teamSignTex) {
      this.updateTeamSign(params.teamSign, params.splitMode === 1 ? params.splitSign : null);
    }

    const signed = params.mode === 'heat-difference';
    // An idle frame recomposites the buffers it already has. They are our own
    // framebuffers and retain reliably; the canvas does not, so the composite has
    // to run every frame regardless.
    if (!params.compositeOnly) {
      this.drawScene(params);
      if (params.mode !== 'team') this.timeHeat(params);
      else this.clearHeat();
    }
    const post = params.post ?? null;
    const postFbo = post ? (this.post ??= new GlPost(gl)).begin(this.width, this.height, post.quality) : null;
    this.composite(params, signed, postFbo);
    if (post && this.post && this.sceneDepth) {
      this.post.run(params, post, this.sceneDepth, SCENE_CLEAR, this.emptyVao);
      this.readCapture();
    }

    return { gpuMs: null };
  }

  private drawScene(params: FrameParams): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFbo);
    gl.viewport(0, 0, this.width, this.height);
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(SCENE_CLEAR[0], SCENE_CLEAR[1], SCENE_CLEAR[2], 1);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.frameMeshes = this.meshesInView(params);
    // Level geometry first, with depth writes on, so heat sprites behind a wall
    // are correctly hidden by it. Its see-through shells come after the figures
    // and everything else in the scene (`drawLevel`).
    if (params.level) this.drawLevel(params, params.level, false);

    if (params.showGrid || params.showAxes) {
      this.ensureGrid(params);
      if (this.lineVertCount > 0) {
        const { prog, u } = this.lineProg;
        gl.useProgram(prog);
        u.mat4('uViewProj', params.viewProj);
        u.f3('uCameraPos', params.cameraPos[0], params.cameraPos[1], params.cameraPos[2]);
        u.f1('uFadeStart', params.gridExtent * 0.35);
        u.f1('uFadeEnd', params.gridExtent * 1.15);
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.bindVertexArray(this.lineVao);
        gl.drawArrays(gl.LINES, 0, this.lineVertCount);
        gl.disable(gl.BLEND);
      }
    }

    if (params.cubeCount > 0 && params.cubes) {
      this.uploadCubeInstances(params.cubes, params.cubeCount);
      const { prog, u } = this.cubeProg;
      gl.useProgram(prog);
      u.mat4('uViewProj', params.viewProj);
      u.f1('uSize', params.cubeSize);
      gl.bindVertexArray(this.cubeVao);
      gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, params.cubeCount);

      if (params.showLookDirection) {
        const look = this.lookProg;
        gl.useProgram(look.prog);
        look.u.mat4('uViewProj', params.viewProj);
        look.u.f1('uLength', params.lookLength);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.bindVertexArray(this.lookVao);
        gl.drawArraysInstanced(gl.LINES, 0, 2, params.cubeCount);
        gl.disable(gl.BLEND);
      }
    }

    // Figures relative to the camera: see FrameParams.viewProjRel.
    const o = params.origin;
    this.relCamera[0] = params.cameraPos[0] - o[0];
    this.relCamera[1] = params.cameraPos[1] - o[1];
    this.relCamera[2] = params.cameraPos[2] - o[2];
    if (params.figureBatches && params.figureBatches.length) {
      this.figures ??= new GlFigures(this.gl);
      this.figures.draw(params.figureBatches, params.viewProjRel, this.relCamera);
    }
    if (params.gpuTracks) {
      this.figures ??= new GlFigures(this.gl);
      this.tracks ??= new GlTracks(this.gl);
      this.tracks.draw(params.gpuTracks, params.viewProj, params.cameraPos, this.figures, { viewProj: params.viewProjRel, camera: this.relCamera, origin: o });
    }
    if (params.sceneTris && params.sceneTriVertCount > 0) this.drawSceneTris(params, params.sceneTris, params.sceneTriVertCount);
    if (params.trailVerts && params.trailVertCount > 0) {
      this.drawDynamicLines(params, params.trailVerts, params.trailVertCount, this.trailVao, this.trailBuf, 'trail');
    }
    // The see-through structures over all of it: a figure behind one shows
    // through it as the ground behind it does, and one in front hides it.
    if (params.level?.kind === 'model') this.drawLevel(params, params.level, true);
    // The far-off glyphs: map symbols, weapons, decoys (`symbols/`), over everything in the scene.
    if (params.symbols) {
      this.symbols ??= new GlSymbols(this.gl);
      if (params.gpuTracks && this.tracks) this.tracks.drawGlyphs(this.symbols, params.symbols, params.viewProj, params.cameraPos, this.width, this.height);
      this.symbols.draw(params.symbols, params.viewProj, params.cameraPos, this.width, this.height);
    }
    if (params.overlayVerts && params.overlayVertCount > 0) {
      // Overlay last and without depth testing: the ruler has to stay visible
      // over whatever it is measuring across.
      gl.disable(gl.DEPTH_TEST);
      this.drawDynamicLines(
        params,
        params.overlayVerts,
        params.overlayVertCount,
        this.overlayVao,
        this.overlayBuf,
        'overlay',
      );
      gl.enable(gl.DEPTH_TEST);
    }

    // Structures into the depth buffer, colour untouched, after everything else
    // has drawn. See `sealStructureDepth`.
    if (params.level) this.sealStructureDepth(params);
    this.renderStructureDepth(params);
    this.peelDepthLayers(params);

    gl.bindVertexArray(null);
  }

  /**
   * Peel successive depth layers behind the scene's nearest surface.
   *
   * Each pass draws the structure geometry into its own depth-only target,
   * discarding anything at or in front of the previous layer, so layer *i* holds
   * the (i+2)th surface along each ray. The heat pass then counts how many of
   * them a datapoint is behind, and dims by that count.
   *
   * Why bother: one depth comparison can only answer "is something in front of
   * this point", so a datapoint behind a single wall and one four rooms deep
   * inside a building are dimmed identically. The whole interior comes out as a
   * uniform faint smear, which is precisely the case a movement heatmap exists
   * to show — which corridor, which floor. Counting surfaces restores that.
   *
   * Skipped entirely when occlusion is off, and when there are no structures:
   * the terrain is already in the scene depth and peeling it says nothing.
   */
  private peelDepthLayers(params: FrameParams): void {
    const gl = this.gl;
    if (params.heat.occlusion <= 0) return;
    if (params.level?.kind !== 'model') return;
    const meshes = this.frameMeshes.filter((m) => m.structIbo && m.structCount > 0);
    if (meshes.length === 0) return;
    if (this.peelFbo.length === 0) return;

    const { prog, u } = this.peelProg;
    gl.useProgram(prog);
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    u.mat4('uViewProj', params.viewProj);
    u.f2('uViewport', this.width, this.height);
    u.i1('uPrevDepth', 0);

    let prev = this.sceneDepth;
    for (let i = 0; i < this.peelFbo.length; i++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.peelFbo[i]);
      gl.viewport(0, 0, this.width, this.height);
      gl.clearDepth(1);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      // Every mesh's structures into the one layer: a wall on a tile is as much
      // a surface to count as a wall on the level.
      for (const m of meshes) {
        // The atlas on unit 1, unit 0 being the previous layer: a leaf card's
        // cut-out corners are not a surface to count. See PEEL_FS. Whenever it
        // has decoded, shell look or not - foliage never occludes heat. Bound
        // before the previous layer, which then has unit 0 to itself.
        this.bindAtlas(u, m, true, 2, 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, prev);
        this.drawStructures(m);
      }
      prev = this.peelDepth[i];
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFbo);
    gl.viewport(0, 0, this.width, this.height);
  }

  /**
   * The nearest structure surface, in a target of its own.
   *
   * The same draw as `sealStructureDepth` against a different attachment, and the
   * difference between the two is the whole point: the scene's depth is the
   * nearest surface *of any kind*, so a heat pass reading it can tell that
   * something is in front of a datapoint but not whether that something is a
   * wall or a hillside. Those want opposite treatment — you look through walls on
   * purpose and never through terrain — and one texture cannot say which.
   *
   * Only when the ground cutoff is on, so a run with it off pays nothing. When
   * there are no structures the target stays cleared at 1.0, which reads as "no
   * structure in front of anything" and makes every occluder terrain. Which is
   * correct: on a level that is only landscape, it is all landscape.
   */
  private renderStructureDepth(params: FrameParams): void {
    const gl = this.gl;
    if (!params.heat.hideBehindGround) return;
    if (!this.structDepthFbo) return;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.structDepthFbo);
    gl.viewport(0, 0, this.width, this.height);
    gl.clearDepth(1);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    const meshes =
      params.level?.kind === 'model' ? this.frameMeshes.filter((m) => m.structIbo && m.structCount > 0) : [];
    if (meshes.length > 0) {
      const { prog, u } = this.meshProg;
      gl.useProgram(prog);
      gl.colorMask(false, false, false, false);
      gl.depthMask(true);
      gl.enable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      u.mat4('uViewProj', params.viewProj);
      // The slice applies here for the same reason it applies to the seal: a
      // wall cut open must stop counting as a wall.
      this.setSlice(u, params.slice);
    this.setCull(u, params);
      this.setRelief(u, null);
      for (const m of meshes) {
        // And the cut-out, as in the seal: foliage is not a wall either.
        this.bindAtlas(u, m, true, 2);
        this.drawStructures(m);
      }
      gl.colorMask(true, true, true, true);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFbo);
    gl.viewport(0, 0, this.width, this.height);
  }

  /**
   * Write the structures' depth without writing their colour.
   *
   * Structures are drawn translucent, which means `depthMask(false)` — a shell
   * that wrote depth would hide the shells behind it and the ground under it,
   * and being able to see through it is the entire point. But the heat pass
   * decides what is hidden by sampling this framebuffer's depth texture, so for
   * as long as structures stayed out of it, *nothing* was ever occluded by a
   * building. Only the traced ground was in there, so heat behind a cliff mesh
   * or inside a warehouse came through at full strength. The occlusion feature
   * looked like it worked because it was tested against terrain.
   *
   * Depth-only, and last, so no colour draw in this pass is affected by it: the
   * frame looks exactly as it did, and the depth texture now describes the whole
   * scene rather than a third of it.
   */
  private sealStructureDepth(params: FrameParams): void {
    if (params.level?.kind !== 'model') return;
    const meshes = this.frameMeshes.filter((m) => m.structIbo && m.structCount > 0);
    if (meshes.length === 0) return;
    const gl = this.gl;
    const { prog, u } = this.meshProg;
    gl.colorMask(false, false, false, false);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    gl.useProgram(prog);
    u.mat4('uViewProj', params.viewProj);
    // The slice has to apply here too, or slicing a wall open would leave its
    // depth behind and the heat inside would stay hidden by a wall you can see
    // through.
    this.setSlice(u, params.slice);
    this.setCull(u, params);
    // Nothing else in the shader can affect depth, but the uniforms it reads
    // must still be defined: an unset relief block would discard on a stale
    // slice from the previous frame.
    this.setRelief(u, null);
    // The atlas likewise, set here rather than inherited from whatever drew last:
    // a cut-out texel - a leaf card's empty corner - must not be there in the
    // depth, or the foliage hides the heat behind it. Whenever the atlas has
    // decoded, including in the shell look, whose colour pass draws the whole
    // card: the colour is masked here, so uTexture decides only the cut-out.
    // The colour draws all set their own, so this does not carry over.
    for (const m of meshes) {
      this.bindAtlas(u, m, true, 2);
      this.drawStructures(m);
    }
    gl.colorMask(true, true, true, true);
  }

  /**
   * Draw one mesh's structure triangles with whatever program and state are set.
   *
   * Through the shaded VAO with the structure indices swapped in, and the
   * ground's put back after, so the VAO is left as the next frame expects it.
   */
  private drawStructures(m: GlMesh): void {
    const gl = this.gl;
    gl.bindVertexArray(m.vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.structIbo);
    gl.drawElements(gl.TRIANGLES, m.structCount, gl.UNSIGNED_INT, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.groundIbo);
  }

  /**
   * The meshes a frame draws: the model level's, then every world tile whose box
   * is in view.
   *
   * Nothing at all without a model level: the tiles are drawn with the level's
   * look, and an image level or none has no look to give them. The level's own
   * mesh is never culled - it is one draw, and its box is not kept.
   */
  private meshesInView(params: FrameParams): GlMesh[] {
    if (params.level?.kind !== 'model') return [];
    const out: GlMesh[] = [];
    if (this.levelMesh) out.push(this.levelMesh);
    if (this.tileMeshes.size === 0) return out;
    frustumPlanes(params.viewProj, this.planes);
    for (const m of this.tileMeshes.values()) {
      if (m.bounds && boxOutsideFrustum(this.planes, m.bounds)) continue;
      out.push(m);
    }
    return out;
  }

  /** Upload and draw coloured world-space triangles, depth-tested and written. */
  private drawSceneTris(params: FrameParams, data: Float32Array, vertCount: number): void {
    const gl = this.gl;
    const needed = vertCount * 7;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.triBuf);
    if (this.triCapacity < needed) {
      const next = Math.max(needed * 1.5, 8192 * 7) | 0;
      gl.bufferData(gl.ARRAY_BUFFER, next * 4, gl.DYNAMIC_DRAW);
      this.triCapacity = next;
    }
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data, 0, needed);
    const { prog, u } = this.lineProg;
    gl.useProgram(prog);
    u.mat4('uViewProj', params.viewProj);
    u.f3('uCameraPos', params.cameraPos[0], params.cameraPos[1], params.cameraPos[2]);
    u.f1('uFadeStart', 1e9);
    u.f1('uFadeEnd', 1e9 + 1);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(true);
    gl.bindVertexArray(this.triVao);
    gl.drawArrays(gl.TRIANGLES, 0, vertCount);
    gl.disable(gl.BLEND);
  }

  /** Upload and draw a dynamic line list with no distance fade. */
  private drawDynamicLines(
    params: FrameParams,
    data: Float32Array,
    vertCount: number,
    vao: WebGLVertexArrayObject,
    buf: WebGLBuffer,
    which: 'trail' | 'overlay',
  ): void {
    const gl = this.gl;
    const needed = vertCount * 7;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    const cap = which === 'trail' ? this.trailCapacity : this.overlayCapacity;
    if (cap < needed) {
      const next = Math.max(needed, 8192 * 7);
      gl.bufferData(gl.ARRAY_BUFFER, next * 4, gl.DYNAMIC_DRAW);
      if (which === 'trail') this.trailCapacity = next;
      else this.overlayCapacity = next;
    }
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data, 0, needed);

    const { prog, u } = this.lineProg;
    gl.useProgram(prog);
    u.mat4('uViewProj', params.viewProj);
    u.f3('uCameraPos', params.cameraPos[0], params.cameraPos[1], params.cameraPos[2]);
    // Fade thresholds far beyond any scene, i.e. no fade.
    u.f1('uFadeStart', 1e9);
    u.f1('uFadeEnd', 1e9 + 1);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.LINES, 0, vertCount);
    gl.disable(gl.BLEND);
  }

  /**
   * The level: with `shells` false what stands solid in it (the ground, the
   * water, structures drawn opaque), drawn first; with `shells` true its
   * see-through structures and their edges, drawn after everything else in
   * the scene. Drawn first as they used to be, they wrote no depth, so a
   * figure drawn after stood over them at full strength wherever it was (and
   * the WebGPU renderer's depth seal, drawn with them, hid it altogether):
   * now one behind a shell is seen through it like the ground behind it, and
   * one in front of it, having written its depth, is not covered.
   */
  private drawLevel(params: FrameParams, level: NonNullable<FrameParams['level']>, shells: boolean): void {
    const gl = this.gl;
    const translucent = level.opacity < 0.999;
    if (translucent) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      // A translucent background must not write depth, or it would occlude the
      // heat it is supposed to sit behind.
      gl.depthMask(false);
    }

    if (level.kind === 'image' && this.mapTex && !shells) {
      const { prog, u } = this.mapProg;
      gl.useProgram(prog);
      u.mat4('uViewProj', params.viewProj);
      const l = u.loc('uRect');
      if (l) gl.uniform4f(l, level.rect[0], level.rect[1], level.rect[2], level.rect[3]);
      u.f1('uY', level.y);
      u.i1('uFlipV', level.flipV ? 1 : 0);
      u.f1('uOpacity', level.opacity);
      u.f1('uDesaturate', level.desaturate);
      u.f1('uBrightness', level.brightness);
      u.i1('uMap', 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.mapTex);
      gl.bindVertexArray(this.emptyVao);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindVertexArray(null);
    } else if (level.kind === 'model') {
      this.drawLevelMesh(params, level, shells);
    }

    if (translucent) {
      gl.disable(gl.BLEND);
      gl.depthMask(true);
    }
  }

  /**
   * Ground, then water, then structures, then the structure wireframe - each for
   * the level and every world tile in view before the next begins.
   *
   * Order and depth state matter. The ground is opaque and writes depth so it
   * occludes heat below it. Structures are translucent (drawn last, `shells`) and must not write depth,
   * or their front faces would hide their own back faces and the heat inside
   * them — which is exactly what the transparency exists to reveal. That is also
   * why the passes go set by set rather than mesh by mesh: a tile's ground drawn
   * after the level's shells would paint over the shells standing in front of it.
   *
   * A tile is drawn with the level's look, as if it were more of the level; only
   * what the level resolved from its own contents - captured colour, its atlas,
   * whether it has water or structures at all - is taken from `level.tiles`
   * instead, which carries the user's switches unresolved.
   */
  private drawLevelMesh(params: FrameParams, level: NonNullable<FrameParams['level']>, shells: boolean): void {
    const gl = this.gl;
    const { prog, u } = this.meshProg;
    const s = level.structure;
    const look = level.tiles;
    const meshes = this.frameMeshes;

    const grounds = shells ? [] : meshes.filter((m) => m.vao && m.groundIbo && m.groundCount > 0);
    if (grounds.length > 0) {
      gl.useProgram(prog);
      u.mat4('uViewProj', params.viewProj);
      u.f3('uCameraPos', params.cameraPos[0], params.cameraPos[1], params.cameraPos[2]);
      u.f3('uTint', 1, 1, 1);
      u.f1('uOpacity', level.opacity);
      u.f1('uBrightness', level.brightness);
      u.f1('uFresnel', 0);
      // Terrain stays smooth: it is a sampled height grid, and faceting it would
      // show the sampling grid rather than the hill.
      u.f1('uFlatNormals', 0);
      this.setRelief(u, level);
      this.setSlice(u, params.slice);
      this.setCull(u, params);
      for (const m of grounds) {
        u.f1('uVertexColour', (m.tile ? look.colours : level.vertexColours) ? 1 : 0);
        this.bindAtlas(u, m, m.tile ? look.texture : level.texture);
        gl.bindVertexArray(m.vao);
        gl.drawElements(gl.TRIANGLES, m.groundCount, gl.UNSIGNED_INT, 0);
      }

      // The ground's triangles *over* the shaded ground, not instead of it.
      //
      // This used to be an either/or, and "wireframe" meant "replace the
      // surface with its edges" — which loses the shading, the contours and the
      // occlusion all at once, and leaves you looking through the terrain at
      // whatever is under it. A mesh you can read the shape of and count the
      // triangles of at the same time is the thing that was actually wanted.
      if (level.groundWireOpacity > 0) {
        for (const m of grounds) this.ensureGroundWire(m);
        const wire = this.wireProg;
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(false);
        gl.useProgram(wire.prog);
        wire.u.mat4('uViewProj', params.viewProj);
        wire.u.f3('uTint', 1, 1, 1);
        wire.u.f1('uOpacity', level.groundWireOpacity);
        wire.u.f3('uCameraPos', params.cameraPos[0], params.cameraPos[1], params.cameraPos[2]);
        wire.u.f1('uFadeStart', level.groundWireFade[0]);
        wire.u.f1('uFadeEnd', level.groundWireFade[1]);
        this.setSlice(wire.u, params.slice);
        this.setCull(wire.u, params);
        for (const m of grounds) {
          if (!m.groundWireIbo || m.groundWireCount === 0) continue;
          gl.bindVertexArray(m.vao);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.groundWireIbo);
          gl.drawElements(gl.LINES, m.groundWireCount, gl.UNSIGNED_INT, 0);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.groundIbo);
        }
        gl.depthMask(true);
        gl.disable(gl.BLEND);
        gl.useProgram(prog);
      }
    }

    // Water after the ground and before the structures: flat, no relief cues, no
    // Fresnel rim, and its own tint so a lake is distinguishable from the bank it
    // sits in. Depth-writing, because it is a surface — heat under a lake should
    // be hidden by it the same way heat under a hill is.
    const w = level.water;
    const waters = shells ? [] : meshes.filter((m) => m.waterIbo && m.waterCount > 0 && (m.tile ? look.water : w.show));
    if (waters.length > 0) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(prog);
      u.mat4('uViewProj', params.viewProj);
      u.f3('uCameraPos', params.cameraPos[0], params.cameraPos[1], params.cameraPos[2]);
      u.f3('uTint', w.tint[0], w.tint[1], w.tint[2]);
      u.f1('uOpacity', w.opacity);
      u.f1('uBrightness', level.brightness);
      u.f1('uFresnel', 0);
      u.f1('uFlatNormals', 0);
      // Water and structures keep their own tints, so captured colour is off
      // for them. It has to be set rather than left: the three passes share one
      // program, and a uniform holds whatever the ground pass last wrote.
      u.f1('uVertexColour', 0);
      this.setRelief(u, null);
      this.setSlice(u, params.slice);
      this.setCull(u, params);
      for (const m of waters) {
        this.bindAtlas(u, m, false);
        gl.bindVertexArray(m.vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.waterIbo);
        gl.drawElements(gl.TRIANGLES, m.waterCount, gl.UNSIGNED_INT, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.groundIbo);
      }
      gl.disable(gl.BLEND);
    }

    // Textured and fully opaque is a surface like the ground: it writes depth,
    // so a guardrail's far side cannot draw over its near side, and is drawn
    // with it. Anything less is a shell, blended and depth-neutral as below,
    // drawn with the shells.
    const solid = s.textured && s.faceOpacity >= 0.999;
    const faces = solid === shells ? [] : meshes.filter((m) => m.structIbo && m.structCount > 0 && (m.tile ? look.faces : s.showFaces));
    if (faces.length > 0) {
      if (!solid) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(false);
      }
      gl.useProgram(prog);
      u.mat4('uViewProj', params.viewProj);
      u.f3('uCameraPos', params.cameraPos[0], params.cameraPos[1], params.cameraPos[2]);
      if (s.textured) u.f3('uTint', 1, 1, 1);
      else u.f3('uTint', s.tint[0], s.tint[1], s.tint[2]);
      u.f1('uOpacity', s.faceOpacity);
      u.f1('uBrightness', level.brightness);
      // The rim is what makes a shell read as a shell rather than as fog. A
      // textured structure is not a shell.
      u.f1('uFresnel', s.textured ? 0 : 1);
      u.f1('uFlatNormals', s.flat ? 1 : 0);
      // A structure part with no texture carries its colour per vertex; a level
      // with no colour at all has a white buffer, which changes nothing.
      u.f1('uVertexColour', s.textured ? 1 : 0);
      // Structures are shells, not terrain: no relief cues on them.
      this.setRelief(u, null);
      this.setSlice(u, params.slice);
      this.setCull(u, params);
      for (const m of faces) {
        this.bindAtlas(u, m, s.textured, 2);
        this.drawStructures(m);
      }
      gl.depthMask(true);
      gl.disable(gl.BLEND);
    }

    const wires = shells ? meshes.filter((m) => m.wireIbo && m.wireCount > 0 && (m.tile ? look.wire : s.showWire)) : [];
    if (wires.length > 0) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false);
      const wire = this.wireProg;
      gl.useProgram(wire.prog);
      wire.u.mat4('uViewProj', params.viewProj);
      wire.u.f3('uTint', s.tint[0], s.tint[1], s.tint[2]);
      wire.u.f1('uOpacity', s.wireOpacity);
      wire.u.f3('uCameraPos', params.cameraPos[0], params.cameraPos[1], params.cameraPos[2]);
      // No fade on structure edges: they outline objects, not a grid.
      wire.u.f1('uFadeStart', 1e9);
      wire.u.f1('uFadeEnd', 1e9 + 1);
      this.setSlice(wire.u, params.slice);
      this.setCull(wire.u, params);
      for (const m of wires) {
        gl.bindVertexArray(m.wireVao);
        gl.drawElements(gl.LINES, m.wireCount, gl.UNSIGNED_INT, 0);
      }
      gl.depthMask(true);
      gl.disable(gl.BLEND);
    }

    gl.bindVertexArray(null);
  }

  /**
   * Build a mesh's ground edge list, once, the first time it is drawn as
   * wireframe.
   *
   * Deferred because it is a million Set operations on a decimated level and the
   * shaded view never needs it.
   */
  private ensureGroundWire(m: GlMesh): void {
    if (m.groundWireIbo || m.groundIndices.length === 0) return;
    const edges = buildEdgeList(m.groundIndices);
    if (edges.length === 0) return;
    const gl = this.gl;
    // No VAO current, or the upload would replace that VAO's element buffer.
    gl.bindVertexArray(null);
    const buffer = mustBuffer(gl);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, edges, gl.STATIC_DRAW);
    m.groundWireIbo = buffer;
    m.groundWireCount = edges.length;
    m.bytes += edges.byteLength;
    if (m.tile) this.tileBytes += edges.byteLength;
    else this.levelOwnBytes += edges.byteLength;
  }

  /** Relief cues for the ground pass; `null` turns them all off. */
  private setRelief(u: UniformCache, level: FrameParams['level'] | null): void {
    const r = level && level.kind === 'model' ? level.relief : null;
    u.f1('uSlope', r ? r.slope : 0);
    u.f1('uContourSpacing', r ? r.contourSpacing : 0);
    u.f1('uContourStrength', r ? r.contourStrength : 0);
    u.f1('uContourIndex', r ? r.contourIndexEvery : 0);
    u.f1('uElevRange', r ? r.elevationRange : 0);
    u.f2('uElevBand', r ? r.lowY : 0, r ? r.highY : 1);
  }

  /** The volumes filter (volumes/gpu.ts), for the heat passes. */
  private setVolumes(u: UniformCache, vol: VolumeDraw | null | undefined): void {
    const gl = this.gl;
    const cfg = u.loc('uVolCfg');
    if (!cfg) return;
    if (!vol) {
      gl.uniform4f(cfg, 0, 0, 0, 0);
      return;
    }
    const b = vol.block;
    gl.uniform4fv(cfg, b.subarray(VOL_CFG, VOL_CFG + 4));
    const m = u.loc('uVolM[0]') ?? u.loc('uVolM');
    if (m) gl.uniform4fv(m, b.subarray(VOL_M, VOL_INFO));
    const info = u.loc('uVolInfo[0]') ?? u.loc('uVolInfo');
    if (info) gl.uniform4fv(info, b.subarray(VOL_INFO, VOL_POLY));
    const poly = u.loc('uVolPoly[0]') ?? u.loc('uVolPoly');
    if (poly) gl.uniform4fv(poly, b.subarray(VOL_POLY, VOLUME_BLOCK_FLOATS));
  }

  /** The slice slab, for any pass that draws world-space geometry. */
  private setSlice(u: UniformCache, slice: SliceDraw | null): void {
    u.i1('uSliceAxis', slice ? slice.axis : -1);
    u.f2('uSliceRange', slice ? slice.min : 0, slice ? slice.max : 0);
    u.f1('uSliceOutside', slice ? slice.outside : 1);
  }

  /**
   * The distance cull, for a pass that draws level geometry.
   *
   * Called wherever `setSlice` is, and for the same reason: both cut the world
   * and both have to cut it identically for every part of it. A far plane that
   * removed the heat and left the building in front of it hides the thing it was
   * moved there to reveal.
   *
   * `cullGeometry` is what gates it, so the plane can still be used on the heat
   * alone — reading density through a level you can see is a legitimate thing to
   * want, and it was the only behaviour until now.
   */
  private setCull(u: UniformCache, params: FrameParams): void {
    const on = params.heat.cullGeometry;
    u.f3('uCamPos', params.cameraPos[0], params.cameraPos[1], params.cameraPos[2]);
    u.f3(
      'uCamFwd',
      params.cameraForward[0],
      params.cameraForward[1],
      params.cameraForward[2],
    );
    u.f2(
      'uGeomCull',
      on ? Math.max(0, params.heat.cullNear) : 0,
      on ? Math.max(0, params.heat.cullFar) : 0,
    );
    u.i1('uCullPlanar', params.heat.cullPlanar ? 1 : 0);
  }

  private clearHeat(): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.heatFbo);
    gl.viewport(0, 0, this.heatWidth, this.heatHeight);
    gl.disable(gl.BLEND);
    gl.colorMask(true, true, true, true);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  /**
   * The heat pass, timed on the GPU where the context has timer queries.
   *
   * The engine sizes the heat by its own GPU time, since the display's refresh
   * hides any headroom from the frame time. One query in flight at a time,
   * read when it is ready and never waited on; a disjoint reading is dropped.
   */
  private timeHeat(params: FrameParams): void {
    const gl = this.gl;
    if (this.timer === undefined) this.timer = gl.getExtension('EXT_disjoint_timer_query_webgl2') as { TIME_ELAPSED_EXT: number; GPU_DISJOINT_EXT: number } | null;
    const t = this.timer;
    if (t && this.heatQuery && gl.getQueryParameter(this.heatQuery, gl.QUERY_RESULT_AVAILABLE)) {
      const ns = gl.getQueryParameter(this.heatQuery, gl.QUERY_RESULT) as number;
      if (!gl.getParameter(t.GPU_DISJOINT_EXT)) {
        const ms = ns / 1e6;
        const prev = this.passMs.heat;
        if (ms >= 0 && ms < 1000) {
          this.passMs.heat = prev === undefined ? ms : prev * 0.9 + ms * 0.1;
          this.passMs.heatLast = ms;
        }
      }
      gl.deleteQuery(this.heatQuery);
      this.heatQuery = null;
    }
    const q = t && !this.heatQuery ? gl.createQuery() : null;
    if (q) gl.beginQuery(t!.TIME_ELAPSED_EXT, q);
    this.drawHeat(params);
    if (q) {
      gl.endQuery(t!.TIME_ELAPSED_EXT);
      this.heatQuery = q;
    }
  }

  private timer: { TIME_ELAPSED_EXT: number; GPU_DISJOINT_EXT: number } | null | undefined;
  private heatQuery: WebGLQuery | null = null;
  private readonly passMs: Record<string, number> = {};

  /** Milliseconds of GPU time a pass, averaged; empty where the context cannot time them. */
  get gpuPassMs(): Record<string, number> {
    return this.passMs;
  }

  private drawHeat(params: FrameParams): void {
    const gl = this.gl;
    const alpha = Math.min(1, Math.max(0, params.blendAlpha));
    const extend = params.accumMode === 'extend';
    // Alpha of zero means "hold what is there", so there is nothing to do.
    if (params.accumMode !== 'reset' && !extend && alpha <= 0) return;

    // A full-weight frame goes straight into the accumulator; a partial one is
    // rendered into the scratch target first and blended in afterwards. Splatting
    // a fractional frame directly would add each sprite's contribution to a total
    // 1/alpha times larger than it, which a half-float target rounds away — worse
    // the denser the pixel, which is what makes it look like the hot areas cooling.
    const direct = extend || params.accumMode === 'reset' || alpha >= 1;
    gl.bindFramebuffer(gl.FRAMEBUFFER, direct ? this.heatFbo : this.heatScratchFbo);
    gl.viewport(0, 0, this.heatWidth, this.heatHeight);
    gl.disable(gl.BLEND);
    gl.colorMask(true, true, true, true);
    // Extending adds to what is already there, so it is the one mode that must
    // not clear first — that is the whole point of it.
    if (!extend) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    const weight = params.sampleWeight * params.heatGain;
    if (params.plan.length === 0) {
      this.splitSkippedChunks = 0;
      // Nothing to splat. A partial frame still has to fold its (empty) estimate
      // in, or the history would not decay and a stale field would persist.
      if (!direct) this.mergeHeat(alpha);
      return;
    }

    // Additive so overlapping sprites sum, exactly as overlapping translucent
    // sprites would — but in a float buffer, so it never clips at 1.0 and can go
    // negative for the difference mode.
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.ONE, gl.ONE);
    // No depth test: the heat target has no depth buffer, and occlusion is the
    // splat shader's own soft comparison against the scene depth texture.
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.disable(gl.CULL_FACE);

    // Line heat where it has routes to draw and its program compiled; points
    // otherwise, rather than nothing.
    const lineProg = params.lineHeat && this.lines ? this.lineHeat() : null;
    const { prog, u } = lineProg ?? this.heatProg;
    gl.useProgram(prog);
    if (lineProg && this.lines) {
      u.i1('uLineStartTex', LINE_UNIT);
      u.f3('uLineMin', this.lines.min[0], this.lines.min[1], this.lines.min[2]);
      u.f3('uLineSize', this.lines.size[0], this.lines.size[1], this.lines.size[2]);
    }
    const vertsPerRow = lineProg ? 18 : 3;
    u.mat4('uViewProj', params.viewProj);
    u.f2('uViewport', this.heatWidth, this.heatHeight);
    u.f1('uProj11', params.proj[5]);
    u.i1('uPerspective', params.perspective ? 1 : 0);
    u.f1('uRadius', params.heat.radius);
    // Screen pixels, in texels of the heat buffer; see the WebGPU renderer.
    const texelsPerPixel = this.heatHeight / Math.max(1, this.height);
    u.f2(
      'uPixelClamp',
      Math.max(Math.min(1, params.heat.minPixelRadius), params.heat.minPixelRadius * texelsPerPixel),
      Math.max(1, params.heat.maxPixelRadius * texelsPerPixel),
    );
    u.i1('uConserve', params.heat.zoomInvariant ? 1 : 0);
    u.i1('uTexMask', ROW_TEX_WIDTH - 1);
    u.i1('uTexShift', ROW_TEX_SHIFT);
    u.i1('uBlockShift', BLOCK_SHIFT);
    u.i1('uGroundProjected', params.heat.groundProjected ? 1 : 0);
    u.f1('uGroundY', params.heat.groundY);
    u.i1('uSigned', params.useTeamSign ? 1 : 0);
    u.i1('uTeamColors', params.heat.teamColors ? 1 : 0);
    u.f1('uTeamCount', Math.max(1, params.heat.teamCount));
    u.f1('uTeamNeutral', params.heat.teamNeutral);
    u.f1('uTeamSlices', Math.max(1, params.heat.teamSlices));
    u.f1('uCenter', params.heat.centerIntensity);
    u.f1('uEdge', params.heat.edgeIntensity);
    u.f1('uFalloff', Math.max(0.01, params.heat.falloff));
    u.i1('uSmooth', params.heat.smoothRamp ? 1 : 0);
    u.i1('uUseCurve', params.heat.useCurve ? 1 : 0);
    u.f1('uWeight', weight);
    u.f3('uCamPos', params.cameraPos[0], params.cameraPos[1], params.cameraPos[2]);
    u.f3(
      'uCamFwd',
      params.cameraForward[0],
      params.cameraForward[1],
      params.cameraForward[2],
    );
    u.f2('uDistCull', params.heat.cullNear, params.heat.cullFar);
    u.i1('uCullPlanar', params.heat.cullPlanar ? 1 : 0);
    u.i1('uPosTex', 0);
    u.i1('uBlockTex', 1);
    u.i1('uTeamSignTex', 2);
    u.i1('uTimeTex', 3);
    u.f1('uNow', params.lifetime?.now ?? 0);
    u.f1('uDefaultLifetime', params.lifetime?.defaultLifetime ?? 0);
    u.f1('uFadeIn', params.lifetime?.fadeOut ?? 0);

    const filters = params.filters.slice(0, MAX_FILTER_SLOTS);
    for (let i = 0; i < MAX_FILTER_SLOTS; i++) {
      u.i1(`uFilterTex${i}`, 4 + i);
    }
    u.i1('uFilterMaskTex', 4 + MAX_FILTER_SLOTS);
    // Bound unconditionally: an unbound sampler is undefined behaviour on some
    // drivers even when the branch that reads it is never taken.
    u.i1('uCurveTex', 5 + MAX_FILTER_SLOTS);
    gl.activeTexture(gl.TEXTURE0 + 5 + MAX_FILTER_SLOTS);
    gl.bindTexture(gl.TEXTURE_2D, this.curveTex);
    u.i1('uSplitTex', 6 + MAX_FILTER_SLOTS);
    u.i1('uSignWidth', this.teamSignWidth);
    u.f2('uSplitPos', params.splitPositive[0], params.splitPositive[1]);
    u.f2('uSplitNeg', params.splitNegative[0], params.splitNegative[1]);
    u.f2('uSideScale', params.splitScale[0], params.splitScale[1]);
    if (filters.some((f) => f.kind === 'categories')) {
      gl.activeTexture(gl.TEXTURE0 + 4 + MAX_FILTER_SLOTS);
      gl.bindTexture(gl.TEXTURE_2D, this.ensureFilterMask(filters));
    } else {
      gl.activeTexture(gl.TEXTURE0 + 4 + MAX_FILTER_SLOTS);
      gl.bindTexture(gl.TEXTURE_2D, this.ensureDummy());
    }
    const rangeBuf = new Float32Array(MAX_FILTER_SLOTS * 2);
    for (let i = 0; i < filters.length; i++) {
      rangeBuf[i * 2] = filters[i].min;
      rangeBuf[i * 2 + 1] = filters[i].max;
    }
    const rangeLoc = u.loc('uFilterRange[0]') ?? u.loc('uFilterRange');
    if (rangeLoc) gl.uniform2fv(rangeLoc, rangeBuf);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.blockTex);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.teamSignTex);

    // Occlusion and slicing, both resolved per point in the vertex shader.
    const occlusion = params.level ? Math.max(0, Math.min(1, params.heat.occlusion)) : 0;
    const dbg = new URLSearchParams(location.search).get('occdebug');
    u.f1('uOcclusion', dbg && occlusion > 0 ? Number(dbg) : occlusion);
    u.f1('uOcclusionFloor', params.heat.occlusionFloor);
    u.f1('uOccludedExtra', params.heat.occludedExtra);
    u.f2('uNearFar', params.near, params.far);
    const depthUnit = 7 + MAX_FILTER_SLOTS;
    u.i1('uSceneDepth', depthUnit);
    gl.activeTexture(gl.TEXTURE0 + depthUnit);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneDepth);
    // The peeled layers, so the shader can count walls rather than detect one.
    // Only bound when occlusion is on: the peel passes are skipped otherwise, so
    // the textures would hold the previous frame's geometry.
    const layers = occlusion > 0 ? this.peelDepth.length : 0;
    u.i1('uLayerCount', layers);
    for (let i = 0; i < this.peelDepth.length; i++) {
      const unit = depthUnit + 1 + i;
      u.i1(`uDepthLayers[${i}]`, unit);
      gl.activeTexture(gl.TEXTURE0 + unit);
      // Bound even when unused: an unbound sampler is undefined behaviour on
      // some drivers even where the shader never reads it.
      gl.bindTexture(gl.TEXTURE_2D, i < layers ? this.peelDepth[i] : this.sceneDepth);
    }
    // The nearest structure surface, for telling a wall from a hillside.
    const groundCull = params.heat.hideBehindGround && this.structDepth !== null;
    u.i1('uGroundCull', groundCull ? 1 : 0);
    const structUnit = depthUnit + 1 + this.peelDepth.length;
    u.i1('uStructDepth', structUnit);
    gl.activeTexture(gl.TEXTURE0 + structUnit);
    gl.bindTexture(gl.TEXTURE_2D, groundCull ? this.structDepth : this.sceneDepth);
    const slice = params.slice && params.slice.clipHeat ? params.slice : null;
    u.i1('uSliceAxis', slice ? slice.axis : -1);
    u.f2('uSliceRange', slice ? slice.min : 0, slice ? slice.max : 0);
    u.f1('uSliceOutside', slice ? slice.outside : 1);
    this.setVolumes(u, params.volumes);

    gl.bindVertexArray(this.emptyVao);

    // Drained only when checking is on: `getError` is a pipeline sync point, so
    // calling it per frame — let alone per draw — costs real throughput.
    if (GL_CHECK) {
      while (gl.getError() !== gl.NO_ERROR) {
        /* discard */
      }
    }
    let drawn = 0;
    let sprites = 0;
    let splitSkipped = 0;
    for (const plan of params.plan) {
      const chunk = this.chunks[plan.chunk];
      if (!chunk || plan.blockCount === 0) continue;
      const blocks = Math.min(plan.blockCount, MAX_BLOCKS);

      // The split column rides the same per-chunk, per-column value textures the
      // filters use, so a column split costs one lazily uploaded 4-bytes-per-row
      // texture and nothing else. Without it - the column could not be put on
      // the GPU for this chunk, or the split has no column it can draw - the
      // chunk is left out and counted, not drawn with the group split: that
      // silently showed a team split under a column someone had just chosen.
      const splitTex =
        params.splitMode !== 0 && params.splitColumn
          ? this.filterTexture(plan.chunk, params.splitColumn, filters)
          : null;
      if (params.splitMode !== 0 && !splitTex) {
        splitSkipped++;
        continue;
      }

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.blockTex);
      // Uint32 row indices reinterpreted as Int32; values stay well under 2^31.
      // Padded to whole rows of the block texture so this is one upload rather
      // than one per row.
      const rows = Math.ceil(blocks / BLOCK_TEX_WIDTH);
      const staging = this.blockStaging(rows * BLOCK_TEX_WIDTH);
      for (let i = 0; i < blocks; i++) staging[i] = plan.blockStarts[i];
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        BLOCK_TEX_WIDTH,
        rows,
        gl.RED_INTEGER,
        gl.INT,
        staging,
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, chunk.posTex);
      if (lineProg) {
        gl.activeTexture(gl.TEXTURE0 + LINE_UNIT);
        gl.bindTexture(gl.TEXTURE_2D, chunk.lineTex ?? this.ensureDummyUint());
      }

      // Fall back to the window-only path if this chunk has no lifetime data,
      // rather than sampling an unbound texture unit.
      const useLifetime = params.lifetime !== null && chunk.timeTex !== null;
      u.i1('uUseLifetime', useLifetime ? 1 : 0);
      // Line heat played back reads the row times too, to place the playhead on
      // a segment.
      const trail = lineProg && params.lineTrail && chunk.timeTex ? params.lineTrail : null;
      if (lineProg) {
        u.f1('uTrail', trail ? trail.tail : 0);
        u.f1('uTrailNow', trail ? trail.now : 0);
      }
      // Bound either way. WebGL validates every active sampler at draw time, not
      // only the ones actually read, so leaving this unit holding whatever the
      // previous pass left — the composite's depth texture, say — rejects the
      // entire draw with no error visible anywhere except a missing heatmap.
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, useLifetime || trail ? chunk.timeTex : this.ensureDummyUint());
      if (useLifetime || trail) {
        u.f1('uChunkTimeMin', chunk.timeMin);
        u.f1('uTimeScale', chunk.timeScale);
        u.f1('uLifeScale', chunk.lifeScale);
      }

      // Filter value textures are per chunk, so they bind inside the loop. A
      // slot whose texture could not be allocated is switched off rather than
      // left sampling a stale or dummy texture, which would silently filter the
      // wrong rows.
      const modes = new Int32Array(MAX_FILTER_SLOTS);
      for (let i = 0; i < MAX_FILTER_SLOTS; i++) {
        const f = filters[i];
        const tex = f ? this.filterTexture(plan.chunk, f.column, filters, params.splitColumn) : null;
        gl.activeTexture(gl.TEXTURE0 + 4 + i);
        gl.bindTexture(gl.TEXTURE_2D, tex ?? this.ensureDummy());
        modes[i] = tex ? (f!.kind === 'range' ? 1 : 2) : 0;
      }
      const modeLoc = u.loc('uFilterMode[0]') ?? u.loc('uFilterMode');
      if (modeLoc) gl.uniform1iv(modeLoc, modes);

      gl.activeTexture(gl.TEXTURE0 + 6 + MAX_FILTER_SLOTS);
      gl.bindTexture(gl.TEXTURE_2D, splitTex ?? this.ensureDummy());
      u.i1('uSplitMode', params.splitMode);

      u.f3('uAabbMin', chunk.aabbMin[0], chunk.aabbMin[1], chunk.aabbMin[2]);
      u.f3('uAabbSize', chunk.aabbSize[0], chunk.aabbSize[1], chunk.aabbSize[2]);
      u.i1('uMinRow', plan.minRow);
      u.i1('uMaxRow', Math.min(plan.maxRow, chunk.rows));

      gl.drawArrays(gl.TRIANGLES, 0, blocks * SAMPLE_BLOCK * vertsPerRow);
      drawn++;
      sprites += blocks * SAMPLE_BLOCK;
    }

    gl.bindVertexArray(null);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    if (!direct) this.mergeHeat(alpha);

    // Record what the heat pass actually did. WebGL reports a rejected draw only
    // through `getError`, and a rejected heat draw is indistinguishable from a
    // dataset with nothing in it — which is how a silently unallocated block
    // index texture went unnoticed for so long. `?glcheck` turns the error read
    // on; the counters are free either way.
    this.heatDebug.mode = params.accumMode;
    this.heatDebug.draws = drawn;
    this.heatDebug.sprites = sprites;
    this.splitSkippedChunks = splitSkipped;
    if (GL_CHECK) this.heatDebug.error = gl.getError();
  }

  /** What the last heat pass did, for diagnosing a heatmap that is not there. */
  readonly heatDebug = { mode: '', draws: 0, sprites: 0, error: 0 };

  /** See `Renderer.splitSkippedChunks`. */
  splitSkippedChunks = 0;

  /**
   * Fold the scratch estimate into the accumulator: `acc = acc*(1-a) + scratch*a`.
   *
   * Two fullscreen passes — a multiply then an add — so the accumulator's
   * precision no longer depends on how many frames have been merged. Doing it
   * inside the splat instead makes every sprite's contribution 1/n of the running
   * total, and on a half-float target those simply round away.
   */
  private mergeHeat(alpha: number): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.heatFbo);
    gl.viewport(0, 0, this.heatWidth, this.heatHeight);
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.bindVertexArray(this.emptyVao);

    // Decay: result = 0*src + dst*src, with src the constant (1 - alpha).
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.ZERO, gl.SRC_COLOR);
    gl.useProgram(this.scaleProg.prog);
    this.scaleProg.u.f1('uScale', 1 - alpha);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Add alpha of this frame's estimate.
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(this.blendProg.prog);
    this.blendProg.u.i1('uSrc', 0);
    this.blendProg.u.f1('uScale', alpha);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.heatScratch);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
    gl.depthMask(true);
  }

  private composite(params: FrameParams, signed: boolean, target: WebGLFramebuffer | null = null): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, target);
    gl.viewport(0, 0, this.width, this.height);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    const { prog, u } = this.compositeProg;
    gl.useProgram(prog);
    u.i1('uScene', 0);
    u.i1('uHeat', 1);
    u.i1('uLut', 2);
    // Every accumulation mode stores the estimate itself rather than a running
    // total, so the only thing left to undo is the half-float range scaling.
    u.f1('uInvFrames', 1 / Math.max(1e-9, params.heatGain));
    u.f1('uSaturation', params.heat.saturation);
    u.i1('uResponse', params.heat.response);
    u.f1('uFloor', params.heat.floor);
    u.i1('uSigned', signed ? 1 : 0);

    // Depth of field. A max blur of 0 switches the whole gather off in the
    // shader, so the common case costs one comparison.
    const dof = params.dof;
    u.i1('uSceneDepth', 3);
    u.f3('uDof', dof ? dof.maxBlur : 0, dof?.focus ?? 1, dof?.aperture ?? 1);
    u.f2('uDepthRange', params.near, params.far);
    u.f2('uTexel', 1 / Math.max(1, this.width), 1 / Math.max(1, this.height));
    u.i1('uPerspectiveDepth', params.perspective ? 1 : 0);
    u.i1('uTeamColors', params.heat.teamColors ? 1 : 0);
    u.f1('uTeamBoost', params.heat.teamBoost);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneColor);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.heatColor);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.lutTex);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneDepth);

    gl.bindVertexArray(this.emptyVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);

    // Read back here, inside the same task as the draw, if anybody asked.
    //
    // It has to be here and nowhere else: the context is created with
    // `preserveDrawingBuffer: false`, so once the browser composites, the default
    // framebuffer's contents are undefined by spec. A `readPixels` from a capture
    // function called between frames returns whatever the driver happens to
    // leave behind — black on some, the previous frame on others, the right
    // answer often enough to look correct in testing.
    if (params.topVerts && params.topVertCount) this.drawTop(params, params.topVerts, params.topVertCount);
    if (!target) this.readCapture();
  }

  /** Lines over the composited picture, heat and all, without depth (`FrameParams.topVerts`). */
  private drawTop(params: FrameParams, data: Float32Array, count: number): void {
    const gl = this.gl;
    if (!this.top) {
      const buf = mustBuffer(gl);
      this.top = { buf, vao: this.buildLineVao(buf), capacity: 0 };
    }
    const top = this.top;
    gl.bindBuffer(gl.ARRAY_BUFFER, top.buf);
    if (top.capacity < count * 7) {
      top.capacity = Math.max(count * 7 * 2, 8192 * 7);
      gl.bufferData(gl.ARRAY_BUFFER, top.capacity * 4, gl.DYNAMIC_DRAW);
    }
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data, 0, count * 7);
    const { prog, u } = this.lineProg;
    gl.useProgram(prog);
    u.mat4('uViewProj', params.viewProj);
    u.f3('uCameraPos', params.cameraPos[0], params.cameraPos[1], params.cameraPos[2]);
    u.f1('uFadeStart', 1e9);
    u.f1('uFadeEnd', 1e9 + 1);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindVertexArray(top.vao);
    gl.drawArrays(gl.LINES, 0, count);
    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
  }

  /** The capture readback, after the last pass into the canvas. */
  private readCapture(): void {
    const gl = this.gl;
    if (this.captureWanted) {
      const rgba = new Uint8Array(this.width * this.height * 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, rgba);
      // GL reads bottom row first; every consumer here wants top row first.
      const row = this.width * 4;
      const flipped = new Uint8Array(rgba.length);
      for (let y = 0; y < this.height; y++) {
        flipped.set(rgba.subarray(y * row, y * row + row), (this.height - 1 - y) * row);
      }
      this.captured = { width: this.width, height: this.height, rgba: flipped };
      this.captureWanted = false;
    }
  }

  private captureWanted = false;
  private captured: CapturedFrame | null = null;

  /**
   * The next rendered frame, read back from the default framebuffer.
   *
   * Asks for a frame and waits for one, rather than reading immediately: the
   * engine skips drawing entirely when a converged view has nothing new to add,
   * so a capture taken on demand would return a stale or empty buffer exactly
   * when the picture is finished — which is the moment worth capturing.
   */
  async captureFrame(): Promise<CapturedFrame | null> {
    this.captured = null;
    this.captureWanted = true;
    for (let i = 0; i < 240 && !this.captured; i++) {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    }
    this.captureWanted = false;
    return this.captured;
  }

  // --------------------------------------------------------------- resources

  /**
   * Per-row values for one filter column in one chunk, uploaded on first use.
   *
   * Category columns are stored as float ids in the same R32F format as numeric
   * ones: it keeps the shader to a single sampler type, and a float32 represents
   * every integer below 2^24 exactly, far more categories than are usable.
   */
  private filterTexture(
    chunkIndex: number,
    column: string,
    inUse: readonly ActiveFilter[] = [],
    splitColumn: string | null = null,
  ): WebGLTexture | null {
    const key = `${chunkIndex}:${column}`;
    const hit = this.filterTextures.get(key);
    if (hit) return hit;

    const ds = this.dataset;
    if (!ds) return null;
    // A retained column, or the person ids for the person filter's slot.
    const src = filterColumnData(ds, column);
    if (!src) return null;

    const start = chunkIndex * CHUNK_ROWS;
    const rows = Math.min(CHUNK_ROWS, ds.count - start);
    if (rows <= 0) return null;
    const texHeight = Math.ceil(rows / ROW_TEX_WIDTH);
    const cost = ROW_TEX_WIDTH * texHeight * 4;
    // Every column ever filtered or split on stays resident until the dataset
    // changes, so a budget that has filled up is mostly columns nobody is using
    // any more. Those go first, before a column in use is refused.
    if (this.gpuBytesUsed + cost > this.gpuBudgetBytes) {
      const keep = new Set(inUse.map((f) => f.column));
      keep.add(column);
      if (splitColumn) keep.add(splitColumn);
      this.evictFilterTextures(keep, cost);
    }
    if (this.gpuBytesUsed + cost > this.gpuBudgetBytes) return null;

    const data = new Float32Array(ROW_TEX_WIDTH * texHeight);
    for (let i = 0; i < rows; i++) data[i] = src[start + i];

    const gl = this.gl;
    const tex = createTexture(gl, {
      width: ROW_TEX_WIDTH,
      height: texHeight,
      internalFormat: gl.R32F,
      format: gl.RED,
      type: gl.FLOAT,
      data,
    });
    this.filterTextures.set(key, tex);
    this.gpuBytesUsed += cost;
    return tex;
  }

  /**
   * Free per-row column textures for columns outside `keep` until `need` more
   * bytes fit in the budget, or there is nothing left to free.
   */
  private evictFilterTextures(keep: ReadonlySet<string>, need: number): void {
    const gl = this.gl;
    for (const [key, tex] of this.filterTextures) {
      if (this.gpuBytesUsed + need <= this.gpuBudgetBytes) return;
      const column = key.slice(key.indexOf(':') + 1);
      if (keep.has(column)) continue;
      const chunkIndex = Number(key.slice(0, key.indexOf(':')));
      const rows = Math.min(CHUNK_ROWS, (this.dataset?.count ?? 0) - chunkIndex * CHUNK_ROWS);
      gl.deleteTexture(tex);
      this.filterTextures.delete(key);
      this.gpuBytesUsed -= ROW_TEX_WIDTH * Math.ceil(Math.max(0, rows) / ROW_TEX_WIDTH) * 4;
    }
  }

  /**
   * Category allow-masks, `FILTER_MASK_ROWS` texture rows per filter slot.
   *
   * Id c of slot s is the texel (c mod width, s * rows + c / width), so a slot
   * holds `FILTER_MASK_CAPACITY` ids — enough for the person filter, whose ids
   * are people and run to tens of thousands.
   */
  private ensureFilterMask(filters: ActiveFilter[]): WebGLTexture {
    const gl = this.gl;
    if (!this.filterMaskTex) {
      this.filterMaskTex = createTexture(gl, {
        width: FILTER_MASK_WIDTH,
        height: MAX_FILTER_SLOTS * FILTER_MASK_ROWS,
        internalFormat: gl.R8,
        format: gl.RED,
        type: gl.UNSIGNED_BYTE,
      });
    }
    // Rebuild only when the selection actually changed; this runs every frame.
    const sig = filters.map((f) => (f.mask ? f.key : '')).join('|');
    if (sig !== this.filterMaskDirty) {
      this.filterMaskDirty = sig;
      const block = new Uint8Array(FILTER_MASK_WIDTH * FILTER_MASK_ROWS);
      gl.bindTexture(gl.TEXTURE_2D, this.filterMaskTex);
      for (let slot = 0; slot < MAX_FILTER_SLOTS; slot++) {
        const mask = filters[slot]?.mask;
        block.fill(0);
        if (mask) block.set(mask.subarray(0, Math.min(mask.length, block.length)));
        gl.texSubImage2D(
          gl.TEXTURE_2D,
          0,
          0,
          slot * FILTER_MASK_ROWS,
          FILTER_MASK_WIDTH,
          FILTER_MASK_ROWS,
          gl.RED,
          gl.UNSIGNED_BYTE,
          block,
        );
      }
    }
    return this.filterMaskTex;
  }

  private ensureDummy(): WebGLTexture {
    if (!this.dummyTex) {
      this.dummyTex = createTexture(this.gl, {
        width: 1,
        height: 1,
        internalFormat: this.gl.R32F,
        format: this.gl.RED,
        type: this.gl.FLOAT,
        data: new Float32Array(1),
      });
    }
    return this.dummyTex;
  }

  /**
   * 1x1 RG16UI placeholder for the row-time sampler.
   *
   * Needed because WebGL validates *every* active sampler at draw time, not just
   * the ones the shader ends up reading. A `usampler2D` whose unit holds a
   * float or depth texture makes the whole draw an INVALID_OPERATION — silently,
   * with nothing drawn — so the unit cannot be left holding whatever the previous
   * pass put there just because the branch that reads it is switched off.
   */
  /** Reusable staging buffer for the block index upload. */
  private blockStaging(len: number): Int32Array {
    if (!this.blockStagingBuf || this.blockStagingBuf.length < len) {
      this.blockStagingBuf = new Int32Array(len);
    }
    const view = this.blockStagingBuf.subarray(0, len);
    view.fill(0);
    return view;
  }

  private ensureDummyUint(): WebGLTexture {
    if (!this.dummyUintTex) {
      this.dummyUintTex = createTexture(this.gl, {
        width: 1,
        height: 1,
        internalFormat: this.gl.RG16UI,
        format: this.gl.RG_INTEGER,
        type: this.gl.UNSIGNED_SHORT,
        data: new Uint16Array(2),
      });
    }
    return this.dummyUintTex;
  }

  /**
   * Upload both sign tables: groups into row 0, a category split into row 1.
   *
   * Past the end of either table the defaults differ (see `packSignTables`):
   * a group the table does not cover still draws, while an unlisted category is
   * rejected, because it belongs to neither side and counting it as positive
   * would silently add a population nobody selected.
   */
  private updateTeamSign(groups: Int8Array | null, categories: Int8Array | null): void {
    const gl = this.gl;
    const w = this.teamSignWidth;
    if (w === 0) return;
    const scratch = packSignTables(groups, categories, w, this.teamSignScratchFor(w * 2));
    gl.bindTexture(gl.TEXTURE_2D, this.teamSignTex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, w, 2, gl.RED, gl.FLOAT, scratch);
  }

  private teamSignScratchFor(n: number): Float32Array {
    if (!this.teamSignBuf || this.teamSignBuf.length !== n) this.teamSignBuf = new Float32Array(n);
    return this.teamSignBuf;
  }

  /** WebGL2 reads synchronously, so this is the same answer in a promise. */
  probeHeat(canvasX: number, canvasY: number, divisor: number): Promise<number | null> {
    return Promise.resolve(this.readHeatAt(canvasX, canvasY, divisor));
  }

  private uploadCubeInstances(data: Float32Array, count: number): void {
    const gl = this.gl;
    const needed = count * 8;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeInstances);
    if (this.cubeInstanceCapacity < needed) {
      this.cubeInstanceCapacity = Math.max(needed, 4096 * 8);
      gl.bufferData(gl.ARRAY_BUFFER, this.cubeInstanceCapacity * 4, gl.DYNAMIC_DRAW);
    }
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data, 0, needed);
  }

  /**
   * Accumulated heat at one canvas pixel.
   *
   * A single-pixel `readPixels` and therefore a pipeline stall, so the caller is
   * expected to throttle it rather than probe every frame. Returns the same
   * quantity the colour ramp is fed, so the number shown matches the colour seen.
   */
  readHeatAt(canvasX: number, canvasY: number, divisor: number): number | null {
    const gl = this.gl;
    if (!this.heatFbo) return null;
    // Canvas coordinates are top-left origin; GL framebuffers are bottom-left.
    const hx = Math.floor((canvasX / this.width) * this.heatWidth);
    const hy = Math.floor((1 - canvasY / this.height) * this.heatHeight);
    if (hx < 0 || hy < 0 || hx >= this.heatWidth || hy >= this.heatHeight) return null;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.heatFbo);

    // Which format/type pair is legal for readPixels depends on the driver and
    // on whether the target ended up 16- or 32-bit float. Ask, rather than
    // assuming RGBA/FLOAT and getting INVALID_OPERATION on half-float targets.
    if (this.readFormat === 0) {
      this.readFormat = gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_FORMAT) as number;
      this.readType = gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_TYPE) as number;
    }

    const channels = this.readFormat === gl.RED ? 1 : this.readFormat === gl.RG ? 2 : 4;
    // Drain any error left by earlier calls so the check below means this read.
    while (gl.getError() !== gl.NO_ERROR) {
      /* discard */
    }

    let value: number | null = null;
    try {
      if (this.readType === gl.FLOAT) {
        const buf = new Float32Array(channels);
        gl.readPixels(hx, hy, 1, 1, this.readFormat, this.readType, buf);
        value = buf[0];
      } else if (this.readType === gl.HALF_FLOAT) {
        const buf = new Uint16Array(channels);
        gl.readPixels(hx, hy, 1, 1, this.readFormat, this.readType, buf);
        value = halfToFloat(buf[0]);
      } else if (this.readType === gl.UNSIGNED_BYTE) {
        const buf = new Uint8Array(channels);
        gl.readPixels(hx, hy, 1, 1, this.readFormat, this.readType, buf);
        value = buf[0] / 255;
      }
    } catch {
      value = null;
    }

    const err = gl.getError();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (err !== gl.NO_ERROR || value === null || !Number.isFinite(value)) return null;
    return value / Math.max(1, divisor);
  }

  /**
   * Read the heat target and return the magnitudes, subsampled.
   *
   * One read of the whole target rather than many small ones, and without
   * waiting for it: the pixels go to a pixel buffer, a fence marks them, and the
   * fence is polled between frames. A plain `readPixels` waits for the GPU to
   * finish everything queued before it, and the exposure metering after a
   * dataset arrived was a frame lost that way.
   */
  async readHeatField(maxSamples: number): Promise<Float32Array | null> {
    const gl = this.gl;
    if (!this.heatFbo || this.heatWidth <= 0 || this.heatHeight <= 0) return null;
    if (this.fieldReading) return null;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.heatFbo);
    if (this.readFormat === 0) {
      this.readFormat = gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_FORMAT) as number;
      this.readType = gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_TYPE) as number;
    }
    const format = this.readFormat;
    const type = this.readType;
    const channels = format === gl.RED ? 1 : format === gl.RG ? 2 : 4;
    const bytes = type === gl.FLOAT ? 4 : type === gl.HALF_FLOAT ? 2 : type === gl.UNSIGNED_BYTE ? 1 : 0;
    const w = this.heatWidth;
    const h = this.heatHeight;
    const texels = w * h;
    if (bytes === 0) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return null;
    }
    while (gl.getError() !== gl.NO_ERROR) {
      /* drain, so the check below refers to this read */
    }

    const size = texels * channels * bytes;
    this.fieldPbo ??= gl.createBuffer();
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this.fieldPbo);
    if (this.fieldPboBytes < size) {
      gl.bufferData(gl.PIXEL_PACK_BUFFER, size, gl.STREAM_READ);
      this.fieldPboBytes = size;
    }
    gl.readPixels(0, 0, w, h, format, type, 0);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (gl.getError() !== gl.NO_ERROR) return null;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    if (!sync) return null;
    gl.flush();

    this.fieldReading = true;
    let read: ((i: number) => number) | null = null;
    try {
      for (;;) {
        const state = gl.clientWaitSync(sync, 0, 0);
        if (state === gl.ALREADY_SIGNALED || state === gl.CONDITION_SATISFIED) break;
        if (state === gl.WAIT_FAILED || gl.isContextLost()) return null;
        await new Promise((r) => setTimeout(r, 4));
      }
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, this.fieldPbo);
      if (type === gl.FLOAT) {
        const buf = new Float32Array(texels * channels);
        gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, buf);
        read = (i) => buf[i * channels];
      } else if (type === gl.HALF_FLOAT) {
        const buf = new Uint16Array(texels * channels);
        gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, buf);
        read = (i) => halfToFloat(buf[i * channels]);
      } else {
        const buf = new Uint8Array(texels * channels);
        gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, buf);
        read = (i) => buf[i * channels] / 255;
      }
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
    } catch {
      read = null;
    } finally {
      gl.deleteSync(sync);
      this.fieldReading = false;
    }
    if (!read) return null;

    const stride = Math.max(1, Math.floor(texels / Math.max(1, maxSamples)));
    const out = new Float32Array(Math.ceil(texels / stride));
    let n = 0;
    for (let i = 0; i < texels; i += stride) {
      const v = read(i);
      out[n++] = Number.isFinite(v) ? Math.abs(v) : 0;
    }
    return out.subarray(0, n);
  }

  private ensureGrid(params: FrameParams): void {
    const sig = `${params.gridSpacing}|${params.gridExtent}|${params.showGrid}|${params.showAxes}`;
    if (sig === this.lineSignature) return;
    this.lineSignature = sig;
    const verts = buildGridVertices(
      params.gridSpacing,
      params.gridExtent,
      params.showGrid,
      params.showAxes,
    );
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    this.lineVertCount = verts.length / 7;
  }

  private ensureTargets(
    width: number,
    height: number,
    heatScale: number,
    heatChannels: 1 | 4,
  ): void {
    const hw = Math.max(1, Math.round(width * heatScale));
    const hh = Math.max(1, Math.round(height * heatScale));
    if (
      width === this.width &&
      height === this.height &&
      hw === this.heatWidth &&
      hh === this.heatHeight &&
      heatChannels === this.heatChannels
    ) {
      return;
    }
    const gl = this.gl;
    const sceneChanged = width !== this.width || height !== this.height || !this.sceneFbo;
    if (sceneChanged || heatChannels !== this.heatChannels) this.dropHeatSets();
    this.width = width;
    this.height = height;
    this.heatWidth = hw;
    this.heatHeight = hh;
    // The accumulation format follows the mode, so a change of it reallocates
    // exactly as a change of size does. EXT_float_blend gates the 32-bit path for
    // four channels as it does for one, so team colours never quietly drop to half
    // floats on a device where plain heat gets full precision.
    this.heatChannels = heatChannels;
    this.heatInternalFormat = this.float.blendF32
      ? heatChannels === 4
        ? gl.RGBA32F
        : gl.R32F
      : heatChannels === 4
        ? gl.RGBA16F
        : gl.R16F;
    // The readback format depends on the attachment, so re-query it after a
    // resize recreates the target.
    this.readFormat = 0;
    this.readType = 0;
    if (!sceneChanged) {
      // Only the heat resolution moved: the scene, depth and peel targets stay.
      this.useHeatSet(hw, hh);
      return;
    }

    for (const t of [this.sceneColor, this.sceneDepth]) {
      if (t) gl.deleteTexture(t);
    }
    for (const t of this.peelDepth) gl.deleteTexture(t);
    for (const f of this.peelFbo) gl.deleteFramebuffer(f);
    this.peelDepth = [];
    this.peelFbo = [];
    if (this.structDepth) gl.deleteTexture(this.structDepth);
    if (this.structDepthFbo) gl.deleteFramebuffer(this.structDepthFbo);
    this.structDepth = null;
    this.structDepthFbo = null;
    if (this.sceneFbo) gl.deleteFramebuffer(this.sceneFbo);

    this.sceneColor = createTexture(gl, {
      width,
      height,
      internalFormat: gl.RGBA8,
      format: gl.RGBA,
      type: gl.UNSIGNED_BYTE,
      filter: gl.LINEAR,
    });
    this.sceneDepth = createTexture(gl, {
      width,
      height,
      internalFormat: gl.DEPTH_COMPONENT24,
      format: gl.DEPTH_COMPONENT,
      type: gl.UNSIGNED_INT,
    });
    this.sceneFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.sceneColor, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.sceneDepth, 0);
    checkFramebuffer(gl, 'scene');

    // Depth-only targets for the peeled layers. No colour attachment at all —
    // these exist so the heat pass can count how many surfaces stand between a
    // datapoint and the camera, and nothing ever reads their colour.
    for (let i = 0; i < HEAT_DEPTH_LAYERS; i++) {
      const tex = createTexture(gl, {
        width,
        height,
        internalFormat: gl.DEPTH_COMPONENT24,
        format: gl.DEPTH_COMPONENT,
        type: gl.UNSIGNED_INT,
      });
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, tex, 0);
      checkFramebuffer(gl, `peel ${i}`);
      this.peelDepth.push(tex);
      if (fbo) this.peelFbo.push(fbo);
    }

    // ...and one more of the same, for the nearest structure surface.
    this.structDepth = createTexture(gl, {
      width,
      height,
      internalFormat: gl.DEPTH_COMPONENT24,
      format: gl.DEPTH_COMPONENT,
      type: gl.UNSIGNED_INT,
    });
    this.structDepthFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.structDepthFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.structDepth, 0);
    checkFramebuffer(gl, 'structure depth');

    this.heatDepth = null;
    this.useHeatSet(hw, hh);
  }

  /**
   * The heat targets at one resolution, kept for the next time it is wanted.
   *
   * The engine moves the heat resolution in powers of two as the sprites grow
   * and shrink on screen. Each level's targets are made once, the levels around
   * the current one ahead of need, and switching is then a rebinding.
   */
  private readonly heatSets = new Map<string, { color: WebGLTexture; fbo: WebGLFramebuffer; scratch: WebGLTexture; scratchFbo: WebGLFramebuffer }>();

  private useHeatSet(hw: number, hh: number): void {
    const set = this.heatSetFor(hw, hh);
    this.heatColor = set.color;
    this.heatFbo = set.fbo;
    this.heatScratch = set.scratch;
    this.heatScratchFbo = set.scratchFbo;
    // The neighbouring levels, so the first switch to one does not allocate.
    for (const k of [0.5, 0.25, 0.125, 2, 4]) {
      const w = Math.round(hw * k);
      const h = Math.round(hh * k);
      if (w >= 8 && h >= 8 && w <= this.width && h <= this.height) this.heatSetFor(w, h);
    }
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  private dropHeatSets(): void {
    const gl = this.gl;
    for (const s of this.heatSets.values()) {
      gl.deleteTexture(s.color);
      gl.deleteTexture(s.scratch);
      gl.deleteFramebuffer(s.fbo);
      gl.deleteFramebuffer(s.scratchFbo);
    }
    this.heatSets.clear();
  }

  private heatSetFor(hw: number, hh: number) {
    const gl = this.gl;
    const key = `${hw}x${hh}`;
    const have = this.heatSets.get(key);
    if (have) {
      // Most recently used last, so the trim below drops the stalest.
      this.heatSets.delete(key);
      this.heatSets.set(key, have);
      return have;
    }
    const color = createTexture(gl, {
      width: hw,
      height: hh,
      internalFormat: this.heatInternalFormat,
      format: this.heatChannels === 4 ? gl.RGBA : gl.RED,
      type: this.float.blendF32 ? gl.FLOAT : gl.HALF_FLOAT,
      // Half-float is always linear-filterable in WebGL2; 32-bit float needs
      // OES_texture_float_linear. Linear matters as soon as heatScale < 1,
      // where the field is upscaled to the canvas.
      filter:
        !this.float.blendF32 || this.float.linearF32 ? gl.LINEAR : gl.NEAREST,
    });
    // No depth attachment at all. Occlusion used to be the hardware depth test
    // against the scene's depth buffer, shared when the resolutions matched —
    // which meant it silently did nothing in the two cases that matter most: a
    // throttled heat buffer is smaller than the scene and got its own unwritten
    // depth, and a progressive frame accumulates into the scratch target, which
    // never had depth at all. So most frames had no occlusion, and the ones that
    // did culled outright rather than dimming.
    //
    // The splat shader samples the scene depth as a texture instead. That works
    // at any resolution, in every accumulation mode, and can attenuate instead
    // of cull — and sampling a texture that is also an attachment would be a
    // feedback loop, so the attachment has to go.
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, color, 0);
    checkFramebuffer(gl, 'heat');

    // One frame's estimate, accumulated from zero and then blended into the
    // history above.
    //
    // The alternative — splatting straight into the accumulator at 1/n weight —
    // adds each sprite's contribution to a running total n times larger than it,
    // and on a half-float target those addends fall below the representable step
    // and vanish entirely. The error grows with the accumulated value, so it
    // eats the dense areas and leaves the sparse ones intact. Accumulating a
    // frame from zero keeps every addend comparable to the total it is joining,
    // which is the same arithmetic a single unaccumulated frame does.
    const scratch = createTexture(gl, {
      width: hw,
      height: hh,
      internalFormat: this.heatInternalFormat,
      format: this.heatChannels === 4 ? gl.RGBA : gl.RED,
      type: this.float.blendF32 ? gl.FLOAT : gl.HALF_FLOAT,
      filter:
        !this.float.blendF32 || this.float.linearF32 ? gl.LINEAR : gl.NEAREST,
    });
    const scratchFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, scratchFbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      scratch,
      0,
    );
    // Colour only, like the accumulator above: the splat shader does its own
    // depth comparison. Attaching the scene's depth here was also invalid the
    // moment the heat buffer was throttled — a different size from the colour
    // attachment leaves the framebuffer incomplete, and every frame fails.
    checkFramebuffer(gl, 'heat scratch');
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const set = { color: color!, fbo: fbo!, scratch: scratch!, scratchFbo: scratchFbo! };
    this.heatSets.set(key, set);
    while (this.heatSets.size > 8) {
      const [oldest, s] = this.heatSets.entries().next().value!;
      if (s.color === this.heatColor) break;
      gl.deleteTexture(s.color);
      gl.deleteTexture(s.scratch);
      gl.deleteFramebuffer(s.fbo);
      gl.deleteFramebuffer(s.scratchFbo);
      this.heatSets.delete(oldest);
    }
    return set;
  }

  dispose(): void {
    const gl = this.gl;
    for (const j of this.pendingChunks) {
      if (j.posTex) gl.deleteTexture(j.posTex);
      if (j.timeTex) gl.deleteTexture(j.timeTex);
    }
    this.pendingChunks = [];
    this.symbols?.dispose();
    this.symbols = null;
    this.figures?.dispose();
    this.post?.dispose();
    this.figures = null;
    this.tracks?.dispose();
    this.tracks = null;
    for (const c of this.chunks) {
      gl.deleteTexture(c.posTex);
      if (c.timeTex) gl.deleteTexture(c.timeTex);
      if (c.lineTex) gl.deleteTexture(c.lineTex);
    }
    this.chunks = [];
    if (this.lineHeatProg) gl.deleteProgram(this.lineHeatProg.prog);
    for (const p of [
      this.heatProg,
      this.compositeProg,
      this.lineProg,
      this.cubeProg,
      this.lookProg,
      this.scaleProg,
      this.blendProg,
      this.mapProg,
      this.meshProg,
      this.wireProg,
    ]) {
      gl.deleteProgram(p.prog);
    }
    this.setLevel(null);
    this.setWorldTiles([]);
    this.dropHeatSets();
    for (const t of [
      this.sceneColor,
      this.sceneDepth,
      this.heatDepth,
      this.blockTex,
      this.lutTex,
      this.curveTex,
      this.teamSignTex,
      this.filterMaskTex,
      this.dummyTex,
      this.dummyUintTex,
      ...this.filterTextures.values(),
    ]) {
      if (t) gl.deleteTexture(t);
    }
    this.filterTextures.clear();
    if (this.sceneFbo) gl.deleteFramebuffer(this.sceneFbo);
    for (const b of [
      this.cubeGeom,
      this.cubeIndex,
      this.cubeInstances,
      this.lookGeom,
      this.lineBuf,
      this.trailBuf,
      this.overlayBuf,
      this.triBuf,
    ]) {
      gl.deleteBuffer(b);
    }
    for (const v of [
      this.emptyVao,
      this.cubeVao,
      this.lookVao,
      this.lineVao,
      this.trailVao,
      this.overlayVao,
      this.triVao,
    ]) {
      gl.deleteVertexArray(v);
    }
    void this.canvas;
  }
}

/** A chunk queued for `flushDataUpload`. */
function pendingChunk(start: number, rows: number): PendingChunk {
  return {
    start,
    rows,
    cursor: start,
    packing: false,
    min: [Infinity, Infinity, Infinity],
    max: [-Infinity, -Infinity, -Infinity],
    posTex: null,
    timeTex: null,
  };
}

/** How a chunk's times and lifetimes are quantised: from its first and last row. */
function timeQuantum(ds: Dataset, start: number, rows: number) {
  const timeMin = ds.time![start];
  const span = Math.max(1e-6, ds.time![start + rows - 1] - timeMin);
  const lifeCap = Math.max(1e-6, ds.maxLifetimeGap);
  return { timeMin, span, lifeCap, invTime: 65535 / span, invLife: 65534 / lifeCap };
}

/** Milliseconds a frame spends packing and writing a dataset that is arriving; see `flushDataUpload`. */
const DATA_UPLOAD_MS = 3;
/** Milliseconds a frame spends making queued world tiles; see `flushTiles`. */
const TILE_UPLOAD_MS = 3;
/** Rows read or packed between checks of the clock: whole texture rows, few of them, as the first slices run before the code is optimised. */
const DATA_SLICE_ROWS = 2 * ROW_TEX_WIDTH;

function clampU16(v: number): number {
  return v < 0 ? 0 : v > 65535 ? 65535 : Math.round(v);
}

/**
 * Ceiling on the sign table.
 *
 * Matches the category-mask width, which is also the most groups a load keeps
 * (`MAX_GROUPS`). Beyond it the column has more distinct values than
 * anyone can assign to two sides by hand.
 */
const SIGN_TABLE_LIMIT = FILTER_MASK_WIDTH;

/**
 * Whether to read GL errors during the frame.
 *
 * Off by default because `getError` is a pipeline sync point. On via `?glcheck`,
 * which is what turns a silently rejected draw into something you can see.
 */
const GL_CHECK =
  typeof location !== 'undefined' && new URLSearchParams(location.search).has('glcheck');


const EMPTY_INDICES = new Uint32Array(0);

function mustBuffer(gl: WebGL2RenderingContext): WebGLBuffer {
  const b = gl.createBuffer();
  if (!b) throw new GlError('createBuffer failed');
  return b;
}

/** Unit cube centred on the origin, 4 verts per face so normals stay flat. */
function buildCubeGeometry(): { vertices: Float32Array; indices: Uint16Array } {
  const faces: Array<[number[], number[], number[], number[], number[]]> = [
    // [normal, v0, v1, v2, v3]
    [[0, 0, 1], [-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5]],
    [[0, 0, -1], [0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5]],
    [[1, 0, 0], [0.5, -0.5, 0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5]],
    [[-1, 0, 0], [-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5]],
    [[0, 1, 0], [-0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5]],
    [[0, -1, 0], [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5]],
  ];
  const vertices = new Float32Array(6 * 4 * 6);
  const indices = new Uint16Array(6 * 6);
  let vo = 0;
  let io = 0;
  faces.forEach((face, fi) => {
    const [n, ...corners] = face;
    for (const c of corners) {
      vertices[vo++] = c[0];
      vertices[vo++] = c[1];
      vertices[vo++] = c[2];
      vertices[vo++] = n[0];
      vertices[vo++] = n[1];
      vertices[vo++] = n[2];
    }
    const b = fi * 4;
    indices[io++] = b;
    indices[io++] = b + 1;
    indices[io++] = b + 2;
    indices[io++] = b;
    indices[io++] = b + 2;
    indices[io++] = b + 3;
  });
  return { vertices, indices };
}

/**
 * Grid on the world XZ plane plus optional axis needles, as pos(3)+rgba(4).
 * Every tenth line is brighter so scale stays readable while flying.
 */
function buildGridVertices(
  spacing: number,
  extent: number,
  showGrid: boolean,
  showAxes: boolean,
): Float32Array {
  const out: number[] = [];
  const push = (
    x: number,
    y: number,
    z: number,
    r: number,
    g: number,
    b: number,
    a: number,
  ): void => {
    out.push(x, y, z, r, g, b, a);
  };

  if (showGrid && spacing > 0) {
    const n = Math.min(2000, Math.floor(extent / spacing));
    for (let i = -n; i <= n; i++) {
      const p = i * spacing;
      const major = i % 10 === 0;
      const axis = i === 0;
      if (axis) continue; // drawn as a coloured axis below
      const c = major ? 0.34 : 0.2;
      const a = major ? 0.85 : 0.5;
      push(-extent, 0, p, c, c, c * 1.06, a);
      push(extent, 0, p, c, c, c * 1.06, a);
      push(p, 0, -extent, c, c, c * 1.06, a);
      push(p, 0, extent, c, c, c * 1.06, a);
    }
    // The two centre lines, dimmer than the coloured axes but still readable.
    push(-extent, 0, 0, 0.45, 0.3, 0.3, 0.8);
    push(extent, 0, 0, 0.45, 0.3, 0.3, 0.8);
    push(0, 0, -extent, 0.3, 0.3, 0.45, 0.8);
    push(0, 0, extent, 0.3, 0.3, 0.45, 0.8);
  }

  if (showAxes) {
    const len = extent * 0.06;
    push(0, 0, 0, 1, 0.25, 0.25, 1);
    push(len, 0, 0, 1, 0.25, 0.25, 1);
    push(0, 0, 0, 0.3, 1, 0.35, 1);
    push(0, len, 0, 0.3, 1, 0.35, 1);
    push(0, 0, 0, 0.35, 0.55, 1, 1);
    push(0, 0, len, 0.35, 0.55, 1, 1);
  }

  return new Float32Array(out);
}



















