import { GpuFigures } from './figures';
import { GpuTracks } from './tracks';
import { KEY_BUFFERS, KEYS_PER_BUFFER } from '../gpuTracks/store';
import { GpuProfiler } from './profiler';
import { ATLAS_MIP_LEVELS } from '../../data/atlas';
import { packLineStarts, type LineData } from '../../data/lines';
import { CURVE_LUT_SIZE } from '../../state/curve';
import type { Bounds, Dataset } from '../../state/types';
import { LUT_HEIGHT, LUT_WIDTH } from '../colors';
import { floatToHalf, halfToFloat } from '../half';
import { forcedHeatPrecision } from '../webgl2/glutil';
import { buildEdgeList, type Level } from '../level';
import { boxOutsideFrustum, diffWorldTiles, frustumPlanes, textureBytes } from '../worldTiles';
import type { WorldTile } from '../../world/tileSet';
import { filterColumnData, packSignTables } from '../filterTables';
import {
  CHUNK_ROWS,
  FILTER_MASK_CAPACITY,
  FILTER_MASK_WIDTH,
  GpuInitError,
  HEAT_DEPTH_LAYERS,
  MAX_FILTER_SLOTS,
  PEEL_EPSILON_F,
  MAX_PLAN_BLOCKS,
  SAMPLE_BLOCK,
  type ActiveFilter,
  type BackendKind,
  type CapturedFrame,
  type FrameParams,
  type FrameResult,
  type GpuLimits,
  type LevelDraw,
  type Renderer,
} from '../types';
import {
  COMPOSITE_WGSL,
  CUBE_WGSL,
  DECAY_WGSL,
  MERGE_WGSL,
  FLAG_GROUND_PROJECTED,
  FLAG_PERSPECTIVE,
  FLAG_SMOOTH_RAMP,
  FLAG_TEAM_COLORS,
  FLAG_CONSERVE,
  FLAG_USE_CURVE,
  FLAG_USE_LIFETIME,
  FLAG_USE_TEAM_SIGN,
  COMPOSITE_UNIFORM_BYTES,
  HEAT_UNIFORM_BYTES,
  HEAT_WGSL,
  LINE_HEAT_WGSL,
  LINE_WGSL,
  LOOK_WGSL,
  MAP_WGSL,
  MESH_WGSL,
  PEEL_UNIFORM_BYTES,
  PEEL_WGSL,
  WIRE_WGSL,
} from './shaders';
import { t } from '../../i18n';

/** Largest block index texture we size the per-frame buffer for. */
const MAX_BLOCKS = MAX_PLAN_BLOCKS;
const BLOCK_SHIFT = Math.log2(SAMPLE_BLOCK);
const SCENE_FORMAT: GPUTextureFormat = 'rgba8unorm';
const DEPTH_FORMAT: GPUTextureFormat = 'depth24plus';
/** Bytes in a scene uniform buffer: mat4 + 2 vec4. */
// mat4 + camera vec4 + cfg vec4 + tint vec4 + relief vec4 + elevation vec4 +
// slice vec4 + the distance cull's axis and bounds. Shared by the line, cube,
// look, mesh and wire shaders; the ones that do not declare the later fields
// simply never read them.
const SCENE_UNIFORM_BYTES = 64 + 16 * 8;
const MAP_UNIFORM_BYTES = 64 + 16 + 16 + 16;

interface GpuChunk {
  positions: GPUBuffer;
  /** First dataset row in this chunk. */
  start: number;
  /**
   * Line heat: where each row's segment starts and its flags, two u32 per row
   * like `positions`. Only while line heat has routes; see `setLines`.
   */
  lineStarts: GPUBuffer | null;
  times: GPUBuffer | null;
  rows: number;
  aabbMin: [number, number, number];
  aabbSize: [number, number, number];
  timeMin: number;
  timeScale: number;
  lifeScale: number;
  /**
   * Active filter columns packed end to end, one chunk's rows apiece.
   *
   * Rebuilt only when the *set* of filtered columns changes; moving a threshold
   * touches uniforms alone, which is what keeps dragging a filter free.
   */
  filterValues: GPUBuffer | null;
  filterKey: string;
  filterSlots: number;
  /** Slot holding the difference split's column, or -1 when there is none. */
  splitSlot: number;
}

/**
 * WebGPU backend.
 *
 * Chosen over the WebGL2 path when available, for two concrete reasons rather
 * than novelty. Rows live in storage buffers, so a row index is an array
 * subscript instead of a texture coordinate — which removes the 8192-wide
 * row-store gymnastics and the per-sprite texture fetches. And `float32-blendable`,
 * where the adapter offers it, gives exact 32-bit additive accumulation as a
 * fixed-function blend rather than something emulated.
 *
 * The heat buffer format is the one real constraint: WebGPU does not permit
 * blending into `r32float` without that feature, so this falls back to
 * `r16float` exactly as the WebGL2 backend falls back without `EXT_float_blend`.
 */
export class WebgpuRenderer implements Renderer {
  readonly kind: BackendKind = 'webgpu';

  private readonly device: GPUDevice;
  private readonly context: GPUCanvasContext;
  private readonly canvasFormat: GPUTextureFormat;
  /**
   * Accumulation format for the current mode: one channel, or four for team
   * colours.
   *
   * Not fixed at construction, because the four-channel target is only wanted in
   * the one mode that has something to put in the extra channels. The heat pass is
   * the hottest in the program and it is blend-bound — a full-screen splat reads
   * and writes the target once per fragment, which at 4K with real overdraw is
   * already the frame's largest single cost — so paying four times the bandwidth
   * for three channels of zeroes is not a rounding error.
   */
  private heatFormat: GPUTextureFormat;
  /** Bytes per heat texel, for the readback paths. Derived from `heatFormat`. */
  private heatTexelBytes = 4;
  /** Whether 32-bit accumulation is available; decides both format variants. */
  private readonly heatF32: boolean;
  readonly gpuName: string | null;
  readonly gpuLimits: GpuLimits;
  readonly heatPrecision: 'f16' | 'f32';

  gpuBudgetBytes = 2 * 1024 ** 3;
  gpuBytesUsed = 0;
  residentRows = 0;
  droppedRows = 0;
  /** The level's own GPU footprint: its map, or its mesh and atlas. */
  private levelOwnBytes = 0;

  /** Background geometry's GPU footprint, the world tiles included. */
  get levelBytes(): number {
    return this.levelOwnBytes + this.tileBytes;
  }

  private dataset: Dataset | null = null;
  private chunks: GpuChunk[] = [];

  private width = 1;
  private height = 1;
  private heatWidth = 1;
  private heatHeight = 1;

  private sceneTex: GPUTexture | null = null;
  private sceneView: GPUTextureView | null = null;
  private depthTex: GPUTexture | null = null;
  private depthView: GPUTextureView | null = null;
  private heatTex: GPUTexture | null = null;
  private heatView: GPUTextureView | null = null;
  /**
   * Depth for the heat pass.
   *
   * WebGPU requires every attachment in a pass to be the same size, so once the
   * throttle drops the heat buffer below canvas resolution it can no longer share
   * the scene's depth. At matching sizes it does share it, which is what lets
   * geometry occlude heat behind it; at reduced sizes this is a private,
   * never-written depth and that occlusion is given up.
   */
  private heatScratchTex: GPUTexture | null = null;
  private heatScratchView: GPUTextureView | null = null;
  /** Bumped whenever the scene depth texture is recreated, to key bind groups. */
  private depthGeneration = 0;
  /** Peeled depth layers, nearest first. See HEAT_DEPTH_LAYERS. */
  private peelTex: GPUTexture[] = [];
  private peelViews: GPUTextureView[] = [];
  /**
   * The nearest *structure* surface, kept apart from the scene's depth.
   *
   * The scene depth is the nearest surface of any kind, so on its own it cannot
   * say whether what stands in front of a datapoint is a wall — which you look
   * through on purpose — or terrain, which you never do. See renderStructureDepth.
   */
  private structDepthTex: GPUTexture | null = null;
  private structDepthView: GPUTextureView | null = null;

  // Pipelines
  /**
   * The three heat-target pipelines, one set per accumulation format.
   *
   * A render pipeline names its target's format, so switching the heat buffer
   * between one and four channels needs a second set. Cached rather than rebuilt
   * on each toggle: `layout: 'auto'` ties every bind group to the pipeline that
   * produced its layout, so discarding a pipeline invalidates the bind-group cache
   * with it, and mode switching would then cost a full rebuild each way.
   */
  private readonly heatPipelines = new Map<GPUTextureFormat, GPURenderPipeline>();
  /** Line heat's splat per format, built the first time it is drawn. */
  private readonly lineHeatPipelines = new Map<GPUTextureFormat, GPURenderPipeline>();
  /** The routes `setLines` was given, for the box their starts are quantised to. */
  private lines: LineData | null = null;
  private readonly decayPipelines = new Map<GPUTextureFormat, GPURenderPipeline>();
  private readonly mergePipelines = new Map<GPUTextureFormat, GPURenderPipeline>();
  private readonly compositePipeline: GPURenderPipeline;
  private readonly linePipeline: GPURenderPipeline;
  /** The ruler: over everything, as on WebGL2, or a level above its plane hides it. */
  private readonly overlayPipeline: GPURenderPipeline;
  /** The line shader over a triangle list: the race tab's coloured geometry. */
  private readonly triPipeline: GPURenderPipeline;
  private readonly cubePipeline: GPURenderPipeline;
  private readonly lookPipeline: GPURenderPipeline;
  private readonly mapPipeline: GPURenderPipeline;
  private readonly meshPipeline: GPURenderPipeline;
  private readonly meshWirePipeline: GPURenderPipeline;
  private readonly structPipeline: GPURenderPipeline;
  private readonly structDepthPipeline: GPURenderPipeline;
  private readonly peelPipeline: GPURenderPipeline;
  private readonly wirePipeline: GPURenderPipeline;

  // Shared resources
  private readonly uniforms: UniformRing;
  private readonly bindCache = new Map<string, GPUBindGroup>();
  private readonly blockBuffer: GPUBuffer;
  private readonly filterMaskBuffer: GPUBuffer;
  private readonly emptyStorage: GPUBuffer;
  private teamSignBuffer: GPUBuffer;
  private readonly lutTexture: GPUTexture;
  private readonly curveTexture: GPUTexture;
  /** Cached, because a fresh view per frame would defeat the bind-group cache. */
  private readonly curveView: GPUTextureView;
  private readonly curveHalf = new Uint16Array(CURVE_LUT_SIZE);
  /** Both sign tables, groups then categories; see `packSignTables`. */
  private readonly signScratch = new Float32Array(SIGN_TABLE_SIZE * 2);
  /** The filter keys the mask buffer was last written for. */
  private filterMaskKey = '';
  private readonly sampler: GPUSampler;

  /**
   * Bumped whenever the render targets are recreated, so cached bind groups
   * referencing the old texture views are not reused.
   */
  private targetGeneration = 0;
  /** Same idea for the map texture, which changes independently. */
  private mapTextureId = 0;

  // Geometry
  private readonly cubeVertexBuffer: GPUBuffer;
  private readonly cubeIndexBuffer: GPUBuffer;
  private readonly lookVertexBuffer: GPUBuffer;
  private cubeInstanceBuffer: GPUBuffer | null = null;
  private lineBuffer: GPUBuffer | null = null;
  private lineVertexCount = 0;
  private lineSignature = '';
  private trailBuffer: GPUBuffer | null = null;
  private overlayBuffer: GPUBuffer | null = null;
  private triBuffer: GPUBuffer | null = null;
  /** Instanced figures, made on first use. */
  private figures: GpuFigures | null = null;
  /** Units placed by the GPU, made on first use. */
  private tracks: GpuTracks | null = null;
  /** GPU time a pass, with ?gpuprof where the device can. */
  private profiler: GpuProfiler | null | undefined;
  private get prof(): GpuProfiler | null {
    if (this.profiler === undefined) this.profiler = GpuProfiler.wanted() && this.device.features.has('timestamp-query') ? new GpuProfiler(this.device) : null;
    return this.profiler;
  }

  /** Milliseconds of GPU time a pass, averaged (?gpuprof); empty without. */
  get gpuPassMs(): Record<string, number> {
    return this.prof?.ms ?? {};
  }

  private mapTexture: GPUTexture | null = null;
  /** The model level's geometry; null for an image level or none. */
  private levelMesh: GpuMesh | null = null;
  /**
   * The streamed world tiles' geometry, by tile id, with the tile object each
   * was uploaded from - identity is what says a tile is unchanged. See
   * `setWorldTiles`.
   */
  private tileMeshes = new Map<string, GpuMesh>();
  private readonly tileSources = new Map<string, WorldTile>();
  /** What the tiles hold on the GPU, buffers and images together. */
  private tileBytes = 0;
  /**
   * The meshes this frame draws: the level's, then every tile in view. Decided
   * once per frame in `drawScene`, so the colour pass and every depth pass after
   * it draw exactly the same geometry - a tile in the colour but not in the depth
   * would show heat through a hill that is plainly there.
   */
  private frameMeshes: GpuMesh[] = [];
  private readonly planes = new Float32Array(20);
  private tilePlaceholder: GPUBuffer | null = null;
  /** Bumped per level so a late atlas is not uploaded onto the next level. */
  private atlasToken = 0;
  private atlasPlaceholder: GPUTexture | null = null;
  private atlasSamplerCache: GPUSampler | null = null;

  // Heat probe: WebGPU readback is asynchronous, so a probe returns the most
  // recent completed value and schedules the next.
  private probeBuffer: GPUBuffer;
  private probePending = false;
  private fieldPending = false;
  private fieldBuffer: GPUBuffer | null = null;
  private probeValue: number | null = null;
  private probeFrames = 1;

  private scratch = new Float32Array(64);
  private scratchU32 = new Uint32Array(this.scratch.buffer);

  /**
   * Counters for diagnosing a blank frame.
   *
   * A WebGPU frame that produces nothing usually does so silently — no
   * exception, no validation error, correct-looking stats — so these make the
   * difference between "the pass never ran" and "the pass ran and drew nothing"
   * observable from outside.
   */
  readonly debug = {
    frames: 0,
    composites: 0,
    submits: 0,
    compositeTarget: '',
    /** When set, the composite clears to magenta and draws nothing. */
    clearProbe: false,
  };

  /**
   * WebGPU initialisation is asynchronous, so construction goes through here
   * rather than a constructor.
   */
  static async create(canvas: HTMLCanvasElement): Promise<WebgpuRenderer> {
    if (!navigator.gpu) throw new GpuInitError(t('render.backend.unavailable', { api: 'WebGPU' }));
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (!adapter) throw new GpuInitError(t('render.webgpu.noAdapter', { api: 'WebGPU' }));

    // 32-bit float accumulation needs two optional features, and both, because
    // the heat target has to be blended into *and* sampled from: `r32float` is
    // neither blendable nor filterable in core WebGPU. Without both, this falls
    // back to `r16float` — which is blendable and filterable by default — exactly
    // as the WebGL2 path falls back without EXT_float_blend.
    const wanted: GPUFeatureName[] = [];
    const want = (name: string) => {
      if (adapter.features.has(name as GPUFeatureName)) {
        wanted.push(name as GPUFeatureName);
        return true;
      }
      return false;
    };
    // `?heat=f16` forces the half-float accumulation path, which is what a device
    // without `float32-blendable` actually gets. Its arithmetic behaves
    // differently enough — 11 bits of mantissa instead of 24 — that bugs live
    // there and nowhere else, so it needs to be selectable rather than only ever
    // reached by users on weaker hardware.
    const forceF16 = forcedHeatPrecision() === 'f16';
    const blendable = !forceF16 && want('float32-blendable');
    // ?gpuprof: GPU time a pass (GpuProfiler).
    if (GpuProfiler.wanted()) want('timestamp-query');
    const filterable = want('float32-filterable');
    // Storage buffers default to a 128MiB binding limit, which is below one
    // chunk's worth on a wide dataset; ask for whatever the adapter allows.
    const limits: Record<string, number> = {};
    const requestLimit = (name: keyof GPUSupportedLimits) => {
      const v = adapter.limits[name];
      if (typeof v === 'number') limits[name] = v;
    };
    requestLimit('maxStorageBufferBindingSize');
    requestLimit('maxBufferSize');
    requestLimit('maxStorageBuffersPerShaderStage');

    const device = await adapter.requestDevice({
      requiredFeatures: wanted,
      requiredLimits: limits,
    });
    // `adapter.info` is the current spelling; older builds exposed an async
    // `requestAdapterInfo()`. Neither is guaranteed, and the name is only used
    // for display, so an absent one is fine.
    const legacy = adapter as GPUAdapter & {
      requestAdapterInfo?: () => Promise<GPUAdapterInfo>;
    };
    const info = adapter.info ?? (await legacy.requestAdapterInfo?.().catch(() => undefined));
    const name = info
      ? [info.vendor, info.architecture, info.device].filter(Boolean).join(' ') || null
      : null;
    return new WebgpuRenderer(canvas, device, name, blendable && filterable);
  }

  private constructor(
    private readonly canvas: HTMLCanvasElement,
    device: GPUDevice,
    gpuName: string | null,
    canUseF32Heat: boolean,
  ) {
    this.device = device;
    this.gpuName = gpuName;
    this.gpuLimits = {
      maxTextureSize: device.limits.maxTextureDimension2D,
      maxBufferBytes: device.limits.maxBufferSize,
    };

    const ctx = canvas.getContext('webgpu');
    if (!ctx) throw new GpuInitError(t('render.webgpu.noContext', { api: 'WebGPU' }));
    this.context = ctx;
    this.canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({
      device,
      format: this.canvasFormat,
      alphaMode: 'opaque',
    });

    // `float32-blendable` covers rgba32float as well as r32float, so the
    // four-channel path inherits the same precision the mode-independent one gets
    // and there is no case where team colours quietly drop to half floats while
    // plain heat does not.
    this.heatF32 = canUseF32Heat;
    this.heatFormat = canUseF32Heat ? 'r32float' : 'r16float';
    this.heatTexelBytes = canUseF32Heat ? 4 : 2;
    this.heatPrecision = canUseF32Heat ? 'f32' : 'f16';

    // Enough slots for every draw in a frame: a handful of scene passes plus one
    // per resident chunk in the heat pass.
    this.uniforms = new UniformRing(device, 512, 'uniform ring', HEAT_UNIFORM_BYTES);

    // Validation errors here produce a plausible-looking wrong picture rather
    // than an exception, so they are surfaced rather than left to be discovered.
    device.addEventListener('uncapturederror', (ev) => {
      const e = ev as GPUUncapturedErrorEvent;
      // eslint-disable-next-line no-console
      console.error(`WebGPU: ${e.error.message}`);
    });

    // Nothing else says so: a lost device goes on answering every call and draws nothing,
    // and the page keeps its last picture at a perfect frame rate.
    void device.lost.then((info) => {
      // eslint-disable-next-line no-console
      console.error(`WebGPU device lost (${info.reason}): ${info.message}`);
    });

    this.blockBuffer = device.createBuffer({
      label: 'block starts',
      size: MAX_BLOCKS * 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    this.filterMaskBuffer = device.createBuffer({
      label: 'filter masks',
      // One bit per id per slot, `FILTER_MASK_CAPACITY` ids a slot — enough for
      // the person filter's tens of thousands — in whole u32 words.
      size: (MAX_FILTER_SLOTS * FILTER_MASK_CAPACITY) / 8,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    this.emptyStorage = device.createBuffer({
      label: 'empty storage',
      size: 16,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    this.teamSignBuffer = device.createBuffer({
      label: 'sign tables',
      // Two tables end to end: the groups, then the categories of a difference
      // split by column. Both at once, because a split by column still has to
      // leave hidden groups hidden. One binding rather than two because the
      // vertex stage is one storage buffer short of its limit as it is.
      size: SIGN_TABLE_SIZE * 2 * 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(
      this.teamSignBuffer,
      0,
      packSignTables(null, null, SIGN_TABLE_SIZE) as unknown as BufferSource,
    );

    this.lutTexture = device.createTexture({
      label: 'colour ramp',
      size: [LUT_WIDTH, LUT_HEIGHT],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });
    this.curveTexture = device.createTexture({
      label: 'sprite ramp curve',
      size: [CURVE_LUT_SIZE, 1],
      format: 'r16float',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });
    this.curveView = this.curveTexture.createView();
    this.sampler = device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
      mipmapFilter: 'linear',
      addressModeU: 'clamp-to-edge',
      addressModeV: 'clamp-to-edge',
    });

    this.probeBuffer = device.createBuffer({
      label: 'heat probe',
      size: 256,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });

    const cube = buildCubeGeometry();
    this.cubeVertexBuffer = this.makeBuffer(cube.vertices, GPUBufferUsage.VERTEX, 'cube verts');
    this.cubeIndexBuffer = this.makeBuffer(cube.indices, GPUBufferUsage.INDEX, 'cube indices');
    this.lookVertexBuffer = this.makeBuffer(
      new Float32Array([0, 1]),
      GPUBufferUsage.VERTEX,
      'look verts',
    );

    // ---- pipelines
    // The single-channel set eagerly, since every mode but one uses it; the
    // four-channel set is built the first time team colours are asked for.
    this.heatPipelines.set(this.heatFormat, this.buildHeatPipeline(this.heatFormat));
    this.decayPipelines.set(this.heatFormat, this.buildDecayPipeline(this.heatFormat));
    this.mergePipelines.set(this.heatFormat, this.buildMergePipeline(this.heatFormat));
    this.compositePipeline = this.buildCompositePipeline();
    this.linePipeline = this.buildLinePipeline();
    this.overlayPipeline = this.buildLinePipeline('line-list', 'always');
    this.triPipeline = this.buildLinePipeline('triangle-list');
    this.cubePipeline = this.buildCubePipeline();
    this.lookPipeline = this.buildLookPipeline();
    this.mapPipeline = this.buildMapPipeline();
    this.meshPipeline = this.buildMeshPipeline('triangle-list', true);
    this.meshWirePipeline = this.buildMeshPipeline('line-list', true);
    this.structPipeline = this.buildMeshPipeline('triangle-list', false);
    // Depth only. See `sealStructureDepth` on the WebGL2 renderer for why the
    // structures have to reach the depth texture even though they must not
    // reach the depth *test* of anything drawn in colour.
    this.structDepthPipeline = this.buildMeshPipeline('triangle-list', true, false);
    this.peelPipeline = this.buildPeelPipeline();
    this.wirePipeline = this.buildWirePipeline();
  }

  private makeBuffer(data: ArrayBufferView, usage: number, label: string): GPUBuffer {
    const buf = this.device.createBuffer({
      label,
      size: Math.max(4, align4(data.byteLength)),
      usage: usage | GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(buf, 0, data as unknown as BufferSource);
    return buf;
  }

  // -------------------------------------------------------------- pipelines

  /**
   * The heat, decay and merge pipelines for one accumulation format.
   *
   * Built on demand and kept, so the first frame after switching into or out of
   * team colours pays a shader compile and no frame after it does.
   */
  private lineHeatPipelineFor(format: GPUTextureFormat): GPURenderPipeline {
    let p = this.lineHeatPipelines.get(format);
    if (!p) {
      p = this.buildHeatPipeline(format, true);
      this.lineHeatPipelines.set(format, p);
    }
    return p;
  }

  private heatPipelineFor(format: GPUTextureFormat): GPURenderPipeline {
    let p = this.heatPipelines.get(format);
    if (!p) {
      p = this.buildHeatPipeline(format);
      this.heatPipelines.set(format, p);
    }
    return p;
  }

  private decayPipelineFor(format: GPUTextureFormat): GPURenderPipeline {
    let p = this.decayPipelines.get(format);
    if (!p) {
      p = this.buildDecayPipeline(format);
      this.decayPipelines.set(format, p);
    }
    return p;
  }

  private mergePipelineFor(format: GPUTextureFormat): GPURenderPipeline {
    let p = this.mergePipelines.get(format);
    if (!p) {
      p = this.buildMergePipeline(format);
      this.mergePipelines.set(format, p);
    }
    return p;
  }

  private buildHeatPipeline(format: GPUTextureFormat, lines = false): GPURenderPipeline {
    const module = this.device.createShaderModule({
      label: lines ? 'line heat' : 'heat',
      code: lines ? LINE_HEAT_WGSL : HEAT_WGSL,
    });
    return this.device.createRenderPipeline({
      label: `${lines ? 'line heat' : 'heat'} ${format}`,
      layout: 'auto',
      vertex: { module, entryPoint: 'vsHeat' },
      fragment: {
        module,
        entryPoint: 'fsHeat',
        targets: [
          {
            format,
            // Additive, so overlapping sprites sum exactly as overlapping
            // translucent sprites would — but in a float target, so it never
            // clips at 1.0 and can go negative for the difference mode.
            blend: {
              color: { srcFactor: 'one', dstFactor: 'one', operation: 'add' },
              alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' },
            },
          },
        ],
      },
      primitive: { topology: 'triangle-list' },
      // No depth attachment. Occlusion used to be the hardware depth test
      // against the scene's depth buffer, which meant it silently did nothing
      // whenever the heat target was throttled below canvas size (it then got its
      // own empty depth) or the frame was a partial one accumulating into the
      // scratch target (which had no depth at all) — so most frames had none, and
      // the rest culled outright instead of dimming.
      //
      // The splat shader reads the depth as a texture instead, which works at any
      // resolution and can attenuate. Sampling a texture that is also an
      // attachment is invalid, so the attachment has to go.
    });
  }

  private buildDecayPipeline(format: GPUTextureFormat): GPURenderPipeline {
    const module = this.device.createShaderModule({ label: 'decay', code: DECAY_WGSL });
    return this.device.createRenderPipeline({
      label: `decay ${format}`,
      layout: 'auto',
      vertex: { module, entryPoint: 'vsFullscreen' },
      fragment: {
        module,
        entryPoint: 'fsDecay',
        targets: [
          {
            format,
            // result = 0*src + dst*src, i.e. dst *= src.
            blend: {
              color: { srcFactor: 'zero', dstFactor: 'src', operation: 'add' },
              alpha: { srcFactor: 'zero', dstFactor: 'src', operation: 'add' },
            },
          },
        ],
      },
      primitive: { topology: 'triangle-list' },
    });
  }

  private buildMergePipeline(format: GPUTextureFormat): GPURenderPipeline {
    const module = this.device.createShaderModule({ label: 'merge', code: MERGE_WGSL });
    return this.device.createRenderPipeline({
      label: `merge ${format}`,
      layout: 'auto',
      vertex: { module, entryPoint: 'vsFullscreen' },
      fragment: {
        module,
        entryPoint: 'fsMerge',
        targets: [
          {
            format,
            // Plain addition: the shader has already scaled the source.
            blend: {
              color: { srcFactor: 'one', dstFactor: 'one', operation: 'add' },
              alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' },
            },
          },
        ],
      },
      primitive: { topology: 'triangle-list' },
    });
  }

  private buildCompositePipeline(): GPURenderPipeline {
    const module = this.device.createShaderModule({ label: 'composite', code: COMPOSITE_WGSL });
    return this.device.createRenderPipeline({
      label: 'composite',
      layout: 'auto',
      vertex: { module, entryPoint: 'vsFullscreen' },
      fragment: { module, entryPoint: 'fsComposite', targets: [{ format: this.canvasFormat }] },
      primitive: { topology: 'triangle-list' },
    });
  }

  private buildLinePipeline(
    topology: GPUPrimitiveTopology = 'line-list',
    depthCompare: GPUCompareFunction = 'less-equal',
  ): GPURenderPipeline {
    const module = this.device.createShaderModule({ label: 'line', code: LINE_WGSL });
    const tris = topology === 'triangle-list';
    return this.device.createRenderPipeline({
      label: tris ? 'tris' : 'line',
      layout: 'auto',
      vertex: {
        module,
        entryPoint: 'vsLine',
        buffers: [
          {
            arrayStride: 28,
            attributes: [
              { shaderLocation: 0, offset: 0, format: 'float32x3' },
              { shaderLocation: 1, offset: 12, format: 'float32x4' },
            ],
          },
        ],
      },
      fragment: {
        module,
        entryPoint: 'fsLine',
        targets: [{ format: SCENE_FORMAT, blend: alphaBlend() }],
      },
      primitive: { topology },
      depthStencil: { format: DEPTH_FORMAT, depthWriteEnabled: tris, depthCompare },
    });
  }

  private buildCubePipeline(): GPURenderPipeline {
    const module = this.device.createShaderModule({ label: 'cube', code: CUBE_WGSL });
    return this.device.createRenderPipeline({
      label: 'cube',
      layout: 'auto',
      vertex: {
        module,
        entryPoint: 'vsCube',
        buffers: [
          {
            arrayStride: 24,
            attributes: [
              { shaderLocation: 0, offset: 0, format: 'float32x3' },
              { shaderLocation: 1, offset: 12, format: 'float32x3' },
            ],
          },
          {
            arrayStride: 32,
            stepMode: 'instance',
            attributes: [
              { shaderLocation: 2, offset: 0, format: 'float32x3' },
              { shaderLocation: 3, offset: 12, format: 'float32x3' },
              { shaderLocation: 4, offset: 24, format: 'float32x2' },
            ],
          },
        ],
      },
      fragment: { module, entryPoint: 'fsCube', targets: [{ format: SCENE_FORMAT }] },
      primitive: { topology: 'triangle-list' },
      depthStencil: { format: DEPTH_FORMAT, depthWriteEnabled: true, depthCompare: 'less-equal' },
    });
  }

  private buildLookPipeline(): GPURenderPipeline {
    const module = this.device.createShaderModule({ label: 'look', code: LOOK_WGSL });
    return this.device.createRenderPipeline({
      label: 'look',
      layout: 'auto',
      vertex: {
        module,
        entryPoint: 'vsLook',
        buffers: [
          {
            arrayStride: 4,
            attributes: [{ shaderLocation: 0, offset: 0, format: 'float32' }],
          },
          {
            arrayStride: 32,
            stepMode: 'instance',
            attributes: [
              { shaderLocation: 1, offset: 0, format: 'float32x3' },
              { shaderLocation: 2, offset: 12, format: 'float32x3' },
              { shaderLocation: 3, offset: 24, format: 'float32x2' },
            ],
          },
        ],
      },
      fragment: {
        module,
        entryPoint: 'fsLook',
        targets: [{ format: SCENE_FORMAT, blend: alphaBlend() }],
      },
      primitive: { topology: 'line-list' },
      depthStencil: { format: DEPTH_FORMAT, depthWriteEnabled: false, depthCompare: 'less-equal' },
    });
  }

  private buildMapPipeline(): GPURenderPipeline {
    const module = this.device.createShaderModule({ label: 'map', code: MAP_WGSL });
    return this.device.createRenderPipeline({
      label: 'map',
      layout: 'auto',
      vertex: { module, entryPoint: 'vsMap' },
      fragment: {
        module,
        entryPoint: 'fsMap',
        targets: [{ format: SCENE_FORMAT, blend: alphaBlend() }],
      },
      primitive: { topology: 'triangle-list' },
      depthStencil: { format: DEPTH_FORMAT, depthWriteEnabled: true, depthCompare: 'less-equal' },
    });
  }

  /**
   * @param topology `line-list` for a wireframe pass.
   * @param depthWrite false for the translucent structure pass: writing depth
   *   there would make a building's front faces hide its own interior, and the
   *   heat inside it, which is what the transparency exists to show.
   */
  private buildMeshPipeline(
    topology: GPUPrimitiveTopology,
    depthWrite: boolean,
    colourWrite = true,
  ): GPURenderPipeline {
    const module = this.device.createShaderModule({ label: 'mesh', code: MESH_WGSL });
    return this.device.createRenderPipeline({
      label: `mesh ${topology} ${depthWrite ? 'depth' : 'nodepth'}${colourWrite ? '' : ' depthonly'}`,
      layout: 'auto',
      vertex: {
        module,
        entryPoint: 'vsMesh',
        buffers: [
          {
            arrayStride: 24,
            attributes: [
              { shaderLocation: 0, offset: 0, format: 'float32x3' },
              { shaderLocation: 1, offset: 12, format: 'float32x3' },
            ],
          },
          {
            arrayStride: 12,
            attributes: [{ shaderLocation: 2, offset: 0, format: 'float32x3' }],
          },
          {
            arrayStride: 8,
            attributes: [{ shaderLocation: 3, offset: 0, format: 'float32x2' }],
          },
          {
            arrayStride: 4,
            attributes: [{ shaderLocation: 4, offset: 0, format: 'uint32' }],
          },
        ],
      },
      fragment: {
        module,
        entryPoint: 'fsMesh',
        targets: [
          {
            format: SCENE_FORMAT,
            blend: alphaBlend(),
            // A zero write mask keeps the attachment bound and the fragment
            // shader running — the slice's `discard` still has to be evaluated —
            // while touching only depth.
            writeMask: colourWrite ? GPUColorWrite.ALL : 0,
          },
        ],
      },
      primitive: { topology },
      depthStencil: {
        format: DEPTH_FORMAT,
        depthWriteEnabled: depthWrite,
        depthCompare: 'less-equal',
      },
    });
  }

  /**
   * Depth-only pipeline for one peel layer.
   *
   * No colour targets at all: `fragment.targets` is empty, which WebGPU allows
   * for a pipeline whose pass has only a depth attachment. The fragment stage
   * still has to exist, because the discard that rejects the already-recorded
   * surface is the entire mechanism.
   */
  private buildPeelPipeline(): GPURenderPipeline {
    const module = this.device.createShaderModule({ label: 'peel', code: PEEL_WGSL });
    return this.device.createRenderPipeline({
      label: 'depth peel',
      layout: 'auto',
      vertex: {
        module,
        entryPoint: 'vsPeel',
        buffers: [
          {
            // The level's interleaved position+normal; only the position is read.
            arrayStride: 24,
            attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }],
          },
          {
            // The UVs and their tiles, for the cut-out test. See PEEL_WGSL.
            arrayStride: 8,
            attributes: [{ shaderLocation: 1, offset: 0, format: 'float32x2' }],
          },
          {
            arrayStride: 4,
            attributes: [{ shaderLocation: 2, offset: 0, format: 'uint32' }],
          },
        ],
      },
      fragment: { module, entryPoint: 'fsPeel', targets: [] },
      primitive: { topology: 'triangle-list' },
      depthStencil: {
        format: DEPTH_FORMAT,
        depthWriteEnabled: true,
        depthCompare: 'less-equal',
      },
    });
  }

  private buildWirePipeline(): GPURenderPipeline {
    const module = this.device.createShaderModule({ label: 'wire', code: WIRE_WGSL });
    return this.device.createRenderPipeline({
      label: 'structure wire',
      layout: 'auto',
      vertex: {
        module,
        entryPoint: 'vsWire',
        buffers: [
          {
            arrayStride: 24,
            attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }],
          },
        ],
      },
      fragment: {
        module,
        entryPoint: 'fsWire',
        targets: [{ format: SCENE_FORMAT, blend: alphaBlend() }],
      },
      primitive: { topology: 'line-list' },
      depthStencil: { format: DEPTH_FORMAT, depthWriteEnabled: false, depthCompare: 'less-equal' },
    });
  }

  // ----------------------------------------------------------------- dataset

  setDataset(dataset: Dataset | null): void {
    // Cached bind groups reference these buffers; destroying a buffer that a
    // cached group still points at makes every later command buffer invalid, and
    // the symptom is a black canvas rather than an error at the call site.
    this.bindCache.clear();
    for (const c of this.chunks) {
      c.positions.destroy();
      c.times?.destroy();
      c.filterValues?.destroy();
      c.lineStarts?.destroy();
    }
    this.chunks = [];
    this.lines = null;
    this.filterMaskKey = '';
    this.gpuBytesUsed = 0;
    this.residentRows = 0;
    this.droppedRows = 0;
    this.dataset = dataset;
    if (!dataset || dataset.count === 0) return;

    const hasTime = !!(dataset.time && dataset.lifetime);
    const bytesPerRow = 8 + (hasTime ? 4 : 0);
    const chunkCount = Math.ceil(dataset.count / CHUNK_ROWS);
    const maxBinding = this.device.limits.maxStorageBufferBindingSize;

    for (let ci = 0; ci < chunkCount; ci++) {
      const start = ci * CHUNK_ROWS;
      let rows = Math.min(CHUNK_ROWS, dataset.count - start);
      // A chunk must fit both the GPU budget and one storage binding.
      const bindingCap = Math.floor(maxBinding / 8);
      rows = Math.min(rows, bindingCap);
      const remaining = this.gpuBudgetBytes - this.gpuBytesUsed;
      const affordable = Math.floor(remaining / bytesPerRow);
      if (affordable < 1024) {
        this.droppedRows = dataset.count - start;
        break;
      }
      if (affordable < rows) rows = affordable;

      this.chunks.push(this.uploadChunk(dataset, start, rows, hasTime));
      this.gpuBytesUsed += rows * bytesPerRow;
      this.residentRows += rows;
      if (start + rows < dataset.count && rows < Math.min(CHUNK_ROWS, dataset.count - start)) {
        this.droppedRows = dataset.count - start - rows;
        break;
      }
    }
  }

  setLines(lines: LineData | null): void {
    // Cached bind groups hold the buffers about to be destroyed.
    this.bindCache.clear();
    for (const c of this.chunks) {
      if (c.lineStarts) {
        c.lineStarts.destroy();
        this.gpuBytesUsed -= c.rows * 12;
      }
      c.lineStarts = null;
    }
    const dataset = this.dataset;
    if (!lines || !dataset || lines.flags.length !== dataset.count) {
      this.lines = null;
      return;
    }
    this.lines = lines;
    for (const c of this.chunks) {
      // Three u32 per row: x | y<<16, z | flags<<16, the segment's seconds.
      const packed = packLineStarts(dataset, lines, c.start, c.rows, 3);
      c.lineStarts = this.makeBuffer(packed, GPUBufferUsage.STORAGE, `chunk ${c.start} line starts`);
      this.gpuBytesUsed += c.rows * 12;
    }
  }

  private uploadChunk(
    dataset: Dataset,
    start: number,
    rows: number,
    hasTime: boolean,
  ): GpuChunk {
    const { px, py, pz, teamId } = dataset;
    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;
    for (let i = start; i < start + rows; i++) {
      if (px[i] < minX) minX = px[i];
      if (px[i] > maxX) maxX = px[i];
      if (py[i] < minY) minY = py[i];
      if (py[i] > maxY) maxY = py[i];
      if (pz[i] < minZ) minZ = pz[i];
      if (pz[i] > maxZ) maxZ = pz[i];
    }
    const sizeX = Math.max(1e-6, maxX - minX);
    const sizeY = Math.max(1e-6, maxY - minY);
    const sizeZ = Math.max(1e-6, maxZ - minZ);

    // Two u32 per row: x | y<<16, then z | team<<16.
    const packed = new Uint32Array(rows * 2);
    const sx = 65535 / sizeX;
    const sy = 65535 / sizeY;
    const sz = 65535 / sizeZ;
    for (let i = 0; i < rows; i++) {
      const r = start + i;
      const qx = clampU16((px[r] - minX) * sx);
      const qy = clampU16((py[r] - minY) * sy);
      const qz = clampU16((pz[r] - minZ) * sz);
      packed[i * 2] = qx | (qy << 16);
      packed[i * 2 + 1] = qz | ((teamId ? teamId[r] : 0) << 16);
    }
    const positions = this.makeBuffer(packed, GPUBufferUsage.STORAGE, `chunk ${start} pos`);

    let times: GPUBuffer | null = null;
    let timeMin = 0;
    let timeScale = 1;
    let lifeScale = 1;
    if (hasTime && dataset.time && dataset.lifetime) {
      timeMin = dataset.time[start];
      const span = Math.max(1e-6, dataset.time[start + rows - 1] - timeMin);
      timeScale = span / 65535;
      const lifeCap = Math.max(1e-6, dataset.maxLifetimeGap);
      lifeScale = lifeCap / 65534;
      const invTime = 65535 / span;
      const invLife = 65534 / lifeCap;
      const tl = new Uint32Array(rows);
      for (let i = 0; i < rows; i++) {
        const r = start + i;
        const t = clampU16((dataset.time[r] - timeMin) * invTime);
        const life = dataset.lifetime[r];
        const l = life < 0 ? 65535 : Math.min(65534, clampU16(life * invLife));
        tl[i] = t | (l << 16);
      }
      times = this.makeBuffer(tl, GPUBufferUsage.STORAGE, `chunk ${start} time`);
    }

    return {
      positions,
      start,
      lineStarts: null,
      times,
      rows,
      aabbMin: [minX, minY, minZ],
      aabbSize: [sizeX, sizeY, sizeZ],
      timeMin,
      timeScale,
      lifeScale,
      filterValues: null,
      filterKey: '',
      filterSlots: 0,
      splitSlot: -1,
    };
  }

  /**
   * Pack the active filter columns for one chunk into a single storage buffer.
   *
   * Returns the number of slots that actually resolved to a real column; the
   * caller switches off any slot beyond that rather than letting it read
   * whatever happens to be at that offset.
   */
  /**
   * Pack the per-row values this chunk needs into one storage buffer.
   *
   * One buffer rather than one per column because the vertex stage is limited to
   * eight storage bindings and this pass already uses six. The difference split's
   * column rides along in the slot after the filters, and its index is reported
   * back rather than fixed, because a filter naming a column the dataset does not
   * have resolves to nothing and would otherwise shift the split's slot.
   */
  private ensureFilterValues(
    chunkIndex: number,
    filters: ActiveFilter[],
    splitColumn: string | null,
  ): { slots: number; splitSlot: number } {
    const chunk = this.chunks[chunkIndex];
    const ds = this.dataset;
    if (!chunk || !ds) return { slots: 0, splitSlot: -1 };

    const columns = filters.map((f) => f.column);
    const key = `${columns.join('|')}#${splitColumn ?? ''}`;
    if (chunk.filterKey === key) {
      return { slots: chunk.filterSlots, splitSlot: chunk.splitSlot };
    }

    chunk.filterKey = key;
    chunk.filterSlots = 0;
    chunk.splitSlot = -1;

    // A retained column, or the person ids for the person filter's slot.
    const resolved = columns
      .map((name) => filterColumnData(ds, name))
      .filter((a): a is NonNullable<typeof a> => !!a);
    const filterCount = resolved.length;
    const splitData = splitColumn ? filterColumnData(ds, splitColumn) : null;
    // Appended even when it duplicates a filtered column: one extra column is
    // cheaper than making the slot mapping depend on which columns coincide.
    if (splitData) resolved.push(splitData);
    // The same size as the old values: written over them, with no new buffer or bind group.
    const old = chunk.filterValues;
    const bytes = resolved.length * chunk.rows * 4;
    const reuse = old && old.size === Math.max(4, align4(bytes));
    if (old && !reuse) {
      // Same hazard as setDataset: a cached bind group still points at this.
      this.bindCache.clear();
      this.gpuBytesUsed -= old.size;
      old.destroy();
      chunk.filterValues = null;
    }
    if (resolved.length === 0) return { slots: 0, splitSlot: -1 };

    const cost = reuse ? 0 : bytes;
    if (this.gpuBytesUsed + cost > this.gpuBudgetBytes) {
      // Not remembered as this chunk's answer: the budget may have room next
      // frame (a level freed, another chunk's values shrunk), and a cached
      // failure kept the split's column off this chunk for good.
      chunk.filterKey = '';
      return { slots: 0, splitSlot: -1 };
    }

    const start = chunkIndex * CHUNK_ROWS;
    const packed = new Float32Array(resolved.length * chunk.rows);
    resolved.forEach((data, slot) => {
      const base = slot * chunk.rows;
      for (let i = 0; i < chunk.rows; i++) packed[base + i] = data[start + i];
    });
    if (reuse && old) this.device.queue.writeBuffer(old, 0, packed as unknown as BufferSource);
    else chunk.filterValues = this.makeBuffer(packed, GPUBufferUsage.STORAGE, 'filter values');
    this.gpuBytesUsed += cost;
    chunk.filterSlots = filterCount;
    chunk.splitSlot = splitData ? filterCount : -1;
    return { slots: filterCount, splitSlot: chunk.splitSlot };
  }

  setLevel(level: Level | null): void {
    this.mapTexture?.destroy();
    this.mapTexture = null;
    // Invalidate any cached bind group that held a view of the old map.
    this.mapTextureId++;
    this.atlasToken++;
    if (this.levelMesh) this.freeMesh(this.levelMesh);
    this.levelMesh = null;
    this.levelOwnBytes = 0;
    if (!level) return;

    if (level.kind === 'image') {
      const tex = this.device.createTexture({
        label: 'map',
        size: [level.width, level.height],
        format: 'rgba8unorm',
        usage:
          GPUTextureUsage.TEXTURE_BINDING |
          GPUTextureUsage.COPY_DST |
          GPUTextureUsage.RENDER_ATTACHMENT,
      });
      this.device.queue.copyExternalImageToTexture(
        { source: level.bitmap },
        { texture: tex },
        [level.width, level.height],
      );
      this.mapTexture = tex;
      this.levelOwnBytes = level.width * level.height * 4;
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
      'level',
    );
    this.levelMesh = mesh;
    this.levelOwnBytes = mesh.bytes;
    if (level.atlas && level.uvs) this.loadAtlas(level.atlas, mesh);
  }

  /**
   * Upload one mesh: the level's, or a world tile's.
   *
   * One vertex buffer, up to four index buffers: ground triangles, structure
   * triangles, structure edges, water. Sharing vertices is what keeps the memory
   * the decimation saved.
   */
  private uploadMesh(src: MeshSource, bounds: Bounds | null, tile: boolean, label: string): GpuMesh {
    const vertexBuffer = this.makeBuffer(src.vertices, GPUBufferUsage.VERTEX, `${label} verts`);
    // Interleaved position+normal is 24 bytes; colour rides in its own buffer.
    // A mesh without colour still gets one, filled with white, so the location
    // is never left unbound — which is a validation error here rather than the
    // driver-dependent garbage it would be in WebGL. Always allocated, so the
    // pipeline's vertex layout never changes and there is one mesh shader
    // rather than two.
    const vertexCount = src.vertices.length / 6;
    const colours =
      src.colours && src.colours.length >= vertexCount * 3
        ? src.colours
        : new Float32Array(vertexCount * 3).fill(1);
    const colourBuffer = this.makeBuffer(colours, GPUBufferUsage.VERTEX, `${label} colours`);
    // UVs always backed as well: -1 everywhere on an untextured mesh, which
    // the shader reads as "no texture here".
    const uvs =
      src.uvs && src.uvs.length >= vertexCount * 2
        ? src.uvs
        : new Float32Array(vertexCount * 2).fill(-1);
    const uvBuffer = this.makeBuffer(uvs, GPUBufferUsage.VERTEX, `${label} uvs`);
    // Per-vertex tile numbers as uint32 - a vertex attribute here is at least
    // four bytes wide - and the tiles' rectangles as a storage buffer the vertex
    // shader reads by number (see ATLAS_WGSL). A mesh with no repeating texture
    // gets a zeroed tile buffer - WebGPU zeroes a new buffer, so it costs no
    // upload - and the one-entry placeholder table.
    let tileBuffer: GPUBuffer;
    let tileTable: GPUBuffer | null = null;
    if (src.uvTiles && src.uvTiles.length >= vertexCount && src.tileRects) {
      tileBuffer = this.makeBuffer(
        Uint32Array.from(src.uvTiles.subarray(0, vertexCount)),
        GPUBufferUsage.VERTEX,
        `${label} tiles`,
      );
      tileTable = this.makeBuffer(src.tileRects, GPUBufferUsage.STORAGE, `${label} tile table`);
    } else {
      tileBuffer = this.device.createBuffer({
        label: `${label} tiles (none)`,
        size: Math.max(4, vertexCount * 4),
        usage: GPUBufferUsage.VERTEX,
      });
    }
    const index = (data: Uint32Array, what: string) =>
      data.length > 0 ? this.makeBuffer(data, GPUBufferUsage.INDEX, `${label} ${what}`) : null;
    return {
      vertexBuffer,
      colourBuffer,
      uvBuffer,
      tileBuffer,
      tileTable,
      texture: null,
      textureLevels: null,
      groundBuffer: index(src.indices, 'ground indices'),
      structBuffer: index(src.structureIndices, 'structure indices'),
      wireBuffer: index(src.structureEdges, 'structure edges'),
      waterBuffer: index(src.waterIndices, 'water indices'),
      groundCount: src.indices.length,
      structCount: src.structureIndices.length,
      wireCount: src.structureEdges.length,
      waterCount: src.waterIndices.length,
      groundWireBuffer: null,
      groundWireCount: 0,
      groundIndices: src.indices,
      bytes:
        src.vertices.byteLength +
        colours.byteLength +
        uvs.byteLength +
        tileBuffer.size +
        (tileTable ? tileTable.size : 0) +
        src.indices.byteLength +
        src.structureIndices.byteLength +
        src.structureEdges.byteLength +
        src.waterIndices.byteLength,
      bounds,
      tile,
      atlasGroups: new Map(),
      freed: false,
    };
  }

  private freeMesh(mesh: GpuMesh): void {
    for (const b of [
      mesh.vertexBuffer,
      mesh.colourBuffer,
      mesh.uvBuffer,
      mesh.tileBuffer,
      mesh.tileTable,
      mesh.groundBuffer,
      mesh.structBuffer,
      mesh.wireBuffer,
      mesh.waterBuffer,
      mesh.groundWireBuffer,
    ]) {
      b?.destroy();
    }
    mesh.texture?.destroy();
    mesh.texture = null;
    mesh.textureLevels = null;
    mesh.atlasGroups.clear();
    mesh.freed = true;
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
    for (const tile of added) {
      const mesh = this.uploadMesh(tile, tile.bounds, true, `tile ${tile.id}`);
      this.tileMeshes.set(tile.id, mesh);
      this.tileSources.set(tile.id, tile);
      this.tileBytes += mesh.bytes;
      if (tile.image && tile.uvs) this.uploadTileImage(tile.image, mesh, tile.id);
    }
    if (this.tileMeshes.size === 0) this.tileBytes = 0;
  }

  /**
   * A tile's own imagery as a texture: its full size at once, its smaller mip
   * levels once the browser has scaled them.
   *
   * WebGPU has no generateMipmap, and the scaled levels come from
   * `createImageBitmap`, which is asynchronous - so the tile is drawn textured
   * from the first frame, through a view of the top level only, and the view
   * widens to the whole chain when the rest is filled in. One texture and one
   * full-size copy per tile: a second, mipmapped texture swapped in later
   * doubled the copies and allocations of a streaming burst, which is when
   * frames are already at their tightest. The bitmap belongs to the tile set
   * and is left open: the same tile may be uploaded again by a recreated
   * renderer.
   */
  private uploadTileImage(image: ImageBitmap, mesh: GpuMesh, id: string): void {
    const limit = this.device.limits.maxTextureDimension2D;
    // A closed bitmap reports 0 x 0, and copying it would fail validation; the
    // tile is then drawn untextured. One past the device's limit likewise.
    if (image.width < 1 || image.height < 1 || image.width > limit || image.height > limit) return;
    const mips = Math.floor(Math.log2(Math.max(image.width, image.height))) + 1;
    const texture = this.device.createTexture({
      label: `tile ${id} image`,
      size: [image.width, image.height],
      format: 'rgba8unorm',
      mipLevelCount: mips,
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.device.queue.copyExternalImageToTexture({ source: image }, { texture }, [image.width, image.height]);
    mesh.texture = texture;
    // Until the lower levels hold the picture, sampling them would read the
    // zeroes a new texture starts with: a tile seen from afar would turn black.
    mesh.textureLevels = 1;
    mesh.atlasGroups.clear();
    const bytes = textureBytes(image.width, image.height, mips > 1);
    mesh.bytes += bytes;
    this.tileBytes += bytes;
    if (mips < 2) return;

    void (async () => {
      const levels: ImageBitmap[] = [];
      let width = image.width;
      let height = image.height;
      try {
        for (let mip = 1; mip < mips; mip++) {
          width = Math.max(1, width >> 1);
          height = Math.max(1, height >> 1);
          levels.push(
            await createImageBitmap(image, { resizeWidth: width, resizeHeight: height, resizeQuality: 'high' }),
          );
          if (mesh.freed) return;
        }
        levels.forEach((level, i) => {
          this.device.queue.copyExternalImageToTexture(
            { source: level },
            { texture, mipLevel: i + 1 },
            [level.width, level.height],
          );
        });
        // The copies are queued ahead of any frame that uses the wider view,
        // so no draw ever samples a level before it is filled.
        mesh.textureLevels = null;
        mesh.atlasGroups.clear();
      } catch {
        // The top level stays: a tile without mips is still the right picture.
      } finally {
        for (const level of levels) level.close();
      }
    })();
  }

  /**
   * Decode the atlas and upload it with a full mip chain, when it is ready.
   *
   * WebGPU has no generateMipmap, and a blit pipeline for one texture is more
   * machinery than the problem needs: the browser's own image scaler builds each
   * level from the one above, and each is copied in as it comes. Asynchronous,
   * so the level appears at once and gains its texture a moment later.
   *
   * rgba8unorm rather than the sRGB format, for the same reason as in WebGL2:
   * the level's other colours reach the frame as they are, and decoding this
   * one to linear would draw it darker than its file.
   */
  private loadAtlas(atlas: Blob, mesh: GpuMesh): void {
    const token = this.atlasToken;
    const stale = () => token !== this.atlasToken || mesh.freed;
    void (async () => {
      let level = await createImageBitmap(atlas, { imageOrientation: 'none' });
      const limit = this.device.limits.maxTextureDimension2D;
      if (level.width > limit || level.height > limit) {
        // A device below the default limit. Shrink rather than fail.
        const scale = limit / Math.max(level.width, level.height);
        const smaller = await createImageBitmap(level, {
          resizeWidth: Math.floor(level.width * scale),
          resizeHeight: Math.floor(level.height * scale),
          resizeQuality: 'high',
        });
        level.close();
        level = smaller;
      }
      if (stale()) {
        level.close();
        return;
      }
      // Only the levels the cell gutters protect; see ATLAS_MIP_LEVELS.
      const mips = Math.min(
        ATLAS_MIP_LEVELS,
        Math.floor(Math.log2(Math.max(level.width, level.height))) + 1,
      );
      const texture = this.device.createTexture({
        label: 'level atlas',
        size: [level.width, level.height],
        format: 'rgba8unorm',
        mipLevelCount: mips,
        usage:
          GPUTextureUsage.TEXTURE_BINDING |
          GPUTextureUsage.COPY_DST |
          GPUTextureUsage.RENDER_ATTACHMENT,
      });
      let width = level.width;
      let height = level.height;
      let bytes = 0;
      for (let mip = 0; mip < mips; mip++) {
        if (stale()) {
          level.close();
          texture.destroy();
          return;
        }
        this.device.queue.copyExternalImageToTexture(
          { source: level },
          { texture, mipLevel: mip },
          [width, height],
        );
        bytes += width * height * 4;
        if (mip + 1 === mips) break;
        width = Math.max(1, width >> 1);
        height = Math.max(1, height >> 1);
        const next = await createImageBitmap(level, {
          resizeWidth: width,
          resizeHeight: height,
          resizeQuality: 'high',
        });
        level.close();
        level = next;
      }
      level.close();
      if (stale()) {
        texture.destroy();
        return;
      }
      mesh.texture = texture;
      mesh.atlasGroups.clear();
      mesh.bytes += bytes;
      this.levelOwnBytes += bytes;
    })().catch(() => {
      // An atlas that will not decode costs the texture, not the level.
    });
  }

  /**
   * A mesh's atlas bind group for one mesh pipeline: its texture (the level's
   * atlas, a tile's image) or a placeholder, and its tile table or a
   * placeholder.
   *
   * Kept on the mesh rather than in the shared cache, so a tile's groups go
   * when the tile does instead of piling up under ids that never come back.
   */
  private atlasBindGroup(pipeline: GPURenderPipeline, mesh: GpuMesh): GPUBindGroup {
    if (!this.atlasPlaceholder) {
      this.atlasPlaceholder = this.device.createTexture({
        label: 'no atlas',
        size: [1, 1],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
      });
      this.device.queue.writeTexture(
        { texture: this.atlasPlaceholder },
        new Uint8Array([128, 128, 128, 255]),
        { bytesPerRow: 4 },
        [1, 1],
      );
    }
    if (!this.atlasSamplerCache) {
      // Anisotropic: the ground is seen at grazing angles, and without it a
      // texture turns to blur - or with plain mipmaps, to shimmer - a few
      // hundred metres out.
      this.atlasSamplerCache = this.device.createSampler({
        label: 'atlas',
        magFilter: 'linear',
        minFilter: 'linear',
        mipmapFilter: 'linear',
        addressModeU: 'clamp-to-edge',
        addressModeV: 'clamp-to-edge',
        maxAnisotropy: 8,
      });
    }
    if (!this.tilePlaceholder) {
      // One zeroed rectangle: the storage binding must be backed, and nothing
      // reads it, a mesh without tiles numbering every vertex 0.
      this.tilePlaceholder = this.device.createBuffer({
        label: 'no tiles',
        size: 16,
        usage: GPUBufferUsage.STORAGE,
      });
    }
    let group = mesh.atlasGroups.get(pipeline);
    if (!group) {
      const texture = mesh.texture ?? this.atlasPlaceholder;
      const tiles = mesh.tileTable ?? this.tilePlaceholder;
      const view = mesh.texture && mesh.textureLevels ? texture.createView({ mipLevelCount: mesh.textureLevels }) : texture.createView();
      group = this.device.createBindGroup({
        layout: pipeline.getBindGroupLayout(1),
        entries: [
          { binding: 0, resource: view },
          { binding: 1, resource: this.atlasSamplerCache },
          { binding: 2, resource: { buffer: tiles } },
        ],
      });
      mesh.atlasGroups.set(pipeline, group);
    }
    return group;
  }

  /**
   * A mesh's ground edge list, built once, the first time it is asked for.
   *
   * Deferred because it is a hash-set pass over a million triangles and the
   * shaded view never needs it. Built from `buildEdgeList` rather than by
   * reinterpreting the triangle index buffer as a line list, which is the
   * tempting shortcut and draws nonsense: consecutive pairs of a triangle list
   * are (0,1) (2,3) (4,5), so it renders one and a half edges of every second
   * triangle and none of the rest.
   */
  private ensureGroundWire(m: GpuMesh): void {
    if (m.groundWireBuffer || m.groundIndices.length === 0) return;
    const edges = buildEdgeList(m.groundIndices);
    if (edges.length === 0) return;
    m.groundWireBuffer = this.makeBuffer(edges, GPUBufferUsage.INDEX, 'ground edges');
    m.groundWireCount = edges.length;
    m.bytes += edges.byteLength;
    if (m.tile) this.tileBytes += edges.byteLength;
    else this.levelOwnBytes += edges.byteLength;
  }

  /**
   * The meshes a frame draws: the model level's, then every world tile whose box
   * is in view.
   *
   * Nothing at all without a model level: the tiles are drawn with the level's
   * look, and an image level or none has no look to give them. The level's own
   * mesh is never culled - it is one draw, and its box is not kept.
   */
  private meshesInView(params: FrameParams): GpuMesh[] {
    if (params.level?.kind !== 'model') return [];
    const out: GpuMesh[] = [];
    if (this.levelMesh) out.push(this.levelMesh);
    if (this.tileMeshes.size === 0) return out;
    frustumPlanes(params.viewProj, this.planes);
    for (const m of this.tileMeshes.values()) {
      if (m.bounds && boxOutsideFrustum(this.planes, m.bounds)) continue;
      out.push(m);
    }
    return out;
  }

  /** Bind one mesh's four vertex buffers, in the mesh pipelines' layout. */
  private setMeshBuffers(pass: GPURenderPassEncoder, m: GpuMesh): void {
    pass.setVertexBuffer(0, m.vertexBuffer);
    pass.setVertexBuffer(1, m.colourBuffer);
    pass.setVertexBuffer(2, m.uvBuffer);
    pass.setVertexBuffer(3, m.tileBuffer);
  }

  // ------------------------------------------------------------------- frame

  render(params: FrameParams): FrameResult {
    this.debug.frames++;
    this.ensureTargets(
      params.width,
      params.height,
      params.heatScale,
      params.heat.teamColors ? 4 : 1,
    );
    if (!this.sceneView || !this.depthView || !this.heatView) return { gpuMs: null };

    if (params.colorLutDirty) {
      this.device.queue.writeTexture(
        { texture: this.lutTexture },
        params.colorLut as unknown as BufferSource,
        { bytesPerRow: LUT_WIDTH * 4 },
        [LUT_WIDTH, LUT_HEIGHT],
      );
    }
    if (params.curveLutDirty && params.curveLut.length === CURVE_LUT_SIZE) {
      for (let i = 0; i < CURVE_LUT_SIZE; i++) {
        this.curveHalf[i] = floatToHalf(params.curveLut[i]);
      }
      this.device.queue.writeTexture(
        { texture: this.curveTexture },
        this.curveHalf as unknown as BufferSource,
        { bytesPerRow: CURVE_LUT_SIZE * 2 },
        [CURVE_LUT_SIZE, 1],
      );
    }
    // The group table and a category split's table, written together: the
    // shader reads the groups in every split mode. Indices past either table
    // default to visible for groups and to rejected for categories: an unlisted
    // category belongs to neither side, and counting it as positive would add a
    // population nobody selected.
    const signs = packSignTables(
      params.teamSign,
      params.splitMode === 1 ? params.splitSign : null,
      SIGN_TABLE_SIZE,
      this.signScratch,
    );
    this.device.queue.writeBuffer(this.teamSignBuffer, 0, signs as unknown as BufferSource);

    // Uniform slots are handed out fresh each frame, which keeps the bind-group
    // cache keys stable rather than growing without bound.
    this.uniforms.reset();
    const encoder = this.device.createCommandEncoder({ label: 'frame' });
    // An idle frame recomposites the buffers it already has. They are our own
    // textures and retain reliably; the canvas surface does not, so the composite
    // has to run every frame regardless.
    if (!params.compositeOnly) {
      this.drawScene(encoder, params);
      this.renderStructureDepth(encoder, params);
      this.peelDepthLayers(encoder, params);
      if (params.mode !== 'team') this.drawHeat(encoder, params);
      else this.clearHeat(encoder);
    }
    this.composite(encoder, params);
    this.prof?.finish(encoder);
    this.device.queue.submit([encoder.finish()]);
    this.prof?.collect();
    this.debug.submits++;
    return { gpuMs: null };
  }

  get gpuTracksMaxBytes(): number {
    // The keys' x, y, z, t (8 bytes each) in up to two buffers (`KEY_BUFFERS`), each within one binding.
    const one = Math.min(this.device.limits.maxStorageBufferBindingSize, this.device.limits.maxBufferSize, KEYS_PER_BUFFER * 8);
    return one < KEYS_PER_BUFFER * 8 ? one : KEY_BUFFERS * KEYS_PER_BUFFER * 8;
  }

  get gpuTracksBytes(): number {
    return this.tracks?.bytes ?? 0;
  }

  private drawScene(encoder: GPUCommandEncoder, params: FrameParams): void {
    // The GPU tracks are placed first, in a compute pass of their own.
    if (params.gpuTracks) {
      this.tracks ??= new GpuTracks(this.device, SCENE_FORMAT, DEPTH_FORMAT);
      this.tracks.compute(encoder, { ...params.gpuTracks, viewProj: params.viewProj, camera: params.cameraPos }, this.prof?.writes('tracks'));
    }
    // Every uniform slot this pass needs is written before the pass opens, so
    // each draw reads its own region rather than the last write to win.
    const gridOffset = this.pushSceneUniform(
      params,
      params.gridExtent * 0.35,
      params.gridExtent * 1.15,
      0,
      1,
    );
    const cubeOffset = this.pushSceneUniform(params, 1e9, 1e9 + 1, params.cubeSize, 1);
    const plainOffset = this.pushSceneUniform(params, 1e9, 1e9 + 1, 0, 1);
    const lookOffset = this.pushSceneUniform(params, 1e9, 1e9 + 1, params.lookLength, 1);
    this.frameMeshes = this.meshesInView(params);
    const model = params.level?.kind === 'model' ? params.level : null;
    const slots = model ? this.pushMeshUniforms(params, model) : null;
    const mapOffset = params.level?.kind === 'image' ? this.pushMapUniform(params, params.level) : 0;

    const pass = encoder.beginRenderPass({
      label: 'scene',
      timestampWrites: this.prof?.writes('scene'),
      colorAttachments: [
        {
          view: this.sceneView!,
          clearValue: { r: 0.086, g: 0.09, b: 0.102, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: this.depthView!,
        depthClearValue: 1,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    });

    if (params.level) this.drawLevel(pass, params.level, mapOffset, slots);

    if (params.showGrid || params.showAxes) {
      this.ensureGrid(params);
      if (this.lineBuffer && this.lineVertexCount > 0) {
        pass.setPipeline(this.linePipeline);
        pass.setBindGroup(0, this.sceneBindGroup(this.linePipeline, 'line', gridOffset));
        pass.setVertexBuffer(0, this.lineBuffer);
        pass.draw(this.lineVertexCount);
      }
    }

    if (params.cubeCount > 0 && params.cubes) {
      const instances = this.uploadInstances(params.cubes, params.cubeCount);
      pass.setPipeline(this.cubePipeline);
      pass.setBindGroup(0, this.sceneBindGroup(this.cubePipeline, 'cube', cubeOffset));
      pass.setVertexBuffer(0, this.cubeVertexBuffer);
      pass.setVertexBuffer(1, instances);
      pass.setIndexBuffer(this.cubeIndexBuffer, 'uint16');
      pass.drawIndexed(36, params.cubeCount);

      if (params.showLookDirection) {
        pass.setPipeline(this.lookPipeline);
        pass.setBindGroup(0, this.sceneBindGroup(this.lookPipeline, 'look', lookOffset));
        pass.setVertexBuffer(0, this.lookVertexBuffer);
        pass.setVertexBuffer(1, instances);
        pass.draw(2, params.cubeCount);
      }
    }

    if ((params.figureBatches && params.figureBatches.length) || params.gpuTracks) {
      this.figures ??= new GpuFigures(this.device, SCENE_FORMAT, DEPTH_FORMAT, alphaBlend());
      const group = this.sceneBindGroup(this.figures.pipeline, 'figures', plainOffset);
      if (params.figureBatches && params.figureBatches.length) this.figures.draw(pass, params.figureBatches, group);
      if (params.gpuTracks && this.tracks) {
        this.tracks.draw(pass, this.figures, group);
        this.tracks.drawTrails(pass, this.cachedBindGroup(`scene:trackTrail:${plainOffset}`, this.tracks.trailLayout, () => [{ binding: 0, resource: this.uniforms.binding(plainOffset, SCENE_UNIFORM_BYTES) }]));
      }
    }

    if (params.sceneTris && params.sceneTriVertCount > 0) {
      this.triBuffer = this.uploadLines(this.triBuffer, params.sceneTris, params.sceneTriVertCount, 'scene triangles');
      pass.setPipeline(this.triPipeline);
      pass.setBindGroup(0, this.sceneBindGroup(this.triPipeline, 'tris', plainOffset));
      pass.setVertexBuffer(0, this.triBuffer);
      pass.draw(params.sceneTriVertCount);
    }

    if (params.trailVerts && params.trailVertCount > 0) {
      this.trailBuffer = this.uploadLines(
        this.trailBuffer,
        params.trailVerts,
        params.trailVertCount,
        'trails',
      );
      pass.setPipeline(this.linePipeline);
      pass.setBindGroup(0, this.sceneBindGroup(this.linePipeline, 'line', plainOffset));
      pass.setVertexBuffer(0, this.trailBuffer);
      pass.draw(params.trailVertCount);
    }

    if (params.overlayVerts && params.overlayVertCount > 0) {
      this.overlayBuffer = this.uploadLines(
        this.overlayBuffer,
        params.overlayVerts,
        params.overlayVertCount,
        'overlay',
      );
      pass.setPipeline(this.overlayPipeline);
      pass.setBindGroup(0, this.sceneBindGroup(this.overlayPipeline, 'overlay', plainOffset));
      pass.setVertexBuffer(0, this.overlayBuffer);
      pass.draw(params.overlayVertCount);
    }

    pass.end();
  }

  private pushMapUniform(
    params: FrameParams,
    level: NonNullable<FrameParams['level']>,
  ): number {
    const u = this.scratchFor(MAP_UNIFORM_BYTES);
    u.set(params.viewProj, 0);
    u[16] = level.rect[0];
    u[17] = level.rect[1];
    u[18] = level.rect[2];
    u[19] = level.rect[3];
    u[20] = level.y;
    u[21] = level.flipV ? 1 : 0;
    u[22] = level.opacity;
    u[23] = level.desaturate;
    u[24] = level.brightness;
    return this.uniforms.push(u, MAP_UNIFORM_BYTES);
  }

  /**
   * Every uniform slot the level's and the tiles' passes need this frame.
   *
   * Ground, structure faces and structure wireframe each need their own tint,
   * opacity and fresnel, so each gets its own slot. And the texture switch is in
   * the slot, so a pass whose meshes differ in whether their texture has arrived
   * - the level's atlas still decoding, a tile with imagery beside one without -
   * gets one slot per answer, chosen per mesh at draw time. A handful of slots
   * whatever the number of tiles.
   */
  private pushMeshUniforms(params: FrameParams, model: LevelDraw): MeshSlots {
    const look = model.tiles;
    const s = model.structure;
    const ground = new Map<string, number>();
    for (const m of this.frameMeshes) {
      const colour = m.tile ? look.colours : model.vertexColours;
      const textured = (m.tile ? look.texture : model.texture) && m.texture !== null;
      const key = groundKey(colour, textured);
      if (ground.has(key)) continue;
      ground.set(
        key,
        this.pushSceneUniform(
          params,
          1e9,
          1e9 + 1,
          model.opacity,
          model.brightness,
          [1, 1, 1],
          0,
          // Relief cues go to the ground pass only: structures are shells, not
          // terrain, and contour lines across a roof would be nonsense.
          model.relief,
          false,
          colour,
          textured,
        ),
      );
    }
    const anyTexture = this.frameMeshes.some((m) => m.texture !== null);
    const anyBare = this.frameMeshes.some((m) => m.texture === null);
    // [without a texture, with one]. Only the answers some mesh needs are pushed.
    const pair = (push: (textured: boolean) => number): [number, number] => [
      anyBare ? push(false) : 0,
      anyTexture ? push(true) : 0,
    ];
    const struct = pair((textured) =>
      this.pushSceneUniform(
        params,
        1e9,
        1e9 + 1,
        s.faceOpacity,
        model.brightness,
        // Textured structures are drawn in their own colours, with no rim:
        // they are surfaces, not shells.
        s.textured ? [1, 1, 1] : s.tint,
        s.textured ? 0 : 1,
        null,
        s.flat,
        s.textured,
        s.textured && textured ? 2 : false,
      ),
    );
    // The structures' depth seal, with its own slot rather than theirs: the
    // seal's colour is masked, so the texture mode decides only the cut-out, and
    // that applies whenever the texture has arrived - in the shell look too,
    // whose colour pass draws a leaf card whole. Foliage never occludes heat.
    const seal = pair((textured) => this.pushSealUniform(params, model, textured));
    const wire = this.pushSceneUniform(
      params,
      1e9,
      1e9 + 1,
      s.wireOpacity,
      model.brightness,
      s.tint,
      0,
    );
    // The ground's edges get a neutral tint: they describe the sampling of the
    // terrain, and tinting them the structures' colour reads as buildings.
    let groundWire = 0;
    if (model.groundWireOpacity > 0) {
      groundWire = this.pushSceneUniform(
        params,
        model.groundWireFade[0],
        model.groundWireFade[1],
        model.groundWireOpacity,
        model.brightness,
        [1, 1, 1],
        0,
      );
      for (const m of this.frameMeshes) this.ensureGroundWire(m);
    }
    // Water: no relief cues, no Fresnel, its own tint. See `waterDraw`.
    const water = this.pushSceneUniform(
      params,
      1e9,
      1e9 + 1,
      model.water.opacity,
      model.brightness,
      model.water.tint,
      0,
    );
    return { ground, struct, seal, wire, groundWire, water };
  }

  /** The structures' depth-only slot: the seal's and the structure-depth target's. */
  private pushSealUniform(params: FrameParams, model: LevelDraw, textured: boolean): number {
    return this.pushSceneUniform(
      params,
      1e9,
      1e9 + 1,
      model.structure.faceOpacity,
      model.brightness,
      model.structure.tint,
      1,
      null,
      model.structure.flat,
      false,
      textured ? 2 : false,
    );
  }

  private drawLevel(
    pass: GPURenderPassEncoder,
    level: NonNullable<FrameParams['level']>,
    mapOffset: number,
    slots: MeshSlots | null,
  ): void {
    if (level.kind === 'image' && this.mapTexture) {
      pass.setPipeline(this.mapPipeline);
      pass.setBindGroup(
        0,
        this.cachedBindGroup(
          `map:${mapOffset}:${this.mapTextureId}`,
          this.mapPipeline.getBindGroupLayout(0),
          () => [
            { binding: 0, resource: this.uniforms.binding(mapOffset, MAP_UNIFORM_BYTES) },
            { binding: 1, resource: this.mapTexture!.createView() },
            { binding: 2, resource: this.sampler },
          ],
        ),
      );
      pass.draw(6);
      return;
    }
    if (level.kind !== 'model' || !slots) return;
    // Pass by pass over the level and every tile in view, not mesh by mesh: a
    // tile's ground drawn after the level's shells would paint over the shells
    // standing in front of it. A tile takes the level's look; only what the
    // level resolved from its own contents comes from `level.tiles` instead.
    const meshes = this.frameMeshes;
    const look = level.tiles;

    // Ground first: opaque, writes depth, so it occludes heat beneath it.
    const groundPipeline = level.wireframe ? this.meshWirePipeline : this.meshPipeline;
    for (const m of meshes) {
      if (!m.groundBuffer || m.groundCount === 0) continue;
      const colour = m.tile ? look.colours : level.vertexColours;
      const textured = (m.tile ? look.texture : level.texture) && m.texture !== null;
      const offset = slots.ground.get(groundKey(colour, textured)) ?? 0;
      pass.setPipeline(groundPipeline);
      pass.setBindGroup(
        0,
        this.sceneBindGroup(groundPipeline, level.wireframe ? 'ground-lines' : 'ground', offset),
      );
      pass.setBindGroup(1, this.atlasBindGroup(groundPipeline, m));
      this.setMeshBuffers(pass, m);
      pass.setIndexBuffer(m.groundBuffer, 'uint32');
      pass.drawIndexed(m.groundCount);
    }

    // Its triangle edges over the top, not instead of it: the shape and the
    // sampling density are two different questions and both get asked.
    if (level.groundWireOpacity > 0) {
      for (const m of meshes) {
        if (!m.groundWireBuffer || m.groundWireCount === 0) continue;
        pass.setPipeline(this.wirePipeline);
        pass.setBindGroup(0, this.sceneBindGroup(this.wirePipeline, 'groundwire', slots.groundWire));
        this.setMeshBuffers(pass, m);
        pass.setIndexBuffer(m.groundWireBuffer, 'uint32');
        pass.drawIndexed(m.groundWireCount);
      }
    }

    // Water next: a surface, so it writes depth, but with none of the terrain
    // cues and its own tint so a lake is not the same grey as its bank.
    for (const m of meshes) {
      if (!m.waterBuffer || m.waterCount === 0 || !(m.tile ? look.water : level.water.show)) continue;
      pass.setPipeline(this.meshPipeline);
      pass.setBindGroup(0, this.sceneBindGroup(this.meshPipeline, 'water', slots.water));
      pass.setBindGroup(1, this.atlasBindGroup(this.meshPipeline, m));
      this.setMeshBuffers(pass, m);
      pass.setIndexBuffer(m.waterBuffer, 'uint32');
      pass.drawIndexed(m.waterCount);
    }

    const s = level.structure;
    // Textured and fully opaque is a surface like the ground, so it takes the
    // ground's depth-writing pipeline: a guardrail's far side must not draw
    // over its near side. Anything less is a shell.
    const solid = s.textured && s.faceOpacity >= 0.999;
    const structPipeline = solid ? this.meshPipeline : this.structPipeline;
    for (const m of meshes) {
      if (!m.structBuffer || m.structCount === 0 || !(m.tile ? look.faces : s.showFaces)) continue;
      pass.setPipeline(structPipeline);
      // Its own cache key per pipeline: a bind group made from one pipeline's
      // automatic layout is not valid with another's, however alike they are.
      pass.setBindGroup(
        0,
        this.sceneBindGroup(
          structPipeline,
          solid ? 'struct-solid' : 'struct',
          slots.struct[m.texture !== null ? 1 : 0],
        ),
      );
      pass.setBindGroup(1, this.atlasBindGroup(structPipeline, m));
      this.setMeshBuffers(pass, m);
      pass.setIndexBuffer(m.structBuffer, 'uint32');
      pass.drawIndexed(m.structCount);
    }
    for (const m of meshes) {
      if (!m.wireBuffer || m.wireCount === 0 || !(m.tile ? look.wire : s.showWire)) continue;
      pass.setPipeline(this.wirePipeline);
      pass.setBindGroup(0, this.sceneBindGroup(this.wirePipeline, 'wire', slots.wire));
      this.setMeshBuffers(pass, m);
      pass.setIndexBuffer(m.wireBuffer, 'uint32');
      pass.drawIndexed(m.wireCount);
    }

    // Last in the pass, and depth only: the colour of this frame is already
    // decided, and what changes is the depth texture the heat pass samples.
    // Without this the structures are absent from it and nothing is ever
    // occluded by a building — see `sealStructureDepth` in the WebGL2 renderer.
    for (const m of meshes) {
      if (!m.structBuffer || m.structCount === 0) continue;
      pass.setPipeline(this.structDepthPipeline);
      pass.setBindGroup(
        0,
        this.sceneBindGroup(this.structDepthPipeline, 'structdepth', slots.seal[m.texture !== null ? 1 : 0]),
      );
      pass.setBindGroup(1, this.atlasBindGroup(this.structDepthPipeline, m));
      this.setMeshBuffers(pass, m);
      pass.setIndexBuffer(m.structBuffer, 'uint32');
      pass.drawIndexed(m.structCount);
    }
  }

  /**
   * How many peeled layers hold real geometry this frame.
   *
   * Zero when occlusion is off or there are no structures, which is what the
   * shader reads to decide how many textures to consult — the bindings always
   * exist, but on those frames they hold nothing meaningful.
   */
  private activeLayers(params: FrameParams): number {
    if (params.heat.occlusion <= 0) return 0;
    if (params.level?.kind !== 'model') return 0;
    // A wall on a world tile is as much a surface to count as one on the level.
    if (!this.frameMeshes.some((m) => m.structBuffer && m.structCount > 0)) return 0;
    return this.peelViews.length;
  }

  /**
   * Peel successive surfaces behind the nearest one.
   *
   * Each pass draws the structure geometry into its own depth-only target,
   * discarding anything at or in front of the previous layer, so layer *i* ends
   * up holding the (i+2)th surface along each ray. The heat pass counts how many
   * a datapoint is behind and dims per surface.
   *
   * The point of it: a single depth comparison cannot tell one wall from a whole
   * building, so every interior comes out as one uniform faint smear — which
   * loses the thing a movement heatmap of a building is for.
   */
  /**
   * The nearest structure surface, in a target of its own.
   *
   * The same geometry and the same pipeline as the depth seal at the end of the
   * scene pass, against a different attachment — and that difference is the
   * point. The scene's depth records the nearest surface of any kind, so a heat
   * pass reading it knows that *something* stands in front of a datapoint and not
   * whether it is a wall or a hillside. The two want opposite treatment: walls
   * are looked through deliberately, to read which corridor and which floor the
   * traffic was on, and terrain never is — behind a hill is the far side of the
   * map, which arrives with no depth cue and sums along the horizon into a band
   * brighter than the foreground simply because there is more of it.
   *
   * Only when the cutoff is on, so it costs nothing when off. The scene's colour
   * attachment is loaded and stored untouched: the pipeline writes it with a zero
   * mask, and it is bound only because a pipeline's targets have to match the
   * pass it runs in.
   */
  private renderStructureDepth(encoder: GPUCommandEncoder, params: FrameParams): void {
    if (!params.heat.hideBehindGround) return;
    if (!this.structDepthView || !this.sceneView) return;
    const pass = encoder.beginRenderPass({
      label: 'structure depth',
      colorAttachments: [{ view: this.sceneView, loadOp: 'load', storeOp: 'store' }],
      depthStencilAttachment: {
        view: this.structDepthView,
        depthClearValue: 1,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    });
    const model = params.level?.kind === 'model' ? params.level : null;
    const meshes = model ? this.frameMeshes.filter((m) => m.structBuffer && m.structCount > 0) : [];
    if (model && meshes.length > 0) {
      // The structures' own uniform slots, so the slice applies here as it does
      // to the seal: a wall cut open must stop counting as a wall. And the
      // texture, as in the seal: a leaf card's cut-out texels are no wall,
      // whether or not the structures are drawn from it.
      const offsets = [false, true].map((textured) => this.pushSealUniform(params, model, textured));
      pass.setPipeline(this.structDepthPipeline);
      for (const m of meshes) {
        pass.setBindGroup(
          0,
          this.sceneBindGroup(this.structDepthPipeline, 'structonly', offsets[m.texture !== null ? 1 : 0]),
        );
        pass.setBindGroup(1, this.atlasBindGroup(this.structDepthPipeline, m));
        this.setMeshBuffers(pass, m);
        pass.setIndexBuffer(m.structBuffer!, 'uint32');
        pass.drawIndexed(m.structCount);
      }
    }
    // Ended even with nothing drawn: the pass is what clears the target to 1.0,
    // which is what "no structure in front of anything" means, and a level with
    // no structures needs exactly that rather than last frame's contents.
    pass.end();
  }

  private peelDepthLayers(encoder: GPUCommandEncoder, params: FrameParams): void {
    const layers = this.activeLayers(params);
    if (layers === 0) return;

    let prev = this.mustDepthView();
    const meshes = this.frameMeshes.filter((m) => m.structBuffer && m.structCount > 0);
    for (let i = 0; i < layers; i++) {
      // [without a texture, with one]: the cut-out test is per mesh.
      const offsets = [this.pushPeelUniform(params, false), this.pushPeelUniform(params, true)];
      const pass = encoder.beginRenderPass({
        label: `depth peel ${i}`,
        colorAttachments: [],
        depthStencilAttachment: {
          view: this.peelViews[i],
          depthClearValue: 1,
          depthLoadOp: 'clear',
          depthStoreOp: 'store',
        },
      });
      pass.setPipeline(this.peelPipeline);
      const source = prev;
      for (const m of meshes) {
        const offset = offsets[m.texture !== null ? 1 : 0];
        // Keyed by the source view as well as the offset: consecutive layers
        // share an offset value only by coincidence and must not share a bind
        // group.
        pass.setBindGroup(
          0,
          this.cachedBindGroup(
            `peel:${i}:${offset}:${this.depthGeneration}`,
            this.peelPipeline.getBindGroupLayout(0),
            () => [
              { binding: 0, resource: this.uniforms.binding(offset, PEEL_UNIFORM_BYTES) },
              { binding: 1, resource: source },
            ],
          ),
        );
        pass.setBindGroup(1, this.atlasBindGroup(this.peelPipeline, m));
        pass.setVertexBuffer(0, m.vertexBuffer);
        pass.setVertexBuffer(1, m.uvBuffer);
        pass.setVertexBuffer(2, m.tileBuffer);
        pass.setIndexBuffer(m.structBuffer!, 'uint32');
        pass.drawIndexed(m.structCount);
      }
      pass.end();
      prev = this.peelViews[i];
    }
  }

  private pushPeelUniform(params: FrameParams, textured: boolean): number {
    const u = this.scratchFor(PEEL_UNIFORM_BYTES);
    u.set(params.viewProj, 0);
    u[16] = this.width;
    u[17] = this.height;
    u[18] = PEEL_EPSILON_F;
    // The cut-out test, whenever the mesh's texture has arrived: foliage never
    // occludes heat, whether or not the structures are drawn from it.
    u[19] = textured ? 1 : 0;
    return this.uniforms.push(u, PEEL_UNIFORM_BYTES);
  }

  private clearHeat(encoder: GPUCommandEncoder): void {
    const pass = encoder.beginRenderPass({
      label: 'clear heat',
      colorAttachments: [
        {
          view: this.heatView!,
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    });
    pass.end();
  }

  private drawHeat(encoder: GPUCommandEncoder, params: FrameParams): void {
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
    const target = direct ? this.heatView! : this.heatScratchView!;
    // Extending adds to what is already there, so it is the one mode that must not
    // clear first — that is the whole point of it.
    if (!extend) {
      const clear = encoder.beginRenderPass({
        label: direct ? 'clear heat' : 'clear heat scratch',
        colorAttachments: [
          {
            view: target,
            clearValue: { r: 0, g: 0, b: 0, a: 0 },
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
      });
      clear.end();
    }

    const weight = params.sampleWeight * params.heatGain;
    if (params.plan.length === 0) {
      this.splitSkippedChunks = 0;
      // Nothing to splat. A partial frame still folds its (empty) estimate in, or
      // the history would not decay and a stale field would persist.
      if (!direct) this.mergeHeat(encoder, alpha);
      return;
    }

    const filters = params.filters.slice(0, MAX_FILTER_SLOTS);
    if (filters.some((f) => f.kind === 'categories')) {
      this.writeFilterMask(filters);
    }

    // Block starts differ per chunk and, like uniforms, a single buffer written
    // once per chunk would leave every chunk reading the last write. So the
    // whole plan is packed into one buffer with a per-chunk offset.
    const packedStarts: number[] = [];
    const startOffsets: number[] = [];
    for (const plan of params.plan) {
      startOffsets.push(packedStarts.length);
      const blocks = Math.min(plan.blockCount, MAX_BLOCKS);
      for (let b = 0; b < blocks; b++) packedStarts.push(plan.blockStarts[b]);
    }
    if (packedStarts.length > MAX_BLOCKS) {
      // Keep within the allocated buffer; extra chunks are dropped this frame
      // rather than corrupting the ones that fit.
      packedStarts.length = MAX_BLOCKS;
    }
    this.device.queue.writeBuffer(
      this.blockBuffer,
      0,
      new Uint32Array(packedStarts) as unknown as BufferSource,
    );

    const uniformOffsets: number[] = [];
    let splitSkipped = 0;
    params.plan.forEach((plan, index) => {
      const chunk = this.chunks[plan.chunk];
      if (!chunk || plan.blockCount === 0) {
        uniformOffsets.push(-1);
        return;
      }
      const { slots, splitSlot } = this.ensureFilterValues(
        plan.chunk,
        filters,
        params.splitMode === 0 ? null : params.splitColumn,
      );
      // A column split whose column is not on the GPU for this chunk - it would
      // not fit, or the split has no column it can draw - leaves the chunk out
      // and counts it. It used to fall back to the group split, which drew a
      // team split under a column someone had just chosen and said nothing.
      if (params.splitMode !== 0 && splitSlot < 0) {
        splitSkipped++;
        uniformOffsets.push(-1);
        return;
      }
      uniformOffsets.push(
        this.writeHeatUniform(
          params,
          chunk,
          plan,
          weight,
          filters,
          slots,
          splitSlot,
          startOffsets[index],
        ),
      );
    });

    const pass = encoder.beginRenderPass({
      label: 'heat',
      colorAttachments: [{ view: target, loadOp: 'load', storeOp: 'store' }],
      // Colour only: the splat shader compares depth itself, reading the scene's
      // depth as a texture. See buildHeatPipeline.
    });
    // Line heat where there are routes to draw; points otherwise, not nothing.
    const lines = params.lineHeat && this.lines !== null;
    pass.setPipeline(lines ? this.lineHeatPipelineFor(this.heatFormat) : this.heatPipelineFor(this.heatFormat));

    params.plan.forEach((plan, index) => {
      const offset = uniformOffsets[index];
      if (offset < 0) return;
      const blocks = Math.min(plan.blockCount, MAX_BLOCKS);
      if (startOffsets[index] + blocks > MAX_BLOCKS) return;
      pass.setBindGroup(0, this.heatBindGroup(plan.chunk, offset, lines));
      pass.draw(blocks * SAMPLE_BLOCK * (lines ? 18 : 3));
    });
    pass.end();
    this.splitSkippedChunks = splitSkipped;

    if (!direct) this.mergeHeat(encoder, alpha);
  }

  /** See `Renderer.splitSkippedChunks`. */
  splitSkippedChunks = 0;

  /**
   * Fold the scratch estimate into the accumulator: `acc = acc*(1-a) + scratch*a`.
   *
   * A multiply then an add, so the accumulator's precision no longer depends on
   * how many frames have been merged. Doing it inside the splat instead makes
   * every sprite's contribution 1/n of the running total, and on a half-float
   * target those simply round away.
   */
  private mergeHeat(encoder: GPUCommandEncoder, alpha: number): void {
    // Decay what is already there.
    const decayU = this.scratchFor(16);
    decayU[0] = 1 - alpha;
    const decayOffset = this.uniforms.push(decayU, 16);
    const decay = encoder.beginRenderPass({
      label: 'heat decay',
      colorAttachments: [{ view: this.heatView!, loadOp: 'load', storeOp: 'store' }],
    });
    const decayPipeline = this.decayPipelineFor(this.heatFormat);
    decay.setPipeline(decayPipeline);
    decay.setBindGroup(
      0,
      this.cachedBindGroup(
        `decay:${decayOffset}`,
        decayPipeline.getBindGroupLayout(0),
        () => [{ binding: 0, resource: this.uniforms.binding(decayOffset, 16) }],
      ),
    );
    decay.draw(3);
    decay.end();

    // Add alpha of this frame's estimate.
    const addU = this.scratchFor(16);
    addU[0] = alpha;
    const addOffset = this.uniforms.push(addU, 16);
    const add = encoder.beginRenderPass({
      label: 'heat merge',
      colorAttachments: [{ view: this.heatView!, loadOp: 'load', storeOp: 'store' }],
    });
    const mergePipeline = this.mergePipelineFor(this.heatFormat);
    add.setPipeline(mergePipeline);
    add.setBindGroup(
      0,
      this.cachedBindGroup(
        `merge:${addOffset}:${this.targetGeneration}`,
        mergePipeline.getBindGroupLayout(0),
        () => [
          { binding: 0, resource: this.uniforms.binding(addOffset, 16) },
          { binding: 1, resource: this.heatScratchView! },
        ],
      ),
    );
    add.draw(3);
    add.end();
  }

  private composite(encoder: GPUCommandEncoder, params: FrameParams): void {
    const signed = params.mode === 'heat-difference';
    const u = this.scratchFor(COMPOSITE_UNIFORM_BYTES);
    // Every accumulation mode stores the estimate itself rather than a running
    // total, so the only thing left to undo is the half-float range scaling.
    u[0] = 1 / Math.max(1e-9, params.heatGain);
    u[1] = params.heat.saturation;
    u[2] = signed ? 1 : 0;
    u[3] = params.heat.response;
    u[4] = params.heat.floor;
    // Depth of field. A max blur of 0 switches the whole gather off in the shader.
    const dof = params.dof;
    u[5] = dof ? dof.maxBlur : 0;
    u[6] = dof?.focus ?? 1;
    u[7] = dof?.aperture ?? 1;
    u[8] = params.near;
    u[9] = params.far;
    u[10] = 1 / Math.max(1, this.width);
    u[11] = 1 / Math.max(1, this.height);
    u[12] = params.perspective ? 1 : 0;
    u[13] = params.heat.teamColors ? 1 : 0;
    u[14] = params.heat.teamBoost;
    const offset = this.uniforms.push(u, COMPOSITE_UNIFORM_BYTES);

    const group = this.cachedBindGroup(
      `composite:${offset}:${this.targetGeneration}`,
      this.compositePipeline.getBindGroupLayout(0),
      () => [
        { binding: 0, resource: this.uniforms.binding(offset, COMPOSITE_UNIFORM_BYTES) },
        { binding: 1, resource: this.sceneView! },
        { binding: 2, resource: this.heatView! },
        { binding: 3, resource: this.lutTexture.createView() },
        { binding: 4, resource: this.sampler },
        { binding: 5, resource: this.depthView! },
      ],
    );

    const target = this.context.getCurrentTexture();
    this.debug.compositeTarget = `${target.width}x${target.height} ${target.format}`;

    const runPass = (view: GPUTextureView) => {
      const pass = encoder.beginRenderPass({
        label: 'composite',
        colorAttachments: [
          {
            view,
            // A deliberately non-black clear: if this colour reaches the screen
            // the pass ran and the shader is at fault; if nothing does,
            // presentation is.
            clearValue: this.debug.clearProbe
              ? { r: 0.9, g: 0.1, b: 0.4, a: 1 }
              : { r: 0, g: 0, b: 0, a: 1 },
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
      });
      if (!this.debug.clearProbe) {
        pass.setPipeline(this.compositePipeline);
        pass.setBindGroup(0, group);
        pass.draw(3);
      }
      pass.end();
    };

    runPass(target.createView());
    this.debug.composites++;

    // Repeat into an offscreen copy when a capture is pending. Compositing twice
    // is cheaper and far simpler than reading back the swapchain, which WebGPU
    // does not allow.
    if (this.captureWanted) {
      this.ensureCapture();
      if (this.captureTex && this.captureBuffer) {
        runPass(this.captureTex.createView());
        encoder.copyTextureToBuffer(
          { texture: this.captureTex },
          { buffer: this.captureBuffer, bytesPerRow: this.captureStride },
          [this.width, this.height],
        );
        this.captureReady = true;
      }
      this.captureWanted = false;
    }
  }

  private captureTex: GPUTexture | null = null;
  private captureBuffer: GPUBuffer | null = null;
  private captureStride = 0;
  private captureWanted = false;
  private captureReady = false;

  private ensureCapture(): void {
    // bytesPerRow for a texture-to-buffer copy must be a multiple of 256.
    const stride = Math.ceil((this.width * 4) / 256) * 256;
    if (this.captureTex && this.captureStride === stride && this.captureBuffer) return;
    this.captureTex?.destroy();
    this.captureBuffer?.destroy();
    this.captureStride = stride;
    this.captureTex = this.device.createTexture({
      label: 'capture',
      size: [this.width, this.height],
      format: this.canvasFormat,
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    });
    this.captureBuffer = this.device.createBuffer({
      label: 'capture readback',
      size: stride * this.height,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
  }

  async captureFrame(): Promise<CapturedFrame | null> {
    this.captureWanted = true;
    this.captureReady = false;
    // Wait for a frame that actually renders; the engine skips frames when a
    // converged view has nothing new to draw.
    for (let i = 0; i < 240 && !this.captureReady; i++) {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    }
    if (!this.captureReady || !this.captureBuffer) return null;

    await this.device.queue.onSubmittedWorkDone();
    await this.captureBuffer.mapAsync(GPUMapMode.READ);
    const src = new Uint8Array(this.captureBuffer.getMappedRange());
    const rgba = new Uint8Array(this.width * this.height * 4);
    const bgra = this.canvasFormat.startsWith('bgra');
    for (let y = 0; y < this.height; y++) {
      const row = y * this.captureStride;
      const out = y * this.width * 4;
      for (let x = 0; x < this.width; x++) {
        const s = row + x * 4;
        const d = out + x * 4;
        // The swapchain format is usually BGRA on Windows; normalise it.
        rgba[d] = bgra ? src[s + 2] : src[s];
        rgba[d + 1] = src[s + 1];
        rgba[d + 2] = bgra ? src[s] : src[s + 2];
        rgba[d + 3] = src[s + 3];
      }
    }
    this.captureBuffer.unmap();
    return { width: this.width, height: this.height, rgba };
  }

  // ---------------------------------------------------------------- uniforms

  private scratchFor(bytes: number): Float32Array {
    // The ring copies a fixed byte count from offset 0, so the scratch must be
    // at least one slot wide regardless of the struct being written.
    const floats = Math.max(64, bytes / 4);
    if (this.scratch.length < floats) {
      this.scratch = new Float32Array(floats);
      this.scratchU32 = new Uint32Array(this.scratch.buffer);
    }
    this.scratch.fill(0);
    return this.scratch;
  }

  /**
   * Write one scene uniform slot and return its offset.
   *
   * The line, cube, look, mesh and wire shaders all read the same struct layout,
   * so one writer serves them; `tint` and `fresnel` are ignored by the ones that
   * do not declare them.
   */
  private pushSceneUniform(
    params: FrameParams,
    fadeStart: number,
    fadeEnd: number,
    size: number,
    brightness: number,
    tint: [number, number, number] = [1, 1, 1],
    fresnel = 0,
    relief: LevelDraw['relief'] | null = null,
    flat = false,
    vertexColour = false,
    texture: boolean | 1 | 2 = false,
  ): number {
    const u = this.scratchFor(SCENE_UNIFORM_BYTES);
    u.set(params.viewProj, 0);
    u[16] = params.cameraPos[0];
    u[17] = params.cameraPos[1];
    u[18] = params.cameraPos[2];
    u[20] = fadeStart;
    u[21] = fadeEnd;
    u[22] = size;
    u[23] = brightness;
    u[24] = tint[0];
    u[25] = tint[1];
    u[26] = tint[2];
    u[27] = fresnel;
    // Ground relief: null for anything that is not the ground, which is every
    // caller except the level's own surface pass.
    u[28] = relief ? relief.slope : 0;
    u[29] = relief ? relief.contourSpacing : 0;
    u[30] = relief ? relief.contourStrength : 0;
    u[31] = relief ? relief.contourIndexEvery : 0;
    u[32] = relief ? relief.elevationRange : 0;
    u[33] = relief ? relief.lowY : 0;
    u[34] = relief ? relief.highY : 1;
    // Spare lane of the elevation vector: face normals from derivatives, for
    // welded structure geometry whose interpolated normals round off every
    // corner. Never for the ground, which is a sampled height grid.
    u[35] = flat ? 1 : 0;
    // The slice slab applies to every world-space pass, not just the ground.
    const slice = params.slice;
    u[36] = slice ? slice.axis : -1;
    u[37] = slice ? slice.min : 0;
    u[38] = slice ? slice.max : 0;
    u[39] = slice ? slice.outside : 1;
    // The distance cull, applied to the level as well as the heat. See cullsAway
    // in the mesh and wire shaders.
    const cull = params.heat.cullGeometry;
    u[40] = params.cameraForward[0];
    u[41] = params.cameraForward[1];
    u[42] = params.cameraForward[2];
    u[43] = params.heat.cullPlanar ? 1 : 0;
    u[44] = cull ? Math.max(0, params.heat.cullNear) : 0;
    u[45] = cull ? Math.max(0, params.heat.cullFar) : 0;
    // Captured colour, for the ground pass only. Water and structures carry
    // their own tints and pass false, so a level in colour still reads as a
    // level rather than as three unrelated colour schemes.
    u[46] = vertexColour ? 1 : 0;
    // The texture: 1 (or true) for the ground, whose lighting the shader
    // softens, 2 for textured structures, whose it does not. Passed only for a
    // mesh whose texture has arrived - the level's atlas once decoded, a tile's
    // image - so a pass over meshes that differ takes one slot for each.
    u[47] = texture ? (texture === 2 ? 2 : 1) : 0;
    return this.uniforms.push(u, SCENE_UNIFORM_BYTES);
  }

  private writeHeatUniform(
    params: FrameParams,
    chunk: GpuChunk,
    plan: FrameParams['plan'][number],
    weight: number,
    filters: ActiveFilter[],
    filterSlots: number,
    splitSlot: number,
    blockBase: number,
  ): number {
    const u = this.scratchFor(HEAT_UNIFORM_BYTES);
    const i = this.scratchU32;
    u.set(params.viewProj, 0);
    u[16] = this.heatWidth;
    u[17] = this.heatHeight;
    u[18] = params.heat.minPixelRadius;
    u[19] = params.heat.maxPixelRadius;
    u[20] = chunk.aabbMin[0];
    u[21] = chunk.aabbMin[1];
    u[22] = chunk.aabbMin[2];
    // Spare lane of the AABB vec4; see the struct comment in the shader.
    u[23] = params.lifetime?.fadeOut ?? 0;
    u[24] = chunk.aabbSize[0];
    u[25] = chunk.aabbSize[1];
    u[26] = chunk.aabbSize[2];
    // Spare lane again: how many groups the hue circle is divided between.
    u[27] = Math.max(1, params.heat.teamCount);
    u[28] = params.heat.radius;
    u[29] = params.proj[5];
    u[30] = params.heat.centerIntensity;
    u[31] = params.heat.edgeIntensity;
    u[32] = Math.max(0.01, params.heat.falloff);
    u[33] = weight;
    u[34] = params.heat.groundY;
    u[35] = params.lifetime?.now ?? 0;
    u[36] = chunk.timeMin;
    u[37] = chunk.timeScale;
    u[38] = chunk.lifeScale;
    u[39] = params.lifetime?.defaultLifetime ?? 0;

    const useLifetime = params.lifetime !== null && chunk.times !== null;
    let flags = 0;
    if (params.perspective) flags |= FLAG_PERSPECTIVE;
    if (params.heat.groundProjected) flags |= FLAG_GROUND_PROJECTED;
    if (params.useTeamSign) flags |= FLAG_USE_TEAM_SIGN;
    if (useLifetime) flags |= FLAG_USE_LIFETIME;
    if (params.heat.smoothRamp) flags |= FLAG_SMOOTH_RAMP;
    if (params.heat.useCurve) flags |= FLAG_USE_CURVE;
    if (params.heat.teamColors) flags |= FLAG_TEAM_COLORS;
    if (params.heat.zoomInvariant) flags |= FLAG_CONSERVE;
    i[40] = plan.minRow;
    i[41] = Math.min(plan.maxRow, chunk.rows);
    i[42] = BLOCK_SHIFT;
    i[43] = flags;

    for (let s = 0; s < MAX_FILTER_SLOTS; s++) {
      const f = filters[s];
      // A slot whose column could not be packed is switched off rather than
      // left reading whatever sits at that offset.
      i[44 + s] = f && s < filterSlots ? (f.kind === 'range' ? 1 : 2) : 0;
    }
    for (let s = 0; s < MAX_FILTER_SLOTS; s++) {
      const f = filters[s];
      u[48 + s * 2] = f ? f.min : 0;
      u[49 + s * 2] = f ? f.max : 0;
    }
    // Rows per packed filter slot, then this chunk's block-start base.
    i[56] = chunk.rows;
    i[57] = blockBase;
    // Written through the float view so the shader's bitcast reads it back
    // unchanged; `i` and `u` alias the same scratch buffer.
    u[58] = params.heat.cullFar;
    // Split mode and the slot its column landed in, packed into one lane: mode in
    // the low byte, slot above it. A column split never gets here without its
    // column: the caller leaves such a chunk out (see the heat pass).
    i[59] = params.splitMode | (Math.max(0, splitSlot) << 8);
    u[60] = params.cameraPos[0];
    u[61] = params.cameraPos[1];
    u[62] = params.cameraPos[2];
    u[63] = params.heat.cullNear;
    u[64] = params.splitPositive[0];
    u[65] = params.splitPositive[1];
    u[66] = params.splitNegative[0];
    u[67] = params.splitNegative[1];
    // Occlusion against the level, and how to read the scene depth when the heat
    // target has been throttled below canvas resolution.
    u[68] = params.level ? Math.max(0, Math.min(1, params.heat.occlusion)) : 0;
    u[69] = params.near;
    u[70] = params.far;
    u[71] = this.heatWidth > 0 ? this.width / this.heatWidth : 1;
    // The slice slab. A negative axis disables it.
    const slice = params.slice && params.slice.clipHeat ? params.slice : null;
    u[72] = slice ? slice.axis : -1;
    u[73] = slice ? slice.min : 0;
    u[74] = slice ? slice.max : 0;
    u[75] = slice ? slice.outside : 1;
    // Per-surface dimming beyond the first, the visibility floor, and how many
    // peeled layers actually hold geometry this frame.
    u[76] = params.heat.occludedExtra;
    u[77] = params.heat.occlusionFloor;
    u[78] = this.activeLayers(params);
    // Cut points behind the terrain rather than dimming them. See structDepth in
    // the shader.
    u[79] = params.heat.hideBehindGround && this.structDepthView ? 1 : 0;
    // The view axis and whether the cull measures along it. See cullPlane.
    u[80] = params.cameraForward[0];
    u[81] = params.cameraForward[1];
    u[82] = params.cameraForward[2];
    u[83] = params.heat.cullPlanar ? 1 : 0;
    // The team palette: which group abstains from the hue, and the stride that
    // keeps neighbouring ids off neighbouring hues.
    u[84] = params.heat.teamNeutral;
    u[85] = Math.max(1, params.heat.teamSlices);
    // The weight of a positive row and of a negative one; see sideScales.
    u[86] = params.splitScale[0];
    u[87] = params.splitScale[1];
    // The box line heat's segment starts are quantised to.
    const box = this.lines;
    u[88] = box ? box.min[0] : 0;
    u[89] = box ? box.min[1] : 0;
    u[90] = box ? box.min[2] : 0;
    // Playback: the playhead and the tail's length; a tail of 0 turns it off.
    // Only where this chunk has row times to tell where on a segment `now` is.
    const trail = params.lineTrail && chunk.times ? params.lineTrail : null;
    u[91] = trail ? trail.now : 0;
    u[92] = box ? box.size[0] : 1;
    u[93] = box ? box.size[1] : 1;
    u[94] = box ? box.size[2] : 1;
    u[95] = trail ? trail.tail : 0;
    return this.uniforms.push(u, HEAT_UNIFORM_BYTES);
  }

  private writeFilterMask(filters: ActiveFilter[]): void {
    // Rewritten only when a selection changed: with the person filter a slot is
    // 65,536 bits, and this runs every frame.
    const key = filters.map((f) => (f.mask ? f.key : '')).join('|');
    if (key === this.filterMaskKey) return;
    this.filterMaskKey = key;
    const words = (MAX_FILTER_SLOTS * FILTER_MASK_CAPACITY) / 32;
    const bits = new Uint32Array(words);
    for (let slot = 0; slot < MAX_FILTER_SLOTS; slot++) {
      const mask = filters[slot]?.mask;
      if (!mask) continue;
      for (let c = 0; c < Math.min(mask.length, FILTER_MASK_CAPACITY); c++) {
        if (mask[c]) {
          const bit = slot * FILTER_MASK_CAPACITY + c;
          bits[bit >> 5] |= 1 << (bit & 31);
        }
      }
    }
    this.device.queue.writeBuffer(this.filterMaskBuffer, 0, bits as unknown as BufferSource);
  }

  // ------------------------------------------------------------- bind groups

  /**
   * Bind groups are cached by (pipeline, uniform offset) rather than recreated.
   *
   * Offsets repeat deterministically frame to frame because the ring is reset at
   * the top of every frame, so the cache warms up within one frame and never
   * grows after that.
   */
  private cachedBindGroup(
    key: string,
    layout: GPUBindGroupLayout,
    entries: () => GPUBindGroupEntry[],
  ): GPUBindGroup {
    let g = this.bindCache.get(key);
    if (!g) {
      g = this.device.createBindGroup({ layout, entries: entries() });
      this.bindCache.set(key, g);
    }
    return g;
  }

  private sceneBindGroup(
    pipeline: GPURenderPipeline,
    label: string,
    offset: number,
  ): GPUBindGroup {
    return this.cachedBindGroup(`scene:${label}:${offset}`, pipeline.getBindGroupLayout(0), () => [
      { binding: 0, resource: this.uniforms.binding(offset, SCENE_UNIFORM_BYTES) },
    ]);
  }

  private heatBindGroup(chunkIndex: number, offset: number, lines = false): GPUBindGroup {
    const chunk = this.chunks[chunkIndex];
    // The depth view is part of the key: it is recreated on resize, and a cached
    // bind group holding the old one would read a destroyed texture.
    const pipeline = lines ? this.lineHeatPipelineFor(this.heatFormat) : this.heatPipelineFor(this.heatFormat);
    return this.cachedBindGroup(
      `${lines ? 'lineheat' : 'heat'}:${chunkIndex}:${chunk.filterKey}:${offset}:${this.depthGeneration}`,
      pipeline.getBindGroupLayout(0),
      () => [
        // Line heat's segment starts; the point shader has no binding 14, and an
        // 'auto' layout holds only the bindings its shader uses.
        ...(lines ? [{ binding: 14, resource: { buffer: chunk.lineStarts ?? this.emptyStorage } }] : []),
        { binding: 0, resource: this.uniforms.binding(offset, HEAT_UNIFORM_BYTES) },
        { binding: 1, resource: { buffer: chunk.positions } },
        { binding: 2, resource: { buffer: chunk.times ?? this.emptyStorage } },
        { binding: 3, resource: { buffer: this.blockBuffer } },
        { binding: 4, resource: { buffer: this.teamSignBuffer } },
        { binding: 5, resource: { buffer: chunk.filterValues ?? this.emptyStorage } },
        { binding: 6, resource: { buffer: this.filterMaskBuffer } },
        { binding: 7, resource: this.curveView },
        { binding: 8, resource: this.sampler },
        { binding: 9, resource: this.mustDepthView() },
        // The peeled layers. Always bound — a bind group layout is fixed at
        // pipeline creation, so the bindings have to exist even on a frame with
        // no structures; `occlusionCfg.z` is what tells the shader how many hold
        // anything. Falls back to the scene depth, which is never *nearer* than
        // itself, so an unused layer adds no walls.
        { binding: 10, resource: this.peelViews[0] ?? this.mustDepthView() },
        { binding: 11, resource: this.peelViews[1] ?? this.mustDepthView() },
        { binding: 12, resource: this.peelViews[2] ?? this.mustDepthView() },
        // The nearest structure surface. Falls back to the scene depth, which
        // makes every occluder look like a structure and so culls nothing — the
        // safe direction when the target does not exist.
        { binding: 13, resource: this.structDepthView ?? this.mustDepthView() },
      ],
    );
  }

  /**
   * A sampleable view of the scene's depth, for the splat shader's occlusion.
   *
   * The heat pass reads the depth the scene pass wrote. That means the texture
   * must not also be *attached* while being read — it is not, the heat target has
   * no depth attachment — and that the binding must exist even before the first
   * scene pass, since a pipeline's bind group layout is fixed.
   */
  private mustDepthView(): GPUTextureView {
    if (!this.depthView) throw new Error('scene depth not created yet');
    return this.depthView;
  }

  // --------------------------------------------------------------- resources

  private uploadInstances(data: Float32Array, count: number): GPUBuffer {
    const needed = align4(count * 8 * 4);
    if (!this.cubeInstanceBuffer || this.cubeInstanceBuffer.size < needed) {
      this.cubeInstanceBuffer?.destroy();
      this.cubeInstanceBuffer = this.device.createBuffer({
        label: 'cube instances',
        size: Math.max(needed, 4096 * 32),
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
    }
    this.device.queue.writeBuffer(
      this.cubeInstanceBuffer,
      0,
      data.buffer,
      data.byteOffset,
      count * 8 * 4,
    );
    return this.cubeInstanceBuffer;
  }

  private uploadLines(
    existing: GPUBuffer | null,
    data: Float32Array,
    vertexCount: number,
    label: string,
  ): GPUBuffer {
    const needed = align4(vertexCount * 7 * 4);
    let buf = existing;
    if (!buf || buf.size < needed) {
      buf?.destroy();
      buf = this.device.createBuffer({
        label,
        size: Math.max(needed, 8192 * 28),
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
    }
    this.device.queue.writeBuffer(buf, 0, data.buffer, data.byteOffset, vertexCount * 7 * 4);
    return buf;
  }

  private ensureGrid(params: FrameParams): void {
    const sig = `${params.gridSpacing}|${params.gridExtent}|${params.showGrid}|${params.showAxes}`;
    if (sig === this.lineSignature && this.lineBuffer) return;
    this.lineSignature = sig;
    const verts = buildGridVertices(
      params.gridSpacing,
      params.gridExtent,
      params.showGrid,
      params.showAxes,
    );
    this.lineBuffer?.destroy();
    this.lineBuffer = this.makeBuffer(verts, GPUBufferUsage.VERTEX, 'grid');
    this.lineVertexCount = verts.length / 7;
  }

  private ensureTargets(
    width: number,
    height: number,
    heatScale: number,
    heatChannels: 1 | 4,
  ): void {
    const hw = Math.max(1, Math.round(width * heatScale));
    const hh = Math.max(1, Math.round(height * heatScale));
    // The accumulation format follows the mode, so a change of it has to
    // reallocate exactly as a change of size does.
    const format: GPUTextureFormat =
      heatChannels === 4
        ? this.heatF32
          ? 'rgba32float'
          : 'rgba16float'
        : this.heatF32
          ? 'r32float'
          : 'r16float';
    if (
      width === this.width &&
      height === this.height &&
      hw === this.heatWidth &&
      hh === this.heatHeight &&
      format === this.heatFormat &&
      this.sceneTex
    ) {
      return;
    }
    this.width = width;
    this.height = height;
    this.heatWidth = hw;
    this.heatHeight = hh;
    this.heatFormat = format;
    this.heatTexelBytes = (this.heatF32 ? 4 : 2) * heatChannels;
    this.canvas.width = width;
    this.canvas.height = height;

    this.sceneTex?.destroy();
    this.depthTex?.destroy();
    this.heatTex?.destroy();
    // Any cached bind group holds a view of a texture that no longer exists.
    this.targetGeneration++;
    this.bindCache.clear();

    this.sceneTex = this.device.createTexture({
      label: 'scene',
      size: [width, height],
      format: SCENE_FORMAT,
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });
    this.sceneView = this.sceneTex.createView();
    this.depthTex = this.device.createTexture({
      label: 'depth',
      size: [width, height],
      format: DEPTH_FORMAT,
      // Sampleable as well as attachable: depth of field reads it in the
      // composite to work out how far out of focus each pixel is.
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });
    this.depthView = this.depthTex.createView();

    // Depth-only targets for the peeled layers. Attachable so a peel pass can
    // write one, sampleable so the next peel pass and the heat pass can read it.
    for (const t of this.peelTex) t.destroy();
    this.peelTex = [];
    this.peelViews = [];
    for (let i = 0; i < HEAT_DEPTH_LAYERS; i++) {
      const tex = this.device.createTexture({
        label: `depth peel ${i}`,
        size: [width, height],
        format: DEPTH_FORMAT,
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      });
      this.peelTex.push(tex);
      this.peelViews.push(tex.createView());
    }

    // ...and one more of the same, holding the nearest structure surface so the
    // heat pass can tell a wall from a hillside. See renderStructureDepth.
    this.structDepthTex?.destroy();
    this.structDepthTex = this.device.createTexture({
      label: 'structure depth',
      size: [width, height],
      format: DEPTH_FORMAT,
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });
    this.structDepthView = this.structDepthTex.createView();

    this.heatTex = this.device.createTexture({
      label: 'heat',
      size: [hw, hh],
      format: this.heatFormat,
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT |
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_SRC,
    });
    this.heatView = this.heatTex.createView();

    // One frame's estimate, accumulated from zero and then blended into the
    // history above. See `mergeHeat`: splatting a fractional frame straight into
    // the accumulator makes every sprite's contribution a small fraction of a much
    // larger running total, which a half-float target rounds away.
    this.heatScratchTex?.destroy();
    this.heatScratchTex = this.device.createTexture({
      label: 'heat scratch',
      size: [hw, hh],
      format: this.heatFormat,
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });
    this.heatScratchView = this.heatScratchTex.createView();

    // The heat pass has no depth attachment any more — see buildHeatPipeline —
    // so this generation counter is what keeps its bind groups from holding a
    // view of a depth texture this resize has just replaced.
    this.depthGeneration++;
  }

  /**
   * Accumulated heat at one canvas pixel.
   *
   * WebGPU readback is asynchronous, so this returns the most recently completed
   * sample and schedules the next. A cursor readout one frame stale is
   * indistinguishable from a live one; blocking the queue to avoid it would not be.
   */
  readHeatAt(canvasX: number, canvasY: number, divisor: number): number | null {
    if (!this.probePending) void this.probeHeat(canvasX, canvasY, divisor);
    return this.probeValue;
  }

  async probeHeat(
    canvasX: number,
    canvasY: number,
    divisor: number,
  ): Promise<number | null> {
    if (!this.heatTex) return null;
    const hx = Math.floor((canvasX / this.width) * this.heatWidth);
    const hy = Math.floor((canvasY / this.height) * this.heatHeight);
    if (hx < 0 || hy < 0 || hx >= this.heatWidth || hy >= this.heatHeight) return null;
    // One readback in flight at a time; the buffer cannot be mapped twice.
    if (this.probePending) return this.probeValue;

    this.probePending = true;
    this.probeFrames = Math.max(1, divisor);
    let mapped = false;
    try {
      const encoder = this.device.createCommandEncoder({ label: 'probe' });
      encoder.copyTextureToBuffer(
        { texture: this.heatTex, origin: { x: hx, y: hy } },
        { buffer: this.probeBuffer, bytesPerRow: 256 },
        [1, 1],
      );
      this.device.queue.submit([encoder.finish()]);
      await this.probeBuffer.mapAsync(GPUMapMode.READ);
      mapped = true;
      const range = this.probeBuffer.getMappedRange();
      // R is the density channel in every format, and it is first, so the offset
      // is zero whether the texel is one channel or four.
      const raw = this.heatF32
        ? new Float32Array(range)[0]
        : halfToFloat(new Uint16Array(range)[0]);
      this.probeValue = Number.isFinite(raw) ? raw / this.probeFrames : null;
    } catch {
      this.probeValue = null;
    } finally {
      // In the finally for the same reason as in readHeatField: a buffer left
      // mapped breaks every subsequent submit that touches it, not just this read.
      if (mapped) {
        try {
          this.probeBuffer.unmap();
        } catch {
          /* already unmapped or destroyed */
        }
      }
      this.probePending = false;
    }
    return this.probeValue;
  }

  /**
   * Read the heat texture and return the magnitudes, subsampled.
   *
   * `copyTextureToBuffer` needs each row padded to a 256-byte multiple, so the
   * walk below strides by the padded row length rather than the texture width.
   * Getting that wrong reads a diagonal smear of the image and produces a
   * plausible-looking but wrong distribution.
   */
  async readHeatField(maxSamples: number): Promise<Float32Array | null> {
    if (!this.heatTex || this.heatWidth <= 0 || this.heatHeight <= 0) return null;
    // One reader at a time: a buffer cannot be mapped twice, and overlapping
    // multi-megabyte readbacks were enough to take the whole page down.
    if (this.fieldPending) return null;
    const bytesPerTexel = this.heatTexelBytes;
    const bytesPerRow = Math.ceil((this.heatWidth * bytesPerTexel) / 256) * 256;
    const size = bytesPerRow * this.heatHeight;

    // Reused rather than allocated per call. This is megabytes at a time, and
    // creating and destroying it on every exposure metering churns the device
    // hard enough to be unstable on a software adapter.
    if (!this.fieldBuffer || this.fieldBuffer.size < size) {
      this.fieldBuffer?.destroy();
      this.fieldBuffer = this.device.createBuffer({
        label: 'heat field readback',
        size,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
      });
    }
    const staging = this.fieldBuffer;
    this.fieldPending = true;
    let mapped = false;
    try {
      const encoder = this.device.createCommandEncoder({ label: 'heat field' });
      encoder.copyTextureToBuffer(
        { texture: this.heatTex },
        { buffer: staging, bytesPerRow },
        [this.heatWidth, this.heatHeight],
      );
      this.device.queue.submit([encoder.finish()]);
      await staging.mapAsync(GPUMapMode.READ, 0, size);
      mapped = true;
      const range = staging.getMappedRange(0, size);

      const texels = this.heatWidth * this.heatHeight;
      const stride = Math.max(1, Math.floor(texels / Math.max(1, maxSamples)));
      const out = new Float32Array(Math.ceil(texels / stride));
      let n = 0;
      for (let i = 0; i < texels; i += stride) {
        const y = Math.floor(i / this.heatWidth);
        const x = i - y * this.heatWidth;
        const byte = y * bytesPerRow + x * bytesPerTexel;
        // Only R, the density channel. Exposure metering is about how much heat
        // there is, which is the same question in every mode.
        const v = this.heatF32
          ? new Float32Array(range, byte, 1)[0]
          : halfToFloat(new Uint16Array(range, byte, 1)[0]);
        out[n++] = Number.isFinite(v) ? Math.abs(v) : 0;
      }
      return out.subarray(0, n);
    } catch {
      return null;
    } finally {
      /**
       * Unmap on every path out, including a throw.
       *
       * This used to sit at the end of the try, and a buffer left mapped is not a
       * lost readback — it is a permanently broken device from that point on:
       * every later frame that references it fails validation with `used in
       * submit while mapped`, and the console fills with an error whose cause is
       * nowhere near where it appears. The window is small (a bad byte offset in
       * the walk above would do it) and the consequence is unbounded, which is
       * the wrong way round for a `try` to be arranged.
       *
       * Wrapped, because `unmap` on a buffer that is not mapped throws, and a
       * throw in a `finally` would replace the real error with this one.
       */
      if (mapped) {
        try {
          staging.unmap();
        } catch {
          /* already unmapped or destroyed */
        }
      }
      this.fieldPending = false;
    }
  }

  dispose(): void {
    for (const c of this.chunks) {
      c.positions.destroy();
      c.times?.destroy();
      c.filterValues?.destroy();
      c.lineStarts?.destroy();
    }
    this.chunks = [];
    this.setLevel(null);
    this.setWorldTiles([]);
    this.sceneTex?.destroy();
    this.depthTex?.destroy();
    this.heatTex?.destroy();
    this.heatScratchTex?.destroy();
    this.captureTex?.destroy();
    this.captureBuffer?.destroy();
    this.fieldBuffer?.destroy();
    this.lutTexture.destroy();
    this.curveTexture.destroy();
    this.uniforms.destroy();
    this.bindCache.clear();
    for (const b of [
      this.blockBuffer,
      this.filterMaskBuffer,
      this.emptyStorage,
      this.teamSignBuffer,
      this.cubeVertexBuffer,
      this.cubeIndexBuffer,
      this.lookVertexBuffer,
      this.probeBuffer,
    ]) {
      b.destroy();
    }
    this.cubeInstanceBuffer?.destroy();
    this.lineBuffer?.destroy();
    this.trailBuffer?.destroy();
    this.overlayBuffer?.destroy();
    this.triBuffer?.destroy();
    this.figures?.dispose();
    this.figures = null;
    this.tracks?.dispose();
    this.tracks = null;
    this.device.destroy();
  }
}

// ---------------------------------------------------------------- helpers

/**
 * A ring of 256-byte-aligned uniform slots.
 *
 * This exists because of a WebGPU rule that is easy to miss and produces a
 * plausible-looking wrong picture rather than an error: `queue.writeBuffer` is
 * ordered on the *queue*, not interleaved with the commands being encoded. Write
 * the same uniform buffer once per draw and then submit, and every draw sees the
 * value from the last write — so all chunks render with the final chunk's AABB
 * and every scene pass with the final pass's settings.
 *
 * The fix is to give each draw its own region of one buffer, written before the
 * pass and bound by offset. 256 is `minUniformBufferOffsetAlignment`'s default
 * and comfortably larger than the biggest struct here.
 */
class UniformRing {
  private readonly buffer: GPUBuffer;
  private readonly stride: number;
  private cursor = 0;

  /**
   * `minBytes` is the largest struct that will be written. The stride is rounded
   * up from it to a multiple of 256, which is `minUniformBufferOffsetAlignment`'s
   * default — a bound offset that is not a multiple of it is a validation error.
   */
  constructor(
    private readonly device: GPUDevice,
    slots: number,
    label: string,
    minBytes = 256,
  ) {
    this.stride = Math.max(256, Math.ceil(minBytes / 256) * 256);
    this.buffer = device.createBuffer({
      label,
      size: slots * this.stride,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  }

  get slots(): number {
    return this.buffer.size / this.stride;
  }

  reset(): void {
    this.cursor = 0;
  }

  /** Copy `bytes` from `data` into a fresh slot; returns its byte offset. */
  push(data: Float32Array, bytes: number): number {
    // Wrapping rather than growing: a frame that needs more slots than this has
    // a draw-call problem, and silently reusing a slot is better than failing.
    const slot = this.cursor % this.slots;
    this.cursor++;
    const offset = slot * this.stride;
    this.device.queue.writeBuffer(this.buffer, offset, data.buffer, 0, bytes);
    return offset;
  }

  binding(offset: number, size: number): GPUBufferBinding {
    return { buffer: this.buffer, offset, size };
  }

  destroy(): void {
    this.buffer.destroy();
  }
}

/**
 * Entries in each of the two sign tables.
 *
 * Matches the category-mask width, which is also the most groups a load keeps
 * (`MAX_GROUPS`). 32KB for both, which is not worth sizing dynamically.
 */
const SIGN_TABLE_SIZE = FILTER_MASK_WIDTH;

const EMPTY_INDICES = new Uint32Array(0);

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
interface GpuMesh {
  vertexBuffer: GPUBuffer;
  /**
   * Captured vertex colour, or constant white when the mesh has none.
   *
   * Always allocated, so the pipeline's vertex layout never changes and there is
   * one mesh shader rather than two.
   */
  colourBuffer: GPUBuffer;
  uvBuffer: GPUBuffer;
  /** Per-vertex tile numbers; zeroed on a mesh without a repeating texture. */
  tileBuffer: GPUBuffer;
  tileTable: GPUBuffer | null;
  /** The level's atlas once decoded, or a tile's own image; null without one. */
  texture: GPUTexture | null;
  /**
   * How many of the texture's mip levels hold the picture yet, when not all:
   * a tile's image is drawn from its top level until the rest are filled in.
   */
  textureLevels: number | null;
  groundBuffer: GPUBuffer | null;
  structBuffer: GPUBuffer | null;
  wireBuffer: GPUBuffer | null;
  waterBuffer: GPUBuffer | null;
  groundCount: number;
  structCount: number;
  wireCount: number;
  waterCount: number;
  /** Ground edges, built the first time the ground is asked for as a wireframe. */
  groundWireBuffer: GPUBuffer | null;
  groundWireCount: number;
  /** Kept so the ground's edge list can be built on demand rather than upfront. */
  groundIndices: Uint32Array;
  /** GPU footprint, growing as the texture and the ground's edges arrive. */
  bytes: number;
  /** For culling; null for the level, which is always drawn. */
  bounds: Bounds | null;
  /** A world tile, drawn with `LevelDraw.tiles` where the level's own look is resolved from its contents. */
  tile: boolean;
  /** Atlas bind groups by pipeline, dropped whenever `texture` changes. */
  atlasGroups: Map<GPURenderPipeline, GPUBindGroup>;
  /** Set when freed, so a texture still decoding is not attached to it. */
  freed: boolean;
}

/** The uniform slots of one frame's level and tile passes; see `pushMeshUniforms`. */
interface MeshSlots {
  /** By `groundKey`: the level and the tiles can differ in colour and texture. */
  ground: Map<string, number>;
  /** [without a texture, with one]. */
  struct: [number, number];
  seal: [number, number];
  wire: number;
  groundWire: number;
  water: number;
}

function groundKey(colour: boolean, textured: boolean): string {
  return `${colour ? 1 : 0}${textured ? 1 : 0}`;
}

function alphaBlend(): GPUBlendState {
  return {
    color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
    alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
  };
}

function align4(n: number): number {
  return (n + 3) & ~3;
}

function clampU16(v: number): number {
  return v < 0 ? 0 : v > 65535 ? 65535 : Math.round(v);
}

/** Unit cube centred on the origin, 4 verts per face so normals stay flat. */
function buildCubeGeometry(): { vertices: Float32Array; indices: Uint16Array } {
  const faces: Array<[number[], number[], number[], number[], number[]]> = [
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
  const push = (x: number, y: number, z: number, r: number, g: number, b: number, a: number) => {
    out.push(x, y, z, r, g, b, a);
  };

  if (showGrid && spacing > 0) {
    const n = Math.min(2000, Math.floor(extent / spacing));
    for (let i = -n; i <= n; i++) {
      if (i === 0) continue; // drawn as a coloured axis below
      const p = i * spacing;
      const major = i % 10 === 0;
      const c = major ? 0.34 : 0.2;
      const a = major ? 0.85 : 0.5;
      push(-extent, 0, p, c, c, c * 1.06, a);
      push(extent, 0, p, c, c, c * 1.06, a);
      push(p, 0, -extent, c, c, c * 1.06, a);
      push(p, 0, extent, c, c, c * 1.06, a);
    }
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







