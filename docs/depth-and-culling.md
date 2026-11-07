---
title: Depth and culling
parent: Heat modes
nav_order: 4
---

# Depth and culling

Without depth, a heatmap over a 3D level is a flat overlay: everything the dataset contains glows through every wall at full strength, the depth cues the level provides are cancelled out, and a hotspot inside a building looks the same as one on its roof. The **Depth** section makes the level hide what is behind it; **Distance culling** restricts the heat to a shell or slab around the camera; the [Slice](slice.md) cuts a slab out of the world. All three apply to the heat modes and change which rows contribute, so changing them restarts the accumulation.

## Depth

Both controls need a [level](levels.md) - a map image or a 3D model. With no level loaded there is nothing to be behind, and they do nothing. Both are switched off while [Flatten onto ground plane](sprite-shape.md#flatten-onto-ground-plane) is on.

### Hide behind terrain

**Hide behind terrain** (default on): a datapoint whose nearest surface towards the camera is the *ground* (not a structure) is dropped outright, not dimmed.

Terrain and walls are opaque in different ways. You look *through* a wall on purpose, to see which floor the traffic was on; you never want to look through a hill, because behind one is the far side of the map - which on a map kilometres across is most of the data, and sums along the horizon into a band brighter than anything in the foreground. One dimmer cannot serve both, so the terrain gets a cutoff and walls keep the dimmer below.

How: the structures are drawn into a depth texture of their own. A fragment that is behind the scene's depth but *not* behind the structures' depth is behind the ground, and is discarded. It costs one depth pass over the structures, skipped when the switch is off.

### Hidden behind geometry

**Hidden behind geometry** (default 0.8): how strongly a datapoint behind level geometry is suppressed. The value reads *shows through* at 0, *N% dimmer* in between (the slider position, not the measured dimming), *hidden entirely* at 1.

It is counted **per surface**. A single depth comparison can only say "something is in front", so a point behind one wall and a point four rooms into a building would dim alike and the interior would read as one faint smear. Instead the structure geometry is **depth-peeled** into up to 3 further layers ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)), each fragment counts how many surfaces are in front of it (the scene's own depth plus the peeled layers: up to four), and the dimming compounds:

```
strength      = 1 - (1 - slider)²                  (slider 1 → 1)
visibility    = (1 - strength) × 0.5 ^ (surfaces - 1)
visibility    = max(visibility, 0.006)             (no floor at slider 1)
```

| Slider | 1 surface | 2 | 3 | 4 |
|---|---|---|---|---|
| 0.5 | 25% | 12.5% | 6.25% | 3.1% |
| 0.8 (default) | 4% | 2% | 1% | 0.6% (floor) |
| 1.0 | not drawn | not drawn | not drawn | not drawn |

Why two factors: the slider is calibrated so one wall leaves a few per cent - the look that reads as "behind something" - and a few per cent compounded would be nothing by the third wall; halving per further surface keeps four distinguishable steps. Why squared: linear left a saturated field still saturated behind a wall; a fourth power erased it at 0.8. Why a floor: hiding occluded heat completely makes a room full of hidden traffic look like an empty room, with nothing to suggest reaching for the [Slice](slice.md). Only a slider pinned at 1 hides it outright - and is the cheapest setting, since occluded points are then discarded.

How ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), the point heat shaders): the comparison is per fragment, against the scene's depth texture, in **window depth** rather than world distance. A vertex-stage depth-texture fetch reads "far" everywhere on some drivers (ANGLE's software rasteriser among them), and linearising both depths into metres loses the separation to precision with a wide near/far range. The bias is one sprite radius converted into window units plus a few least-significant bits, so a datapoint resting on a surface does not shadow itself.

Structures are drawn translucent, but they are drawn into the depth that occlusion reads; a level whose structures did not reach the depth texture would occlude only against terrain. See also [Level appearance](level-appearance.md).

## Distance culling

**Distance culling** (closed by default) restricts the heat to rows between a near and a far bound from the camera. Set a far bound to read density inside a building without the far side of the map summing on top of it; set a near bound to fly *through* a hotspot instead of into it.

| Control | Default | Range (jog) | Meaning |
|---|---|---|---|
| **Near** | off | 0.5-5000 m, logarithmic, the bottom 5% of the track = off (200,000) | Rows closer than this are skipped. |
| **Far** | off | 1-200,000 m, logarithmic, bottom = off (10,000,000) | Rows farther than this are skipped. |
| **Cut at a plane** | on | | Measure the bounds along the view axis instead of from the eye, so the cut is a plane parallel to the screen rather than a sphere around you. A sphere's edge curves away across the frame and slides whenever you turn; a plane stays where you put it. |
| **Cut the level too** | on | | Cut the ground, structures and water at the same bounds. With the level left whole, the cut removes the datapoints and leaves the building standing in front of them; with both cut, it is a section through the map and the points sit against their walls and floors. This one only redraws; it does not restart the accumulation. |

Both bounds are evaluated in the vertex shader, so a culled row costs one vertex and no fragments.

### Keyboard

The far bound is a control you sweep - walk it through a building and watch which floor the traffic appears on - so it is on the keyboard while you fly ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Key | Effect |
|---|---|
| `]` | Push the far bound out by a factor of 1.12 (Shift: 1.35) |
| `[` | Pull it in by the same factor |
| `\` | Turn the far bound off, or on again at the distance it was left (6000 the first time) |

Steps are geometric because the useful range spans four orders of magnitude, from a room to a map. The keyboard keeps the far bound between 100 and 400,000. The keys do nothing while a text box or menu has focus.
