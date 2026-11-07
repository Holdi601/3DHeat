---
title: Line heat
parent: Heat modes
nav_order: 7
---

# Line heat

**Lines** (key 5) is line heat: a line from each of a person's samples to their next, splatted with the same falloff a sprite has - across the line instead of round a point. It shows where people *went* rather than where they stood: a corridor run through once is as visible as a room camped in, and a fast player's sparse samples join into a continuous route instead of a dotted trail. It needs a person column and a time column.

A line only makes sense between a beginning and an end, so the **Routes** panel says what bounds a route.

## The Routes panel

Shown above the heat panels in Lines mode.

### What the data has

A checklist, green when present, amber when not:

| Line | States |
|---|---|
| **Time axis** | *present* / *missing - needed* |
| **Person id** | *present* / *missing - needed* |
| **Session id** | *present* / *none - all rows are one session* |
| **Start and end events** | *N starts, M ends* / *none chosen - whole tracks* (green only with an event column and at least one start and one end) |

### Controls

| Control | Meaning |
|---|---|
| **Event column** | A category column whose values are events (spawn, death, position, ...). *None - whole tracks*: each person's track in each session is one route, broken where the track has a gap. Only columns kept for filtering at load are offered. |
| **A route starts at** | Event values that begin a route (spawn, respawn, deploy). None chosen: a route starts at a person's first sample, and again after each end. |
| **A route ends at** | Event values that end a route (death, extraction, teleport). The line runs up to the end row itself. None chosen: a route ends where the person's track ends. |
| **Points along a route** | Event values whose rows lie along the route. None chosen: every row of the person. Narrow it when the column also holds rows placed somewhere else, such as where a grenade landed. |
| **Suggest from the event names** | Fills the three lists from the values' names (below). |
| **Colour** | *Heat*, *Team heat* or *Difference*. The same routes in the colouring of that mode: each group in its own hue, or one side against the other, with the group list, the split and the ramps working as they do in those modes. Default *Heat*. Team heat and difference need a group column. |
| **No lines across jumps** / **Longest step** | A person's next sample further away than this is a respawn, a teleport or a drop rather than somewhere they went, so no line joins the two. Filled in at load when the data shows a clear gap (below), and off when it does not. Works with or without an event column. |
| Stats line | `N routes, M of them reaching an end, K segments`, updated a few times a second. |

Each list is a row of toggle chips, one per value, most frequent first; hovering a chip shows its row count. At most 120 values are offered (*N more values not shown*).

Choosing another event column applies the suggestion when the suggestion picks that same column, and starts with empty lists otherwise.

### The suggestion

On every load, and on **Suggest from the event names** ([`suggestLineSettings`](https://github.com/Holdi601/3DHeat/blob/main/src/data/lines.ts)):

- **Event column:** the first retained category column named `event`, `eventname` or `eventtype`; else `kind`, `type` or `action`; else any containing *event*, *kind*, *action* or *type*.
- **Starts:** values containing *spawn, deploy, join, enter, start, begin, respawn, revive, land/landed/landing, drop* - unless they also match an end word.
- **Ends:** values containing *death, died, dead, kill/killed, eliminat…, extract, evac, teleport, leave, left, disconnect, quit, exit, end, finish, downed* - except the values `kill` and `kills` (a kill is something the killer does, not the end of their route).
- **Points:** values that are exactly *position, location, player location, move, movement, tick, sample* or *pos*; when any is found, the starts and ends are added to the points too. When none is found, points stay empty (every row).

### The jump limit

Where people jump, the lengths of the steps fall into two groups with next to nothing between them: what a person covers between two samples, and the width of the map. On load ([`suggestMaxJump`](https://github.com/Holdi601/3DHeat/blob/main/src/data/lines.ts)) the steps are counted per doubling of their squared length, up to 16 million of them, and the limit goes in the middle of the first range above the median that is at least one doubling of length wide, holds under 0.02% of the steps per bin, and has steps beyond it. With no such range nothing is cut, since there would be no telling a jump from a fast car; turning the limit on by hand then starts at a tenth of the data's diagonal.

The chart above the limit shows how long the steps really are, with a line at the limit: the bars right of it are not drawn. Both axes are logarithmic, because the jumps can be a hundredth of the steps and a thousand times as long. Hover a bar for its range and share; click the chart to put the limit there. Under it, the share of steps over the limit.

## The rules of a route

Rows are walked in time order, per person ([`buildLines`](https://github.com/Holdi601/3DHeat/blob/main/src/data/lines.ts)):

1. Rows of a [shared name](sessions-persons-groups.md#names-worn-by-several-things-at-once) are skipped entirely.
2. With points chosen, a row that is neither a start, an end nor a point is skipped.
3. Rows are followed per person per session, so a person whose sessions interleave in time order has one route in each. A route is closed when the previous row had no successor (its [lifetime](sessions-persons-groups.md#person) is "none") - a route never crosses a session boundary or a gap the load decided has no next sample. Which route a row is on is worked out once and kept, 4 bytes a row, so changing the longest step does not repeat that part.
4. A **start** row closes any open route and opens a new one there.
5. With starts chosen, a row outside a route is ignored. Without starts, any non-end row outside a route opens one.
6. Any other row inside a route adds a **segment** from the previous row of the route to this one.
7. An **end** row that extends a route closes it after its segment; that route counts as *reaching an end*.
8. A step longer than **Longest step** closes the route where it was, and a new route starts at the far end, unless that row is an end. No line is drawn across it, and the stats line counts it.

Each segment is stored on its *end* row, so segments stay in time order, and the [timeline](timeline.md) window, the sampler, the [filters](filters.md), the group visibility and the difference sign all work on them as on points. A filter therefore applies to the row a segment ends at.

The routes are built on the main thread when Lines mode is entered (or the route settings change) and freed when it is left: 5 bytes a row in memory and 8 bytes a row on the GPU (each segment's start position, quantised to 16 bits per axis within the data's bounding box, and its flags).

## How a line is drawn

Both backends draw each segment from its end row as **18 vertices** ([`lineHeatVs`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts) and its WGSL twin):

- The half-width at each end is the [sprite radius](sprite-shape.md#sprite-radius) at that end's distance, with the pixel clamps applied. A line narrower than 2.5 px is drawn 2.5 px wide with its heat scaled down to match, so thin lines neither vanish nor brighten.
- The heat falls off **across** the line with the same ramp as a sprite - falloff or curve, centre and edge intensity.
- Round caps are drawn **only** where a route begins or ends, so the joints between consecutive segments do not bead into a string of pearls.
- The geometry is built in screen space and interpolated linearly there, so the falloff stays centred on the line however it runs into the depth. A segment crossing the near plane is cut there rather than dropped.

Points heat and line heat lay down very different amounts of heat per row, so the saturation is metered again when you switch between them ([Colour and exposure](colour-and-exposure.md#auto-exposure)).

## Playback

In **All** mode every route is drawn whole. In **Play** mode each person is a point moving between their samples, drawing their route behind them:

- a segment that starts after the playhead is not drawn;
- the segment the person is in the middle of is drawn up to their interpolated position, with an end cap at the head;
- the heat fades over the **tail**: with the *Cumulative* history the tail is unlimited and the whole route so far stays; with *Window* it fades to nothing over the *Span* (default 30 s). With *Lifetime* the tail is also the *Span*, and in Lines mode the timeline shows the *Span* box for that history too (in place of *Fallback life* and *Fade*, which line heat does not use).

While playing, each frame is drawn whole rather than accumulated, because the heads move every frame and a moving average would smear each into a streak.
