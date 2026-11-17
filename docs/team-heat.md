---
title: Team heat
parent: Heat modes
nav_order: 6
---

# Team heat

Team heat shows where each team was, every team in its own colour. Where teams overlap the colours mix.

**Team heat** (key 3) is the density field of [Heat](heat.md) with every [group](glossary.md) given its own hue. Where groups overlap, their hues mix; an even contest comes out neutral. Opacity still carries density exactly as in the other modes, so the picture answers *how much* and *whose* at once. It needs a group column.

![Team heat: each side in its own colour; where they overlap the colours mix](assets/img/en/heat-teams.webp)

It is not the [figure overlay](box-replay.md): that draws one figure per person; this is a heat field coloured by the same column.

## How to use it

1. Press `3` (or pick **Team heat** in the mode bar).
2. Open **Heat colours**. The swatches show each group's colour; hover a swatch for the team name.
3. If everything looks grey, raise **Colour separation**.
4. Untick a group in the [Teams list](teams-list.md) to take it out; the other colours stay where they were.

## Controls

In the **Heat colours** section:

| Control | Default | Meaning |
|---|---|---|
| Swatches | | The colour of each group, for the first 12 groups, then *+N more*. Hover for the group name and the colour. |
| **Colour separation** | 1.4 | How far a mixture is pushed away from neutral, 0-4. 0 makes everything grey; 1 is the true average; past about 2 the brightest mixtures leave the displayable range and are clamped per channel, which shifts their hue. |
| **Opacity ramp (colour comes from the group)** | the default heat ramp | Only the ramp's **alpha** is used here: transparent where there is nothing, opaque at the top. Its colours are ignored. |

A group whose label means "no group" (`0`, empty, `none`, `unknown`, `null` or `-1`) is drawn grey.

All the other heat controls - shape, saturation, response, minimum heat, depth, culling - work as in [Heat](heat.md).

The [Teams list](teams-list.md) shows each group's team-heat colour as its swatch in this mode. Hiding a group leaves every other group's colour where it was: hues come from the total group count, not from what is switched on, so two pictures stay comparable.

## For developers

### The palette

**Team colours** (under the swatches, and in the [Teams list](teams-list.md)) picks the palette, and it applies everywhere a team has a colour: team heat, figures, labels, range shells, legends and the Versus charts. It is remembered.

| Choice | What it is |
|---|---|
| **Auto** (default) | **Soft** for up to two teams, **Strong** from three (groups that name no team do not count). |
| **Soft** | The original look, described below: an even hue circle at one pastel lightness. Calm with two sides; with three or more the hues sit close together. |
| **Strong** | Distinct hues in a fixed order: blue and red for two sides, then teal, plum, indigo, brown, pink, gold, olive. Lightness varies too, so the first six stay apart for colour-blind eyes (checked under protanopia and deuteranopia simulation). Past nine groups the heat uses the circle below. |
| **Strong, alt.** | The same idea from orange and blue, then crimson, teal, violet, moss, lilac. |

With a strong palette each group keeps its own lightness as well as its hue: the heat target's fourth channel carries it, so a place one team holds is drawn in exactly that team's colour and a mixture takes the mean lightness.

The soft palette:

From [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Colours live on the **Oklab** colour plane at a fixed lightness (0.7) and chroma (0.115), so every group is equally bright and a red group does not read as hotter than a blue one.
- With *n* groups, the hue circle is divided into *n* equal parts and group *i* takes the **centre** of its part, `(i + 0.5) / n` of a turn. Any two groups are as far apart as the count allows, and opposites stay opposite whatever the count.
- At most **16** distinct hues are used. With more groups, ids are placed by repeated halving (bit-reversed ids: 0, ½, ¼, ¾, ⅛, …) so neighbouring ids do not share a hue; groups past 16 necessarily share.
- A group whose label means "no group" - `0`, empty, `none`, `unknown`, `null` or `-1`, ignoring case - is drawn **neutral grey** instead of taking a slice of the circle. Only the first such label in the group list is treated this way.

The default separation is 1.4 rather than 1 because, at 1, a mixture of five evenly spread hues *is* grey: correct and unreadable. A little above 1 keeps ties honest while making a 60/40 split visible.

### How it works

The heat target has four channels in this mode. Each sprite adds its density *v* to the first channel and *v* × the group's Oklab *a* and *b* coordinates to the second and third. At composite time the pixel's mixture is the density-weighted mean: *a* = G / R, *b* = B / R, scaled by the colour separation and converted to sRGB at the palette's lightness. Dividing by the accumulated density keeps the hue independent of how much data is there, and is why every density control goes on acting on the opacity alone.

The four-channel target costs four times the GPU memory of the single-channel heat target at the same resolution.
