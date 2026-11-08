---
title: Movement speeds
nav_order: 10
---

# Movement speeds

The [tactics board](tactics-board.md) times a plan from how fast each figure moves. The speeds come from one file per game in `src/tactics/speeds/`: a speed for each movement mode of each class (infantry, ground vehicles, boats, aircraft, helicopters), plus named profiles such as one per CS2 weapon or one per aircraft type. Every file lists its sources, and every value says whether it is **official** (the game's own data, or the published figures of a real aircraft) or **approximate** (community-measured or a typical value).

These are starting points. **Every figure can override its speeds on the board**, so a plan can use a measured speed, a loaded-down soldier or a damaged tank.

## Modes

| Class | Modes |
|---|---|
| Infantry | crawl (prone), crouch, walk (the slow, quiet walk), run (default movement), sprint |
| Ground vehicles, boats | crawl, cautious, normal (cross-country), rush (road top speed) |
| Aircraft, helicopters | slow (approach, loiter, hover-taxi), cruise, combat (corner speed or attack run), max |

A mode the game does not have is left empty: CS2 and Valorant have no sprint and no prone.

## Slopes

Each file also says how the game treats slopes. CS2, Valorant and Squad cap horizontal speed, so a slope does not slow a player. Arma slows infantry on slopes, so its file and the generic one use Tobler's hiking function. Battlefield and the vehicle sims use a plain grade penalty.

## Per game

**Counter-Strike 2** (units per second; one unit is taken as one inch). **Official.** Run speeds are the `m_flMaxSpeed` values in the game's weapon definitions: the knife and C4 250, grenades 245, pistols 240 (Desert Eagle 230, R8 180), SMGs 220 to 240, rifles 210 to 225, AWP 200, LMGs 195 and 150. The scoped AWP (100), AUG and SG 553 (150) and G3SG1 and SCAR-20 (120) have their own profiles. Walk is run × 0.52 and crouch is run × 0.34. Valve does not publish these two multipliers, but every weapon shows them in demo recordings. To check a plan against real movement, load a demo on the same map and compare players' speeds.

**Valorant** (m/s). The knife runs at 6.75 m/s. Each weapon multiplies that by its run-speed multiplier from the game data, which gives the speeds the in-game Arsenal shows: 5.73 for most sidearms and SMGs, 5.4 for rifles, 5.13 for heavies and the Operator, 5.06 for shotguns. These run speeds are exact. Walk and crouch speeds are **estimates** (0.55 and 0.4 × run) because Riot does not publish them. The scoped sniper profiles are also estimates.

**Battlefield** (km/h). **Approximate.** EA publishes no movement numbers. Infantry: about 1 m/s prone, 2 crouched, 4 running and 6.4 sprinting. Vehicles, jets, helicopters and boats get typical in-game speeds for their class.

**Squad** (km/h). **Approximate.** Running (3.3 m/s) and sprinting (5.9 m/s) come from a community write-up of the game mechanics. Crawl, crouch and slow walk are estimates, and so is every vehicle class and helicopter.

**Arma** (km/h). **Approximate.** Infantry paces are community timings: about 5 km/h walking, 9 km/h crouched tactical pace, 15 km/h jogging and about 21 km/h sprinting. Vehicle top speeds are the configured maximums of the vanilla Arma 3 vehicles in each class, from a third-party listing. The slower vehicle modes are estimates.

**DCS / War Thunder / IL-2** (km/h). Every aircraft and helicopter in the palette has its own profile. Cruise and max speeds are the **published figures** of the real aircraft, which the sims model closely. Max is at sea level for jets and at the rated altitude for propeller aircraft, and each profile's note says which. Slow and combat speeds are typical values. Ground vehicles use the published road speeds of the real vehicles, rounded (**approximate**). Ships use the published top speeds of their class.

**Other** (m/s). **Approximate** real-world defaults: crawl 0.5, crouch 1.5, walk 1.4, run 3.5, sprint 6.

## Sources

Counter-Strike 2
- [CS2 weapon definitions (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [CSDB weapon pages](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com weapons (run-speed multipliers)](https://valorant-api.com/v1/weapons)
- [VLR.gg: knife speed 6.75 m/s](https://vlr.gg/post/4240306)
- [Riot support: Walking, Running and Crouching](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [EA forums: Battlefield 6 movement speed](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Battlefield 6 movement guide](https://deltiasgaming.com/?p=309455)
- [Pre-release report of a 6.4 m/s sprint](https://redlib.cypherpunktools.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/?context=3)

Squad
- [r/joinsquad: Squad game mechanics post (2018)](https://reddit.rtrace.io/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post)
- [Squad](https://joinsquad.com/) (publishes no speeds)

Arma
- [Bohemia forums: walking speed](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Bohemia forums: movement speed tweaking](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Arma 3 feedback tracker: sprint speed](https://feedback.bistudio.com/T64047)
- [Arma 3 Field Manual: Infantry Controls](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Arma 3 vehicle stats by faction (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- The Wikipedia specifications of each aircraft and helicopter type, linked from each profile in `air.json`
- [V speeds](https://en.wikipedia.org/wiki/V_speeds), for the typical approach and combat speeds
- [War Thunder wiki](https://wiki.warthunder.com/), for ground vehicles
- [Arleigh Burke-class destroyer](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer), and the other ship classes' published speeds

Other
- [Preferred walking speed](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Tobler's hiking function](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
