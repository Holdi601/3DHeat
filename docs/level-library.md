---
title: Level library
parent: Levels and background geometry
nav_order: 4
---

# Level library

The library keeps your levels in this browser so you do not have to load and simplify them again. **Clearing the site's data in the browser deletes the library, and there is no export.** Keep your original files.

Processing a level - parse, classify, weld, decimate, pack textures - is slow, and the result is the same every time. The **Library** at the bottom of the Background / level panel keeps processed levels in this browser, so a decimated mesh is never rebuilt twice ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Save and reload a level

1. Load a map image or a 3D model and check it looks right.
2. Press **Save to library**. The panel says *Saved. It will load instantly next time.*
3. Next time, open the **Library** list and press ▸ on the level.
4. Press ✕ to delete an entry you no longer need.

## Using it

| Control | Effect |
|---|---|
| **Save to library** | Stores the current level. A map image is stored as a PNG with its two anchors; a model as its processed buffers. The panel says *Saved. It will load instantly next time.* |
| Library list | One row per stored level: name (with its stored size on hover), triangles for a model or width in pixels for an image. |
| ▸ (*Load*) | Loads the entry as the current level. |
| ✕ (*Delete*) | Removes the entry. |
| Usage line | `Using X of Y.` - the browser's storage estimate for this site. |

With nothing stored the list says *Empty. Load a map or model, then "Save to library".*

Some levels go to the library by themselves when loaded, so data on their map
finds them later: the Dota 2 map from the Dota tool, Siege maps from the R6
Maps tool, and Battlefield 4 and Battlefield 1 levels from the Battlefield
tool (their part names end in ` @battlefield-4/<Level>`). For a table whose
`map` column names such a level (`MP_Prison`), the panel shows a button for it
and loads it by itself when no level is loaded yet; a name both games use
(`MP_Naval`) shows both and loads neither by itself.

A Gunner, HEAT, PC! mission (from the Watcher's recorder mod) names its map,
but no extractor writes that game's maps yet. Until a level of that name is in
the levels folder, the viewer traces a ground from where the mission's ground
units drove. The ground follows the heights of their tracks, is filled between
them, and is flat when there are too few samples. The chip over the view says
*ground traced from the units' tracks*. A level you load replaces it.

## What is stored

| Kind | Stored | Not stored |
|---|---|---|
| Map image | The image (PNG), its size, its anchors | Elevation, flip, opacity, brightness, desaturate - restored to the defaults (elevation = the current dataset's lowest Y, flip on) |
| 3D level | Vertices, vertex colours, texture coordinates, their tiles and the texture atlas, ground / structure / water triangles, structure edges, triangle counts | Part names and classification reasons, and every appearance setting - restored to the defaults of a fresh import |

A model loaded from the library has no part list, and its bounds and ground height band are recomputed from its vertices.

## Where it lives

In the browser's IndexedDB, database `3dheat`, object store `levels`, for the page's origin (the address in the browser's address bar). It is local to that browser profile: another browser, another profile or another address (for example `localhost` instead of `127.0.0.1`) sees a different, empty library. Clearing the site's data in the browser deletes it. Entries saved by older versions without structures, colours or water still load.

## The levels folder

Run from a checkout (the dev or preview server), the panel also lists everything the map tools wrote into your levels folder: `HEAT3D_LEVELS`, or the `levels` entry of the git-ignored `tools/local-data.json`, or else the folder the [extractors](extractors.md) write into by default when it exists (`%LOCALAPPDATA%\3DHeat\levels`, Linux `${XDG_DATA_HOME:-~/.local/share}/3dheat/levels`). Without a server, **Pick folder…** indexes a folder you choose. Levels and race courses are grouped by game; a click loads one, with its game-mode layouts when a `<Level>.layouts.json` sits beside it (marked ◆). Data whose `map` column names a level in the folder gets that level by itself while no level is loaded; a name two games share is left for you to pick.

Every file in the folder gets a fingerprint: the SHA-256 of its bytes, with the tool and version that wrote it and the game's build where the file says them. The server hashes the files in the background, one at a time, and keeps the hashes in the folder's `.3dheat-index.json`, so a file is hashed again only when it changes. Two copies with the same fingerprint are the same extract ([`catalogIndex.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/catalogIndex.ts)).
