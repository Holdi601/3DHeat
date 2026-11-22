---
title: The Library
parent: "Reference"
nav_order: 21
---

# The Library

The 3DHeat Library keeps your replays, Tacview recordings, demos, converted matches, extracted levels, model packs and Watcher sessions in one place. You manage them the way a photo library manages photos: you add the folders where they are, and the Library shows them as a grid of pictures. You can filter, rate, tag and collect them, convert many at once, and open one match or a whole collection in 3DHeat.

It is part of the desktop app ([The native app](native-app.md)). Open it with the **Library** button at the top of the side panel, or start it in a window of its own:

```
3dheat-app --library
```

The installer adds a Start menu entry, **3DHeat Library**, on Windows. The Debian package adds a desktop entry on Linux (Wayland).

## Everything stays on this computer

- The catalogue is one SQLite file in the app's data folder: `%LOCALAPPDATA%\3DHeat\library\library.sqlite` on Windows, `~/.local/share/3dheat/library/library.sqlite` on Linux. Nothing in it is uploaded.
- Paths and player names from the catalogue never go into shared session files or usage statistics. The statistics count which Library buttons are used, never what they were used on.
- The catalogue is served only to the app's own window, on its loopback server, with a key only that window knows. A multiplayer session's members never reach it.
- Your files stay where they are. The Library only reads them, unless you choose **Move into the library folder**.

## Adding folders

Press **Add a folder** and type or browse to a folder. Everything the Library knows inside it is found, in every subfolder:

| What | Files |
|---|---|
| Replays and demos (converted before viewing) | War Thunder `.wrpl`, Counter-Strike 2 and Dota 2 `.dem`, Rainbow Six Siege `.rec`, World of Warships `.wowsreplay`, World of Tanks `.wotreplay`, Unreal Engine `.replay` (Squad), League of Legends `.rofl` |
| Recordings the viewer reads as they are | Tacview `.acmi`, `.txt.acmi`, `.zip.acmi` |
| Matches | `.3dheat`, Parquet tables (with their side tables beside them), CSV and TSV tables with positions |
| Watcher sessions | a folder with `meta.json` and `heat.parquet` or `events.jsonl` |
| Levels | `.glb` levels and courses, with the picture beside them where the extractor wrote one |
| Model and figure packs | each folder in `model-packs\` or `figure-packs\` is one pack; `.h3dcars` |

The dialog also lists folders found on this computer that are worth adding: the levels folder, the converted folder, the Watcher's sessions, Tacview's recordings, and the replay folders of games in your Steam libraries.

A **watched** folder is looked at again every few minutes (Settings), so new replays appear by themselves. Press ⟳ next to a folder to look at it now.

**Drives that are not there.** An unplugged drive or a NAS that is asleep shows its folder as *offline*. Nothing under it changes: its items keep their ratings, tags and notes, and come back when the drive does. A file that was deleted or moved shows as *missing*, with everything you set on it kept. The **Only missing files** filter lists them.

## What the Library reads

The Library reads what each file says about its match without converting it:

| Format | Read |
|---|---|
| `.3dheat` | the manifest (game, map, mode, date, converter and its version) and the match summary (length, players, sides, winner, a heat grid for the picture) |
| Parquet | the `heat3d` reading instructions, the rows, and the match document beside it (`<match>.match.json`: map, players, sides, score, rounds, the demo it was made from); the picture is drawn from the positions |
| Tacview ACMI | the header at once (title, source, recording time, the theatre from the reference point); the length, the pilots, the sides and a picture of the tracks in the background |
| Counter-Strike 2 and Dota 2 demos | the file header (map, server, game, build) and the file info (length; for Dota 2 the match, the winner and the players) |
| Watcher sessions | `meta.json` (game, track, start, length) |
| Levels | the game from its folder, the extractor and game build from the levels index (`.3dheat-index.json`), its picture |

Replay formats that only their own converter reads (War Thunder, Rainbow Six Siege, World of Warships, World of Tanks, Squad) are listed with their name, size and the date in their file name. When the installed converter offers it (`info --json`, below), the Library asks it for more.

Every file gets a quick fingerprint at once: SHA-256 over its size and its first and last 64 KiB. The full SHA-256 is worked out in the background, a few files at a time, while no scan runs. Files on network paths are not read whole unless you allow it in Settings.

### The pictures

A match's thumbnail is a small heat map of where the action was, drawn from its summary's grid or from a sample of its positions. When the level it was played on has a map picture with known coordinates (War Thunder's levels do), the heat is drawn over it. A level's thumbnail is its own picture. Items without a picture show their game's mark. These marks are plain monograms, not the games' logos.

## Finding things

- **Search** finds names, maps, games, modes, players, tags and notes, with word prefixes (`dus` finds `de_dust2`).
- **Filters** on the left: game, map, kind, converted, mode, winner, year, tags, players, converter version, file type, a date range, rating and picks, and only items with copies. Each value shows how many items it has. The count is taken over the other filters, so ticking a second game adds to the first.
- **Sort** by date played, date added, name, map, game, length, players, file size or rating.
- **Grid or list**. The slider sets the size of the pictures.

The grid draws only what is in sight and loads its items 200 at a time, so a library of 100,000 items scrolls like one of 100.

## Rating, flags, tags, notes, collections

| | |
|---|---|
| Rating | 0 to 5 stars: the keys `0`-`5`, or the stars in the details |
| Flags | **Pick** (`P`), **Reject** (`X`), none (`U`) |
| Tags | any words, typed in the details (commas between several), for one item or the whole selection |
| Note | free text per item, searchable |
| Collections | **made by hand**: `+` makes one from the selection, and `+` on a collection adds the selection to it. **Smart**: **Save the filter as a smart collection** keeps the current filter and search, and the collection fills itself |

Selecting works as in a photo library: click, `Ctrl`+click to add, `Shift`+click for a run, `Ctrl+A` for everything the filter shows. The arrow keys move, `Enter` opens, `G` and `L` switch between grid and list, `I` shows or hides the details, `Ctrl+F` searches, and `Esc` goes back to the viewer.

**Duplicates** lists the groups of copies (the same fingerprint), largest first, with the space they take. *Identical* means their full hashes agree. Nothing is deleted there.

## Converting

Select replays and press **Convert**. The Library runs the converter the Extractors manager installed for their format, as a separate program, one job per replay, in a queue:

- Jobs run at below-normal priority, several at once: half the cores by default, and never more than one per 4 GB of memory (Settings).
- **Queue** shows what runs (with progress when the converter reports it), what waits and what failed. You can pause the queue (running jobs finish, no new ones start), cancel a job, retry a failed one, and read each job's log.
- A failed job says why in words, and what to do about it:
  - **The converter X is not installed**, with a button that opens the Extractors panel;
  - **Needs the Oodle library from your own game install**: point the converter at it in the Extractors panel (nothing is downloaded);
  - **The converter did not find the game's install**: set the game's folder there.
- A converter writes into a staging folder of its own job. Only when it ends well are its files moved into place: `<converted>\<game>\...`, one match a file. The converted folder is set in Settings; it defaults to `converted` beside the levels folder (`HEAT3D_LEVELS`), else `converted` in the app's data folder.
- **The newest converter's output wins.** Converting a replay again replaces its earlier output. When a converter is updated, every match it made with an older version is marked **Outdated**, and so is its replay. The status line counts them. Select them (the *Converted: Outdated* filter) and press **Convert** to make them again.

The Library links each converted match to the replay it was made from: by the demo its match document names, else by the replay's name. A replay then shows **Converted**, **Not converted**, **Outdated** or **Failed**, and opens as its newest match.

Tacview recordings, `.3dheat` files, tables and Watcher sessions open as they are: there is nothing to convert.

## Opening in 3DHeat

**Open in 3DHeat** (or a double click, or `Enter`) opens the selection:

| | |
|---|---|
| Open in the view | every file in one load, as if picked in the Source panel: the viewer's mass load of many matches |
| Open in the mass analysis | the files go to the mass analysis window |
| Open and share in a session | opened, and the session panel shown, where the host shares the loaded data with the session's members (with their consent tick, as always) |
| Move into the library folder | moves the selected files (with a match's side files) into `<library folder>\<game>\`; the catalogue follows them |

Over the viewer, the Library closes and the files load in that window. In the Library's own window, they open in a new viewer window. A replay opens as its newest converted match, and the Library says how many were not converted yet.

The app hands the files to the native core by their path, so the core reads them in place ([The native app](native-app.md)).

A session saved afterwards (**Save session**) is linked to the Library items it was made from. The details of each item list the sessions saved from it.

## Maps and levels

The **Maps and levels** tab lists, per game:

- the extracted levels and model packs, with size, extractor, game build and fingerprint, and how many matches are played on each (a click shows them);
- the maps that matches are played on but that have no level yet, each with **Extract missing level**;
- what each installed map extractor says about your own game install: **N new maps available**, and how many are changed or outdated (after a DLC or a game update). **Extract all** extracts them one after the other, and each one has its own **Extract** button. **Check** asks the extractor again.

The map status and the extracts are the Extractors manager's ([Extractors](extractors.md), the same as its panel shows): the manager runs the extractor, map by map, and the Library shows its progress and looks at the levels folder again when it is done. Where no manager is there (a development setup), the Library runs the extractor's `status --json` and `extract` itself, in its queue.

## The extractor contract

The Library contains no converter or extractor code. It runs the programs the Extractors manager installed, by these verbs:

| Verb | What it does |
|---|---|
| `convert <input> -o <out>` | one replay into one match file under `<out>`; progress as `NN%`, `n/m` or `{"progress": 0.4}` lines, if any. The readers of War Thunder, World of Warships, World of Tanks, Squad and Rainbow Six Siege replays take the replay without the verb (`<input> -o <out>`), as their own command lines do |
| `info --json <input>` | the replay's metadata (optional; not asked yet) |
| `status --json` | the maps of the user's install: `{"game": "...", "maps": [{"id": "...", "name": "...", "state": "new" \| "changed" \| "outdated" \| "current"}]}` |
| `extract <map>... -o <levels>` | those maps into levels |

The environment variables `HEAT3D_LEVELS` (the levels folder) and `HEAT3D_MANAGED=1` are set for each run. What is installed is read from the manager's folders, as the manager reads it: `<data>\extractors\<id>\current` names the version, and `<data>\extractors\<id>\<version>\<id>\<id>.exe` is the program. A list, `<data>\extractors\installed.json` (`HEAT3D_EXTRACTORS` names another one), may add or override entries, for a development setup or the tests:

```json
{ "extractors": [
  { "id": "heat3d-warthunder", "version": "0.2.4", "exe": "heat3d-warthunder/heat3d-warthunder.exe",
    "games": ["warthunder"], "converts": ["wrpl"], "produces": ["heat3d-wt-replay"], "maps": true }
] }
```

`exe` is relative to the list's folder. `command` (a list) may stand in its place. `convert`, `info`, `status` and `extract` may give an extractor's own argument lists, with `{input}`, `{out}`, `{maps}` and `{levels}`. `produces` names the converter a match's manifest records, which is how outputs are matched to the installed version. The known extractors' games, formats and outputs are built in. Tools that stay local by design are never listed.

## Settings

The folders for converted matches, the library folder and the levels folder; conversions at once; how often watched folders are looked at; and whether files on network drives are hashed whole.

## Measured

On the development PC (16 cores, NVMe, the machine busy with other work), on a data folder of about 2,200 items (levels, model packs, Tacview recordings, `.3dheat` matches, tables, demos and replays):

| | |
|---|---|
| First scan, cold | about 9 s for the three folders (some 8,000 files walked): every item's metadata, fingerprint and picture |
| First scan, files in the system's cache | 2.3 s for 2,254 items; a folder with nothing changed opens no file |
| Background pass | 3 min 45 s: the full SHA-256 of every file (about 150 GB), every recording's tracks and length, the pictures of tables |
| The same folders on a NAS (SMB, 1 Gbit/s) | 2,694 items in 11 min, the NAS and the PC busy with other work: every file's header and fingerprint read over the network |
| 100,000 items in the catalogue (test, debug build) | a filtered page in 70 to 85 ms, all facets in 0.5 to 0.8 s, search in about 20 ms |

## For developers

The Library is the crate `native/crates/library` (`heat3d-library`). The app's window server mounts it at `/__heat3d/library` (`native/crates/server/src/library.rs`):

| Module | What it is |
|---|---|
| `kinds` | what a file is, by its name |
| `meta` | the metadata readers (open formats only), the quick and full fingerprints |
| `scan` | the walk, the fast pass (on every core, written in batches) and the deep pass |
| `thumb` | the pictures (PNG) |
| `db` | the SQLite catalogue: schema, filters, facets, search (FTS5), collections, duplicates, links |
| `extractors`, `jobs` | the installed converters, the queue and its workers |
| `api` | the JSON interface |

The page side is `src/library/`.

```
cargo test -p heat3d-library                                  # the unit tests, and the synthetic library end to end
3dheat library scan <folder>... [--data DIR] [--deep]         # add folders, scan them now, print the numbers
3dheat library serve --port 5341 [--data DIR]                 # the API on 127.0.0.1, for the development server
HEAT3D_LIBRARY_URL=http://127.0.0.1:5341 npm run dev          # the viewer, with /__heat3d/library proxied to it
node tools/smoke-library.mjs                                  # the UI smoke test on a synthetic library
```

The tests and the smoke test make their library from nothing (`heat3d_library::testkit`, `fake-converter`): no real replays are in the repository.
