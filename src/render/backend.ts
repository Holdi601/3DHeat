/**
 * What draws the viewer, behind one interface.
 *
 * The engine (`engine.ts`) drives a `RenderBackend` and nothing else. Two run in
 * the page, chosen by `createRenderBackend` (WebGPU, falling back to WebGL2);
 * the third, `native`, is the native app's viewport, drawn with wgpu (Vulkan
 * by default) under a transparent page (`native/nativeRenderer.ts`,
 * `docs/native-app.md`, Stage 5 preview, behind a setting).
 */

import { createRenderer, type BackendPreference, type RendererCreation } from './createRenderer';
import type { BackendKind, Renderer } from './types';

/** `remote`: a host's viewport streamed as video (Stage 8). Not built yet. */
export type RenderBackendKind = BackendKind | 'remote';

export type RenderBackend = Renderer;

export type { BackendPreference, RendererCreation };

/** A backend for `canvas`: WebGPU when it starts, else WebGL2 (`createRenderer`). */
export const createRenderBackend: (canvas: HTMLCanvasElement, preference?: BackendPreference) => Promise<RendererCreation> =
  createRenderer;
