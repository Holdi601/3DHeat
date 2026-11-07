---
title: The two backends
parent: Rendering internals
nav_order: 1
---

# The two backends

The viewer has two complete renderers behind one interface ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) and **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Both draw the same picture with the same algorithms; the shaders exist in WGSL and GLSL ES 3.00 side by side. The stats overlay's first line, **Backend**, says which one is running; hovering it shows why WebGPU was not used, when it was not.

## How one is chosen

A canvas can hold only one kind of context, so the choice is made once, before any drawing ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Unless WebGL2 is forced: if `navigator.gpu` exists, request an adapter with `powerPreference: 'high-performance'` and a device, and create the WebGPU renderer. Any failure is remembered as the reason.
2. If WebGPU was forced and failed, stop: the view shows *Cannot initialise the renderer.* with the reason.
3. Otherwise create the WebGL2 renderer (also asking for the high-performance adapter). If WebGL2 is unavailable, or cannot render to float textures (`EXT_color_buffer_float`), the view shows the error.

`powerPreference: 'high-performance'` is what stops a laptop with switchable graphics handing the page its integrated GPU. Beyond that the page has no say: hardware acceleration is a browser setting.

## URL switches

Append to the page address, for example `http://127.0.0.1:5273/?backend=webgl2`.

| Parameter | Effect |
|---|---|
| `?backend=webgpu` | Use WebGPU or fail. |
| `?backend=webgl2` | Use WebGL2 even where WebGPU is available - separates "this renders wrong" from "this renders wrong on WebGPU". |
| `?heat=f16` | Force the 16-bit heat accumulation path on either backend ([Half-float accumulation](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: read GL errors during the frame and expose them on `renderer.heatDebug`. Off by default because `getError` is a pipeline sync point. |
| `?occdebug=<n>` | WebGL2 developer aid: replaces the heat with occlusion debug values. Not for normal use. |

## Differences that matter

| | WebGPU | WebGL2 |
|---|---|---|
| Row storage | Storage buffers: a row index is an array subscript. Asks for the adapter's largest storage-buffer binding and buffer sizes. | Integer textures (8,192 texels wide) addressed from `gl_VertexID` through a per-frame block-index texture. |
| 32-bit heat accumulation | When the adapter offers both `float32-blendable` and `float32-filterable` | When `EXT_float_blend` is present |
| Otherwise | 16-bit (`r16float`) | 16-bit (`R16F`) |
| Depth range | [0, 1]; the engine premultiplies a remap of three.js's [-1, 1] matrices. Without it, a parallel projection - whose depth is linear - lands almost entirely below 0 and is clipped away silently. | [-1, 1], used as is |
| Uniforms | A ring of 256-byte-aligned slots, one per draw, bound by offset - `queue.writeBuffer` is ordered on the queue, so one buffer rewritten per draw would make every draw read the last write. The heat pass's uniform block is exactly one 256-byte slot. | Ordinary uniforms |
| Heat target below canvas resolution | Gets its own depth texture (every attachment in a pass must be the same size) | |
| Frame capture | `captureFrame()` renders the composite a second time into an offscreen target and reads it back (headless Chromium renders WebGPU but never composites its canvas) | Reads the default framebuffer back on the next rendered frame |
| Readback | Staging buffers kept and reused; one reader in flight at a time | `readPixels`, asking the driver which format/type pair is legal |

Both backends upload the sprite curve table as half floats; WebGPU's `queue.writeTexture` copies raw bytes, so the data is encoded to binary16 first ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

### Texture limits

`texStorage2D` past `MAX_TEXTURE_SIZE` does not throw: the allocation is dropped, later uploads fail and sampling returns zero. The WebGL2 helper [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) checks both dimensions against the limit and throws with the size, the block-index texture is two-dimensional (4,096 wide) so it cannot outgrow a limit, and `src/render/limits.test.ts` pins every texture dimension against the limits worth supporting. The WebGL2 renderer also refuses a device whose maximum texture size is below the row texture's 8,192 width.

## Testing both

`npm run smoke` drives the real app in headless Chromium on WebGL2 (by default `http://127.0.0.1:5273/`); pass `"http://127.0.0.1:5273/?backend=webgpu"` to `node tools/smoke.mjs` for WebGPU, and `npm run smoke:f16` for the half-float path. `tools/probe-webgpu.mjs` and `tools/probe-present.mjs` diagnose adapter and presentation availability in headless browsers.
