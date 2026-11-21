---
title: Notes and analyses
parent: Filters and tools
nav_order: 21
---

# Notes and analyses

Write down what the data shows, where it shows it: **data notes** are anchored to a thing in the data - a match, a round, a unit, an event, a moment or a time range, a place, a heat spot, a finding, a saved view or a tactics plan - and show where that thing is. **Analyses** are documents written beside the view, in Markdown, with live blocks: a view that a click puts back in 3D, a finding, a heat spot's numbers, a chart, a note, a plan, a screenshot. Both stay on this machine: in the browser, in a JSON file, and in a shared session's log.

## Making a note

| Way | What the note is about |
|---|---|
| `N` over the view, **New note here**, or *New note here* in the command palette (`Ctrl`+`K`) | The most specific thing in sight: the pick card's heat spot (in a heat mode) or its row or event (in the replay), else the unit selected or followed, at the playhead, else the place in the middle of the view. |
| **Note** on the pick card | The heat spot or row under the click. |
| **Note** on a unit's card | The unit, at the playhead. |
| **Note** on a finding (Insights, opened) | The finding. |

The editor says what the note is about and whether this data has it. A new note made with `N` offers the other things it could be about under **About**: the unit, the round and the match being played, the time window at the playhead (the fixed window in Play mode, else the last 30 seconds), the place in the middle of the view, the whole data.

| Field | Meaning |
|---|---|
| Title | Shown in the lists, on the pin and on the timeline. Left empty, the anchor's words. |
| Text | Markdown: `#` headings, `**bold**`, `*italic*`, `` `code` ``, lists, `- [ ]` tasks, quotes, pipe tables, links to the web, and `[words](note:<id>)`, `[words](doc:<id>)` or `[words](view:<id>)` to another note, analysis or saved view. **Preview** shows it as it reads. |
| Tags | Comma separated; the panel filters by them. |
| Colour | The pin's, the timeline mark's and the badge's. |
| Screenshot | **Take a screenshot** keeps a picture of the view (the dialog steps aside for it). |

Each note also keeps the view it was made in - camera, mode, filters, groups, match, time, layers, selection ([saved views](saved-views.md#what-a-view-holds)) - and the workspace, its author and when it was made and changed.

## Where notes show

- **A pin in 3D** at the note's place, in its colour with a page glyph, constant in size at any zoom and drawn over the picture. Point at it for its title; click it for the note, with **Go to** and **Edit**. In All mode every pin shows; in Play mode a note about a moment shows from 3 s before it to 12 s after, a time range for its length. **Pins in the view** turns them off.
- **A mark on the timeline**, under the scrubber: a flag at a moment, a band over a range. A click goes to the note.
- **A badge** (✎, with a count when there are several) beside a unit in the unit list and on its card, beside a match in the match picker, on an event in the event list, on the pick card of a noted row, and on a finding. A click on it goes to the first note.

## Going to a note

A click on a note - in the panel, on a pin's card, on the timeline, a badge, a link in a text, or the note's name in the command palette - goes there: the workspace it was made on, then its view, then the anchor on the loaded data (the unit selected, the match or round picked, the playhead at its moment, Play mode for a moment shown in All mode). A note kept without a view frames its place.

## Anchors and other data

Anchors are kept by stable keys, never by a row number alone, so a note finds its thing again when the same data is loaded another day:

| Anchor | Kept as | Found again on |
|---|---|---|
| Data | The data's fingerprint (rows, extent, time span, groups, and 4,096 rows spread over it: position, time, who) and its name | The same data only. A renamed file is the same data. |
| Row, event | The fingerprint, the row, and the row's signature: who, which match, when, where (and the event's kind) | The same data at the same row; else the row with that signature among the person's rows (*found again at another row*). |
| Unit | The unit's key (the player column's value), and its name | Any data with that unit. |
| Match | The match's id (the match column's value or the session's label) | Any data with that match. |
| Round | The round's session label | Any data with that round. |
| Time range | From, to, and the round it is in | Any data with that round (or any data, without one). |
| Place | A world point, or a volume (its id, name and shape) | Always, on the data it was made on. |
| Heat spot | The point, the time, and the pick card's numbers as they were | Always, on the data it was made on. |
| Finding | The finding's id (stable for the same data and scope), its words, place, time and filters | Always; *not among the current findings* when a report is open and lacks it. |
| View, plan | The view or the plan itself | Always. |

A note whose thing this data does not have is greyed in the panel with *not in this data*, counted above the list (*n notes are about things this data does not have*), draws no pin and no mark, and says why when it is clicked. A place or heat spot made on other data draws no pin either: it is somewhere on another level.

## The notes panel

In the **Present** group of the Heatmap and Match workspaces (`Shift`+`N`, or *Notes* in the palette).

| Control | Meaning |
|---|---|
| **New note here** | As `N`. |
| **New analysis** | A new document, opened in the analysis window. |
| **Pins in the view** | The pins on or off. |
| Analyses | The session's documents, last changed first; a click opens one. |
| Search | Every word in the title, text, tags, author or anchor. |
| Kind, tag, author, match | Narrow the list to notes about one kind of thing, with a tag, by one author, of one match or round. A click on a note's tag picks it. |
| Order | Changed last, made last, title, kind, or time in the data. |
| ✎ / × | Edit / delete (after asking). |
| Your name | Signs notes, analyses and edits (the tactics board's name, the same one). |
| **Export JSON** / **Import JSON** | Every note and analysis as `3dheat-notes.json` (`schema: heat3d.notes/1`); an import adds a file's, one with the same id replacing the one here. |

The list draws the first 200 matching notes; **Show all** draws the rest.

## Analyses

The analysis window opens over the view. On the left the session's documents and the open one's outline (its headings: a click scrolls the preview there and puts the cursor on it); on the right the text and its preview: **Write** (text only), **Both**, **Read** (the document as it reads). The text is kept a moment after typing stops and when the window closes.

**Insert...** puts a live block at the cursor, as a line `{{block:<id>}}` in the text:

| Block | What it shows | In the preview |
|---|---|---|
| The view as it is | A thumbnail of the view, and the view itself | **Show in 3D** puts it back. |
| A saved view | The [saved view](saved-views.md) | **Show in 3D**. |
| A finding | The finding's words, strength and evidence | **Go to**: its place, time and filters. |
| The pick card's heat spot | The point, the heat at the pixel, the place's heat and rows, and how the place stands against the places in view - as the [pick card](heat-inspection.md) said it - with a thumbnail | **Go to**. |
| A chart | Bars, a line over time, or the numbers, of a Compare statistic | **Count again**, **Change**. |
| A note | The note's card | **Go to**. |
| The tactics plan | The plan as it is, with a thumbnail and what is on it | **Open on the board** puts it back (the board's undo takes it back). |
| A screenshot | A picture of the view | - |

**To analysis** on the pick card and on a finding puts it into the open analysis (or the last one, or a new one).

### Charts

A chart block offers every kind of the shared chart module, the same as the [charts on volumes](volume-charts.md): Bars, Stacked, Line, Area, Histogram, Donut, Tiles, Matrix, Scatter. Every chart in a document is drawn by that module - in the preview with hover, a click on a mark filtering the view, and the theme; in an export as a picture - so a document's chart and a sign's look the same. Its numbers are kept in the document, so it shows them without the data and in an export; **Count again** counts them on the loaded data.

Bars, Line and Tiles may be counted two ways (**Count with**):

- **Expression**: a statistic of the [Compare panel's](compare-groups.md) expressions, counted in its worker a slice at a time from idle moments, so counting never holds a frame. The fields below.
- **Chart settings**: the settings a volume's sign uses (measure, group by, split, compare, rounds, only rows with, sort - see [Charts on volumes](volume-charts.md#what-a-chart-shows)), over **All the data** or **The rows the view shows**, **Anywhere** or **Inside volume** (which also offers inside vs outside). Every other kind is counted this way, in a worker a chunk at a time.

| Field (Expression) | Meaning |
|---|---|
| Chart | Bars, Line over time, or Tiles. |
| Statistic | A Compare statistic: `count()`, `kills() / deaths()`, `countIf(event == "kill")`, `avg(speed)`... |
| Per | One number, a column's values (the top 8), time (20 steps of match time), the match, the round. |
| Rows | A Compare filter on the rows counted (`team == "Allies"`); empty for all. |
| Two sides | Two filters drawn side by side, as A and B. |
| Over | All the data, or the rows the view shows (time window, filters, groups). |

An expression chart's spec is plain JSON (`src/charts/exprSpec.ts`: `{ v, kind, title, measure: { expr, name, unit }, groupBy, filter, diff: { a, b }, scope, anchor }`), counted by `src/charts/exprRun.ts`, its numbers turned into the module's chart data (`src/charts/convert.ts`) and drawn by `src/charts/draw.ts`; `src/charts/exprSvg.ts` draws it only where there is no canvas.

A chart with the chart settings, and a chart made elsewhere in the viewer - a volume's sign sending its chart to the document - is the shared chart module's block (`heat3d.chartBlock/1`: title, spec, source, data as groups x series), counted by `src/charts/run.ts` over the rows it names; **Count again** on a sign's block counts the rows inside its volume while the volume is there. The documents take it through `takeChartBlock` (`src/ui/notes/actions.ts`), the sink a sender registers; such a block pasted as JSON into an analysis's text goes in as a block too.

### Export

**Export** makes the file here and downloads it; nothing leaves the machine.

| Format | What it is |
|---|---|
| HTML | One self-contained file: the styles inside, the pictures inline, the charts as pictures (PNG) drawn by the chart module; no link to anything outside. Opens and prints anywhere. |
| Markdown with pictures (.zip) | `<title>.md` and its pictures under `images/` (thumbnails and screenshots as JPEG or PNG, charts as PNG), a chart's numbers also as a table. |
| Markdown (one file) | The same text with the pictures inline as data URLs. |
| Print or save as PDF | The HTML in a new tab, and the browser's print dialog: choose *Save as PDF*. |

Links to notes and analyses keep their words in an export and lose the link.

## Storage and shared sessions

Notes and analyses are kept in this browser (IndexedDB, else local storage) a moment after each change, for every dataset; a browser without room says so in the panel, and the JSON export is the copy to rely on.

Every change is a batch of operations by id on two collections, `notes` and `docs` - `add`, `set` (fields, last writer wins per field), `del` - signed with its author and time, as the [tactics board's](tactics-board.md) log is. A shared session sends the batches; a session file keeps the book and the log. For the session code:

| Hook (`src/notes/store.ts`) | What it does |
|---|---|
| `notesState()` | `{ schema: 'heat3d.notes/1', book: { notes, docs }, log }`: everything to save. |
| `loadNotesState(state)` | Puts a saved state back, in place of what is here. |
| `onLocalBatch(fn)` | Hears each local edit's batch, to send on; returns its removal. |
| `useNotes.getState().applyRemote(batch)` | Applies a batch from a peer or a file, once per batch id. |

## Performance

Pins go through the spawn markers' instanced draw (one instance a note, six vertices each), resolved again only when the notes or the data change - in an idle callback, never inside a frame - and their instances written again only when the set shown changes. A frame that shows the same pins checks a thousand notes' time windows and nothing else. The hover is found on pointer moves at most twenty times a second and written straight into its element; the panel, the editor and the analysis window render on input only. With 1,000 notes on the view the frame time is as without them: measured on WebGPU and WebGL2 with the camera circling 300,000 rows, p99 16.8 ms (the display's 60 Hz) with and without the notes, in All and in Play mode (`node tools/probe-notes.mjs [url] [--notes=1000]`; [`pins.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/notes/pins.ts), [`store.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/notes/store.ts), [`NotesLayer.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/notes/NotesLayer.tsx)).
