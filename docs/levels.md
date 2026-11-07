---
title: Levels and background geometry
nav_order: 6
has_children: true
---

# Levels and background geometry

Heat means little without the place it happened in. The **Background / level** panel puts one of two kinds of context behind the data:

- a **map image**, georeferenced by two anchors - see [Map images](map-images.md);
- a **3D level** - `.glb`, `.gltf`, `.obj`, `.stl` or `.ply` - split into ground, structures and water and simplified on import - see [3D levels](model-levels.md) and [Level appearance](level-appearance.md).
- a **world backdrop** - for a recording that says where on the earth it is (a Tacview ACMI file), the real terrain, roads, water, airfields and buildings, downloaded from open data - see [World backdrop](world-backdrop.md).

With nothing loaded, the scene is dark with a grid and coloured axes (**Grid** and **Axes** in [Camera & scene](camera.md)), and the panel says *Nothing loaded - the scene shows a grid and axes. Add a map image or a level mesh to give the heat context.*

The level is shared by all three tabs: a course loaded in the Race analysis tab is the same level the heatmap shows.

## What a level does for the heat

- It **occludes**: datapoints behind it are dimmed per surface, and datapoints behind the terrain are hidden ([Depth and culling](depth-and-culling.md)). With no level, there is no occlusion.
- It is **cut** by the [Slice](slice.md) and, with *Cut the level too*, by [distance culling](depth-and-culling.md#distance-culling), together with the heat.
- It is the only thing [depth of field](camera.md#depth-of-field) blurs, besides the grid and the boxes.
- A 3D level **widens the camera's far plane** when it is larger than the data: near and far are calibrated from the dataset, and an exported map several kilometres across would otherwise sit entirely behind the far plane and leave an empty view. The far plane becomes 3 × the level's horizontal extent when that is larger, the near plane moves with it (at least far / 100,000) to keep the depth precision occlusion depends on, and the fly speed is raised to at least extent / 12. It is only ever widened, never narrowed.

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
