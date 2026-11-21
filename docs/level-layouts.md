---
title: Game-mode layouts
parent: Levels and background geometry
nav_order: 5
---

# Game-mode layouts

A map tool can write what each game mode of a level is played over beside the level: `<Level>.layouts.json`. The `layouts` commands of the Battlefield (4 and 1), CS2, War Thunder (`heat3d-wt-level layouts`: each mission and difficulty), DCS (airbases, runways and parking stands), R6 Siege (bomb sites) and Dota 2 (towers, bases, spawns) tools write them. With no objectives of a battle of its own, the **Objectives** panel draws the layout of the mode the data is played in on the level:

- capture zones and bomb sites, in their owner's colour;
- each team's play area, outlined and faintly filled in the team's colour;
- **Out of bounds**: hatched in a team's colour where that team is out of bounds (inside the other side's play area, outside its own), and any area a layout marks as out of bounds (ground a mission excludes, a spawn's kill area);
- spawns, grouped by team and by the capture point that owns them; headquarters, bases and the mode's objectives (M-COMs, telegraphs, bomb targets).

Each kind has its own toggle. The layout is picked from the data's `mode` column (`ConquestLarge0`, `RushLarge0`, `competitive`...); **Layout** shows another mode, or one stage of a staged mode (Rush, Breakthrough; a War Thunder battle-rating tier, an R6 site). Positions are the level's own, so the layout lies on the level whatever axes the data has.

On the **Tactics** board the layout is drawn with or without data, as the plan's reference: the **Objectives** section under the level picks the layout and its kinds, and lists its spawns; **Place** puts the chosen figure on a group's next spawn point, **All** one on each. A DCS mission read onto the board names its airbases from the theatre's layouts.

Where the file comes from: the local server answers it from beside the level in the levels folder, also when the level sits in a folder of its own a few folders down ([Level library](level-library.md)); otherwise pick the `.layouts.json` with the data. The format is described in [`levelLayouts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/levelLayouts.ts).

## Spawns

**Spawns**, in the **Objectives** panel, picks how the layout's spawns are drawn. The choice is the same in the heat, the replay and on the **Tactics** board.

- **Off**: no spawns.
- **Groups**: one ring per team, owning flag and stage.
- **Every point**: each spawn point as a small marker in its team's colour, with a tick for its heading. A vehicle spawn is a square with a glyph: tank, jet, helicopter, boat, gun, car, horse or plane. **Lines to the flag** joins each point to the capture point or HQ that owns it.

**Flag**, **Team** and **Stage** narrow the display to one capture point, one team or one stage. In a replay whose data has capture events, a flag's spawns fade while the other side holds it. Markers keep their size at any zoom. The GPU draws them as one instance per point, so tens of thousands stay smooth.

A spawn entry needs only a `position`. It may also carry:

- `team`, `heading`, `stage` (or `stages`);
- `baseId`, the `id` of the objective that owns it;
- `baseSource`: how the owner is known, from the game's data (`link`, `channel`, `prefab`) or only by distance (`nearest`);
- `rule`: when it can be used (`flag`, `hq`, `stage`, `team`, `free`);
- `vehicle`, `vehicleClass`, `vehicleKind`.

The Battlefield tool writes all of these for Battlefield 6, 4 and 1. Any other game's layouts get the same display; a kind word in `vehicle` (War Thunder's `ground`, `aircraft`, `ship`, `helicopter`, `convoy`) picks the glyph.
