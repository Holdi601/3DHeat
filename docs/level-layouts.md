---
title: Game-mode layouts
parent: Levels and background geometry
nav_order: 5
---

# Game-mode layouts

A map tool can write what each game mode of a level is played over beside the level: `<Level>.layouts.json` (the Battlefield tool's `layouts` for Battlefield 4 and 1, the CS2 tool's `layouts`). With no objectives of a battle of its own, the **Objectives** panel draws the layout of the mode the data is played in on the level:

- capture zones and bomb sites, in their owner's colour;
- each team's play area, outlined and faintly filled in the team's colour;
- **Out of bounds**: hatched in a team's colour where that team is out of bounds (inside the other side's play area, outside its own);
- spawns, grouped by team and by the capture point that owns them; headquarters, bases and the mode's objectives (M-COMs, telegraphs, bomb targets).

Each kind has its own toggle. The layout is picked from the data's `mode` column (`ConquestLarge0`, `RushLarge0`, `competitive`...); **Layout** shows another mode, or one stage of a staged mode (Rush, Breakthrough). Positions are the level's own, so the layout lies on the level whatever axes the data has.

Where the file comes from: the local server answers it from beside the level in the levels folder ([Level library](level-library.md)); otherwise pick the `.layouts.json` with the data. The format is described in [`levelLayouts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/levelLayouts.ts).
