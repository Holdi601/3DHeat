---
title: Team heat
parent: Heat modes
nav_order: 6
---

# Team heat

**Team heat** (key 3) is the density field of [Heat](heat.md) with every group given its own hue. Where groups overlap, their hues mix; an even contest comes out neutral. Opacity still carries density exactly as in the other modes, so the picture answers *how much* and *whose* at once. It needs a group column.

It is not [box replay](box-replay.md): that draws one box per person; this is a heat field coloured by the same column.

## Controls

In the **Heat colours** section:

| Control | Default | Meaning |
|---|---|---|
| Swatches | | The colour of each group, for the first 12 groups, then *+N more*. Hover for the group name and the colour. |
| **Colour separation** | 1.4 | How far a mixture is pushed away from neutral, 0-4. 0 makes everything grey; 1 is the true average; past about 2 the brightest mixtures leave the displayable range and are clamped per channel, which shifts their hue. |
| **Opacity ramp (colour comes from the group)** | the default heat ramp | Only the ramp's **alpha** is used here: transparent where there is nothing, opaque at the top. Its colours are ignored. |

All the other heat controls - shape, saturation, response, minimum heat, depth, culling - work as in [Heat](heat.md).

The [Teams list](teams-list.md) shows each group's team-heat colour as its swatch in this mode. Hiding a group leaves every other group's colour where it was: hues come from the total group count, not from what is switched on, so two pictures stay comparable.

## The palette

From [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Colours live on the **Oklab** colour plane at a fixed lightness (0.7) and chroma (0.115), so every group is equally bright and a red group does not read as hotter than a blue one.
- With *n* groups, the hue circle is divided into *n* equal parts and group *i* takes the **centre** of its part, `(i + 0.5) / n` of a turn. Any two groups are as far apart as the count allows, and opposites stay opposite whatever the count.
- At most **16** distinct hues are used. With more groups, ids are placed by repeated halving (bit-reversed ids: 0, ½, ¼, ¾, ⅛, …) so neighbouring ids do not share a hue; groups past 16 necessarily share.
- A group whose label means "no group" - `0`, empty, `none`, `unknown`, `null` or `-1`, ignoring case - is drawn **neutral grey** instead of taking a slice of the circle. Only the first such label in the group list is treated this way.

The default separation is 1.4 rather than 1 because, at 1, a mixture of five evenly spread hues *is* grey: correct and unreadable. A little above 1 keeps ties honest while making a 60/40 split visible.

## How it works

The heat target has four channels in this mode. Each sprite adds its density *v* to the first channel and *v* × the group's Oklab *a* and *b* coordinates to the second and third. At composite time the pixel's mixture is the density-weighted mean: *a* = G / R, *b* = B / R, scaled by the colour separation and converted to sRGB at the palette's lightness. Dividing by the accumulated density keeps the hue independent of how much data is there, and is why every density control goes on acting on the opacity alone.

The four-channel target costs four times the GPU memory of the single-channel heat target at the same resolution.
