---
title: Pre-filter and column costs
parent: Getting data in
nav_order: 10
---

# Pre-filter rows and choose columns before loading

A filter in the Filters panel hides rows that are already in memory. For mass analysis that is the wrong order: ten thousand matches in full are billions of rows, but their kills and deaths are a few million. The **Pre-filter rows** and **Columns and what they cost** sections of the Source panel act *while the files are read*, so a row or a column you leave out never takes memory or GPU space.

Both appear below the Source panel once a selection has been counted. Whatever you choose is remembered for that kind of source (files with the same columns) and comes back the next time you load one.

## Pre-filter rows

Each clause names a column and what to keep from it. A row is loaded only when it passes **every** clause; within one clause, **any** ticked value passes.

| Control | What it does |
|---|---|
| **Kills and deaths only** | Shown when the file has an event column with kill- or death-like values. Keeps exactly those. |
| **Event types**, **Vehicle classes**, **Map / mode**, **Won / lost**, **Teams**, **Time window** | Quick clauses for the columns that usually hold these. Shown only when the file has such a column. |
| **Filter by any column…** + **Add** | A clause for any other column. |
| Value list | For text columns and for numbers with only a few values (a team 0/1, a won flag): tick the values to keep. The counts beside them come from the first rows of the first file. **All** / **None** tick or untick every value. A clause with nothing ticked keeps every row. |
| Range | For other numbers: keep rows from the first number to the second. An empty box is open on that side. Rows whose value is missing or unreadable fail a range. |
| **Remove** | Drops the clause. |

Below the clauses the panel says how many rows the filter keeps. For Parquet files it counts from the filter columns alone, within about a second and a half: a large selection is counted over its first files and extrapolated (*Keeps about …, counted over N of M files*). **Count all files** counts every file, after which the count is exact and so is the memory estimate. Text files (CSV) are filtered the same way while reading but are not counted beforehand, so the estimate assumes every row.

The memory estimate, the fit check and the suggested stride all use the filtered row count. A stride, if you still need one, thins the filtered rows.

### How it works

For each Parquet file:

1. **Statistics.** Row groups whose minimum and maximum rule the filter out (for example a group of only `move` events when you keep `kill` and `death`) are skipped without decoding. Page indexes are used the same way when the file has them.
2. **Filter columns first.** In the remaining groups only the filter's columns are read and tested, one byte per row.
3. **Mapped columns for kept rows.** Arrays are allocated at the kept count, and the mapped columns are read only in groups that kept at least one row.

A file whose rows all fail is not an error; the dataset's notes say how many rows were kept and how many row groups were skipped. A clause on a column a file does not have treats every row of that file as empty. The code is in [`src/data/rowFilter.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/rowFilter.ts).

Measured on synthetic matches (200 files of 50,000 rows each, 10 million rows, kills and deaths about 0.8 % of rows), in a headless browser on this project's test machine:

| Load | Rows loaded | JS heap after load | Frame time during load (p99) |
|---|---|---|---|
| Everything | 10,000,000 | 462 MB | 16.8 ms |
| Kills and deaths only | 76,537 | 155 MB | 16.8 ms |

When kills are spread through every row group, as here, the saving is in memory, not reading time: every group still has to be decoded. When the file keeps events apart from movement (events sorted or in their own row groups), most groups are skipped unread.

## Columns and what they cost

Every column of the file, with what keeping it would cost for the rows the load keeps, and how much it matters:

| Rank | Meaning |
|---|---|
| **core** | Position, time, who, team or round. Always kept. |
| **keep** | What analyses usually filter by: events, weapons, classes, outcome, health, speed. |
| **optional** | An ordinary measure or a short category. |
| **drop first** | Identifiers (nearly every value different), long text, JSON detail, or a column with one value throughout. |

The list is sorted with the columns to drop first at the top, the most expensive first within a rank. Tick or untick a column to keep or leave it out. The cost of a number column is 4 bytes a row. A text column kept as a category also costs its table of distinct strings, about two bytes a character. This is the cost the per-row estimate did not see: a JSON detail column with a different string in every row can outweigh every other column together.

When the load does not fit, the section opens by itself, says by how much the load is over the RAM budget, and offers **Drop the N suggested columns**. That drops the least important columns first, then the most expensive ones, until the load fits. It never drops a core column.

**Forget** clears what is remembered for this kind of source.

### Read later: columns on demand

Each kept column of a Parquet load has a **later** box beside it. A column marked *later* stays in the files: it takes no memory at load and does not count in the fit check, so the same budget holds more rows. When a filter, the difference split, the value weight or the route events first use it, it is read from the files - that column alone - in a background worker, and the filter applies once it is in. The **Filters** panel lists such columns under **Read when needed**, with a **Read** button.

By default the ordinary measures (numbers that are not events, weapons, classes, outcome, money or a campaign column) are marked *later*; categories load at once. Columns the load itself works from - the event type, the economy, the outcome, the campaign series - always load at once, because the columns it adds are built from them while it loads. A load that includes a text file (CSV) loads every kept column at once: a text file has no column that can be read alone.

When the budget is exceeded, **Read N columns later instead** marks the columns the fit check would drop as *later* rather than leaving them out.

To read a column again, the load keeps a row map in the worker: which file rows it kept (nothing when it kept them all) and where the time sort put them - one byte a row when every file is in time order on its own (two past 255 files), four bytes a row otherwise.

## Related

- [Memory and budgets](memory-and-budgets.md): the fit check, strides and the resource budgets.
- [Filters](filters.md): filtering rows that are already loaded.
