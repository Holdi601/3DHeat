---
title: Dashboards
parent: Filters and tools
nav_order: 8
---

# Dashboards

A **dashboard** is a page of tiles over the loaded data, built the way BI dashboards are built (Power BI, Tableau, Looker): KPI cards, charts, tables and slicers, cross-filtering each other, drilling down hierarchies and through to detail pages, and tied to the 3D view both ways. It works in every workspace - heat map, match, mass analysis, vehicles, race and tactics - and over any data a workspace offers.

```
 +-- Overview --+-- Player detail --+                      [Edit] [Follow the view] [More v]
 | Rows 1.2M ^4%  | Players 96  | Kills 18.2K | Team: [Red][Blue][Green]               |
 | +------------------+ +--------------------------+ +-----------+                    |
 | | Rows by team     | | Over time      __/\_     | | (mini map)|                    |
 | | Red   =======    | |           ___/     \__   | |   ..::.   |                    |
 | | Blue  =====      | |  ________/            \  | |  .:##:.   |                    |
 | +------------------+ +--------------------------+ +-----------+                    |
 +-------------------------------------------------------------------------------------+
```

## Open one

- The **Dashboards** button on the quick bar over the view (the grid icon), or **Ctrl+K** and type *dashboard*: **New dashboard**, **New dashboard from template: ...**, **Open dashboard: ...**, **Show / Hide dashboards**, the page out as PNG or PDF.
- With none open, the window lists your dashboards, **New dashboard** (an empty page in edit mode), **Import** (a `.json` file) and the **templates** for the workspace you are in.

The window stands **beside the view** (drag its left edge to make it wider) or, with **⤢**, over all of it. Its theme is the viewer's, or **Dark** or **Light** of its own (the theme picker in its head).

## Templates

| Template | Offered first in | What it puts down |
|---|---|---|
| **Overview** | Heat map, tactics | A title, KPI cards (rows, players, kills, won share or rows a minute), slicers (team, match, event, match time, a player search), rows by team, over time, the mini map, events, height, top players, team by event, the players' table. |
| **Match** | Match | The overview, and a **Player detail** page to drill through to from any player. |
| **Mass analysis** | Heat map, match | Matches, players, won share, rows a minute; by map, by game version, a box plot by map, map by side. |
| **Vehicles** | Vehicles | A *nation › class › vehicle › variant* hierarchy (the levels the data has) to drill down, a treemap, a table. |
| **Race** | Race | Top and median speed, speed over time as percentile bands, its histogram, the track from above. |

A template only puts down what the data has: no won share without an outcome column, no event donut without an event column.

## Build one

Turn on **Edit**. The **field list** on the left holds the **visuals** and the data's **fields**: the roles (*Team*, *Player*, *Match*, *Time*, *Match time*, *X*, *Height*, *Z*), every column, and the dashboard's own **calculated columns**, **bins**, **hierarchies** and **measures**.

- **Drag a visual** onto the page (or click it: it goes below the last tile).
- **Drag a field onto a slot** in the settings on the right - **Axis**, **Legend**, **Values**, **Size** - like Power BI's field wells. Or drop it on the tile itself: a category goes to the axis, then the legend; a number to the values.
- **Drop a field on an empty spot** of the page: a category makes a bar chart, a number a histogram, a clock a line, a measure a KPI card.
- A number dropped on **Values** is averaged, a category counted once per value; pick the **aggregation** beside it.
- **Move** a tile by its title, **size** it by its corner. Both snap to the 24-column grid, and a line shows where an edge lines up with another tile's.
- **Pages**: **+** adds one, double click renames it, **−** removes the one shown.
- **Undo / Redo**: ↶ ↷ in the head, **Ctrl+Z** / **Ctrl+Y**. **Delete** removes the picked tile, **Ctrl+D** duplicates it.

With no tile picked, the settings are the **page's** (its name, its filters, whether it is a drill-through target) and the **dashboard's** (its name, the data it reads, its filters, measures, calculated columns, bins, hierarchies).

## Visuals

Each chosen by the data's job, drawn by the shared chart module and the same rules ([Charts on volumes](volume-charts.md)): thin marks, one value axis, a legend from two series on, a tooltip on every mark, colours that follow the entity, never its rank.

| Visual | For |
|---|---|
| **KPI card** | A headline number, with its change against the **filter-off baseline** (every slicer, selection and page filter off) or a **comparison set** (its own filters), and a sparkline over time. |
| **Bar** / **Column** | A measure per category, side by side, **stacked** or stacked to **100 %** (Stacking). Several values without a legend are side by side. |
| **Line** / **Area** | A measure over time - into each match or on the data's clock (Clock) - by a legend. |
| **Donut** | Parts of a whole, two to five parts only; more fold into Other. |
| **Treemap** | Parts of a whole as rectangles, for more parts than a donut takes. |
| **Histogram** | How a numeric field is spread. |
| **Scatter / bubble** | One point per category at two measures (Across, Up), sized by a third (Size). |
| **Density** | Two numeric fields against each other, binned: how many rows fall where. |
| **Heat matrix** | One category against another, in one blue from light to dark. |
| **Box plot** | A numeric field's spread per category: the median, the quartiles, the whiskers from p5 to p95 (or min to max). |
| **Percentile bands** | A numeric field's spread over time: p10-p90, p25-p75, the median. |
| **Table** | Rows by up to three fields with their measures; **data bars** and a **colour scale**, a total row. |
| **Pivot** | A matrix table: rows by a field, columns by another, row and column totals, a colour scale. |
| **Top N** | The biggest few as a ranked list with bars. |
| **Mini map** | The rows of the tile's filters and the selection, seen from above. |
| **Slicer** | A filter (below). |
| **Title**, **Text**, **Image** | Words and a picture. |

**▤** on a tile shows its numbers as a table; **⋯** (or a right click on a mark) opens its menu. Past **Most groups** the smallest fold into **Other**: exact for counts and sums, left out for a distinct count (it does not add up).

## Measures

| Measure | Value |
|---|---|
| **Count** | Rows. |
| **Distinct count** | Different values of a field (players, matches, vehicles). |
| **Sum**, **Mean**, **Min**, **Max** | Of a numeric field. |
| **Median**, **Percentile** | Of a numeric field, read from fine bins over its range: exact to a bin's width. |
| **Share** | The mark's rows over all the tile's rows. |
| **Per minute** | Rows a minute of the time shown. |
| **Rate** | Rows where a condition holds (**Only rows where**) over all rows: a kill rate, a hit share. |
| **Ratio** | One saved measure over another. |
| **Calculated** | An expression in the [Compare language](compare-groups.md): arithmetic over the dashboard's measures by name in backquotes (`` `Kills` / `Deaths` ``) and Compare aggregates - `count()`, `countIf(event == "kill")`, `sum(x)`, `avg(x)`, `median(x)`, `percentile(x, 90)`, `min(x)`, `max(x)`, `distinct(x)`, `players()`, `matches()`, `kills()`, `deaths()`, `winRate()`, `perMinute(v)`, `ofAll(v)` - with `where` for a condition over all of them. |

Every measure can carry **Only rows where** (a Compare predicate). Save measures under the dashboard's settings to reuse them by name.

### Confidence intervals on a rate

A **Rate** (saved or dropped on a tile) can carry an **Interval**:

- **Wilson** (the default): Wilson's score interval. It stays inside 0-100 %, gives a sensible upper bound at 0 % and a lower one at 100 %, and keeps close to its level at small n.
- **Bootstrap (percentile)**: the interval of the rate over the rows resampled with replacement. For a rate the resampled count is binomial, so its percentiles are taken from that distribution exactly - the limit of endless resamples, the same numbers every time. At 0 % or 100 % every resample is the same, so the interval is the point itself; take Wilson there.
- **Level**: two-sided, 50-99.9 % (95 % by default).
- **Grey below n**: values from fewer rows than this are drawn faint, and the tooltip, the table and the KPI card say so.

Where it shows: whiskers across **bars** and **columns** and on each point of a **line** or **area** (the value axis reaches the whiskers' ends); the tooltip (*95 % CI 38 %–52 % (Wilson) · 120 rows*); a **table**'s cell beside the value, its column head saying the level; a **KPI card** under its number; the CSV (a *low*, *high* and *n* column beside the value). Stacked marks, 100 % stacks and a highlighted selection draw no whiskers (their parts are not the rate's own). On a sampled dashboard (*From a sample*) the interval is the one of the rows actually read, not of the rows they stand for, so it is honestly wider.

**Calculated columns** are Compare row expressions (`speed * 3.6`, `alt > 1000`) worked out per row in the workers; they appear in the field list like any column. **Bins** group a numeric field into equal bins (a width, or a count over its range). **Hierarchies** are fields to drill down through, top first.

## Slicers and filters

A **slicer** tile filters its page - or, with **All pages**, every page. Its **Style**:

| Style | Picks |
|---|---|
| **Dropdown**, **List**, **Buttons** | Values of a category field (Ctrl+click buttons for several), with their row counts under the other filters. |
| **Range slider** | A range of a numeric field. |
| **Date / time range** | A range of the data's clock (dates where the data has them) or of match time. |
| **Search** | Values that contain the text. |
| **Relative time** | The last (or first) *n* seconds, minutes or matches. |

The quick slicers of every BI tool are fields here: **won / lost** (the outcome column), **team**, **side**, **map**, **game version** - found by the column's name.

Filters stack: the **dashboard's** (every page), the **page's**, a **drill-through's**, the **tile's own** (in its settings), a **drill-down's** path, a **selection** on another tile, the **3D view's** (below). Each filter is a field with **is one of**, **is not one of**, **between**, **contains**, **relative time**, or an **expression**. The chips over the page show what is in force; ✕ takes one off.

## Cross-filtering, drilling

- **Click a mark** (a bar, a row, a segment, a cell, a point) to **select** it; **Ctrl+click** adds or takes away marks. The page's other tiles follow, each as its **Selection elsewhere** says: **Highlight** (bars, columns, lines, areas, histograms: the selected part solid, the rest faint), **Filter** (the rest), or **Nothing**. A click on the empty page or **Esc** clears it.
- **Drill down**: a tile whose axis is a **hierarchy** has ↑ (up), ↓ (**drill mode**: a click drills into the mark instead of selecting it), ⇊ (**next level** for every mark) and ⤓ (**expand all down one level**: the next level nested under this one). The right click's **Drill down into ...** works without drill mode.
- **Drill through**: make a page a detail page (**Drill through by** a field in its settings, ⤵ on its tab). A right click on a mark with that field elsewhere offers **→ Drill through to *page***; the page opens filtered to the mark, and **←** on the chip (or **Esc**) goes back.

## The 3D view, both ways

- **Follow the view** (on by default): every tile counts only the rows the 3D view shows - its time window (live in playback, a few times a second), its filters, the teams shown, the match picked. Anything picked in the 3D view that narrows it narrows the dashboard.
- **Selected volume**: only the rows inside the volume selected in the view.
- **Drive the view**: the dashboard's selection and slicers become the view's filters - a team, players, a category's values, a numeric range - so the heat and the replay show what the dashboard looks at. Those filters are the dashboard's own: they change with the selection, go when the link or the window closes, a column you filter by hand keeps your filter, and they are left out of what the dashboard follows (the two never feed each other).

A dashboard over a workspace's **own rows** (a source other than the loaded data, picked under **Data**) links to that workspace's view the same three ways where the workspace offers it: its view says which of its rows it shows (and which lie in the selected volume), and the dashboard's selection and slicers go to that view as its filters.

## Save and share

- Dashboards are kept in this browser (all of them, whatever data is loaded: they read whatever columns the data has), in the **session file**, and in a **shared session** they sync to everyone: each edit is an operation on a dashboard, a page or a tile by its id, so two people editing different tiles never overwrite each other.
- **More ▾**: **Export page as PNG** or **as PDF** (one page, the tiles as drawn), **Export dashboard (JSON)** (`heat3d.dashboard/1`; **Import** reads it back as a new dashboard), **Duplicate**, **Delete**.
- A tile's menu: **Download as CSV**. A text that starts like a formula (`=`, `+`, `-`, `@`) is kept as text, so a spreadsheet never runs a player's name.
- **In an analysis document**: **Insert › The dashboard page shown (live)**. In the preview the page is live - its tiles counted again, its marks clickable; in an export it is the picture taken when it was put in (**Update the picture** takes a new one).

## Performance

Frame drops are the worst failure; nothing of a dashboard runs per frame.

- **Workers.** The rows are dealt out to row workers (as many as the chart signs use: an eighth of the logical cores, at most eight), a contiguous share each. Only the columns a tile reads are sent, each once, a chunk at a time between frames (at most 2 ms of copying a task), transferred.
- **Clauses and shared scans.** Every filter is a bitset over a worker's rows, worked out once and kept: a slicer change re-reads one column. A tile's mask is the AND of its bitsets, shared by every tile with the same filters, which fold from one pass over it.
- **Incremental.** When a tile's mask changes by less than the rows it shows (a slicer value added, the time window sliding in playback), only the rows that left are folded out and those that came in folded in: counts, sums, fine histograms and distinct values subtract as easily as they add (min and max start over). The last few masks' numbers are kept, so a filter taken off again is no work.
- **One run at a time.** A change plans every shown tile again (plain objects, no rows) and sends one run; the next waits until every worker answered, and the workers rest when frames come late.
- **Memory.** Past half of what the tab's budget leaves once the data is loaded, the workers keep an even sample, each kept row standing for those it skips; the tiles then say **From a sample**.

`tools/smoke-dashboards.mjs` builds a dashboard by drag and drop, slices, cross-filters, drills, exports, reloads; with `ANALYSIS_GPU=1` it measures, on 50 million rows, the frames with a 12-tile dashboard live during playback and how long the tiles take to show fresh numbers after a slicer change.

## For developers

`src/dashboards/` (see `index.ts`) is the framework; `src/ui/dashboards/` its UI.

- `model.ts` - `Dashboard`, `Page`, `Tile`, `MeasureDef`, `FilterDef`, `CalcColumn`, `BinDef`, `Hierarchy`; `makeDashboard`, `makeTile`, `parseBundle` (every file and peer's entity read again, clamped).
- `store.ts` - `useDash`: the op-log document `dashboards` (collections `dashboards`, `pages`, `tiles`, registered with `state/sharedDocs.ts`), undo / redo per dashboard, the interaction (selection, drills, drill-through).
- `sources.ts` - `registerDashboardSource({ id, label, dataset, subscribe })`: a workspace's own rows (any `Dataset`-shaped table) for dashboards whose `source` names it. Its link to its own 3D view, all optional:
  - `viewMask({ followView, volume })` returns `{ key, mask }` - a `Uint8Array` over the source's rows (non-zero = shown) and a key that changes with it - or null for every row. Called on each count while **Follow the view** or **Selected volume** is on; the mask goes to the row workers as a column (`@mask:<key>`, sent once per key) and is ANDed into every tile, the KPI baseline too. Leave out what `applySelection` set, so the two never feed each other.
  - `onViewChange(cb)` calls back when the mask would change (playback, filters, the volume); the tiles count again 40 ms later.
  - `applySelection(sel)` receives `{ dashId, filters, picked }` for **Drive the view**: `filters` are view-filter specs (`teams`, `persons`, `categories` / `range` by column name) from the dashboard's and the page's filters, its slicers and its selection; `picked` the marks in words; `null` takes them off (link, window or dashboard closed).
- `ci.ts` - `wilson`, `bootstrap`, `rateInterval` (weighted rows), `normalQuantile`; on a rate, `MeasureDef.ci` (or a quick value's `ci`) is `{ method: 'wilson' | 'bootstrap', level?, minN? }`.
- `templates.ts` - `registerTemplate({ id, name, workspaces, build(catalog) })`.
- `fields.ts` - the field catalogue (`catalogOf`) over the Compare engine's column keys, roles found by name.
- `plan.ts` - a tile to its queries: the filter layers, cross-filter and highlight, drill, measures (`compileMeasure`, calculated ones over the Compare parser).
- `query.ts` - the engine in the workers: clause bitsets, masks, `Engine.run` (shared scans, incremental folds, memo), `mergePartials`.
- `client.ts` - `dashClient`: watched pages (`watch(dashId, pageId)`), worker pools per source, results per tile (`results`, `subscribe`).
- `finish.ts`, `paint.ts`, `export.ts`, `link.ts` - numbers to visuals, the dashboards' own canvas visuals, PNG / PDF / CSV / JSON, the link to the 3D view.
- UI: `DashboardWindow` (mounted in every workspace), `DashboardPage` (one page anywhere: a document's live block), `Canvas`, `Authoring` (field list, settings), `Visuals`.
