---
title: Heat modes
nav_order: 4
has_children: true
---

# Heat modes

Every dot adds a little glow, the glows pile up, and the pile is painted with colours. The modes are five ways to paint it, and each answers one question.

The mode bar at the top of the Heatmap tab's sidebar picks how the [dataset](glossary.md) is drawn. Keys 1-4 pick Heat, Difference, Team heat and Lines. Figure overlay has no key.

![The mode bar with Heat, Difference, Team heat, Figure overlay and Lines](assets/img/en/heat-modes-bar.webp)

| Mode | Question it answers |
|---|---|
| **Heat** | Where did it happen, and how much? |
| **Difference** | Which side did it more? |
| **Team heat** | Whose was it? |
| **Lines** | Which way did people go? |
| **Figure overlay** | Who was where, and when? |

![The same data in four modes: Heat, Difference, Team heat and Lines](assets/img/en/heat-modes-grid.webp)

| Mode (bar label) | Key | What it draws | Needs |
|---|---|---|---|
| **Heat** | 1 | Additive density: every visible row adds a camera-facing radial sprite. [Heat](heat.md) | a dataset |
| **Difference** | 2 | Signed density: one population adds, another subtracts. [Difference](difference.md) | two sides: at least two groups, or a split over a kept column |
| **Team heat** | 3 | Density coloured by group: a hue per group, mixed where groups overlap. [Team heat](team-heat.md) | a group column |
| **Figure overlay** | - | A figure (or box) per person, moving along the timeline: the replay. [Figure overlay](box-replay.md), [Match replay](match-replay.md) | a person column |
| **Lines** | 4 | Line heat: a line from each sample of a person to their next, heat falling off sideways. [Line heat](line-heat.md) | a person and a time column |

A mode the data cannot support is greyed out, and its tooltip gives the reason, for example *Unavailable - Difference mode needs two groups or a kept column to split on; this data has one group.* When a new dataset cannot support the current mode, the view falls back to **Heat**.

Keys 1-4 are checked against the data the same way: a key for a greyed-out mode does nothing.

## Which panels each mode shows

| Panel | Heat | Difference | Team heat | Figure overlay | Lines |
|---|---|---|---|---|---|
| Routes ([line heat](line-heat.md)) | | | | | yes |
| Heat shape (with **Follow the view** and **Same density at any zoom**), Heat colours, Sprite pixel clamps (developer tools), Depth, Distance culling | yes | yes | yes | | yes |
| Direction ([directional heat](directional-heat.md)), Value ([value weighting](value-weighting.md)) | yes | yes | yes | | yes |
| Team viewer ([figure overlay](box-replay.md)) | | | | yes | |
| Difference split ([difference](difference.md)) | | yes | | | |
| [Teams](teams-list.md), [Entities](entities.md), [Filters](filters.md), Map and background, [Slice](slice.md), [Measure](measure.md), Camera path & render, Performance, Camera & scene | yes | yes | yes | yes | yes |

## What every heat mode shares

All four heat modes (everything but the figure overlay) are the same machine with different inputs ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

1. **Which rows.** The [timeline](timeline.md) window picks a contiguous range of time-sorted rows; [filters](filters.md), group visibility, the difference split, [distance culling](depth-and-culling.md#distance-culling) and the [slice](slice.md) decide per row, in the vertex shader, whether and how strongly each contributes.
2. **Splatting.** Each contributing row is drawn as a sprite (or, in Lines mode, a segment) into a floating-point **heat target**, adding its ramp value. A stratified sample of the rows is drawn when there are more than one frame can afford, weighted to compensate. See [Sampling and budgets](sampling-and-budgets.md).
3. **Accumulation.** While nothing changes, frames are merged until every row has contributed exactly once. See [Accumulation](accumulation.md).
4. **Composite.** The accumulated value at each pixel is divided by the **saturation point**, shaped by the **density response**, lifted by the **minimum heat**, and looked up in the **colour ramp**, whose alpha blends it over the scene. See [Colour and exposure](colour-and-exposure.md).

Everything in step 4 is applied at composite time, so dragging those controls never restarts the accumulation; anything in steps 1-2 does.

## Pages in this section

- [Heat](heat.md) - the plain heat mode, and the overview of its panels
  - [Sprite shape](sprite-shape.md) - radius, intensities, falloff, the curve editor, pixel clamps, flattening
  - [Colour and exposure](colour-and-exposure.md) - ramp editor, saturation point, auto-exposure, minimum heat, density response
  - [Depth and culling](depth-and-culling.md) - occlusion by the level, hiding behind terrain, distance culling
- [Difference](difference.md) - the difference split
- [Team heat](team-heat.md)
- [Line heat](line-heat.md) - routes
- [Figure overlay](box-replay.md) - the replay mode (the file is still called box replay)
- [Directional heat](directional-heat.md)
- [Value weighting](value-weighting.md)
