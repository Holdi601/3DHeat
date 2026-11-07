---
title: Entities
parent: Filters and tools
nav_order: 3
---

# Entities

The **Entities** panel picks individual persons. It is shown when the dataset has a person column. Its header shows the number of persons, or `selected of total` while a selection is active.

The selection shows only the selected persons, in the heat modes (points, lines, difference, team heat) as in the tracks, boxes and trails of [box replay](box-replay.md). Leave it empty to show everyone; selecting everyone is the same as selecting no one.

In the heat the selection is a filter over the person ids and takes one of the four [filter slots](filters.md#limits-and-behaviour), so changing it restarts the accumulation and re-meters the exposure like any filter. When column filters already hold all four slots, the panel says *Not applied to the heat: all filter slots are taken. The box replay still shows only these entities. Clear a filter under Filters to free one.* The heat then shows everyone the other filters let through. The shader's mask holds 65,536 person ids; a person past that is not drawn in the heat while a selection is active (see [Filters](filters.md#filters-the-panel-does-not-show)).

| Part | Meaning |
|---|---|
| Search box | *Search N entities…* - filters the list by a case-insensitive substring of the name. Shows `N matches`, or `N matches, showing the first 200`. |
| List | Up to 200 persons (the first 200 matching), each with a checkbox, a swatch of the person's box colour, and the name (*(unnamed)* for an empty name). |
| **Add shown** | Adds everyone currently listed to the selection. |
| **Only shown** | Makes the selection exactly those listed. |
| **Clear** | Empties the selection. |

The selection is stored as a *persons* filter and cleared on every new dataset. The Match tab sets the same filter when it focuses one player.
