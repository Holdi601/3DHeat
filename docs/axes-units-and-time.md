---
title: Axes, units and time
parent: Getting data in
nav_order: 3
---

# Axes, units and time

## The world the viewer draws in

The viewer's world is **Y-up and right-handed** (the three.js convention): X and Z are the ground plane, Y is height. Game engines disagree - most are Z-up, some are left-handed - so the mapping says how to turn the file's axes into the viewer's.

### Up axis

**Up axis in source** in the [Column mapping](column-mapping.md):

| Setting | File (x, y, z) becomes world (X, Y, Z) |
|---|---|
| *Z is up (most game engines)* - the default | (x, **z**, **y**): the file's Z becomes height and the file's Y becomes the world's Z |
| *Y is up (graphics convention)* | (x, y, z) unchanged |

For Z-up data the three arrays are relabelled rather than copied ([`remapAxesInPlace`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingest.ts)), which saves hundreds of megabytes on large loads. The guess is made from the sample: whichever of the Y and Z columns has the smaller spread is up.

### Flips

**Flip X**, **Flip Y**, **Flip Z** negate the *file's* axis of that name, before the relabelling - so with Z-up, *Flip Y* negates what ends up as the world's Z. A flip changes the loaded data: coordinates shown by the [ruler](measure.md), the slice and the camera pose are the flipped ones.

To draw a mirrored world the right way round **without** changing the data, use **Camera & scene → Invert world axis** instead ([Camera](camera.md#invert-world-axis)). That is the better choice for games whose world is left-handed, because every coordinate the tools show stays the game's own.

### Unit scale

**Unit scale** multiplies every position. *1 (m)* sets 1, *0.01 (cm→m)* sets 0.01 (Unreal Engine and Source-engine units are centimetres or inches, not metres), and the box accepts any value. A typed 0 or a value that is not a number is replaced by 1.

The viewer labels distances in metres (sprite radius, cull distances, the ruler, fly speed), which is only true when the scaled world unit is a metre. Nothing breaks when it is not; the labels just read "m" for whatever the unit is.

## Time

### Time units

| Time unit (menu label) | Read as | Wall clock shown |
|---|---|---|
| *Seconds (relative)* | value × 1 s | no |
| *Milliseconds (relative)* | value × 0.001 s | no |
| *Microseconds (relative)* | value × 10^-6 s | no |
| *Nanoseconds (relative)* | value × 10^-9 s | no |
| *Unix timestamp (s)* | seconds since 1970-01-01 UTC | yes |
| *Unix timestamp (ms)* | milliseconds since 1970-01-01 UTC | yes |
| *ISO-8601 date string* | text such as `2026-03-14T18:02:11.250Z`, parsed with the browser's `Date.parse` | yes |

With an absolute unit (the last three) the dataset keeps the wall-clock instant of its earliest row, and the timeline shows the current UTC time of day (`HH:MM:SSZ`) beside the playhead.

**Parquet `TIMESTAMP` and `DATE` columns** decode to real instants, so their unit setting is ignored and the panel says so. A `DATE` column is a whole day: every row of a day shares one instant and playback jumps a day at a time, which the panel warns about.

**ISO-8601 strings work in CSV and Parquet alike.** A text time column with the ISO unit is parsed once per distinct string; if none parses, the load fails with *No parseable ISO-8601 timestamps in the mapped time column.* - and the mapping already refuses to start when none of the sampled values parses. A Parquet `TIMESTAMP` column is read as a timestamp whatever unit is set, and a numeric Parquet column with the ISO unit is read as Unix milliseconds. A text time column with a numeric unit is refused before loading: every value would read as NaN.

### How time is stored

While files are merged, times are 64-bit seconds, so an absolute epoch keeps its sub-second detail. When all files are in, the earliest time of the whole selection becomes 0 and every row stores 32-bit seconds from it. A 32-bit float has 24 bits of mantissa: spans of up to about a day and a half resolve to better than 1/100 s, spans of half a year to about a second. A row whose time is missing or not a number is placed at 0, the start.

Rows are then sorted by time, which is what makes the timeline cheap: a time window is found with two binary searches (see [Sampling and budgets](sampling-and-budgets.md)).

### Elapsed time versus wall clock

A time column such as `match_time` or `round_time` counts from each match's own start. Choosing it puts every match on one shared axis - good for comparing what happens in minute 3 of every match - and the panel points this out. A wall-clock column shows the matches in the order they really happened, overlapping where they overlapped.

## Look direction

Look direction is used only by [box replay](box-replay.md) (the rays from each box). It is stored as two angles, yaw and pitch, in radians.

- **Yaw / pitch columns** are read as they are, converted from degrees when *Degrees* is chosen. They are not adjusted for the up axis or the flips.
- **Direction vector columns** go through the same relabelling and flips as the positions, then become yaw = atan2(x, -z) and pitch = atan2(y, √(x² + z²)) in world axes, so the ray points where the box faces in a mirrored-source world as well.

If yaw/pitch columns come out pointing the wrong way after a flip, a direction vector, or adjusted angles, is the fix.
