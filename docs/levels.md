---
title: Levels and background geometry
nav_order: 13
has_children: true
---

# Levels and background geometry

A level is the 3D place where the game happened - a map, a town, a track. Put one behind your data and you can see *where* the heat is. The **Map and background** panel (see [Glossary](glossary.md) for "level") gives you three kinds of context:

- a **map image**, georeferenced by two anchors - see [Map images](map-images.md);
- a **3D level** - `.glb`, `.gltf`, `.obj`, `.stl` or `.ply` - split into ground, structures and water and simplified on import - see [3D levels](model-levels.md) and [Level appearance](level-appearance.md).
- a **world backdrop** - for a recording that says where on the earth it is (a Tacview ACMI file), the real terrain, roads, water, airfields and buildings, downloaded from open data - see [World backdrop](world-backdrop.md).

With nothing loaded, the scene is dark with a grid and coloured axes (**Grid** and **Axes** in [Camera & scene](camera.md)), and the panel says *Nothing loaded - the scene shows a grid and axes. Add a map image or a level mesh to give the heat context.*

The level is shared by all three tabs: a course loaded in the Race analysis tab is the same level the heatmap shows.

![The Map and background panel with a level loaded: Map image and 3D model buttons, Theatre, Opacity, Brightness, Save to library and the Library list](assets/img/en/level-panel.webp)

## Put a level behind your data

1. Load your data first ([Getting data in](getting-data-in.md)), so the level is fitted to it.
2. Open **Map and background** in the sidebar.
3. Pick the **Game**, then the **Map**, and press **Show this map**. Only maps the map tools have made from your games are listed (the levels folder, see below), each by its name and, where the tool left one, with a picture of it. Data on a map that is there gets it by itself.
   Without a map tool's map, press **Map image…** for a picture or **3D model…** for a 3D level, and pick the file. For a real-world recording, use **World backdrop** or **Theatre** instead.
4. Wait for the progress line to finish. A big model is simplified first (see **Simplification target** below).
5. Press **F** in the view to frame everything. Use **Opacity** and **Brightness** until the heat stands out from the level.
6. Press **Save to library** if you will use the level again ([Level library](level-library.md)).

## Unit models

Under the maps, **Unit models** says how the units of the loaded data are drawn, chosen for each game on its own:

- **<Game> models (its own)**, the default: the game's own model pack, made from your install by its tool. A vehicle the pack lacks borrows another game's model of the same vehicle, else gets a built-in figure.
- **Simple built-in figures**: no game's models at all.
- **<Other game> models**: that game's models wherever it has the same or a similar vehicle (matched by the real vehicle's name, an aircraft only for an aircraft), for example War Thunder's models on a DCS recording. The rest keep their usual look.

The choice is kept in this browser and applies at once. A choice for one game never changes another game's recordings.

## What a level does for the heat

- It **occludes**: datapoints behind it are dimmed per surface, and datapoints behind the terrain are hidden ([Depth and culling](depth-and-culling.md)). With no level, there is no occlusion.
- It is **cut** by the [Slice](slice.md) and, with *Cut the level too*, by [distance culling](depth-and-culling.md#distance-culling), together with the heat.
- It is the only thing [depth of field](camera.md#depth-of-field) blurs, besides the grid and the boxes.
- A 3D level **widens the camera's far plane** when it is larger than the data: near and far are calibrated from the dataset, and an exported map several kilometres across would otherwise sit entirely behind the far plane and leave an empty view. The far plane becomes 3 × the level's horizontal extent when that is larger, and the fly speed is raised to at least extent / 12. The near plane stays where it is: the reverse-Z depth buffer needs no ratio between the two (on the classic fallback the near plane actually used is kept at far / 100,000 or more, [Camera](camera.md#near-and-far)). It is only ever widened, never narrowed.

## The panel, top to bottom

| Part | Details |
|---|---|
| **Map image…**, **3D model…** | Load one; it replaces the current level. |
| **World backdrop**, **Forget map tiles** | Only for a dataset with a geographic reference: build the real place under it as the level, or delete the downloaded tiles. [World backdrop](world-backdrop.md) |
| **Simplification target** | The triangle budget for the next model import: *Full - no simplification* (default), *High - 8M*, *Medium - 3M*, *Low - 800k*, *Silhouette - 100k*. [3D levels](model-levels.md#simplification) |
| Progress and **Cancel** | While decoding or importing. |
| Import note | Triangles before and after, the ground / structures / water split, the level of detail used. |
| Name and size | `width×height px · x × z m/px` for an image, `N triangles (from M)` for a model. |
| **Opacity**, **Brightness** | Both kinds. |
| Image controls | **Desaturate**, **Flip north/south**, **Placement** (two anchors), **Fit to data bounds**, **Elevation**. [Map images](map-images.md) |
| Model controls | Ground relief, water, ground triangles, wireframe, texture, captured colour, structures, part classification. [Level appearance](level-appearance.md) |
| **Save to library**, **Remove** | [Level library](level-library.md); Remove unloads the level. |
| **Library** | Levels stored in this browser. [Level library](level-library.md) |

## Pages in this section

- [Map images](map-images.md)
- [3D levels](model-levels.md) - formats, parts, classification, simplification, textures
- [Level appearance](level-appearance.md) - every control for a 3D level
- [Level library](level-library.md)
- [World backdrop](world-backdrop.md) - the real world under a recording, from open data

How to get levels out of games and engines is the business of the separate exporter tools (see the repository [README](https://github.com/Holdi601/3DHeat/blob/main/README.md)); the contract they write to is summarised in [3D levels](model-levels.md#the-exporter-contract).
