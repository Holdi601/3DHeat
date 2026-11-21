/**
 * What draws the viewer, behind one interface.
 *
 * The engine (`engine.ts`) drives a `RenderBackend` and nothing else. Two run in
 * the page today, chosen by `createRenderBackend` (WebGPU, falling back to
 * WebGL2); a third is planned for the native app, a viewport the app's core
 * draws with wgpu (Vulkan by default) under a transparent page
 * (`docs/native-app.md`, Stage 5). It will be one more kind behind the same
 * interface.
 */

import { createRenderer, type BackendPreference, type RendererCreation } from './createRenderer';
import type { BackendKind, Renderer } from './types';

/** `remote`: the native app's own viewport, drawn by its core. Not built yet. */
export type RenderBackendKind = BackendKind | 'remote';

export type RenderBackend = Renderer;

export type { BackendPreference, RendererCreation };

/** A backend for `canvas`: WebGPU when it starts, else WebGL2 (`createRenderer`). */
export const createRenderBackend: (canvas: HTMLCanvasElement, preference?: BackendPreference) => Promise<RendererCreation> =
  createRenderer;
