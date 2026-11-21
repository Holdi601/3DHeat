---
title: Test data (developer tools)
parent: Getting data in
nav_order: 5
---

# Test data (developer tools)

Made-up data of any size, for checking what a machine can handle and for debugging the viewer. It is a developer tool, off by default: to analyse something, open your own files ([Loading files](loading-files.md)), or make the [demo data](demo-data.md) to try the viewer.

1. Turn on **Developer tools** in the settings (the gear at the top of the side panel). `?dev` in the address turns them on for one page without changing the setting.
2. In the Heatmap sidebar, open **More** at the end of the **Load** group, then **Developer tools** → **Test data (performance check)**.
3. Set **Rows (millions)**. Try 1 first: the default of 8 million is heavy for a first try.
4. Press **Generate test data**. It replaces the loaded data.

![1 million rows, 8 teams, drawn in Team heat, with the Developer tools open in the sidebar](assets/img/en/synthetic-generator-team-heat.webp)

Its movement is shaped like a battle royale match - teams start apart, then are squeezed together - because uniform noise looks fine at any budget and hides exactly the artefacts worth catching. That makes it the way to check whether a given number of rows, sprite radius and budget hold a usable frame rate *before* committing a large real load to it; the smoke tests and performance probes draw it too.

The start screen's small link **No data yet? Try a generated sample** makes the same data at one million rows, without the developer tools.

With the developer tools on, the viewer also shows its internals: the full [stats overlay](performance-and-stats.md#the-stats-overlay) over the view, **Sprites / frame** and **Progressive refinement** in the Performance panel, the [sprite pixel clamps](sprite-shape.md), and the tab's heap and every column's bytes in **Memory in use**.

## Controls

| Control | Default | Meaning |
|---|---|---|
| **Rows (millions)** | 8 | Rows to generate. Rounded down to a whole number of ticks for every player. |
| **Teams** | 8 | Number of groups (at least 1). |
| **Per team** | 12 | Players per group (at least 1). |
| **Map half-extent (m)** | 4000 | Half the width of the playable area on X and Z. |
| Estimate line | | "≈ X GB of RAM, Y GB on the GPU after quantisation." (about 26 bytes of RAM and 8 bytes on the GPU per row). |
| **Generate test data** | | Generates in the ingest worker, with progress, and replaces any loaded dataset. |

Generation runs in the background worker, so tens of millions of rows do not freeze the page. Tests reach it without the developer tools' UI, through `window.__3dheat.generate(rows)` on the dev server.

## What it generates

From [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Columns:** position, time, person (`P000`, `P001`, ...), group (`Team 1`, `Team 2`, ...), yaw and pitch, and lifetimes. No session column and no filter columns.
- **Time:** one sample per player every 0.25 s, starting at 0 (relative time, no wall clock).
- **Movement:** each team starts in its own sector of a ring at 55-95% of the half-extent. A safe circle centred near the middle (offset at random by up to a quarter of the half-extent) shrinks to 8% of the half-extent in six phases with plateaus; every player steers towards a wandering point inside it, with damping and noise. Height undulates between 0 and 220 m.
- **Look direction:** yaw along the direction of travel, pitch from the vertical speed.
- **Repeatable:** the random seed is fixed (1337), so the same settings always produce the same data.

Every heat mode, box replay and line heat (whole tracks, since there is no event column) work on it. The Lifetime history works too.
