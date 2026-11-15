---
title: Figures in the figure overlay
parent: Figures
nav_order: 2
---

# Figures in the figure overlay

This page is about turning the boxes into little 3D figures of what each unit really was, and about the smoke and fire that figures leave behind. The controls of the replay itself are on [Match replay](match-replay.md).

In [box replay](box-replay.md) and the Match tab's figure replay, **Figures instead of boxes** (on by default) draws each live person as the figure of what they are: a soldier on foot, the tank someone drives, the aircraft a Tacview track is. The figure has the box's colour, place and heading. For aircraft and missiles it also has pitch and, where the data has a Roll column, bank. **Figure size** scales them; 1 times is true size. Clicks on a figure answer as clicks on its box did.

## Which figure

The data's own name and type columns decide. The full rules, with the column names, are on [Figures](figures.md#which-figure-a-unit-gets). Data with neither kind of column is data of people: everyone is a soldier.

The match is cached per label, so a frame costs only the placing. A data unit is a metre unless the data says how big one tracked thing is (the CS2 export says a player is 32 units across); figures are scaled to match.

An optional pack of your own figures can replace catalogue figures on your machine; see [Figures](figures.md#an-optional-local-figure-pack).

## Effects

Event rows that leave something behind for a while are drawn where they happened for as long as it lasts, in the colour of whoever caused them: a smoke (about 18 s), a molotov or incendiary (7 s), a flash (about a second) and an HE burst (under a second), a decoy (15 s), a planted bomb (40 s). They come from an event column (Event, Events) whose label is `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` or `plant` - the CS2 export writes them at the detonation.

## Match replay: Tacview's tools

Cameras, bookmarks, the tactical display, statistics, labels, **Drop lines**, the event list and the chart window are described on [Match replay](match-replay.md). [Tacview parity](tacview-parity.md) lists every Tacview feature and where it stands.
