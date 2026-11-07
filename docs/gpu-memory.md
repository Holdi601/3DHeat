---
title: GPU memory residency
parent: Rendering internals
nav_order: 5
---

# GPU memory residency

## How rows are stored on the GPU

Rows are uploaded once, when a dataset arrives, in **chunks** of 8,388,608 rows (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Each chunk is quantised against its own bounding box and time span:

| Data | Format | Bytes per row |
|---|---|---|
| Position X, Y, Z and the group id | four 16-bit unsigned integers (RGBA16UI on WebGL2); X, Y, Z within the chunk's bounding box | 8 |
| Time and lifetime (when the dataset has both time and person) | two 16-bit unsigned integers (RG16UI): time within the chunk's time span; lifetime with 65,535 meaning "no next sample" | 4 |

Per-chunk bounding boxes are what make 16 bits enough: a chunk usually covers a fraction of the map, so the quantisation step lands well under a centimetre on a map kilometres wide, far below the noise in real telemetry. The group id riding in the fourth channel is free - and is why there can be at most 4,096 groups ([Groups](sessions-persons-groups.md#limits)).

On WebGL2 each chunk is a texture 8,192 texels wide, padded to whole texture rows; rows are reached from `gl_VertexID` through a per-frame block-index texture. On WebGPU they are storage buffers.

Further per-row GPU memory, allocated on use:

- each active column [filter](filters.md): 4 bytes a row (32-bit float values or category ids), uploaded per chunk the first time the filter is used;
- [line heat](line-heat.md): 8 bytes a row (each segment's start, quantised within the data's bounding box, and its flags) while Lines mode is on.

Plus the render targets: scene colour and depth, the heat target and its scratch twin (four channels in [Team heat](team-heat.md)), and the depth-peeling layers for [occlusion](depth-and-culling.md); and the level's geometry.

## The budget is enforced at upload

WebGL accepts allocations it cannot service and then either loses the context or falls back to system memory at ruinous cost, so the GPU budget is enforced when the dataset is uploaded ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- chunks are uploaded in order (that is, in time order) while they fit;
- the first chunk that does not fit is uploaded **partially** - as many whole texture rows as the remaining budget holds - rather than not at all, so a budget that cannot hold a whole chunk still shows as much as it can, and since rows are time-ordered the part shown is a coherent stretch of time;
- everything after is **not resident**.

The shortfall is not hidden: the stats overlay shows a **Not resident** line with the number of rows that did not fit, in amber, whenever it is above zero. A truncated dataset that looks complete is the worst failure an analysis tool can have. The [fit check](memory-and-budgets.md#the-fit-check) before loading is meant to prevent this case.

The budget the renderer uses is the GPU budget from **Resource budgets**, the same figure the fit check uses - above the detected figure too, up to the slider's ceiling (see [Raising the GPU budget](memory-and-budgets.md#raising-the-gpu-budget)). It is applied when a dataset is uploaded; changing it afterwards takes effect on the next load.
