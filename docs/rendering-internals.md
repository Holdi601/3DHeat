---
title: Rendering internals
nav_order: 9
has_children: true
---

# Rendering internals

How the viewer draws tens of millions of rows at interactive frame rates, and how it makes sure the picture it shows is the right one. This section is for anyone who wants to understand a number in the stats overlay, tune the Performance panel, or work on the renderer.

## The core problem

A sum of overlapping radial ramps costs *N* × π*r*² blended fragments per frame. At 100 million sprites of 8 px radius that is 2 × 10¹⁰ fragments - about a second of work on a high-end GPU. It cannot be brute-forced every frame, so the viewer combines:

- **time-sorted rows** - a timeline window is two binary searches, and playback cost follows the rows in the window, not the dataset;
- **nothing per row on the CPU per frame** - rows live in GPU memory, quantised; filters, group signs, the lifetime test, the window, culling and the slice are all evaluated in the vertex shader;
- **stratified sampling** with compensating weights when a frame cannot draw every row, and **progressive accumulation** that converges to the exact all-rows answer while the view is still ([Sampling and budgets](sampling-and-budgets.md), [Accumulation](accumulation.md));
- **a two-stage throttle** that trades sprites per frame, then heat resolution, for frame rate ([Sampling and budgets](sampling-and-budgets.md#the-adaptive-budget));
- **enforced memory budgets**, so a dataset that does not fit is truncated visibly rather than crashing ([GPU memory residency](gpu-memory.md)).

## One frame

The frame loop is [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Everything that changes at frame rate - camera, playhead, budget - lives in the engine, not in the application state, so a frame costs no React work; the state is read once per frame and written back only for low-frequency readouts.

1. **New data?** A new dataset is announced (*Uploading N rows to the GPU*) on one frame and uploaded on the next, so the message is painted before the work blocks the thread. A new level is handed to the renderer; line heat routes are built or freed.
2. **Playhead** advances (capped at 0.1 s of wall time per frame), loops or stops.
3. **Camera** reads keys, mouse and gamepad; the axis mirror is folded into the view matrix; on WebGPU a depth-remap matrix converts three.js's OpenGL-style depth range to WebGPU's.
4. **What is visible**: the time range from the timeline and history; the group sign table (visibility only under a split by a column); up to four filters - column filters and the Entities selection; the difference split.
5. **Colour and curve tables** are rebuilt if their settings changed.
6. **Budget**: the adaptive controller sets this frame's sprite budget and heat resolution; with *Draw every row each frame* the budget is raised to cover every candidate row.
7. **Signatures** decide what the accumulation buffer still means: a change to anything that alters what rows contribute or how (*geometry*), to the time window, or only to how the result is coloured (*composite*). See [Accumulation](accumulation.md#what-restarts-it).
8. **Sampling plan**: which blocks of rows to draw ([Sampling and budgets](sampling-and-budgets.md)).
9. **Accumulation mode**: reset, extend, moving average, running mean, or idle.
10. **Box replay geometry** (cubes, trails) on the CPU, only in that mode and only when not idle.
11. **Render**: the backend draws the scene (level, grid, axes, boxes, trails, ruler), splats the heat into the heat target, merges it into the accumulator, and composites heat over scene to the canvas.
12. **Auto-exposure** fires when its countdown reaches zero; the ruler's heat probe reads one pixel at most every 120 ms; readouts are published.

An idle frame - converged, nothing changed - skips the scene and the splatting but still **recomposites**: a WebGL canvas created without `preserveDrawingBuffer` has undefined contents after compositing, so trusting it to keep showing the last frame is not safe. The scene and heat targets are the viewer's own framebuffers and do retain, so an idle frame costs one fullscreen pass.

## Pages in this section

- [The two backends](backends.md) - WebGPU and WebGL2, how one is chosen, URL switches
- [Accumulation](accumulation.md) - reset, extend, moving average, running mean
- [Sampling and budgets](sampling-and-budgets.md) - the stratified sampler, exact mode, the adaptive budget
- [Half-float accumulation](half-float-accumulation.md) - range and precision on 16-bit targets
- [GPU memory residency](gpu-memory.md) - quantised row storage and the enforced GPU budget
- [Software rendering detection](software-rendering.md)
- [Performance panel and stats overlay](performance-and-stats.md)
