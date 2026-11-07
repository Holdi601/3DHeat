---
title: Synthetic generator
parent: Getting data in
nav_order: 5
---

# Synthetic generator

The **Dataset** panel can generate a dataset instead of loading one. It is meant for two things: trying the viewer without data of your own, and checking whether a given number of rows, sprite radius and budget hold a usable frame rate on a machine *before* committing a large real load to it. Its movement is shaped like a battle royale match - teams start apart, then are squeezed together - because uniform noise looks fine at any budget and hides exactly the artefacts worth catching.

## Controls

| Control | Default | Meaning |
|---|---|---|
| **Rows (millions)** | 8 | Rows to generate. Rounded down to a whole number of ticks for every player. |
| **Teams** | 8 | Number of groups (at least 1). |
| **Per team** | 12 | Players per group (at least 1). |
| **Map half-extent (m)** | 4000 | Half the width of the playable area on X and Z. |
| Estimate line | | ≈ rows × 26 bytes of RAM and rows × 8 bytes on the GPU. |
| **Generate** | | Generates in the ingest worker, with progress, and replaces any loaded dataset. |

Generation runs in the background worker, so tens of millions of rows do not freeze the page.

## What it generates

From [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Columns:** position, time, person (`P000`, `P001`, ...), group (`Team 1`, `Team 2`, ...), yaw and pitch, and lifetimes. No session column and no filter columns.
- **Time:** one sample per player every 0.25 s, starting at 0 (relative time, no wall clock).
- **Movement:** each team starts in its own sector of a ring at 55-95% of the half-extent. A safe circle centred near the middle (offset at random by up to a quarter of the half-extent) shrinks to 8% of the half-extent in six phases with plateaus; every player steers towards a wandering point inside it, with damping and noise. Height undulates between 0 and 220 m.
- **Look direction:** yaw along the direction of travel, pitch from the vertical speed.
- **Repeatable:** the random seed is fixed (1337), so the same settings always produce the same data.

Every heat mode, box replay and line heat (whole tracks, since there is no event column) work on it. The Lifetime history works too.
