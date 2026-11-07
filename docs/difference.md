---
title: Difference
parent: Heat modes
nav_order: 5
---

# Difference

**Difference** (key 2) is signed heat. Rows of one population add heat; rows of another subtract it. Where the two overlap evenly the result is zero and fully transparent; where one dominates it shows in that side's colours - by default warm (transparent → red → yellow → white) for the **+** side and cool (transparent → green → blue → purple) for the **−** side.

*Which* two populations is the whole question, so the split can be any retained column, not only groups. Rows that fall on **neither** side are **left out**, not counted as zero: that is what makes a split over two of many values compare exactly those two, and it composes with the [filters](filters.md) - filter down to one map, then split that by build.

The mode needs two sides: a group column with at least two groups, or a split over a column kept for filtering. On data with fewer than two groups a load starts with a column split - the *Source file* column of a multi-file load first, otherwise the first category column with two values, otherwise the first numeric column with a span - so *compare two loads* works on data without any groups. Only data with neither leaves the mode unavailable; so does a column split left with nothing on one side.

## The Difference split panel

Shown in Difference mode, below the heat panels.

**Split by** offers:

| Option | Shown as | Split rule |
|---|---|---|
| Groups | *Group (N)* (when there is a group column) | Each group on +, − or neither, set in the [Teams list](teams-list.md) |
| A category column | *column (N values)* | Values on +, − or neither |
| A numeric column | *column (numeric)* | A value range for each side |
| The file of origin | *Source file - compare two loads* (when several files were loaded) | Files on +, − or neither |

Only columns kept under *Keep for filtering* at load time are offered.

### By group

The panel just points at the [Teams list](teams-list.md), where each group has a **+** and a **−** button. On every load the first half of the groups (rounded up) is put on +, the rest on −; **Split evenly** in the Teams list does the same again. A group on neither side, or hidden with its checkbox, contributes nothing.

### By category values

| Part | Meaning |
|---|---|
| `a + / b − / c unused` | How many values are on each side and on neither. |
| **Clear** | Puts every value on neither side. |
| Value list | Each value with a **+** and a **−** button (click the active one again to take it off that side). An empty value is listed as *(missing)*. |
| Cap note | Only the first 200 values are listed: *Showing the first 200 of N values. A column this wide is better narrowed with a filter first, or split by range if its values are ordered.* |

Choosing the column puts its first value on + and its second on −. When neither side has any value, the split falls back to groups rather than showing an empty frame. *Source file* works the same way, one value per file - this is how two exports, two test runs or two builds are compared.

### By range

| Part | Meaning |
|---|---|
| Hint | The column's minimum and maximum. |
| **Positive range (+)**, **from** / **to** | Rows with a value in this range, inclusive at both ends, add. |
| **Negative range (−)**, **from** / **to** | Rows in this range subtract. |
| **Split at the midpoint** | Sets + to [minimum, middle] and − to [middle, maximum] - also what choosing the column does. |

A value in both ranges counts as +. The ranges do not have to cover the column; values in neither are left out. *The first two minutes against the last two* is a range split on a time-like column.

## Colours

The **Heat colours** section shows two ramp editors in this mode: **Positive (additive teams)** and **Negative (subtractive teams)**, each with its own reset button (*Reset to transparent → red → yellow → white*, *Reset to transparent → green → blue → purple*). The composite takes the absolute value of the net heat through the [saturation point and response](colour-and-exposure.md), and picks the negative ramp where the net is below zero. See [Colour and exposure](colour-and-exposure.md#the-ramp-editor).

Use the *Linear* density response when the size of the difference matters: it is the only response where equal colour means equal count.

## How it works

Every row gets a sign of +1, -1 or 0 in the vertex shader ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); a 0 rejects the row before any fragment is drawn.

- By group, the sign comes from a 4,096-entry group table indexed by the row's group id (the group id rides in the fourth channel of the row's position texel).
- By category, the sign comes from a second 4,096-entry table, filled per category value, and the row's value is read from the column's filter texture; a value past the end of the table is rejected on both backends.
- By range, the row's value is compared with the two ranges.

Changing the split restarts the accumulation.

**Hidden groups stay hidden with every split.** Under a split by a column the group table no longer carries signs; it holds 1 for a shown group and 0 for a hidden one ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), and both tables reach the shader together - two rows of one sign texture on WebGL2, two halves of one storage buffer on WebGPU. A row is drawn only when its group is shown *and* its column value is on a side. So a group unticked in the [Teams list](teams-list.md), or left out by the Match tab's side focus, contributes nothing whichever way the difference is split.
