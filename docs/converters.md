---
title: Converters keep everything
parent: Getting data in
nav_order: 8
---

# Converters keep everything

Every tool that turns a game's replay, demo, log or live telemetry into
something the viewer opens follows one rule:

> **Convert everything the source holds that can be read now, and keep the
> rest whole, so it can be read later without the original file.**

A replay is often gone after a game update, a reinstall or a full disk, and a
live feed is gone the moment it was sent. What a converter drops is lost for
good; what it keeps whole can be decoded the day someone understands it. So a
converter never decides what will be useful: it decodes what it can, keeps
every other message, packet, event, property or line unchanged beside the
table, and says in its own output how much of each it read and how much it
only kept.

This page is the convention all converters share: the War Thunder, World of
Tanks, World of Warships and Squad replay converters, the CS2 demo converter,
the background watcher (its Dota replay decoder and every live adapter), the
game capture tool's telemetry readers, and the viewer's own imports (Tacview
ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Each tool's README has a **Completeness**
section that lists, for that source, what is read, what is kept raw and what
is not available, and why.

## Three homes for every item

Everything a source holds ends in exactly one of three places:

| Home | What goes there |
|---|---|
| **Decoded** | The table (one row per sample or event, the columns the viewer reads, extra columns for every other value that belongs to a row) and the match document `<match>.match.json` (everything that belongs to the match as a whole: settings, rosters, results, scoreboards, the self-check). |
| **Kept raw** | A sidecar beside the table: every item that is not decoded, or only partly decoded, whole and unchanged, with its type, time and the unit or entity it belongs to. |
| **Not available** | Named in the README's Completeness section with the reason: the format does not carry it (a client replay has no other players' inputs), the source never sends it, or reading it is not allowed (a protected process, an encrypted block whose key is not ours to use). |

An item that is **partly** decoded is decoded *and* kept raw: the table gets
what is understood, the sidecar the whole item, so a better decoder later
does not need the original file.

There is no fourth place. Dropping something because it looked useless,
because it was a duplicate "probably", or because it was large, is a bug.
Thinning is allowed only in the table (a camera at 2 Hz instead of 60), never
in the sidecar.

## Sidecars

A sidecar is a Parquet file next to the table, named after it:

```
<folder>/<match>.parquet              the table
<folder>/<match>.match.json           the match document
<folder>/<match>.<what>.parquet       a sidecar
```

`<what>` is one word from this list. A new converter picks the word that
fits, or adds a new one here **and** to `SIDECAR_PARQUET` in
[`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts),
so the viewer leaves it out when a whole folder is loaded.

| `<what>` | Holds | Used by |
|---|---|---|
| `messages` | packets, entity method calls and property updates of a network stream, whole | War Thunder, World of Tanks, World of Warships |
| `flight` | per-aircraft flight-model entries, whole | War Thunder |
| `packets` | whole frames and network messages, or container chunks, outside the entity stream | CS2, Dota 2, Squad |
| `events` | game events with all their keys, as the parser gives them | CS2 |
| `entities` | entity and property updates, remote calls, channels opened and closed, with the exports a decoder needs | Squad, Dota 2 |
| `props` | every entity property the parser reads, each time it changed | CS2 |
| `units` | per-unit state outside the position table | Dota 2 |
| `combatlog` | a combat log, every entry with every field | Dota 2 |
| `strings` | every entry of every string table | CS2, Dota 2 |
| `raw` | a live feed: every packet, line, API document or memory read received, whole | the watcher's sessions (`heat.raw.parquet`), the game capture tool's lap recorders (`<stamp>_<game>.raw.parquet`), the watcher's osu!, LoL and Valorant replay files |

The viewer's folder loading skips every `*.<what>.parquet` of this list, and
every `*.match.json`, `*.meta.json`, `*.summary.json` and the other JSON
sidecars; opening one of them on its own, by picking or dropping just that
file, loads it like any other table (see [Loading files](loading-files.md)).

### Columns

Each sidecar row is one item. The columns are, in this order, those that
apply:

| Column | Type | What |
|---|---|---|
| `time` | float64 | seconds on the same clock as the table's `time` (or `tick` where the source counts ticks; then both) |
| `type` | string (dictionary) | what the item is, in the source's own terms: a packet type, message id, event name, property path, line prefix |
| `name` | string (dictionary) | its name where one is known (a community name, a class name), else empty |
| `entity` / `unit` / `uid` / `player` | integer or string | whom it belongs to, in the same ids as the table, so a row of the sidecar can be joined to a track |
| `decoded` | string (JSON) | what is understood of it, where anything is; empty otherwise |
| `payload` | binary | the item's bytes, whole and unchanged (binary sources) |
| `text` | string | the item's text, whole and unchanged (text sources: a log line, a JSON object, a key-value block) |

Further columns are allowed (a bit offset, a size, a channel). Strings that
repeat are dictionary-encoded and the file is written with zstd, so a
sidecar stays a fraction of the replay's own size.

A sidecar must be enough on its own: a decoder written later reads the
sidecar, never the original replay. Where an item cannot be understood
without context (an entity's class, a string table, a key a message refers
to), the context goes into the sidecar too, or into the match document.

### Live sources

Live adapters (UDP telemetry, shared memory, a game's log, a local API) have
no file to go back to at all. They record **every field the source sends**,
even the ones nothing uses yet:

- a packet feed: every packet whole, `payload` the bytes, `type` its packet
  id or format, at the rate it arrives;
- shared memory or a polled API: every field of every read, either as named
  columns or the whole block as `payload`, at the rate the adapter reads;
- a log: every line, `text` the line, `type` the line's kind, including lines
  the adapter does not act on.

These go into `<session>.raw.parquet` beside the session's table. The size
is the price of the rule; it is kept down by zstd and dictionary encoding,
not by leaving things out.

## The self-check

Every converter writes, into its match document (or the session's
`meta.json`, or a summary where it has no match document), a
`completeness` block under `selfCheck`:

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["de_mirage_2026-11-07.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| Field | Meaning |
|---|---|
| `seen` | how many items of this type the source holds |
| `decoded` | read whole into the table or the match document |
| `partial` | read in part into the table or document, and kept whole in a sidecar |
| `raw` | kept whole in a sidecar only, not decoded |
| `lost` | `seen - decoded - partial - raw`: must be 0 |

The top-level `lost` is the sum. A converter's tests assert it is 0 on their
synthetic samples, and the README says what it was on real ones. A non-zero
`lost` is the converter saying it broke the rule; it names the type, so the
gap can be found.

The "types" are the source's own: packet types, message ids, event names,
property groups, line kinds. They are counted where the converter meets them,
not from a list of what it expects, so a type nobody knew about shows up
with its count instead of disappearing.

## The README's Completeness section

Each converter's README has a section headed **Completeness**, with three
lists:

- **Read**: what goes into the table and the match document, and how each
  new field was checked against something independent (the game's own
  numbers, a second source, a recording made for the purpose).
- **Kept raw**: what is in which sidecar, under which `type`, and what is
  known of it so far.
- **Not available**: what the source does not carry or may not be read, and
  why.

It links back here.

## Where each converter stands

| Converter | Sidecars | Its Completeness section |
|---|---|---|
| War Thunder replays | `messages`, `flight` | [3DHeat-Ext-WarThunder README](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (its self-check counts are under `counts`; the `completeness` block is to follow) |
| World of Tanks replays | `messages` | [3DHeat-Ext-WoT README](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| World of Warships replays | `messages` | [3DHeat-Ext-WoWs README](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Squad server demos | `entities`, `packets` | [3DHeat-Ext-Squad README](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| CS2 demos | `events`, `props`, `strings`, `packets` | [3DHeat-CS2 README](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Dota 2 replays (watcher) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Dota 2 replays](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| osu!, LoL, Valorant replays (watcher) | `raw` | their pages in the [watcher's docs](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Live adapters (watcher) | `raw` | each game's page in the [watcher's docs](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), and [development](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) for `Session.raw` |
| Lap recorders (game capture) | `raw`, and `unparsed` bytes inside a Forza lap file | [3DHeat-GameCapture README](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| The viewer's own imports | none: see below | this page |

### The viewer's own imports

Tacview ACMI, OCAP and the GPS formats are read in the browser from the
user's own file; the viewer stores nothing of them, so the file itself stays
the record. They still read as much as they can:

- **Tacview ACMI** (`src/data/acmi.ts`): every object line with a position is
  a row with every property the recording carries, every event a row, every
  removal a row, the recording's own properties (with the header's
  FileType and FileVersion) on every row as `RecordingInfo`; a comment line is
  an event `Comment`, an object that never gets a position a row
  `Unplaced` at the reference point, and U/V are columns whenever any row has
  them. A property line without a position is read in part: its values reach
  the object's next row, not at their own time. `AcmiTable.completeness`
  counts the file's lines by kind.
- **OCAP** (`src/data/ocap.ts`): every entity's frames, shots, markers, every
  event kind (unknown kinds as rows of "Mission" with their text) and the
  document's own fields (`Info`). Not read yet: entity fields and trailing
  position elements other than those listed in its header (a newer recorder's
  additions), and a dead unit's repeated frames after its death (thinned on
  purpose: nothing changes in them).
- **GPS formats** (`src/data/geoTracks.ts`): the fixes, their time, altitude,
  course and speed, and heart rate, cadence, power, temperature, satellites,
  HDOP and pressure altitude where the file logs them. Not read yet: other
  GPX and KML extensions, NMEA sentences other than the position ones, IGC
  records other than fixes and their extensions, and FIT messages other than
  records (laps, sessions, device info).

These gaps are listed so they are closed, not to excuse them; the viewer's
exports of a loaded recording (`src/data/exportRecording.ts`) write only what
was read.

## Adding a converter

1. List what the format holds, from its documentation, its own structures,
   or by counting every message type in real samples. The list is the
   self-check's `types`.
2. Decode what can be checked now. Every new field is checked against
   something independent before it goes into the table; a field that cannot
   be checked yet stays raw.
3. Keep the rest whole in a sidecar named as above, with the columns above.
4. Write the `completeness` block and a test that it has `lost` 0.
5. Write the README's Completeness section and link here.
6. If the sidecar's `<what>` is new, add it to the table above and to
   `SIDECAR_PARQUET` in `src/data/filePick.ts`.

Converters are clean-room: they are written from formats, documentation and
samples, never from GPL or AGPL code. Samples of real replays stay on the
machine that made them; tests use synthetic files.
