---
title: Tactics board
nav_order: 9
---

# Tactics board

The **Tactics** tab plans moves on a level: figures placed where people will be, arrows for how they move, utility thrown, areas and notes, in steps that play one after another. It shares the canvas, camera and [level](levels.md) with the other tabs and nothing else; a plan is not data and draws no heat.

## Starting a plan

| Control | What it does |
|---|---|
| **Game** | Picks the sides and the figures the palette offers: Counter-Strike 2 (T, CT; players and utility), Valorant (Attack, Defense; players and generic abilities), Battlefield, Squad, Arma (infantry, ground vehicles, aircraft, boats), DCS / War Thunder / IL-2 (jets, propeller aircraft, helicopters, air defence, ground, ships, weapons), and Other. A plan that already has figures keeps its sides when the game changes. |
| **Plan name** | The name the plan is saved under. |
| **Valorant map** | With Valorant chosen: loads the list of maps from [valorant-api.com](https://valorant-api.com) and puts the chosen map's minimap down as the level, framed from the top. The image is fetched when chosen and never shipped. Riot's notice is shown while it is on screen (see below). |
| **Side** | The side the next figure, arrow or area belongs to; it takes the side's colour. |

Without a level the board is the flat ground plane. Load a level under **Level** to plan on a real map: a CS2 map exported with the CS2 tool, a level from the library, or a map picture.

## Tools

| Tool | Click | Notes |
|---|---|---|
| **Select** | A figure, a waypoint, an arrow, an area or a note selects it. | Shift+click adds or removes; Shift+drag draws a box round what to add. The selection gets a transform gizmo (see below); **Delete** removes it. |
| **Place** | Puts the chosen figure down. | A figure is chosen in the palette below; R turns the next one before it is placed. |
| **Arrow** | Each click adds a point; Enter, a double click or a right click ends it, Esc drops it. | **Move**, **Attack** (wider head) or **Watch** (a thin line at eye height). An arrow begun on a figure is that figure's route in this step: played back, the figure walks it, and the next step starts where it ended. |
| **Throw** | The thrower, then where it lands. | A dashed arc from the one to the other, and the chosen utility (smoke, flash, molotov, ...) appears where it lands and stays from this step on. |
| **Area** | The middle, then the edge. | A disc in the side's colour. |
| **Note** | Where the note goes; asks for its text. | Shown as a pin, and its text over it. |
| **Erase** | A figure, arrow, area or note. | Removes it from this step on; on its first step, removes it. |

**Undo** and **Redo** (Ctrl+Z, Ctrl+Y) step through every change. **Top view** looks straight down (orthographic), **3D view** returns to perspective, **Frame** fits the plan, or the level when the plan is empty.

**Figure size** scales every figure on the board; 1× is true size, which from far above is a few pixels for a person.

## Moving, turning and scaling

Everything on the board can be moved like in a 3D editor: figures, utility, markers, single waypoints and whole arrows, areas and notes. What is selected gets a gizmo at its middle:

| Mode | Keys | Handles |
|---|---|---|
| **Move** | W (or G) | An arrow per axis (X red, Y green and up, Z blue) moves along it; a square moves across its plane; the centre moves over the level under the pointer. |
| **Rotate** | E (or R) | A ring per axis turns about it. A single figure's rings are its own yaw, pitch and roll; a group turns about the world's axes round its middle. |
| **Scale** | R (or S) | Spreads or gathers the selection from its middle along an axis or every way; an area's radius grows with it. |

**Keys** switches between W / E / R (Unity, Unreal) and G / R / S (Blender); the keys pick the mode only while something is selected, and fly the camera otherwise. Hold **Ctrl** while dragging to snap a move to the **Grid** (metres) or a turn to the **Angle step**. **Snap to ground** (on by default) puts moved people, vehicles, markers, waypoints and areas on the level's surface; aircraft and helicopters keep their height, and a drag along the Y arrow never snaps. Dragging a handle never moves the camera. **Esc** cancels a drag, and every change is one step of Undo.

Waypoints show as dots on the shown step's arrows: click one to select it, drag it to move it, Delete to take it out. The **Selected** section shows the selection's place in metres, a figure's yaw, pitch and roll in degrees and an area's radius, each to type.

## Timing

A figure's route is timed: each segment takes its length over the level - sampled on the surface every couple of metres, so a hill or a staircase between two points counts - at the speed of its movement **mode** for that figure in that game, plus any **wait** at a waypoint. Infantry crawl, crouch, walk (silent), run or sprint; vehicles and boats crawl, go cautiously, normally or rush; aircraft and helicopters fly slow, at cruise, at combat speed or at maximum. A mode the game has not got (CS2 has no sprint) takes the nearest one it has. How a slope slows depends on the game: in CS2 and Valorant only the horizontal distance counts, as in the games; mil-sims slow infantry uphill (Tobler's hiking function) and vehicles by grade.

The speeds come from per-game tables with their sources (see [Movement speeds](tactics-speeds.md)): CS2 by the weapon held, from the game's weapon definitions; Valorant by weapon; Battlefield, Squad, Arma and the air games by vehicle type and class. **Moves as** picks a figure's profile (a weapon, a vehicle type); **Own (m/s)** overrides any mode for that figure.

Each waypoint shows the time from the last one and the time since the plan's start ("+3.9 s · 0:12"). The selected figure's route lists every segment with its mode, length and time, the wait and the arrival. **Arrivals** under **Timing** puts every routed figure on one time line, first arrival on top. With **Play in real time** (on by default) a step lasts until its slowest route arrives and each figure moves at its own speed; **Seconds** is then the step's least length. **Level units per metre** says what the level is in: 39.37 for CS2 maps (game units), 1 for metre maps.

## Compare with match data

**Load match files…** reads CS2 match tables of the map (the CS2 tool's Parquet files, as many as wanted; only the columns needed, in the background); **Use loaded data** takes the data loaded in the viewer. Then:

- **Earliest arrival on the map** colours the map by the time since round start that a player first reached each spot - the **fastest** over all rounds, or the **typical** round (median) - green early to red late, for one side or both. It shows what is possible when.
- The selected route is compared with what players achieved from its start (or from the round's start) to its end, each end a disc of the set radius: "Fastest observed 14.2 s, p10 15.0 s, median 18.3 s over 41 runs; your plan 15.1 s".
- The speeds players really moved at - running, walking, crouching, from the tables' walking and duck columns - in m/s.

## Steps

The bar below the view holds the steps. A plan starts with one; **+** adds one, and each figure starts it where its route in the last step ended; **−** removes the one shown. **Seconds** is how long the shown step takes when played. **▶** (K) plays from the shown step to the end: figures with a route walk it, figures moved to a new place in the next step slide there, the rest stand. While a step is shown, each figure's place in the next step is drawn as a faint ghost, and the last step's arrows faintly under this one's.

## Saving

**Save** writes the plan as `<name>.h3dplan.json` (plain JSON: sides, steps, figures with a place per step, arrows, areas, notes); **Open** reads one back. A file of another version, or one that is not a plan, is refused with the reason. **Clear** empties the plan; Undo brings it back.

## Figures

Every figure is built by the viewer itself: simple shapes to a type's published size, with the features that tell it from its neighbours - a tank's road wheels and turret, the guns, missiles and radars of an air-defence vehicle, an aircraft's wing plan, tail and engines, a helicopter's rotors and stub wings. Nothing is taken from a game. A design a game invented is shown as the generic figure of its class. See [Figure replay](figure-replay.md) for how data finds its figure.

## Riot's notice

Valorant maps are shown under Riot Games' "Legal Jibber Jabber" policy, which allows free community projects to use them and asks for this notice wherever they appear: *3DHeat was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.* The abilities on the board are generic shapes, not Riot's art.
