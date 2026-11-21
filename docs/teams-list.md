---
title: Teams list
parent: Filters and tools
nav_order: 2
---

# Teams list

The **Teams** panel lets you hide a team or put it on one side of a comparison. Use it to look at only Blue, or to ask "where does Blue go that Red does not?".

A *group* is a team or side, for example Blue and Red ([Groups](sessions-persons-groups.md#group)). The panel is shown when the dataset has a group column; the group count is on its header. In Team heat mode the sidebar also has a section called **Team viewer** with its own settings; this page covers the **Teams** list.

## Hide a team

1. Open **Teams** in the sidebar.
2. Untick the checkbox (*Visible*) of the team to hide. The picture updates at once.
3. Press **Show all** to bring every team back.

![The Teams list: Blue 5p, Red 5p, with Show all](assets/img/en/teams-list.webp)

## Each row

| Part | Meaning |
|---|---|
| Checkbox (*Visible*) | Show or hide the group. |
| Swatch | The group's colour: its [team heat](team-heat.md) colour in Team heat mode, its base colour in the other modes. |
| Name | The group label (full label on hover). |
| **+** / **-** (Difference mode) | Put the group on the positive or negative side of the [difference](difference.md); click the active button again to put it on neither side. |
| `Np` (other modes) | The number of persons whose first row is in this group. |

![Difference mode: Blue on the + side, Red on the - side](assets/img/en/teams-list-difference.webp)

## Buttons

| Button | Effect |
|---|---|
| **Show all** | Makes every group visible again. |
| **Split evenly** (Difference mode) | First half of the groups (rounded up) on +, the rest on -; the same split every load starts with. |

## Number teams by map side

Some games number a match's teams without regard to the map: in War Thunder, team 1 starts on either side, match by match, so two matches laid over each other mix both sides under one colour. **Number teams by map side** (shown when the data has groups and persons) numbers each match's teams by the side of the map they start on, so team 1 is the same side in every match of a map:

- A team's start is the median of where its units first appear in the match (their spawn).
- For each map, the viewer takes the line its spawns lie on over all its matches. Along that line, held pointing east (north where it runs north and south), the team starting further west (or south) is side A and gets the lower team number. A match whose teams lie the other way round has them swapped.
- The map is what a session's name says before its date (`avg_map_AB_Dom_` of `avg_map_AB_Dom_2026-11-20_..._server`), so a map's game modes, which have their own spawns, are lined up apart. Without a date, all sessions count as one map.
- Only matches with exactly two teams are lined up; groups named `0`, `none` or `unknown` do not count as a team.
- The team the data gave each row stays in the `teamRaw` column, which you can filter on. Untick the option to get the data's own numbering back.

The hint under it says how many matches were lined up and how many had their teams swapped. The choice is kept in this browser and applies to every load. Switching it rebuilds the views of the loaded data once.

## What hiding a group does

- In **Heat**, **Team heat** and **Lines**, the group's rows contribute nothing.
- In **Difference**, a hidden group contributes nothing whichever side it is on, also with a split by another column (see [Difference](difference.md#for-developers)).
- In the **figure overlay**, persons whose first row is in that group are not drawn.
- In **Team heat**, the other groups keep their colours: hues are assigned from the total group count, not from what is visible, so two pictures stay comparable.

Changing visibility restarts the accumulation. On every new dataset, every group is visible again.

The panel's hint changes with the mode: in Difference it explains + and -; in Team heat, that the swatches are the colours each group draws in.
