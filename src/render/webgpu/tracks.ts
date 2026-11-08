/**
 * The GPU tracks in the WebGPU renderer: the store's tracks and keys uploaded
 * once, each frame a compute pass that places every unit at the playhead and
 * fills one instance run a mesh, then one indirect draw a mesh with the
 * instanced figure pipeline. The CPU writes the uniforms and a few bytes of
 * counters; nothing per unit.
 */

import { INSTANCE_STRIDE } from '../../figures/instances';
import { KEY_U32, KEYS_PER_BUFFER, sameKeys, type GpuTrackStore } from '../gpuTracks/store';
import { FINISH_WGSL, MARKS_WGSL, PLACE_WGSL, TRAIL_WGSL } from '../gpuTracks/shader';
import { TRAIL_SEGMENTS_GL } from '../gpuTracks/glsl';
import type { GpuFigures } from './figures';

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
}

/** Groups of 64 for `n` threads, in rows of at most 65535 groups (the shader counts rows by `num_workgroups`). */
function dispatch(pass: GPUComputePassEncoder, n: number): void {
  const groups = Math.ceil(n / 64);
  if (!groups) return;
  const x = Math.min(groups, 65535);
  pass.dispatchWorkgroups(x, Math.ceil(groups / x));
}

/** Pixels across a death's marker. */
const MARKER_PX = 9;
/** Uniform bytes. */
const U_BYTES = 160;

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
  /** GPU bytes held, for the stats. */
  bytes = 0;

  constructor(
    private readonly device: GPUDevice,
    colorFormat: GPUTextureFormat,
    depthFormat: GPUTextureFormat,
  ) {
    this.place = device.createComputePipeline({ label: 'tracks place', layout: 'auto', compute: { module: device.createShaderModule({ label: 'tracks place', code: PLACE_WGSL }), entryPoint: 'place' } });
    this.finish = device.createComputePipeline({ label: 'tracks finish', layout: 'auto', compute: { module: device.createShaderModule({ label: 'tracks finish', code: FINISH_WGSL }), entryPoint: 'finish' } });
    this.marks = device.createComputePipeline({ label: 'tracks marks', layout: 'auto', compute: { module: device.createShaderModule({ label: 'tracks marks', code: MARKS_WGSL }), entryPoint: 'marks' } });
    this.uniform = device.createBuffer({ label: 'tracks uniforms', size: U_BYTES, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.meshCountBuf = device.createBuffer({ label: 'tracks mesh count', size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    const tm = device.createShaderModule({ label: 'tracks trail', code: TRAIL_WGSL });
    this.trailPipeline = device.createRenderPipeline({
      label: 'tracks trail',
      layout: 'auto',
      vertex: { module: tm, entryPoint: 'vsTrail', buffers: [{ arrayStride: 32, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x4' }, { shaderLocation: 1, offset: 16, format: 'float32x4' }] }] },
      fragment: { module: tm, entryPoint: 'fsTrail', targets: [{ format: colorFormat, blend: { color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' }, alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' } } }] },
      primitive: { topology: 'line-list' },
      depthStencil: { format: depthFormat, depthWriteEnabled: false, depthCompare: 'less-equal' },
    });
  }

  private upload(s: GpuTrackStore, triangleBudget: number): Uploaded {
    const dev = this.device;
    const buf = (label: string, data: ArrayBufferView, usage: number) => {
      const b = dev.createBuffer({ label, size: Math.max(16, Math.ceil(data.byteLength / 4) * 4), usage: usage | GPUBufferUsage.COPY_DST });
      dev.queue.writeBuffer(b, 0, data.buffer, data.byteOffset, data.byteLength);
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
    const keysA1 = buf('track keys (2)', s.keys > KEYS_PER_BUFFER ? s.keysA.subarray(KEYS_PER_BUFFER * KEY_U32) : new Uint32Array(4), S);
    const keysB = buf('track attitudes', s.keysB, S);
    // A run per mesh: the dart's holds every track; a figure's as many as it has tracks, within the triangle budget.
    const M = s.meshes.length;
    const runFirst = new Uint32Array(M);
    const runRoom = new Uint32Array(M);
    let total = 0;
    for (let m = 0; m < M; m++) {
      const tris = s.meshes[m].count / 3;
      runRoom[m] = m === 0 ? s.tracks : Math.min(s.meshTracks[m], Math.floor(triangleBudget / Math.max(1, tris)));
      runFirst[m] = total;
      total += runRoom[m];
    }
    const runsData = new Uint32Array(M * 2);
    for (let m = 0; m < M; m++) {
      runsData[m * 2] = runFirst[m];
      runsData[m * 2 + 1] = runRoom[m];
    }
    const runs = buf('track runs', runsData, S);
    const counts = dev.createBuffer({ label: 'track counts', size: Math.max(16, (M + 1) * 4), usage: S | GPUBufferUsage.COPY_DST });
    const argsInit = new Uint32Array(M * 4);
    for (let m = 0; m < M; m++) argsInit[m * 4] = s.meshes[m].count;
    const args = buf('track draws', argsInit, S | GPUBufferUsage.INDIRECT);
    const instances = dev.createBuffer({ label: 'track instances', size: Math.max(64, total * INSTANCE_STRIDE * 4), usage: S | GPUBufferUsage.VERTEX });
    const trail = dev.createBuffer({ label: 'track trails', size: TRAIL_ROOM * 32, usage: S | GPUBufferUsage.VERTEX });
    const trailArgs = buf('track trail draw', new Uint32Array([0, 1, 0, 0]), S | GPUBufferUsage.INDIRECT);
    const vis = dev.createBuffer({ label: 'track visibility', size: Math.max(16, Math.ceil(s.tracks / 32) * 4), usage: S | GPUBufferUsage.COPY_DST });
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
    const up = this.up;
    const s = f.store;
    const fl = new Float32Array(this.u);
    const ui = new Uint32Array(this.u);
    fl.set(f.viewProj, 0);
    fl[16] = f.camera[0];
    fl[17] = f.camera[1];
    fl[18] = f.camera[2];
    fl[19] = f.t;
    fl[20] = f.focalPx;
    fl[21] = f.orthoPx;
    fl[22] = f.minPixels;
    fl[23] = f.stale;
    fl[24] = s.units;
    fl[25] = f.scale;
    fl[26] = f.fullPx;
    fl[27] = f.dartPx;
    ui[28] = s.tracks;
    ui[29] = s.meshes.length;
    ui[30] = TRAIL_ROOM;
    ui[31] = TRAIL_SEGMENTS;
    fl[32] = f.trailSeconds;
    const weapons = f.weapons ?? 1.5;
    fl[33] = weapons > 0 ? weapons : -1;
    const markSeconds = up.markGroup ? (f.markerSeconds ?? 0) : 0;
    fl[34] = markSeconds;
    fl[35] = MARKER_PX;
    ui[36] = s.markers?.count ?? 0;
    ui[37] = f.visible ? 0 : 1;
    const drop = f.dropFloor ?? null;
    ui[38] = drop === null ? 0 : 1;
    fl[39] = drop ?? 0;
    if (f.visible && f.visible !== up.visSent) this.device.queue.writeBuffer(up.vis, 0, f.visible.buffer, f.visible.byteOffset, Math.min(f.visible.byteLength, up.vis.size));
    up.visSent = f.visible ?? null;
    this.trailsOn = f.trailSeconds > 0 || weapons > 0 || markSeconds > 0 || drop !== null;
    this.device.queue.writeBuffer(this.uniform, 0, this.u);
    this.device.queue.writeBuffer(this.meshCountBuf, 0, new Uint32Array([s.meshes.length, TRAIL_ROOM, 0, 0]));
    // Counters to zero, and the draws' instance counts with them.
    this.device.queue.writeBuffer(up.counts, 0, new Uint32Array(Math.max(4, s.meshes.length + 1)));
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
    pass.dispatchWorkgroups(Math.ceil((s.meshes.length + 1) / 64));
    pass.end();
  }

  /** The draws, inside the scene pass: one indirect instanced draw a mesh. */
  draw(pass: GPURenderPassEncoder, figures: GpuFigures, bindGroup: GPUBindGroup): void {
    const up = this.up;
    if (!up) return;
    figures.drawIndirect(pass, up.store.meshes, up.instances, up.runFirst, up.runRoom, up.args, bindGroup);
  }

  /** The trails, inside the scene pass after the figures: one indirect line draw. */
  drawTrails(pass: GPURenderPassEncoder, bindGroup: GPUBindGroup): void {
    const up = this.up;
    if (!up || !this.trailsOn) return;
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
