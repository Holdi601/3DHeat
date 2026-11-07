import { Webgl2Renderer } from './webgl2/renderer';
import { WebgpuRenderer } from './webgpu/renderer';
import { GpuInitError, type BackendKind, type Renderer } from './types';
import { t } from '../i18n';

export type BackendPreference = 'auto' | 'webgpu' | 'webgl2';

export interface RendererCreation {
  renderer: Renderer;
  backend: BackendKind;
  /**
   * Why the preferred backend was not used, when it wasn't.
   *
   * Surfaced rather than swallowed: "this is slower than expected" is
   * unanswerable without knowing which backend is actually running.
   */
  fallbackReason: string | null;
}

/**
 * Build a renderer, preferring WebGPU and falling back to WebGL2.
 *
 * A single canvas can only ever hold one context type, so this has to commit
 * before any drawing happens — hence the attempt-then-fall-back shape rather
 * than deciding lazily. WebGPU initialisation is asynchronous, which is the
 * reason renderer creation is a function rather than a constructor.
 */
export async function createRenderer(
  canvas: HTMLCanvasElement,
  preference: BackendPreference = 'auto',
): Promise<RendererCreation> {
  let fallbackReason: string | null = null;

  if (preference !== 'webgl2') {
    if (!navigator.gpu) {
      fallbackReason = t('render.backend.unavailable', { api: 'WebGPU' });
    } else {
      try {
        const renderer = await WebgpuRenderer.create(canvas);
        return { renderer, backend: 'webgpu', fallbackReason: null };
      } catch (err) {
        fallbackReason = err instanceof Error ? err.message : String(err);
      }
    }
    if (preference === 'webgpu') {
      throw new GpuInitError(fallbackReason ?? t('render.backend.initFailed', { api: 'WebGPU' }));
    }
  }

  const renderer = new Webgl2Renderer(canvas);
  return { renderer, backend: 'webgl2', fallbackReason };
}
