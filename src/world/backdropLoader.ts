import { msg, say } from '../data/msg';
import type { BackdropRequest, BackdropResult } from './backdrop';
import type { BackdropWorkerRequest, BackdropWorkerResponse } from './backdropWorker';

/**
 * Main-thread client for the backdrop worker. One build at a time: a second
 * request, or a cancel, terminates the worker running the first.
 */
class BackdropLoader {
  private worker: Worker | null = null;
  private nextId = 1;
  private reject: ((e: Error) => void) | null = null;

  /** Whether a build is running. */
  get busy(): boolean {
    return this.worker !== null;
  }

  build(req: BackdropRequest, onProgress?: (label: string, fraction: number | null) => void): Promise<BackdropResult> {
    this.cancel();
    const worker = new Worker(new URL('./backdropWorker.ts', import.meta.url), { type: 'module' });
    this.worker = worker;
    const id = this.nextId++;
    return new Promise<BackdropResult>((resolve, reject) => {
      this.reject = reject;
      const end = () => {
        worker.terminate();
        if (this.worker === worker) {
          this.worker = null;
          this.reject = null;
        }
      };
      worker.onmessage = (ev: MessageEvent<BackdropWorkerResponse>) => {
        const m = ev.data;
        if (m.id !== id) return;
        if (m.kind === 'progress') {
          onProgress?.(say(m.label), m.fraction);
          return;
        }
        end();
        if (m.kind === 'error') reject(new Error(typeof m.message === 'string' ? m.message : say(m.message)));
        else resolve(m.result);
      };
      worker.onerror = (ev) => {
        end();
        reject(new Error(ev.message || say(msg('heat.world.error.crashed'))));
      };
      worker.postMessage({ id, ...req } satisfies BackdropWorkerRequest);
    });
  }

  cancel(): void {
    this.reject?.(new Error(say(msg('heat.world.error.cancelled'))));
    this.reject = null;
    this.worker?.terminate();
    this.worker = null;
  }
}

export const backdropLoader = new BackdropLoader();
