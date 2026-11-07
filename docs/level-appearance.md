---
title: Level appearance
parent: Levels and background geometry
nav_order: 3
---

# Level appearance

With a [3D level](model-levels.md) loaded, the Background / level panel shows these controls. Defaults are those a freshly imported level gets ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Changing them only redraws the scene; the heat accumulation is kept.

## The whole level

| Control | Default | Range | Meaning |
|---|---|---|---|
| **Opacity** | 100% | 0-100% | Below 100% the level is blended and writes no depth, so it no longer [occludes](depth-and-culling.md) the heat. |
| **Brightness** | 0.9 | 0-2 (jog 64) | |

The level is drawn desaturated - grey ground, a tinted shell - so the heat is the only saturated thing on screen. Unlike a [map image](map-images.md), a 3D level has no Desaturate slider.

## Ground relief

Terrain normals nearly all point up, so a light alone gives a whole landscape one flat grey and a valley reads like a plateau. Three cues, each answering a different failure:

| Control | Default | Meaning |
|---|---|---|
| **Contour spacing** | from the ground's height range | Height between contour lines, logarithmic from 1/4000 to 1/2 of the level's height range; the bottom of the track is *off*. The default is 1/40 of the ground's height range rounded to a 1/2/5 step - 10 m lines suit a hillside and are useless on a quarry floor. Every 5th line is drawn stronger. Contours are drawn in screen space, so they stay a pixel wide at any zoom, and they are the only cue that survives ground too shallow to shade at all. |
| **Contour strength** | 35% | 0-100% |
| **Slope shading** | 55% | Darkens by steepness, so banks and cliffs read from any camera angle - unlike a light, which flattens whenever you face it. |
| **Elevation ramp** | 50% | Low ground darker, high ground lighter, across the ground's height range: the large-scale shape. |

The section's header shows the contour state: *every N m*, the contour spacing, or *no contours* when the spacing is off.

## Ground surface

| Control | Default | Shown when | Meaning |
|---|---|---|---|
| **Water** | on | the level has water | Lakes, rivers and the sea, drawn flat in a pale blue-grey: none of the terrain cues apply to a surface that is level by definition. |
| **Water opacity** | 60% | Water is on | The coastline and the ground under the shallows show through translucent water. |
| **Ground triangles** | 30% (0 for a textured level) | always | The terrain's own edges drawn over the shaded surface, fading out between 6% and 25% of the level's width from the camera. Shows how coarsely the ground was sampled and gives a slope something to judge distance on. Built on first use, which takes a moment on a large level. |
| **Ground as wireframe only** | off | always | Replaces the terrain surface with its edges. Fully schematic - it also gives up the shading, the contours and the occlusion, so *Ground triangles* is usually the better choice. |
| **Ground texture** | on | the level has textures | Draws the ground in the textures the file carries (asphalt, verge, grass). The mesh lighting is applied gently on top, because the texture already carries its own fine relief. **Brightness** is the way to quieten it under the heat; Desaturate belongs to map images. |
| **Captured colour** | off | the level has vertex colours | Shades the ground with the colour a scan captured instead of grey - a reconstructed road is otherwise indistinguishable from the verge. Engine exports carry none; when absent the panel says *This level carries no colour.* |

## Structures

The **Structures** header shows the structure triangle count; the hint below says how they are drawn (*drawn solid in their own textures* or *drawn as a transparent shell so you can see the heat inside them*) and how many parts are structures.

| Control | Default | Meaning |
|---|---|---|
| **Structure texture** | on when the structures carry textures | Draw structures solid, in their own textures. Switching on sets face opacity to 100% and turns the edges off; switching off returns to the tinted see-through shell at 25%. A textured structure is lit from the side the camera sees, because a sign is two faces back to back and which one wins the depth test is down to rounding. |
| **Wireframe edges** | on; off above 300,000 structure triangles or when textured | Deduplicated edges of the structures, one line per edge. |
| **Edge opacity** | 50% | |
| **Shell faces** | on | A faint surface with a bright Fresnel rim, so a building reads as a volume rather than a cage or a fog bank. |
| **Face opacity** | 25% (35% above 300,000 structure triangles, 100% textured) | 0-60% on the track, up to 100% with the handle. Keep it low: solid structures hide the data inside them. |
| **Sharp edges** | on (off when textured) | Shades each triangle by its own normal, computed in the fragment shader from screen-space derivatives. Exported levels are welded and carry averaged normals, which round every box corner into "melted foil"; splitting every vertex to fix it would multiply the vertex buffer. Turn it off for a level whose curved surfaces matter more than its corners. |
| **Structure tint** | Cyan | A colour picker and the presets **Cyan**, **Amber**, **Violet**, **White**. |
| **Show part classification (N)** | | Every part, its class and the reason; see [3D levels](model-levels.md#ground-structures-and-water). |

## Cutting the level

The [Slice](slice.md) and, with *Cut the level too*, [distance culling](depth-and-culling.md#distance-culling) cut the ground, structures and water at the same planes as the heat.
