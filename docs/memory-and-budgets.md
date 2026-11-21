---
title: Memory and budgets
parent: Getting data in
nav_order: 6
---

# Memory, budgets and the fit check

Your computer has limited memory. 3DHeat adds up what your files need and tells you before **Load** whether they fit.

![The Memory estimate at won't fit, with Load every [N] row pre-filled and the Load button reading Too large - reduce or decimate](assets/img/en/memory-and-budgets-wont-fit.webp)

*Too big for this computer? 3DHeat suggests loading every Nth row instead.*

A browser tab that runs out of memory partway through a load crashes and loses minutes of work, and a GPU asked for more than it has either loses its context or slows to a crawl. So before a load starts the Source panel says how much memory it needs, compares that with budgets detected for this machine, and refuses - with a way out - when it will not fit. The model is in [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## The memory estimate

Shown above the **Load** button once the rows have been counted.

| Line | Meaning |
|---|---|
| **Memory estimate** - *fits* / *tight* / *won't fit* | The verdict, green, amber or red. |
| `N rows · B B/row` | Rows that will be loaded (after the stride) and the steady bytes per row. |
| `RAM X resident, Y peak while loading` | Memory held once loaded, and the high-water mark during the load. |
| `GPU Z · est. load T` | GPU memory for the rows, and an estimated duration at 1.2 million rows per second. |
| GPU name | The renderer's name, when the driver reports it. |
| Messages | Why it does not fit, or is tight, and what to do. |
| **Load every [N] row** | The decimation stride (see below). |
| `Budget: X RAM, Y GPU. Adjust under Performance → Resource budgets.` | The budgets the check used. |

### Bytes per row

| Column | Steady (RAM) | Notes |
|---|---|---|
| Position | 12 | Three 32-bit floats, always (a flat axis is still an array) |
| Time | 4 | When mapped |
| Lifetime | 4 | When time and person are mapped |
| Person | 4 | When mapped |
| Group | 2 | When mapped |
| Session | 4 | When mapped |
| `Source file` | 4 | When more than one file is loaded |
| Each filter column | 4 | Per ticked *Keep for filtering* column |

The **peak** adds what the load needs only transiently - 8 bytes of 64-bit time while merging, 12 bytes of sort keys and indices, 4 bytes of permutation scratch (all three when time is mapped), and 4 bytes while the group column is still 32-bit - and multiplies the sum by **2.0**. That factor was measured (a real multi-file load peaked at 1.9× the itemised arrays, from the Parquet decoder's working set, the copies that trim each column to length, and memory released but not yet returned) and rounded up, because an under-estimate costs a crashed tab while an over-estimate only costs an unnecessary stride.

On the **GPU** each row costs 8 bytes (position and group, 16 bits each), plus 4 bytes (time and lifetime, 16 bits each) when both time and person are mapped. See [GPU memory residency](gpu-memory.md). Filter textures (4 bytes a row per active filter), line heat's segment starts (8 bytes a row while Lines mode is on) and, on WebGPU, the heat binning grid (130-200 bytes per heat texel, 290-430 MB at 1920×1080; see [Heat binning](heat-binning.md)) are not part of this estimate. Rows are held in chunks of 8.4 million, each in buffers of its own, so no GPU buffer limit binds: 420 million rows (4.7 GiB) were resident with WebGL2 and 300 million with WebGPU on a 16 GB card. What decides the rows on the GPU is the GPU budget; rows past it are listed as not resident under **Memory in use**.

## The fit check

Three constraints are compared ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- peak RAM against the **RAM budget**,
- GPU bytes against the **GPU budget**,
- the row count against the **sort ceiling** of 400,000,000 rows, when a time column is mapped.

The worst of the three ratios decides: up to 70% *fits*, up to 100% *tight* (it should load, but expect it to be slow), above *won't fit*. When it will not fit, the panel names the binding constraint and suggests:

- loading every *N*th row, with *N* = ⌈rows / rows that fit⌉, pre-filled in the stride box;
- dropping filter columns, unmapping the time column (which removes the sort and its ceiling, at the cost of the timeline), or raising the budget.

When the budget itself is not a fact about the hardware - the browser capped the RAM figure, the default was held down by what is free right now, or the GPU figure is a guess - the message says so, so you do not reach for a stride you do not need.

### Decimation

**Load every [N] row** keeps one row in *N*, counted per file. Heat is an average, so every *N*th row gives the same distribution with more noise - the same trade the renderer already makes every frame. The box starts at 1 (*row (all)*); when the selection does not fit, it is pre-filled with the suggested stride unless you have typed into it. The Load button then reads *Load N files (1 in K)*, and the dataset's name records `every Kth row`.

### The sort ceiling

The renderer needs rows in ascending time order, so a mapped time column means sorting every row, with a radix sort over 32-bit keys ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Past **400 million** rows that is refused rather than attempted in a tab. This is checked before the load, so a selection over the limit is refused with a stride suggestion instead of being read in full and failing at the last step. Near the limit (*tight*) the panel warns that the sort is a long pass with no progress of its own. Without a time column no sort happens and no ceiling applies.

## Resource budgets

**Performance → Resource budgets** (a collapsible line at the bottom of the Performance panel, which reads `Resource budgets - RAM, GPU, cores`). The budgets are detected; the detected figure is the default; and the sliders go no higher than a **ceiling** that is the detected figure except where the detection is known not to be a measurement.

| Control | Range | Meaning |
|---|---|---|
| **RAM for row data** | 256 MiB to the RAM ceiling, logarithmic | The RAM budget for the fit check. Marked *(above detected)* past the detected default, *(max)* at the ceiling. |
| **GPU for row data** | 128 MiB to the GPU ceiling, logarithmic | The GPU budget for the fit check and for uploading rows. Marked *(above detected)* past the detected default, *(max)* at the ceiling. |
| **Parser threads** | 1 to the logical core count | How many files a load parses at once, each in a worker of its own. Default cores - 2 (cores - 1 on four cores or fewer). See [Parser threads](#parser-threads) (under For developers). |
| Sources line | | Where each figure came from (`RAM: …. GPU: …. CPU: ….`). |
| **Re-detect** | | Asks the dev server for a fresh memory reading and recomputes every budget. |
| GPU name | | The adapter's short name; the full renderer string is the tooltip. |

### Raising the GPU budget

A GPU budget above the detected figure applies as set: the fit check and the upload take the same figure from one function ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), which caps it only at the GPU ceiling the slider stops at. So a load the check passes is uploaded in full. Past the detected figure the slider reads *(above detected)*: the number is then your judgement of the card, not a measurement, and setting it higher than the card has risks a lost context or a crawl.

## Memory in use

Once a dataset is loaded, **Memory in use** (in the Source panel) shows what is resident, read from the arrays themselves rather than from the estimate:

| Line | Meaning |
|---|---|
| **RAM** | The dataset's columns in memory, against the RAM budget. |
| **GPU** | Row data and the level on the GPU, against the GPU budget, with the rows resident and the rows that did not fit. Read from the renderer's own counters, without a GPU readback. |
| **JavaScript heap** (developer tools) | The tab's heap and its limit, where the browser reports them (Chromium). On a cross-origin-isolated page **Measure everything** asks `performance.measureUserAgentSpecificMemory`, which includes the workers. |
| Column list (developer tools) | Each column and what it holds, biggest first. Built-in fields are marked *(built in)*; text labels are estimated at two bytes a character. |
| **On demand** | For a load with columns read later: how many of them are in memory and what they hold, the row map, and how many were evicted. Each column is listed with its state - *in the file*, *reading*, *in memory*, *evicted*, *failed* - most recently used first; **Free** gives a column's memory back (never one a filter, the split, the value weight or the route events use). |

When a column read on demand needs room, the least recently used columns that nothing uses are evicted first, until it fits the RAM budget. Only the copy in memory goes: the renderers' copies on the GPU stay until the GPU budget wants the room, so a column read again finds its upload still there.

When both RAM and GPU are under a quarter of their budgets, the panel says so and offers **Use more fidelity**: full-resolution heat and at least 8 million sprites a frame.

## Huge datasets: the levers

From cheapest to most drastic:

1. **A pre-filter.** Keep only the rows you need (for example kills and deaths) while reading; the rest never take memory. See [Pre-filter and column costs](pre-filter-and-column-costs.md).
2. **Columns read later.** A column marked *later* stays in the files until a filter or panel needs it and costs nothing at load; see [Read later: columns on demand](pre-filter-and-column-costs.md#read-later-columns-on-demand).
3. **Fewer filter columns.** Each is 4 bytes a row and a decode pass; a text column also costs its distinct strings. **Columns and what they cost** lists them, cheapest to lose first.
4. **A stride.** Every *N*th row.
5. **No time column.** No sort, no sort ceiling, no 4-8 bytes a row of time and lifetime - and no timeline.
6. **Raise the budgets**, when you know the memory is there.

At render time, large datasets are handled by sampling and progressive accumulation rather than by reducing the data; see [Sampling and budgets](sampling-and-budgets.md).

## For developers

### Parser threads

A load of several files parses up to **Parser threads** of them at once, each in a parser worker started by the ingest worker for that load ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). At 1, or for a single file, files are parsed one after another in the ingest worker itself.

Running several at once does not loosen the fit check:

- **The builder is counted first.** The merged columns are allocated for the whole selection before the first file is read, so the files in flight get only what the RAM budget leaves beside them (`parseHeadroom`): position, 64-bit time, look angles, person, 32-bit group, session, filter columns and `Source file`, per row to be loaded - times 2.6 when the row count is a CSV estimate, for a column growing into a larger one.
- **Each file reserves its cost before it starts** (`fileParseBytes`): its rows (from the Parquet footer; a CSV's share of the estimate by size) times the same columns, times **8** - the block itself, the copy beside it while rows without a position are dropped, and the decoder's working set, which for text columns is far larger than their ids. A stride does not reduce this, because files are read in full and decimated afterwards. The 8 is an allowance set by measurement: at 3, or at 5, thirty parser threads took a tab over its limit on 86 million rows with person and session names; at 8 they did not.
- **Another file starts only if its reservation fits** in what is left. A file that has finished but is waiting for an earlier one to be merged keeps its reservation until it is merged.
- **One file always runs.** When nothing is reserved, the next file starts whatever it costs - that is the one-at-a-time load the fit check admitted, so a tight budget falls back to it rather than refusing.

The *peak while loading* figure is the peak of a one-at-a-time load, which comes at the sort, after every file has been read. Files parsed side by side can take memory above that figure while they are read; the reservations keep it within the RAM budget, as far as the estimates above are right.

The merge order is the order of the selection, whatever order the files finish in, so the person, group and session numbering, the rows and the `Source file` values are identical to a one-at-a-time load. A file that cannot be read is skipped and listed exactly as before. A parser worker that dies ends the whole load, as the death of the ingest worker always did, and every parser worker is terminated when the load ends, however it ends. If parser workers cannot be started at all, the files are parsed in the ingest worker instead.

### How the figures are detected

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) runs at start-up, again once the renderer exists, and on **Re-detect**.

**RAM, with the dev server.** `start.bat` and `npm run dev` serve the page from a process that can read the machine's memory, at `/__host/memory` (answered within 1.5 s or ignored). The default is the smaller of 60% of installed RAM and 80% of currently free RAM; the ceiling is 60% of installed. When free memory is what holds the default down, the panel says so and suggests closing programs and pressing **Re-detect**.

**RAM, without it** (a static deployment): no browser API reports free memory, and `navigator.deviceMemory` is rounded down to a power of two and capped at 8 GiB by Chrome and Edge. The default is 60% of `deviceMemory`, further capped at 4 × the tab's free JS heap where the browser reports one, or 4 GiB when nothing is reported. When `deviceMemory` reads exactly 8 (the cap), the figure is flagged as *capped* and the ceiling is 4 × the default, with a note that past the default the number is your assertion, not a measurement.

**One array at a time.** Chromium also refuses any single array of 2 GiB or more, whatever is free. The 64-bit time a load merges in (8 bytes a row) used to be one array: past about 200 million rows its growth was refused and every later file was reported unreadable, so a 300- or 400-million-row load ended up with 200 million rows. It is now kept in segments of 128 MiB ([`SegmentedF64`](https://github.com/Holdi601/3DHeat/blob/main/src/data/growable.ts)), and the time sort makes its keys in the time column's own memory instead of a copy. Every other per-row array is 4 bytes or less, which reaches 2 GiB only at 536 million rows, past the sort ceiling. Measured with `tools/probe-row-ceiling.mjs` (position, time, a player, a team and `Source file` in memory, 8 measures read later): 300 million rows load whole; 350 million are at the limit of what one tab holds (about 13.4 GB of arrays) and fail as often as not.

**Either way**, the RAM default and ceiling are capped at **12 GiB**, the most typed-array memory one Chrome tab can hold whatever the machine has (a page reached about 15.75 GB and failed; 12 leaves room for everything else), and never go below 256 MiB.

**GPU memory.** No web API reports it at all.

- With the dev server, the card's memory is read by `nvidia-smi` (the largest adapter) or, on Windows, from the display adapter's registry value `HardwareInformation.qwMemorySize`. The default is 70% of it, the ceiling 90%.
- Without a reading, it is inferred: 2 GiB by default; 4 GiB when the largest texture is 16,384 px or more (a discrete card), 1 GiB when smaller; or 8 × WebGPU's `maxBufferSize` when that is larger. The ceiling is then 8 × the inferred figure, because the inference tells an integrated part from a discrete one and nothing finer. The panel says the figure is inferred.
- Never below 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4 when not reported).
