---
title: Tactics board
nav_order: 12
has_children: true
---

# Tactics board

The **Tactics** tab is a drawing board for a team plan: you put little figures on a map, draw arrows for where they go, and press play to watch it happen. Use it to plan a round or an attack before you play. It shares the canvas, camera and [level](levels.md) with the other tabs and nothing else; a plan is not data and draws no heat.

## Your first plan

1. Open the **Tactics** tab. Pick the **Game** (for example Counter-Strike 2) and, for Valorant, press **Load Valorant maps** and pick a **Map**. Or load a [level](levels.md) first.
2. Pick a **Side** (it sets the colour) and press **Top view**.
3. Choose **Place**, pick a figure in **Figures** (use **Search figures** to find one) and click on the map. Place two or three.
4. Choose **Waypoints** (`3`), click on a figure, click each waypoint along the way it should go, and finish the route with **Enter**, a double click, a right click or **Esc**. A ring with a cross marks where it ends.
5. Press **+** under the view to add step 2. Each figure starts where its arrow ended. Draw more arrows there.
6. Press **▶** (or `K`) to play the plan from the shown step to the end.
7. Name the plan in **Plan name** and press **Save**.

![The Tactics tab in top view: game, sides and tools on the left, three figures with Move arrows, a smoke Throw arc, an Area and the steps along the bottom](assets/img/en/tactics.webp)

## Starting a plan

| Control | What it does |
|---|---|
| **Game** | Picks the sides and the figures the palette offers: Counter-Strike 2 (T, CT; players and utility), Valorant (Attack, Defense; players and generic abilities), Battlefield, Squad, Arma (infantry, ground vehicles, aircraft, boats), DCS / War Thunder / IL-2 (jets, propeller aircraft, helicopters, air defence, ground, ships, weapons), and Other. A plan that already has figures keeps its sides when the game changes. |
| **Plan name** | The name the plan is saved under. |
| **Map**, **Load Valorant maps** | With Valorant chosen: **Load Valorant maps** gets the list of maps from [valorant-api.com](https://valorant-api.com); **Map** then puts the chosen map's minimap down as the level, framed from the top. The image is fetched when chosen and never shipped. Riot's notice is shown while it is on screen (see below). |
| **Side** | The side the next figure, arrow or area belongs to; it takes the side's colour. |

Without a level the board is the flat ground plane. Load a level under **Level** to plan on a real map: a CS2 map exported with the CS2 tool, a level from the library, or a map picture.

## Tools

Every tool has a key: a digit, and a letter the camera does not fly with. Each button shows its digit; its tooltip shows both.

| Tool | Keys | Click | Notes |
|---|---|---|---|
| **Select** | `1`, `V` | A figure, a waypoint, a route, an area or a note selects it. | Shift+click adds or removes; Shift+drag draws a box round what to add; `Ctrl+A` takes everything in the step. The selection gets a transform gizmo (see below), so several figures move, turn and scale together. `Delete` or `Backspace` removes the selection after asking. `M` moves the selected figure to the next click. |
| **Place** | `2`, `P` | Puts the chosen figure down. | A figure is chosen in the **Figures** palette (with **Search figures**). With nothing selected, `R` turns the next figure by 15° before it is placed (`Shift+R` the other way). |
| **Waypoints** | `3`, `L` | A figure, then each waypoint. | **Move**, **Attack** (wider head) or **Watch** (a thin line at eye height). A route begun on a figure is that figure's way in this step: played back, the figure walks it, and the next step starts where it ended. Begun off every figure, it is a free arrow. |
| **Throw** | `4`, `H` | The thrower, then where it lands. | A dashed arc from the one to the other, and the chosen utility (smoke, flash, molotov, ...) appears where it lands and stays from this step on. |
| **Area** | `5`, `O` | The middle, then the edge. | A disc in the side's colour. |
| **Note** | `6`, `N` | Where the note goes; asks for its text. | Shown as a pin, and its text over it. |
| **Erase** | `8`, `X` | A figure, route, area or note. | Removes it from this step on; on its first step, removes it. |
| **Measure** | `9`, `U` | Each point of the way to measure. | A white line through the points, with its length in metres and the time it takes running in the plan's game. Finished like a route; it stays until the next click or `Esc`. |

### Finishing a route

While a route (or a ruler) is being drawn, its last point shows how many waypoints it has and how to finish it, and the sidebar shows **Finish**, **Last point back** and **Drop**. Each of these finishes it:

- **Enter**;
- a **double click**: the first click puts the last waypoint down, the second finishes;
- a **right click** without dragging (a right drag still turns the camera);
- **Esc**: it keeps the route when it has at least one waypoint, and drops it when it has only its start;
- picking another tool, which keeps what was drawn.

**Backspace** takes the last point back. A finished route ends in a ring with a cross in its side's colour.

### Group routes

Select several figures (Shift+click or Shift+drag) and draw with **Waypoints**, starting on one of them or off every figure: each figure gets its own route through the clicked points, from where it stands. With **Keep the group's shape** (on by default) each route is the clicked one moved by where the figure stood in the group, so the group keeps its formation; off, every figure walks to the same points. While drawing, each figure's way shows faintly. Each new route replaces the figure's route in that step.

**Undo** and **Redo** (`Ctrl+Z`; `Ctrl+Y` or `Ctrl+Shift+Z`) step through every change; removing a selection of many things is one step. A line under the plan shows how many figures, routes and steps it has. **Top view** looks straight down (orthographic), **3D view** returns to perspective, **Frame** fits the plan, or the level when the plan is empty.

**Figure size** scales every figure on the board; 1× is true size, which from far above is a few pixels for a person.

## Moving, turning and scaling

Everything on the board can be moved like in a 3D editor: figures, utility, markers, single waypoints and whole arrows, areas and notes. What is selected gets a gizmo at its middle:

| Mode | Keys | Handles |
|---|---|---|
| **Move** | W (or G) | An arrow per axis (X red, Y green and up, Z blue) moves along it; a square moves across its plane; the centre moves over the level under the pointer. |
| **Rotate** | E (or R) | A ring per axis turns about it. A single figure's rings are its own yaw, pitch and roll; a group turns about the world's axes round its middle. |
| **Scale** | R (or S) | Spreads or gathers the selection from its middle along an axis or every way; an area's radius grows with it. |

**Keys** switches between W / E / R (Unity, Unreal) and G / R / S (Blender); the keys pick the mode only while something is selected, and fly the camera otherwise. So `R` means **Scale** with the W / E / R keys and **Rotate** with the G / R / S keys while something is selected, and turns the next figure to place when nothing is. All board keys are listed in the [keyboard reference](keyboard-reference.md#tactics-board). Hold **Ctrl** while dragging to snap a move to the **Grid** (metres) or a turn to the **Angle step**. **Snap to ground** (on by default) puts moved people, vehicles, markers, waypoints and areas on the level's surface; aircraft and helicopters keep their height, and a drag along the Y arrow never snaps. Dragging a handle never moves the camera. **Esc** cancels a drag, and every change is one step of Undo.

Waypoints show as dots on the shown step's arrows: click one to select it, drag it to move it, Delete to take it out. The **Selected** section shows the selection's place in metres, a figure's yaw, pitch and roll in degrees and an area's radius, each to type.

## Timing

A figure's route is timed: each segment takes its length over the level - sampled on the surface every couple of metres, so a hill or a staircase between two points counts - at the speed of its movement **mode** for that figure in that game, plus any **wait** at a waypoint. Infantry crawl, crouch, walk (silent), run or sprint; vehicles and boats crawl, go cautiously, normally or rush; aircraft and helicopters fly slow, at cruise, at combat speed or at maximum. A mode the game has not got (CS2 has no sprint) takes the nearest one it has. How a slope slows depends on the game: in CS2 and Valorant only the horizontal distance counts, as in the games; mil-sims slow infantry uphill (Tobler's hiking function) and vehicles by grade.

The speeds come from per-game tables with their sources (see [Movement speeds](tactics-speeds.md)): CS2 by the weapon held, from the game's weapon definitions; Valorant by weapon; Battlefield, Squad, Arma and the air games by vehicle type and class. **Moves as** picks a figure's profile (a weapon, a vehicle type); **Own (m/s)** overrides any mode for that figure. Modes are named as the board shows them: *Crawl*, *Crouch*, *Walk (silent)*, *Run*, *Sprint*; *Cautious*, *Normal*, *Rush*; *Slow*, *Cruise*, *Combat*, *Maximum*.

Each waypoint shows the time from the last one and the time since the plan's start ("+3.9 s · 0:12"). The selected figure's route lists every segment with its mode, length and time, the wait and the arrival. **Arrivals** under **Timing** puts every routed figure on one time line, first arrival on top. With **Play in real time** (on by default) a step lasts until its slowest route arrives and each figure moves at its own speed; **Seconds** is then the step's least length. **Level units per metre** says what the level is in: 39.37 for CS2 maps (game units), 1 for metre maps.

## Compare with match data

**Load match files…** reads CS2 match tables of the map (the CS2 tool's Parquet files, as many as wanted; only the columns needed, in the background); **Use loaded data** takes the data loaded in the viewer. Then:

- **Earliest arrival on the map** colours the map by the time since round start that a player first reached each spot - the button **Fastest** shows the quickest over all rounds, **Typical (median)** the middle round - green early to red late, for one side or both. It shows what is possible when.
- The selected route is compared with what players achieved from its start (or from the round's start) to its end, each end a disc of the set radius: "Fastest observed 14.2 s, p10 15.0 s, median 18.3 s over 41 runs; your plan 15.1 s".
- The speeds players really moved at - running, walking, crouching, from the tables' walking and duck columns - in m/s.

## Steps

The bar below the view holds the steps. A plan starts with one; **+** adds one, and each figure starts it where its route in the last step ended; **−** removes the one shown. **Seconds** is how long the shown step takes when played. **▶** (K) plays from the shown step to the end: figures with a route walk it, figures moved to a new place in the next step slide there, the rest stand. While a step is shown, each figure's place in the next step is drawn as a faint ghost, and the last step's arrows faintly under this one's.

## Saving

The **File** section holds **Save**, **Open** and **Clear**. **Save** writes the plan as `<name>.h3dplan.json` (plain JSON: sides, steps, figures with a place per step, arrows, areas, notes); **Open** reads one back. A file of another version, or one that is not a plan, is refused with the reason. **Clear** empties the plan; Undo brings it back.

## Figures

Every figure is built by the viewer itself: simple shapes to a type's published size, with the features that tell it from its neighbours - a tank's road wheels and turret, the guns, missiles and radars of an air-defence vehicle, an aircraft's wing plan, tail and engines, a helicopter's rotors and stub wings. Nothing is taken from a game. A design a game invented is shown as the generic figure of its class. See [Figures](figures.md#which-figure-a-unit-gets) for how data finds its figure.

## Riot's notice

Valorant maps are shown under Riot Games' "Legal Jibber Jabber" policy, which allows free community projects to use them and asks for this notice wherever they appear: *3DHeat was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.* The abilities on the board are generic shapes, not Riot's art.
