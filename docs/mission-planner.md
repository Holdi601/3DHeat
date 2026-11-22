---
title: Mission planner
parent: Tactics board
nav_order: 3
---

# Mission planner

The [tactics board](tactics-board.md) can open a DCS World mission or a War Thunder user mission, let you change it on the map, and write it back as a mission the game loads: routes moved, waypoints added, tasks given, new flights and ground groups placed, groups taken out. Everything else in the mission stays as the mission editor wrote it.

The buttons are in the board's **File** section. DCS comes first below; [War Thunder](#war-thunder-user-missions) works the same way with what its missions hold.

## Open DCS mission…

Pick a `.miz`. The board is replaced by the mission (Undo brings the old board back), and a short summary says what came in: how many groups, units and waypoints, which theatre, the start time and date, and the weather.

| In the mission | On the board |
|---|---|
| Coalitions (Blue, Red, Neutral) | One layer each, so one side's planners can hide the other side |
| Groups of planes, helicopters, vehicles, ships and statics | Every unit a figure where the mission puts it, facing its heading, with its name |
| A group's route | A route for every unit of the group (the wingmen keep their places off the lead), with the leg speed as the unit's own speed and the times the mission holds waypoints to as **Be there** times |
| Waypoint tasks | [Unit tasks](tactics-tasks.md): Orbit as an orbit (a racetrack between its waypoint and the next), AttackGroup and EngageGroup as an attack on that group, Bombing as a strike, an engagement in a zone as close air support, SEAD or a sweep (by the targets it may engage), Escort and Follow on their group, FireAtPoint as suppression, Hold as a hold, the ROE and alarm state options as weapons and alarm states, a stop condition as the task's time. Anything else (Land, EPLRS, tanker, a switched waypoint) comes in by its DCS name. |
| The group's main task (CAP, CAS, SEAD …) | A task with that name, from the start |
| Airfields where routes take off and land, FARPs, trigger zones, each side's bullseye | A **Mission places** layer |
| Skill, unit and group ids, start time, date, weather, briefing | Kept with the plan, for writing it back |

DCS positions are the theatre's own metres (x north, y east), which is how the DCS levels lie, so the mission falls on its theatre's level where it belongs: load that level (the summary says which) to plan on its ground.

The plan remembers which figure is which unit of which group, also in a saved `.h3dplan.json`. The `.miz` itself is kept only while the viewer is open; after a reload, **Save as DCS mission** asks for it again.

## Save as DCS mission…

The dialog asks what to write into:

- **The mission it came from.** The original `.miz` is patched and saved as a new file (`<name> (3DHeat).miz`); the original is never overwritten.
- **Another mission file** (**Pick a .miz…**): the same, into a mission you choose, for example one of the same theatre with your own triggers.
- **A new mission** for a theatre you pick: a minimal mission with CJTF Blue and CJTF Red, the board's groups in it, and the start time, date and weather of the mission the plan came from (default ones otherwise).

Before anything is written it shows how many groups, units and waypoints the mission will hold, which groups change, which are added and taken out, how many stay as they were, and a list of what the mission cannot hold as the board has it. **Save .miz** downloads the file.

### What changes in the file

The mission is edited as text, value by value. A group whose units, route and tasks are as they came in is left byte for byte; when nothing changed at all, the file is the very same file. Every other file of the `.miz` (options, warehouses, briefing pictures, sounds, scripts) is copied as it was stored.

| On the board | In the mission |
|---|---|
| A unit moved or turned | Its x, y, height and heading (and an aircraft's `psi`); the group's place and first waypoint move with the lead |
| A waypoint moved | Its x and y (and an aircraft's height); the leg's speed where the leg changed |
| A **Be there** time set or cleared | The waypoint's ETA, locked or unlocked |
| A waypoint added or taken away | The group's point list written again: the waypoints that stay keep everything they had (type, airfield, parking, formation, properties, tasks); new ones are turning points |
| A task changed, added or taken away at a waypoint | That waypoint's task list: the entries the board left keep their text, the board's new ones are written, the ones the board does not show (switched off, options it has no state for) stay |
| A figure changed to another kind | The unit's type (check its loadout and livery in the Mission Editor) |
| A figure placed that no group holds | A new group in its side's first country (a side without one gets CJTF Blue or Red); figures that share a task form one group, and a figure sharing a task with a mission group joins it |
| All figures of a group deleted | The group taken out |
| A layer hidden | Its groups are left as they are in the file |

An aircraft's waypoint drawn on the ground (where a click on the map puts it) is flown at the height of the waypoint before it; a new flight placed on the ground starts in the air. New flights get a default fuel load, no weapons and a callsign: set them in the Mission Editor.

### Board tasks as DCS tasks

| Board task | DCS task |
|---|---|
| Orbit, patrol, screen (aircraft) | Orbit (a racetrack between its two points, else a circle, at its height and speed) with an engagement of air targets |
| Attack on a figure | AttackGroup on that figure's group |
| Attack on a point | An engagement of ground targets in a zone (aircraft), FireAtPoint (ground units) |
| Close air support, SEAD, sweep | An engagement in the task's area of ground targets, air defences, or aircraft |
| Strike | Bombing of its point |
| Intercept | EngageGroup on the figure's group, else an engagement of air targets |
| Escort, follow | Escort (aircraft) or Follow, on the figure's group |
| Defend, hold, guard, block, overwatch | Hold (ground units), a circling orbit (aircraft) |
| Suppress | FireAtPoint with the task's radius |
| ROE, alarm state | The ROE and alarm state options |
| A task's time limit | A stop condition after that many seconds |

A new group's main task follows its tasks (SEAD, CAS, Ground Attack, Fighter Sweep, Intercept, Escort, CAP); a mission's own groups keep theirs. A ground patrol, a ground sweep and the board's other tasks (seize, breach, phase lines …) have no DCS task; they are listed as warnings and the route is written without them.

## War Thunder user missions

**Open War Thunder mission…** reads a user mission as the mission editor saves it: a text `.blk` from the game's `UserMissions` folder. **Save as War Thunder mission…** writes the board back into it (saved as `<name> (3DHeat).blk`), or makes a new single mission on a level you name (the level's file name, such as the one in the mission's `level` line, without `levels/` and `.bin`).

| In the mission | On the board |
|---|---|
| Unit blocks in `units`: aircraft (`armada`), tanks and wheeled vehicles, infantry, ships, structures | One figure per block, named as the block, on its army's layer (army 1 Blue, army 2 Red), where its matrix puts it and facing where it faces. A block stands for a whole flight or platoon (`count`); it stays one figure. |
| A unit's `way` waypoints | Its route, with each waypoint's speed |
| `attack_type` (fire at will, return fire, hold fire) | The unit's weapons state |
| Level, time of day, weather, date | Kept with the plan; the summary shows them |
| `areas` | Spheres, boxes and cylinders as areas, points as notes, on the **Mission places** layer |

War Thunder's world is x east, y up, z north, and the War Thunder levels lie in the viewer with z mirrored, so a mission falls on its level where it belongs.

Writing back works as for DCS: a unit block the board left as it was stays byte for byte; a moved or turned unit gets a new matrix, a moved waypoint a new position, a changed weapons state a new `attack_type`, a figure changed to another kind a new `unit_class`; waypoints added or taken away rewrite the unit's `way` block (the waypoints that stay keep their text); a figure no block holds becomes a new unit block; a block whose figure was taken off the board is taken out. Triggers, objectives and areas stay as they were.

War Thunder gives units their tasks in the mission's triggers, not at their waypoints, so only the weapons state is written; every other board task is listed in the summary as one to set in the mission editor. A new mission makes the first Blue unit the player's.

## Not yet

- The board does not load the theatre's or level's level by itself; load it from the level panel.
- Trigger zones and markers drawn on the board are not written into the mission.
- Missions written by the board have not yet been flown in the games by this project; the writers were checked by reading the results back, over several hundred missions of each game.
- War Thunder's triggers (attack orders, spawns, objectives) are not read onto the board.
