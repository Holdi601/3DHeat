---
title: Data formats reference
nav_order: 10
---

# Data formats reference

What the Heatmap tab reads, column by column, and the hints a Parquet file can carry. (The Race analysis tab reads lap files, and the Match tab match summaries; see [Race analysis](race-analysis.md) and [Match analysis](match-analysis.md).)

## Files

| Extension | Read as |
|---|---|
| `.parquet`, `.pq` | Parquet |
| `.csv`, `.tsv`, `.txt` | Delimited text |

Empty files are skipped. In a selection that contains `movement*.<ext>` files, only those are loaded ([Loading files](loading-files.md#which-files-are-kept)).

The data is **one row per sample**: a position at a moment, optionally with who, which group, which session, where they were looking, and any further columns. Event rows (a kill, a plant, a shot) can sit in the same table as position rows, told apart by an event column.

## Delimited text (CSV, TSV, TXT)

Parsed by a byte-level scanner that decodes only the mapped columns ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Aspect | Rule |
|---|---|
| Header | The first non-empty line holds the column names. An empty name becomes `column_N`. |
| Delimiter | Detected from the first 20 non-empty lines of the first 1 MiB, among comma, semicolon, tab and pipe, by **consistency**: the delimiter that gives the same field count on every sampled line wins, then the one giving more fields. Space is never detected but can be chosen; any single character can be typed ([Column mapping](column-mapping.md#the-fields)). |
| Quoting | RFC 4180: fields may be wrapped in double quotes, `""` inside quotes is a literal quote. |
| Whitespace | Leading and trailing spaces, tabs and quotes are trimmed from each field. |
| Fields per row | At most 4,096; more is an error (*is the delimiter right?*). |
| Numbers | Optional sign, digits, optional `.` and decimals, optional exponent (`1.5e-3`). A decimal comma, thousands separators or trailing units (`12 m`) do not parse and count as missing. |
| Numeric column | A column is offered as numeric when more than 90% of the non-empty values in the first 50 rows parse as numbers. |
| Row count | Estimated before loading from the average line length of the first 1 MiB. |
| Text encoding | UTF-8. |

## Parquet

Read with [hyparquet](https://github.com/hyparam/hyparquet), column chunk by column chunk into typed arrays, requesting only mapped columns ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Aspect | Rule |
|---|---|
| Row count | Exact, from the footer, before loading. |
| Preview | The first 50 rows, decoded as objects; their values decide which columns look numeric. |
| Integers | `INT32`, and `INT64` (decoded as BigInt) become numbers. |
| Floats | `FLOAT`, `DOUBLE`. |
| Booleans | 1 and 0. |
| Strings | Used for person, group, session and category columns; a numeric-looking string is accepted for numeric roles. |
| `TIMESTAMP`, `DATE` logical types | Decode to instants (milliseconds since 1970); used as a time axis, the unit setting is ignored. |
| Nested columns | Struct and list columns are not meant for any role (they preview as JSON text); untested. |
| Footer metadata | The key `heat3d` is read as mapping hints (below). |

A position, time or look column that holds something other than a number decodes as missing.

## Column roles and types

| Role | Type in the file | Required | Stored as | Limits |
|---|---|---|---|---|
| X, Y, Z | number | two of three | 32-bit float, after the [axis mapping](axes-units-and-time.md) | A row without a usable position is dropped. |
| Time | number in one of the [time units](axes-units-and-time.md#time-units), Parquet timestamp, or ISO-8601 text | no | 32-bit float seconds from the earliest row | Sorting is refused above 80M rows. |
| Person | any; dictionary-encoded | no | 32-bit id | |
| Session | any; dictionary-encoded | no | 32-bit id | Labels listed up to 100,000 sessions. |
| Group | any; dictionary-encoded | no | 16-bit id | Up to 4,096 groups, else the grouping is dropped. |
| Yaw, pitch | number, degrees or radians | no | 32-bit float radians | |
| Direction X, Y, Z | number | no (all three together) | converted to yaw and pitch | |
| Filter column, *range* | number | no | 32-bit float | Up to 4 filters active at once. |
| Filter column, *category* | any; dictionary-encoded | no | 32-bit id | Up to 4,096 values, else the column is not kept. |

A Parquet `TIMESTAMP` column kept as a filter column is a *range* of epoch milliseconds - a slider, not a list.

## The `heat3d` hints

A Parquet file can carry its own reading instructions in its footer's key/value metadata, under the key **`heat3d`**, as a JSON object ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). The viewer applies them over its own guesses when the file is the first of a selection; every entry is optional and every result is still shown and editable in the [Column mapping](column-mapping.md#the-heat3d-hints-in-a-parquet-footer) panel. Anything that does not parse as a JSON object is ignored.

### Schema

```
{
  "columns": {
    "x": string, "y": string, "z": string,          column names for the position
    "time": string,                                  the time column
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           filter columns to keep, most useful first
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  must be > 0
  },
  "entity": {
    "size": number                                   size of one tracked thing in file units, > 0
  }
}
```

| Entry | Applied when | Effect |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | the named column exists in the file | Sets that role. |
| `columns.timeUnit` | it is one of the seven units | Sets the time unit. |
| `columns.angleUnit` | `"degrees"` or `"radians"` | Sets the angle unit. |
| `columns.lookMode` | `"vector"` with dirX, dirY and dirZ all set; `"yawPitch"` with yaw set; `"none"` | Sets the look mode. |
| `columns.extra` | it is an array | Replaces the automatic filter list, keeping only existing columns not used by a role; each one is *range* when it looked numeric in the preview, else *category*. Without it, the automatic list is kept minus any column a hint assigned to a role. |
| `axes.up` | `"y"` or `"z"` | Up axis. |
| `axes.flipX/Y/Z` | a boolean | Flips. |
| `axes.scale` | a number > 0 | Unit scale. |
| `entity.size` | a number > 0 | [Entity size](sessions-persons-groups.md#entity-size) (multiplied by the unit scale at load). The only way to set it. |

### Example

A made-up export of a shooter: Z-up, centimetres, a left-handed world, players about 72 cm wide.

```json
{
  "columns": {
    "x": "pos_x", "y": "pos_y", "z": "pos_z",
    "time": "t", "timeUnit": "seconds",
    "personId": "player", "teamId": "side", "sessionId": "round_id",
    "lookMode": "yawPitch", "yaw": "view_yaw", "pitch": "view_pitch", "angleUnit": "degrees",
    "extra": ["event", "weapon", "map"]
  },
  "axes": { "up": "z", "flipY": true, "scale": 0.01 },
  "entity": { "size": 72 }
}
```

### Writing it

With pyarrow, custom schema metadata is written to the file's key/value metadata:

```python
import json
import pyarrow as pa
import pyarrow.parquet as pq

table = pa.table({...})
hints = {"columns": {"x": "pos_x", "y": "pos_y", "z": "pos_z", "time": "t"}, "axes": {"up": "z"}}
meta = dict(table.schema.metadata or {})
meta[b"heat3d"] = json.dumps(hints).encode("utf-8")
pq.write_table(table.replace_schema_metadata(meta), "movement.parquet")
```

`npm run inspect -- file.parquet` prints a file's schema, which is a quick way to check the column names the hints refer to.

## What the Heatmap tab writes

Nothing is written back to the data. The outputs are:

- videos, as WebM (VP9 or VP8) - [Camera path and video](camera-path-and-video.md);
- a camera pose, copied to the clipboard as text - [Camera](camera.md#pose);
- levels saved in the browser's [level library](level-library.md).
