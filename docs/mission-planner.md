---
title: Mission planner (DCS)
parent: Tactics board
nav_order: 3
---

# Mission planner (DCS)

The [tactics board](tactics-board.md) can open a DCS World mission, let you change it on the map, and write it back as a mission DCS loads: routes moved, waypoints added, tasks given, new flights and ground groups placed, groups taken out. Everything else in the mission stays as the mission editor wrote it.

Both buttons are in the board's **File** section.

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

## Not yet

- The board does not load the theatre's level by itself; load it from the level panel.
- Trigger zones and markers drawn on the board are not written into the mission.
- New missions have not yet been flown in DCS by this project; the patched missions were checked by reading them back over several hundred missions.
- War Thunder user missions (`.blk`) are the next format.
