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

Right after them come the [outcome columns](data-formats.md#outcome-columns), where the data has them: **Round result** and **Match result** (*Any*, *Won*, *Lost*) and **How the round ended**, its values in your language. Filter on them, or split the heat by them as a [win-rate map](win-rate.md).

Only the kinds that occur are listed. Value columns (`cost_*`, `earn_*`, `net_*` and *Cost source*, see [Value weighting](value-weighting.md)) are filterable like any number column: for example untick *estimate* under *Cost source* to keep only priced rows.

A category list with more than 12 values gets a search box (*Search n values*) and an **Only these** button that allows exactly the values that match.

Which columns can be filtered is decided at load time, because they have to be read then. With no retained column the panel says so and points at *Keep for filtering*.

## Rainbow Six Siege quick filters

With a Rainbow Six Siege match loaded, the panel starts with buttons that set the filters in one click: **Bullet holes and marks** (the marks left on the level), **Marks with a shooter** and **Marks with a weapon class** (those a shooter, or a weapon from the shooter's kill in the same moment, was worked out for; split or filter them further by `byOperator` or `byItemClass`), **Plant and defuse attempts**, **Interrupted attempts** (started, not finished, where the player stopped) and **Reinforcements** (where a wall or hatch was reinforced, at the defender the converter infers). Each replaces the filter on the event column and keeps the rest; **Clear all filters** undoes it. The columns are described in the converter's documentation.

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

- **Any number of filters at once.** The header shows how many are active. Every one is applied, a selection in [Entities](entities.md) (or the Match tab's player focus) included. A filter that lets everything through - every value ticked, a range over the whole column, *Any* for won or lost - is no filter and is not counted.
- **A category column has at most 4,096 values**; a wider one is not kept at load.
- **Filters combine with AND** across columns; within one column the ticked values combine with OR, and unticking a value excludes it. They also combine with team visibility, the difference split, the time window, the distance cull and the [slice](slice.md).
- **Changing a filter restarts the accumulation and re-meters the exposure** a few frames later, because filtering can change the density a lot ([Colour and exposure](colour-and-exposure.md#auto-exposure)).
- **Clear all filters** removes every column filter. Team visibility and player selections set elsewhere are kept.
- Column filters change the heat modes. They do not change the figures of the [figure replay](box-replay.md), which follow team visibility and the Entities selection. The Entities selection changes both.
- In [line heat](line-heat.md) a filter is tested on the row each segment *ends* at.
- On every new dataset, all filters are cleared.

## For developers

**Pass bits.** There is no cap on filters. When a filter changes, both renderers fold every active filter into one pass flag per row on the GPU, in the same frame: WebGL2 draws one pass per filter into a byte per row (`FILTER_PASS_FS`, multiplied together), WebGPU dispatches one compute pass per filter into a bit per row (`FILTER_PASS_WGSL`, ANDed). The heat pass then reads one flag per row, however many filters there are, and a steady frame does no filter work at all. Each filtered column is put on the GPU once, 4 bytes per row, the first time it is filtered; it is only read while the flags are rebuilt, so the memory budget may take it back. Which filters are active is [`activeFilterFlags`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts), shared by both renderers and both panels; the rule per row is `rowPasses`. Measured on 10 million rows with ten filters (RTX 5080): a toggle, *All* or *None* shows on the next frame, which takes about 1 ms longer than a steady frame.

**Filters the panel does not show.** Two more kinds exist in the application state ([`FilterSpec`](https://github.com/Holdi601/3DHeat/blob/main/src/state/types.ts)):

- a **groups** filter, set by the Match tab when it focuses one side. It hides the other groups in every mode, a [difference](difference.md) split by a column included.
- a **persons** filter, set by the [Entities](entities.md) panel and by the Match tab when it focuses one player. It restricts the figure replay and the heat modes. In the heat it is a category filter over the person ids, applied like any other. Its mask holds 65,536 ids ([`FILTER_MASK_CAPACITY`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); a person past that is not drawn in the heat while it is active, even when selected. The figure replay still shows them.
