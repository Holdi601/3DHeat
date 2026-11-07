---
title: Level library
parent: Levels and background geometry
nav_order: 4
---

# Level library

Processing a level - parse, classify, weld, decimate, pack textures - is slow, and the result is the same every time. The **Library** at the bottom of the Background / level panel keeps processed levels in this browser, so a decimated mesh is never rebuilt twice ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Using it

| Control | Effect |
|---|---|
| **Save to library** | Stores the current level. A map image is stored as a PNG with its two anchors; a model as its processed buffers. The panel says *Saved. It will load instantly next time.* |
| Library list | One row per stored level: name (with its stored size on hover), triangles for a model or width in pixels for an image. |
| ▸ (*Load*) | Loads the entry as the current level. |
| ✕ (*Delete*) | Removes the entry. |
| Usage line | `Using X of Y.` - the browser's storage estimate for this site. |

With nothing stored the list says *Empty. Load a map or model, then "Save to library".*

## What is stored

| Kind | Stored | Not stored |
|---|---|---|
| Map image | The image (PNG), its size, its anchors | Elevation, flip, opacity, brightness, desaturate - restored to the defaults (elevation = the current dataset's lowest Y, flip on) |
| 3D level | Vertices, vertex colours, texture coordinates, their tiles and the texture atlas, ground / structure / water triangles, structure edges, triangle counts | Part names and classification reasons, and every appearance setting - restored to the defaults of a fresh import |

A model loaded from the library has no part list, and its bounds and ground height band are recomputed from its vertices.

## Where it lives

In the browser's IndexedDB, database `3dheat`, object store `levels`, for the page's origin (`http://127.0.0.1:5273` with `start.bat`). It is local to that browser profile: another browser, another profile or another origin (for example `localhost` instead of `127.0.0.1`) sees a different, empty library. Clearing the site's data in the browser deletes it. Entries saved by older versions without structures, colours or water still load.
