---
title: Map images
parent: Levels and background geometry
nav_order: 1
---

# Map images

A map image is a flat picture - a minimap, a satellite photo, a floor plan - laid under your data so you can see where the heat sits. You tell the viewer where the picture belongs by pinning two points on it to two places in the world (the "anchors").

## Load and place a map image

1. Load your data first ([Getting data in](getting-data-in.md)).
2. In **Background / level**, press **Map image…** and pick the picture. It is stretched over the data's area.
3. Press **Fit to data bounds** if the picture was moved. Anchor 1 goes to the picture's top-left corner, anchor 2 to its bottom-right corner, at the data's edges.
4. If the heat does not line up with the picture, pick two landmarks that are far apart (for example two opposite corners of a building or two crossroads). Read each one's pixel on the picture and its world position (hover with the [ruler](measure.md) to read **X** and **Z**).
5. Type them into **Placement**: for **Anchor 1** the landmark's **px**, **py**, **world X**, **world Z**; the same for **Anchor 2**.
6. Check: a track or hotspot that you know sits on a road should now sit on that road. Adjust the numbers until it does.

![The Placement section with two anchors and heat drawn on a map picture](assets/img/en/map-images-placement.webp)

The two landmarks must differ in both pixel columns and pixel rows, or the panel says *The two anchors share a pixel row or column*.

## Loading

Any image format the browser can decode. An image whose longer edge is above **8192 px** is downscaled to 8192 (the largest edge the GPU is asked to hold), and the panel says *Downscaled from W×H to w×h*.

On load the image is stretched over the dataset's X-Z bounds (or ±1000 units without a dataset), north up, at the dataset's lowest Y. The defaults are **Opacity** 100%, **Brightness** 0.7, **Desaturate** 100%, **Flip north/south** on: desaturated and dimmed, because the background's job is to let you locate a hotspot, not to compete with it.

## Controls

| Control | Default | Range | Meaning |
|---|---|---|---|
| **Opacity** | 100% | 0-100% | |
| **Brightness** | 0.7 | 0-2 (jog 64) | |
| **Desaturate** | 100% | 0-100% | Grey background, saturated heat. Colour in the map competes with colour in the data. |
| **Flip north/south** | on | | Which image row is the world's maximum Z. Toggling it with a dataset loaded also re-fits the anchors to the data bounds. |
| **Placement**: Anchor 1, Anchor 2 | the image corners on the data bounds | | Each anchor is a pixel on the image - **px** (from the left, 0 to the width) and **py** (from the top, 0 to the height) - and the world coordinate it sits at, **world X** and **world Z**. Scale and offset follow from the pair. |
| **Fit to data bounds** | | | Puts anchor 1 on the image's top-left corner and anchor 2 on its bottom-right, at the data's X-Z bounds. A starting point for exact placement. Needs a dataset. |
| **Elevation** | the dataset's lowest Y | data min Y - 500 to max Y + 500 (jog max Y + 100,000) | Height of the map plane. Put it just under the data so nothing is hidden by it. |

The name line shows `width×height px · x × z m/px`, the world size of one pixel along each axis.

## In the scene

The image is a single textured quad at the elevation. At full opacity it writes depth, so it takes part in [occlusion](depth-and-culling.md) as ground; below 100% opacity it is blended and writes no depth, so it occludes nothing. The [ruler](measure.md) measures on its plane. The [level library](level-library.md) stores an image level with its anchors.

## Dota 2 map

**Dota 2 map** beside **Map image…** fetches the drawing of the current Dota 2 map that [OpenDota](https://www.opendota.com) shows on its match pages, and places it under tables the [Watcher](https://github.com/Holdi601/3DHeat-Watcher) writes from Dota 2 replays ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). The image is fetched from opendota.com when the button is pressed and is not part of 3DHeat; the newest patch's drawing is taken from OpenDota's own list, and the 7.40 drawing when the list cannot be read.

| | |
|---|---|
| Source | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Placement | OpenDota's calibration: the image spans Dota world units -8192 to 8064 on both axes (128-unit cells 64 to 191), north at the top. With the replay table's axes (Z up, Y flipped) that is world X -8192 to 8064 and world Z -8064 to 8192. About 18 units a pixel. |
| Elevation | 0. Heroes stand at 0 to about 600. |
| Look | Brightness 0.8, desaturate 50%. |

Checked on a public match's replay of patch 7.40: every hero's track follows the drawn lanes, and the towers, barracks and ancients the replay places fall on the drawn bases. The **Top** view shows the map with north at the bottom of the screen, as it shows any Z-up table with Y flipped.

The drawing is OpenDota's, of Valve's map; Valve does not endorse 3DHeat.

### The 3D map

With Dota 2 installed, the Watcher's [`dota-map`](https://holdi601.github.io/3DHeat-Watcher/dota-map.html) command (`python -m heat3d_watch dota-map -o dota.glb`) makes the map in 3D from the game's own files: ground, cliffs, water, trees and buildings, in the replay tables' units and axes. Load the file once with **3D model…**: the viewer knows it by its parts (`ground:terrain`, `structure:tower`, `structure:ancient`, `structure:tree`; `isDotaLevel` in `dotaMap.ts`), puts it in the [level library](level-library.md) at once, replacing an older one, and says so. From then on **Dota 2 map** loads that 3D map from the library instead of fetching the drawing; with none in the library it fetches the drawing and says how to make the 3D map. The file comes from your own install and stays on your machine.

## For developers

### How the anchors place the image

From [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), with anchors *a* and *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pixel (0, 0) sits at  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Two anchors fix both scale and offset on each axis independently, so a map can be stretched differently on X and Z but not rotated. The anchors must differ in **both** pixel coordinates; when they share a row or a column no scale can be derived, the map is not drawn, and the panel says *The two anchors share a pixel row or column*.
