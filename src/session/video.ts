/**
 * Video mode (Stage 8): for a member whose device cannot draw the session's
 * data, the host draws this member's own view and streams it as video. The
 * page plays the stream in place of its canvas, keeps its own panels and
 * labels over it, and sends its camera to the host on the stream's data
 * channel. The signalling goes through the session server with this member's
 * token (`/__heat3d/video`); media flows straight between the two machines on
 * the local network (no relay).
 *
 * A member who follows the host's camera gets the host's view, one stream the
 * host encodes once for everyone following it (a large team costs the host one
 * picture); following someone else or no one, its own view. A change of whom
 * it follows switches between the two. When the host has no room for another
 * view of its own (`full`), the page says so and tries again by itself every
 * 15 s while video mode stays wanted.
 *
 * Measured here, from the frames the host announces on the channel: camera to
 * picture (the camera's send time to the frame's expected display time, both
 * on this page's clock), decode and network figures from `getStats`.
 */

import { create } from 'zustand';
import type { Engine } from '../render/engine';
import { session } from './client';
import { useSessionStore } from './store';
import { applyPose, presence } from './presence';
import { useStore } from '../state/store';

export type VideoState = 'off' | 'starting' | 'on' | 'failed' | 'waiting';

/**
 * Why video mode failed or ended, as a short code the panel puts in its own words: the host's
 * refusals (`router.rs`: lan, full, off, viewport, start, bad, session, none) and this page's
 * own (link: the connection broke; ended: the host ended the stream; refused: a renewal refused).
 */
export type VideoWhy = 'lan' | 'full' | 'off' | 'viewport' | 'start' | 'bad' | 'session' | 'none' | 'link' | 'ended' | 'refused' | 'left';

/** Why video mode was turned on by itself (`deviceNeedsVideo`, or frames too slow here). */
export type AutoWhy = 'gpu' | 'memory' | 'webgl' | 'slow';

const AUTO_KEY = 'heat3d.videoAuto';

function readAutoPref(): boolean {
  try {
    return localStorage.getItem(AUTO_KEY) !== 'off';
  } catch {
    return true;
  }
}

export interface VideoStats {
  codec: string;
  encoder: string;
  hardware: boolean;
  width: number;
  height: number;
  /** Frames shown a second, as decoded. */
  fps: number;
  /** Received, kbit/s. */
  kbps: number;
  /** The host's target, kbit/s. */
  targetKbps: number;
  /** Camera to picture, ms: median and 95th percentile of the last moves. */
  latencyP50: number;
  latencyP95: number;
  /** The host's encode and draw time per frame (median, ms). */
  encodeMs: number;
  renderMs: number;
}

interface VideoStore {
  state: VideoState;
  /** Why it failed or ended ('' while fine). */
  reason: VideoWhy | '';
  /** The host's own words about it, for the tooltip. */
  detail: string;
  /** Started by the automatic check rather than by hand: why. */
  auto: AutoWhy | null;
  /** Video mode may turn on by itself on a device that is too slow (this browser's choice). */
  autoPref: boolean;
  stats: VideoStats | null;
  /** What the host offers (from `/info`), once asked. */
  available: boolean | null;
  /** This device reaches the host on the local network (the video's only way, no relay). */
  lan: boolean | null;
  /** The picture is the host's view, shared with everyone following the host. */
  shared: boolean;
  patch: (p: Partial<VideoStore>) => void;
}

/** Turns the automatic choice on or off for this browser. */
export function setVideoAutoPref(on: boolean): void {
  try {
    localStorage.setItem(AUTO_KEY, on ? 'on' : 'off');
  } catch {
    /* kept for this visit only */
  }
  useVideoStore.getState().patch({ autoPref: on });
}

export const useVideoStore = create<VideoStore>((set) => ({
  state: 'off',
  reason: '',
  detail: '',
  auto: null,
  autoPref: readAutoPref(),
  stats: null,
  available: null,
  lan: null,
  shared: false,
  patch: (p) => set(p),
}));

function base(): string {
  const s = session.serverUrl();
  return s ? new URL(s, location.href).origin : location.origin;
}

/** Whether this member follows the host's camera now (a "follow me" it took or chose, or the session's enforced follow). */
export function followsHost(): boolean {
  const s = useSessionStore.getState();
  const leader = s.followPeer ?? (s.follow.mode === 'enforce' ? s.follow.leader : null);
  return leader != null && s.members.some((m) => m.id === leader && m.role === 'host');
}

/** How long a member the host had no room for waits before asking again. */
const RETRY_FULL_MS = 15_000;

async function post(path: string, body?: unknown): Promise<Response> {
  return fetch(`${base()}/__heat3d/video/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.token()}`, 'Content-Type': 'application/json' },
    body: body === undefined ? '' : JSON.stringify(body),
    // A stop sent as the page goes still reaches the host, so its stream slot frees at once.
    keepalive: path === 'stop',
  });
}

/** Whether this device should get the session as video rather than draw it itself. */
export function deviceNeedsVideo(datasetBytes: number): { need: boolean; why: AutoWhy | '' } {
  const nav = navigator as Navigator & { gpu?: unknown; deviceMemory?: number };
  let gl2 = false;
  try {
    gl2 = !!document.createElement('canvas').getContext('webgl2');
  } catch {
    gl2 = false;
  }
  if (!nav.gpu && !gl2) return { need: true, why: 'gpu' };
  const memGb = nav.deviceMemory ?? 8;
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  // About a quarter of the device's memory for the data (the browser, the page and the GPU copies take the rest).
  const budget = memGb * 0.25 * 1024 ** 3 * (coarse ? 0.5 : 1);
  if (datasetBytes > budget) return { need: true, why: 'memory' };
  if (!nav.gpu && datasetBytes > 256 * 1024 ** 2) return { need: true, why: 'webgl' };
  return { need: false, why: '' };
}

const CAMERA_BYTES = 100;

function pct(v: number[], p: number): number {
  if (!v.length) return 0;
  const s = [...v].sort((a, b) => a - b);
  return s[Math.round((s.length - 1) * p)];
}

class VideoClient {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private video: HTMLVideoElement | null = null;
  private engine: Engine | null = null;
  private renew = 0;
  private raf = 0;
  private statsTimer = 0;
  private retry = 0;
  private auto: AutoWhy | null = null;
  private seq = 0;
  private lastSig = '';
  private lastSend = 0;
  /** Frames the host announced, by RTP time: the camera's seq and send time, the host's times. */
  private announced = new Map<number, { s: number; c: number; e: number; r: number; k: number }>();
  private shownSeq = -1;
  private latencies: number[] = [];
  private encodes: number[] = [];
  private renders: number[] = [];
  private bytesAt: { t: number; b: number; f: number } | null = null;

  /** What the host offers this member (the role's limit, the codecs it encodes). */
  async info(): Promise<{ available: boolean; lan: boolean; viewport: boolean } | null> {
    try {
      const r = await post('info');
      if (!r.ok) return null;
      const j = await r.json();
      useVideoStore.getState().patch({ available: !!j.available, lan: !!j.lan });
      return j;
    } catch {
      return null;
    }
  }

  /** The view's engine (the session layer hands it over; the measuring probe reads it back). */
  setEngine(e: Engine | null): void {
    this.engine = e;
  }

  view(): Engine | null {
    return this.engine;
  }

  async start(engine: Engine | null = this.engine, auto: AutoWhy | null = null): Promise<void> {
    if (this.pc) return;
    if (!engine) return;
    window.clearTimeout(this.retry);
    const st = useVideoStore.getState();
    const shared = followsHost();
    st.patch({ state: 'starting', reason: '', detail: '', auto, stats: null, shared });
    this.engine = engine;
    this.auto = auto;
    // A device watching as video has no data of its own to frame: its view starts where the host looks.
    if (!shared && !useStore.getState().dataset) {
      const host = useSessionStore.getState().members.find((m) => m.role === 'host');
      const pose = host ? presence.get(host.id)?.pose : undefined;
      if (pose) applyPose(engine, pose);
    }
    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      this.pc = pc;
      const tr = pc.addTransceiver('video', { direction: 'recvonly' });
      // No smoothing buffer: each frame shown as soon as it is decoded (the host asks for the same
      // with the playout-delay extension).
      try {
        (tr.receiver as RTCRtpReceiver & { jitterBufferTarget?: number | null }).jitterBufferTarget = 0;
      } catch {
        /* not in this browser */
      }
      // Codecs in the order this browser should get them: H.264 first (every decoder, lowest
      // latency in hardware), then AV1 and H.265 where the browser decodes them.
      const caps = RTCRtpReceiver.getCapabilities?.('video')?.codecs ?? [];
      const rank = (m: string) => ['video/H264', 'video/AV1', 'video/H265'].indexOf(m);
      const prefer = caps.filter((c) => rank(c.mimeType) >= 0).sort((a, b) => rank(a.mimeType) - rank(b.mimeType));
      if (prefer.length && tr.setCodecPreferences) tr.setCodecPreferences(prefer);
      const names = [...new Set(prefer.map((c) => c.mimeType.slice(6).toLowerCase()))];
      const dc = pc.createDataChannel('cam', { ordered: false, maxRetransmits: 0 });
      dc.binaryType = 'arraybuffer';
      dc.onmessage = (e) => this.onAnnounce(e.data);
      this.dc = dc;
      const video = document.createElement('video');
      video.className = shared ? 'session-video shared' : 'session-video';
      // Placed by itself (not left to a style sheet that may come later): over the canvas, input through it.
      video.style.position = 'absolute';
      video.style.pointerEvents = 'none';
      video.style.objectFit = shared ? 'contain' : 'fill';
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      this.video = video;
      pc.ontrack = (e) => {
        video.srcObject = e.streams[0] ?? new MediaStream([e.track]);
        void video.play().catch(() => undefined);
        this.place();
        this.watchFrames();
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed') this.fail('link');
        if (pc.connectionState === 'connected') useVideoStore.getState().patch({ state: 'on' });
      };
      await pc.setLocalDescription(await pc.createOffer());
      // The host answers with one candidate of its own and checks nothing itself (ICE-lite):
      // this page's candidates go in the offer, so wait for them.
      await new Promise<void>((done) => {
        if (pc.iceGatheringState === 'complete') return done();
        const t = window.setTimeout(done, 2000);
        pc.addEventListener('icegatheringstatechange', () => {
          if (pc.iceGatheringState === 'complete') {
            window.clearTimeout(t);
            done();
          }
        });
      });
      const cam = this.camera();
      const res = await post('offer', { offer: pc.localDescription, codecs: names, camera: cam, follow: shared });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        const why = (j.code as VideoWhy) || 'start';
        if (why === 'full') {
          // No room on the host now: said plainly, and asked again by itself while still wanted.
          this.teardown();
          useVideoStore.getState().patch({ state: 'waiting', reason: 'full', detail: j.error || '', stats: null });
          this.retry = window.setTimeout(() => {
            if (useVideoStore.getState().state === 'waiting') void this.start(this.engine, this.auto);
          }, RETRY_FULL_MS);
          return;
        }
        this.fail(why, j.error || `HTTP ${res.status}`);
        return;
      }
      await pc.setRemoteDescription(j.answer);
      useVideoStore.getState().patch({ stats: { codec: j.codec, encoder: j.encoder, hardware: !!j.hardware, width: j.width, height: j.height, fps: 0, kbps: 0, targetKbps: j.kbps, latencyP50: 0, latencyP95: 0, encodeMs: 0, renderMs: 0 } });
      this.renew = window.setInterval(() => {
        void post('renew').then((r) => {
          if (!r.ok) this.fail(r.status === 404 ? 'ended' : 'refused');
        }, () => undefined);
      }, 5000);
      this.statsTimer = window.setInterval(() => void this.poll(), 1000);
      const tick = () => {
        this.sendCamera();
        this.place();
        this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    } catch (e) {
      this.fail('start', e instanceof Error ? e.message : String(e));
    }
  }

  stop(reason: VideoWhy | '' = ''): void {
    window.clearTimeout(this.retry);
    if (this.pc) void post('stop').catch(() => undefined);
    this.teardown();
    useVideoStore.getState().patch({ state: 'off', reason, detail: '', stats: null, auto: null });
  }

  private fail(reason: VideoWhy, detail = ''): void {
    if (this.pc) void post('stop').catch(() => undefined);
    this.teardown();
    useVideoStore.getState().patch({ state: 'failed', reason, detail, stats: null });
  }

  private teardown(): void {
    window.clearInterval(this.renew);
    window.clearInterval(this.statsTimer);
    cancelAnimationFrame(this.raf);
    this.dc?.close();
    this.pc?.close();
    this.video?.remove();
    this.pc = null;
    this.dc = null;
    this.video = null;
    this.announced.clear();
    this.latencies = [];
    this.encodes = [];
    this.renders = [];
    this.bytesAt = null;
  }

  /** The picture over the canvas, below every panel and label (they come after it in the page). */
  private place(): void {
    const v = this.video;
    const c = this.engine?.canvas;
    if (!v || !c) return;
    if (v.parentElement !== c.parentElement) c.insertAdjacentElement('afterend', v);
    const s = v.style;
    const want = [`${c.offsetLeft}px`, `${c.offsetTop}px`, `${c.offsetWidth}px`, `${c.offsetHeight}px`];
    if (s.left !== want[0] || s.top !== want[1] || s.width !== want[2] || s.height !== want[3]) {
      s.left = want[0];
      s.top = want[1];
      s.width = want[2];
      s.height = want[3];
    }
  }

  private camera() {
    const e = this.engine!;
    const v = e.videoCamera();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    return {
      view: Array.from(v.view),
      fov: v.fov,
      ortho: v.ortho,
      orthoHeight: v.orthoHeight,
      width: Math.max(64, Math.round(e.canvas.clientWidth * dpr)),
      height: Math.max(64, Math.round(e.canvas.clientHeight * dpr)),
    };
  }

  /** The camera to the host when it moved (or once a second), on the unreliable channel. */
  private sendCamera(): void {
    const dc = this.dc;
    if (!dc || dc.readyState !== 'open' || !this.engine) return;
    const c = this.camera();
    const sig = `${c.view.join(',')}|${c.fov}|${c.ortho}|${c.orthoHeight}|${c.width}x${c.height}`;
    const now = performance.now();
    if (sig === this.lastSig && now - this.lastSend < 1000) return;
    if (dc.bufferedAmount > 64 * 1024) return;
    this.lastSig = sig;
    this.lastSend = now;
    const b = new ArrayBuffer(CAMERA_BYTES);
    const d = new DataView(b);
    'H3VC'.split('').forEach((ch, i) => d.setUint8(i, ch.charCodeAt(0)));
    d.setUint32(4, ++this.seq, true);
    d.setFloat64(8, now, true);
    c.view.forEach((x, i) => d.setFloat32(16 + i * 4, x, true));
    d.setFloat32(80, c.fov, true);
    d.setFloat32(84, c.ortho ? 1 : 0, true);
    d.setFloat32(88, c.orthoHeight, true);
    d.setUint32(92, c.width, true);
    d.setUint32(96, c.height, true);
    dc.send(b);
  }

  private onAnnounce(data: unknown): void {
    if (typeof data !== 'string' || data.length > 512) return;
    try {
      const j = JSON.parse(data);
      if (typeof j.t !== 'number') return;
      this.announced.set(j.t >>> 0, { s: j.s, c: j.c, e: j.e, r: j.r, k: j.k });
      if (this.announced.size > 300) this.announced.delete(this.announced.keys().next().value as number);
      this.encodes.push(j.e);
      this.renders.push(j.r);
      if (this.encodes.length > 300) {
        this.encodes.shift();
        this.renders.shift();
      }
    } catch {
      /* not ours */
    }
  }

  /** Each frame shown: the first one drawn from a new camera gives camera-to-picture. */
  private watchFrames(): void {
    const v = this.video as (HTMLVideoElement & { requestVideoFrameCallback?: (cb: (now: number, m: { rtpTimestamp?: number; expectedDisplayTime: number }) => void) => number }) | null;
    if (!v?.requestVideoFrameCallback) return;
    const cb = (_now: number, m: { rtpTimestamp?: number; expectedDisplayTime: number }) => {
      if (m.rtpTimestamp !== undefined) {
        const a = this.announced.get(m.rtpTimestamp >>> 0);
        if (a && a.s > this.shownSeq) {
          this.shownSeq = a.s;
          if (a.s > 0 && a.c > 0) {
            this.latencies.push(m.expectedDisplayTime - a.c);
            if (this.latencies.length > 200) this.latencies.shift();
          }
        }
      }
      if (this.video === v) v.requestVideoFrameCallback!(cb);
    };
    v.requestVideoFrameCallback(cb);
  }

  private async poll(): Promise<void> {
    const pc = this.pc;
    if (!pc) return;
    const st = useVideoStore.getState();
    const prev = st.stats;
    if (!prev) return;
    const rep = await pc.getStats();
    let bytes = 0;
    let frames = 0;
    let width = prev.width;
    let height = prev.height;
    rep.forEach((r: { type: string; kind?: string; bytesReceived?: number; framesDecoded?: number; frameWidth?: number; frameHeight?: number }) => {
      if (r.type === 'inbound-rtp' && r.kind === 'video') {
        bytes = r.bytesReceived ?? 0;
        frames = r.framesDecoded ?? 0;
        width = r.frameWidth ?? width;
        height = r.frameHeight ?? height;
      }
    });
    const now = performance.now();
    let fps = prev.fps;
    let kbps = prev.kbps;
    if (this.bytesAt) {
      const dt = (now - this.bytesAt.t) / 1000;
      if (dt > 0) {
        kbps = Math.round(((bytes - this.bytesAt.b) * 8) / 1000 / dt);
        fps = Math.round((frames - this.bytesAt.f) / dt);
      }
    }
    this.bytesAt = { t: now, b: bytes, f: frames };
    const last = [...this.announced.values()].pop();
    st.patch({
      stats: {
        ...prev,
        width,
        height,
        fps,
        kbps,
        targetKbps: last?.k ?? prev.targetKbps,
        latencyP50: pct(this.latencies, 0.5),
        latencyP95: pct(this.latencies, 0.95),
        encodeMs: pct(this.encodes, 0.5),
        renderMs: pct(this.renders, 0.5),
      },
    });
  }

  /** The raw figures, for the measuring probe. */
  measurements() {
    return { latencies: [...this.latencies], encodes: [...this.encodes], renders: [...this.renders], stats: useVideoStore.getState().stats };
  }
}

export const video = new VideoClient();

// Ends with the session: leaving, being kicked or the host stopping.
useSessionStore.subscribe((s, prev) => {
  if (prev.state === 'joined' && s.state !== 'joined' && useVideoStore.getState().state !== 'off') video.stop('left');
});
// Starting or stopping to follow the host switches between the host's shared view and this member's own.
let followedHost = false;
useSessionStore.subscribe(() => {
  const now = followsHost();
  if (now === followedHost) return;
  followedHost = now;
  const v = useVideoStore.getState();
  if ((v.state === 'on' || v.state === 'starting') && v.shared !== now) {
    const e = video.view();
    const auto = v.auto;
    video.stop();
    void video.start(e, auto);
  }
});
// Closing or leaving the page frees the host's stream at once, not after its lease runs out.
if (typeof window !== 'undefined') window.addEventListener('pagehide', () => { if (useVideoStore.getState().state !== 'off') video.stop('left'); });

declare global {
  interface Window {
    __heat3dVideo?: { client: VideoClient; store: typeof useVideoStore };
  }
}
if (typeof window !== 'undefined') window.__heat3dVideo = { client: video, store: useVideoStore };
