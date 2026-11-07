---
title: Filters
parent: Filters and tools
nav_order: 1
---

# Filters

The **Filters** panel lists every column that was kept under *Keep for filtering* at load ([Column mapping](column-mapping.md)), plus *Source file* when several files were loaded. Each one can restrict the render live. Filters are evaluated per row **in the vertex shader**, so changing a threshold re-filters the whole dataset on the next frame - no re-parse, no re-upload, no rebuilt buffer - at any dataset size.

Which columns can be filtered is decided at load time, because they have to be read then. With no retained column the panel says so and points at *Keep for filtering*.

## Numeric columns (range)

| Part | Meaning |
|---|---|
| Name, and `min … max` | The column, and the current range (the column's full range while no filter is set). |
| First row: number box and slider | The lower bound. Dragging the slider above the upper bound pushes the upper bound with it. |
| Second row: number box and slider | The upper bound. Dragging below the lower bound pushes it too. |
| **Reset column** | Removes this filter. |

The sliders cover the column's minimum to maximum in 1,000 steps; the number boxes accept any value. A row passes when its value lies within the range, both ends included. Large values are shown in exponent form (`1.23e6`).

## Category columns

| Part | Meaning |
|---|---|
| Name, and `allowed/total` | The column, and how many of its values are allowed. |
| Value list | A checkbox per value; an empty value is shown as *(empty)*. |
| **All** / **None** | Allow every value / no value. |

Allowing every value removes the filter.

## Limits and behaviour

- **Four filters at once.** Each active filter takes one of four GPU slots ([`MAX_FILTER_SLOTS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)), each a texture of 4 bytes per row. A selection in the [Entities](entities.md) panel (or the Match tab's player focus) takes one too, and the panel then says *The Entities selection takes one of these slots.* Slots go to the filters in the order they were last changed ([`filterSlots`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts), which the shader and both panels share). The header shows `active/4`, red past four; past four, an error says *Only the first 4 filters are applied. Clear one - the rest are being ignored, not silently combined*, and the extra filters' names read *column (not applied)* - or, when the Entities selection is the one left out, the Entities panel says so. A filter whose range covers the whole column, or which allows every category, takes no slot.
- **A category column has at most 4,096 values**, the same cap as groups; a wider category column is not retained at load at all.
- **Filters combine with AND**, and with group visibility, the difference split, the time window, the distance cull and the slice.
- **Changing a filter restarts the accumulation and re-meters the exposure** about 8 frames later, because filtering can change the density by orders of magnitude ([Colour and exposure](colour-and-exposure.md#auto-exposure)).
- **Clear all filters** removes every column filter. Group filters and person selections set elsewhere (the [Entities](entities.md) panel, the Match tab) are kept.
- Column filters affect the heat modes. They do not affect the boxes of [box replay](box-replay.md), which follow group visibility and the Entities selection. The Entities selection affects both.
- In [line heat](line-heat.md) a filter is tested on the row each segment *ends* at.
- On every new dataset, all filters are cleared.

## Filters the panel does not show

Two further kinds of filter exist in the application state ([`FilterSpec`](https://github.com/Holdi601/3DHeat/blob/main/src/state/types.ts)):

- a **groups** filter, set by the Match tab when it focuses one side - it hides the other groups in every mode, a [difference](difference.md) split by a column included, as group visibility does;
- a **persons** filter, set by the [Entities](entities.md) panel and by the Match tab when it focuses one player - it restricts [box replay](box-replay.md) and the heat modes, points and lines alike. In the heat it is a category filter over the person ids and takes one of the four slots (see above). Its mask holds 65,536 ids ([`FILTER_MASK_CAPACITY`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); a person whose id is past that is not drawn in the heat while a persons filter is active, even when selected - box replay still shows them.
