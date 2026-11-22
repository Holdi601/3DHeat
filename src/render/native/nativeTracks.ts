/**
 * The GPU tracks in the native viewport (Stage 5): what `webgpu/tracks.ts` does
 * on the page, split between the page and the viewport (`native/crates/viewport/src/tracks.rs`).
 *
 * The store goes over once (`viewport_tracks`): a begin message with the runs,
 * the draws' arguments and the meshes' ids (`gpuLayout.ts`, as the web lays
 * them out), then the tracks, keys and attitudes in slices of 4 MB, a few a
 * frame as `flushWrites` paces them on the web. Nothing is placed or drawn
 * until all of it is over. Each frame then carries the place shader's uniform
 * (written lane for lane as the web writes it) and the visibility bits when
 * they change: the viewport places every unit in a compute pass and draws one
 * indirect instanced draw a mesh with its figure pipeline. The CPU does nothing
 * per unit.
 *
 * Not yet here (the web has them): trails, drop lines and weapon streaks, the
 * deaths' marks, the far-off glyphs' run. The trail room is 0 (nothing is
 * written there) and the marks pass does not run.
 */

import { INSTANCE_STRIDE, type FigureMesh } from '../../figures/instances';
import { KEY_U32, KEYS_PER_BUFFER, sameKeys, type GpuTrackStore } from '../gpuTracks/store';
import { TRACKS_UNIFORM_BYTES, trackRuns, writeTracksUniform } from '../gpuTracks/gpuLayout';
import { visWords } from '../gpuTracks/visibility';
import { SECTION, type PacketWriter } from './framePacket';
import type { FrameParams } from '../types';

/** Bytes a slice of the store carries, and milliseconds a frame may spend sending them (as the web's `flushWrites`). */
const SLICE_BYTES = 4 * 1024 * 1024;
const SLICE_MS = 3;

/** Message kinds (`tracks.rs`). */
const BEGIN = 0;
const SLICE = 1;
const FREE = 2;

interface Slice {
  buffer: number;
  data: Uint8Array;
  at: number;
}

type Send = (bytes: Uint8Array) => void;

export class NativeTracks {
  private store: GpuTrackStore | null = null;
  private id = Math.floor(Math.random() * 2 ** 30);
  private slices: Slice[] = [];
  private runRoom: Uint32Array = new Uint32Array(0);
  private visSent: Uint32Array | null | undefined = undefined;
  private readonly u = new ArrayBuffer(TRACKS_UNIFORM_BYTES);
  /** Bytes the store holds on the GPU, as the viewport makes its buffers. */
  bytes = 0;

  constructor(private readonly send: Send) {}

  /** Whether the store is still on its way. */
  get uploading(): boolean {
    return this.slices.length > 0;
  }

  /** The viewport lets its store go (a new dataset): the next frame's store goes over again. */
  reset(): void {
    if (this.store) this.send(new Uint8Array(new Uint32Array([FREE, this.id]).buffer));
    this.store = null;
    this.slices = [];
    this.bytes = 0;
  }

  /** The store's arrays as the viewport's buffers take them, in their order (tracks, keys, keys past the first buffer, attitudes; `webgpu/tracks.ts` upload). */
  private arrays(s: GpuTrackStore): Uint32Array[] {
    let trackWords: Uint32Array = s.trackData;
    // The turret and gun keys after the tracks in the same buffer (`store.ts`).
    if (s.keysAim) {
      trackWords = new Uint32Array(s.trackData.length + s.keysAim.length);
      trackWords.set(s.trackData);
      trackWords.set(s.keysAim, s.trackData.length);
    }
    const keysA = s.keysA.subarray(0, Math.min(s.keys, KEYS_PER_BUFFER) * KEY_U32);
    const keysA1 = s.keys > KEYS_PER_BUFFER ? s.keysA.subarray(KEYS_PER_BUFFER * KEY_U32, s.keys * KEY_U32) : new Uint32Array(4);
    return [trackWords, keysA, keysA1, s.keysB];
  }

  private queue(buffer: number, a: Uint32Array): void {
    this.slices.push({ buffer, data: new Uint8Array(a.buffer, a.byteOffset, a.byteLength), at: 0 });
  }

  /** A new store: the begin message now, its arrays a slice at a time from here on. */
  private begin(s: GpuTrackStore, triangleBudget: number): void {
    this.id = (this.id + 1) >>> 0;
    this.store = s;
    this.slices = [];
    this.visSent = undefined;
    const arrays = this.arrays(s);
    const r = trackRuns(s, triangleBudget);
    this.runRoom = r.runRoom;
    const M = s.meshes.length;
    const head = 9;
    const w = new Uint32Array(head + M + r.runsData.length + r.argsInit.length);
    w.set([BEGIN, this.id, s.tracks, M, Math.max(4, 2 * visWords(s))], 0);
    arrays.forEach((a, i) => (w[5 + i] = a.byteLength));
    for (let m = 0; m < M; m++) w[head + m] = s.meshes[m].id;
    w.set(r.runsData, head + M);
    w.set(r.argsInit, head + M + r.runsData.length);
    this.send(new Uint8Array(w.buffer));
    arrays.forEach((a, i) => this.queue(i, a));
    this.bytes = arrays.reduce((n, a) => n + a.byteLength, 0) + r.total * INSTANCE_STRIDE * 4;
  }

  /** Slices while this frame's time lasts (at least one). */
  private flush(): void {
    const until = performance.now() + SLICE_MS;
    let sent = 0;
    while (this.slices.length > 0 && (sent === 0 || performance.now() < until)) {
      const sl = this.slices[0];
      const n = Math.min(SLICE_BYTES, sl.data.byteLength - sl.at);
      const msg = new Uint8Array(16 + n);
      new Uint32Array(msg.buffer, 0, 4).set([SLICE, this.id, sl.buffer, sl.at]);
      msg.set(sl.data.subarray(sl.at, sl.at + n), 16);
      this.send(msg);
      sl.at += n;
      sent += n;
      if (sl.at >= sl.data.byteLength) this.slices.shift();
    }
  }

  /**
   * The frame's `tracks` section, once the store is whole in the viewport; `meshFor` sends what
   * the meshes still lack (and keeps the ones there from being let go). `all`: the last packet
   * was not sent, so the visibility bits go again.
   */
  write(w: PacketWriter, p: FrameParams, meshFor: (m: FigureMesh) => boolean, all: boolean): void {
    if (all) this.visSent = undefined;
    const g = p.gpuTracks;
    if (!g) return;
    const s = g.store;
    if (this.store && this.store !== s && sameKeys(this.store, s) && this.slices.length === 0) {
      // Recoloured: only the tracks' table again, not the keys.
      this.store = s;
      this.queue(0, this.arrays(s)[0]);
    }
    if (this.store !== s) this.begin(s, g.triangleBudget);
    if (this.slices.length > 0) {
      this.flush();
      if (this.slices.length > 0) return;
    }
    for (let m = 0; m < s.meshes.length; m++) if (this.runRoom[m] > 0) meshFor(s.meshes[m]);
    writeTracksUniform(this.u, g, p.viewProj, p.cameraPos, { trailRoom: 0, trailSegments: 0, marks: false });
    w.open(SECTION.tracks);
    w.word(this.id);
    w.words(new Uint32Array(this.u));
    const vis = g.visible ?? null;
    if (vis && vis !== this.visSent) {
      const n = Math.min(vis.length, 2 * visWords(s));
      w.word(n);
      w.words(vis, n);
    } else {
      w.word(0);
    }
    this.visSent = vis;
    w.close();
  }
}
