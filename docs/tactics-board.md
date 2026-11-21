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
| **Note** | `6`, `N` | Where the note goes; asks for its text. | Shown as a pin, and its text over it, in the note's colour and size (see [Notes](#notes)). |
| **Draw** | `7`, `B` | Drag on the level; for a circle, the middle, then the edge. | **Pen**, **Highlighter** (wide and see-through) or **Circle**, in a **Colour** and a **Width** in metres (0: the game's usual), in its step or **In every step**. While Draw is in hand the left button draws instead of turning the camera; fly with the keys, or turn with the right button. |
| **Erase** | `8`, `X` | A figure, route, area, note or drawing. | Removes it from this step on; on its first step, removes it. |
| **Measure** | `9`, `U` | Each point of the way to measure. | A white line through the points, with its length in metres and the time it takes running in the plan's game. Finished like a route; it stays until the next click or `Esc`. |

### Finishing a route

While a route (or a ruler) is being drawn, its last point shows how many waypoints it has and how to finish it, and the sidebar shows **Finish**, **Last point back** and **Drop**. Each of these finishes it:

- **Enter**;
- a **double click**: the first click puts the last waypoint down, the second finishes;
- a **right click** without dragging (a right drag still turns the camera);
- **Esc**: it keeps the route when it has at least one waypoint, and drops it when it has only its start;
- picking another tool, which keeps what was drawn.

**Backspace** takes the last point back. A finished route ends in a ring with a cross in its side's colour.

### Throws and launches

A throw reaches only as far as its game's physics carry it. With **Throw** in hand, pick what is thrown (**Throws**) - the game's grenades, under-barrel grenades and rocket launchers - and, for a thrown one, the **Strength** and how the **Thrower** moves as it lets go: **Standing**, **Running**, **Jumping** or **Running jump**. The hint says how far that reaches on the flat. While the landing point is chosen, a ring round the thrower shows the reach and the dashed arc is the real flight; a landing past the ring comes in to its edge. The flight is worked out from the launch speed (for a thrown one times the strength, plus the share of the thrower's own running and jumping the game passes on), the game's gravity and the projectile's drag, to where it comes down at the landing point's height; a launcher's round ends where the game ends it. Bounces and rolling are not followed.

| Game | Projectiles | Where the numbers come from |
|---|---|---|
| Counter-Strike 2 | Every grenade (smoke, flash, HE, molotov, decoy): full, half (both buttons) and underhand throws | The game's weapon data: throw velocity 750 units/s and 245 units/s running with a grenade; grenade gravity 0.4 of 800 units/s² (Source); a jump of 302 units/s. The 0.9 share of the throw velocity, the strength scaling and the 1.25 share of the thrower's velocity follow the Source grenade code as it is commonly documented. About 36 m standing, further running and jumping. |
| Valorant | A typical thrown ability | An estimate: each agent's ability flies its own way and the numbers are not published. |
| Battlefield, Squad, Arma | Hand grenade; 40 mm grenade; RPG or rocket launcher | Hand grenades are estimates of about 30-40 m on the flat; 40 mm grenades and the RPG-7 take published real-world launch speeds (76 m/s; 115 m/s at launch, the boost not followed), capped at the range catalogue's reach. |
| Other | Hand grenade, 40 mm grenade | As above. |

The table is `src/tactics/throws.json`, each entry marked as the game's own data, a real-world figure or an estimate, with its source.

### Notes

A note is text placed in the world. With **Note** in hand, set the next note's **Colour**, **Size (px)** and when it **Shows**, then click where it goes and type its text:

- **In its step**: shown while its step is shown, as before.
- **Always**: shown in every step and all through playback - a label that stays, such as a site name or a callout.
- **For a while of playback**: shown from **From (s)** for **For (s)** seconds of the plan's time while it plays or while the time slider is in that window, and in its own step while editing. A new one starts at the moment shown.

A selected note can be changed in **Selected**: its text, colour, size, when it shows, and **From** the moment shown. Notes and drawings are on layers like everything else, can be selected, moved with the gizmo and erased.

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

### Top speed and wanted arrival times

No figure ever moves faster than its **top speed**: the fastest of its class's modes for it in the game's table - its **Own (m/s)** speeds where set, else its **Moves as** profile's, else the class's (the **Other** game's class values where a game has none). The **Selected** section shows it under the speeds.

- **Be there (s)** on a waypoint of the route table is when the figure is to be at it, in seconds from the step's start. The way from the last waypoint with a time (or the route's start) to it is spread to arrive then - slower than its modes, or faster up to the top speed. A time that would need more is not met: the figure arrives as early as its top speed allows, the row turns orange and says when that is.
- A figure moved to a new place in the next step without a route slides there no faster than its top speed: where that takes longer than the step's **Seconds**, the step lasts as long as it needs.
- With **Play in real time** off, a route is spread over its step's set seconds, but the step lasts at least as long as the route takes at top speed.

**Speed limits** under **Timing** lists every place the top speeds held the plan back - a wanted time not met, a step made longer - with the step, the figure and the seconds needed and given; a click on one shows its step and selects the figure.

## Keyframes

Below the view, beside **▶**, the **time slider** shows any moment of the plan: drag it to see every figure where it is then (the clock beside it says the moment and the plan's length), and **▶** plays on from there. Choosing a step, or starting to draw, goes back to the step's start.

With a figure selected, **Keyframes at ...** in the **Selected** section sets what it does at the moment shown:

| Channel | What it is |
|---|---|
| **Turret** | The turret's turn from the hull's forward, right positive (figures with a turret). |
| **Gun elevation** | The gun's elevation, up positive (figures with a gun that elevates). |
| **Looks (yaw)**, **Looks (pitch)** | Which way the figure looks, from its forward: drawn as a yellow fan from eye height. |
| **Sensor (yaw)**, **Sensor (pitch)** | Where its sensor (radar, camera, sight) points: drawn as a cyan fan. |

Type a value in degrees to key it at the moment shown; **×** takes the key there out. **Aim turret at…**, **Look at…** and **Point sensor at…** key both angles at once from the next click on the level (`Esc` stops). The times the figure has keys at are listed as buttons that jump there. Between two keys a value turns the short way round; before the first key and after the last it holds. Played back, turrets turn and guns rise on the figures themselves, and the fans follow.

## Tasks

What a unit does while it moves or stands - attack, defend, patrol a route for a while, sweep an area, overwatch a sector, hold until a go-code, fly a CAP - is a task: select units and press `I`. Tasks run alongside routes, keyframes and each other, show as symbols on the units and the map, and play back. See [Unit tasks](tactics-tasks.md).

## Compare with match data

**Load match files…** reads CS2 match tables of the map (the CS2 tool's Parquet files, as many as wanted; only the columns needed, in the background); **Use loaded data** takes the data loaded in the viewer. Then:

- **Earliest arrival on the map** colours the map by the time since round start that a player first reached each spot - the button **Fastest** shows the quickest over all rounds, **Typical (median)** the middle round - green early to red late, for one side or both. It shows what is possible when.
- The selected route is compared with what players achieved from its start (or from the round's start) to its end, each end a disc of the set radius: "Fastest observed 14.2 s, p10 15.0 s, median 18.3 s over 41 runs; your plan 15.1 s".
- The speeds players really moved at - running, walking, crouching, from the tables' walking and duck columns - in m/s.

## Steps

The bar below the view holds playback, the time slider (see [Keyframes](#keyframes)) and the steps. A plan starts with one; **+** adds one, and each figure starts it where its route in the last step ended; **−** removes the one shown. **Seconds** is how long the shown step takes when played. **▶** (K) plays from the shown step to the end: figures with a route walk it, figures moved to a new place in the next step slide there, the rest stand. While a step is shown, each figure's place in the next step is drawn as a faint ghost, and the last step's arrows faintly under this one's.

## Layers

The **Layers** section lists the board's layers, the top one first. Everything on the board - figures, routes and arrows, throws, areas, notes and drawings - is on a layer; a board starts with one, **Base**.

| Control | What it does |
|---|---|
| The round button, or a click on the name | Makes the layer the active one: whatever is placed or drawn next goes on it. Activating a hidden layer shows it. |
| Double click on the name, **Rename** | Renames the layer. |
| **Shown** | Off, nothing on the layer is drawn, played or picked: a plan left out of the view. |
| **Locked** | On, the layer is drawn and played but nothing on it can be selected, moved, erased or added to. A route can still start on one of its figures; the route goes on the active layer. |
| **New layer** | Adds a layer on top and makes it active. |
| **Copy as alternative** | Copies the active layer - its routes, throws, areas, notes, drawings and the figures on it - as a new layer and hides the original. Routes of figures on other layers stay those figures' routes, so the copy is a second plan for the same figures. |
| **↑** / **↓** | Moves the active layer up or down the stack (the base layer stays at the bottom). |
| **Remove layer** | Removes the active layer and everything on it, after asking; the routes of its figures on other layers go with them. Undo brings it back. |
| **Move the selection to ...** | Puts the selected things on the active layer. |
| **Draw only the active layer's routes** | Leaves the other layers' routes and arrows out of the view while they still play: see every figure move, and only the routes of the squad being worked on. |

Where two shown layers both give a figure a route in the same step, the route on the upper layer is the one it walks; the panel says how many figures that is in the shown step. To compare alternatives, keep them on separate layers and show one at a time: playback, timing and arrivals follow what is shown.

## Saving

The **File** section holds **Save**, **Open** and **Clear**. **Save** writes the whole board as `<name>.h3dplan.json`: plain JSON with a `version` (2), the sides, steps, layers, figures with a place per step and their keyframes, routes and arrows with their modes, pauses and arrival times, throws, areas, notes and drawings. **Your name** is written into the file with the time it was saved (shown when it is opened again), so boards from several people can be told apart. **Open** reads a board back; boards saved before layers existed (version 1) open with everything on the base layer. A file of a newer version, or one that is not a board, is refused with the reason. **Clear** empties the board; Undo brings it back.

The board is also kept in the browser a moment after each change and comes back when the viewer is opened again; the **File** section says when it was last kept. Where the browser does not allow it (a private window, blocked site data) or has no room for a large board, the board works the same and only the file keeps it.

## Mission files

**Import mission…** in the **File** section reads a game's mission file as the starting board, in place of the board (Undo brings it back). A board with something on it asks first, in the viewer's own dialog:

| Game | File | What comes in |
|---|---|---|
| DCS World | `.miz` | Each coalition (Blue, Red, Neutral) on its own layer; every plane, helicopter, vehicle, ship and static of every group as a figure where the mission puts it, facing its heading, named as in the mission (names kept in the mission's dictionary are looked up); each group's route as a route of every unit in it (the wingmen keep their places off the lead), with the leg speed as the unit's own cruise or normal speed and the arrival times the mission holds waypoints to (**Be there**); airfields where routes take off and land, FARPs, trigger zones (as areas) and each side's bullseye on a **Mission places** layer. Positions are DCS's own metres, as the DCS levels lie, so the mission falls on its theatre's level - the line under the button says which one to load. |
| Arma 3 | `mission.sqm` | The Eden editor's layout (and the older pre-Eden one): each side (BLUFOR, OPFOR, Independent, Civilian) on its own layer; every group's soldiers, vehicles, aircraft and boats where they stand and which way they face, the group's waypoints as its route; markers as notes and objectives, triggers as areas. A binarised `mission.sqm` is not text; the message says to save it again with **Binarize the scenario file** off. |

A unit type the figure catalogue knows gets its own figure; others get one judged from the type name (an Arma `..._MBT_...` is a tank), else the generic figure of their kind. Hide the other side's layer to plan with your own side only.

The readers share one shape (sides, groups with units and routes, places), so other games' mission files can follow: IL-2 Great Battles (`.mission`, text), Falcon BMS (campaign and tactical engagement files) and Arma Reforger scenarios are next. The importers live in `src/tactics/missions/`.

Every change to the board is also recorded as a list of operations - add, change or remove one thing by its id, or change the board's own settings - signed with **Your name**. Two people's changes to different things never overwrite each other, which is what a shared session will exchange.

## Figures

Every figure is built by the viewer itself: simple shapes to a type's published size, with the features that tell it from its neighbours - a tank's road wheels and turret, the guns, missiles and radars of an air-defence vehicle, an aircraft's wing plan, tail and engines, a helicopter's rotors and stub wings. Nothing is taken from a game. A design a game invented is shown as the generic figure of its class. The board's figures are drawn by the graphics card as instances, so thousands of them play smoothly; at most 250 figure names are written over the view at once. See [Figures](figures.md#which-figure-a-unit-gets) for how data finds its figure.

## Riot's notice

Valorant maps are shown under Riot Games' "Legal Jibber Jabber" policy, which allows free community projects to use them and asks for this notice wherever they appear: *3DHeat was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.* The abilities on the board are generic shapes, not Riot's art.
