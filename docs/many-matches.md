---
title: Many matches at once
nav_order: 63
---

# Many matches at once

The **Many matches at once** section lays hundreds or thousands of matches over each other, each from its own start, as moving figures. It reads the files straight into the graphics card and never builds a full table, so it plays at full frame rate where a normal load would run out of memory.

![Ten tank matches overlaid, coloured by match](assets/img/en/many-matches.webp)

## How to use it

1. Open **Many matches at once** in the Heatmap sidebar.
2. Press **Files…** (pick many files), **Folder…** (a folder and its subfolders) or **Add folder…** (add to what is loaded).
3. The viewer switches to the figure overlay and starts at the beginning. Press **Play**.

Each file is one match (or holds several). It needs a position, a time and a unit column; name, type and side columns are kept. [`.3dheat`](container.md) containers are opened; side files of converters (flight, messages, events, chat, objectives) are skipped.

## Settings

| Setting | What it does |
|---|---|
| **By team** / **By match** | Colour by side, or a colour per match. |
| **Mark where units died** | A mark where each unit died, for 10 s, 30 s, 120 s, or all so far. |

The panel shows how many matches, units, rows and positions were read, the memory used, the load time, how many more keys would fit (*Room for*), and from what size on screen figures are drawn.

## Tips

- When everything would not fit in memory, positions are thinned (only every few metres kept) and the panel says so.
- The heat modes also work on the overlay's data.
- For statistics over thousands of matches without drawing them, see [Mass analysis](mass-analysis.md).
