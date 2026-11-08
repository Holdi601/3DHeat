---
title: Loading files
parent: Getting data in
nav_order: 1
---

# Loading files

Files are loaded in the **Source** panel at the top of the Heatmap tab's sidebar. Everything selected at once becomes **one** dataset.

## Choosing files

| Control | What it does |
|---|---|
| **Drop files or a folder here** (the drop zone) | Drop any mix of files and folders. Folders are walked recursively. Clicking the drop zone opens the same picker as **Files…**. |
| **One file…** | A file picker for a single file. |
| **Files…** | A file picker that accepts several files. |
| **Folder…** | A folder picker (the browser's `webkitdirectory` picker); every file in the folder tree is offered. |

The pickers accept `.parquet`, `.pq`, `.csv`, `.tsv` and `.txt`. A file whose name ends in `.parquet` or `.pq` is read as Parquet; everything else is read as delimited text (see [Data formats reference](data-formats.md)).

Dropped folders are walked to a depth of 12 levels and at most 20,000 files, as a guard against symlink loops and runaway trees.

## Which files are kept

Before anything is read, the selection is filtered ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- A file with another extension is skipped: *not a csv/parquet file*.
- A file of 0 bytes is skipped: *empty (0 bytes)*.
- **Converter sidecars** - the raw data a converter keeps beside a match's table, `<match>.messages.parquet`, `.events.parquet`, `.raw.parquet` and the others listed in [Converters keep everything](converters.md) - are skipped: *a converter's sidecar*. To open one, pick or drop it on its own (or only sidecars): a selection of nothing but sidecars loads them like any table. The JSON beside a table (`.match.json`, `.meta.json`, `.summary.json` and the like) is never offered as positions.
- **The movement-file rule.** If any file in the selection is named `movement*.parquet`, `movement*.csv` (and the other extensions) - `movement.parquet`, `movement_1.parquet` and so on - then every other data file is skipped: *not a movement file, and this folder has movement files*. Telemetry exports often hold one table of positions beside dozens of tables without positions, and only the former can be drawn. A folder without any movement file loads all its data files.
- The kept files are sorted by their path inside the selection, so the same folder always produces the same dataset and the same colours.

The panel then shows the selection (a single file's name, or `folder (N files)` using the longest common folder), the number of files, their total size and the total row count - exact when every file is Parquet, marked `≈` when any is CSV. Skipped files are listed with their reason, the first four by name.

## Reading the schema

The **first** file of the selection is opened to describe the schema ("Reading schema"): its column names, its first 50 data rows, which columns look numeric and, for Parquet, each column's logical type and the `heat3d` footer entry. A folder of exports of one table shares one schema, so one file stands for all. Then every file is measured ("Counting rows"): a Parquet footer gives the exact count in one small read; a CSV's count is estimated from the average line length of its first megabyte.

The [Column mapping](column-mapping.md) panel opens with the auto-mapped guesses, and the [memory estimate](memory-and-budgets.md) appears above the **Load** button.

## Messages before loading

Under the selection the panel lists, from [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Errors** (red) - the load cannot start: fewer than two position axes, the same column on two axes, a mapped column that is not in the file, a position column that does not look numeric, a time column whose sampled values are text while the unit is a number (every row would read as NaN and land at time 0), a time column set to ISO-8601 none of whose sampled values parses as a date, a unit scale of 0.
- **Warnings** (amber) - it will load, but probably not as meant: a group column that takes a distinct value on most sampled rows (so it is an id, not a group), a `DATE` time column (every row of a day shares one instant), look direction set without its columns.
- **Notes** - what the mapping implies: drawing on a plane when one axis is unmapped, no timeline without a time column, no tracks without a person column, and without a group column one colour for everything and a difference that can only split on a column kept for filtering.

## Loading

The **Load** button reads *Load file*, *Load N files*, or *Load N files (1 in K)* when a [decimation stride](memory-and-budgets.md#decimation) is set. It reads *Too large - reduce or decimate* and is disabled when the [fit check](memory-and-budgets.md#the-fit-check) says the load will not fit; it is also disabled while the mapping has errors or another load is running.

While loading, the panel shows the current step (with `[file/files]` in front when there are several files), the rows read so far, a progress bar, and **Cancel**. Cancel terminates the ingest worker, and with it any parser workers it started.

The load runs in a Web Worker ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)), so the page keeps drawing. With several files and more than one [parser thread](memory-and-budgets.md#parser-threads), up to that many files are parsed **at once**, each in a parser worker of its own ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), as far as the RAM budget leaves room; they are still merged one at a time in the order of the selection, so the dataset is the same as a one-at-a-time load. While several are in flight, the progress line names the file that last reported, and the bar and row count add up every file in flight. With one thread, or a single file, files are parsed one after another in the ingest worker itself. Only the columns the mapping names are read: an unmapped column of a Parquet file costs nothing; a CSV is scanned byte by byte but only mapped fields are decoded. After the last file, the merge runs through named phases - *Putting rows in time order*, *Reordering columns (n of m)*, *Measuring extent*, *Building the roster*, *Summarising sessions*, *Computing lifetimes* - and then the main thread shows *Uploading N rows to the GPU* for one frame before doing it, so a long upload is never mistaken for a freeze.

## Several files become one dataset

When more than one file is loaded ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **One roster.** Persons, groups, sessions and category values are dictionaries shared across all files, so the same player in two exports is one person with one track.
- **One time origin.** Times are kept as 64-bit seconds while merging and rebased onto the earliest time of the *whole* selection, then stored as 32-bit seconds from that origin. Four exports from four afternoons are placed in their real order, not stacked on top of each other.
- **One time order.** Rows from all files are sorted by time with a radix sort (see [the sort ceiling](memory-and-budgets.md#the-sort-ceiling)).
- **A `Source file` column.** Every row remembers which file it came from, as a category column named `Source file`. It appears in [Filters](filters.md) and as *Source file - compare two loads* in the [difference split](difference.md). A single-file load does not get it - a constant column would cost 4 bytes a row to say nothing.
- **Missing columns.** A file that lacks one of the *filter* columns simply contributes no values for it. A file that lacks a mapped *role* column (X, time, person, ...) fails with *file has no column "name"*; in a multi-file load that file is skipped and the others still load, and the skipped files are listed on the dataset. A single-file load that fails reports the error.
- **Shortfall warning.** When the rows loaded are less than 95% of the rows counted beforehand, the dataset carries a warning with the missing share - from unreadable files or from rows without a usable position, which are dropped on the way in.

## After loading

The new dataset replaces any previous one. On every load ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- all filters and group visibility are cleared;
- the difference split by group is reset: the first half of the groups (rounded up) positive, the rest negative;
- the sprite radius is set to the horizontal extent / 120 and the saturation to an analytic estimate; cube size, look ray length, fly speed and the near/far planes are set from the extent (see [Sessions, persons and groups](sessions-persons-groups.md#entity-size));
- the box replay session is set to the session with the most rows;
- the line heat routes are guessed afresh ([Line heat](line-heat.md));
- the view mode falls back to **Heat** if the current mode is not supported by the new data; the timeline falls back to **All** without a time column and the history to **Cumulative** without lifetimes;
- the playhead is parked at the start and playback stops;
- the camera frames the whole dataset from the default direction (looking along -Z, pitched down about 36°).

The **Dataset** panel then shows the dataset's name (the selection, the row and file counts, and the stride when one was used), `N teams · N persons · Ns span`, and every warning the load produced, in amber, for as long as the dataset is loaded. **Unload** in that panel removes the dataset.
