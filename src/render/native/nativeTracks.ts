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
 * The trails, drop lines and weapon streaks the place shader writes, the deaths'
 * marks (their own pass, from the store's markers sent with the keys) and the
 * far-off glyphs' run are drawn as the web draws them: the trail room is the
 * web's (`TRAIL_ROOM`), and the frame's symbol settings ride in the section.
 *
 * A load the core holds more rows of than the page (`pageStep` > 1) is drawn from the core's keys
 * over every row (`gpuTracks/coreKeys.ts`): the app builds them from the dataset handle and hands
 * them to the viewport itself (`viewport_core_tracks`), answering each person's key range, spans
 * and first and last key time; only the track table made of those goes over (`BEGIN_CORE`). The
 * page's own store, from its rows, stays what the CPU reads (picks, labels, cards).
 * `?coretracks=1` takes the core's keys at `pageStep` 1 too (probes), `?coretracks=0` never.
 */

import { INSTANCE_STRIDE, type FigureMesh } from '../../figures/instances';
import { KEY_U32, KEYS_PER_BUFFER, sameKeys, type GpuTrackStore } from '../gpuTracks/store';
import { TRACKS_UNIFORM_BYTES, TRAIL_ROOM, TRAIL_SEGMENTS, trackRuns, writeTracksUniform } from '../gpuTracks/gpuLayout';
import { visWords } from '../gpuTracks/visibility';
import { SECTION, type PacketWriter } from './framePacket';
import { coreTracksRequest, coreTrackTable, parseCoreKeys, type CoreKeys, type CoreTracksRequest } from '../gpuTracks/coreKeys';
import type { FrameParams } from '../types';

/** Bytes a slice of the store carries, and milliseconds a frame may spend sending them (as the web's `flushWrites`). */
const SLICE_BYTES = 4 * 1024 * 1024;
const SLICE_MS = 3;

/** Message kinds (`tracks.rs`). */
const BEGIN = 0;
const SLICE = 1;
const FREE = 2;
const BEGIN_CORE = 3;

/** `?coretracks=`: 1 the core's keys whatever the page holds, 0 never; null as the load says. */
function coreTracksForced(): boolean | null {
  if (typeof location === 'undefined') return null;
  const v = new URLSearchParams(location.search).get('coretracks');
  return v === null ? null : v !== '0';
}

interface Slice {
  buffer: number;
  data: Uint8Array;
  at: number;
}

type Send = (bytes: Uint8Array) => Promise<unknown>;
/** Asks the app to build the core's keys for a store (`viewport_core_tracks`): the answer's bytes. */
type AskCore = (args: { handle: number; id: number; req: CoreTracksRequest }) => Promise<unknown>;

/** What the last store drawn from the core's keys took (for probes). */
export interface CoreTracksInfo {
  keys: number;
  pageKeys: number;
  tolerance: number;
  samples: number;
  buildMs: number;
  /** From asking to the answer, the app's IPC included. */
  answerMs: number;
  /** Tracks of persons the page has no row of. */
  extra: number;
}

export class NativeTracks {
  private store: GpuTrackStore | null = null;
  private id = Math.floor(Math.random() * 2 ** 30);
  private slices: Slice[] = [];
  private runRoom: Uint32Array = new Uint32Array(0);
  private visSent: Uint32Array | null | undefined = undefined;
  private readonly u = new ArrayBuffer(TRACKS_UNIFORM_BYTES);
  /** Bytes the store holds on the GPU, as the viewport makes its buffers. */
  bytes = 0;
  /** The core's keys the store is drawn from (null: the page's own). */
  private core: CoreKeys | null = null;
  /** A store waiting for the core's keys. */
  private asking = 0;
  /** The last store drawn from the core's keys, for probes. */
  coreInfo: CoreTracksInfo | null = null;

  constructor(
    private readonly send: Send,
    private readonly askCore: AskCore | null = null,
    private readonly maxKeys: () => number = () => 0,
  ) {}

  /** Whether the store is still on its way. */
  get uploading(): boolean {
    return this.slices.length > 0 || this.posting > 0 || this.asking > 0;
  }

  /**
   * Messages one after the other: IPC calls in flight together may arrive in any order, and a
   * slice ahead of its store's begin message was dropped (the store never whole: nothing drawn).
   */
  private chain: Promise<unknown> = Promise.resolve();
  private posting = 0;
  private post(bytes: Uint8Array): void {
    this.posting++;
    this.chain = this.chain.then(() => this.send(bytes)).finally(() => this.posting--);
  }

  /** The viewport lets its store go (a new dataset): the next frame's store goes over again. */
  reset(): void {
    if (this.store) this.post(new Uint8Array(new Uint32Array([FREE, this.id]).buffer));
    this.store = null;
    this.slices = [];
    this.bytes = 0;
    this.core = null;
  }

  /**
   * The store's arrays as the viewport's buffers take them, in their order (tracks, keys, keys past
   * the first buffer, attitudes, the deaths' marks and their colours; `webgpu/tracks.ts` upload).
   */
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
    const mk = s.markers && s.markers.count ? s.markers : null;
    const marks = mk ? new Uint32Array(mk.data.buffer, mk.data.byteOffset, mk.data.length) : new Uint32Array(0);
    return [trackWords, keysA, keysA1, s.keysB, marks, mk ? mk.colour : new Uint32Array(0)];
  }

  private queue(buffer: number, a: Uint32Array): void {
    this.slices.push({ buffer, data: new Uint8Array(a.buffer, a.byteOffset, a.byteLength), at: 0 });
  }

  /**
   * Whether store `s` is drawn from the core's keys: a load the core holds more rows of than the
   * page, in the app, with no turret, gun or gear keys (not built by the core yet).
   */
  private wantsCore(s: GpuTrackStore): boolean {
    const n = s.dataset.native;
    const force = coreTracksForced();
    return !!this.askCore && !!n && force !== false && (n.pageStep > 1 || force === true) && !s.keysAim && s.tracks > 0 && this.maxKeys() > 0;
  }

  /** A new store: the begin message now (or once the core's keys are built), its arrays a slice at a time from there on. */
  private begin(s: GpuTrackStore, triangleBudget: number): void {
    this.id = (this.id + 1) >>> 0;
    this.store = s;
    this.slices = [];
    this.visSent = undefined;
    this.core = null;
    if (!this.wantsCore(s)) {
      this.beginWith(s, triangleBudget, null);
      return;
    }
    const id = this.id;
    const t0 = performance.now();
    this.asking++;
    void this.askCore!({ handle: s.dataset.native!.handle, id, req: coreTracksRequest(s.dataset, this.maxKeys()) })
      .then((got) => {
        if (this.store !== s || this.id !== id) return;
        const buf = got as ArrayBuffer;
        const k = buf && buf.byteLength > 0 ? parseCoreKeys(buf) : null;
        if (k) this.coreInfo = { keys: k.keys, pageKeys: s.keys, tolerance: k.tolerance, samples: k.samples, buildMs: k.buildMs, answerMs: performance.now() - t0, extra: 0 };
        this.beginWith(s, triangleBudget, k);
      })
      .catch((e: unknown) => {
        console.warn('native viewport: core tracks', e);
        if (this.store === s && this.id === id) this.beginWith(s, triangleBudget, null);
      })
      .finally(() => this.asking--);
  }

  /** The begin message for `s`, drawn from the core's keys `k` or (null) the page's own. */
  private beginWith(s: GpuTrackStore, triangleBudget: number, k: CoreKeys | null): void {
    this.core = k;
    const arrays = this.arrays(s);
    // What the runs are laid out for: the page's tracks, or the core's with those the page has no row of.
    let laid = s;
    if (k) {
      // The table only; the core's chunk spans follow it, its keys and attitudes are the viewport's already.
      const ct = coreTrackTable(s, k);
      arrays[0] = ct.table;
      arrays[1] = arrays[2] = arrays[3] = new Uint32Array(0);
      laid = { ...s, tracks: ct.tracks, meshTracks: ct.meshTracks };
      if (this.coreInfo) this.coreInfo.extra = ct.extra;
    }
    const r = trackRuns(laid, triangleBudget);
    this.runRoom = r.runRoom;
    const M = s.meshes.length;
    const head = 11;
    const w = new Uint32Array(head + M + r.runsData.length + r.argsInit.length);
    w.set([k ? BEGIN_CORE : BEGIN, this.id, laid.tracks, M, Math.max(4, 2 * visWords(laid))], 0);
    arrays.forEach((a, i) => (w[5 + i] = a.byteLength));
    for (let m = 0; m < M; m++) w[head + m] = s.meshes[m].id;
    w.set(r.runsData, head + M);
    w.set(r.argsInit, head + M + r.runsData.length);
    this.post(new Uint8Array(w.buffer));
    arrays.forEach((a, i) => a.byteLength > 0 && this.queue(i, a));
    this.bytes = arrays.reduce((n, a) => n + a.byteLength, 0) + (k ? (k.keys * 3 + k.chunkU32) * 4 : 0) + r.total * INSTANCE_STRIDE * 4 + TRAIL_ROOM * 32;
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
      this.post(msg);
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
    if (this.store && this.store !== s && sameKeys(this.store, s) && this.slices.length === 0 && this.asking === 0) {
      // Recoloured: only the tracks' table (and the marks' colours) again, not the keys.
      this.store = s;
      const a = this.arrays(s);
      this.queue(0, this.core ? coreTrackTable(s, this.core).table : a[0]);
      if (a[5].length) this.queue(5, a[5]);
    }
    if (this.store !== s) this.begin(s, g.triangleBudget);
    if (this.slices.length > 0) this.flush();
    // Not until every message is taken: a frame's IPC call is not in the chain, and a section ahead
    // of its store lost its visibility bits (sent once) - nothing was drawn.
    if (this.slices.length > 0 || this.posting > 0 || this.asking > 0) return;
    for (let m = 0; m < s.meshes.length; m++) if (this.runRoom[m] > 0) meshFor(s.meshes[m]);
    writeTracksUniform(this.u, g, p.viewProj, p.cameraPos, { trailRoom: TRAIL_ROOM, trailSegments: TRAIL_SEGMENTS, marks: (s.markers?.count ?? 0) > 0 });
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
    // The far-off glyphs' run, drawn with the frame's symbol settings when there are any (`drawGlyphs`).
    const sym = p.symbols ?? null;
    w.word(sym ? 1 : 0);
    if (sym) {
      w.float(sym.style);
      w.float(sym.mode);
      w.float(sym.ticks ? 1 : 0);
      w.reserveFloats(64).set(sym.sides.subarray(0, 64));
    }
    w.close();
  }
}
