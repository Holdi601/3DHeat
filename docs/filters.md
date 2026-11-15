---
title: Filters
parent: Filters and tools
nav_order: 1
---

# Filters

**Filters** hide the rows you do not care about, such as one vehicle class or one event kind, and the picture updates at once. The panel lists the columns kept at load under *Keep for filtering* ([Column mapping](column-mapping.md)), plus *Source file* when several files were loaded.

## Try it

1. Load a dataset and open **Filters** in the sidebar.
2. Under **Vehicle class**, untick *Tank*. The picture changes at once.
3. Press **Clear all filters** to undo.

![The Filters panel: the viewer's own columns (Event type, Vehicle class) first, then the columns from your file](assets/img/en/filters.webp)

The first rows are the viewer's own columns (below). The rows after them come from your file.

## Columns the viewer adds

On load the viewer works out four columns of its own and lists them **first**, with names and values in your language, so the same filter works for every game and data source:

| Column | Values | Worked out from |
|---|---|---|
| **Event type** | 23 kinds: Position, Shot fired, Launch (missile, rocket, bomb), Hit, Miss (weapon ended near no target), Explosion, Damage, Kill, Death, Destroyed, Crash, Ejection / bail-out, Spawn, Despawn, Take-off, Landing, Ground contact, Stop on the ground, Rearm / refuel, Capture / objective, Decoy, Message, Other | a column called `event`, `events`, `event_type` or `event_name`; each game's own words (`shot`, `burst`, `fired`, `struck`, `flare`, `plant` ...) are mapped to these kinds. The full table: [Event types and classes](ref-event-types.md). |
| **Player or AI** | Player, AI | a column `ai`, `is_ai`, `bot` or `actor`; else `is_player` / `human`; else an account id (`user_id`, `steam_id`; empty or 0 is AI); for Tacview recordings, whether the object has a pilot |
| **Vehicle class** | 17 classes: Fighter, Attack aircraft, Bomber, Other aircraft, Helicopter, Tank, Armoured vehicle, Air defence, Artillery, Truck / car, Ship, Submarine, Infantry, Weapon, Decoy, Structure, Other | the vehicle or unit name (matched against the [figure catalogue](figures.md)) and type columns |
| **Target class** | the same classes | the other party's vehicle (`other_vehicle`, `target_vehicle`, `victim_type` ...) |

Only the kinds that occur are listed. Value columns (`cost_*`, `earn_*`, `net_*` and *Cost source*, see [Value weighting](value-weighting.md)) are filterable like any number column: for example untick *estimate* under *Cost source* to keep only priced rows.

A category list with more than 12 values gets a search box (*Search n values*) and an **Only these** button that allows exactly the values that match.

Which columns can be filtered is decided at load time, because they have to be read then. With no retained column the panel says so and points at *Keep for filtering*.

## Numeric columns (range)

![A range filter (money lost) with both ends dragged in](assets/img/en/filters-numeric.webp)

| Part | Meaning |
|---|---|
| Name, and `min ... max` | The column, and the current range (the column's full range while no filter is set). |
| First row: number box and slider | The lower bound. Dragging the slider above the upper bound pushes the upper bound with it. |
| Second row: number box and slider | The upper bound. Dragging below the lower bound pushes it too. |
| **Reset *column*** | Removes this filter. |

The sliders cover the column's minimum to maximum in 1,000 steps; the number boxes accept any value. A row passes when its value lies within the range, both ends included. Large values are shown in exponent form (`1.23e6`).

## Category columns

| Part | Meaning |
|---|---|
| Name, and `allowed/total` | The column, and how many of its values are allowed. |
| Value list | A checkbox per value; an empty value is shown as *(empty)*. |
| **All** / **None** | Allow every value / no value. |

Allowing every value removes the filter.

## Rules

- **Four filters at once.** The header shows `active/4`. A fifth filter is not applied, and the panel says so. A selection in [Entities](entities.md) (or the Match tab's player focus) uses one of the four too. A filter that covers the whole column uses none.
- **A category column has at most 4,096 values**; a wider one is not kept at load.
- **Filters combine with AND**, and with team visibility, the difference split, the time window, the distance cull and the [slice](slice.md).
- **Changing a filter restarts the accumulation and re-meters the exposure** a few frames later, because filtering can change the density a lot ([Colour and exposure](colour-and-exposure.md#auto-exposure)).
- **Clear all filters** removes every column filter. Team visibility and player selections set elsewhere are kept.
- Column filters change the heat modes. They do not change the figures of the [figure replay](box-replay.md), which follow team visibility and the Entities selection. The Entities selection changes both.
- In [line heat](line-heat.md) a filter is tested on the row each segment *ends* at.
- On every new dataset, all filters are cleared.

## For developers

**Slots.** Each active filter takes one of four GPU slots ([`MAX_FILTER_SLOTS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)), a texture of 4 bytes per row. Slots go to the filters in the order they were last changed ([`filterSlots`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts), shared by the shader and both panels). Past four, an error says *Only the first 4 filters are applied. Clear one - the rest are being ignored, not silently combined*, and the extra filters' names read *column (not applied)*. Filters run per row in the vertex shader, so changing a threshold needs no re-parse and no re-upload.

**Filters the panel does not show.** Two more kinds exist in the application state ([`FilterSpec`](https://github.com/Holdi601/3DHeat/blob/main/src/state/types.ts)):

- a **groups** filter, set by the Match tab when it focuses one side. It hides the other groups in every mode, a [difference](difference.md) split by a column included.
- a **persons** filter, set by the [Entities](entities.md) panel and by the Match tab when it focuses one player. It restricts the figure replay and the heat modes. In the heat it is a category filter over the person ids and takes one of the four slots. Its mask holds 65,536 ids ([`FILTER_MASK_CAPACITY`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); a person past that is not drawn in the heat while it is active, even when selected. The figure replay still shows them.
