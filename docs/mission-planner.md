---
title: Mission planner
parent: Tactics board
nav_order: 3
---

# Mission planner

The [tactics board](tactics-board.md) can open a mission of DCS World, War Thunder, Arma 3, IL-2 Great Battles or Arma Reforger, let you change it on the map, and write it back as a mission the game loads: routes moved, waypoints added, tasks given, new flights and ground groups placed, groups taken out. Everything else in the mission stays as the mission editor wrote it.

The buttons are in the board's **File** section: **Open mission…** reads any of them, **Save as mission…** writes the board for the game you pick. DCS comes first below; [War Thunder](#war-thunder-user-missions), [Arma 3](#arma-3-missions), [IL-2](#il-2-great-battles-missions) and [Arma Reforger](#arma-reforger-layers) work the same way with what their missions hold.

## The mission's level

When a mission is opened, its level is loaded from the levels folder, if it is there: for DCS the area of the mission's theatre that holds most of its units, for the other games the level of the mission's map (a War Thunder level, an Arma 3 or Reforger world, an IL-2 map). A level you had loaded is replaced unless it is that one already; the chip over the view says which level came in, with a way to change it. Without a levels folder (or without that level in it) the line under the button says which level the mission is set on.

Most levels lie in their game's own metres, so a mission falls on its level as it is. An IL-2 level lies on the earth (metres east and north of a point, as IL-2 recordings do); its `.json` says how, the mission is moved onto it when it is opened, and moved back into the game's metres when it is written, to well under a millimetre.

## Opening a DCS mission

**Open mission…** and pick a `.miz`. The board is replaced by the mission (Undo brings the old board back), and a short summary says what came in: how many groups, units and waypoints, which theatre, the start time and date, and the weather.

| In the mission | On the board |
|---|---|
| Coalitions (Blue, Red, Neutral) | One layer each, so one side's planners can hide the other side |
| Groups of planes, helicopters, vehicles, ships and statics | Every unit a figure where the mission puts it, facing its heading, with its name |
| A group's route | A route for every unit of the group (the wingmen keep their places off the lead), with the leg speed as the unit's own speed and the times the mission holds waypoints to as **Be there** times |
| Waypoint tasks | [Unit tasks](tactics-tasks.md): Orbit as an orbit (a racetrack between its waypoint and the next), AttackGroup and EngageGroup as an attack on that group, Bombing as a strike, an engagement in a zone as close air support, SEAD or a sweep (by the targets it may engage), Escort and Follow on their group, FireAtPoint as suppression, Hold as a hold, the ROE and alarm state options as weapons and alarm states, a stop condition as the task's time. Anything else (Land, EPLRS, tanker, a switched waypoint) comes in by its DCS name. |
| The group's main task (CAP, CAS, SEAD …) | A task with that name, from the start |
| Airfields where routes take off and land, FARPs, trigger zones, each side's bullseye | A **Mission places** layer |
| Skill, unit and group ids, start time, date, weather, briefing | Kept with the plan, for writing it back |

DCS positions are the theatre's own metres (x north, y east), which is how the DCS levels lie, so the mission falls on its theatre's level where it belongs.

The plan remembers which figure is which unit of which group, also in a saved `.h3dplan.json`. The `.miz` itself is kept only while the viewer is open; after a reload, **Save as mission** asks for it again.

## Saving a DCS mission

**Save as mission…** with **DCS World** as the game. The dialog asks what to write into:

- **The mission it came from.** The original `.miz` is patched and saved as a new file (`<name> (3DHeat).miz`); the original is never overwritten.
- **Another mission file** (**Pick a .miz file…**): the same, into a mission you choose, for example one of the same theatre with your own triggers.
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

**Open mission…** reads a War Thunder user mission as the mission editor saves it: a text `.blk` from the game's `UserMissions` folder. **Save as mission…** with **War Thunder** writes the board back into it (saved as `<name> (3DHeat).blk`), or makes a new single mission on a level you name (the level's file name, such as the one in the mission's `level` line, without `levels/` and `.bin`).

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

## Arma 3 missions

**Open mission…** reads an Arma 3 mission: a `mission.sqm` as the Eden editor saves it (or in the older pre-Eden layout), or a mission `.pbo` with its `mission.sqm` inside. A binarised `mission.sqm` is read back as text. The world comes from the mission's name (`Name.Altis.pbo`, a `Name.Altis` folder); a `mission.sqm` picked on its own does not name it, so the world is taken from the terrain addons the mission needs, and the summary says so.

| In the mission | On the board |
|---|---|
| Sides (BLUFOR, OPFOR, Independent, Civilian) | One layer each |
| Groups and their soldiers, vehicles, aircraft and boats; empty vehicles | Every unit a figure where it stands, facing its direction; a unit's kind from the game's own catalogue where the levels folder has it (its class and the real vehicle it stands for), else from the words of its class name |
| A group's waypoints | Its route; a waypoint's type as a task (Seek and Destroy a sweep, Destroy an attack, Guard, Hold, Sentry a screen, Support an overwatch, Cycle a patrol back round the route, Loiter an orbit), others (Get In, Unload …) by their names; its combat mode as the weapons state and its behaviour as the alarm state |
| Markers, triggers | Notes and objectives, areas, on **Mission places** |
| Props (walls, boxes, signs) | Left off the board; they stay in the file |
| Date, time of day, overcast | Kept with the plan; the summary shows them |

**Save as mission…** with **Arma 3** writes the board back into the mission it came from, value by value: what the board left as it was stays byte for byte, and a plan with no changes gives the very same file. A moved or turned unit gets a new `position` and `angles` (`azimut` in the older layout); a figure changed to another kind a new class; a moved waypoint a new position; a waypoint's tasks its type, combat mode and behaviour. Waypoints added or taken away, units joining a group or leaving it, groups added or taken out: the list they are in is written again, the items that stay keeping their text under their new number. New entities get ids past the editor's, links to what was taken out go with it, new soldiers and vehicles get stock classes of their side, and new vehicles a stock crew. A binarised `mission.sqm` that changed is written as text, which the game reads the same; a `.pbo` gets its `mission.sqm` replaced and its checksum made again. A new mission is a minimal Eden mission for a world, with the plan's groups, start, date and overcast: put the `mission.sqm` into a mission folder named `<name>.<world>` and save it once in Eden so it lists the addons it needs.

Tasks Arma has no waypoint for (an escort, a phase line) are listed as warnings, as are routes given to an empty vehicle.

## IL-2 Great Battles missions

**Open mission…** reads an IL-2 mission as the mission editor saves it in text (`.Mission`); the binary `.msnbin` the game runs is not read, so open it in the editor and use the `.Mission` saved beside it. Planes, vehicles (the drivable tanks too), ships and trains are figures on their coalition's layer (Allies Blue, Axis Red), facing their heading. A leader and the units whose entities follow it are one group. Each group's waypoints, in the order the mission's links lead through them, are its route, with their speeds. Attack-area, attack-target and cover commands come in as close air support, attack and escort at the waypoint that triggers them; other commands come in by name. Airfields, icons, objectives and check zones go on **Mission places**. When the map's level is loaded, the mission is moved onto it from the game's metres, and written back in them.

**Save as mission…** with **IL-2 Great Battles** patches the mission it came from (`<name> (3DHeat).Mission`) or makes a new one on a map. A moved or turned unit gets its new position and heading, with its entity. A moved waypoint gets its position and speed. A waypoint taken away is cut out of the links: what led to it now leads to what it led to. A new waypoint is linked in after the one before it. New units are objects with entities following their leader, and a new group starts at the mission's beginning. Groups taken off the board leave with their own waypoints and commands. IL-2's tasks are command blocks the editor links up; tasks added on the board are listed as warnings.

## Arma Reforger layers

**Open mission…** reads a scenario layer as the Workbench saves it in text (`.layer`, or a world `.ent` saved as text); the game's own worlds ship in a binary form and are refused with the reason. Groups (`SCR_AIGroup`) are one figure each, with the waypoints their `m_aStaticWaypoints` name as their route; characters and vehicles placed on their own are a figure each; Scenario Framework slots that spawn a group, character or vehicle come in with the slot waypoints of the layers their waypoint set names. Waypoints keep their type: Search and Destroy as a sweep, Attack, Defend, Wait as a hold, Cycle as a patrol back round the route, Follow, Suppress, Observation Post as overwatch, Scout as recon; others (Get In, Get Out …) by their names. Military bases, player spawn points, capture areas and Scenario Framework areas and tasks go on the **Mission places** layer. The side is the faction the entity or its prefab names (US BLUFOR, USSR OPFOR, FIA Independent). Positions are the world's (x east, z north), as the Reforger levels lie; a child entity's place is worked out through its parents.

**Save as mission…** with **Arma Reforger** patches the layer: an entity the board left as it was stays byte for byte; moved or turned units get new `coords` and heading in their parent's frame; waypoints moved, added or taken out update the waypoint entities and the group's list (a waypoint no other group uses leaves the file); a waypoint given another task gets that task's stock prefab; new figures become stock US, USSR or FIA fire teams or vehicles; entities taken off the board are taken out. A new layer for Everon, Arland or Kolguyev holds the plan's groups and vehicles, to add to a scenario in the Workbench. Weapons and alarm states, and changes to Scenario Framework routes beyond moving their waypoints, are listed as warnings.

## Falcon BMS

Falcon BMS campaigns and tactical engagements (`.cam`, `.tac`) are not read. They are a container of parts, most of them compressed binary records whose layouts change with the BMS version; reading their units and flights is possible but large work, and writing them back is not realistic. A planned flight's steerpoints could go into the pilot's text data cartridge (`.ini`) instead.

## Not yet

- Trigger zones and markers drawn on the board are not written into the mission.
- Missions written by the board have not yet been flown in the games by this project; the writers were checked by reading the results back: several hundred DCS, War Thunder and Arma 3 missions, the few IL-2 text missions there were, and Reforger scenario worlds turned into text (no layer saved by the Workbench was at hand).
- IL-2's binary `.msnbin` and the Reforger game's binary worlds are not read.
- War Thunder's triggers (attack orders, spawns, objectives) are not read onto the board.
