---
title: Measure
parent: Filters and tools
nav_order: 5
---

# Measure

The **Measure** panel turns the mouse into a ruler and reads the heat under the cursor.

## Using it

Tick **Ruler active**. Then, over the view:

| Action | Effect |
|---|---|
| Left-click | Drops a point where the cursor meets the ground plane. A click that moved more than 4 pixels between press and release is a camera drag, not a point. |
| Right-click | Removes the last point. |
| Move | The cursor position and the heat under it update live. |

The camera keeps working while the ruler is on: dragging still looks around, keys still fly. While the ruler is on it takes every click, so [click-to-pick](camera.md#click-to-pick) waits until it is off.

**The ground plane** is the [map image's](map-images.md) elevation when a map image is loaded, otherwise the lowest Y of the dataset (0 without one). Points land on it, so the ruler measures across the map, not along a line through it. With a 3D level the plane is still the dataset's lowest Y, not the level's surface - for a point on the real surface, switch the ruler off and click it ([click-to-pick](camera.md#click-to-pick)), which reads the coordinates off the level's own triangles.

## Readouts

| Line | Meaning |
|---|---|
| **Cursor** | World X, Y, Z of the point under the cursor, on the plane. |
| **Heat here** | The accumulated heat at the cursor pixel - the value the colour ramp is fed before the saturation point divides it, so it can be compared with the [Saturation point](colour-and-exposure.md#saturation-point). Read from the GPU at most every 120 ms, because a single-pixel readback stalls the pipeline. |
| **Last segment** | Distance from the last point to the cursor (or between the last two points). |
| **Path total** | Length of the polyline through every point and the cursor. |
| **Straight line** | 3D distance from the first point to the cursor (or the last point). |
| **Ground only** | The same, on X and Z only. |
| **Clear (N)** | Removes all points. |

Distances are shown in centimetres below 1 unit, metres below 1,000, kilometres above - assuming one world unit is a metre ([Axes, units and time](axes-units-and-time.md#unit-scale)). Coordinates are world coordinates, including when an axis is [inverted for display](camera.md#invert-world-axis).

The points and the line between them are drawn as an overlay in the view, sized from the grid spacing.

## Notes

- **Heat here** is read the same way as `engine.readHeatProbe()`: divided by the gain the frame was written with, so on the half-float accumulation path (devices without 32-bit float blending, or `?heat=f16`) it is in the same units as the saturation point as on a 32-bit target ([Half-float accumulation](half-float-accumulation.md)).
- The ruler's points are not saved and survive a dataset change.
