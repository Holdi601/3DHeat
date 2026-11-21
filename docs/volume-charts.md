---
title: Charts on volumes
parent: Filters and tools
nav_order: 7
---

# Charts on volumes

A [volume](volumes.md) can carry **charts**: signs that stand in the world beside it, each a chart of the rows inside that volume. They follow the filters, the time window and playback, so a sign over a bridge reads "kills by team at the bridge, so far" while the match plays.

```
            +-----------------+  +-----------------+
            | Rows by team    |  | Rows over time  |
            | Red  ======     |  |      __/\_      |
            | Blue ====       |  |  ___/     \__   |
            +--------\--------+  +-------/---------+
                      \                 /
                       [chart button] -+
                      +----------------+
                     /    the volume  /|
                    +----------------+ +
```

## Add a chart

1. Draw a volume (see [Volumes](volumes.md)).
2. Click the small **chart button** at the volume's top corner. It floats in the view and keeps its size at any zoom. The volume's **Charts** panel opens.
3. Press **Add chart**. A bar chart of the rows inside, by team, stands beside the volume.
4. Pick what the chart shows in the panel; the sign changes as you go.

The same is in the command palette (Ctrl+K): **Add chart to volume: *name***, one entry per shown volume, the selected one first. The **Volumes** panel lists the selected volume's charts under **Charts**, drawn again in the panel's theme, with **Add chart** and **Show the charts in the world**.

## What a chart shows

**Chart** - the kind, chosen by the data's job:

| Kind | For |
|---|---|
| **Bars** | Counts or rates per group: team, class, weapon, player, event type. |
| **Stacked** | Each group's rows split by a second dimension (**Split by**). With **Share**, every bar is 100 %. |
| **Line** / **Area** | A measure over time: **Into each match** (every match from its own start) or the **Data clock**. |
| **Histogram** | How a numeric column is spread: distances, speeds, heights, damage. |
| **Donut** | Parts of a whole, for two to five parts only; more fold into "Other". |
| **Tiles** | The numbers inside: rows, per minute, share of the rows shown, players, kills per death, the median of a column (**Median of**) and the won share. |
| **Matrix** | One dimension against another (**Rows by**), e.g. weapon by team, in one blue from light (few) to dark (many). |
| **Scatter** | Two numeric columns against each other (**Across**, **Up**), binned: a dot's size and depth say how many rows fall there. |

**Measure** - what a mark's value is:

| Measure | Value |
|---|---|
| **Count** | Rows. |
| **Share** | The group's share of the series' rows (of the bar's in a stacked bar, of every cell's in a matrix). |
| **Per minute** | Rows per minute of the time shown, summed over the matches it covers. |
| **Mean / Median / Percentile of a column** | Of a numeric column (**Column**, **Percentile** 1-99). Medians and percentiles are read from 256 fine bins over the column's range, so they are exact to a bin's width. |
| **Won share** | Of the rows whose side's outcome is known ([outcome columns](data-formats.md#outcome-columns)), the share whose side won. Rows, not rounds: the Volumes statistics' **Win rate** counts each player's round once. |
| **Kills per death** | Kill events over death events, from the event column. |

**Group by** - nothing, **Team**, **Player**, **Match**, or any category column. Past **Most groups** (12 bars, 5 parts of a donut, 8 by 8 in a matrix) the smallest fold into **Other**, which stays last.

**Compare** - two sides of every value:

| Compare | Sides |
|---|---|
| **Inside vs outside** | The rows inside the volume against the rows outside it. Picks **Share** when the measure was **Count**: the outside is far bigger. |
| **Team A vs team B** | Two teams, picked by name. |
| **Won vs lost** | Rows whose side won their round against those whose side lost. |

On big data the outside is estimated from an even sample of at most a million rows, each standing for the rows it skips. Likewise, past 16 million rows inside the signed volumes together, the rows inside are thinned to an even sample (every second row, then every fourth...), so memory stays bounded. A sign drawn partly from a sample says **from a sample**.

**Rounds** keeps only the rows of rounds won (or lost). **Only rows with** keeps only rows with the values ticked in a category column. Both come on top of the view's own [filters](filters.md).

**Sort** - **Largest first**, **Smallest first**, **By name** or **As in the data**. Time, histograms and scatters keep their axis order.

## The sign in the world

Each chart is a sign beside its volume, joined to the chart button by a thin line in the volume's colour. A volume can carry any number of them.

| Control | Does |
|---|---|
| Drag the title | Moves the sign. A billboard moves on the screen; a fixed board moves over the ground, **Shift**+drag up and down. |
| Drag the bottom-right corner | Sizes it. |
| ▾ / ▸ | Folds it to its title, or unfolds it. |
| ▤ | Shows the values as a table. |
| ✎ | Opens it in the Charts panel. |
| ⇪ | Sends it to an analysis document (below). |
| ✕ | Removes it. |

**Stands as**: a **Billboard** faces the screen and keeps its size in pixels, hanging beside the volume's corner. A **Fixed board** stands in the world, turned to a heading (**Turn to face the camera** turns it to you), sized against the volume's width: it grows as you come nearer and reads correctly from both sides.

Where the level stands between the camera and a sign (or its button), the sign fades; it stays clickable.

Signs keep the dark look of everything drawn over the view in both themes; the Charts panel and the Volumes panel's charts follow the theme.

## Live with the view

Every chart counts only the rows inside its volume that the view shows: the [time window](timeline.md), the filters and the teams shown, and in the team view the match picked. In **Play** a sign follows the playhead a few times a second; **Up to now** makes it count everything from the start up to the playhead, whatever the window. On a line or area chart a hairline marks the playhead.

## Click to filter

Hover a mark for its value (and, for shares and rates, the rows behind it). Click a bar, a part or a cell to **filter the view to it**: the heat and the replay then show only those rows in the world. Click it again to take the filter off.

| Clicked | Filter |
|---|---|
| A team, a player, a category | That team, player or value only. |
| A histogram bin | That range of the column. |
| A time bin | The time window shows that slice, the playhead at its end. |
| A match | That match, in the team view. |

## Send to a document, save with a view

**⇪** (or **Send to document** in the panel) hands the chart to an open analysis document as an embedded chart block: its settings, the volume and the data as drawn, so the document shows it without the data loaded. Without a document open, the block is copied to the clipboard to paste.

Signs are saved in the browser with the volumes of each dataset, in a [saved view](saved-views.md), and in the session file. In a shared session they sync to everyone: every change is an operation on the sign by its id (add, set, delete), so two people editing different signs never overwrite each other, and the same field set by two is the later one's.

## Performance

Nothing on a sign is worked out per frame.

- **Aggregation in a worker.** When a volume gets its first sign (or its shape, or the columns the signs read, change), the rows go to a worker once, a chunk at a time, and only the rows inside a signed volume are kept - once, however many volumes hold them, with a bit per volume - with only the columns the signs and the filters read. Every later change - a filter, the time window, the playhead - is aggregated there. A new filter on a column no sign reads yet makes one more pass.
- **Incremental in playback.** While the window only slides forward, a sign folds in the rows it gained and folds out those it lost: every value is built from counts, sums and fine histograms that subtract as easily as they add. The playhead is sent a few times a second, not each frame, and a result goes back only when it changed.
- **Painted when it changes.** Each sign is a canvas painted only when its data, size or hover changes, a few signs a frame at most; a frame only moves the signs.
- **Hidden-by-the-level tests** are a few CPU rays a few times a second against the level's index, never a GPU readback.

## For developers

The charts are the shared module `src/charts/` (see `src/charts/index.ts`), used by these signs and by the analysis documents:

- `types.ts` - `ChartSpec` (kind, measure, group, diff, filter, sort) and `ChartData` (groups by series of values), plain JSON.
- `aggregate.ts` - rows (`RowTable`) to `ChartData`, incrementally (`createAgg`, `addRows`, `advanceAgg`, `finishAgg`). Pure, worker-safe.
- `palette.ts` - the categorical slots for each theme, validated with the dataviz method against the panel surfaces (dark `#0e1218`: every check passes; light `#fbfcfd`: aqua, yellow and magenta under 3:1, so charts carry a legend and a table view), team colours from the team palette, `readTheme` from the design tokens.
- `draw.ts` / `ChartView.tsx` - drawing onto a canvas with hit regions, tooltips and the table view.
- `block.ts` - a chart as a document block (`heat3d.chartBlock/1`); documents register where blocks go with `registerChartBlockSink`.
- `run.ts` / `runWorker.ts` - one chart counted over all the data, the view's rows or one volume's, in a worker: the analysis documents' charts.
- `convert.ts` - the documents' expression charts (`exprSpec.ts`, counted by the Compare engine in `exprRun.ts`) as `ChartData`, so they are drawn the same way.

The analysis documents ([Notes and analyses](notes-and-analyses.md)) draw every chart block with this module - in the preview with `ChartView`, in an export as a PNG (`chartPng`) - and their chart editor offers every kind with the same settings form as a sign (`src/ui/charts/ChartSpecFields.tsx`).

The signs are `src/volumes/signs/` (the sign, its op-log store registered as the shared document `signs` in `src/state/sharedDocs.ts`, the worker and its client) and `src/ui/signs/` (the overlay, the panel). `tools/smoke-signs.mjs` drives them in a browser; with `ANALYSIS_GPU=1` it measures frame times with 20 signs live during playback of 50 million rows.
