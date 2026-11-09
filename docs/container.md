---
title: One file a match (.3dheat)
parent: Getting data in
nav_order: 9
---

# One file a match: `.3dheat`

A converted match used to be several files side by side: the table
`<match>.parquet`, the match document `<match>.match.json` and the sidecars
`<match>.<what>.parquet` ([Converters keep everything](converters.md)). A
`.3dheat` file holds all of them in one: one replay, one file, to copy, keep
or share.

It is built so that loading a thousand of them is as fast as loading the
loose tables, and so that later converters can put far more into it without
a new format.

## Loading one

Anywhere a file or a folder loads, a `.3dheat` file loads too, and a folder
may mix containers and loose files:

| Where | What is read from the container |
|---|---|
| **Heatmap** source panel (files, folder, drag and drop) | its tables, as if they were the loose `<match>.parquet` |
| **Heatmap → Many matches at once** (Files, Folder, Add folder) | its tables, read in place by the loader's workers |
| **Match** tab (Load, or drop on the view) | the match document |
| **Tactics** board telemetry | its tables |

Opening a container reads two small pieces of it, its directory at the end
and its manifest at the start; nothing of a table is read until the loader
reads it. Sidecars and the match document are read only when something asks
for them. A folder holding the same match twice, loose and packed, loads it
once.

## Packing and unpacking

New conversions write containers by default: the War Thunder converter
(`heat3d-wt-replay`), the CS2 converter (`heat3d_cs2 demos`) and the Tacview
tool (`node tools/acmi-to-parquet.mjs`). `--loose` keeps the separate files.

Matches converted before, or by other tools, are packed with:

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** finds every table `<match>.parquet` under the folders with the
  files that belong to it and writes `<match>.3dheat` beside them. A match
  already packed is skipped. Each container is read back whole (every
  member's sha256, size, CRC and Parquet footer) before anything else
  happens; the loose files are deleted only with `--delete-loose`, and for a
  match packed earlier only when they are byte for byte what the container
  holds. A match with a file changed in the last `--settle` minutes (10 by
  default) is left alone: a converter may still be writing it.
- **unpack** writes the members back as loose files beside the container.
- **update** adds or replaces members without rewriting the tables already in
  the container (below).
- **repack** rewrites a container whole, dropping what updates left behind.

## The format

A `.3dheat` file is a ZIP archive (any ZIP tool opens it), with these rules:

1. **`manifest.json` is the first member** when a container is written, and
   is always present. It is found through the ZIP central directory, so after
   an `update` it may lie later in the file.
2. **Members that are read by byte range or are compressed already are
   stored** (ZIP method 0): Parquet, Arrow, images, models, audio, video,
   opaque blobs. A stored member is one contiguous byte range of the
   container, so a reader reads a table's footer and its column chunks in
   place, by `File.slice` in a browser or an HTTP range request, exactly as
   it would read the loose file.
3. **Text is deflated** (method 8): JSON, CSV, plain text. These are small
   and read whole.
4. Names are UTF-8 (flag bit 11), relative, `/`-separated, without `..`;
   they may hold folders (`analysis/heat.json`). A loose file packed keeps
   its own name, so unpacking gives back the same files.
5. Members larger than 4 GiB, or containers of more than 65,535 members, use
   ZIP64 as usual. Writers put no data descriptors after members.

The members the converters write today, in this order:

| Role | Member | Stored |
|---|---|---|
| `table` | `<match>.parquet` | yes |
| `match` | `<match>.match.json` | no (deflated) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<match>.<role>.parquet` | yes |

The table comes right after the manifest, so the reader's first read of the
file's start covers the manifest and the table's local header together.

### The manifest

```json
{
 "format": "3dheat",
 "format_version": "1.0",
 "game": "warthunder",
 "source": "client replay",
 "converter": { "name": "heat3d-wt-replay", "version": "0.2.0" },
 "match": "<map>_RB_<date>_<session>",
 "map": "<map>",
 "mode": "RB ground",
 "started": "2026-01-01T12:00:00+00:00",
 "created": "2026-01-01T13:00:00.000Z",
 "roles": { "table": "<match>.parquet", "match": "<match>.match.json", "flight": "<match>.flight.parquet" },
 "members": [
  {
   "name": "<match>.parquet",
   "role": "table",
   "media_type": "application/vnd.apache.parquet",
   "compression": "stored",
   "bytes": 1738575,
   "rows": 38105,
   "sha256": "<64 hex digits>",
   "schema": { "id": "heat3d-table", "version": "1" }
  }
 ]
}
```

| Field | Meaning |
|---|---|
| `format` | always `3dheat` |
| `format_version` | `major.minor` (below) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | what the match is and what made it; `null` where unknown |
| `created`, `updated` | when written, when last updated |
| `roles` | each role to its first member's name: a quick index |
| `members` | every member except the manifest: the full list, and the one a reader trusts |
| `matches` | optional: the matches of a container holding several (below) |
| `references` | optional: files the container needs but does not hold |
| `extensions` | optional: a converter's own metadata |

Each member:

| Field | Meaning |
|---|---|
| `name` | its path in the container |
| `role` | what it is for (below) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` or `deflate` |
| `bytes` | its size, uncompressed |
| `sha256` | of its bytes, uncompressed |
| `rows` | a table's row count |
| `schema` | the convention it follows, `{ "id", "version" }`: a document's own `format` and `version` (`heat3d-wt-replay-match` 2), `heat3d-table` for a table the viewer reads by its `heat3d` footer, `heat3d-acmi-table` for the Tacview tool's |
| `match` | in a container of several matches, the `matches[].id` it belongs to |

### Made to grow

The format is meant to carry far richer replays than today's without
breaking what reads it now:

- **Versioning.** `format_version` is `major.minor`. A reader reads every
  minor version of its major and ignores every field it does not know. The
  minor goes up when something is added; the major only when the layout
  changes so that an older reader would read it wrongly (a member no longer
  stored, the manifest moved out of the archive). Each member's own
  convention is versioned apart, in its `schema`, so a new table layout or
  a new document version needs no new container version. The first
  containers written said `"version": 1` instead; readers take that as 1.0.
- **Roles are open.** A role is any string. Readers use the roles they know
  and keep the rest: an unknown role is listed, never rejected, and `update`
  and `repack` carry it on untouched. A role may have many members: several
  tables (per-unit tracks, telemetry at other rates), events, voice, video
  sync, level references, figure overrides, analysis results. Names may
  hold folders.
- **Any media.** A member may be anything with a media type: Parquet, JSON,
  Arrow, PNG or JPEG thumbnails, glTF models, audio, raw blobs.
- **Several matches.** A session or a tournament may go in one container:
  `matches` lists them (`{ "id", "map", "mode", "started", ... }`) and each
  member names its `match`. The viewer loads every member of role `table`.
- **References.** Files a container needs but does not hold, a level for
  one, are listed in `references` by name and sha256
  (`{ "kind": "level", "name": "...", "sha256": "..." }`), so the right file
  is found and checked without copying it into every match.
- **Extensions.** `extensions` holds a converter's own metadata under its
  own key, `"<vendor>/<name>": { ... }`, so two converters never collide and
  nothing needs adding to the shared fields.
- **Updating in place.** `update` adds or replaces members without rewriting
  the big stored tables: the new members and a new manifest are appended
  after the container's end, followed by a new central directory. What was
  replaced remains as unreferenced bytes until `repack`. Every member and
  every manifest field, known or not, is kept. An update that fails is cut
  back to the container as it was.

The viewer's tests hold it to this: a container of format 1.7 with an unknown
role, a member field, an extension and an audio member in a folder loads,
and survives an update and a repack with all of it intact; a container of
major 2 is refused.

## Writers

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (write, read, verify, update, repack), used by the pack tool and the
  Tacview tool.
- Python: `container.py`, about 140 lines on the standard `zipfile`, the
  same file in each converter (`heat3d_ext_warthunder/container.py`,
  `heat3d_cs2/container.py`), so no converter depends on another. A new
  converter copies it.
- The viewer reads with
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
