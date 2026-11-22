/**
 * The native core of the 3DHeat app, as the viewer reaches it.
 *
 * In the native app (Tauri) the viewer runs unchanged in a webview, and its Rust
 * core answers the protocol (`native/proto/heat3d/v1/heat3d.proto`) at the
 * `heat3d` scheme: a POST of one frame, answered with one frame. The same
 * messages will reach a host over WSS later (Stage 2b); only the transport here
 * is the app's.
 *
 * A frame is a little-endian u32 length, the envelope, zero padding to a
 * multiple of 8, then the payload; the payload's buffers are viewed in place as
 * typed arrays, never copied or parsed. Works from the page and from workers,
 * which is where the loads run.
 */

import { create, fromBinary, toBinary, type MessageInitShape } from '@bufbuild/protobuf';
import {
  EnvelopeSchema,
  ErrorCode,
  ProtocolVersion,
  type Buffer as PayloadBuffer,
  type Envelope,
} from './gen/heat3d/v1/heat3d_pb';

/** Where the core answers, and the key that makes a request the owner's. */
export interface CoreEndpoint {
  url: string;
  key: string;
  /** A session member's token: the host's core through the session's gateway, with a member's rights. */
  bearer?: string;
}

/** The app's `heat3d` scheme: Tauri serves one as `http://<scheme>.localhost` on Windows. */
function schemeUrl(): string {
  const windows = typeof navigator !== 'undefined' && /Windows/i.test(navigator.userAgent);
  return windows ? 'http://heat3d.localhost/v1' : 'heat3d://core/v1';
}

let endpoint: Promise<CoreEndpoint> | null = null;

/**
 * Where the window reaches its core: the app's embedded server on a loopback
 * port, with a key only this window is told (many times faster than a custom
 * scheme in WebView2); the `heat3d` scheme when the app has none. Main thread.
 */
export function coreEndpoint(): Promise<CoreEndpoint> {
  endpoint ??= (async () => {
    const tauri = (globalThis as unknown as { __TAURI_INTERNALS__?: { invoke(cmd: string): Promise<unknown> } }).__TAURI_INTERNALS__;
    const got = (await tauri?.invoke('core_endpoint').catch(() => null)) as CoreEndpoint | null | undefined;
    return got?.url ? got : { url: schemeUrl(), key: '' };
  })();
  return endpoint;
}

/** Whether this page runs in the native app, with a core behind it. */
export function inNativeApp(): boolean {
  return typeof globalThis !== 'undefined' && '__TAURI_INTERNALS__' in globalThis;
}

export type Body = Envelope['body'];
/** A request's body, as plain fields. */
export type BodyInit = NonNullable<MessageInitShape<typeof EnvelopeSchema>['body']>;

export class NativeError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
  }

  /** The core does not do this one: the viewer does it itself. */
  get unsupported(): boolean {
    return this.code === ErrorCode.UNSUPPORTED;
  }
}

export interface Reply<C extends NonNullable<Body['case']>> {
  body: Extract<Body, { case: C }>['value'];
  /** The whole frame; buffers are offsets into it from `payloadAt`. */
  frame: ArrayBuffer;
  payloadAt: number;
  ms: number;
}

let nextId = 1n;

/** Sends one request and waits for its answer, which must be of kind `expect`. */
export async function call<C extends NonNullable<Body['case']>>(at: CoreEndpoint, body: BodyInit, expect: C): Promise<Reply<C>> {
  const t0 = performance.now();
  const env = create(EnvelopeSchema, { protocol: ProtocolVersion.CURRENT, id: nextId++, body });
  const bytes = toBinary(EnvelopeSchema, env);
  const start = Math.ceil((4 + bytes.length) / 8) * 8;
  const req = new Uint8Array(start);
  new DataView(req.buffer).setUint32(0, bytes.length, true);
  req.set(bytes, 4);
  let res: Response;
  try {
    const headers: Record<string, string> = { 'content-type': 'text/plain' };
    if (at.key) headers['x-heat3d-key'] = at.key;
    if (at.bearer) headers.authorization = `Bearer ${at.bearer}`;
    res = await fetch(at.url, { method: 'POST', body: req, headers });
  } catch (err) {
    // No core at this address (or none reachable from here): the caller reads the file itself.
    throw new NativeError(ErrorCode.IO, `native core not reachable: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (!res.ok) throw new NativeError(ErrorCode.IO, `native core answered ${res.status}`);
  const frame = await res.arrayBuffer();
  const len = new DataView(frame).getUint32(0, true);
  const reply = fromBinary(EnvelopeSchema, new Uint8Array(frame, 4, len));
  const payloadAt = Math.ceil((4 + len) / 8) * 8;
  if (reply.body.case === 'error') throw new NativeError(reply.body.value.code, reply.body.value.message);
  if (reply.body.case !== expect) throw new NativeError(ErrorCode.INVALID, `native core answered ${reply.body.case} to ${body.case}`);
  return { body: reply.body.value as Reply<C>['body'], frame, payloadAt, ms: performance.now() - t0 };
}

type View = Float32Array | Float64Array | Uint32Array;

/** A payload buffer as a typed array over the frame, without copying. */
export function view<T extends View>(
  reply: { frame: ArrayBuffer; payloadAt: number },
  buf: PayloadBuffer | undefined,
  Ctor: { new (b: ArrayBuffer, offset: number, length: number): T; BYTES_PER_ELEMENT: number },
): T {
  const offset = buf ? reply.payloadAt + Number(buf.offset) : reply.payloadAt;
  const length = buf ? Number(buf.length) / Ctor.BYTES_PER_ELEMENT : 0;
  return new Ctor(reply.frame, offset, length);
}
