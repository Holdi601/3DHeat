---
title: Filters and tools
nav_order: 6
has_children: true
---

# Filters and tools

These panels let you pick *which* data you look at and measure what you see. Use them when the picture is too busy: show one team, one player, one place, or one floor of a building.

Each panel narrows the data, and they work together: a row is drawn only if it passes **all** of them (AND).

```
all rows -> Filters -> Teams -> Entities -> Slice -> picture
              AND       AND       AND        AND
```

Example: untick *Tank* under Filters, hide the Red team under Teams, and pick one player under Entities. You see only that player's non-tank movements.

| Panel | What it does | Heat modes | Figure overlay |
|---|---|---|---|
| [Filters](filters.md) | Range and category filters on any column kept at load. | Yes | No (column filters only) |
| [Difference split](difference.md#the-difference-split-panel) | Which rows add and which subtract, in Difference mode. | Difference only | No |
| [Teams](teams-list.md) | Show or hide each team; put teams on the + or - side. | Yes | Yes |
| [Entities](entities.md) | Pick individual players. | Yes | Yes |
| [Slice](slice.md) | Cut a slab out of the level and the heat, to look inside buildings. | Yes, and the level | No |
| [Measure](measure.md) | A ruler, and the heat value under the cursor. | Yes | Yes |
| [Volumes and comparison](volumes.md) | Draw 3D shapes and ask what happened inside. Can also filter. | Yes | Yes |
| [Charts on volumes](volume-charts.md) | Charts of the rows inside a volume, standing beside it in the world. | Yes | Yes |
| [Breakdown](breakdown.md) | Which vehicle, player or weapon does best in a place. | n/a | n/a |

Hit analysis has its own area filter in the **Vehicles** tab: see [Hit analysis](hit-analysis.md).

Terms such as heatmap, row, person and group are explained in the [glossary](glossary.md).

## Where the panels are

The Heatmap tab's sidebar, from top to bottom:

1. Mode bar and session picker
2. Source, Column mapping, Dataset
3. Routes (Lines mode)
4. The heat panels, or the Team viewer
5. Difference split
6. Teams
7. Entities
8. Filters
9. Map and background
10. Slice
11. Measure
12. Camera path & render
13. Performance
14. Camera & scene

The Match tab shows the mode bar, the session picker, its own panel, Filters, Map and background and Camera & scene.
