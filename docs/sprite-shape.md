---
title: Sprite shape
parent: Heat modes
nav_order: 2
---

# Sprite shape

Each row is drawn as a round sprite that always faces the camera. Its size and the profile from its centre to its rim - the **ramp** - decide whether a hotspot reads as a tight dot, a soft cloud, a disc or a ring. These controls are in the **Heat shape** and **Sprite pixel clamps** sections of the sidebar, and apply to [Heat](heat.md), [Difference](difference.md), [Team heat](team-heat.md) and, as the half-width of a line, [Line heat](line-heat.md).

Changing any of them restarts the accumulation (the field has to be redrawn with the new shape).

## Sprite radius

The sprite's radius in **world units** (labelled metres). Default 6, and on every load the horizontal extent of the data / 120 - large enough that neighbouring samples along a path merge into a band rather than reading as a hairline. Logarithmic slider 0.05-2000, drag handle up to 50,000.

Under a perspective projection the radius on screen shrinks with distance: in pixels it is `radius × P[1][1] / w × viewport height / 2`, where `w` is the point's view depth. Under the parallel projection it is the same everywhere, which is part of why the parallel view is the right one for comparing hotspots ([Camera](camera.md#projection)).

## Pixel clamps

**Sprite pixel clamps** (closed by default) bound the on-screen radius after the conversion above.

| Control | Default | Range (jog) | Why |
|---|---|---|---|
| **Min pixel radius** | 1 px | 0-16 (512) | Keeps distant data from vanishing below one pixel. |
| **Max pixel radius** | 96 px | 2-1024, logarithmic (8192) | The overdraw guard. A sprite covering N pixels costs N blend operations, so an unclamped radius close to the camera is what turns a fast frame into a slow one. Past the viewport height it stops clamping anything. |

## Centre and edge intensity

The heat a sprite adds at its exact centre (**Centre intensity**, default 1, 0-10, jog 1000) and at its rim (**Edge intensity**, default 0, -2-10, jog 1000). The ramp value *t* (1 at the centre, 0 at the rim, shaped by the falloff or the curve below) blends between them:

```
heat added = mix(edge, centre, t) × sample weight × sign × fade × visibility
```

A **negative edge intensity** makes the rim subtract, which carves a cool halo around each hot spot and sharpens clusters against each other. Visibility includes [occlusion](depth-and-culling.md) and the [slice](slice.md); fade is the [Lifetime](timeline.md#history) fade; sign is ±1 in [Difference](difference.md).

## Ramp shape: Falloff or Curve

**Ramp shape** switches between two ways of shaping *t* across the sprite. With *d* the distance from the centre (0) to the rim (1):

### Falloff

Shown when *Falloff* is selected (the default).

- **Falloff** (default 1.6, 0.1-8, jog 64): `t = (1 - d) ^ falloff`. 1 is a straight linear ramp; higher pulls the heat towards the centre and tightens the hotspot; below 1 flattens it into a disc.
- **Smooth ramp** (default on): applies a smoothstep S-curve to *t*, so the sprite fades in at its rim instead of ending on a visible edge.

### The curve editor

Shown when *Curve* is selected. A literal cross-section of a sprite: distance from the centre across (*centre* on the left, *rim* on the right), heat up. The curve is a piecewise cubic Bézier through control points, each with two handles.

| Action | Effect |
|---|---|
| Double-click on the graph | Adds a point at that distance (kept between 0.02 and 0.98), on the curve and with the curve's slope there, so adding it changes nothing until you drag it. |
| Drag a point | Moves it. Heights are kept between 0 and 1. |
| Drag a small circle | Bends the segment next to it (moves that handle). |
| Alt-click or right-click a point | Removes it. The two endpoints cannot be removed. |
| A preset button | Replaces the curve with the preset. |

The endpoints are fixed at the centre and the rim; their height is still yours. Handles are clamped horizontally to their own segment, so the curve is always a function of distance: dragging a handle far past the next point flattens against it instead of folding the curve back, which would make the result depend on which root a solver happened to find.

**Presets** ([`curve.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/curve.ts)):

| Preset | Shape | Use |
|---|---|---|
| **Linear** | Straight from 1 to 0 | Identical to *Falloff* 1 with *Smooth ramp* off. |
| **Smooth** | S-curve | The default curve; what *Smooth ramp* gives at falloff 1. |
| **Tight** | A steep core, a long faint skirt | Sparse data. |
| **Plateau** | Flat, then a fast roll-off | Reads as a disc rather than a blob. |
| **Ring** | 0.15 at the centre, 1 at 62% of the radius, 0 at the rim | A hollow sprite: shows where paths pass rather than where they stop. |
| **Shelf** | Two-stage falloff, 0.45 at 35% | Separates a dense core from its surroundings. |

**How it is drawn.** The curve is baked into a 256-entry table whenever it changes, uploaded as a 16-bit float texture, and sampled per fragment with linear filtering and a half-texel inset so both ends stay exact. Solving a Bézier for x needs iteration, which has no place in the program's hottest shader, and a table fetch is also cheaper than the `pow()` the falloff uses. 16-bit rather than 8-bit because 8 bits shows as banding once thousands of sprites have summed; 16-bit half float is filterable in core WebGL2 where 32-bit needs an extension.

## Flatten onto ground plane

**Flatten onto ground plane** (default off) ignores each row's height and draws all heat at one height - the lowest Y of the dataset - the classic 2D map heatmap. With it on, depth occlusion and *Hide behind terrain* are off (every point would sit exactly on the surface it is tested against), and the Depth section says so.
