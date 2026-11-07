---
title: Column mapping
parent: Getting data in
nav_order: 2
---

# Column mapping

After files are selected, the **Column mapping** panel opens below the Source panel. It says which column plays which role. It is filled in automatically and every field can be changed before pressing **Load**; the mapping is read at load time, so changing it afterwards means loading again.

## The fields

All column menus list every column of the first file, plus *- none -*.

| Field | Role | Notes |
|---|---|---|
| **Separator** | CSV only: the field delimiter. | Menu: *Comma ,*, *Semicolon ;*, *Tab*, *Pipe \|*, *Space*; or type any single character into *or type one character*. Detected automatically (see below). Changing it re-runs the auto-mapping, so edits made before are lost. |
| **X**, **Y**, **Z** | Position. | At least two are required; an unmapped third axis is 0 (the data lies on a plane). The same column on two axes is an error. |
| **Up axis in source** | Which source axis points up. | *Z is up (most game engines)* or *Y is up (graphics convention)*. See [Axes, units and time](axes-units-and-time.md). |
| **Unit scale** | Multiplies every position. | Buttons *1 (m)* and *0.01 (cm→m)*, or type a value. |
| **Flip X / Flip Y / Flip Z** | Negate a source axis. | Applied to positions and to look-direction vectors. |
| **Time** | The time axis. | Optional. Without it there is no timeline. |
| **Time unit** | How to read the time column. | Seven units; see [Axes, units and time](axes-units-and-time.md#time). Ignored for Parquet `TIMESTAMP`/`DATE` columns, which the panel says. |
| **Person id** | Who or what a row belongs to. | Optional. Makes tracks, lifetimes, box replay and line heat possible. |
| **Session / match** | Which match, raid, round, run or lap a row belongs to. | Optional. Positions are never interpolated, trailed or joined into a route across a session change. See [Sessions, persons and groups](sessions-persons-groups.md). |
| **Team / group** | Any low-cardinality column. | Optional. Drives group colours, team heat and the difference split by group. |
| **Look direction** | *None*, *Yaw / pitch columns* or *Direction vector columns*. | With yaw/pitch: **Yaw**, **Pitch** and **Angle unit** (*Degrees* / *Radians*). With a vector: **Dir X**, **Dir Y**, **Dir Z**. Used for the look rays of [box replay](box-replay.md). |
| **Keep for filtering** | Extra columns kept in memory. | A checkbox per column, and for each ticked one *range* (numeric) or *category*. Each costs 4 bytes per row and a decode pass at load. Only kept columns can be [filtered](filters.md), used for a [difference split](difference.md) or as a [line heat](line-heat.md) event column. |
| **Show sample rows** | A table of the first 12 sampled rows, all columns. | For checking the guesses. |

A ticked filter column that is not set explicitly is read as *range*; a numeric-looking id column is often more useful as *category*.

## How the auto-mapping guesses

The guessing is in [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). It looks at column names, at which columns are numeric in the sampled rows (more than 90% of the non-empty values parse as numbers), at how many distinct values each column takes in the sample, and at Parquet logical types. Name patterns are tried in order, case-insensitively, and the first pattern that matches any still-free column wins.

### Position

| Axis | Name patterns, in order (numeric columns only) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

If an axis is still empty, the first spare numeric columns (ignoring `filename`, `level`, `year`, `month`, `day`, `hour`, `location`) fill it in order. A wrong guess is obvious on screen; an empty one would leave an empty viewport.

### Time

- **Parquet timestamp columns first.** Among columns whose logical type is `TIMESTAMP` or `DATE`, the best is picked by score: +10,000 if the name matches a time pattern, -5,000 for a plain `DATE`, plus the number of distinct values in the sample. A whole-day date and a constant session start take almost no distinct values, so the event instant wins. The unit is then *Unix timestamp (ms)*.
- **Otherwise by name:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, then elapsed-time names (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). The unit is then guessed from the values: ISO-8601 when a value looks like `YYYY-MM-DDT…` or `YYYY-MM-DD …`; otherwise by the largest magnitude: above 10^17 nanoseconds, above 10^14 microseconds, above 10^11 Unix milliseconds, above 10^8 Unix seconds, above 10^6 milliseconds, else seconds.

When an elapsed-time column is chosen, the panel notes that every session is then aligned to its own start - good for overlaying matches, not for seeing them in real sequence.

### Session, person, group

The session is claimed **after** the time axis and **before** person and group, because a session column is often a timestamp (the match's start instant on every row of the match).

| Role | Name patterns, in order |
|---|---|
| Session | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (each exactly, optionally with `_id`) |
| Person | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, then `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (racing data: the car is what moves) |
| Group | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Group, fallback | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result`, `event_env`, `playtest_id` |

A group candidate that takes a distinct value on most sampled rows (more than max(48, 60% of the sample)) is an id, not a group: it becomes the person column if none was found, and is not used as the group. If no group column was found at all, the non-numeric column with the fewest distinct values between 2 and 12 is used.

### Look direction

A numeric column named `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` or `rot_z` / `rotation_z` switches look direction to yaw/pitch; pitch is looked for as `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…`. Degrees are assumed when any sampled yaw exceeds 7 in magnitude, radians otherwise. A direction vector is never guessed; it comes from the hints below or from you.

### Filter columns

At most **6** columns are kept automatically, ranked:

1. `region`, `sessionMode`, `actor` - columns that exist to be filtered on (score 1200);
2. category columns that vary in the sample, fewer distinct values first (1000 minus the count);
3. a column constant in the sample, but only when several files are loaded - it may differ between files, such as a region or a test-run id (600);
4. numeric columns (500).

Columns already playing a role, the noise names above, columns constant in a single-file load, and free-text columns (more than max(16, half the sample) distinct values) are not offered automatically. Any column can still be ticked by hand.

### Up axis

With all three axes mapped, the axis with the smaller spread of Y and Z in the sample is taken as up (a map is far wider than it is tall); otherwise Z-up is assumed.

## The `heat3d` hints in a Parquet footer

A Parquet file can say how it should be read. If the file's footer key/value metadata has an entry with the key **`heat3d`**, its value is parsed as JSON and laid over the guesses ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). The CS2 demo converter writes such an entry, so its tables open with the player as person, the side as group, each round as a session, look direction on and the world the right way round.

Only the **first** file of a selection is read for hints. Every entry is optional, and every hinted value still appears in the panel and can be changed. A full description of the schema, with an example and how to write it, is in the [Data formats reference](data-formats.md#the-heat3d-hints).

The rules, briefly:

- A column named by a hint is applied only when the file has that column.
- `lookMode: "vector"` takes effect only when `dirX`, `dirY` and `dirZ` are all set; `"yawPitch"` only when `yaw` is set.
- `extra`, when present, replaces the automatic filter list (unknown names and columns already playing a role are dropped); each one's range/category type follows whether it looked numeric. When absent, the automatic list is kept minus any column a hint gave a role.
- `axes.up` must be `"y"` or `"z"`, flips must be booleans, `scale` must be positive.
- `entity.size`, when positive, is the size of one tracked thing in the file's units ([entity size](sessions-persons-groups.md#entity-size)); it is the only way to set it.

## Known issue: overriding the CSV separator

When the separator is changed to one different from the detected one, the preview is re-read, but in the current code ([`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts)) the re-read still splits the header and sample rows with the *detected* delimiter, so the column list and sample rows do not change. The chosen separator is stored in the mapping and used for the load itself. Until this is fixed, a file whose separator is detected wrongly is best converted to a consistent separator beforehand.
