/**
 * Shared memory from the native core (WebView2 shared buffers, Windows).
 *
 * The core writes a column or a packed chunk straight into memory the page
 * sees as an `ArrayBuffer`, and posts it tagged `{"heat3d":"shared","id":N}`;
 * the reply to the request names the same id. Nothing is copied on the way.
 * Buffers arrive on the main thread only, and may arrive before the reply that
 * names them, so they are kept here until asked for.
 */

interface SharedEvent {
  additionalData: { heat3d?: string; id?: number } | null;
  getBuffer(): ArrayBuffer;
}

interface SharedWebview {
  addEventListener(type: 'sharedbufferreceived', fn: (e: SharedEvent) => void): void;
  releaseBuffer(b: ArrayBuffer): void;
}

function webview(): SharedWebview | null {
  const w = globalThis as unknown as { chrome?: { webview?: SharedWebview & { releaseBuffer?: unknown } } };
  return w.chrome?.webview && typeof w.chrome.webview.releaseBuffer === 'function' ? w.chrome.webview : null;
}

const arrived = new Map<number, ArrayBuffer>();
const waiting = new Map<number, (b: ArrayBuffer) => void>();
let listening = false;

/** Whether this page can take shared buffers (the app's window on Windows, main thread). */
export function sharedAvailable(): boolean {
  return typeof document !== 'undefined' && webview() !== null;
}

function listen(): void {
  if (listening) return;
  const wv = webview();
  if (!wv) return;
  listening = true;
  wv.addEventListener('sharedbufferreceived', (e) => {
    const d = e.additionalData;
    if (d?.heat3d !== 'shared' || typeof d.id !== 'number') return;
    const buf = e.getBuffer();
    const w = waiting.get(d.id);
    if (w) {
      waiting.delete(d.id);
      w(buf);
    } else arrived.set(d.id, buf);
  });
}

/** Start listening, before the first request that will name a buffer. */
export function prepareShared(): void {
  listen();
}

/** The buffer the core posted as `id`; rejects after `timeoutMs`. */
export function takeShared(id: number, timeoutMs = 120_000): Promise<ArrayBuffer> {
  listen();
  const got = arrived.get(id);
  if (got) {
    arrived.delete(id);
    return Promise.resolve(got);
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      waiting.delete(id);
      reject(new Error(`shared buffer ${id} never arrived`));
    }, timeoutMs);
    waiting.set(id, (b) => {
      clearTimeout(timer);
      resolve(b);
    });
  });
}

/** Gives a buffer back at once (a chunk on the GPU), rather than when it is collected. */
export function releaseShared(b: ArrayBuffer): void {
  try {
    webview()?.releaseBuffer(b);
  } catch {
    /* already released */
  }
}
