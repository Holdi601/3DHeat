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
| **Select** | A figure selects it. | With one selected: **Move** (M), then a click puts it there in this step; **R** / Shift+**R** turns it by 15 degrees; **Delete** removes it. |
| **Place** | Puts the chosen figure down. | A figure is chosen in the palette below; R turns the next one before it is placed. |
| **Arrow** | Each click adds a point; Enter, a double click or a right click ends it, Esc drops it. | **Move**, **Attack** (wider head) or **Watch** (a thin line at eye height). An arrow begun on a figure is that figure's route in this step: played back, the figure walks it, and the next step starts where it ended. |
| **Throw** | The thrower, then where it lands. | A dashed arc from the one to the other, and the chosen utility (smoke, flash, molotov, ...) appears where it lands and stays from this step on. |
| **Area** | The middle, then the edge. | A disc in the side's colour. |
| **Note** | Where the note goes; asks for its text. | Shown as a pin, and its text over it. |
| **Erase** | A figure, arrow, area or note. | Removes it from this step on; on its first step, removes it. |

**Undo** and **Redo** (Ctrl+Z, Ctrl+Y) step through every change. **Top view** looks straight down (orthographic), **3D view** returns to perspective, **Frame** fits the plan, or the level when the plan is empty.

**Figure size** scales every figure on the board; 1× is true size, which from far above is a few pixels for a person.

## Steps

The bar below the view holds the steps. A plan starts with one; **+** adds one, and each figure starts it where its route in the last step ended; **−** removes the one shown. **Seconds** is how long the shown step takes when played. **▶** (K) plays from the shown step to the end: figures with a route walk it, figures moved to a new place in the next step slide there, the rest stand. While a step is shown, each figure's place in the next step is drawn as a faint ghost, and the last step's arrows faintly under this one's.

## Saving

**Save** writes the plan as `<name>.h3dplan.json` (plain JSON: sides, steps, figures with a place per step, arrows, areas, notes); **Open** reads one back. A file of another version, or one that is not a plan, is refused with the reason. **Clear** empties the plan; Undo brings it back.

## Figures

Every figure is built by the viewer itself: simple shapes to a type's published size, with the features that tell it from its neighbours - a tank's road wheels and turret, the guns, missiles and radars of an air-defence vehicle, an aircraft's wing plan, tail and engines, a helicopter's rotors and stub wings. Nothing is taken from a game. A design a game invented is shown as the generic figure of its class. See [Figure replay](figure-replay.md) for how data finds its figure.

## Riot's notice

Valorant maps are shown under Riot Games' "Legal Jibber Jabber" policy, which allows free community projects to use them and asks for this notice wherever they appear: *3DHeat was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.* The abilities on the board are generic shapes, not Riot's art.
