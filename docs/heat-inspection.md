---
title: Heat inspection and labels
parent: Heat modes
nav_order: 9
---

# Heat inspection and labels

Click a hot spot to see what it is made of: every row whose sprite covers that pixel, one after the other, with how much each adds, and how hot the place is compared with everything else in view. Switch on **Heat labels** and the hottest places in view carry their value - in Difference also the most negative ones.

## Inspect a hot spot

1. Click a point of the heat (with **Click shows what is there** on, see [Click-to-pick](camera.md#click-to-pick)). The pick card opens as before.
2. The card reads the heat at the click first. On a large dataset this takes a moment (*Reading the heat here... N%*); the view keeps running meanwhile.
3. Use **‹** and **›** to walk through the rows in the stack. The card's fields, the marker in the view and **Jump to in replay** follow the row shown. Past the last row the card returns to the point picked.
4. **Jump to in replay** opens the match replay a few seconds before that row, behind whoever it is about (or flown to it when the row has no person).

A click on the level's surface reads the heat there too: the marker shows the value under it.

| Line | Meaning |
|---|---|
| **Heat here** | The heat at the clicked pixel: what every drawn row whose sprite covers it adds, by the sprite's ramp (centre and edge intensity, falloff or curve), the pixel clamps, the value weight and the side. It is the number the [saturation point](colour-and-exposure.md#saturation-point) is measured in, and the share of the saturation point is given beside it. |
| **+ side / − side** (Difference) | The positive and negative parts of that sum. |
| **In the stack** | Rows whose sprites cover the pixel. Up to 250,000 are listed; the count and the sum go on past that. |
| **This place** | The rows in the cell under the pick, a cell two sprite radii across - the same unit the labels use. |
| Relative line | *Hotter than P% of the N places in view: M× the median place, Q% of the hottest.* Places are the cells whose centre is on screen. In Difference a negative place is compared with the negative places. |
| Order | *Strongest first* (by what each row adds) or *By time*. |

Under the heat, the card sums up what the place is made of, from the rows in the stack, each weighed by what it adds to the heat there:

| Line | Meaning |
|---|---|
| **What happened** | The events, by the viewer's event type, with the game's own word beside it where it differs (*damage (fire on)*). |
| **Units** | The units, by the data's plain name where it has one (a short vehicle name), else the game's [unit catalogue](figures.md) name, else the id made readable. |
| **Weapons** | The weapons or shells, the same way: the data's weapon name, else the id made readable (`88mm_pzgr_39` reads *88 mm pzgr 39*). |
| **Who**, **Teams** | The players and teams. |
| **Kills / deaths here** | Kill and death rows in the stack; a death logged twice at the same moment counts once. Where the data logs kills with their victims but no deaths of their own, it says the kills only: a victim died where it last was, which the [Breakdown](breakdown.md) counts. |
| **This row** | The row picked (or walked to) in one line: who, in what, which team, what happened, with what. |

Every column of the row, its coordinates and its look are behind **All columns**.

## Heat labels

**Heat labels** in **Heat shape** names the hottest places in view; **Places per side** (1-20, default 5) sets how many. Labels are kept at least three cells apart, so one spot does not take them all.

| Mode | Label |
|---|---|
| Heat | `#rank value` at the hottest places. |
| Difference | The hottest positive places (`+value`) in warm frames and the most negative ones (`−value`) in cool frames. |
| Team heat | `value · group share%`: the group holding most of the place. |

Which places get labels is chosen again when the camera comes to rest or what is drawn changes; while the camera moves the labels only follow their places, so they do not flicker.

## How it is computed

Nothing here reads the GPU. Each frame records which rows it drew (time window, filters, groups and split, lifetime, distance cull, slice) - the same record a click on a data point uses. From that record:

- the stack is a scan of the drawn rows for those within the drawn sprite radius of the click's ray, a few milliseconds at a time between frames;
- the places are the drawn rows binned into cells two sprite radii across (columns when the heat is flattened onto the ground plane), with the count, the weighted sum and the mean position of each cell. The field is rebuilt between frames when what is drawn changes; during playback it trails the playhead by one rebuild.

The values are the field as the data defines it. Occlusion dimming and the ground cull change what the screen shows, not these numbers.

Source: [`heatStack.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/heatStack.ts), [`heatField.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/heatField.ts), [`HeatHere.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/heatInspect/HeatHere.tsx), [`HeatLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/heatInspect/HeatLabels.tsx).
