/**
 * Picked and dropped files, named to the native core.
 *
 * A file the viewer picks stays a `File` in the page, so everything that reads
 * it works as it does in a browser. In the native app on Windows the page also
 * posts the same `File` objects to the host (`postMessageWithAdditionalObjects`),
 * which learns each one's path from WebView2 and answers with a token for it
 * (`native/crates/app-tauri/src/files.rs`). Requests then name the file by token, and the
 * core maps it in place. A table out of a `.3dheat` container is named as its
 * container's token and its member name.
 *
 * Where the host cannot say (Linux, a file made in the page), the file has no
 * token and the viewer reads it itself.
 */

import { memberOf } from '../container';

/** How the core is told which file: a token, and a container member when it is one. */
export interface NativeFileRef {
  token: string;
  member: string;
}

interface WebviewBridge {
  postMessageWithAdditionalObjects?: (message: unknown, objects: unknown[]) => void;
  addEventListener: (type: 'message', fn: (e: { data: unknown }) => void) => void;
}

function bridge(): WebviewBridge | null {
  const w = globalThis as unknown as { chrome?: { webview?: WebviewBridge } };
  return w.chrome?.webview?.postMessageWithAdditionalObjects ? w.chrome.webview : null;
}

const tokens = new WeakMap<File, string | null>();

/** A file whose path the host already knows (the Library's files come with their token): the core reads it in place. */
export function setNativeToken(file: File, token: string): void {
  tokens.set(file, token);
}
const waiting = new Map<number, (tokens: Array<string | null>) => void>();
let listening = false;
let nextId = 1;

/** Tokens for `files`, null where the host cannot read a file itself. */
export async function nativeTokens(files: File[]): Promise<Array<string | null>> {
  const b = bridge();
  if (!b) return files.map((f) => tokens.get(f) ?? null);
  const unknown = [...new Set(files.filter((f) => !tokens.has(f)))];
  if (unknown.length) {
    if (!listening) {
      listening = true;
      b.addEventListener('message', (e) => {
        const d = e.data as { heat3d?: string; id?: number; tokens?: Array<string | null> } | null;
        if (d?.heat3d !== 'files' || typeof d.id !== 'number') return;
        waiting.get(d.id)?.(d.tokens ?? []);
        waiting.delete(d.id);
      });
    }
    // One message a file: WebView2 refuses a whole message when one of its files
    // is not on disk (made in the page), and that one is simply read here.
    const got = await Promise.all(
      unknown.map(
        (f) =>
          new Promise<string | null>((resolve) => {
            const id = nextId++;
            try {
              // Shaped as a Tauri message with no key of Tauri's, which Tauri passes over
              // without a word; anything else it answers with an error in the console.
              const msg = { cmd: 'heat3d_files', callback: 0, error: 0, payload: { id }, __TAURI_INVOKE_KEY__: 'heat3d' };
              b.postMessageWithAdditionalObjects!(JSON.stringify(msg), [f]);
            } catch {
              resolve(null);
              return;
            }
            waiting.set(id, (t) => resolve(t[0] ?? null));
            // A host that never answers leaves the file to the viewer, after a moment.
            setTimeout(() => {
              if (waiting.delete(id)) resolve(null);
            }, 3000);
          }),
      ),
    );
    unknown.forEach((f, i) => tokens.set(f, got[i]));
  }
  return files.map((f) => tokens.get(f) ?? null);
}

/** What to name each file by, or null where the viewer reads it itself. */
export async function nativeRefs(files: File[]): Promise<Array<NativeFileRef | null>> {
  const own = files.map((f) => memberOf(f));
  const asked = files.map((f, i) => own[i]?.container ?? f);
  const t = await nativeTokens(asked);
  return files.map((_, i) => (t[i] ? { token: t[i]!, member: own[i]?.name ?? '' } : null));
}
