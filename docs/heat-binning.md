---
title: Heat binning
parent: Rendering internals
nav_order: 8
---

# Heat binning

On WebGPU, the heat of a large load is binned instead of splatted: each row adds its weight to a screen grid, and one pass then lays the sprite's kernel over that grid. The picture is the same, and a moving frame can draw every row instead of a sample of them.

## Why

Splatting draws one triangle per row and lights every texel the sprite covers. At a pixel or two per sprite that tops out near 2 × 10⁹ rows a second, the vertex stage's limit. So at 60 fps a frame can draw only about 3 × 10⁷ rows exactly, and a moving view of 100 million rows draws a sample, which shows as grain. Binning costs a row a few atomic adds, whatever its size. The fold then costs the grid's texels times the kernel's footprint, whatever the row count.

## What is binned, and what still splats

| Case | Path | Why |
|---|---|---|
| Heat, team colours, difference (any split, sides normalised or not), value weight | Binned | What a row adds is linear in its weight, so a cell's sums carry it exactly |
| Perspective (every row its own radius) | Binned | A cell keeps its rows' mean radius, and the rows in one texel are at nearly one depth |
| Clamps, zoom invariance, lifetime fade, time window, slice, volumes, filters, culling, ground projection | Binned | Per-row rules, run by the same shader code as the splat |
| Sprites larger than 16 heat texels | Splatted from a list, in the same pass | A wide kernel costs the fold the square of its reach on every texel |
| Sprites across an occlusion edge (a wall's or a hill's outline) | Splatted from a list | The splat dims part of such a sprite, per fragment; a cell can only dim it all or none |
| Line heat, directional wedges, the direction field, the rate map | Splatted | Their kernels are not one radial function of distance |
| WebGL2 | Splatted | No compute shaders |
| Few rows (under a quarter per heat texel) | Splatted | The grid's fixed passes cost more than splatting so few |
| A grid over 768 MB (a 4K canvas with team colours at full heat resolution) | Splatted | Too much of the card for one pass |

`?heatbin=0` keeps every frame on the splat, and `?heatbin=1` bins wherever binning can. The path is decided again on every frame.

## How it matches the splat

- **The same rules per row.** The bin shader is the splat's vertex shader, cut from its source text at load time ([`heatBin.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgpu/heatBin.ts)). Filters, groups, the split and its sides, value weights, the lifetime fade, the slice, volumes, culling, the clamps and the zoom-invariant weight are therefore one piece of code in both paths.
- **The kernel averaged over a cell.** The fold does not place a cell's weight at its centre. It uses the kernel averaged over the cell, which is the expected splat of a row anywhere in that cell. A table of it is built on the GPU whenever the sprite shape changes.
- **A first-moment term.** Each cell also sums where in the cell its weight lies. The fold adds the kernel's first moment times that sum, which is exact when the rows thin out linearly across the cell. Without it, steep density edges and the difference mode (where large positive and negative sums cancel) were 1-3% off.
- **Sparse cells exactly.** A cell that holds no more than 8 rows keeps their positions (to 1/256 of a texel), weights and radii. The fold draws those rows exactly as the splat would. The rim of the data and one-sample-a-person views are then the splat's, texel for texel.
- **Wide and straddling sprites splatted.** Sprites larger than 16 heat texels, and sprites whose visibility differs across their footprint (tested at the centre and at 8 points on the rim), go to a list. The splat's own shader draws that list in the same pass. A list that overflows (4 million rows a frame) bins the rest: large ones at 16 texels with their heat kept by area, straddling ones as their centre has them.
- **Fixed point.** The sums are 64-bit integers built from 32-bit atomics. Rounding is stochastic, so a row lighter than one step still adds its weight on average.

## Parity

`node tools/probe-heat-binning.mjs --parity` converges one synthetic load with each path, in every case binning takes, and compares the heat fields. It checks p50, p90 and p99 of the texels the splat lit, and SSIM of the fields as the ramp shows them. It exits 1 when any case drifts past 1% or under SSIM 0.99. Measured on 2 million rows at 1280×800 on an RTX 5080:

| Case | Worst of p50/p90/p99 | SSIM |
|---|---|---|
| Heat, perspective / orthographic | 0.06% / 0.07% | 1.0000 |
| Radius 2 (sprites at the 1 px floor) | 0.95% | 0.998 |
| Radius 30 / radius 150 (list) | 0.15% / 0.07% | 0.9999 / 1.0000 |
| Min clamp 3 px, max clamp 1.5 px, not zoom-invariant | 0.32% / 0.58% / 0.25% | ≥ 0.999 |
| Hard disc, curve ramp, ground projected, half resolution | ≤ 0.39% | ≥ 0.9996 |
| Team colours, all four channels | ≤ 0.71% | ≥ 0.999 |
| Difference (perspective, orthographic, sides normalised) | ≤ 0.44% | ≥ 0.9999 |
| Behind walls (heat, team colours, radius 30) | ≤ 0.74% | ≥ 0.9993 |
| Fixed window, lifetime fade | ≤ 0.12% | 1.0000 |

The totals of signed fields differ by more (up to a few percent of a net that is itself near zero). That is the splat's own variation: what a 1 px sprite adds depends on where in its pixel it lands.

## Cost

`node tools/probe-heat-binning.mjs --perf 20,100` measures frames under camera motion, zoom, radius change and playback, with the adaptive budget on and *Draw every row each frame*. Add `--dir` for Parquet files of `probe-row-ceiling.mjs`. On an RTX 5080 at 1920×1080:

| Rows | Path | Heat GPU p50 / p99, orbiting | Rows a moving frame |
|---|---|---|---|
| 20M | WebGPU splat, before | 3.7 / 5.7 ms | 38% |
| 20M | WebGPU splat, with the reserve | 7.4 / 11.5 ms | 46% |
| 20M | WebGPU binned | 0.7 / 0.8 ms | 100% |
| 20M | WebGL2 splat, before / after | 4.2 / 6.3 ms, 5.0 / 9.7 ms | 35% / 35% |
| 100M | WebGPU splat, before | 3.1 / 6.7 ms | 22% |
| 100M | WebGPU splat, with the reserve | 4.3 / 9.4 ms | 30% |
| 100M | WebGPU binned | 2.5 / 3.0 ms | 100% |
| 100M | WebGL2 splat, before / after | 3.3 / 5.7 ms, 3.0 / 6.1 ms | 6% / 7% |
| 300M | WebGPU splat, before | 2.5 / 5.1 ms | 4% |
| 300M | WebGPU splat, with the reserve | 5.8 / 9.0 ms | 8% |
| 300M | WebGPU binned | 1.9 / 4.2 ms | 50% |
| 300M | WebGL2 splat, before / after | 3.3 / 5.9 ms, 3.1 / 6.7 ms | 3% / 5% |

Binned, zooming, changing the radius and playing back cost the same as orbiting (at most 4.4 ms of GPU for the whole frame at 300M). At 300M the binned frame draws half the rows because of the draw plan's capacity (268 million rows), not because of their cost.

Frame times from `requestAnimationFrame` are reported too. On a loaded machine they show 33-35 ms spikes even with no data loaded, so the probe also gives the engine's own CPU time per frame and the GPU time of all passes. Those two say whether the app can hold 60 fps.

The GPU memory is about 130-200 bytes per heat texel, depending on the mode: the sums, the counts, the sparse cells' rows, and the grid's float copy. At 1920×1080 that is 290-430 MB, outside the GPU budget for row data. It is allocated on first use and grows only, and the grids of the last four heat levels are kept so that a level change allocates nothing.

## The regulator's reserve

Where the GPU times every pass (WebGPU), the heat's budget is 62% of the frame less what the level, the composite and the other passes took. Before, the heat alone got 45% less a quarter of the scene. The cap also grows from under seven tenths of that budget, up to 0.85 of it, where it used to grow only from under half, up to seven tenths. That had left the heat at a quarter of the frame and the GPU idle for the rest. Where the heat is binned, a radius or zoom change no longer moves the cap, because a binned row costs the same at any size. On WebGL2, where only the heat pass is timed, the share stays at 45%.
