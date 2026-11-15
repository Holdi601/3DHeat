---
title: Getting data in
nav_order: 3
has_children: true
---

# Getting data in

Before 3DHeat can draw anything it needs a table: every row says where something was and, if you have it, when and who. This section shows how a file becomes a picture. No data yet? Try the [demo data](demo-data.md).

**Do this now:**

1. In the Heatmap sidebar open **Source** and press **Files…** (or drop a file or folder on the drop zone).
2. Look at **Column mapping**: the boxes are usually filled in already.
3. Check the **Memory estimate** says *fits*.
4. Press **Load**.

![The steps from file to picture: Source, Preview, Column mapping, Memory estimate, Load, picture](assets/img/en/getting-data-in-flow.webp)

Everything the Heatmap tab shows comes from one **dataset**: a table of rows, each with a position and, optionally, a time, a person, a group, a session, a look direction and any number of extra columns kept for filtering. This section explains how a dataset is made.

## The path from files to picture

1. **Select files** in the **Source** panel - one file, several, a folder tree, or by dropping them. Parquet, CSV, Tacview, GPS tracks and more are accepted; the one complete list is in [Data formats](data-formats.md#files). See [Loading files](loading-files.md).
2. **Preview.** The first file of the selection is opened: its column names, its first 50 rows, which columns look numeric, and (Parquet) each column's logical type and the file's own reading instructions, the `heat3d` footer entry.
3. **Auto-mapping.** Columns are assigned to roles - X, Y, Z, time, person, session, group, look direction - and a handful are kept for filtering. Every guess is shown in the **Column mapping** panel and can be changed. See [Column mapping](column-mapping.md) and [Axes, units and time](axes-units-and-time.md).
4. **Counting.** Every file's row count is read (exactly from Parquet footers, estimated for CSV), so the panel can say before anything is loaded how much memory the load needs and whether it fits. If it does not, it proposes loading every *N*th row. See [Memory and budgets](memory-and-budgets.md).
5. **Load.** A background worker parses only the mapped columns of every file - several files at once, up to the [parser threads](memory-and-budgets.md#parser-threads) budget - and merges them, in the order of the selection, into one dataset: one shared dictionary of persons, groups and sessions across all files, one common time origin, all rows sorted by time. See [Sessions, persons and groups](sessions-persons-groups.md).
6. **Upload.** The main thread announces "Uploading N rows to the GPU" for one frame, then packs the rows into GPU memory within the GPU budget. See [GPU memory residency](gpu-memory.md).
7. **First picture.** The camera frames the data, the sprite radius and saturation are set from the data's extent and row count, and after 8 rendered frames the saturation is metered from the picture itself ([Colour and exposure](colour-and-exposure.md)).

## Requirements, checked before a load

| Need | What happens without it |
|---|---|
| **At least two of X / Y / Z** | Load is refused. With exactly two, the third axis is 0 and the data is drawn as a flat plane in the 3D scene - which is what a top-down map heatmap wants. |
| A time column | Optional. Without it the timeline is disabled, the view stays in **All** mode, and the sidebar says so. |
| A person column | Optional. Needed for the [figure overlay](box-replay.md) (a figure for each person), [line heat](line-heat.md) (the path each person walked), interpolation, trails and the **Lifetime** history. |
| A group column | Optional. Needed for [team heat](team-heat.md) and for [difference](difference.md) mode (at least two groups). |

A mode the loaded data cannot support is greyed out in the mode bar; hovering it says why.

## Without your own data

The **Dataset** panel (below **Source**) has a [synthetic generator](synthetic-generator.md) that produces a battle-royale-shaped dataset of any size, useful for trying the viewer and for testing what a machine can handle.

## Pages in this section

- [Loading files](loading-files.md) - pickers, folders, drag and drop, multi-file merging, the movement-file rule, progress and cancelling
- [Column mapping](column-mapping.md) - every field of the mapping panel, how auto-mapping guesses, the `heat3d` hints
- [Axes, units and time](axes-units-and-time.md) - up axis, flips, unit scale, time units, look direction
- [Sessions, persons and groups](sessions-persons-groups.md) - what each one does, the limits, shared names, entity size, the Dataset panel
- [Synthetic generator](synthetic-generator.md)
- [Memory and budgets](memory-and-budgets.md) - the footprint model, the fit check, decimation, the sort ceiling, resource budgets
