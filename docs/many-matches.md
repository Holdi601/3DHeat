---
title: Many matches at once
nav_order: 10
---

# Many matches at once

**Many matches at once** plays lots of matches on top of each other, so you see where every match's players usually go. Use it to compare hundreds or thousands of matches in one picture.

Each match starts at its own beginning and its units move as figures. The files go straight into the graphics card and no full table is built, so it plays smoothly where a normal load would run out of memory.

![Ten tank matches laid over each other, one colour per match](assets/img/en/many-matches.webp)

## How to use it

1. Open **Many matches at once** in the Heatmap sidebar.
2. Press **Files…** (pick many files), **Folder…** (a folder and its subfolders) or **Add folder…** (add to what is loaded).
3. The viewer switches to the figure overlay and starts at the beginning. Press **Play**.

Each file is one match (or holds several). Parquet files and [`.3dheat`](container.md) containers work. A file needs a position, a time and a unit column; name, type and side columns are kept. Other files, and the side files of converters (flight, messages, events, chat, objectives), are skipped. For a normal table, see [Getting data in](getting-data-in.md).

## Settings

| Setting | What it does |
|---|---|
| **By team** / **By match** | Colour by side, or a colour per match. |
| **Mark where units died** | A mark where each unit died, for 10 s, 30 s, 120 s, or all so far. |

The panel shows how many matches, units, rows and positions were read, the memory used and the load time. *Room for* is how many more positions the graphics card could still take. *Figures from* is the size on screen below which a unit is drawn as a small dart instead of its figure.

The look of the figures uses the same controls as the [match replay](match-replay.md#figures): **Figure size**, **Smallest figure on screen** and **At a distance**.

## Tips

- When everything would not fit in memory, positions are thinned (only a position every few metres is kept) and the panel says so.
- The heat modes also work on the overlay's data.
- For statistics over thousands of matches without drawing them, see [Mass analysis](mass-analysis.md).
