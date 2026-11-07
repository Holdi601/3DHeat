---
title: Box replay
parent: Heat modes
nav_order: 8
---

# Box replay

**Box replay** (key 4) draws one box per person, moving along the [timeline](timeline.md), with optional look rays and trails. It is playback rather than density: *who was where, when*. It needs a person column; without a time column every sample is drawn at once.

No heat is drawn in this mode, and the adaptive sprite budget is idle.

By default each person is drawn as the figure of what they are rather than a box - see [Figure replay and debrief](figure-replay.md), which also covers names over the tracks, the follow camera, measuring between two tracks and the event list.

## The Team viewer panel

Shown instead of the heat panels in this mode.

| Control | Default | Range (jog) | Meaning |
|---|---|---|---|
| **Cube size** | entity size, or extent / 500, on load | 0.05-200 m, logarithmic (5000) | Edge length of each box. See [entity size](sessions-persons-groups.md#entity-size). |
| **Interpolate between samples** | on | | Between two samples of the same person in the same session, place the box proportionally between them. Never across a session boundary. |
| **Show look direction** | on | | A ray from each box along the person's look direction (needs [look columns](axes-units-and-time.md#look-direction)). |
| **Look ray length** | entity size × 4, or extent / 200, on load | 0.5-500 m, logarithmic (20,000) | Shown while look direction is on. |
| **Trail length** | 8 s | 0-300 s (86,400); 0 = off | Seconds of history drawn behind each person. |
| **Draw every raw sample** | off | | A box per stored sample in the window rather than one interpolated box per person. Subsampled to stay interactive. |

Hints in the panel explain that interpolation and trails join samples within one session only, and, when the load has [shared names](sessions-persons-groups.md#names-worn-by-several-things-at-once), how many names are drawn as single samples.

## The session being played

With a session column, the **Session** picker at the top of the sidebar ([Sessions](sessions-persons-groups.md#the-session-picker)) decides which match is played back. The busiest is chosen on load. Only rows of that session become boxes and trails, and the timeline runs over that session's span instead of the whole dataset's. *All sessions* plays every session at once, still never joining samples across sessions.

## What is drawn when

From [`TrackCursor`](https://github.com/Holdi601/3DHeat/blob/main/src/data/tracks.ts):

**Live boxes** (Play mode, raw samples off). For each visible person, their latest sample at or before the playhead:

- If the person has a next sample, it is in the same session, and the name is not shared, the box is placed between the two samples in proportion to time, with the yaw interpolated along the shorter way round and the pitch linearly (when *Interpolate* is on).
- Otherwise the box stays at the last sample for the **Fallback life** of the timeline (default 10 s) and is then dropped, so eliminated players do not linger.

**All mode** ignores the playhead and draws every sample in range as a box.

**Raw samples** draws a box per stored sample in the window: the *Span* with the *Window* history, everything up to the playhead otherwise. At most 65,536 boxes; with more samples, every *k*th is drawn.

**Trails** (when the trail length is above 0 and raw samples are not drawn): a line between each pair of consecutive samples of a person within the last *trail length* seconds up to the playhead, fading from 80% opacity to transparent with age. A trail stops at a session change and is not drawn for shared names. At most 131,072 vertices; with more, rows are skipped evenly.

**Who is visible:** a person is hidden when their group is unticked in the [Teams list](teams-list.md) (their group being that of their first row), when a group filter excludes it, or when the [Entities](entities.md) panel has a selection that does not include them. Column [filters](filters.md) do not apply to boxes.

## Colours

One hue family per group and one shade per member, so a glance tells you which side someone is on ([`teamMemberColor`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts)). Group hues cycle through a fixed list of ten - blue, red, green, amber, violet, cyan, magenta, lime, orange, indigo - and members of a group are spread across lightness 42-76% and saturation 90-65%.

## Notes

- The box replay rebuilds its boxes only when something changes; an idle frame redraws the last ones.
- The *Cubes* line of the [stats overlay](performance-and-stats.md) counts the boxes on screen.
- Box replay draws in the same scene as the level, so [depth of field](camera.md#depth-of-field) blurs the boxes but never the heat.
