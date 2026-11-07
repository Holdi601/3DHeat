---
title: Sessions, persons and groups
parent: Getting data in
nav_order: 4
---

# Sessions, persons and groups

Three optional columns describe *who* and *where in the story* a row belongs. Each is dictionary-encoded at load: the text values become small integer ids per row plus one list of labels, shared across every file of the load.

## Person

The **Person id** column names the moving thing a row belongs to: a player, a bot, a car. It is stored as a 32-bit id per row.

With a person and a time column, the load computes each row's **lifetime**: the time until the same person's next sample *in the same session*, or "none" (a sentinel, -1) when there is no next sample - the person died, left, or the log ended. Lifetimes power the **Lifetime** history of the [timeline](timeline.md), interpolation and staleness in [box replay](box-replay.md), and the route breaks of [line heat](line-heat.md). What a row with no successor does is a viewing setting (*Fallback life*), not baked into the data.

Each person is given the group of their **first** row in time; that assignment colours their box in box replay and decides which group's visibility toggle hides them there. Heat modes use each row's own group instead.

### Names worn by several things at once

A name is not always one entity: in some exports every bot of every match logs under one name. Joining two samples of such a "person" - by interpolation, a trail or a route - draws a line between two different creatures across the map.

At load ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) a name is marked **shared** when two records of it

- are in the same session,
- have the same time,
- are of the same kind (every retained category column has the same value), and
- are farther apart than 1% of the diagonal of the data's extent.

Shared names are drawn as single samples - no interpolation, no trail, no line-heat route. Everything else about them (their heat) is unaffected. The Dataset panel lists how many names were marked, with up to three examples, and the box replay panel repeats the count.

## Session

The **Session / match** column says which match, raid, round, run or lap a row belongs to. It is what makes a person's samples one continuous track: real telemetry often interleaves concurrent matches, and a player's sample just before the playhead and the one just after may be from different matches hundreds of metres apart. With a session column:

- interpolation, trails and line-heat routes never cross a session change;
- a row's lifetime ends at the end of its own session;
- the **Session** picker appears at the top of the sidebar, under the mode bar.

A session column is very often a *timestamp* - the match's start instant, repeated on every row of that match. The auto-mapper looks for session names before person and group for this reason ([Column mapping](column-mapping.md#session-person-group)). A racing lap or stint is a session too: two laps by the same car must not be joined into one track.

### The Session picker

Shown when the dataset has listed sessions (see the limit below).

| Part | Meaning |
|---|---|
| Label on the right | The selected session's row count, or *all at once*. |
| Menu | *All sessions (N)*, then every session, busiest first, as `label - N rows, span` (span in seconds below 90 s, minutes below 90 min, hours above). |
| Amber hint | Shown for *All sessions*: positions are still never joined across sessions, but concurrent matches put unrelated players on the map together. |
| Hint | Shown in the heat modes when one session is picked: the pick moves the playhead only. |

On load the busiest session is selected. Picking a session seeks the playhead to that session's start.

What the selection changes:

- In **[box replay](box-replay.md)** it decides which session is played back: only that session's boxes and trails are drawn, and the timeline's range becomes the session's own span.
- In the **heat modes** it does not restrict the heat, and a hint under the picker says so: *In the heat modes this only moves the playhead to the session's start; the heat still counts every session. Box replay plays the chosen session alone.* To restrict heat to one session, also keep the session column as a filter column (*Keep for filtering*) and filter on it (unverified whether a column may be both session and filter column at once; the panel allows ticking it).

### Too many sessions

Up to **100,000** sessions are listed. Beyond that the column is really an id (a folder with millions of sessions of a handful of rows each), and sending that many labels from the worker to the page is what runs a tab out of memory. The load then keeps the session **ids** - so boundaries are still enforced everywhere - but drops the labels and the picker, and the Dataset panel says so.

## Group

The **Team / group** column is any low-cardinality column: a team, a side, a squad, a faction, a player-versus-AI flag, a car class. It is stored as a 16-bit id per row and drives:

- the [Teams list](teams-list.md) (visibility per group, + / − sides),
- [team heat](team-heat.md) (a hue per group),
- the [difference](difference.md) split by group,
- box colours in [box replay](box-replay.md) (a hue family per group, a shade per member).

### Limits

At most **4,096** distinct groups. The group id rides in the fourth channel of each row's position texel on the GPU, and each group needs a texel in the 4,096-wide sign table the shader reads to decide *hidden*, *added* or *subtracted*. A column with more distinct values is an id, not a group: **the load keeps every row and drops only the grouping**, with a warning on the dataset that suggests mapping it as the person column instead, or keeping it as a filter column.

The same 4,096 limit applies to a retained *category* filter column; a wider one is not retained and the dataset says so. A numeric column (a timestamp, say) has no such limit as a *range* filter.

Group values `0`, an empty value, `none`, `unknown`, `null` and `-1` (case-insensitive) mean "no group" to [team heat](team-heat.md), which draws them neutral grey rather than as a confident colour.

## Entity size

How big one tracked thing is - a player's collision box, a car - decides how large the boxes and look rays of [box replay](box-replay.md) are drawn. There is no field for it in the panel; it comes from the file's [`heat3d` hints](data-formats.md#the-heat3d-hints) (`entity.size`, in the file's own units; the CS2 converter writes 32). The load multiplies it by the unit scale.

On every load ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), with *extent* the larger of the data's X and Z spans:

| Setting | With an entity size | Without |
|---|---|---|
| Cube size | entity size | extent / 500 |
| Look ray length | entity size × 4 | extent / 200 |
| Sprite radius | extent / 120 | extent / 120 |
| Saturation point | analytic estimate (then metered) | same |
| Fly speed | extent / 12 | same |
| Far plane | extent × 12 | same |
| Near plane | max(0.05, extent / 20,000) | same |

## The Dataset panel

Below the Source panel. With a dataset loaded it shows:

- the dataset's **name** - the selection, the row count, the file count, the stride when one was used;
- **`N teams · N persons · Ns span`**;
- every **warning** the load produced, in amber, for as long as the dataset is loaded: groups or a filter column dropped for too many values, sessions not listed, shared names, rows missing, files skipped;
- the [synthetic generator](synthetic-generator.md);
- **Unload**, which removes the dataset.

The row count is shown on the panel's header.
