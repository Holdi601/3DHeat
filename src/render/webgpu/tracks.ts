/**
 * The GPU tracks in the WebGPU renderer: the store's tracks and keys uploaded
 * once, each frame a compute pass that places every unit at the playhead and
 * fills one instance run a mesh, then one indirect draw a mesh with the
 * instanced figure pipeline. The CPU writes the uniforms and a few bytes of
 * counters; nothing per unit.
 */

import { GPU_DEPTH_TEST } from '../depth';
import { INSTANCE_STRIDE } from '../../figures/instances';
import { KEY_U32, KEYS_PER_BUFFER, sameKeys, type GpuTrackStore } from '../gpuTracks/store';
import { FINISH_WGSL, MARKS_WGSL, PLACE_WGSL, TRAIL_WGSL } from '../gpuTracks/shader';
import { TRAIL_SEGMENTS_GL } from '../gpuTracks/glsl';
import { visWords } from '../gpuTracks/visibility';
import { TRACKS_UNIFORM_BYTES, trackRuns, writeTracksUniform } from '../gpuTracks/gpuLayout';
import type { GpuFigures } from './figures';
import type { GpuSymbols } from './symbols';
import type { SymbolParams } from '../types';

export interface GpuTracksFrame {
  store: GpuTrackStore;
  /** Playhead, dataset seconds. */
  t: number;
  viewProj: Float32Array;
  camera: ArrayLike<number>;
  /** Focal length in pixels (perspective), or 0 and the pixel size (orthographic). */
  focalPx: number;
  orthoPx: number;
  minPixels: number;
  stale: number;
  /** Data units at true size (units a metre times the figure scale). */
  scale: number;
  /** True-size length on screen from which the full figure is drawn, and below which a dart. */
  fullPx: number;
  dartPx: number;
  /** Most triangles the figures may come to; a mesh's run holds what fits in it. */
  triangleBudget: number;
  /** Seconds of trail behind each unit; 0 none. */
  trailSeconds: number;
  /** Drop lines from each unit down to this height (the data's floor); null or absent: none. */
  dropFloor?: number | null;
  /** One bit a track, set when shown; null: all. */
  visible?: Uint32Array | null;
  /** Seconds of streak behind a weapon; 0 hides weapons. */
  weapons?: number;
  /** Seconds a death stays marked; 0 none. */
  markerSeconds?: number;
  /** Far off: 0 figure, 1 arrow, 2 symbol (`symbols/lod.ts`). */
  farMode?: number;
  symbolThreshold?: number;
  symbolPx?: number;
  /** Drop lines under weapons in flight too. */
  weaponDrops?: boolean;
}

/** Groups of 64 for `n` threads, in rows of at most 65535 groups (the shader counts rows by `num_workgroups`). */
function dispatch(pass: GPUComputePassEncoder, n: number): void {
  const groups = Math.ceil(n / 64);
  if (!groups) return;
  const x = Math.min(groups, 65535);
  pass.dispatchWorkgroups(x, Math.ceil(groups / x));
}

/** Uniform bytes. */
const U_BYTES = TRACKS_UNIFORM_BYTES;
/** Bytes a write of the keys carries, and milliseconds a frame may spend on them; see `flushWrites`. */
const TRACK_WRITE_BYTES = 4 * 1024 * 1024;
const TRACK_WRITE_MS = 3;

/** Trail vertices the buffer holds: 32 bytes each, 128 MB. */
const TRAIL_ROOM = 4_000_000;
/** Most trail segments a unit: the same on WebGL2 (`gpuTracks/glsl.ts`). */
const TRAIL_SEGMENTS = TRAIL_SEGMENTS_GL;

interface Uploaded {
  store: GpuTrackStore;
  tracks: GPUBuffer;
  keysA: GPUBuffer;
  keysA1: GPUBuffer;
  keysB: GPUBuffer;
  runs: GPUBuffer;
  runFirst: Uint32Array;
  runRoom: Uint32Array;
  counts: GPUBuffer;
  args: GPUBuffer;
  argsInit: Uint32Array;
  instances: GPUBuffer;
  trail: GPUBuffer;
  trailArgs: GPUBuffer;
  vis: GPUBuffer;
  /** The visibility bits last sent, to send them again only when they change. */
  visSent: Uint32Array | null | undefined;
  marks: GPUBuffer | null;
  markColour: GPUBuffer | null;
  markGroup: GPUBindGroup | null;
  placeGroup: GPUBindGroup;
  finishGroup: GPUBindGroup;
  bytes: number;
}

export class GpuTracks {
  private readonly place: GPUComputePipeline;
  private readonly finish: GPUComputePipeline;
  private readonly marks: GPUComputePipeline;
  private readonly uniform: GPUBuffer;
  private readonly meshCountBuf: GPUBuffer;
  private readonly u = new ArrayBuffer(U_BYTES);
  private readonly trailPipeline: GPURenderPipeline;
  private trailsOn = false;
  private up: Uploaded | null = null;
  /** Where the glyphs' run starts in the instances. */
  private glyphFirst = 0;
  /** GPU bytes held, for the stats. */
  bytes = 0;

  private constructor(
    private readonly device: GPUDevice,
    p: { place: GPUComputePipeline; finish: GPUComputePipeline; marks: GPUComputePipeline; trail: GPURenderPipeline },
  ) {
    this.place = p.place;
    this.finish = p.finish;
    this.marks = p.marks;
    this.trailPipeline = p.trail;
    this.uniform = device.createBuffer({ label: 'tracks uniforms', size: U_BYTES, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.meshCountBuf = device.createBuffer({ label: 'tracks mesh count', size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  }

  /**
   * The GPU tracks with their pipelines compiled off the frame: the place shader alone took the GPU process 200 ms
   * to compile, and made on the frame the tracks were first drawn (while a recording played) it held that frame as
   * long. Asked for as soon as a dataset may want tracks (`Renderer.gpuTracksReady`), ready long before they are.
   */
  static async create(device: GPUDevice, colorFormat: GPUTextureFormat, depthFormat: GPUTextureFormat): Promise<GpuTracks> {
    const compute = (label: string, code: string, entryPoint: string) =>
      device.createComputePipelineAsync({ label, layout: 'auto', compute: { module: device.createShaderModule({ label, code }), entryPoint } });
    const tm = device.createShaderModule({ label: 'tracks trail', code: TRAIL_WGSL });
    const [place, finish, marks, trail] = await Promise.all([
      compute('tracks place', PLACE_WGSL, 'place'),
      compute('tracks finish', FINISH_WGSL, 'finish'),
      compute('tracks marks', MARKS_WGSL, 'marks'),
      device.createRenderPipelineAsync({
        label: 'tracks trail',
        layout: 'auto',
        vertex: { module: tm, entryPoint: 'vsTrail', buffers: [{ arrayStride: 32, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x4' }, { shaderLocation: 1, offset: 16, format: 'float32x4' }] }] },
        fragment: { module: tm, entryPoint: 'fsTrail', targets: [{ format: colorFormat, blend: { color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' }, alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' } } }] },
        primitive: { topology: 'line-list' },
        depthStencil: { format: depthFormat, depthWriteEnabled: false, depthCompare: GPU_DEPTH_TEST },
      }),
    ]);
    return new GpuTracks(device, { place, finish, marks, trail });
  }

  /**
   * Writes still to make, a few megabytes a frame; see `flushWrites`.
   *
   * Gigabytes of keys written in one go held the page for seconds, and past
   * 2 GiB of them in one frame the GPU process gave out: the device was lost
   * right after the upload of a 279 M-key overlay. Nothing is placed or drawn
   * until every write is made.
   */
  private writes: { buffer: GPUBuffer; data: ArrayBufferView; offset: number }[] = [];

  /** Whether the tracks are still on their way to the GPU. */
  get uploading(): boolean {
    return this.writes.length > 0;
  }

  private flushWrites(): void {
    const until = performance.now() + TRACK_WRITE_MS;
    while (this.writes.length > 0 && performance.now() < until) {
      const w = this.writes[0];
      const n = Math.min(TRACK_WRITE_BYTES, w.data.byteLength - w.offset);
      this.device.queue.writeBuffer(w.buffer, w.offset, w.data.buffer, w.data.byteOffset + w.offset, n);
      w.offset += n;
      if (w.offset >= w.data.byteLength) this.writes.shift();
    }
  }

  private upload(s: GpuTrackStore, triangleBudget: number): Uploaded {
    const dev = this.device;
    const buf = (label: string, data: ArrayBufferView, usage: number) => {
      const b = dev.createBuffer({ label, size: Math.max(16, Math.ceil(data.byteLength / 4) * 4), usage: usage | GPUBufferUsage.COPY_DST });
      if (data.byteLength > TRACK_WRITE_BYTES) this.writes.push({ buffer: b, data, offset: 0 });
      else dev.queue.writeBuffer(b, 0, data.buffer, data.byteOffset, data.byteLength);
      return b;
    };
    const S = GPUBufferUsage.STORAGE;
    // The turret and gun keys, where there are any, after the tracks in the same buffer (`store.ts`): the place shader finds them there.
    const aimBytes = s.keysAim ? s.trackData.byteLength + s.keysAim.byteLength : 0;
    let trackWords: Uint32Array = s.trackData;
    if (s.keysAim && aimBytes <= dev.limits.maxStorageBufferBindingSize) {
      trackWords = new Uint32Array(s.trackData.length + s.keysAim.length);
      trackWords.set(s.trackData);
      trackWords.set(s.keysAim, s.trackData.length);
    }
    const tracks = buf('tracks', trackWords, S);
    // The keys in two buffers when there are more than one may hold.
    const keysA = buf('track keys', s.keysA.subarray(0, Math.min(s.keys, KEYS_PER_BUFFER) * KEY_U32), S);
    // Only the keys there are: the array past them is room the load did not use.
    const keysA1 = buf('track keys (2)', s.keys > KEYS_PER_BUFFER ? s.keysA.subarray(KEYS_PER_BUFFER * KEY_U32, s.keys * KEY_U32) : new Uint32Array(4), S);
    const keysB = buf('track attitudes', s.keysB, S);
    // A run per mesh, then the glyphs' run (`gpuLayout.ts`).
    const M = s.meshes.length;
    const { runFirst, runRoom, runsData, argsInit, glyphFirst, total } = trackRuns(s, triangleBudget);
    this.glyphFirst = glyphFirst;
    const runs = buf('track runs', runsData, S);
    const counts = dev.createBuffer({ label: 'track counts', size: Math.max(16, (M + 2) * 4), usage: S | GPUBufferUsage.COPY_DST });
    const args = buf('track draws', argsInit, S | GPUBufferUsage.INDIRECT);
    const instances = dev.createBuffer({ label: 'track instances', size: Math.max(64, total * INSTANCE_STRIDE * 4), usage: S | GPUBufferUsage.VERTEX });
    const trail = dev.createBuffer({ label: 'track trails', size: TRAIL_ROOM * 32, usage: S | GPUBufferUsage.VERTEX });
    const trailArgs = buf('track trail draw', new Uint32Array([0, 1, 0, 0]), S | GPUBufferUsage.INDIRECT);
    // The shown bits, and as many again for the greyed ones (`visibility.ts` withHidden).
    const vis = dev.createBuffer({ label: 'track visibility', size: Math.max(16, 2 * visWords(s) * 4), usage: S | GPUBufferUsage.COPY_DST });
    const mk = s.markers && s.markers.count ? s.markers : null;
    const marks = mk ? buf('track marks', mk.data, S) : null;
    const markColour = mk ? buf('track mark colours', mk.colour, S) : null;
    const markGroup =
      marks && markColour
        ? dev.createBindGroup({
            layout: this.marks.getBindGroupLayout(0),
            entries: [
              { binding: 0, resource: { buffer: this.uniform } },
              { binding: 1, resource: { buffer: marks } },
              { binding: 2, resource: { buffer: markColour } },
              { binding: 3, resource: { buffer: counts } },
              { binding: 4, resource: { buffer: trail } },
            ],
          })
        : null;
    const placeGroup = dev.createBindGroup({
      layout: this.place.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.uniform } },
        { binding: 1, resource: { buffer: tracks } },
        { binding: 2, resource: { buffer: keysA } },
        { binding: 3, resource: { buffer: keysB } },
        { binding: 4, resource: { buffer: runs } },
        { binding: 5, resource: { buffer: counts } },
        { binding: 6, resource: { buffer: instances } },
        { binding: 7, resource: { buffer: trail } },
        { binding: 8, resource: { buffer: vis } },
        { binding: 9, resource: { buffer: keysA1 } },
      ],
    });
    const finishGroup = dev.createBindGroup({
      layout: this.finish.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: runs } },
        { binding: 1, resource: { buffer: counts } },
        { binding: 2, resource: { buffer: args } },
        { binding: 3, resource: { buffer: this.meshCountBuf } },
        { binding: 4, resource: { buffer: trailArgs } },
      ],
    });
    const bytes = tracks.size + keysA.size + keysA1.size + keysB.size + runs.size + counts.size + args.size + instances.size + trail.size + vis.size + (marks?.size ?? 0) + (markColour?.size ?? 0);
    return { store: s, tracks, keysA, keysA1, keysB, runs, runFirst, runRoom, counts, args, argsInit, instances, trail, trailArgs, vis, visSent: undefined, marks, markColour, markGroup, placeGroup, finishGroup, bytes };
  }

  private release(): void {
    const u = this.up;
    if (!u) return;
    for (const b of [u.tracks, u.keysA, u.keysA1, u.keysB, u.runs, u.counts, u.args, u.instances, u.trail, u.trailArgs, u.vis, u.marks, u.markColour]) b?.destroy();
    this.writes = [];
    this.up = null;
    this.bytes = 0;
  }

  /** Places every unit: a compute pass into `encoder`, before the scene pass that draws them. */
  compute(encoder: GPUCommandEncoder, f: GpuTracksFrame, timestampWrites?: GPUComputePassTimestampWrites): void {
    if (this.up && this.up.store !== f.store && sameKeys(this.up.store, f.store)) {
      // Recoloured: only the tracks' table again, not gigabytes of keys.
      this.device.queue.writeBuffer(this.up.tracks, 0, f.store.trackData.buffer, f.store.trackData.byteOffset, f.store.trackData.byteLength);
      if (this.up.markColour && f.store.markers) this.device.queue.writeBuffer(this.up.markColour, 0, f.store.markers.colour.buffer, f.store.markers.colour.byteOffset, f.store.markers.colour.byteLength);
      this.up.store = f.store;
    }
    if (!this.up || this.up.store !== f.store) {
      this.release();
      this.up = this.upload(f.store, f.triangleBudget);
      this.bytes = this.up.bytes;
    }
    if (this.writes.length > 0) {
      this.flushWrites();
      if (this.writes.length > 0) return;
    }
    const up = this.up;
    const s = f.store;
    const { markSeconds, trailsOn } = writeTracksUniform(this.u, f, f.viewProj, f.camera, { trailRoom: TRAIL_ROOM, trailSegments: TRAIL_SEGMENTS, marks: !!up.markGroup });
    if (f.visible && f.visible !== up.visSent) this.device.queue.writeBuffer(up.vis, 0, f.visible.buffer, f.visible.byteOffset, Math.min(f.visible.byteLength, up.vis.size));
    up.visSent = f.visible ?? null;
    this.trailsOn = trailsOn;
    this.device.queue.writeBuffer(this.uniform, 0, this.u);
    this.device.queue.writeBuffer(this.meshCountBuf, 0, new Uint32Array([s.meshes.length, TRAIL_ROOM, 0, 0]));
    // Counters to zero, and the draws' instance counts with them.
    this.device.queue.writeBuffer(up.counts, 0, new Uint32Array(Math.max(4, s.meshes.length + 2)));
    this.device.queue.writeBuffer(up.args, 0, up.argsInit);
    const pass = encoder.beginComputePass({ label: 'tracks', timestampWrites });
    pass.setPipeline(this.place);
    pass.setBindGroup(0, up.placeGroup);
    dispatch(pass, s.tracks);
    if (up.markGroup && markSeconds > 0) {
      pass.setPipeline(this.marks);
      pass.setBindGroup(0, up.markGroup);
      dispatch(pass, s.markers?.count ?? 0);
    }
    pass.setPipeline(this.finish);
    pass.setBindGroup(0, up.finishGroup);
    pass.dispatchWorkgroups(Math.ceil((s.meshes.length + 2) / 64));
    pass.end();
  }

  /** The draws, inside the scene pass: one indirect instanced draw a mesh. */
  draw(pass: GPURenderPassEncoder, figures: GpuFigures, bindGroup: GPUBindGroup): void {
    const up = this.up;
    if (!up || this.writes.length > 0) return;
    figures.drawIndirect(pass, up.store.meshes, up.instances, up.runFirst, up.runRoom, up.args, bindGroup);
  }

  /** The glyphs (symbols, weapons, decoys), inside the scene pass after the trails: one indirect quad draw. */
  drawGlyphs(pass: GPURenderPassEncoder, glyphs: GpuSymbols, p: SymbolParams, viewProj: Float32Array, camera: ArrayLike<number>, w: number, h: number): void {
    const up = this.up;
    if (!up || this.writes.length > 0) return;
    glyphs.drawIndirect(pass, p, viewProj, camera, w, h, up.instances, this.glyphFirst, up.args, up.store.meshes.length * 16);
  }

  /** The trails, inside the scene pass after the figures: one indirect line draw. */
  drawTrails(pass: GPURenderPassEncoder, bindGroup: GPUBindGroup): void {
    const up = this.up;
    if (!up || !this.trailsOn || this.writes.length > 0) return;
    pass.setPipeline(this.trailPipeline);
    pass.setBindGroup(0, bindGroup);
    pass.setVertexBuffer(0, up.trail);
    pass.drawIndirect(up.trailArgs, 0);
  }

  get trailLayout(): GPUBindGroupLayout {
    return this.trailPipeline.getBindGroupLayout(0);
  }

  dispose(): void {
    this.release();
    this.uniform.destroy();
    this.meshCountBuf.destroy();
  }
}
