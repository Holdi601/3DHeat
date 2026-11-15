---
title: Entities
parent: Filters and tools
nav_order: 3
---

# Entities

**Entities** lets you pick one player (or a few) to see only where that player went. Use it to follow your own movement or one opponent.

The panel is shown when the dataset has a person column. Its header shows the number of persons, or `selected of total` while a selection is active (a *person* is one player or AI, see the [glossary](glossary.md)).

## Pick a player

1. Open **Entities** in the sidebar.
2. Type part of the name in the search box.
3. Tick the player. The header reads, for example, `2 of 10`, and everything else disappears.
4. **Clear** shows everyone again.

![Entities with two of ten players selected](assets/img/en/entities-selected.webp)

The selection shows only the selected persons, in the heat modes (points, lines, difference, team heat) as well as in the tracks, figures and trails of the [figure replay](box-replay.md). Leave it empty to show everyone; selecting everyone is the same as selecting no one.

## The panel

| Part | Meaning |
|---|---|
| Search box | *Search N entities...* - filters the list by a case-insensitive substring of the name. Shows `N matches`, or `N matches, showing the first 200`; *Nothing matches "..."* when the search finds none. |
| List | Up to 200 persons (the first 200 matching), each with a checkbox, a swatch of the person's colour, and the name (*(unnamed)* for an empty name). |
| In-play hint | When time is playing, the list holds those *in play at the playhead*; a search finds all. |
| **AI (n)** | A collapsible group holding the AI-controlled units, apart from the players. |
| **Add shown** | Adds everyone currently listed to the selection. |
| **Only shown** | Makes the selection exactly those listed. |
| **Clear** | Empties the selection. |

## Limits

In the heat the selection is a filter and uses one of the four [filter slots](filters.md#rules). When the other filters already use all four, the panel says *Not applied to the heat: all filter slots are taken. The figure replay still shows only these entities. Clear a filter under Filters to free one.* Clear a filter to free a slot.

The selection is cleared on every new dataset. The Match tab sets the same selection when it focuses one player.

## For developers

The selection is stored as a *persons* filter ([Filters](filters.md#for-developers)). The shader's mask holds 65,536 person ids; a person past that is not drawn in the heat while a selection is active.
