---
title: Performance panel and stats
parent: Rendering internals
nav_order: 7
---

# Performance panel and stats overlay

## The stats overlay

The box at the top right of the view in the Heatmap and Match tabs ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). It reads the engine's live readout every animation frame.

| Line | Meaning |
|---|---|
| **Backend** | *WebGPU* or *WebGL2*. Hover for the reason WebGPU was not used, when it was not. See [The two backends](backends.md). |
| **FPS** | Frames per second, averaged over at least 0.4 s. |
| **Frame** | Frame time in ms, smoothed (90% previous, 10% new). This is the time between frames, not GPU time - no per-pass GPU timing is measured. |
| **Rows in window** | Candidate rows: the rows in the current time window, before per-row filtering in the shader. |
| **Sprites / frame** | Sprites the last frame's plan submitted (kept at the planned figure on idle frames, which draw nothing). |
| **Budget** | The sprite budget this frame was planned with - the adaptive controller's value, raised to all candidates when drawing every row. |
| **Heat res** | The heat buffer's resolution as a share of the canvas: the *Heat resolution* setting times the adaptive stage-two scale. |
| **Coverage** | How far the progressive accumulation has got towards using every row: a percentage while converging (amber), *exact* when done. A noisy frame is never mistaken for the finished picture. |
| **Cubes** | Boxes drawn in [box replay](box-replay.md). |
| **Not resident** | Shown only when rows did not fit in the GPU budget: how many. See [GPU memory residency](gpu-memory.md). |

## The speed display

At the bottom right of the view, in perspective only: the fly speed and the time to cross the data at that speed. Drag it to change the speed. See [Camera](camera.md#fly-speed).

## The Performance panel

| Control | Default | Effect |
|---|---|---|
| Hint | | Each frame splats a stratified random subset of the visible rows with weight scaled to compensate, so the expected heat is exact at any budget; holding the view still keeps merging frames until every row has contributed. |
| **Draw every row each frame** | on | Every frame that starts a fresh estimate draws every candidate row (up to about 268M); the budget below becomes a floor. [Sampling and budgets](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Adaptive budget** | on | Tune sprites per frame, then heat resolution, to hold the target frame rate - and stop cutting when cutting does not help. [Sampling and budgets](sampling-and-budgets.md#the-adaptive-budget) |
| **Target FPS** | 60 | 20-240 (1000 with the handle). Values below 15 are treated as 15. |
| **Starting sprites / frame** / **Sprites / frame** | 4.00M | 65,536-268,435,456, logarithmic. Named *Starting* while adaptive is on, because the controller moves it. |
| **Heat resolution** | 100% | 25-100%. Fragment cost scales with the square: 50% quarters the blend work, and the heat field is smooth enough that it barely shows. |
| **Progressive refinement** | on | Accumulate across frames while the view is still. Off shows the single-frame estimate every frame. [Accumulation](accumulation.md) |
| **Resource budgets** | detected | RAM, GPU and parser-thread budgets. [Memory and budgets](memory-and-budgets.md#resource-budgets) |

None of these are saved; a reload restores the defaults.

## Reading slow frames

- **Rows in window much larger than Sprites / frame, Coverage below 100%** - the frame cannot draw everything; it converges over several frames when still. Narrow the window, filter, or cull to reduce the candidates; or accept the sampling.
- **Sprites / frame equal to Rows in window, frame still slow** - the cost is per sprite on screen: lower the *Max pixel radius* ([Sprite shape](sprite-shape.md#pixel-clamps)) or the *Heat resolution*.
- **Slow with few rows** - likely the level: large structure counts with edges on, ground triangles, depth of field. See [Level appearance](level-appearance.md).
- **Everything slow, and a red banner** - software rendering ([Software rendering detection](software-rendering.md)).
