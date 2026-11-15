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

## What hiding a group does

- In **Heat**, **Team heat** and **Lines**, the group's rows contribute nothing.
- In **Difference**, a hidden group contributes nothing whichever side it is on, also with a split by another column (see [Difference](difference.md#how-it-works)).
- In the **figure overlay**, persons whose first row is in that group are not drawn.
- In **Team heat**, the other groups keep their colours: hues are assigned from the total group count, not from what is visible, so two pictures stay comparable.

Changing visibility restarts the accumulation. On every new dataset, every group is visible again.

The panel's hint changes with the mode: in Difference it explains + and -; in Team heat, that the swatches are the colours each group draws in.
