---
title: Sampling and budgets
parent: Rendering internals
nav_order: 3
---

# Sampling and budgets

## Candidate rows

Rows are stored in ascending time. The timeline window [*lo*, *hi*] becomes a row range with two binary searches over the time column ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); without a time column every row is a candidate. These are the **Rows in window** of the stats overlay. Per-row tests - filters, groups, split, culling, slice, lifetime - happen later, in the shader; a row that fails costs one vertex invocation and no fragments.

## The sampling plan

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) divides the candidate range into **blocks of 4,096 consecutive rows** and picks how many to draw from the frame's sprite budget:

- If the budget covers every block, all are drawn - the frame is exact.
- Otherwise blocks are taken at an even stride across the range, offset by a jitter that advances by the golden ratio every frame, so successive frames cover different blocks and the union fills in evenly. This is a **stratified** sample: every part of the time range is represented in every frame.

Each drawn row's heat is multiplied by **candidates / submitted**, so the expected heat of a frame is exact at any budget; only the noise depends on the budget. Rows live in chunks of 8,388,608 (see [GPU memory residency](gpu-memory.md)); a block is split where it crosses a chunk, and each chunk gets the list of block starts it must draw.

One plan can carry at most 65,536 blocks - 268,435,456 sprites - because both backends hold a fixed 65,536-slot block-start buffer. A request for more is capped there, and the shortfall shows up honestly as more frames to converge.

## Draw every row each frame

**Performance → Draw every row each frame** (default **on**): the budget becomes a floor rather than a ceiling, and a frame that starts a fresh estimate draws every row it is responsible for (up to the 268M cap).

The reason: a camera move discards the accumulation, so a moving frame is a single estimate whose noise is set by how much of the data it drew - with a quarter of it drawn, you see a quarter of it in bright weighted dots, which is what makes a moving view glitter. Drawing everything makes every frame the finished picture. The cost is that frame time now follows the size of the data in the window; the levers are a narrower time window, filters, or a distance cull, which reduce the candidates rather than sampling them more thinly.

Turn it off on hardware that cannot afford the whole field at once: *Sprites / frame* is then a real limit, and the view converges over a few still frames instead.

What a full plan costs, measured on an RTX 5080 at a 4K canvas with a 14M triangle level, sprites of 1 m radius (a pixel or two): 100M sprites a frame at 30 fps, 134M at 20 fps, 200M at 15 fps, all 264.6M of the largest load at 12 fps. With sprites that small the vertex stage is the whole cost, and heat resolution changes nothing; with large sprites the fill is: 8M sprites of 100 m radius took 2.5 s a frame at full heat resolution and 170 ms at 25%. **Draw every row each frame** therefore starts at 67M and climbs by a quarter a frame while frames take under 150 ms, and halves while they take over 400 ms, so that a heavy view cannot run a frame past what the GPU's watchdog allows.

## The adaptive budget

**Performance → Adaptive budget** (default on) tunes the sprite budget to hold **Target FPS** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). It is idle in box replay and during video renders.

The input is the frame time, smoothed (90% previous + 10% new, with single frames capped at 2 s), against a target of 1000 / max(15, target FPS) ms.

**Stage one - sprites.** Each frame the budget is multiplied by `1 + (target / frame - 1) × gain`, with a gain of 0.35 when too slow and 0.08 when there is headroom, clamped to a factor of 0.5-1.25 per frame and to 65,536-268,435,456 sprites.

**Stage two - resolution.** Only when the budget is already at its floor and frames are still more than 10% too slow does the heat buffer's resolution drop, by 8% per frame, down to 25% of the canvas; it recovers by 4% per frame while there is 30% headroom. Fragment cost falls with the square of the resolution, which is nearly invisible under a smooth ramp. (Measured on software rendering with 10M rows and oversized sprites: 141 ms → 17 ms per frame.) The scale is rounded to sixteenths; the overlay's *Heat res* shows it.

**Giving up.** A slow frame looks the same whether the sprites caused it or a heavy level did - there is no per-pass timing. If the budget sits at its floor and frames stay below 70% of the target for 30 frames, the sprites were not the cost: the controller switches to **climbing**, multiplying the budget by 1.5 every 14 frames and restoring the resolution, as long as frame time stays within 1.5× of what it was at the floor. A climb that makes things worse than that cuts back to 60% and resumes normal control; reaching the target ends the climb.

With the adaptive budget off, the budget is simply **Sprites / frame**.

With *Draw every row each frame* on, the adaptive budget still runs, but the exact rule raises the budget to cover all candidate rows, so in practice it controls only the resolution stage and frames that do not start a fresh estimate.

## Performance panel controls

| Control | Default | Range (jog) |
|---|---|---|
| **Draw every row each frame** | on | |
| **Adaptive budget** | on | |
| **Target FPS** | 60 | 20-240 (1000) |
| **Starting sprites / frame** (adaptive) or **Sprites / frame** | 4.00M | 65,536-268,435,456, logarithmic (268,435,456) |
| **Heat resolution** | 100% | 25-100%, multiplied by the adaptive stage-two scale |
| **Progressive refinement** | on | Off: every frame is a fresh single-frame estimate (useful to see the raw sample). |

See also [Performance panel and stats overlay](performance-and-stats.md).
