---
title: Teams list
parent: Filters and tools
nav_order: 2
---

# Teams list

The **Teams** panel lists every group of the dataset ([Groups](sessions-persons-groups.md#group)). It is shown when the dataset has a group column; the group count is on its header.

## Each row

| Part | Meaning |
|---|---|
| Checkbox (*Visible*) | Show or hide the group. |
| Swatch | The group's colour: its [team heat](team-heat.md) colour in Team heat mode, its base colour (the hue family of [box replay](box-replay.md)) in the other modes. |
| Name | The group label (full label on hover). |
| **+** / **−** (Difference mode) | Put the group on the positive or negative side of the [difference](difference.md); click the active button again to put it on neither side. |
| `Np` (other modes) | The number of persons whose first row is in this group. |

## Buttons

| Button | Effect |
|---|---|
| **Show all** | Makes every group visible again. |
| **Split evenly** (Difference mode) | First half of the groups (rounded up) on +, the rest on −; the same split every load starts with. |

## What hiding a group does

- In **Heat**, **Team heat** and **Lines**, the group's rows contribute nothing (they are rejected in the vertex shader through the same sign table the difference uses).
- In **Difference**, a hidden group contributes nothing whichever side it is on - with a split by group and with a split by any other column (see [Difference](difference.md#how-it-works)).
- In **Box replay**, persons whose first row is in that group are not drawn.
- In **Team heat**, the other groups keep their colours: hues are assigned from the total group count, not from what is visible, so two pictures stay comparable.

Changing visibility restarts the accumulation. On every new dataset, every group is visible again.

The panel's hint changes with the mode: in Difference it explains + and −; in Team heat, that the swatches are the colours each group draws in.
